interface ArtworksHeaderProps {
  totalArtworks?: number;
  availableCount?: number;
  artistsCount?: number;
}

const ArtworksHeader = ({
  totalArtworks = 1200,
  availableCount = 847,
  artistsCount = 340,
}: ArtworksHeaderProps) => {
  return (
    <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-medium leading-[1.2] tracking-[-0.025em] text-linen">
            Discover Original Art
          </h1>
          <p className="max-w-[540px] text-[14px] leading-[1.75] text-[#666]">
            Every piece ArtGuard verified. Every artist personally vetted. Browse museum-quality works from India's most talented contemporary creators.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 border-t border-t-[0.5px] border-border-faint pt-6">
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-linen">
              {totalArtworks}+
            </div>
            <div className="text-[11px] text-[#555]">Total artworks</div>
          </div>
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-verified">
              {availableCount}
            </div>
            <div className="text-[11px] text-[#555]">Available now</div>
          </div>
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-linen">
              {artistsCount}
            </div>
            <div className="text-[11px] text-[#555]">Verified artists</div>
          </div>
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-linen">
              98%
            </div>
            <div className="text-[11px] text-[#555]">Authenticity rate</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ArtworksHeader;
