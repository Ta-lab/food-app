export const saveOfflineData = (data) => {
    const request = indexedDB.open('foodAppDB', 1);
  
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
      }
    };
  
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction('syncQueue', 'readwrite');
      const store = transaction.objectStore('syncQueue');
      store.add(data);
    };
  
    request.onerror = (error) => {
      console.error('IndexedDB error:', error);
    };
  };
  
  export const syncDataWithServer = () => {
    const request = indexedDB.open('foodAppDB', 1);
  
    request.onsuccess = async (event) => {
      const db = event.target.result;
      const transaction = db.transaction('syncQueue', 'readonly');
      const store = transaction.objectStore('syncQueue');
      const data = store.getAll();
  
      data.onsuccess = async () => {
        const changes = data.result;
        if (changes.length > 0) {
          try {
            const response = await fetch('/api/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ changes }),
            });
            if (response.ok) {
              const clearTransaction = db.transaction('syncQueue', 'readwrite');
              const clearStore = clearTransaction.objectStore('syncQueue');
              clearStore.clear();
            }
          } catch (error) {
            console.error('Sync failed:', error);
          }
        }
      };
    };
  };
  
  window.addEventListener('online', syncDataWithServer);
  