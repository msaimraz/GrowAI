/**
 * GrowAI Phase 12: Grower Copilot Intent Classifier
 * Deterministically classifies user inquiries into strongly typed CopilotIntents
 * and resolves targeted plant entities (including conversational pronouns).
 */

import { CopilotIntent } from '@/types/grower-copilot';
import { UserPlant } from '@/types/garden';
import { PLANTS_DATA } from '@/data/plants';

export interface IntentClassificationResult {
  intent: CopilotIntent;
  targetPlantId?: string | null;
  targetPlantNickname?: string | null;
  activePlantSlug?: string | null;
  confidence: 'high' | 'moderate' | 'low';
}

interface ClassifyParams {
  query: string;
  activePlantId?: string | null;
  activePlantNickname?: string | null;
  activePlantSlug?: string | null;
  plants?: UserPlant[];
}

export function classifyCopilotIntent(params: ClassifyParams): IntentClassificationResult {
  const { query, activePlantId, activePlantNickname, activePlantSlug, plants = [] } = params;
  const q = query.trim().toLowerCase();

  // 1. Plant Target & Pronoun Resolution
  let resolvedPlantId: string | null = activePlantId || null;
  let resolvedPlantNickname: string | null = activePlantNickname || null;
  let resolvedPlantSlug: string | null = activePlantSlug || null;

  const GENERIC_WORDS = new Set([
    'plant',
    'plants',
    'bean',
    'bush',
    'leaf',
    'leaves',
    'herb',
    'herbs',
    'sweet',
    'french',
    'west',
    'king',
    'grow',
    'crop',
  ]);

  // If no activePlantSlug was provided, or if the user mentions another specific plant full name
  if (!resolvedPlantSlug) {
    for (const bp of PLANTS_DATA) {
      const common = bp.commonName.toLowerCase();
      const slug = bp.slug.toLowerCase().replace(/-/g, ' ');
      const commonWords = common
        .replace(/[^\w\s-]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length >= 4 && !GENERIC_WORDS.has(w.toLowerCase()));

      const matchesSpecificWord = commonWords.some((w) => {
        const cleanWord = w.replace(/[^\w-]/g, '');
        if (!cleanWord) return false;
        const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
        return regex.test(q);
      });

      if (q.includes(common) || q.includes(slug) || matchesSpecificWord) {
        resolvedPlantSlug = bp.slug;
        if (!resolvedPlantNickname) resolvedPlantNickname = bp.commonName;
        if (!resolvedPlantId) resolvedPlantId = bp.id;
        break;
      }
    }
  }

  // If resolvedPlantSlug is active, populate botanical metadata
  if (resolvedPlantSlug && (!resolvedPlantNickname || !resolvedPlantId)) {
    const bp = PLANTS_DATA.find((p) => p.slug === resolvedPlantSlug);
    if (bp) {
      if (!resolvedPlantNickname) resolvedPlantNickname = bp.commonName;
      if (!resolvedPlantId) resolvedPlantId = bp.id;
    }
  }

  // Search if a specific user plant nickname or slug is explicitly mentioned in the query
  for (const plant of plants) {
    const nick = (plant.nickname || '').toLowerCase();
    const slug = (plant.plantSlug || '').toLowerCase().replace(/-/g, ' ');
    const nickWords: string[] = nick
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length >= 3);
    const slugWords: string[] = slug
      .replace(/[^\w\s-]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length >= 3);

    if ((nick && q.includes(nick)) || (slug && q.includes(slug))) {
      resolvedPlantId = plant.id;
      resolvedPlantNickname = plant.nickname;
      resolvedPlantSlug = plant.plantSlug;
      break;
    }

    // Keyword match on distinctive nickname or slug words (e.g. "basil", "mint", "tomato")
    const matchesWord = [...nickWords, ...slugWords].some((word: string) => {
      const cleanWord = word.replace(/[^\w-]/g, '');
      if (!cleanWord) return false;
      const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');
      return regex.test(q);
    });

    const queryWords = q.split(/\s+/).filter((w: string) => w.length >= 4);
    const queryMatchesSlug = queryWords.some((qw: string) => slug.includes(qw) || nick.includes(qw));

    if (matchesWord || queryMatchesSlug) {
      resolvedPlantId = plant.id;
      resolvedPlantNickname = plant.nickname;
      resolvedPlantSlug = plant.plantSlug;
      break;
    }
  }

  // Check for pronoun context ("its", "it", "this plant", "the plant")
  const isPlantScopedByPronoun =
    /\b(it|its|this plant|that plant|the plant|this crop)\b/i.test(q) && Boolean(resolvedPlantId || resolvedPlantSlug);

  const hasTargetPlant = Boolean(resolvedPlantId);

  // 2. Next Best Action & Urgent Priority
  if (
    q.includes('what should i do now') ||
    q.includes('what should i do next') ||
    q.includes('next best action') ||
    q.includes('what to do now')
  ) {
    return {
      intent: 'next_best_action',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 3. Why Recommendation
  if (
    q.includes('why is this recommendation') ||
    q.includes('why was this recommended') ||
    q.includes('why is this action') ||
    q.includes('reason for recommendation')
  ) {
    return {
      intent: 'why_recommendation',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 4. Daily Grow Check & Today Priorities
  if (
    q.includes('what needs my attention today') ||
    q.includes('what needs attention today') ||
    q.includes('attention today') ||
    q.includes('today priorities') ||
    q.includes('what should i focus on today') ||
    q.includes('what should i check') ||
    q.includes('check on my plants') ||
    q.includes('focus on today') ||
    q.includes('daily grow check')
  ) {
    return {
      intent: q.includes('check') ? 'daily_grow_check' : 'today_priorities',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 5. Data Quality & Missing Data
  if (
    q.includes('what information is missing') ||
    q.includes('what am i missing') ||
    q.includes('missing data') ||
    q.includes('data quality') ||
    q.includes('record completeness')
  ) {
    return {
      intent: 'missing_data',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 6. Recent Changes & Timeline
  if (
    q.includes('what changed since my last observation') ||
    q.includes('what changed recently') ||
    q.includes('recent changes') ||
    q.includes('what changed')
  ) {
    return {
      intent: 'recent_changes',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (q.includes('timeline') || q.includes('journal history') || q.includes('chronological')) {
    return {
      intent: hasTargetPlant ? 'plant_timeline' : 'historical_events',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 7. Feeding & Nutrition
  if (
    q.includes('feed') ||
    q.includes('fertiliz') ||
    q.includes('nutrient') ||
    q.includes('npk') ||
    q.includes('last fed') ||
    q.includes('when did i last feed') ||
    q.includes('feeding history')
  ) {
    return {
      intent: hasTargetPlant ? 'plant_feeding' : 'feeding_history',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 8. Growing Conditions & Environment
  if (
    q.includes('incomplete growing-condition') ||
    q.includes('missing condition') ||
    q.includes('unrecorded condition')
  ) {
    return {
      intent: 'missing_conditions',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('what conditions have i actually recorded') ||
    q.includes('what conditions have i recorded') ||
    q.includes('recorded conditions') ||
    q.includes('temperature') ||
    q.includes('humidity') ||
    q.includes('airflow') ||
    q.includes('soil moisture') ||
    q.includes('environment')
  ) {
    return {
      intent: hasTargetPlant ? 'plant_conditions' : 'condition_history',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 9. Health & Diagnostics
  if (
    q.includes('what health follow-ups are overdue') ||
    q.includes('overdue follow-up') ||
    q.includes('follow-up overdue')
  ) {
    return {
      intent: 'follow_up_status',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('why is my basil marked as needing attention') ||
    q.includes('why is it marked as needing attention') ||
    q.includes('why is it being monitored') ||
    q.includes('why is this being monitored') ||
    q.includes('why is this plant monitored') ||
    (hasTargetPlant && (q.includes('health') || q.includes('monitored') || q.includes('needing attention') || q.includes('sick')))
  ) {
    return {
      intent: 'plant_health',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('which plants are currently being monitored') ||
    q.includes('which plants are monitored') ||
    q.includes('plants being monitored') ||
    q.includes('which plants need attention')
  ) {
    return {
      intent: 'current_health',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 10. Production, Cycles & Harvest
  if (
    q.includes('which crop cycle performed better') ||
    q.includes('compare cycle') ||
    q.includes('cycle comparison')
  ) {
    return {
      intent: 'cycle_comparison',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('show me my recent harvests') ||
    q.includes('recent harvests') ||
    q.includes('harvest history') ||
    q.includes('harvest records') ||
    q.includes('past harvests') ||
    q.includes('yield') ||
    q.includes('how much harvested')
  ) {
    return {
      intent: hasTargetPlant ? 'plant_production' : 'harvest_history',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 11. Propagation & Lineage
  if (
    q.includes('which plants have propagation history') ||
    q.includes('propagation history') ||
    q.includes('propagate') ||
    q.includes('cuttings') ||
    q.includes('lineage') ||
    q.includes('offspring') ||
    q.includes('mother plant')
  ) {
    return {
      intent: hasTargetPlant ? 'plant_propagation' : 'propagation_history',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 12. Plant Status & History
  if (
    hasTargetPlant &&
    (q.includes('how is this plant doing') ||
      q.includes('how is it doing') ||
      q.includes('status') ||
      q.includes('how has this plant been doing') ||
      q.includes('plant summary'))
  ) {
    return {
      intent: 'plant_status',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 13. Grow Plan Intents (Phase 13)
  if (
    q.includes('create plan') ||
    q.includes('create a plan') ||
    q.includes('start a plan') ||
    q.includes('new grow plan') ||
    q.includes('generate plan')
  ) {
    return {
      intent: 'create_grow_plan',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('resume plan') ||
    q.includes('resume the plan') ||
    q.includes('unpause plan') ||
    q.includes('unpause the plan') ||
    q.includes('unpause my plan')
  ) {
    return {
      intent: 'resume_grow_plan',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    !q.includes('unpause') &&
    (q.includes('pause plan') ||
      q.includes('pause the plan') ||
      q.includes('pause my plan'))
  ) {
    return {
      intent: 'pause_grow_plan',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('complete step') ||
    q.includes('mark step complete') ||
    q.includes('mark this step complete') ||
    q.includes('step complete') ||
    q.includes('finish step') ||
    q.includes('done with step')
  ) {
    return {
      intent: 'complete_plan_step',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  if (
    q.includes('plan status') ||
    q.includes('how is the plan') ||
    q.includes('plan progress') ||
    q.includes('grow plan') ||
    q.includes('current plan') ||
    q.includes('my plan') ||
    q.includes('what is the plan') ||
    q.includes('active plan')
  ) {
    return {
      intent: 'view_grow_plan',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 14. Space & Structural Safety
  if (
    q.includes('can i plant') ||
    q.includes('space') ||
    q.includes('capacity') ||
    q.includes('rack capacity') ||
    q.includes('space utilization') ||
    q.includes('structural load') ||
    q.includes('is the rack safe') ||
    q.includes('shelf capacity')
  ) {
    return {
      intent: 'space_advisory',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      confidence: 'high',
    };
  }

  // 14. Garden Overview / Summary
  if (
    q.includes('tell me about my garden') ||
    q.includes('garden summary') ||
    q.includes('how is my garden') ||
    q.includes('garden overview') ||
    q.includes('overview')
  ) {
    return {
      intent: 'garden_summary',
      targetPlantId: null,
      targetPlantNickname: null,
      confidence: 'high',
    };
  }

  // 14.5 Botanical & Species-Specific (Ask Your Plant)
  const isBotanicalScoped =
    Boolean(resolvedPlantSlug) || Boolean(activePlantSlug) || isPlantScopedByPronoun || Boolean(resolvedPlantNickname);

  // A. Sunlight / Lighting / Exposure
  if (
    q.includes('sunlight') ||
    q.includes('sun') ||
    q.includes('light') ||
    q.includes('shade') ||
    q.includes('dark') ||
    q.includes('window') ||
    q.includes('windowsill') ||
    q.includes('bright') ||
    q.includes('direct sun') ||
    q.includes('indirect light')
  ) {
    if (isBotanicalScoped || q.includes('plant') || q.includes('grow')) {
      return {
        intent: 'botanical_sunlight',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // B. Water / Watering / Missed watering / Drought stress
  if (
    q.includes('water') ||
    q.includes('wet') ||
    q.includes('dry') ||
    q.includes('hydrate') ||
    q.includes('moisture') ||
    q.includes('thirst') ||
    q.includes('drought')
  ) {
    if (isBotanicalScoped || q.includes('plant') || q.includes('soil')) {
      return {
        intent: 'botanical_watering',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // C. Leaf symptoms / Problems / Yellow leaves / Pests / Disease
  if (
    q.includes('yellow') ||
    q.includes('leaves') ||
    q.includes('leaf') ||
    q.includes('brown') ||
    q.includes('wilt') ||
    q.includes('pest') ||
    q.includes('bug') ||
    q.includes('rot') ||
    q.includes('blight') ||
    q.includes('problem') ||
    q.includes('sick') ||
    q.includes('dying') ||
    q.includes('spot') ||
    q.includes('look for on its leaves')
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_problems',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // D. Medicinal / Health / Toxicity / Traditional uses / Safety
  if (
    /\b(medicin|medicinal|cure|treat|treatment|remedy|health|illness|disease|toxic|toxicity|poison|safe|safety|pet safe|herbal)\b/i.test(
      q
    )
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_medicinal',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // E. Practical / Culinary / Cooking / Benefits / Uses
  if (
    /\b(benefit|benefits|use|uses|used for|cook|cooking|culinary|eat|eating|edible|nutrition|recipe|tea|taste|flavor|flavour)\b/i.test(
      q
    )
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_benefits',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // F. Harvest / When to pick / Maturity
  if (
    q.includes('harvest') ||
    q.includes('ready to harvest') ||
    q.includes('pick') ||
    q.includes('when to pick') ||
    q.includes('ripe')
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_harvest',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // G. Soil / Potting / Container / Depth / pH
  if (
    q.includes('soil') ||
    q.includes('potting') ||
    q.includes('pot') ||
    q.includes('container') ||
    q.includes('depth') ||
    q.includes('drainage') ||
    q.includes('substrate') ||
    q.includes('ph')
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_soil_ph',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // H. Growth Guide / Temperature / Humidity / How to grow successfully
  if (
    q.includes('how do i grow') ||
    q.includes('how to grow') ||
    q.includes('grow better') ||
    q.includes('care') ||
    q.includes('temperature') ||
    q.includes('humidity') ||
    q.includes('indoor') ||
    q.includes('balcony') ||
    q.includes('grow it') ||
    q.includes('help it grow')
  ) {
    if (isBotanicalScoped || q.includes('plant')) {
      return {
        intent: 'botanical_growth_guide',
        targetPlantId: resolvedPlantId,
        targetPlantNickname: resolvedPlantNickname,
        activePlantSlug: resolvedPlantSlug,
        confidence: 'high',
      };
    }
  }

  // I. General inquiry scoped to a botanical plant
  if (isBotanicalScoped) {
    return {
      intent: 'botanical_general',
      targetPlantId: resolvedPlantId,
      targetPlantNickname: resolvedPlantNickname,
      activePlantSlug: resolvedPlantSlug,
      confidence: 'moderate',
    };
  }

  // 15. Unsupported Fallback
  return {
    intent: 'unsupported',
    targetPlantId: resolvedPlantId,
    targetPlantNickname: resolvedPlantNickname,
    confidence: 'low',
  };
}

/**
 * Universal classifier supporting conversation history and returning plant targets.
 */
export function classifyIntent(
  query: string,
  plants: UserPlant[] = [],
  conversationHistory: { role: string; content: string }[] = [],
  activePlant?: UserPlant | null
): IntentClassificationResult & { targetPlant?: UserPlant } {
  let inferredPlant = activePlant;
  if (!inferredPlant && conversationHistory.length > 0) {
    const recentAssistant = conversationHistory.filter((m) => m.role === 'assistant').slice(-2);
    const recentUser = conversationHistory.filter((m) => m.role === 'user').slice(-2);
    const recentText = [...recentUser, ...recentAssistant].map((m) => m.content).join(' ').toLowerCase();
    for (const p of plants) {
      const nick = (p.nickname || '').toLowerCase();
      const slug = (p.plantSlug || '').toLowerCase();
      if ((nick && recentText.includes(nick)) || (slug && recentText.includes(slug))) {
        inferredPlant = p;
        break;
      }
    }
  }

  const result = classifyCopilotIntent({
    query,
    plants,
    activePlantId: inferredPlant?.id,
    activePlantNickname: inferredPlant?.nickname,
  });

  const matchedPlant = plants.find((p) => p.id === result.targetPlantId) || inferredPlant || undefined;
  return {
    ...result,
    targetPlant: matchedPlant,
  };
}
