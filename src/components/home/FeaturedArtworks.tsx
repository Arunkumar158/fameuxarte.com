import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getArtworkImageUrl, getGalleryImages } from "@/lib/utils";

export interface Artwork {
  id: string;
  title: string;
  artist?: string;
  artistName?: string;
  location?: string;
  price: number;
  image?: string | null;
  image_url?: string | null;
  is_verified?: boolean;
  is_acquired?: boolean;
  slug?: string | null;
  status?: "available" | "sold" | "reserved";
}

interface FeaturedArtworksProps {
  artworks?: Artwork[];
  onCollectArtwork?: (artwork: Artwork) => void;
}

type ArtworkRow = {
  id: string;
  title: string;
  price: number;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
  artist: {
    full_name: string | null;
  } | null;
  status?: "available" | "sold" | "reserved";
};

const fetchFeaturedArtworks = async (): Promise<Artwork[]> => {
  const { data, error } = await supabase
    .from("artworks")
    .select(`
      id,
      title,
      price,
      image_path,
      images,
      slug,
      status,
      artist:profiles!artworks_artist_id_fkey (
        full_name
      )
    `)
    .eq("status", "available")
    .or("category.is.null,category.neq.Uncategorized")
    .order("created_at", { ascending: false })
    .limit(3);

  if (error) throw error;

  return Promise.all(
    ((data || []) as ArtworkRow[]).map(async (artwork) => {
      const [primaryImagePath] = getGalleryImages(artwork);
      const image = primaryImagePath ? await getArtworkImageUrl(primaryImagePath) : null;

      return {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist?.full_name || "Verified artist",
        location: "India",
        price: artwork.price,
        image: image || "/placeholder.svg",
        is_verified: true,
        slug: artwork.slug,
        status: artwork.status,
      };
    })
  );
};

const FeaturedArtworks = ({ artworks, onCollectArtwork }: FeaturedArtworksProps) => {
  const shouldFetchArtworks = !artworks?.length;
  const { data: fetchedArtworks = [], isLoading } = useQuery({
    queryKey: ["home-featured-artworks"],
    queryFn: fetchFeaturedArtworks,
    enabled: shouldFetchArtworks,
  });

  const displayArtworks = artworks?.length ? artworks : fetchedArtworks;

  return (
    <section className="bg-transparent px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-2 text-[11px] font-normal uppercase tracking-[0.14em] text-[#555]">Featured collection</div>
            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-linen">Works worth collecting</h2>
          </div>
          <Link to="/artworks" className="shrink-0 text-[12px] text-[#555] transition-colors hover:text-gold">
            View all artworks -&gt;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-2 lg:grid-cols-3">
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="aspect-[4/5] animate-pulse rounded-[10px] border border-border-subtle bg-surface-3" />
              ))
            : displayArtworks.map((artwork) => {
                const image = artwork.image || artwork.image_url;
                const isSold = artwork.status === 'sold' || Boolean(artwork.is_acquired);
                const artist = artwork.artist || artwork.artistName || "Verified artist";
                const location = artwork.location || "India";

                return (
                  <article key={artwork.id} className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-3">
                    <Link to={`/artworks/${artwork.slug || artwork.id}`} className="relative block aspect-[4/5] overflow-hidden bg-surface-2">
                      {image ? (
                        <img src={image} alt={artwork.title} className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]" />
                      ) : (
                        <div className="h-full w-full bg-surface-2" />
                      )}
                      <div className="absolute left-3 top-3 flex gap-2">
                        {(artwork.is_verified ?? true) && (
                          <span className="rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.15)] px-2 py-[3px] text-[9px] uppercase tracking-[0.08em] text-verified">
                            Verified
                          </span>
                        )}
                      </div>
                      {isSold && (
                        <div className="absolute right-3 top-3">
                          <span className="rounded-sm border border-gold/40 bg-obsidian/90 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.1em] text-white shadow-md backdrop-blur-md">
                            Collected
                          </span>
                        </div>
                      )}
                    </Link>

                    <div className="p-3 pb-[14px]">
                      <h3 className="mb-[2px] text-[13px] font-medium text-[#e0dcd4]">{artwork.title}</h3>
                      <p className="mb-[10px] text-[11px] text-[#555]">
                        {artist} - {location}
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        {isSold ? (
                          <>
                            <span className="text-[12px] font-medium text-[#777]">Rs. {artwork.price.toLocaleString("en-IN")}</span>
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#888]">
                              <span className="text-gold">✓</span> Collected
                            </div>
                          </>
                        ) : onCollectArtwork ? (
                          <>
                            <span className="text-[12px] font-medium text-[#aaa]">Rs. {artwork.price.toLocaleString("en-IN")}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                onCollectArtwork(artwork);
                              }}
                              className="rounded-[4px] border border-gold/20 bg-gold/10 px-3 py-1.5 text-[10px] text-gold transition-colors hover:bg-gold hover:text-obsidian"
                            >
                              Collect
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-[12px] font-medium text-[#aaa]">Rs. {artwork.price.toLocaleString("en-IN")}</span>
                            <Link
                              to={`/artworks/${artwork.slug || artwork.id}`}
                              className="rounded-[4px] border border-gold/20 bg-gold/10 px-3 py-1.5 text-[10px] text-gold transition-colors hover:bg-gold hover:text-obsidian"
                            >
                              Collect
                            </Link>
                          </>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedArtworks;
