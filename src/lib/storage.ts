import { Habit, HabitExportData } from "@/hooks/useHabits";
import capacitorStorage, { isCapacitorApp } from "./capacitor-storage";

// Database configuration
const DB_NAME = "habitSeedDB";
const DB_VERSION = 1;
const HABITS_STORE = "habits";
const COMPLETIONS_STORE = "completions";
const SETTINGS_STORE = "settings";

// Type for completion records
interface CompletionRecord {
  date: string;
  habitIds: string[];
}

// Open database connection
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => {
      reject(new Error("Failed to open database"));
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Create Habits store
      if (!db.objectStoreNames.contains(HABITS_STORE)) {
        const habitStore = db.createObjectStore(HABITS_STORE, { keyPath: "id" });
        habitStore.createIndex("lastCompleted", "lastCompleted", { unique: false });
      }
      
      // Create Completions store
      if (!db.objectStoreNames.contains(COMPLETIONS_STORE)) {
        const completionsStore = db.createObjectStore(COMPLETIONS_STORE, { keyPath: "date" });
      }
      
      // Create Settings store
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        const settingsStore = db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
      }
    };
  });
};

// Generic function to execute a transaction
const executeTransaction = <T>(
  storeName: string,
  mode: IDBTransactionMode,
  callback: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  return new Promise(async (resolve, reject) => {
    try {
      const db = await openDB();
      const transaction = db.transaction(storeName, mode);
      const store = transaction.objectStore(storeName);
      
      const request = callback(store);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(new Error(`Transaction failed: ${request.error}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
      
      transaction.onerror = () => {
        db.close();
        reject(new Error(`Transaction failed: ${transaction.error}`));
      };
    } catch (error) {
      reject(error);
    }
  });
};

// Habits CRUD operations
export const saveHabit = async (habit: Habit): Promise<void> => {
  await executeTransaction<IDBValidKey>(
    HABITS_STORE,
    "readwrite",
    (store) => store.put(habit)
  );
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(HABITS_STORE, "readwrite");
    const store = transaction.objectStore(HABITS_STORE);
    
    // Clear existing habits first
    store.clear();
    
    // Add all habits
    habits.forEach(habit => {
      store.add(habit);
    });
    
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(new Error(`Failed to save habits: ${transaction.error}`));
      };
    });
  } catch (error) {
    console.error("Error saving habits:", error);
    throw error;
  }
};

export const getAllHabits = async (): Promise<Habit[]> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(HABITS_STORE, "readonly");
      const store = transaction.objectStore(HABITS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get habits: ${request.error}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error getting habits:", error);
    return []; // Fallback to empty array
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  await executeTransaction<undefined>(
    HABITS_STORE,
    "readwrite",
    (store) => store.delete(id)
  );
};

// Completions operations
export const saveCompletion = async (date: string, habitIds: string[]): Promise<void> => {
  const completionRecord: CompletionRecord = { date, habitIds };
  
  await executeTransaction<IDBValidKey>(
    COMPLETIONS_STORE,
    "readwrite",
    (store) => store.put(completionRecord)
  );
};

export const getCompletion = async (date: string): Promise<string[]> => {
  try {
    const result = await executeTransaction<CompletionRecord>(
      COMPLETIONS_STORE,
      "readonly",
      (store) => store.get(date)
    );
    
    return result?.habitIds || [];
  } catch (error) {
    console.error(`Error getting completion for ${date}:`, error);
    return []; // Fallback to empty array
  }
};

export const getAllCompletions = async (): Promise<Record<string, string[]>> => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(COMPLETIONS_STORE, "readonly");
      const store = transaction.objectStore(COMPLETIONS_STORE);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const completions: Record<string, string[]> = {};
        if (request.result) {
          request.result.forEach((record: CompletionRecord) => {
            completions[record.date] = record.habitIds;
          });
        }
        resolve(completions);
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to get completions: ${request.error}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error getting completions:", error);
    return {}; // Fallback to empty object
  }
};

export const clearCompletions = async (): Promise<void> => {
  try {
    const db = await openDB();
    const transaction = db.transaction(COMPLETIONS_STORE, "readwrite");
    const store = transaction.objectStore(COMPLETIONS_STORE);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      
      request.onsuccess = () => {
        resolve();
      };
      
      request.onerror = () => {
        reject(new Error(`Failed to clear completions: ${request.error}`));
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    console.error("Error clearing completions:", error);
    throw error;
  }
};

// Settings operations
export const saveSettings = async (settings: any): Promise<void> => {
  await executeTransaction<IDBValidKey>(
    SETTINGS_STORE,
    "readwrite",
    (store) => store.put({ id: "app-settings", ...settings })
  );
};

export const getSettings = async (): Promise<any> => {
  try {
    const result = await executeTransaction<any>(
      SETTINGS_STORE,
      "readonly",
      (store) => store.get("app-settings")
    );
    
    // Remove the id field before returning
    if (result) {
      const { id, ...settings } = result;
      return settings;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting settings:", error);
    return null;
  }
};

// Data export/import
export const exportAllData = async (): Promise<HabitExportData> => {
  const habits = await getAllHabits();
  const completions = await getAllCompletions();
  
  return {
    habits,
    completions
  };
};

export const importAllData = async (data: HabitExportData): Promise<void> => {
  // Validate data first
  if (!Array.isArray(data.habits)) {
    throw new Error("Invalid habits data format");
  }
  
  try {
    // Clear and save habits
    await saveHabits(data.habits);
    
    // Clear and save completions
    await clearCompletions();
    if (data.completions && typeof data.completions === 'object') {
      for (const [date, habitIds] of Object.entries(data.completions)) {
        await saveCompletion(date, habitIds);
      }
    }
  } catch (error) {
    console.error("Error importing data:", error);
    throw new Error("Failed to import data");
  }
};

// Migration function from localStorage to IndexedDB
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    let migrated = false;
    
    // Migrate habits
    const habitData = localStorage.getItem("habits");
    if (habitData) {
      try {
        const habits = JSON.parse(habitData);
        if (Array.isArray(habits) && habits.length > 0) {
          await saveHabits(habits);
          migrated = true;
        }
      } catch (e) {
        console.error("Error parsing habits from localStorage:", e);
      }
    }
    
    // Migrate completions
    const completions: Record<string, string[]> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('completions_')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const date = key.replace('completions_', '');
            const habitIds = JSON.parse(value);
            
            if (Array.isArray(habitIds)) {
              completions[date] = habitIds;
              await saveCompletion(date, habitIds);
              migrated = true;
            }
          }
        } catch (e) {
          console.error(`Error migrating completion ${key}:`, e);
        }
      }
    }
    
    // Migrate settings
    const settingsData = localStorage.getItem('habit-seed-settings');
    if (settingsData) {
      try {
        const settings = JSON.parse(settingsData);
        await saveSettings(settings);
        migrated = true;
      } catch (e) {
        console.error("Error parsing settings from localStorage:", e);
      }
    }
    
    return migrated;
  } catch (error) {
    console.error("Migration failed:", error);
    return false;
  }
};

// Check if IndexedDB is supported
export const isIndexedDBSupported = (): boolean => {
  return typeof window !== 'undefined' && 'indexedDB' in window;
};

// Create the appropriate storage adapter based on environment
export const createStorageAdapter = () => {
  // First, check if we're running in a Capacitor app
  if (isCapacitorApp()) {
    console.log("Using Capacitor storage adapter");
    return capacitorStorage;
  }
  
  // If not in Capacitor, check if IndexedDB is available
  if (isIndexedDBSupported()) {
    console.log("Using IndexedDB storage adapter");
    return {
      saveHabit,
      saveHabits,
      getAllHabits,
      deleteHabit,
      saveCompletion,
      getCompletion,
      getAllCompletions,
      clearCompletions,
      saveSettings,
      getSettings,
      exportAllData,
      importAllData,
      migrateFromLocalStorage,
      isUsingIndexedDB: true
    };
  } else {
    // Return localStorage fallback methods if nothing else is available
    console.warn("Using localStorage fallback (not recommended)");
    return {
      // Implement localStorage fallbacks here if needed
      // This ensures the app works even if IndexedDB and Capacitor aren't available
      isUsingFallback: true
    };
  }
};

export default createStorageAdapter(); 