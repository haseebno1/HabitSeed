import { StorageAdapter, StorageError } from './StorageAdapter';
import { StorageFactory } from './StorageFactory';

// Re-export the interfaces and classes for convenience
export type { StorageAdapter };
export { StorageError, StorageFactory };

// Export a default instance of the storage adapter
const storageAdapter = StorageFactory.getAdapter();

// Utility function to check the storage type
export const getStorageType = (): 'capacitor' | 'indexeddb' | 'localstorage' => {
  return StorageFactory.getAdapterType();
};

// Utility function to check if we're using a mobile native storage
export const isUsingNativeStorage = (): boolean => {
  return getStorageType() === 'capacitor';
};

// Export convenience functions
export default storageAdapter; 