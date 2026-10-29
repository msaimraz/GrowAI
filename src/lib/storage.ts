import { UserPlant, CareTask, GrowthStage, GrowthNote, TaskType } from '@/types/garden';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DatabaseSchema } from './supabase';

const STORAGE_KEYS = {
  USER_PLANTS: 'growai_demo_user_plants',
  CARE_TASKS: 'growai_demo_care_tasks',
  LOCAL_MIGRATED: 'growai_local_migrated_to_cloud',
};

// Initial curated demo data to demonstrate realistic garden state immediately in demo mode
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

// Legacy synchronous wrappers for backwards compatibility
export function addUserPlant(newPlant: Omit<UserPlant, 'id' | 'notes'> & { initialNote?: string }): UserPlant {
  const current = getSavedUserPlants();
  const created: UserPlant = {
    id: `user-plant-${Date.now()}`,
    plantSlug: newPlant.plantSlug,
    nickname: newPlant.nickname || 'My Plant',
    plantedDate: newPlant.plantedDate,
    currentStage: newPlant.currentStage,
    location: newPlant.location,
    tier: newPlant.tier,
    potSize: newPlant.potSize,
    notes: newPlant.initialNote
      ? [
          {
            id: `note-${Date.now()}`,
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
  const updated = current.map((p) => {
    if (p.id !== plantId) return p;
    return {
      ...p,
      currentStage: stage,
      notes: [
        ...p.notes,
        {
          id: `note-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
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
  const updated = current.map((p) => {
    if (p.id !== plantId) return p;
    const note: GrowthNote = {
      id: `note-${Date.now()}`,
      date: noteData.date || new Date().toISOString().split('T')[0],
      stage: noteData.stage,
      text: noteData.text,
      heightCm: noteData.heightCm,
    };
    return {
      ...p,
      notes: [...p.notes, note],
    };
  });
  saveUserPlants(updated);
}

export function removeUserPlant(plantId: string): void {
  const current = getSavedUserPlants();
  const updated = current.filter((p) => p.id !== plantId);
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
 * Never silently falls back to local storage if a cloud write fails.
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
 * Update developmental stage of a plant.
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

      // Update plant current_stage
      const { error: updateError } = await supabase
        .from('user_plants')
        .update({ current_stage: stage })
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

      return {
        note: {
          id: data.id,
          date: data.observation_date,
          stage: data.stage as GrowthStage,
          text: data.text,
          heightCm: data.height_cm !== null && data.height_cm !== undefined ? Number(data.height_cm) : undefined,
        },
        isCloud: true,
      };
    }
  }

  addPlantGrowthNote(plantId, noteData);
  return { isCloud: false };
}

/**
 * Delete a user plant.
 */
export async function deleteGardenPlant(
  plantId: string,
  customClient?: SupabaseClient<DatabaseSchema> | null
): Promise<{ isCloud: boolean; error?: string }> {
  const supabase = customClient !== undefined ? customClient : createClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from('user_plants')
        .delete()
        .eq('id', plantId)
        .eq('user_id', user.id);

      if (error) {
        return { isCloud: true, error: error.message };
      }

      return { isCloud: true };
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
