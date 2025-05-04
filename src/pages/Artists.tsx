
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import ArtistCard from "@/components/ArtistCard";
import SectionTitle from "@/components/shared/SectionTitle";
import LoadMoreButton from "@/components/shared/LoadMoreButton";
import { usePagination } from "@/hooks/usePagination";

const Artists = () => {
  const {
    page,
    hasMore,
    setHasMore,
    isLoading,
    setIsLoading,
    loadMore,
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
          .select("*", { count: "exact" })
          .range(from, to);

        if (error) throw error;
        
        // Update hasMore based on count
        if (count) {
          setHasMore((from + limit) < count);
        }
        
        return data || [];
      } finally {
        setIsLoading(false);
      }
    }
  });

  return (
    <MainLayout>
      <div className="container py-12">
        <SectionTitle
          title="Our Artists"
          subtitle="Meet the talented creators behind our exceptional artworks"
        />
        {initialLoading ? (
          <div>Loading artists...</div>
        ) : !artists?.length ? (
          <div className="text-center text-gray-500">No artists available</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
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

export default Artists;
