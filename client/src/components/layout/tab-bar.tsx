import { Link, useLocation } from "wouter";
import { Home, ListTodo, BarChart2, Users, User, Plus } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function TabBar() {
  const [location] = useLocation();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const { addHabit, isAddingHabit } = useHabits();
  
  const handleAddNewHabit = (data: any) => {
    addHabit(data);
    setOpenAddDialog(false);
  };
  
  const tabs = [
    {
      icon: Home,
      label: "Home",
      path: "/",
      active: location === "/"
    },
    {
      icon: ListTodo,
      label: "Habits",
      path: "/habits",
      active: location === "/habits"
    },
    {
      icon: BarChart2,
      label: "Stats",
      path: "/stats",
      active: location === "/stats"
    },
    {
      icon: Users,
      label: "Community",
      path: "/community",
      active: location === "/community"
    }
  ];
  
  return (
    <>
      <nav className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 transition-colors duration-300 py-1 px-2 sm:py-2">
        <div className="container mx-auto max-w-md px-2">
          <div className="flex items-center justify-between">
            {tabs.map((tab) => (
              <Link key={tab.path} href={tab.path}>
                <div className={`relative flex flex-col items-center px-2 py-1 rounded-xl transition-all duration-300 
                  ${tab.active 
                    ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                    : 'text-muted-foreground hover:text-primary/80 hover:bg-primary/5 active:bg-primary/10'
                  }`
                }>
                  <tab.icon className={`h-5 w-5 ${tab.active ? 'drop-shadow-sm' : ''}`} />
                  <span className={`text-[10px] mt-0.5 ${tab.active ? 'font-medium' : ''}`}>{tab.label}</span>
                  
                  {tab.active && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                  )}
                </div>
              </Link>
            ))}
            
            {/* Add button */}
            <div className="relative flex flex-col items-center px-2 py-1">
              <Button 
                ref={addButtonRef}
                onClick={() => setOpenAddDialog(true)}
                size="icon" 
                className="h-10 w-10 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
              >
                <Plus className="h-5 w-5" />
              </Button>
              <span className="text-[10px] mt-0.5">Add</span>
            </div>
            
            {/* User profile tab */}
            <Link href="/profile">
              <div className={`relative flex flex-col items-center px-2 py-1 rounded-xl transition-all duration-300 
                ${location === "/profile" 
                  ? 'text-primary bg-primary/10 dark:bg-primary/20' 
                  : 'text-muted-foreground hover:text-primary/80 hover:bg-primary/5 active:bg-primary/10'
                }`
              }>
                <User className={`h-5 w-5 ${location === "/profile" ? 'drop-shadow-sm' : ''}`} />
                <span className={`text-[10px] mt-0.5 ${location === "/profile" ? 'font-medium' : ''}`}>Profile</span>
                
                {location === "/profile" && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </div>
            </Link>
          </div>
        </div>
      </nav>
      
      {/* Spacer to prevent content from being hidden under the tab bar */}
      <div className="h-16"></div>
      
      {/* Add Habit Dialog */}
      <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
        <DialogContent className="sm:max-w-md mx-4 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-center text-primary">Add New Habit</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Create a new habit you want to build. What positive change do you want to make?
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Habit Name
              </label>
              <input
                id="name"
                className="flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="E.g., Drink water, Morning meditation, Exercise"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <textarea
                id="description"
                className="flex min-h-20 rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Why is this habit important to you?"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="frequency" className="text-sm font-medium">
                Frequency
              </label>
              <select
                id="frequency"
                className="flex h-10 rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            
            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={() => setOpenAddDialog(false)}
                className="rounded-lg"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => {
                  // Get form values
                  const nameInput = document.getElementById('name') as HTMLInputElement;
                  const descriptionInput = document.getElementById('description') as HTMLTextAreaElement;
                  const frequencyInput = document.getElementById('frequency') as HTMLSelectElement;
                  
                  if (nameInput && nameInput.value.trim()) {
                    handleAddNewHabit({
                      name: nameInput.value,
                      description: descriptionInput?.value || '',
                      frequency: frequencyInput?.value || 'daily',
                      icon: 'clock',
                      color: '',
                      targetDays: null,
                      reminderTime: null
                    });
                  }
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                disabled={isAddingHabit}
              >
                {isAddingHabit ? 'Adding...' : 'Add Habit'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
