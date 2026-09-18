// ====== TWO-STEP LOGIN (Firebase Multi-Factor Authentication, Phone/SMS) ======
// Everything is guarded: if the project or SDK doesn't support MFA yet,
// these helpers simply report "not available" instead of throwing.

function mfaSupported() {
  return !!(firebase && firebase.auth && firebase.auth.PhoneMultiFactorGenerator && firebase.auth.PhoneAuthProvider && firebase.auth.RecaptchaVerifier);
}
function mfaEnrolledHints() {
  var u = firebase && firebase.auth().currentUser;
  if (!u || !u.multiFactor || !u.multiFactor.enrolledFactors) return [];
  return u.multiFactor.enrolledFactors;
}
function mfaPhoneDisplay(hint) {
  return hint && hint.phoneNumber ? hint.phoneNumber : (t('Phone') || 'Phone');
}
function friendlyMfaError(e) {
  var m = (e && e.message) || t('Something went wrong.');
  if (m.indexOf('auth/invalid-verification-code') !== -1) return t('That code was not correct.');
  if (m.indexOf('auth/phone-number-invalid') !== -1) return t('That phone number looks invalid.');
  if (m.indexOf('auth/quota-exceeded') !== -1) return t('SMS quota exceeded. Try again later or check billing.');
  if (m.indexOf('auth/captcha-check-failed') !== -1 || m.indexOf('auth/recaptcha') !== -1) return t('Robot check failed. Please try again.');
  if (m.indexOf('auth/email-already-in-use') !== -1) return t('This email is already registered.');
  if (m.indexOf('auth/too-many-requests') !== -1) return t('Too many attempts. Please try again later.');
  return m;
}

// ====== ENROLLMENT ======
var _mfaEnrollVerificationId = null;
function setupMfaOverlay() {
  if (!mfaSupported()) { alert(t('Two-step login is not available yet.')); return; }
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="overlay-content" style="max-width:360px;text-align:center">'
    + '<h3 style="font-size:18px;font-weight:700;margin-bottom:4px">&#128241; '+t('Two-Step Login')+'</h3>'
    + '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">'+t('Once set up, we text a code to this number every time you sign in with your password.')+'</p>'
    + '<input id="mfa-phone" type="tel" placeholder="+1 555 123 4567" style="text-align:center;font-size:15px;margin-bottom:8px">'
    + '<div id="mfa-recaptcha"></div>'
    + '<div id="mfa-msg" style="font-size:12px;color:var(--danger);margin:6px 0;display:none"></div>'
    + '<div style="display:flex;gap:6px;margin-top:6px">'
    + '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="flex:1">'+t('Cancel')+'</button>'
    + '<button class="btn btn-primary btn-sm" id="mfa-send-btn" onclick="mfaStartEnroll()" style="flex:1">'+t('Send Code')+'</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ var inp = document.getElementById('mfa-phone'); if (inp) inp.focus(); }, 100);
}
async function mfaStartEnroll() {
  var phone = (document.getElementById('mfa-phone').value || '').trim();
  var msg = document.getElementById('mfa-msg');
  var btn = document.getElementById('mfa-send-btn');
  if (!/^\+?[0-9][0-9\s\-()]{6,15}$/.test(phone)) {
    if (msg) { msg.style.display = 'block'; msg.textContent = t('Enter a phone number with country code, e.g. +14155551234.'); }
    return;
  }
  if (btn) { btn.disabled = true; btn.textContent = t('Sending...'); }
  if (msg) msg.style.display = 'none';
  try {
    var user = firebase.auth().currentUser;
    var session = await user.multiFactor.getSession();
    var verifier = new firebase.auth.RecaptchaVerifier('mfa-recaptcha', { size: 'invisible' });
    var phoneInfoOptions = { phoneNumber: phone.replace(/[^+\d]/g, ''), session: session };
    _mfaEnrollVerificationId = await new firebase.auth.PhoneAuthProvider(firebase.auth()).verifyPhoneNumber(phoneInfoOptions, verifier);
    var ov = btn ? btn.closest('.overlay-content') : null;
    if (!ov) return;
    ov.innerHTML = '<h3 style="font-size:18px;font-weight:700;margin-bottom:4px">&#128241; '+t('Confirmation Code')+'</h3>'
      + '<p style="font-size:12px;color:var(--muted);margin-bottom:12px">'+t('Enter the 6-digit code we texted you.')+'</p>'
      + '<input id="mfa-code" type="text" inputmode="numeric" maxlength="6" placeholder="123456" style="text-align:center;font-size:18px;letter-spacing:5px;font-weight:700;margin-bottom:8px">'
      + '<div id="mfa-msg" style="font-size:12px;color:var(--danger);margin:6px 0;display:none"></div>'
      + '<div style="display:flex;gap:6px;margin-top:6px">'
      + '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="flex:1">'+t('Cancel')+'</button>'
      + '<button class="btn btn-primary btn-sm" onclick="mfaConfirmEnroll()" style="flex:1">'+t('Verify')+'</button>'
      + '</div>';
    var ci = document.getElementById('mfa-code'); if (ci) ci.focus();
  } catch (e) {
    console.warn('mfa enroll send failed', e);
    if (msg) { msg.style.display = 'block'; msg.textContent = friendlyMfaError(e); }
    if (btn) { btn.disabled = false; btn.textContent = t('Send Code'); }
  }
}
async function mfaConfirmEnroll() {
  var code = (document.getElementById('mfa-code').value || '').trim();
  var msg = document.getElementById('mfa-msg');
  if (!code) { alert(t('Enter the code sent to your phone.')); return; }
  try {
    var phoneCredential = firebase.auth.PhoneAuthProvider.credential(_mfaEnrollVerificationId, code);
    var multiFactorAssertion = firebase.auth.PhoneMultiFactorGenerator.assertion(phoneCredential);
    await firebase.auth().currentUser.multiFactor.enroll(multiFactorAssertion, 'Phone');
    _mfaEnrollVerificationId = null;
    var ov = document.getElementById('mfa-code');
    if (ov) ov.closest('.overlay').remove();
    showToast(t('Two-step login enabled!'));
    if (typeof render === 'function') render();
  } catch (e) {
    console.warn('mfa enroll confirm failed', e);
    if (msg) { msg.style.display = 'block'; msg.textContent = friendlyMfaError(e); }
  }
}
function disableMfaEnrollment() {
  var user = firebase && firebase.auth().currentUser;
  if (!user) return;
  var f = mfaEnrolledHints()[0];
  if (!f) return;
  user.multiFactor.unenroll(f).then(function() {
    showToast(t('Two-step login removed.'));
    if (typeof render === 'function') render();
  }).catch(function(e) {
    console.warn('mfa unenroll failed', e);
    alert(friendlyMfaError(e));
  });
}

