const filterLabels = ["All artists", "Painting", "Sculpture", "Mixed media", "Photography"];

const ArtistsFilterBar = () => {
  return (
    <div className="sticky top-0 z-10 border-b border-b-[0.5px] border-border-faint bg-surface-1 px-6 py-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {filterLabels.map((label, index) => (
              <button
                key={label}
                type="button"
                className={
                  index === 0
                    ? "rounded-full border border-[rgba(201,169,110,0.3)] bg-[rgba(201,169,110,0.12)] px-3 py-[6px] text-[12px] text-gold"
                    : "rounded-full border border-[#2a2a2a] bg-transparent px-3 py-[6px] text-[12px] text-[#666] transition-colors hover:border-gold/30 hover:text-gold"
                }
              >
                {label}
              </button>
            ))}
          </div>

          <select className="rounded-md border border-border-subtle bg-surface-2 px-3 py-[6px] text-[12px] text-[#888] outline-none">
            <option>Most collected</option>
            <option>Newest first</option>
            <option>A to Z</option>
            <option>Most artworks</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ArtistsFilterBar;
