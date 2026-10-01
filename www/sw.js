var CACHE = 'reclaim-20261001g';
var BASE = self.registration.scope;
function baseUrl(p) { return new URL(p, BASE).href; }
var FIREBASE_ASSETS = [
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js'
];
var SHELL = [
  baseUrl(''), baseUrl('app.html'), baseUrl('manifest.json'),
  baseUrl('icon-192.png'), baseUrl('icon-512.png'), baseUrl('icon.svg'),
  baseUrl('src/style.css'), baseUrl('src/data.js'), baseUrl('src/buddy.js'),
  baseUrl('src/sober.js'), baseUrl('src/pages.js'), baseUrl('src/kingdom.js'), baseUrl('src/ui.js'),
  baseUrl('src/mfa.js'), baseUrl('src/landscape-day.svg'), baseUrl('src/landscape-night.svg')
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) {
    return c.addAll(SHELL).then(function() {
      return Promise.all(FIREBASE_ASSETS.map(function(url) {
        return fetch(url, { mode: 'no-cors' }).then(function(response) {
          return c.put(url, response);
        }).catch(function(error) {
          console.warn('Could not cache Firebase SDK for offline use:', error);
        });
      }));
    });
  }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = req.url;
  if (FIREBASE_ASSETS.indexOf(url) !== -1) {
    e.respondWith(caches.open(CACHE).then(function(c) {
      return c.match(req).then(function(hit) {
        if (hit) return hit;
        return fetch(req).then(function(res) {
          if (res.ok || res.type === 'opaque') c.put(req, res.clone());
          return res;
        });
      });
    }));
    return;
  }
  // Only handle requests inside the app's base path
  if (url.indexOf(BASE) !== 0) return;

  // Network-first for JS files (always get latest), cache-first for everything else
  if (url.indexOf(BASE + 'src/') !== -1 || url.indexOf('.js?v=') !== -1) {
    e.respondWith(
      fetch(req).then(function(res) {
        return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
      }).catch(function() {
        return caches.match(req).then(function(hit) { return hit || caches.match(baseUrl('app.html')); });
      })
    );
  } else if (req.mode === 'navigate') {
    // Navigation requests: serve cached app.html when offline
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match(baseUrl('app.html'));
      })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function(hit) {
        return hit || fetch(req).then(function(res) {
          return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
        }).catch(function() {
          return caches.match(baseUrl('app.html'));
        });
      })
    );
  }
});

self.addEventListener('push', function(e) {
  var d = e.data ? e.data.json() : {};
  var title = d.title || (d.notification && d.notification.title) || 'Re.Claim';
  var body = d.body || (d.notification && d.notification.body) || '';
  var icon = d.icon || (d.notification && d.notification.icon) || 'icon-192.png';
  var tag = d.tag || (d.notification && d.notification.tag) || 'reclaim-notification';
  var url = d.url || 'app.html';
  if (url.indexOf('://') === -1) url = new URL(url.replace(/^\//, ''), BASE).href;
  e.waitUntil(self.registration.showNotification(title, {body: body, icon: icon, tag: tag, data: {url: url}}));
});

self.addEventListener('notificationclick', function(e) {
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : baseUrl('app.html');
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(ws) {
    var match = ws.find(function(w) { return w.visibilityState === 'visible'; }) || ws[0];
    if (!match) return clients.openWindow(url);
    // Bring an already-open app to the notification's destination as well as
    // focusing it. Otherwise notifications only work when no app window exists.
    return match.navigate(url).then(function(client) {
      return (client || match).focus();
    }).catch(function() {
      return clients.openWindow(url);
    });
  }));
});
