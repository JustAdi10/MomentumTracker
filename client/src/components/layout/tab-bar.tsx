import { Link, useLocation } from "wouter";
import { Home, ListTodo, BarChart2, Users, User, Plus } from "lucide-react";
import { useHabits } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import AddHabitDialog from "@/components/add-habit-dialog";

export default function TabBar() {
  const [location] = useLocation();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  
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
      <AddHabitDialog open={openAddDialog} onOpenChange={setOpenAddDialog} />
    </>
  );
}
