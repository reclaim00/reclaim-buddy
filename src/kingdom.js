
// ====== HOME ======
function characterGreetingHTML() {
  var h = '';
  var chars = [
    {name:'Your Guide',color:'var(--avatar-heroguide)',svg:'<svg viewBox="0 0 16 16" width="18" height="18" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg>',
     msgs:[
       "I've been watching your patterns. You're showing up more. That's the data that matters.",
       "I notice you've been logging regularly. Every entry sharpens the map of your recovery.",
       "Your consistency is building a reliable trend. Keep feeding me data and I'll keep finding insights.",
       "Journal entries are up. Mood tracking is steady. The numbers don't lie � you're putting in the work.",
       "I cross-referenced your check-ins and habits. There's a clear correlation: showing up daily builds momentum."
      ]}
  ];
  var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  var pick = chars[dayOfYear % chars.length];
  var hr = new Date().getHours();
  var timeWord = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
  var dayMod = Math.floor(dayOfYear / chars.length);
  var msg = pick.msgs[dayMod % pick.msgs.length];
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:10px 14px;background:linear-gradient(135deg,var(--primary-light),var(--card))">';
  h += '<div style="display:flex;align-items:center;gap:10px">';
  h += '<div style="width:36px;height:36px;border-radius:18px;background:' + pick.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer" onclick="showCharacterLore(\'' + pick.name + '\')" title="Learn about ' + pick.name + '">' + pick.svg + '</div>';
  h += '<div style="flex:1"><div style="font-size:11px;color:var(--muted);margin-bottom:1px">Good ' + timeWord + ' from <strong style="color:var(--primary);cursor:pointer" onclick="showCharacterLore(\'' + pick.name + '\')">' + pick.name + '</strong></div><div style="font-size:13px;line-height:1.5">' + msg + '</div></div>';
  h += '</div></div>';
  return h;
}

function showCharacterLore(name) {
  var lore = {
    'Your Guide': {
      title: 'Guardian of the Long View',
      desc: 'A guide through difficult times, always learning that patterns tell the truth where words deceive. Now serving as your personal strategist \u2014 tracking your data, spotting trends, and alerting you to hidden risks before they become crises.',
      role: 'Analyzes patterns, correlates data, warns of risk factors',
      quote: 'The numbers don\u2019t lie \u2014 but they do whisper. You just have to learn to listen.',
      color: 'var(--avatar-heroguide)',
      svg: '<svg viewBox="0 0 16 16" width="40" height="40" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg>'
    }
  };
  var c = lore[name];
  if (!c) return;
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center;padding:24px">' +
    '<div style="width:56px;height:56px;border-radius:28px;background:' + c.color + ';display:flex;align-items:center;justify-content:center;margin:0 auto 8px">' + c.svg + '</div>' +
    '<div style="font-size:20px;font-weight:800;color:var(--primary)">' + name + '</div>' +
    '<div style="font-size:11px;color:var(--gold);margin-bottom:10px;font-family:Georgia,serif">' + c.title + '</div>' +
    '<div style="font-size:13px;line-height:1.6;color:var(--text);margin-bottom:10px;padding:0 4px">' + c.desc + '</div>' +
    '<div style="background:var(--primary-light);padding:8px 12px;border-radius:8px;margin-bottom:8px;font-size:11px;color:var(--muted)">' + c.role + '</div>' +
    '<div style="font-style:italic;font-size:13px;color:var(--text-light);padding:0 8px;border-left:2px solid var(--primary)">\u201C' + c.quote + '\u201D</div>' +
    '<button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove()" style="margin-top:12px;width:100%">Close</button></div>';
  document.body.appendChild(ov);
}

function kingdomLevel(days) {
  if (days <= 0) return 0;
  if (days <= 2) return 1;
  if (days <= 5) return 2;
  if (days <= 8) return 3;
  if (days <= 12) return 4;
  if (days <= 16) return 5;
  if (days <= 21) return 6;
  if (days <= 30) return 7;
  if (days <= 60) return 8;
  if (days <= 120) return 9;
  if (days <= 180) return 10;
  if (days <= 270) return 11;
  if (days <= 365) return 12;
  if (days <= 545) return 13;
  if (days <= 730) return 14;
  if (days <= 1000) return 15;
  if (days <= 1500) return 16;
  if (days <= 2000) return 17;
  if (days <= 2500) return 18;
  if (days <= 3000) return 19;
  if (days <= 3650) return 20;
  if (days <= 5000) return 21;
  if (days <= 7500) return 22;
  if (days <= 10000) return 23;
  if (days <= 15000) return 24;
  return 25;
}
function kingdomPopulation(days) {
  var lvl = kingdomLevel(days);
  if (lvl <= 0) return 0;
  if (lvl <= 2) return 5 + lvl * 3;
  if (lvl <= 5) return 10 + (lvl - 2) * 8;
  if (lvl <= 8) return 35 + (lvl - 5) * 15;
  if (lvl <= 11) return 80 + (lvl - 8) * 25;
  if (lvl <= 14) return 155 + (lvl - 11) * 40;
  return 275 + (lvl - 14) * 50;
}
function getKingdomWeather() {
  var days=soberDays();var streak=calcJournalStreak();var hour=new Date().getHours();var isNight=hour<6||hour>=20;
  var today=new Date().toDateString();var cravedToday=D.cravings&&D.cravings.some(function(c){var d=c.date||(c.timestamp?new Date(c.timestamp).toDateString():'');return d===today});
  var relapsedToday=D.relapseHistory&&D.relapseHistory.length>0&&D.relapseHistory[D.relapseHistory.length-1].date===today;
  var isMilestone=days>0&&(days%30===0||days%90===0||days%365===0);
  if(relapsedToday)return'storm';if(isMilestone&&days>=30)return'rainbow';
  if(isNight&&days>=100)return'aurora';if(streak>=30)return'clear';
  if(streak>=7||missionWeekCount()>=5)return'clear';if(cravedToday&&streak<3)return'rain';
  if(streak>=3||missionWeekCount()>=3)return'cloudy';if(days>=1)return'fog';return'mist';
}
function formR(days) {
  if (days <= 0) return 20;
  if (days >= 7) return 62;
  return 24 + days * 5.4;
}

function kingdomHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var weather = getKingdomWeather();
  var hour = new Date().getHours();
  var isNight = hour < 6 || hour >= 20 || (typeof document !== 'undefined' && document.body && document.body.classList.contains('dark'));
  var h = '<div class="kingdom-scene tier-' + level + ' k-' + weather + (isNight ? ' k-night' : '') + '" id="kingdom-scene">';
  h += '<svg viewBox="0 0 500 280">';
  h += '<defs>';
  h += '<radialGradient id="kd-sky" cx="50%" cy="40%" r="80%"><stop offset="0%" stop-color="#1c2a52"/><stop offset="55%" stop-color="#0a142e"/><stop offset="100%" stop-color="#04061a"/></radialGradient>';
  h += '<radialGradient id="kd-molten" cx="42%" cy="36%" r="70%"><stop offset="0%" stop-color="#ffe9a8"/><stop offset="38%" stop-color="#ffac3d"/><stop offset="72%" stop-color="#d94f0a"/><stop offset="100%" stop-color="#5a1a00"/></radialGradient>';
  h += '<radialGradient id="kd-ocean" cx="40%" cy="34%" r="75%"><stop offset="0%" stop-color="#a8ddff"/><stop offset="45%" stop-color="#3a8fd4"/><stop offset="80%" stop-color="#16527a"/><stop offset="100%" stop-color="#0a2a4a"/></radialGradient>';
  h += '<radialGradient id="kd-atmo" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="rgba(130,200,255,0)"/><stop offset="72%" stop-color="rgba(130,200,255,.14)"/><stop offset="100%" stop-color="rgba(130,200,255,.3)"/></radialGradient>';
  h += '<radialGradient id="kd-core" cx="50%" cy="50%" r="58%"><stop offset="0%" stop-color="#fff6da"/><stop offset="42%" stop-color="#ffd27a"/><stop offset="82%" stop-color="#ff8c2e"/><stop offset="100%" stop-color="#cc5a12"/></radialGradient>';
  h += '<radialGradient id="kd-limb" cx="42%" cy="50%" r="130%"><stop offset="0%" stop-color="rgba(4,10,26,0)"/><stop offset="70%" stop-color="rgba(4,10,26,0)"/><stop offset="100%" stop-color="rgba(4,10,26,.5)"/></radialGradient>';
  h += '</defs>';
  h += '<rect width="500" height="280" class="k-sky"/>';
  // Stars — brighter and denser as your world grows
  h += '<g class="k-stars">';
  var sp = [[50,30],[120,20],[200,45],[310,25],[400,40],[460,30],[80,70],[160,55],[250,65],[340,50],[430,60],[40,100],[140,90],[230,80],[320,95],[410,85],[480,90],[100,120],[190,110],[280,125],[370,115],[450,120],[60,140],[170,135],[260,145],[350,130],[440,140],[24,80],[375,180],[95,205],[315,215],[455,235],[180,250],[120,262],[300,258],[70,240],[420,170],[35,55],[290,15]];
  for (var si = 0; si < sp.length; si++) h += '<circle cx="' + sp[si][0] + '" cy="' + sp[si][1] + '" r="' + (0.8 + (si % 3) * 0.5) + '" opacity="' + Math.min(0.95, 0.22 + level * 0.06) + '"/>';
  h += '</g>';
  // Nebula wisps
  h += '<ellipse cx="130" cy="95" rx="170" ry="85" fill="rgba(120,80,220,.07)" style="animation:nebulaDrift 26s ease-in-out infinite alternate"/>';
  h += '<ellipse cx="390" cy="205" rx="155" ry="70" fill="rgba(60,140,220,.06)" style="animation:nebulaDrift 34s ease-in-out infinite alternate-reverse"/>';
  // Distant sun
  h += '<circle cx="66" cy="52" r="20" fill="rgba(255,233,176,.16)"/>';
  h += '<circle cx="66" cy="52" r="11" fill="#ffe9b0" class="kd-sun"/>';

  var forming = days < 7;
  var pr = formR(days);
  if (forming) {
    // Accretion disk of swirling dust
    h += '<g style="animation:diskSpin 14s linear infinite;transform-origin:250px 150px">';
    for (var di = 0; di < 3; di++) {
      var drx = pr + 20 + di * 15;
      var dry = (pr + 20 + di * 15) * 0.32;
      h += '<ellipse cx="250" cy="150" rx="' + drx + '" ry="' + dry + '" fill="none" stroke="rgba(255,201,151,' + (0.32 - di * 0.07) + ')" stroke-width="2" opacity=".5"/>';
    }
    h += '</g>';
    // Dust motes
    for (var pu = 0; pu < 26; pu++) {
      var ang = pu * 13.85;
      var rad2 = pr + 20 + (pu % 4) * 10;
      h += '<circle cx="' + (250 + Math.cos(ang * Math.PI / 180) * rad2) + '" cy="' + (150 + Math.sin(ang * Math.PI / 180) * rad2 * 0.32) + '" r="1.3" fill="#ffcc88" opacity="' + (0.3 + (pu % 3) * 0.2) + '"/>';
    }
    // Fine debris sprinkled throughout the disk
    for (var du2 = 0; du2 < 32; du2++) {
      var dia = (du2 * 47.6) * Math.PI / 180;
      var diRad = pr + 12 + (du2 % 6) * 7;
      h += '<circle cx="' + (250 + Math.cos(dia) * diRad) + '" cy="' + (150 + Math.sin(dia) * diRad * 0.32) + '" r="' + (0.5 + (du2 % 3) * 0.45) + '" fill="#ffcc88" opacity="' + (0.16 + (du2 % 4) * 0.12) + '" style="animation:starTwinkle ' + (2 + du2 % 4) + 's ease-in-out infinite alternate;animation-delay:-' + ((du2 % 5) * 0.4) + 's"/>';
    }
    // Counter-rotating inner band of dust
    h += '<g style="animation:diskSpin 24s linear infinite reverse;transform-origin:250px 150px">';
    for (var du3 = 0; du3 < 3; du3++) {
      var duA = (120 + du3 * 120) * Math.PI / 180;
      h += '<ellipse cx="250" cy="150" rx="' + (pr + du3 * 7) + '" ry="' + (pr + du3 * 7) * 0.9 + '" fill="none" stroke="rgba(255,204,136,' + (0.26 - du3 * 0.06) + ')" stroke-width="1" opacity=".35"/>';
      h += '<circle cx="' + (250 + Math.cos(duA) * (pr + du3 * 7)) + '" cy="' + (150 + Math.sin(duA) * (pr + du3 * 7) * 0.32) + '" r="1.2" fill="#ffd9a0"/>';
    }
    h += '</g>';
  }

  // Planet sphere
  h += '<circle cx="250" cy="150" r="' + pr + '" fill="url(#kd-molten)"/>';
  h += '<circle cx="250" cy="150" r="' + (pr + 4) + '" fill="none" stroke="rgba(255,170,80,.5)" stroke-width="2" style="animation:planetPulse 3.6s ease-in-out infinite"/>';
  // Life motes � tiny green sparks that appear once mission momentum feeds the world
  if (missionWeekCount() >= 3) {
    var lseed = [[250,142],[231,168],[269,170],[245,184],[258,121],[214,150],[286,150]];
    h += '<g class="k-life">';
    for (var li = 0; li < lseed.length; li++) {
      h += '<circle cx="' + lseed[li][0] + '" cy="' + lseed[li][1] + '" r="2.6" fill="#7ef0a2" opacity=".85" style="animation:starTwinkle ' + (1.6 + li * 0.3) + 's ease-in-out infinite alternate;animation-delay:-' + (li * 0.5) + 's"/>';
    }
    h += '</g>';
  }

  if (forming) {
    // Inner molten core shining through the crust
    h += '<circle cx="250" cy="150" r="' + (pr * 0.5) + '" fill="url(#kd-core)"/>';
    // Convection currents in the magma
    h += '<g style="animation:diskSpin 16s linear infinite;transform-origin:250px 150px">';
    h += '<ellipse cx="250" cy="150" rx="' + (pr * 0.72) + '" ry="' + (pr * 0.3) + '" fill="none" stroke="rgba(255,226,160,.18)" stroke-width="1.5"/>';
    h += '<ellipse cx="250" cy="150" rx="' + (pr * 0.5) + '" ry="' + (pr * 0.2) + '" fill="none" stroke="rgba(255,240,200,.28)" stroke-width="1"/>';
    h += '<ellipse cx="250" cy="150" rx="' + (pr * 0.3) + '" ry="' + (pr * 0.12) + '" fill="none" stroke="rgba(255,226,160,.2)" stroke-width="1"/>';
    h += '</g>';
    // Cooling cracks crawling across the crust
    h += '<path d="M ' + (250 - pr * 0.62) + ',' + (150 + pr * 0.3) + ' Q ' + (250 - pr * 0.3) + ',' + (150 + pr * 0.62) + ' ' + (250 + pr * 0.16) + ',' + (150 + pr * 0.62) + '" stroke="#ffbb66" stroke-width="1.4" fill="none" opacity=".5"/>';
    h += '<path d="M ' + (250 + pr * 0.3) + ',' + (150 - pr * 0.6) + ' Q ' + (250 + pr * 0.55) + ',' + (150 - pr * 0.24) + ' ' + (250 + pr * 0.6) + ',' + (150 + pr * 0.14) + '" stroke="#ffbb66" stroke-width="1.4" fill="none" opacity=".45"/>';
    h += '<path d="M ' + (250 - pr * 0.38) + ',' + (150 - pr * 0.42) + ' Q ' + (250 - pr * 0.15) + ',' + (150 - pr * 0.2) + ' ' + (250 - pr * 0.3) + ',' + (150 + pr * 0.06) + '" stroke="#ffdd88" stroke-width="1.1" fill="none" opacity=".6" style="animation:planetPulse 3s ease-in-out infinite"/>';
    // Molten impact pools and cooling cracks
    h += '<ellipse cx="238" cy="132" rx="' + (pr * 0.26) + '" ry="' + (pr * 0.16) + '" fill="#ffe3a8" opacity=".5"/>';
    h += '<ellipse cx="262" cy="168" rx="' + (pr * 0.18) + '" ry="' + (pr * 0.11) + '" fill="#ffe3a8" opacity=".35"/>';
    h += '<path d="M' + (250 - pr * 0.5) + ',' + (150 + pr * 0.08) + ' Q' + (250 - pr * 0.2) + ',' + (150 + pr * 0.3) + ' ' + (250 + pr * 0.1) + ',' + (150 + pr * 0.12) + '" stroke="#ffbb66" stroke-width="2" fill="none" opacity=".7"/>';
    h += '<path d="M' + (250 + pr * 0.05) + ',' + (150 - pr * 0.4) + ' Q' + (250 + pr * 0.25) + ',' + (150 - pr * 0.15) + ' ' + (250 + pr * 0.35) + ',' + (150 + pr * 0.28) + '" stroke="#ffbb66" stroke-width="2" fill="none" opacity=".5"/>';
  } else {
    // Atmosphere glow
    h += '<circle cx="250" cy="150" r="' + (pr + 7) + '" fill="url(#kd-atmo)"/>';
    // Oceans — day 7 is a water world; land arrives little by little afterward
    h += '<circle cx="250" cy="150" r="' + pr + '" fill="url(#kd-ocean)"/>';
    // Land growth: starts the day after formation, keeps growing toward ~40% coverage
    var landG = Math.min(1, Math.max(0, (days - 7) / 150));
    h += '<clipPath id="kd-sphere"><circle cx="250" cy="150" r="' + pr + '"/></clipPath>';
    h += '<g clip-path="url(#kd-sphere)">';
    // Continents — each one surfaces in turn and grows to full size (sum ≈ 55% of disk)
    var conts = [
      {x:-0.12, y:-0.06, rx:0.65, ry:0.46, rot:10},
      {x:0.28, y:-0.08, rx:0.42, ry:0.32, rot:-16},
      {x:0.06, y:-0.38, rx:0.30, ry:0.24, rot:6},
      {x:-0.06, y:0.34, rx:0.36, ry:0.26, rot:-8},
      {x:0.44, y:0.26, rx:0.20, ry:0.15, rot:20},
      {x:-0.44, y:0.18, rx:0.16, ry:0.12, rot:-12},
      {x:0.18, y:0.42, rx:0.14, ry:0.10, rot:14},
      {x:-0.34, y:-0.32, rx:0.12, ry:0.09, rot:-20}
    ];
    for (var li = 0; li < conts.length; li++) {
      var c = conts[li];
      var cg = Math.min(1, Math.max(0, (landG - 0.06 * li) / 0.28));
      if (cg <= 0.02) continue;
      var ccx = 250 + c.x * pr, ccy = 150 + c.y * pr;
      var crx = c.rx * pr * cg, cry = c.ry * pr * cg;
      h += '<ellipse cx="' + ccx + '" cy="' + ccy + '" rx="' + crx + '" ry="' + cry + '" fill="#4f7f4f" transform="rotate(' + c.rot + ' ' + ccx + ' ' + ccy + ')"/>';
      h += '<ellipse cx="' + (ccx - 2) + '" cy="' + (ccy - 3) + '" rx="' + (crx * 0.75) + '" ry="' + (cry * 0.72) + '" fill="#7fb06f" opacity=".8" transform="rotate(' + c.rot + ' ' + ccx + ' ' + ccy + ')"/>';
      // Vegetation speckles for a flourishing world
      if (days >= 60 && cg > 0.5) {
        var vegN = Math.min(12, 4 + Math.floor(days / 40));
        for (var vg = 0; vg < vegN; vg++) {
          var vA = (vg * 137.5) * Math.PI / 180;
          var vR = (vg % 4) * 3.5;
          h += '<circle cx="' + (ccx + Math.cos(vA) * vR * crx / pr) + '" cy="' + (ccy + Math.sin(vA) * vR * cry / pr) + '" r="1.4" fill="#9fd07f" opacity=".9"/>';
        }
      }
    }
    // Random green patches that bloom over time — seeded by day for consistency
    if (days >= 14) {
      var patchCount = Math.min(25, Math.floor(days / 6));
      for (var pi = 0; pi < patchCount; pi++) {
        var seed1 = (days * 7 + pi * 131) % 1000 / 1000;
        var seed2 = (days * 13 + pi * 97) % 1000 / 1000;
        var seed3 = (days * 19 + pi * 53) % 1000 / 1000;
        var px = 250 + (seed1 - 0.5) * pr * 1.6;
        var py = 150 + (seed2 - 0.5) * pr * 1.6;
        var pr2 = 2 + seed3 * 5;
        var greenShade = ['#5a8f4a','#6aa35a','#7fb06f','#4a7a3e','#8bc07a','#3d6e32'][pi % 6];
        h += '<ellipse cx="' + px + '" cy="' + py + '" rx="' + pr2 + '" ry="' + (pr2 * 0.7) + '" fill="' + greenShade + '" opacity="' + (0.4 + seed3 * 0.4) + '" transform="rotate(' + (seed1 * 60) + ' ' + px + ' ' + py + ')"/>';
      }
    }
    // Night hemisphere — darker, where city lights will glow
    if (isNight) h += '<ellipse cx="' + (250 + pr * 0.30) + '" cy="150" rx="' + (pr * 0.52) + '" ry="' + (pr * 0.98) + '" fill="rgba(4,8,24,.55)" transform="rotate(-16 250 150)"/>';
    // Towns and people arrive as land matures
    var towns = [[-0.18,-0.10], [0.28,-0.14], [0.06,-0.40], [-0.12,-0.22], [0.02,0.30], [0.32,0.02], [0.32,0.06], [-0.04,0.18]];
    var townN = Math.min(towns.length, Math.floor((days - 40) / 15));
    for (var ti = 0; ti < townN; ti++) {
      var tt = towns[ti];
      var tx = 250 + tt[0] * pr, ty = 150 + tt[1] * pr;
      // only place towns once the surrounding land has grown enough
      if (landG < 0.22 + ti * 0.02) continue;
      var bN = 2 + (ti % 2);
      for (var bi = 0; bi < bN; bi++) {
        var bx = tx + (bi - 0.5) * 6, by = ty - (bi % 2) * 2;
        h += '<rect x="' + (bx - 2) + '" y="' + (by - 3) + '" width="4" height="6" rx="1" fill="#b98d5f"/>';
        h += '<rect x="' + (bx - 2) + '" y="' + (by - 3) + '" width="4" height="2.2" rx="1" fill="#8a5f3a"/>';
        if (isNight) h += '<circle cx="' + bx + '" cy="' + (by - 0.5) + '" r="1.1" fill="#ffdd88" style="animation:planetPulse 2.5s ease-in-out infinite"/>';
        else h += '<rect x="' + (bx - 1) + '" y="' + (by - 1.2) + '" width="2" height="1.6" fill="#ffe9b0" opacity=".55"/>';
      }
      // a few tiny people around each town
      h += '<circle cx="' + (tx + 5) + '" cy="' + (ty + 4) + '" r=".9" fill="#d6a878"/>';
      h += '<circle cx="' + (tx - 4) + '" cy="' + (ty + 3) + '" r=".9" fill="#c89a6a"/>';
      h += '<circle cx="' + (tx + 1) + '" cy="' + (ty + 5) + '" r=".9" fill="#d6a878"/>';
    }
    h += '</g>';
    // Soft limb shading for a rounded, solid look
    h += '<ellipse cx="250" cy="150" r="' + pr + '" fill="url(#kd-limb)"/>';
    // Polar ice caps that form as the world matures
    if (days >= 45) {
      var capW = pr * 0.34, capH = pr * 0.13;
      h += '<ellipse cx="250" cy="' + (150 - pr * 0.78) + '" rx="' + capW + '" ry="' + capH + '" fill="rgba(236,242,248,.85)"/>';
      h += '<ellipse cx="250" cy="' + (150 + pr * 0.76) + '" rx="' + (capW * 0.9) + '" ry="' + (capH * 0.85) + '" fill="rgba(236,242,248,.7)"/>';
      if (days >= 180) {
        h += '<path d="M ' + (250 - pr * 0.42) + ',' + (150 - pr * 0.72) + ' Q ' + (250 - pr * 0.2) + ',' + (150 - pr * 0.6) + ' ' + (250 - pr * 0.36) + ',' + (150 - pr * 0.5) + '" stroke="rgba(240,246,252,.9)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>';
        h += '<path d="M ' + (250 + pr * 0.3) + ',' + (150 + pr * 0.7) + ' Q ' + (250 + pr * 0.12) + ',' + (150 + pr * 0.58) + ' ' + (250 + pr * 0.3) + ',' + (150 + pr * 0.52) + '" stroke="rgba(240,246,252,.8)" stroke-width="2" fill="none" stroke-linecap="round" opacity=".5"/>';
      }
    }
    // Clouds — slowly drifting
    var cloudN = Math.min(6, Math.floor(days / 40));
    var cps = [[-0.22,-0.3,0.2,0.09],[0.2,-0.05,0.16,0.08],[-0.05,0.28,0.18,0.09],[0.28,0.3,0.14,0.07],[0.02,-0.16,0.11,0.05],[-0.3,0.08,0.13,0.05]];
    for (var ci2 = 0; ci2 < cloudN; ci2++) {
      var C = cps[ci2];
      h += '<ellipse class="k-clouds" cx="' + (250 + C[0] * pr * 1.5) + '" cy="' + (150 + C[1] * pr * 1.5) + '" rx="' + (C[2] * pr) + '" ry="' + (C[3] * pr) + '" fill="#ffffff" opacity=".55"/>';
    }
    // High, thin wisps drifting over the world
    h += '<path d="M ' + (250 - pr * 0.95) + ',' + (150 - pr * 0.26) + ' Q ' + (250 - pr * 0.1) + ',' + (150 - pr * 0.4) + ' ' + (250 + pr * 0.95) + ',' + (150 - pr * 0.22) + '" stroke="#ffffff" stroke-width="2.5" fill="none" opacity=".18" class="k-clouds"/>';
    h += '<path d="M ' + (250 - pr * 0.8) + ',' + (150 + pr * 0.3) + ' Q ' + (250 + pr * 0.1) + ',' + (150 + pr * 0.22) + ' ' + (250 + pr * 0.8) + ',' + (150 + pr * 0.34) + '" stroke="#ffffff" stroke-width="1.8" fill="none" opacity=".12" class="k-clouds"/>';
    if (days >= 120) {
      // A cyclonic storm brewing on a seasoned world
      h += '<ellipse cx="' + (250 + pr * 0.18) + '" cy="' + (150 - pr * 0.34) + '" rx="' + (pr * 0.2) + '" ry="' + (pr * 0.11) + '" fill="rgba(255,255,255,.22)" style="animation:auroraPlanet 6s ease-in-out infinite alternate"/>';
      h += '<ellipse cx="' + (250 + pr * 0.18) + '" cy="' + (150 - pr * 0.34) + '" rx="' + (pr * 0.09) + '" ry="' + (pr * 0.05) + '" fill="rgba(200,230,255,.35)" style="animation:auroraPlanet 6s ease-in-out infinite alternate-reverse"/>';
    }
    // Lighting highlight
    h += '<ellipse cx="218" cy="114" rx="24" ry="13" fill="#ffffff" opacity=".16" transform="rotate(-28 218 114)"/>';
    // Moons
    if (days >= 90) {
      h += '<g><animateTransform attributeName="transform" type="rotate" from="0 250 150" to="360 250 150" dur="24s" repeatCount="indefinite"/><circle cx="' + (250 + pr + 34) + '" cy="150" r="9" fill="#d6d9d6"/><circle cx="' + (250 + pr + 36) + '" cy="147" r="2.4" fill="#9aa0a0"/></g>';
      if (days >= 365) {
        h += '<g><animateTransform attributeName="transform" type="rotate" from="360 250 150" to="0 250 150" dur="38s" repeatCount="indefinite"/><circle cx="' + (250 - pr - 30) + '" cy="140" r="5" fill="#c2c8c6"/></g>';
      }
    }
    // Rings
    if (days >= 365) {
      h += '<ellipse cx="250" cy="150" rx="' + (pr + 26) + '" ry="' + (pr + 26) * 0.32 + '" fill="none" stroke="rgba(230,210,180,.8)" stroke-width="3" opacity=".7" transform="rotate(-12 250 150)"/>';
      h += '<ellipse cx="250" cy="150" rx="' + (pr + 17) + '" ry="' + (pr + 17) * 0.3 + '" fill="none" stroke="rgba(230,210,180,.5)" stroke-width="2" opacity=".5" transform="rotate(-12 250 150)"/>';
    }
    // Sector satellites
    if (days >= 730) h += '<circle cx="250" cy="150" r="' + (pr + 40) + '" fill="none" stroke="rgba(150,220,255,.15)" stroke-dasharray="3 6" stroke-width="1.5"/>';
    // Aurora shimmer
    if (days >= 180) h += '<ellipse cx="250" cy="128" rx="' + (pr * 0.55) + '" ry="' + (pr * 0.16) + '" fill="none" stroke="#66ffdd" stroke-width="2" opacity=".25" style="animation:auroraPlanet 8s ease-in-out infinite alternate"/>';
  }

  h += '<rect width="500" height="280" class="k-damage-overlay" opacity="0"/>';
  // Weather overlays
  if(weather==='rain')h+='<g class="w-rain">'+Array.from({length:40},function(_,i){var x=Math.random()*500,y=Math.random()*40*-1,d=70+Math.random()*80;return '<line x1="'+x+'" y1="'+y+'" x2="'+(x-2)+'" y2="'+(y+15)+'" stroke="#88bbff" stroke-width=".5" opacity=".3" style="animation:rainDrop '+d+'ms linear infinite;animation-delay:'+(Math.random()*d)+'ms"/>'}).join('')+'</g>';
  if(weather==='storm'){h+='<rect width="500" height="280" fill="#fff" opacity="0" style="animation:lightningFlash 6s ease-in-out infinite;pointer-events:none"/>';h+='<g class="w-rain">'+Array.from({length:60},function(_,i){var x=Math.random()*500,y=Math.random()*40*-1,d=50+Math.random()*60;return '<line x1="'+x+'" y1="'+y+'" x2="'+(x-2)+'" y2="'+(y+15)+'" stroke="#88bbff" stroke-width=".5" opacity=".4" style="animation:rainDrop '+d+'ms linear infinite;animation-delay:'+(Math.random()*d)+'ms"/>'}).join('')+'</g>';}
  if(weather==='fog'||weather==='mist')h+='<rect x="0" y="0" width="500" height="280" fill="#b0c0d0" opacity=".15" style="animation:fogDrift 8s ease-in-out infinite alternate;pointer-events:none"/><rect x="0" y="0" width="500" height="280" fill="#b0c0d0" opacity=".1" style="animation:fogDrift 12s ease-in-out infinite alternate;animation-delay:-3s;pointer-events:none"/>';
  if(weather==='rainbow'){var rY=90;h+='<g opacity=".4" style="animation:rainbowArc 4s ease-in-out infinite alternate">';['#ff0000','#ff8800','#ffff00','#00bb00','#0088ff','#4400ff','#8800cc'].forEach(function(c,i){var r=90+i*8;h+='<path d="M 80,'+rY+' A '+r+','+r+' 0 0,1 420,'+rY+'" fill="none" stroke="'+c+'" stroke-width="4"/>';});h+='</g>';}
  if(weather==='aurora'){h+='<g opacity=".25" style="animation:auroraWave 6s ease-in-out infinite alternate">';['#00ff88','#00ccff','#ff44ff'].forEach(function(c,i){h+='<path d="M 0,'+(200-i*30)+' Q 80,'+(160-i*30)+' 180,'+(190-i*30)+' T 360,'+(170-i*30)+' T 500,'+(180-i*30)+'" fill="none" stroke="'+c+'" stroke-width="20" opacity=".15"/>';h+='<path d="M 0,'+(210-i*30)+' Q 100,'+(170-i*30)+' 200,'+(200-i*30)+' T 380,'+(180-i*30)+' T 500,'+(190-i*30)+'" fill="none" stroke="'+c+'" stroke-width="12" opacity=".12" style="animation:auroraWave 8s ease-in-out infinite alternate;animation-delay:-'+(i*2)+'s"/>';});h+='</g>';}
  h += '</svg></div>';
  return h;
}

