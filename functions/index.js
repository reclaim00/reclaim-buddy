const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

function activeBuddyIn(appData) {
  var snapshot = appData && appData.data;
  var buddy = snapshot && snapshot.buddy;
  return !!(buddy && buddy.paired === true && buddy.contact);
}

async function findActivePairing(email) {
  // Also inspect partnership documents because encrypted account snapshots are
  // intentionally opaque to the server and cannot be used to infer pairing state.
  var [owned, joined] = await Promise.all([
    db.collection('pairingCodes').where('ownerEmail', '==', email).get(),
    db.collection('pairingCodes').where('consumedBy', '==', email).get()
  ]);
  var records = owned.docs.concat(joined.docs);
  for (var i = 0; i < records.length; i++) {
    var data = records[i].data();
    if (data.accepted === true && data.ended !== true) return records[i];
  }
  return null;
}

function activeMatchResult(code, pairing, email) {
  if (!pairing || pairing.ended === true || pairing.accepted !== true) return null;
  var isOwner = pairing.ownerEmail === email;
  var otherEmail = isOwner ? pairing.consumedBy : pairing.ownerEmail;
  if (!otherEmail) return null;
  return {
    matched: true,
    partner: {
      email: otherEmail,
      name: isOwner ? (pairing.requestName || 'Your partner') : (pairing.name || 'Your partner'),
      language: isOwner ? (pairing.requestLanguage || 'English') : (pairing.language || 'English')
    },
    partnershipCode: code
  };
}

