// ====== GLOBAL ERROR HANDLING ======
window.onerror = function(msg, url, line, col, err) {
  console.error('Uncaught error:', msg, 'at', url, line + ':' + col);
  try { showToast('Something went wrong. The app will try to recover.','error'); } catch(e) {}
};
window.addEventListener('unhandledrejection', function(e) {
  console.warn('Unhandled rejection:', e.reason);
});
// ====== NOTIFICATIONS ======
function notifRowHTML(key, emoji, label, desc) {
  var n = D.notifications || {morning:false,evening:false,morningTime:'08:00',eveningTime:'20:00',craving:false,journal:false,breathe:false,cravingTime:'14:00',journalTime:'12:00',breatheTime:'10:00',checkinReminder:false,checkinReminderTime:'18:00',buddyCheckin:false,streakMilestone:false};
  var enabled = n[key] || false;
  var timeKey = key + 'Time';
  var timeVal = n[timeKey] || (key==='morning'?'08:00':key==='evening'?'20:00':key==='craving'?'14:00':key==='journal'?'12:00':key==='breathe'?'10:00':key==='checkinReminder'?'18:00':'12:00');
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;margin-top:4px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">'+emoji+'</span><div><div style="font-size:13px;font-weight:600">'+label+'</div><div style="font-size:11px;color:var(--muted)">'+desc+'</div></div></div><div style="display:flex;align-items:center;gap:8px"><input type="time" value="'+timeVal+'" onchange="D.notifications.'+timeKey+'=this.value;saveData()" style="width:auto;padding:4px 8px;font-size:12px;margin:0;border-radius:8px;border:1px solid var(--border)"><label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer"><input type="checkbox" '+(enabled?'checked':'')+' onchange="D.notifications.'+key+'=this.checked;if(this.checked)requestNotif();saveData()" style="opacity:0;width:0;height:0"><span style="position:absolute;inset:0;background:'+(enabled?'var(--primary)':'var(--border)')+';border-radius:12px;transition:.2s"><span style="position:absolute;top:3px;left:'+(enabled?'23':'3')+'px;width:18px;height:18px;border-radius:9px;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15)"></span></span></label></div></div>';
}
function reminderNotifRowHTML() {
  var n = D.notifications || {};
  var enabled = n.reminderNotif !== false;
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;margin-top:4px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">&#9200;</span><div><div style="font-size:13px;font-weight:600">Reminders</div><div style="font-size:11px;color:var(--muted)">Get notified when a reminder is due</div></div></div><div style="display:flex;align-items:center;gap:8px"><label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer"><input type="checkbox" '+(enabled?'checked':'')+' onchange="D.notifications.reminderNotif=this.checked;if(this.checked)requestNotif();saveData()" style="opacity:0;width:0;height:0"><span style="position:absolute;inset:0;background:'+(enabled?'var(--primary)':'var(--border)')+';border-radius:12px;transition:.2s"><span style="position:absolute;top:3px;left:'+(enabled?'23':'3')+'px;width:18px;height:18px;border-radius:9px;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15)"></span></span></label></div></div>';
}
function notifToggleHTML(key, emoji, label, desc) {
  var n = D.notifications || {morning:false,evening:false,morningTime:'08:00',eveningTime:'20:00',craving:false,journal:false,breathe:false,cravingTime:'14:00',journalTime:'12:00',breatheTime:'10:00',checkinReminder:false,checkinReminderTime:'18:00',buddyCheckin:false,streakMilestone:false};
  var enabled = n[key] || false;
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:4px 0;margin-top:4px"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">'+emoji+'</span><div><div style="font-size:13px;font-weight:600">'+label+'</div><div style="font-size:11px;color:var(--muted)">'+desc+'</div></div></div><label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer"><input type="checkbox" '+(enabled?'checked':'')+' onchange="D.notifications.'+key+'=this.checked;if(this.checked)requestNotif();saveData()" style="opacity:0;width:0;height:0"><span style="position:absolute;inset:0;background:'+(enabled?'var(--primary)':'var(--border)')+';border-radius:12px;transition:.2s"><span style="position:absolute;top:3px;left:'+(enabled?'23':'3')+'px;width:18px;height:18px;border-radius:9px;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15)"></span></span></label></div>';
}
function pushToggleRowHTML() {
  var enabled = D.notifications && D.notifications.push;
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0;margin-bottom:4px;border-bottom:1px solid var(--border)"><div style="display:flex;align-items:center;gap:8px"><span style="font-size:18px">&#128276;</span><div><div style="font-size:13px;font-weight:600">Push Notifications</div><div style="font-size:11px;color:var(--muted)">Receive alerts on this device</div></div></div><label style="position:relative;display:inline-block;width:44px;height:24px;cursor:pointer"><input type="checkbox" '+(enabled?'checked':'')+' onchange="D.notifications.push=this.checked;if(this.checked)requestNotif();else unsubscribePush();saveData()" style="opacity:0;width:0;height:0"><span style="position:absolute;inset:0;background:'+(enabled?'var(--primary)':'var(--border)')+';border-radius:12px;transition:.2s"><span style="position:absolute;top:3px;left:'+(enabled?'23':'3')+'px;width:18px;height:18px;border-radius:9px;background:#fff;transition:.2s;box-shadow:0 1px 3px rgba(0,0,0,.15)"></span></span></label></div>';
}
  function requestNotif() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "granted") { subscribePush(); return; }
  if (Notification.permission === "default") {
    Notification.requestPermission().then(function(perm) {
      if (perm === "granted") subscribePush();
    });
  }
}
function showToast(text, type) {
  type = type || 'info';
  var c = document.getElementById('toast-container');
  if (!c) return;
  while (c.children.length >= 3) { c.removeChild(c.firstChild); }
  var icons = {info:'\u269C',success:'\u2714',warning:'\u26A0',danger:'\u2716'};
  var t = document.createElement('div');
  t.className = 'toast toast-' + type;
  t.innerHTML = '<span style="opacity:.6;margin-right:6px">' + (icons[type]||'\u269C') + '</span>' + text;
  c.appendChild(t);
  setTimeout(function() {
    t.className += ' toast-out';
    setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 260);
  }, 3200);
}
function swNotify(title, body, icon, tag) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  if (navigator.serviceWorker) {
    navigator.serviceWorker.ready.then(function(reg) {
      reg.showNotification(title, {body:body, icon:icon || 'icon-192.png', tag:tag || 'reclaim-notification'});
    }).catch(function() {
      try { new Notification(title, {body:body, icon:icon, tag:tag}); } catch(e) {}
    });
  } else {
    try { new Notification(title, {body:body, icon:icon, tag:tag}); } catch(e) {}
  }
}
function checkNotifications() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  var n = D.notifications || {morning:false,evening:false,morningTime:'08:00',eveningTime:'20:00',craving:false,journal:false,breathe:false,cravingTime:'14:00',journalTime:'12:00',breatheTime:'10:00',checkinReminder:false,checkinReminderTime:'18:00',buddyCheckin:false,streakMilestone:false};
  var now = new Date();
  var hm = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var hmNum = now.getHours() * 60 + now.getMinutes();
  var s = D.streak || 0;
  var todayStr = now.getFullYear()+'-'+String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');
  if (D._notifiedDate !== todayStr) {
    D._notifiedMorning = false; D._notifiedEvening = false; D._notifiedCraving = false; D._notifiedJournal = false; D._notifiedBreathe = false; D._notifiedCheckinReminder = false;
    D._notifiedDate = todayStr;
  }
  function notifDue(key, timeStr) {
    if (!n[key]) return false;
    if (D['_notified'+key.charAt(0).toUpperCase()+key.slice(1)]) return false;
    var parts = timeStr.split(':');
    var targetMin = parseInt(parts[0])*60 + parseInt(parts[1]);
    return hmNum >= targetMin && hmNum < targetMin + 3;
  }
  if (notifDue('morning', n.morningTime)) {
    swNotify('Re.Claim Morning', s > 0 ? 'Day ' + s + '! Log your mood and set your intention.' : 'Log your mood and set your intention for today.', 'icon-192.png', 'reclaim-morning');
    D._notifiedMorning = true; saveData();
  }
  if (notifDue('evening', n.eveningTime)) {
    swNotify('Re.Claim Evening', s > 0 ? 'Day ' + s + ' made it! Journal what happened today.' : 'Journal what happened and how you feel today.', 'icon-192.png', 'reclaim-evening');
    D._notifiedEvening = true; saveData();
  }
  if (notifDue('craving', n.cravingTime)) {
    swNotify('Craving Check-In', 'Pause and Check in with yourself. Log any cravings or urges you\'re feeling.', 'icon-192.png', 'reclaim-craving');
    D._notifiedCraving = true; saveData();
  }
  if (notifDue('journal', n.journalTime)) {
    swNotify('Journal Prompt', 'Take 5 minutes to write about what\'s on your mind. You\'ve got this.', 'icon-192.png', 'reclaim-journal');
    D._notifiedJournal = true; saveData();
  }
  if (notifDue('breathe', n.breatheTime)) {
    swNotify('Time to Breathe', 'Take a 2-minute breathing exercise. Inhale calm, exhale stress.', 'icon-192.png', 'reclaim-breathe');
    D._notifiedBreathe = true; saveData();
  }
  // Check-in reminder
  if (notifDue('checkinReminder', n.checkinReminderTime || '18:00')) {
    var checkedInToday = D.checkins && D.checkins.some(function(c){return c.date===todayStr});
    if (!checkedInToday) {
      swNotify('Check-In Reminder', s > 0 ? 'Day ' + s + ' is waiting! You haven\'t checked in today. Keep your streak alive!' : 'You haven\'t checked in today. How was your day?', 'icon-192.png', 'reclaim-checkin');
      D._notifiedCheckinReminder = true; saveData();
    }
  }
  // Buddy check-in reminder
  if (n.buddyCheckin && D.buddy && D.buddy.name && D._notifiedBuddyCheckin !== todayStr) {
    var acc = D.accountability || {};
    var buddyNextDue = acc.lastCheckin ? acc.lastCheckin + (acc.frequency || 1) * 86400000 : now - 1;
    if (now >= buddyNextDue) {
      swNotify('Comrade check-in', 'Time to Check in with ' + D.buddy.name + '! Reach out and stay connected.', 'icon-192.png', 'reclaim-buddy');
      D._notifiedBuddyCheckin = todayStr; saveData();
    }
  }
  // Streak milestone celebration
  if (n.streakMilestone && s > 0) {
    var msList = [7,14,21,30,60,90,180,365];
    if (!D._notifiedMilestones) D._notifiedMilestones = [];
    for (var msi=0;msi<msList.length;msi++) {
      if (s === msList[msi] && D._notifiedMilestones.indexOf(msList[msi]) === -1) {
        var msgs = ['7 days! One week of strength.','14 days! Two weeks of commitment.','21 days! Three weeks  a habit forming.','30 days! One month  incredible.','60 days! Two months of resilience.','90 days! Three months  you\'re transforming.','180 days! Half a year of recovery.','365 days! ONE YEAR  a rebirth.'];
        swNotify('Streak Milestone! ??', msgs[msi] + ' You\'re on day ' + s + '.', 'icon-192.png', 'reclaim-milestone-'+msList[msi]);
        D._notifiedMilestones.push(msList[msi]); saveData();
      }
    }
  }
  // Check due reminders
  if (n.reminderNotif !== false && D.reminders) {
    for (var ri=0;ri<D.reminders.length;ri++) {
      var rr = D.reminders[ri];
      if (rr.notified) continue;
      var rDtStr = rr.date + (rr.time ? 'T'+rr.time : 'T23:59');
      if (new Date(rDtStr) <= now) {
        swNotify('Reminder: '+(rr.title||'Reminder'), rr.notes || 'You have a reminder due.', 'icon-192.png', 'reclaim-reminder-'+ri);
        rr.notified = true;
        saveData();
      }
    }
  }
  // Re-arm repeating reminders at day boundary
  if (hmNum >= 1 && hmNum < 4 && D.reminders) {
    D.reminders.forEach(function(rr){if(rr.repeat&&rr.repeat!=='none')rr.notified=false});
  }
}
setInterval(checkNotifications, 30000);
checkNotifications();

