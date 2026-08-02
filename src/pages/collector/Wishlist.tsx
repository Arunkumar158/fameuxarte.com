import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: likedItems, isLoading } = useQuery({
    queryKey: ["collector-liked-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("liked_items")
        .select(`
          artwork_id,
          artworks (
            id,
            title,
            artist_id,
            price,
            category,
            image_path,
            slug,
            artists (
              id,
              profiles (
                full_name
              )
            )
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleRemove = async (artworkId: string) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from("liked_items")
        .delete()
        .eq("user_id", user.id)
        .eq("artwork_id", artworkId);

      if (error) throw error;

      toast({
        title: "Removed from Wishlist",
        description: "Artwork has been removed from your wishlist.",
      });

      queryClient.invalidateQueries({ queryKey: ["collector-liked-items"] });
      // Also invalidate globally if there are other usages
      queryClient.invalidateQueries({ queryKey: ["liked-items"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove artwork from wishlist.",
      });
    }
  };

  const handleAddToCart = async (artworkId: string) => {
    await addToCart(artworkId);
  };

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "/placeholder.svg";
    return `https://yexjmqhffxukzomkblqj.supabase.co/storage/v1/object/public/artworks/${path}`;
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

  if (!likedItems || likedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-700">
        <div className="w-48 h-48 mb-8 opacity-50 flex items-center justify-center">
          <Heart className="w-24 h-24 text-gold opacity-50" />
        </div>
        <h2 className="text-[28px] font-medium text-linen mb-3">Your wishlist is empty.</h2>
        <p className="text-stone max-w-md mb-8">Save artworks you love while discovering new pieces to build your collection.</p>
        <Button asChild className="bg-gold text-obsidian hover:bg-linen rounded-full px-8">
          <Link to="/artworks">Discover Artworks</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-medium text-linen">Wishlist</h1>
        <p className="text-[14px] text-stone">{likedItems.length} {likedItems.length === 1 ? 'Saved Item' : 'Saved Items'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {likedItems.map((item) => {
          const artwork = item.artworks as any;
          if (!artwork) return null;
          
          const artistName = artwork?.artists?.profiles?.full_name || "Unknown Artist";
          const artistId = artwork?.artists?.id;

          return (
            <div key={item.artwork_id} className="group flex flex-col rounded-[16px] border border-border-subtle bg-surface-1 overflow-hidden transition-all hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.05)]">
              {/* Image */}
              <Link to={`/artworks/${artwork.slug}`} className="relative block aspect-[4/3] bg-surface-2 overflow-hidden">
                <img 
                  src={getImageUrl(artwork.image_path)} 
                  alt={artwork.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 text-linen text-[13px] font-medium">
                    View Artwork <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </Link>

              {/* Details & Actions */}
              <div className="p-5 flex flex-col flex-1">
                <div className="mb-4">
                  <h3 className="text-[18px] font-medium text-linen mb-1 truncate">{artwork.title}</h3>
                  <Link to={`/artists/${artistId}`} className="text-[13px] text-stone hover:text-gold transition-colors inline-block truncate max-w-full">
                    {artistName}
                  </Link>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-faint">
                  <span className="text-[16px] font-medium text-gold">
                    {formatCurrency(Number(artwork.price))}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-stone hover:text-destructive hover:bg-destructive/10 h-8 w-8 rounded-full"
                      onClick={() => handleRemove(item.artwork_id)}
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full border-gold text-gold hover:bg-gold hover:text-obsidian px-4"
                      onClick={() => handleAddToCart(item.artwork_id)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-2" /> Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Wishlist;
