/**
 * GrowAI Phase 12: Copilot Action Executor
 * Handles explicit user confirmation and execution of Copilot-proposed actions.
 *
 * CRITICAL RULE (Section 12):
 * Never execute consequential write operations silently.
 * Confirmation is strictly required before modifying database records.
 */

import { CopilotAction } from '@/types/grower-copilot';
import { completeReminder, createReminder } from '@/lib/reminders/reminder-storage';
import { createGrowPlan, updateGrowPlan, getGrowPlanById } from '@/lib/grow-plans/storage';
import { completePlanStep } from '@/lib/grow-plans/plan-step-engine';
import { generatePlanFromTemplate } from '@/lib/grow-plans/plan-generator';

export interface ExecuteActionResult {
  success: boolean;
  message: string;
  route?: string;
  error?: string;
  requiresConfirmation?: boolean;
}

export async function executeCopilotAction(action: CopilotAction): Promise<ExecuteActionResult> {
  // Enforce confirmation check
  if (action.requiresConfirmation && !action.confirmed) {
    return {
      success: false,
      requiresConfirmation: true,
      message: `Action "${action.label}" requires explicit grower confirmation before execution.`,
    };
  }

  try {
    switch (action.type) {
      case 'complete_reminder': {
        if (!action.payload?.reminderId) {
          return { success: false, message: 'Missing reminder ID to complete.' };
        }
        await completeReminder(action.payload.reminderId);
        return {
          success: true,
          message: `Reminder marked completed successfully.`,
          route: action.route,
        };
      }

      case 'create_reminder': {
        if (!action.payload?.title || !action.payload?.dueAt) {
          return { success: false, message: 'Missing reminder details.' };
        }
        const created = await createReminder({
          title: action.payload.title,
          body: action.payload.body || 'Created via Grower Copilot',
          scheduledFor: action.payload.dueAt,
          dueAt: action.payload.dueAt,
          priority: action.payload.priority || 'normal',
          reminderType: action.payload.reminderType || 'care',
          sourceType: 'manual',
          plantId: action.payload.plantId,
          plantNickname: action.payload.plantNickname,
        });
        if (created.error) {
          return {
            success: false,
            message: `Failed to create reminder: ${created.error}`,
          };
        }
        return {
          success: true,
          message: `Created reminder: "${created.reminder?.title || action.payload.title}".`,
          route: '/app/grow-intelligence',
        };
      }

      case 'open_plant':
      case 'open_health':
      case 'open_timeline':
      case 'open_production_cycle':
      case 'open_planner':
      case 'open_grow_plan':
      case 'record_observation':
      case 'record_growing_condition':
      case 'record_feeding':
      case 'record_harvest':
      case 'record_propagation_event': {
        // Navigation actions do not modify data; they provide targeted routes
        return {
          success: true,
          message: `Navigating to ${action.label}.`,
          route: action.route,
        };
      }

      case 'create_plan': {
        if (!action.payload?.name || !action.payload?.templateId) {
          return { success: false, message: 'Missing grow plan parameters.' };
        }
        const plant = action.payload.plant;
        const generated = generatePlanFromTemplate(action.payload.templateId, {
          plant,
          plantId: action.payload.plantId || plant?.id,
          plantSlug: action.payload.plantSlug || plant?.plantSlug,
          name: action.payload.name,
        });

        const created = await createGrowPlan({
          name: generated.name,
          description: generated.description,
          objective: generated.objective,
          scope: generated.scope,
          plantId: generated.plantId,
          plantIds: generated.plantIds,
          steps: generated.steps,
          evidenceBasis: generated.evidenceBasis,
        });

        if (created.error) {
          return { success: false, message: `Failed to create grow plan: ${created.error}` };
        }
        return {
          success: true,
          message: `Created grow plan: "${created.plan?.name || action.payload.name}".`,
          route: created.plan ? `/app/grow-plans/${created.plan.id}` : '/app/grow-plans',
        };
      }

      case 'pause_plan': {
        if (!action.payload?.planId) {
          return { success: false, message: 'Missing plan ID to pause.' };
        }
        const updated = await updateGrowPlan(action.payload.planId, { status: 'paused' });
        if (updated.error) {
          return { success: false, message: `Failed to pause plan: ${updated.error}` };
        }
        return {
          success: true,
          message: 'Plan has been paused.',
          route: `/app/grow-plans/${action.payload.planId}`,
        };
      }

      case 'resume_plan': {
        if (!action.payload?.planId) {
          return { success: false, message: 'Missing plan ID to resume.' };
        }
        const updated = await updateGrowPlan(action.payload.planId, { status: 'active' });
        if (updated.error) {
          return { success: false, message: `Failed to resume plan: ${updated.error}` };
        }
        return {
          success: true,
          message: 'Plan has been resumed.',
          route: `/app/grow-plans/${action.payload.planId}`,
        };
      }

      case 'complete_step': {
        if (!action.payload?.planId || !action.payload?.stepId) {
          return { success: false, message: 'Missing plan ID or step ID.' };
        }
        const planRes = await getGrowPlanById(action.payload.planId);
        if (!planRes.plan) {
          return { success: false, message: 'Plan not found.' };
        }
        const updatedPlan = completePlanStep(planRes.plan, action.payload.stepId, action.payload.notes);
        await updateGrowPlan(action.payload.planId, {
          steps: updatedPlan.steps,
          status: updatedPlan.status,
          healthStatus: updatedPlan.healthStatus,
          completedAt: updatedPlan.completedAt,
        });
        return {
          success: true,
          message: 'Plan step marked as completed.',
          route: `/app/grow-plans/${action.payload.planId}`,
        };
      }

      case 'cancel_plan': {
        if (!action.payload?.planId) {
          return { success: false, message: 'Missing plan ID to cancel.' };
        }
        const updated = await updateGrowPlan(action.payload.planId, { status: 'cancelled' });
        if (updated.error) {
          return { success: false, message: `Failed to cancel plan: ${updated.error}` };
        }
        return {
          success: true,
          message: 'Plan has been cancelled.',
          route: `/app/grow-plans/${action.payload.planId}`,
        };
      }

      default:
        return {
          success: false,
          message: `Unsupported action type: ${(action as any).type}`,
        };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to execute action: ${err.message || 'Unknown error'}`,
      error: err.message,
    };
  }
}
