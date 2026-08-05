import { MemoryConfig, MemoryTurn, MemorySummary } from './MemoryTypes';
import { Role } from '../types';
import { TokenEstimator } from '../utils/TokenEstimator';
import { HashUtil } from '../utils/HashUtil';

/**
 * Manages rolling conversation history and memory limits for a single chat session.
 */
export class SessionMemory {
  public readonly sessionId: string;
  private turns: MemoryTurn[] = [];
  private config: Required<MemoryConfig>;
  private createdAt: Date;
  private lastActivityAt: Date;
  private summary?: string;

  constructor(sessionId: string, config: MemoryConfig = {}) {
    this.sessionId = sessionId;
    this.createdAt = new Date();
    this.lastActivityAt = new Date();
    this.config = {
      maxTurns: config.maxTurns ?? 10,
      maxTokens: config.maxTokens ?? 2048,
      ttlMs: config.ttlMs ?? 3600000, // 1 hour
    };
  }

  /**
   * Add a new conversation turn to rolling memory.
   */
  public addTurn(role: Role, content: string): MemoryTurn {
    const tokens = TokenEstimator.estimateTokens(content);
    const turn: MemoryTurn = {
      id: `turn_${Date.now()}_${HashUtil.fnv1a(content).substring(0, 6)}`,
      role,
      content,
      timestamp: new Date(),
      tokens,
    };

    this.turns.push(turn);
    this.lastActivityAt = new Date();

    this.trimMemory();
    return turn;
  }

  /**
   * Get all active conversation turns.
   */
  public getTurns(): MemoryTurn[] {
    return [...this.turns];
  }

  /**
   * Get formatted turns suitable for prompt context.
   */
  public getFormattedTurns(): Array<{ role: Role; content: string }> {
    return this.turns.map((t) => ({ role: t.role, content: t.content }));
  }

  /**
   * Get total estimated token count for current session turns.
   */
  public getTotalTokens(): number {
    return this.turns.reduce((total, t) => total + (t.tokens || 0), 0);
  }

  /**
   * Check if session has expired based on TTL.
   */
  public isExpired(): boolean {
    return Date.now() - this.lastActivityAt.getTime() > this.config.ttlMs;
  }

  /**
   * Placeholder summary generator for older conversation turns.
   */
  public generateSummary(): MemorySummary {
    const turnCount = this.turns.length;
    const summaryText = turnCount === 0
      ? 'No prior context.'
      : `Conversation session (${turnCount} turns) covering user queries and assistant responses.`;

    this.summary = summaryText;

    return {
      sessionId: this.sessionId,
      summaryText,
      turnCount,
      totalTokens: this.getTotalTokens(),
      lastUpdated: new Date(),
    };
  }

  /**
   * Get current conversation summary text if generated.
   */
  public getSummary(): string | undefined {
    return this.summary;
  }

  /**
   * Trim turns array to enforce maxTurns and maxTokens constraints.
   */
  private trimMemory(): void {
    // Trim by turn count (keep most recent turns)
    if (this.turns.length > this.config.maxTurns) {
      const overflowCount = this.turns.length - this.config.maxTurns;
      this.turns.splice(0, overflowCount);
    }

    // Trim by token budget (remove oldest turns until within budget)
    while (this.turns.length > 2 && this.getTotalTokens() > this.config.maxTokens) {
      this.turns.shift(); // Remove oldest turn
    }
  }

  /**
   * Clear all turns in session.
   */
  public clear(): void {
    this.turns = [];
    this.summary = undefined;
    this.lastActivityAt = new Date();
  }
}
