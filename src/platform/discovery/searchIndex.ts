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
   * Executes a search using standard Supabase query chaining.
   * Supports full-text search via ilike, faceted filtering, sorting, and pagination.
   */
  public static async queryIndex(query: SearchIndexQuery): Promise<{ data: SearchArtwork[], error: any }> {
    try {
      const limit = query.limit ?? 20;
      const offset = query.offset ?? 0;

      let q = supabase
        .from('artworks')
        .select('*, artist:profiles!artworks_artist_id_fkey(id, full_name)')
        .in('status', ['available', 'reserved', 'sold'])
        .range(offset, offset + limit - 1);

      // Full-text term search across title and description
      if (query.term) {
        q = q.or(`title.ilike.%${query.term}%,description.ilike.%${query.term}%`);
      }

      // Faceted filters
      if (query.filters?.category) q = q.eq('category', query.filters.category);
      if (query.filters?.medium)   q = q.eq('medium', query.filters.medium);
      if (query.filters?.style)    q = q.eq('style', query.filters.style);
      if (query.filters?.artist_id) q = q.eq('artist_id', query.filters.artist_id);
      if (query.filters?.min_price != null) q = q.gte('price', query.filters.min_price);
      if (query.filters?.max_price != null) q = q.lte('price', query.filters.max_price);

      // Sorting
      switch (query.sortBy) {
        case 'price_asc':  q = q.order('price', { ascending: true });  break;
        case 'price_desc': q = q.order('price', { ascending: false }); break;
        case 'newest':
        default:           q = q.order('created_at', { ascending: false }); break;
      }

      const { data, error } = await q;

      if (error) return { data: [], error };
      return { data: (data ?? []) as unknown as SearchArtwork[], error: null };
    } catch (error) {
      return { data: [], error };
    }
  }
}
