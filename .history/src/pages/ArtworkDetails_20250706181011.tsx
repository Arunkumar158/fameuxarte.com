import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { generateProductStructuredData } from "@/lib/seo";

interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign": string | null;
  slug: string | null;
  artist: {
    full_name: string | null;
  } | null;
}

const ArtworkDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isItemLiked, toggleLike } = useLikedItems();
  const [signedImageUrl, setSignedImageUrl] = useState<string | null>(null);

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ["artwork", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No artwork identifier provided");

      const query = supabase
        .from("artworks")
        .select(`
          id,
          title,
          price,
          description,
          category,
          "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign",
          slug,
          artist:profiles!artworks_artist_id_fkey (
            full_name
          )
        `)
        .maybeSingle();

      // Check if slug is a number (ID) or string (slug)
      if (isNaN(Number(slug))) {
        query.eq("slug", slug);
      } else {
        query.eq("id", Number(slug));
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching artwork:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Artwork not found");
      }

      return data as ArtworkData;
    },
  });

  // Generate signed URL for the image when artwork data is loaded
  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!artwork?.image_path) {
        setSignedImageUrl(null);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from("artworks")
          .createSignedUrl(artwork.image_path, 3600); // 1 hour expiry

        if (error) {
          console.error("Error generating signed URL:", error);
          setSignedImageUrl(null);
        } else {
          setSignedImageUrl(data?.signedUrl || null);
        }
      } catch (err) {
        console.error("Error in signed URL generation:", err);
        setSignedImageUrl(null);
      }
    };

    fetchSignedUrl();
  }, [artwork?.image_path]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 animate-pulse">Loading artwork details...</div>
      </MainLayout>
    );
  }

  if (error || !artwork) {
    return (
      <MainLayout>
        <div className="container py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Artwork Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The artwork you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/artworks")}>Browse Other Artworks</Button>
        </div>
      </MainLayout>
    );
  }

  const isLiked = isItemLiked(artwork.id);
  const imageUrl = signedImageUrl || "/placeholder.svg";

  const artworkDescription = artwork.description
    ? artwork.description.length > 160
      ? artwork.description.slice(0, 157) + "..."
      : artwork.description
    : `${artwork.title} by ${artwork.artist?.full_name || "Unknown Artist"}. ${artwork.category || "Artwork"} for sale.`;

  const structuredData = generateProductStructuredData({
    name: artwork.title,
    description: artworkDescription,
    image: imageUrl,
    price: artwork.price,
    currency: "USD",
    availability: "InStock",
    sku: artwork.id,
  });

  const handleAddToCart = () => addToCart(artwork.id).catch(console.error);
  const handleToggleLike = () => toggleLike(artwork.id).catch(console.error);

  return (
    <MainLayout>
      <SEO
        title={`${artwork.title} | ${artwork.artist?.full_name || "Unknown Artist"} | Fameuxarte`}
        description={artworkDescription}
        canonicalUrl={`/artworks/${artwork.slug || artwork.id}`}
        ogImage={imageUrl}
        type="product"
        structuredData={structuredData}
      />
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={`${artwork.title} - ${artwork.category || "Artwork"} by ${artwork.artist?.full_name || "Unknown Artist"}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          <div>
            <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
            <p className="text-lg text-muted-foreground">by {artwork.artist?.full_name || "Unknown Artist"}</p>

            <div className="text-2xl font-semibold my-2">
              <Price amount={artwork.price} />
            </div>

            {artwork.description && (
              <div className="prose max-w-none mb-4">
                <p>{artwork.description}</p>
              </div>
            )}

            {artwork.category && (
              <div className="inline-block px-3 py-1 bg-muted rounded-full text-sm">
                {artwork.category}
              </div>
            )}

            <div className="flex flex-col gap-4 mt-6">
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
                  navigate("/checkout");
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArtworkDetails;
