// G-Resolog - Service Worker
// Provides offline support by caching the application shell and CDN libraries.

// bump CACHE_NAME on every release
const CACHE_NAME = 'gresolog-2026-07-07-2';
const APP_SHELL = [
    '/g-resolog.html',
    '/css/navbar.css',
    '/css/style.css',
    '/footer-styles.css',
    '/js/header-component.js',
    '/footer-component.js',
    '/js/resolog/db.js',
    '/js/resolog/model.js',
    '/js/resolog/ui.js',
    '/js/resolog/description-builder.js',
    '/js/resolog/striplog.js',
    '/js/resolog/exports.js',
];

const CDN_LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js',
    'https://unpkg.com/svg2pdf.js@2.2.3/dist/svg2pdf.umd.min.js',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return Promise.allSettled([
                cache.addAll(APP_SHELL),
                // Cache CDN libs but don't block install on failure
                ...CDN_LIBS.map(url =>
                    cache.add(url).catch(() => {
                        /* CDN offline is non-critical */
                    })
                ),
            ]);
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for app shell, network-first for others
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests and chrome-extension requests
    if (event.request.method !== 'GET') return;
    if (url.protocol === 'chrome-extension:') return;

    // Cache-first strategy for app shell and CDN libs
    const isAppShell = APP_SHELL.some(p => url.pathname.endsWith(p));
    const isCDN = CDN_LIBS.some(cdn => url.href.startsWith(cdn.split('?')[0]));

    if (isAppShell || isCDN) {
        event.respondWith(
            caches.match(event.request).then((cached) => {
                return cached || fetch(event.request).then((response) => {
                    if (response.ok) {
                        const clone = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    }
                    return response;
                });
            })
        );
        return;
    }

    // Network-first strategy for everything else
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});