// Users explicitly opt in by calling this function. The waiting pool is only
// accessible to the Admin SDK; there is no public account or email directory.
exports.findRandomPartner = functions.https.onCall(async function(data, context) {
  if (!context.auth || !context.auth.token.email) throw new functions.https.HttpsError('unauthenticated', 'Sign in to find a partner.');
  var email = context.auth.token.email;
  var name = String((data && data.name) || 'Re.Claim member').trim().slice(0, 60) || 'Re.Claim member';
  var language = String((data && data.language) || 'English').trim().slice(0, 40) || 'English';
  var ownQueueRef = db.collection('partnerQueue').doc(email);
  var ownAppRef = db.collection('appData').doc(email);
  var ownQueue = await ownQueueRef.get();
  if (ownQueue.exists && ownQueue.data().status === 'paired') {
    var pairedCode = ownQueue.data().partnershipCode;
    var pairedDoc = pairedCode ? await db.collection('pairingCodes').doc(pairedCode).get() : null;
    var existing = pairedDoc && pairedDoc.exists ? activeMatchResult(pairedCode, pairedDoc.data(), email) : null;
    if (existing) return existing;
    await ownQueueRef.delete();
  }

  var ownApp = await ownAppRef.get();
  if ((ownApp.exists && activeBuddyIn(ownApp.data())) || await findActivePairing(email)) {
    throw new functions.https.HttpsError('failed-precondition', 'End your current partner connection before finding another partner.');
  }

  var candidates = await db.collection('partnerQueue').where('status', '==', 'waiting').limit(250).get();
  var available = candidates.docs.filter(function(doc) { return doc.id !== email; });
  // Shuffle the bounded candidate set so matches are not simply first-come,
  // first-served and the Firestore query order is not exposed to clients.
  for (var i = available.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var swap = available[i]; available[i] = available[j]; available[j] = swap;
  }

  for (var ci = 0; ci < available.length; ci++) {
    var candidateRef = available[ci].ref;
    if (await findActivePairing(candidateRef.id)) {
      await db.runTransaction(async function(tx) {
        var stale = await tx.get(candidateRef);
        if (stale.exists && stale.data().status === 'waiting') tx.delete(candidateRef);
      });
      continue;
    }
    var code = db.collection('pairingCodes').doc().id;
    var pairingRef = db.collection('pairingCodes').doc(code);
    var outcome = await db.runTransaction(async function(tx) {
      var records = await Promise.all([tx.get(ownQueueRef), tx.get(candidateRef), tx.get(ownAppRef), tx.get(db.collection('appData').doc(candidateRef.id))]);
      var myQueue = records[0], theirQueue = records[1];
      if (activeBuddyIn(records[2].exists ? records[2].data() : null)) return { blocked: true };
      if (!theirQueue.exists || theirQueue.data().status !== 'waiting' || theirQueue.data().email !== candidateRef.id) return { retry: true };
      if (activeBuddyIn(records[3].exists ? records[3].data() : null)) {
        tx.delete(candidateRef);
        return { retry: true };
      }
      var mine = myQueue.exists ? myQueue.data() : {};
      var theirs = theirQueue.data();
      tx.set(pairingRef, {
        code: code,
        ownerEmail: email,
        name: name,
        language: language,
        consumedBy: candidateRef.id,
        requestName: theirs.name || 'Re.Claim member',
        requestLanguage: theirs.language || 'English',
        consumed: true,
        accepted: true,
        matchedRandomly: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
        ended: false
      });
      tx.set(ownQueueRef, Object.assign({}, mine, { email: email, name: name, language: language, status: 'paired', partnershipCode: code, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
      tx.set(candidateRef, Object.assign({}, theirs, { status: 'paired', partnershipCode: code, updatedAt: admin.firestore.FieldValue.serverTimestamp() }));
      return { paired: true, partner: theirs };
    });
    if (outcome.blocked) throw new functions.https.HttpsError('failed-precondition', 'End your current partner connection before finding another partner.');
    if (outcome.paired) {
      return { matched: true, partner: { email: candidateRef.id, name: outcome.partner.name || 'Your partner', language: outcome.partner.language || 'English' }, partnershipCode: code };
    }
  }

  // A concurrent request can create this record after our initial query.
  var latest = await ownQueueRef.get();
  if (latest.exists && latest.data().status === 'paired') {
    var latestCode = latest.data().partnershipCode;
    var latestDoc = latestCode ? await db.collection('pairingCodes').doc(latestCode).get() : null;
    var latestResult = latestDoc && latestDoc.exists ? activeMatchResult(latestCode, latestDoc.data(), email) : null;
    if (latestResult) return latestResult;
  }
  var queuedResult = await db.runTransaction(async function(tx) {
    var current = await tx.get(ownQueueRef);
    if (current.exists && current.data().status === 'paired') return current.data().partnershipCode || null;
    var queueData = { email: email, name: name, language: language, status: 'waiting', updatedAt: admin.firestore.FieldValue.serverTimestamp() };
    if (!current.exists) queueData.joinedAt = admin.firestore.FieldValue.serverTimestamp();
    tx.set(ownQueueRef, queueData, { merge: true });
    return null;
  });
  if (queuedResult) {
    var queuedPairing = await db.collection('pairingCodes').doc(queuedResult).get();
    var queuedMatch = queuedPairing.exists ? activeMatchResult(queuedResult, queuedPairing.data(), email) : null;
    if (queuedMatch) return queuedMatch;
  }
  return { matched: false, waiting: true };
});

exports.cancelRandomPartnerSearch = functions.https.onCall(async function(data, context) {
  if (!context.auth || !context.auth.token.email) throw new functions.https.HttpsError('unauthenticated', 'Sign in to manage your partner search.');
  var ref = db.collection('partnerQueue').doc(context.auth.token.email);
  var record = await ref.get();
  if (record.exists && record.data().status === 'waiting') await ref.delete();
  return { cancelled: true };
});

function timeToMinutes(t) {
  var parts = (t || '00:00').split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function localClock(now, timeZone) {
  try {
    var p = new Intl.DateTimeFormat('en-GB', {timeZone:timeZone || 'UTC',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now);
    var v = {}; p.forEach(function(x){if(x.type !== 'literal')v[x.type]=x.value});
    return {date:v.year+'-'+v.month+'-'+v.day,minute:parseInt(v.hour,10)*60+parseInt(v.minute,10)};
  } catch(e) {
    return {date:now.toISOString().slice(0,10),minute:now.getUTCHours()*60+now.getUTCMinutes()};
  }
}

function reminderOccursToday(reminder, today) {
  if (!reminder || !reminder.date || !today || reminder.date > today) return false;
  if (!reminder.repeat || reminder.repeat === 'none') return reminder.date === today;
  var a=reminder.date.split('-').map(Number), b=today.split('-').map(Number);
  var start=Date.UTC(a[0],a[1]-1,a[2]), current=Date.UTC(b[0],b[1]-1,b[2]);
  var days=Math.floor((current-start)/86400000);
  if (reminder.repeat === 'daily') return true;
  if (reminder.repeat === 'weekly') return days % 7 === 0;
  if (reminder.repeat === 'monthly') return a[2] === b[2];
  return reminder.date === today;
}

exports.checkNotifications = functions.pubsub.schedule('every 5 minutes').onRun(async function(context) {
  var now = new Date();
  var hmNum, todayStr;

  var subsSnap = await db.collection('pushSubscriptions').get();
  if (subsSnap.empty) return null;

  var promises = [];
  subsSnap.forEach(function(doc) {
    var email = doc.id;
    var subData = doc.data();
    if (!subData.token) return;

    promises.push(
      db.collection('appData').doc(email).get().then(function(userDoc) {
        if (!userDoc.exists) return;
        var userData = userDoc.data().data;
        if (!userData || !userData.notifications) return;
        var n = userData.notifications;
        var clock = localClock(now,userData.timeZone);
        todayStr = clock.date;
        hmNum = clock.minute;

        if (userData._notifiedDate !== todayStr) {
          userData._notifiedMorning = false;
          userData._notifiedEvening = false;
          userData._notifiedCraving = false;
          userData._notifiedJournal = false;
          userData._notifiedBreathe = false;
          userData._notifiedCheckinReminder = false;
          userData._notifiedBuddyCheckin = false;
          userData._notifiedDate = todayStr;
        }

        var checks = [
          {key: 'morning', time: n.morningTime, msg: 'Log your mood and set your intention for today.'},
          {key: 'evening', time: n.eveningTime, msg: 'Journal what happened and how you feel today.'},
          {key: 'craving', time: n.cravingTime, msg: 'Pause and check in with yourself. Log any cravings or urges.'},
          {key: 'journal', time: n.journalTime, msg: 'Take 5 minutes to write about what\'s on your mind.'},
          {key: 'breathe', time: n.breatheTime, msg: 'Take a 2-minute breathing exercise. Inhale calm, exhale stress.'},
          {key: 'checkinReminder', time: n.checkinReminderTime || '18:00', msg: 'Take a moment for a gentle check-in. How are you doing today?'},
          {key: 'buddyCheckin', time: n.checkinReminderTime || '18:00', msg: 'If it feels right, check in with your partner.'}
        ];

        var sobrietyStart = userData.sobriety && userData.sobriety.startDate;
        var streak = sobrietyStart ? Math.max(0, Math.floor((now.getTime() - new Date(sobrietyStart).getTime()) / 86400000)) : 0;
        var toNotify = null;

        for (var i=0;i<checks.length;i++) {
          var c = checks[i];
          if (!n[c.key]) continue;
          if (c.key === 'checkinReminder') {
            var moods=userData.moods || [];
            if (moods.some(function(m){return m.date === new Date(todayStr+'T12:00:00').toDateString()})) continue;
          }
          if (c.key === 'buddyCheckin') {
            var buddy=userData.buddy, last=userData.accountability && userData.accountability.lastCheckin;
            var freq=(userData.accountability && userData.accountability.frequency) || 1;
            if (!buddy || !buddy.paired || (last && now.getTime()-last < freq*86400000)) continue;
          }
          var notifiedProp = '_notified' + c.key.charAt(0).toUpperCase() + c.key.slice(1);
          if (userData[notifiedProp]) continue;
          var targetMin = timeToMinutes(c.time);
          if (hmNum >= targetMin && hmNum < targetMin + 10) {
            var title = c.key === 'morning' ? 'Re.Claim Morning' :
                        c.key === 'evening' ? 'Re.Claim Evening' :
                        c.key === 'craving' ? 'Craving Check-In' :
                        c.key === 'journal' ? 'Journal Prompt' :
                        c.key === 'checkinReminder' ? 'Daily Check-In' :
                        c.key === 'buddyCheckin' ? 'Partner Check-In' : 'Time to Breathe';
            var body = (streak > 0 && c.key === 'morning') ? 'Day ' + streak + '! ' + c.msg :
                       (streak > 0 && c.key === 'evening') ? 'Day ' + streak + ' made it! ' + c.msg : c.msg;
            toNotify = {title: title, body: body, tag: 'reclaim-' + c.key};
            userData[notifiedProp] = true;
            break;
          }
        }

        // Check due reminders
        if (!toNotify && n.reminderNotif !== false && userData.reminders) {
          for (var ri=0;ri<userData.reminders.length;ri++) {
            var rr = userData.reminders[ri];
            if (rr._notifiedDate === todayStr || !reminderOccursToday(rr,todayStr)) continue;
            if (hmNum >= timeToMinutes(rr.time || '23:59')) {
              toNotify = {title: 'Reminder: ' + (rr.title || 'Reminder'), body: rr.notes || 'You have a reminder due.', tag: 'reclaim-reminder-' + ri};
              rr._notifiedDate = todayStr;
              break;
            }
          }
        }

        if (toNotify) {
          userData._notifiedDate = todayStr;
          db.collection('appData').doc(email).set({data: userData, lastUpdated: admin.firestore.FieldValue.serverTimestamp()}, {merge: true}).catch(function(){});
          var msg = {
            token: subData.token,
            data: {
              title: toNotify.title,
              body: toNotify.body,
              icon: 'icon-192.png',
              tag: toNotify.tag,
              url: 'app.html'
            }
          };
          if (subData.platform === 'mobile') {
            msg.notification = { title: toNotify.title, body: toNotify.body };
            msg.android = { channelId: 'reclaim' };
          }
          return admin.messaging().send(msg).catch(function(){});
        }
      }).catch(function(){})
    );
  });

  await Promise.all(promises);
  return null;
});

// Send a push to the recipient whenever a partner message is created.
exports.onMessageCreate = functions.firestore.document('messages/{messageId}').onCreate(async function(snap) {
  var d = snap.data();
  if (!d || !d.to || !d.text) return null;
  var sender = d.from || '';
  var recipient = d.to;
  if (!recipient || recipient === sender) return null;

  var subDoc;
  try { subDoc = await db.collection('pushSubscriptions').doc(recipient).get(); } catch (e) { return null; }
  if (!subDoc.exists || !subDoc.data().token) return null;

  var name = d.fromName || sender.split('@')[0] || 'Your partner';
  var body = d.text.length > 120 ? d.text.slice(0, 120) + '…' : d.text;

  var msg = {
    token: subDoc.data().token,
    data: {
      title: 'New message from ' + name,
      body: body,
      icon: 'icon-192.png',
      tag: 'reclaim-msg-' + snap.id,
      url: 'app.html?action=buddy'
    }
  };
  if (subDoc.data().platform === 'mobile') {
    msg.notification = { title: 'New message from ' + name, body: body };
    msg.android = { channelId: 'reclaim' };
  }
  return admin.messaging().send(msg).catch(function() {});
});

// Notify the other participant when an accepted partnership ends.
exports.onPartnershipEnd = functions.firestore.document('pairingCodes/{code}').onUpdate(async function(change) {
  var before=change.before.data() || {}, after=change.after.data() || {};
  if (before.ended === true || after.ended !== true || !after.accepted) return null;
  var recipient=after.endedBy === after.ownerEmail ? after.consumedBy : after.ownerEmail;
  if (!recipient) return null;
  var sub;
  try { sub=await db.collection('pushSubscriptions').doc(recipient).get(); } catch(e) { return null; }
  if (!sub.exists || !sub.data().token) return null;
  var msg={token:sub.data().token,data:{title:'Partner connection ended',body:'Your partner ended this connection. New messages and progress sharing are stopped.',icon:'icon-192.png',tag:'reclaim-partner-ended-'+change.after.id,url:'app.html?action=buddy'}};
  if (sub.data().platform === 'mobile') {
    msg.notification={title:msg.data.title,body:msg.data.body};
    msg.android={channelId:'reclaim'};
  }
  return admin.messaging().send(msg).catch(function(){return null});
});

// Removing an account also removes its invite document. Notify the remaining
// partner when that document represented an active accepted connection.
exports.onPartnershipDelete = functions.firestore.document('pairingCodes/{code}').onDelete(async function(doc) {
  var link=doc.data() || {};
  if (!link.accepted || link.ended === true) return null;
  // Deletion here is the invite owner's account cleanup; the accepted invitee remains.
  var recipient=link.consumedBy;
  if (!recipient) return null;
  var sub;
  try { sub=await db.collection('pushSubscriptions').doc(recipient).get(); } catch(e) { return null; }
  if (!sub.exists || !sub.data().token) return null;
  var msg={token:sub.data().token,data:{title:'Partner connection ended',body:'Your partner account was removed. New messages and progress sharing are stopped.',icon:'icon-192.png',tag:'reclaim-partner-ended-'+doc.id,url:'app.html?action=buddy'}};
  if (sub.data().platform === 'mobile') { msg.notification={title:msg.data.title,body:msg.data.body}; msg.android={channelId:'reclaim'}; }
  return admin.messaging().send(msg).catch(function(){return null});
});

exports.onUserCreate = functions.auth.user().onCreate(async function(user) {
  var email = user.email;
  if (!email) return null;
  await db.collection('appData').doc(email).set({
    welcomeSent: true,
    welcomeDate: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
  return null;
});
