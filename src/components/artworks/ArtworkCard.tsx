import { Link } from "react-router-dom";

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  artistId?: string;
  image: string;
  imagePath?: string | null;
  price: number;
  currency?: string;
  medium?: string;
  dimensions?: string;
  year?: number;
  verified?: boolean;
  available?: boolean;
  stock?: number;
  status?: "available" | "sold" | "reserved" | "draft" | "hidden";
}

interface ArtworkCardProps {
  artwork: Artwork;
}

const ArtworkCard = ({ artwork }: ArtworkCardProps) => {
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: artwork.currency || "INR",
    minimumFractionDigits: 0,
  }).format(artwork.price);

  const available = artwork.available ?? true;
  const isSold = artwork.status === 'sold';

  return (
    <article className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2 transition-all hover:border-gold/30">
      <Link to={`/artworks/${artwork.id}`} className="group block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={artwork.image}
            alt={`${artwork.title} by ${artwork.artist} - ${artwork.medium || "artwork"}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />

          <div className="absolute left-3 top-3 flex gap-2">
            {artwork.verified && (
              <span className="rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.9)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-white backdrop-blur-sm">
                Verified
              </span>
            )}
            {!available && !isSold && (
              <span className="rounded-full border border-[#2a2a2a] bg-[rgba(0,0,0,0.8)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-[#888] backdrop-blur-sm">
                Acquired
              </span>
            )}
          </div>
          
          {isSold && (
            <div className="absolute right-3 top-3">
              <span className="rounded-sm border border-gold/40 bg-obsidian/90 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.1em] text-white shadow-md backdrop-blur-md">
                Collected
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="mb-1 line-clamp-1 text-[14px] font-medium text-linen transition-colors group-hover:text-gold">
            {artwork.title}
          </h3>
          <p className="mb-3 text-[12px] text-[#666]">{artwork.artist}</p>

          {artwork.medium && (
            <p className="mb-3 text-[11px] text-[#555]">
              {artwork.medium}
              {artwork.dimensions && ` | ${artwork.dimensions}`}
              {artwork.year && ` | ${artwork.year}`}
            </p>
          )}
        </div>
      </Link>

      <div className="mx-4 flex items-center justify-between border-t border-t-[0.5px] border-[#1a1a1a] pb-4 pt-3">
        {isSold ? (
          <>
            <div>
              <div className="mb-[2px] text-[11px] text-[#555]">Investment value</div>
              <div className="text-[14px] font-medium text-[#888]">{formattedPrice}</div>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#888]">
              <span className="text-gold">✓</span> Collected
            </div>
          </>
        ) : available ? (
          <>
            <div>
              <div className="mb-[2px] text-[11px] text-[#555]">Investment value</div>
              <div className="text-[14px] font-medium text-linen">{formattedPrice}</div>
            </div>
            <button
              onClick={() => {
                console.log("Add to collection:", artwork.id);
              }}
              className="rounded-md border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.1)] px-3 py-[6px] text-[11px] text-gold transition-colors hover:bg-[rgba(201,169,110,0.15)]"
            >
              Collect
            </button>
          </>
        ) : (
          <div className="text-[12px] text-[#555]">No longer available</div>
        )}
      </div>
    </article>
  );
};

export default ArtworkCard;