function kingdomDamage() {
  var el = document.getElementById('kingdom-scene');
  if (!el) return;
  el.className = el.className.replace(/ damage| flourish/g, '') + ' damage';
  setTimeout(function() { if (el) el.className = el.className.replace(' damage', ''); }, 600);
}
function kingdomFlourish() {
  var el = document.getElementById('kingdom-scene');
  if (!el) return;
  el.className = el.className.replace(/ damage| flourish/g, '') + ' flourish';
  setTimeout(function() { if (el) el.className = el.className.replace(' flourish', ''); }, 1400);
}
function getRank(days) {
  var queenMode = D.titleStyle === 'queen';
  var ranks = [
    {title:'Newcomer',    next:'Starter',           sym:'\u2619', threshold:0,  nextThreshold:1},
    {title:'Starter',       next:'Apprentice',         sym:'\u2726', threshold:1,  nextThreshold:7},
    {title:'Apprentice',     next:'Seeker',  sym:'\u2694', threshold:7,  nextThreshold:14},
    {title:'Seeker',next:'Achiever',       sym:'\u2720', threshold:14, nextThreshold:30},
    {title:'Achiever',     next:'Champion',sym:'\u269C',threshold:30,nextThreshold:60},
    {title:'Champion',next:'Leader',  sym:'\u265B', threshold:60, nextThreshold:90},
    {title:'Leader',      next:'Mentor',       sym:'\u265A', threshold:90, nextThreshold:180},
    {title:'Mentor',   next:'Guide',           sym:'\u265C', threshold:180,nextThreshold:270},
    {title:'Guide',       next:'Sage',           sym:'\u2766', threshold:270,nextThreshold:365},
    {title:'Sage',       next:'Pioneer', sym:'\u2727', threshold:365,nextThreshold:730},
    {title:'Pioneer', next:'Cosmos', sym:'\u2726', threshold:730,nextThreshold:1000},
    {title:'Cosmos',       next:null,             sym:'\u2727', threshold:1000,nextThreshold:1/0}
  ];
  for (var i = ranks.length - 1; i >= 0; i--) {
    if (days >= ranks[i].threshold) return ranks[i];
  }
  return ranks[0];
}

