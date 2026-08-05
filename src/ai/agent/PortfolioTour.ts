import { PortfolioTour } from './AgentTypes';

/**
 * Guided Interactive Portfolio Tour Manager.
 */
export class PortfolioTourManager {
  private static tours: Map<string, PortfolioTour> = new Map([
    [
      'tour_recruiter',
      {
        id: 'tour_recruiter',
        title: '2-Minute Recruiter Overview',
        description: 'Guided tour covering Gaurav\'s background, top production projects, skills, and contact options.',
        durationMinutes: 2,
        steps: [
          {
            stepNumber: 1,
            title: '1. Profile & Bio',
            description: 'Gaurav Kumar Yadav is a BCA Student (2023–2026) at BBDU & AI/ML Minor Scholar at IIT Mandi.',
            targetPath: '/about',
            suggestedQuery: 'Who is Gaurav?',
          },
          {
            stepNumber: 2,
            title: '2. Production Projects',
            description: 'Explore featured full-stack and AI projects including TaskNexus, SmartMess, and BuildMyTeam.',
            targetPath: '/projects',
            suggestedQuery: 'Show top production projects',
          },
          {
            stepNumber: 3,
            title: '3. Technical Stack',
            description: 'Core languages and frameworks: Python, React, Node.js, Express, MongoDB, Docker, and AI/ML.',
            targetPath: '/skills',
            suggestedQuery: 'What are Gaurav\'s core technical skills?',
          },
          {
            stepNumber: 4,
            title: '4. Download Resume & Contact',
            description: 'Direct PDF resume download and open contact inquiry form.',
            targetPath: '/contact',
            suggestedQuery: 'How can I contact or hire Gaurav?',
          },
        ],
      },
    ],
    [
      'tour_ai',
      {
        id: 'tour_ai',
        title: 'AI & Machine Learning Focus',
        description: 'Deep dive into Gaurav\'s AI/ML minor coursework at IIT Mandi, RAG pipeline, and AI projects.',
        durationMinutes: 3,
        steps: [
          {
            stepNumber: 1,
            title: '1. IIT Mandi Minor Program',
            description: 'Academic minor in AI/ML at Indian Institute of Technology Mandi.',
            targetPath: '/about',
            suggestedQuery: 'Tell me about Gaurav\'s AI minor at IIT Mandi',
          },
          {
            stepNumber: 2,
            title: '2. AI Lab & Chatbot Workspace',
            description: 'Gaurav AI v2.0 RAG pipeline built with Gemini 2.0 Flash and 768-dim vector search.',
            targetPath: '/lab/gaurav-chatbot',
            suggestedQuery: 'Show me the AI Lab chatbot workspace',
          },
          {
            stepNumber: 3,
            title: '3. AI Projects',
            description: 'TaskNexus microservices platform with AI task automation and LLM pipelines.',
            targetPath: '/projects',
            suggestedQuery: 'Show only AI-focused projects',
          },
        ],
      },
    ],
  ]);

  /**
   * Get portfolio tour by ID.
   */
  public static getTour(tourId: string): PortfolioTour | undefined {
    return this.tours.get(tourId);
  }

  /**
   * List all available tours.
   */
  public static getAllTours(): PortfolioTour[] {
    return Array.from(this.tours.values());
  }
}
