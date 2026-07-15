// ====== SOBRIETY / PLANT ======
function soberDays() {
  if (!D.sobriety.startDate) return 0;
  var start = new Date(D.sobriety.startDate);
  var now = new Date();
  var days = Math.floor((now - start) / 86400000);
  if (D.sobriety.relapseDates) {
    for (var i=0;i<D.sobriety.relapseDates.length;i++) {
      var rd = new Date(D.sobriety.relapseDates[i]);
      if (rd > start) {
        var lost = Math.floor((now - rd) / 86400000);
        days = Math.min(days, lost);
      }
    }
  }
  return Math.max(0, days);
}

function regnalDate(rawDate) {
  var d = rawDate ? new Date(rawDate) : new Date();
  if (!D.sobriety.startDate) return d.toLocaleDateString();
  var start = new Date(D.sobriety.startDate);
  var reignMs = d - start;
  if (reignMs < 0) return d.toLocaleDateString();
  var reignYear = Math.floor(reignMs / 31557600000) + 1;
  var suffixes = ['th','st','nd','rd','th','th','th','th','th','th'];
  var suffix = reignYear % 100 >= 11 && reignYear % 100 <= 13 ? 'th' : suffixes[reignYear % 10] || 'th';
  var months = ['Ã†rra Ä Ä“ola','Solmonath','Hrethmonath','Eosturmonath','Thrimilchi','Ã†rra-LiÃ°a','Ã†ftera-LiÃ°a','Weodmonath','Halegmonath','Winterfilleth','Blodmonath','Ã†ftera Ä Ä“ola'];
  var mName = months[d.getMonth()];
  var day = d.getDate();
  var daySuffix = suffixes[day % 10] || 'th';
  if (day >= 11 && day <= 13) daySuffix = 'th';
  return day + daySuffix + ' of ' + mName + ', ' + reignYear + suffix + ' Year of Your Reign';
}

function plantStage() {
  var d = soberDays();
  if (d <= 0) return 0;
  if (d < 3) return 1;
  if (d < 7) return 2;
  if (d < 14) return 3;
  if (d < 30) return 4;
  if (d < 90) return 5;
  return 6;
}

function plantStageInfo() {
  return [
    {emoji:'', name:'Seed', desc:'Plant your seed of change', h:20},
    {emoji:'', name:'Sprout', desc:'New growth is appearing', h:40},
    {emoji:'', name:'Seedling', desc:'Roots are getting stronger', h:60},
    {emoji:'', name:'Growing', desc:'You are blooming', h:80},
    {emoji:'', name:'Young Tree', desc:'Building resilience', h:110},
    {emoji:'', name:'Strong Tree', desc:'Deep roots, steady growth', h:140},
    {emoji:'', name:'In Bloom', desc:'Thriving and flowering', h:170}
  ];
}

// ====== SOBER LEVEL-UP ======
var SOBER_LEVELS = [
  {level:1, minDays:0, title:'Peasant', icon:'\u2619', desc:'The journey begins'},
  {level:2, minDays:1, title:'Page', icon:'\u2726', desc:'Learning the ways of the court'},
  {level:3, minDays:7, title:'Squire', icon:'\u2694', desc:'Proving your worth'},
  {level:4, minDays:14, title:'Knight Errant', icon:'\u2720', desc:'Riding toward a cause'},
  {level:5, minDays:30, title:'Knight', icon:'\u269C', desc:'Sworn to the realm'},
  {level:6, minDays:60, title:'Knight of the Realm', icon:'\u265B', desc:'Honored across the land'},
  {level:7, minDays:90, title:'Baron', icon:'\u265A', desc:'A lord of the kingdom'},
  {level:8, minDays:180, title:'Viscount', icon:'\u265C', desc:'A trusted advisor'},
  {level:9, minDays:270, title:'Earl', icon:'\u2766', desc:'Noble and steadfast'},
  {level:10, minDays:365, title:'Duke', icon:'\u2727', desc:'A pillar of the realm'},
  {level:11, minDays:730, title:'Prince', icon:'\u265D', desc:'Heir to the throne'},
  {level:12, minDays:1000, title:'King', icon:'\u2629', desc:'Long may you reign'},
  {level:13, minDays:1825, title:'Emperor', icon:'\u265E', desc:'Five years â€” an immortal legend'}
];

