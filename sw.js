// G-Log - Service Worker
// Provides offline support by caching the application shell and CDN libraries.

// bump CACHE_NAME on every release
const CACHE_NAME = 'gresolog-2026-10-10-8';
const APP_SHELL = [
    '/g-resolog.html',
    '/js/resolog/db.js',
    '/js/resolog/model.js',
    '/js/resolog/ui.js',
    '/js/resolog/example.js',
    '/js/resolog/templates.js',
    '/js/resolog/lithology-assets.js',
    '/resources/lithology/clay.svg',

    '/resources/lithology/silt.svg',

    '/resources/lithology/sand.svg',

    '/resources/lithology/gravel.svg',

    '/resources/lithology/peat.svg',

    '/resources/lithology/sandstone.svg',

    '/resources/lithology/siltstone.svg',

    '/resources/lithology/mudstone.svg',

    '/resources/lithology/shale.svg',

    '/resources/lithology/limestone.svg',

    '/resources/lithology/dolostone.svg',

    '/resources/lithology/conglomerate.svg',

    '/resources/lithology/breccia.svg',

    '/resources/lithology/chert.svg',

    '/resources/lithology/coal.svg',

    '/resources/lithology/granite.svg',

    '/resources/lithology/gneiss.svg',

    '/resources/lithology/schist.svg',

    '/resources/lithology/quartzite.svg',

    '/resources/lithology/basalt.svg',

    '/resources/lithology/slate.svg',

    '/resources/lithology/tuff.svg',

    '/resources/lithology/volcanic_breccia.svg',

    '/resources/lithology/quartz.svg',

    '/resources/lithology/topsoil.svg',

    '/resources/lithology/laterite.svg',

    '/resources/lithology/fill.svg',

    '/resources/lithology/weathered_rock.svg',

    '/resources/lithology/core_loss.svg',
    '/js/resolog/description-builder.js',
    '/js/resolog/striplog.js',
    '/js/resolog/exports.js',
];

const CDN_LIBS = [
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
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