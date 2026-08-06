import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaxonomyLink {
  type: string;
  label: string;
  url: string;
}

export interface KnowledgeGraphResult {
  artworks: any[];
  artists: any[];
  collections: any[];
  insights: any[];
  taxonomies: TaxonomyLink[];
  isLoading: boolean;
}

export function useKnowledgeGraph(
  insightId: string | undefined,
  tags: string[],
  keywords: string[],
  category: string | undefined
): KnowledgeGraphResult {
  
  // Create a unified list of keywords for searching
  const searchTerms = Array.from(new Set([...tags, ...keywords, category].filter(Boolean) as string[]));
  
  const { data: artworks = [], isLoading: isLoadingArtworks } = useQuery({
    queryKey: ["kg-artworks", searchTerms],
    queryFn: async () => {
      if (!searchTerms.length) return [];
      
      const { data, error } = await supabase
        .from("artworks")
        .select("id, title, slug, image_path, price, artist_id, category")
        .eq("status", "available")
        .limit(4);
        
      if (error) {
        console.error("Error fetching related artworks:", error);
        return [];
      }
      return data || [];
    },
    enabled: searchTerms.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: artists = [], isLoading: isLoadingArtists } = useQuery({
    queryKey: ["kg-artists", searchTerms],
    queryFn: async () => {
      if (!searchTerms.length) return [];
      
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, verification_status")
        .eq("role", "artist")
        .limit(3);
        
      if (error) {
        console.error("Error fetching related artists:", error);
        return [];
      }
      return data || [];
    },
    enabled: searchTerms.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  const { data: insights = [], isLoading: isLoadingInsights } = useQuery({
    queryKey: ["kg-related-blogs", insightId, searchTerms],
    queryFn: async () => {
      if (!searchTerms.length) return [];
      
      let query = supabase
        .from("blogs")
        .select("id, title, Slug, image_url, content, published_at, category")
        .order("published_at", { ascending: false })
        .limit(3);
        
      // Exclude the current article
      if (insightId) {
        query = query.neq("id", insightId);
      }
      
      const { data, error } = await query;
      if (error) return [];

      // Normalize to the shape DiscoveryHub expects
      return (data || []).map((row: any) => ({
        id: row.id,
        title: row.title || "",
        slug: row.Slug || row.id,
        featured_image: row.image_url || null,
        excerpt: row.content?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().substring(0, 120) + "..." || "",
        published_at: row.published_at,
        category: row.category || "Art Intelligence",
      }));
    },
    enabled: searchTerms.length > 0,
    staleTime: 1000 * 60 * 5,
  });

  // Extract taxonomy links dynamically from the tags and keywords
  const taxonomies: TaxonomyLink[] = [];
  
  searchTerms.forEach(term => {
    const lower = term.toLowerCase();
    const slug = lower.replace(/[^a-z0-9]+/g, '-');
    
    if (["acrylic", "oil", "watercolor", "canvas", "bronze"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "Medium", label: term, url: `/artworks/medium/${slug}` });
    } else if (["abstract", "modern", "contemporary", "surrealism", "landscape"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "Style", label: term, url: `/artworks/style/${slug}` });
    } else if (["painting", "sculpture", "photography", "drawing"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "Category", label: term, url: `/artworks/category/${slug}` });
    } else if (["paris", "new york", "london", "berlin", "rome"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "City", label: term, url: `/artists/city/${slug}` });
    } else if (["france", "usa", "uk", "germany", "italy", "india"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "Country", label: term, url: `/artists/country/${slug}` });
    } else if (["portrait", "nature", "urban", "figurative"].some(m => lower.includes(m))) {
      taxonomies.push({ type: "Subject", label: term, url: `/artworks/subject/${slug}` });
    } else {
      taxonomies.push({ type: "Topic", label: term, url: `/artworks?q=${slug}` });
    }
  });

  const uniqueTaxonomies = taxonomies.filter((v, i, a) => a.findIndex(t => t.url === v.url) === i).slice(0, 8);

  return {
    artworks,
    artists,
    collections: [], // Placeholder since there is no collection table yet
    insights,
    taxonomies: uniqueTaxonomies,
    isLoading: isLoadingArtworks || isLoadingArtists || isLoadingInsights,
  };
}
