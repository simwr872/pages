const NAME = 'cache';
self.addEventListener('install', (event: ExtendableEvent) => {
    event.waitUntil(
        caches.open(NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll([
                './',
                './32.png',
                './256.png',
                './bundle.js',
                './icons.woff2',
                //'./index.html',
                //'./manifest.webmanifest',
                './style.css',
                //'./worker.js',
            ]);
        })
    );
});

self.addEventListener('fetch', (event: FetchEvent) => {
    event.respondWith(
        caches.match(event.request, { ignoreVary: true }).then((response) => {
            if (response) {
                // Update cache in background
                event.waitUntil(caches.open(NAME).then((cache) => cache.add(event.request)));
                return response;
            } else {
                console.log('Not cached', event.request);
                return fetch(event.request);
            }
        })
    );
});
