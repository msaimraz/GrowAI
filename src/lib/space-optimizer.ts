/**
 * GrowAI Phase 7B.1 — Small-Space & Vertical Garden Pure Calculation Engine
 *
 * Deterministic calculation functions with ZERO external dependencies:
 * - No React, Next.js, Supabase, localStorage, or browser APIs.
 * - Explicit distinction between confirmed inputs and illustrative assumptions.
 * - Missing measurements are explicitly marked as undefined/insufficient data,
 *   NEVER silently coerced to zero.
 * - Separates estimated wet loads from manufacturer-confirmed safe working loads.
 */

import {
  LengthUnit,
  SpaceDimensions,
  DimensionValidationResult,
  ShelfInputDimensions,
  UsableShelfResult,
  ContainerInput,
  ContainerMetrics,
  PlantPackingItem,
  LinearPackingResult,
  LinearPackingPlacement,
  TwoDimensionalPlacementResult,
  WetWeightConfig,
  WetWeightResult,
  StructuralLoadResult,
  VerticalClearanceResult,
  LightEnvironmentType,
  LightSuitabilityResult,
  BotanicalCompatibilityResult,
  OptimizationRecommendation,
} from '@/types/space-optimizer';
import { SunlightRequirement } from '@/types/plant';

// ==============================================================================
// 1. UNIT CONVERSIONS & DIMENSION VALIDATION
// ==============================================================================

const CM_PER_INCH = 2.54;
const CM3_PER_LITER = 1000.0;

/**
 * Converts centimeters to inches. Rounded to 4 decimal places to avoid IEEE-754 drift.
 */
export function cmToInches(cm: number): number {
  if (isNaN(cm)) return NaN;
  return Number((cm / CM_PER_INCH).toFixed(4));
}

/**
 * Converts inches to centimeters. Rounded to 4 decimal places to avoid IEEE-754 drift.
 */
export function inchesToCm(inches: number): number {
  if (isNaN(inches)) return NaN;
  return Number((inches * CM_PER_INCH).toFixed(4));
}

/**
 * Converts liters to cubic centimeters (1 L = 1000 cm³).
 */
export function litersToCm3(liters: number): number {
  if (isNaN(liters)) return NaN;
  return Number((liters * CM3_PER_LITER).toFixed(4));
}

/**
 * Converts cubic centimeters to liters (1000 cm³ = 1 L).
 */
export function cm3ToLiters(cm3: number): number {
  if (isNaN(cm3)) return NaN;
  return Number((cm3 / CM3_PER_LITER).toFixed(4));
}

/**
 * Normalizes length to centimeters based on unit.
 */
export function toCentimeters(val: number, unit: LengthUnit): number {
  if (isNaN(val)) return NaN;
  return unit === 'in' ? inchesToCm(val) : Number(val.toFixed(4));
}

/**
 * Validates 3D space dimensions.
 * Rejects negative, zero, NaN, or non-finite numbers.
 */
export function validateSpaceDimensions(dimensions: SpaceDimensions): DimensionValidationResult {
  const errors: string[] = [];

  if (typeof dimensions.width !== 'number' || isNaN(dimensions.width) || !isFinite(dimensions.width) || dimensions.width <= 0) {
    errors.push(`Width must be a positive number (received: ${dimensions.width}).`);
  }
  if (typeof dimensions.depth !== 'number' || isNaN(dimensions.depth) || !isFinite(dimensions.depth) || dimensions.depth <= 0) {
    errors.push(`Depth must be a positive number (received: ${dimensions.depth}).`);
  }
  if (typeof dimensions.height !== 'number' || isNaN(dimensions.height) || !isFinite(dimensions.height) || dimensions.height <= 0) {
    errors.push(`Height must be a positive number (received: ${dimensions.height}).`);
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    dimensionsCm: {
      width: toCentimeters(dimensions.width, dimensions.unit),
      depth: toCentimeters(dimensions.depth, dimensions.unit),
      height: toCentimeters(dimensions.height, dimensions.unit),
    },
  };
}

// ==============================================================================
// 2. USABLE SHELF DIMENSIONS
// ==============================================================================

/**
 * Calculates usable shelf dimensions taking into account perimeter edge margins
 * and validating against overall enclosing space dimensions when provided.
 */
