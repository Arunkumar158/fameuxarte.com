import { DiscoveryEntity } from '@/lib/discovery/registry';

export class CombinationScorer {
  /**
   * Scores a combination of entities.
   * If the score is above a threshold, it's considered valid for indexing.
   */
  static scoreCombination(entities: DiscoveryEntity[]): number {
    if (!entities || entities.length === 0) return 0;
    if (entities.length === 1) return 100; // Single entities are always top score

    let score = 50; // Base score for a valid combination

    // Check if one of them is featured
    const hasFeatured = entities.some(e => e.featured);
    if (hasFeatured) {
      score += 20;
    }

    // Depth penalty (preventing 4+ entity combos from ranking too easily unless very strong)
    if (entities.length > 2) {
      score -= (entities.length - 2) * 10;
    }

    // Mock evaluation for matching artworks/artists (in a real app, this might do a quick count query)
    // For now, we use a simple heuristic based on entity types
    const types = entities.map(e => e.type);
    if (types.includes('category') && types.includes('style')) {
      score += 15;
    }
    if (types.includes('category') && types.includes('color')) {
      score += 10;
    }
    if (types.includes('location') && types.includes('medium')) {
      score += 10;
    }

    return score;
  }

  static isIndexable(entities: DiscoveryEntity[]): boolean {
    const score = this.scoreCombination(entities);
    return score >= 60; // Threshold
  }
}
