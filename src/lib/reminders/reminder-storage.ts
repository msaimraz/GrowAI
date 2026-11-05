/**
 * GrowAI Phase 9.2: Production Reminder Storage, Idempotency & Persistence Adapter
 * Supports Supabase Postgres with RLS when authenticated, honest offline queueing,
 * idempotent reminder generation, source reconciliation, and preference management.
 */

import {
  Reminder,
  CreateReminderInput,
  UpdateReminderInput,
  NotificationPreferences,
  ReminderStatus,
} from '@/types/reminder';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { getDefaultNotificationPreferences } from './reminder-preferences';
import { calculateNextOccurrence, validateRecurrence } from './reminder-recurrence';
import { getReminderStatus } from './reminder-status';
import {
  generateCareTaskReminders,
  generateHealthFollowUpReminders,
  generateTreatmentReminders,
  generateMilestoneReminders,
} from './reminder-generator';
import { CareTask, UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import type { DatabaseSchema } from '@/lib/supabase';

const DEMO_REMINDERS_KEY = 'growai_demo_reminders_v1';
const DEMO_PREFERENCES_KEY = 'growai_demo_notification_preferences_v1';
const PENDING_MUTATIONS_KEY = 'growai_pending_reminder_mutations';

export interface PendingReminderMutation {
  id: string;
  type: 'create' | 'update' | 'complete' | 'dismiss' | 'delete';
  reminderId?: string;
  payload?: any;
  timestamp: string;
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') {
    return navigator.onLine;
  }
  return true;
}

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return null;
}

export function getPendingMutations(): PendingReminderMutation[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(PENDING_MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingMutations(queue: PendingReminderMutation[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(PENDING_MUTATIONS_KEY, JSON.stringify(queue));
  } catch {}
}

export function getPendingMutationsCount(): number {
  return getPendingMutations().length;
}

export function clearPendingMutations(): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(PENDING_MUTATIONS_KEY);
  } catch {}
}

