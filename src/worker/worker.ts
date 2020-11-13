var CACHE_NAME = 'my-site-cache-v1';
var urlsToCache = [
    './',
    './32.png',
    './256.png',
    './bundle.js',
    './icons.woff2',
    './index.html',
    './manifest.webmanifest',
    './style.css',
    './worker.js',
];

self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(caches.match(event.request).then(response => {
        if(response) {
            console.log("CACHED");
            return response;
        } else {
            console.log("Not cached");
            return fetch(event.request);
        }
    }))
});
