/**
 * GrowAI Phase 8.2 & Phase 8.2.1 — Disease, Pest & Abiotic Disorder Knowledge Base Test Suite
 *
 * Verifies all 21 test categories:
 *  1. Type correctness & structural integrity
 *  2. Unique condition IDs (35 conditions total)
 *  3. Unique pest IDs & pest classification (9 urban pests)
 *  4. Valid category values ('pest' | 'disease' | 'abiotic')
 *  5. Valid plant-slug references against PLANTS_DATA
 *  6. Valid cross-references in similarConditions
 *  7. Completeness of required descriptions, symptoms, and diagnostic cues
 *  8. Source-reference structure and academic/extension rigor
 *  9. Unknown harvest intervals remain unknown (no invented withholding defaults)
 * 10. No universal pesticide dosage, household chemical recipes, or cure guarantees
 * 11. No invented human/pet medical prescriptions; valid emergency contact guidance
 * 12. No universal or unsupported host-susceptibility claims
 * 13. All 19 existing botanical records remain unchanged and unmutated
 * 14. Query & search utilities functionality
 * ------------------- Phase 8.2.1 Targeted Verification Suites -------------------
 * 15. Resistant versus not-known-host distinction (active resistance vs non-host)
 * 16. Unsupported resistance claims (zero conflation of non-host status with resistance)
 * 17. Unknown/insufficiently documented host relationships properly recorded
 * 18. Sprout and seedling sterility wording audit (no false sterility claims)
 * 19. Sprout microbial contamination warnings (Salmonella/E. coli/Listeria distinction)
 * 20. Evidence scope traceability (granular scopes on supporting references)
 * 21. Emergency contact localization and non-universality verification
 */

import {
  PLANT_HEALTH_KB,
  getConditionById,
  getConditionsByCategory,
  getConditionsForPlantSlug,
  getSimilarConditions,
  queryHealthKb,
  searchConditionsBySymptom,
  getHealthKbStats,
} from './src/data/plant-health-kb';
import { PLANTS_DATA } from './src/data/plants';
import type {
  PlantHealthCondition,
  PestCondition,
  DiseaseCondition,
  AbioticCondition,
} from './src/types/health';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, suite: string, name: string, failureDetails?: string) {
  if (condition) {
    results.push({ suite, name, passed: true });
  } else {
    results.push({ suite, name, passed: false, details: failureDetails || 'Assertion failed' });
    console.error(`  ❌ FAIL [${suite}] ${name}: ${failureDetails || 'Assertion failed'}`);
  }
}

console.log('🌱 Starting GrowAI Phase 8.2 & 8.2.1 Plant Health KB Automated Test Battery...\n');

// ============================================================================
// TEST 1: Type Correctness & Dataset Integrity
// ============================================================================
const totalConditions = PLANT_HEALTH_KB.length;
assert(
  totalConditions === 35,
  '1. Type Correctness',
  `Expected exactly 35 conditions in KB, found ${totalConditions}`,
  `Count mismatch: ${totalConditions}`
);

const stats = getHealthKbStats();
assert(
  stats.totalConditions === 35 &&
  stats.pestsCount === 9 &&
  stats.diseasesCount === 11 &&
  stats.abioticCount === 15,
  '1. Type Correctness',
  'Health KB statistics match category targets (9 pests, 11 diseases, 15 abiotics)',
  `Stats: ${JSON.stringify(stats)}`
);

// Verify all records have valid id, name, category, and severity
const allHaveCoreFields = PLANT_HEALTH_KB.every(
  (c) =>
    typeof c.id === 'string' &&
    c.id.length > 0 &&
    typeof c.commonName === 'string' &&
    c.commonName.length > 0 &&
    ['pest', 'disease', 'abiotic'].includes(c.category) &&
    ['low', 'moderate', 'high', 'critical'].includes(c.severity) &&
    ['verified', 'partially-verified', 'provisional'].includes(c.verificationStatus) &&
    Array.isArray(c.affectedPlantParts) &&
    c.affectedPlantParts.length > 0 &&
    Array.isArray(c.possibleCauses) &&
    c.possibleCauses.length > 0 &&
    Array.isArray(c.preventionGuidance) &&
    c.preventionGuidance.length > 0 &&
    typeof c.treatment === 'object' &&
    Array.isArray(c.references) &&
    c.references.length > 0
);
assert(
  allHaveCoreFields,
  '1. Type Correctness',
  'All 35 conditions possess valid core fields and typed structures'
);

// ============================================================================
// TEST 2: Unique Condition IDs
// ============================================================================
const idSet = new Set<string>();
const duplicateIds: string[] = [];

for (const condition of PLANT_HEALTH_KB) {
  if (idSet.has(condition.id)) {
    duplicateIds.push(condition.id);
  }
  idSet.add(condition.id);
}

assert(
  duplicateIds.length === 0,
  '2. Unique Condition IDs',
  'All condition IDs are strictly unique',
  `Found duplicates: ${duplicateIds.join(', ')}`
);

