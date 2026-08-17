import React from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserCheck, UserPlus, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface FollowedArtist {
  follow_id: string;
  followed_at: string;
  artist_id: string;
  name: string;
  avatar_url: string | null;
  mediums: string[] | null;
  location: string | null;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

const formatRelativeDate = (isoDate: string) => {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  return `${Math.floor(months / 12)} year${Math.floor(months / 12) > 1 ? "s" : ""} ago`;
};

const ArtistFollowCard = ({
  artist,
  onUnfollow,
  isUnfollowing,
}: {
  artist: FollowedArtist;
  onUnfollow: () => void;
  isUnfollowing: boolean;
}) => {
  const mediumLabel = artist.mediums?.slice(0, 2).join(", ") || "Artist";

  return (
    <article className="group flex items-center gap-5 rounded-[14px] border border-border-subtle bg-surface-2 p-5 transition-all hover:border-gold/30 hover:bg-surface-3">
      {/* Avatar */}
      <Link
        to={`/artists/${artist.artist_id}`}
        className="relative shrink-0"
        aria-label={`View ${artist.name}'s profile`}
      >
        <div className="h-16 w-16 overflow-hidden rounded-full border border-border-subtle bg-surface-1 transition-transform duration-300 group-hover:scale-105">
          {artist.avatar_url ? (
            <img
              src={artist.avatar_url}
              alt={artist.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1a2a1a] text-[20px] font-medium text-gold">
              {getInitials(artist.name)}
            </div>
          )}
        </div>
        {/* Following indicator dot */}
        <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-gold">
          <UserCheck className="h-2.5 w-2.5 text-obsidian" />
        </span>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link to={`/artists/${artist.artist_id}`} className="block">
          <h3 className="truncate text-[15px] font-medium text-linen transition-colors group-hover:text-gold">
            {artist.name}
          </h3>
          <p className="mt-0.5 truncate text-[12px] text-[#666]">{mediumLabel}</p>
          {artist.location && (
            <p className="mt-0.5 truncate text-[11px] text-[#555]">{artist.location}</p>
          )}
        </Link>
        <p className="mt-1.5 text-[11px] text-[#444]">
          Following since {formatRelativeDate(artist.followed_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="h-8 w-8 rounded-full border border-border-subtle p-0 text-[#888] hover:border-gold/40 hover:text-gold"
          aria-label={`Visit ${artist.name}'s profile`}
        >
          <Link to={`/artists/${artist.artist_id}`}>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isUnfollowing}
          onClick={onUnfollow}
          className="h-8 border-border-subtle bg-transparent px-3 text-[12px] text-[#888] transition-colors hover:border-red-500/40 hover:text-red-400"
        >
          {isUnfollowing ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            "Unfollow"
          )}
        </Button>
      </div>
    </article>
  );
};

const Following = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ── Fetch all followed artists ────────────────────────────────────────────
  const { data: followed = [], isLoading } = useQuery({
    queryKey: ["collector-following", user?.id],
    queryFn: async (): Promise<FollowedArtist[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("artist_follows")
        .select("id, artist_id, created_at")
        .eq("follower_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return [];

      const artistIds = data.map((f) => f.artist_id);

      // Fetch profile info for all followed artists
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, city, country")
        .in("id", artistIds);

      if (profilesError) throw profilesError;

      const profileMap = new Map(
        (profiles as any || []).map((p: any) => [p.id, p])
      );

      return data.map((follow) => {
        const profile = profileMap.get(follow.artist_id) as any;
        const city = profile?.city;
        const country = profile?.country;
        const location =
          city && country
            ? `${city}, ${country}`
            : city || country || null;

        return {
          follow_id: follow.id,
          followed_at: follow.created_at,
          artist_id: follow.artist_id,
          name: profile?.full_name || "Verified Artist",
          avatar_url: profile?.avatar_url || null,
          mediums: (profile?.mediums as string[] | null) || null,
          location,
        };
      });
    },
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  // ── Unfollow mutation ─────────────────────────────────────────────────────
  const { mutate: unfollow, variables: unfollowingId } = useMutation({
    mutationFn: async (followId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("artist_follows")
        .delete()
        .eq("id", followId)
        .eq("follower_id", user.id);
      if (error) throw error;
    },
    onSuccess: (_, followId) => {
      queryClient.invalidateQueries({ queryKey: ["collector-following", user?.id] });
      // Also invalidate the individual follow status for the artist
      const artist = followed.find((f) => f.follow_id === followId);
      if (artist) {
        queryClient.invalidateQueries({
          queryKey: ["artist-follow-status", user?.id, artist.artist_id],
        });
        queryClient.invalidateQueries({
          queryKey: ["artist-followers-count", artist.artist_id],
        });
      }
      toast({ title: "Unfollowed", description: "Artist removed from your following list." });
    },
    onError: () => {
      toast({
        title: "Something went wrong",
        description: "Could not unfollow artist. Please try again.",
        variant: "destructive",
      });
    },
  });

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-[32px] font-medium text-linen">Following Artists</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-5 rounded-[14px] border border-border-subtle bg-surface-2 p-5 animate-pulse"
            >
              <div className="h-16 w-16 shrink-0 rounded-full bg-surface-1" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 rounded bg-surface-1" />
                <div className="h-3 w-24 rounded bg-surface-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (followed.length === 0) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <h1 className="text-[32px] font-medium text-linen">Following Artists</h1>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border border-border-subtle bg-surface-2">
            <UserPlus className="h-12 w-12 text-gold opacity-50" />
          </div>
          <h2 className="mb-3 text-[28px] font-medium text-linen">
            Your favorite artists will appear here.
          </h2>
          <p className="mb-8 max-w-md text-stone">
            Follow artists from their profile page to stay updated on their latest releases and exhibitions.
          </p>
          <Button asChild className="rounded-full bg-gold px-8 text-obsidian hover:bg-linen">
            <Link to="/artists">Discover verified artists</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Main content ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-medium text-linen">Following Artists</h1>
          <p className="mt-1 text-[14px] text-[#666]">
            {followed.length} artist{followed.length !== 1 ? "s" : ""} you're following
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-full bg-gold px-5 text-[13px] text-obsidian hover:bg-linen"
        >
          <Link to="/artists">
            <UserPlus className="mr-2 h-3.5 w-3.5" />
            Discover More
          </Link>
        </Button>
      </div>

      <div className="space-y-3">
        {followed.map((artist) => (
          <ArtistFollowCard
            key={artist.follow_id}
            artist={artist}
            isUnfollowing={unfollowingId === artist.follow_id}
            onUnfollow={() => unfollow(artist.follow_id)}
          />
        ))}
      </div>
    </div>
  );
};

export default Following;
