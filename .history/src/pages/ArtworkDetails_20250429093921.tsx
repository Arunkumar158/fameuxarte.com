import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { generateProductStructuredData } from "@/lib/seo";

const ArtworkDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isItemLiked, toggleLike } = useLikedItems();

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ["artwork", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No artwork identifier provided");

      // Try to fetch by slug first
      const { data: slugData, error: slugError } = await supabase
        .from("artworks")
        .select(`
          *,
          artist:profiles!artworks_artist_id_fkey (
            id,
            full_name,
            bio,
            specialty
          )
        `)
        .eq("slug", slug)
        .maybeSingle();
      
      if (slugError) throw slugError;
      
      // If found by slug, return it
      if (slugData) return slugData;
      
      // If not found by slug, try by id (for backward compatibility)
      const { data, error } = await supabase
        .from("artworks")
        .select(`
          *,
          artist:profiles!artworks_artist_id_fkey (
            id,
            full_name,
            bio,
            specialty
          )
        `)
        .eq("id", slug)
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

  // Create a cleaner description for SEO
  const artworkDescription = artwork.description 
    ? (artwork.description.length > 160 ? artwork.description.substring(0, 157) + '...' : artwork.description)
    : `${artwork.title} by ${artwork.artist?.full_name || 'Unknown Artist'}. ${artwork.category || 'Artwork'} for sale.`;

  const structuredData = generateProductStructuredData({
    name: artwork.title,
    description: artworkDescription,
    image: artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg",
    price: artwork.price,
    currency: "USD",
    availability: "InStock",
    sku: artwork.id,
  });

  return (
    <MainLayout>
      <SEO
        title={`${artwork.title} | ${artwork.artist?.full_name || 'Unknown Artist'} | Fameuxarte`}
        description={artworkDescription}
        canonicalUrl={`/artworks/${artwork.slug || artwork.id}`}
        ogImage={artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"]}
        type="product"
        structuredData={structuredData}
      />
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artwork Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={artwork["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"] || "/placeholder.svg"}
              alt={`${artwork.title} - ${artwork.category || 'Artwork'} by ${artwork.artist?.full_name || 'Unknown Artist'}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Artwork Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
              <p className="text-lg text-muted-foreground">
                by {artwork.artist?.full_name || artwork.artist?.specialty || "Unknown Artist"}
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

            <div className="flex flex-col gap-4">
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
              <Button 
                size="lg" 
                variant="secondary" 
                className="w-full"
                onClick={() => {
                  handleAddToCart();
                  navigate('/checkout');
                }}
              >
                Buy Now
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