// ====== MEDIEVAL ACHIEVEMENTS ======
var ACHIEVEMENTS = [
  {id:'first_step',     icon:'\u2619',  title:'First Step',       desc:'Stay sober for 1 day',           check:function(d){return d>=1}},
  {id:'week_warrior',   icon:'\u2694',  title:'Week Warrior',     desc:'Stay sober for 7 days',          check:function(d){return d>=7}},
  {id:'fortnight',      icon:'\u2720',  title:'Fortnight Fortress',desc:'Stay sober for 14 days',         check:function(d){return d>=14}},
  {id:'moons_silver',   icon:'\u269C',  title:'Silver Moon',      desc:'Stay sober for 30 days',         check:function(d){return d>=30}},
  {id:'moons_golden',   icon:'\u265B',  title:'Golden Moon',      desc:'Stay sober for 60 days',         check:function(d){return d>=60}},
  {id:'season_king',    icon:'\u265C',  title:'Seasoned King',    desc:'Stay sober for 90 days',         check:function(d){return d>=90}},
  {id:'half_crown',     icon:'\u2766',  title:'Half a Crown',     desc:'Stay sober for 180 days',        check:function(d){return d>=180}},
  {id:'year_ring',      icon:'\u2727',  title:'Year Ring',        desc:'Stay sober for 1 year',          check:function(d){return d>=365}},
  {id:'iron_throne',    icon:'\u265D',  title:'Iron Throne',      desc:'Stay sober for 2 years',         check:function(d){return d>=730}},
  {id:'decade_early',   icon:'\u2629',  title:'Millennium',       desc:'Stay sober for 1000 days',       check:function(d){return d>=1000}},
  {id:'scribe',         icon:'\u270D',  title:'Royal Scribe',     desc:'Write 10 journal entries',       check:function(d,j){return j>=10}},
  {id:'chronicler',     icon:'\u270D',  title:'Chronicler',       desc:'Write 50 journal entries',       check:function(d,j){return j>=50}},
  {id:'shield_bearer',  icon:'\u265A',  title:'Shield Bearer',    desc:'Earn 3 shields',                 check:function(d,j,s){return s>=3}},
  {id:'quest_knight',   icon:'\u269C',  title:'Quest Knight',     desc:'Complete 10 quests',             check:function(d,j,s,q){return q>=10}},
  {id:'comrade',        icon:'\u2726',  title:'True Comrade',     desc:'Pair with a buddy',              check:function(){return D.buddyPair && D.buddyPair.partnerId}},
  {id:'stone_wall',     icon:'\u265E',  title:'Stone Wall',       desc:'Reach castle level 5',           check:function(d){return kingdomLevel(d)>=5}},
  {id:'dragon_lord',    icon:'\u265B',  title:'Dragon Lord',      desc:'Reach castle level 15',          check:function(d){return kingdomLevel(d)>=15}},
  {id:'first_entry',    icon:'\u270D',  title:'First Scroll',     desc:'Write your first journal entry', check:function(d,j){return j>=1}},
  {id:'relapse_rise',   icon:'\u2629',  title:'Phoenix',          desc:'Come back after a relapse',      check:function(){return D.relapseHistory && D.relapseHistory.length > 0}},
  {id:'crown_jewel',    icon:'\u2727',  title:'Crown Jewel',      desc:'Unlock all achievements',        check:function(d,j,s,q){var all=ACHIEVEMENTS.map(function(a){return a.id});return all.every(function(i){return(D.achievements||[]).indexOf(i)>=0})}},
];

function soberLevel() {
  var days = soberDays();
  for (var i = SOBER_LEVELS.length - 1; i >= 0; i--) {
    if (days >= SOBER_LEVELS[i].minDays) return SOBER_LEVELS[i];
  }
  return SOBER_LEVELS[0];
}

function soberLevelProgress() {
  var days = soberDays();
  var current = soberLevel();
  var idx = SOBER_LEVELS.indexOf(current);
  if (idx >= SOBER_LEVELS.length - 1) return 100;
  var next = SOBER_LEVELS[idx + 1];
  var range = next.minDays - current.minDays;
  var progress = days - current.minDays;
  return Math.min(100, Math.round((progress / range) * 100));
}

