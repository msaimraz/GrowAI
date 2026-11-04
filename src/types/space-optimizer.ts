/**
 * GrowAI Phase 7B.1 — Small-Space & Vertical Garden Optimization Types
 *
 * Design Principles:
 * 1. Independent pure types with NO browser, React, Supabase, or network dependencies.
 * 2. Explicit representation of unavailable or unverified data (distinguishing Valid,
 *    Warning, Invalid, and Insufficient Data). Unknown values are NEVER silently converted to zero.
 * 3. Separation of manufacturer-confirmed structural load ratings from estimated wet loads.
 * 4. Transparent distinction between confirmed physical measurements and illustrative/simulated assumptions.
 */

import { Plant, SunlightRequirement, VerticalTier } from './plant';

// ==============================================================================
// 1. MEASUREMENT UNITS & CONVERSIONS
// ==============================================================================

export type LengthUnit = 'cm' | 'in';
export type WeightUnit = 'kg' | 'lb';
export type VolumeUnit = 'L' | 'gal' | 'cm3';

export interface SpaceDimensions {
  width: number;
  depth: number;
  height: number;
  unit: LengthUnit;
}

export type DimensionValidationResult =
  | {
      isValid: true;
      dimensionsCm: { width: number; depth: number; height: number };
    }
  | {
      isValid: false;
      errors: string[];
      dimensionsCm?: undefined;
    };

// ==============================================================================
// 2. SHELF & TIER CONFIGURATION
// ==============================================================================

export interface ShelfInputDimensions {
  width: number;
  depth: number;
  verticalClearance?: number; // Headroom to shelf above or ceiling
  edgeMargin?: number; // Perimeter margin (pot lips, railing, frame)
  unit: LengthUnit;
}

export type UsableShelfResult =
  | {
      isValid: true;
      totalWidthCm: number;
      totalDepthCm: number;
      edgeMarginCm: number;
      usableWidthCm: number;
      usableDepthCm: number;
      usableAreaCm2: number;
      verticalClearanceCm?: number;
    }
  | {
      isValid: false;
      errors: string[];
    };

export type TierPositionName = 'top' | 'middle' | 'bottom' | 'custom';

export interface RackTierConfig {
  tierIndex: number; // 0-based indexing from top to bottom
  tierName?: string;
  position: TierPositionName;
  shelfDimensions: ShelfInputDimensions;
  /**
   * Confirmed manufacturer Safe Working Load (SWL) for this specific shelf in kg.
   * If not confirmed by manufacturer, MUST remain undefined (never guessed).
   */
  confirmedShelfLoadRatingKg?: number;
  /**
   * Configurable ambient light attenuation multiplier (e.g. 0.70).
   * MUST be marked as simulated/illustrative if not sensor-measured.
   */
  lightAttenuationMultiplier?: number;
}

// ==============================================================================
// 3. CONTAINER GEOMETRY
// ==============================================================================

export type ContainerShape = 'circular' | 'rectangular' | 'trough';

export interface CircularContainerInput {
  shape: 'circular';
  topDiameter: number;
  bottomDiameter?: number; // If omitted, conical taper is approximated (default ~0.75 ratio)
  height: number;
  unit: LengthUnit;
  tareWeightKg?: number;
}

export interface RectangularContainerInput {
  shape: 'rectangular';
  width: number;
  length: number;
  height: number;
  unit: LengthUnit;
  tareWeightKg?: number;
}

export interface PlanterTroughInput {
  shape: 'trough';
  width: number;
  length: number;
  height: number;
  unit: LengthUnit;
  tareWeightKg?: number;
}

export type ContainerInput =
  | CircularContainerInput
  | RectangularContainerInput
  | PlanterTroughInput;

export interface ContainerMetrics {
  shape: ContainerShape;
  footprintWidthCm: number; // Maximum linear dimension taken on shelf
  footprintDepthCm: number; // Maximum depth taken on shelf
  footprintAreaCm2: number;
  heightCm: number;
  soilVolumeLiters: number;
  soilVolumeCm3: number;
  tareWeightKg?: number;
  approximationNotes?: string;
}

// ==============================================================================
// 4. PLANT PACKING & PLACEMENT EVALUATION
// ==============================================================================

