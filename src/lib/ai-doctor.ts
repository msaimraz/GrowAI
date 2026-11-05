import { DiagnosisInput, DiagnosisResponse } from '@/types/diagnosis';
import { validateImageBuffer, ValidatedImage } from './ai-doctor/image-validator';
import { analyzePlantPhotoWithGemini, isGeminiConfigured, getGeminiModelName } from './ai-doctor/gemini';
import { diagnoseWithHeuristics } from './ai-doctor/heuristic';

export { isGeminiConfigured, getGeminiModelName };
export { validateImageBuffer };

export interface DiagnoseServiceOptions {
  input: DiagnosisInput;
  imageBuffer?: Buffer | null;
  forceHeuristic?: boolean;
}

/**
 * Main AI Plant Doctor Diagnosis Dispatcher
 *
 * Coordinates:
 * 1. Image binary validation & magic number verification
 * 2. Real Gemini Multimodal Vision analysis (gemini-3.8-flash)
 * 3. Graceful fallback to educational agronomic heuristics when AI is unconfigured or requested
 */
export async function diagnosePlantIssue(options: DiagnoseServiceOptions): Promise<DiagnosisResponse> {
  const { input, imageBuffer, forceHeuristic } = options;

  // 1. If explicit heuristic mode is requested or no photo is attached, use heuristic engine
  if (forceHeuristic || !imageBuffer) {
    return diagnoseWithHeuristics(input, Boolean(imageBuffer));
  }

  // 2. Validate image buffer (file signature, magic bytes, dimensions, size limits)
  const validatedImage = await validateImageBuffer(imageBuffer);

  // 3. Check if Gemini AI Vision credentials are valid
  if (!isGeminiConfigured()) {
    // If the key is missing, return a clear service-unavailable response or allow client to switch to heuristic
    const unavailableResponse: DiagnosisResponse = {
      id: `diag_unavail_${Date.now()}`,
      analyzedAt: new Date().toISOString(),
      status: 'service_unavailable',
      engine: 'gemini-vision',
      modelUsed: getGeminiModelName(),
      primaryClassification: 'undetermined',
      isPlantRecognized: false,
      plantIdentification: input.plantName || 'Unknown',
      plantIdentificationConfidence: 'uncertain',
      overallHealth: 'unknown',
      visibleSymptoms: input.symptoms ? [input.symptoms] : [],
      possibleConditions: [],
      likelyCauses: ['AI Vision Service is currently not configured or credentials are unset.'],
      recommendedChecks: ['You can run this diagnosis using GrowAI Heuristic Symptom Analysis mode.'],
      immediateActions: ['Switch to Heuristic Analysis to receive immediate rule-based agronomic guidance.'],
      longTermCare: [],
      prevention: [],
      uncertainties: ['Photographic computer vision requires configured AI_VISION_API_KEY.'],
      requiresExpertReview: false,
      summary: 'AI Vision service is temporarily unavailable. Use Heuristic Mode for instant symptom-based evaluation.',
      disclaimer: 'GrowAI AI Plant Doctor',
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
      suggestedFollowUp: 'Toggle Heuristic Analysis Mode in the interface to diagnose using agronomic rule matching.',
    };

    return unavailableResponse;
  }

  // 4. Execute Real Multimodal AI Vision Diagnosis with Gemini
  try {
    return await analyzePlantPhotoWithGemini(validatedImage, input);
  } catch (providerError: any) {
    const errorMsg = providerError.message || String(providerError);

    // If it is a provider outage, quota exhaustion, or timeout, provide structured service_unavailable response
    if (
      errorMsg.includes('quota') ||
      errorMsg.includes('high demand') ||
      errorMsg.includes('timed out') ||
      errorMsg.includes('unavailable') ||
      errorMsg.includes('503') ||
      errorMsg.includes('429')
    ) {
      console.warn('AI Vision provider transient issue, returning structured service_unavailable response:', errorMsg);
      return {
        id: `diag_unavail_${Date.now()}`,
        analyzedAt: new Date().toISOString(),
        status: 'service_unavailable',
        engine: 'gemini-vision',
        modelUsed: getGeminiModelName(),
        primaryClassification: 'undetermined',
        isPlantRecognized: false,
        plantIdentification: input.plantName || 'Unknown Specimen',
        plantIdentificationConfidence: 'uncertain',
        overallHealth: 'unknown',
        visibleSymptoms: input.symptoms ? [input.symptoms] : [],
        possibleConditions: [],
        likelyCauses: [errorMsg],
        recommendedChecks: ['Switch to Heuristic Mode for instantaneous agronomic rule matching.'],
        immediateActions: ['Use the toggle above to switch to Heuristic Rulebase.'],
        longTermCare: [],
        prevention: [],
        uncertainties: [errorMsg],
        requiresExpertReview: false,
        summary: `The Gemini Vision service is temporarily unavailable (${errorMsg}). Heuristic rulebase diagnosis is available immediately.`,
        disclaimer: 'GrowAI AI Plant Doctor provides educational botanical guidance based on observable visual symptoms and grower context.',
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
        suggestedFollowUp: 'Toggle Heuristic Analysis Mode in the interface to diagnose using agronomic rule matching.',
      };
    }

    throw providerError;
  }
}
