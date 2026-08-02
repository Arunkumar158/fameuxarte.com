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
  public static buildBreadcrumbs(type: EntityType, entityTitle?: string, customPath?: string): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
      { name: 'Home', url: '/', position: 1 }
    ];

    const config = getEntityConfig(type);

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
