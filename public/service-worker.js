// Service Worker for caching audio files and enabling offline functionality
const CACHE_NAME = 'learn-chinese-audio-v1';
const AUDIO_CACHE_NAME = 'learn-chinese-audio-files-v1';

// Files to cache immediately on install (will be relative to service worker scope)
const STATIC_ASSETS = [
  './',
  './index.html',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle audio files specially
  if (request.url.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            console.log('[Service Worker] Serving audio from cache:', request.url);
            return cachedResponse;
          }

          // If not in cache, fetch from network and cache it
          return fetch(request).then((networkResponse) => {
            // Clone the response because it can only be consumed once
            const responseToCache = networkResponse.clone();
            cache.put(request, responseToCache);
            console.log('[Service Worker] Cached audio file:', request.url);
            return networkResponse;
          }).catch((error) => {
            console.error('[Service Worker] Fetch failed for audio:', request.url, error);
            throw error;
          });
        });
      })
    );
    return;
  }

  // For non-audio files, use cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-GET requests or non-ok responses
        if (request.method !== 'GET' || !response.ok) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Message handler for preloading audio files
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'PRELOAD_AUDIO') {
    const audioUrls = event.data.urls;
    console.log('[Service Worker] Preloading', audioUrls.length, 'audio files...');
    
    event.waitUntil(
      caches.open(AUDIO_CACHE_NAME).then((cache) => {
        return Promise.all(
          audioUrls.map((url) => {
            return fetch(url)
              .then((response) => {
                if (response.ok) {
                  return cache.put(url, response);
                }
              })
              .catch((error) => {
                console.warn('[Service Worker] Failed to preload audio:', url, error);
              });
          })
        ).then(() => {
          console.log('[Service Worker] Audio preloading complete');
          // Notify clients that preloading is complete
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'PRELOAD_COMPLETE',
                count: audioUrls.length
              });
            });
          });
        });
      })
    );
  }
});
