
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import ArtistCard from "@/components/ArtistCard";
import SectionTitle from "@/components/shared/SectionTitle";
import LoadMoreButton from "@/components/shared/LoadMoreButton";
import { usePagination } from "@/hooks/usePagination";
import HomeNav from "@/components/home/HomeNav";
import ArtistsHeader from "@/components/artists/ArtistsHeader";
import ArtistsFilterBar from "@/components/artists/ArtistsFilterBar";
import ArtistsGrid from "@/components/artists/ArtistsGrid";
import ArtistsLoadMoreButton from "@/components/artists/LoadMoreButton";
import { Artist as DisplayArtist } from "@/components/artists/ArtistCard";

const PLACEHOLDER_ARTISTS: DisplayArtist[] = [
  {
    id: "1",
    name: "Riya Menon",
    location: "Thiruvananthapuram, Kerala",
    medium: "Oil painting, Abstract",
    bio: "Contemporary artist exploring the intersection of traditional Kerala temple art and modern abstraction.",
    artworkCount: 14,
    collectedCount: 9,
    verified: true,
  },
  {
    id: "2",
    name: "Arjun Pillai",
    location: "Mumbai, Maharashtra",
    medium: "Mixed media, Sculpture",
    bio: "Creates large-scale installations inspired by urban decay and renewal.",
    artworkCount: 22,
    collectedCount: 18,
    verified: true,
  },
  {
    id: "3",
    name: "Priya Nair",
    location: "Bangalore, Karnataka",
    medium: "Acrylic painting, Landscape",
    bio: "Known for vivid landscape works capturing the natural beauty of South India.",
    artworkCount: 8,
    collectedCount: 8,
    verified: true,
  },
  {
    id: "4",
    name: "Suresh Kumar",
    location: "Chennai, Tamil Nadu",
    medium: "Watercolor, Portrait",
    bio: "Traditional portrait artist with a contemporary twist, specializing in cultural subjects.",
    artworkCount: 31,
    collectedCount: 24,
    verified: true,
  },
];

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
    limit
  } = usePagination({ initialLimit: 6 });

  const { data: artists, isLoading: initialLoading } = useQuery({
    queryKey: ["artists", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);
      
      try {
        const { data, error, count } = await supabase
          .from("artists")
          .select(
            `
            *,
            profile:profiles!artists_profile_id_fkey (
              id,
              full_name,
              avatar_url
            )
          `,
            { count: "exact" }
          )
          .range(from, to);

        if (error) throw error;
        
        // Update hasMore based on count
        if (count) {
          setTotalItems(count);
          setHasMore((from + limit) < count);
        }
        
        return data || [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  const displayArtists: DisplayArtist[] = artists?.length
    ? artists.map((artist, index) => {
        const row = artist as Record<string, unknown>;
        const profile = row.profile as Record<string, unknown> | null | undefined;

        return {
          id: String(row.id),
          name: String(profile?.full_name || row.name || row.full_name || row.artist_name || `Verified Artist ${index + 1}`),
          location: typeof row.location === "string" ? row.location : "India",
          bio: typeof row.bio === "string" ? row.bio : undefined,
          medium: typeof row.medium === "string" ? row.medium : typeof row.specialty === "string" ? row.specialty : undefined,
          avatar: typeof row.avatar === "string" ? row.avatar : typeof row.image === "string" ? row.image : typeof profile?.avatar_url === "string" ? profile.avatar_url : typeof row.avatar_url === "string" ? row.avatar_url : undefined,
          artworkCount: typeof row.artworkCount === "number" ? row.artworkCount : typeof row.artwork_count === "number" ? row.artwork_count : typeof row.works_count === "number" ? row.works_count : 0,
          collectedCount: typeof row.collectedCount === "number" ? row.collectedCount : typeof row.collected_count === "number" ? row.collected_count : typeof row.sold_count === "number" ? row.sold_count : 0,
          verified: typeof row.verified === "boolean" ? row.verified : true,
        };
      })
    : PLACEHOLDER_ARTISTS;

  const verifiedCount = displayArtists.filter((artist) => artist.verified).length;

  return (
    <div className="min-h-screen bg-obsidian">
      <HomeNav />
      <ArtistsHeader totalArtists={displayArtists.length} verifiedCount={verifiedCount} />
      <ArtistsFilterBar />
      {initialLoading ? (
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-white/5 bg-brand-dark/80">
                <div className="flex flex-col items-center justify-center space-y-4 p-8">
                  <div className="h-24 w-24 animate-pulse rounded-full bg-surface-3" />
                  <div className="h-6 w-3/4 animate-pulse rounded bg-surface-3" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
                  <div className="mt-4 flex w-full justify-between gap-4">
                    <div className="h-8 w-1/2 animate-pulse rounded bg-surface-3" />
                    <div className="h-8 w-1/2 animate-pulse rounded bg-surface-3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <ArtistsGrid artists={displayArtists} />
          <ArtistsLoadMoreButton onLoadMore={() => goToPage(page + 1)} loading={isLoading} hasMore={hasMore} />
        </>
      )}
    </div>
  );
};

export default Artists;
