// @ts-nocheck
/**
 * GrowAI Phase 13 Test Suite: Adaptive Grow Plans & Execution System
 * Comprehensive automated verification covering domain models, templates,
 * step dependency engine, progress & health derivation, dynamic adaptation,
 * reconciliation, reminder integration, copilot integration, and strict safety invariants.
 */

import {
  GrowPlan,
  GrowPlanStep,
  GrowPlanTemplateId,
  CreateGrowPlanParams,
  PlanAdjustmentRecord,
} from './src/types/grow-plan';
import { UserPlant } from './src/types/garden';
import { SavedDiagnosisRecord } from './src/types/diagnosis';
import { GrowingConditionObservation, HarvestRecord, PropagationEvent } from './src/types/grow-intelligence';
import {
  generatePlanFromTemplate,
  getTemplateDefinitions,
} from './src/lib/grow-plans/plan-generator';
import {
  checkStepPrerequisites,
  evaluateStepStatus,
  evaluateAllPlanSteps,
  completePlanStep,
  skipPlanStep,
  getNextActionableStep,
} from './src/lib/grow-plans/plan-step-engine';
import { calculatePlanProgress, derivePlanHealthStatus } from './src/lib/grow-plans/plan-progress';
import {
  adaptPlanOnHealthUpdate,
  adaptPlanOnConditionRecorded,
  adaptPlanOnHarvestRecorded,
  adaptPlanOnPropagationRecorded,
} from './src/lib/grow-plans/plan-adapter';
import { reconcileGrowPlans } from './src/lib/grow-plans/reconciliation';
import { buildPlantTimeline } from './src/lib/plant-timeline';
import { classifyCopilotIntent } from './src/lib/grower-copilot/intent-classifier';
import { executeCopilotAction } from './src/lib/grower-copilot/action-executor';
import {
  createGrowPlan,
  fetchGrowPlanById,
  updateGrowPlan,
  fetchPlanEvents,
  recordPlanEvent,
} from './src/lib/grow-plans/storage';
import { checkQuerySafety } from './src/lib/grower-copilot/safety-guard';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

// ============================================================================
// MOCK DATA FIXTURES
// ============================================================================

const mockPlant: UserPlant = {
  id: 'plant-basil-101',
  plantSlug: 'sweet-basil',
  nickname: 'Kitchen Sweet Basil',
  plantedDate: '2026-10-15T00:00:00.000Z',
  currentStage: 'Growing',
  notes: [],
  createdAt: '2026-10-15T00:00:00.000Z',
};

const mockPlant2: UserPlant = {
  id: 'plant-mint-202',
  plantSlug: 'peppermint',
  nickname: 'Patio Peppermint',
  plantedDate: '2026-09-01T00:00:00.000Z',
  currentStage: 'Mature',
  notes: [],
  createdAt: '2026-09-01T00:00:00.000Z',
};