export function calculateUsableShelfDimensions(
  shelf: ShelfInputDimensions,
  overallSpace?: SpaceDimensions
): UsableShelfResult {
  const errors: string[] = [];

  const rawWidth = toCentimeters(shelf.width, shelf.unit);
  const rawDepth = toCentimeters(shelf.depth, shelf.unit);
  const edgeMarginCm = shelf.edgeMargin !== undefined ? toCentimeters(shelf.edgeMargin, shelf.unit) : 0;
  const verticalClearanceCm =
    shelf.verticalClearance !== undefined ? toCentimeters(shelf.verticalClearance, shelf.unit) : undefined;

  if (isNaN(rawWidth) || rawWidth <= 0) {
    errors.push(`Shelf width must be greater than zero (received: ${shelf.width}).`);
  }
  if (isNaN(rawDepth) || rawDepth <= 0) {
    errors.push(`Shelf depth must be greater than zero (received: ${shelf.depth}).`);
  }
  if (isNaN(edgeMarginCm) || edgeMarginCm < 0) {
    errors.push(`Edge margin cannot be negative (received: ${shelf.edgeMargin}).`);
  }
  if (verticalClearanceCm !== undefined && (isNaN(verticalClearanceCm) || verticalClearanceCm <= 0)) {
    errors.push(`Vertical clearance must be greater than zero when specified.`);
  }

  // Check bounds against overall space if provided
  if (overallSpace) {
    const spaceVal = validateSpaceDimensions(overallSpace);
    if (spaceVal.isValid) {
      if (rawWidth > spaceVal.dimensionsCm.width) {
        errors.push(
          `Shelf width (${rawWidth} cm) exceeds overall space width (${spaceVal.dimensionsCm.width} cm).`
        );
      }
      if (rawDepth > spaceVal.dimensionsCm.depth) {
        errors.push(
          `Shelf depth (${rawDepth} cm) exceeds overall space depth (${spaceVal.dimensionsCm.depth} cm).`
        );
      }
    }
  }

  const usableWidthCm = Number((rawWidth - 2 * edgeMarginCm).toFixed(2));
  const usableDepthCm = Number((rawDepth - 2 * edgeMarginCm).toFixed(2));

  if (usableWidthCm <= 0) {
    errors.push(
      `Edge margin (${edgeMarginCm * 2} cm total) equals or exceeds shelf width (${rawWidth} cm).`
    );
  }
  if (usableDepthCm <= 0) {
    errors.push(
      `Edge margin (${edgeMarginCm * 2} cm total) equals or exceeds shelf depth (${rawDepth} cm).`
    );
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  const usableAreaCm2 = Number((usableWidthCm * usableDepthCm).toFixed(2));

  return {
    isValid: true,
    totalWidthCm: rawWidth,
    totalDepthCm: rawDepth,
    edgeMarginCm,
    usableWidthCm,
    usableDepthCm,
    usableAreaCm2,
    verticalClearanceCm,
  };
}

// ==============================================================================
// 3. CONTAINER GEOMETRY & SOIL VOLUME
// ==============================================================================

/**
 * Calculates physical container footprint and substrate/soil volume.
 *
 * Geometric approximation for circular containers:
 * - If bottomDiameter is explicitly supplied, the volume is computed using the exact
 *   formula for the frustum of a right circular cone:
 *   V = (π * h / 3) * (r_top² + r_top * r_bottom + r_bottom²)
 * - If bottomDiameter is omitted, standard horticultural container taper is approximated
 *   with an assumed bottom-to-top diameter ratio of 0.75:
 *   r_bottom = 0.75 * r_top => V ≈ 0.7708 * (π * r_top² * h)
 */
export function calculateContainerMetrics(input: ContainerInput): ContainerMetrics {
  const heightCm = toCentimeters(input.height, input.unit);

  if (input.shape === 'circular') {
    const topDiameterCm = toCentimeters(input.topDiameter, input.unit);
    const rTop = topDiameterCm / 2.0;
    let volumeCm3 = 0;
    let approximationNotes = '';

    if (input.bottomDiameter !== undefined) {
      const bottomDiameterCm = toCentimeters(input.bottomDiameter, input.unit);
      const rBottom = bottomDiameterCm / 2.0;
      volumeCm3 = (Math.PI * heightCm / 3.0) * (rTop * rTop + rTop * rBottom + rBottom * rBottom);
      approximationNotes = `Exact conical frustum calculated from top diameter (${topDiameterCm} cm) and bottom diameter (${bottomDiameterCm} cm).`;
    } else {
      // Standard commercial nursery pot taper approximation (~0.75 bottom ratio)
      const rBottomAssumed = 0.75 * rTop;
      volumeCm3 = (Math.PI * heightCm / 3.0) * (rTop * rTop + rTop * rBottomAssumed + rBottomAssumed * rBottomAssumed);
      approximationNotes = `Estimated conical frustum assuming standard 0.75 bottom-to-top diameter taper ratio.`;
    }

    const soilVolumeCm3 = Number(volumeCm3.toFixed(2));
    const soilVolumeLiters = Number(cm3ToLiters(soilVolumeCm3).toFixed(3));
    const footprintAreaCm2 = Number((Math.PI * rTop * rTop).toFixed(2));

    return {
      shape: 'circular',
      footprintWidthCm: topDiameterCm,
      footprintDepthCm: topDiameterCm,
      footprintAreaCm2,
      heightCm,
      soilVolumeCm3,
      soilVolumeLiters,
      tareWeightKg: input.tareWeightKg,
      approximationNotes,
    };
  }

  // Rectangular Container or Planter Trough
  const widthCm = toCentimeters(input.width, input.unit);
  const lengthCm = toCentimeters(input.length, input.unit);

  const soilVolumeCm3 = Number((lengthCm * widthCm * heightCm).toFixed(2));
  const soilVolumeLiters = Number(cm3ToLiters(soilVolumeCm3).toFixed(3));
  const footprintAreaCm2 = Number((lengthCm * widthCm).toFixed(2));

  return {
    shape: input.shape,
    footprintWidthCm: lengthCm, // Length aligns with shelf length
    footprintDepthCm: widthCm,
    footprintAreaCm2,
    heightCm,
    soilVolumeCm3,
    soilVolumeLiters,
    tareWeightKg: input.tareWeightKg,
    approximationNotes: `Direct rectangular cuboid (length × width × height).`,
  };
}

// ==============================================================================
// 4. PLANT SPACING & PACKING EVALUATION
// ==============================================================================

/**
 * Evaluates linear in-row packing of containers along a shelf.
 *
 * Distinguishes:
 * - width_only_fit: Fits along width and depth, but canopy collision cannot be fully verified.
 * - overflow_width: Sum of container footprints and spacings exceeds usable shelf width.
 * - overflow_depth: Container depth exceeds usable shelf depth.
 * - insufficient_geometric_data: Invalid shelf or missing container geometry.
 *
 * NOTE: Never labels a shelf as fully optimized based only on a 1D width calculation.
 */
export function evaluateLinearPacking(
  items: PlantPackingItem[],
  shelf: UsableShelfResult,
  itemGapCm = 2.0
): LinearPackingResult {
  if (!shelf.isValid) {
    return {
      status: 'insufficient_geometric_data',
      usableWidthCm: 0,
      occupiedWidthCm: 0,
      remainingWidthCm: 0,
      itemCount: items.length,
      canopyCollisionVerified: false,
      canopyVerificationNotes: 'Shelf dimensions are invalid.',
      placements: [],
      warnings: ['Cannot evaluate linear packing: Shelf dimensions are invalid.'],
    };
  }

  const warnings: string[] = [];
  const placements: LinearPackingPlacement[] = [];
  let currentPosition = 0;
  let hasMissingCanopyData = false;
  let depthOverflowDetected = false;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    // Check shelf depth fit
    if (item.container.footprintDepthCm > shelf.usableDepthCm) {
      depthOverflowDetected = true;
      warnings.push(
        `Container for '${item.commonName || item.plantSlug || `Item ${i + 1}`}' depth (${item.container.footprintDepthCm} cm) exceeds usable shelf depth (${shelf.usableDepthCm} cm).`
      );
    }

    // Determine effective linear width requirement
    // Priority: max of container footprint and verified botanical in-row spacing
    let effectiveWidth = item.container.footprintWidthCm;

    if (item.botanicalSpacingCm !== undefined && item.botanicalSpacingCm > effectiveWidth) {
      effectiveWidth = item.botanicalSpacingCm;
    }

    if (item.matureCanopySpreadCm !== undefined && item.matureCanopySpreadCm > effectiveWidth) {
      effectiveWidth = item.matureCanopySpreadCm;
    } else if (item.matureCanopySpreadCm === undefined) {
      hasMissingCanopyData = true;
    }

    const startPositionCm = currentPosition;
    const endPositionCm = Number((currentPosition + effectiveWidth).toFixed(2));

    placements.push({
      item,
      effectiveWidthCm: effectiveWidth,
      startPositionCm,
      endPositionCm,
    });

    currentPosition = endPositionCm;

    // Add inter-pot gap between items (not after the last item)
    if (i < items.length - 1) {
      currentPosition = Number((currentPosition + itemGapCm).toFixed(2));
    }
  }

  const occupiedWidthCm = Number(currentPosition.toFixed(2));
  const remainingWidthCm = Number((shelf.usableWidthCm - occupiedWidthCm).toFixed(2));

  let status: LinearPackingResult['status'] = 'width_only_fit';

  if (occupiedWidthCm > shelf.usableWidthCm) {
    status = 'overflow_width';
    warnings.push(
      `Occupied width (${occupiedWidthCm} cm) exceeds usable shelf width (${shelf.usableWidthCm} cm) by ${Math.abs(remainingWidthCm)} cm.`
    );
  } else if (depthOverflowDetected) {
    status = 'overflow_depth';
  }

  const canopyCollisionVerified = !hasMissingCanopyData;
  const canopyVerificationNotes = hasMissingCanopyData
    ? 'One or more species lack mature canopy spread data in the catalog. Linear canopy collision cannot be fully verified.'
    : 'All species have verified canopy or spacing parameters.';

  return {
    status,
    usableWidthCm: shelf.usableWidthCm,
    occupiedWidthCm,
    remainingWidthCm,
    itemCount: items.length,
    canopyCollisionVerified,
    canopyVerificationNotes,
    placements,
    warnings,
  };
}

