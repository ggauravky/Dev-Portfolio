export type EntityType = 'Project' | 'Skill' | 'Technology' | 'Institution' | 'Blog' | 'Service';
export type RelationType = 'BUILT_WITH' | 'USES' | 'LEARNED_AT' | 'EXPLAINS' | 'RELATED_TO';

export interface GraphEntity {
  id: string;
  name: string;
  type: EntityType;
  metadata?: Record<string, unknown>;
}

export interface GraphRelationship {
  sourceId: string;
  targetId: string;
  relation: RelationType;
  weight?: number;
}

/**
 * Semantic Knowledge Graph Engine & Synonym Expansion Resolver.
 */
export class KnowledgeGraph {
  private entities: Map<string, GraphEntity> = new Map();
  private relationships: GraphRelationship[] = [];

  // Synonym & Acronym Expansion Dictionary
  private static synonymsMap: Record<string, string[]> = {
    js: ['javascript', 'ecmascript'],
    ts: ['typescript'],
    py: ['python'],
    mern: ['mongodb', 'express', 'react', 'node'],
    ai: ['artificial intelligence', 'machine learning', 'llm', 'deep learning', 'rag'],
    ml: ['machine learning', 'artificial intelligence', 'data science'],
    dl: ['deep learning', 'neural networks'],
    rag: ['retrieval augmented generation', 'vector search'],
  };

  /**
   * Expand search term using acronyms and synonyms.
   */
  public static expandSynonyms(term: string): string[] {
    const lower = term.toLowerCase().trim();
    const expansions = this.synonymsMap[lower] || [];
    return [lower, ...expansions];
  }

  /**
   * Add entity node to the knowledge graph.
   */
  public addEntity(entity: GraphEntity): void {
    this.entities.set(entity.id, entity);
  }

  /**
   * Add directional relationship edge to the knowledge graph.
   */
  public addRelationship(rel: GraphRelationship): void {
    this.relationships.push(rel);
  }

  /**
   * Get related entity nodes connected to target entity ID.
   */
  public getRelatedEntities(entityId: string): GraphEntity[] {
    const targetIds = this.relationships
      .filter((r) => r.sourceId === entityId || r.targetId === entityId)
      .map((r) => (r.sourceId === entityId ? r.targetId : r.sourceId));

    const uniqueIds = Array.from(new Set(targetIds));
    return uniqueIds.map((id) => this.entities.get(id)).filter((e): e is GraphEntity => e !== undefined);
  }

  /**
   * Export graph statistics summary.
   */
  public getGraphStats(): { totalEntities: number; totalRelationships: number } {
    return {
      totalEntities: this.entities.size,
      totalRelationships: this.relationships.length,
    };
  }
}
