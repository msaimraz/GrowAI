/**
 * GrowAI Phase 11: Grounded Natural-Language Query Engine
 * Answers grower questions strictly grounded in recorded garden facts and synthesized intelligence.
 *
 * CRITICAL ARCHITECTURAL SAFETY PRINCIPLE:
 * Deterministic intent parsing is primary.
 * AI is never given raw unrestricted database access or allowed to invent data.
 * If AI is absent or offline, deterministic answer synthesis is 100% functional.
 */

import { GardenState, GrowAction, GardenQueryResponse, AdaptiveGardenInput } from '@/types/adaptive-grow';
import { derivePlantHealthStatus } from '@/lib/plant-health-status';

export interface QueryEngineContext {
  gardenState: GardenState;
  actions: GrowAction[];
  input: AdaptiveGardenInput;
}

export function answerGardenQuery(
  rawQuery: string,
  context: QueryEngineContext
): GardenQueryResponse {
  const query = rawQuery.trim().toLowerCase();
  const { gardenState, actions, input } = context;
  const { plants = [], harvests = [], diagnoses = [] } = input;

  // 1. Intent: "Which plants need attention?"
  if (
    query.includes('need attention') ||
    query.includes('needs attention') ||
    query.includes('unhealthy') ||
    query.includes('sick') ||
    query.includes('problem')
  ) {
    const attentionPlants = plants.filter((p) => {
      const diags = diagnoses.filter((d) => d.userPlantId === p.id);
      return derivePlantHealthStatus(diags) === 'needs_attention';
    });

    const monitoringPlants = plants.filter((p) => {
      const diags = diagnoses.filter((d) => d.userPlantId === p.id);
      return derivePlantHealthStatus(diags) === 'monitoring';
    });

    const groundedFacts: string[] = [
      `Total plants: ${plants.length}`,
      `Needs attention: ${attentionPlants.length}`,
      `Monitoring: ${monitoringPlants.length}`,
    ];

    let answer = '';
    if (attentionPlants.length === 0 && monitoringPlants.length === 0) {
      answer = 'None of your garden plants are currently flagged as needing attention or active monitoring. All recorded health assessments appear stable.';
    } else {
      const parts: string[] = [];
      if (attentionPlants.length > 0) {
        parts.push(
          `The following plant(s) require prompt attention: ${attentionPlants.map((p) => p.nickname).join(', ')}.`
        );
      }
      if (monitoringPlants.length > 0) {
        parts.push(
          `The following plant(s) are currently under observation/monitoring: ${monitoringPlants.map((p) => p.nickname).join(', ')}.`
        );
      }
      answer = parts.join(' ');
    }

    const relevantActions = actions.filter((a) => a.category === 'health');

    return {
      query: rawQuery,
      intent: 'health_status_query',
      answer,
      confidence: 'high',
      groundedFacts,
      suggestedActions: relevantActions.slice(0, 3),
      source: 'deterministic',
    };
  }

  // 2. Intent: "Why is my [plant] being monitored / needing attention?"
  const monitoredMatch = plants.find((p) => query.includes(p.nickname.toLowerCase()) || query.includes(p.plantSlug.toLowerCase()));
  if (monitoredMatch && (query.includes('why') || query.includes('status') || query.includes('condition') || query.includes('monitored'))) {
    const pDiags = diagnoses.filter((d) => d.userPlantId === monitoredMatch.id);
    const health = derivePlantHealthStatus(pDiags);
    const latestDiag = pDiags[pDiags.length - 1];

    const groundedFacts: string[] = [
      `Plant: ${monitoredMatch.nickname}`,
      `Derived health status: ${health}`,
    ];

    let answer = '';
    if (!latestDiag) {
      answer = `${monitoredMatch.nickname} has no recorded health diagnoses or scans on file. Its status is currently marked as unknown.`;
    } else {
      const topCand = latestDiag.candidates?.[0];
      const followUps = latestDiag.followUps || [];
      const latestOutcome = followUps[followUps.length - 1]?.outcomeStatus || 'no follow-up';

      groundedFacts.push(`Last diagnosis: ${latestDiag.createdAt.split('T')[0]}`);
      if (topCand) groundedFacts.push(`Observed issue: ${topCand.conditionName}`);
      groundedFacts.push(`Latest follow-up outcome: ${latestOutcome}`);

      answer = `${monitoredMatch.nickname} is currently evaluated as "${health}". On ${latestDiag.createdAt.split('T')[0]}, symptoms were logged (${topCand ? topCand.conditionName : 'unspecified'}). The latest recorded follow-up observation was "${latestOutcome}".`;
    }

    const relevantActions = actions.filter((a) => a.plantId === monitoredMatch.id);

    return {
      query: rawQuery,
      intent: 'plant_specific_inquiry',
      answer,
      confidence: 'high',
      groundedFacts,
      suggestedActions: relevantActions,
      source: 'deterministic',
    };
  }

  // 3. Intent: "What should I do today?" / "What is next?"
  if (
    query.includes('what should i do') ||
    query.includes('what to do') ||
    query.includes('today') ||
    query.includes('next action')
  ) {
    const highPriorityActions = actions.filter((a) => a.priority === 'critical' || a.priority === 'high');
    const groundedFacts: string[] = [
      `Total prioritized actions: ${actions.length}`,
      `Critical actions: ${actions.filter((a) => a.priority === 'critical').length}`,
      `High priority actions: ${highPriorityActions.length}`,
    ];

    let answer = '';
    if (actions.length === 0) {
      answer = 'Nothing requires your attention right now. Your garden records and care schedules are completely up to date.';
    } else {
      const top = actions[0];
      answer = `The most useful next action is: "${top.title}". ${top.explanation} Recommended action: ${top.recommendedAction}`;
    }

    return {
      query: rawQuery,
      intent: 'next_action_query',
      answer,
      confidence: 'high',
      groundedFacts,
      suggestedActions: actions.slice(0, 3),
      source: 'deterministic',
    };
  }

  // 4. Intent: "Which crops produced the most historically?" / "Harvest yields"
  if (
    query.includes('harvest') ||
    query.includes('produced the most') ||
    query.includes('yield') ||
    query.includes('crop performance')
  ) {
    if (harvests.length === 0) {
      return {
        query: rawQuery,
        intent: 'harvest_analytics_query',
        answer: 'Insufficient recorded data: Zero harvest records have been logged in your garden yet.',
        confidence: 'high',
        groundedFacts: ['Harvest records logged: 0'],
        suggestedActions: actions.filter((a) => a.category === 'production'),
        source: 'deterministic',
      };
    }

    // Group harvests by plant nickname
    const yieldsByPlant: Record<string, { totalGrams: number; events: number }> = {};
    for (const h of harvests) {
      const p = plants.find((plant) => plant.id === h.plantId);
      const name = p?.nickname || h.unit || 'Crop';
      if (!yieldsByPlant[name]) {
        yieldsByPlant[name] = { totalGrams: 0, events: 0 };
      }
      yieldsByPlant[name].events += 1;
      if (h.unit === 'g') yieldsByPlant[name].totalGrams += h.quantity;
      else if (h.unit === 'kg') yieldsByPlant[name].totalGrams += h.quantity * 1000;
      else yieldsByPlant[name].totalGrams += h.quantity; // Default
    }

    const sorted = Object.entries(yieldsByPlant).sort((a, b) => b[1].totalGrams - a[1].totalGrams);
    const top = sorted[0];

    const groundedFacts = sorted.map(
      ([name, stat]) => `${name}: ${stat.totalGrams}g across ${stat.events} recorded harvest(s)`
    );

    const answer = `Based on historical records, your highest-producing crop is ${top[0]} with a total of ${top[1].totalGrams}g across ${top[1].events} harvest event(s). Note that historical yield does not guarantee future production.`;

    return {
      query: rawQuery,
      intent: 'harvest_analytics_query',
      answer,
      confidence: 'high',
      groundedFacts,
      suggestedActions: actions.filter((a) => a.category === 'production'),
      source: 'deterministic',
    };
  }

  // 5. Intent: "What information am I missing?" / "Data quality"
  if (
    query.includes('missing') ||
    query.includes('data quality') ||
    query.includes('completeness') ||
    query.includes('unrecorded')
  ) {
    const missing = gardenState.dataQuality.missingCriticalData;
    const score = gardenState.dataQuality.completenessScore;

    const groundedFacts: string[] = [
      `Record completeness score: ${score}%`,
      `Missing items identified: ${missing.length}`,
    ];

    let answer = '';
    if (missing.length === 0) {
      answer = `Your garden record is ${score}% complete with no critical data gaps detected.`;
    } else {
      answer = `Your garden record is ${score}% complete. The following information would make future recommendations more useful: ${missing.join('; ')}. Note that record completeness measures logged data, not plant health.`;
    }

    return {
      query: rawQuery,
      intent: 'data_quality_query',
      answer,
      confidence: 'high',
      groundedFacts,
      suggestedActions: actions.filter((a) => a.category === 'data_quality'),
      source: 'deterministic',
    };
  }

  // Default Fallback
  return {
    query: rawQuery,
    intent: 'general_garden_summary',
    answer: `Your garden contains ${gardenState.plants.total} plant(s) with ${gardenState.care.overdue} overdue care task(s) and ${gardenState.health.activeConcerns} active health concern(s). ${actions.length > 0 ? `Top recommended action: "${actions[0].title}".` : 'No urgent actions are pending.'}`,
    confidence: 'moderate',
    groundedFacts: [
      `Total plants: ${gardenState.plants.total}`,
      `Active concerns: ${gardenState.health.activeConcerns}`,
      `Overdue care: ${gardenState.care.overdue}`,
    ],
    suggestedActions: actions.slice(0, 2),
    source: 'deterministic',
  };
}

