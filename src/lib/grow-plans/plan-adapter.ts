/**
 * GrowAI Phase 13: Adaptive Plan Engine
 * Dynamically re-evaluates and adapts grow plans in response to new garden records:
 * - Health assessments and follow-up resolutions
 * - Health condition worsening
 * - Environmental condition observations
 * - Feeding applications
 * - Harvest records
 * - Propagation lineage events
 *
 * CRITICAL SAFETY RULES:
 * - Never declare plant death or failure automatically.
 * - Historical yield records never become guaranteed future yields.
 * - Propagation success is never inferred without a recorded event.
 */

import {
  GrowPlan,
  GrowPlanStep,
  PlanEvidence,
  PlanAdjustmentRecord,
} from '@/types/grow-plan';
import { SavedDiagnosisRecord, FollowUpOutcome } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  HarvestRecord,
  PropagationEvent,
} from '@/types/grow-intelligence';
import { calculatePlanProgress, evaluatePlanHealthStatus } from './plan-progress';
import { evaluateAllPlanSteps } from './plan-step-engine';

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

/**
 * Adapts a plan when health records change.
 */
export function adaptPlanOnHealthUpdate(
  plan: GrowPlan,
  diagnosis: SavedDiagnosisRecord,
  latestFollowUpOutcome?: FollowUpOutcome
): GrowPlan {
  if (plan.status === 'completed' || plan.status === 'cancelled') {
    return plan;
  }

  const now = new Date().toISOString();
  let modified = false;
  const changes: string[] = [];
  const updatedSteps: GrowPlanStep[] = [...plan.steps];
  const existingEvidence = plan.evidence || plan.evidenceBasis || [];

  const effectiveOutcome =
    latestFollowUpOutcome ||
    (diagnosis.followUps && diagnosis.followUps.length > 0
      ? diagnosis.followUps[diagnosis.followUps.length - 1].outcomeStatus
      : undefined);

  const isWorsening =
    effectiveOutcome === 'worsening' ||
    diagnosis.overallHealth === 'severe_issue' ||
    (diagnosis as any).urgency === 'high';

  const isResolved =
    effectiveOutcome === 'resolved' ||
    diagnosis.overallHealth === 'healthy';

  // Case 1: Health issue is marked resolved
  if (isResolved) {
    for (let i = 0; i < updatedSteps.length; i++) {
      const step = updatedSteps[i];
      if (
        (step.category === 'health' ||
          step.category === 'verification' ||
          step.title.toLowerCase().includes('follow-up') ||
          step.title.toLowerCase().includes('symptom') ||
          step.title.toLowerCase().includes('resolution')) &&
        step.status !== 'completed' &&
        step.status !== 'skipped'
      ) {
        updatedSteps[i] = {
          ...step,
          status: 'completed',
          completedAt: now,
          updatedAt: now,
          metadata: {
            ...step.metadata,
            resolutionNote: 'Health follow-up marked as resolved.',
          },
        };
        modified = true;
        changes.push(`Completed health step "${step.title}" due to resolved symptoms.`);
      }
    }
  }

  // Case 2: Health issue worsens -> Flag plan for review without declaring failure
  if (isWorsening) {
    const newEvidence: PlanEvidence = {
      sourceType: 'diagnosis_follow_up',
      sourceId: diagnosis.id,
      plantId: plan.plantId || undefined,
      field: 'outcome',
      value: effectiveOutcome || 'severe_issue',
      provenance: 'observed',
      description: `Health follow-up noted worsening condition or elevated urgency.`,
      recordedAt: now,
      route: `/app/ai-doctor/history/${diagnosis.id}`,
    };

    const hasEvidenceAlready = existingEvidence.some(
      (e) => e.sourceId === diagnosis.id && e.value === (effectiveOutcome || 'severe_issue')
    );
    if (!hasEvidenceAlready) {
      existingEvidence.unshift(newEvidence);
      modified = true;
      changes.push('Attached worsening symptom evidence.');
    }

    // Flag active health steps for review
    for (let i = 0; i < updatedSteps.length; i++) {
      if (
        (updatedSteps[i].category === 'health' ||
          updatedSteps[i].category === 'pest_check' ||
          updatedSteps[i].category === 'care') &&
        updatedSteps[i].status === 'ready'
      ) {
        updatedSteps[i] = {
          ...updatedSteps[i],
          status: 'needs_review',
          priority: 'urgent',
          updatedAt: now,
        };
        modified = true;
        changes.push(`Flagged step "${updatedSteps[i].title}" as needs_review.`);
      }
    }
  }

  if (!modified && !isWorsening && !isResolved) return plan;

  const evaluatedSteps = evaluateAllPlanSteps(updatedSteps, now);
  const progress = calculatePlanProgress(evaluatedSteps);
  const newStatus = isWorsening ? 'needs_review' : plan.status;
  const healthStatus = isWorsening ? 'needs_attention' : evaluatePlanHealthStatus(newStatus, evaluatedSteps, isWorsening);

  const adjustment: PlanAdjustmentRecord = {
    id: generateUuid(),
    planId: plan.id,
    adjustedAt: now,
    trigger: isWorsening ? 'health_worsening' : 'health_improvement',
    reason: isWorsening ? 'Health follow-up noted symptom progression.' : 'Health follow-up resolved issue.',
    changes,
    previousStatus: plan.status,
    newStatus,
  };

  return {
    ...plan,
    status: newStatus,
    healthStatus,
    steps: evaluatedSteps,
    progress,
    evidence: existingEvidence,
    adjustmentHistory: [adjustment, ...(plan.adjustmentHistory || [])],
    updatedAt: now,
  };
}

