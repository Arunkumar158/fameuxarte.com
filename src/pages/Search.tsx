import React, { useState, useEffect } from 'react';
import { useSearchArtworks } from '@/hooks/useSearchArtworks';
import HomeNav from '@/components/home/HomeNav';
import ArtworksGrid from '@/components/artworks/ArtworksGrid';
import type { Artwork } from '@/components/artworks/ArtworkCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';

const getDisplayImage = (imagePath?: string | null) => {
  if (!imagePath) return "/placeholder.svg";
  if (imagePath.startsWith("/") || imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `https://oqslvwynlppuacdrhlxl.supabase.co/storage/v1/object/public/artworks/${imagePath}`;
};

const CATEGORIES = ["Painting", "Sculpture", "Photography", "Digital Art", "Drawing", "Mixed Media"];
const MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Bronze", "Wood", "Canvas", "Paper"];
const STYLES = ["Abstract", "Realism", "Impressionism", "Surrealism", "Pop Art", "Minimalism"];

const Search = () => {
  const { 
    artworks, 
    isLoading, 
    params, 
    updateSearch, 
    clearFilters, 
    goToPage, 
    hasMore 
  } = useSearchArtworks();

  const [searchTerm, setSearchTerm] = useState(params.term || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  useEffect(() => {
    if (debouncedSearchTerm !== params.term) {
      updateSearch({ q: debouncedSearchTerm });
    }
  }, [debouncedSearchTerm, params.term, updateSearch]);

  const mappedArtworks: Artwork[] = artworks.map((artwork: any) => ({
    id: artwork.slug || artwork.id,
    title: artwork.title,
    artist: artwork.artist?.full_name || "Unknown Artist",
    artistId: artwork.artist?.id,
    image: getDisplayImage(artwork.image_path),
    price: artwork.price,
    currency: "INR",
    medium: artwork.category || "Original artwork",
    verified: true,
    available: artwork.status === 'available',
    stock: 1,
  }));

  const handleFilterChange = (key: string, value: string) => {
    updateSearch({ [key]: params[key as keyof typeof params] === value ? null : value });
  };

  const activeFiltersCount = Object.entries(params).filter(([k, v]) => 
    k !== 'term' && k !== 'page' && k !== 'sortBy' && v !== null && v !== undefined && v !== ''
  ).length;

  return (
    <div className="min-h-screen bg-obsidian text-linen flex flex-col">
      <div className="[&_nav>div:nth-child(2)_a[href='/search']]:text-gold">
        <HomeNav />
      </div>
      
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium tracking-tight mb-6">Search Artworks</h1>
          
          {/* Search Bar & Mobile Filter Toggle */}
          <div className="flex gap-4">
            <div className="relative flex-grow max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-stone" />
              </div>
              <Input
                type="text"
                placeholder="Search by title, artist, medium, style..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-surface-1 border-border-subtle h-12 text-base w-full focus-visible:ring-gold"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone hover:text-linen"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <Button 
              variant="outline" 
              className="md:hidden h-12 px-4 border-border-subtle bg-surface-1 text-stone hover:text-gold"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="h-5 w-5 mr-2" />
              Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`md:w-64 shrink-0 ${showMobileFilters ? 'block' : 'hidden'} md:block`}>
            <div className="sticky top-24 space-y-8 bg-surface-1 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none border md:border-none border-border-subtle z-10 md:z-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">Filters</h2>
                {activeFiltersCount > 0 && (
                  <button onClick={clearFilters} className="text-sm text-gold hover:underline">
                    Clear all
                  </button>
                )}
              </div>

              {/* Sort By */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone uppercase tracking-wider">Sort By</h3>
                <select 
                  className="w-full bg-surface-2 border border-border-subtle rounded-md px-3 py-2 text-sm focus:outline-none focus:border-gold text-linen"
                  value={params.sortBy}
                  onChange={(e) => updateSearch({ sort: e.target.value })}
                >
                  <option value="relevance">Relevance</option>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone uppercase tracking-wider">Price (INR)</h3>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    placeholder="Min" 
                    className="bg-surface-2 border-border-subtle text-sm h-9 text-linen"
                    value={params.minPrice || ''}
                    onChange={(e) => updateSearch({ minPrice: e.target.value || null })}
                  />
                  <span className="text-stone">-</span>
                  <Input 
                    type="number" 
                    placeholder="Max" 
                    className="bg-surface-2 border-border-subtle text-sm h-9 text-linen"
                    value={params.maxPrice || ''}
                    onChange={(e) => updateSearch({ maxPrice: e.target.value || null })}
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone uppercase tracking-wider">Category</h3>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map(category => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={params.category === category}
                        onChange={() => handleFilterChange('category', category)}
                        className="rounded border-border-subtle bg-surface-2 accent-gold h-4 w-4"
                      />
                      <span className={`text-sm group-hover:text-gold transition-colors ${params.category === category ? 'text-gold' : 'text-linen'}`}>
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mediums */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone uppercase tracking-wider">Medium</h3>
                <div className="flex flex-col gap-2">
                  {MEDIUMS.map(medium => (
                    <label key={medium} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={params.medium === medium}
                        onChange={() => handleFilterChange('medium', medium)}
                        className="rounded border-border-subtle bg-surface-2 accent-gold h-4 w-4"
                      />
                      <span className={`text-sm group-hover:text-gold transition-colors ${params.medium === medium ? 'text-gold' : 'text-linen'}`}>
                        {medium}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Styles */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-stone uppercase tracking-wider">Style</h3>
                <div className="flex flex-col gap-2">
                  {STYLES.map(style => (
                    <label key={style} className="flex items-center gap-2 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={params.style === style}
                        onChange={() => handleFilterChange('style', style)}
                        className="rounded border-border-subtle bg-surface-2 accent-gold h-4 w-4"
                      />
                      <span className={`text-sm group-hover:text-gold transition-colors ${params.style === style ? 'text-gold' : 'text-linen'}`}>
                        {style}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Results Area */}
          <div className="flex-grow">
            {/* Status Bar */}
            <div className="flex items-center justify-between mb-6 text-sm text-stone">
              <div>
                {!isLoading && (
                  <span>
                    {mappedArtworks.length === 0 ? (
                      "No artworks found"
                    ) : (
                      `Showing page ${params.page}`
                    )}
                  </span>
                )}
                {isLoading && <span>Searching...</span>}
              </div>
            </div>

            {/* Grid */}
            {!isLoading && mappedArtworks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-subtle rounded-lg bg-surface-1">
                <SearchIcon className="h-12 w-12 text-stone mb-4 opacity-20" />
                <h3 className="text-lg font-medium text-linen mb-2">No artworks found</h3>
                <p className="text-stone max-w-md mb-6">
                  Try adjusting your filters or search terms to find what you're looking for.
                </p>
                <Button onClick={clearFilters} variant="outline" className="border-gold text-gold hover:bg-gold hover:text-obsidian">
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                <ArtworksGrid artworks={mappedArtworks} loading={isLoading} />
                
                {mappedArtworks.length > 0 && (
                  <div className="mt-12 flex justify-center pb-12">
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => goToPage(params.page - 1)} 
                        disabled={params.page <= 1 || isLoading}
                        className="border-border-subtle bg-surface-1 text-linen hover:text-gold hover:border-gold"
                      >
                        Previous
                      </Button>
                      <span className="text-stone mx-4">Page {params.page}</span>
                      <Button 
                        variant="outline" 
                        onClick={() => goToPage(params.page + 1)} 
                        disabled={!hasMore || isLoading}
                        className="border-border-subtle bg-surface-1 text-linen hover:text-gold hover:border-gold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Search;
