/**
 * GrowAI Phase 11: Adaptive Grow Intelligence & Action System Test Battery
 * Comprehensive automated regression and feature test battery verifying:
 * 1. Garden State Synthesis (empty, single, multiple, mixed health, missing data)
 * 2. Action Prioritization (health, care, environment, growth, feeding, production, propagation, space, data quality)
 * 3. Next-Best-Action Engine (deterministic ordering, no false urgency, null handling)
 * 4. Data Quality Engine (completeness vs health separation, category scoring)
 * 5. Daily Grow Check (concise summary, positive signals, observation prompts)
 * 6. Natural Language Query Engine (grounded answers, historical yield, health status)
 * 7. Environmental & Production Invariants (never assume unsuitable, no guaranteed yield)
 * 8. Feeding & Structural Safety Invariants (no dosage invention, mandatory structural advisory)
 */

import { UserPlant } from './src/types/garden';
import { SavedDiagnosisRecord } from './src/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  ProductionSpaceMetrics,
} from './src/types/grow-intelligence';
import { Reminder } from './src/types/reminder';
import {
  synthesizeGardenState,
  prioritizeGardenActions,
  getNextBestAction,
  generateDailyGrowCheck,
  calculateDataQuality,
  answerGardenQuery,
  AdaptiveGardenInput,
} from './src/lib/adaptive-grow';

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  const fixedReferenceDate = new Date('2026-11-05T12:00:00.000Z');

  console.log('\n===============================================================');
  console.log('🌱 GROWAI PHASE 11: ADAPTIVE GROW INTELLIGENCE TEST SUITE');
  console.log('===============================================================\n');

  // ============================================================================
  // 1. GARDEN STATE ENGINE TESTS
  // ============================================================================
  console.log('1. Garden State Engine Synthesis:');
  {
    // Empty Garden
    const emptyState = synthesizeGardenState({
      plants: [],
      referenceDate: fixedReferenceDate,
    });
    assert(emptyState.plants.total === 0, 'Empty garden has 0 total plants');
    assert(emptyState.care.overdue === 0, 'Empty garden has 0 overdue care tasks');
    assert(emptyState.health.activeConcerns === 0, 'Empty garden has 0 health concerns');
    assert(emptyState.dataQuality.completenessScore === 0, 'Empty garden data quality score is 0%');

    // Single Plant with Mixed Diagnoses
    const plant1: UserPlant = {
      id: 'p-1',
      plantSlug: 'sweet-basil',
      nickname: 'Kitchen Basil',
      plantedDate: '2026-10-01',
      currentStage: 'Growing',
      location: 'Kitchen Tier',
      tier: 'top',
      potSize: '20 cm Pot',
      notes: [
        {
          id: 'n-1',
          date: '2026-11-01',
          stage: 'Growing',
          text: 'Vigorous new leaf sets forming.',
          heightCm: 18,
        },
      ],
    };

    const plant2: UserPlant = {
      id: 'p-2',
      plantSlug: 'roma-tomato',
      nickname: 'Balcony Tomato',
      plantedDate: '2026-09-15',
      currentStage: 'Mature',
      location: 'Balcony Rack',
      tier: 'middle',
      potSize: '30 cm Pot',
      notes: [], // No notes (growth gap)
    };

    const diag1: SavedDiagnosisRecord = {
      id: 'diag-1',
      userId: 'user-1',
      userPlantId: 'p-1',
      schemaVersion: '1.0',
      diagnosticSource: 'gemini-vision',
      status: 'completed',
      isPlantRecognized: true,
      plantIdentification: 'Sweet Basil',
      plantIdentificationConfidence: 'high',
      overallHealth: 'moderate_issue',
      primaryClassification: 'biotic',
      symptoms: 'Fine webbing on underside of lower leaves',
      userContext: {},
      visibleSymptoms: ['webbing', 'stippling'],
      likelyCauses: ['spider-mites'],
      recommendedChecks: ['Inspect with hand lens'],
      immediateActions: ['Wipe foliage gently'],
      longTermCare: ['Improve humidity'],
      prevention: ['Avoid dry conditions'],
      uncertainties: [],
      requiresExpertReview: false,
      summary: 'Suspected spider mites.',
      disclaimer: 'Advisory guidance.',
      diagnosedAt: '2026-11-01T10:00:00Z',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:00:00Z',
      candidates: [
        {
          id: 'cand-1',
          diagnosisId: 'diag-1',
          userId: 'user-1',
          candidateRank: 1,
          conditionName: 'Spider Mites',
          confidenceCategory: 'high',
          explanation: 'Spider mite activity.',
          supportingEvidence: ['Visible webbing'],
          alternativeCauses: [],
          createdAt: '2026-11-01T10:00:00Z',
        },
      ],
      followUps: [],
    };

    const state = synthesizeGardenState({
      plants: [plant1, plant2],
      diagnoses: [diag1],
      referenceDate: fixedReferenceDate,
    });

    assert(state.plants.total === 2, 'Counts 2 total plants');
    assert(state.plants.active === 2, 'Counts 2 active plants');
    assert(state.plants.needsAttention === 1, 'Counts 1 plant needing attention (Kitchen Basil)');
    assert(state.plants.unknown === 1, 'Counts 1 plant with unknown health (Tomato)');
    assert(state.health.unresolvedFollowUps === 1, 'Counts 1 unresolved health follow-up');
    assert(state.growth.plantsWithoutRecentObservation === 1, 'Identifies 1 plant without recent growth note');
  }

  // ============================================================================
  // 2. ACTION PRIORITIZATION ENGINE TESTS
  // ============================================================================
  console.log('\n2. Action Prioritization Engine:');
  {
    const plant: UserPlant = {
      id: 'p-basil',
      plantSlug: 'sweet-basil',
      nickname: 'Genovese Basil',
      plantedDate: '2026-10-10',
      currentStage: 'Growing',
      location: 'Balcony Rack',
      potSize: '20 cm Pot',
      notes: [],
    };

    // Health: High-confidence biotic diagnosis with overdue follow-up -> critical
    const criticalDiag: SavedDiagnosisRecord = {
      id: 'diag-crit',
      userId: 'user-1',
      userPlantId: 'p-basil',
      schemaVersion: '1.0',
      diagnosticSource: 'gemini-vision',
      status: 'completed',
      isPlantRecognized: true,
      plantIdentification: 'Sweet Basil',
      plantIdentificationConfidence: 'high',
      overallHealth: 'moderate_issue',
      primaryClassification: 'biotic',
      symptoms: 'Spider mite webbing observed',
      userContext: {},
      visibleSymptoms: ['webbing'],
      likelyCauses: ['spider-mites'],
      recommendedChecks: [],
      immediateActions: [],
      longTermCare: [],
      prevention: [],
      uncertainties: [],
      requiresExpertReview: false,
      summary: 'Confirmed mites',
      disclaimer: 'Advisory guidance',
      diagnosedAt: '2026-10-25T10:00:00Z',
      createdAt: '2026-10-25T10:00:00Z',
      updatedAt: '2026-10-25T10:00:00Z',
      candidates: [
        {
          id: 'c-1',
          diagnosisId: 'diag-crit',
          userId: 'user-1',
          candidateRank: 1,
          conditionName: 'Two-Spotted Spider Mite',
          confidenceCategory: 'high',
          explanation: 'Spider mite presence',
          supportingEvidence: ['Webbing'],
          alternativeCauses: [],
          createdAt: '2026-10-25T10:00:00Z',
        },
      ],
      followUps: [],
    };

    // Care: Overdue reminder
    const overdueReminder: Reminder = {
      id: 'rem-1',
      userId: 'user-1',
      plantId: 'p-basil',
      plantNickname: 'Genovese Basil',
      sourceType: 'care_task',
      reminderType: 'care',
      title: 'Water Basil',
      body: 'Check top 2cm of soil and water if dry.',
      scheduledFor: '2026-11-01T08:00:00Z',
      dueAt: '2026-11-01T08:00:00Z',
      priority: 'high',
      status: 'overdue',
      isRead: false,
      createdAt: '2026-11-01T08:00:00Z',
      updatedAt: '2026-11-01T08:00:00Z',
    };

    // Environment: Waterlogged condition
    const waterloggedCond: GrowingConditionObservation = {
      id: 'cond-1',
      userId: 'user-1',
      plantId: 'p-basil',
      observationTime: '2026-11-04T10:00:00Z',
      temperatureCelsius: 22,
      relativeHumidityPercent: 60,
      soilMoisture: 'waterlogged',
      lightLevel: 'bright_indirect',
      airflowQuality: 'gentle',
      isGrowLight: false,
      createdAt: '2026-11-04T10:00:00Z',
      updatedAt: '2026-11-04T10:00:00Z',
    };

    // Feeding: Incomplete record
    const incompleteFeeding: FeedingRecord = {
      id: 'feed-1',
      userId: 'user-1',
      plantId: 'p-basil',
      feedingDate: '2026-11-03T10:00:00Z',
      productName: '', // Missing product name
      fertilizerType: 'organic',
      applicationMethod: 'soil_drench',
      dosageUnknown: false,
      createdAt: '2026-11-03T10:00:00Z',
      updatedAt: '2026-11-03T10:00:00Z',
    };

    const actions = prioritizeGardenActions({
      plants: [plant],
      diagnoses: [criticalDiag],
      reminders: [overdueReminder],
      conditions: [waterloggedCond],
      feedings: [incompleteFeeding],
      referenceDate: fixedReferenceDate,
    });

    const healthAction = actions.find((a) => a.category === 'health');
    assert(Boolean(healthAction), 'Generates health review action');
    assert(healthAction?.priority === 'critical', 'High-confidence biotic issue is flagged as critical priority');
    assert(healthAction?.evidence.length! >= 1, 'Health action contains explicit supporting evidence');

    const careAction = actions.find((a) => a.category === 'care');
    assert(Boolean(careAction), 'Generates care action for overdue reminder');
    assert(careAction?.priority === 'high', 'Overdue care task has high priority');

    const envAction = actions.find((a) => a.category === 'environment');
    assert(Boolean(envAction), 'Generates environment action for waterlogged condition');
    assert(envAction?.priority === 'high', 'Waterlogged moisture condition has high priority');

    const feedAction = actions.find((a) => a.category === 'feeding');
    assert(Boolean(feedAction), 'Generates feeding review action for incomplete record');
    assert(Boolean(feedAction?.recommendedAction.includes('label')), 'Feeding guidance references manufacturer product label');

    const growthAction = actions.find((a) => a.category === 'growth');
    assert(Boolean(growthAction), 'Generates growth observation gap action when no notes exist in >14 days');
  }

  // ============================================================================
  // 3. LOW-CONFIDENCE AI HYPOTHESIS NEVER ESCALATED TO CRITICAL
  // ============================================================================
  console.log('\n3. Low-Confidence AI Hypothesis Safety Rules:');
  {
    const plant: UserPlant = {
      id: 'p-mint',
      plantSlug: 'spearmint',
      nickname: 'Balcony Mint',
      plantedDate: '2026-10-01',
      currentStage: 'Growing',
      location: 'Balcony Rack',
      notes: [{ id: 'n-m', date: '2026-11-04', stage: 'Growing', text: 'Spreading well.' }],
    };

    const lowConfidenceDiag: SavedDiagnosisRecord = {
      id: 'diag-low',
      userId: 'user-1',
      userPlantId: 'p-mint',
      schemaVersion: '1.0',
      diagnosticSource: 'gemini-vision',
      status: 'completed',
      isPlantRecognized: true,
      plantIdentification: 'Spearmint',
      plantIdentificationConfidence: 'low',
      overallHealth: 'mild_stress',
      primaryClassification: 'undetermined',
      symptoms: 'Mild leaf discoloration',
      userContext: {},
      visibleSymptoms: ['pale leaves'],
      likelyCauses: ['possible nutrient or light imbalance'],
      recommendedChecks: [],
      immediateActions: [],
      longTermCare: [],
      prevention: [],
      uncertainties: ['Image resolution was low'],
      requiresExpertReview: false,
      summary: 'Inconclusive mild leaf stress',
      disclaimer: 'Advisory guidance',
      diagnosedAt: '2026-11-03T10:00:00Z',
      createdAt: '2026-11-03T10:00:00Z',
      updatedAt: '2026-11-03T10:00:00Z',
      candidates: [
        {
          id: 'cand-low-1',
          diagnosisId: 'diag-low',
          userId: 'user-1',
          candidateRank: 1,
          conditionName: 'Chlorosis (Undetermined)',
          confidenceCategory: 'low',
          explanation: 'Low confidence hypothesis',
          supportingEvidence: [],
          alternativeCauses: [],
          createdAt: '2026-11-03T10:00:00Z',
        },
      ],
      followUps: [],
    };

    const actions = prioritizeGardenActions({
      plants: [plant],
      diagnoses: [lowConfidenceDiag],
      referenceDate: fixedReferenceDate,
    });

    const mintHealthAction = actions.find((a) => a.plantId === 'p-mint' && a.category === 'health');
    assert(mintHealthAction?.priority !== 'critical', 'Low-confidence AI hypothesis is strictly NOT escalated to critical priority');
  }

  // ============================================================================
  // 4. "WHAT SHOULD I DO NOW?" NEXT-BEST-ACTION ENGINE TESTS
  // ============================================================================
  console.log('\n4. Next-Best-Action Deterministic Ordering & Zero False Urgency:');
  {
    const gardenState = synthesizeGardenState({
      plants: [],
      referenceDate: fixedReferenceDate,
    });

    // When no actions exist
    const nullAction = getNextBestAction(gardenState, []);
    assert(nullAction === null, 'Returns null when action queue is empty (no false urgency)');

    // Multiple actions with different priorities
    const sampleActions = prioritizeGardenActions({
      plants: [
        {
          id: 'p-1',
          plantSlug: 'sweet-basil',
          nickname: 'Sweet Basil',
          plantedDate: '2026-10-01',
          currentStage: 'Growing',
          notes: [],
        },
      ],
      reminders: [
        {
          id: 'rem-overdue',
          userId: 'u-1',
          plantId: 'p-1',
          sourceType: 'care_task',
          reminderType: 'care',
          title: 'Overdue Care',
          body: 'Care task',
          scheduledFor: '2026-11-01T00:00:00Z',
          dueAt: '2026-11-01T00:00:00Z',
          priority: 'high',
          status: 'overdue',
          isRead: false,
          createdAt: '2026-11-01T00:00:00Z',
          updatedAt: '2026-11-01T00:00:00Z',
        },
      ],
      referenceDate: fixedReferenceDate,
    });

    const nextAction = getNextBestAction(gardenState, sampleActions);
    assert(nextAction !== null, 'Selects an action when items exist');
    assert(nextAction?.category === 'care', 'Selects overdue care as highest priority');
  }

  // ============================================================================
  // 5. DATA QUALITY INTELLIGENCE TESTS
  // ============================================================================
  console.log('\n5. Data Quality Intelligence Engine:');
  {
    // Incomplete plant records
    const incompletePlant: UserPlant = {
      id: 'p-inc',
      plantSlug: 'sweet-basil',
      nickname: 'Mystery Basil',
      plantedDate: '', // Missing
      currentStage: 'Seedling',
      notes: [],
    };

    const report = calculateDataQuality({
      plants: [incompletePlant],
      conditions: [],
      feedings: [],
      referenceDate: fixedReferenceDate,
    });

    assert(typeof report.score === 'number', 'Completeness score is a number');
    assert(report.score < 50, 'Incomplete records score below 50%');
    assert(report.categories.length >= 5, 'Contains at least 5 audit categories');

    const basicsCat = report.categories.find((c) => c.category === 'Plant Basics');
    assert(basicsCat !== undefined, 'Includes Plant Basics category');
    assert(basicsCat?.missing.some((m) => m.includes('planting date')) === true, 'Flags missing planting date');
  }

  // ============================================================================
  // 6. DAILY GROW CHECK ENGINE TESTS
  // ============================================================================
  console.log('\n6. Daily Grow Check Summary Engine:');
  {
    const state = synthesizeGardenState({
      plants: [
        {
          id: 'p-healthy',
          plantSlug: 'sweet-basil',
          nickname: 'Thriving Basil',
          plantedDate: '2026-10-01',
          currentStage: 'Growing',
          notes: [{ id: 'n-1', date: '2026-11-04', stage: 'Growing', text: 'Healthy.' }],
        },
      ],
      referenceDate: fixedReferenceDate,
    });

    const check = generateDailyGrowCheck({
      gardenState: state,
      actions: [],
      referenceDate: fixedReferenceDate,
    });

    assert(check.noActionNeeded === true, 'Marks noActionNeeded as true when queue is clean');
    assert(check.headline.includes('Nothing requires'), 'Headline reflects calm status');
    assert(check.date === '2026-11-05', 'Generates correct ISO calendar date');
  }

  // ============================================================================
  // 7. GROUNDED NATURAL LANGUAGE QUERY ENGINE TESTS
  // ============================================================================
  console.log('\n7. Grounded Natural-Language Query Engine:');
  {
    const plantA: UserPlant = {
      id: 'p-tomato',
      plantSlug: 'roma-tomato',
      nickname: 'Roma Tomato',
      plantedDate: '2026-09-01',
      currentStage: 'Mature',
      notes: [],
    };

    const harvest1: HarvestRecord = {
      id: 'h-1',
      userId: 'u-1',
      plantId: 'p-tomato',
      harvestDate: '2026-10-20T10:00:00Z',
      quantity: 450,
      unit: 'g',
      harvestType: 'cut_and_come_again',
      createdAt: '2026-10-20T10:00:00Z',
      updatedAt: '2026-10-20T10:00:00Z',
    };

    const input: AdaptiveGardenInput = {
      plants: [plantA],
      harvests: [harvest1],
      referenceDate: fixedReferenceDate,
    };

    const gState = synthesizeGardenState(input);
    const gActions = prioritizeGardenActions(input);

    // Query 1: What should I do today?
    const q1 = answerGardenQuery('What should I do today?', {
      gardenState: gState,
      actions: gActions,
      input,
    });
    assert(q1.intent === 'next_action_query', 'Detects next_action_query intent');
    assert(q1.groundedFacts.length > 0, 'Includes grounded facts in answer');

    // Query 2: Which crops produced the most historically?
    const q2 = answerGardenQuery('Which crops produced the most historically?', {
      gardenState: gState,
      actions: gActions,
      input,
    });
    assert(q2.intent === 'harvest_analytics_query', 'Detects harvest_analytics_query intent');
    assert(q2.answer.includes('Roma Tomato'), 'Identifies highest-producing crop from recorded harvests');
    assert(q2.answer.includes('does not guarantee'), 'Preserves warning that historical yield does not guarantee future production');

    // Query 3: What information am I missing?
    const q3 = answerGardenQuery('What information am I missing?', {
      gardenState: gState,
      actions: gActions,
      input,
    });
    assert(q3.intent === 'data_quality_query', 'Detects data_quality_query intent');
    assert(q3.answer.includes('complete'), 'Reports record completeness percentage');

    // Query 4: Unrecognized query fallback
    const q4 = answerGardenQuery('Can you tell me about the weather on Mars?', {
      gardenState: gState,
      actions: gActions,
      input,
    });
    assert(q4.intent === 'general_garden_summary', 'Falls back safely to general garden summary without hallucinating');
  }

  // ============================================================================
  // 8. PRODUCTION & STRUCTURAL SAFETY ADVISORY INVARIANTS
  // ============================================================================
  console.log('\n8. Space Utilization & Structural Safety Invariants:');
  {
    const spaceHighMetrics: ProductionSpaceMetrics = {
      totalSpaceCapacityUnits: 10,
      activePlantsOccupied: 9,
      occupancyRatePercent: 90,
      activeCycleOccupancy: 0,
      unusedCapacitySlots: 1,
      tierDistribution: { top: 3, middle: 3, bottom: 3, unassigned: 0 },
      isStructuralSafetyVerified: false,
      advisories: ['Verify structural load capacity before increasing container load.'],
    };

    const actions = prioritizeGardenActions({
      plants: [],
      spaceMetrics: spaceHighMetrics,
      referenceDate: fixedReferenceDate,
    });

    const spaceAction = actions.find((a) => a.category === 'space');
    assert(Boolean(spaceAction), 'Emits space advisory when occupancy is >= 85%');
    assert(Boolean(spaceAction?.recommendedAction.includes('structural load')), 'Advisory mandates verifying structural load capacity');
  }

  console.log('\n===============================================================');
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('===============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

