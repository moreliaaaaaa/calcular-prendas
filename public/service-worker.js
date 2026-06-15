const CACHE_NAME = "prendas-react-v1";

const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

const OFFLINE_HTML = new Response(
  '<!doctype html><html lang="es"><meta charset="utf-8"><title>Sin conexion</title><body><p>Sin conexion.</p></body></html>',
  {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  },
);

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) return caches.delete(name);
          return Promise.resolve();
        }),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const isSameOrigin = event.request.url.startsWith(self.location.origin);
  const isPageRequest = event.request.mode === "navigate";
  const requestPath = new URL(event.request.url).pathname;
  const isAppAsset =
    isSameOrigin &&
    (requestPath.endsWith("/index.html") ||
      requestPath.includes("/assets/") ||
      requestPath.includes("/img/") ||
      requestPath.includes("/icons/") ||
      requestPath.includes("/marca/"));

  const cacheFirst = async () => {
    const cachedResponse = await caches.match(event.request);
    if (cachedResponse) return cachedResponse;

    const networkResponse = await fetch(event.request);
    if (networkResponse && networkResponse.ok && isSameOrigin) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, networkResponse.clone());
    }

    return networkResponse;
  };

  const networkFirst = async () => {
    try {
      const networkResponse = await fetch(event.request);
      if (networkResponse && networkResponse.ok && isSameOrigin) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(event.request, networkResponse.clone());
      }

      return networkResponse;
    } catch (error) {
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) return cachedResponse;

      if (isPageRequest) {
        const cachedPage = await caches.match("/index.html");
        return cachedPage || OFFLINE_HTML;
      }

      return new Response("", {
        status: 503,
        statusText: "Sin conexion",
      });
    }
  };

  event.respondWith(isPageRequest || isAppAsset ? networkFirst() : cacheFirst());
});
