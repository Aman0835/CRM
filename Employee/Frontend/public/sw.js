// Immediate cleanup if ever accidentally activated on localhost/development
if (
  typeof self !== "undefined" &&
  self.location &&
  (self.location.hostname === "localhost" ||
    self.location.hostname === "127.0.0.1" ||
    self.location.hostname.includes("192.168."))
) {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .then(() => self.registration.unregister())
        .then(() => self.clients.claim())
    );
  });
}

const CACHE_NAME = "dosti-emp-v2";
const STATIC_ASSETS = ["/", "/index.html", "/manifest.json", "/favicon.svg", "/logo.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  // Never intercept in local development, HMR scripts, or backend API calls
  if (
    event.request.method !== "GET" ||
    url.includes("/api/") ||
    url.includes("/@vite/") ||
    url.includes("/@react-refresh") ||
    url.includes("/src/") ||
    url.includes("localhost") ||
    url.includes("127.0.0.1") ||
    url.includes("192.168.")
  ) {
    return;
  }

  // Handle fetch gracefully
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          (event.request.mode === "navigate" || event.request.destination === "image")
        ) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;

        // SPA Navigation fallback for offline
        if (event.request.mode === "navigate") {
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
        }

        return new Response(
          '<!DOCTYPE html><html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#16181d;color:#fff;"><h2>Offline</h2><p>Please check your connection and reload.</p></body></html>',
          {
            status: 200,
            headers: new Headers({ "Content-Type": "text/html" }),
          }
        );
      })
  );
});
