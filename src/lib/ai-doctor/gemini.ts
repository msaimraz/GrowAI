import { GoogleGenAI } from '@google/genai';
import {
  AiDiagnosisResult,
  AiDiagnosisResultSchema,
  DiagnosisInput,
  DiagnosisResponse,
  PossibleCondition,
  FollowUpQuestion,
} from '@/types/diagnosis';
import { ValidatedImage, optimizeImageForVision } from './image-validator';
import {
  PLANT_HEALTH_KB,
  getConditionById,
  getConditionsForPlantSlug,
  searchConditionsBySymptom,
} from '@/data/plant-health-kb';
import type { PlantHealthCondition } from '@/types/health';

const DEFAULT_MODEL = 'gemini-3.8-flash';
const REQUEST_TIMEOUT_MS = 180000; // 180 seconds (3 minutes) accommodating multimodal vision latency and retries

/**
 * Check if the Gemini AI vision service is configured on this environment.
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.AI_VISION_API_KEY;
  return Boolean(apiKey && apiKey.trim().length > 10 && !apiKey.includes('placeholder'));
}

/**
 * Get configured model name.
 */
export function getGeminiModelName(): string {
  return process.env.AI_MODEL_NAME || DEFAULT_MODEL;
}

/**
 * Select a relevant subset of knowledge base conditions to ground Gemini analysis.
 * Avoids dumping all 35 records blindly while ensuring accurate differential candidates.
 */
