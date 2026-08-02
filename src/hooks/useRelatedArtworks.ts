import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArtworkRecommendation {
  id: string;
  title: string;
  price: number;
  image_path: string | null;
  slug: string | null;
  artist_name: string | null;
  status: "available" | "sold" | "reserved";
}

/**
 * Hook to fetch "More from this Artist" artworks.
 * Excludes the current artwork, prioritizes available ones, and limits to 4.
 */
export const useMoreFromArtist = (artistId: string | null, currentArtworkId: string) => {
  return useQuery({
    queryKey: ["more-from-artist", artistId, currentArtworkId],
    queryFn: async () => {
      if (!artistId) return [];

      const { data, error } = await supabase
        .from("artworks")
        .select(`
          id,
          title,
          price,
          image_path,
          slug,
          status,
          artist:profiles!artworks_artist_id_fkey(full_name)
        `)
        .eq("artist_id", artistId)
        .neq("id", currentArtworkId)
        .order("status", { ascending: true }) // available first
        .order("created_at", { ascending: false }) // then newest
        .limit(4);

      if (error) {
        console.error("Error fetching more from artist:", error);
        throw error;
      }

      return (data || []).map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image_path: artwork.image_path,
        slug: artwork.slug,
        status: artwork.status as "available" | "sold" | "reserved",
        artist_name: Array.isArray(artwork.artist) 
          ? artwork.artist[0]?.full_name 
          : artwork.artist?.full_name || null,
      })) as ArtworkRecommendation[];
    },
    enabled: !!artistId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};

/**
 * Hook to fetch "Related Artworks" based on a weighted strategy:
 * Same Artist -> Category -> Price -> Newest
 * We will do a single query filtering by category and exclude current artwork,
 * since we only have `category` in the DB schema for now.
 * We order by artist_id (if possible, or just fetch and sort locally) or rely on category.
 */
export const useRelatedArtworks = (
  currentArtworkId: string,
  categoryId: string | null,
  artistId: string | null
) => {
  return useQuery({
    queryKey: ["related-artworks", categoryId, artistId, currentArtworkId],
    queryFn: async () => {
      if (!categoryId) return [];

      const { data, error } = await supabase
        .from("artworks")
        .select(`
          id,
          title,
          price,
          image_path,
          slug,
          status,
          artist_id,
          artist:profiles!artworks_artist_id_fkey(full_name)
        `)
        .eq("category", categoryId)
        .eq("status", "available")
        .neq("id", currentArtworkId)
        .order("created_at", { ascending: false })
        .limit(10); // Fetch a few extra so we can prioritize locally

      if (error) {
        console.error("Error fetching related artworks:", error);
        throw error;
      }

      if (!data) return [];

      // Sort locally for weighted recommendation:
      // Priority 1: Same artist (if any exist in this pool)
      // Priority 2: Newest (already sorted by created_at)
      const sortedData = data.sort((a, b) => {
        const aSameArtist = a.artist_id === artistId ? 1 : 0;
        const bSameArtist = b.artist_id === artistId ? 1 : 0;
        return bSameArtist - aSameArtist;
      });

      return sortedData.slice(0, 4).map((artwork) => ({
        id: artwork.id,
        title: artwork.title,
        price: artwork.price,
        image_path: artwork.image_path,
        slug: artwork.slug,
        status: artwork.status as "available" | "sold" | "reserved",
        artist_name: Array.isArray(artwork.artist) 
          ? artwork.artist[0]?.full_name 
          : artwork.artist?.full_name || null,
      })) as ArtworkRecommendation[];
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