function showTeamBattle(data) {
  var existing = document.querySelector('.overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.6)';
  overlay.style.alignItems = 'flex-start';
  overlay.style.paddingTop = '30px';

  var mood = data && data.mood ? data.mood : 3;
  var win = data && data.win ? data.win : '';

  var teamMembers = [
    {id:'ta-arthur',color:'#ffd700',label:'Arthur',svg:
      '<svg class="arthur-svg" viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="11" y2="39" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="11" y1="39" x2="8" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M6 49 L11 49 L12 52 L5 52 Z" fill="#6d28d9"/><line x1="15" y1="30" x2="20" y2="38" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="38" x2="23" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M19 49 L24 49 L25 52 L18 52 Z" fill="#6d28d9"/><path d="M10.5 12 Q9 20 8 28 L8 44 Q8 48 9 49 L9 51 L21 51 L21 49 Q22 48 22 44 L22 28 Q21 20 19.5 12 Z" fill="#6d28d9" class="tb-body"/><line x1="15" y1="12" x2="15" y2="48" stroke="#ffd700" stroke-width="0.8"/><rect x="9" y="26" width="12" height="2.5" rx="1" fill="#ffd700"/><circle cx="15" cy="27.25" r="1.5" fill="#e11d48"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L19 14" stroke="#e8b88a" stroke-width="3" stroke-linecap="round" fill="none"/><g transform="translate(19,14)"><use href="#star4" transform="scale(1.5)" fill="#e8b88a"/></g><g style="transform-origin:19px 14px"><line x1="19" y1="14" x2="21" y2="10" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><g transform="translate(22,10)"><use href="#star4" transform="scale(1.8)" fill="#ffd700"/></g></g></g><ellipse cx="15" cy="8" rx="5.5" ry="5.5" fill="#e8b88a"/><path d="M9.5 5 Q9.5 2 12 1.5 Q15 1 18 1.5 Q20.5 2 20.5 5 Q20.5 3.5 17 3 Q15 2.8 13 3 Q9.5 3.5 9.5 5" fill="#8B4513"/><path d="M11.5 10 Q11 12.5 12 15 Q13.5 17 15 17 Q16.5 17 18 15 Q19 12.5 18.5 10 Z" fill="#8B4513"/><path d="M12 11 Q12.5 13 15 13.5 Q17.5 13 18 11" fill="#6B3410" opacity=".5"/><path d="M10.5 3 L11 0.5 L12.5 2 L15 0 L17.5 2 L19 0.5 L19.5 3 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.4"/><rect x="10.5" y="3" width="9" height="2" rx="0.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.3"/><g transform="translate(13,2)"><use href="#star4" transform="scale(0.6)" fill="#e11d48"/></g><circle cx="15" cy="1.2" r="0.7" fill="#3b82f6"/><g transform="translate(17,2)"><use href="#star4" transform="scale(0.6)" fill="#22c55e"/></g><circle cx="12.5" cy="6.5" r=".8" fill="#222"/><circle cx="17.5" cy="6.5" r=".8" fill="#222"/></svg>'
    },
    {id:'ta-oswald',color:'#4338ca',label:'Oswald',svg:
      '<svg class="oswald-svg" viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="10" y2="39" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#1e1b4b"/><line x1="15" y1="30" x2="21" y2="38" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#1e1b4b"/><path d="M10.5 12 Q10 15 10 28 L10 45 Q10 48 9 49 L9 51 L21 51 L21 49 Q20 48 20 45 L20 28 Q20 15 19.5 12 Z" fill="#4338ca" class="tb-body"/><rect x="10.5" y="26" width="9" height="2.5" rx="1" fill="#1e1b4b"/><rect x="14" y="26.3" width="2" height="1.9" rx=".3" fill="#fbbf24"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L20 21" stroke="#4338ca" stroke-width="4.5" stroke-linecap="round" fill="none"/><g style="transform-origin:20px 21px"><ellipse cx="20.5" cy="21" rx="1.8" ry="1.5" fill="#f0d5b0"/><line x1="21" y1="22" x2="27" y2="10" stroke="#4a3728" stroke-width="2" stroke-linecap="round" class="tb-weapon"/><g transform="translate(27,9)"><use href="#star4" transform="scale(2.5)" fill="#a5b4fc"/></g><g transform="translate(27,9)"><use href="#star4" transform="scale(1)" fill="#e0e7ff"/></g><path d="M26 6.5 L27 4 L28 6.5 Z" fill="#fbbf24"/></g></g><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><ellipse cx="15" cy="3.5" rx="7.5" ry="2" fill="#4338ca"/><path d="M9 3.5 L15 -2.5 L21 3.5 Z" fill="#4338ca"/><rect x="11" y="2.8" width="8" height="1.5" rx=".5" fill="#fbbf24"/><text x="15" y="1" font-size="2.5" fill="#fbbf24" text-anchor="middle">?</text><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9 Q15 10.5 17 9" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/><path d="M12.5 9 L15 14 L17.5 9 Z" fill="#e0e0e0"/></svg>'
    },
    {id:'ta-gertrude',color:'#be185d',label:'Gertrude',svg:
      '<svg class="erin-svg" viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><path d="M11 12 Q10 15 10.5 27 L19.5 27 Q20 15 19 12 Z" fill="#94a3b8" class="tb-body"/><path d="M11.5 13 Q11 15 11.5 25 L18.5 25 Q19 15 18.5 13 Z" fill="#be185d"/><path d="M10.5 25 L19.5 25 L19 33 L11 33 Z" fill="#9d174d"/><rect x="10.5" y="26.5" width="9" height="2" rx=".5" fill="#78350f"/><rect x="14" y="26.8" width="2" height="1.4" rx=".3" fill="#fbbf24"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L9 19" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" fill="none"/><g style="transform-origin:9px 19px"><path d="M9 19 L7 13" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" fill="none"/><g transform="translate(6,12)"><use href="#star4" transform="scale(1.5)" fill="#f0d5b0"/></g><path d="M1 7 Q-1 12 1 17 L6 17 Q7 12 6 7 Z" fill="#be185d" stroke="#fbbf24" stroke-width=".5"/></g></g><g class="tb-rarm-g" style="transform-origin:15px 17px"><path d="M15 17 L21 19" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" fill="none"/><g style="transform-origin:21px 19px"><path d="M21 19 L23 13" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" fill="none"/><g transform="translate(24,12)"><use href="#star4" transform="scale(1.5)" fill="#f0d5b0"/></g><line x1="24" y1="12" x2="28" y2="-2" stroke="#cbd5e1" stroke-width="1.8" stroke-linecap="round" class="tb-weapon"/></g></g><line x1="15" y1="30" x2="10" y2="39" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#8B4513"/><line x1="15" y1="30" x2="21" y2="38" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#8B4513"/><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><path d="M9.5 5 Q9.5 1 15 1 Q20.5 1 20.5 5 Q20.5 3 17.5 2.2 Q15 1.8 12.5 2.2 Q9.5 3 9.5 5" fill="#be185d"/><path d="M10 3.5 Q12.5 1.5 15 3.5 Q17.5 1.5 20 3.5" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/><circle cx="15" cy="2.5" r=".8" fill="#fbbf24"/><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9.5 Q15 11 17 9.5" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/></svg>'
    }
  ];

  var monsterEmojis = ['&#128128;','&#9762;&#65039;','&#128123;','&#9760;&#65039;','&#128169;'];

  overlay.innerHTML =
    '<div class="overlay-content" style="background:linear-gradient(135deg,#0f0f1a 0%,#1a0a2e 100%);border:2px solid rgba(255,255,255,.1);padding:10px;overflow:hidden;text-align:center;max-width:520px">' +
    '<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px;text-shadow:0 1px 4px rgba(0,0,0,.5)">&#9889; TEAM RECLAIM VS THE DARKNESS</div>' +
    '<div style="font-size:10px;color:rgba(255,255,255,.4);margin-bottom:6px">Each check-in powers the fight</div>' +
    '<div class="tb-ring" style="position:relative;height:140px;background:radial-gradient(ellipse at center,rgba(30,20,60,.8) 0%,rgba(10,5,20,.9) 100%);border-radius:14px;overflow:hidden;margin:0 auto 6px">' +
      // Team on left
      '<div id="tb-team" style="position:absolute;left:6%;bottom:10px;display:flex;gap:4px;align-items:flex-end;z-index:3">';
  for (var ti=0;ti<teamMembers.length;ti++) {
    var tm = teamMembers[ti];
    overlay.innerHTML += '<div id="'+tm.id+'" style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 0 6px '+tm.color.replace('#','')+'88)">' +
      tm.svg +
      '</div>';
  }
  overlay.innerHTML +=
      '</div>' +
      // Enemy area
      '<div id="tb-enemies" style="position:absolute;right:5%;top:20px;z-index:2">' +
        '<div class="tb-monster" id="tb-monster-0" style="font-size:38px;position:absolute;top:10px;right:20px;opacity:0">'+monsterEmojis[0]+'</div>' +
        '<div class="tb-monster" id="tb-monster-1" style="font-size:32px;position:absolute;top:40px;right:60px;opacity:0">'+monsterEmojis[1]+'</div>' +
        '<div class="tb-monster" id="tb-monster-2" style="font-size:36px;position:absolute;top:0;right:80px;opacity:0">'+monsterEmojis[2]+'</div>' +
      '</div>' +
      // Flash overlay
      '<div id="tb-flash" style="position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:5"></div>' +
      // Gun blast
      '<div id="tb-blast" style="position:absolute;top:52px;left:125px;font-size:24px;opacity:0;z-index:4;pointer-events:none">&#9889;</div>' +
      // Status text
      '<div id="tb-status" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:13px;font-weight:700;color:#fff;text-shadow:0 0 20px rgba(255,215,0,.5);opacity:0;z-index:6;pointer-events:none;text-align:center"></div>' +
    '</div>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin-top:2px">' +
    '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="font-size:11px;color:#fff;border-color:rgba(255,255,255,.3)">Close</button>' +
    '</div>' +
    '</div>';

  document.body.appendChild(overlay);

  var timers = [];
  function ct() { timers.forEach(function(t){clearTimeout(t)}); timers = []; }

  // Get elements
  var A = document.getElementById('ta-arthur');
  var P = document.getElementById('ta-oswald');
  var E = document.getElementById('ta-gertrude');
  var m0 = document.getElementById('tb-monster-0');
  var m1 = document.getElementById('tb-monster-1');
  var m2 = document.getElementById('tb-monster-2');
  var flash = document.getElementById('tb-flash');
  var blast = document.getElementById('tb-blast');
  var status = document.getElementById('tb-status');

  // Phase 1 (500ms): Monsters appear
  timers.push(setTimeout(function(){
    if (m0) { m0.style.animation = 'monsterApproach 2.5s ease forwards'; m0.style.opacity = '1'; }
    if (m1) { m1.style.animation = 'monsterApproach 2.8s ease forwards 0.3s'; m1.style.opacity = '1'; }
    if (m2) { m2.style.animation = 'monsterApproach 3s ease forwards 0.6s'; m2.style.opacity = '1'; }
    if (status) { status.textContent = '&#9760;&#65039; The darkness approaches...'; status.style.opacity = '1'; setTimeout(function(){ if(status) status.style.opacity = '0'; }, 1800); }
  }, 500));

  // Phase 2 (2500ms): Arthur steps forward and punches
  timers.push(setTimeout(function(){
    if (A) { A.style.animation = 'battleArthur .7s ease'; A.classList.add('fight'); setTimeout(function(){if(A)A.classList.remove('fight');},600); }
    if (m0) { m0.style.animation = 'monsterHit .6s ease forwards'; }
    if (flash) { flash.style.animation = 'battleFlash .4s ease'; }
    if (status) { status.textContent = '&#128170; ARTHUR PUNCHES!'; status.style.opacity = '1'; setTimeout(function(){ if(status) status.style.opacity = '0'; }, 1200); }
  }, 2500));

  // Phase 3 (3800ms): Gertrude attacks
  timers.push(setTimeout(function(){
    if (E) { E.style.animation = 'battleErin .5s ease'; E.classList.add('fight'); setTimeout(function(){if(E)E.classList.remove('fight');},400); }
    if (blast) { blast.style.animation = 'gunBlast .4s ease forwards'; blast.style.opacity = '1'; setTimeout(function(){ if(blast) { blast.style.animation = 'none'; blast.style.opacity = '0'; } }, 400); }
    if (m1) { m1.style.animation = 'monsterHit .5s ease forwards'; }
    if (flash) { flash.style.animation = 'battleFlash .3s ease'; }
    if (status) { status.textContent = '&#9876; GERTRUDE STRIKES!'; status.style.opacity = '1';  setTimeout(function(){ if(status) status.style.opacity = '0'; }, 1200); }
  }, 3800));

  // Phase 4 (5000ms): Oswald smashes with guitar
  timers.push(setTimeout(function(){
    if (P) { P.style.animation = 'battleOswald .6s ease'; P.classList.add('fight'); setTimeout(function(){if(P)P.classList.remove('fight');},500); }
    if (m2) { m2.style.animation = 'monsterHit .5s ease forwards'; }
    if (flash) { flash.style.animation = 'battleFlash .4s ease'; }
    if (status) { status.textContent = '&#127928; OSWALD CRUSHES!'; status.style.opacity = '1'; setTimeout(function(){ if(status) status.style.opacity = '0'; }, 1200); }
  }, 5000));

  // Phase 5 (6500ms): Victory
  timers.push(setTimeout(function(){
    if (status) {
      var winText = win ? '&#127775; "' + win.substring(0,50) + (win.length > 50 ? '...' : '') + '"' : '';
      status.innerHTML = '&#x265B; VICTORY! Darkness defeated. ' + winText;
      status.style.opacity = '1';
      status.style.fontSize = '14px';
    }
    if (A) { A.style.animation = 'battleVictory .6s ease 3'; A.classList.add('victory'); }
    if (P) { P.style.animation = 'battleVictory .6s ease 3'; P.classList.add('victory'); }
    if (E) { E.style.animation = 'battleVictory .6s ease 3'; E.classList.add('victory'); }
  }, 6500));

  // Cleanup after 10 seconds
  timers.push(setTimeout(function(){
    if (status) { status.style.opacity = '0'; }
  }, 10000));

  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) { ct(); overlay.remove(); }
  });
}

function partyConfetti() {
  var overlay = document.querySelector('.overlay-content');
  if (!overlay) return;
  var canvas = document.createElement('div');
  canvas.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:10;overflow:hidden';
  overlay.style.position = 'relative';
  overlay.appendChild(canvas);
  var colors = ['#ff6b35','#f7931e','#34d399','#60a5fa','#a78bfa','#f472b6','#fbbf24','#ffd700'];
  for (var i=0;i<50;i++) {
    (function(){
      var c = document.createElement('div');
      c.style.cssText = 'position:absolute;width:'+(5+Math.random()*6)+'px;height:'+(5+Math.random()*6)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';left:'+(Math.random()*100)+'%;top:-10px;opacity:'+(.7+Math.random()*.3);
      canvas.appendChild(c);
      var x = parseFloat(c.style.left);
      var rot = Math.random()*720;
      var dur = 1200+Math.random()*1800;
      var start = Date.now();
      function anim() {
        var p = Math.min(1,(Date.now()-start)/dur);
        c.style.top = (p*120-10)+'px';
        c.style.left = (x + Math.sin(p*8)*12)+'px';
        c.style.transform = 'rotate('+(rot*p)+'deg)';
        c.style.opacity = Math.max(0,1-p*1.2);
        if (p<1) requestAnimationFrame(anim); else c.remove();
      }
      requestAnimationFrame(anim);
    })();
  }
}

