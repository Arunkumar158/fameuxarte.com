import { useState, useEffect } from 'react';
import { getArtworkImageUrl } from '@/lib/utils';

export const useArtworkImage = (imagePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!imagePath) {
        setImageUrl(null);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = await getArtworkImageUrl(imagePath);
        setImageUrl(url);
      } catch (err) {
        console.error('Error fetching artwork image:', err);
        setError('Failed to load image');
        setImageUrl(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImageUrl();
  }, [imagePath]);

  return {
    imageUrl: imageUrl || '/placeholder.svg',
    isLoading,
    error,
    hasImage: !!imagePath
  };
}; 