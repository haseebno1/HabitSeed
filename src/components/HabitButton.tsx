
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HabitButtonProps {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  completed: boolean;
  onToggle: (id: string) => void;
}

const HabitButton = ({
  id,
  name,
  emoji,
  streak,
  completed,
  onToggle,
}: HabitButtonProps) => {
  return (
    <motion.button
      className={cn(
        "habit-button",
        completed && "habit-completed"
      )}
      onClick={() => onToggle(id)}
      whileTap={{ scale: 0.95 }}
      layout
    >
      {streak > 0 && (
        <span className="streak-badge">{streak}</span>
      )}
      
      <div className="emoji-container">
        {emoji}
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
      
      <span className="text-sm font-medium truncate max-w-full px-1">
        {name}
      </span>
    </motion.button>
  );
};

export default HabitButton;
