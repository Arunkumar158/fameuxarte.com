import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

/**
 * useFollowArtist
 *
 * Provides:
 *  - isFollowing  — whether the current user follows the given artist
 *  - isLoading    — true while checking follow status
 *  - isMutating   — true while a follow/unfollow request is in flight
 *  - followersCount — total followers for this artist
 *  - toggleFollow — follow if not following, unfollow if following
 */
export function useFollowArtist(artistId: string | undefined) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Check if current user follows this artist ─────────────────────────────
  const { data: isFollowing = false, isLoading } = useQuery({
    queryKey: ["artist-follow-status", user?.id, artistId],
    queryFn: async () => {
      if (!user || !artistId) return false;
      const { data, error } = await supabase
        .from("artist_follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("artist_id", artistId)
        .maybeSingle();
      if (error) throw error;
      return Boolean(data);
    },
    enabled: Boolean(user && artistId),
    staleTime: 30_000,
  });

  // ── Total followers count for this artist ────────────────────────────────
  const { data: followersCount = 0 } = useQuery({
    queryKey: ["artist-followers-count", artistId],
    queryFn: async () => {
      if (!artistId) return 0;
      const { count, error } = await supabase
        .from("artist_follows")
        .select("id", { count: "exact", head: true })
        .eq("artist_id", artistId);
      if (error) throw error;
      return count ?? 0;
    },
    enabled: Boolean(artistId),
    staleTime: 60_000,
  });

  // ── Follow / Unfollow mutation ────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async () => {
      if (!user || !artistId) throw new Error("Not authenticated");

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("artist_follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("artist_id", artistId);
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from("artist_follows")
          .insert({ follower_id: user.id, artist_id: artistId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["artist-follow-status", user?.id, artistId] });
      queryClient.invalidateQueries({ queryKey: ["artist-followers-count", artistId] });
      queryClient.invalidateQueries({ queryKey: ["collector-following", user?.id] });

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: isFollowing
          ? "You've unfollowed this artist."
          : "Artist added to your Following list.",
      });
    },
    onError: (error: Error) => {
      console.error("Follow/unfollow error:", error);
      toast({
        title: "Something went wrong",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleFollow = () => {
    if (!user) {
      // Save intended destination and redirect to auth
      localStorage.setItem("authRedirect", window.location.pathname);
      navigate("/auth");
      return;
    }
    mutation.mutate();
  };

  return {
    isFollowing,
    isLoading,
    isMutating: mutation.isPending,
    followersCount,
    toggleFollow,
  };
}
