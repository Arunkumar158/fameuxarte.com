import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Bookmark } from "lucide-react";
import { useKnowledgeGraph, TaxonomyLink } from "@/hooks/useKnowledgeGraph";

export interface DiscoveryHubProps {
  insightId?: string;
  tags?: string[];
  keywords?: string[];
  category?: string;
}

export const DiscoveryHub = ({ insightId, tags = [], keywords = [], category }: DiscoveryHubProps) => {
  const { artworks, artists, insights, taxonomies, isLoading } = useKnowledgeGraph(
    insightId,
    tags,
    keywords,
    category
  );

  if (isLoading) {
    return (
      <div className="py-16 border-t border-border-subtle animate-pulse">
        <div className="h-8 bg-surface-2 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-surface-2 rounded-lg" />)}
        </div>
      </div>
    );
  }

  // Only render if we have something to show
  if (!artworks.length && !artists.length && !insights.length && !taxonomies.length) {
    return null;
  }

  return (
    <section className="py-16 border-t border-border-subtle mt-16" id="discovery-hub">
      <div className="mb-12">
        <h2 className="text-3xl font-serif text-linen mb-4 tracking-tight">Discovery Hub</h2>
        <p className="text-[#888] font-sans">Continue exploring related topics and original works on Fameuxarte.</p>
      </div>

      <div className="space-y-16">
        {/* Continue Exploring (Taxonomies) */}
        {taxonomies.length > 0 && (
          <div>
            <h3 className="text-xl font-medium text-linen mb-6 flex items-center">
              Continue Exploring <ArrowRight className="w-4 h-4 ml-2 text-gold" />
            </h3>
            <div className="flex flex-wrap gap-3">
              {taxonomies.map((tax, i) => (
                <Link
                  key={i}
                  to={tax.url}
                  className="px-4 py-2 rounded-full border border-border-subtle hover:border-gold hover:text-gold text-sm text-linen transition-colors flex items-center group"
                >
                  <span className="text-xs text-[#666] mr-2 uppercase tracking-wider group-hover:text-gold/70">{tax.type}</span>
                  {tax.label}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Featured Artworks */}
        {artworks.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-medium text-linen">Featured Artworks</h3>
              <Link to="/artworks" className="text-sm text-gold hover:underline flex items-center">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {artworks.map((artwork: any) => (
                <Link key={artwork.id} to={`/artworks/${artwork.slug || artwork.id}`} className="group block">
                  <div className="aspect-[3/4] overflow-hidden rounded-lg mb-3 bg-surface-2">
                    <img 
                      src={artwork.image_path || "/placeholder.svg"} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                    />
                  </div>
                  <h4 className="text-linen font-medium truncate">{artwork.title}</h4>
                  <p className="text-sm text-[#888] truncate">{artwork.category}</p>
                  <p className="text-sm text-gold mt-1">${artwork.price?.toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Meet the Artists */}
        {artists.length > 0 && (
          <div>
            <div className="flex justify-between items-end mb-6">
              <h3 className="text-xl font-medium text-linen">Meet the Artists</h3>
              <Link to="/artists" className="text-sm text-gold hover:underline flex items-center">
                View directory <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {artists.map((artist: any) => (
                <Link key={artist.id} to={`/artists/${artist.id}`} className="group flex items-center gap-4 p-4 rounded-xl border border-border-subtle hover:border-gold/50 bg-surface-2/30 transition-colors">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-surface-3">
                    <img 
                      src={artist.avatar_url || "/placeholder.svg"} 
                      alt={artist.full_name} 
                      className="w-full h-full object-cover" 
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <h4 className="text-linen font-medium group-hover:text-gold transition-colors">{artist.full_name}</h4>
                    {artist.verification_status === "verified" && (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-500 font-medium">Verified Artist</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* More Guides */}
        {insights.length > 0 && (
          <div>
            <h3 className="text-xl font-medium text-linen mb-6">More from the Journal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {insights.map((insight: any) => (
                <Link key={insight.id} to={`/blog/${insight.slug || insight.id}`} className="group block h-full flex flex-col">
                  <div className="aspect-[16/9] overflow-hidden rounded-lg mb-4 bg-surface-2 relative">
                    <img 
                      src={insight.featured_image || "/placeholder.svg"} 
                      alt={insight.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="lazy"
                    />
                    {insight.category && (
                      <span className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-xs text-white rounded font-medium tracking-wide">
                        {insight.category}
                      </span>
                    )}
                  </div>
                  <h4 className="text-linen font-serif text-lg leading-snug group-hover:text-gold transition-colors line-clamp-2 mb-2">{insight.title}</h4>
                  <p className="text-sm text-[#888] line-clamp-2 mt-auto">{insight.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
