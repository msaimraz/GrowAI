import {
  UserPlant,
  CareTask,
  GrowthStage,
  GrowthNote,
  TaskType,
  PropagationMethod,
  PlantAgeInfo,
  HarvestWindowResult,
} from '@/types/garden';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseSchema } from './supabase';
import { PLANTS_DATA } from '@/data/plants';

const STORAGE_KEYS = {
  USER_PLANTS: 'growai_demo_user_plants',
  CARE_TASKS: 'growai_demo_care_tasks',
  LOCAL_MIGRATED: 'growai_local_migrated_to_cloud',
};

// ==============================================================================
// TIMEZONE-SAFE CALENDAR DAY & PHENOLOGICAL HARVEST CALCULATIONS
// ==============================================================================

/**
 * Deterministically extracts { year, month, day } in the specified timeZone
 * using Intl.DateTimeFormat.formatToParts, preventing locale string order assumptions.
 */
export function getCalendarParts(
  date: Date,
  timeZone: string
): { year: number; month: number; day: number } {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    let year = 0;
    let month = 0;
    let day = 0;
    for (const part of parts) {
      if (part.type === 'year') year = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10);
      if (part.type === 'day') day = parseInt(part.value, 10);
    }
    return { year, month, day };
  } catch {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    };
  }
}

/**
 * Calculates calendar day difference between plantedDateStr ('YYYY-MM-DD') and today in the given timezone.
 */
export function calculatePlantAge(
  plantedDateStr: string,
  timeZone: string = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
): PlantAgeInfo {
  if (!plantedDateStr) {
    return { daysSincePlanting: 0, formattedPlantedDate: 'Unknown' };
  }

  const [pYear, pMonth, pDay] = plantedDateStr.split('-').map((v) => parseInt(v, 10));
  if (isNaN(pYear) || isNaN(pMonth) || isNaN(pDay)) {
    return { daysSincePlanting: 0, formattedPlantedDate: plantedDateStr };
  }

  const plantedUtc = Date.UTC(pYear, pMonth - 1, pDay);
  const todayParts = getCalendarParts(new Date(), timeZone);
  const todayUtc = Date.UTC(todayParts.year, todayParts.month - 1, todayParts.day);

  const daysSincePlanting = Math.max(0, Math.round((todayUtc - plantedUtc) / 86400000));

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedPlantedDate = `${monthNames[pMonth - 1]} ${pDay}, ${pYear}`;

  return { daysSincePlanting, formattedPlantedDate };
}

/**
 * Computes phenological harvest window comparing actual growth days against botanical timelines.
 */
export function calculateHarvestWindow(
  plantedDateStr: string,
  plantSlug: string,
  currentStage: GrowthStage,
  actualHarvestDate?: string | null,
  timeZone: string = typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
): HarvestWindowResult {
  const botanical = PLANTS_DATA.find((p) => p.slug === plantSlug);

  if (currentStage === 'Harvested') {
    const harvestDisplay = actualHarvestDate
      ? calculatePlantAge(actualHarvestDate, timeZone).formattedPlantedDate
      : 'Recorded';
    return {
      status: 'harvested',
      headline: 'Harvest Cycle Complete',
      detail: `Harvested on ${harvestDisplay}. Ready for succession sowing!`,
    };
  }

  if (!botanical || !botanical.timelines) {
    return {
      status: 'no_timeline',
      headline: 'Horticultural Timeline',
      detail: 'Monitoring daily growth and visual flowering cues.',
    };
  }

  const timelines = botanical.timelines;
  // Use harvestDays if defined, otherwise fallback to maturityDays
  const minDays = timelines.harvestDays?.min ?? timelines.maturityDays.min;
  const maxDays = timelines.harvestDays?.max ?? timelines.maturityDays.max;

  if (!minDays || !maxDays) {
    return {
      status: 'no_timeline',
      headline: 'Horticultural Timeline',
      detail: 'Observing vegetative development.',
    };
  }

  const { daysSincePlanting } = calculatePlantAge(plantedDateStr, timeZone);

  // Compute calendar dates for window
  const [pYear, pMonth, pDay] = plantedDateStr.split('-').map(Number);
  const minUtc = Date.UTC(pYear, pMonth - 1, pDay) + minDays * 86400000;
  const maxUtc = Date.UTC(pYear, pMonth - 1, pDay) + maxDays * 86400000;

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const minD = new Date(minUtc);
  const maxD = new Date(maxUtc);
  const estimatedMinDate = `${monthNames[minD.getUTCMonth()]} ${minD.getUTCDate()}`;
  const estimatedMaxDate = `${monthNames[maxD.getUTCMonth()]} ${maxD.getUTCDate()}, ${maxD.getUTCFullYear()}`;

  if (daysSincePlanting >= minDays && daysSincePlanting <= maxDays) {
    return {
      status: 'in_window',
      headline: 'Prime Harvest Window: Active Now',
      detail: `Harvest window active (${estimatedMinDate} – ${estimatedMaxDate}). Harvest outer foliage or ripe produce.`,
      estimatedMinDate,
      estimatedMaxDate,
      daysRemainingMin: 0,
      daysRemainingMax: maxDays - daysSincePlanting,
    };
  }

  if (daysSincePlanting > maxDays) {
    return {
      status: 'past_window',
      headline: 'Mature — Peak Harvest Window Passed',
      detail: `Exceeded estimated harvest window (${maxDays} days). Check for over-ripeness, bolting, or harvest immediately.`,
      estimatedMinDate,
      estimatedMaxDate,
    };
  }

  // Upcoming
  const remainingMin = minDays - daysSincePlanting;
  const remainingMax = maxDays - daysSincePlanting;

  return {
    status: 'upcoming',
    headline: `Estimated Harvest: In ${remainingMin}–${remainingMax} days`,
    detail: `Projected harvest window: ${estimatedMinDate} – ${estimatedMaxDate}.`,
    estimatedMinDate,
    estimatedMaxDate,
    daysRemainingMin: remainingMin,
    daysRemainingMax: remainingMax,
  };
}

