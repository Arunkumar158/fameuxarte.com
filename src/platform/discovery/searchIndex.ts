import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Artwork = Database["public"]["Tables"]["artworks"]["Row"];
type Artist = Database["public"]["Tables"]["profiles"]["Row"];

export type SearchArtwork = Artwork & {
  artist?: Pick<Artist, "id" | "full_name">;
};

export interface SearchIndexQuery {
  term: string;
  filters?: {
    category?: string;
    medium?: string;
    style?: string;
    artist_id?: string;
    min_price?: number;
    max_price?: number;
  };
  sortBy?: "relevance" | "newest" | "price_asc" | "price_desc";
  limit?: number;
  offset?: number;
}

export class SearchIndex {
  /**
   * Executes a robust search utilizing the custom PostgreSQL RPC function
   * `search_artworks` which includes full-text search and faceted filtering.
   */
  public static async queryIndex(query: SearchIndexQuery): Promise<{ data: SearchArtwork[], error: any }> {
    console.log('[Discovery SearchIndex] Query executed:', query);
    
    try {
      const sb = supabase as any;
      const { data, error } = await sb.rpc('search_artworks', {
        search_term: query.term || null,
        category_filter: query.filters?.category || null,
        medium_filter: query.filters?.medium || null,
        style_filter: query.filters?.style || null,
        artist_filter: query.filters?.artist_id || null,
        min_price: query.filters?.min_price || null,
        max_price: query.filters?.max_price || null,
        sort_by: query.sortBy || 'newest',
        p_limit: query.limit || 20,
        p_offset: query.offset || 0,
      }).select('*, artist:profiles(id, full_name)');

      if (error) {
        console.error('[Discovery SearchIndex] Supabase RPC error:', error);
        return { data: [], error };
      }

      return { data: data as unknown as SearchArtwork[], error: null };
    } catch (error) {
      console.error('[Discovery SearchIndex] Unexpected error:', error);
      return { data: [], error };
    }
  }
}
