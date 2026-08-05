import { SystemPrompt } from './SystemPrompt';
import { Role } from '../types';
import { TokenEstimator } from '../utils/TokenEstimator';

export interface BuiltPrompt {
  fullPrompt: string;
  systemSection: string;
  developerSection: string;
  contextSection: string;
  memorySection: string;
  userSection: string;
  estimatedTokens: number;
}

/**
 * Fluent builder assembling structured, modular prompts for AI provider execution.
 */
export class PromptBuilder {
  private systemPrompt?: SystemPrompt;
  private developerInstructions: string[] = [];
  private contextBlocks: string[] = [];
  private memoryTurns: Array<{ role: Role; content: string }> = [];
  private userMessage = '';
  private maxTokenBudget = 4000;

  /**
   * Set system prompt instance.
   */
  public withSystemPrompt(systemPrompt: SystemPrompt): this {
    this.systemPrompt = systemPrompt;
    return this;
  }

  /**
   * Add developer instruction constraint.
   */
  public addDeveloperInstruction(instruction: string): this {
    if (instruction && instruction.trim().length > 0) {
      this.developerInstructions.push(instruction.trim());
    }
    return this;
  }

  /**
   * Add retrieved context snippets.
   */
  public withContextBlocks(blocks: string[]): this {
    this.contextBlocks = blocks.filter((b) => b && b.trim().length > 0);
    return this;
  }

  /**
   * Add rolling conversation memory turns.
   */
  public withMemoryTurns(turns: Array<{ role: Role; content: string }>): this {
    this.memoryTurns = [...turns];
    return this;
  }

  /**
   * Set the main user query message.
   */
  public withUserMessage(message: string): this {
    this.userMessage = message ? message.trim() : '';
    return this;
  }

  /**
   * Set total token budget for final prompt.
   */
  public withTokenBudget(maxTokens: number): this {
    this.maxTokenBudget = maxTokens;
    return this;
  }

  /**
   * Build formatted prompt object.
   */
  public build(): BuiltPrompt {
    const systemSection = this.systemPrompt ? this.systemPrompt.render() : '';

    const developerSection = this.developerInstructions.length > 0
      ? `Developer Constraints:\n${this.developerInstructions.map((d, i) => `- ${d}`).join('\n')}`
      : '';

    // Enforce context token budget
    const fittedContextBlocks = TokenEstimator.truncateToTokenBudget(
      this.contextBlocks,
      Math.floor(this.maxTokenBudget * 0.4)
    );

    const contextSection = fittedContextBlocks.length > 0
      ? `[RETRIEVED KNOWLEDGE CONTEXT]\n${fittedContextBlocks.map((b, i) => `Source [${i + 1}]:\n${b}`).join('\n\n')}`
      : '';

    const memorySection = this.memoryTurns.length > 0
      ? `[CONVERSATION HISTORY]\n${this.memoryTurns.map((t) => `${t.role.toUpperCase()}: ${t.content}`).join('\n')}`
      : '';

    const userSection = `USER QUERY: ${this.userMessage}`;

    const sections = [
      systemSection,
      developerSection,
      contextSection,
      memorySection,
      userSection,
    ].filter((s) => s.length > 0);

    const fullPrompt = sections.join('\n\n---\n\n');
    const estimatedTokens = TokenEstimator.estimateTokens(fullPrompt);

    return {
      fullPrompt,
      systemSection,
      developerSection,
      contextSection,
      memorySection,
      userSection,
      estimatedTokens,
    };
  }
}
