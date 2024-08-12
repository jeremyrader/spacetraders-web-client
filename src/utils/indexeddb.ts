import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  dataStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  };
  stateStore: {
    key: string;
    value: { currentPage: number; };
  };
}

const DB_NAME = 'spacetraders';
const DATA_STORE_NAME = 'dataStore';
const STATE_STORE_NAME = 'stateStore';

let dbPromise: Promise<IDBPDatabase<MyDB>>;

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
    if (!dbPromise) {
      dbPromise = openDB<MyDB>(DB_NAME, 1, {
        upgrade(db, oldVersion, newVersion, transaction) {
          if (!db.objectStoreNames.contains(DATA_STORE_NAME)) {
            db.createObjectStore(DATA_STORE_NAME, { keyPath: 'symbol', autoIncrement: true });
          }
          if (!db.objectStoreNames.contains(STATE_STORE_NAME)) {
            db.createObjectStore(STATE_STORE_NAME);
          }
        },
      });
    }
    return dbPromise;
  };

export const saveData = async (data: any[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(DATA_STORE_NAME, 'readwrite');
  const store = tx.objectStore(DATA_STORE_NAME);
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
};

export const getData = async (): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction(DATA_STORE_NAME, 'readonly');
  const store = tx.objectStore(DATA_STORE_NAME);
  const allData = await store.getAll();
  await tx.done;
  return allData;
};

export const saveState = async (currentPage: number): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STATE_STORE_NAME, 'readwrite');
  const store = tx.objectStore(STATE_STORE_NAME);
  await store.put({ currentPage }, 'state');
  await tx.done;
};

export const getState = async (): Promise<{ currentPage: number; } | null> => {
  const db = await initDB();
  const tx = db.transaction(STATE_STORE_NAME, 'readonly');
  const store = tx.objectStore(STATE_STORE_NAME);
  const state = await store.get('state');
  await tx.done;
  return state || { currentPage: 1 };
};

export const getTimestamp = async (): Promise<number | null> => {
  const timestamp = localStorage.getItem('fetchedDataTimestamp');
  return timestamp ? parseInt(timestamp, 10) : null;
};

export const setTimestamp = async (timestamp: number): Promise<void> => {
  localStorage.setItem('fetchedDataTimestamp', timestamp.toString());
};
