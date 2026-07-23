const CACHE_NAME = "diva-emp-v3";

self.addEventListener("install", (event) => {
  self.skipWaiting();
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
  // Ignore non-GET requests and API calls
  if (event.request.method !== "GET" || event.request.url.includes("/api/")) {
    return;
  }

  // Always force direct network fetch for scripts and styles to eliminate MIME errors
  if (event.request.destination === "script" || event.request.destination === "style" || event.request.url.endsWith(".js")) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
