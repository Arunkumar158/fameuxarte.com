import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ArtworkCard from "./shared/ArtworkCard";
import Pagination from "./shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useArtworkImage } from "@/hooks/useArtworkImage";

interface ArtworkGridProps {
  limit?: number;
}

// Component to handle individual artwork with proper image loading
const ArtworkCardWithImage = ({ artwork }: { artwork: {
  id: string;
  title: string;
  price: number;
  category: string | null;
  description: string | null;
  image_path: string | null;
  slug: string | null;
  artist: {
    full_name: string | null;
  } | null;
} }) => {
  const { imageUrl } = useArtworkImage(artwork.image_path);
  
  return (
    <ArtworkCard 
      key={artwork.id} 
      artwork={{
        id: artwork.id,
        slug: artwork.slug,
        title: artwork.title,
        artist: artwork.artist?.full_name || "Unknown Artist",
        price: artwork.price,
        image: imageUrl,
        category: artwork.category || "Uncategorized"
      }} 
    />
  );
};

export const useArtworks = (limit?: number) => {
  const {
    page,
    totalPages,
    totalItems,
    setTotalItems,
    isLoading,
    setIsLoading,
    goToPage,
    calculateRange,
    limit: paginationLimit
  } = usePagination({ initialLimit: limit || 9 });

  const { data: artworks, isLoading: initialLoading } = useQuery({
    queryKey: ["artworks", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);
      
      try {
        const { data, error, count } = await supabase
          .from("artworks")
          .select(`
            id,
            title,
            price,
            category,
            description,
            image_path,
            slug,
            artist:profiles!artworks_artist_id_fkey (
              id,
              full_name
            )
          `, { count: "exact" })
          .not("category", "eq", "Uncategorized")
          .order("created_at", { ascending: false })
          .range(from, to);
        
        if (error) throw error;
        
        if (count) {
          setTotalItems(count);
        }
        
        return data || [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  return {
    artworks,
    isLoading: initialLoading,
    isLoadingMore: isLoading,
    page,
    totalPages,
    goToPage
  };
};

const ArtworkGrid = ({ limit }: ArtworkGridProps) => {
  const { artworks, isLoading, isLoadingMore, page, totalPages, goToPage } = useArtworks(limit);
  const { toast } = useToast();

  useEffect(() => {
    const channel = supabase
      .channel('artwork-changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'artworks' },
        (payload) => {
          toast({
            title: "New Artwork Added",
            description: "A new artwork has been added to the gallery.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  if (isLoading) return <div>Loading artworks...</div>;

  if (!artworks?.length) {
    return <div className="text-center text-gray-500">No artworks available</div>;
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCardWithImage key={artwork.id} artwork={artwork} />
        ))}
      </div>
      {!limit && totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
};

export default ArtworkGrid;
