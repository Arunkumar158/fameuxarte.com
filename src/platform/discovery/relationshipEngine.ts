/**
 * Fameuxarte Relationship Engine
 * Models semantic relationships between marketplace entities.
 */

import { BaseEntity, RelationshipType } from './types';

export interface EntityRelationship {
  sourceId: string;
  sourceType: string;
  relationship: RelationshipType;
  targetId: string;
  targetType: string;
  weight?: number;
  metadata?: Record<string, any>;
}

export class RelationshipEngine {
  private static relationships: EntityRelationship[] = [];

  /**
   * Registers a semantic relationship between two entities
   */
  public static registerRelationship(rel: EntityRelationship): void {
    this.relationships.push(rel);
  }

  /**
   * Retrieves all outgoing relationships for an entity
   */
  public static getRelatedEntities(sourceId: string, relationship?: RelationshipType): EntityRelationship[] {
    return this.relationships.filter(
      r => r.sourceId === sourceId && (!relationship || r.relationship === relationship)
    );
  }

  /**
   * Generates graph relations for an artwork entity
   */
  public static mapArtworkRelationships(artwork: {
    id: string;
    artistId?: string;
    collectionId?: string;
    style?: string;
    medium?: string;
  }): EntityRelationship[] {
    const rels: EntityRelationship[] = [];

    if (artwork.artistId) {
      rels.push({
        sourceId: artwork.id,
        sourceType: 'artwork',
        relationship: 'CREATED_BY',
        targetId: artwork.artistId,
        targetType: 'artist'
      });
    }

    if (artwork.collectionId) {
      rels.push({
        sourceId: artwork.id,
        sourceType: 'artwork',
        relationship: 'BELONGS_TO_COLLECTION',
        targetId: artwork.collectionId,
        targetType: 'collection'
      });
    }

    if (artwork.style) {
      rels.push({
        sourceId: artwork.id,
        sourceType: 'artwork',
        relationship: 'HAS_STYLE',
        targetId: artwork.style.toLowerCase().replace(/\s+/g, '-'),
        targetType: 'style'
      });
    }

    if (artwork.medium) {
      rels.push({
        sourceId: artwork.id,
        sourceType: 'artwork',
        relationship: 'USES_MEDIUM',
        targetId: artwork.medium.toLowerCase().replace(/\s+/g, '-'),
        targetType: 'medium'
      });
    }

    return rels;
  }
}
