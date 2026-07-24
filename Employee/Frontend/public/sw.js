const CACHE_NAME = "diva-emp-v4";
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
  // Ignore non-GET requests and API backend calls
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  // Handle fetch with graceful fallback so event.respondWith NEVER receives a rejected Promise
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache valid 200 responses for static assets and navigation
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

        // SPA Navigation fallback for offline / network glitches
        if (event.request.mode === "navigate") {
          const indexFallback = await caches.match("/index.html");
          if (indexFallback) return indexFallback;
        }

        return new Response("Network error", {
          status: 503,
          statusText: "Service Unavailable",
          headers: new Headers({ "Content-Type": "text/plain" }),
        });
      })
  );
});
