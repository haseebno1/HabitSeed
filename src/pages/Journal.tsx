import React, { useState, useEffect, useCallback } from 'react';
import { format, addDays, subDays, startOfWeek, isToday } from 'date-fns';
import Layout from '@/components/Layout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, ChevronRight, BarChart, CalendarCheck, CheckCircle, XCircle } from 'lucide-react';
import { getToday } from '@/lib/utils';
import HabitStats from '@/components/HabitStats';
import { useSettings } from '@/hooks/useSettings';
import { useHabits } from '@/hooks/useHabits';
import storage from '@/lib/storage';

interface DayData {
  date: Date;
  formattedDate: string;
  dayName: string;
  isToday: boolean;
  completedHabits: string[];
}

const Journal = () => {
  const { habits, completedHabits, isInitialized: habitsInitialized } = useHabits();
  const { showStreakBadges } = useSettings();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [completionsByDay, setCompletionsByDay] = useState<{[key: string]: string[]}>({});
  const [activeTab, setActiveTab] = useState('journal');
  const [isLoading, setIsLoading] = useState(true);
  
  // Load completions from IndexedDB
  const loadCompletions = useCallback(async () => {
    if (!habitsInitialized) return;
    
    setIsLoading(true);
    try {
      // Get all completions
      const allCompletions = await storage.getAllCompletions();

      // Ensure the completions data is updated with the current value from the Today tab
      const today = getToday();
      if (completedHabits && completedHabits.length > 0) {
        allCompletions[today] = [...completedHabits];
      }
      
      setCompletionsByDay(allCompletions);
    } catch (error) {
      console.error("Error loading completions data:", error);
      
      // Fallback to localStorage if needed
      const allCompletions: {[key: string]: string[]} = {};
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('completions_')) {
          const date = key.replace('completions_', '');
          const completions = JSON.parse(localStorage.getItem(key) || '[]');
          allCompletions[date] = completions;
        }
      });

      // Also update with today's completions in the localStorage fallback
      const today = getToday();
      if (completedHabits && completedHabits.length > 0) {
        allCompletions[today] = [...completedHabits];
      }
      
      setCompletionsByDay(allCompletions);
    } finally {
      setIsLoading(false);
    }
  }, [habitsInitialized, completedHabits]);

  // Load completions whenever habits are initialized, or activeTab changes, or completedHabits changes
  useEffect(() => {
    if (habitsInitialized) {
      loadCompletions();
    }
  }, [habitsInitialized, loadCompletions, completedHabits]);

  // Refresh data when switching to journal or stats tab to ensure accurate data
  useEffect(() => {
    if ((activeTab === 'journal' || activeTab === 'stats') && habitsInitialized) {
      loadCompletions();
    }
  }, [activeTab, habitsInitialized, loadCompletions]);

  // Generate week data when week changes or completions load
  useEffect(() => {
    if (isLoading || !habitsInitialized) return;
    
    const generateWeekData = () => {
      const days: DayData[] = [];
      const today = getToday();
      
      for (let i = 0; i < 7; i++) {
        const date = addDays(currentWeekStart, i);
        const formattedDate = format(date, 'yyyy-MM-dd');
        const isCurrentDay = formattedDate === today;
        
        // Always use data from completionsByDay, which now includes today's completions
        const dayCompletions = completionsByDay[formattedDate] || [];
        
        days.push({
          date,
          formattedDate,
          dayName: format(date, 'EEE'),
          isToday: isCurrentDay,
          completedHabits: dayCompletions,
        });
      }
      
      setWeekData(days);
    };
    
    generateWeekData();
  }, [currentWeekStart, completionsByDay, isLoading, habitsInitialized]);

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prevDate => subDays(prevDate, 7));
  };

  const goToNextWeek = () => {
    setCurrentWeekStart(prevDate => addDays(prevDate, 7));
  };

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  // Determine if current week contains today
  const isCurrentWeek = weekData.some(day => day.isToday);

  // Get the percentage of habits completed for the week
  const getWeeklyCompletionSummary = () => {
    if (habits.length === 0) return { total: 0, completed: 0, percentage: 0 };
    
    let totalPossible = habits.length * weekData.length;
    let totalCompleted = 0;
    
    weekData.forEach(day => {
      totalCompleted += day.completedHabits.length;
    });
    
    return {
      total: totalPossible,
      completed: totalCompleted,
      percentage: Math.round((totalCompleted / totalPossible) * 100)
    };
  };

  const weekSummary = getWeeklyCompletionSummary();

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
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToCurrentWeek}
                className={isCurrentWeek ? "border-primary/40 text-primary" : ""}
              >
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextWeek}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isLoading || !habitsInitialized ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Weekly summary card */}
              {habits.length > 0 && (
                <Card className="p-4 bg-muted/30 mb-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold">Week Overview</h3>
                      <p className="text-xs text-muted-foreground">
                        {format(weekData[0]?.date || new Date(), 'MMM d')} - {format(weekData[6]?.date || new Date(), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xl font-bold">{weekSummary.percentage}%</span>
                      <span className="text-xs text-muted-foreground">
                        {weekSummary.completed}/{weekSummary.total} completed
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full mt-2">
                    <div 
                      className="h-2 bg-primary rounded-full" 
                      style={{ width: `${weekSummary.percentage}%` }}
                    ></div>
                  </div>
                </Card>
              )}
              
              <div className="space-y-4">
                {weekData.map((day) => (
                  <Card 
                    key={day.formattedDate} 
                    className={`p-4 ${day.isToday ? 'border-primary/40' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {day.dayName}
                          {day.isToday && (
                            <span className="ml-2 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                              Today
                            </span>
                          )}
                        </div>
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
                              className="relative"
                              title={habit.name}
                            >
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center 
                                ${isCompleted ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}
                              >
                                <span>{habit.emoji}</span>
                                {isCompleted ? (
                                  <CheckCircle className="absolute bottom-0 right-0 h-4 w-4 text-primary bg-background rounded-full" />
                                ) : (
                                  <XCircle className="absolute bottom-0 right-0 h-4 w-4 text-muted-foreground/50 bg-background rounded-full" />
                                )}
                              </div>
                              {/* Only show streak badge on habits for days that aren't today */}
                              {showStreakBadges && habit.streaks > 0 && !day.isToday && (
                                <div className="streak-badge">
                                  {habit.streaks}
                                </div>
                              )}
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
                    
                    {/* Show habit completion summary for this day */}
                    {habits.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-primary" />
                              {day.completedHabits.length}/{habits.length} completed
                            </span>
                          </p>
                          <div className="w-24 h-1.5 bg-muted rounded-full">
                            <div 
                              className="h-1.5 bg-primary rounded-full" 
                              style={{ width: `${(day.completedHabits.length / habits.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {day.isToday && (
                      <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                        <p>Complete your habits for today on the Today tab</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
        
        <TabsContent value="stats">
          {isLoading || !habitsInitialized ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <HabitStats 
              habits={habits} 
              completionsByDay={completionsByDay}
            />
          )}
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Journal;
