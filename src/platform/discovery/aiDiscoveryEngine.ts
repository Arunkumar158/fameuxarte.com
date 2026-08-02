/**
 * Fameuxarte AI Discovery Engine
 * Architecture for exposing semantic information, AI metadata tags, entity graph, & summaries for AI assistants.
 */

import { AISummaryMetadata, EntityType } from './types';

export class AIDiscoveryEngine {
  /**
   * Generates semantic AI metadata summary tag values
   */
  public static generateAISummary(input: {
    entityType: EntityType;
    title: string;
    description: string;
    keywords?: string[];
    artistName?: string;
    medium?: string;
    subject?: string;
    style?: string;
    artistSummary?: string;
    trustStatus?: string;
    verificationStatus?: string;
    country?: string;
    experience?: string;
    techniques?: string[];
    artisticPhilosophy?: string;
    similarArtists?: string[];
    readingTime?: number;
    targetAudience?: string;
    skillLevel?: string;
    relatedArtists?: string[];
    relatedArtworks?: string[];
    relatedCollections?: string[];
  }): AISummaryMetadata {
    const keyEntities = [input.title];
    if (input.artistName) keyEntities.push(input.artistName);
    if (input.medium) keyEntities.push(input.medium);
    if (input.subject) keyEntities.push(input.subject);
    if (input.style) keyEntities.push(input.style);
    if (input.country) keyEntities.push(input.country);

    let summary = `${input.title} is a ${input.medium || 'visual artwork'} on Fameuxarte by ${input.artistName || 'a verified global artist'}. ${input.description}`;
    
    if (input.entityType === 'artist') {
      summary = `${input.title} is a ${input.verificationStatus === 'verified' ? 'verified ' : ''}Fameuxarte artist${input.country ? ` based in ${input.country}` : ''}, specializing in ${input.medium || 'contemporary art'}${input.style ? ` and ${input.style}` : ''}. ${input.description}`;
    }

    return {
      summary,
      entityType: input.entityType,
      keyEntities,
      semanticTopics: input.keywords || ['contemporary art', 'original artwork', 'fameuxarte gallery'],
      confidenceScore: 0.95,
      medium: input.medium,
      subject: input.subject,
      style: input.style,
      artistSummary: input.artistSummary,
      colorPalette: 'Pending Analysis', // Future placeholder
      trustStatus: input.trustStatus,
      verificationStatus: input.verificationStatus,
      country: input.country,
      experience: input.experience,
      techniques: input.techniques,
      artisticPhilosophy: input.artisticPhilosophy,
      similarArtists: input.similarArtists,
      readingTime: input.readingTime,
      targetAudience: input.targetAudience,
      skillLevel: input.skillLevel,
      relatedArtists: input.relatedArtists,
      relatedArtworks: input.relatedArtworks,
      relatedCollections: input.relatedCollections
    };
  }

  /**
   * Generates JSON-LD semantic entity graph extension for LLM crawlers
   */
  public static generateAISemanticSchema(summaryData: AISummaryMetadata) {
    return {
      '@context': 'https://schema.org',
      '@type': 'SpecialAnnouncement',
      name: summaryData.summary,
      category: summaryData.entityType,
      keywords: summaryData.semanticTopics.join(', '),
      about: summaryData.keyEntities.map(name => ({
        '@type': 'Thing',
        name
      }))
    };
  }
}
