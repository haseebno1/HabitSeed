import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, isBefore, parseISO } from 'date-fns';
import { Trophy, Percent, Calendar, Award, CheckCircle } from 'lucide-react';
import { getGrowthStageEmoji, getToday } from '@/lib/utils';

interface HabitStatsProps {
  habits: {
    id: string;
    name: string;
    emoji: string;
    streaks: number;
    lastCompleted?: string | null;
  }[];
  completionsByDay: {
    [key: string]: string[];
  };
}

const HabitStats: React.FC<HabitStatsProps> = ({ habits, completionsByDay }) => {
  // Calculate stats with useMemo for performance
  const stats = useMemo(() => {
    // Get best streak
    const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streaks || 0), 0);
    const habitWithBestStreak = habits.find(h => h.streaks === bestStreak);
    
    // Calculate completion rate for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    // Calculate how many days had habits (avoid division by zero)
    let daysWithHabits = 0;
    let totalCompletionsPossible = 0;
    let totalCompletions = 0;
    
    last7Days.forEach(date => {
      if (habits.length > 0) {
        daysWithHabits++;
        totalCompletionsPossible += habits.length;
        const completed = completionsByDay[date] || [];
        totalCompletions += completed.length;
      }
    });
    
    const completionRate = daysWithHabits === 0 ? 
      0 : 
      Math.round((totalCompletions / totalCompletionsPossible) * 100);
    
    // Generate completion data for the heatmap
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const completions = completionsByDay[dateStr] || [];
      
      return {
        date: dateStr,
        display: format(date, 'MMM d'),
        completions: completions.length,
        total: habits.length || 1
      };
    });
    
    // Calculate longest streak for each habit (sorting by streak)
    const habitsWithStreaks = habits
      .filter(habit => habit.streaks > 0)
      .sort((a, b) => (b.streaks || 0) - (a.streaks || 0));
    
    // Calculate most completed habit
    const habitCompletionCounts = habits.map(habit => {
      let completionCount = 0;
      
      // Count occurrences of this habit ID across all days in completionsByDay
      Object.entries(completionsByDay).forEach(([date, habitIds]) => {
        if (habitIds.includes(habit.id)) {
          completionCount++;
        }
      });
      
      return {
        ...habit,
        completionCount
      };
    }).sort((a, b) => b.completionCount - a.completionCount);
    
    const mostCompletedHabit = habitCompletionCounts.length > 0 ? habitCompletionCounts[0] : null;
    
    return {
      bestStreak,
      habitWithBestStreak,
      completionRate,
      last30Days,
      habitsWithStreaks,
      mostCompletedHabit
    };
  }, [habits, completionsByDay]);
  
  // Destructure stats for easier access
  const { 
    bestStreak, 
    habitWithBestStreak, 
    completionRate, 
    last30Days, 
    habitsWithStreaks,
    mostCompletedHabit
  } = stats;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            {habitWithBestStreak ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{habitWithBestStreak.emoji}</span>
                <div>
                  <p className="text-2xl font-bold">{bestStreak}</p>
                  <p className="text-xs text-muted-foreground truncate">{habitWithBestStreak.name}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No streaks yet</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">7-Day Completion</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">{completionRate}%</p>
            <div className="h-2 bg-muted rounded-full mt-2">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {habitsWithStreaks.length > 0 && (
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Current Streaks</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 max-h-36 overflow-y-auto">
                {habitsWithStreaks.map(habit => (
                  <div key={habit.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{habit.emoji}</span>
                      <span className="text-sm truncate max-w-[140px]">{habit.name}</span>
                    </div>
                    <div className="streak-badge-inline">
                      {habit.streaks}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {mostCompletedHabit && (
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Most Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{mostCompletedHabit.emoji}</span>
                <div>
                  <p className="text-2xl font-bold">{mostCompletedHabit.completionCount}</p>
                  <p className="text-xs text-muted-foreground truncate">{mostCompletedHabit.name}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <Card>
        <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-sm font-medium">30-Day Activity</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {last30Days.map((day) => {
              const completionPercent = habits.length === 0 ? 0 : day.completions / day.total;
              let bgColor = 'bg-muted';
              
              if (completionPercent > 0) {
                if (completionPercent === 1) bgColor = 'bg-primary';
                else if (completionPercent >= 0.5) bgColor = 'bg-primary/70';
                else bgColor = 'bg-primary/40';
              }
              
              return (
                <div key={day.date} className="group relative">
                  <div 
                    className={`w-5 h-5 rounded-sm ${bgColor} cursor-pointer`}
                    title={`${day.display}: ${day.completions}/${day.total} completed`}
                  ></div>
                  
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10">
                    <div className="bg-popover text-popover-foreground text-xs py-1 px-2 rounded shadow-md whitespace-nowrap">
                      {day.display}: {day.completions}/{day.total}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HabitStats;
