/**
 * GrowAI Phase 10: Unified Grow Intelligence Engine
 * The central intelligence layer aggregating Plant, Conditions, Care, Feeding,
 * Health, Growth, Propagation, Production, Harvest, Yield, and Space.
 *
 * Adheres strictly to Section 19, 20, 21, 22:
 * - Provenance separation: recorded, calculated, observed, inferred, recommended, unknown.
 * - Confidence rating: high, moderate, low, unknown.
 * - AI Doctor safety: Hypothesis language only, never diagnoses illness or overrides AI Doctor.
 * - Unknowns remain unknown; never invents botanical requirements or maturity predictions.
 */

import { UserPlant, PlantPhoto } from '@/types/garden';
import { Plant } from '@/types/plant';
import { SavedDiagnosisRecord, PlantHealthStatus } from '@/types/diagnosis';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';
import { calculatePlantAgeFromPlanting } from '@/lib/plant-timeline';
import { Reminder } from '@/types/reminder';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  UnifiedGrowIntelligence,
  PlantCurrentStateSummary,
  IntelligenceGap,
  IntelligenceConcern,
  IntelligenceOpportunity,
  IntelligenceAction,
} from '@/types/grow-intelligence';
import { summarizeGrowingConditions } from './conditions-engine';
import { summarizeFeedingHistory } from './feeding-engine';
import { calculateYieldMetrics } from './production-engine';

