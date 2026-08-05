import { HashUtil } from './HashUtil';
import { TokenEstimator } from './TokenEstimator';

export interface SemanticChunk {
  chunkId: string;
  documentId: string;
  category: string;
  title: string;
  headerPath?: string;
  content: string;
  tokenEstimate: number;
  chunkIndex: number;
  metadata?: Record<string, unknown>;
}

export interface SemanticChunkerOptions {
  maxChunkTokens?: number;
  overlapTokens?: number;
  preserveCodeBlocks?: boolean;
}

/**
 * Intelligent Structural & Semantic Chunker splitting documents by markdown headings,
 * section paragraphs, lists, and code blocks while maintaining context integrity.
 */
export class SemanticChunker {
  private static readonly DEFAULT_MAX_TOKENS = 300;
  private static readonly DEFAULT_OVERLAP_TOKENS = 30;

  /**
   * Split document into structural semantic chunks.
   */
  public static chunkDocument(
    documentId: string,
    title: string,
    category: string,
    content: string,
    options: SemanticChunkerOptions = {},
    metadata: Record<string, unknown> = {}
  ): SemanticChunk[] {
    if (!content || content.trim().length === 0) {
      return [];
    }

    const maxTokens = options.maxChunkTokens ?? SemanticChunker.DEFAULT_MAX_TOKENS;
    const cleanText = content.trim();

    // 1. Split into structural sections by headings (# Heading, ## Subheading)
    const rawSections = cleanText.split(/(?=\n#{1,3}\s+)/g);
    const chunks: SemanticChunk[] = [];
    let globalChunkIndex = 0;

    for (const rawSection of rawSections) {
      const sectionText = rawSection.trim();
      if (!sectionText) continue;

      // Extract section header if present
      const headerMatch = sectionText.match(/^(#{1,3})\s+(.+)/);
      const currentHeader = headerMatch ? headerMatch[2].trim() : title;
      const headerPath = headerMatch ? `${title} > ${currentHeader}` : title;

      const estimatedTokens = TokenEstimator.estimateTokens(sectionText);

      if (estimatedTokens <= maxTokens) {
        chunks.push({
          chunkId: `chunk_${HashUtil.fnv1a(sectionText)}_${globalChunkIndex}`,
          documentId,
          category,
          title,
          headerPath,
          content: sectionText,
          tokenEstimate: estimatedTokens,
          chunkIndex: globalChunkIndex,
          metadata: { ...metadata, header: currentHeader },
        });
        globalChunkIndex++;
      } else {
        // Section exceeds max token budget — split paragraph by paragraph
        const paragraphs = sectionText.split(/\n\n+/g);
        let currentBuffer = '';

        for (const paragraph of paragraphs) {
          const pText = paragraph.trim();
          if (!pText) continue;

          const combined = currentBuffer ? `${currentBuffer}\n\n${pText}` : pText;
          const combinedTokens = TokenEstimator.estimateTokens(combined);

          if (combinedTokens <= maxTokens) {
            currentBuffer = combined;
          } else {
            if (currentBuffer) {
              chunks.push({
                chunkId: `chunk_${HashUtil.fnv1a(currentBuffer)}_${globalChunkIndex}`,
                documentId,
                category,
                title,
                headerPath,
                content: currentBuffer,
                tokenEstimate: TokenEstimator.estimateTokens(currentBuffer),
                chunkIndex: globalChunkIndex,
                metadata: { ...metadata, header: currentHeader },
              });
              globalChunkIndex++;
            }
            currentBuffer = pText;
          }
        }

        if (currentBuffer) {
          chunks.push({
            chunkId: `chunk_${HashUtil.fnv1a(currentBuffer)}_${globalChunkIndex}`,
            documentId,
            category,
            title,
            headerPath,
            content: currentBuffer,
            tokenEstimate: TokenEstimator.estimateTokens(currentBuffer),
            chunkIndex: globalChunkIndex,
            metadata: { ...metadata, header: currentHeader },
          });
          globalChunkIndex++;
        }
      }
    }

    return chunks;
  }
}
