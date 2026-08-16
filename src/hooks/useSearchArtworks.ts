import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { SearchIndex, SearchIndexQuery, SearchArtwork } from '@/platform/discovery/searchIndex';
import { useCallback, useMemo } from 'react';

export const useSearchArtworks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract params from URL
  const term = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const medium = searchParams.get('medium') || undefined;
  const style = searchParams.get('style') || undefined;
  const minPriceStr = searchParams.get('minPrice');
  const maxPriceStr = searchParams.get('maxPrice');
  const artistId = searchParams.get('artist') || undefined;
  const sortByParam = searchParams.get('sort') || 'newest';
  const pageStr = searchParams.get('page') || '1';
  
  const minPrice = minPriceStr ? Number(minPriceStr) : undefined;
  const maxPrice = maxPriceStr ? Number(maxPriceStr) : undefined;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const limit = 24;
  const offset = (page - 1) * limit;

  // Validate sortBy to match SearchIndexQuery typings
  const sortBy = ['relevance', 'newest', 'price_asc', 'price_desc'].includes(sortByParam) 
    ? (sortByParam as SearchIndexQuery['sortBy']) 
    : 'newest';

  const queryPayload: SearchIndexQuery = useMemo(() => ({
    term,
    filters: {
      category,
      medium,
      style,
      artist_id: artistId,
      min_price: minPrice,
      max_price: maxPrice,
    },
    sortBy,
    limit,
    offset
  }), [term, category, medium, style, artistId, minPrice, maxPrice, sortBy, limit, offset]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search-artworks', queryPayload],
    queryFn: async () => {
      const response = await SearchIndex.queryIndex(queryPayload);
      if (response.error) throw response.error;
      return response.data;
    },
    // Don't refetch on window focus for search to prevent jumping
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  const updateSearch = useCallback((newParams: Record<string, string | null>) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          next.delete(key);
        } else {
          next.set(key, value);
        }
      });
      
      // If we change filters/search term, we should usually reset to page 1
      if (Object.keys(newParams).some(k => k !== 'page')) {
        next.set('page', '1');
      }

      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    updateSearch({
      q: null,
      category: null,
      medium: null,
      style: null,
      minPrice: null,
      maxPrice: null,
      artist: null,
      sort: null,
      page: '1'
    });
  }, [updateSearch]);

  const goToPage = useCallback((newPage: number) => {
    updateSearch({ page: newPage.toString() });
  }, [updateSearch]);

  // If we fetched a full page, there might be more (simple pagination check)
  const hasMore = data ? data.length === limit : false;

  return {
    artworks: data || [],
    isLoading,
    isError,
    error,
    params: {
      term,
      category,
      medium,
      style,
      minPrice,
      maxPrice,
      artistId,
      sortBy,
      page
    },
    updateSearch,
    clearFilters,
    goToPage,
    hasMore,
    isFirstPage: page === 1
  };
};
