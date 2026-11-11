/**
 * GrowAI Phase 12: Grower Copilot Query Retriever
 * Selectively retrieves only the structured records relevant to the user's intent and plant scope.
 *
 * CRITICAL ARCHITECTURAL BOUNDARY:
 * - Does NOT perform arbitrary SQL queries or dump the entire database into the prompt.
 * - Extracts compact, high-relevance records for prompt grounding.
 * - Converts raw records into explicit, clickable CopilotEvidence items.
 */

import { UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  ProductionSpaceMetrics,
} from '@/types/grow-intelligence';
import { Reminder } from '@/types/reminder';
import { PlantTimelineEvent } from '@/types/timeline';
import { Plant } from '@/types/plant';
import { PLANTS_DATA } from '@/data/plants';
import {
  CopilotIntent,
  CopilotQueryContext,
  CopilotEvidence,
} from '@/types/grower-copilot';
import { synthesizeGardenState } from '@/lib/adaptive-grow/garden-state-engine';
import { prioritizeGardenActions } from '@/lib/adaptive-grow/action-prioritizer';
import { calculateDataQuality } from '@/lib/adaptive-grow/data-quality';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';

export interface RetrieveParams {
  userId: string;
  intent: CopilotIntent;
  targetPlantId?: string | null;
  targetPlantNickname?: string | null;
  activePlantSlug?: string | null;
  botanicalPlant?: Plant | null;
  plants: UserPlant[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  diagnoses?: SavedDiagnosisRecord[];
  reminders?: Reminder[];
  spaceMetrics?: ProductionSpaceMetrics | null;
  growPlans?: any[];
}

export function retrieveCopilotContext(params: RetrieveParams): CopilotQueryContext {
  const {
    userId,
    intent,
    targetPlantId,
    targetPlantNickname,
    activePlantSlug,
    botanicalPlant: passedBotanicalPlant,
    plants = [],
    conditions = [],
    feedings = [],
    propagations = [],
    cycles = [],
    harvests = [],
    diagnoses = [],
    reminders = [],
    spaceMetrics,
    growPlans = [],
  } = params;

  // Filter plants according to target scope
  const targetPlant = targetPlantId ? plants.find((p) => p.id === targetPlantId) : null;
  const relevantPlants = targetPlant
    ? [targetPlant]
    : activePlantSlug
    ? plants.filter((p) => p.plantSlug === activePlantSlug)
    : plants;

  const relevantPlantIds = new Set(relevantPlants.map((p) => p.id));

  // Relevant health diagnoses
  const relevantHealthRecords = targetPlantId
    ? diagnoses.filter((d) => d.userPlantId === targetPlantId)
    : activePlantSlug
    ? diagnoses.filter((d) => !!d.userPlantId && relevantPlantIds.has(d.userPlantId))
    : diagnoses;

  // Relevant conditions
  const relevantConditions = targetPlantId
    ? conditions.filter((c) => !c.plantId || c.plantId === targetPlantId)
    : activePlantSlug
    ? conditions.filter((c) => !c.plantId || (!!c.plantId && relevantPlantIds.has(c.plantId)))
    : conditions;

  // Relevant feedings
  const relevantFeedingRecords = targetPlantId
    ? feedings.filter((f) => !f.plantId || f.plantId === targetPlantId)
    : activePlantSlug
    ? feedings.filter((f) => !f.plantId || (!!f.plantId && relevantPlantIds.has(f.plantId)))
    : feedings;

  // Relevant propagations
  const relevantPropagationEvents = targetPlantId
    ? propagations.filter(
        (p) => p.parentPlantId === targetPlantId || p.offspringPlantId === targetPlantId
      )
    : activePlantSlug
    ? propagations.filter(
        (p) =>
          (!!p.parentPlantId && relevantPlantIds.has(p.parentPlantId)) ||
          (!!p.offspringPlantId && relevantPlantIds.has(p.offspringPlantId))
      )
    : propagations;

  // Relevant production cycles
  const relevantProductionCycles = targetPlant
    ? cycles.filter((c) => c.plantSlug === targetPlant.plantSlug)
    : activePlantSlug
    ? cycles.filter((c) => c.plantSlug === activePlantSlug)
    : cycles;

  // Relevant harvests
  const relevantHarvests = targetPlantId
    ? harvests.filter((h) => h.plantId === targetPlantId)
    : activePlantSlug
    ? harvests.filter((h) => !!h.plantId && relevantPlantIds.has(h.plantId))
    : harvests;

  // Relevant reminders
  const relevantReminders = targetPlantId
    ? reminders.filter((r) => !r.plantId || r.plantId === targetPlantId)
    : activePlantSlug
    ? reminders.filter((r) => r.plantId && relevantPlantIds.has(r.plantId))
    : reminders;

  // Relevant grow plans (Phase 13)
  const relevantGrowPlans = targetPlantId
    ? growPlans.filter(
        (plan) =>
          plan.plantId === targetPlantId ||
          (Array.isArray(plan.plantIds) && plan.plantIds.includes(targetPlantId))
      )
    : growPlans;

  // Adaptive Garden State & Actions
  const gardenState = synthesizeGardenState({
    plants: relevantPlants,
    conditions: relevantConditions,
    feedings: relevantFeedingRecords,
    propagations: relevantPropagationEvents,
    cycles: relevantProductionCycles,
    harvests: relevantHarvests,
    diagnoses: relevantHealthRecords,
    reminders: relevantReminders,
    spaceMetrics,
  });

  const relevantGrowActions = prioritizeGardenActions({
    plants: relevantPlants,
    conditions: relevantConditions,
    feedings: relevantFeedingRecords,
    propagations: relevantPropagationEvents,
    cycles: relevantProductionCycles,
    harvests: relevantHarvests,
    diagnoses: relevantHealthRecords,
    reminders: relevantReminders,
    spaceMetrics,
  });

  const dataQuality = calculateDataQuality({
    plants: relevantPlants,
    conditions: relevantConditions,
    feedings: relevantFeedingRecords,
    propagations: relevantPropagationEvents,
    cycles: relevantProductionCycles,
    harvests: relevantHarvests,
    diagnoses: relevantHealthRecords,
  });

  // Build traceable evidence items
  const evidence: CopilotEvidence[] = [];

  // 1. Plant entity evidence
  for (const p of relevantPlants.slice(0, 5)) {
    evidence.push({
      sourceType: 'user_plant',
      sourceId: p.id,
      plantId: p.id,
      plantNickname: p.nickname,
      field: 'currentStage',
      value: p.currentStage,
      recordedAt: p.plantedDate || undefined,
      provenance: 'recorded',
      description: `${p.nickname} (${p.currentStage} stage, planted ${p.plantedDate || 'unrecorded'})`,
      route: `/app/my-garden?plantId=${p.id}`,
    });
  }

  // 2. Health diagnoses evidence
  for (const d of relevantHealthRecords.slice(-3)) {
    const topCand = d.candidates && d.candidates.length > 0 ? d.candidates[0] : null;
    const p = plants.find((plant) => plant.id === d.userPlantId);
    const healthDesc = d.overallHealth
      ? d.overallHealth.replace('_', ' ')
      : (d as any).primaryDiagnosis || 'attention needed';
    const candName = topCand ? (topCand as any).diseaseName || topCand.conditionName : 'observed symptoms';
    evidence.push({
      sourceType: 'diagnosis_record',
      sourceId: d.id,
      plantId: d.userPlantId || undefined,
      plantNickname: p?.nickname || (d as any).plantName || d.plantIdentification,
      field: 'overallHealth',
      value: d.overallHealth || (d as any).primaryDiagnosis,
      recordedAt: d.createdAt,
      provenance: 'observed',
      description: `${p?.nickname || (d as any).plantName || d.plantIdentification || 'Plant'}: ${healthDesc} (${candName})`,
      route: `/app/ai-doctor/history/${d.id}`,
    });
  }

  // 3. Growing condition evidence
  for (const c of relevantConditions.slice(-3)) {
    const p = plants.find((plant) => plant.id === c.plantId);
    evidence.push({
      sourceType: 'growing_condition',
      sourceId: c.id,
      plantId: c.plantId || undefined,
      plantNickname: p?.nickname,
      recordedAt: c.observationTime || (c as any).observedAt,
      provenance: 'recorded',
      description: `${p?.nickname || 'Garden microclimate'}: ${c.temperatureCelsius ?? (c as any).temperatureC ?? '—'}°C, ${c.relativeHumidityPercent ?? '—'}% RH, soil ${c.soilMoisture || (c as any).soilMoistureLevel || 'unknown'}`,
      route: p ? `/app/my-garden?plantId=${p.id}&tab=conditions` : '/app/grow-intelligence',
    });
  }

  // 4. Feeding evidence
  for (const f of relevantFeedingRecords.slice(-3)) {
    const p = plants.find((plant) => plant.id === f.plantId);
    const method = (f.applicationMethod || 'soil_application').replace('_', ' ');
    evidence.push({
      sourceType: 'feeding_record',
      sourceId: f.id,
      plantId: f.plantId || undefined,
      plantNickname: p?.nickname,
      recordedAt: f.feedingDate || (f as any).fedAt,
      provenance: 'recorded',
      description: `${p?.nickname || 'Garden'}: fed ${f.productName || (f as any).fertilizerName || 'fertilizer'} (${f.npkRatio || 'NPK unrecorded'}) via ${method}`,
      route: p ? `/app/my-garden?plantId=${p.id}&tab=feeding` : '/app/grow-intelligence',
    });
  }

  // 5. Harvest evidence
  for (const h of relevantHarvests.slice(-3)) {
    const p = plants.find((plant) => plant.id === h.plantId);
    evidence.push({
      sourceType: 'harvest_record',
      sourceId: h.id,
      plantId: h.plantId || undefined,
      plantNickname: p?.nickname,
      recordedAt: h.harvestDate,
      provenance: 'recorded',
      description: `Harvested ${h.quantity} ${h.unit} from ${p?.nickname || 'crop batch'} on ${h.harvestDate.split('T')[0]}`,
      route: '/app/grow-intelligence',
    });
  }

  // 6. Reminder evidence
  for (const r of relevantReminders.filter((rem) => rem.status === 'due' || rem.status === 'overdue').slice(0, 3)) {
    evidence.push({
      sourceType: 'reminder',
      sourceId: r.id,
      plantId: r.plantId || undefined,
      plantNickname: r.plantNickname || undefined,
      field: 'status',
      value: r.status,
      recordedAt: r.dueAt,
      provenance: 'recorded',
      description: `${r.status.toUpperCase()}: ${r.title} (due ${r.dueAt.split('T')[0]})`,
      route: r.metadata?.actionUrl || '/app/grow-intelligence',
    });
  }

  // 7. Grow plan evidence (Phase 13)
  for (const plan of relevantGrowPlans.slice(0, 3)) {
    const p = plan.plantId ? plants.find((plant) => plant.id === plan.plantId) : undefined;
    evidence.push({
      sourceType: 'grow_plan',
      sourceId: plan.id,
      plantId: plan.plantId || undefined,
      plantNickname: p?.nickname,
      field: 'status',
      value: plan.status,
      recordedAt: plan.createdAt,
      provenance: 'calculated',
      description: `Plan: ${plan.name} (${plan.status}, ${plan.progress?.taskCompletionPercentage || 0}% complete)`,
      route: `/app/grow-plans/${plan.id}`,
    });
  }

  // 7.5. Botanical catalog facts & user garden linkage (Ask Your Plant)
  const resolvedBotanical: Plant | null =
    passedBotanicalPlant ||
    (activePlantSlug ? PLANTS_DATA.find((p) => p.slug === activePlantSlug) || null : null) ||
    (targetPlant ? PLANTS_DATA.find((p) => p.slug === targetPlant.plantSlug) || null : null) ||
    null;

  if (resolvedBotanical) {
    // Check if user has instances of this plant in their garden
    const userMatches = plants.filter((p) => p.plantSlug === resolvedBotanical.slug);
    if (userMatches.length > 0) {
      const u = userMatches[0];
      evidence.push({
        sourceType: 'user_plant',
        plantId: u.id,
        plantNickname: u.nickname,
        field: 'garden_instance',
        value: u.currentStage,
        recordedAt: u.plantedDate,
        provenance: 'recorded',
        description: `Personal Garden Record: You have "${u.nickname}" in stage "${u.currentStage}", planted on ${u.plantedDate}.`,
        route: `/app/my-garden/${u.id}`,
      });
    } else {
      evidence.push({
        sourceType: 'user_plant',
        field: 'garden_instance',
        value: null,
        provenance: 'unknown',
        description: `Personal Garden Record: No user instances of ${resolvedBotanical.commonName} are currently recorded in your garden. Providing verified public botanical catalog knowledge.`,
      });
    }

    // Add structured botanical catalog facts
    evidence.push({
      sourceType: 'botanical_catalog',
      field: 'sunlight',
      value: resolvedBotanical.sunlight,
      provenance: 'recorded',
      description: `Light Requirement: ${resolvedBotanical.sunlight} (${resolvedBotanical.sunlightHours || '6-8 hours direct'}).`,
      route: `/app/plants/${resolvedBotanical.slug}#growing-guide`,
    });

    evidence.push({
      sourceType: 'botanical_catalog',
      field: 'watering',
      value: resolvedBotanical.watering.moistureLevel,
      provenance: 'recorded',
      description: `Watering: ${resolvedBotanical.watering.frequency}. Moisture: ${resolvedBotanical.watering.moistureLevel}. Guidance: ${resolvedBotanical.watering.guidance}`,
      route: `/app/plants/${resolvedBotanical.slug}#growing-guide`,
    });

    const phStr = resolvedBotanical.ph
      ? `pH ${resolvedBotanical.ph.min}–${resolvedBotanical.ph.max}`
      : 'neutral pH 6.0–7.0';

    evidence.push({
      sourceType: 'botanical_catalog',
      field: 'soil',
      value: resolvedBotanical.soil.type,
      provenance: 'recorded',
      description: `Soil & pH: ${resolvedBotanical.soil.type} (${resolvedBotanical.soil.recommendedMix}). ${phStr}. Container depth: ${resolvedBotanical.potting.minDepthCm} cm.`,
      route: `/app/plants/${resolvedBotanical.slug}#growing-guide`,
    });

    const harvestDaysStr = resolvedBotanical.timelines?.harvestDays
      ? `${resolvedBotanical.timelines.harvestDays.min}–${resolvedBotanical.timelines.harvestDays.max} days`
      : 'standard maturity window';

    evidence.push({
      sourceType: 'botanical_catalog',
      field: 'timelines',
      value: harvestDaysStr,
      provenance: 'recorded',
      description: `Harvest & Timeline: Ready in ${harvestDaysStr}. ${resolvedBotanical.timelines?.timelineNotes || ''}`,
      route: `/app/plants/${resolvedBotanical.slug}#growth-timeline`,
    });

    if (resolvedBotanical.commonProblems.length > 0) {
      evidence.push({
        sourceType: 'botanical_catalog',
        field: 'common_problems',
        value: resolvedBotanical.commonProblems.map((p) => p.issue).join(', '),
        provenance: 'recorded',
        description: `Common Problems: ${resolvedBotanical.commonProblems.map((p) => `${p.issue} (${p.symptoms})`).join('; ')}`,
        route: `/app/plants/${resolvedBotanical.slug}#problems`,
      });
    }

    if (resolvedBotanical.practicalUses.length > 0 || resolvedBotanical.safetyNotes) {
      evidence.push({
        sourceType: 'botanical_catalog',
        field: 'practical_uses',
        value: resolvedBotanical.practicalUses.join(', '),
        provenance: 'recorded',
        description: `Uses & Edibility: ${resolvedBotanical.practicalUses.join(', ')}. Safety: ${resolvedBotanical.safetyNotes}`,
        route: `/app/plants/${resolvedBotanical.slug}#safety-toxicity`,
      });
    }

    if (resolvedBotanical.medicinalProfile) {
      evidence.push({
        sourceType: 'botanical_catalog',
        field: 'medicinal_profile',
        value: resolvedBotanical.medicinalProfile.suitabilityForConsumption.isEdible ? 'Edible' : 'Non-edible',
        provenance: 'recorded',
        description: `Traditional Role: ${resolvedBotanical.medicinalProfile.traditionalMedicineRole}. Summary: ${resolvedBotanical.medicinalProfile.medicinalValueSummary}`,
        route: `/app/plants/${resolvedBotanical.slug}#medicinal-properties`,
      });
    }

    if (resolvedBotanical.sourceUrls.length > 0) {
      evidence.push({
        sourceType: 'botanical_catalog',
        field: 'scientific_references',
        value: resolvedBotanical.sourceUrls.join(', '),
        provenance: 'recorded',
        description: `Verified Botanical Citations: ${resolvedBotanical.sourceUrls.join(', ')}`,
        route: `/app/plants/${resolvedBotanical.slug}#scientific-references`,
      });
    }
  }

  // 8. Track explicit unknown gaps
  const unknowns: string[] = [];
  if (relevantConditions.length === 0) {
    unknowns.push('Environmental conditions (temperature, humidity, light) have not been recorded.');
  }
  if (relevantFeedingRecords.length === 0) {
    unknowns.push('Feeding and fertilizer application records have not been recorded.');
  }
  if (relevantHealthRecords.length === 0) {
    unknowns.push('No health issues or diagnostic records have been logged.');
  }
  if (relevantHarvests.length === 0) {
    unknowns.push('No harvest quantities or yields recorded yet.');
  }

  return {
    userId,
    intent,
    targetPlantId,
    targetPlantNickname: targetPlant?.nickname || targetPlantNickname || resolvedBotanical?.commonName,
    activePlantSlug: resolvedBotanical?.slug || activePlantSlug || null,
    botanicalPlant: resolvedBotanical || null,
    relevantPlants,
    relevantHealthRecords,
    relevantConditions,
    relevantFeedingRecords,
    relevantPropagationEvents,
    relevantProductionCycles,
    relevantHarvests,
    relevantReminders,
    relevantTimelineEvents: [],
    relevantGrowActions,
    relevantGrowPlans,
    dataQuality,
    gardenState,
    evidence,
    unknowns,
  };
}

export interface RetrieveGardenContextParams {
  query?: string;
  intent: CopilotIntent;
  targetPlant?: UserPlant | null;
  activePlant?: UserPlant | null;
  plants?: UserPlant[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  diagnoses?: SavedDiagnosisRecord[];
  reminders?: Reminder[];
  spaceMetrics?: ProductionSpaceMetrics | null;
  growPlans?: any[];
  conversationHistory?: any[];
  referenceDate?: string;
}

export function retrieveGardenContext(params: RetrieveGardenContextParams) {
  const targetPlant = params.targetPlant || params.activePlant || null;
  const targetPlantId = targetPlant?.id || null;
  const context = retrieveCopilotContext({
    userId: 'grower',
    intent: params.intent,
    targetPlantId,
    targetPlantNickname: targetPlant?.nickname,
    plants: params.plants || [],
    conditions: params.conditions || [],
    feedings: params.feedings || [],
    propagations: params.propagations || [],
    cycles: params.cycles || [],
    harvests: params.harvests || [],
    diagnoses: params.diagnoses || [],
    reminders: params.reminders || [],
    spaceMetrics: params.spaceMetrics,
    growPlans: params.growPlans || [],
  });

  return {
    ...context,
    facts: {
      targetPlant: targetPlant || undefined,
      activeHealthIssues: context.relevantHealthRecords,
      overdueReminders: (params.reminders || []).filter((r) => r.status === 'overdue' || r.status === 'due'),
      latestCondition: (params.conditions || [])[0],
      latestFeeding: (params.feedings || [])[0],
      spaceMetrics: params.spaceMetrics,
    },
  };
}