function _rankIconHTML(title, size) {
  size = size || 14;
  var c = {
    'Newcomer':'<path d="M9,2 h6 v7 h7 v6 h-7 v7 h-6 v-7 h-7 v-6 h7 z" fill="currentColor"/>',
    'Starter':'<path d="M4,4 h7 v16 h-7 z M13,4 h7 v16 h-7 z M11,4 h2 v16 h-2 z" fill="currentColor"/>',
    'Apprentice':'<path d="M6,4 L18,20 M18,4 L6,20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="6" cy="4" r="2.2" fill="currentColor"/><circle cx="18" cy="4" r="2.2" fill="currentColor"/><rect x="7" y="19" width="10" height="3" rx="1" fill="currentColor"/>',
    'Seeker':'<path d="M12,2 L22,6 L22,15 Q12,22 2,15 L2,6 Z" fill="currentColor"/>',
    'Achiever':'<path d="M6,16 L6,8 Q6,3 12,2 Q18,3 18,8 L18,16 Z" fill="currentColor"/><path d="M10,5 Q12,3 14,5" stroke="currentColor" stroke-width="1.2" fill="none" opacity=".4"/>',
    'Champion':'<path d="M3,16 L7,4 L12,10 L17,4 L21,16 Z" fill="currentColor"/><rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor"/><circle cx="7" cy="8" r="1.5" opacity=".6" fill="currentColor"/><circle cx="12" cy="11" r="1.5" opacity=".6" fill="currentColor"/><circle cx="17" cy="8" r="1.5" opacity=".6" fill="currentColor"/>',
    'Leader':'<path d="M5,20 h14 v-12 h-14 z" fill="currentColor"/><rect x="5" y="8" width="4" height="4" fill="currentColor"/><rect x="15" y="8" width="4" height="4" fill="currentColor"/><rect x="9" y="13" width="6" height="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>',
    'Mentor':'<path d="M17,2 A14,14 0 1,1 8,18 A10,10 0 1,0 17,2" fill="currentColor"/><circle cx="17" cy="12" r="2" opacity=".6" fill="currentColor"/>',
    'Guide':'<path d="M12,2 L14.5,8.6 L21.5,9 L16,13.5 L17.5,20 L12,16.5 L6.5,20 L8,13.5 L2.5,9 L9.5,8.6 Z" fill="currentColor"/>',
    'Sage':'<rect x="7" y="10" width="10" height="7" rx="2" fill="currentColor"/><circle cx="16" cy="7" r="4" fill="currentColor"/><path d="M7,13 Q3,10 4,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><rect x="7" y="17" width="2.5" height="5" rx="1" fill="currentColor"/><rect x="12" y="17" width="2.5" height="5" rx="1" fill="currentColor"/>',
    'Pioneer':'<circle cx="12" cy="12" r="6" fill="currentColor"/><ellipse cx="12" cy="12" rx="10.5" ry="4" transform="rotate(-20 12 12)" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="19" cy="7" r="1.6" fill="currentColor"/>',
    'Cosmos':'<path d="M12 2 L13.6 10.4 L22 12 L13.6 13.6 L12 22 L10.4 13.6 L2 12 L10.4 10.4 Z" fill="currentColor"/><circle cx="18" cy="5" r="1.2" fill="currentColor" opacity=".6"/><circle cx="6" cy="18" r="1" fill="currentColor" opacity=".5"/>'
  };
  var charge = c[title];
  if (!charge) return '';
  return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" style="vertical-align:middle;display:inline-block;margin:-2px 0">' + charge + '</svg>';
}

