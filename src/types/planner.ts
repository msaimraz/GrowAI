export type RackTierLevel = 'top' | 'middle' | 'bottom';

export interface TierConfig {
  id: RackTierLevel;
  name: string;
  lightProfile: string;
  lightLevel: 'Full Sun (6+ hrs)' | 'Bright Indirect (4-6 hrs)' | 'Shaded / Low Light (2-4 hrs)';
  wateringCharacteristics: string;
  potWeightGuidance: string;
  recommendedPlantTypes: string;
  maxSlots: number;
}

export interface PlacedPlantSlot {
  id: string;
  tierId: RackTierLevel;
  slotIndex: number;
  plantSlug: string;
  plantName: string;
  category: string;
  spacingCm: number;
  potDepthCm: number;
}

export interface PlannerState {
  rackName: string;
  slots: PlacedPlantSlot[];
}
