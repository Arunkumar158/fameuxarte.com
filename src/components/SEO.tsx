/**
 * Fameuxarte SEO Component (Backward Compatibility Wrapper)
 * Re-exports and wraps the Discovery Platform DiscoveryHead component.
 */

import { DiscoveryHead } from '@/platform/discovery/DiscoveryHead';
import { EntityType } from '@/platform/discovery/types';

export interface SEOProps {
  title: string;
  description: string;
  canonicalUrl?: string;
  ogImage?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  keywords?: string;
  author?: string;
  robots?: string;
  language?: string;
  entityType?: EntityType;
}

export const SEO = ({
  title,
  description,
  canonicalUrl,
  ogImage = '/og-image.jpg',
  type = 'website',
  structuredData,
  keywords,
  author = 'Fameuxarte',
  robots,
  entityType = 'static_page'
}: SEOProps) => {
  return (
    <DiscoveryHead
      entityType={entityType === 'static_page' && type === 'product' ? 'artwork' : entityType === 'static_page' && type === 'article' ? 'blog' : entityType}
      title={title}
      description={description}
      image={ogImage}
      canonicalUrl={canonicalUrl}
      author={author}
      keywords={keywords ? keywords.split(',').map(k => k.trim()) : undefined}
      robots={robots}
      structuredDataOverride={structuredData}
    />
  );
};
