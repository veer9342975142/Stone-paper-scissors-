const CACHE_NAME = 'sps-game-v1';
const FILES_TO_CACHE = [
  'index.html',
  'style.css',
  'script.js',
  'icon-192.png',
  'icon-512.png'
];

// 1. Install the service worker and cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});

// 2. Serve files from cache (if available)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If the file is in the cache, return it.
      // Otherwise, fetch it from the network.
      return response || fetch(event.request);
    })
  );
});