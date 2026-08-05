import { Role } from '../types';

export interface TokenBudgetOptions {
  maxTokens: number;
  reserveCompletionTokens?: number;
}

/**
 * Fast heuristic token estimation and budgeting utility.
 */
export class TokenEstimator {
  private static readonly CHARS_PER_TOKEN = 4.0;
  private static readonly WORDS_PER_TOKEN = 0.75;
  private static readonly MESSAGE_HEADER_TOKENS = 4; // Overhead per turn in model format

  /**
   * Estimate token count for a string using character and word length heuristics.
   */
  public static estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }

    const charBasedEstimate = Math.ceil(text.length / TokenEstimator.CHARS_PER_TOKEN);
    const wordCount = text.trim().split(/\s+/).length;
    const wordBasedEstimate = Math.ceil(wordCount / TokenEstimator.WORDS_PER_TOKEN);

    // Weighted average favoring character density
    return Math.ceil(charBasedEstimate * 0.6 + wordBasedEstimate * 0.4);
  }

  /**
   * Estimate total tokens for a conversation turn list.
   */
  public static estimateMessageTokens(messages: Array<{ role: Role; content: string }>): number {
    return messages.reduce((total, msg) => {
      return total + TokenEstimator.estimateTokens(msg.content) + TokenEstimator.MESSAGE_HEADER_TOKENS;
    }, 0);
  }

  /**
   * Fits a list of context blocks into a given token budget.
   */
  public static truncateToTokenBudget(blocks: string[], maxBudget: number): string[] {
    let currentTokens = 0;
    const selected: string[] = [];

    for (const block of blocks) {
      const blockTokens = TokenEstimator.estimateTokens(block);
      if (currentTokens + blockTokens <= maxBudget) {
        selected.push(block);
        currentTokens += blockTokens;
      } else {
        break;
      }
    }

    return selected;
  }
}
