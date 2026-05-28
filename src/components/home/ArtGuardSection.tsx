const scoreBars = [
  ["Originality", 97],
  ["Brushwork", 94],
  ["Provenance", 100],
  ["Signature match", 91],
] as const;

const ArtGuardSection = () => {
  return (
    <section id="artguard" className="bg-obsidian px-6 py-12">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div>
          <div className="mb-[14px] text-[10px] uppercase tracking-[0.16em] text-verified">ArtGuard - authenticity layer</div>
          <h2 className="mb-[14px] text-[26px] font-medium leading-[1.18] tracking-[-0.02em] text-linen">
            Every artwork passes our intelligence check.
          </h2>
          <p className="mb-[22px] text-[13px] leading-[1.75] text-[#555]">
            ArtGuard combines AI pattern analysis with human expert review to verify originality, detect forgeries, and confirm provenance - before a work ever appears on Fameuxarte.
          </p>
          <a href="#artguard" className="flex items-center gap-[6px] text-[12px] text-gold">
            Learn how ArtGuard works -&gt;
          </a>
        </div>

        <div className="rounded-[12px] border border-border-subtle bg-surface-2 p-5">
          <div className="mb-[18px] flex items-center justify-between">
            <span className="text-[12px] text-[#666]">ArtGuard analysis</span>
            <span className="rounded-full border border-[rgba(74,157,111,0.25)] bg-[rgba(74,157,111,0.12)] px-2 py-[3px] text-[10px] text-verified">
              Verified
            </span>
          </div>

          <div className="mb-[18px] flex items-baseline gap-2">
            <span className="text-[40px] font-medium tracking-[-0.03em] text-linen">96</span>
            <span className="text-[12px] text-[#555]">/ 100 authenticity score</span>
          </div>

          <div className="space-y-4">
            {scoreBars.map(([label, value]) => (
              <div key={label} className="flex items-center gap-[10px]">
                <span className="w-[88px] shrink-0 text-[11px] text-[#555]">{label}</span>
                <div className="h-[3px] flex-1 rounded-[2px] bg-[#1e1e1e]">
                  <div className="h-[3px] rounded-[2px] bg-verified" style={{ width: `${value}%` }} />
                </div>
                <span className="w-7 shrink-0 text-right text-[11px] text-[#666]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ArtGuardSection;
