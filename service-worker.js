const CACHE_NAME = 'dino-game-v1';

// Get base path dynamically
const getBasePath = () => {
  const location = self.location;
  const isVSCode = location.hostname.includes('vscode.dev') || location.hostname.includes('vscode.com');

  if (isVSCode) {
    const pathParts = location.pathname.split('/').filter(p => p);
    if (pathParts.includes('github')) {
      const githubIndex = pathParts.indexOf('github');
      return '/' + pathParts.slice(0, githubIndex + 3).join('/');
    }
    return '/t-mobile';
  }

  return '/t-mobile';
};

const BASE_PATH = getBasePath();

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/style.css`,
  `${BASE_PATH}/game.js`,
  `${BASE_PATH}/config.js`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/icon-192.png`,
  `${BASE_PATH}/icon-512.png`
];

// Install service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Fetch from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
      )
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
