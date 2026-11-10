/**
 * GrowAI Daily Plant Check Engine
 * Context-aware, plant-specific, non-repetitive daily questions and habit-building progress.
 */

import { UserPlant, GrowthStage } from '@/types/garden';
import { Plant } from '@/types/plant';
import { PLANTS_DATA } from '@/data/plants';

export type CheckCategory =
  | 'Growth'
  | 'Leaves'
  | 'Light'
  | 'Water'
  | 'Health'
  | 'Flowering'
  | 'Harvest'
  | 'Pests';

export interface DailyCheckRecord {
  id: string;
  plantId: string;
  plantName: string;
  plantSlug: string;
  questionId: string;
  questionText: string;
  category: CheckCategory;
  selectedAnswer: 'good' | 'different' | 'unsure';
  noticedDetail?: string | null;
  timestamp: string;
  date: string; // YYYY-MM-DD
}

export interface GeneratedQuestion {
  id: string;
  category: CheckCategory;
  icon: string;
  text: string;
  guidanceTip: string;
}

// -----------------------------------------------------------------------------
// LOCAL TIMEZONE & CALENDAR DATE HELPERS
// -----------------------------------------------------------------------------

export function getLocalTodayDateStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// -----------------------------------------------------------------------------
// STORAGE HELPER (Browser + Universal/Test Safe)
// -----------------------------------------------------------------------------

function getStorage(): Storage | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof globalThis !== 'undefined' && (globalThis as any).localStorage) {
    return (globalThis as any).localStorage;
  }
  return null;
}

// -----------------------------------------------------------------------------
// CONTEXT-AWARE QUESTION GENERATION RULES
// -----------------------------------------------------------------------------

interface QuestionRule {
  id: string;
  category: CheckCategory;
  icon: string;
  isEligible: (plant: UserPlant, catalog?: Plant) => boolean;
  generateText: (plantName: string, catalog?: Plant) => string;
  guidanceTip: string;
}

