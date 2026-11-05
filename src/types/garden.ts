export type GrowthStage =
  | 'Seed'
  | 'Germination'
  | 'Seedling'
  | 'Growing'
  | 'Mature'
  | 'Harvested';

export type TaskType = 'water' | 'fertilize' | 'prune' | 'harvest' | 'inspect' | 'repot';

export type PropagationMethod =
  | 'seed'
  | 'cutting'
  | 'division'
  | 'runner'
  | 'layering'
  | 'nursery_transplant';

export interface GrowthNote {
  id: string;
  date: string;
  stage: GrowthStage;
  text: string;
  heightCm?: number;
}

export interface CareTask {
  id: string;
  plantId: string;
  plantName: string;
  title: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  type: TaskType;
}

export interface PlantPhoto {
  id: string;
  userPlantId: string;
  storagePath: string;
  signedUrl?: string; // Dynamically created signed URL, never persisted in DB
  caption?: string;
  growthStage?: GrowthStage;
  heightCm?: number;
  takenAt: string;
  createdAt?: string;
}

export interface UserPlant {
  id: string;
  plantSlug: string;
  nickname: string;
  plantedDate: string;
  currentStage: GrowthStage;
  location?: 'Balcony Rack' | 'Window Sill' | 'Living Room' | 'Kitchen Tier' | 'Patio';
  tier?: 'top' | 'middle' | 'bottom';
  potSize?: string;
  notes: GrowthNote[];
  customImage?: string;
  // Phase 7A Lineage & Harvest
  parentPlantId?: string | null;
  propagationMethod?: PropagationMethod | null;
  propagationDate?: string | null;
  actualHarvestDate?: string | null;
  createdAt?: string;
}

// Re-export Phase 9 Timeline types
export * from './timeline';

export interface PlantAgeInfo {
  daysSincePlanting: number;
  formattedPlantedDate: string;
}

export type HarvestStatus =
  | 'harvested'
  | 'in_window'
  | 'past_window'
  | 'upcoming'
  | 'no_timeline';

export interface HarvestWindowResult {
  status: HarvestStatus;
  headline: string;
  detail: string;
  estimatedMinDate?: string;
  estimatedMaxDate?: string;
  daysRemainingMin?: number;
  daysRemainingMax?: number;
}
