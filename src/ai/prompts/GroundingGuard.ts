import { SearchResult } from '../types';

/**
 * Grounding & Anti-Hallucination Guardrails Manager.
 * Ensures model responses are strictly grounded in retrieved knowledge context.
 */
export class GroundingGuard {
  /**
   * Format grounding system instructions.
   */
  public static getGroundingDirective(hasRetrievedContext: boolean): string {
    if (!hasRetrievedContext) {
      return [
        'GROUNDING RULE:',
        'No direct portfolio document matched this specific query.',
        'Answer concisely as Gaurav\'s portfolio assistant.',
        'If the user asks an specific factual detail about Gaurav that is not in your knowledge, politely state that you do not have that information.',
        'Do NOT hallucinate or invent non-existent projects or credentials.',
      ].join('\n');
    }

    return [
      'STRICT GROUNDING RULES:',
      '1. Base your factual answers solely on the RETRIEVED KNOWLEDGE CONTEXT provided below.',
      '2. Do NOT invent projects, skills, metrics, companies, or experience not mentioned in the context.',
      '3. Maintain Gaurav\'s voice: direct, professional, articulate, and engineering-focused.',
      '4. If asked for code or technical details, provide clean, idiomatic markdown code snippets.',
    ].join('\n');
  }

  /**
   * Compute confidence score heuristic from search results.
   */
  public static calculateConfidence(results: SearchResult[]): number {
    if (!results || results.length === 0) return 0.3;
    const topScore = results[0].score || 0.5;
    return Number(Math.min(0.99, Math.max(0.4, topScore * 0.95 + 0.1)).toFixed(2));
  }
}