/**
 * Extensible interface for two-dimensional placement evaluation.
 *
 * NOTE: Explicitly marks isFullyOptimized as FALSE when only linear
 * packing or area ratios are evaluated, preventing false claims of complete spatial optimization.
 */
export function evaluateTwoDimensionalPlacement(
  items: PlantPackingItem[],
  shelf: UsableShelfResult
): TwoDimensionalPlacementResult {
  if (!shelf.isValid) {
    return {
      status: 'insufficient_geometric_data',
      usableWidthCm: 0,
      usableDepthCm: 0,
      usableAreaCm2: 0,
      occupiedAreaCm2: 0,
      areaUtilizationRatio: 0,
      isFullyOptimized: false,
      notes: 'Shelf dimensions are invalid.',
    };
  }

  let totalOccupiedArea = 0;
  for (const item of items) {
    totalOccupiedArea += item.container.footprintAreaCm2;
  }

  const areaUtilizationRatio =
    shelf.usableAreaCm2 > 0 ? Number((totalOccupiedArea / shelf.usableAreaCm2).toFixed(4)) : 0;

  let status: TwoDimensionalPlacementResult['status'] = 'width_only_fit';
  if (totalOccupiedArea > shelf.usableAreaCm2) {
    status = 'overflow_width';
  }

  return {
    status,
    usableWidthCm: shelf.usableWidthCm,
    usableDepthCm: shelf.usableDepthCm,
    usableAreaCm2: shelf.usableAreaCm2,
    occupiedAreaCm2: Number(totalOccupiedArea.toFixed(2)),
    areaUtilizationRatio,
    isFullyOptimized: false, // Must NEVER be claimed true from simple area or 1D packing
    notes:
      'Preliminary area calculation. Full two-dimensional staggered packing requires 2D coordinates; layout is not certified fully optimized.',
  };
}

