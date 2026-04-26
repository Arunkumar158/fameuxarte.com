import { useState, useEffect } from 'react';
import { getArtworkImageUrl } from '@/lib/utils';

/**
 * Resolves an array of artwork storage paths to public/signed URLs.
 * Handles fallbacks gracefully — paths that fail to resolve are replaced
 * with the placeholder and do not cause crashes.
 *
 * @param paths - Ordered list of storage paths (from getGalleryImages)
 * @returns { imageUrls, primaryImage, isLoading }
 */
export const useArtworkImages = (paths: string[]) => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!paths || paths.length === 0) {
      setImageUrls([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    const resolveAll = async () => {
      const settled = await Promise.allSettled(
        paths.map((p) => getArtworkImageUrl(p))
      );

      if (cancelled) return;

      const resolved = settled.map((result) => {
        if (result.status === 'fulfilled' && result.value) {
          return result.value;
        }
        return '/placeholder.svg';
      });

      setImageUrls(resolved);
      setIsLoading(false);
    };

    resolveAll();

    return () => {
      cancelled = true;
    };
  }, [paths.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    imageUrls,
    primaryImage: imageUrls[0] ?? '/placeholder.svg',
    isLoading,
    count: imageUrls.length,
  };
};
