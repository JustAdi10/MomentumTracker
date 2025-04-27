import { LeaderboardEntry } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flame } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

type LeaderboardEntryProps = {
  entry: LeaderboardEntry;
};

export default function LeaderboardEntryComponent({ entry }: LeaderboardEntryProps) {
  const { user } = useAuth();
  const isCurrentUser = user?.id === entry.userId;
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className={`flex items-center ${isCurrentUser ? 'bg-primary-50 rounded-lg p-2' : ''}`}>
      <div className={`w-6 text-center font-bold ${isCurrentUser ? 'text-primary-500' : 'text-gray-400'}`}>
        {entry.rank}
      </div>
      
      <div className="ml-3 w-10 h-10">
        <Avatar>
          {entry.profileImage ? (
            <AvatarImage src={entry.profileImage} alt={entry.displayName} />
          ) : (
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {getInitials(entry.displayName)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="ml-3 flex-grow">
        <div className="font-medium text-gray-800">{isCurrentUser ? 'You' : entry.displayName}</div>
        <div className="text-xs text-gray-500">
          Level {entry.level} • {entry.division} Division
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-medium text-primary-500 flex items-center justify-end">
          <Flame className="h-4 w-4 mr-1 text-amber-500" />
          {entry.streak} day streak
        </div>
        <div className="text-xs text-gray-500">{entry.weeklyXP} XP this week</div>
      </div>
    </div>
  );
}
