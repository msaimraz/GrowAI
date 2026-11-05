/**
 * GrowAI Phase 10: Grow Intelligence Dashboard Aggregator
 * Compiles garden-wide metrics and highlights across all Phase 10 domains.
 *
 * Adheres strictly to Section 27, 39, 41:
 * - Pure deterministic aggregations.
 * - Does not invent data or promise yield increases.
 * - Distinguishes between recorded facts, gaps, and evidence-based alerts.
 */

import { UserPlant } from '@/types/garden';
import { Reminder } from '@/types/reminder';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  GrowIntelligenceDashboardData,
  ProductionSpaceMetrics,
} from '@/types/grow-intelligence';
import { calculateProductionSpaceMetrics } from './space-production-advisory';
import { calculateYieldMetrics } from './production-engine';

export interface DashboardAggregationParams {
  plants: UserPlant[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  diagnoses?: SavedDiagnosisRecord[];
  reminders?: Reminder[];
  space?: ProductionSpaceMetrics;
  referenceDate?: Date | string;
}

export function aggregateGrowIntelligenceDashboardData(
  params: DashboardAggregationParams
): GrowIntelligenceDashboardData {
  const {
    plants = [],
    conditions = [],
    feedings = [],
    propagations = [],
    cycles = [],
    harvests = [],
    diagnoses = [],
    reminders = [],
    space,
    referenceDate,
  } = params;

  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');

  // 1. Garden Overview & Health Counts
  const stageCounts: Record<string, number> = {};
  const healthCounts: Record<string, number> = {
    healthy: 0,
    monitoring: 0,
    needs_attention: 0,
    improving: 0,
    resolved: 0,
    unknown: 0,
  };

  for (const p of plants) {
    stageCounts[p.currentStage] = (stageCounts[p.currentStage] || 0) + 1;

    const plantDiags = diagnoses.filter((d) => d.userPlantId === p.id);
    const health = derivePlantHealthStatus(plantDiags);
    healthCounts[health] = (healthCounts[health] || 0) + 1;
  }

  // 2. Active Reminders & Actions Today
  const activeReminders = reminders.filter(
    (r) => r.status === 'scheduled' || r.status === 'due' || r.status === 'overdue'
  );

  const todayActions = activeReminders.filter(
    (r) => r.status === 'due' || r.status === 'overdue'
  );

  // 3. Growing Conditions Highlights
  const plantIdsWithConditions = new Set(conditions.map((c) => c.plantId).filter(Boolean));
  const activePlants = plants.filter((p) => p.currentStage !== 'Harvested');
  const plantsMissingConditions = activePlants.filter((p) => !plantIdsWithConditions.has(p.id)).length;

  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentlyObserved = conditions.filter(
    (c) => new Date(c.observationTime).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const concernsCount = conditions.filter(
    (c) => c.soilMoisture === 'waterlogged' || c.airflowQuality === 'stagnant'
  ).length;

  // 4. Feeding Highlights
  const recentlyFed = feedings.filter(
    (f) => new Date(f.feedingDate).getTime() >= sevenDaysAgo.getTime()
  ).length;

  const upcomingFeedings = feedings.filter(
    (f) => f.nextPlannedDate && new Date(f.nextPlannedDate).getTime() >= now.getTime()
  ).length;

  // 5. Propagation Highlights
  const activePropagations = propagations.filter(
    (p) => p.status === 'in_progress' || p.status === 'pending_outcome'
  ).length;

  const successfulPropagations = propagations.filter(
    (p) => p.status === 'success'
  ).length;

  // 6. Production Highlights
  const activeCycles = cycles.filter((c) => c.status === 'active').length;
  const yieldMetrics = calculateYieldMetrics(harvests);

  // 7. Space Highlights
  const spaceMetrics = space || calculateProductionSpaceMetrics(plants, cycles);

  return {
    gardenOverview: {
      totalPlants: plants.length,
      stageCounts,
      healthCounts,
    },
    todayActionCount: todayActions.length,
    activeReminders,
    conditionsHighlights: {
      recentlyObservedCount: recentlyObserved,
      plantsMissingConditionsCount: plantsMissingConditions,
      concernsCount,
    },
    feedingHighlights: {
      recentlyFedCount: recentlyFed,
      upcomingFeedingCount: upcomingFeedings,
    },
    propagationHighlights: {
      activeEventsCount: activePropagations,
      successfulEventsCount: successfulPropagations,
    },
    productionHighlights: {
      activeCyclesCount: activeCycles,
      totalHarvestsRecorded: harvests.length,
      totalYieldByUnit: yieldMetrics.totalsByUnit,
    },
    spaceHighlights: spaceMetrics,
  };
}

export const aggregateGrowIntelligenceDashboard = aggregateGrowIntelligenceDashboardData;
