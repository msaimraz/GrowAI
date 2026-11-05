/**
 * GrowAI Phase 13: Grow Plan Generator & Template Engine
 * Generates deterministic, evidence-backed grow plans across botanical objectives:
 * - Plant Establishment
 * - Health Monitoring & Recovery
 * - Propagation
 * - Harvest Preparation
 * - Production Cycle
 * - Environment Improvement
 * - Space Optimization
 * - Data Quality Improvement
 *
 * CRITICAL SAFETY RULES:
 * - Never fabricate environmental readings.
 * - Never prescribe unsupported fertilizer dosages (always reference manufacturer label).
 * - Never declare plant maturity or harvest readiness from calendar dates alone.
 * - Structural safety verification must remain mandatory for space optimization.
 */

import {
  GrowPlan,
  GrowPlanStep,
  PlanObjective,
  PlanPriority,
  CreateGrowPlanParams,
  PlanEvidence,
  GrowPlanScope,
} from '@/types/grow-plan';
import { UserPlant } from '@/types/garden';
import { SavedDiagnosisRecord } from '@/types/diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  ProductionSpaceMetrics,
} from '@/types/grow-intelligence';
import { calculatePlanProgress, evaluatePlanHealthStatus } from './plan-progress';
import { evaluateAllPlanSteps } from './plan-step-engine';

export interface PlanTemplateDefinition {
  id: string;
  name: string;
  objective: PlanObjective;
  scope: GrowPlanScope;
  description: string;
  defaultPriority: PlanPriority;
  stepCount: number;
}

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

export const PLAN_TEMPLATES: PlanTemplateDefinition[] = [
  {
    id: 'plant_establishment',
    name: 'Plant Establishment',
    objective: 'establish_plant',
    scope: 'plant',
    description: 'Structure initial planting, microclimate logging, and baseline growth observations.',
    defaultPriority: 'normal',
    stepCount: 5,
  },
  {
    id: 'health_monitoring',
    name: 'Health Monitoring & Recovery',
    objective: 'monitor_health',
    scope: 'plant',
    description: 'Track symptoms, inspect recovery, and record evidence-based follow-ups without guessing.',
    defaultPriority: 'high',
    stepCount: 5,
  },
  {
    id: 'propagation',
    name: 'Plant Propagation',
    objective: 'propagate_plant',
    scope: 'propagation',
    description: 'Prepare cuttings, record rooting progress, and link parent lineage to offspring.',
    defaultPriority: 'normal',
    stepCount: 5,
  },
  {
    id: 'harvest_preparation',
    name: 'Harvest Preparation',
    objective: 'prepare_for_harvest',
    scope: 'plant',
    description: 'Inspect visual maturity indicators, prepare harvest, and log actual production yields.',
    defaultPriority: 'normal',
    stepCount: 4,
  },
  {
    id: 'production_cycle',
    name: 'Production Cycle Management',
    objective: 'establish_production_cycle',
    scope: 'production_cycle',
    description: 'Coordinate crop batch planting, environmental tracking, and cumulative yield accounting.',
    defaultPriority: 'normal',
    stepCount: 5,
  },
  {
    id: 'environment_improvement',
    name: 'Growing Environment Improvement',
    objective: 'improve_growing_conditions',
    scope: 'plant',
    description: 'Measure unrecorded microclimate metrics, make supported adjustments, and observe plant response.',
    defaultPriority: 'normal',
    stepCount: 5,
  },
  {
    id: 'space_optimization',
    name: 'Space & Structural Load Optimization',
    objective: 'optimize_space',
    scope: 'space',
    description: 'Verify shelf structural load safety, calculate slot occupancy, and assign plants to light zones.',
    defaultPriority: 'normal',
    stepCount: 5,
  },
  {
    id: 'improve_data_quality',
    name: 'Garden Record Completeness',
    objective: 'improve_data_quality',
    scope: 'garden',
    description: 'Fill missing data gaps across planting dates, environmental readings, and nutrient logs.',
    defaultPriority: 'low',
    stepCount: 5,
  },
];

