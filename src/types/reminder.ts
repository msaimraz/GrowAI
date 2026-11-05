/**
 * GrowAI Phase 9.1: Notifications & Reminders Domain Types
 * Strongly typed models for the generic, reusable reminder and notification infrastructure.
 */

export type ReminderSourceType =
  | 'care_task'
  | 'health_follow_up'
  | 'treatment'
  | 'growth_observation'
  | 'growth_milestone'
  | 'planting_milestone'
  | 'health_monitoring'
  | 'feeding'
  | 'propagation'
  | 'harvest'
  | 'production'
  | 'manual';

export type ReminderType =
  | 'care'
  | 'health'
  | 'treatment'
  | 'growth'
  | 'milestone'
  | 'feeding'
  | 'propagation'
  | 'harvest'
  | 'production'
  | 'custom';

export type ReminderStatus =
  | 'scheduled'
  | 'due'
  | 'overdue'
  | 'completed'
  | 'dismissed'
  | 'cancelled';

export type ReminderPriority = 'low' | 'normal' | 'high' | 'urgent';

export type RecurrenceType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'every_n_days'
  | 'every_n_weeks'
  | 'monthly';

export type RecurrenceUnit = 'days' | 'weeks' | 'months';

export interface ReminderRecurrence {
  type: RecurrenceType;
  interval?: number; // Must be positive integer >= 1
  unit?: RecurrenceUnit;
  endDate?: string | null; // ISO 8601 string or YYYY-MM-DD
}

export interface Reminder {
  id: string;
  userId: string;
  plantId?: string | null;
  plantNickname?: string | null;
  plantSlug?: string | null;
  sourceType: ReminderSourceType;
  sourceId?: string | null;
  reminderType: ReminderType;
  title: string;
  body: string;
  scheduledFor: string; // ISO 8601 timestamp
  dueAt: string;        // ISO 8601 timestamp
  recurrence?: ReminderRecurrence | null;
  priority: ReminderPriority;
  status: ReminderStatus;
  completedAt?: string | null;
  dismissedAt?: string | null;
  isRead: boolean;
  metadata?: {
    taskType?: string;
    conditionName?: string;
    treatmentActionType?: string;
    targetStage?: string;
    followUpOutcome?: string;
    actionUrl?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt: string;
}

export type NotificationChannel = 'in_app' | 'browser';

export type NotificationCategory =
  | 'care'
  | 'health_follow_up'
  | 'treatment'
  | 'growth'
  | 'milestones'
  | 'overdue';

export interface NotificationCategoriesPreference {
  care: boolean;
  healthFollowUp: boolean;
  treatment: boolean;
  growth: boolean;
  milestones: boolean;
  overdue: boolean;
}

export interface NotificationChannelsPreference {
  inApp: boolean;
  browser: boolean;
}

export interface NotificationQuietHoursPreference {
  enabled: boolean;
  start: string; // e.g. "22:00"
  end: string;   // e.g. "08:00"
}

export interface NotificationPreferences {
  id?: string;
  userId: string;
  categories: NotificationCategoriesPreference;
  channels: NotificationChannelsPreference;
  quietHours?: NotificationQuietHoursPreference;
  timezone: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReminderInput {
  plantId?: string | null;
  plantNickname?: string | null;
  plantSlug?: string | null;
  sourceType: ReminderSourceType;
  sourceId?: string | null;
  reminderType: ReminderType;
  title: string;
  body: string;
  scheduledFor?: string; // defaults to now
  dueAt: string;
  recurrence?: ReminderRecurrence | null;
  priority?: ReminderPriority;
  metadata?: Record<string, any>;
}

export interface UpdateReminderInput {
  title?: string;
  body?: string;
  dueAt?: string;
  scheduledFor?: string;
  recurrence?: ReminderRecurrence | null;
  priority?: ReminderPriority;
  status?: ReminderStatus;
  isRead?: boolean;
  plantId?: string | null;
  plantNickname?: string | null;
  plantSlug?: string | null;
  metadata?: Record<string, any>;
}

export type BrowserPermissionState = 'unsupported' | 'default' | 'granted' | 'denied';

