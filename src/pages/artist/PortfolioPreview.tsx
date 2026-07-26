import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  MapPin, 
  Globe, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Youtube,
  Loader2,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatCurrency } from "@/lib/utils";

const PortfolioPreview = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'artworks' | 'collections' | 'about'>('artworks');

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["artist-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: artworks, isLoading: artworksLoading } = useQuery({
    queryKey: ["artist-artworks-public", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("artist_id", user.id)
        .in("status", ["available", "sold", "reserved"])
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: collections, isLoading: collectionsLoading } = useQuery({
    queryKey: ["artist-collections-public", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("artist_collections")
        .select(`
          *,
          artworks(id, image_path, title)
        `)
        .eq("artist_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (profileLoading || artworksLoading || collectionsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  const socials = profile?.social_links as Record<string, string> || {};
  const hasSocials = !!(socials.instagram || socials.facebook || socials.pinterest || socials.linkedin || socials.youtube || profile?.website);

  return (
    <div className="relative min-h-screen bg-obsidian font-sans">
      {/* Banner / Cover */}
      <div className="relative h-[30vh] sm:h-[45vh] w-full bg-surface-2 overflow-hidden">
        {profile?.cover_image ? (
          <img 
            src={`https://yidpsnjtqofphtwibxdf.supabase.co/storage/v1/object/public/artworks/${profile.cover_image}`} 
            alt="Cover" 
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-3 to-obsidian" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative -mt-32">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row md:items-end gap-6 mb-12">
          <Avatar className="h-32 w-32 sm:h-40 sm:w-40 border-4 border-obsidian bg-surface-3 shadow-2xl">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback className="bg-gold/10 text-gold text-4xl">{profile?.full_name?.charAt(0) || "A"}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3 pb-2">
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-linen">{profile?.full_name || "Artist Name"}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone">
              {(profile?.city || profile?.country) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-gold/70" />
                  {profile.city}{profile.city && profile.country ? ', ' : ''}{profile.country}
                </span>
              )}
              {profile?.years_of_experience && (
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-4 flex items-center justify-center text-gold/70">•</span>
                  {profile.years_of_experience} Years Experience
                </span>
              )}
            </div>
            
            {profile?.bio && (
              <p className="max-w-2xl text-[15px] leading-relaxed text-stone/90 line-clamp-2">
                {profile.bio}
              </p>
            )}
          </div>

          {hasSocials && (
            <div className="flex items-center gap-3 pb-4">
              {profile?.website && (
                <a href={profile.website} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-stone hover:bg-gold hover:text-obsidian transition-colors">
                  <Globe className="h-4 w-4" />
                </a>
              )}
              {socials.instagram && (
                <a href={socials.instagram} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-stone hover:bg-gold hover:text-obsidian transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {socials.facebook && (
                <a href={socials.facebook} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-stone hover:bg-gold hover:text-obsidian transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
              )}
              {socials.linkedin && (
                <a href={socials.linkedin} target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2 text-stone hover:bg-gold hover:text-obsidian transition-colors">
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-8 border-b border-border-faint mb-10 overflow-x-auto no-scrollbar">
          {(['artworks', 'collections', 'about'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-[13px] font-medium uppercase tracking-wider whitespace-nowrap transition-colors relative ${
                activeTab === tab ? "text-linen" : "text-stone hover:text-linen/70"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="pb-24">
          
          {/* Artworks Tab */}
          {activeTab === 'artworks' && (
            <div className="space-y-8">
              {artworks && artworks.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                  {artworks.map((artwork) => (
                    <div key={artwork.id} className="break-inside-avoid group relative block">
                      <div className="relative overflow-hidden bg-surface-2 rounded-[4px]">
                        {artwork.image_path ? (
                          <img 
                            src={`https://yidpsnjtqofphtwibxdf.supabase.co/storage/v1/object/public/artworks/${artwork.image_path}`} 
                            alt={artwork.title}
                            className="w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="aspect-[3/4] w-full bg-surface-3" />
                        )}
                        
                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-obsidian/90 via-obsidian/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex flex-col justify-end p-6">
                          <h3 className="text-lg font-medium text-linen mb-1">{artwork.title}</h3>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-stone">{artwork.medium || 'Artwork'}</p>
                            <p className="text-sm font-medium text-gold">{formatCurrency(artwork.price)}</p>
                          </div>
                        </div>
                        
                        {artwork.status === 'sold' && (
                          <div className="absolute top-4 left-4 bg-obsidian/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] uppercase tracking-wider text-white">
                            Sold
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-stone">No public artworks available.</p>
                </div>
              )}
            </div>
          )}

          {/* Collections Tab */}
          {activeTab === 'collections' && (
            <div className="space-y-12">
              {collections && collections.length > 0 ? (
                <div className="grid gap-10 md:grid-cols-2">
                  {collections.map((collection) => (
                    <div key={collection.id} className="group cursor-pointer">
                      <div className="relative aspect-[16/9] overflow-hidden rounded-[4px] bg-surface-2 mb-4">
                        {collection.cover_image ? (
                          <img 
                            src={`https://yidpsnjtqofphtwibxdf.supabase.co/storage/v1/object/public/artworks/${collection.cover_image}`} 
                            alt={collection.title}
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="h-full w-full bg-surface-3 flex items-center justify-center text-stone">
                            No Cover
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                      </div>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-medium text-linen mb-2 group-hover:text-gold transition-colors">{collection.title}</h3>
                          <p className="text-sm text-stone line-clamp-2 max-w-md">{collection.description}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border-subtle group-hover:border-gold group-hover:bg-gold/10 transition-colors">
                          <ChevronRight className="h-5 w-5 text-stone group-hover:text-gold" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <p className="text-stone">No collections available.</p>
                </div>
              )}
            </div>
          )}

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-10">
                <section>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-gold mb-6">Artist Statement</h3>
                  {profile?.artist_statement ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[16px] leading-relaxed text-linen/90 whitespace-pre-wrap font-serif">
                        {profile.artist_statement}
                      </p>
                    </div>
                  ) : (
                    <p className="text-stone italic">Artist statement not provided.</p>
                  )}
                </section>
                
                <section>
                  <h3 className="text-sm font-medium uppercase tracking-wider text-[#666] mb-6">Biography</h3>
                  {profile?.bio ? (
                    <div className="prose prose-invert max-w-none">
                      <p className="text-[15px] leading-relaxed text-stone whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  ) : (
                    <p className="text-stone italic">Biography not provided.</p>
                  )}
                </section>
              </div>
              
              <div className="space-y-8">
                <div className="rounded-[8px] bg-surface-2 p-6 border border-border-subtle">
                  <h3 className="text-[13px] font-medium text-linen mb-6">Artistic Focus</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#666] mb-3">Mediums</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.mediums && profile.mediums.length > 0 ? (
                          profile.mediums.map((m: string) => (
                            <span key={m} className="rounded-full border border-border-subtle px-3 py-1 text-[12px] text-stone">
                              {m}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-stone/50">-</span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#666] mb-3">Styles</p>
                      <div className="flex flex-wrap gap-2">
                        {profile?.art_styles && profile.art_styles.length > 0 ? (
                          profile.art_styles.map((s: string) => (
                            <span key={s} className="rounded-full border border-border-subtle px-3 py-1 text-[12px] text-stone">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-stone/50">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;
