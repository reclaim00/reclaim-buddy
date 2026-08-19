var CACHE = 'reclaim-20260819';
var SHELL = ['/', '/app.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/icon.svg', '/src/style.css', '/src/data.js', '/src/buddy.js', '/src/sober.js', '/src/pages.js', '/src/kingdom.js', '/src/ui.js'];

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

  // Network-first for JS files (always get latest), cache-first for everything else
  if (req.url.indexOf('/src/') !== -1 || (req.url.indexOf('.js?v=') !== -1)) {
    e.respondWith(
      fetch(req).then(function(res) {
        return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
      }).catch(function() {
        return caches.match(req).then(function(hit) { return hit || caches.match('/app.html'); });
      })
    );
  } else if (req.mode === 'navigate') {
    // Navigation requests: serve cached app.html when offline
    e.respondWith(
      fetch(req).catch(function() {
        return caches.match('/app.html');
      })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function(hit) {
        return hit || fetch(req).then(function(res) {
          return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
        }).catch(function() {
          return caches.match('/app.html');
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
  var url = d.url || (d.notification && d.notification.data && d.notification.data.url) || '/';
  e.waitUntil(self.registration.showNotification(title, {body: body, icon: icon, tag: tag, data: {url: url}}));
});

self.addEventListener('notificationclick', function(e) {
  var url = e.notification.data && e.notification.data.url ? e.notification.data.url : '/';
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(ws) {
    var match = ws.find(function(w) { return w.visibilityState === 'visible'; });
    if (match) { match.focus(); return; }
    if (ws.length) { ws[0].focus(); return; }
    clients.openWindow(url);
  }));
});
