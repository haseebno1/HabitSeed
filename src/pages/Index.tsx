
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import HabitForm from "@/components/HabitForm";
import EmptyState from "@/components/EmptyState";
import HabitList from "@/components/HabitList";
import { useHabits, Habit } from "@/hooks/useHabits";
import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";

const Index = () => {
  const {
    habits,
    completedHabits,
    showSuccessEmoji,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit,
    isInitialized
  } = useHabits();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  const handleOpenForm = (habit: Habit | null = null) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };
  
  const handleSaveHabit = (habitData: { name: string; emoji: string; id?: string }) => {
    if (habitData.id) {
      // Edit existing habit
      updateHabit({
        id: habitData.id,
        name: habitData.name,
        emoji: habitData.emoji
      });
    } else {
      // Add new habit
      addHabit(habitData);
    }
    
    handleCloseForm();
  };
  
  const handleDeleteHabit = () => {
    if (!editingHabit) return;
    deleteHabit(editingHabit.id);
    handleCloseForm();
  };

  // Get today's date for display
  const today = new Date();
  const formattedDate = format(today, "EEEE, MMMM d");
  
  return (
    <Layout>
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <CalendarCheck className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        </div>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>

      <div className="min-h-[60vh]">
        {!isInitialized ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {habits.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full"
              >
                <EmptyState onAddHabit={() => handleOpenForm()} />
              </motion.div>
            ) : (
              <HabitList
                key="habits"
                habits={habits}
                completedHabits={completedHabits}
                showSuccessEmoji={showSuccessEmoji}
                onToggleHabit={toggleHabit}
                onEditHabit={handleOpenForm}
                onAddHabit={() => handleOpenForm()}
              />
            )}
          </AnimatePresence>
        )}
      </div>
      
      <HabitForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveHabit}
        onDelete={editingHabit ? handleDeleteHabit : undefined}
        initialValues={editingHabit || undefined}
      />
    </Layout>
  );
};

export default Index;
