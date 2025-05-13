
import React from "react";
import { Plus } from "lucide-react";
import { motion } from "framer-motion";

interface AddHabitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AddHabitButton = ({ onClick, disabled = false }: AddHabitButtonProps) => {
  return (
    <motion.button 
      className="add-habit-button"
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <Plus className="h-6 w-6 mb-1" />
        <span className="text-xs font-medium">New Habit</span>
      </div>
      
      <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <div className="flex gap-1">
          <span className="text-lg">🌱</span>
          <span className="text-lg">→</span>
          <span className="text-lg">🌳</span>
        </div>
      </div>
    </motion.button>
  );
};

export default AddHabitButton;
