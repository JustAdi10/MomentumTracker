import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { HabitsProvider, useHabits } from "@/hooks/use-habits";
import { AchievementsProvider, useAchievements } from "@/hooks/use-achievements";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import MotivationalQuote from "@/components/layout/motivational-quote";
import ProgressRing from "@/components/progress-ring";
import HabitCard from "@/components/habit-card";
import AchievementCard from "@/components/achievement-card";
import LeaderboardEntryComponent from "@/components/leaderboard-entry";
import ActivityEntry from "@/components/activity-entry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Flame, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import AddHabitDialog from "@/components/add-habit-dialog";
import { cacheApiResponse, getCachedApiResponse } from "@/lib/local-storage";

// Home dashboard content that requires providers
function HomeContent() {
  const { user } = useAuth();
  const { habits, isLoading: isHabitsLoading } = useHabits();
  const { recentAchievements, isLoading: isAchievementsLoading } = useAchievements();
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Fetch user stats
  const { data: stats, isLoading: isStatsLoading } = useQuery<{
    completionPercentage: number;
    longestStreak: number;
    level: number;
    division: string;
    xp: {
      current: number;
      total: number;
      remaining: number;
      percentage: number;
    };
    habitsCount: {
      total: number;
      completed: number;
    };
  }>({
    queryKey: ["/api/user/stats"],
    staleTime: 60000, // 1 minute
  });

  // Fetch top of leaderboard
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery<any[]>({
    queryKey: ["/api/leaderboard", false], // false = friends leaderboard
    staleTime: 60000, // 1 minute
  });

  // Fetch community activity
  const { data: activity = [], isLoading: isActivityLoading } = useQuery<any[]>({
    queryKey: ["/api/community/activity"],
    staleTime: 60000, // 1 minute
    select: (data) => data.slice(0, 2), // Only show 2 most recent activities
  });

  // Cache responses for offline access
  useEffect(() => {
    if (stats) cacheApiResponse('user_stats', stats);
    if (habits) cacheApiResponse('habits', habits);
    if (leaderboard) cacheApiResponse('leaderboard', leaderboard);
    if (activity) cacheApiResponse('activity', activity);
    if (recentAchievements) cacheApiResponse('achievements', recentAchievements);
  }, [stats, habits, leaderboard, activity, recentAchievements]);

  // Get cached data if loading
  const cachedStats = isStatsLoading ? getCachedApiResponse('user_stats', 24 * 60 * 60 * 1000).data : null;
  const statsData = stats || cachedStats;

  // Current date
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  // Calculate habits to show (max 3 for home page)
  const habitsToShow = habits.slice(0, 3);

  return (
    <>
      <MotivationalQuote />
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        {/* Today Summary Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Today's Progress</h2>
            <div className="text-sm text-gray-500">{dateString}</div>
          </div>
          
          <Card className="rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center mb-6 md:mb-0">
                {/* Progress Ring */}
                <ProgressRing 
                  percentage={statsData?.completionPercentage || 0} 
                  text={`${statsData?.completionPercentage || 0}%`}
                  textBottom="Completed"
                />

                <div className="ml-6">
                  <div className="mb-2">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500">Current Streak</span>
                      <Flame className="h-4 w-4 ml-1 text-amber-500" />
                    </div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-gray-800">{statsData?.longestStreak || 0}</span>
                      <span className="ml-1 text-sm text-gray-500">days</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500">Level</div>
                    <div className="flex items-baseline">
                      <span className="text-2xl font-bold text-primary">{statsData?.level || 1}</span>
                      <span className="ml-1 text-sm text-gray-500">{statsData?.division || "Bronze"}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-auto">
                <div className="w-full md:w-48 h-3 bg-gray-100 rounded-full mb-1">
                  <div 
                    className="h-3 bg-primary rounded-full" 
                    style={{ width: `${statsData?.xp?.percentage || 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{statsData?.xp?.current || 0} XP</span>
                  <span>{statsData?.xp?.remaining || 0} XP to Level {(statsData?.level || 1) + 1}</span>
                </div>
                <Button 
                  onClick={() => setShowAddHabit(true)}
                  className="mt-4 w-full py-2 px-4 bg-secondary text-white rounded-lg font-medium shadow-sm hover:bg-secondary-600 transition duration-200 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add New Habit
                </Button>
              </div>
            </div>
          </Card>
        </section>

        {/* Habits Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Today's Habits</h2>
            <Link href="/habits">
              <Button variant="link" className="text-primary font-medium text-sm flex items-center">
                <span>View All</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {isHabitsLoading ? (
              // Loading state
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
              ))
            ) : habitsToShow.length > 0 ? (
              // Habits list
              habitsToShow.map(habit => (
                <HabitCard key={habit.id} habit={habit} />
              ))
            ) : (
              // Empty state
              <Card className="p-8 text-center">
                <h3 className="font-medium text-gray-800 mb-2">No habits yet</h3>
                <p className="text-gray-500 mb-4">Start building momentum by adding your first habit</p>
                <Button onClick={() => setShowAddHabit(true)}>Add Habit</Button>
              </Card>
            )}
          </div>
        </section>

        {/* Achievements Section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Recent Achievements</h2>
            <Link href="/profile">
              <Button variant="link" className="text-primary font-medium text-sm flex items-center">
                <span>View All</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {isAchievementsLoading ? (
              // Loading state
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-36 bg-gray-100 animate-pulse rounded-xl"></div>
              ))
            ) : recentAchievements.length > 0 ? (
              // Achievements list
              recentAchievements.map(achievement => (
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
              // Empty state - show locked achievements
              Array(4).fill(0).map((_, i) => (
                <AchievementCard 
                  key={i}
                  name="???"
                  description="Keep going to unlock achievements"
                  icon="lock"
                  xpReward={0}
                  unlocked={false}
                />
              ))
            )}
          </div>
        </section>

        {/* Community Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Community</h2>
            <Link href="/community">
              <Button variant="link" className="text-primary font-medium text-sm flex items-center">
                <span>View All</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          <Card className="rounded-2xl shadow-sm border border-gray-100 p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium">Leaderboard</h3>
              <div className="flex text-sm">
                <Button variant="default" size="sm" className="rounded-l-lg rounded-r-none">Friends</Button>
                <Button variant="ghost" size="sm" className="rounded-r-lg rounded-l-none">Global</Button>
              </div>
            </div>

            <div className="space-y-4">
              {isLeaderboardLoading ? (
                // Loading state
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
                ))
              ) : leaderboard.length > 0 ? (
                // Leaderboard entries (top 3)
                leaderboard.slice(0, 3).map(entry => (
                  <LeaderboardEntryComponent key={entry.userId} entry={entry} />
                ))
              ) : (
                // Empty state
                <Card className="p-4 text-center">
                  <p className="text-gray-500">No leaderboard data available</p>
                </Card>
              )}
            </div>

            <div className="mt-4">
              <h3 className="font-medium mb-3">Latest Activity</h3>
              <div className="space-y-3">
                {isActivityLoading ? (
                  // Loading state
                  Array(2).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
                  ))
                ) : activity.length > 0 ? (
                  // Activity entries
                  activity.map(item => (
                    <ActivityEntry key={item.id} activity={item} />
                  ))
                ) : (
                  // Empty state
                  <Card className="p-4 text-center">
                    <p className="text-gray-500">No recent activity</p>
                  </Card>
                )}
              </div>
            </div>
          </Card>
        </section>
      </main>
      
      <TabBar />
      
      <AddHabitDialog open={showAddHabit} onOpenChange={setShowAddHabit} />
    </>
  );
}

// Main component with necessary providers
export default function HomePage() {
  return (
    <HabitsProvider>
      <AchievementsProvider>
        <HomeContent />
      </AchievementsProvider>
    </HabitsProvider>
  );
}

import { useState } from "react";
