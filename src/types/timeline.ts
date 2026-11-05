/**
 * GrowAI Phase 9: Plant Timeline & Growth Tracking Domain Types
 * Strongly-typed domain models for longitudinal plant journals,
 * lifecycle events, observations, care, health, propagation, and harvest history.
 */

import { GrowthStage, TaskType, PropagationMethod, PlantPhoto, CareTask, UserPlant } from './garden';
import { SavedDiagnosisRecord, TreatmentActionType, TreatmentStatus, FollowUpOutcome, PlantHealthStatus } from './diagnosis';
import { GrowingConditionObservation, FeedingRecord, PropagationEvent, HarvestRecord } from './grow-intelligence';

export type PlantTimelineEventType =
  | 'plant_added'
  | 'planting'
  | 'germination'
  | 'transplant'
  | 'growth_observation'
  | 'photo'
  | 'health_assessment'
  | 'treatment'
  | 'health_follow_up'
  | 'care'
  | 'feeding'
  | 'condition_observation'
  | 'propagation'
  | 'harvest'
  | 'stage_change'
  | 'intelligence_action'
  | 'observation_gap'
  | 'recommendation'
  | 'production_signal'
  | 'environment_signal'
  | 'plan_created'
  | 'plan_step_started'
  | 'plan_step_completed'
  | 'plan_adjusted'
  | 'plan_paused'
  | 'plan_resumed'
  | 'plan_completed'
  | 'plan_review';

export type PlantTimelineCategory =
  | 'lifecycle'
  | 'growth'
  | 'photo'
  | 'health'
  | 'care'
  | 'harvest'
  | 'propagation'
  | 'intelligence'
  | 'plan';

export type PlantTimelineFilter =
  | 'all'
  | 'growth'
  | 'photos'
  | 'health'
  | 'care'
  | 'harvest'
  | 'propagation'
  | 'intelligence'
  | 'plan';

export interface PlantTimelineBadge {
  text: string;
  variant: 'default' | 'success' | 'warning' | 'info' | 'critical' | 'neutral' | 'accent';
}

export interface PlantTimelineMedia {
  photoId?: string;
  storagePath?: string;
  signedUrl?: string;
  caption?: string;
  heightCm?: number;
  growthStage?: GrowthStage;
}

export interface PlantTimelineMetadata {
  growthStage?: GrowthStage;
  previousStage?: GrowthStage;
  heightCm?: number;
  taskType?: TaskType;
  treatmentStatus?: TreatmentStatus;
  treatmentActionType?: TreatmentActionType;
  followUpOutcome?: FollowUpOutcome;
  diagnosticStatus?: string;
  propagationMethod?: PropagationMethod;
  parentPlantNickname?: string;
  parentPlantId?: string;
  actualHarvestDate?: string;
  harvestYield?: string;
  isAiHypothesis?: boolean;
  kbConditionId?: string;
  candidateRank?: number;
  conditionName?: string;
}

export interface PlantTimelineActionLink {
  label: string;
  href: string;
}

export interface PlantTimelineEvent {
  id: string;
  plantId: string;
  eventType: PlantTimelineEventType;
  category: PlantTimelineCategory;
  eventDate: string; // ISO 8601 or YYYY-MM-DD
  title: string;
  description: string;
  sourceReferenceId?: string;
  sourceProvenance:
    | 'user_plants'
    | 'growth_notes'
    | 'plant_photos'
    | 'care_tasks'
    | 'diagnosis_records'
    | 'diagnosis_treatments'
    | 'diagnosis_follow_ups'
    | 'growing_conditions'
    | 'feeding_records'
    | 'propagation_events'
    | 'harvest_records'
    | 'production_cycles'
    | 'grow_plans'
    | 'grow_plan_steps';
  badge?: PlantTimelineBadge;
  media?: PlantTimelineMedia;
  metadata?: PlantTimelineMetadata;
  actionLink?: PlantTimelineActionLink;
}

export interface PlantGrowthSummary {
  plantId: string;
  nickname: string;
  plantSlug: string;
  currentStage: GrowthStage | 'Stage not recorded';
  stageHistory: GrowthStage[];
  ageDisplay: string; // e.g., "Day 18" or "Planting date not recorded"
  daysSincePlanting: number | null;
  plantedDateDisplay: string; // formatted date or "Planting date not recorded"
  lastObservationDate: string | null;
  lastObservationDateDisplay: string;
  totalPhotosCount: number;
  totalHealthAssessmentsCount: number;
  totalGrowthNotesCount: number;
  totalCareTasksCompleted: number;
  healthStatus?: PlantHealthStatus;
  healthStatusLabel?: string;
  hasPropagationLineage: boolean;
  isHarvested: boolean;
}

export interface BuildPlantTimelineParams {
  plant: UserPlant;
  parentPlant?: UserPlant | null;
  photos?: PlantPhoto[];
  tasks?: CareTask[];
  diagnoses?: SavedDiagnosisRecord[];
  now?: Date;
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  harvests?: HarvestRecord[];
  growPlans?: any[];
}

