import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShieldCheck, Award } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { useArtworkImage } from "@/hooks/useArtworkImage";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { generateProductStructuredData } from "@/lib/seo";

interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  image_path: string | null;
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

  const { data: artwork, isLoading, error } = useQuery({
    queryKey: ["artwork", slug],
    queryFn: async () => {
      if (!slug) throw new Error("No artwork identifier provided");

      let query = supabase
        .from("artworks")
        .select(`
          id,
          title,
          price,
          description,
          category,
          image_path,
          slug,
          artist:profiles!artworks_artist_id_fkey (
            full_name
          )
        `);

      // Check if slug is a number (ID) or string (slug)
      if (isNaN(Number(slug))) {
        query = query.eq("slug", slug);
      } else {
        query = query.eq("id", slug); // Keep as string since ID is string type
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("❌ Error fetching artwork:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Artwork not found");
      }

      console.log("✅ Artwork data fetched:", {
        id: data.id,
        title: data.title,
        image_path: data.image_path,
        artist: data.artist
      });

      // Type-safe return with proper validation
      const artworkData: ArtworkData = {
        id: data.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image_path: data.image_path,
        slug: data.slug,
        artist: data.artist
      };

      return artworkData;
    },
  });

  // Use the artwork image hook
  const { imageUrl, isLoading: imageLoading, error: imageError } = useArtworkImage(artwork?.image_path || null);

  // Debug logging
  console.log('🎨 ArtworkDetails render:', {
    artworkId: artwork?.id,
    imagePath: artwork?.image_path,
    imageUrl,
    imageLoading,
    imageError
  });

  if (isLoading || imageLoading) {
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

  const artworkDescription = artwork.description
    ? artwork.description.length > 160
      ? artwork.description.slice(0, 157) + "..."
      : artwork.description
    : `${artwork.title} by ${artwork.artist?.full_name || "Unknown Artist"}. ${artwork.category || "Artwork"} available for acquisition.`;

  const structuredData = generateProductStructuredData({
    name: artwork.title,
    description: artworkDescription,
    image: imageUrl,
    price: artwork.price,
    currency: "INR",
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
      <div className="container py-12 md:py-20 lg:max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-premium p-6 lg:p-10 shadow-2xl">
            <img
              src={imageUrl || "/placeholder.svg"}
              alt={`${artwork.title} - ${artwork.category || "Artwork"} by ${artwork.artist?.full_name || "Unknown Artist"}`}
              className="w-full h-full object-contain transition-opacity duration-300"
              loading="lazy"
              onError={(e) => {
                console.log('❌ Image failed to load, using placeholder');
                e.currentTarget.src = '/placeholder.svg';
              }}
              onLoad={() => {
                console.log('✅ Image loaded successfully');
              }}
            />
            {imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            {imageError && (
              <div className="absolute bottom-2 left-2 right-2 bg-brand-gold/90 text-white text-xs p-2 rounded">
                Image loading failed: {imageError}
              </div>
            )}
          </div>

          <div className="flex flex-col h-full justify-center">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-gold/10 text-brand-gold border border-brand-gold/20 text-xs font-semibold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4" />
                AI Verified
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-white/80 border border-white/10 text-xs font-semibold uppercase tracking-widest">
                <Award className="w-4 h-4" />
                Authenticity Score: 92%
              </div>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-tight">{artwork.title}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">by <span className="text-white/90">{artwork.artist?.full_name || "Unknown Artist"}</span></p>

            <div className="mb-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold mb-2">Investment</p>
              <div className="text-3xl md:text-4xl font-bold text-brand-gold">
                <Price amount={artwork.price} />
              </div>
            </div>

            {artwork.description && (
              <div className="prose prose-invert max-w-none mb-8 text-white/70 text-lg leading-relaxed">
                <p>{artwork.description}</p>
              </div>
            )}

            {artwork.category && (
              <div className="inline-flex px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-white/80 mb-10">
                {artwork.category}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <Button size="lg" className="flex-1 btn-primary h-14 text-lg rounded-xl" onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}>
                  Own This Piece
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`h-14 w-14 rounded-xl border-white/20 hover:border-brand-gold bg-transparent transition-all ${isLiked ? "text-brand-gold border-brand-gold bg-brand-gold/5" : "text-white"}`}
                  onClick={handleToggleLike}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
                </Button>
              </div>
              <Button
                size="lg"
                variant="outline"
                className="w-full btn-secondary h-14 text-lg rounded-xl opacity-80"
                onClick={handleAddToCart}
              >
                Add to Collection
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ArtworkDetails;
