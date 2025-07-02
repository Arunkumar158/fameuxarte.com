
import { useLikedItems } from "@/hooks/useLikedItems";
import MainLayout from "@/components/layouts/MainLayout";
import ArtworkCard from "@/components/shared/ArtworkCard";
import SectionTitle from "@/components/shared/SectionTitle";
import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LikedItems = () => {
  const { likedItems, isLoading } = useLikedItems();
  const { user } = useAuth();

  // Redirect to auth page if user is not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <MainLayout>
      <div className="container py-12">
        <SectionTitle
          title="Liked Items"
          subtitle="Your favorite artworks collection"
        />
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-pulse">Loading liked items...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {likedItems && likedItems.length > 0 ? (
              likedItems.map((item) => (
                <ArtworkCard
                  key={item.artworks?.id}
                  artwork={{
                    id: item.artwork_id,
                    title: item.artworks?.title || "Unknown Title",
                    artist: item.artworks?.artist_id || "Unknown Artist",
                    price: item.artworks?.price || 0,
                    image: item.artworks?.["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg",
                    category: item.artworks?.category || "Uncategorized"
                  }}
                />
              ))
            ) : (
              <div className="col-span-3 text-center py-10">
                <p className="text-muted-foreground mb-6">You haven't liked any artworks yet.</p>
                <Button asChild>
                  <Link to="/artworks">Browse Artworks</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LikedItems;
