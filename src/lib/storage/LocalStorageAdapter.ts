import { Habit, HabitCompletion, HabitExportData, CompletionValue } from '@/hooks/useHabits';
import { StorageAdapter, StorageError, StorageUtils } from './StorageAdapter';

// Constants
const HABITS_KEY = 'habits';
const COMPLETIONS_PREFIX = 'completions_';
const DETAILED_COMPLETIONS_PREFIX = 'detailed_completions_';
const SETTINGS_KEY = 'habit-seed-settings';
const CACHE_TTL = 60000; // 1 minute cache TTL

// Cache implementation for localStorage
class LocalStorageCache {
  private habits: Habit[] | null = null;
  private completions: Record<string, HabitCompletion[]> = {};
  private allCompletions: Record<string, HabitCompletion[]> | null = null;
  private settings: any | null = null;
  private lastQueryTimestamps: Record<string, number> = {};
  
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
  
  isCacheValid(key: string): boolean {
    const timestamp = this.lastQueryTimestamps[key];
    if (!timestamp) return false;
    
    const now = Date.now();
    return (now - timestamp) < CACHE_TTL;
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
}

/**
 * LocalStorageAdapter implements the StorageAdapter interface using browser's localStorage
 * This adapter is used as a fallback when IndexedDB or Capacitor storage is not available
 */
export class LocalStorageAdapter implements StorageAdapter {
  private cache = new LocalStorageCache();
  
  /**
   * Check if localStorage is supported in this environment
   */
  isSupported(): boolean {
    try {
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return false;
      }
      
      // Test if we can access localStorage
      const testKey = '__test_local_storage__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Save a single habit
   */
  async saveHabit(habit: Habit): Promise<void> {
    return StorageUtils.executeWithRetry('save habit', async () => {
      // Get all habits first
      const habits = await this.getAllHabits();
      
      // Find and update existing habit or add new one
      const index = habits.findIndex(h => h.id === habit.id);
      
      if (index >= 0) {
        habits[index] = habit;
      } else {
        habits.push(habit);
      }
      
      // Save updated habits list
      await this.saveHabits(habits);
      
      // Update cache
      this.cache.updateHabitInCache(habit);
    });
  }
  
  /**
   * Save multiple habits
   */
  async saveHabits(habits: Habit[]): Promise<void> {
    return StorageUtils.executeWithRetry('save habits', async () => {
      localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
      
      // Update cache
      this.cache.setHabitsInCache(habits);
    });
  }
  
  /**
   * Get all habits with caching
   */
  async getAllHabits(): Promise<Habit[]> {
    return StorageUtils.executeWithRetry('get all habits', async () => {
      // Try to get from cache first
      const cachedHabits = this.cache.getHabitsFromCache();
      if (cachedHabits !== null) {
        return cachedHabits;
      }
      
      const habitsJson = localStorage.getItem(HABITS_KEY);
      const habits = habitsJson ? JSON.parse(habitsJson) : [];
      
      // Update cache
      this.cache.setHabitsInCache(habits);
      
      return habits;
    });
  }
  
  /**
   * Delete a habit by ID
   */
  async deleteHabit(id: string): Promise<void> {
    return StorageUtils.executeWithRetry('delete habit', async () => {
      const habits = await this.getAllHabits();
      const updatedHabits = habits.filter(habit => habit.id !== id);
      await this.saveHabits(updatedHabits);
    });
  }
  
  /**
   * Legacy method: Save habit completion as simple array of IDs
   */
  async saveCompletion(date: string, habitIds: string[]): Promise<void> {
    return StorageUtils.executeWithRetry('save completion', async () => {
      localStorage.setItem(`${COMPLETIONS_PREFIX}${date}`, JSON.stringify(habitIds));
      
      // Invalidate the completions cache for this date
      this.cache.invalidateCompletions(date);
    });
  }
  
  /**
   * Legacy method: Get habit completions as simple array of IDs
   */
  async getCompletion(date: string): Promise<string[]> {
    return StorageUtils.executeWithRetry('get completion', async () => {
      const completionsJson = localStorage.getItem(`${COMPLETIONS_PREFIX}${date}`);
      return completionsJson ? JSON.parse(completionsJson) : [];
    });
  }
  
  /**
   * Legacy method: Get all habit completions
   */
  async getAllCompletions(): Promise<Record<string, string[]>> {
    return StorageUtils.executeWithRetry('get all completions', async () => {
      const completions: Record<string, string[]> = {};
      
      // Find all completion keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(COMPLETIONS_PREFIX)) {
          const date = key.replace(COMPLETIONS_PREFIX, '');
          const valueJson = localStorage.getItem(key);
          
          if (valueJson) {
            completions[date] = JSON.parse(valueJson);
          }
        }
      }
      
      return completions;
    });
  }
  
  /**
   * Legacy method: Clear all habit completions
   */
  async clearCompletions(): Promise<void> {
    return StorageUtils.executeWithRetry('clear completions', async () => {
      // Find all completion keys in localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(COMPLETIONS_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all completion keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Invalidate the completions cache
      this.cache.invalidateCompletions();
    });
  }
  
  /**
   * Save detailed habit completion data
   */
  async saveCompletionDetails(date: string, completions: HabitCompletion[]): Promise<void> {
    return StorageUtils.executeWithRetry('save completion details', async () => {
      localStorage.setItem(`${DETAILED_COMPLETIONS_PREFIX}${date}`, JSON.stringify(completions));
      
      // Also update legacy completions for backward compatibility
      const completedHabitIds = completions
        .filter(c => c.value !== false) // Only include actually completed habits
        .map(c => c.habitId);
      
      await this.saveCompletion(date, completedHabitIds);
      
      // Update cache
      this.cache.setCompletionsInCache(date, completions);
    });
  }
  