// ====== SIGN-IN: resolve the missing second factor ======
var _mfaPendingErr = null;
function handleMfaSignIn(err) {
  if (!mfaSupported() || !err || !err.resolver) { alert(friendlyMfaError(err)); return; }
  _mfaPendingErr = err;
  var hint = (err.resolver.hints && err.resolver.hints[0]) || null;
  var display = hint ? mfaPhoneDisplay(hint) : t('your phone');
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="overlay-content" style="max-width:360px;text-align:center">'
    + '<h3 style="font-size:18px;font-weight:700;margin-bottom:4px">&#128274; '+t('Two-Step Verification')+'</h3>'
    + '<p style="font-size:12px;color:var(--muted);margin-bottom:10px">'+t('Enter the code we texted to')+' <strong>'+esc(display)+'</strong>.</p>'
    + '<div id="mfa-rc2"></div>'
    + '<input id="mfa-code2" type="text" inputmode="numeric" maxlength="6" placeholder="123456" style="text-align:center;font-size:18px;letter-spacing:5px;font-weight:700;margin-bottom:8px">'
    + '<div id="mfa-msg2" style="font-size:12px;color:var(--danger);margin:6px 0;display:none"></div>'
    + '<div style="display:flex;gap:6px;margin-top:6px">'
    + '<button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove();_mfaPendingErr=null" style="flex:1">'+t('Cancel')+'</button>'
    + '<button class="btn btn-primary btn-sm" onclick="mfaResolveSignIn(this)" style="flex:1">'+t('Verify')+'</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  setTimeout(function(){ var ci = document.getElementById('mfa-code2'); if (ci) ci.focus(); }, 100);
}
async function mfaResolveSignIn(btn) {
  if (!mfaSupported()) return;
  var err = _mfaPendingErr;
  if (!err || !err.resolver) { alert(friendlyMfaError(err)); return; }
  var code = (document.getElementById('mfa-code2').value || '').trim();
  var msg = document.getElementById('mfa-msg2');
  if (!code) { alert(t('Enter the code sent to your phone.')); return; }
  if (btn) { btn.disabled = true; btn.textContent = t('Verifying...'); }
  try {
    var hint = (err.resolver.hints && err.resolver.hints[0]) || null;
    var verifier = new firebase.auth.RecaptchaVerifier('mfa-rc2', { size: 'invisible' });
    var provider = new firebase.auth.PhoneAuthProvider(firebase.auth());
    var verificationId = await provider.verifyPhoneNumber({ multiFactorHint: hint, session: err.resolver.session }, verifier);
    var cred = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
    var assertion = firebase.auth.PhoneMultiFactorGenerator.assertion(cred);
    await err.resolver.resolveSignIn(assertion);
    _mfaPendingErr = null;
    // The auth state listener picks up the freshly resolved session automatically.
  } catch (e) {
    console.warn('mfa resolve failed', e);
    if (msg) { msg.style.display = 'block'; msg.textContent = friendlyMfaError(e); }
    if (btn) { btn.disabled = false; btn.textContent = t('Verify'); }
  }
}