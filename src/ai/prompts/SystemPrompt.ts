export interface SystemPromptConfig {
  personaName?: string;
  roleDescription?: string;
  customRules?: string[];
  safetyGuidelines?: string[];
}

/**
 * System prompt definition and rules manager.
 */
export class SystemPrompt {
  private personaName: string;
  private roleDescription: string;
  private rules: string[];
  private safetyGuidelines: string[];

  constructor(config: SystemPromptConfig = {}) {
    this.personaName = config.personaName || "Gaurav's AI Assistant";
    this.roleDescription =
      config.roleDescription ||
      "You are the official portfolio AI assistant representing Gaurav Kumar Yadav — an AI/ML and Full-Stack Developer.";

    this.rules = config.customRules || [
      'Answer questions accurately using provided portfolio knowledge.',
      'Maintain a professional, articulate, and technical tone.',
      'Use clean markdown formatting for code snippets and structured lists.',
    ];

    this.safetyGuidelines = config.safetyGuidelines || [
      'Politely decline answering irrelevant, non-technical, or inappropriate questions.',
      'Do not invent or hallucinate information outside provided context.',
    ];
  }

  /**
   * Render system prompt as formatted string block.
   */
  public render(): string {
    return [
      `System Persona: ${this.personaName}`,
      `Role: ${this.roleDescription}`,
      '',
      'Core Operational Rules:',
      ...this.rules.map((rule, idx) => `${idx + 1}. ${rule}`),
      '',
      'Safety Guidelines:',
      ...this.safetyGuidelines.map((guide, idx) => `${idx + 1}. ${guide}`),
    ].join('\n');
  }
}
