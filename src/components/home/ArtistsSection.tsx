import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export interface Artist {
  id: string;
  name: string;
  profileId?: string | null;
  location?: string;
  artworkCount?: number;
  soldCount?: number;
}

interface ArtistsSectionProps {
  artists?: Artist[];
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

const ArtistsSection = ({ artists }: ArtistsSectionProps) => {
  const { data: homeArtists, isLoading } = useQuery({
    queryKey: ["home-verified-artists"],
    enabled: !artists,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artists")
        .select(
          `
          id,
          profile_id,
          specialty,
          profiles:profile_id (
            full_name
          )
        `
        )
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;

      const rows = data ?? [];
      const profileIds = rows.map((artist) => artist.profile_id).filter(Boolean) as string[];
      const artworkCounts = new Map<string, number>();

      if (profileIds.length) {
        const { data: artworks, error: artworkError } = await supabase
          .from("artworks")
          .select("artist_id")
          .in("artist_id", profileIds);

        if (artworkError) throw artworkError;

        artworks?.forEach((artwork) => {
          if (artwork.artist_id) {
            artworkCounts.set(artwork.artist_id, (artworkCounts.get(artwork.artist_id) ?? 0) + 1);
          }
        });
      }

      return rows.map((artist, index) => ({
        id: artist.id,
        profileId: artist.profile_id,
        name: artist.profiles?.full_name || artist.specialty || `Artist ${index + 1}`,
        location: "India",
        artworkCount: artist.profile_id ? artworkCounts.get(artist.profile_id) ?? 0 : 0,
        soldCount: 0,
      })) satisfies Artist[];
    },
  });

  const displayArtists = artists ?? homeArtists ?? [];

  return (
    <section className="bg-surface-1 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">Verified artists</div>
            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-linen">Creators behind the works</h2>
          </div>
          <Link to="/artists" className="shrink-0 text-[12px] text-[#555] transition-colors hover:text-gold">
            All artists -&gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-4">
          {isLoading &&
            [...Array(4)].map((_, index) => (
              <div key={index} className="h-[146px] animate-pulse rounded-[10px] border border-border-subtle bg-surface-2" />
            ))}

          {!isLoading && displayArtists.length === 0 && (
            <div className="rounded-[10px] border border-border-subtle bg-surface-2 p-[14px] text-[12px] text-[#555] sm:col-span-2 lg:col-span-4">
              No verified artists available at the moment.
            </div>
          )}

          {displayArtists.map((artist, index) => (
            <article key={artist.id} className="rounded-[10px] border border-border-subtle bg-surface-2 px-[14px] py-4">
              <div className={`mb-[10px] flex h-10 w-10 items-center justify-center rounded-full text-[15px] font-medium ${colorPairs[index % colorPairs.length]}`}>
                {getInitials(artist.name)}
              </div>
              <h3 className="mb-[2px] text-[13px] font-medium text-[#d0ccc4]">{artist.name}</h3>
              <p className="mb-[10px] text-[11px] text-[#444]">{artist.location || "India"}</p>
              <div className="flex justify-between">
                <div>
                  <div className="text-[11px] text-[#555]">Works</div>
                  <div className="text-[13px] font-medium text-[#888]">{artist.artworkCount ?? 0}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-[#555]">Collected</div>
                  <div className="text-[13px] font-medium text-[#888]">{artist.soldCount ?? 0}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ArtistsSection;