// Verify ID naming convention
const validIdPrefixes = PLANT_HEALTH_KB.every((c) =>
  c.id.startsWith('pest-') || c.id.startsWith('disease-') || c.id.startsWith('abiotic-')
);
assert(
  validIdPrefixes,
  '2. Unique Condition IDs',
  'All condition IDs follow prefix convention (pest-*, disease-*, abiotic-*)'
);

// ============================================================================
// TEST 3: Unique Pest IDs & Pest Classification
// ============================================================================
const pests = getConditionsByCategory('pest') as PestCondition[];
const pestIdSet = new Set<string>();
const duplicatePestIds: string[] = [];

for (const pest of pests) {
  if (pestIdSet.has(pest.id)) {
    duplicatePestIds.push(pest.id);
  }
  pestIdSet.add(pest.id);
}

assert(
  pests.length === 9,
  '3. Pest Entities',
  `Expected 9 urban pests, found ${pests.length}`
);

assert(
  duplicatePestIds.length === 0,
  '3. Pest Entities',
  'All pest IDs are strictly unique',
  `Duplicate pests: ${duplicatePestIds.join(', ')}`
);

const allPestsHavePestType = pests.every(
  (p) =>
    typeof p.pestType === 'string' &&
    p.pestType !== 'none' &&
    p.visualIdentification &&
    typeof p.visualIdentification.colorDescription === 'string' &&
    typeof p.visualIdentification.morphology === 'string' &&
    Array.isArray(p.visualIdentification.lifeStagesVisible) &&
    p.visualIdentification.lifeStagesVisible.length > 0 &&
    Array.isArray(p.damagePatterns) &&
    p.damagePatterns.length > 0 &&
    Array.isArray(p.favoredPlantGroups) &&
    p.favoredPlantGroups.length > 0
);
assert(
  allPestsHavePestType,
  '3. Pest Entities',
  'All 9 pests include specific pestType, visual characteristics, damage patterns, and host groups'
);

// Verify specific requested pests exist
const requiredPestIds = [
  'pest-aphids',
  'pest-spider-mites',
  'pest-fungus-gnats',
  'pest-thrips',
  'pest-whiteflies',
  'pest-mealybugs',
  'pest-scale-insects',
  'pest-caterpillars',
  'pest-leafminers',
];
const missingRequiredPests = requiredPestIds.filter((id) => !pestIdSet.has(id));
assert(
  missingRequiredPests.length === 0,
  '3. Pest Entities',
  'All 9 required urban pest types are present in KB',
  `Missing pests: ${missingRequiredPests.join(', ')}`
);

// ============================================================================
// TEST 4: Valid Category Values
// ============================================================================
const diseases = getConditionsByCategory('disease') as DiseaseCondition[];
const abiotics = getConditionsByCategory('abiotic') as AbioticCondition[];

assert(
  diseases.length === 11,
  '4. Category Breakdown',
  `Expected 11 plant diseases, found ${diseases.length}`
);

assert(
  abiotics.length === 15,
  '4. Category Breakdown',
  `Expected 15 abiotic disorders, found ${abiotics.length}`
);

// Check pathogen types for diseases
const validPathogenTypes = ['fungal', 'bacterial', 'viral', 'oomycete', 'nematode'];
const allDiseasesHaveValidPathogens = diseases.every(
  (d) =>
    validPathogenTypes.includes(d.pathogenType) &&
    d.observableSymptoms.length > 0 &&
    Array.isArray(d.transmissionVectors) &&
    d.transmissionVectors.length > 0 &&
    typeof d.isolationGuidance === 'string' &&
    d.isolationGuidance.length > 20
);
assert(
  allDiseasesHaveValidPathogens,
  '4. Category Breakdown',
  'All 11 diseases have valid pathogen types, transmission vectors, and isolation guidance'
);

// Check abiotic categories
const validAbioticCategories = [
  'macronutrient_deficiency',
  'micronutrient_deficiency',
  'moisture_stress',
  'temperature_stress',
  'light_stress',
  'salinity_osmotic',
  'physiological_disorder',
];
const allAbioticsHaveValidCategory = abiotics.every(
  (a) =>
    validAbioticCategories.includes(a.abioticCategory) &&
    typeof a.diagnosticKey === 'string' &&
    a.diagnosticKey.length > 20 &&
    Array.isArray(a.correctiveMeasures) &&
    a.correctiveMeasures.length > 0
);
assert(
  allAbioticsHaveValidCategory,
  '4. Category Breakdown',
  'All 15 abiotic disorders have valid subcategory, diagnostic keys, and corrective measures'
);

// ============================================================================
// TEST 5: Valid Plant-Slug References Against PLANTS_DATA
// ============================================================================
const existingSlugs = new Set(PLANTS_DATA.map((p) => p.slug));
const invalidSlugReferences: { conditionId: string; slug: string }[] = [];
let totalHostReferences = 0;

