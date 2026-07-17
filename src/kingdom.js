
// ====== HOME ======
function characterGreetingHTML() {
  var h = '';
  var chars = [
    {name:'Arthur',color:'var(--avatar-arthur)',svg:'<svg viewBox="0 0 16 16" width="18" height="18" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg>',
     msgs:[
       "I've been watching your patterns. You're showing up more. That's the data that matters.",
       "I notice you've been logging regularly. Every entry sharpens the map of your recovery.",
       "Your consistency is building a reliable trend. Keep feeding me data and I'll keep finding insights.",
       "Journal entries are up. Mood tracking is steady. The numbers don't lie — you're putting in the work.",
       "I cross-referenced your check-ins and habits. There's a clear correlation: showing up daily builds momentum."
     ]},
    {name:'Gertrude',color:'var(--avatar-gertrude)',svg:'<svg viewBox="0 0 16 16" width="18" height="18" fill="#fff"><path d="M8 1L3 3.5v5c0 3.5 2 5.5 5 6.5 3-1 5-3 5-6.5v-5z"/><rect x="5" y="6" width="6" height="1" rx=".2"/><line x1="8" y1="6" x2="8" y2="4" stroke="#fff" stroke-width=".8"/></svg>',
     msgs:[
       "Stand ready. Your shield is forged. Today, nothing gets past you.",
       "You've faced worse battles than this and held the line. Today is no different.",
       "Your safety plan is your armor. You've prepared for this. Trust your training.",
       "Another day, another victory. You don't need to win every fight — just this one.",
       "I've seen your strength. You are more resilient than whatever faces you today."
     ]},
     {name:'Oswald',color:'var(--avatar-oswald)',svg:'<svg viewBox="0 0 16 16" width="18" height="18" fill="#fff"><path d="M8 1L4 5v3c0 3 1.5 5 4 6 2.5-1 4-3 4-6V5z"/><g transform="translate(8,8)"><use href="#star4" transform="scale(2)" fill="rgba(255,255,255,.6)"/></g></svg>',
     msgs:[
       "The path ahead may twist, but you've already walked through shadow and emerged. Trust your steps.",
       "Every day of recovery adds to your power. You're weaving strength stronger than any darkness.",
       "Look back and see how far you've come. That is not luck — it is your own will, recognized and claimed.",
       "The mist clears day by day. What felt impossible is now your daily rhythm.",
       "You carry wisdom you didn't have a month ago. Each struggle taught you something. That knowledge is your staff."
     ]}
  ];
  var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  var pick = chars[dayOfYear % chars.length];
  var hr = new Date().getHours();
  var timeWord = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
  var dayMod = Math.floor(dayOfYear / chars.length);
  var msg = pick.msgs[dayMod % pick.msgs.length];
  var rank = getRank(soberDays());
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:10px 14px;background:linear-gradient(135deg,var(--primary-light),var(--card))">';
  h += '<div style="display:flex;align-items:center;gap:10px">';
  h += '<div style="width:36px;height:36px;border-radius:18px;background:' + pick.color + ';display:flex;align-items:center;justify-content:center;flex-shrink:0;cursor:pointer" onclick="showCharacterLore(\'' + pick.name + '\')" title="Learn about ' + pick.name + '">' + pick.svg + '</div>';
  h += '<div style="flex:1"><div style="font-size:11px;color:var(--muted);margin-bottom:1px">Good ' + timeWord + ' from <strong style="color:var(--primary);cursor:pointer" onclick="showCharacterLore(\'' + pick.name + '\')">' + pick.name + '</strong> &mdash; to ' + _rankIconHTML(rank.title, 13) + ' ' + rank.title + '</div><div style="font-size:13px;line-height:1.5">' + msg + '</div></div>';
  h += '</div></div>';
  return h;
}

