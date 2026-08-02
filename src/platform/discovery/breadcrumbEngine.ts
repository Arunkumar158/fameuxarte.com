/**
 * Fameuxarte Breadcrumb Engine
 * Dynamic hierarchy calculator & Schema.org BreadcrumbList builder.
 */

import { BreadcrumbItem, EntityType } from './types';
import { getEntityConfig } from './marketplaceRegistry';

export class BreadcrumbEngine {
  private static DEFAULT_SITE_URL = 'https://gallery-canvas-commerce.vercel.app';

  /**
   * Calculates breadcrumb lineage array for any entity or route path
   */
  public static buildBreadcrumbs(
    type: EntityType, 
    entityTitle?: string, 
    customPath?: string,
    options?: {
      category?: string | null;
      artistName?: string | null;
      artistSlug?: string | null;
    }
  ): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
      { name: 'Home', url: '/', position: 1 }
    ];

    const config = getEntityConfig(type);

    if (type === 'artwork') {
      items.push({ name: 'Collections', url: '/collections', position: 2 });
      let currentPos = 3;

      if (options?.category) {
        items.push({
          name: options.category,
          url: `/artworks?category=${encodeURIComponent(options.category)}`,
          position: currentPos++
        });
      }

      if (options?.artistName) {
        const url = options.artistSlug ? `/artists/${options.artistSlug}` : '/artists';
        items.push({
          name: options.artistName,
          url,
          position: currentPos++
        });
      }

      if (entityTitle) {
        items.push({
          name: entityTitle,
          url: customPath || `/artworks/${entityTitle.toLowerCase().replace(/\s+/g, '-')}`,
          position: currentPos++
        });
      }

      return items;
    }

    if (config.parentPath && config.parentPath !== '/') {
      const parentName = this.formatPathName(config.parentPath);
      items.push({
        name: parentName,
        url: config.parentPath,
        position: 2
      });
    }

    if (entityTitle) {
      items.push({
        name: entityTitle,
        url: customPath || config.pathPattern.replace(':slug', entityTitle.toLowerCase().replace(/\s+/g, '-')),
        position: items.length + 1
      });
    }

    return items;
  }

  private static formatPathName(path: string): string {
    const segment = path.replace(/^\//, '').split('/')[0];
    if (!segment) return 'Home';
    return segment.charAt(0).toUpperCase() + segment.slice(1);
  }
}
