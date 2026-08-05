import { AgentActionResult } from './AgentTypes';
import { ActionRegistry } from './ActionRegistry';

export interface ActionExecutionContext {
  navigate?: (path: string) => void;
  toast?: (msg: string) => void;
}

/**
 * Action Execution Engine performing client-side navigation, smooth scrolling, DOM highlighting, downloads, and clipboard operations.
 */
export class ActionExecutor {
  /**
   * Execute action by ID with parameters and execution context.
   */
  public static async execute(
    actionId: string,
    params: Record<string, unknown> = {},
    ctx: ActionExecutionContext = {}
  ): Promise<AgentActionResult> {
    const action = ActionRegistry.getAction(actionId);

    if (!action) {
      return {
        success: false,
        actionId,
        message: `Action '${actionId}' is not registered.`,
      };
    }

    try {
      switch (actionId) {
        case 'nav_about':
          if (ctx.navigate) ctx.navigate('/about');
          break;
        case 'nav_skills':
          if (ctx.navigate) ctx.navigate('/skills');
          break;
        case 'nav_projects':
          if (ctx.navigate) ctx.navigate('/projects');
          break;
        case 'nav_journey':
          if (ctx.navigate) ctx.navigate('/journey');
          break;
        case 'nav_blog':
          if (ctx.navigate) ctx.navigate('/blog');
          break;
        case 'nav_lab':
          if (ctx.navigate) ctx.navigate('/lab');
          break;
        case 'nav_contact':
          if (ctx.navigate) ctx.navigate('/contact');
          break;
        case 'nav_support':
          if (ctx.navigate) ctx.navigate('/support');
          break;

        case 'download_resume': {
          const link = document.createElement('a');
          link.href = '/Gaurav_Kumar_Yadav_Resume.pdf';
          link.download = 'Gaurav_Kumar_Yadav_Resume.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          if (ctx.toast) ctx.toast('Resume download started!');
          break;
        }

        case 'copy_email':
          await navigator.clipboard.writeText('gauravkumar752399@gmail.com');
          if (ctx.toast) ctx.toast('Email copied to clipboard!');
          break;

        case 'open_github':
          window.open('https://github.com/ggauravky', '_blank', 'noopener,noreferrer');
          break;

        case 'open_linkedin':
          window.open('https://linkedin.com/in/gauravkumaryadav-', '_blank', 'noopener,noreferrer');
          break;

        case 'open_project': {
          const projectId = String(params.projectId || '').toLowerCase();
          if (ctx.navigate) {
            ctx.navigate(`/projects?highlight=${projectId}`);
          }
          // Highlight DOM element if present
          setTimeout(() => this.highlightElement(`project-${projectId}`), 300);
          break;
        }

        case 'open_blog': {
          const slug = String(params.blogSlug || '');
          if (ctx.navigate) {
            ctx.navigate(`/blog/${slug}`);
          }
          break;
        }

        case 'scroll_to_top':
          window.scrollTo({ top: 0, behavior: 'smooth' });
          break;

        default:
          if (action.execute) {
            await action.execute(params);
          }
      }

      return {
        success: true,
        actionId,
        message: `Successfully executed '${action.title}'.`,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        actionId,
        message: `Failed to execute '${action.title}': ${errorMsg}`,
      };
    }
  }

  /**
   * Temporarily highlight target DOM element with a gaurav-toxic glowing pulse ring.
   */
  public static highlightElement(elementId: string): void {
    const el = document.getElementById(elementId) || document.querySelector(`[data-id="${elementId}"]`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    el.classList.add('ring-4', 'ring-toxic', 'ring-offset-2', 'ring-offset-[#070708]', 'transition-all', 'duration-500');
    setTimeout(() => {
      el.classList.remove('ring-4', 'ring-toxic', 'ring-offset-2', 'ring-offset-[#070708]');
    }, 2500);
  }
}
