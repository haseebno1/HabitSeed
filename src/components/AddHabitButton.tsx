
import React from "react";
import { Plus } from "lucide-react";

interface AddHabitButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

const AddHabitButton = ({ onClick, disabled = false }: AddHabitButtonProps) => {
  return (
    <button 
      className="add-habit-button"
      onClick={onClick}
      disabled={disabled}
    >
      <Plus className="h-6 w-6" />
    </button>
  );
};

export default AddHabitButton;
