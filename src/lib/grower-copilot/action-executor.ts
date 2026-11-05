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
