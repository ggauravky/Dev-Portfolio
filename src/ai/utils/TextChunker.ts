import { HashUtil } from './HashUtil';

export interface ChunkOptions {
  maxChunkSize?: number; // max characters per chunk
  overlap?: number; // character overlap between consecutive chunks
  preserveParagraphs?: boolean;
}

export interface ChunkResult {
  chunkId: string;
  content: string;
  chunkIndex: number;
  startIndex: number;
  endIndex: number;
  characterCount: number;
}

/**
 * Utility for splitting documents into overlapping text chunks for retrieval and embedding.
 */
export class TextChunker {
  private static readonly DEFAULT_MAX_CHUNK_SIZE = 500;
  private static readonly DEFAULT_OVERLAP = 50;

  /**
   * Chunks arbitrary text content into structured segments.
   */
  public static chunkText(text: string, options: ChunkOptions = {}): ChunkResult[] {
    const maxChunkSize = options.maxChunkSize ?? TextChunker.DEFAULT_MAX_CHUNK_SIZE;
    const overlap = Math.min(options.overlap ?? TextChunker.DEFAULT_OVERLAP, maxChunkSize - 1);
    const preserveParagraphs = options.preserveParagraphs ?? true;

    if (!text || text.trim().length === 0) {
      return [];
    }

    const cleanText = text.trim();
    const chunks: ChunkResult[] = [];

    if (cleanText.length <= maxChunkSize) {
      return [
        {
          chunkId: `chunk_${HashUtil.fnv1a(cleanText)}_0`,
          content: cleanText,
          chunkIndex: 0,
          startIndex: 0,
          endIndex: cleanText.length,
          characterCount: cleanText.length,
        },
      ];
    }

    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < cleanText.length) {
      let targetEnd = currentIndex + maxChunkSize;

      if (targetEnd >= cleanText.length) {
        targetEnd = cleanText.length;
      } else if (preserveParagraphs) {
        // Try breaking at paragraph (\n\n) or sentence boundary (. ! ?)
        const segment = cleanText.substring(currentIndex, targetEnd);
        const paragraphBreak = segment.lastIndexOf('\n\n');
        const sentenceBreak = Math.max(
          segment.lastIndexOf('. '),
          segment.lastIndexOf('! '),
          segment.lastIndexOf('? ')
        );

        if (paragraphBreak > maxChunkSize * 0.4) {
          targetEnd = currentIndex + paragraphBreak + 2;
        } else if (sentenceBreak > maxChunkSize * 0.4) {
          targetEnd = currentIndex + sentenceBreak + 2;
        }
      }

      const chunkContent = cleanText.substring(currentIndex, targetEnd).trim();

      if (chunkContent.length > 0) {
        chunks.push({
          chunkId: `chunk_${HashUtil.fnv1a(chunkContent)}_${chunkIndex}`,
          content: chunkContent,
          chunkIndex,
          startIndex: currentIndex,
          endIndex: targetEnd,
          characterCount: chunkContent.length,
        });
        chunkIndex++;
      }

      if (targetEnd >= cleanText.length) {
        break;
      }

      // Move cursor forward respecting overlap
      currentIndex = targetEnd - overlap;
    }

    return chunks;
  }
}
