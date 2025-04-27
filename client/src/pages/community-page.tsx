import { useState } from "react";
import { CommunityProvider, useCommunity, postContentSchema } from "@/hooks/use-community";
import { useAuth } from "@/hooks/use-auth";
import Header from "@/components/layout/header";
import TabBar from "@/components/layout/tab-bar";
import LeaderboardEntryComponent from "@/components/leaderboard-entry";
import ActivityEntry from "@/components/activity-entry";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Globe,
  MessageSquare,
  TrendingUp,
  Loader2,
  Send
} from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";

function CommunityContent() {
  const { user } = useAuth();
  const { 
    activity, 
    leaderboard, 
    isLoading, 
    isLeaderboardLoading, 
    isGlobalLeaderboard, 
    toggleLeaderboard,
    createPost,
    isPosting
  } = useCommunity();
  
  // Form for creating new posts
  const form = useForm({
    resolver: zodResolver(postContentSchema),
    defaultValues: {
      content: "",
    },
  });
  
  // Handle form submission
  const onSubmit = (data: { content: string }) => {
    createPost(data.content);
    form.reset();
  };
  
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const userInitials = getInitials(user?.displayName || user?.username || "");
  
  return (
    <>
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Community</h1>
        
        <Tabs defaultValue="leaderboard">
          <TabsList className="mb-6">
            <TabsTrigger value="leaderboard" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Activity Feed
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="leaderboard">
            <Card className="rounded-2xl shadow-sm border border-gray-100 p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Leaderboard</h3>
                <div className="flex text-sm">
                  <Button 
                    variant={isGlobalLeaderboard ? "ghost" : "default"} 
                    size="sm" 
                    className="rounded-l-lg rounded-r-none flex items-center"
                    onClick={toggleLeaderboard}
                    disabled={isLeaderboardLoading}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Friends
                  </Button>
                  <Button 
                    variant={isGlobalLeaderboard ? "default" : "ghost"} 
                    size="sm" 
                    className="rounded-r-lg rounded-l-none flex items-center"
                    onClick={toggleLeaderboard}
                    disabled={isLeaderboardLoading}
                  >
                    <Globe className="h-4 w-4 mr-1" />
                    Global
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {isLeaderboardLoading ? (
                  // Loading state
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-lg"></div>
                  ))
                ) : leaderboard.length > 0 ? (
                  // Leaderboard entries
                  leaderboard.map(entry => (
                    <LeaderboardEntryComponent key={entry.userId} entry={entry} />
                  ))
                ) : (
                  // Empty state
                  <Card className="p-4 text-center">
                    <p className="text-gray-500">No leaderboard data available</p>
                  </Card>
                )}
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card className="rounded-2xl shadow-sm border border-gray-100 p-5">
              {/* New post form */}
              <div className="mb-6">
                <h3 className="font-medium mb-3">Share with the community</h3>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <Avatar>
                          {user?.profileImage ? (
                            <AvatarImage src={user.profileImage} alt={user.displayName || user.username} />
                          ) : (
                            <AvatarFallback className="bg-gray-200 text-gray-700">
                              {userInitials}
                            </AvatarFallback>
                          )}
                        </Avatar>
                      </div>
                      <div className="flex-grow">
                        <FormField
                          control={form.control}
                          name="content"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share a milestone or encourage others..." 
                                  className="min-h-20 resize-none"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={isPosting}
                        className="flex items-center"
                      >
                        {isPosting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Posting...
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Post
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Latest Activity</h3>
                <div className="space-y-4">
                  {isLoading ? (
                    // Loading state
                    Array(5).fill(0).map((_, i) => (
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
                      <p className="text-gray-500">No community activity yet. Be the first to post!</p>
                    </Card>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <TabBar />
    </>
  );
}

export default function CommunityPage() {
  return (
    <CommunityProvider>
      <CommunityContent />
    </CommunityProvider>
  );
}
