
import HomeNav from "@/components/home/HomeNav";
import { useArtworks } from "@/components/ArtworkGrid";
import ArtworksHeader from "@/components/artworks/ArtworksHeader";
import ArtworksFilterBar from "@/components/artworks/ArtworksFilterBar";
import ArtworksGrid from "@/components/artworks/ArtworksGrid";
import type { Artwork } from "@/components/artworks/ArtworkCard";
import Pagination from "@/components/shared/Pagination";

const getDisplayImage = (imagePath?: string | null) => {
  if (!imagePath) return "/placeholder.svg";
  const clean = imagePath.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  if (clean.startsWith("/")) {
    return clean;
  }
  const relativePath = clean.replace(/^artworks\//, "");
  return `https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${relativePath}`;
};

const Artworks = () => {
  const { artworks = [], isLoading, page, totalPages, goToPage } = useArtworks();

  const mappedArtworks: Artwork[] = artworks.map((artwork) => ({
    id: artwork.slug || artwork.id,
    title: artwork.title,
    artist: artwork.artist?.full_name || "Unknown Artist",
    artistId: artwork.artist?.id,
    image: getDisplayImage(artwork.image_path),
    price: artwork.price,
    currency: "INR",
    medium: artwork.category || "Original artwork",
    verified: true,
    available: true,
    stock: 1,
  }));

  const artistsCount = new Set(mappedArtworks.map((artwork) => artwork.artist).filter(Boolean)).size || undefined;

  return (
    <div className="min-h-screen bg-obsidian">
      <div className="[&_nav>div:nth-child(2)_a[href='/artworks']]:text-gold">
        <HomeNav />
      </div>
      <ArtworksHeader
        totalArtworks={mappedArtworks.length || undefined}
        availableCount={mappedArtworks.filter((artwork) => artwork.available).length || undefined}
        artistsCount={artistsCount}
      />
      <ArtworksFilterBar />
      <ArtworksGrid artworks={mappedArtworks} loading={isLoading} />
      {totalPages > 1 && (
        <div className="py-8">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </div>
      )}
    </div>
  );
};

export default Artworks;
