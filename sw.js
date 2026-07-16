var CACHE = 'reclaim-20260715';
var SHELL = ['/reclaim-buddy/', '/reclaim-buddy/index.html', '/reclaim-buddy/app.html', '/reclaim-buddy/manifest.json', '/reclaim-buddy/icon-192.png', '/reclaim-buddy/icon-512.png', '/reclaim-buddy/icon.svg', '/reclaim-buddy/src/style.css', '/reclaim-buddy/src/data.js', '/reclaim-buddy/src/buddy.js', '/reclaim-buddy/src/sober.js', '/reclaim-buddy/src/pages.js', '/reclaim-buddy/src/kingdom.js', '/reclaim-buddy/src/ui.js'];
var NETWORK_FIRST = ['/reclaim-buddy/src/'];

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
  if (req.url.indexOf('/src/') > 0 || req.url.indexOf('.js?v=') > 0) {
    e.respondWith(
      fetch(req).then(function(res) {
        return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
      }).catch(function() {
        return caches.match(req).then(function(hit) { return hit || caches.match('/reclaim-buddy/'); });
      })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function(hit) {
        return hit || fetch(req).then(function(res) {
          return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
        }).catch(function() {
          return caches.match('/reclaim-buddy/');
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
    clients.openWindow('/reclaim-buddy/');
  }));
});
