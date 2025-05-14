
import { getToday } from "@/lib/utils";
import storage from "@/lib/storage";

// Helper function to initialize habit data
export const initializeHabitData = async () => {
  try {
    // Check if we need to migrate from localStorage to IndexedDB
    const hasMigrated = await storage.migrateFromLocalStorage();
    if (hasMigrated) {
      console.log("Successfully migrated data from localStorage to IndexedDB");
    }
    
    // Load habits
    const storedHabits = await storage.getAllHabits();
    
    // Load today's completions
    const today = getToday();
    const storedCompletions = await storage.getCompletion(today);
    
    return {
      habits: storedHabits,
      completedHabits: storedCompletions,
      success: true
    };
  } catch (error) {
    console.error("Error initializing habits data:", error);
    
    // Fallback to localStorage if needed
    let habits = [];
    let completions = [];
    
    try {
      const storedHabits = localStorage.getItem("habits");
      if (storedHabits) {
        habits = JSON.parse(storedHabits);
      }
      
      const today = getToday();
      const storedCompletions = localStorage.getItem(`completions_${today}`);
      if (storedCompletions) {
        completions = JSON.parse(storedCompletions);
      }
    } catch (fallbackError) {
      console.error("Error with localStorage fallback:", fallbackError);
    }
    
    return {
      habits,
      completedHabits: completions,
      success: false
    };
  }
};
