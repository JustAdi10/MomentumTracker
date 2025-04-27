import { createContext, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";

type AchievementWithStatus = Achievement & {
  unlocked: boolean;
  unlockedAt: Date | null;
};

type AchievementsContextType = {
  achievements: AchievementWithStatus[];
  isLoading: boolean;
  unlockedCount: number;
  recentAchievements: AchievementWithStatus[];
};

const AchievementsContext = createContext<AchievementsContextType | null>(null);

export function AchievementsProvider({ children }: { children: ReactNode }) {
  // Fetch user achievements
  const { data: achievements = [], isLoading } = useQuery<AchievementWithStatus[]>({
    queryKey: ["/api/achievements"],
    staleTime: 60000, // 1 minute
  });

  // Count unlocked achievements
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  // Get recent achievements (unlocked in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentAchievements = achievements
    .filter(a => a.unlocked && a.unlockedAt && new Date(a.unlockedAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 4); // Limit to 4 recent achievements

  return (
    <AchievementsContext.Provider
      value={{
        achievements,
        isLoading,
        unlockedCount,
        recentAchievements
      }}
    >
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementsContext);
  if (!context) {
    throw new Error("useAchievements must be used within an AchievementsProvider");
  }
  return context;
}
