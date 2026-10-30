/**
 * GrowAI Progressive Web App Service Worker
 *
 * Scoped Offline Strategy:
 * 1. Precaches app shell assets, icons, manifest, and offline fallback.
 * 2. Caches public botanical library and educational content using stale-while-revalidate / network-first.
 * 3. STRICTLY EXCLUDES:
 *    - /api/ai-doctor (multimodal vision requires live server + Gemini API)
 *    - /api/* (dynamic GraphQL and database APIs)
 *    - /auth/* (authentication callbacks, sign-in, sign-out)
 *    - /admin/* (Payload CMS administrative management)
 *    - Non-GET mutation requests (POST, PUT, DELETE, PATCH)
 * 4. Listens for CLEAR_USER_CACHE to safely purge sensitive data upon user sign out.
 */

const CACHE_VERSION = 'growai-v1.1';
const STATIC_CACHE = `growai-static-${CACHE_VERSION}`;
const PUBLIC_CATALOG_CACHE = `growai-public-catalog-${CACHE_VERSION}`;
const PAGES_CACHE = `growai-pages-${CACHE_VERSION}`;

// Core static assets to precache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/app',
  '/app/plants',
  '/app/learn',
  '/offline.html',
  '/manifest.json',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-maskable-192.png',
  '/icons/icon-maskable-512.png',
];

// URLs/patterns that must NEVER be cached by the service worker
const NEVER_CACHE_PATTERNS = [
  /\/api\/ai-doctor/,
  /\/api\//,
  /\/auth\//,
  /\/admin/,
  /\/_next\/webpack-hmr/,
  /\/auth\/callback/,
];

// Helper to determine if a request should be bypassed
function shouldBypassCache(url, method) {
  // Only cache idempotent GET requests
  if (method !== 'GET') return true;

  // Check URL against forbidden patterns
  for (const pattern of NEVER_CACHE_PATTERNS) {
    if (pattern.test(url.pathname)) {
      return true;
    }
  }

  // Bypass chrome-extension and non-http(s)
  if (!url.protocol.startsWith('http')) return true;

  return false;
}

// Install Event: precache essential shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Use catch on each entry so one missing dev file won't fail the whole install
      return Promise.allSettled(
        PRECACHE_ASSETS.map((asset) =>
          fetch(asset, { cache: 'no-cache' })
            .then((res) => {
              if (res.ok) return cache.put(asset, res);
              return null;
            })
            .catch(() => null)
        )
      );
    })
  );
  // Do not automatically force skipWaiting; allow the client UI to coordinate updates
});

// Activate Event: prune old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      const activeCaches = [STATIC_CACHE, PUBLIC_CATALOG_CACHE, PAGES_CACHE];
      return Promise.all(
        cacheNames.map((name) => {
          if (!activeCaches.includes(name) && name.startsWith('growai-')) {
            console.log('[SW] Pruning stale cache:', name);
            return caches.delete(name);
          }
          return null;
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: handle requests with appropriate caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Bypass check
  if (shouldBypassCache(url, request.method)) {
    return; // Pass through directly to network
  }

  // 2. Static Assets (Images, Icons, Next.js static bundles, fonts)
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2|woff|ttf|css|js)$/)
  ) {
    event.respondWith(
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            // Stale-while-revalidate for background updates
            fetch(request)
              .then((networkRes) => {
                if (networkRes && networkRes.ok) {
                  cache.put(request, networkRes);
                }
              })
              .catch(() => {});
            return cachedResponse;
          }

          // Not in cache, fetch from network and cache
          return fetch(request).then((networkRes) => {
            if (networkRes && networkRes.ok) {
              cache.put(request, networkRes.clone());
            }
            return networkRes;
          });
        });
      })
    );
    return;
  }

  // 3. Public Botanical Catalog & Educational Guides (Network-first with cache fallback)
  if (
    url.pathname.startsWith('/app/plants') ||
    url.pathname.startsWith('/app/learn')
  ) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(PUBLIC_CATALOG_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Network failed, try catalog cache
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Fallback to offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Offline: Content unavailable', { status: 503 });
          });
        })
    );
    return;
  }

  // 4. HTML Navigation Requests for App Shell (Network-first with offline fallback)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const clone = networkResponse.clone();
            caches.open(PAGES_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return branded offline page
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }
});

// Message Listener: handle commands from client app
self.addEventListener('message', (event) => {
  if (!event.data) return;

  // Command to activate waiting worker immediately
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Command to clear private/user caches on sign out
  if (event.data.type === 'CLEAR_USER_CACHE') {
    event.waitUntil(
      caches.delete(PAGES_CACHE).then(() => {
        console.log('[SW] Cleared private user pages cache upon sign-out');
      })
    );
  }
});
