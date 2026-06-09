const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

function timeToMinutes(t) {
  var parts = (t || '00:00').split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

exports.checkNotifications = functions.pubsub.schedule('every 1 minutes').onRun(async function(context) {
  var now = new Date();
  var hmNum = now.getHours() * 60 + now.getMinutes();
  var todayStr = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0');
  var notifiedDate = '';

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

        if (userData._notifiedDate !== todayStr) {
          userData._notifiedMorning = false;
          userData._notifiedEvening = false;
          userData._notifiedCraving = false;
          userData._notifiedJournal = false;
          userData._notifiedBreathe = false;
          userData._notifiedDate = todayStr;
        }

        var checks = [
          {key: 'morning', time: n.morningTime, msg: 'Log your mood and set your intention for today.'},
          {key: 'evening', time: n.eveningTime, msg: 'Journal what happened and how you feel today.'},
          {key: 'craving', time: n.cravingTime, msg: 'Pause and check in with yourself. Log any cravings or urges.'},
          {key: 'journal', time: n.journalTime, msg: 'Take 5 minutes to write about what\'s on your mind.'},
          {key: 'breathe', time: n.breatheTime, msg: 'Take a 2-minute breathing exercise. Inhale calm, exhale stress.'}
        ];

        var streak = userData.streak || 0;
        var toNotify = null;

        for (var i=0;i<checks.length;i++) {
          var c = checks[i];
          if (!n[c.key]) continue;
          var notifiedProp = '_notified' + c.key.charAt(0).toUpperCase() + c.key.slice(1);
          if (userData[notifiedProp]) continue;
          var targetMin = timeToMinutes(c.time);
          if (hmNum >= targetMin && hmNum < targetMin + 3) {
            var title = c.key === 'morning' ? 'Re.Claim Morning' :
                        c.key === 'evening' ? 'Re.Claim Evening' :
                        c.key === 'craving' ? 'Craving Check-In' :
                        c.key === 'journal' ? 'Journal Prompt' : 'Time to Breathe';
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
            if (rr.notified) continue;
            var rDtStr = rr.date + (rr.time ? 'T'+rr.time : 'T23:59');
            if (new Date(rDtStr) <= now) {
              toNotify = {title: 'Reminder: ' + (rr.title || 'Reminder'), body: rr.notes || 'You have a reminder due.', tag: 'reclaim-reminder-' + ri};
              rr.notified = true;
              break;
            }
          }
        }

        // Re-arm repeating reminders at day boundary
        if (!toNotify && hmNum >= 1 && hmNum < 4 && userData.reminders) {
          for (var ri2=0;ri2<userData.reminders.length;ri2++) {
            var rr2 = userData.reminders[ri2];
            if (rr2.repeat && rr2.repeat !== 'none') rr2.notified = false;
          }
        }

        if (toNotify) {
          userData._notifiedDate = todayStr;
          db.collection('appData').doc(email).set({data: userData, lastUpdated: admin.firestore.FieldValue.serverTimestamp()}, {merge: true}).catch(function(){});
          return admin.messaging().send({
            token: subData.token,
            webpush: {notification: {title: toNotify.title, body: toNotify.body, icon: 'icon-192.png', tag: toNotify.tag}}
          }).catch(function(){});
        }
      }).catch(function(){})
    );
  });

  await Promise.all(promises);
  return null;
});
