const V = 'interp-v6';
const CORE = ['./interpolation.html', './interpolation.webmanifest', './icons/interp-192.png', './icons/interp-512.png', './icons/interp-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('interp-') && k !== V).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    e.respondWith(fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    }).catch(() => caches.match(r, { ignoreSearch: true })));
  } else if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res;
    })));
  }
});
