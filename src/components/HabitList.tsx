import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Habit } from "@/hooks/useHabits";
import { useSettings } from "@/hooks/useSettings";
import HabitButton from "@/components/HabitButton";
import AddHabitButton from "@/components/AddHabitButton";
import SuccessAnimation from "@/components/SuccessAnimation";
import ConfettiAnimation from "@/components/ConfettiAnimation";

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
  const [showConfetti, setShowConfetti] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  
  // Track completion count to trigger confetti on appropriate events
  useEffect(() => {
    const count = completedHabits.length;
    
    // Only show confetti when completion count increases
    if (count > completedCount) {
      setShowConfetti(true);
      
      // If all habits are completed, show more confetti!
      if (count === habits.length && habits.length > 0) {
        // Extra confetti for completing all habits
        setTimeout(() => setShowConfetti(false), 100);
        setTimeout(() => setShowConfetti(true), 200);
      } else {
        setTimeout(() => setShowConfetti(false), 2000);
      }
    }
    
    setCompletedCount(count);
  }, [completedHabits.length, habits.length, completedCount]);
  
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
            className="edit-button"
            aria-label="Edit habit"
          >
            <span className="sr-only">Edit</span>
            <span className="text-sm">✏️</span>
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
      
      {/* Show confetti when completing habits */}
      <ConfettiAnimation 
        show={showConfetti} 
        duration={2500}
        count={completedHabits.length === habits.length ? 150 : 60}
      />
    </motion.div>
  );
};

export default HabitList;
