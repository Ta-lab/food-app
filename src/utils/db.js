import { openDB } from 'idb';

export const getDB = async () => {
  return await openDB('pwa-db-food', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('unsynced-data-food')) {
        db.createObjectStore('unsynced-data-food', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};
