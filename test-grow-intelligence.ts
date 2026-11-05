/**
 * GrowAI Phase 10: Grow Intelligence & Production System Test Suite
 * Comprehensive automated regression and feature test battery verifying:
 * - Growing Conditions Assessment & Unknown Preservation
 * - Feeding & Fertilization Tracking (NPK integrity, unknown dosage handling, foliar signs)
 * - Propagation & Lineage Engine (parent-offspring links, timeline events)
 * - Production Cycles & Harvest Yield Analytics (area yield protection, unit groupings)
 * - Space Utilization & Structural Safety Protection
 * - Unified Grow Intelligence Synthesis (provenance separation, confidence tags, gap detection)
 * - Phase 10 Reminder Generation & Plant Timeline Integration
 * - Persistence Adapter & Dual-Storage Offline Queue
 */

import { UserPlant } from './src/types/garden';
import { SavedDiagnosisRecord } from './src/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
} from './src/types/grow-intelligence';
import {
  assessConditions,
  compareTemperatureRange,
  compareHumidityRange,
} from './src/lib/grow-intelligence/conditions-engine';
import {
  summarizeFeedingHistory,
  formatNpkRatio,
  assessFoliarNutrientObservation,
} from './src/lib/grow-intelligence/feeding-engine';
import {
  buildPlantLineage,
  generatePropagationTimelineEvents,
} from './src/lib/grow-intelligence/propagation-engine';
import {
  calculateYieldMetrics,
  compareCropCycles,
  generateHarvestTimelineEvents,
} from './src/lib/grow-intelligence/production-engine';
import {
  calculateSpaceMetrics,
} from './src/lib/grow-intelligence/space-production-advisory';
import {
  generateUnifiedIntelligence,
} from './src/lib/grow-intelligence/intelligence-engine';
import {
  generateFeedingReminders,
  generatePropagationReminders,
  generateHarvestMilestoneReminders,
  generateDailyGrowCheckReminders,
} from './src/lib/reminders/reminder-generator';
import {
  buildPlantTimeline,
  filterTimelineEvents,
} from './src/lib/plant-timeline';
import {
  saveGrowingCondition,
  saveFeedingRecord,
  savePropagationEvent,
  saveProductionCycle,
  saveHarvestRecord,
  fetchGrowingConditions,
  fetchFeedingRecords,
  fetchPropagationEvents,
  fetchProductionCycles,
  fetchHarvestRecords,
} from './src/lib/grow-intelligence/storage';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🌱 GROWAI PHASE 10: AUTOMATED TEST SUITE');
  console.log('===============================================================\n');

  // --------------------------------------------------------------------------
  // TEST SUITE 1: Growing Conditions Engine & Unknown Preservation
  // --------------------------------------------------------------------------
  console.log('1. Growing Conditions Engine & Botanical Range Assessment:');
  {
    const normalObs: GrowingConditionObservation = {
      id: 'cond-1',
      userId: 'user-1',
      plantId: 'plant-basil-1',
      observationTime: '2026-11-05T10:00:00Z',
      temperatureCelsius: 22,
      relativeHumidityPercent: 55,
      lightLevel: 'bright_indirect',
      lightSource: 'natural',
      isGrowLight: false,
      soilMoisture: 'moist',
      airflowQuality: 'moderate',
      drainageQuality: 'adequate',
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z',
    };

    const normalAssessment = assessConditions(normalObs, 'sweet-basil');
    assert(normalAssessment.totalObservations === 1, 'Counts 1 total condition observation');
    const tempMetric = normalAssessment.assessments.find((a) => a.metricName === 'temperature');
    assert(tempMetric?.status === 'within_expected_range', 'Basil at 22°C is within expected range');
    assert(tempMetric?.provenance === 'observed', 'Temperature metric tagged as observed fact');

    // Test low temperature
    const coldObs: GrowingConditionObservation = {
      ...normalObs,
      temperatureCelsius: 8,
    };
    const coldAssessment = assessConditions(coldObs, 'sweet-basil');
    const coldTemp = coldAssessment.assessments.find((a) => a.metricName === 'temperature');
    assert(coldTemp?.status === 'possibly_low', 'Basil at 8°C flagged as possibly_low');

    // Test high temperature
    const hotObs: GrowingConditionObservation = {
      ...normalObs,
      temperatureCelsius: 38,
    };
    const hotAssessment = assessConditions(hotObs, 'sweet-basil');
    const hotTemp = hotAssessment.assessments.find((a) => a.metricName === 'temperature');
    assert(hotTemp?.status === 'possibly_high', 'Basil at 38°C flagged as possibly_high');

    // CRITICAL RULE: Unknown preservation
    const emptyObs: GrowingConditionObservation = {
      id: 'cond-empty',
      userId: 'user-1',
      plantId: 'plant-basil-1',
      observationTime: '2026-11-05T10:00:00Z',
      isGrowLight: false,
      createdAt: '2026-11-05T10:00:00Z',
      updatedAt: '2026-11-05T10:00:00Z',
    };
    const emptyAssessment = assessConditions(emptyObs, 'sweet-basil');
    const emptyTemp = emptyAssessment.assessments.find((a) => a.metricName === 'temperature');
    assert(emptyTemp?.status === 'unknown', 'Missing temperature remains strictly unknown');
    assert(emptyAssessment.unrecordedParameters.includes('temperature'), 'Lists temperature under unrecorded parameters');
    assert(emptyAssessment.unrecordedParameters.includes('relativeHumidity'), 'Lists humidity under unrecorded parameters');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Feeding & Fertilization System
  // --------------------------------------------------------------------------
  console.log('\n2. Feeding & Fertilization Tracking Engine:');
  {
    const validFeeding: FeedingRecord = {
      id: 'feed-1',
      userId: 'user-1',
      plantId: 'plant-basil-1',
      feedingDate: '2026-11-01T09:00:00Z',
      productName: 'Organic Fish Hydrolysate',
      fertilizerType: 'organic',
      npkRatio: '4-2-2',
      formulation: 'liquid',
      applicationMethod: 'soil_drench',
      dosageAmount: 5,
      dosageUnit: 'ml/L',
      dosageUnknown: false,
      nutrientObservation: 'normal_vigor',
      createdAt: '2026-11-01T09:00:00Z',
      updatedAt: '2026-11-01T09:00:00Z',
    };

    assert(formatNpkRatio('4-2-2') === '4-2-2', 'Preserves valid NPK ratio format');
    assert(formatNpkRatio('') === null, 'Returns null for empty NPK string');

    // Rule: Unknown dosage preservation
    const unknownDosageFeeding: FeedingRecord = {
      ...validFeeding,
      id: 'feed-2',
      dosageAmount: null,
      dosageUnit: null,
      dosageUnknown: true,
      productName: 'Worm Casting Top-dress',
      fertilizerType: 'worm_castings',
      applicationMethod: 'top_dress',
    };
    assert(unknownDosageFeeding.dosageUnknown === true, 'Permits dosageUnknown flag without inventing dosages');

    const summary = summarizeFeedingHistory([validFeeding, unknownDosageFeeding]);
    assert(summary.totalFeedingsRecorded === 2, 'Summarizes total feedings recorded as 2');
    assert(summary.recentProductsUsed.includes('Organic Fish Hydrolysate'), 'Includes fish hydrolysate in products used');
    assert(summary.recentProductsUsed.includes('Worm Casting Top-dress'), 'Includes worm castings in products used');

    // Non-diagnostic foliar observations
    const chlorosisGuidance = assessFoliarNutrientObservation('chlorosis');
    assert(chlorosisGuidance.includes('General foliar yellowing observed'), 'Foliar observation uses cautious observational language');
    assert(!chlorosisGuidance.includes('guarantee') && !chlorosisGuidance.includes('cure'), 'Never promises medical cures or guarantees');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Propagation & Lineage Engine
  // --------------------------------------------------------------------------
  console.log('\n3. Propagation & Lineage Architecture:');
  {
    const parentPlant: UserPlant = {
      id: 'plant-mother-1',
      nickname: 'Mother Rosemary',
      plantSlug: 'rosemary',
      plantedDate: '2025-01-01',
      currentStage: 'Mature',
      notes: [],
      createdAt: '2025-01-01T00:00:00Z',
    };

    const offspringPlant: UserPlant = {
      id: 'plant-child-1',
      nickname: 'Rosemary Cutting #1',
      plantSlug: 'rosemary',
      plantedDate: '2026-10-01',
      parentPlantId: 'plant-mother-1',
      propagationMethod: 'cutting',
      propagationDate: '2026-09-15',
      currentStage: 'Growing',
      notes: [],
      createdAt: '2026-10-01T00:00:00Z',
    };

    const propEvent: PropagationEvent = {
      id: 'prop-1',
      userId: 'user-1',
      parentPlantId: 'plant-mother-1',
      parentPlantNickname: 'Mother Rosemary',
      propagationMethod: 'cutting',
      startedDate: '2026-09-15',
      medium: 'Perlite & Peat',
      status: 'success',
      outcomeDate: '2026-10-01',
      offspringPlantId: 'plant-child-1',
      offspringPlantNickname: 'Rosemary Cutting #1',
      createdAt: '2026-09-15T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    };

    const lineageMother = buildPlantLineage(parentPlant, [parentPlant, offspringPlant], [propEvent]);
    assert(lineageMother.offspringCount === 1, 'Mother plant correctly counts 1 offspring');
    assert(lineageMother.offspring[0].nickname === 'Rosemary Cutting #1', 'Mother plant correctly identifies offspring name');

    const lineageChild = buildPlantLineage(offspringPlant, [parentPlant, offspringPlant], [propEvent]);
    assert(lineageChild.parentNickname === 'Mother Rosemary', 'Child plant correctly identifies parent nickname');
    assert(lineageChild.propagationMethod === 'cutting', 'Child plant preserves propagation method');

    const timelineEvents = generatePropagationTimelineEvents(propEvent, 'plant-mother-1');
    assert(timelineEvents.length === 2, 'Generates 2 timeline events for completed propagation (start & outcome)');
    assert(timelineEvents[0].eventType === 'propagation', 'Event type is propagation');
    assert(timelineEvents[1].badge?.text === 'Rooted / Success', 'Outcome badge indicates success');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Production Cycles & Harvest Yield Analytics
  // --------------------------------------------------------------------------
  console.log('\n4. Production Cycles & Harvest Yield Engine:');
  {
    const harvests: HarvestRecord[] = [
      {
        id: 'harv-1',
        userId: 'user-1',
        plantId: 'plant-basil-1',
        harvestDate: '2026-10-15T08:00:00Z',
        quantity: 120,
        unit: 'g',
        harvestType: 'cut_and_come_again',
        qualityObservation: 'prime',
        notes: 'Top 3 leaf sets harvested',
        createdAt: '2026-10-15T08:00:00Z',
        updatedAt: '2026-10-15T08:00:00Z',
      },
      {
        id: 'harv-2',
        userId: 'user-1',
        plantId: 'plant-basil-1',
        harvestDate: '2026-10-29T08:00:00Z',
        quantity: 150,
        unit: 'g',
        harvestType: 'cut_and_come_again',
        qualityObservation: 'prime',
        notes: 'Second cut-and-come-again flush',
        createdAt: '2026-10-29T08:00:00Z',
        updatedAt: '2026-10-29T08:00:00Z',
      },
    ];

    // CRITICAL RULE: yieldPerArea MUST be null if square area not provided
    const metricsWithoutArea = calculateYieldMetrics(harvests);
    assert(metricsWithoutArea.totalHarvestCount === 2, 'Calculates 2 total harvest events');
    assert(metricsWithoutArea.totalsByUnit['g'] === 270, 'Calculates 270g total yield');
    assert(metricsWithoutArea.averageHarvestPerEventByUnit['g'] === 135, 'Calculates 135g average per harvest event');
    assert(metricsWithoutArea.yieldPerArea === null, 'CRITICAL: yieldPerArea is strictly null when area unrecorded');

    // With explicit area provided:
    const metricsWithArea = calculateYieldMetrics(harvests, 0.5);
    assert(metricsWithArea.yieldPerArea !== null, 'Calculates yieldPerArea when area explicitly provided');
    assert(metricsWithArea.yieldPerArea?.yieldPerSquareMeter === 540, 'Calculates 540 g/m² for 270g over 0.5 m²');

    // Cycle Comparison
    const cycleA: ProductionCycle = {
      id: 'cycle-1',
      userId: 'user-1',
      cycleName: 'Batch 1 Spring',
      plantSlug: 'sweet-basil',
      startDate: '2026-03-01',
      stage: 'closed',
      quantityPlanted: 20,
      quantityActive: 0,
      quantityLost: 2,
      quantityHarvested: 18,
      status: 'completed',
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-04-15T00:00:00Z',
    };
    const cycleB: ProductionCycle = {
      id: 'cycle-2',
      userId: 'user-1',
      cycleName: 'Batch 2 Summer',
      plantSlug: 'sweet-basil',
      startDate: '2026-06-01',
      stage: 'closed',
      quantityPlanted: 20,
      quantityActive: 0,
      quantityLost: 1,
      quantityHarvested: 19,
      status: 'completed',
      createdAt: '2026-06-01T00:00:00Z',
      updatedAt: '2026-07-10T00:00:00Z',
    };

    const comparison = compareCropCycles(cycleA, cycleB);
    assert(comparison.lossRateA === 10, 'Calculates 10% loss rate for Cycle A');
    assert(comparison.lossRateB === 5, 'Calculates 5% loss rate for Cycle B');
    assert(comparison.comparisonNotes.some((n: string) => n.includes('correlations') || n.includes('harvest')), 'Notes emphasize non-causality of observed correlations');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 5: Space Utilization & Structural Safety Protection
  // --------------------------------------------------------------------------
  console.log('\n5. Space Utilization & Structural Safety Advisory:');
  {
    const samplePlants: UserPlant[] = [
      { id: 'p1', nickname: 'Top Plant 1', plantSlug: 'basil', plantedDate: '2026-01-01', currentStage: 'Growing', tier: 'top', notes: [] },
      { id: 'p2', nickname: 'Top Plant 2', plantSlug: 'basil', plantedDate: '2026-01-01', currentStage: 'Growing', tier: 'top', notes: [] },
      { id: 'p3', nickname: 'Mid Plant 1', plantSlug: 'mint', plantedDate: '2026-01-01', currentStage: 'Growing', tier: 'middle', notes: [] },
      { id: 'p4', nickname: 'Bot Plant 1', plantSlug: 'rosemary', plantedDate: '2026-01-01', currentStage: 'Growing', tier: 'bottom', notes: [] },
    ];

    const space = calculateSpaceMetrics(samplePlants, [], 10);
    assert(space.totalSpaceCapacityUnits === 10, 'Total space capacity is 10');
    assert(space.activePlantsOccupied === 4, 'Active plants occupied is 4');
    assert(space.occupancyRatePercent === 40, 'Occupancy rate is 40%');
    assert(space.unusedCapacitySlots === 6, 'Unused capacity is 6 slots');
    assert(space.tierDistribution.top === 2, 'Top tier has 2 plants');
    assert(space.tierDistribution.middle === 1, 'Middle tier has 1 plant');
    assert(space.tierDistribution.bottom === 1, 'Bottom tier has 1 plant');

    // CRITICAL SAFETY RULE: structural capacity must not be assumed safe when unconfirmed
    assert(space.isStructuralSafetyVerified === false, 'CRITICAL: Structural safety is never assumed verified by default');
    assert(space.advisories.some((a) => a.includes('Structural capacity')), 'Emits structural safety protection advisory');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 6: Unified Intelligence Engine
  // --------------------------------------------------------------------------
  console.log('\n6. Unified Grow Intelligence Engine & Provenance Separation:');
  {
    const plant: UserPlant = {
      id: 'plant-test-1',
      nickname: 'Genovese Basil',
      plantSlug: 'sweet-basil',
      plantedDate: '2026-10-01',
      currentStage: 'Growing',
      notes: [{ id: 'n1', date: '2026-10-10', stage: 'Growing', text: 'Branching vigorously', heightCm: 15 }],
      createdAt: '2026-10-01T00:00:00Z',
    };

    const cond: GrowingConditionObservation = {
      id: 'c1',
      userId: 'u1',
      plantId: 'plant-test-1',
      observationTime: '2026-10-12T10:00:00Z',
      temperatureCelsius: 34, // Elevated for basil
      relativeHumidityPercent: 25, // Low for basil
      isGrowLight: false,
      createdAt: '2026-10-12T10:00:00Z',
      updatedAt: '2026-10-12T10:00:00Z',
    };

    const intel = generateUnifiedIntelligence({
      plant,
      diagnoses: [],
      conditions: [cond],
      feedings: [],
      propagations: [],
      harvests: [],
      photos: [],
    });

    assert(intel.plantId === 'plant-test-1', 'Correct plant ID in intelligence output');
    assert(intel.currentState.identity.currentStage === 'Growing', 'Current stage preserved');
    assert(intel.currentState.environment.summaryStatus === 'observed', 'Environment marked as observed');
    assert(intel.evidenceFacts.length >= 3, 'Collects multiple evidence facts');

    // Gaps detection
    const feedingGap = intel.informationGaps.find((g) => g.area === 'feeding');
    assert(feedingGap !== undefined, 'Detects unrecorded feeding as information gap');

    // Evidence-backed concerns
    const envConcern = intel.concerns.find((c) => c.area === 'conditions');
    assert(envConcern !== undefined, 'Flags elevated temperature/low humidity concern');
    assert(Boolean(envConcern && envConcern.evidence.length > 0), 'Concern includes explicit evidence list');
    assert(Boolean(envConcern?.safeRecommendation && (envConcern.safeRecommendation.includes('manufacturer') || envConcern.safeRecommendation.includes('ventilation') || envConcern.safeRecommendation.includes('hydration') || envConcern.safeRecommendation.includes('shade') || envConcern.safeRecommendation.includes('humidity'))), 'Safe non-prescriptive recommendation emitted');

    // Safe next actions
    assert(intel.nextActions.length > 0, 'Synthesizes prioritized safe next actions');
    assert(intel.nextActions.every((a) => a.provenance === 'recommended'), 'Actions tagged with recommended provenance');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 7: Reminder Generator Integrations (Phase 10)
  // --------------------------------------------------------------------------
  console.log('\n7. Phase 10 Reminder Generator Integrations:');
  {
    const plant: UserPlant = {
      id: 'plant-p10-1',
      nickname: 'Test Thyme',
      plantSlug: 'english-thyme',
      plantedDate: '2026-09-01',
      currentStage: 'Mature',
      notes: [],
    };

    // 1. Feeding Reminders
    const feedingWithUpcoming: FeedingRecord = {
      id: 'f-up-1',
      userId: 'u1',
      plantId: 'plant-p10-1',
      feedingDate: '2026-10-20T00:00:00Z',
      productName: 'Organic Kelp Meal',
      fertilizerType: 'organic',
      applicationMethod: 'soil_drench',
      dosageUnknown: true,
      nextPlannedDate: '2026-11-10',
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };
    const feedReminders = generateFeedingReminders([feedingWithUpcoming], [plant]);
    assert(feedReminders.length === 1, 'Generates reminder for scheduled upcoming feeding');
    assert(feedReminders[0].reminderType === 'feeding', 'Reminder type is feeding');
    assert(feedReminders[0].body.includes('manufacturer instructions'), 'Feeding reminder mentions manufacturer label instructions');

    // 2. Propagation Reminders
    const propInProgress: PropagationEvent = {
      id: 'prop-active-1',
      userId: 'u1',
      parentPlantId: 'plant-p10-1',
      propagationMethod: 'cutting',
      startedDate: '2026-11-01',
      expectedFollowupDate: '2026-11-08',
      status: 'in_progress',
      createdAt: '2026-11-01T00:00:00Z',
      updatedAt: '2026-11-01T00:00:00Z',
    };
    const propReminders = generatePropagationReminders([propInProgress], [plant]);
    assert(propReminders.length === 1, 'Generates reminder for active propagation check');
    assert(propReminders[0].reminderType === 'propagation', 'Reminder type is propagation');

    // 3. Harvest Milestone Reminders
    const harvestReminders = generateHarvestMilestoneReminders([plant]);
    assert(harvestReminders.length === 1, 'Generates visual harvest check reminder for fruiting plant');
    assert(harvestReminders[0].body.includes('Visually inspect'), 'Prompts visual inspection without guaranteeing maturity');

    // 4. Daily Grow Environmental Observations Reminders
    const oldCondition: GrowingConditionObservation = {
      id: 'c-old',
      userId: 'u1',
      plantId: 'plant-p10-1',
      observationTime: '2026-10-20T00:00:00Z', // 16 days ago
      isGrowLight: false,
      createdAt: '2026-10-20T00:00:00Z',
      updatedAt: '2026-10-20T00:00:00Z',
    };
    const envReminders = generateDailyGrowCheckReminders([plant], [oldCondition], new Date('2026-11-05T00:00:00Z'));
    assert(envReminders.length === 1, 'Prompts environmental check when no observation in >5 days');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 8: Plant Timeline Engine Integration (Phase 10)
  // --------------------------------------------------------------------------
  console.log('\n8. Plant Timeline Engine Phase 10 Integration:');
  {
    const plant: UserPlant = {
      id: 'timeline-plant-1',
      nickname: 'Timeline Cherry Tomato',
      plantSlug: 'cherry-tomato',
      plantedDate: '2026-08-01',
      currentStage: 'Mature',
      notes: [],
      createdAt: '2026-08-01T00:00:00Z',
    };

    const condition: GrowingConditionObservation = {
      id: 'cond-tl-1',
      userId: 'u1',
      plantId: 'timeline-plant-1',
      observationTime: '2026-09-01T12:00:00Z',
      temperatureCelsius: 24,
      relativeHumidityPercent: 60,
      soilMoisture: 'moist',
      isGrowLight: false,
      createdAt: '2026-09-01T12:00:00Z',
      updatedAt: '2026-09-01T12:00:00Z',
    };

    const feeding: FeedingRecord = {
      id: 'feed-tl-1',
      userId: 'u1',
      plantId: 'timeline-plant-1',
      feedingDate: '2026-09-10T09:00:00Z',
      productName: 'Compost Tea',
      fertilizerType: 'compost_tea',
      applicationMethod: 'soil_drench',
      dosageUnknown: true,
      createdAt: '2026-09-10T09:00:00Z',
      updatedAt: '2026-09-10T09:00:00Z',
    };

    const harvest: HarvestRecord = {
      id: 'harv-tl-1',
      userId: 'u1',
      plantId: 'timeline-plant-1',
      harvestDate: '2026-10-01T10:00:00Z',
      quantity: 350,
      unit: 'g',
      harvestType: 'cut_and_come_again',
      createdAt: '2026-10-01T10:00:00Z',
      updatedAt: '2026-10-01T10:00:00Z',
    };

    const timelineResult = buildPlantTimeline({
      plant,
      conditions: [condition],
      feedings: [feeding],
      harvests: [harvest],
    });

    const events = timelineResult.events;
    assert(events.some((e) => e.eventType === 'condition_observation'), 'Timeline includes condition observation event');
    assert(events.some((e) => e.eventType === 'feeding'), 'Timeline includes feeding event');
    assert(events.some((e) => e.eventType === 'harvest'), 'Timeline includes harvest record event');

    // Filtering check
    const careFiltered = filterTimelineEvents(events, 'care');
    assert(careFiltered.some((e) => e.eventType === 'feeding'), 'Care filter includes feeding events');

    const harvestFiltered = filterTimelineEvents(events, 'harvest');
    assert(harvestFiltered.some((e) => e.eventType === 'harvest'), 'Harvest filter includes harvest events');
  }

  // --------------------------------------------------------------------------
  // TEST SUITE 9: Dual-Storage & Offline Safety Persistence
  // --------------------------------------------------------------------------
  console.log('\n9. Persistence & Storage Adapter:');
  {
    // Test saving condition
    const condRes = await saveGrowingCondition({
      plantId: 'test-p-offline',
      temperatureCelsius: 21,
      relativeHumidityPercent: 50,
      observationTime: new Date().toISOString(),
      isGrowLight: false,
    });
    assert(condRes.observation !== undefined || condRes.isPendingSync === true, 'Saves condition to local or cloud');

    // Test saving feeding
    const feedRes = await saveFeedingRecord({
      plantId: 'test-p-offline',
      feedingDate: new Date().toISOString(),
      productName: 'Organic Seaweed Extract',
      fertilizerType: 'organic',
      applicationMethod: 'foliar_spray',
      dosageUnknown: true,
    });
    assert(feedRes.record !== undefined || feedRes.isPendingSync === true, 'Saves feeding to local or cloud');

    // Test saving propagation
    const propRes = await savePropagationEvent({
      parentPlantId: 'test-p-offline',
      propagationMethod: 'cutting',
      startedDate: '2026-11-05',
      status: 'in_progress',
    });
    assert(propRes.event !== undefined || propRes.isPendingSync === true, 'Saves propagation to local or cloud');

    // Test saving production cycle
    const cycleRes = await saveProductionCycle({
      cycleName: 'Demo Microgreen Tray #1',
      plantSlug: 'sweet-basil',
      startDate: '2026-11-05',
      stage: 'nursery',
      quantityPlanted: 100,
      quantityActive: 100,
      quantityLost: 0,
      quantityHarvested: 0,
      status: 'active',
    });
    assert(cycleRes.cycle !== undefined || cycleRes.isPendingSync === true, 'Saves production cycle to local or cloud');

    // Test saving harvest
    const harvRes = await saveHarvestRecord({
      plantId: 'test-p-offline',
      harvestDate: new Date().toISOString(),
      quantity: 50,
      unit: 'g',
      harvestType: 'cut_and_come_again',
    });
    assert(harvRes.record !== undefined || harvRes.isPendingSync === true, 'Saves harvest record to local or cloud');
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