function showMilestoneParty(days) {
  if (D.lastMilestoneShown === days) return;
  D.lastMilestoneShown = days;
  saveData();
  setTimeout(kingdomFlourish, 300);
  var existing = document.querySelector('.overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.65)';
  var teamMembers = [
    {id:'mp-arthur',color:'#ffd700',svg:'<svg viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="11" y2="39" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="11" y1="39" x2="8" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M6 49 L11 49 L12 52 L5 52 Z" fill="#6d28d9"/><line x1="15" y1="30" x2="20" y2="38" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="38" x2="23" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M19 49 L24 49 L25 52 L18 52 Z" fill="#6d28d9"/><path d="M10.5 12 Q9 20 8 28 L8 44 Q8 48 9 49 L9 51 L21 51 L21 49 Q22 48 22 44 L22 28 Q21 20 19.5 12 Z" fill="#6d28d9" class="tb-body"/><line x1="15" y1="12" x2="15" y2="48" stroke="#ffd700" stroke-width="0.8"/><rect x="9" y="26" width="12" height="2.5" rx="1" fill="#ffd700"/><circle cx="15" cy="27.25" r="1.5" fill="#e11d48"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L19 14" stroke="#e8b88a" stroke-width="3" stroke-linecap="round" fill="none"/><g transform="translate(19,14)"><use href="#star4" transform="scale(1.5)" fill="#e8b88a"/></g><g style="transform-origin:19px 14px"><line x1="19" y1="14" x2="21" y2="10" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><g transform="translate(22,10)"><use href="#star4" transform="scale(1.8)" fill="#ffd700"/></g></g></g><ellipse cx="15" cy="8" rx="5.5" ry="5.5" fill="#e8b88a"/><path d="M9.5 5 Q9.5 2 12 1.5 Q15 1 18 1.5 Q20.5 2 20.5 5 Q20.5 3.5 17 3 Q15 2.8 13 3 Q9.5 3.5 9.5 5" fill="#8B4513"/><path d="M11.5 10 Q11 12.5 12 15 Q13.5 17 15 17 Q16.5 17 18 15 Q19 12.5 18.5 10 Z" fill="#8B4513"/><path d="M12 11 Q12.5 13 15 13.5 Q17.5 13 18 11" fill="#6B3410" opacity=".5"/><path d="M10.5 3 L11 0.5 L12.5 2 L15 0 L17.5 2 L19 0.5 L19.5 3 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.4"/><rect x="10.5" y="3" width="9" height="2" rx="0.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.3"/><g transform="translate(13,2)"><use href="#star4" transform="scale(0.6)" fill="#e11d48"/></g><circle cx="15" cy="1.2" r="0.7" fill="#3b82f6"/><g transform="translate(17,2)"><use href="#star4" transform="scale(0.6)" fill="#22c55e"/></g><circle cx="12.5" cy="6.5" r=".8" fill="#222"/><circle cx="17.5" cy="6.5" r=".8" fill="#222"/></svg>'},
    {id:'mp-oswald',color:'#4338ca',svg:'<svg viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="10" y2="39" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#1e1b4b"/><line x1="15" y1="30" x2="21" y2="38" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#1e1b4b"/><path d="M10.5 12 Q10 15 10 28 L10 45 Q10 48 9 49 L9 51 L21 51 L21 49 Q20 48 20 45 L20 28 Q20 15 19.5 12 Z" fill="#4338ca" class="tb-body"/><rect x="10.5" y="26" width="9" height="2.5" rx="1" fill="#1e1b4b"/><rect x="14" y="26.3" width="2" height="1.9" rx=".3" fill="#fbbf24"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L20 21" stroke="#4338ca" stroke-width="4.5" stroke-linecap="round" fill="none"/><g style="transform-origin:20px 21px"><ellipse cx="20.5" cy="21" rx="1.8" ry="1.5" fill="#f0d5b0"/><line x1="21.5" y1="21.5" x2="28" y2="12" stroke="#8B4513" stroke-width="2.5" stroke-linecap="round" class="tb-weapon"/><ellipse cx="28" cy="11" rx="2.5" ry="2" fill="#6366f1"/><ellipse cx="27.5" cy="10.5" rx="1" ry=".8" fill="#a5b4fc"/></g></g><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><ellipse cx="15" cy="3.5" rx="7.5" ry="2" fill="#4338ca"/><path d="M9 3.5 L15 -2.5 L21 3.5 Z" fill="#4338ca"/><rect x="11" y="2.8" width="8" height="1.5" rx=".5" fill="#fbbf24"/><text x="15" y="1" font-size="2.5" fill="#fbbf24" text-anchor="middle">?</text><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9 Q15 10.5 17 9" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/><path d="M12.5 9 L15 14 L17.5 9 Z" fill="#e0e0e0"/></svg>'},
    {id:'mp-gertrude',color:'#be185d',svg:'<svg viewBox="0 0 30 54"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><path d="M11 12 Q10 15 10.5 27 L19.5 27 Q20 15 19 12 Z" fill="#94a3b8" class="tb-body"/><path d="M11.5 13 Q11 15 11.5 25 L18.5 25 Q19 15 18.5 13 Z" fill="#be185d"/><path d="M10.5 25 L19.5 25 L19 33 L11 33 Z" fill="#9d174d"/><rect x="10.5" y="26.5" width="9" height="2" rx=".5" fill="#78350f"/><rect x="14" y="26.8" width="2" height="1.4" rx=".3" fill="#fbbf24"/><g class="tb-arm-g" style="transform-origin:15px 17px"><path d="M15 17 L9 19" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" fill="none"/><g style="transform-origin:9px 19px"><path d="M9 19 L7 13" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" fill="none"/><g transform="translate(6,12)"><use href="#star4" transform="scale(1.5)" fill="#f0d5b0"/></g><path d="M1 7 Q-1 12 1 17 L6 17 Q7 12 6 7 Z" fill="#be185d" stroke="#fbbf24" stroke-width=".5"/></g></g><line x1="15" y1="30" x2="10" y2="39" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#8B4513"/><line x1="15" y1="30" x2="21" y2="38" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#8B4513"/><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><path d="M9.5 5 Q9.5 1 15 1 Q20.5 1 20.5 5 Q20.5 3 17.5 2.2 Q15 1.8 12.5 2.2 Q9.5 3 9.5 5" fill="#be185d"/><path d="M10 3.5 Q12.5 1.5 15 3.5 Q17.5 1.5 20 3.5" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/><circle cx="15" cy="2.5" r=".8" fill="#fbbf24"/><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9.5 Q15 11 17 9.5" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/></svg>'}
  ];
  var label = days + ' Day' + (days !== 1 ? 's' : '') + ' Sober';
  var subtitle = days >= 365 ? 'ONE YEAR! Incredible!' : days >= 90 ? 'Quarter of a year - massive!' : days >= 30 ? 'One month strong!' : days >= 7 ? 'One week down!' : 'Amazing start!';
  var emojis = ['⭐','✨','🎉','🎊','🌟','🌈','🎈','✨','⭐','🎊'];
  overlay.innerHTML =
    '<div class="overlay-content" style="background:linear-gradient(135deg,#0f0f1a 0%,#1a0a2e 100%);border:2px solid rgba(255,215,0,.3);padding:14px;overflow:hidden;text-align:center;max-width:460px">' +
    '<div style="font-size:13px;font-weight:700;color:#ffd700;margin-bottom:2px;text-shadow:0 0 20px rgba(255,215,0,.4)">?? ' + label + '! ??</div>' +
    '<div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:6px">' + subtitle + '</div>' +
    '<div class="mp-stage" style="position:relative;height:140px;background:radial-gradient(ellipse at center,rgba(30,20,60,.8) 0%,rgba(10,5,20,.9) 100%);border-radius:14px;overflow:hidden;margin:0 auto 6px">' +
      // Party emoji decorations
      '<div id="mp-decor" style="position:absolute;inset:0;z-index:1;pointer-events:none">';
  for (var ei=0;ei<12;ei++) {
    var em = emojis[ei % emojis.length];
    var xPos = 4 + Math.random() * 92;
    var delay = Math.random() * 3;
    overlay.innerHTML += '<div style="position:absolute;top:-20px;left:' + xPos + '%;font-size:' + (14 + Math.floor(Math.random() * 14)) + 'px;opacity:0;animation:partyFloat 3s ease ' + delay + 's infinite">' + em + '</div>';
  }
  overlay.innerHTML +=
      '</div>' +
      // Characters
      '<div id="mp-team" style="position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:10px;align-items:flex-end;z-index:3">';
  for (var ti=0;ti<teamMembers.length;ti++) {
    var tm = teamMembers[ti];
    var bounceDelay = (ti * 0.15).toFixed(2);
    overlay.innerHTML += '<div id="'+tm.id+'" style="display:flex;flex-direction:column;align-items:center;filter:drop-shadow(0 0 8px '+tm.color.replace('#','')+'88);animation:partyBounce .5s ease ' + bounceDelay + 's infinite">' +
      tm.svg +
      '</div>';
  }
  overlay.innerHTML +=
      '</div>' +
      // Pulsing glow
      '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:180px;height:40px;background:radial-gradient(ellipse,rgba(255,215,0,.15) 0%,transparent 70%);z-index:1;pointer-events:none;animation:partyPulse 2s ease infinite"></div>' +
    '</div>' +
    '<div style="display:flex;flex-direction:column;gap:4px;align-items:center;margin-top:2px">' +
    '<div id="mp-quote" style="font-size:11px;color:rgba(255,255,255,.6);font-style:italic;max-width:360px;line-height:1.4">You are doing something incredibly hard, and you are doing it beautifully.</div>' +
    '<div style="display:flex;gap:6px;margin-top:2px">' +
    '<button class="btn btn-primary btn-sm" onclick="partyConfetti();this.style.display=\'none\'" style="font-size:11px">&#x269C; Confetti</button>' +
    '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="font-size:11px;color:#fff;border-color:rgba(255,255,255,.3)">Close</button>' +
    '</div></div></div>';
  document.body.appendChild(overlay);
  // Play celebrations
  setTimeout(function(){
    var A = document.getElementById('mp-arthur');
    var P = document.getElementById('mp-oswald');
    var E = document.getElementById('mp-gertrude');
    if (A) { A.style.animation = 'partyArthur .6s ease 3'; A.classList.add('celebrate'); setTimeout(function(){if(A)A.classList.remove('celebrate');},1800); }
    if (P) { P.style.animation = 'partyOswald .6s ease 3'; P.classList.add('celebrate'); setTimeout(function(){if(P)P.classList.remove('celebrate');},1800); }
    if (E) { E.style.animation = 'partyErin .6s ease 3'; E.classList.add('celebrate'); setTimeout(function(){if(E)E.classList.remove('celebrate');},1800); }
  }, 300);
  setTimeout(function(){
    if (A) { A.style.animation = 'partyArthur .5s ease infinite'; }
    if (P) { P.style.animation = 'partyOswald .55s ease infinite'; }
    if (E) { E.style.animation = 'partyErin .5s ease infinite'; }
  }, 2400);
}

// ====== SERVICE WORKER - FORCE UNREGISTER ======
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    regs.forEach(function(reg) { reg.unregister(); });
  });
}

// ====== CLIENT-SIDE ENCRYPTION (AES-256-GCM) ======
var ENC_KEY = null;
var ENC_CACHE = {};
function isEncryptionEnabled() { return D.encryption && D.encryption.enabled && D.encryption.salt && D.encryption.keyCheck; }
function deriveEncryptionKey(passphrase, salt) {
  var enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']).then(function(key) {
    return crypto.subtle.deriveKey({name:'PBKDF2', salt:salt, iterations:600000, hash:'SHA-256'}, key, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt']);
  });
}
function encryptText(plaintext, key) {
  var iv = crypto.getRandomValues(new Uint8Array(12));
  return crypto.subtle.encrypt({name:'AES-GCM', iv:iv}, key, new TextEncoder().encode(plaintext)).then(function(ciphertext) {
    var ct = new Uint8Array(ciphertext);
    var ivStr = '', ctStr = '';
    for (var i=0;i<iv.length;i++) ivStr += String.fromCharCode(iv[i]);
    for (var i=0;i<ct.length;i++) ctStr += String.fromCharCode(ct[i]);
    return {enc:true, iv:btoa(ivStr), data:btoa(ctStr)};
  });
}
function decryptText(encrypted, key) {
  if (!encrypted || !encrypted.enc) return Promise.resolve(encrypted);
  var iv = new Uint8Array(atob(encrypted.iv).split('').map(function(c){return c.charCodeAt(0)}));
  var ct = new Uint8Array(atob(encrypted.data).split('').map(function(c){return c.charCodeAt(0)}));
  return crypto.subtle.decrypt({name:'AES-GCM', iv:iv}, key, ct).then(function(plain) {
    return new TextDecoder().decode(plain);
  });
}
function encryptAllEntries(key) {
  return Promise.all(D.journal.map(function(entry, i) {
    if (entry.text && typeof entry.text === 'string') {
      return encryptText(entry.text, key).then(function(enc) { D.journal[i].text = enc; });
    }
  }));
}
function decryptAllEntries() {
  ENC_CACHE = {};
  if (!ENC_KEY || !isEncryptionEnabled()) return Promise.resolve();
  return Promise.all(D.journal.map(function(entry, i) {
    if (entry.text && typeof entry.text === 'object' && entry.text.enc) {
      return decryptText(entry.text, ENC_KEY).then(function(text) { ENC_CACHE[entry.text.data] = text; });
    } else if (entry.text && typeof entry.text === 'string') {
      ENC_CACHE[i+'s'] = entry.text;
    }
  }));
}
function getEntryText(entry) {
  if (!entry || !entry.text) return '';
  if (typeof entry.text === 'string') return entry.text;
  if (entry.text && entry.text.enc && ENC_CACHE[entry.text.data]) return ENC_CACHE[entry.text.data];
  if (entry.text && entry.text.enc) return '[Encrypted]';
  return entry.text;
}
function setupEncryption(passphrase) {
  if (!passphrase || passphrase.length < 4) { alert('Passphrase must be at least 4 characters.'); return Promise.reject(); }
  var salt = crypto.getRandomValues(new Uint8Array(16));
  return deriveEncryptionKey(passphrase, salt).then(function(key) {
    return encryptText('ENCRYPTION_KEY_CHECK_v1', key).then(function(enc) {
      D.encryption = { enabled: true, salt: btoa(String.fromCharCode.apply(null, salt)), keyCheck: enc };
      ENC_KEY = key;
      return encryptAllEntries(key);
    });
  }).then(function() { saveData(); return decryptAllEntries(); });
}
function verifyEncryptionPassphrase(passphrase) {
  if (!isEncryptionEnabled()) return Promise.reject('Encryption not enabled');
  var salt = new Uint8Array(atob(D.encryption.salt).split('').map(function(c){return c.charCodeAt(0)}));
  return deriveEncryptionKey(passphrase, salt).then(function(key) {
    return decryptText(D.encryption.keyCheck, key).then(function(text) {
      if (text === 'ENCRYPTION_KEY_CHECK_v1') { ENC_KEY = key; return decryptAllEntries(); }
      throw new Error('Wrong passphrase');
    });
  });
}
function unlockEncryption(passphrase) {
  return verifyEncryptionPassphrase(passphrase);
}
function changeEncryptionPassphrase(oldPass, newPass) {
  if (!isEncryptionEnabled() || !ENC_KEY) return Promise.reject('Not unlocked');
  return setupEncryption(newPass);
}
function disableEncryption() {
  if (!isEncryptionEnabled()) return Promise.resolve();
  if (!ENC_KEY) { alert('Unlock encryption first.'); return Promise.reject(); }
  return Promise.all(D.journal.map(function(entry, i) {
    if (entry.text && typeof entry.text === 'object' && entry.text.enc) {
      return decryptText(entry.text, ENC_KEY).then(function(text) { D.journal[i].text = text; });
    }
  })).then(function() {
    D.encryption = { enabled: false, salt: null, keyCheck: null };
    ENC_KEY = null; ENC_CACHE = {};
    saveData();
  });
}

var ENC_UNLOCK_CALLBACK = null;
function promptEncryptionPassphrase(callback) {
  ENC_UNLOCK_CALLBACK = callback || null;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center"><h3 style="font-size:18px;font-weight:700;margin-bottom:12px">&#128274; '+t('Unlock Encryption')+'</h3><p style="font-size:13px;color:var(--muted);margin-bottom:16px">'+t('Enter your encryption passphrase to access journal entries.')+'</p><input type="password" id="enc-unlock-input" placeholder="'+t('Encryption passphrase')+'" style="font-size:16px;text-align:center;margin-bottom:12px;letter-spacing:2px"><div style="color:var(--danger);font-size:12px;margin-bottom:8px;display:none" id="enc-unlock-error">'+t('Wrong passphrase. Try again.')+'</div><button class="btn btn-primary" id="enc-unlock-btn" onclick="doUnlockEncryption(this)">'+t('Unseal')+'</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove();ENC_UNLOCK_CALLBACK=null" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){var inp=document.getElementById('enc-unlock-input');if(inp)inp.focus()},100);
}
function doUnlockEncryption(btn) {
  var p = document.getElementById('enc-unlock-input');
  var e = document.getElementById('enc-unlock-error');
  if (!p || !p.value.trim()) { alert('Enter your passphrase.'); return; }
  p.disabled = true; btn.disabled = true;
  unlockEncryption(p.value.trim()).then(function() {
    p.disabled = false; btn.disabled = false;
    var cb = ENC_UNLOCK_CALLBACK; ENC_UNLOCK_CALLBACK = null;
    btn.closest('.overlay').remove();
    render();
    if (typeof cb === 'function') cb();
  }).catch(function() {
    p.disabled = false; btn.disabled = false;
    e.style.display = 'block'; p.value = ''; p.focus();
  });
}

// ====== RENDER & NAV ======
var MORE_SUB_PAGES = ['journal','calendar','library','music','reports','buddy','coping','assessment','profile','safety','reminders','meetings','timecapsule','screener','programs','chivalrycode','royalpardon','warchest','shop','kingsledger','achievements','alliances'];
var REFLECT_SUB_PAGES = [];
var CARE_SUB_PAGES = ['relapseplan','relapserescue','relapsegraveyard'];

