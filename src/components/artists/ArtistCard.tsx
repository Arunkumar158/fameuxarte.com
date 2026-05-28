import { Link } from "react-router-dom";

export interface Artist {
  id: string;
  name: string;
  location?: string;
  bio?: string;
  medium?: string;
  avatar?: string;
  artworkCount?: number;
  collectedCount?: number;
  verified?: boolean;
}

interface ArtistCardProps {
  artist: Artist;
  index: number;
}

const colorPairs = [
  "bg-[#1a2a1a] text-verified",
  "bg-[#2a1a0a] text-gold",
  "bg-[#0f1a2e] text-[#378add]",
  "bg-[#1a0a1a] text-[#7f77dd]",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const ArtistCard = ({ artist, index }: ArtistCardProps) => {
  const avatarClasses = colorPairs[index % colorPairs.length];

  return (
    <Link to={`/artists/${artist.id}`}>
      <article className="group rounded-[10px] border border-border-subtle bg-surface-2 p-5 transition-colors hover:border-gold/30">
        <div className="mb-4 flex items-start justify-between">
          <div className={`flex h-14 w-14 items-center justify-center rounded-full text-[16px] font-medium ${avatarClasses}`}>
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.name} className="h-full w-full rounded-full object-cover" />
            ) : (
              getInitials(artist.name)
            )}
          </div>
          {artist.verified && (
            <span className="rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.15)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-verified">
              Verified
            </span>
          )}
        </div>

        <h3 className="mb-1 text-[15px] font-medium text-linen transition-colors group-hover:text-gold">{artist.name}</h3>
        <p className="mb-1 text-[12px] text-[#555]">{artist.location || "India"}</p>
        {artist.medium && <p className="mb-4 text-[11px] text-[#444]">{artist.medium}</p>}

        {artist.bio && (
          <p
            className="mb-4 overflow-hidden text-[13px] leading-[1.6] text-[#666]"
            style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
          >
            {artist.bio}
          </p>
        )}

        <div className="flex justify-between border-t border-t-[0.5px] border-[#1a1a1a] pt-4">
          <div>
            <div className="text-[11px] text-[#555]">Works</div>
            <div className="text-[14px] font-medium text-[#aaa]">{artist.artworkCount ?? 0}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] text-[#555]">Collected</div>
            <div className="text-[14px] font-medium text-[#aaa]">{artist.collectedCount ?? 0}</div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArtistCard;
