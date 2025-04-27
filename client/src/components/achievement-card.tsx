import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, LockIcon, BarChart2, Flame, Zap, Target, Medal, Trophy } from "lucide-react";

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
        return <LockIcon className="h-8 w-8" />;
      case 'chart':
        return <BarChart2 className="h-8 w-8" />;
      case 'flame':
        return <Flame className="h-8 w-8" />;
      case 'zap':
        return <Zap className="h-8 w-8" />;
      case 'target':
        return <Target className="h-8 w-8" />;
      case 'medal':
        return <Medal className="h-8 w-8" />;
      case 'trophy':
        return <Trophy className="h-8 w-8" />;
      default:
        return <Award className="h-8 w-8" />;
    }
  };

  return (
    <Card className={`momentum-card flex flex-col items-center text-center transition-all duration-300 overflow-hidden ${
      !unlocked ? 'dark:opacity-40 opacity-60 dark:grayscale grayscale-[50%]' : 'transform hover:scale-105'
    }`}>
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${
        unlocked 
          ? 'bg-gradient-to-br from-primary/20 to-secondary/20 text-primary dark:text-primary-foreground' 
          : 'bg-muted text-muted-foreground'
      }`}>
        {renderIcon()}
      </div>
      
      <h3 className={`font-medium text-sm text-foreground`}>{name}</h3>
      
      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{description}</p>
      
      {unlocked ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className="text-xs font-medium bg-primary/10 text-primary border-primary/20 mt-2 px-3 py-1">
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
        <Badge variant="outline" className="text-xs font-medium bg-muted text-muted-foreground mt-2 px-3 py-1">
          <LockIcon className="h-3 w-3 mr-1" />
          Locked
        </Badge>
      )}
      
      {/* Badge or ribbon for unlocked achievements */}
      {unlocked && (
        <div className="absolute -top-1 -right-8 w-20 h-5 bg-gradient-to-r from-primary to-secondary rotate-45 flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">UNLOCKED</span>
        </div>
      )}
    </Card>
  );
}