// ==============================================================================
// 5. WET-WEIGHT ESTIMATION & STRUCTURAL LOAD
// ==============================================================================

/**
 * Calculates estimated saturated wet load for a container.
 *
 * Inputs are explicitly tracked. Does NOT silently assume universal soil density
 * or plant biomass without recording those assumptions in the result.
 */
export function estimateContainerWetWeight(
  container: ContainerMetrics,
  config?: Partial<WetWeightConfig>
): WetWeightResult {
  const missingInputs: string[] = [];

  // 1. Saturated soil density
  let density = config?.saturatedSoilDensityKgPerLiter;
  let isDensityAssumed = false;
  if (density === undefined || isNaN(density) || density <= 0) {
    density = 1.05; // Typical field capacity density of wet organic potting mix (kg/L)
    isDensityAssumed = true;
  }

  const soilWetWeightKg = Number((container.soilVolumeLiters * density).toFixed(3));

  // 2. Container tare weight
  let containerTareKg = container.tareWeightKg;
  let isTareAssumed = false;
  if (containerTareKg === undefined) {
    if (config?.fallbackContainerTareKg !== undefined) {
      containerTareKg = config.fallbackContainerTareKg;
      isTareAssumed = true;
    } else {
      missingInputs.push('containerTareWeightKg');
    }
  }

  // 3. Plant biomass
  let plantBiomassKg = config?.plantBiomassKg;
  let isBiomassAssumed = false;
  if (plantBiomassKg === undefined) {
    missingInputs.push('plantBiomassKg');
  }

  // Determine result status
  let status: WetWeightResult['status'] = 'confirmed';
  if (missingInputs.length > 0) {
    status = 'incomplete';
  } else if (isDensityAssumed || isTareAssumed || isBiomassAssumed) {
    status = 'estimated';
  }

  const totalEstimatedWeightKg = Number(
    (soilWetWeightKg + (containerTareKg || 0) + (plantBiomassKg || 0)).toFixed(3)
  );

  return {
    status,
    soilVolumeLiters: container.soilVolumeLiters,
    soilWetWeightKg,
    containerTareWeightKg: containerTareKg,
    plantBiomassKg,
    totalEstimatedWeightKg,
    assumptionsUsed: {
      saturatedSoilDensityKgPerLiter: density,
      isDensityAssumed,
      isTareAssumed,
      isBiomassAssumed,
      missingInputs,
    },
  };
}

/**
 * Evaluates structural load against manufacturer-confirmed Safe Working Load (SWL).
 *
 * CRITICAL RULE: If confirmedSafeWorkingLoadKg is unavailable, the status is
 * 'unknown_load_capacity'. Never assigns a generic 25 kg or 80 kg as a verified safety limit.
 */
export function evaluateStructuralLoad(
  estimatedTotalWetLoadKg: number,
  confirmedSafeWorkingLoadKg?: number,
  tierIndex?: number
): StructuralLoadResult {
  if (
    confirmedSafeWorkingLoadKg === undefined ||
    isNaN(confirmedSafeWorkingLoadKg) ||
    confirmedSafeWorkingLoadKg <= 0
  ) {
    const tierPrefix = tierIndex !== undefined ? `Tier ${tierIndex + 1}` : 'Shelf';
    return {
      status: 'unknown_load_capacity',
      estimatedTotalWetLoadKg: Number(estimatedTotalWetLoadKg.toFixed(2)),
      confirmedSafeWorkingLoadKg: undefined,
      utilizationRatio: undefined,
      explanation: `${tierPrefix} has an estimated wet load of ${estimatedTotalWetLoadKg.toFixed(1)} kg. Manufacturer Safe Working Load (SWL) rating is unconfirmed. Do NOT assume generic structural safety without manufacturer confirmation.`,
    };
  }

  const utilizationRatio = Number((estimatedTotalWetLoadKg / confirmedSafeWorkingLoadKg).toFixed(4));
  const tierPrefix = tierIndex !== undefined ? `Tier ${tierIndex + 1}` : 'Shelf';

  if (estimatedTotalWetLoadKg > confirmedSafeWorkingLoadKg) {
    const excessKg = (estimatedTotalWetLoadKg - confirmedSafeWorkingLoadKg).toFixed(1);
    return {
      status: 'exceeds_confirmed_limit',
      estimatedTotalWetLoadKg: Number(estimatedTotalWetLoadKg.toFixed(2)),
      confirmedSafeWorkingLoadKg,
      utilizationRatio,
      explanation: `${tierPrefix} estimated wet load (${estimatedTotalWetLoadKg.toFixed(1)} kg) exceeds the manufacturer confirmed limit (${confirmedSafeWorkingLoadKg} kg) by ${excessKg} kg. Reduce container count or transfer heavy pots to the bottom tier/ground.`,
    };
  }

  const percentUtilized = (utilizationRatio * 100).toFixed(1);
  return {
    status: 'within_confirmed_limit',
    estimatedTotalWetLoadKg: Number(estimatedTotalWetLoadKg.toFixed(2)),
    confirmedSafeWorkingLoadKg,
    utilizationRatio,
    explanation: `${tierPrefix} estimated wet load (${estimatedTotalWetLoadKg.toFixed(1)} kg) is within the confirmed limit of ${confirmedSafeWorkingLoadKg} kg (${percentUtilized}% capacity utilized).`,
  };
}

