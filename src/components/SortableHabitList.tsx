import React, { useState } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent,
  TouchSensor 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Habit, HabitCompletion, CompletionValue } from '@/hooks/useHabits';
import HabitButton from './HabitButton';
import SuccessAnimation from './SuccessAnimation';
import { GripVertical } from 'lucide-react';

// Individual sortable habit item
interface SortableHabitItemProps {
  habit: Habit;
  completed: boolean;
  completionValue: CompletionValue | null;
  skipped: boolean;
  showSuccessEmoji: string | null;
  onToggle: (id: string) => void;
  onUpdateValue: (id: string, value: CompletionValue) => void;
  onSkip: (id: string) => void;
  onUnskip: (id: string) => void;
  onEdit: (habit: Habit) => void;
  showStreakBadge: boolean;
}

const SortableHabitItem = ({ 
  habit, 
  completed, 
  completionValue,
  skipped,
  showSuccessEmoji,
  onToggle, 
  onUpdateValue,
  onSkip,
  onUnskip,
  onEdit,
  showStreakBadge
}: SortableHabitItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    position: 'relative' as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative w-full mb-3 group"
    >
      <div className="flex items-center">
        <div 
          {...attributes} 
          {...listeners}
          className="drag-handle h-full flex items-center justify-center 
          cursor-grab active:cursor-grabbing touch-none p-2 mr-1
          text-muted-foreground/50 hover:text-muted-foreground
          opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={18} />
        </div>
        
        <div className="flex-grow">
          <HabitButton
            id={habit.id}
            name={habit.name}
            emoji={habit.emoji}
            streak={habit.streaks}
            completed={completed}
            onToggle={onToggle}
            onUpdateValue={onUpdateValue}
            showStreakBadge={showStreakBadge}
            trackingType={habit.trackingType}
            targetValue={habit.targetValue}
            unit={habit.unit}
            completionValue={completionValue}
            notes={habit.notes}
            onSkip={onSkip}
            onUnskip={onUnskip}
          />
        </div>
      </div>
      
      <button
        onClick={() => onEdit(habit)}
        className="edit-button"
        aria-label="Edit habit"
      >
        <span className="sr-only">Edit</span>
        <span className="text-sm">✏️</span>
      </button>
      
      <SuccessAnimation 
        show={showSuccessEmoji === habit.emoji} 
        emoji={habit.emoji} 
      />
    </div>
  );
};

// Main sortable list component
interface SortableHabitListProps {
  habits: Habit[];
  completedHabits: HabitCompletion[];
  showSuccessEmoji: string | null;
  onToggleHabit: (id: string) => void;
  onUpdateHabitValue: (id: string, value: CompletionValue) => void;
  onSkipHabit: (id: string) => void;
  onUnskipHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onReorderHabits: (newOrder: Habit[]) => void;
  showStreakBadges: boolean;
}

const SortableHabitList = ({
  habits,
  completedHabits,
  showSuccessEmoji,
  onToggleHabit,
  onUpdateHabitValue,
  onSkipHabit,
  onUnskipHabit,
  onEditHabit,
  onReorderHabits,
  showStreakBadges
}: SortableHabitListProps) => {
  // Configure sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms delay for touch devices
        tolerance: 5, // 5px of movement allowed during delay
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper to check if a habit is completed
  const isHabitCompleted = (habitId: string): boolean => {
    return completedHabits.some(h => h.habitId === habitId);
  };
  
  // Helper to get the completion value for a habit
  const getCompletionValue = (habitId: string): CompletionValue | null => {
    const completion = completedHabits.find(h => h.habitId === habitId);
    return completion ? completion.value : null;
  };
  
  // Helper to check if a habit is skipped for today
  const isHabitSkipped = (habitId: string): boolean => {
    const habit = habits.find(h => h.id === habitId);
    const today = new Date().toISOString().split('T')[0];
    return !!habit?.skippedDates?.includes(today);
  };

  // Handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = habits.findIndex(habit => habit.id === active.id);
      const newIndex = habits.findIndex(habit => habit.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newHabits = arrayMove(habits, oldIndex, newIndex);
        onReorderHabits(newHabits);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={habits.map(habit => habit.id)} 
        strategy={verticalListSortingStrategy}
      >
        {habits.map(habit => (
          <SortableHabitItem
            key={habit.id}
            habit={habit}
            completed={isHabitCompleted(habit.id)}
            completionValue={getCompletionValue(habit.id)}
            skipped={isHabitSkipped(habit.id)}
            showSuccessEmoji={showSuccessEmoji}
            onToggle={onToggleHabit}
            onUpdateValue={onUpdateHabitValue}
            onSkip={onSkipHabit}
            onUnskip={onUnskipHabit}
            onEdit={onEditHabit}
            showStreakBadge={showStreakBadges}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableHabitList; 