function mapDatabaseToReminder(row: any): Reminder {
  return {
    id: row.id,
    userId: row.user_id,
    plantId: row.plant_id,
    plantNickname: row.plant_nickname,
    plantSlug: row.plant_slug,
    sourceType: row.source_type,
    sourceId: row.source_id,
    reminderType: row.reminder_type,
    title: row.title,
    body: row.body || '',
    scheduledFor: row.scheduled_for,
    dueAt: row.due_at,
    recurrence: row.recurrence,
    priority: row.priority || 'normal',
    status: row.status,
    completedAt: row.completed_at,
    dismissedAt: row.dismissed_at,
    isRead: Boolean(row.is_read),
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Seeds initial demo reminders if localStorage is empty
 */
function getDemoReminders(): Reminder[] {
  const storage = getStorage();
  if (storage) {
    try {
      const stored = storage.getItem(DEMO_REMINDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
  }

  const now = new Date();
  const todayDue = new Date(now.getTime());
  todayDue.setUTCHours(9, 0, 0, 0);

  const tomorrowDue = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  tomorrowDue.setUTCHours(9, 0, 0, 0);

  const seed: Reminder[] = [
    {
      id: 'demo-rem-1',
      userId: 'demo-user',
      plantId: 'plant-1',
      plantNickname: 'Sweet Basil #1',
      plantSlug: 'sweet-basil',
      sourceType: 'care_task',
      reminderType: 'care',
      title: 'Water Sweet Basil #1',
      body: 'Morning deep watering scheduled for your kitchen basil.',
      scheduledFor: todayDue.toISOString(),
      dueAt: todayDue.toISOString(),
      recurrence: { type: 'daily', interval: 1 },
      priority: 'normal',
      status: 'due',
      isRead: false,
      metadata: { taskType: 'water' },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'demo-rem-2',
      userId: 'demo-user',
      plantId: 'plant-2',
      plantNickname: 'Roma Tomato #1',
      plantSlug: 'roma-tomato',
      sourceType: 'health_follow_up',
      reminderType: 'health',
      title: 'Plant health follow-up for Roma Tomato #1',
      body: 'Review previously recorded observation for Spider Mites hypothesis. Check leaf undersides for fine webbing.',
      scheduledFor: todayDue.toISOString(),
      dueAt: todayDue.toISOString(),
      priority: 'high',
      status: 'due',
      isRead: false,
      metadata: { conditionName: 'Spider Mites' },
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
    {
      id: 'demo-rem-3',
      userId: 'demo-user',
      plantId: 'plant-1',
      plantNickname: 'Sweet Basil #1',
      plantSlug: 'sweet-basil',
      sourceType: 'growth_observation',
      reminderType: 'growth',
      title: 'Growth check for Sweet Basil #1',
      body: 'Consider recording a new growth observation or taking a progress photograph.',
      scheduledFor: tomorrowDue.toISOString(),
      dueAt: tomorrowDue.toISOString(),
      recurrence: { type: 'every_n_days', interval: 7 },
      priority: 'low',
      status: 'scheduled',
      isRead: true,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    },
  ];

  if (storage) {
    try {
      storage.setItem(DEMO_REMINDERS_KEY, JSON.stringify(seed));
    } catch {}
  }
  return seed;
}

function saveDemoReminders(reminders: Reminder[]): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(DEMO_REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.error('Failed to save demo reminders to storage:', err);
  }
}

/**
 * Fetches all reminders for the authenticated user (or local demo).
 */
export async function fetchUserReminders(options?: {
  plantId?: string;
  status?: ReminderStatus;
}): Promise<{ reminders: Reminder[]; error?: string; isCloud: boolean }> {
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    let list = getDemoReminders();
    if (options?.plantId) {
      list = list.filter((r) => r.plantId === options.plantId);
    }
    if (options?.status) {
      list = list.filter((r) => r.status === options.status);
    }
    return { reminders: list, isCloud: false };
  }

  const supabase = createClient();
  if (!supabase) {
    return { reminders: getDemoReminders(), isCloud: false };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return { reminders: getDemoReminders(), isCloud: false };
    }

    let query = supabase
      .from('reminders')
      .select('*')
      .order('due_at', { ascending: true });

    if (options?.plantId) {
      query = query.eq('plant_id', options.plantId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[Reminders] Cloud fetch error, falling back to local cache:', error.message);
      return { reminders: getDemoReminders(), error: error.message, isCloud: false };
    }

    const mapped: Reminder[] = (data || []).map(mapDatabaseToReminder);

    // Merge any locally pending mutations into memory view
    const pending = getPendingMutations();
    if (pending.length > 0) {
      for (const p of pending) {
        if (p.type === 'complete' && p.reminderId) {
          const target = mapped.find((r) => r.id === p.reminderId);
          if (target) {
            target.status = 'completed';
            target.completedAt = p.timestamp;
            target.metadata = { ...target.metadata, syncPending: true };
          }
        } else if (p.type === 'dismiss' && p.reminderId) {
          const target = mapped.find((r) => r.id === p.reminderId);
          if (target) {
            target.status = 'dismissed';
            target.dismissedAt = p.timestamp;
            target.metadata = { ...target.metadata, syncPending: true };
          }
        }
      }
    }

    return { reminders: mapped, isCloud: true };
  } catch (err: any) {
    return { reminders: getDemoReminders(), error: err.message, isCloud: false };
  }
}

/**
 * Creates a new reminder with strict validation and idempotency protection.
 * If an active reminder already exists for the given source, returns the existing active reminder.
 */
export async function createReminder(
  input: CreateReminderInput
): Promise<{ reminder?: Reminder; error?: string; isPendingSync?: boolean }> {
  // Validate recurrence if supplied
  if (input.recurrence) {
    const validation = validateRecurrence(input.recurrence);
    if (!validation.valid) {
      return { error: validation.error };
    }
  }

  const now = new Date();
  const scheduledFor = input.scheduledFor || now.toISOString();
  const dueAt = input.dueAt || scheduledFor;

  const tempReminder: Pick<Reminder, 'status' | 'dueAt' | 'scheduledFor' | 'completedAt' | 'dismissedAt'> = {
    status: 'scheduled',
    dueAt,
    scheduledFor,
  };
  const computedStatus = getReminderStatus(tempReminder, now);

  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const current = getDemoReminders();

    // Application Idempotency check: if active reminder exists for this source, return existing
    if (input.sourceType && input.sourceId) {
      const existing = current.find(
        (r) =>
          r.sourceType === input.sourceType &&
          r.sourceId === input.sourceId &&
          (r.status === 'scheduled' || r.status === 'due' || r.status === 'overdue')
      );
      if (existing) {
        return { reminder: existing };
      }
    }

    const newRem: Reminder = {
      id: generateUuid(),
      userId: 'demo-user',
      plantId: input.plantId || null,
      plantNickname: input.plantNickname || null,
      plantSlug: input.plantSlug || null,
      sourceType: input.sourceType,
      sourceId: input.sourceId || null,
      reminderType: input.reminderType,
      title: input.title,
      body: input.body,
      scheduledFor,
      dueAt,
      recurrence: input.recurrence || null,
      priority: input.priority || 'normal',
      status: computedStatus,
      isRead: false,
      metadata: input.metadata || {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    saveDemoReminders([newRem, ...current]);
    return { reminder: newRem };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return { error: 'Authentication required' };
    }

    // Plant ownership validation: verify plant belongs to authenticated user if plantId provided
    if (input.plantId) {
      const { data: plantCheck, error: plantError } = await supabase
        .from('user_plants')
        .select('id')
        .eq('id', input.plantId)
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (plantError || !plantCheck) {
        return { error: 'Plant does not exist or belong to authenticated user' };
      }
    }

    // Application Idempotency check: query active reminder for (user_id, source_type, source_id)
    if (input.sourceType && input.sourceId) {
      const { data: existingActive } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', authData.user.id)
        .eq('source_type', input.sourceType)
        .eq('source_id', input.sourceId)
        .in('status', ['scheduled', 'due', 'overdue'])
        .maybeSingle();

      if (existingActive) {
        return { reminder: mapDatabaseToReminder(existingActive) };
      }
    }

    const { data, error } = await supabase
      .from('reminders')
      .insert({
        user_id: authData.user.id,
        plant_id: input.plantId || null,
        plant_nickname: input.plantNickname || null,
        plant_slug: input.plantSlug || null,
        source_type: input.sourceType,
        source_id: input.sourceId || null,
        reminder_type: input.reminderType,
        title: input.title,
        body: input.body,
        scheduled_for: scheduledFor,
        due_at: dueAt,
        recurrence: input.recurrence || null,
        priority: input.priority || 'normal',
        status: computedStatus,
        is_read: false,
        metadata: input.metadata || {},
      })
      .select()
      .single();

    if (error) {
      // If unique violation occurred (concurrent insert on uq_reminders_active_source), fetch existing
      if (error.code === '23505' && input.sourceId) {
        const { data: conflictActive } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', authData.user.id)
          .eq('source_type', input.sourceType)
          .eq('source_id', input.sourceId)
          .in('status', ['scheduled', 'due', 'overdue'])
          .maybeSingle();
        if (conflictActive) {
          return { reminder: mapDatabaseToReminder(conflictActive) };
        }
      }
      return { error: error.message };
    }

    return { reminder: mapDatabaseToReminder(data) };
  } catch (err: any) {
    // If offline, queue mutation honestly
    if (!isOnline() || err.message?.includes('Failed to fetch')) {
      const pendingRem: Reminder = {
        id: generateUuid(),
        userId: 'pending-user',
        plantId: input.plantId || null,
        plantNickname: input.plantNickname || null,
        plantSlug: input.plantSlug || null,
        sourceType: input.sourceType,
        sourceId: input.sourceId || null,
        reminderType: input.reminderType,
        title: input.title,
        body: input.body,
        scheduledFor,
        dueAt,
        recurrence: input.recurrence || null,
        priority: input.priority || 'normal',
        status: computedStatus,
        isRead: false,
        metadata: { ...(input.metadata || {}), syncPending: true },
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      const queue = getPendingMutations();
      queue.push({
        id: generateUuid(),
        type: 'create',
        payload: input,
        timestamp: now.toISOString(),
      });
      savePendingMutations(queue);
      const list = getDemoReminders();
      saveDemoReminders([pendingRem, ...list]);
      return { reminder: pendingRem, isPendingSync: true };
    }
    return { error: err.message };
  }
}

/**
 * Updates an existing reminder with safe field updates and plant validation.
 */
export async function updateReminder(
  id: string,
  updates: Partial<UpdateReminderInput>
): Promise<{ reminder?: Reminder; error?: string; isPendingSync?: boolean }> {
  if (updates.recurrence) {
    const val = validateRecurrence(updates.recurrence);
    if (!val.valid) return { error: val.error };
  }

  const isCloud = isSupabaseConfigured();
  const now = new Date();

  if (!isCloud) {
    const list = getDemoReminders();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return { error: 'Reminder not found' };

    const current = list[index];
    const updated: Reminder = {
      ...current,
      title: updates.title !== undefined ? updates.title : current.title,
      body: updates.body !== undefined ? updates.body : current.body,
      dueAt: updates.dueAt !== undefined ? updates.dueAt : current.dueAt,
      scheduledFor: updates.scheduledFor !== undefined ? updates.scheduledFor : current.scheduledFor,
      recurrence: updates.recurrence !== undefined ? updates.recurrence : current.recurrence,
      priority: updates.priority !== undefined ? updates.priority : current.priority,
      status: updates.status !== undefined ? updates.status : current.status,
      isRead: updates.isRead !== undefined ? updates.isRead : current.isRead,
      plantId: updates.plantId !== undefined ? updates.plantId : current.plantId,
      plantNickname: updates.plantNickname !== undefined ? updates.plantNickname : current.plantNickname,
      plantSlug: updates.plantSlug !== undefined ? updates.plantSlug : current.plantSlug,
      metadata: updates.metadata !== undefined ? { ...current.metadata, ...updates.metadata } : current.metadata,
      updatedAt: now.toISOString(),
    };

    if (updates.status === 'completed' && !updated.completedAt) {
      updated.completedAt = now.toISOString();
    } else if (updates.status === 'dismissed' && !updated.dismissedAt) {
      updated.dismissedAt = now.toISOString();
    }

    list[index] = updated;
    saveDemoReminders(list);
    return { reminder: updated };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Authentication required' };

    // Plant ownership validation if plantId is modified
    if (updates.plantId) {
      const { data: plantCheck, error: plantError } = await supabase
        .from('user_plants')
        .select('id')
        .eq('id', updates.plantId)
        .eq('user_id', authData.user.id)
        .maybeSingle();

      if (plantError || !plantCheck) {
        return { error: 'Plant does not exist or belong to authenticated user' };
      }
    }

    const payload: DatabaseSchema['public']['Tables']['reminders']['Update'] = {
      updated_at: now.toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title;
    if (updates.body !== undefined) payload.body = updates.body;
    if (updates.dueAt !== undefined) payload.due_at = updates.dueAt;
    if (updates.scheduledFor !== undefined) payload.scheduled_for = updates.scheduledFor;
    if (updates.recurrence !== undefined) payload.recurrence = updates.recurrence;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.status !== undefined) {
      payload.status = updates.status;
      if (updates.status === 'completed') payload.completed_at = now.toISOString();
      if (updates.status === 'dismissed') payload.dismissed_at = now.toISOString();
    }
    if (updates.isRead !== undefined) payload.is_read = updates.isRead;
    if (updates.plantId !== undefined) payload.plant_id = updates.plantId;
    if (updates.plantNickname !== undefined) payload.plant_nickname = updates.plantNickname;
    if (updates.plantSlug !== undefined) payload.plant_slug = updates.plantSlug;
    if (updates.metadata !== undefined) payload.metadata = updates.metadata;

    const { data, error } = await supabase
      .from('reminders')
      .update(payload)
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { reminder: mapDatabaseToReminder(data) };
  } catch (err: any) {
    if (!isOnline() || err.message?.includes('Failed to fetch')) {
      const queue = getPendingMutations();
      queue.push({
        id: generateUuid(),
        type: 'update',
        reminderId: id,
        payload: updates,
        timestamp: now.toISOString(),
      });
      savePendingMutations(queue);
      return { error: 'Saved locally. Pending server synchronization.', isPendingSync: true };
    }
    return { error: err.message };
  }
}

/**
 * Marks a reminder as completed.
 * Guarantees single-instance recurrence materialization (calling complete twice never creates duplicate next occurrences).
 */
export async function completeReminder(
  id: string
): Promise<{ reminder?: Reminder; nextReminder?: Reminder; error?: string; isPendingSync?: boolean }> {
  const now = new Date();
  const completedAt = now.toISOString();
  const isCloud = isSupabaseConfigured();

  if (!isCloud) {
    const list = getDemoReminders();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return { error: 'Reminder not found' };

    const target = list[index];

    // Idempotency: if already completed, do not re-materialize next recurrence
    if (target.status === 'completed') {
      return { reminder: target };
    }

    const completedRem: Reminder = {
      ...target,
      status: 'completed',
      completedAt,
      isRead: true,
      updatedAt: completedAt,
    };
    list[index] = completedRem;

    // Check recurrence: materialize single next occurrence
    let nextRem: Reminder | undefined = undefined;
    if (target.recurrence && target.recurrence.type !== 'none') {
      const nextDue = calculateNextOccurrence(target.dueAt, target.recurrence, now);
      if (nextDue) {
        nextRem = {
          ...target,
          id: generateUuid(),
          scheduledFor: nextDue,
          dueAt: nextDue,
          status: 'scheduled',
          completedAt: null,
          dismissedAt: null,
          isRead: false,
          createdAt: completedAt,
          updatedAt: completedAt,
        };
        list.unshift(nextRem);
      }
    }

    saveDemoReminders(list);
    return { reminder: completedRem, nextReminder: nextRem };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Authentication required' };

    // Fetch existing row to check if already completed
    const { data: existing, error: fetchErr } = await supabase
      .from('reminders')
      .select('*')
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .single();

    if (fetchErr || !existing) {
      return { error: 'Reminder not found or unauthorized' };
    }

    // Idempotency check: if already completed, return existing without generating duplicate recurrence
    if (existing.status === 'completed') {
      return { reminder: mapDatabaseToReminder(existing) };
    }

    const { data, error } = await supabase
      .from('reminders')
      .update({
        status: 'completed',
        completed_at: completedAt,
        is_read: true,
      })
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (error) return { error: error.message };

    const completed = mapDatabaseToReminder(data);

    // If recurring, materialize the next single occurrence
    let nextCreated: Reminder | undefined = undefined;
    if (completed.recurrence && completed.recurrence.type !== 'none') {
      const nextDue = calculateNextOccurrence(completed.dueAt, completed.recurrence, now);
      if (nextDue) {
        const nextRes = await createReminder({
          plantId: completed.plantId,
          plantNickname: completed.plantNickname,
          plantSlug: completed.plantSlug,
          sourceType: completed.sourceType,
          sourceId: completed.sourceId,
          reminderType: completed.reminderType,
          title: completed.title,
          body: completed.body,
          scheduledFor: nextDue,
          dueAt: nextDue,
          recurrence: completed.recurrence,
          priority: completed.priority,
          metadata: completed.metadata,
        });
        nextCreated = nextRes.reminder;
      }
    }

    return { reminder: completed, nextReminder: nextCreated };
  } catch (err: any) {
    if (!isOnline() || err.message?.includes('Failed to fetch')) {
      const queue = getPendingMutations();
      queue.push({
        id: generateUuid(),
        type: 'complete',
        reminderId: id,
        timestamp: completedAt,
      });
      savePendingMutations(queue);
      return { error: 'Completed locally. Pending server synchronization.', isPendingSync: true };
    }
    return { error: err.message };
  }
}

/**
 * Marks a reminder as dismissed.
 */
export async function dismissReminder(
  id: string
): Promise<{ reminder?: Reminder; error?: string; isPendingSync?: boolean }> {
  const now = new Date();
  const dismissedAt = now.toISOString();

  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const list = getDemoReminders();
    const index = list.findIndex((r) => r.id === id);
    if (index === -1) return { error: 'Reminder not found' };

    const target = list[index];
    const dismissedRem: Reminder = {
      ...target,
      status: 'dismissed',
      dismissedAt,
      isRead: true,
      updatedAt: dismissedAt,
    };
    list[index] = dismissedRem;
    saveDemoReminders(list);
    return { reminder: dismissedRem };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Authentication required' };

    const { data, error } = await supabase
      .from('reminders')
      .update({
        status: 'dismissed',
        dismissed_at: dismissedAt,
        is_read: true,
      })
      .eq('id', id)
      .eq('user_id', authData.user.id)
      .select()
      .single();

    if (error) return { error: error.message };
    return { reminder: mapDatabaseToReminder(data) };
  } catch (err: any) {
    if (!isOnline() || err.message?.includes('Failed to fetch')) {
      const queue = getPendingMutations();
      queue.push({
        id: generateUuid(),
        type: 'dismiss',
        reminderId: id,
        timestamp: dismissedAt,
      });
      savePendingMutations(queue);
      return { error: 'Dismissed locally. Pending server synchronization.', isPendingSync: true };
    }
    return { error: err.message };
  }
}

/**
 * Permanently deletes a reminder.
 */
export async function deleteReminder(
  id: string
): Promise<{ success: boolean; error?: string; isPendingSync?: boolean }> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const list = getDemoReminders();
    const filtered = list.filter((r) => r.id !== id);
    saveDemoReminders(filtered);
    return { success: true };
  }

  const supabase = createClient();
  if (!supabase) return { success: false, error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false, error: 'Authentication required' };

    const { error } = await supabase
      .from('reminders')
      .delete()
      .eq('id', id)
      .eq('user_id', authData.user.id);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    if (!isOnline() || err.message?.includes('Failed to fetch')) {
      const queue = getPendingMutations();
      queue.push({
        id: generateUuid(),
        type: 'delete',
        reminderId: id,
        timestamp: new Date().toISOString(),
      });
      savePendingMutations(queue);
      return { success: true, isPendingSync: true };
    }
    return { success: false, error: err.message };
  }
}

