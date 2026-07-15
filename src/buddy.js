
// ====== PAIRING SYSTEM ======
var PAIRING_STORAGE_KEY = 'rc_buddies';
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/\\/g,'&#92;'); }


function getRegisteredBuddies() {
  try { return JSON.parse(localStorage.getItem(PAIRING_STORAGE_KEY)) || []; } catch(e) { return []; }
}
function saveRegisteredBuddies(list) {
  localStorage.setItem(PAIRING_STORAGE_KEY, JSON.stringify(list));
}

function fetchGlobalBuddies(callback) {
  if (!firebase || !firebase.auth().currentUser) { callback(null); return; }
  DB.collection('users').limit(100).get()
    .then(function(snapshot){
      var list = [];
      snapshot.forEach(function(doc){ list.push(doc.data()); });
      callback(list);
    })
    .catch(function(){callback(null)});
}

function syncToGlobal(entry) {
  if (!firebase || !firebase.auth().currentUser) return;
  DB.collection('users').doc(AUTH_EMAIL).set(entry).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}

function registerCurrentUser() {
  var list = getRegisteredBuddies();
  var idx = list.findIndex(function(b){return b.email === AUTH_EMAIL});
  var entry = { name: D.name || AUTH_USER, email: AUTH_EMAIL, phoneNumber: D.phoneNumber || '', language: D.language || 'English', joinDate: Date.now() };
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  saveRegisteredBuddies(list);
  // Force token refresh before Firestore write to ensure auth is propagated
  var cur = firebase.auth().currentUser;
  if (cur) {
    cur.getIdToken(true).then(function(){ syncToGlobal(entry); }).catch(function(){ syncToGlobal(entry); });
  } else {
    syncToGlobal(entry);
  }
}
function generatePairingCode() {
  registerCurrentUser();
  var code = '';
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (var i=0;i<6;i++) code += chars[Math.floor(Math.random() * chars.length)];
  var lang = D.language || 'English';
  var shareBtn = (navigator.share ? '<button class="btn btn-sm btn-primary" onclick="navigator.share({title:\'Re.Claim comrade code\',text:\'Connect with me on Re.Claim! My pairing code: ' + code + ' (Language: ' + lang.replace(/'/g,"\\'") + ')\'}).catch(function(e){ console.warn(e) })" style="margin-top:4px;width:auto;margin-right:4px">Share</button>' : '');
  document.getElementById('pairing-result').innerHTML = '<div style="background:var(--primary-light);padding:12px;border-radius:10px;text-align:center"><div style="font-size:11px;color:var(--muted);margin-bottom:4px">Share this code with your comrade anywhere in the world:</div><div style="font-size:32px;font-weight:900;color:var(--primary);letter-spacing:6px">' + esc(code) + '</div><div style="font-size:11px;color:var(--muted);margin-top:4px">Your language: <strong>' + esc(lang) + '</strong></div><div style="margin-top:6px;display:flex;gap:6px;justify-content:center;flex-wrap:wrap">' + shareBtn + '<button class="btn btn-sm btn-outline" onclick="navigator.clipboard.writeText(\'' + code + '\');this.textContent=\'Copied!\'" style="width:auto">Copy Code</button></div></div>';
  // Save code globally
  DB.collection('pairingCodes').doc(AUTH_EMAIL).set({ code: code }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}
function connectPairingCode() {
  var input = document.getElementById('pairing-code');
  if (!input || !input.value.trim()) { alert(t('Enter a pairing code.')); return; }
  var code = input.value.trim().toUpperCase();
  var list = getRegisteredBuddies();
  var allCodes = JSON.parse(localStorage.getItem('rc_pairing_codes') || '{}');
  var matchEmail = null;
  // Check local storage first
  for (var e in allCodes) {
    if (allCodes[e] === code && e !== AUTH_EMAIL) { matchEmail = e; break; }
  }
  if (matchEmail) {
    var match = list.find(function(b){return b.email === matchEmail});
    if (match) { finishPairing(match, matchEmail); return; }
    // Try Firestore for full user info
    DB.collection('users').doc(matchEmail).get().then(function(doc){
      if (doc.exists) finishPairing(doc.data(), matchEmail);
    });
    return;
  }
  // Query Firestore for matching pairing code
  DB.collection('pairingCodes').where('code', '==', code).get()
    .then(function(snapshot){
      var foundBuddy = null;
      snapshot.forEach(function(doc){
        if (doc.id !== AUTH_EMAIL) foundBuddy = { email: doc.id };
      });
      if (foundBuddy) {
        DB.collection('users').doc(foundBuddy.email).get().then(function(userDoc){
          if (userDoc.exists) finishPairing(userDoc.data(), foundBuddy.email);
        });
        return;
      }
      // Code not found  save this one for a comrade to match
      allCodes[AUTH_EMAIL] = code;
      localStorage.setItem('rc_pairing_codes', JSON.stringify(allCodes));
      DB.collection('pairingCodes').doc(AUTH_EMAIL).set({ code: code }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
      registerCurrentUser();
      document.getElementById('pairing-result').innerHTML = '<div style="font-size:13px;color:var(--muted)">Code saved and shared globally! Share it with your comrade anywhere in the world.</div>';
    })
    .catch(function(){
      // Offline fallback
      allCodes[AUTH_EMAIL] = code;
      localStorage.setItem('rc_pairing_codes', JSON.stringify(allCodes));
      registerCurrentUser();
      document.getElementById('pairing-result').innerHTML = '<div style="font-size:13px;color:var(--muted)">Code saved locally! Share it with your comrade.</div>';
    });
}

function finishPairing(match, email) {
  D.buddy = { name: match.name, contact: email, relationship: 'Accountability Partner (paired)', language: match.language || (D.language || 'English') };
  var pairedList = D.pairedBuddies || [];
  if (!pairedList.some(function(p){return p.email === email})) {
    pairedList.push({ name: match.name, email: email, language: match.language || (D.language || 'English'), pairedDate: Date.now() });
    D.pairedBuddies = pairedList;
  }
  saveData();
  var result = document.getElementById('pairing-result');
  if (result) result.innerHTML = '<div style="font-size:13px;color:var(--primary);font-weight:600">Connected with ' + safe(match.name) + ' from ' + safe(match.language || 'your language') + '! You can now support each other.</div>';
  var input = document.getElementById('pairing-code');
  if (input) input.value = '';
}
function connectToBuddy(email) {
  var list = getRegisteredBuddies();
  var match = list.find(function(b){return b.email === email});
  if (match) { finishPairing(match, email); return; }
  // Try Firestore
  DB.collection('users').doc(email).get().then(function(doc){
    if (doc.exists) { finishPairing(doc.data(), email); return; }
    alert(t('Comrade not found. Make sure they have registered by visiting the Comrade page.'));
  }).catch(function(){alert(t('Could not reach global directory. Try again later.'))});
}

function findBuddyAuto() {
  if (!AUTH_EMAIL) { alert(t('Sign in to find a comrade.')); return; }
  var btn = event && event.target ? event.target : document.getElementById('find-buddy-btn');
  if (btn) { btn.textContent = 'Searching...'; btn.disabled = true; }
  var lang = D.language || 'English';
  DB.collection('users').where('language','==',lang).limit(50).get().then(function(snapshot){
    var available = [];
    snapshot.forEach(function(doc){
      if (doc.id !== AUTH_EMAIL) available.push(doc.data());
    });
    if (btn) { btn.textContent = 'Find Me a comrade'; btn.disabled = false; }
    if (!available.length) {
      var el = document.getElementById('auto-buddy-result');
      if (el) el.innerHTML = '<div style="text-align:center;padding:12px;background:var(--primary-light);border-radius:10px"><div style="font-size:12px;color:var(--muted)">No available comrades in <strong>' + lang + '</strong> right now. Try generating a pairing code to invite someone!</div></div>';
      return;
    }
    var pick = available[Math.floor(Math.random() * available.length)];
    finishPairing(pick, pick.email);
    var el = document.getElementById('auto-buddy-result');
    if (el) el.innerHTML = '<div style="text-align:center;padding:12px;background:var(--primary-light);border-radius:10px;border:2px solid var(--primary)"><div style="font-size:24px;margin-bottom:4px">&#129309;</div><div style="font-weight:700;font-size:15px;color:var(--primary)">Connected with ' + safe(pick.name) + '!</div><div style="font-size:12px;color:var(--muted)">You can support each other on your recovery journey.</div><button class="btn btn-sm btn-primary" onclick="goTo(\'buddy\')" style="margin-top:6px">Go to Buddy Page</button></div>';
  }).catch(function(){
    if (btn) { btn.textContent = 'Find Me a comrade'; btn.disabled = false; }
    var el = document.getElementById('auto-buddy-result');
    if (el) el.innerHTML = '<div style="text-align:center;padding:12px;background:var(--danger-bg);border-radius:10px;font-size:12px;color:var(--danger)">Could not reach the buddy directory. Check your connection.</div>';
  });
}

