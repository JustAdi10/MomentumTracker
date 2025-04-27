import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, LockIcon, BarChart2, Flame } from "lucide-react";

type AchievementCardProps = {
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: Date | string | null;
};

export default function AchievementCard({ 
  name, 
  description, 
  icon, 
  xpReward, 
  unlocked, 
  unlockedAt 
}: AchievementCardProps) {
  
  // Format date if it exists
  const formattedDate = unlockedAt
    ? new Date(unlockedAt).toLocaleDateString()
    : null;

  // Determine which icon to show based on the icon string
  const renderIcon = () => {
    switch (icon) {
      case 'lock':
        return <LockIcon className={`h-8 w-8 ${unlocked ? 'text-primary-500' : 'text-gray-400'}`} />;
      case 'chart':
        return <BarChart2 className={`h-8 w-8 ${unlocked ? 'text-secondary-500' : 'text-gray-400'}`} />;
      case 'flame':
        return <Flame className={`h-8 w-8 ${unlocked ? 'text-amber-500' : 'text-gray-400'}`} />;
      default:
        return <Award className={`h-8 w-8 ${unlocked ? 'text-primary-500' : 'text-gray-400'}`} />;
    }
  };

  return (
    <Card className={`p-4 flex flex-col items-center text-center transition-all duration-300 ${!unlocked ? 'opacity-60' : ''}`}>
      <div className={`w-16 h-16 rounded-full ${unlocked ? 'bg-primary-100' : 'bg-gray-100'} flex items-center justify-center mb-3`}>
        {renderIcon()}
      </div>
      
      <h3 className={`font-medium text-sm ${unlocked ? 'text-gray-800' : 'text-gray-400'}`}>{name}</h3>
      
      <p className="text-xs text-gray-500 mt-1">{description}</p>
      
      {unlocked ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="outline" className="text-xs font-medium text-primary-500 mt-2">
                +{xpReward} XP
              </Badge>
            </TooltipTrigger>
            {formattedDate && (
              <TooltipContent>
                <p>Unlocked: {formattedDate}</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      ) : (
        <span className="text-xs font-medium text-gray-400 mt-2">Locked</span>
      )}
    </Card>
  );
}
