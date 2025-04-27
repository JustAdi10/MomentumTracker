import { HabitWithLogs } from "@shared/schema";
import { useHabits } from "@/hooks/use-habits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClockIcon, Flame, BookOpen, Zap, Droplets, GraduationCap, Dumbbell } from "lucide-react";
import { useState } from "react";

type HabitCardProps = {
  habit: HabitWithLogs;
};

export default function HabitCard({ habit }: HabitCardProps) {
  const { completeHabit, isCompletingHabit } = useHabits();
  const [isHovered, setIsHovered] = useState(false);

  // Function to get the appropriate icon based on habit type
  const getHabitIcon = () => {
    switch (habit.icon) {
      case "book":
        return <BookOpen className="h-6 w-6" />;
      case "meditation":
        return <Zap className="h-6 w-6" />;
      case "water":
        return <Droplets className="h-6 w-6" />;
      case "study":
        return <GraduationCap className="h-6 w-6" />;
      case "exercise":
        return <Dumbbell className="h-6 w-6" />;
      default:
        return <ClockIcon className="h-6 w-6" />;
    }
  };

  // Determine background color based on habit color or use default gradient
  const getBackgroundStyle = () => {
    if (habit.color) {
      return { backgroundColor: habit.color };
    }
    return { background: "linear-gradient(135deg, hsl(16, 80%, 54%), hsl(33, 10%, 76%))" };
  };

  // Format reminder time to be more readable
  const formatTime = (timeString: string | null) => {
    if (!timeString) return "";
    
    try {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const minute = parseInt(minutes);
      
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      const displayMinute = minute.toString().padStart(2, '0');
      
      return `${displayHour}:${displayMinute} ${period}`;
    } catch (e) {
      return timeString;
    }
  };

  const handleComplete = () => {
    completeHabit(habit.id);
  };

  return (
    <div 
      className="momentum-card gradient hover:shadow-md overflow-hidden transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {/* Habit icon with dynamic styling */}
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors border-2 ${
          habit.isCompletedToday 
            ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
            : "bg-primary/10 dark:bg-primary/15 text-primary dark:text-primary/90 border-primary/20"
        }`}>
          {habit.isCompletedToday ? (
            <CheckIcon className="h-6 w-6" />
          ) : (
            getHabitIcon()
          )}
        </div>
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-foreground">{habit.name}</h3>
            
            {habit.isCompletedToday ? (
              <Badge variant="outline" className="text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800">
                Completed
              </Badge>
            ) : (
              <Button 
                size="sm" 
                variant="default" 
                className="text-primary-foreground text-xs font-medium py-1 px-3 rounded-full bg-gradient-to-r from-primary to-amber-500 hover:opacity-90"
                onClick={handleComplete}
                disabled={typeof isCompletingHabit === 'number'}
              >
                {isCompletingHabit === habit.id ? 'Completing...' : 'Complete'}
              </Button>
            )}
          </div>
          
          {habit.description && (
            <div className="mt-1 text-sm text-muted-foreground">{habit.description}</div>
          )}
          
          <div className="mt-2 flex items-center text-xs text-muted-foreground">
            {habit.reminderTime && (
              <>
                <ClockIcon className="h-4 w-4 mr-1 text-primary/70" />
                <span>{formatTime(habit.reminderTime)}</span>
              </>
            )}
            
            {(habit.streak ?? 0) > 0 && (
              <div className="ml-3 flex items-center">
                <Flame className="h-4 w-4 mr-1 text-primary" />
                <span className="text-primary/70 font-medium">{habit.streak ?? 0} day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Progress indicator (now visible in both light and dark modes) */}
      <div className="mt-3 h-1.5 w-full bg-muted/50 dark:bg-muted/30 rounded-full overflow-hidden opacity-80 group-hover:opacity-100 transition-opacity">
        <div 
          className="h-full bg-gradient-to-r from-primary via-amber-500 to-primary bg-size-200 animate-gradient" 
          style={{ width: `${habit.isCompletedToday ? '100%' : '0%'}` }}
        ></div>
      </div>
    </div>
  );
}
