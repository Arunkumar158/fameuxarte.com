/**
 * Fameuxarte Metadata Pipeline
 * Unified pipeline transforming generic input into titles, descriptions, canonicals, OpenGraph, Twitter Cards, structured data, keywords, AI summaries, & breadcrumbs.
 */

import { GenericDiscoveryInput, DiscoveryPipelineOutput } from './types';
import { EntityEngine } from './entityEngine';
import { CanonicalEngine } from './canonicalEngine';
import { OpenGraphEngine } from './openGraphEngine';
import { SchemaRegistry } from './schemaRegistry';
import { BreadcrumbEngine } from './breadcrumbEngine';
import { AIDiscoveryEngine } from './aiDiscoveryEngine';
import { getEntityConfig } from './marketplaceRegistry';

export class MetadataPipeline {
  private static SITE_NAME = 'Fameuxarte';

  /**
   * Executes the full discovery metadata processing pipeline
   */
  public static process(input: GenericDiscoveryInput): DiscoveryPipelineOutput {
    const config = getEntityConfig(input.entityType);
    const path = input.url || EntityEngine.getEntityPath(input.entityType, input.slug || input.id || '');
    const canonicalUrl = input.canonicalUrl || CanonicalEngine.generateCanonical(path);

    // Title generation
    let title = input.title || 'Fameuxarte';
    if (!title.includes(this.SITE_NAME)) {
      title = `${title} | ${this.SITE_NAME}`;
    }

    // Description generation
    const rawDesc = input.description || config.defaultDescription.replace('%title%', input.title || 'Artwork');
    const description = this.truncateDescription(rawDesc);

    // Keywords generation
    const keywords = (input.keywords || ['art', 'marketplace', 'authentic art', 'fameuxarte', input.entityType]).join(', ');

    // OpenGraph generation
    const openGraph = OpenGraphEngine.generateOpenGraph({
      title,
      description,
      url: canonicalUrl,
      image: input.image,
      type: input.entityType === 'blog' ? 'article' : input.entityType === 'artwork' ? 'product' : 'website'
    });

    // Twitter Card generation
    const twitterCard = OpenGraphEngine.generateTwitterCard({
      title,
      description,
      image: input.image,
      creator: input.author
    });

    // Breadcrumbs generation
    const breadcrumbs = BreadcrumbEngine.buildBreadcrumbs(input.entityType, input.title, path);

    // Structured Data generation
    const structuredData: Record<string, any>[] = [
      SchemaRegistry.buildOrganizationSchema(),
      SchemaRegistry.buildBreadcrumbSchema(breadcrumbs)
    ];

    if (input.rawEntity) {
      if (input.entityType === 'artwork') {
        structuredData.push(SchemaRegistry.buildProductSchema({
          name: input.rawEntity.name || input.title || 'Artwork',
          description,
          image: input.image || '/og-image.jpg',
          price: input.rawEntity.price || 0,
          currency: input.rawEntity.currency || 'USD',
          sku: input.rawEntity.sku || input.id || 'ART-001',
          artist: input.rawEntity.artist,
          medium: input.rawEntity.medium
        }));
      } else if (input.entityType === 'artist') {
        structuredData.push(SchemaRegistry.buildPersonSchema({
          name: input.title || 'Artist',
          description,
          image: input.image
        }));
      } else if (input.entityType === 'blog') {
        structuredData.push(SchemaRegistry.buildArticleSchema({
          headline: input.title || 'Article',
          description,
          image: input.image || '/og-image.jpg',
          author: input.author || 'Fameuxarte',
          datePublished: input.publishedTime || new Date().toISOString()
        }));
      }
    }

    // AI Summary generation
    const aiMetadata = AIDiscoveryEngine.generateAISummary({
      entityType: input.entityType,
      title: input.title || 'Fameuxarte Page',
      description,
      keywords: input.keywords,
      artistName: input.author
    });

    const robots = input.robots || (config.indexable ? 'index, follow' : 'noindex, nofollow');

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      robots,
      language: 'en',
      openGraph,
      twitterCard,
      structuredData,
      breadcrumbs,
      aiMetadata
    };
  }

  private static truncateDescription(desc: string, maxLen = 160): string {
    const clean = desc.replace(/<[^>]*>?/gm, '').trim();
    if (clean.length <= maxLen) return clean;
    return `${clean.substring(0, maxLen - 3)}...`;
  }
}
