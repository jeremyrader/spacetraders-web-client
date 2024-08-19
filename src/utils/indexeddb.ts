import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface MyDB extends DBSchema {
  stateStore: {
    key: string;
    value: { 
      currentSystemsPage: number;
    };
  };
  systemsStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  };
  waypointStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  };
  shipStore: {
    key: string;
    value: { symbol?: string; [key: string]: any };
  };
}

const DB_NAME = 'spacetraders';
const STATE_STORE = 'stateStore';
const SYSTEMS_STORE = 'systemsStore';
const WAYPOINT_STORE = 'waypointStore'
const SHIP_STORE = 'shipStore'

type StoreName = 
  typeof STATE_STORE | 
  typeof SYSTEMS_STORE | 
  typeof WAYPOINT_STORE |
  typeof SHIP_STORE

let dbPromise: Promise<IDBPDatabase<MyDB>>;

export const initDB = async (): Promise<IDBPDatabase<MyDB>> => {
  if (!dbPromise) {
    dbPromise = openDB<MyDB>(DB_NAME, 8, {
      upgrade(db, oldVersion, newVersion, transaction) {
        if (!db.objectStoreNames.contains(STATE_STORE)) {
          db.createObjectStore(STATE_STORE);
        }
        if (!db.objectStoreNames.contains(SYSTEMS_STORE)) {
          db.createObjectStore(SYSTEMS_STORE, { keyPath: 'symbol', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(WAYPOINT_STORE)) {
          db.createObjectStore(WAYPOINT_STORE, { keyPath: 'symbol', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains(SHIP_STORE)) {
          db.createObjectStore(SHIP_STORE, { keyPath: 'symbol', autoIncrement: true });
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
  const tx = db.transaction(STATE_STORE, 'readwrite');
  const store = tx.objectStore(STATE_STORE);
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
  const tx = db.transaction(STATE_STORE, 'readonly');
  const store = tx.objectStore(STATE_STORE);
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