export interface UnifiedIntelligenceInput {
  plant: UserPlant;
  botanicalPlant?: Plant | null;
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagationEvents?: PropagationEvent[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  diagnoses?: SavedDiagnosisRecord[];
  reminders?: Reminder[];
  photos?: PlantPhoto[];
  referenceDate?: Date | string;
}

/**
 * Generates the unified grow intelligence assessment for a plant.
 */
export function generateUnifiedGrowIntelligence(
  input: UnifiedIntelligenceInput
): UnifiedGrowIntelligence {
  const {
    plant,
    botanicalPlant,
    conditions = [],
    feedings = [],
    propagationEvents = input.propagations || [],
    cycles = [],
    harvests = [],
    diagnoses = [],
    reminders = [],
    photos = [],
    referenceDate,
  } = input;

  const now = referenceDate
    ? new Date(referenceDate)
    : typeof window !== 'undefined'
      ? new Date()
      : new Date('2026-11-05T00:00:00.000Z');
  const plantConditions = conditions.filter((c) => !c.plantId || c.plantId === plant.id);
  const plantFeedings = feedings.filter((f) => !f.plantId || f.plantId === plant.id);
  const plantHarvests = harvests.filter((h) => h.plantId === plant.id);
  const plantDiagnoses = diagnoses.filter((d) => d.userPlantId === plant.id);

  // 1. Current State Calculations
  const ageInfo = calculatePlantAgeFromPlanting(plant.plantedDate, now);
  const healthStatus: PlantHealthStatus = derivePlantHealthStatus(plantDiagnoses);
  const latestDiagnosis = plantDiagnoses.length > 0
    ? [...plantDiagnoses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    : null;

  const conditionsSummary = summarizeGrowingConditions(plantConditions, botanicalPlant);
  const feedingSummary = summarizeFeedingHistory(plantFeedings);
  const yieldMetrics = calculateYieldMetrics(plantHarvests);

  // Active production cycles referencing this plant or species
  const hasActiveCycle = cycles.some(
    (c) => c.status === 'active' && (c.plantSlug === plant.plantSlug || c.linkedPlantIds?.includes(plant.id))
  );

  const currentState: PlantCurrentStateSummary = {
    identity: {
      plantId: plant.id,
      nickname: plant.nickname,
      plantSlug: plant.plantSlug,
      plantedDate: plant.plantedDate || 'Unrecorded',
      ageDisplay: ageInfo.ageDisplay,
      currentStage: plant.currentStage,
    },
    health: {
      status: healthStatus,
      lastDiagnosisSummary: latestDiagnosis
        ? latestDiagnosis.candidates?.[0]?.conditionName || latestDiagnosis.overallHealth.replace(/_/g, ' ')
        : null,
      isAiHypothesis: Boolean(latestDiagnosis),
    },
    growth: {
      totalNotes: plant.notes ? plant.notes.length : 0,
      lastNoteDate: plant.notes && plant.notes.length > 0
        ? [...plant.notes].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
        : null,
      photoCount: photos ? photos.length : 0,
    },
    environment: {
      lastObserved: conditionsSummary.latestObservation?.observationTime || null,
      summaryStatus: conditionsSummary.latestObservation ? 'observed' : 'unrecorded',
    },
    feeding: {
      lastFed: feedingSummary.lastFeeding?.feedingDate || null,
      totalFeedings: feedingSummary.totalFeedingsRecorded,
      scheduledNext: feedingSummary.nextPlannedDate,
    },
    production: {
      totalHarvestCount: yieldMetrics.totalHarvestCount,
      totalYieldByUnit: yieldMetrics.totalsByUnit,
      hasActiveCycle,
    },
  };

  // 2. Evidence Facts (strict provenance tagging)
  const evidenceFacts: string[] = [];

  if (plant.plantedDate) {
    evidenceFacts.push(
      `[Recorded] Planting date recorded as ${plant.plantedDate} (${ageInfo.daysSincePlanting !== null ? `${ageInfo.daysSincePlanting} days elapsed` : 'elapsed days unknown'}).`
    );
  } else {
    evidenceFacts.push('[Unknown] Planting date has not been recorded.');
  }

  evidenceFacts.push(`[Recorded] Current growth stage recorded as "${plant.currentStage}".`);

  if (conditionsSummary.latestObservation) {
    const obs = conditionsSummary.latestObservation;
    const parts: string[] = [];
    if (obs.temperatureCelsius !== null && obs.temperatureCelsius !== undefined) parts.push(`temp: ${obs.temperatureCelsius}°C`);
    if (obs.relativeHumidityPercent !== null && obs.relativeHumidityPercent !== undefined) parts.push(`humidity: ${obs.relativeHumidityPercent}%`);
    if (obs.lightLevel) parts.push(`light: ${obs.lightLevel}`);
    if (obs.soilMoisture) parts.push(`soil: ${obs.soilMoisture}`);
    evidenceFacts.push(`[Observed] Environmental conditions recorded on ${new Date(obs.observationTime).toLocaleDateString()}: ${parts.join(', ')}.`);
  } else {
    evidenceFacts.push('[Unknown] No growing condition observations recorded.');
  }

  if (feedingSummary.totalFeedingsRecorded > 0) {
    evidenceFacts.push(
      `[Recorded] ${feedingSummary.totalFeedingsRecorded} feeding application${feedingSummary.totalFeedingsRecorded > 1 ? 's' : ''} logged. Most recent product: "${feedingSummary.lastFeeding?.productName}".`
    );
  } else {
    evidenceFacts.push('[Unknown] No fertilization or feeding applications recorded.');
  }

  if (yieldMetrics.totalHarvestCount > 0) {
    const yieldParts = Object.entries(yieldMetrics.totalsByUnit).map(([unit, total]) => `${total} ${unit}`).join(', ');
    evidenceFacts.push(
      `[Calculated] ${yieldMetrics.totalHarvestCount} harvest event${yieldMetrics.totalHarvestCount > 1 ? 's' : ''} recorded totaling ${yieldParts}.`
    );
  }

  // 3. Information Gaps
  const informationGaps: IntelligenceGap[] = [];

  if (!plant.plantedDate) {
    informationGaps.push({
      area: 'growth',
      description: 'Planting date is unrecorded. Plant age cannot be calculated.',
      importance: 'recommended',
      actionableCheck: 'Record planting date in plant details if known.',
    });
  }

  if (conditionsSummary.unrecordedParameters.length > 0) {
    informationGaps.push({
      area: 'conditions',
      description: `Unrecorded environmental parameters: ${conditionsSummary.unrecordedParameters.join(', ')}.`,
      importance: 'recommended',
      actionableCheck: 'Log an environmental observation to record ambient temperature, light, and humidity.',
    });
  }

  if (feedings.length === 0) {
    informationGaps.push({
      area: 'feeding',
      description: 'No feeding or substrate fertilization events have been recorded.',
      importance: 'optional',
      actionableCheck: 'Log feedings when fertilizers, compost teas, or organic nutrients are applied.',
    });
  }

  if (!plant.tier) {
    informationGaps.push({
      area: 'conditions',
      description: 'Vertical garden tier assignment is unrecorded for this plant.',
      importance: 'optional',
      actionableCheck: 'Assign plant to top, middle, or bottom tier in plant settings.',
    });
  }

  // 4. Evidence-Backed Concerns
  const concerns: IntelligenceConcern[] = [];

  // Health concern from AI Doctor
  if (healthStatus === 'needs_attention' || healthStatus === 'monitoring') {
    concerns.push({
      area: 'health',
      severity: healthStatus === 'needs_attention' ? 'high' : 'moderate',
      provenance: 'inferred',
      title: 'Active Health Monitoring Observation',
      evidence: [
        `Health status evaluates to ${healthStatus.replace(/_/g, ' ')}.`,
        latestDiagnosis?.candidates?.[0]
          ? `Recent AI hypothesis noted possible ${latestDiagnosis.candidates[0].conditionName}.`
          : 'Observed foliar symptoms recorded in diagnosis history.',
      ],
      safeRecommendation: 'Inspect leaf undersides and review recent moisture without applying ungrounded chemical sprays.',
    });
  }

  // Substrate moisture concern
  if (conditionsSummary.latestObservation?.soilMoisture === 'waterlogged') {
    concerns.push({
      area: 'conditions',
      severity: 'high',
      provenance: 'observed',
      title: 'Waterlogged Substrate Observed',
      evidence: [
        'Latest soil moisture observation recorded as "waterlogged".',
        'Excess moisture in root zone impedes oxygen delivery to roots.',
      ],
      safeRecommendation: 'Verify container bottom drainage holes and withhold additional irrigation until topsoil dries.',
    });
  }

  // Temperature & humidity condition concerns
  const tempAssess = conditionsSummary.assessments.find((a) => a.metricName === 'temperature');
  if (tempAssess && (tempAssess.status === 'possibly_high' || tempAssess.status === 'possibly_low')) {
    concerns.push({
      area: 'conditions',
      severity: 'moderate',
      provenance: 'observed',
      title: tempAssess.status === 'possibly_high' ? 'Elevated Ambient Temperature' : 'Low Ambient Temperature',
      evidence: [
        `Observed temperature: ${tempAssess.observedValue}°C.`,
        tempAssess.explanation,
      ],
      safeRecommendation: tempAssess.status === 'possibly_high'
        ? 'Provide shade or improve ventilation; verify container root zone hydration.'
        : 'Protect plant from drafts and monitor minimum night temperature.',
    });
  }

  const humAssess = conditionsSummary.assessments.find((a) => a.metricName === 'humidity');
  if (humAssess && (humAssess.status === 'possibly_high' || humAssess.status === 'possibly_low')) {
    concerns.push({
      area: 'conditions',
      severity: 'low',
      provenance: 'observed',
      title: humAssess.status === 'possibly_low' ? 'Low Ambient Humidity' : 'High Ambient Humidity',
      evidence: [
        `Observed relative humidity: ${humAssess.observedValue}%.`,
        humAssess.explanation,
      ],
      safeRecommendation: humAssess.status === 'possibly_low'
        ? 'Monitor substrate hydration; group nearby container plants to conserve ambient humidity.'
        : 'Ensure adequate air circulation between foliage to reduce fungal pressure.',
    });
  }

  // Nutrient foliar observation concern
  if (feedingSummary.lastFeeding?.nutrientObservation && feedingSummary.lastFeeding.nutrientObservation !== 'normal_vigor') {
    concerns.push({
      area: 'feeding',
      severity: 'moderate',
      provenance: 'observed',
      title: 'Foliar Nutrient Observation Recorded',
      evidence: [
        `Grower recorded foliar observation: "${feedingSummary.lastFeeding.nutrientObservation.replace(/_/g, ' ')}".`,
      ],
      safeRecommendation: 'Check substrate moisture and root zone aeration before altering nutrient concentrations.',
    });
  }

  // 5. Opportunities
  const opportunities: IntelligenceOpportunity[] = [];

  if (plant.currentStage === 'Growing' || plant.currentStage === 'Mature') {
    const hasProps = propagationEvents.some((e) => e.parentPlantId === plant.id);
    if (!hasProps) {
      opportunities.push({
        title: 'Propagation Opportunity',
        description: 'Plant is in active vegetative/mature growth. Clean healthy stems or offshoots may be suitable for vegetative propagation.',
        evidence: `Plant stage is recorded as "${plant.currentStage}".`,
        safeNextStep: 'Check whether plant has vigorous non-flowering shoots suitable for cuttings or division.',
      });
    }
  }

  if (plant.currentStage === 'Mature' && plantHarvests.length === 0) {
    opportunities.push({
      title: 'Harvest Logging Opportunity',
      description: 'Plant is recorded as mature. Record harvest events to track ongoing yields and cut-and-come-again output.',
      evidence: 'Plant has reached Mature stage with 0 harvest entries logged.',
      safeNextStep: 'Log partial or full harvests when foliage or fruit is picked.',
    });
  }

  // 6. Next Concrete Actions
  const nextActions: IntelligenceAction[] = [];

  if (concerns.length > 0) {
    const topConcern = concerns[0];
    nextActions.push({
      id: `action-concern-${topConcern.area}`,
      actionTitle: `Address: ${topConcern.title}`,
      reason: topConcern.safeRecommendation,
      provenance: 'recommended',
      category: topConcern.area === 'health' ? 'check_health' : 'observe',
      urgency: topConcern.severity === 'high' ? 'high' : 'normal',
    });
  }

  if (conditionsSummary.totalObservations === 0) {
    nextActions.push({
      id: 'action-log-env',
      actionTitle: `Log environment check for ${plant.nickname}`,
      reason: 'No environmental observations have been logged for this plant.',
      provenance: 'recommended',
      category: 'observe',
      urgency: 'normal',
    });
  }

  if (healthStatus === 'needs_attention') {
    nextActions.push({
      id: 'action-health-recheck',
      actionTitle: `Review foliar health for ${plant.nickname}`,
      reason: 'Active health assessment requires observational follow-up.',
      provenance: 'recommended',
      category: 'check_health',
      urgency: 'high',
    });
  }

  if (feedingSummary.nextPlannedDate && new Date(feedingSummary.nextPlannedDate).getTime() <= now.getTime()) {
    nextActions.push({
      id: 'action-feeding-due',
      actionTitle: `Scheduled feeding check for ${plant.nickname}`,
      reason: `Feeding was scheduled for ${feedingSummary.nextPlannedDate}.`,
      provenance: 'recorded',
      category: 'feed',
      urgency: 'normal',
    });
  }

  return {
    plantId: plant.id,
    plantNickname: plant.nickname,
    currentState,
    evidenceFacts,
    informationGaps,
    concerns,
    opportunities,
    nextActions,
    generatedAt: now.toISOString(),
  };
}

export const generateUnifiedIntelligence = generateUnifiedGrowIntelligence;