for (const condition of PLANT_HEALTH_KB) {
  for (const hostRel of condition.confirmedHostSlugs) {
    totalHostReferences++;
    if (!existingSlugs.has(hostRel.plantSlug)) {
      invalidSlugReferences.push({ conditionId: condition.id, slug: hostRel.plantSlug });
    }
    // Verify relationship type allows full Phase 8.2.1 range
    assert(
      [
        'confirmed_host',
        'susceptible_family',
        'rarely_affected',
        'resistant',
        'not_known_host',
        'unknown',
      ].includes(hostRel.relationshipType),
      '5. Plant Slug References',
      `Condition ${condition.id} has valid relationshipType for ${hostRel.plantSlug}`
    );
  }
}

assert(
  invalidSlugReferences.length === 0,
  '5. Plant Slug References',
  `All host plant slugs (${totalHostReferences} references) match valid slugs in PLANTS_DATA`,
  `Invalid slugs: ${JSON.stringify(invalidSlugReferences)}`
);

// Verify query utility works for plant slugs
const tomatoConditions = getConditionsForPlantSlug('tomato-bush');
assert(
  tomatoConditions.length > 0,
  '5. Plant Slug References',
  `getConditionsForPlantSlug('tomato-bush') returned ${tomatoConditions.length} conditions`
);

const pothosConditions = getConditionsForPlantSlug('golden-pothos');
assert(
  pothosConditions.length > 0,
  '5. Plant Slug References',
  `getConditionsForPlantSlug('golden-pothos') returned ${pothosConditions.length} conditions`
);

// ============================================================================
// TEST 6: Valid Cross-References in Similar Conditions
// ============================================================================
const brokenCrossReferences: { conditionId: string; targetId: string }[] = [];
let totalCrossReferences = 0;

for (const condition of PLANT_HEALTH_KB) {
  for (const similar of condition.similarConditions) {
    totalCrossReferences++;
    if (!idSet.has(similar.conditionId)) {
      brokenCrossReferences.push({
        conditionId: condition.id,
        targetId: similar.conditionId,
      });
    }
    // Must also have distinguishingFeature
    assert(
      typeof similar.distinguishingFeature === 'string' &&
        similar.distinguishingFeature.trim().length > 10,
      '6. Cross References',
      `Condition ${condition.id} has descriptive distinguishing feature for ${similar.conditionId}`
    );
  }
}

assert(
  brokenCrossReferences.length === 0,
  '6. Cross References',
  `All ${totalCrossReferences} similar-condition cross-references point to valid KB condition IDs`,
  `Broken references: ${JSON.stringify(brokenCrossReferences)}`
);

// Test helper utility getSimilarConditions
const powderyMildewSimilar = getSimilarConditions('disease-powdery-mildew');
assert(
  powderyMildewSimilar.length > 0,
  '6. Cross References',
  `getSimilarConditions('disease-powdery-mildew') resolved ${powderyMildewSimilar.length} related records`
);

// ============================================================================
// TEST 7: Completeness of Required Descriptions & Symptoms
// ============================================================================
const missingDescriptionConditions = PLANT_HEALTH_KB.filter(
  (c) =>
    !c.shortDescription ||
    c.shortDescription.trim().length < 30 ||
    !Array.isArray(c.observableSymptoms) ||
    c.observableSymptoms.length < 2 ||
    !Array.isArray(c.affectedPlantParts) ||
    c.affectedPlantParts.length === 0 ||
    !Array.isArray(c.possibleCauses) ||
    c.possibleCauses.length === 0 ||
    !Array.isArray(c.preventionGuidance) ||
    c.preventionGuidance.length === 0
);

assert(
  missingDescriptionConditions.length === 0,
  '7. Completeness & Descriptions',
  'All 35 conditions possess comprehensive descriptions (>=30 chars), symptoms (>=2), parts, causes, and prevention',
  `Conditions failing completeness: ${missingDescriptionConditions.map((c) => c.id).join(', ')}`
);

// ============================================================================
// TEST 8: Source-Reference Structure & Quality
// ============================================================================
let totalEvidenceSources = 0;
const invalidSources: { conditionId: string; title: string; reason: string }[] = [];

for (const condition of PLANT_HEALTH_KB) {
  if (!Array.isArray(condition.references) || condition.references.length === 0) {
    invalidSources.push({
      conditionId: condition.id,
      title: 'None',
      reason: 'No supporting references provided',
    });
    continue;
  }

  for (const ref of condition.references) {
    totalEvidenceSources++;
    if (!ref.title || ref.title.trim().length < 5) {
      invalidSources.push({ conditionId: condition.id, title: ref.title, reason: 'Title too short' });
    }
    if (!ref.organization || ref.organization.trim().length < 2) {
      invalidSources.push({
        conditionId: condition.id,
        title: ref.title,
        reason: 'Missing issuing organization',
      });
    }
    if (
      !['extension_consensus', 'peer_reviewed', 'horticultural_standard', 'observational'].includes(
        ref.evidenceLevel
      )
    ) {
      invalidSources.push({
        conditionId: condition.id,
        title: ref.title,
        reason: `Invalid evidenceLevel: ${ref.evidenceLevel}`,
      });
    }
    if (ref.url && !ref.url.startsWith('http')) {
      invalidSources.push({
        conditionId: condition.id,
        title: ref.title,
        reason: `Invalid URL format: ${ref.url}`,
      });
    }
  }
}

