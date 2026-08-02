import { DiscoveryEntity } from '@/lib/discovery/registry';

export class SlugGenerator {
  /**
   * Generates a deterministic, SEO-friendly slug from an array of entities.
   * Handles order explicitly so that [Blue, Abstract] and [Abstract, Blue] result in the same slug.
   */
  static generateSlug(entities: DiscoveryEntity[]): string {
    if (!entities || entities.length === 0) return '';
    if (entities.length === 1) return entities[0].slug;

    // To be deterministic, we sort entities by type order or alphabetically
    // We want strings like "blue-abstract-paintings" rather than "abstract-blue"
    // So let's define an order of types
    const typeOrder: Record<string, number> = {
      location: 1,
      color: 2,
      style: 3,
      medium: 4,
      subject: 5,
      category: 6,
      collection: 7
    };

    const sorted = [...entities].sort((a, b) => {
      const orderA = typeOrder[a.type] || 99;
      const orderB = typeOrder[b.type] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.slug.localeCompare(b.slug);
    });

    const slugParts = sorted.map(e => e.slug);
    
    // Sometimes we might want to append "paintings" or "art" for categories if missing,
    // but for now, joining them with a hyphen is a solid deterministic start.
    return Array.from(new Set(slugParts)).join('-');
  }

  /**
   * Parses a slug back into its constituent parts based on available registry slugs.
   * This is a simple greedy approach. In a complex scenario, we'd use a trie.
   */
  static parseSlug(slug: string, availableSlugs: string[]): string[] {
    const parts = slug.split('-');
    const matched: string[] = [];
    
    let current = '';
    for (const part of parts) {
      if (current) current += '-' + part;
      else current = part;

      if (availableSlugs.includes(current)) {
        matched.push(current);
        current = '';
      }
    }
    
    // If there's leftover current that didn't match, the slug might be invalid,
    // or we might need a more sophisticated parser (e.g. backtracking).
    // For our current use case, simple exact matches are fine since registry slugs are hyphenated.
    // Wait, if registry has 'modern-art' and 'blue', slug 'blue-modern-art' will fail greedy if we don't look ahead.
    // Let's implement a better matching logic:
    return this.findSlugs(slug, availableSlugs);
  }

  private static findSlugs(slug: string, availableSlugs: string[]): string[] {
    const matched: string[] = [];
    let remaining = slug;
    
    // Sort available slugs by length descending to match longest first (e.g. 'modern-art' before 'art')
    const sortedAvailable = [...availableSlugs].sort((a, b) => b.length - a.length);

    while (remaining.length > 0) {
      let found = false;
      for (const av of sortedAvailable) {
        if (remaining === av || remaining.startsWith(av + '-')) {
          matched.push(av);
          remaining = remaining.substring(av.length + (remaining.length > av.length ? 1 : 0));
          found = true;
          break;
        }
      }
      if (!found) break; // Invalid part found
    }
    
    if (remaining.length > 0) return []; // Meaning we couldn't fully parse it
    return matched;
  }
}
