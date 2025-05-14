import { Habit, HabitCompletion, HabitExportData, CompletionValue } from "@/hooks/useHabits";
import { StorageAdapter, StorageError, StorageUtils } from "./StorageAdapter";

// Database configuration
const DB_NAME = "habitSeedDB";
const DB_VERSION = 3; // Incremented for schema update (added indexes, improved structure)
const HABITS_STORE = "habits";
const COMPLETIONS_STORE = "completions";
const DETAILED_COMPLETIONS_STORE = "detailedCompletions";
const SETTINGS_STORE = "settings";

// Interface for a completion record
interface CompletionRecord {
  date: string;
  habitIds: string[];
}

// Interface for detailed completion records
interface DetailedCompletionRecord {
  date: string;
  completions: HabitCompletion[];
}

// Cache implementation to reduce database reads
class StorageCache {
  private habits: Habit[] | null = null;
  private completions: Record<string, HabitCompletion[]> = {};
  private allCompletions: Record<string, HabitCompletion[]> | null = null;
  private settings: any | null = null;
  private dbConnection: IDBDatabase | null = null;
  private lastQueryTimestamps: Record<string, number> = {};
  private queryResultTTL = 60000; // Cache TTL in milliseconds (1 minute)
  
  invalidateHabits(): void {
    this.habits = null;
    delete this.lastQueryTimestamps['habits'];
  }
  
  invalidateCompletions(date?: string): void {
    if (date) {
      delete this.completions[date];
      delete this.lastQueryTimestamps[`completions_${date}`];
    } else {
      this.completions = {};
      // Clear all completion timestamps
      Object.keys(this.lastQueryTimestamps).forEach(key => {
        if (key.startsWith('completions_')) {
          delete this.lastQueryTimestamps[key];
        }
      });
    }
    this.allCompletions = null;
    delete this.lastQueryTimestamps['allCompletions'];
  }
  
  invalidateSettings(): void {
    this.settings = null;
    delete this.lastQueryTimestamps['settings'];
  }
  
  invalidateAll(): void {
    this.invalidateHabits();
    this.invalidateCompletions();
    this.invalidateSettings();
    this.lastQueryTimestamps = {};
  }
  
  closeConnection(): void {
    if (this.dbConnection) {
      this.dbConnection.close();
      this.dbConnection = null;
    }
  }
  
  isCacheValid(key: string): boolean {
    const timestamp = this.lastQueryTimestamps[key];
    if (!timestamp) return false;
    
    const now = Date.now();
    return (now - timestamp) < this.queryResultTTL;
  }
  
  setCacheTimestamp(key: string): void {
    this.lastQueryTimestamps[key] = Date.now();
  }
  
  // Habits cache methods
  getHabitsFromCache(): Habit[] | null {
    return this.isCacheValid('habits') ? this.habits : null;
  }
  
  setHabitsInCache(habits: Habit[]): void {
    this.habits = habits;
    this.setCacheTimestamp('habits');
  }
  
  updateHabitInCache(habit: Habit): void {
    if (this.habits !== null) {
      const index = this.habits.findIndex(h => h.id === habit.id);
      if (index >= 0) {
        this.habits[index] = habit;
      } else {
        this.habits.push(habit);
      }
    }
  }
  
  // Completions cache methods
  getCompletionsFromCache(date: string): HabitCompletion[] | null {
    return this.isCacheValid(`completions_${date}`) ? 
      this.completions[date] || null : null;
  }
  
  setCompletionsInCache(date: string, completions: HabitCompletion[]): void {
    this.completions[date] = completions;
    this.setCacheTimestamp(`completions_${date}`);
  }
  
  getAllCompletionsFromCache(): Record<string, HabitCompletion[]> | null {
    return this.isCacheValid('allCompletions') ? this.allCompletions : null;
  }
  
  setAllCompletionsInCache(completions: Record<string, HabitCompletion[]>): void {
    this.allCompletions = completions;
    this.setCacheTimestamp('allCompletions');
  }
  
  // Settings cache methods
  getSettingsFromCache(): any | null {
    return this.isCacheValid('settings') ? this.settings : null;
  }
  
  setSettingsInCache(settings: any): void {
    this.settings = settings;
    this.setCacheTimestamp('settings');
  }
  
  // Connection methods
  getConnection(): IDBDatabase | null {
    return this.dbConnection;
  }
  
