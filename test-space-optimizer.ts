/**
 * GrowAI Phase 7B.1 — Small-Space & Vertical Garden Calculation Engine Tests
 *
 * Verifies all 18 test requirements:
 * 1. Metric/imperial conversion.
 * 2. Invalid dimensions.
 * 3. Shelf usable width.
 * 4. Circular and rectangular container volume.
 * 5. Linear packing and overflow.
 * 6. Missing canopy data.
 * 7. Two-dimensional placement limitation.
 * 8. Wet-weight estimation with explicit assumptions.
 * 9. Missing structural load rating.
 * 10. Confirmed structural overload.
 * 11. Missing mature plant height.
 * 12. Vertical clearance collision.
 * 13. Configurable tier-light attenuation.
 * 14. Direct versus indirect light distinction.
 * 15. Missing humidity and other botanical data.
 * 16. Spearmint isolation rule.
 * 17. Unknown values never silently converted to zero.
 * 18. Deterministic calculation results.
 */

import {
  cmToInches,
  inchesToCm,
  litersToCm3,
  cm3ToLiters,
  toCentimeters,
  validateSpaceDimensions,
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  evaluateLinearPacking,
  evaluateTwoDimensionalPlacement,
  estimateContainerWetWeight,
  evaluateStructuralLoad,
  evaluateVerticalClearance,
  evaluateLightSuitability,
  evaluateBotanicalCompatibility,
  generateOptimizationRecommendations,
} from './src/lib/space-optimizer';
import { PLANTS_DATA } from './src/data/plants';
import {
  ShelfInputDimensions,
  PlantPackingItem,
  UsableShelfResult,
} from './src/types/space-optimizer';

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  [PASS] Test ${totalTests}: ${testName}`);
  } else {
    console.error(`  [FAIL] Test ${totalTests}: ${testName}`);
    if (details) console.error(`         Details: ${details}`);
    throw new Error(`Assertion failed in: ${testName} - ${details || ''}`);
  }
}

console.log('================================================================');
console.log('GrowAI Phase 7B.1 — Space Optimizer Pure Unit Test Suite');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1: Metric / Imperial Conversion
// -----------------------------------------------------------------------------
console.log('Test 1: Metric / Imperial Conversion');
{
  const cm = 90;
  const inches = cmToInches(cm);
  assert(Math.abs(inches - 35.4331) < 0.001, 'cmToInches(90) converts to ~35.4331 in');

  const backToCm = inchesToCm(inches);
  assert(Math.abs(backToCm - 90) < 0.01, 'inchesToCm round-trip preserves 90 cm within precision');

  const liters = 15;
  const cm3 = litersToCm3(liters);
  assert(cm3 === 15000, 'litersToCm3(15) equals 15,000 cm³');
  assert(cm3ToLiters(cm3) === 15, 'cm3ToLiters(15000) equals 15 L');

  assert(toCentimeters(10, 'in') === 25.4, 'toCentimeters(10, "in") equals 25.4 cm');
  assert(toCentimeters(25.4, 'cm') === 25.4, 'toCentimeters(25.4, "cm") preserves 25.4 cm');
}

// -----------------------------------------------------------------------------
// Test 2: Invalid Dimensions Validation
// -----------------------------------------------------------------------------
console.log('\nTest 2: Invalid Dimensions Validation');
{
  const negativeWidth = validateSpaceDimensions({ width: -90, depth: 30, height: 160, unit: 'cm' });
  assert(!negativeWidth.isValid && negativeWidth.errors.length > 0, 'Rejects negative width');

  const zeroDepth = validateSpaceDimensions({ width: 90, depth: 0, height: 160, unit: 'cm' });
  assert(!zeroDepth.isValid && zeroDepth.errors.some(e => e.includes('Depth')), 'Rejects zero depth');

  const nanHeight = validateSpaceDimensions({ width: 90, depth: 30, height: NaN, unit: 'cm' });
  assert(!nanHeight.isValid && nanHeight.errors.some(e => e.includes('Height')), 'Rejects NaN height');

  const validSpace = validateSpaceDimensions({ width: 90, depth: 35, height: 160, unit: 'cm' });
  assert(validSpace.isValid && validSpace.dimensionsCm.width === 90, 'Validates positive finite dimensions');
}

// -----------------------------------------------------------------------------
// Test 3: Shelf Usable Width & Edge Margins
// -----------------------------------------------------------------------------
console.log('\nTest 3: Shelf Usable Width & Edge Margins');
{
  const shelf: ShelfInputDimensions = {
    width: 90,
    depth: 35,
    edgeMargin: 3,
    unit: 'cm',
  };
  const usable = calculateUsableShelfDimensions(shelf);
  assert(usable.isValid, 'Calculates usable dimensions successfully');
  if (usable.isValid) {
    assert(usable.usableWidthCm === 84, 'Usable width is 84 cm (90 - 2*3)');
    assert(usable.usableDepthCm === 29, 'Usable depth is 29 cm (35 - 2*3)');
    assert(usable.usableAreaCm2 === 2436, 'Usable area is 2436 cm² (84 * 29)');
  }

  // Margin exceeding width
  const excessiveMargin = calculateUsableShelfDimensions({
    width: 90,
    depth: 35,
    edgeMargin: 50,
    unit: 'cm',
  });
  assert(!excessiveMargin.isValid, 'Rejects edge margin exceeding shelf half-width');

  // Shelf exceeding enclosing space
  const shelfExceedingSpace = calculateUsableShelfDimensions(
    { width: 100, depth: 35, unit: 'cm' },
    { width: 90, depth: 40, height: 160, unit: 'cm' }
  );
  assert(!shelfExceedingSpace.isValid && shelfExceedingSpace.errors.some(e => e.includes('exceeds overall space width')), 'Rejects shelf wider than enclosing space');
}

// -----------------------------------------------------------------------------
// Test 4: Circular & Rectangular Container Volumes
// -----------------------------------------------------------------------------
console.log('\nTest 4: Circular & Rectangular Container Volumes');
{
  // Circular container with exact bottom diameter
  const exactCircular = calculateContainerMetrics({
    shape: 'circular',
    topDiameter: 30,
    bottomDiameter: 20,
    height: 25,
    unit: 'cm',
  });
  assert(exactCircular.shape === 'circular', 'Identifies circular container');
  assert(exactCircular.footprintWidthCm === 30, 'Footprint width is 30 cm');
  assert(exactCircular.footprintAreaCm2 === 706.86, 'Footprint area is ~706.86 cm²');
  assert(exactCircular.soilVolumeLiters > 12.0 && exactCircular.soilVolumeLiters < 13.0, 'Calculates exact conical frustum volume (~12.44 L)');
  assert(Boolean(exactCircular.approximationNotes?.includes('Exact conical frustum')), 'Documents exact frustum calculation in notes');

  // Circular container with omitted bottom diameter (taper approximation)
  const approxCircular = calculateContainerMetrics({
    shape: 'circular',
    topDiameter: 30,
    height: 25,
    unit: 'cm',
  });
  assert(approxCircular.soilVolumeLiters > 13.0 && approxCircular.soilVolumeLiters < 14.5, 'Approximates standard 0.75 taper ratio (~13.62 L)');
  assert(Boolean(approxCircular.approximationNotes?.includes('0.75 bottom-to-top diameter taper ratio')), 'Explicitly documents assumed 0.75 taper ratio');

  // Rectangular planter trough
  const trough = calculateContainerMetrics({
    shape: 'trough',
    width: 20,
    length: 60,
    height: 18,
    unit: 'cm',
  });
  assert(trough.shape === 'trough', 'Identifies trough container');
  assert(trough.footprintWidthCm === 60, 'Length aligns with shelf width (60 cm)');
  assert(trough.footprintDepthCm === 20, 'Width aligns with shelf depth (20 cm)');
  assert(trough.soilVolumeLiters === 21.6, 'Rectangular volume = 60*20*18 / 1000 = 21.6 L');
}

// -----------------------------------------------------------------------------
// Test 5: Linear Packing & Overflow Detection
// -----------------------------------------------------------------------------
console.log('\nTest 5: Linear Packing & Overflow Detection');
{
  const shelf: UsableShelfResult = {
    isValid: true,
    totalWidthCm: 90,
    totalDepthCm: 35,
    edgeMarginCm: 3,
    usableWidthCm: 84,
    usableDepthCm: 29,
    usableAreaCm2: 2436,
  };

  const pot20cm = calculateContainerMetrics({ shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' });
  const pot25cm = calculateContainerMetrics({ shape: 'circular', topDiameter: 25, height: 25, unit: 'cm' });

  // 3 pots: 20cm, 20cm, 25cm with 2cm gap = 20 + 2 + 20 + 2 + 25 = 69 cm <= 84 cm (and depths 20, 20, 25 <= 29 cm)
  const itemsFit: PlantPackingItem[] = [
    { id: 'item-1', commonName: 'Basil', container: pot20cm, botanicalSpacingCm: 20 },
    { id: 'item-2', commonName: 'Lettuce', container: pot20cm, botanicalSpacingCm: 15 },
    { id: 'item-3', commonName: 'Bush Tomato', container: pot25cm, botanicalSpacingCm: 25 },
  ];
  const fitResult = evaluateLinearPacking(itemsFit, shelf, 2.0);
  assert(fitResult.status === 'width_only_fit', 'Linear packing fits within usable width and depth (69 cm <= 84 cm, depth <= 29 cm)');
  assert(fitResult.occupiedWidthCm === 69, 'Total occupied width is exactly 69 cm');
  assert(fitResult.remainingWidthCm === 15, 'Remaining width is 15 cm');

  // Add two more 20cm pots: 69 + 2 + 20 + 2 + 20 = 113 cm > 84 cm -> Overflow width!
  const itemsOverflow = [
    ...itemsFit,
    { id: 'item-4', commonName: 'Spearmint', container: pot20cm, botanicalSpacingCm: 20 },
    { id: 'item-5', commonName: 'Coriander', container: pot20cm, botanicalSpacingCm: 20 },
  ];
  const overflowResult = evaluateLinearPacking(itemsOverflow, shelf, 2.0);
  assert(overflowResult.status === 'overflow_width', 'Detects horizontal width overflow');
  assert(overflowResult.occupiedWidthCm === 113, 'Occupied width is 113 cm');
  assert(overflowResult.warnings.some(w => w.includes('exceeds usable shelf width')), 'Reports explicit width overflow warning');

  // Test depth overflow with a 32 cm pot on a 29 cm usable depth shelf
  const pot32cm = calculateContainerMetrics({ shape: 'circular', topDiameter: 32, height: 30, unit: 'cm' });
  const depthOverflowRes = evaluateLinearPacking(
    [{ id: 'deep-1', commonName: 'Large Pot', container: pot32cm }],
    shelf,
    2.0
  );
  assert(depthOverflowRes.status === 'overflow_depth', 'Detects container depth overflow (32 cm > 29 cm shelf depth)');
  assert(depthOverflowRes.warnings.some(w => w.includes('exceeds usable shelf depth')), 'Reports explicit depth overflow warning');
}

// -----------------------------------------------------------------------------
// Test 6: Missing Canopy Data Handling
// -----------------------------------------------------------------------------
console.log('\nTest 6: Missing Canopy Data Handling');
{
  const shelf: UsableShelfResult = {
    isValid: true,
    totalWidthCm: 90,
    totalDepthCm: 35,
    edgeMarginCm: 0,
    usableWidthCm: 90,
    usableDepthCm: 35,
    usableAreaCm2: 3150,
  };

  const pot20cm = calculateContainerMetrics({ shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' });
  const itemsWithoutCanopy: PlantPackingItem[] = [
    { id: 'p1', commonName: 'Bloomsdale Spinach', container: pot20cm, botanicalSpacingCm: 10, matureCanopySpreadCm: undefined },
  ];

  const res = evaluateLinearPacking(itemsWithoutCanopy, shelf);
  assert(res.canopyCollisionVerified === false, 'canopyCollisionVerified is FALSE when mature canopy spread is missing');
  assert(Boolean(res.canopyVerificationNotes?.includes('lack mature canopy spread data')), 'Notes explain canopy collision cannot be fully verified');
}

// -----------------------------------------------------------------------------
// Test 7: Two-Dimensional Placement Limitation
// -----------------------------------------------------------------------------
console.log('\nTest 7: Two-Dimensional Placement Limitation');
{
  const shelf: UsableShelfResult = {
    isValid: true,
    totalWidthCm: 90,
    totalDepthCm: 35,
    edgeMarginCm: 0,
    usableWidthCm: 90,
    usableDepthCm: 35,
    usableAreaCm2: 3150,
  };
  const pot20cm = calculateContainerMetrics({ shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' });
  const items: PlantPackingItem[] = [{ id: 'p1', container: pot20cm }];

  const twoD = evaluateTwoDimensionalPlacement(items, shelf);
  assert(twoD.isFullyOptimized === false, 'isFullyOptimized is strictly FALSE for 1D or basic area evaluations');
  assert(twoD.notes.includes('not certified fully optimized'), 'Notes explicitly caution that full 2D spatial optimization requires 2D coordinates');
}

// -----------------------------------------------------------------------------
// Test 8: Wet-Weight Estimation with Explicit Assumptions
// -----------------------------------------------------------------------------
console.log('\nTest 8: Wet-Weight Estimation with Explicit Assumptions');
{
  const container = calculateContainerMetrics({
    shape: 'circular',
    topDiameter: 30,
    height: 25,
    unit: 'cm',
    tareWeightKg: 0.6,
  });

  // Confirmed density & biomass
  const weightResult = estimateContainerWetWeight(container, {
    saturatedSoilDensityKgPerLiter: 1.10,
    plantBiomassKg: 2.0,
  });
  assert(weightResult.status === 'confirmed', 'Status is "confirmed" when density, tare, and biomass are provided');
  assert(weightResult.assumptionsUsed.isDensityAssumed === false, 'isDensityAssumed is false when explicit');
  assert(weightResult.assumptionsUsed.missingInputs.length === 0, 'No missing inputs');
  const expectedTotal = Number((container.soilVolumeLiters * 1.10 + 0.6 + 2.0).toFixed(3));
  assert(weightResult.totalEstimatedWeightKg === expectedTotal, `Calculates total wet weight: ${expectedTotal} kg`);

  // Incomplete estimation when tare & biomass are absent
  const unconfiguredContainer = calculateContainerMetrics({
    shape: 'circular',
    topDiameter: 30,
    height: 25,
    unit: 'cm',
  });
  const incompleteResult = estimateContainerWetWeight(unconfiguredContainer);
  assert(incompleteResult.status === 'incomplete', 'Status is "incomplete" when tare and biomass are absent');
  assert(incompleteResult.assumptionsUsed.missingInputs.includes('containerTareWeightKg'), 'Identifies missing tare input');
  assert(incompleteResult.assumptionsUsed.missingInputs.includes('plantBiomassKg'), 'Identifies missing biomass input');
  assert(incompleteResult.assumptionsUsed.isDensityAssumed === true, 'Tracks that density was assumed');
}

// -----------------------------------------------------------------------------
// Test 9: Missing Structural Load Rating Handling
// -----------------------------------------------------------------------------
console.log('\nTest 9: Missing Structural Load Rating Handling');
{
  const unconfirmedRating = evaluateStructuralLoad(34.2, undefined, 0);
  assert(unconfirmedRating.status === 'unknown_load_capacity', 'Status is "unknown_load_capacity" when manufacturer rating is missing');
  assert(unconfirmedRating.confirmedSafeWorkingLoadKg === undefined, 'Confirmed SWL remains undefined');
  assert(unconfirmedRating.utilizationRatio === undefined, 'Utilization ratio remains undefined');
  assert(unconfirmedRating.explanation.includes('Manufacturer Safe Working Load (SWL) rating is unconfirmed'), 'Explains rating is unconfirmed');
  assert(unconfirmedRating.explanation.includes('Do NOT assume generic structural safety'), 'Warns against assuming generic limits');
}

// -----------------------------------------------------------------------------
// Test 10: Confirmed Structural Overload
// -----------------------------------------------------------------------------
console.log('\nTest 10: Confirmed Structural Overload');
{
  const overloaded = evaluateStructuralLoad(35.5, 25.0, 1);
  assert(overloaded.status === 'exceeds_confirmed_limit', 'Detects confirmed structural overload');
  assert(overloaded.utilizationRatio === 1.42, 'Utilization ratio is 1.42 (35.5 / 25.0)');
  assert(overloaded.explanation.includes('exceeds the manufacturer confirmed limit (25 kg) by 10.5 kg'), 'Quantifies excess load');

  const withinLimit = evaluateStructuralLoad(18.0, 25.0, 1);
  assert(withinLimit.status === 'within_confirmed_limit', 'Status is within confirmed limit when load < SWL');
  assert(withinLimit.utilizationRatio === 0.72, 'Utilization ratio is 0.72 (18.0 / 25.0)');
}

// -----------------------------------------------------------------------------
// Test 11: Missing Mature Plant Height Handling
// -----------------------------------------------------------------------------
console.log('\nTest 11: Missing Mature Plant Height Handling');
{
  const missingHeight = evaluateVerticalClearance(60, 25, undefined);
  assert(missingHeight.status === 'insufficient_clearance_data', 'Status is "insufficient_clearance_data" when mature height is missing');
  assert(missingHeight.requiredClearanceCm === undefined, 'requiredClearanceCm is undefined (not coerced to zero)');
  assert(missingHeight.clearanceMarginCm === undefined, 'clearanceMarginCm is undefined');
  assert(missingHeight.explanation.includes('Mature plant height must not be assumed when absent from the botanical catalog'), 'Documents catalog data absence');
}

// -----------------------------------------------------------------------------
// Test 12: Vertical Clearance Collision Detection
// -----------------------------------------------------------------------------
console.log('\nTest 12: Vertical Clearance Collision Detection');
{
  // Headroom: 50 cm available. Pot: 25 cm. Mature plant: 35 cm. Buffer: 10 cm. Required = 70 cm. Deficit = -20 cm.
  const collision = evaluateVerticalClearance(50, 25, 35, 10);
  assert(collision.status === 'vertical_clearance_collision', 'Detects vertical headroom collision');
  assert(collision.requiredClearanceCm === 70, 'Required headroom is 70 cm');
  assert(collision.clearanceMarginCm === -20, 'Clearance margin is -20 cm');
  assert(collision.explanation.includes('exceeds available clearance (50 cm) by 20.0 cm'), 'Explains collision deficit');

  // Adequate clearance: 85 cm available. Required = 70 cm. Margin = +15 cm.
  const adequate = evaluateVerticalClearance(85, 25, 35, 10);
  assert(adequate.status === 'adequate_clearance', 'Confirms adequate clearance');
  assert(adequate.clearanceMarginCm === 15, 'Margin is +15 cm');
}

// -----------------------------------------------------------------------------
// Test 13: Configurable Tier-Light Attenuation
// -----------------------------------------------------------------------------
console.log('\nTest 13: Configurable Tier-Light Attenuation');
{
  // Simulated illustrative tier attenuation: 8.0 hrs ambient * 0.70 middle tier multiplier = 5.6 hrs
  const lightResult = evaluateLightSuitability('partial-sun', 'outdoor', 8.0, 0.70, true);
  assert(lightResult.status === 'optimal', 'Status is optimal for partial-sun (3-6 hrs) with 5.6 hrs estimated');
  assert(lightResult.estimatedAvailableHours === 5.6, 'Calculates 5.6 hrs available');
  assert(lightResult.isAttenuationSimulated === true, 'Explicitly flags attenuation as simulated assumption');
}

// -----------------------------------------------------------------------------
// Test 14: Direct vs Indirect Light Distinction
// -----------------------------------------------------------------------------
console.log('\nTest 14: Direct vs Indirect Light Distinction');
{
  // Shade / bright-indirect plant in outdoor full direct sun (7 hrs)
  const scorchRisk = evaluateLightSuitability('bright-indirect', 'outdoor', 7.0, 1.0, true);
  assert(scorchRisk.status === 'excessive_light_risk', 'Detects excessive light risk for bright-indirect species in direct outdoor sun');
  assert(scorchRisk.explanation.includes('High risk of solar leaf scorch'), 'Warns against photobleaching and leaf scorch');

  // Full-sun fruiting crop in indoor natural window light without grow lights
  const indoorSunDeficit = evaluateLightSuitability('full-sun', 'indoor_natural', 6.0, 1.0, false);
  assert(indoorSunDeficit.status === 'insufficient_light', 'Detects insufficient light for full-sun crop in indoor natural light');
  assert(indoorSunDeficit.explanation.includes('Standard indoor window glass attenuates photosynthetically active radiation'), 'Explains indoor glass PAR attenuation');
}

// -----------------------------------------------------------------------------
// Test 15: Missing Humidity & Botanical Data Handling
// -----------------------------------------------------------------------------
console.log('\nTest 15: Missing Humidity & Botanical Data Handling');
{
  const lettuce = PLANTS_DATA.find(p => p.slug === 'butterhead-lettuce');
  assert(lettuce !== undefined, 'Found Butterhead Lettuce in PLANTS_DATA');
  assert(lettuce?.humidity === undefined, 'Butterhead Lettuce has humidity === undefined in verified catalog');

  const radish = PLANTS_DATA.find(p => p.slug === 'french-radish');
  assert(radish !== undefined, 'Found French Breakfast Radish in PLANTS_DATA');
  assert(radish?.humidity === undefined, 'French Breakfast Radish has humidity === undefined in verified catalog');

  // Verify that evaluating light or packing for lettuce does not fail or guess missing humidity
  const pot15 = calculateContainerMetrics({ shape: 'circular', topDiameter: 15, height: 15, unit: 'cm' });
  const lettuceItem: PlantPackingItem = {
    id: 'lettuce-1',
    plantSlug: lettuce!.slug,
    commonName: lettuce!.commonName,
    container: pot15,
    botanicalSpacingCm: lettuce!.potting.spacingCm,
  };
  const shelf: UsableShelfResult = {
    isValid: true,
    totalWidthCm: 90,
    totalDepthCm: 35,
    edgeMarginCm: 0,
    usableWidthCm: 90,
    usableDepthCm: 35,
    usableAreaCm2: 3150,
  };
  const packRes = evaluateLinearPacking([lettuceItem], shelf);
  assert(packRes.status === 'width_only_fit', 'Evaluates packing safely for species with missing humidity');
}

// -----------------------------------------------------------------------------
// Test 16: Spearmint Isolation Rule
// -----------------------------------------------------------------------------
console.log('\nTest 16: Spearmint Isolation Rule');
{
  const pot20 = calculateContainerMetrics({ shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' });
  const spearmintItem: PlantPackingItem = { id: 'mint-1', plantSlug: 'spearmint', container: pot20 };
  const basilItem: PlantPackingItem = { id: 'basil-1', plantSlug: 'genovese-basil', container: pot20 };

  // 1. Spearmint in shared soil trough with other crops -> Conflict!
  const sharedSoilResults = evaluateBotanicalCompatibility([spearmintItem, basilItem], true);
  const mintConflict = sharedSoilResults.find(r => r.status === 'invasive_isolation_required');
  assert(mintConflict !== undefined, 'Detects Spearmint invasive rhizome conflict in shared soil trough');
  assert(mintConflict?.evidenceSource === 'catalog_notes', 'Evidence source is catalog_notes');
  assert(Boolean(mintConflict?.explanation.includes('Spearmint develops aggressive subterranean stolons')), 'Explanation cites stolon runner aggression');

  // 2. Spearmint in separate standalone pots -> Compatible!
  const separatePotResults = evaluateBotanicalCompatibility([spearmintItem, basilItem], false);
  assert(separatePotResults[0].status === 'compatible', 'Spearmint in separate individual container is compatible');
}

// -----------------------------------------------------------------------------
// Test 17: Unknown Values Never Silently Converted to Zero
// -----------------------------------------------------------------------------
console.log('\nTest 17: Unknown Values Never Silently Converted to Zero');
{
  // Container tare missing
  const container = calculateContainerMetrics({ shape: 'circular', topDiameter: 20, height: 20, unit: 'cm' });
  const wetRes = estimateContainerWetWeight(container);
  assert(wetRes.containerTareWeightKg === undefined, 'Missing container tare weight is undefined, NOT zero');
  assert(wetRes.plantBiomassKg === undefined, 'Missing plant biomass is undefined, NOT zero');

  // Shelf load rating missing
  const loadRes = evaluateStructuralLoad(20.0, undefined);
  assert(loadRes.confirmedSafeWorkingLoadKg === undefined, 'Missing SWL rating is undefined, NOT zero');
  assert(loadRes.status !== 'exceeds_confirmed_limit', 'Missing SWL is NOT zero (which would falsely trigger an overload)');

  // Mature plant height missing
  const clrRes = evaluateVerticalClearance(60, 20, undefined);
  assert(clrRes.maturePlantHeightCm === undefined, 'Missing mature height is undefined, NOT zero');
  assert(clrRes.requiredClearanceCm === undefined, 'Required clearance is undefined, NOT zero');
}

// -----------------------------------------------------------------------------
// Test 18: Deterministic Calculation Results
// -----------------------------------------------------------------------------
console.log('\nTest 18: Deterministic Calculation Results');
{
  const shelf: UsableShelfResult = {
    isValid: true,
    totalWidthCm: 90,
    totalDepthCm: 35,
    edgeMarginCm: 2,
    usableWidthCm: 86,
    usableDepthCm: 31,
    usableAreaCm2: 2666,
  };
  const pot25 = calculateContainerMetrics({ shape: 'circular', topDiameter: 25, height: 25, unit: 'cm', tareWeightKg: 0.5 });
  const item: PlantPackingItem = { id: 't1', commonName: 'Bush Tomato', container: pot25, botanicalSpacingCm: 35 };

  const firstRun = evaluateLinearPacking([item, item], shelf, 2.0);
  for (let i = 0; i < 50; i++) {
    const loopRun = evaluateLinearPacking([item, item], shelf, 2.0);
    if (
      loopRun.occupiedWidthCm !== firstRun.occupiedWidthCm ||
      loopRun.status !== firstRun.status ||
      loopRun.remainingWidthCm !== firstRun.remainingWidthCm
    ) {
      throw new Error(`Non-deterministic packing result at iteration ${i}`);
    }
  }
  assert(true, '50 repeated evaluations produced bit-for-bit identical results with zero drift');

  // Test Unified Recommendations Generator
  const recs = generateOptimizationRecommendations({
    tierIndex: 0,
    tierName: 'Top Tier',
    shelf,
    packing: firstRun,
    structural: evaluateStructuralLoad(25.0, undefined, 0),
    clearanceResults: [evaluateVerticalClearance(50, 25, 35, 10)],
    lightResults: [evaluateLightSuitability('full-sun', 'outdoor', 6.0, 1.0, false)],
    compatibility: evaluateBotanicalCompatibility([item], false),
  });
  assert(recs.length > 0, 'Unified optimization engine generated structured recommendations');
  assert(recs.some(r => r.category === 'structural' && r.severity === 'insufficient_data'), 'Includes structural capacity unconfirmed advisory');
  assert(recs.some(r => r.category === 'clearance' && r.severity === 'warning'), 'Includes vertical clearance collision advisory');
}

console.log('\n================================================================');
console.log(`ALL TESTS PASSED! (${passedTests} / ${totalTests} assertions verified)`);
console.log('================================================================\n');
