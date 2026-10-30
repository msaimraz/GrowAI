import { GoogleGenAI } from '@google/genai';
import {
  AiDiagnosisResult,
  AiDiagnosisResultSchema,
  DiagnosisInput,
  DiagnosisResponse,
} from '@/types/diagnosis';
import { ValidatedImage, optimizeImageForVision } from './image-validator';

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
 * Build structured agronomic evaluation prompt for Gemini Multimodal Vision.
 */
function buildAnalysisPrompt(input: DiagnosisInput): string {
  const contextParts: string[] = [];

  if (input.plantName) {
    contextParts.push(`- Grower-Stated Species: "${input.plantName}"`);
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

  return `You are a certified senior horticultural pathologist and agronomic specialist for GrowAI, an urban home gardening and vertical farming platform.

Analyze the uploaded photograph alongside the grower-reported context to provide an evidence-based, scientifically rigorous, and safe plant health evaluation.

${contextBlock}

EVALUATION METHODOLOGY AND STRICT RULES:
1. SPECIMEN RECOGNITION:
   - Carefully determine if the image depicts a living botanical plant specimen (or plant parts: leaf, stem, fruit, flower, seedlings).
   - If the photograph contains NO recognizable plant (e.g. animal, human, vehicle, household furniture, abstract object, or non-plant item), set "isPlantRecognized": false, "status": "not_a_plant", "plantIdentification": "No recognizable plant detected in photograph", "overallHealth": "unknown", and empty symptom/condition arrays. Explain clearly what is visible instead. DO NOT invent or fabricate plant pathology.
   - If the image is excessively blurry, out of focus, or taken from too far away to observe leaf or stem texture, set "status": "inconclusive", "overallHealth": "unknown", explain the photographic limitations in "uncertainties", and provide only recommended checks to obtain a clear photograph. Do NOT force a disease diagnosis.

2. EVIDENCE DISTINCTION:
   - Distinguish strictly between:
     (a) Directly visible visual evidence (e.g., interveinal chlorosis, necrotic marginal spotting, powdery fungal mycelium, stippling, honeydew, drooping petioles).
     (b) Underlying possible causes (e.g., overwatering, poor drainage, nitrogen lockout, spider mites).
     (c) Grower-supplied context (clearly acknowledge what was stated by user).
     (d) Undetermined parameters (explicitly state what CANNOT be diagnosed from a photograph alone, such as root rot without unpotting, microscopic viruses, or soil pH).

3. NO FABRICATED NUMERICAL ACCURACY:
   - Never use arbitrary percentage figures (e.g., "94.2% accuracy"). Use qualitative confidence categories: "high", "moderate", "low", "uncertain".

4. SAFE, LOW-RISK ACTIONABLE GUIDANCE:
   - Prioritize safe cultural practices: moisture depth testing with wooden dowel, adjusting watering intervals, ensuring drainage hole clearance, optimizing sunlight/vertical shelf placement, improving microclimate airflow, and gentle mechanical sanitation (isolating infected plants, pruning severely dead leaves).
   - Never recommend hazardous chemical mixtures, bleach, unverified toxic folk recipes, or indiscriminate synthetic systemic pesticides.
   - Never claim that a plant is definitively "cured".
   - If the issue is severe, ambiguous, or threatens surrounding plants, set "requiresExpertReview": true and advise consulting a regional university agricultural extension service or certified plant nursery specialist.

5. OUTPUT FORMAT:
   Return a single valid JSON object strictly conforming to the following structure:
   {
     "status": "completed" | "inconclusive" | "not_a_plant",
     "isPlantRecognized": boolean,
     "plantIdentification": string,
     "plantIdentificationConfidence": "high" | "medium" | "low" | "uncertain",
     "overallHealth": "healthy" | "mild_stress" | "moderate_issue" | "severe_issue" | "unknown",
     "visibleSymptoms": [string],
     "possibleConditions": [
       {
         "name": string,
         "explanation": string,
         "confidenceCategory": "high" | "moderate" | "low" | "uncertain",
         "supportingEvidence": [string],
         "alternativeCauses": [string]
       }
     ],
     "likelyCauses": [string],
     "recommendedChecks": [string],
     "immediateActions": [string],
     "longTermCare": [string],
     "prevention": [string],
     "uncertainties": [string],
     "requiresExpertReview": boolean,
     "disclaimer": "GrowAI AI Plant Doctor provides educational botanical guidance based on observable visual symptoms and grower context. It does not replace a certified agricultural pathology laboratory examination."
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

  const promptText = buildAnalysisPrompt(input);
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
  } catch (parseErr) {
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
    // Fill in required fallbacks rather than failing completely if minor fields were missing
    const fallbackParsed = sanitizeAiResult(parsedJson);
    return mapAiResultToResponse(fallbackParsed, modelName, input);
  }

  return mapAiResultToResponse(validationResult.data, modelName, input);
}

/**
 * Sanitize and coerce partial AI outputs to ensure robust delivery
 */
function sanitizeAiResult(raw: any): AiDiagnosisResult {
  return {
    status: ['completed', 'inconclusive', 'not_a_plant', 'service_unavailable'].includes(raw.status)
      ? raw.status
      : 'completed',
    isPlantRecognized: typeof raw.isPlantRecognized === 'boolean' ? raw.isPlantRecognized : true,
    plantIdentification: raw.plantIdentification || 'Botanical specimen',
    plantIdentificationConfidence: ['high', 'medium', 'low', 'uncertain'].includes(raw.plantIdentificationConfidence)
      ? raw.plantIdentificationConfidence
      : 'uncertain',
    overallHealth: ['healthy', 'mild_stress', 'moderate_issue', 'severe_issue', 'unknown'].includes(raw.overallHealth)
      ? raw.overallHealth
      : 'moderate_issue',
    visibleSymptoms: Array.isArray(raw.visibleSymptoms) ? raw.visibleSymptoms : ['Foliage changes observed'],
    possibleConditions: Array.isArray(raw.possibleConditions)
      ? raw.possibleConditions.map((c: any) => ({
          name: c.name || 'Horticultural Stress Factor',
          explanation: c.explanation || 'Visual evidence suggests an environmental or botanical stress.',
          confidenceCategory: ['high', 'moderate', 'low', 'uncertain'].includes(c.confidenceCategory)
            ? c.confidenceCategory
            : 'moderate',
          supportingEvidence: Array.isArray(c.supportingEvidence) ? c.supportingEvidence : [],
          alternativeCauses: Array.isArray(c.alternativeCauses) ? c.alternativeCauses : [],
        }))
      : [],
    likelyCauses: Array.isArray(raw.likelyCauses) ? raw.likelyCauses : ['Environmental or cultural condition'],
    recommendedChecks: Array.isArray(raw.recommendedChecks) ? raw.recommendedChecks : ['Inspect soil moisture and root drainage'],
    immediateActions: Array.isArray(raw.immediateActions) ? raw.immediateActions : ['Adjust watering and monitor plant response'],
    longTermCare: Array.isArray(raw.longTermCare) ? raw.longTermCare : ['Maintain appropriate light and airflow'],
    prevention: Array.isArray(raw.prevention) ? raw.prevention : ['Regular inspection and clean growing practices'],
    uncertainties: Array.isArray(raw.uncertainties) ? raw.uncertainties : ['Subsurface root condition and exact mineral balance cannot be determined from photograph'],
    requiresExpertReview: typeof raw.requiresExpertReview === 'boolean' ? raw.requiresExpertReview : false,
    disclaimer: raw.disclaimer || 'GrowAI AI Plant Doctor provides educational botanical guidance based on visual observation.',
  };
}

/**
 * Format validated AI result into a complete client-ready response
 */
function mapAiResultToResponse(
  aiResult: AiDiagnosisResult,
  modelName: string,
  input: DiagnosisInput
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
    summary = `Identified potential ${primary.name} (${primary.confidenceCategory} confidence) with ${aiResult.overallHealth.replace('_', ' ')}.`;
  } else {
    summary = `Plant identified as ${aiResult.plantIdentification} with ${aiResult.overallHealth.replace('_', ' ')}.`;
  }

  return {
    id,
    analyzedAt,
    status: aiResult.status,
    engine: 'gemini-vision',
    modelUsed: modelName,
    isPlantRecognized: aiResult.isPlantRecognized,
    plantIdentification: aiResult.plantIdentification,
    plantIdentificationConfidence: aiResult.plantIdentificationConfidence,
    overallHealth: aiResult.overallHealth,
    visibleSymptoms: aiResult.visibleSymptoms,
    possibleConditions: aiResult.possibleConditions,
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
