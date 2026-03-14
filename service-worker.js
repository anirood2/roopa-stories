// Roopa Stories - Service Worker
// Enables offline reading and fast loading

const CACHE_NAME = ‘roopa-stories-v1’;

// Files to cache immediately on install
const PRECACHE_URLS = [
  './',
  './index.html',
  './stories/the-treehouse.html',
  './stories/treasures-and-character.html',
  './stories/the-colors-that-wouldnt-come-out.html'
];


// Install: pre-cache core pages
self.addEventListener(‘install’, function(event) {
event.waitUntil(
caches.open(CACHE_NAME).then(function(cache) {
console.log(’[SW] Pre-caching app shell’);
return cache.addAll(PRECACHE_URLS);
}).then(function() {
return self.skipWaiting();
})
);
});

// Activate: clean up old caches
self.addEventListener(‘activate’, function(event) {
event.waitUntil(
caches.keys().then(function(cacheNames) {
return Promise.all(
cacheNames
.filter(function(name) { return name !== CACHE_NAME; })
.map(function(name) {
console.log(’[SW] Deleting old cache:’, name);
return caches.delete(name);
})
);
}).then(function() {
return self.clients.claim();
})
);
});

// Fetch: network first, fall back to cache
self.addEventListener(‘fetch’, function(event) {
// Only handle GET requests
if (event.request.method !== ‘GET’) return;

// Skip cross-origin requests (e.g. JSONbin API)
if (!event.request.url.startsWith(self.location.origin)) return;

event.respondWith(
fetch(event.request)
.then(function(networkResponse) {
// Cache a copy of every successful response
if (networkResponse && networkResponse.status === 200) {
const responseClone = networkResponse.clone();
caches.open(CACHE_NAME).then(function(cache) {
cache.put(event.request, responseClone);
});
}
return networkResponse;
})
.catch(function() {
// Network failed — serve from cache
return caches.match(event.request).then(function(cachedResponse) {
if (cachedResponse) return cachedResponse;
// Fallback for uncached pages
return caches.match(’/index.html’);
});
})
);
});
