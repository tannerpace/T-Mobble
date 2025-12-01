const CACHE_NAME = 'dino-game-v118';


// Get base path dynamically
const getBasePath = () => {
  const location = self.location;

  // Local development (localhost or 127.0.0.1)
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return '';
  }

  const isVSCode = location.hostname.includes('vscode.dev') || location.hostname.includes('vscode.com');

  if (isVSCode) {
    const pathParts = location.pathname.split('/').filter(p => p);
    if (pathParts.includes('github')) {
      const githubIndex = pathParts.indexOf('github');
      return '/' + pathParts.slice(0, githubIndex + 3).join('/');
    }
    return '/T-Mobble';
  }

  return '/T-Mobble';
};

const BASE_PATH = getBasePath();

const urlsToCache = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/public/index.html`,
  `${BASE_PATH}/public/style.css`,
  `${BASE_PATH}/public/manifest.json`,
  `${BASE_PATH}/src/main.js`,
  `${BASE_PATH}/src/game/Game.js`,
  `${BASE_PATH}/src/game/Renderer.js`,
  `${BASE_PATH}/src/game/InputHandler.js`,
  `${BASE_PATH}/src/entities/Dino.js`,
  `${BASE_PATH}/src/entities/Obstacle.js`,
  `${BASE_PATH}/src/entities/Cloud.js`,
  `${BASE_PATH}/src/entities/PowerUp.js`,
  `${BASE_PATH}/src/entities/Bullet.js`,
  `${BASE_PATH}/src/utils/AssetManager.js`,
  `${BASE_PATH}/src/utils/ScoreManager.js`,
  `${BASE_PATH}/src/utils/collision.js`,
  `${BASE_PATH}/assets/images/trex.png`,
  `${BASE_PATH}/assets/images/palm.png`,
  `${BASE_PATH}/assets/audio/pop.m4a`,
  `${BASE_PATH}/assets/audio/yumyum.m4a`,
  `${BASE_PATH}/assets/audio/yeehaw.m4a`,
  `${BASE_PATH}/assets/audio/pew.m4a`,
  `${BASE_PATH}/assets/audio/laserbuz.m4a`,
  `${BASE_PATH}/assets/audio/whip.m4a`,
  `${BASE_PATH}/assets/icons/icon-192.png`,
  `${BASE_PATH}/assets/icons/icon-512.png`,
  `${BASE_PATH}/config.js`
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
