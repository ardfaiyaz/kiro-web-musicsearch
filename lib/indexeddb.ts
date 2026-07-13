/**
 * IndexedDB adapter with Promise API for favorites, listening history,
 * and collections. Falls back to localStorage on error.
 */

const DB_NAME = "music-search-db";
const DB_VERSION = 1;

// Store names
export const STORES = {
  FAVORITES: "favorites",
  HISTORY: "history",
  COLLECTIONS: "collections",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;
let dbInitPromise: Promise<IDBDatabase> | null = null;

/**
 * Open or get the existing IndexedDB database instance.
 */
function openDatabase(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance);
  if (dbInitPromise) return dbInitPromise;

  dbInitPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB not available"));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      dbInitPromise = null;
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;

      // Handle connection close (e.g., version upgrade from another tab)
      dbInstance.onclose = () => {
        dbInstance = null;
        dbInitPromise = null;
      };

      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object stores
      if (!db.objectStoreNames.contains(STORES.FAVORITES)) {
        db.createObjectStore(STORES.FAVORITES, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORES.HISTORY)) {
        const historyStore = db.createObjectStore(STORES.HISTORY, {
          keyPath: "id",
        });
        historyStore.createIndex("timestamp", "timestamp", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.COLLECTIONS)) {
        db.createObjectStore(STORES.COLLECTIONS, { keyPath: "id" });
      }
    };
  });

  return dbInitPromise;
}

/**
 * Get a single item from an IndexedDB store by key.
 * Falls back to localStorage on error.
 */
export async function getItem<T>(
  store: StoreName,
  key: string | number
): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise<T | null>((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const objectStore = tx.objectStore(store);
      const request = objectStore.get(key);

      request.onsuccess = () => resolve(request.result?.data ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    return getFromLocalStorage<T>(store, String(key));
  }
}

/**
 * Get all items from an IndexedDB store.
 * Falls back to localStorage on error.
 */
export async function getAllItems<T>(store: StoreName): Promise<T[]> {
  try {
    const db = await openDatabase();
    return new Promise<T[]>((resolve, reject) => {
      const tx = db.transaction(store, "readonly");
      const objectStore = tx.objectStore(store);
      const request = objectStore.getAll();

      request.onsuccess = () => {
        const results = request.result.map(
          (entry: { id: string | number; data: T }) => entry.data
        );
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    return getAllFromLocalStorage<T>(store);
  }
}

/**
 * Set (put) an item in an IndexedDB store.
 * Falls back to localStorage on error.
 */
export async function setItem<T>(
  store: StoreName,
  key: string | number,
  data: T
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const objectStore = tx.objectStore(store);
      const request = objectStore.put({ id: key, data, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    setToLocalStorage(store, String(key), data);
  }
}

/**
 * Delete an item from an IndexedDB store by key.
 * Falls back to localStorage on error.
 */
export async function deleteItem(
  store: StoreName,
  key: string | number
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const objectStore = tx.objectStore(store);
      const request = objectStore.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback to localStorage
    deleteFromLocalStorage(store, String(key));
  }
}

/**
 * Clear all items from a store.
 */
export async function clearStore(store: StoreName): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const objectStore = tx.objectStore(store);
      const request = objectStore.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Fallback: clear localStorage entries for this store
    if (typeof window !== "undefined") {
      localStorage.removeItem(`idb-fallback-${store}`);
    }
  }
}

/**
 * Bulk put items into a store (efficient for migrations).
 */
export async function bulkPut<T>(
  store: StoreName,
  items: Array<{ key: string | number; data: T }>
): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, "readwrite");
      const objectStore = tx.objectStore(store);

      for (const item of items) {
        objectStore.put({ id: item.key, data: item.data, timestamp: Date.now() });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Fallback to localStorage
    for (const item of items) {
      setToLocalStorage(store, String(item.key), item.data);
    }
  }
}

// --- localStorage fallback helpers ---

function getFromLocalStorage<T>(store: string, key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const storeData = localStorage.getItem(`idb-fallback-${store}`);
    if (!storeData) return null;
    const parsed = JSON.parse(storeData);
    return parsed[key] ?? null;
  } catch {
    return null;
  }
}

function getAllFromLocalStorage<T>(store: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const storeData = localStorage.getItem(`idb-fallback-${store}`);
    if (!storeData) return [];
    const parsed = JSON.parse(storeData);
    return Object.values(parsed) as T[];
  } catch {
    return [];
  }
}

function setToLocalStorage<T>(store: string, key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const storeData = localStorage.getItem(`idb-fallback-${store}`);
    const parsed = storeData ? JSON.parse(storeData) : {};
    parsed[key] = data;
    localStorage.setItem(`idb-fallback-${store}`, JSON.stringify(parsed));
  } catch {
    // Silently handle quota exceeded
  }
}

function deleteFromLocalStorage(store: string, key: string): void {
  if (typeof window === "undefined") return;
  try {
    const storeData = localStorage.getItem(`idb-fallback-${store}`);
    if (!storeData) return;
    const parsed = JSON.parse(storeData);
    delete parsed[key];
    localStorage.setItem(`idb-fallback-${store}`, JSON.stringify(parsed));
  } catch {
    // Silently handle errors
  }
}
