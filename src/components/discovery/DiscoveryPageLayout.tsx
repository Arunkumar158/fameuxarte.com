import React, { useEffect } from 'react';
import { DiscoveryEntity } from '@/lib/discovery/registry';
import { DiscoveryHead } from '@/platform/discovery/DiscoveryHead';
import { DiscoveryHero } from './DiscoveryHero';
import { DiscoveryArtworkGrid } from './DiscoveryGrids';
import { DiscoveryNavigator } from './DiscoveryNavigator';
import { useDiscoveryArtworks, useDiscoveryRecommendations } from '@/hooks/discovery/useDiscoveryHooks';
import { usePostHog } from 'posthog-js/react';
import HomeNav from '@/components/home/HomeNav';
import Footer from '@/components/navigation/Footer';

interface DiscoveryPageLayoutProps {
  entity: DiscoveryEntity;
}

export const DiscoveryPageLayout: React.FC<DiscoveryPageLayoutProps> = ({ entity }) => {
  // ⚠️ Early return MUST come before all hooks to satisfy Rules of Hooks.
  // However, React requires hooks are always called — so we keep the guard
  // here and let hooks run with a potentially-undefined entity, which is
  // safe because useDiscoveryArtworks/Recommendations handle undefined gracefully.
  const posthog = usePostHog();
  const { data: artworks, isLoading } = useDiscoveryArtworks(entity);
  const recommendations = useDiscoveryRecommendations(entity);

  useEffect(() => {
    // Analytics tracking — guard against null entity and uninitialized PostHog
    if (!entity || !posthog) return;

    try {
      posthog.capture(`discovery_${entity.type}_viewed`, {
        slug: entity.slug,
        title: entity.title
      });
      posthog.capture(`discovery_generated_page_viewed`, {
        slug: entity.slug,
        title: entity.title,
        type: entity.type
      });
    } catch {
      // PostHog may be blocked by an ad-blocker; fail silently
    }
  }, [entity, posthog]);

  if (!entity) return null;

  return (
    <div className="min-h-screen bg-obsidian flex flex-col">
      <div className="absolute top-0 w-full z-50">
        <HomeNav />
      </div>

      <DiscoveryHead
        entityType={entity.type as any}
        slug={entity.slug}
        title={entity.seoTitle}
        description={entity.seoDescription}
        image={entity.openGraphImage}
        url={`https://fameuxarte.com/${entity.type}/${entity.slug}`}
        customMeta={{
          'ai-summary': entity.aiSummary,
          'ai-page-type': 'discovery',
          'ai-discovery-topic': entity.title,
          'ai-discovery-path': `/discover/${entity.slug}`,
          'ai-taxonomy-level': entity.type,
          'ai-related-taxonomies': [
            ...recommendations.relatedCollections,
            ...recommendations.relatedCategories,
            ...recommendations.relatedStyles,
            ...recommendations.relatedMediums,
            ...recommendations.relatedSubjects,
            ...recommendations.relatedColors,
            ...recommendations.relatedLocations
          ].join(','),
          'ai-content-depth': 'comprehensive',
          'ai-page-purpose': 'discovery_and_exploration',
          'ai-intended-audience': 'art_collectors_and_enthusiasts',
          'ai-related-collections': recommendations.relatedCollections.join(','),
          'ai-related-categories': recommendations.relatedCategories.join(','),
          'ai-related-styles': recommendations.relatedStyles.join(','),
          'ai-related-mediums': recommendations.relatedMediums.join(','),
          'ai-related-subjects': recommendations.relatedSubjects.join(','),
          'ai-related-colors': recommendations.relatedColors.join(','),
        }}
      />

      <main className="flex-grow">
        <DiscoveryHero entity={entity} />
        
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <DiscoveryArtworkGrid 
            artworks={artworks || []} 
            loading={isLoading} 
            title={`Featured ${entity.title} Artworks`}
          />

          <div className="py-12 border-t border-gold/10">
            <h2 className="text-3xl font-serif text-white mb-8">Explore More</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {recommendations.relatedCollections.length > 0 && (
                <DiscoveryNavigator title="Related Collections" items={recommendations.relatedCollections} type="collection" basePath="/collections" />
              )}
              {recommendations.relatedCategories.length > 0 && (
                <DiscoveryNavigator title="Related Categories" items={recommendations.relatedCategories} type="category" basePath="/category" />
              )}
              {recommendations.relatedStyles.length > 0 && (
                <DiscoveryNavigator title="Related Styles" items={recommendations.relatedStyles} type="style" basePath="/style" />
              )}
              {recommendations.relatedMediums.length > 0 && (
                <DiscoveryNavigator title="Related Mediums" items={recommendations.relatedMediums} type="medium" basePath="/medium" />
              )}
              {recommendations.relatedSubjects.length > 0 && (
                <DiscoveryNavigator title="Related Subjects" items={recommendations.relatedSubjects} type="subject" basePath="/subject" />
              )}
              {recommendations.relatedColors.length > 0 && (
                <DiscoveryNavigator title="Related Colors" items={recommendations.relatedColors} type="color" basePath="/color" />
              )}
              {recommendations.relatedLocations.length > 0 && (
                <DiscoveryNavigator title="Related Locations" items={recommendations.relatedLocations} type="location" basePath="/location" />
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
