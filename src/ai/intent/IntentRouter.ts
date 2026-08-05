export type IntentType =
  | 'greetings'
  | 'who_is_gaurav'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'resume'
  | 'contact'
  | 'blog_recommendation'
  | 'portfolio_nav'
  | 'out_of_scope'
  | 'general';

export interface IntentResult {
  intent: IntentType;
  confidence: number;
  categoryFilter?: string[];
  suggestedFollowUps: string[];
  systemInstructionAddon?: string;
}

/**
 * Intelligent Intent Router classifying user query intent for targeted RAG retrieval and persona tuning.
 */
export class IntentRouter {
  /**
   * Classify intent of user query string.
   */
  public static classifyIntent(query: string): IntentResult {
    if (!query || query.trim().length === 0) {
      return {
        intent: 'general',
        confidence: 0.5,
        suggestedFollowUps: ['What projects has Gaurav built?', 'What skills does Gaurav have?'],
      };
    }

    const lower = query.toLowerCase().trim();

    // 1. Out-of-Scope (weather, sports, capital of, crypto, unrelated trivia)
    if (/capital of|weather|crypto|bitcoin|stock|movie|sports|match|president|capital city|tell me a joke/i.test(lower)) {
      return {
        intent: 'out_of_scope',
        confidence: 0.9,
        suggestedFollowUps: [
          'What technical projects has Gaurav built?',
          'What are Gaurav\'s core skills?',
        ],
        systemInstructionAddon: 'Politely inform the user that you are Gaurav\'s portfolio assistant focused on his engineering work, skills, and projects.',
      };
    }

    // 2. Greetings
    if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening|yo)\b/i.test(lower)) {
      return {
        intent: 'greetings',
        confidence: 0.95,
        suggestedFollowUps: [
          'Who is Gaurav?',
          'What projects has Gaurav built?',
          'What technologies does Gaurav use?',
        ],
        systemInstructionAddon: 'Respond with a warm, professional greeting representing Gaurav.',
      };
    }

    // 3. Who is Gaurav? / Bio
    if (/who is gaurav|tell me about gaurav|about gaurav|who are you|introduce|background/i.test(lower)) {
      return {
        intent: 'who_is_gaurav',
        confidence: 0.95,
        categoryFilter: ['bio', 'education'],
        suggestedFollowUps: [
          'What projects has Gaurav built?',
          'What is Gaurav\'s tech stack?',
          'How can I contact Gaurav?',
        ],
        systemInstructionAddon: 'Provide a concise bio highlighting Gaurav\'s BCA studies at BBDU, AI/ML minor at IIT Mandi, and build-first mindset.',
      };
    }

    // 4. Skills & Tech Stack
    if (/skill|tech|technologies|technology|language|python|react|node|mongodb|backend|frontend|ai skills|framework/i.test(lower)) {
      return {
        intent: 'skills',
        confidence: 0.9,
        categoryFilter: ['skills'],
        suggestedFollowUps: [
          'What backend frameworks does Gaurav use?',
          'What AI/ML tools does Gaurav know?',
          'Show projects using React and Node.',
        ],
      };
    }

    // 5. Projects
    if (/project|built|build|apps|app|tasknexus|smartmess|buildmyteam|chatapp|collaborative|ai project|mern project/i.test(lower)) {
      return {
        intent: 'projects',
        confidence: 0.9,
        categoryFilter: ['projects'],
        suggestedFollowUps: [
          'Tell me about TaskNexus',
          'Tell me about SmartMess',
          'Which projects are AI-focused?',
        ],
        systemInstructionAddon: 'Highlight Gaurav\'s top production projects like TaskNexus, SmartMess, BuildMyTeam, and AIReel Studio.',
      };
    }

    // 6. Experience & Internship
    if (/experience|internship|work|industrial exposure|job|company|exposure/i.test(lower)) {
      return {
        intent: 'experience',
        confidence: 0.9,
        categoryFilter: ['bio', 'projects'],
        suggestedFollowUps: [
          'What projects show industrial exposure?',
          'Is Gaurav open to internships?',
          'How can I contact Gaurav for hiring?',
        ],
      };
    }

    // 7. Education
    if (/education|degree|college|university|bbdu|iit mandi|bca|academic|scholar/i.test(lower)) {
      return {
        intent: 'education',
        confidence: 0.9,
        categoryFilter: ['education'],
        suggestedFollowUps: [
          'Tell me about Gaurav\'s AI/ML minor at IIT Mandi',
          'What is Gaurav\'s degree program?',
        ],
      };
    }

    // 8. Resume / CV
    if (/resume|cv|download resume|pdf/i.test(lower)) {
      return {
        intent: 'resume',
        confidence: 0.95,
        suggestedFollowUps: [
          'How can I contact Gaurav?',
          'What are Gaurav\'s top technical skills?',
        ],
        systemInstructionAddon: 'Provide details about Gaurav\'s resume and guide the user on how to contact him.',
      };
    }

    // 9. Contact & Hiring
    if (/contact|email|linkedin|github|hire|reach|talk|call|location/i.test(lower)) {
      return {
        intent: 'contact',
        confidence: 0.95,
        categoryFilter: ['bio'],
        suggestedFollowUps: [
          'What is Gaurav\'s email address?',
          'Is Gaurav open to freelance work?',
        ],
      };
    }

    // 10. Blog Recommendations
    if (/blog|article|writing|post|rag blog|read/i.test(lower)) {
      return {
        intent: 'blog_recommendation',
        confidence: 0.9,
        categoryFilter: ['blogs'],
        suggestedFollowUps: [
          'Which blogs explain RAG?',
          'Show Gaurav\'s engineering articles.',
        ],
      };
    }

    // 11. Portfolio Navigation / Guide
    if (/guide|navigate|section|pages|where is|explore/i.test(lower)) {
      return {
        intent: 'portfolio_nav',
        confidence: 0.85,
        suggestedFollowUps: [
          'Show me the Lab section',
          'Show me Projects page',
        ],
      };
    }

    return {
      intent: 'general',
      confidence: 0.6,
      suggestedFollowUps: [
        'What projects has Gaurav built?',
        'What technologies does Gaurav use?',
      ],
    };
  }
}
