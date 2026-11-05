/**
 * GrowAI Phase 13: Grow Plans Storage & Persistence Adapter
 * Supports Supabase Postgres with RLS when authenticated, honest offline queueing,
 * pending mutation synchronization, and local demo storage fallback.
 */

import {
  GrowPlan,
  GrowPlanStep,
  GrowPlanEvent,
  CreateGrowPlanParams,
  UpdateGrowPlanParams,
  PlanProgress,
} from '@/types/grow-plan';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';

const DEMO_PLANS_KEY = 'growai_demo_grow_plans_v1';
const DEMO_PLAN_EVENTS_KEY = 'growai_demo_grow_plan_events_v1';
const PENDING_PLAN_MUTATIONS_KEY = 'growai_pending_plan_mutations_v1';

export interface PendingPlanMutation {
  id: string;
  type: 'create_plan' | 'update_plan' | 'delete_plan' | 'save_step' | 'update_step' | 'delete_step' | 'record_event';
  planId?: string;
  stepId?: string;
  payload?: any;
  timestamp: string;
}

function getSupabase(): any {
  if (!isSupabaseConfigured()) return null;
  return createClient() as any;
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

// ==============================================================================
// 1. LOCAL STORAGE HELPERS
// ==============================================================================

function getLocalPlans(): GrowPlan[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_PLANS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPlans(plans: GrowPlan[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_PLANS_KEY, JSON.stringify(plans));
  } catch (err) {
    console.error('Failed to save local plans to storage:', err);
  }
}

function getLocalPlanEvents(): GrowPlanEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DEMO_PLAN_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPlanEvents(events: GrowPlanEvent[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DEMO_PLAN_EVENTS_KEY, JSON.stringify(events));
  } catch (err) {
    console.error('Failed to save local plan events to storage:', err);
  }
}

export function getPendingPlanMutations(): PendingPlanMutation[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_PLAN_MUTATIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function queuePendingMutation(mutation: Omit<PendingPlanMutation, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const queue = getPendingPlanMutations();
    queue.push({
      ...mutation,
      id: generateUuid(),
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem(PENDING_PLAN_MUTATIONS_KEY, JSON.stringify(queue));
  } catch (err) {
    console.error('Failed to queue pending plan mutation:', err);
  }
}

export function getPendingPlanMutationsCount(): number {
  return getPendingPlanMutations().length;
}

// ==============================================================================
// 2. DB MAPPING UTILITIES
// ==============================================================================

function mapDbToPlan(row: any, steps: GrowPlanStep[] = []): GrowPlan {
  const planSteps = steps.filter((s) => s.planId === row.id);
  const total = planSteps.length;
  const completed = planSteps.filter((s) => s.status === 'completed').length;
  const skipped = planSteps.filter((s) => s.status === 'skipped').length;
  const blocked = planSteps.filter((s) => s.status === 'blocked').length;
  const ready = planSteps.filter((s) => s.status === 'ready').length;
  const pending = planSteps.filter((s) => s.status === 'pending').length;
  const applicable = total - skipped;
  const completionPercentage = applicable > 0 ? Math.round((completed / applicable) * 100) : 0;

  const progress: PlanProgress = {
    totalSteps: total,
    completedSteps: completed,
    skippedSteps: skipped,
    pendingSteps: pending,
    readySteps: ready,
    blockedSteps: blocked,
    completionPercentage,
    isComplete: applicable > 0 && completed === applicable,
  };

  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || '',
    scope: row.scope,
    objective: row.objective,
    status: row.status,
    healthStatus: row.metadata?.healthStatus || (row.status === 'completed' ? 'completed' : 'on_track'),
    priority: row.priority || 'normal',
    startDate: row.start_date,
    targetDate: row.target_date,
    completedAt: row.completed_at,
    pausedAt: row.paused_at,
    cancelledAt: row.cancelled_at,
    plantId: row.plant_id,
    plantIds: row.metadata?.plantIds || (row.plant_id ? [row.plant_id] : []),
    productionCycleId: row.production_cycle_id,
    propagationEventId: row.propagation_event_id,
    steps: planSteps,
    progress,
    evidence: row.metadata?.evidence || [],
    adjustmentHistory: row.metadata?.adjustmentHistory || [],
    metadata: row.metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbToStep(row: any): GrowPlanStep {
  return {
    id: row.id,
    planId: row.plan_id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    status: row.status,
    priority: row.priority || 'normal',
    scheduledFor: row.scheduled_for,
    dueAt: row.due_at,
    completedAt: row.completed_at,
    requiresObservation: Boolean(row.requires_observation),
    requiresConfirmation: Boolean(row.requires_confirmation),
    source: row.source_type,
    evidence: row.evidence || [],
    linkedReminderId: row.reminder_id,
    linkedTimelineEventId: row.dependency_metadata?.linkedTimelineEventId,
    prerequisiteStepIds: row.dependency_metadata?.prerequisiteStepIds || [],
    metadata: row.dependency_metadata || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==============================================================================
// 3. GROW PLANS CRUD
// ==============================================================================

export async function fetchUserGrowPlans(userId?: string): Promise<{
  plans: GrowPlan[];
  isPendingSync?: boolean;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data: { user } } = await supabase.auth.getUser();
      const targetUserId = userId || user?.id;

      if (targetUserId) {
        const [plansRes, stepsRes] = await Promise.all([
          supabase
            .from('grow_plans')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false }),
          supabase
            .from('grow_plan_steps')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: true }),
        ]);

        if (plansRes.error) throw plansRes.error;
        if (stepsRes.error) throw stepsRes.error;

        const allSteps = (stepsRes.data || []).map(mapDbToStep);
        const plans = (plansRes.data || []).map((row: any) => mapDbToPlan(row, allSteps));

        // Cache in local storage for offline reading
        saveLocalPlans(plans);

        return {
          plans,
          isPendingSync: getPendingPlanMutationsCount() > 0,
        };
      }
    } catch (err: any) {
      console.warn('Cloud plans fetch failed, falling back to local storage:', err.message);
    }
  }

  // Fallback to local storage
  const local = getLocalPlans();
  return {
    plans: local,
    isPendingSync: true,
  };
}

