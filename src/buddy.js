
// ====== PAIRING SYSTEM ======
var PAIRING_STORAGE_KEY = 'rc_buddies';
var randomPartnerTimer = null;
var randomPartnerInFlight = false;
var randomPartnerCancelled = false;
var randomPartnerTimeout = null;
var randomPartnerStartedAt = 0;
var randomPartnerRestorePending = false;
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
      finishPairing({name:data.requestName || 'Your partner',language:data.requestLanguage || ''},data.consumedBy,code);
    });
  }).catch(function(e){ if (result) result.textContent = e && e.message ? e.message : 'Could not accept this request. Try again.'; });
}

function checkPendingPairing() {
  if (!D.buddy || !D.buddy.pending || !D.buddy.inviteCode || !DB) return;
  DB.collection('pairingCodes').doc(D.buddy.inviteCode).get().then(function(doc){
    var data = doc.exists ? doc.data() : null;
    if (data && data.accepted && data.acceptedBy === D.buddy.contact) {
      var buddy = {name:data.name || D.buddy.name,language:data.language || D.buddy.language || ''};
      finishPairing(buddy,data.ownerEmail,D.buddy.inviteCode);
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

function finishPairing(match, email, partnershipCode) {
  if (!email || email === AUTH_EMAIL) {
    showToast('That is your own invite code. Share it with someone you trust.', 'warning');
    return;
  }
  D.buddy = { name: match.name || 'Your partner', contact: email, relationship: 'Accountability Partner (paired)', language: match.language || (D.language || 'English'), paired: true, partnershipCode:partnershipCode || (D.buddy && D.buddy.partnershipCode) || '' };
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

function requestRandomPartner(action, extra) {
  var user = firebase && firebase.auth && firebase.auth().currentUser;
  if (!user || !SUPABASE_MATCH_URL || !SUPABASE_PUBLISHABLE_KEY) return Promise.reject(new Error('Sign in before looking for a partner.'));
  return user.getIdToken().then(function(token) {
    return fetch(SUPABASE_MATCH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'apikey': SUPABASE_PUBLISHABLE_KEY },
      body: JSON.stringify(Object.assign({ action: action, name: D.name || AUTH_USER || 'Re.Claim member', language: D.language || 'English' }, extra || {}))
    });
  }).then(function(response) {
    return response.json().catch(function() { return {}; }).then(function(data) {
      if (!response.ok) {
        var error = new Error(data && data.error || 'Partner matching could not be completed.');
        error.status = response.status;
        throw error;
      }
      return data;
    });
  });
}

function partnerRequestErrorMessage(error, fallback) {
  if (error && error.status === 401) return 'Your sign-in expired. Sign out and sign back in, then try again.';
  if (error && error.status === 403) return 'Partner matching is unavailable for this account right now. Try again later.';
  if (error && error.status === 409) return 'Your account already has an active partner search or connection. Refresh the Partner page and check its status.';
  if (error && error.status === 429) return 'Too many search attempts. Wait a moment, then try again.';
  if (error && error.status >= 500) return 'Partner matching is temporarily unavailable. Check your connection and try again shortly.';
  if (error && error.status === 400) return 'Partner matching could not process this request. Refresh the Partner page and try again.';
  if (error instanceof TypeError) return 'Could not connect to partner matching. Check your internet connection and try again.';
  return fallback || 'Partner matching could not be completed. Please try again.';
}

function setRandomPartnerStatus(message, canRetry) {
  var status = document.getElementById('random-partner-status');
  if (status) status.textContent = message;
  var retry = document.getElementById('random-partner-retry');
  if (retry) retry.style.display = canRetry ? '' : 'none';
}

function retryRandomPartnerSearch() {
  setRandomPartnerStatus('Retrying partner search…');
  findRandomPartner();
}

function showRandomPartnerMatch(result) {
  if (!result || !result.matched || !result.partner || !result.partnershipCode) return false;
  if (randomPartnerTimer) { clearInterval(randomPartnerTimer); randomPartnerTimer = null; }
  if (randomPartnerTimeout) { clearTimeout(randomPartnerTimeout); randomPartnerTimeout = null; }
  randomPartnerInFlight = false;
  try { sessionStorage.removeItem('reclaimPartnerSearchActive'); } catch(e) {}
  finishPairing(result.partner, result.partner.email, result.partnershipCode);
  showToast('You were matched with ' + (result.partner.name || 'a Re.Claim member') + '.', 'success');
  return true;
}

function checkRandomPartnerSearch() {
  if (randomPartnerInFlight || !AUTH_EMAIL) return;
  randomPartnerInFlight = true;
  requestRandomPartner('search', getPartnerMatchPreferences())
    .then(function(result) {
      if (randomPartnerCancelled) return;
      if (showRandomPartnerMatch(result)) return;
      if (result && result.waiting) setRandomPartnerStatus('You’re in the opt-in matching pool. We’ll connect you when another member is available. Keep this page open while you wait.');
      else setRandomPartnerStatus('Still looking for an available partner…');
    })
    .catch(function(error) {
      console.warn('Could not search for a partner:', error);
      var message = partnerRequestErrorMessage(error, 'Could not reach partner matching. Check your connection and try again.');
      setRandomPartnerStatus(message, true);
      if (error && error.status === 409) { resetRandomPartnerControls(); if (randomPartnerTimer) { clearInterval(randomPartnerTimer); randomPartnerTimer = null; } if (randomPartnerTimeout) { clearTimeout(randomPartnerTimeout); randomPartnerTimeout = null; } }
    })
    .then(function() { randomPartnerInFlight = false; });
}

function findRandomPartner() {
  if (buddyIsPaired(D.buddy)) { setRandomPartnerStatus('You already have a connected partner. End that connection before finding another.'); return; }
  if (!AUTH_EMAIL) { setRandomPartnerStatus('Sign in before looking for a partner.'); return; }
  var start = document.getElementById('random-partner-btn');
  if (start) { start.disabled = true; start.textContent = 'Finding…'; }
  randomPartnerCancelled = false;
  randomPartnerStartedAt = Date.now();
  setRandomPartnerStatus('Joining the opt-in matching pool…');
  requestRandomPartner('search', getPartnerMatchPreferences())
    .then(function(result) {
      if (randomPartnerCancelled) return;
      if (showRandomPartnerMatch(result)) return;
      setRandomPartnerStatus('You’re in the opt-in matching pool. We’ll connect you when another member is available. Keep this page open while you wait.');
      try { sessionStorage.setItem('reclaimPartnerSearchActive', '1'); } catch(e) {}
      if (start) { start.textContent = 'Searching for a partner…'; start.style.display = 'none'; }
      var cancel = document.getElementById('random-partner-cancel');
      if (cancel) cancel.style.display = '';
      if (!randomPartnerTimer) randomPartnerTimer = setInterval(checkRandomPartnerSearch, 6000);
      if (randomPartnerTimeout) clearTimeout(randomPartnerTimeout);
      randomPartnerTimeout = setTimeout(function() { cancelRandomPartnerSearch('Your search ended after 15 minutes. You can start again any time.'); }, Math.max(0, 15 * 60 * 1000 - (Date.now() - randomPartnerStartedAt)));
    })
    .catch(function(error) {
      console.warn('Could not start partner matching:', error);
      var message = partnerRequestErrorMessage(error, 'Could not start partner matching. Check your connection and try again.');
      setRandomPartnerStatus(message, true);
      if (start) { start.disabled = false; start.textContent = 'Find a Partner'; }
    });
}

function restoreRandomPartnerSearch() {
  if (!AUTH_EMAIL || buddyIsPaired(D.buddy) || randomPartnerRestorePending || randomPartnerTimer) return;
  var active = false;
  try { active = sessionStorage.getItem('reclaimPartnerSearchActive') === '1'; } catch(e) {}
  if (!active) return;
  randomPartnerRestorePending = true;
  randomPartnerCancelled = false;
  randomPartnerStartedAt = Date.now();
  setRandomPartnerStatus('Checking your existing partner search…');
  requestRandomPartner('search', getPartnerMatchPreferences()).then(function(result) {
    if (showRandomPartnerMatch(result)) {
      try { sessionStorage.removeItem('reclaimPartnerSearchActive'); } catch(e) {}
      return;
    }
    setRandomPartnerStatus('You’re still in the matching pool. We’ll connect you when another member is available.');
    var start = document.getElementById('random-partner-btn');
    var cancel = document.getElementById('random-partner-cancel');
    if (start) { start.textContent = 'Searching for a partner…'; start.style.display = 'none'; }
    if (cancel) cancel.style.display = '';
    if (!randomPartnerTimer) randomPartnerTimer = setInterval(checkRandomPartnerSearch, 6000);
  }).catch(function(error) {
    console.warn('Could not restore partner search:', error);
    setRandomPartnerStatus(partnerRequestErrorMessage(error, 'Could not reconnect to your partner search.'), true);
    try { sessionStorage.removeItem('reclaimPartnerSearchActive'); } catch(e) {}
  }).then(function() { randomPartnerRestorePending = false; });
}

function cancelRandomPartnerSearch(endMessage) {
  randomPartnerCancelled = true;
  if (randomPartnerTimer) { clearInterval(randomPartnerTimer); randomPartnerTimer = null; }
  if (randomPartnerTimeout) { clearTimeout(randomPartnerTimeout); randomPartnerTimeout = null; }
  requestRandomPartner('cancel').then(function(result) {
    try { sessionStorage.removeItem('reclaimPartnerSearchActive'); } catch(e) {}
    if (result && result.match) { showRandomPartnerMatch(result.match); return; }
    var start = document.getElementById('random-partner-btn');
    var cancel = document.getElementById('random-partner-cancel');
    if (start) { start.disabled = false; start.textContent = 'Find a Partner'; start.style.display = ''; }
    if (cancel) cancel.style.display = 'none';
    setRandomPartnerStatus(endMessage || 'Your search has been cancelled. You can start again any time.');
  }).catch(function() {
    resetRandomPartnerControls();
    setRandomPartnerStatus('Could not reach partner matching. Your search may still be active; check your connection, then retry or cancel the search.', true);
  });
}

function getPartnerMatchPreferences() {
  var lang = document.getElementById('random-partner-language');
  var time = document.getElementById('random-partner-availability');
  var prefs = D.partnerMatchPrefs || {};
  return {
    preferredLanguage: lang ? lang.value : (prefs.language || 'Any language'),
    availability: time ? time.value : (prefs.availability || 'Any time')
  };
}

function savePartnerMatchPreference(key, value) {
  if (!D.partnerMatchPrefs) D.partnerMatchPrefs = { language: 'Any language', availability: 'Any time' };
  D.partnerMatchPrefs[key] = value;
  saveData();
}

function resetRandomPartnerControls() {
  var start = document.getElementById('random-partner-btn');
  var cancel = document.getElementById('random-partner-cancel');
  if (start) { start.disabled = false; start.textContent = 'Find a Partner'; start.style.display = ''; }
  if (cancel) cancel.style.display = 'none';
}


var _partnerReportAdminEmailChecked = "";
var _partnerReportAdminCheckPending = false;
var _partnerReportAdmin = false;
var _partnerReportRows = [];

function checkPartnerReportAdmin() {
  var slot = document.getElementById('partner-report-admin-tools');
  if (!slot || !AUTH_EMAIL) return;
  if (_partnerReportAdminEmailChecked === AUTH_EMAIL) {
    if (_partnerReportAdmin) slot.innerHTML = '<div class="card"><h3>Safety report review</h3><p style="font-size:13px;color:var(--muted)">Review reports submitted by partner-system users.</p><button class="btn btn-outline btn-sm" onclick="showPartnerReports()">Open report inbox</button></div>';
    return;
  }
  if (_partnerReportAdminCheckPending) return;
  _partnerReportAdminCheckPending = true;
  requestRandomPartner('admin_check').then(function(result) {
    _partnerReportAdminEmailChecked = AUTH_EMAIL;
    _partnerReportAdmin = !!(result && result.isAdmin);
    var currentSlot = document.getElementById('partner-report-admin-tools');
    if (currentSlot && _partnerReportAdmin) currentSlot.innerHTML = '<div class="card"><h3>Safety report review</h3><p style="font-size:13px;color:var(--muted)">Review reports submitted by partner-system users.</p><button class="btn btn-outline btn-sm" onclick="showPartnerReports()">Open report inbox</button></div>';
  }).catch(function(error) {
    console.warn('Could not check report review access:', error);
  }).then(function() { _partnerReportAdminCheckPending = false; });
}

function showPartnerReports() {
  if (!_partnerReportAdmin) { showToast('You do not have access to review safety reports.', 'warning'); return; }
  var overlay = document.getElementById('partner-report-inbox');
  if (!overlay) { overlay = document.createElement('div'); overlay.className = 'overlay'; overlay.id = 'partner-report-inbox'; document.body.appendChild(overlay); }
  overlay.innerHTML = '<div class="overlay-content" style="max-width:620px;max-height:85vh;overflow:auto"><h3 style="font-size:18px;margin-bottom:6px">Partner safety reports</h3><p style="font-size:12px;color:var(--muted)">Manual review inbox. Reports are not monitored in real time.</p><div id="partner-report-list" class="empty-state">Loading reports…</div><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:8px">Close</button></div>';
  requestRandomPartner('admin_list_reports').then(function(result) {
    renderPartnerReportList(overlay, result && Array.isArray(result.reports) ? result.reports : []);
  }).catch(function(error) {
    var list = document.getElementById('partner-report-list');
    if (list) list.textContent = error && error.message ? error.message : 'Could not load the reports. Check your connection and try again.';
  });
}

function renderPartnerReportList(overlay, reports) {
  if (!overlay || !overlay.isConnected) return;
  _partnerReportRows = reports;
  var list = overlay.querySelector('#partner-report-list');
  if (!list) return;
  if (!reports.length) { list.textContent = 'No partner reports have been submitted.'; return; }
  var labels = { harassment: 'Harassment or unwanted contact', spam: 'Spam or scam', inappropriate: 'Inappropriate content', safety: 'User feels unsafe', other: 'Other concern' };
  var statuses = [['new','New'],['in_review','In review'],['action_taken','Action taken'],['closed','Closed']];
  var html = '';
  reports.forEach(function(report, index) {
    var created = report.createdAt ? new Date(report.createdAt) : null;
    var dateLabel = created && !isNaN(created.getTime()) ? created.toLocaleString() : 'Date unavailable';
    var options = statuses.map(function(item) { return '<option value="'+item[0]+'"'+(report.status === item[0] ? ' selected' : '')+'>'+item[1]+'</option>'; }).join('');
    html += '<div class="card" style="text-align:left"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><strong>'+safe(labels[report.category] || 'Other concern')+'</strong><span style="font-size:11px;color:var(--muted)">'+safe(dateLabel)+'</span></div><div style="font-size:12px;color:var(--muted);margin:6px 0">Reporter: '+safe(report.reporterEmail || 'Not recorded on older report')+'<br>Reported account: '+safe(report.reportedEmail || 'Not recorded on older report')+'<br>Connection: '+safe(report.partnershipCode || 'Unavailable')+'</div><label class="form-label" for="partner-report-status-'+index+'">Review status</label><select id="partner-report-status-'+index+'" style="width:100%;margin-bottom:6px">'+options+'</select><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-primary btn-sm" onclick="savePartnerReportStatus('+index+',this)">Save status</button>'+(report.reporterEmail ? '<button class="btn btn-outline btn-sm" onclick="emailPartnerReporter('+index+')">Email reporter</button>' : '')+'</div>'+(report.reviewedBy ? '<div style="font-size:10px;color:var(--muted);margin-top:5px">Last updated by '+safe(report.reviewedBy)+'</div>' : '')+'</div>';
  });
  list.innerHTML = html;
}

function emailPartnerReporter(index) {
  var report = _partnerReportRows[index];
  if (!report || !report.reporterEmail) return;
  var subject = encodeURIComponent('Re.Claim partner safety report follow-up');
  window.location.href = 'mailto:' + encodeURIComponent(report.reporterEmail) + '?subject=' + subject;
}

function savePartnerReportStatus(index, button) {
  var report = _partnerReportRows[index];
  var select = document.getElementById('partner-report-status-' + index);
  if (!report || !select) return;
  if (button) { button.disabled = true; button.textContent = 'Saving…'; }
  requestRandomPartner('admin_update_report', { reportId: report.id, status: select.value }).then(function(result) {
    if (!result || !result.updated) throw new Error('That report could not be found. Refresh the inbox and try again.');
    showToast('Report status updated.', 'success');
    showPartnerReports();
  }).catch(function(error) {
    if (button) { button.disabled = false; button.textContent = 'Save status'; }
    showToast(error && error.message ? error.message : 'Could not update the report. Try again.', 'error');
  });
}

function showPartnerSafetyOptions() {
  if (!buddyIsPaired(D.buddy) || !D.buddy.partnershipCode) {
    showToast('Safety controls are available for a current connected partner. Reconnect using a new invite if this is an older connection.', 'warning');
    return;
  }
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="max-width:420px"><h3 style="font-size:18px;margin-bottom:6px">Report or block partner</h3><p style="font-size:13px;color:var(--muted);line-height:1.5">A report sends the selected reason and both account emails to an authorized Re.Claim administrator for review. Reports are not monitored in real time.</p><label class="form-label" for="partner-report-category">What happened?</label><select id="partner-report-category" style="width:100%;margin-bottom:10px"><option value="harassment">Harassment or unwanted contact</option><option value="spam">Spam or scam</option><option value="inappropriate">Inappropriate content</option><option value="safety">I feel unsafe</option><option value="other">Other concern</option></select><button class="btn btn-primary" onclick="submitPartnerReport(false,this)">Send report</button><button class="btn btn-danger" onclick="submitPartnerReport(true,this)" style="margin-top:6px">Report and block</button><button class="btn btn-outline" onclick="blockCurrentPartner()" style="margin-top:6px">Block without reporting</button><button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="margin-top:6px">Cancel</button></div>';
  document.body.appendChild(overlay);
}

function currentPartnerSafetyPayload() {
  return { targetEmail: D.buddy && D.buddy.contact, partnershipCode: D.buddy && D.buddy.partnershipCode };
}

function finishBlockingCurrentPartner() {
  var former = D.buddy || {};
  var email = former.contact || '';
  D.blockedPartners = Array.isArray(D.blockedPartners) ? D.blockedPartners : [];
  if (email && !D.blockedPartners.some(function(item) { return item.email === email; })) {
    D.blockedPartners.push({ email: email, name: former.name || 'Former partner', blockedAt: Date.now() });
  }
  D.pairedBuddies = Array.isArray(D.pairedBuddies) ? D.pairedBuddies : [];
  D.pairedBuddies.push({ name: former.name || 'Former partner', email: email, endedAt: Date.now(), blocked: true });
  D._partnerDisconnectNotice = { name: former.name || 'Former partner', when: Date.now(), blocked: true };
  D.buddy = null;
  _endingPartnershipCode = '';
  stopBuddyMessaging();
  if (AUTH_EMAIL && DB) DB.collection('progress').doc(AUTH_EMAIL).delete().catch(function(error) { console.warn('Could not withdraw shared progress:', error); });
  _pageCache = {};
  saveData();
  showToast('Partner blocked. They will not be matched with you again.', 'success');
}

function submitPartnerReport(blockToo, button) {
  if (!buddyIsPaired(D.buddy)) return;
  if (button) { button.disabled = true; button.textContent = 'Sending…'; }
  var payload = currentPartnerSafetyPayload();
  payload.category = document.getElementById('partner-report-category') ? document.getElementById('partner-report-category').value : 'other';
  payload.block = blockToo === true;
  requestRandomPartner('report', payload).then(function(result) {
    var overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    if (result && result.blocked) finishBlockingCurrentPartner();
    else showToast('Report sent to Re.Claim for review.', 'success');
  }).catch(function(error) {
    if (button) { button.disabled = false; button.textContent = blockToo ? 'Report and block' : 'Send report'; }
    showToast(error && error.message ? error.message : 'Could not send the report. Try again when connected.', 'error');
  });
}

function blockCurrentPartner() {
  if (!buddyIsPaired(D.buddy)) return;
  if (!confirm('Block ' + (D.buddy.name || 'this partner') + ' and end the connection? You will not be matched with this account again.')) return;
  var payload = currentPartnerSafetyPayload();
  requestRandomPartner('block', payload).then(function() {
    var overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
    finishBlockingCurrentPartner();
  }).catch(function(error) {
    showToast(error && error.message ? error.message : 'Could not block this partner. Try again when connected.', 'error');
  });
}


function unblockPartnerAt(index) {
  var items = Array.isArray(D.blockedPartners) ? D.blockedPartners : [];
  var blocked = items[index];
  if (!blocked || !blocked.email) return;
  requestRandomPartner('unblock', { targetEmail: blocked.email }).then(function() {
    D.blockedPartners.splice(index, 1);
    saveData();
    showToast('Partner unblocked.', 'success');
  }).catch(function(error) {
    showToast(error && error.message ? error.message : 'Could not unblock this account. Try again when connected.', 'error');
  });
}