export function selectRelevantKbConditions(input: DiagnosisInput): PlantHealthCondition[] {
  const scored = new Map<string, { condition: PlantHealthCondition; score: number }>();

  function addOrBoost(c: PlantHealthCondition, boost: number) {
    const existing = scored.get(c.id);
    if (existing) {
      existing.score += boost;
    } else {
      scored.set(c.id, { condition: c, score: boost });
    }
  }

  // 1. Environmental triggers (high priority matching grower's physical observations)
  const envText = [
    input.wateringFrequency,
    input.sunlight,
    input.temperature,
    input.soilInfo,
    input.environment,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (
    envText.includes('frequent') ||
    envText.includes('daily') ||
    envText.includes('wet') ||
    envText.includes('soggy') ||
    envText.includes('waterlog') ||
    envText.includes('saucer') ||
    envText.includes('drain')
  ) {
    const overwater = getConditionById('abiotic-overwatering-stress');
    const rootRot = getConditionById('disease-root-rot');
    const gnats = getConditionById('pest-fungus-gnats');
    const edema = getConditionById('abiotic-edema');
    if (overwater) addOrBoost(overwater, 15);
    if (rootRot) addOrBoost(rootRot, 12);
    if (gnats) addOrBoost(gnats, 8);
    if (edema) addOrBoost(edema, 8);
  }

  if (
    envText.includes('dry') ||
    envText.includes('rare') ||
    envText.includes('drought') ||
    envText.includes('windowsill')
  ) {
    const underwater = getConditionById('abiotic-underwatering-stress');
    const spiderMites = getConditionById('pest-spider-mites');
    if (underwater) addOrBoost(underwater, 15);
    if (spiderMites) addOrBoost(spiderMites, 12);
  }

  if (
    envText.includes('sun') ||
    envText.includes('scorch') ||
    envText.includes('balcony') ||
    envText.includes('hot') ||
    envText.includes('heat')
  ) {
    const sunScorch = getConditionById('abiotic-sun-scorch');
    const heatStress = getConditionById('abiotic-heat-stress');
    if (sunScorch) addOrBoost(sunScorch, 15);
    if (heatStress) addOrBoost(heatStress, 12);
  }

  // 2. Search by symptoms query keywords
  if (input.symptoms) {
    const symptomsLower = input.symptoms.toLowerCase();

    // Specific symptom hallmark boosts
    if (symptomsLower.includes('web') || symptomsLower.includes('mite') || symptomsLower.includes('stipple')) {
      const mites = getConditionById('pest-spider-mites');
      if (mites) addOrBoost(mites, 20);
    }
    if (symptomsLower.includes('powder') || symptomsLower.includes('flour') || symptomsLower.includes('white coating')) {
      const mildew = getConditionById('disease-powdery-mildew');
      if (mildew) addOrBoost(mildew, 20);
    }
    if (symptomsLower.includes('mushy') || symptomsLower.includes('black stem') || symptomsLower.includes('decay')) {
      const rootRot = getConditionById('disease-root-rot');
      if (rootRot) addOrBoost(rootRot, 20);
    }
    if (symptomsLower.includes('yellow') || symptomsLower.includes('chlorosis')) {
      const nDef = getConditionById('abiotic-nitrogen-deficiency');
      const feDef = getConditionById('abiotic-iron-deficiency');
      const overwater = getConditionById('abiotic-overwatering-stress');
      if (nDef) addOrBoost(nDef, 10);
      if (feDef) addOrBoost(feDef, 8);
      if (overwater) addOrBoost(overwater, 8);
    }

    const symptomMatches = searchConditionsBySymptom(input.symptoms);
    for (let i = 0; i < symptomMatches.length; i++) {
      addOrBoost(symptomMatches[i], Math.max(2, 10 - i));
    }
  }

  // 3. Plant host relationship (confirmed host species)
  if (input.plantSlug) {
    const hostConditions = getConditionsForPlantSlug(input.plantSlug);
    for (const c of hostConditions) {
      addOrBoost(c, 4);
    }
  }

  // 4. Baseline archetypes if needed
  const defaultSeeds = [
    'abiotic-overwatering-stress',
    'abiotic-nitrogen-deficiency',
    'disease-powdery-mildew',
    'pest-aphids',
    'pest-spider-mites',
    'disease-early-blight',
    'disease-root-rot',
  ];
  for (const seedId of defaultSeeds) {
    if (scored.size >= 8) break;
    const cond = getConditionById(seedId);
    if (cond) addOrBoost(cond, 1);
  }

  // Sort by calculated relevance score descending and return top 10-12
  const sorted = Array.from(scored.values())
    .sort((a, b) => b.score - a.score)
    .map((item) => item.condition);

  return sorted.slice(0, 12);
}

/**
 * Build structured agronomic evaluation prompt for Gemini Multimodal Vision grounded in the Knowledge Base.
 */
function buildAnalysisPrompt(input: DiagnosisInput, image: ValidatedImage): string {
  const contextParts: string[] = [];

  if (input.plantName) {
    contextParts.push(`- Grower-Stated Species: "${input.plantName}"`);
  }
  if (input.plantSlug) {
    contextParts.push(`- Botanical Plant Slug: "${input.plantSlug}"`);
  }
  if (input.symptoms) {
    contextParts.push(`- Grower-Reported Symptoms: "${input.symptoms}"`);
  }
  if (input.wateringFrequency) {
    contextParts.push(`- Watering Routine: "${input.wateringFrequency}"`);
  }
  if (input.sunlight) {
    contextParts.push(`- Sunlight / Exposure: "${input.sunlight}"`);
  }
  if (input.environment) {
    contextParts.push(`- Growing Environment: "${input.environment}"`);
  }
  if (input.temperature) {
    contextParts.push(`- Ambient Temperature: "${input.temperature}"`);
  }
  if (input.soilInfo) {
    contextParts.push(`- Substrate / Potting Soil: "${input.soilInfo}"`);
  }

  const contextBlock = contextParts.length > 0
    ? `GROWER-REPORTED CONTEXT:\n${contextParts.join('\n')}`
    : 'No additional grower context provided.';

  // Format relevant knowledge base candidates
  const relevantKb = selectRelevantKbConditions(input);
  const kbCatalogSummary = relevantKb.map((c) => {
    const hostSlugs = c.confirmedHostSlugs
      .filter((h) => h.relationshipType === 'confirmed_host' || h.relationshipType === 'susceptible_family')
      .map((h) => h.plantSlug)
      .join(', ');

    return `ID: "${c.id}" | Name: "${c.commonName}" | Category: ${c.category}
  Symptoms: ${c.observableSymptoms.slice(0, 3).join('; ')}
  Confirmed Hosts: ${hostSlugs || 'General / multi-species'}
  Key Clues: ${c.possibleCauses.slice(0, 2).join('; ')}`;
  }).join('\n\n');

  // Photographic quality notes
  let qualityContext = '';
  if (image.qualityAssessment && image.qualityAssessment.qualityIssues.length > 0) {
    qualityContext = `\nTECHNICAL IMAGE QUALITY NOTES:\nDetected issues: ${image.qualityAssessment.qualityIssues.join(', ')}. ${image.qualityAssessment.guidanceForBetterPhoto || ''}\n`;
  }

  return `You are a certified senior horticultural pathologist and diagnostic specialist for GrowAI, an urban home gardening and vertical farming intelligence platform.

Analyze the uploaded photograph alongside the grower-reported context to produce an evidence-based differential diagnosis grounded in the GrowAI verified plant health knowledge base.

${contextBlock}
${qualityContext}

VERIFIED GROWAI KNOWLEDGE BASE CANDIDATES:
${kbCatalogSummary}

DIAGNOSTIC METHODOLOGY AND STRICT RULES:
1. EVIDENCE-BASED DIFFERENTIAL REASONING:
   - Provide up to three (1 to 3) candidate conditions in "possibleConditions", ordered by clinical plausibility.
   - For every candidate, provide the matching "kbConditionId" from the knowledge base candidates above.
   - Never invent condition names, pathogens, or pest species not supported by evidence.
   - If the specimen is not a known host for the condition, state this limitation clearly in "contradictingEvidence".
   - If evidence is insufficient to identify a condition with confidence, set status to "inconclusive" and confidenceCategory to "inconclusive". Never force an unsupported diagnosis.
   - Every candidate must be presented as a possibility, NEVER as a definitive confirmed diagnosis.

2. BIOTIC VS ABIOTIC CLASSIFICATION:
   - Identify the broad "primaryClassification": "biotic" (infectious pathogen or arthropod pest), "abiotic" (nutrient, water, temperature, light, cultural stress), "mixed" (both biotic and abiotic stressors present), or "undetermined".
   - Never infer an infectious pathogen solely from leaf yellowing, browning, or dry spots without distinct biotic indicators (e.g. fungal fruiting bodies, sporulation, mycelium, frass, webbing, or visible pests).

3. STRICT EVIDENCE SEPARATION:
   - You must cleanly separate diagnostic dimensions into:
     (a) "observedEvidence": Observable facts directly visible in the photo or explicitly stated by the grower.
     (b) "diagnosticInterpretation": Horticultural hypotheses and pathological explanations.
     (c) "unknownInformation": Critical factors that CANNOT be determined from a photo alone (e.g., subsurface root rot without unpotting, microscopic viruses, electrical conductivity/pH).

4. CONTEXT-AWARE FOLLOW-UP QUESTIONS:
   - Provide up to three (0 to 3) focused, high-yield diagnostic questions in "followUpQuestions" to help the grower differentiate between leading candidates (e.g., checking leaf undersides for webbing, feeling soil moisture at root depth).
   - DO NOT ask questions whose answers are already provided in the grower's context above.

5. NON-PLANT & DEFECTIVE PHOTOGRAPHS:
   - If the image contains NO recognizable living botanical specimen (e.g., human, animal, furniture, abstract object, or artificial item), set "isPlantRecognized": false, "status": "not_a_plant", "primaryClassification": "undetermined", and empty condition arrays.
   - If the image is severely blurred or underexposed so that leaf details cannot be evaluated, set "status": "inconclusive", and provide photographic advice in "imageQuality".

6. KNOWLEDGE-GROUNDED SAFE TREATMENT:
   - Draw treatment recommendations from verified cultural, physical, and biological methods.
   - NEVER invent chemical dosages, home-brewed bleach or ammonia recipes, universal 72-hour withholding periods, or cure guarantees.
   - Disclaim that treatments suppress symptoms and manage damage, but complete cure or reversal of dead necrotic tissue is not guaranteed.

7. OUTPUT FORMAT:
   Return a single valid JSON object strictly conforming to the following structure:
   {
     "status": "completed" | "inconclusive" | "not_a_plant",
     "primaryClassification": "biotic" | "abiotic" | "mixed" | "undetermined",
     "isPlantRecognized": boolean,
     "plantIdentification": string,
     "plantIdentificationConfidence": "high" | "medium" | "low" | "uncertain",
     "overallHealth": "healthy" | "mild_stress" | "moderate_issue" | "severe_issue" | "unknown",
     "imageQuality": {
       "isQualitySufficient": boolean,
       "qualityIssues": string[],
       "guidanceForBetterPhoto": string
     },
     "evidenceSeparation": {
       "observedEvidence": string[],
       "diagnosticInterpretation": string[],
       "unknownInformation": string[]
     },
     "visibleSymptoms": string[],
     "possibleConditions": [
       {
         "name": string,
         "kbConditionId": string,
         "category": "pest" | "disease" | "abiotic",
         "explanation": string,
         "confidenceCategory": "high" | "moderate" | "low" | "inconclusive",
         "supportingEvidence": string[],
         "contradictingEvidence": string[],
         "alternativeCauses": string[],
         "recommendedNextObservation": string
       }
     ],
     "followUpQuestions": [
       {
         "question": string,
         "targetConditionId": string,
         "rationale": string
       }
     ],
     "likelyCauses": string[],
     "recommendedChecks": string[],
     "immediateActions": string[],
     "longTermCare": string[],
     "prevention": string[],
     "uncertainties": string[],
     "requiresExpertReview": boolean,
     "disclaimer": "GrowAI AI Plant Doctor provides educational botanical guidance based on visible symptoms and grower context. It does not replace a certified agricultural pathology laboratory examination."
   }`;
}

/**
 * Execute real Gemini Multimodal Vision analysis using the official Google Gen AI SDK.
 */
export async function analyzePlantPhotoWithGemini(
  image: ValidatedImage,
  input: DiagnosisInput
): Promise<DiagnosisResponse> {
  const apiKey = process.env.AI_VISION_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('AI_VISION_API_KEY is not configured on this server.');
  }

  const modelName = getGeminiModelName();
  const ai = new GoogleGenAI({ apiKey });

  const promptText = buildAnalysisPrompt(input, image);
  const { base64Data, mimeType } = await optimizeImageForVision(image);

  let rawResponse: any;
  const maxRetries = 2;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let timerHandle: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timerHandle = setTimeout(() => {
        reject(new Error(`Gemini Vision analysis timed out after ${REQUEST_TIMEOUT_MS / 1000} seconds.`));
      }, REQUEST_TIMEOUT_MS);
    });

    try {
      const generatePromise = ai.models.generateContent({
        model: modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  data: base64Data,
                  mimeType,
                },
              },
              {
                text: promptText,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.15,
          maxOutputTokens: 2048,
        },
      });

      rawResponse = await Promise.race([generatePromise, timeoutPromise]);
      if (timerHandle) clearTimeout(timerHandle);
      break; // Success
    } catch (err: any) {
      if (timerHandle) clearTimeout(timerHandle);
      if (err.message?.includes('timed out')) {
        throw err;
      }
      const errMsg = err.message || String(err);

      // Check for transient 503 high demand spike
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand') ||
        errMsg.includes('temporarily');

      if (isTransient && attempt < maxRetries) {
        console.warn(`Gemini 503 high demand spike on attempt ${attempt + 1}, retrying in 2.5s...`);
        await new Promise((resolve) => setTimeout(resolve, 2500 * (attempt + 1)));
        continue;
      }

      if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('AI Vision provider quota exceeded. Please try again in a few moments or use heuristic mode.');
      }
      if (errMsg.includes('404') || errMsg.includes('not found')) {
        throw new Error(`Configured AI model "${modelName}" is currently unavailable on this API key.`);
      }
      if (isTransient) {
        throw new Error('Gemini Vision model is currently experiencing temporary high demand from Google. Please try again shortly or use Heuristic Mode.');
      }
      throw new Error(`AI Vision model error: ${errMsg}`);
    }
  }

  const responseText = rawResponse.text?.trim();
  if (!responseText) {
    throw new Error('Gemini Vision model returned an empty response.');
  }

  // Parse and validate with Zod runtime validator
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(responseText);
  } catch {
    // Attempt markdown block stripping if needed
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    try {
      parsedJson = JSON.parse(cleaned);
    } catch {
      throw new Error('Failed to parse structured JSON from AI Vision response.');
    }
  }

  const validationResult = AiDiagnosisResultSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    console.warn('Zod validation issues on Gemini output:', validationResult.error.format());
    const fallbackParsed = sanitizeAiResult(parsedJson, image);
    return mapAiResultToResponse(fallbackParsed, modelName, input, image);
  }

  // Ground and sanitize candidate IDs against the genuine Knowledge Base
  const validatedData = groundAndValidateCandidates(validationResult.data);
  return mapAiResultToResponse(validatedData, modelName, input, image);
}

