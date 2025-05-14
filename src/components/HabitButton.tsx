import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, getGrowthStageEmoji, isMilestoneStreak } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitButtonProps {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
  showStreakBadge?: boolean;
}

const HabitButton = ({
  id,
  name,
  emoji,
  streak,
  completed,
  onToggle,
  showStreakBadge = true,
}: HabitButtonProps) => {
  const [showMilestone, setShowMilestone] = useState(false);
  const [prevStreak, setPrevStreak] = useState(streak);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Show milestone animation when streak reaches a milestone
  useEffect(() => {
    if (streak > prevStreak && isMilestoneStreak(streak)) {
      setShowMilestone(true);
      const timer = setTimeout(() => setShowMilestone(false), 3000);
      return () => clearTimeout(timer);
    }
    setPrevStreak(streak);
  }, [streak, prevStreak]);

  // Get the appropriate growth emoji based on streak
  const displayEmoji = emoji === "🌱" ? getGrowthStageEmoji(streak, emoji) : emoji;

  // Handle click with animation
  const handleToggle = () => {
    if (!completed) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 500);
    }
    onToggle(id);
  };

  return (
    <motion.button
      className={cn(
        "habit-button",
        completed && "habit-completed",
        isAnimating && "animate-pulse-light"
      )}
      onClick={handleToggle}
      whileTap={{ scale: 0.97 }}
      layout
    >
      <div className="flex items-center w-full">
        <div className="emoji-container relative mr-3">
          <motion.div
            key={displayEmoji}
            initial={{ scale: streak > prevStreak ? 0.5 : 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {displayEmoji}
          </motion.div>
          
          {completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Check className="text-primary h-8 w-8 stroke-[3]" />
            </motion.div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 items-start">
          <span className="text-sm font-medium text-left truncate max-w-full">
            {name}
          </span>
          {streak > 0 && (
            <span className="text-xs text-muted-foreground">
              {streak} day streak
            </span>
          )}
        </div>
        
        {streak > 0 && showStreakBadge && (
          <motion.span
            className="streak-badge-inline"
            initial={streak > prevStreak ? { scale: 1.5 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            {streak}
          </motion.span>
        )}
      </div>
      
      <AnimatePresence>
        {showMilestone && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full"
          >
            <div className="bg-primary text-primary-foreground px-2 py-1 rounded-full text-xs whitespace-nowrap">
              🎉 {streak} day streak!
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

export default HabitButton;
