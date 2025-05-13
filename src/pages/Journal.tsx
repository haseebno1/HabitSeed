
import React, { useState, useEffect } from 'react';
import { format, addDays, subDays, startOfWeek } from 'date-fns';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, BarChart, CalendarCheck } from 'lucide-react';
import { getToday } from '@/lib/utils';
import HabitStats from '@/components/HabitStats';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  streaks: number;
  lastCompleted: string | null;
}

interface DayData {
  date: Date;
  formattedDate: string;
  dayName: string;
  isToday: boolean;
  completedHabits: string[];
}

const Journal = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [completionsByDay, setCompletionsByDay] = useState<{[key: string]: string[]}>({});
  const [activeTab, setActiveTab] = useState('journal');

  // Load habits
  useEffect(() => {
    const storedHabits = localStorage.getItem("habits");
    if (storedHabits) {
      setHabits(JSON.parse(storedHabits));
    }
  }, []);

  // Generate week data when week changes or habits load
  useEffect(() => {
    const generateWeekData = () => {
      const days: DayData[] = [];
      const today = getToday();
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(currentWeekStart, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const isToday = formattedDate === today;
        
        // Get completed habits for this day
        const dayCompletions = localStorage.getItem(`completions_${formattedDate}`);
        const completedHabits = dayCompletions ? JSON.parse(dayCompletions) : [];
        
        days.push({
          date,
          formattedDate,
          dayName: format(date, 'EEE'),
          isToday,
          completedHabits,
        });
      }
      
      setWeekData(days);
    };
    
    generateWeekData();
  }, [currentWeekStart, habits]);

  // Load completion data for all days
  useEffect(() => {
    const allCompletions: {[key: string]: string[]} = {};
    
    // Get all localStorage keys that start with "completions_"
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('completions_')) {
        const date = key.replace('completions_', '');
        const completions = JSON.parse(localStorage.getItem(key) || '[]');
        allCompletions[date] = completions;
      }
    });
    
    setCompletionsByDay(allCompletions);
  }, []);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevDate => subDays(prevDate, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <Layout>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 mb-2">
          <TabsTrigger value="journal" className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            <span>Journal</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Stats</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journal" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Weekly Journal</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" onClick={goToPreviousWeek}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {weekData.map((day) => (
              <Card key={day.formattedDate} className={`p-4 ${day.isToday ? 'border-primary/40' : ''}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium">{day.dayName}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(day.date, 'MMMM d, yyyy')}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    {habits.map((habit) => {
                      const isCompleted = day.completedHabits.includes(habit.id);
                      return (
                        <div 
                          key={habit.id}
                          className={`w-10 h-10 rounded-full flex items-center justify-center 
                          ${isCompleted ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
                          title={habit.name}
                        >
                          <span>{habit.emoji}</span>
                        </div>
                      );
                    })}
                    {habits.length === 0 && (
                      <div className="text-sm text-muted-foreground px-3 py-1">
                        No habits yet
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="stats">
          <HabitStats 
            habits={habits} 
            completionsByDay={completionsByDay} 
          />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Journal;
