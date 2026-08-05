import { AgentAction } from './AgentTypes';

/**
 * Modular Action Registry registering all executable portfolio actions.
 */
export class ActionRegistry {
  private static actions: Map<string, AgentAction> = new Map();

  /**
   * Register default portfolio actions.
   */
  public static initialize(): void {
    if (this.actions.size > 0) return;

    const defaultActions: AgentAction[] = [
      // Navigation Actions
      {
        id: 'nav_about',
        title: 'Open About Page',
        description: 'Navigate to Gaurav\'s bio, education, and credentials page.',
        category: 'navigation',
        analyticsKey: 'action_nav_about',
      },
      {
        id: 'nav_skills',
        title: 'Open Skills Page',
        description: 'Navigate to technical skills, frameworks, and tools page.',
        category: 'navigation',
        analyticsKey: 'action_nav_skills',
      },
      {
        id: 'nav_projects',
        title: 'Open Projects Gallery',
        description: 'Navigate to full production projects gallery.',
        category: 'navigation',
        analyticsKey: 'action_nav_projects',
      },
      {
        id: 'nav_journey',
        title: 'Open Journey Timeline',
        description: 'Navigate to milestone history and experience timeline.',
        category: 'navigation',
        analyticsKey: 'action_nav_journey',
      },
      {
        id: 'nav_blog',
        title: 'Open Engineering Blog',
        description: 'Navigate to technical articles and RAG breakdown posts.',
        category: 'navigation',
        analyticsKey: 'action_nav_blog',
      },
      {
        id: 'nav_lab',
        title: 'Open AI Lab',
        description: 'Navigate to interactive AI demos and chatbot workspace.',
        category: 'navigation',
        analyticsKey: 'action_nav_lab',
      },
      {
        id: 'nav_contact',
        title: 'Open Contact Page',
        description: 'Navigate to direct email and inquiry form.',
        category: 'navigation',
        analyticsKey: 'action_nav_contact',
      },
      {
        id: 'nav_support',
        title: 'Open Support & Buy Coffee',
        description: 'Navigate to support and sponsorship page.',
        category: 'navigation',
        analyticsKey: 'action_nav_support',
      },

      // Interaction Actions
      {
        id: 'download_resume',
        title: 'Download Resume',
        description: 'Download Gaurav\'s latest PDF resume.',
        category: 'interaction',
        analyticsKey: 'action_download_resume',
      },
      {
        id: 'copy_email',
        title: 'Copy Email Address',
        description: 'Copy gauravkumar752399@gmail.com to clipboard.',
        category: 'interaction',
        analyticsKey: 'action_copy_email',
      },
      {
        id: 'open_github',
        title: 'Open GitHub Profile',
        description: 'Open Gaurav\'s GitHub profile in a new tab.',
        category: 'external',
        analyticsKey: 'action_open_github',
      },
      {
        id: 'open_linkedin',
        title: 'Open LinkedIn Profile',
        description: 'Open Gaurav\'s LinkedIn profile in a new tab.',
        category: 'external',
        analyticsKey: 'action_open_linkedin',
      },

      // Deep Linking & Scroll Actions
      {
        id: 'open_project',
        title: 'Open Specific Project',
        description: 'Navigate to and highlight a specific project by name.',
        category: 'discovery',
        params: [{ name: 'projectId', type: 'string', required: true }],
        analyticsKey: 'action_open_project',
      },
      {
        id: 'open_blog',
        title: 'Open Specific Blog',
        description: 'Navigate to and open a specific blog post.',
        category: 'discovery',
        params: [{ name: 'blogSlug', type: 'string', required: true }],
        analyticsKey: 'action_open_blog',
      },
      {
        id: 'scroll_to_top',
        title: 'Scroll to Top',
        description: 'Smoothly scroll page to top hero section.',
        category: 'interaction',
        analyticsKey: 'action_scroll_top',
      },
    ];

    for (const action of defaultActions) {
      this.actions.set(action.id, action);
    }
  }

  /**
   * Get action by ID.
   */
  public static getAction(id: string): AgentAction | undefined {
    this.initialize();
    return this.actions.get(id);
  }

  /**
   * List all registered actions.
   */
  public static getAllActions(): AgentAction[] {
    this.initialize();
    return Array.from(this.actions.values());
  }

  /**
   * Match action ID from natural query.
   */
  public static resolveActionFromQuery(query: string): { actionId: string; params?: Record<string, string> } | null {
    const lower = query.toLowerCase().trim();

    if (/download.*resume|get.*resume|resume pdf/i.test(lower)) return { actionId: 'download_resume' };
    if (/copy.*email|email address|get email/i.test(lower)) return { actionId: 'copy_email' };
    if (/open.*github|github link|github profile/i.test(lower)) return { actionId: 'open_github' };
    if (/open.*linkedin|linkedin profile/i.test(lower)) return { actionId: 'open_linkedin' };

    if (/open.*about|go to about|about page/i.test(lower)) return { actionId: 'nav_about' };
    if (/open.*skill|go to skill|skills page/i.test(lower)) return { actionId: 'nav_skills' };
    if (/open.*project|go to project|projects page|gallery/i.test(lower)) return { actionId: 'nav_projects' };
    if (/open.*journey|go to journey|timeline/i.test(lower)) return { actionId: 'nav_journey' };
    if (/open.*blog|go to blog|engineering blog/i.test(lower)) return { actionId: 'nav_blog' };
    if (/open.*lab|go to lab|ai lab/i.test(lower)) return { actionId: 'nav_lab' };
    if (/open.*contact|contact form|reach out/i.test(lower)) return { actionId: 'nav_contact' };

    // Deep link matches
    if (/instax/i.test(lower)) return { actionId: 'open_project', params: { projectId: 'instax' } };
    if (/tasknexus/i.test(lower)) return { actionId: 'open_project', params: { projectId: 'tasknexus' } };
    if (/smartmess/i.test(lower)) return { actionId: 'open_project', params: { projectId: 'smartmess' } };
    if (/buildmyteam/i.test(lower)) return { actionId: 'open_project', params: { projectId: 'buildmyteam' } };

    return null;
  }
}
