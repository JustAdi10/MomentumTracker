import { CommunityActivity } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useCommunity } from "@/hooks/use-community";
import { Heart } from "lucide-react";
import { useState } from "react";

type ActivityEntryProps = {
  activity: CommunityActivity;
};

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
      className="flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-10 h-10 flex-shrink-0">
        <Avatar>
          {activity.user.profileImage ? (
            <AvatarImage 
              src={activity.user.profileImage} 
              alt={activity.user.displayName} 
            />
          ) : (
            <AvatarFallback className="bg-gray-200 text-gray-700">
              {getInitials(activity.user.displayName)}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="ml-3">
        <div className="text-sm">
          <span className="font-medium text-gray-800">{activity.user.displayName}</span>
          <span className="text-gray-600"> {activity.content}</span>
        </div>
        
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <span>{activity.timestamp}</span>
          
          <Button
            variant="ghost"
            size="sm"
            className={`ml-4 px-2 py-0 text-primary-500 font-medium h-6 ${isHovered ? 'opacity-100' : 'opacity-75'}`}
            onClick={handleCheer}
            disabled={typeof isCheering === 'number'}
          >
            <Heart className="h-3.5 w-3.5 mr-1" />
            {activity.cheers > 0 && (
              <span className="mr-1">{activity.cheers}</span>
            )}
            Cheer
          </Button>
        </div>
      </div>
    </div>
  );
}
