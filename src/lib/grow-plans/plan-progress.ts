/**
 * GrowAI Phase 13: Plan Progress & Health Evaluation Engine
 * Computes deterministic progress metrics and plan health statuses.
 *
 * CRITICAL RULE:
 * Do not use elapsed calendar time as a substitute for biological progress.
 * A plan is only complete when all applicable steps are resolved.
 */

import { GrowPlanStep, PlanProgress, PlanHealthStatus, GrowPlanStatus } from '@/types/grow-plan';

/**
 * Calculates deterministic progress metrics from actual step states.
 */
export function calculatePlanProgress(steps: GrowPlanStep[]): PlanProgress {
  const total = steps.length;
  const completed = steps.filter((s) => s.status === 'completed').length;
  const skipped = steps.filter((s) => s.status === 'skipped').length;
  const blocked = steps.filter((s) => s.status === 'blocked').length;
  const ready = steps.filter((s) => s.status === 'ready').length;
  const pending = steps.filter((s) => s.status === 'pending').length;

  const applicable = total - skipped;
  const completionPercentage = applicable > 0 ? Math.round((completed / applicable) * 100) : 0;

  // Observational progress: ratio of completed observation/review steps
  const observationSteps = steps.filter(
    (s) => s.category === 'observation' || s.category === 'review' || s.requiresObservation
  );
  const completedObservations = observationSteps.filter((s) => s.status === 'completed').length;
  const observationalProgressPercentage =
    observationSteps.length > 0
      ? Math.round((completedObservations / observationSteps.length) * 100)
      : null;

  // Biological progress: ratio of completed care, feeding, growth, health, harvest, propagation steps
  const biologicalSteps = steps.filter(
    (s) =>
      s.category === 'care' ||
      s.category === 'feeding' ||
      s.category === 'growth' ||
      s.category === 'health' ||
      s.category === 'harvest' ||
      s.category === 'propagation' ||
      s.category === 'production'
  );
  const completedBiological = biologicalSteps.filter((s) => s.status === 'completed').length;
  const biologicalProgressPercentage =
    biologicalSteps.length > 0
      ? Math.round((completedBiological / biologicalSteps.length) * 100)
      : null;

  // Check if any mandatory biological or safety observation step was skipped
  const hasSkippedMandatory = steps.some(
    (s) =>
      s.status === 'skipped' &&
      (s.metadata?.isMandatory === true ||
        s.metadata?.isMandatoryObservation === true ||
        s.metadata?.isSafetyCritical === true)
  );

  const isComplete = applicable > 0 && completed === applicable && !hasSkippedMandatory;

  return {
    totalSteps: total,
    completedSteps: completed,
    skippedSteps: skipped,
    pendingSteps: pending,
    readySteps: ready,
    blockedSteps: blocked,
    completionPercentage,
    taskCompletionPercentage: completionPercentage,
    biologicalProgressPercentage,
    observationalProgressPercentage,
    isComplete,
  };
}

/**
 * Evaluates the overall health status of a plan based on its steps and plan state.
 */
export function evaluatePlanHealthStatus(
  planStatus: GrowPlanStatus,
  steps: GrowPlanStep[],
  hasConcerningEvidence: boolean = false
): PlanHealthStatus {
  if (planStatus === 'paused') {
    return 'paused';
  }

  if (planStatus === 'completed') {
    return 'completed';
  }

  if (planStatus === 'cancelled') {
    return 'unknown';
  }

  if (steps.length === 0) {
    return 'unknown';
  }

  const progress = calculatePlanProgress(steps);
  if (progress.isComplete) {
    return 'completed';
  }

  // Any step marked needs_review or concerning evidence attached or skipped mandatory step
  const hasStepNeedsReview = steps.some((s) => s.status === 'needs_review');
  const hasSkippedMandatory = steps.some(
    (s) =>
      s.status === 'skipped' &&
      (s.metadata?.isMandatory === true ||
        s.metadata?.isMandatoryObservation === true ||
        s.metadata?.isSafetyCritical === true)
  );
  if (hasStepNeedsReview || hasConcerningEvidence || hasSkippedMandatory || planStatus === 'needs_review') {
    return 'needs_attention';
  }

  // Check if remaining unfinished steps are completely blocked
  const unfinished = steps.filter((s) => s.status !== 'completed' && s.status !== 'skipped');
  const allBlocked = unfinished.length > 0 && unfinished.every((s) => s.status === 'blocked');
  if (allBlocked) {
    return 'blocked';
  }

  // Check if the current ready step is waiting on an observation
  const nextReady = steps.find((s) => s.status === 'ready' || s.status === 'in_progress');
  if (nextReady && (nextReady.requiresObservation || nextReady.category === 'observation')) {
    return 'waiting_for_observation';
  }

  return 'on_track';
}

export const derivePlanHealthStatus = evaluatePlanHealthStatus;
