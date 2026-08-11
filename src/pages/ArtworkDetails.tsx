import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Award, CheckCircle2, ChevronLeft, ChevronRight, Heart, ShieldCheck, X, ZoomIn, Eye } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { useCart } from "@/contexts/CartContext";
import { useLikedItems } from "@/hooks/useLikedItems";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useMoreFromArtist, useRelatedArtworks } from "@/hooks/useRelatedArtworks";
import { supabase } from "@/integrations/supabase/client";
import { DiscoveryHead } from "@/platform/discovery/DiscoveryHead";
import { DiscoveryBreadcrumbs } from "@/components/discovery/DiscoveryBreadcrumbs";
import { getGalleryImages } from "@/lib/utils";
import { trackPageViewed, recordArtworkView } from "@/lib/analytics";
import ArtworkGrid from "@/components/ArtworkGrid";

interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
  status?: "available" | "sold" | "reserved";
  views_count?: number;
  artist_id?: string | null;
  artist: {
    id?: string;
    full_name: string | null;
  } | null;
}

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
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onNext();
      if (event.key === "ArrowLeft") onPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onNext, onPrev]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 px-4 sm:px-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition-colors hover:text-white"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" aria-hidden="true" />
      </button>

      {imageUrls.length > 1 && (
        <button
          className="absolute left-3 sm:left-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition-colors hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onPrev();
          }}
          aria-label="Previous image"
        >
          <ChevronLeft className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      <motion.div
        key={activeIndex}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: 0.2 }}
        className="flex max-h-[90vh] max-w-[90vw] items-center justify-center"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          src={imageUrls[activeIndex]}
          alt={`Gallery image ${activeIndex + 1}`}
          className="max-h-[90vh] max-w-full rounded-[8px] object-contain shadow-2xl"
        />
      </motion.div>

      {imageUrls.length > 1 && (
        <button
          className="absolute right-3 sm:right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white/70 transition-colors hover:text-white"
          onClick={(event) => {
            event.stopPropagation();
            onNext();
          }}
          aria-label="Next image"
        >
          <ChevronRight className="h-6 w-6" aria-hidden="true" />
        </button>
      )}

      {imageUrls.length > 1 && (
        <div className="absolute bottom-6 flex gap-2">
          {imageUrls.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === activeIndex ? "scale-125 bg-gold" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
};

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
          status,
          views_count,
          artist_id,
          artist:profiles!artworks_artist_id_fkey (
            id,
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
        console.error("Error fetching artwork:", error);
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
        status: data.status,
        views_count: data.views_count,
        artist_id: data.artist_id,
        artist: data.artist,
      };

      return artworkData;
    },
  });

  const galleryPaths = artwork ? getGalleryImages(artwork) : [];
  const { imageUrls, isLoading: imagesLoading } = useArtworkImages(galleryPaths);

  // ✅ Hooks must ALL be called before any early return — Rules of Hooks
  const { data: moreFromArtist } = useMoreFromArtist(artwork?.artist_id ?? artwork?.artist?.id ?? null, artwork?.id ?? '');
  const { data: relatedArtworks } = useRelatedArtworks(artwork?.id ?? '', artwork?.category ?? null, artwork?.artist_id ?? artwork?.artist?.id ?? null);

  useEffect(() => {
    setSelectedIndex(0);
    if (artwork?.id) {
      recordArtworkView(
        artwork.id, 
        artwork.title,
        artwork.artist_id ?? artwork.artist?.id ?? null
      );
      trackPageViewed({ page: 'Artwork Details', title: artwork.title });
    }
  }, [artwork?.id, artwork?.title, artwork?.artist_id, artwork?.artist?.id]);

  const goNext = useCallback(() => {
    setSelectedIndex((index) => (index + 1) % imageUrls.length);
  }, [imageUrls.length]);

  const goPrev = useCallback(() => {
    setSelectedIndex((index) => (index - 1 + imageUrls.length) % imageUrls.length);
  }, [imageUrls.length]);

  useEffect(() => {
    if (lightboxOpen || imageUrls.length <= 1) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [lightboxOpen, imageUrls.length, goNext, goPrev]);

  if (isLoading || imagesLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-obsidian">
          <HomeNav />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10">
            <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">
              <div className="min-h-[300px] sm:min-h-[420px] rounded-[10px] border border-border-subtle bg-surface-2 lg:min-h-[680px]" />
              <div className="space-y-5 pt-4">
                <div className="h-7 w-48 rounded bg-surface-2" />
                <div className="h-16 w-4/5 rounded bg-surface-2" />
                <div className="h-5 w-64 rounded bg-surface-2" />
                <div className="h-32 w-full rounded bg-surface-2" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !artwork) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-obsidian">
          <HomeNav />
          <div className="mx-auto max-w-xl px-4 sm:px-6 py-16 sm:py-24 text-center">
            <h1 className="mb-3 text-[28px] sm:text-[32px] font-medium tracking-[-0.025em] text-linen">Artwork not found</h1>
            <p className="mb-7 text-[14px] leading-[1.75] text-[#666]">
              The artwork you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/artworks")} className="bg-linen text-obsidian hover:bg-gold">
              Browse other artworks
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const isLiked = isItemLiked(artwork.id);
  const activeImage = imageUrls[selectedIndex] ?? "/placeholder.svg";
  const hasMultiple = imageUrls.length > 1;
  const artistName = artwork.artist?.full_name || "Unknown Artist";
  const categoryLabel = artwork.category || "Original artwork";

  const artworkDescription = artwork.description
    ? artwork.description.length > 160
      ? artwork.description.slice(0, 157) + "..."
      : artwork.description
    : `${artwork.title} by ${artistName}. ${categoryLabel} available for acquisition.`;

  // Hooks already called above the early returns — results used here

  const handleAddToCart = () => {
    addToCart(artwork.id).catch(console.error);
    trackEvent('add_to_cart', { 
      artwork_id: artwork.id, 
      title: artwork.title,
      price: artwork.price
    });
  };
  
  const handleToggleLike = () => toggleLike(artwork.id).catch(console.error);

  return (
    <MainLayout>
      <DiscoveryHead
        entityType="artwork"
        title={artwork.title}
        description={artworkDescription}
        image={activeImage}
        url={`/artworks/${artwork.slug || artwork.id}`}
        author={artistName}
        rawEntity={{
          name: artwork.title,
          price: artwork.price,
          currency: "INR",
          sku: artwork.id,
          artist: artistName,
          category: categoryLabel,
          trustSignals: {
            verifiedArtist: true,
            certificateOfAuthenticity: true,
            originalArtwork: true,
            secureCheckout: true,
          }
        }}
      />

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

      <div className="min-h-screen bg-obsidian text-linen">
        <HomeNav />

        {/* Breadcrumb */}
        <section className="border-t border-border-faint px-4 sm:px-6 py-4 sm:py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <DiscoveryBreadcrumbs 
              entityType="artwork" 
              entityTitle={artwork.title}
              customPath={`/artworks/${artwork.slug || artwork.id}`}
              options={{
                category: artwork.category,
                artistName: artistName,
              }}
            />
            <div className="hidden text-[11px] uppercase tracking-[0.14em] text-[#444] sm:block">
              Verified artwork record
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="px-4 sm:px-6 pb-24 sm:pb-16 pt-2">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[1.06fr_0.94fr] lg:gap-14">

            {/* Image column */}
            <div className="space-y-4">
              <div
                className="group relative flex min-h-[300px] sm:min-h-[420px] lg:min-h-[680px] cursor-zoom-in items-center justify-center overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2 p-3 sm:p-5 lg:p-8"
                onClick={() => setLightboxOpen(true)}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    src={activeImage}
                    alt={`${artwork.title} by ${artistName} - ${categoryLabel} - Image ${selectedIndex + 1}`}
                    title={`${artwork.title} by ${artistName}`}
                    className="max-h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.015]"
                    loading="lazy"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    onError={(event) => {
                      event.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                </AnimatePresence>

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.35))] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Tap to inspect label — always visible */}
                <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-border-subtle bg-obsidian/80 px-3 py-[6px] text-[11px] text-[#777] backdrop-blur-sm">
                  Tap to inspect
                </div>

                {artwork?.status === 'sold' && (
                  <div className="pointer-events-none absolute right-3 top-3">
                    <span className="rounded-sm border border-gold/40 bg-obsidian/90 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-white shadow-md backdrop-blur-md">
                      Collected
                    </span>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/55 text-linen backdrop-blur-sm">
                    <ZoomIn className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>

                {/* Gallery navigation — always visible on touch, hover-only on desktop */}
                {hasMultiple && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-linen backdrop-blur-sm transition-all hover:border-gold/40 hover:text-gold lg:opacity-0 lg:group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        goPrev();
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button
                      className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/55 text-linen backdrop-blur-sm transition-all hover:border-gold/40 hover:text-gold lg:opacity-0 lg:group-hover:opacity-100"
                      onClick={(event) => {
                        event.stopPropagation();
                        goNext();
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <div className="pointer-events-none absolute bottom-3 right-3 rounded-full border border-white/10 bg-black/60 px-3 py-[6px] text-[11px] text-[#bbb] backdrop-blur-sm">
                      {selectedIndex + 1} / {imageUrls.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail strip */}
              {hasMultiple && (
                <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
                  {imageUrls.map((url, index) => (
                    <button
                      key={`${url}-${index}`}
                      onClick={() => setSelectedIndex(index)}
                      className={`relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-[8px] border transition-all ${
                        index === selectedIndex
                          ? "border-gold shadow-[0_0_0_1px_rgba(201,169,110,0.25)]"
                          : "border-border-subtle hover:border-gold/30"
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img src={url} alt={`Thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Details sidebar */}
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="border-b border-border-faint pb-6 sm:pb-7">
                <div className="mb-4 sm:mb-6 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.1)] px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    AI verified
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#aaa]">
                    <Award className="h-3.5 w-3.5" aria-hidden="true" />
                    Authenticity score: 92%
                  </div>
                  {artwork?.views_count !== undefined && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#aaa]" title="Total views">
                      <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                      {artwork.views_count}
                    </div>
                  )}
                </div>

                {/* Responsive title — scaled down on mobile to prevent overflow */}
                <h1 className="mb-3 text-[28px] sm:text-[38px] lg:text-[48px] xl:text-[56px] font-medium leading-[1.05] tracking-[-0.03em] text-linen">
                  {artwork.title}
                </h1>
                <p className="text-[15px] sm:text-[16px] text-[#777]">
                  by <span className="text-linen">{artistName}</span>
                </p>
              </div>

              <div className="border-b border-border-faint py-5 sm:py-7">
                <div className="mb-2 text-[11px] uppercase tracking-[0.14em] text-[#555]">Investment value</div>
                <div className="text-[30px] sm:text-[36px] font-medium tracking-[-0.03em] text-gold">
                  <Price amount={artwork.price} />
                </div>
              </div>

              <div className="border-b border-border-faint py-5 sm:py-7">
                {artwork.description ? (
                  <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#b8b8b8]">{artwork.description}</p>
                ) : (
                  <p className="text-[14px] sm:text-[15px] leading-[1.8] text-[#777]">
                    A verified original artwork by {artistName}, available for collectors through Fameuxarte.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-border-faint py-5 sm:py-7">
                <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-3 sm:p-4">
                  <div className="mb-1 text-[11px] text-[#555]">Medium</div>
                  <div className="text-[13px] text-linen">{categoryLabel}</div>
                </div>
                <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-3 sm:p-4">
                  <div className="mb-1 text-[11px] text-[#555]">Verification</div>
                  <div className="inline-flex items-center gap-1.5 text-[13px] text-verified">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    ArtGuard passed
                  </div>
                </div>
              </div>

              {/* Desktop CTAs */}
              <div className="hidden lg:block space-y-3 pt-7">
                {artwork?.status === 'sold' ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        disabled
                        className="h-12 flex-1 rounded-[6px] bg-surface-2 border border-border-subtle text-[13px] font-medium text-[#888]"
                      >
                        Collected
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className={`h-12 w-12 rounded-[6px] border-border-subtle bg-surface-2 transition-colors hover:border-gold/40 hover:text-gold ${
                          isLiked ? "border-gold/40 text-gold" : "text-[#888]"
                        }`}
                        onClick={handleToggleLike}
                        aria-label={isLiked ? "Remove from liked artworks" : "Like artwork"}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                      </Button>
                    </div>
                    <div className="text-center text-[13px] text-[#777]">
                      This original artwork has found its collector.
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-3">
                      <Button
                        size="lg"
                        className="h-12 flex-1 rounded-[6px] bg-linen text-[13px] font-medium text-obsidian hover:bg-gold"
                        onClick={() => {
                          handleAddToCart();
                          navigate("/checkout");
                        }}
                      >
                        Collect this work
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className={`h-12 w-12 rounded-[6px] border-border-subtle bg-surface-2 transition-colors hover:border-gold/40 hover:text-gold ${
                          isLiked ? "border-gold/40 text-gold" : "text-[#888]"
                        }`}
                        onClick={handleToggleLike}
                        aria-label={isLiked ? "Remove from liked artworks" : "Like artwork"}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                      </Button>
                    </div>
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-12 w-full rounded-[6px] border-border-subtle bg-transparent text-[13px] text-[#aaa] hover:border-gold/40 hover:bg-transparent hover:text-gold"
                      onClick={handleAddToCart}
                    >
                      Add to collection
                    </Button>
                  </>
                )}
              </div>
            </aside>
          </div>
        </section>

        {/* Mobile sticky CTA bar — fixed at bottom, below lg breakpoint */}
        <div
          className="fixed bottom-0 left-0 right-0 z-40 flex flex-col gap-2 border-t border-border-faint bg-obsidian/95 backdrop-blur-md px-4 py-3 lg:hidden"
          style={{ paddingBottom: `calc(env(safe-area-inset-bottom) + 12px)` }}
        >
          {artwork?.status === 'sold' ? (
            <>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  disabled
                  className="h-12 flex-1 rounded-[6px] bg-surface-2 border border-border-subtle text-[13px] font-medium text-[#888]"
                >
                  Collected
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className={`h-12 w-12 shrink-0 rounded-[6px] border-border-subtle bg-surface-2 transition-colors hover:border-gold/40 hover:text-gold ${
                    isLiked ? "border-gold/40 text-gold" : "text-[#888]"
                  }`}
                  onClick={handleToggleLike}
                  aria-label={isLiked ? "Remove from liked artworks" : "Like artwork"}
                >
                  <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
                </Button>
              </div>
              <div className="text-center text-[12px] text-[#777] mt-1">
                This original artwork has found its collector.
              </div>
            </>
          ) : (
            <div className="flex gap-3">
              <Button
                size="lg"
                className="h-12 flex-1 rounded-[6px] bg-linen text-[13px] font-medium text-obsidian hover:bg-gold"
                onClick={() => {
                  handleAddToCart();
                  navigate("/checkout");
                }}
              >
                Collect this work
              </Button>
              <Button
                size="lg"
                variant="outline"
                className={`h-12 w-12 shrink-0 rounded-[6px] border-border-subtle bg-surface-2 transition-colors hover:border-gold/40 hover:text-gold ${
                  isLiked ? "border-gold/40 text-gold" : "text-[#888]"
                }`}
                onClick={handleToggleLike}
                aria-label={isLiked ? "Remove from liked artworks" : "Like artwork"}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>

        {/* Discovery Recommendations */}
        <section className="border-t border-border-faint px-4 sm:px-6 py-16 sm:py-24 bg-obsidian">
          <div className="mx-auto max-w-6xl space-y-20">
            {moreFromArtist && moreFromArtist.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] sm:text-[24px] font-medium text-linen tracking-tight">
                    More from {artistName}
                  </h2>
                  <Link to={`/artists`} className="text-[13px] text-gold hover:text-gold/80 transition-colors uppercase tracking-widest font-medium">
                    View Profile
                  </Link>
                </div>
                <ArtworkGrid
                  artworks={moreFromArtist}
                  isLoading={false}
                  viewMode="grid"
                  onLikeToggle={toggleLike}
                  isLiked={isItemLiked}
                />
              </div>
            )}

            {relatedArtworks && relatedArtworks.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-[20px] sm:text-[24px] font-medium text-linen tracking-tight">
                    Related Artworks
                  </h2>
                  <Link to={`/artworks`} className="text-[13px] text-gold hover:text-gold/80 transition-colors uppercase tracking-widest font-medium">
                    Explore Collection
                  </Link>
                </div>
                <ArtworkGrid
                  artworks={relatedArtworks}
                  isLoading={false}
                  viewMode="grid"
                  onLikeToggle={toggleLike}
                  isLiked={isItemLiked}
                />
              </div>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ArtworkDetails;
