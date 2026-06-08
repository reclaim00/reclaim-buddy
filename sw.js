self.addEventListener('install', function(e) { self.skipWaiting(); });
self.addEventListener('activate', function(e) { e.waitUntil(clients.claim()); });
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'show-notification') {
    self.registration.showNotification(e.data.title, {
      body: e.data.body,
      icon: e.data.icon || 'icon-192.png',
      tag: e.data.tag || 'reclaim-notification'
    });
  }
});
self.addEventListener('fetch', function(e) { e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); })); });
