import { Link } from "react-router-dom";

interface HeroSectionProps {
  artworkCount?: number | string;
  artistCount?: number | string;
}

const formatStat = (value: number | string | undefined, fallback: string) => {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "number" ? value.toLocaleString("en-IN") : value;
};

const HeroSection = ({ artworkCount, artistCount }: HeroSectionProps) => {
  const stats = [
    { value: `${formatStat(artworkCount, "1,200")}+`, label: "Original artworks" },
    { value: formatStat(artistCount, "340"), label: "Verified artists" },
    { value: "98%", label: "Authenticity rate" },
    { value: "62", label: "Countries served" },
  ];

  return (
    <section className="bg-obsidian px-4 sm:px-6 pb-10 sm:pb-12 pt-10 sm:pt-14 text-center">
      <div className="mx-auto max-w-[680px]">
        <div className="mb-5 flex items-center justify-center gap-2">
          <span className="h-[6px] w-[6px] rounded-full bg-verified" />
          <span className="text-[11px] uppercase tracking-[0.1em] text-[#555]">
            ArtGuard - AI-verified authenticity
          </span>
        </div>

        <h1 className="mb-[18px] text-[32px] font-medium leading-[1.08] tracking-[-0.025em] text-linen sm:text-[44px]">
          Acquire art
          <br />
          you can <em className="not-italic text-gold">trust.</em>
        </h1>

        <p className="mx-auto mb-7 max-w-[480px] text-[14px] leading-[1.75] text-[#666]">
          Every painting. Every artist. Every transaction - backed by AI authentication and human expertise. This is where serious collectors come to discover original art.
        </p>

        <div className="mb-10 flex flex-col justify-center gap-[10px] sm:flex-row">
          <Link to="/artworks" className="rounded-[6px] bg-linen px-5 py-[11px] text-center text-[13px] font-medium text-obsidian transition-opacity hover:opacity-90">
            Explore the collection
          </Link>
          <a href="#artguard" className="rounded-[6px] border border-[#2a2a2a] bg-transparent px-5 py-[11px] text-center text-[13px] text-[#888] transition-colors hover:text-linen">
            How ArtGuard works
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 border-t border-[#1a1a1a] pt-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="mb-[2px] text-[20px] sm:text-[22px] font-medium tracking-[-0.02em] text-linen">{stat.value}</div>
              <div className="text-[11px] text-[#444]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