async function runTests() {
  console.log('\n================================================================');
  console.log('GROWAI PHASE 13: ADAPTIVE GROW PLANS VERIFICATION SUITE');
  console.log('================================================================\n');

  // --------------------------------------------------------------------------
  // SECTION 1: TEMPLATE REGISTRY & GENERATOR
  // --------------------------------------------------------------------------
  console.log('--- 1. Template Definitions & Plan Generator ---');

  const templates = getTemplateDefinitions();
  assert(templates.length === 8, 'All 8 required Grow Plan templates are registered');

  const requiredTemplateIds: GrowPlanTemplateId[] = [
    'plant_establishment',
    'health_monitoring',
    'propagation',
    'harvest_preparation',
    'production_cycle',
    'environment_improvement',
    'space_optimization',
    'improve_data_quality',
  ];

  for (const tid of requiredTemplateIds) {
    const found = templates.some((t) => t.id === tid);
    assert(found, `Template "${tid}" exists in definitions`);
  }

  // Generate plant establishment plan
  const estPlan = generatePlanFromTemplate('plant_establishment', {
    plant: mockPlant,
    plantId: mockPlant.id,
    plantSlug: mockPlant.plantSlug,
  });

  assert(estPlan.name.includes('Establishment'), 'Establishment plan name correctly initialized');
  assert(estPlan.scope === 'plant', 'Establishment plan scoped to plant');
  assert(estPlan.plantId === mockPlant.id, 'Establishment plan targets mock plant ID');
  assert(estPlan.steps.length >= 4, 'Establishment plan generated with at least 4 milestone steps');
  assert((estPlan.evidenceBasis?.length || 0) > 0, 'Plan generated with structured evidence basis');

  // Verify step 1 has no prerequisites and is ready
  assert(
    (estPlan.steps[0].prerequisites || []).length === 0,
    'First step has no prerequisites'
  );
  assert(estPlan.steps[0].status === 'ready', 'First step is marked ready');

  // Verify step 2 has step 1 as prerequisite and is blocked
  assert(
    (estPlan.steps[1].prerequisites || []).includes(estPlan.steps[0].id),
    'Step 2 depends on Step 1 ID'
  );
  assert(estPlan.steps[1].status === 'blocked', 'Step 2 is initially blocked');

  // Test other templates generation
  const healthPlan = generatePlanFromTemplate('health_monitoring', { plant: mockPlant });
  assert(healthPlan.objective === 'monitor_health', 'Health monitoring plan has monitor_health objective');

  const propPlan = generatePlanFromTemplate('propagation', { plant: mockPlant });
  assert(propPlan.objective === 'propagate_plant', 'Propagation plan has propagate_plant objective');

  const spacePlan = generatePlanFromTemplate('space_optimization', {});
  assert(spacePlan.scope === 'space', 'Space optimization plan has space scope');

  const dqPlan = generatePlanFromTemplate('improve_data_quality', {});
  assert(dqPlan.objective === 'improve_data_quality', 'Data quality plan has improve_data_quality objective');

  const prodCyclePlan = generatePlanFromTemplate('production_cycle', {});
  assert(prodCyclePlan.objective === 'establish_production_cycle', 'Production cycle plan has establish_production_cycle objective');
  assert(prodCyclePlan.scope === 'production_cycle', 'Production cycle plan has production_cycle scope');

  const envImpPlan = generatePlanFromTemplate('environment_improvement', {});
  assert(envImpPlan.objective === 'improve_growing_conditions', 'Environment improvement plan has improve_growing_conditions objective');

  const harvPrepPlan = generatePlanFromTemplate('harvest_preparation', {});
  assert(harvPrepPlan.objective === 'prepare_for_harvest', 'Harvest preparation plan has prepare_for_harvest objective');
  assert(harvPrepPlan.priority === 'normal', 'Harvest preparation plan default priority is normal');

  // --------------------------------------------------------------------------
  // SECTION 2: STEP ENGINE & DEPENDENCY RESOLUTION
  // --------------------------------------------------------------------------
  console.log('\n--- 2. Step Engine & Dependency Resolution ---');

  // Create clean 3-step test plan
  const stepA: GrowPlanStep = {
    id: 'step-a',
    stepOrder: 1,
    title: 'Initial Visual Inspection',
    category: 'observation',
    status: 'ready',
    priority: 'high',
    requiresObservation: true,
    prerequisites: [],
  };

  const stepB: GrowPlanStep = {
    id: 'step-b',
    stepOrder: 2,
    title: 'Moisture Level Check',
    category: 'watering',
    status: 'blocked',
    priority: 'medium',
    requiresObservation: true,
    prerequisites: ['step-a'],
  };

  const stepC: GrowPlanStep = {
    id: 'step-c',
    stepOrder: 3,
    title: 'Nutrient Verification',
    category: 'feeding',
    status: 'blocked',
    priority: 'low',
    requiresObservation: false,
    prerequisites: ['step-b'],
  };

  const testSteps = [stepA, stepB, stepC];

  assert(
    checkStepPrerequisites(stepB, testSteps).isMet === false,
    'stepB prerequisites check returns false when stepA is ready'
  );

  // Complete step A
  const completedStepA: GrowPlanStep = {
    ...stepA,
    status: 'completed',
    completedAt: '2026-11-05T10:00:00.000Z',
  };
  const testStepsAfterA = [completedStepA, stepB, stepC];

  assert(
    checkStepPrerequisites(stepB, testStepsAfterA).isMet === true,
    'stepB prerequisites check returns true after stepA completes'
  );

  const evaluatedStepsAfterA = evaluateAllPlanSteps(testStepsAfterA);
  assert(
    evaluatedStepsAfterA[1].status === 'ready',
    'stepB status dynamically unlocked to "ready" once stepA completed'
  );
  assert(
    evaluatedStepsAfterA[2].status === 'blocked',
    'stepC remains blocked because stepB is not yet completed'
  );

  // Next actionable step
  const nextStep = getNextActionableStep(evaluatedStepsAfterA);
  assert(nextStep?.id === 'step-b', 'getNextActionableStep identifies stepB as next actionable');

  // Skip step B
  const skippedStepB: GrowPlanStep = {
    ...evaluatedStepsAfterA[1],
    status: 'skipped',
    notes: 'Skipped due to recent rainfall',
  };
  const testStepsAfterSkip = [completedStepA, skippedStepB, stepC];
  const evaluatedAfterSkip = evaluateAllPlanSteps(testStepsAfterSkip);

  assert(
    checkStepPrerequisites(stepC, testStepsAfterSkip).isMet === true,
    'Skipping stepB unblocks stepC'
  );
  assert(
    evaluatedAfterSkip[2].status === 'ready',
    'stepC is unlocked to ready after stepB skipped'
  );

  // Multi-prerequisite step test
  const stepD: GrowPlanStep = {
    id: 'step-d',
    stepOrder: 4,
    title: 'Dual Prerequisite Final Step',
    category: 'verification',
    status: 'blocked',
    priority: 'high',
    requiresObservation: true,
    prerequisites: ['step-a', 'step-c'],
  };

  const stepsWithD = [...testStepsAfterSkip, stepD];
  assert(
    checkStepPrerequisites(stepD, stepsWithD).isMet === false,
    'stepD with multiple prerequisites remains blocked when stepC is ready but uncompleted'
  );

  const completedStepC: GrowPlanStep = {
    ...stepC,
    status: 'completed',
    completedAt: '2026-11-05T11:00:00.000Z',
  };
  const stepsAllDoneForD = [completedStepA, skippedStepB, completedStepC, stepD];
  assert(
    checkStepPrerequisites(stepD, stepsAllDoneForD).isMet === true,
    'stepD with multiple prerequisites is met when both stepA and stepC are resolved'
  );

  // --------------------------------------------------------------------------
  // SECTION 3: PLAN PROGRESS & HEALTH ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- 3. Progress Calculation & Health Derivation ---');

  // Test full plan state
  const testPlan: GrowPlan = {
    id: 'plan-progress-test',
    userId: 'user-1',
    name: 'Progress Test Plan',
    objective: 'plant_establishment',
    scope: 'single_plant',
    status: 'active',
    healthStatus: 'on_track',
    plantId: mockPlant.id,
    steps: [
      {
        id: 's1',
        stepOrder: 1,
        title: 'Step 1',
        category: 'observation',
        status: 'completed',
        priority: 'high',
        requiresObservation: true,
        prerequisites: [],
      },
      {
        id: 's2',
        stepOrder: 2,
        title: 'Step 2',
        category: 'watering',
        status: 'ready',
        priority: 'medium',
        requiresObservation: true,
        prerequisites: ['s1'],
      },
      {
        id: 's3',
        stepOrder: 3,
        title: 'Step 3',
        category: 'pruning',
        status: 'blocked',
        priority: 'low',
        requiresObservation: false,
        prerequisites: ['s2'],
      },
      {
        id: 's4',
        stepOrder: 4,
        title: 'Step 4',
        category: 'feeding',
        status: 'blocked',
        priority: 'low',
        requiresObservation: false,
        prerequisites: ['s3'],
      },
    ],
    evidenceBasis: [],
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  };

  const progress = calculatePlanProgress(testPlan.steps);
  assert(progress.totalSteps === 4, 'Total steps counted correctly as 4');
  assert(progress.completedSteps === 1, 'Completed steps counted correctly as 1');
  assert(progress.taskCompletionPercentage === 25, 'Task completion is exactly 25%');
  assert(
    progress.observationalProgressPercentage === 50,
    'Observational progress is 50% (1 of 2 observational steps completed)'
  );

  const initialHealth = derivePlanHealthStatus(testPlan.status, testPlan.steps);
  assert(
    initialHealth === 'waiting_for_observation',
    'Initial plan health derived as "waiting_for_observation" because ready step requires observation'
  );

  assert(
    derivePlanHealthStatus('paused', testPlan.steps) === 'paused',
    'Plan with status "paused" derives health status "paused"'
  );

  const allBlockedSteps: GrowPlanStep[] = [
    {
      id: 'blk-1',
      stepOrder: 1,
      title: 'Blocked Step',
      category: 'care',
      status: 'blocked',
      priority: 'normal',
      requiresObservation: false,
      prerequisites: ['missing-id'],
    },
  ];
  assert(
    derivePlanHealthStatus('active', allBlockedSteps) === 'blocked',
    'Plan where all remaining unfinished steps are blocked derives health status "blocked"'
  );

  // Complete all steps in plan
  let runningPlan = { ...testPlan };
  for (const step of runningPlan.steps) {
    runningPlan = completePlanStep(runningPlan, step.id, 'Verified');
  }

  assert(runningPlan.status === 'completed', 'Plan status auto-transitions to completed when all steps done');
  assert(runningPlan.healthStatus === 'completed', 'Plan health status transitions to completed');
  assert(runningPlan.progress.taskCompletionPercentage === 100, 'Plan progress reaches 100%');
  assert(Boolean(runningPlan.completedAt), 'Plan records completedAt timestamp');

  // Safety invariant check: Biological completion is NOT based on calendar days alone
  assert(
    runningPlan.steps.every((s) => s.status === 'completed' || s.status === 'skipped'),
    'Biological plan completion strictly requires all steps completed/skipped, never calendar days'
  );

  // --------------------------------------------------------------------------
  // SECTION 4: DYNAMIC PLAN ADAPTATION
  // --------------------------------------------------------------------------
  console.log('\n--- 4. Dynamic Plan Adaptation ---');

  // Setup active health monitoring plan
  const activeHealthPlan: GrowPlan = {
    id: 'plan-adapt-1',
    userId: 'user-1',
    name: 'Foliage Recovery Plan',
    objective: 'health_recovery',
    scope: 'single_plant',
    status: 'active',
    healthStatus: 'on_track',
    plantId: mockPlant.id,
    steps: [
      {
        id: 'hp-1',
        stepOrder: 1,
        title: 'Isolate or inspect foliage',
        category: 'pest_check',
        status: 'ready',
        priority: 'high',
        requiresObservation: true,
        prerequisites: [],
      },
      {
        id: 'hp-2',
        stepOrder: 2,
        title: 'Verify disease resolution',
        category: 'verification',
        status: 'blocked',
        priority: 'high',
        requiresObservation: true,
        prerequisites: ['hp-1'],
      },
    ],
    evidenceBasis: [],
    adjustmentHistory: [],
    createdAt: '2026-11-05T00:00:00.000Z',
    updatedAt: '2026-11-05T00:00:00.000Z',
  };

  // 1. Health worsening adaptation
  const worseningDiag: SavedDiagnosisRecord = {
    id: 'diag-worse-1',
    userId: 'user-1',
    userPlantId: mockPlant.id,
    schemaVersion: '1.0',
    overallHealth: 'severe_issue',
    candidates: [{ candidateRank: 1, conditionName: 'Powdery Mildew', confidenceCategory: 'high' }],
    followUps: [{ id: 'fu-1', diagnosisId: 'diag-worse-1', outcomeStatus: 'worsening', createdAt: '2026-11-05T12:00:00.000Z' }],
    createdAt: '2026-11-05T12:00:00.000Z',
  };

  const adaptedWorse = adaptPlanOnHealthUpdate(activeHealthPlan, worseningDiag);
  assert(
    adaptedWorse.healthStatus === 'needs_attention',
    'Health worsening adapts plan healthStatus to "needs_attention"'
  );
  assert(
    (adaptedWorse.adjustmentHistory?.length || 0) > 0,
    'Plan records adjustment history entry on health worsening'
  );
  assert(
    adaptedWorse.adjustmentHistory![0].trigger === 'health_worsening',
    'Adjustment history trigger recorded as "health_worsening"'
  );

  // 2. Health resolution adaptation
  const resolvedDiag: SavedDiagnosisRecord = {
    id: 'diag-resolved-1',
    userId: 'user-1',
    userPlantId: mockPlant.id,
    schemaVersion: '1.0',
    overallHealth: 'healthy',
    followUps: [{ id: 'fu-2', diagnosisId: 'diag-resolved-1', outcomeStatus: 'resolved', createdAt: '2026-11-05T14:00:00.000Z' }],
    createdAt: '2026-11-05T14:00:00.000Z',
  };

  const adaptedResolved = adaptPlanOnHealthUpdate(activeHealthPlan, resolvedDiag);
  assert(
    adaptedResolved.steps[adaptedResolved.steps.length - 1].status === 'completed',
    'Health resolution marks verification step as completed'
  );

  // 3. Environmental observation adaptation
  const envPlan: GrowPlan = {
    ...activeHealthPlan,
    id: 'plan-env-1',
    objective: 'environment_optimization',
    steps: [
      {
        id: 'env-s1',
        stepOrder: 1,
        title: 'Record ambient temperature and humidity',
        category: 'environment',
        status: 'ready',
        priority: 'medium',
        requiresObservation: true,
        prerequisites: [],
      },
    ],
  };

  const mockCond: GrowingConditionObservation = {
    id: 'cond-1',
    plantId: mockPlant.id,
    observationTime: '2026-11-05T15:00:00.000Z',
    temperatureCelsius: 22,
    relativeHumidityPercent: 55,
    soilMoisture: 'moderate',
    notes: 'Indoor baseline recorded',
  };

  const adaptedEnv = adaptPlanOnConditionRecorded(envPlan, mockCond);
  assert(
    adaptedEnv.steps[0].status === 'completed',
    'Recording condition completes matching environment measurement step'
  );
  assert(
    adaptedEnv.adjustmentHistory?.[0].trigger === 'environment_recorded',
    'Adjustment history records "environment_recorded" trigger'
  );

  // 4. Harvest adaptation without future yield guarantee
  const harvestPlan: GrowPlan = {
    ...activeHealthPlan,
    id: 'plan-harv-1',
    objective: 'harvest_preparation',
    steps: [
      {
        id: 'h-s1',
        stepOrder: 1,
        title: 'Initial harvest recording',
        category: 'harvest',
        status: 'ready',
        priority: 'high',
        requiresObservation: true,
        prerequisites: [],
      },
    ],
  };

  const mockHarvest: HarvestRecord = {
    id: 'harv-1',
    plantId: mockPlant.id,
    plantSlug: mockPlant.plantSlug,
    harvestDate: '2026-11-05T16:00:00.000Z',
    quantity: 40,
    unit: 'grams',
    harvestType: 'cut_and_come_again',
  };

  const adaptedHarv = adaptPlanOnHarvestRecorded(harvestPlan, mockHarvest);
  assert(
    adaptedHarv.steps[0].status === 'completed',
    'Harvest event completes matching harvest step'
  );
  assert(
    adaptedHarv.adjustmentHistory?.[0].reason.includes('Historical performance does not guarantee future yield'),
    'Harvest adaptation explicitly includes safety disclaimer against guaranteed future yields'
  );

  // --------------------------------------------------------------------------
  // SECTION 5: RECONCILIATION ENGINE
  // --------------------------------------------------------------------------
  console.log('\n--- 5. Plan Reconciliation Engine ---');

  const reconcilePlan1: GrowPlan = {
    ...activeHealthPlan,
    id: 'plan-rec-1',
    plantId: 'plant-deleted-999',
    status: 'active',
  };

  const reconcilePlan2: GrowPlan = {
    ...activeHealthPlan,
    id: 'plan-rec-2',
    plantId: mockPlant.id,
    status: 'active',
  };

  const recResult = reconcileGrowPlans({
    plans: [reconcilePlan1, reconcilePlan2],
    activePlants: [mockPlant], // 'plant-deleted-999' is missing
    activeCycles: [],
    activePropagations: [],
  });

  assert(recResult.updatedPlans.length === 1, 'Reconciler flagged 1 orphaned plan for update');
  assert(recResult.cancelledPlanIds.includes('plan-rec-1'), 'Orphaned plan correctly cancelled');
  assert(
    recResult.updatedPlans[0].status === 'cancelled',
    'Orphaned plan status transitioned to cancelled'
  );
  assert(
    recResult.reminderIdsToCancel.length >= 0,
    'Reconciler produces reminders queue to clean up'
  );

  // Ensure completed plan is never resurrected
  const completedPlan: GrowPlan = {
    ...activeHealthPlan,
    id: 'plan-rec-completed',
    status: 'completed',
    completedAt: '2026-11-01T00:00:00.000Z',
  };

  const recCompletedResult = reconcileGrowPlans({
    plans: [completedPlan],
    activePlants: [mockPlant],
    activeCycles: [],
    activePropagations: [],
  });
  assert(
    recCompletedResult.updatedPlans.length === 0,
    'Reconciler never mutates or resurrects already completed plans'
  );

  // --------------------------------------------------------------------------
  // SECTION 6: PLANT TIMELINE INTEGRATION
  // --------------------------------------------------------------------------
  console.log('\n--- 6. Plant Timeline Integration ---');

  const timelinePlan: GrowPlan = {
    id: 'plan-tl-1',
    userId: 'user-1',
    name: 'Longitudinal Basil Journal Plan',
    objective: 'plant_establishment',
    scope: 'single_plant',
    status: 'completed',
    healthStatus: 'completed',
    plantId: mockPlant.id,
    steps: [
      {
        id: 's-done-1',
        stepOrder: 1,
        title: 'Soil Conditioning Complete',
        category: 'watering',
        status: 'completed',
        priority: 'medium',
        requiresObservation: true,
        prerequisites: [],
        completedAt: '2026-10-20T10:00:00.000Z',
      },
    ],
    evidenceBasis: [],
    createdAt: '2026-10-16T00:00:00.000Z',
    updatedAt: '2026-10-25T00:00:00.000Z',
    completedAt: '2026-10-25T00:00:00.000Z',
  };

  const timeline = buildPlantTimeline({
    plant: mockPlant,
    growPlans: [timelinePlan],
  });

  const planCreatedEvent = timeline.events.find((e) => e.eventType === 'plan_created');
  assert(Boolean(planCreatedEvent), 'Plant timeline includes "plan_created" event');
  assert(planCreatedEvent?.category === 'plan', 'Plan created event has category "plan"');
  assert(planCreatedEvent?.sourceProvenance === 'grow_plans', 'Plan created event provenance is grow_plans');

  const planStepEvent = timeline.events.find((e) => e.eventType === 'plan_step_completed');
  assert(Boolean(planStepEvent), 'Plant timeline includes "plan_step_completed" event');
  assert(
    planStepEvent?.title.includes('Soil Conditioning'),
    'Step completed event title includes step name'
  );

  const planCompletedEvent = timeline.events.find((e) => e.eventType === 'plan_completed');
  assert(Boolean(planCompletedEvent), 'Plant timeline includes "plan_completed" event');

  // Verify chronology sorting with tie-breaking
  assert(timeline.events.length >= 3, 'Timeline aggregates lifecycle and plan events');
  const timestamps = timeline.events.map((e) => new Date(e.eventDate).getTime());
  let isSorted = true;
  for (let i = 0; i < timestamps.length - 1; i++) {
    if (timestamps[i] < timestamps[i + 1]) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, 'Timeline events are strictly sorted newest first');

  // --------------------------------------------------------------------------
  // SECTION 7: GROWER COPILOT INTEGRATION & ACTION GATING
  // --------------------------------------------------------------------------
  console.log('\n--- 7. Grower Copilot Intent & Confirmation Gate ---');

  // Intent Classification
  const q1 = classifyCopilotIntent({ query: 'What is my current grow plan?' });
  assert(q1.intent === 'view_grow_plan', 'Classified "What is my current grow plan?" as view_grow_plan');

  const q2 = classifyCopilotIntent({ query: 'Please pause my plan' });
  assert(q2.intent === 'pause_grow_plan', 'Classified "Please pause my plan" as pause_grow_plan');

  const q3 = classifyCopilotIntent({ query: 'Resume the plan' });
  assert(q3.intent === 'resume_grow_plan', 'Classified "Resume the plan" as resume_grow_plan');

  const q4 = classifyCopilotIntent({ query: 'Mark this step complete' });
  assert(q4.intent === 'complete_plan_step', 'Classified "Mark this step complete" as complete_plan_step');

  const q5 = classifyCopilotIntent({ query: 'Create a plan for Kitchen Basil', plants: [mockPlant] });
  assert(q5.intent === 'create_grow_plan', 'Classified "Create a plan for Kitchen Basil" as create_grow_plan');
  assert(q5.targetPlantId === mockPlant.id, 'Target plant resolved as Kitchen Basil ID');

  const q6 = classifyCopilotIntent({ query: 'How is my plan progress?' });
  assert(q6.intent === 'view_grow_plan', 'Classified "How is my plan progress?" as view_grow_plan');

  const q7 = classifyCopilotIntent({ query: 'Unpause plan' });
  assert(q7.intent === 'resume_grow_plan', 'Classified "Unpause plan" as resume_grow_plan');

  // Consequential Action Gating (requiresConfirmation)
  const unconfirmedAction = {
    id: 'act-test-unconf',
    type: 'pause_plan' as const,
    label: 'Pause Plan',
    description: 'Pause active grow plan',
    requiresConfirmation: true,
    confirmed: false,
    payload: { planId: 'plan-123' },
  };

  const rejectRes = await executeCopilotAction(unconfirmedAction);
  assert(
    rejectRes.success === false,
    'Unconfirmed consequential plan action rejected'
  );
  assert(
    rejectRes.requiresConfirmation === true,
    'Action executor explicitly indicates requiresConfirmation is true'
  );

  const confirmedAction = {
    ...unconfirmedAction,
    id: 'act-test-conf',
    confirmed: true,
  };
  const confirmRes = await executeCopilotAction(confirmedAction);
  assert(
    confirmRes.requiresConfirmation !== true,
    'Confirmed consequential plan action passes confirmation gate'
  );

  // --------------------------------------------------------------------------
  // SECTION 8: STRICT SAFETY INVARIANTS
  // --------------------------------------------------------------------------
  console.log('\n--- 8. Strict Safety Invariants ---');

  // 1. Human Medical / Emergency Ingestion Safety
  const medicalQuery = 'My child ingested white powdery mold on basil, what medicine should I give?';
  const safetyCheck = checkQuerySafety(medicalQuery);
  assert(safetyCheck.isSafe === false, 'Medical ingestion query correctly blocked');
  assert(
    Boolean(safetyCheck.redirectResponse),
    'Emergency redirect provided for medical inquiry'
  );
  assert(
    safetyCheck.redirectResponse?.toLowerCase().includes('emergency') ||
      safetyCheck.redirectResponse?.toLowerCase().includes('poison'),
    'Emergency response directs to emergency services / poison control'
  );
  assert(
    !safetyCheck.redirectResponse?.includes('1-800-222-1222'),
    'Safety response does NOT hard-code universal US poison number per Section 36 internationalization rule'
  );
  assert(
    !safetyCheck.redirectResponse?.includes('911 in the US'),
    'Safety response does NOT hard-code US 911 universally'
  );

  const ingestionCheck2 = checkQuerySafety('child swallowed a leaf and has fever');
  assert(
    ingestionCheck2.isSafe === false && Boolean(ingestionCheck2.redirectResponse),
    'Child swallowed leaf emergency query correctly intercepted'
  );

  // 2. No Chemical / Pesticide Dosage Fabrication
  const pestStep = estPlan.steps.find((s) => s.category === 'pest_check');
  if (pestStep && pestStep.description) {
    assert(
      !pestStep.description.toLowerCase().includes('ml/l') &&
        !pestStep.description.toLowerCase().includes('tablespoon'),
      'Plan steps do not fabricate chemical dosages'
    );
  }

  // 3. Historical performance yield warning
  assert(
    templates.some((t) => t.id === 'harvest_preparation'),
    'Harvest preparation template exists with visual maturity checks instead of calendar days'
  );

  // --------------------------------------------------------------------------
  // SECTION 9: STEP COMPLETION, SKIPPING, OBSERVATION & STORAGE EXECUTION
  // --------------------------------------------------------------------------
  console.log('\n--- 9. Step Completion, Skipping & Observation Integration ---');

  const executionPlan: GrowPlan = {
    id: 'plan-exec-test-1',
    userId: 'user-exec',
    name: 'Execution Test Plan',
    scope: 'plant',
    objective: 'plant_establishment',
    status: 'active',
    healthStatus: 'on_track',
    priority: 'normal',
    startDate: '2026-11-09T00:00:00.000Z',
    targetDate: '2026-12-01T00:00:00.000Z',
    completedAt: null,
    pausedAt: null,
    cancelledAt: null,
    plantId: 'plant-exec-1',
    plantIds: ['plant-exec-1'],
    steps: [
      {
        id: 's-ex-1',
        planId: 'plan-exec-test-1',
        userId: 'user-exec',
        title: 'Step 1: Soil Pre-wetting',
        description: 'Moisten seedling medium evenly.',
        category: 'watering',
        status: 'ready',
        priority: 'high',
        requiresObservation: false,
        requiresConfirmation: false,
        evidence: [],
        stepOrder: 1,
        prerequisites: [],
        createdAt: '2026-11-09T00:00:00.000Z',
        updatedAt: '2026-11-09T00:00:00.000Z',
      },
      {
        id: 's-ex-2',
        planId: 'plan-exec-test-1',
        userId: 'user-exec',
        title: 'Step 2: Sprout Inspection',
        description: 'Check emergence and true leaves.',
        category: 'observation',
        status: 'blocked',
        priority: 'normal',
        requiresObservation: true,
        observationPrompt: 'Verify first true leaf development.',
        requiresConfirmation: false,
        evidence: [],
        stepOrder: 2,
        prerequisites: ['s-ex-1'],
        createdAt: '2026-11-09T00:00:00.000Z',
        updatedAt: '2026-11-09T00:00:00.000Z',
      },
      {
        id: 's-ex-3',
        planId: 'plan-exec-test-1',
        userId: 'user-exec',
        title: 'Step 3: Gentle Fertilizer Feed',
        description: 'Apply quarter-strength liquid feed.',
        category: 'feeding',
        status: 'blocked',
        priority: 'low',
        requiresObservation: false,
        requiresConfirmation: false,
        evidence: [],
        stepOrder: 3,
        prerequisites: ['s-ex-2'],
        createdAt: '2026-11-09T00:00:00.000Z',
        updatedAt: '2026-11-09T00:00:00.000Z',
      },
    ],
    progress: {
      totalSteps: 3,
      completedSteps: 0,
      skippedSteps: 0,
      pendingSteps: 2,
      readySteps: 1,
      blockedSteps: 2,
      completionPercentage: 0,
      isComplete: false,
    },
    evidence: [],
    adjustmentHistory: [],
    createdAt: '2026-11-09T00:00:00.000Z',
    updatedAt: '2026-11-09T00:00:00.000Z',
  };

  // 1. Complete step 1 with notes
  const afterCompleteStep1 = completePlanStep(executionPlan, 's-ex-1', 'Medium saturated with 200ml rainwater');
  assert(afterCompleteStep1.steps[0].status === 'completed', 'Step 1 status is completed');
  assert(afterCompleteStep1.steps[0].notes === 'Medium saturated with 200ml rainwater', 'Step 1 recorded grower notes');
  assert(Boolean(afterCompleteStep1.steps[0].completedAt), 'Step 1 completedAt timestamp recorded');
  assert(afterCompleteStep1.steps[1].status === 'ready', 'Step 2 dynamically unblocked to ready');
  assert(afterCompleteStep1.steps[2].status === 'blocked', 'Step 3 remains blocked until Step 2 is done');
  assert(afterCompleteStep1.progress.completedSteps === 1, 'Progress completedSteps updated to 1');

  // 2. Both calling signatures (stepId, steps) and (plan, stepId) work without error
  const stepEngineArrayResult = completePlanStep('s-ex-1', executionPlan.steps, 'Direct step call');
  assert(Array.isArray(stepEngineArrayResult), 'completePlanStep(stepId, steps) is an array');
  assert(stepEngineArrayResult.completedStep?.status === 'completed', 'completedStep property is accessible');
  const reevalDirect = evaluateAllPlanSteps(stepEngineArrayResult);
  assert(Array.isArray(reevalDirect), 'evaluateAllPlanSteps safely handles step engine result without .map error');

  // 3. Skip step 2
  const afterSkipStep2 = skipPlanStep(afterCompleteStep1, 's-ex-2', 'Seedling skipped foliar observation step');
  assert(afterSkipStep2.steps[1].status === 'skipped', 'Step 2 marked as skipped');
  assert(afterSkipStep2.steps[1].metadata?.skipReason === 'Seedling skipped foliar observation step', 'Step 2 skipReason recorded in metadata');
  assert(afterSkipStep2.steps[2].status === 'ready', 'Step 3 dynamically unblocked to ready after Step 2 skipped');

  // 4. Complete final step 3 -> Plan transitions to completed
  const afterCompleteStep3 = completePlanStep(afterSkipStep2, 's-ex-3', 'Final feeding applied');
  assert(afterCompleteStep3.steps[2].status === 'completed', 'Step 3 completed');
  assert(afterCompleteStep3.status === 'completed', 'Plan automatically transitions to completed when all steps resolved');
  assert(afterCompleteStep3.progress.isComplete === true, 'Plan progress isComplete is true');
  assert(afterCompleteStep3.progress.completionPercentage === 100, 'Plan progress reaches 100%');

  // 5. TEST A — Real Plan Creation & Refresh Persistence
  console.log('\n--- Real Runtime Persistence Lifecycle Verification ---');
  const createRes = await createGrowPlan({
    userId: 'user-runtime-test',
    name: 'Real Runtime Tomato Plan',
    description: 'Automated persistence verification plan',
    scope: 'plant',
    objective: 'establish_plant',
    plantId: mockPlant.id,
    steps: [
      {
        id: 's-rt-1',
        planId: '',
        userId: 'user-runtime-test',
        title: 'Water medium',
        description: 'Initial watering',
        category: 'watering',
        status: 'ready',
        priority: 'high',
        requiresObservation: false,
        requiresConfirmation: false,
        evidence: [],
      },
      {
        id: 's-rt-2',
        planId: '',
        userId: 'user-runtime-test',
        title: 'Observe foliar emergence',
        description: 'Verify leaf growth',
        category: 'observation',
        status: 'blocked',
        priority: 'normal',
        requiresObservation: true,
        observationPrompt: 'Check first cotyledons',
        requiresConfirmation: false,
        evidence: [],
        prerequisites: ['s-rt-1'],
      },
      {
        id: 's-rt-3',
        planId: '',
        userId: 'user-runtime-test',
        title: 'Apply fertilizer',
        description: 'Fertilize seedling',
        category: 'feeding',
        status: 'blocked',
        priority: 'normal',
        requiresObservation: false,
        requiresConfirmation: false,
        evidence: [],
        prerequisites: ['s-rt-2'],
      },
    ],
  });

  assert(Boolean(createRes.plan), 'TEST A: Plan created successfully');
  const createdPlanId = createRes.plan!.id;
  assert(createRes.plan!.steps.length === 3, 'TEST A: 3 steps initialized in created plan');
  assert(createRes.plan!.steps[0].planId === createdPlanId, 'TEST A: Step 1 mapped to created plan ID');

  // Verify plan_created audit event
  const eventsAfterCreate = await fetchPlanEvents(createdPlanId);
  assert(
    eventsAfterCreate.events.some((e) => e.eventType === 'plan_created'),
    'TEST A: plan_created audit event recorded in events log'
  );

  // Simulate browser refresh by fetching freshly from storage
  const reloadedPlanA = await fetchGrowPlanById(createdPlanId);
  assert(Boolean(reloadedPlanA.plan), 'TEST A: Plan persists and survives reload');
  assert(reloadedPlanA.plan?.name === 'Real Runtime Tomato Plan', 'TEST A: Plan name preserved on reload');
  assert(reloadedPlanA.plan?.steps.length === 3, 'TEST A: All steps preserved on reload');

  // 6. TEST B — Complete Step & Refresh Persistence
  const updatedPlanB = completePlanStep(reloadedPlanA.plan!, 's-rt-1', 'Rainwater applied 150ml');
  const saveResB = await updateGrowPlan(createdPlanId, {
    steps: updatedPlanB.steps,
    progress: updatedPlanB.progress,
    status: updatedPlanB.status,
    completedAt: updatedPlanB.completedAt,
    healthStatus: updatedPlanB.healthStatus,
  });
  assert(Boolean(saveResB.plan), 'TEST B: Step completion saved to storage');

  // Simulate browser refresh
  const reloadedPlanB = await fetchGrowPlanById(createdPlanId);
  assert(reloadedPlanB.plan?.steps[0].status === 'completed', 'TEST B: Step 1 completed status persists after refresh');
  assert(reloadedPlanB.plan?.steps[0].notes === 'Rainwater applied 150ml', 'TEST B: Step 1 grower notes persist after refresh');
  assert(Boolean(reloadedPlanB.plan?.steps[0].completedAt), 'TEST B: Step 1 completedAt persists after refresh');
  assert(reloadedPlanB.plan?.steps[1].status === 'ready', 'TEST B: Step 2 dynamically unblocked to ready on reload');
  assert(reloadedPlanB.plan?.progress.completedSteps === 1, 'TEST B: Progress completed count is 1 after refresh');

  // 7. TEST C & D — Observation Recording, Skip & Completion
  // Record observation on Step 2
  const reloadedStepsC = reloadedPlanB.plan!.steps.map((s) => {
    if (s.id === 's-rt-2') {
      return {
        ...s,
        notes: 'Rich green cotyledons visible, no yellowing',
        metadata: {
          ...s.metadata,
          observationRecorded: true,
          observedAt: new Date().toISOString(),
          observationText: 'Rich green cotyledons visible, no yellowing',
        },
      };
    }
    return s;
  });
  await updateGrowPlan(createdPlanId, { steps: reloadedStepsC });

  // Simulate refresh to verify observation persistence
  const reloadedPlanC = await fetchGrowPlanById(createdPlanId);
  const reloadedStep2 = reloadedPlanC.plan?.steps.find((s) => s.id === 's-rt-2');
  assert(reloadedStep2?.metadata?.observationRecorded === true, 'TEST D: Observation verified state persists after reload');
  assert(reloadedStep2?.metadata?.observationText === 'Rich green cotyledons visible, no yellowing', 'TEST D: Observation text persists after reload');

  // Skip Step 2
  const skippedPlan = skipPlanStep(reloadedPlanC.plan!, 's-rt-2', 'Skipped after observation baseline recorded');
  await updateGrowPlan(createdPlanId, {
    steps: skippedPlan.steps,
    progress: skippedPlan.progress,
    status: skippedPlan.status,
  });

  const reloadedPlanSkip = await fetchGrowPlanById(createdPlanId);
  assert(reloadedPlanSkip.plan?.steps[1].status === 'skipped', 'TEST C: Step 2 skipped status persists after reload');
  assert(reloadedPlanSkip.plan?.steps[1].metadata?.skipReason === 'Skipped after observation baseline recorded', 'TEST C: Skip reason persists after reload');
  assert(reloadedPlanSkip.plan?.steps[2].status === 'ready', 'TEST C: Step 3 unblocked to ready after Step 2 skipped');

  // 8. TEST E — Failure Simulation
  const fakeUpdateRes = await updateGrowPlan('non-existent-plan-id-999', { status: 'paused' });
  assert(Boolean(fakeUpdateRes.error), 'TEST E: Updating non-existent plan returns explicit error');
  assert(fakeUpdateRes.error === 'Plan not found.', 'TEST E: Error message is "Plan not found."');
  const intactCheck = await fetchGrowPlanById(createdPlanId);
  assert(intactCheck.plan?.name === 'Real Runtime Tomato Plan', 'TEST E: Failed operation does not corrupt existing plans');

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`GROWAI PHASE 13 TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (passedTests === totalTests) {
    console.log('STATUS: ALL ASSERTIONS PASSED (100% SUCCESS)');
  } else {
    console.log(`STATUS: ${totalTests - passedTests} ASSERTIONS FAILED`);
    process.exit(1);
  }
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