// ==============================================================================
// INITIAL DEMO DATA
// ==============================================================================

export const INITIAL_DEMO_PLANTS: UserPlant[] = [
  {
    id: 'demo-plant-1',
    plantSlug: 'genovese-basil',
    nickname: 'Balcony Pesto King',
    plantedDate: '2026-10-10',
    currentStage: 'Growing',
    location: 'Balcony Rack',
    tier: 'top',
    potSize: '4 Liter Terracotta',
    parentPlantId: null,
    propagationMethod: 'seed',
    propagationDate: '2026-10-10',
    actualHarvestDate: null,
    notes: [
      {
        id: 'note-1',
        date: '2026-10-12',
        stage: 'Germination',
        text: 'Tiny green cotyledons sprouted across all three seeds.',
        heightCm: 1.2,
      },
      {
        id: 'note-2',
        date: '2026-10-20',
        stage: 'Seedling',
        text: 'First pair of true aromatic leaves expanded. Smells amazing.',
        heightCm: 4.5,
      },
      {
        id: 'note-3',
        date: '2026-10-27',
        stage: 'Growing',
        text: 'Pinched center tip above the second leaf node to promote bushy branch development.',
        heightCm: 9.0,
      },
    ],
  },
  {
    id: 'demo-plant-2',
    plantSlug: 'butterhead-lettuce',
    nickname: 'Crisp Kitchen Rosette',
    plantedDate: '2026-10-05',
    currentStage: 'Growing',
    location: 'Kitchen Tier',
    tier: 'middle',
    potSize: 'Shallow 15 cm Trough',
    parentPlantId: null,
    propagationMethod: 'nursery_transplant',
    propagationDate: '2026-10-05',
    actualHarvestDate: null,
    notes: [
      {
        id: 'note-4',
        date: '2026-10-08',
        stage: 'Germination',
        text: 'Fast emergence in moist coconut coir tray.',
        heightCm: 0.8,
      },
      {
        id: 'note-5',
        date: '2026-10-24',
        stage: 'Growing',
        text: 'Forming tight center rosette. Harvested three outer tender baby leaves for lunch salad.',
        heightCm: 8.5,
      },
    ],
  },
  {
    id: 'demo-plant-3',
    plantSlug: 'cherry-tomato',
    nickname: 'Ruby Patio Sweetie',
    plantedDate: '2026-09-28',
    currentStage: 'Growing',
    location: 'Balcony Rack',
    tier: 'top',
    potSize: '12 Liter Smart Pot',
    parentPlantId: null,
    propagationMethod: 'seed',
    propagationDate: '2026-09-28',
    actualHarvestDate: null,
    notes: [
      {
        id: 'note-6',
        date: '2026-10-02',
        stage: 'Seedling',
        text: 'Transplanted sturdy seedling into upper tier pot with tomato cage.',
        heightCm: 12.0,
      },
      {
        id: 'note-7',
        date: '2026-10-26',
        stage: 'Growing',
        text: 'First small yellow flower clusters opened today. Tapped stem gently to encourage wind pollination.',
        heightCm: 26.0,
      },
    ],
  },
];

