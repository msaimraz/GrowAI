/**
 * GrowAI Phase 11: Deterministic Garden State Engine
 * Synthesizes all recorded garden facts into a unified, strongly typed GardenState.
 *
 * Core Principles:
 * - Deterministic, no invented values.
 * - Missing values are counted as unknown or unrecorded, never assumed.
 * - Strict provenance and temporal isolation.
 */

import { AdaptiveGardenInput, GardenState } from '@/types/adaptive-grow';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';
import { getDataCompletenessScore } from './data-quality';

export function synthesizeGardenState(input: AdaptiveGardenInput): GardenState {
  const {
    plants = [],
    conditions = [],
    feedings = [],
    propagations = [],
    cycles = [],
    harvests = [],
    diagnoses = [],
    reminders = [],
    referenceDate,
  } = input;

  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');

  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split('T')[0];

  // 1. Plants Health & Stage Distribution
  const activePlants = plants.filter((p) => p.currentStage !== 'Harvested');
  let needsAttention = 0;
  let monitoring = 0;
  let improving = 0;
  let healthy = 0;
  let unknownHealth = 0;

  for (const plant of plants) {
    const plantDiags = diagnoses.filter((d) => d.userPlantId === plant.id);
    const health = derivePlantHealthStatus(plantDiags);
    switch (health) {
      case 'needs_attention':
        needsAttention += 1;
        break;
      case 'monitoring':
        monitoring += 1;
        break;
      case 'improving':
        improving += 1;
        break;
      case 'healthy':
        healthy += 1;
        break;
      case 'unknown':
      default:
        unknownHealth += 1;
        break;
    }
  }

  // 2. Care Task & Reminder Rollup
  const activeReminders = reminders.filter(
    (r) => r.status === 'scheduled' || r.status === 'due' || r.status === 'overdue'
  );
  const overdueCare = activeReminders.filter((r) => r.status === 'overdue').length;
  const dueTodayCare = activeReminders.filter((r) => r.status === 'due').length;
  const upcomingCare = activeReminders.filter((r) => r.status === 'scheduled').length;

  // 3. Health Concerns & Follow-up State
  let unresolvedFollowUps = 0;
  for (const d of diagnoses) {
    const hasIssue =
      d.primaryClassification === 'biotic' ||
      d.overallHealth === 'severe_issue' ||
      d.overallHealth === 'moderate_issue';
    if (hasIssue) {
      const followUps = d.followUps || [];
      const latestOutcome = followUps.length > 0 ? followUps[followUps.length - 1].outcomeStatus : null;
      if (latestOutcome !== 'resolved') {
        unresolvedFollowUps += 1;
      }
    }
  }

  const recentAssessments = diagnoses.filter(
    (d) => new Date(d.createdAt).getTime() >= fourteenDaysAgo.getTime()
  ).length;

  // 4. Environmental Observation & Coverage
  let recordedParameters = 0;
  let unknownParameters = 0;
  let envConcerns = 0;

  for (const c of conditions) {
    if (c.temperatureCelsius !== undefined && c.temperatureCelsius !== null) recordedParameters += 1;
    else unknownParameters += 1;

    if (c.relativeHumidityPercent !== undefined && c.relativeHumidityPercent !== null) recordedParameters += 1;
    else unknownParameters += 1;

    if (c.soilMoisture && c.soilMoisture !== 'unknown') recordedParameters += 1;
    else unknownParameters += 1;

    if (c.lightLevel && c.lightLevel !== 'unknown') recordedParameters += 1;
    else unknownParameters += 1;

    if (c.airflowQuality && c.airflowQuality !== 'unknown') recordedParameters += 1;
    else unknownParameters += 1;

    if (
      c.soilMoisture === 'waterlogged' ||
      c.airflowQuality === 'stagnant' ||
      (c.temperatureCelsius !== undefined && c.temperatureCelsius !== null && (c.temperatureCelsius < 10 || c.temperatureCelsius > 35))
    ) {
      envConcerns += 1;
    }
  }

  // Active plants with no condition observation at all
  const plantIdsWithConditions = new Set(conditions.map((c) => c.plantId).filter(Boolean));
  for (const p of activePlants) {
    if (!plantIdsWithConditions.has(p.id)) {
      unknownParameters += 5; // 5 unobserved parameters per plant without condition logs
    }
  }

  // 5. Feeding Rollup
  const recentFeedings = feedings.filter(
    (f) => new Date(f.feedingDate).getTime() >= fourteenDaysAgo.getTime()
  ).length;

  const incompleteFeedings = feedings.filter(
    (f) => !f.productName || (!f.npkRatio && !f.dosageUnknown)
  ).length;

  // 6. Production Rollup
  const activeCycles = cycles.filter((c) => c.status === 'active').length;
  const upcomingHarvests = activePlants.filter((p) => p.currentStage === 'Mature').length;

  // 7. Growth Observation Rollup
  let plantsWithoutRecentObservation = 0;
  let recentObservations = 0;

  for (const p of activePlants) {
    const recentNotes = (p.notes || []).filter(
      (n) => new Date(n.date).getTime() >= fourteenDaysAgo.getTime()
    );
    recentObservations += recentNotes.length;
    if (recentNotes.length === 0) {
      plantsWithoutRecentObservation += 1;
    }
  }

  // 8. Propagation Rollup
  const activePropagationEvents = propagations.filter(
    (p) => p.status === 'in_progress' || p.status === 'pending_outcome'
  ).length;

  // 9. Data Quality
  const dataQuality = getDataCompletenessScore(input);

  return {
    generatedAt: now.toISOString(),
    plants: {
      total: plants.length,
      active: activePlants.length,
      needsAttention,
      monitoring,
      improving,
      healthy,
      unknown: unknownHealth,
    },
    care: {
      overdue: overdueCare,
      dueToday: dueTodayCare,
      upcoming: upcomingCare,
    },
    health: {
      activeConcerns: needsAttention,
      unresolvedFollowUps,
      recentAssessments,
    },
    environment: {
      recordedParameters,
      unknownParameters,
      concerns: envConcerns,
    },
    feeding: {
      recentApplications: recentFeedings,
      incompleteRecords: incompleteFeedings,
    },
    production: {
      activeCycles,
      upcomingHarvests,
      harvestRecords: harvests.length,
    },
    growth: {
      plantsWithoutRecentObservation,
      recentObservations,
    },
    propagation: {
      activePropagationEvents,
    },
    dataQuality: {
      completenessScore: dataQuality.completenessScore,
      missingCriticalData: dataQuality.missingCriticalData,
    },
  };
}

