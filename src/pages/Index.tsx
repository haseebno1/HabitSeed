
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import HabitForm from "@/components/HabitForm";
import EmptyState from "@/components/EmptyState";
import HabitList, { MAX_HABITS } from "@/components/HabitList";
import { useHabits, Habit } from "@/hooks/useHabits";

const Index = () => {
  const {
    habits,
    completedHabits,
    showSuccessEmoji,
    toggleHabit,
    addHabit,
    updateHabit,
    deleteHabit
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
  
  return (
    <Layout>
      <AnimatePresence mode="wait">
        {habits.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
