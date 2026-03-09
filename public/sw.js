// Fear & Loathing Trail — Service Worker (Vite-compatible)
const CACHE = 'flt-v4-cache-v1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

// Network-first with cache fallback. Skip PeerJS signaling requests.
self.addEventListener('fetch', (e) => {
  if (e.request.url.includes('peerjs') || e.request.url.includes('unpkg.com')) return;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        const c = r.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, c));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', (e) => {
  if (e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});
