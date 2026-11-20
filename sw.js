/* Misión Estudio · funciona sin conexión.
   Primero la red (así cada cambio llega en cuanto hay internet) y, si no hay, lo último guardado.
   Las letras de Google se guardan la primera vez. El ranking (Apps Script) no se toca: va siempre por la red. */
const CACHE = 'mision-v1';
const BASICO = ['./', './index.html', './manifest.webmanifest', './iconos/icono-192.png', './iconos/icono-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASICO)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const propio = u.origin === location.origin, letras = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!propio && !letras) return;
  if (letras) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
    return;
  }
  e.respondWith(fetch(r).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r).then(m => m || caches.match(r, { ignoreSearch: true })).then(m => m || (r.mode === 'navigate' ? caches.match('./index.html') : undefined)).then(m => m || Response.error())));
});
