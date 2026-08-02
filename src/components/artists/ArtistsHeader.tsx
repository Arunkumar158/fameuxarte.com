interface ArtistsHeaderProps {
  totalArtists?: number;
  verifiedCount?: number;
}

const ArtistsHeader = ({ totalArtists = 340, verifiedCount = 340 }: ArtistsHeaderProps) => {
  return (
    <header className="border-b border-b-[0.5px] border-border-faint bg-obsidian px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-[32px] font-medium leading-[1.2] tracking-[-0.025em] text-linen">
            Verified Artists
          </h1>
          <p className="max-w-[520px] text-[14px] leading-[1.75] text-[#666]">
            Discover original works from India's most talented contemporary artists. Every creator on Fameuxarte is personally verified and ArtGuard certified.
          </p>
        </div>

        <div className="flex flex-wrap gap-8 border-t border-t-[0.5px] border-border-faint pt-6">
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-linen">{totalArtists}</div>
            <div className="text-[11px] text-[#555]">Total artists</div>
          </div>
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-verified">{verifiedCount}</div>
            <div className="text-[11px] text-[#555]">ArtGuard verified</div>
          </div>
          <div>
            <div className="mb-[2px] text-[20px] font-medium tracking-[-0.02em] text-linen">100%</div>
            <div className="text-[11px] text-[#555]">Original art</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ArtistsHeader;