export interface PlantPackingItem {
  id: string;
  plantSlug?: string;
  commonName?: string;
  container: ContainerMetrics;
  /**
   * Verified in-row spacing from botanical catalog (e.g., plant.potting.spacingCm).
   * Undefined if unavailable in catalog.
   */
  botanicalSpacingCm?: number;
  /**
   * Verified mature canopy spread in cm if documented.
   * Undefined if unavailable (must not be assumed).
   */
  matureCanopySpreadCm?: number;
  /**
   * Verified mature plant height in cm if documented.
   * Undefined if unavailable (must not be assumed).
   */
  matureHeightCm?: number;
}

export type PackingStatus =
  | 'width_only_fit'
  | 'two_dimensional_fit'
  | 'overflow_width'
  | 'overflow_depth'
  | 'insufficient_geometric_data';

export interface LinearPackingPlacement {
  item: PlantPackingItem;
  effectiveWidthCm: number;
  startPositionCm: number;
  endPositionCm: number;
}

export interface LinearPackingResult {
  status: PackingStatus;
  usableWidthCm: number;
  occupiedWidthCm: number;
  remainingWidthCm: number;
  itemCount: number;
  canopyCollisionVerified: boolean;
  canopyVerificationNotes?: string;
  placements: LinearPackingPlacement[];
  warnings: string[];
}

export interface TwoDimensionalPlacementResult {
  status: PackingStatus;
  usableWidthCm: number;
  usableDepthCm: number;
  usableAreaCm2: number;
  occupiedAreaCm2: number;
  areaUtilizationRatio: number;
  /**
   * Strictly FALSE if only linear packing was evaluated or geometric dimensions are incomplete.
   */
  isFullyOptimized: boolean;
  notes: string;
}

// ==============================================================================
// 5. WET-WEIGHT ESTIMATION & STRUCTURAL LOAD
// ==============================================================================

export interface WetWeightConfig {
  /**
   * Saturated soil bulk density at field capacity in kg/L.
   * Explicit input, default typical range: 0.95 - 1.15 kg/L.
   */
  saturatedSoilDensityKgPerLiter: number;
  /**
   * Estimated plant vegetative/fruit mass in kg.
   * Undefined if unknown.
   */
  plantBiomassKg?: number;
  /**
   * Estimated tare weight of the container in kg if not provided in container input.
   */
  fallbackContainerTareKg?: number;
}

export type WetWeightStatus = 'confirmed' | 'estimated' | 'incomplete';

export interface WetWeightResult {
  status: WetWeightStatus;
  soilVolumeLiters: number;
  soilWetWeightKg?: number;
  containerTareWeightKg?: number;
  plantBiomassKg?: number;
  totalEstimatedWeightKg?: number;
  assumptionsUsed: {
    saturatedSoilDensityKgPerLiter: number;
    isDensityAssumed: boolean;
    isTareAssumed: boolean;
    isBiomassAssumed: boolean;
    missingInputs: string[];
  };
}

export type StructuralLoadStatus =
  | 'within_confirmed_limit'
  | 'exceeds_confirmed_limit'
  | 'unknown_load_capacity';

export interface StructuralLoadResult {
  status: StructuralLoadStatus;
  estimatedTotalWetLoadKg: number;
  confirmedSafeWorkingLoadKg?: number; // Undefined if unknown
  utilizationRatio?: number; // load / confirmed
  explanation: string;
}

// ==============================================================================
// 6. VERTICAL CLEARANCE EVALUATION
// ==============================================================================

export type VerticalClearanceStatus =
  | 'adequate_clearance'
  | 'vertical_clearance_collision'
  | 'insufficient_clearance_data';

export interface VerticalClearanceResult {
  status: VerticalClearanceStatus;
  availableClearanceCm?: number;
  requiredClearanceCm?: number;
  containerHeightCm?: number;
  maturePlantHeightCm?: number;
  ventilationBufferCm: number;
  clearanceMarginCm?: number; // available - required
  explanation: string;
}

// ==============================================================================
// 7. PHOTOBIOLOGY & LIGHT SUITABILITY
// ==============================================================================