const QUESTION_RULES: QuestionRule[] = [
  // 1. Water Check (Eligible for all active stages)
  {
    id: 'water_moisture_check',
    category: 'Water',
    icon: '💧',
    isEligible: (plant) => plant.currentStage !== 'Harvested',
    generateText: (name) => `Does the soil feel dry when you touch the top inch of ${name}'s pot today?`,
    guidanceTip: 'Poke a clean finger 2–3 cm into the soil. If it feels cool and moist, no water is needed today.',
  },

  // 2. Growth Check — Seed / Germination
  {
    id: 'seed_sprout_emergence',
    category: 'Growth',
    icon: '🌱',
    isEligible: (plant) => plant.currentStage === 'Seed' || plant.currentStage === 'Germination',
    generateText: (name) => `Have you spotted any tiny green sprouts breaking through the soil for ${name}?`,
    guidanceTip: 'Keep the surface evenly moist with a gentle mister until the first shoot emerges.',
  },

  // 3. Growth Check — Seedling / Growing
  {
    id: 'new_leaves_growth',
    category: 'Growth',
    icon: '🌱',
    isEligible: (plant) => plant.currentStage === 'Seedling' || plant.currentStage === 'Growing',
    generateText: (name) => `Have you noticed any fresh new leaves forming on ${name} this week?`,
    guidanceTip: 'New leaf tips are usually a lighter, brighter green than older mature leaves.',
  },

  // 4. Leaves & Foliage Check (Requires seedling or beyond)
  {
    id: 'leaves_color_texture',
    category: 'Leaves',
    icon: '🍃',
    isEligible: (plant) =>
      plant.currentStage === 'Seedling' ||
      plant.currentStage === 'Growing' ||
      plant.currentStage === 'Mature',
    generateText: (name) => `Are ${name}'s leaves looking vibrant, firm and healthy today?`,
    guidanceTip: 'Firm, upright leaves indicate proper cell turgor and balanced hydration.',
  },

  // 5. Sunlight & Light Check (Requires above-ground leaves)
  {
    id: 'light_orientation_check',
    category: 'Light',
    icon: '☀️',
    isEligible: (plant) =>
      plant.currentStage === 'Seedling' ||
      plant.currentStage === 'Growing' ||
      plant.currentStage === 'Mature',
    generateText: (name) => `Are ${name}'s leaves comfortably reaching toward the light without stretching or leaning?`,
    guidanceTip: 'If your plant is stretching tall and pale with wide spacing between leaves, it may need a brighter spot.',
  },

  // 6. Pest & Underside Inspection
  {
    id: 'pest_underside_inspect',
    category: 'Pests',
    icon: '🐛',
    isEligible: (plant) => plant.currentStage === 'Growing' || plant.currentStage === 'Mature',
    generateText: (name) => `Have you peeked underneath ${name}'s lower leaves for any tiny insects or webbing?`,
    guidanceTip: 'Pests love to hide on the undersides of leaves where it is sheltered and humid.',
  },

  // 7. Health & Spot Inspection
  {
    id: 'health_spots_inspection',
    category: 'Health',
    icon: '🔍',
    isEligible: (plant) => plant.currentStage === 'Growing' || plant.currentStage === 'Mature',
    generateText: (name) => `Have you spotted any unusual brown marks, yellow halos, or blemishes on ${name}?`,
    guidanceTip: 'Early detection makes caring for any plant issue simple and stress-free.',
  },

  // 8. Harvest Readiness — Mature Leafy Greens & Herbs
  {
    id: 'harvest_leafy_greens',
    category: 'Harvest',
    icon: '✂️',
    isEligible: (plant, catalog) => {
      if (plant.currentStage !== 'Mature' && plant.currentStage !== 'Growing') return false;
      const isLeafyOrHerb =
        catalog?.category === 'herbs-greens' ||
        plant.plantSlug.includes('basil') ||
        plant.plantSlug.includes('lettuce') ||
        plant.plantSlug.includes('spinach') ||
        plant.plantSlug.includes('mint') ||
        plant.plantSlug.includes('coriander');
      return Boolean(isLeafyOrHerb);
    },
    generateText: (name) => `Are the outer leaves on ${name} looking lush and ready for a gentle kitchen pinch?`,
    guidanceTip: 'Always harvest the outer, mature leaves first so the center crown continues producing new growth.',
  },

  // 9. Harvest Readiness — Fruiting Tomatoes
  {
    id: 'harvest_fruiting_tomatoes',
    category: 'Harvest',
    icon: '🍅',
    isEligible: (plant) => {
      const isTomato = plant.plantSlug.includes('tomato');
      return isTomato && (plant.currentStage === 'Mature' || plant.currentStage === 'Growing');
    },
    generateText: (name) => `Are any tomatoes on ${name} beginning to blush with red or orange color?`,
    guidanceTip: 'Tomatoes develop their richest, sweetest flavor when allowed to ripen directly on the vine in warm sunlight.',
  },

  // 10. Flowering Observation — Flowering varieties or Mature Herbs
  {
    id: 'flowering_bud_check',
    category: 'Flowering',
    icon: '🌸',
    isEligible: (plant, catalog) => {
      if (plant.currentStage !== 'Growing' && plant.currentStage !== 'Mature') return false;
      const isFlowering =
        catalog?.category === 'flowering' ||
        plant.plantSlug.includes('marigold') ||
        plant.plantSlug.includes('zinnia');
      return Boolean(isFlowering);
    },
    generateText: (name) => `Are any flower buds starting to show color or swell on ${name}?`,
    guidanceTip: 'Bright morning light and consistent moisture help flower buds open into vibrant blooms.',
  },

  // 11. Post-Harvest & Succession Sowing
  {
    id: 'post_harvest_reflection',
    category: 'Harvest',
    icon: '🌾',
    isEligible: (plant) => plant.currentStage === 'Harvested',
    generateText: (name) => `Are you ready to celebrate ${name}'s harvest and refresh the soil for your next plant?`,
    guidanceTip: 'After harvesting, replenish container soil with organic compost or start succession seeds.',
  },
];

// -----------------------------------------------------------------------------
// QUESTION SELECTOR WITH RECENT MEMORY & ROTATION
// -----------------------------------------------------------------------------

const RECENT_QUESTIONS_KEY = 'growai_recent_questions_v2';