export async function fetchGrowPlanById(planId: string): Promise<{
  plan: GrowPlan | null;
  isPendingSync?: boolean;
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const [planRes, stepsRes] = await Promise.all([
        supabase.from('grow_plans').select('*').eq('id', planId).single(),
        supabase.from('grow_plan_steps').select('*').eq('plan_id', planId).order('created_at', { ascending: true }),
      ]);

      if (!planRes.error && planRes.data) {
        const steps = (stepsRes.data || []).map(mapDbToStep);
        const plan = mapDbToPlan(planRes.data, steps);
        return { plan, isPendingSync: false };
      }
    } catch (err: any) {
      console.warn('Cloud plan detail fetch failed, falling back to local storage:', err.message);
    }
  }

  const local = getLocalPlans();
  const match = local.find((p) => p.id === planId) || null;
  return {
    plan: match,
    isPendingSync: true,
  };
}

export async function saveGrowPlan(plan: GrowPlan): Promise<{
  plan?: GrowPlan;
  isPendingSync?: boolean;
  error?: string;
}> {
  // Ensure IDs
  const planId = plan.id || generateUuid();
  const completePlan: GrowPlan = {
    ...plan,
    id: planId,
    createdAt: plan.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // 1. Always update local storage first
  const localPlans = getLocalPlans();
  const existingIdx = localPlans.findIndex((p) => p.id === planId);
  if (existingIdx >= 0) {
    localPlans[existingIdx] = completePlan;
  } else {
    localPlans.unshift(completePlan);
  }
  saveLocalPlans(localPlans);

  // 2. Persist to Supabase if available
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const payload = {
          id: completePlan.id,
          user_id: user.id,
          name: completePlan.name,
          description: completePlan.description || '',
          scope: completePlan.scope,
          objective: completePlan.objective,
          status: completePlan.status,
          priority: completePlan.priority,
          start_date: completePlan.startDate,
          target_date: completePlan.targetDate || null,
          plant_id: completePlan.plantId || null,
          production_cycle_id: completePlan.productionCycleId || null,
          propagation_event_id: completePlan.propagationEventId || null,
          metadata: {
            ...completePlan.metadata,
            plantIds: completePlan.plantIds,
            healthStatus: completePlan.healthStatus,
            evidence: completePlan.evidence,
            adjustmentHistory: completePlan.adjustmentHistory,
          },
          updated_at: new Date().toISOString(),
        };

        const { error: upsertErr } = await supabase.from('grow_plans').upsert(payload);
        if (upsertErr) throw upsertErr;

        // Upsert steps if any
        if (completePlan.steps && completePlan.steps.length > 0) {
          const stepPayloads = completePlan.steps.map((s) => ({
            id: s.id || generateUuid(),
            user_id: user.id,
            plan_id: completePlan.id,
            title: s.title,
            description: s.description || '',
            category: s.category,
            status: s.status,
            priority: s.priority,
            scheduled_for: s.scheduledFor || null,
            due_at: s.dueAt || null,
            completed_at: s.completedAt || null,
            requires_observation: s.requiresObservation,
            requires_confirmation: s.requiresConfirmation,
            source_type: s.source || 'manual',
            evidence: s.evidence || [],
            dependency_metadata: {
              ...s.metadata,
              prerequisiteStepIds: s.prerequisiteStepIds,
              linkedTimelineEventId: s.linkedTimelineEventId,
            },
            reminder_id: s.linkedReminderId || null,
            updated_at: new Date().toISOString(),
          }));

          const { error: stepsErr } = await supabase.from('grow_plan_steps').upsert(stepPayloads);
          if (stepsErr) throw stepsErr;
        }

        return { plan: completePlan, isPendingSync: false };
      }
    } catch (err: any) {
      console.warn('Could not persist plan to cloud, queued offline:', err.message);
      queuePendingMutation({
        type: 'create_plan',
        planId: completePlan.id,
        payload: completePlan,
      });
      return { plan: completePlan, isPendingSync: true };
    }
  }

  // Offline / Demo
  queuePendingMutation({
    type: 'create_plan',
    planId: completePlan.id,
    payload: completePlan,
  });
  return { plan: completePlan, isPendingSync: true };
}