// ==============================================================================
// 6. VERTICAL CLEARANCE EVALUATION
// ==============================================================================

/**
 * Calculates required vertical headroom against available shelf clearance.
 *
 * CRITICAL RULE: Does not invent mature plant height. If mature plant height
 * is missing from the catalog, returns 'insufficient_clearance_data'.
 */
export function evaluateVerticalClearance(
  availableClearanceCm: number | undefined,
  containerHeightCm: number | undefined,
  maturePlantHeightCm: number | undefined,
  ventilationBufferCm = 10.0
): VerticalClearanceResult {
  const missingFields: string[] = [];
  if (availableClearanceCm === undefined || isNaN(availableClearanceCm)) missingFields.push('availableClearanceCm');
  if (containerHeightCm === undefined || isNaN(containerHeightCm)) missingFields.push('containerHeightCm');
  if (maturePlantHeightCm === undefined || isNaN(maturePlantHeightCm)) missingFields.push('maturePlantHeightCm');

  if (missingFields.length > 0) {
    return {
      status: 'insufficient_clearance_data',
      availableClearanceCm,
      containerHeightCm,
      maturePlantHeightCm,
      ventilationBufferCm,
      explanation: `Vertical clearance cannot be verified: Missing measurements (${missingFields.join(', ')}). Mature plant height must not be assumed when absent from the botanical catalog.`,
    };
  }

  // All three fields are guaranteed defined numbers
  const requiredClearanceCm = Number(
    (containerHeightCm! + maturePlantHeightCm! + ventilationBufferCm).toFixed(2)
  );
  const clearanceMarginCm = Number((availableClearanceCm! - requiredClearanceCm).toFixed(2));

  if (clearanceMarginCm < 0) {
    const deficitCm = Math.abs(clearanceMarginCm).toFixed(1);
    return {
      status: 'vertical_clearance_collision',
      availableClearanceCm,
      requiredClearanceCm,
      containerHeightCm,
      maturePlantHeightCm,
      ventilationBufferCm,
      clearanceMarginCm,
      explanation: `Required vertical headroom (${requiredClearanceCm} cm = container ${containerHeightCm}cm + mature plant ${maturePlantHeightCm}cm + ventilation buffer ${ventilationBufferCm}cm) exceeds available clearance (${availableClearanceCm} cm) by ${deficitCm} cm. Foliage will collide with the upper shelf.`,
    };
  }

  return {
    status: 'adequate_clearance',
    availableClearanceCm,
    requiredClearanceCm,
    containerHeightCm,
    maturePlantHeightCm,
    ventilationBufferCm,
    clearanceMarginCm,
    explanation: `Available vertical clearance (${availableClearanceCm} cm) accommodates container (${containerHeightCm} cm), mature plant (${maturePlantHeightCm} cm), and ventilation buffer (${ventilationBufferCm} cm) with ${clearanceMarginCm} cm margin.`,
  };
}

// ==============================================================================
// 7. PHOTOBIOLOGY & LIGHT SUITABILITY
// ==============================================================================

/**
 * Evaluates light suitability accounting for environment, ambient photoperiod,
 * and configurable tier attenuation.
 *
 * CRITICAL RULE: Distinguishes direct sunlight from bright indirect light.
 * The illustrative multipliers (e.g. 1.0, 0.70, 0.45) are marked as simulated
 * assumptions, not real-world sensor measurements.
 */
