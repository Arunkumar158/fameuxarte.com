import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RelatedArtist {
  id: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  mediums: string[] | null;
  artStyles: string[] | null;
  country: string | null;
  matchScore: number;
}

export function useRelatedArtists(currentArtistId: string | undefined, currentArtistData: {
  mediums?: string[] | null;
  artStyles?: string[] | null;
  country?: string | null;
  // Note: subject and price range could be derived from artworks, but here we use profile data where possible.
} | undefined) {
  return useQuery({
    queryKey: ['related-artists', currentArtistId],
    queryFn: async () => {
      if (!currentArtistId || !currentArtistData) return [];

      // Fetch active artists excluding the current one
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, bio, mediums, art_styles, country, created_at')
        .eq('role', 'artist')
        .neq('id', currentArtistId)
        .limit(50); // Get a pool to score

      if (error) throw error;
      if (!data) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Score each artist
      const scoredArtists: RelatedArtist[] = data.map((artist) => {
        let score = 0;

        // Same Style: 40% (Up to 40 points)
        if (currentArtistData.artStyles && artist.art_styles) {
          const sharedStyles = currentArtistData.artStyles.filter(s => (artist.art_styles as string[]).includes(s));
          if (sharedStyles.length > 0) {
            score += Math.min(40, (sharedStyles.length / currentArtistData.artStyles.length) * 40);
          }
        }

        // Same Medium: 25% (Up to 25 points)
        if (currentArtistData.mediums && artist.mediums) {
          const sharedMediums = currentArtistData.mediums.filter(m => (artist.mediums as string[]).includes(m));
          if (sharedMediums.length > 0) {
            score += Math.min(25, (sharedMediums.length / currentArtistData.mediums.length) * 25);
          }
        }

        // Same Country: 5%
        if (currentArtistData.country && artist.country && currentArtistData.country === artist.country) {
          score += 5;
        }

        // New Artist Boost: 5%
        if (artist.created_at && new Date(artist.created_at) > thirtyDaysAgo) {
          score += 5;
        }

        return {
          id: artist.id,
          name: artist.full_name || 'Artist',
          avatarUrl: artist.avatar_url,
          bio: artist.bio,
          mediums: artist.mediums as string[] | null,
          artStyles: artist.art_styles as string[] | null,
          country: artist.country,
          matchScore: score,
        };
      });

      // Sort by score descending and return top 4
      return scoredArtists
        .filter(a => a.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 4);
    },
    enabled: Boolean(currentArtistId && currentArtistData),
    staleTime: 30 * 60 * 1000, // 30 minutes cache as requested
  });
}
