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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      aria-label="Add new habit"
    >
      <div className="flex items-center justify-center">
        <Plus className="h-5 w-5 mr-2" />
        <span className="text-sm font-medium">Add New Habit</span>
      </div>
    </motion.button>
  );
};

export default AddHabitButton;
