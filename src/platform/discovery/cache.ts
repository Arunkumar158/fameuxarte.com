import { DiscoveryEntity } from '@/lib/discovery/registry';

/**
 * A lightweight in-memory cache for the Discovery Generation Engine.
 * In a production SSR/Node environment, this could be Redis.
 * For the client/SPA, an in-memory Map suffices to avoid re-generating 
 * combinations that have already been resolved during the session.
 */
class DiscoveryCache {
  private cache: Map<string, DiscoveryEntity> = new Map();
  private graphCache: Map<string, string[]> = new Map(); // slug -> related slugs

  get(slug: string): DiscoveryEntity | undefined {
    return this.cache.get(slug);
  }

  set(slug: string, entity: DiscoveryEntity): void {
    this.cache.set(slug, entity);
  }

  getGraph(slug: string): string[] | undefined {
    return this.graphCache.get(slug);
  }

  setGraph(slug: string, relatedSlugs: string[]): void {
    this.graphCache.set(slug, relatedSlugs);
  }

  clear(): void {
    this.cache.clear();
    this.graphCache.clear();
  }
}

export const discoveryCache = new DiscoveryCache();
