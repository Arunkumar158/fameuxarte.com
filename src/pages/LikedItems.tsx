import { useLikedItems } from "@/hooks/useLikedItems";
import MainLayout from "@/components/layouts/MainLayout";
import HomeNav from "@/components/home/HomeNav";
import ArtworkCard from "@/components/shared/ArtworkCard";
import { Button } from "@/components/ui/button";
import { Heart, Search, ShieldCheck, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useArtworkImage } from "@/hooks/useArtworkImage";

// Component to handle individual liked item with proper image loading
const LikedItemCard = ({ item }: { item: {
  artwork_id: string;
  artworks?: {
    id: string;
    title: string | null;
    artist_id: string | null;
    price: number | null;
    image_path: string | null;
    category: string | null;
    slug: string | null;
  } | null;
} }) => {
  const { imageUrl } = useArtworkImage(item.artworks?.image_path);
  
  return (
    <ArtworkCard
      key={item.artworks?.id}
      artwork={{
        id: item.artwork_id,
        slug: item.artworks?.slug,
        title: item.artworks?.title || "Unknown Title",
        artist: item.artworks?.artist_id || "Unknown Artist",
        price: item.artworks?.price || 0,
        image: imageUrl,
        category: item.artworks?.category || "Uncategorized"
      }}
    />
  );
};

const LikedItems = () => {
  const { likedItems, isLoading } = useLikedItems();
  const { user } = useAuth();
  const savedCount = likedItems?.length || 0;

  // Redirect to auth page if user is not logged in
  if (!user) {
    return <Navigate to="/auth" />;
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-obsidian text-linen">
        <div className="[&_nav_a[href='/liked-items']]:text-gold">
          <HomeNav />
        </div>

        <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-6 py-12">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                  <Heart className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
                  Private shortlist
                </div>
                <h1 className="mb-3 text-[34px] font-medium leading-[1.12] tracking-[-0.025em] text-linen md:text-[46px]">
                  Saved Artworks
                </h1>
                <p className="max-w-[580px] text-[14px] leading-[1.75] text-stone">
                  Revisit the pieces that caught your eye, compare investment value, and move favorites into your collection when the moment feels right.
                </p>
              </div>

              <Button asChild className="h-10 rounded-[6px] bg-linen px-5 text-[12px] font-medium text-obsidian hover:bg-gold">
                <Link to="/artworks">
                  <Search className="mr-2 h-4 w-4" aria-hidden="true" />
                  Browse Artworks
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-3 border-t border-t-[0.5px] border-border-faint pt-6 sm:grid-cols-3">
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 text-[22px] font-medium tracking-[-0.02em] text-linen">{savedCount}</div>
                <div className="text-[11px] text-[#666]">Saved pieces</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em] text-verified">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                  AI
                </div>
                <div className="text-[11px] text-[#666]">Verified catalogue</div>
              </div>
              <div className="rounded-[8px] border border-border-subtle bg-surface-2 p-4">
                <div className="mb-1 flex items-center gap-2 text-[22px] font-medium tracking-[-0.02em] text-gold">
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                  Live
                </div>
                <div className="text-[11px] text-[#666]">Curated for you</div>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
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
          ) : likedItems && likedItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {likedItems.map((item) => (
                <LikedItemCard key={item.artworks?.id || item.artwork_id} item={item} />
              ))}
            </div>
          ) : (
            <div className="mx-auto flex max-w-2xl flex-col items-center rounded-[10px] border border-border-subtle bg-surface-2 px-6 py-14 text-center">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10 text-gold">
                <Heart className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mb-3 text-[26px] font-medium tracking-[-0.02em] text-linen">No saved artworks yet</h2>
              <p className="mb-7 max-w-md text-[14px] leading-[1.7] text-stone">
                Save artworks while browsing to build a focused shortlist for future collecting decisions.
              </p>
              <Button asChild className="h-10 rounded-[6px] bg-gold px-5 text-[12px] font-medium text-obsidian hover:bg-linen">
                <Link to="/artworks">Start Discovering</Link>
              </Button>
            </div>
          )}
        </main>
      </div>
    </MainLayout>
  );
};

export default LikedItems;
