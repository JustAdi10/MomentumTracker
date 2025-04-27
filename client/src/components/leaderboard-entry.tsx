import { LeaderboardEntry } from "@shared/schema";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Flame, Trophy, ChevronUp } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

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
  
  // Function to get medal icon for top 3 ranks
  const getRankDisplay = () => {
    if (entry.rank === 1) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-500 flex items-center justify-center text-white">
          <Trophy className="h-4 w-4" />
        </div>
      );
    } else if (entry.rank === 2) {
      return (
        <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-500 flex items-center justify-center text-white">
          2
        </div>
      );
    } else if (entry.rank === 3) {
      return (
        <div className="w-7 h-7 rounded-full bg-amber-700 dark:bg-amber-800 flex items-center justify-center text-white">
          3
        </div>
      );
    } else {
      return (
        <div className={`w-7 h-7 flex items-center justify-center font-medium ${
          isCurrentUser ? 'text-primary' : 'text-muted-foreground'
        }`}>
          {entry.rank}
        </div>
      );
    }
  };
  
  return (
    <div className={`flex items-center rounded-xl p-3 transition-all ${
      isCurrentUser 
        ? 'bg-primary/5 dark:bg-primary/10 border border-primary/20' 
        : 'hover:bg-muted/40'
    }`}>
      {getRankDisplay()}
      
      <div className="ml-3">
        <Avatar className={`h-10 w-10 border-2 ${isCurrentUser ? 'border-primary' : 'border-transparent'}`}>
          {entry.profileImage ? (
            <AvatarImage src={entry.profileImage} alt={entry.displayName} />
          ) : (
            <AvatarFallback className={`${
              isCurrentUser 
                ? 'bg-primary/10 text-primary'
                : 'bg-secondary/10 text-secondary dark:bg-secondary/20'
            }`}>
              {getInitials(entry.displayName)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="ml-3 flex-grow">
        <div className="font-medium text-foreground flex items-center">
          {isCurrentUser ? 'You' : entry.displayName}
          {isCurrentUser && (
            <Badge variant="outline" className="ml-2 text-[10px] px-2 py-0 h-4 bg-primary/10 text-primary border-primary/20">
              You
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Level {entry.level} • {entry.division} Division
        </div>
      </div>
      
      <div className="text-right">
        <div className="font-medium text-primary flex items-center justify-end">
          <Flame className="h-4 w-4 mr-1 text-amber-500" />
          <span>{entry.streak} day</span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center justify-end">
          <ChevronUp className="h-3 w-3 mr-1 text-green-500" />
          <span>{entry.weeklyXP} XP</span>
        </div>
      </div>
    </div>
  );
}
