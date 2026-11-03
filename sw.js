// RandoVista V9.7 TEST — priorité au réseau pour charger les corrections publiées.
const CACHE_NAME = 'randovista-v970-test-20261103';
const APP_ASSETS = ['./', './index.html', './style.css', './script.js', './ui-v7.js', './radar-v73.js', './climbs-v74.js', './verdict-v75.js', './library-v8.js', './profiles-v81.js', './journal-v944.js', './adaptive-v944.js', './v9.js', './polish-v97.js', './manifest.json', './icon.png', './icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => (key.startsWith('pro-rando-') || key.startsWith('randovista-')) && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if(request.method !== 'GET') return;
  const url = new URL(request.url);
  if(url.hostname.includes('tile.openstreetmap.org') || url.hostname.includes('opentopomap.org')) {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(response => {
      if(response?.ok) caches.open(CACHE_NAME).then(cache => cache.put(request,response.clone()));
      return response;
    })));
    return;
  }
  if(url.origin !== self.location.origin) return;
  // Réseau d'abord : publier un correctif ne doit plus laisser l'ancien écran figé.
  // Hors ligne, repli vers la dernière copie disponible.
  event.respondWith(fetch(request, {cache:'no-store'}).then(response => {
    if(response?.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(request, {ignoreSearch:true});
    if(cached) return cached;
    if(request.mode === 'navigate') return caches.match('./index.html');
    return Response.error();
  }));
});