export function evaluateLightSuitability(
  plantRequiredCategory: SunlightRequirement | undefined,
  availableEnvironment: LightEnvironmentType,
  ambientDirectHours?: number,
  tierMultiplier = 1.0,
  isAttenuationSimulated = true
): LightSuitabilityResult {
  if (!plantRequiredCategory) {
    return {
      status: 'unverified_light',
      availableEnvironment,
      isAttenuationSimulated,
      explanation: 'Plant sunlight requirements are not documented in the catalog.',
    };
  }

  // Calculate estimated hours if ambient light is provided
  const estimatedHours =
    ambientDirectHours !== undefined ? Number((ambientDirectHours * tierMultiplier).toFixed(2)) : undefined;

  // 1. Direct vs Indirect Light Incompatibility:
  // Shade-loving or bright-indirect species exposed to intense outdoor direct sun
  if (
    (plantRequiredCategory === 'bright-indirect' || plantRequiredCategory === 'low-light') &&
    availableEnvironment === 'outdoor' &&
    estimatedHours !== undefined &&
    estimatedHours > 5.0
  ) {
    return {
      status: 'excessive_light_risk',
      plantRequiredCategory,
      availableEnvironment,
      estimatedAvailableHours: estimatedHours,
      appliedAttenuationMultiplier: tierMultiplier,
      isAttenuationSimulated,
      explanation: `Species requires '${plantRequiredCategory}', but is positioned in intense outdoor direct sunlight (~${estimatedHours} hrs). High risk of solar leaf scorch and photobleaching.`,
    };
  }

  // 2. Indoor Natural Light Limitations:
  // Standard window glass filters out UV and up to 50% of photosynthetically active radiation (PAR).
  // Full-sun fruiting crops (e.g. Tomatoes) cannot set fruit reliably without artificial grow lights.
  if (plantRequiredCategory === 'full-sun' && availableEnvironment === 'indoor_natural') {
    return {
      status: 'insufficient_light',
      plantRequiredCategory,
      availableEnvironment,
      estimatedAvailableHours: estimatedHours,
      appliedAttenuationMultiplier: tierMultiplier,
      isAttenuationSimulated,
      explanation: `Full-sun fruiting crops require direct outdoor sunlight (6+ hrs) or dedicated PAR grow lights. Standard indoor window glass attenuates photosynthetically active radiation below fruiting threshold.`,
    };
  }

  // 3. Quantitative Hour Matching (when ambient direct hours are available):
  if (estimatedHours !== undefined) {
    if (plantRequiredCategory === 'full-sun') {
      if (estimatedHours >= 6.0) {
        return {
          status: 'optimal',
          plantRequiredCategory,
          availableEnvironment,
          estimatedAvailableHours: estimatedHours,
          appliedAttenuationMultiplier: tierMultiplier,
          isAttenuationSimulated,
          explanation: `Estimated light (~${estimatedHours} hrs) satisfies full-sun requirement (6+ hrs).`,
        };
      }
      if (estimatedHours >= 4.0) {
        return {
          status: 'acceptable',
          plantRequiredCategory,
          availableEnvironment,
          estimatedAvailableHours: estimatedHours,
          appliedAttenuationMultiplier: tierMultiplier,
          isAttenuationSimulated,
          explanation: `Estimated light (~${estimatedHours} hrs) is borderline for full-sun crops. May result in slower fruit development.`,
        };
      }
      return {
        status: 'insufficient_light',
        plantRequiredCategory,
        availableEnvironment,
        estimatedAvailableHours: estimatedHours,
        appliedAttenuationMultiplier: tierMultiplier,
        isAttenuationSimulated,
        explanation: `Estimated light (~${estimatedHours} hrs) is insufficient for full-sun crops (requires 6+ hrs). High risk of etiolated, leggy stems.`,
      };
    }

    if (plantRequiredCategory === 'partial-sun') {
      if (estimatedHours >= 3.0 && estimatedHours <= 6.0) {
        return {
          status: 'optimal',
          plantRequiredCategory,
          availableEnvironment,
          estimatedAvailableHours: estimatedHours,
          appliedAttenuationMultiplier: tierMultiplier,
          isAttenuationSimulated,
          explanation: `Estimated light (~${estimatedHours} hrs) perfectly matches partial-sun requirement (3–6 hrs).`,
        };
      }
      if (estimatedHours > 6.0) {
        return {
          status: 'acceptable',
          plantRequiredCategory,
          availableEnvironment,
          estimatedAvailableHours: estimatedHours,
          appliedAttenuationMultiplier: tierMultiplier,
          isAttenuationSimulated,
          explanation: `Estimated light (~${estimatedHours} hrs) exceeds typical partial-sun preferences. Monitor soil moisture to prevent heat-stress.`,
        };
      }
      return {
        status: 'insufficient_light',
        plantRequiredCategory,
        availableEnvironment,
        estimatedAvailableHours: estimatedHours,
        appliedAttenuationMultiplier: tierMultiplier,
        isAttenuationSimulated,
        explanation: `Estimated light (~${estimatedHours} hrs) is below the 3–4 hr minimum for partial-sun greens.`,
      };
    }
  }

  return {
    status: 'acceptable',
    plantRequiredCategory,
    availableEnvironment,
    estimatedAvailableHours: estimatedHours,
    appliedAttenuationMultiplier: tierMultiplier,
    isAttenuationSimulated,
    explanation: `Light compatibility is estimated based on '${plantRequiredCategory}' classification and ${availableEnvironment} environment.`,
  };
}

// ==============================================================================
// 8. BOTANICAL COMPATIBILITY
// ==============================================================================

/**
 * Evaluates companion and invasive botanical compatibility.
 *
 * CRITICAL RULE: Rules must be backed by documented catalog evidence.
 * Does not invent companion synergy or drainage-sharing rules.
 */
export function evaluateBotanicalCompatibility(
  items: PlantPackingItem[],
  isSharedTroughSoil = false
): BotanicalCompatibilityResult[] {
  const results: BotanicalCompatibilityResult[] = [];

  // Spearmint Isolation Rule: Verified in plants.ts ('Single container or dedicated tier (invasive runners)')
  const hasSpearmint = items.some((i) => i.plantSlug === 'spearmint');
  const hasOtherSpecies = items.some((i) => i.plantSlug !== 'spearmint');

  if (hasSpearmint && hasOtherSpecies && isSharedTroughSoil) {
    results.push({
      status: 'invasive_isolation_required',
      ruleName: 'Spearmint Rhizomatous Aggression',
      explanation:
        'Spearmint develops aggressive subterranean stolons and root runners. In a shared soil trough, mint outcompetes and chokes neighboring root zones. The catalog mandates a dedicated, isolated container.',
      evidenceSource: 'catalog_notes',
    });
  } else {
    results.push({
      status: 'compatible',
      explanation: 'No known catalog-documented negative allelopathic interactions detected between placed species.',
      evidenceSource: 'catalog_notes',
    });
  }

  return results;
}

