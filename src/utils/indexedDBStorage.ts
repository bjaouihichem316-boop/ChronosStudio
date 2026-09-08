/**
 * IndexedDB Media Storage — Chronos Studio Stage 9
 *
 * Real file storage using IndexedDB.
 * Provides persistent storage for media artifacts in the browser.
 * Implements IMediaStorage interface.
 */

import { IMediaStorage, StorageReference } from '../types/media';
import { MediaType } from '../types/pipeline';

const DB_NAME = 'chronos-media-storage';
const DB_VERSION = 1;
const STORE_NAME = 'artifacts';

/**
 * IndexedDB-based storage for media artifacts.
 * Provides persistent storage that survives browser restarts.
 */
export class IndexedDBMediaStorage implements IMediaStorage {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // Initialize database lazily
  }

  /**
   * Initialize the IndexedDB database.
   */
  private async initialize(): Promise<void> {
    if (this.db) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store for artifacts
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'path' });
          store.createIndex('projectId', 'projectId', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Store an artifact in IndexedDB.
   */
  async store(
    projectId: string,
    type: MediaType,
    data: ArrayBuffer | Blob,
    filename: string
  ): Promise<StorageReference> {
    await this.initialize();

    // Convert to ArrayBuffer if needed
    let buffer: ArrayBuffer;
    if (data instanceof Blob) {
      buffer = await data.arrayBuffer();
    } else {
      buffer = data;
    }

    // Generate unique path
    const id = `artifact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const path = `indexeddb://${projectId}/${type}/${id}`;

    // Calculate checksum
    const checksum = await this.calculateChecksum(buffer);

    // Store in IndexedDB
    await new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const record = {
        path,
        projectId,
        type,
        filename,
        data: buffer,
        size: buffer.byteLength,
        checksum,
        createdAt: new Date().toISOString(),
      };

      const request = store.add(record);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to store artifact'));
    });

    return {
      provider: 'local',
      path,
      size: buffer.byteLength,
      checksum,
    };
  }

  /**
   * Retrieve an artifact from IndexedDB.
   */
  async retrieve(ref: StorageReference): Promise<ArrayBuffer | null> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(ref.path);

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => reject(new Error('Failed to retrieve artifact'));
    });
  }

  /**
   * Delete an artifact from IndexedDB.
   */
  async delete(ref: StorageReference): Promise<boolean> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(ref.path);

      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Failed to delete artifact'));
    });
  }

  /**
   * Check if an artifact exists in IndexedDB.
   */
  async exists(ref: StorageReference): Promise<boolean> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(ref.path);

      request.onsuccess = () => {
        resolve(request.result !== undefined);
      };

      request.onerror = () => reject(new Error('Failed to check artifact existence'));
    });
  }

  /**
   * Generate a preview (returns same reference for now).
   */
  async generatePreview(ref: StorageReference): Promise<StorageReference | null> {
    // For now, just return the same reference
    // Future: could generate actual thumbnails
    return ref;
  }

  /**
   * Calculate checksum for data integrity.
   */
  private async calculateChecksum(buffer: ArrayBuffer): Promise<string> {
    const view = new Uint8Array(buffer);
    let hash = 0;
    
    // Simple hash for now (could use crypto.subtle.digest for SHA-256)
    for (let i = 0; i < Math.min(view.length, 10000); i++) {
      hash = (hash << 5) - hash + view[i];
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36);
  }

  /**
   * Get storage statistics.
   */
  async getStats(): Promise<{ count: number; totalSize: number }> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const results = request.result;
        let totalSize = 0;
        for (const item of results) {
          totalSize += item.size;
        }
        resolve({
          count: results.length,
          totalSize,
        });
      };

      request.onerror = () => reject(new Error('Failed to get stats'));
    });
  }

  /**
   * Clear all stored artifacts.
   */
  async clear(): Promise<void> {
    await this.initialize();

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear storage'));
    });
  }

  /**
   * Close the database connection.
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.initPromise = null;
    }
  }
}

/**
 * Singleton IndexedDB storage instance.
 */
export const indexedDBStorage = new IndexedDBMediaStorage();
