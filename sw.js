var CACHE = 'reclaim-v1';
var SHELL = ['/reclaim-buddy/app.html', '/reclaim-buddy/manifest.json', '/reclaim-buddy/icon-192.png', '/reclaim-buddy/icon-512.png', '/reclaim-buddy/icon.svg'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(SHELL); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', function(e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(function(hit) {
      return hit || fetch(req).then(function(res) {
        return caches.open(CACHE).then(function(c) { c.put(req, res.clone()); return res; });
      }).catch(function() {
        return caches.match('/reclaim-buddy/app.html');
      });
    })
  );
});

self.addEventListener('push', function(e) {
  var d = e.data ? e.data.json() : {};
  self.registration.showNotification(d.title || 'Re.Claim', {body: d.body || '', icon: d.icon || 'icon-192.png'});
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(ws) {
    if (ws.length) { ws[0].focus(); return; }
    clients.openWindow('/reclaim-buddy/app.html');
  }));
});
