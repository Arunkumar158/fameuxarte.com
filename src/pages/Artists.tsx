
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import HomeNav from "@/components/home/HomeNav";
import ArtistsHeader from "@/components/artists/ArtistsHeader";
import ArtistsFilterBar from "@/components/artists/ArtistsFilterBar";
import ArtistsGrid from "@/components/artists/ArtistsGrid";
import ArtistsLoadMoreButton from "@/components/artists/LoadMoreButton";
import { Artist as DisplayArtist } from "@/components/artists/ArtistCard";
import { usePagination } from "@/hooks/usePagination";

const Artists = () => {
  const {
    page,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    setTotalItems,
    goToPage,
    calculateRange,
    limit,
  } = usePagination({ initialLimit: 12 });

  const { data: artists, isLoading: initialLoading } = useQuery({
    queryKey: ["artists-profiles", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);

      try {
        // Fetch artist profiles directly from profiles table
        const { data: profiles, error, count } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, bio, city, country, mediums, art_styles, cover_image, website", { count: "exact" })
          .eq("role", "artist")
          .order("updated_at", { ascending: false })
          .range(from, to);

        if (error) throw error;

        if (count !== null) {
          setTotalItems(count);
          setHasMore(from + limit < count);
        }

        if (!profiles || profiles.length === 0) return [];

        // Fetch artwork counts for all artist profiles in one query
        const profileIds = profiles.map((p) => p.id);
        const { data: artworkCounts } = await supabase
          .from("artworks")
          .select("artist_id")
          .in("artist_id", profileIds)
          .eq("status", "available");

        const countByArtist: Record<string, number> = {};
        (artworkCounts || []).forEach((a) => {
          if (a.artist_id) {
            countByArtist[a.artist_id] = (countByArtist[a.artist_id] || 0) + 1;
          }
        });

        // Fetch sold artwork counts
        const { data: soldCounts } = await supabase
          .from("artworks")
          .select("artist_id")
          .in("artist_id", profileIds)
          .eq("status", "sold");

        const soldByArtist: Record<string, number> = {};
        (soldCounts || []).forEach((a) => {
          if (a.artist_id) {
            soldByArtist[a.artist_id] = (soldByArtist[a.artist_id] || 0) + 1;
          }
        });

        return profiles.map((profile) => ({
          id: profile.id,
          name: profile.full_name || "Verified Artist",
          location:
            profile.city && profile.country
              ? `${profile.city}, ${profile.country}`
              : profile.city || profile.country || "India",
          bio: profile.bio || undefined,
          medium: profile.mediums?.join(", ") || undefined,
          avatar: profile.avatar_url || undefined,
          artworkCount: countByArtist[profile.id] || 0,
          collectedCount: soldByArtist[profile.id] || 0,
          verified: true,
        }));
      } finally {
        setIsLoading(false);
      }
    },
  });

  const displayArtists: DisplayArtist[] = artists ?? [];
  const verifiedCount = displayArtists.length;

  return (
    <div className="min-h-screen bg-obsidian">
      <HomeNav />
      <ArtistsHeader totalArtists={verifiedCount} verifiedCount={verifiedCount} />
      <ArtistsFilterBar />
      {initialLoading ? (
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2">
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <div className="h-14 w-14 animate-pulse rounded-full bg-surface-3" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-surface-3" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
                  <div className="mt-3 h-10 w-full animate-pulse rounded bg-surface-3" />
                  <div className="mt-2 flex w-full justify-between gap-4">
                    <div className="h-8 w-1/2 animate-pulse rounded bg-surface-3" />
                    <div className="h-8 w-1/2 animate-pulse rounded bg-surface-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : displayArtists.length === 0 ? (
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="text-[14px] text-[#666]">No artists have joined the platform yet.</p>
        </div>
      ) : (
        <>
          <ArtistsGrid artists={displayArtists} />
          <ArtistsLoadMoreButton
            onLoadMore={() => goToPage(page + 1)}
            loading={isLoading}
            hasMore={hasMore}
          />
        </>
      )}
    </div>
  );
};

export default Artists;
