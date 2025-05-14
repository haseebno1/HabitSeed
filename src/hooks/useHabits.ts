import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getToday, isMilestoneStreak, getMilestoneMessage } from "@/lib/utils";
import storage from "@/lib/storage";

// Define types
export interface Habit {
  id: string;
  name: string;
  emoji: string;
  streaks: number;
  lastCompleted: string | null;
}

export interface HabitExportData {
  habits: Habit[];
  completions: Record<string, string[]>;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [showSuccessEmoji, setShowSuccessEmoji] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Load habits and today's completions on mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check if we need to migrate from localStorage to IndexedDB
        const hasMigrated = await storage.migrateFromLocalStorage();
        if (hasMigrated) {
          console.log("Successfully migrated data from localStorage to IndexedDB");
        }
        
        // Load habits
        const storedHabits = await storage.getAllHabits();
        setHabits(storedHabits);
        
        // Load today's completions
        const today = getToday();
        const storedCompletions = await storage.getCompletion(today);
        setCompletedHabits(storedCompletions);
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing habits data:", error);
        // Fallback to localStorage if needed
        const storedHabits = localStorage.getItem("habits");
        if (storedHabits) {
          setHabits(JSON.parse(storedHabits));
        }
        
        const today = getToday();
        const storedCompletions = localStorage.getItem(`completions_${today}`);
        if (storedCompletions) {
          setCompletedHabits(JSON.parse(storedCompletions));
        }
        