export const INITIAL_DEMO_TASKS: CareTask[] = [
  {
    id: 'task-1',
    plantId: 'demo-plant-1',
    plantName: 'Balcony Pesto King (Genovese Basil)',
    title: 'Morning base watering & pinch check',
    dueDate: 'Today',
    completed: false,
    type: 'water',
  },
  {
    id: 'task-2',
    plantId: 'demo-plant-3',
    plantName: 'Ruby Patio Sweetie (Cherry Tomato)',
    title: 'Feed with organic potassium fertilizer for fruit set',
    dueDate: 'Tomorrow',
    completed: false,
    type: 'fertilize',
  },
  {
    id: 'task-3',
    plantId: 'demo-plant-2',
    plantName: 'Crisp Kitchen Rosette (Butterhead Lettuce)',
    title: 'Harvest outer baby leaves for salad',
    dueDate: 'In 2 days',
    completed: true,
    completedAt: '2026-10-28',
    type: 'harvest',
  },
  {
    id: 'task-4',
    plantId: 'demo-plant-1',
    plantName: 'Balcony Pesto King (Genovese Basil)',
    title: 'Inspect underside of lower leaves for powdery mildew',
    dueDate: 'In 3 days',
    completed: false,
    type: 'inspect',
  },
];

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// ==============================================================================
// LOCAL STORAGE ADAPTER (Demo / Unauthenticated Fallback)
// ==============================================================================

export function getSavedUserPlants(): UserPlant[] {
  if (!isBrowser()) return INITIAL_DEMO_PLANTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PLANTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USER_PLANTS, JSON.stringify(INITIAL_DEMO_PLANTS));
      return INITIAL_DEMO_PLANTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_PLANTS;
  }
}

export function saveUserPlants(plants: UserPlant[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PLANTS, JSON.stringify(plants));
  } catch (err) {
    console.error('Failed to persist user plants', err);
  }
}

export function getSavedCareTasks(): CareTask[] {
  if (!isBrowser()) return INITIAL_DEMO_TASKS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CARE_TASKS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DEMO_TASKS;
  }
}

export function saveCareTasks(tasks: CareTask[]): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to persist care tasks', err);
  }
}

export function resetToDemoData(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USER_PLANTS, JSON.stringify(INITIAL_DEMO_PLANTS));
  localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(INITIAL_DEMO_TASKS));
  localStorage.removeItem(STORAGE_KEYS.LOCAL_MIGRATED);
}

// Unique ID generator for local/demo storage that prevents collisions during rapid batch operations
function generateStorageId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Synchronous wrappers for demo mode
export function addUserPlant(
  newPlant: Omit<UserPlant, 'id' | 'notes'> & { initialNote?: string }
): UserPlant {
  const current = getSavedUserPlants();
  const created: UserPlant = {
    id: generateStorageId('user-plant'),
    plantSlug: newPlant.plantSlug,
    nickname: newPlant.nickname || 'My Plant',
    plantedDate: newPlant.plantedDate,
    currentStage: newPlant.currentStage,
    location: newPlant.location,
    tier: newPlant.tier,
    potSize: newPlant.potSize,
    parentPlantId: newPlant.parentPlantId || null,
    propagationMethod: newPlant.propagationMethod || null,
    propagationDate: newPlant.propagationDate || null,
    actualHarvestDate: newPlant.actualHarvestDate || null,
    notes: newPlant.initialNote
      ? [
          {
            id: generateStorageId('note'),
            date: newPlant.plantedDate,
            stage: newPlant.currentStage,
            text: newPlant.initialNote,
          },
        ]
      : [],
  };

  const updated = [created, ...current];
  saveUserPlants(updated);
  return created;
}

export function updateUserPlantStage(plantId: string, stage: GrowthStage): void {
  const current = getSavedUserPlants();
  const today = new Date().toISOString().split('T')[0];
  const updated = current.map((p) => {
    if (p.id !== plantId) return p;
    return {
      ...p,
      currentStage: stage,
      actualHarvestDate: stage === 'Harvested' ? today : null,
      notes: [
        ...p.notes,
        {
          id: generateStorageId('note'),
          date: today,
          stage,
          text: `Stage updated to ${stage}.`,
        },
      ],
    };
  });
  saveUserPlants(updated);
}

