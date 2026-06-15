/* Islamic Front — service worker (conservative).
   HTML: network-first (pages never go stale), cache fallback when offline.
   Same-origin assets: cache-first with background refresh.
   Cross-origin (fonts, recitation audio CDN): left to the browser. */
var CACHE = 'if-cache-v1';
var PRECACHE = [
  'assets/css/if-shared.css',
  'assets/js/if-core.js',
  'assets/js/if-flashcards.js',
  'assets/js/if-quiz.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(PRECACHE).catch(function () {}); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.map(function (k) { if (k !== CACHE) return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url;
  try { url = new URL(req.url); } catch (err) { return; }
  if (url.origin !== self.location.origin) return; /* never intercept cross-origin */

  var isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') >= 0;
  if (isHTML) {
    e.respondWith(
      fetch(req).then(function (r) {
        var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
        return r;
      }).catch(function () { return caches.match(req); })
    );
  } else {
    e.respondWith(
      caches.match(req).then(function (cached) {
        return cached || fetch(req).then(function (r) {
          var copy = r.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); });
          return r;
        });
      })
    );
  }
});