/**
 * Verify candidate condition IDs against PLANT_HEALTH_KB to eliminate hallucinated IDs.
 * Attaches verified KB treatments and normalizes category values.
 */
export function groundAndValidateCandidates(data: AiDiagnosisResult): AiDiagnosisResult {
  const groundedConditions = data.possibleConditions.slice(0, 3).map((candidate) => {
    let kbCondition = candidate.kbConditionId ? getConditionById(candidate.kbConditionId) : undefined;

    // If ID was hallucinated or missing, attempt lookup by common name
    if (!kbCondition && candidate.name) {
      kbCondition = PLANT_HEALTH_KB.find(
        (c) => c.commonName.toLowerCase() === candidate.name.toLowerCase()
      );
    }

    if (kbCondition) {
      return {
        ...candidate,
        kbConditionId: kbCondition.id,
        category: kbCondition.category,
        name: candidate.name || kbCondition.commonName,
        groundedTreatment: {
          culturalCorrections: kbCondition.treatment.culturalControls,
          mechanicalPhysicalControls: kbCondition.treatment.physicalControls,
          biologicalOrLowRiskControls: kbCondition.treatment.biologicalControls,
          prohibitedPractices: kbCondition.treatment.prohibitedPractices,
          cureDisclaimer: kbCondition.treatment.cureGuaranteeDisclaimer,
        },
      };
    }

    // If condition has no match in KB, keep condition but omit invalid kbConditionId
    return {
      ...candidate,
      kbConditionId: undefined,
    };
  });

  return {
    ...data,
    possibleConditions: groundedConditions,
  };
}

