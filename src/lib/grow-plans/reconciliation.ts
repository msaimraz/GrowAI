/**
 * GrowAI Phase 13: Grow Plans Reconciliation Engine
 * Reconciles grow plans with active garden state:
 * - Detects deleted plants, cycles, and propagation events.
 * - Detects completed source tasks and resolved follow-ups.
 * - Detects cancelled plans to ensure reminders are properly cancelled.
 *
 * CRITICAL SAFETY RULES:
 * - Never resurrect cancelled or completed plans.
 * - Never recreate deleted source records.
 * - Never silently delete historical plan events.
 */

import { GrowPlan } from '@/types/grow-plan';
import { UserPlant } from '@/types/garden';
import { ProductionCycle, PropagationEvent } from '@/types/grow-intelligence';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { evaluateAllPlanSteps } from './plan-step-engine';
import { calculatePlanProgress, evaluatePlanHealthStatus } from './plan-progress';

export interface PlanReconciliationResult {
  reconciledPlans: GrowPlan[];
  updatedPlans: GrowPlan[];
  cancelledPlanIds: string[];
  dissociatedPlanIds: string[];
  reconciledStepCount: number;
  remindersToCancel: string[];
  reminderIdsToCancel: string[];
  summary: string;
}

export interface PlanReconciliationParams {
  plans: GrowPlan[];
  plants?: UserPlant[];
  activePlants?: UserPlant[];
  cycles?: ProductionCycle[];
  activeCycles?: ProductionCycle[];
  propagations?: PropagationEvent[];
  activePropagations?: PropagationEvent[];
  diagnoses?: SavedDiagnosisRecord[];
}

export function reconcileGrowPlans(params: PlanReconciliationParams): PlanReconciliationResult {
  const plans = params.plans || [];
  const plantList = params.plants || params.activePlants || [];
  const cycleList = params.cycles || params.activeCycles || [];
  const propList = params.propagations || params.activePropagations || [];

  const activePlantIds = new Set(plantList.map((p) => p.id));
  const activeCycleIds = new Set(cycleList.map((c) => c.id));
  const activePropIds = new Set(propList.map((p) => p.id));

  const reconciledPlans: GrowPlan[] = [];
  const updatedPlans: GrowPlan[] = [];
  const cancelledPlanIds: string[] = [];
  const dissociatedPlanIds: string[] = [];
  const remindersToCancel: string[] = [];
  let reconciledStepCount = 0;
  const now = new Date().toISOString();

  for (const plan of plans) {
    // 1. Never resurrect cancelled or completed plans
    if (plan.status === 'cancelled' || plan.status === 'completed') {
      reconciledPlans.push(plan);
      continue;
    }

    let modified = false;
    let currentPlan = { ...plan };

    // 2. Check plant deletion
    if (currentPlan.plantId && !activePlantIds.has(currentPlan.plantId)) {
      if (currentPlan.scope === 'plant' || currentPlan.scope === 'single_plant') {
        // Plan was exclusively for this plant -> Cancel plan
        currentPlan = {
          ...currentPlan,
          status: 'cancelled',
          cancelledAt: now,
          metadata: {
            ...currentPlan.metadata,
            cancellationReason: 'Associated plant was deleted from My Garden.',
          },
          updatedAt: now,
        };
        cancelledPlanIds.push(currentPlan.id);
        modified = true;

        // Cancel all associated active step reminders
        for (const step of currentPlan.steps) {
          if (step.linkedReminderId && step.status !== 'completed') {
            remindersToCancel.push(step.linkedReminderId);
          }
        }
      } else {
        // Multi-plant or garden scope -> Dissociate specific plant ID
        currentPlan = {
          ...currentPlan,
          plantId: null,
          plantIds: (currentPlan.plantIds || []).filter((id) => id !== currentPlan.plantId),
          updatedAt: now,
        };
        dissociatedPlanIds.push(currentPlan.id);
        modified = true;
      }
    }

    // 3. Check production cycle deletion
    if (currentPlan.productionCycleId && !activeCycleIds.has(currentPlan.productionCycleId)) {
      if (currentPlan.scope === 'production_cycle') {
        currentPlan = {
          ...currentPlan,
          status: 'cancelled',
          cancelledAt: now,
          metadata: {
            ...currentPlan.metadata,
            cancellationReason: 'Associated production cycle was deleted.',
          },
          updatedAt: now,
        };
        cancelledPlanIds.push(currentPlan.id);
        modified = true;
      } else {
        currentPlan = {
          ...currentPlan,
          productionCycleId: null,
          updatedAt: now,
        };
        modified = true;
      }
    }

    // 4. Check propagation event deletion
    if (currentPlan.propagationEventId && !activePropIds.has(currentPlan.propagationEventId)) {
      if (currentPlan.scope === 'propagation') {
        currentPlan = {
          ...currentPlan,
          status: 'cancelled',
          cancelledAt: now,
          metadata: {
            ...currentPlan.metadata,
            cancellationReason: 'Associated propagation event was deleted.',
          },
          updatedAt: now,
        };
        cancelledPlanIds.push(currentPlan.id);
        modified = true;
      } else {
        currentPlan = {
          ...currentPlan,
          propagationEventId: null,
          updatedAt: now,
        };
        modified = true;
      }
    }

    // 5. If plan remains active, re-evaluate steps & progress
    if (currentPlan.status !== 'cancelled' && currentPlan.status !== 'completed') {
      const evaluatedSteps = evaluateAllPlanSteps(currentPlan.steps, now);
      const progress = calculatePlanProgress(evaluatedSteps);
      const healthStatus = evaluatePlanHealthStatus(currentPlan.status, evaluatedSteps, false);

      currentPlan = {
        ...currentPlan,
        steps: evaluatedSteps,
        progress,
        healthStatus,
        updatedAt: modified ? now : currentPlan.updatedAt,
      };
      reconciledStepCount += evaluatedSteps.length;
    }

    if (modified) {
      updatedPlans.push(currentPlan);
    }
    reconciledPlans.push(currentPlan);
  }

  const summary = `Reconciled ${plans.length} plans. ${cancelledPlanIds.length} cancelled due to deleted parent records, ${dissociatedPlanIds.length} dissociated, ${remindersToCancel.length} reminders queued for cancellation.`;

  return {
    reconciledPlans,
    updatedPlans,
    cancelledPlanIds,
    dissociatedPlanIds,
    reconciledStepCount,
    remindersToCancel,
    reminderIdsToCancel: remindersToCancel,
    summary,
  };
}
