const ArtworksFilterBar = () => {
  return (
    <div className="sticky top-0 z-10 border-b border-b-[0.5px] border-border-faint bg-surface-1 px-6 py-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.12)] px-3 py-[6px] text-[12px] text-gold">
              All works
            </button>
            <button className="rounded-full border border-[#2a2a2a] bg-transparent px-3 py-[6px] text-[12px] text-[#666] transition-colors hover:text-[#888]">
              Abstract
            </button>
            <button className="rounded-full border border-[#2a2a2a] bg-transparent px-3 py-[6px] text-[12px] text-[#666] transition-colors hover:text-[#888]">
              Landscape
            </button>
            <button className="rounded-full border border-[#2a2a2a] bg-transparent px-3 py-[6px] text-[12px] text-[#666] transition-colors hover:text-[#888]">
              Portrait
            </button>
            <button className="rounded-full border border-[#2a2a2a] bg-transparent px-3 py-[6px] text-[12px] text-[#666] transition-colors hover:text-[#888]">
              Sculpture
            </button>
            <button className="inline-flex items-center gap-1 rounded-full border border-verified/20 bg-verified/10 px-3 py-[6px] text-[12px] text-verified">
              <i className="ti ti-shield-check text-[11px]" aria-hidden="true" />
              Verified only
            </button>
          </div>

          <select className="rounded-md border border-border-subtle bg-surface-2 px-3 py-[6px] text-[12px] text-[#888]">
            <option>Most recent</option>
            <option>Investment value: Low to high</option>
            <option>Investment value: High to low</option>
            <option>Most collected</option>
            <option>Artist: A to Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ArtworksFilterBar;
