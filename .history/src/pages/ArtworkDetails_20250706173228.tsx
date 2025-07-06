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

// Type for the artwork data with the current schema
interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  image_path?: string | null; // New column name (when available)
  "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"?: string | null; // Current column name
  slug: string | null;
  artist: {
    full_name: string | null;
  } | null;
  image_url?: string | null; // Generated signed URL
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

      try {
        // Try to fetch by slug first
        const { data: slugData, error: slugError } = await supabase
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
          .eq("slug", slug)
          .maybeSingle();
        
        if (slugError) {
          console.error("Error fetching artwork by slug:", slugError);
          throw slugError;
        }
        
        // If found by slug, return it
        if (slugData) return slugData as ArtworkData;
        
        // If not found by slug, try by id (for backward compatibility)
        const artworkId = Number(slug);
        if (isNaN(artworkId)) {
          throw new Error("Invalid artwork identifier");
        }

        const { data, error } = await supabase
          .from("artworks")
          .select(`
            id,
            title,
            price,
            description,
            category,
            image_path,
            "https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign",
            slug,
            artist:profiles!artworks_artist_id_fkey (
              full_name
            )
          `)
          .eq("id", artworkId.toString())
          .maybeSingle();

        if (error) {
          console.error("Error fetching artwork by ID:", error);
          throw error;
        }

        if (!data) {
          throw new Error("Artwork not found");
        }

        return data as ArtworkData;
      } catch (err) {
        console.error("Error in artwork details query:", err);
        throw err;
      }
    },
  });

  // Generate signed URL for the image when artwork data is loaded
  useEffect(() => {
    const generateSignedUrl = async () => {
      // Get the image path from the artwork data
      const imagePath = artwork?.["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"];
      
      if (!imagePath) {
        setSignedImageUrl(null);
        return;
      }

      try {
        const { data, error } = await supabase.storage
          .from("artworks")
          .createSignedUrl(imagePath, 3600); // 1 hour expiry

        if (error) {
          console.error("Error generating signed URL:", error);
          setSignedImageUrl(null);
        } else {
          setSignedImageUrl(data.signedUrl);
        }
      } catch (err) {
        console.error("Error in signed URL generation:", err);
        setSignedImageUrl(null);
      }
    };

    generateSignedUrl();
  }, [artwork?.["https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/sign"]]);

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
    try {
      await addToCart(artwork.id);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleToggleLike = async () => {
    try {
      await toggleLike(artwork.id);
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Use signed image URL or fallback to placeholder
  const imageUrl = signedImageUrl || "/placeholder.svg";

  // Create a cleaner description for SEO
  const artworkDescription = artwork.description 
    ? (artwork.description.length > 160 ? artwork.description.substring(0, 157) + '...' : artwork.description)
    : `${artwork.title} by ${artwork.artist?.full_name || 'Unknown Artist'}. ${artwork.category || 'Artwork'} for sale.`;

  const structuredData = generateProductStructuredData({
    name: artwork.title,
    description: artworkDescription,
    image: imageUrl,
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
        ogImage={imageUrl}
        type="product"
        structuredData={structuredData}
      />
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Artwork Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
            <img
              src={imageUrl}
              alt={`${artwork.title} - ${artwork.category || 'Artwork'} by ${artwork.artist?.full_name || 'Unknown Artist'}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Artwork Details */}
          <div>
            <div>
              <h1 className="text-3xl font-serif mb-2">{artwork.title}</h1>
              <p className="text-lg text-muted-foreground">
                by {artwork.artist?.full_name || "Unknown Artist"}
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
                  navigate('/checkout');
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