/**
 * Adapts a plan when growing conditions are recorded.
 */
export function adaptPlanOnConditionRecorded(
  plan: GrowPlan,
  condition: GrowingConditionObservation
): GrowPlan {
  if (plan.status === 'completed' || plan.status === 'cancelled') {
    return plan;
  }

  const now = new Date().toISOString();
  let modified = false;
  const changes: string[] = [];
  const updatedSteps: GrowPlanStep[] = [...plan.steps];

  // If a step was waiting for environment measurement
  for (let i = 0; i < updatedSteps.length; i++) {
    const s = updatedSteps[i];
    if (
      (s.category === 'environment' || s.title.toLowerCase().includes('record ambient') || s.title.toLowerCase().includes('measure')) &&
      (s.status === 'ready' || s.status === 'pending' || s.status === 'blocked')
    ) {
      updatedSteps[i] = {
        ...s,
        status: 'completed',
        completedAt: now,
        updatedAt: now,
        metadata: {
          ...s.metadata,
          recordedConditionId: condition.id,
        },
      };
      modified = true;
      changes.push(`Completed environmental measurement step "${s.title}".`);
      break; // Complete the primary pending condition step
    }
  }

  if (!modified) return plan;

  // Add recorded condition evidence
  const existingEvidence = plan.evidence || plan.evidenceBasis || [];
  const existingAdjustments = plan.adjustmentHistory || [];
  const evidenceItem: PlanEvidence = {
    sourceType: 'growing_condition',
    sourceId: condition.id,
    plantId: plan.plantId || undefined,
    field: 'temperatureCelsius',
    value: condition.temperatureCelsius,
    provenance: 'recorded',
    description: `Recorded condition: ${condition.temperatureCelsius ?? '—'}°C, ${condition.relativeHumidityPercent ?? '—'}% RH.`,
    recordedAt: condition.observationTime || now,
  };

  const evaluatedSteps = evaluateAllPlanSteps(updatedSteps, now);
  const progress = calculatePlanProgress(evaluatedSteps);
  const healthStatus = evaluatePlanHealthStatus(plan.status, evaluatedSteps, false);

  const adjustment: PlanAdjustmentRecord = {
    id: generateUuid(),
    planId: plan.id,
    adjustedAt: now,
    trigger: 'environment_recorded',
    reason: 'Growing condition recorded by grower.',
    changes,
    previousStatus: plan.status,
    newStatus: plan.status,
  };

  return {
    ...plan,
    healthStatus,
    steps: evaluatedSteps,
    progress,
    evidence: [evidenceItem, ...existingEvidence],
    adjustmentHistory: [adjustment, ...existingAdjustments],
    updatedAt: now,
  };
}

/**
 * Adapts a plan when a harvest is recorded.
 */
