import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { HabitsProvider } from "@/hooks/use-habits";
import { StatsProvider } from "@/hooks/use-stats";
import { AchievementsProvider } from "@/hooks/use-achievements";
import { CommunityProvider } from "@/hooks/use-community";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import HabitsPage from "@/pages/habits-page";
import CommunityPage from "@/pages/community-page";
import ProfileStatsPage from "@/pages/profile-stats-page";
import AuthPage from "@/pages/auth-page";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/habits" component={HabitsPage} />
      <ProtectedRoute path="/profile" component={ProfileStatsPage} />
      <ProtectedRoute path="/community" component={CommunityPage} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HabitsProvider>
          <StatsProvider>
            <AchievementsProvider>
              <CommunityProvider>
                <TooltipProvider>
                  <div className="min-h-screen bg-background transition-colors duration-300">
                    <Toaster />
                    <Router />
                  </div>
                </TooltipProvider>
              </CommunityProvider>
            </AchievementsProvider>
          </StatsProvider>
        </HabitsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