function soberLevelHTML() {
  var level = soberLevel();
  var progress = soberLevelProgress();
  var days = soberDays();
  var next = '';
  var idx = SOBER_LEVELS.indexOf(level);
  if (idx < SOBER_LEVELS.length - 1) {
    var n = SOBER_LEVELS[idx + 1];
    next = n.minDays - days + ' days until ' + n.title;
  } else {
    next = 'Maximum level reached!';
  }
  return '<div class="card" style="text-align:center"><div style="font-size:36px;margin-bottom:4px">' + level.icon + '</div><div style="font-size:20px;font-weight:800;color:var(--primary)">Level ' + level.level + ': ' + level.title + '</div><div style="font-size:12px;color:var(--muted);margin-bottom:8px">' + level.desc + '</div><div class="progress-bar" style="max-width:200px;margin:0 auto"><div class="fill" style="width:' + progress + '%"></div></div><div style="font-size:11px;color:var(--muted);margin-top:4px">' + next + ' &middot; ' + days + ' days sober</div></div>';
}

function plantStageHTML(stage, scale) {
  var s = Math.min(Math.max(stage,0),6);
  scale = scale || 1;
  if (s === 0) return '<div class="seed" style="margin-top:'+(10*scale)+'px;width:'+(14*scale)+'px;height:'+(18*scale)+'px"></div>';
  var parts = [];
  var stemH = s * 18 * scale;
  var stemW = (4+s) * scale;
  parts.push('<div class="stem" style="width:'+stemW+'px;height:'+stemH+'px"></div>');
  if (s >= 2) {
    var leafY = (stemH-10*scale);
    parts.push('<div class="leaf leaf-l'+(s<3?' leaf-sm':'')+'" style="top:'+leafY+'px;width:'+(24*scale)+'px;height:'+(12*scale)+'px;left:-'+(14*scale)+'px"></div>');
    parts.push('<div class="leaf leaf-r'+(s<3?' leaf-sm':'')+'" style="top:'+leafY+'px;width:'+(24*scale)+'px;height:'+(12*scale)+'px;right:-'+(14*scale)+'px"></div>');
  }
  if (s >= 3) {
    var leafY2 = (stemH-24*scale);
    parts.push('<div class="leaf leaf-l leaf-sm" style="top:'+leafY2+'px;width:'+(18*scale)+'px;height:'+(9*scale)+'px;left:-'+(14*scale)+'px"></div>');
    parts.push('<div class="leaf leaf-r leaf-sm" style="top:'+leafY2+'px;width:'+(18*scale)+'px;height:'+(9*scale)+'px;right:-'+(14*scale)+'px"></div>');
  }
  if (s >= 4) parts.push('<div class="flower" style="margin-top:-'+(20*scale)+'px;width:'+(20*scale)+'px;height:'+(20*scale)+'px"><div class="flower-inner" style="width:'+(10*scale)+'px;height:'+(10*scale)+'px;top:'+(5*scale)+'px;left:'+(5*scale)+'px"></div></div>');
  if (s >= 5) parts.push('<div class="fruit" style="top:'+(stemH-14*scale)+'px;left:-'+(8*scale)+'px;width:'+(12*scale)+'px;height:'+(15*scale)+'px"></div>');
  if (s >= 6) parts.push('<div class="fruit" style="top:'+(stemH-30*scale)+'px;right:-'+(8*scale)+'px;width:'+(12*scale)+'px;height:'+(15*scale)+'px"></div>');
  return parts.join('');
}

function soberElapsed() {
  if (!D.sobriety.startDate) return null;
  var start = new Date(D.sobriety.startDate);
  var now = new Date();
  var diff = Math.max(0, now - start);
  var totalSeconds = Math.floor(diff / 1000);
  var seconds = totalSeconds % 60;
  var totalMinutes = Math.floor(totalSeconds / 60);
  var minutes = totalMinutes % 60;
  var totalHours = Math.floor(totalMinutes / 60);
  var hours = totalHours % 24;
  var totalDays = Math.floor(totalHours / 24);
  // Approximate months/years from totalDays
  var years = Math.floor(totalDays / 365);
  var months = Math.floor((totalDays % 365) / 30);
  var days = totalDays - (years * 365) - (months * 30);
  return { years: years, months: months, days: days, hours: hours, minutes: minutes, seconds: seconds, totalDays: totalDays };
}