        setIsInitialized(true);
      }
    };
    
    initializeData();
  }, []);
  
  // Save habits whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveHabitsData = async () => {
      try {
        await storage.saveHabits(habits);
      } catch (error) {
        console.error("Error saving habits to IndexedDB:", error);
        // Fallback to localStorage
        localStorage.setItem("habits", JSON.stringify(habits));
      }
    };
    
    saveHabitsData();
  }, [habits, isInitialized]);
  
  // Save completions whenever they change
  useEffect(() => {
    if (!isInitialized) return;
    
    const saveCompletionData = async () => {
      try {
        const today = getToday();
        await storage.saveCompletion(today, completedHabits);
      } catch (error) {
        console.error("Error saving completions to IndexedDB:", error);
        // Fallback to localStorage
        const today = getToday();
        localStorage.setItem(`completions_${today}`, JSON.stringify(completedHabits));
      }
    };
    
    saveCompletionData();
  }, [completedHabits, isInitialized]);
  
  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    const today = getToday();
    
    if (completedHabits.includes(id)) {
      // Uncomplete the habit
      setCompletedHabits(prev => prev.filter(habitId => habitId !== id));
      
      // Adjust streak if it was completed today
      if (habit.lastCompleted === today) {
        setHabits(prev => 
          prev.map(h => 
            h.id === id ? { ...h, lastCompleted: null } : h
          )
        );
      }
      
      // Show a subtle toast for undoing completion
      toast("Habit marked as incomplete", {
        duration: 2000,
        style: {
          background: "var(--muted)",
          color: "var(--muted-foreground)",
        }
      });
    } else {
      // Complete the habit
      setCompletedHabits(prev => [...prev, id]);
      
      // Show the success animation
      setShowSuccessEmoji(habit.emoji);
      setTimeout(() => setShowSuccessEmoji(null), 1500);
      
      // Haptic feedback on mobile devices if supported
      try {
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      } catch (e) {
        // Ignore errors if vibration isn't supported
      }
      
      // Update the streak
      const updatedHabits = habits.map(h => {
        if (h.id !== id) return h;
        
        // If this is consecutive day completion, increase streak
        const newStreak = h.lastCompleted ? h.streaks + 1 : 1;
        
        // Check if this is a milestone streak
        if (isMilestoneStreak(newStreak)) {
          setTimeout(() => {
            toast(getMilestoneMessage(newStreak), {
              duration: 5000,
              style: {
                background: "var(--primary)",
                color: "var(--primary-foreground)",
                fontSize: "1.1em"
              }
            });
          }, 800);
        } else {
          toast(getCompletionMessage(habit.name), {
            duration: 3000,
            style: {
              background: "var(--accent)",
              color: "var(--accent-foreground)",
            }
          });
        }
        
        return { ...h, streaks: newStreak, lastCompleted: today };
      });
      
      setHabits(updatedHabits);
      
      // Check if all habits are completed
      const allCompleted = updatedHabits.every(h => 
        completedHabits.includes(h.id) || h.id === id
      );
      
      if (allCompleted && updatedHabits.length > 1) {
        setTimeout(() => {
          toast("🎉 All habits completed today! Amazing job!", {
            duration: 5000,
            style: {
              background: "var(--primary)",
              color: "var(--primary-foreground)",
              fontWeight: "bold",
              fontSize: "1.1em"
            }
          });
        }, 1000);
      }
    }
  };
  
  // Get varied completion messages to keep motivation fresh
  const getCompletionMessage = (habitName: string): string => {
    const messages = [
      `${habitName} completed! Keep growing! 🌱`,
      `Great job on ${habitName}! 👏`,
      `${habitName} done! You're on a roll! 🔥`,
      `${habitName} checked off! Keep it up! ✨`,
      `${habitName} completed! Building momentum! 💪`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };
  
  const addHabit = async (habitData: { name: string; emoji: string }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitData.name,
      emoji: habitData.emoji,
      streaks: 0,
      lastCompleted: null,
    };
    
    try {
      await storage.saveHabit(newHabit);
      setHabits(prev => [...prev, newHabit]);
      toast("New habit added! 🌱");
    } catch (error) {
      console.error("Error adding habit:", error);
      // Still update state even if storage fails
      setHabits(prev => [...prev, newHabit]);
      toast("New habit added! 🌱");
    }
    
    return newHabit;
  };
  
  const updateHabit = async (habitData: { id: string; name: string; emoji: string }) => {
    // Find the current habit to preserve other fields
    const currentHabit = habits.find(h => h.id === habitData.id);
    if (!currentHabit) return;
    
    const updatedHabit: Habit = {
      ...currentHabit,
      name: habitData.name,
      emoji: habitData.emoji
    };
    
    try {
      await storage.saveHabit(updatedHabit);
      setHabits(prev => 
        prev.map(h => h.id === habitData.id ? updatedHabit : h)
      );
      toast("Habit updated successfully!");
    } catch (error) {
      console.error("Error updating habit:", error);
      // Still update state even if storage fails
      setHabits(prev => 
        prev.map(h => h.id === habitData.id ? updatedHabit : h)
      );
      toast("Habit updated successfully!");
    }
  };
  
  const deleteHabit = async (id: string) => {
    try {
      await storage.deleteHabit(id);
      setHabits(prev => prev.filter(h => h.id !== id));
      setCompletedHabits(prev => prev.filter(habitId => habitId !== id));
      toast("Habit deleted.");
    } catch (error) {
      console.error("Error deleting habit:", error);
      // Still update state even if storage fails
      setHabits(prev => prev.filter(h => h.id !== id));
      setCompletedHabits(prev => prev.filter(habitId => habitId !== id));
      toast("Habit deleted.");
    }
  };
  
  // Export all habit data for backup
  const exportHabits = async (): Promise<HabitExportData> => {
    try {
      return await storage.exportAllData();
    } catch (error) {
      console.error("Error exporting data:", error);
      
      // Fallback to gathering data from state/localStorage
      const completionsData: Record<string, string[]> = {};
      
      // Find all completion keys in localStorage as fallback
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('completions_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              completionsData[key.replace('completions_', '')] = JSON.parse(value);
            }
          } catch (error) {
            console.error(`Error parsing completions for ${key}:`, error);
          }
        }
      }
      
      return {
        habits: [...habits],
        completions: completionsData
      };
    }
  };
  
  // Import habit data from backup
  const importHabits = async (data: HabitExportData) => {
    try {
      await storage.importAllData(data);
      
      // Update state with imported data
      setHabits(data.habits);
      
      // Update today's completions if available
      const today = getToday();
      if (data.completions && data.completions[today]) {
        setCompletedHabits(data.completions[today]);
      } else {
        setCompletedHabits([]);
      }
      
      return true;
    } catch (error) {
      console.error("Error importing data:", error);
      throw error;
    }
  };
  
  // Add a function to reorder habits
  const reorderHabits = (newOrder: Habit[]) => {
    setHabits(newOrder);
    
    // Show a subtle indication that order was saved
    toast("Habit order updated", {
      duration: 2000,
      style: {
        background: "var(--secondary)",
        color: "var(--secondary-foreground)",
      }
    });
  };
  
  // Return all the functions and state for the hook
  return {
    habits,
    completedHabits,
    isInitialized,
    showSuccessEmoji,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    reorderHabits,
    exportHabits,
    importHabits
  };
};
