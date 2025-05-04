import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import ArtworkCard from "./shared/ArtworkCard";
// import LoadMoreButton from "./shared/LoadMoreButton";
// import { usePagination } from "@/hooks/usePagination";

export const useArtworks = () => {
  const { data: artworks, isLoading: initialLoading } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("artworks")
          .select(`
            id,
            title,
            price,
            category,
            description,
            "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign",
            artist:profiles!artworks_artist_id_fkey (
              id,
              full_name
            )
          `)
          .not("category", "eq", "Uncategorized")
          .order("created_at", { ascending: false })
          .limit(6);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching artworks:", error);
        return [];
      }
    }
  });

  return {
    artworks,
    isLoading: initialLoading
  };
};

const ArtworkGrid = () => {
  const { artworks, isLoading } = useArtworks();
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => (
        <ArtworkCard 
          key={artwork.id} 
          artwork={{
            id: artwork.id,
            title: artwork.title,
            artist: artwork.artist?.full_name || "Unknown Artist",
            price: artwork.price,
            image: artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg",
            category: artwork.category || "Uncategorized"
          }} 
        />
      ))}
    </div>
  );
};

export default ArtworkGrid;
