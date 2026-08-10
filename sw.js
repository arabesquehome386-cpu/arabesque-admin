// Service Worker لأرابيسك ريزيدنس PWA
// الاستراتيجية: Network First دايماً — يحاول ياخد أحدث نسخة من السيرفر أولاً،
// ولو مفيش نت (offline) يرجع لآخر نسخة محفوظة في الكاش.
// كده أي تعديل تعمله في index.html هيظهر فوراً لأي حد فاتح النت، من غير ما تستنى الكاش يتحدّث.

// ⚠️ زوّد الرقم ده (v1 -> v2 -> ...) لو حبيت تجبر تنظيف كامل للكاش القديم بعد تحديث كبير
const CACHE_NAME = 'arabesque-pwa-v24';
const CORE_ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS).catch(() => {}))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // مايتدخلش في POST بتاعة Apps Script

  event.respondWith(
    fetch(event.request)
      .then((networkResp) => {
        const copy = networkResp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy)).catch(() => {});
        return networkResp;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
