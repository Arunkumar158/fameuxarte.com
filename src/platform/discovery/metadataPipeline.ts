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
      type: input.entityType === 'blog' ? 'article' : input.entityType === 'artwork' ? 'product' : input.entityType === 'artist' ? 'profile' : 'website'
    });

    // Twitter Card generation
    const twitterCard = OpenGraphEngine.generateTwitterCard({
      title,
      description,
      image: input.image,
      creator: input.author
    });

    // Breadcrumbs generation
    const breadcrumbs = BreadcrumbEngine.buildBreadcrumbs(input.entityType, input.title, path, {
      category: input.rawEntity?.category,
      artistName: input.author,
      artistSlug: input.rawEntity?.artistSlug
    });

    // Structured Data generation
    const structuredData: Record<string, any>[] = [
      SchemaRegistry.buildOrganizationSchema(),
      SchemaRegistry.buildWebSiteSchema(),
      SchemaRegistry.buildBreadcrumbSchema(breadcrumbs)
    ];

    if (input.image) {
      structuredData.push(SchemaRegistry.buildImageObjectSchema({
        url: input.image,
        name: input.title || 'Fameuxarte Image',
        description: description,
        author: input.author || 'Fameuxarte Artist'
      }));
    }

    if (input.rawEntity) {
      if (input.entityType === 'artwork') {
        const trustSignals = input.rawEntity.trustSignals || {
          verifiedArtist: true,
          certificateOfAuthenticity: true,
          originalArtwork: true,
          secureCheckout: true
        };

        structuredData.push(SchemaRegistry.buildProductSchema({
          name: input.rawEntity.name || input.title || 'Artwork',
          description,
          image: input.image || '/og-image.jpg',
          price: input.rawEntity.price || 0,
          currency: input.rawEntity.currency || 'USD',
          sku: input.rawEntity.sku || input.id || 'ART-001',
          artist: input.rawEntity.artist,
          medium: input.rawEntity.medium,
          category: input.rawEntity.category,
          trustSignals
        }));

        structuredData.push(SchemaRegistry.buildCreativeWorkSchema({
          name: input.rawEntity.name || input.title || 'Artwork',
          description,
          image: input.image || '/og-image.jpg',
          creator: input.rawEntity.artist || 'Unknown Artist',
          medium: input.rawEntity.medium,
          dateCreated: input.rawEntity.yearCreated,
          trustSignals
        }));
      } else if (input.entityType === 'artist') {
        structuredData.push(SchemaRegistry.buildPersonSchema({
          name: input.title || 'Artist',
          description,
          image: input.image,
          url: canonicalUrl,
          sameAs: input.rawEntity?.socialLinks,
          jobTitle: input.rawEntity?.verificationStatus === 'verified' ? 'Verified Artist' : 'Artist',
          knowsAbout: input.rawEntity?.mediums || ['Visual Art']
        }));
        structuredData.push(SchemaRegistry.buildProfilePageSchema({
          name: `${input.title || 'Artist'} | Artist Profile`,
          description,
          url: canonicalUrl,
          image: input.image,
          dateCreated: input.rawEntity?.joinedDate,
          mainEntity: { '@id': canonicalUrl }
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
      artistName: input.author,
      medium: input.rawEntity?.medium || (input.rawEntity?.mediums ? input.rawEntity.mediums[0] : undefined),
      subject: input.rawEntity?.subject || (input.rawEntity?.subjects ? input.rawEntity.subjects[0] : undefined),
      style: input.rawEntity?.style || (input.rawEntity?.styles ? input.rawEntity.styles[0] : undefined),
      artistSummary: input.rawEntity?.artistSummary || input.rawEntity?.bio,
      trustStatus: input.rawEntity?.trustScore ? `${input.rawEntity.trustScore}/100` : undefined,
      verificationStatus: input.rawEntity?.verificationStatus,
      country: input.rawEntity?.country,
      experience: input.rawEntity?.yearsOfExperience ? `${input.rawEntity.yearsOfExperience} years` : undefined,
      techniques: input.rawEntity?.mediums,
      artisticPhilosophy: input.rawEntity?.artisticPhilosophy
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
