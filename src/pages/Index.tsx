import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Layout from "@/components/Layout";
import PageTransition from "@/components/PageTransition";
import HabitForm from "@/components/HabitForm";
import EmptyState from "@/components/EmptyState";
import HabitList from "@/components/HabitList";
import SortableHabitList from "@/components/SortableHabitList";
import { useHabits, Habit, CompletionValue, FrequencyType } from "@/hooks/useHabits";
import { useSettings } from "@/hooks/useSettings";
import { format } from "date-fns";
import { CalendarCheck } from "lucide-react";
import AddHabitButton from "@/components/AddHabitButton";
import ConfettiAnimation from "@/components/ConfettiAnimation";
import { HabitTemplateDialog } from "@/components/HabitTemplateDialog";
import { HabitTemplate } from "@/lib/habitTemplates";

const Index = () => {
  const {
    habits,
    completedHabits,
    showSuccessEmoji,
    toggleHabit,
    updateHabitCompletion,
    addHabit,
    updateHabit,
    deleteHabit,
    reorderHabits,
    isInitialized,
    getActiveHabitsForToday,
    skipHabit,
    unskipHabit,
    isHabitSkipped
  } = useHabits();
  
  const { showStreakBadges, maxHabits } = useSettings();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  
  // Get habits that are due today based on their frequency
  const activeHabits = getActiveHabitsForToday();
  
  const handleOpenForm = (habit: Habit | null = null) => {
    setEditingHabit(habit);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHabit(null);
  };
  
  const handleSaveHabit = (habitData: { 
    name: string; 
    emoji: string; 
    id?: string;
    trackingType: string;
    targetValue?: number;
    unit?: string;
    frequency: string;
    frequencyData?: {
      daysOfWeek?: number[];
      daysOfMonth?: number[];
      interval?: number;
      startDate?: string;
    };
    notes?: string;
  }) => {
    if (habitData.id) {
      // Edit existing habit
      updateHabit({
        id: habitData.id,
        name: habitData.name,
        emoji: habitData.emoji,
        trackingType: habitData.trackingType as any,
        targetValue: habitData.targetValue,
        unit: habitData.unit,
        frequency: habitData.frequency as FrequencyType,
        frequencyData: habitData.frequencyData,
        notes: habitData.notes
      });
    } else {
      // Add new habit
      addHabit({
        name: habitData.name,
        emoji: habitData.emoji,
        trackingType: habitData.trackingType as any,
        targetValue: habitData.targetValue,
        unit: habitData.unit,
        frequency: habitData.frequency as FrequencyType,
        frequencyData: habitData.frequencyData,
        notes: habitData.notes
      });
      // Show a small confetti animation when adding a new habit
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
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
  
  // Handle reordering of habits
  const handleReorderHabits = (newHabits: Habit[]) => {
    reorderHabits(newHabits);
  };
  
  // Handle updating habit value
  const handleUpdateHabitValue = (id: string, value: CompletionValue) => {
    updateHabitCompletion(id, value);
  };

  const handleTemplateSelect = (template: HabitTemplate) => {
    addHabit({
      name: template.name,
      emoji: template.emoji,
      trackingType: template.trackingType,
      targetValue: template.targetValue,
      unit: template.unit,
      frequency: template.frequency,
      frequencyData: template.frequencyData,
      notes: template.description
    });
    
    // Show a confetti animation when adding from template
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2000);
  };

  return (
    <Layout>
      <PageTransition>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <CalendarCheck className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">Today</h1>
          </div>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>

        {!isInitialized ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeHabits.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <EmptyState onAddHabit={() => handleOpenForm()} />
              </motion.div>
            ) : (
              <motion.div
                key="habits"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-3 px-1 py-2 mb-4 pb-6"
              >
                <SortableHabitList
                  habits={activeHabits}
                  completedHabits={completedHabits}
                  showSuccessEmoji={showSuccessEmoji}
                  onToggleHabit={toggleHabit}
                  onUpdateHabitValue={handleUpdateHabitValue}
                  onSkipHabit={skipHabit}
                  onUnskipHabit={unskipHabit}
                  onEditHabit={handleOpenForm}
                  onReorderHabits={handleReorderHabits}
                  showStreakBadges={showStreakBadges}
                />
                
                {habits.length < maxHabits && (
                  <AddHabitButton 
                    onClick={() => handleOpenForm()} 
                    onTemplateClick={() => setIsTemplateDialogOpen(true)}
                  />
                )}
                
                <ConfettiAnimation show={showConfetti} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
        
        <HabitForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSave={handleSaveHabit}
          onDelete={editingHabit ? handleDeleteHabit : undefined}
          initialValues={editingHabit || undefined}
        />
        
        <HabitTemplateDialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
          onSelectTemplate={handleTemplateSelect}
        />
      </PageTransition>
    </Layout>
  );
};

export default Index;
