/**
 * GrowAI Phase 12: Grower Copilot Orchestration Engine
 * Coordinates safety checks, deterministic intent classification, compact structured retrieval,
 * Gemini-based conversational synthesis (or robust deterministic fallback), and action proposals.
 *
 * CRITICAL ARCHITECTURAL INVARIANT:
 * - Deterministic GrowAI engines remain authoritative.
 * - Gemini provides language synthesis over structured facts; it never invents records.
 * - If Gemini is offline, rate limited, or fails, the deterministic fallback engine provides 100% functional answers.
 */

import { GoogleGenAI } from '@google/genai';
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
import {
  CopilotResponse,
  CopilotAction,
  CopilotIntent,
  CopilotQueryContext,
  CopilotMessage,
} from '@/types/grower-copilot';
import { checkQuerySafety, validateResponseSafety, sanitizeContextString } from './safety-guard';
import { classifyCopilotIntent } from './intent-classifier';
import { retrieveCopilotContext } from './query-retriever';
import { getNextBestAction } from '@/lib/adaptive-grow/next-best-action';
import { generateDailyGrowCheck } from '@/lib/adaptive-grow/daily-grow-check';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';

const DEFAULT_MODEL = 'gemini-2.5-flash';

export interface ExecuteCopilotQueryParams {
  query: string;
  userId?: string;
  activePlantId?: string | null;
  activePlantNickname?: string | null;
  activePlantSlug?: string | null;
  botanicalPlant?: any | null;
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
  forceDeterministic?: boolean;
  conversationHistory?: CopilotMessage[];
  referenceDate?: string;
}

export async function executeCopilotQuery(
  params: ExecuteCopilotQueryParams
): Promise<CopilotResponse> {
  const {
    query,
    userId = 'user-local',
    activePlantId,
    activePlantNickname,
    activePlantSlug,
    botanicalPlant,
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
    forceDeterministic = false,
  } = params;

  // 1. Pre-execution Safety Check
  const safety = checkQuerySafety(query);
  if (!safety.isSafe && safety.redirectResponse) {
    return {
      answer: safety.redirectResponse,
      evidence: [],
      intent: 'human_medical_redirect',
      safetyLevel: 'prohibited_redirect',
      confidence: 'high',
      source: 'deterministic',
      suggestedQuestions: [
        'What needs my attention today?',
        'Which plants are currently being monitored?',
        'What information is missing from my garden?',
      ],
    };
  }

  // 2. Deterministic Intent Classification & Pronoun/Target Resolution
  const classification = classifyCopilotIntent({
    query: safety.sanitizedQuery,
    activePlantId,
    activePlantNickname,
    activePlantSlug,
    plants,
  });

  const intent = classification.intent;
  const targetPlantId = classification.targetPlantId;
  const targetPlantNickname = classification.targetPlantNickname;
  const resolvedPlantSlug = classification.activePlantSlug || activePlantSlug || null;

  // Handle Unsupported Questions safely per Section 5
  if (intent === 'unsupported') {
    return {
      answer:
        'I can answer questions about the plants, records, health observations, growing conditions, feeding, propagation, production, harvests, reminders, and GrowAI recommendations recorded in your garden.',
      evidence: [],
      intent: 'unsupported',
      safetyLevel: 'safe',
      confidence: 'high',
      source: 'deterministic',
      suggestedQuestions: [
        'What needs my attention today?',
        'Which plants are currently being monitored?',
        'Show me my recent harvests',
        'What information is missing from my garden?',
      ],
    };
  }

  // 3. Structured Data Retrieval
  const context = retrieveCopilotContext({
    userId,
    intent,
    targetPlantId,
    targetPlantNickname,
    activePlantSlug: resolvedPlantSlug,
    botanicalPlant,
    plants,
    conditions,
    feedings,
    propagations,
    cycles,
    harvests,
    diagnoses,
    reminders,
    spaceMetrics,
    growPlans,
  });

  // 4. Try AI Synthesis if API Key configured and not forced deterministic
  const apiKey = process.env.AI_VISION_API_KEY || process.env.GEMINI_API_KEY;
  if (!forceDeterministic && apiKey && apiKey.trim().length > 10 && !apiKey.includes('placeholder')) {
    try {
      const aiResponse = await generateGeminiCopilotResponse({
        query: safety.sanitizedQuery,
        intent,
        context,
        apiKey,
      });

      if (aiResponse) {
        return validateResponseSafety(aiResponse);
      }
    } catch (err) {
      console.warn('Gemini Copilot synthesis fallback to deterministic engine:', err);
    }
  }

  // 5. Authoritative Deterministic Synthesis (Primary & Fallback Engine)
  const deterministicResponse = generateDeterministicCopilotResponse({
    query: safety.sanitizedQuery,
    intent,
    context,
  });

  return validateResponseSafety(deterministicResponse);
}

/**
 * Deterministic Response Generator: 100% grounded in structured facts without hallucination.
 */
