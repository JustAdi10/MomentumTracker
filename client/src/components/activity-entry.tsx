import { CommunityActivity } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCommunity } from "@/hooks/use-community";
import { Heart, Clock, Award } from "lucide-react";
import { useState } from "react";

type ActivityEntryProps = {
  activity: CommunityActivity;
};

// Helper function to ensure cheers is treated as a number
function getCheerCount(activity: CommunityActivity): number {
  return typeof activity.cheers === 'number' ? activity.cheers : 0;
}

export default function ActivityEntry({ activity }: ActivityEntryProps) {
  const { cheerPost, isCheering } = useCommunity();
  const [isHovered, setIsHovered] = useState(false);
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleCheer = () => {
    cheerPost(activity.id);
  };
  
  return (
    <div 
      className="momentum-card my-3 hover:shadow-md group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Avatar className="h-10 w-10 border-2 border-primary/10">
            {activity.user.profileImage ? (
              <AvatarImage 
                src={activity.user.profileImage} 
                alt={activity.user.displayName} 
              />
            ) : (
              <AvatarFallback className="bg-secondary/10 text-secondary dark:bg-secondary/20">
                {getInitials(activity.user.displayName)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>
        
        <div className="ml-3 flex-grow">
          <div className="flex items-center justify-between">
            <div className="font-medium text-foreground flex items-center">
              {activity.user.displayName}
              <Badge variant="outline" className="ml-2 text-[10px] hidden sm:flex px-2 py-0 h-4 bg-secondary/10 text-secondary border-secondary/20">
                <Award className="h-3 w-3 mr-1" />
                Level 5
              </Badge>
            </div>
            
            <div className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {activity.timestamp}
            </div>
          </div>
          
          <div className="my-2 text-foreground">
            {activity.content}
          </div>
          
          <div className="flex items-center justify-end mt-2">
            <Button
              variant={getCheerCount(activity) > 0 ? "secondary" : "outline"}
              size="sm"
              className={`px-3 py-1 h-8 font-medium rounded-full ${
                getCheerCount(activity) > 0 
                  ? "bg-primary/10 text-primary hover:bg-primary/20 dark:bg-primary/20" 
                  : "text-muted-foreground hover:text-primary hover:border-primary"
              } ${isHovered ? 'opacity-100' : 'opacity-90'}`}
              onClick={handleCheer}
              disabled={typeof isCheering === 'number'}
            >
              <Heart className={`h-4 w-4 mr-1.5 ${getCheerCount(activity) > 0 ? "fill-primary text-primary" : ""}`} />
              {getCheerCount(activity) > 0 ? (
                <span>{getCheerCount(activity)}</span>
              ) : (
                "Cheer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
