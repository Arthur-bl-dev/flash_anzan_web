const version = 'v0.12.0';
var CACHE_NAME = `fa-cache-${version}`;
var urlsToCache = [
    './assets/bootstrap@5.0.0-beta1.css',
    './assets/index.css',
    './assets/bootstrap@5.0.0-beta1.bundle.min.js',
    './assets/howler_2_2_1.min.js',
    './lib/shortcut.js',
    './lib/complexity_map.js',
    './assets/globals.js',
    './assets/button_events.js',
    './assets/index.js',
    './font/ABACUS2.woff',
    './sound/answer.wav',
    './sound/beep.wav',
    './sound/correct.wav',
    './sound/incorrect.wav',
    './sound/silence.wav',
    './sound/tick.wav',
    './index.html',
];

self.addEventListener('install', function (event) {
    // Perform install steps
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function (cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                // IMPORTANT:Clone the request. A request is a stream and
                // can only be consumed once. Since we are consuming this
                // once by cache and once by the browser for fetch, we need
                // to clone the response.
                var fetchRequest = event.request.clone();

                return fetch(fetchRequest).then(
                    function(response) {
                        // Check if we received a valid response
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // IMPORTANT:Clone the response. A response is a stream
                        // and because we want the browser to consume the response
                        // as well as the cache consuming the response, we need
                        // to clone it so we have two streams.
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', function(event) {
    var cacheAllowlist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheAllowlist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});