export function getAvailablePlanTemplates(): PlanTemplateDefinition[] {
  return PLAN_TEMPLATES;
}

export interface PlanGenerationContext {
  plant?: UserPlant | null;
  plants?: UserPlant[];
  diagnoses?: SavedDiagnosisRecord[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  spaceMetrics?: ProductionSpaceMetrics | null;
  referenceDate?: Date | string;
}

/**
 * Builds raw template steps with deterministic dependencies.
 */
function buildTemplateSteps(
  templateId: string,
  planId: string,
  userId: string,
  plantNickname: string,
  plantId?: string | null
): GrowPlanStep[] {
  const s1Id = generateUuid();
  const s2Id = generateUuid();
  const s3Id = generateUuid();
  const s4Id = generateUuid();
  const s5Id = generateUuid();
  const now = new Date().toISOString();

  switch (templateId) {
    case 'plant_establishment':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: `Inspect initial planting placement for ${plantNickname}`,
          description: 'Confirm pot drainage and container placement before establishing care routine.',
          category: 'care',
          status: 'ready',
          priority: 'normal',
          source: 'template:plant_establishment',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: `Record baseline environmental conditions for ${plantNickname}`,
          description: 'Measure ambient temperature and light exposure near the growing container.',
          category: 'environment',
          status: 'pending',
          priority: 'normal',
          source: 'template:plant_establishment',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: `Establish care and watering schedule for ${plantNickname}`,
          description: 'Set initial soil moisture check intervals based on container size and medium.',
          category: 'care',
          status: 'pending',
          priority: 'normal',
          source: 'template:plant_establishment',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: `Record first growth observation for ${plantNickname}`,
          description: 'Log new leaf growth or node elongation to establish botanical baseline.',
          category: 'growth',
          status: 'pending',
          priority: 'normal',
          source: 'template:plant_establishment',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: `Review establishment progress for ${plantNickname}`,
          description: 'Confirm plant is rooted and acclimated to the local microclimate.',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:plant_establishment',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'health_monitoring':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: `Review active health records & symptoms for ${plantNickname}`,
          description: 'Inspect recorded AI Doctor candidate diagnoses and noted symptoms.',
          category: 'health',
          status: 'ready',
          priority: 'high',
          source: 'template:health_monitoring',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: `Inspect foliage and capture follow-up photo of ${plantNickname}`,
          description: 'Check leaf undersides, stem discoloration, and soil moisture level.',
          category: 'observation',
          status: 'pending',
          priority: 'high',
          source: 'template:health_monitoring',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: `Apply supportive cultural care for ${plantNickname}`,
          description: 'Isolate if necessary, adjust watering, or remove dead tissue without chemical guessing.',
          category: 'care',
          status: 'pending',
          priority: 'normal',
          source: 'template:health_monitoring',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: `Record health follow-up observation for ${plantNickname}`,
          description: 'Log whether symptoms are improving, unchanged, worsening, or resolved.',
          category: 'health',
          status: 'pending',
          priority: 'high',
          source: 'template:health_monitoring',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: `Evaluate recovery outcome for ${plantNickname}`,
          description: 'Close health monitoring if resolved, or adjust plan if symptoms persist.',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:health_monitoring',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'propagation':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: `Inspect mother plant vigor on ${plantNickname}`,
          description: 'Verify stem health and confirm mother plant is free of active pests or wilting.',
          category: 'observation',
          status: 'ready',
          priority: 'normal',
          source: 'template:propagation',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: `Take cutting and prepare rooting medium for ${plantNickname}`,
          description: 'Clean shears, take stem or leaf cutting, and place into water or moist propagation medium.',
          category: 'propagation',
          status: 'pending',
          priority: 'normal',
          source: 'template:propagation',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: `Record propagation event in garden lineage`,
          description: 'Log propagation method and link mother plant ID to preserve lineage history.',
          category: 'data_quality',
          status: 'pending',
          priority: 'normal',
          source: 'template:propagation',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: `Monitor root development`,
          description: 'Check for root initials and ensure medium remains appropriately humid.',
          category: 'observation',
          status: 'pending',
          priority: 'normal',
          source: 'template:propagation',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: `Pot rooted cutting and create child plant in My Garden`,
          description: 'Transplant rooted cutting to container and register offspring in garden records.',
          category: 'propagation',
          status: 'pending',
          priority: 'normal',
          source: 'template:propagation',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'harvest_preparation':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: `Inspect visual maturity indicators on ${plantNickname}`,
          description: 'Check leaf size, aroma, or fruit color. Maturity cannot be inferred solely from calendar days.',
          category: 'observation',
          status: 'ready',
          priority: 'normal',
          source: 'template:harvest_preparation',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: `Review pre-harvest moisture for ${plantNickname}`,
          description: 'Ensure foliage is dry and soil is appropriately hydrated before harvesting.',
          category: 'environment',
          status: 'pending',
          priority: 'normal',
          source: 'template:harvest_preparation',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: `Perform harvest and record weight or count for ${plantNickname}`,
          description: 'Harvest foliage or fruit and log actual measured units (grams, ounces, pieces).',
          category: 'harvest',
          status: 'pending',
          priority: 'normal',
          source: 'template:harvest_preparation',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: `Log post-harvest recovery and plant condition`,
          description: 'Observe whether plant has sufficient remaining foliage for vegetative regrowth.',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:harvest_preparation',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'production_cycle':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: 'Establish production cycle area & planted quantity',
          description: 'Record initial cycle batch count and allocate space shelf or container area.',
          category: 'production',
          status: 'ready',
          priority: 'normal',
          source: 'template:production_cycle',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: 'Record ambient temperature, humidity & photoperiod',
          description: 'Measure environmental baseline for production cycle.',
          category: 'environment',
          status: 'pending',
          priority: 'normal',
          source: 'template:production_cycle',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: 'Track vegetative growth progression',
          description: 'Log weekly growth notes and record active plant counts.',
          category: 'growth',
          status: 'pending',
          priority: 'normal',
          source: 'template:production_cycle',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: 'Log harvest yield events',
          description: 'Record actual harvest weights and units without estimating unrecorded output.',
          category: 'harvest',
          status: 'pending',
          priority: 'normal',
          source: 'template:production_cycle',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: 'Complete cycle production analysis',
          description: 'Calculate cumulative yield, loss rate, and average yield per harvest.',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:production_cycle',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'environment_improvement':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: `Audit missing microclimate parameters for ${plantNickname}`,
          description: 'Check which parameters (temperature, humidity, airflow, soil moisture) are unrecorded.',
          category: 'data_quality',
          status: 'ready',
          priority: 'normal',
          source: 'template:environment_improvement',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: `Record ambient temperature and humidity for ${plantNickname}`,
          description: 'Use a thermometer/hygrometer to record verified measurements near the plant.',
          category: 'environment',
          status: 'pending',
          priority: 'normal',
          source: 'template:environment_improvement',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: `Make supported microclimate adjustment for ${plantNickname}`,
          description: 'Adjust distance from grow light, increase ventilation, or adjust humidity tray.',
          category: 'care',
          status: 'pending',
          priority: 'normal',
          source: 'template:environment_improvement',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: `Observe plant foliage response after adjustment`,
          description: 'Check for reduced wilting, leaf edge curling, or improved transpiration.',
          category: 'observation',
          status: 'pending',
          priority: 'normal',
          source: 'template:environment_improvement',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: `Review microclimate stability for ${plantNickname}`,
          description: 'Confirm environment remains within species preferences over a 7-day period.',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:environment_improvement',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'space_optimization':
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: 'Review growing area slot occupancy and tier distribution',
          description: 'Count current occupied container positions across top, middle, and bottom tiers.',
          category: 'space',
          status: 'ready',
          priority: 'normal',
          source: 'template:space_optimization',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: 'MANDATORY: Verify shelf/rack structural load capacity',
          description: 'Ensure structural weight limits are confirmed before placing saturated soil containers.',
          category: 'space',
          status: 'pending',
          priority: 'high',
          source: 'template:space_optimization',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: true,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: 'Assign container plants according to photoperiod requirements',
          description: 'Place high-light crops on top tier / under direct fixtures and shade-tolerant below.',
          category: 'space',
          status: 'pending',
          priority: 'normal',
          source: 'template:space_optimization',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: 'Check container spacing for adequate canopy airflow',
          description: 'Prevent crowded foliage from creating stagnant humidity pockets.',
          category: 'observation',
          status: 'pending',
          priority: 'normal',
          source: 'template:space_optimization',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: 'Review space utilization metrics',
          description: 'Confirm space is utilized within safe limits (<85% recommended without overcrowding).',
          category: 'review',
          status: 'pending',
          priority: 'normal',
          source: 'template:space_optimization',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];

    case 'improve_data_quality':
    default:
      return [
        {
          id: s1Id,
          planId,
          userId,
          title: 'Audit missing plant information across garden',
          description: 'Identify plants lacking planted date, current stage, or location tags.',
          category: 'data_quality',
          status: 'ready',
          priority: 'low',
          source: 'template:data_quality',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s2Id,
          planId,
          userId,
          title: 'Log current temperature & humidity observations',
          description: 'Record ambient readings to replace unrecorded condition parameters with real facts.',
          category: 'environment',
          status: 'pending',
          priority: 'normal',
          source: 'template:data_quality',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s3Id,
          planId,
          userId,
          title: 'Record recent feeding or fertilizer applications',
          description: 'Log fertilizer product and NPK formulation following manufacturer product label.',
          category: 'feeding',
          status: 'pending',
          priority: 'normal',
          source: 'template:data_quality',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s1Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s4Id,
          planId,
          userId,
          title: 'Capture photographic growth journal entry',
          description: 'Attach photo and record plant height or node development.',
          category: 'observation',
          status: 'pending',
          priority: 'normal',
          source: 'template:data_quality',
          evidence: [],
          requiresObservation: true,
          requiresConfirmation: false,
          prerequisiteStepIds: [s2Id, s3Id],
          createdAt: now,
          updatedAt: now,
        },
        {
          id: s5Id,
          planId,
          userId,
          title: 'Review updated garden completeness score',
          description: 'Confirm completeness score reflects recorded parameters without guessing.',
          category: 'review',
          status: 'pending',
          priority: 'low',
          source: 'template:data_quality',
          evidence: [],
          requiresObservation: false,
          requiresConfirmation: false,
          prerequisiteStepIds: [s4Id],
          createdAt: now,
          updatedAt: now,
        },
      ];
  }
}