  /**
   * Get detailed habit completion data for a date
   */
  async getCompletionDetails(date: string): Promise<HabitCompletion[]> {
    return StorageUtils.executeWithRetry('get completion details', async () => {
      // Try to get from cache first
      const cachedCompletions = this.cache.getCompletionsFromCache(date);
      if (cachedCompletions !== null) {
        return cachedCompletions;
      }
      
      const completionsJson = localStorage.getItem(`${DETAILED_COMPLETIONS_PREFIX}${date}`);
      
      if (completionsJson) {
        const completions = JSON.parse(completionsJson);
        
        // Update cache
        this.cache.setCompletionsInCache(date, completions);
        
        return completions;
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
    });
  }
  
  /**
   * Get detailed habit completion data for multiple dates efficiently
   */
  async getCompletionsForDateRange(dates: string[]): Promise<Record<string, HabitCompletion[]>> {
    return StorageUtils.executeWithRetry('get completions for date range', async () => {
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
      
      const result: Record<string, HabitCompletion[]> = {};
      
      // Process each date
      const promises = dates.map(async date => {
        result[date] = await this.getCompletionDetails(date);
      });
      
      await Promise.all(promises);
      
      return result;
    });
  }
  
  /**
   * Get all detailed habit completion data
   */
  async getAllCompletionDetails(): Promise<Record<string, HabitCompletion[]>> {
    return StorageUtils.executeWithRetry('get all completion details', async () => {
      // Try to get from cache first
      const cachedAllCompletions = this.cache.getAllCompletionsFromCache();
      if (cachedAllCompletions !== null) {
        return cachedAllCompletions;
      }
      
      const completions: Record<string, HabitCompletion[]> = {};
      let hasDetailedFormat = false;
      
      // Find all detailed completion keys in localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DETAILED_COMPLETIONS_PREFIX)) {
          const date = key.replace(DETAILED_COMPLETIONS_PREFIX, '');
          const valueJson = localStorage.getItem(key);
          
          if (valueJson) {
            const parsedCompletions = JSON.parse(valueJson);
            completions[date] = parsedCompletions;
            this.cache.setCompletionsInCache(date, parsedCompletions);
            hasDetailedFormat = true;
          }
        }
      }
      
      // If we have detailed data for some dates, return it
      if (hasDetailedFormat) {
        // Update all completions cache
        this.cache.setAllCompletionsInCache(completions);
        
        return completions;
      }
      
      // Otherwise, try to convert from legacy format
      const legacyCompletions = await this.getAllCompletions();
      for (const [date, habitIds] of Object.entries(legacyCompletions)) {
        // Convert legacy to detailed format
        const detailedCompletions = habitIds.map(id => ({
          habitId: id,
          value: true as CompletionValue
        }));
        
        completions[date] = detailedCompletions;
        this.cache.setCompletionsInCache(date, detailedCompletions);
        
        // Store for future use
        await this.saveCompletionDetails(date, detailedCompletions);
      }
      
      // Update all completions cache
      this.cache.setAllCompletionsInCache(completions);
      
      return completions;
    });
  }
  
  /**
   * Clear all detailed habit completion data
   */
  async clearCompletionDetails(): Promise<void> {
    return StorageUtils.executeWithRetry('clear completion details', async () => {
      // Find all detailed completion keys in localStorage
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(DETAILED_COMPLETIONS_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all detailed completion keys
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Also clear legacy completions
      await this.clearCompletions();
      
      // Invalidate the completions cache
      this.cache.invalidateCompletions();
    });
  }
  
  /**
   * Save settings
   */
  async saveSettings(settings: any): Promise<void> {
    return StorageUtils.executeWithRetry('save settings', async () => {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Update settings cache
      this.cache.setSettingsInCache(settings);
    });
  }
  
  /**
   * Get settings
   */
  async getSettings(): Promise<any> {
    return StorageUtils.executeWithRetry('get settings', async () => {
      // Try to get from cache first
      const cachedSettings = this.cache.getSettingsFromCache();
      if (cachedSettings !== null) {
        return cachedSettings;
      }
      
      const settingsJson = localStorage.getItem(SETTINGS_KEY);
      const settings = settingsJson ? JSON.parse(settingsJson) : null;
      
      // Update cache
      if (settings) {
        this.cache.setSettingsInCache(settings);
      }
      
      return settings;
    });
  }
  
  /**
   * Export all data for backup
   */
  async exportAllData(): Promise<HabitExportData> {
    return StorageUtils.executeWithRetry('export all data', async () => {
      const habits = await this.getAllHabits();
      const completions = await this.getAllCompletionDetails();
      
      return {
        habits,
        completions
      };
    });
  }
  
  /**
   * Import data from backup
   */
  async importAllData(data: HabitExportData): Promise<void> {
    return StorageUtils.executeWithRetry('import all data', async () => {
      // Clear existing data
      await this.clearCompletionDetails();
      
      // Save imported habits
      await this.saveHabits(data.habits);
      
      // Save imported completions
      for (const [date, completions] of Object.entries(data.completions)) {
        await this.saveCompletionDetails(date, completions);
      }
      
      // Invalidate all caches to ensure fresh data
      this.cache.invalidateAll();
    });
  }
  
  /**
   * Migrate data from localStorage - no-op as we're already in localStorage
   */
  async migrateFromLocalStorage(): Promise<boolean> {
    // No need to migrate from localStorage when we're already using it
    return Promise.resolve(false);
  }
  
  /**
   * Clear the cache to force fresh data loads
   */
  clearCache(): void {
    this.cache.invalidateAll();
  }
  
  /**
   * Close the connection (no-op for localStorage)
   */
  closeConnection(): void {
    // No connection to close in localStorage
  }
} 