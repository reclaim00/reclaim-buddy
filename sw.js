self.addEventListener('install',function(e){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(clients.claim())});
self.addEventListener('push',function(e){
  var d=e.data?e.data.json():{};
  self.registration.showNotification(d.title||'Re.Claim',{body:d.body||'',icon:d.icon||'icon-192.png'});
});
self.addEventListener('notificationclick',function(e){
  e.notification.close();
  e.waitUntil(clients.openWindow('/reclaim-buddy/ReClaim.html'));
});
