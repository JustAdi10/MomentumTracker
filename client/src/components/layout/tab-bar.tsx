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
    <nav className="sticky bottom-0 bg-white border-t border-gray-200 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          {tabs.map((tab) => (
            <Link key={tab.path} href={tab.path}>
              <a className={`flex flex-col items-center ${tab.active ? 'text-primary' : 'text-gray-500'}`}>
                <tab.icon className="h-6 w-6" />
                <span className={`text-xs mt-1 ${tab.active ? 'font-medium' : ''}`}>{tab.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