function meetingsHTML() {
  var h = '';
  h += '<h2 class="page-title">'+t('Meetings')+'</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Online and local meetings to support your recovery.</p>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:14px">';
  h += '<div style="font-weight:700;font-size:14px;margin-bottom:8px">Meeting Directories</div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  h += '<a href="https://aa-intergroup.org/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">AA Online</a>';
  h += '<a href="https://virtual-na.org/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">NA Online</a>';
  h += '<a href="https://meetings.smartrecovery.org/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">SMART Recovery</a>';
  h += '<a href="https://www.ca-online.org/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">CA Online</a>';
  h += '<a href="https://www.intherooms.com/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">In The Rooms</a>';
  h += '<a href="https://recoverydharma.online/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">Dharma</a>';
  h += '</div>';
  h += '<a href="https://maps.apple.com/?q=AA+meetings+near+me" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="margin-top:10px;text-decoration:none;display:block">Find Meetings Near Me</a>';
  h += '</div>';
  h += '<div class="card" style="border-left:3px solid var(--rose);padding:14px;text-align:center">';
  h += '<div style="font-size:24px;margin-bottom:4px">&#128663;</div>';
  h += '<div style="font-weight:700;font-size:14px;margin-bottom:4px">Need immediate help?</div>';
  h += '<p style="font-size:12px;color:var(--muted);margin-bottom:8px">988 - Suicide and Crisis Lifeline. Call or text 24/7.</p>';
  h += '<button class="btn btn-danger btn-sm" onclick="showSOS()" style="width:100%">Crisis Helplines</button>';
  h += '</div>';
  h += '<div class="card" style="border-left:3px solid var(--accent);padding:14px;background:var(--primary-light)">';
  h += '<div style="font-weight:700;font-size:14px;margin-bottom:6px">&#128104;&#8205;&#127979; Licensed Therapist Near Me</div>';
  h += '<p style="font-size:12px;color:var(--muted);margin-bottom:8px">Find a licensed therapist who specializes in addiction and mental health.</p>';
  h += '<a href="https://maps.apple.com/?q=licensed+therapist+addiction" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="text-decoration:none;display:block;text-align:center">&#128205; Find Licensed Therapists Near Me</a>';
  h += '</div>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:14px">';
  h += '<div style="font-weight:700;font-size:14px;margin-bottom:8px">Mental Health Resources</div>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
  h += '<a href="https://www.samhsa.gov/find-help/national-helpline" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">SAMHSA Helpline</a>';
  h += '<a href="https://www.nami.org/help" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">NAMI Helpline</a>';
  h += '<a href="https://mhanational.org/get-involved/find-help" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">Mental Health America</a>';
  h += '<a href="https://www.psychologytoday.com/us/therapists" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">Therapist Finder</a>';
  h += '<a href="https://openpathcollective.org/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">Open Path (low-cost)</a>';
  h += '<a href="https://www.7cups.com/" target="_blank" class="btn btn-sm btn-outline" style="text-decoration:none">7 Cups (free support)</a>';
  h += '</div>';
  h += '<a href="https://maps.apple.com/?q=mental+health+services+near+me" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="margin-top:10px;text-decoration:none;display:block">Find Facilities Near Me</a>';
  h += '</div>';
  return h;
}
function relapsePlanHTML() {
  var h = '';
  var rp = D.relapsePlan;
  h += '<h2 class="page-title">Relapse Plan</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(67,56,202,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-oswald);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 16 16" width="16" height="16" fill="#fff"><path d="M8 1L4 5v3c0 3 1.5 5 4 6 2.5-1 4-3 4-6V5z"/><g transform="translate(8,8)"><use href="#star4" transform="scale(2)" fill="rgba(255,255,255,.6)"/></g></svg></div><div style="font-size:12px;color:var(--muted)">Oswald is with you. This plan is your staff and your compass — forged through preparation, ready when called upon.</div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Guided by Oswald  your relapse prevention coach.</p>';
  if (rp && rp.triggers && rp.triggers.length) {
    h += '<div class="card" style="border-left:3px solid var(--accent)">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><span style="font-size:20px">&#128170;</span><span style="font-weight:700;font-size:14px">Your Plan</span></div>';
    h += '<div style="font-size:12px;margin-bottom:4px;color:var(--muted)">Triggers:</div><div style="font-size:13px;margin-bottom:8px">' + rp.triggers.join(', ') + '</div>';
    if (rp.warningSigns) { h += '<div style="font-size:12px;margin-bottom:4px;color:var(--muted)">Warning Signs:</div><div style="font-size:13px;margin-bottom:8px">' + rp.warningSigns + '</div>'; }
    if (rp.interruptActions && rp.interruptActions.length) { h += '<div style="font-size:12px;margin-bottom:4px;color:var(--muted)">Interrupt Actions:</div><div style="font-size:13px;margin-bottom:8px">' + rp.interruptActions.join(', ') + '</div>'; }
    if (rp.contacts && rp.contacts.length) {
      h += '<div style="font-size:12px;margin-bottom:4px;color:var(--muted)">Emergency Contacts:</div>';
      for (var c=0;c<rp.contacts.length;c++) {
        if (rp.contacts[c].name) h += '<div style="font-size:13px;margin-bottom:2px">' + rp.contacts[c].name + ' - ' + rp.contacts[c].phone + '</div>';
      }
    }
    if (rp.commitment) { h += '<div style="font-size:12px;margin-bottom:4px;margin-top:6px;color:var(--muted)">My Commitment:</div><div class="quote" style="font-size:13px;margin:0">' + rp.commitment + '</div>'; }
    h += '</div>';
    h += '<button class="btn btn-outline btn-sm" onclick="startOswaldWizard()" style="margin-top:8px">Revise Plan with Oswald</button>';
  } else {
    h += '<div class="card" style="text-align:center;padding:24px">';
    h += '<div style="font-size:48px;margin-bottom:8px">&#129497;</div>';
    h += '<div style="font-weight:700;font-size:16px;margin-bottom:4px">Meet Oswald</div>';
    h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Your personal relapse prevention coach. Oswald will guide you through building a plan step by step.</p>';
    h += '<button class="btn btn-primary" onclick="startOswaldWizard()">Start with Oswald</button>';
    h += '</div>';
  }
  return h;
}

// ====== CHIVALRY CODE (Gertrude) ======
function chivalryCodeHTML() {
  var cc = D.chivalryCode || { code: [], checkins: [] };
  var h = '';
  h += '<h2 class="page-title">&#9876; Chivalry Code</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(190,24,93,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-gertrude);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;font-weight:800;color:#fff">&#9876;</div><div style="font-size:12px;color:var(--muted)">Gertrude says: <em>"A knight without a code is a wanderer. Define your principles, and every choice becomes clear."</em></div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">Choose 3-5 principles to live by. These are your code — not goals, but the kind of person you are becoming.</p>';

  // Code list
  h += '<div class="card"><h3 style="font-size:14px;margin-bottom:8px">&#128221; My Code</h3>';
  if (!cc.code || !cc.code.length) {
    h += '<div class="empty-state" style="font-size:12px">Your code is empty. Add your first principle below.</div>';
  } else {
    for (var ci=0;ci<cc.code.length;ci++) {
      var item = cc.code[ci];
      h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">';
      h += '<span style="font-size:20px">' + (item.icon || '&#9876;') + '</span>';
      h += '<div style="flex:1;font-size:13px;font-weight:600">' + item.text + '</div>';
      h += '<button class="btn btn-sm btn-outline" onclick="chivalryRemove(' + ci + ')" style="font-size:11px;padding:4px 8px;min-width:0;color:var(--danger)">&#10005;</button>';
      h += '</div>';
    }
  }
  h += '</div>';

  // Add new principle
  h += '<div class="card" id="chivalry-add-card"><h3 style="font-size:14px;margin-bottom:8px">&#10133; Add a Principle</h3>';
  h += '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap">';
  var icons = ['&#9876;','&#128737;','&#9877;','&#9752;','&#10017;','&#9733;','&#9775;','&#9875;','&#9874;','&#10013;','&#9961;','&#127775;'];
  for (var ii=0;ii<icons.length;ii++) {
    h += '<span class="chiv-icon" onclick="document.getElementById(\'chiv-icon\').textContent=this.innerHTML;this.parentNode.querySelectorAll(\'.chiv-icon\').forEach(function(e){e.style.borderColor=\'transparent\'});this.style.borderColor=\'var(--primary)\'" style="font-size:22px;cursor:pointer;padding:4px 8px;border:2px solid transparent;border-radius:8px;transition:.15s">' + icons[ii] + '</span>';
  }
  h += '</div>';
  h += '<input type="text" id="chiv-text" placeholder="e.g. I will be patient. I will tell the truth. I will show up." style="margin-bottom:6px">';
  h += '<button class="btn btn-sm btn-primary" onclick="chivalryAdd()">Add to My Code</button>';
  h += '<span id="chiv-icon" style="display:none">&#9876;</span>';
  h += '</div>';

  // Daily reflection
  h += '<div class="card" style="border-left:3px solid var(--accent)"><h3 style="font-size:14px;margin-bottom:4px">&#128214; Today\'s Reflection</h3>';
  var todayStr = new Date().toDateString();
  var todayEntry = null;
  if (cc.checkins) {
    for (var ti=0;ti<cc.checkins.length;ti++) {
      if (cc.checkins[ti].date === todayStr) { todayEntry = cc.checkins[ti]; break; }
    }
  }
  if (todayEntry) {
    h += '<div style="background:var(--primary-light);padding:10px;border-radius:10px;font-size:12px;line-height:1.5">';
    h += '<div style="font-weight:600;margin-bottom:4px">Today you honored your code:</div>';
    h += '<div style="color:var(--text)">' + todayEntry.note + '</div>';
    var codesUsed = todayEntry.codes || [];
    if (codesUsed.length) h += '<div style="margin-top:4px;font-size:11px;color:var(--muted)">Principles: ' + codesUsed.map(function(c){ return '"' + c + '"'; }).join(', ') + '</div>';
    h += '</div>';
  } else {
    if (cc.code && cc.code.length) {
      h += '<p style="font-size:12px;color:var(--muted);margin-bottom:6px">How did you live your code today? What principle guided you?</p>';
      var codeOpts = '';
      for (var ni=0;ni<cc.code.length;ni++) {
        codeOpts += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;padding:3px 0"><input type="checkbox" class="chiv-code-cb" value="' + ni + '">' + (cc.code[ni].icon || '&#9876;') + ' ' + cc.code[ni].text + '</label>';
      }
      h += '<div style="margin-bottom:6px;padding:6px 0">' + codeOpts + '</div>';
      h += '<textarea id="chiv-today" placeholder="Today I honored my code by..." style="min-height:60px;margin-bottom:6px"></textarea>';
      h += '<button class="btn btn-sm btn-primary" onclick="chivalryCheckin()">Log Reflection</button>';
    } else {
      h += '<div class="empty-state">Define your code above, then reflect daily on how you lived it.</div>';
    }
  }
  h += '</div>';

  // History
  if (cc.checkins && cc.checkins.length) {
    h += '<div class="card"><h3 style="font-size:14px;margin-bottom:8px">&#128214; Reflection History</h3>';
    var recent = cc.checkins.slice().reverse().slice(0,10);
    for (var hi=0;hi<recent.length;hi++) {
      var ce = recent[hi];
      h += '<div style="padding:6px 0;border-bottom:1px solid var(--border)">';
      h += '<div style="font-size:11px;color:var(--muted)">' + ce.date + '</div>';
      h += '<div style="font-size:12px;margin-top:2px">' + ce.note + '</div>';
      if (ce.codes && ce.codes.length) h += '<div style="font-size:11px;color:var(--primary);margin-top:2px">' + ce.codes.join(', ') + '</div>';
      h += '</div>';
    }
    h += '</div>';
  }
  return h;
}
function chivalryAdd() {
  var text = document.getElementById('chiv-text');
  if (!text || !text.value.trim()) return;
  var iconEl = document.getElementById('chiv-icon');
  var icon = iconEl ? iconEl.textContent : '&#9876;';
  if (!D.chivalryCode) D.chivalryCode = { code: [], checkins: [] };
  if (D.chivalryCode.code.length >= 5) { showToast('Maximum 5 principles in your code. Remove one first.', 'error'); return; }
  D.chivalryCode.code.push({ icon: icon, text: text.value.trim() });
  saveData(); render();
}
function chivalryRemove(idx) {
  if (!D.chivalryCode || !D.chivalryCode.code) return;
  D.chivalryCode.code.splice(idx, 1);
  saveData(); render();
}
function chivalryCheckin() {
  var note = document.getElementById('chiv-today');
  if (!note || !note.value.trim()) return;
  var cbs = document.querySelectorAll('.chiv-code-cb:checked');
  var codes = [];
  cbs.forEach(function(cb){ var v = parseInt(cb.value); if (!isNaN(v) && D.chivalryCode && D.chivalryCode.code[v]) codes.push(D.chivalryCode.code[v].text); });
  if (!D.chivalryCode) D.chivalryCode = { code: [], checkins: [] };
  if (!D.chivalryCode.checkins) D.chivalryCode.checkins = [];
  D.chivalryCode.checkins.push({ date: new Date().toDateString(), note: note.value.trim(), codes: codes, timestamp: Date.now() });
  saveData(); render();
  showToast('Reflection logged. Gertrude nods in approval.', 'success');
}

// ====== RELAPSE GRAVEYARD ======
function relapseGraveyardHTML() {
  var rg = D.relapseGraveyard || { graves: [] };
  var h = '';
  h += '<h2 class="page-title">&#9904; Relapse Graveyard</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(42,42,42,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-arthur);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;font-weight:800;color:#fff">&#9876;</div><div style="font-size:12px;color:var(--muted)">Arthur says: <em>"Every fallen knight teaches the next how to stand. Honor the dead, keep walking."</em></div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">Past relapses are not failures — they are fallen comrades who taught you something. Mark them here with respect, and carry their lesson forward.</p>';

  // Import existing relapse dates
  var existingDates = D.sobriety && D.sobriety.relapseDates ? D.sobriety.relapseDates : [];
  var importedCount = 0;
  if (existingDates.length && (!rg.graves || !rg.graves.length)) {
    rg.graves.forEach(function(g){ if (existingDates.indexOf(g.date) >= 0) importedCount++; });
    var unimported = existingDates.filter(function(d){ return !rg.graves.some(function(g){ return g.date === d; }); });
    if (unimported.length) {
      h += '<div class="card" style="border:2px solid var(--accent);background:var(--primary-light);text-align:center;padding:12px">';
      h += '<div style="font-size:13px;margin-bottom:6px">&#128161; Found ' + unimported.length + ' relapse date' + (unimported.length > 1 ? 's' : '') + ' in your record. Add ' + (unimported.length > 1 ? 'them' : 'it') + ' to the graveyard?</div>';
      h += '<button class="btn btn-sm btn-primary" onclick="graveImport(' + unimported.length + ')">Import to Graveyard</button>';
      h += '</div>';
    }
  }

  // Grave grid
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px" id="grave-grid">';
  if (!rg.graves || !rg.graves.length) {
    h += '<div style="grid-column:1/-1" class="empty-state">No graves yet. Past relapses can be laid to rest here — with honor, not shame.</div>';
  } else {
    for (var gi=0;gi<rg.graves.length;gi++) {
      var g = rg.graves[gi];
      h += graveTombstoneHTML(g, gi);
    }
  }
  h += '</div>';

  // Add new grave
  h += '<div class="card"><h3 style="font-size:14px;margin-bottom:6px">&#9963; Lay a Relapse to Rest</h3>';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">Date of relapse</label>';
  h += '<input type="date" id="grave-date" style="margin-bottom:6px">';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">What triggered it?</label>';
  h += '<input type="text" id="grave-trigger" placeholder="e.g. stress, social pressure, loneliness" style="margin-bottom:6px">';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">What did it teach you?</label>';
  h += '<textarea id="grave-lesson" placeholder="e.g. I need to call someone before the urge peaks. Isolation is my enemy." style="min-height:60px;margin-bottom:6px"></textarea>';
  h += '<div style="display:flex;gap:6px"><button class="btn btn-sm btn-primary" onclick="graveAdd()">&#9963; Lay to Rest</button><button class="btn btn-sm btn-outline" onclick="graveRandom()">&#127922; Random Epitaph</button></div>';
  h += '</div>';

  // Epitaph inspiration
  h += '<div class="card" style="border-left:3px solid var(--border);padding:10px;font-size:11px;color:var(--muted);line-height:1.6">';
  h += '<strong style="font-size:12px">Epitaph ideas:</strong><br>';
  h += '"Here lies a lesson I will not unlearn." &bull; "Fell so I could rise stronger." &bull; "This grave marks where shame dies." &bull; "Not my end — my teacher." &bull; "I carried this stone so others won\'t have to."';
  h += '</div>';

  return h;
}
function graveTombstoneHTML(g, idx) {
  var epitaph = g.epitaph || g.lesson || 'Here lies a lesson.';
  var dateLabel = g.date ? regnalDate(g.date) : 'Unknown';
  return '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px 12px 8px 8px;padding:10px;text-align:center;position:relative;box-shadow:0 2px 8px rgba(0,0,0,.06)">' +
    '<div style="font-size:28px;margin-bottom:2px;opacity:.5">&#9904;</div>' +
    '<div style="font-size:11px;font-weight:700;color:var(--muted);margin-bottom:2px">' + dateLabel + '</div>' +
    (g.trigger ? '<div style="font-size:10px;color:var(--muted);margin-bottom:4px">' + g.trigger + '</div>' : '') +
    '<div style="font-size:11px;font-style:italic;color:var(--text);line-height:1.4;padding:4px;background:var(--primary-light);border-radius:6px;min-height:32px;display:flex;align-items:center;justify-content:center">"' + epitaph + '"</div>' +
    '<button class="btn btn-sm btn-outline" onclick="graveRemove(' + idx + ')" style="position:absolute;top:4px;right:4px;font-size:10px;padding:2px 6px;min-width:0;color:var(--danger);border-color:transparent">&#10005;</button>' +
    '<div style="font-size:10px;color:var(--muted);margin-top:4px;opacity:.6">&#127801; rest in peace</div></div>';
}
function graveAdd() {
  var dateEl = document.getElementById('grave-date');
  var triggerEl = document.getElementById('grave-trigger');
  var lessonEl = document.getElementById('grave-lesson');
  if (!dateEl || !dateEl.value) { showToast('Please select a date.', 'error'); return; }
  if (!lessonEl || !lessonEl.value.trim()) { showToast('Every grave needs a lesson. What did you learn?', 'error'); return; }
  if (!D.relapseGraveyard) D.relapseGraveyard = { graves: [] };
  D.relapseGraveyard.graves.push({
    date: dateEl.value,
    trigger: (triggerEl ? triggerEl.value.trim() : ''),
    lesson: lessonEl.value.trim(),
    epitaph: lessonEl.value.trim().slice(0,80)
  });
  saveData(); render();
  showToast('Laid to rest. The lesson stays with you.', 'info');
}
function graveRemove(idx) {
  if (!D.relapseGraveyard || !D.relapseGraveyard.graves) return;
  D.relapseGraveyard.graves.splice(idx, 1);
  saveData(); render();
  showToast('Grave removed. The lesson remains.', 'info');
}
function graveImport(count) {
  var existingDates = D.sobriety && D.sobriety.relapseDates ? D.sobriety.relapseDates : [];
  if (!D.relapseGraveyard) D.relapseGraveyard = { graves: [] };
  existingDates.forEach(function(d){
    if (!D.relapseGraveyard.graves.some(function(g){ return g.date === d; })) {
      D.relapseGraveyard.graves.push({ date: d, trigger: '', lesson: 'A past relapse marked for remembrance.', epitaph: 'Fell so I could rise stronger.' });
    }
  });
  saveData(); render();
  showToast('Imported ' + count + ' relapse' + (count > 1 ? 's' : '') + ' into the graveyard.', 'success');
}
function graveRandom() {
  var epitaphs = [
    'Here lies a lesson I will not unlearn.',
    'Fell so I could rise stronger.',
    'This grave marks where shame died.',
    'Not my end — my teacher.',
    'I carried this stone so others won\'t have to.',
    'A stumble, not a fall.',
    'This day broke me. I rebuilt.',
    'I lost a battle to win the war.',
    'I am not what happened to me.',
    'From this ash, something grew.'
  ];
  var lessonEl = document.getElementById('grave-lesson');
  if (lessonEl) lessonEl.value = epitaphs[Math.floor(Math.random() * epitaphs.length)];
}