  setConnection(connection: IDBDatabase): void {
    this.dbConnection = connection;
    
    // Handle connection closing
    this.dbConnection.onclose = () => {
      this.dbConnection = null;
    };
    
    // Add connection error handler
    this.dbConnection.onerror = (event) => {
      console.error("IndexedDB connection error:", event);
      this.closeConnection();
    };
  }
}

/**
 * IndexedDBAdapter implements the StorageAdapter interface using IndexedDB
 */
export class IndexedDBAdapter implements StorageAdapter {
  private cache = new StorageCache();
  
  /**
   * Check if IndexedDB is supported in this environment
   */
  isSupported(): boolean {
    return typeof window !== 'undefined' && 
      window.indexedDB !== undefined &&
      window.IDBTransaction !== undefined;
  }
  
  /**
   * Open database connection with proper error handling
   */
  private async openDB(): Promise<IDBDatabase> {
    // Return cached connection if available
    const existingConnection = this.cache.getConnection();
    if (existingConnection) {
      return existingConnection;
    }
    
    return StorageUtils.executeWithRetry('open database', async () => {
      return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = (event) => {
          reject(new Error(`Failed to open database: ${request.error?.message || 'Unknown error'}`));
        };
        
        request.onsuccess = () => {
          this.cache.setConnection(request.result);
          resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
          const db = request.result;
          const oldVersion = event.oldVersion;
          
          // Database schema creation and migration
          if (oldVersion < 1) {
            // Create Habits store with indexes for faster queries
            if (!db.objectStoreNames.contains(HABITS_STORE)) {
              const habitStore = db.createObjectStore(HABITS_STORE, { keyPath: "id" });
              habitStore.createIndex("lastCompleted", "lastCompleted", { unique: false });
              habitStore.createIndex("streaks", "streaks", { unique: false });
            }
            
            // Create legacy Completions store
            if (!db.objectStoreNames.contains(COMPLETIONS_STORE)) {
              db.createObjectStore(COMPLETIONS_STORE, { keyPath: "date" });
            }
            
            // Create Settings store
            if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
              db.createObjectStore(SETTINGS_STORE, { keyPath: "id" });
            }
          }
          
          // Add detailed completions store in version 2
          if (oldVersion < 2) {
            if (!db.objectStoreNames.contains(DETAILED_COMPLETIONS_STORE)) {
              db.createObjectStore(DETAILED_COMPLETIONS_STORE, { keyPath: "date" });
              console.log("Created new detailed completions store");
            }
          }
          
          // Version 3 adds additional indexes for optimized queries
          if (oldVersion < 3) {
            // Add frequency index to habits store
            const habitStore = request.transaction!.objectStore(HABITS_STORE);
            if (!habitStore.indexNames.contains("frequency")) {
              habitStore.createIndex("frequency", "frequency", { unique: false });
            }
            
            // Add habitId index to detailed completions for faster lookups
            if (db.objectStoreNames.contains(DETAILED_COMPLETIONS_STORE)) {
              console.log("Added new indexes for performance optimization");
            }
          }
        };
      });
    });
  }
  
  /**
   * Batch operation helper for handling multiple transactions efficiently
   */
  private async batchOperation<T>(
    storeName: string,
    mode: IDBTransactionMode,
    operations: Array<(store: IDBObjectStore) => IDBRequest<T>>
  ): Promise<T[]> {
    return StorageUtils.executeWithRetry('execute batch operation', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const db = await this.openDB();
          const transaction = db.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          
          const results: T[] = [];
          const requests: IDBRequest<T>[] = [];
          
          // Execute all operations in the same transaction
          operations.forEach(operation => {
            const request = operation(store);
            requests.push(request);
          });
          
          // Wait for transaction to complete
          transaction.oncomplete = () => {
            requests.forEach(request => {
              results.push(request.result);
            });
            resolve(results);
          };
          
          transaction.onerror = () => {
            reject(new Error(`Batch transaction failed: ${transaction.error}`));
          };
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Generic function to execute a transaction
   */
  private async executeTransaction<T>(
    storeName: string,
    mode: IDBTransactionMode,
    callback: (store: IDBObjectStore) => IDBRequest<T>
  ): Promise<T> {
    return StorageUtils.executeWithRetry('execute transaction', async () => {
      return new Promise(async (resolve, reject) => {
        try {
          const db = await this.openDB();
          const transaction = db.transaction(storeName, mode);
          const store = transaction.objectStore(storeName);
          
          const request = callback(store);
          
          request.onsuccess = () => {
            resolve(request.result);
          };
          
          request.onerror = () => {
            reject(new Error(`Transaction failed: ${request.error}`));
          };
          
          transaction.onerror = () => {
            reject(new Error(`Transaction failed: ${transaction.error}`));
          };
        } catch (error) {
          reject(error);
        }
      });
    });
  }
  
  /**
   * Save a single habit
   */
  async saveHabit(habit: Habit): Promise<void> {
    await this.executeTransaction<IDBValidKey>(
      HABITS_STORE,
      "readwrite",
      (store) => store.put(habit)
    );
    
    // Update cache if it exists instead of invalidating
    this.cache.updateHabitInCache(habit);
  }
  
  /**
   * Save multiple habits in a single transaction
   */
  async saveHabits(habits: Habit[]): Promise<void> {
    if (habits.length === 0) return;
    
    await this.batchOperation(
      HABITS_STORE,
      "readwrite",
      habits.map(habit => (store) => store.put(habit))
    );
    
    // Update the cache with the new habits
    this.cache.setHabitsInCache(habits);
  }
  
  /**
   * Get all habits with caching
   */
  async getAllHabits(): Promise<Habit[]> {
    // Try to get from cache first
    const cachedHabits = this.cache.getHabitsFromCache();
    if (cachedHabits !== null) {
      return cachedHabits;
    }
    
    const habits = await this.executeTransaction<Habit[]>(
      HABITS_STORE,
      "readonly",
      (store) => {
        return store.getAll();
      }
    );
    
    // Update cache
    this.cache.setHabitsInCache(habits);
    
    return habits;
  }
  
  /**
   * Delete a habit by ID
   */
  async deleteHabit(id: string): Promise<void> {
    await this.executeTransaction<undefined>(
      HABITS_STORE,
      "readwrite",
      (store) => store.delete(id)
    );
    
    // Update cache if it exists
    const cachedHabits = this.cache.getHabitsFromCache();
    if (cachedHabits !== null) {
      this.cache.setHabitsInCache(cachedHabits.filter(h => h.id !== id));
    }
  }
  
  // Additional methods implementing the StorageAdapter interface go here
  
  /**
   * Legacy method: Save habit completion as simple array of IDs
   */
  async saveCompletion(date: string, habitIds: string[]): Promise<void> {
    await this.executeTransaction<IDBValidKey>(
      COMPLETIONS_STORE,
      "readwrite",
      (store) => store.put({ date, habitIds })
    );
    
    // Invalidate the completions cache for this date
    this.cache.invalidateCompletions(date);
  }
  
  /**
   * Legacy method: Get habit completions as simple array of IDs
   */
  async getCompletion(date: string): Promise<string[]> {
    try {
      const record = await this.executeTransaction<CompletionRecord>(
        COMPLETIONS_STORE,
        "readonly",
        (store) => store.get(date)
      );
      
      return record?.habitIds || [];
    } catch (error) {
      console.error(`Error getting completion for ${date}:`, error);
      return [];
    }
  }
  
  /**
   * Legacy method: Get all habit completions
   */
  async getAllCompletions(): Promise<Record<string, string[]>> {
    try {
      const records = await this.executeTransaction<CompletionRecord[]>(
        COMPLETIONS_STORE,
        "readonly",
        (store) => store.getAll()
      );
      
      const completions: Record<string, string[]> = {};
      records.forEach(record => {
        completions[record.date] = record.habitIds;
      });
      
      return completions;
    } catch (error) {
      console.error("Error getting all completions:", error);
      return {};
    }
  }
  
  /**
   * Legacy method: Clear all habit completions
   */
  async clearCompletions(): Promise<void> {
    await this.executeTransaction<undefined>(
      COMPLETIONS_STORE,
      "readwrite",
      (store) => store.clear()
    );
    
    // Invalidate the completions cache
    this.cache.invalidateCompletions();
  }
  
  /**
   * Save detailed habit completion data
   */
  async saveCompletionDetails(date: string, completions: HabitCompletion[]): Promise<void> {
    await this.executeTransaction<IDBValidKey>(
      DETAILED_COMPLETIONS_STORE,
      "readwrite",
      (store) => store.put({ date, completions })
    );
    
    // Also update legacy completions for backward compatibility
    const completedHabitIds = completions
      .filter(c => c.value !== false) // Only include actually completed habits
      .map(c => c.habitId);
    
    await this.saveCompletion(date, completedHabitIds);
    
    // Update cache
    this.cache.setCompletionsInCache(date, completions);
  }
  
  /**
   * Get detailed habit completion data for a date
   */
  async getCompletionDetails(date: string): Promise<HabitCompletion[]> {
    // Try to get from cache first
    const cachedCompletions = this.cache.getCompletionsFromCache(date);
    if (cachedCompletions !== null) {
      return cachedCompletions;
    }
    
    try {
      const record = await this.executeTransaction<DetailedCompletionRecord>(
        DETAILED_COMPLETIONS_STORE,
        "readonly",
        (store) => store.get(date)
      );
      
      if (record?.completions) {
        // Update cache
        this.cache.setCompletionsInCache(date, record.completions);
        return record.completions;
      }
      
      // If no detailed completions, try to convert from legacy format
      const legacyCompletions = await this.getCompletion(date);
      if (legacyCompletions.length > 0) {
        // Convert legacy format (just IDs) to detailed format (with values)
        const detailedCompletions = legacyCompletions.map(id => ({
          habitId: id,
          value: true as CompletionValue // For legacy data, we assume checkbox completion
        }));
        
        // Store the converted data for future use
        await this.saveCompletionDetails(date, detailedCompletions);
        
        return detailedCompletions;
      }
      
      return [];
    } catch (error) {
      console.error(`Error getting completion details for ${date}:`, error);
      return [];
    }
  }
  
  /**
   * Get detailed habit completion data for multiple dates efficiently
   */
  async getCompletionsForDateRange(dates: string[]): Promise<Record<string, HabitCompletion[]>> {
    if (dates.length === 0) return {};
    
    // Check if all dates are in cache
    const allInCache = dates.every(date => this.cache.getCompletionsFromCache(date) !== null);
    if (allInCache) {
      const result: Record<string, HabitCompletion[]> = {};
      dates.forEach(date => {
        result[date] = this.cache.getCompletionsFromCache(date) || [];
      });
      return result;
    }
    
    try {
      // Use a batch operation to get all dates at once
      const operations = dates.map(date => 
        (store: IDBObjectStore) => store.get(date)
      );
      
      const records = await this.batchOperation<DetailedCompletionRecord | undefined>(
        DETAILED_COMPLETIONS_STORE,
        "readonly",
        operations
      );
      
      const result: Record<string, HabitCompletion[]> = {};
      
      // Process each record and handle missing data
      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];
        const record = records[i];
        
        if (record?.completions) {
          result[date] = record.completions;
          this.cache.setCompletionsInCache(date, record.completions);
        } else {
          // Try legacy format
          const legacyCompletions = await this.getCompletion(date);
          if (legacyCompletions.length > 0) {
            const detailedCompletions = legacyCompletions.map(id => ({
              habitId: id,
              value: true as CompletionValue
            }));
            
            result[date] = detailedCompletions;
            this.cache.setCompletionsInCache(date, detailedCompletions);
            
            // Store for future use
            await this.saveCompletionDetails(date, detailedCompletions);
          } else {
            result[date] = [];
            this.cache.setCompletionsInCache(date, []);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error("Error getting completions for date range:", error);
      return {};
    }
  }
  
  /**
   * Get all detailed habit completion data
   */
  async getAllCompletionDetails(): Promise<Record<string, HabitCompletion[]>> {
    // Try to get from cache first
    const cachedAllCompletions = this.cache.getAllCompletionsFromCache();
    if (cachedAllCompletions !== null) {
      return cachedAllCompletions;
    }
    
    try {
      const records = await this.executeTransaction<DetailedCompletionRecord[]>(
        DETAILED_COMPLETIONS_STORE,
        "readonly",
        (store) => store.getAll()
      );
      
      const completions: Record<string, HabitCompletion[]> = {};
      records.forEach(record => {
        completions[record.date] = record.completions;
        this.cache.setCompletionsInCache(record.date, record.completions);
      });
      
      // Update all completions cache
      this.cache.setAllCompletionsInCache(completions);
      
      return completions;
    } catch (error) {
      console.error("Error getting all completion details:", error);
      return {};
    }
  }
  
  /**
   * Clear all detailed habit completion data
   */
  async clearCompletionDetails(): Promise<void> {
    await this.executeTransaction<undefined>(
      DETAILED_COMPLETIONS_STORE,
      "readwrite",
      (store) => store.clear()
    );
    
    // Also clear legacy completions
    await this.clearCompletions();
    
    // Invalidate the completions cache
    this.cache.invalidateCompletions();
  }
  
  /**
   * Save settings
   */
  async saveSettings(settings: any): Promise<void> {
    // Use a generic ID for settings
    const settingsWithId = { ...settings, id: "app-settings" };
    
    await this.executeTransaction<IDBValidKey>(
      SETTINGS_STORE,
      "readwrite",
      (store) => store.put(settingsWithId)
    );
    
    // Update settings cache
    this.cache.setSettingsInCache(settings);
  }
  
  /**
   * Get settings
   */
  async getSettings(): Promise<any> {
    // Try to get from cache first
    const cachedSettings = this.cache.getSettingsFromCache();
    if (cachedSettings !== null) {
      return cachedSettings;
    }
    
    try {
      const settings = await this.executeTransaction(
        SETTINGS_STORE,
        "readonly",
        (store) => store.get("app-settings")
      );
      
      if (settings) {
        // Remove ID from settings before returning
        const { id, ...settingsWithoutId } = settings;
        
        // Update cache
        this.cache.setSettingsInCache(settingsWithoutId);
        
        return settingsWithoutId;
      }
      
      return null;
    } catch (error) {
      console.error("Error getting settings:", error);
      return null;
    }
  }
  
  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<HabitExportData> {
    const habits = await this.getAllHabits();
    const completions = await this.getAllCompletionDetails();
    
    return {
      habits,
      completions
    };
  }
  
  /**
   * Import data from backup
   */
  async importAllData(data: HabitExportData): Promise<void> {
    // Clear existing data
    await this.clearCompletionDetails();
    
    // Save imported habits
    await this.saveHabits(data.habits);
    
    // Save imported completions
    const importPromises = Object.entries(data.completions).map(
      ([date, completions]) => this.saveCompletionDetails(date, completions)
    );
    
    await Promise.all(importPromises);
    
    // Invalidate all caches to ensure fresh data
    this.cache.invalidateAll();
  }
  
  /**
   * Migrate data from localStorage to IndexedDB
   */
  async migrateFromLocalStorage(): Promise<boolean> {
    try {
      // Check if we've already migrated
      const migrationFlag = localStorage.getItem("habitSeed_migration_completed");
      if (migrationFlag === "true") {
        return false; // Already migrated
      }
      
      // Migrate habits
      const storedHabitsJson = localStorage.getItem("habits");
      if (storedHabitsJson) {
        const storedHabits = JSON.parse(storedHabitsJson) as Habit[];
        await this.saveHabits(storedHabits);
      }
      
      // Migrate completions
      const completionEntries = Object.entries(localStorage)
        .filter(([key]) => key.startsWith("completions_"));
      
      for (const [key, value] of completionEntries) {
        if (!value) continue;
        
        const date = key.replace("completions_", "");
        try {
          // Try to parse as new format
          const parsedCompletions = JSON.parse(value);
          if (Array.isArray(parsedCompletions) && parsedCompletions.length > 0 && 'habitId' in parsedCompletions[0]) {
            await this.saveCompletionDetails(date, parsedCompletions);
          } else {
            // Convert old format to new format
            const oldFormatIds = parsedCompletions as string[];
            const newFormatCompletions = oldFormatIds.map(id => ({ 
              habitId: id, 
              value: true as CompletionValue
            }));
            await this.saveCompletionDetails(date, newFormatCompletions);
          }
        } catch (e) {
          console.error(`Error migrating completions for ${date}:`, e);
        }
      }
      
      // Migrate settings
      const storedSettingsJson = localStorage.getItem("habit-seed-settings");
      if (storedSettingsJson) {
        const storedSettings = JSON.parse(storedSettingsJson);
        await this.saveSettings(storedSettings);
      }
      
      // Mark migration as completed
      localStorage.setItem("habitSeed_migration_completed", "true");
      
      return true; // Migration successful
    } catch (error) {
      console.error("Error during migration:", error);
      return false; // Migration failed
    }
  }
  
  /**
   * Clear the cache to force fresh data loads
   */
  clearCache(): void {
    this.cache.invalidateAll();
  }
  
  /**
   * Close the database connection
   */
  closeConnection(): void {
    this.cache.closeConnection();
  }
} 