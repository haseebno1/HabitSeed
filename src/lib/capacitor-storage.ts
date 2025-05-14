/**
 * This file serves as a bridge between the old Capacitor storage API and the new storage adapter pattern.
 * It re-exports all the methods from the Capacitor adapter to maintain backward compatibility.
 * In the future, code should import directly from the new storage modules.
 */

import { isUsingNativeStorage } from './storage/index';
import { CapacitorAdapter } from './storage/CapacitorAdapter';

// Export the isCapacitorApp utility function
export const isCapacitorApp = isUsingNativeStorage;

// Create a Capacitor adapter instance for direct export
const capacitorAdapter = new CapacitorAdapter();

// Re-export all methods for backward compatibility
export const saveHabit = capacitorAdapter.saveHabit.bind(capacitorAdapter);
export const saveHabits = capacitorAdapter.saveHabits.bind(capacitorAdapter);
export const getAllHabits = capacitorAdapter.getAllHabits.bind(capacitorAdapter);
export const deleteHabit = capacitorAdapter.deleteHabit.bind(capacitorAdapter);

export const saveCompletion = capacitorAdapter.saveCompletion.bind(capacitorAdapter);
export const getCompletion = capacitorAdapter.getCompletion.bind(capacitorAdapter);
export const getAllCompletions = capacitorAdapter.getAllCompletions.bind(capacitorAdapter);
export const clearCompletions = capacitorAdapter.clearCompletions.bind(capacitorAdapter);

export const saveCompletionDetails = capacitorAdapter.saveCompletionDetails.bind(capacitorAdapter);
export const getCompletionDetails = capacitorAdapter.getCompletionDetails.bind(capacitorAdapter);
export const getAllCompletionDetails = capacitorAdapter.getAllCompletionDetails.bind(capacitorAdapter);
export const clearCompletionDetails = capacitorAdapter.clearCompletionDetails.bind(capacitorAdapter);

export const saveSettings = capacitorAdapter.saveSettings.bind(capacitorAdapter);
export const getSettings = capacitorAdapter.getSettings.bind(capacitorAdapter);

export const exportAllData = capacitorAdapter.exportAllData.bind(capacitorAdapter);
export const importAllData = capacitorAdapter.importAllData.bind(capacitorAdapter);
export const migrateFromLocalStorage = capacitorAdapter.migrateFromLocalStorage.bind(capacitorAdapter);

// Create the adapter factory for direct export
export const createCapacitorStorageAdapter = () => {
  return capacitorAdapter;
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
  getAllCompletionDetails,
  clearCompletionDetails,
  saveSettings,
  getSettings,
  exportAllData,
  importAllData,
  migrateFromLocalStorage,
  isCapacitorApp,
  createCapacitorStorageAdapter
}; 