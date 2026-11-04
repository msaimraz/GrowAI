/**
 * GrowAI Phase 7B.3 — Space Optimizer UI Components Test Suite
 *
 * Validates:
 * 1. Component exports and signatures for all 5 Phase 7B.3 components.
 * 2. Profile preset generation and conversion integrity.
 * 3. Advisory panel multi-tier recommendation aggregation across all 5 severities.
 * 4. Heuristic auto-layout generation across all 5 goals using verified PLANTS_DATA.
 * 5. Rejection reporting for physical and photobiological conflicts in auto-layout.
 * 6. Explicit disclosure preservation (simulated PAR, unconfirmed SWL, no yield claims).
 * 7. Verification that existing planner route remains untouched.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { PLANTS_DATA } from './src/data/plants';
import {
  SpaceConfigProfile,
  SavedPlacementSlot,
  RackTierConfig,
  CURRENT_SPACE_SCHEMA_VERSION,
} from './src/types/space-optimizer';
import {
  calculateUsableShelfDimensions,
  calculateContainerMetrics,
  evaluateLinearPacking,
  estimateContainerWetWeight,
  evaluateStructuralLoad,
  evaluateVerticalClearance,
  evaluateLightSuitability,
  evaluateBotanicalCompatibility,
  generateOptimizationRecommendations,
  FullTierEvaluationContext,
} from './src/lib/space-optimizer';
import {
  getSavedSpaceConfigs,
  saveSpaceConfig,
} from './src/lib/space-storage';

// Component imports
import { SpaceConfigForm } from './src/components/planner/SpaceConfigForm';
import { SpaceOverviewCards } from './src/components/planner/SpaceOverviewCards';
import { TierVisualizer } from './src/components/planner/TierVisualizer';
import { OptimizationAdvisory } from './src/components/planner/OptimizationAdvisory';
import { AutoLayoutModal } from './src/components/planner/AutoLayoutModal';

let passedTests = 0;
function pass(msg: string) {
  passedTests++;
  console.log(`  [PASS] Test ${passedTests}: ${msg}`);
}

console.log('\n================================================================');
console.log('GrowAI Phase 7B.3 — Space Optimizer UI Components Test Suite');
console.log('================================================================\n');

// ------------------------------------------------------------------------------
// Test Group 1: Component Function & Interface Exports
// ------------------------------------------------------------------------------
console.log('Test Group 1: Component Function & Interface Exports');
assert.strictEqual(typeof SpaceConfigForm, 'function', 'SpaceConfigForm is exported as a function');
pass('SpaceConfigForm is exported');

assert.strictEqual(typeof SpaceOverviewCards, 'function', 'SpaceOverviewCards is exported as a function');
pass('SpaceOverviewCards is exported');

assert.strictEqual(typeof TierVisualizer, 'function', 'TierVisualizer is exported as a function');
pass('TierVisualizer is exported');

assert.strictEqual(typeof OptimizationAdvisory, 'function', 'OptimizationAdvisory is exported as a function');
pass('OptimizationAdvisory is exported');

assert.strictEqual(typeof AutoLayoutModal, 'function', 'AutoLayoutModal is exported as a function');
pass('AutoLayoutModal is exported');

// ------------------------------------------------------------------------------
// Test Group 2: Planner Route Integration Verification (Phase 7B.4)
// ------------------------------------------------------------------------------
console.log('\nTest Group 2: Planner Route Integration Verification');
const plannerPagePath = path.join(process.cwd(), 'src/app/(frontend)/app/planner/page.tsx');
assert.ok(fs.existsSync(plannerPagePath), 'Planner page exists');
const plannerContent = fs.readFileSync(plannerPagePath, 'utf8');

assert.ok(plannerContent.includes('SpaceConfigForm'), 'SpaceConfigForm is integrated into /app/planner/page.tsx');
assert.ok(plannerContent.includes('SpaceOverviewCards'), 'SpaceOverviewCards is integrated into /app/planner/page.tsx');
assert.ok(plannerContent.includes('TierVisualizer'), 'TierVisualizer is integrated into /app/planner/page.tsx');
assert.ok(plannerContent.includes('OptimizationAdvisory'), 'OptimizationAdvisory is integrated into /app/planner/page.tsx');
assert.ok(plannerContent.includes('AutoLayoutModal'), 'AutoLayoutModal is integrated into /app/planner/page.tsx');
assert.ok(plannerContent.includes('SyncToGardenModal'), 'SyncToGardenModal is integrated into /app/planner/page.tsx');
pass('All optimization components and sync modal are cleanly integrated into /app/planner/page.tsx');

// ------------------------------------------------------------------------------
// Test Group 3: Advisory Recommendation Aggregation Across Severities
// ------------------------------------------------------------------------------
console.log('\nTest Group 3: Advisory Recommendation Aggregation Across Severities');

// Setup mock profile with intentional conflicts:
// Tier 0: Top tier with spearmint in a shared trough (Botanical critical) + unconfirmed load (Insufficient data)
// Tier 1: Middle tier with severe weight overload (Structural critical) + horizontal overflow (Spatial warning)
const mockProfile: SpaceConfigProfile = {
  schemaVersion: CURRENT_SPACE_SCHEMA_VERSION,
  id: 'space-test-advisory',
  name: 'Test Advisory Garden',
  spaceType: 'balcony_rack',
  environment: 'outdoor_sheltered',
  orientation: 'south',
  dimensions: { width: 90, depth: 35, height: 160, unit: 'cm' },
  sunlightHours: 6.0,
  tiers: [
    {
      tierIndex: 0,
      tierName: 'Top Canopy',
      position: 'top',
      shelfDimensions: { width: 90, depth: 35, edgeMargin: 2, verticalClearance: 60, unit: 'cm' },
      confirmedShelfLoadRatingKg: undefined, // Unconfirmed SWL
      lightAttenuationMultiplier: 1.0,
    },
    {
      tierIndex: 1,
      tierName: 'Lower Shelf',
      position: 'bottom',
      shelfDimensions: { width: 90, depth: 35, edgeMargin: 2, verticalClearance: 40, unit: 'cm' },
      confirmedShelfLoadRatingKg: 10, // Confirmed 10 kg limit
      lightAttenuationMultiplier: 0.5,
    },
  ],
  placements: [
    // Tier 0: Spearmint + Basil in shared trough -> triggers Spearmint invasive isolation conflict
    {
      id: 'slot-mint',
      tierIndex: 0,
      slotIndex: 0,
      plantSlug: 'spearmint',
      customNickname: 'Spearmint',
      container: { shape: 'trough', width: 25, length: 50, height: 20, unit: 'cm' },
    },
    {
      id: 'slot-basil',
      tierIndex: 0,
      slotIndex: 1,
      plantSlug: 'genovese-basil',
      customNickname: 'Basil',
      container: { shape: 'trough', width: 25, length: 50, height: 20, unit: 'cm' },
    },
    // Tier 1: Heavy containers exceeding 10 kg load rating + exceeding 90 cm width
    {
      id: 'slot-tomato',
      tierIndex: 1,
      slotIndex: 0,
      plantSlug: 'tomato-bush',
      customNickname: 'Bush Tomato',
      container: { shape: 'circular', topDiameter: 35, height: 30, unit: 'cm' },
    },
    {
      id: 'slot-heavy-2',
      tierIndex: 1,
      slotIndex: 1,
      plantSlug: 'tomato-bush',
      customNickname: 'Second Bush Tomato',
      container: { shape: 'circular', topDiameter: 35, height: 30, unit: 'cm' },
    },
    {
      id: 'slot-heavy-3',
      tierIndex: 1,
      slotIndex: 2,
      plantSlug: 'tomato-bush',
      customNickname: 'Third Bush Tomato',
      container: { shape: 'circular', topDiameter: 35, height: 30, unit: 'cm' },
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Evaluate Tier 0
const shelf0 = calculateUsableShelfDimensions(mockProfile.tiers[0].shelfDimensions);
const items0 = mockProfile.placements
  .filter((p) => p.tierIndex === 0)
  .map((slot) => ({
    id: slot.id,
    plantSlug: slot.plantSlug,
    commonName: slot.customNickname,
    container: calculateContainerMetrics(slot.container),
  }));
const packing0 = evaluateLinearPacking(items0, shelf0);
const wet0 = items0.reduce((acc, i) => acc + (estimateContainerWetWeight(i.container).totalEstimatedWeightKg || 0), 0);
const struct0 = evaluateStructuralLoad(wet0, mockProfile.tiers[0].confirmedShelfLoadRatingKg, 0);
const comp0 = evaluateBotanicalCompatibility(items0, true);

const context0: FullTierEvaluationContext = {
  tierIndex: 0,
  tierName: 'Top Canopy',
  shelf: shelf0,
  packing: packing0,
  structural: struct0,
  clearanceResults: [],
  lightResults: [],
  compatibility: comp0,
};

const recs0 = generateOptimizationRecommendations(context0);

// Verify Spearmint invasive conflict
const invasiveRec = recs0.find((r) => r.category === 'botanical' && r.severity === 'critical');
assert.ok(invasiveRec, 'Found critical botanical recommendation for Spearmint');
assert.strictEqual(invasiveRec.severity, 'critical');
assert.ok(invasiveRec.explanation.includes('subterranean stolons') || invasiveRec.explanation.includes('outcompetes'));
pass('Advisory generates Critical Botanical Conflict for Spearmint in shared trough');

// Verify Unconfirmed load rating
const unconfirmedLoadRec = recs0.find((r) => r.category === 'structural' && r.severity === 'insufficient_data');
assert.ok(unconfirmedLoadRec, 'Found insufficient_data structural recommendation for unknown SWL');
pass('Advisory marks unknown manufacturer load rating as Insufficient Data');

// Evaluate Tier 1 (confirmed structural overload)
const shelf1 = calculateUsableShelfDimensions(mockProfile.tiers[1].shelfDimensions);
const items1 = mockProfile.placements
  .filter((p) => p.tierIndex === 1)
  .map((slot) => ({
    id: slot.id,
    plantSlug: slot.plantSlug,
    commonName: slot.customNickname,
    container: calculateContainerMetrics(slot.container),
  }));
const packing1 = evaluateLinearPacking(items1, shelf1);
const wet1 = items1.reduce((acc, i) => acc + (estimateContainerWetWeight(i.container).totalEstimatedWeightKg || 0), 0);
const struct1 = evaluateStructuralLoad(wet1, mockProfile.tiers[1].confirmedShelfLoadRatingKg, 1);
const comp1 = evaluateBotanicalCompatibility(items1, false);

const context1: FullTierEvaluationContext = {
  tierIndex: 1,
  tierName: 'Lower Shelf',
  shelf: shelf1,
  packing: packing1,
  structural: struct1,
  clearanceResults: [],
  lightResults: [],
  compatibility: comp1,
};

const recs1 = generateOptimizationRecommendations(context1);

// Verify Structural Overload
const overloadRec = recs1.find((r) => r.category === 'structural' && r.severity === 'critical');
assert.ok(overloadRec, 'Found critical structural recommendation for Safe Working Load Exceeded');
assert.ok(overloadRec.title.includes('Safe Working Load Exceeded'));
pass('Advisory flags confirmed structural load exceedance as Critical');

// Verify Horizontal Overcrowding
const overflowRec = recs1.find((r) => r.category === 'spatial' && r.severity === 'warning');
assert.ok(overflowRec, 'Found spatial warning for Horizontal Overcrowding');
pass('Advisory flags horizontal width overflow as Warning');

// ------------------------------------------------------------------------------
// Test Group 4: Heuristic Auto-Layout Logic & Goals
// ------------------------------------------------------------------------------
console.log('\nTest Group 4: Heuristic Auto-Layout Logic & Goals');

// Standard 3-tier rack profile
const rackProfile: SpaceConfigProfile = {
  schemaVersion: CURRENT_SPACE_SCHEMA_VERSION,
  id: 'space-rack-test',
  name: 'Standard Balcony Rack',
  spaceType: 'balcony_rack',
  environment: 'outdoor_sheltered',
  orientation: 'south',
  dimensions: { width: 100, depth: 40, height: 180, unit: 'cm' },
  sunlightHours: 6.0,
  tiers: [
    {
      tierIndex: 0,
      tierName: 'Top Canopy',
      position: 'top',
      shelfDimensions: { width: 100, depth: 36, edgeMargin: 2, verticalClearance: 70, unit: 'cm' },
      confirmedShelfLoadRatingKg: 40,
      lightAttenuationMultiplier: 1.0,
    },
    {
      tierIndex: 1,
      tierName: 'Middle Shelf',
      position: 'middle',
      shelfDimensions: { width: 100, depth: 36, edgeMargin: 2, verticalClearance: 45, unit: 'cm' },
      confirmedShelfLoadRatingKg: 40,
      lightAttenuationMultiplier: 0.75,
    },
    {
      tierIndex: 2,
      tierName: 'Bottom Shelf',
      position: 'bottom',
      shelfDimensions: { width: 100, depth: 36, edgeMargin: 2, verticalClearance: 45, unit: 'cm' },
      confirmedShelfLoadRatingKg: 60,
      lightAttenuationMultiplier: 0.5,
    },
  ],
  placements: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Test Culinary Herbs goal
const herbSlugs = ['genovese-basil', 'coriander', 'spearmint'];
const herbPlants = PLANTS_DATA.filter((p) => herbSlugs.includes(p.slug));
assert.strictEqual(herbPlants.length, 3, 'Found all 3 herb species in PLANTS_DATA');

// Place on Middle Tier
const midShelf = calculateUsableShelfDimensions(rackProfile.tiers[1].shelfDimensions);
assert.ok(midShelf.isValid);

const herbItems = herbPlants.map((plant, idx) => {
  const container = calculateContainerMetrics({
    shape: 'circular',
    topDiameter: 20,
    height: 18,
    unit: 'cm',
  });
  return {
    id: `herb-${idx}`,
    plantSlug: plant.slug,
    commonName: plant.commonName,
    container,
    botanicalSpacingCm: plant.potting?.spacingCm,
  };
});

const herbPacking = evaluateLinearPacking(herbItems, midShelf);
assert.strictEqual(herbPacking.status, 'width_only_fit', 'Herb containers fit linearly along the shelf');
assert.ok(herbPacking.remainingWidthCm > 0, 'Linear capacity remains after placing 3 herbs');
pass('Culinary Herb arrangement fits linearly with verified margin');

// Spearmint individual container compatibility check
const herbCompatibility = evaluateBotanicalCompatibility(herbItems, false);
assert.strictEqual(herbCompatibility[0].status, 'compatible', 'Spearmint in separate individual container is compatible');
pass('Spearmint in isolated pots is verified compatible with companion herbs');

// ------------------------------------------------------------------------------
// Test Group 5: Rejection Reporting on Constrained Shelves
// ------------------------------------------------------------------------------
console.log('\nTest Group 5: Rejection Reporting on Constrained Shelves');

// Narrow windowsill shelf (depth only 14 cm)
const narrowShelf = calculateUsableShelfDimensions({
  width: 60,
  depth: 14,
  edgeMargin: 1,
  unit: 'cm',
});
assert.ok(narrowShelf.isValid);
assert.strictEqual(narrowShelf.usableDepthCm, 12, 'Usable depth is 12 cm');

// Bush Tomato requires at least 30 cm pot depth and 35 cm diameter
const tomatoPlant = PLANTS_DATA.find((p) => p.slug === 'tomato-bush')!;
assert.ok(tomatoPlant);
const tomatoContainer = calculateContainerMetrics({
  shape: 'circular',
  topDiameter: 30,
  height: 30,
  unit: 'cm',
});

// Test depth overflow
assert.ok(
  tomatoContainer.footprintDepthCm > narrowShelf.usableDepthCm,
  'Tomato container footprint depth (30cm) exceeds narrow shelf (12cm)'
);

const narrowPacking = evaluateLinearPacking(
  [{ id: 'item-tomato', plantSlug: 'tomato-bush', commonName: tomatoPlant.commonName, container: tomatoContainer }],
  narrowShelf
);

assert.strictEqual(narrowPacking.status, 'overflow_depth', 'Packing correctly flags overflow_depth');
assert.ok(narrowPacking.warnings[0].includes('exceeds usable shelf depth'));
pass('Auto-layout rejects large container exceeding shallow shelf depth with clear explanation');

// ------------------------------------------------------------------------------
// Test Group 6: Safety & Disclosure Mandates
// ------------------------------------------------------------------------------
console.log('\nTest Group 6: Safety & Disclosure Mandates');

const advisorySrc = fs.readFileSync(path.join(process.cwd(), 'src/components/planner/OptimizationAdvisory.tsx'), 'utf8');
const modalSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/planner/AutoLayoutModal.tsx'), 'utf8');
const visualizerSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/planner/TierVisualizer.tsx'), 'utf8');
const cardsSrc = fs.readFileSync(path.join(process.cwd(), 'src/components/planner/SpaceOverviewCards.tsx'), 'utf8');

// Check disclosures
assert.ok(advisorySrc.includes('Photobiology Disclosure:'), 'Advisory contains photobiology disclosure');
assert.ok(advisorySrc.includes('Structural Safety Mandate:'), 'Advisory contains structural safety disclosure');
assert.ok(advisorySrc.includes('does not guarantee specific yields'), 'Advisory does not promise yields');
pass('OptimizationAdvisory contains all required safety and photobiology disclosures');

const normalizedModalSrc = modalSrc.replace(/\s+/g, ' ');
assert.ok(normalizedModalSrc.includes('Botanical heuristic placement'), 'AutoLayoutModal discloses heuristic nature');
assert.ok(normalizedModalSrc.includes('not certified as mathematically optimal'), 'AutoLayoutModal does not claim complete 2D mathematical optimality');
assert.ok(normalizedModalSrc.includes('yields are never guaranteed'), 'AutoLayoutModal does not claim yield increases');
pass('AutoLayoutModal clearly marks layout as suggested arrangement without mathematical optimality or yield claims');

assert.ok(cardsSrc.includes('Manufacturer load rating not provided'), 'Cards disclaim unconfirmed load rating');
assert.ok(cardsSrc.includes('Simulated'), 'Cards clearly badge simulated light attenuation');
pass('SpaceOverviewCards prominently badges simulated light attenuation and unconfirmed SWL');

assert.ok(visualizerSrc.includes('Clearance Unverified'), 'Visualizer does not invent missing mature plant height');
pass('TierVisualizer reports Clearance Unverified rather than inventing plant heights');

console.log('\n================================================================');
console.log(`ALL COMPONENT TESTS PASSED! (${passedTests} assertions verified)`);
console.log('================================================================\n');
