const CACHE_NAME = "semicentric-v1";
const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.0-1/dist/unicornStudio.umd.js",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(URLS_TO_CACHE)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const fetched = fetch(e.request)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    }),
  );
});