export function adaptPlanOnHarvestRecorded(
  plan: GrowPlan,
  harvest: HarvestRecord
): GrowPlan {
  if (plan.status === 'completed' || plan.status === 'cancelled') {
    return plan;
  }

  const now = new Date().toISOString();
  let modified = false;
  const changes: string[] = [];
  const updatedSteps: GrowPlanStep[] = [...plan.steps];

  // Mark harvest step as completed if pending
  for (let i = 0; i < updatedSteps.length; i++) {
    const s = updatedSteps[i];
    if (s.category === 'harvest' && (s.status === 'ready' || s.status === 'pending')) {
      updatedSteps[i] = {
        ...s,
        status: 'completed',
        completedAt: now,
        updatedAt: now,
        metadata: {
          ...s.metadata,
          harvestId: harvest.id,
          quantity: harvest.quantity,
          unit: harvest.unit,
        },
      };
      modified = true;
      changes.push(`Completed harvest step "${s.title}" (${harvest.quantity} ${harvest.unit} recorded).`);
      break;
    }
  }

  // Attach harvest evidence
  const existingEvidence = plan.evidence || plan.evidenceBasis || [];
  const existingAdjustments = plan.adjustmentHistory || [];
  const harvestEvidence: PlanEvidence = {
    sourceType: 'harvest_record',
    sourceId: harvest.id,
    plantId: plan.plantId || undefined,
    field: 'harvest',
    value: `${harvest.quantity} ${harvest.unit}`,
    provenance: 'recorded',
    description: `Recorded harvest of ${harvest.quantity} ${harvest.unit}. Note: Historical yield does not guarantee future production.`,
    recordedAt: harvest.harvestDate || now,
  };

  const evaluatedSteps = evaluateAllPlanSteps(updatedSteps, now);
  const progress = calculatePlanProgress(evaluatedSteps);
  const healthStatus = evaluatePlanHealthStatus(plan.status, evaluatedSteps, false);

  const adjustment: PlanAdjustmentRecord = {
    id: generateUuid(),
    planId: plan.id,
    adjustedAt: now,
    trigger: 'harvest_recorded',
    reason: `Harvest of ${harvest.quantity} ${harvest.unit} recorded. Historical performance does not guarantee future yield.`,
    changes: modified ? changes : ['Attached recorded harvest yield evidence.'],
    previousStatus: plan.status,
    newStatus: plan.status,
  };

  return {
    ...plan,
    healthStatus,
    steps: evaluatedSteps,
    progress,
    evidence: [harvestEvidence, ...existingEvidence],
    adjustmentHistory: [adjustment, ...existingAdjustments],
    updatedAt: now,
  };
}

/**
 * Adapts a plan when a propagation event is recorded.
 */
export function adaptPlanOnPropagationRecorded(
  plan: GrowPlan,
  propagation: PropagationEvent
): GrowPlan {
  if (plan.status === 'completed' || plan.status === 'cancelled') {
    return plan;
  }

  const now = new Date().toISOString();
  let modified = false;
  const changes: string[] = [];
  const updatedSteps: GrowPlanStep[] = [...plan.steps];
  const existingEvidence = plan.evidence || plan.evidenceBasis || [];
  const existingAdjustments = plan.adjustmentHistory || [];

  // If propagation cutting or potting step was ready/pending
  for (let i = 0; i < updatedSteps.length; i++) {
    const s = updatedSteps[i];
    if (
      s.category === 'propagation' &&
      (s.status === 'ready' || s.status === 'pending') &&
      s.title.toLowerCase().includes('record propagation')
    ) {
      updatedSteps[i] = {
        ...s,
        status: 'completed',
        completedAt: now,
        updatedAt: now,
      };
      modified = true;
      changes.push(`Completed propagation registration step "${s.title}".`);
      break;
    }
  }

  const evaluatedSteps = evaluateAllPlanSteps(updatedSteps, now);
  const progress = calculatePlanProgress(evaluatedSteps);
  const healthStatus = evaluatePlanHealthStatus(plan.status, evaluatedSteps, false);

  const adjustment: PlanAdjustmentRecord = {
    id: generateUuid(),
    planId: plan.id,
    adjustedAt: now,
    trigger: 'propagation_recorded',
    reason: `Propagation event (${propagation.propagationMethod}) recorded.`,
    changes: modified ? changes : ['Linked propagation lineage event.'],
    previousStatus: plan.status,
    newStatus: plan.status,
  };

  return {
    ...plan,
    healthStatus,
    steps: evaluatedSteps,
    progress,
    evidence: existingEvidence,
    adjustmentHistory: [adjustment, ...existingAdjustments],
    updatedAt: now,
  };
}
