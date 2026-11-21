// Service worker Catatan Keuangan: bisa dibuka offline, selalu mencoba versi terbaru lebih dulu.
const V = 'keuangan-5.3';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(V)
      .then(c => c.addAll(FILES).then(() => c.add(CDN).catch(() => {}))) // gagal CDN tidak membatalkan pemasangan
      .then(() => self.skipWaiting())
  );
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
    fetch(r).then(res => {
      if (res && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); } // jangan simpan halaman error
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('./index.html')))
  );
});
