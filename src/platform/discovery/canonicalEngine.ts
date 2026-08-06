/**
 * Fameuxarte Canonical URL Engine
 * Automatic canonical URL generation, query parameter scrubbing, and locale prefixing.
 */

export interface CanonicalOptions {
  baseUrl?: string;
  stripQueryParams?: boolean;
  locale?: string;
  trailingSlash?: boolean;
}

export class CanonicalEngine {
  private static DEFAULT_BASE_URL = 'https://fameuxarte.com';

  /**
   * Generates a clean canonical URL for any route path
   */
  public static generateCanonical(path: string, options?: CanonicalOptions): string {
    const baseUrl = options?.baseUrl || this.DEFAULT_BASE_URL;
    let cleanPath = path || '/';

    // Strip trailing query parameters if specified (default: true)
    if (options?.stripQueryParams !== false && cleanPath.includes('?')) {
      cleanPath = cleanPath.split('?')[0];
    }

    // Ensure leading slash
    if (!cleanPath.startsWith('/')) {
      cleanPath = `/${cleanPath}`;
    }

    // Locale prefix readiness (e.g., /fr/, /es/)
    if (options?.locale && options.locale !== 'en' && !cleanPath.startsWith(`/${options.locale}`)) {
      cleanPath = `/${options.locale}${cleanPath}`;
    }

    // Handle trailing slash option (default: remove unless root)
    if (options?.trailingSlash && !cleanPath.endsWith('/')) {
      cleanPath = `${cleanPath}/`;
    } else if (!options?.trailingSlash && cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }

    return `${baseUrl.replace(/\/$/, '')}${cleanPath}`;
  }
}
