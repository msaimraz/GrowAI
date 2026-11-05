/**
 * GrowAI Phase 13: Plan Step & Dependency Engine
 * Handles deterministic evaluation of step statuses, dependency resolution,
 * actionable step selection, and completion state transitions.
 *
 * CRITICAL RULE:
 * Never mark a step completed merely because its due date passed.
 * Dependent steps must not become actionable before their prerequisites are satisfied.
 */

import { GrowPlan, GrowPlanStep, StepStatus, GrowPlanStatus } from '@/types/grow-plan';
import { calculatePlanProgress, evaluatePlanHealthStatus } from './plan-progress';

export interface PrerequisiteCheckResult {
  isMet: boolean;
  unmetStepIds: string[];
  unmetStepTitles: string[];
}

/**
 * Checks whether all prerequisite steps for a given step have been resolved (completed or skipped).
 */
export function checkStepPrerequisites(
  step: GrowPlanStep,
  allSteps: GrowPlanStep[]
): PrerequisiteCheckResult {
  const prereqIds = step.prerequisiteStepIds || step.prerequisites || [];
  if (prereqIds.length === 0) {
    return { isMet: true, unmetStepIds: [], unmetStepTitles: [] };
  }

  const unmetIds: string[] = [];
  const unmetTitles: string[] = [];

  for (const prereqId of prereqIds) {
    const found = allSteps.find((s) => s.id === prereqId);
    if (!found || (found.status !== 'completed' && found.status !== 'skipped')) {
      unmetIds.push(prereqId);
      unmetTitles.push(found?.title || `Prerequisite (${prereqId})`);
    }
  }

  return {
    isMet: unmetIds.length === 0,
    unmetStepIds: unmetIds,
    unmetStepTitles: unmetTitles,
  };
}

/**
 * Evaluates the deterministic status of a single step based on:
 * - existing terminal states (completed, skipped)
 * - prerequisite dependency resolution
 * - schedule timing
 */
export function evaluateStepStatus(
  step: GrowPlanStep,
  allSteps: GrowPlanStep[],
  referenceDate?: Date | string
): StepStatus {
  // Terminal states do not regress automatically
  if (step.status === 'completed' || step.status === 'skipped') {
    return step.status;
  }

  // If manually flagged for review
  if (step.status === 'needs_review') {
    return 'needs_review';
  }

  // Check prerequisites
  const prereqs = checkStepPrerequisites(step, allSteps);
  if (!prereqs.isMet) {
    return 'blocked';
  }

  // If in progress by grower
  if (step.status === 'in_progress') {
    return 'in_progress';
  }

  // If prerequisites are satisfied, step is ready
  return 'ready';
}

/**
 * Re-evaluates all steps in a plan in topological order to ensure cascades update correctly.
 */
