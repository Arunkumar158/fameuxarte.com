import { DiscoveryEntity } from '@/lib/discovery/registry';
import { TaxonomyEngine } from './taxonomyEngine';
import { SlugGenerator } from './slugGenerator';
import { CombinationScorer } from './combinationScorer';
import { discoveryCache } from './cache';

export class DiscoveryGenerationEngine {
  /**
   * Generates a new DiscoveryEntity by combining multiple valid entities.
   */
  static generateVirtualEntity(entities: DiscoveryEntity[], slug: string): DiscoveryEntity | null {
    if (!entities || entities.length === 0) return null;
    
    // Check Cache
    const cached = discoveryCache.get(slug);
    if (cached) return cached;

    // Validate combination
    if (!TaxonomyEngine.validateCombination(entities)) return null;

    // Score combination
    if (!CombinationScorer.isIndexable(entities)) return null;

    // Build the virtual entity
    const virtualEntity = this.buildEntity(entities, slug);
    
    // Cache it
    discoveryCache.set(slug, virtualEntity);

    return virtualEntity;
  }

  private static buildEntity(entities: DiscoveryEntity[], slug: string): DiscoveryEntity {
    // Determine a primary entity for fallbacks (e.g., the category or location)
    const primary = entities.find(e => e.type === 'category' || e.type === 'location') || entities[0];
    
    const titles = entities.map(e => e.title);
    const combinedTitle = titles.join(' ');

    const virtualEntity: DiscoveryEntity = {
      slug,
      type: primary.type, // Inherit type from primary, though logically it's a 'combination'
      title: combinedTitle,
      heroTitle: `${combinedTitle} Artworks`,
      heroDescription: `Discover unique ${combinedTitle.toLowerCase()} artworks. ` + entities.map(e => e.heroDescription).join(' '),
      seoTitle: `${combinedTitle} Paintings & Artworks | Fameuxarte`,
      seoDescription: `Shop original ${combinedTitle.toLowerCase()} paintings. ` + entities.map(e => e.seoDescription).join(' ').substring(0, 100) + '...',
      aiSummary: `A generated collection featuring ${combinedTitle.toLowerCase()}. ` + entities.map(e => e.aiSummary).join(' '),
      openGraphImage: primary.openGraphImage,
      featured: entities.some(e => e.featured),
      
      // We will rely on the pageResolver to populate these correctly later or leave them empty to be dynamically fetched
      relatedCollections: primary.relatedCollections || [],
      relatedCategories: primary.relatedCategories || [],
      relatedStyles: primary.relatedStyles || [],
      relatedMediums: primary.relatedMediums || [],
      relatedSubjects: primary.relatedSubjects || [],
      relatedColors: primary.relatedColors || [],
      relatedLocations: primary.relatedLocations || [],
    };

    return virtualEntity;
  }
}
