/**
 * GrowAI Phase 13: Adaptive Grow Plans & Execution System Domain Types
 * Strongly typed models for structured plans, plan objectives, executable steps,
 * step dependencies, deterministic progress, evidence-backed plan adjustments,
 * and offline/cloud persistence.
 *
 * Core Architectural Principle:
 * - Grow Plans is an execution and tracking layer on top of existing deterministic intelligence.
 * - Deterministic-first: biological completion is NEVER inferred from calendar dates alone.
 * - Evidence-first: every recommended step is backed by structured provenance.
 * - Consequential mutations require explicit grower confirmation.
 * - Strict agronomic safety: zero fabricated dosages, no guaranteed yield,
 *   no human medical diagnosis, unknown remains unknown.
 */

import { ProvenanceCategory } from './grow-intelligence';

// ==============================================================================
// 1. SCOPES, STATUSES & OBJECTIVES
// ==============================================================================

export type GrowPlanScope =
  | 'plant'
  | 'garden'
  | 'production_cycle'
  | 'propagation'
  | 'space'
  | 'custom'
  | 'single_plant'
  | 'multiple_plants'
  | 'space_container';

export type GrowPlanStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'needs_review';

export type PlanHealthStatus =
  | 'on_track'
  | 'needs_attention'
  | 'blocked'
  | 'waiting_for_observation'
  | 'paused'
  | 'completed'
  | 'unknown';

export type PlanPriority = 'low' | 'normal' | 'medium' | 'high' | 'urgent' | 'critical';

export type GrowPlanTemplateId =
  | 'plant_establishment'
  | 'health_monitoring'
  | 'propagation'
  | 'harvest_preparation'
  | 'production_cycle'
  | 'environment_improvement'
  | 'space_optimization'
  | 'improve_data_quality';

export type PlanObjective =
  | 'establish_plant'
  | 'plant_establishment'
  | 'improve_growing_conditions'
  | 'environment_optimization'
  | 'monitor_health'
  | 'health_recovery'
  | 'recover_from_health_issue'
  | 'prepare_for_harvest'
  | 'harvest_preparation'
  | 'increase_recorded_output'
  | 'propagate_plant'
  | 'propagation_lineage'
  | 'establish_production_cycle'
  | 'optimize_space'
  | 'improve_data_quality'
  | 'data_completeness'
  | 'general_care'
  | 'custom';

// ==============================================================================
// 2. STEP DOMAIN
// ==============================================================================

export type StepCategory =
  | 'care'
  | 'health'
  | 'environment'
  | 'feeding'
  | 'growth'
  | 'propagation'
  | 'production'
  | 'harvest'
  | 'space'
  | 'observation'
  | 'data_quality'
  | 'review'
  | 'verification'
  | 'pest_check'
  | 'watering'
  | 'pruning';

export type StepStatus =
  | 'pending'
  | 'ready'
  | 'in_progress'
  | 'completed'
  | 'skipped'
  | 'blocked'
  | 'needs_review';

export interface PlanEvidence {
  sourceType:
    | 'growing_condition'
    | 'feeding_record'
    | 'diagnosis_record'
    | 'diagnosis_follow_up'
    | 'care_task'
    | 'reminder'
    | 'growth_observation'
    | 'propagation_event'
    | 'production_cycle'
    | 'harvest_record'
    | 'space_metric'
    | 'data_quality'
    | 'garden_state'
    | 'manual';
  sourceId?: string;
  plantId?: string;
  plantNickname?: string;
  field?: string;
  value?: string | number | boolean | null;
  provenance: ProvenanceCategory;
  description: string;
  recordedAt?: string;
  route?: string;
}

