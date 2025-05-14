import React from "react";
import { motion } from "framer-motion";
import { Habit } from "@/hooks/useHabits";
import { useSettings } from "@/hooks/useSettings";
import HabitButton from "@/components/HabitButton";
import AddHabitButton from "@/components/AddHabitButton";
import SuccessAnimation from "@/components/SuccessAnimation";

// Default value, will be overridden by settings
const DEFAULT_MAX_HABITS = 3;

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
  const { maxHabits, showStreakBadges } = useSettings();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col gap-3 px-1 py-2 mb-4"
    >
      {habits.map(habit => (
        <div key={habit.id} className="relative w-full">
          <HabitButton
            id={habit.id}
            name={habit.name}
            emoji={habit.emoji}
            streak={habit.streaks}
            completed={completedHabits.includes(habit.id)}
            onToggle={onToggleHabit}
            showStreakBadge={showStreakBadges}
          />
          
          <button
            onClick={() => onEditHabit(habit)}
            className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-secondary/80 
            flex items-center justify-center hover:bg-primary/20 transition-colors"
            aria-label="Edit habit"
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
      
      {habits.length < maxHabits && (
        <AddHabitButton onClick={onAddHabit} />
      )}
    </motion.div>
  );
};

export default HabitList;
