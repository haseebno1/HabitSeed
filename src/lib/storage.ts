/**
 * This file serves as a bridge between the old storage API and the new storage adapter pattern.
 * It re-exports all the methods from the new storage adapter to maintain backward compatibility.
 * In the future, code should import directly from the new storage modules.
 */

import storageAdapter, { 
  getStorageType, 
  isUsingNativeStorage,
  StorageError
} from './storage/index';

// Re-export the StorageError class
export { StorageError };

// Re-export the storage adapter methods for backward compatibility
export const saveHabit = storageAdapter.saveHabit.bind(storageAdapter);
export const saveHabits = storageAdapter.saveHabits.bind(storageAdapter);
export const getAllHabits = storageAdapter.getAllHabits.bind(storageAdapter);
export const deleteHabit = storageAdapter.deleteHabit.bind(storageAdapter);

export const saveCompletion = storageAdapter.saveCompletion.bind(storageAdapter);
export const getCompletion = storageAdapter.getCompletion.bind(storageAdapter);
export const getAllCompletions = storageAdapter.getAllCompletions.bind(storageAdapter);
export const clearCompletions = storageAdapter.clearCompletions.bind(storageAdapter);

export const saveCompletionDetails = storageAdapter.saveCompletionDetails.bind(storageAdapter);
export const getCompletionDetails = storageAdapter.getCompletionDetails.bind(storageAdapter);
export const getCompletionsForDateRange = storageAdapter.getCompletionsForDateRange.bind(storageAdapter);
export const getAllCompletionDetails = storageAdapter.getAllCompletionDetails.bind(storageAdapter);
export const clearCompletionDetails = storageAdapter.clearCompletionDetails.bind(storageAdapter);

export const saveSettings = storageAdapter.saveSettings.bind(storageAdapter);
export const getSettings = storageAdapter.getSettings.bind(storageAdapter);

export const exportAllData = storageAdapter.exportAllData.bind(storageAdapter);
export const importAllData = storageAdapter.importAllData.bind(storageAdapter);
export const migrateFromLocalStorage = storageAdapter.migrateFromLocalStorage.bind(storageAdapter);

export const closeDbConnection = storageAdapter.closeConnection.bind(storageAdapter);

// Utility functions
export const isIndexedDBSupported = (): boolean => {
  return getStorageType() === 'indexeddb';
};

export const isCapacitorApp = (): boolean => {
  return isUsingNativeStorage();
};

// Default export for backward compatibility
export default {
  saveHabit,
  saveHabits,
  getAllHabits,
  deleteHabit,
  saveCompletion,
  getCompletion,
  getAllCompletions,
  clearCompletions,
  saveCompletionDetails,
  getCompletionDetails,
  getCompletionsForDateRange,
  getAllCompletionDetails,
  clearCompletionDetails,
  saveSettings,
  getSettings,
  exportAllData,
  importAllData,
  migrateFromLocalStorage,
  closeDbConnection,
  isIndexedDBSupported,
  isCapacitorApp
}; 