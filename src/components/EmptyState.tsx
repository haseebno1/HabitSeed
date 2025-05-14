import React, { useState } from "react";
import { Sprout, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface EmptyStateProps {
  onAddHabit: () => void;
}

interface SuggestedHabit {
  emoji: string;
  name: string;
}

const SUGGESTED_HABITS: SuggestedHabit[] = [
  { emoji: "💧", name: "Drink water" },
  { emoji: "🏃‍♂️", name: "Exercise" },
  { emoji: "📚", name: "Read a book" },
  { emoji: "🧘‍♀️", name: "Meditate" },
  { emoji: "💤", name: "Sleep early" },
  { emoji: "🌿", name: "Eat vegetables" },
  { emoji: "📝", name: "Journal" },
  { emoji: "🧹", name: "Clean home" },
];

const EmptyState = ({ onAddHabit }: EmptyStateProps) => {
  const [selectedHabit, setSelectedHabit] = useState<SuggestedHabit | null>(null);
  
  const handleAddSuggested = () => {
    if (selectedHabit) {
      // We'll pass this to the add habit function through a custom event
      // This way we can pre-fill the form with the selected habit
      const customEvent = new CustomEvent('prefill-habit', { 
        detail: selectedHabit 
      });
      window.dispatchEvent(customEvent);
      onAddHabit();
    } else {
      onAddHabit();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-4 py-6 text-center min-h-[60vh]"
    >
      <motion.div 
        className="rounded-full bg-secondary/50 p-5 mb-5"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ 
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Sprout className="h-12 w-12 text-primary" />
      </motion.div>
      
      <h2 className="text-2xl font-semibold mb-3">Plant Your First Habit</h2>
      
      <p className="text-muted-foreground mb-4 max-w-sm">
        Habits are like seeds that grow stronger with daily care. Start by tracking small, consistent actions.
      </p>
      
      <div className="text-muted-foreground mb-6 flex flex-wrap items-center justify-center gap-1 max-w-xs">
        <span>Watch them grow from</span> 
        <div className="flex items-center">
          <motion.span 
            className="text-lg"
            initial={{ y: 0 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 1 }}
          >🌱</motion.span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🌿</span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🪴</span> 
          <span className="text-lg mx-1">→</span> 
          <span className="text-lg">🌳</span>
        </div>
      </div>
      
      <div className="mb-6 max-w-sm">
        <h3 className="text-base font-medium mb-3">Need ideas? Try one of these:</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUGGESTED_HABITS.slice(0, 4).map((habit) => (
            <motion.button
              key={habit.name}
              className={`p-3 rounded-xl border-2 flex flex-col items-center transition-all ${
                selectedHabit?.name === habit.name 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/30'
              }`}
              onClick={() => setSelectedHabit(habit)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-2xl mb-1">{habit.emoji}</span>
              <span className="text-xs font-medium">{habit.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
      
      <Button 
        onClick={handleAddSuggested}
        className="w-full max-w-xs flex items-center justify-center py-6 gap-2"
        size="lg"
      >
        {selectedHabit ? (
          <>
            <span>Add {selectedHabit.emoji} {selectedHabit.name}</span>
            <ArrowRight className="h-4 w-4" />
          </>
        ) : (
          <>
            <PlusCircle className="h-5 w-5 mr-1" />
            <span>Add Custom Habit</span>
          </>
        )}
      </Button>
    </motion.div>
  );
};

export default EmptyState;
