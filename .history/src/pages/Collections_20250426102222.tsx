
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkCard from "@/components/shared/ArtworkCard";
import SectionTitle from "@/components/shared/SectionTitle";
import LoadMoreButton from "@/components/shared/LoadMoreButton";
import { usePagination } from "@/hooks/usePagination";

const Collections = () => {
  const {
    page,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    loadMore,
    calculateRange,
    limit
  } = usePagination({ initialLimit: 8 });

  const { data: collections = {}, isLoading: initialLoading } = useQuery({
    queryKey: ["collections", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);
      
      try {
        const { data, error, count } = await supabase
          .from("artworks")
          .select("*", { count: "exact" })
          .not("category", "eq", "Uncategorized")
          .range(from, to);
        
        if (error) throw error;
        
        // Group by category
        const groupedByCategory = (data || []).reduce((acc: Record<string, any[]>, artwork) => {
          const category = artwork.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(artwork);
          return acc;
        }, {});

        // Update hasMore based on count
        if (count) {
          setHasMore((from + limit) < count);
        }
        
        return groupedByCategory;
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <MainLayout>
      <div className="container py-12">
        <SectionTitle
          title="Collections"
          subtitle="Explore our curated collections of artworks"
        />
        {initialLoading ? (
          <div>Loading collections...</div>
        ) : Object.entries(collections).length === 0 ? (
          <div className="text-center text-gray-500">No collections available</div>
        ) : (
          <>
            {Object.entries(collections).map(([category, artworks]) => (
              <div key={category} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={{
                      id: Number(artwork.id),
                      title: artwork.title,
                      artist: artwork.artist_id || "Unknown Artist",
                      price: artwork.price,
                      image: artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg",
                      category: artwork.category || "Uncategorized"
                    }} />
                  ))}
                </div>
              </div>
            ))}
            <LoadMoreButton
              onClick={loadMore}
              isLoading={isLoading}
              hasMore={hasMore}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Collections;