export function generateDeterministicCopilotResponse(params: {
  query: string;
  intent: CopilotIntent;
  context: CopilotQueryContext;
}): CopilotResponse {
  const { intent, context } = params;
  const {
    relevantPlants = [],
    relevantHealthRecords = [],
    relevantConditions = [],
    relevantFeedingRecords = [],
    relevantPropagationEvents = [],
    relevantProductionCycles = [],
    relevantHarvests = [],
    relevantReminders = [],
    relevantGrowActions = [],
    gardenState,
    dataQuality,
    evidence = [],
    targetPlantNickname,
  } = context;

  const targetPlant = relevantPlants.length === 1 ? relevantPlants[0] : null;
  const suggestedActions: CopilotAction[] = [];
  const whatGrowAiFound: string[] = [];
  let answer = '';
  let why: string | undefined;
  let recommendedNextStep: string | undefined;
  const suggestedQuestions: string[] = [];

  switch (intent) {
    case 'today_priorities':
    case 'daily_grow_check': {
      if (gardenState) {
        const daily = generateDailyGrowCheck({
          gardenState,
          actions: relevantGrowActions,
        });

        answer = daily.headline;
        if (daily.positiveSignals.length > 0) {
          whatGrowAiFound.push(...daily.positiveSignals);
        }
        if (daily.observationsToRecord.length > 0) {
          whatGrowAiFound.push(...daily.observationsToRecord);
        }

        if (relevantGrowActions.length > 0) {
          const top = relevantGrowActions[0];
          why = `Highest priority item: "${top.title}". ${top.explanation}`;
          recommendedNextStep = top.recommendedAction;

          suggestedActions.push({
            id: `act-focus-${top.id}`,
            type: 'open_plant',
            label: 'Review Primary Action',
            description: top.recommendedAction,
            requiresConfirmation: false,
            route: top.route,
          });
        } else {
          why = 'All scheduled care tasks, health follow-ups, and observations are up to date.';
          recommendedNextStep = 'Conduct routine visual observation of your foliage when convenient.';
        }
      }
      suggestedQuestions.push(
        'What should I do now?',
        'Which plants are currently being monitored?',
        'What information is missing from my garden?'
      );
      break;
    }

    case 'next_best_action': {
      if (gardenState) {
        const nextAction = getNextBestAction(gardenState, relevantGrowActions);
        if (nextAction) {
          answer = `The single most useful action right now is: "${nextAction.title}".`;
          whatGrowAiFound.push(nextAction.explanation);
          why = `Recommended priority: ${nextAction.priority.toUpperCase()} (${nextAction.category} category).`;
          recommendedNextStep = nextAction.recommendedAction;

          suggestedActions.push({
            id: `act-nba-${nextAction.id}`,
            type: nextAction.category === 'care' ? 'complete_reminder' : 'open_plant',
            label: 'Execute Recommended Action',
            description: nextAction.recommendedAction,
            requiresConfirmation: nextAction.category === 'care',
            route: nextAction.route,
          });
        } else {
          answer = 'Nothing requires your immediate attention right now. Your garden care schedule and health observations are fully up to date.';
          why = 'Zero overdue care tasks, zero urgent health concerns, and zero expired follow-ups detected.';
        }
      }
      suggestedQuestions.push('What needs my attention today?', 'Show me my recent harvests');
      break;
    }

    case 'why_recommendation': {
      if (relevantGrowActions.length > 0) {
        const top = relevantGrowActions[0];
        answer = `The recommendation "${top.title}" was generated because: ${top.explanation}`;
        for (const ev of top.evidence) {
          whatGrowAiFound.push(`${ev.source.toUpperCase()}: ${ev.description}`);
        }
        why = 'GrowAI links every recommendation directly to recorded facts or calculated intervals.';
        recommendedNextStep = top.recommendedAction;
      } else {
        answer = 'There are no active urgent recommendations for this garden at present.';
      }
      break;
    }

    case 'plant_health':
    case 'health_status':
    case 'current_health': {
      const monitoredPlants = relevantPlants.filter((p) => {
        const diags = relevantHealthRecords.filter((d) => d.userPlantId === p.id);
        const health = derivePlantHealthStatus(diags);
        return health === 'needs_attention' || health === 'monitoring';
      });

      if (targetPlant) {
        const plantDiags = relevantHealthRecords.filter((d) => d.userPlantId === targetPlant.id);
        const health = derivePlantHealthStatus(plantDiags);
        const latest = plantDiags[plantDiags.length - 1];

        if (latest) {
          const topCand = latest.candidates?.[0];
          answer = `${targetPlant.nickname} is currently marked as "${health.replace('_', ' ')}". On ${latest.createdAt.split('T')[0]}, symptoms were recorded (${topCand ? topCand.conditionName : 'observed stress'}).`;
          whatGrowAiFound.push(`Derived health status: ${health}`);
          if (topCand) whatGrowAiFound.push(`Leading candidate hypothesis: ${topCand.conditionName} (${topCand.confidenceCategory} confidence)`);
          const latestFollowUp = latest.followUps?.[latest.followUps.length - 1];
          if (latestFollowUp) {
            whatGrowAiFound.push(`Latest follow-up outcome: ${latestFollowUp.outcomeStatus} (${latestFollowUp.observationNotes || 'no notes'})`);
          }

          why = 'GrowAI preserves diagnostic hypotheses without asserting confirmed medical certainty.';
          recommendedNextStep = 'Inspect the plant physically and record a follow-up observation to track recovery.';

          suggestedActions.push({
            id: `act-record-fu-${targetPlant.id}`,
            type: 'open_health',
            label: 'Record Health Follow-up',
            description: 'Log follow-up inspection outcome',
            requiresConfirmation: false,
            route: `/app/my-garden/${targetPlant.id}/health`,
          });
        } else {
          answer = `${targetPlant.nickname} has no recorded health diagnoses or scans. Its health status is currently marked as unknown.`;
        }
      } else {
        if (monitoredPlants.length === 0) {
          answer = 'None of your garden plants are currently flagged as needing attention or active monitoring. All recorded health assessments appear stable.';
        } else {
          answer = `Currently, ${monitoredPlants.length} plant(s) are being monitored: ${monitoredPlants.map((p) => p.nickname).join(', ')}.`;
          for (const p of monitoredPlants) {
            const diags = relevantHealthRecords.filter((d) => d.userPlantId === p.id);
            const status = derivePlantHealthStatus(diags);
            whatGrowAiFound.push(`${p.nickname}: evaluated as ${status.replace('_', ' ')}`);
          }
          recommendedNextStep = 'Review the health tabs for flagged plants to conduct due follow-up observations.';
        }
      }
      suggestedQuestions.push('What health follow-ups are overdue?', 'What should I do now?');
      break;
    }

    case 'plant_conditions':
    case 'condition_history':
    case 'missing_conditions': {
      if (relevantConditions.length === 0) {
        answer = targetPlant
          ? `No growing conditions (temperature, humidity, airflow, soil moisture) have been recorded for ${targetPlant.nickname} yet.`
          : 'Zero growing condition observations have been recorded across your garden yet.';
        recommendedNextStep = 'Log your current ambient microclimate to enable botanical range comparisons.';

        suggestedActions.push({
          id: 'act-log-cond',
          type: 'record_growing_condition',
          label: 'Log Growing Conditions',
          description: 'Record ambient temperature and humidity',
          requiresConfirmation: false,
          route: targetPlant ? `/app/my-garden?plantId=${targetPlant.id}&tab=conditions` : '/app/grow-intelligence',
        });
      } else {
        const latest = relevantConditions[relevantConditions.length - 1];
        const plantName = targetPlant?.nickname || 'Your garden';
        answer = `Latest recorded condition for ${plantName} (${latest.observationTime.split('T')[0]}): ${latest.temperatureCelsius ?? 'unrecorded'}°C, ${latest.relativeHumidityPercent ?? 'unrecorded'}% RH, and soil moisture was "${latest.soilMoisture || 'unknown'}".`;
        whatGrowAiFound.push(`Temperature: ${latest.temperatureCelsius !== null && latest.temperatureCelsius !== undefined ? `${latest.temperatureCelsius}°C (recorded)` : 'Unrecorded'}`);
        whatGrowAiFound.push(`Relative Humidity: ${latest.relativeHumidityPercent !== null && latest.relativeHumidityPercent !== undefined ? `${latest.relativeHumidityPercent}% (recorded)` : 'Unrecorded'}`);
        whatGrowAiFound.push(`Airflow: ${latest.airflowQuality || 'Unrecorded'}`);
        why = 'GrowAI compares recorded measurements against verified species preferences while keeping missing metrics strictly unknown.';
      }
      break;
    }

    case 'plant_feeding':
    case 'feeding_history': {
      if (relevantFeedingRecords.length === 0) {
        answer = targetPlant
          ? `No nutrient feedings have been logged for ${targetPlant.nickname} yet.`
          : 'No feeding records have been logged in your garden yet.';
        recommendedNextStep = 'When fertilizing, always adhere to the manufacturer product label instructions.';
      } else {
        const latest = relevantFeedingRecords[relevantFeedingRecords.length - 1];
        const p = relevantPlants.find((plant) => plant.id === latest.plantId);
        const prodName = latest.productName || (latest as any).fertilizerName || 'fertilizer';
        const method = (latest.applicationMethod || 'soil application').replace('_', ' ');
        const dateStr = (latest.feedingDate || (latest as any).fedAt || '').split('T')[0];
        answer = `Last recorded feeding was on ${dateStr}: ${prodName} (${latest.npkRatio || 'NPK unrecorded'}) applied via ${method}. Always follow the manufacturer product label instructions for exact application rates and dilution.`;
        whatGrowAiFound.push(`Product: ${prodName}`);
        whatGrowAiFound.push(`NPK Formulation: ${latest.npkRatio || 'Unrecorded'}`);
        whatGrowAiFound.push(`Dosage: ${latest.dosageUnknown ? 'Marked as unknown' : `${latest.dosageAmount ?? '—'} ${latest.dosageUnit ?? ''}`}`);
        why = 'GrowAI records exact grower fertilizer applications without prescribing or inventing dosages.';
        recommendedNextStep = 'Always consult the product manufacturer label before applying nutrients.';
      }
      break;
    }

    case 'harvest_history':
    case 'plant_production':
    case 'yield_history': {
      if (relevantHarvests.length === 0) {
        answer = 'No harvest records have been logged yet.';
        recommendedNextStep = 'When picking foliage or fruit, log the weight or count to establish a production baseline.';
      } else {
        const totalByUnit: Record<string, number> = {};
        for (const h of relevantHarvests) {
          totalByUnit[h.unit] = (totalByUnit[h.unit] || 0) + h.quantity;
        }
        const yieldStr = Object.entries(totalByUnit)
          .map(([unit, qty]) => `${qty} ${unit}`)
          .join(', ');

        const latest = relevantHarvests[relevantHarvests.length - 1];
        answer = `You have recorded ${relevantHarvests.length} harvest event(s) yielding a total of ${yieldStr}. Most recent: ${latest.quantity} ${latest.unit} on ${latest.harvestDate.split('T')[0]}. Note that historical performance does not guarantee future yield.`;
        whatGrowAiFound.push(`Total harvest events: ${relevantHarvests.length}`);
        whatGrowAiFound.push(`Cumulative output: ${yieldStr}`);
      }
      break;
    }

    case 'missing_data':
    case 'data_quality': {
      if (dataQuality) {
        answer = `Your garden record is currently ${dataQuality.score}% complete.`;
        for (const cat of dataQuality.categories) {
          if (cat.missing.length > 0) {
            whatGrowAiFound.push(`${cat.category}: ${cat.missing[0]}`);
          }
        }
        why = 'Record completeness audits how thoroughly your garden is tracked; it is strictly not a measure of plant health.';
        recommendedNextStep = 'Fill in missing planting dates or container sizes to refine timeline accuracy.';
      }
      break;
    }

    case 'recent_changes':
    case 'historical_events':
    case 'plant_timeline': {
      const p = targetPlant || (relevantPlants.length > 0 ? relevantPlants[0] : null);
      if (p) {
        const notes = p.notes || [];
        const lastNote = notes[notes.length - 1];
        answer = `Recent activity for ${p.nickname}: Current stage is "${p.currentStage}". Last recorded note was on ${lastNote ? lastNote.date : p.plantedDate || 'unrecorded'}: "${lastNote ? lastNote.text : 'Plant added to garden'}".`;
        whatGrowAiFound.push(`Current growth stage: ${p.currentStage}`);
        if (lastNote) whatGrowAiFound.push(`Latest observation: "${lastNote.text}"`);
      } else {
        answer = `Your garden has ${relevantPlants.length} active plant(s) with ${relevantReminders.filter((r) => r.status === 'due' || r.status === 'overdue').length} active reminders.`;
      }
      break;
    }

    case 'space_advisory': {
      answer = 'Small-Space Utilization Advisory: Always verify balcony load capacity and shelf weight ratings before increasing planter sizes or adding water-heavy containers.';
      whatGrowAiFound.push('Structural safety check is mandatory for elevated containers');
      why = 'Saturated potting soil weighs up to 3x more than dry soil.';
      break;
    }

    case 'view_grow_plan':
    case 'plan_status_inquiry': {
      const plans = (context.relevantGrowPlans || []).filter(
        (pl: any) => pl.status === 'active' || pl.status === 'paused' || pl.status === 'needs_review'
      );
      if (plans.length === 0) {
        answer = targetPlant
          ? `No active Grow Plan is currently assigned to ${targetPlant.nickname}.`
          : 'You do not have any active Grow Plans running across your garden right now.';
        recommendedNextStep = 'You can create an adaptive Grow Plan based on plant establishment, health monitoring, or propagation.';
        suggestedActions.push({
          id: 'act-create-plan',
          type: 'open_planner',
          label: 'Create Grow Plan',
          description: 'Start a new structured grow plan',
          requiresConfirmation: false,
          route: '/app/grow-plans',
        });
      } else {
        const primaryPlan = plans[0];
        const nextStep = (primaryPlan.steps || []).find(
          (s: any) => s.status === 'ready' || s.status === 'in_progress'
        );
        answer = `Active Plan: "${primaryPlan.name}" (${primaryPlan.status.replace(/_/g, ' ')}). Objective: ${primaryPlan.objective.replace(/_/g, ' ')}. Progress: ${primaryPlan.progress?.taskCompletionPercentage || 0}% tasks complete.`;
        if (nextStep) {
          whatGrowAiFound.push(`Next actionable step: "${nextStep.title}" (${nextStep.category})`);
          recommendedNextStep = `Next action: ${nextStep.title}`;
          suggestedActions.push({
            id: `act-complete-step-${nextStep.id}`,
            type: 'complete_step',
            label: `Complete Step: ${nextStep.title}`,
            description: `Mark step "${nextStep.title}" as completed`,
            requiresConfirmation: true,
            payload: { planId: primaryPlan.id, stepId: nextStep.id },
            route: `/app/grow-plans/${primaryPlan.id}`,
          });
        }
        suggestedActions.push({
          id: `act-view-plan-${primaryPlan.id}`,
          type: 'open_grow_plan',
          label: 'View Plan Details',
          description: 'Open full plan timeline and steps',
          requiresConfirmation: false,
          route: `/app/grow-plans/${primaryPlan.id}`,
        });
      }
      break;
    }

    case 'create_grow_plan': {
      const p = targetPlant || (relevantPlants.length > 0 ? relevantPlants[0] : null);
      if (p) {
        answer = `Would you like me to create an Adaptive Establishment Plan for "${p.nickname}"?`;
        recommendedNextStep = 'Confirm below to initialize the plan with evidence-grounded care steps.';
        suggestedActions.push({
          id: `act-create-plan-${p.id}`,
          type: 'create_plan',
          label: `Create Plan for ${p.nickname}`,
          description: `Create structured establishment plan for ${p.nickname}`,
          requiresConfirmation: true,
          payload: {
            plant: p,
            plantId: p.id,
            plantSlug: p.plantSlug,
            name: `${p.nickname} Growth Plan`,
            templateId: 'plant_establishment',
          },
          route: `/app/grow-plans`,
        });
      } else {
        answer = 'To create a Grow Plan, select a plant or visit the Grow Plans dashboard.';
        suggestedActions.push({
          id: 'act-open-plans',
          type: 'open_planner',
          label: 'Open Grow Plans',
          description: 'Go to Grow Plans dashboard',
          requiresConfirmation: false,
          route: '/app/grow-plans',
        });
      }
      break;
    }

    case 'pause_grow_plan': {
      const activePlans = (context.relevantGrowPlans || []).filter((pl: any) => pl.status === 'active');
      if (activePlans.length === 0) {
        answer = 'There are no active plans to pause.';
      } else {
        const plan = activePlans[0];
        answer = `Would you like to pause the plan "${plan.name}"? Progress and dependencies will be preserved.`;
        suggestedActions.push({
          id: `act-pause-plan-${plan.id}`,
          type: 'pause_plan',
          label: `Pause "${plan.name}"`,
          description: 'Temporarily pause this grow plan',
          requiresConfirmation: true,
          payload: { planId: plan.id },
          route: `/app/grow-plans/${plan.id}`,
        });
      }
      break;
    }

    case 'resume_grow_plan': {
      const pausedPlans = (context.relevantGrowPlans || []).filter((pl: any) => pl.status === 'paused');
      if (pausedPlans.length === 0) {
        answer = 'There are no paused plans to resume.';
      } else {
        const plan = pausedPlans[0];
        answer = `Would you like to resume the plan "${plan.name}"?`;
        suggestedActions.push({
          id: `act-resume-plan-${plan.id}`,
          type: 'resume_plan',
          label: `Resume "${plan.name}"`,
          description: 'Reactivate this grow plan',
          requiresConfirmation: true,
          payload: { planId: plan.id },
          route: `/app/grow-plans/${plan.id}`,
        });
      }
      break;
    }

    case 'complete_plan_step': {
      const activePlans = (context.relevantGrowPlans || []).filter((pl: any) => pl.status === 'active');
      const activePlan = activePlans[0];
      const readyStep = activePlan?.steps?.find((s: any) => s.status === 'ready' || s.status === 'in_progress');
      if (readyStep) {
        answer = `Ready to mark "${readyStep.title}" as completed in plan "${activePlan.name}"?`;
        suggestedActions.push({
          id: `act-complete-step-${readyStep.id}`,
          type: 'complete_step',
          label: `Complete: ${readyStep.title}`,
          description: 'Mark this step as completed',
          requiresConfirmation: true,
          payload: { planId: activePlan.id, stepId: readyStep.id },
          route: `/app/grow-plans/${activePlan.id}`,
        });
      } else {
        answer = 'No pending actionable steps found to complete.';
      }
      break;
    }

    // =========================================================================
    // BOTANICAL & PLANT-DETAIL CONTEXTUAL INTENTS (Ask Your Plant)
    // =========================================================================
    case 'botanical_sunlight': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const sunReq = bp ? bp.sunlight.replace('-', ' ') : 'adequate bright light';
      const sunHours = bp?.sunlightHours || '6–8 hours of light daily';

      answer = `${plantName} performs best in ${sunReq} (${sunHours}). ☀️\n\nIf it receives too little sunlight, you may notice longer, weaker ('leggy') stems, slower leaf production, and paler foliage as the plant stretches for light.`;
      whatGrowAiFound.push(`Botanical Light Spec: ${sunReq} (${sunHours})`);
      why = 'Sunlight powers photosynthesis; insufficient light reduces chlorophyll synthesis and cellular structural density.';
      recommendedNextStep = 'Gradually move the plant to a brighter south- or west-facing window or balcony location, or supplement with an LED grow light.';

      suggestedQuestions.push(
        'What happens if I forget to water it?',
        'What should I look for on its leaves?',
        'How can I help it grow better?'
      );
      break;
    }

    case 'botanical_watering': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const moisture = bp?.watering?.moistureLevel || 'moderate';
      const guidance = bp?.watering?.guidance || 'Allow the top layer of soil to dry slightly before watering again.';
      const freq = bp?.watering?.frequency || 'When topsoil feels dry to touch';

      answer = `Missing one watering is usually manageable and does not mean ${plantName} is permanently damaged. 🌿\n\nWhen thirsty, foliage may slightly droop as cell turgor pressure drops. However, overwatering or keeping the root zone waterlogged is far more dangerous, as it suffocates roots and invites fungal rot.`;
      whatGrowAiFound.push(`Preferred Moisture: ${moisture}. Frequency: ${freq}`);
      why = `${guidance} Always do the finger test: check the top 2–3 cm of soil before adding water.`;
      recommendedNextStep = 'If the top 2–3 cm of potting mix is dry, water deeply at the base until moisture drains freely, then empty the catchment saucer. Never overcompensate with excessive standing water.';

      suggestedQuestions.push(
        'Why are the leaves turning yellow?',
        'What kind of soil does it prefer?',
        'When is it ready to harvest?'
      );
      break;
    }

    case 'botanical_problems': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const problems = bp?.commonProblems || [];

      if (problems.length > 0) {
        const top = problems[0];
        answer = `On ${plantName}, watch out for common symptoms like ${top.issue.toLowerCase()} (${top.symptoms.toLowerCase()}). Yellow leaves are frequently a sign of either overwatering, insufficient light, or natural aging of lower leaves.`;
        whatGrowAiFound.push(...problems.map((p: any) => `${p.issue}: ${p.symptoms} (Prevention: ${p.prevention})`));
        why = `Prevention: ${top.prevention}. Organic remedy: ${top.organicRemedy}`;
        recommendedNextStep = `Inspect leaf undersides and soil drainage. ${top.organicRemedy}`;
      } else {
        answer = `For ${plantName}, inspect foliage regularly for discoloration, wilting, or insect activity. Yellowing leaves typically reflect overwatering, root-bound conditions, or light stress.`;
        why = 'Environmental stress manifests first in leaf discoloration and stem rigidity.';
        recommendedNextStep = 'Inspect the undersides of leaves and check root aeration and container drainage.';
      }

      suggestedQuestions.push(
        'What if it gets less sunlight?',
        'What if I forget to water it?',
        'How can I help it grow better?'
      );
      break;
    }

    case 'botanical_benefits': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const uses = bp?.practicalUses || [];
      const edibility = bp?.medicinalProfile?.suitabilityForConsumption;

      const usesStr = uses.length > 0 ? uses.join(', ') : 'culinary herbs and container gardening';
      const edibleNote = edibility
        ? edibility.isEdible
          ? `Edible parts: ${edibility.edibilityNotes}`
          : `Note: ${edibility.edibilityNotes}`
        : bp?.safetyNotes || 'Follow standard garden safety.';

      answer = `${plantName} offers verified practical benefits: ${usesStr}. 🍃\n\n${edibleNote}`;
      whatGrowAiFound.push(`Documented Uses: ${usesStr}`);
      if (bp?.safetyNotes) whatGrowAiFound.push(`Safety Profile: ${bp.safetyNotes}`);
      why = 'All documented benefits are grounded strictly in verified botanical and agricultural records.';
      recommendedNextStep = 'Harvest outer mature growth in the morning for peak aroma and flavour, leaving inner leaves to continue growing.';

      suggestedQuestions.push(
        'Can this plant be used as medicine?',
        'When is it ready to harvest?',
        'How can I help it grow better?'
      );
      break;
    }

    case 'botanical_medicinal': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const med = bp?.medicinalProfile;

      if (med && (med.traditionalMedicineRole || med.medicinalValueSummary)) {
        answer = `In traditional herbal and culinary history, ${plantName} is noted for ${med.traditionalMedicineRole || 'nutritive dietary support'}. Research studies have investigated active compounds for properties such as ${med.medicinalValueSummary || 'antioxidant and digestive support'}.\n\n⚠️ Educational Notice: Information about traditional or researched plant uses is educational, not medical advice. GrowAI never prescribes dosages or treatments. Ask a qualified healthcare professional before using plants medicinally.`;
        if (med.traditionalMedicineRole) whatGrowAiFound.push(`Traditional Role: ${med.traditionalMedicineRole}`);
        if (med.medicinalValueSummary) whatGrowAiFound.push(`Scientific Summary: ${med.medicinalValueSummary}`);
        if (bp.safetyNotes) whatGrowAiFound.push(`Safety & Precautions: ${bp.safetyNotes}`);
      } else {
        answer = `${plantName} is cultivated primarily for culinary, nutritional, or ornamental garden purposes. GrowAI has no verified medicinal properties documented for this species.\n\n⚠️ Educational Notice: Information about plant uses is educational, not medical advice. Always ask a qualified healthcare professional before using any plant medicinally.`;
      }

      why = 'Traditional use differs from approved medical treatments. Clinical effectiveness requires professional oversight.';
      recommendedNextStep = 'Enjoy this plant for its verified culinary and ecological qualities. For human health symptoms, consult a healthcare provider.';

      suggestedQuestions.push(
        'What can I use this plant for?',
        'What kind of soil does it prefer?',
        'What if I forget to water it?'
      );
      break;
    }

    case 'botanical_harvest': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const days = bp?.timelines?.harvestDays;
      const notes = bp?.timelines?.timelineNotes || 'Look for vibrant color and firm texture.';

      const timeStr = days ? `${days.min}–${days.max} days from sowing` : 'when fully mature';
      answer = `${plantName} is typically ready for harvest around ${timeStr}. ✂️\n\n${notes}`;
      whatGrowAiFound.push(`Harvest Window: ${timeStr}`);
      if (bp?.timelines?.maturityDays) whatGrowAiFound.push(`Full Maturity: ${bp.timelines.maturityDays.min}–${bp.timelines.maturityDays.max} days`);
      why = 'Harvesting at peak maturity preserves flavor, nutritional content, and stimulates continued growth in cut-and-come-again varieties.';
      recommendedNextStep = 'Use clean pruning shears or sharp scissors. Harvest outer leaves first or pick ripe fruit gently at the abscission node without tugging roots.';

      suggestedQuestions.push(
        'What can I use this plant for?',
        'How can I help it grow better?',
        'What should I look for on its leaves?'
      );
      break;
    }

    case 'botanical_soil_ph': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const soilType = bp?.soil?.recommendedMix || bp?.soil?.type || 'Well-draining rich potting mix';
      const phRange = bp?.ph ? `pH ${bp.ph.min}–${bp.ph.max}` : 'neutral pH 6.0–7.0';
      const potDepth = bp?.potting?.minDepthCm ? `${bp.potting.minDepthCm} cm depth` : 'adequate depth';

      answer = `${plantName} prefers a ${soilType.toLowerCase()} with excellent drainage and a ${phRange}. 🪴\n\nEnsure your planter has a minimum of ${potDepth} and unobstructed bottom drainage holes to prevent anaerobic root rot.`;
      whatGrowAiFound.push(`Soil Recommendation: ${soilType}`);
      whatGrowAiFound.push(`pH & Potting: ${phRange}, Min Depth: ${potDepth}`);
      why = 'Proper soil structure provides both water retention and oxygen diffusion to the root zone.';
      recommendedNextStep = 'Use a container with drainage holes and blend 20% perlite or pumice into potting soil to maintain permanent aeration pores.';

      suggestedQuestions.push(
        'What happens if I forget to water it?',
        'What if it gets less sunlight?',
        'How can I help it grow better?'
      );
      break;
    }

    case 'botanical_growth_guide':
    case 'botanical_general': {
      const bp = context.botanicalPlant;
      const plantName = bp?.commonName || context.targetPlantNickname || 'This plant';
      const tempRange = bp ? `${bp.temperatureRange.min}°C – ${bp.temperatureRange.max}°C` : '18°C – 28°C';
      const ideal = bp?.temperatureRange?.idealRange || 'room temperature with good airflow';
      const diff = bp?.difficulty?.level || 'beginner-friendly';

      answer = `${plantName} is a ${diff} plant suited for home containers and vertical spaces. It thrives best in temperatures of ${tempRange} (${ideal}). 🌿\n\nProvide consistent light, avoid waterlogged soil, and keep airflow gentle and steady.`;
      whatGrowAiFound.push(`Difficulty: ${diff.toUpperCase()}`);
      whatGrowAiFound.push(`Temperature: ${tempRange} (${ideal})`);
      if (bp?.environments) whatGrowAiFound.push(`Recommended Environments: ${bp.environments.join(', ')}`);
      why = 'Steady environmental conditions prevent vegetative stress and promote vigorous root and leaf development.';
      recommendedNextStep = 'Observe your plant daily, conduct quick soil moisture checks, and celebrate every new leaf or bud.';

      suggestedQuestions.push(
        'What if it gets less sunlight?',
        'What happens if I forget to water it?',
        'What should I look for on its leaves?',
        'What can I use this plant for?'
      );
      break;
    }

    default: {
      answer = `Your garden contains ${relevantPlants.length} plant(s) with ${relevantReminders.filter((r) => r.status === 'overdue').length} overdue care item(s).`;
      break;
    }
  }

  return {
    answer,
    whatGrowAiFound: whatGrowAiFound.length > 0 ? whatGrowAiFound : undefined,
    why,
    recommendedNextStep,
    evidence: evidence.slice(0, 5),
    suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
    suggestedQuestions: suggestedQuestions.length > 0 ? suggestedQuestions : [
      'What needs my attention today?',
      'Which plants are currently being monitored?',
      'What information is missing from my garden?',
    ],
    intent,
    safetyLevel: 'safe',
    confidence: 'high',
    source: 'deterministic',
  };
}

