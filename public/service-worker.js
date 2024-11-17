const CACHE_NAME = 'app-cache-v2';
const urlsToCache = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/manifest.json',
    '/static/js/bundle.js',
    '/offline.html',
];

// Install event: Cache assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate event: Clear old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Old cache cleared:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event: Serve cached content or fallback
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return (
                response ||
                fetch(event.request).catch(() => {
                    if (event.request.mode === 'navigate') {
                        return caches.match('/offline.html');
                    }
                })
            );
        })
    );
});
