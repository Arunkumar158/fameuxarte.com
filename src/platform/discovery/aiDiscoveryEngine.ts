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
  }): AISummaryMetadata {
    const keyEntities = [input.title];
    if (input.artistName) keyEntities.push(input.artistName);
    if (input.medium) keyEntities.push(input.medium);
    if (input.subject) keyEntities.push(input.subject);
    if (input.style) keyEntities.push(input.style);

    const summary = `${input.title} is a ${input.medium || 'visual artwork'} on Fameuxarte by ${input.artistName || 'a verified global artist'}. ${input.description}`;

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
      colorPalette: 'Pending Analysis' // Future placeholder
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