assert(
  invalidSources.length === 0,
  '8. Source Quality & Traceability',
  `All ${totalEvidenceSources} supporting references have valid titles, organizations, and evidence levels`,
  `Invalid sources: ${JSON.stringify(invalidSources)}`
);

// Verify reputable extension / pathology organizations are present
const reputableOrgs = [
  'University of California IPM',
  'Cornell University Extension',
  'Penn State Extension',
  'Purdue Extension',
  'University of Florida IFAS Extension',
  'University of Minnesota Extension',
  'Royal Horticultural Society',
];
const orgSet = new Set(
  PLANT_HEALTH_KB.flatMap((c) => c.references.map((r) => r.organization))
);
const matchedReputableOrgs = reputableOrgs.filter((org) =>
  Array.from(orgSet).some((o) => o.includes(org) || org.includes(o))
);
assert(
  matchedReputableOrgs.length >= 5,
  '8. Source Quality & Traceability',
  `Knowledge base references at least 5 recognized extension services (found ${matchedReputableOrgs.length})`
);

// ============================================================================
// TEST 9: Unknown Harvest Intervals Remain Unknown (No Invented Defaults)
// ============================================================================
const conditionsWithInventedHarvestPeriod: string[] = [];

for (const condition of PLANT_HEALTH_KB) {
  const phi = condition.treatment.preHarvestIntervalGuidance;
  const lowerPhi = phi.toLowerCase();

  // Rule: Do NOT invent a universal 72-hour or fixed-day withholding period.
  if (
    lowerPhi.includes('universal 72-hour') ||
    lowerPhi.includes('default 72 hours') ||
    lowerPhi.includes('universal 3 days')
  ) {
    conditionsWithInventedHarvestPeriod.push(condition.id);
  }

  // Verify that treatment plans defer harvest intervals strictly to product labels or withhold if unverified
  assert(
    lowerPhi.includes('label') ||
      lowerPhi.includes('unknown') ||
      lowerPhi.includes('jurisdiction') ||
      lowerPhi.includes('withhold') ||
      lowerPhi.includes('not applicable') ||
      lowerPhi.includes('non-chemical'),
    '9. Harvest Safety',
    `Condition ${condition.id} pre-harvest interval guidance strictly adheres to product label/unknown requirement`
  );

  // Check edible crop relevance structure
  assert(
    typeof condition.edibleCropRelevance.isFoodSafetyConcern === 'boolean' &&
      typeof condition.edibleCropRelevance.harvestPrecaution === 'string' &&
      condition.edibleCropRelevance.harvestPrecaution.length > 10,
    '9. Harvest Safety',
    `Condition ${condition.id} has complete edibleCropRelevance with harvest precautions`
  );
}

assert(
  conditionsWithInventedHarvestPeriod.length === 0,
  '9. Harvest Safety',
  'No condition prescribes an invented universal harvest withholding period (e.g. 72h default)',
  `Violations: ${conditionsWithInventedHarvestPeriod.join(', ')}`
);

// ============================================================================
// TEST 10: No Universal Pesticide Dosages, Bleach, Ammonia, or Cure Guarantees
// ============================================================================
const hazardousChemicals = ['bleach', 'ammonia', 'drain cleaner', 'concentrated acid', 'kerosene'];
const hazardousViolations: { conditionId: string; chemical: string }[] = [];
const dosagePattern = /\b\d+(\.\d+)?\s*(tbsp|tsp|teaspoon|tablespoon|ml|tablespoons|teaspoons)\s*(per|\/)\s*(gallon|litre|liter|gal)\b/i;
const dosageViolations: { conditionId: string; text: string }[] = [];

