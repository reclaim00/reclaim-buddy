var APP_VERSION = '2026-07-15';
// ====== FIREBASE ======
var firebaseConfig = {
  apiKey: "AIzaSyDX0CdgdB8lmjRq8QmJAMkE3WgC_OB7zB0",
  authDomain: "reclaim-buddy-2.firebaseapp.com",
  projectId: "reclaim-buddy-2",
  storageBucket: "reclaim-buddy-2.firebasestorage.app",
  messagingSenderId: "252489457973",
  appId: "1:252489457973:web:6d785afa4c32b3374c2c7c",
  measurementId: "G-J1J62RQ93Y"
};
try { firebase.initializeApp(firebaseConfig); } catch(e) { console.warn('Firebase init failed:', e); }
var DB = null; var MESSAGING = null;
try { if (firebase) { DB = firebase.firestore(); } } catch(e) { console.warn('Firestore init failed:', e); }
try { if (firebase) { MESSAGING = firebase.messaging(); } } catch(e) { console.warn('Messaging init failed:', e); }
// Set your VAPID key below from Firebase Console > Cloud Messaging > Web Push certificates
var VAPID_KEY = 'BMEecOfxkld0GFQk8oH7Rdn017rRpqeE5A0tnd0xlM4iDHuHiTaHPCxhxjjPCHOSCA7l4_ZUvy4RMvxDVaUFI84';

function isNativeApp() {
  return typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform && Capacitor.isNativePlatform();
}

function haptic(kind, style) {
  if (!isNativeApp()) return;
  try {
    var H = Capacitor.Plugins && Capacitor.Plugins.Haptics;
    if (!H) return;
    if (kind === 'impact') H.impact({ style: style || 'medium' }).catch(function(){});
    else if (kind === 'success') H.notification({ type: 'success' }).catch(function(){});
    else if (kind === 'warning') H.notification({ type: 'warning' }).catch(function(){});
    else if (kind === 'error') H.notification({ type: 'error' }).catch(function(){});
    else if (kind === 'light') H.selectionStart().catch(function(){});
  } catch(e) {}
}

function syncStatusBar() {
  if (!isNativeApp()) return;
  try {
    var SB = Capacitor.Plugins && Capacitor.Plugins.StatusBar;
    if (!SB || !SB.setStyle) return;
    SB.setStyle({ style: D && D.darkMode ? 'LIGHT' : 'DARK' }).catch(function(){});
    if (SB.setOverlaysWebView) SB.setOverlaysWebView({ overlay: true }).catch(function(){});
  } catch(e) {}
}

function subscribePush() {
  if (isNativeApp()) { registerNativePush(); return; }
  if (!MESSAGING || !AUTH_EMAIL || VAPID_KEY === 'REPLACE_WITH_YOUR_VAPID_KEY') return;
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready.then(function(reg) {
    return MESSAGING.getToken({ vapidKey: VAPID_KEY, serviceWorkerRegistration: reg });
  }).then(function(token) {
    if (!token) return;
    if (DB) DB.collection('pushSubscriptions').doc(AUTH_EMAIL).set({
      token: token,
      platform: 'web',
      timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions) ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '',
      prefs: (D.notifications && D.notifications.push !== false) ? JSON.stringify(D.notifications) : '{}',
      lastSent: {},
      updated: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
  }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}

function unsubscribePush() {
  if (isNativeApp()) { unregisterNativePush(); return; }
  if (!MESSAGING || !AUTH_EMAIL) return;
  MESSAGING.getToken({vapidKey: VAPID_KEY}).then(function(token) {
    if (token) {
      MESSAGING.deleteToken(token).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
    }
  }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
  DB.collection('pushSubscriptions').doc(AUTH_EMAIL).delete().catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}

// ====== NATIVE PUSH (FCM via @capacitor-firebase/messaging) ======
var _nativePushWired = false;

function pushTokenToFirestore(token) {
  if (!DB || !AUTH_EMAIL || !token) return;
  DB.collection('pushSubscriptions').doc(AUTH_EMAIL).set({
    token: token,
    platform: 'mobile',
    timezone: (typeof Intl !== 'undefined' && Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions) ? (Intl.DateTimeFormat().resolvedOptions().timeZone || '') : '',
    prefs: (D.notifications && D.notifications.push !== false) ? JSON.stringify(D.notifications) : '{}',
    lastSent: {},
    updated: firebase.firestore.FieldValue.serverTimestamp()
  }).catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
}

function registerNativePush() {
  if (!isNativeApp() || !AUTH_EMAIL) return;
  var FM = Capacitor.Plugins && Capacitor.Plugins.FirebaseMessaging;
  if (!FM) return;
  try {
    var LN = Capacitor.Plugins.LocalNotifications;
    if (LN && LN.createChannel) {
      LN.createChannel({ id: 'reclaim', name: 'Re.Claim Reminders', importance: 4, vibration: true, sound: '' }).catch(function(){});
    }
  } catch(e) {}

  if (!_nativePushWired) {
    _nativePushWired = true;
    FM.addListener('tokenReceived', function(ev) {
      if (ev && ev.token) pushTokenToFirestore(ev.token);
    }).catch(function(){});
    FM.addListener('notificationReceived', function(ev) {
      var n = ev && ev.notification;
      if (!n || !n.data) return;
      // iOS foreground: presentationOptions already shows the banner (skip).
      // Android foreground: display via LocalNotifications since the OS suppresses it.
      if (Capacitor.platform === 'android' && !document.hidden) {
        var d = n.data;
        var LN2 = Capacitor.Plugins.LocalNotifications;
        if (LN2) {
          LN2.schedule({ notifications: [{
            id: Math.floor(Math.random() * 9e8) + 1,
            title: d.title || 'Re.Claim',
            body: d.body || '',
            smallIcon: 'ic_push_world',
            channelId: 'reclaim',
            schedule: { at: new Date(Date.now() + 400), allowWhileIdle: true },
            data: { url: d.url || '' }
          }] }).catch(function(){});
        }
      }
    }).catch(function(){});
    FM.addListener('notificationActionPerformed', function(ev) {
      var n = ev && ev.notification;
      if (!n) return;
      var url = (n.data && n.data.url) || '';
      var m = url.match(/[?&]action=([^&]+)/);
      var action = m ? m[1] : '';
      if (action) setTimeout(function(){ routeNativeAction(action); }, 700);
    }).catch(function(){});
  }

  FM.checkPermissions().then(function(perm) {
    if (perm && perm.receive === 'granted') return true;
    return FM.requestPermissions().then(function(p2) { return p2 && p2.receive === 'granted'; });
  }).then(function(granted) {
    if (!granted) return;
    return FM.getToken();
  }).then(function(result) {
    if (result && result.token) pushTokenToFirestore(result.token);
  }).catch(function(e){
    console.warn('native push register failed:', e);
    showToast('Could not enable push notifications','error');
  });
}

function unregisterNativePush() {
  if (!isNativeApp()) return;
  var FM = Capacitor.Plugins && Capacitor.Plugins.FirebaseMessaging;
  if (FM && FM.deleteToken) FM.deleteToken().catch(function(){});
  if (DB && AUTH_EMAIL) DB.collection('pushSubscriptions').doc(AUTH_EMAIL).delete().catch(function(e){ console.warn(e); });
}

function routeNativeAction(action) {
  var check = function() {
    if (typeof goTo !== 'function' || typeof startBreathe !== 'function' || typeof showSOS !== 'function') { setTimeout(check, 300); return; }
    if (action === 'journal') goTo('journal');
    else if (action === 'breathe') startBreathe();
    else if (action === 'sos') showSOS();
    else if (action === 'mood') goTo('track');
    else if (action === 'buddy') goTo('buddy');
  };
  check();
}

// ====== CLOUD SYNC (Firestore cross-device) ======
function syncToFirestore(retries) {
  if (!AUTH_EMAIL) { syncStatusOffline(); return; }
  if (!firebase || !firebase.auth().currentUser) { syncStatusOffline(); return; }
  // While encryption is enabled but locked, never write the plaintext snapshot to the cloud.
  if (isEncryptionEnabled() && !ENC_KEY) { syncStatusOffline(); return; }
  D._lastSync = Date.now();
  if (retries === undefined) retries = 0;
  syncStatusSyncing();
  // Debounce: clear pending sync and schedule a new one
  if (window._syncTimer) clearTimeout(window._syncTimer);
  window._syncTimer = setTimeout(function(){
    firebase.auth().currentUser.getIdToken(true).then(function(){
      if (isEncryptionEnabled()) {
        // Seal the whole snapshot with the in-memory key: the cloud copy stays unreadable without the passphrase.
        return encryptText(JSON.stringify(D), ENC_KEY).then(function(seal){
          return { data: seal, enc: { salt: D.encryption.salt, keyCheck: D.encryption.keyCheck }, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() };
        });
      }
      return { data: JSON.parse(JSON.stringify(D)), lastUpdated: firebase.firestore.FieldValue.serverTimestamp() };
    }).then(function(body){
      return DB.collection('appData').doc(AUTH_EMAIL).set(body);
    }).then(function(){
      syncStatusSynced();
    }).catch(function(e){
      console.warn(e);
      if (retries < 2) setTimeout(function(){ syncToFirestore(retries + 1); }, 1000 * (retries + 1));
      else syncStatusError();
    });
  }, 500);
}

function loadFromFirestore(callback) {
  if (!AUTH_EMAIL) { if (callback) callback(null); syncStatusOffline(); return; }
  syncStatusSyncing();
  DB.collection('appData').doc(AUTH_EMAIL).get().then(function(doc) {
    if (!(doc.exists && doc.data().data)) { syncStatusSynced(); if (callback) callback(null); return; }
    var raw = doc.data();
    var sealed = raw.enc && raw.data && raw.data.enc;
    var finish = function(cloudData) {
      if (cloudData) {
        var cloudTime = raw.lastUpdated ? raw.lastUpdated.toMillis() : 0;
        var localTime = D._lastSync || 0;
        // Only merge cloud data if it's newer than local to prevent overwrites
        if (cloudTime >= localTime) {
          for (var k in cloudData) D[k] = cloudData[k];
          D._lastSync = cloudTime;
          saveData();
        }
        if (cloudTime > 0 && AUTH_EMAIL && !localStorage.getItem('rc_welcome_sync_'+AUTH_EMAIL)) {
          localStorage.setItem('rc_welcome_sync_'+AUTH_EMAIL, '1');
          setTimeout(function(){ showToast('Cloud data restored. Your progress is safe.', 'info'); }, 1000);
        }
      }
      syncStatusSynced();
      if (callback) callback(cloudData || null);
    };
    if (sealed) { handleSealedCloud(finish, raw); return; }
    finish(raw.data && raw.data.joinDate ? validateData(raw.data) : null);
  }).catch(function(e){ console.warn(e); syncStatusError(); if (callback) callback(null); });
}

var _sealedCloudResume = null;
function handleSealedCloud(finish, raw) {
  // Cloud copy is encrypted; decrypt it with the in-memory key when available.
  if (ENC_KEY) {
    decryptText(raw.data, ENC_KEY).then(function(plain){
      finish(validateData(JSON.parse(plain)));
    }).catch(function(e){ console.warn('cloud decrypt failed', e); syncStatusError(); if (finish) finish(null); });
    return;
  }
  // This device already holds the data; the cloud copy waits until the passphrase unlocks it.
  if (D.joinDate) {
    syncStatusSynced();
    if (finish) finish(null);
    return;
  }
  // Fresh device with an encrypted cloud copy: ask for the passphrase to decrypt it.
  D.encryption = { enabled: true, salt: raw.enc.salt, keyCheck: raw.enc.keyCheck };
  _sealedCloudResume = function(){ loadFromFirestore(finish); };
  if (typeof promptSealedCloudUnlock === 'function') promptSealedCloudUnlock();
}

// ====== AUTH ======
var AUTH_USER = localStorage.getItem('rc_user') || '';
var AUTH_EMAIL = localStorage.getItem('rc_email') || '';

// Track if onAuthStateChanged has restored a session on page load
var AUTH_RESTORED = false;

function onAuthReady(email, isNew) {
  AUTH_USER = email; AUTH_EMAIL = email;
  localStorage.setItem('rc_user', email); localStorage.setItem('rc_email', email);
  D = loadData();
  document.body.classList.add('logged-in');
  if (isNew) { D.joinDate = Date.now(); saveData(); }
  if (isNativeApp()) { subscribePush(); }
  else if (window.Notification && Notification.permission === "granted") subscribePush();
  if (typeof startBuddyMessaging === 'function') startBuddyMessaging();
  registerCurrentUser();
  if (firebase && firebase.auth().currentUser) {
    loadFromFirestore(function(cloudData) {
      render();
      if (isNew && !D._onboardingDone) { setTimeout(function(){ showOnboarding(); }, 400); }
      if (isNew && !D.assessmentTaken) { setTimeout(function(){ showAssessmentAfterSignIn(); }, 600); }
      if (isNew && !D._goalsOnboardingDone && D.assessmentTaken) { setTimeout(function(){ showGoalsOnboarding(); D._goalsOnboardingDone = true; saveData(); }, 800); }
    });
  } else {
    render();
    if (isNew && !D._onboardingDone) { setTimeout(function(){ showOnboarding(); }, 400); }
    if (isNew && !D.assessmentTaken) { setTimeout(function(){ showAssessmentAfterSignIn(); }, 600); }
    if (isNew && !D._goalsOnboardingDone && D.assessmentTaken) { setTimeout(function(){ showGoalsOnboarding(); D._goalsOnboardingDone = true; saveData(); }, 800); }
  }
  if (isLockSet()) { showLockScreen(); } else { resetLockTimer(); }
  // Periodic cloud sync — re-check on focus
  if (window._focusSync) document.removeEventListener('focus', window._focusSync);
  window._focusSync = function(){ if (AUTH_EMAIL && firebase && firebase.auth().currentUser) { loadFromFirestore(function(){}); } };
  document.addEventListener('visibilitychange', function(){ if (!document.hidden && AUTH_EMAIL && firebase && firebase.auth().currentUser) { loadFromFirestore(function(){}); } });
  // Auto-sync every 2 minutes to avoid data loss on tab close
  if (window._autoSyncTimer) clearInterval(window._autoSyncTimer);
  window._autoSyncTimer = setInterval(function(){
    if (AUTH_EMAIL && firebase && firebase.auth().currentUser) syncToFirestore();
  }, 120000);
  // Sync on page unload
  window.addEventListener('beforeunload', function(){
    if (!(AUTH_EMAIL && firebase && firebase.auth().currentUser)) return;
    if (isEncryptionEnabled() && !ENC_KEY) return;
    if (isEncryptionEnabled()) {
      encryptText(JSON.stringify(D), ENC_KEY).then(function(seal){
        DB.collection('appData').doc(AUTH_EMAIL).set({ data: seal, enc: { salt: D.encryption.salt, keyCheck: D.encryption.keyCheck }, lastUpdated: firebase.firestore.FieldValue.serverTimestamp() }).catch(function(e){ console.warn('beforeunload save failed:', e); });
      }).catch(function(e){ console.warn(e); });
      return;
    }
    DB.collection('appData').doc(AUTH_EMAIL).set({ data: JSON.parse(JSON.stringify(D)), lastUpdated: firebase.firestore.FieldValue.serverTimestamp() }).catch(function(e){ console.warn('beforeunload save failed:', e); });
  });
}

// ====== SYNC STATUS TRACKING ======
var _syncStatus = 'unknown'; // 'syncing' | 'synced' | 'error' | 'offline' | 'unknown'
var _lastSyncTime = '';

function updateSyncUI() {
  if (typeof D === 'undefined' || !D) return;
  var el = document.getElementById('sync-indicator');
  var timeEl = document.getElementById('sync-time-display');
  if (!AUTH_EMAIL || !firebase || !firebase.auth().currentUser) {
    if (el) el.style.display = 'none';
    if (timeEl) timeEl.textContent = 'Offline';
    return;
  }
  if (el) {
    el.style.display = 'inline-flex';
    if (_syncStatus === 'syncing') { el.innerHTML = '&#8987;'; el.className = 'sync-indicator syncing'; el.title = 'Syncing...'; }
    else if (_syncStatus === 'synced') { el.innerHTML = '&#10003;'; el.className = 'sync-indicator synced'; el.title = 'Synced ' + _lastSyncTime; }
    else if (_syncStatus === 'error') { el.innerHTML = '&#9888;'; el.className = 'sync-indicator error'; el.title = 'Sync failed. Tap to retry.'; }
    else if (_syncStatus === 'offline') { el.innerHTML = '&#9888;'; el.className = 'sync-indicator offline'; el.title = 'No connection'; }
    else { el.innerHTML = '?'; el.className = 'sync-indicator'; el.title = 'Sync status unknown'; }
  }
  if (timeEl) timeEl.textContent = _lastSyncTime || 'Never';
}

function syncStatusSyncing() { _syncStatus = 'syncing'; updateSyncUI(); }
function syncStatusSynced() { _syncStatus = 'synced'; _lastSyncTime = new Date().toLocaleTimeString(); updateSyncUI(); }
function syncStatusError() { _syncStatus = 'error'; updateSyncUI(); if (AUTH_EMAIL) showToast('Cloud sync failed. Data is safe locally.', 'error'); }
function syncStatusOffline() { _syncStatus = 'offline'; updateSyncUI(); }

var _sessionRestoreTimer = null;
try { firebase.auth().onAuthStateChanged(function(user) {
  if (user && user.email) {
    AUTH_RESTORED = true;
    if (_sessionRestoreTimer) { clearTimeout(_sessionRestoreTimer); _sessionRestoreTimer = null; }
    var wasSignedOut = !AUTH_USER;
    var email = user.email;
    if (user.isAnonymous || email.endsWith('@reclaim.local')) {
      if (!AUTH_USER) { wasSignedOut = true; email = user.isAnonymous ? (user.uid || AUTH_USER || email.replace(/@.*/,'')) : email.replace('@reclaim.local',''); }
    }
    if (wasSignedOut) {
      var isNew = !loadData().joinDate;
      user.getIdToken(true).then(function() {
        onAuthReady(email, isNew);
      }).catch(function() {
        onAuthReady(email, isNew);
      });
    }
  } else if (AUTH_RESTORED) {
    if (_sessionRestoreTimer) return;
    _sessionRestoreTimer = setTimeout(function() {
      _sessionRestoreTimer = null;
      firebase.auth().currentUser
        ? null
        : (function() {
            console.warn('Firebase auth session lost. If this was unexpected, check your connection.');
            showToast('Session check failed. Your data is saved locally.','warning');
            localStorage.removeItem('rc_user');
            AUTH_USER = '';
            AUTH_EMAIL = '';
            D = loadData();
            document.body.classList.remove('logged-in');
            render();
          })();
    }, 3000);
  } else {
    showSignIn();
  }
  window._authFired = true;
}); } catch(e) { console.warn('onAuthStateChanged setup failed:', e); }
// Fallback if Firebase auth never fires
setTimeout(function(){ if (!window._authFired) showSignIn(); }, 3000);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(function(e){ console.error('SW registration failed:', e); });
}

// ====== DATA ======
function defaultData() {
  return {
    version: 1,
    name: '', phoneNumber: '', avatar: '', joinDate: Date.now(), theme: 'green', darkMode: false,
    language: 'English',
    hopes: '', triggerSituations: '', stayOnTrack: '', fightingFor: '',
    moods: [],
    journal: [],
    habits: [], // [{id, name, logs: ['date strings']}]
    breatheCount: 0, lastBreatheDate: '',
    targetAddictions: [],
    buddy: null, buddyCheckins: [], buddyGoals: [], pairedBuddies: [], competitions: [],
    assessmentTaken: false, assessmentResult: null,
    sobriety: { startDate: null, relapseDates: [], addictionType: '', costPerDay: 0, dailyQuantity: 0, unitLabel: '', spendingOn: '', weeklyIncome: 0 },
    // Pre-populated coping cards displayed from defaults; user can add custom
    customCopingCards: [],
    savedArticles: [], savedBooks: [], savedPodcasts: [], savedVideos: [],
    lastReportDate: null,
    notifications: { morning: false, evening: false, morningTime: '08:00', eveningTime: '20:00', craving: false, journal: false, breathe: false, cravingTime: '14:00', journalTime: '12:00', breatheTime: '10:00', reminderNotif: true, push: true, checkinReminder: false, checkinReminderTime: '18:00', buddyCheckin: false, streakMilestone: false },
    chatHistory: [], reflectionCount: 0, sosUsed: false, assessmentProgress: [], relapsePlan: { triggers: [], warningSigns: [], coping: [], support: [], statement: '' }, cravings: [], messages: [], journalWordGoal: 50, reminders: [],
    pledges: [], lastMilestoneShown: 0, recoveryGoals: [], plantType: 'default', accentColor: 'green',
    encryption: { enabled: false, salt: null, keyCheck: null },
    timeCapsules: [],
    relapseRescue: { logs: [] },
    emergencyContacts: [],
    _postCrisisPending: false,
    royalPardons: [],
    researchOptIn: false,
    researchLastSubmitted: null,
    meetingLog: [],
    myWhy: { reasons: [], createdAt: null },
    achievements: [],
    missionLog: []
  };
}

var LANGUAGES = ['English','Español','Français','Deutsch','Русский','中文','日本語','العربية'];

var TRANS = {
'Home':{es:'Inicio', fr:'Accueil', de:'Start', 'ja':'?', 'ru':'Главная', 'zh-cn':'?', ar:'الرئيسية'},
'Reflect':{es:'Reflexionar', fr:'R\u00e9fl\u00e9chir', de:'Reflektieren', 'ja':'振りԊ', 'ru':'Размышлять', 'zh-cn':'反思', ar:'تأمل'},
'Care':{es:'Cuidado', fr:'Soins', de:'F\u00fcrsorge', 'ja':'ケア', 'ru':'Забота', 'zh-cn':'关怀', ar:'رعاية'},
'Track':{es:'Seguimiento', fr:'Suivi', de:'Verfolgen', 'ja':'追跡', 'ru':'Отслеживание', 'zh-cn':'跟踪', ar:'تتبع'},
'Tools':{es:'Herramientas', fr:'Outils', de:'Werkzeuge', 'ja':'ツール', 'ru':'Инструменты', 'zh-cn':'工具', ar:'أدوات'},
'Journal':{es:'Diario', fr:'Journal', de:'Tagebuch', 'ja':'ジャーナル', 'ru':'Дневник', 'zh-cn':'日记', ar:'مذكرات'},
'Calendar':{es:'Calendario', fr:'Calendrier', de:'Kalender', 'ja':'カレンダー', 'ru':'Календарь', 'zh-cn':'日历', ar:'تقويم'},
'Reminders':{es:'Recordatorios', fr:'Rappels', de:'Erinnerungen', 'ja':'リޤンダー', 'ru':'Напоминания', 'zh-cn':'В', ar:'تذكيرات'},
'Reports':{es:'Informes', fr:'Rapports', de:'Berichte', 'ja':'レポート', 'ru':'Отчеты', 'zh-cn':'报告', ar:'تقارير'},
'Partner':{es:'Compa\u00f1ero', fr:'Ami', de:'Kumpel', 'ja':'仲間', 'ru':'Товарищ', 'zh-cn':'伙伴', ar:'رفيق'},
'Meetings':{es:'Reuniones', fr:'R\u00e9unions', de:'Treffen', 'ja':'会議', 'ru':'Встречи', 'zh-cn':'会议', ar:'اجتماعات'},
'My Meeting Log':{es:'Mi registro de reuniones', fr:'Mon journal de r\u00e9unions', de:'Mein Meeting-Log'},
'Log Meeting':{es:'Registrar reuni\u00f3n', fr:'Enregistrer la r\u00e9union', de:'Meeting eintragen'},
'Meeting Type':{es:'Tipo de reuni\u00f3n', fr:'Type de r\u00e9union', de:'Meeting-Typ'},
'Topic':{es:'Tema', fr:'Sujet', de:'Thema'},
'Location':{es:'Ubicaci\u00f3n', fr:'Lieu', de:'Ort'},
'Meeting Streak':{es:'Racha de reuniones', fr:'S\u00e9rie de r\u00e9unions', de:'Meeting-Serie'},
'Online':{es:'En l\u00ednea', fr:'En ligne', de:'Online'},
'In Person':{es:'En persona', fr:'En personne', de:'Pers\u00f6nlich'},
'My Why':{es:'Mi porqu\u00e9', fr:'Mon pourquoi', de:'Mein Warum'},
'My Recovery Board':{es:'Mi tablero de recuperaci\u00f3n', fr:'Mon tableau de r\u00e9tablissement', de:'Meine Recovery-Tafel'},
'Add Reason':{es:'A\u00f1adir raz\u00f3n', fr:'Ajouter une raison', de:'Grund hinzuf\u00fcgen'},
"What's your why?":{es:'\u00bfCu\u00e1l es tu porqu\u00e9?', fr:'Quel est votre pourquoi?', de:'Was ist dein Warum?'},
'Remember why you started':{es:'Recuerda por qu\u00e9 empezaste', fr:'Souvenez-vous pourquoi vous avez commenc\u00e9', de:'Erinnere dich, warum du angefangen hast'},
'Profile':{es:'Perfil', fr:'Profil', de:'Profil', 'ja':'プロգール', 'ru':'Профиль', 'zh-cn':'个人资料', ar:'الملف الشخصي'},
'Affirmations':{es:'Afirmaciones', fr:'Affirmations', de:'Best\u00e4tigungen', 'ja':'アաメーション', 'ru':'Аффирмации', 'zh-cn':'肯定', ar:'تأكيدات'},
'Assessment':{es:'Evaluaci\u00f3n', fr:'\u00c9valuation', de:'Bewertung', 'ja':'評価', 'ru':'Оценка', 'zh-cn':'评估', ar:'تقييم'},
'Breathe':{es:'Respirar', fr:'Respirer', de:'Atmen', 'ja':'呼吸', 'ru':'Дышать', 'zh-cn':'呼吸', ar:'تنفس'},
'Settings':{es:'Ajustes', fr:'Param\u00e8tres', de:'Einstellungen', 'ja':'設定', 'ru':'Настройки', 'zh-cn':'设置', ar:'إعدادات'},
'About':{es:'Acerca de', fr:'\u00c0 Propos', de:'\u00dcber', 'ja':'概要', 'ru':'?', 'zh-cn':'关于', ar:'حول'},
'Sign In':{es:'Iniciar Sesi\u00f3n', fr:'Connexion', de:'Anmelden', 'ja':'ログイン', 'ru':'Войти', 'zh-cn':'登录', ar:'تسجيل الدخول'},
'Sign Up':{es:'Registrarse', fr:'S\'inscrire', de:'Registrieren', 'ja':'登録', 'ru':'Зарегистрироваться', 'zh-cn':'注册', ar:'التسجيل'},
'Save':{es:'Guardar', fr:'Enregistrer', de:'Speichern', 'ja':'保存', 'ru':'Сохранить', 'zh-cn':'保存', ar:'حفظ'},
'Cancel':{es:'Cancelar', fr:'Annuler', de:'Abbrechen', 'ja':'キャンセル', 'ru':'Отмена', 'zh-cn':'ֈ', ar:'إلغاء'},
'Close':{es:'Cerrar', fr:'Fermer', de:'Schlie\u00dfen', 'ja':'閉じる', 'ru':'Закрыть', 'zh-cn':'关闭', ar:'إغلاق'},
'Delete':{es:'Eliminar', fr:'Supprimer', de:'L\u00f6schen', 'ja':'削除', 'ru':'Удалить', 'zh-cn':'删除', ar:'حذف'},
'Edit':{es:'Editar', fr:'Modifier', de:'Bearbeiten', 'ja':'編集', 'ru':'Редактировать', 'zh-cn':'编辑', ar:'تعديل'},
'Add':{es:'Agregar', fr:'Ajouter', de:'Hinzuf\u00fcgen', 'ja':'追加', 'ru':'Добавить', 'zh-cn':'添加', ar:'إضافة'},
'Share':{es:'Compartir', fr:'Partager', de:'Teilen', 'ja':'共有', 'ru':'Поделиться', 'zh-cn':'分享', ar:'مشاركة'},
'Start':{es:'Comenzar', fr:'Commencer', de:'Starten', 'ja':'開始', 'ru':'Начать', 'zh-cn':'开始', ar:'بدء'},
'Done':{es:'Hecho', fr:'Termin\u00e9', de:'Fertig', 'ja':'完了', 'ru':'Готово', 'zh-cn':'完成', ar:'تم'},
'Next':{es:'Siguiente', fr:'Suivant', de:'Weiter', 'ja':'?', 'ru':'Далее', 'zh-cn':'下一步', ar:'التالي'},
'Previous':{es:'Anterior', fr:'Pr\u00e9c\u00e9dent', de:'Zur\u00fcck', 'ja':'前へ', 'ru':'Назад', 'zh-cn':'上一步', ar:'السابق'},
'Submit':{es:'Enviar', fr:'Soumettre', de:'Absenden', 'ja':'送信', 'ru':'Отправить', 'zh-cn':'Ф', ar:'إرسال'},
'Remove':{es:'Quitar', fr:'Retirer', de:'Entfernen', 'ja':'削除', 'ru':'Удалить', 'zh-cn':'移除', ar:'إزالة'},
'Connect':{es:'Conectar', fr:'Connecter', de:'Verbinden', 'ja':'接続', 'ru':'Подключить', 'zh-cn':'ޥ', ar:'اتصال'},
'Search':{es:'Buscar', fr:'Rechercher', de:'Suchen', 'ja':'検索', 'ru':'Поиск', 'zh-cn':'搜索', ar:'بحث'},
'Send':{es:'Enviar', fr:'Envoyer', de:'Senden', 'ja':'送信', 'ru':'Отправить', 'zh-cn':'发送', ar:'إرسال'},
'Back':{es:'Volver', fr:'Retour', de:'Zur\u00fcck', 'ja':'戻る', 'ru':'Назад', 'zh-cn':'返回', ar:'رجوع'},
'Enable':{es:'Activar', fr:'Activer', de:'Aktivieren', 'ja':'有効にする', 'ru':'Включить', 'zh-cn':'启用', ar:'تمكين'},
'Disable':{es:'Desactivar', fr:'D\u00e9sactiver', de:'Deaktivieren', 'ja':'無効にする', 'ru':'Отключить', 'zh-cn':'禁用', ar:'تعطيل'},
'Change':{es:'Cambiar', fr:'Changer', de:'\u00c4ndern', 'ja':'変更', 'ru':'Изменить', 'zh-cn':'更改', ar:'تغيير'},
'Lock':{es:'Bloquear', fr:'Verrouiller', de:'Sperren', 'ja':'ロï', 'ru':'Блокировать', 'zh-cn':'?', ar:'قفل'},
'Unseal':{es:'Desbloquear', fr:'D\u00e9verrouiller', de:'Entsperren', 'ja':'ロï解除', 'ru':'Разблокировать', 'zh-cn':'解锁', ar:'فتح'},
'Reset':{es:'Restablecer', fr:'R\u00e9initialiser', de:'Zur\u00fccksetzen', 'ja':'リセット', 'ru':'Сбросить', 'zh-cn':'重置', ar:'إعادة تعيين'},
'Title':{es:'Nombre', fr:'Nom', de:'Name', 'ja':'タイトル', 'ru':'Название', 'zh-cn':'标题', ar:'عنوان'},
'Tongue':{es:'Idioma', fr:'Langue', de:'Sprache', 'ja':'言語', 'ru':'Язык', 'zh-cn':'语言', ar:'لغة'},
'Date':{es:'Fecha', fr:'Date', de:'Datum', 'ja':'日付', 'ru':'Дата', 'zh-cn':'日期', ar:'تاريخ'},
'Repeat':{es:'Repetir', fr:'R\u00e9p\u00e9ter', de:'Wiederholen', 'ja':'繰り返し', 'ru':'Повторить', 'zh-cn':'重复', ar:'تكرار'},
'Notes':{es:'Notas', fr:'Notes', de:'Notizen', 'ja':'ノート', 'ru':'Заметки', 'zh-cn':'笔记', ar:'ملاحظات'},
'Title':{es:'T\u00edtulo', fr:'Titre', de:'Titel', 'ja':'タイトル', 'ru':'Название', 'zh-cn':'标题', ar:'عنوان'},
'Description':{es:'Descripci\u00f3n', fr:'Description', de:'Beschreibung', 'ja':'説明', 'ru':'Описание', 'zh-cn':'描述', ar:'وصف'},
'Score':{es:'Puntaje', fr:'Score', de:'Punktzahl', 'ja':'スコア', 'ru':'Оценка', 'zh-cn':'分数', ar:'نتيجة'},
'Level':{es:'Nivel', fr:'Niveau', de:'Level', 'ja':'レベル', 'ru':'Уровень', 'zh-cn':'等级', ar:'مستوى'},
'Words':{es:'Palabras', fr:'Mots', de:'W\u00f6rter', 'ja':'単語', 'ru':'Слова', 'zh-cn':'?', ar:'كلمات'},
'Entries':{es:'Entradas', fr:'Entr\u00e9es', de:'Eintr\u00e4ge', 'ja':'エントリ', 'ru':'Записи', 'zh-cn':'条目', ar:'إدخالات'},
'Daily':{es:'Diario', fr:'Quotidien', de:'T\u00e4glich', 'ja':'毎日', 'ru':'Ежедневно', 'zh-cn':'每天', ar:'يومي'},
'Weekly':{es:'Semanal', fr:'Hebdomadaire', de:'W\u00f6chentlich', 'ja':'毎週', 'ru':'Еженедельно', 'zh-cn':'每周', ar:'أسبوعي'},
'Monthly':{es:'Mensual', fr:'Mensuel', de:'Monatlich', 'ja':'毎月', 'ru':'Ежемесячно', 'zh-cn':'每月', ar:'شهري'},
'Never':{es:'Nunca', fr:'Jamais', de:'Nie', 'ja':'決して', 'ru':'Никогда', 'zh-cn':'从不', ar:'أبداً'},
'Sometimes':{es:'A Veces', fr:'Parfois', de:'Manchmal', 'ja':'時々', 'ru':'Иногда', 'zh-cn':'有时', ar:'أحياناً'},
'Often':{es:'A Menudo', fr:'Souvent', de:'Oft', 'ja':'よく', 'ru':'Часто', 'zh-cn':'经常', ar:'غالباً'},
'Always':{es:'Siempre', fr:'Toujours', de:'Immer', 'ja':'いつも', 'ru':'Всегда', 'zh-cn':'总是', ar:'دائماً'},
'Rarely':{es:'Raramente', fr:'Rarement', de:'Selten', 'ja':'まれに', 'ru':'Редко', 'zh-cn':'很少', ar:'نادراً'},
'Streak':{es:'Racha', fr:'S\u00e9rie', de:'Serie', 'ja':'連続記録', 'ru':'Серия', 'zh-cn':'连续', ar:'تسلسل'},
'Current':{es:'Actual', fr:'Actuel', de:'Aktuell', 'ja':'現在', 'ru':'Текущая', 'zh-cn':'当前', ar:'الحالي'},
'Best Ever':{es:'Mejor Marca', fr:'Meilleur Score', de:'Bestwert', 'ja':'最高記録', 'ru':'Лучшая за всё время', 'zh-cn':'历史最佳', ar:'الأفضل على الإطلاق'},
'Active Days':{es:'D\u00edas Activos', fr:'Jours Actifs', de:'Aktive Tage', 'ja':'アクƣブ日数', 'ru':'Активные дни', 'zh-cn':'活跃天数', ar:'أيام نشطة'},
'Sober Days':{es:'D\u00edas Sobrio', fr:'Jours Sobres', de:'N\u00fcchterne Tage', 'ja':'断酒日数', 'ru':'Трезвые дни', 'zh-cn':'清醒天数', ar:'أيام اليقظة'},
'Mood':{es:'Estado de \u00c1nimo', fr:'Humeur', de:'Stimmung', 'ja':'気分', 'ru':'Настроение', 'zh-cn':'心情', ar:'مزاج'},
'Check-Ins':{es:'Registros', fr:'Points', de:'Check-Ins', 'ja':'チェïイン', 'ru':'Отметки', 'zh-cn':'签到', ar:'تسجيل الوصول'},
'Avg Mood':{es:'Estado Promedio', fr:'Humeur Moyenne', de:'Durchschnittsstimmung', 'ja':'平均気分', 'ru':'Среднее настроение', 'zh-cn':'平均心情', ar:'متوسط المزاج'},
'Retake':{es:'Repetir', fr:'Reprendre', de:'Wiederholen', 'ja':'再受験', 'ru':'Повторить', 'zh-cn':'重做', ar:'إعادة'},
'SOS':{es:'SOS', fr:'SOS', de:'SOS', 'ja':'SOS', 'ru':'SOS', 'zh-cn':'SOS', ar:' SOS'},
'Copied!':{es:'\u00a1Copiado!', fr:'Copi\u00e9 !', de:'Kopiert!', 'ja':'コピーしました！', 'ru':'Скопировано!', 'zh-cn':'已复制！', ar:'تم النسخ!'},
'Search entries...':{es:'Buscar entradas...', fr:'Rechercher entr\u00e9es...', de:'Eintr\u00e4ge suchen...', 'ja':'エントリを検索...', 'ru':'Поиск записей...', 'zh-cn':'搜索条目...', ar:'بحث في الإدخالات...'},
'No entries match':{es:'Ninguna entrada coincide', fr:'Aucune entr\u00e9e trouv\u00e9e', de:'Keine Eintr\u00e4ge gefunden', 'ja':'一致するエントリがありません', 'ru':'Нет совпадающих записей', 'zh-cn':'没有匹配的条目', ar:'لا توجد إدخالات مطابقة'},
'Local User':{es:'Usuario Local', fr:'Utilisateur Local', de:'Lokaler Benutzer', 'ja':'ローカルユーザー', 'ru':'Локальный пользователь', 'zh-cn':'本地用户', ar:'مستخدم محلي'},
'Settings':{es:'Ajustes', fr:'Param\u00e8tres', de:'Einstellungen', ar:'إعدادات'},
'Notifications':{es:'Notificaciones', fr:'Notifications', de:'Benachrichtigungen', 'ja':'通知', 'ru':'Уведомления', 'zh-cn':'通知', ar:'إشعارات'},
'Privacy Lock':{es:'Bloqueo de Privacidad', fr:'Verrouillage de Confidentialit\u00e9', de:'Datenschutzsperre', 'ja':'プライзーロï', 'ru':'Блокировка конфиденциальности', 'zh-cn':'隐私锁', ar:'قفل الخصوصية'},
'Journal Settings':{es:'Configuraci\u00f3n del Diario', fr:'Param\u00e8tres du Journal', de:'Tagebucheinstellungen', 'ja':'ジャーナル設定', 'ru':'Настройки дневника', 'zh-cn':'日记设置', ar:'إعدادات المذكرات'},
'Daily word goal':{es:'Meta diaria de palabras', fr:'Objectif quotidien de mots', de:'T\u00e4gliches Wortziel', 'ja':'1日の単語目標', 'ru':'Ежедневная цель по словам', 'zh-cn':'每日字数目标', ar:'الهدف اليومي للكلمات'},
'Export My Data':{es:'Exportar Mis Datos', fr:'Exporter Mes Donn\u00e9es', de:'Meine Daten Exportieren', 'ja':'データをエクスポート', 'ru':'Экспортировать мои данные', 'zh-cn':'导出我的数据', ar:'تصدير بياناتي'},
'Import Data':{es:'Importar Datos', fr:'Importer des Donn\u00e9es', de:'Daten Importieren', 'ja':'データをインポート', 'ru':'Импортировать данные', 'zh-cn':'导入数据', ar:'استيراد بيانات'},
'About Re.Claim':{es:'Acerca de Re.Claim', fr:'\u00c0 Propos de Re.Claim', de:'\u00dcber Re.Claim', 'ja':'Re.Claimについて', 'ru':'? Re.Claim', 'zh-cn':'关于Re.Claim', ar:'حول Re.Claim'},
'Morning':{es:'Ma\u00f1ana', fr:'Matin', de:'Morgen', 'ja':'?', 'ru':'Утро', 'zh-cn':'早上', ar:'صباح'},
'Evening':{es:'Tarde', fr:'Soir', de:'Abend', 'ja':'夕方', 'ru':'Вечер', 'zh-cn':'晚上', ar:'مساء'},
'Forge New Key':{es:'Cambiar C\u00f3digo', fr:'Changer le Code', de:'Passcode \u00c4ndern', 'ja':'ѹコーɒ変更', 'ru':'Изменить пароль', 'zh-cn':'修改密码', ar:'تغيير رمز المرور'},
'Unbolt the Chest':{es:'Desactivar Bloqueo', fr:'D\u00e9sactiver le Verrouillage', de:'Sperre Deaktivieren', 'ja':'ロïを無効にする', 'ru':'Отключить блокировку', 'zh-cn':'禁用锁定', ar:'تعطيل القفل'},
'Bolt the Chest':{es:'Activar Bloqueo', fr:'Activer le Verrouillage', de:'Sperre Aktivieren', 'ja':'ロïを有効にする', 'ru':'Включить блокировку', 'zh-cn':'启用锁定', ar:'تمكين القفل'},
'Face ID':{es:'Face ID', fr:'Face ID', de:'Face ID', 'ja':'Face ID', 'ru':'Face ID', 'zh-cn':'面容ID', ar:'Face ID'},
'Sign Out':{es:'Cerrar Sesi\u00f3n', fr:'D\u00e9connexion', de:'Abmelden', 'ja':'ログアウト', 'ru':'Выйти', 'zh-cn':'退出登录', ar:'تسجيل الخروج'},
'Create Reminder':{es:'Crear Recordatorio', fr:'Cr\u00e9er un Rappel', de:'Erinnerung Erstellen', 'ja':'リޤンダーを作成', 'ru':'Создать напоминание', 'zh-cn':'创建В', ar:'إنشاء تذكير'},
'Addiction Targets':{es:'Objetivos de Adicci\u00f3n', fr:'Cibles de D\u00e9pendance', de:'Suchtziele', 'ja':'依存症の目標', 'ru':'Цели зависимости', 'zh-cn':'成瘾目标', ar:'أهداف الإدمان'},
'Clear All':{es:'Borrar Todo', fr:'Tout Effacer', de:'Alles L\u00f6schen', 'ja':'すべてクリア', 'ru':'Очистить всё', 'zh-cn':'清除全部', ar:'مسح الكل'},
'Steps':{es:'Pasos', fr:'\u00c9tapes', de:'Schritte', 'ja':'ステップ', 'ru':'Шаги', 'zh-cn':'步骤', ar:'خطوات'},
'Commit to Today':{es:'Compromiso de Hoy', fr:'Engagement du Jour', de:'Heutiges Bekenntnis', 'ja':'今日の誓約', 'ru':'Обязаться сегодня', 'zh-cn':'今日承诺', ar:'التزم اليوم'},
'Today\'s Commitment':{es:'Compromiso de Hoy', fr:'Engagement du Jour', de:'Heutiges Bekenntnis', ar:'التزام اليوم'},
'Pledge streak:':{es:'Racha de compromiso:', fr:'S\u00e9rie d\'engagement:', de:'Serie:', 'ja':'誓約の連続記録:', 'ru':'Серия обещаний:', 'zh-cn':'承诺连续:', ar:'سلسلة التعهد:'},
'They Recovered Too':{es:'Ellos Tambi\u00e9n se Recuperaron', fr:'Eux Aussi se Sont R\u00e9tablis', de:'Sie Wurden Auch Gesund', 'ja':'彼らもީしました', 'ru':'Они тоже выздоровели', 'zh-cn':'他们也康复了', ar:'لقد تعافوا أيضاً'},
'Share My Progress':{es:'Compartir Mi Progreso', fr:'Partager Mon Progr\u00e8s', de:'Meinen Fortschritt Teilen', 'ja':'進捗を共有', 'ru':'Поделиться моим прогрессом', 'zh-cn':'分享我的进展', ar:'شارك تقدمي'},
'Share Image':{es:'Compartir Imagen', fr:'Partager l\'Image', de:'Bild Teilen', 'ja':'画ϒ共有', 'ru':'Поделиться изображением', 'zh-cn':'分享图片', ar:'مشاركة الصورة'},
'My Recovery So Far':{es:'Mi Recuperaci\u00f3n Hasta Ahora', fr:'Mon R\u00e9tablissement Jusqu\'ici', de:'Meine Genesung Bisher', 'ja':'これまでのީ', 'ru':'Моё выздоровление на сегодня', 'zh-cn':'我的康复进展', ar:'تعافيي حتى الآن'},
'days sober':{es:'d\u00edas sobrio', fr:'jours sobres', de:'Tage n\u00fcchtern', 'ja':'断酒日数', 'ru':'трезвых дней', 'zh-cn':'清醒天数', ar:'أيام اليقظة'},
'day streak':{es:'racha de d\u00edas', fr:'s\u00e9rie de jours', de:'Tageserie', 'ja':'日間連続', 'ru':'дневная серия', 'zh-cn':'天连续', ar:'تسلسل أيام'},
'pledge streak':{es:'racha de compromiso', fr:'s\u00e9rie d\'engagement', de:'Bekenntnisserie', 'ja':'誓約連続', 'ru':'серия обещаний', 'zh-cn':'承诺连续', ar:'سلسلة التعهد'},
'journal entries':{es:'entradas de diario', fr:'entr\u00e9es de journal', de:'Tagebucheintr\u00e4ge', 'ja':'ジャーナルエントリ', 'ru':'записей в дневнике', 'zh-cn':'日记条目', ar:'إدخالات المذكرات'},
'Today\'s Challenge':{es:'Desaf\u00edo de Hoy', fr:'D\u00e9fi du Jour', de:'Heutige Herausforderung', ar:'تحدي اليوم'},
'Today\'s Quote':{es:'Cita de Hoy', fr:'Citation du Jour', de:'Heutiges Zitat', ar:'اقتباس اليوم'},
'I Commit':{es:'Me Comprometo', fr:'Je m\'Engage', de:'Ich Verpflichte Mich', 'ja':'誓約します', 'ru':'Я обязуюсь', 'zh-cn':'我承诺', ar:'أنا ألتزم'},
'Sobriety Tracker':{es:'Seguimiento de Sobriedad', fr:'Suivi de Sobri\u00e9t\u00e9', de:'N\u00fcchternheits-Tracker', 'ja':'断酒トラëー', 'ru':'Трекер трезвости', 'zh-cn':'清醒跟踪器', ar:'متتبع اليقظة'},
'Your Streaks':{es:'Tus Rachas', fr:'Vos S\u00e9ries', de:'Deine Serien', 'ja':'連続記録', 'ru':'Ваши серии', 'zh-cn':'我的连续', ar:'تسلسلاتك'},
'Mood History':{es:'Historial de \u00c1nimo', fr:'Historique d\'Humeur', de:'Stimmungsverlauf', 'ja':'気分の履歴', 'ru':'История настроения', 'zh-cn':'心ņ史', ar:'تاريخ المزاج'},
'Today\'s Habits':{es:'H\u00e1bitos de Hoy', fr:'Habitudes du Jour', de:'Heutige Gewohnheiten', ar:'عادات اليوم'},
'Coping Cards':{es:'Tarjetas de Afrontamiento', fr:'Cartes d\'Adaptation', de:'Bew\u00e4ltigungskarten', 'ja':'対処カード', 'ru':'Карточки преодоления', 'zh-cn':'应对卡', ar:'بطاقات التكيف'},
'Mindful Breathing':{es:'Respiraci\u00f3n Consciente', fr:'Respiration Consciente', de:'Achtsames Atmen', 'ja':'ޤンドフル呼吸', 'ru':'Осознанное дыхание', 'zh-cn':'正念呼吸', ar:'التنفس الواعي'},
'Crisis Helplines':{es:'L\u00edneas de Crisis', fr:'Lignes de Crise', de:'Krisenhotlines', 'ja':'危機ホットライン', 'ru':'Кризисные линии помощи', 'zh-cn':'危机热线', ar:'خطوط الأزمات الساخنة'},
'Relapse Prevention Plan':{es:'Plan de Prevenci\u00f3n de Reca\u00eddas', fr:'Plan de Pr\u00e9vention des Rechutes', de:'R\u00fcckfallpr\u00e4ventionsplan', 'ja':'再発防止計画', 'ru':'План предотвращения рецидива', 'zh-cn':'复ф防计划', ar:'خطة منع الانتكاس'},
'My Commitment Statement':{es:'Mi Declaraci\u00f3n de Compromiso', fr:'Ma D\u00e9claration d\'Engagement', de:'Meine Verpflichtungserkl\u00e4rung', 'ja':'私の誓約宣言', 'ru':'Моё заявление об обязательстве', 'zh-cn':'我的承诺声明', ar:'بيان التزامي'},
'My Support Network':{es:'Mi Red de Apoyo', fr:'Mon R\u00e9seau de Soutien', de:'Mein Unterst\u00fctzungsnetzwerk', 'ja':'サポートネットワーク', 'ru':'Моя сеть поддержки', 'zh-cn':'我的支持网络', ar:'شبكة دعمي'},
'My Coping Strategies':{es:'Mis Estrategias de Afrontamiento', fr:'Mes Strat\u00e9gies d\'Adaptation', de:'Meine Bew\u00e4ltigungsstrategien', 'ja':'対処戦略', 'ru':'Мои стратегии преодоления', 'zh-cn':'我的应对策略', ar:'استراتيجيات التكيف الخاصة بي'},
'Warning Signs':{es:'Se\u00f1ales de Alerta', fr:'Signes d\'Alerte', de:'Warnsignale', 'ja':'警告サイン', 'ru':'Предупреждающие знаки', 'zh-cn':'警示信号', ar:'علامات التحذير'},
'My Triggers':{es:'Mis Desencadenantes', fr:'Mes D\u00e9clencheurs', de:'Meine Ausl\u00f6ser', 'ja':'トリガー', 'ru':'Мои триггеры', 'zh-cn':'我的触发因素', ar:'مسبباتي'},
'Your Relapse Prevention Plan':{es:'Tu Plan de Prevenci\u00f3n', fr:'Votre Plan de Pr\u00e9vention', de:'Dein R\u00fcckfallpr\u00e4ventionsplan', 'ja':'再発防止計画', 'ru':'Ваш план предотвращения рецидива', 'zh-cn':'复ф防计划', ar:'خطة منع الانتكاس الخاصة بك'},
'Helplines':{es:'L\u00edneas de Ayuda', fr:'Lignes d\'Aide', de:'Hilfshotlines', 'ja':'ホットライン', 'ru':'Линии помощи', 'zh-cn':'求助热线', ar:'خطوط المساعدة'},
'Recovery Goals':{es:'Metas de Recuperaci\u00f3n', fr:'Objectifs de R\u00e9tablissement', de:'Genesungsziele', 'ja':'ީ目標', 'ru':'Цели выздоровления', 'zh-cn':'康复目标', ar:'أهداف التعافي'},
'Add Goal':{es:'Agregar Meta', fr:'Ajouter un Objectif', de:'Ziel Hinzuf\u00fcgen', 'ja':'目標を追加', 'ru':'Добавить цель', 'zh-cn':'添加目标', ar:'إضافة هدف'},
'New Recovery Goal':{es:'Nueva Meta', fr:'Nouvel Objectif', de:'Neues Ziel', 'ja':'新しいީ目標', 'ru':'Новая цель выздоровления', 'zh-cn':'新的康复目标', ar:'هدف تعافي جديد'},
'Tracking':{es:'Seguimiento', fr:'Suivi', de:'Verfolgung', 'ja':'追跡', 'ru':'Отслеживание', 'zh-cn':'追踪', ar:'تتبع'},
'Recovery':{es:'Recuperaci\u00f3n', fr:'R\u00e9tablissement', de:'Genesung', 'ja':'ީ', 'ru':'Выздоровление', 'zh-cn':'康复', ar:'تعافي'},
'Resources':{es:'Recursos', fr:'Ressources', de:'Ressourcen', 'ja':'リソース', 'ru':'Ресурсы', 'zh-cn':'资源', ar:'موارد'},
'Screenshot this card to share your progress.':{es:'Captura esta tarjeta para compartir tu progreso.', fr:'Capturez cette carte pour partager votre progression.', de:'Mach einen Screenshot dieser Karte, um deinen Fortschritt zu teilen.', 'ja':'このカードのスクリーンショッȒ撮って進捗を共有しましょう。', 'ru':'Сделайте скриншот этой карточки, чтобы поделиться своим прогрессом.', 'zh-cn':'截取此卡片的屏幕截图以分享您的ۦ。', ar:'التقط لقطة شاشة لهذه البطاقة لمشاركة تقدمك.'},
'Messenger (optional)':{es:'Tel\u00e9fono (opcional)', fr:'T\u00e9l\u00e9phone (facultatif)', de:'Telefon (optional)', 'ja':'電話（任意）', 'ru':'Телефон (необязательно)', 'zh-cn':'电话（可选）', ar:'هاتف (اختياري)'},
'Accent Colour':{es:'Color de Acento', fr:'Couleur d\'Accent', de:'Akzentfarbe', 'ja':'アクセントカラー', 'ru':'Акцентный цвет', 'zh-cn':'强调色', ar:'لون التمييز'},
'Night Watch':{es:'Modo Oscuro', fr:'Mode Sombre', de:'Dunkelmodus', 'ja':'ダークモード', 'ru':'Тёмный режим', 'zh-cn':'夜间模式', ar:'الوضع الداكن'},
'Name':{es:'Nombre', fr:'Nom', de:'Name', 'ja':'名前', 'ru':'Имя', 'zh-cn':'姓名', ar:'الاسم'},
'Phone Number':{es:'Teléfono', fr:'Téléphone', de:'Telefon', 'ja':'電話番号', 'ru':'Телефон', 'zh-cn':'电话号码', ar:'رقم الهاتف'},
'Language':{es:'Idioma', fr:'Langue', de:'Sprache', 'ja':'言語', 'ru':'Язык', 'zh-cn':'语言', ar:'لغة'},
'Dark Mode':{es:'Modo Oscuro', fr:'Mode Sombre', de:'Dunkelmodus', 'ja':'ダークモード', 'ru':'Тёмный режим', 'zh-cn':'深色模式', ar:'الوضع الداكن'},
'Craving Check-In':{es:'Registro de Antojos', fr:'Point sur les Fringales', de:'Craving-Check-in', 'ja':'渴望チェïイン', 'ru':'Проверка тяги', 'zh-cn':'渴望签到', ar:'تسجيل الرغبة الشديدة'},
'Journal Prompt':{es:'Indicaci\u00f3n del Diario', fr:'Invitation au Journal', de:'Tagebuchaufforderung', 'ja':'ジャーナルプロンプト', 'ru':'Подсказка для дневника', 'zh-cn':'日记提示', ar:'موجه المذكرات'},
'Breathing Exercise':{es:'Ejercicio de Respiraci\u00f3n', fr:'Exercice de Respiration', de:'Atem\u00fcbung', 'ja':'呼吸法', 'ru':'Дыхательное упражнение', 'zh-cn':'呼吸练习', ar:'تمرين التنفس'},
'Set your intention':{es:'Establece tu intenci\u00f3n', fr:'D\u00e9finissez votre intention', de:'Setze deine Absicht', 'ja':'意図を設定', 'ru':'Установите намерение', 'zh-cn':'设定你的意图', ar:'حدد نيتك'},
'Reflect on your day':{es:'Reflexiona sobre tu d\u00eda', fr:'R\u00e9fl\u00e9chissez \u00e0 votre journ\u00e9e', de:'Reflektiere deinen Tag', 'ja':'1日を振りԋ', 'ru':'Подумайте о своём дне', 'zh-cn':'反思你的一天', ar:'تأمل في يومك'},
'Log & manage cravings':{es:'Registrar y gestionar antojos', fr:'Journaliser et g\u00e9rer les fringales', de:'Craving erfassen und verwalten', 'ja':'渴望を記録・管理', 'ru':'Записывайте и управляйте тягой', 'zh-cn':'记录和管理渴望', ar:'سجل وأدر الرغبة الشديدة'},
'Write about your day':{es:'Escribe sobre tu d\u00eda', fr:'\u00c9crivez sur votre journ\u00e9e', de:'Schreib \u00fcber deinen Tag', 'ja':'1日について書く', 'ru':'Напишите о своём дне', 'zh-cn':'写你的一天', ar:'اكتب عن يومك'},
'Take a mindful moment':{es:'Toma un momento consciente', fr:'Prenez un moment de pleine conscience', de:'Nimm dir einen achtsamen Moment', 'ja':'ޤンドフルなひとときを', 'ru':'Проведите момент осознанности', 'zh-cn':'花点时间正念', ar:'خذ لحظة وعي'},
'Reminders':{es:'Recordatorios', fr:'Rappels', de:'Erinnerungen', ar:'تذكيرات'},
'Get notified when a reminder is due':{es:'Recibe notificaci\u00f3n cuando venza un recordatorio', fr:'Recevoir une notification quand un rappel est d\u00fb', de:'Benachrichtigung erhalten, wenn eine Erinnerung f\u00e4llig', 'ja':'リޤンダー期日に通知', 'ru':'Получать уведомление, когда напоминание должно сработать', 'zh-cn':'В到期时接收通知', ar:'تلقي إشعار عند حلول موعد التذكير'},
'Export My Data':{es:'Exportar Mis Datos', fr:'Exporter Mes Donn\u00e9es', de:'Meine Daten Exportieren', ar:'تصدير بياناتي'},
'Import Data':{es:'Importar Datos', fr:'Importer des Donn\u00e9es', de:'Daten Importieren', ar:'استيراد بيانات'},
'About Re.Claim':{es:'Acerca de Re.Claim', fr:'\u00c0 Propos de Re.Claim', de:'\u00dcber Re.Claim', ar:'حول Re.Claim'},
'Set Up Face ID':{es:'Configurar Face ID', fr:'Configurer Face ID', de:'Face ID Einrichten', 'ja':'Set Up Face ID', 'ru':'Set Up Face ID', 'zh-cn':'设置面容ID', ar:'Set Up Face ID'},
'Disable passcode lock?':{es:'\u00bfDesactivar bloqueo de c\u00f3digo?', fr:'D\u00e9sactiver le verrouillage par code ?', de:'Passcode-Sperre deaktivieren?', 'ja':'Disable passcode lock?', 'ru':'Disable passcode lock?', 'zh-cn':'关闭密码锁？', ar:'Disable passcode lock?'},
'4-6 digit passcode':{es:'c\u00f3digo de 4-6 d\u00edgitos', fr:'code \u00e0 4-6 chiffres', de:'4-6-stelliger Passcode', 'ja':'4-6 digit passcode', 'ru':'4-6 digit passcode', 'zh-cn':'4-6位数字密码', ar:'4-6 digit passcode'},
'Passcode must be 4-6 digits.':{es:'El c\u00f3digo debe ser de 4-6 d\u00edgitos.', fr:'Le code doit comporter 4 \u00e0 6 chiffres.', de:'Passcode muss 4-6 Ziffern haben.', 'ja':'Passcode must be 4-6 digits.', 'ru':'Passcode must be 4-6 digits.', 'zh-cn':'密码必须为4-6位数字', ar:'Passcode must be 4-6 digits.'},
'Passcode updated!':{es:'\u00a1C\u00f3digo actualizado!', fr:'Code mis \u00e0 jour !', de:'Passcode aktualisiert!', 'ja':'Passcode updated!', 'ru':'Passcode updated!', 'zh-cn':'密码已更新！', ar:'Passcode updated!'},
'Incorrect current passcode.':{es:'C\u00f3digo actual incorrecto.', fr:'Code actuel incorrect.', de:'Aktueller Passcode falsch.', 'ja':'Incorrect current passcode.', 'ru':'Incorrect current passcode.', 'zh-cn':'当前密码不正确', ar:'Incorrect current passcode.'},
'Passcode enabled! The app will lock when you switch tabs or after 5 min of inactivity.':{es:'\u00a1C\u00f3digo activado! La app se bloquear\u00e1 al cambiar de pesta\u00f1a o tras 5 min de inactividad.', fr:'Code activ\u00e9 ! L\'app se verrouillera quand vous changez d\'onglet ou apr\u00e8s 5 min d\'inactivit\u00e9.', de:'Passcode aktiviert! Die App sperrt beim Wechseln von Tabs oder nach 5 Min Inaktivit\u00e4t.', 'ja':'Passcode enabled! The app will lock when you switch tabs or after 5 min of inactivity.', 'ru':'Passcode enabled! The app will lock when you switch tabs or after 5 min of inactivity.', 'zh-cn':'密码已启用！切换标签页或闲置5分钟后应用将锁定', ar:'Passcode enabled! The app will lock when you switch tabs or after 5 min of inactivity.'},
'Enter current passcode to change:':{es:'Ingresa el c\u00f3digo actual para cambiar:', fr:'Entrez le code actuel pour changer :', de:'Aktuellen Passcode eingeben zum \u00c4ndern:', 'ja':'Enter current passcode to change:', 'ru':'Enter current passcode to change:', 'zh-cn':'输入当前密码以更改：', ar:'Enter current passcode to change:'},
'Enter new 4-6 digit passcode:':{es:'Ingresa un nuevo c\u00f3digo de 4-6 d\u00edgitos:', fr:'Entrez un nouveau code \u00e0 4-6 chiffres :', de:'Neuen 4-6-stelligen Passcode eingeben:', 'ja':'Enter new 4-6 digit passcode:', 'ru':'Enter new 4-6 digit passcode:', 'zh-cn':'输入新的4-6位数字密码：', ar:'Enter new 4-6 digit passcode:'},
'Select what you are working on. These will guide your journey.':{es:'Selecciona en qu\u00e9 est\u00e1s trabajando. Elegir\u00e1s el plan de seguridad basado en esto.', fr:'S\u00e9lectionnez sur quoi vous travaillez. Vous b\u00e2tirez des plans de s\u00e9curit\u00e9 bas\u00e9s sur cela.', de:'W\u00e4hle, woran du arbeitest. Basierend darauf werden Sicherheitspl\u00e4ne erstellt.', 'ja':'Select what you are working on. HeroGuide creates safety plans based on these.', 'ru':'Select what you are working on. HeroGuide creates safety plans based on these.', 'zh-cn':'选择您正在努力的目标. HeroGuide creates safety plans based on these.', ar:'Select what you are working on. HeroGuide creates safety plans based on these.'},
'Set a passcode to lock the app when you switch tabs or step away. Your data stays on this device.':{es:'Establece un c\u00f3digo para bloquear la app al cambiar de pesta\u00f1a o alejarte. Tus datos permanecen en este dispositivo.', fr:'D\u00e9finissez un code pour verrouiller l\'app quand vous changez d\'onglet ou vous \u00e9loignez. Vos donn\u00e9es restent sur cet appareil.', de:'Lege einen Passcode fest, um die App beim Wechseln von Tabs oder Weggehen zu sperren. Deine Daten bleiben auf diesem Ger\u00e4t.', 'ja':'Set a passcode to lock the app when you switch tabs or step away. Your data stays on this device.', 'ru':'Set a passcode to lock the app when you switch tabs or step away. Your data stays on this device.', 'zh-cn':'设置密码以锁定应用 when you switch tabs or step away. Your data stays on this device.', ar:'Set a passcode to lock the app when you switch tabs or step away. Your data stays on this device.'},
'Re.Claim is your recovery & wellness companion.':{es:'Re.Claim es tu compa\u00f1ero de recuperaci\u00f3n y bienestar.', fr:'Re.Claim est votre compagnon de r\u00e9tablissement et de bien-\u00eatre.', de:'Re.Claim ist dein Begleiter f\u00fcr Genesung und Wohlbefinden.', 'ja':'Re.Claim is your recovery & wellness companion.', 'ru':'Re.Claim is your recovery & wellness companion.', 'zh-cn':'Re.Claim 是您的康复 & wellness companion.', ar:'Re.Claim is your recovery & wellness companion.'},
'Today\'s Commitment Made':{es:'Compromiso de Hoy Realizado', fr:'Engagement du Jour Effectu\u00e9', de:'Heutiges Bekenntnis Abgegeben', ar:'Today\'s Commitment Made'},
'Commit to Today':{es:'Comprometerse Hoy', fr:'S\'engager Aujourd\'hui', de:'Heute Verpflichten', ar:'التزم اليوم'},
'You pledged to stay sober today.':{es:'Te comprometiste a estar sobrio hoy.', fr:'Vous vous \u00eates engag\u00e9 \u00e0 rester sobre aujourd\'hui.', de:'Du hast dich verpflichtet, heute n\u00fcchtern zu bleiben.', 'ja':'You pledged to stay sober today.', 'ru':'You pledged to stay sober today.', 'zh-cn':'您承诺今天保持清醒。', ar:'You pledged to stay sober today.'},
'I commit to staying sober and taking care of myself today.':{es:'Me comprometo a mantenerme sobrio y cuidarme hoy.', fr:'Je m\'engage \u00e0 rester sobre et \u00e0 prendre soin de moi aujourd\'hui.', de:'Ich verpflichte mich, heute n\u00fcchtern zu bleiben und auf mich aufzupassen.', 'ja':'I commit to staying sober and taking care of myself today.', 'ru':'I commit to staying sober and taking care of myself today.', 'zh-cn':'我承诺保持清醒 and taking care of myself today.', ar:'I commit to staying sober and taking care of myself today.'},
'Overcame':{es:'Super\u00f3', fr:'A surmont\u00e9', de:'\u00dcberwunden', 'ja':'Overcame', 'ru':'Overcame', 'zh-cn':'克服了', ar:'Overcame'},
'Recovery Goals':{es:'Metas de Recuperaci\u00f3n', fr:'Objectifs de R\u00e9tablissement', de:'Genesungsziele', ar:'أهداف التعافي'},
'Set goals to track your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.':{es:'Establece metas para seguir tu progreso. Ej: diario 5x/semana, meditar diario, asistir a una reuni\u00f3n.', fr:'Fixez des objectifs pour suivre votre progression. Ex: journal 5x/semaine, m\u00e9ditation quotidienne, assister \u00e0 une r\u00e9union.', de:'Setze Ziele, um deinen Fortschritt zu verfolgen. Z.B. Tagebuch 5x/Woche, t\u00e4glich meditieren, an einem Treffen teilnehmen.', 'ja':'Set goals to track your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.', 'ru':'Set goals to track your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.', 'zh-cn':'设定目标以跟踪 your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.', ar:'Set goals to track your recovery progress. Examples: journal 5x/week, meditate daily, attend a meeting.'},
'Add Goal':{es:'Agregar Meta', fr:'Ajouter un Objectif', de:'Ziel Hinzuf\u00fcgen', ar:'إضافة هدف'},
'New Recovery Goal':{es:'Nueva Meta de Recuperaci\u00f3n', fr:'Nouvel Objectif de R\u00e9tablissement', de:'Neues Genesungsziel', ar:'هدف تعافي جديد'},
'day streak':{es:'racha de d\u00edas', fr:'s\u00e9rie de jours', de:'Tageserie', ar:'تسلسل أيام'},
'Write in Your Journal':{es:'Escribe en tu Diario', fr:'\u00c9crivez dans Votre Journal', de:'Schreib in dein Tagebuch', 'ja':'ジャーナルに書く', 'ru':'Напишите в дневнике', 'zh-cn':'写日记', ar:'اكتب في مذكراتك'},
'Free Write':{es:'Escritura Libre', fr:'\u00c9criture Libre', de:'Freies Schreiben', 'ja':'自由記述', 'ru':'Свободное письмо', 'zh-cn':'自由书写', ar:'كتابة حرة'},
'Quick Mood':{es:'Estado R\u00e1pido', fr:'Humeur Rapide', de:'Schnelle Stimmung', 'ja':'クイï気分', 'ru':'Быстрое настроение', 'zh-cn':'快速心情', ar:'مزاج سريع'},
'Log Quick Mood':{es:'Registrar Estado R\u00e1pido', fr:'Enregistrer l\'Humeur', de:'Stimmung Schnell Erfassen', 'ja':'気分を記録', 'ru':'Записать быстрое настроение', 'zh-cn':'记录快速心情', ar:'سجل مزاج سريع'},
'Streak Calendar':{es:'Calendario de Rachas', fr:'Calendrier des S\u00e9ries', de:'Serienkalender', 'ja':'連続記録カレンダー', 'ru':'Календарь серий', 'zh-cn':'连续日历', ar:'تقويم التسلسل'},
'Write your thoughts':{es:'Escribe tus pensamientos', fr:'\u00c9crivez vos pens\u00e9es', de:'Schreib deine Gedanken', 'ja':'考えを書く', 'ru':'Запишите свои мысли', 'zh-cn':'写你的想法', ar:'اكتب أفكارك'},
"HeroGuide's Reflection":{es:'Reflexi\u00f3n de HeroGuide', fr:'R\u00e9flexion d\'HeroGuide', de:'HeroGuides Reflexion', ar:'تأمل HeroGuide'},
'Based on your journal entry':{es:'Basado en tu entrada del diario', fr:'Bas\u00e9 sur votre entr\u00e9e de journal', de:'Basierend auf deinem Tagebucheintrag', 'ja':'ジャーナルエントリに基づく', 'ru':'На основе вашей записи в дневнике', 'zh-cn':'根据你的日记条目', ar:'بناءً على إدخال مذكراتك'},
'Mood analysis':{es:'An\u00e1lisis de humor', fr:'Analyse d\'humeur', de:'Stimmungsanalyse', 'ja':'気分分析', 'ru':'Анализ настроения', 'zh-cn':'心情分析', ar:'تحليل المزاج'},
"HeroGuide's insight":{es:'Perspectiva de HeroGuide', fr:'Aper\u00e7u d\'HeroGuide', de:'HeroGuides Einsicht', ar:'رؤية HeroGuide'},
"HeroGuide's suggestions for you":{es:'Sugerencias de HeroGuide para ti', fr:'Suggestions d\'HeroGuide pour vous', de:'HeroGuides Vorschl\u00e4ge f\u00fcr dich', ar:'اقتراحات HeroGuide لك'},
'Reflect with HeroGuide':{es:'Reflexionar con HeroGuide', fr:'R\u00e9fl\u00e9chir avec HeroGuide', de:'Mit HeroGuide Reflektieren', 'ja':'アーサーと振りԋ', 'ru':'Размышляйте с Артуром', 'zh-cn':'与HeroGuide一起反思', ar:'تأمل مع HeroGuide'},

'How are you feeling today?':{es:'\u00bfC\u00f3mo te sientes hoy?', fr:'Comment vous sentez-vous aujourd\'hui ?', de:'Wie f\u00fchlst du dich heute?', 'ja':'今日の気分はいかがですか？', 'ru':'Как вы себя чувствуете сегодня?', 'zh-cn':'你今天感ɂ何？', ar:'كيف تشعر اليوم؟'},
'Mark Presence':{es:'Registrar', fr:'Point', de:'Eintragen', 'ja':'チェïイン', 'ru':'Отметиться', 'zh-cn':'签到', ar:'تسجيل الحضور'},
'Log Craving':{es:'Registrar Antojo', fr:'Enregistrer une Fringale', de:'Craving Erfassen', 'ja':'渴望を記録', 'ru':'Записать тягу', 'zh-cn':'记录渴望', ar:'سجل الرغبة'},
'View Patterns':{es:'Ver Patrones', fr:'Voir les Tendances', de:'Muster Anzeigen', 'ja':'ѿーンを表示', 'ru':'Просмотреть паттерны', 'zh-cn':'查看模式', ar:'عرض الأنماط'},
'Save Check-In':{es:'Guardar Check-in', fr:'Enregistrer le Check-in', de:'Check-in Speichern', 'ja':'チェックイン保存', 'ru':'Сохранить отметку', 'zh-cn':'保存签到', ar:'حفظ تسجيل الدخول'},
'Log Another':{es:'Registrar Otro', fr:'Enregistrer un Autre', de:'Weiteres Erfassen', 'ja':'別の記録', 'ru':'Записать ещё', 'zh-cn':'记录另一个', ar:'سجل آخر'},
'View Streak Calendar':{es:'Ver Calendario de Rachas', fr:'Voir le Calendrier des S\u00e9ries', de:'Serienkalender Anzeigen', 'ja':'連続記録カレンダーを見る', 'ru':'Просмотреть календарь серий', 'zh-cn':'查看连续日历', ar:'عرض تقويم التسلسل'},
'Reflect with HeroGuide':{es:'Reflexionar con HeroGuide', fr:'R\u00e9fl\u00e9chir avec HeroGuide', de:'Mit HeroGuide Reflektieren', ar:'تأمل مع HeroGuide'},
'Reflect':{es:'Reflexionar', fr:'R\u00e9fl\u00e9chir', de:'Reflektieren', ar:'تأمل'},
'Day Journal Streak':{es:'Racha de Diario', fr:'S\u00e9rie de Journal', de:'Tagebuch-Serie', 'ja':'日記連続記録', 'ru':'Дневная серия дневника', 'zh-cn':'日记连续天数', ar:'سلسلة مذكرات الأيام'},
'Keep it going! Write today to maintain your streak.':{es:'\u00a1Sigue as\u00ed! Escribe hoy para mantener tu racha.', fr:'Continuez ! \u00c9crivez aujourd\'hui pour maintenir votre s\u00e9rie.', de:'Weiter so! Schreib heute, um deine Serie zu halten.', 'ja':'続けましょう！連続記録を維持するために今日書きましょう。', 'ru':'Продолжайте! Пишите сегодня, чтобы сохранить серию.', 'zh-cn':'保持下去！今天写日记以维持连续记录。', ar:'استمر! اكتب اليوم للحفاظ على تسلسلك.'},
'Streak broken':{es:'Racha rota', fr:'S\u00e9rie bris\u00e9e', de:'Serie unterbrochen', 'ja':'連続記録が途切れました', 'ru':'Серия прервана', 'zh-cn':'连续中断', ar:'انقطع التسلسل'},
'Write today to start a new streak!':{es:'Escribe hoy para empezar una nueva racha.', fr:'\u00c9crivez aujourd\'hui pour commencer une nouvelle s\u00e9rie.', de:'Schreib heute, um eine neue Serie zu starten.', 'ja':'新しい連続記録をˁるために今日書きましょう！', 'ru':'Пишите сегодня, чтобы начать новую серию!', 'zh-cn':'今天开˙，开启新的连续！', ar:'اكتب اليوم لبدء تسلسل جديد!'},
"Today's Prompt:":{es:'Tema de hoy:', fr:'Sujet du jour :', de:'Heutige Aufforderung:', ar:'موجه اليوم:'},
'Free Write':{es:'Escritura Libre', fr:'\u00c9criture Libre', de:'Freies Schreiben', ar:'كتابة حرة'},
'Write whatever is on your mind':{es:'Escribe lo que tengas en mente', fr:'\u00c9crivez ce qui vous passe par la t\u00eate', de:'Schreib, was dir durch den Kopf geht', 'ja':'頭に浮かぶことを何でも書く', 'ru':'Пишите всё, что у вас на уме', 'zh-cn':'写下你心中所想', ar:'اكتب ما يجول في خاطرك'},
'Quick Mood':{es:'Estado R\u00e1pido', fr:'Humeur Rapide', de:'Schnelle Stimmung', ar:'مزاج سريع'},
'Just log your mood':{es:'Solo registra tu estado', fr:'Enregistrez simplement votre humeur', de:'Einfach deine Stimmung erfassen', 'ja':'気分を記録するだけ', 'ru':'Просто запишите настроение', 'zh-cn':'只需记录心情', ar:'فقط سجل مزاجك'},
'Terrible':{es:'P\u00e9simo', fr:'Terrible', de:'Schrecklich', 'ja':'最悪', 'ru':'Ужасно', 'zh-cn':'糟糕', ar:'فظيع'},
'Bad':{es:'Malo', fr:'Mauvais', de:'Schlecht', 'ja':'悪い', 'ru':'Плохо', 'zh-cn':'不好', ar:'سيء'},
'Okay':{es:'Bien', fr:'Correct', de:'Okay', 'ja':'普通', 'ru':'Нормально', 'zh-cn':'一般', ar:'مقبول'},
'Good':{es:'Bueno', fr:'Bon', de:'Gut', 'ja':'良い', 'ru':'Хорошо', 'zh-cn':'好', ar:'جيد'},
'Great':{es:'Genial', fr:'Super', de:'Toll', 'ja':'素晴らしい', 'ru':'Отлично', 'zh-cn':'很好', ar:'ممتاز'},
'Tap your mood above, then save:':{es:'Toca tu estado arriba, luego guarda:', fr:'Appuyez sur votre humeur ci-dessus, puis enregistrez :', de:'Tippe auf deine Stimmung oben, dann speichern:', 'ja':'上の気分をタップして保存：', 'ru':'Нажмите на настроение выше, затем сохраните:', 'zh-cn':'点击上方的心情，然后保存：', ar:'انقر على مزاجك أعلاه، ثم حفظ:'},
'Goal:':{es:'Meta:', fr:'Objectif :', de:'Ziel:', 'ja':'目標：', 'ru':'Цель:', 'zh-cn':'目标：', ar:'الهدف:'},
'words':{es:'palabras', fr:'mots', de:'W\u00f6rter', 'ja':'単語', 'ru':'слов', 'zh-cn':'?', ar:'كلمات'},
'Save Entry':{es:'Guardar Entrada', fr:'Enregistrer l\'Entr\u00e9e', de:'Eintrag Speichern', 'ja':'エントリを保存', 'ru':'Сохранить запись', 'zh-cn':'保存条目', ar:'حفظ الإدخال'},
'Track':{es:'Seguimiento', fr:'Suivi', de:'Verfolgen', ar:'تتبع'},
'Mood History':{es:'Historial de \u00c1nimo', fr:'Historique d\'Humeur', de:'Stimmungsverlauf', ar:'تاريخ المزاج'},
'No moods logged yet.':{es:'A\u00fan no hay estados registrados.', fr:'Aucune humeur enregistr\u00e9e pour l\'instant.', de:'Noch keine Stimmungen erfasst.', 'ja':'まだ気分が記録されていません。', 'ru':'Настроений ещё не записано.', 'zh-cn':'尚未记录心情。', ar:'لم يتم تسجيل أي مزاج بعد.'},
"Today's Habits":{es:'H\u00e1bitos de Hoy', fr:'Habitudes du Jour', de:'Heutige Gewohnheiten', ar:'عادات اليوم'},
'habits done today':{es:'h\u00e1bitos hechos hoy', fr:'habitudes faites aujourd\'hui', de:'heute erledigte Gewohnheiten', 'ja':'今日完了した習慣', 'ru':'привычек выполнено сегодня', 'zh-cn':'今日完成的习惯', ar:'العادات المنجزة اليوم'},
'No habits yet.':{es:'A\u00fan no hay h\u00e1bitos.', fr:'Pas encore d\'habitudes.', de:'Noch keine Gewohnheiten.', 'ja':'まだ習慣がありません。', 'ru':'Привычек пока нет.', 'zh-cn':'ء有习惯。', ar:'لا توجد عادات بعد.'},
'View Streak Calendar':{es:'Ver Calendario de Rachas', fr:'Voir le Calendrier des S\u00e9ries', de:'Serienkalender Anzeigen', ar:'عرض تقويم التسلسل'},
'Journal':{es:'Diario', fr:'Journal', de:'Tagebuch', ar:'مذكرات'},
'No journal entries yet. Start writing!':{es:'A\u00fan no hay entradas. \u00a1Empieza a escribir!', fr:'Pas encore d\'entr\u00e9es. Commencez \u00e0 \u00e9crire !', de:'Noch keine Eintr\u00e4ge. Fang an zu schreiben!', 'ja':'まだジャーナルエントリがありません。書きˁましょう！', 'ru':'Записей в дневнике пока нет. Начните писать!', 'zh-cn':'ء有日记条目。开˙吧！', ar:'لا توجد إدخالات مذكرات بعد. ابدأ بالكتابة!'},
'Search entries...':{es:'Buscar entradas...', fr:'Rechercher entr\u00e9es...', de:'Eintr\u00e4ge suchen...', ar:'بحث في الإدخالات...'},
'New Journal Entry':{es:'Nueva Entrada', fr:'Nouvelle Entr\u00e9e', de:'Neuer Eintrag', 'ja':'新しいジャーナルエントリ', 'ru':'Новая запись в дневнике', 'zh-cn':'新建日记条目', ar:'إدخال مذكرات جديد'},
'Prompt:':{es:'Tema:', fr:'Sujet :', de:'Aufforderung:', 'ja':'プロンプト：', 'ru':'Подсказка:', 'zh-cn':'提示：', ar:'موجه:'},
'Write something first.':{es:'Escribe algo primero.', fr:'\u00c9crivez d\'abord quelque chose.', de:'Schreib zuerst etwas.', 'ja':'最初に何か書いてください。', 'ru':'Сначала напишите что-нибудь.', 'zh-cn':'请先写点什么。', ar:'اكتب شيئاً أولاً.'},
'No entries matching':{es:'Ninguna entrada coincide con', fr:'Aucune entr\u00e9e correspondant \u00e0', de:'Keine Eintr\u00e4ge passen zu', 'ja':'一致するエントリはありません', 'ru':'Нет подходящих записей', 'zh-cn':'没有匹配的条目', ar:'لا توجد إدخالات مطابقة'},
'Your Streaks':{es:'Tus Rachas', fr:'Vos S\u00e9ries', de:'Deine Serien', ar:'تسلسلاتك'},
'Current':{es:'Actual', fr:'Actuel', de:'Aktuell', ar:'الحالي'},
'Best Ever':{es:'Mejor Marca', fr:'Meilleur Score', de:'Bestwert', ar:'الأفضل على الإطلاق'},
'Active Days':{es:'D\u00edas Activos', fr:'Jours Actifs', de:'Aktive Tage', ar:'أيام نشطة'},
'No streaks yet. Log moods or check in daily to build your streak!':{es:'A\u00fan no hay rachas. \u00a1Registra estados o haz check-in diario para construir tu racha!', fr:'Pas encore de s\u00e9ries. Enregistrez des humeurs ou faites un point quotidien pour construire votre s\u00e9rie !', de:'Noch keine Serien. Erfasse Stimmungen oder mache t\u00e4gliche Check-ins, um deine Serie aufzubauen!', 'ja':'まだ連続記録がありません。気分を記録するか、毎日チェïインして連続記録を作りましょう！', 'ru':'Серий пока нет. Записывайте настроение или отмечайтесь ежедневно, чтобы создать серию!', 'zh-cn':'ء有连续记录。记录心情或每日签到以建立连续！', ar:'لا توجد تسلسلات بعد. سجل المزاج أو سجل الوصول يومياً لبناء تسلسلك!'},
'Current streak':{es:'Racha actual', fr:'S\u00e9rie actuelle', de:'Aktuelle Serie', 'ja':'現在の連続', 'ru':'Текущая серия', 'zh-cn':'当前连续', ar:'التسلسل الحالي'},
'Past Streak':{es:'Racha anterior', fr:'S\u00e9rie pr\u00e9c\u00e9dente', de:'Vorherige Serie', 'ja':'過去の連続', 'ru':'Прошлая серия', 'zh-cn':'ǻ连续', ar:'التسلسل السابق'},
'From:':{es:'De:', fr:'Du :', de:'Von:', 'ja':'開始：', 'ru':'От:', 'zh-cn':'?:', ar:'من:'},
'To:':{es:'Hasta:', fr:'Au :', de:'Bis:', 'ja':'?:', 'ru':'?:', 'zh-cn':'?:', ar:'إلى:'},
'Duration:':{es:'Duraci\u00f3n:', fr:'Dur\u00e9e :', de:'Dauer:', 'ja':'期間：', 'ru':'Длительность:', 'zh-cn':'时长：', ar:'المدة:'},
'Sobriety Tracker':{es:'Seguimiento de Sobriedad', fr:'Suivi de Sobri\u00e9t\u00e9', de:'N\u00fcchternheits-Tracker', ar:'متتبع اليقظة'},
'Recovery Timeline':{es:'L\u00ednea de Tiempo', fr:'Chronologie du R\u00e9tablissement', de:'Genesungs-Zeitleiste', 'ja':'ީタイムライン', 'ru':'Хронология выздоровления', 'zh-cn':'康复时间线', ar:'الجدول الزمني للتعافي'},
'Show Timeline':{es:'Mostrar L\u00ednea', fr:'Afficher la Chronologie', de:'Zeitleiste Anzeigen', 'ja':'タイムラインを表示', 'ru':'Показать хронологию', 'zh-cn':'显示时间线', ar:'إظهار الجدول الزمني'},
'Hide Timeline':{es:'Ocultar L\u00ednea', fr:'Masquer la Chronologie', de:'Zeitleiste Ausblenden', 'ja':'タイムラインを非表示', 'ru':'Скрыть хронологию', 'zh-cn':'隐藏时间线', ar:'إخفاء الجدول الزمني'},
'Log Quick Mood':{es:'Registrar Estado R\u00e1pido', fr:'Enregistrer l\'Humeur', de:'Stimmung Schnell Erfassen', ar:'سجل مزاج سريع'},
'Today\'s Challenge':{es:'Desaf\u00edo de Hoy', fr:'D\u00e9fi du Jour', de:'Heutige Herausforderung', ar:'تحدي اليوم'},
'Daily Challenge':{es:'Desaf\u00edo Diario', fr:'D\u00e9fi Quotidien', de:'T\u00e4gliche Herausforderung', 'ja':'日替わりチャレンジ', 'ru':'Ежедневный вызов', 'zh-cn':'每日挑战', ar:'تحدي يومي'},
'New':{es:'Nuevo', fr:'Nouveau', de:'Neu', 'ja':'新規', 'ru':'Новый', 'zh-cn':'新建', ar:'جديد'},
'Wellness':{es:'Enfermer\u00eda', fr:'Infirmerie', de:'Krankenstation', 'ja':'医務室', 'ru':'Лазарет', 'zh-cn':'医务室', ar:'مستوصف'},
'History':{es:'Cr\u00f3nica', fr:'Chronique', de:'Chronik', 'ja':'年代記', 'ru':'Хроника', 'zh-cn':'编年史', ar:'وقائع'},
'Tools':{es:'Armer\u00eda', fr:'Armurerie', de:'Waffenkammer', 'ja':'武器庫', 'ru':'Оружейная', 'zh-cn':'军械库', ar:'مستودع الأسلحة'},
'Habits':{es:'H\u00e1bitos', fr:'Habitudes', de:'Gewohnheiten', 'ja':'習慣', 'ru':'Привычки', 'zh-cn':'习惯', ar:'عادات'},
'Insights':{es:'Perspectivas', fr:'Aper\u00e7us', de:'Einblicke', 'ja':'洞察', 'ru':'Инсайты', 'zh-cn':'洞察', ar:'رؤى'},
'Achievements':{es:'Logros', fr:'Succ\u00e8s', de:'Errungenschaften', 'ja':'実績', 'ru':'Достижения', 'zh-cn':'成就', ar:'إنجازات'},
'Journal':{es:'Scriptorium', fr:'Scriptorium', de:'Skriptorium', 'ja':'写字室', 'ru':'Скрипторий', 'zh-cn':'抄写室', ar:'النسخ'},
'Relapse Rescue':{es:'Rescate de Reca\u00edda', fr:'Sauvetage de Rechute', de:'R\u00fcckfall-Rettung', 'ja':'再発救助', 'ru':'Спасение при рецидиве', 'zh-cn':'复发救援', ar:'إنقاذ الانتكاس'},
'Relapse Plan':{es:'Plan de Reca\u00edda', fr:'Plan de Rechute', de:'R\u00fcckfall-Plan', 'ja':'再発計画', 'ru':'План рецидива', 'zh-cn':'复发计划', ar:'خطة الانتكاس'},
'Fresh Start':{es:'Perd\u00f3n Real', fr:'Gr\u00e2ce Royale', de:'K\u00f6nigliche Begnadigung', 'ja':'王室の恩赦', 'ru':'Королевское помилование', 'zh-cn':'皇家赦免', ar:'العفو الملكي'},
'Time Capsule':{es:'C\u00e1psula del Tiempo', fr:'Capsule Temporelle', de:'Zeitkapsel', 'ja':'タイムカプセル', 'ru':'Капсула времени', 'zh-cn':'时间胶囊', ar:'كبسولة الزمن'},
'Alliances':{es:'Alianzas', fr:'Alliances', de:'Allianzen', 'ja':'同盟', 'ru':'Союзы', 'zh-cn':'联盟', ar:'تحالفات'},
'Programs':{es:'Programas', fr:'Programmes', de:'Programme', 'ja':'プログラム', 'ru':'Программы', 'zh-cn':'计划', ar:'برامج'},
'Screeners':{es:'Evaluaciones', fr:'D\u00e9pistages', de:'Screening-Tools', 'ja':'スクリーニング', 'ru':'Скрининги', 'zh-cn':'筛查', ar:'فحوصات'},
'Install App':{es:'Instalar App', fr:'Installer l\u0027App', de:'App Installieren', 'ja':'アプリをインストール', 'ru':'Установить приложение', 'zh-cn':'安装应用', ar:'تثبيت التطبيق'},
'Delete All':{es:'Eliminar Todo', fr:'Tout Supprimer', de:'Alles L\u00f6schen', 'ja':'すべて削除', 'ru':'Удалить всё', 'zh-cn':'全部删除', ar:'حذف الكل'},
'Articles':{es:'Art\u00edculos', fr:'Articles', de:'Artikel', 'ja':'記事', 'ru':'Статьи', 'zh-cn':'文章', ar:'مقالات'},
'Books':{es:'Libros', fr:'Livres', de:'Bücher', 'ja':'本', 'ru':'Книги', 'zh-cn':'书籍', ar:'كتب'},
'Podcasts':{es:'Podcasts', fr:'Podcasts', de:'Podcasts', 'ja':'ポッドキャスト', 'ru':'Подкасты', 'zh-cn':'播客', ar:'بودكاست'},
'Videos':{es:'Videos', fr:'Vidéos', de:'Videos', 'ja':'動画', 'ru':'Видео', 'zh-cn':'视频', ar:'فيديو'},
'Forgot password?':{es:'¿Olvidaste tu contraseña?', fr:'Mot de passe oublié ?', de:'Passwort vergessen?', 'ja':'パスワードをお忘れですか？', 'ru':'Забыли пароль?', 'zh-cn':'忘记密码？', ar:'هل نسيت كلمة المرور؟'},
'Sending...':{es:'Enviando...', fr:'Envoi...', de:'Senden...', 'ja':'送信中...', 'ru':'Отправка...', 'zh-cn':'发送中...', ar:'جارٍ الإرسال...'},
'Enter your email address first.':{es:'Ingresa tu correo electrónico primero.', fr:'Entrez votre adresse e-mail d\'abord.', de:'Geben Sie zuerst Ihre E-Mail-Adresse ein.', 'ja':'最初にメールアドレスを入力してください。', 'ru':'Сначала введите свой адрес электронной почты.', 'zh-cn':'请先输入您的电子邮件地址。', ar:'أدخل بريدك الإلكتروني أولاً.'},
'Enter a valid email address.':{es:'Ingresa un correo electrónico válido.', fr:'Entrez une adresse e-mail valide.', de:'Geben Sie eine gültige E-Mail-Adresse ein.', 'ja':'有効なメールアドレスを入力してください。', 'ru':'Введите действительный адрес электронной почты.', 'zh-cn':'请输入有效的电子邮件地址。', ar:'أدخل عنوان بريد إلكتروني صحيح.'},
'Cloud authentication is not available.':{es:'La autenticación en la nube no está disponible.', fr:'L\'authentification cloud n\'est pas disponible.', de:'Cloud-Authentifizierung ist nicht verfügbar.', 'ja':'クラウド認証が利用できません。', 'ru':'Облачная аутентификация недоступна.', 'zh-cn':'云身份验证不可用。', ar:'المصادقة السحابية غير متوفرة.'},
'Password reset email sent. Check your inbox.':{es:'Correo de restablecimiento de contraseña enviado. Revisa tu bandeja de entrada.', fr:'E-mail de réinitialisation du mot de passe envoyé. Vérifiez votre boîte de réception.', de:'E-Mail zum Zurücksetzen des Passworts gesendet. Überprüfen Sie Ihren Posteingang.', 'ja':'パスワードリセットメールを送信しました。受信箱を確認してください。', 'ru':'Письмо для сброса пароля отправлено. Проверьте свой почтовый ящик.', 'zh-cn':'密码重置邮件已发送。请检查您的收件箱。', ar:'تم إرسال بريد إعادة تعيين كلمة المرور. تحقق من صندوق الوارد الخاص بك.'},
'Email verified':{es:'Correo verificado', fr:'E-mail vérifié', de:'E-Mail verifiziert', 'ja':'メール確認済み', 'ru':'Электронная почта подтверждена', 'zh-cn':'邮箱已验证', ar:'تم التحقق من البريد الإلكتروني'},
'Email not verified':{es:'Correo no verificado', fr:'E-mail non vérifié', de:'E-Mail nicht verifiziert', 'ja':'メール未確認', 'ru':'Электронная почта не подтверждена', 'zh-cn':'邮箱未验证', ar:'البريد الإلكتروني غير مُحقق'},
'Verify now':{es:'Verificar ahora', fr:'Vérifier maintenant', de:'Jetzt verifizieren', 'ja':'今すぐ確認', 'ru':'Подтвердить сейчас', 'zh-cn':'立即验证', ar:'تحقق الآن'},
'Verification email sent. Check your inbox.':{es:'Correo de verificación enviado. Revisa tu bandeja de entrada.', fr:'E-mail de vérification envoyé. Vérifiez votre boîte de réception.', de:'Bestätigungs-E-Mail gesendet. Überprüfen Sie Ihren Posteingang.', 'ja':'確認メールを送信しました。受信箱を確認してください。', 'ru':'Письмо с подтверждением отправлено. Проверьте свой почтовый ящик.', 'zh-cn':'验证邮件已发送。请检查您的收件箱。', ar:'تم إرسال بريد التحقق. تحقق من صندوق الوارد الخاص بك.'},
'You are not signed in.':{es:'No has iniciado sesión.', fr:'Vous n\'êtes pas connecté.', de:'Sie sind nicht angemeldet.', 'ja':'サインインしていません。', 'ru':'Вы не вошли в систему.', 'zh-cn':'您未登录。', ar:'أنت غير مسجل الدخول.'},
'Day':{es:'Día', fr:'Jour', de:'Tag', 'ja':'日', 'ru':'День', 'zh-cn':'天', ar:'يوم'},
'Begin your journey':{es:'Comienza tu viaje', fr:'Commencez votre voyage', de:'Beginne deine Reise', 'ja':'旅を始めましょう', 'ru':'Начните свой путь', 'zh-cn':'开始你的旅程', ar:'ابدأ رحلتك'},
'No connection — changes saved locally':{es:'Sin conexión — los cambios se guardan localmente', fr:'Hors ligne — les modifications sont enregistrées localement', de:'Keine Verbindung — Änderungen werden lokal gespeichert', 'ja':'接続なし — 変更は端末に保存されます', 'ru':'Нет соединения — изменения сохраняются локально', 'zh-cn':'无连接 — 更改已保存在本地', ar:'لا يوجد اتصال — يتم حفظ التغييرات محليًا'},
'No database connection':{es:'Sin conexión a la base de datos', fr:'Pas de connexion à la base de données', de:'Keine Datenbankverbindung', 'ja':'データベース接続がありません', 'ru':'Нет подключения к базе данных', 'zh-cn':'没有数据库连接', ar:'لا يوجد اتصال بقاعدة البيانات'},
'Journal Reflections':{es:'Reflexiones del diario', fr:'Réflexions du journal', de:'Tagebuch-Reflexionen', 'ja':'ジャーナルの振り返り', 'ru':'Размышления о записях', 'zh-cn':'日记反思', ar:'تأملات المذكرات'},
'Tap any entry below for a reflection summary and gentle suggestions.':{es:'Toca cualquier entrada para ver un resumen y sugerencias amables.', fr:'Appuyez sur une entrée pour obtenir un résumé et de douces suggestions.', de:'Tippe auf einen Eintrag für eine Zusammenfassung und sanfte Vorschläge.', 'ja':'エントリをタップすると、要約とやさしい提案が表示されます。', 'ru':'Нажмите на запись, чтобы увидеть сводку и мягкие рекомендации.', 'zh-cn':'点按任意条目即可查看摘要和温和的建议。', ar:'اضغط على أي إدخال لعرض ملخص واقتراحات لطيفة.'},
'Reflecting on your entries helps you see patterns in your recovery.':{es:'Reflexionar sobre tus entradas te ayuda a ver patrones en tu recuperación.', fr:'Réfléchir à vos entrées vous aide à voir des schémas dans votre rétablissement.', de:'Das Nachdenken über deine Einträge hilft dir, Muster in deiner Genesung zu erkennen.', 'ja':'エントリを振り返ると、回復のパターンが見えてきます。', 'ru':'Размышляя над записями, вы видите закономерности своего восстановления.', 'zh-cn':'反思你的条目有助于你看到恢复中的规律。', ar:'التأمل في إدخالاتك يساعدك على رؤية الأنماط في تعافيك.'},
 'All Partners':{'es':'Todos los compañeros', 'fr':'Tous les partenaires', 'de':'Alle Partner', 'ja':'すべてのパートナー', 'ru':'Все партнеры', 'zh-cn':'所有伙伴', 'ar':'جميع الشركاء'},
 'Addiction Assessment':{'es':'Evaluación de adicción', 'fr':'Évaluation de l\'addiction', 'de':'Sucht-Bewertung', 'ja':'依存症アセスメント', 'ru':'Оценка зависимости', 'zh-cn':'成瘾评估', 'ar':'تقييم الإدمان'},
 'Your View':{'es':'Tu Perspectiva', 'fr':'Votre Vue', 'de':'Deine Sicht', 'ja':'あなたの景色', 'ru':'Ваш вид', 'zh-cn':'你的视角', 'ar':'منظورك'},
 'Recommendations':{'es':'Recomendaciones', 'fr':'Recommandations', 'de':'Empfehlungen', 'ja':'おすすめ', 'ru':'Рекомендации', 'zh-cn':'推荐', 'ar':'توصيات'},
 'Share App':{'es':'Compartir App', 'fr':'Partager l\'app', 'de':'App teilen', 'ja':'アプリを共有', 'ru':'Поделиться приложением', 'zh-cn':'分享应用', 'ar':'مشاركة التطبيق'},
 'Your Journal Insights':{'es':'Tus perspectivas del diario', 'fr':'Vos aperçus du journal', 'de':'Deine Tagebuch-Einblicke', 'ja':'あなたのジャーナル分析', 'ru':'Ваши инсайты из дневника', 'zh-cn':'你的日记洞察', 'ar':'رؤى مذكراتك'},
 'Submit Reflection & Complete':{'es':'Enviar reflexión y completar', 'fr':'Envoyer la réflexion et terminer', 'de':'Reflexion abschicken & abschließen', 'ja':'振り返りを送信して完了', 'ru':'Отправить размышление и завершить', 'zh-cn':'提交反思并完成', 'ar':'إرسال التأمل وإكمال'},
 'Write a short reflection in response to the prompt...':{'es':'Escribe una breve reflexión en respuesta a la indicación...', 'fr':'Écrivez une courte réflexion en réponse à la consigne...', 'de':'Schreibe eine kurze Reflexion als Antwort auf die Aufforderung...', 'ja':'プロンプトに応える短い振り返りを書いてください…', 'ru':'Напишите краткое размышление в ответ на подсказку…', 'zh-cn':'根据提示写一段简短的反思……', 'ar':'اكتب تأملاً قصيراً استجابةً للموجه...'},
 'Write a short reflection first.':{'es':'Escribe primero una breve reflexión.', 'fr':'Écrivez d\'abord une courte réflexion.', 'de':'Schreibe zuerst eine kurze Reflexion.', 'ja':'先に短い振り返りを書いてください。', 'ru':'Сначала напишите краткое размышление.', 'zh-cn':'请先写一段简短的反思。', 'ar':'اكتب تأملاً قصيراً أولاً.'},
 'Completed today':{'es':'Completado hoy', 'fr':'Terminé aujourd\'hui', 'de':'Heute abgeschlossen', 'ja':'今日完了', 'ru':'Завершено сегодня', 'zh-cn':'今天已完成', 'ar':'أُنجز اليوم'},
 'your reflection is saved in your journal.':{'es':'tu reflexión está guardada en tu diario.', 'fr':'votre réflexion est enregistrée dans votre journal.', 'de':'deine Reflexion ist in deinem Tagebuch gespeichert.', 'ja':'あなたの振り返りはジャーナルに保存されました。', 'ru':'ваше размышление сохранено в дневнике.', 'zh-cn':'你的反思已保存到日记中。', 'ar':'تم حفظ تأملك في مذكراتك.'},
 'this week':{'es':'esta semana', 'fr':'cette semaine', 'de':'diese Woche', 'ja':'今週', 'ru':'на этой неделе', 'zh-cn':'本周', 'ar':'هذا الأسبوع'},
 'Complete missions to feed your world.':{'es':'Completa misiones para alimentar tu mundo.', 'fr':'Terminez des missions pour nourrir votre monde.', 'de':'Schließe Missionen ab, um deine Welt zu nähren.', 'ja':'ミッションを完了して世界を豊かにしましょう。', 'ru':'Выполняйте задания, чтобы питать свой мир.', 'zh-cn':'完成任务来滋养你的世界。', 'ar':'أكمل المهام لغذاء عالمك.'},
 'Your world is lush. Keep the streak alive.':{'es':'Tu mundo está exuberante. Mantén viva la racha.', 'fr':'Votre monde est luxuriant. Gardez la série vivante.', 'de':'Deine Welt ist üppig. Halte die Serie am Leben.', 'ja':'あなたの世界は豊かです。連続記録を守り続けましょう。', 'ru':'Ваш мир пышет. Продолжайте серию.', 'zh-cn':'你的世界郁郁葱葱。保持连胜。', 'ar':'عالمك خصب. أبقِ السلسلة حية.'},
 'Your world is blooming.':{'es':'Tu mundo está floreciendo.', 'fr':'Votre monde est en fleurs.', 'de':'Deine Welt blüht.', 'ja':'あなたの世界が花開いています。', 'ru':'Ваш мир цветёт.', 'zh-cn':'你的世界正在绽放。', 'ar':'عالمك يزهر.'},
 'Seeds are sprouting in your world.':{'es':'Las semillas brotan en tu mundo.', 'fr':'Les graines poussent dans votre monde.', 'de':'In deiner Welt sprießen Samen.', 'ja':'あなたの世界で種が芽吹いています。', 'ru':'В вашем мире прорастают семена.', 'zh-cn':'你的世界里正在发芽。', 'ar':'البذور تنبت في عالمك.'},
 'the goal ':{'es':'la meta ', 'fr':'l\'objectif ', 'de':'das Ziel ', 'ja':'目標 ', 'ru':'цель ', 'zh-cn':'目标 ', 'ar':'الهدف '},
 'a trigger like ':{'es':'un detonante como ', 'fr':'un déclencheur comme ', 'de':'ein Auslöser wie ', 'ja':'のような引き金 ', 'ru':'такой триггер, как ', 'zh-cn':'像这样的诱因 ', 'ar':'مثير مثل '},
 'your coping tool ':{'es':'tu herramienta de afrontamiento ', 'fr':'votre outil d\'adaptation ', 'de':'dein Bewältigungswerkzeug ', 'ja':'対処ツール ', 'ru':'ваш инструмент совладания ', 'zh-cn':'你的应对工具 ', 'ar':'أداتك للتكيف '},
 'someone who believes in you':{'es':'alguien que cree en ti', 'fr':'quelqu\'un qui croit en vous', 'de':'jemand, der an dich glaubt', 'ja':'あなたを信じてくれる人', 'ru':'кто-то, кто верит в вас', 'zh-cn':'相信你的人', 'ar':'شخص يؤمن بك'},
 'a win from the last 24 hours, however small':{'es':'una victoria de las últimas 24 horas, por pequeña que sea', 'fr':'une victoire des dernières 24 heures, si petite soit-elle', 'de':'einen Erfolg der letzten 24 Stunden, so klein er auch sein mag', 'ja':'この24時間の小さな勝利でも', 'ru':'победа за последние 24 часа, какой бы маленькой она ни была', 'zh-cn':'过去24小时里的一个小小的胜利', 'ar':'انتصار من آخر 24 ساعة، مهما كان صغيراً'},
 'a moment you almost slipped, and what held you back':{'es':'un momento en que casi recaíste y qué te sostuvo', 'fr':'un moment où vous avez failli rechuter et ce qui vous a retenu', 'de':'einen Moment, in dem du fast abgerutscht bist, und was dich gehalten hat', 'ja':'あなたが危うく滑りそうになった瞬間と、あなたを支えたもの', 'ru':'момент, когда вы чуть не сорвались, и что вас удержало', 'zh-cn':'你差点失控的时刻，以及是什么撑住了你', 'ar':'لحظة أوشكت فيها على الانزلاق وما منعك'},
 'Reflect on':{'es':'Reflexiona sobre', 'fr':'Réfléchissez à', 'de':'Denke nach über', 'ja':'振り返ってください：', 'ru':'Подумайте о', 'zh-cn':'反思', 'ar':'تأمل في'},
 'Look back at':{'es':'Mira atrás a', 'fr':'Repensez à', 'de':'Schau zurück auf', 'ja':'振り返って：', 'ru':'Вспомните о', 'zh-cn':'回顾', 'ar':'استرجع'},
 'Think about':{'es':'Piensa en', 'fr':'Pensez à', 'de':'Denke über', 'ja':'考えてください：', 'ru':'Подумайте о', 'zh-cn':'想一想', 'ar':'فكر في'},
 'Revisit':{'es':'Vuelve a visitar', 'fr':'Revenez sur', 'de':'Kehre zurück zu', 'ja':'再度振り返って：', 'ru':'Вернитесь к', 'zh-cn':'重温', 'ar':'أعد النظر في'},
 'Sit with':{'es':'Quédate con', 'fr':'Restez avec', 'de':'Verweile bei', 'ja':'そのまま感じてください：', 'ru':'Побудьте с', 'zh-cn':'与...共处', 'ar':'ابقَ مع'},
 'One small step will you take today?':{'es':'¿Qué paso pequeño darás hoy?', 'fr':'Quel petit pas ferez-vous aujourd\'hui ?', 'de':'Welchen kleinen Schritt wirst du heute gehen?', 'ja':'今日の小さな一歩は何ですか？', 'ru':'Какой маленький шаг вы сделаете сегодня?', 'zh-cn':'今天你要迈出的一小步是什么？', 'ar':'ما الخطوة الصغيرة التي ستتخذها اليوم؟'},
 'What were you feeling in that moment?':{'es':'¿Qué sentiste en ese momento?', 'fr':'Que ressentiez-vous à ce moment-là ?', 'de':'Was hast du in diesem Moment gefühlt?', 'ja':'その瞬間、何を感じていましたか？', 'ru':'Что вы чувствовали в тот момент?', 'zh-cn':'那一刻你是什么感觉？', 'ar':'ماذا شعرت في تلك اللحظة؟'},
 'What did it teach you about yourself?':{'es':'¿Qué te enseñó sobre ti mismo?', 'fr':'Que cela vous a-t-il appris sur vous-même ?', 'de':'Was hat es dich über dich selbst gelehrt?', 'ja':'それであなたは自分について何を学びましたか？', 'ru':'Что это научило вас о себе?', 'zh-cn':'它让你对自己有什么了解？', 'ar':'ما الذي علمك إياه عن نفسك؟'},
 'Write one sentence you need to hear today.':{'es':'Escribe una frase que necesitas escuchar hoy.', 'fr':'Écrivez une phrase que vous avez besoin d\'entendre aujourd\'hui.', 'de':'Schreibe einen Satz, den du heute hören musst.', 'ja':'今日あなたが聞くべき一文を書いてください。', 'ru':'Напишите одно предложение, которое вам нужно услышать сегодня.', 'zh-cn':'写一句你今天需要听到的话。', 'ar':'اكتب جملة واحدة تحتاج سماعها اليوم.'},
 'What changed inside you because of it?':{'es':'¿Qué cambió dentro de ti por ello?', 'fr':'Qu\'est-ce qui a changé en vous grâce à cela ?', 'de':'Was hat sich innerlich bei dir dadurch verändert?', 'ja':'それによってあなたの中で何が変わりましたか？', 'ru':'Что изменилось внутри вас из-за этого?', 'zh-cn':'因为这件事，你内心有什么改变？', 'ar':'ما الذي تغير بداخلك بسببه؟'},
 'Who could you tell about it?':{'es':'¿A quién podrías contárselo?', 'fr':'À qui pourriez-vous en parler ?', 'de':'Wem könntest du davon erzählen?', 'ja':'それについて誰に話せますか？', 'ru':'Кому вы могли бы об этом рассказать?', 'zh-cn':'你能告诉谁？', 'ar':'لمن يمكنك أن تحكي عنه؟'},
 'What would you say to a friend in the same spot?':{'es':'¿Qué le dirías a un amigo en tu lugar?', 'fr':'Que diriez-vous à un ami dans la même situation ?', 'de':'Was würdest du einem Freund in derselben Lage sagen?', 'ja':'同じ立場の友人がいたら何と言いますか？', 'ru':'Что бы вы сказали другу в такой же ситуации?', 'zh-cn':'你会对同样处境的伙伴说什么？', 'ar':'ماذا ستقول لصديق في نفس الموقف؟'},
 'Name three things it gave you.':{'es':'Nombra tres cosas que te dio.', 'fr':'Nommez trois choses que cela vous a apportées.', 'de':'Nenne drei Dinge, die es dir gegeben hat.', 'ja':'それがあなたに与えた三つのことを挙げてください。', 'ru':'Назовите три вещи, которые это вам дало.', 'zh-cn':'说出它带给你的三件事。', 'ar':'سمِّ ثلاث أشياء منحك إياها.'},
 'Recovery Timer':{'es':'Temporizador de recuperación', 'fr':'Minuteur de rétablissement', 'de':'Genesungs-Timer', 'ja':'回復タイマー', 'ru':'Таймер восстановления', 'zh-cn':'恢复计时器', 'ar':'مؤقت التعافي'},
 'You have held for':{'es':'Has mantenido durante', 'fr':'Vous avez tenu pendant', 'de':'Du hast durchgehalten für', 'ja':'あなたはの間持ちこたえました：', 'ru':'Вы продержались', 'zh-cn':'你已经坚持了', 'ar':'إستمررت لمدة'},
 'Reset timer':{'es':'Restablecer temporizador', 'fr':'Réinitialiser le minuteur', 'de':'Timer zurücksetzen', 'ja':'タイマーをリセット', 'ru':'Сбросить таймер', 'zh-cn':'重置计时器', 'ar':'إعادة ضبط المؤقت'},
 'DAYS':{'es':'DÍAS', 'fr':'JOURS', 'de':'TAGE', 'ja':'日数', 'ru':'ДНИ', 'zh-cn':'天数', 'ar':'أيام'},
 'COMMUNITY':{'es':'COMUNIDAD', 'fr':'COMMUNAUTÉ', 'de':'GEMEINSCHAFT', 'ja':'仲間', 'ru':'СООБЩЕСТВО', 'zh-cn':'社区', 'ar':'المجتمع'},
 'Record Relapse':{'es':'Registrar recaída', 'fr':'Enregistrer une rechute', 'de':'Rückfall aufzeichnen', 'ja':'再発を記録', 'ru':'Записать срыв', 'zh-cn':'记录复发', 'ar':'تسجيل انتكاسة'},
 'End Sobriety':{'es':'Terminar sobriedad', 'fr':'Mettre fin à la sobriété', 'de':'Nüchternheit beenden', 'ja':'断酒を終える', 'ru':'Завершить трезвость', 'zh-cn':'结束清醒期', 'ar':'إنهاء اليقظة'},
 'Started':{'es':'Iniciado', 'fr':'Commencé', 'de':'Begonnen', 'ja':'開始日', 'ru':'Начато', 'zh-cn':'开始于', 'ar':'بدأ'},
 'Your journey awaits':{'es':'Tu viaje te espera', 'fr':'Votre voyage vous attend', 'de':'Deine Reise wartet', 'ja':'あなたの旅が待っています', 'ru':'Ваше путешествие ждёт вас', 'zh-cn':'你的旅程正等着你', 'ar':'رحلتك في انتظارك'},
 'today':{'es':'hoy', 'fr':'aujourd\'hui', 'de':'heute', 'ja':'今日', 'ru':'сегодня', 'zh-cn':'今天', 'ar':'اليوم'},
 'year':{'es':'año', 'fr':'an', 'de':'Jahr', 'ja':'年', 'ru':'год', 'zh-cn':'年', 'ar':'سنة'},
 'years':{'es':'años', 'fr':'ans', 'de':'Jahre', 'ja':'年', 'ru':'года', 'zh-cn':'年', 'ar':'سنوات'},
 'month':{'es':'mes', 'fr':'mois', 'de':'Monat', 'ja':'か月', 'ru':'месяц', 'zh-cn':'个月', 'ar':'شهر'},
 'months':{'es':'meses', 'fr':'mois', 'de':'Monate', 'ja':'か月', 'ru':'месяца', 'zh-cn':'个月', 'ar':'أشهر'},
 'week':{'es':'semana', 'fr':'semaine', 'de':'Woche', 'ja':'週', 'ru':'неделя', 'zh-cn':'周', 'ar':'أسبوع'},
 'weeks':{'es':'semanas', 'fr':'semaines', 'de':'Wochen', 'ja':'週', 'ru':'недели', 'zh-cn':'周', 'ar':'أسابيع'},
 'Your Journey Awaits':{'es':'Tu viaje te espera', 'fr':'Votre voyage vous attend', 'de':'Deine Reise erwartet dich', 'ja':'あなたの旅が待っています', 'ru':'Ваше путешествие ждёт вас', 'zh-cn':'你的旅程在等待', 'ar':'رحلتك في انتظارك'},
 'Start Your Journey':{'es':'Comienza tu viaje', 'fr':'Commencez votre voyage', 'de':'Starte deine Reise', 'ja':'旅を始める', 'ru':'Начать путешествие', 'zh-cn':'开始你的旅程', 'ar':'ابدأ رحلتك'},
 'Your space awaits':{'es':'Tu espacio te espera', 'fr':'Votre espace vous attend', 'de':'Dein Raum wartet', 'ja':'あなたのスペースが待っています', 'ru':'Ваше пространство ждёт вас', 'zh-cn':'你的空间正等着你', 'ar':'مساحتك في انتظارك'},
 'Begin Your Journey':{'es':'Inicia tu viaje', 'fr':'Commencez votre voyage', 'de':'Beginne deine Reise', 'ja':'旅を始めましょう', 'ru':'Начните свой путь', 'zh-cn':'开始你的旅程', 'ar':'ابدأ رحلتك'},
 'Seed':{'es':'Semilla', 'fr':'Graine', 'de':'Same', 'ja':'種', 'ru':'Семя', 'zh-cn':'种子', 'ar':'بذرة'},
 'Root':{'es':'Raíz', 'fr':'Racine', 'de':'Wurzel', 'ja':'根', 'ru':'Корень', 'zh-cn':'根', 'ar':'جذر'},
 'Sprout':{'es':'Brote', 'fr':'Pousse', 'de':'Spross', 'ja':'新芽', 'ru':'Росток', 'zh-cn':'嫩芽', 'ar':'برعم'},
 'Grove':{'es':'Arboleda', 'fr':'Bosquet', 'de':'Hain', 'ja':'木立', 'ru':'Роща', 'zh-cn':'小树林', 'ar':'غابة صغيرة'},
 'Garden':{'es':'Jardín', 'fr':'Jardin', 'de':'Garten', 'ja':'庭園', 'ru':'Сад', 'zh-cn':'花园', 'ar':'حديقة'},
 'Meadow':{'es':'Prado', 'fr':'Prairie', 'de':'Wiese', 'ja':'草原', 'ru':'Луг', 'zh-cn':'草地', 'ar':'مرج'},
 'Forest':{'es':'Bosque', 'fr':'Forêt', 'de':'Wald', 'ja':'森', 'ru':'Лес', 'zh-cn':'森林', 'ar':'غابة'},
 'River':{'es':'Río', 'fr':'Rivière', 'de':'Fluss', 'ja':'川', 'ru':'Река', 'zh-cn':'河流', 'ar':'نهر'},
 'Mountain':{'es':'Montaña', 'fr':'Montagne', 'de':'Berg', 'ja':'山', 'ru':'Гора', 'zh-cn':'山', 'ar':'جبل'},
 'Ocean':{'es':'Océano', 'fr':'Océan', 'de':'Ozean', 'ja':'海', 'ru':'Океан', 'zh-cn':'海洋', 'ar':'محيط'},
 'World':{'es':'Mundo', 'fr':'Monde', 'de':'Welt', 'ja':'世界', 'ru':'Мир', 'zh-cn':'世界', 'ar':'عالم'},
 'A new beginning':{'es':'Un nuevo comienzo', 'fr':'Un nouveau départ', 'de':'Ein neuer Anfang', 'ja':'新たな始まり', 'ru':'Новое начало', 'zh-cn':'崭新的开始', 'ar':'بداية جديدة'},
 'Roots reach the soil':{'es':'Las raíces tocan el suelo', 'fr':'Les racines touchent le sol', 'de':'Die Wurzeln erreichen den Boden', 'ja':'根が土に届く', 'ru':'Корни достигают почвы', 'zh-cn':'根抵达土壤', 'ar':'الجذور تلامس التربة'},
 'New shoots follow the light':{'es':'Nuevos brotes siguen la luz', 'fr':'De nouvelles pousses suivent la lumière', 'de':'Neue Triebe folgen dem Licht', 'ja':'新しい芽が光を追う', 'ru':'Новые побеги тянутся к свету', 'zh-cn':'新芽追逐光明', 'ar':'براعم جديدة تتبع الضوء'},
 'The land takes shape':{'es':'La tierra toma forma', 'fr':'La terre prend forme', 'de':'Das Land nimmt Gestalt an', 'ja':'大地が形になる', 'ru':'Земля обретает форму', 'zh-cn':'大地开始成形', 'ar':'تأخذ الأرض شكلاً'},
 'A garden takes hold':{'es':'Un jardín florece', 'fr':'Un jardin s\'ancre', 'de':'Ein Garten ergreift Besitz', 'ja':'庭が根づく', 'ru':'Сад приживается', 'zh-cn':'花园扎根', 'ar':'تترسخ حديقة'},
 'Open meadow, tall grass':{'es':'Prado abierto, hierba alta', 'fr':'Prairie ouverte, herbes hautes', 'de':'Offene Wiese, hohes Gras', 'ja':'開けた草原、高い草', 'ru':'Открытый луг, высокая трава', 'zh-cn':'开阔的草地，高高的草', 'ar':'مرج مفتوح، عشب طويل'},
 'Deep green forest':{'es':'Bosque verde profundo', 'fr':'Forêt d\'un vert profond', 'de':'Tiefgrüner Wald', 'ja':'深緑の森', 'ru':'Глубокий зелёный лес', 'zh-cn':'深绿的森林', 'ar':'غابة خضراء عميقة'},
 'A steady, flowing river':{'es':'Un río constante y fluido', 'fr':'Une rivière régulière et paisible', 'de':'Ein stetiger, fließender Fluss', 'ja':'絶え間なく流れる川', 'ru':'Устойчивая, текущая река', 'zh-cn':'一条稳定流淌的河', 'ar':'نهر ثابت جارٍ'},
 'High mountain air':{'es':'Aire de montaña alta', 'fr':'Air de haute montagne', 'de':'Hohe Bergluft', 'ja':'高い山の空気', 'ru':'Горный воздух высоты', 'zh-cn':'高山空气', 'ar':'هواء الجبال العالية'},
 'The wide blue ocean':{'es':'El vasto océano azul', 'fr':'Le vaste océan bleu', 'de':'Der weite blaue Ozean', 'ja':'広大な青い海', 'ru':'Широкий голубой океан', 'zh-cn':'广阔的蓝色海洋', 'ar':'المحيط الأزرق الواسع'},
 'A whole world, in bloom':{'es':'Todo un mundo en flor', 'fr':'Un monde entier, en fleurs', 'de':'Eine ganze Welt in Blüte', 'ja':'花咲く全世界', 'ru':'Целый мир в цвету', 'zh-cn':'一个百花盛开的世界', 'ar':'عالم كامل في ازدهار'},
 'This screening helps you understand your relationship with substances.':{'es':'Este cuestionario te ayuda a entender tu relación con las sustancias.', 'fr':'Ce questionnaire vous aide à comprendre votre rapport aux substances.', 'de':'Dieser Test hilft dir, deine Beziehung zu Substanzen zu verstehen.', 'ja':'このチェックは、物質との関係を理解する助けになります。', 'ru':'Этот опросник поможет вам понять ваши отношения с веществами.', 'zh-cn':'这份筛查有助于你了解自己与物质的关系。', 'ar':'يساعدك هذا الفحص على فهم علاقتك بالمواد.'},
 'Help us understand where you are on your journey':{'es':'Ayúdanos a entender dónde estás en tu viaje', 'fr':'Aidez-nous à comprendre où vous en êtes dans votre voyage', 'de':'Hilf uns zu verstehen, wo du auf deiner Reise stehst', 'ja':'あなたが旅のどこにいるかを知らせてください', 'ru':'Помогите нам понять, где вы находитесь на своём пути', 'zh-cn':'帮助我们了解你正处于旅程中的哪个阶段', 'ar':'ساعدنا على فهم أين أنت في رحلتك'},
 'Low Risk':{'es':'Riesgo bajo', 'fr':'Risque faible', 'de':'Geringes Risiko', 'ja':'低リスク', 'ru':'Низкий риск', 'zh-cn':'低风险', 'ar':'خطر منخفض'},
 'Moderate':{'es':'Moderado', 'fr':'Modéré', 'de':'Mäßig', 'ja':'中程度', 'ru':'Умеренный', 'zh-cn':'中等', 'ar':'معتدل'},
 'Substantial':{'es':'Considerable', 'fr':'Substantiel', 'de':'Beträchtlich', 'ja':'かなり高い', 'ru':'Существенный', 'zh-cn':'较大', 'ar':'كبير'},
 'Severe':{'es':'Grave', 'fr':'Sévère', 'de':'Schwer', 'ja':'重度', 'ru':'Тяжёлый', 'zh-cn':'严重', 'ar':'شديد'},
 'Critical':{'es':'Crítico', 'fr':'Critique', 'de':'Kritisch', 'ja':'危険', 'ru':'Критический', 'zh-cn':'危急', 'ar':'حرج'},
 'The Big Picture':{'es':'El panorama general', 'fr':'La vue d\'ensemble', 'de':'Das große Ganze', 'ja':'全体図', 'ru':'Общая картина', 'zh-cn':'全局概览', 'ar':'الصورة الكبيرة'},
 'Here is a view of your patterns and progress...':{'es':'Aquí tienes una vista de tus patrones y progreso...', 'fr':'Voici une vue de vos schémas et de vos progrès...', 'de':'Hier siehst du deine Muster und Fortschritte...', 'ja':'あなたのパターンと進歩の全体像です…', 'ru':'Вот обзор ваших паттернов и прогресса…', 'zh-cn':'这是你的模式与进展一览……', 'ar':'إليك نظرة على أنماطك وتقدمك...'},
 'What would make this app better for you?':{'es':'¿Qué haría esta app mejor para ti?', 'fr':'Qu\'est-ce qui rendrait cette application meilleure pour vous ?', 'de':'Was würde diese App für dich besser machen?', 'ja':'このアプリをより良くするものは何ですか？', 'ru':'Что сделало бы это приложение лучше для вас?', 'zh-cn':'什么能让这个应用对你更好？', 'ar':'ما الذي يجعل هذا التطبيق أفضل لك؟'},
 'Share Re.Claim':{'es':'Compartir Re.Claim', 'fr':'Partager Re.Claim', 'de':'Re.Claim teilen', 'ja':'Re.Claimを共有', 'ru':'Поделиться Re.Claim', 'zh-cn':'分享 Re.Claim', 'ar':'مشاركة Re.Claim'},
 'Scan to open the app on your device':{'es':'Escanea para abrir la app en tu dispositivo', 'fr':'Scannez pour ouvrir l\'application sur votre appareil', 'de':'Scannen, um die App auf deinem Gerät zu öffnen', 'ja':'スキャンすると、お使いの端末でアプリが開きます', 'ru':'Отсканируйте, чтобы открыть приложение на вашем устройстве', 'zh-cn':'扫描以在设备上打开应用', 'ar':'امسح الضوئي لفتح التطبيق على جهازك'},
 'Avg Words':{'es':'Promedio de palabras', 'fr':'Mots moyens', 'de':'Ø Wörter', 'ja':'平均語数', 'ru':'Ср. слов', 'zh-cn':'平均字数', 'ar':'متوسط الكلمات'},
 'Common Mood':{'es':'Estado de ánimo común', 'fr':'Humeur fréquente', 'de':'Häufigste Stimmung', 'ja':'よくある気分', 'ru':'Частое настроение', 'zh-cn':'常见心情', 'ar':'المزاج الشائع'},
 'Top topics you write about:':{'es':'Temas principales sobre los que escribes:', 'fr':'Les sujets principaux sur lesquels vous écrivez :', 'de':'Die wichtigsten Themen, über die du schreibst:', 'ja':'あなたが書く主なテーマ：', 'ru':'Основные темы, о которых вы пишете:', 'zh-cn':'你书写的重点话题：', 'ar':'أبرز المواضيع التي تكتب عنها:'},
 'The path is open — and it’s waiting for you.<br>Start your journey and build something real.':{'es':'El camino está abierto — y te espera.<br>Comienza tu viaje y construye algo real.', 'fr':'Le chemin est ouvert — et il vous attend.<br>Commencez votre voyage et construisez quelque chose de vrai.', 'de':'Der Weg ist offen — und er wartet auf dich.<br>Begib dich auf deine Reise und baue etwas Echtes.', 'ja':'道は開かれています — そして待っています。<br>旅を始めて、本物の何かを築きましょう。', 'ru':'Путь открыт — и он ждёт вас.<br>Начните своё путешествие и постройте что-то настоящее.', 'zh-cn':'道路已经敞开——它在等待着你。<br>开始你的旅程，做一番实实在在的事。', 'ar':'الطريق مفتوح — وهو في انتظارك.<br>ابدأ رحلتك وابنِ شيئاً حقيقياً.'},
 'day':{'es':'día', 'fr':'jour', 'de':'Tag', 'ja':'日', 'ru':'день', 'zh-cn':'天', 'ar':'يوم'},
 'days':{'es':'días', 'fr':'jours', 'de':'Tage', 'ja':'日間', 'ru':'дней', 'zh-cn':'天', 'ar':'أيام'},
 'Retake Assessment':{'es':'Repetir evaluación', 'fr':'Refaire l\'évaluation', 'de':'Test wiederholen', 'ja':'評価をやり直す', 'ru':'Повторить оценку', 'zh-cn':'重新评估', 'ar':'إعادة التقييم'},
 'Assessed on ':{'es':'Evaluado el ', 'fr':'Évalué le ', 'de':'Bewertet am ', 'ja':'評価日: ', 'ru':'Оценено: ', 'zh-cn':'评估日期：', 'ar':'تم التقييم في '},
 'One of your goals: ':{'es':'Una de tus metas: ', 'fr':'Un de vos objectifs : ', 'de':'Eines deiner Ziele: ', 'ja':'あなたの目標の一つ：', 'ru':'Одна из ваших целей: ', 'zh-cn':'你的目标之一：', 'ar':'أحد أهدافك: '},
 '. What did you do today that moved you toward it, even by a single step?':{'es':'. ¿Qué hiciste hoy que te acercara a él, aunque fuera un solo paso?', 'fr':'. Qu\'avez-vous fait aujourd\'hui qui vous a rapproché, ne serait-ce que d\'un pas ?', 'de':'. Was hast du heute getan, das dich ihm nähergebracht hat, und sei es nur ein Schritt?', 'ja':'。今日、ほんの一歩でもそれに近づいたことは何ですか？', 'ru':'. Что вы сделали сегодня, что приблизило вас к цели, хотя бы на один шаг?', 'zh-cn':'. 今天你做了什么让自己朝它迈进，哪怕只是一小步？', 'ar':'. ما الذي فعلته اليوم وقد قرّبك منه، ولو بخطوة واحدة؟'},


 'Today\'s Mission':{'es':'La misión de hoy', 'fr':'La mission d\'aujourd\'hui', 'de':'Die heutige Mission', 'ja':'今日のミッション', 'ru':'Задание на сегодня', 'zh-cn':'今日任务', 'ar':'مهمة اليوم'},
 'Help shape Re.Claim! Share your ideas, feedback, or anything you\'d like to see improved.':{'es':'¡Ayuda a dar forma a Re.Claim! Comparte tus ideas, comentarios o cualquier cosa que te gustaría mejorar.', 'fr':'Aidez à façonner Re.Claim ! Partagez vos idées, vos retours ou tout ce que vous aimeriez voir amélioré.', 'de':'Hilf mit, Re.Claim zu formen! Teile deine Ideen, dein Feedback oder alles, was du verbessert sehen möchtest.', 'ja':'Re.Claimを一緒に育てましょう！アイデアやフィードバック、改善してほしいことを共有してください。', 'ru':'Помогите сформировать Re.Claim! Поделитесь идеями, отзывами или тем, что вы хотели бы улучшить.', 'zh-cn':'帮助塑造 Re.Claim！分享你的想法、反馈或任何你想改进的地方。', 'ar':'ساعد في تشكيل Re.Claim! شارك أفكارك وملاحظاتك أو أي شيء ترغب في تحسينه.'},
 'This week\'s mood trend':{'es':'Tendencia de ánimo de esta semana', 'fr':'Tendance d\'humeur de cette semaine', 'de':'Stimmungstrend diese Woche', 'ja':'今週の気分の傾向', 'ru':'Тренд настроения за эту неделю', 'zh-cn':'本周心情趋势', 'ar':'اتجاه المزاج هذا الأسبوع'},
 'What emotion are you carrying right now? Describe where you feel it in your body.':{'es':'¿Qué emoción llevas ahora mismo? Describe dónde la sientes en tu cuerpo.', 'fr':'Quelle émotion portez-vous en ce moment ? Décrivez où vous la ressentez dans votre corps.', 'de':'Welche Emotion trägst du gerade in dir? Beschreibe, wo du sie in deinem Körper spürst.', 'ja':'今、あなたはどんな感情を抱えていますか？体のどこで感じているか書き出してください。', 'ru':'Какую эмоцию вы сейчас несёте в себе? Опишите, где вы чувствуете её в теле.', 'zh-cn':'你现在正带着什么情绪？描述它在身体里的位置。', 'ar':'ما المشاعر التي تحملها الآن؟ صف أين تشعر بها في جسدك.'},
 'Write about a small win you had today  no matter how small.':{'es':'Escribe sobre una pequeña victoria que tuviste hoy, por pequeña que sea.', 'fr':'Écrivez sur une petite victoire d\'aujourd\'hui, si petite soit-elle.', 'de':'Schreibe über einen kleinen Erfolg heute  egal wie klein.', 'ja':'今日の小さな勝利について書いてください。どんなに小さくてもいいのです。', 'ru':'Напишите о маленькой победе сегодня, какой бы маленькой она ни была.', 'zh-cn':'写下今天的一个小胜利，无论多么微小。', 'ar':'اكتب عن انتصار صغير حققته اليوم، مهما كان صغيراً.'},
 'What is one thing you are grateful for right now?':{'es':'¿Qué es una cosa por la que sientes gratitud ahora mismo?', 'fr':'Quelle est une chose pour laquelle vous êtes reconnaissant en ce moment ?', 'de':'Wofür bist du gerade jetzt dankbar?', 'ja':'今、感謝していることは何ですか？', 'ru':'За что вы благодарны прямо сейчас?', 'zh-cn':'此刻你最感激的一件事是什么？', 'ar':'ما الشيء الذي تشعر بالامتنان لأجله الآن؟'},
 'Describe your ideal day five years from now.':{'es':'Describe tu día ideal dentro de cinco años.', 'fr':'Décrivez votre journée idéale dans cinq ans.', 'de':'Beschreibe deinen idealen Tag in fünf Jahren.', 'ja':'5年後の理想の一日を書き出してください。', 'ru':'Опишите ваш идеальный день через пять лет.', 'zh-cn':'描述你五年后理想的一天。', 'ar':'صف يومك المثالي بعد خمس سنوات.'},
 'What trigger have you been avoiding? Write about it honestly.':{'es':'¿Qué desencadenante has estado evitando? Escribe sobre ello con honestidad.', 'fr':'Quel déclencheur évitez-vous ? Écrivez-en honnêtement.', 'de':'Welchen Auslöser hast du vermieden? Schreib ehrlich darüber.', 'ja':'あなたが避けてきた引き金は何ですか？正直に書きましょう。', 'ru':'Какого триггера вы избегаете? Напишите об этом честно.', 'zh-cn':'你在逃避什么诱因？诚实地写下来。', 'ar':'ما المثير الذي تتحاشاه؟ اكتب عنه بصدق.'},
 'Write a letter of forgiveness to yourself for one thing you regret.':{'es':'Escribe una carta de perdón a ti mismo por algo que lamentas.', 'fr':'Écrivez une lettre de pardon à vous-même pour une chose que vous regrettez.', 'de':'Schreibe dir selbst einen Vergebungsbrief für etwas, das du bereust.', 'ja':'後悔していることについて、自分宛ての赦しの手紙を書いてください。', 'ru':'Напишите себе письмо прощения за одну вещь, о которой сожалеете.', 'zh-cn':'为自己后悔的一件事，写一封原谅自己的信。', 'ar':'اكتب رسالة غفران لنفسك لشيء تندم عليه.'},
 'What does "recovery" mean to you? Has that meaning changed over time?':{'es':'¿Qué significa "recuperación" para ti? ¿Ha cambiado ese significado con el tiempo?', 'fr':'Que signifie « rétablissement » pour vous ? Ce sens a-t-il changé avec le temps ?', 'de':'Was bedeutet "Genesung" für dich? Hat sich diese Bedeutung im Laufe der Zeit verändert?', 'ja':'「回復」はあなたにとって何を意味しますか？その意味は時とともに変わりましたか？', 'ru':'Что значит «восстановление» для вас? Изменилось ли это значение со временем?', 'zh-cn':'“恢复”对你来说意味着什么？这个含义随时间改变了吗？', 'ar':'ماذا تعني "التعافي" بالنسبة لك؟ هل تغير هذا المعنى بمرور الوقت؟'},
 'What coping skill helped you the most recently? Describe how it felt.':{'es':'¿Qué habilidad de afrontamiento te ayudó más recientemente? Describe cómo se sintió.', 'fr':'Quelle stratégie d\'adaptation vous a le plus aidé récemment ? Décrivez ce que vous avez ressenti.', 'de':'Welche Bewältigungsstrategie hat dir zuletzt am meisten geholfen? Beschreibe, wie es sich anfühlte.', 'ja':'最近、最も役立った対処法は何ですか？その感覚を書きましょう。', 'ru':'Какая стратегия совладания помогла вам недавно больше всего? Опишите свои ощущения.', 'zh-cn':'最近哪个应对技巧最帮到你？描述当时的感受。', 'ar':'ما المهارة التي ساعدتك أكثر مؤخراً في التكيف؟ صف كيف شعرت.'},
 'Name three people who support you. When did they last show up for you?':{'es':'Nombra a tres personas que te apoyan. ¿Cuándo estuvieron allí por ti por última vez?', 'fr':'Nommez trois personnes qui vous soutiennent. Quand sont-elles venues à vous la dernière fois ?', 'de':'Nenne drei Menschen, die dich unterstützen. Wann waren sie zuletzt für dich da?', 'ja':'あなたを支えてくれる人を3人挙げてください。最後に彼らがあなたのために行動したのはいつですか？', 'ru':'Назовите трёх людей, которые вас поддерживают. Когда они в последний раз были рядом?', 'zh-cn':'说出三个支持你的人。他们最后一次为你出现是什么时候？', 'ar':'سمِّ ثلاثة أشخاص يدعمونك. متى ظهروا من أجلك آخر مرة؟'},
 'What do you fear most right now? Write it out without editing.':{'es':'¿Qué te da más miedo ahora mismo? Escríbelo sin editar.', 'fr':'Qu\'est-ce qui vous effraie le plus en ce moment ? Écrivez-le sans le corriger.', 'de':'Wovor fürchtest du dich gerade am meisten? Schreib es ungefiltert auf.', 'ja':'今、最も恐れていることは何ですか？添削せずに書き出してください。', 'ru':'Чего вы больше всего боитесь сейчас? Выпишите это, не редактируя.', 'zh-cn':'你现在最害怕什么？不加修饰地写下来。', 'ar':'ما أكثر ما تخافه الآن؟ اكتبه دون تحرير.'},
 'Describe a moment today when you felt at peace.':{'es':'Describe un momento de hoy en el que te sentiste en paz.', 'fr':'Décrivez un moment d\'aujourd\'hui où vous vous êtes senti en paix.', 'de':'Beschreibe einen Moment heute, in dem du Frieden empfunden hast.', 'ja':'今日、穏やかさを感じた瞬間を書きましょう。', 'ru':'Опишите момент сегодня, когда вы чувствовали покой.', 'zh-cn':'描述今天你感到平静的一个瞬间。', 'ar':'صف لحظة اليوم التي شعرت فيها بالسلام.'},
 'What habit do you want to build next? Why does it matter to you?':{'es':'¿Qué hábito quieres construir a continuación? ¿Por qué es importante para ti?', 'fr':'Quelle habitude voulez-vous construire ensuite ? Pourquoi est-elle importante pour vous ?', 'de':'Welche Gewohnheit willst du als Nächstes aufbauen? Warum ist sie dir wichtig?', 'ja':'次に身につけたい習慣は何ですか？なぜあなたにとって大切なのですか？', 'ru':'Какую привычку вы хотите выработать дальше? Почему это важно для вас?', 'zh-cn':'你接下来想养成什么习惯？为什么它对你重要？', 'ar':'ما العادة التي تريد بناءها بعد ذلك؟ ولماذا تهمك؟'},
 'Write about a time you overcame something difficult. What got you through?':{'es':'Escribe sobre una ocasión en la que superaste algo difícil. ¿Qué te ayudó a lograrlo?', 'fr':'Écrivez sur une fois où vous avez surmonté quelque chose de difficile. Qu\'est-ce qui vous a soutenu ?', 'de':'Schreibe über eine Zeit, in der du etwas Schwieriges überwunden hast. Was hat dich durchgetragen?', 'ja':'困難を乗り越えた時のことを書いてください。何があなたを支えましたか？', 'ru':'Напишите о том, как вы преодолели что-то трудное. Что вас поддерживало?', 'zh-cn':'写你克服某件困难的事的经历。是什么支撑你走过来的？', 'ar':'اكتب عن مرة تغلبت فيها على أمر صعب. ما الذي ساعدك في تجاوزه؟'},
 'What would you say to your past self on the hardest day?':{'es':'¿Qué le dirías a tu yo del pasado en el día más difícil?', 'fr':'Que diriez-vous à votre vous du passé lors de la journée la plus difficile ?', 'de':'Was würdest du deinem vergangenen Ich am schwersten Tag sagen?', 'ja':'最も辛かった日の過去の自分に、あなたは何と言いますか？', 'ru':'Что бы вы сказали себе прошлому в самый трудный день?', 'zh-cn':'在最艰难的那一天，你会对过去的自己说什么？', 'ar':'ماذا ستقول لنسختك الماضية في أصعب يوم؟'},
 'What is one thing you can do tomorrow to take care of yourself?':{'es':'¿Qué es una cosa que puedes hacer mañana para cuidarte?', 'fr':'Quelle est une chose que vous pouvez faire demain pour prendre soin de vous ?', 'de':'Was ist eine Sache, die du morgen tun kannst, um gut für dich zu sorgen?', 'ja':'明日、自分を大切にするためにできることは何ですか？', 'ru':'Что вы можете сделать завтра, чтобы позаботиться о себе?', 'zh-cn':'你明天可以做哪一件事来照顾自己？', 'ar':'ما الشيء الواحد الذي يمكنك فعله غداً للعناية بنفسك؟'},
 'How has your relationship with yourself changed since starting this journey?':{'es':'¿Cómo ha cambiado tu relación contigo mismo desde que empezaste este viaje?', 'fr':'Comment votre relation avec vous-même a-t-elle changé depuis le début de ce voyage ?', 'de':'Wie hat sich deine Beziehung zu dir selbst verändert, seit du diese Reise begonnen hast?', 'ja':'この旅を始めてから、あなたと自分の関係はどう変わりましたか？', 'ru':'Как изменились ваши отношения с собой с начала этого пути?', 'zh-cn':'自从开始这段旅程，你与自己的关系有了什么变化？', 'ar':'كيف تغيرت علاقتك بنفسك منذ بدء هذه الرحلة؟'},
 'What boundary do you need to set or reinforce?':{'es':'¿Qué límite necesitas establecer o reforzar?', 'fr':'Quelle limite devez-vous poser ou renforcer ?', 'de':'Welche Grenze musst du setzen oder stärken?', 'ja':'あなたはどの境界線を設定または強化する必要がありますか？', 'ru':'Какую границу вам нужно установить или укрепить?', 'zh-cn':'你需要设定或加强什么边界？', 'ar':'ما الحد الذي تحتاج وضعه أو تعزيزه؟'},
 'Describe a place where you feel completely safe. What makes it safe?':{'es':'Describe un lugar donde te sientas completamente seguro. ¿Qué lo hace seguro?', 'fr':'Décrivez un endroit où vous vous sentez totalement en sécurité. Qu\'est-ce qui le rend sûr ?', 'de':'Beschreibe einen Ort, an dem du dich völlig sicher fühlst. Was macht ihn sicher?', 'ja':'完全に安心できる場所を説明してください。何がそれを安全にしていますか？', 'ru':'Опишите место, где вы чувствуете себя полностью в безопасности. Что делает его безопасным?', 'zh-cn':'描述一个让你感到完全安全的地方。是什么让它安全？', 'ar':'صف مكاناً تشعر فيه بالأمان التام. ما الذي يجعله آمناً؟'},
 'What does "strength" look like for you? Not for anyone else  for you.':{'es':'¿Cómo se ve la "fortaleza" para ti? No para los demás  para ti.', 'fr':'À quoi ressemble la « force » pour vous ? Pas pour quelqu\'un d\'autre  pour vous.', 'de':'Wie sieht "Stärke" für dich aus? Nicht für andere  für dich.', 'ja':'「強さ」はあなたにとってどんな姿ですか？他人にとってではなく、あなたにとって。', 'ru':'Как выглядит «сила» для вас? Не для других  для вас.', 'zh-cn':'“力量”对你来说是什么样子？不是对别人——是对你。', 'ar':'كيف تبدو "القوة" بالنسبة لك؟ ليس للآخرين  بل لك.'},
 'Write about something you have been avoiding thinking about.':{'es':'Escribe sobre algo en lo que has estado evitando pensar.', 'fr':'Écrivez sur quelque chose que vous évitez de penser.', 'de':'Schreibe über etwas, woran du zu denken vermeidest.', 'ja':'考えないようにしてきたことについて書いてください。', 'ru':'Напишите о том, о чём вы избегаете думать.', 'zh-cn':'写一件你一直回避去想的事。', 'ar':'اكتب عن شيء كنت تتجنب التفكير فيه.'},
 'What song describes how you feel right now? Why?':{'es':'¿Qué canción describe cómo te sientes ahora mismo? ¿Por qué?', 'fr':'Quelle chanson décrit ce que vous ressentez en ce moment ? Pourquoi ?', 'de':'Welches Lied beschreibt, wie du dich gerade fühlst? Warum?', 'ja':'今の気持ちを表す曲は何ですか？なぜですか？', 'ru':'Какая песня описывает ваши чувства сейчас? Почему?', 'zh-cn':'哪首歌描述了你现在的心情？为什么？', 'ar':'ما الأغنية التي تصف شعورك الآن؟ ولماذا؟'},
 'What would you do today if fear was not a factor?':{'es':'¿Qué harías hoy si el miedo no fuera un factor?', 'fr':'Que feriez-vous aujourd\'hui si la peur n\'entrait pas en jeu ?', 'de':'Was würdest du heute tun, wenn Angst keine Rolle spielte?', 'ja':'もし恐怖がなかったら、今日あなたは何をしますか？', 'ru':'Что бы вы сделали сегодня, если бы страх не играл роли?', 'zh-cn':'如果恐惧不是因素，你今天会做什么？', 'ar':'ماذا ستفعل اليوم لو لم يكن للخوف دور؟'},
 'What is one truth you need to hear right now? Tell it to yourself.':{'es':'¿Qué verdad necesitas escuchar ahora mismo? Dítela a ti mismo.', 'fr':'Quelle est une vérité que vous avez besoin d\'entendre maintenant ? Dites-la-vous.', 'de':'Welche eine Wahrheit musst du gerade hören? Sag sie dir selbst.', 'ja':'今、あなたが聞くべき一つの真実は何ですか？それを自分に言い聞かせてください。', 'ru':'Какую одну истину вам нужно сейчас услышать? Скажите её себе.', 'zh-cn':'你现在需要听到的一个真相是什么？把它说给自己听。', 'ar':'ما الحقيقة التي تحتاج سماعها الآن؟ قلتها لنفسك.'},
 'Describe the version of yourself you are becoming.':{'es':'Describe la versión de ti mismo que estás llegando a ser.', 'fr':'Décrivez la version de vous-même que vous êtes en train de devenir.', 'de':'Beschreibe die Version von dir, die du gerade wirst.', 'ja':'あなたがなりつつある自分を説明してください。', 'ru':'Опишите версию себя, которой вы становитесь.', 'zh-cn':'描述你正在成为的那个版本的自己。', 'ar':'صف النسخة من نفسك التي تصير إليها.'},
 'What do you need to let go of to move forward?':{'es':'¿Qué necesitas soltar para avanzar?', 'fr':'Qu\'avez-vous besoin de lâcher pour avancer ?', 'de':'Was musst du loslassen, um voranzukommen?', 'ja':'前に進むために、何を手放す必要がありますか？', 'ru':'Что вам нужно отпустить, чтобы двигаться вперёд?', 'zh-cn':'要向前走，你需要放下什么？', 'ar':'ما الذي تحتاج التخلي عنه للمضي قدماً؟'},
 'Write about a person who believed in you when you did not believe in yourself.':{'es':'Escribe sobre una persona que creyó en ti cuando tú no creías en ti mismo.', 'fr':'Écrivez sur une personne qui a cru en vous alors que vous ne croyiez pas en vous-même.', 'de':'Schreibe über einen Menschen, der an dich geglaubt hat, als du nicht an dich selbst glaubtest.', 'ja':'あなたが自分を信じられなかった時にあなたを信じた人について書いてください。', 'ru':'Напишите о человеке, который верил в вас, когда вы сами в себя не верили.', 'zh-cn':'写一个在你都不相信自己时依然相信你的人。', 'ar':'اكتب عن شخص آمن بك عندما لم تكن تؤمن بنفسك.'},
 'What self-care practice actually works for you? When did you last do it?':{'es':'¿Qué práctica de autocuidado realmente funciona para ti? ¿Cuándo la hiciste por última vez?', 'fr':'Quelle pratique de soin de soi fonctionne vraiment pour vous ? Quand l\'avez-vous pratiqué la dernière fois ?', 'de':'Welche Selbstfürsorge-Praxis funktioniert bei dir wirklich? Wann hast du sie zuletzt gemacht?', 'ja':'本当に効果のあるセルフケアは何ですか？最後にやったのはいつですか？', 'ru':'Какая практика заботы о себе действительно помогает вам? Когда вы делали её в последний раз?', 'zh-cn':'哪种自我关怀方式真的对你有用？你最近一次做是什么时候？', 'ar':'ما ممارسة الرعاية الذاتية التي تناسبك فعلاً؟ متى مارستها آخر مرة؟'},
 'If your best friend wrote a message of encouragement to you, what would it say?':{'es':'Si tu mejor amigo te escribiera un mensaje de aliento, ¿qué diría?', 'fr':'Si votre meilleur ami vous écrivait un message d\'encouragement, que dirait-il ?', 'de':'Wenn dein bester Freund dir eine aufmunternde Nachricht schreiben würde, was stünde darin?', 'ja':'親友があなたに励ましのメッセージを送るとしたら、何と書くでしょう？', 'ru':'Если бы ваш лучший друг написал вам ободряющее сообщение, что бы в нём было?', 'zh-cn':'如果你最好的朋友给你写一条鼓励的信息，会写什么？', 'ar':'لو كتب صديقك المفضل لك رسالة تشجيع، ماذا ستقول؟'},
 'What progress have you made that you have not acknowledged yet?':{'es':'¿Qué progreso has logrado que aún no has reconocido?', 'fr':'Quels progrès avez-vous réalisés sans encore les reconnaître ?', 'de':'Welchen Fortschritt hast du gemacht, den du noch nicht anerkannt hast?', 'ja':'まだ認めていない、あなたが成し遂げた進歩は何ですか？', 'ru':'Какой прогресс вы совершили, но ещё не признали?', 'zh-cn':'你取得了哪些尚未被自己承认的进步？', 'ar':'ما التقدم الذي أحرزته ولم تعترف به بعد؟'},
 'What question do you wish someone would ask you right now?':{'es':'¿Qué pregunta deseas que alguien te haga ahora mismo?', 'fr':'Quelle question aimeriez-vous que quelqu\'un vous pose maintenant ?', 'de':'Welche Frage wünschst du dir, dass dir jemand gerade jetzt stellt?', 'ja':'今、誰かに聞いてほしい質問は何ですか？', 'ru':'Какой вопрос вы хотели бы, чтобы кто-то задал вам сейчас?', 'zh-cn':'你现在希望别人问你什么问题？', 'ar':'ما السؤال الذي تتمنى أن يسألك إياه أحد الآن؟'},
 'Describe a moment of unexpected kindness you experienced or witnessed.':{'es':'Describe un momento de amabilidad inesperada que experimentaste o presenciaste.', 'fr':'Décrivez un moment de gentillesse inattendue que vous avez vécu ou vu.', 'de':'Beschreibe einen Moment unerwarteter Freundlichkeit, den du erlebt oder gesehen hast.', 'ja':'あなたが経験したり目撃した、予期しない親切の瞬間を説明してください。', 'ru':'Опишите момент неожиданной доброты, который вы пережили или наблюдали.', 'zh-cn':'描述你经历或目睹的一个意想不到的善意时刻。', 'ar':'صف لحظة لطف غير متوقع عشتها أو شاهدتها.'},
 'What is one thing in your life that is going well right now?':{'es':'¿Qué es una cosa en tu vida que va bien ahora mismo?', 'fr':'Quelle est une chose qui va bien dans votre vie en ce moment ?', 'de':'Was ist eine Sache in deinem Leben, die gerade gut läuft?', 'ja':'今、あなたの人生でうまくいっていることは何ですか？', 'ru':'Что в вашей жизни сейчас идёт хорошо?', 'zh-cn':'你生活中现在顺遂的一件事是什么？', 'ar':'ما الشيء الجيد في حياتك الآن؟'},
 'What emotion do you find hardest to express? When did you last feel it?':{'es':'¿Qué emoción te resulta más difícil expresar? ¿Cuándo la sentiste por última vez?', 'fr':'Quelle émotion trouvez-vous la plus difficile à exprimer ? Quand l\'avez-vous ressentie pour la dernière fois ?', 'de':'Welche Emotion fällt dir am schwersten auszudrücken? Wann hast du sie zuletzt gefühlt?', 'ja':'一番表現しにくい感情は何ですか？最後にそれを感じたのはいつですか？', 'ru':'Какую эмоцию вам труднее всего выражать? Когда вы в последний раз её чувствовали?', 'zh-cn':'你觉得最难表达的情绪是什么？最后一次感受到它是什么时候？', 'ar':'ما العاطفة التي يصعب عليك التعبير عنها أكثر؟ متى شعرت بها آخر مرة؟'},
 'Write about something you did today that future you will thank you for.':{'es':'Escribe sobre algo que hiciste hoy por lo que tu yo futuro te lo agradecerá.', 'fr':'Écrivez sur quelque chose que vous avez fait aujourd\'hui et dont votre futur vous remerciera.', 'de':'Schreibe über etwas, das du heute getan hast und wofür dich dein zukünftiges Ich danken wird.', 'ja':'今日行った、将来の自分が感謝してくれるだろうことについて書いてください。', 'ru':'Напишите о том, что вы сделали сегодня, за что будущий вы поблагодарит вас.', 'zh-cn':'写下你今天做的、未来的你会感谢你的那件事。', 'ar':'اكتب عن شيء فعلته اليوم سيشكرك عليه مستقبلك.'},
 'What does the word "hope" mean to you today?':{'es':'¿Qué significa la palabra "esperanza" para ti hoy?', 'fr':'Que signifie le mot « espoir » pour vous aujourd\'hui ?', 'de':'Was bedeutet das Wort "Hoffnung" für dich heute?', 'ja':'「希望」という言葉は今日、あなたにとって何を意味しますか？', 'ru':'Что для вас сегодня означает слово «надежда»?', 'zh-cn':'“希望”这个词今天对你意味着什么？', 'ar':'ماذا تعني كلمة "الأمل" بالنسبة لك اليوم؟'},
 'You mentioned a trigger recently. What strategies helped you get through it? How are you feeling about it now?':{'es':'Mencionaste un desencadenante recientemente. ¿Qué estrategias te ayudaron a superarlo? ¿Cómo te sientes al respecto ahora?', 'fr':'Vous avez mentionné un déclencheur récemment. Quelles stratégies vous ont aidé à le surmonter ? Comment vous sentez-vous maintenant ?', 'de':'Du hast kürzlich einen Auslöser erwähnt. Welche Strategien haben dir geholfen, ihn zu überstehen? Wie fühlst du dich jetzt?', 'ja':'最近、トリガーについて言及しましたね。それを乗り越えるのに役立った方法は？今はどう感じていますか？', 'ru':'Вы недавно упоминали триггер. Какие стратегии помогли вам справиться? Как вы теперь себя чувствуете?', 'zh-cn':'你最近提到过一个诱因。什么策略帮你挺过来了？现在感觉如何？', 'ar':'ذكرت مثيراً مؤخراً. ما الاستراتيجيات التي ساعدتك في تجاوزه؟ وكيف تشعر الآن؟'},
 'That progress you mentioned  how did it feel? What helped you get there? Take a moment to really sit with that win.':{'es':'Ese progreso que mencionaste  ¿cómo se sintió? ¿Qué te ayudó a llegar ahí? Tómate un momento para disfrutar de esa victoria.', 'fr':'Ce progrès que vous avez mentionné  comment l\'avez-vous ressenti ? Qu\'est-ce qui vous a aidé à y arriver ? Prenez un moment pour savourer cette victoire.', 'de':'Dieser Fortschritt, den du erwähnt hast  wie hat es sich angefühlt? Was hat dir geholfen, dorthin zu kommen? Nimm dir einen Moment, um diesen Erfolg wirklich zu genießen.', 'ja':'あなたが言及したその進歩 ― どんな気持ちでしたか？そこに至るのに何が助けになりましたか？その勝利をじっくり味わいましょう。', 'ru':'Тот прогресс, о котором вы говорили  каким он был? Что помогло вам его достичь? Уделите минуту, чтобы по-настоящему прочувствовать эту победу.', 'zh-cn':'你提到的那个进步——当时感觉如何？是什么帮你走到那里？花点时间真正沉浸在这场胜利中。', 'ar':'ذلك التقدم الذي ذكرته  كيف شعرت؟ ما الذي ساعدك للوصول إليه؟ خذ لحظة لتستشعر هذا الانتصار فعلاً.'},
 'You were feeling heavy last time. What do you need right now that you haven\'t given yourself? It\'s okay to not be okay.':{'es':'Te sentías pesado la última vez. ¿Qué necesitas ahora que no te has dado? Está bien no estar bien.', 'fr':'Vous vous sentiez lourd la dernière fois. De quoi avez-vous besoin maintenant que vous ne vous êtes pas donné ? Il est normal de ne pas aller bien.', 'de':'Letztes Mal fühltest du dich schwer. Was brauchst du gerade jetzt, das du dir nicht gegeben hast? Es ist okay, nicht okay zu sein.', 'ja':'前回は重い気持ちでしたね。今、あなたが自分にまだ与えていないものは何ですか？元気じゃなくても大丈夫です。', 'ru':'В прошлый раз вам было тяжело. Что вам нужно сейчас, чего вы себе не дали? Это нормально — не быть в порядке.', 'zh-cn':'上次你心情很沉重。你现在需要什么还没有给自己？不好也没关系。', 'ar':'كنت مثقلاً في المرة الماضية. ما الذي تحتاجه الآن ولم تمنحه لنفسك؟ لا بأس ألا تكون بخير.'},
 'Last time you wrote about frustration. Has that shifted? What would help you release what\'s still lingering?':{'es':'La última vez escribiste sobre frustración. ¿Ha cambiado eso? ¿Qué te ayudaría a liberar lo que aún persiste?', 'fr':'La dernière fois, vous avez écrit sur la frustration. Cela a-t-il changé ? Que vous aiderait-il à relâcher ce qui persiste encore ?', 'de':'Letztes Mal hast du über Frustration geschrieben. Hat sich das geändert? Was würde dir helfen, das loszulassen, was noch da ist?', 'ja':'前回はフラストレーションについて書きましたね。それは変わりましたか？まだ残っているものを手放すのに、何が役立ちますか？', 'ru':'В прошлый раз вы писали о разочаровании. Изменилось ли это? Что поможет вам отпустить то, что осталось?', 'zh-cn':'上次你写了关于挫败感的事。现在有变化吗？什么能帮你释放仍残留的东西？', 'ar':'كتبت آخر مرة عن الإحباط. هل تغير ذلك؟ ما الذي سيساعدك على التخلص مما لا يزال باقياً؟'},
 'You were carrying anxiety last time. Let\'s check in  what\'s the volume of that worry today? What do you need to feel safer?':{'es':'Llevabas ansiedad la última vez. Revisemos  ¿cuál es el nivel de esa preocupación hoy? ¿Qué necesitas para sentirte más seguro?', 'fr':'Vous portiez de l\'anxiété la dernière fois. Faisons le point  quel est le volume de cette inquiétude aujourd\'hui ? De quoi avez-vous besoin pour vous sentir plus en sécurité ?', 'de':'Du hast letztes Mal Angst mit dir getragen. Lass uns nachfühlen  wie groß ist diese Sorge heute? Was brauchst du, um dich sicherer zu fühlen?', 'ja':'前回は不安を抱えていましたね。確認しましょう ― 今日、その心配はどのくらいの大きさですか？もっと安全だと感じるために必要なものは何ですか？', 'ru':'В прошлый раз вы несли тревогу. Давайте проверим  насколько велика эта тревога сегодня? Что вам нужно, чтобы чувствовать себя безопаснее?', 'zh-cn':'上次你带着焦虑。让我们看看——今天这份担忧有多大？你需要什么才能感觉更安全？', 'ar':'كنت تحمل قلقاً آخر مرة. دعنا نطمئن  ما حجم ذلك القلق اليوم؟ ما الذي تحتاجه لتشعر بمزيد من الأمان؟'},
 'You found something to appreciate last time. What else has been good since then? Let\'s keep collecting those moments.':{'es':'Encontraste algo que apreciar la última vez. ¿Qué más ha sido bueno desde entonces? Sigamos coleccionando esos momentos.', 'fr':'Vous avez trouvé quelque chose à apprécier la dernière fois. Quoi d\'autre a été bon depuis ? Continuons à collecter ces moments.', 'de':'Letztes Mal hast du etwas gefunden, das du schätzen kannst. Was war seitdem noch gut? Lass uns diese Momente weiter sammeln.', 'ja':'前回、感謝できるものを見つけましたね。それ以来、他に良かったことはありますか？そうした瞬間を集め続けましょう。', 'ru':'В прошлый раз вы нашли что-то, что оценили. Что ещё было хорошего с тех пор? Давайте продолжать собирать такие моменты.', 'zh-cn':'上次你找到值得感恩的事。那之后还有什么好的？让我们继续收集这些时刻。', 'ar':'وجدت شيئاً تقدره آخر مرة. ما الجيد أيضاً منذ ذلك الحين؟ لنواصل جمع تلك اللحظات.'},
 'How are things with the people you mentioned last time? Any updates worth noting? Connection matters in recovery.':{'es':'¿Cómo van las cosas con las personas que mencionaste la última vez? ¿Alguna novedad? La conexión es importante en la recuperación.', 'fr':'Comment vont les choses avec les personnes que vous avez mentionnées la dernière fois ? Des nouveautés ? Le lien compte dans le rétablissement.', 'de':'Wie geht es den Menschen, die du letztes Mal erwähnt hast? Gibt es Neuigkeiten? Verbindung ist wichtig in der Genesung.', 'ja':'前回話した人たちとの関係はどうですか？記しておくべき変化はありますか？回復にはつながりが大切です。', 'ru':'Как дела с людьми, о которых вы упоминали в прошлый раз? Есть ли что-то новое? Связь важна в восстановлении.', 'zh-cn':'上次你提到的人现在怎么样？有什么值得记下的进展吗？人际连接在恢复中很重要。', 'ar':'كيف الأمور مع الأشخاص الذين ذكرتهم آخر مرة؟ أي مستجدات تستحق الذكر؟ التواصل مهم في التعافي.'},
 'Last time you wrote about work. How is that situation evolving? What\'s one thing you can do today to improve it?':{'es':'La última vez escribiste sobre el trabajo. ¿Cómo evoluciona esa situación? ¿Qué puedes hacer hoy para mejorarla?', 'fr':'La dernière fois, vous avez écrit sur le travail. Comment cette situation évolue-t-elle ? Que pouvez-vous faire aujourd\'hui pour l\'améliorer ?', 'de':'Letztes Mal hast du über die Arbeit geschrieben. Wie entwickelt sich diese Situation? Was kannst du heute tun, um sie zu verbessern?', 'ja':'前回は仕事について書きましたね。その状況はどう発展していますか？今日、それを改善するためにできることは？', 'ru':'В прошлый раз вы писали о работе. Как развивается эта ситуация? Что вы можете сделать сегодня, чтобы её улучшить?', 'zh-cn':'上次你写了关于工作的事。那件事现在有什么进展？今天你能做哪一件事来改善它？', 'ar':'كتبت آخر مرة عن العمل. كيف تتطور هذه الحالة؟ ما الشيء الذي يمكنك فعله اليوم لتحسينها؟'},
 'You mentioned being exhausted last time. Have you been able to rest since then? Sleep is a foundation of recovery  how is yours?':{'es':'Mencionaste estar agotado la última vez. ¿Has podido descansar desde entonces? El sueño es la base de la recuperación  ¿cómo está tu sueño?', 'fr':'Vous avez mentionné être épuisé la dernière fois. Avez-vous pu vous reposer depuis ? Le sommeil est un fondement du rétablissement  quel est le vôtre ?', 'de':'Letztes Mal hast du erwähnt, erschöpft zu sein. Konntest du dich seither ausruhen? Schlaf ist ein Fundament der Genesung  wie ist deiner?', 'ja':'前回は疲れ果てていると話しましたね。それ以来、休めていますか？睡眠は回復の土台です ― あなたの睡眠はどうですか？', 'ru':'В прошлый раз вы упоминали, что истощены. Удалось ли вам отдохнуть с тех пор? Сон — основа восстановления. Как ваш сон?', 'zh-cn':'上次你提到筋疲力尽。从那以后休息好了吗？睡眠是恢复的基础——你的睡眠如何？', 'ar':'ذكرت أنك منهك آخر مرة. هل استطعت الراحة منذ ذلك الحين؟ النوم أساس التعافي  كيف هو نومك؟'},
 'You were focusing on wellness last time. How has your routine been? What feels good for your body today?':{'es':'Te estabas enfocando en el bienestar la última vez. ¿Cómo ha ido tu rutina? ¿Qué se siente bien para tu cuerpo hoy?', 'fr':'Vous vous concentriez sur le bien-être la dernière fois. Comment va votre routine ? Qu\'est-ce qui fait du bien à votre corps aujourd\'hui ?', 'de':'Letztes Mal hast du dich aufs Wohlbefinden konzentriert. Wie war deine Routine? Was tut deinem Körper heute gut?', 'ja':'前回はウェルネスに焦点を当てていましたね。日課はどうでしたか？今日、体にいいと感じることは？', 'ru':'В прошлый раз вы сосредотачивались на благополучии. Как прошла ваша рутина? Что сегодня хорошо для вашего тела?', 'zh-cn':'上次你关注健康。你的日常怎么样？今天什么对你的身体感觉好？', 'ar':'كنت تركز على العافية آخر مرة. كيف كانت روتينك؟ ما الذي يريح جسمك اليوم؟'},
 'You wrote about your studies last time. How are things going? What\'s one small step you can take today?':{'es':'Escribiste sobre tus estudios la última vez. ¿Cómo van las cosas? ¿Qué pequeño paso puedes dar hoy?', 'fr':'Vous avez écrit sur vos études la dernière fois. Comment cela se passe-t-il ? Quel petit pas pouvez-vous faire aujourd\'hui ?', 'de':'Letztes Mal hast du über dein Studium geschrieben. Wie läuft es? Welchen kleinen Schritt kannst du heute gehen?', 'ja':'前回は勉強について書きましたね。調子はどうですか？今日できる小さな一歩は何ですか？', 'ru':'В прошлый раз вы писали об учёбе. Как дела? Какой маленький шаг вы можете сделать сегодня?', 'zh-cn':'上次你写了关于学业的事。进展怎么样？今天你能迈出的一小步是什么？', 'ar':'كتبت عن دراستك آخر مرة. كيف تسير الأمور؟ ما الخطوة الصغيرة التي يمكنك اتخاذها اليوم؟'},
 'Finances were on your mind last time. Has anything shifted? What\'s within your control right now?':{'es':'Las finanzas te preocupaban la última vez. ¿Ha cambiado algo? ¿Qué está bajo tu control ahora mismo?', 'fr':'Les finances vous préoccupaient la dernière fois. Est-ce que cela a changé ? Qu\'est-ce qui est sous votre contrôle maintenant ?', 'de':'Geld lag dir letztes Mal auf dem Herzen. Hat sich etwas verändert? Was liegt gerade in deiner Kontrolle?', 'ja':'前回はお金のことが心にありましたね。何か変わりましたか？今、あなたのコントロール下にあるものは？', 'ru':'В прошлый раз вас волновали финансы. Что-то изменилось? Что в вашей власти сейчас?', 'zh-cn':'上次你心里装着财务问题。有什么变化吗？现在在你掌控之内的是什么？', 'ar':'كانت المالية في ذهنك آخر مرة. هل تغير شيء؟ ما الذي تحت سيطرتك الآن؟'},
 'You were feeling isolated last time. I want you to know you\'re not alone in this. What would make you feel even 1% more connected today?':{'es':'Te sentías aislado la última vez. Quiero que sepas que no estás solo en esto. ¿Qué te haría sentir un 1% más conectado hoy?', 'fr':'Vous vous sentiez isolé la dernière fois. Sachez que vous n\'êtes pas seul dans cette épreuve. Qu\'est-ce qui vous ferait vous sentir ne serait-ce que 1 % plus connecté aujourd\'hui ?', 'de':'Letztes Mal fühltest du dich isoliert. Ich möchte, dass du weißt, dass du damit nicht allein bist. Was würde dich heute auch nur 1 % mehr verbunden fühlen lassen?', 'ja':'前回は孤立していると感じていましたね。あなたはこの中で一人ではないことを知ってほしい。今日、ほんの1％でもつながりを感じられるものは何ですか？', 'ru':'В прошлый раз вы чувствовали себя изолированным. Хочу, чтобы вы знали: вы не одиноки в этом. Что помогло бы вам почувствовать себя хотя бы на 1 % более связанным сегодня?', 'zh-cn':'上次你感到孤立。我想让你知道，在这件事上你并不孤单。今天什么能让你哪怕多一分的连接感？', 'ar':'كنت تشعر بالعزلة آخر مرة. أريدك أن تعلم أنك لست وحدك في هذا. ما الذي يجعلك تشعر بأنك أكثر تواصلاً حتى لو 1% اليوم؟'},
 'You mentioned your health journey last time. How did that appointment go? How are you feeling about your treatment?':{'es':'Mencionaste tu camino de salud la última vez. ¿Cómo fue esa cita? ¿Cómo te sientes con tu tratamiento?', 'fr':'Vous avez mentionné votre parcours de santé la dernière fois. Comment s\'est passé ce rendez-vous ? Comment vous sentez-vous par rapport à votre traitement ?', 'de':'Letztes Mal hast du deinen Gesundheitsweg erwähnt. Wie ist dieser Termin gelaufen? Wie fühlst du dich mit deiner Behandlung?', 'ja':'前回は健康の旅について話しましたね。その診察はどうでしたか？治療についてどう感じていますか？', 'ru':'В прошлый раз вы упоминали свой путь к здоровью. Как прошёл тот приём? Как вы относитесь к своему лечению?', 'zh-cn':'上次你提到自己的健康之路。那次就诊怎么样？你对治疗感觉如何？', 'ar':'ذكرت رحلة صحتك آخر مرة. كيف كانت تلك المواعيد؟ وكيف تشعر تجاه علاجك؟'},
 'You\'re building real momentum. What\'s working for you right now that you want to keep doing? Let\'s lock in those habits.':{'es':'Estás construyendo un impulso real. ¿Qué te está funcionando ahora que quieres seguir haciendo? Afiancemos esos hábitos.', 'fr':'Vous construisez un vrai élan. Qu\'est-ce qui fonctionne pour vous en ce moment et que vous voulez continuer ? Verrouillons ces habitudes.', 'de':'Du baust echten Schwung auf. Was funktioniert gerade für dich und willst du weitermachen? Lass uns diese Gewohnheiten festigen.', 'ja':'あなたは本当の勢いを築いていますね。今、うまくいっていて続けたいことは何ですか？その習慣を固めましょう。', 'ru':'Вы набираете настоящий импульс. Что сейчас работает у вас и вы хотите продолжать? Давайте закрепим эти привычки.', 'zh-cn':'你正在积累真正的动力。现在什么对你有效、你想继续？让我们把那些习惯固定下来。', 'ar':'أنت تبني زخماً حقيقياً. ما الذي يناسبك الآن وتريد مواصلته؟ دعنا نرسّخ تلك العادات.'},
 'This is not a diagnosis. Talk to a professional for a full evaluation.':{'es':'Esto no es un diagnóstico. Habla con un profesional para una evaluación completa.', 'fr':'Ce n\'est pas un diagnostic. Parlez à un professionnel pour une évaluation complète.', 'de':'Das ist keine Diagnose. Sprich für eine vollständige Einschätzung mit einem Fachmann.', 'ja':'これは診断ではありません。完全な評価のために専門家に相談してください。', 'ru':'Это не диагноз. Проконсультируйтесь со специалистом для полной оценки.', 'zh-cn':'这不是诊断。如需全面评估，请咨询专业人士。', 'ar':'هذا ليس تشخيصاً. تحدث إلى مختص لإجراء تقييم كامل.'},
 'You told us ':{'es':'Nos dijiste que ', 'fr':'Vous nous avez dit que ', 'de':'Du hast uns gesagt, dass ', 'ja':'あなたは私たちにこう話しました：', 'ru':'Вы рассказали нам, что ', 'zh-cn':'你告诉我们：', 'ar':'أخبرتنا أن '},
 'can trip you up. Did it show up today? If it did, what helped you handle it — if not, how will you prepare?':{'es':'puede hacerte tropezar. ¿Apareció hoy? Si lo hizo, ¿qué te ayudó a manejarlo? Si no, ¿cómo te prepararás?', 'fr':'peut vous faire chuter. Est-ce apparu aujourd\'hui ? Si oui, qu\'est-ce qui vous a aidé à le gérer ? Sinon, comment vous y préparerez-vous ?', 'de':'kann dich ins Straucheln bringen. Ist es heute aufgetaucht? Wenn ja, was hat dir geholfen, damit umzugehen? Wenn nicht, wie wirst du dich vorbereiten?', 'ja':'はあなたをすべらせるかもしれません。今日それは現れましたか？現れたなら、何があなたを支えましたか？現れなければ、どう備えますか？', 'ru':'может сбить вас с пути. Проявился ли он сегодня? Если да, что помогло вам с ним справиться? Если нет, как вы подготовитесь?', 'zh-cn':'可能会让你栽跟头。它今天出现了吗？如果出现了，是什么帮你应对的？如果没有，你会如何准备？', 'ar':'قد يجعلك تتعثر. هل ظهر اليوم؟ إن ظهر، ما الذي ساعدك على التعامل معه؟ وإن لم يظهر، كيف ستستعد؟'},
  " attempts before lockout.":{"es":" intentos antes del bloqueo.","fr":" tentatives avant le verrouillage.","de":" Versuche bis zur Sperre.","ru":" попыток до блокировки.","zh-cn":" 次尝试后锁定。","ja":" ロックまでの試行回数。","ar":" محاولات قبل القفل."},
  " min.":{"es":" min.","fr":" min.","de":" min.","ru":" min.","zh-cn":" min.","ja":" min.","ar":" min."},
  "\"?":{"es":"\"?","fr":"\"?","de":"\"?","ru":"\"?","zh-cn":"\"?","ja":"\"?","ar":"\"?"},
  "A Fresh Start":{"es":"Un nuevo comienzo","fr":"Un nouveau départ","de":"Ein Neuanfang","ru":"Новое начало","zh-cn":"全新开始","ja":"新しいスタート","ar":"بداية جديدة"},
  "A guided breathing exercise to calm your nervous system.":{"es":"Un ejercicio de respiración guiada para calmar tu sistema nervioso.","fr":"Un exercice de respiration guidée pour calmer ton système nerveux.","de":"Eine geführte Atemübung, um dein Nervensystem zu beruhigen.","ru":"Упражнение с направленным дыханием, чтобы успокоить твою нервную систему.","zh-cn":"一项引导式呼吸练习，帮你平复你的神经系统。","ja":"神経系を落ち着かせるためのガイド付き呼吸エクササイズ。","ar":"تمرين تنفس مُوجّه لتهدئة جهازك العصبي."},
  "A relapse is not a verdict. Grant yourself a fresh start — not to erase what happened, but to honor your new beginning.":{"es":"Una recaída no es una sentencia. Concédete un nuevo comienzo — no para borrar lo sucedido, sino para honrar tu nuevo inicio.","fr":"Une rechute n'est pas un verdict. Accorde-toi un nouveau départ — non pour effacer ce qui s'est passé, mais pour honorer ton nouveau commencement.","de":"Ein Rückfall ist kein Urteil. Gönn dir einen Neuanfang — nicht, um das Vergangene auszulöschen, sondern um deinen neuen Anfang zu würdigen.","ru":"Срыв — это не приговор. Подари себе новое начало — не для того, чтобы стереть прошлое, а чтобы почтить твоё новое начало.","zh-cn":"复发不是判决。给自己一个全新开始——不是为了抹去过去，而是为了迎接你的新起点。","ja":"再発は終わりではありません。過去を消すためではなく、新しい始まりを大切にするために、自分に新たなスタートを許しましょう。","ar":"الانتكاسة ليست حكمًا. امنح نفسك بداية جديدة — ليس لمحو ما حدث، بل لتكريم بدايتك الجديدة."},
  "A security code is texted to your phone when you sign in with your password.":{"es":"Se te envía un código de seguridad por mensaje de texto cuando inicias sesión con tu contraseña.","fr":"Un code de sécurité est envoyé par SMS à ton téléphone quand tu te connectes avec ton mot de passe.","de":"Beim Anmelden mit deinem Passwort wird ein Sicherheitscode an dein Telefon gesendet.","ru":"При входе с паролем на твой телефон отправляется код безопасности по SMS.","zh-cn":"当你使用密码登录时，会向你的手机发送一个安全验证码。","ja":"パスワードでログインすると、携帯電話にセキュリティコードがテキストで送信されます。","ar":"يتم إرسال رمز أمان برسالة نصية إلى هاتفك عندما تسجل الدخول بكلمة المرور."},
  "Accept Fresh Start":{"es":"Aceptar nuevo comienzo","fr":"Accepter le nouveau départ","de":"Neuanfang annehmen","ru":"Принять новое начало","zh-cn":"接受全新开始","ja":"新しいスタートを受け入れる","ar":"قبول بداية جديدة"},
  "Add Re.Claim to your Home Screen":{"es":"Añade Re.Claim a tu pantalla de inicio","fr":"Ajoute Re.Claim à ton écran d'accueil","de":"Re.Claim zum Home Screen hinzufügen","ru":"Добавь Re.Claim на главный экран","zh-cn":"将 Re.Claim 添加到主屏幕","ja":"Re.Claimをホーム画面に追加","ar":"أضف Re.Claim إلى الشاشة الرئيسية"},
  "Add a custom goal...":{"es":"Añade un objetivo personalizado...","fr":"Ajoute un objectif personnalisé...","de":"Benutzerdefiniertes Ziel hinzufügen...","ru":"Добавить свою цель...","zh-cn":"添加自定义目标...","ja":"カスタム目標を追加...","ar":"أضف هدفًا مخصصًا..."},
  "All your journal entries, moods, habits, cravings, goals, and pledges are stored only on this device (localStorage). Nothing is sent to any server. Your password is hashed with SHA-256 and a random salt. Partner features (pairing, messaging) sync through Firebase Firestore with encrypted transmission.":{"es":"Todas tus entradas del diario, estados de ánimo, hábitos, antojos, metas y compromisos se guardan únicamente en este dispositivo (localStorage). No se envía nada a ningún servidor. Tu contraseña se cifra con SHA-256 y una sal aleatoria. Las funciones de pareja (emparejamiento, mensajería) se sincronizan mediante Firebase Firestore con transmisión cifrada.","fr":"Toutes tes entrées de journal, humeurs, habitudes, envies, objectifs et engagements sont stockées uniquement sur cet appareil (localStorage). Rien n'est envoyé à un serveur. Ton mot de passe est haché avec SHA-256 et un sel aléatoire. Les fonctions partenaires (jumelage, messagerie) se synchronisent via Firebase Firestore avec une transmission chiffrée.","de":"Alle deine Tagebucheinträge, Stimmungen, Gewohnheiten, Verlangen, Ziele und Versprechen werden nur auf diesem Gerät gespeichert (localStorage). Nichts wird an einen Server gesendet. Dein Passwort wird mit SHA-256 und einem zufälligen Salt gehasht. Partnerfunktionen (Kopplung, Nachrichten) werden über Firebase Firestore mit verschlüsselter Übertragung synchronisiert.","ru":"Все твои записи в дневнике, настроения, привычки, тяга, цели и обещания хранятся только на этом устройстве (localStorage). Ничего не отправляется на сервер. Твой пароль хешируется с помощью SHA-256 и случайной соли. Функции партнёра (связывание, сообщения) синхронизируются через Firebase Firestore с шифрованной передачей данных.","zh-cn":"你的所有日记条目、心情、习惯、渴望、目标和承诺只存储在此设备上（localStorage）。不会向任何服务器发送任何内容。你的密码通过 SHA-256 和随机盐进行哈希处理。伴侣功能（配对、消息）通过 Firebase Firestore 以加密传输方式同步。","ja":"すべての日記エントリ、気分、習慣、渇望、目標、約束は、このデバイス内のみに保存されます（localStorage）。サーバーには一切送信されません。パスワードはSHA-256とランダムなソルトでハッシュ化されます。パートナー機能（ペアリング、メッセージ）は、暗号化された通信でFirebase Firestoreを通じて同期されます。","ar":"جميع مدخلات دفتر يومياتك، وحالاتك المزاجية، وعاداتك، ورغباتك، وأهدافك، وعهودك تخزَّن فقط على هذا الجهاز (localStorage). لا يُرسَل أي شيء إلى أي خادم. تُشفَّر كلمة مرورك باستخدام SHA-256 مع ملح عشوائي. تتزامن ميزات الشريك (الاقتران، والمراسلة) عبر Firebase Firestore مع نقل مشفّر."},
  "Anonymized mood trends, streak lengths, tool usage counts":{"es":"Tendencias de ánimo anonimizadas, rachas, recuentos de uso de herramientas","fr":"Tendances d'humeur anonymisées, durées de série, compteurs d'utilisation d'outils","de":"Anonymisierte Stimmungstrends, Serienlängen, Nutzungszähler der Tools","ru":"Анонимизированные тенденции настроения, длина серий, количество использований инструментов","zh-cn":"匿名化的心情趋势、连续天数、工具使用次数","ja":"匿名化された気分の傾向、継続日数、ツールの使用回数","ar":"اتجاهات مزاجية مجهولة المصدر، وأطوال سلاسل الاستمرار، وعدد مرات استخدام الأدوات"},
  "App & Settings":{"es":"App y ajustes","fr":"Application et réglages","de":"App & Einstellungen","ru":"Приложение и настройки","zh-cn":"应用与设置","ja":"アプリと設定","ar":"التطبيق والإعدادات"},
  "Apply Lock":{"es":"Aplicar bloqueo","fr":"Appliquer le verrouillage","de":"Sperre anwenden","ru":"Применить блокировку","zh-cn":"应用锁定","ja":"ロックを適用","ar":"تطبيق القفل"},
  "Are you absolutely sure? Your journal, streak, habits, and settings will be permanently removed from this device.":{"es":"¿Estás totalmente seguro? Tu diario, tu racha, tus hábitos y tus ajustes se eliminarán permanentemente de este dispositivo.","fr":"Tu es vraiment sûr ? Ton journal, ta série, tes habitudes et tes réglages seront définitivement supprimés de cet appareil.","de":"Bist du dir wirklich sicher? Dein Tagebuch, deine Serie, deine Gewohnheiten und Einstellungen werden dauerhaft von diesem Gerät entfernt.","ru":"Ты точно уверен? Твой дневник, серия, привычки и настройки будут безвозвратно удалены с этого устройства.","zh-cn":"你确定吗？你的日记、连续天数、习惯和设置将从这台设备上永久删除。","ja":"本当に削除しますか？日記、継続日数、習慣、設定がこのデバイスから完全に削除されます。","ar":"هل أنت متأكد تمامًا؟ سيتم حذف دفتر يومياتك وسلسلة استمرارك وعاداتك وإعداداتك نهائيًا من هذا الجهاز."},
  "Avg Intensity":{"es":"Intensidad media","fr":"Intensité moyenne","de":"Ø Intensität","ru":"Средняя интенсивность","zh-cn":"平均强度","ja":"平均の強さ","ar":"متوسط الشدة"},
  "Back up your journey":{"es":"Haz una copia de seguridad de tu recorrido","fr":"Sauvegarde ton parcours","de":"Sichere deine Reise","ru":"Создай резервную копию своего пути","zh-cn":"备份你的旅程","ja":"旅の記録をバックアップ","ar":"انسخ رحلتك احتياطيًا"},
  "Based on":{"es":"Basado en","fr":"Basé sur","de":"Basierend auf","ru":"На основе","zh-cn":"基于","ja":"基づく","ar":"استنادًا إلى"},
  "Breathe with me":{"es":"Respira conmigo","fr":"Respire avec moi","de":"Atme mit mir","ru":"Подыши со мной","zh-cn":"和我一起呼吸","ja":"私と一緒に呼吸して","ar":"تنفس معي"},
  "Build a safety plan in the Care section when you're ready.":{"es":"Cuando estés listo, crea un plan de seguridad en la sección Cuidado.","fr":"Construis un plan de sécurité dans la section Care quand tu es prêt.","de":"Erstelle einen Sicherheitsplan im Bereich Care, wenn du bereit bist.","ru":"Создай план безопасности в разделе «Забота», когда будешь готов.","zh-cn":"准备好后，在“关怀”部分制定一个安全计划。","ja":"準備ができたら、ケアセクションで安全計画を作成しましょう。","ar":"أعدّ خطة سلامة في قسم الرعاية عندما تكون مستعدًا."},
  "By continuing you confirm you are 18 or older and agree to our":{"es":"Al continuar, confirmas que eres mayor de 18 años y aceptas nuestros","fr":"En continuant, tu confirmes que tu es majeur (18 ans ou plus) et que tu acceptes nos","de":"Mit dem Fortfahren bestätigst du, dass du 18 oder älter bist, und stimmst unseren","ru":"Продолжая, ты подтверждаешь, что тебе 18 или больше, и соглашаешься с нашими","zh-cn":"继续即表示你确认已年满 18 周岁，并同意我们的","ja":"続行すると、あなたが18歳以上であることを確認し、当社の","ar":"بالمتابعة، أنت تؤكد أن عمرك 18 عامًا أو أكثر وتوافق على"},
  "Call Partner":{"es":"Llamar a la pareja","fr":"Appeler le partenaire","de":"Partner anrufen","ru":"Позвонить партнёру","zh-cn":"给伴侣打电话","ja":"パートナーに電話","ar":"اتصل بالشريك"},
  "Card text (what helps you cope?):":{"es":"Texto de la tarjeta (¿qué te ayuda a sobrellevarlo?):","fr":"Texte de la carte (qu'est-ce qui t'aide à faire face ?) :","de":"Kartentext (was hilft dir, damit umzugehen?):","ru":"Текст карточки (что помогает тебе справляться?):","zh-cn":"卡片内容（什么能帮助你应对？）：","ja":"カードのテキスト（何が対処に役立ちますか？）：","ar":"نص البطاقة (ما الذي يساعدك على التعامل؟):"},
  "Card title:":{"es":"Título de la tarjeta:","fr":"Titre de la carte :","de":"Kartentitel:","ru":"Название карточки:","zh-cn":"卡片标题：","ja":"カードのタイトル：","ar":"عنوان البطاقة:"},
  "Celebrate hitting milestones":{"es":"Celebra los logros alcanzados","fr":"Célèbre tes étapes franchies","de":"Feiere erreichte Meilensteine","ru":"Отмечай свои достижения","zh-cn":"庆祝达成里程碑","ja":"マイルストーン達成を祝う","ar":"احتفل بتحقيق المعالم"},
  "Celebrate!":{"es":"¡Celebra!","fr":"Célèbre !","de":"Feiere!","ru":"Празднуй!","zh-cn":"庆祝吧！","ja":"祝いましょう！","ar":"احتفل!"},
  "Challenge title (e.g. \"7-day check-in streak\"):":{"es":"Título del reto (p. ej. \"racha de 7 días consecutivos\"):","fr":"Titre du défi (p. ex. \"série de 7 jours de pointage\") :","de":"Titel der Herausforderung (z. B. \"7-Tage-Check-in-Serie\"):","ru":"Название испытания (например, \"серия отметок 7 дней подряд\"):","zh-cn":"挑战标题（例如“连续 7 天打卡”）：","ja":"チャレンジのタイトル（例：「7日連続チェックイン」）：","ar":"عنوان التحدي (مثال: \"سلسلة تسجيل يومي 7 أيام\"):"},
  "Change Passcode":{"es":"Cambiar código de acceso","fr":"Changer le code d'accès","de":"Passcode ändern","ru":"Изменить код доступа","zh-cn":"更改密码","ja":"パスコードを変更","ar":"تغيير رمز الدخول"},
  "Change Passphrase":{"es":"Cambiar frase de contraseña","fr":"Changer la phrase de passe","de":"Passphrase ändern","ru":"Изменить парольную фразу","zh-cn":"更改密码短语","ja":"パスフレーズを変更","ar":"تغيير عبارة المرور"},
  "Check in with yourself about your substance use.":{"es":"Haz un chequeo contigo mismo sobre tu consumo de sustancias.","fr":"Fais le point avec toi-même sur ta consommation de substances.","de":"Überlege dir, wie es um deinen Substanzkonsum steht.","ru":"Проверь себя по поводу употребления веществ.","zh-cn":"关注一下你自己的物质使用情况。","ja":"あなたの物質使用について自分自身に確認しましょう。","ar":"تأكد مع نفسك بشأن تعاطيك للمواد."},
  "Cloud Sync":{"es":"Sincronización en la nube","fr":"Synchronisation cloud","de":"Cloud-Synchronisierung","ru":"Облачная синхронизация","zh-cn":"云端同步","ja":"クラウド同期","ar":"المزامنة السحابية"},
  "Color-coded view of your daily activity.":{"es":"Una vista con códigos de color de tu actividad diaria.","fr":"Une vue en couleurs de ton activité quotidienne.","de":"Eine farbcodierte Ansicht deiner täglichen Aktivität.","ru":"Цветное отображение твоей ежедневной активности.","zh-cn":"以颜色标识的方式查看你的每日活动。","ja":"毎日のアクティビティを色分けした表示。","ar":"عرض ملوّن لنشاطك اليومي."},
  "Common Triggers":{"es":"Desencadenantes comunes","fr":"Déclencheurs courants","de":"Häufige Auslöser","ru":"Распространённые триггеры","zh-cn":"常见触发因素","ja":"よくある引き金","ar":"المحفزات الشائعة"},
  "Confirm new passphrase:":{"es":"Confirma la nueva frase de contraseña:","fr":"Confirme la nouvelle phrase de passe :","de":"Neue Passphrase bestätigen:","ru":"Подтверди новую парольную фразу:","zh-cn":"确认新密码短语：","ja":"新しいパスフレーズを確認：","ar":"تأكيد عبارة المرور الجديدة:"},
  "Confirm passphrase":{"es":"Confirmar frase de contraseña","fr":"Confirmer la phrase de passe","de":"Passphrase bestätigen","ru":"Подтвердить парольную фразу","zh-cn":"确认密码短语","ja":"パスフレーズを確認","ar":"تأكيد عبارة المرور"},
  "Confirmation Code":{"es":"Código de confirmación","fr":"Code de confirmation","de":"Bestätigungscode","ru":"Код подтверждения","zh-cn":"确认码","ja":"確認コード","ar":"رمز التأكيد"},
  "Contact":{"es":"Contacto","fr":"Contact","de":"Kontakt","ru":"Контакт","zh-cn":"联系人","ja":"連絡先","ar":"جهة اتصال"},
  "Continue":{"es":"Continuar","fr":"Continuer","de":"Weiter","ru":"Продолжить","zh-cn":"继续","ja":"続行","ar":"متابعة"},
  "Coping Strategies":{"es":"Estrategias de afrontamiento","fr":"Stratégies d'adaptation","de":"Bewältigungsstrategien","ru":"Стратегии совладания","zh-cn":"应对策略","ja":"対処戦略","ar":"استراتيجيات التعامل"},
  "Could not reach global directory. Try again later.":{"es":"No se pudo acceder al directorio global. Inténtalo de nuevo más tarde.","fr":"Impossible de joindre l'annuaire global. Réessaie plus tard.","de":"Das globale Verzeichnis konnte nicht erreicht werden. Versuch es später erneut.","ru":"Не удалось связаться с глобальным каталогом. Попробуй позже.","zh-cn":"无法访问全局目录。请稍后重试。","ja":"グローバルディレクトリに接続できませんでした。後でもう一度お試しください。","ar":"تعذّر الوصول إلى الدليل العام. حاول مرة أخرى لاحقًا."},
  "Could not share. Check your internet connection.":{"es":"No se pudo compartir. Comprueba tu conexión a internet.","fr":"Impossible de partager. Vérifie ta connexion internet.","de":"Teilen fehlgeschlagen. Überprüfe deine Internetverbindung.","ru":"Не удалось поделиться. Проверь подключение к интернету.","zh-cn":"无法分享。请检查你的网络连接。","ja":"共有できませんでした。インターネット接続を確認してください。","ar":"تعذّر المشاركة. تحقق من اتصالك بالإنترنت."},
  "Craving Log":{"es":"Registro de antojos","fr":"Journal des envies","de":"Verlangen-Log","ru":"Журнал тяги","zh-cn":"渴望记录","ja":"渇望ログ","ar":"سجل الرغبة"},
  "Craving Patterns":{"es":"Patrones de antojos","fr":"Schémas d'envies","de":"Verlangen-Muster","ru":"Паттерны тяги","zh-cn":"渴望模式","ja":"渇望のパターン","ar":"أنماط الرغبة"},
  "Cravings logged":{"es":"Antojos registrados","fr":"Envies consignées","de":"Verlangen protokolliert","ru":"Зафиксировано случаев тяги","zh-cn":"已记录的渴望","ja":"記録された渇望","ar":"الرغبات المسجلة"},
  "Create a passphrase (min 4 chars)":{"es":"Crea una frase de contraseña (mín. 4 caracteres)","fr":"Crée une phrase de passe (4 caractères min.)","de":"Erstelle eine Passphrase (mind. 4 Zeichen)","ru":"Создай парольную фразу (минимум 4 символа)","zh-cn":"创建密码短语（至少 4 个字符）","ja":"パスフレーズを作成（4文字以上）","ar":"أنشئ عبارة مرور (4 أحرف على الأقل)"},
  "Creating account...":{"es":"Creando la cuenta...","fr":"Création du compte...","de":"Konto wird erstellt...","ru":"Создание аккаунта...","zh-cn":"正在创建账户...","ja":"アカウントを作成中...","ar":"جارٍ إنشاء الحساب..."},
  "Data imported successfully!":{"es":"¡Datos importados correctamente!","fr":"Données importées avec succès !","de":"Daten erfolgreich importiert!","ru":"Данные успешно импортированы!","zh-cn":"数据导入成功！","ja":"データを正常にインポートしました！","ar":"تم استيراد البيانات بنجاح!"},
  "Date of relapse":{"es":"Fecha de la recaída","fr":"Date de la rechute","de":"Datum des Rückfalls","ru":"Дата срыва","zh-cn":"复发日期","ja":"再発した日","ar":"تاريخ الانتكاسة"},
  "Days Sober!":{"es":"¡Días de sobriedad!","fr":"Jours de sobriété !","de":"Tage trocken!","ru":"Дней без употребления!","zh-cn":"清醒天数！","ja":"断酒日数！","ar":"أيام من التعافي!"},
  "Delete \"":{"es":"Eliminar \"","fr":"Supprimer \"","de":"Löschen \"","ru":"Удалить \"","zh-cn":"删除 \"","ja":"削除 \"","ar":"حذف \""},
  "Delete ALL journal entries? This cannot be undone.":{"es":"¿Eliminar TODAS las entradas del diario? Esto no se puede deshacer.","fr":"Supprimer TOUTES les entrées de journal ? Cette action est irréversible.","de":"Alle Tagebucheinträge löschen? Das kann nicht rückgängig gemacht werden.","ru":"Удалить ВСЕ записи дневника? Это действие нельзя отменить.","zh-cn":"删除所有日记条目？此操作无法撤销。","ja":"すべての日記エントリを削除しますか？この操作は元に戻せません。","ar":"حذف جميع مدخلات دفتر اليومية؟ لا يمكن التراجع عن هذا الإجراء."},
  "Delete all meeting logs?":{"es":"¿Eliminar todos los registros de reuniones?","fr":"Supprimer tous les rapports de réunions ?","de":"Alle Meeting-Protokolle löschen?","ru":"Удалить все записи встреч?","zh-cn":"删除所有会议记录？","ja":"すべてのミーティングログを削除しますか？","ar":"حذف جميع سجلات الاجتماعات؟"},
  "Delete this journal entry?":{"es":"¿Eliminar esta entrada del diario?","fr":"Supprimer cette entrée de journal ?","de":"Diesen Tagebucheintrag löschen?","ru":"Удалить эту запись дневника?","zh-cn":"删除此日记条目？","ja":"この日記エントリを削除しますか？","ar":"حذف هذا الإدخال في دفتر اليومية؟"},
  "Delete this meeting log?":{"es":"¿Eliminar este registro de reunión?","fr":"Supprimer ce rapport de réunion ?","de":"Dieses Meeting-Protokoll löschen?","ru":"Удалить эту запись встречи?","zh-cn":"删除此会议记录？","ja":"このミーティングログを削除しますか？","ar":"حذف سجل الاجتماع هذا؟"},
  "Delete this reminder?":{"es":"¿Eliminar este recordatorio?","fr":"Supprimer ce rappel ?","de":"Diese Erinnerung löschen?","ru":"Удалить это напоминание?","zh-cn":"删除此提醒？","ja":"このリマインダーを削除しますか？","ar":"حذف هذا التذكير؟"},
  "Disable Encryption":{"es":"Desactivar cifrado","fr":"Désactiver le chiffrement","de":"Verschlüsselung deaktivieren","ru":"Отключить шифрование","zh-cn":"停用加密","ja":"暗号化を無効化","ar":"تعطيل التشفير"},
  "Early-warning signs":{"es":"Señales de alerta temprana","fr":"Signes d'alerte précoces","de":"Frühwarnzeichen","ru":"Ранние предупреждающие признаки","zh-cn":"早期预警信号","ja":"早期警告サイン","ar":"علامات الإنذار المبكر"},
  "Edit Meeting":{"es":"Editar reunión","fr":"Modifier la réunion","de":"Meeting bearbeiten","ru":"Изменить встречу","zh-cn":"编辑会议","ja":"ミーティングを編集","ar":"تعديل الاجتماع"},
  "Edit Partner":{"es":"Editar pareja","fr":"Modifier le partenaire","de":"Partner bearbeiten","ru":"Изменить партнёра","zh-cn":"编辑伴侣","ja":"パートナーを編集","ar":"تعديل الشريك"},
  "Edit Plan":{"es":"Editar plan","fr":"Modifier le plan","de":"Plan bearbeiten","ru":"Изменить план","zh-cn":"编辑计划","ja":"プランを編集","ar":"تعديل الخطة"},
  "Emergency Contacts":{"es":"Contactos de emergencia","fr":"Contacts d'urgence","de":"Notfallkontakte","ru":"Экстренные контакты","zh-cn":"紧急联系人","ja":"緊急連絡先","ar":"جهات الاتصال الطارئة"},
  "Enable Encryption":{"es":"Activar cifrado","fr":"Activer le chiffrement","de":"Verschlüsselung aktivieren","ru":"Включить шифрование","zh-cn":"启用加密","ja":"暗号化を有効化","ar":"تمكين التشفير"},
  "Encrypt your data with a passphrase. Journal entries are sealed on this device and your whole cloud copy is sealed so nothing is readable without it.":{"es":"Cifra tus datos con una frase de contraseña. Las entradas del diario se sellan en este dispositivo y toda tu copia en la nube queda sellada, de modo que nada se puede leer sin ella.","fr":"Chiffre tes données avec une phrase de passe. Les entrées de journal sont scellées sur cet appareil et toute ta copie cloud est scellée afin que rien ne soit lisible sans elle.","de":"Verschlüssele deine Daten mit einer Passphrase. Tagebucheinträge werden auf diesem Gerät versiegelt, und deine gesamte Cloud-Kopie wird ebenfalls versiegelt, sodass ohne sie nichts lesbar ist.","ru":"Зашифруй свои данные парольной фразой. Записи дневника запечатываются на этом устройстве, и вся твоя облачная копия запечатана, так что без неё ничего нельзя прочитать.","zh-cn":"使用密码短语加密你的数据。日记条目在此设备上被密封，你整个云端副本也会被密封，没有它任何内容都无法读取。","ja":"パスフレーズでデータを暗号化します。日記エントリはこのデバイスで封印され、クラウドのコピー全体も封印されるため、パスフレーズがなければ何も読み取れません。","ar":"شفر بياناتك بعبارة مرور. تُغلق مدخلات دفتر اليومية على هذا الجهاز، وتُغلق نسختك السحابية بالكامل بحيث لا يمكن قراءة أي شيء بدونها."},
  "Encryption":{"es":"Cifrado","fr":"Chiffrement","de":"Verschlüsselung","ru":"Шифрование","zh-cn":"加密","ja":"暗号化","ar":"التشفير"},
  "Encryption active":{"es":"Cifrado activo","fr":"Chiffrement actif","de":"Verschlüsselung aktiv","ru":"Шифрование активно","zh-cn":"加密已启用","ja":"暗号化が有効","ar":"التشفير مفعّل"},
  "Encryption disabled. All entries have been decrypted.":{"es":"Cifrado desactivado. Todas las entradas se han descifrado.","fr":"Chiffrement désactivé. Toutes les entrées ont été déchiffrées.","de":"Verschlüsselung deaktiviert. Alle Einträge wurden entschlüsselt.","ru":"Шифрование отключено. Все записи были расшифрованы.","zh-cn":"加密已停用。所有条目均已被解密。","ja":"暗号化を無効化しました。すべてのエントリが復号されました。","ar":"تم تعطيل التشفير. تم فك تشفير جميع الإدخالات."},
  "Encryption enabled! All journal entries are now encrypted.":{"es":"¡Cifrado activado! Todos los diarios están ahora cifrados.","fr":"Chiffrement activé ! Toutes les entrées de journal sont maintenant chiffrées.","de":"Verschlüsselung aktiviert! Alle Tagebucheinträge sind jetzt verschlüsselt.","ru":"Шифрование включено! Все записи дневника теперь зашифрованы.","zh-cn":"加密已启用！所有日记条目现已加密。","ja":"暗号化が有効になりました！すべての日記エントリが暗号化されました。","ar":"تم تمكين التشفير! جميع مدخلات دفتر اليومية مشفّرة الآن."},
  "Encryption passphrase":{"es":"Frase de contraseña de cifrado","fr":"Phrase de passe de chiffrement","de":"Verschlüsselungs-Passphrase","ru":"Парольная фраза шифрования","zh-cn":"加密密码短语","ja":"暗号化パスフレーズ","ar":"عبارة مرور التشفير"},
  "End your sobriety tracker? Your plant and timer will reset, but your history stays.":{"es":"¿Terminar tu registro de sobriedad? Tu planta y el temporizador se reiniciarán, pero tu historial se conserva.","fr":"Mettre fin à ton suivi de sobriété ? Ta plante et ton minuteur seront réinitialisés, mais ton historique est conservé.","de":"Deinen Nüchternheits-Tracker beenden? Deine Pflanze und dein Timer werden zurückgesetzt, aber dein Verlauf bleibt erhalten.","ru":"Завершить отслеживание трезвости? Твоё растение и таймер сбросятся, но история сохранится.","zh-cn":"结束你的清醒记录？你的植物和计时器将重置，但历史记录会保留。","ja":"断酒トラッカーを終了しますか？植物とタイマーはリセットされますが、履歴は残ります。","ar":"إنهاء متتبع التعافي؟ ستُعاد تهيئة نبتتك والمؤقت، لكن سيبقى سجلّك محفوظًا."},
  "Enter a goal title.":{"es":"Introduce un título para el objetivo.","fr":"Saisis un titre d'objectif.","de":"Gib einen Titel für das Ziel ein.","ru":"Введи название цели.","zh-cn":"输入目标标题。","ja":"目標のタイトルを入力してください。","ar":"أدخل عنوانًا للهدف."},
  "Enter a pairing code.":{"es":"Introduce un código de emparejamiento.","fr":"Saisis un code de jumelage.","de":"Gib einen Kopplungscode ein.","ru":"Введи код связывания.","zh-cn":"输入配对码。","ja":"ペアリングコードを入力してください。","ar":"أدخل رمز الاقتران."},
  "Enter a phone number with country code, e.g. +14155551234.":{"es":"Introduce un número de teléfono con código de país, p. ej. +14155551234.","fr":"Saisis un numéro de téléphone avec l'indicatif du pays, p. ex. +14155551234.","de":"Gib eine Telefonnummer mit Ländervorwahl ein, z. B. +14155551234.","ru":"Введи номер телефона с кодом страны, например +14155551234.","zh-cn":"输入带国家代码的电话号码，例如 +14155551234。","ja":"国番号を含む電話番号を入力してください（例：+14155551234）。","ar":"أدخل رقم هاتف مع رمز الدولة، مثال: +14155551234."},
  "Enter a valid email.":{"es":"Introduce un correo electrónico válido.","fr":"Saisis un e-mail valide.","de":"Gib eine gültige E-Mail-Adresse ein.","ru":"Введи действующий адрес электронной почты.","zh-cn":"输入有效的电子邮箱。","ja":"有効なメールアドレスを入力してください。","ar":"أدخل بريدًا إلكترونيًا صالحًا."},
  "Enter name and phone number":{"es":"Introduce el nombre y el número de teléfono","fr":"Saisis le nom et le numéro de téléphone","de":"Name und Telefonnummer eingeben","ru":"Введи имя и номер телефона","zh-cn":"输入姓名和电话号码","ja":"名前と電話番号を入力","ar":"أدخل الاسم ورقم الهاتف"},
  "Enter new passphrase (min 4 chars):":{"es":"Introduce la nueva frase de contraseña (mín. 4 caracteres):","fr":"Saisis la nouvelle phrase de passe (4 caractères min.) :","de":"Neue Passphrase eingeben (mind. 4 Zeichen):","ru":"Введи новую парольную фразу (минимум 4 символа):","zh-cn":"输入新密码短语（至少 4 个字符）：","ja":"新しいパスフレーズを入力（4文字以上）：","ar":"أدخل عبارة المرور الجديدة (4 أحرف على الأقل):"},
  "Enter the 6-digit code we texted you.":{"es":"Introduce el código de 6 dígitos que te enviamos por mensaje.","fr":"Saisis le code à 6 chiffres que nous t'avons envoyé par SMS.","de":"Gib den 6-stelligen Code ein, den wir dir per SMS geschickt haben.","ru":"Введи 6-значный код, который мы отправили тебе по SMS.","zh-cn":"输入我们发送给你的 6 位验证码。","ja":"テキストで送信した6桁のコードを入力してください。","ar":"أدخل الرمز المكوّن من 6 أرقام الذي أرسلناه إليك."},
  "Enter the code sent to your phone.":{"es":"Introduce el código que se envió a tu teléfono.","fr":"Saisis le code envoyé à ton téléphone.","de":"Gib den Code ein, der an dein Telefon gesendet wurde.","ru":"Введи код, отправленный на твой телефон.","zh-cn":"输入发送到你手机上的验证码。","ja":"携帯電話に送信されたコードを入力してください。","ar":"أدخل الرمز الذي أُرسل إلى هاتفك."},
  "Enter the code we texted to":{"es":"Introduce el código que enviamos a","fr":"Saisis le code que nous avons envoyé à","de":"Gib den Code ein, den wir an","ru":"Введи код, который мы отправили на","zh-cn":"输入我们发送至","ja":"に送信したコードを入力してください。","ar":"أدخل الرمز الذي أرسلناه إلى"},
  "Enter your encryption passphrase to access journal entries.":{"es":"Introduce tu frase de contraseña de cifrado para acceder a las entradas del diario.","fr":"Saisis ta phrase de passe de chiffrement pour accéder à tes entrées de journal.","de":"Gib deine Verschlüsselungs-Passphrase ein, um auf deine Tagebucheinträge zuzugreifen.","ru":"Введи парольную фразу шифрования, чтобы получить доступ к записям дневника.","zh-cn":"输入你的加密密码短语以访问日记条目。","ja":"日記エントリにアクセスするには、暗号化パスフレーズを入力してください。","ar":"أدخل عبارة مرور التشفير للوصول إلى مدخلات دفتر اليومية."},
  "Enter your partner's name.":{"es":"Introduce el nombre de tu pareja.","fr":"Saisis le nom de ton partenaire.","de":"Gib den Namen deines Partners ein.","ru":"Введи имя партнёра.","zh-cn":"输入你伴侣的名字。","ja":"パートナーの名前を入力してください。","ar":"أدخل اسم شريكك."},
  "Enter your passphrase to unlock and access your journal entries.":{"es":"Introduce tu frase de contraseña para desbloquear y acceder a tus entradas del diario.","fr":"Saisis ta phrase de passe pour déverrouiller et accéder à tes entrées de journal.","de":"Gib deine Passphrase ein, um deine Tagebucheinträge zu entsperren und darauf zuzugreifen.","ru":"Введи парольную фразу, чтобы разблокировать и получить доступ к записям дневника.","zh-cn":"输入你的密码短语以解锁并访问日记条目。","ja":"パスフレーズを入力して、日記エントリのロックを解除してアクセスしてください。","ar":"أدخل عبارة المرور لفتح والوصول إلى مدخلات دفتر اليومية."},
  "Erase ALL data stored on this device? This cannot be undone.":{"es":"¿Borrar TODOS los datos almacenados en este dispositivo? Esto no se puede deshacer.","fr":"Effacer TOUTES les données stockées sur cet appareil ? Cette action est irréversible.","de":"Alle auf diesem Gerät gespeicherten Daten löschen? Das kann nicht rückgängig gemacht werden.","ru":"Стереть ВСЕ данные на этом устройстве? Это действие нельзя отменить.","zh-cn":"擦除此设备上存储的所有数据？此操作无法撤销。","ja":"このデバイスに保存されているすべてのデータを消去しますか？この操作は元に戻せません。","ar":"مسح جميع البيانات المخزنة على هذا الجهاز؟ لا يمكن التراجع عن هذا الإجراء."},
  "Erase my data":{"es":"Borrar mis datos","fr":"Effacer mes données","de":"Meine Daten löschen","ru":"Стереть мои данные","zh-cn":"擦除我的数据","ja":"データを消去","ar":"مسح بياناتي"},
  "Everyone you have walked this road with.":{"es":"Todas las personas con las que has caminado este camino.","fr":"Toutes les personnes avec qui tu as parcouru ce chemin.","de":"Alle, mit denen du diesen Weg gegangen bist.","ru":"Все, с кем ты прошёл этот путь.","zh-cn":"所有和你一起走过这条路的人。","ja":"この道を一緒に歩いてきたすべての人。","ar":"كل من سار معك هذا الطريق."},
  "Everything is sealed with AES-256-GCM before it is saved, and the cloud copy is only readable after unlocking with your passphrase.":{"es":"Todo se cifra con AES-256-GCM antes de guardarse, y la copia en la nube solo se puede leer tras desbloquearla con tu frase de contraseña.","fr":"Tout est scellé avec AES-256-GCM avant d'être enregistré, et la copie cloud n'est lisible qu'après déverrouillage avec ta phrase secrète.","de":"Alles wird mit AES-256-GCM versiegelt, bevor es gespeichert wird, und die Cloud-Kopie ist erst nach dem Entsperren mit deiner Passphrase lesbar.","ru":"Всё шифруется с помощью AES-256-GCM перед сохранением, и облачную копию можно прочитать только после разблокировки парольной фразой.","zh-cn":"所有内容在保存前都会使用 AES-256-GCM 加密，云端副本只有用你的密码短语解锁后才能读取。","ja":"保存される前にすべてが AES-256-GCM で封印され、クラウドのコピーはパスフレーズでロックを解除した後にのみ読み取れます。","ar":"كل شيء يتم إغلاقه بـ AES-256-GCM قبل حفظه، ولا يمكن قراءة النسخة السحابية إلا بعد فتحها بعبارة المرور الخاصة بك."},
  "Export my data":{"es":"Exportar mis datos","fr":"Exporter mes données","de":"Meine Daten exportieren","ru":"Экспортировать мои данные","zh-cn":"导出我的数据","ja":"自分のデータをエクスポート","ar":"تصدير بياناتي"},
  "Face ID is not available on this browser.":{"es":"Face ID no está disponible en este navegador.","fr":"Face ID n'est pas disponible sur ce navigateur.","de":"Face ID ist in diesem Browser nicht verfügbar.","ru":"Face ID недоступен в этом браузере.","zh-cn":"此浏览器不支持 Face ID。","ja":"このブラウザでは Face ID を使用できません。","ar":"Face ID غير متاح في هذا المتصفح."},
  "Face ID is not supported on this browser. Try Safari on iPhone.":{"es":"Face ID no es compatible con este navegador. Prueba Safari en iPhone.","fr":"Face ID n'est pas pris en charge par ce navigateur. Essaie Safari sur iPhone.","de":"Face ID wird in diesem Browser nicht unterstützt. Versuche Safari auf dem iPhone.","ru":"Face ID не поддерживается этим браузером. Попробуйте Safari на iPhone.","zh-cn":"此浏览器不支持 Face ID。请尝试在 iPhone 上使用 Safari。","ja":"このブラウザでは Face ID がサポートされていません。iPhone の Safari をお試しください。","ar":"Face ID غير مدعوم في هذا المتصفح. جرّب Safari على iPhone."},
  "Face ID set up successfully!":{"es":"¡Face ID configurado correctamente!","fr":"Face ID configuré avec succès !","de":"Face ID erfolgreich eingerichtet!","ru":"Face ID успешно настроен!","zh-cn":"Face ID 设置成功！","ja":"Face ID の設定が完了しました！","ar":"تم إعداد Face ID بنجاح!"},
  "Face ID setup failed:":{"es":"Error al configurar Face ID:","fr":"Échec de la configuration de Face ID :","de":"Einrichtung von Face ID fehlgeschlagen:","ru":"Не удалось настроить Face ID:","zh-cn":"Face ID 设置失败：","ja":"Face ID の設定に失敗しました：","ar":"فشل إعداد Face ID:"},
  "Failed to change passphrase.":{"es":"No se pudo cambiar la frase de contraseña.","fr":"Impossible de modifier la phrase secrète.","de":"Passphrase konnte nicht geändert werden.","ru":"Не удалось изменить парольную фразу.","zh-cn":"无法更改密码短语。","ja":"パスフレーズを変更できませんでした。","ar":"تعذّر تغيير عبارة المرور."},
  "Favorite":{"es":"Favorito","fr":"Favori","de":"Favorit","ru":"Избранное","zh-cn":"收藏","ja":"お気に入り","ar":"المفضلة"},
  "Fight It":{"es":"Combátelo","fr":"Combats-le","de":"Bekämpfe es","ru":"Борись с этим","zh-cn":"对抗它","ja":"打ち勝とう","ar":"قاومه"},
  "Find Facilities Near Me":{"es":"Encontrar centros cerca de mí","fr":"Trouver des centres près de moi","de":"Einrichtungen in meiner Nähe finden","ru":"Найти учреждения рядом со мной","zh-cn":"查找附近的服务机构","ja":"近くの施設を探す","ar":"ابحث عن مرافق قريبة مني"},
  "Find Licensed Therapists Near Me":{"es":"Encontrar terapeutas certificados cerca de mí","fr":"Trouver des thérapeutes agréés près de moi","de":"Lizenzierte Therapeuten in meiner Nähe finden","ru":"Найти лицензированных терапевтов рядом со мной","zh-cn":"查找附近有执照的治疗师","ja":"近くの認可を受けたセラピストを探す","ar":"ابحث عن معالجين مرخّصين قريبين مني"},
  "Find Meetings Near Me":{"es":"Encontrar reuniones cerca de mí","fr":"Trouver des réunions près de moi","de":"Treffen in meiner Nähe finden","ru":"Найти встречи рядом со мной","zh-cn":"查找附近的会议","ja":"近くのミーティングを探す","ar":"ابحث عن اجتماعات قريبة مني"},
  "Find Meetings Near You":{"es":"Encontrar reuniones cerca de ti","fr":"Trouver des réunions près de toi","de":"Treffen in deiner Nähe finden","ru":"Найти встречи рядом с тобой","zh-cn":"查找你附近的会议","ja":"あなたの近くのミーティングを探す","ar":"ابحث عن اجتماعات قريبة منك"},
  "Find Nearby":{"es":"Buscar cerca","fr":"Trouver à proximité","de":"In der Nähe finden","ru":"Найти рядом","zh-cn":"查找附近","ja":"近くを探す","ar":"البحث بالقرب"},
  "Find Your Partner":{"es":"Encuentra tu pareja de apoyo","fr":"Trouve ton partenaire de soutien","de":"Finde deinen Begleitpartner","ru":"Найди своего напарника","zh-cn":"找到你的搭档","ja":"あなたのパートナーを見つける","ar":"اعثر على شريكك"},
  "Find a licensed therapist who specializes in addiction and mental health.":{"es":"Encuentra un terapeuta certificado especializado en adicciones y salud mental.","fr":"Trouve un thérapeute agréé spécialisé dans les addictions et la santé mentale.","de":"Finde einen lizenzierten Therapeuten, der sich auf Sucht und psychische Gesundheit spezialisiert hat.","ru":"Найди лицензированного терапевта, специализирующегося на зависимостях и психическом здоровье.","zh-cn":"寻找擅长成瘾和心理健康领域的有执照治疗师。","ja":"依存症とメンタルヘルスを専門とする認可を受けたセラピストを見つけましょう。","ar":"ابحث عن معالج مرخّص متخصص في الإدمان والصحة النفسية."},
  "Follow the circle. Inhale, hold, exhale.":{"es":"Sigue el círculo. Inhala, mantén, exhala.","fr":"Suis le cercle. Inspire, retiens, expire.","de":"Folge dem Kreis. Einatmen, halten, ausatmen.","ru":"Следуй за кругом. Вдох, задержка, выдох.","zh-cn":"跟随圆圈。吸气，屏住，呼气。","ja":"円を追ってください。吸って、止めて、吐いて。","ar":"اتبع الدائرة. شهيق، احبس، زفير."},
  "Follow the guided breathing exercise to calm your mind and center yourself.":{"es":"Sigue el ejercicio de respiración guiada para calmar tu mente y centrarte.","fr":"Suis l'exercice de respiration guidée pour calmer ton esprit et te recentrer.","de":"Folge der geführten Atemübung, um deinen Geist zu beruhigen und dich zu zentrieren.","ru":"Выполняй упражнение с направленным дыханием, чтобы успокоить разум и сосредоточиться.","zh-cn":"跟随引导式呼吸练习，让心灵平静下来，让自己集中注意力。","ja":"ガイド付き呼吸エクササイズを行い、心を落ち着けて集中しましょう。","ar":"اتبع تمرين التنفس الموجّه لتهدئة عقلك وتصفية ذهنك."},
  "Format":{"es":"Formato","fr":"Format","de":"Format","ru":"Формат","zh-cn":"格式","ja":"形式","ar":"التنسيق"},
  "Geolocation not supported. Opening Google Maps...":{"es":"Geolocalización no compatible. Abriendo Google Maps...","fr":"Géolocalisation non prise en charge. Ouverture de Google Maps...","de":"Geolokalisierung wird nicht unterstützt. Google Maps wird geöffnet...","ru":"Геолокация не поддерживается. Открываем Google Maps...","zh-cn":"不支持地理定位。正在打开 Google Maps...","ja":"ジオロケーションがサポートされていません。Google Maps を開いています...","ar":"الموقع الجغرافي غير مدعوم. جارٍ فتح Google Maps..."},
  "Getting your location...":{"es":"Obteniendo tu ubicación...","fr":"Récupération de ta position...","de":"Standort wird ermittelt...","ru":"Определяем твоё местоположение...","zh-cn":"正在获取你的位置...","ja":"位置情報を取得しています...","ar":"جارٍ تحديد موقعك..."},
  "Goal length":{"es":"Duración del objetivo","fr":"Durée de l'objectif","de":"Zieldauer","ru":"Длительность цели","zh-cn":"目标时长","ja":"目標の期間","ar":"مدة الهدف"},
  "Goal title":{"es":"Título del objetivo","fr":"Titre de l'objectif","de":"Zieltitel","ru":"Название цели","zh-cn":"目标标题","ja":"目標のタイトル","ar":"عنوان الهدف"},
  "Good work — 3 rounds of":{"es":"Buen trabajo — 3 rondas de","fr":"Bon travail — 3 séries de","de":"Gut gemacht — 3 Runden","ru":"Отличная работа — 3 круга","zh-cn":"做得好 — 3 轮","ja":"素晴らしい — 3 周","ar":"عمل رائع — 3 جولات من"},
  "Grow & Celebrate":{"es":"Crece y Celebra","fr":"Grandir & Célébrer","de":"Wachsen & Feiern","ru":"Расти и празднуй","zh-cn":"成长与庆祝","ja":"成長とお祝い","ar":"انمو واحتفل"},
  "Help Improve Re.Claim":{"es":"Ayuda a mejorar Re.Claim","fr":"Aide à améliorer Re.Claim","de":"Hilf mit, Re.Claim zu verbessern","ru":"Помоги улучшить Re.Claim","zh-cn":"帮助改进 Re.Claim","ja":"Re.Claim の改善にご協力ください","ar":"ساعد في تحسين Re.Claim"},
  "Help is available 24/7. Reach out right now.":{"es":"La ayuda está disponible 24/7. Contacta ahora mismo.","fr":"De l'aide est disponible 24/7. Tends la main dès maintenant.","de":"Hilfe ist rund um die Uhr verfügbar. Hol dir jetzt Unterstützung.","ru":"Помощь доступна круглосуточно. Обратись прямо сейчас.","zh-cn":"全天候 24/7 有人为你提供帮助。现在就去寻求帮助吧。","ja":"ヘルプは24時間いつでも利用できます。今すぐ連絡しましょう。","ar":"المساعدة متاحة على مدار الساعة. تواصل الآن."},
  "How are you feeling now?":{"es":"¿Cómo te sientes ahora?","fr":"Comment te sens-tu maintenant ?","de":"Wie fühlst du dich jetzt?","ru":"Как ты себя сейчас чувствуешь?","zh-cn":"你现在感觉怎么样？","ja":"今の気分はどうですか？","ar":"كيف تشعر الآن؟"},
  "How this helps":{"es":"Cómo ayuda esto","fr":"En quoi ça aide","de":"Wie das hilft","ru":"Как это помогает","zh-cn":"这有什么帮助","ja":"これがどのように役立つか","ar":"كيف يساعد ذلك"},
  "I Accept This Fresh Start":{"es":"Acepto este nuevo comienzo","fr":"J'accepte ce nouveau départ","de":"Ich nehme diesen Neuanfang an","ru":"Я принимаю это новое начало","zh-cn":"我接受这个全新的开始","ja":"この新たなスタートを受け入れます","ar":"أقبل هذه البداية الجديدة"},
  "I hear you. You are not alone.":{"es":"Te escucho. No estás solo.","fr":"Je t'entends. Tu n'es pas seul.","de":"Ich höre dich. Du bist nicht allein.","ru":"Я слышу тебя. Ты не один.","zh-cn":"我听见你了。你并不孤单。","ja":"あなたの声を聞いています。あなたは一人じゃありません。","ar":"أسمعك. لست وحدك."},
  "I need support right now. Your partner may be in distress. Please reach out.":{"es":"Necesito apoyo ahora mismo. Tu pareja de apoyo puede estar en apuros. Por favor, ponte en contacto.","fr":"J'ai besoin de soutien maintenant. Ton partenaire de soutien est peut-être en difficulté. Tends la main.","de":"Ich brauche jetzt Unterstützung. Dein Begleitpartner ist vielleicht in Not. Bitte nimm Kontakt auf.","ru":"Мне нужна поддержка прямо сейчас. Твой напарник может быть в беде. Пожалуйста, свяжись с ним.","zh-cn":"我现在就需要支持。你的搭档可能正陷入困境。请尽快联系。","ja":"今すぐサポートが必要です。パートナーが苦しんでいるかもしれません。連絡してください。","ar":"أحتاج إلى الدعم الآن. قد يكون شريكك في محنة. يرجى التواصل."},
  "Inactive":{"es":"Inactivo","fr":"Inactif","de":"Inaktiv","ru":"Неактивный","zh-cn":"未激活","ja":"非アクティブ","ar":"غير نشط"},
  "Incorrect email or password.":{"es":"Correo electrónico o contraseña incorrectos.","fr":"E-mail ou mot de passe incorrect.","de":"Falsche E-Mail-Adresse oder falsches Passwort.","ru":"Неверный адрес электронной почты или пароль.","zh-cn":"邮箱或密码不正确。","ja":"メールアドレスまたはパスワードが正しくありません。","ar":"البريد الإلكتروني أو كلمة المرور غير صحيحة."},
  "Incorrect passcode. ":{"es":"Código incorrecto. ","fr":"Code incorrect. ","de":"Falscher Passcode. ","ru":"Неверный код доступа. ","zh-cn":"密码错误。 ","ja":"パスコードが正しくありません。 ","ar":"رمز الدخول غير صحيح. "},
  "Install":{"es":"Instalar","fr":"Installer","de":"Installieren","ru":"Установить","zh-cn":"安装","ja":"インストール","ar":"تثبيت"},
  "Install Re.Claim":{"es":"Instalar Re.Claim","fr":"Installer Re.Claim","de":"Re.Claim installieren","ru":"Установить Re.Claim","zh-cn":"安装 Re.Claim","ja":"Re.Claim をインストール","ar":"تثبيت Re.Claim"},
  "Intensity (1-10):":{"es":"Intensidad (1-10):","fr":"Intensité (1-10) :","de":"Intensität (1-10):","ru":"Интенсивность (1-10):","zh-cn":"强度 (1-10)：","ja":"強度 (1-10)：","ar":"الشدة (1-10):"},
  "Invalid email address.":{"es":"Dirección de correo no válida.","fr":"Adresse e-mail invalide.","de":"Ungültige E-Mail-Adresse.","ru":"Неверный адрес электронной почты.","zh-cn":"邮箱地址无效。","ja":"メールアドレスが無効です。","ar":"عنوان البريد الإلكتروني غير صالح."},
  "Invalid file format.":{"es":"Formato de archivo no válido.","fr":"Format de fichier invalide.","de":"Ungültiges Dateiformat.","ru":"Неверный формат файла.","zh-cn":"文件格式无效。","ja":"ファイル形式が無効です。","ar":"تنسيق الملف غير صالح."},
  "I’m 18+ and I agree":{"es":"Soy 18+ y acepto","fr":"J'ai 18+ et j'accepte","de":"Ich bin 18+ und stimme zu","ru":"Мне 18+ и я согласен","zh-cn":"我已年满 18 岁并同意","ja":"18歳以上で、同意します","ar":"أنا 18+ وأوافق"},
  "Journal about it":{"es":"Escribe sobre ello en el diario","fr":"Écris à ce sujet dans ton journal","de":"Schreibe darüber in dein Tagebuch","ru":"Запиши об этом в дневник","zh-cn":"写进日记","ja":"日記に書こう","ar":"اكتب عنه في المذكرات"},
  "Journal entries":{"es":"Entradas del diario","fr":"Entrées de journal","de":"Tagebucheinträge","ru":"Записи в дневнике","zh-cn":"日记条目","ja":"日記のエントリー","ar":"مدخلات المذكرات"},
  "Journaling Goal":{"es":"Objetivo de diario","fr":"Objectif de journal","de":"Tagebuchziel","ru":"Цель ведения дневника","zh-cn":"写日记目标","ja":"日記の目標","ar":"هدف المذكرات"},
  "Jump to Today":{"es":"Ir a hoy","fr":"Aller à aujourd'hui","de":"Zu heute springen","ru":"Перейти к сегодняшнему дню","zh-cn":"跳到今天","ja":"今日へ移動","ar":"الانتقال إلى اليوم"},
  "Last sync":{"es":"Última sincronización","fr":"Dernière synchronisation","de":"Letzte Synchronisierung","ru":"Последняя синхронизация","zh-cn":"上次同步","ja":"最終同期","ar":"آخر مزامنة"},
  "Licensed Therapist Near Me":{"es":"Terapeuta certificado cerca de mí","fr":"Thérapeute agréé près de moi","de":"Lizenzierter Therapeut in meiner Nähe","ru":"Лицензированный терапевт рядом со мной","zh-cn":"附近的有执照治疗师","ja":"近くの認可セラピスト","ar":"معالج مرخّص قريب مني"},
  "List":{"es":"Lista","fr":"Liste","de":"Liste","ru":"Список","zh-cn":"列表","ja":"リスト","ar":"قائمة"},
  "Locate in-person meetings on Google Maps":{"es":"Localiza reuniones presenciales en Google Maps","fr":"Trouve des réunions en personne sur Google Maps","de":"Finde persönliche Treffen auf Google Maps","ru":"Найди очные встречи на Google Maps","zh-cn":"在 Google Maps 上查找线下会议","ja":"Google Maps で対面ミーティングを見つける","ar":"اعثر على الاجتماعات الحضورية على Google Maps"},
  "Location access denied. Opening Google Maps without location...":{"es":"Acceso a la ubicación denegado. Abriendo Google Maps sin ubicación...","fr":"Accès à la position refusé. Ouverture de Google Maps sans la position...","de":"Zugriff auf den Standort verweigert. Google Maps wird ohne Standort geöffnet...","ru":"Доступ к местоположению запрещён. Открываем Google Maps без местоположения...","zh-cn":"定位权限被拒绝。正在打开 Google Maps（不含位置信息）...","ja":"位置情報のアクセスが拒否されました。位置情報なしで Google Maps を開いています...","ar":"تم رفض الوصول إلى الموقع. جارٍ فتح Google Maps بدون موقع..."},
  "Locked":{"es":"Bloqueado","fr":"Verrouillé","de":"Gesperrt","ru":"Заблокировано","zh-cn":"已锁定","ja":"ロック中","ar":"مقفل"},
  "Log a Craving":{"es":"Registrar un antojo","fr":"Enregistrer une envie","de":"Heißhunger erfassen","ru":"Записать тягу","zh-cn":"记录渴望","ja":"渇望を記録","ar":"سجّل رغبة شديدة"},
  "Log your first craving to start seeing patterns. Your triggers will be analyzed over time.":{"es":"Registra tu primer antojo para empezar a ver patrones. Tus desencadenantes se analizarán con el tiempo.","fr":"Enregistre ta première envie pour commencer à voir des schémas. Tes déclencheurs seront analysés au fil du temps.","de":"Erfasse dein erstes Verlangen, um Muster zu erkennen. Deine Auslöser werden mit der Zeit analysiert.","ru":"Запиши свою первую тягу, чтобы начать видеть закономерности. Твои триггеры будут анализироваться со временем.","zh-cn":"记录你的第一个渴望，开始观察规律。你的诱因会随着时间被分析。","ja":"最初の渇望を記録すると、パターンが見えてきます。あなたの引き金は時間とともに分析されます。","ar":"سجّل أول رغبة شديدة لك لتبدأ في رؤية الأنماط. سيتم تحليل محفزاتك بمرور الوقت."},
  "Log your mood in a moment. No writing needed.":{"es":"Registra tu estado de ánimo en un momento. No necesitas escribir.","fr":"Enregistre ton humeur en un instant. Pas besoin d'écrire.","de":"Erfasse deine Stimmung in einem Moment. Ganz ohne Schreiben.","ru":"Зафиксируй своё настроение за секунду. Писать ничего не нужно.","zh-cn":"轻松记录你的心情。无需书写。","ja":"ひと瞬で気分を記録。書く必要はありません。","ar":"سجّل حالتك المزاجية في لحظة. لا حاجة للكتابة."},
  "Meeting Directories &amp; Resources":{"es":"Directorios de reuniones &amp; Recursos","fr":"Annuaire de réunions &amp; Ressources","de":"Treffen-Verzeichnisse &amp; Ressourcen","ru":"Каталоги встреч &amp; ресурсы","zh-cn":"会议目录 &amp; 资源","ja":"ミーティングのディレクトリ &amp; リソース","ar":"دلائل الاجتماعات &amp; الموارد"},
  "Meeting logged!":{"es":"¡Reunión registrada!","fr":"Réunion enregistrée !","de":"Treffen erfasst!","ru":"Встреча записана!","zh-cn":"会议已记录！","ja":"ミーティングを記録しました！","ar":"تم تسجيل الاجتماع!"},
  "Meeting updated":{"es":"Reunión actualizada","fr":"Réunion mise à jour","de":"Treffen aktualisiert","ru":"Встреча обновлена","zh-cn":"会议已更新","ja":"ミーティングを更新しました","ar":"تم تحديث الاجتماع"},
  "Mental Health America":{"es":"Mental Health America","fr":"Mental Health America","de":"Mental Health America","ru":"Mental Health America","zh-cn":"Mental Health America","ja":"Mental Health America","ar":"Mental Health America"},
  "Mental Health Resources":{"es":"Recursos de salud mental","fr":"Ressources sur la santé mentale","de":"Ressourcen für psychische Gesundheit","ru":"Ресурсы по психическому здоровью","zh-cn":"心理健康资源","ja":"メンタルヘルスのリソース","ar":"موارد الصحة النفسية"},
  "Mood+Habits":{"es":"Ánimo+Hábitos","fr":"Humeur+Habitudes","de":"Stimmung+Gewohnheiten","ru":"Настроение+Привычки","zh-cn":"心情+习惯","ja":"気分+習慣","ar":"المزاج+العادات"},
  "Mood+Journal":{"es":"Ánimo+Diario","fr":"Humeur+Journal","de":"Stimmung+Tagebuch","ru":"Настроение+Дневник","zh-cn":"心情+日记","ja":"気分+日記","ar":"المزاج+المذكرات"},
  "Mood:":{"es":"Ánimo:","fr":"Humeur :","de":"Stimmung:","ru":"Настроение:","zh-cn":"心情：","ja":"気分：","ar":"المزاج:"},
  "Moods logged":{"es":"Ánimos registrados","fr":"Humeurs enregistrées","de":"Erfasste Stimmungen","ru":"Записанные настроения","zh-cn":"已记录的心情","ja":"記録した気分","ar":"الحالات المزاجية المسجّلة"},
  "My Contacts":{"es":"Mis contactos","fr":"Mes contacts","de":"Meine Kontakte","ru":"Мои контакты","zh-cn":"我的联系人","ja":"マイ連絡先","ar":"جهات الاتصال"},
  "My Recovery Progress":{"es":"Mi progreso en la recuperación","fr":"Ma progression vers le rétablissement","de":"Mein Genesungsfortschritt","ru":"Мой прогресс восстановления","zh-cn":"我的康复进展","ja":"私の回復の歩み","ar":"تقدّمي في التعافي"},
  "My Relapse Prevention Plan":{"es":"Mi plan de prevención de recaídas","fr":"Mon plan de prévention des rechutes","de":"Mein Rückfallschutz-Plan","ru":"Мой план предотвращения срыва","zh-cn":"我的预防复发计划","ja":"再発防止プラン","ar":"خطتي لمنع الانتكاسة"},
  "Name is required.":{"es":"El nombre es obligatorio.","fr":"Le nom est requis.","de":"Name ist erforderlich.","ru":"Имя обязательно.","zh-cn":"姓名是必填项。","ja":"名前は必須です。","ar":"الاسم مطلوب."},
  "Need help right now?":{"es":"¿Necesitas ayuda ahora mismo?","fr":"Besoin d'aide maintenant ?","de":"Brauchst du jetzt Hilfe?","ru":"Нужна помощь прямо сейчас?","zh-cn":"现在需要帮助吗？","ja":"今すぐ助けが必要ですか？","ar":"هل تحتاج إلى مساعدة الآن؟"},
  "Need immediate help?":{"es":"¿Necesitas ayuda inmediata?","fr":"Besoin d'aide immédiate ?","de":"Brauchst du sofortige Hilfe?","ru":"Нужна немедленная помощь?","zh-cn":"需要紧急帮助吗？","ja":"緊急の助けが必要ですか？","ar":"هل تحتاج إلى مساعدة فورية؟"},
  "Network error. Check your connection.":{"es":"Error de red. Comprueba tu conexión.","fr":"Erreur réseau. Vérifie ta connexion.","de":"Netzwerkfehler. Überprüfe deine Verbindung.","ru":"Ошибка сети. Проверь соединение.","zh-cn":"网络错误。请检查你的连接。","ja":"ネットワークエラーです。接続を確認してください。","ar":"خطأ في الشبكة. تحقق من اتصالك."},
  "New Shared Goal":{"es":"Nuevo objetivo compartido","fr":"Nouvel objectif partagé","de":"Neues gemeinsames Ziel","ru":"Новая общая цель","zh-cn":"新的共同目标","ja":"新しい共有ゴール","ar":"هدف مشترك جديد"},
  "No account found with this email. Try Sign Up.":{"es":"No se encontró ninguna cuenta con este correo. Prueba a registrarte.","fr":"Aucun compte trouvé avec cet e-mail. Essaie de t'inscrire.","de":"Kein Konto mit dieser E-Mail gefunden. Versuche, dich anzumelden.","ru":"Аккаунт с этим адресом электронной почты не найден. Попробуйте зарегистрироваться.","zh-cn":"未找到与该邮箱关联的账户。请尝试注册。","ja":"このメールアドレスのアカウントが見つかりません。登録をお試しください。","ar":"لا يوجد حساب بهذا البريد الإلكتروني. جرّب إنشاء حساب."},
  "No data yet. Write in your journal and log moods to see insights here.":{"es":"Aún no hay datos. Escribe en tu diario y registra tus estados de ánimo para ver tus ideas aquí.","fr":"Pas encore de données. Écris dans ton journal et enregistre tes humeurs pour voir des informations ici.","de":"Noch keine Daten. Schreib in dein Tagebuch und erfasse Stimmungen, um hier Einblicke zu sehen.","ru":"Данных пока нет. Пиши в дневник и записывай настроение, чтобы увидеть здесь инсайты.","zh-cn":"还没有数据。写下日记并记录心情，即可在此查看洞察。","ja":"まだデータがありません。日記を書いて気分を記録すると、ここにインサイトが表示されます。","ar":"لا توجد بيانات بعد. اكتب في مذكراتك وسجّل حالاتك المزاجية لترى الرؤى هنا."},
  "No emergency contacts set. Add them in Settings.":{"es":"No hay contactos de emergencia configurados. Añádelos en Ajustes.","fr":"Aucun contact d'urgence défini. Ajoute-les dans les Réglages.","de":"Keine Notfallkontakte hinterlegt. Füge sie in den Einstellungen hinzu.","ru":"Аварийные контакты не настроены. Добавь их в настройках.","zh-cn":"尚未设置紧急联系人。可在设置中添加。","ja":"緊急連絡先が設定されていません。設定で追加してください。","ar":"لا توجد جهات اتصال للطوارئ. أضفها في الإعدادات."},
  "No emergency contacts yet.":{"es":"Aún no hay contactos de emergencia.","fr":"Pas encore de contacts d'urgence.","de":"Noch keine Notfallkontakte.","ru":"Аварийных контактов пока нет.","zh-cn":"还没有紧急联系人。","ja":"緊急連絡先がまだありません。","ar":"لا توجد جهات اتصال للطوارئ بعد."},
  "No meetings logged yet. Tap \"Log Meeting\" to record one.":{"es":"Aún no has registrado reuniones. Toca \"Registrar reunión\" para registrar una.","fr":"Aucune réunion enregistrée pour l'instant. Appuie sur « Enregistrer une réunion » pour en ajouter une.","de":"Noch keine Treffen erfasst. Tippe auf „Treffen erfassen\", um eins zu protokollieren.","ru":"Встреч пока не записано. Нажми «Записать встречу», чтобы добавить одну.","zh-cn":"还没有记录会议。点击“记录会议”来记录一次。","ja":"まだミーティングが記録されていません。「ミーティングを記録」をタップして記録しましょう。","ar":"لم يتم تسجيل أي اجتماعات بعد. اضغط «تسجيل اجتماع» لتسجيل واحد."},
  "No messages yet &#183; tap to start your thread":{"es":"Aún no hay mensajes &#183; toca para empezar tu conversación","fr":"Pas encore de messages &#183; appuie pour lancer ta conversation","de":"Noch keine Nachrichten &#183; tippe, um deinen Thread zu starten","ru":"Сообщений пока нет &#183; нажми, чтобы начать переписку","zh-cn":"还没有消息 &#183; 点击开始你的会话","ja":"まだメッセージがありません &#183; タップしてスレッドを始めましょう","ar":"لا توجد رسائل بعد &#183; اضغط لبدء محادثتك"},
  "No partners yet. Find one in the Partner page.":{"es":"Aún no tienes ninguna pareja de apoyo. Encuentra una en la página de Pareja.","fr":"Pas encore de partenaire. Trouve-le dans la page Partenaire.","de":"Noch keinen Begleitpartner. Finde einen auf der Partner-Seite.","ru":"Напарников пока нет. Найди его на странице «Напарник».","zh-cn":"还没有搭档。可在“搭档”页面找到一位。","ja":"まだパートナーがいません。「パートナー」ページで見つけましょう。","ar":"لا يوجد شركاء بعد. اعثر على شريك في صفحة الشريك."},
  "No reasons yet. Add your first one above.":{"es":"Aún no hay razones. Añade la primera arriba.","fr":"Pas encore de raisons. Ajoute la première ci-dessus.","de":"Noch keine Gründe. Füge deinen ersten oben hinzu.","ru":"Причин пока нет. Добавь первую выше.","zh-cn":"还没有理由。在上方添加第一个。","ja":"まだ理由がありません。上から最初の一つを追加してください。","ar":"لا توجد أسباب بعد. أضف أولها أعلاه."},
  "No streaks yet. Log moods daily to build your streak!":{"es":"Aún no tienes rachas. Registra tu estado de ánimo a diario para crear tu racha.","fr":"Pas encore de série. Enregistre ton humeur chaque jour pour créer ta série !","de":"Noch keine Serie. Erfasse täglich deine Stimmung, um eine Serie aufzubauen!","ru":"Серий пока нет. Записывай настроение ежедневно, чтобы собрать свою серию!","zh-cn":"还没有连续打卡。每天记录心情，打造属于你的连续记录吧！","ja":"まだ連続記録がありません。毎日気分を記録して連続記録を作りましょう！","ar":"لا توجد سلسلة بعد. سجّل حالتك المزاجية يومياً لبناء سلسلتك!"},
  "None":{"es":"Ninguno","fr":"Aucun","de":"Keine","ru":"Нет","zh-cn":"无","ja":"なし","ar":"لا شيء"},
  "Not now":{"es":"Ahora no","fr":"Pas maintenant","de":"Jetzt nicht","ru":"Не сейчас","zh-cn":"现在不要","ja":"今はしない","ar":"ليس الآن"},
  "On iPhone: Tap the Share button (square with arrow) at the bottom of Safari, then scroll down and tap \"Add to Home Screen\".\n\nName it \"Re.Claim\" and tap \"Add\" in the top right.":{"es":"En iPhone: toca el botón Compartir (cuadro con flecha) en la parte inferior de Safari y luego desplázate hacia abajo y toca \"Añadir a pantalla de inicio\".\\n\\nPonle el nombre \"Re.Claim\" y toca \"Añadir\" arriba a la derecha.","fr":"Sur iPhone : touchez le bouton Partager (carré avec flèche) en bas de Safari, puis faites défiler vers le bas et touchez \"Ajouter à l'écran d'accueil\".\\n\\nNommez-le \"Re.Claim\" et touchez \"Ajouter\" en haut à droite.","de":"Auf dem iPhone: Tippe unten in Safari auf das Teilen-Symbol (Quadrat mit Pfeil), scrolle dann nach unten und tippe auf \"Zum Home-Bildschirm hinzufügen\".\\n\\nNenne es \"Re.Claim\" und tippe oben rechts auf \"Hinzufügen\".","ru":"На iPhone: нажмите кнопку «Поделиться» (квадрат со стрелкой) в нижней части Safari, прокрутите вниз и нажмите «На экран \"Домой\"».\\n\\nНазовите её «Re.Claim» и нажмите «Добавить» в правом верхнем углу.","zh-cn":"在 iPhone 上：点击 Safari 底部的分享按钮（带箭头的方形），然后向下滚动并点按\"添加到主屏幕\"。\\n\\n将其命名为\"Re.Claim\"，然后点按右上角的\"添加\"。","ja":"iPhoneの場合：Safariの下部にある共有ボタン（矢印付きの四角）をタップし、下にスクロールして「ホーム画面に追加」をタップします。\\n\\n名前を「Re.Claim」にして、右上の「追加」をタップします。","ar":"على آيفون: اضغط زر المشاركة (مربع به سهم) أسفل Safari، ثم مرر لأسفل واضغط \"إضافة إلى الشاشة الرئيسية\".\\n\\nسمِّه «Re.Claim» واضغط \"إضافة\" في أعلى اليمين."},
  "Once set up, we text a code to this number every time you sign in with your password.":{"es":"Una vez configurado, te enviamos un código por SMS a este número cada vez que inicies sesión con tu contraseña.","fr":"Une fois configuré, nous vous envoyons un code par SMS à ce numéro à chaque fois que vous vous connectez avec votre mot de passe.","de":"Nach der Einrichtung schicken wir dir bei jeder Anmeldung mit deinem Passwort einen Code per SMS an diese Nummer.","ru":"После настройки мы будем отправлять код по SMS на этот номер каждый раз, когда вы входите с паролем.","zh-cn":"设置完成后，每次你用密码登录时，我们都会向这个号码发送一条短信验证码。","ja":"設定後、パスワードでサインインするたびに、この番号にコードをSMSで送信します。","ar":"بعد الإعداد، سنرسل لك رمزًا عبر رسالة نصية إلى هذا الرقم في كل مرة تسجل فيها الدخول بكلمة المرور."},
  "Online Meetings":{"es":"Reuniones en línea","fr":"Réunions en ligne","de":"Online-Treffen","ru":"Онлайн-встречи","zh-cn":"在线会议","ja":"オンライン会議","ar":"الاجتماعات عبر الإنترنت"},
  "Open browser menu and tap \"Add to Home Screen\"":{"es":"Abre el menú del navegador y toca \"Añadir a pantalla de inicio\"","fr":"Ouvrez le menu du navigateur et touchez \"Ajouter à l'écran d'accueil\"","de":"Öffne das Browsermenü und tippe auf \"Zum Home-Bildschirm hinzufügen\"","ru":"Откройте меню браузера и нажмите «На экран \"Домой\"»","zh-cn":"打开浏览器菜单并点按\"添加到主屏幕\"","ja":"ブラウザのメニューを開き「ホーム画面に追加」をタップします","ar":"افتح قائمة المتصفح واضغط \"إضافة إلى الشاشة الرئيسية\""},
  "Open this page in your browser menu and select \"Add to Home Screen\" or \"Install App\".":{"es":"Abre esta página en el menú de tu navegador y selecciona \"Añadir a pantalla de inicio\" o \"Instalar aplicación\".","fr":"Ouvrez cette page dans le menu de votre navigateur et sélectionnez \"Ajouter à l'écran d'accueil\" ou \"Installer l'application\".","de":"Öffne diese Seite im Menü deines Browsers und wähle \"Zum Home-Bildschirm hinzufügen\" oder \"App installieren\".","ru":"Откройте эту страницу в меню браузера и выберите «На экран \"Домой\"» или «Установить приложение».","zh-cn":"在浏览器菜单中打开此页面，然后选择\"添加到主屏幕\"或\"安装应用\"。","ja":"ブラウザのメニューでこのページを開き、「ホーム画面に追加」または「アプリをインストール」を選択します。","ar":"افتح هذه الصفحة من قائمة المتصفح واختر \"إضافة إلى الشاشة الرئيسية\" أو \"تثبيت التطبيق\"."},
  "Opening Google Maps...":{"es":"Abriendo Google Maps...","fr":"Ouverture de Google Maps...","de":"Google Maps wird geöffnet...","ru":"Открытие Google Maps...","zh-cn":"正在打开 Google Maps...","ja":"Googleマップを開いています...","ar":"جارٍ فتح خرائط Google..."},
  "Optionally share anonymous usage data to help us understand recovery patterns and improve the app. No personal information, journal text, or identifying data is ever collected.":{"es":"Opcionalmente, comparte datos de uso anónimos para ayudarnos a entender los patrones de recuperación y mejorar la app. Nunca se recopila información personal, texto del diario ni datos identificables.","fr":"Partagez éventuellement des données d'utilisation anonymes pour nous aider à comprendre les schémas de rétablissement et à améliorer l'application. Aucune information personnelle, aucun texte de journal ni donnée d'identification n'est jamais collecté.","de":"Teile optional anonyme Nutzungsdaten, damit wir Erholungsmuster besser verstehen und die App verbessern können. Es werden niemals persönliche Informationen, Tagebuchtexte oder identifizierende Daten erfasst.","ru":"По желанию делитесь анонимными данными об использовании, чтобы помочь нам понять закономерности восстановления и улучшить приложение. Мы никогда не собираем личную информацию, тексты дневника или идентифицирующие данные.","zh-cn":"可选：分享匿名使用数据，帮助我们了解康复规律并改进应用。我们绝不会收集任何个人信息、日记内容或可识别身份的数据。","ja":"任意で匿名の利用データを共有し、回復のパターンを理解してアプリの改善にご協力ください。個人情報、日記のテキスト、特定可能なデータが収集されることは一切ありません。","ar":"بشكل اختياري، شارك بيانات الاستخدام المجهولة لمساعدتنا على فهم أنماط التعافي وتحسين التطبيق. لا نجمع أبدًا أي معلومات شخصية أو نصوص يوميات أو بيانات تحدد هويتك."},
  "Partner not found. Make sure they have registered by visiting the Partner page.":{"es":"No se encontró al acompañante. Asegúrate de que se haya registrado visitando la página de Acompañantes.","fr":"Partenaire introuvable. Assurez-vous qu'il s'est inscrit en visitant la page Partenaire.","de":"Partner nicht gefunden. Stelle sicher, dass er sich über die Partner-Seite registriert hat.","ru":"Партнёр не найден. Убедитесь, что он зарегистрировался, зайдя на страницу «Партнёр».","zh-cn":"未找到伙伴。请确保对方已通过合作伙伴页面完成注册。","ja":"パートナーが見つかりません。パートナーページにアクセスして登録済みか確認してください。","ar":"لم يتم العثور على الشريك. تأكد من أنه سجّل من خلال زيارة صفحة الشريك."},
  "Partner removed.":{"es":"Acompañante eliminado.","fr":"Partenaire supprimé.","de":"Partner entfernt.","ru":"Партнёр удалён.","zh-cn":"已移除伙伴。","ja":"パートナーを削除しました。","ar":"تمت إزالة الشريك."},
  "Passphrase":{"es":"Frase de contraseña","fr":"Phrase secrète","de":"Passphrase","ru":"Кодовая фраза","zh-cn":"口令短语","ja":"パスフレーズ","ar":"عبارة المرور"},
  "Passphrase changed!":{"es":"¡Frase de contraseña cambiada!","fr":"Phrase secrète modifiée !","de":"Passphrase geändert!","ru":"Кодовая фраза изменена!","zh-cn":"口令短语已更改！","ja":"パスフレーズが変更されました！","ar":"تم تغيير عبارة المرور!"},
  "Passphrase must be at least 4 characters.":{"es":"La frase de contraseña debe tener al menos 4 caracteres.","fr":"La phrase secrète doit comporter au moins 4 caractères.","de":"Die Passphrase muss mindestens 4 Zeichen lang sein.","ru":"Кодовая фраза должна содержать не менее 4 символов.","zh-cn":"口令短语至少需要 4 个字符。","ja":"パスフレーズは4文字以上必要です。","ar":"يجب أن تتكون عبارة المرور من 4 أحرف على الأقل."},
  "Passphrases do not match.":{"es":"Las frases de contraseña no coinciden.","fr":"Les phrases secrètes ne correspondent pas.","de":"Die Passphrasen stimmen nicht überein.","ru":"Кодовые фразы не совпадают.","zh-cn":"口令短语不匹配。","ja":"パスフレーズが一致しません。","ar":"عبارتا المرور غير متطابقتين."},
  "Password":{"es":"Contraseña","fr":"Mot de passe","de":"Passwort","ru":"Пароль","zh-cn":"密码","ja":"パスワード","ar":"كلمة المرور"},
  "Password must be at least 4 characters.":{"es":"La contraseña debe tener al menos 4 caracteres.","fr":"Le mot de passe doit comporter au moins 4 caractères.","de":"Das Passwort muss mindestens 4 Zeichen lang sein.","ru":"Пароль должен содержать не менее 4 символов.","zh-cn":"密码至少需要 4 个字符。","ja":"パスワードは4文字以上必要です。","ar":"يجب أن تتكون كلمة المرور من 4 أحرف على الأقل."},
  "Password must be at least 6 characters.":{"es":"La contraseña debe tener al menos 6 caracteres.","fr":"Le mot de passe doit comporter au moins 6 caractères.","de":"Das Passwort muss mindestens 6 Zeichen lang sein.","ru":"Пароль должен содержать не менее 6 символов.","zh-cn":"密码至少需要 6 个字符。","ja":"パスワードは6文字以上必要です。","ar":"يجب أن تتكون كلمة المرور من 6 أحرف على الأقل."},
  "Peak Time":{"es":"Momento pico","fr":"Moment de pointe","de":"Spitzenzeit","ru":"Время пика","zh-cn":"高峰时段","ja":"ピーク時間","ar":"وقت الذروة"},
  "People you can call when you need support. These appear in the SOS crisis flow.":{"es":"Personas a las que puedes llamar cuando necesites apoyo. Aparecen en el flujo de crisis de SOS.","fr":"Des personnes que vous pouvez appeler lorsque vous avez besoin de soutien. Elles apparaissent dans le parcours de crise SOS.","de":"Personen, die du anrufen kannst, wenn du Unterstützung brauchst. Sie erscheinen im SOS-Krisenablauf.","ru":"Люди, которым вы можете позвонить, когда нужна поддержка. Они появляются в кризисном сценарии SOS.","zh-cn":"需要支持时可以致电的人。他们会出现在 SOS 危机流程中。","ja":"サポートが必要なときに電話できる人たちです。SOSの危機フローに表示されます。","ar":"أشخاص يمكنك الاتصال بهم عند الحاجة إلى الدعم. يظهرون في مسار أزمة SOS."},
  "People you trust who can support you right now.":{"es":"Personas de confianza que pueden apoyarte ahora mismo.","fr":"Des personnes de confiance qui peuvent vous soutenir tout de suite.","de":"Menschen, denen du vertraust und die dich gerade jetzt unterstützen können.","ru":"Люди, которым вы доверяете и которые могут поддержать вас прямо сейчас.","zh-cn":"你信任的、能在此刻支持你的人。","ja":"今すぐあなたを支えてくれる信頼できる人たちです。","ar":"أشخاص تثق بهم ويمكنهم دعمك في هذه اللحظة."},
  "Phone":{"es":"Teléfono","fr":"Téléphone","de":"Telefon","ru":"Телефон","zh-cn":"电话","ja":"電話","ar":"الهاتف"},
  "Phone number":{"es":"Número de teléfono","fr":"Numéro de téléphone","de":"Telefonnummer","ru":"Номер телефона","zh-cn":"电话号码","ja":"電話番号","ar":"رقم الهاتف"},
  "Pin to Board":{"es":"Fijar al tablero","fr":"Épingler au tableau","de":"An Board anheften","ru":"Закрепить на доске","zh-cn":"固定到白板","ja":"ボードにピン留め","ar":"تثبيت على اللوحة"},
  "Please enter a title.":{"es":"Introduce un título.","fr":"Veuillez saisir un titre.","de":"Bitte gib einen Titel ein.","ru":"Введите заголовок.","zh-cn":"请输入标题。","ja":"タイトルを入力してください。","ar":"يرجى إدخال عنوان."},
  "Please select a date.":{"es":"Selecciona una fecha.","fr":"Veuillez sélectionner une date.","de":"Bitte wähle ein Datum.","ru":"Выберите дату.","zh-cn":"请选择日期。","ja":"日付を選択してください。","ar":"يرجى تحديد تاريخ."},
  "Prev":{"es":"Anterior","fr":"Précédent","de":"Zurück","ru":"Назад","zh-cn":"上一页","ja":"前へ","ar":"السابق"},
  "Privacy & Security":{"es":"Privacidad y seguridad","fr":"Confidentialité et sécurité","de":"Privatsphäre und Sicherheit","ru":"Конфиденциальность и безопасность","zh-cn":"隐私与安全","ja":"プライバシーとセキュリティ","ar":"الخصوصية والأمان"},
  "Privacy Policy":{"es":"Política de privacidad","fr":"Politique de confidentialité","de":"Datenschutzerklärung","ru":"Политика конфиденциальности","zh-cn":"隐私政策","ja":"プライバシーポリシー","ar":"سياسة الخصوصية"},
  "Progress Report":{"es":"Informe de progreso","fr":"Rapport de progression","de":"Fortschrittsbericht","ru":"Отчёт о прогрессе","zh-cn":"进度报告","ja":"進捗レポート","ar":"تقرير التقدم"},
  "Re.Claim is a support tool, not a substitute for professional medical care. If you are experiencing a crisis, use SOS or call 988.":{"es":"Re.Claim es una herramienta de apoyo, no sustituye la atención médica profesional. Si estás pasando por una crisis, usa SOS o llama al 988.","fr":"Re.Claim est un outil de soutien, pas un substitut aux soins médicaux professionnels. Si vous traversez une crise, utilisez SOS ou appelez le 988.","de":"Re.Claim ist ein Unterstützungs-Tool, kein Ersatz für professionelle medizinische Versorgung. Wenn du eine Krise erlebst, nutze SOS oder ruf 988 an.","ru":"Re.Claim — это инструмент поддержки, а не замена профессиональной медицинской помощи. Если вы переживаете кризис, воспользуйтесь SOS или позвоните по номеру 988.","zh-cn":"Re.Claim 是一款支持工具，不能替代专业医疗护理。如果你正处于危机中，请使用 SOS 或拨打 988。","ja":"Re.Claimはサポートツールであり、専門的な医療の代替ではありません。危機的状況にある場合は、SOSを使用するか988に電話してください。","ar":"Re.Claim أداة دعم وليست بديلًا عن الرعاية الطبية المتخصصة. إذا كنت تمر بأزمة، استخدم SOS أو اتصل على 988."},
  "Reason pinned to your board!":{"es":"Motivo fijado en tu tablero.","fr":"Raison épinglée à votre tableau !","de":"Grund an dein Board gepinnt!","ru":"Причина закреплена на вашей доске!","zh-cn":"已将理由固定到你的白板！","ja":"理由をボードにピン留めしました！","ar":"تم تثبيت السبب على لوحتك!"},
  "Reasons":{"es":"Motivos","fr":"Raisons","de":"Gründe","ru":"Причины","zh-cn":"理由","ja":"理由","ar":"الأسباب"},
  "Recovery Overview":{"es":"Resumen de recuperación","fr":"Aperçu du rétablissement","de":"Erholungsübersicht","ru":"Обзор восстановления","zh-cn":"康复概览","ja":"回復の概要","ar":"نظرة عامة على التعافي"},
  "Relapse Recovery":{"es":"Recuperación tras una recaída","fr":"Rétablissement après une rechute","de":"Rückfall-Erholung","ru":"Восстановление после срыва","zh-cn":"复发后康复","ja":"再発からの回復","ar":"التعافي بعد الانتكاسة"},
  "Relationship":{"es":"Relación","fr":"Relation","de":"Beziehung","ru":"Отношения","zh-cn":"关系","ja":"人間関係","ar":"العلاقة"},
  "Remind if you haven't checked in":{"es":"Recordar si no has hecho el registro","fr":"Rappeler si vous ne vous êtes pas connecté","de":"Erinnern, wenn du dich nicht eingecheckt hast","ru":"Напоминать, если вы не отметились","zh-cn":"未签到则提醒","ja":"チェックインしていない場合にリマインド","ar":"تذكير إذا لم تسجّل الدخول"},
  "Remind me later":{"es":"Recordármelo más tarde","fr":"Rappelez-moi plus tard","de":"Später erinnern","ru":"Напомнить позже","zh-cn":"稍后提醒我","ja":"後でリマインド","ar":"ذكّرني لاحقًا"},
  "Remind to check in with your partner":{"es":"Recordar hacer el registro con tu acompañante","fr":"Rappeler de faire le point avec votre partenaire","de":"An Check-in mit deinem Partner erinnern","ru":"Напоминать отмечаться с партнёром","zh-cn":"提醒与伙伴一起签到","ja":"パートナーとチェックインするようリマインド","ar":"تذكير بالتسجيل مع شريكك"},
  "Remove Lock":{"es":"Quitar bloqueo","fr":"Supprimer le verrou","de":"Sperre entfernen","ru":"Снять блокировку","zh-cn":"移除锁","ja":"ロックを解除","ar":"إزالة القفل"},
  "Remove Two-Step Login":{"es":"Quitar inicio de sesión en dos pasos","fr":"Supprimer la connexion en deux étapes","de":"Zwei-Schritt-Anmeldung entfernen","ru":"Отключить двухэтапный вход","zh-cn":"移除两步登录","ja":"2段階ログインを削除","ar":"إزالة تسجيل الدخول بخطوتين"},
  "Remove this reason?":{"es":"¿Quieres eliminar este motivo?","fr":"Supprimer cette raison ?","de":"Diesen Grund entfernen?","ru":"Удалить эту причину?","zh-cn":"要移除这个理由吗？","ja":"この理由を削除しますか？","ar":"إزالة هذا السبب؟"},
  "Remove your accountability partner?":{"es":"¿Quieres eliminar a tu acompañante de rendición de cuentas?","fr":"Supprimer votre partenaire de responsabilisation ?","de":"Deinen Verantwortlichkeits-Partner entfernen?","ru":"Удалить вашего партнёра по подотчётности?","zh-cn":"要移除你的问责伙伴吗？","ja":"あなたのアカウンタビリティパートナーを削除しますか？","ar":"إزالة شريك المساءلة الخاص بك؟"},
  "Robot check failed. Please try again.":{"es":"La comprobación de robot ha fallado. Inténtalo de nuevo.","fr":"La vérification anti-robot a échoué. Veuillez réessayer.","de":"Roboterprüfung fehlgeschlagen. Bitte versuche es erneut.","ru":"Проверка на робота не пройдена. Попробуйте ещё раз.","zh-cn":"机器人验证失败。请重试。","ja":"ロボット認証に失敗しました。もう一度お試しください。","ar":"فشل التحقق من الروبوت. حاول مرة أخرى."},
  "SMS quota exceeded. Try again later or check billing.":{"es":"Cuota de SMS superada. Inténtalo más tarde o revisa tu facturación.","fr":"Quota SMS dépassé. Réessayez plus tard ou vérifiez votre facturation.","de":"SMS-Kontingent erschöpft. Versuche es später erneut oder überprüfe deine Abrechnung.","ru":"Превышен лимит SMS. Попробуйте позже или проверьте платежи.","zh-cn":"短信配额已用尽。请稍后重试或检查账单。","ja":"SMSの上限を超えました。後でもう一度お試しいただくか、請求内容をご確認ください。","ar":"تم تجاوز حصة الرسائل النصية. حاول مرة أخرى لاحقًا أو راجع الفوترة."},
  "SOS — crisis support is available 24/7":{"es":"SOS: hay apoyo en crisis disponible las 24 horas, los 7 días de la semana","fr":"SOS — une aide en cas de crise est disponible 24 h/24, 7 j/7","de":"SOS — Krisenhilfe rund um die Uhr verfügbar","ru":"SOS — кризисная поддержка доступна круглосуточно","zh-cn":"SOS — 全天候提供危机支持","ja":"SOS — 24時間365日、危機サポートが利用できます","ar":"SOS — دعم الأزمات متاح على مدار الساعة"},
  "Safety Plan":{"es":"Plan de seguridad","fr":"Plan de sécurité","de":"Sicherheitsplan","ru":"План безопасности","zh-cn":"安全计划","ja":"安全計画","ar":"خطة السلامة"},
  "Same exercise again":{"es":"Mismo ejercicio otra vez","fr":"Même exercice à nouveau","de":"Gleiche Übung erneut","ru":"То же упражнение ещё раз","zh-cn":"再次进行同样的练习","ja":"同じエクササイズをもう一度","ar":"نفس التمرين مرة أخرى"},
  "Save Goal":{"es":"Guardar objetivo","fr":"Enregistrer l'objectif","de":"Ziel speichern","ru":"Сохранить цель","zh-cn":"保存目标","ja":"目標を保存","ar":"حفظ الهدف"},
  "Search cravings...":{"es":"Buscar deseos...","fr":"Rechercher des envies...","de":"Verlangen suchen...","ru":"Поиск влечений...","zh-cn":"搜索渴求...","ja":"渇望を検索...","ar":"البحث عن الرغبات..."},
  "Search moods...":{"es":"Buscar estados de ánimo...","fr":"Rechercher des humeurs...","de":"Stimmungen suchen...","ru":"Поиск настроений...","zh-cn":"搜索心情...","ja":"気分を検索...","ar":"البحث عن الحالات المزاجية..."},
  "Select a mood first.":{"es":"Selecciona un estado de ánimo primero.","fr":"Sélectionnez d'abord une humeur.","de":"Wähle zuerst eine Stimmung.","ru":"Сначала выберите настроение.","zh-cn":"请先选择一种心情。","ja":"最初に気分を選択してください。","ar":"اختر حالة مزاجية أولًا."},
  "Select your goals. You can always add more later.":{"es":"Selecciona tus objetivos. Siempre puedes añadir más después.","fr":"Sélectionnez vos objectifs. Vous pourrez toujours en ajouter plus tard.","de":"Wähle deine Ziele. Du kannst später jederzeit weitere hinzufügen.","ru":"Выберите свои цели. Вы всегда сможете добавить больше позже.","zh-cn":"选择你的目标。之后随时可以添加更多。","ja":"目標を選択してください。後からいつでも追加できます。","ar":"اختر أهدافك. يمكنك إضافة المزيد لاحقًا في أي وقت."},
  "Send Code":{"es":"Enviar código","fr":"Envoyer le code","de":"Code senden","ru":"Отправить код","zh-cn":"发送验证码","ja":"コードを送信","ar":"إرسال الرمز"},
  "Set Up Two-Step Login":{"es":"Configurar inicio de sesión en dos pasos","fr":"Configurer la connexion en deux étapes","de":"Zwei-Schritt-Anmeldung einrichten","ru":"Настроить двухэтапный вход","zh-cn":"设置两步登录","ja":"2段階ログインを設定","ar":"إعداد تسجيل الدخول بخطوتين"},
  "Set a goal with":{"es":"Establece un objetivo con","fr":"Définissez un objectif avec","de":"Setze ein Ziel mit","ru":"Установите цель с","zh-cn":"与……设定一个目标","ja":"一緒に目標を設定","ar":"حدد هدفًا مع"},
  "Share anonymous data":{"es":"Compartir datos anónimos","fr":"Partager des données anonymes","de":"Anonyme Daten teilen","ru":"Делиться анонимными данными","zh-cn":"分享匿名数据","ja":"匿名データを共有","ar":"مشاركة البيانات المجهولة"},
  "Share or Save":{"es":"Compartir o guardar","fr":"Partager ou enregistrer","de":"Teilen oder speichern","ru":"Поделиться или сохранить","zh-cn":"分享或保存","ja":"共有または保存","ar":"مشاركة أو حفظ"},
  "Sign in for cloud sync":{"es":"Inicia sesión para la sincronización en la nube","fr":"Connectez-vous pour la synchronisation cloud","de":"Für die Cloud-Synchronisierung anmelden","ru":"Войдите в систему для облачной синхронизации","zh-cn":"登录以启用云同步","ja":"クラウド同期にはサインインしてください","ar":"سجّل الدخول للمزامنة السحابية"},
  "Sign in to find a comrade.":{"es":"Inicia sesión para encontrar un compañero.","fr":"Connectez-vous pour trouver un compagnon.","de":"Melde dich an, um einen Weggefährten zu finden.","ru":"Войдите, чтобы найти товарища.","zh-cn":"登录以寻找同伴。","ja":"仲間を見つけるにはサインインしてください。","ar":"سجّل الدخول للعثور على رفيق."},
  "Signing in...":{"es":"Iniciando sesión...","fr":"Connexion en cours...","de":"Anmeldung läuft...","ru":"Вход в систему...","zh-cn":"正在登录...","ja":"サインイン中...","ar":"جارٍ تسجيل الدخول..."},
  "Since started":{"es":"Desde que empezó","fr":"Depuis le début","de":"Seit Beginn","ru":"С момента начала","zh-cn":"自开始起","ja":"開始から","ar":"منذ البداية"},
  "Skip for now":{"es":"Omitir por ahora","fr":"Passer pour le moment","de":"Vorerst überspringen","ru":"Пропустить пока","zh-cn":"暂时跳过","ja":"今はスキップ","ar":"تخطٍّ الآن"},
  "Sober streak":{"es":"Racha de sobriedad","fr":"Série de sobriété","de":"Nüchternheits-Streak","ru":"Серия трезвости","zh-cn":"清醒成就","ja":"禁欲継続中","ar":"سلسلة التعافي"},
  "Something went wrong.":{"es":"Algo salió mal.","fr":"Une erreur s'est produite.","de":"Etwas ist schiefgelaufen.","ru":"Что-то пошло не так.","zh-cn":"出问题了。","ja":"問題が発生しました。","ar":"حدث خطأ ما."},
  "Speak the passphrase to unseal":{"es":"Di la frase de contraseña para desbloquear","fr":"Prononcez la phrase secrète pour déverrouiller","de":"Sprich die Passphrase, um zu entsiegeln","ru":"Произнесите кодовую фразу для разблокировки","zh-cn":"说出口令短语以解锁","ja":"パスフレーズを読み上げて解錠します","ar":"انطق عبارة المرور لفك القفل"},
  "Start Breathing":{"es":"Empezar a respirar","fr":"Commencer la respiration","de":"Mit dem Atmen beginnen","ru":"Начать дыхание","zh-cn":"开始呼吸","ja":"呼吸を始める","ar":"ابدأ التنفس"},
  "Support":{"es":"Apoyo","fr":"Soutien","de":"Unterstützung","ru":"Поддержка","zh-cn":"支持","ja":"サポート","ar":"الدعم"},
  "Support Network":{"es":"Red de apoyo","fr":"Réseau de soutien","de":"Unterstützungsnetzwerk","ru":"Сеть поддержки","zh-cn":"支持网络","ja":"サポートネットワーク","ar":"شبكة الدعم"},
  "Sync Now":{"es":"Sincronizar ahora","fr":"Synchroniser maintenant","de":"Jetzt synchronisieren","ru":"Синхронизировать сейчас","zh-cn":"立即同步","ja":"今すぐ同期","ar":"مزامنة الآن"},
  "Take Assessment":{"es":"Hacer evaluación","fr":"Passer l'évaluation","de":"Bewertung durchführen","ru":"Пройти оценку","zh-cn":"进行评估","ja":"評価を受ける","ar":"إجراء التقييم"},
  "Take a screenshot of the card above to share!":{"es":"¡Haz una captura de pantalla de la tarjeta de arriba para compartirla!","fr":"Prenez une capture d'écran de la carte ci-dessus pour la partager !","de":"Mach einen Screenshot von der Karte oben, um sie zu teilen!","ru":"Сделайте скриншот карточки выше, чтобы поделиться!","zh-cn":"截取上方卡片截图进行分享！","ja":"上のカードのスクリーンショットを撮って共有しましょう！","ar":"التقط لقطة شاشة للبطاقة أعلاه للمشاركة!"},
  "Terms":{"es":"Términos","fr":"Conditions","de":"Begriffe","ru":"Условия","zh-cn":"条款","ja":"規約","ar":"الشروط"},
  "Terms & Conditions":{"es":"Términos y condiciones","fr":"Conditions générales","de":"Allgemeine Geschäftsbedingungen","ru":"Условия и положения","zh-cn":"条款与条件","ja":"利用規約","ar":"الشروط والأحكام"},
  "Text HOME to":{"es":"Envía HOME al","fr":"Envoyez HOME au","de":"Sende HOME an","ru":"Отправьте HOME на","zh-cn":"将 HOME 发送至","ja":"HOME を送信","ar":"أرسل HOME إلى"},
  "Thank you! Your recommendation has been submitted.":{"es":"¡Gracias! Se ha enviado tu recomendación.","fr":"Merci ! Votre recommandation a été envoyée.","de":"Danke! Deine Empfehlung wurde übermittelt.","ru":"Спасибо! Ваша рекомендация отправлена.","zh-cn":"谢谢！你的推荐已提交。","ja":"ありがとうございます！ご要望を送信しました。","ar":"شكرًا لك! تم إرسال توصيتك."},
  "That code was not correct.":{"es":"Ese código no era correcto.","fr":"Ce code était incorrect.","de":"Dieser Code war nicht korrekt.","ru":"Этот код неверный.","zh-cn":"那个验证码不正确。","ja":"そのコードは正しくありませんでした。","ar":"هذا الرمز غير صحيح."},
  "That is an incredible milestone. You are building something real, one day at a time.":{"es":"Es un hito increíble. Estás construyendo algo real, día a día.","fr":"C'est un cap incroyable. Vous construisez quelque chose de réel, jour après jour.","de":"Das ist ein unglaublicher Meilenstein. Du baust etwas Echtes auf, Tag für Tag.","ru":"Это невероятная веха. Вы строите что-то настоящее, день за днём.","zh-cn":"这是一个了不起的里程碑。你正在一天天地建设真实的东西。","ja":"これは素晴らしい節目です。あなたは日々、本物のものを築いています。","ar":"هذه علامة فارقة رائعة. أنت تبني شيئًا حقيقيًا، يومًا بعد يوم."},
  "That phone number looks invalid.":{"es":"Ese número de teléfono parece inválido.","fr":"Ce numéro de téléphone semble invalide.","de":"Diese Telefonnummer scheint ungültig zu sein.","ru":"Похоже, этот номер телефона недействителен.","zh-cn":"该电话号码似乎无效。","ja":"その電話番号は無効のようです。","ar":"يبدو أن رقم الهاتف هذا غير صالح."},
  "The Vault":{"es":"La Caja fuerte","fr":"Le Coffre-fort","de":"Der Tresor","ru":"Сейф","zh-cn":"保险库","ja":"金庫","ar":"الخزنة"},
  "Therapist Finder":{"es":"Buscar terapeuta","fr":"Recherche de thérapeute","de":"Therapeuten-Finder","ru":"Поиск терапевта","zh-cn":"寻找治疗师","ja":"セラピスト検索","ar":"البحث عن معالج"},
  "These feelings are real. Help is available right now.":{"es":"Estos sentimientos son reales. La ayuda está disponible ahora mismo.","fr":"Ces sentiments sont réels. De l'aide est disponible dès maintenant.","de":"Diese Gefühle sind echt. Hilfe ist genau jetzt verfügbar.","ru":"Эти чувства настоящие. Помощь доступна прямо сейчас.","zh-cn":"这些感受是真实的。现在就可以获得帮助。","ja":"その気持ちは本物です。今すぐ助けが得られます。","ar":"هذه المشاعر حقيقية. المساعدة متاحة الآن."},
  "This email is already registered.":{"es":"Este correo ya está registrado.","fr":"Cet e-mail est déjà enregistré.","de":"Diese E-Mail ist bereits registriert.","ru":"Этот адрес электронной почты уже зарегистрирован.","zh-cn":"该邮箱已注册。","ja":"このメールは既に登録されています。","ar":"هذا البريد الإلكتروني مسجّل بالفعل."},
  "This email is already registered. Try Sign In.":{"es":"Este correo ya está registrado. Prueba a iniciar sesión.","fr":"Cet e-mail est déjà enregistré. Essayez de vous connecter.","de":"Diese E-Mail ist bereits registriert. Versuche dich anzumelden.","ru":"Этот адрес электронной почты уже зарегистрирован. Попробуйте войти в систему.","zh-cn":"该邮箱已注册。请尝试登录。","ja":"このメールは既に登録されています。サインインをお試しください。","ar":"هذا البريد الإلكتروني مسجّل بالفعل. جرب تسجيل الدخول."},
  "This records a relapse date. Remember: recovery is not linear. Every day is a fresh start.":{"es":"Esto registra una fecha de recaída. Recuerda: la recuperación no es lineal. Cada día es un nuevo comienzo.","fr":"Ceci enregistre une date de rechute. Souvenez-vous : le rétablissement n'est pas linéaire. Chaque jour est un nouveau départ.","de":"Dies speichert ein Rückfalldatum. Denk daran: Erholung ist nicht linear. Jeder Tag ist ein Neuanfang.","ru":"Это фиксирует дату срыва. Помните: восстановление не линейно. Каждый день — это новое начало.","zh-cn":"这将记录复发日期。请记住：康复不是线性的。每一天都是全新的开始。","ja":"これは再発日を記録します。覚えておいてください：回復は一直線ではありません。毎日が新たなスタートです。","ar":"هذا يسجل تاريخ الانتكاسة. تذكر: التعافي ليس خطيًا. كل يوم هو بداية جديدة."},
  "This will decrypt all journal entries. Are you sure?":{"es":"Esto descifrará todas las entradas del diario. ¿Estás seguro?","fr":"Cela décryptera toutes les entrées du journal. Tu es sûr ?","de":"Das entschlüsselt alle Tagebucheinträge. Bist du sicher?","ru":"Это расшифрует все записи дневника. Ты уверен?","zh-cn":"这将解密所有日记条目。你确定吗？","ja":"すべての日記を復号します。よろしいですか？","ar":"سيؤدي هذا إلى فك تشفير جميع إدخالات اليوميات. هل أنت متأكد؟"},
  "This will erase all local data and let you sign in again.":{"es":"Esto borrará todos los datos locales y te permitirá volver a iniciar sesión.","fr":"Cela effacera toutes les données locales et te permettra de te reconnecter.","de":"Das löscht alle lokalen Daten und du kannst dich neu anmelden.","ru":"Это удалит все локальные данные, и ты сможешь войти снова.","zh-cn":"这将清除所有本地数据，让你可以重新登录。","ja":"すべてのローカルデータを消去し、再度ログインできるようにします。","ar":"سيؤدي هذا إلى مسح جميع البيانات المحلية والسماح لك بتسجيل الدخول مرة أخرى."},
  "This will overwrite all current data. Are you sure?":{"es":"Esto sobrescribirá todos los datos actuales. ¿Estás seguro?","fr":"Cela écrasera toutes les données actuelles. Tu es sûr ?","de":"Das überschreibt alle aktuellen Daten. Bist du sicher?","ru":"Это перезапишет все текущие данные. Ты уверен?","zh-cn":"这将覆盖所有当前数据。你确定吗？","ja":"現在のすべてのデータが上書きされます。よろしいですか？","ar":"سيؤدي هذا إلى استبدال جميع البيانات الحالية. هل أنت متأكد؟"},
  "Too many attempts. Lockout is getting longer.":{"es":"Demasiados intentos. El tiempo de bloqueo cada vez es más largo.","fr":"Trop de tentatives. Le blocage s'allonge.","de":"Zu viele Versuche. Die Sperre wird immer länger.","ru":"Слишком много попыток. Блокировка становится дольше.","zh-cn":"尝试次数过多。锁定时间越来越长。","ja":"試行回数が多すぎます。ロックが長くなっています。","ar":"محاولات كثيرة جدًا. مدة القفل تزداد."},
  "Too many attempts. Please try again later.":{"es":"Demasiados intentos. Vuelve a intentarlo más tarde.","fr":"Trop de tentatives. Réessaie plus tard.","de":"Zu viele Versuche. Versuch es später noch einmal.","ru":"Слишком много попыток. Попробуй позже.","zh-cn":"尝试次数过多。请稍后再试。","ja":"試行回数が多すぎます。しばらくしてからもう一度お試しください。","ar":"محاولات كثيرة جدًا. يرجى المحاولة مرة أخرى لاحقًا."},
  "Too many attempts. Try again in ":{"es":"Demasiados intentos. Vuelve a intentarlo en ","fr":"Trop de tentatives. Réessaie dans ","de":"Zu viele Versuche. Versuch es erneut in ","ru":"Слишком много попыток. Попробуй снова через ","zh-cn":"尝试次数过多。请在 ","ja":"試行回数が多すぎます。あと ","ar":"محاولات كثيرة جدًا. حاول مرة أخرى خلال "},
  "Total":{"es":"Total","fr":"Total","de":"Gesamt","ru":"Всего","zh-cn":"总计","ja":"合計","ar":"الإجمالي"},
  "Total Logged":{"es":"Total registrado","fr":"Total consigné","de":"Gesamt erfasst","ru":"Всего записано","zh-cn":"已记录总数","ja":"記録合計","ar":"الإجمالي المسجل"},
  "Track moods, journal, build habits, and grow.":{"es":"Registra tu estado de ánimo, escribe un diario, crea hábitos y crece.","fr":"Suis tes humeurs, tiens ton journal, construis des habitudes et grandis.","de":"Verfolge deine Stimmungen, führe ein Tagebuch, baue Gewohnheiten auf und wachse.","ru":"Отслеживай настроение, веди дневник, вырабатывай привычки и расти.","zh-cn":"记录心情、写日记、养成习惯、不断成长。","ja":"気分を記録し、ジャーナルを書き、習慣を築き、成長しましょう。","ar":"تتبع مزاجك، واكتب يومياتك، وابنِ عاداتك، وانمُ."},
  "Track when cravings hit so patterns can be spotted.":{"es":"Registra cuándo te llega el antojo para poder detectar patrones.","fr":"Note quand les envies frappent pour repérer les schémas.","de":"Halte fest, wann das Verlangen auftritt, damit Muster sichtbar werden.","ru":"Отмечай, когда накатывает тяга, чтобы замечать закономерности.","zh-cn":"记录渴求出现的时间，以便发现规律。","ja":"渇望が起きたときを記録して、パターンに気づけるようにしましょう。","ar":"سجّل متى تأتيك الرغبة الشديدة لملاحظة الأنماط."},
  "Triggers":{"es":"Desencadenantes","fr":"Déclencheurs","de":"Auslöser","ru":"Триггеры","zh-cn":"触发因素","ja":"引き金","ar":"المحفزات"},
  "Try another exercise":{"es":"Prueba otro ejercicio","fr":"Essaie un autre exercice","de":"Probier eine andere Übung","ru":"Попробуй другое упражнение","zh-cn":"试试另一个练习","ja":"別のエクササイズを試す","ar":"جرّب تمرينًا آخر"},
  "Two-Step Login":{"es":"Inicio de sesión en dos pasos","fr":"Connexion en deux étapes","de":"Zwei-Schritte-Anmeldung","ru":"Двухэтапный вход","zh-cn":"两步登录","ja":"2段階ログイン","ar":"تسجيل الدخول بخطوتين"},
  "Two-Step Verification":{"es":"Verificación en dos pasos","fr":"Vérification en deux étapes","de":"Zwei-Schritte-Verifizierung","ru":"Двухэтапная проверка","zh-cn":"两步验证","ja":"2段階認証","ar":"التحقق بخطوتين"},
  "Two-step login active":{"es":"Inicio de sesión en dos pasos activo","fr":"Connexion en deux étapes active","de":"Zwei-Schritte-Anmeldung aktiv","ru":"Двухэтапный вход включён","zh-cn":"两步登录已启用","ja":"2段階ログインが有効です","ar":"تسجيل الدخول بخطوتين مفعّل"},
  "Two-step login enabled!":{"es":"¡Inicio de sesión en dos pasos activado!","fr":"Connexion en deux étapes activée !","de":"Zwei-Schritte-Anmeldung aktiviert!","ru":"Двухэтапный вход включён!","zh-cn":"已启用两步登录！","ja":"2段階ログインを有効にしました！","ar":"تم تفعيل تسجيل الدخول بخطوتين!"},
  "Two-step login is not available yet.":{"es":"El inicio de sesión en dos pasos aún no está disponible.","fr":"La connexion en deux étapes n'est pas encore disponible.","de":"Die Zwei-Schritte-Anmeldung ist noch nicht verfügbar.","ru":"Двухэтапный вход пока недоступен.","zh-cn":"两步登录功能尚不可用。","ja":"2段階ログインはまだ利用できません。","ar":"تسجيل الدخول بخطوتين غير متاح بعد."},
  "Two-step login needs the Phone sign-in provider enabled on this project first.":{"es":"El inicio de sesión en dos pasos requiere que primero se active el proveedor de acceso por teléfono en este proyecto.","fr":"La connexion en deux étapes nécessite d'activer d'abord le fournisseur de connexion par téléphone sur ce projet.","de":"Für die Zwei-Schritte-Anmeldung muss zuerst der Telefon-Anmeldeanbieter in diesem Projekt aktiviert werden.","ru":"Для двухэтапного входа нужно сначала включить провайдер входа по телефону в этом проекте.","zh-cn":"两步登录需要先在此项目中启用手机登录提供商。","ja":"2段階ログインには、このプロジェクトで電話サインイン プロバイダーが有効になっている必要があります。","ar":"يتطلب تسجيل الدخول بخطوتين تفعيل مزوّد تسجيل الدخول بالهاتف في هذا المشروع أولًا."},
  "Two-step login removed.":{"es":"Se ha eliminado el inicio de sesión en dos pasos.","fr":"La connexion en deux étapes a été supprimée.","de":"Die Zwei-Schritte-Anmeldung wurde entfernt.","ru":"Двухэтапный вход удалён.","zh-cn":"已移除两步登录。","ja":"2段階ログインを削除しました。","ar":"تمت إزالة تسجيل الدخول بخطوتين."},
  "Unable to connect. Check your internet connection and try again.":{"es":"No se pudo conectar. Revisa tu conexión a internet e inténtalo de nuevo.","fr":"Connexion impossible. Vérifie ta connexion internet et réessaie.","de":"Verbindung nicht möglich. Prüfe deine Internetverbindung und versuch es noch einmal.","ru":"Не удалось подключиться. Проверь подключение к интернету и попробуй снова.","zh-cn":"无法连接。请检查你的网络连接后重试。","ja":"接続できません。インターネット接続を確認して、もう一度お試しください。","ar":"تعذّر الاتصال. تحقق من اتصالك بالإنترنت وحاول مرة أخرى."},
  "Unlock Encryption":{"es":"Desbloquear cifrado","fr":"Déverrouiller le chiffrement","de":"Verschlüsselung entsperren","ru":"Разблокировать шифрование","zh-cn":"解锁加密","ja":"暗号化を解除","ar":"إلغاء قفل التشفير"},
  "Unlock Now":{"es":"Desbloquear ahora","fr":"Déverrouiller maintenant","de":"Jetzt entsperren","ru":"Разблокировать сейчас","zh-cn":"立即解锁","ja":"今すぐ解除","ar":"ألغِ القفل الآن"},
  "Unlocked":{"es":"Desbloqueado","fr":"Déverrouillé","de":"Entsperrt","ru":"Разблокировано","zh-cn":"已解锁","ja":"解除済み","ar":"تم إلغاء القفل"},
  "Verify":{"es":"Verificar","fr":"Vérifier","de":"Bestätigen","ru":"Подтвердить","zh-cn":"验证","ja":"確認","ar":"تحقق"},
  "Verifying...":{"es":"Verificando...","fr":"Vérification...","de":"Wird bestätigt...","ru":"Проверка...","zh-cn":"正在验证...","ja":"確認中...","ar":"جارٍ التحقق..."},
  "View Plan Summary":{"es":"Ver resumen del plan","fr":"Voir le résumé du plan","de":"Plan-Zusammenfassung anzeigen","ru":"Посмотреть сводку плана","zh-cn":"查看计划摘要","ja":"プラン概要を見る","ar":"عرض ملخص الخطة"},
  "Week Streak":{"es":"Racha de semanas","fr":"Série de semaines","de":"Wochenserie","ru":"Недельная серия","zh-cn":"周连续记录","ja":"週間連続記録","ar":"سلسلة الأسابيع"},
  "Welcome to Re.Claim":{"es":"Te damos la bienvenida a Re.Claim","fr":"Bienvenue sur Re.Claim","de":"Willkommen bei Re.Claim","ru":"Добро пожаловать в Re.Claim","zh-cn":"欢迎使用 Re.Claim","ja":"Re.Claim へようこそ","ar":"مرحبًا بك في Re.Claim"},
  "What are my early warning signs?":{"es":"¿Cuáles son mis señales de alerta temprana?","fr":"Quels sont mes signes d'alerte précoces ?","de":"Was sind meine frühen Warnzeichen?","ru":"Какие у меня ранние признаки опасности?","zh-cn":"我的早期预警信号有哪些？","ja":"私の初期の警告サインは何ですか？","ar":"ما هي علامات التحذير المبكر لديّ؟"},
  "What coping strategies work for me?":{"es":"¿Qué estrategias de afrontamiento funcionan para mí?","fr":"Quelles stratégies fonctionnent pour moi ?","de":"Welche Bewältigungsstrategien funktionieren für mich?","ru":"Какие стратегии совладания работают для меня?","zh-cn":"哪些应对策略对我有效？","ja":"どんな対処法が私に合う？","ar":"ما هي استراتيجيات التأقلم التي تناسبني؟"},
  "What do you commit to going forward?":{"es":"¿A qué te comprometes de ahora en adelante?","fr":"À quoi t'engages-tu à partir de maintenant ?","de":"Wozu verpflichtest du dich in Zukunft?","ru":"Чему ты обязуешься с этого момента?","zh-cn":"你今后承诺要做什么？","ja":"これから何を約束しますか？","ar":"بماذا تلتزم من الآن فصاعدًا؟"},
  "What do you forgive yourself for?":{"es":"¿Qué te perdonas a ti mismo?","fr":"Qu'est-ce que tu te pardonnes ?","de":"Was vergibst du dir selbst?","ru":"За что ты себя прощаешь?","zh-cn":"你原谅自己什么？","ja":"自分の何を許しますか？","ar":"ماذا تسامح نفسك عليه؟"},
  "What do you want to accomplish?":{"es":"¿Qué quieres lograr?","fr":"Qu'est-ce que tu veux accomplir ?","de":"Was möchtest du erreichen?","ru":"Чего ты хочешь добиться?","zh-cn":"你想要实现什么？","ja":"何を成し遂げたいですか？","ar":"ما الذي تريد تحقيقه؟"},
  "What does my daily recovery routine look like?":{"es":"¿Cómo es mi rutina diaria de recuperación?","fr":"À quoi ressemble ma routine de rétablissement quotidienne ?","de":"Wie sieht meine tägliche Genesungsroutine aus?","ru":"Как выглядит моя ежедневная рутина восстановления?","zh-cn":"我每天的康复日常是什么样的？","ja":"毎日の回復のルーティンはどんな感じ？","ar":"كيف تبدو روتيني اليومي للتعافي؟"},
  "What habit do you want to track?":{"es":"¿Qué hábito quieres registrar?","fr":"Quelle habitude veux-tu suivre ?","de":"Welche Gewohnheit möchtest du verfolgen?","ru":"Какую привычку ты хочешь отслеживать?","zh-cn":"你想跟踪哪个习惯？","ja":"どんな習慣を記録したいですか？","ar":"ما العادة التي تريد تتبعها؟"},
  "What helps:":{"es":"Lo que ayuda:","fr":"Ce qui aide :","de":"Was hilft:","ru":"Что помогает:","zh-cn":"有帮助的：","ja":"役立つこと：","ar":"ما يساعد:"},
  "What triggered it? (e.g. stress, boredom, social pressure)":{"es":"¿Qué lo provocó? (p. ej. estrés, aburrimiento, presión social)","fr":"Qu'est-ce qui l'a déclenché ? (p. ex. stress, ennui, pression sociale)","de":"Was hat es ausgelöst? (z. B. Stress, Langeweile, sozialer Druck)","ru":"Что это спровоцировало? (напр., стресс, скука, давление окружения)","zh-cn":"是什么触发了它？（例如压力、无聊、社交压力）","ja":"何がきっかけでしたか？（例：ストレス、退屈、周囲のプレッシャー）","ar":"ما الذي أثارها؟ (مثلًا: التوتر، الملل، الضغط الاجتماعي)"},
  "What triggers or situations put me at risk?":{"es":"¿Qué desencadenantes o situaciones me ponen en riesgo?","fr":"Quels déclencheurs ou situations me mettent en danger ?","de":"Welche Auslöser oder Situationen bringen mich in Gefahr?","ru":"Какие триггеры или ситуации подвергают меня риску?","zh-cn":"哪些触发因素或情况会让我面临风险？","ja":"どんなきっかけや状況が私を危険にさらす？","ar":"ما المحفزات أو المواقف التي تعرّضني للخطر؟"},
  "When the urge hits, do one of these":{"es":"Cuando llegue el impulso, haz una de estas cosas","fr":"Quand l'envie survient, fais l'une de ces choses","de":"Wenn das Verlangen zuschlägt, mach eines davon","ru":"Когда накатывает желание, сделай одно из этого","zh-cn":"当冲动来袭时，做其中一件事","ja":"衝動が来たら、次のどれかをやってみよう","ar":"عندما تأتي الرغبة، افعل شيئًا من هذه"},
  "When you log a craving, your Why board will remind you why you started.":{"es":"Cuando registres un antojo, tu tablero del Por Qué te recordará por qué empezaste.","fr":"Quand tu notes une envie, ton tableau « Pourquoi » te rappellera pourquoi tu as commencé.","de":"Wenn du ein Verlangen erfasst, erinnert dich dein Warum-Board daran, warum du angefangen hast.","ru":"Когда ты отмечаешь тягу, твоя доска «Почему» напомнит, зачем ты начал.","zh-cn":"当你记录渴求时，你的“为什么”看板会提醒你为什么开始。","ja":"渇望を記録すると、あなたの「なぜ」ボードが始めた理由を思い出させてくれます。","ar":"عندما تسجّل رغبة شديدة، ستذكرك لوحة «لماذا» بالسبب الذي بدأت من أجله."},
  "Who can I reach out to for support?":{"es":"¿A quién puedo recurrir para recibir apoyo?","fr":"À qui puis-je demander du soutien ?","de":"An wen kann ich mich um Unterstützung wenden?","ru":"К кому я могу обратиться за поддержкой?","zh-cn":"我可以向谁寻求支持？","ja":"誰にサポートを求めればいい？","ar":"إلى من يمكنني اللجوء للحصول على الدعم؟"},
  "Works offline and opens like an app":{"es":"Funciona sin conexión y se abre como una app","fr":"Fonctionne hors ligne et s'ouvre comme une app","de":"Funktioniert offline und öffnet sich wie eine App","ru":"Работает офлайн и открывается как приложение","zh-cn":"可离线使用，并像应用一样打开","ja":"オフラインでも動作し、アプリのように開けます","ar":"يعمل دون اتصال ويفتح كتطبيق"},
  "Works offline. Your data stays on your device.":{"es":"Funciona sin conexión. Tus datos permanecen en tu dispositivo.","fr":"Fonctionne hors ligne. Tes données restent sur ton appareil.","de":"Funktioniert offline. Deine Daten bleiben auf deinem Gerät.","ru":"Работает офлайн. Твои данные остаются на твоём устройстве.","zh-cn":"可离线使用。你的数据会保留在设备上。","ja":"オフラインで動作します。データは端末に残ります。","ar":"يعمل دون اتصال. تبقى بياناتك على جهازك."},
  "Write a reason first.":{"es":"Escribe primero un motivo.","fr":"Écris d'abord une raison.","de":"Schreib zuerst einen Grund.","ru":"Сначала напиши причину.","zh-cn":"请先写下理由。","ja":"先に理由を書いてください。","ar":"اكتب سببًا أولًا."},
  "Wrong passphrase. Try again.":{"es":"Frase de acceso incorrecta. Inténtalo de nuevo.","fr":"Mauvaise phrase secrète. Réessaie.","de":"Falsche Passphrase. Versuch es noch einmal.","ru":"Неверная парольная фраза. Попробуй снова.","zh-cn":"口令错误。请重试。","ja":"パスフレーズが正しくありません。もう一度お試しください。","ar":"عبارة المرور خاطئة. حاول مرة أخرى."},
  "You are not alone.":{"es":"No estás solo.","fr":"Tu n'es pas seul.","de":"Du bist nicht allein.","ru":"Ты не один.","zh-cn":"你并不孤单。","ja":"あなたは一人じゃありません。","ar":"أنت لست وحدك."},
  "You have completed":{"es":"Has completado","fr":"Tu as terminé","de":"Du hast abgeschlossen","ru":"Ты прошёл","zh-cn":"你已完成","ja":"達成しました","ar":"لقد أكملت"},
  "You reached out for help earlier. That took strength. Would you like to check in with yourself?":{"es":"Pediste ayuda antes. Eso requirió fortaleza. ¿Quieres hacer un registro contigo mismo?","fr":"Tu as demandé de l'aide tout à l'heure. Il a fallu du courage. Veux-tu faire le point avec toi-même ?","de":"Du hast dich vorhin Hilfe geholt. Das hat Stärke erfordert. Möchtest du bei dir selbst nachschauen?","ru":"Ты обратился за помощью ранее. Это потребовало силы. Хочешь проверить, как ты себя чувствуешь?","zh-cn":"你之前主动寻求了帮助。这需要勇气。要不要和自己打个卡？","ja":"先ほど助けを求めましたね。それには勇気が必要でした。今の自分の状態を確認してみませんか？","ar":"طلبت المساعدة في وقت سابق. وهذا يتطلب قوة. هل ترغب في التحقق من حالة نفسك؟"},
  "Your Emergency Contacts":{"es":"Tus contactos de emergencia","fr":"Tes contacts d'urgence","de":"Deine Notfallkontakte","ru":"Твои экстренные контакты","zh-cn":"你的紧急联系人","ja":"あなたの緊急連絡先","ar":"جهات الاتصال بالطوارئ لديك"},
  "Your Goals":{"es":"Tus metas","fr":"Tes objectifs","de":"Deine Ziele","ru":"Твои цели","zh-cn":"你的目标","ja":"あなたの目標","ar":"أهدافك"},
  "Your Partner":{"es":"Tu pareja","fr":"Ton partenaire","de":"Dein Partner","ru":"Твой партнёр","zh-cn":"你的伙伴","ja":"あなたのパートナー","ar":"شريكك"},
  "Your Progress Report":{"es":"Tu informe de progreso","fr":"Ton rapport de progression","de":"Dein Fortschrittsbericht","ru":"Твой отчёт о прогрессе","zh-cn":"你的进度报告","ja":"あなたの進捗レポート","ar":"تقرير تقدمك"},
  "Your Quests":{"es":"Tus desafíos","fr":"Tes missions","de":"Deine Quests","ru":"Твои задания","zh-cn":"你的任务","ja":"あなたのクエスト","ar":"مهامك"},
  "Your Safety Plan":{"es":"Tu plan de seguridad","fr":"Ton plan de sécurité","de":"Dein Sicherheitsplan","ru":"Твой план безопасности","zh-cn":"你的安全计划","ja":"あなたの安全プラン","ar":"خطة السلامة الخاصة بك"},
  "Your data syncs automatically to the cloud when you're signed in.":{"es":"Tus datos se sincronizan automáticamente con la nube cuando inicias sesión.","fr":"Tes données se synchronisent automatiquement dans le cloud quand tu es connecté.","de":"Deine Daten synchronisieren sich automatisch mit der Cloud, wenn du angemeldet bist.","ru":"Твои данные автоматически синхронизируются с облаком, когда ты вошёл в систему.","zh-cn":"登录后，你的数据会自动同步到云端。","ja":"ログインすると、データは自動的にクラウドと同期されます。","ar":"تتم مزامنة بياناتك تلقائيًا مع السحابة عند تسجيل الدخول."},
  "Your emergency contacts":{"es":"tus contactos de emergencia","fr":"tes contacts d'urgence","de":"deine Notfallkontakte","ru":"твои экстренные контакты","zh-cn":"你的紧急联系人","ja":"あなたの緊急連絡先","ar":"جهات الاتصال بالطوارئ لديك"},
  "Your journal, moods &amp; habits stay on your device. Partner features sync via Firebase.":{"es":"Tu diario, tus estados de ánimo y hábitos permanecen en tu dispositivo. Las funciones de pareja se sincronizan mediante Firebase.","fr":"Ton journal, tes humeurs et tes habitudes restent sur ton appareil. Les fonctionnalités partenaire se synchronisent via Firebase.","de":"Dein Tagebuch, deine Stimmungen und Gewohnheiten bleiben auf deinem Gerät. Partnerfunktionen synchronisieren sich über Firebase.","ru":"Твой дневник, настроение и привычки остаются на твоём устройстве. Функции для партнёра синхронизируются через Firebase.","zh-cn":"你的日记、心情和习惯会保留在设备上。伙伴功能通过 Firebase 同步。","ja":"ジャーナル、気分、習慣は端末に残ります。パートナー機能は Firebase 経由で同期されます。","ar":"تبقى يومياتك ومزاجك وعاداتك على جهازك. تتم مزامنة ميزات الشريك عبر Firebase."},
  "Your playbook":{"es":"Tu plan de juego","fr":"Ton plan d'action","de":"Dein Playbook","ru":"Твой план действий","zh-cn":"你的行动手册","ja":"あなたのプレイブック","ar":"دليلك"},
  "Your progress has been shared with":{"es":"Tu progreso se ha compartido con","fr":"Ton progrès a été partagé avec","de":"Dein Fortschritt wurde geteilt mit","ru":"Твой прогресс был отправлен","zh-cn":"你的进度已共享给","ja":"あなたの進捗を共有しました：","ar":"تمت مشاركة تقدمك مع"},
  "Your recovery &amp; wellness journey starts here.":{"es":"Tu viaje de recuperación y bienestar comienza aquí.","fr":"Ton parcours de rétablissement et de bien-être commence ici.","de":"Deine Reise zu Genesung und Wohlbefinden beginnt hier.","ru":"Твой путь восстановления и благополучия начинается здесь.","zh-cn":"你的康复与健康之旅从这里开始。","ja":"あなたの回復とウェルネスの旅はここから始まります。","ar":"رحلتك نحو التعافي والعافية تبدأ من هنا."},
  "and":{"es":"y","fr":"et","de":"und","ru":"и","zh-cn":"和","ja":"と","ar":"و"},
  "avg ":{"es":"prom. ","fr":"moy. ","de":"Ø ","ru":"средн. ","zh-cn":"平均 ","ja":"平均 ","ar":"المتوسط "},
  "breathing session":{"es":"sesión de respiración","fr":"séance de respiration","de":"Atemübung","ru":"сеанс дыхания","zh-cn":"呼吸练习","ja":"呼吸セッション","ar":"جلسة تنفس"},
  "breathing sessions":{"es":"sesiones de respiración","fr":"séances de respiration","de":"Atemübungen","ru":"сеансы дыхания","zh-cn":"呼吸练习","ja":"呼吸セッション","ar":"جلسات تنفس"},
  "cravings logged":{"es":"antojos registrados","fr":"envies notées","de":"Verlangen erfasst","ru":"тяг зафиксировано","zh-cn":"已记录渴求","ja":"渇望の記録数","ar":"رغبات شديدة مسجلة"},
  "e.g. I commit to reaching out before the urge wins. I commit to showing up for myself tomorrow.":{"es":"p. ej. Me comprometo a pedir ayuda antes de que gane el impulso. Me comprometo a estar ahí para mí mañana.","fr":"p. ex. Je m'engage à demander de l'aide avant que l'envie ne gagne. Je m'engage à être présent pour moi demain.","de":"z. B. Ich verpflichte mich, Unterstützung zu suchen, bevor das Verlangen gewinnt. Ich verpflichte mich, morgen für mich da zu sein.","ru":"напр., Я обязуюсь обращаться за помощью, прежде чем тяга победит. Я обязуюсь позаботиться о себе завтра.","zh-cn":"例如，我承诺在冲动占上风之前主动求助。我承诺明天为自己而坚持。","ja":"例：衝動に負ける前に助けを求めることを約束します。明日も自分に寄り添うことを約束します。","ar":"مثلًا: ألتزم بطلب المساعدة قبل أن تغلبني الرغبة. ألتزم بالحضور لنفسي غدًا."},
  "e.g. I forgive myself for giving in to the craving. I forgive myself for the shame I carried after.":{"es":"p. ej. Me perdono por haber cedido al antojo. Me perdono por la vergüenza que cargué después.","fr":"p. ex. Je me pardonne d'avoir cédé à l'envie. Je me pardonne la honte que j'ai portée après.","de":"z. B. Ich verzeihe mir, dem Verlangen nachgegeben zu haben. Ich verzeihe mir die Scham, die ich danach getragen habe.","ru":"напр., Я прощаю себя за то, что поддался тяге. Я прощаю себя за стыд, который носил после.","zh-cn":"例如，我原谅自己屈从于渴求。我原谅自己事后背负的羞耻。","ja":"例：渇望に負けてしまった自分を許します。その後ずっと抱えてきた恥を許します。","ar":"مثلًا: أسامح نفسي على الاستسلام للرغبة الشديدة. أسامح نفسي على الخجل الذي حملته بعدها."},
  "e.g. calling a friend, exercise, breathing, journaling":{"es":"p. ej. llamar a un amigo, hacer ejercicio, respirar, escribir","fr":"p. ex. appeler un ami, faire de l'exercice, respirer, écrire","de":"z. B. einen Freund anrufen, Sport, Atmen, Tagebuch schreiben","ru":"напр., позвонить другу, упражнения, дыхание, дневник","zh-cn":"例如：给朋友打电话、运动、深呼吸、写日记","ja":"例：友人に電話する、運動、呼吸、ジャーナルを書く","ar":"مثلًا: الاتصال بصديق، ممارسة الرياضة، التنفس، كتابة اليوميات"},
  "e.g. certain people, places, emotions, times of day":{"es":"p. ej. ciertas personas, lugares, emociones, momentos del día","fr":"p. ex. certaines personnes, lieux, émotions, moments de la journée","de":"z. B. bestimmte Menschen, Orte, Gefühle, Tageszeiten","ru":"напр., определённые люди, места, эмоции, время суток","zh-cn":"例如：某些人、地点、情绪、一天中的某些时刻","ja":"例：特定の人、場所、感情、時間帯","ar":"مثلًا: أشخاص معيّنون، أماكن، مشاعر، أوقات من اليوم"},
  "e.g. irritability, isolation, craving intensity spikes, sleep changes":{"es":"p. ej. irritabilidad, aislamiento, picos de intensidad del antojo, cambios en el sueño","fr":"p. ex. irritabilité, isolement, pics d'intensité des envies, changements de sommeil","de":"z. B. Gereiztheit, Rückzug, Verlangens-Spitzen, Schlafveränderungen","ru":"напр., раздражительность, изоляция, пики интенсивности тяги, изменения сна","zh-cn":"例如：易怒、孤立、渴求强度飙升、睡眠变化","ja":"例：イライラ、孤立、渇望の強さの急上昇、睡眠の変化","ar":"مثلًا: الانفعال، العزلة، ذروة شدة الرغبة، تغيّرات النوم"},
  "e.g. morning meditation, meeting attendance, evening reflection":{"es":"p. ej. meditación por la mañana, asistir a reuniones, reflexión por la noche","fr":"p. ex. méditation le matin, présence aux réunions, réflexion le soir","de":"z. B. morgendliche Meditation, Besuch von Treffen, abendliche Reflexion","ru":"напр., утренняя медитация, посещение собраний, вечерняя рефлексия","zh-cn":"例如：晨间冥想、参加聚会、晚间反思","ja":"例：朝の瞑想、ミーティングへの出席、夜の振り返り","ar":"مثلًا: التأمل صباحًا، حضور الاجتماعات، التفكّر مساءً"},
  "e.g. sponsor, therapist, family member, friend":{"es":"p. ej. un patrocinador, un terapeuta, un familiar, un amigo","fr":"p. ex. un parrain, un thérapeute, un membre de ta famille, un ami","de":"z. B. Sponsor, Therapeut, Familienmitglied, Freund","ru":"напр., спонсор, терапевт, член семьи, друг","zh-cn":"例如：支持人、治疗师、家人、朋友","ja":"例：スポンサー、セラピスト、家族、友人","ar":"مثلًا: مرشد، معالج، فرد من العائلة، صديق"},
  "goal(s) added!":{"es":"¡Meta(s) añadida(s)!","fr":"Objectif(s) ajouté(s) !","de":"Ziel(e) hinzugefügt!","ru":"Цель(и) добавлена(ы)!","zh-cn":"已添加目标！","ja":"目標を追加しました！","ar":"تمت إضافة الهدف(الأهداف)!"},
  "in — nice work. So far your data lives only on this device. Export a copy, or sign in for automatic cloud sync, so your streak and journal are never lost.":{"es":"en esto — buen trabajo. Por ahora tus datos viven solo en este dispositivo. Exporta una copia o inicia sesión para la sincronización automática en la nube, para que tu racha y tu diario nunca se pierdan.","fr":"en route — bien joué. Pour l'instant, tes données ne vivent que sur cet appareil. Exporte une copie ou connecte-toi pour la synchronisation automatique dans le cloud, afin que ta série et ton journal ne soient jamais perdus.","de":"dabei — gute Arbeit. Bisher liegen deine Daten nur auf diesem Gerät. Exportiere eine Kopie oder melde dich für die automatische Cloud-Synchronisierung an, damit deine Serie und dein Tagebuch nie verloren gehen.","ru":"в деле — отличная работа. Пока твои данные хранятся только на этом устройстве. Сделай резервную копию или войди в систему для автоматической облачной синхронизации, чтобы твоя серия и дневник никогда не потерялись.","zh-cn":"坚持中 — 干得不错。到目前为止，你的数据只保存在这台设备上。导出副本，或登录以启用自动云同步，这样你的连续记录和日记就永远不会丢失。","ja":"続けていますね — 素晴らしい。今のところ、データはこの端末だけに保存されています。連続記録とジャーナルを失わないために、コピーを書き出すか、ログインして自動クラウド同期を有効にしてください。","ar":"مستمر — عمل رائع. حتى الآن، بياناتك موجودة على هذا الجهاز فقط. صدّر نسخة، أو سجّل الدخول للمزامنة السحابية التلقائية، حتى لا تُفقد سلسلة أيامك ويومياتك أبدًا."},
  "intensity":{"es":"intensidad","fr":"intensité","de":"Intensität","ru":"интенсивность","zh-cn":"强度","ja":"強さ","ar":"الشدة"},
  "logged cravings":{"es":"antojos registrados","fr":"envies notées","de":"erfasstes Verlangen","ru":"зафиксированные тяги","zh-cn":"已记录的渴求","ja":"記録された渇望","ar":"رغبات شديدة مسجلة"},
  "your partner":{"es":"tu pareja","fr":"ton partenaire","de":"dein Partner","ru":"твой партнёр","zh-cn":"你的伙伴","ja":"あなたのパートナー","ar":"شريكك"},
  "your partner has been notified.":{"es":"tu pareja ha sido notificada.","fr":"ton partenaire a été prévenu.","de":"dein Partner wurde benachrichtigt.","ru":"твой партнёр получил уведомление.","zh-cn":"你的伙伴已收到通知。","ja":"あなたのパートナーに通知しました。","ar":"تم إشعار شريكك."},
  "your phone":{"es":"tu teléfono","fr":"ton téléphone","de":"dein Telefon","ru":"твой телефон","zh-cn":"你的手机","ja":"あなたのスマホ","ar":"هاتفك"},
  "Premium":{  'es':"Premium",  'fr':"Premium",  'de':"Premium",  'ru':"Premium",  'zh-cn':"Premium",  'ja':"Premium",  'ar':"Premium"},
  "Loading...":{  'es':"Cargando...",  'fr':"Chargement...",  'de':"Wird geladen...",  'ru':"Загрузка...",  'zh-cn':"加载中...",  'ja':"読み込み中...",  'ar':"جارٍ التحميل..."},
  "Annual":{  'es':"Anual",  'fr':"Annuel",  'de':"Jährlich",  'ru':"Годовой",  'zh-cn':"年度",  'ja':"年額",  'ar':"سنوي"},
  "BEST VALUE":{  'es':"MEJOR VALOR",  'fr':"MEILLEUR PRIX",  'de':"BESTES PREIS-LEISTUNGS-VERHÄLTNIS",  'ru':"ЛУЧШЕЕ ПРЕДЛОЖЕНИЕ",  'zh-cn':"最超值",  'ja':"最もお得",  'ar':"الأفضل قيمة"},
  "Billed once a year":{  'es':"Facturado una vez al año",  'fr':"Facturé une fois par an",  'de':"Einmal jährlich abgerechnet",  'ru':"Оплата один раз в год",  'zh-cn':"每年扣款一次",  'ja':"年1回のお支払い",  'ar':"الفوترة مرة واحدة سنويًا"},
  "Billed monthly. Cancel anytime":{  'es':"Facturado mensualmente. Cancela cuando quieras",  'fr':"Facturé chaque mois. Annulez à tout moment",  'de':"Monatlich abgerechnet. Jederzeit kündbar",  'ru':"Оплата ежемесячно. Отмена в любой момент",  'zh-cn':"按月扣款，随时可取消",  'ja':"毎月のお支払い。いつでも解約可能",  'ar':"الفوترة شهريًا. ألغِ في أي وقت"},
  "Intro offer":{  'es':"Oferta de bienvenida",  'fr':"Offre de bienvenue",  'de':"Einführungsangebot",  'ru':"Приветственная скидка",  'zh-cn':"首购优惠",  'ja':"初回特典",  'ar':"عرض تقديمي"},
  "Daily guided journal prompts, personalised to your journey":{  'es':"Preguntas guiadas para tu diario cada día, adaptadas a tu camino",  'fr':"Des invites guidées quotidiennes pour votre journal, personnalisées selon votre parcours",  'de':"Tägliche geführte Tagebuchimpulse, abgestimmt auf deinen Weg",  'ru':"Ежедневные вопросы для дневника, подобранные под ваш путь",  'zh-cn':"每日引导式日记提示，专为你的康复历程量身定制",  'ja':"毎日のガイド式ジャーナルプロンプトをあなたの旅に合わせてパーソナライズ",  'ar':"موجّهات يومية للكتابة في اليوميات، مخصّصة لرحلتك"},
  "Deep mood & pattern analysis after each entry":{  'es':"Análisis profundo del estado de ánimo y los patrones tras cada entrada",  'fr':"Analyse approfondie de l'humeur et des tendances après chaque entrée",  'de':"Tiefe Analyse von Stimmung und Mustern nach jedem Eintrag",  'ru':"Глубокий анализ настроения и закономерностей после каждой записи",  'zh-cn':"每次记录后进行深入的情绪与模式分析",  'ja':"記録ごとに深い気分・パターン分析",  'ar':"تحليل عميق للمزاج والأنماط بعد كل تدوينة"},
  "New reflection styles added regularly":{  'es':"Nuevos estilos de reflexión añadidos con regularidad",  'fr':"De nouveaux styles de réflexion ajoutés régulièrement",  'de':"Regelmäßig neue Reflexionsstile",  'ru':"Новые стили рефлексии добавляются регулярно",  'zh-cn':"定期上线全新的反思风格",  'ja':"新しいリフレクションスタイルを定期的に追加",  'ar':"أنماط تأمل جديدة تُضاف بانتظام"},
  "Support an independent recovery app":{  'es':"Apoya una app de recuperación independiente",  'fr':"Soutenez une application de rétablissement indépendante",  'de':"Unterstütze eine unabhängige Recovery-App",  'ru':"Поддержите независимое приложение для восстановления",  'zh-cn':"支持一款独立的康复应用",  'ja':"独立した回復アプリを支援",  'ar':"ادعم تطبيق تعافٍ مستقل"},
  "Restore Purchases":{  'es':"Restaurar compras",  'fr':"Restaurer les achats",  'de':"Käufe wiederherstellen",  'ru':"Восстановить покупки",  'zh-cn':"恢复购买",  'ja':"購入を復元",  'ar':"استعادة المشتريات"},
  "Terms of Use":{  'es':"Condiciones de uso",  'fr':"Conditions d'utilisation",  'de':"Nutzungsbedingungen",  'ru':"Условия использования",  'zh-cn':"使用条款",  'ja':"利用規約",  'ar':"شروط الاستخدام"},
  "License":{  'es':"Licencia",  'fr':"Licence",  'de':"Lizenz",  'ru':"Лицензия",  'zh-cn':"许可协议",  'ja':"ライセンス",  'ar':"الترخيص"},
  "Start Free Trial  Subscribe":{  'es':"Iniciar prueba gratuita  Suscribirse",  'fr':"Essai gratuit  S'abonner",  'de':"Kostenlos testen  Abonnieren",  'ru':"Начать пробный период  Подписаться",  'zh-cn':"开始免费试用  订阅",  'ja':"無料トライアルを開始  登録",  'ar':"ابدأ التجربة المجانية  اشترك"},
  "You are Premium":{  'es':"Eres Premium",  'fr':"Vous êtes Premium",  'de':"Du bist Premium",  'ru':"Вы Premium",  'zh-cn':"你已是 Premium 会员",  'ja':"あなたは Premium 会員です",  'ar':"أنت مشترك Premium"},
  "Thank you for supporting Re.Claim. Every guided reflection is unlocked.":{  'es':"Gracias por apoyar a Re.Claim. Todas las reflexiones guiadas están desbloqueadas.",  'fr':"Merci de soutenir Re.Claim. Toutes les réflexions guidées sont débloquées.",  'de':"Danke, dass du Re.Claim unterstützt. Alle geführten Reflexionen sind freigeschaltet.",  'ru':"Спасибо за поддержку Re.Claim. Все направляемые размышления открыты.",  'zh-cn':"感谢你支持 Re.Claim。全部引导式反思已为你解锁。",  'ja':"Re.Claim のご支援ありがとうございます。すべてのガイド式リフレクションが解除されました。",  'ar':"شكرًا لدعمك لـ Re.Claim. جميع التأملات الموجّهة مفتوحة الآن لك."},
  "Welcome to Premium!":{  'es':"¡Bienvenido a Premium!",  'fr':"Bienvenue dans Premium !",  'de':"Willkommen bei Premium!",  'ru':"Добро пожаловать в Premium!",  'zh-cn':"欢迎加入 Premium！",  'ja':"Premium へようこそ！",  'ar':"مرحبًا بك في Premium!"},
  "Purchases restored. Welcome back!":{  'es':"Compras restauradas. ¡Bienvenido de nuevo!",  'fr':"Achats restaurés. Ravi de vous revoir !",  'de':"Käufe wiederhergestellt. Willkommen zurück!",  'ru':"Покупки восстановлены. С возвращением!",  'zh-cn':"购买记录已恢复，欢迎回来！",  'ja':"購入情報を復元しました。おかえりなさい！",  'ar':"تمت استعادة المشتريات. أهلًا بعودتك!"},
  "No previous purchases found on this account.":{  'es':"No se encontraron compras anteriores en esta cuenta.",  'fr':"Aucun achat antérieur n'a été trouvé sur ce compte.",  'de':"Auf diesem Konto wurden keine früheren Käufe gefunden.",  'ru':"В этом аккаунте предыдущих покупок не найдено.",  'zh-cn':"此账户没有找到过往购买记录。",  'ja':"このアカウントに以前の購入は見つかりませんでした。",  'ar':"لم يتم العثور على مشتريات سابقة على هذا الحساب."},
  "Purchase was not completed.":{  'es':"No se completó la compra.",  'fr':"L'achat n'a pas été finalisé.",  'de':"Der Kauf wurde nicht abgeschlossen.",  'ru':"Покупка не была завершена.",  'zh-cn':"购买未完成。",  'ja':"購入が完了しませんでした。",  'ar':"لم تكتمل عملية الشراء."},
  "Purchase failed. Please try again.":{  'es':"Error en la compra. Inténtalo de nuevo.",  'fr':"Échec de l'achat. Veuillez réessayer.",  'de':"Kauf fehlgeschlagen. Bitte versuche es erneut.",  'ru':"Покупка не удалась. Пожалуйста, попробуйте снова.",  'zh-cn':"购买失败，请重试。",  'ja':"購入に失敗しました。もう一度お試しください。",  'ar':"فشل الشراء. يرجى المحاولة مرة أخرى."},
  "Purchases are not configured yet on this build.":{  'es':"Las compras aún no están configuradas en esta versión.",  'fr':"Les achats ne sont pas encore configurés dans cette version.",  'de':"Käufe sind in diesem Build noch nicht eingerichtet.",  'ru':"Покупки в этой сборке пока не настроены.",  'zh-cn':"此版本尚未配置购买功能。",  'ja':"このビルドでは購入機能がまだ設定されていません。",  'ar':"لم يتم إعداد المشتريات بعد في هذه النسخة."},
  "No products available yet.":{  'es':"Todavía no hay productos disponibles.",  'fr':"Aucun produit n'est disponible pour le moment.",  'de':"Noch keine Produkte verfügbar.",  'ru':"Пока нет доступных продуктов.",  'zh-cn':"暂无可用商品。",  'ja':"利用できる商品はまだありません。",  'ar':"لا توجد منتجات متاحة بعد."},
  "Restore failed. Please try again.":{  'es':"Error en la restauración. Inténtalo de nuevo.",  'fr':"Échec de la restauration. Veuillez réessayer.",  'de':"Wiederherstellung fehlgeschlagen. Bitte versuche es erneut.",  'ru':"Не удалось восстановить. Пожалуйста, попробуйте снова.",  'zh-cn':"恢复失败，请重试。",  'ja':"復元に失敗しました。もう一度お試しください。",  'ar':"فشلت الاستعادة. يرجى المحاولة مرة أخرى."},
  "Payment will be charged to your Apple App Store / Google Play account. Subscription auto-renews unless cancelled at least 24 hours before the end of the current period.":{  'es':"El pago se realizará a tu cuenta de Apple App Store o Google Play. La suscripción se renueva automáticamente a menos que se cancele al menos 24 horas antes de que termine el periodo actual.",  'fr':"Le paiement sera prélevé sur votre compte Apple App Store / Google Play. L'abonnement se renouvelle automatiquement, sauf s'il est annulé au moins 24 heures avant la fin de la période en cours.",  'de':"Die Zahlung wird deinem Apple App Store- bzw. Google Play-Konto belastet. Das Abonnement verlängert sich automatisch, sofern es nicht mindestens 24 Stunden vor Ende des aktuellen Zeitraums gekündigt wird.",  'ru':"Оплата списывается с вашего аккаунта Apple App Store / Google Play. Подписка продлевается автоматически, если не отменить её как минимум за 24 часа до окончания текущего периода.",  'zh-cn':"费用将从你的 Apple App Store / Google Play 账户中扣除。除非在当前周期结束前至少 24 小时取消，否则订阅将自动续订。",  'ja':"料金は Apple App Store / Google Play のアカウントから請求されます。現在の期間終了の24時間前までに解約しない限り、購読は自動更新されます。",  'ar':"سيتم الخصم من حسابك في Apple App Store / Google Play. تتجدد الاشتراك تلقائيًا ما لم تُلغِه قبل 24 ساعة على الأقل من نهاية الفترة الحالية."},
  "Guided reflections are Premium":{  'es':"Las reflexiones guiadas son Premium",  'fr':"Les réflexions guidées sont Premium",  'de':"Geführte Reflexionen sind Premium",  'ru':"Направляемые размышления — Premium",  'zh-cn':"引导式反思属于 Premium 功能",  'ja':"ガイド式リフレクションは Premium 限定です",  'ar':"التأملات الموجّهة من مزايا Premium"},
  "Get a daily prompt written for your journey and deep analysis of every entry.":{  'es':"Recibe cada día una pregunta escrita para tu camino y un análisis profundo de cada entrada.",  'fr':"Recevez chaque jour une invite écrite pour votre parcours et une analyse approfondie de chaque entrée.",  'de':"Erhalte jeden Tag eine für deinen Weg geschriebene Frage und eine tiefe Analyse jedes Eintrags.",  'ru':"Каждый день получайте вопрос, написанный для вашего пути, и глубокий анализ каждой записи.",  'zh-cn':"获得专为你历程撰写的每日提示，以及对每条记录的深入分析。",  'ja':"あなたの旅に合わせた毎日のプロンプトと、すべての記録の深い分析を入手できます。",  'ar':"احصل على موجّه يومي مصمم لرحلتك وتحليل عميق لكل تدوينة."},
  "Unlock":{  'es':"Desbloquear",  'fr':"Débloquer",  'de':"Freischalten",  'ru':"Открыть",  'zh-cn':"解锁",  'ja':"ロック解除",  'ar':"فتح"},
  "Re.Claim Premium":{  'es':"Re.Claim Premium",  'fr':"Re.Claim Premium",  'de':"Re.Claim Premium",  'ru':"Re.Claim Premium",  'zh-cn':"Re.Claim Premium",  'ja':"Re.Claim Premium",  'ar':"Re.Claim Premium"},
  "Premium Member":{  'es':"Miembro Premium",  'fr':"Membre Premium",  'de':"Premium-Mitglied",  'ru':"Премиум-участник",  'zh-cn':"Premium 会员",  'ja':"Premium 会員",  'ar':"عضو Premium"},
  "Thanks for supporting the app!":{  'es':"¡Gracias por apoyar la app!",  'fr':"Merci de soutenir l'application !",  'de':"Danke, dass du die App unterstützt!",  'ru':"Спасибо за поддержку приложения!",  'zh-cn':"感谢你支持这款应用！",  'ja':"アプリの支援ありがとうございます！",  'ar':"شكرًا لدعمك للتطبيق!"},
  "Manage":{  'es':"Gestionar",  'fr':"Gérer",  'de':"Verwalten",  'ru':"Управление",  'zh-cn':"管理",  'ja':"管理",  'ar':"إدارة"},
  "Guided reflections & daily prompts":{  'es':"Reflexiones guiadas y preguntas diarias",  'fr':"Réflexions guidées et invites quotidiennes",  'de':"Geführte Reflexionen & tägliche Impulse",  'ru':"Направляемые размышления и ежедневные вопросы",  'zh-cn':"引导式反思与每日提示",  'ja':"ガイド式リフレクション＆毎日のプロンプト",  'ar':"التأملات الموجّهة والموجّهات اليومية"},
  "Guided reflections that help you see the patterns others miss.":{  'es':"Reflexiones guiadas que te ayudan a ver los patrones que otros no ven.",  'fr':"Des réflexions guidées qui vous aident à voir ce que les autres ne voient pas.",  'de':"Geführte Reflexionen, mit denen du Muster siehst, die andere übersehen.",  'ru':"Направляемые размышления, которые помогают увидеть закономерности, которых замечают не все.",  'zh-cn':"引导式反思，帮你看见别人错过的模式。",  'ja':"見過ごされがちなパターンに気づくためのガイド式リフレクション。",  'ar':"تأملات موجّهة تساعدك على رؤية الأنماط التي يغفل عنها غيرك."},
  "Continue with Google":{  'es':"Continuar con Google",  'fr':"Continuer avec Google",  'de':"Mit Google fortfahren",  'ru':"Продолжить через Google",  'zh-cn':"继续使用 Google",  'ja':"Google で続行",  'ar':"المتابعة باستخدام Google"},
  "or":{  'es':"o",  'fr':"ou",  'de':"oder",  'ru':"или",  'zh-cn':"或",  'ja':"または",  'ar':"أو"},
  "Link your accounts":{  'es':"Vincula tus cuentas",  'fr':"Associez vos comptes",  'de':"Konten verknüpfen",  'ru':"Свяжите свои аккаунты",  'zh-cn':"关联您的账号",  'ja':"アカウントを連携",  'ar':"ربط حساباتك"},
  "Link":{  'es':"Vincular",  'fr':"Associer",  'de':"Verknüpfen",  'ru':"Связать",  'zh-cn':"关联",  'ja':"連携",  'ar':"ربط"},
  "Linking...":{  'es':"Vinculando...",  'fr':"Association...",  'de':"Verknüpfen...",  'ru':"Связывание...",  'zh-cn':"正在关联...",  'ja':"連携中...",  'ar':"جارٍ الربط..."},
  "An account already exists for":{  'es':"Ya existe una cuenta para",  'fr':"Un compte existe déjà pour",  'de':"Ein Konto existiert bereits für",  'ru':"Аккаунт уже существует для",  'zh-cn':"已存在对应邮箱的账号",  'ja':"次のメールアドレスのアカウントが既に存在します",  'ar':"يوجد حساب بالفعل لهذا البريد الإلكتروني"},
  "Sign in with its password to link Google Sign-In, or use another email.":{  'es':"Inicia sesión con su contraseña para vincular Google Sign-In, o usa otro correo electrónico.",  'fr':"Connectez-vous avec son mot de passe pour associer Google Sign-In, ou utilisez une autre adresse e-mail.",  'de':"Melde dich mit dem Passwort an, um Google Sign-In zu verknüpfen, oder verwende eine andere E-Mail-Adresse.",  'ru':"Войдите с его паролем, чтобы связать Google Sign-In, или используйте другой адрес электронной почты.",  'zh-cn':"请使用其密码登录以关联 Google 账号，或使用其他邮箱。",  'ja':"そのパスワードでサインインして Google アカウントを連携するか、別のメールアドレスを使用してください。",  'ar':"سجّل الدخول بكلمة المرور الخاصة به لربط تسجيل الدخول عبر Google، أو استخدم بريدًا إلكترونيًا آخر."},
  "Enter your email and password.":{  'es':"Introduce tu correo electrónico y contraseña.",  'fr':"Saisissez votre adresse e-mail et votre mot de passe.",  'de':"Gib deine E-Mail-Adresse und dein Passwort ein.",  'ru':"Введите адрес электронной почты и пароль.",  'zh-cn':"请输入您的邮箱和密码。",  'ja':"メールアドレスとパスワードを入力してください。",  'ar':"أدخل بريدك الإلكتروني وكلمة المرور."},
  "Incorrect password for this account.":{  'es':"La contraseña de esta cuenta es incorrecta.",  'fr':"Mot de passe incorrect pour ce compte.",  'de':"Falsches Passwort für dieses Konto.",  'ru':"Неверный пароль для этого аккаунта.",  'zh-cn':"此账号的密码不正确。",  'ja':"このアカウントのパスワードが正しくありません。",  'ar':"كلمة المرور لهذا الحساب غير صحيحة."},
  "No account found with this email.":{  'es':"No se ha encontrado ninguna cuenta con este correo electrónico.",  'fr':"Aucun compte trouvé avec cette adresse e-mail.",  'de':"Kein Konto mit dieser E-Mail-Adresse gefunden.",  'ru':"Аккаунт с таким адресом электронной почты не найден.",  'zh-cn':"未找到与此邮箱关联的账号。",  'ja':"このメールアドレスのアカウントが見つかりません。",  'ar':"لم يتم العثور على حساب بهذا البريد الإلكتروني."},
  "Accounts linked. You can now sign in with Google.":{  'es':"Cuentas vinculadas. Ahora puedes iniciar sesión con Google.",  'fr':"Comptes associés. Vous pouvez maintenant vous connecter avec Google.",  'de':"Konten verknüpft. Du kannst dich jetzt mit Google anmelden.",  'ru':"Аккаунты связаны. Теперь вы можете войти через Google.",  'zh-cn':"账号已关联。您现在可以使用 Google 登录。",  'ja':"アカウントを連携しました。これより Google でサインインできます。",  'ar':"تم ربط الحسابات. يمكنك الآن تسجيل الدخول باستخدام Google."},
  "Could not link accounts.":{  'es':"No se han podido vincular las cuentas.",  'fr':"Impossible d'associer les comptes.",  'de':"Konten konnten nicht verknüpft werden.",  'ru':"Не удалось связать аккаунты.",  'zh-cn':"无法关联账号。",  'ja':"アカウントを連携できませんでした。",  'ar':"تعذر ربط الحسابات."},
  "An account already exists for this email. Linking your account...":{  'es':"Ya existe una cuenta para este correo electrónico. Vinculando tu cuenta...",  'fr':"Un compte existe déjà pour cette adresse e-mail. Association de votre compte...",  'de':"Für diese E-Mail-Adresse existiert bereits ein Konto. Konto wird verknüpft...",  'ru':"Аккаунт с таким адресом электронной почты уже существует. Связывание аккаунта...",  'zh-cn':"此邮箱已存在一个账号。正在关联您的账号...",  'ja':"このメールアドレスのアカウントが既に存在します。アカウントを連携しています...",  'ar':"يوجد حساب بالفعل بهذا البريد الإلكتروني. جارٍ ربط حسابك..."},
  "Sign-in cancelled.":{  'es':"Inicio de sesión cancelado.",  'fr':"Connexion annulée.",  'de':"Anmeldung abgebrochen.",  'ru':"Вход отменён.",  'zh-cn':"已取消登录。",  'ja':"サインインがキャンセルされました。",  'ar':"تم إلغاء تسجيل الدخول."},
  "Google Sign-In is not configured on this device yet.":{  'es':"Google Sign-In aún no está configurado en este dispositivo.",  'fr':"Google Sign-In n'est pas encore configuré sur cet appareil.",  'de':"Google Sign-In ist auf diesem Gerät noch nicht eingerichtet.",  'ru':"Вход через Google ещё не настроен на этом устройстве.",  'zh-cn':"此设备尚未配置 Google 登录。",  'ja':"このデバイスではまだ Google サインインが設定されていません。",  'ar':"لم يتم إعداد تسجيل الدخول عبر Google على هذا الجهاز بعد."},
  "Google Sign-In is not enabled for this app yet.":{  'es':"Google Sign-In aún no está habilitado para esta aplicación.",  'fr':"Google Sign-In n'est pas encore activé pour cette application.",  'de':"Google Sign-In ist für diese App noch nicht aktiviert.",  'ru':"Вход через Google ещё не включён для этого приложения.",  'zh-cn':"此应用尚未启用 Google 登录。",  'ja':"このアプリではまだ Google サインインが有効になっていません。",  'ar':"لم يتم تفعيل تسجيل الدخول عبر Google لهذا التطبيق بعد."},
  "your@email.com":{"es":"your@email.com","fr":"your@email.com","de":"your@email.com","ru":"your@email.com","zh-cn":"your@email.com","ja":"your@email.com","ar":"your@email.com"},
};
var LANG_CODE = {'English':'en','Español':'es','Français':'fr','Deutsch':'de','Русский':'ru','中文':'zh-cn','日本語':'ja','العربية':'ar'};
function t(key) {
  var lang = (D && D.language) || 'English';
  var code = LANG_CODE[lang];
  if (!code) return key;
  var m = TRANS[key];
  return (m && m[code]) || key;
}

function changeLanguage(lang) {
  if (!lang || lang === (D.language || 'English')) return;
  D.language = lang;
  saveDataSilent();
  if (document.documentElement) document.documentElement.lang = LANG_CODE[lang] || 'en';
  // Rebuild every cached page so the whole app renders in the new language.
  for (var k in _pageCache) { if (Object.prototype.hasOwnProperty.call(_pageCache, k)) delete _pageCache[k]; }
  applyTheme();
  render();
}

function dataKey() { return 'rc_data_' + (AUTH_USER || 'local').replace(/[^a-zA-Z0-9_-]/g,''); }

function loadData() {
  try {
    var d = JSON.parse(localStorage.getItem(dataKey()));
    if (d) return validateData(d);
  } catch(e) { console.warn('loadData: corrupt localStorage entry, starting fresh', e); }
  return defaultData();
}

var _pageCache = {};
function saveData() {
  try { localStorage.setItem(dataKey(), JSON.stringify(D)); } catch(e) { console.warn('saveData: localStorage write failed', e); showToast('Could not save to local storage. Check available space.','error'); }
  syncToFirestore();
  applyTheme();
  delete _pageCache[pg];
  render();
}
function saveDataSilent() {
  try { localStorage.setItem(dataKey(), JSON.stringify(D)); } catch(e) { console.warn('saveDataSilent: localStorage write failed', e); showToast('Could not save to local storage. Check available space.','error'); }
  syncToFirestore();
  applyTheme();
}
var _audioCtx = null;
function _initAudio() { if (_audioCtx) return; try { var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; _audioCtx = new AC(); if (_audioCtx.state === 'suspended') _audioCtx.resume(); } catch(e) {} }
function playSound(type) {
  try { _initAudio(); if (!_audioCtx) return; var now = _audioCtx.currentTime; var ctx = _audioCtx;
    switch(type) {
      case 'coin': {
        // Metallic clink: high sine ping + noise burst + harmonic body
        var o1=ctx.createOscillator();var g1=ctx.createGain();o1.connect(g1);g1.connect(ctx.destination);
        o1.type='sine';o1.frequency.setValueAtTime(2800,now);o1.frequency.exponentialRampToValueAtTime(800,now+0.12);
        g1.gain.setValueAtTime(0.1,now);g1.gain.exponentialRampToValueAtTime(0.001,now+0.15);o1.start(now);o1.stop(now+0.15);
        var o2=ctx.createOscillator();var g2=ctx.createGain();o2.connect(g2);g2.connect(ctx.destination);
        o2.type='sine';o2.frequency.setValueAtTime(1600,now);o2.frequency.exponentialRampToValueAtTime(600,now+0.1);
        g2.gain.setValueAtTime(0.06,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.1);o2.start(now);o2.stop(now+0.1);
        // Noise burst for metallic rattle
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.04,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,3);
        var ns=ctx.createBufferSource();var ng=ctx.createGain();ns.buffer=buf;ns.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.08,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.04);ns.start(now);
        var f=ctx.createBiquadFilter();f.type='highpass';f.frequency.value=3000;ns.disconnect(ng);ns.connect(f);f.connect(ng);
        break;
      }
      case 'quest': {
        // Bright fanfare: ascending triad with harmonics
        var notes=[523,659,784,1047];notes.forEach(function(f,i){
          var o=ctx.createOscillator();var g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
          o.type='triangle';o.frequency.setValueAtTime(f,now+i*0.11);
          g.gain.setValueAtTime(0,now+i*0.11);g.gain.linearRampToValueAtTime(0.14,now+i*0.11+0.03);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.11+0.3);
          o.start(now+i*0.11);o.stop(now+i*0.11+0.3);
        });
        // Sparkle overlay
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.5,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,2);
        var ns=ctx.createBufferSource();var ng=ctx.createGain();ns.buffer=buf;ns.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.03,now+0.35);ng.gain.exponentialRampToValueAtTime(0.001,now+0.6);ns.start(now+0.35);
        break;
      }
      case 'trumpet': {
        // Brassier trumpet: square + sawtooth at harmonic intervals with envelope
        var f0=392;var harmonics=[1,2,3,4,5];harmonics.forEach(function(h,i){
          var o=ctx.createOscillator();var g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
          o.type=i===0?'sawtooth':'square';o.frequency.setValueAtTime(f0*h,now);
          var vol=0.06/Math.sqrt(h);
          g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(vol,now+0.04);g.gain.setValueAtTime(vol,now+0.15);
          g.gain.linearRampToValueAtTime(vol*0.8,now+0.28);g.gain.linearRampToValueAtTime(vol*0.6,now+0.42);
          g.gain.exponentialRampToValueAtTime(0.001,now+0.7);o.start(now);o.stop(now+0.7);
        });
        // Blow noise
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.05,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,5);
        var ns=ctx.createBufferSource();var f=ctx.createBiquadFilter();var ng=ctx.createGain();
        f.type='bandpass';f.frequency.value=800;f.Q.value=0.5;
        ns.buffer=buf;ns.connect(f);f.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.02,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.06);ns.start(now);
        break;
      }
      case 'sword': {
        // Metallic clang: high partials + noise + low thud
        var strikeFreqs=[3000,4200,1800];strikeFreqs.forEach(function(f,i){
          var o=ctx.createOscillator();var g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
          o.type='sine';o.frequency.setValueAtTime(f,now);
          g.gain.setValueAtTime(0.08-i*0.02,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.08+i*0.04);
          o.start(now);o.stop(now+0.16);
        });
        // Noise burst (metal scrape)
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.12,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,8);
        var ns=ctx.createBufferSource();var f=ctx.createBiquadFilter();var ng=ctx.createGain();
        f.type='highpass';f.frequency.value=2000;
        ns.buffer=buf;ns.connect(f);f.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.12,now);ng.gain.exponentialRampToValueAtTime(0.001,now+0.12);ns.start(now);
        // Low impact thud
        var o2=ctx.createOscillator();var g2=ctx.createGain();
        o2.type='sine';o2.frequency.setValueAtTime(80,now);o2.frequency.exponentialRampToValueAtTime(30,now+0.15);
        g2.gain.setValueAtTime(0.2,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.2);
        o2.connect(g2);g2.connect(ctx.destination);o2.start(now);o2.stop(now+0.2);
        break;
      }
      case 'drum': {
        // Low thud with slight resonance
        var o=ctx.createOscillator();var g=ctx.createGain();
        o.type='sine';o.frequency.setValueAtTime(80,now);o.frequency.exponentialRampToValueAtTime(30,now+0.2);
        g.gain.setValueAtTime(0.25,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.3);
        o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.3);
        // Body resonance
        var o2=ctx.createOscillator();var g2=ctx.createGain();
        o2.type='triangle';o2.frequency.setValueAtTime(120,now);o2.frequency.exponentialRampToValueAtTime(50,now+0.15);
        g2.gain.setValueAtTime(0.12,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.2);
        o2.connect(g2);g2.connect(ctx.destination);o2.start(now);o2.stop(now+0.2);
        break;
      }
      case 'magic': {
        // Sparkly ascending arpeggio + shimmer
        var notes=[800,1000,1200,1500,1800];notes.forEach(function(f,i){
          var o=ctx.createOscillator();var g=ctx.createGain();
          o.type='sine';o.frequency.setValueAtTime(f,now+i*0.06);
          g.gain.setValueAtTime(0,now+i*0.06);g.gain.linearRampToValueAtTime(0.07,now+i*0.06+0.02);g.gain.exponentialRampToValueAtTime(0.001,now+i*0.06+0.18);
          o.connect(g);g.connect(ctx.destination);o.start(now+i*0.06);o.stop(now+i*0.06+0.18);
        });
        // Shimmer noise
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.4,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/d.length,6);
        var ns=ctx.createBufferSource();var f=ctx.createBiquadFilter();var ng=ctx.createGain();
        f.type='bandpass';f.frequency.value=2000;f.Q.value=2;
        ns.buffer=buf;ns.connect(f);f.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.04,now+0.2);ng.gain.exponentialRampToValueAtTime(0.001,now+0.5);ns.start(now+0.2);
        break;
      }
      case 'whoosh': {
        // Swoosh: filtered noise sweep
        var buf=ctx.createBuffer(1,ctx.sampleRate*0.3,ctx.sampleRate);var d=buf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
        var ns=ctx.createBufferSource();var f=ctx.createBiquadFilter();var ng=ctx.createGain();
        f.type='lowpass';f.frequency.setValueAtTime(100,now);f.frequency.exponentialRampToValueAtTime(3000,now+0.25);
        ns.buffer=buf;ns.connect(f);f.connect(ng);ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0,now);ng.gain.linearRampToValueAtTime(0.1,now+0.06);ng.gain.exponentialRampToValueAtTime(0.001,now+0.3);
        ns.start(now);ns.stop(now+0.3);
        break;
      }
      case 'horn': {
        // Single dramatic horn note (for cutscene reveals)
        var f0=220;harmonics=[1,2,3];harmonics.forEach(function(h,i){
          var o=ctx.createOscillator();var g=ctx.createGain();
          o.type='sawtooth';o.frequency.setValueAtTime(f0*h,now);
          g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(0.08/h,now+0.1);g.gain.setValueAtTime(0.08/h,now+0.3);
          g.gain.exponentialRampToValueAtTime(0.001,now+0.8);
          o.connect(g);g.connect(ctx.destination);o.start(now);o.stop(now+0.8);
        });
        break;
      }
    }
  } catch(e) {}
}
function safe(str) { return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function validateData(d) {
  if (!d || typeof d !== 'object') return defaultData();
  var def = defaultData();
  for (var k in def) {
    if (!(k in d)) d[k] = JSON.parse(JSON.stringify(def[k]));
    else if (Array.isArray(def[k]) && !Array.isArray(d[k])) d[k] = [];
    else if (typeof def[k] === 'object' && def[k] !== null && !Array.isArray(def[k]) && (typeof d[k] !== 'object' || d[k] === null || Array.isArray(d[k]))) d[k] = JSON.parse(JSON.stringify(def[k]));
  }
  if (!d.version || d.version < 1) d.version = 1;
  // Schema migrations — bump version in defaultData() when schema changes
  if (d.version < 2) {
    if (!d.journalWordGoal) d.journalWordGoal = 50;
    if (!d.accentColor) d.accentColor = 'green';
    if (!d.achievements) d.achievements = [];
    d.version = 2;
  }
  if (d.version < 3) {
    if (!d.timeCapsules) d.timeCapsules = [];
    if (!d.relapseRescue) d.relapseRescue = { logs: [] };
    if (!d.emergencyContacts) d.emergencyContacts = [];
    if (!d.royalPardons) d.royalPardons = [];
    d.version = 3;
  }
  if (d.version < 4) {
    if (!d.researchOptIn) d.researchOptIn = false;
    if (!d.researchLastSubmitted) d.researchLastSubmitted = null;
    d.version = 4;
  }
  return d;
}

// ====== DATA PROTECTION / PASSCODE LOCK ======
var LOCK_ENABLED = false;
var LOCK_TIMEOUT = null;

function isLockSet() { return !!localStorage.getItem('rc_lock_hash'); }

async function hashPin(pin, salt) {
  var enc = new TextEncoder();
  var hash = await crypto.subtle.digest('SHA-256', enc.encode('rc:' + pin + ':' + salt.join(',')));
  return Array.from(new Uint8Array(hash)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
}

async function enableLock(pin) {
  var salt = Array.from(crypto.getRandomValues(new Uint8Array(16)));
  var h = await hashPin(pin, salt);
  localStorage.setItem('rc_lock_hash', h);
  localStorage.setItem('rc_lock_salt', JSON.stringify(salt));
  LOCK_ENABLED = true;
  D.passcodeEnabled = true;
  saveData();
}

function disableLock() {
  localStorage.removeItem('rc_lock_hash');
  localStorage.removeItem('rc_lock_salt');
  localStorage.removeItem('rc_bio_cred');
  LOCK_ENABLED = false;
  D.passcodeEnabled = false;
  saveData();
}

async function checkPin(pin) {
  var storedHash = localStorage.getItem('rc_lock_hash');
  var storedSalt = JSON.parse(localStorage.getItem('rc_lock_salt') || 'null');
  if (!storedHash || !storedSalt) return false;
  var h = await hashPin(pin, storedSalt);
  return h === storedHash;
}

function showLockScreen() {
  var app = document.getElementById('app');
  var bioAvailable = window.PublicKeyCredential && localStorage.getItem('rc_bio_cred');
  app.innerHTML =
    '<div class="si-bg">' +
    '<div class="si-card">' +
    '<div class="si-sub" style="margin-top:8px">'+t('Speak the passphrase to unseal')+'</div>' +
    '<input class="si-input" type="password" id="lock-pin-input" placeholder="'+t('Passphrase')+'" inputmode="numeric" maxlength="6" style="text-align:center;font-size:24px;letter-spacing:8px;font-weight:700" onkeydown="if(event.key===\'Enter\')unlockApp()">' +
    '<button class="si-btn" onclick="unlockApp()">'+t('Unseal')+'</button>' +
    '<div id="lock-error" style="font-size:12px;color:var(--danger);margin-top:4px"></div>' +
    (bioAvailable ? '<button class="btn btn-outline btn-sm" onclick="unlockWithBiometric()" style="margin-top:8px;width:auto;display:inline-flex">&#128065; Face ID</button>' : '<button class="btn btn-outline btn-sm" onclick="setupBiometric()" id="bio-setup-btn" style="margin-top:8px;width:auto;display:inline-flex">&#128065; Set Up Face ID</button>') +
    '<button class="btn btn-danger btn-sm" onclick="showLockScreenSOS()" style="margin-top:8px;width:auto;display:inline-flex">&#128222; SOS</button>' +
    '<button class="btn btn-outline btn-sm" onclick="if(confirm(\''+t('This will erase all local data and let you sign in again.')+'\')){localStorage.removeItem(\'rc_lock_hash\');localStorage.removeItem(\'rc_lock_salt\');localStorage.removeItem(\'rc_user\');localStorage.removeItem(\'rc_email\');sessionStorage.clear();location.reload()}" style="margin-top:12px;width:auto;display:inline-flex">Reset &amp; Sign Out</button>' +
    '</div></div>';
  document.getElementById('tabs').style.display = 'none';
  var tb = document.querySelector('.top-bar');
  if (tb) tb.style.display = 'none';
  setTimeout(function(){var el=document.getElementById('lock-pin-input');if(el)el.focus()}, 100);
  LOCK_ENABLED = true;
}

function showLockScreenSOS() {
  var overlay = document.createElement('div');
  overlay.className = 'overlay';
  overlay.innerHTML = '<div class="overlay-content" style="text-align:center"><div style="font-size:48px;font-weight:900;color:var(--danger);margin-bottom:4px;letter-spacing:6px">SOS</div><h3 style="color:var(--danger);font-size:18px">'+t('You are not alone.')+'</h3><p style="font-size:13px;color:var(--text);margin:8px 0;line-height:1.5">'+t('Help is available 24/7. Reach out right now.')+'</p><div style="text-align:left;margin:10px 0"><div style="background:var(--danger-bg);padding:10px;border-radius:10px;margin-bottom:8px"><div style="font-weight:600;font-size:13px">988 Suicide & Crisis Lifeline</div><a href="tel:988" style="font-size:18px;font-weight:700;color:var(--primary);text-decoration:none">988</a></div><div style="background:var(--danger-bg);padding:10px;border-radius:10px"><div style="font-weight:600;font-size:13px">Crisis Text Line</div><div style="font-size:11px;color:var(--muted)">'+t('Text HOME to')+'</div><a href="tel:741741" style="font-size:18px;font-weight:700;color:var(--primary);text-decoration:none">741741</a></div></div><button class="btn btn-outline btn-sm" onclick="this.closest(\'.overlay\').remove()" style="width:100%">'+t('Close')+'</button></div>';
  document.body.appendChild(overlay);
}

async function unlockApp() {
  var pin = document.getElementById('lock-pin-input');
  if (!pin || !pin.value.trim()) return;
  // brute-force throttle: back off after repeated wrong passcodes
  var fails = parseInt(localStorage.getItem('rc_lock_fails') || '0', 10);
  var firstFail = parseInt(localStorage.getItem('rc_lock_firstfail') || '0', 10);
  var now = Date.now();
  if (fails >= 4 && now - firstFail < 10 * 60 * 1000) {
    var waited = Math.floor((now - firstFail) / 1000);
    var need = Math.min(30 * Math.pow(2, fails - 4), 1800) - waited; // 30s, 1m, 2m, 4m... cap 30m
    if (need > 0) {
      var el = document.getElementById('lock-error');
      if (el) el.textContent = t('Too many attempts. Try again in ') + Math.ceil(need / 60) + t(' min.');
      pin.value = '';
      return;
    }
    localStorage.removeItem('rc_lock_fails');
    localStorage.removeItem('rc_lock_firstfail');
  }
  var valid = await checkPin(pin.value.trim());
  if (!valid) {
    var newFails = (fails >= 4 && now - firstFail >= 10 * 60 * 1000) ? 1 : fails + 1;
    if (firstFail === 0 || (now - firstFail) > 10 * 60 * 1000) firstFail = now;
    localStorage.setItem('rc_lock_fails', String(newFails));
    localStorage.setItem('rc_lock_firstfail', String(firstFail));
    var el2 = document.getElementById('lock-error');
    if (el2) {
      if (newFails >= 4) el2.textContent = t('Too many attempts. Lockout is getting longer.');
      else el2.textContent = t('Incorrect passcode. ') + (4 - newFails) + t(' attempts before lockout.');
    }
    pin.value = '';
    return;
  }
  localStorage.removeItem('rc_lock_fails');
  localStorage.removeItem('rc_lock_firstfail');
  LOCK_ENABLED = false;
  D = loadData();
  document.body.classList.add('logged-in');
  render();
  resetLockTimer();
}

function resetLockTimer() {
  if (LOCK_TIMEOUT) { clearTimeout(LOCK_TIMEOUT); LOCK_TIMEOUT = null; }
  if (isLockSet()) {
    LOCK_TIMEOUT = setTimeout(function(){
      if (!LOCK_ENABLED && AUTH_USER) { LOCK_ENABLED = true; showLockScreen(); }
    }, 300000); // 5 min
  }
}

function handleLockBlur() {
  if (isLockSet() && AUTH_USER && !LOCK_ENABLED) {
    LOCK_ENABLED = true;
    setTimeout(function(){ showLockScreen(); }, 100);
  }
}

async function setupBiometric() {
  if (!window.PublicKeyCredential) { alert(t('Face ID is not supported on this browser. Try Safari on iPhone.')); return; }
  try {
    var challenge = crypto.getRandomValues(new Uint8Array(32));
    var cred = await navigator.credentials.create({publicKey:{
      challenge: challenge,
      rp: {name:'Re.Claim', id:location.hostname},
      user: {id: crypto.getRandomValues(new Uint8Array(16)), name:'reclaim-user', displayName:'Re.Claim User'},
      pubKeyCredParams: [{type:'public-key', alg:-7}],
      authenticatorSelection: {authenticatorAttachment:'platform', userVerification:'required', residentKey:'required'},
      timeout: 30000
    }});
    localStorage.setItem('rc_bio_cred', btoa(String.fromCharCode.apply(null, new Uint8Array(cred.rawId))));
    var btn = document.getElementById('bio-setup-btn');
    if (btn) { btn.textContent = '&#128065; Face ID'; btn.onclick = function(){ unlockWithBiometric(); }; }
    alert(t('Face ID set up successfully!'));
  } catch(e) { alert(t('Face ID setup failed:') + ' ' + e.message); }
}

async function unlockWithBiometric() {
  if (!window.PublicKeyCredential) { alert(t('Face ID is not available on this browser.')); return; }
  try {
    var credIdRaw = localStorage.getItem('rc_bio_cred');
    if (!credIdRaw) { setupBiometric(); return; }
    var credId = Uint8Array.from(atob(credIdRaw), function(c){return c.charCodeAt(0)});
    var challenge = crypto.getRandomValues(new Uint8Array(32));
    var assertion = await navigator.credentials.get({publicKey:{
      challenge: challenge,
      allowCredentials: [{type:'public-key', id:credId, transports:['internal']}],
      userVerification: 'required',
      timeout: 30000
    }});
    if (assertion) {
      LOCK_ENABLED = false;
      D = loadData();
      document.body.classList.add('logged-in');
      render();
      resetLockTimer();
    }
  } catch(e) { document.getElementById('lock-error').textContent = 'Face ID failed. Try your passcode.'; }
}

var D = AUTH_USER ? loadData() : defaultData();
var pg = 'home';
var subPg = '';

// Re-auth on page focus
window.addEventListener('focus', function(){
  var u = localStorage.getItem('rc_user');
  if (u && !AUTH_USER) { AUTH_USER = u; AUTH_EMAIL = u; D = loadData(); document.body.classList.add('logged-in'); if (isLockSet()) { showLockScreen(); } else { resetLockTimer(); render(); } }
  if (!u && AUTH_USER) { AUTH_USER = ''; AUTH_EMAIL = ''; D = defaultData(); document.body.classList.remove('logged-in'); render(); }
  if (isLockSet() && AUTH_USER && LOCK_ENABLED) { showLockScreen(); } else if (isLockSet() && AUTH_USER) { resetLockTimer(); }
});

// Auto-lock on tab switch
window.addEventListener('blur', function(){
  if (isLockSet() && AUTH_USER && !LOCK_ENABLED) {
    setTimeout(function(){ if (document.hidden || !document.hasFocus()) handleLockBlur(); }, 500);
  }
});
document.addEventListener('visibilitychange', function(){
  if (document.hidden && isLockSet() && AUTH_USER && !LOCK_ENABLED) {
    setTimeout(function(){ if (document.hidden) handleLockBlur(); }, 300);
  }
});
// Reset timer on interaction
['click','keydown','touchstart','mousemove'].forEach(function(ev){
  document.addEventListener(ev, function(){ if (!LOCK_ENABLED) resetLockTimer(); }, {passive:true});
});

// ====== ADDICTION TYPES ======
var ADDICTION_TYPES = ['Alcohol','Drugs (prescription/illicit)','Pornography','Gambling','Smoking/Nicotine','Caffeine','Sex/Love','Shopping','Social Media','Gaming','Eating/Food','Self-Harm','Other'];


function toggleTargetAddiction(type) {
  if (!D.targetAddictions) D.targetAddictions = [];
  var idx = D.targetAddictions.indexOf(type);
  var wasEmpty = D.targetAddictions.length === 0;
  if (idx >= 0) D.targetAddictions.splice(idx, 1);
  else D.targetAddictions.push(type);
  saveData();
}

function normId(id) { return id.toLowerCase().trim(); }

async function localHash(pwd, email, salt) {
  if (!salt) { salt = Array.from(crypto.getRandomValues(new Uint8Array(16))); }
  var enc = new TextEncoder();
  var hash = await crypto.subtle.digest('SHA-256', enc.encode('rc:' + email.toLowerCase() + ':' + pwd + ':' + salt.join(',')));
  var h = Array.from(new Uint8Array(hash)).map(function(b){return b.toString(16).padStart(2,'0')}).join('');
  return { hash: h, salt: salt };
}

function handleAuth() {
  var email = document.getElementById('si-email');
  var password = document.getElementById('si-password');
  var error = document.getElementById('si-error');
  var btn = document.getElementById('si-auth-btn');
  var btnLabel = document.getElementById('si-btn-label');
  var isSignUp = SIGN_IN_MODE === 'up';
  var emailStr = email ? email.value.trim() : '';
  var pwdStr = password ? password.value.trim() : '';
  if (!emailStr || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) { if (error) error.textContent = t('Enter a valid email.'); if (email) { email.setAttribute('aria-invalid','true'); email.focus(); } return; }
  if (!pwdStr || pwdStr.length < 6) { if (error) error.textContent = t('Password must be at least 6 characters.'); if (password) { password.setAttribute('aria-invalid','true'); password.focus(); } return; }
  if (error) error.textContent = '';
  if (email) email.removeAttribute('aria-invalid');
  if (password) password.removeAttribute('aria-invalid');
  if (btn) { btn.disabled = true; btn.setAttribute('aria-busy','true'); }
  if (btnLabel) btnLabel.textContent = t('Signing in...');
  if (isSignUp && btnLabel) btnLabel.textContent = t('Creating account...');
  if (!firebase || !firebase.auth) {
    if (error) error.textContent = t('Unable to connect. Check your internet connection and try again.');
    if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    if (btnLabel) btnLabel.textContent = isSignUp ? t('Sign Up') : t('Sign In');
    return;
  }
  var authPromise = isSignUp
    ? firebase.auth().createUserWithEmailAndPassword(emailStr, pwdStr)
    : firebase.auth().signInWithEmailAndPassword(emailStr, pwdStr);
  authPromise.then(function(result) {
    if (isSignUp && result && result.user) {
      result.user.sendEmailVerification({
        url: 'https://reclaim00.github.io/reclaim-buddy/',
        handleCodeInApp: true
      }).catch(function(e) { console.warn('Welcome email failed:', e); });
    }
  }).catch(function(err) {
    if (err && err.code === 'auth/multi-factor-auth-required' && err.resolver && typeof handleMfaSignIn === 'function') {
      if (error) error.textContent = '';
      handleMfaSignIn(err);
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
      if (btnLabel) btnLabel.textContent = isSignUp ? t('Sign Up') : t('Sign In');
      return;
    }
    if (error) {
      var msg = err.message || 'Authentication failed.';
      if (msg.indexOf('auth/user-not-found') !== -1) msg = t('No account found with this email. Try Sign Up.');
      else if (msg.indexOf('auth/wrong-password') !== -1 || msg.indexOf('auth/invalid-credential') !== -1) msg = t('Incorrect email or password.');
      else if (msg.indexOf('auth/email-already-in-use') !== -1) msg = t('This email is already registered. Try Sign In.');
      else if (msg.indexOf('auth/weak-password') !== -1) msg = t('Password must be at least 6 characters.');
      else if (msg.indexOf('auth/internal-error') !== -1) msg = t('Sign-in could not be completed. Please try again.');
      else if (msg.indexOf('auth/too-many-requests') !== -1) msg = t('Too many attempts. Please try again later.');
      else if (msg.indexOf('auth/network-request-failed') !== -1) msg = t('Network error. Check your connection.');
      else if (msg.indexOf('auth/invalid-email') !== -1) msg = t('Invalid email address.');
      error.textContent = msg;
    }
    if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
    if (btnLabel) btnLabel.textContent = isSignUp ? t('Sign Up') : t('Sign In');
  });
}
function googleSignIn() {
  if (!firebase || !firebase.auth) { alert(t('Unable to connect. Check your internet connection and try again.')); return; }
  var btn = document.getElementById('si-google-btn');
  var lbl = document.getElementById('si-google-label');
  var error = document.getElementById('si-error');
  if (btn) { btn.disabled = true; btn.setAttribute('aria-busy','true'); }
  if (lbl) lbl.textContent = t('Signing in...');
  if (error) error.textContent = '';

  function googleCredential(cred) {
    var idToken = cred && (cred.idToken || cred.id_token);
    var accessToken = cred && (cred.accessToken || cred.access_token);
    return firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
  }

  function finishGoogleSignIn(authPromise) {
    authPromise.then(function() {
      // onAuthStateChanged handles onAuthReady + linking hooks below
    }).catch(function(err) {
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
      if (lbl) lbl.textContent = t('Continue with Google');
      _handleGoogleAuthError(err, googleCredential, function(cred) {
        if (cred) return firebase.auth().signInWithCredential(cred);
        return null;
      });
    });
  }

  if (isNativeApp()) {
    var FA = Capacitor.Plugins && Capacitor.Plugins.FirebaseAuthentication;
    if (!FA) { if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); } if (lbl) lbl.textContent = t('Continue with Google'); showToast(t('Google Sign-In is not configured on this device yet.'), 'warning'); return; }
    FA.signInWithGoogle({ skipNativeAuth: true }).then(function(result) {
      var cred = result && result.credential;
      if (!cred || !cred.idToken) { throw new Error('No Google credential returned'); }
      finishGoogleSignIn(firebase.auth().signInWithCredential(googleCredential(cred)));
    }).catch(function(e) {
      if (btn) { btn.disabled = false; btn.removeAttribute('aria-busy'); }
      if (lbl) lbl.textContent = t('Continue with Google');
      if (e && e.message && (e.message.indexOf('cancel') !== -1 || e.message.indexOf('CANCELLED') !== -1)) return;
      console.warn('google native sign-in error:', e);
      _handleGoogleAuthError(e, googleCredential, function() { return null; });
    });
  } else {
    var provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    finishGoogleSignIn(firebase.auth().signInWithPopup(provider));
  }
}

function _handleGoogleAuthError(err, googleCredential, makePromise) {
  // Account exists but with a different credential (e.g. email/password). Auto-link.
  if (err && err.code === 'auth/account-exists-with-different-credential') {
    var email = err.email || '';
    var pendingCred = err.credential || null;
    if (!pendingCred) {
      pendingCred = (typeof googleCredential === 'function') ? googleCredential(err) : null;
    }
    showToast(t('An account already exists for this email. Linking your account...'), 'info');
    _linkGoogleCredential(email, pendingCred, makePromise);
    return;
  }
  if (err && err.code === 'auth/multi-factor-auth-required' && typeof handleMfaSignIn === 'function' && err.resolver) {
    handleMfaSignIn(err);
    return;
  }
  var msg = (err && err.message) || 'Authentication failed.';
  if (err && err.code === 'auth/popup-closed-by-user') msg = t('Sign-in cancelled.');
  else if (err && err.code === 'auth/user-cancelled') msg = t('Sign-in cancelled.');
  else if (msg.indexOf('auth/network-request-failed') !== -1) msg = t('Network error. Check your connection.');
  else if (err && err.code === 'auth/internal-error') msg = t('Sign-in could not be completed. Please try again.');
  else if (msg.indexOf('auth/operation-not-allowed') !== -1 || msg.indexOf('auth/unauthorized-domain') !== -1) msg = t('Google Sign-In is not enabled for this app yet.');
  showToast(msg, 'error');
}

function _linkGoogleCredential(email, pendingCred, makePromise) {
  // If there's an existing user signed in already (e.g. restored session), link directly.
  var cu = firebase && firebase.auth().currentUser;
  if (cu && cu.email === email) {
    cu.linkWithCredential(pendingCred).then(function() {
      showToast(t('Accounts linked. You can now sign in with Google.'));
      render();
    }).catch(function(e) {
      console.warn('link failed:', e);
      showToast((e && e.message) || t('Could not link accounts.'), 'error');
    });
    return;
  }
  // Prompt for the password of the existing email/password account, then link.
  var ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = '<div class="overlay-content" style="max-width:360px;text-align:center">'
    + '<h3 style="font-size:18px;font-weight:700;margin-bottom:4px">&#128279; '+t('Link your accounts')+'</h3>'
    + '<p style="font-size:12px;color:var(--muted);margin-bottom:10px">'+t('An account already exists for')+' <strong>'+esc(email)+'</strong>. '+t('Sign in with its password to link Google Sign-In, or use another email.')+'</p>'
    + '<input id="link-email" class="si-input" type="email" value="'+esc(email)+'" placeholder="'+t('your@email.com')+'">'
    + '<input id="link-password" class="si-input" type="password" placeholder="'+t('Password')+'" onkeydown="if(event.key===\'Enter\')confirmAccountLink()">'
    + '<div id="link-error" style="font-size:12px;color:var(--danger);margin:4px 0;display:none"></div>'
    + '<div style="display:flex;gap:6px;margin-top:8px">'
    + '<button class="btn btn-outline" onclick="this.closest(\'.overlay\').remove()" style="flex:1">'+t('Cancel')+'</button>'
    + '<button class="btn btn-primary" onclick="confirmAccountLink(this)" style="flex:1">'+t('Link')+'</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  window._pendingGoogleCred = pendingCred;
  _pendingLinkEmail = email;
}

function confirmAccountLink(btn) {
  var email = (document.getElementById('link-email') || {}).value;
  var pwd = (document.getElementById('link-password') || {}).value;
  var errEl = document.getElementById('link-error');
  if (!email || !pwd) { if (errEl) { errEl.style.display = 'block'; errEl.textContent = t('Enter your email and password.'); } return; }
  if (btn) { btn.disabled = true; btn.textContent = t('Linking...'); }
  var cred = window._pendingGoogleCred;
  var targetEmail = email;
  firebase.auth().signInWithEmailAndPassword(email, pwd).then(function() {
    var cu = firebase.auth().currentUser;
    return cu.linkWithCredential(cred).then(function() {
      showToast(t('Accounts linked. You can now sign in with Google.'));
      if (window._pendingGoogleCred) window._pendingGoogleCred = null;
      _pendingLinkEmail = '';
      var ovs = document.querySelectorAll('.overlay');
      for (var i = 0; i < ovs.length; i++) ovs[i].remove();
      if (typeof render === 'function') render();
    });
  }).catch(function(e) {
    if (btn) { btn.disabled = false; btn.textContent = t('Link'); }
    if (errEl) {
      errEl.style.display = 'block';
      var m = (e && e.message) || '';
      if (e && (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')) m = t('Incorrect password for this account.');
      else if (e && e.code === 'auth/user-not-found') m = t('No account found with this email.');
      else if (e && e.code === 'auth/email-already-in-use') m = t('This email is already registered. Try Sign In.');
      else if (e && e.code === 'auth/multi-factor-auth-required' && typeof handleMfaSignIn === 'function' && e.resolver) { if (errEl) errEl.style.display = 'none'; handleMfaSignIn(e); return; }
      errEl.textContent = m || (e && e.message) || t('Could not link accounts.');
    }
  });
}

var _pendingLinkEmail = '';

function sendEmailVerification() {
  var user = firebase && firebase.auth().currentUser;
  if (!user) { alert(t('You are not signed in.')); return; }
  user.sendEmailVerification({ url: 'https://reclaim00.github.io/reclaim-buddy/', handleCodeInApp: false }).then(function() {
    alert(t('Verification email sent. Check your inbox.'));
  }).catch(function(err) {
    alert(err.message);
  });
}
function signOut() {
  firebase.auth().signOut().catch(function(e){ console.warn(e); showToast('Something went wrong','error'); });
  localStorage.removeItem('rc_user');
  AUTH_USER = '';
  AUTH_EMAIL = '';
  D = defaultData();
  document.body.classList.remove('logged-in');
  showSignIn();
}
// Block back-navigation to app when signed out
window.addEventListener('popstate', function(e) {
  if (!AUTH_USER && document.querySelector('.si-bg')) {
    history.pushState({ si: true }, '', location.pathname + location.search);
  }
});
// ====== URL ACTION HANDLER (for manifest shortcuts) ======
function handleUrlAction() {
  var params = new URLSearchParams(window.location.search);
  var action = params.get('action');
  if (!action) return;
  // Wait for auth and render before handling action
  var check = function() {
    if (typeof goTo !== 'function' || typeof startBreathe !== 'function') { setTimeout(check, 200); return; }
    if (action === 'journal') { setTimeout(function(){ goTo('journal') }, 600); }
    else if (action === 'breathe') { setTimeout(function(){ startBreathe() }, 600); }
    else if (action === 'sos') { setTimeout(function(){ showSOS() }, 600); }
    else if (action === 'mood') { setTimeout(function(){ goTo('track') }, 600); }
    else if (action === 'buddy') { setTimeout(function(){ goTo('buddy') }, 600); }
  };
  check();
}
// Call after auth is set up
if (AUTH_USER) { setTimeout(handleUrlAction, 1000); }

// ====== UI ======
function showSignIn() {
  SIGN_IN_MODE = 'in';
  var app = document.getElementById('app');
  app.innerHTML =
    '<div class="si-bg">' +
    '<div class="si-card">' +
    '<div class="si-icon"><img src="globe-icon.png" alt="Re.Claim" style="width:80px;height:80px;border-radius:50%;object-fit:cover"></div>' +
    '<div class="si-title">Re.<span>Claim</span></div>' +
    '<div class="si-sub">'+t('Your recovery &amp; wellness journey starts here.')+'<br>'+t('Track moods, journal, build habits, and grow.')+'</div>' +
    '<div class="si-toggle">' +
    '<button type="button" class="si-tab-btn active" id="si-tab-in" aria-pressed="true" onclick="setSignInTab(\'in\')">'+t('Sign In')+'</button>' +
    '<button type="button" class="si-tab-btn" id="si-tab-up" aria-pressed="false" onclick="setSignInTab(\'up\')">'+t('Sign Up')+'</button>' +
    '</div>' +
    '<div id="si-auth-section">' +
    '<div id="si-email-mode">' +
    '<form id="si-form" onsubmit="event.preventDefault();handleAuth()" novalidate>' +
    '<input class="si-input" type="email" id="si-email" aria-label="'+t('Email address')+'" placeholder="'+t('your@email.com')+'" autocomplete="email" inputmode="email" required>' +
    '<input class="si-input" type="password" id="si-password" aria-label="'+t('Password')+'" placeholder="'+t('Password')+'" autocomplete="current-password" minlength="6" required>' +
    '<div id="si-password-help" class="si-password-help" style="display:none">'+t('Use at least 6 characters.')+'</div>' +
    '<div id="si-forgot-container" style="text-align:right;font-size:11px;margin:2px 0 4px"><button type="button" class="si-forgot-btn" id="si-forgot-link" style="display:none" onclick="handleForgotPassword()">'+t('Forgot password?')+'</button></div>' +
    '<div id="si-error" role="alert" aria-live="polite" style="font-size:12px;color:var(--danger);margin:4px 0;text-align:center"></div>' +
    '<button type="submit" class="si-btn" id="si-auth-btn"><span id="si-btn-label">'+t('Sign In')+'</span></button>' +
    '</form>' +
    '</div>' +
    '<div class="si-sep">'+t('or')+'</div>' +
    '<button type="button" class="si-google-btn" id="si-google-btn" onclick="googleSignIn()">' +
    '<svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg><span id="si-google-label">'+t('Continue with Google')+'</span></button>' +
    '</div>' +
    '<div class="si-lang-row">'+t('Language')+': <select id="si-language" onchange="changeLanguage(this.value);showSignIn()" style="font-size:12px;padding:4px 6px;max-width:160px">'+(function(){var r='';for(var li=0;li<LANGUAGES.length;li++){r+='<option value="'+LANGUAGES[li]+'"'+(LANGUAGES[li]===(D.language||'English')?' selected':'')+'>'+LANGUAGES[li]+'</option>'}return r})()+'</select></div>' +
    '<div class="si-footer">'+t('Your journal, moods &amp; habits stay on your device. Partner features sync via Firebase.')+'</div>' +
    '</div></div>';
  document.getElementById('tabs').style.display = 'none';
  var tb = document.querySelector('.top-bar');
  if (tb) tb.style.display = 'none';
  try { history.pushState({ si: true }, '', location.pathname + location.search); } catch(e) {}
}

function handleForgotPassword() {
  var email = document.getElementById('si-email');
  var error = document.getElementById('si-error');
  var link = document.getElementById('si-forgot-link');
  if (!email || !email.value.trim()) { if (error) error.textContent = t('Enter your email address first.'); if (email) email.focus(); return; }
  var emailStr = email.value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) { if (error) error.textContent = t('Enter a valid email address.'); email.focus(); return; }
  if (!firebase || !firebase.auth) { if (error) error.textContent = t('Cloud authentication is not available.'); return; }
  if (error) { error.style.color = 'var(--muted)'; error.textContent = t('Sending reset link...'); }
  if (link) { link.disabled = true; link.setAttribute('aria-busy','true'); }
  firebase.auth().sendPasswordResetEmail(emailStr).then(function() {
    if (error) { error.style.color = 'var(--primary)'; error.textContent = t('Password reset email sent. Check your inbox.'); }
  }).catch(function(err) {
    if (error) { error.style.color = 'var(--danger)'; error.textContent = err.code === 'auth/user-not-found' ? t('No account found with this email.') : t('Could not send the reset link. Please try again.'); }
  }).finally(function() {
    if (link) { link.disabled = false; link.removeAttribute('aria-busy'); }
  });
}

var SIGN_IN_MODE = 'in';
function setSignInTab(mode) {
  SIGN_IN_MODE = mode;
  var btnIn = document.getElementById('si-tab-in');
  var btnUp = document.getElementById('si-tab-up');
  var label = document.getElementById('si-btn-label');
  var forgotLink = document.getElementById('si-forgot-link');
  var email = document.getElementById('si-email');
  var password = document.getElementById('si-password');
  var passwordHelp = document.getElementById('si-password-help');
  var isSignIn = mode === 'in';
  if (btnIn) { btnIn.classList.toggle('active', isSignIn); btnIn.setAttribute('aria-pressed', String(isSignIn)); }
  if (btnUp) { btnUp.classList.toggle('active', !isSignIn); btnUp.setAttribute('aria-pressed', String(!isSignIn)); }
  if (password) password.autocomplete = isSignIn ? 'current-password' : 'new-password';
  if (passwordHelp) passwordHelp.style.display = isSignIn ? 'none' : 'block';
  var error = document.getElementById('si-error');
  if (error) { error.textContent = ''; error.style.color = 'var(--danger)'; }
  if (email) email.removeAttribute('aria-invalid');
  if (password) password.removeAttribute('aria-invalid');
  if (isSignIn) {
    if (label) label.textContent = t('Sign In');
    if (forgotLink) forgotLink.style.display = 'inline';
  } else {
    if (label) label.textContent = t('Sign Up');
    if (forgotLink) forgotLink.style.display = 'none';
  }
}

// ====== INSTALL PROMPT ======
var _deferredInstallPrompt = null;
var _appInstalled = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone || false;

window.addEventListener('beforeinstallprompt', function(e) {
  e.preventDefault();
  _deferredInstallPrompt = e;
  if (!_appInstalled && !localStorage.getItem('rc_install_dismissed')) {
    showInstallBanner();
  }
});

window.addEventListener('appinstalled', function() {
  _appInstalled = true;
  _deferredInstallPrompt = null;
  var banner = document.getElementById('install-banner');
  if (banner) banner.remove();
});

function showInstallBanner() {
  var existing = document.getElementById('install-banner');
  if (existing) return;
  var banner = document.createElement('div');
  banner.id = 'install-banner';
  banner.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:199;background:var(--card);border:1px solid var(--primary);border-radius:14px;padding:12px 16px;box-shadow:0 4px 24px rgba(0,0,0,.12);max-width:360px;width:90%;display:flex;align-items:center;gap:10px;animation:overlaySlide .3s ease';
  banner.innerHTML = '<div style="flex:1"><div style="font-weight:700;font-size:13px">'+t('Install Re.Claim')+'</div><div style="font-size:11px;color:var(--muted)">'+t('Works offline. Your data stays on your device.')+'</div></div><button class="btn btn-sm btn-primary" onclick="confirmInstall()" style="width:auto;padding:8px 16px;white-space:nowrap">'+t('Install')+'</button><button class="btn btn-sm" onclick="dismissInstallBanner()" style="width:auto;padding:8px;font-size:18px;line-height:1;background:none;border:none;color:var(--muted);cursor:pointer">&times;</button>';
  document.body.appendChild(banner);
}

function confirmInstall() {
  if (!_deferredInstallPrompt) { showToast(t('Open browser menu and tap "Add to Home Screen"'), 'info'); return; }
  _deferredInstallPrompt.prompt();
  _deferredInstallPrompt.userChoice.then(function(choice) {
    if (choice.outcome === 'accepted') { _appInstalled = true; }
    _deferredInstallPrompt = null;
    var banner = document.getElementById('install-banner');
    if (banner) banner.remove();
  });
}

function dismissInstallBanner() {
  localStorage.setItem('rc_install_dismissed', '1');
  var banner = document.getElementById('install-banner');
  if (banner) banner.remove();
}

// ====== KEYBOARD SHORTCUTS ======
document.addEventListener('keydown', function(e) {
  if (e.altKey && e.key === '1') { e.preventDefault(); goTo('journal'); }
  if (e.altKey && e.key === '2') { e.preventDefault(); startBreathe(); }
  if (e.altKey && e.key === '3') { e.preventDefault(); goTo('home'); }
  if (e.altKey && e.key === '4') { e.preventDefault(); goTo('profile'); }
  if (e.key === 'Escape') {
    var overlay = document.querySelector('.overlay');
    if (overlay) overlay.remove();
  }
});

// ====== ANONYMIZED RESEARCH DATA ======
function collectResearchData() {
  if (!D.researchOptIn) return;
  var soberStart = D.sobriety && D.sobriety.startDate || null;
  var data = {
    v: 1,
    t: Date.now(),
    // Anonymized — no emails, no names, no journal text
    soberDays: soberStart ? soberDays() : 0,
    journalCount: (D.journal||[]).length,
    moodCount: (D.moods||[]).length,
    cravingCount: (D.cravings||[]).length,
    breatheCount: D.breatheCount || 0,
    copingCardCount: (D.customCopingCards||[]).length,
    habitCount: (D.habits||[]).length,
    buddyPaired: !!D.buddy,
    hasSafetyPlan: !!(D.relapsePlan && D.relapsePlan.statement),
    hasSOS: D.sosUsed || false,
    achievementsCount: (D.achievements||[]).length,
    encrypted: D.encryption && D.encryption.enabled || false
  };
  // Store latest anonymized snapshot
  D._researchSnapshot = data;
  D.researchLastSubmitted = Date.now();
  saveData();
  // In production, this would POST to an endpoint:
  // fetch('https://research.reclaim.app/submit', { method:'POST', body: JSON.stringify(data), headers:{'Content-Type':'application/json'} });
  console.log('[Research] Anonymized data snapshot:', data);
}

// Auto-collect research data periodically if opted in
setInterval(function() {
  if (D && D.researchOptIn) collectResearchData();
}, 86400000); // once per day

// Migration: ensure researchOptIn and researchLastSubmitted exist
if (D && typeof D.researchOptIn === 'undefined') { D.researchOptIn = false; saveData(); }
if (D && typeof D.researchLastSubmitted === 'undefined') { D.researchLastSubmitted = null; saveData(); }
