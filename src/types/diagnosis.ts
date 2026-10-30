import { z } from 'zod';

/**
 * Zod Schema for Possible Plant Condition
 */
export const PossibleConditionSchema = z.object({
  name: z.string().describe('Botanical name or common name of the condition or stressor'),
  explanation: z.string().describe('Clear, educational explanation of what this condition is and how it affects the plant'),
  confidenceCategory: z.enum(['high', 'moderate', 'low', 'uncertain']).describe('Confidence level for this specific condition based on visible evidence'),
  supportingEvidence: z.array(z.string()).describe('Directly observable visual clues on leaves, stems, or soil that support this hypothesis'),
  alternativeCauses: z.array(z.string()).describe('Other potential reasons that produce similar visible symptoms'),
});

export type PossibleCondition = z.infer<typeof PossibleConditionSchema>;

/**
 * Zod Schema for Structured AI Diagnosis Response
 */
export const AiDiagnosisResultSchema = z.object({
  status: z.enum(['completed', 'inconclusive', 'not_a_plant', 'service_unavailable']),
  isPlantRecognized: z.boolean().describe('True if a botanical plant specimen is clearly identifiable in the image'),
  plantIdentification: z.string().describe('Identified plant species, genus, or common name, or note if unrecognized'),
  plantIdentificationConfidence: z.enum(['high', 'medium', 'low', 'uncertain']).describe('Confidence in species identification'),
  overallHealth: z.enum(['healthy', 'mild_stress', 'moderate_issue', 'severe_issue', 'unknown']).describe('Overall botanical vigor and health status'),
  visibleSymptoms: z.array(z.string()).describe('Observable leaf, stem, foliage, or growth abnormalities detected in the image'),
  possibleConditions: z.array(PossibleConditionSchema).describe('Potential diseases, pests, or physiological disorders ordered by likelihood'),
  likelyCauses: z.array(z.string()).describe('Underlying primary environmental, cultural, or biological triggers'),
  recommendedChecks: z.array(z.string()).describe('Hands-on diagnostic physical tests the grower should perform (e.g. soil depth check, leaf underside inspection)'),
  immediateActions: z.array(z.string()).describe('Low-risk, safe corrective steps to take immediately'),
  longTermCare: z.array(z.string()).describe('Ongoing cultural care adjustments (watering frequency, light, airflow)'),
  prevention: z.array(z.string()).describe('Proactive measures and sustainable practices to prevent recurrence'),
  uncertainties: z.array(z.string()).describe('Aspects that cannot be determined with certainty from the photograph alone'),
  requiresExpertReview: z.boolean().describe('True if the issue is severe, ambiguous, or requires certified agricultural extension testing'),
  disclaimer: z.string().describe('Botanical advisory disclaimer'),
});

export type AiDiagnosisResult = z.infer<typeof AiDiagnosisResultSchema>;

/**
 * Diagnosis Request Input
 */
export interface DiagnosisInput {
  plantSlug?: string;
  plantName?: string;
  symptoms: string;
  wateringFrequency?: string;
  sunlight?: string;
  temperature?: string;
  soilInfo?: string;
  environment?: string;
  isHeuristicFallback?: boolean;
}

/**
 * Complete Diagnosis API Response (Unified for AI and Heuristic)
 */
export interface DiagnosisResponse {
  id: string;
  analyzedAt: string;
  status: 'completed' | 'inconclusive' | 'not_a_plant' | 'service_unavailable';
  engine: 'gemini-vision' | 'agronomic-heuristic';
  modelUsed?: string;
  isPlantRecognized: boolean;
  plantIdentification: string;
  plantIdentificationConfidence: 'high' | 'medium' | 'low' | 'uncertain';
  overallHealth: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
  visibleSymptoms: string[];
  possibleConditions: PossibleCondition[];
  likelyCauses: string[];
  recommendedChecks: string[];
  immediateActions: string[];
  longTermCare: string[];
  prevention: string[];
  uncertainties: string[];
  requiresExpertReview: boolean;
  summary: string;
  disclaimer: string;
  userContextProvided: {
    plantName?: string;
    reportedSymptoms: string;
    watering?: string;
    sunlight?: string;
    environment?: string;
    temperature?: string;
    soil?: string;
  };
  hasPhoto: boolean;
  suggestedFollowUp?: string;
}

/**
 * Legacy interface compatibility for any existing component imports
 */
export interface DiagnosisFinding {
  issue: string;
  confidence: 'High' | 'Moderate' | 'Low' | 'Requires Lab Confirmation';
  probableCauses: string[];
  recommendedChecks: string[];
  immediateSteps: string[];
  preventiveMeasures: string[];
  organicTreatments: string[];
  chemicalWarnings?: string;
}

export interface DiagnosisRequest extends DiagnosisInput {
  hasPhoto: boolean;
  photoUrl?: string;
}
