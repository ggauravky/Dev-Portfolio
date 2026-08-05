export interface SystemKnowledgeManifest {
  knowledgeVersion: string;
  embeddingModel: string;
  schemaVersion: string;
  promptVersion: string;
  lastUpdated: string;
  documentChecksums: Record<string, string>;
}

/**
 * Knowledge Versioning & Incremental Refresh Manager.
 */
export class KnowledgeVersionManager {
  private static manifest: SystemKnowledgeManifest = {
    knowledgeVersion: '2.0.0',
    embeddingModel: 'text-embedding-004-v1',
    schemaVersion: 'v1',
    promptVersion: 'v2.0',
    lastUpdated: new Date().toISOString(),
    documentChecksums: {},
  };

  /**
   * Fast FNV-1a hash algorithm for computing document checksums.
   */
  public static computeChecksum(content: string): string {
    let hash = 0x811c9dc5;
    for (let i = 0; i < content.length; i++) {
      hash ^= content.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16);
  }

  /**
   * Check if a document content has changed based on checksum.
   */
  public static isDocumentModified(docId: string, content: string): boolean {
    const currentHash = this.computeChecksum(content);
    const existingHash = this.manifest.documentChecksums[docId];

    if (!existingHash || existingHash !== currentHash) {
      this.manifest.documentChecksums[docId] = currentHash;
      this.manifest.lastUpdated = new Date().toISOString();
      return true;
    }

    return false;
  }

  /**
   * Get current knowledge manifest.
   */
  public static getManifest(): SystemKnowledgeManifest {
    return { ...this.manifest };
  }
}