// ==============================================================================
// 9. UNIFIED OPTIMIZATION RECOMMENDATIONS
// ==============================================================================

export interface FullTierEvaluationContext {
  tierIndex: number;
  tierName?: string;
  shelf: UsableShelfResult;
  packing: LinearPackingResult;
  structural: StructuralLoadResult;
  clearanceResults: VerticalClearanceResult[];
  lightResults: LightSuitabilityResult[];
  compatibility: BotanicalCompatibilityResult[];
}

/**
 * Aggregates diagnostic checks into actionable, transparent recommendations.
 *
 * CRITICAL RULE:
 * - Does not claim safety when structural load capacity is unknown.
 * - Does not guarantee yield increases.
 */
export function generateOptimizationRecommendations(
  context: FullTierEvaluationContext
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];
  const tierLabel = context.tierName || `Tier ${context.tierIndex + 1}`;

  // 1. Structural Load Recommendations
  if (context.structural.status === 'unknown_load_capacity') {
    recommendations.push({
      severity: 'insufficient_data',
      category: 'structural',
      title: `${tierLabel}: Structural Capacity Unconfirmed`,
      explanation: context.structural.explanation,
      suggestedAction: 'Consult rack manufacturer specifications to confirm Safe Working Load (SWL) before loading wet containers.',
      evidenceOrInputs: {
        estimatedWetLoadKg: context.structural.estimatedTotalWetLoadKg,
        confirmedRatingKg: 'unconfirmed',
      },
      isEstimated: true,
    });
  } else if (context.structural.status === 'exceeds_confirmed_limit') {
    recommendations.push({
      severity: 'critical',
      category: 'structural',
      title: `${tierLabel}: Safe Working Load Exceeded`,
      explanation: context.structural.explanation,
      suggestedAction: 'Transfer large heavy pots to the bottom tier or ground to maintain structural safety.',
      evidenceOrInputs: {
        estimatedWetLoadKg: context.structural.estimatedTotalWetLoadKg,
        confirmedLimitKg: context.structural.confirmedSafeWorkingLoadKg,
        utilizationRatio: context.structural.utilizationRatio,
      },
      isEstimated: false,
    });
  }

  // 2. Spatial Packing Recommendations
  if (context.packing.status === 'overflow_width') {
    recommendations.push({
      severity: 'warning',
      category: 'spatial',
      title: `${tierLabel}: Horizontal Overcrowding`,
      explanation: `Total occupied width (${context.packing.occupiedWidthCm} cm) exceeds shelf usable planting width (${context.packing.usableWidthCm} cm).`,
      suggestedAction: 'Remove or resize containers to maintain proper spacing for airflow and root health.',
      evidenceOrInputs: {
        usableWidthCm: context.packing.usableWidthCm,
        occupiedWidthCm: context.packing.occupiedWidthCm,
        remainingWidthCm: context.packing.remainingWidthCm,
      },
      isEstimated: false,
    });
  } else if (context.packing.status === 'overflow_depth') {
    recommendations.push({
      severity: 'critical',
      category: 'spatial',
      title: `${tierLabel}: Container Exceeds Shelf Depth`,
      explanation:
        context.packing.warnings[0] ||
        `One or more container footprints exceed shelf usable depth (${context.shelf.isValid ? context.shelf.usableDepthCm : 'unknown'} cm). Risk of container overhang or tipping.`,
      suggestedAction: 'Select narrower containers or position deeper pots on the floor or dedicated staging.',
      evidenceOrInputs: {
        usableDepthCm: context.shelf.isValid ? context.shelf.usableDepthCm : undefined,
        warnings: context.packing.warnings,
      },
      isEstimated: false,
    });
  } else if (context.packing.remainingWidthCm >= 20.0) {
    recommendations.push({
      severity: 'info',
      category: 'spatial',
      title: `${tierLabel}: Unused Linear Capacity Available`,
      explanation: `${context.packing.remainingWidthCm} cm of usable linear shelf space remains unallocated.`,
      suggestedAction: 'You have room to add an additional small container or herb pot on this shelf.',
      evidenceOrInputs: {
        remainingWidthCm: context.packing.remainingWidthCm,
      },
      isEstimated: false,
    });
  }

  // 3. Vertical Clearance Recommendations
  for (const clr of context.clearanceResults) {
    if (clr.status === 'vertical_clearance_collision') {
      recommendations.push({
        severity: 'warning',
        category: 'clearance',
        title: `${tierLabel}: Vertical Headroom Collision`,
        explanation: clr.explanation,
        suggestedAction: 'Place this species on the top tier where vertical growth is unobstructed, or adjust shelf clearance.',
        evidenceOrInputs: {
          availableClearanceCm: clr.availableClearanceCm,
          requiredClearanceCm: clr.requiredClearanceCm,
          marginCm: clr.clearanceMarginCm,
        },
        isEstimated: false,
      });
    } else if (clr.status === 'insufficient_clearance_data') {
      recommendations.push({
        severity: 'insufficient_data',
        category: 'clearance',
        title: `${tierLabel}: Unverified Vertical Headroom`,
        explanation: clr.explanation,
        suggestedAction: 'Measure mature plant height or verify clearance manually to prevent foliage crowding.',
        evidenceOrInputs: {
          availableClearanceCm: clr.availableClearanceCm,
          maturePlantHeightCm: 'missing_from_catalog',
        },
        isEstimated: true,
      });
    }
  }

  // 4. Light Suitability Recommendations
  for (const lt of context.lightResults) {
    if (lt.status === 'insufficient_light') {
      recommendations.push({
        severity: 'warning',
        category: 'light',
        title: `${tierLabel}: Inadequate Light Level`,
        explanation: lt.explanation,
        suggestedAction: 'Move light-demanding plants to upper tiers or supplement with a dedicated full-spectrum grow light.',
        evidenceOrInputs: {
          requiredCategory: lt.plantRequiredCategory,
          availableEnvironment: lt.availableEnvironment,
          estimatedHours: lt.estimatedAvailableHours,
        },
        isEstimated: lt.isAttenuationSimulated,
      });
    } else if (lt.status === 'excessive_light_risk') {
      recommendations.push({
        severity: 'warning',
        category: 'light',
        title: `${tierLabel}: Direct Solar Heat / Scorch Risk`,
        explanation: lt.explanation,
        suggestedAction: 'Relocate shade-adapted plants to middle or bottom tiers shielded from direct midday sun.',
        evidenceOrInputs: {
          requiredCategory: lt.plantRequiredCategory,
          availableEnvironment: lt.availableEnvironment,
          estimatedHours: lt.estimatedAvailableHours,
        },
        isEstimated: lt.isAttenuationSimulated,
      });
    }
  }

  // 5. Botanical Compatibility Recommendations
  for (const comp of context.compatibility) {
    if (comp.status === 'invasive_isolation_required') {
      recommendations.push({
        severity: 'critical',
        category: 'botanical',
        title: `${tierLabel}: Invasive Root Conflict`,
        explanation: comp.explanation,
        suggestedAction: 'Plant Spearmint in a separate standalone pot rather than a shared soil bed or trough.',
        evidenceOrInputs: {
          ruleName: comp.ruleName,
          evidenceSource: comp.evidenceSource,
        },
        isEstimated: false,
      });
    }
  }

  // 6. Success / Verified Status
  const hasCriticalOrWarning = recommendations.some(
    (r) => r.severity === 'critical' || r.severity === 'warning'
  );
  if (!hasCriticalOrWarning && context.packing.itemCount > 0) {
    recommendations.push({
      severity: 'success',
      category: 'spatial',
      title: `${tierLabel}: Layout Physically Compatible`,
      explanation: `${context.packing.itemCount} container(s) fit safely within shelf physical boundaries with ${context.packing.remainingWidthCm} cm linear margin remaining.`,
      suggestedAction: 'Arrangement is well-spaced. Ensure regular watering and light monitoring.',
      evidenceOrInputs: {
        itemCount: context.packing.itemCount,
        usableWidthCm: context.packing.usableWidthCm,
        occupiedWidthCm: context.packing.occupiedWidthCm,
      },
      isEstimated: false,
    });
  }

  return recommendations;
}

