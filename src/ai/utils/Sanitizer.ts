/**
 * Input Security Sanitizer & Prompt Injection Defense Engine.
 */

const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /system\s+prompt/i,
  /override\s+system\s+rules/i,
  /bypass\s+grounding/i,
  /you\s+are\s+now\s+dan/i,
  /forget\s+all\s+prior\s+directives/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /javascript:/i,
];

export class Sanitizer {
  /**
   * Check if query string contains high-risk prompt injection patterns.
   */
  public static containsPromptInjection(input: string): boolean {
    if (!input) return false;
    return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
  }

  /**
   * Sanitize user input string, stripping HTML scripts and dangerous keywords.
   */
  public static sanitizeQuery(input: string): string {
    if (!input) return '';

    let clean = input.trim();

    // Strip HTML script tags & dangerous protocols
    clean = clean
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/<[^>]*>/g, '');

    // Trim excessive whitespace
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean;
  }
}
