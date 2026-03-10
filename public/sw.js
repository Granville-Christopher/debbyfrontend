self.addEventListener("install", (event) => {
  // No caching: install immediately
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Pass-through fetch to avoid offline caching
  event.respondWith(fetch(event.request));
});
