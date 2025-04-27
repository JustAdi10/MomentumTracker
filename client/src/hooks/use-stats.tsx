import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { useHabits } from "@/hooks/use-habits";
import { HabitWithLogs } from "@shared/schema";

type StatsContextType = {
  weeklyData: Array<{ day: string, completed: number, total: number, xp: number }>;
  monthlyData: Array<{ week: string, rate: number, streak: number }>;
  streakData: { current: number, longest: number };
  completionRate: Array<{ name: string, rate: number }>;
  isLoading: boolean;
};

const StatsContext = createContext<StatsContextType | null>(null);

export function StatsProvider({ children }: { children: ReactNode }) {
  const { habits, isLoading: isHabitsLoading } = useHabits();
  
  // Fetch user stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<{
    completionPercentage: number;
    longestStreak: number;
  }>({
    queryKey: ["/api/user/stats"],
    staleTime: 60000, // 1 minute
  });
  
  // Calculate whether the data is loading
  const isLoading = isHabitsLoading || isStatsLoading;

  // Process data for weekly view
  const weeklyData = generateWeeklyData(habits);
  
  // Process data for monthly view
  const monthlyData = generateMonthlyData();
  
  // Process streak data
  const streakData = {
    current: calculateCurrentStreak(habits),
    longest: stats?.longestStreak || 0
  };
  
  // Process completion rate by habit
  const completionRate = calculateCompletionRateByHabit(habits);

  return (
    <StatsContext.Provider
      value={{
        weeklyData,
        monthlyData,
        streakData,
        completionRate,
        isLoading
      }}
    >
      {children}
    </StatsContext.Provider>
  );
}

export function useStats() {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error("useStats must be used within a StatsProvider");
  }
  return context;
}

// Helper functions for data processing

// Generate data for the weekly view
function generateWeeklyData(habits: HabitWithLogs[]) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const dayOfWeek = today.getDay();
  
  return days.map((day, index) => {
    // Use relative dates (past week)
    const date = new Date();
    date.setDate(today.getDate() - (dayOfWeek - index + 7) % 7);
    const dateStr = date.toISOString().split('T')[0];
    
    // Count habits completed on this day
    let completed = 0;
    habits.forEach(habit => {
      const hasCompletionOnDay = habit.logs.some(log => 
        new Date(log.completedAt).toISOString().split('T')[0] === dateStr
      );
      if (hasCompletionOnDay) completed++;
    });
    
    // For future dates, set completed to 0
    if (date > today) completed = 0;
    
    // XP is 10 per completed habit
    const xp = completed * 10;
    
    return {
      day,
      completed,
      total: habits.length,
      xp
    };
  });
}

// Generate data for the monthly view (mock data since we don't have full history)
function generateMonthlyData() {
  // In a real app, this would come from actual historical data
  // For now, create some realistic looking trends
  return [
    { week: 'Week 1', rate: 65, streak: 3 },
    { week: 'Week 2', rate: 70, streak: 5 },
    { week: 'Week 3', rate: 60, streak: 4 },
    { week: 'Week 4', rate: 75, streak: 7 }
  ];
}

// Calculate current streak across all habits
function calculateCurrentStreak(habits: HabitWithLogs[]): number {
  if (habits.length === 0) return 0;
  
  // Get the max streak from all habits
  return Math.max(0, ...habits.map(habit => habit.streak));
}

// Calculate completion rate for each habit
function calculateCompletionRateByHabit(habits: HabitWithLogs[]): Array<{ name: string, rate: number }> {
  return habits.map(habit => {
    // Calculate 7-day completion rate
    const today = new Date();
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);
    
    // Count days in the last week where the habit was completed
    let completedDays = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const wasCompletedOnDay = habit.logs.some(log => 
        new Date(log.completedAt).toISOString().split('T')[0] === dateStr
      );
      
      if (wasCompletedOnDay) completedDays++;
    }
    
    const rate = Math.round((completedDays / 7) * 100);
    
    return {
      name: habit.name,
      rate
    };
  });
}
