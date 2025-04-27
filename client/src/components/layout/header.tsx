import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Bell, User, ChevronDown, BarChart2, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ThemeToggle from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, logoutMutation } = useAuth();
  const [hasNotifications] = useState(true);
  
  if (!user) return null;
  
  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = getInitials(user.displayName || user.username);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <header className="fixed top-0 inset-x-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border transition-colors duration-300">
      <div className="container mx-auto max-w-md px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary via-amber-500 to-primary text-white flex items-center justify-center mr-2 shadow-sm">
                <span className="font-bold text-base">M</span>
              </div>
              <h1 className="text-lg font-bold text-foreground">
                <span className="text-primary">Momen</span><span className="text-foreground">tum</span>
              </h1>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          <Button 
            variant="outline" 
            size="icon" 
            aria-label="Notifications"
            className="relative rounded-full w-8 h-8 p-0 border-primary/20 bg-background hover:bg-primary/5"
          >
            <Link href="/profile">
              <div className="relative">
                <Bell className="h-4 w-4 text-muted-foreground" />
                {hasNotifications && (
                  <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-primary rounded-full"></span>
                )}
              </div>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="rounded-full flex items-center h-8 w-8 p-0 border-primary/20 bg-background hover:bg-primary/5 sm:w-auto sm:pr-3 sm:pl-1"
              >
                <Avatar className="h-6 w-6 border-2 border-primary/20">
                  {user.profileImage ? (
                    <AvatarImage 
                      src={user.profileImage} 
                      alt={user.displayName || user.username}
                    />
                  ) : (
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {userInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm font-medium hidden sm:block sm:ml-2 text-foreground">
                  {user.displayName || user.username}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="text-primary">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="cursor-pointer w-full flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary/70" />
                    Profile
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats">
                  <div className="cursor-pointer w-full flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2 text-primary/70" />
                    Statistics
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="cursor-pointer w-full flex items-center">
                    <Settings className="h-4 w-4 mr-2 text-primary/70" />
                    Settings
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive flex items-center">
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Spacer to prevent content from being hidden under the fixed header */}
      <div className="h-[52px]"></div>
    </header>
  );
}
