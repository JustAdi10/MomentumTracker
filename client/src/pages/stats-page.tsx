import { useQuery } from "@tanstack/react-query";
import { HabitsProvider, useHabits } from "@/hooks/use-habits";
import { useStats } from "@/hooks/use-stats";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import ProgressRing from "@/components/progress-ring";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { CalendarIcon, BarChart2Icon, TrendingUpIcon, AwardIcon, Flame } from "lucide-react";

function StatsContent() {
  const { user } = useAuth();
  const { habits } = useHabits();
  const { weeklyData, monthlyData, streakData, completionRate, isLoading } = useStats();

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        </main>
        <TabBar />
      </>
    );
  }

  // Set up colors for charts
  const COLORS = ['#5D68F1', '#FF6B6B', '#4CAF50', '#FFC107'];

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

  return (
    <>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Statistics</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Current Streak Card */}
          <Card className="p-5 flex items-center">
            <div className="rounded-full bg-primary/10 p-4 mr-5">
              <Flame className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Longest Streak</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800">{streakData.longest}</span>
                <span className="ml-2 text-gray-500">days</span>
              </div>
              <p className="text-sm text-gray-500">Current: {streakData.current} days</p>
            </div>
          </Card>
          
          {/* Level Card */}
          <Card className="p-5 flex items-center">
            <div className="rounded-full bg-secondary/10 p-4 mr-5">
              <AwardIcon className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Level Progress</h3>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold text-gray-800">Level {user?.level || 1}</span>
                <span className="ml-2 text-gray-500">{user?.division || "Bronze"}</span>
              </div>
              <div className="mt-2 w-36 h-2 bg-gray-100 rounded-full">
                <div 
                  className="h-2 bg-secondary rounded-full" 
                  style={{ width: `${(user?.xp || 0) / ((user?.level || 1) * 1000) * 100}%` }}
                ></div>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Charts Section */}
        <Tabs defaultValue="weekly">
          <TabsList className="mb-6">
            <TabsTrigger value="weekly" className="flex items-center">
              <BarChart2Icon className="h-4 w-4 mr-2" />
              Weekly
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex items-center">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Monthly
            </TabsTrigger>
            <TabsTrigger value="habits" className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2" />
              Habits
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="space-y-6">
            <Card className="p-5">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Weekly Completion</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#5D68F1" name="Completed" />
                    <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-5">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Weekly XP Earned</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="xp" 
                      stroke="#FF6B6B" 
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
              <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Completion Rate</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#5D68F1" 
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
              <h3 className="text-lg font-medium text-gray-700 mb-4">Monthly Streak Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="streak" 
                      stroke="#FFC107" 
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
                <h3 className="text-lg font-medium text-gray-700 mb-4">Habit Completion</h3>
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
                <h3 className="text-lg font-medium text-gray-700 mb-4">Habits by Frequency</h3>
                {habitsByFrequency.length > 0 ? (
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No habits created yet</p>
                  </div>
                )}
              </Card>
              
              <Card className="p-5 md:col-span-2">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Completion Rate by Habit</h3>
                {habits.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={completionRate}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="rate" fill="#5D68F1" name="Completion Rate (%)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-gray-500">No habits created yet</p>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <TabBar />
    </>
  );
}

export default function StatsPage() {
  return (
    <HabitsProvider>
      <StatsContent />
    </HabitsProvider>
  );
}