/**
 * Sanitize and coerce partial AI outputs to ensure robust delivery
 */
export function sanitizeAiResult(raw: any, image?: ValidatedImage): AiDiagnosisResult {
  const primaryClassification = ['biotic', 'abiotic', 'mixed', 'undetermined'].includes(raw?.primaryClassification)
    ? raw.primaryClassification
    : 'undetermined';

  const rawConditions = Array.isArray(raw?.possibleConditions) ? raw.possibleConditions.slice(0, 3) : [];
  const sanitizedConditions: PossibleCondition[] = rawConditions.map((c: any) => {
    let kbCond = c.kbConditionId ? getConditionById(c.kbConditionId) : undefined;
    if (!kbCond && c.name) {
      kbCond = PLANT_HEALTH_KB.find((k) => k.commonName.toLowerCase() === String(c.name).toLowerCase());
    }

    return {
      name: c.name || (kbCond ? kbCond.commonName : 'Horticultural Stress Factor'),
      kbConditionId: kbCond ? kbCond.id : undefined,
      category: kbCond ? kbCond.category : (['pest', 'disease', 'abiotic'].includes(c.category) ? c.category : undefined),
      explanation: c.explanation || 'Visual evidence suggests an environmental or botanical stress.',
      confidenceCategory: ['high', 'moderate', 'low', 'inconclusive', 'uncertain'].includes(c.confidenceCategory)
        ? c.confidenceCategory
        : 'moderate',
      supportingEvidence: Array.isArray(c.supportingEvidence) ? c.supportingEvidence : [],
      contradictingEvidence: Array.isArray(c.contradictingEvidence) ? c.contradictingEvidence : [],
      alternativeCauses: Array.isArray(c.alternativeCauses) ? c.alternativeCauses : [],
      recommendedNextObservation: c.recommendedNextObservation || 'Examine leaf underside and substrate moisture depth',
      groundedTreatment: kbCond
        ? {
            culturalCorrections: kbCond.treatment.culturalControls,
            mechanicalPhysicalControls: kbCond.treatment.physicalControls,
            biologicalOrLowRiskControls: kbCond.treatment.biologicalControls,
            prohibitedPractices: kbCond.treatment.prohibitedPractices,
            cureDisclaimer: kbCond.treatment.cureGuaranteeDisclaimer,
          }
        : undefined,
    };
  });

  const rawFollowUps = Array.isArray(raw?.followUpQuestions) ? raw.followUpQuestions.slice(0, 3) : [];
  const followUpQuestions: FollowUpQuestion[] = rawFollowUps.map((q: any) => ({
    question: q.question || 'Is the discolored area spreading to adjacent leaves?',
    targetConditionId: q.targetConditionId || undefined,
    rationale: q.rationale || 'Distinguishes localized stress from systemic disease',
  }));

  return {
    status: ['completed', 'inconclusive', 'not_a_plant', 'service_unavailable'].includes(raw?.status)
      ? raw.status
      : 'completed',
    primaryClassification,
    isPlantRecognized: typeof raw?.isPlantRecognized === 'boolean' ? raw.isPlantRecognized : true,
    plantIdentification: raw?.plantIdentification || 'Botanical specimen',
    plantIdentificationConfidence: ['high', 'medium', 'low', 'uncertain'].includes(raw?.plantIdentificationConfidence)
      ? raw.plantIdentificationConfidence
      : 'uncertain',
    overallHealth: ['healthy', 'mild_stress', 'moderate_issue', 'severe_issue', 'unknown'].includes(raw?.overallHealth)
      ? raw.overallHealth
      : 'moderate_issue',
    imageQuality: raw?.imageQuality || image?.qualityAssessment || {
      isQualitySufficient: true,
      qualityIssues: [],
    },
    evidenceSeparation: raw?.evidenceSeparation || {
      observedEvidence: Array.isArray(raw?.visibleSymptoms) ? raw.visibleSymptoms : ['Visual foliage changes observed'],
      diagnosticInterpretation: sanitizedConditions.map((c) => c.explanation),
      unknownInformation: ['Subsurface root condition and exact mineral balance cannot be confirmed from photograph alone'],
    },
    visibleSymptoms: Array.isArray(raw?.visibleSymptoms) ? raw.visibleSymptoms : ['Foliage changes observed'],
    possibleConditions: sanitizedConditions,
    followUpQuestions,
    likelyCauses: Array.isArray(raw?.likelyCauses) ? raw.likelyCauses : ['Environmental or cultural condition'],
    recommendedChecks: Array.isArray(raw?.recommendedChecks) ? raw.recommendedChecks : ['Inspect soil moisture and root drainage'],
    immediateActions: Array.isArray(raw?.immediateActions) ? raw.immediateActions : ['Adjust watering and monitor plant response'],
    longTermCare: Array.isArray(raw?.longTermCare) ? raw.longTermCare : ['Maintain appropriate light and airflow'],
    prevention: Array.isArray(raw?.prevention) ? raw.prevention : ['Regular inspection and clean growing practices'],
    uncertainties: Array.isArray(raw?.uncertainties) ? raw.uncertainties : ['Subsurface root condition and exact mineral balance cannot be determined from photograph'],
    requiresExpertReview: typeof raw?.requiresExpertReview === 'boolean' ? raw.requiresExpertReview : false,
    disclaimer: raw?.disclaimer || 'GrowAI AI Plant Doctor provides educational botanical guidance based on visual observation.',
  };
}

