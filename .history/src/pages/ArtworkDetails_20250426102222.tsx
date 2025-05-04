import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { supabase } from "@/integrations/supabase/client";

const ArtworkDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isItemLiked, toggleLike } = useLikedItems();

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ["artwork", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          artist:artist_id (
            specialty,
            bio
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Artwork not found");
      return data;
    },
  });

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="animate-pulse">Loading artwork details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !artwork) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The artwork you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/artworks")}>
              Browse Other Artworks
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isLiked = isItemLiked(artwork.id);

  const handleAddToCart = async () => {
    await addToCart(artwork.id);
  };

  const handleToggleLike = async () => {
    await toggleLike(artwork.id);
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artwork Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg"}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
              <p className="text-lg text-muted-foreground">
                {artwork.artist?.specialty || "Unknown Artist"}
              </p>
            </div>

            <div className="text-2xl font-semibold">
              <Price amount={artwork.price} />
            </div>

            {artwork.description && (
              <div className="prose max-w-none">
                <p>{artwork.description}</p>
              </div>
            )}

            {artwork.category && (
              <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm">
                {artwork.category}
              </div>
            )}

            <div className="flex gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={isLiked ? "text-red-500" : ""}
                onClick={handleToggleLike}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
            </div>

            {artwork.artist?.bio && (
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-3">About the Artist</h2>
                <p className="text-muted-foreground">{artwork.artist.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArtworkDetails;
