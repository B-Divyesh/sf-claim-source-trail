const CACHE = 'claim-source-trail-v4';
const SHELL = [
  '/', '/privacy', '/terms', '/404.html', '/404.css',
  '/assets/hero-trail.webp', '/assets/hero-trail-640.webp', '/assets/social-preview.webp',
  '/favicon.svg', '/apple-touch-icon.png',
  '/fonts/atkinson-400.woff2', '/fonts/atkinson-700.woff2'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(async (cache) => {
    await cache.addAll(SHELL);
    const html = await fetch('/').then((response) => response.text());
    const builtAssets = [...html.matchAll(/(?:src|href)="(\/assets\/[^\"]+)"/g)].map((match) => match[1]);
    await Promise.all([...new Set(builtAssets)].map((asset) => cache.add(asset).catch(() => undefined)));
  }));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then((response) => {
    const copy = response.clone(); caches.open(CACHE).then((cache) => cache.put(event.request, copy)); return response;
  }).catch(() => caches.match(event.request).then((cached) => cached || caches.match('/'))));
});
