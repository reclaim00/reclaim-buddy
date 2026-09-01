var CACHE = 'reclaim-20260828c';
var BASE = self.registration.scope;
function baseUrl(p) { return new URL(p, BASE).href; }
var SHELL = [
  baseUrl(''), baseUrl('app.html'), baseUrl('manifest.json'),
  baseUrl('icon-192.png'), baseUrl('icon-512.png'), baseUrl('icon.svg'),
  baseUrl('src/style.css'), baseUrl('src/data.js'), baseUrl('src/buddy.js'),
  baseUrl('src/sober.js'), baseUrl('src/pages.js'), baseUrl('src/kingdom.js'), baseUrl('src/ui.js')
];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(SHELL); }));
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
    var match = ws.find(function(w) { return w.visibilityState === 'visible'; });
    if (match) { match.focus(); return; }
    if (ws.length) { ws[0].focus(); return; }
    clients.openWindow(url);
  }));
});