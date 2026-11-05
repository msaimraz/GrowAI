/**
 * GrowAI Phase 9.1: Notification Preferences Engine
 * Manages user preferences, category filters, channels, and quiet-hours evaluation.
 */

import {
  Reminder,
  NotificationPreferences,
  NotificationCategory,
  NotificationQuietHoursPreference,
} from '@/types/reminder';
import { getReminderStatus } from './reminder-status';

/**
 * Detects the client's current runtime timezone or falls back to 'UTC'.
 */
export function detectUserTimezone(): string {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) return tz;
    }
  } catch {
    // fallback
  }
  return 'UTC';
}

/**
 * Default notification preferences adhering to Section 12:
 * - Categories: all ON
 * - In-App: ON
 * - Browser: OFF until explicitly enabled
 */
export function getDefaultNotificationPreferences(userId: string = 'demo-user'): NotificationPreferences {
  return {
    userId,
    categories: {
      care: true,
      healthFollowUp: true,
      treatment: true,
      growth: true,
      milestones: true,
      overdue: true,
    },
    channels: {
      inApp: true,
      browser: false,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00',
    },
    timezone: detectUserTimezone(),
  };
}

/**
 * Maps a reminder's source or type to the relevant notification category.
 */
export function mapReminderToCategory(
  reminder: Pick<Reminder, 'sourceType' | 'reminderType'>
): NotificationCategory | 'custom' {
  switch (reminder.sourceType) {
    case 'care_task':
      return 'care';
    case 'health_follow_up':
    case 'health_monitoring':
      return 'health_follow_up';
    case 'treatment':
      return 'treatment';
    case 'growth_observation':
      return 'growth';
    case 'growth_milestone':
    case 'planting_milestone':
      return 'milestones';
    default:
      break;
  }

  switch (reminder.reminderType) {
    case 'care':
      return 'care';
    case 'health':
      return 'health_follow_up';
    case 'treatment':
      return 'treatment';
    case 'growth':
      return 'growth';
    case 'milestone':
      return 'milestones';
    default:
      return 'custom';
  }
}

/**
 * Pure function: Checks if a reminder is allowed by the user's notification preferences.
 */
export function isReminderAllowedByPreferences(
  reminder: Pick<Reminder, 'sourceType' | 'reminderType' | 'status' | 'dueAt' | 'scheduledFor' | 'completedAt' | 'dismissedAt'>,
  preferences?: NotificationPreferences | null,
  nowInput?: Date
): boolean {
  if (!preferences) return true;

  // In-app channel must be enabled
  if (!preferences.channels.inApp) {
    return false;
  }

  const now = nowInput || new Date();
  const currentStatus = getReminderStatus(reminder, now);

  // If reminder is overdue, user must have overdue reminders enabled
  if (currentStatus === 'overdue' && !preferences.categories.overdue) {
    return false;
  }

  const category = mapReminderToCategory(reminder);
  switch (category) {
    case 'care':
      return preferences.categories.care;
    case 'health_follow_up':
      return preferences.categories.healthFollowUp;
    case 'treatment':
      return preferences.categories.treatment;
    case 'growth':
      return preferences.categories.growth;
    case 'milestones':
      return preferences.categories.milestones;
    case 'custom':
    default:
      return true;
  }
}

/**
 * Evaluates whether the given timestamp falls within configured quiet hours.
 */
export function isInQuietHours(
  nowInput?: Date,
  quietHours?: NotificationQuietHoursPreference,
  timezone: string = 'UTC'
): boolean {
  if (!quietHours || !quietHours.enabled) return false;
  if (!quietHours.start || !quietHours.end) return false;

  const now = nowInput || new Date();

  // Extract hours and minutes in the requested timezone
  let hours = now.getUTCHours();
  let minutes = now.getUTCMinutes();

  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const hPart = parts.find((p) => p.type === 'hour');
    const mPart = parts.find((p) => p.type === 'minute');
    if (hPart) hours = parseInt(hPart.value, 10);
    if (mPart) minutes = parseInt(mPart.value, 10);
  } catch {
    // fallback to UTC
  }

  const currentMinutes = hours * 60 + minutes;

  const [startH, startM] = quietHours.start.split(':').map((v) => parseInt(v, 10) || 0);
  const [endH, endM] = quietHours.end.split(':').map((v) => parseInt(v, 10) || 0);

  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  if (startMinutes < endMinutes) {
    // Same-day quiet hours (e.g. 13:00 to 15:00)
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  } else {
    // Overnight quiet hours (e.g. 22:00 to 08:00)
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
}

