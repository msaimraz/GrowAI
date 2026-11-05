/**
 * GrowAI Phase 9.1: Reminder Recurrence Engine
 * Validates recurrence rules and computes next occurrence dates deterministically.
 * Avoids generating hundreds of future rows by computing on completion.
 */

import { ReminderRecurrence, RecurrenceType } from '@/types/reminder';
import { parseDateSafe } from './reminder-status';

export interface RecurrenceValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a recurrence specification against strict integrity rules.
 */
export function validateRecurrence(recurrence?: ReminderRecurrence | null): RecurrenceValidationResult {
  if (!recurrence || recurrence.type === 'none') {
    return { valid: true };
  }

  const validTypes: RecurrenceType[] = [
    'none',
    'daily',
    'weekly',
    'every_n_days',
    'every_n_weeks',
    'monthly',
  ];

  if (!validTypes.includes(recurrence.type)) {
    return { valid: false, error: `Invalid recurrence type: ${recurrence.type}` };
  }

  // Check interval if present or required
  if (
    recurrence.type === 'every_n_days' ||
    recurrence.type === 'every_n_weeks' ||
    recurrence.interval !== undefined
  ) {
    const intVal = recurrence.interval;
    if (intVal === undefined || intVal === null) {
      return { valid: false, error: `Recurrence interval is required for ${recurrence.type}` };
    }
    if (typeof intVal !== 'number' || isNaN(intVal)) {
      return { valid: false, error: 'Recurrence interval must be a valid number' };
    }
    if (!Number.isInteger(intVal)) {
      return { valid: false, error: 'Recurrence interval must be an integer' };
    }
    if (intVal <= 0) {
      return { valid: false, error: 'Recurrence interval must be strictly positive (greater than 0)' };
    }
    if (intVal > 365) {
      return { valid: false, error: 'Recurrence interval cannot exceed 365' };
    }
  }

  // Check optional end date
  if (recurrence.endDate) {
    const end = parseDateSafe(recurrence.endDate);
    if (!end) {
      return { valid: false, error: 'Recurrence end date is invalid' };
    }
  }

  return { valid: true };
}

/**
 * Safely adds months to a date, preserving day of month or pinning to end of month.
 * e.g. Jan 31 + 1 month -> Feb 28 (or 29 on leap year)
 */
function addMonthsSafe(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const expectedMonth = (result.getUTCMonth() + months) % 12;
  const currentDay = result.getUTCDate();

  result.setUTCMonth(result.getUTCMonth() + months);

  // If the day rolled over to the next month (e.g. Jan 31 -> Mar 2 or 3 in non-leap Feb)
  if (result.getUTCMonth() !== (expectedMonth < 0 ? expectedMonth + 12 : expectedMonth)) {
    // Set to last day of previous month
    result.setUTCDate(0);
  } else {
    result.setUTCDate(currentDay);
  }

  return result;
}

/**
 * Pure function: Calculates the next occurrence timestamp as an ISO string.
 * Returns null if non-recurring, invalid, or if the next occurrence falls after endDate.
 */
export function calculateNextOccurrence(
  currentDueAt: string,
  recurrence?: ReminderRecurrence | null,
  fromDateInput?: Date
): string | null {
  if (!recurrence || recurrence.type === 'none') {
    return null;
  }

  const validation = validateRecurrence(recurrence);
  if (!validation.valid) {
    return null;
  }

  const baseDate = parseDateSafe(currentDueAt);
  if (!baseDate) return null;

  const fromDate = fromDateInput || new Date();
  let nextDate = new Date(baseDate.getTime());

  const interval = recurrence.interval || 1;

  // Function to step forward by 1 interval
  const stepForward = (d: Date): Date => {
    const next = new Date(d.getTime());
    switch (recurrence.type) {
      case 'daily':
        next.setUTCDate(next.getUTCDate() + 1);
        return next;
      case 'weekly':
        next.setUTCDate(next.getUTCDate() + 7);
        return next;
      case 'every_n_days':
        next.setUTCDate(next.getUTCDate() + interval);
        return next;
      case 'every_n_weeks':
        next.setUTCDate(next.getUTCDate() + interval * 7);
        return next;
      case 'monthly':
        return addMonthsSafe(next, interval);
      default:
        return next;
    }
  };

  // Advance at least once
  nextDate = stepForward(nextDate);

  // If the computed next date is still in the past compared to fromDate, advance until it's in the future
  // (guards against stale recurring tasks with many missed intervals)
  let loopSafety = 0;
  while (nextDate.getTime() <= fromDate.getTime() && loopSafety < 100) {
    nextDate = stepForward(nextDate);
    loopSafety++;
  }

  // Check against optional endDate
  if (recurrence.endDate) {
    const endDate = parseDateSafe(recurrence.endDate);
    if (endDate && nextDate.getTime() > endDate.getTime()) {
      return null; // Recurrence has completed
    }
  }

  return nextDate.toISOString();
}