export async function createGrowPlan(params: CreateGrowPlanParams | GrowPlan): Promise<{
  plan?: GrowPlan;
  isPendingSync?: boolean;
  error?: string;
}> {
  if ('id' in params && (params as any).steps) {
    return saveGrowPlan(params as GrowPlan);
  }
  const p = params as CreateGrowPlanParams;
  const newPlan: GrowPlan = {
    id: generateUuid(),
    userId: 'user-local',
    name: p.name,
    description: p.description || '',
    scope: p.scope,
    objective: p.objective,
    status: 'active',
    healthStatus: 'on_track',
    priority: 'normal',
    startDate: p.startDate || new Date().toISOString(),
    targetDate: p.targetDate || null,
    plantId: p.plantId || null,
    plantIds: p.plantIds || (p.plantId ? [p.plantId] : []),
    productionCycleId: p.productionCycleId || null,
    propagationEventId: p.propagationEventId || null,
    steps: p.steps || [],
    evidence: (p as any).evidence || p.evidenceBasis || [],
    evidenceBasis: p.evidenceBasis || [],
    adjustmentHistory: [],
    progress: {
      totalSteps: (p.steps || []).length,
      completedSteps: 0,
      skippedSteps: 0,
      pendingSteps: (p.steps || []).length,
      readySteps: (p.steps || []).filter((s) => s.status === 'ready').length,
      blockedSteps: (p.steps || []).filter((s) => s.status === 'blocked').length,
      completionPercentage: 0,
      isComplete: false,
    },
    metadata: p.metadata || {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return saveGrowPlan(newPlan);
}

export const fetchGrowPlans = fetchUserGrowPlans;
export const getGrowPlanById = fetchGrowPlanById;

export async function updateGrowPlan(
  planId: string,
  updates: Partial<GrowPlan>
): Promise<{ plan?: GrowPlan; isPendingSync?: boolean; error?: string }> {
  const localPlans = getLocalPlans();
  const existingIdx = localPlans.findIndex((p) => p.id === planId);
  if (existingIdx < 0) {
    return { error: 'Plan not found.' };
  }

  const updated: GrowPlan = {
    ...localPlans[existingIdx],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  localPlans[existingIdx] = updated;
  saveLocalPlans(localPlans);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.targetDate !== undefined) payload.target_date = updates.targetDate;
      if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
      if (updates.pausedAt !== undefined) payload.paused_at = updates.pausedAt;
      if (updates.cancelledAt !== undefined) payload.cancelled_at = updates.cancelledAt;
      if (updates.metadata !== undefined || updates.healthStatus !== undefined) {
        payload.metadata = {
          ...updated.metadata,
          healthStatus: updated.healthStatus,
          evidence: updated.evidence,
          adjustmentHistory: updated.adjustmentHistory,
        };
      }

      const { error } = await supabase.from('grow_plans').update(payload).eq('id', planId);
      if (error) throw error;
      return { plan: updated, isPendingSync: false };
    } catch (err: any) {
      queuePendingMutation({
        type: 'update_plan',
        planId,
        payload: updates,
      });
      return { plan: updated, isPendingSync: true };
    }
  }

  queuePendingMutation({
    type: 'update_plan',
    planId,
    payload: updates,
  });
  return { plan: updated, isPendingSync: true };
}

export async function deleteGrowPlan(planId: string): Promise<{
  success: boolean;
  isPendingSync?: boolean;
  error?: string;
}> {
  const localPlans = getLocalPlans();
  const filtered = localPlans.filter((p) => p.id !== planId);
  saveLocalPlans(filtered);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { error } = await supabase.from('grow_plans').delete().eq('id', planId);
      if (error) throw error;
      return { success: true, isPendingSync: false };
    } catch (err: any) {
      queuePendingMutation({
        type: 'delete_plan',
        planId,
      });
      return { success: true, isPendingSync: true };
    }
  }

  queuePendingMutation({
    type: 'delete_plan',
    planId,
  });
  return { success: true, isPendingSync: true };
}

