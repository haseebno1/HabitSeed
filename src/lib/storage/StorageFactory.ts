import { StorageAdapter } from './StorageAdapter';
import { IndexedDBAdapter } from './IndexedDBAdapter';
import { CapacitorAdapter } from './CapacitorAdapter';
import { LocalStorageAdapter } from './LocalStorageAdapter';

/**
 * StorageFactory is responsible for creating the appropriate storage adapter
 * based on the runtime environment and platform capabilities.
 */
export class StorageFactory {
  private static instance: StorageAdapter | null = null;
  
  /**
   * Get the appropriate storage adapter instance.
   * Follows this priority:
   * 1. Capacitor (for native mobile apps)
   * 2. IndexedDB (for modern browsers)
   * 3. LocalStorage (fallback)
   */
  static getAdapter(): StorageAdapter {
    if (this.instance !== null) {
      return this.instance;
    }
    
    // Try Capacitor first (for mobile apps)
    const capacitorAdapter = new CapacitorAdapter();
    if (capacitorAdapter.isSupported()) {
      console.log('Using Capacitor storage adapter');
      this.instance = capacitorAdapter;
      return this.instance;
    }
    
    // Then try IndexedDB (for modern browsers)
    const indexedDBAdapter = new IndexedDBAdapter();
    if (indexedDBAdapter.isSupported()) {
      console.log('Using IndexedDB storage adapter');
      this.instance = indexedDBAdapter;
      return this.instance;
    }
    
    // Fallback to LocalStorage
    console.log('Using LocalStorage storage adapter (fallback)');
    this.instance = new LocalStorageAdapter();
    return this.instance;
  }
  
  /**
   * Reset the storage adapter instance.
   * Useful for testing or when needing to recreate the adapter.
   */
  static resetAdapter(): void {
    if (this.instance) {
      this.instance.closeConnection();
      this.instance = null;
    }
  }
  
  /**
   * Get the current storage adapter type
   */
  static getAdapterType(): 'capacitor' | 'indexeddb' | 'localstorage' {
    const adapter = this.getAdapter();
    
    if (adapter instanceof CapacitorAdapter) {
      return 'capacitor';
    } else if (adapter instanceof IndexedDBAdapter) {
      return 'indexeddb';
    } else {
      return 'localstorage';
    }
  }
} 