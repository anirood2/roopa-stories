const CACHE_NAME = ‘roopa-stories-v1’;

const PRECACHE_URLS = [
‘/’,
‘/index.html’,
‘/stories/the-treehouse.html’,
‘/stories/treasures-and-character.html’,
‘/stories/the-colors-that-wouldnt-come-out.html’
];

self.addEventListener(‘install’, function(event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
return cache.addAll(PRECACHE_URLS);
}).then(function() {
return self.skipWaiting();
})
);
});

self.addEventListener(‘activate’, function(event) {
event.waitUntil(
caches.keys().then(function(cacheNames) {
return Promise.all(
cacheNames
.filter(function(name) { return name !== CACHE_NAME; })
.map(function(name) { return caches.delete(name); })
);
}).then(function() {
return self.clients.claim();
})
);
});

self.addEventListener(‘fetch’, function(event) {
if (event.request.method !== ‘GET’) return;
if (!event.request.url.startsWith(self.location.origin)) return;

event.respondWith(
fetch(event.request)
.then(function(networkResponse) {
if (networkResponse && networkResponse.status === 200) {
const responseClone = networkResponse.clone();
caches.open(CACHE_NAME).then(function(cache) {
cache.put(event.request, responseClone);
});
}
return networkResponse;
})
.catch(function() {
return caches.match(event.request).then(function(cachedResponse) {
return cachedResponse || caches.match(’/index.html’);
});
})
);
});
