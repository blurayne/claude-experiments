// Offline shell for the Galactic Year PWA. The page itself is one self-contained
// file; only the icons, manifest and the audio under music/ and sfx/ ride along.
const V = 'galactic-year-1.19.0';  // the app version: a new name retires the old cache
const CORE = [
  'galactic-transit.html', 'manifest.json',
  'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const wantsHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');
  if (wantsHTML) {
    // network first, so a redeploy is picked up; cache is the offline fallback
    e.respondWith(fetch(req)
      .then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('galactic-transit.html'))));
    return;
  }
  // icons and audio: cache first, filled in as they are actually played
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(req, c)); }
    return res;
  })));
});
