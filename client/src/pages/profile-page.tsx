import { useAuth } from "@/hooks/use-auth";
import { AchievementsProvider, useAchievements } from "@/hooks/use-achievements";
import { HabitsProvider, useHabits } from "@/hooks/use-habits";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import AchievementCard from "@/components/achievement-card";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Award,
  Settings,
  LogOut,
  UserIcon,
  TrendingUp,
  Calendar,
  Flame
} from "lucide-react";

function ProfileContent() {
  const { user, logoutMutation } = useAuth();
  const { habits } = useHabits();
  const { achievements, isLoading, unlockedCount } = useAchievements();

  // Fetch user stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/user/stats"],
    staleTime: 60000, // 1 minute
  });

  if (!user) return null;

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = getInitials(user.displayName || user.username);

  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Calculate progress percentage for achievements
  const achievementsPercentage = achievements.length > 0
    ? Math.round((unlockedCount / achievements.length) * 100)
    : 0;

  return (
    <>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Profile Header */}
        <Card className="p-5 mb-6">
          <div className="flex flex-col md:flex-row items-center">
            <Avatar className="h-20 w-20 mb-4 md:mb-0 md:mr-6">
              {user.profileImage ? (
                <AvatarImage src={user.profileImage} alt={user.displayName || user.username} />
              ) : (
                <AvatarFallback className="bg-primary/10 text-primary text-lg">
                  {userInitials}
                </AvatarFallback>
              )}
            </Avatar>
            
            <div className="flex-grow text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-800">
                {user.displayName || user.username}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center mt-1 space-y-1 md:space-y-0">
                <div className="flex items-center justify-center md:justify-start">
                  <Award className="h-4 w-4 mr-1 text-primary" />
                  <span className="text-gray-600 mr-3">Level {user.level || 1}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <TrendingUp className="h-4 w-4 mr-1 text-secondary" />
                  <span className="text-gray-600 mr-3">{user.division || "Bronze"} Division</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Flame className="h-4 w-4 mr-1 text-amber-500" />
                  <span className="text-gray-600">{stats?.longestStreak || 0} day streak</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 md:mt-0 flex flex-col space-y-2">
              <Button variant="outline" size="sm" className="flex items-center">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="flex items-center"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-primary/10 p-3 mr-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Habits</h3>
                <p className="text-2xl font-bold text-gray-800">{habits.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-secondary/10 p-3 mr-4">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Achievements</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {unlockedCount}/{achievements.length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-amber-500/10 p-3 mr-4">
                <TrendingUp className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">XP</h3>
                <p className="text-2xl font-bold text-gray-800">
                  {user.xp}/{(user.level || 1) * 1000}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Achievements */}
        <Card className="mb-6">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Achievements
              </h2>
              <div className="text-sm text-gray-500">
                {unlockedCount}/{achievements.length} ({achievementsPercentage}%)
              </div>
            </div>
            
            <Tabs defaultValue="unlocked">
              <TabsList className="mb-4">
                <TabsTrigger value="unlocked">Unlocked</TabsTrigger>
                <TabsTrigger value="locked">Locked</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
              
              <TabsContent value="unlocked">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    // Loading state
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl"></div>
                    ))
                  ) : achievements.filter(a => a.unlocked).length > 0 ? (
                    // Unlocked achievements
                    achievements
                      .filter(a => a.unlocked)
                      .map(achievement => (
                        <AchievementCard 
                          key={achievement.id}
                          name={achievement.name}
                          description={achievement.description}
                          icon={achievement.icon}
                          xpReward={achievement.xpReward}
                          unlocked={achievement.unlocked}
                          unlockedAt={achievement.unlockedAt}
                        />
                      ))
                  ) : (
                    // Empty state
                    <div className="col-span-full p-4 text-center">
                      <p className="text-gray-500">No achievements unlocked yet. Keep going!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="locked">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    // Loading state
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl"></div>
                    ))
                  ) : achievements.filter(a => !a.unlocked).length > 0 ? (
                    // Locked achievements
                    achievements
                      .filter(a => !a.unlocked)
                      .map(achievement => (
                        <AchievementCard 
                          key={achievement.id}
                          name={achievement.name}
                          description={achievement.description}
                          icon={achievement.icon}
                          xpReward={achievement.xpReward}
                          unlocked={achievement.unlocked}
                          unlockedAt={achievement.unlockedAt}
                        />
                      ))
                  ) : (
                    // Empty state
                    <div className="col-span-full p-4 text-center">
                      <p className="text-gray-500">All achievements unlocked. Congratulations!</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {isLoading ? (
                    // Loading state
                    Array(8).fill(0).map((_, i) => (
                      <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl"></div>
                    ))
                  ) : achievements.length > 0 ? (
                    // All achievements
                    achievements.map(achievement => (
                      <AchievementCard 
                        key={achievement.id}
                        name={achievement.name}
                        description={achievement.description}
                        icon={achievement.icon}
                        xpReward={achievement.xpReward}
                        unlocked={achievement.unlocked}
                        unlockedAt={achievement.unlockedAt}
                      />
                    ))
                  ) : (
                    // Empty state
                    <div className="col-span-full p-4 text-center">
                      <p className="text-gray-500">No achievements available</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <TabBar />
    </>
  );
}

export default function ProfilePage() {
  return (
    <HabitsProvider>
      <AchievementsProvider>
        <ProfileContent />
      </AchievementsProvider>
    </HabitsProvider>
  );
}