// ==============================================================================
// 4. PLAN STEP MUTATIONS
// ==============================================================================

export async function updatePlanStep(
  stepId: string,
  updates: Partial<GrowPlanStep>
): Promise<{ step?: GrowPlanStep; isPendingSync?: boolean; error?: string }> {
  const localPlans = getLocalPlans();
  let foundStep: GrowPlanStep | null = null;
  let targetPlan: GrowPlan | null = null;

  for (const p of localPlans) {
    const sIdx = p.steps.findIndex((s) => s.id === stepId);
    if (sIdx >= 0) {
      p.steps[sIdx] = {
        ...p.steps[sIdx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      foundStep = p.steps[sIdx];
      targetPlan = p;
      break;
    }
  }

  if (!foundStep || !targetPlan) {
    return { error: 'Step not found.' };
  }

  saveLocalPlans(localPlans);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const payload: any = {
        updated_at: new Date().toISOString(),
      };
      if (updates.status !== undefined) payload.status = updates.status;
      if (updates.completedAt !== undefined) payload.completed_at = updates.completedAt;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.dueAt !== undefined) payload.due_at = updates.dueAt;
      if (updates.priority !== undefined) payload.priority = updates.priority;
      if (updates.linkedReminderId !== undefined) payload.reminder_id = updates.linkedReminderId;

      const { error } = await supabase.from('grow_plan_steps').update(payload).eq('id', stepId);
      if (error) throw error;
      return { step: foundStep, isPendingSync: false };
    } catch (err: any) {
      queuePendingMutation({
        type: 'update_step',
        stepId,
        payload: updates,
      });
      return { step: foundStep, isPendingSync: true };
    }
  }

  queuePendingMutation({
    type: 'update_step',
    stepId,
    payload: updates,
  });
  return { step: foundStep, isPendingSync: true };
}

// ==============================================================================
// 5. PLAN EVENTS AUDIT LOG
// ==============================================================================

export async function recordPlanEvent(
  event: Omit<GrowPlanEvent, 'id' | 'createdAt'>
): Promise<{ event?: GrowPlanEvent; error?: string }> {
  const completeEvent: GrowPlanEvent = {
    ...event,
    id: generateUuid(),
    createdAt: new Date().toISOString(),
  };

  const localEvents = getLocalPlanEvents();
  localEvents.push(completeEvent);
  saveLocalPlanEvents(localEvents);

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('grow_plan_events').insert({
          id: completeEvent.id,
          user_id: user.id,
          plan_id: completeEvent.planId,
          step_id: completeEvent.stepId || null,
          event_type: completeEvent.eventType,
          metadata: completeEvent.metadata || {},
          created_at: completeEvent.createdAt,
        });
      }
    } catch (err) {
      // Local event was already saved
    }
  }

  return { event: completeEvent };
}

export async function fetchPlanEvents(planId: string): Promise<{
  events: GrowPlanEvent[];
  error?: string;
}> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabase();
      if (!supabase) throw new Error('Supabase client unavailable');
      const { data, error } = await supabase
        .from('grow_plan_events')
        .select('*')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return {
          events: data.map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            planId: row.plan_id,
            stepId: row.step_id,
            eventType: row.event_type,
            metadata: row.metadata,
            createdAt: row.created_at,
          })),
        };
      }
    } catch (err) {
      // Fallback
    }
  }

  const local = getLocalPlanEvents();
  return {
    events: local.filter((e) => e.planId === planId),
  };
}

// ==============================================================================
// 6. OFFLINE MUTATIONS SYNCHRONIZATION
// ==============================================================================

export async function syncPendingPlanMutations(): Promise<{ synced: number; failed: number }> {
  if (!isSupabaseConfigured()) return { synced: 0, failed: 0 };
  const queue = getPendingPlanMutations();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: PendingPlanMutation[] = [];
  const supabase = getSupabase();
  if (!supabase) return { synced: 0, failed: 0 };

  for (const item of queue) {
    try {
      if (item.type === 'create_plan' && item.payload) {
        await saveGrowPlan(item.payload);
        synced++;
      } else if (item.type === 'update_plan' && item.planId && item.payload) {
        await updateGrowPlan(item.planId, item.payload);
        synced++;
      } else if (item.type === 'delete_plan' && item.planId) {
        await deleteGrowPlan(item.planId);
        synced++;
      } else if (item.type === 'update_step' && item.stepId && item.payload) {
        await updatePlanStep(item.stepId, item.payload);
        synced++;
      }
    } catch (err) {
      failed++;
      remaining.push(item);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_PLAN_MUTATIONS_KEY, JSON.stringify(remaining));
  }

  return { synced, failed };
}
