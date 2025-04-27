import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Bell, Menu, ChevronDown } from "lucide-react";
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
    <header className="sticky top-0 bg-background/95 backdrop-blur-sm z-40 border-b border-border pt-6 transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary via-amber-500 to-primary text-white flex items-center justify-center mr-3 shadow-sm">
                <span className="font-bold text-lg">M</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">
                <span className="text-primary">Momen</span><span className="text-foreground">tum</span>
              </h1>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-3">
          <ThemeToggle />
          
          <Button 
            variant="outline" 
            size="icon" 
            className="relative rounded-full border-primary/20 bg-background hover:bg-primary/5"
          >
            <Link href="/profile">
              <div className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {hasNotifications && (
                  <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </div>
            </Link>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-full flex items-center gap-2 h-9 pl-1 pr-3 border-primary/20 bg-background hover:bg-primary/5">
                <Avatar className="h-7 w-7 border-2 border-primary/20">
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
                <span className="text-sm font-medium hidden sm:block text-foreground">
                  {user.displayName || user.username}
                </span>
                <ChevronDown className="h-4 w-4 text-primary/70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl">
              <DropdownMenuLabel className="text-primary">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <div className="cursor-pointer w-full">Profile</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/stats">
                  <div className="cursor-pointer w-full">Statistics</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <div className="cursor-pointer w-full">Settings</div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
