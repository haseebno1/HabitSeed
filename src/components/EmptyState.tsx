
import React from "react";
import { Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  onAddHabit: () => void;
}

const EmptyState = ({ onAddHabit }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center h-[60vh]">
      <div className="rounded-full bg-secondary/50 p-4 mb-4">
        <Sprout className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Start Your First Habit</h2>
      <p className="text-muted-foreground mb-2 max-w-xs">
        Add up to 3 simple habits you want to track daily. Tap to check them off.
      </p>
      <div className="text-muted-foreground mb-6 flex flex-wrap items-center justify-center gap-1 max-w-xs">
        <span>Watch them grow from</span> 
        <div className="flex items-center">
          <span className="text-lg">🌱</span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🌿</span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🪴</span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🌳</span>
        </div>
      </div>
      <Button 
        onClick={onAddHabit} 
        className="w-full max-w-xs flex items-center justify-center py-6"
        size="lg"
      >
        Add Your First Habit
      </Button>
    </div>
  );
};

export default EmptyState;
