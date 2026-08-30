import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DiscoveryEntity } from "@/lib/discovery/registry";
import ArtworkCard from "@/components/shared/ArtworkCard";

type Artwork = React.ComponentProps<typeof ArtworkCard>['artwork'];

const getDisplayImage = (imagePath?: string | null) => {
  if (!imagePath) return "/placeholder.svg";
  const clean = imagePath.trim();
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }
  if (clean.startsWith("/")) {
    return clean;
  }
  const relativePath = clean.replace(/^artworks\//, "");
  return `https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${relativePath}`;
};

export const useDiscoveryArtworks = (entity?: DiscoveryEntity) => {
  return useQuery({
    queryKey: ["discovery-artworks", entity?.slug, entity?.type],
    enabled: !!entity,
    queryFn: async () => {
      if (!entity) return [];

      let query = supabase
        .from("artworks")
        .select(`
          id,
          title,
          price,
          category,
          description,
          image_path,
          slug,
          status,
          artist:profiles!artworks_artist_id_fkey (
            id,
            full_name
          )
        `)
        .eq("status", "available")
        .order("created_at", { ascending: false })
        .limit(12);

      // Programmatic filtering based on entity type
      if (entity.type === 'category') {
        query = query.ilike("category", `%${entity.title}%`);
      } else if (entity.type === 'style') {
        // Fallback to searching title/description for style
        query = query.or(`title.ilike.%${entity.title}%,description.ilike.%${entity.title}%`);
      } else if (entity.type === 'medium') {
        query = query.or(`title.ilike.%${entity.title}%,description.ilike.%${entity.title}%`);
      } else if (entity.type === 'subject') {
        query = query.or(`title.ilike.%${entity.title}%,description.ilike.%${entity.title}%`);
      } else if (entity.type === 'color') {
        query = query.or(`title.ilike.%${entity.title}%,description.ilike.%${entity.title}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Map to Artwork type expected by ArtworkCard
      return (data || []).map((artwork: any) => ({
        id: artwork.slug || artwork.id,
        title: artwork.title,
        artist: artwork.artist?.full_name || "Unknown Artist",
        artistId: artwork.artist?.id,
        image: getDisplayImage(artwork.image_path),
        price: artwork.price,
        currency: "INR",
        medium: artwork.category || "Original artwork",
        verified: true,
        available: true,
        stock: 1,
        slug: artwork.slug
      })) as Artwork[];
    }
  });
};

export const useDiscoveryRecommendations = (entity?: DiscoveryEntity) => {
  // We can return static recommendations from the registry for internal linking network
  // In a real app, this might fetch from a recommendation engine API
  return {
    relatedCollections: entity?.relatedCollections || [],
    relatedCategories: entity?.relatedCategories || [],
    relatedStyles: entity?.relatedStyles || [],
    relatedMediums: entity?.relatedMediums || [],
    relatedSubjects: entity?.relatedSubjects || [],
    relatedColors: entity?.relatedColors || [],
    relatedLocations: entity?.relatedLocations || [],
  };
};
