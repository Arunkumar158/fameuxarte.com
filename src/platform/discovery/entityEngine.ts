/**
 * Fameuxarte Entity Engine
 * Standardizes and normalizes marketplace objects into discovery entities.
 */

import { EntityType, BaseEntity, ArtworkEntity, ArtistEntity, CollectionEntity, BlogEntity, GenericDiscoveryInput } from './types';
import { getEntityConfig } from './marketplaceRegistry';

export class EntityEngine {
  /**
   * Normalizes raw object data into a standardized Entity structure
   */
  public static normalizeEntity(input: GenericDiscoveryInput): BaseEntity {
    const config = getEntityConfig(input.entityType);
    const slug = input.slug || input.id || 'entity';
    const title = input.title || 'Fameuxarte Entity';
    const description = input.description || config.defaultDescription.replace('%title%', title);

    return {
      id: input.id || slug,
      type: input.entityType,
      slug,
      title,
      description,
      createdAt: input.publishedTime,
      updatedAt: input.modifiedTime
    };
  }

  /**
   * Type guard & helper for Artwork Entities
   */
  public static isArtworkEntity(entity: BaseEntity): entity is ArtworkEntity {
    return entity.type === 'artwork';
  }

  /**
   * Type guard & helper for Artist Entities
   */
  public static isArtistEntity(entity: BaseEntity): entity is ArtistEntity {
    return entity.type === 'artist';
  }

  /**
   * Type guard & helper for Collection Entities
   */
  public static isCollectionEntity(entity: BaseEntity): entity is CollectionEntity {
    return entity.type === 'collection';
  }

  /**
   * Type guard & helper for Blog Entities
   */
  public static isBlogEntity(entity: BaseEntity): entity is BlogEntity {
    return entity.type === 'blog';
  }

  /**
   * Generates a clean URL path for an entity
   */
  public static getEntityPath(type: EntityType, slug: string): string {
    const config = getEntityConfig(type);
    return config.pathPattern.replace(':slug', slug).replace(':certificateNumber', slug);
  }
}