function showCharacterLore(name) {
  var lore = {
    Arthur: {
      title: 'Lord of the Long View',
      desc: 'Once a court advisor in a fallen kingdom, Arthur learned that patterns tell the truth where words deceive. He now serves as your realm\'s strategist \u2014 tracking your data, spotting trends, and alerting you to hidden risks before they become crises.',
      role: 'Analyzes patterns, correlates data, warns of risk factors',
      quote: 'The numbers don\u2019t lie \u2014 but they do whisper. You just have to learn to listen.',
      color: 'var(--avatar-arthur)',
      svg: '<svg viewBox="0 0 16 16" width="40" height="40" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg>'
    },
    Gertrude: {
      title: 'Knight of the Inner Ward',
      desc: 'Gertrude was captain of the royal guard in three kingdoms before she found her true calling \u2014 protecting those who fight inner battles. She believes the hardest wars are fought in the quiet of one\u2019s own mind, far from any battlefield.',
      role: 'Builds safety plans, guards your boundaries, helps you hold the line',
      quote: 'A shield isn\u2019t for hiding behind. It\u2019s for holding your ground while you ready your next move.',
      color: 'var(--avatar-gertrude)',
      svg: '<svg viewBox="0 0 16 16" width="40" height="40" fill="#fff"><path d="M8 1L3 3.5v5c0 3.5 2 5.5 5 6.5 3-1 5-3 5-6.5v-5z"/><rect x="5" y="6" width="6" height="1" rx=".2"/><line x1="8" y1="6" x2="8" y2="4" stroke="#fff" stroke-width=".8"/></svg>'
    },
    Oswald: {
      title: 'Keeper of the Hidden Path',
      desc: 'Oswald walked every road \u2014 the righteous and the ruinous \u2014 before finding his way to the Round Table. He guides others through the mist using the lamp of experience rather than the map of theory.',
      role: 'Guides reflection, offers wisdom, helps find meaning in struggle',
      quote: 'The path isn\u2019t straight. But every step you\u2019ve taken has brought you here \u2014 and here is exactly where you need to be.',
      color: 'var(--avatar-oswald)',
      svg: '<svg viewBox="0 0 16 16" width="40" height="40" fill="#fff"><path d="M8 1L4 5v3c0 3 1.5 5 4 6 2.5-1 4-3 4-6V5z"/><g transform="translate(8,8)"><use href="#star4" transform="scale(2)" fill="rgba(255,255,255,.6)"/></g></svg>'
    }
  };
  var c = lore[name];
  if (!c) return;
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center;padding:24px">' +
    '<div style="width:56px;height:56px;border-radius:28px;background:' + c.color + ';display:flex;align-items:center;justify-content:center;margin:0 auto 8px">' + c.svg + '</div>' +
    '<div style="font-size:20px;font-weight:800;color:var(--primary)">' + name + '</div>' +
    '<div style="font-size:11px;color:var(--gold);margin-bottom:10px;font-family:MedievalSharp,serif">' + c.title + '</div>' +
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
  var days=soberDays();var streak=D.streak||0;var hour=new Date().getHours();var isNight=hour<6||hour>=20;
  var today=new Date().toDateString();var cravedToday=D.cravings&&D.cravings.some(function(c){var d=c.date||(c.timestamp?new Date(c.timestamp).toDateString():'');return d===today});
  var relapsedToday=D.relapseHistory&&D.relapseHistory.length>0&&D.relapseHistory[D.relapseHistory.length-1].date===today;
  var isMilestone=days>0&&(days%30===0||days%90===0||days%365===0);
  if(relapsedToday)return'storm';if(isMilestone&&days>=30)return'rainbow';
  if(isNight&&days>=100)return'aurora';if(streak>=30)return'clear';
  if(streak>=7)return'clear';if(cravedToday&&streak<3)return'rain';
  if(streak>=3)return'cloudy';if(days>=1)return'fog';return'mist';
}
function kingdomHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var weather = getKingdomWeather();
  // Daily quest upgrade check
  var today = new Date().toDateString();
  D.dailyQuests = D.dailyQuests || { date: '', done: [] };
  if (D.dailyQuests.completed && !D.dailyQuests.done) { D.dailyQuests.done = D.dailyQuests.completed; delete D.dailyQuests.completed; }
  var isUpgraded = D.dailyQuests.date === today && (D.dailyQuests.done || []).length >= 3;
  var h = '<div class="kingdom-scene tier-' + level + (isUpgraded ? ' k-upgraded' : '') + ' k-' + weather + '" id="kingdom-scene">';
  h += '<svg viewBox="0 0 500 280">';
  h += '<rect width="500" height="280" class="k-sky"/>';
  // Stars (hidden in day, visible at night via CSS)
  h += '<g class="k-stars">';
  var sp = [[50,30],[120,20],[200,45],[310,25],[400,40],[460,30],[80,70],[160,55],[250,65],[340,50],[430,60],[40,100],[140,90],[230,80],[320,95],[410,85],[480,90],[100,120],[190,110],[280,125],[370,115],[450,120],[60,140],[170,135],[260,145],[350,130],[440,140]];
  for (var si = 0; si < sp.length; si++) h += '<circle cx="' + sp[si][0] + '" cy="' + sp[si][1] + '" r="1.2"/>';
  h += '</g>';
  if (level >= 5) h += '<circle cx="410" cy="50" r="18" class="k-sun"/>';
  if (level >= 5) h += '<g class="k-clouds"><ellipse cx="100" cy="42" rx="30" ry="10"/><ellipse cx="120" cy="38" rx="20" ry="8"/><ellipse cx="360" cy="35" rx="25" ry="8"/><ellipse cx="380" cy="30" rx="18" ry="7"/></g>';
  h += '<path d="M0,195 Q80,155 180,190 Q250,165 320,185 Q400,160 500,190 L500,198 L0,198 Z" class="k-hills"/>';
  h += '<rect y="196" width="500" height="84" class="k-ground"/>';
  h += '<defs><pattern id="stone" width="16" height="12" patternUnits="userSpaceOnUse"><path d="M0,6 L16,6 M8,0 L8,6 M0,6 L0,12 M0,12 L16,12" stroke="rgba(0,0,0,.07)" stroke-width=".5" fill="none"/></pattern></defs>';
  h += '<g class="k-castle-group">';
  if (level === 0) {
    h += '<path d="M195,198 L195,148 L205,158 L215,142 L225,153 L235,140 L245,152 L255,144 L265,157 L275,147 L285,154 L295,150 L305,198 Z" class="k-keep"/>';
    h += '<path d="M200,198 L200,162 L210,172 L220,158 L230,168 L240,158 L250,170 L260,158 L270,168 L280,161 L290,170 L300,198 Z" class="k-keep" opacity=".45"/>';
    h += '<circle cx="178" cy="192" r="6" class="k-rubble"/><circle cx="184" cy="186" r="4" class="k-rubble"/><circle cx="315" cy="190" r="5" class="k-rubble"/><circle cx="322" cy="184" r="3" class="k-rubble"/>';
  } else {
    // Keep wall
    h += '<rect x="195" y="105" width="110" height="93" class="k-keep"/>';
    h += '<rect x="195" y="105" width="110" height="93" fill="url(#stone)"/>';
    h += '<rect x="278" y="105" width="27" height="93" fill="rgba(0,0,0,.1)"/>';
    h += '<rect x="193" y="186" width="114" height="12" class="k-keep" opacity=".7"/><rect x="193" y="186" width="114" height="12" fill="url(#stone)" opacity=".7"/>';
    // Damage features — cracked walls and rubble for levels 1-2, fading with time
    if (level <= 2) {
      if (level === 1) {
        h += '<path d="M208,120 L216,118 L218,130 L226,126 L228,138 L236,134" fill="none" stroke="rgba(60,30,10,.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
        h += '<path d="M258,115 L263,124 L260,130 L268,136 L265,142" fill="none" stroke="rgba(60,30,10,.7)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
        h += '<path d="M282,145 L286,152 L283,158 L290,162" fill="none" stroke="rgba(60,30,10,.65)" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>';
        h += '<path d="M234,170 L238,176 L235,182" fill="none" stroke="rgba(60,30,10,.5)" stroke-width="1.2" stroke-linecap="round"/>';
        h += '<circle cx="196" cy="192" r="4.5" class="k-rubble"/><circle cx="204" cy="189" r="3" class="k-rubble"/><circle cx="290" cy="191" r="4" class="k-rubble"/><circle cx="298" cy="187" r="3" class="k-rubble"/><circle cx="305" cy="193" r="2.5" class="k-rubble"/>';
      } else if (level === 2) {
        h += '<path d="M215,130 L220,136 L218,142" fill="none" stroke="rgba(60,30,10,.4)" stroke-width="1.2" stroke-linecap="round"/>';
        h += '<path d="M270,140 L274,146" fill="none" stroke="rgba(60,30,10,.35)" stroke-width="1" stroke-linecap="round"/>';
        h += '<circle cx="202" cy="192" r="3" class="k-rubble"/><circle cx="296" cy="190" r="2.5" class="k-rubble"/>';
      }
    }
    // Roof
    if (level >= 2) {
      h += '<polygon points="190,105 250,70 310,105" class="k-roof"/><polygon points="190,105 250,70 310,105" fill="url(#stone)"/>';
      h += '<polygon points="244,72 250,68 256,72" class="k-roof" opacity=".8"/>';
    } else if (level === 1) h += '<polygon points="195,140 250,120 305,140" class="k-roof" opacity=".5"/><path d="M240,122 L245,118 L250,122 L255,118" fill="none" stroke="rgba(60,30,10,.5)" stroke-width=".8" transform="translate(0,2)"/>';
    // Battlements on keep (level 2+)
    if (level >= 2) {
      h += '<g class="k-cren">';
      for (var ci = 0; ci < 8; ci++) h += '<rect x="' + (195 + ci * 14) + '" y="95" width="10" height="10"/>';
      h += '</g>';
    }
    // Left tower
    if (level >= 4) {
      h += '<rect x="150" y="125" width="43" height="73" class="k-tower"/><rect x="150" y="125" width="43" height="73" fill="url(#stone)"/>';
      h += '<rect x="175" y="125" width="18" height="73" fill="rgba(0,0,0,.08)"/>';
      h += '<rect x="148" y="186" width="47" height="12" class="k-tower" opacity=".7"/>';
      h += '<polygon points="145,125 171.5,100 198,125" class="k-tower-roof"/>';
      // Arrow slit
      h += '<rect x="169" y="145" width="3" height="12" rx="1" fill="rgba(0,0,0,.35)"/>';
      h += '<rect x="170" y="148" width="2" height="2" fill="rgba(255,255,255,.12)"/>';
      // Tower battlements (level 7+)
      if (level >= 7) {
        h += '<g><rect x="150" y="115" width="10" height="10" class="k-tower"/><rect x="164" y="115" width="10" height="10" class="k-tower"/><rect x="178" y="115" width="10" height="10" class="k-tower"/></g>';
      }
    } else if (level >= 2) {
      h += '<rect x="155" y="140" width="35" height="58" class="k-tower" opacity=".7"/>';
    } else if (level === 1) {
      h += '<rect x="160" y="155" width="25" height="43" class="k-tower" opacity=".4"/>';
    }
    // Right tower
    if (level >= 5) {
      h += '<rect x="307" y="125" width="43" height="73" class="k-tower"/><rect x="307" y="125" width="43" height="73" fill="url(#stone)"/>';
      h += '<rect x="333" y="125" width="17" height="73" fill="rgba(0,0,0,.08)"/>';
      h += '<rect x="305" y="186" width="47" height="12" class="k-tower" opacity=".7"/>';
      h += '<polygon points="302,125 328.5,100 355,125" class="k-tower-roof"/>';
      h += '<rect x="327" y="145" width="3" height="12" rx="1" fill="rgba(0,0,0,.35)"/>';
      h += '<rect x="328" y="148" width="2" height="2" fill="rgba(255,255,255,.12)"/>';
      if (level >= 7) {
        h += '<g><rect x="307" y="115" width="10" height="10" class="k-tower"/><rect x="321" y="115" width="10" height="10" class="k-tower"/><rect x="335" y="115" width="10" height="10" class="k-tower"/></g>';
      }
    } else if (level === 4) {
      h += '<rect x="312" y="145" width="30" height="53" class="k-tower" opacity=".5"/>';
    }
    // Door with portcullis
    if (level >= 3) {
      h += '<path d="M 235,198 L 235,163 Q 250,153 265,163 L 265,198 Z" class="k-door"/>';
      h += '<line x1="241" y1="164" x2="241" y2="198" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/><line x1="247" y1="160" x2="247" y2="198" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/><line x1="253" y1="160" x2="253" y2="198" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/><line x1="259" y1="164" x2="259" y2="198" stroke="rgba(0,0,0,.25)" stroke-width="1.2"/>';
    } else if (level >= 1) h += '<path d="M 235,198 L 235,178 Q 250,170 265,178 L 265,198 Z" class="k-door" opacity=".4"/>';
    // Gothic arched windows
    if (level >= 4) {
      h += '<g class="k-windows">';
      h += '<path d="M211,148 L211,133 Q217,125 223,133 L223,148 Z" class="k-window"/>';
      h += '<path d="M211,133 Q217,125 223,133" class="k-window" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>';
      h += '<line x1="217" y1="127" x2="217" y2="148" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>';
      h += '<line x1="211" y1="140" x2="223" y2="140" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>';
      h += '<path d="M275,148 L275,133 Q281,125 287,133 L287,148 Z" class="k-window"/>';
      h += '<path d="M275,133 Q281,125 287,133" class="k-window" fill="none" stroke="rgba(0,0,0,.12)" stroke-width="1"/>';
      h += '<line x1="281" y1="127" x2="281" y2="148" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>';
      h += '<line x1="275" y1="140" x2="287" y2="140" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>';
      h += '</g>';
    }
  }
  h += '</g>';
  // Shop decor: banners, tapestry, torches, enhanced flags
  if (level >= 4) {
    // Stone Banners hanging from keep walls
    if (hasShop('banners')) {
      h += '<rect x="196" y="106" width="4" height="28" rx="1" fill="#6a4a2a" opacity=".7"/>';
      h += '<polygon points="196,106 200,106 198,98" fill="#8a2a2a" opacity=".7"/>';
      h += '<rect x="300" y="106" width="4" height="28" rx="1" fill="#6a4a2a" opacity=".7"/>';
      h += '<polygon points="300,106 304,106 302,98" fill="#8a2a2a" opacity=".7"/>';
    }
    // Royal Tapestry behind throne
    if (hasShop('tapestry')) {
      h += '<rect x="228" y="80" width="44" height="30" rx="2" fill="#4a1a2a" opacity=".6"/>';
      h += '<rect x="231" y="83" width="38" height="24" rx="1" fill="none" stroke="#d4a017" stroke-width=".5" opacity=".5"/>';
      h += '<rect x="235" y="87" width="30" height="16" rx="1" fill="#6a2a3a" opacity=".4"/>';
      h += '<circle cx="250" cy="95" r="5" fill="#d4a017" opacity=".4"/>';
      h += '<circle cx="250" cy="95" r="2.5" fill="#8a2a2a" opacity=".5"/>';
    }
    // Torch Sconces flanking door
    if (hasShop('torches')) {
      h += '<rect x="227" y="164" width="2" height="8" rx=".5" fill="#4a3a2a"/>';
      h += '<ellipse cx="228" cy="163" rx="2.5" ry="3.5" fill="#ff6622" style="transform-origin:228px 163px;animation:torchFlicker .3s ease-in-out infinite"/>';
      h += '<ellipse cx="228" cy="164" rx="1.5" ry="2.5" fill="#ffcc00" style="transform-origin:228px 164px;animation:torchFlicker .25s ease-in-out infinite .1s"/>';
      h += '<circle cx="228" cy="163" r="6" fill="#ff6622" opacity=".12" style="animation:torchFlicker .3s ease-in-out infinite"/>';
      h += '<rect x="271" y="164" width="2" height="8" rx=".5" fill="#4a3a2a"/>';
      h += '<ellipse cx="272" cy="163" rx="2.5" ry="3.5" fill="#ff6622" style="transform-origin:272px 163px;animation:torchFlicker .3s ease-in-out infinite .15s"/>';
      h += '<ellipse cx="272" cy="164" rx="1.5" ry="2.5" fill="#ffcc00" style="transform-origin:272px 164px;animation:torchFlicker .25s ease-in-out infinite .25s"/>';
      h += '<circle cx="272" cy="163" r="6" fill="#ff6622" opacity=".12" style="animation:torchFlicker .3s ease-in-out infinite .15s"/>';
    }
    // Enhanced heraldic flags on towers
    if (hasShop('flags') && level >= 5) {
      h += '<line x1="171.5" y1="100" x2="171.5" y2="60" stroke-width="1.5" class="k-flagpole" opacity=".5"/>';
      h += '<polygon points="171.5,60 185,65 171.5,70" fill="#cc3a3a" opacity=".5" class="k-flag-l"/>';
      h += '<line x1="328.5" y1="100" x2="328.5" y2="60" stroke-width="1.5" class="k-flagpole" opacity=".5"/>';
      h += '<polygon points="328.5,60 342,65 328.5,70" fill="#cc3a3a" opacity=".5" class="k-flag-r"/>';
      // Small pennants on curtain wall guard towers
      if (level >= 12) {
        h += '<line x1="129" y1="143" x2="129" y2="133" stroke-width="1" class="k-flagpole" opacity=".4"/>';
        h += '<polygon points="129,133 136,136 129,139" fill="#aa3a3a" opacity=".4"/>';
        h += '<line x1="371" y1="143" x2="371" y2="133" stroke-width="1" class="k-flagpole" opacity=".4"/>';
        h += '<polygon points="371,133 378,136 371,139" fill="#aa3a3a" opacity=".4"/>';
      }
    }
  }
  // Chimney smoke from castle
  if (level >= 2) {
    h += '<g class="k-chimney-smoke">';
    var s = function(_x,_y,_d){return '<circle cx="'+_x+'" cy="'+_y+'" r="2.5" fill="rgba(180,180,180,.25)" style="animation:smokeRise 3s ease-out infinite;animation-delay:'+_d+'s"/>'};
    if (level >= 2) h += s(250,68,0)+s(248,68,.9)+s(252,68,1.8);
    if (level >= 4) h += s(171.5,98,.4)+s(173,98,1.2)+s(170,98,2.1);
    if (level >= 5) h += s(328.5,98,.7)+s(327,98,1.5)+s(330,98,2.4);
    if (level >= 14) h += s(250,10,.2)+s(248,10,1.0)+s(252,10,1.9);
    h += '</g>';
  }
  // Flags
  if (level >= 4) {
    h += '<g class="k-flags"><line x1="171.5" y1="100" x2="171.5" y2="68" stroke-width="2" class="k-flagpole"/><polygon points="171.5,68 190,73 171.5,78" class="k-flag-l"/>';
    if (level >= 5) h += '<line x1="328.5" y1="100" x2="328.5" y2="68" stroke-width="2" class="k-flagpole"/><polygon points="328.5,68 347,73 328.5,78" class="k-flag-r"/>';
    h += '</g>';
  }
  // Grand tower on keep (level 14+)
  if (level >= 14) {
    h += '<rect x="206" y="36" width="88" height="60" class="k-keep"/>';
    h += '<polygon points="204,36 250,12 296,36" class="k-roof"/>';
    h += '<rect x="245" y="18" width="10" height="18" class="k-roof" opacity=".8"/>';
    h += '<rect x="206" y="36" width="88" height="60" fill="url(#stone)" opacity=".5"/>';
    // Grand windows on tower
    h += '<path d="M 230,56 L 230,44 Q 240,38 250,44 L 250,56 Z" fill="rgba(255,255,200,.25)"/>';
    h += '<line x1="240" y1="40" x2="240" y2="56" stroke="rgba(0,0,0,.15)" stroke-width=".8"/>';
    h += '<line x1="230" y1="50" x2="250" y2="50" stroke="rgba(0,0,0,.15)" stroke-width=".8"/>';
    h += '<path d="M 252,56 L 252,44 Q 262,38 272,44 L 272,56 Z" fill="rgba(255,255,200,.25)"/>';
    h += '<line x1="262" y1="40" x2="262" y2="56" stroke="rgba(0,0,0,.15)" stroke-width=".8"/>';
    h += '<line x1="252" y1="50" x2="272" y2="50" stroke="rgba(0,0,0,.15)" stroke-width=".8"/>';
  }
  // Curtain wall with crenellations across front (level 11+)
  if (level >= 11) {
    h += '<g class="k-curtain">';
    h += '<rect x="130" y="178" width="240" height="18" class="k-keep"/>';
    h += '<rect x="130" y="178" width="240" height="18" fill="url(#stone)" opacity=".5"/>';
    for (var ci2 = 0; ci2 < 16; ci2++) h += '<rect x="' + (132 + ci2 * 15) + '" y="171" width="10" height="7" class="k-keep"/>';
    // Guard towers on curtain wall
    if (level >= 12) {
      h += '<rect x="118" y="155" width="22" height="41" class="k-tower"/><polygon points="116,155 129,143 142,155" class="k-tower-roof"/>';
      h += '<rect x="360" y="155" width="22" height="41" class="k-tower"/><polygon points="358,155 371,143 384,155" class="k-tower-roof"/>';
    }
    h += '</g>';
  }
  // Moat and drawbridge (level 12+)
  if (level >= 12) {
    h += '<g class="k-moat">';
    for (var mi = 0; mi < 4; mi++) {
      h += '<path d="M' + (130 + mi * 60) + ',196 Q' + (160 + mi * 60) + ',203 ' + (190 + mi * 60) + ',196" fill="none" stroke="#3a7a9a" stroke-width="2" opacity=".5"/>';
    }
    // Drawbridge
    h += '<rect x="232" y="187" width="36" height="11" rx="1" fill="#6B3410"/>';
    h += '<line x1="232" y1="187" x2="232" y2="194" stroke="#4a2410" stroke-width="1.5"/><line x1="268" y1="187" x2="268" y2="194" stroke="#4a2410" stroke-width="1.5"/>';
    h += '<line x1="242" y1="187" x2="242" y2="196" stroke="#4a2410" stroke-width=".8"/><line x1="252" y1="187" x2="252" y2="196" stroke="#4a2410" stroke-width=".8"/><line x1="262" y1="187" x2="262" y2="196" stroke="#4a2410" stroke-width=".8"/>';
    h += '</g>';
  }
  // Village buildings - unique structures across the midground (level 5+)
  if (level >= 5) {
    h += '<g class="k-village">';
    // Building definitions: [type, x, y, width, roofColor, wallColor]
    // type: 0=wattle, 1=stone, 2=tavern, 3=smithy, 4=church, 5=windmill
    var bldgs = level >= 14 ? [
      [0,30,186,16,'#6B4423','#d4c8a0'],[1,50,184,18,'#8B4513','#8a8a8a'],[2,74,185,20,'#5a3a1a','#c8b89a'],[3,100,187,16,'#4a2a10','#b8a888'],
      [4,350,183,18,'#3a2a1a','#9a9a8a'],[5,374,185,16,'#6B4423','#d4b89a'],[0,394,186,18,'#5a3a1a','#c4b89a'],[1,418,184,18,'#8B4513','#8a8a9a'],
      [2,442,186,20,'#6B4423','#c8b8a0'],[0,466,188,16,'#5a3a1a','#d4c8b0'],
      [0,55,224,14,'#6B4423','#d4c8a0'],[1,80,226,16,'#8B4513','#8a8a8a'],[2,410,226,16,'#5a3a1a','#c8b89a'],[0,435,228,14,'#6B4423','#d4c8b0']
    ] : level >= 10 ? [
      [0,30,186,16,'#6B4423','#d4c8a0'],[1,50,184,18,'#8B4513','#8a8a8a'],[2,74,185,20,'#5a3a1a','#c8b89a'],[3,100,187,16,'#4a2a10','#b8a888'],
      [4,350,183,18,'#3a2a1a','#9a9a8a'],[5,374,185,16,'#6B4423','#d4b89a'],[0,394,186,18,'#5a3a1a','#c4b89a'],[1,418,184,18,'#8B4513','#8a8a9a'],
      [2,442,186,20,'#6B4423','#c8b8a0'],[0,466,188,16,'#5a3a1a','#d4c8b0'],
      [0,60,226,14,'#6B4423','#d4c8a0'],[1,420,226,16,'#8B4513','#8a8a8a']
    ] : level >= 7 ? [
      [0,30,186,16,'#6B4423','#d4c8a0'],[1,50,184,18,'#8B4513','#8a8a8a'],[2,74,185,20,'#5a3a1a','#c8b89a'],[3,100,187,16,'#4a2a10','#b8a888'],
      [0,394,186,18,'#5a3a1a','#c4b89a'],[1,418,184,18,'#8B4513','#8a8a9a'],[2,442,186,20,'#6B4423','#c8b8a0'],[0,466,188,16,'#5a3a1a','#d4c8b0']
    ] : [
      [0,40,186,16,'#6B4423','#d4c8a0'],[2,74,185,20,'#5a3a1a','#c8b89a'],[3,100,187,16,'#4a2a10','#b8a888'],
      [0,410,186,18,'#5a3a1a','#c4b89a'],[1,440,186,18,'#8B4513','#8a8a9a'],[0,468,188,16,'#5a3a1a','#d4c8b0']
    ];
    for (var bi=0;bi<bldgs.length;bi++) {
      var bt=bldgs[bi][0],bx=bldgs[bi][1],by=bldgs[bi][2],bw=bldgs[bi][3],rc=bldgs[bi][4],wc=bldgs[bi][5];
      var bh=Math.round(bw*0.65);
      if (bt===0) {
        // Wattle cottage: cream walls with timber cross-lines, thatch roof
        h+='<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="1" fill="'+wc+'"/>';
        h+='<line x1="'+(bx+3)+'" y1="'+by+'" x2="'+(bx+3)+'" y2="'+(by+bh)+'" stroke="rgba(60,40,20,.2)" stroke-width=".6"/>';
        h+='<line x1="'+(bx+bw-3)+'" y1="'+by+'" x2="'+(bx+bw-3)+'" y2="'+(by+bh)+'" stroke="rgba(60,40,20,.2)" stroke-width=".6"/>';
        h+='<line x1="'+(bx+1)+'" y1="'+(by+4)+'" x2="'+(bx+bw-1)+'" y2="'+(by+4)+'" stroke="rgba(60,40,20,.15)" stroke-width=".4"/>';
        h+='<line x1="'+(bx+1)+'" y1="'+(by+8)+'" x2="'+(bx+bw-1)+'" y2="'+(by+8)+'" stroke="rgba(60,40,20,.15)" stroke-width=".4"/>';
        h+='<polygon points="'+(bx-2)+','+by+' '+(bx+bw/2)+','+(by-8)+' '+(bx+bw+2)+','+by+'" fill="'+rc+'"/>';
        // Door
        h+='<rect x="'+(bx+bw/2-2)+'" y="'+(by+bh-6)+'" width="4" height="6" rx="1" fill="rgba(40,20,10,.5)"/>';
      } else if (bt===1) {
        // Stone cottage: gray stone with mortar lines, tile roof
        h+='<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="1" fill="'+wc+'"/>';
        h+='<line x1="'+(bx+4)+'" y1="'+by+'" x2="'+(bx+4)+'" y2="'+(by+bh)+'" stroke="rgba(0,0,0,.08)" stroke-width=".5"/>';
        h+='<line x1="'+(bx+8)+'" y1="'+(by+2)+'" x2="'+(bx+8)+'" y2="'+(by+bh)+'" stroke="rgba(0,0,0,.08)" stroke-width=".5"/>';
        h+='<line x1="'+(bx+bw-4)+'" y1="'+(by+2)+'" x2="'+(bx+bw-4)+'" y2="'+(by+bh)+'" stroke="rgba(0,0,0,.08)" stroke-width=".5"/>';
        for (var li=0;li<Math.floor(bh/4);li++) h+='<line x1="'+bx+'" y1="'+(by+2+li*4)+'" x2="'+(bx+bw)+'" y2="'+(by+2+li*4)+'" stroke="rgba(0,0,0,.06)" stroke-width=".4"/>';
        h+='<polygon points="'+(bx-2)+','+by+' '+(bx+bw/2)+','+(by-7)+' '+(bx+bw+2)+','+by+'" fill="'+rc+'"/>';
        h+='<rect x="'+(bx+2)+'" y="'+(by+bh-6)+'" width="3" height="6" rx="1" fill="rgba(40,20,10,.5)"/>';
        h+='<rect x="'+(bx+bw-5)+'" y="'+(by+bh-8)+'" width="3" height="3" rx=".5" fill="rgba(200,200,150,.4)"/>';
      } else if (bt===2) {
        // Tavern: wider, prominent door, sign
        h+='<rect x="'+bx+'" y="'+by+'" width="'+bw+'" height="'+bh+'" rx="1" fill="'+wc+'"/>';
        h+='<rect x="'+(bx+3)+'" y="'+(by+3)+'" width="'+(bw-6)+'" height="'+(bh-9)+'" rx=".5" fill="rgba(0,0,0,.06)"/>';
        h+='<polygon points="'+(bx-2)+','+by+' '+(bx+bw/2)+','+(by-9)+' '+(bx+bw+2)+','+by+'" fill="'+rc+'"/>';
        h+='<rect x="'+(bx+bw/2-3)+'" y="'+(by+bh-7)+'" width="6" height="7" rx="1" fill="rgba(40,20,10,.6)"/>';
        // Sign hanging
        h+='<line x1="'+(bx+4)+'" y1="'+(by+3)+'" x2="'+(bx+4)+'" y2="'+(by+7)+'" stroke="rgba(0,0,0,.3)" stroke-width=".5"/>';
        h+='<rect x="'+(bx+2)+'" y="'+(by+7)+'" width="4" height="3" rx=".5" fill="#d4a017" opacity=".6"/>';
        h+='<text x="'+(bx+4)+'" y="'+(by+9)+'" font-size="2" fill="#4a2a0a" text-anchor="middle" font-weight="700">&#9883;</text>';
      } else if (bt===3) {
        // Smithy: open front, angled roof, chimney
        h+='<rect x="'+bx+'" y="'+(by+3)+'" width="'+bw+'" height="'+(bh-3)+'" rx="1" fill="'+wc+'"/>';
        h+='<polygon points="'+(bx-3)+','+(by+3)+' '+(bx+bw/2)+','+(by-6)+' '+(bx+bw+3)+','+(by+3)+'" fill="'+rc+'"/>';
        // Open front (darker)
        h+='<rect x="'+(bx+2)+'" y="'+(by+bh-6)+'" width="'+(bw-4)+'" height="6" rx=".5" fill="rgba(20,10,5,.5)"/>';
        // Chimney
        h+='<rect x="'+(bx+bw-4)+'" y="'+(by-5)+'" width="3" height="8" rx=".5" fill="#7a6a5a"/>';
        // Sparks
        h+='<circle cx="'+(bx+bw-2.5)+'" cy="'+(by-7)+'" r=".6" fill="#ff6622" opacity=".6" style="animation:smithySpark 1.2s ease-out infinite"/>';
        h+='<circle cx="'+(bx+bw-1)+'" cy="'+(by-9)+'" r=".4" fill="#ffaa44" opacity=".4" style="animation:smithySpark 1s ease-out infinite .4s"/>';
      } else if (bt===4) {
        // Church: narrow, tall, spire with cross
        var ch=bh+6;
        h+='<rect x="'+bx+'" y="'+(by-6)+'" width="'+bw+'" height="'+(ch+6)+'" rx="1" fill="'+wc+'"/>';
        h+='<polygon points="'+(bx-1)+','+(by-6)+' '+(bx+bw/2)+','+(by-18)+' '+(bx+bw+1)+','+(by-6)+'" fill="'+rc+'"/>';
        h+='<line x1="'+(bx+bw/2)+'" y1="'+(by-18)+'" x2="'+(bx+bw/2)+'" y2="'+(by-22)+'" stroke="#666" stroke-width="1"/>';
        h+='<line x1="'+(bx+bw/2-1.5)+'" y1="'+(by-22)+'" x2="'+(bx+bw/2+1.5)+'" y2="'+(by-22)+'" stroke="#666" stroke-width=".8"/>';
        // Gothic window
        h+='<path d="M'+(bx+bw/2-2)+','+(by+4)+' L'+(bx+bw/2-2)+','+(by+0)+' Q'+(bx+bw/2)+','+(by-3)+' '+(bx+bw/2+2)+','+(by+0)+' L'+(bx+bw/2+2)+','+(by+4)+' Z" fill="rgba(200,200,255,.2)"/>';
        // Door
        h+='<rect x="'+(bx+bw/2-2)+'" y="'+(by+ch-4)+'" width="4" height="4" rx="1" fill="rgba(40,20,10,.5)"/>';
      } else if (bt===5) {
        // Windmill: tapered body, rotating blades
        h+='<polygon points="'+(bx+2)+','+(by+bh)+' '+(bx)+','+(by-4)+' '+(bx+bw)+','+(by-4)+' '+(bx+bw-2)+','+(by+bh)+'" fill="'+wc+'"/>';
        h+='<rect x="'+(bx+3)+'" y="'+(by-2)+'" width="'+(bw-6)+'" height="'+(bh+1)+'" rx=".5" fill="rgba(0,0,0,.06)"/>';
        // Cone roof
        h+='<polygon points="'+(bx)+','+(by-4)+' '+(bx+bw/2)+','+(by-10)+' '+(bx+bw)+','+(by-4)+'" fill="'+rc+'"/>';
        // Blades (cross with rotation)
        if (level >= 10) {
          h+='<g style="transform-origin:'+(bx+bw/2)+'px '+(by-6)+'px;animation:windmillBlade 6s linear infinite">';
          h+='<line x1="'+(bx+bw/2)+'" y1="'+(by-12)+'" x2="'+(bx+bw/2)+'" y2="'+(by)+'" stroke="#6B3410" stroke-width="1.2"/>';
          h+='<line x1="'+(bx+bw/2-5)+'" y1="'+(by-6)+'" x2="'+(bx+bw/2+5)+'" y2="'+(by-6)+'" stroke="#6B3410" stroke-width="1.2"/>';
          h+='<circle cx="'+(bx+bw/2)+'" cy="'+(by-6)+'" r="1.5" fill="#d4a017"/>';
          h+='</g>';
        }
        // Small door
        h+='<rect x="'+(bx+bw/2-2)+'" y="'+(by+bh-5)+'" width="4" height="5" rx="1" fill="rgba(40,20,10,.5)"/>';
      }
    }
    h += '</g>';
    // Village chimney smoke (level 7+)
    if (level >= 7) {
      var sc = level >= 14 ? [[40,178],[52,176],[76,176],[100,179],[410,178],[440,176],[466,180],[55,216],[80,218],[410,218],[435,220]] :
        level >= 10 ? [[40,178],[52,176],[76,176],[100,179],[410,178],[440,176],[466,180],[60,218],[420,218]] :
        level >= 7 ? [[40,178],[52,176],[76,176],[100,179],[410,178],[466,180]] : [];
      for (var si = 0; si < sc.length; si++) {
        h += '<circle cx="' + sc[si][0] + '" cy="' + sc[si][1] + '" r="1.8" fill="rgba(180,180,180,.2)" style="animation:smokeRise 3.5s ease-out infinite;animation-delay:' + (si * 0.4) + 's"/>';
        h += '<circle cx="' + (sc[si][0] - 1) + '" cy="' + (sc[si][1] + 1) + '" r="1.5" fill="rgba(180,180,180,.18)" style="animation:smokeRise 4s ease-out infinite;animation-delay:' + (si * 0.4 + 1) + 's"/>';
      }
    }
  }
  // Animals
  if (level >= 6) {
    h += '<g class="k-animals">';
    // Dog near castle door (level 6+)
    h += '<g class="k-dog" style="animation:catIdle 3s ease-in-out infinite"><rect x="228" y="224" width="5" height="3" rx="1.5" fill="#8B4513"/>';
    h += '<circle cx="227" cy="223" r="1.5" fill="#8B4513"/>';
    h += '<circle cx="226.5" cy="222.5" r=".5" fill="#333"/>';
    h += '<path d="M 226.5,222 L 226,221" stroke="#333" stroke-width=".3"/>';
    // Tail
    h += '<path d="M 233,224 L 235,221" stroke="#8B4513" stroke-width=".8" stroke-linecap="round" style="transform-origin:233px 224px;animation:dogWag 1s ease-in-out infinite"/>';
    h += '</g>';
  }
  if (level >= 7) {
    // Goat in left field (level 7+)
    h += '<g class="k-goat" style="animation:goatBody 2s ease-in-out infinite">';
    h += '<ellipse cx="140" cy="219" rx="5" ry="3" fill="#e8e0d8"/>';
    h += '<rect x="139" y="216" width="7" height="3" rx="1" fill="#e8e0d8"/>';
    h += '<circle cx="139" cy="215" r="2" fill="#e8e0d8"/>';
    h += '<ellipse cx="138" cy="215" rx="1.2" ry=".8" fill="#c8a090" style="transform-origin:138px 215px;animation:goatGraze 2.5s ease-in-out infinite"/>';
    h += '<circle cx="137.5" cy="214.5" r=".4" fill="#333"/>';
    // Horns
    h += '<path d="M 138,213 L 136,211" stroke="#aaa" stroke-width=".6" stroke-linecap="round"/>';
    h += '<path d="M 140,213 L 142,211" stroke="#aaa" stroke-width=".6" stroke-linecap="round"/>';
    // Legs
    h += '<line x1="137" y1="222" x2="136" y2="226" stroke="#ccc" stroke-width="1"/><line x1="142" y1="222" x2="143" y2="226" stroke="#ccc" stroke-width="1"/>';
    h += '<line x1="138" y1="222" x2="138" y2="226" stroke="#ccc" stroke-width=".8"/><line x1="141" y1="222" x2="141" y2="226" stroke="#ccc" stroke-width=".8"/>';
    h += '</g>';
    // Second goat at level 10+
    if (level >= 10) {
      h += '<g class="k-goat" style="animation:goatBody 2s ease-in-out infinite .5s">';
      h += '<ellipse cx="160" cy="220" rx="4" ry="2.5" fill="#d8d0c8"/>';
      h += '<circle cx="159" cy="217" r="1.8" fill="#d8d0c8"/>';
      h += '<ellipse cx="158" cy="217" rx="1" ry=".6" fill="#b8a090" style="transform-origin:158px 217px;animation:goatGraze 2.5s ease-in-out infinite .3s"/>';
      h += '<path d="M 158,215 L 156.5,213.5" stroke="#aaa" stroke-width=".5" stroke-linecap="round"/>';
      h += '<path d="M 160,215 L 161.5,213.5" stroke="#aaa" stroke-width=".5" stroke-linecap="round"/>';
      h += '<line x1="157" y1="223" x2="157" y2="226" stroke="#ccc" stroke-width=".8"/><line x1="161" y1="223" x2="161" y2="226" stroke="#ccc" stroke-width=".8"/>';
      h += '</g>';
    }
  }
  // Cat on wall (level 10+)
  if (level >= 10) {
    h += '<g class="k-cat" style="animation:catIdle 4s ease-in-out infinite">';
    h += '<ellipse cx="323" cy="170" rx="3" ry="2" fill="#2a2a2a"/>';
    h += '<circle cx="321" cy="168" r="1.5" fill="#2a2a2a"/>';
    h += '<circle cx="320.5" cy="167.5" r=".3" fill="#44ff44"/>';
    // Ears
    h += '<polygon points="320,167 319,165.5 321,166.5" fill="#2a2a2a"/>';
    h += '<polygon points="322,167 323,165.5 321,166.5" fill="#2a2a2a"/>';
    // Tail
    h += '<path d="M 326,170 Q 329,166 328,162" fill="none" stroke="#2a2a2a" stroke-width="1.2" stroke-linecap="round" style="transform-origin:326px 170px;animation:catTail 3s ease-in-out infinite"/>';
    h += '</g>';
  }
  // Tiny walking villagers on the path (level 4+)
  if (level >= 4) {
    h += '<g class="k-villagers">';
    // Villager 1: walks right along the path
    h += '<g class="k-villager" style="animation:villagerWalk 12s linear infinite">';
    h += '<circle cx="0" cy="0" r="2.5" fill="var(--accent)"/>';
    h += '<rect x="-2" y="2.5" width="4" height="6" rx="1" fill="#6B3410"/>';
    h += '<line x1="-1" y1="8.5" x2="-2" y2="12" stroke="#333" stroke-width="1" stroke-linecap="round" style="transform-origin:-1px 8.5px;animation:walkLeg .3s ease-in-out infinite"/>';
    h += '<line x1="1" y1="8.5" x2="2" y2="12" stroke="#333" stroke-width="1" stroke-linecap="round" style="transform-origin:1px 8.5px;animation:walkLeg .3s ease-in-out infinite .15s"/>';
    // Arms
    h += '<line x1="-2" y1="3.5" x2="-4" y2="6" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-2px 3.5px;animation:walkLeg .3s ease-in-out infinite .15s"/>';
    h += '<line x1="2" y1="3.5" x2="4" y2="6" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:2px 3.5px;animation:walkLeg .3s ease-in-out infinite"/>';
    h += '</g>';
    // Villager 2: walks left (inverted), different color, offset delay
    h += '<g class="k-villager" style="animation:villagerWalk 15s linear infinite 4s">';
    h += '<circle cx="0" cy="0" r="2" fill="#2d5a5a"/>';
    h += '<rect x="-1.5" y="2" width="3" height="5" rx="1" fill="#5a3a2a"/>';
    h += '<line x1="-1" y1="7" x2="-2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-1px 7px;animation:walkLeg .35s ease-in-out infinite"/>';
    h += '<line x1="1" y1="7" x2="2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:1px 7px;animation:walkLeg .35s ease-in-out infinite .175s"/>';
    h += '</g>';
    // Villager 3 at level 8+
    if (level >= 8) {
      h += '<g class="k-villager" style="animation:villagerWalk 18s linear infinite 8s">';
      h += '<circle cx="0" cy="0" r="2" fill="#c09a7a"/>';
      h += '<rect x="-1.5" y="2" width="3" height="5" rx="1" fill="#8B4513"/>';
      h += '<line x1="-1" y1="7" x2="-2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-1px 7px;animation:walkLeg .4s ease-in-out infinite"/>';
      h += '<line x1="1" y1="7" x2="2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:1px 7px;animation:walkLeg .4s ease-in-out infinite .2s"/>';
      h += '</g>';
    }
    // Villager 4 at level 10+
    if (level >= 10) {
      h += '<g class="k-villager" style="animation:villagerWalk 14s linear infinite 2s">';
      h += '<circle cx="0" cy="0" r="2.2" fill="#7a5a3a"/>';
      h += '<rect x="-1.5" y="2" width="3" height="5" rx="1" fill="#4a6a3a"/>';
      h += '<line x1="-1" y1="7" x2="-2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-1px 7px;animation:walkLeg .35s ease-in-out infinite"/>';
      h += '<line x1="1" y1="7" x2="2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:1px 7px;animation:walkLeg .35s ease-in-out infinite .175s"/>';
      h += '</g>';
    }
    // Villager 5 at level 12+
    if (level >= 12) {
      h += '<g class="k-villager" style="animation:villagerWalk 20s linear infinite 6s">';
      h += '<circle cx="0" cy="0" r="1.8" fill="#8a6a4a"/>';
      h += '<rect x="-1.5" y="2" width="3" height="5" rx="1" fill="#6a3a2a"/>';
      h += '<line x1="-1" y1="7" x2="-2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-1px 7px;animation:walkLeg .4s ease-in-out infinite .1s"/>';
      h += '<line x1="1" y1="7" x2="2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:1px 7px;animation:walkLeg .4s ease-in-out infinite .3s"/>';
      h += '</g>';
    }
    // Villager 6 at level 14+
    if (level >= 14) {
      h += '<g class="k-villager" style="animation:villagerWalk 16s linear infinite 10s">';
      h += '<circle cx="0" cy="0" r="2" fill="#5a7a5a"/>';
      h += '<rect x="-1.5" y="2" width="3" height="5" rx="1" fill="#3a5a2a"/>';
      h += '<line x1="-1" y1="7" x2="-2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:-1px 7px;animation:walkLeg .3s ease-in-out infinite .05s"/>';
      h += '<line x1="1" y1="7" x2="2" y2="10" stroke="#333" stroke-width=".8" stroke-linecap="round" style="transform-origin:1px 7px;animation:walkLeg .3s ease-in-out infinite .2s"/>';
      h += '</g>';
    }
    h += '</g>';
  }
  // Trees
  var tr = Math.min(22, 14 + level * 1.5);
  h += '<g class="k-trees">';
  if (level === 0) h += '<rect x="87" y="178" width="6" height="20" class="k-tree-trunk"/><path d="M 87,173 L 93,178 L 81,178 Z" class="k-tree" opacity=".4"/>';
  else h += '<rect x="85" y="173" width="8" height="25" class="k-tree-trunk"/><circle cx="89" cy="158" r="' + tr + '" class="k-tree"/>';
  if (level >= 4) h += '<rect x="402" y="173" width="8" height="25" class="k-tree-trunk"/><circle cx="406" cy="158" r="' + Math.max(8, tr-4) + '" class="k-tree"/>';
  h += '</g>';
  if (level >= 4) { h += '<path d="M 235,198 Q 220,222 200,248 Q 230,238 250,198" class="k-path" opacity=".35"/>';
    // Cobblestone Path (shop decor)
    if (hasShop('paths')) {
      var cs = [[228,202],[222,208],[215,214],[208,220],[202,226],[196,232],[205,235],[218,230],[232,222],[240,214],[246,206]];
      for (var csi=0;csi<cs.length;csi++) h += '<ellipse cx="'+cs[csi][0]+'" cy="'+cs[csi][1]+'" rx="3" ry="2" fill="rgba(100,90,80,.25)"/><ellipse cx="'+(cs[csi][0]+1)+'" cy="'+(cs[csi][1]-1)+'" rx="1.5" ry="1" fill="rgba(120,110,100,.15)"/>';
    }
  }
  if (level >= 5) {
    h += '<g class="k-flowers">';
    var fc = ['#ff7788','#ff99aa','#ffbb44','#ee77cc'];
    var fp = level >= 8 ? [[118,215],[124,212],[140,225],[175,222],[318,220],[324,217],[360,215],[366,212],[130,228],[310,228],[145,230],[350,230]] :
      level >= 6 ? [[120,215],[125,212],[175,222],[320,220],[325,217],[360,215],[130,228],[310,228]] :
      [[120,215],[125,212],[175,222],[320,220],[325,217]];
    for (var fi = 0; fi < fp.length; fi++) h += '<circle cx="' + fp[fi][0] + '" cy="' + fp[fi][1] + '" r="' + (level >= 6 ? 3.5 : 3) + '" fill="' + fc[fi % fc.length] + '"/>';
    h += '</g>';
  }
  // Campfire (level 5+)
  if (level >= 5) {
    h += '<g class="k-campfire">';
    h += '<circle cx="150" cy="229" r="10" fill="#ff6622" style="animation:fireGlow 2s ease-in-out infinite"/>';
    h += '<rect x="143" y="227" width="14" height="3" rx="1" fill="#4a2a10" transform="rotate(-15 150 229)"/>';
    h += '<rect x="144" y="227" width="12" height="3" rx="1" fill="#5a3a1a" transform="rotate(15 150 229)"/>';
    h += '<ellipse cx="150" cy="223" rx="4.5" ry="8" fill="#ff4400" style="transform-origin:150px 223px;animation:fireFlame .3s ease-in-out infinite"/>';
    h += '<ellipse cx="149" cy="224" rx="3.5" ry="6" fill="#ff8800" style="transform-origin:149px 224px;animation:fireFlame .25s ease-in-out infinite .08s"/>';
    h += '<ellipse cx="151" cy="225" rx="2.5" ry="4.5" fill="#ffcc00" style="transform-origin:151px 225px;animation:fireFlame .35s ease-in-out infinite .15s"/>';
    h += '<circle cx="150" cy="227" r=".8" fill="#ffaa00" style="--ex:-6px;animation:emberRise 1.5s ease-out infinite"/>';
    h += '<circle cx="149" cy="227" r=".6" fill="#ff6600" style="--ex:5px;animation:emberRise 1.8s ease-out infinite .4s"/>';
    h += '<circle cx="151" cy="227" r=".5" fill="#ffee44" style="--ex:-3px;animation:emberRise 1.3s ease-out infinite .8s"/>';
    h += '<circle cx="150" cy="227" r=".7" fill="#ff8800" style="--ex:4px;animation:emberRise 2s ease-out infinite 1.1s"/>';
    h += '</g>';
  }
  if (level >= 7) h += '<g class="k-birds"><g class="k-bird"><path d="M 60,80 Q 65,76 70,80 Q 75,76 80,80"><animate attributeName="d" dur="0.3s" repeatCount="indefinite" values="M 60,80 Q 65,76 70,80 Q 75,76 80,80;M 60,80 Q 65,84 70,80 Q 75,84 80,80;M 60,80 Q 65,76 70,80 Q 75,76 80,80"/></path></g><g class="k-bird"><path d="M 90,70 Q 95,66 100,70 Q 105,66 110,70"><animate attributeName="d" dur="0.25s" repeatCount="indefinite" values="M 90,70 Q 95,66 100,70 Q 105,66 110,70;M 90,70 Q 95,74 100,70 Q 105,74 110,70;M 90,70 Q 95,66 100,70 Q 105,66 110,70"/></path></g>' + (level>=9?'<g class="k-bird"><path d="M 440,85 Q 445,81 450,85 Q 455,81 460,85"><animate attributeName="d" dur="0.35s" repeatCount="indefinite" values="M 440,85 Q 445,81 450,85 Q 455,81 460,85;M 440,85 Q 445,89 450,85 Q 455,89 460,85;M 440,85 Q 445,81 450,85 Q 455,81 460,85"/></path></g>':'') + '</g>';
  // Grand tower spires (level 16+)
  if (level >= 16) {
    h += '<polygon points="230,23 235,12 240,23" fill="var(--roof-c)" opacity=".8"/>';
    h += '<polygon points="245,15 250,4 255,15" fill="var(--roof-c)"/>';
    h += '<polygon points="260,23 265,12 270,23" fill="var(--roof-c)" opacity=".8"/>';
    h += '<circle cx="250" cy="3" r="1.5" fill="#d4a017"/>';
  }
  // Extended outer bailey wall (level 17+)
  if (level >= 17) {
    h += '<rect x="90" y="170" width="320" height="8" class="k-keep" opacity=".6"/>';
    h += '<rect x="90" y="170" width="320" height="8" fill="url(#stone)" opacity=".4"/>';
    for (var _ci = 0; _ci < 22; _ci++) h += '<rect x="' + (92 + _ci * 14) + '" y="166" width="8" height="4" class="k-keep" opacity=".5"/>';
    // Gatehouse on outer wall
    h += '<rect x="232" y="158" width="36" height="20" class="k-tower" opacity=".6"/>';
    h += '<polygon points="228,158 250,148 272,158" fill="var(--tower-roof-c)" opacity=".6"/>';
  }
  // Towering central spire (level 18+)
  if (level >= 18) {
    h += '<rect x="242" y="6" width="16" height="30" class="k-keep" opacity=".7"/>';
    h += '<polygon points="238,6 250,-8 262,6" fill="var(--roof-c)" opacity=".7"/>';
    h += '<circle cx="250" cy="-9" r="2" fill="#ffd700" opacity=".8"><animate attributeName="r" values="2;3;2" dur="3s" repeatCount="indefinite"/></circle>';
  }
  // Great wings on keep sides (level 19+)
  if (level >= 19) {
    h += '<rect x="175" y="130" width="20" height="68" class="k-keep" opacity=".5"/>';
    h += '<polygon points="173,130 185,118 197,130" fill="var(--roof-c)" opacity=".5"/>';
    h += '<rect x="305" y="130" width="20" height="68" class="k-keep" opacity=".5"/>';
    h += '<polygon points="303,130 315,118 327,130" fill="var(--roof-c)" opacity=".5"/>';
  }
  // Golden dome on central tower (level 20+)
  if (level >= 20) {
    h += '<ellipse cx="250" cy="-4" rx="12" ry="6" fill="#d4a017" opacity=".8"/>';
    h += '<ellipse cx="250" cy="-4" rx="12" ry="6" fill="none" stroke="#ffd700" stroke-width=".8" opacity=".6"/>';
    h += '<line x1="250" y1="-10" x2="250" y2="-15" stroke="#d4a017" stroke-width="1.5" opacity=".7"/>';
  }
  // Cathedral rose window on keep (level 21+)
  if (level >= 21) {
    h += '<circle cx="250" cy="130" r="14" fill="rgba(255,200,100,.15)" stroke="var(--roof-c)" stroke-width="1.5" opacity=".7"/>';
    h += '<circle cx="250" cy="130" r="10" fill="none" stroke="var(--roof-c)" stroke-width=".8" opacity=".5"/>';
    h += '<circle cx="250" cy="130" r="4" fill="rgba(255,200,100,.25)"/>';
    for (var _ri = 0; _ri < 6; _ri++) {
      var _a = _ri * 60;
      h += '<line x1="250" y1="130" x2="' + (250 + Math.cos(_a * Math.PI / 180) * 10) + '" y2="' + (130 + Math.sin(_a * Math.PI / 180) * 10) + '" stroke="var(--roof-c)" stroke-width=".6" opacity=".4"/>';
    }
  }
  // Viaduct / stone bridge across scene (level 22+)
  if (level >= 22) {
    h += '<g opacity=".45">';
    h += '<path d="M 0,185 Q 30,175 60,182 Q 90,174 120,180 Q 150,173 180,179" fill="none" stroke="#7a6a5a" stroke-width="3"/>';
    h += '<path d="M 320,179 Q 350,173 380,180 Q 410,174 440,182 Q 470,175 500,185" fill="none" stroke="#7a6a5a" stroke-width="3"/>';
    for (var _pi = 0; _pi < 6; _pi++) {
      h += '<rect x="' + (320 + _pi * 30) + '" y="180" width="3" height="10" fill="#6a5a4a" opacity=".5"/>';
    }
    h += '</g>';
  }
  // Treasure glow from grand tower windows (level 23+)
  if (level >= 23) {
    h += '<path d="M 235,55 L 235,45 Q 242,39 250,45 L 250,55 Z" fill="#ffd700" opacity=".6" style="animation:windowGlow 2s ease-in-out infinite"/>';
    h += '<path d="M 250,55 L 250,45 Q 258,39 265,45 L 265,55 Z" fill="#ffd700" opacity=".4" style="animation:windowGlow 2s ease-in-out infinite .6s"/>';
    h += '<circle cx="242" cy="50" r="1" fill="#fff" opacity=".8" style="animation:windowGlow 2s ease-in-out infinite .3s"/>';
    h += '<circle cx="258" cy="50" r="1" fill="#fff" opacity=".6" style="animation:windowGlow 2s ease-in-out infinite .9s"/>';
  }
  // Crown-shaped tower top (level 24+)
  if (level >= 24) {
    h += '<g opacity=".7">';
    for (var _crt = 0; _crt < 5; _crt++) {
      var _cx = 242 + _crt * 4;
      h += '<polygon points="' + _cx + ',-4 ' + (_cx + 2) + ',-10 ' + (_cx + 4) + ',-4" fill="#d4a017" opacity=".8"/>';
    }
    h += '<rect x="239" y="-4" width="22" height="3" rx=".5" fill="#d4a017" opacity=".6"/>';
    h += '</g>';
  }
  // Celestial light rays from heavens (level 25+)
  if (level >= 25) {
    h += '<g opacity=".15" style="animation:cloudDrift 20s linear infinite">';
    h += '<polygon points="250,0 150,180 350,180" fill="rgba(255,215,0,.3)"/>';
    h += '<polygon points="250,0 180,180 320,180" fill="rgba(255,215,0,.2)"/>';
    h += '<polygon points="250,0 210,180 290,180" fill="rgba(255,215,0,.1)"/>';
    h += '</g>';
    h += '<circle cx="250" cy="-12" r="6" fill="#ffd700" opacity=".6" style="animation:sunPulse 3s ease-in-out infinite"/>';
  }

  // Dragon circling at level 15+
  if (level >= 15) {
    h += '<g class="k-dragon"><path d="M 0,40 Q 50,10 100,35 Q 150,55 200,30 Q 250,10 300,35 Q 350,55 400,30 Q 450,10 500,40" fill="none" stroke="#5a3a1a" stroke-width="0" opacity="0"><animate attributeName="opacity" values="0;1;1;0" dur="12s" repeatCount="indefinite"/></path>';
    h += '<g><animateTransform attributeName="transform" type="translate" values="0,0;0,0;0,0" dur="12s" repeatCount="indefinite"/>';
    h += '<path d="M 10,30 L 28,22 L 22,30 L 30,38 Z" fill="#5a3a1a"><animateMotion dur="12s" repeatCount="indefinite" path="M 0,40 Q 60,15 130,40 Q 200,60 270,35 Q 340,15 410,40 Q 460,55 500,40"/></path>';
    h += '<path d="M 10,30 L 28,22 L 22,30 L 30,38 Z" fill="#4a2a0a" opacity=".5"><animateMotion dur="12s" repeatCount="indefinite" path="M 0,38 Q 60,13 130,38 Q 200,58 270,33 Q 340,13 410,38 Q 460,53 500,38"/></path>';
    h += '<ellipse cx="18" cy="17" rx="3" ry="2" fill="#ff6622"><animateMotion dur="12s" repeatCount="indefinite" path="M 0,40 Q 60,15 130,40 Q 200,60 270,35 Q 340,15 410,40 Q 460,55 500,40"/></ellipse>';
    h += '</g></g>';
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
    {title:'Peasant',    next:'Page',           sym:'\u2619', threshold:0,  nextThreshold:1},
    {title:'Page',       next:'Squire',         sym:'\u2726', threshold:1,  nextThreshold:7},
    {title:'Squire',     next:'Knight Errant',  sym:'\u2694', threshold:7,  nextThreshold:14},
    {title:'Knight Errant',next:'Knight',       sym:'\u2720', threshold:14, nextThreshold:30},
    {title:'Knight',     next:'Knight of the Realm',sym:'\u269C',threshold:30,nextThreshold:60},
    {title:'Knight of the Realm',next:'Baron',  sym:'\u265B', threshold:60, nextThreshold:90},
    {title:'Baron',      next:'Viscount',       sym:'\u265A', threshold:90, nextThreshold:180},
    {title:'Viscount',   next:'Earl',           sym:'\u265C', threshold:180,nextThreshold:270},
    {title:'Earl',       next:'Duke',           sym:'\u2766', threshold:270,nextThreshold:365},
    {title:'Duke',       next:queenMode?'Princess':'Prince', sym:'\u2727', threshold:365,nextThreshold:730},
    {title:queenMode?'Princess':'Prince', next:queenMode?'Queen':'King', sym:queenMode?'\u265C':'\u265D', threshold:730,nextThreshold:1000},
    {title:queenMode?'Queen':'King',       next:null,             sym:'\u2629', threshold:1000,nextThreshold:1/0}
  ];
  for (var i = ranks.length - 1; i >= 0; i--) {
    if (days >= ranks[i].threshold) return ranks[i];
  }
  return ranks[0];
}
function showKingdomMap() {
  var days = soberDays();
  var regions = [
    {name:'The Starting Plains',   min:0,    max:6,    x:75,  y:130, w:140, h:80,  color:'#8aca7a', icon:'\u2619', label:'Begin your journey'},
    {name:'The Forest of Resolve',  min:7,    max:29,   x:190, y:100, w:110, h:90,  color:'#5a9a5a', icon:'\u2726', label:'Prove your worth'},
    {name:'The Mountains of Strength',min:30, max:89,  x:280, y:80,  w:120, h:80,  color:'#8a8a7a', icon:'\u2694', label:'Build your foundation'},
    {name:'The Great River',        min:90,   max:179,  x:310, y:160, w:130, h:70,  color:'#5a8aba', icon:'\u269C', label:'Find your flow'},
    {name:'The Eastern Shores',     min:180,  max:364,  x:155, y:190, w:120, h:70,  color:'#c8a050', icon:'\u265C', label:'Expand your realm'},
    {name:'The Highlands of Wisdom',min:365,  max:729,  x:50,  y:70,  w:120, h:90,  color:'#a07ab0', icon:'\u2727', label:'Master your craft'},
    {name:'The Eternal Throne',     min:730,  max:999,  x:410, y:110, w:80,  h:80,  color:'#d4a017', icon:'\u265D', label:'Claim your legacy'},
    {name:'The Ancient Peaks',      min:1000, max:1/0,  x:420, y:30,  w:75,  h:60,  color:'#c0392b', icon:'\u2629', label:'Become legend'}
  ];
  var h = '<div class="overlay-content" style="max-width:540px"><div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><div style="font-size:20px">\uD83D\uDDFA</div><div><h3 style="margin:0;font-size:16px">The Realm</h3><div style="font-size:11px;color:var(--muted)">' + soberDays() + ' days explored &middot; ' + regions.filter(function(r){return days>=r.min}).length + '/' + regions.length + ' regions</div></div></div>';
  h += '<svg viewBox="0 0 510 270" style="width:100%;height:auto;border-radius:12px;background:linear-gradient(135deg,#2a1a10,#3a2a1a)">';
  h += '<defs><filter id="rg-glow"><feGaussianBlur stdDeviation="2" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>';
  for (var i = 0; i < regions.length; i++) {
    var r = regions[i];
    var unlocked = days >= r.min;
    var opacity = unlocked ? 1 : 0.25;
    var fill = unlocked ? r.color : '#3a3a3a';
    var border = unlocked ? 'rgba(255,255,255,.3)' : 'rgba(255,255,255,.08)';
    h += '<rect x="' + r.x + '" y="' + r.y + '" width="' + r.w + '" height="' + r.h + '" rx="8" fill="' + fill + '" opacity="' + opacity + '" stroke="' + border + '" stroke-width="1.5"' + (unlocked ? ' filter="url(#rg-glow)"' : '') + '/>';
    if (unlocked) {
      h += '<text x="' + (r.x + r.w/2) + '" y="' + (r.y + r.h/2 - 4) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#fff" font-family="MedievalSharp,serif">' + r.name + '</text>';
      h += '<text x="' + (r.x + r.w/2) + '" y="' + (r.y + r.h/2 + 12) + '" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.7)">' + r.label + '</text>';
    } else {
      h += '<text x="' + (r.x + r.w/2) + '" y="' + (r.y + r.h/2 + 4) + '" text-anchor="middle" font-size="10" fill="rgba(255,255,255,.3)" font-family="MedievalSharp,serif">???</text>';
    }
  }
  // Compass rose
  h += '<circle cx="25" cy="25" r="16" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="1"/><text x="25" y="7" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.4)">N</text>';
  h += '<text x="25" y="46" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.4)">S</text><text x="6" y="27" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.4)">W</text><text x="44" y="27" text-anchor="middle" font-size="8" fill="rgba(255,255,255,.4)">E</text>';
  h += '</svg>';
  h += '<div style="display:flex;justify-content:center;gap:4px;flex-wrap:wrap;margin-top:6px">';
  for (var i = 0; i < regions.length; i++) {
    var r = regions[i];
    var unlocked = days >= r.min;
    h += '<span style="font-size:10px;color:' + (unlocked ? 'var(--accent)' : 'var(--muted)') + ';opacity:' + (unlocked ? '1' : '.4') + '">' + (unlocked ? r.icon : '\u25A1') + ' ' + (unlocked ? r.name : '???') + '</span>';
    if (i < regions.length - 1) h += '<span style="font-size:9px;color:var(--border)">&middot;</span>';
  }
  h += '</div>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="margin-top:8px;width:100%">Close Map</button></div>';
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function _rankIconHTML(title, size) {
  size = size || 14;
  var c = {
    'Peasant':'<path d="M9,2 h6 v7 h7 v6 h-7 v7 h-6 v-7 h-7 v-6 h7 z" fill="currentColor"/>',
    'Page':'<path d="M4,4 h7 v16 h-7 z M13,4 h7 v16 h-7 z M11,4 h2 v16 h-2 z" fill="currentColor"/>',
    'Squire':'<path d="M6,4 L18,20 M18,4 L6,20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="6" cy="4" r="2.2" fill="currentColor"/><circle cx="18" cy="4" r="2.2" fill="currentColor"/><rect x="7" y="19" width="10" height="3" rx="1" fill="currentColor"/>',
    'Knight Errant':'<path d="M12,2 L22,6 L22,15 Q12,22 2,15 L2,6 Z" fill="currentColor"/>',
    'Knight':'<path d="M6,16 L6,8 Q6,3 12,2 Q18,3 18,8 L18,16 Z" fill="currentColor"/><path d="M10,5 Q12,3 14,5" stroke="currentColor" stroke-width="1.2" fill="none" opacity=".4"/>',
    'Knight of the Realm':'<path d="M3,16 L7,4 L12,10 L17,4 L21,16 Z" fill="currentColor"/><rect x="3" y="16" width="18" height="4" rx="1" fill="currentColor"/><circle cx="7" cy="8" r="1.5" opacity=".6" fill="currentColor"/><circle cx="12" cy="11" r="1.5" opacity=".6" fill="currentColor"/><circle cx="17" cy="8" r="1.5" opacity=".6" fill="currentColor"/>',
    'Baron':'<path d="M5,20 h14 v-12 h-14 z" fill="currentColor"/><rect x="5" y="8" width="4" height="4" fill="currentColor"/><rect x="15" y="8" width="4" height="4" fill="currentColor"/><rect x="9" y="13" width="6" height="7" fill="none" stroke="currentColor" stroke-width="1" opacity=".5"/>',
    'Viscount':'<path d="M17,2 A14,14 0 1,1 8,18 A10,10 0 1,0 17,2" fill="currentColor"/><circle cx="17" cy="12" r="2" opacity=".6" fill="currentColor"/>',
    'Earl':'<path d="M12,2 L14.5,8.6 L21.5,9 L16,13.5 L17.5,20 L12,16.5 L6.5,20 L8,13.5 L2.5,9 L9.5,8.6 Z" fill="currentColor"/>',
    'Duke':'<rect x="7" y="10" width="10" height="7" rx="2" fill="currentColor"/><circle cx="16" cy="7" r="4" fill="currentColor"/><path d="M7,13 Q3,10 4,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><rect x="7" y="17" width="2.5" height="5" rx="1" fill="currentColor"/><rect x="12" y="17" width="2.5" height="5" rx="1" fill="currentColor"/>',
    'Prince':'<path d="M7,12 L17,12 L17,20 Q12,24 7,20 Z" fill="currentColor"/><path d="M10,14 L14,14" stroke="currentColor" opacity=".4" stroke-width="1" fill="none"/><path d="M6,4 L9,1 L12,5 L15,1 L18,4 L18,7 L6,7 Z" fill="currentColor"/>',
    'King':'<path d="M7,2 L9,0 L12,3 L15,0 L17,2 L17,5 L7,5 Z" fill="currentColor"/><rect x="7" y="9" width="10" height="7" rx="2" fill="currentColor"/><circle cx="15" cy="6" r="3.5" fill="currentColor"/><path d="M7,12 Q3,9 4,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><rect x="7" y="16" width="2.5" height="5" rx="1" fill="currentColor"/><rect x="12" y="16" width="2.5" height="5" rx="1" fill="currentColor"/>',
    'Queen':'<path d="M7,2 L9,0 L12,3 L15,0 L17,2 L17,5 L7,5 Z" fill="currentColor"/><rect x="7" y="9" width="10" height="7" rx="2" fill="currentColor"/><circle cx="15" cy="6" r="3.5" fill="currentColor"/><path d="M7,12 Q3,9 4,6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M10,19 Q12,21 14,19" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" fill="none"/><rect x="8" y="16" width="8" height="2" rx="1" fill="currentColor"/><circle cx="8" cy="17" r="1" fill="currentColor"/><circle cx="16" cy="17" r="1" fill="currentColor"/>',
    'Princess':'<path d="M7,12 L17,12 L17,20 Q12,24 7,20 Z" fill="currentColor"/><circle cx="12" cy="15" r="1.5" fill="currentColor" opacity=".6"/><path d="M6,4 L9,1 L12,5 L15,1 L18,4 L18,7 L6,7 Z" fill="currentColor"/><circle cx="12" cy="5" r="1.5" fill="currentColor"/>'
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
function medievalDate() {
  var months = ['Ærra Ġēola','Solmonath','Hrethmonath','Eosturmonath','Thrimilchi','Ærra-Liða','Æftera-Liða','Weodmonath','Halegmonath','Winterfilleth','Blodmonath','Æftera Ġēola'];
  var now = new Date();
  var day = now.getDate();
  var month = months[now.getMonth()];
  var reignYear = Math.floor(soberDays() / 365) + 1;
  return 'The ' + ordinal(day) + ' Day of ' + month + ', in the ' + ordinal(reignYear) + ' Year of Your Reign';
}

function kingdomTrackerHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var isActive = D.sobriety.startDate ? true : false;
  var levelNames = ['Ruins','Foundation','Camp','Village','Hamlet','Town','Borough','City','Realm','Kingdom','Empire'];
  var levelDescs = ['A new beginning','First stones laid','Taking shape','Walls are rising','Growing settlement','A proper town','Walls secured','Thriving city','A proud realm','A mighty kingdom','A legendary empire'];
  var h = kingdomHTML();
  h += '<div class="card" style="text-align:center;margin-top:-4px;border-top-left-radius:0;border-top-right-radius:0;padding:10px 14px 12px">';
  if (isActive) {
    h += '<div style="display:flex;align-items:baseline;justify-content:center;gap:4px;margin-bottom:2px"><strong style="font-size:28px;color:var(--primary)">' + days + '</strong><span style="font-size:13px;color:var(--text-light)">days sober</span>';
    var sh = (D.warchest && D.warchest.shields) || 0;
    if (sh > 0) h += '<span style="font-size:13px;color:var(--accent);margin-left:2px" title="' + sh + ' shield' + (sh!==1?'s':'') + ' protecting your streak">&#128737;</span>';
    h += '</div>';
    h += '<div style="font-size:11px;color:var(--muted);letter-spacing:1px;margin-bottom:6px">' + levelNames[Math.min(level,10)] + ' &mdash; ' + (levelDescs[Math.min(level,10)]||'') + '</div>';
    // Rank badge
    var rank = getRank(days);
    h += '<div style="display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:4px">';
    h += _rankIconHTML(rank.title, 16) + ' ';
    h += '<span style="font-size:14px;font-weight:700;color:var(--primary)">' + rank.title + '</span>';
    if (rank.next) {
      var prog = days - rank.threshold;
      var need = rank.nextThreshold - rank.threshold;
      var pct = Math.min(100, Math.round(prog / need * 100));
      h += '<span style="font-size:11px;color:var(--muted)">\u2192 ' + rank.next + '</span>';
      h += '</div><div style="width:80%;margin:2px auto 6px;height:5px;background:var(--border);border-radius:3px;overflow:hidden">';
      h += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:3px;transition:width .4s"></div></div>';
    } else {
      h += '</div><div style="font-size:10px;color:var(--accent);margin-bottom:4px">The realm is yours</div>';
    }
    h += soberTimerHTML();
    h += '<div style="display:flex;gap:6px;margin-top:6px"><button class="btn btn-outline btn-sm" onclick="recordRelapse()" style="flex:1;border-color:var(--danger);color:var(--danger)">Record Relapse</button>';
    h += '<button class="btn btn-outline btn-sm" onclick="endSobriety()" style="flex:1">End Sobriety</button></div>';
  } else {
    h += '<div style="font-size:14px;color:var(--muted);margin-bottom:6px">Your kingdom awaits</div>';
    h += '<button class="btn btn-primary btn-sm" onclick="showOnboarding()">Begin Your Reign</button>';
  }
  h += '</div>';
  return h;
}
function villageLevel(days) {
  if (days <= 0) return 0;
  if (days <= 6) return 1;
  if (days <= 13) return 2;
  if (days <= 29) return 3;
  if (days <= 89) return 4;
  if (days <= 180) return 5;
  if (days <= 364) return 6;
  return 7;
}
function villageHTML() {
  var d=soberDays(),l=villageLevel(d),n=document.body.classList.contains('dark');
  var c={g1:n?'#1a2a1a':'#5a9a4a',g2:n?'#152015':'#4a8a3a',st:n?'#3a3a42':'#9a9aa2',sd:n?'#2a2a32':'#7a7a82',sl:n?'#4a4a52':'#b0b0b8',rf:n?'#3a2010':'#8a4a2a',th:n?'#3a2a18':'#9a7a4a',tm:n?'#1a0a00':'#6a3a1a',wl:n?'#d4c8b0':'#f0e0c8',wd:n?'#c8b898':'#d4c4a8',tr:n?'#0a2a0a':'#4a8a3a',tk:n?'#1a0a00':'#5a3a1a',bn:n?'#8a1a1a':'#cc2a2a',bg:n?'#8a7a20':'#d4a017',sp:n?'#3a3a42':'#7a7a82',wi:n?'#ffd700':'#88bbdd',dr:n?'#1a0a00':'#5a3a2a',wg:n?'#ffd700':'#88bbdd',pt:n?'#2a2a2a':'#9a8a7a'};
  function rx(x,y,w,h){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="1" fill="';}
  function pg(p,f){return '<polygon points="'+p+'" fill="'+f+'"/>';}
  function ln(x1,y1,x2,y2,cl,w){return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+cl+'" stroke-width="'+w+'"/>';}
  function ct(x,y,t,s,nw,nh){
    var h='<rect x="'+x+'" y="'+(y-nh)+'" width="'+nw+'" height="'+nh+'" rx="1" fill="'+c.st+'"/>';
    h+=pg((x-3)+','+(y-nh)+' '+(x+nw/2)+','+(y-nh-8)+' '+(x+nw+3)+','+(y-nh),c.rf);
    if(t){h+=pg((x+nw/2-3)+','+(y-nh-8)+' '+(x+nw/2)+','+(y-s)+' '+(x+nw/2+3)+','+(y-nh-8),c.sp);
    h+=ln(x+nw/2,y-s,x+nw/2,y-s-5,n?c.wg:'#8a6a3a',1.2)+ln(x+nw/2-3,y-s-2,x+nw/2+3,y-s-2,n?c.wg:'#8a6a3a',1.2);}
    h+='<path d="M'+(x+nw/2-3)+','+y+' Q'+(x+nw/2)+','+(y-8)+' '+(x+nw/2+3)+','+y+'" fill="'+c.dr+'"/>';
    h+='<circle cx="'+(x+nw/2)+'" cy="'+(y-nh+6)+'" r="'+(t?4:3)+'" fill="'+c.wi+'" opacity=".5"/>';
    return h;
  }
  var h='<svg viewBox="0 0 360 200" xmlns="http://www.w3.org/2000/svg">';
  h+='<rect x="0" y="134" width="360" height="66" fill="'+c.g1+'" opacity=".4"/>';
  h+='<rect x="0" y="152" width="360" height="48" fill="'+c.g2+'" opacity=".35"/>';
  h+='<path d="M0,146 Q60,126 120,140 Q180,120 240,134 Q300,116 360,140 L360,200 L0,200Z" fill="'+c.g1+'" opacity=".15"/>';
  // Cobblestone path
  h+='<path d="M170,200 Q173,176 177,158 Q181,148 185,142" stroke="'+c.pt+'" stroke-width="5" fill="none" opacity=".2" stroke-linecap="round"/>';
  // Fixed positions for 20 medieval buildings (12-16px wide, packed tight)
  var bw=13,bgap=1,bh=18,bhs=[18,22,20,16,24,18,22,20,16,24,18,22,20,16,24,18,22,20,16,24];
  var bx=[];
  for(var bi=0,bxPos=2;bi<20;bi++){bx[bi]=bxPos;bxPos+=bw+bgap;}
  function drawBldgs(start,end,maxH,bOn){
    var s='';
    for(var i=start;i<=end;i++){
      if(i>=bx.length)break;
      var x=bx[i],hh=Math.min(bhs[i],maxH),yBase=158;
      if(!bOn)continue;
      var clr=(i%3===0?c.wd:(i%2===0?c.wl:c.wd));
      s+=rx(x,yBase-hh,bw,hh)+clr+'"/>';
      // timber frame lines
      s+=ln(x,yBase-hh,x,yBase,c.tm,1)+ln(x+bw-1,yBase-hh,x+bw-1,yBase,c.tm,1);
      s+=ln(x,yBase-hh+Math.round(hh*0.45),x+bw,yBase-hh+Math.round(hh*0.45),c.tm,0.8);
      // thatched roof
      s+=pg((x-3)+','+(yBase-hh)+' '+(x+bw/2)+','+(yBase-hh-5)+' '+(x+bw+2)+','+(yBase-hh),c.th);
      // door
      s+=rx(x+4,yBase-Math.round(hh*0.5),Math.round(bw*0.4),Math.round(hh*0.45),0)+c.dr+'"/>';
      // window on some
      if(i%2===0)s+=rx(x+2,yBase-hh+3,Math.round(bw*0.25),Math.round(bw*0.25),1)+c.wi+'" opacity=".35"/>';
    }
    return s;
  }
  // L1: ruins
  if(l>=1){
    h+=rx(155,136,50,24,c.sd)+'" opacity=".4"/>'+rx(162,128,8,30,c.st)+'" opacity=".35"/>'+rx(190,130,8,28,c.st)+'" opacity=".35"/>';
    if(l<2)h+='<g opacity=".5"><rect x="176" y="156" width="4" height="2" fill="#8a4a1a"/><polygon points="175,156 181,156 178,150" fill="#cc6633"/><circle cx="178" cy="146" r="3" fill="#ff8833" opacity=".3"/></g>';
  }
  // L2: 20 buildings!
  if(l>=2){
    h+=drawBldgs(0,19,24,l>=2);
    h+=rx(2,148,8,12,c.sd)+'" opacity=".5"/>'+rx(3,147,6,2,c.sd)+'" opacity=".6"/>';
  }
  // L3: church added
  if(l>=3)h+=ct(100,155,true,48,28,38);
  // L4: wall section + banner + tree
  if(l>=4){
    h+=rx(296,122,18,36,c.sd)+'" opacity=".5"/>'+rx(296,118,5,6,c.sd)+'" opacity=".6"/>'+rx(307,118,5,6,c.sd)+'" opacity=".6"/>';
    h+=ln(290,100,290,153,c.tm,2)+pg('290,100 308,106 290,112',c.bn);
    h+=rx(43,132,3,26,c.tk)+'<circle cx="44" cy="124" r="7" fill="'+c.tr+'" opacity=".6"/>';
  }
  // L5: gate towers + connecting wall + more trees
  if(l>=5){
    h+=rx(10,108,16,50,c.st)+'" opacity=".9"/>'+pg('7,108 18,86 29,108',c.rf)+rx(15,146,6,12,1)+'" fill="'+c.dr+'"/>'+ln(18,86,18,78,c.tm,1.5)+pg('18,78 30,82 18,86',c.bg);
    h+=rx(316,108,16,50,c.st)+'" opacity=".9"/>'+pg('313,108 324,86 335,108',c.rf)+rx(321,146,6,12,1)+'" fill="'+c.dr+'"/>'+ln(324,86,324,78,c.tm,1.5)+pg('324,78 336,82 324,86',c.bn);
    h+=rx(56,130,3,28,c.tk)+'<circle cx="57" cy="122" r="8" fill="'+c.tr+'" opacity=".6"/><circle cx="64" cy="126" r="6" fill="'+c.tr+'" opacity=".5"/>';
    h+=rx(330,130,3,28,c.tk)+'<circle cx="331" cy="122" r="7" fill="'+c.tr+'" opacity=".6"/>';
  }
  // L6: church tower + fortified walls
  if(l>=6){
    h+=rx(70,114,14,44,c.sd)+'" opacity=".8"/>'+pg('67,114 77,94 87,114',c.rf)+rx(73,124,8,8,1)+'" fill="'+c.wi+'" opacity=".3"/>';
    h+=rx(260,110,48,48,c.sd)+'" opacity=".35"/>';
    for(var bw=0;bw<7;bw++)h+=rx(264+bw*7,106,4,6,c.sd)+'" opacity=".5"/>';
    h+=rx(340,130,3,28,c.tk)+'<circle cx="341" cy="122" r="8" fill="'+c.tr+'" opacity=".6"/><circle cx="348" cy="126" r="6" fill="'+c.tr+'" opacity=".5"/>';
  }
  // L7: fountain + extra trees
  if(l>=7){
    h+='<circle cx="175" cy="150" r="5" fill="'+c.st+'" opacity=".7"/><circle cx="175" cy="150" r="3" fill="'+c.wi+'" opacity=".12"/>';
    h+=ln(172,151,178,151,c.sd,1.5)+ln(175,148,175,154,c.sd,1.5);
    h+=rx(348,128,3,30,c.tk)+'<circle cx="349" cy="118" r="9" fill="'+c.tr+'" opacity=".7"/><circle cx="356" cy="122" r="7" fill="'+c.tr+'" opacity=".6"/>';
    h+=rx(2,130,3,28,c.tk)+'<circle cx="3" cy="120" r="8" fill="'+c.tr+'" opacity=".7"/><circle cx="10" cy="124" r="6" fill="'+c.tr+'" opacity=".6"/>';
  }
  // Stars
  if(n&&l>=2){for(var si=0;si<l*6;si++)h+='<circle cx="'+(2+(si*27)%356)+'" cy="'+(2+(si*15)%58)+'" r="'+(0.2+(si%3)*0.4)+'" fill="#fff" opacity="'+(0.06+l*0.04)+'"/>';}
  // Night glow
  if(n&&l>=3){
    h+='<g filter="url(#glow)">';
    if(l>=4)h+='<rect x="5" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/>';
    if(l>=5)h+='<rect x="16" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/><rect x="22" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/>';
    if(l>=6)h+='<rect x="32" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/><rect x="73" y="124" width="8" height="8" rx="1" fill="'+c.wg+'" opacity=".5"/>';
    if(l>=7)h+='<rect x="60" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/><rect x="140" y="140" width="4" height="4" rx="1" fill="'+c.wg+'" opacity=".5"/>';
    h+='</g>';
  }
  // Flowers
  if(!n&&l>=4)h+='<circle cx="50" cy="164" r="1.5" fill="#ff7788"/><circle cx="135" cy="166" r="1.5" fill="#ff99aa"/><circle cx="220" cy="163" r="1.5" fill="#ffbb44"/><circle cx="305" cy="165" r="1.5" fill="#ee77cc"/>';
  h+='</svg>';
  return h;
}
function updateVillage() {
  var el = document.getElementById('village-overlay');
  if (!el) return;
  el.innerHTML = villageHTML();
}

function kingsLedgerHTML() {
  var days = soberDays();
  var isActive = D.sobriety.startDate ? true : false;
  var cpDay = D.sobriety.costPerDay || 0;
  var dQty = D.sobriety.dailyQuantity || 0;
  var uLabel = D.sobriety.unitLabel || '';
  var moneySaved = days * cpDay;
  var unitsAvoided = days * dQty;
  var hrsRegained = Math.round(days * 1.5);
  var h = '';
  h += '<h2 class="page-title">\uD83D\uDCD6 The King\u2019s Ledger</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:10px">See how much you\u2019ve saved in money, reduced usage, and regained in time since you began. Enter your daily numbers below.</p>';
  h += '<div class="card" style="border:2px solid var(--gold);background:linear-gradient(135deg,rgba(255,215,0,.04),var(--card));padding:14px;margin-bottom:10px">';
  h += '<div style="display:flex;gap:4px;margin-bottom:8px">';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Cost/day ($)</label>';
  h += '<input type="number" min="0" step="0.5" value="' + cpDay + '" onchange="D.sobriety.costPerDay=parseFloat(this.value)||0;saveData();render()" placeholder="e.g. 15" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Quantity/day</label>';
  h += '<input type="number" min="0" step="0.5" value="' + dQty + '" onchange="D.sobriety.dailyQuantity=parseFloat(this.value)||0;saveData();render()" placeholder="e.g. 6" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Unit label</label>';
  h += '<input type="text" value="' + safe(uLabel) + '" onchange="D.sobriety.unitLabel=this.value;saveData();render()" placeholder="drinks" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '</div>';
  h += '<div class="stat-grid">';
  h += '<div class="stat-card"><div class="num" style="color:#d4a017">$' + moneySaved.toLocaleString() + '</div><div class="label">Money Saved</div></div>';
  var unitDisplay = uLabel ? safe(uLabel) + ' Avoided' : 'Units Avoided';
  h += '<div class="stat-card"><div class="num" style="color:var(--accent)">' + unitsAvoided.toLocaleString() + '</div><div class="label">' + unitDisplay + '</div></div>';
  h += '<div class="stat-card"><div class="num" style="color:var(--primary)">' + hrsRegained + 'h</div><div class="label">Time Regained</div></div>';
  h += '</div></div>';
  if (!isActive) h += '<div class="card"><div class="empty-state">Start your sobriety journey to see your real savings.</div></div>';
  h += '<button class="btn btn-outline btn-sm" onclick="goTo(\'warchest\')">Back to War Chest</button>';
  return h;
}

function warchestHTML() {
  var w = getWarchest();
  var days = soberDays();
  var entries = (D.journal || []).length;
  var schillings = w.schillings || 0;
  var shields = w.shields || 0;
  var bd = w.boostData || {};
  var dayEarned = days * 5;
  var entryEarned = entries * 5;
  var isActive = D.sobriety.startDate ? true : false;
  // Award milestone shields
  var milestones = [30,90,180,365,730];
  var mNames = ['1 Month','3 Months','6 Months','1 Year','2 Years'];
  for (var mi=0;mi<milestones.length;mi++) {
    if (days >= milestones[mi] && (w.milestonesClaimed||[]).indexOf(milestones[mi]) < 0) {
      w.milestonesClaimed = w.milestonesClaimed || [];
      w.milestonesClaimed.push(milestones[mi]);
      w.shields = (w.shields||0) + 1;
    }
  }
  var h = '<h2 class="page-title">&#128176; War Chest</h2>';
  h += '<div class="card" style="text-align:center;padding:16px">';
  h += '<div style="font-size:11px;color:var(--text-light);margin-bottom:8px">Earn schillings by staying sober and writing journal entries</div>';
  // Schilling display
  h += '<div style="background:linear-gradient(135deg,#d4a017,#f0c030);border-radius:16px;padding:14px;margin-bottom:10px">';
  h += '<div style="font-size:32px;font-weight:800;color:#2a1a00">' + schillings + '</div>';
  h += '<div style="font-size:12px;color:#4a3a00;opacity:.8">&#128176; Schillings</div></div>';
  // Shield count
  h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;color:var(--text);margin-bottom:10px">';
  h += '<span style="font-size:22px">&#128737;</span> <strong>' + shields + '</strong> shield' + (shields !== 1 ? 's' : '');
  h += '</div>';
  // Buy shield button
  h += '<div style="display:flex;gap:6px;margin-bottom:10px">';
  h += '<button class="btn btn-primary btn-sm" onclick="buyShield()" style="flex:1;background:linear-gradient(135deg,#6a4a2a,#8a6a4a);font-size:12px"' + (schillings < 30 ? ' disabled' : '') + '>&#128737; Buy Shield (30 schillings)</button>';
  h += '</div>';
  // Active boosts
  var boostLines = [];
  if ((bd.streak||0) > 0) boostLines.push('&#2629; Streak Shield &times;' + bd.streak);
  if (bd.doubleExpiry > Date.now()) boostLines.push('&#269C; Double Coins (' + Math.ceil((bd.doubleExpiry-Date.now())/3600000) + 'h)');
  if (bd.bonusDate === new Date().toDateString()) boostLines.push('&#10086; Bonus Quest active');
  if (boostLines.length > 0) {
    h += '<div style="background:var(--primary-light);border-radius:8px;padding:8px;margin-bottom:8px">';
    h += '<div style="font-size:10px;font-weight:700;color:var(--primary);margin-bottom:3px">Active Boosts</div>';
    for (var bi=0;bi<boostLines.length;bi++) h += '<div style="font-size:11px;color:var(--text);line-height:1.6">' + boostLines[bi] + '</div>';
    h += '</div>';
  }
  // Earnings breakdown
  h += '<div style="background:var(--primary-light);border-radius:10px;padding:10px;margin-bottom:8px">';
  h += '<div style="font-size:11px;font-weight:700;color:var(--primary);margin-bottom:4px">Earnings Breakdown</div>';
  h += '<div style="display:flex;justify-content:space-around;font-size:12px;color:var(--text)">';
  h += '<span>' + days + ' days &times; 5 = ' + dayEarned + '</span>';
  h += '<span>' + entries + ' entries &times; 5 = ' + entryEarned + '</span>';
  h += '</div></div>';
  // Milestone shields
  var awarded = w.milestonesClaimed||[];
  if (awarded.length > 0) {
    h += '<div style="font-size:10px;color:var(--muted);margin-bottom:4px">Milestone shields earned: ' + awarded.length + '</div>';
    for (var mi2=0;mi2<awarded.length;mi2++) {
      var mIdx = milestones.indexOf(awarded[mi2]);
      h += '<span style="font-size:9px;background:var(--primary-light);padding:1px 5px;border-radius:4px;margin:1px;display:inline-block">' + (mIdx>=0?mNames[mIdx]:'') + '</span>';
    }
  }
  // King's Ledger — real-world savings calculator
  var cpDay = D.sobriety.costPerDay || 0;
  var dQty = D.sobriety.dailyQuantity || 0;
  var uLabel = D.sobriety.unitLabel || '';
  var moneySaved = days * cpDay;
  var unitsAvoided = days * dQty;
  var hrsRegained = Math.round(days * 1.5);
  h += '<div class="card" style="border:2px solid var(--gold);background:linear-gradient(135deg,rgba(255,215,0,.04),var(--card));padding:14px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:20px">\uD83D\uDCD6</span><h3 style="margin:0;font-size:14px">The King\u2019s Ledger</h3></div>';
  h += '<p style="font-size:11px;color:var(--muted);margin-bottom:8px">Enter how much you spent daily and the calculator will show what you\u2019ve saved' + (isActive ? ' since your last reset.' : ' once you start your journey.') + '</p>';
  // Inputs always visible
  h += '<div style="display:flex;gap:4px;margin-bottom:8px">';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Cost/day ($)</label>';
  h += '<input type="number" min="0" step="0.5" value="' + cpDay + '" onchange="D.sobriety.costPerDay=parseFloat(this.value)||0;saveData();render()" placeholder="e.g. 15" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Quantity/day</label>';
  h += '<input type="number" min="0" step="0.5" value="' + dQty + '" onchange="D.sobriety.dailyQuantity=parseFloat(this.value)||0;saveData();render()" placeholder="e.g. 6" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '<div style="flex:1"><label style="font-size:9px;color:var(--muted);display:block">Unit label</label>';
  h += '<input type="text" value="' + safe(uLabel) + '" onchange="D.sobriety.unitLabel=this.value;saveData();render()" placeholder="drinks" style="font-size:12px;padding:4px 6px;margin:0"></div>';
  h += '</div>';
  // Results — always visible
  h += '<div class="stat-grid">';
  h += '<div class="stat-card"><div class="num" style="color:#d4a017">$' + moneySaved.toLocaleString() + '</div><div class="label">Money Saved</div></div>';
  var unitDisplay = uLabel ? safe(uLabel) + ' Avoided' : 'Units Avoided';
  h += '<div class="stat-card"><div class="num" style="color:var(--accent)">' + unitsAvoided.toLocaleString() + '</div><div class="label">' + unitDisplay + '</div></div>';
  h += '<div class="stat-card"><div class="num" style="color:var(--primary)">' + hrsRegained + 'h</div><div class="label">Time Regained</div></div>';
  h += '</div></div>';
  if (!isActive) h += '<div style="font-size:13px;color:var(--muted);margin:6px 0">Begin your reign to start earning schillings</div>';
  // Shield info
  h += '<div style="font-size:11px;color:var(--muted);line-height:1.5;margin-bottom:8px">';
  h += '&#128737; Shields protect your streak on relapse. Earn them at milestones (1 month, 3 months, etc.) or buy for 30 schillings each.';
  h += '</div>';
  h += '<button class="btn btn-outline btn-sm" onclick="goTo(\'more\')" style="margin-top:4px">Back to Arsenal</button>';
  // Shop link
  h += '<button class="btn btn-primary btn-sm" onclick="goTo(\'shop\')" style="width:100%;margin-top:6px;font-size:12px;background:linear-gradient(135deg,#2a5a2a,#3a7a3a)">\u269C Visit the Shop</button>';
  h += '</div>';
  return h;
}
function buyShield() {
  var w = getWarchest();
  if ((w.schillings || 0) < 30) { alert('Not enough schillings! You need 30.'); render(); return; }
  w.schillings -= 30;
  w.shields = (w.shields || 0) + 1;
  saveData(); render();
}
var SHOP_ITEMS = [
  {id:'banners', cat:'Decor', name:'Stone Banners', desc:'Hang banners on your castle walls', cost:30, icon:'\u269C'},
  {id:'tapestry', cat:'Decor', name:'Royal Tapestry', desc:'A grand tapestry behind the throne', cost:50, icon:'\u265C'},
  {id:'torches', cat:'Decor', name:'Torch Sconces', desc:'Animated torch flames on the keep', cost:40, icon:'\u2727'},
  {id:'paths', cat:'Decor', name:'Cobblestone Path', desc:'A winding path to the castle gate', cost:25, icon:'\u265B'},
  {id:'flags', cat:'Decor', name:'Heraldic Flags', desc:'Your personal banner on every tower', cost:60, icon:'\u2726'},
  {id:'crimson', cat:'Skins', name:"Arthur's Crimson Robes", desc:'Dye Arthur robes deep crimson', cost:80, icon:'\u2619'},
  {id:'silver', cat:'Skins', name:"Gertrude's Silver Armor", desc:'Polish Gertrude armor to silver', cost:100, icon:'\u2694'},
  {id:'starry', cat:'Skins', name:"Oswald's Starry Hat", desc:'Oswald hat glows with starry sky', cost:70, icon:'\u2727'},
  {id:'streak', cat:'Boosts', name:'Streak Shield', desc:'Protects your streak for 1 relapse', cost:50, icon:'\u2629'},
  {id:'double', cat:'Boosts', name:'Double Coins', desc:'Double schillings earned for 24 hours', cost:75, icon:'\u269C'},
  {id:'bonus', cat:'Boosts', name:'Bonus Quest', desc:'Unlock a 4th daily quest today', cost:40, icon:'\u2766'}
];

function shieldChargeHTML(id) {
  var ch = null;
  for (var i=0;i<HERALDIC_CHARGES.length;i++) { if (HERALDIC_CHARGES[i].id === id) { ch = HERALDIC_CHARGES[i]; break; } }
  return ch ? ch.svg.replace(/\s*transform="[^"]*"/g,'') : '';
}
function divisionPathHTML(id, field, w, h) {
  for (var i=0;i<HERALDIC_DIVISIONS.length;i++) {
    if (HERALDIC_DIVISIONS[i].id === id) {
      var s = HERALDIC_DIVISIONS[i].svg;
      if (s) s = s.replace(/opacity/g, 'fill="' + field + '" opacity');
      return s;
    }
  }
  return '';
}

function coatOfArmsHTML() {
  var days = soberDays();
  var rank = getRank(days);
  var heraldry = D.heraldry || {};
  // Determine color scheme
  var tier = days < 14 ? 0 : days < 61 ? 1 : days < 365 ? 2 : 3;
  var defaultColors = [
    {field:'#8B6B4A',band:'#6B4A2A',trim:'#A08060',banner:'#4A2A1A'},
    {field:'#2D5A7A',band:'#1A3A5A',trim:'#4A8ABA',banner:'#0A2A4A'},
    {field:'#8A2A2A',band:'#6A1A1A',trim:'#AA5A5A',banner:'#4A0A0A'},
    {field:'#5B21B6',band:'#3B1186',trim:'#8B51D6',banner:'#2B0176'}
  ];
  var dc = defaultColors[tier];
  var fieldColor = heraldry.field || dc.field;
  var trimColor = heraldry.trim || dc.trim;
  var bandColor = heraldry.field ? '#00000066' : dc.band;
  var bannerColor = heraldry.field ? '#00000088' : dc.banner;
  var division = heraldry.division || 'band';
  var charge = heraldry.charge || '';
  var motto = heraldry.motto || '';
  // Draw shield
  var h = '<div style="text-align:center;margin:8px 0;cursor:pointer" onclick="showHeraldryEditor()" title="Customize your coat of arms">';
  h += '<svg viewBox="0 0 120 140" style="width:100px;height:auto">';
  // Shield outline
  h += '<path d="M60,8 L105,8 L105,65 Q105,105 60,130 Q15,105 15,65 L15,8 Z" fill="' + fieldColor + '" stroke="' + trimColor + '" stroke-width="2"/>';
  // Division overlay
  if (division !== 'plain') {
    h += divisionPathHTML(division, bandColor, 120, 140);
  }
  // Inner shield border
  h += '<path d="M60,16 L98,16 L98,63 Q98,98 60,120 Q22,98 22,63 L22,16 Z" fill="none" stroke="' + trimColor + '" stroke-width="1" opacity=".4"/>';
  // Charge (custom if set, otherwise rank icon)
  if (charge && charge !== 'none') {
    h += '<g color="#fff" opacity=".85" transform="translate(1, 38) scale(1.4)">' + shieldChargeHTML(charge) + '</g>';
  } else {
    h += '<g transform="translate(18,22)" color="#fff">' + _rankIconHTML(rank.title, 84) + '</g>';
  }
  // Motto on ribbon
  var displayMotto = motto || rank.title.toUpperCase();
  var mottoColor = motto ? '#f4d03f' : '#ffd700';
  h += '<path d="M30,131 Q60,137 90,131 L95,146 Q60,152 25,146 Z" fill="' + bannerColor + '" stroke="' + trimColor + '" stroke-width="1"/>';
  h += '<text x="60" y="143" text-anchor="middle" fill="' + mottoColor + '" font-size="' + (motto && motto.length > 12 ? 7 : 9) + '" font-weight="bold" font-family="MedievalSharp,serif">' + displayMotto + '</text>';
  // Days text
  h += '<text x="60" y="126" text-anchor="middle" fill="' + mottoColor + '" font-size="7" font-family="MedievalSharp,serif" opacity=".8">' + days + ' DAYS</text>';
  h += '</svg></div>';
  h += '<div style="font-size:7px;color:var(--muted);text-align:center;margin-top:-2px;opacity:.5;letter-spacing:1px">\u269C tap to customize \u269C</div>';
  return h;
}

var _heraldrySnapshot = null;
function showHeraldryEditor() {
  _heraldrySnapshot = JSON.parse(JSON.stringify(D.heraldry || {}));
  var heraldry = D.heraldry || {};
  var days = soberDays();
  var rank = getRank(days);
  var h = '<div class="overlay-content" style="max-width:440px;padding:20px;">';
  h += '<h3 style="font-size:18px;font-weight:700;margin-bottom:2px;text-align:center">\u269C Customize Coat of Arms</h3>';
  h += '<p style="font-size:11px;color:var(--muted);text-align:center;margin-bottom:10px">Design your personal heraldry. Your shield appears on the home page.</p>';
  // Live preview
  h += '<div style="text-align:center;margin-bottom:12px;background:var(--primary-light);padding:8px;border-radius:10px"><div id="heraldry-preview"></div></div>';
  // Field color
  h += '<div style="font-size:11px;font-weight:600;margin-bottom:4px">Field Color</div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">';
  for (var ci=0;ci<HERALDIC_COLORS.length;ci++) {
    var c = HERALDIC_COLORS[ci];
    var selCls = heraldry.field === c.field || (!heraldry.field && ci === 0) ? ' sel' : '';
    h += '<div style="width:36px;height:36px;border-radius:50%;background:' + c.field + ';cursor:pointer" onclick="heraldryPickField(\'' + c.field + '\',\'' + c.trim + '\',this)" title="' + c.label + '" class="h-color-swatch' + selCls + '"></div>';
  }
  h += '</div>';
  // Division
  h += '<div style="font-size:11px;font-weight:600;margin-bottom:4px">Division</div>';
  h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:10px">';
  for (var di=0;di<HERALDIC_DIVISIONS.length;di++) {
    var d = HERALDIC_DIVISIONS[di];
    var dSelCls = (heraldry.division || 'band') === d.id ? ' sel' : '';
    h += '<div class="h-div-item' + dSelCls + '" style="padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;background:var(--card)" onclick="heraldryPickDivision(\'' + d.id + '\',this)">' + d.label + '</div>';
  }
  h += '</div>';
  // Charge
  h += '<div style="font-size:11px;font-weight:600;margin-bottom:4px">Charge (central symbol)</div>';
  h += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">';
  for (var chi=0;chi<HERALDIC_CHARGES.length;chi++) {
    var ch = HERALDIC_CHARGES[chi];
    var chSelCls = (heraldry.charge || '') === ch.id ? ' sel' : '';
    h += '<div class="h-charge-item' + chSelCls + '" style="border-radius:8px;cursor:pointer;text-align:center;background:var(--card);padding:6px 2px" onclick="heraldryPickCharge(\'' + ch.id + '\',this)">';
    h += '<div style="width:100%;aspect-ratio:1;display:flex;align-items:center;justify-content:center">';
    if (ch.svg) {
      h += '<svg viewBox="0 0 120 100" style="width:60px;height:auto;color:var(--primary-dark)">';
      h += '<path d="M60,8 L105,8 L105,50 Q105,78 60,95 Q15,78 15,50 L15,8 Z" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".2"/>';
      h += '<g color="var(--primary-dark)" opacity=".85" transform="translate(8, 25) scale(1.2)">' + ch.svg.replace(/\s*transform="[^"]*"/g,'') + '</g></svg>';
    }
    h += '</div>';
    h += '<div style="font-size:10px;color:var(--muted);margin-top:2px">' + ch.label + '</div>';
    h += '</div>';
  }
  h += '</div>';
  // Motto
  h += '<div style="font-size:11px;font-weight:600;margin-bottom:4px">Motto (optional)</div>';
  h += '<input type="text" id="heraldry-motto" placeholder="e.g. Fortis et Fidelis" value="' + (heraldry.motto || '').replace(/"/g,'&quot;') + '" oninput="heraldryUpdatePreview()" style="margin-bottom:12px;max-width:100%">';
  // Buttons
  h += '<div style="display:flex;gap:6px">';
  h += '<button class="btn btn-primary" onclick="heraldrySave()" style="flex:1">Save</button>';
  h += '<button class="btn btn-outline" onclick="heraldryReset()" style="flex:1">Reset to Default</button>';
  h += '</div>';
  h += '<button class="btn btn-outline btn-sm" onclick="heraldryCancel()" style="margin-top:6px;width:100%">Cancel</button>';
  h += '</div>';
  // Show overlay
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.id = 'heraldry-overlay';
  ov.innerHTML = h;
  document.body.appendChild(ov);
  // Initial preview
  heraldryUpdatePreview();
}
function heraldryPickField(field, trim, el) {
  if (!D.heraldry) D.heraldry = {};
  D.heraldry.field = field;
  D.heraldry.trim = trim;
  var parent = el && el.parentNode;
  if (parent) {
    var swatches = parent.querySelectorAll('.h-color-swatch');
    for (var i=0;i<swatches.length;i++) { swatches[i].classList.remove('sel'); }
  }
  if (el) el.classList.add('sel');
  heraldryUpdatePreview();
}
function heraldryPickDivision(id, el) {
  if (!D.heraldry) D.heraldry = {};
  D.heraldry.division = id;
  var parent = el && el.parentNode;
  if (parent) {
    var items = parent.querySelectorAll('.h-div-item');
    for (var i=0;i<items.length;i++) { items[i].classList.remove('sel'); }
  }
  if (el) el.classList.add('sel');
  heraldryUpdatePreview();
}
function heraldryPickCharge(id, el) {
  if (!D.heraldry) D.heraldry = {};
  D.heraldry.charge = id;
  var parent = el && el.parentNode;
  if (parent) {
    var items = parent.querySelectorAll('.h-charge-item');
    for (var i=0;i<items.length;i++) { items[i].classList.remove('sel'); }
  }
  if (el) el.classList.add('sel');
  heraldryUpdatePreview();
}
function heraldryUpdatePreview() {
  var mottoEl = document.getElementById('heraldry-motto');
  if (mottoEl && D.heraldry) D.heraldry.motto = mottoEl.value;
  var preview = document.getElementById('heraldry-preview');
  if (!preview) return;
  // Build preview SVG
  var h = D.heraldry || {};
  var days = soberDays();
  var rank = getRank(days);
  var fieldColor = h.field || '#8B6B4A';
  var trimColor = h.trim || '#A08060';
  var bandColor = h.field ? '#00000066' : '#6B4A2A';
  var bannerColor = h.field ? '#00000088' : '#4A2A1A';
  var division = h.division || 'band';
  var charge = h.charge || '';
  var motto = h.motto || rank.title.toUpperCase();
  var s = '<svg viewBox="0 0 120 140" style="width:80px;height:auto">';
  s += '<path d="M60,8 L105,8 L105,65 Q105,105 60,130 Q15,105 15,65 L15,8 Z" fill="' + fieldColor + '" stroke="' + trimColor + '" stroke-width="2"/>';
  if (division !== 'plain') s += divisionPathHTML(division, bandColor, 120, 140);
  s += '<path d="M60,16 L98,16 L98,63 Q98,98 60,120 Q22,98 22,63 L22,16 Z" fill="none" stroke="' + trimColor + '" stroke-width="1" opacity=".4"/>';
  if (charge && charge !== 'none') {
    s += '<g color="#fff" opacity=".85" transform="translate(1, 38) scale(1.4)">' + shieldChargeHTML(charge) + '</g>';
  } else {
    s += '<g transform="translate(18,22)" color="#fff">' + _rankIconHTML(rank.title, 84) + '</g>';
  }
  s += '<path d="M30,131 Q60,137 90,131 L95,146 Q60,152 25,146 Z" fill="' + bannerColor + '" stroke="' + trimColor + '" stroke-width="1"/>';
  s += '<text x="60" y="143" text-anchor="middle" fill="#ffd700" font-size="' + (motto.length > 12 ? 7 : 9) + '" font-weight="bold" font-family="MedievalSharp,serif">' + motto + '</text>';
  s += '<text x="60" y="126" text-anchor="middle" fill="#ffd700" font-size="7" font-family="MedievalSharp,serif" opacity=".8">' + days + ' DAYS</text>';
  s += '</svg>';
  preview.innerHTML = s;
}
function heraldryCancel() {
  D.heraldry = JSON.parse(JSON.stringify(_heraldrySnapshot));
  var ov = document.getElementById('heraldry-overlay');
  if (ov) ov.remove();
  render();
}
function heraldrySave() {
  D.heraldry = D.heraldry || {};
  var mottoEl = document.getElementById('heraldry-motto');
  if (mottoEl) D.heraldry.motto = mottoEl.value;
  // Remove empty strings
  for (var k in D.heraldry) { if (D.heraldry[k] === '') delete D.heraldry[k]; }
  saveData();
  var ov = document.getElementById('heraldry-overlay');
  if (ov) ov.remove();
  render();
}
function heraldryReset() {
  D.heraldry = {};
  saveData();
  var ov = document.getElementById('heraldry-overlay');
  if (ov) ov.remove();
  render();
}

function throneRoomHTML() {
  var days = soberDays();
  var level = kingdomLevel(days);
  var isActive = !!D.sobriety.startDate;
  var h = '';

  if (!isActive) {
    // Abandoned kingdom
    h += '<div class="card" style="padding:0;overflow:hidden">';
    h += kingdomHTML();
    h += '<div style="padding:24px 20px;text-align:center">';
    h += '<div style="font-size:22px;font-weight:700;color:var(--text);margin-bottom:4px">Your Kingdom Awaits</div>';
    h += '<div style="font-size:13px;color:var(--muted);margin-bottom:16px;line-height:1.6">The throne is empty \u2014 and it\u2019s waiting for you.<br>Start your journey and build something real.</div>';
    h += '<button class="btn btn-primary" onclick="showOnboarding()" style="width:100%;padding:14px;font-size:15px;font-weight:700">Start Your Reign</button>';
    h += '</div></div>';
    return h;
  }

  // === ACTIVE THRONE ROOM ===

  // Kingdom name banner
  var kName = D.kingdomName && D.kingdomName.trim() ? D.kingdomName.trim() : 'My Kingdom';
  h += '<div style="text-align:center;margin-bottom:4px;cursor:pointer" onclick="kNamePrompt()" title="Tap to rename">';
  h += '<div style="display:inline-block;background:linear-gradient(135deg,var(--stone-base),var(--stone-border));padding:4px 20px;border-radius:4px;border:1px solid var(--gold);box-shadow:0 1px 4px rgba(0,0,0,.08)">';
  h += '<div style="font-size:16px;font-weight:700;font-family:MedievalSharp,serif;color:var(--primary-dark);letter-spacing:2px;text-transform:uppercase">' + safe(kName) + '</div>';
  h += '<div style="font-size:7px;color:var(--muted);letter-spacing:4px;text-transform:uppercase;margin-top:-1px">' + (D.kingdomName ? 'Tap to rename' : 'Tap to name your kingdom') + '</div>';
  h += '</div></div>';
  h += '<div style="text-align:center;margin-bottom:2px"><span style="font-size:10px;color:var(--accent);cursor:pointer;opacity:.6" onclick="showKingdomMap()" title="Explore the realm">\uD83D\uDDFA View Map</span></div>';

  // 0. Medieval date banner (top of throne room)
  h += '<div style="display:flex;align-items:center;justify-content:center;gap:8px;font-size:13px;color:var(--accent);letter-spacing:.5px;font-style:italic;padding:6px 0 4px;font-family:MedievalSharp,serif;border-bottom:1px solid var(--border);margin-bottom:8px">';
  h += medievalDate();
  var w=D._lastWeather||(D._lastWeather=getKingdomWeather());D._lastWeather=w;
  var wIcons={clear:'\u2600',cloudy:'\u2601',rain:'\u2602',storm:'\u26A1',fog:'\u2744',mist:'\u2744',rainbow:'\u269C',aurora:'\u2726'};
  var wNames={clear:'Clear',cloudy:'Cloudy',rain:'Rain',storm:'Storm',fog:'Fog',mist:'Mist',rainbow:'Rainbow',aurora:'Aurora'};
  h += '<span style="font-size:12px;opacity:.7">' + (wIcons[w]||'\u2600') + ' ' + (wNames[w]||'') + '</span>';
  h += '</div>';

  // 1. Kingdom scene (full-width, no top border radius)
  h += '<div class="card" style="padding:0;overflow:hidden;border-radius:16px 16px 0 0">';
  h += kingdomHTML();
  h += '</div>';

  // 2. Stats bar
  var rank = getRank(days);
  var streak = D.streak || 0;
  var wc = D.warchest || {};
  var schillings = wc.schillings || 0;
  var shields = wc.shields || 0;

  h += '<div class="card" style="margin-top:-4px;border-top-left-radius:0;border-top-right-radius:0;padding:12px 10px 10px">';
  h += '<div style="display:flex;justify-content:space-around;align-items:center">';
  h += '<div style="text-align:center;flex:1"><div style="font-size:24px;font-weight:800;color:var(--primary)">' + days + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">DAYS</div></div>';
  h += '<div style="text-align:center;flex:1"><div style="font-size:16px;font-weight:700;color:var(--text)">' + _rankIconHTML(rank.title, 16) + ' ' + rank.title + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">RANK</div></div>';
  h += '<div style="text-align:center;flex:1"><div style="font-size:24px;font-weight:800;color:var(--accent)">' + streak + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">STREAK</div></div>';
  h += '<div style="text-align:center;flex:1"><div style="font-size:22px;font-weight:700;color:#8a6a4a">' + kingdomPopulation(days) + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">VILLAGERS</div></div>';
  h += '<div style="text-align:center;flex:1;cursor:pointer" onclick="goTo(\'warchest\')" title="' + (shields > 0 ? shields + ' shields' : '') + '"><div style="font-size:22px;font-weight:700;color:#d4a017">' + schillings + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px">COINS</div></div>';
  // King's Ledger mini widget
  if (D.sobriety.startDate) {
    var _cpDay = D.sobriety.costPerDay || 0;
    var _moneySaved = days * _cpDay;
    if (_cpDay > 0) {
      h += '<div style="text-align:center;flex:1"><div style="font-size:18px;font-weight:700;color:var(--gold)">$' + _moneySaved.toLocaleString() + '</div><div style="font-size:9px;color:var(--muted);letter-spacing:1px;cursor:pointer" onclick="goTo(\'warchest\')">SAVED</div></div>';
    } else {
      h += '<div style="text-align:center;flex:1;cursor:pointer" onclick="goTo(\'warchest\')"><div style="font-size:10px;color:var(--muted)">Set daily cost</div><div style="font-size:9px;letter-spacing:1px;color:var(--gold)">in War Chest</div></div>';
    }
  }
  h += '</div>';
  // Rank progress
  if (rank.next) {
    var prog = days - rank.threshold;
    var need = rank.nextThreshold - rank.threshold;
    var pct = Math.min(100, Math.round(prog / need * 100));
    h += '<div style="width:70%;margin:6px auto 2px;height:3px;background:var(--border);border-radius:2px;overflow:hidden">';
    h += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:2px;transition:width .4s"></div></div>';
    h += '<div style="font-size:9px;color:var(--muted);text-align:center">' + pct + '% to ' + rank.next + '</div>';
  } else {
    h += '<div style="font-size:9px;color:var(--accent);text-align:center;margin-top:2px">The realm is yours, my liege</div>';
  }
  h += '</div>';

  // 3. Level card (medieval rank, clickable → profile)
  var _lvl = soberLevel();
  var _prog = soberLevelProgress();
  h += '<div class="card" style="margin-top:8px;padding:10px;text-align:center;cursor:pointer" onclick="goTo(\'profile\')">';
  h += '<div style="font-size:24px">' + _lvl.icon + '</div>';
  h += '<div style="font-size:14px;font-weight:700;color:var(--primary)">' + _lvl.title + '</div>';
  h += '<div class="progress-bar" style="max-width:140px;margin:4px auto"><div class="fill" style="width:' + _prog + '%"></div></div>';
  h += '<div style="font-size:10px;color:var(--muted)">Level ' + _lvl.level + ' &middot; ' + _prog + '% to next rank</div>';
  h += '</div>';

  // 4. Sobriety timer (right under castle)
  h += soberTimerHTML();

  // 4. Coat of Arms
  h += coatOfArmsHTML();

  // 5. Quick actions
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0">';
  h += '<button class="btn btn-primary btn-sm" onclick="goTo(\'journal\')" style="background:linear-gradient(135deg,#5a3a1a,#7a5a3a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2726</span> Journal</button>';
  h += '<button class="btn btn-primary btn-sm" onclick="goTo(\'track\')" style="background:linear-gradient(135deg,#3a5a2a,#5a7a4a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2619</span> Check-In</button>';
  h += '<button class="btn btn-primary btn-sm" onclick="showCravingBreaker()" style="background:linear-gradient(135deg,#5a2a2a,#7a4a4a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2694</span> Craving</button>';
  h += '<button class="btn btn-primary btn-sm" onclick="startBreathe()" style="background:linear-gradient(135deg,#2a4a5a,#4a6a7a);border:none;flex-direction:column;gap:2px;padding:10px 8px;font-size:12px;line-height:1.3"><span style="font-size:16px">\u2766</span> Breathe</button>';
  h += '</div>';

  // 5. Round Table (all 3 NPCs)
  h += roundTableHTML();

  return h;
}

function kNamePrompt() {
  var current = D.kingdomName || '';
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center"><div style="font-size:32px;margin-bottom:4px">\uD83C\uDFF0</div><h3 style="font-size:18px;font-weight:700;margin:0 0 4px">Name Your Kingdom</h3><p style="font-size:12px;color:var(--muted);margin-bottom:12px">What shall your realm be called?</p><input type="text" id="kNameInput" value="' + safe(current) + '" placeholder="My Kingdom" style="text-align:center;font-size:16px;font-weight:600;font-family:MedievalSharp,serif;letter-spacing:1px;margin-bottom:12px"><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()">Cancel</button><button class="btn btn-primary btn-sm" onclick="var v=document.getElementById(\'kNameInput\').value;if(v&&v.trim()){D.kingdomName=v.trim();}else{D.kingdomName=\'\';}saveData();this.closest(\'.overlay\').remove();render()">Save</button></div></div>';
  document.body.appendChild(overlay);
  setTimeout(function() {
    var inp = document.getElementById('kNameInput');
    if (inp) { inp.focus(); inp.select(); }
  }, 100);
}

function homeHTML() {
  var h = '';

  // Throne Room — the central hub
  h += throneRoomHTML();

  // Crisis widget — always visible on home
  h += '<div class="card" style="border-left:4px solid var(--danger);padding:12px;cursor:pointer;background:linear-gradient(135deg,rgba(220,38,38,.04),var(--card))" onclick="showSOS()"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:28px;line-height:1">&#128222;</div><div style="flex:1"><div style="font-weight:700;font-size:14px;color:var(--danger)">'+t('Need help right now?')+'</div><div style="font-size:12px;color:var(--muted)">'+t('SOS — crisis support is available 24/7')+'</div></div><span style="font-size:18px;color:var(--muted)">&#8250;</span></div></div>';

  h += pledgeHTML();

  h += dailyQuote();

  h += dailyChallenge();

  h += monthlyChallengeHTML();

  h += dailyQuestsHTML();
  h += weeklyCampaignHTML();

  h += recoveryGoalsHTML();

  // Time capsule ready notification
  if (D.timeCapsules) {
    var tcReady = D.timeCapsules.filter(function(c){return Date.now() >= c.unlockAt && !c.unlocked});
    if (tcReady.length) {
      h += '<div class="card" style="border-left:4px solid var(--accent);cursor:pointer;background:linear-gradient(135deg,#f5efe6,var(--card))" onclick="goTo(\'timecapsule\')">';
      h += '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:32px">&#9203;</div><div><div style="font-weight:700;font-size:15px">Time Capsule'+(tcReady.length>1?'s':'')+' Ready!</div><div style="font-size:12px;color:var(--muted)">Arthur has '+tcReady.length+' message'+(tcReady.length>1?'s':'')+' for you. Tap to open.</div></div></div></div>';
    }
  }

  h += pendingFollowUpHTML();
  h += accPendingHTML();

  h += '<div style="text-align:center;margin:4px 0 8px"><button class="btn btn-sm btn-outline" onclick="showShareCard()" style="width:100%">&#x265B; '+t('Share My Progress')+'</button></div>';

  // Famous recovery figure (matched to user's addictions)
  var userAddictions = D.targetAddictions || [];
  var matchedFigs = userAddictions.length ? FAMOUS_RECOVERY.filter(function(f){ return f.types.some(function(t){ return userAddictions.indexOf(t) >= 0; }); }) : [];
  if (!matchedFigs.length) matchedFigs = FAMOUS_RECOVERY;
  if (matchedFigs.length) {
    var pick = matchedFigs[Math.floor(Math.random() * matchedFigs.length)];
    h += '<div class="card" style="border-left:3px solid var(--primary);padding:14px"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:20px">&#x265B;</span><span style="font-weight:700;font-size:14px">'+t('They Recovered Too')+'</span></div>';
    h += '<div style="font-weight:600;font-size:15px;margin-bottom:2px">' + pick.name + '</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">'+t('Overcame')+' ' + pick.addiction + '</div>';
    h += '<div style="font-size:13px;line-height:1.5;margin-bottom:6px">' + pick.story + '</div>';
    h += '<div style="font-size:13px;font-style:italic;color:var(--text);background:var(--primary-light);padding:8px 10px;border-radius:8px">' + pick.quote + '</div></div>';
  }

  return h;
}

