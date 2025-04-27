import { useAuth } from "@/hooks/use-auth";
import { AchievementsProvider, useAchievements } from "@/hooks/use-achievements";
import { HabitsProvider, useHabits } from "@/hooks/use-habits";
import { useStats } from "@/hooks/use-stats";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import AchievementCard from "@/components/achievement-card";
import ProgressRing from "@/components/progress-ring";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Settings,
  LogOut,
  UserIcon,
  TrendingUp,
  Calendar,
  Flame,
  BarChart2,
  PieChart
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Pie,
  Cell
} from "recharts";

function ProfileStatsContent() {
  const { user, logoutMutation } = useAuth();
  const { habits } = useHabits();
  const { achievements, isLoading: achievementsLoading, unlockedCount } = useAchievements();
  const { weeklyData, monthlyData, streakData, completionRate, isLoading: statsLoading } = useStats();

  if (!user) return null;

  // Colors for charts
  const COLORS = ['#eb5e28', '#403d39', '#fffcf2', '#4CAF50'];

  // Format data for pie chart
  const habitsByFrequency = [
    { name: 'Daily', value: habits.filter(h => h.frequency === 'daily').length },
    { name: 'Weekly', value: habits.filter(h => h.frequency === 'weekly').length },
    { name: 'Monthly', value: habits.filter(h => h.frequency === 'monthly').length }
  ].filter(item => item.value > 0);

  // Calculate total completed habits
  const totalCompleted = habits.filter(h => h.isCompletedToday).length;
  const totalHabits = habits.length;
  const completionPercentage = totalHabits ? Math.round((totalCompleted / totalHabits) * 100) : 0;
  
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
      
      <main className="flex-grow container mx-auto px-4 py-6 pb-20">
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
              <h1 className="text-2xl font-bold">
                {user.displayName || user.username}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center mt-1 space-y-1 md:space-y-0">
                <div className="flex items-center justify-center md:justify-start">
                  <Award className="h-4 w-4 mr-1 text-primary" />
                  <span className="mr-3">Level {user.level || 1}</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <TrendingUp className="h-4 w-4 mr-1 text-secondary" />
                  <span className="mr-3">{user.division || "Bronze"} Division</span>
                </div>
                <div className="flex items-center justify-center md:justify-start">
                  <Flame className="h-4 w-4 mr-1 text-amber-500" />
                  <span>{streakData?.longest || 0} day streak</span>
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
                <h3 className="text-sm font-medium text-muted-foreground">Habits</h3>
                <p className="text-2xl font-bold">{habits.length}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="rounded-full bg-secondary/10 p-3 mr-4">
                <Award className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Achievements</h3>
                <p className="text-2xl font-bold">
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
                <h3 className="text-sm font-medium text-muted-foreground">XP</h3>
                <p className="text-2xl font-bold">
                  {user.xp}/{(user.level || 1) * 1000}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Main content tabs */}
        <Tabs defaultValue="stats" className="space-y-4">
          <TabsList className="mb-2">
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Statistics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Achievements
            </TabsTrigger>
          </TabsList>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="space-y-6">
            {/* Current Streak Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-5 flex items-center">
                <div className="rounded-full bg-primary/10 p-4 mr-5">
                  <Flame className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Longest Streak</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">{streakData?.longest || 0}</span>
                    <span className="ml-2 text-muted-foreground">days</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Current: {streakData?.current || 0} days</p>
                </div>
              </Card>
              
              {/* Level Card */}
              <Card className="p-5 flex items-center">
                <div className="rounded-full bg-secondary/10 p-4 mr-5">
                  <Award className="h-8 w-8 text-secondary" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Level Progress</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold">Level {user?.level || 1}</span>
                    <span className="ml-2 text-muted-foreground">{user?.division || "Bronze"}</span>
                  </div>
                  <div className="mt-2 w-36 h-2 bg-muted rounded-full">
                    <div 
                      className="h-2 bg-secondary rounded-full" 
                      style={{ width: `${(user?.xp || 0) / ((user?.level || 1) * 1000) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </Card>
            </div>
            
            {/* Sub-tabs for different stats views */}
            <Tabs defaultValue="weekly">
              <TabsList className="mb-6">
                <TabsTrigger value="weekly" className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Weekly
                </TabsTrigger>
                <TabsTrigger value="monthly" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="habits" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Habits
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly" className="space-y-6">
                <Card className="p-5">
                  <h3 className="text-lg font-medium mb-4">Weekly Completion</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="completed" fill="#eb5e28" name="Completed" />
                        <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-medium mb-4">Weekly XP Earned</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="xp" 
                          stroke="#eb5e28" 
                          strokeWidth={2} 
                          name="XP"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="monthly" className="space-y-6">
                <Card className="p-5">
                  <h3 className="text-lg font-medium mb-4">Monthly Completion Rate</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="rate" 
                          stroke="#eb5e28" 
                          strokeWidth={2}
                          name="Completion Rate (%)"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                
                <Card className="p-5">
                  <h3 className="text-lg font-medium mb-4">Monthly Streak Progress</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line 
                          type="monotone" 
                          dataKey="streak" 
                          stroke="#403d39" 
                          strokeWidth={2}
                          name="Longest Streak"
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </TabsContent>
              
              <TabsContent value="habits" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-5">
                    <h3 className="text-lg font-medium mb-4">Habit Completion</h3>
                    <div className="flex items-center justify-center">
                      <ProgressRing 
                        percentage={completionPercentage} 
                        text={`${completionPercentage}%`}
                        textBottom="Completed Today"
                        size={180}
                      />
                    </div>
                    <div className="mt-4 flex justify-center">
                      <Badge variant="outline" className="mx-1">
                        Completed: {totalCompleted}
                      </Badge>
                      <Badge variant="outline" className="mx-1">
                        Total: {totalHabits}
                      </Badge>
                    </div>
                  </Card>
                  
                  <Card className="p-5">
                    <h3 className="text-lg font-medium mb-4">Habits by Frequency</h3>
                    {habitsByFrequency.length > 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart width={400} height={300}>
                            <Pie
                              data={habitsByFrequency}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {habitsByFrequency.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">No habits created yet</p>
                      </div>
                    )}
                  </Card>
                  
                  <Card className="p-5 md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">Completion Rate by Habit</h3>
                    {habits.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={completionRate}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <RechartsTooltip />
                            <Bar dataKey="rate" fill="#eb5e28" name="Completion Rate (%)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center">
                        <p className="text-muted-foreground">No habits created yet</p>
                      </div>
                    )}
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
          
          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold flex items-center">
                    <Award className="h-5 w-5 mr-2 text-primary" />
                    Achievements
                  </h2>
                  <div className="text-sm text-muted-foreground">
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
                      {achievementsLoading ? (
                        // Loading state
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-36 bg-muted animate-pulse rounded-xl"></div>
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
                              xpReward={achievement.xpReward || 0}
                              unlocked={achievement.unlocked || false}
                              unlockedAt={achievement.unlockedAt}
                            />
                          ))
                      ) : (
                        // Empty state
                        <div className="col-span-full p-4 text-center">
                          <p className="text-muted-foreground">No achievements unlocked yet. Keep going!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="locked">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {achievementsLoading ? (
                        // Loading state
                        Array(4).fill(0).map((_, i) => (
                          <div key={i} className="h-36 bg-muted animate-pulse rounded-xl"></div>
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
                              xpReward={achievement.xpReward || 0}
                              unlocked={achievement.unlocked || false}
                              unlockedAt={achievement.unlockedAt}
                            />
                          ))
                      ) : (
                        // Empty state
                        <div className="col-span-full p-4 text-center">
                          <p className="text-muted-foreground">All achievements unlocked. Congratulations!</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="all">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {achievementsLoading ? (
                        // Loading state
                        Array(8).fill(0).map((_, i) => (
                          <div key={i} className="h-36 bg-muted animate-pulse rounded-xl"></div>
                        ))
                      ) : achievements.length > 0 ? (
                        // All achievements
                        achievements.map(achievement => (
                          <AchievementCard 
                            key={achievement.id}
                            name={achievement.name}
                            description={achievement.description}
                            icon={achievement.icon}
                            xpReward={achievement.xpReward || 0}
                            unlocked={achievement.unlocked || false}
                            unlockedAt={achievement.unlockedAt}
                          />
                        ))
                      ) : (
                        // Empty state
                        <div className="col-span-full p-4 text-center">
                          <p className="text-muted-foreground">No achievements available</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <TabBar />
    </>
  );
}

export default function ProfileStatsPage() {
  return (
    <HabitsProvider>
      <AchievementsProvider>
        <ProfileStatsContent />
      </AchievementsProvider>
    </HabitsProvider>
  );
}