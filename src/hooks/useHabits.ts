
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getToday, isMilestoneStreak, getMilestoneMessage } from "@/lib/utils";

// Define types
export interface Habit {
  id: string;
  name: string;
  emoji: string;
  streaks: number;
  lastCompleted: string | null;
}

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [showSuccessEmoji, setShowSuccessEmoji] = useState<string | null>(null);
  
  // Load habits and today's completions on mount
  useEffect(() => {
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
    
    const today = getToday();
    const storedCompletions = localStorage.getItem(`completions_${today}`);
    if (storedCompletions) {
      setCompletedHabits(JSON.parse(storedCompletions));
    }
  }, []);
  
  // Save habits whenever they change
  useEffect(() => {
    localStorage.setItem("habits", JSON.stringify(habits));
  }, [habits]);
  
  // Save completions whenever they change
  useEffect(() => {
    const today = getToday();
    localStorage.setItem(`completions_${today}`, JSON.stringify(completedHabits));
  }, [completedHabits]);
  
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
    } else {
      // Complete the habit
      setCompletedHabits(prev => [...prev, id]);
      
      // Show the success animation
      setShowSuccessEmoji(habit.emoji);
      setTimeout(() => setShowSuccessEmoji(null), 1000);
      
      // Update the streak
      const updatedHabits = habits.map(h => {
        if (h.id !== id) return h;
        
        // If this is consecutive day completion, increase streak
        const newStreak = h.lastCompleted ? h.streaks + 1 : 1;
        
        // Check if this is a milestone streak
        if (isMilestoneStreak(newStreak)) {
          setTimeout(() => {
            toast(getMilestoneMessage(newStreak), {
              duration: 4000,
            });
          }, 500);
        } else {
          toast("Habit completed! Keep it up! 🌱");
        }
        
        return { ...h, streaks: newStreak, lastCompleted: today };
      });
      
      setHabits(updatedHabits);
    }
  };
  
  const addHabit = (habitData: { name: string; emoji: string }) => {
    const newHabit: Habit = {
      id: crypto.randomUUID(),
      name: habitData.name,
      emoji: habitData.emoji,
      streaks: 0,
      lastCompleted: null,
    };
    
    setHabits(prev => [...prev, newHabit]);
    toast("New habit added! 🌱");
    
    return newHabit;
  };
  
  const updateHabit = (habitData: { id: string; name: string; emoji: string }) => {
    setHabits(prev => 
      prev.map(h => 
        h.id === habitData.id 
          ? { ...h, name: habitData.name, emoji: habitData.emoji } 
          : h
      )
    );
    toast("Habit updated successfully!");
  };
  
  const deleteHabit = (id: string) => {
    setHabits(prev => prev.filter(h => h.id !== id));
    setCompletedHabits(prev => prev.filter(habitId => habitId !== id));
    toast("Habit deleted.");
  };
  
  return {
    habits,
    completedHabits,
    showSuccessEmoji,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit
  };
};