function ordinal(n) {
  var s = ['th','st','nd','rd'];
  var v = n % 100;
  return n + (s[(v-20)%10] || s[v] || s[0]);
}
function journeyDate() {
  var raw = D.joinDate || (D.sobriety && D.sobriety.startDate);
  if (!raw) return 'Your journey awaits';
  var start = new Date(raw);
  var startLabel = start.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  var elapsed = journeyElapsed(start);
  return 'Started ' + startLabel + ' \u2022 ' + elapsed;
}
function journeyElapsed(start) {
  var now = new Date();
  var years = now.getFullYear() - start.getFullYear();
  var months = now.getMonth() - start.getMonth();
  var days = now.getDate() - start.getDate();
  if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if (months < 0) { years--; months += 12; }
  var totalDays = daysBetween(start, now);
  if (years > 0) return years + ' year' + (years !== 1 ? 's' : '') + (months > 0 ? ', ' + months + ' month' + (months !== 1 ? 's' : '') : '');
  if (months > 0) return months + ' month' + (months !== 1 ? 's' : '') + (days > 0 ? ', ' + days + ' day' + (days !== 1 ? 's' : '') : '');
  if (totalDays >= 7) return Math.floor(totalDays / 7) + ' week' + (Math.floor(totalDays / 7) !== 1 ? 's' : '') + (totalDays % 7 ? ', ' + (totalDays % 7) + ' day' + (totalDays % 7 !== 1 ? 's' : '') : '');
  if (totalDays > 0) return totalDays + ' day' + (totalDays !== 1 ? 's' : '');
  return 'today';
}

function kingdomTrackerHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var isActive = D.sobriety.startDate ? true : false;
  var levelNames = ['Seed','Root','Sprout','Grove','Garden','Meadow','Forest','River','Mountain','Ocean','World'];
  var levelDescs = ['A new beginning','Roots reach the soil','New shoots follow the light','The land takes shape','A garden takes hold','Open meadow, tall grass','Deep green forest','A steady, flowing river','High mountain air','The wide blue ocean','A whole world, in bloom'];
  var h = kingdomHTML();
  h += '<div class="card" style="text-align:center;margin-top:-4px;border-top-left-radius:0;border-top-right-radius:0;padding:10px 14px 12px">';
  if (isActive) {
    h += '<div style="display:flex;align-items:baseline;justify-content:center;gap:4px;margin-bottom:6px"><strong style="font-size:28px;color:var(--primary)">' + days + '</strong><span style="font-size:13px;color:var(--text-light)">days sober</span></div>';
    h += '<div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:6px">' + levelNames[Math.min(level,10)] + ' &mdash; ' + (levelDescs[Math.min(level,10)]||'') + '</div>';
    h += soberTimerHTML();
    h += '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-outline btn-sm" onclick="recordRelapse()" style="flex:1;border-color:var(--danger);color:var(--danger)">Record Relapse</button>';
    h += '<button class="btn btn-outline btn-sm" onclick="endSobriety()" style="flex:1">End Sobriety</button></div>';
  } else {
    h += '<div style="font-size:14px;color:var(--muted);margin-bottom:6px">Your space awaits</div>';
    h += '<button class="btn btn-primary btn-sm" onclick="showOnboarding()">Begin Your Journey</button>';
  }
  h += '</div>';
  return h;
}


function homePageHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var isActive = !!D.sobriety.startDate;
  var h = '';

  if (!isActive) {
    // Abandoned kingdom
    h += '<div class="card" style="padding:0;overflow:hidden">';
    h += kingdomHTML();
    h += '<div style="padding:24px 20px;text-align:center">';
    h += '<div style="font-size:22px;font-weight:700;color:var(--text);margin-bottom:4px">Your Journey Awaits</div>';
    h += '<div style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.6">The path is open \u2014 and it\u2019s waiting for you.<br>Start your journey and build something real.</div>';
    h += '<button class="btn btn-primary" onclick="showOnboarding()" style="width:100%;padding:14px;font-size:15px;font-weight:700">Start Your Journey</button>';
    h += '</div></div>';
return h;
}

  // === ACTIVE HOME PAGE ===

  // 0. Journey date banner (top of home page)
  h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--accent);letter-spacing:.5px;font-style:italic;padding:6px 0 4px;font-family:Georgia,serif;border-bottom:1px solid var(--border);margin-bottom:8px">';
  h += journeyDate();
  h += '</div>';

  // 1. Kingdom scene (full-width, no top border radius)
  h += '<div class="card" style="padding:0;overflow:hidden;border-radius:16px 16px 0 0">';
  h += kingdomHTML();
  h += '</div>';

  // 2. Stats bar
  h += '<div class="card" style="margin-top:-4px;border-top-left-radius:0;border-top-right-radius:0;padding:12px 10px 10px">';
  h += '<div style="display:flex;justify-content:space-around;align-items:center">';
  h += '<div style="text-align:center;flex:1"><div style="font-size:24px;font-weight:800;color:var(--primary)">' + days + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">DAYS</div></div>';
  h += '<div style="text-align:center;flex:1"><div style="font-size:22px;font-weight:700;color:#8a6a4a">' + kingdomPopulation(days) + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">COMMUNITY</div></div>';
  h += '</div>';
  h += '</div>';

  // 3. Sobriety timer (right under planet)
  h += soberTimerHTML();

  // 4. Quick actions
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0">';
  h += '<button class="btn btn-primary btn-sm" onclick="goTo(\'journal\')" style="background:linear-gradient(135deg,#5a3a1a,#7a5a3a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2726</span> Journal</button>';
  h += '<button class="btn btn-primary btn-sm" onclick="showCravingBreaker()" style="background:linear-gradient(135deg,#5a2a2a,#7a4a4a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2694</span> Craving</button>';
  h += '<button class="btn btn-primary btn-sm" onclick="startBreathe()" style="background:linear-gradient(135deg,#2a4a5a,#4a6a7a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2766</span> Breathe</button>';
  h += '</div>';

  return h;
}

