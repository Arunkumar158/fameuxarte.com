import { useState, useEffect } from 'react';
import { getArtworkImageUrl, testStorageAccess } from '@/lib/utils';

export const useArtworkImage = (imagePath: string | null) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImageUrl = async () => {
      if (!imagePath) {
        console.log('🔄 No image path provided, using placeholder');
        setImageUrl(null);
        setError(null);
        return;
      }

      console.log('🔄 Fetching image URL for:', imagePath);
      setIsLoading(true);
      setError(null);

      try {
        const url = await getArtworkImageUrl(imagePath);
        if (url) {
          console.log('✅ Image URL fetched successfully:', url);
          setImageUrl(url);
        } else {
          console.log('⚠️ No URL returned, using placeholder');
          setImageUrl(null);
        }
      } catch (err) {
        console.error('❌ Error fetching artwork image:', err);
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