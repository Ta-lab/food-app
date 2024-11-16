import { openDB } from 'idb';

const dbPromise = openDB('food-management', 1, {
  upgrade(db) {
    db.createObjectStore('foods', { keyPath: 'id' });
  },
});

export const saveFoodOffline = async (food) => {
  const db = await dbPromise;
  await db.put('foods', food);
};

export const getOfflineFoods = async () => {
  const db = await dbPromise;
  return db.getAll('foods');
};
