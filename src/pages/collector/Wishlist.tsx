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
            profiles (
              full_name
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "/placeholder.svg";
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-[16px] overflow-hidden border border-border-subtle bg-surface-1">
            <div className="aspect-[4/3] bg-surface-2" />
            <div className="p-5 space-y-3">
              <div className="h-4 bg-surface-2 rounded w-3/4" />
              <div className="h-3 bg-surface-2 rounded w-1/2" />
              <div className="flex items-center justify-between pt-4 mt-2 border-t border-border-faint">
                <div className="h-5 bg-surface-2 rounded w-20" />
                <div className="h-8 bg-surface-2 rounded-full w-24" />
              </div>
            </div>
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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-[28px] sm:text-[32px] font-medium text-linen">Wishlist</h1>
        <p className="text-[14px] text-stone">
          {likedItems.length} {likedItems.length === 1 ? 'Saved Item' : 'Saved Items'}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {likedItems.map((item) => {
          const artwork = item.artworks as any;
          if (!artwork) return null;

          const artistName = artwork?.profiles?.full_name || "Unknown Artist";
          const artistId = artwork?.artist_id;

          return (
            <div
              key={item.artwork_id}
              className="group flex flex-col rounded-[16px] border border-border-subtle bg-surface-1 overflow-hidden transition-all duration-300 hover:border-gold/30 hover:shadow-[0_0_30px_rgba(212,175,55,0.08)]"
            >
              {/* Image — fixed aspect ratio keeps all cards same height */}
              <Link
                to={`/artworks/${artwork.slug}`}
                className="relative block aspect-[4/3] bg-surface-2 overflow-hidden shrink-0"
              >
                <img
                  src={getImageUrl(artwork.image_path)}
                  alt={artwork.title}
                  onError={handleImageError}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full px-4 py-2 text-linen text-[13px] font-medium">
                    View Artwork <ExternalLink className="w-4 h-4 shrink-0" />
                  </span>
                </div>
              </Link>

              {/* Details & Actions */}
              <div className="flex flex-col flex-1 p-5">
                <div className="flex-1 mb-4">
                  <h3 className="text-[17px] font-medium text-linen mb-1 line-clamp-2 leading-snug">
                    {artwork.title}
                  </h3>
                  <Link
                    to={`/artists/${artistId}`}
                    className="text-[13px] text-stone hover:text-gold transition-colors inline-block truncate max-w-full"
                  >
                    {artistName}
                  </Link>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border-faint gap-2">
                  <span className="text-[16px] font-medium text-gold shrink-0">
                    {formatCurrency(Number(artwork.price))}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
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
                      className="h-8 rounded-full border-gold text-gold hover:bg-gold hover:text-obsidian px-3"
                      onClick={() => handleAddToCart(item.artwork_id)}
                    >
                      <ShoppingBag className="w-4 h-4 mr-1.5 shrink-0" /> Cart
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