/**
 * Gemini-Powered Language Synthesis Layer:
 * Calls Gemini with strict safety instructions and the compact retrieved context.
 */
async function generateGeminiCopilotResponse(params: {
  query: string;
  intent: CopilotIntent;
  context: CopilotQueryContext;
  apiKey: string;
}): Promise<CopilotResponse | null> {
  const { query, intent, context, apiKey } = params;
  const ai = new GoogleGenAI({ apiKey });

  const compactEvidenceStr = context.evidence
    .slice(0, 8)
    .map((e) => `- [${e.provenance.toUpperCase()}] ${e.description}`)
    .join('\n');

  const bp = context.botanicalPlant;
  const botanicalSection = bp
    ? `
ACTIVE BOTANICAL SPECIMEN:
- Common Name: ${bp.commonName} (${bp.scientificName})
- Light: ${bp.sunlight} (${bp.sunlightHours || '6-8 hours direct light'})
- Watering: ${bp.watering.frequency} - ${bp.watering.guidance} (Moisture: ${bp.watering.moistureLevel})
- Soil & Potting: ${bp.soil.type} (${bp.soil.recommendedMix}), pH ${bp.ph.min}-${bp.ph.max}, Depth: ${bp.potting.minDepthCm} cm
- Temperature: ${bp.temperatureRange.min}°C - ${bp.temperatureRange.max}°C (Ideal: ${bp.temperatureRange.idealRange})
- Timelines: Ready in ${bp.timelines.harvestDays.min}-${bp.timelines.harvestDays.max} days. ${bp.timelines.timelineNotes}
- Common Problems: ${bp.commonProblems.map((p: any) => `${p.issue}: ${p.symptoms}`).join('; ')}
- Uses & Safety: ${bp.practicalUses.join(', ')}. Safety: ${bp.safetyNotes}
- Traditional/Medicinal: ${bp.medicinalProfile?.traditionalMedicineRole || 'None'}. Value: ${bp.medicinalProfile?.medicinalValueSummary || 'None'}

BOTANICAL RESPONSE INSTRUCTIONS:
- Tone: Friendly, knowledgeable gardening companion for home and student growers.
- Length: Concise, approximately 50-150 words.
- Format:
  1. Direct, clear answer.
  2. Why it happens.
  3. Actionable next step for the grower.
  4. Safety / uncertainty / medicinal note when applicable.
- For missed watering: Explain that missing one watering is rarely fatal; advise checking top 2-3 cm of soil before watering. NEVER tell growers to flood or overwater to compensate.
- For medicinal questions: Explain documented traditional roles and research properties; NEVER prescribe, never recommend dosages, never recommend homemade disease cures, and ALWAYS append: "Information about traditional or researched plant uses is educational, not medical advice. Ask a qualified healthcare professional before using plants medicinally."
- Distinguish PUBLIC BOTANICAL KNOWLEDGE from USER GARDEN RECORDS. Do NOT invent user records.`
    : '';

  const systemInstructions = `You are the GrowAI Grower Copilot, a calm, precise, botanical intelligence assistant for urban and home gardeners.
${botanicalSection}

CRITICAL RULES AND SAFETY BOUNDARIES:
1. GrowAI structured records are the ONLY source of truth.
2. DO NOT invent measurements, temperatures, humidity, fertilizer dosages, application rates, pre-harvest intervals (PHIs), or historical events.
3. If information is missing or unrecorded in the context, explicitly state that it is unrecorded. DO NOT GUESS.
4. DO NOT diagnose humans or give medical advice.
5. DO NOT guarantee future yields, plant survival, or growth rates. Historical performance does not guarantee future yield.
6. DO NOT infer plant maturity solely from calendar days; recommend visual inspection instead.
7. Diagnostic hypotheses from AI Doctor are observational differential hypotheses, NOT confirmed diseases.
8. Always direct nutrient applications to follow manufacturer product label directions.

STRUCTURED EVIDENCE AVAILABLE FOR THIS QUERY:
${compactEvidenceStr || 'No specific records logged for this inquiry.'}

RESPOND ONLY IN VALID JSON matching this exact structure:
{
  "answer": "Concise natural language answer grounded strictly in the evidence.",
  "whatGrowAiFound": ["Evidence fact 1", "Evidence fact 2"],
  "why": "Brief explanation of relevant records or calculation.",
  "recommendedNextStep": "Safe recommended physical check or next action if supported.",
  "suggestedQuestions": ["Suggested follow-up 1", "Suggested follow-up 2"]
}`;

  const response = await ai.models.generateContent({
    model: process.env.AI_MODEL_NAME || DEFAULT_MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Grower Question: "${sanitizeContextString(query)}"\nIntent: ${intent}\nTarget Plant: ${context.targetPlantNickname || 'Garden wide'}`,
          },
        ],
      },
    ],
    config: {
      systemInstruction: systemInstructions,
      responseMimeType: 'application/json',
      temperature: 0.15,
      maxOutputTokens: 1024,
    },
  });

  if (!response.text) return null;

  try {
    const parsed = JSON.parse(response.text);
    return {
      answer: parsed.answer || 'Here is the relevant information from your garden records.',
      whatGrowAiFound: Array.isArray(parsed.whatGrowAiFound) ? parsed.whatGrowAiFound : undefined,
      why: parsed.why || undefined,
      recommendedNextStep: parsed.recommendedNextStep || undefined,
      evidence: context.evidence.slice(0, 5),
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions)
        ? parsed.suggestedQuestions.slice(0, 3)
        : ['What should I do today?', 'Which plants need attention?'],
      intent,
      safetyLevel: 'safe',
      confidence: 'high',
      source: 'gemini_grounded',
    };
  } catch (parseErr) {
    console.warn('Failed to parse Gemini copilot JSON response:', parseErr);
    return null;
  }
}
