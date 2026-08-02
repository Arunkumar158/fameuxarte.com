import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import ArtworkCard from "@/components/shared/ArtworkCard";
import { useArtworkImage } from "@/hooks/useArtworkImage";
import { getGalleryImages } from "@/lib/utils";
import { trackEvent, trackPageViewed } from "@/lib/analytics";
import {
  ArrowLeft,
  ArrowRight,
  GalleryHorizontalEnd,
  Layers3,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

type CategorySummary = {
  category: string;
  count: number;
  coverImage: string | null;
};

type ArtworkRow = {
  id: string;
  title: string;
  price: number;
  category: string | null;
  description: string | null;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
  artist_id: string | null;
  status?: "available" | "sold" | "reserved";
};

// ─── Helper: artwork card with image resolution ───────────────────────────────

const ArtworkCardWithImage = ({ artwork }: { artwork: ArtworkRow }) => {
  const galleryPaths = getGalleryImages(artwork);
  const primaryPath = galleryPaths[0] ?? null;
  const { imageUrl } = useArtworkImage(primaryPath);

  return (
    <ArtworkCard
      artwork={{
        id: artwork.id.toString(),
        slug: artwork.slug,
        title: artwork.title,
        artist: artwork.artist_id || "Unknown Artist",
        price: artwork.price,
        image: imageUrl,
        category: artwork.category || "Uncategorized",
        status: artwork.status,
        imageCount: galleryPaths.length,
      }}
    />
  );
};

// ─── Helper: cover image for a category card ──────────────────────────────────

const CategoryCover = ({ imagePath }: { imagePath: string | null }) => {
  const { imageUrl } = useArtworkImage(imagePath);
  return (
    <img
      src={imageUrl}
      alt=""
      aria-hidden="true"
      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
      loading="lazy"
    />
  );
};

// ─── Collection Card ──────────────────────────────────────────────────────────

type CollectionCardProps = {
  summary: CategorySummary;
  isActive: boolean;
  onClick: () => void;
};

const CollectionCard = ({ summary, isActive, onClick }: CollectionCardProps) => (
  <motion.button
    onClick={onClick}
    whileTap={{ scale: 0.97 }}
    aria-pressed={isActive}
    className={`group relative overflow-hidden rounded-xl border text-left transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
      isActive
        ? "border-gold shadow-[0_0_20px_rgba(212,175,55,0.25)]"
        : "border-white/8 hover:border-gold/40 hover:shadow-[0_0_16px_rgba(212,175,55,0.12)]"
    }`}
  >
    {/* Cover image */}
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-xl bg-surface-3">
      <CategoryCover imagePath={summary.coverImage} />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/30 to-transparent" />

      {/* Artwork count badge */}
      <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur-sm">
        <Layers3 className="h-3 w-3" />
        {summary.count} {summary.count === 1 ? "work" : "works"}
      </div>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gold">
          <ChevronRight className="h-3.5 w-3.5 rotate-90 text-obsidian" />
        </div>
      )}
    </div>

    {/* Card footer */}
    <div className="bg-surface-2 px-4 py-3.5">
      <h2 className="text-[15px] font-semibold capitalize tracking-tight text-linen transition-colors duration-200 group-hover:text-gold line-clamp-1">
        {summary.category}
      </h2>
      <p className="mt-0.5 text-[11px] text-stone">
        {isActive ? "Tap to collapse" : "Tap to explore"}
      </p>
    </div>
  </motion.button>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const Collections = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // ── Phase 1: Fetch distinct categories with counts & cover images ──────────
  const { data: categories = [], isLoading: categoriesLoading } = useQuery<CategorySummary[]>({
    queryKey: ["collection-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("category, image_path, images")
        .not("category", "is", null)
        .neq("category", "Uncategorized");

      if (error) throw error;

      // Group locally to build summary
      const map: Record<string, { count: number; coverImage: string | null }> = {};
      for (const row of data ?? []) {
        const cat = row.category as string;
        if (!map[cat]) {
          const imgs = getGalleryImages({
            images: row.images as string[] | null,
            image_path: row.image_path,
          });
          map[cat] = { count: 0, coverImage: imgs[0] ?? null };
        }
        map[cat].count++;
      }

      return Object.entries(map)
        .map(([category, { count, coverImage }]) => ({ category, count, coverImage }))
        .sort((a, b) => b.count - a.count); // most works first
    },
    staleTime: 1000 * 60 * 5,
  });

  // ── Phase 2: Fetch artworks for selected category ──────────────────────────
  const { data: artworks = [], isLoading: artworksLoading } = useQuery<ArtworkRow[]>({
    queryKey: ["collection-artworks", selectedCategory],
    enabled: !!selectedCategory,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, price, category, description, image_path, images, slug, artist_id, status")
        .eq("category", selectedCategory!);

      if (error) throw error;
      return (data ?? []) as ArtworkRow[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const handleCategoryClick = (category: string) => {
    setSelectedCategory((prev) => (prev === category ? null : category));
  };

  useEffect(() => {
    if (selectedCategory) {
      trackEvent('collection_viewed', { category: selectedCategory });
      trackPageViewed({ page: 'Collection Details', title: selectedCategory });
    } else {
      trackPageViewed({ page: 'Collections Listing', title: 'Your Collections' });
    }
  }, [selectedCategory]);

  const totalCollections = categories.length;
  const totalWorks = categories.reduce((s, c) => s + c.count, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        <div className="[&_nav>div:nth-child(2)_a[href='/collections']]:text-gold">
          <HomeNav />
        </div>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-4 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                  <GalleryHorizontalEnd className="h-3.5 w-3.5" aria-hidden="true" />
                  Curated rooms
                </div>
                <h1 className="mb-3 text-[30px] font-medium leading-[1.12] tracking-[-0.025em] text-linen sm:text-[40px] md:text-[46px]">
                  Your Collections
                </h1>
                <p className="max-w-[580px] text-[13px] leading-[1.75] text-stone sm:text-[14px]">
                  Browse themed selections shaped around medium, mood, and collecting intent.
                  Select a collection to explore the works inside.
                </p>
              </div>

              <Link
                to="/artworks"
                className="inline-flex h-10 w-fit items-center justify-center rounded-[6px] border border-gold/25 bg-gold/10 px-5 text-[12px] font-medium text-gold transition-colors hover:bg-gold hover:text-obsidian"
              >
                View full catalogue
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* Stats row */}
            <div className="mt-8 grid gap-3 border-t border-t-[0.5px] border-border-faint pt-6 grid-cols-3">
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-3 sm:p-4">
                <div className="mb-1 flex items-center gap-2 text-[18px] font-medium tracking-[-0.02em] text-linen sm:text-[22px]">
                  <Layers3 className="h-4 w-4 text-gold sm:h-5 sm:w-5" aria-hidden="true" />
                  {categoriesLoading ? "—" : totalCollections}
                </div>
                <div className="text-[10px] text-[#666] sm:text-[11px]">Collections</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-3 sm:p-4">
                <div className="mb-1 text-[18px] font-medium tracking-[-0.02em] text-linen sm:text-[22px]">
                  {categoriesLoading ? "—" : totalWorks}
                </div>
                <div className="text-[10px] text-[#666] sm:text-[11px]">Total works</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-3 sm:p-4">
                <div className="mb-1 flex items-center gap-2 text-[18px] font-medium tracking-[-0.02em] text-verified sm:text-[22px]">
                  <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                  Vetted
                </div>
                <div className="text-[10px] text-[#666] sm:text-[11px]">Artist-led curation</div>
              </div>
            </div>
          </div>
        </header>

        {/* ── Main content ────────────────────────────────────────────────────── */}
        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">

          {/* ── Category grid loading skeleton ─────────────────────────────── */}
          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-xl border border-white/5">
                  <div className="aspect-[4/3] animate-pulse bg-surface-3" />
                  <div className="bg-surface-2 p-4 space-y-2">
                    <div className="h-4 w-2/3 animate-pulse rounded bg-surface-3" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-surface-3" />
                  </div>
                </div>
              ))}
            </div>

          ) : categories.length === 0 ? (
            /* ── Empty state ─────────────────────────────────────────────── */
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[10px] border border-border-subtle bg-surface-2 px-6 py-14 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mb-3 text-[22px] font-medium tracking-[-0.02em] text-linen sm:text-[26px]">
                Collections are being prepared
              </h2>
              <p className="mb-7 max-w-md text-[13px] leading-[1.7] text-stone sm:text-[14px]">
                Curated groups will appear here as soon as categorized artworks are available.
              </p>
              <Link
                to="/artworks"
                className="inline-flex h-10 items-center justify-center rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian transition-colors hover:bg-linen"
              >
                Browse All Artworks
              </Link>
            </div>

          ) : (
            /* ── Category grid ───────────────────────────────────────────── */
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 sm:gap-4">
                {categories.map((summary) => (
                  <CollectionCard
                    key={summary.category}
                    summary={summary}
                    isActive={selectedCategory === summary.category}
                    onClick={() => handleCategoryClick(summary.category)}
                  />
                ))}
              </div>

              {/* ── Artwork panel (animates in when category selected) ──────── */}
              <AnimatePresence mode="wait">
                {selectedCategory && (
                  <motion.section
                    key={selectedCategory}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="rounded-2xl border border-border-subtle bg-surface-2/60 p-4 sm:p-6"
                  >
                    {/* Section header */}
                    <div className="mb-6 flex flex-col gap-3 border-b border-border-faint pb-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                          Collection
                        </p>
                        <h2 className="text-[22px] font-medium capitalize tracking-[-0.02em] text-linen sm:text-[28px]">
                          {selectedCategory}
                        </h2>
                        {!artworksLoading && (
                          <p className="mt-1 text-[12px] text-stone">
                            {artworks.length} {artworks.length === 1 ? "work" : "works"} in this collection
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="inline-flex w-fit items-center gap-2 rounded-[6px] border border-border-subtle bg-surface-3 px-4 py-2 text-[12px] font-medium text-stone transition-colors hover:border-gold/30 hover:text-linen"
                      >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        All Collections
                      </button>
                    </div>

                    {/* Artworks grid */}
                    {artworksLoading ? (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="overflow-hidden rounded-xl border border-white/5 bg-brand-dark/80">
                            <div className="aspect-square animate-pulse bg-surface-3" />
                            <div className="space-y-3 p-5">
                              <div className="h-5 w-2/3 animate-pulse rounded bg-surface-3" />
                              <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
                              <div className="h-10 w-full animate-pulse rounded bg-surface-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : artworks.length === 0 ? (
                      <div className="flex flex-col items-center py-12 text-center">
                        <Sparkles className="mb-3 h-8 w-8 text-gold/40" />
                        <p className="text-[14px] text-stone">No artworks found in this collection.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                        {artworks.map((artwork) => (
                          <ArtworkCardWithImage key={artwork.id} artwork={artwork} />
                        ))}
                      </div>
                    )}
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};

export default Collections;