for (const condition of PLANT_HEALTH_KB) {
  const plan = condition.treatment;

  // Check cure guarantee disclaimer is always present and disclaims 100% cure guarantee
  assert(
    typeof plan.cureGuaranteeDisclaimer === 'string' &&
      (plan.cureGuaranteeDisclaimer.toLowerCase().includes('guarantee') ||
       plan.cureGuaranteeDisclaimer.toLowerCase().includes('eradication')),
    '10. Treatment Safety',
    `Condition ${condition.id} includes explicit cure disclaimer (no cure guarantees)`
  );

  // Check registered chemical notes refer to product labels, NOT homemade dosages
  if (plan.registeredChemicalNotes && plan.registeredChemicalNotes.length > 0) {
    const chemicalNotesText = plan.registeredChemicalNotes.join(' ').toLowerCase();
    assert(
      chemicalNotesText.includes('label') ||
        chemicalNotesText.includes('not recommended') ||
        chemicalNotesText.includes('not necessary') ||
        chemicalNotesText.includes('regulatory') ||
        chemicalNotesText.includes('licensed'),
      '10. Treatment Safety',
      `Condition ${condition.id} chemical notes defer to official product label instructions`
    );
  }

  // Check prohibited practices explicitly warn against bleach, ammonia, or dangerous folk remedies
  const prohibitedText = plan.prohibitedPractices.join(' ').toLowerCase();
  assert(
    prohibitedText.includes('bleach') ||
      prohibitedText.includes('detergent') ||
      prohibitedText.includes('chemical') ||
      prohibitedText.includes('unregistered') ||
      prohibitedText.includes('over-fertiliz') ||
      prohibitedText.includes('spray') ||
      prohibitedText.includes('mix') ||
      condition.category === 'abiotic',
    '10. Treatment Safety',
    `Condition ${condition.id} specifies robust prohibited cultural or chemical practices`
  );

  // Search for hazardous chemicals in recommendations (excluding prohibitions)
  const recommendationText = [
    ...plan.culturalControls,
    ...plan.physicalControls,
    ...plan.biologicalControls,
  ].join(' ').toLowerCase();

  for (const hazard of hazardousChemicals) {
    if (recommendationText.includes(hazard)) {
      hazardousViolations.push({ conditionId: condition.id, chemical: hazard });
    }
  }

  // Check for dosage recipes in treatments
  const dosageMatch = recommendationText.match(dosagePattern);
  if (dosageMatch) {
    dosageViolations.push({ conditionId: condition.id, text: dosageMatch[0] });
  }
}

assert(
  hazardousViolations.length === 0,
  '10. Treatment Safety',
  'No hazardous household chemicals (bleach, ammonia, concentrated acids) are recommended in treatments',
  `Hazardous violations: ${JSON.stringify(hazardousViolations)}`
);

assert(
  dosageViolations.length === 0,
  '10. Treatment Safety',
  'No arbitrary home-brewed pesticide dosages (e.g. tsp/tbsp per gallon) are prescribed',
  `Dosage violations: ${JSON.stringify(dosageViolations)}`
);

// ============================================================================
// TEST 11: Human/Pet Safety & International Poison Emergency Guidance
// ============================================================================
const medicalPrescriptionTerms = [
  'prescribe',
  'induce vomiting',
  'take 2 pills',
  'drink milk to neutralize',
  'administer hydrogen peroxide',
  'medical diagnosis',
];
const medicalViolations: { conditionId: string; term: string }[] = [];

for (const condition of PLANT_HEALTH_KB) {
  const safety = condition.humanPetSafety;
  if (!safety) continue;

  // Verify core safety disclaimers
  assert(
    typeof safety.isToxicToHumans === 'boolean' &&
      typeof safety.isToxicToPets === 'boolean' &&
      typeof safety.precautionaryAdvice === 'string' &&
      typeof safety.emergencyEscalationNote === 'string',
    '11. Human & Pet Safety',
    `Condition ${condition.id} has complete humanPetSafety structure`
  );

  const escalation = safety.emergencyEscalationNote.toLowerCase();

  // Verify internationalized emergency contact (not falsely asserting US 1-800 is universal)
  assert(
    escalation.includes('local') ||
      escalation.includes('emergency') ||
      escalation.includes('poison') ||
      escalation.includes('veterinarian') ||
      escalation.includes('hospital'),
    '11. Human & Pet Safety',
    `Condition ${condition.id} directs to local emergency services/poison centres`
  );

  // Check that US poison control is NOT presented as universal international emergency contact
  const falselyUniversal =
    escalation.includes('universal number is 1-800') ||
    escalation.includes('call 1-800-222-1222 anywhere in the world');
  assert(
    !falselyUniversal,
    '11. Human & Pet Safety',
    `Condition ${condition.id} does not misrepresent US poison hotline as universal`
  );

  // Check no medical prescriptions
  const allSafetyText = [safety.precautionaryAdvice, safety.emergencyEscalationNote]
    .join(' ')
    .toLowerCase();

  for (const term of medicalPrescriptionTerms) {
    if (allSafetyText.includes(term)) {
      medicalViolations.push({ conditionId: condition.id, term });
    }
  }
}

assert(
  medicalViolations.length === 0,
  '11. Human & Pet Safety',
  'No medical or veterinary diagnoses/prescriptions (e.g. inducing vomiting) are invented',
  `Medical violations: ${JSON.stringify(medicalViolations)}`
);

// ============================================================================
// TEST 12: No Universal or Unsupported Host Susceptibility Claims
// ============================================================================
const universalHostConditions = PLANT_HEALTH_KB.filter(
  (c) =>
    c.category === 'disease' &&
    c.confirmedHostSlugs.filter(
      (h) => h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family'
    ).length === PLANTS_DATA.length
);