var SOBER_TIMER_ID = null;
var SOBER_TIMEOUT_ID = null;

function soberTimerHTML() {
  var el = soberElapsed();
  if (!el) return '';
  var parts = [];
  if (el.years > 0) parts.push(el.years + 'y');
  if (el.months > 0 || el.years > 0) parts.push(el.months + 'mo');
  parts.push(el.days + 'd');
  parts.push(String(el.hours).padStart(2,'0') + 'h');
  parts.push(String(el.minutes).padStart(2,'0') + 'm');
  parts.push(String(el.seconds).padStart(2,'0') + 's');
  return '<div id="sober-timer" style="background:var(--primary);border-radius:14px;padding:14px 16px;margin:8px 0;text-align:center;color:#fff;box-shadow:0 2px 12px rgba(0,0,0,.15)"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px"><div style="font-size:11px;opacity:.8;font-weight:500;letter-spacing:1px;text-transform:uppercase">&#128081; Time Since Last Reset</div><div style="display:flex;gap:4px"><button onclick="event.stopPropagation();resetSoberTimer()" title="Reset timer" style="background:none;border:none;color:rgba(255,255,255,.7);cursor:pointer;font-size:14px;padding:0 2px;line-height:1">&#8635;</button><span onclick="goTo(\'royalpardon\')" title="Royal Pardon" style="cursor:pointer;font-size:13px;opacity:.7">&#128081;</span></div></div><div style="font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:2px">' + parts.join(' ') + '</div></div>';
}

function startSoberTimer() {
  if (SOBER_TIMER_ID) { clearInterval(SOBER_TIMER_ID); SOBER_TIMER_ID = null; }
  renderSoberTimer();
  SOBER_TIMER_ID = setInterval(function(){
    if (!document.getElementById('sober-timer')) {
      if (SOBER_TIMER_ID) { clearInterval(SOBER_TIMER_ID); SOBER_TIMER_ID = null; }
      return;
    }
    renderSoberTimer();
  }, 1000);
}

function renderSoberTimer() {
  var el = document.getElementById('sober-timer');
  if (!el) return;
  var html = soberTimerHTML();
  if (html) el.innerHTML = html;
}

function plantHTML() {
  var stage = Math.min(plantStage(), 6);
  var info = plantStageInfo()[stage];
  var days = soberDays();
  var isActive = D.sobriety.startDate ? true : false;
  var h = '<div class="card" style="text-align:center">';
  h += '<h3>Sobriety Tracker'+(isActive && D.sobriety.addictionType?' &mdash; '+D.sobriety.addictionType:'')+'</h3>';
  h += '<div class="plant-container" style="min-height:280px;padding-top:20px">';
  var scale = 1.2;
  h += '<div style="transform:scale(' + scale + ');transform-origin:bottom center;display:inline-block">';
  h += '<div style="display:flex;flex-direction:column;align-items:center">';
  // Plant stem/seed â€” only show if active
  if (isActive) {
    var plantH = (stage===0?24:(stage*18+30));
    h += '<div class="plant-grow'+(stage>=6?' glow':'')+'" style="width:'+(60*scale)+'px;height:'+(plantH*scale)+'px">';
    h += plantStageHTML(stage, scale);
    h += '</div>';
  } else {
    h += '<div style="height:20px"></div>';
  }
  // Pot: rim on top, soil inside, pot body (always visible)
  h += '<div style="position:relative;width:'+(130*scale)+'px;margin-top:-'+(isActive?(stage===0?2:4):2)+'px">';
  h += '<div class="plant-pot-rim" style="width:'+(130*scale)+'px;height:'+(10*scale)+'px;margin:0 auto"></div>';
  h += '<div class="plant-pot" style="width:'+(120*scale)+'px;height:'+(50*scale)+'px;border-radius:0 0 '+(16*scale)+'px '+(16*scale)+'px;margin:0 auto;position:relative">';
  h += '<div class="plant-soil" style="position:absolute;top:0;left:'+(2*scale)+'px;width:'+(116*scale)+'px;height:'+(18*scale)+'px;z-index:2"></div>';
  if (!isActive) {
    // Seed sitting in the soil
    h += '<div class="seed" style="position:absolute;top:-'+(8*scale)+'px;left:50%;margin-left:-'+(7*scale)+'px;width:'+(14*scale)+'px;height:'+(18*scale)+'px;z-index:3"></div>';
  }
  h += '</div>';
  h += '</div>';
  h += '</div>';
  h += '</div>';
  // Info and timer
  if (isActive) {
    h += '<div style="margin-top:4px"><strong style="font-size:22px;color:var(--primary)">'+days+'</strong><span style="font-size:13px;color:var(--text-light)"> days sober</span></div>';
    h += '<div style="font-size:13px;color:var(--text-light)">'+info.name+' &mdash; '+info.desc+'</div>';
    h += soberTimerHTML();
  } else {
    h += '<div style="margin-top:8px;font-size:14px;color:var(--muted)">Ready to begin your journey?</div>';
  }
  if (SOBER_TIMER_ID) { clearInterval(SOBER_TIMER_ID); SOBER_TIMER_ID = null; }
  if (SOBER_TIMEOUT_ID) { clearTimeout(SOBER_TIMEOUT_ID); SOBER_TIMEOUT_ID = null; }
  h += '</div>';
  // Buttons
  if (!isActive) {
    h += '<button class="btn btn-primary btn-sm" onclick="showOnboarding()" style="margin-top:4px">Track Sobriety</button>';
  } else {
    h += '<div style="display:flex;gap:6px;margin-top:4px">';
    h += '<button class="btn btn-outline btn-sm" onclick="recordRelapse()" style="flex:1">Record Relapse</button>';
    h += '<button class="btn btn-danger btn-sm" onclick="endSobriety()" style="flex:1">End Sobriety</button>';
    h += '</div>';
  }
  h += '</div>';
  if (isActive) { SOBER_TIMEOUT_ID = setTimeout(startSoberTimer, 100); }
  return h;
}


