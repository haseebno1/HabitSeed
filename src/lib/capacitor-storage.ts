import { Preferences } from '@capacitor/preferences';
import { Habit, HabitExportData } from '@/hooks/useHabits';

// Constants
const HABITS_KEY = 'habits';
const COMPLETIONS_PREFIX = 'completions_';
const SETTINGS_KEY = 'habit-seed-settings';

// Type for completion records
interface CompletionRecord {
  date: string;
  habitIds: string[];
}

// Helper function to check if running in Capacitor environment
export const isCapacitorApp = (): boolean => {
  return (
    typeof (window as any)?.Capacitor !== 'undefined' && 
    (window as any)?.Capacitor?.isNativePlatform()
  );
};

// Habits CRUD operations
export const saveHabit = async (habit: Habit): Promise<void> => {
  try {
    // Get all habits first
    const habits = await getAllHabits();
    
    // Find and update existing habit or add new one
    const index = habits.findIndex(h => h.id === habit.id);
    
    if (index >= 0) {
      habits[index] = habit;
    } else {
      habits.push(habit);
    }
    
    // Save updated habits list
    await saveHabits(habits);
  } catch (error) {
    console.error("Error saving habit to Capacitor storage:", error);
    throw error;
  }
};

export const saveHabits = async (habits: Habit[]): Promise<void> => {
  try {
    await Preferences.set({
      key: HABITS_KEY,
      value: JSON.stringify(habits)
    });
  } catch (error) {
    console.error("Error saving habits to Capacitor storage:", error);
    throw error;
  }
};

export const getAllHabits = async (): Promise<Habit[]> => {
  try {
    const result = await Preferences.get({ key: HABITS_KEY });
    return result.value ? JSON.parse(result.value) : [];
  } catch (error) {
    console.error("Error getting habits from Capacitor storage:", error);
    return [];
  }
};

export const deleteHabit = async (id: string): Promise<void> => {
  try {
    const habits = await getAllHabits();
    const updatedHabits = habits.filter(habit => habit.id !== id);
    await saveHabits(updatedHabits);
  } catch (error) {
    console.error("Error deleting habit from Capacitor storage:", error);
    throw error;
  }
};

// Completions operations
export const saveCompletion = async (date: string, habitIds: string[]): Promise<void> => {
  try {
    await Preferences.set({
      key: `${COMPLETIONS_PREFIX}${date}`,
      value: JSON.stringify(habitIds)
    });
  } catch (error) {
    console.error(`Error saving completion for ${date} to Capacitor storage:`, error);
    throw error;
  }
};

export const getCompletion = async (date: string): Promise<string[]> => {
  try {
    const result = await Preferences.get({ key: `${COMPLETIONS_PREFIX}${date}` });
    return result.value ? JSON.parse(result.value) : [];
  } catch (error) {
    console.error(`Error getting completion for ${date} from Capacitor storage:`, error);
    return [];
  }
};

export const getAllCompletions = async (): Promise<Record<string, string[]>> => {
  try {
    // Get all keys from Preferences
    const { keys } = await Preferences.keys();
    
    // Filter for completion keys
    const completionKeys = keys.filter(key => key.startsWith(COMPLETIONS_PREFIX));
    
    // Create completions object
    const completions: Record<string, string[]> = {};
    
    // Populate completions object
    for (const key of completionKeys) {
      const result = await Preferences.get({ key });
      if (result.value) {
        const date = key.replace(COMPLETIONS_PREFIX, '');
        completions[date] = JSON.parse(result.value);
      }
    }
    
    return completions;
  } catch (error) {
    console.error("Error getting all completions from Capacitor storage:", error);
    return {};
  }
};

export const clearCompletions = async (): Promise<void> => {
  try {
    // Get all keys from Preferences
    const { keys } = await Preferences.keys();
    
    // Filter for completion keys
    const completionKeys = keys.filter(key => key.startsWith(COMPLETIONS_PREFIX));
    
    // Remove all completion keys
    for (const key of completionKeys) {
      await Preferences.remove({ key });
    }
  } catch (error) {
    console.error("Error clearing completions from Capacitor storage:", error);
    throw error;
  }
};

// Settings operations
export const saveSettings = async (settings: any): Promise<void> => {
  try {
    await Preferences.set({
      key: SETTINGS_KEY,
      value: JSON.stringify(settings)
    });
  } catch (error) {
    console.error("Error saving settings to Capacitor storage:", error);
    throw error;
  }
};

export const getSettings = async (): Promise<any> => {
  try {
    const result = await Preferences.get({ key: SETTINGS_KEY });
    return result.value ? JSON.parse(result.value) : null;
  } catch (error) {
    console.error("Error getting settings from Capacitor storage:", error);
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
    console.error("Error importing data to Capacitor storage:", error);
    throw new Error("Failed to import data");
  }
};

// Migration function from localStorage to Capacitor Preferences
export const migrateFromLocalStorage = async (): Promise<boolean> => {
  try {
    let migrated = false;
    
    // Migrate habits
    const habitData = localStorage.getItem(HABITS_KEY);
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
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(COMPLETIONS_PREFIX)) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const date = key.replace(COMPLETIONS_PREFIX, '');
            const habitIds = JSON.parse(value);
            
            if (Array.isArray(habitIds)) {
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
    const settingsData = localStorage.getItem(SETTINGS_KEY);
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
    console.error("Capacitor migration failed:", error);
    return false;
  }
};

// Create the storage adapter
export const createCapacitorStorageAdapter = () => {
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
    isUsingCapacitor: true
  };
};

export default createCapacitorStorageAdapter(); 