import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getToday, isMilestoneStreak, getMilestoneMessage } from "@/lib/utils";
import storage from "@/lib/storage";

// Define types
export type TrackingType = "checkbox" | "quantity" | "duration" | "rating";
export type FrequencyType = "daily" | "weekly" | "monthly" | "custom";

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  streaks: number;
  lastCompleted: string | null;
  trackingType: TrackingType;
  targetValue?: number; // Target value for quantity, duration, or rating
  unit?: string; // Unit for quantity or duration (e.g., "pages", "minutes")
  frequency: FrequencyType; // How often the habit should be performed
  frequencyData?: {
    daysOfWeek?: number[]; // For weekly: 0 = Sunday, 1 = Monday, etc.
    daysOfMonth?: number[]; // For monthly: 1-31
    interval?: number; // For custom: every X days
    startDate?: string; // For custom: start tracking from this date
  };
  skippedDates?: string[]; // Array of dates (YYYY-MM-DD) that were intentionally skipped
  notes?: string; // Optional notes or reflections about the habit
}

// Define completion value types based on tracking type
export type CompletionValue = boolean | number;

export interface HabitCompletion {
  habitId: string;
  value: CompletionValue;
}

export interface HabitExportData {
  habits: Habit[];
  completions: Record<string, HabitCompletion[]>;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const [showSuccessEmoji, setShowSuccessEmoji] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Add a timeout to force initialization after a certain period
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isInitialized) {
        console.log("Forcing initialization of habits due to timeout");
        setIsInitialized(true);
      }
    }, 5000); // 5 seconds timeout
    
    return () => clearTimeout(timer);
  }, [isInitialized]);
  
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
        
        // Ensure all habits have a tracking type (for backward compatibility)
        const updatedHabits = storedHabits.map(habit => ({
          ...habit,
          trackingType: habit.trackingType || "checkbox"
        }));
        
        setHabits(updatedHabits);
        
        // Load today's completions
        const today = getToday();
        
        // Use the batch loading API for better performance
        const dateRange = [today];
        const completionsByDate = await storage.getCompletionsForDateRange(dateRange);
        const storedCompletions = completionsByDate[today] || [];
        
        setCompletedHabits(storedCompletions);
        
        setIsInitialized(true);
      } catch (error) {
        console.error("Error initializing habits data:", error);
        // Fallback to localStorage if needed
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
          const parsedHabits = JSON.parse(storedHabits);
          // Ensure backward compatibility
          const updatedHabits = parsedHabits.map((habit: Habit) => ({
            ...habit,
            trackingType: habit.trackingType || "checkbox"
          }));
          setHabits(updatedHabits);
    }
    
    const today = getToday();
    const storedCompletions = localStorage.getItem(`completions_${today}`);
    if (storedCompletions) {
          try {
            // Try to parse as new format
            const parsedCompletions = JSON.parse(storedCompletions);
            if (Array.isArray(parsedCompletions) && parsedCompletions.length > 0 && 'habitId' in parsedCompletions[0]) {
              setCompletedHabits(parsedCompletions);
            } else {
              // Convert old format to new format
              const oldFormatIds = parsedCompletions as string[];
              const newFormatCompletions = oldFormatIds.map(id => ({ 
                habitId: id, 
                value: true 
              }));
              setCompletedHabits(newFormatCompletions);
            }
          } catch (e) {
            console.error("Error parsing completions:", e);
            setCompletedHabits([]);
          }
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
        await storage.saveCompletionDetails(today, completedHabits);
      } catch (error) {
        console.error("Error saving completions to IndexedDB:", error);
        // Fallback to localStorage
    const today = getToday();
    localStorage.setItem(`completions_${today}`, JSON.stringify(completedHabits));
      }
    };
    
    saveCompletionData();
  }, [completedHabits, isInitialized]);
  
  // Check if a habit is completed
  const isHabitCompleted = (habitId: string): boolean => {
    return completedHabits.some(h => h.habitId === habitId);
  };
  
  // Get the completion value for a habit
  const getCompletionValue = (habitId: string): CompletionValue | null => {
    const completion = completedHabits.find(h => h.habitId === habitId);
    return completion ? completion.value : null;
  };

  // Helper function to check if a date should be counted for streak calculation
  // (either completed or skipped)
  const isDateAccountedFor = (habit: Habit, dateStr: string): boolean => {
    // Check if the habit was completed on this date
    const isCompleted = habit.lastCompleted === dateStr;
    
    // Check if the habit was skipped on this date
    const isSkipped = habit.skippedDates?.includes(dateStr) || false;
    
    // Check if the habit was not due on this date based on frequency
    const date = new Date(dateStr);
    let isNotDue = false;
    
    switch (habit.frequency) {
      case "daily":
        isNotDue = false; // Daily habits are always due
        break;
        
      case "weekly":
        if (habit.frequencyData?.daysOfWeek) {
          const dayOfWeek = date.getDay();
          isNotDue = !habit.frequencyData.daysOfWeek.includes(dayOfWeek);
        }
        break;
        
      case "monthly":
        if (habit.frequencyData?.daysOfMonth) {
          const dayOfMonth = date.getDate();
          isNotDue = !habit.frequencyData.daysOfMonth.includes(dayOfMonth);
        }
        break;
        
      case "custom":
        if (habit.frequencyData?.interval && habit.frequencyData?.startDate) {
          const startDate = new Date(habit.frequencyData.startDate);
          const diffTime = date.getTime() - startDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          isNotDue = diffDays % habit.frequencyData.interval !== 0;
        }
        break;
    }
    
    // Return true if the date is accounted for (completed, skipped, or not due)
    return isCompleted || isSkipped || isNotDue;
  };
  
  // Calculate the current streak considering skipped days
  const calculateCurrentStreak = (habit: Habit): number => {
    if (!habit.lastCompleted) return 0;
    
    const today = new Date();
    let currentDate = new Date(today);
    let streak = 0;
    
    // Start from today and go backwards
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      
      if (isDateAccountedFor(habit, dateStr)) {
        streak++;
      } else {
        break; // Streak is broken
      }
      
      // Go to previous day
      currentDate.setDate(currentDate.getDate() - 1);
      
      // Stop if we've gone back too far (1 year max)
      if (today.getTime() - currentDate.getTime() > 365 * 24 * 60 * 60 * 1000) {
        break;
      }
    }
    
    return streak;
  };

  // Toggle a checkbox habit or update a value-based habit
  const updateHabitCompletion = (habitId: string, value: CompletionValue) => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = getToday();
    const existingCompletion = completedHabits.find(h => h.habitId === habitId);
    
    if (existingCompletion) {
      // If it's a checkbox and we're toggling off, remove the completion
      if (habit.trackingType === "checkbox" && value === false) {
        setCompletedHabits(prev => prev.filter(h => h.habitId !== habitId));
      
      // Adjust streak if it was completed today
      if (habit.lastCompleted === today) {
        setHabits(prev => 
          prev.map(h => 
              h.id === habitId ? { ...h, lastCompleted: null } : h
            )
          );
        }
        
        toast("Habit marked as incomplete", {
          duration: 2000,
          style: {
            background: "var(--muted)",
            color: "var(--muted-foreground)",
          }
        });
      } else {
        // Update the completion value
        setCompletedHabits(prev => 
          prev.map(h => h.habitId === habitId ? { ...h, value } : h)
        );
        
        toast(getCompletionMessage(habit.name), {
          duration: 3000,
          style: {
            background: "var(--accent)",
            color: "var(--accent-foreground)",
          }
        });
      }
    } else {
      // Add new completion
      setCompletedHabits(prev => [...prev, { habitId, value }]);
      
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
      
      // Update the habit with new completion status and recalculated streak
      const updatedHabits = habits.map(h => {
        if (h.id !== habitId) return h;
        
        // Calculate the new streak, considering skipped days
        const updatedHabit = { ...h, lastCompleted: today };
        const newStreak = calculateCurrentStreak(updatedHabit);
        
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
      const allCompleted = habits.every(h => 
        completedHabits.some(c => c.habitId === h.id) || h.id === habitId
      );
      
      if (allCompleted && habits.length > 1) {
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
  
  // Legacy toggle function for backward compatibility
  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    if (isHabitCompleted(id)) {
      // Handle as uncompleting (always a boolean false for checkbox habits)
      updateHabitCompletion(id, false);
    } else {
      // Handle as completing (true for checkbox, default target value for others)
      if (habit.trackingType === "checkbox") {
        updateHabitCompletion(id, true);
      } else if (habit.trackingType === "quantity" || habit.trackingType === "duration") {
        updateHabitCompletion(id, habit.targetValue || 1);
      } else if (habit.trackingType === "rating") {
        updateHabitCompletion(id, habit.targetValue || 5);
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
  
  // Check if a habit is due today based on its frequency
  const isHabitDueToday = (habit: Habit): boolean => {
    const today = new Date();
    const todayStr = getToday();
    
    // If the habit is skipped for today, it's not due
    if (habit.skippedDates?.includes(todayStr)) {
      return false;
    }
    
    switch (habit.frequency) {
      case "daily":
        return true;
        
      case "weekly":
        if (!habit.frequencyData?.daysOfWeek?.length) return true;
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        return habit.frequencyData.daysOfWeek.includes(dayOfWeek);
        
      case "monthly":
        if (!habit.frequencyData?.daysOfMonth?.length) return true;
        const dayOfMonth = today.getDate(); // 1-31
        return habit.frequencyData.daysOfMonth.includes(dayOfMonth);
        
      case "custom":
        if (!habit.frequencyData?.interval || !habit.frequencyData?.startDate) return true;
        
        const startDate = new Date(habit.frequencyData.startDate);
        const diffTime = today.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // If the difference is divisible by the interval, it's due today
        return diffDays % habit.frequencyData.interval === 0;
        
      default:
        return true;
    }
  };
  
  // Skip a habit for the current day (or a specified date)
  const skipHabit = async (habitId: string, date: string = getToday()): Promise<void> => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;
    
    // Initialize skippedDates array if it doesn't exist
    const skippedDates = habit.skippedDates || [];
    
    // Add the date if it's not already skipped
    if (!skippedDates.includes(date)) {
      const updatedSkippedDates = [...skippedDates, date];
      
      // Update the habit
      const updatedHabit: Habit = {
        ...habit,
        skippedDates: updatedSkippedDates
      };
      
      try {
        // Save to storage
        await storage.saveHabit(updatedHabit);
        
        // Update state
        setHabits(prev => 
          prev.map(h => h.id === habitId ? updatedHabit : h)
        );
        
        toast(`${habit.name} skipped for today`, {
          duration: 3000,
          style: {
            background: "var(--secondary)",
            color: "var(--secondary-foreground)",
          }
        });
      } catch (error) {
        console.error("Error skipping habit:", error);
        
        // Still update state even if storage fails
        setHabits(prev => 
          prev.map(h => h.id === habitId ? updatedHabit : h)
        );
      }
    }
  };
  
  // Unskip a habit for a specific date
  const unskipHabit = async (habitId: string, date: string = getToday()): Promise<void> => {
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.skippedDates) return;
    
    // Remove the date from skipped dates
    if (habit.skippedDates.includes(date)) {
      const updatedSkippedDates = habit.skippedDates.filter(d => d !== date);
      
      // Update the habit
      const updatedHabit: Habit = {
        ...habit,
        skippedDates: updatedSkippedDates
      };
      
      try {
        // Save to storage
        await storage.saveHabit(updatedHabit);
        
        // Update state
        setHabits(prev => 
          prev.map(h => h.id === habitId ? updatedHabit : h)
        );
        
        toast(`${habit.name} is now active for today`, {
          duration: 3000,
          style: {
            background: "var(--accent)",
            color: "var(--accent-foreground)",
          }
        });
      } catch (error) {
        console.error("Error unskipping habit:", error);
        
        // Still update state even if storage fails
        setHabits(prev => 
          prev.map(h => h.id === habitId ? updatedHabit : h)
        );
      }
    }
  };
  
  // Check if a habit is skipped for a specific date
  const isHabitSkipped = (habitId: string, date: string = getToday()): boolean => {
    const habit = habits.find(h => h.id === habitId);
    return !!habit?.skippedDates?.includes(date);
  };
  
  // Get active habits for today (filtering out habits not due today)
  const getActiveHabitsForToday = (): Habit[] => {
    return habits.filter(isHabitDueToday);
  };
  
  const addHabit = async (habitData: { 
    name: string; 
    emoji: string; 
    trackingType?: TrackingType;
    targetValue?: number;
    unit?: string;
    frequency?: FrequencyType;
    frequencyData?: Habit['frequencyData'];
    notes?: string;
  }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitData.name,
      emoji: habitData.emoji,
      streaks: 0,
      lastCompleted: null,
      trackingType: habitData.trackingType || "checkbox",
      frequency: habitData.frequency || "daily",
      ...(habitData.targetValue && { targetValue: habitData.targetValue }),
      ...(habitData.unit && { unit: habitData.unit }),
      ...(habitData.frequencyData && { frequencyData: habitData.frequencyData }),
      ...(habitData.notes && { notes: habitData.notes }),
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
  
  const updateHabit = async (habitData: { 
    id: string; 
    name: string; 
    emoji: string;
    trackingType?: TrackingType;
    targetValue?: number;
    unit?: string;
    frequency?: FrequencyType;
    frequencyData?: Habit['frequencyData'];
    notes?: string;
  }) => {
    // Find the current habit to preserve other fields
    const currentHabit = habits.find(h => h.id === habitData.id);
    if (!currentHabit) return;
    
    const updatedHabit: Habit = {
      ...currentHabit,
      name: habitData.name,
      emoji: habitData.emoji,
      ...(habitData.trackingType !== undefined && { trackingType: habitData.trackingType }),
      ...(habitData.targetValue !== undefined && { targetValue: habitData.targetValue }),
      ...(habitData.unit !== undefined && { unit: habitData.unit }),
      ...(habitData.frequency !== undefined && { frequency: habitData.frequency }),
      ...(habitData.frequencyData !== undefined && { frequencyData: habitData.frequencyData }),
      ...(habitData.notes !== undefined && { notes: habitData.notes }),
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
      setCompletedHabits(prev => prev.filter(completion => completion.habitId !== id));
      toast("Habit deleted.");
    } catch (error) {
      console.error("Error deleting habit:", error);
      // Still update state even if storage fails
    setHabits(prev => prev.filter(h => h.id !== id));
      setCompletedHabits(prev => prev.filter(completion => completion.habitId !== id));
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
      const completionsData: Record<string, HabitCompletion[]> = {};
      
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
  
  // Function to load stats data efficiently
  const loadStatsData = async (dateRange: string[]): Promise<Record<string, HabitCompletion[]>> => {
    try {
      // Use the batch loading function for better performance
      return await storage.getCompletionsForDateRange(dateRange);
    } catch (error) {
      console.error("Error loading stats data:", error);
      return {};
    }
  };

  // Calculate statistics and analytics for habit performance
  const calculateStats = async (dateRange: string[] = []): Promise<any> => {
    try {
      // Generate date range if not provided
      const dates = dateRange.length > 0 ? dateRange : generateDateRange(30);
      
      // Efficiently load completion data for the date range
      const completions = await loadStatsData(dates);
      
      // Calculate various metrics (this would be implementation-specific)
      const completionRates = calculateCompletionRates(habits, completions);
      const streaks = habits.map(h => ({ id: h.id, streak: h.streaks }));
      
      return {
        completions,
        completionRates,
        streaks,
        // Add other stats as needed
      };
    } catch (error) {
      console.error("Error calculating stats:", error);
      return null;
    }
  };

  // Helper function to generate a date range
  const generateDateRange = (days: number): string[] => {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  };

  // Helper function to calculate completion rates
  const calculateCompletionRates = (
    habitList: Habit[],
    completionData: Record<string, HabitCompletion[]>
  ): Record<string, number> => {
    const rates: Record<string, number> = {};
    
    habitList.forEach(habit => {
      let completed = 0;
      let total = 0;
      
      Object.entries(completionData).forEach(([date, completions]) => {
        if (isHabitDueOnDate(habit, date)) {
          total++;
          if (completions.some(c => c.habitId === habit.id && c.value !== false)) {
            completed++;
          }
        }
      });
      
      rates[habit.id] = total > 0 ? (completed / total) * 100 : 0;
    });
    
    return rates;
  };

  // Helper to check if a habit is due on a specific date
  const isHabitDueOnDate = (habit: Habit, dateStr: string): boolean => {
    // Skip check if the habit was created after this date
    // This would need habit creation date tracking
    
    const date = new Date(dateStr);
    
    // Check if the habit was skipped on this date
    if (habit.skippedDates?.includes(dateStr)) {
      return false;
    }
    
    switch (habit.frequency) {
      case "daily":
        return true;
        
      case "weekly":
        if (!habit.frequencyData?.daysOfWeek?.length) return true;
        const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
        return habit.frequencyData.daysOfWeek.includes(dayOfWeek);
        
      case "monthly":
        if (!habit.frequencyData?.daysOfMonth?.length) return true;
        const dayOfMonth = date.getDate(); // 1-31
        return habit.frequencyData.daysOfMonth.includes(dayOfMonth);
        
      case "custom":
        if (!habit.frequencyData?.interval || !habit.frequencyData?.startDate) return true;
        
        const startDate = new Date(habit.frequencyData.startDate);
        const diffTime = date.getTime() - startDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // If the difference is divisible by the interval, it's due today
        return diffDays % habit.frequencyData.interval === 0;
        
      default:
        return true;
    }
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
    updateHabitCompletion,
    reorderHabits,
    exportHabits,
    importHabits,
    isHabitDueToday,
    getActiveHabitsForToday,
    skipHabit,
    unskipHabit,
    isHabitSkipped
  };
};
