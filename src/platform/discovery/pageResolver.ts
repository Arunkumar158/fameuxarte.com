import { DiscoveryEntity, getDiscoveryEntity, DISCOVERY_REGISTRY } from '@/lib/discovery/registry';
import { TaxonomyEngine } from './taxonomyEngine';
import { SlugGenerator } from './slugGenerator';
import { DiscoveryGenerationEngine } from './generationEngine';

export class PageResolver {
  /**
   * Resolves a URL path/slug into a DiscoveryEntity (either exact or generated).
   */
  static resolve(path: string): DiscoveryEntity | null {
    // Clean path
    const slug = path.replace(/^\/discover\//, '').replace(/\/$/, '');
    
    // 1. Check if it's an exact match for a single entity in the registry
    // We check all types since /discover/:slug is universal
    for (const type of ['collection', 'category', 'style', 'medium', 'subject', 'color', 'location']) {
      const entity = getDiscoveryEntity(slug, type as any);
      if (entity) {
        return entity;
      }
    }

    // 2. Parse the slug to find constituent entities
    const availableSlugs = Object.keys(DISCOVERY_REGISTRY);
    const constituentSlugs = SlugGenerator.parseSlug(slug, availableSlugs);
    
    if (constituentSlugs.length <= 1) {
      // If we couldn't parse it into multiple slugs, and it didn't match exactly, it's invalid
      return null;
    }

    // 3. Resolve the entities
    const entities = TaxonomyEngine.resolveEntities(constituentSlugs);
    if (entities.length !== constituentSlugs.length) {
      return null; // Some parsed slugs didn't resolve
    }

    // 4. Generate the virtual entity
    return DiscoveryGenerationEngine.generateVirtualEntity(entities, slug);
  }
}
