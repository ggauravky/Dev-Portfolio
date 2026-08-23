// ============================================================
// Gaurav Kumar Yadav Portfolio — Production Service Worker
// Copyright (c) 2026 Gaurav Kumar Yadav. All Rights Reserved.
// ============================================================

'use strict';

const CACHE_NAME = 'portfolio-offline-v3';

// Minimal critical assets required to show the offline page
const PRECACHE_URLS = [
  '/offline.html',
  '/favicon.svg',
];

// Patterns that MUST NOT be cached and must always go directly to network
const NETWORK_ONLY_PATTERNS = [
  /^\/api\//,
  /^\/llms(-full)?\.txt$/,
  /^\/openapi\.json$/,
  /^\/.well-known\//,
  /^\/robots\.txt$/,
  /^\/sitemap\.xml$/,
  /^\/umami\//,
];

// ─────────────────────────────────────────────────────────────
// INSTALL: Precache offline page and activate immediately
// ─────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.error('[SW] Install precache failed:', err);
      })
  );
});

// ─────────────────────────────────────────────────────────────
// ACTIVATE: Clean up stale caches and take immediate control
// ─────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((staleName) => {
              console.log('[SW] Deleting old cache:', staleName);
              return caches.delete(staleName);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// ─────────────────────────────────────────────────────────────
// FETCH: Route-specific handling
// ─────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Only handle GET requests
  if (request.method !== 'GET') return;

  // 2. Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // 3. Network-only: APIs, agent discovery, analytics
  if (NETWORK_ONLY_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    return;
  }

  // 4. Navigation requests (HTML documents)
  // Network first -> on ANY network failure -> return cached /offline.html
  // Valid HTTP status codes (200, 404, 500) are returned directly AS-IS.
  const isNavigation =
    request.mode === 'navigate' ||
    request.destination === 'document' ||
    (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));

  if (isNavigation) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          return networkResponse;
        })
        .catch(async (error) => {
          console.warn('[SW] Navigation network fetch failed, serving offline page:', error);
          const cachedOffline = await caches.match('/offline.html');
          if (cachedOffline) {
            return cachedOffline;
          }
          return new Response(
            '<!doctype html><html lang="en"><head><meta charset="UTF-8"><title>You\'re Offline</title></head><body style="background:#070708;color:#fff;font-family:sans-serif;padding:2rem;text-align:center"><h1>You\'re Offline</h1><p>Check your internet connection and <a href="/" style="color:#c5f82a">try again</a>.</p></body></html>',
            {
              status: 200,
              headers: { 'Content-Type': 'text/html; charset=utf-8' },
            }
          );
        })
    );
    return;
  }

  // 5. Static assets (JS chunks, CSS, images, fonts)
  // Cache-first with network fallback
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname === '/favicon.svg' ||
    url.pathname === '/manifest.json' ||
    /\.(js|css|png|jpg|jpeg|webp|avif|svg|woff2?|ttf|ico)$/.test(url.pathname);

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache).catch(() => {});
              });
            }
            return networkResponse;
          })
          .catch(() => {
            return new Response('', { status: 503, statusText: 'Service Unavailable' });
          });
      })
    );
    return;
  }
});
