export interface KnowledgeSource {
  id: string;
  type: 'project' | 'blog' | 'journey' | 'resume' | 'service' | 'education' | 'skill' | 'bio' | 'event';
  owner: string;
  version: string;
  checksum: string;
  lastUpdated: string;
  priority: number; // 0.1 to 1.0
  status: 'active' | 'modified' | 'archived';
}

/**
 * Centralized Knowledge Source Registry tracking portfolio data sources and checksum hashes.
 */
export class KnowledgeRegistry {
  private static sources: Map<string, KnowledgeSource> = new Map();

  /**
   * Fast FNV-1a hash algorithm for computing source checksums.
   */
  public static computeHash(content: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  /**
   * Register a knowledge source.
   */
  public static registerSource(
    id: string,
    type: KnowledgeSource['type'],
    content: string,
    priority = 0.8
  ): KnowledgeSource {
    const checksum = this.computeHash(content);
    const existing = this.sources.get(id);

    const source: KnowledgeSource = {
      id,
      type,
      owner: 'Gaurav Kumar Yadav',
      version: existing ? `${parseInt(existing.version) + 1}.0` : '1.0',
      checksum,
      lastUpdated: new Date().toISOString(),
      priority,
      status: existing && existing.checksum !== checksum ? 'modified' : 'active',
    };

    this.sources.set(id, source);
    return source;
  }

  /**
   * Get registered source by ID.
   */
  public static getSource(id: string): KnowledgeSource | undefined {
    return this.sources.get(id);
  }

  /**
   * Get all registered sources.
   */
  public static getAllSources(): KnowledgeSource[] {
    return Array.from(this.sources.values());
  }
}
