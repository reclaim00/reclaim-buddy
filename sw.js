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
self.addEventListener('push', function(e) {
  var data = {};
  if (e.data) {
    try { data = e.data.json(); } catch(e) {}
  }
  var title = (data.notification && data.notification.title) || data.title || 'Re.Claim';
  var body = (data.notification && data.notification.body) || data.body || '';
  var opts = {
    body: body,
    icon: data.icon || 'icon-192.png',
    tag: data.tag || 'reclaim-push',
    badge: 'icon-192.png',
    data: data.data || {}
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:'window'}).then(function(clientList) {
    for (var i=0;i<clientList.length;i++) {
      if (clientList[i].url && 'focus' in clientList[i]) { clientList[i].focus(); return; }
    }
    if (clients.openWindow) clients.openWindow('/');
  }));
});
self.addEventListener('fetch', function(e) { e.respondWith(fetch(e.request).catch(function(){ return caches.match(e.request); })); });