function missionDayNumber() {
  return Math.floor(Date.parse(new Date().toDateString()) / 86400000);
}
function missionTrunc(s) {
  var x = String(s || '').trim();
  return x.length > 42 ? x.slice(0, 42) + '\u2026' : x;
}
function buildMissionPool() {
  var pool = [];
  var gL = userList(D.goals);
  var cL = userList((D.relapsePlan && D.relapsePlan.coping) || D.track);
  var tL = userList((D.relapsePlan && D.relapsePlan.triggers) || D.triggers);
  var dn = missionDayNumber();
  if (gL.length) pool.push({ type: 'goal', label: 'Take one small step toward: "' + missionTrunc(gL[dn % gL.length]) + '"' });
  if (cL.length) pool.push({ type: 'cope', label: 'Practice a tool from your coping kit: "' + missionTrunc(cL[dn % cL.length]) + '"' });
  if (tL.length) pool.push({ type: 'watch', label: 'Keep watch for "' + missionTrunc(tL[dn % tL.length]) + '". If it shows up, name it and reach for your coping kit.' });
  pool.push({ type: 'stay', label: 'Choose recovery today, one day at a time. When the day is done, reflect on why you started.' });
  pool.push({ type: 'grate', label: 'Log three things you are grateful for today. Gratitude builds resilience.' });
  return pool;
}
function getDailyMission() {
  var today = new Date().toDateString();
  if (D._missionCache && D._missionCache.date === today) return D._missionCache;
  var pool = buildMissionPool();
  var m = pool[missionDayNumber() % pool.length];
  var entry = { date: today, type: m.type, label: m.label, done: false };
  var log = (D.missionLog || []);
  for (var i = 0; i < log.length; i++) {
    if (log[i].date === today && log[i].done) { entry.done = true; break; }
  }
  D._missionCache = entry;
  return entry;
}
function completeDailyMission() {
  var m = getDailyMission();
  var today = new Date().toDateString();
  if (!D.missionLog) D.missionLog = [];
  var found = false;
  for (var i = 0; i < D.missionLog.length; i++) {
    if (D.missionLog[i].date === today) { D.missionLog[i].done = true; D.missionLog[i].doneAt = Date.now(); found = true; break; }
  }
  if (!found) D.missionLog.push({ date: today, label: m.label, done: true, doneAt: Date.now() });
  D.missionLog = D.missionLog.slice(-120);
  if (D._missionCache) D._missionCache.done = true;
  saveData();
  try { playSound('quest'); } catch(e) {}
  render();
}
function missionStreak() {
  var log = (D.missionLog || []).slice();
  var s = 0, d = new Date();
  for (var i = 0; i < 730; i++) {
    var ds = d.toDateString();
    var hit = log.some(function(e) { return e.date === ds && e.done; });
    if (!hit) break;
    s++; d.setDate(d.getDate() - 1);
  }
  return s;
}
function missionWeekCount() {
  var log = (D.missionLog || []).slice();
  var n = 0;
  for (var k = 0; k < 7; k++) {
    var d = new Date(); d.setDate(d.getDate() - k);
    var ds = d.toDateString();
    if (log.some(function(e) { return e.date === ds && e.done; })) n++;
  }
  return n;
}
function missionHTML() {
  var m = getDailyMission();
  var streak = missionStreak();
  var week = missionWeekCount();
  var dots = '';
  for (var i = 6; i >= 0; i--) {
    var d = new Date(); d.setDate(d.getDate() - i);
    var ds = d.toDateString();
    var hit = (D.missionLog || []).some(function(e) { return e.date === ds && e.done; });
    dots += '<span style="width:13px;height:13px;border-radius:7px;background:' + (hit ? 'var(--accent)' : 'var(--border)') + ';display:inline-block"></span>';
  }
  var stageIcon = '\uD83D\uDCA7', stageText = 'Complete missions to feed your world.';
  if (week >= 6) { stageIcon = '\uD83C\uDF43'; stageText = 'Your world is lush. Keep the streak alive.'; }
  else if (week >= 4) { stageIcon = '\uD83C\uDF38'; stageText = 'Your world is blooming.'; }
  else if (week >= 3) { stageIcon = '\uD83C\uDF31'; stageText = 'Seeds are sprouting in your world.'; }
  var h = '<div class="card" id="mission-card" style="border-left:3px solid var(--accent);background:linear-gradient(135deg,rgba(16,185,129,.08),var(--card))"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px"><h3 style="font-size:14px;margin:0">\uD83D\uDDD3 ' + t('Today\'s Mission') + '</h3><span class="btn btn-sm" style="width:auto;font-size:11px;padding:3px 10px;background:rgba(16,185,129,.12);color:var(--accent);border:1px solid var(--accent)">' + streak + ' day streak \uD83D\uDD25</span></div>';
  h += '<div style="font-size:13px;font-weight:600;line-height:1.55;margin-bottom:8px">' + safe(m.label) + '</div>';
  if (m.done) {
    h += '<div style="display:flex;align-items:center;gap:8px;padding:8px;border-radius:8px;background:rgba(16,185,129,.14);margin-bottom:6px"><span style="font-size:18px">\u2705</span><div style="font-size:12px;font-weight:600;color:var(--accent)">' + t('Completed today') + ' \u2014 your world feels brighter.</div></div>';
  } else {
    h += '<button class="btn btn-primary" onclick="completeDailyMission()" style="width:100%">\u2713 ' + t('Mark Mission Complete') + '</button>';
  }
  h += '<div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:9px"><div style="display:flex;gap:4px;align-items:center">' + dots + '</div><div style="text-align:right"><div style="font-size:10px;color:var(--muted)">' + week + '/7 this week</div><div style="font-size:10px;color:var(--muted)">' + stageIcon + ' ' + safe(stageText) + '</div></div></div>';
  h += '</div>';
  return h;
}
function homeHTML() {
  var h = '';

  // First-run age/consent note
  h += consentCardHTML();

  // Atlas � the central hub
  h += homePageHTML();
  h += missionHTML();

  // Install prompt card — inviting the user to add the app to their home screen
  h += installCardHTML();

  // Backup safety net for non-account users
  h += backupCardHTML();

  // Crisis widget � always visible on home
  h += '<div class="card" style="border-left:4px solid var(--danger);padding:12px;cursor:pointer;background:linear-gradient(135deg,rgba(220,38,38,.04),var(--card))" onclick="showSOS()"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:28px;line-height:1">&#128222;</div><div style="flex:1"><div style="font-weight:700;font-size:14px;color:var(--danger)">'+t('Need help right now?')+'</div><div style="font-size:12px;color:var(--muted)">'+t('SOS � crisis support is available 24/7')+'</div></div><span style="font-size:18px;color:var(--muted)">&#8250;</span></div></div>';

  h += pledgeHTML();

  h += dailyQuote();

  h += recoveryGoalsHTML();

  // Time capsule ready notification
  if (D.timeCapsules) {
    var tcReady = D.timeCapsules.filter(function(c){return Date.now() >= c.unlockAt && !c.unlocked});
    if (tcReady.length) {
      h += '<div class="card" style="border-left:4px solid var(--accent);cursor:pointer;background:linear-gradient(135deg,#f5efe6,var(--card))" onclick="goTo(\'timecapsule\')">';
      h += '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:32px">&#9203;</div><div><div style="font-weight:700;font-size:15px">Time Capsule'+(tcReady.length>1?'s':'')+' Ready!</div><div style="font-size:12px;color:var(--muted)">You have '+tcReady.length+' message'+(tcReady.length>1?'s':'')+' waiting for you. Tap to open.</div></div></div></div>';
    }
  }

  h += pendingFollowUpHTML();
  h += accPendingHTML();

  h += '<div style="text-align:center;margin:4px 0 8px"><button class="btn btn-sm btn-outline" onclick="showShareCard()" style="width:100%">&#x265B; '+t('Share My Progress')+'</button></div>';

  // Famous recovery figure (matched to user's addictions)
  var userAddictions = D.targetAddictions || [];
  var matchedFigs = userAddictions.length ? FAMOUS_RECOVERY.filter(function(f){ return f.types.some(function(t){ return userAddictions.indexOf(t) >= 0; }); }) : [];
  var hadMatches = matchedFigs.length > 0;
  if (!matchedFigs.length) matchedFigs = FAMOUS_RECOVERY;
  if (matchedFigs.length) {
    var pick = matchedFigs[Math.floor(Math.random() * matchedFigs.length)];
    var matched = hadMatches && pick.types.some(function(t){ return userAddictions.indexOf(t) >= 0; });
    var years = recoveryYears(pick);
    var icon = addictionIcon(pick.types);
    var first = (pick.name.split(/\s+/)[0] || 'Y').replace(/[()]/g, '');
    h += '<div class="card" style="border-left:3px solid var(--primary);padding:14px;background:linear-gradient(160deg,var(--card),var(--primary-light))">';
    h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><span style="font-size:22px">&#x265B;</span><div style="flex:1;min-width:0"><div style="font-weight:800;font-size:14px;letter-spacing:.3px">'+t('They Recovered Too')+'</div><div style="font-size:11px;color:var(--muted)">'+t('Real people proved recovery is possible')+'</div></div>'+(matched?'<span class="badge badge-green">'+t('Matched to you')+'</span>':'')+'</div>';
    h += '<div style="display:flex;gap:10px;align-items:center">';
    h += '<div style="width:48px;height:48px;border-radius:50%;flex:0 0 48px;background:linear-gradient(135deg,var(--primary),#34d399);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;box-shadow:0 2px 6px rgba(0,0,0,.15)">'+escText(first.charAt(0).toUpperCase())+'</div>';
    h += '<div style="flex:1;min-width:0">';
    h += '<div style="font-weight:700;font-size:15px">'+escText(pick.name)+'</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+icon+' '+t('Overcame')+' <strong style="color:var(--text)">'+escText(pick.addiction)+'</strong>'+(years?' <span style="display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:999px;padding:1px 8px;font-size:11px;font-weight:700;color:var(--primary);margin-left:4px">'+years+' '+t('yrs sober')+'</span>':'')+'</div>';
    h += '</div></div>';
    h += '<div style="margin-top:12px;padding:10px 12px;border-left:3px solid var(--accent);background:var(--card);border-radius:0 10px 10px 0;font-size:13px;font-style:italic;line-height:1.5;color:var(--muted)">' + pick.quote + '</div>';
    h += '<div style="display:flex;gap:6px;margin-top:10px">';
    h += '<button class="btn btn-sm btn-primary" id="howRecoveredBtn" onclick="toggleRecoveryStory()" style="flex:1">' + t('How They Recovered') + '</button>';
    h += '<button class="btn btn-sm btn-outline" onclick="nextRecoveryStory()" style="width:auto" title="'+t('Show another recovery story')+'">&#x21BB; '+t('Another')+'</button>';
    h += '</div>';
    h += '<div id="howRecoveredBox" style="display:none;margin-top:10px">';
    h += '<div style="background:var(--card);border:1px solid var(--border);border-radius:12px;padding:12px">';
    h += '<div style="display:flex;align-items:center;gap:6px;font-weight:700;font-size:11px;letter-spacing:.5px;text-transform:uppercase;color:var(--primary);margin-bottom:8px"><span style="font-size:15px">&#x2728;</span>'+t('How they did it')+'</div>';
    h += '<div style="font-size:13px;line-height:1.65;color:var(--text)">' + pick.story + '</div>';
    h += '<div style="margin-top:10px;padding:10px 12px;border-left:3px solid var(--primary);background:var(--primary-light);border-radius:0 10px 10px 0;font-size:13px;font-style:italic;line-height:1.5">' + pick.quote + '</div>';
    h += '<div style="margin-top:10px;text-align:center;font-size:12px;color:var(--muted)">'+t('If they can reclaim their life, so can you.')+'</div>';
    h += '</div></div>';
    h += '</div>';
  }

  return h;
}

