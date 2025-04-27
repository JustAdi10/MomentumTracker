import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HabitsProvider, useHabits } from "@/hooks/use-habits";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import HabitCard from "@/components/habit-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar } from "lucide-react";
import AddHabitDialog from "@/components/add-habit-dialog";
import { cacheUserHabits, getCachedUserHabits } from "@/lib/local-storage";

function HabitsContent() {
  const { habits, isLoading } = useHabits();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddHabit, setShowAddHabit] = useState(false);

  // Get today's date for highlight
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  // Filter habits based on search query and selected tab
  const filteredHabits = habits.filter(habit => {
    const matchesSearch = habit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (habit.description && habit.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "completed") return matchesSearch && habit.isCompletedToday;
    if (activeTab === "incomplete") return matchesSearch && !habit.isCompletedToday;
    
    return matchesSearch;
  });

  // Group habits by frequency
  const dailyHabits = filteredHabits.filter(habit => habit.frequency === "daily");
  const weeklyHabits = filteredHabits.filter(habit => habit.frequency === "weekly");
  const monthlyHabits = filteredHabits.filter(habit => habit.frequency === "monthly");

  // Cache habits for offline use
  if (habits.length > 0 && !isLoading) {
    cacheUserHabits(habits);
  }

  return (
    <>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">My Habits</h1>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowAddHabit(true)}
              className="bg-secondary hover:bg-secondary-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Habit
            </Button>
          </div>
        </div>
        
        {/* Date strip */}
        <div className="flex justify-between mb-6 overflow-x-auto p-1">
          {daysOfWeek.map((day, index) => (
            <div 
              key={day} 
              className={`flex flex-col items-center min-w-[50px] p-2 rounded-full ${index === dayOfWeek ? 'bg-primary text-white' : 'text-gray-500'}`}
            >
              <span className="text-xs font-medium">{day}</span>
              <span className="text-lg font-bold">{((today.getDate() - dayOfWeek) + index)}</span>
            </div>
          ))}
        </div>
        
        {/* Search and Tabs */}
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search habits..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="all">
                All
                <Badge variant="outline" className="ml-2 bg-gray-100">{filteredHabits.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {filteredHabits.filter(h => h.isCompletedToday).length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="incomplete">
                Incomplete
                <Badge variant="outline" className="ml-2 bg-gray-100">
                  {filteredHabits.filter(h => !h.isCompletedToday).length}
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Habits list */}
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-xl"></div>
            ))}
          </div>
        ) : filteredHabits.length > 0 ? (
          <div className="space-y-6">
            {/* Daily Habits */}
            {dailyHabits.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-md font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Daily
                </h2>
                <div className="space-y-4">
                  {dailyHabits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Weekly Habits */}
            {weeklyHabits.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-md font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Weekly
                </h2>
                <div className="space-y-4">
                  {weeklyHabits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>
            )}
            
            {/* Monthly Habits */}
            {monthlyHabits.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-md font-semibold text-gray-700 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  Monthly
                </h2>
                <div className="space-y-4">
                  {monthlyHabits.map(habit => (
                    <HabitCard key={habit.id} habit={habit} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          // Empty state
          <Card className="p-8 text-center">
            <h3 className="font-medium text-gray-800 mb-2">No habits found</h3>
            {searchQuery ? (
              <p className="text-gray-500 mb-4">Try adjusting your search or filter</p>
            ) : (
              <>
                <p className="text-gray-500 mb-4">Start building momentum by adding your first habit</p>
                <Button onClick={() => setShowAddHabit(true)}>Add Habit</Button>
              </>
            )}
          </Card>
        )}
      </main>
      
      <TabBar />
      
      <AddHabitDialog open={showAddHabit} onOpenChange={setShowAddHabit} />
    </>
  );
}

export default function HabitsPage() {
  return (
    <HabitsProvider>
      <HabitsContent />
    </HabitsProvider>
  );
}