function recordRelapse() {
  if (!confirm(t('This records a relapse date. Remember: recovery is not linear. Every day is a fresh start.'))) return;
  if (!D.sobriety.relapseDates) D.sobriety.relapseDates = [];
  var w = getWarchest();
  // Shop streak shield: consume one to prevent streak reset
  if (w.boostData.streak > 0) {
    w.boostData.streak--;
    w.lastDayCounted = soberDays();
    w.lastEntryCount = (D.journal || []).length;
    saveData();
    setTimeout(kingdomDamage, 150);
    setTimeout(villageDamage, 200);
    showRelapseRecovery(true);
    return;
  }
  D.sobriety.relapseDates.push(Date.now());
  D.warchest = D.warchest || { schillings: 0, shields: 0, lastDayCounted: 0, lastEntryCount: 0 };
  D.warchest.shields = (D.warchest.shields || 0) + 1;
  D.warchest.lastDayCounted = soberDays();
  D.warchest.lastEntryCount = (D.journal || []).length;
  saveData();
  // Auto-grant Royal Pardon
  autoGrantPardon();
  setTimeout(kingdomDamage, 150);
  setTimeout(villageDamage, 200);
  showRelapseRecovery();
}

function autoGrantPardon() {
  if (!D.royalPardons) D.royalPardons = [];
  var relapseDate = D.sobriety.relapseDates && D.sobriety.relapseDates.length
    ? D.sobriety.relapseDates[D.sobriety.relapseDates.length - 1] : Date.now();
  var dateStr = new Date(relapseDate).toISOString().split('T')[0];
  var hasPardon = D.royalPardons.some(function(p) { return p.date === dateStr && p.isAutoPardon; });
  if (hasPardon) return;
  D.royalPardons.push({
    date: dateStr,
    forgive: 'I forgive myself for this setback. I am human, and recovery is not a straight line.',
    commit: 'I commit to showing up for myself, learning from this, and continuing my journey with courage.',
    grantedAt: Date.now(),
    isAutoPardon: true
  });
  saveData();
}