// ====== ROYAL PARDON (Arthur) ======
function royalPardonHTML() {
  var pardons = D.royalPardons || [];
  var h = '';
  h += '<h2 class="page-title">&#128081; Royal Pardon</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(255,215,0,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-arthur);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px;font-weight:800;color:#fff">&#9813;</div><div style="font-size:12px;color:var(--muted)">King Arthur says: <em>"By the crown I carry and the realm we are building — you are pardoned. Rise and begin again with my blessing."</em></div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">A relapse is not a verdict. It is a detour. Arthur grants you a Royal Pardon — not to erase what happened, but to sanctify your fresh start. This is your certificate of amnesty.</p>';

  // Grant a new pardon
  var lastRelapseDate = D.sobriety && D.sobriety.relapseDates && D.sobriety.relapseDates.length ? new Date(D.sobriety.relapseDates[D.sobriety.relapseDates.length-1]).toISOString().split('T')[0] : '';
  h += '<div class="card" style="border:2px solid var(--primary);background:var(--primary-light)"><h3 style="font-size:14px;margin-bottom:6px;text-align:center">&#128081; Grant a New Pardon</h3>';
  h += '<p style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:8px">After a relapse, Arthur invites you to accept his pardon and begin again with honor.</p>';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">Date of relapse</label>';
  h += '<input type="date" id="pardon-date" value="' + lastRelapseDate + '" style="margin-bottom:6px">';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">What do you forgive yourself for?</label>';
  h += '<textarea id="pardon-forgive" placeholder="e.g. I forgive myself for giving in to the craving. I forgive myself for the shame I carried after." style="min-height:50px;margin-bottom:6px"></textarea>';
  h += '<label style="font-size:11px;color:var(--muted);display:block;margin-bottom:2px">What do you commit to going forward?</label>';
  h += '<textarea id="pardon-commit" placeholder="e.g. I commit to reaching out before the urge wins. I commit to showing up for myself tomorrow." style="min-height:50px;margin-bottom:6px"></textarea>';
  h += '<button class="btn btn-primary btn-sm" onclick="pardonGrant(this)" style="width:100%">&#128081; Accept Royal Pardon</button>';
  h += '</div>';

  // Existing pardons
  if (pardons.length) {
    h += '<h3 style="font-size:15px;font-weight:700;margin:12px 0 6px">&#128220; Pardon Records</h3>';
    for (var pi=pardons.length-1;pi>=0;pi--) {
      var p = pardons[pi];
      h += pardonCertificateHTML(p);
    }
  }
  return h;
}
function pardonCertificateHTML(p) {
  var dateStr = p.date ? new Date(p.date).toLocaleDateString() : 'Unknown';
  var grantedStr = p.grantedAt ? new Date(p.grantedAt).toLocaleDateString() : dateStr;
  return '<div style="background:var(--card);border:2px solid var(--gold);border-radius:16px;padding:16px;margin-bottom:10px;text-align:center;position:relative;box-shadow:0 2px 12px rgba(138,122,106,.15)">' +
    '<div style="position:absolute;top:8px;left:12px;font-size:18px;opacity:.3">&#9876;</div>' +
    '<div style="position:absolute;top:8px;right:12px;font-size:18px;opacity:.3">&#9876;</div>' +
    '<div style="font-size:32px;margin-bottom:2px">&#128081;</div>' +
    '<div style="font-size:14px;font-weight:800;color:var(--primary);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">Royal Pardon</div>' +
    '<div style="font-size:10px;color:var(--gold);margin-bottom:8px;font-style:italic">Know all who read these words...</div>' +
    '<div style="border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);padding:8px 4px;margin-bottom:6px">' +
    (p.forgive ? '<div style="font-size:12px;line-height:1.5;margin-bottom:4px"><em>"' + p.forgive + '"</em></div>' : '') +
    (p.commit ? '<div style="font-size:11px;color:var(--text-light)">&#9876; <strong>Vow:</strong> ' + p.commit + '</div>' : '') +
    '</div>' +
    '<div style="display:flex;justify-content:center;gap:12px;font-size:10px;color:var(--muted)">' +
    '<span>Relapse: ' + dateStr + '</span>' +
    '<span>Pardoned: ' + grantedStr + '</span>' +
    '</div>' +
    '<div style="margin-top:6px">' + waxSealSVG(36) + '</div>' +
    '<div style="font-size:9px;color:var(--muted);letter-spacing:2px;margin-top:2px">SEAL OF KING ARTHUR</div>' +
    '</div>';
}
function pardonGrant(btn) {
  var dateEl = document.getElementById('pardon-date');
  var forgiveEl = document.getElementById('pardon-forgive');
  var commitEl = document.getElementById('pardon-commit');
  if (!dateEl || !dateEl.value) { showToast('Please select a date.', 'error'); return; }
  if (!forgiveEl || !forgiveEl.value.trim()) { showToast('What do you forgive yourself for?', 'error'); return; }
  if (!D.royalPardons) D.royalPardons = [];
  var forgive = forgiveEl.value.trim();
  var commit = (commitEl ? commitEl.value.trim() : '');
  D.royalPardons.push({ date: dateEl.value, forgive: forgive, commit: commit, grantedAt: Date.now() });
  saveData(); render();

  // ===== ROYAL PARDON CEREMONY - Throne Scene =====
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'pardon-ceremony';
  overlay.style.background = '#0d0a06';
  overlay.style.zIndex = '1000';

  var sceneW = 280, sceneH = 240;
  var h = '<div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(139,119,60,.12),transparent 70%);animation:pardonAmbient 3s ease-in-out infinite"></div>';
  h += '<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px">';

  // ---- Phase 1: Throne + Arthur scene ----
  h += '<div id="pardon-scene" style="position:relative;width:' + sceneW + 'px;height:' + sceneH + 'px;animation:pardonThroneIn 1s cubic-bezier(.34,1.56,.64,1) both">';

  // Throne SVG
  h += '<svg viewBox="0 0 ' + sceneW + ' ' + sceneH + '" style="position:absolute;inset:0;width:100%;height:100%">';
  // Ambient glow behind throne
  h += '<ellipse cx="140" cy="130" rx="80" ry="40" fill="rgba(255,215,0,.08)" filter="url(#throneGlow)"/>';
  // Throne back
  h += '<path d="M100 40 L100 170 L180 170 L180 40 Q140 20 100 40 Z" fill="#4a3728" stroke="#8a7a5a" stroke-width="2"/>';
  h += '<path d="M104 44 L104 166 L176 166 L176 44 Q140 26 104 44 Z" fill="#5c4834"/>';
  // Throne armrests
  h += '<rect x="88" y="120" width="18" height="50" rx="4" fill="#4a3728" stroke="#8a7a5a" stroke-width="1.5"/>';
  h += '<rect x="174" y="120" width="18" height="50" rx="4" fill="#4a3728" stroke="#8a7a5a" stroke-width="1.5"/>';
  // Throne top ornament
  h += '<path d="M120 28 L130 10 L140 24 L150 10 L160 28" fill="none" stroke="#ffd700" stroke-width="2" stroke-linecap="round"/>';
  h += '<circle cx="140" cy="12" r="5" fill="#ffd700"/>';
  // Throne cushion
  h += '<ellipse cx="140" cy="160" rx="32" ry="8" fill="#6d28d9"/>';
  // Step
  h += '<rect x="108" y="170" width="64" height="6" rx="2" fill="#3d2b1f" stroke="#8a7a5a" stroke-width=".5"/>';
  h += '<rect x="100" y="176" width="80" height="8" rx="2" fill="#2a1f15" stroke="#6a5a3a" stroke-width=".5"/>';

  // Arthur seated - scaled down standing figure positioned on throne
  h += '<g transform="translate(140,148) scale(1.8) translate(-15,-26)"><g id="pardon-arthur" style="animation:pardonArthurIn .8s ease .3s both">';
  // Body (robe)
  h += '<path d="M10.5 12 Q9 20 8 28 L8 38 Q8 40 9 41 L9 42 L21 42 L21 41 Q22 40 22 38 L22 28 Q21 20 19.5 12 Z" fill="#6d28d9"/>';
  // Belt
  h += '<rect x="9" y="26" width="12" height="2.5" rx="1" fill="#ffd700"/>';
  h += '<circle cx="15" cy="27.25" r="1.5" fill="#e11d48"/>';
  // Legs (seated, short)
  h += '<path d="M11 38 L8 46 L11 46 L13 42 Z" fill="#4a1d96"/>';
  h += '<path d="M19 38 L22 46 L19 46 L17 42 Z" fill="#4a1d96"/>';
  // Boots
  h += '<rect x="7" y="44" width="5" height="3" rx="1" fill="#3d2b1f"/>';
  h += '<rect x="18" y="44" width="5" height="3" rx="1" fill="#3d2b1f"/>';
  // Head
  h += '<ellipse cx="15" cy="8" rx="5.5" ry="5.5" fill="#e8b88a"/>';
  // Hair
  h += '<path d="M9.5 5 Q9.5 2 12 1.5 Q15 1 18 1.5 Q20.5 2 20.5 5 Q20.5 3.5 17 3 Q15 2.8 13 3 Q9.5 3.5 9.5 5" fill="#8B4513"/>';
  // Beard
  h += '<path d="M11.5 10 Q11 12.5 12 15 Q13.5 17 15 17 Q16.5 17 18 15 Q19 12.5 18.5 10 Z" fill="#8B4513"/>';
  // Crown
  h += '<path d="M10.5 3 L11 0.5 L12.5 2 L15 0 L17.5 2 L19 0.5 L19.5 3 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.4"/>';
  h += '<rect x="10.5" y="3" width="9" height="2" rx="0.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.3" id="pardon-crown"/>';
  // Eyes
  h += '<circle cx="12.5" cy="6.5" r=".8" fill="#222"/>';
  h += '<circle cx="17.5" cy="6.5" r=".8" fill="#222"/>';
  // Nose
  h += '<path d="M14.5 8 L15 10 L15.5 8" fill="none" stroke="#c4916a" stroke-width=".5"/>';
  // Writing ARM (left arm, holding quill)
  h += '<g id="pardon-write-arm" style="transform-origin:15px 17px;animation:pardonWriteArm 1.4s ease-in-out .8s 2 both">';
  h += '<path d="M15 17 L11 20" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  // Quill
  h += '<g id="pardon-quill" style="transform-origin:11px 20px;animation:pardonQuill 1.4s ease-in-out .8s 2 both">';
  h += '<path d="M11 20 L9 16" stroke="#e8b88a" stroke-width="1.5" stroke-linecap="round" fill="none"/>';
  h += '<path d="M9 16 L7 12 L9 10 L10 14 Z" fill="#d4c8a0" stroke="#8a7a5a" stroke-width=".3"/>';
  h += '<path d="M7 12 L5 11" stroke="#444" stroke-width=".4"/>';
  h += '</g></g>';
  // Scroll on lap (stationary)
  h += '<g id="pardon-lap-scroll">';
  h += '<rect x="10" y="30" width="10" height="7" rx="1" fill="#f5e6c8" stroke="#8a7a5a" stroke-width=".3" opacity=".7"/>';
  h += '<line x1="12" y1="31" x2="12" y2="36" stroke="#666" stroke-width=".2" opacity=".3"/>';
  h += '<line x1="14" y1="31" x2="14" y2="36" stroke="#666" stroke-width=".2" opacity=".3"/>';
  h += '<line x1="16" y1="31" x2="16" y2="36" stroke="#666" stroke-width=".2" opacity=".3"/>';
  h += '<line x1="18" y1="31" x2="18" y2="36" stroke="#666" stroke-width=".2" opacity=".3"/>';
  h += '</g>';
  // Right arm (resting on armrest)
  h += '<path d="M15 17 L19 20 L22 22" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  h += '</g></g>';

  // ---- Phase 2: Floating scroll that Arthur hands over ----
  h += '<g id="pardon-floating-scroll" style="transform-origin:140px 120px;opacity:0">';
  h += '<rect x="100" y="64" width="80" height="50" rx="4" fill="#fef9e7" stroke="#8a7a5a" stroke-width="1" id="pardon-scroll-body"/>';
  // Scroll roll top
  h += '<ellipse cx="100" cy="64" rx="6" ry="5" fill="#f0d8a0" stroke="#8a7a5a" stroke-width=".8"/>';
  h += '<ellipse cx="180" cy="64" rx="6" ry="5" fill="#f0d8a0" stroke="#8a7a5a" stroke-width=".8"/>';
  // Scroll roll bottom
  h += '<ellipse cx="100" cy="114" rx="6" ry="5" fill="#f0d8a0" stroke="#8a7a5a" stroke-width=".8"/>';
  h += '<ellipse cx="180" cy="114" rx="6" ry="5" fill="#f0d8a0" stroke="#8a7a5a" stroke-width=".8"/>';
  // Text on scroll
  h += '<g id="pardon-scroll-text" style="opacity:0;transform-origin:140px 89px">';
  h += '<text x="140" y="78" font-size="5" fill="#4a3728" font-weight="700" text-anchor="middle" font-family="serif">ROYAL PARDON</text>';
  h += '<text x="140" y="86" font-size="3" fill="#6a5a3a" text-anchor="middle" font-family="serif" font-style="italic">Know all who read these words...</text>';
  h += '<text x="140" y="94" font-size="3.5" fill="#4a3728" text-anchor="middle" font-family="serif">I, King Arthur, grant this pardon to</text>';
  h += '<text x="140" y="100" font-size="4" fill="#6d28d9" font-weight="700" text-anchor="middle" font-family="serif">' + (D.name || 'Faithful Knight') + '</text>';
  h += '</g>';
  // Seal
  h += '<circle cx="140" cy="110" r="4" fill="#6d28d9" stroke="#ffd700" stroke-width=".5" id="pardon-seal-icon" style="opacity:0"/>';
  h += '<text x="140" y="112" font-size="3.5" fill="#fff" text-anchor="middle" font-weight="700" id="pardon-seal-text" style="opacity:0">A</text>';
  h += '</g>';

  h += '</div></div>'; // close scene + centering container

  // ---- Phase 3: Button (appears after animation) ----
  h += '<div id="pardon-accept-btn" style="opacity:0;margin-top:8px">';
  h += '<button class="btn btn-primary" onclick="document.getElementById(\'pardon-ceremony\').remove();goTo(\'royalpardon\')">&#128081; I Accept This Pardon</button>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);

  // ---- Animation sequence via JS timers ----
  var timers = [];

  // Phase 1: Throne already animating via CSS

  // Phase 2: Writing stops, arm extends forward with scroll (3000ms)
  timers.push(setTimeout(function(){
    var lapScroll = document.querySelector('#pardon-lap-scroll');
    if (lapScroll) { lapScroll.style.transition = 'opacity .3s'; lapScroll.style.opacity = '0'; }
    var writeArm = document.getElementById('pardon-write-arm');
    if (writeArm) {
      writeArm.style.animation = 'none';
      writeArm.style.transition = 'transform .7s cubic-bezier(.34,1.2,.64,1)';
      void writeArm.offsetHeight;
      writeArm.style.transform = 'rotate(-40deg) translateX(20px)';
    }
    var floatingScroll = document.getElementById('pardon-floating-scroll');
    if (floatingScroll) {
      floatingScroll.style.opacity = '1';
      floatingScroll.style.transition = 'opacity .5s, transform .9s cubic-bezier(.34,1.2,.64,1)';
      void floatingScroll.offsetHeight;
      floatingScroll.style.transform = 'translateY(-8px)';
    }
  }, 3000));

  // Phase 4: Scroll glows + text appears (4000ms)
  timers.push(setTimeout(function(){
    var scrollBody = document.getElementById('pardon-scroll-body');
    if (scrollBody) { scrollBody.style.animation = 'pardonScrollGlow 2s ease-in-out infinite'; }
    var scrollText = document.getElementById('pardon-scroll-text');
    if (scrollText) { scrollText.style.transition = 'opacity .8s ease'; scrollText.style.opacity = '1'; }
  }, 4000));

  // Phase 5: Seal appears (4800ms)
  timers.push(setTimeout(function(){
    var sealIcon = document.getElementById('pardon-seal-icon');
    if (sealIcon) { sealIcon.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.34,1.56,.64,1)'; sealIcon.style.opacity = '1'; sealIcon.style.transform = 'scale(1.3)'; }
    var sealText = document.getElementById('pardon-seal-text');
    if (sealText) { sealText.style.transition = 'opacity .6s ease .1s'; sealText.style.opacity = '1'; }
    var crown = document.getElementById('pardon-crown');
    if (crown) { crown.style.transformOrigin = '15px 3px'; crown.style.animation = 'pardonCrownBob .5s ease 2'; }
  }, 4800));

  // Phase 6: Scroll floats up (5500ms)
  timers.push(setTimeout(function(){
    var floatingScroll = document.getElementById('pardon-floating-scroll');
    if (floatingScroll) { floatingScroll.style.transition = 'transform 1.2s cubic-bezier(.34,1.2,.64,1), opacity .8s ease'; floatingScroll.style.transform = 'translateY(-40px) scale(1.15)'; }
  }, 5500));

  // Phase 7: Show button (6500ms)
  timers.push(setTimeout(function(){
    var btnEl = document.getElementById('pardon-accept-btn');
    if (btnEl) { btnEl.style.transition = 'opacity .6s ease'; btnEl.style.opacity = '1'; }
  }, 6500));

  // Cleanup timers on dismiss
  overlay._pardonTimers = timers;
  overlay.addEventListener('remove', function(){
    timers.forEach(function(t){ clearTimeout(t); });
  });
}

