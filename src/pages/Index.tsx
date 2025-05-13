
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import HabitButton from "@/components/HabitButton";
import AddHabitButton from "@/components/AddHabitButton";
import HabitForm from "@/components/HabitForm";
import EmptyState from "@/components/EmptyState";
import SuccessAnimation from "@/components/SuccessAnimation";
import { getToday, isMilestoneStreak, getMilestoneMessage } from "@/lib/utils";

// Define types
interface Habit {
  id: string;
  name: string;
  emoji: string;
  streaks: number;
  lastCompleted: string | null;
}

const MAX_HABITS = 3;

const Index = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
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
  
  const handleHabitToggle = (id: string) => {
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
  
  const handleOpenForm = (habit: Habit | null = null) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };
  
  const handleSaveHabit = (habitData: { name: string; emoji: string; id?: string }) => {
    if (habitData.id) {
      // Edit existing habit
      setHabits(prev => 
        prev.map(h => 
          h.id === habitData.id 
            ? { ...h, name: habitData.name, emoji: habitData.emoji } 
            : h
        )
      );
      toast("Habit updated successfully!");
    } else {
      // Add new habit
      const newHabit: Habit = {
        id: crypto.randomUUID(),
        name: habitData.name,
        emoji: habitData.emoji,
        streaks: 0,
        lastCompleted: null,
      };
      
      setHabits(prev => [...prev, newHabit]);
      toast("New habit added! 🌱");
    }
    
    handleCloseForm();
  };
  
  const handleDeleteHabit = () => {
    if (!editingHabit) return;
    
    setHabits(prev => prev.filter(h => h.id !== editingHabit.id));
    setCompletedHabits(prev => prev.filter(id => id !== editingHabit.id));
    handleCloseForm();
    toast("Habit deleted.");
  };
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        {habits.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <EmptyState onAddHabit={() => handleOpenForm()} />
          </motion.div>
        ) : (
          <motion.div
            key="habits"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            {habits.map(habit => (
              <div key={habit.id} className="relative">
                <HabitButton
                  id={habit.id}
                  name={habit.name}
                  emoji={habit.emoji}
                  streak={habit.streaks}
                  completed={completedHabits.includes(habit.id)}
                  onToggle={handleHabitToggle}
                />
                
                <button
                  onClick={() => handleOpenForm(habit)}
                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-secondary/80 
                  flex items-center justify-center hover:bg-primary/20 transition-colors"
                >
                  <span className="sr-only">Edit</span>
                  <span className="text-xs">✏️</span>
                </button>
                
                <SuccessAnimation 
                  show={showSuccessEmoji === habit.emoji} 
                  emoji={habit.emoji} 
                />
              </div>
            ))}
            
            {habits.length < MAX_HABITS && (
              <AddHabitButton onClick={() => handleOpenForm()} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      <HabitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveHabit}
        onDelete={editingHabit ? handleDeleteHabit : undefined}
        initialValues={editingHabit || undefined}
      />
    </Layout>
  );
};

export default Index;