export interface GrowPlanStep {
  id: string;
  planId: string;
  userId: string;
  title: string;
  description: string;
  category: StepCategory;
  status: StepStatus;
  priority: PlanPriority;
  scheduledFor?: string | null; // ISO 8601 Date/Time
  dueAt?: string | null;        // ISO 8601 Date/Time
  completedAt?: string | null;  // ISO 8601 Date/Time
  source?: string;
  evidence: PlanEvidence[];
  requiresObservation: boolean;
  requiresConfirmation: boolean;
  linkedReminderId?: string | null;
  linkedTimelineEventId?: string | null;
  stepOrder?: number;
  prerequisites?: string[];
  prerequisiteStepIds?: string[];
  notes?: string | null;
  startedAt?: string | null;
  observationPrompt?: string | null;
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 3. PROGRESS & METRICS
// ==============================================================================

export interface PlanProgress {
  totalSteps: number;
  completedSteps: number;
  skippedSteps: number;
  pendingSteps: number;
  readySteps: number;
  blockedSteps: number;
  completionPercentage: number;
  taskCompletionPercentage?: number;
  biologicalProgressPercentage?: number | null;
  observationalProgressPercentage?: number | null;
  isComplete: boolean;
}

// ==============================================================================
// 4. PLAN ADJUSTMENTS & EVENTS
// ==============================================================================

export interface PlanAdjustmentRecord {
  id: string;
  planId: string;
  adjustedAt: string;
  trigger:
    | 'health_improvement'
    | 'health_worsening'
    | 'environment_recorded'
    | 'feeding_recorded'
    | 'harvest_recorded'
    | 'propagation_recorded'
    | 'step_completed'
    | 'step_skipped'
    | 'plan_paused'
    | 'plan_resumed'
    | 'plan_cancelled'
    | 'plant_deleted'
    | 'manual_adjustment';
  reason: string;
  changes: string[];
  previousStatus?: GrowPlanStatus;
  newStatus?: GrowPlanStatus;
}

export interface GrowPlanEvent {
  id: string;
  userId: string;
  planId: string;
  stepId?: string | null;
  eventType:
    | 'plan_created'
    | 'plan_step_started'
    | 'plan_step_completed'
    | 'plan_step_skipped'
    | 'plan_adjusted'
    | 'plan_paused'
    | 'plan_resumed'
    | 'plan_completed'
    | 'plan_cancelled'
    | 'plan_review';
  metadata?: Record<string, any> | null;
  createdAt: string;
}

// ==============================================================================
// 5. MAIN GROW PLAN MODEL
// ==============================================================================

export interface GrowPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  scope: GrowPlanScope;
  plantId?: string | null;
  plantIds?: string[];
  productionCycleId?: string | null;
  propagationEventId?: string | null;
  objective: PlanObjective;
  status: GrowPlanStatus;
  healthStatus: PlanHealthStatus;
  priority: PlanPriority;
  startDate: string;           // ISO 8601 Date
  targetDate?: string | null;   // Estimated target date, never sole metric of completion
  completedAt?: string | null;
  pausedAt?: string | null;
  cancelledAt?: string | null;
  steps: GrowPlanStep[];
  progress: PlanProgress;
  evidence: PlanEvidence[];
  evidenceBasis?: PlanEvidence[];
  adjustmentHistory: PlanAdjustmentRecord[];
  metadata?: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 6. PLAN CREATION PARAMS
// ==============================================================================

export interface CreateGrowPlanParams {
  userId?: string;
  name: string;
  description?: string;
  scope: GrowPlanScope;
  objective: PlanObjective;
  plantId?: string | null;
  plantIds?: string[];
  productionCycleId?: string | null;
  propagationEventId?: string | null;
  priority?: PlanPriority;
  startDate?: string;
  targetDate?: string | null;
  templateId?: string;
  initialSteps?: Array<Omit<GrowPlanStep, 'id' | 'planId' | 'userId' | 'createdAt' | 'updatedAt'>>;
  steps?: GrowPlanStep[];
  evidenceBasis?: PlanEvidence[];
  metadata?: Record<string, any>;
}

export interface UpdateGrowPlanParams {
  name?: string;
  description?: string;
  status?: GrowPlanStatus;
  priority?: PlanPriority;
  targetDate?: string | null;
  metadata?: Record<string, any>;
}
