
import React from "react";
import { motion } from "framer-motion";
import { Habit } from "@/hooks/useHabits";
import HabitButton from "@/components/HabitButton";
import AddHabitButton from "@/components/AddHabitButton";
import SuccessAnimation from "@/components/SuccessAnimation";

export const MAX_HABITS = 3;

interface HabitListProps {
  habits: Habit[];
  completedHabits: string[];
  showSuccessEmoji: string | null;
  onToggleHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onAddHabit: () => void;
}

const HabitList = ({
  habits,
  completedHabits,
  showSuccessEmoji,
  onToggleHabit,
  onEditHabit,
  onAddHabit
}: HabitListProps) => {
  return (
    <motion.div
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
            onToggle={onToggleHabit}
          />
          
          <button
            onClick={() => onEditHabit(habit)}
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
        <AddHabitButton onClick={onAddHabit} />
      )}
    </motion.div>
  );
};

export default HabitList;
