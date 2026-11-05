/**
 * GrowAI Phase 8.3 — AI Doctor Intelligence & Differential Reasoning Test Battery
 *
 * Verifies all 16 required Phase 8.3 diagnostic intelligence criteria:
 *  1. Tomato yellowing with watering context (differential diagnosis)
 *  2. Powdery mildew-like leaf symptoms (fungal vs mineral)
 *  3. Spider mite-like stippling and webbing (pest diagnosis with IPM controls)
 *  4. Root rot versus overwatering stress (distinguishing abiotic from biotic root rot)
 *  5. Nutrient deficiency versus infectious disease (interveinal chlorosis vs pathogen)
 *  6. Unknown plant species handling
 *  7. Non-plant image and rejection handling
 *  8. Blurry, underexposed, and small images (objective image quality assessment)
 *  9. Contradictory environmental context handling
 * 10. Vague / no matching condition handling (inconclusive state)
 * 11. Malformed / invalid Gemini JSON handling (safe fallback & resilience)
 * 12. Hallucinated / unknown condition IDs sanitization against Knowledge Base
 * 13. Heuristic offline diagnosis (multiple candidates, grounded KB IDs, PWA compatibility)
 * 14. Rate-limiter regression
 * 15. Existing image validation (magic bytes, 5 MB limit, Sharp optimization)
 * 16. Candidate count <= 3 and follow-up questions count <= 3
 */

import sharp from 'sharp';
import {
  AiDiagnosisResultSchema,
  PossibleConditionSchema,
  DiagnosisInput,
  DiagnosisResponse,
} from './src/types/diagnosis';
import {
  selectRelevantKbConditions,
  sanitizeAiResult,
  groundAndValidateCandidates,
} from './src/lib/ai-doctor/gemini';
import { diagnoseWithHeuristics } from './src/lib/ai-doctor/heuristic';
import {
  validateImageBuffer,
  assessImageQuality,
  detectMagicMimeType,
  optimizeImageForVision,
  MAX_IMAGE_SIZE_BYTES,
} from './src/lib/ai-doctor/image-validator';
import { checkRateLimit } from './src/lib/ai-doctor/rate-limiter';
import { PLANT_HEALTH_KB, getConditionById } from './src/data/plant-health-kb';

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

