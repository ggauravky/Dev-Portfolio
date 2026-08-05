/**
 * Portfolio AI Agent Action & Discovery Types.
 */

export type ActionCategory = 'navigation' | 'interaction' | 'discovery' | 'tour' | 'external';

export interface AgentActionParam {
  name: string;
  type: 'string' | 'number' | 'boolean';
  required?: boolean;
  defaultValue?: string | number | boolean;
}

export interface AgentAction {
  id: string;
  title: string;
  description: string;
  category: ActionCategory;
  params?: AgentActionParam[];
  requiresConfirmation?: boolean;
  analyticsKey: string;
  icon?: string;
  execute?: (params?: Record<string, unknown>) => void | Promise<void>;
}

export interface AgentActionResult {
  success: boolean;
  actionId: string;
  message: string;
  data?: Record<string, unknown>;
}

export interface TourStep {
  stepNumber: number;
  title: string;
  description: string;
  targetPath: string;
  targetElementId?: string;
  suggestedQuery: string;
}

export interface PortfolioTour {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  steps: TourStep[];
}
