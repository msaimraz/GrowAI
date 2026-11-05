/**
 * GrowAI Phase 9.1: Deterministic Reminder Status Engine
 * Pure functions to compute and evaluate reminder statuses without side effects or clock skew surprises.
 */

import { Reminder, ReminderStatus, NotificationPreferences } from '@/types/reminder';
import { isReminderAllowedByPreferences } from './reminder-preferences';

/**
 * Normalizes any valid ISO or Date input to a Date object.
 * Returns null if invalid or unparseable.
 */
export function parseDateSafe(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Pure function: Computes the live deterministic status of a reminder.
 *
 * Rules:
 * 1. Terminal states (completed, dismissed, cancelled) always preserve their state.
 *    - Overdue does NOT become completed.
 *    - Dismissed does NOT become completed.
 * 2. If not in a terminal state:
 *    - If dueAt is in the future (> now):
 *      - If scheduledFor <= now: it is 'due' (open window)
 *      - If scheduledFor > now: it is 'scheduled' (future)
 *      - By default, if current date matches dueAt date (same calendar day), it is 'due'.
 *    - If dueAt has passed (< now):
 *      - If dueAt is on the same calendar day as now: considered 'due' for the day
 *      - If dueAt is prior to today (strictly past calendar day or > 12h elapsed): it is 'overdue'
 */
export function getReminderStatus(
  reminder: Pick<Reminder, 'status' | 'dueAt' | 'scheduledFor' | 'completedAt' | 'dismissedAt'>,
  nowInput?: Date,
  timezone: string = 'UTC'
): ReminderStatus {
  // Respect terminal states first
  if (reminder.status === 'completed' || reminder.completedAt) {
    return 'completed';
  }
  if (reminder.status === 'dismissed' || reminder.dismissedAt) {
    return 'dismissed';
  }
  if (reminder.status === 'cancelled') {
    return 'cancelled';
  }

  const now = nowInput || new Date();
  const dueDate = parseDateSafe(reminder.dueAt);
  if (!dueDate) return 'scheduled';

  const scheduledDate = parseDateSafe(reminder.scheduledFor) || dueDate;

  const nowTime = now.getTime();
  const dueTime = dueDate.getTime();
  const scheduledTime = scheduledDate.getTime();

  // If scheduled in the future
  if (scheduledTime > nowTime) {
    return 'scheduled';
  }

  // Calculate day difference in the given timezone or UTC
  // Normalize both dates to midnight
  const nowYear = now.getUTCFullYear();
  const nowMonth = now.getUTCMonth();
  const nowDate = now.getUTCDate();
  const nowMidnightUtc = Date.UTC(nowYear, nowMonth, nowDate);

  const dueYear = dueDate.getUTCFullYear();
  const dueMonth = dueDate.getUTCMonth();
  const dueDay = dueDate.getUTCDate();
  const dueMidnightUtc = Date.UTC(dueYear, dueMonth, dueDay);

  const diffDays = Math.floor((nowMidnightUtc - dueMidnightUtc) / (1000 * 60 * 60 * 24));

  if (diffDays > 0) {
    // Due date was strictly before today -> overdue
    return 'overdue';
  }

  if (diffDays === 0) {
    // Due date is today -> due
    return 'due';
  }

  // Due date is in future days
  return 'scheduled';
}

/**
 * Checks whether a reminder is active (not completed, not dismissed, not cancelled).
 */
export function isReminderActive(reminder: Pick<Reminder, 'status' | 'completedAt' | 'dismissedAt'>): boolean {
  if (reminder.status === 'completed' || reminder.completedAt) return false;
  if (reminder.status === 'dismissed' || reminder.dismissedAt) return false;
  if (reminder.status === 'cancelled') return false;
  return true;
}

/**
 * Checks if a reminder is currently due or overdue.
 */
export function isReminderDueOrOverdue(
  reminder: Pick<Reminder, 'status' | 'dueAt' | 'scheduledFor' | 'completedAt' | 'dismissedAt'>,
  now?: Date
): boolean {
  if (!isReminderActive(reminder)) return false;
  const status = getReminderStatus(reminder, now);
  return status === 'due' || status === 'overdue';
}

/**
 * Calculates unread count of active reminders that are due or overdue and permitted by user preferences.
 * Dismissed, completed, and cancelled reminders are strictly excluded.
 */
export function getUnreadActiveRemindersCount(
  reminders: Reminder[],
  preferences?: NotificationPreferences | null,
  nowInput?: Date
): number {
  const now = nowInput || new Date();
  let count = 0;

  for (const reminder of reminders) {
    if (!isReminderActive(reminder)) continue;
    if (reminder.isRead) continue;

    // Check user category preferences if supplied
    if (preferences && !isReminderAllowedByPreferences(reminder, preferences)) {
      continue;
    }

    const currentStatus = getReminderStatus(reminder, now);
    if (currentStatus === 'due' || currentStatus === 'overdue') {
      count++;
    }
  }

  return count;
}

