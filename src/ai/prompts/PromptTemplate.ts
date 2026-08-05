/**
 * Lightweight template string engine supporting variable interpolation (`{{var}}`).
 */
export class PromptTemplate {
  private templateText: string;

  constructor(templateText: string) {
    this.templateText = templateText;
  }

  /**
   * Format template with provided variables object.
   */
  public format(variables: Record<string, string | number | boolean>): string {
    let result = this.templateText;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      result = result.replace(regex, String(value ?? ''));
    }

    return result;
  }

  /**
   * Static convenience helper to format a template string on the fly.
   */
  public static formatString(template: string, variables: Record<string, string | number | boolean>): string {
    return new PromptTemplate(template).format(variables);
  }
}
