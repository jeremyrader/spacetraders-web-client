import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  dataStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  };
  stateStore: {
    key: string;
    value: { 
      currentSystemsPage: number;
    };
  };
  waypointStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  }
}

const DB_NAME = 'spacetraders';
const DATA_STORE_NAME = 'dataStore';
const STATE_STORE_NAME = 'stateStore';
const WAYPOINT_STORE_NAME = 'waypointStore'

type StoreName = 'dataStore' | 'stateStore' | 'waypointStore' 

let dbPromise: Promise<IDBPDatabase<MyDB>>;

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, 3, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(DATA_STORE_NAME)) {
          db.createObjectStore(DATA_STORE_NAME, { keyPath: 'symbol', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(WAYPOINT_STORE_NAME)) {
          db.createObjectStore(WAYPOINT_STORE_NAME, { keyPath: 'symbol', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(STATE_STORE_NAME)) {
          db.createObjectStore(STATE_STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
};

export const saveData = async (storeName: StoreName, data: any[]): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readwrite');
  const store = tx.objectStore(storeName);
  for (const item of data) {
    await store.put(item);
  }
  await tx.done;
};

export const getData = async (storeName: StoreName): Promise<any[]> => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const allData = await store.getAll();
  await tx.done;
  return allData;
};

export const getObject = async (storeName: StoreName, key: string): Promise<any> => {
  const db = await initDB();
  const tx = db.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const allData = await store.get(key)
  await tx.done;
  return allData;
};

export const saveState = async (currentSystemsPage: number): Promise<void> => {
  const db = await initDB();
  const tx = db.transaction(STATE_STORE_NAME, 'readwrite');
  const store = tx.objectStore(STATE_STORE_NAME);
  await store.put(
    { 
      currentSystemsPage: currentSystemsPage,
    },
    'state'
  );
  await tx.done;
};

export const getState = async (): Promise<{ 
  currentSystemsPage: number;
} | null> => {
  const db = await initDB();
  const tx = db.transaction(STATE_STORE_NAME, 'readonly');
  const store = tx.objectStore(STATE_STORE_NAME);
  const state = await store.get('state');
  await tx.done;
  return state || { 
    currentSystemsPage: 1,
  };
};

export const getTimestamp = async (): Promise<number | null> => {
  const timestamp = window.localStorage.getItem('fetchedDataTimestamp');
  return timestamp ? parseInt(timestamp, 10) : null;
};

export const setTimestamp = async (timestamp: number): Promise<void> => {
  window.localStorage.setItem('fetchedDataTimestamp', timestamp.toString());
};
