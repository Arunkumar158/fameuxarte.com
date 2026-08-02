import { DiscoveryEntity, DISCOVERY_REGISTRY, getDiscoveryEntity, DiscoveryEntityType } from '@/lib/discovery/registry';

export interface TaxonomyCombination {
  entities: DiscoveryEntity[];
  slug: string;
  isValid: boolean;
  type: 'single' | 'combination';
}

export class TaxonomyEngine {
  /**
   * Validates if an array of entities forms a valid taxonomy combination.
   * Prevents duplicates and conflicting entity types.
   */
  static validateCombination(entities: DiscoveryEntity[]): boolean {
    if (!entities || entities.length === 0) return false;
    if (entities.length === 1) return true;

    // Prevent duplicates
    const uniqueSlugs = new Set(entities.map(e => e.slug));
    if (uniqueSlugs.size !== entities.length) return false;

    // Prevent multiple entities of the same type in a single combination
    // e.g. cannot have two colors or two categories
    const types = new Set(entities.map(e => e.type));
    if (types.size !== entities.length) return false;

    // Check relationships. For a combination to be valid, they must be somewhat related
    // We check if at least one entity is related to the other.
    let isRelated = false;
    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        if (this.areEntitiesRelated(entities[i], entities[j])) {
          isRelated = true;
          break;
        }
      }
      if (isRelated) break;
    }
    
    // In a two-entity combo, they must be related. In larger combos, we might need a tighter graph check.
    return isRelated;
  }

  static areEntitiesRelated(e1: DiscoveryEntity, e2: DiscoveryEntity): boolean {
    const checkRelation = (source: DiscoveryEntity, target: DiscoveryEntity) => {
      switch (target.type) {
        case 'collection': return source.relatedCollections?.includes(target.slug);
        case 'category': return source.relatedCategories?.includes(target.slug);
        case 'style': return source.relatedStyles?.includes(target.slug);
        case 'medium': return source.relatedMediums?.includes(target.slug);
        case 'subject': return source.relatedSubjects?.includes(target.slug);
        case 'color': return source.relatedColors?.includes(target.slug);
        case 'location': return source.relatedLocations?.includes(target.slug);
        default: return false;
      }
    };
    return !!checkRelation(e1, e2) || !!checkRelation(e2, e1);
  }

  /**
   * Resolve an array of entity slugs to valid entities, normalizing them.
   */
  static resolveEntities(slugs: string[]): DiscoveryEntity[] {
    const resolved: DiscoveryEntity[] = [];
    for (const slug of slugs) {
      // Handle aliases/synonyms here if needed in the future
      const entity = DISCOVERY_REGISTRY[slug];
      if (entity) {
        resolved.push(entity);
      }
    }
    return resolved;
  }
}
