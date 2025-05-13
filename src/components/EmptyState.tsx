
import React from "react";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddHabit: () => void;
}

const EmptyState = ({ onAddHabit }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh]">
      <div className="rounded-full bg-secondary/50 p-4 mb-4">
        <Sprout className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Start Your First Habit</h2>
      <p className="text-muted-foreground mb-2 max-w-xs">
        Add up to 3 simple habits you want to track daily. Tap to check them off.
      </p>
      <p className="text-muted-foreground mb-6 max-w-xs flex items-center justify-center gap-2">
        <span>Watch them grow from</span> 
        <span className="text-lg">🌱</span> 
        <span className="text-lg">→</span> 
        <span className="text-lg">🌿</span> 
        <span className="text-lg">→</span> 
        <span className="text-lg">🪴</span> 
        <span className="text-lg">→</span> 
        <span className="text-lg">🌳</span>
      </p>
      <Button onClick={onAddHabit} className="flex items-center">
        Add Your First Habit
      </Button>
    </div>
  );
};

export default EmptyState;