/**
 * Generates a complete GrowPlan object from a template and context.
 */
export function generateGrowPlanFromTemplate(
  templateId: string,
  params: CreateGrowPlanParams,
  context?: PlanGenerationContext
): GrowPlan {
  const planId = generateUuid();
  const userId = params.userId || 'user-local';
  const plantNickname = context?.plant?.nickname || params.name || 'Plant';
  const plantId = params.plantId || context?.plant?.id || null;
  const now = new Date().toISOString();

  // 1. Build initial steps from template or initialSteps param
  let steps: GrowPlanStep[] = [];
  if (params.initialSteps && params.initialSteps.length > 0) {
    steps = params.initialSteps.map((s) => ({
      ...s,
      id: generateUuid(),
      planId,
      userId,
      createdAt: now,
      updatedAt: now,
    }));
  } else {
    steps = buildTemplateSteps(templateId, planId, userId, plantNickname, plantId);
  }

  // 2. Evaluate initial statuses through step dependency engine
  const evaluatedSteps = evaluateAllPlanSteps(steps, now);

  // 3. Assemble evidence facts from context
  const evidence: PlanEvidence[] = [];
  if (context?.plant) {
    evidence.push({
      sourceType: 'manual',
      plantId: context.plant.id,
      plantNickname: context.plant.nickname,
      field: 'stage',
      value: context.plant.currentStage,
      provenance: 'recorded',
      description: `Current growth stage recorded as ${context.plant.currentStage}.`,
    });
  }

  if (context?.diagnoses && context.diagnoses.length > 0) {
    const diag = context.diagnoses[0];
    const topCand = diag.candidates?.[0]?.conditionName || 'Observed stress';
    evidence.push({
      sourceType: 'diagnosis_record',
      sourceId: diag.id,
      plantId: diag.userPlantId || undefined,
      field: 'condition',
      value: topCand,
      provenance: 'observed',
      description: `Active diagnostic record: ${topCand}.`,
      route: `/app/ai-doctor/history/${diag.id}`,
    });
  }

  if (context?.conditions && context.conditions.length > 0) {
    const latestCond = context.conditions[context.conditions.length - 1];
    evidence.push({
      sourceType: 'growing_condition',
      sourceId: latestCond.id,
      field: 'environment',
      value: `${latestCond.temperatureCelsius ?? '—'}°C`,
      provenance: 'recorded',
      description: `Latest recorded microclimate: ${latestCond.temperatureCelsius ?? '—'}°C, ${latestCond.relativeHumidityPercent ?? '—'}% RH.`,
    });
  }

  // 4. Progress and health evaluation
  const progress = calculatePlanProgress(evaluatedSteps);
  const healthStatus = evaluatePlanHealthStatus('active', evaluatedSteps, false);

  return {
    id: planId,
    userId,
    name: params.name || `${plantNickname} — ${templateId.replace(/_/g, ' ')}`,
    description: params.description || `Structured grow plan for ${plantNickname}.`,
    scope: params.scope,
    plantId,
    plantIds: plantId ? [plantId] : params.plantIds || [],
    productionCycleId: params.productionCycleId || null,
    propagationEventId: params.propagationEventId || null,
    objective: params.objective,
    status: 'active',
    healthStatus,
    priority: params.priority || 'normal',
    startDate: params.startDate || now.split('T')[0],
    targetDate: params.targetDate || null,
    steps: evaluatedSteps.map((s, idx) => ({
      ...s,
      stepOrder: s.stepOrder || idx + 1,
      prerequisites: s.prerequisites || s.prerequisiteStepIds || [],
      prerequisiteStepIds: s.prerequisiteStepIds || s.prerequisites || [],
    })),
    progress,
    evidence,
    evidenceBasis: evidence,
    adjustmentHistory: [
      {
        id: generateUuid(),
        planId,
        adjustedAt: now,
        trigger: 'manual_adjustment',
        reason: 'Initial plan generated from template.',
        changes: [`Created plan with ${evaluatedSteps.length} steps.`],
        newStatus: 'active',
      },
    ],
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };
}

