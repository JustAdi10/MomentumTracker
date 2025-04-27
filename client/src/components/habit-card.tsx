import { HabitWithLogs } from "@shared/schema";
import { useHabits } from "@/hooks/use-habits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckIcon, ClockIcon, Flame } from "lucide-react";
import { useState } from "react";

type HabitCardProps = {
  habit: HabitWithLogs;
};

export default function HabitCard({ habit }: HabitCardProps) {
  const { completeHabit, isCompletingHabit } = useHabits();
  const [isHovered, setIsHovered] = useState(false);

  const getIconForHabit = () => {
    if (habit.isCompletedToday) {
      return (
        <div className="w-12 h-12 rounded-full bg-success-500 bg-opacity-10 flex items-center justify-center mr-4">
          <CheckIcon className="h-6 w-6 text-success-500" />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
        {customIcon}
      </div>
    );
  };

  // Determine which icon to show
  let customIcon = <ClockIcon className="h-6 w-6 text-gray-400" />;
  if (habit.icon === "book") {
    customIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    );
  } else if (habit.icon === "meditation") {
    customIcon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }

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
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 transition-all duration-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center">
        {getIconForHabit()}
        
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-800">{habit.name}</h3>
            
            {habit.isCompletedToday ? (
              <Badge variant="outline" className="text-xs font-medium text-success-500 bg-success-500 bg-opacity-10">
                Completed
              </Badge>
            ) : (
              <Button 
                size="sm" 
                variant="default" 
                className="text-white text-xs font-medium py-1 px-3 rounded-full"
                onClick={handleComplete}
                disabled={typeof isCompletingHabit === 'number'}
              >
                {isCompletingHabit === habit.id ? 'Completing...' : 'Complete'}
              </Button>
            )}
          </div>
          
          {habit.description && (
            <div className="mt-1 text-sm text-gray-500">{habit.description}</div>
          )}
          
          <div className="mt-2 flex items-center text-xs text-gray-500">
            {habit.reminderTime && (
              <>
                <ClockIcon className="h-4 w-4 mr-1" />
                <span>{formatTime(habit.reminderTime)}</span>
              </>
            )}
            
            {habit.streak > 0 && (
              <div className="ml-3 flex items-center">
                <Flame className="h-4 w-4 mr-1 text-amber-500" />
                <span>{habit.streak} day streak</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