var OSWALD_STEP = 0;
var OSWALD_DATA = {};
var TRIGGER_OPTIONS = ['Stress','Loneliness','Boredom','Anger','Social pressure','Celebration','Financial trouble','Relationship conflict','Insomnia','Physical pain','Certain places','Certain people','Alcohol/drug cues','Anniversary dates','Holidays'];
var INTERRUPT_OPTIONS = ['Call my sponsor','Go for a walk','Journal','Go to a meeting','Text a friend','Exercise','Meditate/Breathe','Read my commitment','Leave the situation','Listen to music','Take a nap','Drink water'];
function startOswaldWizard() {
  OSWALD_DATA = {};
  var rp = D.relapsePlan;
  if (rp) {
    OSWALD_DATA.triggers = rp.triggers ? rp.triggers.slice() : [];
    OSWALD_DATA.warningSigns = rp.warningSigns || '';
    OSWALD_DATA.interruptActions = rp.interruptActions ? rp.interruptActions.slice() : [];
    OSWALD_DATA.contacts = rp.contacts ? JSON.parse(JSON.stringify(rp.contacts)) : [{name:'',phone:''},{name:'',phone:''}];
    OSWALD_DATA.commitment = rp.commitment || '';
  } else {
    OSWALD_DATA.triggers = [];
    OSWALD_DATA.warningSigns = '';
    OSWALD_DATA.interruptActions = [];
    OSWALD_DATA.contacts = [{name:'',phone:''},{name:'',phone:''}];
    OSWALD_DATA.commitment = '';
  }
  OSWALD_STEP = 0;
  renderOswaldStep();
}
function renderOswaldStep() {
  var steps = ['Triggers','Warning Signs','Interrupt Actions','Emergency Contacts','Commitment','Review'];
  var step = OSWALD_STEP;
  if (step >= steps.length) { OSWALD_STEP = 0; return; }
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'oswald-ov';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  if (step === 0) playSound('magic');
  var body = '';
  var icon = ['&#128064;','&#128533;','&#128299;','&#128222;','&#128221;','&#9989;'][step] || '&#129497;';
  var oswaldSays = ['Let\'s identify what might trigger a relapse. Check all that apply to you.','Good. Now what early warning signs do you usually feel before a craving hits?','Smart. What actions can you take to interrupt a craving when it starts?','Who can you call in an emergency? Add at least one person.','Write a short commitment statement. Read this when you need strength.','Here\'s your plan. Does everything look right?'][step] || '';
  body += '<div style="font-size:40px;margin-bottom:4px">' + icon + '</div>';
  body += '<div style="font-size:13px;font-weight:700;color:var(--primary);margin-bottom:2px">Oswald says:</div>';
  body += '<div style="font-size:14px;color:var(--text);margin-bottom:14px;line-height:1.5">' + oswaldSays + '</div>';
  if (step === 0) {
    body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px">';
    for (var i=0;i<TRIGGER_OPTIONS.length;i++) {
      var sel = OSWALD_DATA.triggers.indexOf(TRIGGER_OPTIONS[i]) !== -1;
      body += '<button class="btn btn-sm ' + (sel ? 'btn-primary' : 'btn-outline') + '" onclick="toggleOswaldTrigger('+i+')" style="font-size:11px">' + TRIGGER_OPTIONS[i] + '</button>';
    }
    body += '</div>';
  } else if (step === 1) {
    body += '<textarea id="oswald-warning" placeholder="e.g. racing thoughts, irritability, isolating myself..." style="min-height:80px">' + OSWALD_DATA.warningSigns + '</textarea>';
  } else if (step === 2) {
    body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-bottom:10px">';
    for (var i=0;i<INTERRUPT_OPTIONS.length;i++) {
      var sel = OSWALD_DATA.interruptActions.indexOf(INTERRUPT_OPTIONS[i]) !== -1;
      body += '<button class="btn btn-sm ' + (sel ? 'btn-primary' : 'btn-outline') + '" onclick="toggleOswaldInterrupt('+i+')" style="font-size:11px">' + INTERRUPT_OPTIONS[i] + '</button>';
    }
    body += '</div>';
  } else if (step === 3) {
    body += '<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted)">Contact 1</div>';
    body += '<input id="oswald-contact1-name" placeholder="Name" value="' + (OSWALD_DATA.contacts[0]?OSWALD_DATA.contacts[0].name:'') + '" style="margin-bottom:4px">';
    body += '<input id="oswald-contact1-phone" placeholder="Phone number" value="' + (OSWALD_DATA.contacts[0]?OSWALD_DATA.contacts[0].phone:'') + '" style="margin-bottom:10px">';
    body += '<div style="font-size:12px;font-weight:600;margin-bottom:6px;color:var(--muted)">Contact 2</div>';
    body += '<input id="oswald-contact2-name" placeholder="Name" value="' + (OSWALD_DATA.contacts[1]?OSWALD_DATA.contacts[1].name:'') + '" style="margin-bottom:4px">';
    body += '<input id="oswald-contact2-phone" placeholder="Phone number" value="' + (OSWALD_DATA.contacts[1]?OSWALD_DATA.contacts[1].phone:'') + '">';
  } else if (step === 4) {
    body += '<textarea id="oswald-commitment" placeholder="e.g. I deserve a better life. I will pause, breathe, and reach out before using." style="min-height:80px">' + OSWALD_DATA.commitment + '</textarea>';
  } else if (step === 5) {
    var t = OSWALD_DATA.triggers || [];
    var w = OSWALD_DATA.warningSigns || '';
    var ia = OSWALD_DATA.interruptActions || [];
    var co = OSWALD_DATA.contacts || [];
    var cm = OSWALD_DATA.commitment || '';
    body += '<div style="text-align:left;background:var(--primary-light);padding:12px;border-radius:10px;font-size:12px;line-height:1.6">';
    body += '<div style="font-weight:700;margin-bottom:4px;color:var(--primary)">Triggers:</div><div style="margin-bottom:8px">' + (t.length ? t.join(', ') : 'None selected') + '</div>';
    body += '<div style="font-weight:700;margin-bottom:4px;color:var(--primary)">Warning Signs:</div><div style="margin-bottom:8px">' + (w || 'None') + '</div>';
    body += '<div style="font-weight:700;margin-bottom:4px;color:var(--primary)">Interrupt Actions:</div><div style="margin-bottom:8px">' + (ia.length ? ia.join(', ') : 'None selected') + '</div>';
    body += '<div style="font-weight:700;margin-bottom:4px;color:var(--primary)">Contacts:</div><div style="margin-bottom:8px">';
    for (var ci=0;ci<co.length;ci++) { if (co[ci].name) body += co[ci].name + ' - ' + co[ci].phone + '<br>'; }
    body += '</div>';
    body += '<div style="font-weight:700;margin-bottom:4px;color:var(--primary)">My Commitment:</div><div>' + (cm || 'None') + '</div>';
    body += '</div>';
  }
  overlay.innerHTML =
    '<div style="background:var(--card);max-width:380px;width:90%;margin:0 auto;border-radius:20px;padding:28px 20px 20px;text-align:center;animation:siFade .3s ease;position:relative;max-height:85vh;overflow-y:auto">' +
    body +
    '<div style="display:flex;gap:6px;justify-content:center;margin:14px 0 10px">' +
    steps.map(function(_,i){ return '<div style="width:7px;height:7px;border-radius:4px;background:'+(i===step?'var(--primary)':'var(--border)')+';transition:.2s"></div>'; }).join('') +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
    (step > 0 ? '<button class="btn btn-sm btn-outline" onclick="saveOswaldStep();OSWALD_STEP--;renderOswaldStep()" style="flex:1">Back</button>' : '') +
    '<button class="btn btn-sm btn-primary" onclick="saveOswaldStep();OSWALD_STEP++;renderOswaldStep()" style="flex:1">' + (step < steps.length-1 ? 'Next' : 'Save Plan') + '</button>' +
    '</div>' +
    '<button onclick="document.getElementById(\'oswald-ov\').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">?</button>' +
    '</div>';
  var existing = document.getElementById('oswald-ov');
  if (existing) existing.remove();
  document.body.appendChild(overlay);
}
function toggleOswaldTrigger(i) {
  var idx = OSWALD_DATA.triggers.indexOf(TRIGGER_OPTIONS[i]);
  if (idx === -1) OSWALD_DATA.triggers.push(TRIGGER_OPTIONS[i]);
  else OSWALD_DATA.triggers.splice(idx,1);
  renderOswaldStep();
}
function toggleOswaldInterrupt(i) {
  var idx = OSWALD_DATA.interruptActions.indexOf(INTERRUPT_OPTIONS[i]);
  if (idx === -1) OSWALD_DATA.interruptActions.push(INTERRUPT_OPTIONS[i]);
  else OSWALD_DATA.interruptActions.splice(idx,1);
  renderOswaldStep();
}
function saveOswaldStep() {
  var el;
  el = document.getElementById('oswald-warning');
  if (el) OSWALD_DATA.warningSigns = el.value;
  el = document.getElementById('oswald-commitment');
  if (el) OSWALD_DATA.commitment = el.value;
  el = document.getElementById('oswald-contact1-name');
  if (el && OSWALD_DATA.contacts[0]) OSWALD_DATA.contacts[0].name = el.value;
  el = document.getElementById('oswald-contact1-phone');
  if (el && OSWALD_DATA.contacts[0]) OSWALD_DATA.contacts[0].phone = el.value;
  el = document.getElementById('oswald-contact2-name');
  if (el && OSWALD_DATA.contacts[1]) OSWALD_DATA.contacts[1].name = el.value;
  el = document.getElementById('oswald-contact2-phone');
  if (el && OSWALD_DATA.contacts[1]) OSWALD_DATA.contacts[1].phone = el.value;
  if (OSWALD_STEP === 5) {
    OSWALD_DATA.contacts = OSWALD_DATA.contacts.filter(function(c){ return c.name || c.phone; });
    D.relapsePlan = OSWALD_DATA;
    saveData();
    document.getElementById('oswald-ov').remove();
    setTimeout(showRelapseCutscene, 300);
    return;
  }
  renderOswaldStep();
}

function showRelapseCutscene() {
  var plan = D.relapsePlan;
  if (!plan || !plan.triggers || !plan.triggers.length) { render(); return; }
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.65)';
  overlay.style.alignItems = 'center';
  var h = '<div class="journal-letter" id="rc-scroll" style="animation:scrollUnroll 1s cubic-bezier(.22,1,.36,1) both">';
  h += '<div style="text-align:center;opacity:0" id="rc-char">'+_npcStandalone('Oswald')+'</div>';
  h += '<div class="scroll-header" id="rc-title" style="opacity:0">';
  h += '<div class="scroll-date">OSWALD\'S WISDOM</div>';
  h += '<div class="scroll-title">Your Relapse Plan</div>';
  h += '</div>';
  h += '<div id="rc-details" style="opacity:0">';
  if (plan.triggers && plan.triggers.length) h += '<div class="letter-section"><div class="letter-section-label">&#9888; Triggers</div><div class="letter-section-text">'+safe(plan.triggers.join(' &middot; '))+'</div></div>';
  if (plan.warningSigns) h += '<div class="letter-section"><div class="letter-section-label">&#128196; Warning Signs</div><div class="letter-section-text">'+safe(plan.warningSigns)+'</div></div>';
  if (plan.interruptActions && plan.interruptActions.length) h += '<div class="letter-section"><div class="letter-section-label">&#128170; Interrupt Actions</div><div class="letter-section-text">'+safe(plan.interruptActions.join(' &middot; '))+'</div></div>';
  if (plan.contacts && plan.contacts.length) h += '<div class="letter-section"><div class="letter-section-label">&#128222; Emergency Contacts</div><div class="letter-section-text">'+safe(plan.contacts.filter(function(c){return c.name}).map(function(c){return c.name+' - '+c.phone}).join(' &middot; '))+'</div></div>';
  if (plan.commitment) h += '<div class="letter-section"><div class="letter-section-label">My Commitment</div><div class="letter-section-text" style="font-style:italic">"'+safe(plan.commitment)+'"</div></div>';
  h += '</div>';
  h += '<div class="scroll-closing" id="rc-closing" style="display:none">';
  h += '<div class="scroll-signoff">Sealed by the Wizard,</div>';
  h += '<div class="scroll-signature">Oswald</div>';
  h += '<div class="scroll-time">' + new Date().toLocaleDateString() + '</div>';
  h += '</div>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove();render()" id="rc-close" style="display:none;margin-top:10px">&#10003; Close Scroll</button>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  setTimeout(function(){var e=overlay.querySelector('#rc-char');if(e)e.style.animation='jcZoomIn .7s cubic-bezier(.34,1.56,.64,1) forwards'},200);
  setTimeout(function(){playSound('drum');var e=overlay.querySelector('#rc-title');if(e)e.style.animation='letterAppear .6s ease both'},700);
  setTimeout(function(){var e=overlay.querySelector('#rc-details');if(e)e.style.animation='letterAppear .5s ease both'},1200);
  setTimeout(function(){var e=overlay.querySelector('#rc-closing');if(e)e.style.display='block';if(e)e.style.animation='letterAppear .5s ease both'},2000);
  setTimeout(function(){var e=overlay.querySelector('#rc-close');if(e)e.style.display='inline-block';if(e)e.style.animation='letterAppear .4s ease both'},2600);
}
function showRelapsePlan() {
  startOswaldWizard();
}