export function getRecentQuestionIds(): string[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(RECENT_QUESTIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordRecentQuestionId(questionId: string) {
  const storage = getStorage();
  if (!storage) return;
  try {
    const recents = getRecentQuestionIds();
    const updated = [questionId, ...recents.filter((id) => id !== questionId)].slice(0, 5);
    storage.setItem(RECENT_QUESTIONS_KEY, JSON.stringify(updated));
  } catch {}
}

export function generateDailyQuestionForPlant(
  plant: UserPlant,
  catalogPlant?: Plant,
  dateStr?: string
): GeneratedQuestion {
  const catalog = catalogPlant || PLANTS_DATA.find((p) => p.slug === plant.plantSlug);
  const eligibleRules = QUESTION_RULES.filter((rule) => rule.isEligible(plant, catalog));

  const validRules = eligibleRules.length > 0 ? eligibleRules : [QUESTION_RULES[0]];

  const recentIds = getRecentQuestionIds();
  const nonRecentRules = validRules.filter((r) => !recentIds.includes(r.id));
  const candidateRules = nonRecentRules.length > 0 ? nonRecentRules : validRules;

  // Use day of year + plant seed to deterministically rotate across candidates
  const refDate = dateStr ? new Date(dateStr) : new Date();
  const start = new Date(refDate.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((refDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  let plantHash = 0;
  const hashKey = plant.id || plant.plantSlug || '';
  for (let i = 0; i < hashKey.length; i++) {
    plantHash = ((plantHash << 5) - plantHash + hashKey.charCodeAt(i)) | 0;
  }
  const seed = Math.abs(dayOfYear + plantHash);

  const chosenRule = candidateRules[seed % candidateRules.length];
  const plantDisplayName = plant.nickname || catalog?.commonName || 'your plant';

  return {
    id: chosenRule.id,
    category: chosenRule.category,
    icon: chosenRule.icon,
    text: chosenRule.generateText(plantDisplayName, catalog),
    guidanceTip: chosenRule.guidanceTip,
  };
}

// -----------------------------------------------------------------------------
// PERSISTENCE & GARDEN HABIT PROGRESS
// -----------------------------------------------------------------------------

const DAILY_CHECKS_STORAGE_KEY = 'growai_daily_check_records_v1';

export function getStoredDailyChecks(): DailyCheckRecord[] {
  const storage = getStorage();
  if (!storage) return [];
  try {
    const raw = storage.getItem(DAILY_CHECKS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveDailyCheckRecord(record: DailyCheckRecord): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    const all = getStoredDailyChecks();
    // Replace if record for same plant and date exists (idempotent / update)
    const filtered = all.filter(
      (r) => !(r.plantId === record.plantId && r.date === record.date)
    );
    filtered.push(record);
    storage.setItem(DAILY_CHECKS_STORAGE_KEY, JSON.stringify(filtered));

    // Record question as recently shown
    recordRecentQuestionId(record.questionId);
  } catch (err) {
    console.error('Failed to save daily check record:', err);
  }
}

export function getDailyCheckForPlant(
  plantId: string,
  dateStr?: string
): DailyCheckRecord | null {
  const targetDate = dateStr || getLocalTodayDateStr();
  const all = getStoredDailyChecks();
  return (
    all.find((r) => r.plantId === plantId && r.date === targetDate) || null
  );
}

export function deleteDailyCheckForPlant(plantId: string, dateStr?: string): void {
  const storage = getStorage();
  if (!storage) return;
  const targetDate = dateStr || getLocalTodayDateStr();
  try {
    const all = getStoredDailyChecks();
    const updated = all.filter(
      (r) => !(r.plantId === plantId && r.date === targetDate)
    );
    storage.setItem(DAILY_CHECKS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
}

export function getTodayGardenCheckProgress(
  userPlants: UserPlant[],
  dateStr?: string
): {
  checkedCount: number;
  totalCount: number;
  percentage: number;
  isAllChecked: boolean;
  checkedPlantIds: string[];
} {
  const targetDate = dateStr || getLocalTodayDateStr();
  const allChecks = getStoredDailyChecks();
  const todayChecks = allChecks.filter((r) => r.date === targetDate);

  const checkedPlantIds = userPlants
    .filter((p) => todayChecks.some((c) => c.plantId === p.id))
    .map((p) => p.id);

  const checkedCount = checkedPlantIds.length;
  const totalCount = userPlants.length;
  const percentage = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  return {
    checkedCount,
    totalCount,
    percentage,
    isAllChecked: totalCount > 0 && checkedCount >= totalCount,
    checkedPlantIds,
  };
}

// -----------------------------------------------------------------------------
// SERIALIZATION & RECONSTRUCTION (SUPABASE / CLOUD DUAL-MODE)
// -----------------------------------------------------------------------------

export function formatDailyCheckNoteText(record: DailyCheckRecord): string {
  let humanSummary = '';
  if (record.selectedAnswer === 'good') {
    humanSummary = 'Daily check: Everything looks happy and healthy.';
  } else if (record.selectedAnswer === 'different') {
    humanSummary = record.noticedDetail
      ? `Daily check observation: Noticed something different with ${record.noticedDetail.toLowerCase()}.`
      : 'Daily check observation: Noticed something different.';
  } else {
    humanSummary = 'Daily check: Unsure about current appearance; keeping an eye on it.';
  }

  const meta = {
    qid: record.questionId,
    cat: record.category,
    ans: record.selectedAnswer,
    det: record.noticedDetail || null,
    ts: record.timestamp,
    q: record.questionText,
  };
  return `${humanSummary} <!--dc:${JSON.stringify(meta)}-->`;
}

export function reconstructDailyCheckFromGrowthNote(
  plant: UserPlant,
  note: { date: string; text: string; id?: string }
): DailyCheckRecord | null {
  if (!note || !note.text) return null;

  // Match structured metadata comment
  const match = note.text.match(/<!--dc:(\{.*?\})-->/);
  if (match) {
    try {
      const meta = JSON.parse(match[1]);
      return {
        id: `check-${plant.id}-${note.date}`,
        plantId: plant.id,
        plantName: plant.nickname,
        plantSlug: plant.plantSlug,
        questionId: meta.qid,
        questionText: meta.q || 'Daily Plant Check',
        category: meta.cat,
        selectedAnswer: meta.ans,
        noticedDetail: meta.det || null,
        timestamp: meta.ts || `${note.date}T12:00:00.000Z`,
        date: note.date,
      };
    } catch {}
  }

  // Fallback: parse plain text if no structured comment
  if (note.text.startsWith('Daily check')) {
    const isDifferent = note.text.includes('Noticed something different');
    const isGood = note.text.includes('happy and healthy');
    const isUnsure = note.text.includes('Unsure');
    const ans = isGood ? 'good' : isDifferent ? 'different' : isUnsure ? 'unsure' : 'good';

    let detail: string | null = null;
    if (isDifferent) {
      const detailMatch = note.text.match(/different with ([^.]+)/i);
      if (detailMatch) {
        detail = detailMatch[1].trim();
        detail = detail.charAt(0).toUpperCase() + detail.slice(1);
      }
    }

    return {
      id: `check-${plant.id}-${note.date}`,
      plantId: plant.id,
      plantName: plant.nickname,
      plantSlug: plant.plantSlug,
      questionId: 'water_moisture_check',
      questionText: 'Daily Plant Check',
      category: detail === 'Leaves' ? 'Leaves' : detail === 'Soil' ? 'Water' : 'Growth',
      selectedAnswer: ans,
      noticedDetail: detail,
      timestamp: `${note.date}T12:00:00.000Z`,
      date: note.date,
    };
  }

  return null;
}

export function syncDailyChecksFromUserPlants(userPlants: UserPlant[]): void {
  const storage = getStorage();
  if (!storage || !Array.isArray(userPlants) || userPlants.length === 0) return;

  try {
    const allChecks = getStoredDailyChecks();
    let updated = false;

    for (const plant of userPlants) {
      if (!plant.notes || !Array.isArray(plant.notes)) continue;
      for (const note of plant.notes) {
        const record = reconstructDailyCheckFromGrowthNote(plant, note);
        if (record) {
          const existingIdx = allChecks.findIndex(
            (c) => c.plantId === record.plantId && c.date === record.date
          );
          if (existingIdx === -1) {
            allChecks.push(record);
            updated = true;
          } else {
            if (record.noticedDetail && !allChecks[existingIdx].noticedDetail) {
              allChecks[existingIdx] = record;
              updated = true;
            }
          }
        }
      }
    }

    if (updated) {
      storage.setItem(DAILY_CHECKS_STORAGE_KEY, JSON.stringify(allChecks));
    }
  } catch (err) {
    console.warn('Failed to sync daily checks from user plants:', err);
  }
}