function toggleRecoveryStory() {
  var box = document.getElementById('howRecoveredBox');
  var btn = document.getElementById('howRecoveredBtn');
  if (!box || !btn) return;
  var open = box.style.display !== 'none';
  box.style.display = open ? 'none' : 'block';
  btn.innerHTML = open ? t('How They Recovered') : t('Hide Story');
  if (!open) box.scrollIntoView({behavior:'smooth', block:'nearest'});
}

function nextRecoveryStory() {
  delete _pageCache[pg];
  render();
}

function addictionIcon(types) {
  var icons = {'Alcohol':'&#127870;','Drugs (prescription/illicit)':'&#128138;','Gambling':'&#127922;','Sex/Love':'&#128157;','Pornography':'&#128293;'};
  if (!types || !types.length) return '&#10024;';
  return icons[types[0]] || '&#10024;';
}

function escText(s) {
  return (s == null ? '' : String(s)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function recoveryYears(pick) {
  if (!pick || !pick.story) return null;
  var s = pick.story;
  var m = s.match(/sober for over (\d{1,3}) years/i) || s.match(/sober for more than (\d{1,3}) years/i) || s.match(/sober for (\d{1,3}) years/i) || s.match(/clean for over (\d{1,3}) years/i);
  if (m) return m[1];
  var y = s.match(/(?:sober|clean)\s+(?:since|by)\s+(1\d{3}|20[0-2]\d)/i)
       || s.match(/got (?:sober|clean) in (1\d{3}|20[0-2]\d)/i)
       || s.match(/quit drinking (?:and drugs )?in (1\d{3}|20[0-2]\d)/i)
       || s.match(/quit (?:in|by) (1\d{3}|20[0-2]\d)/i);
  if (y) {
    var yrs = new Date().getFullYear() - parseInt(y[1], 10);
    if (yrs >= 0) return yrs;
  }
  return null;
}

