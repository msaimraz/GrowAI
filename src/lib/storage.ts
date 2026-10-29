import { UserPlant, CareTask, GrowthStage, GrowthNote } from '@/types/garden';
import { PLANTS_DATA } from '@/data/plants';

const STORAGE_KEYS = {
  USER_PLANTS: 'growai_demo_user_plants',
  CARE_TASKS: 'growai_demo_care_tasks',
};

// Initial curated demo data to demonstrate realistic garden state immediately
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

/**
 * Data access abstraction layer.
 * In this initial phase, state is maintained in localStorage for interactive client exploration.
 * When Supabase is connected, these functions swap out internal storage queries without altering UI components.
 */
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

export function resetToDemoData(): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.USER_PLANTS, JSON.stringify(INITIAL_DEMO_PLANTS));
  localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(INITIAL_DEMO_TASKS));
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
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEYS.CARE_TASKS, JSON.stringify(updated));
    } catch (err) {
      console.error('Failed to persist care tasks', err);
    }
  }
  return updated;
}
