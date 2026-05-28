import { Link, useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, ExternalLink, Palette, ShieldCheck } from "lucide-react";
import HomeNav from "@/components/home/HomeNav";
import MainLayout from "@/components/layouts/MainLayout";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/shared/Price";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { getGalleryImages } from "@/lib/utils";
import { useArtworkImages } from "@/hooks/useArtworkImages";

interface ArtistProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

interface ArtistData {
  id: string;
  profile_id: string | null;
  bio: string | null;
  specialty: string | null;
  website: string | null;
  social_media: Record<string, unknown> | null;
  profile: ArtistProfile | null;
}

interface ArtworkData {
  id: string;
  title: string;
  price: number;
  description: string | null;
  category: string | null;
  image_path: string | null;
  images: string[] | null;
  slug: string | null;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const ArtistArtworkCard = ({
  artwork,
  artistName,
  collected = false,
}: {
  artwork: ArtworkData;
  artistName: string;
  collected?: boolean;
}) => {
  const imagePaths = getGalleryImages(artwork);
  const { primaryImage } = useArtworkImages(imagePaths);

  return (
    <article className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2 transition-all hover:border-gold/30">
      <Link to={`/artworks/${artwork.slug || artwork.id}`} className="group block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={primaryImage}
            alt={`${artwork.title} by ${artistName}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.src = "/placeholder.svg";
            }}
          />
          <div className="absolute left-3 top-3 flex gap-2">
            <span className="rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.9)] px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-white backdrop-blur-sm">
              Verified
            </span>
            {collected && (
              <span className="rounded-full border border-[rgba(201,169,110,0.35)] bg-black/75 px-2 py-1 text-[9px] uppercase tracking-[0.08em] text-gold backdrop-blur-sm">
                Collected
              </span>
            )}
          </div>
        </div>
        <div className="p-4">
          <h3 className="mb-1 line-clamp-1 text-[14px] font-medium text-linen transition-colors group-hover:text-gold">
            {artwork.title}
          </h3>
          <p className="mb-3 text-[12px] text-[#666]">{artwork.category || "Original artwork"}</p>
          <div className="text-[14px] font-medium text-linen">
            <Price amount={artwork.price} />
          </div>
        </div>
      </Link>
    </article>
  );
};

const ArtistDetails = () => {
  const { artistId } = useParams();
  const navigate = useNavigate();

  const {
    data: artist,
    isLoading: artistLoading,
    error: artistError,
  } = useQuery({
    queryKey: ["artist", artistId],
    queryFn: async () => {
      if (!artistId) throw new Error("No artist identifier provided");

      const { data, error } = await supabase
        .from("artists")
        .select(
          `
          id,
          profile_id,
          bio,
          specialty,
          website,
          social_media,
          profile:profiles!artists_profile_id_fkey (
            id,
            full_name,
            avatar_url
          )
        `
        )
        .eq("id", artistId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Artist not found");

      return data as ArtistData;
    },
    enabled: Boolean(artistId),
  });

  const profileId = artist?.profile_id || artist?.profile?.id || null;
  const artistName = artist?.profile?.full_name || "Verified Artist";

  const {
    data: works = [],
    isLoading: worksLoading,
  } = useQuery({
    queryKey: ["artist-works", profileId],
    queryFn: async () => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("artworks")
        .select("id,title,price,description,category,image_path,images,slug")
        .eq("artist_id", profileId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []) as ArtworkData[];
    },
    enabled: Boolean(profileId),
  });

  const { data: collectedIds = [] } = useQuery({
    queryKey: ["artist-collected-ids", works.map((work) => work.id).join(",")],
    queryFn: async () => {
      if (works.length === 0) return [];

      const { data, error } = await supabase
        .from("order_items")
        .select("artwork_id")
        .in(
          "artwork_id",
          works.map((work) => work.id)
        );

      if (error) {
        console.warn("Unable to load collected artworks:", error);
        return [];
      }

      return Array.from(new Set((data || []).map((item) => item.artwork_id)));
    },
    enabled: works.length > 0,
  });

  if (artistLoading || worksLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-obsidian">
          <HomeNav />
          <div className="mx-auto max-w-6xl px-6 py-14">
            <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
              <div className="h-[420px] rounded-[10px] border border-border-subtle bg-surface-2" />
              <div className="space-y-5 pt-4">
                <div className="h-8 w-52 rounded bg-surface-2" />
                <div className="h-20 w-4/5 rounded bg-surface-2" />
                <div className="h-40 w-full rounded bg-surface-2" />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (artistError || !artist) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-obsidian">
          <HomeNav />
          <div className="mx-auto max-w-xl px-6 py-24 text-center">
            <h1 className="mb-3 text-[32px] font-medium tracking-[-0.025em] text-linen">Artist not found</h1>
            <p className="mb-7 text-[14px] leading-[1.75] text-[#666]">
              The artist profile you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/artists")} className="bg-linen text-obsidian hover:bg-gold">
              Browse artists
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const avatarUrl = artist.profile?.avatar_url;
  const fullStory =
    artist.bio ||
    `${artistName} is a verified Fameuxarte artist. Their practice is represented through original works selected for collectors who value authenticity, story, and craft.`;
  const collectedWorks = works.filter((work) => collectedIds.includes(work.id));

  return (
    <MainLayout>
      <SEO
        title={`${artistName} | Artist Profile | Fameuxarte`}
        description={fullStory.slice(0, 155)}
        canonicalUrl={`/artists/${artist.id}`}
        ogImage={avatarUrl || undefined}
        type="website"
      />

      <div className="min-h-screen bg-obsidian text-linen">
        <HomeNav />

        <section className="border-t border-border-faint px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <Link to="/artists" className="inline-flex items-center gap-2 text-[12px] text-[#666] transition-colors hover:text-gold">
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Back to artists
            </Link>
          </div>
        </section>

        <section className="px-6 pb-12 pt-2">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-[320px_1fr] lg:gap-14">
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="overflow-hidden rounded-[10px] border border-border-subtle bg-surface-2">
                <div className="aspect-[4/5] bg-[#151515]">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={artistName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#1a2a1a] text-[52px] font-medium text-verified">
                      {getInitials(artistName)}
                    </div>
                  )}
                </div>
                <div className="space-y-4 p-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(74,157,111,0.3)] bg-[rgba(74,157,111,0.15)] px-3 py-[6px] text-[11px] uppercase tracking-[0.12em] text-verified">
                    <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Verified artist
                  </div>
                  <div className="grid grid-cols-2 gap-3 border-t border-border-faint pt-4">
                    <div>
                      <div className="text-[11px] text-[#555]">Works</div>
                      <div className="text-[18px] font-medium text-linen">{works.length}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-[#555]">Collected</div>
                      <div className="text-[18px] font-medium text-linen">{collectedWorks.length}</div>
                    </div>
                  </div>
                  {artist.website && (
                    <a
                      href={artist.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-border-subtle px-4 py-3 text-[13px] text-[#aaa] transition-colors hover:border-gold/40 hover:text-gold"
                    >
                      Website
                      <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </div>
            </aside>

            <div>
              <div className="border-b border-border-faint pb-8">
                <div className="mb-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(201,169,110,0.25)] bg-[rgba(201,169,110,0.1)] px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-gold">
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                    ArtGuard vetted
                  </span>
                  {artist.specialty && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border-subtle bg-surface-2 px-3 py-[6px] text-[11px] font-medium uppercase tracking-[0.12em] text-[#aaa]">
                      <Palette className="h-3.5 w-3.5" aria-hidden="true" />
                      {artist.specialty}
                    </span>
                  )}
                </div>
                <h1 className="mb-4 text-[44px] font-medium leading-[1.02] tracking-[-0.035em] text-linen sm:text-[58px]">
                  {artistName}
                </h1>
                <p className="max-w-3xl text-[16px] leading-[1.8] text-[#888]">
                  {artist.specialty || "Contemporary artist"} represented through Fameuxarte's curated artist network.
                </p>
              </div>

              <section className="border-b border-border-faint py-8">
                <h2 className="mb-4 text-[22px] font-medium tracking-[-0.02em] text-linen">Full story</h2>
                <p className="max-w-3xl whitespace-pre-line text-[15px] leading-[1.85] text-[#b8b8b8]">{fullStory}</p>
              </section>

              <section className="border-b border-border-faint py-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-medium tracking-[-0.02em] text-linen">Works</h2>
                    <p className="mt-1 text-[13px] text-[#666]">Original artworks currently connected to this artist.</p>
                  </div>
                  <div className="text-[12px] text-[#555]">{works.length} works</div>
                </div>
                {works.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {works.map((work) => (
                      <ArtistArtworkCard key={work.id} artwork={work} artistName={artistName} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-border-subtle bg-surface-2 p-6 text-[14px] text-[#666]">
                    No artworks are linked to this artist yet.
                  </div>
                )}
              </section>

              <section className="py-8">
                <div className="mb-5 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-[22px] font-medium tracking-[-0.02em] text-linen">Collected arts</h2>
                    <p className="mt-1 text-[13px] text-[#666]">Works from this artist that have appeared in collector orders.</p>
                  </div>
                  <div className="text-[12px] text-[#555]">{collectedWorks.length} collected</div>
                </div>
                {collectedWorks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {collectedWorks.map((work) => (
                      <ArtistArtworkCard key={work.id} artwork={work} artistName={artistName} collected />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-[10px] border border-border-subtle bg-surface-2 p-6 text-[14px] text-[#666]">
                    No collected artworks are recorded for this artist yet.
                  </div>
                )}
              </section>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ArtistDetails;