// ==============================================================================
// 10. MULTI-TIER TO DATABASE CATEGORY MAPPING (Phase 7B.5)
// ==============================================================================

/**
 * Deterministically maps a physical tier index (from a 1–8 tier space profile)
 * to one of the 3 production garden database categories ('top' | 'middle' | 'bottom').
 *
 * CRITICAL HORTICULTURAL RULES:
 * 1. The existing production database schema strictly supports only 'top', 'middle', and 'bottom'.
 * 2. Does NOT alter database schema or invent non-existent enum values.
 * 3. The topmost physical shelf (index 0) is always mapped to 'top'.
 * 4. The bottommost physical shelf (index totalTiers - 1) is always mapped to 'bottom'.
 * 5. For 1-tier systems, the single shelf is mapped to 'top'.
 * 6. For 2-tier systems, index 0 is 'top' and index 1 is 'bottom'.
 * 7. For 3-tier systems, index 0 is 'top', index 1 is 'middle', index 2 is 'bottom'.
 * 8. For 4 to 8 tiers, intermediate shelves are mapped into the closest vertical bracket
 *    based on equal thirds of the rack height:
 *    - Tiers in the top third: 'top'
 *    - Tiers in the middle third: 'middle'
 *    - Tiers in the bottom third: 'bottom'
 * 9. The exact physical shelf number (e.g. Tier 4 of 6) is preserved in initial notes.
 */
export function mapPhysicalTierToGardenTier(
  tierIndex: number,
  totalTiers: number
): 'top' | 'middle' | 'bottom' {
  if (totalTiers <= 1) return 'top';
  if (totalTiers === 2) return tierIndex === 0 ? 'top' : 'bottom';
  if (totalTiers === 3) {
    if (tierIndex === 0) return 'top';
    if (tierIndex === 1) return 'middle';
    return 'bottom';
  }

  // Multi-tier bounds enforcement
  const clampedIndex = Math.max(0, Math.min(totalTiers - 1, tierIndex));
  if (clampedIndex === 0) return 'top';
  if (clampedIndex === totalTiers - 1) return 'bottom';

  // For 4 tiers: Tier 1 and 2 are both mid-height shelves
  if (totalTiers === 4) return 'middle';

  // For 5 to 8 tiers: divide into 3 vertical strata
  const oneThird = totalTiers / 3;
  const twoThirds = (2 * totalTiers) / 3;

  if (clampedIndex < oneThird) return 'top';
  if (clampedIndex >= twoThirds) return 'bottom';
  return 'middle';
}