// ====== TIME CAPSULE ======
function timeCapsuleHTML() {
  if (!D.timeCapsules) D.timeCapsules = [];
  var readyCount = D.timeCapsules.filter(function(c){return Date.now() >= c.unlockAt && !c.unlocked}).length;
  var h = '';
  h += '<h2 class="page-title">&#128230; Time Capsule</h2>';
  h += '<div class="card" style="text-align:center;padding:16px;background:linear-gradient(135deg,var(--primary-light),var(--card))">';
  h += '<div style="font-size:36px;margin-bottom:6px">&#128230;</div>';
  h += '<p style="font-size:14px;line-height:1.6;color:var(--text)">Write a letter to your <strong>future self</strong>. Arthur will seal it away and remind you when it\'s time to open it. A message from your past  exactly when you need it most.</p>';
  if (readyCount > 0) {
    h += '<div style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;padding:10px 14px;border-radius:10px;margin:10px 0;font-weight:700;font-size:16px">?? ' + readyCount + ' capsule' + (readyCount>1?'s are':' is') + ' ready to open!</div>';
  }
  h += '<button class="btn btn-primary" onclick="showNewCapsule()" style="margin-top:6px">&#128230; Seal a New Letter</button></div>';
  if (!D.timeCapsules.length) {
    h += '<div class="card"><div class="empty-state">No time capsules yet. Write a letter to your future self  you\'ll thank yourself later.</div></div>';
  } else {
    var sealed = D.timeCapsules.filter(function(c){return Date.now() < c.unlockAt || !c.unlocked});
    var opened = D.timeCapsules.filter(function(c){return c.unlocked});
    if (sealed.length) {
      h += '<h3 style="font-size:14px;font-weight:700;color:var(--muted);margin:12px 0 4px">?? Sealed (' + sealed.length + ')</h3>';
      for (var i=0;i<D.timeCapsules.length;i++) {
        var c = D.timeCapsules[i];
        var isReady = Date.now() >= c.unlockAt && !c.unlocked;
        var isSealed = !c.unlocked;
        if (!isSealed) continue;
        var daysLeft = Math.ceil((c.unlockAt - Date.now()) / 86400000);
        h += '<div class="card capsule-card' + (isReady?' ready':'') + '" onclick="' + (isReady ? 'openCapsuleAnimation('+i+')' : '') + '">';
        h += '<div style="display:flex;align-items:center;gap:10px">';
        h += '<div style="font-size:28px">' + (isReady ? '&#128236;' : '&#128274;') + '</div>';
        h += '<div style="flex:1"><div style="font-weight:600;font-size:14px">' + c.title.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
        h += '<div style="font-size:11px;color:var(--muted)">' + (isReady ? '<span style="color:var(--accent);font-weight:600">Ready to open!</span>' : 'Opens ' + new Date(c.unlockAt).toLocaleDateString() + ' (' + daysLeft + ' days)') + '</div></div>';
        h += '<button class="btn btn-sm btn-danger" onclick="event.stopPropagation();if(confirm(\'Delete this capsule?\')){D.timeCapsules.splice('+i+',1);saveData()}" style="padding:2px 6px;font-size:10px;width:auto">&#10005;</button>';
  h += '</div></div>';
  // Daily Quests
  h += dailyQuestsHTML();
      }
    }
    if (opened.length) {
      h += '<h3 style="font-size:14px;font-weight:700;color:var(--muted);margin:12px 0 4px">&#128220; Opened (' + opened.length + ')</h3>';
      for (var i=0;i<D.timeCapsules.length;i++) {
        var c = D.timeCapsules[i];
        if (!c.unlocked) continue;
        h += '<div class="card capsule-card" onclick="showOpenedCapsule('+i+')">';
        h += '<div style="display:flex;align-items:center;gap:10px">';
        h += '<div style="font-size:28px">&#128220;</div>';
        h += '<div style="flex:1"><div style="font-weight:600;font-size:14px">' + c.title.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div>';
        h += '<div style="font-size:11px;color:var(--muted)">Opened ' + (c.openedAt ? new Date(c.openedAt).toLocaleDateString() : '') + ' &middot; Sealed ' + new Date(c.createdAt).toLocaleDateString() + '</div></div></div></div>';
      }
    }
  }
  return h;
}
function showNewCapsule() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var now = new Date();
  var durations = [
    {label:'1 Month', val:1},
    {label:'3 Months', val:3},
    {label:'6 Months', val:6},
    {label:'1 Year', val:12}
  ];
  var durOpts = '';
  for (var i=0;i<durations.length;i++) {
    durOpts += '<button class="btn btn-sm btn-outline" data-months="'+durations[i].val+'" onclick="[].forEach.call(this.parentNode.children,function(b){b.className=\'btn btn-sm btn-outline\'});this.className=\'btn btn-sm btn-primary\';document.getElementById(\'capsule-dur\').value='+durations[i].val+'" style="flex:1;font-size:11px">'+durations[i].label+'</button>';
  }
  overlay.innerHTML = '<div class="overlay-content" style="max-width:420px"><div style="text-align:center;margin-bottom:10px"><div style="font-size:40px">&#128230;</div><h3 style="font-size:18px;font-weight:700;margin:4px 0">Seal a Letter to Your Future Self</h3><p style="font-size:12px;color:var(--muted)">Arthur will lock this away until the time is right.</p></div><input type="text" id="capsule-title" placeholder="Give your letter a title..." style="margin-bottom:6px"><textarea id="capsule-message" placeholder="Write your message..." style="min-height:100px;margin-bottom:6px"></textarea><div style="font-size:12px;font-weight:600;color:var(--muted);margin-bottom:4px">When should Arthur return this?</div><div style="display:flex;gap:4px;margin-bottom:10px" id="dur-options">'+durOpts+'</div><input type="hidden" id="capsule-dur" value="1"><button class="btn btn-primary" onclick="saveNewCapsule()" style="width:100%">&#128230; Seal It</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px;width:100%">Cancel</button></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){
    var first = overlay.querySelector('#dur-options .btn');
    if (first) first.className = 'btn btn-sm btn-primary';
  }, 50);
}
function saveNewCapsule() {
  var title = document.getElementById('capsule-title');
  var msg = document.getElementById('capsule-message');
  var dur = document.getElementById('capsule-dur');
  if (!title || !title.value.trim()) { alert('Give your letter a title.'); return; }
  if (!msg || !msg.value.trim()) { alert('Write something to your future self.'); return; }
  var months = parseInt(dur ? dur.value : 1);
  var unlock = new Date();
  unlock.setMonth(unlock.getMonth() + months);
  D.timeCapsules.push({
    id: Date.now(),
    title: title.value.trim(),
    message: msg.value.trim(),
    createdAt: Date.now(),
    unlockAt: unlock.getTime(),
    unlocked: false,
    openedAt: null
  });
  saveData();
  var overlay = title.closest('.overlay');
  if (overlay) overlay.remove();
}
function showOpenedCapsule(idx) {
  var c = D.timeCapsules[idx];
  if (!c) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:420px;text-align:center"><div style="font-size:36px">&#128220;</div><h3 style="font-size:18px;font-weight:700;margin:4px 0">' + c.title.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</h3><div style="font-size:11px;color:var(--muted);margin-bottom:8px">Sealed ' + new Date(c.createdAt).toLocaleDateString() + ' &middot; Opened ' + (c.openedAt ? new Date(c.openedAt).toLocaleDateString() : '') + '</div><div class="card" style="text-align:left;font-size:14px;line-height:1.7;white-space:pre-wrap">' + c.message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:10px">Close</button></div>';
  document.body.appendChild(overlay);
}
function openCapsuleAnimation(idx) {
  var c = D.timeCapsules[idx];
  if (!c) return;
  c.unlocked = true;
  c.openedAt = Date.now();
  saveData();
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:440px;text-align:center;padding:24px"><div style="font-size:60px;animation:chestShake 1.5s ease forwards">&#128230;</div><div style="font-size:16px;font-weight:700;color:var(--accent);margin:6px 0">Your Time Capsule Has Arrived!</div><div style="font-size:13px;color:var(--muted);margin-bottom:10px">Arthur kept this safe for you. Here\'s a message from your past.</div><div style="font-size:40px;animation:letterReveal .8s ease .6s both">&#128140;</div><div style="font-weight:700;font-size:18px;margin:6px 0;animation:letterReveal .8s ease .8s both">' + c.title.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</div><div class="card" style="text-align:left;font-size:14px;line-height:1.7;white-space:pre-wrap;animation:letterReveal .8s ease 1s both">' + c.message.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>') + '</div><div style="display:flex;gap:6px;margin-top:12px;animation:letterReveal .6s ease 1.4s both"><div style="flex:1;font-size:12px;color:var(--muted)">Sealed ' + new Date(c.createdAt).toLocaleDateString() + '</div><button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();render()" style="width:auto">&#10003; Received</button></div></div>';
  document.body.appendChild(overlay);
}


var GERTRUDE_QUESTIONS = [
  {q:'What situations or environments make you feel most at risk?',pl:'e.g. parties, certain people, times of day, stress at work'},
  {q:'Who is in your support network that you can reach out to?',pl:'e.g. sponsor, therapist, family member, close friend'},
  {q:'What healthy activities or coping strategies work best for you?',pl:'e.g. exercise, meditation, journaling, calling a friend'},
  {q:'What early warning signs tell you a relapse might be near?',pl:'e.g. irritability, isolation, cravings, sleep changes'},
  {q:'What is your deepest motivation for staying in recovery?',pl:'e.g. family, health, self-respect, future goals'}
];
var GERTRUDE_Q_STEP = 0;
var GERTRUDE_Q_ANSWERS = [];
function startGertrudeQuestions() {
  GERTRUDE_Q_STEP = 0;
  GERTRUDE_Q_ANSWERS = D.safetyAnswers || ['','','','',''];
  renderGertrudeQuestion();
}
function renderGertrudeQuestion() {
  var step = GERTRUDE_Q_STEP;
  if (step >= GERTRUDE_QUESTIONS.length) {
    D.safetyAnswers = GERTRUDE_Q_ANSWERS;
    D._safetyQuestionsDone = true;
    saveData();
    var ov = document.getElementById('gertrude-q-ov');
    if (ov) ov.remove();
    render();
    return;
  }
  var q = GERTRUDE_QUESTIONS[step];
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'gertrude-q-ov';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.innerHTML =
    '<div style="background:var(--card);max-width:380px;width:90%;margin:0 auto;border-radius:20px;padding:28px 20px 20px;text-align:center;animation:siFade .3s ease;position:relative;max-height:85vh;overflow-y:auto">' +
    '<div style="font-size:40px;margin-bottom:4px">&#128105;</div>' +
    '<div style="font-size:13px;font-weight:700;color:var(--rose);margin-bottom:2px">Gertrude asks:</div>' +
    '<div style="font-size:14px;color:var(--text);margin-bottom:14px;line-height:1.5">' + q.q + '</div>' +
    '<textarea id="gertrude-q-input" placeholder="' + q.pl + '" style="min-height:80px">' + (GERTRUDE_Q_ANSWERS[step] || '') + '</textarea>' +
    '<div style="display:flex;gap:6px;justify-content:center;margin:14px 0 10px">' +
    GERTRUDE_QUESTIONS.map(function(_,i){ return '<div style="width:7px;height:7px;border-radius:4px;background:'+(i===step?'#ec4899':'var(--border)')+';transition:.2s"></div>'; }).join('') +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
    (step > 0 ? '<button class="btn btn-sm btn-outline" onclick="GERTRUDE_Q_ANSWERS[GERTRUDE_Q_STEP]=document.getElementById(\'gertrude-q-input\').value;GERTRUDE_Q_STEP--;renderGertrudeQuestion()" style="flex:1">Back</button>' : '') +
    '<button class="btn btn-sm btn-primary" onclick="GERTRUDE_Q_ANSWERS[GERTRUDE_Q_STEP]=document.getElementById(\'gertrude-q-input\').value;GERTRUDE_Q_STEP++;renderGertrudeQuestion()" style="flex:1">' + (step < GERTRUDE_QUESTIONS.length-1 ? 'Next' : 'Done') + '</button>' +
    '</div>' +
    '<button onclick="document.getElementById(\'gertrude-q-ov\').remove()" style="position:absolute;top:12px;right:16px;background:none;border:none;font-size:20px;cursor:pointer;color:var(--muted)">?</button>' +
    '</div>';
  var existing = document.getElementById('gertrude-q-ov');
  if (existing) existing.remove();
  document.body.appendChild(overlay);
}
function safetyHTML() {
  var h = '';
  if (!D._safetyQuestionsDone) {
    h += '<h2 class="page-title">Safety Plan</h2>';
    h += '<div class="card" style="text-align:center;padding:24px">';
    h += '<div style="font-size:48px;margin-bottom:8px">&#128105;</div>';
    h += '<div style="font-weight:700;font-size:16px;margin-bottom:4px">Meet Gertrude</div>';
    h += '<p style="font-size:13px;color:var(--muted);margin-bottom:4px">Gertrude will guide you through building a personalized safety plan. First, let\'s start with a few questions.</p>';
    h += '<button class="btn btn-primary" onclick="startGertrudeQuestions()" style="margin-top:8px">Start with Gertrude</button>';
    h += '</div>';
    return h;
  }
  h += '<h2 class="page-title">My Addiction Targets</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Select what you are working on. Gertrude will create a personalized safety plan for each one.</p>';
  h += '<div class="card" style="border:2px solid var(--primary)"><div style="display:flex;align-items:center;gap:10px;margin-bottom:12px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-gertrude);display:flex;align-items:center;justify-content:center;color:#fff"><svg viewBox="0 0 16 16" width="16" height="16" fill="#fff"><path d="M8 1L3 3.5v5c0 3.5 2 5.5 5 6.5 3-1 5-3 5-6.5v-5z"/><rect x="5" y="6" width="6" height="1" rx=".2"/><line x1="8" y1="6" x2="8" y2="4" stroke="#fff" stroke-width=".8"/></svg></div><div><h3 style="margin:0;font-size:15px">Safety Plans</h3></div></div>';
  var addictions = D.targetAddictions || [];
  if (!addictions.length) {
    h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">Choose one or more addictions you want to work on:</p>';
  }
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
  for (var i=0;i<ADDICTION_TYPES.length;i++) {
    var selected = addictions.indexOf(ADDICTION_TYPES[i]) >= 0;
    h += '<button class="btn btn-sm ' + (selected ? 'btn-primary' : 'btn-outline') + '" onclick="toggleTargetAddiction(\''+ADDICTION_TYPES[i]+'\')" style="font-size:11px;padding:8px">' + (selected ? '&#10003; ' : '') + ADDICTION_TYPES[i] + '</button>';
  }
  h += '</div>';
  if (addictions.length) {
    h += '<button class="btn btn-sm btn-outline" onclick="D.targetAddictions=[];saveData()" style="margin-bottom:8px;width:auto">Clear All</button>';
    for (var a=0;a<addictions.length;a++) {
      var type = addictions[a];
      var sp = SAFETY_PLANS[type] || SAFETY_PLANS['Other'];
      h += '<div style="background:var(--primary-light);padding:12px;border-radius:10px;margin-bottom:8px">';
      h += '<div style="font-weight:700;font-size:13px;margin-bottom:4px">' + type + '</div>';
      h += '<p style="font-size:12px;line-height:1.5;margin-bottom:6px">' + sp.plan + '</p>';
      h += '<div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:3px">Steps:</div>';
      for (var s=0;s<sp.steps.length;s++) {
        h += '<div style="display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px"><span style="width:18px;height:18px;border-radius:9px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;font-size:10px;flex-shrink:0">' + (s+1) + '</span>' + sp.steps[s] + '</div>';
      }
      h += '</div>';
    }
  }
  h += '</div>';
  return h;
}
// ====== ONBOARDING TUTORIAL ======
var ONBOARDING_STEPS = [
  {icon:'\u2694',title:'Your Battle',
   desc:'<div style="margin-bottom:8px;font-size:13px;color:var(--muted)">What would you like to conquer? Choose the battle you\'re ready to fight.</div><div id="onboarding-addiction" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:12px 0">'+ADDICTION_TYPES.map(function(at){return'<button data-v="'+at+'" class="btn btn-sm btn-outline" onclick="document.querySelectorAll(\'#onboarding-addiction button\').forEach(function(b){b.style.background=\'var(--primary-light)\';b.style.color=\'var(--primary-dark)\';b.style.borderColor=\'var(--border)\'});this.style.background=\'var(--grad-primary)\';this.style.color=\'#fff\';this.style.borderColor=\'var(--primary)\';D.addictionType=this.getAttribute(\'data-v\')" style="width:auto;font-size:11px;padding:6px 14px;border-radius:20px;margin:0">'+at+'</button>';}).join('')+'</div>'},
  {icon:'\u2727',title:'Your Goals',
   desc:'<div style="margin-bottom:8px;font-size:13px;color:var(--muted)">What do you want to achieve? Write down your goals.</div><textarea id="onboarding-goals" placeholder="e.g. Be sober for 30 days, rebuild trust with my family, find healthy hobbies..." style="width:100%;padding:10px;border:1px solid var(--border);border-radius:8px;font-size:13px;min-height:80px;margin:8px 0"></textarea>'},
  {icon:'\u265C',title:'Your Kingdom',
   desc:'<div style="margin-bottom:8px;font-size:13px;color:var(--muted)">Choose a kingdom theme that fits your world.</div><div id="onboarding-theme" style="display:flex;gap:12px;justify-content:center;margin:16px 0">'+
     '<button class="btn" onclick="selectOnboardingTheme(\'gothic\',this)" style="flex:1;flex-direction:column;gap:6px;padding:20px 12px;background:var(--primary-light);color:var(--text);border:2px solid var(--border);border-radius:12px;width:auto;font-size:13px"><span style="font-size:36px">\u2726</span><span style="font-weight:700;font-size:15px">Gothic</span><span style="font-size:11px;color:var(--muted)">Dark stone, candlelight, shadows</span></button>'+
     '<button class="btn" onclick="selectOnboardingTheme(\'fantasy\',this)" style="flex:1;flex-direction:column;gap:6px;padding:20px 12px;background:var(--primary-light);color:var(--text);border:2px solid var(--border);border-radius:12px;width:auto;font-size:13px"><span style="font-size:36px">\u265B</span><span style="font-weight:700;font-size:15px">Fantasy</span><span style="font-size:11px;color:var(--muted)">Bright banners, green hills, golden light</span></button>'+
   '</div><div style="margin-top:10px"><input id="onboarding-kingdom-name" placeholder="Name your kingdom (optional)" value="'+(D.kingdomName||'')+'" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;text-align:center"></div>'},
  {icon:'\u269C',title:'Begin Operation Re.Claim',
   desc:'<div style="margin-bottom:8px;font-size:13px;color:var(--muted)">You\'ve chosen your battle, set your goals, and claimed your kingdom. The realm is ready for you.</div><div style="margin-top:16px;padding:12px;background:var(--primary-light);border-radius:10px;font-size:12px;color:var(--text);line-height:1.6">"The crown is heavy, but you were made for this. Every day you show up, the kingdom grows stronger. Let\u2019s begin."</div><div style="margin-top:8px;font-size:11px;color:var(--muted);text-align:center">Three friends will guide you:<br>Arthur \u2022 Gertrude \u2022 Oswald</div>'},
];
var ONBOARDING_STEP = 0;
function showOnboarding() {
  ONBOARDING_STEP = 0;
  renderOnboardingStep();
}
function selectOnboardingTheme(theme, btn) {
  var all = btn.parentElement.querySelectorAll('button');
  all.forEach(function(b){ b.style.background='var(--primary-light)'; b.style.color='var(--text)'; b.style.borderColor='var(--border)'; });
  btn.style.background='var(--grad-primary)'; btn.style.color='#fff'; btn.style.borderColor='var(--primary)';
  D.theme = theme;
  if (theme === 'gothic') { D.darkMode = true; document.body.classList.add('dark'); }
  else { D.darkMode = false; document.body.classList.remove('dark'); }
  applyTheme();
}

