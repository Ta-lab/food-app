export function saveOfflineChanges(data) {

    console.log("data",data)

    const pendingChanges = JSON.parse(localStorage.getItem('pendingChanges')) || [];
    pendingChanges.push(data); // Append the new change
    localStorage.setItem('pendingChanges', JSON.stringify(pendingChanges));
  
    // Register the sync event in the service worker (if available)
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        console.log("ssd")
      navigator.serviceWorker.ready.then(registration => {
        return registration.sync.register('sync-food-items');
      }).catch(err => {
        console.error('Sync registration failed', err);
      });
    }
  }
  