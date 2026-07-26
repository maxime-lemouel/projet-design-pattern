export interface StorageStrategy {
  get<Value>(key: string): Promise<Value | undefined>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class VolatileStorage implements StorageStrategy {
  private readonly store = new Map<string, unknown>();

  async get<Value>(key: string): Promise<Value | undefined> {
    return this.store.get(key) as Value | undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export class LocalStorageAdapter implements StorageStrategy {
  constructor(private readonly prefix = 'app:') {}

  async get<Value>(key: string): Promise<Value | undefined> {
    const raw = localStorage.getItem(this.prefix + key);
    return raw === null ? undefined : (JSON.parse(raw) as Value);
  }

  async set(key: string, value: unknown): Promise<void> {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(this.prefix + key);
  }

  async clear(): Promise<void> {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    }
  }
}

export class IndexedDBStorage implements StorageStrategy {
  private readonly storeName = 'keyval';
  private dbPromise: Promise<IDBDatabase> | undefined;

  constructor(private readonly dbName = 'app-store') {}

  private openDb(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, 1);

        request.onupgradeneeded = () => {
          request.result.createObjectStore(this.storeName);
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error as Error);
      });
    }

    return this.dbPromise;
  }

  async get<Value>(key: string): Promise<Value | undefined> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const store = db.transaction(this.storeName, 'readonly').objectStore(this.storeName);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result as Value | undefined);
      request.onerror = () => reject(request.error as Error);
    });
  }

  async set(key: string, value: unknown): Promise<void> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
      const request = store.put(value, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const store = db.transaction(this.storeName, 'readwrite').objectStore(this.storeName);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error as Error);
    });
  }
}
