/* Unsuperman 2 service worker: network-first so uploading a new index.html always shows up,
   with a cached copy as the offline fallback. Bump CACHE only if you rename files. */
var CACHE='unsuperman2-shell-v2';
var SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){
  e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(SHELL);}).then(function(){return self.skipWaiting();}).catch(function(){}));
});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));
});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET')return;
  var url=new URL(e.request.url);if(url.origin!==location.origin)return;
  e.respondWith(fetch(e.request).then(function(r){
    if(r&&r.status===200){var copy=r.clone();caches.open(CACHE).then(function(c){c.put(e.request,copy);});}
    return r;
  }).catch(function(){return caches.match(e.request).then(function(m){return m||caches.match('index.html');});}));
});
