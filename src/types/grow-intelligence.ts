/**
 * GrowAI Phase 10: Grow Intelligence & Production System Domain Types
 * Strongly typed models connecting:
 * Plant -> Growing Conditions -> Care -> Feeding -> Health -> Growth ->
 * Propagation -> Production -> Harvest -> Yield -> Space Utilization -> Intelligence.
 *
 * Core Principles (Section 0 & 6 & 20):
 * - Unknown must remain unknown (never invent numbers as facts).
 * - Strict provenance separation: recorded, calculated, observed, inferred, recommended, unknown.
 * - Confidence levels: high, moderate, low, unknown.
 * - Safety: No human medical claims, no invented fertilizer/pesticide dosages, no guaranteed yield claims.
 */

import { UserPlant, GrowthStage, PlantAgeInfo, HarvestWindowResult } from './garden';
import { PlantHealthStatus, SavedDiagnosisRecord } from './diagnosis';
import { PlantTimelineEvent } from './timeline';
import { Reminder } from './reminder';

// ==============================================================================
// 1. PROVENANCE & CONFIDENCE
// ==============================================================================

export type ProvenanceCategory =
  | 'recorded'      // Direct grower measurement / entry
  | 'calculated'    // Mathematical derivation from recorded facts
  | 'observed'      // Visual sensory observation
  | 'inferred'      // Agronomic hypothesis based on patterns
  | 'recommended'   // Safe actionable check or guidance
  | 'unknown';      // Data is absent or not yet recorded

export type IntelligenceConfidence = 'high' | 'moderate' | 'low' | 'unknown';

export interface ProvenanceValue<T> {
  value: T;
  provenance: ProvenanceCategory;
  confidence: IntelligenceConfidence;
  sourceNote?: string;
}

// ==============================================================================
// 2. GROWING CONDITIONS INTELLIGENCE
// ==============================================================================

export type LightLevel =
  | 'low'
  | 'medium'
  | 'bright_indirect'
  | 'direct_sun'
  | 'grow_light'
  | 'unknown';

export type LightSource = 'natural' | 'grow_light' | 'mixed' | 'unknown';

export type AirflowQuality =
  | 'stagnant'
  | 'gentle'
  | 'moderate'
  | 'strong'
  | 'fan_ventilated'
  | 'unknown';

export type SoilMoistureObservation =
  | 'dry'
  | 'slightly_moist'
  | 'moist'
  | 'waterlogged'
  | 'unknown';

export type DrainageQuality = 'poor' | 'adequate' | 'excellent' | 'unknown';

export interface GrowingConditionObservation {
  id: string;
  userId: string;
  plantId?: string | null;
  environmentZone?: string | null;
  lightLevel?: LightLevel | null;
  lightDurationHours?: number | null;
  lightSource?: LightSource | null;
  isGrowLight: boolean;
  temperatureCelsius?: number | null;
  tempMinCelsius?: number | null;
  tempMaxCelsius?: number | null;
  relativeHumidityPercent?: number | null;
  airflowQuality?: AirflowQuality | null;
  soilMoisture?: SoilMoistureObservation | null;
  drainageQuality?: DrainageQuality | null;
  ph?: number | null;
  mediumType?: string | null;
  notes?: string | null;
  observationTime: string; // ISO 8601
  createdAt: string;
  updatedAt: string;
}

export type RequirementComparisonStatus =
  | 'within_expected_range'
  | 'possibly_low'
  | 'possibly_high'
  | 'unknown';

export interface ConditionMetricAssessment {
  metricName: 'temperature' | 'humidity' | 'light' | 'soil_moisture';
  observedValue?: number | string | null;
  recordedRequirementRange?: string | null;
  status: RequirementComparisonStatus;
  provenance: ProvenanceCategory;
  explanation: string;
}

export interface GrowingConditionsSummary {
  latestObservation?: GrowingConditionObservation | null;
  totalObservations: number;
  assessments: ConditionMetricAssessment[];
  unrecordedParameters: string[];
}

// ==============================================================================
// 3. FEEDING & FERTILIZATION SYSTEM
// ==============================================================================

export type FertilizerType =
  | 'organic'
  | 'synthetic'
  | 'compost_tea'
  | 'slow_release'
  | 'liquid_feed'
  | 'foliar'
  | 'worm_castings'
  | 'other';

