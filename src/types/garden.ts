export type GrowthStage =
  | 'Seed'
  | 'Germination'
  | 'Seedling'
  | 'Growing'
  | 'Mature'
  | 'Harvested';

export type TaskType = 'water' | 'fertilize' | 'prune' | 'harvest' | 'inspect' | 'repot';

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
}
