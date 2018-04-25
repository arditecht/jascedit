var CACHE_NAME = 'browseride-cache-v123';
var urlsToCache = [
  '/',
  '/jquery-3.2.1.min.js',
  '/ace-builds/src-noconflict/ace.js',
  '/ForerunnerDB/js/dist/fdb-all.min.js',
  '/webWorkerRigged.js',
  '/initResources.js',
  '/runIDE.js',
  '/styleHome.css'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
