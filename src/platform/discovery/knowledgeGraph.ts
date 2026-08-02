/**
 * Fameuxarte Knowledge Graph Foundation
 * Graph node modeling for entity graph relationships (Artist -> created -> Artwork -> belongs to -> Collection -> uses -> Medium -> belongs to -> Style).
 */

import { EntityType } from './types';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: EntityType;
  properties: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  fromNodeId: string;
  toNodeId: string;
  predicate: 'CREATED' | 'BELONGS_TO' | 'USES_MEDIUM' | 'EXHIBITED_IN' | 'INFLUENCED_BY';
}

export class KnowledgeGraph {
  private static nodes: Map<string, KnowledgeGraphNode> = new Map();
  private static edges: KnowledgeGraphEdge[] = [];

  /**
   * Adds a node to the knowledge graph
   */
  public static addNode(node: KnowledgeGraphNode): void {
    this.nodes.set(node.id, node);
  }

  /**
   * Connects two nodes in the knowledge graph
   */
  public static addEdge(edge: KnowledgeGraphEdge): void {
    this.edges.push(edge);
  }

  /**
   * Exports full knowledge graph structure for AI indexers
   */
  public static exportGraph() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: this.edges
    };
  }
}
