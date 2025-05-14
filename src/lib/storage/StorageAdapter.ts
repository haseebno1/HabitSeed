import { Habit, HabitCompletion, HabitExportData } from "@/hooks/useHabits";

/**
 * StorageAdapter interface defines the contract that all storage implementations must follow.
 * This allows for easy swapping of storage backends (IndexedDB, Capacitor, LocalStorage, etc.)
 */
export interface StorageAdapter {
  // Habit operations
  saveHabit(habit: Habit): Promise<void>;
  saveHabits(habits: Habit[]): Promise<void>;
  getAllHabits(): Promise<Habit[]>;
  deleteHabit(id: string): Promise<void>;
  
  // Completion operations (legacy)
  saveCompletion(date: string, habitIds: string[]): Promise<void>;
  getCompletion(date: string): Promise<string[]>;
  getAllCompletions(): Promise<Record<string, string[]>>;
  clearCompletions(): Promise<void>;
  
  // Detailed completion operations
  saveCompletionDetails(date: string, completions: HabitCompletion[]): Promise<void>;
  getCompletionDetails(date: string): Promise<HabitCompletion[]>;
  getCompletionsForDateRange(dates: string[]): Promise<Record<string, HabitCompletion[]>>;
  getAllCompletionDetails(): Promise<Record<string, HabitCompletion[]>>;
  clearCompletionDetails(): Promise<void>;
  
  // Settings operations
  saveSettings(settings: any): Promise<void>;
  getSettings(): Promise<any>;
  
  // Export/Import operations
  exportAllData(): Promise<HabitExportData>;
  importAllData(data: HabitExportData): Promise<void>;
  migrateFromLocalStorage(): Promise<boolean>;
  
  // Utility operations
  clearCache(): void;
  closeConnection(): void;
  isSupported(): boolean;
}

/**
 * StorageError class for better error handling with storage operations
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = "StorageError";
    
    // Ensure the stack trace includes the cause
    if (originalError && originalError.stack) {
      this.stack = `${this.stack}\nCaused by: ${originalError.stack}`;
    }
  }
}

/**
 * Helper methods for implementing storage adapters
 */
export const StorageUtils = {
  /**
   * Safely execute a storage operation with error handling
   */
  async executeWithRetry<T>(
    operation: string,
    callback: () => Promise<T>,
    maxRetries: number = 2
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await callback();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // If this is the last attempt, don't wait
        if (attempt === maxRetries) break;
        
        // Exponential backoff
        const delay = Math.min(100 * Math.pow(2, attempt), 1000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new StorageError(
      `Failed to ${operation} after ${maxRetries} attempts`,
      operation,
      lastError
    );
  }
}; 