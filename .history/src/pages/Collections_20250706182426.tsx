import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkCard from "@/components/shared/ArtworkCard";
import SectionTitle from "@/components/shared/SectionTitle";
import Pagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";

const Collections = () => {
  const {
    page,
    totalPages,
    totalItems,
    setTotalItems,
    isLoading,
    setIsLoading,
    goToPage,
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
        const groupedByCategory = (data || []).reduce((acc: Record<string, typeof data>, artwork) => {
          const category = artwork.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(artwork);
          return acc;
        }, {} as Record<string, typeof data>);

        if (count) {
          setTotalItems(count);
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
          <div className="space-y-12">
            {Object.entries(collections).map(([category, artworks]) => (
              <div key={category} className="space-y-6">
                <h2 className="text-2xl font-semibold capitalize">{category}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {artworks.map((artwork) => (
                    <ArtworkCard key={artwork.id} artwork={{
                      id: artwork.id.toString(),
                      title: artwork.title,
                      artist: artwork.artist_id || "Unknown Artist",
                      price: artwork.price,
                      image: artwork.image_path || "/placeholder.svg",
                      category: artwork.category || "Uncategorized"
                    }} />
                  ))}
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={goToPage}
              />
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Collections;
