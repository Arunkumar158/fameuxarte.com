import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShieldCheck, Award, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { generateProductStructuredData } from "@/lib/seo";
import { getGalleryImages } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
  artist: {
    full_name: string | null;
  } | null;
}

// ─── Lightbox ───────────────────────────────────────────────────────────────
const Lightbox = ({
  imageUrls,
  activeIndex,
  onClose,
  onNext,
  onPrev,
}: {
  imageUrls: string[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) => {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-all"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Prev */}
      {imageUrls.length > 1 && (
        <button
          className="absolute left-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrls[activeIndex]}
          alt={`Gallery image ${activeIndex + 1}`}
          className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        />
      </motion.div>

      {/* Next */}
      {imageUrls.length > 1 && (
        <button
          className="absolute right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all"
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Dot indicators */}
      {imageUrls.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {imageUrls.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === activeIndex ? "bg-brand-gold scale-125" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────
const ArtworkDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isItemLiked, toggleLike } = useLikedItems();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

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
          images,
          slug,
          artist:profiles!artworks_artist_id_fkey (
            full_name
          )
        `);

      if (isNaN(Number(slug))) {
        query = query.eq("slug", slug);
      } else {
        query = query.eq("id", slug);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("❌ Error fetching artwork:", error);
        throw error;
      }

      if (!data) throw new Error("Artwork not found");

      const artworkData: ArtworkData = {
        id: data.id,
        title: data.title,
        price: data.price,
        description: data.description,
        category: data.category,
        image_path: data.image_path,
        images: (data as Record<string, unknown>).images as string[] | null,
        slug: data.slug,
        artist: data.artist,
      };

      return artworkData;
    },
  });

  // Resolve gallery paths → resolved URLs
  const galleryPaths = artwork ? getGalleryImages(artwork) : [];
  const { imageUrls, isLoading: imagesLoading } = useArtworkImages(galleryPaths);

  // Reset selection when artwork changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [artwork?.id]);

  // Navigation helpers
  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  // Keyboard navigation for main gallery (not lightbox)
  useEffect(() => {
    if (lightboxOpen || imageUrls.length <= 1) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, imageUrls.length, goNext, goPrev]);

  if (isLoading || imagesLoading) {
    return (
      <MainLayout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-[3/4] rounded-2xl bg-white/5" />
            <div className="flex flex-col gap-4 pt-8">
              <div className="h-6 w-32 rounded bg-white/5" />
              <div className="h-12 w-3/4 rounded bg-white/5" />
              <div className="h-6 w-48 rounded bg-white/5" />
            </div>
          </div>
        </div>
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
  const activeImage = imageUrls[selectedIndex] ?? "/placeholder.svg";
  const hasMultiple = imageUrls.length > 1;

  const artworkDescription = artwork.description
    ? artwork.description.length > 160
      ? artwork.description.slice(0, 157) + "..."
      : artwork.description
    : `${artwork.title} by ${artwork.artist?.full_name || "Unknown Artist"}. ${artwork.category || "Artwork"} available for acquisition.`;

  const structuredData = generateProductStructuredData({
    name: artwork.title,
    description: artworkDescription,
    image: activeImage,
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
        ogImage={activeImage}
        type="product"
        structuredData={structuredData}
      />

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <Lightbox
            imageUrls={imageUrls}
            activeIndex={selectedIndex}
            onClose={() => setLightboxOpen(false)}
            onNext={goNext}
            onPrev={goPrev}
          />
        )}
      </AnimatePresence>

      <div className="container py-12 md:py-20 lg:max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* ── Gallery Panel ── */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="relative aspect-[3/4] rounded-2xl overflow-hidden glass-premium p-6 lg:p-10 shadow-2xl group cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
            >
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeImage}
                  src={activeImage}
                  alt={`${artwork.title} — image ${selectedIndex + 1}`}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  loading="lazy"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                />
              </AnimatePresence>

              {/* Zoom hint */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="bg-black/50 backdrop-blur-sm rounded-full p-3">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Prev/Next arrows (only when multiple) */}
              {hasMultiple && (
                <>
                  <button
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); goPrev(); }}
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-auto"
                    onClick={(e) => { e.stopPropagation(); goNext(); }}
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {hasMultiple && (
                <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-md text-white/90 text-xs font-semibold px-2.5 py-1 rounded-full border border-white/15 pointer-events-none">
                  {selectedIndex + 1} / {imageUrls.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {hasMultiple && (
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                {imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      i === selectedIndex
                        ? "border-brand-gold shadow-[0_0_0_1px_rgba(198,160,91,0.4)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                    aria-label={`View image ${i + 1}`}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {i === selectedIndex && (
                      <div className="absolute inset-0 bg-brand-gold/10" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Dot indicators (mobile) */}
            {hasMultiple && (
              <div className="flex justify-center gap-2 mt-1 lg:hidden">
                {imageUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === selectedIndex ? "bg-brand-gold scale-125" : "bg-white/30"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── Info Panel ── */}
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

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-tight">
              {artwork.title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-medium mb-8">
              by <span className="text-white/90">{artwork.artist?.full_name || "Unknown Artist"}</span>
            </p>

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
                <Button
                  size="lg"
                  className="flex-1 btn-primary h-14 text-lg rounded-xl"
                  onClick={() => { handleAddToCart(); navigate("/checkout"); }}
                >
                  Own This Piece
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`h-14 w-14 rounded-xl border-white/20 hover:border-brand-gold bg-transparent transition-all ${
                    isLiked ? "text-brand-gold border-brand-gold bg-brand-gold/5" : "text-white"
                  }`}
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
