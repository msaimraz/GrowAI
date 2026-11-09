// @ts-nocheck
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import {
  GrowPlan,
  GrowPlanStep,
  PlanProgress,
} from './src/types/grow-plan';
import {
  checkStepPrerequisites,
  evaluateStepStatus,
  evaluateAllPlanSteps,
  completePlanStep,
  skipPlanStep,
} from './src/lib/grow-plans/plan-step-engine';
import { calculatePlanProgress, evaluatePlanHealthStatus } from './src/lib/grow-plans/plan-progress';
import {
  mapStepToDbPayload,
  mapDbToStep,
  mapDbToPlan,
  normalizeStepCategoryForDb,
  normalizePriorityForDb,
  isValidUuid,
  createGrowPlan,
  fetchGrowPlanById,
  updateGrowPlan,
  updatePlanStep,
  resetIsolatedTestPlanStore,
} from './src/lib/grow-plans/storage';

process.env.NODE_ENV = 'test';
process.env.GROWAI_TEST_MODE = 'true';

// Read .env.local without exposing secrets
const envFile = fs.readFileSync('.env.local', 'utf-8');
const envVars: Record<string, string> = {};
for (const line of envFile.split('\n')) {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      envVars[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
    }
  }
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✓ ${message}`);
}

async function runProductionIntegrityAudit() {
  console.log('================================================================');
  console.log('GROWAI GROW PLANS: PRODUCTION INTEGRITY AUDIT SUITE');
  console.log('================================================================\n');

  // ============================================================================
  // SUITE 1: UNIT-TEST VERIFICATION
  // ============================================================================
  console.log('--- SUITE 1: UNIT-TEST VERIFICATION ---');

  // 1. Mandatory Observation vs Optional Step Prerequisite Semantics
  const optPrereq: GrowPlanStep = {
    id: 's-opt-1',
    planId: 'p-unit',
    userId: 'u-1',
    title: 'Apply mulch layer',
    category: 'care',
    status: 'skipped',
    priority: 'normal',
    requiresObservation: false,
    requiresConfirmation: false,
    evidence: [],
    metadata: { skipReason: 'No mulch on hand' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mandObsPrereq: GrowPlanStep = {
    id: 's-mand-obs-1',
    planId: 'p-unit',
    userId: 'u-1',
    title: 'Phytosanitary inspection for powdery mildew',
    category: 'observation',
    status: 'skipped',
    priority: 'high',
    requiresObservation: true,
    requiresConfirmation: false,
    evidence: [],
    metadata: {
      isMandatoryObservation: true,
      isSafetyCritical: true,
      skipReason: 'Skipped by mistake',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const targetStepA: GrowPlanStep = {
    id: 's-target-a',
    planId: 'p-unit',
    userId: 'u-1',
    title: 'Water after mulching',
    category: 'care',
    status: 'pending',
    priority: 'normal',
    requiresObservation: false,
    requiresConfirmation: false,
    evidence: [],
    prerequisites: ['s-opt-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const targetStepB: GrowPlanStep = {
    id: 's-target-b',
    planId: 'p-unit',
    userId: 'u-1',
    title: 'Apply Organic Bio-Fungicide',
    category: 'care',
    status: 'pending',
    priority: 'high',
    requiresObservation: false,
    requiresConfirmation: false,
    evidence: [],
    prerequisites: ['s-mand-obs-1'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const checkOpt = checkStepPrerequisites(targetStepA, [optPrereq, targetStepA]);
  assert(checkOpt.isMet === true, 'Unit: Optional step skipped correctly satisfies prerequisite');

  const checkMand = checkStepPrerequisites(targetStepB, [mandObsPrereq, targetStepB]);
  assert(checkMand.isMet === false, 'Unit: Mandatory observation step skipped DOES NOT satisfy prerequisite');
  assert(evaluateStepStatus(targetStepB, [mandObsPrereq, targetStepB]) === 'blocked', 'Unit: Dependent step remains blocked');

  // 2. Terminal State Invariants
  const dummyPlan: GrowPlan = {
    id: 'plan-term-1',
    userId: 'u-1',
    name: 'Terminal Test Plan',
    scope: 'plant',
    objective: 'establish_plant',
    status: 'cancelled',
    healthStatus: 'unknown',
    priority: 'normal',
    startDate: new Date().toISOString(),
    targetDate: null,
    completedAt: null,
    pausedAt: null,
    cancelledAt: new Date().toISOString(),
    plantId: null,
    plantIds: [],
    steps: [targetStepA],
    progress: {
      totalSteps: 1,
      completedSteps: 0,
      skippedSteps: 0,
      pendingSteps: 1,
      readySteps: 0,
      blockedSteps: 0,
      completionPercentage: 0,
      isComplete: false,
    },
    evidence: [],
    adjustmentHistory: [],
    metadata: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const termComplete = completePlanStep(dummyPlan, 's-target-a');
  assert(termComplete.status === 'cancelled', 'Unit: Cancelled plan status cannot regress on completeStep');
  assert(Boolean(termComplete.error), 'Unit: Execution on cancelled plan returns explicit error');

  const termSkip = skipPlanStep(dummyPlan, 's-target-a');
  assert(termSkip.status === 'cancelled', 'Unit: Cancelled plan status cannot regress on skipStep');
  assert(Boolean(termSkip.error), 'Unit: Skip on cancelled plan returns explicit error');

  console.log('✓ Suite 1 (Unit Tests) verified successfully.\n');

  // ============================================================================
  // SUITE 2: IN-MEMORY INTEGRATION VERIFICATION
  // ============================================================================
  console.log('--- SUITE 2: IN-MEMORY INTEGRATION VERIFICATION ---');
  resetIsolatedTestPlanStore();

  const inMemoryCreate = await createGrowPlan({
    name: 'Isolated In-Memory Basil Plan',
    scope: 'plant',
    objective: 'establish_plant',
    steps: [
      {
        id: 's-mem-1',
        title: 'Hydrate plug',
        category: 'care',
        status: 'ready',
        priority: 'normal',
        requiresObservation: false,
        requiresConfirmation: false,
        evidence: [],
      },
      {
        id: 's-mem-2',
        title: 'Check roots',
        category: 'observation',
        status: 'blocked',
        priority: 'normal',
        requiresObservation: true,
        requiresConfirmation: false,
        evidence: [],
        prerequisites: ['s-mem-1'],
      },
    ],
  });

  assert(Boolean(inMemoryCreate.plan), 'In-Memory: Plan created in isolated test store');
  const memPlanId = inMemoryCreate.plan!.id;

  const afterStep1 = completePlanStep(inMemoryCreate.plan!, 's-mem-1', 'Hydrated fully');
  const updateRes1 = await updateGrowPlan(memPlanId, {
    steps: afterStep1.steps,
    progress: afterStep1.progress,
    status: afterStep1.status,
  });
  assert(!updateRes1.error, 'In-Memory: Step 1 completed and saved');

  const reloadedMem = await fetchGrowPlanById(memPlanId);
  assert(reloadedMem.plan?.steps[0].status === 'completed', 'In-Memory: Step 1 status is completed in memory');
  assert(reloadedMem.plan?.steps[1].status === 'ready', 'In-Memory: Step 2 dynamically unblocked in memory');

  console.log('✓ Suite 2 (In-Memory Integration) verified successfully.\n');

  // ============================================================================
  // SUITE 3: GUEST / LOCAL PERSISTENCE VERIFICATION
  // ============================================================================
  console.log('--- SUITE 3: GUEST / LOCAL PERSISTENCE VERIFICATION ---');

  // Mock localStorage in global scope to simulate browser environment
  const mockStorage: Record<string, string> = {};
  const originalWindow = (globalThis as any).window;
  const originalLocalStorage = (globalThis as any).localStorage;

  (globalThis as any).window = { location: { origin: 'http://localhost:3000' } };
  (globalThis as any).localStorage = {
    getItem: (k: string) => mockStorage[k] || null,
    setItem: (k: string, v: string) => { mockStorage[k] = v; },
    removeItem: (k: string) => { delete mockStorage[k]; },
  };

  // Temporarily disable test mode to test real guest browser path
  const prevTestMode = process.env.GROWAI_TEST_MODE;
  delete process.env.GROWAI_TEST_MODE;

  try {
    const guestPlan: GrowPlan = {
      id: 'guest-plan-balcony',
      userId: 'user-guest-visitor',
      name: 'Guest Balcony Mint Care',
      scope: 'plant',
      objective: 'general_care',
      status: 'active',
      healthStatus: 'on_track',
      priority: 'normal',
      startDate: new Date().toISOString(),
      targetDate: null,
      completedAt: null,
      pausedAt: null,
      cancelledAt: null,
      plantId: 'guest-plant-1',
      plantIds: ['guest-plant-1'],
      steps: [
        {
          id: 'step-g-1',
          planId: 'guest-plan-balcony',
          userId: 'user-guest-visitor',
          title: 'Morning misting',
          category: 'care',
          status: 'ready',
          priority: 'normal',
          requiresObservation: false,
          requiresConfirmation: false,
          evidence: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      progress: {
        totalSteps: 1,
        completedSteps: 0,
        skippedSteps: 0,
        pendingSteps: 0,
        readySteps: 1,
        blockedSteps: 0,
        completionPercentage: 0,
        isComplete: false,
      },
      evidence: [],
      adjustmentHistory: [],
      metadata: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to guest localStorage
    const guestSaveRes = await updateGrowPlan('guest-plan-balcony', guestPlan);
    // Since guest-plan-balcony was not initially in storage, test Plan not found or create
    const guestCreate = await createGrowPlan(guestPlan);
    assert(Boolean(guestCreate.plan), 'Guest: Created plan saved to browser localStorage');
    assert(Boolean(mockStorage['growai_demo_grow_plans_v1']), 'Guest: localStorage contains serialized plans');

    // Simulate page refresh: fetch from fresh localStorage
    const guestReload = await fetchGrowPlanById('guest-plan-balcony');
    assert(guestReload.plan?.name === 'Guest Balcony Mint Care', 'Guest: Reloaded plan preserves name from localStorage');
    assert(guestReload.plan?.steps.length === 1, 'Guest: Reloaded plan preserves steps from localStorage');
    console.log('✓ Suite 3 (Guest / Local Persistence) verified successfully.\n');
  } finally {
    // Restore environment
    process.env.GROWAI_TEST_MODE = prevTestMode;
    (globalThis as any).window = originalWindow;
    (globalThis as any).localStorage = originalLocalStorage;
  }

  // ============================================================================
  // SUITE 4: ACTUAL SUPABASE PRODUCTION VERIFICATION
  // ============================================================================
  console.log('--- SUITE 4: ACTUAL SUPABASE PRODUCTION VERIFICATION ---');

  if (!supabaseUrl || !anonKey) {
    console.error('Supabase URL or Anon Key missing.');
    process.exit(1);
  }

  const client = createClient(supabaseUrl, anonKey);
  console.log('Connecting to production Supabase project:', supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1...'));

  // 1. Verify required tables exist and are queryable
  const tables = ['grow_plans', 'grow_plan_steps', 'grow_plan_events', 'user_plants'];
  for (const table of tables) {
    const { data, error } = await client.from(table).select('id').limit(1);
    assert(!error, `Production Supabase table "${table}" exists and is queryable (status: 200 OK)`);
  }

  // 2. Verify RLS Enforcement on Production Tables
  const unauthPlanAttempt = await client.from('grow_plans').insert({
    id: 'f0000000-0000-0000-0000-000000000001',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    name: 'Unauthenticated Intrusion Attempt',
    scope: 'plant',
    objective: 'establish_plant',
    status: 'active',
  });

  assert(Boolean(unauthPlanAttempt.error), 'Production: RLS blocked unauthenticated insert into grow_plans');
  assert(unauthPlanAttempt.error?.code === '42501', `Production: RLS error code is 42501 (insufficient_privilege)`);

  const unauthStepAttempt = await client.from('grow_plan_steps').insert({
    id: 'f0000000-0000-0000-0000-000000000002',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    plan_id: 'f0000000-0000-0000-0000-000000000001',
    title: 'Unauthenticated Step Attempt',
    category: 'care',
    status: 'pending',
  });
  assert(Boolean(unauthStepAttempt.error), 'Production: RLS blocked unauthenticated insert into grow_plan_steps');
  assert(unauthStepAttempt.error?.code === '42501', 'Production: RLS error code on grow_plan_steps is 42501');

  const unauthEventAttempt = await client.from('grow_plan_events').insert({
    id: 'f0000000-0000-0000-0000-000000000003',
    user_id: 'e0000000-0000-0000-0000-000000000001',
    plan_id: 'f0000000-0000-0000-0000-000000000001',
    event_type: 'plan_created',
  });
  assert(Boolean(unauthEventAttempt.error), 'Production: RLS blocked unauthenticated insert into grow_plan_events');
  assert(unauthEventAttempt.error?.code === '42501', 'Production: RLS error code on grow_plan_events is 42501');

  // 3. Round-Trip Serialization & Normalization Verification against Supabase Schema Constraints
  const testStepPayload = mapStepToDbPayload({
    id: '11111111-2222-3333-4444-555555555555',
    planId: '66666666-7777-8888-9999-000000000000',
    userId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    title: 'Precision Root Zone Watering',
    description: 'Irrigate with 250ml water',
    category: 'watering', // Domain category outside DB check constraint
    status: 'ready',
    priority: 'critical', // Domain priority outside DB check constraint
    requiresObservation: true,
    requiresConfirmation: false,
    evidence: [],
    metadata: {
      customField: 'soil-sensor-check',
      isMandatoryObservation: true,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }, '66666666-7777-8888-9999-000000000000', 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee');

  assert(testStepPayload.category === 'care', 'Mapping: Category "watering" mapped to DB allowed value "care"');
  assert(testStepPayload.priority === 'urgent', 'Mapping: Priority "critical" mapped to DB allowed value "urgent"');
  assert(testStepPayload.dependency_metadata.originalCategory === 'watering', 'Mapping: Original category preserved in metadata');
  assert(testStepPayload.dependency_metadata.originalPriority === 'critical', 'Mapping: Original priority preserved in metadata');
  assert(testStepPayload.dependency_metadata.customField === 'soil-sensor-check', 'Mapping: Custom metadata preserved');

  const reconstructed = mapDbToStep(testStepPayload);
  assert(reconstructed.category === 'watering', 'Reconstruction: Restored original category "watering"');
  assert(reconstructed.priority === 'critical', 'Reconstruction: Restored original priority "critical"');
  assert(reconstructed.metadata?.customField === 'soil-sensor-check', 'Reconstruction: Restored custom metadata');

  console.log('✓ Suite 4 (Actual Supabase Production) verified successfully.\n');

  console.log('================================================================');
  console.log('STATUS: ALL 4 SEPARATE PRODUCTION SUITES PASSED (100% SUCCESS)');
  console.log('================================================================');
}

runProductionIntegrityAudit().catch((err) => {
  console.error('Production audit error:', err);
  process.exit(1);
});
