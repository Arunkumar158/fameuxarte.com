import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Download, Share2, ShieldCheck, Eye, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Collection = () => {
  const { user } = useAuth();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collector-collection", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select(`
          created_at,
          order_items (
            id,
            artwork_id,
            artworks (
              id,
              title,
              slug,
              image_path,
              artists (
                profiles (
                  full_name
                )
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      const { data: certificates } = await supabase
        .from("certificates")
        .select("artwork_id, file_path")
        .eq("collector_id", user.id);

      const certMap = new Map(certificates?.map((c) => [c.artwork_id, c.file_path]) || []);

      const items = orders?.flatMap(order => 
        (order.order_items || []).map(item => ({
          ...item,
          purchase_date: order.created_at,
          certificate_path: certMap.get(item.artwork_id),
        }))
      ) || [];

      // Filter out invalid items just in case
      return items.filter(item => item.artworks);
    },
    enabled: !!user,
  });

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(dateString));
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg";
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/artworks/${path}`;
  };

  const getCertUrl = (path: string) => {
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/certificates/${path}`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse space-y-4">
            <div className="aspect-[3/4] bg-surface-2 rounded-[12px]"></div>
            <div className="h-4 bg-surface-2 rounded w-2/3"></div>
            <div className="h-3 bg-surface-2 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!collection || collection.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-48 h-48 mb-8 opacity-50">
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="40" width="120" height="150" stroke="#D4AF37" strokeWidth="2" strokeDasharray="4 4" />
            <path d="M60 120 L100 80 L140 120" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="120" cy="70" r="10" stroke="#D4AF37" strokeWidth="2" />
          </svg>
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">Your collection is waiting.</h2>
        <p className="text-stone max-w-md mb-8">Original art deserves a home. Begin acquiring unique pieces to build your personal gallery.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artworks">Explore Gallery</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">My Collection</h1>
        <p className="text-[14px] text-stone">{collection.length} {collection.length === 1 ? 'Artwork' : 'Artworks'}</p>
      </div>

      <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
        {collection.map((item) => {
          // Type casting since we know the structure from the query
          const artwork = item.artworks as any;
          const artistName = artwork?.artists?.profiles?.full_name || "Unknown Artist";

          return (
            <div key={item.id} className="group relative break-inside-avoid overflow-hidden rounded-[16px] bg-surface-1 border border-border-subtle transition-all hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.1)]">
              {/* Image Section */}
              <div className="relative w-full overflow-hidden bg-surface-2 aspect-auto">
                <img 
                  src={getImageUrl(artwork.image_path)} 
                  alt={artwork.title}
                  className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100 flex flex-col items-center justify-center gap-4">
                  <Button asChild variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian w-48 rounded-full">
                    <Link to={`/artworks/${artwork.slug}`}>
                      <Eye className="w-4 h-4 mr-2" /> View Artwork
                    </Link>
                  </Button>
                  
                  {item.certificate_path && (
                    <Button asChild variant="outline" className="border-border-subtle text-linen hover:bg-surface-3 hover:text-linen w-48 rounded-full">
                      <a href={getCertUrl(item.certificate_path)} target="_blank" rel="noreferrer">
                        <Download className="w-4 h-4 mr-2" /> Download Cert
                      </a>
                    </Button>
                  )}
                  
                  <Button variant="ghost" className="text-stone hover:text-linen">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                  </Button>
                </div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="inline-flex items-center rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold border border-gold/20">
                    <ShieldCheck className="w-3 h-3 mr-1" /> Authentic
                  </span>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-[18px] font-medium text-linen leading-tight mb-1">{artwork.title}</h3>
                    <p className="text-[13px] text-stone">{artistName}</p>
                  </div>
                  <Link to={`/artworks/${artwork.slug}`} className="text-stone hover:text-gold transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border-faint flex items-center justify-between text-[11px] uppercase tracking-wider">
                  <span className="text-[#666]">Acquired</span>
                  <span className="text-linen font-medium">{formatDate(item.purchase_date)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Collection;
