const CACHE_NAME = 'food-app-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/main.js',
  '/static/css/main.css',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});


//Sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-food-items') {
    event.waitUntil(syncFoodItems());
  }
});

async function syncFoodItems() {
  // Fetch locally stored changes (this could be in IndexedDB)
  const changes = await getChangesFromLocalStorage(); // Assume you have a function for this

  try {
    // Send the changes to the backend
    const response = await fetch('/api/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ changes }),
    });

    if (response.ok) {
      // After a successful sync, clear the locally stored changes
      await clearLocalChanges(); // Function to clear the local changes
    } else {
      console.error('Failed to sync changes');
    }
  } catch (err) {
    console.error('Error syncing food items:', err);
  }
}

// Helper functions
async function getChangesFromLocalStorage() {
  // Retrieve stored changes (could be in IndexedDB or LocalStorage)
  return JSON.parse(localStorage.getItem('pendingChanges')) || [];
}

async function clearLocalChanges() {
  localStorage.removeItem('pendingChanges');
}
