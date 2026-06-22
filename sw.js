/* Islamic Front — service worker (conservative).
   HTML: network-first (pages never go stale), cache fallback when offline.
   Same-origin JS/CSS: network-first, cache fallback (keeps app shell fresh after deploys).
   Other same-origin assets: cache-first.
   Cross-origin (fonts, recitation audio CDN): left to the browser. */
var CACHE = 'if-cache-v4';
var PRECACHE = [
  'favicon.ico',
  'rates.json',
  /* shared CSS */
  'assets/css/if-shared.css',
  'assets/css/if-standard.css',
  /* shared JS — app shell */
  'assets/js/if-core.js',
  'assets/js/if-jsonld.js',
  'assets/js/if-search.js',
  'assets/js/if-profile.js',
  'assets/js/if-share.js',
  'assets/js/if-flashcards.js',
  'assets/js/if-quiz.js',
  /* shared JS — learning platform */
  'assets/js/if-xp.js',
  'assets/js/if-engage.js',
  'assets/js/if-lesson.js',
  'assets/js/if-portal.js',
  'assets/js/if-sublesson.js',
  'assets/js/if-media.js',
  /* catalog & search data */
  'assets/data/site-catalog.js',
  'assets/data/student-guidance-index.js',
  /* lesson data — all 7 portals */
  'assets/data/quran-lessons.js',
  'assets/data/salah-lessons.js',
  'assets/data/seerah-lessons.js',
  'assets/data/history-lessons.js',
  'assets/data/kids-lessons.js',
  'assets/data/arabic-lessons.js',
  'assets/data/urdu-lessons.js'
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
  var isAppAsset = /\.(?:js|css)$/i.test(url.pathname);
  if (isHTML || isAppAsset) {
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
