/**
 * GrowAI Phase 13: Grow Plan Reminder Integration
 * Coordinates between plan steps and the established Phase 9.1/9.2 reminder infrastructure:
 * - Generates reminders strictly for actionable, scheduled plan steps.
 * - Resolves linked reminders when plan steps are completed.
 * - Cancels active reminders when plans are cancelled.
 * - Avoids duplicate reminders through idempotency checks.
 */

import { GrowPlan, GrowPlanStep } from '@/types/grow-plan';
import { createReminder, completeReminder, dismissReminder } from '@/lib/reminders/reminder-storage';

function mapPlanPriorityToReminderPriority(p?: string): 'low' | 'normal' | 'high' | 'urgent' {
  if (p === 'critical' || p === 'urgent') return 'urgent';
  if (p === 'high') return 'high';
  if (p === 'low') return 'low';
  return 'normal';
}

/**
 * Creates or syncs a reminder for an actionable plan step.
 * Only creates a reminder if the step is 'ready' or 'in_progress' and has a due date.
 */
export async function syncStepReminder(
  step: GrowPlanStep,
  plan: GrowPlan
): Promise<string | null> {
  // If plan is paused or cancelled, do not create active reminders
  if (plan.status === 'paused' || plan.status === 'cancelled' || plan.status === 'completed') {
    return null;
  }

  // Only create reminders for actionable steps that are ready or in progress
  if (step.status !== 'ready' && step.status !== 'in_progress') {
    return null;
  }

  // If already linked to a reminder, return existing ID
  if (step.linkedReminderId) {
    return step.linkedReminderId;
  }

  const due = step.dueAt || step.scheduledFor || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

  try {
    const res = await createReminder({
      title: `Plan Step: ${step.title}`,
      body: `${plan.name} — ${step.description}`,
      dueAt: due,
      scheduledFor: due,
      priority: mapPlanPriorityToReminderPriority(step.priority),
      reminderType: step.category === 'health' ? 'health' : 'care',
      sourceType: 'manual',
      sourceId: step.id,
      plantId: plan.plantId || undefined,
      metadata: {
        growPlanId: plan.id,
        growPlanStepId: step.id,
        category: step.category,
        actionUrl: `/app/grow-plans/${plan.id}`,
      },
    });

    return res.reminder?.id || null;
  } catch (err) {
    console.warn(`Could not create reminder for plan step ${step.id}:`, err);
    return null;
  }
}

/**
 * Resolves (completes) the reminder linked to a step when the step is completed.
 */
export async function resolveStepReminder(step: GrowPlanStep): Promise<void> {
  if (!step.linkedReminderId) return;

  try {
    await completeReminder(step.linkedReminderId);
  } catch (err) {
    console.warn(`Could not complete linked reminder ${step.linkedReminderId}:`, err);
  }
}

/**
 * Cancels all active reminders linked to steps in a cancelled plan.
 */
export async function cancelPlanReminders(plan: GrowPlan): Promise<void> {
  for (const step of plan.steps) {
    if (step.linkedReminderId && step.status !== 'completed' && step.status !== 'skipped') {
      try {
        await dismissReminder(step.linkedReminderId);
      } catch (err) {
        // Continue
      }
    }
  }
}
