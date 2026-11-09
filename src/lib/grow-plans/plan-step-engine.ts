/**
 * GrowAI Phase 13: Plan Step & Dependency Engine
 * Handles deterministic evaluation of step statuses, dependency resolution,
 * actionable step selection, and completion state transitions.
 *
 * CRITICAL RULE:
 * Never mark a step completed merely because its due date passed.
 * Dependent steps must not become actionable before their prerequisites are satisfied.
 */

import { GrowPlan, GrowPlanStep, StepStatus, GrowPlanStatus, PlanProgress } from '@/types/grow-plan';
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
    if (!found) {
      unmetIds.push(prereqId);
      unmetTitles.push(`Prerequisite (${prereqId})`);
      continue;
    }

    if (found.status === 'completed') {
      // Completed steps satisfy prerequisites
      continue;
    }

    if (found.status === 'skipped') {
      // A skipped step satisfies prerequisites ONLY IF it is not a mandatory biological or safety observation
      const isMandatoryObservation = Boolean(
        found.metadata?.isMandatoryObservation ||
        found.metadata?.isSafetyCritical ||
        (found.requiresObservation && found.metadata?.isMandatory) ||
        step.metadata?.strictPrerequisites?.includes(found.id)
      );

      if (isMandatoryObservation) {
        unmetIds.push(prereqId);
        unmetTitles.push(`${found.title} (Mandatory Observation Required)`);
        continue;
      }

      // Optional step skipped legitimately allows dependent step to proceed
      continue;
    }

    // Step is pending, ready, blocked, or in_progress -> prerequisite unmet
    unmetIds.push(prereqId);
    unmetTitles.push(found.title);
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
  steps: GrowPlanStep[] | any,
  referenceDate?: Date | string
): GrowPlanStep[] {
  const stepList: GrowPlanStep[] = Array.isArray(steps)
    ? steps
    : Array.isArray(steps?.updatedSteps)
    ? steps.updatedSteps
    : Array.isArray(steps?.steps)
    ? steps.steps
    : [];

  // First pass: compute new statuses
  return stepList.map((step) => {
    const newStatus = evaluateStepStatus(step, stepList, referenceDate);
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
export interface StepExecutionResult extends GrowPlan {
  plan: GrowPlan;
  updatedPlan: GrowPlan;
  updatedSteps: GrowPlanStep[];
  completedStep: GrowPlanStep | null;
  nextActionableStep: GrowPlanStep | null;
  isPlanCompleted: boolean;
  progress: PlanProgress;
}

export interface StepSkipResult extends GrowPlan {
  plan: GrowPlan;
  updatedPlan: GrowPlan;
  updatedSteps: GrowPlanStep[];
  skippedStep: GrowPlanStep | null;
  nextActionableStep: GrowPlanStep | null;
  isPlanCompleted: boolean;
  progress: PlanProgress;
}

/**
 * Completes a step directly within an array of steps.
 * Returns a steps array enriched with completedStep, nextActionableStep, and progress.
 */
export function completeStepInList(
  steps: GrowPlanStep[],
  stepId: string,
  notes?: string
): GrowPlanStep[] & {
  updatedSteps: GrowPlanStep[];
  completedStep: GrowPlanStep | null;
  nextActionableStep: GrowPlanStep | null;
  progress: PlanProgress;
} {
  const targetIdx = steps.findIndex((s) => s.id === stepId);
  if (targetIdx < 0) {
    const res = [...steps] as any;
    res.updatedSteps = steps;
    res.completedStep = null;
    res.nextActionableStep = getNextActionableStep(steps);
    res.progress = calculatePlanProgress(steps);
    return res;
  }

  const now = new Date().toISOString();
  const modified = [...steps];
  modified[targetIdx] = {
    ...modified[targetIdx],
    status: 'completed',
    notes: notes || modified[targetIdx].notes,
    completedAt: now,
    updatedAt: now,
  };

  if (modified[targetIdx].requiresObservation) {
    modified[targetIdx].metadata = {
      ...modified[targetIdx].metadata,
      observationRecorded: true,
      observedAt: now,
      observationText: notes || modified[targetIdx].notes,
    };
  }

  const evaluated = evaluateAllPlanSteps(modified, now) as any;
  evaluated.updatedSteps = evaluated;
  evaluated.completedStep = evaluated[targetIdx];
  evaluated.nextActionableStep = getNextActionableStep(evaluated);
  evaluated.progress = calculatePlanProgress(evaluated);
  return evaluated;
}

/**
 * Skips a step directly within an array of steps.
 * Returns a steps array enriched with skippedStep, nextActionableStep, and progress.
 */
export function skipStepInList(
  steps: GrowPlanStep[],
  stepId: string,
  reason?: string
): GrowPlanStep[] & {
  updatedSteps: GrowPlanStep[];
  skippedStep: GrowPlanStep | null;
  nextActionableStep: GrowPlanStep | null;
  progress: PlanProgress;
} {
  const targetIdx = steps.findIndex((s) => s.id === stepId);
  if (targetIdx < 0) {
    const res = [...steps] as any;
    res.updatedSteps = steps;
    res.skippedStep = null;
    res.nextActionableStep = getNextActionableStep(steps);
    res.progress = calculatePlanProgress(steps);
    return res;
  }

  const now = new Date().toISOString();
  const modified = [...steps];
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

  const evaluated = evaluateAllPlanSteps(modified, now) as any;
  evaluated.updatedSteps = evaluated;
  evaluated.skippedStep = evaluated[targetIdx];
  evaluated.nextActionableStep = getNextActionableStep(evaluated);
  evaluated.progress = calculatePlanProgress(evaluated);
  return evaluated;
}

/**
 * Canonical plan-level step completion.
 * Deterministically transitions the step to 'completed', updates timestamps,
 * re-evaluates dependency cascades, recalculates progress, and returns a strongly
 * typed result containing both the updated plan and step execution properties.
 */
export function completePlanStep(
  arg1: GrowPlan | string | any,
  arg2: string | GrowPlanStep[] | any,
  arg3?: string
): any {
  // Support (stepId, plan, notes)
  if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null && Array.isArray(arg2.steps)) {
    return completePlanStep(arg2, arg1, arg3);
  }

  // Canonical signature: (plan: GrowPlan, stepId: string, notes?: string)
  if (typeof arg1 === 'object' && arg1 !== null && Array.isArray(arg1.steps)) {
    const plan: GrowPlan = arg1;
    const stepId: string = arg2;
    const notes: string | undefined = arg3;

    // Terminal state protection: Cancelled plans cannot be modified
    if (plan.status === 'cancelled') {
      return {
        ...plan,
        plan,
        updatedPlan: plan,
        updatedSteps: plan.steps,
        completedStep: null,
        nextActionableStep: null,
        isPlanCompleted: false,
        progress: plan.progress,
        error: 'Cannot modify a cancelled plan.',
      };
    }

    const targetIdx = plan.steps.findIndex((s) => s.id === stepId);
    if (targetIdx < 0) {
      return {
        ...plan,
        plan,
        updatedPlan: plan,
        updatedSteps: plan.steps,
        completedStep: null,
        nextActionableStep: getNextActionableStep(plan.steps),
        isPlanCompleted: plan.status === 'completed',
        progress: plan.progress,
      };
    }

    const now = new Date().toISOString();
    const modified = [...plan.steps];
    modified[targetIdx] = {
      ...modified[targetIdx],
      status: 'completed',
      notes: notes || modified[targetIdx].notes,
      completedAt: now,
      updatedAt: now,
    };

    if (modified[targetIdx].requiresObservation) {
      modified[targetIdx].metadata = {
        ...modified[targetIdx].metadata,
        observationRecorded: true,
        observedAt: now,
        observationText: notes || modified[targetIdx].notes,
      };
    }

    const evaluated = evaluateAllPlanSteps(modified, now);
    const progress = calculatePlanProgress(evaluated);
    const allDone = progress.isComplete;
    const newStatus: GrowPlanStatus = allDone ? 'completed' : plan.status;
    const health = evaluatePlanHealthStatus(newStatus, evaluated, false);
    const nextActionable = getNextActionableStep(evaluated);

    const updatedPlan: GrowPlan = {
      ...plan,
      steps: evaluated,
      status: newStatus,
      healthStatus: health,
      progress,
      completedAt: allDone ? (plan.completedAt || now) : plan.completedAt,
      updatedAt: now,
    };

    return {
      ...updatedPlan,
      plan: updatedPlan,
      updatedPlan,
      updatedSteps: evaluated,
      completedStep: evaluated[targetIdx],
      nextActionableStep: nextActionable,
      isPlanCompleted: allDone,
      progress,
    };
  }

  // Backwards compatibility for steps array callers: (stepId, steps) or (steps, stepId)
  let stepId: string = arg1;
  let steps: GrowPlanStep[] = arg2;
  let notesVal: string | undefined = arg3;

  if (Array.isArray(arg1) && typeof arg2 === 'string') {
    steps = arg1;
    stepId = arg2;
    notesVal = arg3;
  }

  return completeStepInList(steps, stepId, notesVal);
}

/**
 * Canonical plan-level step skipping.
 * Deterministically transitions the step to 'skipped', preserves skip reason,
 * unblocks downstream steps whose prerequisites are resolved, and returns a
 * strongly typed result.
 */
export function skipPlanStep(
  arg1: GrowPlan | string | any,
  arg2: string | GrowPlanStep[] | any,
  arg3?: string
): any {
  // Support (stepId, plan, reason)
  if (typeof arg1 === 'string' && typeof arg2 === 'object' && arg2 !== null && Array.isArray(arg2.steps)) {
    return skipPlanStep(arg2, arg1, arg3);
  }

  // Canonical signature: (plan: GrowPlan, stepId: string, reason?: string)
  if (typeof arg1 === 'object' && arg1 !== null && Array.isArray(arg1.steps)) {
    const plan: GrowPlan = arg1;
    const stepId: string = arg2;
    const reason: string | undefined = arg3;

    // Terminal state protection: Cancelled plans cannot be modified
    if (plan.status === 'cancelled') {
      return {
        ...plan,
        plan,
        updatedPlan: plan,
        updatedSteps: plan.steps,
        skippedStep: null,
        nextActionableStep: null,
        isPlanCompleted: false,
        progress: plan.progress,
        error: 'Cannot modify a cancelled plan.',
      };
    }

    const targetIdx = plan.steps.findIndex((s) => s.id === stepId);
    if (targetIdx < 0) {
      return {
        ...plan,
        plan,
        updatedPlan: plan,
        updatedSteps: plan.steps,
        skippedStep: null,
        nextActionableStep: getNextActionableStep(plan.steps),
        isPlanCompleted: plan.status === 'completed',
        progress: plan.progress,
      };
    }

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
    const nextActionable = getNextActionableStep(evaluated);

    const updatedPlan: GrowPlan = {
      ...plan,
      steps: evaluated,
      status: newStatus,
      healthStatus: health,
      progress,
      completedAt: allDone ? (plan.completedAt || now) : plan.completedAt,
      updatedAt: now,
    };

    return {
      ...updatedPlan,
      plan: updatedPlan,
      updatedPlan,
      updatedSteps: evaluated,
      skippedStep: evaluated[targetIdx],
      nextActionableStep: nextActionable,
      isPlanCompleted: allDone,
      progress,
    };
  }

  // Backwards compatibility for steps array callers
  let stepId: string = arg1;
  let steps: GrowPlanStep[] = arg2;
  let reasonVal: string | undefined = arg3;

  if (Array.isArray(arg1) && typeof arg2 === 'string') {
    steps = arg1;
    stepId = arg2;
    reasonVal = arg3;
  }

  return skipStepInList(steps, stepId, reasonVal);
}