export function evaluateAllPlanSteps(
  steps: GrowPlanStep[],
  referenceDate?: Date | string
): GrowPlanStep[] {
  // First pass: compute new statuses
  return steps.map((step) => {
    const newStatus = evaluateStepStatus(step, steps, referenceDate);
    if (newStatus !== step.status) {
      return {
        ...step,
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return step;
  });
}

/**
 * Selects the next actionable step in a plan:
 * Returns the highest priority step that is 'ready' or 'in_progress'.
 */
export function getNextActionableStep(steps: GrowPlanStep[]): GrowPlanStep | null {
  const readySteps = steps.filter((s) => s.status === 'ready' || s.status === 'in_progress');
  if (readySteps.length === 0) return null;

  // Sort by priority (urgent > high > normal > low), then by scheduled/due date
  const priorityWeight: Record<string, number> = {
    urgent: 4,
    high: 3,
    normal: 2,
    low: 1,
  };

  return readySteps.sort((a, b) => {
    const pDiff = (priorityWeight[b.priority] || 2) - (priorityWeight[a.priority] || 2);
    if (pDiff !== 0) return pDiff;

    if (a.dueAt && b.dueAt) {
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    }
    return 0;
  })[0];
}

/**
 * Marks a step as completed and re-evaluates all subsequent steps.
 * Supports both (plan, stepId, notes) and (stepId, steps, completedAt).
 */
export function completePlanStep(
  arg1: any,
  arg2: any,
  arg3?: string
): any {
  if (typeof arg1 === 'object' && arg1 !== null && Array.isArray(arg1.steps)) {
    const plan: GrowPlan = arg1;
    const stepId: string = arg2;
    const notes: string | undefined = arg3;

    const targetIdx = plan.steps.findIndex((s) => s.id === stepId);
    if (targetIdx < 0) return plan;

    const now = new Date().toISOString();
    const modified = [...plan.steps];
    modified[targetIdx] = {
      ...modified[targetIdx],
      status: 'completed',
      notes: notes || modified[targetIdx].notes,
      completedAt: now,
      updatedAt: now,
    };

    const evaluated = evaluateAllPlanSteps(modified, now);
    const progress = calculatePlanProgress(evaluated);
    const allDone = progress.isComplete;
    const newStatus: GrowPlanStatus = allDone ? 'completed' : plan.status;
    const health = evaluatePlanHealthStatus(newStatus, evaluated, false);

    return {
      ...plan,
      steps: evaluated,
      status: newStatus,
      healthStatus: health,
      progress,
      completedAt: allDone ? now : plan.completedAt,
      updatedAt: now,
    };
  }

  const stepId: string = arg1;
  const steps: GrowPlanStep[] = arg2;
  const completedAt: string | undefined = arg3;

  const targetIdx = steps.findIndex((s) => s.id === stepId);
  if (targetIdx < 0) {
    return { updatedSteps: steps, completedStep: null };
  }

  const now = completedAt || new Date().toISOString();
  const modified = [...steps];
  modified[targetIdx] = {
    ...modified[targetIdx],
    status: 'completed',
    completedAt: now,
    updatedAt: now,
  };

  // Re-evaluate downstream steps now that dependency is satisfied
  const evaluated = evaluateAllPlanSteps(modified, now);
  return {
    updatedSteps: evaluated,
    completedStep: evaluated[targetIdx],
  };
}

/**
 * Marks a step as skipped and re-evaluates all subsequent steps.
 * Supports both (plan, stepId, reason) and (stepId, steps, reason).
 */
export function skipPlanStep(
  arg1: any,
  arg2: any,
  arg3?: string
): any {
  if (typeof arg1 === 'object' && arg1 !== null && Array.isArray(arg1.steps)) {
    const plan: GrowPlan = arg1;
    const stepId: string = arg2;
    const reason: string | undefined = arg3;

    const targetIdx = plan.steps.findIndex((s) => s.id === stepId);
    if (targetIdx < 0) return plan;

    const now = new Date().toISOString();
    const modified = [...plan.steps];
    modified[targetIdx] = {
      ...modified[targetIdx],
      status: 'skipped',
      notes: reason || modified[targetIdx].notes,
      metadata: {
        ...modified[targetIdx].metadata,
        skipReason: reason || 'Skipped by grower',
      },
      updatedAt: now,
    };

    const evaluated = evaluateAllPlanSteps(modified, now);
    const progress = calculatePlanProgress(evaluated);
    const allDone = progress.isComplete;
    const newStatus: GrowPlanStatus = allDone ? 'completed' : plan.status;
    const health = evaluatePlanHealthStatus(newStatus, evaluated, false);

    return {
      ...plan,
      steps: evaluated,
      status: newStatus,
      healthStatus: health,
      progress,
      completedAt: allDone ? now : plan.completedAt,
      updatedAt: now,
    };
  }

  const stepId: string = arg1;
  const steps: GrowPlanStep[] = arg2;
  const reason: string | undefined = arg3;

  const targetIdx = steps.findIndex((s) => s.id === stepId);
  if (targetIdx < 0) {
    return { updatedSteps: steps, skippedStep: null };
  }

  const now = new Date().toISOString();
  const modified = [...steps];
  modified[targetIdx] = {
    ...modified[targetIdx],
    status: 'skipped',
    metadata: {
      ...modified[targetIdx].metadata,
      skipReason: reason || 'Skipped by grower',
    },
    updatedAt: now,
  };

  // Re-evaluate downstream steps
  const evaluated = evaluateAllPlanSteps(modified, now);
  return {
    updatedSteps: evaluated,
    skippedStep: evaluated[targetIdx],
  };
}
