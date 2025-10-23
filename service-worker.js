self.addEventListener('install', event => {
  event.waitUntil(caches.open('martfleet-cache').then(cache => {
    return cache.addAll([
      '/',
      '/templates/index.html',
      '/css/main.css',
      '/js/main.js'
    ]);
  }));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