function showRelapseRecovery(protectedByBoost) {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var shieldMsg = '';
  if (protectedByBoost) {
    shieldMsg = '<div style="font-size:14px;color:var(--gold);margin-bottom:6px;background:var(--primary-light);border-radius:8px;padding:8px">&#128737; <strong>Streak Shield absorbed the relapse!</strong> Your sober streak is fully preserved.</div>';
  } else {
    var shields = (D.warchest && D.warchest.shields) || 0;
    shieldMsg = shields > 0 ? '<div style="font-size:13px;color:var(--gold);margin-bottom:6px">&#128737; Your streak is protected by ' + shields + ' shield' + (shields!==1?'s':'') + '</div>' : '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">&#128737; Your next relapse will earn a shield to protect your streak</div>';
  }
  var h = '<div class="overlay-content" style="max-width:480px"><div style="text-align:center;margin-bottom:12px"><div style="font-size:40px;margin-bottom:4px">&#128737;</div><h3 style="font-size:20px;font-weight:700;color:var(--danger);margin:0">Relapse Recorded</h3><p style="font-size:13px;color:var(--muted);margin-top:4px">' + (protectedByBoost ? 'Your streak continues â€” a Streak Shield protected it' : 'Your streak continues â€” a shield absorbed the impact') + '</p>' + shieldMsg + '</div>';
  // Next 1 hour
  h += '<div class="card" style="border-left:4px solid var(--danger);padding:12px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#9200; Next 1 Hour</div><div style="font-size:13px;color:var(--text);line-height:1.5">Breathe. You are not back to square one â€” you have all the tools you\'ve built. Drink water, wash your face, step outside. Call or text your comrade or a crisis line if you need to talk. Delete the means of access. Write one sentence about what happened without judgment.</div></div>';
  // Next 24 hours
  h += '<div class="card" style="border-left:4px solid var(--accent);padding:12px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#128204; Next 24 Hours</div><div style="font-size:13px;color:var(--text);line-height:1.5">Identify the trigger â€” what happened right before? Log it in your journal. Restore your environment (remove triggers). Re-commit to your sobriety timer. Reach out to your comrade or a support group. Read your safety plan from Arthur. Be kind to yourself  shame fuels the cycle, honesty breaks it.</div></div>';
  // Next week
  h += '<div class="card" style="border-left:4px solid var(--primary);padding:12px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#128198; Next 1 Week</div><div style="font-size:13px;color:var(--text);line-height:1.5">Review what led to the relapse and update your trigger list. Strengthen your daily routine  add one extra check-in or coping practice. Forgive yourself fully. Relapse is part of recovery for many people. What matters is what you do next. You are still on the path.</div></div>';
  // Auto-pardon certificate
  if (!protectedByBoost && D.royalPardons && D.royalPardons.length) {
    var lastPardon = D.royalPardons[D.royalPardons.length - 1];
    h += '<div style="background:var(--card);border:2px solid var(--gold);border-radius:16px;padding:14px;margin-top:8px;text-align:center;box-shadow:0 2px 12px rgba(138,122,106,.15)">';
    h += '<div style="font-size:28px;margin-bottom:2px">&#128081;</div>';
    h += '<div style="font-size:12px;font-weight:800;color:var(--primary);letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">Royal Pardon</div>';
    h += '<div style="font-size:9px;color:var(--gold);margin-bottom:6px;font-style:italic">"By the crown I carry and the realm we are building â€” you are pardoned. Rise and begin again with my blessing."</div>';
    h += '<div style="border-top:1px solid var(--gold);border-bottom:1px solid var(--gold);padding:6px 4px;margin-bottom:4px">';
    h += '<div style="font-size:11px;line-height:1.4;margin-bottom:4px"><em>"' + safe(lastPardon.forgive) + '"</em></div>';
    if (lastPardon.commit) h += '<div style="font-size:10px;color:var(--text-light)">&#9876; <strong>Vow:</strong> ' + safe(lastPardon.commit) + '</div>';
    h += '</div>';
    h += '<div style="margin-top:4px">' + waxSealSVG(28) + '</div>';
    h += '<div style="font-size:8px;color:var(--muted);letter-spacing:2px;margin-top:1px">SEAL OF KING ARTHUR</div>';
    h += '</div>';
  }
  h += '<div style="display:flex;gap:6px;justify-content:center;margin-top:10px;flex-wrap:wrap"><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove();goTo(\'relapsegraveyard\')">&#9904; Relapse Graveyard</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()">I\'ve Got This</button></div></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

var END_SOBRIETY_ACTIVITIES = [
  'Take a 5-minute walk and notice 3 things you see, hear, and feel.',
  'Write down 3 things you are grateful for right now.',
  'Stretch your arms, neck, and shoulders for 2 minutes.',
  'Make a cup of tea and drink it slowly without any screens.',
  'Take 10 deep breaths  inhale for 4, hold for 4, exhale for 4.',
  'Step outside and feel the sun or breeze on your skin for 1 minute.',
  'Listen to one song you love and focus only on the music.',
  'Draw or doodle whatever comes to mind for 3 minutes.',
  'Send a kind message to someone you care about.',
  'Hold a piece of ice and focus on the sensation until it melts.'
];

function endSobriety() {
  if (!confirm(t('End your sobriety tracker? Your plant and timer will reset, but your history stays.'))) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content" style="text-align:center;max-width:420px">';
  h += '<div style="font-size:48px;margin-bottom:8px">&#128522;</div>';
  h += '<h3 style="font-size:20px;font-weight:700;margin-bottom:4px">Are you ok?</h3>';
  h += '<p style="font-size:14px;color:var(--muted);margin-bottom:16px">Do you need help or support right now?</p>';
  h += '<div style="display:flex;gap:10px">';
  h += '<label class="quiz-label" style="flex:1;text-align:center;padding:14px 8px;border-radius:12px;border:2px solid var(--primary);background:var(--primary-light);cursor:pointer;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:4px" onclick="endSobrietyHelp(this.closest(\'.overlay\'))">';
  h += '<span style="font-size:28px">&#129657;</span>';
  h += '<span style="font-size:14px;font-weight:700;color:var(--primary)">Yes, I need help</span>';
  h += '</label>';
  h += '<label class="quiz-label" style="flex:1;text-align:center;padding:14px 8px;border-radius:12px;border:2px solid var(--border);background:var(--card);cursor:pointer;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:4px" onmouseover="this.style.borderColor=\'var(--primary)\'" onmouseout="this.style.borderColor=\'var(--border)\'" onclick="endSobrietyProud(this.closest(\'.overlay\'))">';
  h += '<span style="font-size:28px">&#128170;</span>';
  h += '<span style="font-size:14px;font-weight:600;color:var(--text)">No, I\'m ok</span>';
  h += '</label>';
  h += '</div>';
  h += '<div style="margin-top:12px"><a href="#" onclick="this.closest(\'.overlay\').remove();return false" style="font-size:13px;color:var(--muted);text-decoration:none">Cancel</a></div>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function endSobrietyHelp(overlay) {
  var activity = END_SOBRIETY_ACTIVITIES[Math.floor(Math.random() * END_SOBRIETY_ACTIVITIES.length)];
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:420px"><div style="font-size:48px;margin-bottom:8px">&#129657;</div><h3 style="font-size:20px;font-weight:700;margin-bottom:4px">Take a moment</h3><p style="font-size:14px;color:var(--text);line-height:1.6;margin-bottom:12px">' + activity + '</p><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-primary btn-sm" onclick="startBreathe()" style="width:auto">Try Breathing Exercise</button><button class="btn btn-outline btn-sm" onclick="endSobrietyHelp(this.closest(\'.overlay\'))" style="width:auto">Another Activity</button></div><div style="margin-top:12px"><a href="#" onclick="endSobrietyReset(this.closest(\'.overlay\'));return false" style="font-size:13px;color:var(--muted);text-decoration:none">I\'m ready to reset my sobriety</a></div></div>';
}

function endSobrietyProud(overlay) {
  D.sobriety.startDate = null;
  D.sobriety.addictionType = '';
  saveData();
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:420px"><div style="font-size:48px;margin-bottom:8px">&#x269C;</div><h3 style="font-size:20px;font-weight:700;color:var(--primary);margin-bottom:4px">We are so proud of you</h3><p style="font-size:14px;color:var(--muted);line-height:1.6">Look at how far you have come. Every day of your journey mattered. The growth, the strength, the courage to keep showing up  that stays with you forever. Whenever you are ready to begin again, your plant will be here waiting.</p><button class="btn btn-primary" onclick="this.closest(\'.overlay\').remove();render()">Thank you</button></div>';
}

function endSobrietyReset(overlay) {
  overlay.remove();
  D.sobriety.startDate = null;
  D.sobriety.addictionType = '';
  saveData();
  render();
}

function resetSoberTimer() {
  if (!D.sobriety.startDate) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.45)';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:360px;padding:24px;border-radius:20px">' +
    '<div style="font-size:40px;margin-bottom:6px">&#9888;</div>' +
    '<div style="font-size:18px;font-weight:700;color:var(--primary-dark);margin-bottom:4px">Reset Your Timer?</div>' +
    '<div style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5">This will record the current time as a relapse and start a new chapter in your journey.</div>' +
    '<button class="btn btn-primary btn-sm" onclick="doResetTimer();this.closest(\'.overlay\').remove()" style="margin-bottom:6px;background:linear-gradient(135deg,#7a1a1a,#a83030)">Yes, Reset &amp; Begin Anew</button>' +
    '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove();showResetAlternatives()" style="margin-bottom:6px">No, Let Me Try Something Else</button>' +
    '<button class="btn btn-sm" onclick="this.closest(\'.overlay\').remove()" style="background:transparent;color:var(--muted);border:none;font-size:12px">Cancel</button></div>';
  document.body.appendChild(overlay);
}

function doResetTimer() {
  if (!D.sobriety.relapseDates) D.sobriety.relapseDates = [];
  D.sobriety.relapseDates.push(Date.now());
  D.sobriety.startDate = Date.now();
  saveData();
  render();
  setTimeout(function(){
    showToast('&#128081; A new chapter begins. The realm stands with you.','success');
  }, 300);
}

function showResetAlternatives() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.45)';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:360px;padding:24px;border-radius:20px">' +
    '<div style="font-size:40px;margin-bottom:6px">&#129309;</div>' +
    '<div style="font-size:17px;font-weight:700;color:var(--primary-dark);margin-bottom:2px">You\'ve Got This</div>' +
    '<div style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.5">A reset is a big step. Before you decide, try one of these â€” they might help shift your state of mind.</div>' +
    '<button class="btn btn-primary btn-sm" onclick="closeOverlay(this);startBreathe()" style="margin-bottom:6px;background:linear-gradient(135deg,#2a4a5a,#4a6a7a);border:none">&#x2766; Breathing Exercise</button>' +
    '<button class="btn btn-primary btn-sm" onclick="closeOverlay(this);suggestDistraction()" style="margin-bottom:6px;background:linear-gradient(135deg,#5a3a1a,#7a5a3a);border:none">&#x2619; Do Something You Enjoy</button>' +
    '<button class="btn btn-outline btn-sm" onclick="closeOverlay(this);resetSoberTimer()" style="margin-bottom:6px">I Still Want to Reset</button>' +
    '<button class="btn btn-sm" onclick="closeOverlay(this)" style="background:transparent;color:var(--muted);border:none;font-size:12px">Back</button></div>';
  document.body.appendChild(overlay);
}