export function addPlantGrowthNote(
  plantId: string,
  noteData: { stage: GrowthStage; text: string; heightCm?: number; date?: string }
): void {
  const current = getSavedUserPlants();
  const noteDate = noteData.date || new Date().toISOString().split('T')[0];
  const isDailyCheck = noteData.text.startsWith('Daily check');

  const updated = current.map((p) => {
    if (p.id !== plantId) return p;

    let updatedNotes: GrowthNote[];
    const existingIndex = isDailyCheck
      ? p.notes.findIndex((n) => n.date === noteDate && n.text.startsWith('Daily check'))
      : -1;

    if (existingIndex >= 0) {
      updatedNotes = [...p.notes];
      updatedNotes[existingIndex] = {
        ...updatedNotes[existingIndex],
        stage: noteData.stage,
        text: noteData.text,
        heightCm: noteData.heightCm,
      };
    } else {
      const note: GrowthNote = {
        id: generateStorageId('note'),
        date: noteDate,
        stage: noteData.stage,
        text: noteData.text,
        heightCm: noteData.heightCm,
      };
      updatedNotes = [...p.notes, note];
    }

    return {
      ...p,
      notes: updatedNotes,
    };
  });
  saveUserPlants(updated);
}

export function removeUserPlant(plantId: string): void {
  const current = getSavedUserPlants();
  // Mimics database ON DELETE SET NULL on parentPlantId for offspring
  const updated = current
    .filter((p) => p.id !== plantId)
    .map((p) => {
      if (p.parentPlantId === plantId) {
        return { ...p, parentPlantId: null };
      }
      return p;
    });
  saveUserPlants(updated);
}

export function toggleCareTask(taskId: string): CareTask[] {
  const current = getSavedCareTasks();
  const updated = current.map((task) => {
    if (task.id !== taskId) return task;
    return {
      ...task,
      completed: !task.completed,
      completedAt: !task.completed ? new Date().toISOString().split('T')[0] : undefined,
    };
  });
  saveCareTasks(updated);
  return updated;
}

// ==============================================================================
// ASYNCHRONOUS DUAL-MODE ADAPTER (Cloud Supabase vs. Local Demo)
// ==============================================================================

/**
 * Fetch all user plants.
 * Uses Supabase if an authenticated user session exists; otherwise returns local demo state.
 */