export type FertilizerFormulation =
  | 'liquid'
  | 'granular'
  | 'powder'
  | 'spikes'
  | 'pellets'
  | 'other';

export type FeedingApplicationMethod =
  | 'soil_drench'
  | 'foliar_spray'
  | 'top_dress'
  | 'sub_irrigation'
  | 'hydroponic_reservoir'
  | 'other';

export type NutrientObservationType =
  | 'normal_vigor'
  | 'chlorosis'
  | 'leaf_edge_damage'
  | 'stunted_growth'
  | 'purpling'
  | 'interveinal_chlorosis'
  | 'possible_deficiency'
  | 'other';

export interface FeedingRecord {
  id: string;
  userId: string;
  plantId?: string | null;
  feedingDate: string; // ISO 8601
  productName: string;
  fertilizerType: FertilizerType;
  npkRatio?: string | null;
  formulation?: FertilizerFormulation | null;
  applicationMethod: FeedingApplicationMethod;
  dosageAmount?: number | null;
  dosageUnit?: string | null;
  dosageUnknown: boolean;
  sourceReference?: string | null;
  nextPlannedDate?: string | null;
  growerObservation?: string | null;
  nutrientObservation?: NutrientObservationType | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedingSummary {
  lastFeeding?: FeedingRecord | null;
  totalFeedingsRecorded: number;
  nextPlannedDate?: string | null;
  recentProductsUsed: string[];
}

// ==============================================================================
// 4. PROPAGATION SYSTEM
// ==============================================================================

export type PropagationMethod =
  | 'seed'
  | 'cutting'
  | 'division'
  | 'runner'
  | 'layering'
  | 'grafting'
  | 'other';

export type PropagationStatus =
  | 'in_progress'
  | 'success'
  | 'failure'
  | 'pending_outcome';

export interface PropagationEvent {
  id: string;
  userId: string;
  parentPlantId: string;
  parentPlantNickname?: string | null;
  propagationMethod: PropagationMethod;
  startedDate: string; // YYYY-MM-DD
  medium?: string | null;
  environment?: string | null;
  notes?: string | null;
  expectedFollowupDate?: string | null;
  status: PropagationStatus;
  outcomeDate?: string | null;
  offspringPlantId?: string | null;
  offspringPlantNickname?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlantLineageInfo {
  plantId: string;
  nickname: string;
  parentPlantId?: string | null;
  parentNickname?: string | null;
  propagationMethod?: PropagationMethod | null;
  propagationDate?: string | null;
  offspringCount: number;
  offspring: Array<{ id: string; nickname: string; status: string }>;
}

// ==============================================================================
// 5. PRODUCTION / CROP CYCLES & BATCHES
// ==============================================================================

export type ProductionStage =
  | 'planned'
  | 'nursery'
  | 'vegetative'
  | 'flowering'
  | 'harvesting'
  | 'closed';

export type ProductionCycleStatus =
  | 'planned'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled';

export interface ProductionCycle {
  id: string;
  userId: string;
  cycleName: string;
  plantSlug: string;
  growingArea?: string | null;
  startDate: string; // YYYY-MM-DD
  expectedEndDate?: string | null;
  actualEndDate?: string | null;
  stage: ProductionStage;
  quantityPlanted: number;
  quantityActive: number;
  quantityLost: number;
  quantityHarvested: number;
  status: ProductionCycleStatus;
  notes?: string | null;
  linkedPlantIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CropCycleComparison {
  cycleA: ProductionCycle;
  cycleB: ProductionCycle;
  durationDaysA?: number | null;
  durationDaysB?: number | null;
  totalHarvestA: number;
  totalHarvestB: number;
  lossRateA?: number | null;
  lossRateB?: number | null;
  comparisonNotes: string[];
}

// ==============================================================================
// 6. HARVEST TRACKING & YIELD INTELLIGENCE
// ==============================================================================

export type HarvestUnit =
  | 'g'
  | 'kg'
  | 'oz'
  | 'lb'
  | 'pieces'
  | 'bunches'
  | 'units';

export type HarvestType =
  | 'full_harvest'
  | 'cut_and_come_again'
  | 'pruning_yield'
  | 'thinning';

export type HarvestQualityObservation =
  | 'prime'
  | 'good'
  | 'acceptable'
  | 'substandard'
  | 'blemished';

export interface HarvestRecord {
  id: string;
  userId: string;
  plantId?: string | null;
  productionCycleId?: string | null;
  harvestDate: string; // ISO 8601
  quantity: number;
  unit: HarvestUnit;
  harvestType: HarvestType;
  qualityObservation?: HarvestQualityObservation | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface YieldMetrics {
  totalHarvestCount: number;
  totalsByUnit: Record<string, number>;
  averageHarvestPerEventByUnit: Record<string, number>;
  yieldPerArea?: {
    yieldAmount: number;
    unit: string;
    areaSquareMeters: number;
    yieldPerSquareMeter: number;
  } | null;
  firstHarvestDate?: string | null;
  latestHarvestDate?: string | null;
  harvestFrequencyDays?: number | null;
}

// ==============================================================================
// 7. PRODUCTION-AWARE SPACE ADVISORY
// ==============================================================================

export interface ProductionSpaceMetrics {
  totalSpaceCapacityUnits: number;
  activePlantsOccupied: number;
  occupancyRatePercent: number;
  activeCycleOccupancy: number;
  unusedCapacitySlots: number;
  tierDistribution: {
    top: number;
    middle: number;
    bottom: number;
    unassigned: number;
  };
  isStructuralSafetyVerified: boolean; // Structural capacity must not be assumed safe when unconfirmed
  advisories: string[];
}

// ==============================================================================
// 8. UNIFIED GROW INTELLIGENCE ENGINE DOMAIN
// ==============================================================================

export interface IntelligenceGap {
  area: 'conditions' | 'feeding' | 'growth' | 'health' | 'harvest';
  description: string;
  importance: 'recommended' | 'optional';
  actionableCheck: string;
}

export interface IntelligenceConcern {
  area: 'conditions' | 'feeding' | 'health' | 'growth';
  severity: 'low' | 'moderate' | 'high';
  provenance: ProvenanceCategory;
  title: string;
  evidence: string[];
  safeRecommendation: string;
}

export interface IntelligenceOpportunity {
  title: string;
  description: string;
  evidence: string;
  safeNextStep: string;
}

export interface IntelligenceAction {
  id: string;
  actionTitle: string;
  reason: string;
  provenance: ProvenanceCategory;
  category: 'observe' | 'water' | 'feed' | 'check_health' | 'harvest' | 'propagate';
  urgency: 'low' | 'normal' | 'high';
}

export interface PlantCurrentStateSummary {
  identity: {
    plantId: string;
    nickname: string;
    plantSlug: string;
    plantedDate: string;
    ageDisplay: string;
    currentStage: GrowthStage;
  };
  health: {
    status: PlantHealthStatus;
    lastDiagnosisSummary?: string | null;
    isAiHypothesis: boolean;
  };
  growth: {
    totalNotes: number;
    lastNoteDate?: string | null;
    photoCount: number;
  };
  environment: {
    lastObserved?: string | null;
    summaryStatus: 'observed' | 'partially_observed' | 'unrecorded';
  };
  feeding: {
    lastFed?: string | null;
    totalFeedings: number;
    scheduledNext?: string | null;
  };
  production: {
    totalHarvestCount: number;
    totalYieldByUnit: Record<string, number>;
    hasActiveCycle: boolean;
  };
}

export interface UnifiedGrowIntelligence {
  plantId: string;
  plantNickname: string;
  currentState: PlantCurrentStateSummary;
  evidenceFacts: string[];
  informationGaps: IntelligenceGap[];
  concerns: IntelligenceConcern[];
  opportunities: IntelligenceOpportunity[];
  nextActions: IntelligenceAction[];
  generatedAt: string;
}

// ==============================================================================
// 9. DASHBOARD DATA AGGREGATION
// ==============================================================================

export interface GrowIntelligenceDashboardData {
  gardenOverview: {
    totalPlants: number;
    stageCounts: Record<string, number>;
    healthCounts: Record<string, number>;
  };
  todayActionCount: number;
  activeReminders: Reminder[];
  conditionsHighlights: {
    recentlyObservedCount: number;
    plantsMissingConditionsCount: number;
    concernsCount: number;
  };
  feedingHighlights: {
    recentlyFedCount: number;
    upcomingFeedingCount: number;
  };
  propagationHighlights: {
    activeEventsCount: number;
    successfulEventsCount: number;
  };
  productionHighlights: {
    activeCyclesCount: number;
    totalHarvestsRecorded: number;
    totalYieldByUnit: Record<string, number>;
  };
  spaceHighlights: ProductionSpaceMetrics;
}

