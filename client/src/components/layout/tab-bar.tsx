import { Link, useLocation } from "wouter";
import { Home, ListTodo, BarChart2, Users, User } from "lucide-react";

export default function TabBar() {
  const [location] = useLocation();
  
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
    },
    {
      icon: User,
      label: "Profile",
      path: "/profile",
      active: location === "/profile"
    }
  ];
  
  return (
    <nav className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => (
            <Link key={tab.path} href={tab.path}>
              <div className={`flex flex-col items-center transition-all duration-300 ${
                tab.active 
                  ? 'text-primary scale-110' 
                  : 'text-muted-foreground hover:text-primary/70'
              }`}>
                <div className={`relative ${tab.active ? 'p-2 -mt-1' : 'p-1'}`}>
                  {tab.active && (
                    <div className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20 -z-10"></div>
                  )}
                  <tab.icon className={`h-5 w-5 ${tab.active ? 'drop-shadow-md' : ''}`} />
                  {tab.active && (
                    <span className="absolute inset-0 animate-ping rounded-full bg-primary/10"></span>
                  )}
                </div>
                <span className={`text-xs mt-0.5 ${tab.active ? 'font-medium' : ''}`}>{tab.label}</span>
                {tab.active && (
                  <div className="relative mt-1">
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 h-1 w-6 rounded-full bg-primary/20"></span>
                    <span className="h-1 w-4 rounded-full bg-primary block"></span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
