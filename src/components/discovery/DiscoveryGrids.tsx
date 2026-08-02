import React from 'react';
import ArtworkCard, { Artwork } from '@/components/shared/ArtworkCard';
import { Loader2 } from 'lucide-react';

interface DiscoveryArtworkGridProps {
  artworks: Artwork[];
  loading?: boolean;
  title?: string;
}

export const DiscoveryArtworkGrid: React.FC<DiscoveryArtworkGridProps> = ({ 
  artworks, 
  loading,
  title = "Featured Artworks"
}) => {
  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-gold animate-spin" />
      </div>
    );
  }

  if (artworks.length === 0) {
    return null;
  }

  return (
    <div className="py-12">
      <h2 className="text-3xl font-serif text-white mb-8">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artworks.map((artwork) => (
          <ArtworkCard key={artwork.id} artwork={artwork} />
        ))}
      </div>
    </div>
  );
};
