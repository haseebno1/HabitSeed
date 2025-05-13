
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { format, subDays } from 'date-fns';

interface HabitStatsProps {
  habits: {
    id: string;
    name: string;
    emoji: string;
    streaks: number;
  }[];
  completionsByDay: {
    [key: string]: string[];
  };
}

const HabitStats: React.FC<HabitStatsProps> = ({ habits, completionsByDay }) => {
  // Get best streak
  const bestStreak = habits.reduce((max, habit) => Math.max(max, habit.streaks), 0);
  const habitWithBestStreak = habits.find(h => h.streaks === bestStreak);
  
  // Calculate completion rate for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  }).reverse();
  
  const completionRate = last7Days.reduce((total, date) => {
    const completed = completionsByDay[date] || [];
    return total + (completed.length / Math.max(habits.length, 1));
  }, 0) / 7 * 100;
  
  // Generate completion data for the heatmap
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'yyyy-MM-dd'),
      display: format(date, 'MMM d'),
      completions: completionsByDay[format(date, 'yyyy-MM-dd')]?.length || 0,
      total: habits.length || 1
    };
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Best Streak</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {habitWithBestStreak ? (
              <div className="flex items-center gap-2">
                <span className="text-xl">{habitWithBestStreak.emoji}</span>
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
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">7-Day Completion</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-2xl font-bold">{completionRate.toFixed(0)}%</p>
            <div className="h-2 bg-muted rounded-full mt-2">
              <div 
                className="h-2 bg-primary rounded-full" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-sm font-medium">30-Day Activity</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-1">
            {last30Days.map((day) => {
              const completionPercent = day.completions / day.total;
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
