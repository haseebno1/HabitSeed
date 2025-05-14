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
import { Habit } from '@/hooks/useHabits';
import HabitButton from './HabitButton';
import SuccessAnimation from './SuccessAnimation';
import { GripVertical } from 'lucide-react';

// Individual sortable habit item
interface SortableHabitItemProps {
  habit: Habit;
  completed: boolean;
  showSuccessEmoji: string | null;
  onToggle: (id: string) => void;
  onEdit: (habit: Habit) => void;
  showStreakBadge: boolean;
}

const SortableHabitItem = ({ 
  habit, 
  completed, 
  showSuccessEmoji,
  onToggle, 
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
            showStreakBadge={showStreakBadge}
          />
        </div>
      </div>
      
      <button
        onClick={() => onEdit(habit)}
        className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-secondary/80 
        flex items-center justify-center hover:bg-primary/20 transition-colors"
        aria-label="Edit habit"
      >
        <span className="sr-only">Edit</span>
        <span className="text-xs">✏️</span>
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
  completedHabits: string[];
  showSuccessEmoji: string | null;
  onToggleHabit: (id: string) => void;
  onEditHabit: (habit: Habit) => void;
  onReorderHabits: (newOrder: Habit[]) => void;
  showStreakBadges: boolean;
}

const SortableHabitList = ({
  habits,
  completedHabits,
  showSuccessEmoji,
  onToggleHabit,
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
            completed={completedHabits.includes(habit.id)}
            showSuccessEmoji={showSuccessEmoji}
            onToggle={onToggleHabit}
            onEdit={onEditHabit}
            showStreakBadge={showStreakBadges}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
};

export default SortableHabitList; 