/**
 * Marks given reminder IDs as read.
 */
export async function markRemindersAsRead(ids: string[]): Promise<{ success: boolean }> {
  if (!ids || ids.length === 0) return { success: true };

  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const list = getDemoReminders();
    for (const r of list) {
      if (ids.includes(r.id)) {
        r.isRead = true;
      }
    }
    saveDemoReminders(list);
    return { success: true };
  }

  const supabase = createClient();
  if (!supabase) return { success: false };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { success: false };

    await supabase
      .from('reminders')
      .update({ is_read: true })
      .in('id', ids)
      .eq('user_id', authData.user.id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Fetches user notification preferences.
 */
export async function fetchNotificationPreferences(): Promise<{
  preferences: NotificationPreferences;
  error?: string;
}> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const storage = getStorage();
    if (storage) {
      try {
        const stored = storage.getItem(DEMO_PREFERENCES_KEY);
        if (stored) {
          return { preferences: JSON.parse(stored) };
        }
      } catch {}
    }
    const def = getDefaultNotificationPreferences('demo-user');
    return { preferences: def };
  }

  const supabase = createClient();
  if (!supabase) {
    return { preferences: getDefaultNotificationPreferences() };
  }

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      return { preferences: getDefaultNotificationPreferences() };
    }

    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', authData.user.id)
      .maybeSingle();

    if (error) {
      return { preferences: getDefaultNotificationPreferences(authData.user.id), error: error.message };
    }

    if (!data) {
      const def = getDefaultNotificationPreferences(authData.user.id);
      return { preferences: def };
    }

    return {
      preferences: {
        id: data.id,
        userId: data.user_id,
        categories: data.categories,
        channels: data.channels,
        quietHours: data.quiet_hours,
        timezone: data.timezone || 'UTC',
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (err: any) {
    return { preferences: getDefaultNotificationPreferences(), error: err.message };
  }
}

/**
 * Updates user notification preferences.
 */
export async function updateNotificationPreferences(
  updates: Partial<NotificationPreferences>
): Promise<{ preferences?: NotificationPreferences; error?: string }> {
  const isCloud = isSupabaseConfigured();
  if (!isCloud) {
    const current = (await fetchNotificationPreferences()).preferences;
    const merged: NotificationPreferences = {
      ...current,
      ...updates,
      categories: { ...current.categories, ...(updates.categories || {}) },
      channels: { ...current.channels, ...(updates.channels || {}) },
      quietHours: updates.quietHours !== undefined ? updates.quietHours : current.quietHours,
      timezone: updates.timezone !== undefined ? updates.timezone : current.timezone,
      updatedAt: new Date().toISOString(),
    };
    const storage = getStorage();
    if (storage) {
      try {
        storage.setItem(DEMO_PREFERENCES_KEY, JSON.stringify(merged));
      } catch {}
    }
    return { preferences: merged };
  }

  const supabase = createClient();
  if (!supabase) return { error: 'Database unavailable' };

  try {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) return { error: 'Authentication required' };

    const current = (await fetchNotificationPreferences()).preferences;
    const mergedPayload = {
      user_id: authData.user.id,
      categories: { ...current.categories, ...(updates.categories || {}) },
      channels: { ...current.channels, ...(updates.channels || {}) },
      quiet_hours: updates.quietHours !== undefined ? updates.quietHours : current.quietHours,
      timezone: updates.timezone || current.timezone || 'UTC',
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .upsert(mergedPayload, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) return { error: error.message };

    return {
      preferences: {
        id: data.id,
        userId: data.user_id,
        categories: data.categories,
        channels: data.channels,
        quietHours: data.quiet_hours,
        timezone: data.timezone,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

/**
 * Idempotently synchronizes reminders from existing garden tasks, health diagnoses, and milestones.
 * Prevents duplicating reminders for already active sources.
 */
export async function syncRemindersWithGarden(
  plants: UserPlant[],
  tasks: CareTask[],
  diagnoses: SavedDiagnosisRecord[]
): Promise<{ syncedCount: number }> {
  const currentRes = await fetchUserReminders();
  const existingReminders = currentRes.reminders;

  // Build map of active source IDs: (source_type:source_id)
  const activeSources = new Set<string>();
  for (const r of existingReminders) {
    if (r.status === 'scheduled' || r.status === 'due' || r.status === 'overdue') {
      if (r.sourceId) {
        activeSources.add(`${r.sourceType}:${r.sourceId}`);
      }
    }
  }

  const candidates: CreateReminderInput[] = [
    ...generateCareTaskReminders(tasks, plants),
    ...generateHealthFollowUpReminders(diagnoses, plants),
    ...generateTreatmentReminders(diagnoses, plants),
    ...generateMilestoneReminders(plants),
  ];

  let syncedCount = 0;
  for (const cand of candidates) {
    const key = `${cand.sourceType}:${cand.sourceId || ''}`;
    if (cand.sourceId && activeSources.has(key)) {
      continue; // Already has an active reminder
    }

    const res = await createReminder(cand);
    if (res.reminder) {
      syncedCount++;
      if (cand.sourceId) {
        activeSources.add(key);
      }
    }
  }

  return { syncedCount };
}

/**
 * Section 10: Source Reconciliation
 * Synchronizes reminders when underlying garden entities change:
 * - Care Task completed: mark active reminder completed
 * - Care Task deleted: cancel active reminder
 * - Follow-up completed / resolved: mark follow-up reminder completed
 * - User plant deleted: cancel plant-specific reminders or dissociate general ones
 *
 * Guarantees:
 * - Never re-creates deleted tasks
 * - Never brings back completed reminders
 * - Never crashes on orphaned references
 */
export async function reconcileRemindersWithSources(params: {
  plants: UserPlant[];
  tasks: CareTask[];
  diagnoses: SavedDiagnosisRecord[];
}): Promise<{
  completedRemindersCount: number;
  cancelledRemindersCount: number;
  dissociatedRemindersCount: number;
}> {
  const currentRes = await fetchUserReminders();
  const existingReminders = currentRes.reminders;

  const knownPlantIds = new Set(params.plants.map((p) => p.id));
  const tasksMap = new Map(params.tasks.map((t) => [t.id, t]));
  const diagnosesMap = new Map(params.diagnoses.map((d) => [d.id, d]));

  let completedRemindersCount = 0;
  let cancelledRemindersCount = 0;
  let dissociatedRemindersCount = 0;

  for (const r of existingReminders) {
    // Only active reminders need reconciliation
    const isActive = r.status === 'scheduled' || r.status === 'due' || r.status === 'overdue';
    if (!isActive) continue;

    // 1. Care Task Reconciliation
    if (r.sourceType === 'care_task' && r.sourceId) {
      if (tasksMap.has(r.sourceId)) {
        const task = tasksMap.get(r.sourceId)!;
        if (task.completed) {
          await completeReminder(r.id);
          completedRemindersCount++;
          continue;
        }
      } else {
        // Task was deleted from garden! Cancel active reminder
        await updateReminder(r.id, { status: 'cancelled' });
        cancelledRemindersCount++;
        continue;
      }
    }

    // 2. Health Follow-up Reconciliation
    if (r.sourceType === 'health_follow_up' && r.sourceId) {
      let isResolved = false;
      // Check if sourceId corresponds to diagnosis id or follow-up id
      const diag = diagnosesMap.get(r.sourceId);
      if (diag) {
        if (diag.overallHealth === 'healthy' || diag.followUps?.some((f) => f.outcomeStatus === 'resolved')) {
          isResolved = true;
        }
      } else {
        for (const d of params.diagnoses) {
          if (d.followUps?.some((f) => f.id === r.sourceId && f.outcomeStatus === 'resolved')) {
            isResolved = true;
            break;
          }
        }
      }

      if (isResolved) {
        await completeReminder(r.id);
        completedRemindersCount++;
        continue;
      }
    }

    // 3. Deleted Plant / Orphaned Reference Reconciliation
    if (r.plantId && !knownPlantIds.has(r.plantId)) {
      if (
        r.sourceType === 'care_task' ||
        r.sourceType === 'growth_milestone' ||
        r.sourceType === 'planting_milestone'
      ) {
        // Plant-dependent reminders should be cancelled
        await updateReminder(r.id, { status: 'cancelled' });
        cancelledRemindersCount++;
      } else {
        // Observational or custom reminders are safely dissociated
        await updateReminder(r.id, { plantId: null, plantNickname: null });
        dissociatedRemindersCount++;
      }
      continue;
    }
  }

  return {
    completedRemindersCount,
    cancelledRemindersCount,
    dissociatedRemindersCount,
  };
}

/**
 * Replays any queued offline mutations when online.
 */
export async function syncPendingMutations(): Promise<{
  synced: number;
  remaining: number;
  error?: string;
}> {
  const queue = getPendingMutations();
  if (queue.length === 0) {
    return { synced: 0, remaining: 0 };
  }

  if (!isOnline()) {
    return { synced: 0, remaining: queue.length, error: 'Device is offline' };
  }

  let synced = 0;
  const remainingQueue: PendingReminderMutation[] = [];

  for (const item of queue) {
    try {
      if (item.type === 'create' && item.payload) {
        const res = await createReminder(item.payload);
        if (res.error && !res.isPendingSync) {
          remainingQueue.push(item);
        } else {
          synced++;
        }
      } else if (item.type === 'complete' && item.reminderId) {
        const res = await completeReminder(item.reminderId);
        if (res.error && !res.isPendingSync) {
          remainingQueue.push(item);
        } else {
          synced++;
        }
      } else if (item.type === 'dismiss' && item.reminderId) {
        const res = await dismissReminder(item.reminderId);
        if (res.error && !res.isPendingSync) {
          remainingQueue.push(item);
        } else {
          synced++;
        }
      } else if (item.type === 'update' && item.reminderId && item.payload) {
        const res = await updateReminder(item.reminderId, item.payload);
        if (res.error && !res.isPendingSync) {
          remainingQueue.push(item);
        } else {
          synced++;
        }
      } else if (item.type === 'delete' && item.reminderId) {
        const res = await deleteReminder(item.reminderId);
        if (!res.success && !res.isPendingSync) {
          remainingQueue.push(item);
        } else {
          synced++;
        }
      }
    } catch {
      remainingQueue.push(item);
    }
  }

  savePendingMutations(remainingQueue);
  return { synced, remaining: remainingQueue.length };
}