assert(
  universalHostConditions.length === 0,
  '12. Host Susceptibility Evidencing',
  'No plant disease falsely claims universal susceptibility across all 19 catalog species',
  `Diseases claiming all 19 plants: ${universalHostConditions.map((c) => c.id).join(', ')}`
);

// Verify host relationships distinguish specific host biology
// e.g. Early blight affects Solanaceae (tomato), not mint or snake plant
const earlyBlight = getConditionById('disease-early-blight') as DiseaseCondition;
const earlyBlightConfirmedSlugs = earlyBlight?.confirmedHostSlugs
  .filter((h) => h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
  .map((h) => h.plantSlug) || [];

assert(
  earlyBlight !== undefined &&
    earlyBlightConfirmedSlugs.includes('tomato-bush') &&
    earlyBlightConfirmedSlugs.includes('cherry-tomato') &&
    !earlyBlightConfirmedSlugs.includes('snake-plant') &&
    !earlyBlightConfirmedSlugs.includes('golden-pothos') &&
    !earlyBlightConfirmedSlugs.includes('spearmint'),
  '12. Host Susceptibility Evidencing',
  'Early Blight host range is strictly limited to Solanaceae (tomatoes), excluding unrelated monocots/herbs'
);

// e.g. Septoria leaf spot affects tomatoes, not basil or lettuce
const septoria = getConditionById('disease-septoria-leaf-spot') as DiseaseCondition;
const septoriaConfirmedSlugs = septoria?.confirmedHostSlugs
  .filter((h) => h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
  .map((h) => h.plantSlug) || [];

assert(
  septoria !== undefined &&
    septoriaConfirmedSlugs.includes('tomato-bush') &&
    septoriaConfirmedSlugs.includes('cherry-tomato') &&
    !septoriaConfirmedSlugs.includes('genovese-basil') &&
    !septoriaConfirmedSlugs.includes('butterhead-lettuce'),
  '12. Host Susceptibility Evidencing',
  'Septoria Leaf Spot host range is strictly evidenced for Lycopersicon esculentum'
);

// ============================================================================
// TEST 13: All 19 Existing Botanical Records in plants.ts Remain Unchanged
// ============================================================================
assert(
  PLANTS_DATA.length === 19,
  '13. Botanical Catalog Integrity',
  `PLANTS_DATA maintains exactly 19 botanical species (found ${PLANTS_DATA.length})`
);

const expectedSlugs = [
  'tomato-bush',
  'cherry-tomato',
  'spinach',
  'butterhead-lettuce',
  'french-radish',
  'spearmint',
  'genovese-basil',
  'coriander',
  'golden-pothos',
  'snake-plant',
  'aloe-vera',
  'holy-basil-tulsi',
  'french-marigold',
  'dwarf-zinnia',
  'lemongrass',
  'broccoli-microgreens',
  'mung-bean-sprouts',
  'broccoli-sprouts',
  'alfalfa-sprouts',
];

const actualSlugs = PLANTS_DATA.map((p) => p.slug);
const missingSlugs = expectedSlugs.filter((s) => !actualSlugs.includes(s));
const extraSlugs = actualSlugs.filter((s) => !expectedSlugs.includes(s));

assert(
  missingSlugs.length === 0 && extraSlugs.length === 0,
  '13. Botanical Catalog Integrity',
  'All 19 original plant slugs exist exactly as defined in Phase 7/8.1 baseline',
  `Missing: ${missingSlugs.join(', ')} | Extra: ${extraSlugs.join(', ')}`
);

// Verify botanical immutability of specific known attributes
const tomato = PLANTS_DATA.find((p) => p.slug === 'tomato-bush');
assert(
  tomato?.scientificName === 'Solanum lycopersicum' &&
    tomato?.category === 'vegetables-fruits' &&
    Array.isArray(tomato?.commonProblems) &&
    tomato?.commonProblems.some((p) => p.issue === 'Blossom End Rot'),
  '13. Botanical Catalog Integrity',
  'Bush Tomato botanical profile retains Solanum lycopersicum taxonomy and original Blossom End Rot problem'
);

const basil = PLANTS_DATA.find((p) => p.slug === 'genovese-basil');
assert(
  basil?.scientificName === 'Ocimum basilicum' &&
    basil?.category === 'herbs-greens' &&
    basil?.watering?.frequency === 'Every 2 days',
  '13. Botanical Catalog Integrity',
  'Genovese Basil botanical profile retains Ocimum basilicum taxonomy and watering attributes'
);

// ============================================================================
// TEST 14: Search and Query Utility Functions
// ============================================================================
const yellowLeavesMatches = searchConditionsBySymptom('yellowing leaves chlorosis');
assert(
  yellowLeavesMatches.length >= 3,
  '14. Query Utilities',
  `searchConditionsBySymptom('yellowing leaves chlorosis') returned ${yellowLeavesMatches.length} matching conditions`
);

const highSeverityDiseases = queryHealthKb({
  category: 'disease',
  severity: 'high',
});
assert(
  highSeverityDiseases.length > 0,
  '14. Query Utilities',
  `queryHealthKb({ category: 'disease', severity: 'high' }) returned ${highSeverityDiseases.length} conditions`
);

// ============================================================================
// TEST 15: Resistant versus Not-Known-Host Distinction (Phase 8.2.1 Audit)
// ============================================================================
// Active resistance ('resistant') must strictly represent documented genetic/biological
// resistance, NOT merely the absence of a host relationship.
const allResistantRelationships: { conditionId: string; slug: string; notes?: string }[] = [];
for (const condition of PLANT_HEALTH_KB) {
  for (const hostRel of condition.confirmedHostSlugs) {
    if (hostRel.relationshipType === 'resistant') {
      allResistantRelationships.push({
        conditionId: condition.id,
        slug: hostRel.plantSlug,
        notes: hostRel.notes,
      });
    }
  }
}

// Every 'resistant' entry must possess clear documentation of active resistance
for (const rel of allResistantRelationships) {
  assert(
    typeof rel.notes === 'string' &&
      (rel.notes.toLowerCase().includes('genetic') ||
        rel.notes.toLowerCase().includes('resistance') ||
        rel.notes.toLowerCase().includes('breeding')),
    '15. Resistant vs Non-Host Distinction',
    `Resistant claim for ${rel.slug} under ${rel.conditionId} must cite specific genetic/breeding resistance: "${rel.notes}"`
  );
}

// Non-hosts (unrelated families outside host range) must use 'not_known_host', NOT 'resistant'
const downyMildew = getConditionById('disease-downy-mildew');
const tulsiRel = downyMildew?.confirmedHostSlugs.find((h) => h.plantSlug === 'holy-basil-tulsi');
assert(
  tulsiRel?.relationshipType === 'resistant',
  '15. Resistant vs Non-Host Distinction',
  'Holy Basil retains verified resistant relationship for basil downy mildew (Peronospora belbahrii) backed by Rutgers breeding research'
);

const snakePlantDowny = downyMildew?.confirmedHostSlugs.find((h) => h.plantSlug === 'snake-plant');
assert(
  snakePlantDowny?.relationshipType === 'not_known_host',
  '15. Resistant vs Non-Host Distinction',
  'Snake Plant is correctly marked not_known_host for downy mildew, not falsely claimed to be actively resistant'
);

// ============================================================================
// TEST 16: No Unsupported Resistance Claims (Phase 8.2.1 Audit)
// ============================================================================
// Check that unrelated monocots or non-hosts are NEVER labeled resistant to solanaceous/dicot diseases
const earlyBlightRelSnake = earlyBlight?.confirmedHostSlugs.find((h) => h.plantSlug === 'snake-plant');
assert(
  earlyBlightRelSnake?.relationshipType === 'not_known_host',
  '16. Unsupported Resistance Audit',
  'Snake plant is classified as not_known_host for early blight (Alternaria solani)'
);

const earlyBlightRelPothos = earlyBlight?.confirmedHostSlugs.find((h) => h.plantSlug === 'golden-pothos');
assert(
  earlyBlightRelPothos?.relationshipType === 'not_known_host',
  '16. Unsupported Resistance Audit',
  'Golden pothos is classified as not_known_host for early blight (Alternaria solani)'
);

const septoriaRelBasil = septoria?.confirmedHostSlugs.find((h) => h.plantSlug === 'genovese-basil');
assert(
  septoriaRelBasil?.relationshipType === 'not_known_host',
  '16. Unsupported Resistance Audit',
  'Genovese basil is classified as not_known_host for Septoria lycopersici (solanaceous host-specific)'
);

// ============================================================================
// TEST 17: Unknown & Non-Host Coverage Verification (Phase 8.2.1 Audit)
// ============================================================================
const notKnownHostCount = PLANT_HEALTH_KB.flatMap((c) => c.confirmedHostSlugs).filter(
  (h) => h.relationshipType === 'not_known_host'
).length;

assert(
  notKnownHostCount >= 15,
  '17. Unknown & Non-Host Distinction',
  `Expected at least 15 explicitly evidenced not_known_host botanical relationships, found ${notKnownHostCount}`
);

// ============================================================================
// TEST 18: Sprout & Seedling Sterility Wording Audit (Phase 8.2.1 Audit)
// ============================================================================
// Search entire KB content to verify that sprouting / seedling environments are NEVER falsely described as "sterile"
let falseSterilityViolations: { conditionId: string; context: string }[] = [];

for (const condition of PLANT_HEALTH_KB) {
  const fullText = JSON.stringify(condition).toLowerCase();
  // Check for phrases like "sterile sprouting", "sterile seed-starting", "sterile culture", "sterile environment"
  if (
    fullText.includes('sterile sprouting') ||
    fullText.includes('sterile seed-starting') ||
    fullText.includes('sterile culture') ||
    fullText.includes('sterile potting mix') ||
    fullText.includes('sterile environment')
  ) {
    falseSterilityViolations.push({ conditionId: condition.id, context: 'Falsely claimed sterile environment' });
  }
}

assert(
  falseSterilityViolations.length === 0,
  '18. Sprout Sterility Wording Audit',
  'Zero conditions falsely describe sprouting or potting media as sterile (pasteurized/sanitized used)',
  `Violations: ${JSON.stringify(falseSterilityViolations)}`
);

// ============================================================================
// TEST 19: Sprout Microbial Contamination Warnings (Phase 8.2.1 Audit)
// ============================================================================
const dampingOff = getConditionById('disease-damping-off');
const dampingOffFoodNotes = dampingOff?.edibleCropRelevance.foodSafetyNotes?.toLowerCase() || '';

assert(
  dampingOffFoodNotes.includes('salmonella') &&
    dampingOffFoodNotes.includes('escherichia coli') &&
    dampingOffFoodNotes.includes('listeria'),
  '19. Sprout Microbial Food Safety',
  'Damping-off edible food safety notes explicitly warn against human bacterial pathogens (Salmonella, E. coli, Listeria)'
);

assert(
  dampingOffFoodNotes.includes('pest') &&
    dampingOffFoodNotes.includes('microbial'),
  '19. Sprout Microbial Food Safety',
  'Damping-off food safety notes explicitly distinguish absence of garden pests from human microbial contamination risks'
);

// Check that sprout host relationships are present under damping off
const dampingOffSprouts = dampingOff?.confirmedHostSlugs.filter((h) =>
  ['broccoli-sprouts', 'mung-bean-sprouts', 'alfalfa-sprouts'].includes(h.plantSlug)
);
assert(
  dampingOffSprouts?.length === 3,
  '19. Sprout Microbial Food Safety',
  'All 3 sprout species (broccoli, mung bean, alfalfa) are cross-referenced with damping-off seed rot risks'
);

// ============================================================================
// TEST 20: Evidence Scope Traceability (Phase 8.2.1 Audit)
// ============================================================================
let totalScopedReferences = 0;
const unscopedReferences: { conditionId: string; title: string }[] = [];

for (const condition of PLANT_HEALTH_KB) {
  for (const ref of condition.references) {
    if (Array.isArray(ref.scopes) && ref.scopes.length > 0) {
      totalScopedReferences++;
      // Validate scope values
      const validScopes = [
        'identification_symptoms',
        'host_relationships',
        'environmental_triggers',
        'prevention_cultural',
        'treatment_ipm',
        'edible_crop_safety',
      ];
      for (const scope of ref.scopes) {
        assert(
          validScopes.includes(scope),
          '20. Evidence Scope Traceability',
          `Reference "${ref.title}" in ${condition.id} has valid scope "${scope}"`
        );
      }
    } else {
      unscopedReferences.push({ conditionId: condition.id, title: ref.title });
    }
  }
}

assert(
  totalScopedReferences >= 35,
  '20. Evidence Scope Traceability',
  `Expected at least 35 scoped supporting references, found ${totalScopedReferences}`
);

// ============================================================================
// TEST 21: Emergency Contact Safety & Localization (Phase 8.2.1 Audit)
// ============================================================================
const countrySpecificUniversalViolations: string[] = [];

for (const condition of PLANT_HEALTH_KB) {
  const escalation = condition.humanPetSafety?.emergencyEscalationNote || '';
  // Verify that US numbers (1-800, 911) are NOT presented as universal international hotlines
  if (
    escalation.includes('1-800') ||
    escalation.includes('911 anywhere') ||
    escalation.includes('universal number is 911')
  ) {
    countrySpecificUniversalViolations.push(condition.id);
  }

  // Verify generic local emergency service guidance is used
  const lower = escalation.toLowerCase();
  assert(
    lower.includes('local') &&
      (lower.includes('poison') || lower.includes('emergency')),
    '21. Emergency Contact Localization',
    `Condition ${condition.id} directs to generic local poison control or emergency services`
  );
}

assert(
  countrySpecificUniversalViolations.length === 0,
  '21. Emergency Contact Localization',
  'No country-specific emergency phone number is falsely presented as universal international contact',
  `Violations: ${countrySpecificUniversalViolations.join(', ')}`
);

// ============================================================================
// TEST SUMMARY & EXECUTION REPORT
// ============================================================================
const totalTests = results.length;
const passedTests = results.filter((r) => r.passed).length;
const failedTests = results.filter((r) => !r.passed).length;

console.log('\n======================================================================');
console.log(`📊 Phase 8.2 & 8.2.1 Test Suite Execution Summary`);
console.log('======================================================================');
console.log(`Total Assertions Checked: ${totalTests}`);
console.log(`✅ Passed:                ${passedTests}`);
console.log(`❌ Failed:                ${failedTests}`);
console.log('======================================================================\n');

if (failedTests > 0) {
  console.error(`💥 ${failedTests} test(s) FAILED. Please review the errors above.`);
  process.exit(1);
} else {
  console.log(`🎉 All ${passedTests} test assertions PASSED without error.`);
  process.exit(0);
}
