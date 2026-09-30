
// ====== PAIRING SYSTEM ======
var PAIRING_STORAGE_KEY = 'rc_buddies';
function esc(s) { return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/'/g,'&#39;').replace(/"/g,'&quot;').replace(/\\/g,'&#92;'); }


function getRegisteredBuddies() {
  try { return JSON.parse(localStorage.getItem(PAIRING_STORAGE_KEY)) || []; } catch(e) { return []; }
}
function saveRegisteredBuddies(list) {
  localStorage.setItem(PAIRING_STORAGE_KEY, JSON.stringify(list));
}
function buddyIsPaired(buddy) {
  if (!buddy || !buddy.contact) return false;
  return buddy.paired === true || /\(paired\)/i.test(buddy.relationship || '');
}

function registerCurrentUser() {
  var list = getRegisteredBuddies();
  var idx = list.findIndex(function(b){return b.email === AUTH_EMAIL});
  var entry = { name: D.name || AUTH_USER, email: AUTH_EMAIL, language: D.language || 'English', joinDate: Date.now() };
  if (idx >= 0) list[idx] = entry;
  else list.push(entry);
  saveRegisteredBuddies(list);
  // Keep the local list for existing installs; never publish account profiles.
}
function generatePairingCode() {
  var result = document.getElementById('pairing-result');
  if (!AUTH_EMAIL || !DB) {
    if (result) result.textContent = 'Sign in and reconnect to the internet before creating an invite code.';
    return;
  }
  registerCurrentUser();
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  if (!window.crypto || !window.crypto.getRandomValues) {
    if (result) result.textContent = 'Secure invite codes are not available in this browser.';
    return;
  }
  var bytes = new Uint8Array(8);
  window.crypto.getRandomValues(bytes);
  var code = '';
  for (var i=0;i<bytes.length;i++) code += chars[bytes[i] % chars.length];
  var lang = D.language || 'English';
  if (result) result.textContent = 'Creating your invite code…';
  var expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  DB.collection('pairingCodes').doc(code).set({ code: code, ownerEmail: AUTH_EMAIL, name: D.name || 'Re.Claim member', language: lang, expiresAt: firebase.firestore.Timestamp.fromDate(expiresAt), consumed: false }).then(function(){
    localStorage.setItem('rc_pair_code', code);
    if (!result) return;
    result.innerHTML = '<div class="pairing-code-result"><p>Share this code directly with someone you trust. It expires in 24 hours.</p><strong class="pairing-code-value">' + esc(code) + '</strong><button class="btn btn-outline btn-sm" type="button" onclick="copyPairingCode(\'' + code + '\',this)">Copy code</button></div>';
  }).catch(function(e){
    console.warn('Could not create invite code:', e);
    if (result) result.textContent = 'Could not create an invite code. Check your connection and try again.';
  });
}
function copyPairingCode(code, button) {
  if (!navigator.clipboard || !navigator.clipboard.writeText) {
    showToast('Copy is not available here. Select and copy the code.', 'warning');
    return;
  }
  navigator.clipboard.writeText(code).then(function(){
    if (button) button.textContent = 'Copied';
    showToast('Invite code copied.', 'success');
  }).catch(function(){ showToast('Could not copy the code. Select it and copy manually.', 'warning'); });
}
function connectPairingCode() {
  var input = document.getElementById('pairing-code');
  var result = document.getElementById('pairing-result');
  var button = document.getElementById('pairing-connect-btn');
  var code = input ? input.value.trim().toUpperCase().replace(/[^A-Z0-9]/g,'') : '';
  if (code.length < 6 || code.length > 8) { if (result) result.textContent = 'Enter the 6–8 character invite code.'; if (input) input.focus(); return; }
  if (!AUTH_EMAIL || !DB) { if (result) result.textContent = 'Sign in and reconnect to the internet before connecting.'; return; }
  if (button) { button.disabled = true; button.textContent = 'Connecting…'; }
  if (result) result.textContent = 'Checking this invite code…';
  DB.collection('pairingCodes').doc(code).get()
    .then(function(doc){
      var data = doc.exists ? (doc.data() || {}) : null;
      var expiry = data && data.expiresAt && typeof data.expiresAt.toMillis === 'function' ? data.expiresAt.toMillis() : 0;
      if (data && data.ownerEmail !== AUTH_EMAIL && !data.consumed && expiry > Date.now()) {
        return DB.collection('pairingCodes').doc(code).update({consumed:true,consumedBy:AUTH_EMAIL,consumedAt:firebase.firestore.FieldValue.serverTimestamp(),requestName:D.name || 'Re.Claim member',requestLanguage:D.language || 'English'})
          .then(function(){
            D.buddy = { name:data.name || 'Your partner', contact:data.ownerEmail, relationship:'Invite request pending', language:data.language || '', paired:false, pending:true, inviteCode:code };
            saveData();
            if (result) result.textContent = 'Request sent. Your partner must accept it from their Partner page before messaging or sharing can start.';
            if (button) { button.disabled = false; button.textContent = 'Connect'; }
            if (typeof render === 'function') render();
          });
      }
      if (result) result.textContent = 'No active invite matches that code. Check it with the person who shared it.';
      if (button) { button.disabled = false; button.textContent = 'Connect'; }
    })
    .catch(function(e){
      console.warn('Could not check invite code:', e);
      if (result) result.textContent = 'Could not check the invite code. Check your connection and try again.';
      if (button) { button.disabled = false; button.textContent = 'Connect'; }
    });
}

function checkPairingRequest() {
  var code = localStorage.getItem('rc_pair_code');
  var result = document.getElementById('pairing-result');
  if (!code || !AUTH_EMAIL || !DB) { if (result) result.textContent = 'Create an invite code on this account first.'; return; }
  if (result) result.textContent = 'Checking your invite…';
  DB.collection('pairingCodes').doc(code).get().then(function(doc){
    var data = doc.exists ? doc.data() : null;
    if (!data || !data.consumed || !data.consumedBy) { if (result) result.textContent = 'No one has requested to connect yet.'; return; }
    if (data.withdrawn) { if (result) result.textContent = 'The person withdrew their request.'; return; }
    if (data.accepted) { if (result) result.textContent = 'This invite has already been accepted.'; return; }
    if (result) result.innerHTML = '<div class="partner-code-result"><p><strong>' + safe(data.requestName || 'Someone') + '</strong> wants to connect with you. Accept only if you recognize them.</p><button class="btn btn-primary btn-sm" onclick="acceptPairingRequest(\'' + code + '\')">Accept request</button></div>';
  }).catch(function(){ if (result) result.textContent = 'Could not check your invite. Check your connection and try again.'; });
}

function acceptPairingRequest(code) {
  var result = document.getElementById('pairing-result');
  DB.collection('pairingCodes').doc(code).get().then(function(doc){
    var data = doc.exists ? doc.data() : null;
    if (!data || data.ownerEmail !== AUTH_EMAIL || !data.consumedBy || data.accepted) throw new Error('This request is no longer available.');
    return DB.collection('pairingCodes').doc(code).update({accepted:true,acceptedBy:AUTH_EMAIL,acceptedAt:firebase.firestore.FieldValue.serverTimestamp()}).then(function(){
      finishPairing({name:data.requestName || 'Your partner',language:data.requestLanguage || ''},data.consumedBy);
    });
  }).catch(function(e){ if (result) result.textContent = e && e.message ? e.message : 'Could not accept this request. Try again.'; });
}

function checkPendingPairing() {
  if (!D.buddy || !D.buddy.pending || !D.buddy.inviteCode || !DB) return;
  DB.collection('pairingCodes').doc(D.buddy.inviteCode).get().then(function(doc){
    var data = doc.exists ? doc.data() : null;
    if (data && data.accepted && data.acceptedBy === D.buddy.contact) {
      var buddy = {name:data.name || D.buddy.name,language:data.language || D.buddy.language || ''};
      finishPairing(buddy,data.ownerEmail);
      showToast('Your partner accepted. Messaging and progress sharing are ready.', 'success');
    } else if (data && data.expiresAt && data.expiresAt.toMillis && data.expiresAt.toMillis() < Date.now()) {
      D.buddy.pending = false;
      D.buddy.relationship = 'Invite expired';
      D.buddy.inviteCode = '';
      saveData();
      render();
    }
  }).catch(function(){ showToast('Could not check the request. Try again when online.', 'warning'); });
}

function cancelPairingRequest() {
  var code = D.buddy && D.buddy.inviteCode;
  if (code && DB) DB.collection('pairingCodes').doc(code).update({withdrawn:true}).catch(function(){});
  removeBuddy();
}

function finishPairing(match, email) {
  if (!email || email === AUTH_EMAIL) {
    showToast('That is your own invite code. Share it with someone you trust.', 'warning');
    return;
  }
  D.buddy = { name: match.name || 'Your partner', contact: email, relationship: 'Accountability Partner (paired)', language: match.language || (D.language || 'English'), paired: true };
  var pairedList = D.pairedBuddies || [];
  if (!pairedList.some(function(p){return p.email === email})) {
    pairedList.push({ name: match.name || 'Your partner', email: email, language: match.language || (D.language || 'English'), pairedDate: Date.now() });
    D.pairedBuddies = pairedList;
  }
saveData();
  if (typeof startBuddyMessaging === 'function') startBuddyMessaging();
  var result = document.getElementById('pairing-result');
  if (result) result.innerHTML = '<div style="font-size:13px;color:var(--primary);font-weight:600">Connected with ' + safe(match.name) + ' from ' + safe(match.language || 'your language') + '! You can now support each other.</div>';
  var input = document.getElementById('pairing-code');
  if (input) input.value = '';
  if (typeof render === 'function') render();
}