export async function fetchUserGarden(
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ plants: UserPlant[]; isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('user_plants')
        .select(`
          id,
          plant_slug,
          nickname,
          current_stage,
          planted_date,
          location,
          tier,
          pot_size,
          custom_image,
          parent_plant_id,
          propagation_method,
          propagation_date,
          actual_harvest_date,
          growth_notes (
            id,
            observation_date,
            stage,
            text,
            height_cm,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        return { plants: [], isCloud: true, error: error.message };
      }

      const formatted: UserPlant[] = (data || []).map((row: any) => {
        const rawNotes = row.growth_notes || [];
        const sortedNotes: GrowthNote[] = rawNotes
          .sort((a: any, b: any) => new Date(a.observation_date).getTime() - new Date(b.observation_date).getTime())
          .map((n: any) => ({
            id: n.id,
            date: n.observation_date,
            stage: n.stage as GrowthStage,
            text: n.text,
            heightCm: n.height_cm ? parseFloat(n.height_cm) : undefined,
          }));

        return {
          id: row.id,
          plantSlug: row.plant_slug,
          nickname: row.nickname,
          plantedDate: row.planted_date,
          currentStage: row.current_stage as GrowthStage,
          location: (row.location as UserPlant['location']) || undefined,
          tier: row.tier || undefined,
          potSize: row.pot_size || undefined,
          customImage: row.custom_image || undefined,
          parentPlantId: row.parent_plant_id || null,
          propagationMethod: row.propagation_method || null,
          propagationDate: row.propagation_date || null,
          actualHarvestDate: row.actual_harvest_date || null,
          notes: sortedNotes,
        };
      });

      return { plants: formatted, isCloud: true };
    }
  }

  return { plants: getSavedUserPlants(), isCloud: false };
}

/**
 * Fetch all care tasks.
 */
export async function fetchCareTasks(
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ tasks: CareTask[]; isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('care_tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { tasks: [], isCloud: true, error: error.message };
      }

      const formatted: CareTask[] = (data || []).map((row) => ({
        id: row.id,
        plantId: row.user_plant_id || '',
        plantName: row.plant_name,
        title: row.title,
        dueDate: row.due_date,
        completed: row.completed,
        completedAt: row.completed_at || undefined,
        type: row.task_type as TaskType,
      }));

      return { tasks: formatted, isCloud: true };
    }
  }

  return { tasks: getSavedCareTasks(), isCloud: false };
}

/**
 * Add a plant to the garden.
 */
export async function createGardenPlant(
  newPlant: Omit<UserPlant, 'id' | 'notes'> & { initialNote?: string },
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ plant: UserPlant; isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // Insert plant record into user_plants
      const { data: plantData, error: plantError } = await supabase
        .from('user_plants')
        .insert({
          user_id: user.id,
          plant_slug: newPlant.plantSlug,
          nickname: newPlant.nickname || 'My Plant',
          current_stage: newPlant.currentStage,
          planted_date: newPlant.plantedDate,
          location: newPlant.location || null,
          tier: newPlant.tier || null,
          pot_size: newPlant.potSize || null,
          custom_image: newPlant.customImage || null,
          parent_plant_id: newPlant.parentPlantId || null,
          propagation_method: newPlant.propagationMethod || null,
          propagation_date: newPlant.propagationDate || null,
          actual_harvest_date: newPlant.actualHarvestDate || null,
        })
        .select()
        .single();

      if (plantError || !plantData) {
        return {
          plant: {} as UserPlant,
          isCloud: true,
          error: plantError?.message || 'Failed to save plant to cloud.',
        };
      }

      let createdNotes: GrowthNote[] = [];

      // If initial note provided, insert into growth_notes
      if (newPlant.initialNote) {
        const { data: noteData, error: noteError } = await supabase
          .from('growth_notes')
          .insert({
            user_id: user.id,
            user_plant_id: plantData.id,
            observation_date: newPlant.plantedDate,
            stage: newPlant.currentStage,
            text: newPlant.initialNote,
          })
          .select()
          .single();

        if (!noteError && noteData) {
          createdNotes = [
            {
              id: noteData.id,
              date: noteData.observation_date,
              stage: noteData.stage as GrowthStage,
              text: noteData.text,
            },
          ];
        }
      }

      const created: UserPlant = {
        id: plantData.id,
        plantSlug: plantData.plant_slug,
        nickname: plantData.nickname,
        plantedDate: plantData.planted_date,
        currentStage: plantData.current_stage as GrowthStage,
        location: (plantData.location as UserPlant['location']) || undefined,
        tier: plantData.tier || undefined,
        potSize: plantData.pot_size || undefined,
        customImage: plantData.custom_image || undefined,
        parentPlantId: plantData.parent_plant_id || null,
        propagationMethod: plantData.propagation_method || null,
        propagationDate: plantData.propagation_date || null,
        actualHarvestDate: plantData.actual_harvest_date || null,
        notes: createdNotes,
      };

      return { plant: created, isCloud: true };
    }
  }

  // Local fallback when unauthenticated
  const localPlant = addUserPlant(newPlant);
  return { plant: localPlant, isCloud: false };
}

/**
 * Create a child plant linked to an existing parent plant.
 * Enforces species inheritance by querying parent plant record directly.
 */
export async function createPropagatedPlant(params: {
  parentPlant: UserPlant;
  propagationMethod: PropagationMethod;
  nickname: string;
  location?: UserPlant['location'];
  tier?: UserPlant['tier'];
  potSize?: string;
  customClient?: SupabaseClient<DatabaseSchema> | null;
}): Promise<{ plant: UserPlant; isCloud: boolean; error?: string }> {
  const today = new Date().toISOString().split('T')[0];

  const methodLabels: Record<PropagationMethod, string> = {
    seed: 'harvested seed',
    cutting: 'stem cutting',
    division: 'crown division',
    runner: 'daughter runner',
    layering: 'stem layering',
    nursery_transplant: 'transplant',
  };

  const newPlantData: Omit<UserPlant, 'id' | 'notes'> & { initialNote?: string } = {
    plantSlug: params.parentPlant.plantSlug, // Strictly inherits parent species
    nickname: params.nickname.trim() || `${params.parentPlant.nickname} (New ${params.propagationMethod})`,
    currentStage: params.propagationMethod === 'seed' ? 'Seed' : 'Seedling',
    plantedDate: today,
    location: params.location || params.parentPlant.location,
    tier: params.tier,
    potSize: params.potSize || 'Small Starter Pot',
    parentPlantId: params.parentPlant.id,
    propagationMethod: params.propagationMethod,
    propagationDate: today,
    actualHarvestDate: null,
    initialNote: `Propagated via ${methodLabels[params.propagationMethod]} from parent "${params.parentPlant.nickname}".`,
  };

  return createGardenPlant(newPlantData, params.customClient);
}

/**
 * Update developmental stage of a plant.
 * Automatically logs an audit growth note and handles actual_harvest_date setting and clearing.
 */
export async function updateGardenPlantStage(
  plantId: string,
  stage: GrowthStage,
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const today = new Date().toISOString().split('T')[0];
      const updatePayload: any = { current_stage: stage };

      if (stage === 'Harvested') {
        updatePayload.actual_harvest_date = today;
      } else {
        // If transitioning from Harvested back to active stage, reset actual_harvest_date
        updatePayload.actual_harvest_date = null;
      }

      // Update plant current_stage and harvest date
      const { error: updateError } = await supabase
        .from('user_plants')
        .update(updatePayload)
        .eq('id', plantId)
        .eq('user_id', user.id);

      if (updateError) {
        return { isCloud: true, error: updateError.message };
      }

      // Add audit growth note
      await supabase.from('growth_notes').insert({
        user_id: user.id,
        user_plant_id: plantId,
        observation_date: today,
        stage,
        text: `Stage updated to ${stage}.`,
      });

      return { isCloud: true };
    }
  }

  updateUserPlantStage(plantId, stage);
  return { isCloud: false };
}

/**
 * Record a dated growth note.
 */
export async function createGrowthNote(
  plantId: string,
  noteData: { stage: GrowthStage; text: string; heightCm?: number; date?: string },
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ note?: GrowthNote; isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const obsDate = noteData.date || new Date().toISOString().split('T')[0];
      const isDailyCheck = noteData.text.startsWith('Daily check');

      let noteResultData: any = null;

      if (isDailyCheck) {
        const { data: existingNotes } = await supabase
          .from('growth_notes')
          .select('id')
          .eq('user_plant_id', plantId)
          .eq('observation_date', obsDate)
          .ilike('text', 'Daily check%')
          .limit(1);

        if (existingNotes && existingNotes.length > 0) {
          const { data: updatedData, error: updateError } = await supabase
            .from('growth_notes')
            .update({
              stage: noteData.stage,
              text: noteData.text,
              height_cm: noteData.heightCm || null,
            })
            .eq('id', existingNotes[0].id)
            .select()
            .single();

          if (updateError || !updatedData) {
            return { isCloud: true, error: updateError?.message || 'Failed to update note in cloud.' };
          }
          noteResultData = updatedData;
        }
      }

      if (!noteResultData) {
        const { data, error } = await supabase
          .from('growth_notes')
          .insert({
            user_id: user.id,
            user_plant_id: plantId,
            observation_date: obsDate,
            stage: noteData.stage,
            text: noteData.text,
            height_cm: noteData.heightCm || null,
          })
          .select()
          .single();

        if (error || !data) {
          return { isCloud: true, error: error?.message || 'Failed to save note to cloud.' };
        }
        noteResultData = data;
      }

      return {
        note: {
          id: noteResultData.id,
          date: noteResultData.observation_date,
          stage: noteResultData.stage as GrowthStage,
          text: noteResultData.text,
          heightCm: noteResultData.height_cm !== null && noteResultData.height_cm !== undefined ? Number(noteResultData.height_cm) : undefined,
        },
        isCloud: true,
      };
    }
  }

  addPlantGrowthNote(plantId, noteData);
  return { isCloud: false };
}

/**
 * Helper to paginate through all files in a specific user plant folder: {userId}/{plantId}
 */
async function listAllPlantFolderFiles(
  supabase: any,
  bucketName: string,
  folderPrefix: string
): Promise<{ files: string[]; error?: string }> {
  const filePaths: string[] = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPrefix, {
        limit,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });

    if (error) {
      return { files: [], error: error.message };
    }

    if (!data || data.length === 0) {
      break;
    }

    for (const item of data) {
      if (item.name && !item.name.startsWith('.')) {
        filePaths.push(`${folderPrefix}/${item.name}`);
      }
    }

    if (data.length < limit) {
      hasMore = false;
    } else {
      offset += limit;
    }
  }

  return { files: filePaths };
}

/**
 * Delete a user plant with fail-safe storage cleanup and explicit partial-failure reporting.
 */
export async function deleteGardenPlant(
  plantId: string,
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{
  isCloud: boolean;
  error?: string;
  partialFailure?: {
    stage: 'database_delete_failed';
    plantId: string;
    removedStoragePaths: string[];
    error: string;
  };
}> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const plantFolder = `${user.id}/${plantId}`;

      // 1. List ALL storage objects under the exact folder: {user.id}/{plantId} with pagination
      // (This catches photos with metadata AS WELL AS orphaned files without metadata in that plant folder)
      const { files: storageFiles, error: listError } = await listAllPlantFolderFiles(
        supabase,
        'plant-photos',
        plantFolder
      );

      if (listError) {
        return {
          isCloud: true,
          error: `Failed to inspect storage folder '${plantFolder}': ${listError}. Plant deletion aborted to prevent orphaned files.`,
        };
      }

      // 2. Also retrieve any metadata paths from public.plant_photos for cross-verification
      const { data: dbPhotos, error: fetchDbError } = await supabase
        .from('plant_photos')
        .select('storage_path')
        .eq('user_plant_id', plantId)
        .eq('user_id', user.id);

      if (fetchDbError) {
        return {
          isCloud: true,
          error: `Failed to query photo metadata records: ${fetchDbError.message}. Plant deletion aborted.`,
        };
      }

      // 3. Union storage file paths and database metadata paths (ensuring all are strictly within {user.id}/{plantId}/)
      const combinedPathSet = new Set<string>();
      for (const f of storageFiles) {
        if (f.startsWith(`${plantFolder}/`)) {
          combinedPathSet.add(f);
        }
      }
      for (const p of dbPhotos || []) {
        if (p.storage_path && p.storage_path.startsWith(`${plantFolder}/`)) {
          combinedPathSet.add(p.storage_path);
        }
      }

      const pathsToDelete = Array.from(combinedPathSet);
      let removedStoragePaths: string[] = [];

      // 4. If files exist, remove them from Supabase Storage while the plant record STILL EXISTS
      if (pathsToDelete.length > 0) {
        const { error: storageRemoveError } = await supabase.storage
          .from('plant-photos')
          .remove(pathsToDelete);

        if (storageRemoveError) {
          return {
            isCloud: true,
            error: `Failed to remove storage objects in '${plantFolder}': ${storageRemoveError.message}. Plant deletion aborted.`,
          };
        }

        removedStoragePaths = pathsToDelete;

        // 5. Verify cleanup before deleting the database record
        // Re-check folder to confirm no objects remain
        const { files: remainingFiles, error: verifyError } = await listAllPlantFolderFiles(
          supabase,
          'plant-photos',
          plantFolder
        );

        if (verifyError || remainingFiles.length > 0) {
          return {
            isCloud: true,
            error: `Storage cleanup verification failed for '${plantFolder}' (${remainingFiles.length} object(s) remain). Plant deletion aborted.`,
          };
        }
      }

      // 6. Only after storage cleanup is verified, delete the plant database record
      const { error: plantDeleteError } = await supabase
        .from('user_plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user.id);

      // 7. Explicit recovery handling if database delete fails after successful Storage delete
      if (plantDeleteError) {
        console.error(
          `PARTIAL FAILURE: Storage objects removed (${removedStoragePaths.length}), but database DELETE failed:`,
          plantDeleteError.message
        );
        return {
          isCloud: true,
          error: `Database deletion failed (${plantDeleteError.message}) after ${removedStoragePaths.length} storage photo(s) were removed. Plant record remains in database. Retry plant deletion to complete cleanup.`,
          partialFailure: {
            stage: 'database_delete_failed',
            plantId,
            removedStoragePaths,
            error: plantDeleteError.message,
          },
        };
      }

      return { isCloud: true };
    }
  }

  // Demo Mode: Clean up IndexedDB photo blobs and remove local demo plant
  if (typeof window !== 'undefined') {
    try {
      const { deleteDemoPhotosForPlant } = await import('@/lib/photo-storage');
      await deleteDemoPhotosForPlant(plantId);
    } catch {
      // Non-blocking in non-browser contexts
    }
  }

  removeUserPlant(plantId);
  return { isCloud: false };
}

/**
 * Toggle care task completion status.
 */
export async function toggleTaskStatus(
  taskId: string,
  currentlyCompleted: boolean,
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const newStatus = !currentlyCompleted;
      const today = newStatus ? new Date().toISOString().split('T')[0] : null;

      const { error } = await supabase
        .from('care_tasks')
        .update({
          completed: newStatus,
          completed_at: today,
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) {
        return { isCloud: true, error: error.message };
      }

      return { isCloud: true };
    }
  }

  toggleCareTask(taskId);
  return { isCloud: false };
}

// ==============================================================================
// DELIBERATE IMPORT / MIGRATION (Local Demo Records -> Supabase Cloud)
// ==============================================================================

export function hasLocalDemoData(): boolean {
  if (!isBrowser()) return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PLANTS);
    if (!raw) return false;
    const plants = JSON.parse(raw) as UserPlant[];
    return Array.isArray(plants) && plants.length > 0;
  } catch {
    return false;
  }
}

/**
 * Deliberate import of local browser records to cloud Supabase account.
 * Deduplicates by matching plantSlug + nickname so duplicates are never inserted.
 */
export async function importLocalDemoDataToCloud(
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ importedCount: number; skippedCount: number; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (!supabase) {
    return { importedCount: 0, skippedCount: 0, error: 'Supabase client unavailable.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { importedCount: 0, skippedCount: 0, error: 'You must be signed in to import data.' };
  }

  const localPlants = getSavedUserPlants();
  if (localPlants.length === 0) {
    return { importedCount: 0, skippedCount: 0 };
  }

  // Fetch current cloud plants to prevent duplicate entries
  const { data: cloudPlants, error: fetchErr } = await supabase
    .from('user_plants')
    .select('id, plant_slug, nickname')
    .eq('user_id', user.id);

  if (fetchErr) {
    return { importedCount: 0, skippedCount: 0, error: fetchErr.message };
  }

  const existingKeySet = new Set(
    (cloudPlants || []).map((cp) => `${cp.plant_slug}::${cp.nickname.trim().toLowerCase()}`)
  );

  let importedCount = 0;
  let skippedCount = 0;

  for (const plant of localPlants) {
    const key = `${plant.plantSlug}::${plant.nickname.trim().toLowerCase()}`;

    if (existingKeySet.has(key)) {
      skippedCount++;
      continue;
    }

    // Insert plant
    const { data: insertedPlant, error: insertErr } = await supabase
      .from('user_plants')
      .insert({
        user_id: user.id,
        plant_slug: plant.plantSlug,
        nickname: plant.nickname,
        current_stage: plant.currentStage,
        planted_date: plant.plantedDate,
        location: plant.location || null,
        tier: plant.tier || null,
        pot_size: plant.potSize || null,
        parent_plant_id: plant.parentPlantId || null,
        propagation_method: plant.propagationMethod || null,
        propagation_date: plant.propagationDate || null,
        actual_harvest_date: plant.actualHarvestDate || null,
      })
      .select()
      .single();

    if (insertErr || !insertedPlant) {
      console.error(`Failed to import plant ${plant.nickname}`, insertErr);
      continue;
    }

    existingKeySet.add(key);
    importedCount++;

    // Insert associated notes if any
    if (plant.notes && plant.notes.length > 0) {
      const notesToInsert = plant.notes.map((n) => ({
        user_id: user.id,
        user_plant_id: insertedPlant.id,
        observation_date: n.date,
        stage: n.stage,
        text: n.text,
        height_cm: n.heightCm || null,
      }));

      await supabase.from('growth_notes').insert(notesToInsert);
    }
  }

  if (isBrowser()) {
    localStorage.setItem(STORAGE_KEYS.LOCAL_MIGRATED, 'true');
  }

  return { importedCount, skippedCount };
}

// ==============================================================================
// PHASE 7B.2 SPACE CONFIGURATION STORAGE EXPORTS
// ==============================================================================
export {
  SPACE_STORAGE_KEYS,
  validateSpaceConfigProfile,
  getSavedSpaceConfigs,
  getSavedSpaceConfigById,
  saveSpaceConfig,
  deleteSpaceConfig,
  getActiveSpaceConfigId,
  setActiveSpaceConfigId,
  createLocalSpaceStorageAdapter,
  createPreparedSupabaseSpaceAdapter,
} from './space-storage';

