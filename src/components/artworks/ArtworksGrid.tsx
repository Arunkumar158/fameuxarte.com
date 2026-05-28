import type { ReactNode } from "react";
import ArtworkCard, { Artwork } from "./ArtworkCard";

interface ArtworksGridProps {
  artworks: Artwork[];
  loading?: boolean;
  renderArtwork?: (artwork: Artwork) => ReactNode;
}

const ArtworksGrid = ({ artworks, loading = false, renderArtwork }: ArtworksGridProps) => {
  if (loading) {
    return (
      <div className="bg-surface-1 px-6 py-20 text-center">
        <p className="text-[14px] text-[#666]">Loading artworks...</p>
      </div>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <div className="bg-surface-1 px-6 py-20 text-center">
        <p className="mb-2 text-[14px] text-[#666]">No artworks found</p>
        <p className="text-[12px] text-[#555]">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <section className="bg-surface-1 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {artworks.map((artwork) => (
            <div key={artwork.id}>{renderArtwork ? renderArtwork(artwork) : <ArtworkCard artwork={artwork} />}</div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtworksGrid;
