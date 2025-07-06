
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useLikedItems = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [likedCount, setLikedCount] = useState(0);

  // Fetch liked items from Supabase
  const { data: likedItems, isLoading } = useQuery({
    queryKey: ["liked-items", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("liked_items")
        .select(`
          id,
          artwork_id,
          artworks (
            id,
            title,
            artist_id,
            price,
            category,
            image_path,
            slug
          )
        `)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user
  });

  // Update liked count whenever the liked items change
  useEffect(() => {
    if (likedItems) {
      setLikedCount(likedItems.length);
    }
  }, [likedItems]);

  // Check if an item is liked
  const isItemLiked = (artworkId: string | number) => {
    if (!likedItems) return false;
    return likedItems.some(item => item.artwork_id === artworkId.toString());
  };

  // Toggle like status
  const toggleLike = async (artworkId: string | number) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like items",
        variant: "destructive"
      });
      return;
    }

    try {
      const isLiked = isItemLiked(artworkId);
      
      if (isLiked) {
        await supabase
          .from("liked_items")
          .delete()
          .eq("artwork_id", artworkId.toString())
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("liked_items")
          .insert({
            artwork_id: artworkId.toString(),
            user_id: user.id
          });
      }
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["artwork-liked"] });
      queryClient.invalidateQueries({ queryKey: ["liked-items"] });
      
      toast({
        title: isLiked ? "Removed from likes" : "Added to likes",
        description: `Item has been ${isLiked ? "removed from" : "added to"} your likes`,
      });
      
      return !isLiked;
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update likes",
        variant: "destructive"
      });
      return isItemLiked(artworkId);
    }
  };

  return {
    likedItems,
    likedCount,
    isLoading,
    isItemLiked,
    toggleLike
  };
};
