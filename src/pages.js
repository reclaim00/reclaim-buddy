// ====== ASSESSMENT QUIZ ======
var ASSESS_QUESTIONS = [
  'I have used one or more drugs other than those required for medical reasons.',
  'I have used more than one substance at a time.',
  'I have used a substance in larger amounts or for longer than I intended.',
  'I sometimes wonder whether I am dependent on a drug or substance.',
  'I am always able to stop using drugs or substances when I want.',
  'I have experienced one or more blackouts as a result of substance use.',
  'I have experienced medical problems as a result of substance use.',
  'I sometimes feel bad about my substance use.',
  'I devote a good deal of time to getting and or using the drug.',
  'I have never engaged in illicit activities to get drugs.',
  'I have used a substance in a situation in which it is physically hazardous.',
  'It takes a good deal of time to recover from the effects of my substance use.',
  'I experience cravings or a strong desire to use a substance.',
  'Family members and or friends have asked me whether I am involved with drugs.',
  'I have tried stopping the use of a substance one or more times but resumed use.',
  'I experienced unpleasant effects when I stopped using a substance.',
  'I have used a substance to relieve the unpleasant effects I experience when not taking it.',
  'I have sometimes neglected work or school because of the use of a substance.',
  'I have sometimes neglected family obligations because of the use of a substance.',
  'I find myself needing more of a substance to achieve the desired effect.'
];

var SCREENER_PHQ = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself  or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite  being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself'
];

var SCREENER_GAD7 = [
  'Feeling nervous, anxious, or on edge',
  'Not being able to stop or control worrying',
  'Worrying too much about different things',
  'Trouble relaxing',
  'Being so restless that it is hard to sit still',
  'Becoming easily annoyed or irritable',
  'Feeling afraid, as if something awful might happen'
];

function screenerScore(questions, answers) {
  var total = 0, count = 0;
  for (var i=0;i<answers.length;i++) {
    if (answers[i] !== null && answers[i] !== undefined) { total += answers[i]; count++; }
  }
  return { total: total, count: count };
}

function screenerSeverityPHQ(score) {
  if (score <= 4) return { label: 'Minimal', color: 'var(--primary)' };
  if (score <= 9) return { label: 'Mild', color: 'var(--accent)' };
  if (score <= 14) return { label: 'Moderate', color: '#f97316' };
  if (score <= 19) return { label: 'Moderately Severe', color: 'var(--danger)' };
  return { label: 'Severe', color: '#7c3aed' };
}

function screenerSeverityGAD(score) {
  if (score <= 4) return { label: 'Minimal', color: 'var(--primary)' };
  if (score <= 9) return { label: 'Mild', color: 'var(--accent)' };
  if (score <= 14) return { label: 'Moderate', color: '#f97316' };
  return { label: 'Severe', color: 'var(--danger)' };
}

function quizOptionsHTML(name, savedVal) {
  var opts = [
    {val:0, label:'Never', color:'var(--primary)', bg:'var(--primary-light)'},
    {val:25, label:'Rarely', color:'var(--accent)', bg:'#f5efe6'},
    {val:50, label:'Sometimes', color:'#f97316', bg:'#fff7ed'},
    {val:75, label:'Often', color:'var(--danger)', bg:'var(--danger-bg)'},
    {val:100, label:'Always', color:'#7c3aed', bg:'#f3e8ff'}
  ];
  var h = '<div class="quiz-opts" data-name="' + name + '" style="display:flex;gap:6px;margin:6px 0;flex-wrap:wrap">';
  for (var oi=0;oi<opts.length;oi++) {
    var isSel = (savedVal !== undefined && savedVal !== null && savedVal == opts[oi].val);
    h += '<label class="quiz-label" data-idx="' + oi + '" style="flex:1;text-align:center;padding:10px 4px;border-radius:10px;border:2px solid ' + (isSel ? opts[oi].color : 'var(--border)') + ';background:' + (isSel ? opts[oi].bg : 'var(--card)') + ';cursor:pointer;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:2px">';
    h += '<input type="radio" name="' + name + '" value="' + opts[oi].val + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
    h += '<span style="font-size:13px;font-weight:' + (isSel ? '700' : '500') + ';color:' + (isSel ? opts[oi].color : 'var(--text)') + '">' + opts[oi].label + '</span>';
    h += '</label>';
  }
  h += '</div>';
  return h;
}

document.addEventListener('change', function(e){
  if (e.target && e.target.matches('.quiz-opts input[type=radio]')) {
    var wrapper = e.target.closest('.quiz-opts');
    if (!wrapper) return;
    var labels = wrapper.querySelectorAll('.quiz-label');
    var optsData = [
      {color:'var(--primary)', bg:'var(--primary-light)'},
      {color:'var(--accent)', bg:'#f5efe6'},
      {color:'#f97316', bg:'#fff7ed'},
      {color:'var(--danger)', bg:'var(--danger-bg)'},
      {color:'#7c3aed', bg:'#f3e8ff'}
    ];
    labels.forEach(function(lbl, idx){
      var radio = lbl.querySelector('input[type=radio]');
      var span = lbl.querySelector('span');
      if (radio && radio.checked) {
        lbl.style.borderColor = optsData[idx].color;
        lbl.style.background = optsData[idx].bg;
        if (span) { span.style.fontWeight = '700'; span.style.color = optsData[idx].color; }
      } else {
        lbl.style.borderColor = 'var(--border)';
        lbl.style.background = 'var(--card)';
        if (span) { span.style.fontWeight = '500'; span.style.color = 'var(--text)'; }
      }
    });
  }
});

function assessmentHTML() {
  var h = '<h2 class="page-title">Addiction Assessment</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">This screening helps you understand your relationship with substances.</p>';
  if (D.assessmentTaken && D.assessmentResult) {
    var r = D.assessmentResult;
    var sev = r.score <= 20 ? 'Low Risk' : r.score <= 40 ? 'Moderate' : r.score <= 60 ? 'Substantial' : r.score <= 80 ? 'Severe' : 'Critical';
    var sevColor = r.score <= 20 ? 'var(--primary)' : r.score <= 40 ? 'var(--accent)' : r.score <= 60 ? '#f97316' : r.score <= 80 ? 'var(--danger)' : '#7c3aed';
    h += '<div class="card" style="text-align:center;border:2px solid '+sevColor+'">';
    h += '<div style="font-size:48px;font-weight:900;color:'+sevColor+'">'+r.score+'/100</div>';
    h += '<div style="font-size:18px;font-weight:700;color:'+sevColor+'">'+sev+'</div>';
    h += '<p style="font-size:13px;color:var(--muted);margin-top:8px">Assessed on '+new Date(r.date).toLocaleDateString()+'</p>';
    h += '<p style="font-size:12px;color:var(--muted);margin-top:4px">This is not a diagnosis. Talk to a professional for a full evaluation.</p>';
    h += '<button class="btn btn-outline btn-sm" onclick="D.assessmentTaken=false;D.assessmentProgress=null;saveData()" style="margin-top:8px">Retake Assessment</button></div>';
    return h;
  }
  if (!D.assessmentProgress || D.assessmentProgress.length !== ASSESS_QUESTIONS.length) {
    D.assessmentProgress = new Array(ASSESS_QUESTIONS.length).fill(null);
  }
  h += '<div class="card" id="quiz" data-idx="0">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="q-step" style="font-size:12px;color:var(--muted);font-weight:600">Question 1 of ' + ASSESS_TOTAL_STEPS + '</span><span class="q-pct" style="font-size:12px;color:var(--muted)">0%</span></div>';
  h += '<div class="progress-bar" style="margin-bottom:10px"><div class="fill q-bar" style="width:0%"></div></div>';
  h += '<div class="q-body"></div>';
  h += '<div style="display:flex;gap:8px;margin-top:10px">';
  h += '<button class="btn btn-outline btn-sm q-prev" onclick="quizNav(-1)" style="flex:1;display:none">&#8592; Previous</button>';
  h += '<button class="btn btn-primary btn-sm q-next" onclick="quizNav(1)" style="flex:1">Next &#8594;</button>';
  h += '<button class="btn btn-primary btn-sm q-submit" onclick="quizSubmit()" style="flex:1;display:none">See Results</button>';
  h += '</div></div>';
  return h;
}

function quizNav(dir) {
  var quiz = document.getElementById('quiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var sel = document.querySelector('.q-body input[type=radio]:checked');
  if (sel) D.assessmentProgress[idx] = parseInt(sel.value);
  var next = idx + dir;
  if (next < 0 || next >= ASSESS_TOTAL_STEPS) return;
  quiz.setAttribute('data-idx', next);
  renderQuizQuestion(next);
  localStorage.setItem(dataKey(), JSON.stringify(D));
}

function quizSubmit() {
  var quiz = document.getElementById('quiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var sel = document.querySelector('.q-body input[type=radio]:checked');
  if (sel) D.assessmentProgress[idx] = parseInt(sel.value);
  var score = 0, count = 0;
  for (var i=0;i<D.assessmentProgress.length;i++) {
    if (D.assessmentProgress[i] !== null) {
      var val = D.assessmentProgress[i];
      if (i === 4 || i === 9) val = 100 - val;
      score += val; count++;
    }
  }
  score = count > 0 ? Math.round(score / count) : 0;
  D.assessmentTaken = true;
  D.assessmentResult = { score: score, date: Date.now(), answers: D.assessmentProgress.slice() };
  D.assessmentProgress = null;
  saveData();
}

function renderQuizQuestion(idx) {
  var quiz = document.getElementById('quiz');
  if (!quiz) return;
  var savedVal = D.assessmentProgress && D.assessmentProgress.length === ASSESS_QUESTIONS.length ? D.assessmentProgress[idx] : null;
  quiz.querySelector('.q-body').innerHTML = '<div><p style="font-weight:600;font-size:15px;margin-bottom:8px">' + (idx+1) + '. ' + ASSESS_QUESTIONS[idx] + '</p>' + quizOptionsHTML('q' + idx, savedVal) + '</div>';
  var step = quiz.querySelector('.q-step');
  var bar = quiz.querySelector('.q-bar');
  var pct = quiz.querySelector('.q-pct');
  var prev = quiz.querySelector('.q-prev');
  var next = quiz.querySelector('.q-next');
  var submit = quiz.querySelector('.q-submit');
  if (step) step.textContent = 'Question ' + (idx+1) + ' of ' + ASSESS_TOTAL_STEPS;
  var pp = Math.round(((idx+1) / ASSESS_TOTAL_STEPS) * 100);
  if (bar) bar.style.width = pp + '%';
  if (pct) pct.textContent = pp + '%';
  if (prev) prev.style.display = idx === 0 ? 'none' : 'block';
  if (next) next.style.display = idx >= ASSESS_TOTAL_STEPS - 1 ? 'none' : 'block';
  if (submit) submit.style.display = idx >= ASSESS_TOTAL_STEPS - 1 ? 'inline-block' : 'none';
}

function showAssessmentAfterSignIn() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var sev = '';
  if (D.assessmentTaken && D.assessmentResult) {
    var r = D.assessmentResult;
    var sevLbl = r.score <= 20 ? 'Low Risk' : r.score <= 40 ? 'Moderate' : r.score <= 60 ? 'Substantial' : r.score <= 80 ? 'Severe' : 'Critical';
    var sevColor = r.score <= 20 ? 'var(--primary)' : r.score <= 40 ? 'var(--accent)' : r.score <= 60 ? '#f97316' : r.score <= 80 ? 'var(--danger)' : '#7c3aed';
    sev = '<div class="card" style="text-align:center;border:2px solid '+sevColor+';margin-bottom:12px">';
    sev += '<div style="font-size:36px;font-weight:900;color:'+sevColor+'">'+r.score+'/100</div>';
    sev += '<div style="font-size:16px;font-weight:700;color:'+sevColor+'">'+sevLbl+'</div>';
    sev += '<p style="font-size:12px;color:var(--muted);margin-top:4px">Assessed on '+new Date(r.date).toLocaleDateString()+'</p></div>';
  }
  if (!D.assessmentProgress || D.assessmentProgress.length !== ASSESS_QUESTIONS.length) {
    D.assessmentProgress = new Array(ASSESS_QUESTIONS.length).fill(null);
  }
  var h = '<div class="overlay-content" style="max-width:500px">';
  h += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div style="font-size:24px">&#128203;</div><div><h3 style="font-size:18px;font-weight:700;margin:0">Addiction Assessment</h3><p style="font-size:12px;color:var(--muted);margin:2px 0 0">Help us understand where you are on your journey</p></div></div>';
  h += sev;
  if (!D.assessmentTaken) {
    h += '<div class="osi-quiz" data-idx="0">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><span class="osi-step" style="font-size:12px;color:var(--muted);font-weight:600">Question 1 of ' + ASSESS_TOTAL_STEPS + '</span><span class="osi-pct" style="font-size:12px;color:var(--muted)">0%</span></div>';
    h += '<div class="progress-bar" style="margin-bottom:8px"><div class="fill osi-bar" style="width:0%"></div></div>';
    h += '<div class="osi-body"></div>';
    h += '<div style="display:flex;gap:8px;margin-top:10px">';
    h += '<button class="btn btn-outline btn-sm osi-prev" onclick="osiNav(-1)" style="flex:1;display:none">&#8592; Previous</button>';
    h += '<button class="btn btn-primary btn-sm osi-next" onclick="osiNav(1)" style="flex:1">Next &#8594;</button>';
    h += '<button class="btn btn-primary btn-sm osi-submit" onclick="osiSubmit(this)" style="flex:1;display:none">See Results</button>';
    h += '</div></div>';
  } else {
    h += '<p style="font-size:13px;color:var(--muted)">You\'ve already taken the assessment. You can retake it anytime from the More menu.</p>';
    h += '<button class="btn btn-outline" onclick="D.assessmentTaken=false;D.assessmentProgress=null;saveData();this.closest(\'.overlay\').remove();showAssessmentAfterSignIn()" style="margin-top:4px">Retake Assessment</button>';
  }
h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:8px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  if (!D.assessmentTaken) {
    var qq = overlay.querySelector('.osi-quiz');
    if (qq) renderOsiQuestion(qq, 0);
  }
}

var ASSESS_TOTAL_STEPS = ASSESS_QUESTIONS.length;

function osiNav(dir) {
  var quiz = document.querySelector('.osi-quiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var sel = quiz.querySelector('.osi-body input[type=radio]:checked');
  if (sel) D.assessmentProgress[idx] = parseInt(sel.value);
  var next = idx + dir;
  if (next < 0 || next >= ASSESS_TOTAL_STEPS) return;
  quiz.setAttribute('data-idx', next);
  renderOsiQuestion(quiz, next);
  localStorage.setItem(dataKey(), JSON.stringify(D));
}

function renderOsiQuestion(quiz, idx) {
  var savedVal = D.assessmentProgress && D.assessmentProgress.length === ASSESS_QUESTIONS.length ? D.assessmentProgress[idx] : null;
  quiz.querySelector('.osi-body').innerHTML = '<div><p style="font-weight:600;font-size:14px;margin-bottom:8px">' + (idx+1) + '. ' + ASSESS_QUESTIONS[idx] + '</p>' + quizOptionsHTML('oq' + idx, savedVal) + '</div>';
  var step = quiz.querySelector('.osi-step');
  var bar = quiz.querySelector('.osi-bar');
  var pct = quiz.querySelector('.osi-pct');
  var prev = quiz.querySelector('.osi-prev');
  var next = quiz.querySelector('.osi-next');
  var submit = quiz.querySelector('.osi-submit');
  if (step) step.textContent = 'Question ' + (idx+1) + ' of ' + ASSESS_TOTAL_STEPS;
  var pp = Math.round(((idx+1) / ASSESS_TOTAL_STEPS) * 100);
  if (bar) bar.style.width = pp + '%';
  if (pct) pct.textContent = pp + '%';
  if (prev) prev.style.display = idx === 0 ? 'none' : 'block';
  if (next) next.style.display = idx >= ASSESS_TOTAL_STEPS - 1 ? 'none' : 'block';
  if (submit) submit.style.display = idx >= ASSESS_TOTAL_STEPS - 1 ? 'inline-block' : 'none';
}

function osiSubmit(btn) {
  var quiz = document.querySelector('.osi-quiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var sel = quiz.querySelector('.osi-body input[type=radio]:checked');
  if (sel) D.assessmentProgress[idx] = parseInt(sel.value);
  var score = 0, count = 0;
  for (var i=0;i<D.assessmentProgress.length;i++) {
    if (D.assessmentProgress[i] !== null) {
      var val = D.assessmentProgress[i];
      if (i === 4 || i === 9) val = 100 - val;
      score += val; count++;
    }
  }
  score = count > 0 ? Math.round(score / count) : 0;
  D.assessmentTaken = true;
  D.assessmentResult = { score: score, date: Date.now(), answers: D.assessmentProgress.slice() };
  D.assessmentProgress = null;
  saveData();
  var overlay = btn.closest('.overlay');
  overlay.remove();
  showAssessmentAfterSignIn();
}

// ====== SELF-CHECK SCREENERS ======
var SCREENER_OPTS = [
  { val: 0, label: 'Not at all', color: 'var(--primary)', bg: 'var(--primary-light)' },
  { val: 1, label: 'Several days', color: 'var(--accent)', bg: '#f5efe6' },
  { val: 2, label: 'More than half the days', color: '#f97316', bg: '#fff7ed' },
  { val: 3, label: 'Nearly every day', color: 'var(--danger)', bg: 'var(--danger-bg)' }
];

var screenerActive = null; // 'phq9' or 'gad7'

function screenerOptionsHTML(name, savedVal) {
  var h = '<div class="quiz-opts" data-name="' + name + '" style="display:flex;gap:6px;margin:6px 0;flex-wrap:wrap">';
  for (var i = 0; i < SCREENER_OPTS.length; i++) {
    var isSel = (savedVal !== undefined && savedVal !== null && savedVal == SCREENER_OPTS[i].val);
    h += '<label class="quiz-label" style="flex:1;text-align:center;padding:10px 4px;border-radius:10px;border:2px solid ' + (isSel ? SCREENER_OPTS[i].color : 'var(--border)') + ';background:' + (isSel ? SCREENER_OPTS[i].bg : 'var(--card)') + ';cursor:pointer;transition:.15s;display:flex;flex-direction:column;align-items:center;gap:2px">';
    h += '<input type="radio" name="' + name + '" value="' + SCREENER_OPTS[i].val + '"' + (isSel ? ' checked' : '') + ' style="display:none">';
    h += '<span style="font-size:12px;font-weight:' + (isSel ? '700' : '500') + ';color:' + (isSel ? SCREENER_OPTS[i].color : 'var(--text)') + '">' + SCREENER_OPTS[i].label + '</span>';
    h += '</label>';
  }
  h += '</div>';
  return h;
}

function screenerHTML() {
  if (!D.screenerPHQ9) { D.screenerPHQ9 = { taken: false, result: null, progress: null }; localStorage.setItem(dataKey(), JSON.stringify(D)); try { syncToFirestore(); } catch(e){ console.warn('screenerPHQ9 sync failed:', e); } }
  if (!D.screenerGAD7) { D.screenerGAD7 = { taken: false, result: null, progress: null }; localStorage.setItem(dataKey(), JSON.stringify(D)); try { syncToFirestore(); } catch(e){ console.warn('screenerGAD7 sync failed:', e); } }
  var h = '<h2 class="page-title">Self-Check Screeners</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">These brief questionnaires can help you check in on your well-being. Results are private and not a diagnosis.</p>';

  function screenerCard(key, title, icon, questions, data) {
    var card = '<div class="card" style="border-left:3px solid var(--primary);margin-bottom:10px">';
    card += '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><span style="font-size:24px">' + icon + '</span><div><div style="font-weight:700;font-size:15px">' + title + '</div><div style="font-size:12px;color:var(--muted)">' + questions.length + ' questions, 2&ndash;3 minutes</div></div></div>';
    if (data.taken && data.result) {
      var r = data.result;
      var sev = key === 'phq9' ? screenerSeverityPHQ(r.total) : screenerSeverityGAD(r.total);
      card += '<div style="text-align:center;padding:10px;background:' + sev.color.replace('var(', '').replace(')', '') + '15;border-radius:10px;border:1px solid ' + sev.color + '">';
      card += '<div style="font-size:32px;font-weight:900;color:' + sev.color + '">' + r.total + '/' + (key === 'phq9' ? 27 : 21) + '</div>';
      card += '<div style="font-size:14px;font-weight:700;color:' + sev.color + '">' + sev.label + '</div>';
      card += '<div style="font-size:11px;color:var(--muted);margin-top:2px">Taken ' + new Date(r.date).toLocaleDateString() + '</div>';
      card += '<button class="btn btn-outline btn-sm" onclick="screenerRetake(\'' + key + '\')" style="margin-top:6px">Retake</button></div>';
    } else {
      card += '<button class="btn btn-primary btn-sm" onclick="screenerStart(\'' + key + '\')" style="width:100%">Start ' + title + '</button>';
    }
    card += '</div>';
    return card;
  }

  h += screenerCard('phq9', 'PHQ-9', '&#128555;', SCREENER_PHQ, D.screenerPHQ9);
  h += screenerCard('gad7', 'GAD-7', '&#128534;', SCREENER_GAD7, D.screenerGAD7);
  h += '<div class="card" style="background:var(--primary-light);border:none;text-align:center;font-size:12px;color:var(--muted)"><strong>Important:</strong> These are self-checks only, not a diagnosis. If you are in crisis, use <strong>SOS</strong> or call <strong>988</strong> (Suicide &amp; Crisis Lifeline).</div>';
  return h;
}

function screenerStart(type) {
  screenerActive = type;
  var questions = type === 'phq9' ? SCREENER_PHQ : SCREENER_GAD7;
  var data = type === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  data.progress = new Array(questions.length).fill(null);
  data.taken = false;
  data.result = null;
  try { localStorage.setItem(dataKey(), JSON.stringify(D)); } catch(e) { console.warn('screenerStart: localStorage write failed', e); }
  syncToFirestore();
  screenerRenderQuiz();
}

function screenerRetake(type) {
  var data = type === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  data.taken = false;
  data.result = null;
  screenerStart(type);
}

function screenerRenderQuiz() {
  var questions = screenerActive === 'phq9' ? SCREENER_PHQ : SCREENER_GAD7;
  var data = screenerActive === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  var total = questions.length;
  var title = screenerActive === 'phq9' ? 'PHQ-9' : 'GAD-7';
  var h = '<div style="display:flex;align-items:center;gap:8px;margin:8px 0"><button class="btn btn-sm btn-outline" onclick="screenerCancel()" style="width:auto">&#8592; Back</button><h2 class="page-title" style="margin:0;flex:1;border:none;background:none;text-align:left">' + title + '</h2></div>';
  h += '<div class="card" id="squiz" data-type="' + screenerActive + '" data-idx="0">';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><span class="sq-step" style="font-size:12px;color:var(--muted);font-weight:600">Question 1 of ' + total + '</span><span class="sq-pct" style="font-size:12px;color:var(--muted)">0%</span></div>';
  h += '<div class="progress-bar" style="margin-bottom:10px"><div class="fill sq-bar" style="width:0%"></div></div>';
  h += '<div class="sq-body"></div>';
  h += '<div style="display:flex;gap:8px;margin-top:10px">';
  h += '<button class="btn btn-outline btn-sm sq-prev" onclick="screenerNav(-1)" style="flex:1;display:none">&#8592; Previous</button>';
  h += '<button class="btn btn-primary btn-sm sq-next" onclick="screenerNav(1)" style="flex:1">Next &#8594;</button>';
  h += '<button class="btn btn-primary btn-sm sq-submit" onclick="screenerSubmit()" style="flex:1;display:none">See Results</button>';
  h += '</div></div>';
  var app = document.getElementById('app');
  if (app) app.innerHTML = h;
  screenerRenderItem(0);
}

function screenerCancel() {
  screenerActive = null;
  render();
}

function screenerNav(dir) {
  var quiz = document.getElementById('squiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var type = quiz.getAttribute('data-type');
  var data = type === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  var sel = document.querySelector('.sq-body input[type=radio]:checked');
  if (sel) data.progress[idx] = parseInt(sel.value);
  var next = idx + dir;
  var questions = type === 'phq9' ? SCREENER_PHQ : SCREENER_GAD7;
  if (next < 0 || next >= questions.length) return;
  quiz.setAttribute('data-idx', next);
  screenerRenderItem(next);
  try { localStorage.setItem(dataKey(), JSON.stringify(D)); } catch(e) { console.warn('screenerNav: localStorage write failed', e); }
  syncToFirestore();
}

function screenerSubmit() {
  var quiz = document.getElementById('squiz');
  if (!quiz) return;
  var idx = parseInt(quiz.getAttribute('data-idx'));
  var type = quiz.getAttribute('data-type');
  var data = type === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  var questions = type === 'phq9' ? SCREENER_PHQ : SCREENER_GAD7;
  var sel = document.querySelector('.sq-body input[type=radio]:checked');
  if (sel) data.progress[idx] = parseInt(sel.value);
  var result = screenerScore(questions, data.progress);
  // Archive previous result to history
  if (data.result && data.result.date) {
    if (!data._history) data._history = [];
    data._history.push({ total: data.result.total, date: data.result.date, answers: data.result.answers });
  }
  data.taken = true;
  data.result = { total: result.total, date: Date.now(), answers: data.progress.slice() };
  data.progress = null;
  screenerActive = null;
  saveData();
}

function screenerRenderItem(idx) {
  var quiz = document.getElementById('squiz');
  if (!quiz) return;
  var type = quiz.getAttribute('data-type');
  var questions = type === 'phq9' ? SCREENER_PHQ : SCREENER_GAD7;
  var data = type === 'phq9' ? D.screenerPHQ9 : D.screenerGAD7;
  var savedVal = data.progress && data.progress.length === questions.length ? data.progress[idx] : null;
  var total = questions.length;
  quiz.querySelector('.sq-body').innerHTML = '<div><p style="font-weight:600;font-size:15px;margin-bottom:8px">Over the last <strong>2 weeks</strong>, how often have you been bothered by:</p><p style="font-weight:600;font-size:15px;margin-bottom:8px">' + (idx+1) + '. ' + questions[idx] + '</p>' + screenerOptionsHTML('sq' + idx, savedVal) + '</div>';
  var step = quiz.querySelector('.sq-step');
  var bar = quiz.querySelector('.sq-bar');
  var pct = quiz.querySelector('.sq-pct');
  var prev = quiz.querySelector('.sq-prev');
  var next = quiz.querySelector('.sq-next');
  var submit = quiz.querySelector('.sq-submit');
  if (step) step.textContent = 'Question ' + (idx+1) + ' of ' + total;
  var pp = Math.round(((idx+1) / total) * 100);
  if (bar) bar.style.width = pp + '%';
  if (pct) pct.textContent = pp + '%';
  if (prev) prev.style.display = idx === 0 ? 'none' : 'block';
  if (next) next.style.display = idx >= total - 1 ? 'none' : 'block';
  if (submit) submit.style.display = idx >= total - 1 ? 'inline-block' : 'none';
}

// ====== RECOVERY PROGRAMS ======
var RECOVERY_PROGRAMS = {
  '12step': {
    id: '12step', name: '12-Step Program', icon: '&#10022;', color: 'var(--primary)',
    minDaysPerStep: 2,
    steps: [
      'We admitted we were powerless over our addiction  that our lives had become unmanageable.',
      'Came to believe that a Power greater than ourselves could restore us to sanity.',
      'Made a decision to turn our will and our lives over to the care of God as we understood Him.',
      'Made a searching and fearless moral inventory of ourselves.',
      'Admitted to God, to ourselves, and to another human being the exact nature of our wrongs.',
      'Were entirely ready to have God remove all these defects of character.',
      'Humbly asked Him to remove our shortcomings.',
      'Made a list of all persons we had harmed, and became willing to make amends to them all.',
      'Made direct amends to such people wherever possible, except when to do so would injure them or others.',
      'Continued to take personal inventory and when we were wrong promptly admitted it.',
      'Sought through prayer and meditation to improve our conscious contact with God as we understood Him, praying only for knowledge of His will for us and the power to carry that out.',
      'Having had a spiritual awakening as the result of these steps, we tried to carry this message to others and to practice these principles in all our affairs.'
    ]
  },
  smart: {
    id: 'smart', name: 'SMART Recovery', icon: '&#9881;', color: 'var(--accent)',
    steps: [
      'Building and Maintaining Motivation  Find your reasons to change and stay committed.',
      'Coping with Urges  Recognize and manage cravings and urges without acting on them.',
      'Managing Thoughts, Feelings, and Behaviors  Identify and change unhealthy thinking patterns.',
      'Living a Balanced Life  Build sustainable habits and a fulfilling life beyond addiction.'
    ]
  },
  dharma: {
    id: 'dharma', name: 'Recovery Dharma', icon: '&#9783;', color: '#a78bfa',
    steps: [
      'Embracing the Present  Face this moment with kindness, curiosity, and compassion.',
      'Investigating Suffering  Look honestly at the causes of your suffering and addictive patterns.',
      'Letting Go  Practice release  of cravings, shame, and the stories that keep you stuck.',
      'Living in Harmony  Bring your practice into daily life and support others on the path.'
    ]
  },
  celebrate: {
    id: 'celebrate', name: 'Celebrate Recovery', icon: '&#10017;', color: '#f97316',
    steps: [
      'Admit I am powerless  I cannot control my addictive behavior; my life is unmanageable.',
      'Believe God exists  I matter to Him and He has the power to help me recover.',
      'Commit my life to Christ  Consciously choose to follow His care and control.',
      'Openly examine my life  Confess my faults to myself, God, and someone I trust.',
      'Submit to change  Voluntarily let God remove my character defects.',
      'Evaluate relationships  Offer forgiveness and make amends for harm I\'ve caused.',
      'Reserve daily time with God  Self-examination, prayer, and reading to know His will.',
      'Yield to serve  Share this Good News with others by example and by words.'
    ]
  },
  journey: {
    id: 'journey', name: "Re.Claim Journey", icon: '&#128154;', color: '#2d6a4f',
    minDaysPerStep: 1,
    steps: [
      'Week 1: Foundation — Journal for 5 minutes about why you started this journey. What matters most to you?',
      'Week 1: Foundation — Log your mood 3 times today. Notice how it shifts throughout the day.',
      'Week 1: Foundation — Practice the breathing exercise for 2 minutes. Just focus on the air moving in and out.',
      'Week 1: Foundation — Identify one trigger from your past. Write it down without judgment.',
      'Week 1: Foundation — Read your safety plan or create one if you haven\'t yet.',
      'Week 1: Foundation — Call or text someone who supports your recovery. Connection matters.',
      'Week 1: Foundation — Write down one thing you accomplished this week. Celebrate it.',
      'Week 2: Tools — Create a coping card for a situation that challenges you.',
      'Week 2: Tools — Practice urge surfing: notice a craving, describe it, watch it pass.',
      'Week 2: Tools — Use the SOS helplines page. Save a number to your phone.',
      'Week 2: Tools — Complete a daily check-in. What was your win today?',
      'Week 2: Tools — Write a commitment statement to yourself. Read it aloud.',
      'Week 2: Tools — Try the grounding exercise: name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
      'Week 2: Tools — Review your week. What coping tools worked best for you?',
      'Week 3: Connection — Reach out to your partner or accountability partner.',
      'Week 3: Connection — Read a recovery story from the Library. Let their journey inspire yours.',
      'Week 3: Connection — Write a journal entry as a letter to someone who helped you.',
      'Week 3: Connection — Explore the meetings page. Find a meeting you could attend.',
      'Week 3: Connection — Send an encouraging message to someone in recovery.',
      'Week 3: Connection — Review your relapse prevention plan. Update it if needed.',
      'Week 3: Connection — Reflect on how connection has helped your recovery this week.',
      'Week 4: Growth — Take the PHQ-9 or GAD-7 screening. Compare to your last result.',
      'Week 4: Growth — Write a letter to your future self. Arthur will deliver it as a time capsule.',
      'Week 4: Growth — Review your insights page. What patterns do you see?',
      'Week 4: Growth — Set one recovery goal for the next month. Make it specific.',
      'Week 4: Growth — Share your progress with someone you trust.',
      'Week 4: Growth — Plan a small reward for reaching a milestone. You deserve it.',
      'Week 4: Growth — Write a final journal entry reflecting on your 4-week journey.'
    ]
  }
};

var PROGRAMS_IDS = ['12step', 'smart', 'dharma', 'celebrate', 'journey'];


function programData(pid) {
  if (!D.recoveryPrograms) D.recoveryPrograms = { active: null, programs: {} };
  if (!D.recoveryPrograms.programs) D.recoveryPrograms.programs = {};
  if (!D.recoveryPrograms.programs[pid]) {
    var prog = RECOVERY_PROGRAMS[pid];
    D.recoveryPrograms.programs[pid] = { started: null, completed: null, steps: new Array(prog.steps.length).fill(false), notes: [], dates: [] };
  }
  return D.recoveryPrograms.programs[pid];
}

function programsHTML() {
  var h = '<h2 class="page-title">&#127891; '+t('Recovery Programs')+'</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Follow a structured program to guide your recovery journey step by step.</p>';
  if (!D.recoveryPrograms) { D.recoveryPrograms = { active: null, programs: {} }; localStorage.setItem(dataKey(), JSON.stringify(D)); try { syncToFirestore(); } catch(e){ console.warn('recoveryPrograms sync failed:', e); } }
  var active = D.recoveryPrograms.active;
  if (active && RECOVERY_PROGRAMS[active]) {
    h += programActiveHTML(active);
  } else {
    h += '<div class="sub-grid">';
    for (var pi=0;pi<PROGRAMS_IDS.length;pi++) {
      var pid = PROGRAMS_IDS[pi];
      var p = RECOVERY_PROGRAMS[pid];
      var data = programData(pid);
      var count = data.steps ? data.steps.filter(function(s){return s}).length : 0;
      h += '<div class="card" style="border-left:3px solid '+p.color+';cursor:pointer;text-align:center" onclick="programStart(\''+pid+'\')">';
      h += '<div style="font-size:28px;margin-bottom:4px">'+p.icon+'</div>';
      h += '<div style="font-weight:700;font-size:14px">'+p.name+'</div>';
      h += '<div style="font-size:12px;color:var(--muted)">'+p.steps.length+' steps</div>';
      if (count > 0) {
        h += '<div class="progress-bar" style="margin:6px auto;max-width:120px"><div class="fill" style="width:'+Math.round(count/p.steps.length*100)+'%"></div></div>';
        h += '<div style="font-size:11px;color:var(--muted)">'+count+'/'+p.steps.length+' completed</div>';
      }
      h += '</div>';
    }
    h += '</div>';
  }
  return h;
}

function programStart(pid) {
  D.recoveryPrograms.active = pid;
  saveData();
  render();
}

function programReset(pid) {
  if (!confirm('Reset all progress for '+RECOVERY_PROGRAMS[pid].name+'?')) return;
  delete D.recoveryPrograms.programs[pid];
  D.recoveryPrograms.active = null;
  saveData();
  render();
}

function programActiveHTML(pid) {
  var p = RECOVERY_PROGRAMS[pid];
  var data = programData(pid);
  var completed = data.steps ? data.steps.filter(function(s){return s}).length : 0;
  var total = p.steps.length;
  var pct = Math.round(completed/total*100);
  var done = completed === total;
  var h = '<div style="display:flex;align-items:center;gap:8px;margin:8px 0">';
  h += '<button class="btn btn-sm btn-outline" onclick="programClearActive()">&#8592; All Programs</button>';
  h += '</div>';
  h += '<div class="card" style="border-left:3px solid '+p.color+'">';
  h += '<div style="display:flex;align-items:center;gap:10px"><span style="font-size:28px">'+p.icon+'</span><div><div style="font-weight:700;font-size:16px">'+p.name+'</div>';
  if (data.started) h += '<div style="font-size:11px;color:var(--muted)">Started '+new Date(data.started).toLocaleDateString()+'</div>';
  h += '</div></div>';
  h += '<div class="progress-bar" style="margin:10px 0"><div class="fill" style="width:'+pct+'%"></div></div>';
  h += '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>'+completed+'/'+total+' steps</span><span>'+pct+'%</span></div>';
  if (done) {
    h += '<div style="text-align:center;padding:14px;background:var(--primary-light);border-radius:10px;margin-top:8px">';
    h += '<span style="font-size:32px">&#x265B;</span>';
    h += '<div style="font-weight:700;font-size:15px;color:var(--primary);margin:4px 0">Program Completed!</div>';
    h += '<div style="font-size:11px;color:var(--muted)">You worked through all '+total+' steps with reflection and intention.</div>';
    h += '<div style="font-size:11px;color:var(--muted)">Finished '+new Date(data.completed).toLocaleDateString()+'</div>';
    h += '<div style="font-size:11px;color:var(--muted);margin-top:4px;font-style:italic">Recovery is not a destination  it\'s a daily practice. Keep showing up.</div>';
    h += '</div>';
  }
  h += '</div>';
  for (var si=0;si<total;si++) {
    var stepDone = data.steps[si];
    h += '<div class="card" style="border-left:3px solid '+(stepDone ? 'var(--primary)' : 'var(--border)')+';padding:14px">';
    h += '<div style="display:flex;align-items:flex-start;gap:10px">';
    h += '<div style="flex-shrink:0;width:28px;height:28px;border-radius:14px;border:2px solid '+(stepDone ? 'var(--primary)' : 'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:'+(stepDone ? 'var(--primary)' : 'var(--muted)')+';background:'+(stepDone ? 'var(--primary-light)' : 'transparent')+';cursor:pointer" onclick="programToggleStep(\''+pid+'\','+si+')">'+(stepDone ? '&#10003;' : (si+1))+'</div>';
    h += '<div style="flex:1">';
    h += '<div style="font-weight:600;font-size:13px;margin-bottom:4px">Step '+(si+1)+'</div>';
    h += '<div style="font-size:12px;color:var(--text)">'+p.steps[si]+'</div>';
    if (data.notes && data.notes[si]) {
      h += '<div style="font-size:11px;color:var(--muted);font-style:italic;margin-top:4px;padding:8px;background:var(--primary-light);border-radius:6px;line-height:1.4">&#128221; "'+data.notes[si]+'"</div>';
    }
    if (!stepDone) {
      var canComplete = true;
      var prevIdx = si - 1;
      if (prevIdx >= 0 && data.steps[prevIdx] && data.dates && data.dates[prevIdx]) {
        var daysSince = Math.round((Date.now() - data.dates[prevIdx]) / 86400000);
        var minDays = p.minDaysPerStep || 1;
        if (daysSince < minDays) {
          canComplete = false;
          h += '<div style="font-size:11px;color:var(--accent);margin-top:4px">&#128337; Available in '+ (minDays - daysSince) +' day' + ((minDays - daysSince) > 1 ? 's' : '') +' (reflect on Step '+ (prevIdx+1) +' in the meantime)</div>';
        }
      }
      if (canComplete) {
        h += '<button class="btn btn-sm btn-primary" onclick="programToggleStep(\''+pid+'\','+si+')" style="margin-top:6px;font-size:11px">&#10003; Mark Complete</button>';
      } else {
        h += '<button class="btn btn-sm btn-outline" disabled style="margin-top:6px;font-size:11px;opacity:0.5">&#128337; Locked</button>';
      }
    } else {
      h += '<div style="display:flex;align-items:center;gap:6px;margin-top:6px;flex-wrap:wrap">';
      h += '<span style="font-size:11px;color:var(--primary);font-weight:600">&#10003; Completed '+new Date(data.dates[si]).toLocaleDateString()+'</span>';
      h += '<button class="btn btn-sm btn-outline" onclick="programToggleStep(\''+pid+'\','+si+')" style="font-size:11px">Undo</button>';
      h += '</div>';
    }
    h += '</div></div></div>';
  }
  h += '<button class="btn btn-outline btn-sm" onclick="programReset(\''+pid+'\')" style="margin-top:8px;width:100%;color:var(--danger)">Reset Program</button>';
  return h;
}

function programClearActive() {
  D.recoveryPrograms.active = null;
  saveData();
  render();
}

function programToggleStep(pid, idx) {
  var data = programData(pid);
  var p = RECOVERY_PROGRAMS[pid];

  // If marking complete, require reflection and check time buffer
  if (!data.steps[idx]) {
    // Check minimum days since last step
    var prevIdx = idx - 1;
    if (prevIdx >= 0 && data.steps[prevIdx] && data.dates && data.dates[prevIdx]) {
      var daysSince = Math.round((Date.now() - data.dates[prevIdx]) / 86400000);
      var minDays = p.minDaysPerStep || 1;
      if (daysSince < minDays) {
        alert('\u23F1\uFE0F Take your time with Step ' + (prevIdx + 1) + '. Wait at least ' + minDays + ' day' + (minDays > 1 ? 's' : '') + ' before moving to Step ' + (idx + 1) + '. Recovery is not a race \u2014 reflect deeply on each step.\n\nYou can reflect on Step ' + (idx + 1) + ' in your journal in the meantime.');
        return;
      }
    }

    // Require a written reflection
    var reflection = prompt('\u270D\uFE0F Step ' + (idx + 1) + ': What did you do to work on this step? How does it apply to your recovery?');
    if (reflection === null || reflection.trim() === '') {
      alert('Writing a brief reflection helps solidify what you\u2019ve learned. Try just one or two sentences.');
      return;
    }
    reflection = reflection.trim();

    data.steps[idx] = true;
    if (!data.notes) data.notes = [];
    if (!data.dates) data.dates = [];
    data.notes[idx] = reflection;
    data.dates[idx] = Date.now();
    if (!data.started) data.started = Date.now();
  } else {
    // Unmarking  only allow if no time buffer concern
    data.steps[idx] = false;
    if (data.dates) data.dates[idx] = null;
    if (data.notes) data.notes[idx] = '';
  }
  var allDone = data.steps.every(function(s){return s});
  if (allDone && !data.completed) data.completed = Date.now();
  else if (!allDone) data.completed = null;
  saveData();
  render();
}

function programAddNote(pid, idx) {
  var data = programData(pid);
  var current = (data.notes && data.notes[idx]) || '';
  var note = prompt('Reflection on Step '+(idx+1)+':', current);
  if (note === null) return;
  if (!data.notes) data.notes = [];
  data.notes[idx] = note;
  saveData();
  render();
}

// ====== HABITS ======
function habitHTML() {
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;gap:8px">';
  h += '<h2 class="page-title" style="margin:0;flex:1;border:none;background:none;text-align:left;font-size:18px;padding:8px 0">'+t('Habits')+'</h2>';
h += '<button class="btn btn-sm btn-primary" onclick="addHabit()">+ '+t('New')+'</button></div>';
  var today = new Date().toDateString();
  if (!D.habits.length) {
    h += '<div class="card"><div class="empty-state">No habits yet. Create one to start tracking!</div></div>';
  } else {
    for (var i=0;i<D.habits.length;i++) {
      var done = D.habits[i].logs && D.habits[i].logs.indexOf(today) !== -1;
      var streak = calcHabitStreak(D.habits[i]);
      h += '<div class="card" style="padding:12px">';
      h += '<div class="habit-item"><div class="check'+(done?' done':'')+'" onclick="toggleHabit('+i+')">'+(done?'?':'')+'</div>';
      h += '<div class="info"><div class="name">'+safe(D.habits[i].name)+'</div><div class="streak">'+streak+' day streak</div></div>';
      h += '<button class="btn btn-sm btn-outline" onclick="deleteHabit('+i+')" style="padding:4px 8px;width:auto;font-size:11px">Delete</button></div></div>';
    }
  }
  return h;
}

function calcHabitStreak(habit) {
  if (!habit.logs || !habit.logs.length) return 0;
  var s = 0;
  var d = new Date();
  for (var i=0;i<365;i++) {
    var ds = d.toDateString();
    if (habit.logs.indexOf(ds) !== -1) s++;
    else if (i>0) break;
    d.setDate(d.getDate()-1);
  }
  return s;
}

function toggleHabit(idx) {
  var today = new Date().toDateString();
  if (!D.habits[idx].logs) D.habits[idx].logs = [];
  var pos = D.habits[idx].logs.indexOf(today);
  if (pos === -1) D.habits[idx].logs.push(today);
  else D.habits[idx].logs.splice(pos,1);
  saveData();
}

function addHabit() {
  var name = prompt(t('What habit do you want to track?'));
  if (!name || !name.trim()) return;
  D.habits.push({ id: Date.now(), name: name.trim(), logs: [] });
  saveData();
}

function deleteHabit(idx) {
  if (!confirm(t('Delete "')+D.habits[idx].name+t('"?'))) return;
  D.habits.splice(idx,1);
  saveData();
}

// ====== MOOD ======
var MOODS = [
  {val:1, emoji:'😞', label:'Terrible'},
  {val:2, emoji:'😕', label:'Bad'},
  {val:3, emoji:'😐', label:'Okay'},
  {val:4, emoji:'🙂', label:'Good'},
  {val:5, emoji:'😄', label:'Great'}
];

// ====== RECOVERY TIMELINE ======
function timelineHTML() {
  var events = [];
  // Sobriety start
  if (D.sobriety.startDate) {
    events.push({date: new Date(D.sobriety.startDate), type:'start', label:'Sobriety journey began', detail:D.sobriety.addictionType || ''});
  }
  // Relapses
  if (D.sobriety.relapseDates) {
    for (var ri=0;ri<D.sobriety.relapseDates.length;ri++) {
      events.push({date: new Date(D.sobriety.relapseDates[ri]), type:'relapse', label:'Relapse recorded', detail:'Recovery is not linear'});
    }
  }
  // Journal entries
  for (var ji=0;ji<D.journal.length;ji++) {
    var jd = new Date(D.journal[ji].date);
    if (!isNaN(jd.getTime())) {
      var jt = getEntryText(D.journal[ji]); events.push({date: jd, type:'journal', label:'Journal entry', detail: (jt||'').substring(0,60) + ((jt||'').length>60?'...':'')});
    }
  }
  // Mood logs (one per day)
  var seenDates = {};
  for (var mi=0;mi<D.moods.length;mi++) {
    var md = new Date(D.moods[mi].date);
    if (!isNaN(md.getTime()) && !seenDates[D.moods[mi].date]) {
      seenDates[D.moods[mi].date] = true;
      events.push({date: md, type:'mood', label:'Mood: ' + MOODS[D.moods[mi].val-1].label, detail:D.moods[mi].date});
    }
  }
  // Check-ins
  for (var ci=0;ci<D.checkins.length;ci++) {
    var cd = new Date(D.checkins[ci].date);
    if (!isNaN(cd.getTime())) {
      events.push({date: cd, type:'checkin', label:'Daily check-in', detail:''});
    }
  }
  // Buddy check-ins
  for (var bci=0;bci<D.buddyCheckins.length;bci++) {
    var bd = new Date(D.buddyCheckins[bci].date);
    if (!isNaN(bd.getTime())) {
      events.push({date: bd, type:'buddy', label:'Partner check-in', detail:D.buddyCheckins[bci].note || ''});
    }
  }
  // Sort by date (oldest first)
  events.sort(function(a,b){return a.date - b.date});
  if (!events.length) return '<div class="card"><div class="empty-state">No events yet. Start tracking to see your timeline.</div></div>';
  var colors = {start:'var(--primary)', relapse:'var(--danger)', journal:'var(--blue)', mood:'var(--accent)', checkin:'#22c55e', buddy:'var(--rose)'};
  var icons = {start:'&#x2726;', relapse:'&#x2628;', journal:'&#x2712;', mood:'&#x2766;', checkin:'&#x2713;', buddy:'&#x2618;'};
  var h = '<div class="card"><div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer" onclick="var el=document.getElementById(\'timeline-body\');var btn=document.getElementById(\'timeline-toggle\');if(el.style.display===\'none\'){el.style.display=\'block\';btn.textContent=\'&#9650; '+t('Hide Timeline')+'\'}else{el.style.display=\'none\';btn.textContent=\'&#9660; '+t('Show Timeline')+'\'}">';
  h += '<div style="display:flex;align-items:center;gap:8px"><div style="font-size:20px">&#x2726;</div><div><h3 style="margin:0;font-size:14px">'+t('Recovery Timeline')+'</h3></div></div>';
  h += '<span id="timeline-toggle" style="font-size:13px;color:var(--primary);font-weight:600">&#9660; '+t('Show Timeline')+'</span>';
  h += '</div>';
  // Collapsible body
  h += '<div id="timeline-body" style="display:none;padding-top:8px"><div style="position:relative;padding-left:24px">';
  h += '<div style="position:absolute;left:10px;top:0;bottom:0;width:2px;background:var(--border)"></div>';
  var shown = 0;
  var maxShow = 50;
  for (var ei2=events.length-1;ei2>=0 && shown<maxShow;ei2--) {
    var e = events[ei2];
    var icon = icons[e.type] || '&#8226;';
    var color = colors[e.type] || 'var(--muted)';
    h += '<div style="position:relative;padding:6px 0 6px 16px;border-left:2px solid ' + color + ';margin-left:-12px;padding-left:16px"><div style="position:absolute;left:-13px;top:8px;width:24px;height:24px;border-radius:12px;background:' + color + ';display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1">' + icon + '</div><div style="font-size:11px;color:var(--muted)">' + e.date.toLocaleDateString() + '</div><div style="font-weight:600;font-size:13px">' + e.label + '</div>' + (e.detail ? '<div style="font-size:11px;color:var(--muted);line-height:1.3">' + e.detail + '</div>' : '') + '</div>';
    shown++;
  }
  if (events.length > maxShow) h += '<div style="text-align:center;font-size:11px;color:var(--muted);padding:8px 0">+' + (events.length - maxShow) + ' more events</div>';
  h += '</div></div></div>';
  return h;
}

// ====== STREAKS VIEWER ======
function calcAllStreaks() {
  var dates = [];
  for (var ci=0;ci<D.checkins.length;ci++) { dates.push(D.checkins[ci].date); }
  for (var mi=0;mi<D.moods.length;mi++) { dates.push(D.moods[mi].date); }
  dates.sort();
  var unique = [], seen = {};
  for (var di=0;di<dates.length;di++) { if (!seen[dates[di]]) { seen[dates[di]]=true; unique.push(dates[di]); } }
  var streaks = [], cur = [];
  for (var ui=0;ui<unique.length;ui++) {
    if (ui===0) { cur.push(unique[ui]); continue; }
    var prevDate = new Date(unique[ui-1]), thisDate = new Date(unique[ui]);
    var diff = Math.round((thisDate - prevDate) / 86400000);
    if (diff===1) { cur.push(unique[ui]); }
    else { if (cur.length) streaks.push(cur.slice()); cur = [unique[ui]]; }
  }
  if (cur.length) streaks.push(cur);
  return streaks;
}

function streaksHTML() {
  var streaks = calcAllStreaks();
  var current = streaks.length ? streaks[streaks.length-1] : [];
  var longest = current;
  for (var si=0;si<streaks.length;si++) { if (streaks[si].length > longest.length) longest = streaks[si]; }
  var totalActiveDays = 0;
  for (var si2=0;si2<streaks.length;si2++) totalActiveDays += streaks[si2].length;
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:20px">&#128293;</div><h3 style="margin:0">'+t('Your Streaks')+'</h3></div><div class="stat-grid" style="margin-bottom:8px"><div class="stat-card"><div class="num">' + current.length + '</div><div class="label">'+t('Current')+'</div></div><div class="stat-card"><div class="num">' + longest.length + '</div><div class="label">'+t('Best Ever')+'</div></div><div class="stat-card"><div class="num">' + totalActiveDays + '</div><div class="label">'+t('Active Days')+'</div></div></div><div id="streaks-list">';
  if (!streaks.length) {
    h += '<div class="empty-state">'+t('No streaks yet. Log moods or check in daily to build your streak!')+'</div>';
  } else {
    for (var si3=streaks.length-1; si3>=0; si3--) {
      var s = streaks[si3], isCur = si3 === streaks.length-1;
      h += '<div class="goal-item" onclick="viewStreakDetails(' + si3 + ')" style="cursor:pointer;padding:8px 6px;border-bottom:1px solid var(--border)"><span style="font-size:14px;margin-right:6px">' + (isCur ? '&#128293;' : '&#10004;&#65039;') + '</span><span style="flex:1;font-size:12px">' + (isCur ? 'Current streak' : s[0] + ' &mdash; ' + s[s.length-1]) + '</span><span style="font-size:13px;font-weight:700;color:var(--primary)">' + s.length + ' day' + (s.length!==1?'s':'') + '</span></div>';
    }
  }
  h += '</div></div>';
  return h;
}

function viewStreakDetails(idx) {
  var streaks = calcAllStreaks();
  if (idx<0||idx>=streaks.length) return;
  var s = streaks[idx], isCur = idx === streaks.length-1;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:24px">' + (isCur ? '&#128293;' : '&#10004;&#65039;') + '</div><div><h3 style="margin:0;font-size:18px">' + (isCur ? t('Current streak') : t('Past Streak')) + '</h3><p style="margin:2px 0 0;font-size:12px;color:var(--muted)">' + s.length + ' day' + (s.length!==1?'s':'') + '</p></div></div><div style="font-size:13px;color:var(--text);line-height:1.8;margin-bottom:8px"><strong>'+t('From:')+'</strong> ' + s[0] + '<br><strong>'+t('To:')+'</strong> ' + s[s.length-1] + '<br><strong>'+t('Duration:')+'</strong> ' + s.length + ' day' + (s.length!==1?'s':'') + '</div><div style="display:flex;flex-wrap:wrap;gap:3px">';
  for (var di=0;di<s.length;di++) {
    var dayDate = new Date(s[di]);
    var dayMood = D.moods.filter(function(m){return m.date===s[di]});
    var moodColor = dayMood.length ? (['#ef4444','#f97316','#eab308','#22c55e','#059669'][dayMood[dayMood.length-1].val-1]) : 'var(--border)';
    h += '<div style="width:32px;height:32px;border-radius:6px;background:' + moodColor + ';display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;font-weight:600" title="' + s[di] + (dayMood.length ? ' - ' + MOODS[dayMood[dayMood.length-1].val-1].label : '') + '">' + dayDate.getDate() + '</div>';
  }
  h += '</div><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:12px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function trackHTML() {
  var h = '<h2 class="page-title">'+t('History')+'</h2>';
  // Streaks viewer
  h += streaksHTML();

  // Mood history
  h += '<div class="card"><h3>'+t('Mood History')+'</h3>';
  h += '<input type="text" id="ms" placeholder="'+t('Search moods...')+'" oninput="filterMoods(this.value)" style="margin-bottom:8px;width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box">';
  var allMoods = D.moods.slice().reverse().slice(0,15);
  if (!allMoods.length) h += '<div class="empty-state">'+t('No moods logged yet.')+'</div>';
  for (var i=0;i<allMoods.length;i++) {
    h += '<div class="mood-item"><span style="font-size:13px;font-weight:600;color:var(--primary)">' + MOODS[allMoods[i].val-1].label + '</span> <span style="font-size:13px;color:var(--muted)">' + allMoods[i].date + ' at ' + allMoods[i].time + '</span></div>';
  }
  h += '</div>';

  // Habits
  h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>'+t("Today's Habits")+'</h3><button class="btn btn-sm btn-outline" onclick="addHabit()">+ '+t('Add')+'</button></div>';
  var todaysHabits = D.habits.filter(function(h){return h.logs && h.logs.indexOf(new Date().toDateString()) !== -1}).length;
  h += '<p style="font-size:13px;color:var(--muted)">' + todaysHabits + '/' + D.habits.length + ' '+t('habits done today')+'</p>';
  if (D.habits.length) {
    for (var i=0;i<D.habits.length;i++) {
      var done = D.habits[i].logs && D.habits[i].logs.indexOf(new Date().toDateString()) !== -1;
      h += '<div class="habit-item" style="padding:6px 0"><div class="check'+(done?' done':'')+'" onclick="toggleHabit('+i+')" style="width:20px;height:20px;font-size:11px">'+(done?'?':'')+'</div><span style="font-size:13px;flex:1">'+safe(D.habits[i].name)+'</span></div>';
    }
  } else {
    h += '<div class="empty-state">'+t('No habits yet.')+'</div>';
  }
  h += '</div>';

  // Progress Charts
  h += '<button class="btn btn-outline btn-sm" onclick="goTo(\'calendar\')" style="margin-bottom:8px">'+t('View Streak Calendar')+'</button>';
  h += moodTrendHTML();
  h += sobrietyGridHTML();
  h += habitBarsHTML();

  // Recovery Timeline
  h += timelineHTML();

  return h;
}

function logMood(val) {
  var today = new Date().toDateString();
  var now = new Date();
  var time = String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  D.moods = D.moods.filter(function(m){return m.date!==today});
  D.moods.push({val:val,date:today,time:time});
  if (!D.streak) D.streak = 1;
  saveData();
}

function filterMoods(val) {
  var q = val.toLowerCase();
  var items = document.querySelectorAll('.mood-item');
  for (var i=0;i<items.length;i++) {
    items[i].style.display = !q || items[i].textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
  }
}

// ====== JOURNAL ======
function journalHTML() {
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;gap:8px">';
  h += '<h2 class="page-title" style="margin:0;flex:1;border:none;background:none;text-align:left;font-size:18px;padding:8px 0">'+t('Journal')+'</h2>';
  h += '<div style="display:flex;gap:4px">';
  if (D.journal.length) h += '<button class="btn btn-sm btn-danger" onclick="deleteAllJournalEntries()" style="padding:4px 8px;font-size:10px;width:auto">'+t('Delete All')+'</button>';
  h += '<button class="btn btn-sm btn-primary" onclick="showNewJournal()">+ '+t('New')+'</button></div></div>';
  // Insights summary
  if (D.journal.length || D.moods.length) {
    h += '<div class="card" style="padding:10px 12px">';
    h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;cursor:pointer" onclick="var e=document.getElementById(\'journal-insights-body\');e.style.display=e.style.display===\'none\'?\'block\':\'none\'">';
    h += '<span style="font-size:16px">&#128302;</span><span style="font-size:12px;font-weight:600;color:var(--primary)">Journal Insights</span><span style="font-size:10px;color:var(--muted)">(click to toggle)</span></div>';
    h += '<div id="journal-insights-body" style="display:none">' + insightsHTML() + '</div></div>';
  }
  h += '<input type="text" id="js" placeholder="'+t('Search entries...')+'" oninput="filterJournal(this.value)" style="margin-bottom:8px;width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box">';
  if (!D.journal.length) {
    h += '<div class="card"><div class="empty-state">'+t('No journal entries yet. Start writing!')+'</div></div>';
  } else {
    var entries = D.journal.slice().reverse();
    for (var i=0;i<entries.length && i<50;i++) {
      var idx = D.journal.length - 1 - i;
      var entryText = getEntryText(entries[i]);
      var searchData = (entryText + ' ' + regnalDate(entries[i].date) + ' ' + (entries[i].mood ? MOODS[entries[i].mood-1].label : '')).toLowerCase().replace(/"/g,'&quot;');
      h += '<div class="journal-entry card" data-search="' + searchData + '"><div class="entry-item"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="date">' + regnalDate(entries[i].date) + (entries[i].mood ? ' &middot; ' + MOODS[entries[i].mood-1].label : '') + (entries[i].type ? ' <span class="badge badge-green" style="font-size:9px">' + entries[i].type + '</span>' : '') + '</div></div><button class="btn btn-sm btn-danger" onclick="deleteJournalEntry(' + idx + ')" style="padding:4px 8px;width:auto;font-size:11px;margin:0" title="Delete entry">&#10005;</button></div><div style="margin-top:6px;font-size:14px;line-height:1.5">' + entryText.replace(/\n/g,'<br>') + '</div></div></div>';
    }
  }
  return h;
}

function filterJournal(val) {
  var q = val.toLowerCase();
  var entries = document.querySelectorAll('.journal-entry');
  for (var i=0;i<entries.length;i++) {
    var searchData = entries[i].getAttribute('data-search');
    entries[i].style.display = !q || (searchData && searchData.indexOf(q) !== -1) ? '' : 'none';
  }
}

function showNewJournal() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+t('New Journal Entry')+'</h3>';
  h += '<div style="background:var(--primary-light);padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:13px;line-height:1.5;border-left:3px solid var(--primary)"><strong>'+t('Prompt:')+'</strong> ' + todayPrompt() + '</div>';
  h += '<div class="mood-row" style="justify-content:center;gap:8px">';
  for (var i=0;i<MOODS.length;i++) h += '<button class="mood-btn" onclick="this.classList.toggle(\'active\');this._val='+MOODS[i].val+'"><span style="font-size:18px;display:block">'+MOODS[i].emoji+'</span>'+MOODS[i].label+'</button>';
  h += '</div>';
  h += '<textarea id="journal-text" placeholder="'+t('How are you feeling today?')+'" style="min-height:120px"></textarea>';
  h += '<button class="btn btn-primary" onclick="saveJournal(this)">'+t('Save Entry')+'</button>';
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function saveJournal(btn) {
  var text = document.getElementById('journal-text');
  if (!text || !text.value.trim()) { alert(t('Write something first.')); return; }
  var overlay = btn.closest('.overlay');
  var moodBtns = overlay.querySelectorAll('.mood-btn.active');
  var mood = moodBtns.length ? parseInt(moodBtns[0].getAttribute('onclick').match(/\d+/)[0]) : 0;
  var now = new Date();
  var txt = text.value.trim();
  var entry = {
    text: txt,
    date: now.toDateString(),
    time: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),
    mood: mood
  };
  var saveIt = function() {
    D.journal.push(entry);
    earnSchillings(5, 'Journal entry');
    saveData();
    overlay.remove();
    setTimeout(showSchillingNotification, 800);
    if (checkCrisis(txt)) { showCrisisAlert(txt); }
  };
  if (isEncryptionEnabled() && ENC_KEY) {
    encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
  } else if (isEncryptionEnabled() && !ENC_KEY) {
    promptEncryptionPassphrase(function() {
      encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
    });
  } else {
    saveIt();
  }
}

var CRISIS_PATTERNS = [
  /\b(kill myself|killing myself|kill themselves|killing themselves|kill people|killing people|kill someone|killing someone|end my life|want to die|better off dead|end it all|take my own)\b/i,
  /\b(self[- ]?harm|selfharm|cut myself|hurt myself|harm myself)\b/i,
  /\b(can\'?t go on|no reason to live|don\'?t want to live|ready to die)\b/i,
  /\b(suicid(al|e)?|ending it|want out of this)\b/i,
  /\b(no one would notice|no one cares|world without me|disappear forever)\b/i,
  /\b(gonna kill|going to kill|going to hurt|wanna hurt|want to hurt|gonna hurt)\b/i,
  /\b(going to end it|gonna end it|about to end)\b/i,
  /\b(relaps(e|ing)|about to relapse|going to relapse|gonna relapse|about to use|about to drink|gonna use|gonna drink|can\'?t stop myself|about to cave|about to break|i\'?m about to break)\b/i,
  /\b(I give up|I\'?m giving up|fuck it all|screw it all|what\'?s the point|nothing matters anymore|done with everything)\b/i,
  /\b(kill you|going to kill you|gonna kill you|hurt you|going to hurt you)\b/i
];

function checkCrisis(text) {
  for (var i=0;i<CRISIS_PATTERNS.length;i++) {
    if (CRISIS_PATTERNS[i].test(text)) {
      return true;
    }
  }
  return false;
}

function showCrisisAlert(text) {
  D._postCrisisPending = true;
  var steps = ['sos', 'breathe', 'contacts', 'plan'];
  var stepIdx = 0;
  function renderCrisisStep() {
    var overlay = document.querySelector('#crisis-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.id = 'crisis-overlay';
      document.body.appendChild(overlay);
    }
    var h = '<div class="overlay-content" style="max-width:440px">';
    if (steps[stepIdx] === 'sos') {
      h += '<div style="text-align:center"><div style="font-size:48px;font-weight:900;color:var(--danger);margin-bottom:2px;letter-spacing:6px">SOS</div><h3 style="color:var(--danger);font-size:17px">'+t('I hear you. You are not alone.')+'</h3><p style="font-size:13px;color:var(--muted);margin:6px 0;line-height:1.4">'+t('These feelings are real. Help is available right now.')+'</p></div><div style="margin:10px 0"><div style="background:var(--danger-bg);padding:10px;border-radius:10px;margin-bottom:6px"><div style="font-weight:600;font-size:13px">988 Suicide & Crisis Lifeline</div><a href="tel:988" style="font-size:18px;font-weight:700;color:var(--primary);text-decoration:none">988</a></div><div style="background:var(--danger-bg);padding:10px;border-radius:10px;margin-bottom:6px"><div style="font-weight:600;font-size:13px">Crisis Text Line</div><div style="font-size:11px;color:var(--muted)">'+t('Text HOME to')+'</div><a href="tel:741741" style="font-size:18px;font-weight:700;color:var(--primary);text-decoration:none">741741</a></div></div>';
      if (D.emergencyContacts && D.emergencyContacts.length) {
        h += '<div style="margin:6px 0"><div style="font-weight:600;font-size:12px;color:var(--muted);margin-bottom:4px">'+t('Your emergency contacts')+'</div>';
        for (var ei=0;ei<D.emergencyContacts.length;ei++) {
          var ec = D.emergencyContacts[ei];
          h += '<div style="display:flex;align-items:center;gap:6px;padding:6px;border-bottom:1px solid var(--border);font-size:13px"><span>'+safe(ec.name)+'</span><a href="tel:'+ec.num+'" style="font-size:16px;font-weight:600;color:var(--primary);text-decoration:none;margin-left:auto">'+ec.num+'</a></div>';
        }
        h += '</div>';
      }
      h += '<div style="display:flex;gap:6px;margin:8px 0">';
      h += '<button class="btn btn-primary btn-sm" onclick="startBreathe();document.getElementById(\'crisis-overlay\').remove();D._postCrisisPending=false;saveData()" style="flex:1">'+t('Breathe')+'</button>';
      if (AUTH_EMAIL && D.buddy) {
        h += '<button class="btn btn-outline btn-sm" onclick="crisisNotifyBuddy()" style="flex:1">'+t('Call Partner')+'</button>';
      }
      h += '</div>';
      h += '<div style="display:flex;gap:6px;margin-top:4px">';
      h += '<button class="btn btn-outline btn-sm" onclick="stepIdx=2;renderCrisisStep()" style="flex:1">'+t('My Contacts')+'</button>';
      h += '<button class="btn btn-outline btn-sm" onclick="stepIdx=3;renderCrisisStep()" style="flex:1">'+t('Safety Plan')+'</button>';
      h += '</div>';
    } else if (steps[stepIdx] === 'breathe') {
      h += '<div style="text-align:center"><div style="font-size:40px;margin-bottom:6px">&#128166;</div><h3 style="font-size:18px;font-weight:700">'+t('Breathe with me')+'</h3><p style="font-size:13px;color:var(--muted);margin:4px 0 12px">'+t('A guided breathing exercise to calm your nervous system.')+'</p><button class="btn btn-primary btn-sm" onclick="startBreathe();document.getElementById(\'crisis-overlay\').remove();D._postCrisisPending=false;saveData()" style="width:100%;margin-bottom:4px">'+t('Start Breathing')+'</button></div>';
    } else if (steps[stepIdx] === 'contacts') {
      h += '<div style="text-align:center"><div style="font-size:40px;margin-bottom:6px">&#128222;</div><h3 style="font-size:18px;font-weight:700">'+t('Your Emergency Contacts')+'</h3><p style="font-size:13px;color:var(--muted);margin:4px 0 10px">'+t('People you trust who can support you right now.')+'</p>';
      if (D.emergencyContacts && D.emergencyContacts.length) {
        for (var ei2=0;ei2<D.emergencyContacts.length;ei2++) {
          var ec2 = D.emergencyContacts[ei2];
          h += '<div style="display:flex;align-items:center;gap:8px;padding:10px;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:14px">'+safe(ec2.name)+'</div></div><a href="tel:'+ec2.num+'" style="font-size:18px;font-weight:700;color:var(--primary);text-decoration:none">'+ec2.num+'</a></div>';
        }
      } else {
        h += '<p style="font-size:13px;color:var(--muted)">'+t('No emergency contacts set. Add them in Settings.')+'</p>';
      }
    } else if (steps[stepIdx] === 'plan') {
      var sp = D.relapsePlan;
      h += '<div style="text-align:center"><div style="font-size:40px;margin-bottom:6px">&#128737;</div><h3 style="font-size:18px;font-weight:700">'+t('Your Safety Plan')+'</h3></div>';
      if (sp && sp.statement) {
        h += '<div class="card" style="background:var(--primary-light);padding:10px;font-size:13px;font-style:italic;line-height:1.5">"'+safe(sp.statement)+'"</div>';
        if (sp.coping && sp.coping.length) h += '<div style="margin-top:8px"><div style="font-weight:600;font-size:12px;color:var(--muted);margin-bottom:4px">'+t('What helps:')+'</div>'+sp.coping.map(function(c){return '<div style="font-size:13px;padding:4px 0">&bull; '+safe(c)+'</div>'}).join('')+'</div>';
      } else {
        h += '<p style="font-size:13px;color:var(--muted)">'+t('Build a safety plan in the Care section when you\'re ready.')+'</p>';
      }
    }
    h += '<div style="display:flex;gap:6px;margin-top:12px">';
    if (stepIdx > 0) h += '<button class="btn btn-outline btn-sm" onclick="stepIdx--;renderCrisisStep()" style="flex:1">'+t('Back')+'</button>';
    if (stepIdx < steps.length-1) h += '<button class="btn btn-primary btn-sm" onclick="stepIdx++;renderCrisisStep()" style="flex:1">'+t('Next')+'</button>';
    h += '<button class="btn btn-outline btn-sm" onclick="document.getElementById(\'crisis-overlay\').remove();D._postCrisisPending=false;saveData()" style="flex:1">'+t("I'm okay")+'</button>';
    h += '</div></div>';
    overlay.innerHTML = h;
  }
  renderCrisisStep();
  D.sosUsed = true; saveData();
}

function crisisNotifyBuddy() {
  if (!AUTH_EMAIL || !D.buddy) return;
  var msg = t('I need support right now. Your partner may be in distress. Please reach out.');
  if (DB) DB.collection('messages').add({from:AUTH_EMAIL,to:D.buddy,text:msg,timestamp:firebase.firestore.FieldValue.serverTimestamp()}).then(function(){alert(t('your partner has been notified.'));}).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}

function deleteJournalEntry(idx) {
  if (!confirm(t('Delete this journal entry?'))) return;
  D.journal.splice(idx, 1);
  saveData();
}
function deleteAllJournalEntries() {
  if (!D.journal.length) return;
  if (!confirm(t('Delete ALL journal entries? This cannot be undone.'))) return;
  if (!confirm(t('Are you sure? All ' + D.journal.length + ' entries will be permanently removed.'))) return;
  D.journal = [];
  saveData();
}

// ====== ART'S DAILY ROUTINE ======
var ROUTINE_POOLS = {
  morning: [
    'Start with 5 minutes of sunlight or stretching to wake up your body.',
    'Drink a full glass of water before anything else. Hydration fuels clarity.',
    'Write down one thing you are looking forward to today. Keep it small.',
    'Take 3 deep breaths and set one intention for the day ahead.',
    'Stretch your neck, shoulders, and back for 2 minutes. Your body holds tension.',
    'Name one person you care about and send them a good thought.',
    'Read yesterday\'s journal entry to see how far you\'ve come in 24 hours.',
    'Make your bed  one small win before the day begins.',
    'Step outside for 60 seconds. Feel the air and listen to the sounds around you.',
    'Say one affirmation out loud. "I am enough. Today is mine."',
    'Journal three words that describe how you want today to feel.',
    'Do 10 jumping jacks to get your blood flowing.',
    'Sit in silence for 2 minutes. Let your mind wake up naturally.',
    'Write a quick note of encouragement to your future self at the end of the day.',
    'Tidy one small area of your room. Order outside creates calm inside.',
    'Splash cold water on your face and take a sharp, energizing breath.',
    'Ask yourself: who do I want to be today?',
    'Massage your temples and scalp for 30 seconds to release morning tension.',
    'Look at yourself in the mirror and say one thing you like about who you are.',
    'Stretch your arms overhead and let out a long, intentional yawn.',
    'Sip something warm slowly. Let the warmth settle in your chest.',
    'Write down one worry you are leaving behind today.',
    'Clench and release each muscle group from your toes to your jaw.',
    'Listen to one uplifting song before you look at your phone.',
    'Trace your day in your mind: what needs to happen, what can wait.',
    'Roll your shoulders back and down. Open your chest. Breathe deep.',
    'Light a candle or incense and take 5 slow breaths with the scent.',
    'Text one person you love and tell them something specific you appreciate about them.',
    'Do a 1-minute plank to remind yourself that you are stronger than you think.',
    'Stand barefoot on the floor for 30 seconds. Feel grounded before the day pulls you.'
  ],
  midday: [
    'Step away for 5 minutes. Box breathe: in 4, hold 4, out 4, hold 4.',
    'Pause and name one thing you can see, hear, and feel right now to ground yourself.',
    'Check in with your body. Are you hungry, thirsty, or just tired?',
    'Close your eyes and take 5 slow breaths before your next task.',
    'Stand up and stretch. Your body wasn\'t designed to sit all day.',
    'Drink some water and notice how your mind feels afterward.',
    'Ask yourself: what do I need right now in this moment?',
    'Take a 2-minute walk, even if it\'s just to another room and back.',
    'Listen to one song without doing anything else. Just be with the music.',
    'Write down one thing that went well so far today.',
    'Eat something without any screens. Just you and your food.',
    'Roll your neck slowly in circles  right, back, left, forward. Repeat.',
    'Step outside and look at the sky for 30 seconds. Let your eyes rest.',
    'Close your eyes and imagine your favorite peaceful place for 60 seconds.',
    'Do 5 wall push-ups to reset your posture and energy.',
    'Write down one decision you\'re proud of today so far.',
    'Hum or sing quietly for 10 seconds. Vibrations calm the nervous system.',
    'Count backward from 30 slowly. If your mind wanders, start over.',
    'Massage your hands and wrists. We hold so much tension there.',
    'Name one thing you\'re looking forward to later today.',
    'Send a kind message to someone you haven\'t talked to in a while.',
    'Shake out your hands and feet for 10 seconds. Release built-up energy.',
    'Read one page of something inspiring. Let new thoughts in.',
    'Close your eyes and visualize finishing one task you\'ve been avoiding.',
    'Stand up and reach for the ceiling as high as you can. Then side to side.',
    'Write down one thing you can let go of for the rest of the day.',
    'Breathe in for 4 seconds, hold for 4, exhale for 6. Lengthen the exhale.',
    'Look at something green  a plant, a tree, even a photo. Nature calms the mind.',
    'Ask a coworker or friend how they\'re really doing today.',
    'Do a quick brain dump: write everything on your mind for 60 seconds.'
  ],
  evening: [
    'Reflect on one moment today that you want to remember. Write it down.',
    'Before bed, name one small thing that went ok today. Even the smallest win counts.',
    'Write down what frustrated you today  then tear it up or delete it. Let it go.',
    'List 3 things you are grateful for today. No repeats allowed.',
    'Close your eyes and replay one good moment from today in full detail.',
    'Take 5 slow breaths and release the day. Tomorrow is a fresh start.',
    'Write a sentence about how you feel right now. No judgment, just honesty.',
    'Set one intention for tomorrow before you close your eyes.',
    'Thank your body for carrying you through today, however it went.',
    'Put your phone away 15 minutes earlier than usual. Give your mind space to settle.',
    'Douse your face with cool water and look at yourself. You made it through today.',
    'Write one thing you learned about yourself today.',
    'Stretch your legs and hips for 3 minutes. Tension collects there from the day.',
    'Lie down and scan your body from head to toe. Notice without changing anything.',
    'List 5 sounds you heard today. It trains your brain to notice the present.',
    'Write a short letter to tomorrow\'s you. What do you want them to know?',
    'Dim the lights 30 minutes before bed. Signal your brain that it\'s time to rest.',
    'Think of one person who made your day better, even in a small way.',
    'Close your eyes and imagine releasing the day like letting go of a balloon.',
    'Take a warm shower and let the water wash away the weight of the day.',
    'Write down one thing you forgive yourself for today.',
    'Read something calming for 5 minutes. Fiction, poetry, or something simple.',
    'Ask yourself: what was the best moment of my day?',
    'Press your palms together at your chest and bow your head slightly. A silent thank you.',
    'Breathe in for 4, hold for 7, exhale for 8. Do this 4 times.',
    'Write down one thing that went differently than expected. Did it turn out okay?',
    'Gently roll your ankles and wrists in circles to release the day\'s tension.',
    'Name one thing you want to remember from today a year from now.',
    'Put a hand on your chest and say out loud: "I did enough today."',
    'Turn off all notifications for the night. The world can wait until morning.'
  ],
  extra: [
    'Every day you stay consistent, your brain builds stronger recovery pathways. You are literally rewiring yourself.',
    'Healing isn\'t linear. Some days will feel harder  that doesn\'t mean you\'re going backwards.',
    'You showed up today. That is not small. That is everything.',
    'The fact that you\'re here, reading this, means you haven\'t given up. That takes strength.',
    'Be gentle with yourself today. You are doing the best you can with what you have.',
    'Progress isn\'t measured in perfection. It\'s measured in showing up again and again.',
    'Your only job today is to be a little kinder to yourself than yesterday.',
    'Recovery is not about being fixed. It\'s about being free to become who you really are.',
    'Small steps compound. What you do today matters more than what you did yesterday.',
    'You don\'t have to have it all figured out. Just keep moving forward.',
    'You are not behind. There is no race. You are exactly where you need to be.',
    'The urge to quit is temporary. The pride of pushing through lasts forever.',
    'Healing happens in the quiet moments when no one is watching.',
    'Your past does not define your future. Every day is a chance to rewrite your story.',
    'It\'s okay to have a hard day. What matters is how you treat yourself through it.',
    'Remember why you started. That reason is still valid, even if the path has changed.',
    'Some days surviving is winning. And winning is enough.',
    'Growth isn\'t always visible. Like roots, most of it happens underground.',
    'Your mind lies sometimes. Especially when it tells you that you can\'t do this.',
    'Be proud of yourself. You\'re fighting battles that nobody knows about.',
    'There is no such thing as too slow. Only forward.',
    'You are not your worst moment. You are not your relapse. You are the person who got back up.',
    'Self-care is not selfish. It\'s how you refuel so you can show up for what matters.',
    'Today might be tough, but so are you. Tougher, actually.',
    'One day, this will be a chapter in your story. Not the whole book.',
    'You don\'t need to be fixed. You need to be understood  starting with yourself.',
    'Keep going. Your future self is counting on you.',
    'The braver you are in facing your pain, the freer you become.',
    'There is strength in asking for help. You don\'t have to do this alone.',
    'You are allowed to take up space. Your feelings matter. Your recovery matters.'
  ]
};

function artDailyRoutineHTML() {
  var today = new Date().toDateString();
  if (D._artRoutineDate === today && D._artRoutine) return D._artRoutine;
  var h = '<div class="card" style="border:2px solid var(--primary)"><div style="display:flex;align-items:center;gap:10px;margin-bottom:6px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-arthur);display:flex;align-items:center;justify-content:center;color:#fff"><svg viewBox="0 0 16 16" width="16" height="16" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg></div><div><h3 style="margin:0;font-size:15px">Arthur\'s Daily Routine</h3><p style="margin:0;font-size:11px;color:var(--muted)">Based on your journal entries</p></div></div>';
  if (!D.journal.length) {
    h += '<div class="empty-state">Write in your journal so Arthur can create a personalized daily routine for you.</div></div>';
    return h;
  }
  var moodCounts = [0,0,0,0,0];
  for (var mi=0;mi<D.moods.length;mi++) { moodCounts[D.moods[mi].val-1]++; }
  var topMood = 0;
  for (var mi2=0;mi2<5;mi2++) { if (moodCounts[mi2] > moodCounts[topMood]) topMood = mi2; }
  var recentText = D.journal.slice(-3).map(function(j){var t=getEntryText(j);return t?t.toLowerCase():''}).join(' ');
  var hasStress = recentText.indexOf('stress') !== -1 || recentText.indexOf('anxi') !== -1 || recentText.indexOf('overwhelm') !== -1;
  var hasCraving = recentText.indexOf('craving') !== -1 || recentText.indexOf('trigger') !== -1 || recentText.indexOf('urge') !== -1;
  var hasGratitude = recentText.indexOf('grateful') !== -1 || recentText.indexOf('thank') !== -1 || recentText.indexOf('bless') !== -1;

  var dayIndex = Math.floor(Date.now() / 86400000);
  var morningPool = ROUTINE_POOLS.morning;
  var middayPool = ROUTINE_POOLS.midday;
  var eveningPool = ROUTINE_POOLS.evening;
  var extraPool = ROUTINE_POOLS.extra;
  var morning = morningPool[dayIndex % morningPool.length];
  var midday = middayPool[(dayIndex + Math.floor(morningPool.length / 2)) % middayPool.length];
  var evening = eveningPool[(dayIndex + Math.floor(middayPool.length / 2)) % eveningPool.length];
  var extra = extraPool[(dayIndex + Math.floor(eveningPool.length / 2)) % extraPool.length];
  if (hasCraving) extra = 'You mentioned cravings. Arthur says: cravings last 15-30 minutes. Surf the wave  it will pass. Keep your hands busy, call someone, or breathe through it.';
  else if (hasStress) extra = 'You seem stressed. Arthur suggests the 5-4-3-2-1 grounding exercise: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.';
  else if (hasGratitude) extra = 'You\'ve been practicing gratitude  that rewires your brain for positivity. Share one grateful thought with someone today.';

  h += '<div style="margin-bottom:6px"><div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">&#127749;</span><div style="flex:1"><div style="font-size:13px;font-weight:600">Morning</div><div style="font-size:12px;color:var(--muted);line-height:1.4">' + morning + '</div></div></div>';
  h += '<div style="display:flex;align-items:center;gap:6px;padding:8px 0;border-bottom:1px solid var(--border)"><span style="font-size:16px">&#9728;&#65039;</span><div style="flex:1"><div style="font-size:13px;font-weight:600">Midday</div><div style="font-size:12px;color:var(--muted);line-height:1.4">' + midday + '</div></div></div>';
  h += '<div style="display:flex;align-items:center;gap:6px;padding:8px 0"><span style="font-size:16px">&#127769;</span><div style="flex:1"><div style="font-size:13px;font-weight:600">Evening</div><div style="font-size:12px;color:var(--muted);line-height:1.4">' + evening + '</div></div></div>';
  h += '</div>';
  h += '<div style="background:var(--primary-light);padding:10px 12px;border-radius:10px;font-size:12px;line-height:1.5;border-left:3px solid var(--primary)"><strong>Arthur\'s note:</strong> ' + extra + '</div>';
  h += '</div>';
  D._artRoutineDate = today;
  D._artRoutine = h;
  return h;
}

// ====== REFLECT WITH ART ======
// Song recommendations by emotional tone
var REFLECT_SONGS = {};
var SONG_POOL_GENERATED = false;
var ITUNES_CACHE = {};
function fetchItunesSongs(mood) {
  var keywords = {
    sad:'sad+healing+recovery',angry:'angry+rock+energy',anxious:'calm+peaceful+relaxing',
    happy:'happy+uplifting+positive',grateful:'grateful+blessed+thankful',
    reflective:'reflective+thoughtful+acoustic',hopeful:'hopeful+inspirational+strength'
  };
  fetch('https://itunes.apple.com/search?term=' + (keywords[mood]||mood) + '&limit=25&entity=song').then(function(r){return r.json()}).then(function(data){
    ITUNES_CACHE[mood] = (data.results||[]).map(function(item){
      return {
        title:item.trackName, artist:item.artistName,
        url_apple:item.trackViewUrl,
        url_spotify:'https://open.spotify.com/search/' + encodeURIComponent(item.trackName + ' ' + item.artistName),
        url_youtube:'https://www.youtube.com/results?search_query=' + (item.trackName + ' ' + item.artistName).toLowerCase().replace(/[^a-z0-9]/g,'+')
      };
    });
  }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}
var SONGS_BY_MOOD = {
  sad: [
    {t:'Fix You',a:'Coldplay'},{t:'Hurt',a:'Johnny Cash'},{t:'Someone Like You',a:'Adele'},{t:'Creep',a:'Radiohead'},{t:'When the Party\'s Over',a:'Billie Eilish'},{t:'The Sound of Silence',a:'Simon & Garfunkel'},{t:'Everybody Hurts',a:'R.E.M.'},{t:'Nothing Compares 2 U',a:'Sinead O\'Connor'},{t:'Tears in Heaven',a:'Eric Clapton'},{t:'Yesterday',a:'The Beatles'},{t:'Boulevard of Broken Dreams',a:'Green Day'},{t:'Skinny Love',a:'Bon Iver'},{t:'Hallelujah',a:'Jeff Buckley'},{t:'Mad World',a:'Gary Jules'},{t:'Liability',a:'Lorde'},{t:'Cancer',a:'My Chemical Romance'},{t:'Snuff',a:'Slipknot'},{t:'Black',a:'Pearl Jam'},{t:'Nutshell',a:'Alice In Chains'},{t:'Tears Don\'t Fall',a:'Bullet for My Valentine'},{t:'The Drugs Don\'t Work',a:'The Verve'},{t:'Shallow',a:'Lady Gaga & Bradley Cooper'},{t:'Grenade',a:'Bruno Mars'},{t:'No Ordinary Love',a:'Sade'},{t:'Alone',a:'Masayoshi Takanaka'},{t:'Gold Dust Woman',a:'Fleetwood Mac'},{t:'Something About Us',a:'Daft Punk'},{t:'Bohemian Rhapsody',a:'Queen'},{t:'Smooth Operator',a:'Sade'},{t:'Flashing Lights',a:'Kanye West'},{t:'I Wonder',a:'Kanye West'},{t:'Everything I Am',a:'Kanye West'},{t:'The Scientist',a:'Coldplay'},{t:'She Will Be Loved',a:'Maroon 5'},{t:'Won\'t Go Home Without You',a:'Maroon 5'},{t:'Badfish',a:'Sublime'},{t:'Operator',a:'Jim Croce'},{t:'Photographs and Memories',a:'Jim Croce'},{t:'Lonesome Loser',a:'Little River Band'},{t:'Take It Easy on Me',a:'Little River Band'},    {t:'While My Guitar Gently Weeps',a:'The Beatles'},{t:'Time in a Bottle',a:'Jim Croce'},{t:'Let Her Cry',a:'Hootie & the Blowfish'},{t:'Anti-Hero',a:'Taylor Swift'},{t:'All Too Well',a:'Taylor Swift'},{t:'Cardigan',a:'Taylor Swift'},{t:'Just Give Me a Reason',a:'P!nk'},{t:'I Will Always Love You',a:'Whitney Houston'},{t:'Saving All My Love for You',a:'Whitney Houston'},{t:'Everything I Wanted',a:'Billie Eilish'},    {t:'Ocean Eyes',a:'Billie Eilish'},{t:'Lovely',a:'Billie Eilish'},{t:'Leaving on a Jet Plane',a:'John Denver'},{t:'Nothing Else Matters',a:'Metallica'},{t:'Fade to Black',a:'Metallica'},{t:'How You Remind Me',a:'Nickelback'},{t:'Far Away',a:'Nickelback'},{t:'Stranger in Moscow',a:'Michael Jackson'}
  ],
  angry: [
    {t:'Killing in the Name',a:'Rage Against The Machine'},{t:'Break Stuff',a:'Limp Bizkit'},{t:'Enter Sandman',a:'Metallica'},{t:'Smells Like Teen Spirit',a:'Nirvana'},{t:'Du Hast',a:'Rammstein'},{t:'Chop Suey!',a:'System of a Down'},{t:'Freak on a Leash',a:'Korn'},{t:'Down with the Sickness',a:'Disturbed'},{t:'Bodies',a:'Drowning Pool'},{t:'The Pretender',a:'Foo Fighters'},{t:'Given Up',a:'Linkin Park'},{t:'Numb',a:'Linkin Park'},{t:'Last Resort',a:'Papa Roach'},{t:'Walk',a:'Pantera'},{t:'One Step Closer',a:'Linkin Park'},{t:'Beat It',a:'Michael Jackson'},{t:'We Will Rock You',a:'Queen'},{t:'Go Your Own Way',a:'Fleetwood Mac'},{t:'The Chain',a:'Fleetwood Mac'},{t:'Deeper Underground',a:'Jamiroquai'},{t:'Can\'t Tell Me Nothing',a:'Kanye West'},{t:'Harder Better Faster Stronger',a:'Daft Punk'},    {t:'Come Together',a:'The Beatles'},{t:'China Grove',a:'Doobie Brothers'},{t:'You Don\'t Mess Around with Jim',a:'Jim Croce'},{t:'Bad Blood',a:'Taylor Swift'},{t:'Irreplaceable',a:'Beyonc'},{t:'Formation',a:'Beyonc'},{t:'So What',a:'P!nk'},{t:'Bad Guy',a:'Billie Eilish'},    {t:'Happier Than Ever',a:'Billie Eilish'},{t:'Therefore I Am',a:'Billie Eilish'},{t:'Master of Puppets',a:'Metallica'},{t:'For Whom the Bell Tolls',a:'Metallica'},{t:'Back in Black',a:'AC/DC'},{t:'Thunderstruck',a:'AC/DC'},{t:'Highway to Hell',a:'AC/DC'},{t:'TNT',a:'AC/DC'},{t:'Pour Some Sugar on Me',a:'Def Leppard'},{t:'Burn It to the Ground',a:'Nickelback'},{t:'Dirty Diana',a:'Michael Jackson'},{t:'They Don\'t Care About Us',a:'Michael Jackson'}
  ],
  anxious: [
    {t:'Breathe Me',a:'Sia'},{t:'Teardrop',a:'Massive Attack'},{t:'Comfortably Numb',a:'Pink Floyd'},{t:'Let It Be',a:'The Beatles'},{t:'Weightless',a:'Marconi Union'},{t:'Intro',a:'The xx'},{t:'Holocene',a:'Bon Iver'},{t:'Svefn-g-englar',a:'Sigur Rs'},{t:'An Ending (Ascent)',a:'Brian Eno'},{t:'Clair de Lune',a:'Claude Debussy'},{t:'On the Nature of Daylight',a:'Max Richter'},{t:'Experience',a:'Ludovico Einaudi'},{t:'Avril 14th',a:'Aphex Twin'},{t:'Roygbiv',a:'Boards of Canada'},{t:'Porcelain',a:'Moby'},{t:'Hide and Seek',a:'Imogen Heap'},    {t:'Daydreaming',a:'Radiohead'},{t:'In the Air Tonight',a:'Phil Collins'},{t:'Clocks',a:'Coldplay'},{t:'Cruel Summer',a:'Taylor Swift'}
  ],
  happy: [
    {t:'Don\'t Stop Believin\'',a:'Journey'},{t:'Happy',a:'Pharrell Williams'},{t:'Uptown Funk',a:'Mark Ronson ft. Bruno Mars'},{t:'I Wanna Dance with Somebody',a:'Whitney Houston'},{t:'Walking on Sunshine',a:'Katrina & The Waves'},{t:'Here Comes the Sun',a:'The Beatles'},{t:'Good Vibrations',a:'The Beach Boys'},{t:'Shake It Off',a:'Taylor Swift'},{t:'Can\'t Stop the Feeling!',a:'Justin Timberlake'},{t:'Blinding Lights',a:'The Weeknd'},{t:'Levitating',a:'Dua Lipa'},{t:'Feeling Good',a:'Nina Simone'},{t:'September',a:'Earth, Wind & Fire'},{t:'Treasure',a:'Bruno Mars'},{t:'Shut Up and Dance',a:'Walk the Moon'},{t:'Mr. Blue Sky',a:'Electric Light Orchestra'},{t:'Lovely Day',a:'Bill Withers'},{t:'Billie Jean',a:'Michael Jackson'},{t:'Don\'t Stop \'Til You Get Enough',a:'Michael Jackson'},{t:'The Way You Make Me Feel',a:'Michael Jackson'},{t:'Thriller',a:'Michael Jackson'},{t:'Bad Romance',a:'Lady Gaga'},{t:'Poker Face',a:'Lady Gaga'},{t:'Just Dance',a:'Lady Gaga'},{t:'One More Time',a:'Daft Punk'},{t:'Get Lucky',a:'Daft Punk'},{t:'Around the World',a:'Daft Punk'},{t:'Teenage Dream',a:'Katy Perry'},{t:'California Gurls',a:'Katy Perry'},{t:'Virtual Insanity',a:'Jamiroquai'},{t:'Canned Heat',a:'Jamiroquai'},{t:'Cosmic Girl',a:'Jamiroquai'},{t:'Love Foolosophy',a:'Jamiroquai'},{t:'Bamboo Vendor',a:'Masayoshi Takanaka'},{t:'SEXY DANCE',a:'Masayoshi Takanaka'},{t:'OH! TENGOKU',a:'Masayoshi Takanaka'},{t:'Kiss of Life',a:'Sade'},{t:'Paradise',a:'Sade'},{t:'Locked Out of Heaven',a:'Bruno Mars'},{t:'24K Magic',a:'Bruno Mars'},{t:'That\'s What I Like',a:'Bruno Mars'},{t:'Good Morning',a:'Kanye West'},{t:'Good Life',a:'Kanye West'},{t:'Drunk and Hot Girls',a:'Kanye West'},{t:'Dreams',a:'Fleetwood Mac'},{t:'The Sweetest Taboo',a:'Sade'},{t:'Dark Horse',a:'Katy Perry'},{t:'Listen to the Music',a:'Doobie Brothers'},{t:'What a Fool Believes',a:'Doobie Brothers'},{t:'Long Train Runnin\'',a:'Doobie Brothers'},{t:'China Grove',a:'Doobie Brothers'},{t:'The Night Owls',a:'Little River Band'},{t:'Bad Bad Leroy Brown',a:'Jim Croce'},{t:'You Don\'t Mess Around with Jim',a:'Jim Croce'},{t:'What I Got',a:'Sublime'},{t:'Santeria',a:'Sublime'},{t:'Doin\' Time',a:'Sublime'},{t:'Summertime',a:'Sublime'},{t:'Scarlet Begonias',a:'Sublime'},{t:'A Sky Full of Stars',a:'Coldplay'},{t:'Adventure of a Lifetime',a:'Coldplay'},{t:'This Love',a:'Maroon 5'},{t:'Sunday Morning',a:'Maroon 5'},{t:'Sugar',a:'Maroon 5'},{t:'From Me to You',a:'The Beatles'},{t:'Come Together',a:'The Beatles'},{t:'Cherish the Day',a:'Sade'},    {t:'Payphone',a:'Maroon 5'},{t:'Makes Me Wonder',a:'Maroon 5'},{t:'Hold My Hand',a:'Hootie & the Blowfish'},{t:'Only Wanna Be with You',a:'Hootie & the Blowfish'},{t:'I Go Blind',a:'Hootie & the Blowfish'},{t:'Love Story',a:'Taylor Swift'},{t:'You Belong with Me',a:'Taylor Swift'},{t:'Blank Space',a:'Taylor Swift'},{t:'Cruel Summer',a:'Taylor Swift'},{t:'Single Ladies',a:'Beyonc'},{t:'Crazy in Love',a:'Beyonc'},{t:'Love on Top',a:'Beyonc'},{t:'Formation',a:'Beyonc'},{t:'Break My Soul',a:'Beyonc'},{t:'Sunshine on My Shoulders',a:'John Denver'},{t:'Thank God I\'m a Country Boy',a:'John Denver'},{t:'So What',a:'P!nk'},{t:'Raise Your Glass',a:'P!nk'},{t:'Get the Party Started',a:'P!nk'},{t:'How Will I Know',a:'Whitney Houston'},{t:'So Emotional',a:'Whitney Houston'},{t:'I\'m Every Woman',a:'Whitney Houston'},{t:'Like a Virgin',a:'Madonna'},{t:'Material Girl',a:'Madonna'},{t:'Vogue',a:'Madonna'},{t:'Into the Groove',a:'Madonna'},{t:'Ray of Light',a:'Madonna'},{t:'Hung Up',a:'Madonna'},{t:'Holiday',a:'Madonna'},    {t:'Bad Guy',a:'Billie Eilish'},{t:'Therefore I Am',a:'Billie Eilish'},{t:'Birds of a Feather',a:'Billie Eilish'},{t:'Keep On Loving You',a:'REO Speedwagon'},{t:'Roll with the Changes',a:'REO Speedwagon'},{t:'You Shook Me All Night Long',a:'AC/DC'},{t:'Hysteria',a:'Def Leppard'},{t:'Photograph',a:'Def Leppard'},{t:'Rockstar',a:'Nickelback'},{t:'West End Girls',a:'Pet Shop Boys'},{t:'Opportunities (Let\'s Make Lots of Money)',a:'Pet Shop Boys'},{t:'Smooth Criminal',a:'Michael Jackson'},{t:'Bad',a:'Michael Jackson'},{t:'Remember the Time',a:'Michael Jackson'},{t:'Black or White',a:'Michael Jackson'}
  ],
  grateful: [
    {t:'What a Wonderful World',a:'Louis Armstrong'},{t:'Lean on Me',a:'Bill Withers'},{t:'Three Little Birds',a:'Bob Marley'},{t:'Stand By Me',a:'Ben E. King'},{t:'Over the Rainbow',a:'Israel Kamakawiwo\'ole'},{t:'Count on Me',a:'Bruno Mars'},{t:'Thank You',a:'Dido'},{t:'Unwritten',a:'Natasha Bedingfield'},{t:'Best Day of My Life',a:'American Authors'},{t:'I\'m Yours',a:'Jason Mraz'},{t:'Better Together',a:'Jack Johnson'},{t:'Put Your Records On',a:'Corinne Bailey Rae'},{t:'One Love',a:'Bob Marley'},{t:'Redemption Song',a:'Bob Marley'},{t:'Man in the Mirror',a:'Michael Jackson'},{t:'Somebody to Love',a:'Queen'},{t:'Just the Way You Are',a:'Bruno Mars'},{t:'Brasilian Skies',a:'Masayoshi Takanaka'},{t:'Homecoming',a:'Kanye West'},{t:'By Your Side',a:'Sade'},{t:'Listen to the Music',a:'Doobie Brothers'},{t:'Black Water',a:'Doobie Brothers'},{t:'Reminiscing',a:'Little River Band'},{t:'Cool Change',a:'Little River Band'},{t:'I\'ll Have to Say I Love You in a Song',a:'Jim Croce'},{t:'Hey Jude',a:'The Beatles'},{t:'Something',a:'The Beatles'},{t:'What I Got',a:'Sublime'},{t:'Yellow',a:'Coldplay'},{t:'Sunday Morning',a:'Maroon 5'},    {t:'Cherish the Day',a:'Sade'},{t:'In My Life',a:'The Beatles'},{t:'Hold My Hand',a:'Hootie & the Blowfish'},{t:'Only Wanna Be with You',a:'Hootie & the Blowfish'},{t:'Love Story',a:'Taylor Swift'},{t:'Halo',a:'Beyonc'},{t:'Love on Top',a:'Beyonc'},{t:'Annie\'s Song',a:'John Denver'},{t:'Sunshine on My Shoulders',a:'John Denver'},{t:'Take Me Home Country Roads',a:'John Denver'},{t:'Fuckin\' Perfect',a:'P!nk'},{t:'Greatest Love of All',a:'Whitney Houston'},{t:'Like a Prayer',a:'Madonna'},    {t:'Birds of a Feather',a:'Billie Eilish'},{t:'Can\'t Fight This Feeling',a:'REO Speedwagon'},{t:'If Everyone Cared',a:'Nickelback'},{t:'Far Away',a:'Nickelback'},{t:'Heal the World',a:'Michael Jackson'},{t:'Human Nature',a:'Michael Jackson'},{t:'Always on My Mind',a:'Pet Shop Boys'}
  ],
  reflective: [
    {t:'Landslide',a:'Fleetwood Mac'},{t:'Fast Car',a:'Tracy Chapman'},{t:'Imagine',a:'John Lennon'},{t:'Under the Bridge',a:'Red Hot Chili Peppers'},{t:'Wish You Were Here',a:'Pink Floyd'},{t:'Time',a:'Pink Floyd'},{t:'Vienna',a:'Billy Joel'},{t:'The Boxer',a:'Simon & Garfunkel'},{t:'Hallelujah',a:'Leonard Cohen'},{t:'River',a:'Joni Mitchell'},{t:'The Only Exception',a:'Paramore'},{t:'Chasing Cars',a:'Snow Patrol'},{t:'Come Away with Me',a:'Norah Jones'},{t:'Rivers and Roads',a:'The Head and the Heart'},{t:'Wake Up',a:'Arcade Fire'},{t:'Man in the Mirror',a:'Michael Jackson'},{t:'Bohemian Rhapsody',a:'Queen'},{t:'Under Pressure',a:'Queen'},{t:'Rhiannon',a:'Fleetwood Mac'},{t:'Dreams',a:'Fleetwood Mac'},{t:'Alejandro',a:'Lady Gaga'},{t:'Smooth Operator',a:'Sade'},{t:'Heritage',a:'Masayoshi Takanaka'},{t:'I Wonder',a:'Kanye West'},{t:'Everything I Am',a:'Kanye West'},{t:'Flashing Lights',a:'Kanye West'},{t:'What a Fool Believes',a:'Doobie Brothers'},{t:'Black Water',a:'Doobie Brothers'},{t:'Reminiscing',a:'Little River Band'},{t:'Cool Change',a:'Little River Band'},{t:'Time in a Bottle',a:'Jim Croce'},{t:'Operator',a:'Jim Croce'},{t:'Photographs and Memories',a:'Jim Croce'},{t:'Never as Good as First Time',a:'Sade'},{t:'Hey Jude',a:'The Beatles'},{t:'Something',a:'The Beatles'},{t:'In My Life',a:'The Beatles'},{t:'Across the Universe',a:'The Beatles'},{t:'A Day in the Life',a:'The Beatles'},{t:'Santeria',a:'Sublime'},{t:'Badfish',a:'Sublime'},{t:'Yellow',a:'Coldplay'},{t:'The Scientist',a:'Coldplay'},{t:'Clocks',a:'Coldplay'},    {t:'She Will Be Loved',a:'Maroon 5'},{t:'Makes Me Wonder',a:'Maroon 5'},{t:'Payphone',a:'Maroon 5'},{t:'Let Her Cry',a:'Hootie & the Blowfish'},{t:'Time',a:'Hootie & the Blowfish'},{t:'You Belong with Me',a:'Taylor Swift'},{t:'Blank Space',a:'Taylor Swift'},{t:'Anti-Hero',a:'Taylor Swift'},{t:'All Too Well',a:'Taylor Swift'},{t:'Cardigan',a:'Taylor Swift'},{t:'Willow',a:'Taylor Swift'},{t:'Irreplaceable',a:'Beyonc'},{t:'Take Me Home Country Roads',a:'John Denver'},{t:'Rocky Mountain High',a:'John Denver'},{t:'Leaving on a Jet Plane',a:'John Denver'},{t:'Just Give Me a Reason',a:'P!nk'},{t:'Try',a:'P!nk'},{t:'What About Us',a:'P!nk'},{t:'I Will Always Love You',a:'Whitney Houston'},{t:'Saving All My Love for You',a:'Whitney Houston'},{t:'Material Girl',a:'Madonna'},{t:'Everything I Wanted',a:'Billie Eilish'},{t:'Ocean Eyes',a:'Billie Eilish'},    {t:'Happier Than Ever',a:'Billie Eilish'},{t:'Owner of a Lonely Heart',a:'Yes'},{t:'Nothing Else Matters',a:'Metallica'},{t:'One',a:'Metallica'},{t:'How You Remind Me',a:'Nickelback'},{t:'Photograph',a:'Nickelback'},{t:'Someday',a:'Nickelback'},{t:'Love Bites',a:'Def Leppard'},{t:'What Have I Done to Deserve This?',a:'Pet Shop Boys'}
  ],
  hopeful: [
    {t:'Rise Up',a:'Andra Day'},{t:'Brave',a:'Sara Bareilles'},{t:'Fight Song',a:'Rachel Platten'},{t:'Roar',a:'Katy Perry'},{t:'Stronger (What Doesn\'t Kill You)',a:'Kelly Clarkson'},{t:'Eye of the Tiger',a:'Survivor'},{t:'Lose Yourself',a:'Eminem'},{t:'Not Afraid',a:'Eminem'},{t:'Beautiful Day',a:'U2'},{t:'Viva la Vida',a:'Coldplay'},{t:'Titanium',a:'David Guetta ft. Sia'},{t:'Counting Stars',a:'OneRepublic'},{t:'Whatever It Takes',a:'Imagine Dragons'},{t:'Centuries',a:'Fall Out Boy'},{t:'Don\'t Stop Me Now',a:'Queen'},{t:'Firework',a:'Katy Perry'},{t:'Born This Way',a:'Lady Gaga'},{t:'We Are the Champions',a:'Queen'},{t:'Go Your Own Way',a:'Fleetwood Mac'},{t:'Ready to Fly',a:'Masayoshi Takanaka'},{t:'By Your Side',a:'Sade'},{t:'Champion',a:'Kanye West'},{t:'Can\'t Tell Me Nothing',a:'Kanye West'},{t:'Takin\' It to the Streets',a:'Doobie Brothers'},{t:'Help Is on Its Way',a:'Little River Band'},{t:'Hey Jude',a:'The Beatles'},{t:'Paradise',a:'Coldplay'},{t:'A Sky Full of Stars',a:'Coldplay'},    {t:'Love Is Stronger Than Pride',a:'Sade'},{t:'Willow',a:'Taylor Swift'},{t:'Halo',a:'Beyonc'},{t:'Break My Soul',a:'Beyonc'},{t:'Rocky Mountain High',a:'John Denver'},{t:'Try',a:'P!nk'},{t:'Fuckin\' Perfect',a:'P!nk'},{t:'Greatest Love of All',a:'Whitney Houston'},{t:'Like a Prayer',a:'Madonna'},    {t:'Ray of Light',a:'Madonna'},{t:'Roll with the Changes',a:'REO Speedwagon'},{t:'Take It on the Run',a:'REO Speedwagon'},{t:'For Those About to Rock (We Salute You)',a:'AC/DC'},{t:'Let\'s Get Rocked',a:'Def Leppard'},{t:'If Everyone Cared',a:'Nickelback'},{t:'West End Girls',a:'Pet Shop Boys'},{t:'Heal the World',a:'Michael Jackson'},{t:'Black or White',a:'Michael Jackson'}
  ]
};

function generateSong(title, artist) {
  var q = title + ' ' + artist;
  var a = q.toLowerCase().replace(/[^a-z0-9]/g,'+');
  return { title: title, artist: artist, url_spotify: 'https://open.spotify.com/search/' + encodeURIComponent(q), url_youtube: 'https://www.youtube.com/results?search_query=' + a, url_apple: 'https://music.apple.com/search?term=' + encodeURIComponent(q) };
}

function populateSongPool() {
  if (SONG_POOL_GENERATED) return;
  var moods = ['sad','angry','anxious','happy','grateful','reflective','hopeful'];
  for (var mi=0;mi<moods.length;mi++) {
    var mood = moods[mi];
    if (!REFLECT_SONGS[mood]) REFLECT_SONGS[mood] = [];
    var songs = SONGS_BY_MOOD[mood] || [];
    for (var si=0;si<songs.length;si++) {
      var song = generateSong(songs[si].t, songs[si].a);
      REFLECT_SONGS[mood].push(song);
    }
    // Fire iTunes fetch for live songs
    fetchItunesSongs(mood);
  }
  SONG_POOL_GENERATED = true;
}

var SONG_KEYWORDS = {
  rise: [{t:'Rise Up',a:'Andra Day'},{t:'Eye of the Tiger',a:'Survivor'}],
  stronger: [{t:'Stronger',a:'Kanye West'},{t:'Stronger (What Doesn\'t Kill You)',a:'Kelly Clarkson'}],
  fight: [{t:'Fight Song',a:'Rachel Platten'},{t:'My Shot',a:'Lin-Manuel Miranda'},{t:'The Pretender',a:'Foo Fighters'}],
  hope: [{t:'Hopeful',a:'Bars and Melody'},{t:'Don\'t Stop Me Now',a:'Queen'},{t:'Viva la Vida',a:'Coldplay'}],
  break: [{t:'Breakeven',a:'The Script'},{t:'Break Stuff',a:'Limp Bizkit'}],
  free: [{t:'Free Fallin\'',a:'Tom Petty'},{t:'Brave',a:'Sara Bareilles'}],
  home: [{t:'Home',a:'Phillip Phillips'},{t:'Coming Home',a:'Leon Bridges'}],
  light: [{t:'Light',a:'San Holo'},{t:'The Light',a:'Disturbed'},{t:'Shine',a:'Collective Soul'},{t:'Lights',a:'Ellie Goulding'}],
  run: [{t:'Run',a:'Snow Patrol'},{t:'Fast Car',a:'Tracy Chapman'}],
  rain: [{t:'Rainbow',a:'Kacey Musgraves'},{t:'Here Comes the Sun',a:'The Beatles'}],
  fire: [{t:'Firework',a:'Katy Perry'},{t:'Set Fire to the Rain',a:'Adele'},{t:'We Didn\'t Start the Fire',a:'Billy Joel'}],
  breathe: [{t:'Breathe Me',a:'Sia'},{t:'Just Breathe',a:'Pearl Jam'}],

  lonely: [{t:'Lonely',a:'Akon'},{t:'All by Myself',a:'Eric Carmen'},{t:'Eleanor Rigby',a:'The Beatles'}],
  lose: [{t:'Lose Yourself',a:'Eminem'},{t:'Don\'t Lose Hope',a:'Someone'}],
  saved: [{t:'Save Me',a:'Jelly Roll'},{t:'Saving Grace',a:'Tom Petty'}],
  save: [{t:'Save Me',a:'Jelly Roll'},{t:'Rescue',a:'Echo Smith'}],
  miracle: [{t:'Miracle',a:'Carrie Underwood'},{t:'Miracles',a:'Insane Clown Posse'}],
  angel: [{t:'Angel',a:'Sarah McLachlan'},{t:'Tears in Heaven',a:'Eric Clapton'}],
  survive: [{t:'Survivor',a:'Destiny\'s Child'},{t:'I Will Survive',a:'Gloria Gaynor'},{t:'Alive',a:'Sia'}],
  drown: [{t:'Drown',a:'Bring Me the Horizon'},{t:'Someone Like You',a:'Adele'}],
  sky: [{t:'Mr. Blue Sky',a:'Electric Light Orchestra'},{t:'Purple Rain',a:'Prince'}],
  afraid: [{t:'Not Afraid',a:'Eminem'},{t:'Fear',a:'Blue October'}],
  dream: [{t:'Dream On',a:'Aerosmith'},{t:'Dreams',a:'Fleetwood Mac'}],
  change: [{t:'Changes',a:'2Pac'},{t:'Man in the Mirror',a:'Michael Jackson'}],
  brave: [{t:'Brave',a:'Sara Bareilles'},{t:'The Climb',a:'Miley Cyrus'}],
  broken: [{t:'Fix You',a:'Coldplay'},{t:'Broken',a:'Seether'},{t:'Hurt',a:'Johnny Cash'}],
  heal: [{t:'Heal the World',a:'Michael Jackson'},{t:'The Drugs Don\'t Work',a:'The Verve'}],
  sorry: [{t:'Sorry Seems to Be the Hardest Word',a:'Elton John'}],
  believe: [{t:'I Believe I Can Fly',a:'R. Kelly'},{t:'Believer',a:'Imagine Dragons'}],
  thunder: [{t:'Thunder',a:'Imagine Dragons'},{t:'Thunderstruck',a:'AC/DC'}],
  fall: [{t:'I Fall Apart',a:'Post Malone'},{t:'Boulevard of Broken Dreams',a:'Green Day'}],
  yesterday: [{t:'Yesterday',a:'The Beatles'}],
  today: [{t:'One Day',a:'Matisyahu'},{t:'The Best Day',a:'Taylor Swift'}],
  tomorrow: [{t:'Tomorrow',a:'Silverchair'},{t:'Wake Me Up When September Ends',a:'Green Day'}],
  mistake: [{t:'Mistake',a:'NF'},{t:'Everybody Hurts',a:'R.E.M.'}],
  sorry: [{t:'Sorry',a:'Justin Bieber'},{t:'Apologize',a:'OneRepublic'},{t:'Sorry',a:'Beyonc'}],
  alone: [{t:'Alone',a:'Heart'},{t:'All by Myself',a:'Eric Carmen'}],
  war: [{t:'War Pigs',a:'Black Sabbath'},{t:'Gimme Shelter',a:'The Rolling Stones'}],
  faith: [{t:'Faith',a:'George Michael'},{t:'I Believe',a:'Fantasia'}],
  stand: [{t:'Stand By Me',a:'Ben E. King'},{t:'I Stand Alone',a:'Godsmack'}],
  numb: [{t:'Numb',a:'Linkin Park'},{t:'Comfortably Numb',a:'Pink Floyd'}],
  crawl: [{t:'Crawling',a:'Linkin Park'},{t:'Creep',a:'Radiohead'}],
  monster: [{t:'Monster',a:'Skillet'},{t:'Monster',a:'Imagine Dragons'}],
  help: [{t:'Help!',a:'The Beatles'},{t:'Helplessly Hoping',a:'Crosby, Stills & Nash'}],
  learn: [{t:'Try',a:'Colbie Caillat'},{t:'What I\'ve Done',a:'Linkin Park'}],
  silence: [{t:'The Sound of Silence',a:'Simon & Garfunkel'},{t:'Silence',a:'Marshmello ft. Khalid'}],
  courage: [{t:'Courage',a:'P!nk'},{t:'Brave',a:'Sara Bareilles'}],
  woke: [{t:'Wake Up',a:'Arcade Fire'},{t:'Waking Up',a:'OneRepublic'}],
  tired: [{t:'Tired',a:'Alan Walker'},{t:'Fix You',a:'Coldplay'}]
};

function getSong(entryText, mood) {
  // Keyword match (takes priority regardless of cache)
  if (entryText) {
    var t = entryText.toLowerCase();
    for (var key in SONG_KEYWORDS) {
      if (t.indexOf(key) !== -1) {
        var match = SONG_KEYWORDS[key];
        var pick = match[Math.floor(Math.random() * match.length)];
        return generateSong(pick.t, pick.a);
      }
    }
  }
  // Try live iTunes cache first
  var cached = ITUNES_CACHE[mood];
  if (cached && cached.length) return cached[Math.floor(Math.random() * cached.length)];
  // Fallback to hardcoded pool
  if (!SONG_POOL_GENERATED) {
    if (!window._songPoolLoading) { window._songPoolLoading = true; setTimeout(function(){ populateSongPool(); window._songPoolLoading = false; }, 100); }
    return null;
  }
  var pool = REFLECT_SONGS[mood] || REFLECT_SONGS.reflective;
  return pool[Math.floor(Math.random() * pool.length)];
}

function detectMood(text) {
  var t = text.toLowerCase();
  var scores = {sad:0, angry:0, anxious:0, happy:0, grateful:0, reflective:0, hopeful:0};
  var negWords = /^(not|n't|never|no|don't|doesn't|didn't|won't|can't|couldn't|wasn't|weren't|isn't|aren't|ain't|haven't|hasn't|hadn't)$/;
  var boostWords = /^(very|really|extremely|so|truly|deeply|incredibly|absolutely|terribly)$/;
  var dampenWords = /^(slightly|somewhat|barely|hardly|a|bit|little)$/;
  var words = t.split(/\s+/);
  function wordBefore(idx) { var before = t.substring(Math.max(0,idx-30),idx).trim().split(/\s+/); return before.length ? before[before.length-1] : ''; }
  function intensity(idx) { var b = t.substring(Math.max(0,idx-25),idx).trim().split(/\s+/).slice(-3); for (var i=b.length-1;i>=0;i--) { if (boostWords.test(b[i])) return 1.5; if (dampenWords.test(b[i])) return 0.5; } return 1; }
  function scoreMood(re, mood) { var r = new RegExp(re.source,'g'), match; while ((match = r.exec(t)) !== null) { if (!negWords.test(wordBefore(match.index))) scores[mood] += Math.round(3 * intensity(match.index)); r.lastIndex = match.index+1; } }
  scoreMood(/\b(sad|depres|lonel|down|cry|cried|crying|unhappy|grief|heartbrok|miserable|hopeless|gloom|sorrow|mourn|ache|suffer|devastat|despair|hurt|pain)\b/,'sad');
  scoreMood(/\b(angr|frustrat|mad|pissed|rage|irritat|annoyed|furiou|hate|annoying|fury|outraged|resent|bitter|fuming|livid)\b/,'angry');
  scoreMood(/\b(anxi|worr|panic|nervous|scared|fear|overwhelm|stress|tense|terrifi|dread|uneasy|restless|doubt|insecure)\b/,'anxious');
  scoreMood(/\b(joy|excite|wonderful|beautiful|love|warm|smile|laugh|happy|happier|happiest|delight|cheer|glad|elated|thrille|bliss|radiant|content|peace|calm|serene|grateful)\b/,'happy');
  scoreMood(/\b(grateful|thank|blessed|appreciate|fortunat|blessing|gratitude)\b/,'grateful');
  scoreMood(/\b(think|wonder|reflect|maybe|perhap|understand|realiz|notic|aware|meani|ponder|contemplat|curious|lesson|grow|growth|learn|insight|wisdom|mindful)\b/,'reflective');
  scoreMood(/\b(hope|believe|better|forward|excited|optimis|potential|possib|confident|bright|progress|stronger|heal|recover|faith|aspire|dream|purpose|motivat)\b/,'hopeful');
  if (t.match(/\b(okay|fine|alright|normal|neutral|nothing|whatever|average|mediocre)\b/g)) scores.reflective += 1;
  if (words.length < 5) scores.reflective += 1;
  scores.reflective += Math.min(3, Math.floor(words.length / 50));
  var max = 'reflective', maxScore = 0;
  for (var k in scores) { if (scores[k] > maxScore) { maxScore = scores[k]; max = k; } }
  if (maxScore === 0) { var moods = ['reflective','hopeful','mixed']; max = moods[Math.floor(Math.random()*moods.length)]; }
  if (max === 'happy' && scores.grateful > 0) { var r = Math.random(); if (r < 0.4) max = 'grateful'; }
  if (scores.sad > 0 && scores.angry > 0 && scores.sad + scores.angry > maxScore * 0.6) max = 'mixed';
  if (scores.anxious > 0 && scores.sad > 0 && scores.anxious + scores.sad > maxScore * 0.6) max = 'mixed';
  return { primary: max, scores: scores };
}

var ART_REFLECTIONS = {
  sad: [
    "I'm reminded of Anthony Hopkins  he was a severe alcoholic for decades until 1975 when he realized he was going to die if he didn't stop. He's been sober for over 45 years. What got him through was something simple: he stopped putting himself in situations where he'd be tempted. He built a new life instead of trying to fit recovery into his old one. My advice for you: when sadness hits, don't fight it alone. Change your environment, even if it's just moving to a different room. And remember  Hopkins won two Oscars after getting sober. Your best chapters aren't behind you.",
    "Demi Lovato nearly died from a heroin overdose in 2018. They went to rehab multiple times, relapsed, and kept going anyway. What they've said is key: 'Recovery is not a straight line.' When sadness makes you feel like you've failed, you haven't. You're still here. Still trying. That's what matters. Try this: write down one small thing you did today that took courage. Even getting out of bed counts. Demi's still standing. So are you.",
    "Brad Pitt hit rock bottom with alcohol in 2016. He joined AA, but he also found a surprising outlet: sculpting. He started working with clay because it forced him to be present with his hands. When words won't come, do something physical. Sculpt, draw, run, clean  anything that gets you out of your head and into your body. The sadness will still be there when you're done, but it'll feel more manageable. Pitt says art saved him. Find your version of that.",
    "Robert Downey Jr. spent years in and out of prison, lost every job, was completely written off by Hollywood. He said the turning point was realizing he couldn't do it alone. He needed structure, accountability, and people who believed in him before he believed in himself. When you're in a dark place, your instinct is to isolate. That's the addiction talking. Reach out to someone  your partner, a friend, a helpline. Downey's been sober since 2003. He didn't do it alone, and neither should you."
  ],
  angry: [
    "Samuel L. Jackson struggled with cocaine and heroin addiction in the 80s. He was a functioning addict, but his daughter walked in on him in a bad state, and that was his wake-up call. He got clean in 1990 and channeled that anger into his work. He became one of the most iconic actors in history. Here's what I'd suggest: your anger is fuel. Don't suppress it  direct it. Write the angry letter (don't send it), do a brutal workout, clean your space aggressively. Let the fire work for you, not against you.",
    "Macklemore nearly died from a prescription pill overdose in his 20s. He got clean, won Grammys, and then relapsed after his biggest success. He said the pressure and emotions were too much. What he learned: anger at yourself is the most dangerous kind. When you feel fury rising, pause and ask: 'Who is this really about? What am I actually afraid of?' Macklemore got back on track by being honest  publicly, painfully honest. Your anger is a messenger. Listen to what it's saying.",
    "Russell Brand was a severe heroin addict who was arrested multiple times. He described his anger as a spiritual crisis, not a moral failing. His advice: when you're furious, don't act. Sit with the feeling for 10 minutes. If it's still there after 10 minutes, give it another 10. He said the impulse to destroy passes if you let it. Try this right now: tense every muscle in your body as hard as you can for 5 seconds, then release completely. Feel the difference. That's what anger needs  release, not reaction.",
    "Steve-O from Jackass was in and out of institutions, completely out of control. His Jackass co-stars staged an intervention that saved his life. He's been sober since 2008 and graduated college. His secret? He stopped hanging around people who used. He changed his phone number. He moved. When anger tempts you to go back to old places and old people, remember: you can't heal in the environment that made you sick. Create distance, even if it's uncomfortable."
  ],
  anxious: [
    "Elton John struggled with anxiety so severe he'd binge and purge, abuse cocaine, and couldn't be alone. His turning point came from a surprising place  a young boy named Ryan whose mother had died told him 'I love you' during a meeting at rehab, and it broke something open in him. He's been sober since 1990. His advice: find one person you can be completely honest with. One person who knows the worst of you and isn't going anywhere. Anxiety thrives in secrecy. Shine a light on it.",
    "Jamie Lee Curtis became addicted to opioids after a minor cosmetic surgery and hid it for 10 years. She said the anxiety of keeping the secret was worse than the addiction itself. She quit cold turkey in 1999 and has been sober for over 20 years. Her advice: when anxious thoughts spiral, name exactly what you're afraid of. Write it down. Once it's on paper, ask yourself: 'Is this a real threat or is my brain protecting me from something that already passed?' Most of the time, it's the latter.",
    "Matthew Perry was taking 55 Vicodin a day at his worst, while filming Friends. His anxiety was so crippling he couldn't enjoy his success. His advice: when the fear feels unbearable, help someone else. Perry found that getting out of his own head by being useful to others was the only thing that quieted the noise. Call someone who's struggling. Make them a cup of tea. Send a check-in text. Shifting focus outward is the fastest way to calm an anxious mind.",
    "Eminem nearly died from a methadone overdose in 2007. He said the anxiety was overwhelming  he couldn't sleep, couldn't trust himself. What saved him was running. He started running every single day, sometimes for hours. It gave his mind something physical to focus on. Try this: the next time anxiety spikes, move your body for 5 minutes. Jumping jacks, a brisk walk, anything that raises your heart rate. You can't be in fight-or-flight and process anxiety at the same time. Let the body burn it off."
  ],
  happy: [
    "You know what Terry Crews said about joy? He said after getting through pornography addiction and rebuilding his marriage, he realized happiness isn't a destination  it's permission you give yourself. You're feeling good right now. Don't question it. Don't wait for the other shoe to drop. Just let yourself have this moment. Terry's advice: celebrate the small wins openly. Tell someone. Write it down. The more you acknowledge joy, the more it grows.",
    "Curtis Mayfield kept writing music even after he was paralyzed. He couldn't move his body, but he kept creating. Joy isn't about perfect circumstances  it's about finding the note that still rings true. You have something beautiful today. My advice: share it. Call one person and tell them something good. Happiness compounds when you spread it around. You earned this feeling. Let it land.",
    "Lizzo didn't become a star until her 30s. She spent years struggling with body image, depression, and being told she wasn't good enough. Now she's one of the biggest artists in the world. Her message: joy is an act of resistance. When you're feeling good, you're proving the darkness wrong. My advice to you: bottle this moment. Take a screenshot, write a note, save a voice memo. On days when happiness feels impossible, you'll have proof that it's real."
  ],
  grateful: [
    "Studies on gratitude show that people who write down 3 things they're grateful for every day for 21 days rewire their brains to notice the positive more readily. It's not toxic positivity  it's neural training. Here's my advice: grab your journal and list 3 specific things from today. Not generic  specific. 'That first sip of coffee' or 'the way the light hit the wall.' Train your brain to collect moments, not just memories.",
    "A Vietnam veteran who survived as a POW for 7 years was asked how he got through it. He said every night he listed one thing he was grateful for. Some nights it was just 'I'm still alive.' That practice became the foundation of his mental health for the rest of his life. My advice: gratitude isn't toxic positivity  it's survival technology. Use it.",
    "Nick Vujicic was born without arms or legs. He has every reason to feel bitter, but he built a worldwide ministry on gratitude and hope. He says: 'If you're grateful for what you have, you'll always have enough.' My advice: take what you just wrote about feeling grateful for and share it with someone. Gratitude grows when you express it outward."
  ],
  reflective: [
    "Viktor Frankl survived Nazi concentration camps and wrote 'Man's Search for Meaning.' He said: 'Between stimulus and response there is a space. In that space is our power to choose our response.' You're in that space right now  reflecting instead of reacting. That's everything. My advice: don't rush to conclusions tonight. Let the questions sit. Real insight comes when you stop chasing it.",
    "Marcus Aurelius was a Roman emperor who spent his evenings writing private reflections. His journal, 'Meditations', is still read 2,000 years later. He wrote: 'The happiness of your life depends upon the quality of your thoughts.' My advice: you're doing what the wisest people in history did  you're examining your own mind. Keep going. The answers come slowly, but they come.",
    "Carl Jung said 'Until you make the unconscious conscious, it will direct your life and you will call it fate.' Reflection is how you bring darkness into light. My advice: take one theme from your writing tonight and ask yourself  'When did I first learn this about myself?' Trace it back. The origin story holds the key."
  ],
  hopeful: [
    "Nelson Mandela spent 27 years in prison. He could have emerged bitter and broken. Instead, he said: 'I am not afraid of storms, for I am learning how to sail my ship.' Hope was a choice he made every single day. My advice: let this hope you're feeling be a compass, not just a feeling. Set one small goal for tomorrow that points in the direction of the person you want to become.",
    "Malala Yousafzai was shot in the head by the Taliban for going to school. She survived, and at 17 became the youngest Nobel Prize winner. She said: 'One child, one teacher, one book, one pen  can change the world.' Hope doesn't need to be big. It just needs to be real. My advice: write down one specific thing you're hopeful about right now. Read it out loud. Hope becomes real when you give it a voice.",
    "Stephen King was so addicted to alcohol and cocaine that he doesn't remember writing 'Cujo.' His wife and friends staged an intervention. He got clean in the late 80s and went on to write some of his best work after sobriety. He said: 'Stopping drinking and drugs didn't make me a better writer  it made me a person who could actually live.' Hope is not naive. It's practical. My advice: let this hope fuel one concrete action today. Even a text to a friend. Movement creates momentum.",
    "Elton John's been sober since 1990. He said: 'I finally realized that I was worth saving.' That realization was the turning point  not a magic cure, but a decision he had to make every day. Hope isn't about knowing it'll be okay. It's about deciding to act as if it will be, even when you're not sure. My advice: you're worth saving too. Act like it today."
  ],
  mixed: [
    "J.K. Rowling was a divorced single mother on welfare when she wrote the first Harry Potter book. She was depressed, broke, and constantly rejected by publishers. She said: 'Rock bottom became the solid foundation on which I rebuilt my life.' Having mixed feelings is normal when you're in transition. My advice: make a 'both/and' list. 'I'm scared AND I'm excited. I'm sad AND I'm growing.' Both can be true at once. That's not confusion  that's being alive.",
    "David Bowie reinvented himself constantly  from Ziggy Stardust to the Thin White Duke. He said: 'I don't know where I'm going from here, but I promise it won't be boring.' Mixed feelings mean you're in a period of change. My advice: embrace the messiness. You don't need to have one clear feeling. Let the different parts of you coexist. That's not weakness  it's range."
  ]
};

var ART_SUGGESTIONS = {
  sad: ["Try putting on a song that matches your mood and letting yourself feel it fully for 3 minutes.","Consider reaching out to someone you trust today  connection is medicine for sadness.","Make a small comfort ritual: tea, a blanket, and 10 minutes of doing absolutely nothing.","Write one thing you're grateful for, even if it feels hard. Sometimes gratitude is an act of rebellion.","Give yourself permission to rest. Sadness is exhausting. You don't need to be productive today."],
  angry: ["Try a physical release: 10 jumping jacks, a quick walk, or punch a pillow. Get it out of your body.","Write an unfiltered letter expressing everything you're angry about  then tear it up or delete it.","Take 5 sharp exhales (in through nose, HA out through mouth). It releases tension fast.","Name what specific boundary might have been crossed. Your anger is a compass  what's it pointing to?","Listen to something loud and let yourself move. Your body needs to process this energy."],
  anxious: ["Try 5-4-3-2-1 grounding right now: 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.","Box breathing: Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times.","Write down what's worrying you, then ask: 'Is this in my control?' If not, try to release it.","Put your hand on your heart and say: 'I am safe right now, in this moment.'","Listen to calming music and focus only on the melody for a few minutes."],
  happy: ["Capture this moment  write down exactly what made you feel good so you can return to it later.","Share your joy with someone today. Happiness multiplies when shared.","Do one thing to extend this feeling: play your favorite song, go outside, or call someone you love.","You built this moment. Acknowledge your role in creating your own happiness."],
  grateful: ["Write down 3 more things you're grateful for right now. Build that list.","Share your gratitude with someone who made a difference in your life today.","Take a mental photograph of this moment. You can revisit it anytime you need light."],
  reflective: ["Take what you've learned today and set one small intention for tomorrow.","Journaling is processing  you're doing the work. Trust the process.","Consider what pattern you notice in your reflections. What is your heart telling you?"],
  hopeful: ["Set one small goal for tomorrow that aligns with the hope you're feeling.","Share your hope with someone who might need to borrow some.","Write a letter to your future self about this moment of hope."],
  mixed: ["Try listing out each feeling you notice on separate lines. Sometimes naming them helps.","Take a walk without music or podcasts. Let your mind sort through things naturally.","Do something kind for yourself today  you're carrying a lot and you deserve care."]
};

var MOTIVATION_POOL = [
  {q:'"The comeback is always stronger than the setback."', p:'Serena Williams', c:'Sports', m:'sad', t:'She returned to tennis after a pulmonary embolism and won multiple Grand Slams.'},
  {q:'"Champions keep playing until they get it right."', p:'Billie Jean King', c:'Sports', m:'angry', t:'39 Grand Slam titles and a lifetime fighting for equality.'},
  {q:'"The only way out is through."', p:'Robert Frost', c:'Literature', m:'anxious', t:'One of America\'s most celebrated poets, writing about perseverance.'},
  {q:'"I can accept failure, everyone fails at something. But I can\'t accept not trying."', p:'Michael Jordan', c:'Sports', m:'sad', t:'Cut from his high school varsity team, became the greatest basketball player ever.'},
  {q:'"Our greatest glory is not in never falling, but in rising every time we fall."', p:'Confucius', c:'History', m:'sad', t:'Ancient Chinese philosopher whose teachings shaped Eastern thought for millennia.'},
  {q:'"Do not pray for an easy life, pray for the strength to endure a difficult one."', p:'Bruce Lee', c:'Pop Culture', m:'angry', t:'Martial artist and actor who overcame racism to become a global icon.'},
  {q:'"Hope is the thing with feathers that perches in the soul."', p:'Emily Dickinson', c:'Literature', m:'hopeful', t:'One of America\'s greatest poets, who wrote most of her 1,800 poems in solitude.'},
  {q:'"It does not matter how slowly you go as long as you do not stop."', p:'Confucius', c:'History', m:'reflective', t:'A reminder from 2,500 years ago that consistency matters more than speed.'},
  {q:'"Nothing in life is to be feared, it is only to be understood."', p:'Marie Curie', c:'History', m:'anxious', t:'First woman to win a Nobel Prize, discovered radium while facing constant adversity.'},
  {q:'"First they ignore you, then they laugh at you, then they fight you, then you win."', p:'Mahatma Gandhi', c:'History', m:'angry', t:'Led India\'s independence through nonviolent resistance.'},
  {q:'"Success is not final, failure is not fatal: it is the courage to continue that counts."', p:'Winston Churchill', c:'History', m:'sad', t:'Led Britain through WWII while battling his own depression, which he called his "black dog."'},
  {q:'"If you\'re going through hell, keep going."', p:'Winston Churchill', c:'History', m:'anxious', t:'Short, direct, and brutally honest  perfectly capturing how to survive hard times.'},
  {q:'"It always seems impossible until it\'s done."', p:'Nelson Mandela', c:'History', m:'hopeful', t:'27 years in prison, then became South Africa\'s first Black president.'},
  {q:'"I am not afraid of storms, for I am learning how to sail my ship."', p:'Louisa May Alcott', c:'Literature', m:'reflective', t:'Wrote "Little Women" while struggling with poverty and family responsibilities.'},
  {q:'"Whether you think you can or you think you can\'t, you\'re right."', p:'Henry Ford', c:'History', m:'reflective', t:'Revolutionized manufacturing and proved that mindset determines outcome.'},
  {q:'"The man who moves a mountain begins by carrying away small stones."', p:'Confucius', c:'History', m:'hopeful', t:'Every big change starts with tiny, consistent actions.'},
  {q:'"Be the change that you wish to see in the world."', p:'Mahatma Gandhi', c:'History', m:'hopeful', t:'Often quoted, harder to live  but it starts with one person choosing differently.'},
  {q:'"Float like a butterfly, sting like a bee. Your hands can\'t hit what your eyes can\'t see."', p:'Muhammad Ali', c:'Sports', m:'angry', t:'The Greatest  three-time world heavyweight champion and cultural icon.'},
  {q:'"The fight is won or lost far away from witnesses  behind the lines, in the gym, and out there on the road."', p:'Muhammad Ali', c:'Sports', m:'reflective', t:'Victory is built in private long before it\'s seen in public.'},
  {q:'"Fall seven times, stand up eight."', p:'Japanese Proverb', c:'History', m:'sad', t:'Ancient wisdom that resilience is simply outlasting your defeats.'},
  {q:'"The only person you are destined to become is the person you decide to be."', p:'Ralph Waldo Emerson', c:'Literature', m:'reflective', t:'American transcendentalist who believed in self-reliance and personal growth.'},
  {q:'"Yesterday is not ours to recover, but tomorrow is ours to win or lose."', p:'Lyndon B. Johnson', c:'History', m:'sad', t:'36th U.S. President, on the importance of forward momentum.'},
  {q:'"There is no passion to be found playing small  in settling for a life that is less than the one you are capable of living."', p:'Nelson Mandela', c:'History', m:'hopeful', t:'A call to step into your full potential.'},
  {q:'"Just keep swimming."', p:'Dory (Finding Nemo)', c:'Pop Culture', m:'anxious', t:'A blue tang fish with short-term memory loss teaching us all about perseverance.'},
  {q:'"Why do we fall? So that we can learn to pick ourselves up."', p:'Thomas Wayne (Batman Begins)', c:'Pop Culture', m:'sad', t:'Even fictional wisdom knows that failure is part of the process.'},
  {q:'"The flower that blooms in adversity is the most rare and beautiful of all."', p:'Emperor (Mulan)', c:'Pop Culture', m:'hopeful', t:'A Disney emperor channeling ancient philosophy  growth comes through struggle.'},
  {q:'"I\'ll be back."', p:'Arnold Schwarzenegger (The Terminator)', c:'Pop Culture', m:'angry', t:'The most famous comeback line in movie history. Sometimes you just have to say it.'},
  {q:'"It\'s not about how hard you hit. It\'s about how hard you can get hit and keep moving forward."', p:'Rocky Balboa', c:'Pop Culture', m:'sad', t:'Sylvester Stallone wrote this  and lived it. He was broke and unknown before Rocky.'},
  {q:'"Oh yes, the past can hurt. But the way I see it, you can either run from it or learn from it."', p:'Rafiki (The Lion King)', c:'Pop Culture', m:'reflective', t:'A wise baboon with the best advice in animated history.'},
  {q:'"Fear is the path to the dark side."', p:'Yoda (Star Wars)', c:'Pop Culture', m:'anxious', t:'The Jedi master reminding us that fear leads to suffering  but awareness of fear is the first step.'},
  {q:'"Do. Or do not. There is no try."', p:'Yoda (Star Wars)', c:'Pop Culture', m:'reflective', t:'Commit fully. Half-measures don\'t move mountains.'},
  {q:'"You miss 100% of the shots you don\'t take."', p:'Wayne Gretzky', c:'Sports', m:'hopeful', t:'The NHL\'s all-time leading scorer on the importance of taking chances.'},
  {q:'"Pain is temporary. Quitting lasts forever."', p:'Lance Armstrong', c:'Sports', m:'angry', t:'Controversial figure, but the quote stands  discomfort passes, regret lingers.'},
  {q:'"Hard work beats talent when talent doesn\'t work hard."', p:'Tim Notke', c:'Sports', m:'reflective', t:'A high school coach\'s words that became legendary in sports culture.'},
  {q:'"Winning isn\'t everything, but wanting to win is."', p:'Vince Lombardi', c:'Sports', m:'hopeful', t:'The drive matters more than the outcome.'},
  {q:'"Don\'t let what you cannot do interfere with what you can do."', p:'John Wooden', c:'Sports', m:'anxious', t:'Legendary UCLA coach who won 10 NCAA championships with this philosophy.'},
  {q:'"Down 28 with 6 minutes left? That\'s when legends wake up."', p:'Caleb Williams', c:'Sports', m:'hopeful', t:'Led the Chicago Bears to one of the greatest comebacks in franchise history against the Green Bay Packers. When everyone counted him out, he kept slinging. Some fights aren\'t about the score  they\'re about who refuses to quit.'},
  {q:'"They had us dead to rights. But the game\'s not over until the clock hits zero."', p:'Caleb Williams', c:'Sports', m:'angry', t:'The Bears QB engineered a miracle comeback vs the Packers, proving that no deficit is too big when you keep believing. Recovery is the same  it doesn\'t matter how far behind you feel, you\'re still in the game.'},
  {q:'"Bear down. That\'s all you can do."', p:'Caleb Williams', c:'Sports', m:'reflective', t:'Sometimes the simplest advice hits hardest. When everything\'s falling apart, you just... bear down. Keep playing. The next play could change everything.'},
  {q:'"Pressure is a privilege."', p:'Billie Jean King', c:'Sports', m:'anxious', t:'She knew pressure meant you were in a position to make a difference  and she won 39 Grand Slams by embracing it.'},
  {q:'"You have to expect things of yourself before you can do them."', p:'Michael Jordan', c:'Sports', m:'hopeful', t:'Jordan didn\'t just believe in his talent  he believed in his capacity to grow, and that made him unstoppable.'},
  {q:'"It\'s not whether you get knocked down, it\'s whether you get up."', p:'Vince Lombardi', c:'Sports', m:'sad', t:'The Hall of Fame coach knew that resilience matters more than perfection. Every single time you get back up, you win.'},
  {q:'"The only one who can tell you \'you can\'t\' is you. And you don\'t have to listen."', p:'Serena Williams', c:'Sports', m:'angry', t:'Serena faced doubters her entire career and turned their noise into fuel. 23 Grand Slams later, the proof is in the results.'},
  {q:'"Excellence is not a singular act, but a habit. You are what you repeatedly do."', p:'Shaquille O\'Neal', c:'Sports', m:'reflective', t:'Shaq dominated through consistency, not flash. He showed up, did the work, and let the results speak. Recovery works the same way.'},
  {q:'"There is no substitute for hard work."', p:'Thomas Edison', c:'History', m:'reflective', t:'The inventor of the light bulb failed thousands of times before he got it right. He didn\'t see failure  he saw 10,000 ways that didn\'t work.'},
  {q:'"The best time to plant a tree was 20 years ago. The second best time is now."', p:'Chinese Proverb', c:'History', m:'hopeful', t:'Regret about the past won\'t change it, but action today will shape your future. Start where you stand.'},
  {q:'"Courage is not the absence of fear, but rather the judgment that something is more important than fear."', p:'Ambrose Redmoon', c:'Literature', m:'anxious', t:'Real courage isn\'t being unafraid  it\'s feeling the fear and choosing to move forward anyway.'},
  {q:'"What lies behind us and what lies before us are tiny matters compared to what lies within us."', p:'Ralph Waldo Emerson', c:'Literature', m:'reflective', t:'Emerson reminds us that our inner strength dwarfs both past regrets and future worries. You already have what you need.'},
  {q:'"Creativity takes courage."', p:'Henri Matisse', c:'Art', m:'anxious', t:'Matisse revolutionized art while battling illness and self-doubt. He kept creating from his bed when he could no longer stand at an easel.'},
  {q:'"I am seeking. I am striving. I am in it with all my heart."', p:'Vincent van Gogh', c:'Art', m:'sad', t:'Van Gogh created some of history\'s most beloved paintings while struggling deeply. His work reminds us that beauty can come from pain.'},
  {q:'"Every child is an artist. The problem is how to remain an artist once we grow up."', p:'Pablo Picasso', c:'Art', m:'reflective', t:'Picasso never lost his sense of wonder. He kept experimenting, failing, and reinventing himself across 70 years of creative work.'},
  {q:'"The purpose of art is washing the dust of daily life off our souls."', p:'Pablo Picasso', c:'Art', m:'hopeful', t:'Art isn\'t decoration  it\'s medicine for the mind. Find something beautiful today, even if it\'s just a sunset or a song.'},
  {q:'"I\'ve missed more than 9,000 shots in my career. I\'ve lost almost 300 games. 26 times I\'ve been trusted to take the game-winning shot and missed. I\'ve failed over and over again in my life. And that is why I succeed."', p:'Michael Jordan', c:'Sports', m:'sad', t:'The greatest basketball player of all time frames his success entirely through his failures. Every miss taught him something. Every loss made him work harder.'},
  {q:'"Tomorrow, is the first blank page of a 365-page book. Write a good one."', p:'Brad Paisley', c:'Pop Culture', m:'hopeful', t:'Country music\'s reminder that every day is a fresh start. The page is blank  what story will you tell?'},
  {q:'"The way I see it, every life is a pile of good things and bad things. The good things don\'t always soften the bad things, but vice versa, the bad things don\'t necessarily spoil the good things or make them unimportant."', p:'The Doctor (Doctor Who)', c:'Pop Culture', m:'mixed', t:'A timeless reminder from a fictional time traveler that life is both good and bad  and that\'s okay. Both are real, both matter, and both make you who you are.'},
  {q:'"Even the smallest person can change the course of the future."', p:'Galadriel (Lord of the Rings)', c:'Pop Culture', m:'hopeful', t:'From a hobbit who carried the fate of Middle-earth to anyone fighting their own battle  size and strength aren\'t what matter. Heart is.'},
  {q:'"It\'s the job that\'s never started as takes longest to finish."', p:'Samwise Gamgee (Lord of the Rings)', c:'Pop Culture', m:'reflective', t:'Samwise, the loyal heart of the Fellowship, knew that procrastination is heavier than any task. Starting  even small  is the hardest and most important step.'},
  {q:'"Happiness can be found even in the darkest of times, if one only remembers to turn on the light."', p:'Albus Dumbledore (Harry Potter)', c:'Pop Culture', m:'sad', t:'Dumbledore\'s wisdom cuts to the core of recovery  the light is already there. You just have to remember to flip the switch.'},
  {q:'"It does not do to dwell on dreams and forget to live."', p:'Albus Dumbledore (Harry Potter)', c:'Pop Culture', m:'reflective', t:'Dreams give us direction, but life happens in the present. Don\'t wait for a perfect future  engage with today.'},
  {q:'"We are what we repeatedly do. Excellence, then, is not an act, but a habit."', p:'Aristotle', c:'History', m:'reflective', t:'One of history\'s greatest thinkers on the power of consistency. Small daily actions build the life you want.'},
  {q:'"He who has a why to live for can bear almost any how."', p:'Friedrich Nietzsche', c:'History', m:'hopeful', t:'Nietzsche understood that purpose is the ultimate painkiller. When you know your reason, you can endure almost anything.'},
  {q:'"The greatest glory in living lies not in never falling, but in rising every time we fall."', p:'Nelson Mandela', c:'History', m:'sad', t:'Mandela rose from 27 years in prison to lead a nation. His life is a monument to the power of refusing to stay down.'},
  {q:'"If not me, who? If not now, when?"', p:'Hillel the Elder', c:'History', m:'hopeful', t:'A first-century rabbi\'s call to personal responsibility. Waiting for someone else to fix things? You are someone. Waiting for the right time? It\'s now.'},
  {q:'"It is during our darkest moments that we must focus to see the light."', p:'Aristotle Onassis', c:'History', m:'anxious', t:'When everything feels darkest, the smallest light becomes visible. Look for it  it\'s there, even if it\'s faint.'},
  {q:'"You cannot swim for new horizons until you have courage to lose sight of the shore."', p:'William Faulkner', c:'Literature', m:'anxious', t:'Faulkner knew that growth requires leaving comfort behind. The shore is safe, but the horizon is where life happens.'},
  {q:'"The strongest of all warriors are these two  Time and Patience."', p:'Leo Tolstoy', c:'Literature', m:'reflective', t:'Tolstoy reminds us that healing and growth don\'t happen overnight. Give yourself the gift of time.'},
  {q:'"Art is not what you see, but what you make others see."', p:'Edgar Degas', c:'Art', m:'reflective', t:'Impressionist painter Degas captured fleeting moments of beauty. Sometimes the smallest observation can shift your entire perspective.'},
  {q:'"I found I could say things with color and shapes that I couldn\'t say any other way  things I had no words for."', p:'Georgia O\'Keeffe', c:'Art', m:'sad', t:'The mother of American modernism used art to process what words couldn\'t hold. Journaling can be that outlet for you too.'},
  {q:'"If you hear a voice within you say \'you cannot paint,\' then by all means paint, and that voice will be silenced."', p:'Vincent van Gogh', c:'Art', m:'angry', t:'Van Gogh painted his doubt into submission. When your inner critic says you can\'t, prove it wrong by doing it anyway.'},
  {q:'"Whether you\'re a king or a janitor, everyone has to wash their own underwear."', p:'Mark Cuban', c:'Motivation', m:'reflective', t:'A billionaire who started with nothing, sleeping on a friend\'s floor. Success doesn\'t exempt you from the basics  and neither does failure.'},
  {q:'"Don\'t let yesterday take up too much of today."', p:'Will Rogers', c:'Motivation', m:'sad', t:'The cowboy philosopher\'s simple truth  yesterday\'s weight will crush today if you let it. Put it down.'},
  {q:'"The secret of getting ahead is getting started."', p:'Mark Twain', c:'Motivation', m:'hopeful', t:'Twain\'s wry wisdom cuts through all the planning and procrastination. The only step that matters is the first one.'},
  {q:'"If you\'re not making mistakes, then you\'re not making anything."', p:'Unknown', c:'Motivation', m:'reflective', t:'Perfectionism is the enemy of progress. Mistakes aren\'t failures  they\'re the tuition you pay for growth.'},
  {q:'"When life gives you lemons, make lemonade. Then find someone whose life gave them vodka and have a party."', p:'Unknown', c:'Motivation', m:'happy', t:'A playful reminder that community multiplies what you have. You don\'t have to do this alone  and the combination of your strengths with others\' creates something neither of you could build alone.'},
  {q:'"Comparison is the thief of joy."', p:'Theodore Roosevelt', c:'History', m:'anxious', t:'TR knew that measuring your insides against others\' outsides is a losing game. Your journey is yours alone  run your race.'},
  {q:'"Believe you can and you\'re halfway there."', p:'Theodore Roosevelt', c:'History', m:'hopeful', t:'The 26th president, who overcame asthma and personal tragedy through sheer force of will, understood that mindset is half the battle.'},
  {q:'"Do what you can, with what you have, where you are."', p:'Theodore Roosevelt', c:'History', m:'anxious', t:'When you feel overwhelmed, this is the antidote. Not everything. Not perfectly. Just what you can, with what you have, right here.'},
  {q:'"There are no shortcuts to any place worth going."', p:'Beverly Sills', c:'Motivation', m:'reflective', t:'The legendary opera singer knew that mastery  in art, in recovery, in life  demands patience. The long road is the only road that gets you there.'},
  {q:'"Go the extra mile. It\'s never crowded."', p:'Unknown', c:'Motivation', m:'hopeful', t:'Most people stop when things get hard. That\'s exactly when the field clears and the path opens for those who keep going.'},
  {q:'"Stars can\'t shine without darkness."', p:'Unknown', c:'Motivation', m:'hopeful', t:'Hard times aren\'t just obstacles  they\'re the backdrop that makes your light visible. You wouldn\'t know you were strong without something to push against.'},
  {q:'"What are your choices when someone puts a gun to your head? You take the gun, or you pull out a bigger one. Or you call their bluff. Or you do any one of a hundred and forty-six other things."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'angry', t:'Harvey\'s philosophy: there\'s always a move you haven\'t considered. When you feel cornered by a craving or a trigger, remember you have more options than you think.'},
  {q:'"I don\'t have dreams, I have goals."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'hopeful', t:'Harvey doesn\'t wait for things to happen  he makes them happen. Turn your recovery wishes into actionable goals, and chase them like he chases a win.'},
  {q:'"When you\'re backed against the wall, break the goddamn thing down."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'angry', t:'Harvey at his most relentless. When recovery feels impossible, when the cravings feel unbearable  don\'t just survive it. Destroy the wall.'},
  {q:'"The only time you look back is to see how far you\'ve come."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'reflective', t:'Harvey doesn\'t dwell on the past  he uses it as fuel. Your past struggles aren\'t a weight, they\'re proof of how much ground you\'ve already covered.'},
  {q:'"Sometimes the best way to win is to not play the game at all."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'reflective', t:'Harvey knows picking your battles is a skill. Not every trigger needs to be fought  some just need to be walked away from.'},
  {q:'"I\'m not about to let a setback turn me into someone I\'m not."', p:'Mike Ross (Suits)', c:'Pop Culture', m:'sad', t:'Mike carried a secret that could have destroyed him, but he refused to let it define who he was becoming. A setback is a chapter, not the whole story.'},
  {q:'"Winning isn\'t everything, but wanting to win is."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'hopeful', t:'Harvey lives by the drive, not just the result. In recovery, the desire to get better is already half the battle won.'},
  {q:'"Don\'t let the bastards grind you down."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'angry', t:'Harvey\'s blunt advice for when life keeps throwing punches. Keep standing. Keep fighting. They can\'t break what you won\'t let them.'},
  {q:'"It\'s not about how many times you get knocked down. It\'s about how many times you get back up."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'sad', t:'Harvey channeling classic wisdom with his signature edge. Fall down seven times, stand up eight  and make it look good.'},
  {q:'"What kind of man talks to his therapist? Any man who\'s smart enough to know he needs one."', p:'Dr. Jennifer Melfi (The Sopranos)', c:'Pop Culture', m:'reflective', t:'Dr. Melfi knew that the toughest men are often the ones most afraid to look inward. Real strength is admitting you need help and showing up for it.'},
  {q:'"Sometimes I go about in pity for myself, and all the while a great wind carries me across the sky."', p:'Sopranos  Ojibwe Saying', c:'Pop Culture', m:'sad', t:'Tony\'s therapist shared this Native American saying that hit him harder than any lecture. You\'re being carried even when you can\'t feel the wind.'},
  {q:'"If you can\'t do it with the people you love, you can\'t do it at all."', p:'Carmela Soprano (The Sopranos)', c:'Pop Culture', m:'reflective', t:'Carmela understood that success means nothing if you destroy the relationships around you to get it. Recovery isn\'t just about you  it\'s about who you come home to.'},
  {q:'"You ever feel like nothing good was ever gonna happen to you? Yeah. And nothing bad was ever gonna end."', p:'Tony Soprano (The Sopranos)', c:'Pop Culture', m:'anxious', t:'Tony\'s moments of brutal honesty cut through the bravado. That feeling of endless darkness is real  but it\'s a feeling, not a fact. It ends.'},
  {q:'"What you gonna do? Accept the consequences."', p:'Tony Soprano (The Sopranos)', c:'Pop Culture', m:'reflective', t:'Tony at his most philosophical  every action has a cost. Recovery means owning your choices and deciding what kind of person you want to be going forward.'},
  {q:'"In the end, you\'re alone with your choices."', p:'Tony Soprano (The Sopranos)', c:'Pop Culture', m:'reflective', t:'Tony\'s grim truth about accountability. No one else can make your recovery decisions for you. You choose. Every single day.'},
  {q:'"A wrong decision is better than indecision."', p:'Harvey Specter (Suits)', c:'Pop Culture', m:'anxious', t:'Harvey on the paralysis of overthinking. Sometimes you just have to pick a direction and move. Standing still is the only real mistake.'},
  {q:'"Success is not about how much money you make. It\'s about the difference you make in people\'s lives."', p:'Michelle Obama', c:'Motivation', m:'hopeful', t:'The former First Lady redefines success around purpose and impact. Recovery isn\'t just about getting sober  it\'s about who you become and who you inspire along the way.'},
  {q:'"You are not a drop in the ocean. You are the entire ocean in a drop."', p:'Rumi', c:'Literature', m:'reflective', t:'The 13th-century Persian poet understood that each person contains infinite depth. Your recovery journey holds more power than you realize.'},
  {q:'"The wound is the place where the light enters you."', p:'Rumi', c:'Literature', m:'sad', t:'Rumi\'s most famous line reframes pain as a opening  not something to hide, but something that lets growth in.'},
  {q:'"Let the beauty of what you love be what you do."', p:'Rumi', c:'Literature', m:'hopeful', t:'Find what lights you up and let it guide your recovery. Purpose is the strongest anchor.'},
  {q:'"Yesterday I was clever, so I wanted to change the world. Today I am wise, so I am changing myself."', p:'Rumi', c:'Literature', m:'reflective', t:'The shift from fixing everything outside to working on yourself is the real turning point in recovery.'},
  {q:'"What you seek is seeking you."', p:'Rumi', c:'Literature', m:'hopeful', t:'The peace, purpose, and freedom you want in recovery are already moving toward you. Keep going.'},
  {q:'"Act as if what you do makes a difference. It does."', p:'William James', c:'History', m:'hopeful', t:'The father of American psychology knew that every small action ripples outward. Your choice today matters more than you know.'},
  {q:'"The greatest weapon against stress is our ability to choose one thought over another."', p:'William James', c:'History', m:'anxious', t:'You can\'t control every trigger, but you can choose which thoughts you feed. That\'s power.'},
  {q:'"A chain is only as strong as its weakest link."', p:'Proverb', c:'Motivation', m:'reflective', t:'Recovery is about strengthening every link  sleep, nutrition, connection, purpose. Identify your weakest link today and give it one minute of attention.'},
  {q:'"Smooth seas do not make skillful sailors."', p:'African Proverb', c:'History', m:'angry', t:'Every storm you weather in recovery makes you more capable. The hard days are the ones building your strength.'},
  {q:'"If you want to go fast, go alone. If you want to go far, go together."', p:'African Proverb', c:'History', m:'reflective', t:'Recovery is a long road. your partner, your sponsor, your community  they\'re not optional, they\'re how you go the distance.'},
  {q:'"When there is no enemy within, the enemies outside cannot hurt you."', p:'African Proverb', c:'History', m:'anxious', t:'The real battle is internal. When you make peace with yourself, external triggers lose their power.'},
  {q:'"However long the night, the dawn will break."', p:'African Proverb', c:'History', m:'sad', t:'No matter how dark things feel right now, this is not the end of the story. Dawn always comes.'},
  {q:'"The child who is not embraced by the village will burn it down to feel its warmth."', p:'African Proverb', c:'History', m:'sad', t:'Connection isn\'t a luxury  it\'s a survival need. If you\'re feeling isolated, reach out. Your village is waiting.'},
  {q:'"A man who uses force is afraid. A man who uses negotiation has learned. A man who uses dialogue is wise."', p:'African Proverb', c:'History', m:'reflective', t:'Real strength isn\'t aggression  it\'s communication. Talk to someone today.'},
  {q:'"The axe forgets but the tree remembers."', p:'African Proverb', c:'History', m:'sad', t:'The damage caused by addiction runs deep. But trees scar over and keep growing  and so do you.'},
  {q:'"To be humble is to be teachable. To be teachable is to grow."', p:'African Wisdom', c:'Motivation', m:'reflective', t:'Recovery demands humility  admitting you don\'t have all the answers. That openness is what lets you change.'},
  {q:'"Hold on to the power of your dreams. For if your dreams die, you are like a bird with broken wings."', p:'Maya Angelou', c:'Literature', m:'sad', t:'Angelou rose from unspeakable trauma to become one of the most powerful voices in American literature. Your dreams are your wings  don\'t let them go.'},
  {q:'"I\'ve learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel."', p:'Maya Angelou', c:'Literature', m:'reflective', t:'In recovery, your presence and kindness matter more than your perfection. How you show up for others is what lasts.'},
  {q:'"You may not control all the events that happen to you, but you can decide not to be reduced by them."', p:'Maya Angelou', c:'Literature', m:'angry', t:'You are bigger than what happened to you. Addiction tried to reduce you  every day you stay sober, you prove it wrong.'},
  {q:'"Success is liking yourself, liking what you do, and liking how you do it."', p:'Maya Angelou', c:'Literature', m:'hopeful', t:'Real success isn\'t money or status  it\'s being at peace with who you are. Recovery gives you that chance.'},
  {q:'"Courage is the most important of all the virtues because without courage you can\'t practice any other virtue consistently."', p:'Maya Angelou', c:'Literature', m:'anxious', t:'It takes courage to feel your feelings instead of numbing them. It takes courage to ask for help. You\'re already practicing courage by being here.'},
  {q:'"Every day may not be good, but there\'s something good in every day."', p:'Alice Morse Earle', c:'Motivation', m:'sad', t:'On the hard days, look for one small good thing  a warm cup of coffee, a kind text, a deep breath. It\'s there.'},
  {q:'"What lies behind us and what lies before us are tiny matters compared to what lies within us."', p:'Ralph Waldo Emerson', c:'Literature', m:'reflective', t:'Emerson\'s reminder: your past mistakes and future worries are small compared to the strength you carry inside.'},
  {q:'"We are what we pretend to be, so we must be careful about what we pretend to be."', p:'Kurt Vonnegut', c:'Literature', m:'reflective', t:'Vonnegut\'s paradox: act like the person you want to become long enough, and that\'s who you\'ll be. Fake it until you become it.'},
  {q:'"Everything was beautiful and nothing hurt."', p:'Kurt Vonnegut', c:'Literature', m:'hopeful', t:'A line from Slaughterhouse-Five that captures what recovery is working toward  a life where peace replaces pain.'},
  {q:'"We have to continually be jumping off cliffs and developing our wings on the way down."', p:'Kurt Vonnegut', c:'Literature', m:'anxious', t:'Starting recovery feels like jumping without a parachute. But you grow your wings as you fall  trust the process.'},
  {q:'"Be soft. Do not let the world make you hard. Do not let pain make you hate. Do not let bitterness steal your sweetness."', p:'Ijeoma Umebinyuo', c:'Literature', m:'angry', t:'Protect your softness. Addiction hardens, recovery softens. Stay gentle  it\'s not weakness, it\'s strength refined.'},
  {q:'"You are your best thing."', p:'Toni Morrison', c:'Literature', m:'hopeful', t:'Morrison distilled self-worth into four words. You are not your addiction, your mistakes, or your worst day. You are your best thing.'},
  {q:'"If there is a book that you want to read, but it hasn\'t been written yet, then you must write it."', p:'Toni Morrison', c:'Literature', m:'hopeful', t:'Your recovery story hasn\'t been written yet. Every day you\'re adding a new page. Make it one you\'d want to read.'},
  {q:'"Freeing yourself was one thing, claiming ownership of that freed self was another."', p:'Toni Morrison', c:'Literature', m:'reflective', t:'Getting sober is one step. Owning your new identity  that\'s the deeper work. You\'re not just free from something, you\'re free FOR something.'},
  {q:'"The function of freedom is to free someone else."', p:'Toni Morrison', c:'Literature', m:'reflective', t:'The final stage of recovery is helping others. Your story, your strength, your survival  it\'s not just for you. Share it.'},
  {q:'"I took a deep breath and listened to the old brag of my heart: I am, I am, I am."', p:'Sylvia Plath', c:'Literature', m:'hopeful', t:'Plath found power in the simple fact of existing. You are here. You are alive. That is enough.'},
  {q:'"We are all in the gutter, but some of us are looking at the stars."', p:'Oscar Wilde', c:'Literature', m:'hopeful', t:'Wilde\'s wit reminds us that your circumstances don\'t dictate your perspective. Even in hard times, look for the light.'},
  {q:'"I\'ve been through some terrible things in my life, some of which actually happened."', p:'Mark Twain', c:'Literature', m:'anxious', t:'Twain on the power of worry  most of what we fear never materializes. Your anxiety is lying to you about what\'s coming.'},
  {q:'"He had decided to live forever or die in the attempt."', p:'Joseph Heller', c:'Literature', m:'hopeful', t:'A gallows-humor summary of recovery: you\'re going to fight for your life with everything you have, and you might just make it.'}
];

var DAILY_SPARKS = [
  {type:'quote', q:'"Your sobriety is not a punishment. It\'s a gift you give yourself every single day."', p:'Unknown', c:'Recovery'},
  {type:'challenge', text:'Challenge: Write down 3 things you\'re grateful for right now. Don\'t think  just write.', c:'Challenge'},
  {type:'affirmation', text:'I am stronger than my cravings. They pass, and I remain.', c:'Affirmation'},
  {type:'tip', text:'Tip: Cravings last 15-30 minutes on average. When one hits, set a timer and do something else until it beeps.', c:'Tip'},
  {type:'quote', q:'"Recovery is not a race. You don\'t have to feel guilty if it takes you longer than you thought it would."', p:'Unknown', c:'Recovery'},
  {type:'challenge', text:'Challenge: Text or call someone you haven\'t talked to in a week. Just say hello.', c:'Challenge'},
  {type:'affirmation', text:'I am not my past. I am everything I\'ve survived and everything I\'m becoming.', c:'Affirmation'},
  {type:'tip', text:'Tip: Keep your hands busy during a craving  squeeze a stress ball, doodle, fold laundry, or wash dishes.', c:'Tip'},
  {type:'quote', q:'"The opposite of addiction is not sobriety. It is human connection."', p:'Johann Hari', c:'Recovery'},
  {type:'challenge', text:'Challenge: Take a 5-minute walk without your phone. Just notice what\'s around you.', c:'Challenge'},
  {type:'affirmation', text:'Healing is not linear. Some days I go backwards. That is not failure  that is part of the process.', c:'Affirmation'},
  {type:'tip', text:'Tip: The 5-4-3-2-1 grounding technique works fast: 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.', c:'Tip'},
  {type:'quote', q:'"You don\'t have to see the whole staircase, just take the first step."', p:'Martin Luther King Jr.', c:'History'},
  {type:'challenge', text:'Challenge: Make your bed. That\'s it. One small win to start the day.', c:'Challenge'},
  {type:'affirmation', text:'I am allowed to rest. Rest is not a setback  it\'s how I recharge for the next chapter.', c:'Affirmation'},
  {type:'tip', text:'Tip: Box breathing: Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 times. Instantly calms the nervous system.', c:'Tip'},
  {type:'quote', q:'"Sobriety was the greatest gift I ever gave myself. And I tried to return it so many times."', p:'Unknown', c:'Recovery'},
  {type:'challenge', text:'Challenge: Open the Coping Cards section and read one card. Just one.', c:'Challenge'},
  {type:'affirmation', text:'Every sober day is a day my future self will thank me for.', c:'Affirmation'},
  {type:'tip', text:'Tip: Urge surfing: Notice the craving without judgment. Observe it like a wave  it will rise, peak, and fall. You don\'t have to act.', c:'Tip'},
  {type:'quote', q:'"The time will pass anyway. You might as well spend it getting better."', p:'Unknown', c:'Motivation'},
  {type:'challenge', text:'Challenge: Do one thing today that future-you will be proud of. Even if it\'s small.', c:'Challenge'},
  {type:'affirmation', text:'I am exactly where I need to be. Not ahead, not behind  right on my own path.', c:'Affirmation'},
  {type:'tip', text:'Tip: HALT check: Hungry, Angry, Lonely, Tired. When a craving hits, ask yourself which one you are, and address that first.', c:'Tip'},
  {type:'challenge', text:'Challenge: Write a letter to yourself from 1 year in the future. What does that version of you want to say?', c:'Challenge'},
  {type:'affirmation', text:'My recovery is no one else\'s timeline. I go at my own pace, and that is perfectly okay.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Open your journal and write one sentence about today. One sentence is enough.', c:'Challenge'},
  {type:'affirmation', text:'I deserve to be happy, healthy, and free from addiction. I am worthy of recovery.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Drink a full glass of water right now. Your brain and body need it.', c:'Challenge'},
  {type:'tip', text:'Tip: If you\'re feeling a strong emotion, name it out loud. "I feel angry." Naming reduces its power over you.', c:'Tip'},
  {type:'affirmation', text:'My cravings do not control me. I acknowledge them, I breathe through them, and I let them go.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Close your eyes and take 5 deep breaths. In through the nose, out through the mouth. That\'s it.', c:'Challenge'},
  {type:'tip', text:'Tip: Music changes mood instantly. Make a playlist of songs that make you feel calm and powerful. Play it when you need a lift.', c:'Tip'},
  {type:'affirmation', text:'I am more than my addiction. I am a person with hopes, dreams, and a future.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Delete one thing from your phone that doesn\'t serve your recovery. A number, an app, a bookmark.', c:'Challenge'},
  {type:'tip', text:'Tip: Sunlight in the morning helps regulate dopamine and improves mood. Try 5 minutes outside before noon.', c:'Tip'},
  {type:'affirmation', text:'Progress, not perfection. I don\'t have to be perfect to be on the right path.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Smile at yourself in the mirror for 5 seconds. Feel how strange that is. Then feel how good it is.', c:'Challenge'},
  {type:'tip', text:'Tip: The two-minute rule: if a task takes less than 2 minutes, do it immediately. Reduces overwhelm and builds momentum.', c:'Tip'},
  {type:'quote', q:'"Whether you think you can or you think you can\'t, you\'re right."', p:'Henry Ford', c:'History'},
  {type:'affirmation', text:'I choose progress over perfection. Every small step forward counts.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Listen to one song all the way through without doing anything else. Just listen.', c:'Challenge'},
  {type:'tip', text:'Tip: Writing down worries before bed helps clear your mind for sleep. Keep a notebook by your bed.', c:'Tip'},
  {type:'affirmation', text:'I am building a life I don\'t need to escape from.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Tell one person today that you appreciate them. Be specific about why.', c:'Challenge'},
  {type:'quote', q:'"Fall seven times, stand up eight."', p:'Japanese Proverb', c:'History'},
  {type:'affirmation', text:'My past does not define me. Who I am becoming is what matters.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Open the Breathing Exercise in the Care section and do one round.', c:'Challenge'},
  {type:'tip', text:'Tip: Recovery is like fitness  you don\'t see results from one workout, but you do see them from showing up consistently.', c:'Tip'},
  {type:'affirmation', text:'I am doing the best I can with what I have. And that is enough.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Write down one thing you\'re looking forward to tomorrow.', c:'Challenge'},
  {type:'affirmation', text:'Every sober moment is a victory. Not every victory is visible, but every one counts.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Set an alarm for 3 hours from now. When it goes off, take 3 deep breaths and Check in with yourself.', c:'Challenge'},
  {type:'tip', text:'Tip: You can\'t think your way out of a feeling. Move your body  a walk, stretches, or dancing for 2 minutes shifts your state.', c:'Tip'},
  {type:'affirmation', text:'I am not alone. There are people who understand and want to help.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Send a message to your partner just saying "thinking of you."', c:'Challenge'},
  {type:'tip', text:'Tip: The STOP technique: Stop, Take a breath, Observe your thoughts, Proceed with intention.', c:'Tip'},
  {type:'affirmation', text:'Healing takes time. I give myself permission to take that time.', c:'Affirmation'},
  {type:'challenge', text:'Challenge: Identify one trigger you faced today and one thing you did (or could do) to handle it.', c:'Challenge'},
  {type:'quote', q:'"Have patience with all things, but first of all with yourself."', p:'Saint Francis de Sales', c:'Motivation'},
  {type:'tip', text:'Tip: If you\'re feeling stuck, change your environment. Move to a different room, go outside, or even just stand up and stretch.', c:'Tip'},
  // Scripture verses
  {type:'scripture', text:'"Come to me, all you who are weary and burdened, and I will give you rest."  Matthew 11:28', s:'Christianity  Bible'},
  {type:'scripture', text:'"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."  Isaiah 41:10', s:'Christianity  Bible'},
  {type:'scripture', text:'"Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go."  Joshua 1:9', s:'Christianity  Bible'},
  {type:'scripture', text:'"He heals the brokenhearted and binds up their wounds."  Psalm 147:3', s:'Christianity  Bible'},
  {type:'scripture', text:'"For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future."  Jeremiah 29:11', s:'Christianity  Bible'},
  {type:'scripture', text:'"The Lord is near to the brokenhearted and saves those who are crushed in spirit."  Psalm 34:18', s:'Christianity  Bible'},
  {type:'scripture', text:'"I can do all things through him who strengthens me."  Philippians 4:13', s:'Christianity  Bible'},
  {type:'scripture', text:'"With God all things are possible."  Matthew 19:26', s:'Christianity  Bible'},
  {type:'scripture', text:'"For God has not given us a spirit of fear, but of power and of love and of a sound mind."  2 Timothy 1:7', s:'Christianity  Bible'},
  {type:'scripture', text:'"Be still, and know that I am God."  Psalm 46:10', s:'Christianity  Bible'},
  {type:'scripture', text:'"In the name of God, the Most Gracious, the Most Merciful. Praise be to God, the Cherisher and Sustainer of the worlds."  Quran 1:1-2', s:'Islam  Quran'},
  {type:'scripture', text:'"So, verily, with every difficulty there is relief. Verily, with every difficulty there is relief."  Quran 94:5-6', s:'Islam  Quran'},
  {type:'scripture', text:'"God does not burden a soul beyond that it can bear."  Quran 2:286', s:'Islam  Quran'},
  {type:'scripture', text:'"And whoever puts their trust in God, He is sufficient for them."  Quran 65:3', s:'Islam  Quran'},
  {type:'scripture', text:'"And We have certainly made the Quran easy to remember. So is there anyone who will be mindful?"  Quran 54:17', s:'Islam  Quran'},
  {type:'scripture', text:'"Say: O my servants who have transgressed against their souls, do not despair of the mercy of God. Indeed, God forgives all sins."  Quran 39:53', s:'Islam  Quran'},
  {type:'scripture', text:'"And We will surely test you with something of fear, hunger, loss of wealth, lives, and fruits. But give good tidings to the patient."  Quran 2:155', s:'Islam  Quran'},
  {type:'scripture', text:'"Indeed, with hardship comes ease."  Quran 94:6', s:'Islam  Quran'},
  {type:'scripture', text:'"Have I not taken you through the night, given you the day to see? Every trial is a step closer to Me."  Quran 84:16-19 (interpretation)', s:'Islam  Quran'},
  {type:'scripture', text:'"The Lord is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside still waters. He restores my soul."  Psalm 23:1-3', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"Even though I walk through the darkest valley, I will fear no evil, for You are with me; Your rod and Your staff, they comfort me."  Psalm 23:4', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"Teach us to number our days, that we may gain a heart of wisdom."  Psalm 90:12', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"The beginning of wisdom is this: Get wisdom. Though it cost all you have, get understanding."  Proverbs 4:7', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"A joyful heart is good medicine, but a crushed spirit dries up the bones."  Proverbs 17:22', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight."  Proverbs 3:5-6', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"The righteous fall seven times and rise again."  Proverbs 24:16', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"Do not be afraid of sudden terror or of the ruin of the wicked, for the Lord will be your confidence."  Proverbs 3:25-26', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"Peace, peace, to those far and near, says the Lord. And I will heal them."  Isaiah 57:19', s:'Judaism  Tanakh'},
  {type:'scripture', text:'"The mind is everything. What you think you become."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"Peace comes from within. Do not seek it without."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"You yourself, as much as anybody in the entire universe, deserve your love and affection."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"Hatred does not cease by hatred, but only by love; this is the eternal rule."  Dhammapada 1:5', s:'Buddhism'},
  {type:'scripture', text:'"The secret of health for both mind and body is not to mourn for the past, nor to worry about the future, but to live the present moment wisely and earnestly."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"Let go of the past, let go of the future, let go of the present, and cross to the farther shore. With mind released from all things, you will not again undergo birth and death."  Dhammapada', s:'Buddhism'},
  {type:'scripture', text:'"Just as a snake sheds its skin, we must shed our past over and over again."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"However many holy words you read, however many you speak, what good will they do you if you do not act upon them?"  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"Set your heart on doing good. Do it over and over again, and you will be filled with joy."  Buddha', s:'Buddhism'},
  {type:'scripture', text:'"You are the source of all purity and impurity. No one purifies another."  Dhammapada', s:'Buddhism'},
  {type:'scripture', text:'"You have the right to perform your prescribed duties, but you are not entitled to the fruits of your actions. Never consider yourself the cause of the results of your activities."  Bhagavad Gita 2:47', s:'Hinduism  Bhagavad Gita'},
  {type:'scripture', text:'"The soul is neither born, nor does it die. It is unborn, eternal, timeless, and primeval. It is not slain when the body is slain."  Bhagavad Gita 2:20', s:'Hinduism  Bhagavad Gita'},
  {type:'scripture', text:'"When meditation is mastered, the mind is unwavering like the flame of a lamp in a windless place."  Bhagavad Gita 6:19', s:'Hinduism  Bhagavad Gita'},
  {type:'scripture', text:'"There is nothing lost or wasted in this life. Even a little practice of this discipline protects one from great fear."  Bhagavad Gita 2:40', s:'Hinduism  Bhagavad Gita'},
  {type:'scripture', text:'"The wise see knowledge and action as one; they see truly."  Bhagavad Gita', s:'Hinduism  Bhagavad Gita'},
  {type:'scripture', text:'"Fill your mind with compassion, love, and faith, and let go of anger, greed, and delusion."  Vedas', s:'Hinduism  Vedas'},
  {type:'scripture', text:'"Truth is one; the wise call it by many names."  Rigveda 1:164:46', s:'Hinduism  Vedas'},
  {type:'scripture', text:'"Let noble thoughts come to us from all sides."  Rigveda 1:89:1', s:'Hinduism  Vedas'},
  {type:'scripture', text:'"A man is not injured by another but by himself."  Tirukkural', s:'Hinduism  Tirukkural'},
  {type:'scripture', text:'"Great minds discuss ideas; average minds discuss events; small minds discuss people."  attributed to Confucius', s:'Taoism / Confucianism'},
  {type:'scripture', text:'"The journey of a thousand miles begins with a single step."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"When I let go of what I am, I become what I might be."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"A good traveler has no fixed plans and is not intent on arriving."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"Water is the softest thing, yet it can penetrate mountains and earth. This shows clearly the principle of softness overcoming hardness."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"He who conquers others is strong; he who conquers himself is mighty."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"Nature does not hurry, yet everything is accomplished."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"If you are depressed you are living in the past. If you are anxious you are living in the future. If you are at peace you are living in the present."  Lao Tzu', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"Knowing others is intelligence; knowing yourself is true wisdom. Mastering others is strength; mastering yourself is true power."  Lao Tzu, Tao Te Ching', s:'Taoism  Tao Te Ching'},
  {type:'scripture', text:'"I am not this body. I am not this mind. I am the soul, eternal and free."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"Even kings and emperors with heaps of wealth and vast dominion cannot match the one who is internally at peace."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"Let no one in the world live in delusion. Without a Guru, none can cross over to the other shore."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"Truth is high, but higher still is truthful living."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"I am not good, nor is anyone else bad. I am not happy, nor is anyone else sad. But the Lord who made us all knows what is best for each."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"Let the first fruit of your humility be that you serve all humanity."  Guru Granth Sahib', s:'Sikhism  Guru Granth Sahib'},
  {type:'scripture', text:'"The earth is but one country and mankind its citizens."  Bah\'u\'llh', s:'Bah\' Faith'},
  {type:'scripture', text:'"Let your vision be world-embracing, rather than confined to your own self."  Bah\'u\'llh', s:'Bah\' Faith'},
  {type:'scripture', text:'"The light of a single lamp can dispel the darkness of a thousand years."  Bah\'u\'llh', s:'Bah\' Faith'},
  {type:'scripture', text:'"The betterment of the world can be accomplished through pure and goodly deeds."  Bah\'u\'llh', s:'Bah\' Faith'},
  {type:'scripture', text:'"O Son of Being! Busy not thyself with this world, for with fire We test the gold, and with gold We test Our servants."  Bah\'u\'llh', s:'Bah\' Faith'},
  {type:'scripture', text:'"Walk in peace and beauty. Treat the earth and all that dwell upon it with respect."  Native American wisdom', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"We do not inherit the earth from our ancestors; we borrow it from our children."  Native American proverb', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"Listen to the wind, it talks. Listen to the silence, it speaks. Listen to your heart, it knows."  Native American proverb', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"It is no longer good enough to cry peace, we must act peace, live peace, and walk in peace."  Native American wisdom', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"When you were born, you cried and the world rejoiced. Live your life so that when you die, the world cries and you rejoice."  Native American proverb', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"The soul would have no rainbow if the eyes had no tears."  Native American proverb', s:'Indigenous Wisdom'},
  {type:'scripture', text:'"Seek to do good to all, and you will find peace within."  Zoroastrian wisdom', s:'Zoroastrianism'},
  {type:'scripture', text:'"Happiness is for those who wish happiness for others."  Zoroastrian wisdom', s:'Zoroastrianism'},
  {type:'scripture', text:'"Good thoughts, good words, good deeds."  Zoroastrian motto', s:'Zoroastrianism'},
  {type:'scripture', text:'"Let there be no compulsion in religion. Truth stands out clear from error."  Quran 2:256', s:'Islam  Quran'}
];

function dailySpark() {
  var today = new Date().toDateString();
  if (D._sparkDate === today && D._spark) return D._spark;
  var types = ['quote','challenge','affirmation','tip','scripture'];
  var weights = {quote:18, challenge:22, affirmation:22, tip:25, scripture:13};
  var total = 0;
  for (var w in weights) total += weights[w];
  var rand = Math.random() * total, cum = 0, chosenType = 'tip';
  for (var w2 in weights) { cum += weights[w2]; if (rand <= cum) { chosenType = w2; break; } }
  var filtered = MOTIVATION_POOL.filter(function(m){ return m.m === 'hopeful' || m.m === 'reflective'; });
  if (chosenType === 'quote' && filtered.length) {
    var pick = filtered[Math.floor(Math.random() * filtered.length)];
    D._sparkDate = today;
    D._spark = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">&#128293;</span><span style="font-weight:700;font-size:14px">Today\'s Spark</span></div><div style="font-size:15px;font-style:italic;line-height:1.5;margin-bottom:6px">' + pick.q + '</div><div style="font-size:12px;color:var(--muted)"> ' + pick.p + ' <span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + pick.c + '</span></div><details style="margin-top:4px"><summary style="font-size:10px;color:var(--muted);cursor:pointer">Context</summary><p style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4">' + pick.t + '</p></details></div>';
    return D._spark;
  }
  var sparkPool = DAILY_SPARKS.filter(function(s){ return s.type === chosenType; });
  if (!sparkPool.length) sparkPool = DAILY_SPARKS;
  var spark = sparkPool[Math.floor(Math.random() * sparkPool.length)];
  var icons = {quote:'&#128293;', challenge:'&#127919;', affirmation:'&#10024;', tip:'&#128161;', scripture:'&#128591;'};
  var labels = {quote:'Quote', challenge:'Challenge', affirmation:'Affirmation', tip:'Tip', scripture:'Scripture'};
  if (spark.type === 'quote') {
    D._sparkDate = today;
    D._spark = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">' + (icons[spark.type]||'&#128293;') + '</span><span style="font-weight:700;font-size:14px">Today\'s ' + (labels[spark.type]||'Spark') + '</span></div><div style="font-size:15px;font-style:italic;line-height:1.5;margin-bottom:6px">' + spark.q + '</div><div style="font-size:12px;color:var(--muted)"> ' + (spark.p||'') + ' <span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + spark.c + '</span></div></div>';
    return D._spark;
  }
  if (spark.type === 'scripture') {
    D._sparkDate = today;
    D._spark = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">&#128591;</span><span style="font-weight:700;font-size:14px">Today\'s Scripture</span></div><div style="font-size:14px;line-height:1.6;margin-bottom:6px">' + spark.text + '</div><div style="font-size:11px;color:var(--muted)"><span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + (spark.s||'') + '</span></div></div>';
    return D._spark;
  }
  D._sparkDate = today;
  D._spark = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">' + (icons[spark.type]||'&#128293;') + '</span><span style="font-weight:700;font-size:14px">Today\'s ' + (labels[spark.type]||'Spark') + '</span></div><div style="font-size:14px;line-height:1.5;margin-bottom:2px">' + (spark.type === 'challenge' ? '?? ' : spark.type === 'affirmation' ? '?? ' : '?? ') + spark.text + '</div><div style="font-size:11px;color:var(--muted);margin-top:4px"><span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + spark.c + '</span></div></div>';
  return D._spark;
}

function dailyChallenge() {
  var today = new Date().toDateString();
  if (D._challengeDate === today && D._challenge) return D._challenge;
  var pool = DAILY_SPARKS.filter(function(s){ return s.type === 'challenge'; });
  if (!pool.length) return '';
  var pick = pool[Math.floor(Math.random() * pool.length)];
  D._challengeDate = today;
  D._challenge = '<div class="card" style="padding:16px;margin:10px 0;border-left:3px solid var(--primary)"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">&#127919;</span><span style="font-weight:700;font-size:14px">Daily Challenge</span></div><div style="font-size:14px;line-height:1.5">' + pick.text.replace(/^Challenge:\s*/,'') + '</div></div>';
  return D._challenge;
}

function dailyQuote() {
  var today = new Date().toDateString();
  if (D._quoteDate === today && D._quote) return D._quote;
  var filtered = MOTIVATION_POOL.filter(function(m){ return m.m === 'hopeful' || m.m === 'reflective'; });
  if (filtered.length) {
    var pick = filtered[Math.floor(Math.random() * filtered.length)];
    D._quoteDate = today;
    D._quote = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">&#128293;</span><span style="font-weight:700;font-size:14px">Today\'s Quote</span></div><div style="font-size:15px;font-style:italic;line-height:1.5;margin-bottom:6px">' + pick.q + '</div><div style="font-size:12px;color:var(--muted)"> ' + pick.p + ' <span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + pick.c + '</span></div><details style="margin-top:4px"><summary style="font-size:10px;color:var(--muted);cursor:pointer">Context</summary><p style="font-size:11px;color:var(--muted);margin-top:2px;line-height:1.4">' + pick.t + '</p></details></div>';
    return D._quote;
  }
  var sparkPool = DAILY_SPARKS.filter(function(s){ return s.type === 'quote'; });
  if (!sparkPool.length) return '';
  var spark = sparkPool[Math.floor(Math.random() * sparkPool.length)];
  D._quoteDate = today;
  D._quote = '<div class="card" style="padding:16px;margin:10px 0"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:18px">&#128293;</span><span style="font-weight:700;font-size:14px">Today\'s Quote</span></div><div style="font-size:15px;font-style:italic;line-height:1.5;margin-bottom:6px">' + spark.q + '</div><div style="font-size:12px;color:var(--muted)"> ' + (spark.p||'') + ' <span style="background:var(--primary-light);padding:1px 6px;border-radius:4px;font-size:10px">' + spark.c + '</span></div></div>';
  return D._quote;
}

function getMotivation(mood) {
  var pool = MOTIVATION_POOL.filter(function(m){ return m.m === mood; });
  if (!pool.length) pool = MOTIVATION_POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}

function getReflection(mood) {
  var pool = ART_REFLECTIONS[mood] || ART_REFLECTIONS.reflective;
  return pool[Math.floor(Math.random() * pool.length)];
}

function extractTopics(text) {
  var t = text.toLowerCase(); var topics = [];
  if (t.match(/crav|urge|trigger|relaps|slip|drink|smok|using|tempted|withdraw|addict|substance|alcohol|weed|pill|shot|bottle|beer|wine|vodka/)) topics.push('craving');
  if (t.match(/job|work|career|boss|coworker|interview|fired|promot|quit|retire|office|meeting|deadline|project|colleague|profession|employ|unemploy|resign|layoff/)) topics.push('work');
  if (t.match(/mom|dad|mother|father|sister|brother|wife|husband|partner|boyfriend|girlfriend|spouse|child|kid|family|parent|marri|divorce|dating|relation|friend|roommate|neighbor|grandma|grandpa|aunt|uncle|cousin|son|daughter/)) topics.push('relationships');
  if (t.match(/doctor|therapist|appointment|medication|prescri|diagnos|pain|sick|ill|disease|injur|surgery|hospital|clinic|mental|health|anxiety|depression|bipolar|ptsd|adhd|therapy|counsel|psychiatr|nurse|check.?up/)) topics.push('health');
  if (t.match(/exercise|workout|gym|run|walk|yoga|meditat|breathe|sleep|insomnia|tired|exhaust|energy|fit|fitness|diet|eat|food|meal|cook|nutrit|water|hydrat|hungry|fasting/)) topics.push('wellness');
  if (t.match(/school|class|college|university|course|exam|test|study|homework|assignment|grade|teacher|student|professor|lecture|lesson|train|certif|degree|major|minor|semester|graduate/)) topics.push('school');
  if (t.match(/money|bills|pay|debt|loan|mortgage|rent|budget|finance|savings|spend|bought|purchase|expensive|afford|income|salary|wage|bank|account|credit|owe/)) topics.push('finances');
  if (t.match(/proud|accomplish|achieved|milestone|goal|progress|win|success|completed|finished|earned|improved|grew|growth|heal|recover|stronger|sober.*day|day.*sober/)) topics.push('progress');
  if (t.match(/alone|lonely|isolat|miss|grief|loss|mourn|grieving|died|passed|gone|leave|abandon|reject|ignore|forgotten|invisible|nobody|no one|empty|numb/)) topics.push('loneliness');
  return topics;
}

var TOPIC_SUGGESTIONS = {
  work: ['Try setting a clear boundary between work and rest  even 10 minutes of silence between tasks can reset your mind.', 'Write down three things you accomplished today at work, no matter how small.', 'Consider talking to your manager or a trusted coworker about what you\'re feeling.', 'Open the Coping Cards in the Care section and try the grounding exercise  it helps with work overwhelm.'],
  relationships: ['Reach out to someone you trust and tell them how you feel. Connection is medicine.', 'Write down what you wish you could say  sometimes the page is the safest place to start.', 'Consider setting a small boundary this week that protects your peace.', 'Name one person who makes you feel seen. Reach out to them today, even with a short text.'],
  health: ['Be proud of yourself for tracking your health. Small steps compound into big changes.', 'Try the breathing exercise in the Care section  it supports both mental and physical calm.', 'If you haven\'t already, consider scheduling a check-up. Taking action reduces anxiety.', 'Your health journey deserves celebration. Open your Progress page and look at how far you\'ve come.'],
  craving: ['You just acknowledged a craving  that\'s a win. Awareness is the first line of defense.', 'Try the Urge Surfing card in Coping Cards. Ride the wave  it will pass.', 'Call or text your partner right now. Connection breaks the craving cycle.', 'Remind yourself why you started. Open your relapse prevention plan in the Care section.'],
  school: ['Learning is growth. Even when it\'s hard, every class page you read moves you forward.', 'Break your study time into 25-minute focused blocks with 5-minute breaks.', 'Reach out to a classmate or professor  asking for help is strength, not weakness.'],
  wellness: ['You\'re taking care of yourself, and that\'s everything. Keep showing up for you.', 'Try a 5-minute walk or stretch  your body and mind will thank you.', 'Hydrate, eat something nourishing, and give yourself permission to rest.'],
  finances: ['Money stress is real and heavy. Naming it here is the first step to managing it.', 'Focus on what you can control today  even a $5 decision made intentionally is a win.', 'Consider listing out your expenses. Seeing them on paper often reduces their power over you.'],
  progress: ['Reading your own progress is powerful. You\'ve earned these words.', 'Share this win with someone  your partner, a friend, or write it in your journal again.', 'Take a moment to feel this. You worked for it. Let yourself be proud.'],
  loneliness: ['I hear you. You\'re not as alone as it feels right now.', 'Consider reaching out to your partner or just sending a text to someone you trust.', 'Sometimes presence helps  go somewhere with people, even if you don\'t talk to anyone.', 'Open your coping cards and try the self-compassion break. You deserve kindness from yourself.'],
  general: ['Try putting on a song that matches your mood and letting yourself feel it for 3 minutes.', 'Write one thing you\'re grateful for  even if it feels small.', 'Take 5 slow, deep breaths. In through your nose, out through your mouth.']
};

function buildPersonalReflection(entry, mood, entries, idx) {
  var txt = getEntryText(entry);
  var topics = extractTopics(txt);
  var baseReflection = getReflection(mood);
  var parts = [];
  var text = txt;

  if (topics.length) {
    var topicLabels = {craving:'navigating cravings',work:'work',relationships:'your relationships',health:'your health',wellness:'your well-being',school:'your studies',finances:'finances',progress:'your progress',loneliness:'feeling alone'};
    parts.push('You mentioned ' + (topicLabels[topics[0]] || 'what you\'re going through') + ' in your entry.');
  }

  parts.push(baseReflection);

  if (entries.length >= 5) {
    var sadCount = 0, happyCount = 0;
    for (var i = Math.max(0, entries.length - 7); i < entries.length; i++) {
      if (entries[i].mood <= 2) sadCount++;
      if (entries[i].mood >= 4) happyCount++;
    }
    if (sadCount >= 4) parts.push('You\'ve been feeling low recently. Be extra kind to yourself.');
    else if (happyCount >= 3) parts.push('Your recent entries have a lighter energy  that\'s good to see.');
  }

  return parts.join(' ');
}

function buildSuggestions(entry, mood, entries, idx) {
  var topics = extractTopics(getEntryText(entry));
  var suggestions = [];
  var dayCount = soberDays();

  if (topics.length) {
    var topicPicks = TOPIC_SUGGESTIONS[topics[0]] || TOPIC_SUGGESTIONS.general;
    suggestions.push(topicPicks[Math.floor(Math.random() * topicPicks.length)]);
    if (topics.length > 1) {
      var second = TOPIC_SUGGESTIONS[topics[1]] || TOPIC_SUGGESTIONS.general;
      suggestions.push(second[Math.floor(Math.random() * second.length)]);
    }
  } else {
    var moodSuggestions = ART_SUGGESTIONS[mood] || ART_SUGGESTIONS.reflective;
    suggestions.push(moodSuggestions[Math.floor(Math.random() * moodSuggestions.length)]);
  }

  if (dayCount > 0 && dayCount < 90) suggestions.push('You\'re ' + dayCount + ' days into your sobriety journey. Early recovery is intense  have you set up your Relapse Prevention Plan in the Care section yet?');
  if (dayCount > 90) suggestions.push('Over ' + dayCount + ' days sober. That\'s serious momentum. Don\'t forget to check your Progress page to see how far you\'ve come.');

  var hasCravings = D.cravings && D.cravings.length > 0 && (Date.now() - D.cravings[D.cravings.length-1].timestamp) < 86400000;
  if (hasCravings) suggestions.push('I see you logged a craving recently. Try the Urge Surfing card in Coping Cards  it\'s designed for exactly this moment.');

  var streak = D.streak || 0;
  if (streak > 5) suggestions.push('You\'re on a ' + streak + '-day journaling streak. Consistency like this is how recovery becomes a lifestyle, not just a goal.');

  if (D.name && D.buddyCode) suggestions.push('Have you shared this entry with your partner yet? Sometimes the people closest to us see our growth before we do.');

  suggestions.push('Check in with the Coping Cards or Breathing Exercise in the Care section whenever you need a reset.');

  return suggestions;
}

var RECOVERY_VIGNETTES = {
  sad:[
    "I remember a man who came to his first meeting in the rain, soaked through, sat in the back and didn't speak. Someone handed him a towel and said 'You're at the right place.' He cried harder than the rain. That was 14 years ago. He sponsors six men now.",
    "A woman I know spent her first 90 days sleeping on her friend's couch, crying every night. She said the tears felt endless. One night she noticed the tears were a little lighter. A week later, she smiled at a joke. It took time, but the weight started lifting.",
    "I sat with a young man who kept saying 'I don't know why I'm so sad, nothing bad happened.' I told him sadness doesn't need a reason. It's allowed to exist. We sat in silence for a full minute. When he looked up, he said 'Thank you for not trying to fix me.'"
  ],
  angry:[
    "A former boxer I sponsor told me his anger was the only thing that felt powerful. I said 'Power untamed is a fire. Power directed is a forge.' He started channeling his rage into woodworking. His first piece was a rocking chair. He gave it to his mother.",
    "I knew a woman who'd scream into a pillow every night after work. She was afraid of her own anger. I told her the pillow could take it. Eventually she stopped screaming and started expressing. She's a social worker now  helps others find their voice.",
    "A man once told me he broke four phones in a month from rage. I asked him what he was really fighting. He sat quiet for a long time. 'Myself,' he said. That was the beginning."
  ],
  anxious:[
    "A young woman once told me her anxiety felt like a radio station playing static in every room she entered. I asked 'What happens if you sit with the static instead of trying to tune it out?' She tried it. She said the static was still there, but it had a rhythm. She learned to breathe to that rhythm.",
    "I remember a man who couldn't sit through a full meeting. He'd pace, sweat, leave early. We worked on just 3 minutes of stillness. Then 5. A year later, he gave a speech at his daughter's wedding. He told me afterwards: 'I was still scared, but I did it anyway.'",
    "A woman I sponsor used to check her locks seven times before bed. I asked her to say out loud: 'The door is locked. I am safe.' Three times, not seven. Her brain fought it at first. After a month, she believed it."
  ],
  happy:[
    "A man came to me after 6 months sober, grinning ear to ear. He said 'Arthur, I laughed today. Really laughed. I forgot what that felt like.' I told him: 'Joy doesn't betray your past. It honors your recovery.'",
    "I watched a woman buy her first non-addicted birthday gift with her own money  a necklace for her sister. She put it on her sister herself. They both cried. She told me later: 'I didn't know I could feel this way and not want to ruin it.'",
    "A young man called me just to say he'd cooked a full meal for the first time in years. 'It's just pasta,' he said. 'No, it's not,' I told him. 'That's a feast of reclamation.'"
  ],
  grateful:[
    "A man once told me he was grateful for his empty pockets. I asked him why. He said 'Now I have room to hold what matters.' I think about that every time I count what I have instead of what I lost.",
    "A woman wrote me a letter listing 1,000 things she was grateful for  from oxygen to her sponsor. It took her 3 months. She said 'I ran out of paper before I ran out of gratitude.'",
    "An old-timer told me he says 'thank you' before he falls asleep every night. Some nights he's thanking God. Some nights he's thanking the lock on the door. 'Doesn't matter who you thank,' he said. 'The act itself is the prayer.'"
  ],
  reflective:[
    "A poet in recovery told me: 'Sobriety gave me a pen. Reflection taught me how to write.' She goes to a coffee shop every Saturday morning and just writes. She's filled 17 journals. She can look back at her own becoming.",
    "I once asked an elder with 40 years of sobriety what the most important thing he learned was. He said 'I stopped asking why I was this way and started asking what I'm going to do about it.' I use that question every day."
  ],
  hopeful:[
    "A man who was homeless and addicted for years now runs a shelter. He told me: 'I spent so long on the floor I know exactly where the door is.' Hope is not blind optimism. It's knowing the way out because you've been in the dark.",
    "A woman came to her first meeting drunk and high, in handcuffs from a court order. She was furious. 10 years later, she's a judge. She told me: 'I didn't believe it was possible. But I did it anyway.' That's the definition of hope in action.",
    "I remember a young man who said 'I don't think I can do this.' I said 'You don't have to believe it yet. Just show up tomorrow.' He did. And the day after. Now he tells newcomers the same thing."
  ],
  mixed:[
    "A musician once told me he felt like two different people. One wanted to heal, the other wanted to burn everything down. I told him both voices can stay  just let the healers voice drive. The other one can ride shotgun.",
    "A woman said 'I'm happy about some things and devastated about others. Which one is real?' I said 'Both. Your heart is a house with many rooms. You're allowed to be in more than one at a time.'"
  ]
};
function buildSummary(txt, mood, topics, dayCount, streak, entryHour) {
  var lines = [];
  var words = txt.trim().split(/\s+/).length;
  var mins = Math.ceil(words / 15);

  // Entry overview
  lines.push('Entry Overview: ' + words + ' words' + (mins > 1 ? '  about ' + mins + ' minutes of honest reflection' : '  a short check-in that still carries weight') + '.');

  // Sobriety context
  if (dayCount > 0) lines.push('Sobriety: You\'re ' + dayCount + ' day' + (dayCount!==1?'s':'') + ' into this journey. Every day you hold this line, the foundation deepens and the voice of addiction softens.');

  // Journal streak
  if (streak > 3 && streak <= 7) lines.push('Journal Streak: ' + streak + ' days in a row. This is how habits are forged  one page at a time. You\'re building proof to yourself that you show up.');
  else if (streak > 7 && streak <= 30) lines.push('Journal Streak: A ' + streak + '-day streak means this is becoming automatic. You\'ve passed the hardest threshold  now it\'s momentum.');
  else if (streak > 30 && streak <= 90) lines.push('Journal Streak: ' + streak + ' days. At this point, journaling isn\'t something you do  it\'s something you are. You\'ve rewired your brain to process rather than suppress.');
  else if (streak > 90) lines.push('Journal Streak: ' + streak + ' days of uninterrupted journaling. This is mastery-level consistency. You are in the top fraction of people who sustain a practice this long.');

  // Time of day analysis
  var timeAnalysis = '';
  if (entryHour >= 5 && entryHour < 12) {
    timeAnalysis = 'Morning Pages: Writing in the morning taps into your fresh mind  before the day\'s noise drowns out your inner voice. Morning entries tend to be more honest, intuitive, and unguarded. You\'re setting a deliberate tone for the hours ahead.';
  } else if (entryHour >= 12 && entryHour < 17) {
    timeAnalysis = 'Midday Pause: You stopped in the middle of the current to check in with yourself. That takes awareness  most people push through without asking how they feel. This is a sign of growing mindfulness.';
  } else if (entryHour >= 17 && entryHour < 21) {
    timeAnalysis = 'Evening Reflection: There\'s a reason the evening review is a cornerstone of every wisdom tradition  it lets you digest the day before sleep claims it. By writing now, you\'re processing instead of carrying.';
  } else {
    timeAnalysis = 'Night Writing: Late-night entries arrive when the world is quiet and the mind is unfiltered. These pages often hold the deepest truths  the thoughts we\'re too guarded to face in daylight. The stillness is listening.';
  }
  lines.push(timeAnalysis);

  // Mood-specific deep analysis
  var moodDepth = {
    sad: 'Your words carry a weight today. Sadness isn\'t your enemy — it\'s your inner self telling you something matters. Ask what it wants you to see rather than trying to make it go away.',
    angry: 'Fire in your words. Anger signals a boundary crossed or a value threatened. Behind almost every anger is a hurt — ask what it\'s protecting.',
    anxious: 'Anxiety is a loud room. Ground yourself in the present: name one thing you can see, hear, and feel right now. Anxiety lives in the future — bring yourself back to now, where you are safe.',
    happy: 'There\'s a lightness in your words. Don\'t rush past it — notice what\'s different today and what contributed to this feeling. Savoring positive moments is a skill you\'re practicing right now.',
    grateful: 'Your words are filled with appreciation. Gratitude rewires the brain to notice what\'s good. This isn\'t naivety — it\'s training your mind for resilience.',
    reflective: 'You\'re in a contemplative space. This is where growth happens — in the still moments where you make sense of things. Keep asking questions; the answers come in layers.',
    hopeful: 'Hope radiates from your words. You\'ve been through hard things and you\'re still here, still believing things can get better. Hold onto this hope — it\'s real and it\'s yours.',
    mixed: 'Your entry holds multiple threads — joy and struggle, hope and fear. You don\'t have to pick one feeling. The goal isn\'t to feel only good things — it\'s to feel all of it without letting any single feeling take the wheel.'
  };
  if (moodDepth[mood]) lines.push(moodDepth[mood]);

  // Advanced topic analysis
  if (topics && topics.length) {
    var topicAnalysis = [];
    if (topics.indexOf('craving') !== -1) topicAnalysis.push('You acknowledged a craving. This is a critical skill  cravings lose power the moment you name them out loud. What triggered it? What did you do instead? Each craving you survive weakens the next one.');
    if (topics.indexOf('work') !== -1) topicAnalysis.push('Your work life is present in your thoughts. Work stress is one of the most common relapse triggers. Notice if there\'s a pattern: certain times, people, or tasks that activate your stress response. Awareness is the first step to building boundaries.');
    if (topics.indexOf('relationships') !== -1) topicAnalysis.push('Your relationships are on your mind. The people in our lives can be our greatest support or our biggest triggers. Is there someone you need to set a boundary with? Or someone you could reach out to today? Connection is the opposite of addiction.');
    if (topics.indexOf('health') !== -1) topicAnalysis.push('You wrote about your health. Recovery and physical health are deeply connected  when we care for our bodies, we strengthen our minds. What\'s one small thing you could do today to honor your body?');
    if (topics.indexOf('loneliness') !== -1) topicAnalysis.push('You opened up about feeling alone. Loneliness is one of the heaviest burdens in recovery. Please know: writing it down is a step toward connection. You\'ve told the page  now consider telling one trusted person. You don\'t have to carry this alone.');
    if (topics.indexOf('progress') !== -1) topicAnalysis.push('You reflected on your progress. This is essential  we often move forward so fast that we forget to look back at how far we\'ve come. The distance between where you were and where you are now is real, measurable, and meaningful. You earned this moment of recognition.');
    if (topics.indexOf('finances') !== -1) topicAnalysis.push('Financial stress came up. Money worries are real and valid. They can feel overwhelming, but you don\'t have to solve everything today. What\'s one small step you could take this week? Even looking at your numbers is an act of courage, not avoidance.');
    if (topics.indexOf('wellness') !== -1) topicAnalysis.push('You wrote about wellness and self-care. This shows you\'re thinking about what you need to thrive, not just survive. What\'s one practice that\'s been working for you lately? Double down on what works.');
    if (topicAnalysis.length) {
      lines.push('Deeper Themes:');
      topicAnalysis.forEach(function(ta) { lines.push('&#9755; ' + ta); });
    }
  }

  // Overall sentiment synthesis
  if (words > 200) lines.push('Overall: You wrote ' + words + ' words today  this is a deep session. You\'re not just skimming the surface; you\'re digging into the soil of your experience. This level of honesty is rare and powerful. Whatever you\'re working through, you\'re doing it right.');
  else if (words > 100) lines.push('Overall: Over ' + words + ' words  you\'re opening up and getting to the real material. The first 100 words are often warm-up  after that, the truth starts to emerge. You pushed past the surface.');
  else if (words > 50) lines.push('Overall: ' + words + ' words  sometimes the shortest entries carry the most weight. You said what needed to be said. No filler. That\'s efficiency of the heart.');
  else lines.push('Overall: Even a short entry is a victory  you showed up, you named something real, and you chose honesty over silence. That\'s what matters.');

  return lines.join('<br>');
}
function getVignette(mood) {
  var pool = RECOVERY_VIGNETTES[mood] || RECOVERY_VIGNETTES.reflective;
  return pool[Math.floor(Math.random() * pool.length)];
}

function updateWordCount(el) {
  var count = el.value.trim() ? el.value.trim().split(/\s+/).length : 0;
  var display = document.getElementById('word-count');
  if (display) display.textContent = count + ' words';
}

function reflectHTML() {
  var goal = D.journalWordGoal || 50;
  var jStreak = calcJournalStreak();
  var h = '<h2 class="page-title">'+t('Journal')+'</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(91,33,182,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-arthur);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 16 16" width="16" height="16" fill="#fff"><path d="M3 12V6l2.5 2L8 3l2.5 5L13 6v6z"/><rect x="2" y="12" width="12" height="1.5" rx=".3"/></svg></div><div style="font-size:12px;color:var(--muted)">Arthur is here to help you reflect. Every entry sharpens the map of your recovery.</div></div></div>';
  if (jStreak > 0) {
    h += '<div style="text-align:center;padding:8px 12px;margin:4px 0 8px;background:linear-gradient(135deg,#ff6b35,#f7931e);border-radius:12px;color:#fff;display:flex;align-items:center;justify-content:center;gap:10px">';
    h += '<span style="font-size:28px">&#128293;</span><div><div style="font-weight:700;font-size:18px">' + jStreak + ' '+t('Day Journal Streak')+'</div><div style="font-size:11px;opacity:.9">'+t('Keep it going! Write today to maintain your streak.')+'</div></div></div>';
  } else if (D.journal.length > 0) {
    h += '<div style="text-align:center;padding:8px 12px;margin:4px 0 8px;background:var(--border);border-radius:12px;color:var(--muted);display:flex;align-items:center;justify-content:center;gap:10px">';
    h += '<span style="font-size:24px">&#128200;</span><div><div style="font-weight:600;font-size:14px">'+t('Streak broken')+'</div><div style="font-size:11px">'+t('Write today to start a new streak!')+'</div></div></div>';
  }
  h += '<div class="card">';
  h += '<h3>'+t('Write in Your Journal')+'</h3>';
  h += '<div style="background:var(--primary-light);padding:10px 12px;border-radius:10px;margin-bottom:8px;font-size:13px;line-height:1.5;border-left:3px solid var(--primary)"><strong>'+t("Today's Prompt:")+'</strong> ' + todayPrompt() + '</div>';
  // Journal type selector
  var types = [
    {id:'free', label:'Free Write', icon:'&#128221;', desc:'Write whatever is on your mind'},
    {id:'quick', label:'Quick Mood', icon:'&#9889;', desc:'Just log your mood'}
  ];
  h += '<div style="display:flex;gap:6px;margin:8px 0" id="journal-types">';
  for (var ti=0;ti<types.length;ti++) {
    (function(tid, tdesc){
      h += '<button class="btn btn-sm ' + (ti===0?'btn-primary':'btn-outline') + '" onclick="[].forEach.call(document.querySelectorAll(\'#journal-types .btn\'),function(b){b.className=\'btn btn-sm btn-outline\'});this.className=\'btn btn-sm btn-primary\';document.getElementById(\'ref-entry\').placeholder=this.getAttribute(\'data-ph\');var q=document.getElementById(\'quick-mood-area\');if(\''+tid+'\'===\'quick\'){document.getElementById(\'ref-entry\').style.display=\'none\';document.getElementById(\'word-count-row\').style.display=\'none\';document.getElementById(\'save-entry-btn\').style.display=\'none\';if(q)q.style.display=\'block\'}else{document.getElementById(\'ref-entry\').style.display=\'block\';document.getElementById(\'word-count-row\').style.display=\'flex\';document.getElementById(\'save-entry-btn\').style.display=\'inline-block\';if(q)q.style.display=\'none\'}" data-type="' + tid + '" data-ph="' + tdesc + '" style="flex:1;font-size:11px">' + types[ti].icon + ' ' + types[ti].label + '</button>';
    })(types[ti].id, types[ti].desc);
  }
  h += '</div>';
  h += '<div class="mood-row" id="ref-moods">';
  var moodEmojis = ['&#128542;','&#128533;','&#128528;','&#128578;','&#128513;'];
  var labels = [t('Terrible'),t('Bad'),t('Okay'),t('Good'),t('Great')];
  for (var i=0;i<5;i++) {
    h += '<button class="mood-btn" data-val="'+(i+1)+'" onclick="[].forEach.call(document.querySelectorAll(\'#ref-moods .mood-btn\'),function(b){b.classList.remove(\'active\')});this.classList.add(\'active\')"><span style="font-size:18px;display:block">'+moodEmojis[i]+'</span>'+labels[i]+'</button>';
  }
  h += '</div>';
  h += '<div id="quick-mood-area" style="display:none;text-align:center;padding:16px 0"><div style="font-size:13px;color:var(--muted);margin-bottom:10px">'+t('Tap your mood above, then save:')+'</div><button class="btn btn-primary" onclick="saveQuickMood()" style="width:100%">&#9889; '+t('Log Quick Mood')+'</button></div>';
  h += '<textarea id="ref-entry" placeholder="'+t('Write whatever is on your mind')+'..." style="min-height:140px" oninput="updateWordCount(this)"></textarea>';
  h += '<div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin:2px 0 6px" id="word-count-row"><span id="word-count">0 '+t('words')+'</span><span>'+t('Goal:')+' ' + goal + ' '+t('words')+'</span></div>';
  h += '<button id="save-entry-btn" class="btn btn-primary" onclick="saveRefJournal()">'+t('Save Entry')+'</button>';
  h += '</div>';
  h += artDailyRoutineHTML();
  h += journalInsightsHTML();
  h += '<div class="card" style="text-align:center;padding:16px;background:linear-gradient(135deg,var(--primary-light),var(--card))">';
  h += '<div style="font-weight:700;font-size:18px;margin-bottom:4px">Journal Reflections</div>';
  h += '<p style="font-size:12px;color:var(--muted)">Tap any entry below for a reflection summary, suggestions, and a song recommendation.</p></div>';
  if (!D.journal.length) {
    h += '<div class="card"><div class="empty-state">No entries yet. Write something above to see reflections here.</div></div>';
  } else {
    h += '<div class="card" style="text-align:center;cursor:pointer;padding:10px" onclick="var e=document.getElementById(\'past-journals\');if(e){var v=e.style.display!==\'none\';e.style.display=v?\'none\':\'block\';this.querySelector(\'.pj-toggle\').textContent=v?\'Show All (' + D.journal.length + ' entries)\':\'Hide Past Journals\'}">';
    h += '<span class="pj-toggle" style="font-weight:600;font-size:13px;color:var(--primary)">Show All (' + D.journal.length + ' entries)</span></div>';
    h += '<div id="past-journals" style="display:none">';
    h += '<div style="display:flex;gap:6px;margin-bottom:8px"><input type="text" id="journal-search" placeholder="'+t('Search entries...')+'" oninput="filterJournals(this.value)" style="flex:1;padding:8px 10px;border:1px solid var(--border);border-radius:8px;font-size:13px;background:var(--card);color:var(--text);box-sizing:border-box"><button class="btn btn-sm btn-danger" onclick="deleteAllJournalEntries()" style="padding:4px 8px;font-size:10px;width:auto;white-space:nowrap">'+t('Delete All')+'</button></div>';
    h += '<div id="journal-list">';
    var entries = D.journal.slice().reverse();
    for (var i=0;i<entries.length;i++) {
      var idx = D.journal.length - 1 - i;
      var entryTextRefl = getEntryText(entries[i]);
      h += '<div class="card journal-entry" data-search="' + (entryTextRefl.replace(/"/g,'&quot;').replace(/'/g,'&#39;') + ' ' + entries[i].date).toLowerCase() + '">';
      h += '<div class="entry-item"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="date">' + regnalDate(entries[i].date) + (entries[i].mood ? ' &middot; ' + MOODS[entries[i].mood-1].label : '') + (entries[i].type ? ' <span class="badge badge-green" style="font-size:9px">' + entries[i].type + '</span>' : '') + '</div></div><button class="btn btn-sm btn-danger" onclick="deleteJournalEntry(' + idx + ')" style="padding:4px 8px;width:auto;font-size:11px;margin:0" title="Delete entry">&#10005;</button></div>';
      h += '<div style="margin-top:6px;font-size:14px;line-height:1.5">' + entryTextRefl.replace(/\n/g,'<br>') + '</div></div>';
      h += '<button class="btn btn-sm btn-primary" onclick="showReflection(' + idx + ')" style="margin-top:8px">Reflect with Arthur</button>';
      h += '</div>';
    }
    h += '</div>';
    h += '</div>';
  }
  return h;
}

function filterJournals(query) {
  var q = query.toLowerCase().trim();
  var entries = document.querySelectorAll('#journal-list .journal-entry');
  var visible = 0;
  for (var i=0;i<entries.length;i++) {
    var match = !q || entries[i].getAttribute('data-search').indexOf(q) !== -1;
    entries[i].style.display = match ? '' : 'none';
    if (match) visible++;
  }
  var empty = document.getElementById('journal-empty');
  if (!q) { if (empty) empty.remove(); return; }
  if (!visible) {
    if (!empty) {
      var e = document.createElement('div');
      e.id = 'journal-empty';
      e.className = 'card';
      e.innerHTML = '<div class="empty-state">No entries match "' + query + '"</div>';
      document.getElementById('journal-list').appendChild(e);
    }
  } else if (empty) empty.remove();
}

function saveQuickMood() {
  var active = document.querySelector('#ref-moods .mood-btn.active');
    if (!active) { alert(t('Select a mood first.')); return; }
  var mood = parseInt(active.getAttribute('data-val'));
  var now = new Date();
  var txt = 'Quick mood check-in';
  var entry = {text:txt, date:now.toDateString(), time:String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'), mood:mood, type:'quick'};
  var saveIt = function() {
    D.journal.push(entry);
    earnSchillings(5, 'Journal entry');
    if (!D.moods) D.moods = [];
    D.moods.push({val:mood, date:now.toDateString(), time:String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0')});
    saveData();
    render();
    setTimeout(showSchillingNotification, 800);
  };
  if (isEncryptionEnabled() && ENC_KEY) {
    encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
  } else if (isEncryptionEnabled() && !ENC_KEY) {
    promptEncryptionPassphrase(function() {
      encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
    });
  } else {
    saveIt();
  }
}

function saveRefJournal() {
  var text = document.getElementById('ref-entry');
  if (!text||!text.value.trim()) { alert(t('Write something first.')); return; }
  var active = document.querySelector('#ref-moods .mood-btn.active');
  var mood = active ? parseInt(active.getAttribute('data-val')) : 0;
  var typeBtn = document.querySelector('#journal-types .btn-primary');
  var type = typeBtn ? typeBtn.getAttribute('data-type') : 'free';
  var now = new Date();
  var txt = text.value.trim();
  var entry = {
    text: txt,
    date: now.toDateString(),
    time: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),
    mood: mood,
    type: type
  };
  var saveIt = function() {
    D.journal.push(entry);
    earnSchillings(5, 'Journal entry');
    text.value = '';
    var idx = D.journal.length - 1;
    saveData();
    showJournalLetter(idx);
  };
  if (isEncryptionEnabled() && ENC_KEY) {
    encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
  } else if (isEncryptionEnabled() && !ENC_KEY) {
    promptEncryptionPassphrase(function() {
      encryptText(txt, ENC_KEY).then(function(enc) { entry.text = enc; saveIt(); });
    });
  } else {
    saveIt();
  }
}

function showJournalLetter(idx) {
  try {
  var entry = D.journal[idx];
  if (!entry) return;
  var entryText = getEntryText(entry);
  if (checkCrisis(entryText)) { showCrisisAlert(entryText); return; }
  var result = detectMood(entryText);
  var mood = result.primary;
  var scores = result.scores;
  var suggestions = buildSuggestions(entry, mood, D.journal, idx);
  var song = getSong(entryText, mood);
  var dayCount = soberDays();
  var hasCravings = D.cravings && D.cravings.length > 0 && (Date.now() - D.cravings[D.cravings.length-1].timestamp) < 86400000;
  var totalEntries = D.journal.length;
  var streak = D.streak || 0;
  var moodColors = {sad:'#60a5fa',angry:'#ef4444',anxious:'#f59e0b',happy:'#34d399',grateful:'#a78bfa',reflective:'#818cf8',hopeful:'#fbbf24',mixed:'#94a3b8'};
  var moodLabels = {sad:'Sad',angry:'Angry',anxious:'Anxious',happy:'Happy',grateful:'Grateful',reflective:'Reflective',hopeful:'Hopeful',mixed:'Mixed'};
  var mc = moodColors[mood] || '#94a3b8';

  var entryHour = entry.time ? parseInt(entry.time.split(':')[0]) : -1;
  var entryNum = idx + 1;
  var summaryText = buildSummary(entryText, mood, extractTopics(entryText), dayCount, streak, entryHour);
  var mot = getMotivation(mood);
  var songDesc = {sad:'A song that understands', angry:'A track to match the fire', anxious:'A song to help you breathe', happy:'A tune that matches your light', grateful:'A song for counting blessings', reflective:'Something for these quiet moments', hopeful:'A track to lift you higher', mixed:'A song that holds space'};

  var now = new Date();
  var dateStr = now.toLocaleDateString('en-US', {year:'numeric',month:'long',day:'numeric'});
  var timeStr = entry.time || now.toLocaleTimeString('en-US', {hour:'2-digit',minute:'2-digit'});

  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.65)';
  overlay.style.alignItems = 'center';

  var safe = function(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')};

  var h = '<div class="journal-letter" id="journal-letter">';
  // Rolled hint (visible only when rolled)
  h += '<div class="scroll-roll-hint"><span class="hint-line"></span> Touch to unroll <span class="hint-line"></span></div>';
  // Scroll header (no wax seal)
  h += '<div class="scroll-header">';
  h += '<div class="scroll-date">' + dateStr + '</div>';
  h += '<div class="scroll-title">History Entry</div>';
  h += '</div>';
  // Scroll body (where text appears)
  h += '<div class="letter-body" id="letter-body"></div>';
  // After-entry content (summary, insights, song - shown after typing finishes)
  h += '<div id="letter-after" style="display:none">';
  // Summary
  if (summaryText) {
    h += '<div class="letter-section" id="letter-summary"><div class="letter-section-label">A Thought on Your Entry</div><div class="letter-section-text" id="letter-summary-text"></div></div>';
  }
  // Suggestions / Insights
  if (suggestions && suggestions.length > 0) {
    h += '<div class="letter-section" id="letter-insights"><div class="letter-section-label">Gentle Suggestions</div><div class="letter-section-text">';
    for (var si = 0; si < Math.min(suggestions.length, 3); si++) {
      h += '<div style="margin:3px 0;padding-left:12px;position:relative">&#9755; ' + safe(suggestions[si]) + '</div>';
    }
    h += '</div></div>';
  }
  // Quote / Insight
  if (mot) {
    h += '<div class="letter-section" id="letter-quote"><div class="letter-section-label">' + safe(mot.c) + '</div><div class="letter-section-text" style="font-style:italic">"' + safe(mot.q) + '"</div><details style="margin-top:4px"><summary style="font-size:11px;cursor:pointer;color:var(--muted)">Why this matters</summary><p style="font-size:12px;line-height:1.5;color:var(--text-light);margin-top:2px">' + safe(mot.t) + '</p></details></div>';
  }
  // Song
  h += '<div class="letter-section" id="letter-song"><div class="letter-section-label">' + (songDesc[mood] || 'A song for you') + '</div>';
  if (song) {
    h += '<div class="letter-song-info">' + safe(song.title) + ' <span style="font-weight:400;color:var(--muted)">' + safe(song.artist) + '</span></div>';
    h += '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:4px">';
    h += '<a href="' + song.url_spotify + '" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; Spotify</a>';
    h += '<a href="' + song.url_youtube + '" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; YouTube</a>';
    h += '<a href="' + song.url_apple + '" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; Apple Music</a>';
    h += '<button class="btn btn-sm btn-primary" onclick="saveToPlaylist({title:\'' + song.title.replace(/'/g,"\\'") + '\',artist:\'' + song.artist.replace(/'/g,"\\'") + '\',url_spotify:\'' + song.url_spotify.replace(/'/g,"\\'") + '\',url_youtube:\'' + song.url_youtube.replace(/'/g,"\\'") + '\',url_apple:\'' + song.url_apple.replace(/'/g,"\\'") + '\'})" style="width:auto;font-size:9px;padding:4px 8px">+ Save</button></div>';
  } else {
    h += '<div style="font-size:12px;color:var(--muted)">Finding the perfect song...</div>';
  }
  h += '</div>';
  // Closing
  h += '<div class="scroll-closing" id="letter-closing" style="display:none">';
  h += '<div class="scroll-signoff">Thus recorded,</div>';
  h += '<div class="scroll-signature">' + safe(D.name || 'Me') + '</div>';
  h += '<div class="scroll-time">' + timeStr + '</div>';
  h += '</div>';
  h += '<button class="btn btn-outline btn-sm" id="letter-close" style="display:none;margin-top:10px">&#10003; Close Scroll</button>';
  h += '</div>';

  overlay.innerHTML = h;
  document.body.appendChild(overlay);

  // Start rolled up - click to unroll
  var letter = document.getElementById('journal-letter');
  letter.classList.add('rolled');
  letter.onclick = function(){
    if (!letter.classList.contains('rolled')) return;
    letter.classList.remove('rolled');
    letter.style.animation = 'scrollUnroll .8s ease both';
    setTimeout(function(){
      letter.style.maxHeight = '';
      startTypewriter();
    }, 850);
  };

  // Word-by-word typewriter for entry text (starts after unroll)
  function startTypewriter() {
    var body = document.getElementById('letter-body');
    if (!body || !entryText) return;
    var words = entryText.split(/(\s+)/);
    var wi = 0;
    var batchSize = 8;
    var penDelay = 80;

    function typeBatch() {
      if (wi >= words.length) {
        // Show after-entry sections
        var after = document.getElementById('letter-after');
        if (after) { after.style.display = 'block'; after.style.animation = 'letterAppear .5s ease both'; }
        // Show summary text immediately (no typewriter)
        if (summaryText) {
          var stEl = document.getElementById('letter-summary-text');
          if (stEl) stEl.innerHTML = summaryText;
        }
        var closing = document.getElementById('letter-closing');
        if (closing) closing.style.display = 'block';
        var closeBtn = document.getElementById('letter-close');
        if (closeBtn) closeBtn.style.display = 'inline-block';
        setTimeout(showSchillingNotification, 1000);
        return;
      }
      var chunk = '';
      var extraDelay = 0;
      for (var b=0;b<batchSize && wi < words.length;b++) {
        chunk += words[wi];
        if (words[wi].trim().endsWith('.')||words[wi].trim().endsWith('!')||words[wi].trim().endsWith('?')) extraDelay += 300;
        else if (words[wi].trim().endsWith(',')||words[wi].trim().endsWith(';')) extraDelay += 120;
        wi++;
      }
      body.innerHTML += '<span>' + chunk + '</span>';
      var lc = document.getElementById('journal-letter'); if (lc) lc.scrollTop = lc.scrollHeight;
      setTimeout(typeBatch, penDelay + extraDelay);
    }
    typeBatch();
  }

  // Close handler
  document.getElementById('letter-close').onclick = function(){
    overlay.remove();
  };

  D.reflectionCount = (D.reflectionCount || 0) + 1;
  if (dayCount === 30 || dayCount === 60 || dayCount === 90 || dayCount === 180 || dayCount === 365 || (dayCount > 365 && dayCount % 365 === 0)) setTimeout(confetti, 300);
  } catch(e) { alert('Could not show journal: ' + e.message); }
}

function showReflection(idx) {
  try {
  var entry = D.journal[idx];
  if (!entry) return;
  var entryText = getEntryText(entry);
  if (checkCrisis(entryText)) { showCrisisAlert(entryText); return; }
  var result = detectMood(entryText);
  var mood = result.primary;
  var scores = result.scores;
  var suggestions = buildSuggestions(entry, mood, D.journal, idx);
  var song = getSong(entryText, mood);
  var dayCount = soberDays();
  var hasCravings = D.cravings && D.cravings.length > 0 && (Date.now() - D.cravings[D.cravings.length-1].timestamp) < 86400000;
  var totalEntries = D.journal.length;
  var streak = D.streak || 0;
  var moodColors = {sad:'#60a5fa',angry:'#ef4444',anxious:'#f59e0b',happy:'#34d399',grateful:'#a78bfa',reflective:'#818cf8',hopeful:'#fbbf24',mixed:'#94a3b8'};
  var moodLabels = {sad:'Sad',angry:'Angry',anxious:'Anxious',happy:'Happy',grateful:'Grateful',reflective:'Reflective',hopeful:'Hopeful',mixed:'Mixed'};
  var mc = moodColors[mood] || '#94a3b8';
  var sorted = Object.keys(scores).sort(function(a,b){return scores[b]-scores[a]}).filter(function(k){return scores[k]>0});
  var maxScore = sorted.length ? scores[sorted[0]] : 1;
  var moodBars = sorted.map(function(k){
    var pct = Math.min(100,Math.round(scores[k]/maxScore*100));
    return '<div style="display:flex;align-items:center;gap:5px;padding:1.5px 0"><span style="font-size:10px;color:'+(k===mood?'rgba(255,255,255,.9)':'rgba(255,255,255,.5)')+';width:52px;text-align:right;font-weight:'+(k===mood?'700':'400')+'">'+(moodLabels[k]||k)+'</span><div style="flex:1;height:5px;background:rgba(255,255,255,.08);border-radius:3px;overflow:hidden"><div class="jc-bar-fill" style="height:100%;width:0%;background:'+(moodColors[k]||'#94a3b8')+';border-radius:3px"></div></div><span style="color:rgba(255,255,255,.4);font-size:9px;width:14px;text-align:right">'+scores[k]+'</span></div>'
  }).join('');

  var entryHour = entry.time ? parseInt(entry.time.split(':')[0]) : -1;
  var contextLines = [];
  if (entryHour >= 5 && entryHour < 12) contextLines.push('Morning entry');
  else if (entryHour >= 17 && entryHour < 21) contextLines.push('Evening reflection');
  else if (entryHour >= 21 || (entryHour >= 0 && entryHour < 5)) contextLines.push('Late night thoughts');
  if (dayCount > 0) contextLines.push(dayCount + ' day' + (dayCount!==1?'s':'') + ' sober');
  if (hasCravings) contextLines.push('Cravings logged');
  if (streak > 3) contextLines.push(streak + ' day streak');
  if (totalEntries <= 2) contextLines.push('Early journey');
  if (entry.type === 'checkin') contextLines.push('Daily check-in');

  var ctx = contextLines.map(function(l){return '<span style="font-size:9px;background:rgba(255,255,255,.06);padding:2px 8px;border-radius:8px;color:rgba(255,255,255,.5);letter-spacing:.3px">'+l+'</span>'}).join(' ');
  var entryNum = idx + 1;
  var summaryText = buildSummary(entryText, mood, extractTopics(entryText), dayCount, streak, entryHour);
  var mot = getMotivation(mood);
  var songDesc = {sad:'A song that understands', angry:'A track to match the fire', anxious:'A song to help you breathe', happy:'A tune that matches your light', grateful:'A song for counting blessings', reflective:'Something for these quiet moments', hopeful:'A track to lift you higher', mixed:'A song that holds space'};

  // Build overlay
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'radial-gradient(ellipse at 50% 0%,'+mc+'22, rgba(0,0,0,.98) 70%)';
  overlay.style.overflow = 'auto';
  var h = '<div style="position:fixed;inset:0;pointer-events:none;z-index:1;opacity:.02;background:repeating-conic-gradient(#fff 0% 25%,transparent 0% 50%) 0 0 / 2px 2px;animation:jcGrain .3s steps(3) infinite"></div>';
  h += '<div style="position:fixed;inset:0;pointer-events:none;z-index:1;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.6) 100%);opacity:0;animation:jcVignette 1.5s ease .3s forwards"></div>';
  // Main scrollable content
  h += '<div class="overlay-content" style="padding:16px 12px 24px;max-width:480px;position:relative;z-index:2">';
  h += '<div style="text-align:center;padding:30px 0 6px;opacity:0" id="jc-scene1"><div style="font-size:8px;color:rgba(255,255,255,.25);letter-spacing:5px;margin-bottom:6px">JOURNAL ENTRY</div>';
  h += '<div style="font-size:38px;font-weight:900;background:linear-gradient(135deg,'+mc+','+mc+'88);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-shadow:0 0 60px '+mc+'44">#'+entryNum+'</div></div>';
  // Context chips
  h += '<div style="display:flex;flex-wrap:wrap;gap:3px;margin-bottom:10px;opacity:0" id="jc-context">'+ctx+'</div>';
  // Scene 2: Main content (middle)
  h += '<div id="jc-main" style="opacity:0">';
  // Mood orb
  h += '<div style="text-align:center;margin-bottom:12px;opacity:0" id="jc-orb"><div style="--jc-mc:'+mc+';width:56px;height:56px;border-radius:50%;background:radial-gradient(circle at 35% 30%,'+mc+','+mc+'44 70%,rgba(0,0,0,.3));margin:0 auto 8px;box-shadow:0 0 30px '+mc+'44,inset 0 -4px 12px rgba(0,0,0,.3)"></div>';
  h += '<div style="font-size:18px;font-weight:700;color:'+mc+'">'+(moodLabels[mood]||mood)+'</div><div style="font-size:9px;color:rgba(255,255,255,.35);letter-spacing:2px;margin-top:2px">PRIMARY EMOTION</div></div>';
  // Mood bars
  h += '<div style="padding:0 4px;opacity:0" id="jc-bars">'+moodBars+'</div>';
  h += '</div>';
  // Scene 3: Summary (dialogue box style)
  h += '<div id="jc-summary-box" style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:12px 14px;margin:10px 0;opacity:0"><div style="font-size:8px;color:rgba(255,255,255,.3);letter-spacing:3px;margin-bottom:5px">SUMMARY</div><div id="jc-summary-text" style="font-size:13px;line-height:1.7;color:rgba(255,255,255,.8);min-height:1.2em"></div></div>';
  // Scene 4: Additional info (bottom)
  h += '<div id="jc-more" style="opacity:0">';
  // Suggestions
  h += '<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.05)"><div style="font-size:8px;color:rgba(255,255,255,.3);letter-spacing:3px;margin-bottom:5px">SUGGESTIONS</div>';
  for (var si = 0; si < Math.min(suggestions.length, 3); si++) {
    h += '<div style="font-size:11px;line-height:1.6;padding:2px 0;color:rgba(255,255,255,.6)">&#9654; '+suggestions[si]+'</div>';
  }
  h += '</div>';
  // Quote
  if (mot) {
    h += '<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.05)"><div style="font-size:8px;color:rgba(255,255,255,.3);letter-spacing:3px;margin-bottom:4px">'+mot.c+'</div><div style="font-size:13px;font-style:italic;line-height:1.5;color:rgba(255,255,255,.7)">'+mot.q+'</div><details style="margin-top:3px"><summary style="font-size:8px;color:rgba(255,255,255,.3);cursor:pointer;letter-spacing:1px">WHY THIS MATTERS</summary><p style="font-size:10px;color:rgba(255,255,255,.4);margin-top:2px;line-height:1.5">'+mot.t+'</p></details></div>';
  }
  // Song
  h += '<div style="padding:8px 0;border-top:1px solid rgba(255,255,255,.05);text-align:center"><div style="font-size:8px;color:rgba(255,255,255,.3);letter-spacing:3px;margin-bottom:5px">'+(songDesc[mood]||'A song for you')+'</div>';
  if (song) {
    h += '<div style="font-weight:700;font-size:13px;color:rgba(255,255,255,.8)">'+song.title.replace(/&/g,'&amp;').replace(/</g,'&lt;')+' <span style="font-weight:400;color:rgba(255,255,255,.4)"> '+song.artist.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</span></div>';
    h += '<div style="display:flex;gap:5px;justify-content:center;margin-top:5px;flex-wrap:wrap">';
    h += '<a href="'+song.url_spotify+'" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; Spotify</a>';
    h += '<a href="'+song.url_youtube+'" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; YouTube</a>';
    h += '<a href="'+song.url_apple+'" target="_blank" class="btn btn-sm btn-outline" style="width:auto;text-decoration:none;font-size:9px;padding:4px 8px">&#9654; Apple Music</a>';
    h += '<button class="btn btn-sm btn-primary" onclick="saveToPlaylist({title:\''+song.title.replace(/'/g,"\\'")+'\',artist:\''+song.artist.replace(/'/g,"\\'")+'\',url_spotify:\''+song.url_spotify.replace(/'/g,"\\'")+'\',url_youtube:\''+song.url_youtube.replace(/'/g,"\\'")+'\',url_apple:\''+song.url_apple.replace(/'/g,"\\'")+'\'})" style="width:auto;font-size:9px;padding:4px 8px">+ Save</button></div>';
  } else {
    h += '<div style="font-size:11px;color:rgba(255,255,255,.4);padding:3px 0">Finding the perfect song...</div>';
  }
  h += '</div>';
  // Original entry
  h += '<details style="padding:6px 0;border-top:1px solid rgba(255,255,255,.05)"><summary style="font-size:9px;font-weight:600;cursor:pointer;color:rgba(255,255,255,.4);letter-spacing:1px;padding:2px 0">READ YOUR ENTRY</summary>';
  h += '<p style="font-size:12px;color:rgba(255,255,255,.6);line-height:1.6;white-space:pre-wrap;margin-top:4px;padding:4px 0">'+(entryText||getEntryText(entry)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</p></details>';
  // Close
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px;opacity:0;font-size:10px;border-color:rgba(255,255,255,.15);color:rgba(255,255,255,.5)" id="jc-close">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);

  // === CUTSCENE ANIMATION SEQUENCE ===
  // Scene 1: Title + context (fast zoom-in)
  setTimeout(function(){
    var s1 = overlay.querySelector('#jc-scene1');
    if(s1){s1.style.animation='jcTitleGlow 1s cubic-bezier(.34,1.56,.64,1) forwards';}
  }, 200);
  setTimeout(function(){
    var ctxEl = overlay.querySelector('#jc-context');
    if(ctxEl){ctxEl.style.animation='jcSlideUp .7s cubic-bezier(.16,1,.3,1) forwards';}
  }, 700);
  // Scene 2: Main content (zoom-in)
  setTimeout(function(){
    var main = overlay.querySelector('#jc-main');
    if(main){main.style.animation='jcZoomIn .8s cubic-bezier(.16,1,.3,1) forwards';}
  }, 1200);
  setTimeout(function(){
    var orb = overlay.querySelector('#jc-orb');
    if(orb){orb.style.animation='jcZoomIn .7s cubic-bezier(.34,1.56,.64,1) forwards';}
    // Start mood pulse after orb appears
    setTimeout(function(){
      var orbEl = overlay.querySelector('#jc-orb div:first-child');
      if(orbEl){orbEl.style.animation='jcMoodPulse 2.5s ease-in-out infinite';}
    }, 400);
  }, 1300);
  setTimeout(function(){
    var bars = overlay.querySelector('#jc-bars');
    if(bars){bars.style.animation='jcSlideUp .6s cubic-bezier(.16,1,.3,1) forwards';}
  }, 1700);
  // Animate mood bars after visible
  setTimeout(function(){
    var fills = overlay.querySelectorAll('.jc-bar-fill');
    for (var fi=0;fi<fills.length;fi++){if(sorted[fi]){fills[fi].style.transition='width .8s cubic-bezier(.22,1,.36,1)';fills[fi].style.width=Math.min(100,Math.round(scores[sorted[fi]]/maxScore*100))+'%';}}
  }, 1900);
  // Scene 3: Summary with typewriter (dialogue box slides up)
  setTimeout(function(){
    var box = overlay.querySelector('#jc-summary-box');
    if(box){box.style.animation='jcSlideUp .7s cubic-bezier(.16,1,.3,1) forwards';}
  }, 2200);
  // Typewriter after box is visible
  setTimeout(function(){
    var textEl = overlay.querySelector('#jc-summary-text');
    if(textEl && summaryText){
      textEl.innerHTML = '';
      var segs = summaryText.split(/(<[^>]*>)/);
      var si = 0, ci = 0;
      var charBatch = 8;
      function typeHTML(){
        if (si >= segs.length) return;
        var s = segs[si];
        if (s.charAt(0) === '<') {
          textEl.innerHTML += s;
          si++; ci = 0;
          setTimeout(typeHTML, 0);
        } else {
          if (ci < s.length) {
            var batch = s.substring(ci, ci + charBatch);
            textEl.innerHTML += batch;
            ci += charBatch;
            var delay = 18;
            for (var bi=0;bi<batch.length;bi++) {
              var ch = batch.charAt(bi);
              if (ch===' '||ch==='.'||ch===','||ch==='\u2014') delay += 40;
            }
            setTimeout(typeHTML, delay);
          } else {
            ci = 0;
            si++;
            setTimeout(typeHTML, 0);
          }
        }
      }
      typeHTML();
    }
  }, 2500);
  // Scene 4: Additional info (fade up)
  setTimeout(function(){
    var more = overlay.querySelector('#jc-more');
    if(more){more.style.animation='jcSlideUp .7s cubic-bezier(.16,1,.3,1) forwards';}
  }, 3400);
  // Close button
  setTimeout(function(){
    var close = overlay.querySelector('#jc-close');
    if(close){close.style.animation='jcZoomIn .5s cubic-bezier(.16,1,.3,1) forwards';}
  }, 4000);

  D.reflectionCount = (D.reflectionCount || 0) + 1;
  if (dayCount === 30 || dayCount === 60 || dayCount === 90 || dayCount === 180 || dayCount === 365 || (dayCount > 365 && dayCount % 365 === 0)) setTimeout(confetti, 300);
  } catch(e) { alert('Could not generate reflection: ' + e.message); }
}

// ====== COPING CARDS ======
var DEFAULT_COPING = [
  {title:'5-4-3-2-1 Grounding', text:'Name 5 things you can see. 4 things you can touch. 3 things you can hear. 2 things you can smell. 1 thing you can taste. This brings you back to the present moment.'},
  {title:'Box Breathing', text:'Inhale for 4 counts. Hold for 4 counts. Exhale for 4 counts. Hold for 4 counts. Repeat 4 times. This activates your parasympathetic nervous system.'},
  {title:'Urge Surfing', text:'Notice the urge without judgment. Observe it like a wave  it will rise, peak, and fall. Breathe through it. You don\'t have to act on it.'},
  {title:'Self-Compassion Break', text:'Put your hand on your heart. Say: "This is a moment of suffering. Suffering is part of life. May I be kind to myself."'},
  {title:'Safe Place Visualization', text:'Close your eyes. Imagine a place where you feel completely safe. Engage all your senses  what do you see, hear, smell, feel? Stay here for 5 breaths.'},
  {title:'RAIN Meditation', text:'Recognize what\'s happening. Allow it to be as it is. Investigate with kindness. Nurture with compassion.'}
];

function copingHTML() {
  var h = '<h2 class="page-title">'+t('Coping Cards')+'</h2>';
  h += '<div class="card" style="border-left:3px solid var(--accent);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(45,90,90,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-gertrude);display:flex;align-items:center;justify-content:center;flex-shrink:0"><svg viewBox="0 0 16 16" width="16" height="16" fill="#fff"><path d="M8 1L3 3.5v5c0 3.5 2 5.5 5 6.5 3-1 5-3 5-6.5v-5z"/><rect x="5" y="6" width="6" height="1" rx=".2"/><line x1="8" y1="6" x2="8" y2="4" stroke="#fff" stroke-width=".8"/></svg></div><div style="font-size:12px;color:var(--muted)">Gertrude has your back. These cards are tools for your kit — use them when the battle is hard.</div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Tap a card to expand. Use these when you need support.</p>';
  h += '<button class="btn btn-primary btn-sm" onclick="startBreathe()" style="margin-bottom:8px">Breathing Exercise</button>';
  var cards = DEFAULT_COPING.concat(D.customCopingCards || []);
  for (var i=0;i<cards.length;i++) {
    h += '<div class="coping-card" onclick="this.classList.toggle(\'open\')"><div class="title">'+safe(cards[i].title)+'</div><div class="text">'+safe(cards[i].text)+'</div></div>';
  }
  h += '<button class="btn btn-outline btn-sm" onclick="addCopingCard()" style="margin-top:8px">+ Custom Coping Card</button>';
  return h;
}

// ====== RELAPSE PREVENTION PLAN ======
function showRelapsePlan() {
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+t('My Relapse Prevention Plan')+'</h3>';
  var steps = [
    {q:t('What triggers or situations put me at risk?'),key:'relapse_triggers',pl:t('e.g. certain people, places, emotions, times of day')},
    {q:t('What are my early warning signs?'),key:'relapse_warnings',pl:t('e.g. irritability, isolation, craving intensity spikes, sleep changes')},
    {q:t('What coping strategies work for me?'),key:'relapse_coping',pl:t('e.g. calling a friend, exercise, breathing, journaling')},
    {q:t('Who can I reach out to for support?'),key:'relapse_support',pl:t('e.g. sponsor, therapist, family member, friend')},
    {q:t('What does my daily recovery routine look like?'),key:'relapse_routine',pl:t('e.g. morning meditation, meeting attendance, evening reflection')}
  ];

  for (var i=0;i<steps.length;i++) {
    var val = D[steps[i].key] || '';
    h += '<div style="margin-bottom:8px"><label style="font-size:13px;font-weight:600">' + (i+1) + '. ' + steps[i].q + '</label>';
    h += '<textarea placeholder="' + steps[i].pl + '" oninput="D[\'' + steps[i].key + '\']=this.value;saveDataSilent()" style="min-height:50px;margin-top:4px">' + val.replace(/</g,'&lt;') + '</textarea></div>';
  }
  h += '<button class="btn btn-sm btn-primary" onclick="showRelapsePlanSummary()">'+t('View Plan Summary')+'</button>';
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  if (plan.statement) renderRelapsePlanSummary();
}

function saveRelapsePlan(btn) {
  D.relapsePlan = {
    triggers: document.getElementById('rp-triggers').value.split('\n').filter(function(l){return l.trim()}),
    warningSigns: document.getElementById('rp-warnings').value.split('\n').filter(function(l){return l.trim()}),
    coping: document.getElementById('rp-coping').value.split('\n').filter(function(l){return l.trim()}),
    support: document.getElementById('rp-support').value.split('\n').filter(function(l){return l.trim()}),
    statement: document.getElementById('rp-statement').value.trim()
  };
  saveData();
  btn.closest('.overlay').remove();
  showRelapsePlanSummary();
}

function showRelapsePlanSummary() {
  var plan = D.relapsePlan;
  if (!plan || !plan.statement) return;
  var existing = document.querySelector('.overlay');
  if (existing) existing.remove();
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content" style="max-width:480px"><div style="text-align:center"><div style="font-size:40px;margin-bottom:4px">&#128737;</div><h3 style="font-size:20px;font-weight:700;color:var(--primary);margin-bottom:4px">'+t('Your Relapse Prevention Plan')+'</h3>';
  h += '<div class="card" style="background:var(--primary-light);border-left:4px solid var(--primary);padding:12px;font-size:14px;font-style:italic;line-height:1.5">"' + safe(plan.statement) + '"</div></div>';
  if (plan.triggers.length) h += '<div class="card"><h3>'+t('Triggers')+'</h3><div style="font-size:13px">' + plan.triggers.map(function(t){return '&bull; ' + safe(t)}).join('<br>') + '</div></div>';
  if (plan.warningSigns.length) h += '<div class="card"><h3>'+t('Warning Signs')+'</h3><div style="font-size:13px">' + plan.warningSigns.map(function(w){return '&bull; ' + safe(w)}).join('<br>') + '</div></div>';
  if (plan.coping.length) h += '<div class="card"><h3>'+t('Coping Strategies')+'</h3><div style="font-size:13px">' + plan.coping.map(function(c){return '&bull; ' + safe(c)}).join('<br>') + '</div></div>';
  if (plan.support.length) h += '<div class="card"><h3>'+t('Support Network')+'</h3><div style="font-size:13px">' + plan.support.map(function(s){return '&bull; ' + safe(s)}).join('<br>') + '</div></div>';
  h += '<button class="btn btn-outline btn-sm" onclick="showRelapsePlan()">'+t('Edit Plan')+'</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function addCopingCard() {
  var title = prompt(t('Card title:'));
  if (!title) return;
  var text = prompt(t('Card text (what helps you cope?):'));
  if (!text) return;
  if (!D.customCopingCards) D.customCopingCards = [];
  D.customCopingCards.push({title:title.trim(),text:text.trim()});
  saveData();
}

// ====== CARE PAGE ======
function careHTML() {
  var h = '<h2 class="page-title">'+t('Wellness')+'</h2>';
  h += '<div class="card" style="text-align:center;padding:20px;background:linear-gradient(135deg,var(--primary-light),var(--card))">';
  h += '<div class="breath-circle" style="width:80px;height:80px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;border:3px solid var(--primary);border-radius:50%;font-size:13px;color:var(--primary);font-weight:600">'+t('Breathe')+'</div>';
  h += '<h3 style="font-size:16px;font-weight:700">'+t('Mindful Breathing')+'</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin:4px 0 12px">'+t('Follow the guided breathing exercise to calm your mind and center yourself.')+'</p>';
  h += '<button class="btn btn-primary btn-sm" onclick="startBreathe()" style="width:auto;display:inline-flex">'+t('Start Breathing')+'</button></div>';

  // Sub-grid for care tools
  h += '<div class="sub-grid">';
  h += '<div class="sub-item" onclick="goTo(\'coping\')">'+t('Coping Cards')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'assessment\')">'+t('Assessment')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'relapseplan\')" style="border-color:var(--accent)">'+t('Relapse Plan')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'relapserescue\')" style="border-color:var(--danger)">&#129309; '+t('Relapse Rescue')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'relapsegraveyard\')" style="border-color:var(--muted)">&#9904; '+t('Relapse Graveyard')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'safety\')">'+t('Safety Plans')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'oswald\')" style="border-color:#4338ca">&#127987; Oswald\'s View</div>';
  h += '</div>';

  // Journal-based insights
  h += journalInsightsHTML();

  // Daily check-in
  h += '<div class="card"><h3>'+t('Daily Check-In')+'</h3>';
  var today = new Date().toDateString();
  var checkedIn = D.checkins.filter(function(c){return c.date===today}).length;
  if (checkedIn) {
    var lastCheckin = D.checkins.filter(function(c){return c.date===today});
    var ciData = lastCheckin.length ? lastCheckin[lastCheckin.length-1] : null;
    var moodEmojis = ['&#128545;','&#128544;','&#128529;','&#128578;','&#128513;'];
    var moodStr = ciData && ciData.mood ? moodEmojis[ciData.mood-1] : '&#9989;';
    h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;background:var(--primary-light);border-radius:10px;margin-bottom:6px"><span style="font-size:22px">'+moodStr+'</span><div style="flex:1"><div style="font-weight:600;font-size:13px;color:var(--primary)">'+t('Checked in today')+'</div>' +
      (ciData && ciData.win ? '<div style="font-size:11px;color:var(--text);margin-top:2px">&#127775; "'+ciData.win.substring(0,60)+(ciData.win.length>60?'...':'')+'"</div>' : '') +
      '</div></div>';
    h += '<button class="btn btn-sm btn-outline" onclick="doCheckin()" style="font-size:11px">&#127918; Return to the Roll</button>';
  } else {
    h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">'+t('How was your day?')+'</p>';
    h += '<button class="btn btn-primary btn-sm" onclick="doCheckin()">'+t('Mark Presence')+'</button>';
  }
  h += '</div>';

  // Helplines
  var helplines = [
    {name:'988 Suicide & Crisis Lifeline',num:'988',desc:'Call or text 988'},
    {name:'Crisis Text Line',num:'741741',desc:'Text HOME to 741741'},
    {name:'SAMHSA National Helpline',num:'1-800-662-4357',desc:'24/7 treatment referral'},
    {name:'National Suicide Prevention Lifeline',num:'1-800-273-8255',desc:'24/7 confidential support'},
    {name:'National Hopeline Network',num:'1-800-442-4673',desc:'Crisis intervention & suicide prevention'},
    {name:'Veterans Crisis Line',num:'1-800-273-8255',desc:'Press 1 for veterans'},
    {name:'Trans Lifeline',num:'1-877-565-8860',desc:'Peer support for trans community'},
    {name:'The Trevor Project',num:'1-866-488-7386',desc:'LGBTQ+ youth crisis support'},
    {name:'National Domestic Violence Hotline',num:'1-800-799-7233',desc:'Support for domestic violence'},
    {name:'National Child Abuse Hotline',num:'1-800-422-4453',desc:'Child abuse reporting & support'},
    {name:'RAINN Sexual Assault Hotline',num:'1-800-656-4673',desc:'Sexual assault support'},
    {name:'NAMI Helpline',num:'1-800-950-6264',desc:'Mental health support & resources'},
    {name:'Eating Disorders Helpline',num:'1-800-931-2237',desc:'Support for eating disorders'},
    {name:'Substance Abuse Helpline',num:'1-800-327-5050',desc:'24/7 substance abuse support'},
    {name:'Gambling Problem Helpline',num:'1-800-522-4700',desc:'Problem gambling support'},
    {name:'Self-Harm Hotline',num:'1-800-366-8288',desc:'Self-harm crisis support'},
    {name:'Warmline (Non-crisis)',num:'1-888-448-9777',desc:'Peer support for non-crisis moments'}
  ];
  var showCount = 4;
  h += '<div class="card"><h3>'+t('Helplines')+' <span style="font-size:12px;color:var(--muted);font-weight:400">(' + helplines.length + ' '+t('available')+')</span></h3>';
  for (var i=0;i<Math.min(showCount, helplines.length);i++) {
    h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+helplines[i].name+'</div><div style="font-size:11px;color:var(--muted)">'+helplines[i].desc+'</div></div><a href="tel:'+helplines[i].num+'" style="font-size:16px;font-weight:700;color:var(--primary);text-decoration:none">'+helplines[i].num+'</a></div>';
  }
  h += '<div id="more-helplines" style="display:none">';
  for (var i=showCount;i<helplines.length;i++) {
    h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:'+(i<helplines.length-1?'1px solid var(--border)':'none')+'"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+helplines[i].name+'</div><div style="font-size:11px;color:var(--muted)">'+helplines[i].desc+'</div></div><a href="tel:'+helplines[i].num+'" style="font-size:16px;font-weight:700;color:var(--primary);text-decoration:none">'+helplines[i].num+'</a></div>';
  }
  h += '</div>';
  h += '<button class="btn btn-sm btn-outline" onclick="var el=document.getElementById(\'more-helplines\');var btn=this;if(el.style.display===\'none\'){el.style.display=\'block\';btn.textContent=\''+t('Show Less')+'\';}else{el.style.display=\'none\';btn.textContent=\''+t('Show All Helplines').replace(/'/g,"\\'")+' ' + helplines.length + '\';}" style="margin-top:6px;width:auto">'+t('Show All Helplines')+' '+helplines.length+'</button>';
  h += '</div>';

  h += '<div class="card"><h3>'+t('Addiction Assessment')+'</h3><p style="font-size:13px;color:var(--muted);margin-bottom:8px">'+t('Check in with yourself about your substance use.')+'</p><button class="btn btn-outline btn-sm" onclick="goTo(\'assessment\')">'+t('Take Assessment')+'</button></div>';

  // Arthur's Safety Plan
  h += safetyPlanHTML();

  return h;
}

function journalInsightsHTML() {
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:20px">&#128202;</div><h3 style="margin:0">'+t('Your Journal Insights')+'</h3></div>';
  if (!D.journal.length && !D.moods.length) {
    h += '<div class="empty-state">'+t('No data yet. Write in your journal and log moods to see insights here.')+'</div>';
    h += '</div>';
    return h;
  }
  // Mood stats
  var moodCounts = [0,0,0,0,0];
  for (var mi=0;mi<D.moods.length;mi++) { moodCounts[D.moods[mi].val-1]++; }
  var mostCommonMood = 0;
  for (var mi2=0;mi2<5;mi2++) { if (moodCounts[mi2] > moodCounts[mostCommonMood]) mostCommonMood = mi2; }
  // Journal stats
  var totalWords = 0, longestEntry = '';
  for (var ji=0;ji<D.journal.length;ji++) {
    var jt = getEntryText(D.journal[ji]);
    var words = jt ? jt.split(/\s+/).length : 0;
    totalWords += words;
    if (jt && jt.length > longestEntry.length) longestEntry = jt;
  }
  // Keyword frequency from journal entries
  var keywords = {};
  var topicWords = ['family','friend','work','school','health','anxiety','stress','happy','sad','angry','love','hope','fear','trigger','craving','proud','grateful','tired','alone','help'];
  for (var ji2=0;ji2<D.journal.length;ji2++) {
    var text = getEntryText(D.journal[ji2]);
    if (typeof text !== 'string' || !text) continue;
    text = text.toLowerCase();
    for (var kw=0;kw<topicWords.length;kw++) {
      if (text.indexOf(topicWords[kw]) !== -1) {
        if (!keywords[topicWords[kw]]) keywords[topicWords[kw]] = 0;
        keywords[topicWords[kw]]++;
      }
    }
  }
  var sortedKW = Object.keys(keywords).sort(function(a,b){return keywords[b]-keywords[a]}).slice(0,5);
  // Week mood trend
  var weekMoods = D.moods.slice(-7);
  var weekAvg = weekMoods.length ? (weekMoods.reduce(function(s,m){return s+m.val},0)/weekMoods.length).toFixed(1) : '';
  h += '<div class="stat-grid" style="margin-bottom:6px">';
  h += '<div class="stat-card"><div class="num">' + D.journal.length + '</div><div class="label">Entries</div></div>';
  h += '<div class="stat-card"><div class="num">' + (D.journal.length ? Math.round(totalWords/D.journal.length) : 0) + '</div><div class="label">Avg Words</div></div>';
  h += '<div class="stat-card"><div class="num">' + MOODS[mostCommonMood].emoji + '</div><div class="label">Common Mood</div></div>';
  h += '</div>';
  // Mood trend mini bar
  if (weekMoods.length) {
    var colors = ['#ef4444','#f97316','#eab308','#22c55e','#059669'];
    h += '<div style="margin-bottom:6px"><div style="font-size:11px;color:var(--muted);margin-bottom:3px">This week\'s mood trend (avg ' + weekAvg + ')</div><div class="mood-chart" style="height:30px">';
    for (var wi=0;wi<weekMoods.length;wi++) {
      var pct = (weekMoods[wi].val / 5) * 100;
      h += '<div class="mood-bar" style="height:'+pct+'%;background:'+colors[weekMoods[wi].val-1]+'"></div>';
    }
    h += '</div></div>';
  }
  // Top topics
  if (sortedKW.length) {
    h += '<div style="font-size:11px;color:var(--muted)"><strong>Top topics you write about:</strong> ' + sortedKW.join(', ') + '</div>';
  }
  h += '</div>';
  return h;
}

function showSOS() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var helplines = [
    {name:'988 Suicide & Crisis Lifeline',num:'988',desc:'Call or text 988'},
    {name:'Crisis Text Line',num:'741741',desc:'Text HOME to 741741'},
    {name:'SAMHSA National Helpline',num:'1-800-662-4357',desc:'24/7 treatment referral'},
    {name:'National Suicide Prevention Lifeline',num:'1-800-273-8255',desc:'24/7 confidential support'},
    {name:'National Hopeline Network',num:'1-800-442-4673',desc:'Crisis intervention & suicide prevention'},
    {name:'Veterans Crisis Line',num:'1-800-273-8255',desc:'Press 1 for veterans'},
    {name:'Trans Lifeline',num:'1-877-565-8860',desc:'Peer support for trans community'},
    {name:'The Trevor Project',num:'1-866-488-7386',desc:'LGBTQ+ youth crisis support'},
    {name:'National Domestic Violence Hotline',num:'1-800-799-7233',desc:'Support for domestic violence'},
    {name:'National Child Abuse Hotline',num:'1-800-422-4453',desc:'Child abuse reporting & support'},
    {name:'RAINN Sexual Assault Hotline',num:'1-800-656-4673',desc:'Sexual assault support'},
    {name:'NAMI Helpline',num:'1-800-950-6264',desc:'Mental health support & resources'},
    {name:'Eating Disorders Helpline',num:'1-800-931-2237',desc:'Support for eating disorders'},
    {name:'Substance Abuse Helpline',num:'1-800-327-5050',desc:'24/7 substance abuse support'},
    {name:'Gambling Problem Helpline',num:'1-800-522-4700',desc:'Problem gambling support'},
    {name:'Self-Harm Hotline',num:'1-800-366-8288',desc:'Self-harm crisis support'},
    {name:'Warmline (Non-crisis)',num:'1-888-448-9777',desc:'Peer support for non-crisis moments'}
  ];
  function helplinesHTML() {
    var hh = '';
    for (var i=0;i<helplines.length;i++) {
      hh += '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+helplines[i].name+'</div><div style="font-size:11px;color:var(--muted)">'+helplines[i].desc+'</div></div><a href="tel:'+helplines[i].num+'" style="font-size:16px;font-weight:700;color:var(--primary);text-decoration:none">'+helplines[i].num+'</a></div>';
    }
    return hh;
  }
  var h = '<div class="overlay-content" style="text-align:center"><div style="font-size:52px;font-weight:900;color:var(--danger);margin-bottom:4px;letter-spacing:8px">SOS</div><h3 style="font-size:20px;font-weight:700;color:var(--danger)">You are not alone.</h3><p style="font-size:14px;color:var(--muted);margin:8px 0 16px">Reach out. Help is available 24/7.</p><div style="text-align:left">';
  h += '<div class="card" style="cursor:pointer;padding:12px;margin:6px 0" onclick="var b=document.getElementById(\'sos-breathe-body\');var i=this.querySelector(\'.toggle-icon\');if(b.style.display===\'none\'){b.style.display=\'block\';i.textContent=\'&#9660;\'}else{b.style.display=\'none\';i.textContent=\'&#9654;\'}"><div style="display:flex;justify-content:space-between;align-items:center"><strong>&#128166; Breathe</strong><span class="toggle-icon">&#9654;</span></div><div id="sos-breathe-body" style="display:none;margin-top:10px;text-align:center"><div style="font-size:13px;color:var(--muted);margin-bottom:8px">A quick guided breathing exercise to calm your nervous system.</div><button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();setTimeout(function(){startBreathe()},100)" style="width:auto">Start Breathing Exercise</button></div></div>';
  h += '<div class="card" style="cursor:pointer;padding:12px;margin:6px 0" onclick="var b=document.getElementById(\'sos-helplines-body\');var i=this.querySelector(\'.toggle-icon\');if(b.style.display===\'none\'){b.style.display=\'block\';i.textContent=\'&#9660;\'}else{b.style.display=\'none\';i.textContent=\'&#9654;\'}"><div style="display:flex;justify-content:space-between;align-items:center"><strong>&#128222; Crisis Helplines</strong><span class="toggle-icon">&#9654;</span></div><div id="sos-helplines-body" style="display:none;margin-top:8px">' + helplinesHTML() + '</div></div>';
  h += '</div><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:12px">'+t('Close')+'</button></div>';
  D.sosUsed = true;
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  saveData();
}

var RESCUE_TRIGGERS = [
  'I was around people/places I used with',
  'I was stressed or overwhelmed',
  'I felt angry or frustrated',
  'I felt sad or lonely',
  'I was celebrating and lost control',
  'I had a craving I couldn\'t resist',
  'I stopped using my coping tools',
  'I don\'t know  it just happened'
];

var RESCUE_ACTIONS = [
  { label: 'Call a supporter', icon: '&#128222;', action: 'call' },
  { label: 'Go to a meeting', icon: '&#128101;', action: 'meeting' },
  { label: 'Start breathing', icon: '&#128128;', action: 'breathe' },
  { label: 'Write about it', icon: '&#128221;', action: 'journal' },
  { label: 'Take a walk', icon: '&#127962;', action: 'walk' },
  { label: 'Review my plan', icon: '&#128737;', action: 'plan' },
  { label: 'Coping cards', icon: '&#127912;', action: 'coping' },
  { label: 'Read recovery stories', icon: '&#128214;', action: 'stories' }
];

function showRelapseRescue() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'rescue-ov';
  var days = soberDays();
  var h = '<div class="overlay-content" style="max-width:440px;text-align:center">';
  h += '<div style="font-size:48px;margin-bottom:4px">&#129309;</div>';
  h += '<h3 style="font-size:20px;font-weight:700;color:var(--text);margin-bottom:4px">You\'re still here. That matters.</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:10px;line-height:1.5">A slip doesn\'t erase your progress. ' + (days > 0 ? 'You had <strong>' + days + ' day' + (days !== 1 ? 's' : '') + '</strong> of growth  that experience stays with you.' : 'Every moment is a chance to start again.') + '</p>';
  h += '<div class="card" style="background:var(--primary-light);padding:14px;margin-bottom:12px">';
  h += '<div style="font-weight:600;font-size:14px;margin-bottom:8px">What led to this moment?</div>';
  for (var ti=0;ti<RESCUE_TRIGGERS.length;ti++) {
    h += '<label style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);font-size:13px;cursor:pointer"><input type="radio" name="rescue-trigger" value="' + RESCUE_TRIGGERS[ti].replace(/'/g, "\\'") + '" style="width:auto;flex-shrink:0"><span>' + RESCUE_TRIGGERS[ti] + '</span></label>';
  }
  h += '</div>';
  h += '<div style="font-size:13px;color:var(--muted);margin-bottom:10px">What helps right now?</div>';
  h += '<div id="rescue-actions" style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px">';
  for (var ai=0;ai<RESCUE_ACTIONS.length;ai++) {
    h += '<div style="padding:8px 6px;border:1px solid var(--border);border-radius:10px;cursor:pointer;font-size:11px;text-align:center" onclick="rescueAction(\'' + RESCUE_ACTIONS[ai].action + '\',this)"><span style="font-size:20px;display:block;margin-bottom:2px">' + RESCUE_ACTIONS[ai].icon + '</span>' + RESCUE_ACTIONS[ai].label + '</div>';
  }
  h += '</div>';
  h += '<button class="btn btn-primary btn-sm" onclick="rescueRecommit()" style="width:100%;margin-bottom:6px">&#128154; Re-commit to my recovery</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="rescueSkip()" style="width:100%">I\'m okay for now</button>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function rescueAction(action, el) {
  var els = document.querySelectorAll('#rescue-actions > div');
  for (var i=0;i<els.length;i++) els[i].style.borderColor = 'var(--border)';
  el.style.borderColor = 'var(--primary)';
  el.style.background = 'var(--primary-light)';
  if (action === 'breathe') { setTimeout(function(){ startBreathe(); }, 300); }
  if (action === 'plan') { setTimeout(function(){ showRelapsePlan(); }, 300); }
  if (action === 'coping') { setTimeout(function(){ goTo('coping'); }, 300); }
  if (action === 'journal') { setTimeout(function(){ goTo('journal'); }, 300); }
}

function rescueRecommit() {
  var selected = document.querySelector('input[name="rescue-trigger"]:checked');
  var actionEl = document.querySelector('#rescue-actions > div[style*="var(--primary)"]');
  var trigger = selected ? selected.value : 'unspecified';
  var action = actionEl ? actionEl.textContent.trim() : 'none';
  var prevDays = soberDays();
  var log = { date: Date.now(), trigger: trigger, actionTaken: action, prevStreak: prevDays };
  if (!D.relapseRescue) D.relapseRescue = { logs: [] };
  D.relapseRescue.logs.push(log);
  D.sobriety.relapseDates.push(Date.now());
  D.sobriety.startDate = Date.now();
  D.streak = 0;
  scheduleFollowUp();
  saveData();
  setTimeout(kingdomDamage, 150);
  setTimeout(villageDamage, 200);
  document.getElementById('rescue-ov').innerHTML = '<div class="overlay-content" style="max-width:420px;text-align:center"><div style="font-size:56px;margin:8px 0">&#128154;</div><h3 style="font-size:20px;font-weight:700;color:var(--primary)">You re-committed.</h3><p style="font-size:13px;color:var(--muted);margin:6px 0">Your ' + prevDays + ' day' + (prevDays !== 1 ? 's' : '') + ' of growth isn\'t lost  it\'s part of your journey. Day 1 starts now, and you showed up.</p><div style="background:var(--primary-light);border-radius:10px;padding:10px;margin:8px 0;font-size:12px;color:var(--muted);line-height:1.5">&#128161; Most people have multiple attempts before long-term recovery. Each attempt teaches you something. Write down what you learned this time.</div><div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" onclick="this.closest(\'#rescue-ov\').remove();goTo(\'royalpardon\')">&#128081; Fresh Start</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'#rescue-ov\').remove();goTo(\'relapsegraveyard\')">&#9904; Relapse Graveyard</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'#rescue-ov\').remove()">Keep going</button></div></div>';
}

function rescueSkip() {
  document.getElementById('rescue-ov').remove();
}

// ====== POST-CRISIS FOLLOW-UP ======
function checkPostCrisis() {
  if (D._postCrisisPending && D.sosUsed) {
    D._postCrisisPending = false; saveData();
    var overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center"><div style="font-size:40px;margin-bottom:6px">&#129309;</div><h3 style="font-size:18px;font-weight:700">'+t('How are you feeling now?')+'</h3><p style="font-size:13px;color:var(--muted);margin:6px 0;line-height:1.5">'+t('You reached out for help earlier. That took strength. Would you like to check in with yourself?')+'</p><div style="display:flex;gap:6px;margin-top:8px"><button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();goTo(\'journal\')" style="flex:1">'+t('Journal about it')+'</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="flex:1">'+t("I'm good")+'</button></div></div>';
    document.body.appendChild(overlay);
  }
}

// ====== EMERGENCY CONTACTS SETTINGS ======
function emergencyContactsSettingsHTML() {
  var h = '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3>'+t('Emergency Contacts')+'</h3><p style="font-size:11px;color:var(--muted);margin-bottom:6px">'+t('People you can call when you need support. These appear in the SOS crisis flow.')+'</p>';
  if (D.emergencyContacts && D.emergencyContacts.length) {
    for (var ei=0;ei<D.emergencyContacts.length;ei++) {
      var ec = D.emergencyContacts[ei];
      h += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+safe(ec.name)+'</div><div style="font-size:11px;color:var(--muted)">'+ec.num+'</div></div><button class="btn btn-sm btn-outline" onclick="removeEmergencyContact('+ei+')" style="font-size:10px">'+t('Remove')+'</button></div>';
    }
  } else {
    h += '<p style="font-size:12px;color:var(--muted);font-style:italic">'+t('No emergency contacts yet.')+'</p>';
  }
  h += '<div style="display:flex;gap:6px;margin-top:6px"><input type="text" id="ec-name" placeholder="'+t('Name')+'" style="flex:1;padding:6px;font-size:13px"><input type="tel" id="ec-num" placeholder="'+t('Phone number')+'" style="flex:1;padding:6px;font-size:13px"><button class="btn btn-sm btn-primary" onclick="addEmergencyContact()" style="white-space:nowrap">'+t('Add')+'</button></div></div>';
  return h;
}

function addEmergencyContact() {
  var name = document.getElementById('ec-name');
  var num = document.getElementById('ec-num');
  if (!name || !num || !name.value.trim() || !num.value.trim()) { showToast(t('Enter name and phone number'), 'error'); return; }
  if (!D.emergencyContacts) D.emergencyContacts = [];
  D.emergencyContacts.push({name: name.value.trim(), num: num.value.trim()});
  saveData();
  name.value = ''; num.value = '';
  render();
}

function removeEmergencyContact(idx) {
  if (!D.emergencyContacts) return;
  D.emergencyContacts.splice(idx, 1);
  saveData();
  render();
}

// ====== ACCOUNTABILITY CHECK-IN ======
function accountabilityHTML() {
  var h = '<h2 class="page-title">&#128170; Accountability Check-In</h2>';
  if (!D.buddy || !D.buddy.name) {
    h += '<div class="card" style="text-align:center;padding:20px">';
    h += '<div style="font-size:32px;margin-bottom:8px">&#128104;&#8205;&#128104;</div>';
    h += '<div style="font-size:14px;font-weight:600;margin-bottom:4px">No accountability partner yet</div>';
    h += '  <div style="font-size:12px;color:var(--muted)">Set up a partner to use accountability check-ins.</div>';
    h += '<button class="btn btn-primary btn-sm" onclick="goTo(\'buddy\')" style="margin-top:8px">Go to Partner</button>';
    h += '</div>';
    return h;
  }
  if (!D.accountability) D.accountability = { frequency: 1, lastCheckin: null, streak: 0, bestStreak: 0, checkins: [] };
  var acc = D.accountability;
  var buddyName = D.buddy.name;
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Stay consistent with ' + buddyName + '. Choose how often you check in and track your reliability.</p>';

  // Stats
  var streakLabel = acc.streak > 0 ? acc.streak + ' day' + (acc.streak !== 1 ? 's' : '') : 'Not started';
  var totalCheckins = acc.checkins ? acc.checkins.length : 0;
  h += '<div class="stat-grid" style="margin-bottom:8px">';
  h += '<div class="stat-card"><div class="num">' + totalCheckins + '</div><div class="label">Check-Ins</div></div>';
  h += '<div class="stat-card"><div class="num">' + streakLabel + '</div><div class="label">Current Streak</div></div>';
  h += '<div class="stat-card"><div class="num">' + (acc.bestStreak || 0) + '</div><div class="label">Best Streak</div></div>';
  h += '</div>';

  // Check-in frequency setting
  h += '<div class="card"><h3 style="font-size:14px;margin-bottom:8px">&#128200; Frequency</h3>';
  h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
  var freqs = [
    { val: 1, label: 'Daily' },
    { val: 2, label: 'Every 2 days' },
    { val: 3, label: 'Every 3 days' },
    { val: 7, label: 'Weekly' }
  ];
  for (var fi=0;fi<freqs.length;fi++) {
    var sel = acc.frequency === freqs[fi].val ? ' btn-primary' : ' btn-outline';
    h += '<button class="btn btn-sm' + sel + '" onclick="accSetFreq(' + freqs[fi].val + ')">' + freqs[fi].label + '</button>';
  }
  h += '</div></div>';

  // Status
  var now = Date.now();
  var nextDue = acc.lastCheckin ? acc.lastCheckin + acc.frequency * 86400000 : now;
  var isDue = !acc.lastCheckin || now >= nextDue;
  var hoursLeft = nextDue > now ? Math.round((nextDue - now) / 3600000) : 0;

  if (isDue) {
    h += '<div class="card" style="border:2px solid var(--accent);background:#f5efe6;text-align:center">';
    h += '<div style="font-size:24px;margin-bottom:4px">&#128170;</div>';
    h += '<div style="font-weight:700;font-size:15px;margin-bottom:4px">Time to Check in with ' + buddyName + '</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin-bottom:8px">Reach out and see how they\'re doing. Accountability keeps you both strong.</div>';
    h += '<button class="btn btn-primary btn-sm" onclick="accCheckin()">I Checked In</button>';
    h += '</div>';
  } else {
    var nextDate = new Date(nextDue);
    h += '<div class="card" style="text-align:center;background:var(--primary-light)">';
    h += '<div style="font-size:13px;color:var(--muted);margin-bottom:2px">Next check-in due</div>';
    h += '<div style="font-size:16px;font-weight:700;color:var(--primary)">' + nextDate.toLocaleDateString() + ' (~' + hoursLeft + 'h)</div>';
    h += '<div style="font-size:11px;color:var(--muted);margin-top:2px">Stay consistent  every check-in builds trust.</div>';
    h += '</div>';
  }

  // History
  h += '<div class="card"><h3 style="font-size:14px;margin-bottom:8px">Check-In History</h3>';
  var recent = acc.checkins ? acc.checkins.slice().reverse().slice(0,10) : [];
  if (!recent.length) {
    h += '<div class="empty-state">No accountability check-ins yet.</div>';
  } else {
    for (var hi=0;hi<recent.length;hi++) {
      var c = recent[hi];
      var d = new Date(c.date);
      h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border)">';
      h += '<span style="font-size:16px">' + (c.rating >= 4 ? '&#128513;' : c.rating >= 3 ? '&#128522;' : '&#128591;') + '</span>';
      h += '<div style="flex:1"><div style="font-size:12px;font-weight:600">' + d.toLocaleDateString() + '</div>';
      if (c.note) h += '<div style="font-size:11px;color:var(--muted)">' + c.note + '</div>';
      h += '</div></div>';
    }
  }
  if (recent.length >= 10) h += '<div style="font-size:11px;color:var(--muted);text-align:center;margin-top:4px">Showing last 10 of ' + acc.checkins.length + '</div>';
  h += '</div>';

  return h;
}
function accSetFreq(val) {
  if (!D.accountability) D.accountability = { frequency: 1, lastCheckin: null, streak: 0, bestStreak: 0, checkins: [] };
  D.accountability.frequency = val;
  saveData(); render();
}
function accCheckin() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'acc-ov';
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:4px">&#128170; Accountability Check-In</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">How did the interaction with ' + (D.buddy?D.buddy.name:'your partner') + ' go?</p>';
  h += '<div style="margin-bottom:10px"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">How are you feeling about your recovery right now?</label>';
  h += '<div class="mood-row" id="acc-moods">';
  var labels = ['Struggling','Tough','Okay','Good','Strong'];
  for (var i=0;i<5;i++) h += '<button class="mood-btn" data-val="'+(i+1)+'" onclick="[].forEach.call(document.querySelectorAll(\'#acc-moods .mood-btn\'),function(b){b.classList.remove(\'active\')});this.classList.add(\'active\')">'+labels[i]+'</button>';
  h += '</div></div>';
  h += '<textarea id="acc-note" placeholder="Any wins, concerns, or things you discussed?" style="min-height:80px"></textarea>';
  h += '<button class="btn btn-primary btn-sm" onclick="accSave()" style="width:100%">Seal the Record</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="width:100%;margin-top:4px">Cancel</button>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}
function accSave() {
  if (!D.accountability) D.accountability = { frequency: 1, lastCheckin: null, streak: 0, bestStreak: 0, checkins: [] };
  var moodBtn = document.querySelector('#acc-moods .mood-btn.active');
  var note = document.getElementById('acc-note');
  var now = Date.now();
  var entry = { date: now, rating: moodBtn ? parseInt(moodBtn.getAttribute('data-val')) : 3, note: note ? note.value.trim() : '' };
  if (!D.accountability.checkins) D.accountability.checkins = [];
  D.accountability.checkins.push(entry);
  D.accountability.lastCheckin = now;
  // Update streak
  var streak = 0;
  var sorted = D.accountability.checkins.slice().sort(function(a,b){return b.date - a.date});
  for (var si=0;si<sorted.length;si++) {
    if (si === 0) { streak = 1; continue; }
    var gap = (sorted[si-1].date - sorted[si].date) / 86400000;
    if (gap <= D.accountability.frequency * 1.5) streak++;
    else break;
  }
  D.accountability.streak = streak;
  if (streak > (D.accountability.bestStreak || 0)) D.accountability.bestStreak = streak;
  saveData();
  var ov = document.getElementById('acc-ov');
  if (ov) ov.remove();
  render();
}
function accPendingHTML() {
  if (!D.buddy || !D.buddy.name) return '';
  if (!D.accountability) D.accountability = { frequency: 1, lastCheckin: null, streak: 0, bestStreak: 0, checkins: [] };
  var now = Date.now();
  var nextDue = D.accountability.lastCheckin ? D.accountability.lastCheckin + D.accountability.frequency * 86400000 : now;
  if (D.accountability.lastCheckin && now < nextDue) return '';
  var buddyName = D.buddy.name;
  var daysSince = D.accountability.lastCheckin ? Math.round((now - D.accountability.lastCheckin) / 86400000) : 0;
  var h = '<div class="card" style="border-left:4px solid var(--accent);cursor:pointer;background:linear-gradient(135deg,#f5efe6,var(--card))" onclick="accCheckin()">';
  h += '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:32px">&#128170;</div><div><div style="font-weight:700;font-size:14px">Accountability Check-In</div><div style="font-size:12px;color:var(--muted)">' + (daysSince > 0 ? daysSince + ' day' + (daysSince !== 1 ? 's' : '') + ' since last check-in' : 'Time to check in') + ' with ' + buddyName + '.</div></div></div></div>';
  return h;
}

function relapseRescueHTML() {
  if (!D.relapseRescue) D.relapseRescue = { logs: [] };
  var logs = D.relapseRescue.logs || [];
  var h = '<h2 class="page-title">&#129309; '+t('Relapse Recovery')+'</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">A place to process slips and re-commit to your journey.</p>';

  h += '<div class="card" style="border-left:3px solid var(--primary);text-align:center">';
  h += '<div style="font-size:14px;margin-bottom:8px">If you\'ve had a slip, let\'s work through it together.</div>';
  h += '<button class="btn btn-primary btn-sm" onclick="showRelapseRescue()" style="width:100%">&#129309; Start Rescue Guide</button>';
  h += '</div>';

  if (logs.length > 0) {
    h += '<h3 style="font-size:14px;font-weight:700;margin:12px 0 6px">Past Entries</h3>';
    for (var li=logs.length-1;li>=0;li--) {
      var l = logs[li];
      h += '<div class="card" style="font-size:12px;padding:12px">';
      h += '<div style="display:flex;justify-content:space-between;align-items:center"><span style="font-weight:600">' + new Date(l.date).toLocaleDateString() + '</span><span style="font-size:10px;color:var(--muted)">' + (l.prevStreak > 0 ? l.prevStreak + ' day streak' : '') + '</span></div>';
      h += '<div style="margin-top:4px"><span style="color:var(--muted)">Trigger:</span> ' + safe(l.trigger) + '</div>';
      if (l.actionTaken && l.actionTaken !== 'none') h += '<div><span style="color:var(--muted)">Action:</span> ' + safe(l.actionTaken) + '</div>';
      h += '</div>';
    }
    h += '<button class="btn btn-outline btn-sm" onclick="if(confirm(\'Clear all relapse logs?\')){D.relapseRescue.logs=[];saveData();render()}" style="width:100%;color:var(--danger);margin-top:4px">Clear History</button>';
  } else {
    h += '<div class="card" style="text-align:center;padding:20px;color:var(--muted);font-size:13px">No entries yet. The rescue guide is here whenever you need it.</div>';
  }
  return h;
}

// ====== ARTHUR'S INSIGHTS (PATTERN DETECTION) ======
function buildMoodTopicInsights() {
  var insights = [];
  if (!D.journal || D.journal.length < 3) return insights;
  var topicMoods = {}, topicCounts = {};
  var moodLabels = {sad:2,angry:1.5,anxious:2.5,happy:4,grateful:4.5,reflective:3.5,hopeful:4,mixed:3};
  var recent = D.journal.slice(-20);
  for (var mi=0;mi<recent.length;mi++) {
    var txt = getEntryText(recent[mi]);
    if (!txt) continue;
    var detected = detectMood(txt);
    var moodScore = moodLabels[detected.primary] || 3;
    var topics = extractTopics(txt);
    for (var tii=0;tii<topics.length;tii++) {
      var t = topics[tii];
      if (!topicMoods[t]) { topicMoods[t] = 0; topicCounts[t] = 0; }
      topicMoods[t] += moodScore;
      topicCounts[t]++;
    }
  }
  var topicLabels = {craving:'cravings',work:'work',relationships:'relationships',health:'health',wellness:'wellness',school:'school',finances:'finances',progress:'progress',loneliness:'loneliness'};
  var highTopics = [], lowTopics = [];
  for (var t2 in topicCounts) {
    if (topicCounts[t2] < 2) continue;
    var avg = topicMoods[t2] / topicCounts[t2];
    if (avg >= 4) highTopics.push({topic:t2,score:avg});
    else if (avg <= 2.5) lowTopics.push({topic:t2,score:avg});
  }
  if (highTopics.length) {
    var best = highTopics.sort(function(a,b){return b.score-a.score})[0];
    insights.push({icon:'&#127942;',text:'The topics you write about when your mood is <strong>highest</strong>: <strong>' + (topicLabels[best.topic]||best.topic) + '</strong> (avg mood ' + best.score.toFixed(1) + '/5). This is a protective factor  lean into it.',severity:'positive'});
  }
  if (lowTopics.length) {
    var worst = lowTopics.sort(function(a,b){return a.score-b.score})[0];
    insights.push({icon:'&#128200;',text:'The topic with your <strong>lowest average mood</strong>: <strong>' + (topicLabels[worst.topic]||worst.topic) + '</strong> (avg mood ' + worst.score.toFixed(1) + '/5). Noticing this pattern is the first step to addressing it.',severity:worst.score < 2 ? 'high' : 'medium'});
  }
  return insights;
}

function buildPeriodComparisonInsights() {
  var insights = [];
  var now = Date.now();
  var weekAgo = now - 7*86400000;
  var twoWeeksAgo = now - 14*86400000;
  if (!D.journal || D.journal.length < 2) return insights;
  var recent = D.journal.filter(function(j){return new Date(j.date).getTime() > weekAgo});
  var previous = D.journal.filter(function(j){var t=new Date(j.date).getTime();return t > twoWeeksAgo && t <= weekAgo});
  if (recent.length < previous.length && previous.length >= 2) {
    insights.push({icon:'&#128200;',text:'Your journal entries dropped from <strong>' + previous.length + '</strong> to <strong>' + recent.length + '</strong> compared to last week. Declining engagement can be an early warning sign.',severity:'medium'});
  } else if (recent.length > previous.length && recent.length >= 3) {
    insights.push({icon:'&#9989;',text:'Your journal frequency <strong>increased</strong> this week (' + recent.length + ' entries, up from ' + previous.length + ' last week). Consistent self-reflection builds resilience.',severity:'positive'});
  }
  if (D.checkins && D.checkins.length >= 3) {
    var recentC = D.checkins.filter(function(c){var d=new Date(c.date||c.timestamp);return d.getTime() > weekAgo});
    var prevC = D.checkins.filter(function(c){var d=new Date(c.date||c.timestamp);return d.getTime() > twoWeeksAgo && d.getTime() <= weekAgo});
    if (recentC.length < prevC.length && prevC.length >= 2) {
      insights.push({icon:'&#128204;',text:'Check-ins <strong>dropped</strong> from ' + prevC.length + ' to ' + recentC.length + ' week over week. Regular check-ins help catch warning signs early.',severity:'medium'});
    }
  }
  return insights;
}

function buildRiskAssessment() {
  var risk = {level:'low',factors:[]};
  if (!D.journal) return risk;
  var daysSinceLastJournal = D.journal.length ? Math.round((Date.now() - new Date(D.journal[D.journal.length-1].date).getTime())/86400000) : 999;
  var recentCravings = D.cravings ? D.cravings.filter(function(c){return Date.now()-new Date(c.timestamp||c.date).getTime() < 7*86400000}).length : 0;
  var recentMood = 3;
  if (D.checkins && D.checkins.length >= 3) {
    var weekAgo = Date.now() - 7*86400000;
    var recentCheckinMoods = D.checkins.filter(function(c){var d=new Date(c.date||c.timestamp);return d.getTime() > weekAgo}).map(function(c){return c.mood||3});
    if (recentCheckinMoods.length >= 2) recentMood = recentCheckinMoods.reduce(function(a,b){return a+b},0)/recentCheckinMoods.length;
  }
  if (daysSinceLastJournal > 7) { risk.level = 'high'; risk.factors.push('No journal entry in ' + daysSinceLastJournal + ' days'); }
  else if (daysSinceLastJournal > 3) { risk.factors.push('Journal gap of ' + daysSinceLastJournal + ' days'); if (risk.level === 'low') risk.level = 'medium'; }
  if (recentCravings >= 3) { risk.level = 'high'; risk.factors.push(recentCravings + ' cravings this week'); }
  else if (recentCravings >= 1) { risk.factors.push(recentCravings + ' craving' + (recentCravings > 1 ? 's' : '') + ' this week'); if (risk.level === 'low') risk.level = 'medium'; }
  if (recentMood < 2.5) { risk.level = 'high'; risk.factors.push('Average mood ' + recentMood.toFixed(1) + '/5 this week'); }
  else if (recentMood < 3) { risk.factors.push('Mood trending low (' + recentMood.toFixed(1) + '/5)'); if (risk.level === 'low') risk.level = 'medium'; }
  if (D.relapseRescue && D.relapseRescue.logs && D.relapseRescue.logs.length) {
    var lastRelapse = new Date(D.relapseRescue.logs[D.relapseRescue.logs.length-1].date);
    if (Date.now() - lastRelapse.getTime() < 3*86400000) { risk.level = 'high'; risk.factors.push('Recent relapse (within 3 days)'); }
  }
  return risk;
}

function buildArthurInsights() {
  var insights = [];
  if (!D.relapseRescue) D.relapseRescue = { logs: [], followUps: [] };

  // Journal recency
  if (D.journal && D.journal.length) {
    var lastEntry = new Date(D.journal[D.journal.length-1].date);
    var daysSinceJournal = Math.round((Date.now() - lastEntry.getTime()) / 86400000);
    if (daysSinceJournal > 3) insights.push({ icon: '&#128221;', text: 'It\'s been <strong>' + daysSinceJournal + ' days</strong> since your last journal entry. Gaps in journaling often correlate with increased risk. Try writing 3 sentences  even small entries build awareness.', severity: daysSinceJournal > 7 ? 'high' : 'medium' });
    else if (daysSinceJournal <= 1) insights.push({ icon: '&#9989;', text: 'You journaled recently  consistent self-reflection is one of the strongest predictors of sustained recovery.', severity: 'positive' });
    var recentCut = Date.now() - 14*86400000;
    var recentCount = D.journal.filter(function(j){return new Date(j.date).getTime() > recentCut}).length;
    var olderCut = Date.now() - 28*86400000;
    var olderCount = D.journal.filter(function(j){var t=new Date(j.date).getTime();return t > olderCut && t <= recentCut}).length;
    if (recentCount < olderCount && olderCount > 0) insights.push({ icon: '&#128200;', text: 'Your journal frequency has <strong>declined</strong> compared to two weeks ago. This can signal disengagement. A single check-in can help reset the pattern.', severity: 'medium' });
    else if (recentCount > olderCount && recentCount >= 3) insights.push({ icon: '&#128200;', text: 'Your journal frequency is <strong>increasing</strong>  a great sign of growing engagement with your recovery.', severity: 'positive' });
  } else {
    insights.push({ icon: '&#128221;', text: 'You haven\'t started journaling yet. Journaling is one of the most effective tools for recognizing patterns in your recovery.', severity: 'info' });
  }

  // Check-in patterns
  if (D.checkins && D.checkins.length >= 3) {
    var recentCheckins = D.checkins.slice(-7);
    var avgMood = recentCheckins.reduce(function(s,c){return s + (c.mood || 3)}, 0) / Math.max(1, recentCheckins.length);
    if (avgMood < 2.5 && recentCheckins.length >= 3) insights.push({ icon: '&#128555;', text: 'Your recent check-in mood has been trending <strong>below average</strong>. Low mood lasting several days is worth talking to someone about.', severity: 'high' });
    else if (avgMood >= 4) insights.push({ icon: '&#128513;', text: 'Your mood has been consistently <strong>high</strong> in recent check-ins. That\'s great  keep paying attention to what\'s working.', severity: 'positive' });
    var checkDates = D.checkins.map(function(c){return c.date});
    var uniqueDays = {};
    checkDates.forEach(function(d){uniqueDays[d.substring(0,10)]=true});
    var uniqueCount = Object.keys(uniqueDays).length;
    var totalCheckDays = D.checkins.length;
    if (uniqueCount < totalCheckDays * 0.5 && totalCheckDays > 5) insights.push({ icon: '&#128204;', text: 'You\'ve missed more check-ins than you\'ve completed recently. Regular check-ins help catch warning signs early.', severity: 'medium' });
  } else if (D.checkins && D.checkins.length > 0) {
    insights.push({ icon: '&#128204;', text: 'You\'ve done <strong>' + D.checkins.length + ' check-in' + (D.checkins.length !== 1 ? 's' : '') + '</strong> so far. The more consistently you check in, the more patterns Arthur can detect.', severity: 'info' });
  } else {
    insights.push({ icon: '&#128204;', text: 'No check-ins yet. The daily check-in helps track your mood and wins over time.', severity: 'info' });
  }

  // Craving patterns
  if (D.cravings && D.cravings.length >= 2) {
    var crav = D.cravings;
    var hourBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    crav.forEach(function(c){
      var h = c.time ? parseInt(c.time.split(':')[0]) : 12;
      if (h < 12) hourBuckets.morning++;
      else if (h < 17) hourBuckets.afternoon++;
      else if (h < 21) hourBuckets.evening++;
      else hourBuckets.night++;
    });
    var peakPeriod = Object.keys(hourBuckets).reduce(function(a,b){return hourBuckets[a]>hourBuckets[b]?a:b});
    if (hourBuckets[peakPeriod] >= 3) insights.push({ icon: '&#128352;', text: 'Your cravings peak during the <strong>' + peakPeriod + '</strong> (' + hourBuckets[peakPeriod] + ' logged). Plan a coping activity during that window.', severity: peakPeriod === 'night' ? 'high' : 'medium' });
    var triggerCounts = {};
    crav.forEach(function(c){if (c.trigger) { triggerCounts[c.trigger] = (triggerCounts[c.trigger] || 0) + 1; }});
    var topTrigger = Object.keys(triggerCounts).sort(function(a,b){return triggerCounts[b]-triggerCounts[a]})[0];
    if (topTrigger && triggerCounts[topTrigger] >= 2) insights.push({ icon: '&#9888;', text: '"<strong>' + topTrigger + '</strong>" is your most common craving trigger (' + triggerCounts[topTrigger] + ' times). Review your relapse plan for this trigger.', severity: 'high' });
    var recentCrav = crav.slice(-5);
    var avgIntensity = recentCrav.reduce(function(s,c){return s + (c.intensity || 5)}, 0) / recentCrav.length;
    if (avgIntensity >= 8) insights.push({ icon: '&#128293;', text: 'Your recent cravings have been <strong>high intensity</strong> (avg ' + Math.round(avgIntensity) + '/10). Consider reaching out to your support network today.', severity: 'high' });
  } else if (D.cravings && D.cravings.length === 1) {
    insights.push({ icon: '&#128352;', text: 'You\'ve logged 1 craving. Patterns become visible after a few entries  keep tracking and Arthur will spot trends.', severity: 'info' });
  }

  // Relapse pattern analysis
  if (D.relapseRescue.logs && D.relapseRescue.logs.length >= 1) {
    var logs = D.relapseRescue.logs;
    var trigCounts = {};
    logs.forEach(function(l){ trigCounts[l.trigger] = (trigCounts[l.trigger] || 0) + 1; });
    var topRelapseTrigger = Object.keys(trigCounts).sort(function(a,b){return trigCounts[b]-trigCounts[a]})[0];
    if (topRelapseTrigger && trigCounts[topRelapseTrigger] >= 2) insights.push({ icon: '&#128545;', text: '"<strong>' + topRelapseTrigger + '</strong>" has been your trigger in ' + trigCounts[topRelapseTrigger] + ' relapse' + (trigCounts[topRelapseTrigger] > 1 ? 'es' : '') + '. This is a high-risk pattern  build a specific coping plan for this situation.', severity: 'high' });
    var avgStreak = Math.round(logs.reduce(function(s,l){return s + (l.prevStreak || 0)}, 0) / logs.length);
    if (avgStreak > 0 && logs.length >= 2) insights.push({ icon: '&#128200;', text: 'On average, you\'ve gone <strong>' + avgStreak + ' days</strong> between relapses. Each attempt is longer  progress is happening even through setbacks.', severity: 'positive' });
    var lastRelapse = new Date(logs[logs.length-1].date);
    var daysSince = Math.round((Date.now() - lastRelapse.getTime()) / 86400000);
    if (daysSince <= 3) insights.push({ icon: '&#129309;', text: 'You recently re-committed (<strong>' + daysSince + ' day' + (daysSince !== 1 ? 's' : '') + ' ago</strong>). The first week is the hardest  stay connected and use your coping tools.', severity: 'high' });
    else if (daysSince > 30) insights.push({ icon: '&#x265B;', text: 'It\'s been <strong>' + daysSince + ' days</strong> since your last relapse  that\'s real progress. Keep doing what\'s working.', severity: 'positive' });
  }

  // Cross-reference: journal gap before relapse
  if (D.relapseRescue.logs && D.relapseRescue.logs.length >= 2 && D.journal && D.journal.length >= 3) {
    var gapBeforeRelapse = 0;
    for (var ri=0;ri<D.relapseRescue.logs.length;ri++) {
      var relapseDate = new Date(D.relapseRescue.logs[ri].date);
      var lastEntryBefore = null;
      for (var ji2=D.journal.length-1;ji2>=0;ji2--) {
        var entryDate = new Date(D.journal[ji2].date);
        if (entryDate.getTime() < relapseDate.getTime()) { lastEntryBefore = entryDate; break; }
      }
      if (lastEntryBefore) {
        var gap = Math.round((relapseDate.getTime() - lastEntryBefore.getTime()) / 86400000);
        if (gap > 2) gapBeforeRelapse++;
      }
    }
    if (gapBeforeRelapse >= 2) insights.push({ icon: '&#128200;', text: 'In <strong>' + gapBeforeRelapse + ' of your relapse' + (gapBeforeRelapse > 1 ? 'es' : '') + '</strong>, there was a journal gap of 3+ days beforehand. Journaling daily may be one of your most effective early warning systems.', severity: 'high' });
  }

  // Sobriety timeline
  if (D.sobriety && D.sobriety.startDate) {
    var currentStreak = soberDays();
    if (currentStreak > 0) insights.push({ icon: '&#128154;', text: 'You are <strong>' + currentStreak + ' day' + (currentStreak !== 1 ? 's' : '') + ' sober</strong>. Every day is a victory  and the data shows consistency builds on itself.', severity: 'positive' });
  }

  // Program progress
  if (D.recoveryPrograms && D.recoveryPrograms.active) {
    var pid = D.recoveryPrograms.active;
    if (RECOVERY_PROGRAMS[pid]) {
      var pData = D.recoveryPrograms.programs[pid];
      if (pData && pData.steps) {
        var done = pData.steps.filter(function(s){return s}).length;
        if (done > 0 && done < pData.steps.length) insights.push({ icon: '&#127891;', text: 'You\'re <strong>' + Math.round(done/pData.steps.length*100) + '%</strong> through the ' + RECOVERY_PROGRAMS[pid].name + '. Step ' + (done + 1) + ' is next.', severity: 'positive' });
      }
    }
  }

  // Mood-topic correlation analysis
  var topicInsights = buildMoodTopicInsights();
  for (var tix=0;tix<topicInsights.length;tix++) insights.push(topicInsights[tix]);

  // Period-over-period comparison
  var periodInsights = buildPeriodComparisonInsights();
  for (var pix=0;pix<periodInsights.length;pix++) insights.push(periodInsights[pix]);

  return insights;
}

function insightsHTML() {
  var insights = buildArthurInsights();
  var risk = buildRiskAssessment();
  var h = '<h2 class="page-title">&#128302; '+t('Insights')+'</h2>';

  // Risk assessment summary
  var riskIcon = risk.level === 'high' ? '&#128308;' : risk.level === 'medium' ? '&#128992;' : '&#128994;';
  var riskColor = risk.level === 'high' ? 'var(--danger)' : risk.level === 'medium' ? '#f97316' : 'var(--primary)';
  var riskBg = risk.level === 'high' ? 'var(--danger-bg)' : risk.level === 'medium' ? '#fff7ed' : 'var(--primary-light)';
  var riskLabel = risk.level === 'high' ? 'Elevated Risk' : risk.level === 'medium' ? 'Moderate Risk' : 'Low Risk';
  h += '<div class="card" style="border-left:3px solid ' + riskColor + ';background:' + riskBg + ';padding:14px;margin-bottom:10px">';
  h += '<div style="display:flex;align-items:center;gap:10px">';
  h += '<span style="font-size:28px">' + riskIcon + '</span>';
  h += '<div><div style="font-weight:700;font-size:15px;color:' + riskColor + '">' + riskLabel + '</div>';
  h += '<div style="font-size:12px;color:var(--text);line-height:1.4">';
  if (risk.factors.length) h += 'Arthur detected: ' + risk.factors.join(', ') + '.';
  else h += 'You\'re on a stable path. Keep doing what you\'re doing  your data shows consistent engagement.';
  h += '</div></div></div></div>';

  if (!insights.length) {
    h += '<div class="card" style="text-align:center;padding:24px">';
    h += '<div style="font-size:32px;margin-bottom:8px">&#128302;</div>';
    h += '<div style="font-size:14px;font-weight:600;margin-bottom:4px">Not enough data yet</div>';
    h += '<div style="font-size:12px;color:var(--muted)">Keep journaling, checking in, and logging cravings. The more data you give me, the more patterns I can find.</div>';
    h += '</div>';
  }

  var sevOrder = { high: 0, medium: 1, info: 2, positive: 3 };
  insights.sort(function(a,b){return (sevOrder[a.severity]||9) - (sevOrder[b.severity]||9)});

  for (var ii=0;ii<insights.length;ii++) {
    var ins = insights[ii];
    var borderColor = ins.severity === 'high' ? 'var(--danger)' : ins.severity === 'medium' ? '#f97316' : ins.severity === 'info' ? 'var(--accent)' : 'var(--primary)';
    var bgColor = ins.severity === 'high' ? 'var(--danger-bg)' : ins.severity === 'medium' ? '#fff7ed' : ins.severity === 'info' ? '#f5efe6' : 'var(--primary-light)';
    h += '<div class="card" style="border-left:3px solid ' + borderColor + ';background:' + bgColor + ';padding:14px;margin-bottom:8px">';
    h += '<div style="display:flex;align-items:flex-start;gap:8px">';
    h += '<span style="font-size:20px;flex-shrink:0">' + ins.icon + '</span>';
    h += '<div style="font-size:13px;line-height:1.5">' + ins.text + '</div>';
    h += '</div></div>';
  }

  if (insights.length) {
    h += '<div class="card" style="background:var(--primary-light);border:none;text-align:center;font-size:11px;color:var(--muted);line-height:1.5">';
    h += '<strong>Note:</strong> These patterns are generated from your data. Share concerning patterns with your support network.';
    h += '</div>';
  }

  return h;
}

// ====== POST-RELAPSE FOLLOW-UP ======
var FOLLOW_UP_SCHEDULE = [
  { label: '1 day later', offset: 1, questions: ['How are you feeling 24 hours after recommitting?', 'What helped you get through the first day?', 'What feels different this time?'] },
  { label: '3 days later', offset: 3, questions: ['How has the past 3 days been?', 'Have you noticed any warning signs returning?', 'What coping tools have you used?'] },
  { label: '7 days later', offset: 7, questions: ['One week back in  how are things?', 'What has been your biggest challenge this week?', 'What has given you strength this week?'] }
];

function scheduleFollowUp() {
  if (!D.relapseRescue) D.relapseRescue = { logs: [], followUps: [] };
  if (!D.relapseRescue.followUps) D.relapseRescue.followUps = [];
  for (var fi=0;fi<FOLLOW_UP_SCHEDULE.length;fi++) {
    var fu = FOLLOW_UP_SCHEDULE[fi];
    D.relapseRescue.followUps.push({
      label: fu.label,
      scheduledAt: Date.now() + fu.offset * 86400000,
      completed: false,
      questions: fu.questions.map(function(q){ return { q: q, a: '' }; }),
      relapseDate: Date.now()
    });
  }
  saveData();
}

function showFollowUp(fuIdx) {
  if (!D.relapseRescue || !D.relapseRescue.followUps) return;
  var fu = D.relapseRescue.followUps[fuIdx];
  if (!fu) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'followup-ov';
  var h = '<div class="overlay-content" style="max-width:420px">';
  h += '<h3 style="font-weight:700;font-size:18px;margin-bottom:4px">&#129309; Arthur\'s Follow-Up</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">You re-committed ' + Math.round((Date.now() - fu.relapseDate) / 86400000) + ' day' + (Math.round((Date.now() - fu.relapseDate) / 86400000) !== 1 ? 's' : '') + ' ago. Let\'s check in.</p>';
  for (var fi2=0;fi2<fu.questions.length;fi2++) {
    h += '<div style="margin-bottom:10px"><label style="font-size:13px;font-weight:600;display:block;margin-bottom:4px">' + fu.questions[fi2].q + '</label>';
    h += '<textarea style="min-height:50px" data-fuidx="' + fi2 + '" placeholder="Share what\'s on your mind...">' + (fu.questions[fi2].a || '') + '</textarea></div>';
  }
  h += '<button class="btn btn-primary btn-sm" onclick="submitFollowUp(' + fuIdx + ',this)" style="width:100%">Save & Complete</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="width:100%;margin-top:4px">Later</button>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  // Bind change listeners for textareas
  var tas = overlay.querySelectorAll('textarea[data-fuidx]');
  for (var tfi=0;tfi<tas.length;tfi++) {
    tas[tfi].addEventListener('change', function(e){
      var idx = parseInt(this.getAttribute('data-fuidx'));
      if (D.relapseRescue && D.relapseRescue.followUps && D.relapseRescue.followUps[fuIdx] && D.relapseRescue.followUps[fuIdx].questions[idx]) {
        D.relapseRescue.followUps[fuIdx].questions[idx].a = this.value;
        saveDataSilent();
      }
    });
  }
}

function submitFollowUp(fuIdx, btn) {
  if (!D.relapseRescue || !D.relapseRescue.followUps) return;
  D.relapseRescue.followUps[fuIdx].completed = true;
  saveData();
  var overlay = btn ? btn.closest('.overlay') : document.querySelector('.overlay');
  if (overlay) overlay.remove();
  render();
}

function pendingFollowUpHTML() {
  if (!D.relapseRescue || !D.relapseRescue.followUps) return '';
  var now = Date.now();
  var pending = null;
  var pendingIdx = -1;
  for (var pi=0;pi<D.relapseRescue.followUps.length;pi++) {
    var f = D.relapseRescue.followUps[pi];
    if (!f.completed && f.scheduledAt <= now) { pending = f; pendingIdx = pi; break; }
  }
  if (!pending) return '';
  var hrsAgo = Math.round((now - pending.scheduledAt) / 3600000);
  var h = '<div class="card" style="border-left:4px solid var(--accent);cursor:pointer;background:linear-gradient(135deg,#f5efe6,var(--card))" onclick="showFollowUp(' + pendingIdx + ')">';
  h += '<div style="display:flex;align-items:center;gap:10px"><div style="font-size:32px">&#129309;</div><div><div style="font-weight:700;font-size:14px">Arthur wants to check in</div><div style="font-size:12px;color:var(--muted)">' + pending.label + ' follow-up (' + hrsAgo + ' hour' + (hrsAgo !== 1 ? 's' : '') + ' ago). Tap to respond.</div></div></div></div>';
  return h;
}

function doCheckin(replay) {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content" style="max-width:420px">';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><div style="width:34px;height:34px;border-radius:17px;background:linear-gradient(135deg,var(--primary),#34d399);display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;font-weight:700">&#128204;</div><div><h3 style="margin:0;font-size:15px;font-weight:700">'+t('Daily Check-In')+'</h3><p style="margin:2px 0 0;font-size:11px;color:var(--muted)">'+t('How was your day?')+'</p></div></div>';
  h += '<div id="cm-form" style="text-align:left">';
  h += '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px">Mood:</div><div class="mood-row" style="gap:2px;margin-bottom:6px">';
  var moodLabels = ['\u{1F621}','\u{1F620}','\u{1F611}','\u{1F642}','\u{1F60A}'];
  for (var mi=0;mi<5;mi++) h += '<button class="mood-btn cm-mood" data-val="'+(mi+1)+'" onclick="document.querySelectorAll(\'.cm-mood\').forEach(function(b){b.classList.remove(\'active\')});this.classList.add(\'active\')">'+moodLabels[mi]+'</button>';
  h += '</div>';
  h += '<div style="display:flex;gap:6px;margin-bottom:6px"><div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:2px">'+t('Win today')+'</div><input id="cm-win" class="input" style="width:100%;font-size:12px;padding:5px 7px" placeholder="One win..."></div><div style="flex:1"><div style="font-size:11px;font-weight:600;color:var(--muted);margin-bottom:2px">'+t('Intention')+'</div><input id="cm-intent" class="input" style="width:100%;font-size:12px;padding:5px 7px" placeholder="Tomorrow..."></div></div>';
  h += '<button class="btn btn-primary btn-sm" onclick="submitCheckin()" style="width:100%;font-size:12px;padding:7px">&#9889; Check In</button>';
  h += '</div></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  window._cmOverlay = overlay;
}
function submitCheckin() {
  var today = new Date().toDateString();
  var moodEl = document.querySelector('.cm-mood.active');
  var mood = moodEl ? parseInt(moodEl.getAttribute('data-val')) : 3;
  var win = document.getElementById('cm-win').value.trim();
  var intent = document.getElementById('cm-intent').value.trim();
  D.checkins = D.checkins || [];
  D.checkins.push({date:today,time:new Date().toLocaleTimeString(),mood:mood,win:win,intent:intent});
  D.streak = (D.streak || 0) + 1;
  earnSchillings(1, 'Daily check-in');
  saveData();
  if (window._cmOverlay) window._cmOverlay.remove();
  showCheckinReaction(mood);
  setTimeout(showSchillingNotification, 800);
}
function showCheckinReaction(mood) {
  var chars = ['Arthur','Gertrude','Oswald'];
  var pick = chars[Math.floor(Math.random() * chars.length)];
  var reactions = {
    Arthur: ['"Nice. Another check-in logged. Your mood trend is getting clearer. This is how we make sense of things. \u2014 Arthur"','"Good \u2014 you checked in. That single action tells me more than any theory. Consistency is the real pattern. \u2014 Arthur"','"Noted. I\u2019ll cross-reference this with your journal entries. Keep the data coming. \u2014 Arthur"'],
    Gertrude: ['"Check-in received. You showed up. That\u2019s the hardest part. Well done. \u2014 Gertrude"','"Daily check \u2014 you answered the roll call. Discipline = armor. \u2014 Gertrude"','"Another day stood guard over your recovery. I see you. \u2014 Gertrude"'],
    Oswald: ['"The daily ritual strengthens the soul. You cast your intention into the world. Let it echo. \u2014 Oswald"','"You checked in. That\u2019s another thread in the tapestry of your new self. Keep weaving. \u2014 Oswald"','"Good. You honored your commitment. The quiet work is the most powerful kind. \u2014 Oswald"']
  };
  var pickMsgs = reactions[pick];
  var msg = pickMsgs[Math.floor(Math.random() * pickMsgs.length)];
  var colors = {Arthur:'#5b21b6',Gertrude:'#2d5a5a',Oswald:'#4338ca'};
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.4)';
  overlay.innerHTML = '<div style="background:var(--card);border-radius:20px;max-width:340px;width:90%;padding:28px 24px;text-align:center;border:2px solid ' + colors[pick] + ';animation:scaleIn .3s ease;box-shadow:0 12px 40px rgba(0,0,0,.2)">' +
    '<div style="width:48px;height:48px;border-radius:24px;background:' + colors[pick] + ';margin:0 auto 12px;display:flex;align-items:center;justify-content:center;font-weight:700;color:#fff;font-size:20px">' + pick[0] + '</div>' +
    '<p style="font-size:13px;line-height:1.6;color:var(--text);margin-bottom:16px">' + msg + '</p>' +
    '<button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();showJourneyMap()" style="width:100%">Continue</button></div>';
  document.body.appendChild(overlay);
}
function showJourneyMap() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.id = 'journey-map-ol';
  overlay.style.background = 'rgba(0,0,0,.55)';
  overlay.style.alignItems = 'flex-start';
  overlay.style.paddingTop = '16px';
  var streak = D.streak || 1;
  var maxDays = 30;
  var progress = Math.min((streak - 1) / (maxDays - 1), 1);
  var atop = streak >= maxDays;
  // Kingdoms along the journey
  var kingdoms = [
    {name:"The Shire", icon:"🌳", days:"1-5", desc:"Home. Safe. Familiar."},
    {name:"The Darkwood", icon:"🌲", days:"6-10", desc:"Shadows gather. Temptations lurk."},
    {name:"Stone Pass", icon:"⛰️", days:"11-15", desc:"Steep. Grit builds here."},
    {name:"Silver River", icon:"🌊", days:"16-20", desc:"Flow. Momentum carries you."},
    {name:"Golden Plains", icon:"🌾", days:"21-25", desc:"Warmth. The reward nears."},
    {name:"Celestial Citadel", icon:"🏰", days:"26-30", desc:"Mastery. You made it."}
  ];
  // Path waypoints (x%, y%) mapping the route across kingdoms
  var wps = [
    {x:10, y:78}, {x:22, y:68}, {x:34, y:74},
    {x:45, y:60}, {x:55, y:66}, {x:68, y:52},
    {x:78, y:56}, {x:85, y:38}
  ];
  var totalSegments = wps.length - 1;
  var dayProgress = progress; // 0 to 1
  // Calculate character position along the path
  var segIdx = Math.min(Math.floor(dayProgress * totalSegments), totalSegments - 1);
  var segT = (dayProgress * totalSegments) - segIdx;
  var cx = wps[segIdx].x + (wps[segIdx+1].x - wps[segIdx].x) * segT;
  var cy = wps[segIdx].y + (wps[segIdx+1].y - wps[segIdx].y) * segT;
  // Kingdom territory boxes on the map
  var kd = [
    {x1:-2, x2:22, y1:60, y2:95, ki:0},
    {x1:18, x2:38, y1:55, y2:88, ki:1},
    {x1:30, x2:50, y1:45, y2:80, ki:2},
    {x1:42, x2:62, y1:42, y2:76, ki:3},
    {x1:55, x2:76, y1:35, y2:68, ki:4},
    {x1:70, x2:92, y1:20, y2:55, ki:5}
  ];
  var dayMarkers = [];
  for (var d=1;d<=maxDays;d++) {
    var dp = (d-1)/(maxDays-1);
    var si = Math.min(Math.floor(dp * totalSegments), totalSegments - 1);
    var st = (dp * totalSegments) - si;
    var dx = wps[si].x + (wps[si+1].x - wps[si].x) * st;
    var dy = wps[si].y + (wps[si+1].y - wps[si].y) * st;
    var reached = d <= streak;
    dayMarkers.push({x:dx, y:dy, day:d, reached:reached});
  }
  // Build the map HTML
  var kh = '';
  for (var k=0;k<kd.length;k++) {
    var kdD = kd[k];
    var kg = kingdoms[kdD.ki];
    var active = (streak > kdD.ki * 5);
    kh += '<div style="position:absolute;left:'+kdD.x1+'%;top:'+kdD.y1+'%;width:'+(kdD.x2-kdD.x1)+'%;height:'+(kdD.y2-kdD.y1)+'%;border:1px dashed '+(active?'rgba(180,140,60,.3)':'rgba(180,140,60,.12)')+';border-radius:8px;z-index:1;pointer-events:none"></div>';
    kh += '<div style="position:absolute;left:'+(kdD.x1+1)+'%;top:'+(kdD.y1+1)+'%;z-index:2;pointer-events:none;font-size:8px;color:'+(active?'#b88a3a':'rgba(140,120,80,.3)')+';font-family:\'Cinzel\',serif;font-weight:700;text-shadow:0 1px 3px rgba(0,0,0,.6)" data-kingdom="'+kg.name+'">'+kg.icon+' '+kg.name+'</div>';
  }
  // Path SVG
  var pathD = '';
  for (var pi=0;pi<wps.length;pi++) {
    pathD += (pi===0?'M':'L') + wps[pi].x + ' ' + wps[pi].y + ' ';
  }
  // Day marker dots along path
  var dotsHtml = '';
  for (var di=0;di<dayMarkers.length;di++) {
    var dm = dayMarkers[di];
    dotsHtml += '<div style="position:absolute;left:'+dm.x+'%;top:'+dm.y+'%;z-index:6;transform:translate(-50%,-50%);pointer-events:none;width:4px;height:4px;border-radius:2px;background:'+(dm.reached?'#fbbf24':'rgba(200,180,120,.15)')+';border:1px solid '+(dm.reached?'#d97706':'rgba(200,180,120,.2)')+'"></div>';
  }
  // Avatar marker - clothmap character
  var avatarSvg = '<svg viewBox="0 0 24 32" style="width:20px;height:26px"><ellipse cx="12" cy="30" rx="4" ry="1.5" fill="rgba(0,0,0,.2)"/><path d="M9 14 L10 26 L14 26 L15 14 Z" fill="#2563eb"/><ellipse cx="12" cy="8" rx="4.5" ry="4" fill="#f0d5b0"/><path d="M8.5 6 L8.5 3 Q12 1 15.5 3 L15.5 6" fill="#1e3a5f"/><circle cx="10.5" cy="7.5" r=".6" fill="#333"/><circle cx="13.5" cy="7.5" r=".6" fill="#333"/><path d="M11 7 L12 9 L13 7" stroke="#333" stroke-width=".5" fill="none"/><path d="M11.5 11 L9 17" stroke="#f0d5b0" stroke-width="1.5" stroke-linecap="round"/><path d="M12.5 11 L15 17" stroke="#f0d5b0" stroke-width="1.5" stroke-linecap="round"/></svg>';
  // Compass rose
  var compass = '<svg viewBox="0 0 40 40" style="width:32px;height:32px"><circle cx="20" cy="20" r="18" fill="none" stroke="rgba(180,140,60,.25)" stroke-width=".5"/><polygon points="20,4 23,18 20,20 17,18" fill="#b88a3a" opacity=".8"/><polygon points="20,36 17,22 20,20 23,22" fill="#8a6a2a" opacity=".6"/><polygon points="36,20 22,17 20,20 22,23" fill="#b88a3a" opacity=".5"/><polygon points="4,20 18,23 20,20 18,17" fill="#b88a3a" opacity=".5"/><circle cx="20" cy="20" r="1.5" fill="#d4a574"/></svg>';
  // Legend
  var legendHtml = '';
  for (var li=0;li<kingdoms.length;li++) {
    var kg = kingdoms[li];
    var unlocked = streak >= (li * 5 + 1);
    legendHtml += '<div style="display:flex;align-items:center;gap:4px;font-size:8px;color:'+(unlocked?'var(--text)':'rgba(140,120,80,.3)')+'"><span>'+kg.icon+'</span><span>'+kg.name+'</span><span style="color:rgba(140,120,80,.5)">('+kg.days+')</span></div>';
  }
  var scrollHint = '<div style="font-size:9px;color:rgba(180,140,60,.4);margin:4px 0;text-align:center">~ The Path of Recovery ~</div>';
  overlay.innerHTML =
    '<div style="background:linear-gradient(180deg,#1a1410,#2a2018);border:1px solid rgba(180,140,60,.25);border-radius:18px;max-width:480px;width:94%;padding:14px 12px 12px;box-shadow:0 12px 48px rgba(0,0,0,.5);margin:0 auto">' +
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
    '<div style="font-size:14px;font-weight:700;color:#b88a3a;font-family:\'Cinzel\',serif;text-shadow:0 1px 4px rgba(0,0,0,.4)">&#128214; Journeymap</div>' +
    '<div style="display:flex;align-items:center;gap:6px">' +
    '<div style="font-size:18px;font-weight:900;color:#fbbf24;text-shadow:0 0 10px rgba(251,191,36,.3)">'+streak+'</div>' +
    '<div style="font-size:7px;color:rgba(180,140,60,.6);line-height:1.2"><div>DAY</div><div>STREAK</div></div>' +
    '</div></div>' +
    scrollHint +
    // Map container
    '<div style="position:relative;height:280px;background:radial-gradient(ellipse at 50% 80%, #3a2a1a, #1e1810);border-radius:12px;overflow:hidden;border:1px solid rgba(180,140,60,.15);margin-bottom:6px">' +
    // Map texture overlay
    '<div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 8px,rgba(0,0,0,.04) 8px,rgba(0,0,0,.04) 9px),repeating-linear-gradient(90deg,transparent,transparent 8px,rgba(0,0,0,.03) 8px,rgba(0,0,0,.03) 9px);z-index:2;pointer-events:none"></div>' +
    // Kingdom regions
    kh +
    // Path line
    '<svg style="position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none" viewBox="0 0 100 100" preserveAspectRatio="none">' +
    '<path d="'+pathD+'" fill="none" stroke="rgba(180,140,60,.2)" stroke-width=".8" stroke-dasharray="2,3"/>' +
    '<path d="'+pathD+'" fill="none" stroke="rgba(251,191,36,.4)" stroke-width=".6" stroke-dasharray="2,4" stroke-dashoffset="-3"/>' +
    '</svg>' +
    // Day markers
    dotsHtml +
    // Character on map
    '<div class="map-avatar" style="position:absolute;left:'+cx+'%;top:'+cy+'%;z-index:8;transform:translate(-50%,-60%);filter:drop-shadow(0 2px 6px rgba(0,0,0,.6));transition:left .6s cubic-bezier(.34,1.2,.64,1),top .6s cubic-bezier(.34,1.2,.64,1)">'+avatarSvg+'</div>' +
    // Compass rose
    '<div style="position:absolute;right:6px;bottom:6px;z-index:5;opacity:.5">'+compass+'</div>' +
    // Title scroll
    '<div style="position:absolute;top:4px;left:50%;z-index:5;transform:translateX(-50%);background:rgba(26,20,16,.8);padding:2px 10px;border-radius:4px;border:1px solid rgba(180,140,60,.2);font-size:7px;color:rgba(180,140,60,.6);font-family:\'Cinzel\',serif;white-space:nowrap">The Quest of '+(D.name||'the Wanderer')+'</div>' +
    '</div>' +
    // Legend / progress
    '<div style="display:flex;gap:8px;align-items:stretch">' +
    '<div style="flex:1;display:flex;flex-wrap:wrap;gap:1px 6px;padding:4px 6px;background:rgba(180,140,60,.06);border-radius:8px;border:1px solid rgba(180,140,60,.1)">' + legendHtml + '</div>' +
    '<div style="display:flex;flex-direction:column;gap:4px;justify-content:center">' +
    '<button onclick="var el=document.getElementById(\'journey-map-ol\');if(el){el.remove();render();}" style="background:#b88a3a;color:#1a1410;border:none;border-radius:8px;padding:6px 14px;font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;font-family:\'Cinzel\',serif">Continue &#8594;</button>' +
    '<button onclick="showJourneyMap()" style="background:rgba(180,140,60,.12);color:rgba(180,140,60,.6);border:1px solid rgba(180,140,60,.15);border-radius:8px;padding:4px 10px;font-size:9px;cursor:pointer;font-family:\'Cinzel\',serif">&#8635; Revisit</button>' +
    '</div></div>' +
    '<div style="font-size:7px;color:rgba(180,140,60,.3);text-align:center;margin-top:4px;font-style:italic">"Not all who wander are lost"</div>' +
    '</div>';
  document.body.appendChild(overlay);
}

// ====== BREATHING ======
function startBreathe() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center"><h3 style="font-size:18px;font-weight:700">'+t('Breathe')+'</h3><p style="font-size:13px;color:var(--muted);margin-bottom:8px">'+t('Follow the circle. Inhale, hold, exhale.')+'</p><div class="breath-circle" id="breath-circle">'+t('Breathe')+'</div><button class="btn btn-primary" onclick="startBreathing(this)" id="breathe-start">'+t('Start')+'</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Close')+'</button></div>';
  document.body.appendChild(overlay);
}

function startBreathing(btn) {
  btn.disabled = true;
  btn.textContent = 'Inhale...';
  var circle = document.getElementById('breath-circle');
  var timerDisplay = document.createElement('div');
  timerDisplay.style.cssText = 'font-size:28px;font-weight:800;color:var(--primary);margin:8px 0 4px;font-variant-numeric:tabular-nums';
  timerDisplay.textContent = '4';
  btn.parentNode.insertBefore(timerDisplay, btn);
  var roundDisplay = document.createElement('div');
  roundDisplay.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:4px';
  roundDisplay.textContent = 'Round 1 of 3';
  btn.parentNode.insertBefore(roundDisplay, btn);
  var steps = ['Inhale', 'Hold', 'Exhale', 'Hold'];
  var durations = [4000, 4000, 4000, 4000];
  var scales = ['scale(1.3)', 'scale(1.3)', 'scale(0.8)', 'scale(0.8)'];
  var colors = ['#059669', '#f59e0b', '#3b82f6', '#f59e0b'];
  var step = 0;
  var totalRounds = 0;
  var remaining = 0;
  var interval = null;
  function clearTimer() { if (interval) { clearInterval(interval); interval = null; } }
  function startStepTimer(durMs) {
    clearTimer();
    remaining = Math.ceil(durMs / 1000);
    timerDisplay.textContent = remaining;
    interval = setInterval(function() {
      remaining--;
      timerDisplay.textContent = Math.max(0, remaining);
      if (remaining <= 0) { clearTimer(); }
    }, 1000);
  }
  function next() {
    if (step >= steps.length) { step = 0; totalRounds++; roundDisplay.textContent = 'Round ' + (totalRounds+1) + ' of 3'; }
    btn.textContent = steps[step] + '...';
    circle.style.transform = scales[step];
    circle.style.borderColor = colors[step];
    if (totalRounds >= 3) { clearTimer(); timerDisplay.textContent = '0'; btn.textContent = 'Done!'; D.breatheCount++; D.lastBreatheDate = new Date().toDateString(); saveData(); setTimeout(function(){btn.closest('.overlay').remove()},1000); return; }
    var dur = durations[step];
    startStepTimer(dur);
    step++;
    setTimeout(next, dur);
  }
  next();
}

// ====== AFFIRMATIONS ======
var AFFIRMATIONS = [
  'I am worthy of love and happiness.',
  'I am stronger than I think.',
  'It\'s okay to not be okay.',
  'I am doing my best, and that is enough.',
  'My feelings are valid.',
  'I deserve peace and healing.',
  'Every day is a fresh start.',
  'I am in control of my own story.',
  'Small steps lead to big changes.',
  'I am proud of myself for trying.',
  'My past does not define my future.',
  'I choose progress over perfection.',
  'I am capable of amazing things.',
  'My recovery is a sign of my strength.',
  'I deserve to be happy and healthy.'
];

var DAILY_PROMPTS = [
  'What emotion are you carrying right now? Describe where you feel it in your body.',
  'Write about a small win you had today  no matter how small.',
  'What is one thing you are grateful for right now?',
  'Describe your ideal day five years from now.',
  'What trigger have you been avoiding? Write about it honestly.',
  'Write a letter of forgiveness to yourself for one thing you regret.',
  'What does "recovery" mean to you? Has that meaning changed over time?',
  'What coping skill helped you the most recently? Describe how it felt.',
  'Name three people who support you. When did they last show up for you?',
  'What do you fear most right now? Write it out without editing.',
  'Describe a moment today when you felt at peace.',
  'What habit do you want to build next? Why does it matter to you?',
  'Write about a time you overcame something difficult. What got you through?',
  'What would you say to your past self on the hardest day?',
  'What is one thing you can do tomorrow to take care of yourself?',
  'How has your relationship with yourself changed since starting this journey?',
  'What boundary do you need to set or reinforce?',
  'Describe a place where you feel completely safe. What makes it safe?',
  'What does "strength" look like for you? Not for anyone else  for you.',
  'Write about something you have been avoiding thinking about.',
  'What song describes how you feel right now? Why?',
  'What would you do today if fear was not a factor?',
  'What is one truth you need to hear right now? Tell it to yourself.',
  'Describe the version of yourself you are becoming.',
  'What do you need to let go of to move forward?',
  'Write about a person who believed in you when you did not believe in yourself.',
  'What self-care practice actually works for you? When did you last do it?',
  'If your best friend wrote a message of encouragement to you, what would it say?',
  'What progress have you made that you have not acknowledged yet?',
  'What question do you wish someone would ask you right now?',
  'Describe a moment of unexpected kindness you experienced or witnessed.',
  'What is one thing in your life that is going well right now?',
  'What emotion do you find hardest to express? When did you last feel it?',
  'Write about something you did today that future you will thank you for.',
  'What does the word "hope" mean to you today?'
];

function todayPrompt() {
  var entries = D.journal || [];
  if (entries.length > 0) {
    var last = (getEntryText(entries[entries.length-1]) || '').toLowerCase();
    if (last.match(/crav|urge|relaps|trigger|tempted|slip/)) return 'You mentioned a trigger recently. What strategies helped you get through it? How are you feeling about it now?';
    if (last.match(/proud|accomplish|achieved|milestone|win|success|progress|goal|completed|finished/)) return 'That progress you mentioned  how did it feel? What helped you get there? Take a moment to really sit with that win.';
    if (last.match(/sad|depres|lonel|alone|cry|grief|sorrow|despair|mourn/)) return 'You were feeling heavy last time. What do you need right now that you haven\'t given yourself? It\'s okay to not be okay.';
    if (last.match(/angr|frustrat|mad|rage|pissed|furiou|annoyed|irritat/)) return 'Last time you wrote about frustration. Has that shifted? What would help you release what\'s still lingering?';
    if (last.match(/anxi|worr|panic|scared|fear|stress|nervous|overwhelm|tense/)) return 'You were carrying anxiety last time. Let\'s check in  what\'s the volume of that worry today? What do you need to feel safer?';
    if (last.match(/grateful|thank|blessed|appreciate|gratitude|blessing/)) return 'You found something to appreciate last time. What else has been good since then? Let\'s keep collecting those moments.';
    if (last.match(/friend|family|mom|dad|partner|husband|wife|boyfriend|girlfriend|sister|brother/)) return 'How are things with the people you mentioned last time? Any updates worth noting? Connection matters in recovery.';
    if (last.match(/job|work|career|boss|coworker|interview|fired|promot|office|meeting|deadline|project/)) return 'Last time you wrote about work. How is that situation evolving? What\'s one thing you can do today to improve it?';
    if (last.match(/sleep|tired|exhaust|insomnia|rest/)) return 'You mentioned being exhausted last time. Have you been able to rest since then? Sleep is a foundation of recovery  how is yours?';
    if (last.match(/exercise|workout|gym|run|walk|yoga|meditat/)) return 'You were focusing on wellness last time. How has your routine been? What feels good for your body today?';
    if (last.match(/school|class|college|university|exam|test|study|course|grade/)) return 'You wrote about your studies last time. How are things going? What\'s one small step you can take today?';
    if (last.match(/money|bills|debt|loan|rent|budget|finance|afford/)) return 'Finances were on your mind last time. Has anything shifted? What\'s within your control right now?';
    if (last.match(/alone|lonely|isolat|miss|nobody|no one|empty|numb/)) return 'You were feeling isolated last time. I want you to know you\'re not alone in this. What would make you feel even 1% more connected today?';
    if (last.match(/doctor|therapist|appointment|medication|therapy|counsel/)) return 'You mentioned your health journey last time. How did that appointment go? How are you feeling about your treatment?';
    if (last.match(/sober.*day|day.*sober|clean|recover|heal|stronger|growth|progress/)) return 'You\'re building real momentum. What\'s working for you right now that you want to keep doing? Let\'s lock in those habits.';
  }
  var now = new Date();
  var start = new Date(now.getFullYear(), 0, 0);
  var dayOfYear = Math.floor((now - start) / 86400000);
  return DAILY_PROMPTS[dayOfYear % DAILY_PROMPTS.length];
}


// ====== LIBRARY ======
var LIB_ARTICLES = [
  {title:'The Science of Habit Formation', desc:'James Clear guide on building lasting habits', url:'https://jamesclear.com/habit-guide'},
  {title:'Understanding Addiction & the Brain', desc:'NIH neuroscience of addiction and recovery', url:'https://nida.nih.gov/publications/drugs-brains-behavior-science-addiction'},
  {title:'5 Types of Self-Care for Recovery', desc:'Holistic healing approaches from Psychology Today', url:'https://www.psychologytoday.com/us/blog/click-help/202101/5-types-self-care-recovery'},
  {title:'Mindfulness for Beginners', desc:'Start your meditation practice', url:'https://www.mindful.org/meditation/mindfulness-getting-started/'},
  {title:'The Neuroscience of Addiction Recovery', desc:'Harvard Health on how the brain heals', url:'https://www.health.harvard.edu/blog/the-neuroscience-of-addiction-recovery-202410183157'},
  {title:'Why Willpower Isnt Enough', desc:'Psychology Today on real change strategies', url:'https://www.psychologytoday.com/us/blog/the-mindful-self/202304/why-willpower-isnt-enough-to-change'},
  {title:'The Benefits of Journaling for Mental Health', desc:'Research-backed writing practices', url:'https://positivepsychology.com/benefits-of-journaling/'},
  {title:'Understanding Triggers and Cravings', desc:'Recovery Research Institute guide', url:'https://www.recoveryanswers.org/resource/understanding-triggers-and-cravings/'},
  {title:'The Role of Exercise in Recovery', desc:'Healthline on movement and healing', url:'https://www.healthline.com/health/exercise-and-addiction-recovery'},
  {title:'Self-Compassion in Recovery', desc:'Why being kind to yourself matters', url:'https://self-compassion.org/the-role-of-self-compassion-in-addiction-recovery/'},
  {title:'Building a Support Network', desc:'SAMHSA guide to recovery support', url:'https://www.samhsa.gov/find-help/recovery-support-tools'},
  {title:'Gratitude Practice and Mental Health', desc:'UC Berkeley Greater Good Science Center', url:'https://greatergood.berkeley.edu/article/item/how_gratitude_changes_you_and_your_brain'}
];
var LIB_BOOKS = [
  {title:'The Body Keeps the Score', desc:'Bessel van der Kolk', url:'https://www.amazon.com/s?k=The+Body+Keeps+the+Score+Bessel+van+der+Kolk', alt:'https://www.barnesandnoble.com/s/The+Body+Keeps+the+Score'},
  {title:'Atomic Habits', desc:'James Clear', url:'https://www.amazon.com/s?k=Atomic+Habits+James+Clear', alt:'https://www.barnesandnoble.com/s/Atomic+Habits'},
  {title:'In the Realm of Hungry Ghosts', desc:'Gabor Mat', url:'https://www.amazon.com/s?k=In+the+Realm+of+Hungry+Ghosts+Gabor+Mate', alt:'https://www.barnesandnoble.com/s/In+the+Realm+of+Hungry+Ghosts'},
  {title:'Daring Greatly', desc:'Bren Brown', url:'https://www.amazon.com/s?k=Daring+Greatly+Brene+Brown', alt:'https://www.barnesandnoble.com/s/Daring+Greatly'},
  {title:'The Power of Habit', desc:'Charles Duhigg', url:'https://www.amazon.com/s?k=The+Power+of+Habit+Charles+Duhigg', alt:'https://www.barnesandnoble.com/s/The+Power+of+Habit'},
  {title:'The Gifts of Imperfection', desc:'Bren Brown', url:'https://www.amazon.com/s?k=The+Gifts+of+Imperfection+Brene+Brown', alt:'https://www.barnesandnoble.com/s/The+Gifts+of+Imperfection'},
  {title:'Feeling Good', desc:'David D. Burns', url:'https://www.amazon.com/s?k=Feeling+Good+David+Burns', alt:'https://www.barnesandnoble.com/s/Feeling+Good+David+Burns'},
  {title:'Mans Search for Meaning', desc:'Viktor Frankl', url:'https://www.amazon.com/s?k=Mans+Search+for+Meaning+Viktor+Frankl', alt:'https://www.barnesandnoble.com/s/Man%27s+Search+for+Meaning'},
  {title:'Dopamine Nation', desc:'Anna Lembke on pleasure and pain', url:'https://www.amazon.com/s?k=Dopamine+Nation+Anna+Lembke', alt:'https://www.barnesandnoble.com/s/Dopamine+Nation'},
  {title:'Unwinding Anxiety', desc:'Judson Brewer on habit change', url:'https://www.amazon.com/s?k=Unwinding+Anxiety+Judson+Brewer', alt:'https://www.barnesandnoble.com/s/Unwinding+Anxiety'},
  {title:'The Craving Mind', desc:'Judson Brewer on addiction and mindfulness', url:'https://www.amazon.com/s?k=The+Craving+Mind+Judson+Brewer', alt:'https://www.barnesandnoble.com/s/The+Craving+Mind'},
  {title:'Recovery The Sacred Art', desc:'Rami Shapiro on spiritual recovery', url:'https://www.amazon.com/s?k=Recovery+The+Sacred+Art+Rami+Shapiro', alt:'https://www.barnesandnoble.com/s/Recovery+The+Sacred+Art'},
  {title:'Clean', desc:'David Sheff on overcoming addiction', url:'https://www.amazon.com/s?k=Clean+Overcoming+Addiction+David+Sheff', alt:'https://www.barnesandnoble.com/s/Clean+David+Sheff'},
  {title:'Never Enough', desc:'Judith Grisel on the neuroscience of addiction', url:'https://www.amazon.com/s?k=Never+Enough+Judith+Grisel', alt:'https://www.barnesandnoble.com/s/Never+Enough+Judith+Grisel'},
  {title:'The Recovery Book', desc:'Al J. Mooney - a practical recovery guide', url:'https://www.amazon.com/s?k=The+Recovery+Book+Al+Mooney', alt:'https://www.barnesandnoble.com/s/The+Recovery+Book+Mooney'},
  {title:'Breaking the Cycle', desc:'George T. Collins on addiction recovery', url:'https://www.amazon.com/s?k=Breaking+the+Cycle+George+Collins', alt:'https://www.barnesandnoble.com/s/Breaking+the+Cycle+Collins+addiction'},
  {title:'Addiction and Grace', desc:'Gerald May on spiritual healing', url:'https://www.amazon.com/s?k=Addiction+and+Grace+Gerald+May', alt:'https://www.barnesandnoble.com/s/Addiction+and+Grace+Gerald+May'}
];
var LIB_PODCASTS = [
  {title:'The Recovery Show', desc:'12-step based recovery stories and discussion', url:'https://www.recoveryshow.com/'},
  {title:'The Happiness Lab', desc:'Dr. Laurie Santos on the science of wellbeing', url:'https://www.happinesslab.fm/'},
  {title:'Recovery Happy Hour', desc:'Interviews with people in recovery', url:'https://www.recoveryhappyhour.com/'},
  {title:'The SHAIR Recovery Podcast', desc:'Shair Lott shares addiction recovery stories', url:'https://shairpodcast.com/'},
  {title:'Recovery Elevator', desc:'Sobriety, recovery and personal growth', url:'https://recoveryelevator.com/'},
  {title:'The One You Feed', desc:'Eric Zimmer on habits and mental health', url:'https://www.oneyoufeed.net/'},
  {title:'The Addiction Podcast', desc:'Clinical insights on substance use recovery', url:'https://theaddictionpodcast.com/'},
  {title:'Sober Cast', desc:'12-step AA speaker meetings on demand', url:'https://sobercast.com/'},
  {title:'The Life You Want', desc:'Glennon Doyle on brave living and recovery', url:'https://www.glennondoyle.com/podcast/'},
  {title:'Being Well with Rick Hanson', desc:'Neuroscience-based wellbeing strategies', url:'https://www.rickhanson.com/podcast/'}
];
var LIB_VIDEOS = [
  {title:'The Power of Vulnerability', desc:'Bren Brown TED Talk on connection', url:'https://www.ted.com/talks/brene_brown_the_power_of_vulnerability'},
  {title:'Understanding Addiction', desc:'Kurzgesagt animated explainer', url:'https://youtu.be/ao8L-6nDixg'},
  {title:'Everything You Think You Know About Addiction Is Wrong', desc:'Johann Hari TED Talk', url:'https://www.ted.com/talks/johann_hari_everything_you_think_you_know_about_addiction_is_wrong'},
  {title:'How Childhood Trauma Affects Health', desc:'Dr. Nadine Burke Harris TED Talk', url:'https://www.ted.com/talks/nadine_burke_harris_how_childhood_trauma_affects_health_across_a_lifetime'},
  {title:'Why You Need to Stop Chasing Happiness', desc:'Pursuit of Wonder on fulfillment', url:'https://youtu.be/B2Gk12WbgNc'},
  {title:'How to Practice Mindfulness', desc:'Jon Kabat-Zinn on mindfulness basics', url:'https://youtu.be/3nwwKbM_vJc'},
  {title:'The Science of Habits', desc:'Atomic Habits summary and insights', url:'https://youtu.be/PZ7lDrwYdZc'},
  {title:'How to Heal from Trauma', desc:'Tim Fletcher recovery series', url:'https://youtu.be/BGUy7FEgz3w'},
  {title:'The Wall', desc:'A short film on resilience and not giving up', url:'https://youtu.be/ORn3E4WfgMQ'}
];

function libraryHTML() {
  var h = '<h2 class="page-title">Library</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Curated resources to support your recovery journey.</p>';
h += '<div class="card"><h3>'+t('Articles')+'</h3>';
  for (var i=0;i<LIB_ARTICLES.length;i++) {
    h += '<div class="lib-item"><div class="info"><div class="title">'+LIB_ARTICLES[i].title+'</div><div class="desc">'+LIB_ARTICLES[i].desc+'</div><a class="link" href="'+LIB_ARTICLES[i].url+'" target="_blank">Read</a></div></div>';
  }
  h += '</div><div class="card"><h3>'+t('Books')+'</h3>';
  for (var i=0;i<LIB_BOOKS.length;i++) {
    h += '<div class="lib-item"><div class="info"><div class="title">'+LIB_BOOKS[i].title+'</div><div class="desc">'+LIB_BOOKS[i].desc+'</div><a class="link" href="'+LIB_BOOKS[i].url+'" target="_blank">Amazon</a>';
    if (LIB_BOOKS[i].alt) h += ' <span style="color:var(--muted);font-size:10px">|</span> <a class="link" href="'+LIB_BOOKS[i].alt+'" target="_blank">Barnes &amp; Noble</a>';
    h += '</div></div>';
  }
  h += '</div><div class="card"><h3>'+t('Podcasts')+'</h3>';
  for (var i=0;i<LIB_PODCASTS.length;i++) {
    h += '<div class="lib-item"><div class="info"><div class="title">'+LIB_PODCASTS[i].title+'</div><div class="desc">'+LIB_PODCASTS[i].desc+'</div><a class="link" href="'+LIB_PODCASTS[i].url+'" target="_blank">Listen</a></div></div>';
  }
  h += '</div><div class="card"><h3>'+t('Videos')+'</h3>';
  for (var i=0;i<LIB_VIDEOS.length;i++) {
    h += '<div class="lib-item"><div class="info"><div class="title">'+LIB_VIDEOS[i].title+'</div><div class="desc">'+LIB_VIDEOS[i].desc+'</div><a class="link" href="'+LIB_VIDEOS[i].url+'" target="_blank">Watch</a></div></div>';
  }
  h += '</div>';
  return h;
}

// ====== MUSIC ======
var MUSIC_SUGGESTIONS = [
  {mood:'Calm & Relaxed', desc:'Unwind and de-stress', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/calm%20relaxing%20music'},{name:'YouTube',url:'https://www.youtube.com/results?search_query=calm+relaxing+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=calm%20music'}]},
  {mood:'Uplifting & Happy', desc:'Boost your mood', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/uplifting%20happy%20music'},{name:'YouTube',url:'https://www.youtube.com/results?query=uplifting+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=uplifting%20music'}]},
  {mood:'Focus & Flow', desc:'Deep concentration', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/focus%20music'},{name:'YouTube',url:'https://www.youtube.com/results?search_query=focus+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=focus%20music'}]},
  {mood:'Energetic & Motivated', desc:'Get moving and inspired', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/workout%20motivation%20music'},{name:'YouTube',url:'https://www.youtube.com/results?search_query=workout+motivation+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=workout%20music'}]},
  {mood:'Sad & Reflective', desc:'Let it out', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/sad%20music'},{name:'YouTube',url:'https://www.youtube.com/results?search_query=sad+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=sad%20music'}]},
  {mood:'Meditation & Sleep', desc:'Rest and restore', platforms:[{name:'Spotify',url:'https://open.spotify.com/search/sleep%20meditation%20music'},{name:'YouTube',url:'https://www.youtube.com/results?search_query=sleep+meditation+music'},{name:'Apple Music',url:'https://music.apple.com/search?term=sleep%20music'}]}
];

function saveToPlaylist(song) {
  if (!D.playlist) D.playlist = [];
  if (D.playlist.some(function(s){return s.title === song.title && s.artist === song.artist})) { showToast('Already in your playlist','info'); return; }
  D.playlist.push({ title: song.title, artist: song.artist, url_spotify: song.url_spotify, url_apple: song.url_apple, url_youtube: song.url_youtube, dateAdded: new Date().toDateString() });
  saveData();
  showToast('Saved to your Recovery Playlist!','success');
}

function musicHTML() {
  var h = '<h2 class="page-title">Music for Your Mood</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Curated suggestions to match how you\'re feeling. Open in your favorite platform.</p>';
  // Recovery playlist
  if (D.playlist && D.playlist.length) {
    h += '<div class="card" style="border:2px solid var(--primary)"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:20px">&#9835;</div><h3 style="margin:0">My Recovery Playlist</h3></div><p style="font-size:12px;color:var(--muted);margin-bottom:6px">Songs Arthur recommended from your journal reflections.</p>';
    for (var pi=0;pi<D.playlist.length;pi++) {
      var s = D.playlist[pi];
      h += '<div class="music-item" style="padding:8px"><div class="info"><div class="mood">' + safe(s.title) + '</div><div class="desc">' + safe(s.artist) + ' &middot; ' + safe(s.dateAdded) + '</div><div class="platforms"><a href="' + safe(s.url_spotify) + '" target="_blank">Spotify</a>' + (s.url_youtube ? '<a href="' + safe(s.url_youtube) + '" target="_blank">YouTube</a>' : '') + (s.url_apple ? '<a href="' + safe(s.url_apple) + '" target="_blank">Apple Music</a>' : '') + '</div></div></div>';
    }
    h += '</div>';
  }
  for (var i=0;i<MUSIC_SUGGESTIONS.length;i++) {
    var m = MUSIC_SUGGESTIONS[i];
    h += '<div class="music-item"><div class="info"><div class="mood">'+m.mood+'</div><div class="desc">'+m.desc+'</div><div class="platforms">';
    for (var p=0;p<m.platforms.length;p++) {
      h += '<a href="'+m.platforms[p].url+'" target="_blank">'+m.platforms[p].name+'</a>';
    }
    h += '</div></div></div>';
  }
  return h;
}

// ====== REPORTS ======
var REPORT_PERIOD = 'week';
function reportsHTML() {
  var periods = { week: 7, month: 30 };
  var days = periods[REPORT_PERIOD] || 7;
  var periodLabel = REPORT_PERIOD === 'month' ? 'Monthly' : 'Weekly';
  var h = '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0">';
  h += '<h2 class="page-title">' + periodLabel + ' Report</h2>';
  h += '<div style="display:flex;gap:4px">';
  h += '<button class="btn btn-sm ' + (REPORT_PERIOD==='week'?'btn-primary':'btn-outline') + '" onclick="REPORT_PERIOD=\'week\';render()" style="font-size:11px;padding:6px 10px">Week</button>';
  h += '<button class="btn btn-sm ' + (REPORT_PERIOD==='month'?'btn-primary':'btn-outline') + '" onclick="REPORT_PERIOD=\'month\';render()" style="font-size:11px;padding:6px 10px">Month</button>';
  h += '</div></div>';
  var now = new Date();
  var cutoff = new Date(now.getTime() - days*86400000);

  var periodMoods = D.moods.filter(function(m){return new Date(m.date).getTime() > cutoff.getTime()});
  var avgMood = periodMoods.length ? (periodMoods.reduce(function(s,m){return s+m.val},0)/periodMoods.length).toFixed(1) : 'No data';

  var habitsDone = 0;
  for (var i=0;i<D.habits.length;i++) {
    if (D.habits[i].logs) {
      for (var j=0;j<D.habits[i].logs.length;j++) {
        if (new Date(D.habits[i].logs[j]).getTime() > cutoff.getTime()) habitsDone++;
      }
    }
  }
  var journalCount = D.journal.filter(function(j){return new Date(j.date).getTime() > cutoff.getTime()}).length;
  var checkinCount = D.checkins.filter(function(c){return new Date(c.date).getTime() > cutoff.getTime()}).length;
  var sober = soberDays();

  var soberStreaks = D.checkins.filter(function(c){return new Date(c.date).getTime() > cutoff.getTime()}).length;
  var cravingsCount = D.cravings ? D.cravings.filter(function(c){return c.timestamp > cutoff.getTime()}).length : 0;
  var breatheCount = D.breatheCount || 0;
  var moodChart = '';
  if (periodMoods.length) {
    var moodEmojis = ['😞','😕','😐','🙂','😄'];
    moodChart = '<div style="display:flex;align-items:flex-end;gap:4px;height:60px;margin:8px 0">';
    var maxVal = 5;
    for (var mi=0;mi<periodMoods.length;mi++) {
      var hgt = Math.round((periodMoods[mi].val/maxVal)*60);
      moodChart += '<div title="' + periodMoods[mi].date + '" style="flex:1;height:'+Math.max(4,hgt)+'px;background:var(--primary);border-radius:3px 3px 0 0;min-width:4px"></div>';
    }
    moodChart += '</div>';
  }

  h += '<div class="card"><h3>Overview</h3>';
  h += '<div class="report-section"><h4>' + periodLabel + ' of ' + cutoff.toLocaleDateString() + ' &mdash; ' + now.toLocaleDateString() + '</h4></div>';
  h += '<div class="stat-grid">';
  h += '<div class="stat-card"><div class="num">' + avgMood + '</div><div class="label">Avg Mood</div></div>';
  h += '<div class="stat-card"><div class="num">' + journalCount + '</div><div class="label">Journaled</div></div>';
  h += '<div class="stat-card"><div class="num">' + checkinCount + '</div><div class="label">Check-Ins</div></div>';
  h += '</div>';
  if (moodChart) { h += '<div style="font-size:11px;color:var(--muted);margin:4px 0 2px">Mood timeline</div>' + moodChart; }
  h += '</div>';

  // Additional stats for monthly
  if (REPORT_PERIOD === 'month') {
    h += '<div class="card"><h3>Monthly Breakdown</h3>';
    var monthMoods = [0,0,0,0,0];
    for (var mi2=0;mi2<periodMoods.length;mi2++) monthMoods[periodMoods[mi2].val-1]++;
    var totalMoods = periodMoods.length || 1;
    h += '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:4px;text-align:center;font-size:11px">';
    var ml = ['Terrible','Bad','Okay','Good','Great'];
    var mc = ['#ef4444','#f97316','#eab308','#22c55e','#059669'];
    for (var mi3=0;mi3<5;mi3++) {
      var pct = Math.round(monthMoods[mi3]/totalMoods*100);
      h += '<div><div style="font-size:10px;color:var(--muted)">' + ml[mi3] + '</div><div style="font-size:18px;font-weight:700;color:' + mc[mi3] + '">' + pct + '%</div></div>';
    }
    h += '</div></div>';
  }

  // Milestones
  h += '<div class="card"><h3>Milestones</h3>';
  var milestones = [];
  if (sober >= 1) milestones.push({icon:'&#x2618;',title:'1 Day Sober',desc:'You started your journey'});
  if (sober >= 3) milestones.push({icon:'&#x2726;',title:'3 Days Sober',desc:'Building momentum'});
  if (sober >= 7) milestones.push({icon:'&#x2727;',title:'1 Week Sober',desc:'Incredible progress'});
  if (sober >= 14) milestones.push({icon:'&#x2766;',title:'2 Weeks Sober',desc:'Building strong habits'});
  if (sober >= 30) milestones.push({icon:'&#x265B;',title:'1 Month Sober',desc:'Amazing commitment'});
  if (sober >= 60) milestones.push({icon:'&#x269C;',title:'2 Months Sober',desc:'You are transforming'});
  if (sober >= 90) milestones.push({icon:'&#x2694;',title:'90 Days Sober',desc:'Quarter of a year!'});
  if (sober >= 180) milestones.push({icon:'&#x2726;&#x2727;',title:'6 Months Sober',desc:'Half a year of freedom'});
  if (sober >= 365) milestones.push({icon:'&#x265B;&#x265B;',title:'1 Year Sober',desc:'One year of reclaiming your life'});
  if (journalCount >= (REPORT_PERIOD==='month'?10:3)) milestones.push({icon:'&#x2712;',title:'Consistent Journaler',desc:'Wrote ' + (REPORT_PERIOD==='month'?'10+':'3+') + ' times'});
  if (checkinCount >= (REPORT_PERIOD==='month'?20:5)) milestones.push({icon:'&#x2713;',title:D.checkins.length>=20?'Check-In Champion':'Daily Check-In Champ',desc:'Checked in ' + (REPORT_PERIOD==='month'?'20+':'5+') + ' times'});
  if (D.habits.length > 0 && habitsDone >= D.habits.length * (REPORT_PERIOD==='month'?20:5)) milestones.push({icon:'&#x2694;',title:'Habit Hero',desc:'Most habits completed'});
  if (!milestones.length) h += '<div class="empty-state">Complete more activities to earn milestones!</div>';
  for (var i=0;i<milestones.length;i++) {
    h += '<div class="milestone"><div class="info"><div class="title">' + milestones[i].title + '</div><div class="desc">' + milestones[i].desc + '</div></div></div>';
  }
  h += '</div>';

  // Habit completion
  if (D.habits.length) {
    var habitGoal = D.habits.length * days;
    var pct = habitGoal > 0 ? Math.round(habitsDone/habitGoal*100) : 0;
    h += '<div class="card"><h3>Habit Completion</h3><p style="font-size:13px;color:var(--muted)">' + habitsDone + '/' + habitGoal + ' habit checks</p><div class="progress-bar"><div class="fill" style="width:' + pct + '%"></div></div></div>';
  }

  // Mood trend
  if (periodMoods.length >= 3) {
    var trending = periodMoods[periodMoods.length-1].val > periodMoods[0].val ? 'up' : periodMoods[periodMoods.length-1].val < periodMoods[0].val ? 'down' : 'stable';
    var trendText = trending === 'up' ? 'Your mood is trending upward. You\'re making progress!' : trending === 'down' ? 'Your mood has dipped. Be gentle with yourself.' : 'Your mood has been steady. Stability is strength.';
    h += '<div class="card"><h3>Mood Trend</h3><p style="font-size:13px;color:var(--muted)">' + trendText + '</p></div>';
  }

  return h;
}
// ====== BUDDY ======
function buddyHTML() {
  if (!D.buddy || !D.buddy.name) return setupBuddyHTML();
  var h = '';
  h += '<h2 class="page-title">'+t('Your Partner')+'</h2>';
  h += '<div class="comrade-card"><div class="comrade-avatar">' + D.buddy.name[0].toUpperCase() + '</div><div><div style="font-weight:700;font-size:16px">' + D.buddy.name + '</div><div style="font-size:12px;color:var(--muted)">' + (D.buddy.relationship || 'Accountability Partner') + (D.buddy.contact ? ' &middot; ' + D.buddy.contact : '') + (D.buddy.language ? ' &middot; ' + D.buddy.language : '') + '</div></div></div>';
  h += '<div class="stat-grid" style="margin:8px 0">';
  h += '<div class="stat-card"><div class="num">' + buddyStreak() + '</div><div class="label">Buddy Streak</div></div>';
  h += '<div class="stat-card"><div class="num">' + D.buddyCheckins.length + '</div><div class="label">Check-Ins</div></div>';
  h += '<div class="stat-card"><div class="num">' + D.buddyGoals.filter(function(g){return g.completed}).length + '/' + D.buddyGoals.length + '</div><div class="label">Goals</div></div>';
  h += '</div>';
  var today = new Date().toDateString();
  var checkedInToday = D.buddyCheckins.filter(function(c){return c.date===today}).length;
  if (checkedInToday) {
    h += '<div class="card" style="background:var(--primary-light);border:2px solid var(--primary)"><div style="display:flex;align-items:center;gap:8px"><div><div style="font-weight:600;font-size:14px">Checked in with ' + safe(D.buddy.name) + '</div><div style="font-size:12px;color:var(--muted)">Great job staying connected!</div></div></div></div>';
  } else {
    h += '<div class="card"><h3>Send Word to ' + safe(D.buddy.name) + '</h3><p style="font-size:13px;color:var(--muted);margin-bottom:8px">Send a raven and learn of their days.</p><button class="btn btn-primary btn-sm" onclick="comradeCheckin()">Send Word Now</button></div>';
  }
  h += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>Shared Goals</h3><button class="btn btn-sm btn-outline" onclick="addGoal()">+ Add</button></div>';
  if (!D.buddyGoals.length) {
    h += '<div class="empty-state">No shared goals yet. Set a goal with ' + safe(D.buddy.name) + '.</div>';
  } else {
    for (var i=0;i<D.buddyGoals.length;i++) {
      var done = D.buddyGoals[i].completed ? ' done' : '';
      h += '<div class="goal-item' + done + '"><input type="checkbox" ' + (D.buddyGoals[i].completed ? 'checked' : '') + ' onchange="toggleGoal(' + i + ')" style="width:auto;margin:0"><span style="flex:1">' + safe(D.buddyGoals[i].title) + '</span><span style="font-size:11px;color:var(--muted)">' + safe(D.buddyGoals[i].dateCreated || '') + '</span></div>';
    }
  }
  h += '</div>';
  h += '<div class="card"><h3>Recent Check-Ins</h3>';
  var recent = D.buddyCheckins.slice().reverse().slice(0,5);
  if (!recent.length) {
    h += '<div class="empty-state">No check-ins yet.</div>';
  } else {
    for (var i=0;i<recent.length;i++) {
      h += '<div class="entry-item"><div class="date">' + safe(recent[i].date) + ' at ' + safe(recent[i].time) + '</div><div class="preview">' + safe(recent[i].note || 'Checked in') + '</div></div>';
    }
  }
  h += '</div>';
  // Accountability check-in
  if (!D.accountability) D.accountability = { frequency: 1, lastCheckin: null, streak: 0, bestStreak: 0, checkins: [] };
  var acc = D.accountability;
  var buddyName = D.buddy.name;
  h += '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:18px">&#128170;</div><h3 style="margin:0">Accountability Check-In</h3></div>';
  h += '<p style="font-size:12px;color:var(--muted);margin-bottom:8px">Stay consistent with ' + safe(buddyName) + '. Check in on schedule to build reliability.</p>';
  var streakLabel = acc.streak > 0 ? acc.streak + ' day' + (acc.streak !== 1 ? 's' : '') : 'Not started';
  h += '<div class="stat-grid" style="margin-bottom:8px"><div class="stat-card"><div class="num">' + streakLabel + '</div><div class="label">Streak</div></div><div class="stat-card"><div class="num">' + (acc.bestStreak||0) + '</div><div class="label">Best</div></div><div class="stat-card"><div class="num">' + (acc.checkins||[]).length + '</div><div class="label">Total</div></div></div>';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:8px"><span style="font-size:11px;color:var(--muted)">Check in every</span><select onchange="D.accountability.frequency=parseInt(this.value);saveData()" style="font-size:11px;padding:2px 4px;border-radius:4px;border:1px solid var(--border);background:var(--card);color:var(--text)">';
  [1,2,3,4,5,6,7].forEach(function(n){h+='<option value="'+n+'"'+(acc.frequency===n?' selected':'')+'>'+n+' day'+(n>1?'s':'')+'</option>';});
  h += '</select></div>';
  var due = acc.lastCheckin ? (Date.now() - acc.lastCheckin) / 86400000 >= acc.frequency : true;
  h += '<button class="btn btn-primary btn-sm" onclick="accCheckin()" style="width:100%;font-size:12px" ' + (due ? '' : 'disabled') + '>' + (due ? 'Check In Now' : 'Already checked in') + '</button>';
  if (acc.checkins && acc.checkins.length) {
    h += '<div style="margin-top:8px;max-height:120px;overflow-y:auto">';
    var recentAcc = acc.checkins.slice().reverse().slice(0,5);
    for (var ai=0;ai<recentAcc.length;ai++) {
      h += '<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px"><span style="color:var(--muted)">' + safe(recentAcc[ai].date) + '</span><span>' + safe(recentAcc[ai].note||'') + '</span></div>';
    }
    h += '</div>';
  }
  h += '</div>';
  // Progress sharing
  h += '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#128200;</div><h3 style="margin:0">Share Your Progress</h3></div><p style="font-size:13px;color:var(--muted);margin-bottom:8px">Let ' + safe(D.buddy.name) + ' see your recovery stats. Sharing is automatic when you visit this page.</p><button class="btn btn-primary btn-sm" id="share-progress-btn" onclick="shareProgressWithBuddy()">Share My Progress</button></div>';
  h += '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#128170;</div><h3 style="margin:0">' + safe(D.buddy.name) + '\'s Progress</h3></div><div id="comrade-progress"><div class="empty-state">Loading...</div></div></div>';
  // Streak competition
  h += buddyCompetitionHTML();
  // Shared challenges
  h += buddyChallengesHTML();
  // Competitions
  h += competitionsHTML();
  // Messages
  h += buddyMessagesHTML();
  h += '<div style="display:flex;gap:8px;margin:8px 0">';
  h += '<button class="btn btn-outline btn-sm" onclick="editBuddy()" style="flex:1">Edit Partner</button>';
  h += '<button class="btn btn-danger btn-sm" onclick="removeBuddy()" style="flex:1">Remove</button>';
  h += '</div>';
  // Previously paired buddies
  var past = D.pairedBuddies || [];
  if (past.length > 0) {
    h += '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:16px">&#128101;</div><h3 style="margin:0;font-size:14px">Past Partners</h3></div>';
    for (var pi=0;pi<past.length;pi++) {
      if (past[pi].email === (D.buddy && D.buddy.contact)) continue;
      h += '<div style="display:flex;align-items:center;gap:6px;padding:6px 0;border-bottom:1px solid var(--border);font-size:12px"><span style="flex:1">' + safe(past[pi].name) + '</span><span style="font-size:11px;color:var(--muted)">' + (past[pi].language || '') + '</span></div>';
    }
    h += '</div>';
  }
  setTimeout(fetchBuddyProgress, 400);
  setTimeout(function(){ shareProgressWithBuddy(true); }, 600);
  return h;
}

function buddyStreak() {
  var s = 0;
  var d = new Date();
  for (var i=0;i<365;i++) {
    var ds = d.toDateString();
    var found = D.buddyCheckins.some(function(c){return c.date===ds});
    if (found) s++;
    else if (i>0) break;
    d.setDate(d.getDate()-1);
  }
  return s;
}

function buddyCompetitionHTML() {
  var myStreak = buddyStreak();
  var h = '<div class="card" id="comrade-competition"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#9876;&#65039;</div><h3 style="margin:0">Streak Challenge</h3></div><div id="comrade-competition-content"><div class="empty-state">Loading competition data...</div></div></div>';
  // Fetch buddy's progress for comparison
  setTimeout(function(){
    var buddyEmail = D.buddy ? D.buddy.contact : '';
    if (!buddyEmail) { var el = document.getElementById('buddy-competition-content'); if (el) el.innerHTML = '<div class="empty-state">No partner contact found.</div>'; return; }
    DB.collection('progress').doc(buddyEmail).get().then(function(doc){
      var p = doc.exists ? doc.data() : null;
      var buddyStreakData = p ? p.streak : 0;
      var el = document.getElementById('buddy-competition-content');
      if (!el) return;
      var myName = D.name || 'You';
      var buddyName = D.buddy ? D.buddy.name : 'Buddy';
      var winner = myStreak > buddyStreakData ? myName : (buddyStreakData > myStreak ? buddyName : 'Tie');
      var myPct = Math.min(100, (myStreak / Math.max(myStreak, buddyStreakData, 1)) * 100);
      var budPct = Math.min(100, (buddyStreakData / Math.max(myStreak, buddyStreakData, 1)) * 100);
      var emoji = winner === myName ? '&#x265B;' : (winner === buddyName ? '&#x2726;&#x2726;' : '&#x2618;');
      el.innerHTML = '<div style="text-align:center;margin-bottom:8px"><span style="font-size:28px">' + emoji + '</span><div style="font-weight:700;font-size:16px;color:var(--primary)">' + (winner === 'Tie' ? 'You\'re tied!' : winner + ' is winning!') + '</div></div><div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span>' + myName + '</span><span style="font-weight:700">' + myStreak + ' days</span></div><div class="progress-bar"><div class="fill" style="width:' + myPct + '%"></div></div></div><div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:2px"><span>' + buddyName + '</span><span style="font-weight:700">' + buddyStreakData + ' days</span></div><div class="progress-bar"><div class="fill" style="width:' + budPct + '%;background:var(--accent)"></div></div></div><div style="text-align:center;font-size:11px;color:var(--muted);margin-top:4px">Keep checking in to stay ahead!</div>';
    }).catch(function(){
      var el = document.getElementById('buddy-competition-content');
      if (el) el.innerHTML = '<div class="empty-state">Share progress to start the challenge!</div>';
    });
  }, 600);
  return h;
}

// ====== BUDDY CHALLENGES ======
function buddyChallengesHTML() {
  var challenges = D.buddyGoals || [];
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#x265B;</div><h3 style="margin:0">Shared Challenges</h3></div>';
  if (!challenges.length) {
    h += '<div class="empty-state">No challenges yet. Create one to compete with ' + (D.buddy ? D.buddy.name : 'your partner') + '!</div>';
    h += '<button class="btn btn-outline btn-sm" onclick="newChallenge()">+ New Challenge</button></div>';
    return h;
  }
  var completed = challenges.filter(function(g){return g.completed}).length;
  h += '<p style="font-size:12px;color:var(--muted);margin-bottom:6px">' + completed + '/' + challenges.length + ' completed</p>';
  for (var i=0;i<challenges.length;i++) {
    var done = challenges[i].completed ? 'line-through;color:var(--muted)' : '';
    h += '<div class="goal-item" style="text-decoration:' + done + ';cursor:pointer;padding:8px 6px" onclick="toggleGoal(' + i + ');render()"><span style="flex:1;font-size:13px">' + challenges[i].title + '</span><span style="font-size:11px;color:var(--muted)">' + (challenges[i].completed ? '&#10003;' : '&#9711;') + '</span></div>';
  }
  h += '<button class="btn btn-outline btn-sm" onclick="newChallenge()" style="margin-top:6px">+ New Challenge</button></div>';
  return h;
}

function newChallenge() {
  var title = prompt(t('Challenge title (e.g. "7-day check-in streak"):'));
  if (!title || !title.trim()) return;
  D.buddyGoals.push({ id: Date.now(), title: title.trim(), description: '', completed: false, dateCreated: new Date().toDateString() });
  saveData();
  render();
}

// ====== COMPETITIONS ======
function competitionsHTML() {
  var comps = D.competitions || [];
  if (!comps.length) return '';
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#9876;&#65039;</div><h3 style="margin:0">Active Competitions</h3></div>';
  var now = Date.now();
  var active = comps.filter(function(c){ return c.status === 'active' && c.endDate > now; });
  if (!active.length) {
    h += '<div class="empty-state">No active competitions. Start one with your partner!</div>';
    h += '<button class="btn btn-outline btn-sm" onclick="createCompetition()">+ New Competition</button></div>';
    return h;
  }
  for (var i=0;i<active.length;i++) {
    var c = active[i];
    var me = c.participants && c.participants[0] ? c.participants[0] : {name:'You',progress:0};
    var them = c.participants && c.participants[1] ? c.participants[1] : {name:'Buddy',progress:0};
    var total = Math.max(me.progress, them.progress, 1);
    var myPct = Math.min(100, (me.progress / total) * 100);
    var theirPct = Math.min(100, (them.progress / total) * 100);
    var leader = me.progress > them.progress ? me.name : (them.progress > me.progress ? them.name : 'Tied');
    var daysLeft = Math.max(0, Math.ceil((c.endDate - now) / 86400000));
    h += '<div style="border:1px solid var(--border);border-radius:8px;padding:10px;margin-bottom:8px">';
    h += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px"><strong style="font-size:13px">' + safe(c.title) + '</strong><span style="font-size:11px;color:var(--muted)">' + daysLeft + 'd left</span></div>';
    h += '<div style="font-size:11px;color:var(--muted);margin-bottom:6px">' + leader + ' is winning</div>';
    h += '<div style="margin:4px 0"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px"><span>' + safe(me.name) + '</span><span>' + me.progress + '</span></div><div class="progress-bar"><div class="fill" style="width:' + myPct + '%"></div></div></div>';
    h += '<div style="margin:4px 0"><div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px"><span>' + safe(them.name) + '</span><span>' + them.progress + '</span></div><div class="progress-bar"><div class="fill" style="width:' + theirPct + '%;background:var(--accent)"></div></div></div>';
    h += '<button class="btn btn-sm btn-outline" onclick="addCompetitionProgress(' + i + ')" style="margin-top:4px;font-size:10px">+ Update Progress</button>';
    h += '</div>';
  }
  h += '<button class="btn btn-outline btn-sm" onclick="createCompetition()">+ New Competition</button></div>';
  return h;
}

function createCompetition() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var buddyName = D.buddy ? D.buddy.name : 'your partner';
  var types = [
    {id:'streak', label:'Check-in Streak', desc:'Who keeps the longest streak'},
    {id:'journal', label:'Journal Entries', desc:'Who writes more entries'},
    {id:'checkin', label:'Buddy Check-ins', desc:'Who checks in more'},
    {id:'custom', label:'Custom Challenge', desc:'Set your own rules'}
  ];
  overlay.innerHTML = '<div class="overlay-content" style="max-width:380px"><h3 style="margin-bottom:4px">Start a Competition</h3><p style="font-size:12px;color:var(--muted);margin-bottom:10px">Compete with ' + safe(buddyName) + ' to stay motivated</p><div style="margin-bottom:10px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Challenge Type</label>' +
    types.map(function(t,i){ return '<div class="goal-item" onclick="selectCompType('+i+')" id="comp-type-'+i+'" style="cursor:pointer;padding:8px 10px;margin-bottom:4px;border:2px solid var(--border);border-radius:8px"><strong style="font-size:13px">' + t.label + '</strong><div style="font-size:11px;color:var(--muted)">' + t.desc + '</div></div>'; }).join('') +
    '</div><div style="margin-bottom:10px"><label style="font-size:12px;font-weight:600;display:block;margin-bottom:4px">Duration (days)</label><select id="comp-duration" style="width:100%;padding:8px 10px;border:1px solid var(--border);border-radius:8px;background:var(--card);color:var(--text)"><option value="7">7 days</option><option value="14">14 days</option><option value="21">21 days</option><option value="30" selected>30 days</option><option value="60">60 days</option></select></div>' +
    '<div style="display:flex;gap:6px;margin-top:4px"><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()">Cancel</button><button class="btn btn-primary" onclick="finalizeCompetition()">&#9876;&#65039; Start Competition!</button></div></div>';
  document.body.appendChild(overlay);
  window._compBuddyName = buddyName;
}

function finalizeCompetition() {
  var typeEl = document.querySelector('[id^="comp-type-"].selected');
  if (!typeEl) { alert('Select a challenge type'); return; }
  var idx = parseInt(typeEl.id.replace('comp-type-',''));
  var types = ['streak','journal','checkin','custom'];
  var type = types[idx];
  var labels = ['Check-in Streak','Journal Entries','Buddy Check-ins','Custom Challenge'];
  var duration = parseInt(document.getElementById('comp-duration').value);
  var title = type === 'custom' ? prompt('Name your challenge:') : labels[idx] + ' Battle';
  if (!title || !title.trim()) return;
  if (!D.competitions) D.competitions = [];
  var buddyEmail = D.buddy ? (D.buddy.contact || 'buddy@unknown') : 'buddy@unknown';
  D.competitions.push({
    id: Date.now(),
    type: type,
    title: title.trim(),
    startDate: Date.now(),
    endDate: Date.now() + duration * 86400000,
    participants: [{email: AUTH_EMAIL, name: D.name || 'You', progress: 0}, {email: buddyEmail, name: D.buddy ? D.buddy.name : 'Buddy', progress: 0}],
    status: 'active'
  });
  saveData();
  document.querySelector('.overlay').remove();
  render();
}
window.selectCompType = function(idx) {
  document.querySelectorAll('[id^="comp-type-"]').forEach(function(el){ el.classList.remove('selected'); el.style.borderColor = 'var(--border)'; });
  var el = document.getElementById('comp-type-'+idx);
  if (el) { el.classList.add('selected'); el.style.borderColor = 'var(--primary)'; }
};
window.addCompetitionProgress = function(idx) {
  var comps = D.competitions || [];
  if (!comps[idx]) return;
  var me = comps[idx].participants[0];
  if (me.email !== AUTH_EMAIL) { me = comps[idx].participants[1]; }
  if (!me) return;
  me.progress = (me.progress || 0) + 1;
  saveData();
  render();
};

function setupBuddyHTML() {
  var h = '';
  h += '<h2 class="page-title" style="margin:16px 0 8px">'+t('Find Your Partner')+'</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:16px">An accountability partner helps you stay on track. Connect with someone who speaks your language anywhere in the world.</p>';
  h += '<div class="card"><h3>Add Buddy Manually</h3>';
  h += '<input type="text" id="comrade-name" placeholder="partner\'s name">';
  h += '<input type="text" id="comrade-contact" placeholder="Phone, email, or username (optional)">';
  h += '<input type="text" id="comrade-relationship" placeholder="e.g. Friend, Therapist, Sponsor">';
  h += '<div style="font-size:12px;color:var(--muted);margin:6px 0 2px">Buddy\'s language</div>';
  h += '<select id="comrade-language" style="width:100%;padding:10px 12px;font-size:14px;margin:0 0 8px">';
  for (var li=0;li<LANGUAGES.length;li++) h += '<option value="'+LANGUAGES[li]+'"'+(LANGUAGES[li]===(D.language||'English')?' selected':'')+'>'+LANGUAGES[li]+'</option>';
  h += '</select>';
  h += '<button class="btn btn-primary" onclick="saveBuddy()">Add Partner</button></div>';
  // Find buddies by pairing code (works across the world)
  h += '<div class="card" style="border:2px solid var(--accent);text-align:center"><h3>Find Me a partner</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">I\'ll automatically match you with someone who speaks <strong>' + (D.language || 'English') + '</strong>.</p>';
  h += '<button class="btn btn-primary" id="find-buddy-btn" onclick="findBuddyAuto()" style="margin-bottom:6px">Find Me a partner</button>';
  h += '<div id="auto-buddy-result"></div></div>';
  h += '<div class="card" style="border:2px solid var(--primary)"><h3>Worldwide Buddy Pairing</h3>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">Your language: <strong>' + (D.language || 'English') + '</strong></p>';
  h += '<div style="font-size:13px;color:var(--muted);margin-bottom:8px">Generate a pairing code to share with your partner anywhere in the world. When they enter the same code, you\'ll be connected automatically via our global directory.</div>';
  h += '<div style="display:flex;gap:8px;margin-bottom:6px"><input type="text" id="pairing-code" placeholder="Enter pairing code" style="flex:1"><button class="btn btn-sm btn-primary" onclick="connectPairingCode()">Connect</button></div>';
  h += '<button class="btn btn-sm btn-outline" onclick="generatePairingCode()">Generate My Code</button>';
  h += '<div id="pairing-result" style="margin-top:8px;font-size:13px;color:var(--muted)"></div>';
  h += '</div>';
  // Available buddies by language (local)
  var registered = getRegisteredBuddies();
  var lang = D.language || 'English';
  var matches = registered.filter(function(b){return b.language === lang && b.email !== AUTH_EMAIL});
  var totalLocal = matches.length;
  h += '<div class="card" id="buddies-local"><h3>Available Partners (' + lang + ') <span id="comrade-count" style="font-size:12px;color:var(--muted);font-weight:400">(local)</span></h3>';
  if (matches.length) {
    for (var mi=0;mi<matches.length;mi++) {
      h += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">' + safe(matches[mi].name) + '</div><div style="font-size:11px;color:var(--muted)">' + safe(matches[mi].language) + ' speaker</div></div><button class="btn btn-sm btn-primary" onclick="connectToBuddy(\'' + matches[mi].email.replace(/'/g,'\\\'') + '\')">Connect</button></div>';
    }
  } else {
    h += '<div class="empty-state">No local partners found yet.</div>';
  }
  h += '</div>';
  // Global buddies (fetched from worldwide directory)
  h += '<div class="card" id="buddies-global"><h3>Worldwide Partners <span style="font-size:12px;color:var(--muted);font-weight:400">(global directory)</span></h3>';
  h += '<div id="global-buddies-list"><div class="empty-state">Loading global buddies...</div></div>';
  h += '</div>';
  h += '<div class="card"><p style="font-size:12px;color:var(--muted);line-height:1.5">Set your language in Profile to find partners who speak your language. The global directory connects you with people on the same journey worldwide.</p></div>';
  // Fetch global buddies asynchronously
  setTimeout(function(){
    fetchGlobalBuddies(function(globalList){
      var listEl = document.getElementById('global-buddies-list');
      if (!listEl) return;
      if (globalList === null) {
        listEl.innerHTML = '<div class="empty-state">Could not reach global directory. Partners will appear when connected to the internet.</div>';
        return;
      }
      var globalMatches = globalList.filter(function(b){return b.language === lang && b.email !== AUTH_EMAIL && !matches.some(function(lb){return lb.email === b.email})});
      if (!globalMatches.length) {
        listEl.innerHTML = '<div class="empty-state">No Worldwide Partners in your language yet. Be the first  share your pairing code!</div>';
        return;
      }
      var gh = '';
      for (var gi=0;gi<globalMatches.length;gi++) {
        gh += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border)"><div style="flex:1"><div style="font-weight:600;font-size:13px">' + safe(globalMatches[gi].name) + '</div><div style="font-size:11px;color:var(--muted)">' + safe(globalMatches[gi].language) + ' speaker</div></div><button class="btn btn-sm btn-primary" onclick="connectToBuddy(\'' + globalMatches[gi].email.replace(/'/g,'\\\'') + '\')">Connect</button></div>';
      }
      listEl.innerHTML = gh;
      var countEl = document.getElementById('buddy-count');
      if (countEl) countEl.textContent = '(local: ' + totalLocal + ', global: ' + globalMatches.length + ')';
    });
  }, 300);
  return h;
}

function saveBuddy() {
  var name = document.getElementById('buddy-name');
  if (!name || !name.value.trim()) { alert(t('Enter your partner\'s name.')); return; }
  D.buddy = { name: name.value.trim(), contact: document.getElementById('buddy-contact') ? document.getElementById('buddy-contact').value.trim() : '', relationship: document.getElementById('buddy-relationship') ? document.getElementById('buddy-relationship').value.trim() : '', language: document.getElementById('buddy-language') ? document.getElementById('buddy-language').value : (D.language || 'English') };
  saveData();
}

function buddyCheckin() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">Send Word to ' + (D.buddy ? D.buddy.name : 'your partner') + '</h3><p style="font-size:13px;color:var(--muted);margin-bottom:12px">How did your interaction go?</p><div class="mood-row" id="checkin-moods">';
  var labels = ['Tough','Hard','Okay','Good','Great'];
  for (var i=0;i<5;i++) h += '<button class="mood-btn" data-val="'+(i+1)+'" onclick="[].forEach.call(document.querySelectorAll(\'#checkin-moods .mood-btn\'),function(b){b.classList.remove(\'active\')});this.classList.add(\'active\')">'+labels[i]+'</button>';
  h += '</div><textarea id="checkin-note" placeholder="What did you talk about? Any wins?" style="min-height:80px"></textarea><button class="btn btn-primary" onclick="saveBuddyCheckin(this)">Seal the Record</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">Cancel</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function saveBuddyCheckin(btn) {
  var moodBtns = document.querySelectorAll('#checkin-moods .mood-btn.active');
  var note = document.getElementById('checkin-note');
  var now = new Date();
  D.buddyCheckins.push({ date: now.toDateString(), time: String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'), note: note ? note.value.trim() : '', rating: moodBtns.length ? parseInt(moodBtns[0].getAttribute('data-val')) : 0 });
  saveData();
  btn.closest('.overlay').remove();
}

function addGoal() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+t('New Shared Goal')+'</h3><p style="font-size:13px;color:var(--muted);margin-bottom:12px">'+t('Set a goal with')+' ' + (D.buddy ? D.buddy.name : t('your partner')) + '</p><input type="text" id="goal-title" placeholder="'+t('Goal title')+'"><textarea id="goal-desc" placeholder="'+t('Description')+'" style="min-height:60px"></textarea><button class="btn btn-primary" onclick="saveGoal(this)">'+t('Save Goal')+'</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  document.body.appendChild(overlay);
}

function saveGoal(btn) {
  var title = document.getElementById('goal-title');
  if (!title || !title.value.trim()) { alert(t('Enter a goal title.')); return; }
  D.buddyGoals.push({ id: Date.now(), title: title.value.trim(), description: document.getElementById('goal-desc') ? document.getElementById('goal-desc').value.trim() : '', completed: false, dateCreated: new Date().toDateString() });
  saveData();
  btn.closest('.overlay').remove();
}

function toggleGoal(idx) { D.buddyGoals[idx].completed = !D.buddyGoals[idx].completed; saveData(); }

function editBuddy() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var opts = '';
  for (var li=0;li<LANGUAGES.length;li++) opts += '<option value="'+LANGUAGES[li]+'"'+(LANGUAGES[li]===(D.buddy.language||D.language||'English')?' selected':'')+'>'+LANGUAGES[li]+'</option>';
  overlay.innerHTML = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+t('Edit Partner')+'</h3><input type="text" id="eb-name" value="'+(D.buddy.name||'')+'" placeholder="'+t('Name')+'"><input type="text" id="eb-contact" value="'+(D.buddy.contact||'')+'" placeholder="'+t('Contact')+'"><input type="text" id="eb-rel" value="'+(D.buddy.relationship||'')+'" placeholder="'+t('Relationship')+'"><div style="font-size:12px;color:var(--muted);margin:6px 0 2px">'+t('Tongue')+'</div><select id="eb-lang" style="width:100%;padding:10px 12px;font-size:14px;margin:0 0 8px">'+opts+'</select><button class="btn btn-primary" onclick="saveBuddyEdit(this)">'+t('Save')+'</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  document.body.appendChild(overlay);
}

function saveBuddyEdit(btn) {
  var name = document.getElementById('eb-name');
  if (!name || !name.value.trim()) { alert(t('Name is required.')); return; }
  D.buddy.name = name.value.trim();
  D.buddy.contact = document.getElementById('eb-contact') ? document.getElementById('eb-contact').value.trim() : '';
  D.buddy.relationship = document.getElementById('eb-rel') ? document.getElementById('eb-rel').value.trim() : '';
  D.buddy.language = document.getElementById('eb-lang') ? document.getElementById('eb-lang').value : '';
  saveData();
  btn.closest('.overlay').remove();
}

function removeBuddy() {
  if (!confirm(t('Remove your accountability partner?'))) return;
  D.buddy = null;
  saveData();
  alert(t('Partner removed.'));
  render();
}

// ====== PROGRESS SHARING ======
function progressSnapshot() {
  return {
    soberDays: soberDays(),
    streak: D.streak || 0,
    journalCount: D.journal.length,
    moodCount: D.moods.length,
    habitsDone: D.habits.filter(function(h){return h.logs && h.logs.length}).length,
    checkins: D.checkins.length,
    addictionType: D.sobriety.addictionType || '',
    updated: new Date().toLocaleDateString()
  };
}

function shareProgressWithBuddy(quiet) {
  var progress = progressSnapshot();
  DB.collection('progress').doc(AUTH_EMAIL).set(progress).then(function(){
    var btn = document.getElementById('share-progress-btn');
    if (btn) { btn.textContent = '? Shared! (' + progress.updated + ')'; btn.style.background = 'var(--primary-light)'; btn.style.color = 'var(--primary-dark)'; }
    if (!quiet) { alert(t('Your progress has been shared with') + ' ' + (D.buddy ? D.buddy.name : t('your partner')) + '!'); }
    fetchBuddyProgress();
  }).catch(function(){ if (!quiet) alert(t('Could not share. Check your internet connection.')); });
}

function fetchBuddyProgress() {
  var buddyEmail = D.buddy ? D.buddy.contact : '';
  if (!buddyEmail) { var el = document.getElementById('buddy-progress'); if (el) el.innerHTML = '<div class="empty-state">No partner contact found.</div>'; return; }
  DB.collection('progress').doc(buddyEmail).get().then(function(doc){
    var p = doc.exists ? doc.data() : null;
    var el = document.getElementById('buddy-progress');
    if (!el) return;
    if (!p) {
      el.innerHTML = '<div class="empty-state">' + (D.buddy ? D.buddy.name : 'Buddy') + ' has not shared progress yet. Encourage them to use the Share Progress button!</div>';
      return;
    }
    el.innerHTML = '<div style="font-size:12px;color:var(--muted);margin-bottom:6px;text-align:center">Last updated: ' + safe(p.updated) + '</div><div class="stat-grid"><div class="stat-card"><div class="num">' + (p.soberDays||0) + '</div><div class="label">Sober Days</div></div><div class="stat-card"><div class="num">' + (p.streak||0) + '</div><div class="label">Day Streak</div></div><div class="stat-card"><div class="num">' + (p.journalCount||0) + '</div><div class="label">Journal</div></div><div class="stat-card"><div class="num">' + (p.moodCount||0) + '</div><div class="label">Moods</div></div><div class="stat-card"><div class="num">' + (p.checkins||0) + '</div><div class="label">Check-Ins</div></div></div>' + (p.addictionType ? '<div style="text-align:center;font-size:12px;color:var(--muted);margin-top:4px">Working on: ' + safe(p.addictionType) + '</div>' : '');
  }).catch(function(){
    var el = document.getElementById('buddy-progress');
    if (el) el.innerHTML = '<div class="empty-state">Could not load progress. Check internet connection.</div>';
  });
}

// ====== STREAK CALENDAR ======
var CAL_MONTH_OFFSET = 0;

function calendarHTML() {
  var now = new Date();
  var d = new Date(now.getFullYear(), now.getMonth() + CAL_MONTH_OFFSET, 1);
  var year = d.getFullYear(), month = d.getMonth();
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var h = '<h2 class="page-title">'+t('Streak Calendar')+'</h2>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">'+t('Color-coded view of your daily activity.')+'</p>';
  h += '<div class="card">';
  h += '<div class="cal-nav"><button onclick="CAL_MONTH_OFFSET--;render()">'+t('Prev')+'</button><span style="font-weight:700;font-size:15px">'+months[month]+' '+year+'</span><button onclick="CAL_MONTH_OFFSET++;render()">'+t('Next')+'</button></div>';
  h += '<div class="cal-grid">';
  var dayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  for (var i=0;i<7;i++) h += '<div class="cal-header">'+dayNames[i]+'</div>';
  var firstDay = d.getDay();
  var daysInMonth = new Date(year, month+1, 0).getDate();
  var prevDays = new Date(year, month, 0).getDate();
  for (var i=0;i<firstDay;i++) { h += '<div class="cal-day other-month" style="background:transparent;cursor:default">'+(prevDays-firstDay+1+i)+'</div>'; }
  for (var day=1;day<=daysInMonth;day++) {
    var dateObj = new Date(year, month, day);
    var dateStr = dateObj.toDateString();
    var isToday = dateStr === now.toDateString();
    var isFuture = dateObj > now;
    var hasMood = D.moods.some(function(m){return m.date===dateStr});
    var hasCheck = D.checkins.some(function(c){return c.date===dateStr});
    var habitsDone = D.habits.filter(function(h){return h.logs && h.logs.indexOf(dateStr)!==-1}).length;
    var hasJournal = D.journal.some(function(j){return j.date===dateStr});
    if (!isFuture) {
      if (hasMood && habitsDone > 0) { h += '<div class="cal-day'+(isToday?' today':'')+'" style="background:var(--primary);color:#fff" onclick="showDayDetail(\''+dateStr+'\')"><span>'+day+'</span></div>'; }
      else if (hasMood && hasJournal) { h += '<div class="cal-day'+(isToday?' today':'')+'" style="background:#3b82f6;color:#fff" onclick="showDayDetail(\''+dateStr+'\')"><span>'+day+'</span></div>'; }
      else if (hasMood) { h += '<div class="cal-day'+(isToday?' today':'')+'" style="background:#22c55e;color:#fff" onclick="showDayDetail(\''+dateStr+'\')"><span>'+day+'</span></div>'; }
      else if (hasCheck || habitsDone > 0) { h += '<div class="cal-day'+(isToday?' today':'')+'" style="background:var(--accent);color:#fff" onclick="showDayDetail(\''+dateStr+'\')"><span>'+day+'</span></div>'; }
      else { h += '<div class="cal-day'+(isToday?' today':'')+'" style="background:var(--border);color:var(--muted)" onclick="showDayDetail(\''+dateStr+'\')"><span>'+day+'</span></div>'; }
    } else {
      h += '<div class="cal-day future" style="background:transparent;color:var(--muted)"><span>'+day+'</span></div>';
    }
  }
  var rem = 7 - ((firstDay + daysInMonth) % 7);
  if (rem < 7) { for (var i=1;i<=rem;i++) { h += '<div class="cal-day other-month" style="background:transparent;cursor:default">'+i+'</div>'; } }
  h += '</div>';
  h += '<div class="cal-legend"><span><span class="swatch" style="background:var(--primary)"></span>'+t('Mood+Habits')+'</span><span><span class="swatch" style="background:#3b82f6"></span>'+t('Mood+Journal')+'</span><span><span class="swatch" style="background:#22c55e"></span>'+t('Mood')+'</span><span><span class="swatch" style="background:var(--accent)"></span>'+t('Check-in/Habits')+'</span><span><span class="swatch" style="background:var(--border)"></span>'+t('Inactive')+'</span></div>';
  h += '<button class="btn btn-outline btn-sm" onclick="CAL_MONTH_OFFSET=0;render()" style="margin-top:8px">'+t('Jump to Today')+'</button>';
  h += '</div>';
  return h;
}

function showDayDetail(dateStr) {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+dateStr+'</h3>';
  var mood = D.moods.filter(function(m){return m.date===dateStr});
  var check = D.checkins.filter(function(c){return c.date===dateStr});
  var habits = D.habits.filter(function(h){return h.logs && h.logs.indexOf(dateStr)!==-1});
  var journal = D.journal.filter(function(j){return j.date===dateStr});
  h += '<div style="font-size:13px;line-height:1.8">';
  h += '<div><strong>'+t('Mood:')+'</strong> '+(mood.length?MOODS[mood[mood.length-1].val-1].label:t('None'))+'</div>';
  h += '<div><strong>Check-in:</strong> '+(check.length?'Yes':'No')+'</div>';
  h += '<div><strong>Habits done:</strong> '+(habits.length?habits.map(function(h){return h.name}).join(', '):'None')+'</div>';
  h += '<div><strong>Journal entries:</strong> '+(journal.length?journal.length:'None')+'</div>';
  h += '</div><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:8px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function showAddictionPrompt() {
  var existing = document.querySelectorAll('.overlay');
  if (existing.length > 2) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var addictions = D.targetAddictions || [];
  var h = '<div class="overlay-content" style="max-width:420px;text-align:center">';
  h += '<div style="display:flex;align-items:center;gap:10px;justify-content:center;margin-bottom:8px"><div style="width:36px;height:36px;border-radius:18px;background:linear-gradient(135deg,var(--primary),#34d399);display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;font-weight:700">A</div><h3 style="font-size:18px;font-weight:700;margin:0">What Are You Working On?</h3></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:12px">Select what you want to overcome. Arthur will create safety plans for each one.</p>';
  h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">';
  for (var i=0;i<ADDICTION_TYPES.length;i++) {
    var sel = addictions.indexOf(ADDICTION_TYPES[i]) >= 0;
    h += '<button class="btn btn-sm ' + (sel ? 'btn-primary' : 'btn-outline') + '" onclick="var idx=D.targetAddictions.indexOf(\''+ADDICTION_TYPES[i]+'\');if(idx>=0)D.targetAddictions.splice(idx,1);else{D.targetAddictions.push(\''+ADDICTION_TYPES[i]+'\')};this.classList.toggle(\'btn-primary\');this.classList.toggle(\'btn-outline\');saveData()" style="font-size:11px;padding:8px">' + (sel ? '&#10003; ' : '') + ADDICTION_TYPES[i] + '</button>';
  }
  h += '</div>';
  h += '<button class="btn btn-primary" onclick="this.closest(\'.overlay\').remove();render()">Done</button>';
  h += '</div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

// ====== REMINDERS ======
var REPEAT_OPTIONS = [{v:'none',l:'Never'},{v:'daily',l:'Daily'},{v:'weekly',l:'Weekly'},{v:'monthly',l:'Monthly'}];
function remindersHTML() {
  var h = '';
  h += '<div style="display:flex;justify-content:space-between;align-items:center;margin:8px 0;gap:8px"><h2 class="page-title" style="margin:0;flex:1;border:none;background:none;text-align:left;font-size:18px;padding:8px 0">Reminders</h2><button class="btn btn-sm btn-primary" onclick="showNewReminder()" style="width:auto;padding:8px 16px">'+t('New')+'</button></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">Set reminders and add them to your device calendar.</p>';
  var reminders = D.reminders || [];
  if (reminders.length === 0) {
    h += '<div class="empty-state">No reminders yet. Tap + New to create one.</div>';
  } else {
    reminders.sort(function(a,b){var aDt=a.date+' '+(a.time||'00:00'),bDt=b.date+' '+(b.time||'00:00');return aDt.localeCompare(bDt)});
    for (var i=0;i<reminders.length;i++) {
      var r = reminders[i];
      var past = isPastReminder(r);
      h += '<div class="card" style="margin:8px 0;padding:14px'+(past?';opacity:.5':';opacity:1')+'">';
      h += '<div style="display:flex;justify-content:space-between;align-items:flex-start">';
      h += '<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(past?'&#10003; ':'')+(r.title||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
      h += '<div style="font-size:12px;color:var(--muted);margin-top:4px">'+formatReminderDate(r.date,r.time)+'</div>';
      if (r.repeat && r.repeat!=='none') h += '<span class="badge badge-green" style="font-size:10px;margin-top:4px;display:inline-block">'+r.repeat.charAt(0).toUpperCase()+r.repeat.slice(1)+'</span>';
      if (r.notes) h += '<div style="font-size:12px;color:var(--muted);margin-top:4px;line-height:1.4;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+(r.notes||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</div>';
      h += '</div>';
      h += '<div style="display:flex;gap:4px;flex-shrink:0;margin-left:8px">';
      h += '<button class="btn btn-sm btn-outline" onclick="exportReminderICS('+i+')" title="Add to Calendar" style="font-size:16px;padding:6px 10px;width:auto;line-height:1">&#128197;</button>';
      h += '<button class="btn btn-sm btn-outline" onclick="showNewReminder('+i+')" title="Edit" style="font-size:12px;padding:6px 10px;width:auto">&#9998;</button>';
      h += '<button class="btn btn-sm btn-danger" onclick="deleteReminder('+i+')" title="Delete" style="font-size:12px;padding:6px 10px;width:auto">&#10005;</button>';
      h += '</div></div></div>';
    }
  }
  h += '<button class="btn btn-outline" onclick="goTo(\'more\')" style="margin-top:4px">Back to More</button>';
  return h;
}
function isPastReminder(r) {
  var dtStr = r.date + (r.time ? 'T'+r.time : 'T23:59');
  return new Date(dtStr) < new Date();
}
function formatReminderDate(date, time) {
  if (!date) return '';
  var parts = date.split('-');
  if (parts.length!==3) return date;
  var d = new Date(parseInt(parts[0]),parseInt(parts[1])-1,parseInt(parts[2]));
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var label = days[d.getDay()]+', '+months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear();
  if (time) label += ' at '+time;
  return label;
}
function showNewReminder(editId) {
  var r = (editId!==undefined && D.reminders && D.reminders[editId]) ? D.reminders[editId] : null;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content"><h3 style="font-size:18px;font-weight:700;margin-bottom:8px">'+(r?'Edit Reminder':'New Reminder')+'</h3>';
  h += '<input type="text" id="rem-title" placeholder="Reminder title" value="'+(r?(r.title||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;'):'')+'">';
  h += '<label style="font-size:13px;font-weight:600;display:block;margin:4px 0 2px">Date</label><input type="date" id="rem-date" value="'+(r?r.date:'')+'">';
  h += '<label style="font-size:13px;font-weight:600;display:block;margin:4px 0 2px">Time (optional)</label><input type="time" id="rem-time" value="'+(r&&r.time?r.time:'')+'">';
  h += '<label style="font-size:13px;font-weight:600;display:block;margin:4px 0 2px">Repeat</label><select id="rem-repeat">';
  for (var i=0;i<REPEAT_OPTIONS.length;i++) {
    h += '<option value="'+REPEAT_OPTIONS[i].v+'"'+(r&&r.repeat===REPEAT_OPTIONS[i].v?' selected':'')+'>'+REPEAT_OPTIONS[i].l+'</option>';
  }
  h += '</select>';
  h += '<textarea id="rem-notes" placeholder="Notes (optional)" style="min-height:60px">'+(r?(r.notes||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'):'')+'</textarea>';
  h += '<button class="btn btn-primary" onclick="saveReminder(this'+(editId!==undefined?','+editId:'')+')">'+(r?'Save':'Create Reminder')+'</button>';
  if (r) h += '<button class="btn btn-outline" onclick="exportReminderICS('+editId+');this.closest(\'.overlay\').remove()" style="margin-top:6px">&#128197; Add to Calendar</button>';
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">Cancel</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
  if (!r) {
    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate()+1);
    var def = tomorrow.getFullYear()+'-'+String(tomorrow.getMonth()+1).padStart(2,'0')+'-'+String(tomorrow.getDate()).padStart(2,'0');
    document.getElementById('rem-date').value = def;
  }
}
function saveReminder(btn, editId) {
  var title = document.getElementById('rem-title');
  var date = document.getElementById('rem-date');
  var time = document.getElementById('rem-time');
  var repeat = document.getElementById('rem-repeat');
  var notes = document.getElementById('rem-notes');
  if (!title||!title.value.trim()){alert(t('Please enter a title.'));return}
  if (!date||!date.value){alert(t('Please select a date.'));return}
  if (!D.reminders) D.reminders = [];
  var obj = {
    id: Date.now(), title: title.value.trim(), date: date.value,
    time: time?time.value:'', repeat: repeat?repeat.value:'none',
    notes: notes?notes.value.trim():'', created: Date.now(), notified: false
  };
  if (editId!==undefined && D.reminders[editId]) {
    D.reminders[editId] = obj;
  } else {
    D.reminders.push(obj);
  }
  saveData();
  btn.closest('.overlay').remove();
  render();
}
function deleteReminder(id) {
  if (!D.reminders||!D.reminders[id]) return;
  if (!confirm(t('Delete this reminder?'))) return;
  D.reminders.splice(id,1);
  saveData();
  render();
}
function exportReminderICS(id) {
  var r = D.reminders&&D.reminders[id];
  if (!r) return;
  var now = new Date();
  var pad2 = function(n){return String(n).padStart(2,'0')};
  var fmtDT = function(d){return d.getFullYear()+pad2(d.getMonth()+1)+pad2(d.getDate())+'T'+pad2(d.getHours())+pad2(d.getMinutes())+'00'};
  var dtParts = r.date.split('-');
  var startDate = new Date(parseInt(dtParts[0]),parseInt(dtParts[1])-1,parseInt(dtParts[2]));
  if (r.time) { var tm=r.time.split(':');startDate.setHours(parseInt(tm[0]),parseInt(tm[1])) }
  var dtStart = fmtDT(startDate);
  var dtStamp = fmtDT(now);
  var rrule = '';
  if (r.repeat==='daily') rrule = 'RRULE:FREQ=DAILY';
  else if (r.repeat==='weekly') rrule = 'RRULE:FREQ=WEEKLY';
  else if (r.repeat==='monthly') rrule = 'RRULE:FREQ=MONTHLY';
  var icsLines = [
    'BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Re.Claim//Reminders//EN',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'UID:reminder-'+r.id+'@reclaim','DTSTAMP:'+dtStamp,'DTSTART:'+dtStart,
    'SUMMARY:'+(r.title||'').replace(/\n/g,'\\n'),
    r.notes ? 'DESCRIPTION:'+r.notes.replace(/\n/g,'\\n') : '',
    rrule,'END:VEVENT','END:VCALENDAR'
  ];
  var ics = icsLines.filter(function(l){return l}).join('\r\n');
  var blob = new Blob([ics],{type:'text/calendar;charset=utf-8'});
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = 'reminder-'+(r.title||'reminder').replace(/[^a-z0-9]/gi,'-').toLowerCase().slice(0,40)+'.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function(){URL.revokeObjectURL(url)},1000);
}
// ====== MORE PAGE ======
function moreHTML() {
  var h = '';
  h += '<h2 class="page-title">'+t('Tools')+'</h2>';
  h += '<h3 style="font-size:13px;font-weight:700;color:var(--primary);margin:12px 0 4px">'+t('Tracking')+'</h3>';
  h += '<div class="sub-grid">';
  h += '<div class="sub-item" onclick="goTo(\'journal\')">'+t('Journal')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'calendar\')">'+t('Calendar')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'reminders\')">'+t('Reminders')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'kingsledger\')" style="border-color:#d4a017">\uD83D\uDCD6 '+t('Cost Tracker')+'</div>';
  h += '</div>';
  h += '<h3 style="font-size:13px;font-weight:700;color:var(--primary);margin:12px 0 4px">'+t('Recovery')+'</h3>';
  h += '<div class="sub-grid">';
  h += '<div class="sub-item" onclick="goTo(\'reports\')">'+t('Reports')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'buddy\')">'+t('Partner')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'safety\')">'+t('Addiction Targets')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'chivalrycode\')" style="border-color:#be185d">&#9876; '+t('My Values')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'royalpardon\')" style="border-color:#ffd700">&#128081; '+t('Fresh Start')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'mywhy\')" style="border-color:#be185d">&#10084; '+t('My Why')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'timecapsule\')" style="border-color:var(--primary)">&#128230; '+t('Time Capsule')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'warchest\')" style="border-color:#2d6a27">&#128176; '+t('Rewards')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'alliances\')" style="border-color:#6366f1">&#9876; '+t('Alliances')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'achievements\')" style="border-color:#d4a017">&#127942; Achievements</div>';
  h += '<div class="sub-item" onclick="goTo(\'shop\')" style="border-color:#d4a017">\u269C '+t('Shop')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'programs\')" style="border-color:#a78bfa">&#127891; '+t('Programs')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'screener\')" style="border-color:var(--accent)">&#128200; '+t('Screeners')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'assessment\')" style="border-color:var(--rose)">&#128202; Addiction Assessment</div>';
  h += '</div>';
  h += '<h3 style="font-size:13px;font-weight:700;color:var(--primary);margin:12px 0 4px">'+t('Resources')+'</h3>';
  h += '<div class="sub-grid">';
  h += '<div class="sub-item" onclick="goTo(\'library\')">'+t('Library')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'music\')">'+t('Music')+'</div>';
  h += '<div class="sub-item" onclick="goTo(\'meetings\')">'+t('Meetings')+'</div>';
  h += '</div>';
  h += '<h3 style="font-size:13px;font-weight:700;color:var(--primary);margin:12px 0 4px">'+t('Settings')+'</h3>';
  h += '<div class="sub-grid">';
  h += '<div class="sub-item" onclick="goTo(\'profile\')">'+t('Profile')+'</div>';
  h += '<div class="sub-item" onclick="showRecommendations()">'+t('Recommendations')+'</div>';
  h += '<div class="sub-item" onclick="showShareQR()" style="border-color:var(--primary)">'+t('Share App')+'</div>';
  h += '<div class="sub-item" onclick="promptInstall()" style="border-color:var(--accent)">&#128230; '+t('Install App')+'</div>';
  h += '</div>';
  return h;
}

// ====== ALLIANCES ======
function alliancesHTML() {
  var days = soberDays();
  var rank = getRank(days);
  var level = kingdomLevel(days);
  var kName = D.kingdomName && D.kingdomName.trim() ? D.kingdomName.trim() : 'My Space';
  var wc = D.warchest || {};
  var shields = wc.shields || 0;
  var h = '<h2 class="page-title">&#9876; Support Alliances</h2>';
  h += '<div style="display:grid;grid-template-columns:1fr;gap:10px;margin:8px 0">';

  // Kingdom card helper
  function kingdomCard(opts) {
    var isUser = opts.isUser;
    var c = '<div class="card" style="padding:14px;text-align:center;border-left:4px solid ' + (isUser ? '#d4a017' : '#6366f1') + '">';
    c += '<div style="font-size:10px;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:2px">' + (isUser ? '&#128081; Your Space' : '&#9876; Allied Space') + '</div>';
    c += '<div style="font-size:16px;font-weight:700;font-family:Georgia,serif;color:var(--primary-dark);margin-bottom:2px">' + safe(opts.name) + '</div>';
    c += '<div style="font-size:24px;margin:4px 0">' + (opts.rank ? opts.rank.icon : '') + '</div>';
    c += '<div style="font-size:13px;color:var(--text)">' + (opts.rank ? opts.rank.title : '') + '</div>';
    c += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin:8px 0">';
    c += '<div><div style="font-size:18px;font-weight:800;color:var(--primary)">' + opts.days + '</div><div style="font-size:8px;color:var(--muted);letter-spacing:1px">DAYS</div></div>';
    c += '<div><div style="font-size:18px;font-weight:800;color:var(--accent)">Lv' + opts.level + '</div><div style="font-size:8px;color:var(--muted);letter-spacing:1px">CASTLE</div></div>';
    c += '<div><div style="font-size:18px;font-weight:800;color:#d4a017">' + opts.shields + '</div><div style="font-size:8px;color:var(--muted);letter-spacing:1px">SHIELDS</div></div>';
    c += '</div>';
    if (opts.population) {
      c += '<div style="font-size:11px;color:var(--muted)">&#128101; ' + opts.population + ' villagers</div>';
    }
    c += '</div>';
    return c;
  }

  // User's kingdom
  h += kingdomCard({
    isUser: true,
    name: kName,
    rank: rank,
    days: days,
    level: level,
    shields: shields,
    population: kingdomPopulation(days)
  });

  // Buddy kingdoms
  var buddyShown = 0;
  var maxBuddies = 2;

  // Current buddy
  if (D.buddy && D.buddy.name) {
    var bName = D.buddy.name;
    var bc = D.buddy.contact || '';
    (function(name, contact) {
      try {
        if (firebase && firebase.auth().currentUser && contact) {
          DB.collection('progress').doc(contact).get().then(function(doc) {
            var p = doc.exists ? doc.data() : null;
            var el = document.getElementById('ally-' + contact.replace(/[^a-z0-9]/gi,''));
            if (!el) return;
            if (p) {
              var bRank = getRank(p.soberDays || 0);
              var bLevel = kingdomLevel(p.soberDays || 0);
              el.innerHTML = kingdomCard({
                name: name,
                rank: bRank,
                days: p.soberDays || 0,
                level: bLevel,
                shields: p.shields || 0,
                population: kingdomPopulation(p.soberDays || 0)
              });
            } else {
              el.innerHTML = '<div class="card" style="padding:14px;text-align:center;border-left:4px solid #6366f1"><div style="font-size:10px;color:var(--muted);letter-spacing:2px">ALLIED REALM</div><div style="font-size:16px;font-weight:700;color:var(--primary-dark);margin:4px 0">' + safe(name) + '</div><div style="font-size:12px;color:var(--muted)">Awaiting their first dispatch...</div></div>';
            }
          }).catch(function(e){ console.warn('Ally data fetch failed for', contact, e); });

          // Share current snapshot so buddy can see us
          var snap = progressSnapshot();
          DB.collection('progress').doc(AUTH_EMAIL).set(snap).catch(function(e){ console.warn('Ally snapshot share failed:', e); });
        }
      } catch(e) { console.warn('Ally block error:', e); }
    })(bName, bc);

    var id = 'ally-' + bc.replace(/[^a-z0-9]/gi,'');
    h += '<div id="' + id + '">' + kingdomCard({ name: bName, rank: {icon:'&#9876;',title:'Partner'}, days: '?', level: '?', shields: '?', population: '?' }) + '</div>';
    buddyShown++;
  }

  // Fill remaining slots
  while (buddyShown < maxBuddies) {
    if (buddyShown === 0) {
      h += '<div class="card" style="padding:20px;text-align:center;border:2px dashed var(--border);background:transparent;cursor:pointer" onclick="goTo(\'buddy\')">';
      h += '<div style="font-size:32px;margin-bottom:6px">&#9876;</div>';
      h += '<div style="font-size:14px;font-weight:600;color:var(--muted)">Seek an Ally</div>';
      h += '<div style="font-size:11px;color:var(--muted);margin-top:4px">Find a partner to form a lasting alliance</div>';
      h += '</div>';
    } else {
      h += '<div class="card" style="padding:20px;text-align:center;border:2px dashed var(--border);background:transparent">';
      h += '<div style="font-size:32px;margin-bottom:6px">&#128736;</div>';
      h += '<div style="font-size:14px;font-weight:600;color:var(--muted)">Open Path</div>';
      h += '<div style="font-size:11px;color:var(--muted);margin-top:4px">An alliance seat awaits a new space</div>';
      h += '</div>';
    }
    buddyShown++;
  }

  h += '</div>';

  h += '<div class="card" style="padding:12px;margin-top:4px;font-size:12px;color:var(--muted);text-align:center">';
  h += '<div style="font-size:10px;color:var(--muted);margin-bottom:4px">&#9876; Alliances are formed through the Partner page. Progress is shared automatically when you visit this page.</div>';
  h += '<button class="btn btn-sm btn-outline" onclick="goTo(\'buddy\')" style="margin-top:6px;display:inline-flex">Find or Manage Partner</button>';
  h += '</div>';

  return h;
}

// ====== RECOMMENDATIONS ======
function showRecommendations() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center"><h3 style="font-size:18px;font-weight:700">&#128161; Recommendations</h3><p style="font-size:13px;color:var(--muted);margin:4px 0 12px">Help shape Re.Claim! Share your ideas, feedback, or anything you\'d like to see improved.</p><textarea id="rec-text" placeholder="What would make this app better for you?" style="min-height:100px;margin-bottom:6px"></textarea><button class="btn btn-primary btn-sm" onclick="submitRecommendation()" style="width:100%">Submit</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">Cancel</button></div>';
  document.body.appendChild(overlay);
}

function submitRecommendation() {
  var text = document.getElementById('rec-text');
  if (!text || !text.value.trim()) { alert('Please write your recommendation first.'); return; }
  var rec = { text: text.value.trim(), email: AUTH_EMAIL || 'anonymous', date: new Date().toISOString() };
  DB.collection('recommendations').add(rec).then(function() {
    alert(t('Thank you! Your recommendation has been submitted.'));
    text.closest('.overlay').remove();
  }).catch(function() {
    alert(t("Thanks! We've saved your feedback locally."));
    text.closest('.overlay').remove(); 
  });
}

// ====== MY WHY ======
function pickWhyIcon(el) {
  var all = document.querySelectorAll('#why-icon-picker .why-icon-opt');
  for (var i=0;i<all.length;i++) all[i].style.borderColor = 'transparent';
  el.style.borderColor = 'var(--primary)';
  el.style.background = 'var(--primary-light)';
  window._selectedWhyIcon = el.textContent;
}
function saveWhyReason() {
  var input = document.getElementById('why-input');
  if (!input || !input.value.trim()) { alert(t('Write a reason first.')); return; }
  if (!D.myWhy) D.myWhy = { reasons: [], createdAt: null };
  if (!D.myWhy.reasons) D.myWhy.reasons = [];
  if (!D.myWhy.createdAt) D.myWhy.createdAt = Date.now();
  D.myWhy.reasons.push({
    text: input.value.trim(),
    icon: window._selectedWhyIcon || '&#10084;',
    createdAt: Date.now()
  });
  window._selectedWhyIcon = null;
  input.value = '';
  saveData();
  showToast(t('Reason pinned to your board!'), 'success');
}
function deleteWhyReason(idx) {
  if (!D.myWhy || !D.myWhy.reasons || idx < 0 || idx >= D.myWhy.reasons.length) return;
  if (!confirm(t('Remove this reason?'))) return;
  D.myWhy.reasons.splice(idx, 1);
  saveData();
}
var WHY_ICONS = ['&#10084;','&#9889;','&#9733;','&#10017;','&#9786;','&#128170;','&#127775;','&#128153;','&#128154;','&#128155;','&#128156;','&#128081;','&#128214;','&#127758;','&#128640;','&#127800;','&#127942;','&#128293;','&#129309;','&#127748;'];
function myWhyHTML() {
  var w = D.myWhy || {};
  if (!w.reasons) w.reasons = [];
  var h = '<h2 class="page-title">&#10084; '+t('My Why')+'</h2>';
  h += '<div class="card" style="border-left:3px solid var(--primary);padding:8px 12px;margin-bottom:8px;background:linear-gradient(135deg,rgba(190,24,93,.06),var(--card))"><div style="display:flex;align-items:center;gap:8px"><div style="width:36px;height:36px;border-radius:18px;background:var(--avatar-arthur);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px">&#10084;</div><div style="font-size:12px;color:var(--muted)">Arthur says: <em>"Every knight needs to know what they\'re fighting for. When the road gets dark, this board will remind you why you picked up the sword."</em></div></div></div>';
  h += '<p style="font-size:13px;color:var(--muted);margin-bottom:8px">'+t("What's your why?")+' Pin the reasons you chose recovery here. These will appear when cravings hit to remind you what\'s at stake.</p>';

  // Stats
  h += '<div class="stat-grid" style="margin-bottom:8px">';
  h += '<div class="stat-card"><div class="num">' + w.reasons.length + '</div><div class="label">'+t('Reasons')+'</div></div>';
  h += '<div class="stat-card"><div class="num">' + (w.createdAt ? (function(){var d=new Date(w.createdAt);var now=new Date();return Math.floor((now-d)/86400000)+'d'})() : '-') + '</div><div class="label">'+t('Since started')+'</div></div>';
  h += '</div>';

  // Add reason
  h += '<div class="card"><h3 style="font-size:14px;margin-bottom:6px">&#10133; '+t('Add Reason')+'</h3>';
  h += '<div style="display:flex;gap:6px;margin-bottom:6px;flex-wrap:wrap" id="why-icon-picker">';
  for (var ii=0;ii<WHY_ICONS.length;ii++) {
    h += '<span class="why-icon-opt" onclick="pickWhyIcon(this)" style="font-size:22px;cursor:pointer;padding:4px 6px;border-radius:6px;display:inline-block;border:1px solid transparent">'+WHY_ICONS[ii]+'</span>';
  }
  h += '</div>';
  h += '<input type="text" id="why-input" placeholder="'+t("I'm recovering because...")+'" style="margin-bottom:6px">';
  h += '<button class="btn btn-sm btn-primary" onclick="saveWhyReason()" style="width:100%">'+t('Pin to Board')+'</button>';
  h += '</div>';

  // Board
  if (!w.reasons.length) {
    h += '<div class="card"><div class="empty-state" style="font-size:12px">'+t('No reasons yet. Add your first one above.')+'</div></div>';
  } else {
    h += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    for (var ri=0;ri<w.reasons.length;ri++) {
      var r = w.reasons[ri];
      var icon = r.icon || '&#10084;';
      h += '<div class="card" style="padding:14px;text-align:center;border:1px solid var(--primary-light);position:relative">';
      h += '<div style="font-size:32px;margin-bottom:4px">' + icon + '</div>';
      h += '<div style="font-size:13px;line-height:1.5;font-weight:600">' + safe(r.text) + '</div>';
      h += '<button class="btn btn-sm btn-danger" onclick="deleteWhyReason('+ri+')" style="position:absolute;top:4px;right:4px;font-size:10px;padding:2px 6px;min-width:0;border-color:transparent">&#10005;</button>';
      h += '</div>';
    }
    h += '</div>';
  }

  // Preview during cravings note
  h += '<div class="card" style="border-left:3px solid var(--accent);background:var(--primary-light);padding:12px;margin-top:8px">';
  h += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:24px">&#128161;</span><div><div style="font-weight:700;font-size:13px">'+t('How this helps')+'</div><p style="font-size:12px;color:var(--muted);line-height:1.4;margin:2px 0 0">'+t('When you log a craving, Arthur will show your Why board to remind you what you\'re fighting for.')+'</p></div></div>';
  h += '</div>';

  return h;
}

// ====== PROFILE ======
function profileHTML() {
  var h = '<h2 class="page-title">Profile</h2>';
  h += '<div class="card" style="text-align:center;padding:24px">';
  h += '<div style="position:relative;display:inline-block">';
  if (D.avatar) {
    h += '<div style="width:72px;height:72px;border-radius:36px;overflow:hidden;margin:0 auto 8px;border:3px solid var(--primary-light)"><img src="' + D.avatar.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '" style="width:100%;height:100%;object-fit:cover" alt="Profile"></div>';
  } else {
    h += '<div style="width:72px;height:72px;border-radius:36px;background:linear-gradient(135deg,var(--primary),#34d399);display:flex;align-items:center;justify-content:center;margin:0 auto 8px;font-size:32px;font-weight:700;color:#fff">' + ((D.name||AUTH_USER||'Y')[0].toUpperCase()) + '</div>';
  }
  h += '<button class="btn btn-sm btn-outline" onclick="changeAvatar()" style="position:absolute;bottom:4px;right:-8px;width:28px;height:28px;border-radius:14px;padding:0;font-size:14px;line-height:1;min-width:0;background:var(--card);border:1px solid var(--border)">&#9998;</button></div>';
  h += '<div style="font-weight:700;font-size:18px">' + (D.name || 'You') + '</div>';
  h += '<div style="font-size:13px;color:var(--muted)">' + (AUTH_EMAIL || t('Local User')) + '</div>';
  if (AUTH_USER) {
    var cu = firebase && firebase.auth().currentUser;
    var verified = cu && cu.emailVerified;
    h += '<div style="font-size:11px;margin-top:2px;color:' + (verified ? 'var(--green,#22c55e)' : 'var(--danger)') + '">' + (verified ? '&#10003; ' + t('Email verified') : '&#9888; ' + t('Email not verified') + ' <span style="text-decoration:underline;cursor:pointer;color:var(--primary)" onclick="sendEmailVerification()">' + t('Verify now') + '</span>') + '</div>';
  }
  h += '<div style="font-size:12px;color:var(--muted);margin-top:4px">Joined ' + (D.joinDate ? new Date(D.joinDate).toLocaleDateString() : 'today') + '</div>';
  h += '<div style="font-size:12px;color:var(--muted)">Sober ' + soberDays() + ' days</div>';
  h += '<div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border)"><div style="font-size:32px">' + soberLevel().icon + '</div><div style="font-size:18px;font-weight:800;color:var(--primary)">Level ' + soberLevel().level + ': ' + soberLevel().title + '</div><div class="progress-bar" style="max-width:160px;margin:6px auto"><div class="fill" style="width:' + soberLevelProgress() + '%"></div></div><div style="font-size:11px;color:var(--muted)">' + soberLevel().desc + '</div>';
  h += '</div></div>';
  h += '<div class="card"><h3>'+t('Armoury')+'</h3>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">'+t('Title')+'</span><input type="text" value="'+(D.name||'')+'" onchange="D.name=this.value;registerCurrentUser();saveDataSilent()" style="width:auto;padding:6px 10px;font-size:13px;margin:0;max-width:180px"></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">\uD83C\uDFF0 Space</span><input type="text" value="'+(D.kingdomName||'')+'" onchange="D.kingdomName=this.value;saveDataSilent();render()" placeholder="My Space" style="width:auto;padding:6px 10px;font-size:13px;margin:0;max-width:180px"></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">\uD83D\uDC51 Title Style</span><select onchange="D.titleStyle=this.value;saveDataSilent();render()" style="width:auto;padding:6px 10px;font-size:13px;margin:0;max-width:180px"><option value="king"'+(D.titleStyle!=='queen'?' selected':'')+'>King / Prince</option><option value="queen"'+(D.titleStyle==='queen'?' selected':'')+'>Queen / Princess</option></select></div>';
h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">'+t('Messenger (optional)')+'</span><input type="tel" value="'+(D.phoneNumber||'')+'" onchange="D.phoneNumber=this.value;registerCurrentUser();saveDataSilent()" placeholder="+1 (555) 123-4567" style="width:auto;padding:6px 10px;font-size:13px;margin:0;max-width:180px"></div>';
h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">'+t('Tongue')+'</span><select onchange="D.language=this.value;registerCurrentUser();saveDataSilent();render()" style="width:auto;padding:6px 10px;font-size:13px;margin:0;max-width:180px">';
  for (var li=0;li<LANGUAGES.length;li++) h += '<option value="'+LANGUAGES[li]+'"'+(D.language===LANGUAGES[li]?' selected':'')+'>'+LANGUAGES[li]+'</option>';
  h += '</select></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">'+t('Heraldic Colours')+'</span><div style="display:flex;gap:4px">';
  var colorOpts = {green:'#34d399',blue:'#60a5fa',purple:'#a78bfa',pink:'#f472b6',orange:'#fb923c',red:'#f87171'};
  for (var co in colorOpts) {
    h += '<div style="width:28px;height:28px;border-radius:14px;background:'+colorOpts[co]+';cursor:pointer;border:'+(D.accentColor===co?'3px solid var(--text)':'2px solid transparent')+'" onclick="D.accentColor=\''+co+'\';saveDataSilent();applyTheme();render()"></div>';
  }
  h += '</div></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">'+t('Night Watch')+'</span><input type="checkbox" onchange="D.darkMode=this.checked;saveDataSilent();applyTheme()" '+(D.darkMode?'checked':'')+' style="width:auto"></div>';
  h += '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0"><span style="font-size:14px">&#128220; '+t('Parchment Mode')+'</span><input type="checkbox" onchange="D.parchmentMode=this.checked;saveDataSilent();applyTheme()" '+(D.parchmentMode?'checked':'')+' style="width:auto"></div>';
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3>'+t('Your Quests')+'</h3><p style="font-size:11px;color:var(--muted);margin-bottom:6px">'+t('Select what you are working on. Arthur creates safety plans based on these.')+'</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:4px">';
  var addictions = D.targetAddictions || [];
  for (var ati=0;ati<ADDICTION_TYPES.length;ati++) {
    var sel = addictions.indexOf(ADDICTION_TYPES[ati]) >= 0;
    h += '<button class="btn btn-sm ' + (sel ? 'btn-primary' : 'btn-outline') + '" onclick="toggleTargetAddiction(\''+ADDICTION_TYPES[ati]+'\')" style="font-size:10px;padding:6px">' + ADDICTION_TYPES[ati] + '</button>';
  }
  h += '</div></div>';
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3>'+t("The Scribe's Tome")+'</h3><div style="display:flex;align-items:center;justify-content:space-between;padding:6px 0"><span style="font-size:13px">'+t('Scroll length')+'</span><input type="number" value="' + (D.journalWordGoal || 50) + '" min="10" max="500" step="10" onchange="D.journalWordGoal=parseInt(this.value)||50;saveDataSilent()" style="width:80px;padding:6px 8px;font-size:13px;margin:0;text-align:center"></div></div>';
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3>'+t('The Vault')+'</h3><p style="font-size:11px;color:var(--muted);margin-bottom:6px">'+t('Set a passcode to lock the app when you switch tabs or step away. Your data stays on this device.')+'</p>';
  if (isLockSet()) {
    var bioReady = !!localStorage.getItem('rc_bio_cred');
    h += '<div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm btn-outline" onclick="var p=prompt(\''+t('Enter current passcode to change:')+'\');if(p&&p.trim()){checkPin(p.trim()).then(function(v){if(v){var np=prompt(\''+t('Enter new 4-6 digit passcode:')+'\');if(np&&np.trim().length>=4&&np.trim().length<=6){enableLock(np.trim());alert(\''+t('Passcode updated!')+'\');render()}else{alert(\''+t('Passcode must be 4-6 digits.')+'\')}}else{alert(\''+t('Incorrect current passcode.')+'\')}})})" style="font-size:11px">'+t('Forge New Key')+'</button>';
    h += '<button class="btn btn-sm btn-outline" onclick="if(localStorage.getItem(\'rc_bio_cred\')){unlockWithBiometric();}else{setupBiometric();}" style="font-size:11px">' + (bioReady ? '&#9989; '+t('Face ID') : '&#128065; '+t('Set Up Face ID')) + '</button>';
    h += '<button class="btn btn-sm btn-danger" onclick="if(confirm(\''+t('Disable passcode lock?')+'\')){disableLock();render()}" style="font-size:11px">'+t('Unbolt the Chest')+'</button></div>';
  } else {
    h += '<div style="display:flex;gap:6px"><input type="password" id="lock-pin-new" placeholder="'+t('4-6 digit passcode')+'" inputmode="numeric" maxlength="6" style="flex:1;padding:6px 10px;font-size:16px;text-align:center;letter-spacing:4px;font-weight:700"><button class="btn btn-sm btn-primary" onclick="var p=document.getElementById(\'lock-pin-new\');if(!p||!p.value.trim()||p.value.length<4||p.value.length>6){alert(\''+t('Passcode must be 4-6 digits.')+'\');return}enableLock(p.value.trim());alert(\''+t('Passcode enabled! The app will lock when you switch tabs or after 5 min of inactivity.')+'\');render()">'+t('Bolt the Chest')+'</button></div>';
  }
  h += '</div>';
  var notif = D.notifications || {morning:false,evening:false,morningTime:'08:00',eveningTime:'20:00',craving:false,journal:false,breathe:false,cravingTime:'14:00',journalTime:'12:00',breatheTime:'10:00',checkinReminder:false,checkinReminderTime:'18:00',buddyCheckin:false,streakMilestone:false};
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3 style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>'+t("The Herald's Call")+'</h3></div>';
  h += '<div style="background:var(--primary-light);border-radius:12px;padding:12px;margin:6px 0">';
  h += pushToggleRowHTML();
  h += notifRowHTML('morning', '🌅', 'Dawn', t('Set your intention'));
  h += notifRowHTML('evening', '🌙', 'Dusk', t('Reflect on your day'));
  h += notifRowHTML('craving', '&#x2694;', t('Craving Check-In'), t('Log & manage cravings'));
  h += notifRowHTML('journal', '&#x2712;', t('Journal Prompt'), t('Write about your day'));
  h += notifRowHTML('breathe', '&#x2726;', t('Breathing Exercise'), t('Take a mindful moment'));
  h += notifRowHTML('checkinReminder', '&#x2713;', 'Presence Reminder', t('Remind if you haven\'t checked in'));
  h += notifToggleHTML('buddyCheckin', '&#x2618;', 'Partner Reminder', t('Remind to send word to your partner'));
  h += notifToggleHTML('streakMilestone', '&#x265B;', 'Saga Milestones', t('Celebrate hitting milestones'));
  h += reminderNotifRowHTML();
  h += '</div>';
  // Encryption settings
  var enc = D.encryption || {};
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3 style="font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>'+t('The Sealed Tome')+'</h3></div>';
  h += '<div style="background:var(--primary-light);border-radius:12px;padding:12px;margin:6px 0;font-size:13px;line-height:1.5">';
  if (!enc.enabled) {
    h += '<p style="color:var(--muted);margin-bottom:8px">'+t('Encrypt your journal entries with a passphrase. Your data is encrypted before being saved.')+'</p>';
    h += '<input type="password" id="enc-setup-pass" placeholder="'+t('Create a passphrase (min 4 chars)')+'" style="font-size:16px;text-align:center;margin-bottom:6px;letter-spacing:2px">';
    h += '<input type="password" id="enc-setup-confirm" placeholder="'+t('Confirm passphrase')+'" style="font-size:16px;text-align:center;margin-bottom:8px;letter-spacing:2px">';
    h += '<button class="btn btn-sm btn-primary" onclick="var p=document.getElementById(\'enc-setup-pass\');var c=document.getElementById(\'enc-setup-confirm\');if(!p||!p.value.trim()||p.value.length<4){alert(\''+t('Passphrase must be at least 4 characters.')+'\');return}if(p.value!==c.value){alert(\''+t('Passphrases do not match.')+'\');return}this.disabled=true;setupEncryption(p.value).then(function(){p.value=\'\';c.value=\'\';render();alert(\''+t('Encryption enabled! All journal entries are now encrypted.')+'\');}).catch(function(){this.disabled=false})">'+t('Enable Encryption')+'</button>';
  } else {
    if (ENC_KEY) {
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="color:var(--primary);font-weight:600">&#128274; '+t('Encryption active')+'</span><span class="badge badge-green">'+t('Unlocked')+'</span></div>';
      h += '<p style="font-size:11px;color:var(--muted);margin-bottom:8px">'+t('Journal entries are encrypted with AES-256-GCM before saving.')+'</p>';
      h += '<div style="display:flex;gap:6px;flex-wrap:wrap">';
      h += '<button class="btn btn-sm btn-outline" onclick="var np=prompt(\''+t('Enter new passphrase (min 4 chars):')+'\');if(!np||np.length<4){alert(\''+t('Passphrase must be at least 4 characters.')+'\');return}var cp=prompt(\''+t('Confirm new passphrase:')+'\');if(np!==cp){alert(\''+t('Passphrases do not match.')+'\');return}changeEncryptionPassphrase(\'\',np).then(function(){alert(\''+t('Passphrase changed!')+'\');}).catch(function(){alert(\''+t('Failed to change passphrase.')+'\')})">'+t('Change Passphrase')+'</button>';
      h += '<button class="btn btn-sm btn-danger" onclick="if(!confirm(\''+t('This will decrypt all journal entries. Are you sure?')+'\'))return;disableEncryption().then(function(){render();alert(\''+t('Encryption disabled. All entries have been decrypted.')+'\');}).catch(function(e){ console.warn(e) })">'+t('Disable Encryption')+'</button>';
      h += '</div>';
    } else {
      h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:10px"><span style="color:var(--primary);font-weight:600">&#128274; '+t('Encryption active')+'</span><span class="badge badge-gold">'+t('Locked')+'</span></div>';
      h += '<p style="font-size:11px;color:var(--muted);margin-bottom:8px">'+t('Enter your passphrase to unlock and access your journal entries.')+'</p>';
      h += '<button class="btn btn-sm btn-primary" onclick="promptEncryptionPassphrase(function(){render()})">'+t('Unlock Now')+'</button>';
    }
  }
  h += '</div>';
  h += '<div style="border-top:1px solid var(--border);margin:8px 0 4px;padding-top:8px"><h3>'+t('Cloud Sync')+'</h3>';
  h += '<p style="font-size:11px;color:var(--muted);margin-bottom:6px">'+t('Your data syncs automatically to the cloud when you\'re signed in.')+'</p>';
  h += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><span style="font-size:12px;color:var(--muted)">'+t('Last sync')+':</span><span id="sync-time-display" style="font-size:12px;font-weight:600">'+(_lastSyncTime||t('Never'))+'</span></div>';
  h += '<button class="btn btn-sm btn-primary" onclick="syncToFirestore()" style="margin-bottom:6px">'+t('Sync Now')+'</button></div>';
  h += '<button class="btn btn-primary btn-sm" onclick="showProgressReport()" style="margin-top:8px">&#128202; '+t('Progress Report')+'</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="exportData()" style="margin-top:6px">'+t('Export My Data')+'</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="exportJournalText()" style="margin-top:6px">'+t('Journal')+'</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="importData()" style="margin-top:6px">'+t('Import Data')+'</button>';
  if (AUTH_USER) h += '<button class="btn btn-danger btn-sm" onclick="signOut()" style="margin-top:6px">'+t('Sign Out')+'</button>';
  if (AUTH_USER && firebase && firebase.auth().currentUser) h += '<button class="btn btn-danger btn-sm" onclick="deleteAccount()" style="margin-top:6px">Delete Account</button>';
  h += '</div>';
  h += emergencyContactsSettingsHTML();
  h += '<div class="card" style="border-left:3px solid #8a7a6a"><h3>'+t('Help Improve Re.Claim')+'</h3><p style="font-size:12px;color:var(--muted);line-height:1.5;margin-bottom:8px">'+t('Optionally share anonymous usage data to help us understand recovery patterns and improve the app. No personal information, journal text, or identifying data is ever collected.')+'</p><div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--primary-light);border-radius:10px"><div style="flex:1"><div style="font-weight:600;font-size:13px">'+t('Share anonymous data')+'</div><div style="font-size:11px;color:var(--muted)">'+t('Anonymized mood trends, streak lengths, tool usage counts')+'</div></div><input type="checkbox" onchange="D.researchOptIn=this.checked;saveData();if(this.checked)collectResearchData()" '+(D.researchOptIn?'checked':'')+' style="width:auto;transform:scale(1.2)"></div></div>';
  h += '<div class="card" style="border-left:3px solid #f59e0b"><h3>'+t('Privacy & Security')+'</h3><p style="font-size:12px;color:var(--muted);line-height:1.6">'+t('All your journal entries, moods, habits, cravings, goals, and pledges are stored only on this device (localStorage). Nothing is sent to any server. Your password is hashed with SHA-256 and a random salt. Partner features (pairing, messaging) sync through Firebase Firestore with encrypted transmission.')+'</p></div>';
  return h;
}

function changeAvatar() {
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      var img = new Image();
      img.onload = function() {
        var maxDim = 400;
        var w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) { if (w > h) { h = h / w * maxDim; w = maxDim; } else { w = w / h * maxDim; h = maxDim; } }
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        var ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0, w, h);
        D.avatar = c.toDataURL('image/jpeg', 0.7);
        saveData();
        render();
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };
  input.click();
}
function exportData() {
  var exportObj = {
    _exportedAt: new Date().toISOString(),
    _exportVersion: 2,
    _dataVersion: D.version || 1,
    _stats: {
      journalEntries: (D.journal||[]).length,
      moodsLogged: (D.moods||[]).length,
      cravingsLogged: (D.cravings||[]).length,
      soberDays: D.sobriety && D.sobriety.startDate ? Math.floor((Date.now() - D.sobriety.startDate) / 86400000) : 0,
      checkinsCount: (D.checkins||[]).length,
      copingCardsCount: (D.copingCards||[]).length + (D.customCopingCards||[]).length,
      habitsTracked: (D.habits||[]).length
    },
    data: D
  };
  var blob = new Blob([JSON.stringify(exportObj, null, 2)], {type:'application/json'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reclaim-data-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
}

function importData() {
  if (!confirm(t('This will overwrite all current data. Are you sure?'))) return;
  var input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    var file = e.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(ev) {
      try {
        var parsed = JSON.parse(ev.target.result);
        var data;
        // Handle wrapped export format (v2+)
        if (parsed && parsed._exportVersion && parsed.data) {
          data = parsed.data;
        } else if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          data = parsed;
        } else {
          alert(t('Invalid file format.')); return;
        }
        data = validateData(data);
        for (var k in data) D[k] = data[k];
        saveData();
        alert(t('Data imported successfully!'));
      } catch(err) { alert(t('Invalid file format.')); }
    };
    reader.readAsText(file);
  };
  input.click();
}

function exportJournalText() {
  var entries = D.journal || [];
  if (!entries.length) { alert('No journal entries to export.'); return; }
  var text = entries.map(function(e,i){ return '--- Entry ' + (i+1) + ' ---\nDate: ' + (e.date || '') + '\nMood: ' + (e.mood || '') + '\n' + (e.text || '') + '\n'; }).join('\n');
  var blob = new Blob([text], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reclaim-journal-' + new Date().toISOString().split('T')[0] + '.txt';
  a.click();
}

// ====== PROGRESS REPORT ======
function showProgressReport() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var today = new Date();
  var soberStart = D.sobriety && D.sobriety.startDate ? new Date(D.sobriety.startDate) : null;
  var soberDays = soberStart ? Math.floor((Date.now() - soberStart.getTime()) / 86400000) : 0;
  var moodAvg = (D.moods||[]).length ? Math.round((D.moods||[]).reduce(function(s,m){return s+m.mood},0) / (D.moods||[]).length * 10) / 10 : 'N/A';
  var journalCount = (D.journal||[]).length;
  var cravingCount = (D.cravings||[]).length;
  var checkinCount = (D.checkins||[]).length;
  var streakDays = D.streak || 0;
  var phq = D.screenerPHQ9 && D.screenerPHQ9.result ? D.screenerPHQ9.result : null;
  var gad = D.screenerGAD7 && D.screenerGAD7.result ? D.screenerGAD7.result : null;
  var phqHistory = (D.screenerPHQ9 && D.screenerPHQ9._history) || [];
  var gadHistory = (D.screenerGAD7 && D.screenerGAD7._history) || [];

  function severityLabelPHQ(s) {
    if (s <= 4) return {label:'Minimal', color:'var(--primary)'};
    if (s <= 9) return {label:'Mild', color:'#ca8a04'};
    if (s <= 14) return {label:'Moderate', color:'#ea580c'};
    if (s <= 19) return {label:'Moderately Severe', color:'#dc2626'};
    return {label:'Severe', color:'#991b1b'};
  }
  function severityLabelGAD(s) {
    if (s <= 4) return {label:'Minimal', color:'var(--primary)'};
    if (s <= 9) return {label:'Mild', color:'#ca8a04'};
    if (s <= 14) return {label:'Moderate', color:'#ea580c'};
    return {label:'Severe', color:'#dc2626'};
  }

  var h = '<div class="overlay-content" style="max-width:500px"><div style="text-align:center;margin-bottom:8px"><div style="font-size:32px;margin-bottom:4px">&#128202;</div><h3 style="font-size:20px;font-weight:700">'+t('Your Progress Report')+'</h3><p style="font-size:12px;color:var(--muted)">Generated ' + today.toLocaleDateString() + '</p></div>';

  // Sobriety streak
  h += '<div class="card" style="border-left:4px solid var(--primary);padding:12px;margin-bottom:8px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#128200; '+t('Recovery Overview')+'</div><div style="font-size:12px;line-height:1.8">';
  h += '<div><span style="color:var(--muted)">'+t('Sober streak')+':</span> <strong>' + soberDays + ' '+t('days')+'</strong></div>';
  h += '<div><span style="color:var(--muted)">'+t('Journal entries')+':</span> <strong>' + journalCount + '</strong></div>';
  h += '<div><span style="color:var(--muted)">'+t('Moods logged')+':</span> <strong>' + (D.moods||[]).length + '</strong> ('+(moodAvg!=='N/A'?t('avg ')+moodAvg+'/5':'N/A')+')</div>';
  h += '<div><span style="color:var(--muted)">'+t('Cravings logged')+':</span> <strong>' + cravingCount + '</strong></div>';
  h += '<div><span style="color:var(--muted)">'+t('Daily check-ins')+':</span> <strong>' + checkinCount + '</strong></div>';
  h += '<div><span style="color:var(--muted)">'+t('Current streak')+':</span> <strong>' + streakDays + ' '+t('days')+'</strong></div>';
  h += '</div></div>';

  // PHQ-9
  h += '<div class="card" style="padding:12px;margin-bottom:6px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#128555; PHQ-9 '+t('Depression Screening')+'</div>';
  if (phq) {
    var sev = severityLabelPHQ(phq.total);
    h += '<div style="font-size:13px"><span style="color:var(--muted)">'+t('Latest')+':</span> <strong style="color:'+sev.color+'">'+phq.total+'/27 ('+sev.label+')</strong> <span style="font-size:11px;color:var(--muted)">'+new Date(phq.date).toLocaleDateString()+'</span></div>';
    // Trend
    var allPHQ = phqHistory.concat([{total:phq.total,date:phq.date}]);
    if (allPHQ.length >= 2) {
      var first = allPHQ[0].total, lastPHQ = allPHQ[allPHQ.length-1].total;
      var dir = lastPHQ < first ? '&#8595; '+t('improving') : lastPHQ > first ? '&#8593; '+t('worsening') : '&#8594; '+t('stable');
      var change = Math.abs(lastPHQ - first);
      h += '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+t('Trend over')+' '+allPHQ.length+' '+t('sessions')+': '+dir+' ('+change+' '+t('point change')+')</div>';
    }
    if (allPHQ.length > 1) {
      h += '<div style="font-size:11px;color:var(--muted);margin-top:4px">'+t('History')+': ';
      for (var pi=0;pi<allPHQ.length;pi++) {
        h += '<span style="margin-right:4px">'+allPHQ[pi].total+'/'+27+' <span style="font-size:9px">'+new Date(allPHQ[pi].date).toLocaleDateString()+'</span></span>';
      }
      h += '</div>';
    }
  } else {
    h += '<p style="font-size:12px;color:var(--muted);font-style:italic">'+t('Take the PHQ-9 screening to see results here.')+'</p>';
  }
  h += '</div>';

  // GAD-7
  h += '<div class="card" style="padding:12px;margin-bottom:6px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#128534; GAD-7 '+t('Anxiety Screening')+'</div>';
  if (gad) {
    var sev2 = severityLabelGAD(gad.total);
    h += '<div style="font-size:13px"><span style="color:var(--muted)">'+t('Latest')+':</span> <strong style="color:'+sev2.color+'">'+gad.total+'/21 ('+sev2.label+')</strong> <span style="font-size:11px;color:var(--muted)">'+new Date(gad.date).toLocaleDateString()+'</span></div>';
    var allGAD = gadHistory.concat([{total:gad.total,date:gad.date}]);
    if (allGAD.length >= 2) {
      var firstG = allGAD[0].total, lastG = allGAD[allGAD.length-1].total;
      var dirG = lastG < firstG ? '&#8595; '+t('improving') : lastG > firstG ? '&#8593; '+t('worsening') : '&#8594; '+t('stable');
      var changeG = Math.abs(lastG - firstG);
      h += '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+t('Trend over')+' '+allGAD.length+' '+t('sessions')+': '+dirG+' ('+changeG+' '+t('point change')+')</div>';
    }
    if (allGAD.length > 1) {
      h += '<div style="font-size:11px;color:var(--muted);margin-top:4px">'+t('History')+': ';
      for (var gi=0;gi<allGAD.length;gi++) {
        h += '<span style="margin-right:4px">'+allGAD[gi].total+'/'+21+' <span style="font-size:9px">'+new Date(allGAD[gi].date).toLocaleDateString()+'</span></span>';
      }
      h += '</div>';
    }
  } else {
    h += '<p style="font-size:12px;color:var(--muted);font-style:italic">'+t('Take the GAD-7 screening to see results here.')+'</p>';
  }
  h += '</div>';

  // Recent achievements
  if ((D.achievements||[]).length) {
    h += '<div class="card" style="padding:12px;margin-bottom:6px"><div style="font-weight:700;font-size:14px;margin-bottom:4px">&#127942; '+t('Achievements')+'</div><div style="font-size:12px">';
    var recentAch = (D.achievements||[]).slice(-5);
    for (var ai=0;ai<recentAch.length;ai++) {
      h += '<div style="padding:3px 0">&#10003; '+recentAch[ai].name+'</div>';
    }
    h += '</div></div>';
  }

  // Share/export
  h += '<div style="display:flex;gap:6px;margin-top:4px">';
  h += '<button class="btn btn-primary btn-sm" onclick="exportProgressReport()" style="flex:1">'+t('Share or Save')+'</button>';
  h += '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="flex:1">'+t('Close')+'</button>';
  h += '</div></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function exportProgressReport() {
  var lines = [];
  lines.push('=== RE.CLAIM PROGRESS REPORT ===');
  lines.push('Generated: ' + new Date().toLocaleString());
  lines.push('');
  lines.push('--- Recovery Overview ---');
  var soberStart = D.sobriety && D.sobriety.startDate ? new Date(D.sobriety.startDate) : null;
  lines.push('Sober streak: ' + (soberStart ? Math.floor((Date.now() - soberStart.getTime()) / 86400000) + ' days' : 'Not started'));
  lines.push('Journal entries: ' + (D.journal||[]).length);
  lines.push('Moods logged: ' + (D.moods||[]).length);
  lines.push('Cravings logged: ' + (D.cravings||[]).length);
  lines.push('Daily check-ins: ' + (D.checkins||[]).length);
  lines.push('Current streak: ' + (D.streak||0) + ' days');

  var phq = D.screenerPHQ9 && D.screenerPHQ9.result ? D.screenerPHQ9.result : null;
  var gad = D.screenerGAD7 && D.screenerGAD7.result ? D.screenerGAD7.result : null;
  if (phq) {
    lines.push('');
    lines.push('--- PHQ-9 Depression Screening ---');
    lines.push('Latest score: ' + phq.total + '/27 on ' + new Date(phq.date).toLocaleDateString());
    var hist = (D.screenerPHQ9 && D.screenerPHQ9._history) || [];
    if (hist.length) {
      lines.push('History:');
      for (var hpi=0;hpi<hist.length;hpi++) lines.push('  ' + hist[hpi].total + '/27 on ' + new Date(hist[hpi].date).toLocaleDateString());
    }
  }
  if (gad) {
    lines.push('');
    lines.push('--- GAD-7 Anxiety Screening ---');
    lines.push('Latest score: ' + gad.total + '/21 on ' + new Date(gad.date).toLocaleDateString());
    var histG = (D.screenerGAD7 && D.screenerGAD7._history) || [];
    if (histG.length) {
      lines.push('History:');
      for (var hgi=0;hgi<histG.length;hgi++) lines.push('  ' + histG[hgi].total + '/21 on ' + new Date(histG[hgi].date).toLocaleDateString());
    }
  }
  lines.push('');
  lines.push('=== END REPORT ===');
  var blob = new Blob([lines.join('\n')], {type:'text/plain'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'reclaim-progress-' + new Date().toISOString().split('T')[0] + '.txt';
  a.click();
}

function deleteAccount() {
  if (!confirm('Delete your account and all data? This cannot be undone.')) return;
  if (!confirm('Are you absolutely sure? All Firestore data, local data, and your account will be permanently removed.')) return;
  if (!firebase || !firebase.auth().currentUser) { clearLocalData(); return; }
  var uid = AUTH_EMAIL;
  var batch = DB.batch();
  batch.delete(DB.collection('appData').doc(uid));
  batch.delete(DB.collection('users').doc(uid));
  batch.delete(DB.collection('pairingCodes').doc(uid));
  batch.delete(DB.collection('pushSubscriptions').doc(uid));
  batch.commit().catch(function(e){ console.warn(e); }).then(function(){
    firebase.auth().currentUser.delete().catch(function(e){ console.warn(e); }).then(function(){
      clearLocalData();
    });
  });
}

function clearLocalData() {
  localStorage.removeItem('rc_user');
  localStorage.removeItem('rc_email');
  localStorage.removeItem('rc_lock_hash');
  localStorage.removeItem('rc_lock_salt');
  localStorage.removeItem('rc_bio_cred');
  localStorage.removeItem(dataKey());
  AUTH_USER = '';
  AUTH_EMAIL = '';
  D = defaultData();
  location.reload();
}

function showShareQR() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:380px;text-align:center;padding:24px">' +
    '<div style="font-size:14px;font-weight:700;margin-bottom:4px">Share Re.Claim</div>' +
    '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">Scan to open the app on your device</p>' +
    '<img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://reclaim00.github.io/reclaim-buddy/" alt="QR Code" style="width:240px;height:240px;border-radius:12px;margin:0 auto;display:block">' +
    '<p style="font-size:11px;color:var(--muted);margin-top:10px">reclaim00.github.io/reclaim-buddy</p>' +
    '<button class="btn btn-primary" onclick="this.closest(\'.overlay\').remove()" style="margin-top:12px">'+t('Close')+'</button>' +
    '</div>';
  document.body.appendChild(overlay);
}

// ====== CRAVING / TRIGGER LOG ======
function logCraving() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var h = '<div class="overlay-content" style="max-width:420px"><div style="text-align:center;margin-bottom:12px"><div style="font-size:40px;margin-bottom:4px">&#128293;</div><h3 style="font-size:18px;font-weight:700;margin:0">'+t('Log a Craving')+'</h3><p style="font-size:12px;color:var(--muted);margin-top:2px">'+t('Track when cravings hit so Arthur can spot patterns.')+'</p></div>';
  h += '<div style="font-size:13px;font-weight:600;margin-bottom:4px">'+t('Intensity (1-10):')+' <span id="craving-val" style="color:var(--primary)">5</span></div>';
  h += '<input type="range" min="1" max="10" value="5" oninput="document.getElementById(\'craving-val\').textContent=this.value" style="width:100%;margin-bottom:10px">';
  h += '<input type="text" id="craving-trigger" placeholder="'+t('What triggered it? (e.g. stress, boredom, social pressure)')+'" style="margin-bottom:8px">';
  h += '<button class="btn btn-primary" onclick="saveCraving(this)">'+t('Log Craving')+'</button>';
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function saveCraving(btn) {
  var val = parseInt(document.getElementById('craving-val').textContent);
  var trigger = document.getElementById('craving-trigger').value.trim();
  if (!D.cravings) D.cravings = [];
  D.cravings.push({ intensity: val, trigger: trigger, date: new Date().toDateString(), time: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'), timestamp: Date.now() });
  saveData();
  btn.closest('.overlay').remove();
  showCravingPatterns();
  showWhyReminder();
}
function showWhyReminder() {
  var reasons = D.myWhy && D.myWhy.reasons;
  if (!reasons || !reasons.length) return;
  var pick = reasons[Math.floor(Math.random() * reasons.length)];
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.7)';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:380px;text-align:center;animation:scaleIn .3s;padding:28px 20px">' +
    '<div style="font-size:40px;margin-bottom:6px">&#10084;</div>' +
    '<div style="font-size:14px;color:var(--muted);margin-bottom:2px;letter-spacing:1px">' + t('Remember why you started') + '</div>' +
    '<div style="font-size:22px;margin:10px 0;line-height:1.4">' + pick.icon + '</div>' +
    '<div style="font-size:16px;font-weight:700;line-height:1.5;margin-bottom:12px">"' + safe(pick.text) + '"</div>' +
    '<div style="display:flex;gap:6px">' +
    '<button class="btn btn-primary btn-sm" onclick="this.closest(\'.overlay\').remove();showCravingBreaker()" style="flex:1">' + t('Fight It') + '</button>' +
    '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="flex:1">' + t("I'm okay") + '</button></div></div>';
  document.body.appendChild(overlay);
}

var _cravingBreakerState = { timer: null, seconds: 0, step: 0, trigger: '' };
var _CRAVING_DISTRACT = [
  'Splash cold water on your face until the urge passes',
  'Count backward from 100 by 7 out loud',
  'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste',
  'Drink a full glass of water as slowly as you can',
  'Do 15 jumping jacks or stretch for 2 minutes',
  'Hold an ice cube in your hand and focus on the sensation',
  'Write down three things you are grateful for right now',
  'Step outside and take 10 slow, deep breaths',
  'Text someone you trust and say "thinking of you"',
  'Put on a song and listen without doing anything else',
  'Recite your commitment to yourself out loud like a vow',
  'Make a hot drink and focus only on the warmth and taste'
];
function showCravingBreaker() {
  _cravingBreakerState = { timer: null, seconds: 300, step: 0, trigger: '' };
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.id = 'craving-breaker-ov';
  ov.style.background = 'rgba(0,0,0,.7)';
  function render() {
    var s = _cravingBreakerState;
    if (s.step === 0) {
      ov.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center;animation:siFade .3s ease;padding:28px 24px">' +
        '<div style="font-size:42px;margin-bottom:6px;font-family:Georgia,serif">\u2694</div>' +
        '<div style="font-size:18px;font-weight:700;color:var(--primary);margin-bottom:4px;font-family:Georgia,serif">A Craving Arrives</div>' +
        '<div style="font-size:12px;color:var(--muted);margin-bottom:12px;line-height:1.5">Cravings last 15\u201330 minutes.<br>You have survived every one so far.</div>' +
        '<div style="font-size:12px;font-weight:600;color:var(--text);margin-bottom:6px">What triggered this?</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:10px">' +
          ['Stress','Boredom','Anger','Sadness','Social','Habit','Pain','Other'].map(function(t){
            return '<button class="btn btn-sm btn-outline" onclick="document.getElementById(\'craving-breaker-btn\').textContent=\'\\u2694 Fight It\';_cravingBreakerState.trigger=\'' + t + '\';this.style.background=\'var(--primary)\';this.style.color=\'#fff\';this.style.borderColor=\'var(--primary)\'" style="font-size:11px;padding:5px;transition:.15s">' + t + '</button>';
          }).join('') +
        '</div>' +
        '<button id="craving-breaker-btn" class="btn btn-primary" onclick="cravingBreakerStart()" style="width:100%;padding:12px;font-size:14px;font-weight:700">\u2694 Fight It</button>' +
        '<button class="btn btn-outline btn-sm" onclick="document.getElementById(\'craving-breaker-ov\').remove();logCraving()" style="width:100%;margin-top:6px;font-size:11px">\u2712 Just log it instead</button></div>';
    } else if (s.step === 1) {
      var m = Math.floor(s.seconds / 60), sec = s.seconds % 60;
      var pick = _CRAVING_DISTRACT[Math.floor(Math.random() * _CRAVING_DISTRACT.length)];
      ov.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center;animation:siFade .3s ease;padding:24px">' +
        '<div style="font-size:11px;color:var(--primary);font-family:Georgia,serif;letter-spacing:1px;margin-bottom:2px">\u269C The Craving Breaker \u269C</div>' +
        '<div style="font-size:46px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:2px;color:var(--primary);margin:6px 0 2px;font-family:monospace">' + String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0') + '</div>' +
        '<div style="font-size:10px;color:var(--muted);margin-bottom:8px">Cravings peak at 5 minutes. Can you wait it out?</div>' +
        '<div class="card" style="padding:10px;margin-bottom:8px;text-align:left;border-left:3px solid var(--accent)">' +
        '<div style="font-size:10px;font-weight:600;color:var(--accent);margin-bottom:3px;letter-spacing:.5px">\u2726 DISTRACTION</div>' +
        '<div style="font-size:12px;color:var(--text-light);line-height:1.5">' + pick + '</div></div>' +
        '<div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:center">' +
        '<button class="btn btn-sm btn-primary" onclick="startBreathe()" style="font-size:10px;padding:5px 10px">\u2767 Breathe</button>' +
        '<button class="btn btn-sm btn-outline" onclick="showRelapseRescue()" style="font-size:10px;padding:5px 10px;border-color:var(--danger);color:var(--danger)">\u2628 SOS</button>' +
        '<button class="btn btn-sm btn-primary" onclick="cravingBreakerWin()" style="font-size:10px;padding:5px 10px;background:var(--accent)">\u269C I Made It!</button></div></div>';
    }
  }
  window.cravingBreakerStart = function() {
    _cravingBreakerState.step = 1;
    _cravingBreakerState.seconds = 300;
    render();
    if (_cravingBreakerState.timer) clearInterval(_cravingBreakerState.timer);
    _cravingBreakerState.timer = setInterval(function(){
      _cravingBreakerState.seconds--;
      if (_cravingBreakerState.seconds <= 0) { clearInterval(_cravingBreakerState.timer); _cravingBreakerState.timer = null; cravingBreakerWin(); }
      else render();
    }, 1000);
  };
  window.cravingBreakerWin = function() {
    if (_cravingBreakerState.timer) { clearInterval(_cravingBreakerState.timer); _cravingBreakerState.timer = null; }
    if (!D.cravings) D.cravings = [];
    D.cravings.push({ intensity: Math.round(Math.random() * 3 + 3), trigger: _cravingBreakerState.trigger || 'survived', date: new Date().toDateString(), time: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'), timestamp: Date.now(), survived: true });
    earnSchillings(10 + Math.floor(Math.random() * 5), 'Craving defeated');
    saveData();
    ov.innerHTML = '<div class="overlay-content" style="max-width:400px;text-align:center;animation:siFade .3s ease;padding:28px 24px">' +
      '<div style="font-size:48px;margin-bottom:4px;font-family:Georgia,serif">\u269C</div>' +
      '<div style="font-size:20px;font-weight:700;color:var(--primary);margin-bottom:4px;font-family:Georgia,serif">Craving Defeated</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-bottom:10px;line-height:1.5">You faced the urge and held the line.<br>Each victory makes the next one easier.</div>' +
      '<div class="card" style="padding:8px;margin-bottom:10px;background:var(--primary-light);border:none">' +
      '<div style="font-size:10px;font-weight:600;color:var(--accent);margin-bottom:4px">\u2726 What helped?</div>' +
      '<div style="display:grid;grid-template-columns:1fr 1fr;gap:3px">' +
        ['Breathing','Distraction','Walk','Water','Counting','Music','Writing','Talked'].map(function(h){
          return '<button class="btn btn-sm btn-outline" onclick="this.style.background=\'var(--primary)\';this.style.color=\'#fff\';this.style.borderColor=\'var(--primary)\';this.textContent=\'\\u2713 \' + this.textContent" style="font-size:9px;padding:3px">' + h + '</button>';
        }).join('') +
      '</div></div>' +
      '<button class="btn btn-primary btn-sm" onclick="var e=document.getElementById(\'craving-breaker-ov\');if(e){e.remove()};showSchillingNotification();render()" style="width:100%;font-size:12px">\u269C Continue</button></div>';
  };
  render();
  var existing = document.getElementById('craving-breaker-ov');
  if (existing) existing.remove();
  document.body.appendChild(ov);
}

function showCravingPatterns() {
  if (!D.cravings || !D.cravings.length) return;
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var c = D.cravings;
  var avgIntensity = Math.round(c.reduce(function(s,cr){return s+cr.intensity},0)/c.length);
  var timeSlots = {morning:0, afternoon:0, evening:0, night:0};
  var triggerCounts = {};
  c.forEach(function(cr){
    var h = parseInt(cr.time.split(':')[0]);
    if (h<12) timeSlots.morning++; else if (h<17) timeSlots.afternoon++; else if (h<21) timeSlots.evening++; else timeSlots.night++;
    if (cr.trigger) {
      var words = cr.trigger.toLowerCase().split(/[\s,]+/);
      words.forEach(function(w){ if (w.length>3) { triggerCounts[w] = (triggerCounts[w]||0)+1; } });
    }
  });
  var topTriggers = Object.keys(triggerCounts).sort(function(a,b){return triggerCounts[b]-triggerCounts[a]}).slice(0,5);
  var peakTime = Object.keys(timeSlots).reduce(function(a,b){return timeSlots[a]>timeSlots[b]?a:b});
  var h = '<div class="overlay-content" style="max-width:420px"><div style="text-align:center;margin-bottom:12px"><div style="font-size:36px;margin-bottom:4px">&#128202;</div><h3 style="font-size:18px;font-weight:700;margin:0">'+t('Craving Patterns')+'</h3><p style="font-size:12px;color:var(--muted);margin-top:2px">'+t('Based on')+' ' + c.length + ' '+t('logged cravings')+'</p></div><div class="stat-grid" style="margin-bottom:8px"><div class="stat-card"><div class="num">' + avgIntensity + '</div><div class="label">'+t('Avg Intensity')+'</div></div><div class="stat-card"><div class="num" style="text-transform:capitalize">' + peakTime + '</div><div class="label">'+t('Peak Time')+'</div></div><div class="stat-card"><div class="num">' + c.length + '</div><div class="label">'+t('Total Logged')+'</div></div></div>';
  if (topTriggers.length) h += '<div class="card" style="padding:10px"><h3>'+t('Common Triggers')+'</h3><div style="font-size:13px">' + topTriggers.map(function(t){return '&bull; ' + t}).join('<br>') + '</div></div>';
  h += '<button class="btn btn-outline btn-sm" onclick="logCraving()" style="margin-right:4px">+ '+t('Log Another')+'</button><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function cravingCardHTML() {
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:20px">&#128293;</div><h3 style="margin:0">'+t('Craving Log')+'</h3></div>';
  if (!D.cravings || !D.cravings.length) {
    h += '<div class="empty-state">'+t('Log your first craving to start seeing patterns. Arthur will analyze your triggers over time.')+'</div>';
  } else {
    h += '<p style="font-size:12px;color:var(--muted);margin-bottom:6px">' + D.cravings.length + ' '+t('cravings logged')+'</p>';
    h += '<input type="text" id="cs" placeholder="'+t('Search cravings...')+'" oninput="filterCravings(this.value)" style="margin-bottom:8px;width:100%;padding:8px 12px;border:1px solid var(--border);border-radius:8px;font-size:13px;box-sizing:border-box">';
    var cravings = D.cravings.slice().reverse();
    for (var i=0;i<cravings.length;i++) {
      var cr = cravings[i];
      var survived = cr.survived ? ' <span style="color:#22c55e">&#10003;</span>' : '';
      h += '<div class="craving-entry" style="padding:6px 0;border-bottom:1px solid var(--border);font-size:12px">';
      h += '<span style="font-weight:600">' + cr.date + ' at ' + cr.time + '</span> &mdash; '+t('intensity')+' ' + cr.intensity + '/10' + (cr.trigger ? ' (' + cr.trigger + ')' : '') + survived;
      h += '</div>';
    }
    h += '<button class="btn btn-sm btn-primary" onclick="logCraving()" style="margin-top:6px">'+t('Log Craving')+'</button>';
    h += '<button class="btn btn-sm btn-outline" onclick="showCravingPatterns()" style="margin-left:4px;margin-top:6px">'+t('View Patterns')+'</button>';
  }
  h += '</div>';
  return h;
}

function filterCravings(val) {
  var q = val.toLowerCase();
  var items = document.querySelectorAll('.craving-entry');
  for (var i=0;i<items.length;i++) {
    items[i].style.display = !q || items[i].textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
  }
}

// ====== MONTHLY CHALLENGE ======
var ADDICTION_CHALLENGES = {
  'Alcohol': [
    {month:0, title:'Log 15 sober days', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal every craving', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace drinking  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal your triggers', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days alcohol-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days this month', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 coping habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End sober  20 sober days', icon:'🎯', target:'sober', count:20}
  ],
  'Drugs (prescription/illicit)': [
    {month:0, title:'15 clean days', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal when urges hit', icon:'💭', target:'journal', count:20},
    {month:2, title:'Build routine  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal your progress', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days substance-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 healthy habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End clean  20 clean days', icon:'🎯', target:'sober', count:20}
  ],
  'Pornography': [
    {month:0, title:'15 days clean', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal when triggered', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace urge  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Reflect on triggers', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days porn-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Build 25 healthy habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End clean  20 clean days', icon:'🎯', target:'sober', count:20}
  ],
  'Gambling': [
    {month:0, title:'15 days gamble-free', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal every urge', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace gambling  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal money saved', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days gamble-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End gamble-free  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Smoking/Nicotine': [
    {month:0, title:'15 days smoke-free', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal each craving', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace smoking  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal your triggers', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days nicotine-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End smoke-free  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Caffeine': [
    {month:0, title:'Cut caffeine  15 days', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal energy levels', icon:'📝', target:'journal', count:20},
    {month:2, title:'Replace coffee  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Track sleep quality', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days caffeine-free', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End caffeine-free  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Sex/Love': [
    {month:0, title:'15 days of boundaries', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal when triggered', icon:'💭', target:'journal', count:20},
    {month:2, title:'Build 20 healthy habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Reflect on patterns', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days of recovery', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End strong  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Shopping': [
    {month:0, title:'15 no-spend days', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal every urge', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace shopping  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal money saved', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 no-spend days', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End no-spend  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Social Media': [
    {month:0, title:'15 days of limits', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal screen time', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace scrolling  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal offline activities', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days of limits', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End with limits  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Gaming': [
    {month:0, title:'15 days of limits', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal gaming urges', icon:'💭', target:'journal', count:20},
    {month:2, title:'Replace gaming  20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal offline hobbies', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days of limits', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End with limits  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Eating/Food': [
    {month:0, title:'15 days of balance', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal food feelings', icon:'💭', target:'journal', count:20},
    {month:2, title:'Build 20 healthy habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal your wins', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days of balance', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End balanced  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Self-Harm': [
    {month:0, title:'15 days of safety', icon:'📝', target:'sober', count:15},
    {month:1, title:'Journal every feeling', icon:'💭', target:'journal', count:20},
    {month:2, title:'Build 20 coping habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Reflect on growth', icon:'✨', target:'journal', count:18},
    {month:5, title:'30 days of safety', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End safe  20 days', icon:'🎯', target:'sober', count:20}
  ],
  'Other': [
    {month:0, title:'Journal 15 days', icon:'📝', target:'journal', count:15},
    {month:1, title:'Log mood every day', icon:'💭', target:'mood', count:28},
    {month:2, title:'Complete 20 habits', icon:'✅', target:'habit', count:20},
    {month:3, title:'Check in 20 days', icon:'📅', target:'checkin', count:20},
    {month:4, title:'Journal 15 days', icon:'✨', target:'journal', count:15},
    {month:5, title:'Stay sober all month', icon:'🌿', target:'sober', count:30},
    {month:6, title:'Journal 20 days', icon:'📝', target:'journal', count:20},
    {month:7, title:'Log 25 moods', icon:'💭', target:'mood', count:25},
    {month:8, title:'Complete 25 habits', icon:'✅', target:'habit', count:25},
    {month:9, title:'Check in 25 days', icon:'📅', target:'checkin', count:25},
    {month:10, title:'Journal 20 days', icon:'✨', target:'journal', count:20},
    {month:11, title:'End strong  20 days', icon:'🎯', target:'sober', count:20}
  ]
};
var DEFAULT_CHALLENGES = ADDICTION_CHALLENGES['Other'];
var MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

var ADDICTION_TASKS = {
  'Alcohol':[
    {id:'alc1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you chose sobriety',pts:5},
    {id:'alc2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced and how you handled it',pts:5},
    {id:'alc3',icon:'\u2766',title:'Craving Check',desc:'Log a craving with its intensity and trigger',pts:5},
    {id:'alc4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner or a sober friend',pts:8},
    {id:'alc5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan for alcohol',pts:3},
    {id:'alc6',icon:'\u269C',title:'Hydrate',desc:'Drink 8 glasses of water today',pts:5},
    {id:'alc7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your day and any close calls',pts:6},
    {id:'alc8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle when a craving hits',pts:5},
    {id:'alc9',icon:'\u2727',title:'Refusal Rehearsal',desc:'Practice saying no to a drink out loud three times',pts:4},
    {id:'alc10',icon:'\u269C',title:'High-Risk Plan',desc:'Plan your evening to avoid tempting situations',pts:6},
    {id:'alc11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one alcohol recovery statistic or fact',pts:3},
    {id:'alc12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things sobriety has given you',pts:5}
  ],
  'Drugs (prescription/illicit)':[
    {id:'drg1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you chose recovery',pts:5},
    {id:'drg2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'drg3',icon:'\u2766',title:'Craving Check',desc:'Log a craving with intensity and trigger',pts:5},
    {id:'drg4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'drg5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan for substance use',pts:3},
    {id:'drg6',icon:'\u269C',title:'Movement Break',desc:'Go for a 10-minute walk or stretch',pts:5},
    {id:'drg7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about today wins and struggles',pts:6},
    {id:'drg8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'drg9',icon:'\u2727',title:'Read a Story',desc:'Read one recovery success story',pts:4},
    {id:'drg10',icon:'\u269C',title:'Safe People',desc:'Text one person who supports your recovery',pts:6},
    {id:'drg11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about substance recovery',pts:3},
    {id:'drg12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things recovery has given you',pts:5}
  ],
  'Pornography':[
    {id:'prn1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you chose this path',pts:5},
    {id:'prn2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'prn3',icon:'\u2766',title:'Urge Check',desc:'Log a craving with intensity and trigger',pts:5},
    {id:'prn4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'prn5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan for this area',pts:3},
    {id:'prn6',icon:'\u269C',title:'Move Your Body',desc:'Do 15 jumping jacks or a quick workout',pts:5},
    {id:'prn7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your day honestly',pts:6},
    {id:'prn8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'prn9',icon:'\u2727',title:'Learn Something',desc:'Read one article about recovery',pts:4},
    {id:'prn10',icon:'\u269C',title:'Restructure Space',desc:'Move your phone/laptop to a public area for 2 hours',pts:6},
    {id:'prn11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about porn recovery',pts:3},
    {id:'prn12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things you are gaining back',pts:5}
  ],
  'Gambling':[
    {id:'gam1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you quit gambling',pts:5},
    {id:'gam2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'gam3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'gam4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'gam5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan for gambling',pts:3},
    {id:'gam6',icon:'\u269C',title:'Money Check',desc:'Log your spending today and note what you saved',pts:5},
    {id:'gam7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about today wins and close calls',pts:6},
    {id:'gam8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'gam9',icon:'\u2727',title:'Free Activity',desc:'Do a hobby that does not cost money',pts:4},
    {id:'gam10',icon:'\u269C',title:'Block Access',desc:'Enable a blocker or limit access to gambling sites',pts:6},
    {id:'gam11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about gambling recovery',pts:3},
    {id:'gam12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 non-financial things you value',pts:5}
  ],
  'Smoking/Nicotine':[
    {id:'smk1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you quit nicotine',pts:5},
    {id:'smk2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'smk3',icon:'\u2766',title:'Craving Check',desc:'Log a craving with intensity and trigger',pts:5},
    {id:'smk4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'smk5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan for nicotine',pts:3},
    {id:'smk6',icon:'\u269C',title:'Hands Busy',desc:'Keep your hands occupied for 10 minutes with a fidget or hobby',pts:5},
    {id:'smk7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about today wins and cravings',pts:6},
    {id:'smk8',icon:'\u2767',title:'Breathe Deep',desc:'Take 10 slow deep breaths when an urge hits',pts:5},
    {id:'smk9',icon:'\u2727',title:'Healthy Swap',desc:'Replace one smoking trigger with a healthy alternative',pts:4},
    {id:'smk10',icon:'\u269C',title:'Go Outside',desc:'Step outside for fresh air without lighting up',pts:6},
    {id:'smk11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about nicotine recovery',pts:3},
    {id:'smk12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 health benefits you have noticed',pts:5}
  ],
  'Caffeine':[
    {id:'caf1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons to cut back',pts:5},
    {id:'caf2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify what triggered your caffeine use today',pts:5},
    {id:'caf3',icon:'\u2766',title:'Craving Check',desc:'Log a craving with intensity and trigger',pts:5},
    {id:'caf4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'caf5',icon:'\u2619',title:'Read Your Plan',desc:'Review your caffeine reduction plan',pts:3},
    {id:'caf6',icon:'\u269C',title:'Water First',desc:'Drink a full glass of water before any caffeine',pts:5},
    {id:'caf7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your energy levels today',pts:6},
    {id:'caf8',icon:'\u2767',title:'Natural Boost',desc:'Go for a 10-minute walk instead of reaching for caffeine',pts:5},
    {id:'caf9',icon:'\u2727',title:'Track Intake',desc:'Log every caffeinated drink today',pts:4},
    {id:'caf10',icon:'\u269C',title:'Cut-off Time',desc:'No caffeine after 2 PM today',pts:6},
    {id:'caf11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about caffeine and sleep',pts:3},
    {id:'caf12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 ways better sleep will improve your life',pts:5}
  ],
  'Sex/Love':[
    {id:'sex1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you chose this change',pts:5},
    {id:'sex2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'sex3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'sex4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'sex5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan',pts:3},
    {id:'sex6',icon:'\u269C',title:'Move Your Body',desc:'Exercise for 15 minutes to channel energy',pts:5},
    {id:'sex7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about today with honesty',pts:6},
    {id:'sex8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'sex9',icon:'\u2727',title:'Healthy Connection',desc:'Reach out to a friend with no romantic intent',pts:4},
    {id:'sex10',icon:'\u269C',title:'Boundary Check',desc:'Identify and write one boundary you will keep today',pts:6},
    {id:'sex11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about healthy relationships',pts:3},
    {id:'sex12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 non-physical qualities you appreciate',pts:5}
  ],
  'Shopping':[
    {id:'shp1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons to spend mindfully',pts:5},
    {id:'shp2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify what triggered a shopping urge today',pts:5},
    {id:'shp3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'shp4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'shp5',icon:'\u2619',title:'Read Your Plan',desc:'Review your shopping safety plan',pts:3},
    {id:'shp6',icon:'\u269C',title:'24-Hour Rule',desc:'Wait 24 hours before any non-essential purchase',pts:5},
    {id:'shp7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your spending feelings today',pts:6},
    {id:'shp8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'shp9',icon:'\u2727',title:'Free Fun',desc:'Do an enjoyable activity that costs nothing',pts:4},
    {id:'shp10',icon:'\u269C',title:'Unsubscribe',desc:'Unsubscribe from one marketing email or notification',pts:6},
    {id:'shp11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about compulsive buying',pts:3},
    {id:'shp12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 non-material things you already have',pts:5}
  ],
  'Social Media':[
    {id:'soc1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons to cut back',pts:5},
    {id:'soc2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify what triggered a scroll today',pts:5},
    {id:'soc3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'soc4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'soc5',icon:'\u2619',title:'Read Your Plan',desc:'Review your social media safety plan',pts:3},
    {id:'soc6',icon:'\u269C',title:'Phone Down',desc:'Keep your phone in another room for 1 hour',pts:5},
    {id:'soc7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about how social media affected your mood',pts:6},
    {id:'soc8',icon:'\u2767',title:'Breathe Not Scroll',desc:'Do 10 deep breaths before opening any app',pts:5},
    {id:'soc9',icon:'\u2727',title:'Real Connection',desc:'Call or meet one person in real life',pts:4},
    {id:'soc10',icon:'\u269C',title:'Clean Your Feed',desc:'Unfollow one account that does not serve you',pts:6},
    {id:'soc11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about social media and mental health',pts:3},
    {id:'soc12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things you enjoy offline',pts:5}
  ],
  'Gaming':[
    {id:'gme1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons to game mindfully',pts:5},
    {id:'gme2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify what triggered a gaming urge today',pts:5},
    {id:'gme3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'gme4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'gme5',icon:'\u2619',title:'Read Your Plan',desc:'Review your gaming safety plan',pts:3},
    {id:'gme6',icon:'\u269C',title:'Timer Set',desc:'Set a timer and stop gaming when it rings',pts:5},
    {id:'gme7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your gaming feelings today',pts:6},
    {id:'gme8',icon:'\u2767',title:'Breathe Before Launch',desc:'Do 10 breaths before starting a session',pts:5},
    {id:'gme9',icon:'\u2727',title:'Offline Hobby',desc:'Spend 30 minutes on a non-screen hobby',pts:4},
    {id:'gme10',icon:'\u269C',title:'Log Your Hours',desc:'Track total gaming time today honestly',pts:6},
    {id:'gme11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about gaming and the brain',pts:3},
    {id:'gme12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 real-world experiences you value',pts:5}
  ],
  'Eating/Food':[
    {id:'eat1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons for a healthy relationship with food',pts:5},
    {id:'eat2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify what triggered an eating urge today',pts:5},
    {id:'eat3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'eat4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'eat5',icon:'\u2619',title:'Read Your Plan',desc:'Review your eating safety plan',pts:3},
    {id:'eat6',icon:'\u269C',title:'Mindful Bite',desc:'Eat one meal slowly without any distractions',pts:5},
    {id:'eat7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your relationship with food today',pts:6},
    {id:'eat8',icon:'\u2767',title:'Pause Before Eating',desc:'Take 5 breaths before each meal',pts:5},
    {id:'eat9',icon:'\u2727',title:'Hunger Check',desc:'Rate your hunger before eating on a scale of 1-10',pts:4},
    {id:'eat10',icon:'\u269C',title:'One Healthy Swap',desc:'Replace one processed snack with whole food',pts:6},
    {id:'eat11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about intuitive eating',pts:3},
    {id:'eat12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things your body does for you',pts:5}
  ],
  'Self-Harm':[
    {id:'shm1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons to choose safety',pts:5},
    {id:'shm2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'shm3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'shm4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner or helpline',pts:8},
    {id:'shm5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan',pts:3},
    {id:'shm6',icon:'\u269C',title:'Ice Distraction',desc:'Hold an ice cube in your hand until it melts',pts:5},
    {id:'shm7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your emotions today — no judgment',pts:6},
    {id:'shm8',icon:'\u2767',title:'Breathe Through It',desc:'Do three rounds of 4-7-8 breathing',pts:5},
    {id:'shm9',icon:'\u2727',title:'Safe Sensation',desc:'Use a safe sensory tool (cold, texture, sound)',pts:4},
    {id:'shm10',icon:'\u269C',title:'Reach Out',desc:'Tell one trusted person how you are feeling',pts:6},
    {id:'shm11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one fact about self-harm recovery',pts:3},
    {id:'shm12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things you are grateful for today',pts:5}
  ],
  'Other':[
    {id:'oth1',icon:'\u2618',title:'Name Your Why',desc:'Write three reasons you chose this change',pts:5},
    {id:'oth2',icon:'\u2694',title:'Trigger Patrol',desc:'Identify one trigger you faced today',pts:5},
    {id:'oth3',icon:'\u2766',title:'Urge Check',desc:'Log an urge with intensity and trigger',pts:5},
    {id:'oth4',icon:'\u2726',title:'Call a Partner',desc:'Reach out to your accountability partner',pts:8},
    {id:'oth5',icon:'\u2619',title:'Read Your Plan',desc:'Review your safety plan',pts:3},
    {id:'oth6',icon:'\u269C',title:'Move Your Body',desc:'Do 10 minutes of physical activity',pts:5},
    {id:'oth7',icon:'\u2712',title:'Evening Reflection',desc:'Journal about your day honestly',pts:6},
    {id:'oth8',icon:'\u2767',title:'Breathe Through It',desc:'Do one 4-7-8 breathing cycle',pts:5},
    {id:'oth9',icon:'\u2727',title:'Learn Something',desc:'Read one recovery tip or fact',pts:4},
    {id:'oth10',icon:'\u269C',title:'One Healthy Choice',desc:'Make one choice today that supports your goal',pts:6},
    {id:'oth11',icon:'\u2628',title:'Know Your Numbers',desc:'Read one recovery fact',pts:3},
    {id:'oth12',icon:'\u265B',title:'Gratitude Pause',desc:'List 5 things you appreciate today',pts:5}
  ]
};

var _Q = {};
_Q.journal = function() { var t=new Date().toDateString(); return D.journal && D.journal.some(function(e){return e.date===t}); };
_Q.craving = function() { var t=new Date().toDateString(); return D.cravings && D.cravings.some(function(e){return e.date===t || (e.timestamp && new Date(e.timestamp).toDateString()===t)}); };
_Q.buddy = function() { var t=new Date().toDateString(); return D.buddyCheckins && D.buddyCheckins.some(function(e){try{return new Date(e.date).toDateString()===t}catch(ex){}return false}); };
_Q.breathe = function() { var t=new Date().toDateString(); return D.lastBreatheDate === t; };
function _getTaskCheck(task) {
  var t = task.title;
  if (t.indexOf('Breathe') >= 0 || t === 'Pause Before Eating') return _Q.breathe;
  if (t.indexOf('Name Your Why') >= 0 || t.indexOf('Evening Reflection') >= 0 || t.indexOf('Gratitude Pause') >= 0) return _Q.journal;
  if (t.indexOf('Trigger Patrol') >= 0 || t.indexOf('Craving Check') >= 0 || t.indexOf('Urge Check') >= 0) return _Q.craving;
    if (t.indexOf('Call a Partner') >= 0) return _Q.buddy;
  return null;
}
function getDailyQuests() {
  D.dailyQuests = D.dailyQuests || { date: '', done: [] };
  if (D.dailyQuests.completed && !D.dailyQuests.done) { D.dailyQuests.done = D.dailyQuests.completed; delete D.dailyQuests.completed; }
  var today = new Date();
  var dateStr = today.toDateString();
  if (D.dailyQuests.date !== dateStr) D.dailyQuests = { date: dateStr, done: [] };
  var type = (D.targetAddictions && D.targetAddictions.length) ? D.targetAddictions[0] : 'Other';
  var tasks = ADDICTION_TASKS[type] || ADDICTION_TASKS['Other'];
  var dayNum = today.getDate();
  var picks = [];
  var n = tasks.length;
  var w = getWarchest();
  var bonusActive = w.boostData.bonusDate === dateStr;
  var questCount = bonusActive ? Math.min(4, n) : Math.min(3, n);
  for (var p = 0; p < questCount && p < n; p++) {
    var idx = (dayNum * 7 + p * 13 + type.length) % n;
    picks.push(tasks[idx]);
  }
  return { tasks: picks, done: D.dailyQuests.done || [], date: dateStr, bonus: bonusActive };
}
function completeQuest(taskId) {
  try {
    var q = getDailyQuests();
    if (!q || !q.done || q.done.indexOf(taskId) >= 0) return;
    q.done.push(taskId);
    D.dailyQuests.done = q.done;
    var task = null;
    if (q.tasks) q.tasks.forEach(function(t){ if (t.id === taskId) task = t; });
    if (task && task.pts) earnSchillings(task.pts, 'Daily quest: ' + (task.title || ''));
    if (q.done.length === (q.tasks ? q.tasks.length : 0) && (q.tasks ? q.tasks.length : 0) >= 3) { earnSchillings(10, 'All daily quests complete!'); playSound('quest'); }
    saveData();
  } catch(e) {
    console.error('Quest error:', e);
    saveData();
  }
}
function dailyQuestsHTML() {
  var q = getDailyQuests();
  if (!q.tasks.length) return '';
  var type = (D.targetAddictions && D.targetAddictions.length) ? D.targetAddictions[0] : 'Other';
  var h = '<div class="card" style="margin:6px 0">';
  h += '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><div style="font-size:16px">\u269C</div><div><div style="font-size:13px;font-weight:700;color:var(--primary)">' + type + ' Daily Quests</div><div style="font-size:10px;color:var(--muted)">Complete all ' + (q.bonus ? '4' : '3') + ' for bonus schillings' + (q.bonus ? '<span style="color:var(--gold)"> &#10086; Bonus Quest active!</span>' : '') + '</div></div></div>';
  var allDone = true;
  q.tasks.forEach(function(t){
    var done = q.done.indexOf(t.id) >= 0;
    if (!done) allDone = false;
    var checkFn = _getTaskCheck(t);
    var autoDone = checkFn ? checkFn() : false;
    var isManual = !checkFn;
    var active = done || autoDone;
    h += '<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin:3px 0;border-radius:8px;background:' + (active ? 'var(--primary-light)' : 'var(--card)') + ';border:1px solid ' + (active ? 'var(--primary)' : 'var(--border)') + ';opacity:' + (done ? '.7' : '1') + '">';
    h += '<div style="font-size:20px;min-width:28px;text-align:center">' + (done ? '\u2713' : t.icon) + '</div>';
    h += '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;' + (done ? 'text-decoration:line-through' : '') + '">' + t.title + '</div><div style="font-size:10px;color:var(--muted)">' + t.desc + '</div></div>';
    h += '<div style="text-align:right"><div style="font-size:10px;color:#d4a017;font-weight:700">+' + t.pts + '</div>';
    if (!done) {
      if (autoDone) {
        h += '<button class="btn btn-sm btn-primary" onclick="completeQuest(\'' + t.id + '\')" style="font-size:9px;padding:3px 8px;margin-top:2px">\u269C Claim</button>';
      } else if (isManual) {
        h += '<button class="btn btn-sm btn-primary" onclick="completeQuest(\'' + t.id + '\')" style="font-size:9px;padding:3px 8px;margin-top:2px">\u269C Do</button>';
      }
    }
    h += '</div></div>';
  });
  if (allDone && q.tasks.length) {
    h += '<div style="text-align:center;padding:8px;font-size:12px;font-weight:700;color:var(--accent)">\u269C All quests complete! Well fought today.</div>';
  }
  h += '</div>';
  return h;
}
var WEEKLY_CAMPAIGNS = [
  {id:'siege',title:"The Siege of Fortitude",desc:"Stand firm against urges all week",
    tasks:[
      {id:'s1',title:'Fortress Wall',desc:'Log cravings on 3 different days',pts:15,check:function(){var o={},c=D.cravings||[];for(var i=0;i<c.length;i++){var d=c[i].date||(c[i].timestamp?new Date(c[i].timestamp).toDateString():'');if(d)o[d]=1}var n=0;for(var k in o)n++;return n>=3}},
      {id:'s2',title:'Iron Resolve',desc:'Journal on 3 different days',pts:15,check:function(){var o={},j=D.journal||[];for(var i=0;i<j.length;i++){var d=j[i].date;if(d)o[d]=1}var n=0;for(var k in o)n++;return n>=3}},
      {id:'s3',title:'Unbreakable',desc:'Complete breathing exercise 5 times',pts:15,check:function(){return D.breatheCount>=5}},
      {id:'s4',title:'Vigilant Watch',desc:'Check in with a buddy 3 times',pts:15,check:function(){return(D.buddyCheckins||[]).length>=3}},
      {id:'s5',title:'Triumph',desc:'Complete all campaign tasks',pts:20,reward:50}
    ]},
  {id:'vigil',title:"The Knight's Vigil",desc:"Deepen your daily recovery ritual",
    tasks:[
      {id:'v1',title:'Dawn Practice',desc:'Complete all daily quests for 3 days',pts:20,check:function(){return D.dailyQuests&&D.dailyQuests.done&&D.dailyQuests.done.length>=3}},
      {id:'v2',title:'Scroll of Truth',desc:'Write journal on 5 separate days',pts:20,check:function(){var o={},j=D.journal||[];for(var i=0;i<j.length;i++){var d=j[i].date;if(d)o[d]=1}var n=0;for(var k in o)n++;return n>=5}},
      {id:'v3',title:"Ally's Oath",desc:'Use the Craving Breaker 3 times',pts:15,check:function(){return(D.cravingBreakerCount||0)>=3}},
      {id:'v4',title:'Arms Inspection',desc:'Review your safety plan',pts:10,check:function(){return false}},
      {id:'v5',title:'Coronation',desc:'Complete all campaign tasks',pts:25,reward:60}
    ]},
  {id:'herald',title:"The Herald's Challenge",desc:"Explore every corner of your keep",
    tasks:[
      {id:'h1',title:'Coping Arsenal',desc:'Create a new coping card',pts:15,check:function(){return(D.copingCards||[]).length>=1}},
      {id:'h2',title:'History Scroll',desc:'Check your recovery reports',pts:15,check:function(){return false}},
      {id:'h3',title:'Music of the Spheres',desc:'Open the music page',pts:15,check:function(){return false}},
      {id:'h4',title:"Oath of Support",desc:'Visit the Support Circle',pts:15,check:function(){return false}},
      {id:'h5',title:'Crown of Growth',desc:'Complete all campaign tasks',pts:25,reward:70}
    ]}
];
function weeklyStart() { var d=new Date();var day=d.getDay();var diff=d.getDate()-day+(day===0?-6:1);return new Date(d.setDate(diff)).toDateString(); }
function getWeeklyCampaign() {
  D.weeklyCampaign=D.weeklyCampaign||{id:null,weekStart:'',done:[],rewardClaimed:false};
  var ws=weeklyStart();
  if(D.weeklyCampaign.weekStart!==ws){var wn=Math.floor(Date.now()/604800000);var idx=wn%WEEKLY_CAMPAIGNS.length;D.weeklyCampaign={id:WEEKLY_CAMPAIGNS[idx].id,weekStart:ws,done:[],rewardClaimed:false};saveData()}
  var camp=null;for(var i=0;i<WEEKLY_CAMPAIGNS.length;i++){if(WEEKLY_CAMPAIGNS[i].id===D.weeklyCampaign.id){camp=WEEKLY_CAMPAIGNS[i];break}}
  if(!camp){D.weeklyCampaign={id:WEEKLY_CAMPAIGNS[0].id,weekStart:ws,done:[],rewardClaimed:false};camp=WEEKLY_CAMPAIGNS[0]}
  return{campaign:camp,done:D.weeklyCampaign.done||[],weekStart:ws,rewardClaimed:D.weeklyCampaign.rewardClaimed||false};
}
function completeCampaignTask(taskId) {
  var w=getWeeklyCampaign();if(!w||w.done.indexOf(taskId)>=0)return;w.done.push(taskId);D.weeklyCampaign.done=w.done;
  var task=null;for(var i=0;i<w.campaign.tasks.length;i++){if(w.campaign.tasks[i].id===taskId){task=w.campaign.tasks[i];break}}
  if(task&&task.pts)earnSchillings(task.pts,'Campaign: '+task.title);saveData();render();
}
function claimCampaignReward() {
  var w=getWeeklyCampaign();if(w.rewardClaimed)return;var allDone=true;
  for(var i=0;i<w.campaign.tasks.length;i++){if(w.done.indexOf(w.campaign.tasks[i].id)<0){allDone=false;break}}
  if(!allDone)return;earnSchillings(w.campaign.tasks[w.campaign.tasks.length-1].reward,'Campaign complete: '+w.campaign.title);D.weeklyCampaign.rewardClaimed=true;saveData();playSound('trumpet');render();
}
function weeklyCampaignHTML() {
  var w=getWeeklyCampaign();var c=w.campaign;var allDone=true;var claimed=w.rewardClaimed;
  for(var i=0;i<c.tasks.length;i++){if(w.done.indexOf(c.tasks[i].id)<0){allDone=false;break}}
  var h='<div class="card" style="margin:6px 0">';
  h+='<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px"><span style="font-size:16px">\u2726</span><div><div style="font-size:13px;font-weight:700;color:var(--primary)">'+c.title+'</div><div style="font-size:10px;color:var(--muted)">'+c.desc+'</div></div></div>';
  for(var i=0;i<c.tasks.length;i++){
    var t=c.tasks[i];var done=w.done.indexOf(t.id)>=0;if(!done)allDone=false;var auto=false;
    if(!done&&t.check){try{auto=t.check()}catch(e){}}
    var isFin=t.reward?true:false;
    h+='<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;margin:2px 0;border-radius:6px;background:'+(done||auto?'var(--primary-light)':'var(--card)')+';border:1px solid '+(done||auto?'var(--primary)':'var(--border)')+';opacity:'+(done?'.7':'1')+'">';
    h+='<div style="font-size:16px;min-width:20px;text-align:center">'+(done?'\u2713':'\u2727')+'</div>';
    h+='<div style="flex:1;min-width:0"><div style="font-size:11px;font-weight:600;'+(done?'text-decoration:line-through':'')+'">'+t.title+'</div><div style="font-size:9px;color:var(--muted)">'+t.desc+'</div></div>';
    h+='<div style="font-size:10px;color:#d4a017;font-weight:700;white-space:nowrap">+'+(t.reward||t.pts)+'</div>';
    if(!done&&auto){h+='<button class="btn btn-sm btn-primary" onclick="completeCampaignTask(\''+t.id+'\')" style="font-size:9px;padding:2px 6px">\u269C</button>'}
    h+='</div>';
  }
  if(allDone&&!claimed){var r=c.tasks[c.tasks.length-1].reward;h+='<button class="btn btn-primary" onclick="claimCampaignReward()" style="width:100%;margin-top:6px;padding:8px;font-size:12px">\u265B Claim Campaign Reward: '+r+' schillings</button>'}
  if(claimed)h+='<div style="text-align:center;padding:6px;font-size:11px;color:var(--accent);font-weight:700">\u265B Campaign complete! Well fought.</div>';
  h+='<div style="font-size:8px;color:var(--muted);text-align:center;margin-top:4px">Resets Monday</div></div>';
  return h;
}

function currentMonthlyChallenge() {
  var now = new Date();
  var month = now.getMonth();
  var year = now.getFullYear();
  if (D.monthlyChallenge && D.monthlyChallenge.year === year && D.monthlyChallenge.month === month) return D.monthlyChallenge;
  var type = (D.targetAddictions && D.targetAddictions.length) ? D.targetAddictions[0] : 'Other';
  var list = ADDICTION_CHALLENGES[type] || DEFAULT_CHALLENGES;
  var challenge = list[month] || DEFAULT_CHALLENGES[month];
  return { month: month, year: year, title: challenge.title, icon: challenge.icon, target: challenge.target, targetCount: challenge.count, progress: 0, completed: false };
}

function getChallengeProgress(challenge) {
  if (!challenge) return 0;
  var now = new Date(), month = now.getMonth(), year = now.getFullYear();
  var count = 0;
  switch (challenge.target) {
    case 'journal': count = D.journal.filter(function(j){var d=new Date(j.date);return d.getMonth()===month&&d.getFullYear()===year}).length; break;
    case 'mood': count = D.moods.filter(function(m){var d=new Date(m.date);return d.getMonth()===month&&d.getFullYear()===year}).length; break;
    case 'habit': count = D.habits.reduce(function(s,h){return s+(h.logs?h.logs.filter(function(l){var d=new Date(l);return d.getMonth()===month&&d.getFullYear()===year}).length:0)},0); break;
    case 'checkin': count = D.checkins.filter(function(c){var d=new Date(c.date);return d.getMonth()===month&&d.getFullYear()===year}).length; break;
    case 'sober': count = soberDays(); break;
  }
  // Auto-save challenge progress
  D.monthlyChallenge = { month: challenge.month, year: challenge.year, title: challenge.title, icon: challenge.icon, target: challenge.target, targetCount: challenge.targetCount, progress: count, completed: count >= challenge.targetCount, pledge: D.monthlyChallenge ? D.monthlyChallenge.pledge : challenge.pledge };
  return count;
}

function calcJournalStreak() {
  if (!D.journal.length) return 0;
  var datesMap = {};
  for (var i=0;i<D.journal.length;i++) datesMap[D.journal[i].date] = true;
  var dates = Object.keys(datesMap).sort().reverse();
  var streak = 0;
  var checkDate = new Date();
  for (var i=0;i<dates.length;i++) {
    var d = new Date(checkDate);
    if (dates[i] === d.toDateString()) { streak++; checkDate.setDate(checkDate.getDate()-1); }
    else break;
  }
  return streak;
}

var FAMOUS_RECOVERY = [
  {name:'Robert Downey Jr.', addiction:'Drugs, Alcohol', types:['Drugs (prescription/illicit)','Alcohol'], story:'Arrested multiple times in the late 90s and early 2000s. Been sober since 2003, went on to become one of the highest-paid actors in the world playing Iron Man.', quote:'"It\'s so easy to fall  but it\'s so hard to get back up. Unless you have people who love you."'},
  {name:'Eminem (Marshall Mathers)', addiction:'Prescription drugs', types:['Drugs (prescription/illicit)'], story:'Nearly died from a methadone overdose in 2007. Has been sober since 2008, released multiple critically acclaimed albums.', quote:'"I felt like I was letting a lot of people down. The turning point was my daughter."'},
  {name:'Anthony Hopkins', addiction:'Alcohol', types:['Alcohol'], story:'A severe alcoholic for decades until 1975 when he realized he was going to die. Sober for over 45 years, won two Academy Awards, still acts in his 80s.', quote:'"I realized that I was heading for disaster. I made a decision, and I\'ve never looked back."'},
  {name:'Demi Lovato', addiction:'Alcohol, opioids', types:['Alcohol','Drugs (prescription/illicit)'], story:'Nearly died from an overdose in 2018. Open about multiple relapses and recoveries, using their platform to advocate for mental health.', quote:'"Recovery is not a straight line. What matters is you keep going."'},
  {name:'Samuel L. Jackson', addiction:'Cocaine', types:['Drugs (prescription/illicit)'], story:'Struggled with addiction in the 80s. His daughter witnessed him in a bad state, pushing him to get clean. Sober since 1990, became one of the most iconic actors in cinema.', quote:'"I was a functioning addict. But I wasn\'t functioning as a father."'},
  {name:'Elton John', addiction:'Alcohol, cocaine', types:['Alcohol','Drugs (prescription/illicit)'], story:'Hit rock bottom in the 80s. A young boy told him "I love you" during a rehab meeting, changing his life. Sober since 1990.', quote:'"Love cures people  the ones who receive it and the ones who give it."'},
  {name:'Jamie Lee Curtis', addiction:'Opioids', types:['Drugs (prescription/illicit)'], story:'Addicted to opioids after minor cosmetic surgery. Hid it for 10 years before quitting cold turkey in 1999. Sober for over 20 years.', quote:'"Addiction doesn\'t care who you are. Nobody knew  that\'s the scary part."'},
  {name:'Brad Pitt', addiction:'Alcohol', types:['Alcohol'], story:'Struggled with alcoholism for years. Joined AA in 2016 after his divorce. Uses art and sculpting as therapeutic outlets for recovery.', quote:'"I was a professional drinker. I had to face my own accountability."'},
  {name:'Russell Brand', addiction:'Heroin, crack, sex addiction', types:['Drugs (prescription/illicit)','Sex/Love'], story:'Severe heroin addict arrested and fired multiple times. Turned to spirituality after a life-changing intervention. Now a vocal recovery advocate.', quote:'"Addiction is a spiritual crisis, not a moral failing. The answer is connection."'},
  {name:'Macklemore', addiction:'Prescription pills, marijuana', types:['Drugs (prescription/illicit)'], story:'Started using at 13. Nearly died from an overdose in his 20s. Relapsed after his first Grammy win in 2014. Uses music to process recovery.', quote:'"The opposite of addiction is connection. I had to find a life I didn\'t want to escape from."'},
  {name:'Steve-O', addiction:'Alcohol, ketamine, nitrous oxide', types:['Alcohol','Drugs (prescription/illicit)'], story:'Arrested, hospitalized, and institutionalized multiple times. Jackass co-stars staged an intervention that saved his life. Sober since 2008, graduated college, became a vegan activist.', quote:'"I was going to die. Johnny Knoxville and the guys saved my life."'},
  {name:'Matthew Perry', addiction:'Alcohol, opioids', types:['Alcohol','Drugs (prescription/illicit)'], story:'Addicted to Vicodin and alcohol during Friends, at one point taking 55 Vicodin a day. Nearly died at 49. Became a recovery advocate.', quote:'"I kept fighting because I knew there was light on the other side."'},
  {name:'Terry Crews', addiction:'Pornography addiction', types:['Pornography','Sex/Love'], story:'Opened up about his struggle with pornography addiction in 2014. Went through a recovery program with his wife\'s support and became an advocate for men\'s mental health and breaking the stigma around addiction.', quote:'"I had to be honest. I had to tell my wife everything. Secrets keep you sick. The truth, no matter how hard, sets you free."'},
  {name:'Michael Imperioli', addiction:'Cocaine, alcohol', types:['Drugs (prescription/illicit)','Alcohol'], story:'Best known as Christopher Moltisanti on The Sopranos, Imperioli abused cocaine and alcohol to the point where it felt destructive. He was functional  never missed work  but realized he was losing control. When The Sopranos ended in 2007, he turned to Buddhism, which he credits with pulling him out of the abuse and restoring his creativity. He\'s been open about how spiritual practice replaced the need to escape.', quote:'"Drug and alcohol abuse diminishes your creativity and the way you engage with the world. Buddhism regenerated it."'},
  {name:'Drew Barrymore', addiction:'Alcohol, cocaine', types:['Alcohol','Drugs (prescription/illicit)'], story:'Drew started drinking at 9 years old and was using cocaine by 12. She was in rehab at 13  one of the youngest celebrities ever to seek treatment. She wrote about her struggles in her memoir "Little Girl Lost" and has been sober for decades, becoming a beloved actress, producer, and talk show host.', quote:'"I hit rock bottom and I had to rebuild myself from the ground up. Recovery showed me who I really am."'},
  {name:'Ben Affleck', addiction:'Alcoholism', types:['Alcohol'], story:'Ben Affleck has been open about his lifelong battle with alcoholism. He has been to rehab multiple times. He has spoken honestly about relapse, saying it is part of the journey  not the end of it. He continues to work on his sobriety publicly, helping normalize the struggle.', quote:'"The hardest part is not admitting you have a problem  it is admitting you still have one, even after you thought you fixed it."'},
  {name:'Tom Hardy', addiction:'Alcohol, crack cocaine', types:['Alcohol','Drugs (prescription/illicit)'], story:'Tom Hardy was homeless, addicted to alcohol and crack cocaine, and spent time in prison before turning his life around. He got clean in 2003 after hitting absolute rock bottom. Now one of the most respected actors in the world, he credits martial arts, his family, and complete abstinence with saving his life.', quote:'"I was a mess. I was in prison, I was drinking, I was on crack. I had to completely surrender."'},
  {name:'Jelly Roll', addiction:'Drug addiction', types:['Drugs (prescription/illicit)'], story:'Jelly Roll was dealing drugs as a teenager, arrested multiple times, and spent years in and out of jail. He struggled with cocaine and pill addiction for over a decade. After his daughter was born, he decided to change everything. Now one of the biggest country artists in the world, he uses his platform to advocate for recovery.', quote:'"I ain\'t no saint. I\'m just a dude who got tired of being tired. I wanted to be somebody my daughter could be proud of."'},
  {name:'Michael Phelps', addiction:'Alcohol', types:['Alcohol'], story:'The most decorated Olympian of all time was arrested for DUI in 2014 and checked into rehab. He has been open about his struggles with alcohol and depression. He credits therapy, structure, and his family with his recovery. He now speaks openly about mental health and sobriety.', quote:'"I thought the world would be better off without me. After I got help, I realized I had so much life left to live."'},
  {name:'Oprah Winfrey', addiction:'Cocaine', types:['Drugs (prescription/illicit)'], story:'Long before she became the most influential media figure in the world, Oprah smoked crack cocaine in her 20s. She quit after a particularly low moment, went on to build a billion-dollar empire, and has used her platform to destigmatize addiction and show that recovery is possible at any stage of life.', quote:'"I understand the shame that comes with addiction. But I also know what is possible on the other side."'},
  {name:'Mark Wahlberg', addiction:'Cocaine, violence', types:['Drugs (prescription/illicit)'], story:'Mark Wahlberg was a troubled teenager involved in drugs, violence, and crime. He was arrested multiple times and served 45 days in prison. While incarcerated, he turned his life around with the help of a priest. He got clean, became a rapper, then a movie star, and now one of the highest-paid actors in Hollywood.', quote:'"I made a lot of mistakes. But I decided I did not want to be that person anymore. I wanted to be somebody my mother could be proud of."'},
  {name:'Craig Ferguson', addiction:'Alcoholism', types:['Alcohol'], story:'Craig Ferguson was a severe alcoholic drinking a bottle of vodka a day by age 20. He got sober at 29 after a particularly dark night where he considered suicide. He has been sober ever since and is one of the funniest and most honest voices about recovery. His stand-up special "I\'m Here to Help" is entirely about his journey.', quote:'"Drinking nearly killed me. The funny thing is, I thought I was having fun. Now I have a life I never could have imagined."'}
];

function calcPledgeStreak() {
  if (!D.pledges || !D.pledges.length) return 0;
  var streak = 0;
  var d = new Date();
  for (var i=0;i<365;i++) {
    if (D.pledges.indexOf(d.toDateString()) !== -1) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }
  return streak;
}

function pledgeToday() {
  var today = new Date().toDateString();
  if (!D.pledges) D.pledges = [];
  if (D.pledges.indexOf(today) === -1) D.pledges.push(today);
  saveData();
  render();
}

function pledgeHTML() {
  var today = new Date().toDateString();
  var done = D.pledges && D.pledges.indexOf(today) !== -1;
  var streak = calcPledgeStreak();
  var h = '<div class="card" style="border-left:3px solid var(--primary);padding:14px;text-align:center">';
  h += '<div style="font-size:24px;margin-bottom:4px">&#9995;</div>';
  if (done) {
    h += '<div style="font-weight:700;font-size:15px;color:var(--primary)">'+t("Today's Commitment Made")+'</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin-top:2px">'+t('You pledged to stay sober today.')+'</div>';
  } else {
    h += '<div style="font-weight:700;font-size:15px">'+t('Commit to Today')+'</div>';
    h += '<div style="font-size:12px;color:var(--muted);margin:4px 0">'+t('I commit to staying sober and taking care of myself today.')+'</div>';
    h += '<button class="btn btn-primary" onclick="pledgeToday()" style="margin-top:6px;width:100%">&#9995; '+t('I Commit')+'</button>';
  }
  if (streak > 0) h += '<div style="font-size:12px;color:var(--muted);margin-top:6px">'+t('Pledge streak:')+' <strong>' + streak + '</strong> day' + (streak!==1?'s':'') + '</div>';
  h += '</div>';
  return h;
}

function showMilestoneCelebration(days) {
  if (D.lastMilestoneShown === days) return;
  D.lastMilestoneShown = days;
  saveData();
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;animation:scaleIn .3s"><div style="font-size:60px;margin:10px 0">&#x265B;</div><h2 style="margin:8px 0">' + days + ' '+t('Days Sober!')+'</h2><p style="font-size:14px;color:var(--muted);line-height:1.5">'+t('That is an incredible milestone. You are building something real, one day at a time.')+'</p><div id="confetti-canvas" style="height:100px;margin:10px 0;position:relative;overflow:hidden"></div><button class="btn btn-primary" onclick="this.closest(\'.overlay\').remove();startConfetti()" style="width:100%">&#x269C; '+t('Celebrate!')+'</button></div>';
  document.body.appendChild(overlay);
}

function startConfetti() {
  var canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  var colors = ['#ff6b35','#f7931e','#34d399','#60a5fa','#a78bfa','#f472b6','#fbbf24'];
  for (var i=0;i<60;i++) {
    (function(){
      var c = document.createElement('div');
      c.style.cssText = 'position:absolute;width:'+(6+Math.random()*6)+'px;height:'+(6+Math.random()*6)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';border-radius:'+(Math.random()>.5?'50%':'2px')+';left:'+(Math.random()*100)+'%;top:-10px;opacity:'+(.7+Math.random()*.3);
      canvas.appendChild(c);
      var x = parseFloat(c.style.left);
      var rot = Math.random()*720;
      var dur = 1500+Math.random()*2000;
      var start = Date.now();
      function anim() {
        var p = Math.min(1,(Date.now()-start)/dur);
        c.style.top = (p*120-10)+'px';
        c.style.left = (x + Math.sin(p*10)*15)+'px';
        c.style.transform = 'rotate('+(rot*p)+'deg)';
        c.style.opacity = 1-p;
        if (p<1) requestAnimationFrame(anim); else c.remove();
      }
      requestAnimationFrame(anim);
    })();
  }
}

function checkMilestone() {
  var days = soberDays();
  var milestones = [1,3,7,14,21,30,60,90,180,365,730,1000];
  for (var i=0;i<milestones.length;i++) {
    if (days === milestones[i] && D.lastMilestoneShown < days) {
      D.warchest = D.warchest || { schillings: 0, shields: 0, lastDayCounted: 0, lastEntryCount: 0 };
      D.warchest.shields = (D.warchest.shields || 0) + 1;
      saveData();
      showMilestoneParty(days); break;
    }
  }
}

// ====== ACHIEVEMENTS ======
function checkAchievements() {
  if (!D.achievements) D.achievements = [];
  var days = soberDays();
  var entries = (D.journal || []).length;
  var wc = D.warchest || {};
  var shields = wc.shields || 0;
  var questsDone = 0;
  if (D.dailyQuests && D.dailyQuests.done) questsDone += D.dailyQuests.done.length;
  if (D.weeklyCampaign && D.weeklyCampaign.done) questsDone += D.weeklyCampaign.done.length;
  var newOnes = [];
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (D.achievements.indexOf(a.id) >= 0) continue;
    if (a.id === 'crown_jewel') {
      var all = ACHIEVEMENTS.map(function(x){return x.id});
      var unlocked = D.achievements || [];
      var others = all.filter(function(x){return x !== 'crown_jewel'});
      if (others.every(function(x){return unlocked.indexOf(x) >= 0})) {
        D.achievements.push(a.id);
        newOnes.push(a);
      }
      continue;
    }
    if (a.check(days, entries, shields, questsDone)) {
      D.achievements.push(a.id);
      newOnes.push(a);
    }
  }
  if (newOnes.length) saveData();
  for (var qi = 0; qi < newOnes.length; qi++) {
    (function(ach, idx) {
      setTimeout(function() { showAchievementPopup(ach); }, idx * 1200);
    })(newOnes[qi], qi);
  }
}

function showAchievementPopup(a) {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.style.background = 'rgba(0,0,0,.5)';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:320px;padding:24px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:2px solid #d4a017;border-radius:20px;animation:achievePop .4s ease-out">' +
    '<div style="font-size:48px;margin-bottom:4px">' + a.icon + '</div>' +
    '<div style="font-size:22px;font-weight:700;color:#d4a017;font-family:Georgia,serif;margin-bottom:2px">Achievement Unlocked!</div>' +
    '<div style="font-size:16px;font-weight:600;color:#fff;margin-bottom:4px">' + a.title + '</div>' +
    '<div style="font-size:12px;color:#aaa;margin-bottom:12px">' + a.desc + '</div>' +
    '<button class="btn btn-sm" onclick="this.closest(\'.overlay\').remove()" style="background:#d4a017;color:#1a1a2e;font-weight:700;border:none">Huzzah!</button></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){ try { overlay.querySelector('.overlay-content').style.transform = 'scale(1)'; } catch(e){} }, 10);
}

function recoveryGoalsHTML() {
  var h = '<div class="card" id="recovery-goals-card"><div style="display:flex;justify-content:space-between;align-items:center"><h3>'+t('Recovery Goals')+'</h3><button class="btn btn-sm btn-outline" onclick="showNewGoal()">+ '+t('Add')+'</button></div>';
  if (!D.recoveryGoals || !D.recoveryGoals.length) {
    h += '<div class="empty-state">'+t('Set goals to track your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.')+'</div></div>';
    return h;
  }
  var today = new Date().toDateString();
  for (var gi=0;gi<D.recoveryGoals.length;gi++) {
    var g = D.recoveryGoals[gi];
    var doneToday = g.logs && g.logs.indexOf(today) !== -1;
    var streak = 0;
    var d = new Date();
    for (var si=0;si<365;si++) {
      if (g.logs && g.logs.indexOf(d.toDateString()) !== -1) { streak++; d.setDate(d.getDate()-1); } else break;
    }
    h += '<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--border)">';
    h += '<div class="check'+(doneToday?' done':'')+'" onclick="toggleGoal('+gi+')" style="width:22px;height:22px;font-size:12px;flex-shrink:0;cursor:pointer">'+(doneToday?'?':'')+'</div>';
    h += '<div style="flex:1"><div style="font-size:13px;font-weight:600">' + safe(g.text) + '</div><div style="font-size:11px;color:var(--muted)">' + streak + ' day streak</div></div>';
    h += '<button class="btn btn-sm btn-danger" onclick="D.recoveryGoals.splice('+gi+',1);saveData();render()" style="padding:2px 6px;font-size:10px;width:auto">&#10005;</button></div>';
  }
  h += '</div>';
  return h;
}

function showNewGoal() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:400px"><h3>'+t('New Recovery Goal')+'</h3><input type="text" id="new-goal-text" placeholder="e.g. Journal 5 times this week, Meditate daily" style="margin-bottom:8px"><button class="btn btn-primary" onclick="saveNewGoal()">'+t('Add Goal')+'</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Cancel')+'</button></div>';
  document.body.appendChild(overlay);
  document.getElementById('new-goal-text').focus();
}

function saveNewGoal() {
  var text = document.getElementById('new-goal-text').value.trim();
  if (!text) return;
  if (!D.recoveryGoals) D.recoveryGoals = [];
  D.recoveryGoals.push({ text: text, logs: [] });
  saveData();
  document.querySelector('.overlay').remove();
  render();
}

function toggleGoal(idx) {
  var g = D.recoveryGoals[idx];
  if (!g.logs) g.logs = [];
  var today = new Date().toDateString();
  var i = g.logs.indexOf(today);
  if (i === -1) g.logs.push(today); else g.logs.splice(i, 1);
  saveData();
  render();
}

function showShareCard() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  var days = soberDays();
  var streak = D.streak || 0;
  var journalCount = D.journal.length;
  var cravingCount = D.cravings ? D.cravings.length : 0;
  var pledgeStreak = calcPledgeStreak();

  // Character SVGs (reuse team battle poses)
  var arthurSVG = '<svg viewBox="0 0 30 54" style="width:50px;height:90px"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="11" y2="39" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="11" y1="39" x2="8" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M6 49 L11 49 L12 52 L5 52 Z" fill="#6d28d9"/><line x1="15" y1="30" x2="20" y2="38" stroke="#e8b88a" stroke-width="3" stroke-linecap="round"/><line x1="20" y1="38" x2="23" y2="51" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><path d="M19 49 L24 49 L25 52 L18 52 Z" fill="#6d28d9"/><path d="M10.5 12 Q9 20 8 28 L8 44 Q8 48 9 49 L9 51 L21 51 L21 49 Q22 48 22 44 L22 28 Q21 20 19.5 12 Z" fill="#6d28d9"/><line x1="15" y1="12" x2="15" y2="48" stroke="#ffd700" stroke-width="0.8"/><rect x="9" y="26" width="12" height="2.5" rx="1" fill="#ffd700"/><circle cx="15" cy="27.25" r="1.5" fill="#e11d48"/><path d="M15 17 L19 14" stroke="#e8b88a" stroke-width="3" stroke-linecap="round" fill="none"/><g transform="translate(19,14)"><use href="#star4" transform="scale(1.5)" fill="#e8b88a"/></g><line x1="19" y1="14" x2="21" y2="10" stroke="#e8b88a" stroke-width="2.5" stroke-linecap="round"/><g transform="translate(22,10)"><use href="#star4" transform="scale(1.8)" fill="#ffd700"/></g><ellipse cx="15" cy="8" rx="5.5" ry="5.5" fill="#e8b88a"/><path d="M9.5 5 Q9.5 2 12 1.5 Q15 1 18 1.5 Q20.5 2 20.5 5 Q20.5 3.5 17 3 Q15 2.8 13 3 Q9.5 3.5 9.5 5" fill="#8B4513"/><path d="M11.5 10 Q11 12.5 12 15 Q13.5 17 15 17 Q16.5 17 18 15 Q19 12.5 18.5 10 Z" fill="#8B4513"/><path d="M12 11 Q12.5 13 15 13.5 Q17.5 13 18 11" fill="#6B3410" opacity=".5"/><path d="M10.5 3 L11 0.5 L12.5 2 L15 0 L17.5 2 L19 0.5 L19.5 3 Z" fill="#ffd700" stroke="#b8860b" stroke-width="0.4"/><rect x="10.5" y="3" width="9" height="2" rx="0.5" fill="#ffd700" stroke="#b8860b" stroke-width="0.3"/><g transform="translate(13,2)"><use href="#star4" transform="scale(0.6)" fill="#e11d48"/></g><circle cx="15" cy="1.2" r="0.7" fill="#3b82f6"/><g transform="translate(17,2)"><use href="#star4" transform="scale(0.6)" fill="#34d399"/></g></svg>';
  var oswaldSVG = '<svg viewBox="0 0 30 54" style="width:50px;height:90px"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><line x1="15" y1="30" x2="10" y2="39" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#1e1b4b"/><line x1="15" y1="30" x2="21" y2="38" stroke="#4338ca" stroke-width="3" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#4338ca" stroke-width="2.5" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#1e1b4b"/><path d="M10.5 12 Q10 15 10 28 L10 45 Q10 48 9 49 L9 51 L21 51 L21 49 Q20 48 20 45 L20 28 Q20 15 19.5 12 Z" fill="#4338ca"/><rect x="10.5" y="26" width="9" height="2.5" rx="1" fill="#1e1b4b"/><rect x="14" y="26.3" width="2" height="1.9" rx=".3" fill="#fbbf24"/><path d="M15 17 L20 21" stroke="#4338ca" stroke-width="4.5" stroke-linecap="round" fill="none"/><ellipse cx="20.5" cy="21" rx="1.8" ry="1.5" fill="#f0d5b0"/><line x1="21" y1="22" x2="27" y2="10" stroke="#4a3728" stroke-width="2" stroke-linecap="round"/><g transform="translate(27,9)"><use href="#star4" transform="scale(2.5)" fill="#a5b4fc"/></g><g transform="translate(27,9)"><use href="#star4" transform="scale(1)" fill="#e0e7ff"/></g><path d="M26 6.5 L27 4 L28 6.5 Z" fill="#fbbf24"/><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><ellipse cx="15" cy="3.5" rx="7.5" ry="2" fill="#4338ca"/><path d="M9 3.5 L15 -2.5 L21 3.5 Z" fill="#4338ca"/><rect x="11" y="2.8" width="8" height="1.5" rx=".5" fill="#fbbf24"/><text x="15" y="1" font-size="2.5" fill="#fbbf24" text-anchor="middle">?</text><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9 Q15 10.5 17 9" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/><path d="M12.5 9 L15 14 L17.5 9 Z" fill="#e0e0e0"/></svg>';
  var gertrudeSVG = '<svg viewBox="0 0 30 54" style="width:50px;height:90px"><ellipse cx="15" cy="52" rx="9" ry="1.5" fill="rgba(0,0,0,.1)"/><path d="M11 12 Q10 15 10.5 27 L19.5 27 Q20 15 19 12 Z" fill="#94a3b8"/><path d="M11.5 13 Q11 15 11.5 25 L18.5 25 Q19 15 18.5 13 Z" fill="#be185d"/><path d="M10.5 25 L19.5 25 L19 33 L11 33 Z" fill="#9d174d"/><rect x="10.5" y="26.5" width="9" height="2" rx=".5" fill="#78350f"/><rect x="14" y="26.8" width="2" height="1.4" rx=".3" fill="#fbbf24"/><path d="M15 17 L9 19" stroke="#94a3b8" stroke-width="4.5" stroke-linecap="round" fill="none"/><path d="M9 19 L7 13" stroke="#94a3b8" stroke-width="3.5" stroke-linecap="round" fill="none"/><g transform="translate(6,12)"><use href="#star4" transform="scale(1.5)" fill="#f0d5b0"/></g><path d="M1 7 Q-1 12 1 17 L6 17 Q7 12 6 7 Z" fill="#be185d" stroke="#fbbf24" stroke-width=".5"/><line x1="15" y1="30" x2="10" y2="39" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="10" y1="39" x2="7" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M5 49 L10 49 L11 52 L4 52 Z" fill="#8B4513"/><line x1="15" y1="30" x2="21" y2="38" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><line x1="21" y1="38" x2="24" y2="51" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"/><path d="M20 49 L25 49 L26 52 L19 52 Z" fill="#8B4513"/><ellipse cx="15" cy="7" rx="5.5" ry="5" fill="#f0d5b0"/><path d="M9.5 5 Q9.5 1 15 1 Q20.5 1 20.5 5 Q20.5 3 17.5 2.2 Q15 1.8 12.5 2.2 Q9.5 3 9.5 5" fill="#be185d"/><path d="M10 3.5 Q12.5 1.5 15 3.5 Q17.5 1.5 20 3.5" fill="none" stroke="#fbbf24" stroke-width="1.2" stroke-linecap="round"/><circle cx="15" cy="2.5" r=".8" fill="#fbbf24"/><circle cx="12.5" cy="6" r=".8" fill="#333"/><circle cx="17.5" cy="6" r=".8" fill="#333"/><path d="M13 9.5 Q15 11 17 9.5" fill="none" stroke="#333" stroke-width=".6" stroke-linecap="round"/></svg>';

  // Random order
  var chars = [
    {svg:arthurSVG, color:'#ffd700'},
    {svg:oswaldSVG, color:'#4338ca'},
    {svg:gertrudeSVG, color:'#be185d'}
  ];
  for (var ri = chars.length - 1; ri > 0; ri--) {
    var rj = Math.floor(Math.random() * (ri + 1));
    var tmp = chars[ri]; chars[ri] = chars[rj]; chars[rj] = tmp;
  }

  var h = '<div class="overlay-content" style="max-width:380px;text-align:center"><div style="font-size:40px;margin-bottom:4px">&#x265B;</div><h3 style="margin:0;font-size:18px">'+t('My Recovery So Far')+'</h3>';

  // Character row
  h += '<div style="display:flex;justify-content:center;align-items:flex-end;gap:2px;margin:2px 0;min-height:80px">';
  for (var ci=0;ci<chars.length;ci++) {
    h += '<div style="filter:drop-shadow(0 0 8px '+chars[ci].color.replace('#','')+'66);animation:shareCharPose 2s ease-in-out ' + (ci*0.2) + 's infinite">' + chars[ci].svg + '</div>';
  }
  h += '</div>';

  h += '<div style="background:linear-gradient(135deg,var(--primary),#34d399);color:#fff;border-radius:16px;padding:20px;margin:6px 0" id="share-card">';
  h += '<div style="font-size:14px;margin-bottom:8px">' + (D.name || 'Re.Claim User') + '</div>';
  h += '<div style="font-size:48px;font-weight:800;line-height:1">' + days + '</div><div style="font-size:14px;opacity:.9">'+t('days sober')+'</div>';
  h += '<div style="display:flex;gap:16px;justify-content:center;margin-top:12px;font-size:12px">';
  h += '<div><strong>' + journalCount + '</strong><br>'+t('journal entries')+'</div>';
  h += '<div><strong>' + streak + '</strong><br>'+t('day streak')+'</div>';
  h += '<div><strong>' + pledgeStreak + '</strong><br>'+t('pledge streak')+'</div></div>';
  h += '<div style="margin-top:10px;font-size:10px;opacity:.6">reclaim00.github.io/reclaim-buddy</div></div>';
  h += '<p style="font-size:11px;color:var(--muted);margin-bottom:8px">'+t('Screenshot this card to share your progress.')+'</p>';
  h += '<button class="btn btn-primary" onclick="shareCardImage()">&#128247; '+t('Share Image')+'</button>';
  h += '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">'+t('Close')+'</button></div>';
  overlay.innerHTML = h;
  document.body.appendChild(overlay);
}

function shareCardImage() {
  var card = document.getElementById('share-card');
  if (!card) return;
  if (navigator.share) {
    navigator.share({ title: t('My Recovery Progress'), text: card.innerText, url: 'https://reclaim00.github.io/reclaim-buddy/' }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
  } else {
    alert(t('Take a screenshot of the card above to share!'));
  }
}

function applyTheme() {
  var pal = {
    green:{primary:'#3a7a2e',dark:'#1a4a12',light:'#e4ebe0',lightDark:'rgba(58,122,46,0.15)'},
    blue:{primary:'#60a5fa',dark:'#2563eb',light:'#dbeafe',lightDark:'rgba(96,165,250,0.15)'},
    purple:{primary:'#a78bfa',dark:'#7c3aed',light:'#ede9fe',lightDark:'rgba(167,139,250,0.15)'},
    pink:{primary:'#f472b6',dark:'#db2777',light:'#fce7f3',lightDark:'rgba(244,114,182,0.15)'},
    orange:{primary:'#fb923c',dark:'#ea580c',light:'#fed7aa',lightDark:'rgba(251,146,60,0.15)'},
    red:{primary:'#f87171',dark:'#dc2626',light:'#fecaca',lightDark:'rgba(248,113,113,0.15)'},
  };
  var c = pal[D.accentColor] || pal.green;
  var el = document.body, root = document.documentElement;
  if (!el) return;
  el.style.setProperty('--primary', c.primary);
  el.style.setProperty('--primary-dark', c.dark);
  if (D.darkMode) {
    el.classList.add('dark');
    root.style.background = '#0f140e';
    el.style.setProperty('--bg','#0f140e');
    el.style.setProperty('--card','#181c16');
    el.style.setProperty('--text','#e4e4e7');
    el.style.setProperty('--muted','#8a8a9a');
    el.style.setProperty('--border','#2a2a22');
    el.style.setProperty('--primary-light', c.lightDark);
  } else {
    el.classList.remove('dark');
    root.style.background = '#dce3d4';
    el.style.setProperty('--bg','#dce3d4');
    el.style.setProperty('--card','#f0ede4');
    el.style.setProperty('--text','#1e1a14');
    el.style.setProperty('--muted','#7a7666');
    el.style.setProperty('--border','#e5e7eb');
    el.style.setProperty('--primary-light', c.light);
  }
  if (D.parchmentMode) { el.classList.add('parchment'); } else { el.classList.remove('parchment'); }
  // Theme-based kingdom scene colors
  var ks = document.querySelector('.kingdom-scene');
  if (ks) {
    if (D.theme === 'fantasy') {
      ks.style.setProperty('--sky-c', '#7ec8e3');
      ks.style.setProperty('--ground-c', '#7cb342');
      ks.style.setProperty('--hill-c', '#8bc34a');
      ks.style.setProperty('--keep-c', '#d4a76a');
      ks.style.setProperty('--roof-c', '#c0392b');
      ks.style.setProperty('--tower-c', '#d4a76a');
      ks.style.setProperty('--tower-roof-c', '#c0392b');
      ks.style.setProperty('--door-c', '#5d4037');
      ks.style.setProperty('--tree-c', '#4caf50');
      ks.style.setProperty('--tree-trunk-c', '#5d4037');
      ks.style.setProperty('--flag-c', '#e74c3c');
      ks.style.setProperty('--window-c', '#ffe082');
      ks.style.setProperty('--path-c', '#a1887f');
    } else {
      ['sky-c','ground-c','hill-c','keep-c','roof-c','tower-c','tower-roof-c','door-c','tree-c','tree-trunk-c','flag-c','window-c','path-c','cloud-c','bird-c','rubble-c'].forEach(function(k){ ks.style.removeProperty('--'+k); });
    }
  }
}

function updateTabLabels() {
  var labels = {home:'Atlas',reflect:'Journal',care:'Wellness',track:'History',more:'Tools'};
  [].forEach.call(document.querySelectorAll('.tab'),function(el){
    var page = el.getAttribute('data-page');
    var span = el.querySelector('.tab-label');
    if (span && labels[page]) span.textContent = labels[page];
  });
  // Add keyboard accessibility to sub-items
  [].forEach.call(document.querySelectorAll('.sub-item'), function(el){
    if (!el.getAttribute('tabindex')) { el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button'); }
  });
}
// Global keyboard handler for sub-items and cards
document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' || e.key === ' ') {
    var target = e.target.closest('.sub-item, .card[onclick]');
    if (target && target.getAttribute('onclick')) {
      e.preventDefault();
      var tmp = document.createElement('div');
      tmp.setAttribute('onclick', target.getAttribute('onclick'));
      tmp.click();
    }
  }
});

// ====== OSWALD'S TOWER ======
function oswaldTowerHTML() {
  var h = '<h2 class="page-title">&#127987; Oswald\'s View</h2>';
  h += '<div class="card" style="text-align:center;padding:20px;background:linear-gradient(135deg,rgba(67,56,202,.04),var(--card))">';
  h += '<div class="oswald-crystal-ball">&#10024;</div>';
  h += '<h3 style="font-size:16px;font-weight:700;margin-bottom:2px">The Wizard\'s Wisdom</h3>';
  h += '<p style="font-size:12px;color:var(--muted);margin:0 0 4px">Oswald peers into the patterns of your realm...</p></div>';

  // Omens based on user data
  var journalCount = (D.journal||[]).length;
  var moodCount = (D.moods||[]).length;
  var streak = D.streak || 0;
  var soberStart = D.sobriety && D.sobriety.startDate;
  var soberDays = soberStart ? Math.floor((Date.now() - soberStart) / 86400000) : 0;
  var cravingCount = (D.cravings||[]).length;
  var breatheCount = D.breatheCount || 0;
  var checkinCount = (D.checkins||[]).length;
  var relapses = (D.sobriety && D.sobriety.relapseDates) ? D.sobriety.relapseDates.length : 0;
  var sosUsed = D.sosUsed || false;
  var planExists = !!(D.relapsePlan && D.relapsePlan.statement);
  var buddyExists = !!D.buddy;
  var phqScore = D.screenerPHQ9 && D.screenerPHQ9.result ? D.screenerPHQ9.result.total : null;
  var achCount = (D.achievements||[]).length;

  var omens = [];

  // Journaling frequency
  if (journalCount >= 30) omens.push({type:'good', text:'The scribes report a full chronicle. Your consistency in journaling builds clarity like a well-tended library.'});
  else if (journalCount >= 10) omens.push({type:'good', text:'Your quill moves often. Each entry adds a thread to the tapestry of your recovery.'});
  else if (journalCount > 0) omens.push({type:'neutral', text:'The pages are few but they exist. Consider writing more \u2014 even three sentences can shift the winds.'});
  else omens.push({type:'neutral', text:'The chronicle is bare. A single entry today would begin your annals. Arthur awaits your words.'});

  // Sobriety streak
  if (soberDays >= 90) omens.push({type:'good', text: 'A season of strength! ' + soberDays + ' days unbroken. The kingdom remembers this resolve.'});
  else if (soberDays >= 30) omens.push({type:'good', text: 'A full moon cycle of clarity \u2014 ' + soberDays + ' days. The foundation is solid.'});
  else if (soberDays >= 7) omens.push({type:'good', text: 'A week of reign. Each day strengthens the walls of your keep.'});
  else if (soberDays >= 1) omens.push({type:'neutral', text: 'You are in the early days of your journey. The first steps are the most important.'});
  else omens.push({type:'neutral', text: 'The reign has not yet begun. Every journey starts with a single stride.'});

  // Relapse patterns
  if (relapses >= 3) omens.push({type:'warning', text: 'The shadows have visited ' + relapses + ' times. Each fall is a teacher \u2014 what patterns do you see across them? Visit the Relapse Graveyard to honor the lessons.'});
  else if (relapses >= 1) omens.push({type:'warning', text: 'A single fall does not undo your growth. What did that moment teach you? The lesson is worth more than the stumble.'});
  else omens.push({type:'good', text: 'No falls recorded. Your shield holds strong. But remain vigilant \u2014 the wise knight never lowers their guard.'});

  // Breathing exercise
  if (breatheCount >= 20) omens.push({type:'good', text: 'You have breathed with intention ' + breatheCount + ' times. Each breath is a meditation \u2014 a reset of the spirit.'});
  else if (breatheCount >= 5) omens.push({type:'good', text: 'You have turned to the breath ' + breatheCount + ' times. This is a powerful tool \u2014 keep it honed.'});
  else omens.push({type:'neutral', text: 'The breathing exercises are a quiet refuge. Try one today and feel the difference.'});

  // Safety plan
  if (planExists) omens.push({type:'good', text: 'Your safety plan is forged and ready. In the chaos of craving, it will be your compass.'});
  else omens.push({type:'warning', text: 'You have no safety plan yet. I urge you \u2014 visit Oswald in the Infirmary and build one before the storm arrives.'});

  // Buddy
  if (buddyExists) omens.push({type:'good', text: 'A partner walks beside you. The road is lighter with another set of footsteps.'});
  else omens.push({type:'neutral', text: 'You walk this road alone for now. A partner could share the burden \u2014 consider finding one in the Tools.'});

  // SOS used
  if (sosUsed) omens.push({type:'good', text: 'You have reached out for help before. That is not weakness \u2014 it is the highest form of courage. The tower salutes you.'});

  // PHQ-9
  if (phqScore !== null) {
    if (phqScore <= 4) omens.push({type:'good', text: 'Your PHQ-9 signals minimal depression. The skies above your kingdom are clear.'});
    else if (phqScore <= 9) omens.push({type:'neutral', text: 'Your PHQ-9 shows mild shadows. Nothing a steady routine cannot address.'});
    else if (phqScore <= 14) omens.push({type:'warning', text: 'Your PHQ-9 suggests a moderate fog. Consider speaking with a healer beyond these walls.'});
    else omens.push({type:'danger', text: 'Your PHQ-9 signals a heavy mist. Please seek counsel \u2014 you need not face this alone.'});
  }

  // Achievements
  if (achCount >= 10) omens.push({type:'good', text: achCount + ' achievements earned! Your reign is gathering legend.'});
  else if (achCount >= 3) omens.push({type:'good', text: achCount + ' achievements shine on your banner. Each one represents a battle won.'});

  // Mood logging
  if (moodCount >= 20) omens.push({type:'good', text: 'You have logged ' + moodCount + ' moods. This data is the lifeblood of insight \u2014 Arthur reads it well.'});

  // Cravings
  if (cravingCount > 0) omens.push({type:'neutral', text: cravingCount + ' cravings recorded. Naming them is the first victory. Each logged craving is a dragon spotted before it burns the village.'});

  // Check-ins
  if (checkinCount >= 30) omens.push({type:'good', text: checkinCount + ' daily check-ins. Your presence is a ritual now \u2014 the kingdom thrives on it.'});

  // Current streak
  if (streak >= 14) omens.push({type:'good', text: 'A ' + streak + '-day streak! The war horn sounds \u2014 your consistency inspires the realm.'});

  // Show omens (limit to 6 most relevant)
  var priority = {danger:0, warning:1, good:2, neutral:3};
  omens.sort(function(a,b){return priority[a.type]-priority[b.type]});
  var shown = omens.slice(0, 6);

  for (var oi=0;oi<shown.length;oi++) {
    h += '<div class="oswald-omen ' + shown[oi].type + '">';
    var icons = {good:'&#10003;', warning:'&#9888;', danger:'&#10006;', neutral:'&#10022;'};
    h += '<span style="margin-right:6px">' + (icons[shown[oi].type] || '&#10022;') + '</span>';
    h += shown[oi].text + '</div>';
  }

  h += '<div class="card" style="text-align:center;padding:12px;margin-top:8px">';
  h += '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">"The stars do not decide your fate \u2014 they merely illuminate the path you are already walking."</div>';
  h += '<div style="font-size:11px;font-style:italic;color:var(--muted)">\u2014 Oswald, Keeper of the View</div></div>';

  return h;
}

function monthlyChallengeHTML() {
  var challenge = currentMonthlyChallenge();
  var progress = getChallengeProgress(challenge);
  var pct = Math.min(100, Math.round((progress / challenge.targetCount) * 100));
  var done = progress >= challenge.targetCount;
  var monthLabel = MONTH_NAMES[challenge.month] || '';
  var pledged = challenge.pledge || (D.monthlyChallenge && D.monthlyChallenge.pledge);
  var h = '<div class="card" style="border:2px solid ' + (done ? 'var(--primary)' : (pledged ? 'var(--accent)' : 'var(--border)')) + '"><div style="display:flex;align-items:center;gap:8px;margin-bottom:6px"><div style="font-size:20px">' + challenge.icon + '</div><div><h3 style="margin:0;font-size:14px">' + (done ? '&#x269C; ' : '') + monthLabel + ' Challenge</h3><p style="margin:0;font-size:11px;color:var(--muted)">' + challenge.title + '</p></div></div>';
  if (!pledged && !done) {
    h += '<button class="btn btn-sm btn-primary" onclick="pledgeToChallenge()" style="width:100%;margin:6px 0">&#9997; Pledge to Complete</button>';
    h += '<div style="font-size:11px;color:var(--muted);text-align:center">Make a commitment to yourself  write down your promise</div>';
  } else {
    if (pledged) {
      h += '<div style="font-size:11px;background:var(--primary-light);padding:6px 8px;border-radius:6px;margin:4px 0;line-height:1.4;color:var(--text)">&#128221; "' + safe(pledged) + '"</div>';
    }
    h += '<div class="progress-bar" style="margin:6px 0"><div class="fill" style="width:' + pct + '%"></div></div>';
    h += '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted)"><span>' + progress + '/' + challenge.targetCount + '</span><span>' + pct + '%</span></div>';
    if (done) {
      h += '<div style="text-align:center;margin-top:6px;font-size:13px;font-weight:700;color:var(--primary)">&#x269C; Challenge Complete! You kept your word.</div>';
    }
  }
  h += '</div>';
  return h;
}
function pledgeToChallenge() {
  var challenge = currentMonthlyChallenge();
  var monthLabel = MONTH_NAMES[challenge.month] || '';
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center;max-width:400px"><div style="font-size:40px;margin-bottom:6px">' + challenge.icon + '</div><h3 style="font-size:18px;margin-bottom:2px">' + monthLabel + ' Pledge</h3><p style="font-size:13px;color:var(--muted);margin-bottom:8px">Write your commitment to complete this month\'s challenge</p><div style="font-size:12px;background:var(--primary-light);padding:8px 10px;border-radius:8px;margin-bottom:8px;line-height:1.5"><strong>Challenge:</strong> ' + challenge.title + '<br><strong>Target:</strong> ' + challenge.targetCount + ' ' + challenge.target + ' entries this month</div><textarea id="pledge-text" placeholder="I, ' + (AUTH_EMAIL||'your name') + ', pledge to complete this challenge because..." style="width:100%;min-height:70px;margin-bottom:8px;resize:vertical">' + (D.monthlyChallenge && D.monthlyChallenge.pledge ? D.monthlyChallenge.pledge : '') + '</textarea><div style="display:flex;gap:8px;justify-content:center"><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()">Cancel</button><button class="btn btn-primary" onclick="saveChallengePledge()">&#9997; Lock In My Pledge</button></div></div>';
  document.body.appendChild(overlay);
  setTimeout(function(){var e=document.getElementById('pledge-text');if(e)e.focus()},200);
}
function saveChallengePledge() {
  var text = document.getElementById('pledge-text');
  if (!text || !text.value.trim()) { alert('Write your pledge before locking it in.'); return; }
  D.monthlyChallenge = D.monthlyChallenge || currentMonthlyChallenge();
  D.monthlyChallenge.pledge = text.value.trim();
  saveData();
  [].forEach.call(document.querySelectorAll('.overlay'),function(el){el.remove()});
  render();
}

// ====== BUDDY MESSAGING ======
function buddySendMessage() {
  var msgInput = document.getElementById('buddy-msg-input');
  if (!msgInput || !msgInput.value.trim()) return;
  var msg = msgInput.value.trim();
  if (!D.messages) D.messages = [];
  D.messages.push({ from: AUTH_EMAIL, to: D.buddy.contact, text: msg, date: new Date().toDateString(), time: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'), timestamp: Date.now() });
  msgInput.value = '';
  saveData();
  // Also save to Firestore
  DB.collection('messages').add({
    from: AUTH_EMAIL, to: D.buddy.contact, text: msg,
    date: new Date().toDateString(),
    time: String(new Date().getHours()).padStart(2,'0')+':'+String(new Date().getMinutes()).padStart(2,'0'),
    timestamp: Date.now()
  }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
  render();
}

function buddyMessagesHTML() {
  var buddyEmail = D.buddy ? D.buddy.contact : '';
  var buddyName = D.buddy ? D.buddy.name : 'Partner';
  var h = '<div class="card"><div style="display:flex;align-items:center;gap:8px;margin-bottom:8px"><div style="font-size:18px">&#x1F4DC;</div><h3 style="margin:0">Scroll of Letters</h3></div><div id="comrade-messages-list">';
  var localMsgs = (D.messages||[]).filter(function(m){return m.from === buddyEmail || m.to === buddyEmail}).slice(-20);
  if (!localMsgs.length) {
    h += '<div class="empty-state">Loading messages...</div>';
  } else {
    h += '<div class="comrade-scroll" id="buddy-messages-list">';
    for (var mi=0;mi<localMsgs.length;mi++) {
      var isMe = localMsgs[mi].from === AUTH_EMAIL;
      h += '<div class="comrade-msg' + (isMe ? ' me' : '') + '">';
      if (!isMe) h += '<div class="msg-author">' + safe(buddyName) + '</div>';
      h += '<div>' + safe(localMsgs[mi].text) + '</div>';
      h += '<div class="msg-date">' + safe(localMsgs[mi].date) + ' ' + safe(localMsgs[mi].time) + '</div></div>';
    }
    h += '</div>';
  }
  h += '</div><div style="display:flex;gap:6px"><input type="text" id="comrade-msg-input" placeholder="Write thy message..." style="flex:1;margin:0"><button class="btn btn-sm btn-primary" onclick="comradeSendMessage()" style="width:auto">Send Raven</button></div></div>';
  // Fetch messages from Firestore (two simple queries  no composite index needed)
  if (buddyEmail) {
    setTimeout(function(){
      var el = document.getElementById('buddy-messages-list');
      if (!el) return;
      Promise.all([
        DB.collection('messages').where('from', '==', AUTH_EMAIL).limit(30).get(),
        DB.collection('messages').where('from', '==', buddyEmail).limit(30).get()
      ]).then(function(results){
        var fireMsgs = [];
        results.forEach(function(snapshot){
          snapshot.forEach(function(doc){
            var d = doc.data();
            // Only keep messages between this user and the buddy
            if ((d.from === AUTH_EMAIL && d.to === buddyEmail) || (d.from === buddyEmail && d.to === AUTH_EMAIL)) {
              fireMsgs.push(d);
            }
          });
        });
        // Merge with local, deduplicate by timestamp+text
        var seen = {};
        localMsgs.concat(fireMsgs).forEach(function(m){ seen[m.timestamp + m.text] = true; });
        var all = [];
        Object.keys(seen).forEach(function(k){
          var found = localMsgs.concat(fireMsgs).filter(function(m){ return m.timestamp + m.text === k; })[0];
          if (found) all.push(found);
        });
        all.sort(function(a,b){ return (a.timestamp||0) - (b.timestamp||0); });
        all = all.slice(-20);
        if (!all.length) {
          el.innerHTML = '<div class="empty-state">Send a raven to ' + safe(D.buddy?D.buddy.name:'your partner') + '!</div>';
          return;
        }
        var html = '<div class="comrade-scroll">';
        for (var i=0;i<all.length;i++) {
          var me = all[i].from === AUTH_EMAIL;
          html += '<div class="comrade-msg' + (me ? ' me' : '') + '">';
          if (!me) html += '<div class="msg-author">' + safe(D.buddy?D.buddy.name:'Partner') + '</div>';
          html += '<div>' + safe(all[i].text) + '</div><div class="msg-date">' + safe(all[i].date) + ' ' + safe(all[i].time) + '</div></div>';
        }
        html += '</div>';
        el.innerHTML = html;
      }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
    }, 500);
  }
  return h;
}

// ====== PROGRESS CHARTS ======
function moodTrendHTML() {
  var h = '<div class="card"><h3>Mood Trend</h3>';
  var recent = D.moods.slice(-14);
  if (!recent.length) { h += '<div class="empty-state">Log moods to see your trend</div></div>'; return h; }
  var colors = ['#ef4444','#f97316','#eab308','#22c55e','#059669'];
  h += '<div class="mood-chart" style="height:60px">';
  for (var i=0;i<recent.length;i++) {
    var pct = (recent[i].val / 5) * 100;
    h += '<div class="mood-bar" style="height:'+pct+'%;background:'+colors[recent[i].val-1]+'"><div class="label" style="font-size:7px">'+(i+1)+'</div></div>';
  }
  h += '</div></div>';
  return h;
}

function sobrietyGridHTML() {
  var h = '<div class="card"><h3>This Week</h3><div style="display:flex;gap:6px;justify-content:center;padding:4px 0">';
  var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var today = new Date();
  for (var i=6;i>=0;i--) {
    var d = new Date(today); d.setDate(d.getDate()-i);
    var ds = d.toDateString();
    var checked = D.checkins.some(function(c){return c.date===ds});
    var isToday = i===0;
    h += '<div style="text-align:center"><div style="width:32px;height:32px;border-radius:8px;background:'+(checked?'var(--primary)':isToday?'var(--primary-light)':'var(--border)')+';display:flex;align-items:center;justify-content:center;font-size:14px;color:'+(checked?'#fff':'var(--muted)')+'">'+(checked?'?':days[(d.getDay()+1)%7][0])+'</div><div style="font-size:9px;color:var(--muted);margin-top:2px">'+days[d.getDay()].substring(0,2)+'</div></div>';
  }
  h += '</div></div>';
  return h;
}

function habitBarsHTML() {
  var h = '<div class="card"><h3>Habit Progress</h3>';
  if (!D.habits.length) { h += '<div class="empty-state">Add habits to track progress</div></div>'; return h; }
  for (var i=0;i<D.habits.length;i++) {
    var streak = calcHabitStreak(D.habits[i]);
    var total = D.habits[i].logs ? D.habits[i].logs.length : 0;
    h += '<div style="margin:6px 0"><div style="display:flex;justify-content:space-between;font-size:12px"><span>' + safe(D.habits[i].name) + '</span><span style="color:var(--muted)">' + streak + ' day streak</span></div><div class="progress-bar"><div class="fill" style="width:' + Math.min(streak/30*100,100) + '%"></div></div></div>';
  }
  h += '</div>';
  return h;
}
// ====== ACHIEVEMENTS PAGE ======
function achievementsHTML() {
  if (!D.achievements) D.achievements = [];
  var h = '<h2 class="page-title">&#127942; '+t('Achievements')+'</h2>';
  h += '<div class="card" style="padding:16px;text-align:center">';
  var unlocked = D.achievements.length;
  var total = ACHIEVEMENTS.length;
  h += '<div style="font-size:11px;color:var(--muted);margin-bottom:10px">' + unlocked + ' / ' + total + ' unlocked</div>';
  if (total > 0) {
    var pct = Math.round(unlocked / total * 100);
    h += '<div style="width:80%;margin:0 auto 12px;height:4px;background:var(--border);border-radius:2px;overflow:hidden">';
    h += '<div style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,#d4a017,#f0c030);border-radius:2px;transition:width .4s"></div></div>';
  }
  h += '</div>';
  var cats = { 'days':'&#128197; Sobriety','journal':'&#128221; Journal','combat':'&#9876; Combat','social':'&#129309; Social','misc':'&#9879; Special' };
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    var done = D.achievements.indexOf(a.id) >= 0;
    var cat = 'misc';
    if (a.id.indexOf('step')>=0||a.id.indexOf('week')>=0||a.id.indexOf('fort')>=0||a.id.indexOf('moon')>=0||a.id.indexOf('season')>=0||a.id.indexOf('half')>=0||a.id.indexOf('year')>=0||a.id.indexOf('iron')>=0||a.id.indexOf('decade')>=0) cat = 'days';
    if (a.id.indexOf('scribe')>=0||a.id.indexOf('chronicler')>=0||a.id.indexOf('entry')>=0) cat = 'journal';
    if (a.id.indexOf('shield')>=0||a.id.indexOf('quest')>=0||a.id.indexOf('stone')>=0||a.id.indexOf('dragon')>=0) cat = 'combat';
    if (a.id.indexOf('comrade')>=0) cat = 'social';
    if (a.id.indexOf('relapse')>=0||a.id.indexOf('crown')>=0) cat = 'misc';
    h += '<div class="card" style="padding:10px 12px;margin:4px 0;display:flex;align-items:center;gap:10px;border-left:3px solid ' + (done ? '#d4a017' : 'var(--border)') + ';opacity:' + (done ? '1' : '.55') + '">';
    h += '<div style="font-size:24px;width:32px;text-align:center">' + (done ? a.icon : '&#9724;') + '</div>';
    h += '<div style="flex:1"><div style="font-size:13px;font-weight:600;color:var(--text)">' + a.title + '</div>';
    h += '<div style="font-size:11px;color:var(--muted)">' + a.desc + '</div></div>';
    h += '<div style="font-size:16px">' + (done ? '&#10003;' : '') + '</div>';
    h += '</div>';
  }
  return h;
}
function showItemPreview(id) {
  var item = null;
  for (var i = 0; i < SHOP_ITEMS.length; i++) { if (SHOP_ITEMS[i].id === id) { item = SHOP_ITEMS[i]; break; } }
  if (!item) return;
  var previewSvg = '';
  var fullDesc = '';
  if (item.id === 'banners') { previewSvg = '<svg viewBox="0 0 100 60" width="100%" height="100"><rect x="10" y="10" width="80" height="40" rx="4" fill="#6a4a2a"/><rect x="12" y="12" width="8" height="20" rx="1" fill="#8a2a2a"/><rect x="80" y="12" width="8" height="20" rx="1" fill="#8a2a2a"/><polygon points="12,10 16,4 20,10" fill="#8a2a2a"/><polygon points="80,10 84,4 88,10" fill="#8a2a2a"/></svg>'; fullDesc = 'Stone banners hang from the keep walls, adding a regal touch to your castle. Each banner bears your realm\u2019s colors.'; }
  else if (item.id === 'tapestry') { previewSvg = '<svg viewBox="0 0 100 60" width="100%" height="100"><rect x="20" y="8" width="60" height="44" rx="4" fill="#4a1a2a" opacity=".8"/><rect x="24" y="12" width="52" height="36" rx="2" fill="none" stroke="#d4a017" stroke-width="1" opacity=".6"/><circle cx="50" cy="30" r="10" fill="#d4a017" opacity=".5"/><circle cx="50" cy="30" r="5" fill="#8a2a2a" opacity=".6"/></svg>'; fullDesc = 'A grand royal tapestry hangs behind the throne, embroidered with your heraldic symbols in gold thread.'; }
  else if (item.id === 'torches') { previewSvg = '<svg viewBox="0 0 100 60" width="100%" height="100"><rect x="38" y="20" width="3" height="15" rx="1" fill="#4a3a2a"/><ellipse cx="39.5" cy="18" rx="4" ry="5" fill="#ff6622" opacity=".8"/><ellipse cx="39.5" cy="19" rx="2.5" ry="3.5" fill="#ffcc00"/><rect x="58" y="20" width="3" height="15" rx="1" fill="#4a3a2a"/><ellipse cx="59.5" cy="18" rx="4" ry="5" fill="#ff6622" opacity=".8"/><ellipse cx="59.5" cy="19" rx="2.5" ry="3.5" fill="#ffcc00"/><rect x="10" y="45" width="80" height="10" rx="2" fill="#6a5a4a" opacity=".5"/></svg>'; fullDesc = 'Animated torch sconces flank the castle door, casting warm light with flickering flame animations.'; }
  else if (item.id === 'paths') { previewSvg = '<svg viewBox="0 0 100 60" width="100%" height="100"><ellipse cx="50" cy="50" rx="40" ry="8" fill="rgba(100,90,80,.4)"/><ellipse cx="30" cy="48" rx="6" ry="3" fill="rgba(120,110,100,.3)"/><ellipse cx="50" cy="50" rx="6" ry="3" fill="rgba(120,110,100,.3)"/><ellipse cx="70" cy="48" rx="6" ry="3" fill="rgba(120,110,100,.3)"/></svg>'; fullDesc = 'A winding cobblestone path leads from the castle gate through the village, decorated with rounded stones.'; }
  else if (item.id === 'flags') { previewSvg = '<svg viewBox="0 0 100 60" width="100%" height="100"><line x1="20" y1="10" x2="20" y2="55" stroke="#6a5a4a" stroke-width="2"/><polygon points="20,10 40,15 20,20" fill="#cc3a3a"/><line x1="50" y1="10" x2="50" y2="55" stroke="#6a5a4a" stroke-width="2"/><polygon points="50,10 70,15 50,20" fill="#cc3a3a"/><line x1="80" y1="15" x2="80" y2="55" stroke="#6a5a4a" stroke-width="1.5"/><polygon points="80,15 92,18 80,21" fill="#aa3a3a"/></svg>'; fullDesc = 'Your personal heraldic banners fly from every tower and wall, announcing your presence to all who approach.'; }
  else if (item.id === 'crimson') { previewSvg = '<svg viewBox="0 0 60 80" width="100%" height="100"><rect x="15" y="15" width="30" height="30" rx="3" fill="#6a0a0a"/><rect x="15" y="15" width="30" height="6" rx="1.5" fill="#f0e8d0"/><rect x="15" y="42" width="30" height="4" rx="1" fill="#f0e8d0"/><circle cx="30" cy="10" r="8" fill="#c89a6a"/><polygon points="24,2 30,0 36,2" fill="#d4a017"/></svg>'; fullDesc = 'Arthur\u2019s robes are dyed a deep crimson red, signaling authority and the blood of dragons past.'; }
  else if (item.id === 'silver') { previewSvg = '<svg viewBox="0 0 60 80" width="100%" height="100"><rect x="15" y="20" width="30" height="35" rx="3" fill="#c0c0c0"/><rect x="15" y="20" width="30" height="5" rx="1.5" fill="#e8e8e8"/><ellipse cx="30" cy="14" rx="8" ry="6" fill="#d4a574"/><circle cx="28" cy="13" r="1" fill="#333"/><circle cx="32" cy="13" r="1" fill="#333"/></svg>'; fullDesc = 'Gertrude\u2019s armor is polished to gleaming silver, reflecting the light like a beacon of resilience.'; }
  else if (item.id === 'starry') { previewSvg = '<svg viewBox="0 0 60 80" width="100%" height="100"><rect x="15" y="25" width="30" height="30" rx="3" fill="#2a1560"/><ellipse cx="30" cy="18" rx="9" ry="7" fill="#c09a7a"/><polygon points="24,10 30,8 36,10" fill="#2a1560"/><circle cx="20" cy="10" r="1" fill="#fff" opacity=".8"/><circle cx="35" cy="7" r="1.2" fill="#fff" opacity=".9"/><circle cx="28" cy="6" r=".8" fill="#fff" opacity=".7"/><circle cx="40" cy="12" r=".6" fill="#fff" opacity=".6"/></svg>'; fullDesc = 'Oswald\u2019s hat transforms into a starry night sky, with twinkling constellations guiding the way.'; }
  else if (item.id === 'streak') { previewSvg = '<svg viewBox="0 0 60 60" width="100%" height="100"><circle cx="30" cy="30" r="24" fill="none" stroke="#d4a017" stroke-width="2" opacity=".5"/><path d="M30,6 L34,24 L52,28 L38,38 L42,56 L30,44 L18,56 L22,38 L8,28 L26,24 Z" fill="#d4a017" opacity=".8"/></svg>'; fullDesc = 'A Streak Shield protects your streak from one relapse. Your days continue as if unaffected \u2014 a safety net for hard days.'; }
  else if (item.id === 'double') { previewSvg = '<svg viewBox="0 0 60 60" width="100%" height="100"><circle cx="20" cy="30" r="16" fill="#d4a017" opacity=".8"/><circle cx="40" cy="30" r="16" fill="#d4a017" opacity=".6"/><text x="30" y="35" text-anchor="middle" font-size="18" font-weight="800" fill="#fff">x2</text></svg>'; fullDesc = 'Double all schillings earned for 24 hours. Every check-in, quest, and milestone pays twice the treasure.'; }
  else if (item.id === 'bonus') { previewSvg = '<svg viewBox="0 0 60 60" width="100%" height="100"><rect x="10" y="10" width="40" height="40" rx="4" fill="#6B4423"/><text x="30" y="38" text-anchor="middle" font-size="22" font-weight="800" fill="#ffd700">+1</text></svg>'; fullDesc = 'Unlock a 4th daily quest slot today only. More quests mean more schillings and faster progress.'; }
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:380px;text-align:center;padding:24px"><div style="font-size:36px;margin-bottom:4px">' + item.icon + '</div><h3 style="font-size:18px;font-weight:700;margin:0 0 2px">' + item.name + '</h3><div style="font-size:11px;color:var(--muted);margin-bottom:12px">' + item.cat + ' &middot; ' + item.cost + ' \u269C</div><div style="background:var(--primary-light);border-radius:12px;padding:12px;margin-bottom:12px">' + previewSvg + '</div><p style="font-size:13px;color:var(--text-light);line-height:1.5;margin-bottom:12px">' + fullDesc + '</p><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="width:100%">'+t('Close')+'</button></div>';
  document.body.appendChild(overlay);
}

function shopHTML() {
  var s = D.shopPurchases||[];var w=getWarchest();var sch=w.schillings||0;var bd=w.boostData||{};
  var activeStr = (bd.streak||0) > 0 ? '<span style="font-size:9px;color:var(--gold)">('+bd.streak+' active)</span>' : '';
  var activeDbl = bd.doubleExpiry > Date.now() ? '<span style="font-size:9px;color:var(--gold)">('+Math.ceil((bd.doubleExpiry-Date.now())/3600000)+'h left)</span>' : '';
  var activeBon = bd.bonusDate === new Date().toDateString() ? '<span style="font-size:9px;color:var(--gold)">(active today)</span>' : '';
  var h='<h2 class="page-title">&#128717; '+t('Shop')+'</h2>';
  h+='<div class="card" style="padding:16px;text-align:center">';
  h+='<div style="font-size:11px;color:var(--muted);margin-bottom:8px">Spend schillings on decor, skins, and boosts</div>';
  h+='<div style="font-size:24px;font-weight:800;color:#d4a017;margin-bottom:10px">'+sch+' \u269C</div>';
  var cats=['Decor','Skins','Boosts'];
  for(var ci=0;ci<cats.length;ci++){
    var cat=cats[ci];
    h+='<div style="font-size:12px;font-weight:700;color:var(--text);margin:8px 0 4px;text-align:left;letter-spacing:1px">'+cat+'</div>';
    for(var i=0;i<SHOP_ITEMS.length;i++){
      var item=SHOP_ITEMS[i];if(item.cat!==cat)continue;
      var owned=s.indexOf(item.id)>=0;
      var isBoost=item.cat==='Boosts';
      var boostStatus='';
      if(isBoost){
        if(item.id==='streak')boostStatus=activeStr;
        else if(item.id==='double')boostStatus=activeDbl;
        else if(item.id==='bonus')boostStatus=activeBon;
      }
      h+='<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;margin:3px 0;border-radius:6px;background:'+((owned&&!isBoost)?'var(--primary-light)':'var(--card)')+';border:1px solid '+((owned&&!isBoost)?'var(--primary)':'var(--border)')+'">';
      h+='<div style="font-size:18px">'+item.icon+'</div>';
      h+='<div style="flex:1;text-align:left;min-width:0"><div style="font-size:11px;font-weight:600">'+item.name+' '+boostStatus+'</div><div style="font-size:9px;color:var(--muted)">'+item.desc+'</div></div>';
      h+='<button class="btn btn-sm" onclick="showItemPreview(\''+item.id+'\')" style="font-size:9px;padding:2px 6px;background:transparent;border:1px solid var(--border);color:var(--muted);cursor:pointer" title="Preview">\uD83D\uDD0D</button>';
      if(owned&&!isBoost){h+='<span style="font-size:10px;color:var(--accent);font-weight:700">\u2713 Owned</span>';}
      else{h+='<button class="btn btn-sm btn-primary" onclick="buyShopItem(\''+item.id+'\')" style="font-size:9px;padding:3px 8px"'+(sch<item.cost?' disabled':'')+'>'+item.cost+' \u269C</button>';}
      h+='</div>';
    }
  }
  h+='<button class="btn btn-outline btn-sm" onclick="goTo(\'warchest\')" style="margin-top:8px">Back to Rewards</button>';
  h+='</div>';return h;
}
function buyShopItem(id) {
  var s=D.shopPurchases||[];
  var item=null;for(var i=0;i<SHOP_ITEMS.length;i++){if(SHOP_ITEMS[i].id===id){item=SHOP_ITEMS[i];break}}
  if(!item)return;var w=getWarchest();var sch=w.schillings||0;
  if(sch<item.cost){alert('Not enough schillings! Need '+item.cost+'.');return;}
  D.warchest.schillings=sch-item.cost;
  // Boost items are consumable — track in boostData, not shopPurchases
  if (id==='streak') { D.warchest.boostData.streak = (D.warchest.boostData.streak||0) + 1; }
  else if (id==='double') { D.warchest.boostData.doubleExpiry = Date.now() + 86400000; }
  else if (id==='bonus') { D.warchest.boostData.bonusDate = new Date().toDateString(); }
  else { D.shopPurchases=D.shopPurchases||[];D.shopPurchases.push(id); }
  saveData();playSound('coin');render();
}
function villageDamage() {
  var el = document.getElementById('village-overlay');
  if (!el) return;
  el.className = el.className.replace(/ damage/g, '') + ' damage';
  setTimeout(function() { if (el) el.className = el.className.replace(' damage', ''); }, 600);
}
function showVillageModal() {
  var days = soberDays();
  var level = villageLevel(days);
  var lnames = ['Abandoned','Fledgling','Growing','Thriving','Flourishing','Prosperous','Legendary','Mythical'];
  var ldescs = ['A desolate ruin...','A single cottage, just beginning','A small settlement taking shape','A thriving community','A beautiful village in full bloom','A prosperous town of renown','A legendary city of song and story','A mythical capital of endless glory'];
  var maxL = lnames.length - 1;
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.id = 'village-modal';
  ov.innerHTML = '<div class="overlay-content" style="max-width:480px;text-align:center;padding:20px"><div style="font-size:13px;color:var(--muted);margin-bottom:2px;letter-spacing:1px">Your Village</div><div style="font-size:22px;font-weight:700;color:var(--primary);margin-bottom:2px">' + lnames[Math.min(level,maxL)] + '</div><div style="font-size:12px;color:var(--text-light);margin-bottom:8px">' + (ldescs[Math.min(level,maxL)]||'') + '</div>' + (days > 0 ? '<div style="font-size:13px;color:var(--muted);margin-bottom:10px">' + days + ' day' + (days!==1?'s':'') + ' of growth</div>' : '') + '<div style="max-width:360px;margin:0 auto 10px">' + villageHTML() + '</div><button class="btn btn-primary btn-sm" onclick="document.getElementById(\'village-modal\').remove()">'+t('Close')+'</button></div>';
  document.body.appendChild(ov);
}
function waxSealSVG(s) {
  var r = s/2;
  return '<svg viewBox="0 0 '+s+' '+s+'" width="'+s+'" height="'+s+'" style="vertical-align:middle"><defs><radialGradient id="wg" cx="38%" cy="32%"><stop offset="0%" stop-color="#c0392b"/><stop offset="55%" stop-color="#922b21"/><stop offset="100%" stop-color="#641e16"/></radialGradient></defs><circle cx="'+r+'" cy="'+r+'" r="'+(r-1)+'" fill="url(#wg)" stroke="#4a120a" stroke-width="1.5"/><circle cx="'+r+'" cy="'+r+'" r="'+(r-4)+'" fill="none" stroke="#e6b800" stroke-width=".6" stroke-dasharray="2.5,2" opacity=".5"/><path d="M'+(r-8)+' '+(r+4)+'V'+(r-6)+'l4 3 4-5 4 5 4-3v'+(r+2)+'z" fill="#f4d03f" opacity=".85"/><rect x="'+(r-8)+'" y="'+(r+4)+'" width="16" height="2" rx="1" fill="#1a5276" opacity=".6"/></svg>';
}
function _rtArthur(cx,isActive){
  var skinTone = '#c89a6a';
  var bodyColor = hasShop('crimson') ? '#6a0a0a' : '#4a1570';
  var crownColor = hasShop('crimson') ? '#cc2222' : '#d4a017';
  var jewelColor = hasShop('crimson') ? '#ff4444' : '#e04040';
  var h='<g class="npc-idle">'+(isActive?'<circle cx="'+cx+'" cy="28" r="19" fill="none" stroke="#ffd700" stroke-width="1.5" opacity=".5"><animate attributeName="opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/></circle>':'');
  h+='<path d="M'+(cx-14)+',20 L'+(cx-14)+',46 L'+(cx+14)+',46 L'+(cx+14)+',20 Z" fill="#3a0a50" opacity=".5" rx="2"/>';
  h+='<rect x="'+(cx-10)+'" y="20" width="20" height="26" rx="3" fill="'+bodyColor+'"/>';
  h+='<rect x="'+(cx-10)+'" y="20" width="20" height="4" rx="1.5" fill="#f0e8d0"/>';
  h+='<rect x="'+(cx-10)+'" y="43" width="20" height="3" rx="1" fill="#f0e8d0"/>';
  for(var ei=0;ei<4;ei++)h+='<rect x="'+(cx-8+ei*5)+'" y="21" width="1.5" height="2" rx=".5" fill="#333" opacity=".4"/>';
  h+='<line x1="'+cx+'" y1="24" x2="'+cx+'" y2="46" stroke="rgba(0,0,0,.12)" stroke-width=".8"/>';
  h+='<path d="M'+(cx-8)+',28 Q'+cx+',33 '+(cx+8)+',28" fill="none" stroke="'+crownColor+'" stroke-width="1.2" opacity=".7"/>';
  h+='<circle cx="'+cx+'" cy="32" r="2" fill="'+crownColor+'"/>';
  h+='<rect x="'+(cx-10)+'" y="33" width="20" height="2" rx="1" fill="rgba(0,0,0,.25)"/>';
  h+='<rect x="'+(cx-2.5)+'" y="32.5" width="5" height="3" rx=".5" fill="'+crownColor+'" opacity=".8"/>';
  h+='<rect x="'+(cx-3)+'" y="14" width="6" height="5" rx="2" fill="'+skinTone+'"/>';
  h+='<circle cx="'+cx+'" cy="10" r="7" fill="'+skinTone+'"/>';
  h+='<circle cx="'+(cx-2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<circle cx="'+(cx+2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<path d="M'+(cx-4.5)+',7 Q'+(cx-2.5)+',6 '+(cx-1)+',7" fill="none" stroke="#333" stroke-width=".6"/>';
  h+='<path d="M'+(cx+1)+',7 Q'+(cx+2.5)+',6 '+(cx+4.5)+',7" fill="none" stroke="#333" stroke-width=".6"/>';
  h+='<path d="M'+(cx-7)+',7 L'+(cx-5)+',0 L'+(cx-2)+',4 L'+cx+',-1 L'+(cx+2)+',4 L'+(cx+5)+',0 L'+(cx+7)+',7 Z" fill="'+crownColor+'" stroke="#b8860b" stroke-width=".5"/>';
  h+='<circle cx="'+cx+'" cy="2" r="1.2" fill="'+jewelColor+'"/>';
  h+='<circle cx="'+(cx-3.5)+'" cy="2" r=".8" fill="#4060e0"/>';
  h+='<circle cx="'+(cx+3.5)+'" cy="2" r=".8" fill="#40e060"/>';
  h+='<rect x="'+(cx-7)+'" y="6" width="14" height="1.5" rx=".5" fill="#b8860b"/>';
  h+='<g class="arthur-larm" style="--a-larm-origin:'+(cx-10)+'px 25px"><path d="M'+(cx-10)+',25 L'+(cx-14)+',38 L'+(cx-13)+',46" fill="none" stroke="'+bodyColor+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx-13)+'" cy="47" rx="3" ry="2" fill="'+skinTone+'"/></g>';
  h+='<g class="arthur-rarm" style="--a-rarm-origin:'+(cx+10)+'px 25px"><path d="M'+(cx+10)+',25 L'+(cx+14)+',38 L'+(cx+13)+',46" fill="none" stroke="'+bodyColor+'" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx+13)+'" cy="47" rx="3" ry="2" fill="'+skinTone+'"/></g>';
  h+='</g>';return h;
}
function _rtGertrude(cx,isActive){
  var skinTone = '#d4a574';
  var armorColor = hasShop('silver') ? '#c0c0c0' : '#4a6a6a';
  var chainColor = hasShop('silver') ? '#d0d0d0' : '#2a5a5a';
  var helmColor = hasShop('silver') ? '#d0d0d0' : '#8a9a9a';
  var visorColor = hasShop('silver') ? '#e0e0e0' : '#6a7a7a';
  var h='<g class="npc-idle'+(isActive?'':' npc-idle-d1')+'">'+(isActive?'<circle cx="'+cx+'" cy="28" r="19" fill="none" stroke="#ffd700" stroke-width="1.5" opacity=".5"><animate attributeName="opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/></circle>':'');
  h+='<rect x="'+(cx-10)+'" y="20" width="20" height="26" rx="3" fill="'+armorColor+'"/>';
  for(var li=0;li<8;li++){h+='<line x1="'+(cx-9)+'" y1="'+(23+li*3)+'" x2="'+(cx+9)+'" y2="'+(23+li*3)+'" stroke="rgba(200,220,220,.15)" stroke-width=".5"/>';h+='<line x1="'+(cx-9+4)+'" y1="'+(24.5+li*3)+'" x2="'+(cx+9-4)+'" y2="'+(24.5+li*3)+'" stroke="rgba(200,220,220,.1)" stroke-width=".5"/>';}
  h+='<rect x="'+(cx-8)+'" y="22" width="16" height="22" rx="2" fill="'+chainColor+'" opacity=".85"/>';
  h+='<path d="M'+(cx-3)+',26 L'+(cx+3)+',26 L'+(cx+3)+',28 L'+(cx+5)+',28 L'+(cx+5)+',34 L'+(cx+3)+',34 L'+(cx+3)+',40 L'+(cx+3+0.5)+',40 L'+(cx+3)+',42 L'+(cx-3)+',42 L'+(cx-3)+',40 L'+(cx-3-0.5)+',40 L'+(cx-3)+',34 L'+(cx-5)+',34 L'+(cx-5)+',28 L'+(cx-3)+',28 Z" fill="#d4a017" opacity=".8"/>';
  h+='<rect x="'+(cx-8)+'" y="33" width="16" height="2" rx="1" fill="#8B4513"/>';
  h+='<rect x="'+(cx-2)+'" y="32.5" width="4" height="3" rx=".5" fill="#d4a017" opacity=".8"/>';
  h+='<rect x="'+(cx-3)+'" y="14" width="6" height="5" rx="2" fill="'+skinTone+'"/>';
  h+='<circle cx="'+cx+'" cy="10" r="7" fill="'+skinTone+'"/>';
  h+='<circle cx="'+(cx-2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<circle cx="'+(cx+2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<path d="M'+(cx-4.5)+',7 Q'+(cx-2.5)+',6 '+(cx-1)+',7" fill="none" stroke="#333" stroke-width=".6"/>';
  h+='<path d="M'+(cx+1)+',7 Q'+(cx+2.5)+',6 '+(cx+4.5)+',7" fill="none" stroke="#333" stroke-width=".6"/>';
  h+='<path d="M'+(cx-8)+',7 Q'+cx+',-4 '+(cx+8)+',7 Q'+cx+',12 '+(cx-8)+',7 Z" fill="'+helmColor+'"/>';
  h+='<path d="M'+(cx-5)+',6 Q'+cx+',8 '+(cx+5)+',6" fill="none" stroke="#2a2a2a" stroke-width="1.2"/>';
  h+='<path d="M'+cx+',-1 L'+cx+',10" stroke="'+visorColor+'" stroke-width="1.5"/>';
  h+='<line x1="'+cx+'" y1="3" x2="'+cx+'" y2="8" stroke="'+visorColor+'" stroke-width="1.2"/>';
  h+='<path d="M'+(cx-9)+',14 L'+(cx+9)+',14 L'+(cx+7)+',17 L'+(cx-7)+',17 Z" fill="'+armorColor+'"/>';
  h+='<g class="gertrude-larm" style="--g-larm-origin:'+(cx-10)+'px 23px"><path d="M'+(cx-10)+',23 L'+(cx-13)+',36 L'+(cx-12)+',45" fill="none" stroke="'+armorColor+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx-12)+'" cy="46" rx="3.5" ry="2.5" fill="'+helmColor+'"/></g>';
  h+='<g class="gertrude-rarm" style="--g-rarm-origin:'+(cx+10)+'px 23px"><path d="M'+(cx+10)+',23 L'+(cx+13)+',36 L'+(cx+12)+',45" fill="none" stroke="'+armorColor+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx+12)+'" cy="46" rx="3.5" ry="2.5" fill="'+helmColor+'"/></g>';
  h+='</g>';return h;
}
function _rtOswald(cx,isActive){
  var skinTone = '#c09a7a';
  var robeColor = hasShop('starry') ? '#0a0a5a' : '#2a1560';
  var hatColor = hasShop('starry') ? '#0a0a3a' : '#1a0a3a';
  var starColor = hasShop('starry') ? '#aaaaff' : '#ffd700';
  var orbGlow = hasShop('starry') ? '#6666ff' : '#8a6af0';
  var h='<g class="npc-idle'+(isActive?'':' npc-idle-d2')+'">'+(isActive?'<circle cx="'+cx+'" cy="28" r="19" fill="none" stroke="#ffd700" stroke-width="1.5" opacity=".5"><animate attributeName="opacity" values=".3;.7;.3" dur="2s" repeatCount="indefinite"/></circle>':'');
  h+='<rect x="'+(cx-10)+'" y="20" width="20" height="26" rx="3" fill="'+robeColor+'"/>';
  h+='<rect x="'+(cx-10)+'" y="20" width="20" height="3" rx="1.5" fill="#4a2590"/>';
  if (hasShop('starry')) {
    for (var sti=0;sti<3;sti++) h+='<circle cx="'+(cx-6+sti*6)+'" cy="'+(25+sti*8)+'" r=".8" fill="'+starColor+'" opacity=".6" style="animation:windowGlow 1.5s ease-in-out infinite;animation-delay:'+(sti*0.5)+'s"/>';
  } else {
    h+='<text x="'+(cx-5)+'" y="30" font-size="3" fill="'+starColor+'" opacity=".6">\u2726</text>';
    h+='<text x="'+(cx+3)+'" y="28" font-size="2.5" fill="'+starColor+'" opacity=".5">\u2727</text>';
    h+='<text x="'+(cx-4)+'" y="39" font-size="2.5" fill="'+starColor+'" opacity=".4">\u2727</text>';
    h+='<text x="'+(cx+4)+'" y="40" font-size="3" fill="'+starColor+'" opacity=".6">\u2726</text>';
  }
  h+='<line x1="'+cx+'" y1="23" x2="'+cx+'" y2="46" stroke="rgba(255,255,255,.08)" stroke-width=".8"/>';
  h+='<rect x="'+(cx-10)+'" y="33" width="20" height="2" rx="1" fill="#1a0a3a"/>';
  h+='<rect x="'+(cx-2.5)+'" y="32.5" width="5" height="3" rx=".5" fill="#d4a017" opacity=".6"/>';
  h+='<rect x="'+(cx-3)+'" y="14" width="6" height="5" rx="2" fill="'+skinTone+'"/>';
  h+='<circle cx="'+cx+'" cy="10" r="7" fill="'+skinTone+'"/>';
  h+='<path d="M'+(cx-4)+',12 L'+(cx-5)+',18 L'+(cx-2)+',16 L'+cx+',19 L'+(cx+2)+',16 L'+(cx+5)+',18 L'+(cx+4)+',12 Z" fill="#f0e8e0"/>';
  h+='<circle cx="'+(cx-2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<circle cx="'+(cx+2.5)+'" cy="9" r="1" fill="#333"/>';
  h+='<path d="M'+(cx-5)+',7 Q'+(cx-2.5)+',5.5 '+(cx-1)+',7" fill="none" stroke="#e0d8d0" stroke-width=".8"/>';
  h+='<path d="M'+(cx+1)+',7 Q'+(cx+2.5)+',5.5 '+(cx+4.5)+',7" fill="none" stroke="#e0d8d0" stroke-width=".8"/>';
  h+='<polygon points="'+(cx-9)+',7 '+cx+',-6 '+(cx+9)+',7" fill="'+hatColor+'"/>';
  h+='<path d="M'+(cx-10)+',7 Q'+cx+',10 '+(cx+10)+',7" fill="none" stroke="'+hatColor+'" stroke-width="2.5"/>';
  h+='<rect x="'+(cx-8)+'" y="5.5" width="16" height="1.5" rx=".5" fill="#d4a017"/>';
  if (hasShop('starry')) {
    h+='<circle cx="'+(cx-6)+'" cy="1" r="1" fill="#fff" opacity=".7" style="animation:windowGlow 2s ease-in-out infinite"/>';
    h+='<circle cx="'+(cx+5)+'" cy="-2" r=".8" fill="#88bbff" opacity=".6" style="animation:windowGlow 1.5s ease-in-out infinite .3s"/>';
    h+='<circle cx="'+(cx+2)+'" cy="3" r=".6" fill="#ffaaff" opacity=".5" style="animation:windowGlow 1.8s ease-in-out infinite .7s"/>';
    h+='<circle cx="'+(cx-3)+'" cy="-3" r=".7" fill="#aaffff" opacity=".5" style="animation:windowGlow 2.2s ease-in-out infinite .5s"/>';
  } else {
    h+='<text x="'+(cx-4)+'" y="2" font-size="3" fill="'+starColor+'" opacity=".7">\u2726</text>';
    h+='<text x="'+(cx+2)+'" y="0" font-size="2.5" fill="'+starColor+'" opacity=".6">\u2727</text>';
  }
  h+='<line x1="'+(cx+15)+'" y1="18" x2="'+(cx+15)+'" y2="55" stroke="#6B3410" stroke-width="2"/>';
  h+='<circle cx="'+(cx+15)+'" cy="17" r="2.5" fill="'+orbGlow+'" opacity=".8"><animate attributeName="r" values="2.2;2.8;2.2" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;.9;.6" dur="3s" repeatCount="indefinite"/></circle>';
  h+='<circle cx="'+(cx+15)+'" cy="17" r="1.2" fill="#c0b0ff" opacity=".9"/>';
  if(isActive)h+='<circle cx="'+(cx+15)+'" cy="17" r="5" fill="'+orbGlow+'" opacity=".15"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/></circle>';
  h+='<g class="oswald-larm" style="--o-larm-origin:'+(cx-10)+'px 25px"><path d="M'+(cx-10)+',25 L'+(cx-13)+',38 L'+(cx-12)+',46" fill="none" stroke="'+robeColor+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx-12)+'" cy="47" rx="3" ry="2" fill="'+skinTone+'"/></g>';
  h+='<g class="oswald-rarm" style="--o-rarm-origin:'+(cx+10)+'px 25px"><path d="M'+(cx+10)+',25 L'+(cx+14)+',36 L'+(cx+15)+',44" fill="none" stroke="'+robeColor+'" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="'+(cx+15)+'" cy="45" rx="3" ry="2" fill="'+skinTone+'"/></g>';
  h+='</g>';return h;
}
function _npcStandalone(name){
  var svg = '<svg viewBox="0 0 40 60" style="width:80px;height:120px;display:block;margin:0 auto">';
  svg += '<defs><style>.npc-idle-d1{animation-delay:.4s}.npc-idle-d2{animation-delay:1.2s}</style></defs>';
  if(name==='Arthur')svg+=_rtArthur(20,true);
  else if(name==='Gertrude')svg+=_rtGertrude(20,true);
  else svg+=_rtOswald(20,true);
  svg += '</svg>';
  return svg;
}
function roundTableHTML() {
  var chars = [
    {name:'Arthur',body:'#4a1570',skin:'#c89a6a',msgs:[
       "I've been watching your patterns. You're showing up more. That's the data that matters.",
       "I notice you've been logging regularly. Every entry makes the picture clearer.",
       "Your consistency is building a reliable trend. Keep feeding me data and I'll keep finding insights.",
       "Journal entries are up. Mood tracking is steady. The numbers don't lie \u2014 you're doing the work.",
       "I cross-referenced your check-ins and habits. Clear pattern: showing up daily builds momentum.",
       "Gertrude tells me your boundaries are holding strong. That aligns with what I'm seeing in the data.",
       "Oswald mentioned you've been reflecting more. That depth shows in your journaling frequency.",
       "You and Gertrude both logged strong check-ins yesterday. Her shield discipline is rubbing off on you."
      ]},
    {name:'Gertrude',body:'#2a5a5a',skin:'#d4a574',msgs:[
       "You're ready. You've got your tools. Today, nothing gets through.",
       "You've faced harder days than this and held firm. Today's no different.",
       "Your safety plan is solid. You've prepared for this. Trust yourself.",
       "Another day, another win. You don't need to win every fight \u2014 just this one.",
       "I've seen your strength. You're tougher than whatever\u2019s in your way today.",
       "Arthur showed me your streak data. Consistent. That's the mark of a warrior.",
       "Oswald told me you had a tough moment and worked through it. That's what real courage looks like.",
       "The numbers Arthur tracks and the wisdom Oswald shares \u2014 both point to the same truth: you're growing."
      ]},
    {name:'Oswald',body:'#2a1560',skin:'#c09a7a',msgs:[
       "The road might twist, but you've walked through shadow before and come out the other side. Trust your steps.",
       "Every day of recovery adds to your strength. You're building something real.",
       "Look back and see how far you've come. That's not luck \u2014 that's you.",
       "The mist clears day by day. What felt impossible is now just your normal rhythm.",
       "You carry wisdom you didn't have a month ago. Every struggle taught you something. That knowledge is your staff.",
       "Gertrude is right to be proud of your defenses. But I see something deeper \u2014 you're learning when to lower them too.",
       "Arthur and I were discussing your progress. The data tells one story, but your journal tells the real one.",
       "I overheard Arthur telling Gertrude about your consistency. Even the strategist is impressed."
      ]}
  ];
  var dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(),0,0)) / 86400000);
  var activeIdx = dayOfYear % chars.length;
  var dayMod = Math.floor(dayOfYear / chars.length);
  var h = '<div class="card" style="padding:12px 14px">';
  h += '<div style="font-size:11px;color:var(--muted);letter-spacing:1px;text-align:center;margin-bottom:8px;font-family:Georgia,serif">\u2767 The Support Circle \u2767</div>';

  // Table scene SVG
  var xOffsets = [38, 91, 144]; // horizontal centers for each figure
  h += '<div style="text-align:center;margin-bottom:4px">';
  h += '<svg viewBox="0 0 210 100" style="width:100%;max-width:280px;height:auto">';
  h += '<defs><style>.npc-idle-d1{animation-delay:.4s}.npc-idle-d2{animation-delay:1.2s}</style></defs>';

  // Chair backs (behind figures)
  for (var i = 0; i < chars.length; i++) {
    var cx = xOffsets[i];
    h += '<rect x="' + (cx - 11) + '" y="16" width="22" height="34" rx="4" fill="#3a2010"/>';
    h += '<rect x="' + (cx - 11) + '" y="16" width="22" height="4" rx="2" fill="#4a3020"/>';
    h += '<line x1="' + (cx - 6) + '" y1="20" x2="' + (cx - 6) + '" y2="46" stroke="#2a1000" stroke-width=".6" opacity=".4"/>';
    h += '<line x1="' + cx + '" y1="20" x2="' + cx + '" y2="46" stroke="#2a1000" stroke-width=".6" opacity=".4"/>';
    h += '<line x1="' + (cx + 6) + '" y1="20" x2="' + (cx + 6) + '" y2="46" stroke="#2a1000" stroke-width=".6" opacity=".4"/>';
  }

  // Figures
  for (var i = 0; i < chars.length; i++) {
    var cx = xOffsets[i];
    if (i === 0) h += _rtArthur(cx, i === activeIdx);
    else if (i === 1) h += _rtGertrude(cx, i === activeIdx);
    else h += _rtOswald(cx, i === activeIdx);
  }

  // Tabletop
  h += '<rect x="8" y="48" width="194" height="7" rx="2" fill="#8B4513"/>';
  h += '<rect x="8" y="48" width="194" height="3" rx="1" fill="#A0522D"/>';
  h += '<rect x="16" y="55" width="5" height="22" fill="#6B3410"/>';
  h += '<rect x="189" y="55" width="5" height="22" fill="#6B3410"/>';

  // Chair seats and legs (below table)
  for (var i = 0; i < chars.length; i++) {
    var cx = xOffsets[i];
    h += '<rect x="' + (cx - 12) + '" y="54" width="24" height="3" rx="1" fill="#4a3020"/>';
    h += '<rect x="' + (cx - 11) + '" y="57" width="3" height="16" rx=".5" fill="#3a2010"/>';
    h += '<rect x="' + (cx + 8) + '" y="57" width="3" height="16" rx=".5" fill="#3a2010"/>';
  }

  // Legs below table
  for (var i = 0; i < chars.length; i++) {
    var c = chars[i];
    var cx = xOffsets[i];
    if (i === 1) {
      h += '<rect x="' + (cx - 5) + '" y="55" width="4" height="10" rx="1" fill="#6a7a7a" opacity=".7"/>';
      h += '<rect x="' + (cx + 1) + '" y="55" width="4" height="10" rx="1" fill="#6a7a7a" opacity=".7"/>';
    } else {
      h += '<rect x="' + (cx - 5) + '" y="55" width="4" height="10" rx="1" fill="' + c.body + '" opacity=".6"/>';
      h += '<rect x="' + (cx + 1) + '" y="55" width="4" height="10" rx="1" fill="' + c.body + '" opacity=".6"/>';
    }
    h += '<ellipse cx="' + (cx - 3) + '" cy="66" rx="3" ry="1.5" fill="#2a1a0a"/>';
    h += '<ellipse cx="' + (cx + 3) + '" cy="66" rx="3" ry="1.5" fill="#2a1a0a"/>';
  }

  // Candle on table (center)
  h += '<rect x="103" y="42" width="3" height="7" rx=".5" fill="#f5f5dc"/>';
  h += '<rect x="102" y="48" width="5" height="2" rx=".5" fill="#d4a574"/>';
  h += '<circle cx="104.5" cy="41" r="2.5" fill="#ff8c00" opacity=".8"><animate attributeName="r" values="2.5;2.8;2.5" dur="1.8s" repeatCount="indefinite"/></circle>';
  h += '<circle cx="104.5" cy="41" r="5" fill="#ff8c00" opacity=".15"><animate attributeName="r" values="5;6;5" dur="1.8s" repeatCount="indefinite"/></circle>';

  h += '</svg></div>';

  // Names row
  h += '<div style="display:flex;justify-content:center;gap:24px;margin-bottom:6px">';
  for (var i = 0; i < chars.length; i++) {
    var c = chars[i];
    var isActive = i === activeIdx;
    h += '<div style="font-size:10px;color:var(--' + (isActive ? 'primary' : 'muted') + ');font-weight:' + (isActive ? '700' : '400') + ';cursor:pointer" onclick="showCharacterLore(\'' + c.name + '\')" title="Learn about ' + c.name + '">' + c.name + '</div>';
  }
  h += '</div>';

  // Conversation mode: every 3rd day, show a cross-character exchange
  var isConvoDay = Math.floor(dayOfYear / chars.length) % 3 === 2;
  var pick = chars[activeIdx];
  var msg = pick.msgs[dayMod % pick.msgs.length];
  var hr = new Date().getHours();
  var timeWord = hr < 12 ? 'morning' : hr < 17 ? 'afternoon' : 'evening';
  var rank = getRank(soberDays());

  if (isConvoDay) {
    var responderIdx = (activeIdx + 1) % chars.length;
    var responder = chars[responderIdx];
    var respMsgs = [
      "I couldn't have said it better myself.",
      "That's exactly right. I was just thinking the same.",
      "Listen to them \u2014 they speak truth.",
      "Hear, hear! The realm is stronger when we speak as one.",
      "I'll stand by that counsel. It's served many before you."
    ];
    var respMsg = respMsgs[dayMod % respMsgs.length];
    h += '<div style="text-align:center;margin-bottom:6px">';
    h += '<div style="display:inline-block;background:var(--primary-light);border-radius:12px 12px 12px 2px;padding:8px 12px;margin-bottom:4px;max-width:90%">';
    h += '<div style="font-size:10px;font-weight:700;color:var(--primary);margin-bottom:2px">' + pick.name + '</div>';
    h += '<div style="font-size:12px;line-height:1.4;font-style:italic;color:var(--text-light)">' + msg + '</div>';
    h += '</div>';
    h += '<div style="display:inline-block;background:var(--card);border:1px solid var(--border);border-radius:12px 12px 2px 12px;padding:8px 12px;max-width:90%">';
    h += '<div style="font-size:10px;font-weight:700;color:var(--accent);margin-bottom:2px">' + responder.name + '</div>';
    h += '<div style="font-size:12px;line-height:1.4;font-style:italic;color:var(--text-light)">' + respMsg + '</div>';
    h += '</div>';
    h += '</div>';
  } else {
    h += '<div style="font-size:11px;color:var(--muted);margin-bottom:2px;text-align:center">Good ' + timeWord + ' from <strong style="color:var(--primary);cursor:pointer" onclick="showCharacterLore(\'' + pick.name + '\')" title="Learn about ' + pick.name + '">' + pick.name + '</strong> \u2014 to ' + _rankIconHTML(rank.title, 13) + ' ' + rank.title + '</div>';
    h += '<div style="font-size:13px;line-height:1.5;text-align:center;font-style:italic;color:var(--text-light)">' + msg + '</div>';
  }
  h += '<div style="font-size:7px;color:var(--muted);text-align:center;margin-top:6px;opacity:.4;letter-spacing:1px">tap a name above to learn their story</div>';
  h += '</div>';
  return h;
}

var HERALDIC_CHARGES = [
  {id:'none',label:'None',svg:''},
  {id:'lion',label:'Lion',svg:'<path d="M30 16c-2-2-2-6 0-9l2-1c1-2 3-4 6-5 2 1 5 3 6 5l2 1c2 3 1 7 0 9l-2 1-1 4h-2l-1-3h-2l-1 3h-2l-1-4-2-1z" fill="currentColor" transform="translate(28, 10) scale(.8)"/>'},
  {id:'eagle',label:'Eagle',svg:'<path d="M36 26c2-4 7-7 10-9l2 2c-2 3-4 5-6 7l1 2h-3l-1-2c-2-2-4-4-6-7l2-2c3 2 8 5 10 9z" fill="currentColor" transform="translate(28, 12)"/><path d="M42 18c0-2 2-4 3-4s3 2 3 4-2 4-3 4-3-2-3-4z" fill="currentColor" transform="translate(28, 12)"/>'},
  {id:'sword',label:'Sword',svg:'<path d="M48 5L38 26h3l2-5 3 5h3L48 5z" fill="currentColor" transform="translate(10, 8)"/><rect x="46" y="27" width="3" height="3" rx="1" fill="currentColor" transform="translate(10, 8)"/>'},
  {id:'crown',label:'Crown',svg:'<path d="M36 22v-7l3 2 3-5 3 5 3-2v7z" fill="currentColor" transform="translate(10, 10)"/><rect x="35" y="23" width="12" height="2" rx=".5" fill="currentColor" transform="translate(10, 10)"/>'},
  {id:'star',label:'Star',svg:'<polygon points="40,6 43,14 52,14 45,19 48,28 40,22 32,28 35,19 28,14 37,14" fill="currentColor" transform="translate(10, 6)"/>'},
  {id:'tower',label:'Tower',svg:'<rect x="38" y="12" width="10" height="18" fill="currentColor" transform="translate(10, 6)"/><rect x="36" y="10" width="14" height="3" fill="currentColor" transform="translate(10, 6)"/><rect x="40" y="15" width="2" height="3" fill="rgba(0,0,0,.2)" transform="translate(10, 6)"/><rect x="44" y="15" width="2" height="3" fill="rgba(0,0,0,.2)" transform="translate(10, 6)"/><rect x="38" y="20" width="10" height="10" fill="rgba(0,0,0,.15)" transform="translate(10, 6)"/>'},
  {id:'tree',label:'Tree',svg:'<path d="M45 10c-5 0-8 6-6 11h12c2-5-1-11-6-11z" fill="currentColor" transform="translate(10, 8)"/><rect x="44" y="21" width="3" height="8" fill="currentColor" transform="translate(10, 8)"/>'},
  {id:'cross',label:'Cross',svg:'<path d="M40 8v6h-6v3h6v10h3V17h6v-3h-6V8z" fill="currentColor" transform="translate(10, 6)"/>'},
  {id:'rose',label:'Rose',svg:'<circle cx="45" cy="38" r="6" fill="currentColor" transform="translate(10, 6)"/><circle cx="45" cy="38" r="4" fill="rgba(0,0,0,.15)" transform="translate(10, 6)"/><circle cx="45" cy="38" r="1.5" fill="currentColor" transform="translate(10, 6)"/><path d="M42 46c2 2 4 2 6 0" fill="none" stroke="currentColor" stroke-width="1" transform="translate(10, 6)"/>'},
  {id:'keys',label:'Keys',svg:'<circle cx="42" cy="32" r="4" fill="none" stroke="currentColor" stroke-width="1.5" transform="translate(10, 6)"/><line x1="46" y1="32" x2="56" y2="22" stroke="currentColor" stroke-width="1.5" transform="translate(10, 6)"/><line x1="51" y1="27" x2="57" y2="22" stroke="currentColor" stroke-width="1.5" transform="translate(10, 6)"/><circle cx="42" cy="32" r=".5" fill="currentColor" transform="translate(10, 6)"/>'},
  {id:'dragon',label:'Dragon',svg:'<path d="M34 20c2-3 5-6 8-7l3 2c-2 3-3 6-5 7l1 2h-3l-1-2c-2 1-3 1-4 0l1-2zm8-3c0-2 1-2 3-1" fill="currentColor" transform="translate(10, 8)"/>'}
];
var HERALDIC_DIVISIONS = [
  {id:'plain',label:'Plain',svg:''},
  {id:'band',label:'Bend',svg:'<path d="M15,90 L40,8 L80,8 L55,90 Z" opacity=".55"/>'},
  {id:'cross',label:'Cross',svg:'<rect x="54" y="8" width="12" height="122" opacity=".55"/><rect x="15" y="57" width="90" height="12" opacity=".55"/>'},
  {id:'chevron',label:'Chevron',svg:'<path d="M15,95 L60,40 L105,95 L90,105 L60,58 L30,105 Z" opacity=".55"/>'},
  {id:'pale',label:'Pale',svg:'<rect x="44" y="8" width="32" height="122" opacity=".55"/>'},
  {id:'fess',label:'Fess',svg:'<rect x="15" y="52" width="90" height="22" opacity=".55"/>'}
];
var HERALDIC_COLORS = [
  {id:'leather',field:'#8B6B4A',trim:'#A08060',label:'Leather'},
  {id:'azure',field:'#2D5A7A',trim:'#4A8ABA',label:'Azure'},
  {id:'crimson',field:'#8A2A2A',trim:'#AA5A5A',label:'Crimson'},
  {id:'royal',field:'#5B21B6',trim:'#8B51D6',label:'Royal'},
  {id:'forest',field:'#2D6A3A',trim:'#5A8A5A',label:'Forest'},
  {id:'charcoal',field:'#3A3A4A',trim:'#6A6A7A',label:'Charcoal'},
  {id:'golden',field:'#8A7A3A',trim:'#AA9A5A',label:'Golden'},
  {id:'iron',field:'#6A6A6A',trim:'#9A9A9A',label:'Iron'}
];