/**
 * Format validated AI result into a complete client-ready response
 */
export function mapAiResultToResponse(
  aiResult: AiDiagnosisResult,
  modelName: string,
  input: DiagnosisInput,
  image?: ValidatedImage
): DiagnosisResponse {
  const id = `diag_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const analyzedAt = new Date().toISOString();

  let summary = '';
  if (aiResult.status === 'not_a_plant') {
    summary = 'No living plant specimen was recognized in the uploaded photograph. Please upload a clear photo of your plant.';
  } else if (aiResult.status === 'inconclusive') {
    summary = 'The photograph was inconclusive for a definitive diagnosis. Review photographic recommendations and physical checks below.';
  } else if (aiResult.possibleConditions.length > 0) {
    const primary = aiResult.possibleConditions[0];
    const classBadge = aiResult.primaryClassification !== 'undetermined' ? ` [${aiResult.primaryClassification}]` : '';
    summary = `Identified potential ${primary.name}${classBadge} (${primary.confidenceCategory} confidence) with ${aiResult.overallHealth.replace('_', ' ')}.`;
  } else {
    summary = `Plant identified as ${aiResult.plantIdentification} with ${aiResult.overallHealth.replace('_', ' ')}.`;
  }

  return {
    id,
    analyzedAt,
    status: aiResult.status,
    engine: 'gemini-vision',
    modelUsed: modelName,
    primaryClassification: aiResult.primaryClassification,
    isPlantRecognized: aiResult.isPlantRecognized,
    plantIdentification: aiResult.plantIdentification,
    plantIdentificationConfidence: aiResult.plantIdentificationConfidence,
    overallHealth: aiResult.overallHealth,
    imageQuality: aiResult.imageQuality || image?.qualityAssessment,
    evidenceSeparation: aiResult.evidenceSeparation,
    visibleSymptoms: aiResult.visibleSymptoms,
    possibleConditions: aiResult.possibleConditions,
    followUpQuestions: aiResult.followUpQuestions,
    likelyCauses: aiResult.likelyCauses,
    recommendedChecks: aiResult.recommendedChecks,
    immediateActions: aiResult.immediateActions,
    longTermCare: aiResult.longTermCare,
    prevention: aiResult.prevention,
    uncertainties: aiResult.uncertainties,
    requiresExpertReview: aiResult.requiresExpertReview,
    summary,
    disclaimer: aiResult.disclaimer,
    userContextProvided: {
      plantName: input.plantName,
      reportedSymptoms: input.symptoms,
      watering: input.wateringFrequency,
      sunlight: input.sunlight,
      environment: input.environment,
      temperature: input.temperature,
      soil: input.soilInfo,
    },
    hasPhoto: true,
    suggestedFollowUp: aiResult.requiresExpertReview
      ? 'If symptoms progress over the next 48–72 hours after applying low-risk corrective steps, consult your local agricultural extension service or certified plant nursery.'
      : 'Check soil moisture in 48 hours and observe if new growth emerges without symptoms.',
  };
}