function renderOnboardingStep() {
  var existing = document.getElementById('onboarding-ov');
  if (existing) existing.remove();
  var s = ONBOARDING_STEPS[ONBOARDING_STEP];
  if (!s) {
    D._onboardingDone = true;
    D.sobriety.addictionType = D.addictionType || 'Other';
    D.sobriety.startDate = Date.now();
    pg = 'home'; _pageCache = {};
    saveData(); render();
    setTimeout(startSoberTimer, 200);
    return;
  }
  var isLast = ONBOARDING_STEP >= ONBOARDING_STEPS.length - 1;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'onboarding-ov';
  overlay.style.background = 'rgba(0,0,0,0.6)';
  overlay.innerHTML =
    '<div style="background:var(--card);max-width:380px;width:92%;margin:0 auto;border-radius:20px;padding:32px 24px 24px;text-align:center;animation:siFade .3s ease;position:relative;border:2px solid var(--primary-light);box-shadow:0 0 0 1px var(--border),0 16px 64px rgba(0,0,0,.3)">' +
    '<div style="position:absolute;top:-1px;left:20px;right:20px;height:3px;background:linear-gradient(90deg,transparent,var(--accent),transparent);border-radius:2px"></div>' +
    '<div style="font-size:42px;margin-bottom:8px;font-family:MedievalSharp,serif">' + s.icon + '</div>' +
    '<div style="font-size:20px;font-weight:700;margin-bottom:12px;color:var(--primary);font-family:MedievalSharp,serif">' + s.title + '</div>' +
    '<div style="font-size:13px;color:var(--text);line-height:1.6;margin-bottom:16px;padding:0 4px">' + s.desc + '</div>' +
    '<div style="display:flex;justify-content:center;gap:5px;margin-bottom:16px">' +
      ONBOARDING_STEPS.map(function(_,i){ return '<div style="width:7px;height:7px;border-radius:50%;background:'+(i===ONBOARDING_STEP?'var(--accent)':'var(--border)')+'"></div>'; }).join('') +
    '</div>' +
    '<div style="display:flex;gap:8px">' +
      (ONBOARDING_STEP > 0 ? '<button class="btn btn-sm btn-outline" onclick="ONBOARDING_STEP--;renderOnboardingStep()" style="flex:1">\u2190 Back</button>' : '') +
      '<button class="btn btn-sm btn-primary" onclick="advanceOnboarding()" style="flex:1">'+ (isLast ? '\u269C Begin Operation Re.Claim' : 'Next \u2192') +'</button>' +
    '</div>' +
    '<button onclick="closeOnboarding()" style="position:absolute;top:10px;right:14px;background:none;border:none;font-size:18px;cursor:pointer;color:var(--muted);font-family:serif">\u2715</button>' +
    '</div>';
  document.body.appendChild(overlay);
}

function closeOnboarding() {
  var el = document.getElementById('onboarding-ov');
  if (el) el.remove();
  if (!D.sobriety.startDate) { pg = 'home'; _pageCache = {}; render(); }
}

function advanceOnboarding() {
  if (ONBOARDING_STEP === 0 && !D.addictionType) { alert('Pick an addiction to conquer.'); return; }
  if (ONBOARDING_STEP === 1) {
    var goalsEl = document.getElementById('onboarding-goals');
    D.goals = (goalsEl ? goalsEl.value : '').trim();
    if (!D.goals) { alert('Set at least one goal to focus on.'); return; }
  }
  if (ONBOARDING_STEP === 2) {
    if (!D.theme) { alert('Choose a kingdom theme.'); return; }
    var nameEl = document.getElementById('onboarding-kingdom-name');
    if (nameEl && nameEl.value.trim()) D.kingdomName = nameEl.value.trim();
  }
  ONBOARDING_STEP++;
  renderOnboardingStep();
}
function render() {
  if (LOCK_ENABLED) return;
  // Stop live timer when navigating
  if (SOBER_TIMER_ID) { clearInterval(SOBER_TIMER_ID); SOBER_TIMER_ID = null; }
  var app = document.getElementById('app');
  if (!app) return;
  var pages = {
    home: homeHTML, track: trackHTML, care: careHTML, reflect: reflectHTML,
    more: moreHTML, journal: journalHTML, library: libraryHTML, music: musicHTML,
    reports: reportsHTML, buddy: buddyHTML, coping: copingHTML,
    programs: programsHTML, screener: screenerHTML, assessment: assessmentHTML, profile: profileHTML,
    calendar: calendarHTML, safety: safetyHTML,
    reminders: remindersHTML, meetings: meetingsHTML,
    insights: insightsHTML, accountability: accountabilityHTML, relapseplan: relapsePlanHTML, relapserescue: relapseRescueHTML, timecapsule: timeCapsuleHTML, chivalrycode: chivalryCodeHTML, relapsegraveyard: relapseGraveyardHTML, royalpardon: royalPardonHTML, warchest: warchestHTML, shop: shopHTML, kingsledger: kingsLedgerHTML, achievements: achievementsHTML, alliances: alliancesHTML,
  };
  if (!_pageCache[pg]) {
    var fn = pages[pg];
    try { _pageCache[pg] = fn ? fn() : (pg = 'home', homeHTML()); } catch(e) { _pageCache[pg] = '<div class="card"><h3>Could not load page</h3><p style="font-size:12px;color:var(--muted)">' + e.message + '</p></div>'; }
  }
  var curPg = pg;
  function doRender() {
    if (pg !== curPg) return;
    app.innerHTML = _pageCache[curPg];
    if (curPg === 'assessment') { var qq = document.getElementById('quiz'); if (qq) renderQuizQuestion(0); }
    [].forEach.call(document.querySelectorAll('.tab'),function(t){
      var tp = t.getAttribute('data-page');
      t.classList.toggle('active', tp === curPg || (tp === 'more' && MORE_SUB_PAGES.indexOf(curPg) !== -1) || (tp === 'reflect' && REFLECT_SUB_PAGES.indexOf(curPg) !== -1) || (tp === 'care' && CARE_SUB_PAGES.indexOf(curPg) !== -1));
    });
    document.getElementById('tabs').style.display = 'flex';
    var tb = document.querySelector('.top-bar');
    if (tb) tb.style.display = 'flex';
    applyTheme();
    updateTabLabels();
    // Update regnal date in header
    var rh = document.getElementById('regnal-header');
    if (rh) rh.textContent = D.sobriety.startDate ? regnalDate() : 'Begin your reign';
    var tbEl = document.getElementById('tools-badge');
    if (tbEl && D.timeCapsules) {
      var ready = D.timeCapsules.filter(function(c){return Date.now() >= c.unlockAt && !c.unlocked}).length;
      tbEl.textContent = ready;
      tbEl.style.display = ready ? 'block' : 'none';
    }
    if (curPg === 'home') { setTimeout(function(){ checkMilestone(); checkAchievements(); checkPostCrisis(); if (D.sobriety.startDate) startSoberTimer(); }, 500); }
    app.style.opacity = '1';
    app.style.transform = 'translateY(0)';
    app._renderTO = null;
  }
  if (app._renderTO) { clearTimeout(app._renderTO); app._renderTO = null; }
  if (app.innerHTML === '') {
    doRender();
  } else {
    app.style.opacity = '0';
    app.style.transform = 'translateY(6px)';
    app._renderTO = setTimeout(doRender, 170);
  }
}

function animateCloseOverlay(el) {
  if (!el || el.classList.contains('fade-out')) return;
  el.classList.add('fade-out');
  setTimeout(function(){ if (el.parentNode) el.remove(); }, 150);
}

function goTo(p) {
  [].forEach.call(document.querySelectorAll('[id$="-ov"],.overlay'),function(el){animateCloseOverlay(el)});
  pg = p;
  render();
}

document.getElementById('tabs').addEventListener('click', function(e) {
  var tab = e.target.closest('.tab');
  if (tab) {
    [].forEach.call(document.querySelectorAll('.overlay'),function(el){animateCloseOverlay(el)});
    var tp = tab.getAttribute('data-page');
    subPg = '';
    if (tp === 'more' && MORE_SUB_PAGES.indexOf(pg) !== -1) { pg = 'more'; render(); return; }
    if (tp === 'reflect' && REFLECT_SUB_PAGES.indexOf(pg) !== -1) { pg = 'reflect'; render(); return; }
    if (tp === 'care' && CARE_SUB_PAGES.indexOf(pg) !== -1) { pg = 'care'; render(); return; }
    pg = tp;
    render();
  }
});

// ====== PWA INSTALL ======
var _installPrompt = null;
window.addEventListener('beforeinstallprompt', function(e) { e.preventDefault(); _installPrompt = e; });
function promptInstall() {
  if (_installPrompt) { _installPrompt.prompt(); _installPrompt.userChoice.then(function(){ _installPrompt = null; }); return; }
  var isSafari = /iphone|ipad|ipod/i.test(navigator.userAgent) && /safari/i.test(navigator.userAgent);
  if (isSafari) {
    alert(t('On iPhone: Tap the Share button (square with arrow) at the bottom of Safari, then scroll down and tap "Add to Home Screen".\n\nName it "Re.Claim" and tap "Add" in the top right.'));
  } else {
    alert(t('Open this page in your browser menu and select "Add to Home Screen" or "Install App".'));
  }
}
// ====== INIT ======
applyTheme();
var connEl = document.getElementById('conn-status');
function updateConnStatus() {
  if (!connEl) return;
  if (!navigator.onLine) { connEl.style.display = 'block'; return; }
  if (typeof DB !== 'undefined' && DB) {
    try { DB.enableNetwork().then(function(){ connEl.style.display = 'none'; }).catch(function(){ connEl.style.display = 'block'; }); } catch(e) { connEl.style.display = 'none'; }
  } else { connEl.style.display = 'none'; }
}
window.addEventListener('online', updateConnStatus);
window.addEventListener('offline', function(){ if (connEl) connEl.style.display = 'block'; });
if (!navigator.onLine && connEl) connEl.style.display = 'block';
setTimeout(function(){ if (!SONG_POOL_GENERATED) populateSongPool(); }, 2000);
if (AUTH_USER && !isLockSet()) {
  document.body.classList.add('logged-in');
  try { render(); } catch(e) { document.getElementById('app').innerHTML = '<div class="card"><h3>Something went wrong</h3><p style="font-size:12px;color:var(--muted)">' + e.message + '</p></div>'; }
  setTimeout(updateVillage, 100);
  loadFromFirestore(function(cloudData) {
    if (cloudData && cloudData.joinDate) { D = cloudData; saveData(); }
  });
} else {
  showSignIn();
}
