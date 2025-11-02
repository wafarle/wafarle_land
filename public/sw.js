/* Lightweight offline-first service worker */
const CACHE_NAME = 'wafrly-cache-v1';
const OFFLINE_URL = '/offline';
const PRECACHE_URLS = [
  '/',
  OFFLINE_URL,
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? undefined : caches.delete(k))))).then(() => self.clients.claim())
  );
});

// Network-first for pages; cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET
  if (request.method !== 'GET') return;

  // Static assets cache-first
  if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/icons/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.jpg') || url.pathname.endsWith('.svg')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
        return resp;
      }))
    );
    return;
  }

  // Pages/network-first with offline fallback
  event.respondWith(
    fetch(request).then((resp) => {
      const respClone = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, respClone));
      return resp;
    }).catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
  );
});




