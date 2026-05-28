
import HomeNav from "@/components/home/HomeNav";
import { useArtworks } from "@/components/ArtworkGrid";
import ArtworksHeader from "@/components/artworks/ArtworksHeader";
import ArtworksFilterBar from "@/components/artworks/ArtworksFilterBar";
import ArtworksGrid from "@/components/artworks/ArtworksGrid";
import type { Artwork } from "@/components/artworks/ArtworkCard";
import LoadMoreButton from "@/components/artworks/LoadMoreButton";

const getDisplayImage = (imagePath?: string | null) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("/") || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return "/placeholder.svg";
};

const Artworks = () => {
  const { artworks = [], isLoading, isLoadingMore, page, totalPages, goToPage } = useArtworks();

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
  const hasMore = totalPages > 1 && page < totalPages;

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
      <LoadMoreButton onLoadMore={() => goToPage(page + 1)} loading={isLoadingMore} hasMore={hasMore} />
    </div>
  );
};

export default Artworks;
