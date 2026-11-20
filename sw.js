// Service worker Catatan Keuangan: bisa dibuka offline, selalu mencoba versi terbaru lebih dulu.
const V = 'keuangan-5.1';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  // Permintaan ke Apps Script (sinkronisasi) tidak diganggu.
  const ok = u.origin === location.origin || u.hostname.includes('cdnjs.cloudflare.com') || u.hostname.includes('fonts.g');
  if (!ok) return;
  e.respondWith(
    fetch(r).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