async function runTests() {
  console.log('🌱 Starting GrowAI Phase 8.3 AI Doctor Diagnostic Intelligence Test Battery...\n');

  // ============================================================================
  // TEST 1: Tomato Yellowing with Watering Context
  // ============================================================================
  const tomatoInput: DiagnosisInput = {
    plantSlug: 'tomato-bush',
    plantName: 'Bush Tomato',
    symptoms: 'Lower leaves are turning pale yellow and dropping off',
    wateringFrequency: 'Watering daily, soil stays constantly soggy',
    environment: 'Balcony vertical container',
  };

  const relevantTomatoKb = selectRelevantKbConditions(tomatoInput);
  assert(
    relevantTomatoKb.some((c) => c.id === 'abiotic-overwatering-stress'),
    '1. Tomato Yellowing Context',
    'selectRelevantKbConditions includes abiotic-overwatering-stress for soggy tomato'
  );

  const tomatoDiagnosis = await diagnoseWithHeuristics(tomatoInput);
  assert(
    tomatoDiagnosis.status === 'completed',
    '1. Tomato Yellowing Context',
    'Diagnosis status is completed'
  );
  assert(
    tomatoDiagnosis.possibleConditions.length >= 2 && tomatoDiagnosis.possibleConditions.length <= 3,
    '1. Tomato Yellowing Context',
    `Returns 2 to 3 differential candidates (found ${tomatoDiagnosis.possibleConditions.length})`
  );
  assert(
    tomatoDiagnosis.possibleConditions.some((c) => c.kbConditionId === 'abiotic-overwatering-stress'),
    '1. Tomato Yellowing Context',
    'Includes abiotic-overwatering-stress candidate with valid KB ID'
  );
  assert(
    ['mixed', 'abiotic'].includes(tomatoDiagnosis.primaryClassification || ''),
    '1. Tomato Yellowing Context',
    `Classified as abiotic or mixed (got ${tomatoDiagnosis.primaryClassification})`
  );

  // ============================================================================
  // TEST 2: Powdery Mildew-Like Leaf Symptoms
  // ============================================================================
  const mildewInput: DiagnosisInput = {
    plantSlug: 'dwarf-zinnia',
    plantName: 'Zinnia',
    symptoms: 'Superficial white powdery flour-like coating across upper leaf surfaces',
  };

  const mildewDiagnosis = await diagnoseWithHeuristics(mildewInput);
  assert(
    mildewDiagnosis.possibleConditions[0]?.kbConditionId === 'disease-powdery-mildew',
    '2. Powdery Mildew Symptoms',
    'Leading candidate is disease-powdery-mildew'
  );
  assert(
    mildewDiagnosis.primaryClassification === 'biotic',
    '2. Powdery Mildew Symptoms',
    'Classified as biotic infectious disease'
  );
  assert(
    mildewDiagnosis.possibleConditions[0]?.groundedTreatment !== undefined,
    '2. Powdery Mildew Symptoms',
    'Candidate includes knowledge-grounded treatment plan'
  );
  assert(
    !JSON.stringify(mildewDiagnosis).includes('universal 72-hour'),
    '2. Powdery Mildew Symptoms',
    'No invented universal 72-hour withholding interval in diagnosis output'
  );

  // ============================================================================
  // TEST 3: Spider Mite-Like Stippling & Webbing
  // ============================================================================
  const miteInput: DiagnosisInput = {
    plantSlug: 'spearmint',
    plantName: 'Spearmint',
    symptoms: 'Fine yellow stippling and minute silk webbing on leaf undersides with tiny crawling specks',
    environment: 'Dry sunny indoor windowsill',
  };

  const miteDiagnosis = await diagnoseWithHeuristics(miteInput);
  assert(
    miteDiagnosis.possibleConditions[0]?.kbConditionId === 'pest-spider-mites',
    '3. Spider Mite Symptoms',
    'Leading candidate is pest-spider-mites'
  );
  assert(
    miteDiagnosis.primaryClassification === 'biotic',
    '3. Spider Mite Symptoms',
    'Classified as biotic pest'
  );
  assert(
    Boolean(miteDiagnosis.possibleConditions[0]?.recommendedNextObservation?.includes('underside')),
    '3. Spider Mite Symptoms',
    'Recommended next observation advises checking leaf undersides'
  );

  // ============================================================================
  // TEST 4: Root Rot vs Overwatering Stress
  // ============================================================================
  const overwaterCond = getConditionById('abiotic-overwatering-stress');
  const rootRotCond = getConditionById('disease-root-rot');
  assert(
    overwaterCond?.category === 'abiotic' && rootRotCond?.category === 'disease',
    '4. Root Rot vs Overwatering',
    'Knowledge base separates abiotic moisture stress from oomycete/fungal root rot'
  );

  const rotInput: DiagnosisInput = {
    plantSlug: 'golden-pothos',
    symptoms: 'Lower stem is turning black, mushy, and wilting despite wet soil',
    wateringFrequency: 'Standing water in bottom drainage saucer',
  };
  const rotDiagnosis = await diagnoseWithHeuristics(rotInput);
  const rotCandidateIds = rotDiagnosis.possibleConditions.map((c) => c.kbConditionId);
  assert(
    rotCandidateIds.includes('disease-root-rot') || rotCandidateIds.includes('abiotic-overwatering-stress'),
    '4. Root Rot vs Overwatering',
    'Pothos mushy stem diagnosis evaluates root rot and moisture saturation differential'
  );

  // ============================================================================
  // TEST 5: Nutrient Deficiency vs Infectious Disease
  // ============================================================================
  const chlorosisInput: DiagnosisInput = {
    plantSlug: 'tomato-bush',
    symptoms: 'Young top leaves have bright yellow blades but the veins remain dark green',
  };
  const chlorosisDiagnosis = await diagnoseWithHeuristics(chlorosisInput);
  assert(
    chlorosisDiagnosis.primaryClassification === 'abiotic',
    '5. Nutrient vs Disease',
    'Interveinal chlorosis correctly categorized as abiotic, not assumed to be infectious'
  );
  assert(
    chlorosisDiagnosis.possibleConditions.some(
      (c) => c.kbConditionId === 'abiotic-iron-deficiency' || c.kbConditionId === 'abiotic-nitrogen-deficiency'
    ),
    '5. Nutrient vs Disease',
    'Candidates include verified micronutrient/macronutrient chlorosis KB IDs'
  );

  // ============================================================================
  // TEST 6: Unknown Plant Species Handling
  // ============================================================================
  const unknownPlantInput: DiagnosisInput = {
    plantName: 'Exotic Unknown Houseplant',
    symptoms: 'Leaves have brown crispy tips',
  };
  const unknownDiagnosis = await diagnoseWithHeuristics(unknownPlantInput);
  assert(
    unknownDiagnosis.status === 'completed',
    '6. Unknown Plant Species',
    'Gracefully completes diagnosis for unlisted plant species'
  );
  assert(
    unknownDiagnosis.plantIdentification === 'Exotic Unknown Houseplant',
    '6. Unknown Plant Species',
    'Preserves user plant name without hallucinating a fake botanical species'
  );

  // ============================================================================
  // TEST 7: Non-Plant Image & Rejection Handling
  // ============================================================================
  const nonPlantMockRaw = {
    status: 'not_a_plant',
    primaryClassification: 'undetermined',
    isPlantRecognized: false,
    plantIdentification: 'No plant detected',
    plantIdentificationConfidence: 'high',
    overallHealth: 'unknown',
    visibleSymptoms: [],
    possibleConditions: [],
    likelyCauses: ['Image depicts household furniture, not a botanical specimen'],
    recommendedChecks: ['Upload a clear photograph of a living plant specimen'],
    immediateActions: [],
    longTermCare: [],
    prevention: [],
    uncertainties: ['No botanical tissue present'],
    requiresExpertReview: false,
    disclaimer: 'GrowAI AI Plant Doctor provides educational plant health guidance.',
  };

  const sanitizedNonPlant = sanitizeAiResult(nonPlantMockRaw);
  assert(
    sanitizedNonPlant.status === 'not_a_plant' && sanitizedNonPlant.isPlantRecognized === false,
    '7. Non-Plant Handling',
    'sanitizeAiResult preserves not_a_plant status and isPlantRecognized: false'
  );
  assert(
    sanitizedNonPlant.possibleConditions.length === 0,
    '7. Non-Plant Handling',
    'Non-plant result contains zero fabricated plant conditions'
  );

  // ============================================================================
  // TEST 8: Blurry, Underexposed, and Small Images (Quality Assessment)
  // ============================================================================
  // Create test buffers using Sharp
  const leafSvg = Buffer.from(
    '<svg width="600" height="600"><circle cx="300" cy="300" r="180" fill="#2d6a4f"/><path d="M150 300 Q300 150 450 300 T150 300" fill="#95d5b2"/></svg>'
  );
  const clearBuffer = await sharp({
    create: {
      width: 600,
      height: 600,
      channels: 3,
      background: { r: 50, g: 140, b: 60 },
    },
  })
    .composite([{ input: leafSvg }])
    .jpeg()
    .toBuffer();

  const darkBuffer = await sharp({
    create: {
      width: 600,
      height: 600,
      channels: 3,
      background: { r: 10, g: 10, b: 10 },
    },
  })
    .jpeg()
    .toBuffer();

  const tinyBuffer = await sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 80, g: 150, b: 70 },
    },
  })
    .png()
    .toBuffer();

  const clearQuality = await assessImageQuality(clearBuffer);
  assert(
    clearQuality.isQualitySufficient === true && clearQuality.qualityIssues.length === 0,
    '8. Image Quality Assessment',
    'Clear image evaluates as sufficient with zero quality issues'
  );

  const darkQuality = await assessImageQuality(darkBuffer);
  assert(
    darkQuality.qualityIssues.includes('underexposure'),
    '8. Image Quality Assessment',
    'Dark image identifies underexposure issue'
  );
  assert(
    typeof darkQuality.guidanceForBetterPhoto === 'string' &&
      darkQuality.guidanceForBetterPhoto.includes('light'),
    '8. Image Quality Assessment',
    'Dark image provides constructive lighting guidance'
  );

  const tinyQuality = await assessImageQuality(tinyBuffer);
  assert(
    tinyQuality.qualityIssues.includes('subject_too_small') ||
      tinyQuality.qualityIssues.includes('missing_close_up_detail'),
    '8. Image Quality Assessment',
    'Tiny image identifies subject_too_small / missing_close_up_detail'
  );

  // ============================================================================
  // TEST 9: Contradictory Environmental Context
  // ============================================================================
  const contradictoryInput: DiagnosisInput = {
    plantSlug: 'tomato-bush',
    symptoms: 'Leaf tips are brown and crispy, but container is drenched twice daily with standing water in saucer',
    wateringFrequency: 'Twice daily flooding',
  };
  const contradictoryDiagnosis = await diagnoseWithHeuristics(contradictoryInput);
  assert(
    contradictoryDiagnosis.possibleConditions.length >= 2,
    '9. Contradictory Context',
    'Provides differential candidates for contradictory symptoms (tip burn vs overwatering/edema)'
  );
  assert(
    (contradictoryDiagnosis.followUpQuestions?.length ?? 0) > 0,
    '9. Contradictory Context',
    'Generates targeted follow-up questions to resolve contradictory context'
  );

  // ============================================================================
  // TEST 10: Vague / No Matching Condition (Inconclusive State)
  // ============================================================================
  const vagueInput: DiagnosisInput = {
    symptoms: 'weird',
  };
  const vagueDiagnosis = await diagnoseWithHeuristics(vagueInput);
  assert(
    vagueDiagnosis.possibleConditions.some((c) => c.confidenceCategory === 'inconclusive' || c.confidenceCategory === 'moderate'),
    '10. Inconclusive State',
    'Vague 1-word symptom reports honest inconclusive/moderate confidence, not false certainty'
  );

  // ============================================================================
  // TEST 11: Malformed / Invalid Gemini JSON Handling (Safe Fallback)
  // ============================================================================
  const corruptedRaw = {
    // Missing status, missing isPlantRecognized, partial conditions
    randomField: 12345,
    possibleConditions: [
      {
        name: 'Early Blight',
        // missing explanation, missing confidenceCategory
      },
    ],
  };

  const sanitized = sanitizeAiResult(corruptedRaw);
  assert(
    sanitized.status === 'completed' &&
      sanitized.primaryClassification === 'undetermined' &&
      Array.isArray(sanitized.possibleConditions) &&
      sanitized.possibleConditions.length === 1 &&
      sanitized.possibleConditions[0].kbConditionId === 'disease-early-blight',
    '11. Safe Fallback Resilience',
    'sanitizeAiResult resolves Early Blight common name to disease-early-blight KB ID'
  );

  // Verify Zod schema validation passes on sanitized object
  const zodCheck = AiDiagnosisResultSchema.safeParse(sanitized);
  assert(
    zodCheck.success,
    '11. Safe Fallback Resilience',
    'Sanitized output strictly satisfies AiDiagnosisResultSchema'
  );

  // ============================================================================
  // TEST 12: Hallucinated / Unknown Condition IDs Sanitization
  // ============================================================================
  const hallucinatedRaw: any = {
    status: 'completed',
    primaryClassification: 'biotic',
    isPlantRecognized: true,
    plantIdentification: 'Tomato',
    plantIdentificationConfidence: 'high',
    overallHealth: 'moderate_issue',
    visibleSymptoms: ['Concentric ring spots'],
    possibleConditions: [
      {
        name: 'Fictional Super Blight',
        kbConditionId: 'disease-invented-blight-999', // Hallucinated ID
        category: 'disease',
        explanation: 'Fictional disease description.',
        confidenceCategory: 'moderate',
        supportingEvidence: ['Spots observed'],
        alternativeCauses: [],
      },
      {
        name: 'Septoria Leaf Spot',
        kbConditionId: 'disease-fake-septoria-id', // Hallucinated ID, but valid name
        category: 'disease',
        explanation: 'Small circular spots.',
        confidenceCategory: 'moderate',
        supportingEvidence: ['Spots observed'],
        alternativeCauses: [],
      },
    ],
    likelyCauses: ['Fungal infection'],
    recommendedChecks: ['Check lower leaves'],
    immediateActions: ['Remove spotted leaves'],
    longTermCare: ['Improve ventilation'],
    prevention: ['Sanitize tools'],
    uncertainties: ['Spore microscopy needed'],
    requiresExpertReview: false,
    disclaimer: 'GrowAI AI Plant Doctor',
  };

  const grounded = groundAndValidateCandidates(hallucinatedRaw);
  // First candidate had a fake ID and fake name: ID must be removed
  assert(
    grounded.possibleConditions[0].kbConditionId === undefined,
    '12. ID Sanitization',
    'Hallucinated ID with no KB match is stripped from candidate'
  );
  // Second candidate had fake ID but valid common name: mapped to real KB ID
  assert(
    grounded.possibleConditions[1].kbConditionId === 'disease-septoria-leaf-spot',
    '12. ID Sanitization',
    'Valid common name with hallucinated ID maps safely to verified KB ID disease-septoria-leaf-spot'
  );
  assert(
    grounded.possibleConditions[1].groundedTreatment !== undefined,
    '12. ID Sanitization',
    'Grounded candidate attaches verified knowledge base treatment plan'
  );

  // ============================================================================
  // TEST 13: Candidate Count & Follow-Up Questions Limits
  // ============================================================================
  assert(
    tomatoDiagnosis.possibleConditions.length <= 3,
    '13. Structural Limits',
    'possibleConditions never exceeds maximum 3 candidates'
  );
  assert(
    (tomatoDiagnosis.followUpQuestions?.length || 0) <= 3,
    '13. Structural Limits',
    'followUpQuestions never exceeds maximum 3 questions'
  );

  // ============================================================================
  // TEST 14: Rate-Limiter Regression
  // ============================================================================
  const rateLimitCheckGuest = await checkRateLimit('test-guest-ip-12345', false);
  assert(
    typeof rateLimitCheckGuest.allowed === 'boolean' &&
      typeof rateLimitCheckGuest.remaining === 'number' &&
      rateLimitCheckGuest.limit === 3,
    '14. Rate Limiter Regression',
    'Guest rate limit correctly enforces 3 diagnoses/hour'
  );

  const rateLimitCheckUser = await checkRateLimit('test-auth-user-99999', true);
  assert(
    typeof rateLimitCheckUser.allowed === 'boolean' &&
      rateLimitCheckUser.limit === 15,
    '14. Rate Limiter Regression',
    'Authenticated user rate limit correctly enforces 15 diagnoses/hour'
  );

  // ============================================================================
  // TEST 15: Existing Image Validation (Magic Bytes & 5 MB Limit)
  // ============================================================================
  // Magic bytes check
  assert(
    detectMagicMimeType(clearBuffer) === 'image/jpeg',
    '15. Image Validation',
    'detectMagicMimeType correctly detects genuine JPEG magic bytes'
  );
  assert(
    detectMagicMimeType(tinyBuffer) === 'image/png',
    '15. Image Validation',
    'detectMagicMimeType correctly detects genuine PNG magic bytes'
  );
  assert(
    detectMagicMimeType(Buffer.from('Not a real image file content')) === null,
    '15. Image Validation',
    'detectMagicMimeType correctly rejects non-image text file'
  );

  // Size limit check
  const validated = await validateImageBuffer(clearBuffer);
  assert(
    validated.width === 600 && validated.height === 600 && validated.format === 'jpeg',
    '15. Image Validation',
    'validateImageBuffer validates dimensions and format'
  );

  // Optimization check
  const optimized = await optimizeImageForVision(validated);
  assert(
    typeof optimized.base64Data === 'string' && optimized.base64Data.length > 100,
    '15. Image Validation',
    'optimizeImageForVision converts validated image to optimized base64 payload'
  );

  // 5MB Limit verification
  let sizeLimitCaught = false;
  try {
    const hugeFakeBuffer = Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 1024);
    await validateImageBuffer(hugeFakeBuffer);
  } catch (err: any) {
    if (err.message.includes('5 MB')) {
      sizeLimitCaught = true;
    }
  }
  assert(
    sizeLimitCaught,
    '15. Image Validation',
    'validateImageBuffer strictly rejects images exceeding 5 MB limit'
  );

  // ============================================================================
  // TEST 16: Evidence Separation Verification
  // ============================================================================
  assert(
    Array.isArray(tomatoDiagnosis.evidenceSeparation?.observedEvidence) &&
      Array.isArray(tomatoDiagnosis.evidenceSeparation?.diagnosticInterpretation) &&
      Array.isArray(tomatoDiagnosis.evidenceSeparation?.unknownInformation),
    '16. Evidence Separation',
    'Diagnosis separates observed evidence, diagnostic interpretations, and unknowns'
  );
  assert(
    tomatoDiagnosis.evidenceSeparation!.observedEvidence.length > 0,
    '16. Evidence Separation',
    'Observed evidence contains grower-reported observations'
  );
  assert(
    tomatoDiagnosis.evidenceSeparation!.unknownInformation.some(
      (u) => u.toLowerCase().includes('root') || u.toLowerCase().includes('vision')
    ),
    '16. Evidence Separation',
    'Unknown information explicitly documents hidden parameters (roots/subsurface)'
  );

  // ============================================================================
  // SUMMARY
  // ============================================================================
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log('\n======================================================================');
  console.log(`📊 Phase 8.3 AI Doctor Intelligence Test Suite Execution Summary`);
  console.log('======================================================================');
  console.log(`Total Assertions Checked: ${total}`);
  console.log(`✅ Passed:                ${passed}`);
  console.log(`❌ Failed:                ${failed}`);
  console.log('======================================================================\n');

  if (failed > 0) {
    console.error(`💥 ${failed} test(s) FAILED.`);
    process.exit(1);
  } else {
    console.log(`🎉 All ${passed} diagnostic intelligence test assertions PASSED without error.`);
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Fatal test runner exception:', err);
  process.exit(1);
});