export function getTemplateDefinitions() {
  return PLAN_TEMPLATES.map((t) => ({
    ...t,
    defaultStepCount: t.stepCount,
  }));
}

export interface GeneratePlanOptions {
  plant?: UserPlant | null;
  plantId?: string | null;
  plantSlug?: string | null;
  name?: string;
  description?: string;
  diagnoses?: SavedDiagnosisRecord[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
}

export function generatePlanFromTemplate(
  templateId: string,
  options: GeneratePlanOptions = {}
): GrowPlan {
  const tpl = PLAN_TEMPLATES.find((t) => t.id === templateId) || PLAN_TEMPLATES[0];
  const plantNickname = options.plant?.nickname || (options.plantId ? 'Plant' : 'Garden');
  const planName = options.name || `${plantNickname} ${tpl.name}`;
  const planDesc = options.description || tpl.description;

  const createParams: CreateGrowPlanParams = {
    userId: 'user-local',
    name: planName,
    description: planDesc,
    scope: tpl.scope,
    objective: tpl.objective,
    priority: tpl.defaultPriority,
    plantId: options.plantId || options.plant?.id,
    plantIds: options.plantId ? [options.plantId] : options.plant ? [options.plant.id] : [],
  };

  const context: PlanGenerationContext = {
    plant: options.plant || undefined,
    diagnoses: options.diagnoses,
    conditions: options.conditions,
    feedings: options.feedings,
    propagations: options.propagations,
    cycles: options.cycles,
  };

  return generateGrowPlanFromTemplate(templateId, createParams, context);
}