export type LightEnvironmentType = 'outdoor' | 'indoor_natural' | 'indoor_grow_lights';

export type LightSuitabilityStatus =
  | 'optimal'
  | 'acceptable'
  | 'insufficient_light'
  | 'excessive_light_risk'
  | 'unverified_light';

export interface TierLightModelConfig {
  modelName: string;
  isSimulatedAssumption: boolean;
  tierMultipliers: Record<string | number, number>;
}

export interface LightSuitabilityResult {
  status: LightSuitabilityStatus;
  plantRequiredCategory?: SunlightRequirement;
  availableEnvironment: LightEnvironmentType;
  estimatedAvailableHours?: number;
  appliedAttenuationMultiplier?: number;
  isAttenuationSimulated: boolean;
  explanation: string;
}

// ==============================================================================
// 8. BOTANICAL COMPATIBILITY
// ==============================================================================

export type BotanicalCompatibilityStatus =
  | 'compatible'
  | 'invasive_isolation_required'
  | 'incompatible'
  | 'unverified';

export interface BotanicalCompatibilityResult {
  status: BotanicalCompatibilityStatus;
  ruleName?: string;
  explanation: string;
  evidenceSource: 'catalog_notes' | 'verified_botanical_rule' | 'unverified';
}

// ==============================================================================
// 9. UNIFIED OPTIMIZATION RECOMMENDATIONS
// ==============================================================================

export type RecommendationSeverity =
  | 'success'
  | 'info'
  | 'warning'
  | 'critical'
  | 'insufficient_data';

export type RecommendationCategory =
  | 'spatial'
  | 'structural'
  | 'light'
  | 'botanical'
  | 'clearance';

export interface OptimizationRecommendation {
  severity: RecommendationSeverity;
  category: RecommendationCategory;
  title: string;
  explanation: string;
  suggestedAction?: string;
  evidenceOrInputs: Record<string, unknown>;
  isEstimated: boolean;
}

// ==============================================================================
// 10. SPACE CONFIGURATION PERSISTENCE & STORAGE TYPES (Phase 7B.2)
// ==============================================================================

export const CURRENT_SPACE_SCHEMA_VERSION = 1;

export type SpaceType =
  | 'balcony_rack'
  | 'windowsill'
  | 'indoor_grow_tent'
  | 'vertical_hydroponics'
  | 'patio_bakers_rack'
  | 'custom';

export type SpaceEnvironment = 'indoor' | 'outdoor_sheltered' | 'outdoor_exposed';

export type SpaceOrientation = 'north' | 'south' | 'east' | 'west' | 'unspecified';

export interface SavedPlacementSlot {
  id: string; // Unique slot ID (e.g. uuid)
  tierIndex: number;
  slotIndex: number;
  plantSlug: string; // Must match slug in PLANTS_DATA
  customNickname?: string;
  container: ContainerInput;
}

export interface SpaceConfigProfile {
  schemaVersion: number; // For schema migrations (CURRENT_SPACE_SCHEMA_VERSION = 1)
  id: string;
  name: string;
  spaceType: SpaceType;
  environment: SpaceEnvironment;
  orientation?: SpaceOrientation;
  dimensions: SpaceDimensions;
  sunlightHours: number;
  tiers: RackTierConfig[];
  placements: SavedPlacementSlot[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type SpaceConfigValidationResult =
  | {
      isValid: true;
      profile: SpaceConfigProfile;
    }
  | {
      isValid: false;
      errors: string[];
      profile?: undefined;
    };

/**
 * Cloud persistence preparation interface for future Phase 7B cloud synchronization.
 * Prepared cleanly without executing un-migrated database queries.
 */
export interface SpaceStorageAdapter {
  isCloud: boolean;
  getSpaces(): Promise<{ spaces: SpaceConfigProfile[]; error?: string }>;
  getSpaceById(id: string): Promise<{ space: SpaceConfigProfile | null; error?: string }>;
  saveSpace(space: SpaceConfigProfile): Promise<{ space?: SpaceConfigProfile; error?: string }>;
  deleteSpace(id: string): Promise<{ success: boolean; error?: string }>;
  getActiveSpaceId(): Promise<string | null>;
  setActiveSpaceId(id: string | null): Promise<void>;
}

