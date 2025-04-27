import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Habit, HabitWithLogs, InsertHabit } from "@shared/schema";
import { z } from "zod";

type HabitsContextType = {
  habits: HabitWithLogs[];
  isLoading: boolean;
  addHabit: (habit: NewHabitData) => void;
  completeHabit: (habitId: number) => void;
  isAddingHabit: boolean;
  isCompletingHabit: boolean | number;
};

// Form validation schema for new habits
export const newHabitSchema = z.object({
  name: z.string().min(1, "Habit name is required"),
  description: z.string().optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  icon: z.string().optional(),
  color: z.string().optional(),
  targetDays: z.number().optional(),
  reminderTime: z.string().optional(),
});

export type NewHabitData = z.infer<typeof newHabitSchema>;

const HabitsContext = createContext<HabitsContextType | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();

  // Fetch user habits
  const { data: habits = [], isLoading } = useQuery<HabitWithLogs[]>({
    queryKey: ["/api/habits"],
    staleTime: 60000, // 1 minute
  });

  // Add new habit
  const addHabitMutation = useMutation({
    mutationFn: async (habitData: NewHabitData) => {
      const res = await apiRequest("POST", "/api/habits", habitData);
      return await res.json();
    },
    onSuccess: (habit: Habit) => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      toast({
        title: "Habit created",
        description: `"${habit.name}" has been added to your habits`,
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create habit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Complete a habit
  const completeHabitMutation = useMutation({
    mutationFn: async (habitId: number) => {
      const res = await apiRequest("POST", `/api/habits/${habitId}/complete`);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/habits"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user/stats"] });
      
      const habitName = habits.find(h => h.id === data.habit.id)?.name || "Habit";
      toast({
        title: "Habit completed",
        description: `You've completed "${habitName}" and earned 10 XP!`,
        variant: "default",
      });
      
      // If the streak milestone is notable (5, 10, 25, etc.), show special toast
      if (data.habit.streak === 5 || data.habit.streak === 10 || 
          data.habit.streak === 25 || data.habit.streak === 50 || 
          data.habit.streak === 100) {
        toast({
          title: `${data.habit.streak}-day streak!`,
          description: `You've maintained "${habitName}" for ${data.habit.streak} days in a row!`,
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to complete habit",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new habit
  const addHabit = (habitData: NewHabitData) => {
    addHabitMutation.mutate(habitData);
  };

  // Handle completing a habit
  const completeHabit = (habitId: number) => {
    completeHabitMutation.mutate(habitId);
  };

  return (
    <HabitsContext.Provider
      value={{
        habits,
        isLoading,
        addHabit,
        completeHabit,
        isAddingHabit: addHabitMutation.isPending,
        isCompletingHabit: completeHabitMutation.isPending ? 
          (completeHabitMutation.variables as number) : false,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitsContext);
  if (!context) {
    throw new Error("useHabits must be used within a HabitsProvider");
  }
  return context;
}
