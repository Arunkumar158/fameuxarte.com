import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import ArtworkCard from "@/components/shared/ArtworkCard";
import Pagination from "@/components/shared/Pagination";
import { usePagination } from "@/hooks/usePagination";
import { useArtworkImage } from "@/hooks/useArtworkImage";
import { getGalleryImages } from "@/lib/utils";
import { ArrowRight, GalleryHorizontalEnd, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

// Component to handle individual artwork with proper image loading
const ArtworkCardWithImage = ({ artwork }: { artwork: {
  id: string;
  title: string;
  price: number;
  category: string | null;
  description: string | null;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
  artist_id: string | null;
} }) => {
  // Resolve the first gallery image, falling back to image_path if images[] is empty.
  const galleryPaths = getGalleryImages(artwork);
  const primaryPath = galleryPaths[0] ?? null;
  const { imageUrl } = useArtworkImage(primaryPath);
  
  return (
    <ArtworkCard 
      key={artwork.id} 
      artwork={{
        id: artwork.id.toString(),
        slug: artwork.slug,
        title: artwork.title,
        artist: artwork.artist_id || "Unknown Artist",
        price: artwork.price,
        image: imageUrl,
        category: artwork.category || "Uncategorized",
        imageCount: galleryPaths.length,
      }} 
    />
  );
};

const Collections = () => {
  const {
    page,
    totalPages,
    setTotalItems,
    isLoading,
    setIsLoading,
    goToPage,
    calculateRange,
    limit
  } = usePagination({ initialLimit: 8 });

  const { data: collections = {}, isLoading: initialLoading } = useQuery({
    queryKey: ["collections", page],
    queryFn: async () => {
      const { from, to } = calculateRange();
      setIsLoading(true);
      
      try {
        const { data, error, count } = await supabase
          .from("artworks")
          .select("id, title, price, category, description, image_path, images, slug, artist_id", { count: "exact" })
          .not("category", "eq", "Uncategorized")
          .range(from, to);
        
        if (error) throw error;
        
        // Group by category
        const groupedByCategory = (data || []).reduce((acc: Record<string, typeof data>, artwork) => {
          const category = artwork.category || "Uncategorized";
          if (!acc[category]) acc[category] = [];
          acc[category].push(artwork);
          return acc;
        }, {} as Record<string, typeof data>);

        if (count) {
          setTotalItems(count);
        }
        
        return groupedByCategory;
      } finally {
        setIsLoading(false);
      }
    },
  });

  const collectionEntries = Object.entries(collections);
  const visibleArtworkCount = collectionEntries.reduce((count, [, artworks]) => count + artworks.length, 0);

  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        <div className="[&_nav>div:nth-child(2)_a[href='/collections']]:text-gold">
          <HomeNav />
        </div>

        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                  <GalleryHorizontalEnd className="h-3.5 w-3.5" aria-hidden="true" />
                  Curated rooms
                </div>
                <h1 className="mb-3 text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen md:text-[46px]">
                  Your Collections
                </h1>
                <p className="max-w-[620px] text-[14px] leading-[1.75] text-stone">
                  Explore themed selections shaped around medium, mood, and collecting intent, with each artwork presented for confident comparison.
                </p>
              </div>

              <Link
                to="/artworks"
                className="inline-flex h-10 items-center justify-center rounded-[6px] border border-gold/25 bg-gold/10 px-5 text-[12px] font-medium text-gold transition-colors hover:bg-gold hover:text-obsidian"
              >
                View full catalogue
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 grid gap-3 border-t border-t-[0.5px] border-border-faint pt-6 sm:grid-cols-3">
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em] text-linen">
                  <Layers3 className="h-5 w-5 text-gold" aria-hidden="true" />
                  {collectionEntries.length}
                </div>
                <div className="text-[11px] text-[#666]">Active collections</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{visibleArtworkCount}</div>
                <div className="text-[11px] text-[#666]">Works on this page</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em] text-verified">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  Vetted
                </div>
                <div className="text-[11px] text-[#666]">Artist-led curation</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          {initialLoading || isLoading ? (
            <div className="space-y-12">
              {Array.from({ length: 2 }).map((_, sectionIndex) => (
                <section key={sectionIndex} className="space-y-6">
                  <div className="h-8 w-56 animate-pulse rounded bg-surface-3" />
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="overflow-hidden rounded-xl border border-white/5 bg-brand-dark/80">
                        <div className="aspect-square animate-pulse bg-surface-3" />
                        <div className="space-y-3 p-5">
                          <div className="h-5 w-2/3 animate-pulse rounded bg-surface-3" />
                          <div className="h-4 w-1/2 animate-pulse rounded bg-surface-3" />
                          <div className="h-10 w-full animate-pulse rounded bg-surface-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : collectionEntries.length === 0 ? (
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[10px] border border-border-subtle bg-surface-2 px-6 py-14 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mb-3 text-[26px] font-medium tracking-[-0.02em] text-linen">Collections are being prepared</h2>
              <p className="mb-7 max-w-md text-[14px] leading-[1.7] text-stone">
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
            <div className="space-y-14">
              {collectionEntries.map(([category, artworks]) => (
                <section key={category} className="space-y-6">
                  <div className="flex flex-col gap-2 border-b border-b-[0.5px] border-border-faint pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                        {artworks.length} {artworks.length === 1 ? "work" : "works"}
                      </p>
                      <h2 className="text-[26px] font-medium capitalize tracking-[-0.02em] text-linen md:text-[32px]">
                        {category}
                      </h2>
                    </div>
                    <p className="max-w-sm text-[12px] leading-[1.7] text-[#666]">
                      A focused selection for collectors comparing form, finish, and long-term fit.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {artworks.map((artwork) => (
                      <ArtworkCardWithImage key={artwork.id} artwork={artwork} />
                    ))}
                  </div>
                </section>
              ))}

              {totalPages > 1 && (
                <div className="border-t border-t-[0.5px] border-border-faint pt-8">
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                  />
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};

export default Collections;
