var CACHE = 'reclaim-20260715';
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
  self.registration.showNotification(d.title || 'Re.Claim', {body: d.body || '', icon: d.icon || 'icon-192.png'});
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(ws) {
    if (ws.length) { ws[0].focus(); return; }
    clients.openWindow('/');
  }));
});
