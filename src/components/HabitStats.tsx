import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format, subDays, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, addDays, isSameDay } from 'date-fns';
import { Trophy, Percent, Calendar, Award, CheckCircle, TrendingUp, BarChart2 } from 'lucide-react';
import { getGrowthStageEmoji, getToday } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Habit } from '@/hooks/useHabits';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');
  
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
    
    // Calculate completion trends over time (last 30 days)
    const completionTrends = habits.map(habit => {
      const dailyCompletions = last30Days.map(day => {
        const completed = completionsByDay[day.date]?.includes(habit.id) ? 1 : 0;
        return {
          date: day.date,
          display: day.display,
          completed
        };
      });
      
      return {
        ...habit,
        dailyCompletions
      };
    });
    
    // Get all dates in the completionsByDay for historical data
    const allDates = Object.keys(completionsByDay).sort();
    
    // Create weekly trend data
    const weeklyData = {};
    if (allDates.length > 0) {
      // Group dates by week
      allDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        
        if (!weeklyData[weekStart]) {
          weeklyData[weekStart] = {
            total: habits.length,
            completed: 0,
            dates: []
          };
        }
        
        const completedForDay = completionsByDay[dateStr] || [];
        weeklyData[weekStart].completed += completedForDay.length;
        weeklyData[weekStart].dates.push(dateStr);
      });
      
      // Calculate weekly percentages
      Object.keys(weeklyData).forEach(week => {
        const daysInWeek = weeklyData[week].dates.length;
        const totalPossible = habits.length * daysInWeek;
        weeklyData[week].percentage = totalPossible > 0 
          ? Math.round((weeklyData[week].completed / totalPossible) * 100)
          : 0;
      });
    }
    
    // Calculate habit-specific success rates over time
    const habitSuccessRates = habits.map(habit => {
      // Count by week for this habit
      const weeklySuccess = {};
      
      allDates.forEach(dateStr => {
        const date = new Date(dateStr);
        const weekStart = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        
        if (!weeklySuccess[weekStart]) {
          weeklySuccess[weekStart] = {
            completed: 0,
            total: 0
          };
        }
        
        weeklySuccess[weekStart].total++;
        if (completionsByDay[dateStr]?.includes(habit.id)) {
          weeklySuccess[weekStart].completed++;
        }
      });
      
      // Calculate success percentages
      Object.keys(weeklySuccess).forEach(week => {
        weeklySuccess[week].percentage = weeklySuccess[week].total > 0
          ? Math.round((weeklySuccess[week].completed / weeklySuccess[week].total) * 100)
          : 0;
      });
      
      return {
        ...habit,
        weeklySuccess
      };
    });
    
    return {
      bestStreak,
      habitWithBestStreak,
      completionRate,
      last30Days,
      habitsWithStreaks,
      mostCompletedHabit,
      completionTrends,
      weeklyData,
      habitSuccessRates
    };
  }, [habits, completionsByDay]);
  
  // Prepare chart data based on selected time range and habit
  const chartData = useMemo(() => {
    if (!stats.completionTrends) return null;
    
    let dateRange: string[] = [];
    const today = new Date();
    
    // Determine date range based on timeRange
    switch (timeRange) {
      case 'week':
        dateRange = Array.from({ length: 7 }, (_, i) => 
          format(subDays(today, 6 - i), 'yyyy-MM-dd')
        );
        break;
      case 'month':
        dateRange = Array.from({ length: 30 }, (_, i) => 
          format(subDays(today, 29 - i), 'yyyy-MM-dd')
        );
        break;
      case 'all':
        // Get all dates with data
        const allDates = Object.keys(completionsByDay).sort();
        if (allDates.length > 0) {
          // Limit to max 90 days to avoid overloading the chart
          const maxDays = 90; 
          const startDate = allDates.length > maxDays 
            ? allDates[allDates.length - maxDays] 
            : allDates[0];
          
          const start = new Date(startDate);
          const end = new Date();
          const dateInterval = eachDayOfInterval({ start, end });
          dateRange = dateInterval.map(date => format(date, 'yyyy-MM-dd'));
        }
        break;
    }
    
    // Prepare datasets
    const labels = dateRange.map(date => format(new Date(date), 'MMM d'));
    
    // If a specific habit is selected, show its data
    if (selectedHabit) {
      const habit = stats.completionTrends.find(h => h.id === selectedHabit);
      if (!habit) return null;
      
      // Map the habit's completion status for each day in the range
      const habitData = dateRange.map(date => {
        const foundDay = habit.dailyCompletions.find(d => d.date === date);
        return foundDay?.completed ?? 0;
      });
      
      return {
        labels,
        datasets: [
          {
            label: habit.name,
            data: habitData,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            tension: 0.3,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointRadius: 3,
            borderWidth: 2
          }
        ]
      };
    } 
    // Otherwise show overall completion rate
    else {
      // Calculate daily completion percentage for all habits
      const overallData = dateRange.map(date => {
        const completed = completionsByDay[date]?.length || 0;
        const total = habits.length;
        return total > 0 ? (completed / total) * 100 : 0;
      });
      
      // Get each habit's data separately for comparison
      const habitDatasets = habits.slice(0, 5).map(habit => {
        const habitData = dateRange.map(date => {
          return completionsByDay[date]?.includes(habit.id) ? 100 : 0;
        });
        
        return {
          label: `${habit.emoji} ${habit.name}`,
          data: habitData,
          borderColor: getRandomColor(habit.id),
          backgroundColor: getRandomColor(habit.id, 0.1),
          borderWidth: 1,
          pointRadius: 2,
          tension: 0.3
        };
      });
      
      return {
        labels,
        datasets: [
          {
            label: 'Overall Completion %',
            data: overallData,
            fill: true,
            backgroundColor: 'rgba(99, 102, 241, 0.2)',
            borderColor: 'rgba(99, 102, 241, 1)',
            tension: 0.3,
            pointBackgroundColor: 'rgba(99, 102, 241, 1)',
            pointRadius: 3,
            borderWidth: 2
          },
          ...habitDatasets
        ]
      };
    }
  }, [habits, completionsByDay, timeRange, selectedHabit, stats.completionTrends]);
  
  // Generate data for streak trend chart
  const streakChartData = useMemo(() => {
    if (habits.length === 0) return null;
    
    // Get top 5 habits by streak
    const topHabits = [...habits]
      .filter(h => h.streaks > 0)
      .sort((a, b) => (b.streaks || 0) - (a.streaks || 0))
      .slice(0, 5);
    
    return {
      labels: topHabits.map(h => h.name),
      datasets: [
        {
          label: 'Current Streak',
          data: topHabits.map(h => h.streaks),
          backgroundColor: topHabits.map(h => getRandomColor(h.id, 0.7)),
          borderWidth: 1
        }
      ]
    };
  }, [habits]);
  
  // Generate random color based on habit ID (for consistent colors)
  function getRandomColor(id: string, opacity = 1) {
    // Generate a pseudo-random but consistent color based on the habit ID
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const h = Math.abs(hash) % 360;
    return `hsla(${h}, 70%, 60%, ${opacity})`;
  }
  
  // Chart options
  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 7
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          usePointStyle: true
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(0)}%`
        }
      }
    }
  };
  
  const barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  };
  
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
    <div className="space-y-6">
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
      
      {/* New detailed graphs section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Detailed Analysis</h3>
        
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Habit Completion Trends</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="mb-4 space-y-2">
              <div className="flex flex-wrap gap-2">
                <Tabs defaultValue="week" value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
                  <TabsList className="h-8">
                    <TabsTrigger value="week" className="text-xs h-7">Last Week</TabsTrigger>
                    <TabsTrigger value="month" className="text-xs h-7">Last Month</TabsTrigger>
                    <TabsTrigger value="all" className="text-xs h-7">All Time</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <select 
                  className="bg-muted text-xs rounded-md px-2 h-8 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedHabit || ""}
                  onChange={(e) => setSelectedHabit(e.target.value || null)}
                >
                  <option value="">All Habits</option>
                  {habits.map(habit => (
                    <option key={habit.id} value={habit.id}>
                      {habit.emoji} {habit.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {selectedHabit 
                  ? `Showing completion data for ${habits.find(h => h.id === selectedHabit)?.name}`
                  : "Showing overall completion percentages and individual habit data"}
              </p>
            </div>
            
            <div className="h-[300px] w-full">
              {chartData && habits.length > 0 ? (
                <Line data={chartData} options={lineChartOptions} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data to display</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {habitsWithStreaks.length > 0 && (
          <Card>
            <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium">Top Habit Streaks</CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                {streakChartData ? (
                  <Bar data={streakChartData} options={barChartOptions} />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground">No streak data to display</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default HabitStats;
