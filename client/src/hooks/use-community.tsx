import { createContext, ReactNode, useContext } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CommunityActivity, LeaderboardEntry } from "@shared/schema";
import { z } from "zod";

type CommunityContextType = {
  activity: CommunityActivity[];
  leaderboard: LeaderboardEntry[];
  isLoading: boolean;
  isLeaderboardLoading: boolean;
  cheerPost: (postId: number) => void;
  isGlobalLeaderboard: boolean;
  toggleLeaderboard: () => void;
  isCheering: boolean | number;
  createPost: (content: string) => void;
  isPosting: boolean;
};

// Post content validation schema
export const postContentSchema = z.object({
  content: z.string().min(1, "Post content is required").max(280, "Post content cannot exceed 280 characters"),
});

export type PostContent = z.infer<typeof postContentSchema>;

const CommunityContext = createContext<CommunityContextType | null>(null);

export function CommunityProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [isGlobalLeaderboard, setIsGlobalLeaderboard] = React.useState(false);

  // Fetch community activity
  const { data: activity = [], isLoading } = useQuery<CommunityActivity[]>({
    queryKey: ["/api/community/activity"],
    staleTime: 60000, // 1 minute
  });

  // Fetch leaderboard (friends or global)
  const { data: leaderboard = [], isLoading: isLeaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["/api/leaderboard", isGlobalLeaderboard],
    queryFn: async ({ queryKey }) => {
      const isGlobal = queryKey[1];
      const res = await fetch(`/api/leaderboard?global=${isGlobal}`, {
        credentials: "include"
      });
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 60000, // 1 minute
  });

  // Cheer a post
  const cheerMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/community/posts/${postId}/cheer`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/activity"] });
      toast({
        title: "Cheered!",
        description: "You cheered a community post",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to cheer post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Create a new community post
  const createPostMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/community/posts", {
        content,
        type: "general"
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/community/activity"] });
      toast({
        title: "Post created",
        description: "Your post has been shared with the community",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle cheering a post
  const cheerPost = (postId: number) => {
    cheerMutation.mutate(postId);
  };

  // Toggle between friends and global leaderboard
  const toggleLeaderboard = () => {
    setIsGlobalLeaderboard(!isGlobalLeaderboard);
  };

  // Create a community post
  const createPost = (content: string) => {
    createPostMutation.mutate(content);
  };

  return (
    <CommunityContext.Provider
      value={{
        activity,
        leaderboard,
        isLoading,
        isLeaderboardLoading,
        cheerPost,
        isGlobalLeaderboard,
        toggleLeaderboard,
        isCheering: cheerMutation.isPending ? (cheerMutation.variables as number) : false,
        createPost,
        isPosting: createPostMutation.isPending
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
}

export function useCommunity() {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
}
