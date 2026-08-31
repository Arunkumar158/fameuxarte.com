import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getArtworkImageUrl, getGalleryImages } from "@/lib/utils";
import { useLikedItems } from "@/hooks/useLikedItems";

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
    .limit(5);

  if (error) throw error;

  return Promise.all(
    ((data || []) as ArtworkRow[]).map(async (artwork) => {
      const [primaryImagePath] = getGalleryImages(artwork);
      const image = primaryImagePath ? await getArtworkImageUrl(primaryImagePath) : null;

      return {
        id: artwork.id,
        title: artwork.title,
        artist: artwork.artist?.full_name || "Verified Artist",
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
  const { isItemLiked, toggleLike } = useLikedItems();
  const shouldFetchArtworks = !artworks?.length;
  const { data: fetchedArtworks = [], isLoading } = useQuery({
    queryKey: ["home-featured-artworks-gallery"],
    queryFn: fetchFeaturedArtworks,
    enabled: shouldFetchArtworks,
  });

  const displayArtworks = artworks?.length ? artworks : fetchedArtworks;

  return (
    <section className="w-full bg-black px-4 sm:px-8 py-12 sm:py-16 border-b border-white/[0.08]">
      <div className="mx-auto max-w-[1400px]">
        {/* Section Header */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-serif text-[24px] sm:text-[30px] font-medium text-white tracking-[-0.01em]">
            Featured Artworks
          </h2>

          <Link
            to="/artworks"
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-stone-400 hover:text-white transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-[3/4] animate-pulse rounded-2xl bg-[#141414]"
                />
              ))
            : displayArtworks.map((artwork) => {
                const image = artwork.image || artwork.image_url;
                const isSold = artwork.status === "sold" || Boolean(artwork.is_acquired);
                const artist = artwork.artist || artwork.artistName || "Verified Artist";
                const liked = isItemLiked(artwork.id);

                return (
                  <article
                    key={artwork.id}
                    className="group flex flex-col rounded-2xl bg-[#0f0f0f] overflow-hidden border border-white/[0.08] hover:border-white/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
                  >
                    {/* Artwork Image Container */}
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#181818]">
                      <Link
                        to={`/artworks/${artwork.slug || artwork.id}`}
                        className="block h-full w-full"
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={artwork.title}
                            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-[#202020]" />
                        )}
                      </Link>

                      {/* Top Right Wishlist Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleLike(artwork.id);
                        }}
                        aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
                        className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm text-stone-200 border border-white/10 shadow-sm hover:bg-black/85 hover:scale-110 active:scale-95 transition-all"
                      >
                        <Heart
                          className={`h-4 w-4 ${
                            liked
                              ? "fill-red-500 text-red-500"
                              : "text-white hover:text-white"
                          }`}
                        />
                      </button>

                      {/* Status Badges */}
                      {isSold && (
                        <div className="absolute left-2.5 top-2.5 z-10">
                          <span className="rounded-full bg-black/90 border border-white/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-medium text-white uppercase tracking-wider">
                            Collected
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Artwork Details */}
                    <div className="p-3.5 flex flex-col flex-1 justify-between gap-2">
                      <div>
                        <h3 className="text-[13px] sm:text-[14px] font-semibold text-white truncate group-hover:text-stone-200">
                          <Link to={`/artworks/${artwork.slug || artwork.id}`}>
                            {artwork.title}
                          </Link>
                        </h3>
                        <p className="text-[12px] text-stone-400 truncate mt-0.5">
                          {artist}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                        <span className="text-[13px] font-semibold text-white">
                          ₹{artwork.price?.toLocaleString("en-IN") || "Price on request"}
                        </span>

                        {isSold ? (
                          <span className="text-[11px] font-medium text-stone-500">Sold</span>
                        ) : onCollectArtwork ? (
                          <button
                            onClick={() => onCollectArtwork(artwork)}
                            className="text-[11px] font-semibold text-stone-200 hover:text-white hover:underline"
                          >
                            Collect
                          </button>
                        ) : (
                          <Link
                            to={`/artworks/${artwork.slug || artwork.id}`}
                            className="text-[11px] font-semibold text-stone-200 hover:text-white hover:underline"
                          >
                            View
                          </Link>
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