function closeOverlay(el) {
  var o = el.closest('.overlay');
  if (o) o.remove();
}

function suggestDistraction() {
  var ideas = [
    { emoji:'&#128214;', text:'Read a page from your favorite book' },
    { emoji:'&#127925;', text:'Put on music that lifts your spirit' },
    { emoji:'&#127955;', text:'Take a short walk outside' },
    { emoji:'&#9749;', text:'Make a warm drink and sip it slowly' },
    { emoji:'&#128036;', text:'Step outside and feel the sun or breeze' },
    { emoji:'&#9997;', text:'Write down three things you\'re grateful for' },
    { emoji:'&#127912;', text:'Doodle, sketch, or color something' },
    { emoji:'&#128170;', text:'Do 10 push-ups or stretch for 2 minutes' },
    { emoji:'&#128302;', text:'Text a friend or comrade' },
    { emoji:'&#127807;', text:'Water a plant or tend to something living' }
  ];
  var pick = ideas[Math.floor(Math.random() * ideas.length)];
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:340px;padding:24px;border-radius:20px">' +
    '<div style="font-size:48px;margin-bottom:6px">' + pick.emoji + '</div>' +
    '<div style="font-size:17px;font-weight:700;color:var(--primary-dark);margin-bottom:2px">Try This Instead</div>' +
    '<div style="font-size:14px;color:var(--text);margin:10px 0 16px;line-height:1.5">' + pick.text + '</div>' +
    '<button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();suggestDistraction()" style="margin-bottom:6px;background:var(--grad-accent);border:none">&#127922; Give Me Another</button>' +
    '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()">Got it</button></div>';
  document.body.appendChild(overlay);
}

