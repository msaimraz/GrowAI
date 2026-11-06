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
    console.warn('AI Vision API key is not configured, using deterministic botanical fallback.');
    const fallback = await diagnoseWithHeuristics(input, Boolean(imageBuffer));
    return {
      ...fallback,
      engine: 'agronomic-heuristic',
      modelUsed: 'heuristic-fallback',
      summary: `🌿 Plant Check is temporarily using offline guidance. Here's what we can tell from the available evidence: ${fallback.summary}`,
    };
  }

  // 4. Execute Real Multimodal AI Vision Diagnosis with Gemini
  try {
    return await analyzePlantPhotoWithGemini(validatedImage, input);
  } catch (providerError: any) {
    const errorMsg = providerError.message || String(providerError);

    // If it is a provider outage, quota exhaustion, network issue, or timeout, provide graceful deterministic fallback
    console.warn('AI Vision provider transient issue, using deterministic botanical fallback:', errorMsg);
    const fallback = await diagnoseWithHeuristics(input, Boolean(imageBuffer));
    return {
      ...fallback,
      engine: 'agronomic-heuristic',
      modelUsed: 'heuristic-fallback',
      summary: `🌿 Plant Check is temporarily using offline guidance. Here's what we can tell from the available evidence: ${fallback.summary}`,
    };
  }
}
