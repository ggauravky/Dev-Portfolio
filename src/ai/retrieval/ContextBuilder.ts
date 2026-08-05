import { SearchResult, ChatSource } from '../types';
import { TokenEstimator } from '../utils/TokenEstimator';

export interface FormattedContext {
  contextBlocks: string[];
  sources: ChatSource[];
  totalTokens: number;
}

/**
 * Context Builder formatting retrieved SearchResult objects into clean context blocks for prompt construction.
 */
export class ContextBuilder {
  /**
   * Format SearchResults into context strings and source citations.
   */
  public static buildContext(results: SearchResult[], maxTokenBudget = 2000): FormattedContext {
    const contextBlocks: string[] = [];
    const sources: ChatSource[] = [];
    let currentTokens = 0;

    for (const res of results) {
      const block = `[Section: ${res.section} | Document: ${res.title}]\n${res.content}`;
      const blockTokens = TokenEstimator.estimateTokens(block);

      if (currentTokens + blockTokens > maxTokenBudget) {
        break;
      }

      contextBlocks.push(block);
      currentTokens += blockTokens;

      sources.push({
        section: res.section,
        title: res.title,
        chunkId: res.chunkId,
        score: res.score,
        snippet: res.content.substring(0, 120),
        metadata: res.metadata,
      });
    }

    return {
      contextBlocks,
      sources,
      totalTokens: currentTokens,
    };
  }
}
