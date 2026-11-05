import { z } from 'zod';

/**
 * Broad Pathological / Physiological Classification
 */
export type PrimaryClassification = 'biotic' | 'abiotic' | 'mixed' | 'undetermined';

export const PrimaryClassificationSchema = z.enum(['biotic', 'abiotic', 'mixed', 'undetermined']);

/**
 * Qualitative Confidence Categories (No fabricated numerical percentages)
 */
export type DiagnosticConfidence = 'high' | 'moderate' | 'low' | 'inconclusive' | 'uncertain';

export const DiagnosticConfidenceSchema = z.enum(['high', 'moderate', 'low', 'inconclusive', 'uncertain']);

/**
 * Image Quality Assessment
 */
export interface ImageQualityAssessment {
  isQualitySufficient: boolean;
  qualityIssues: Array<
    | 'severe_blur'
    | 'underexposure'
    | 'overexposure'
    | 'subject_too_small'
    | 'plant_not_clearly_visible'
    | 'missing_close_up_detail'
  >;
  guidanceForBetterPhoto?: string;
}

export const ImageQualityAssessmentSchema = z.object({
  isQualitySufficient: z.boolean().describe('True if photograph provides sufficient detail for visual assessment'),
  qualityIssues: z.array(
    z.enum([
      'severe_blur',
      'underexposure',
      'overexposure',
      'subject_too_small',
      'plant_not_clearly_visible',
      'missing_close_up_detail',
    ])
  ).describe('Identified photographic clarity issues'),
  guidanceForBetterPhoto: z.string().optional().describe('Constructive advice on how to capture a clearer diagnostic image'),
});

/**
 * Evidence Separation: strictly distinguishes observed facts from hypotheses and unknowns
 */
export interface DiagnosticEvidenceSeparation {
  observedEvidence: string[]; // Visible in photograph or explicitly stated by user
  diagnosticInterpretation: string[]; // Botanical/agronomic hypotheses
  unknownInformation: string[]; // Hidden factors (soil pH, root health, microscopic pathogens)
}

export const DiagnosticEvidenceSeparationSchema = z.object({
  observedEvidence: z.array(z.string()).describe('Directly observable facts visible in the image or stated by grower'),
  diagnosticInterpretation: z.array(z.string()).describe('Pathological or physiological interpretations and hypotheses'),
  unknownInformation: z.array(z.string()).describe('Factors that cannot be confirmed from image or context alone'),
});

/**
 * Context-Aware Follow-Up Question
 */
export interface FollowUpQuestion {
  question: string;
  targetConditionId?: string;
  rationale: string;
}

export const FollowUpQuestionSchema = z.object({
  question: z.string().describe('Targeted follow-up question to help narrow differential candidates'),
  targetConditionId: z.string().optional().describe('Knowledge base condition ID this question helps confirm or rule out'),
  rationale: z.string().describe('Why this question is relevant to the leading differential diagnoses'),
});

/**
 * Knowledge-Grounded Treatment Summary
 */
export interface GroundedTreatmentSummary {
  culturalCorrections: string[];
  mechanicalPhysicalControls: string[];
  biologicalOrLowRiskControls: string[];
  prohibitedPractices: string[];
  cureDisclaimer: string;
}

export const GroundedTreatmentSummarySchema = z.object({
  culturalCorrections: z.array(z.string()).describe('Non-chemical cultural adjustments (watering, airflow, light)'),
  mechanicalPhysicalControls: z.array(z.string()).describe('Physical interventions (pruning, washing, yellow traps)'),
  biologicalOrLowRiskControls: z.array(z.string()).describe('Biological agents or low-risk controls per KB'),
  prohibitedPractices: z.array(z.string()).describe('Hazardous folk mixtures or improper chemical practices to avoid'),
  cureDisclaimer: z.string().describe('Clear statement that treatments manage symptoms without guaranteed eradication'),
});

/**
 * Zod Schema for Possible Plant Condition (Candidate Hypothesis)
 */
export const PossibleConditionSchema = z.object({
  name: z.string().describe('Botanical name or common name of the condition or stressor'),
  kbConditionId: z.string().optional().describe('Matching condition ID in the GrowAI knowledge base if applicable'),
  category: z.enum(['pest', 'disease', 'abiotic']).optional().describe('Broad category of this condition'),
  explanation: z.string().describe('Clear, educational explanation of what this condition is and how it affects the plant'),
  confidenceCategory: DiagnosticConfidenceSchema.describe('Qualitative confidence level based on visible evidence'),
  supportingEvidence: z.array(z.string()).describe('Directly observable visual clues on leaves, stems, or soil that support this hypothesis'),
  contradictingEvidence: z.array(z.string()).optional().describe('Visible signs, missing typical symptoms, or context that argue against this condition'),
  alternativeCauses: z.array(z.string()).describe('Other potential reasons that produce similar visible symptoms'),
  recommendedNextObservation: z.string().optional().describe('Specific detail to check physically to confirm or rule out this condition'),
  groundedTreatment: GroundedTreatmentSummarySchema.optional().describe('Knowledge-grounded treatment summary drawn from verified KB plan'),
});

export type PossibleCondition = z.infer<typeof PossibleConditionSchema>;

/**
 * Zod Schema for Structured AI Diagnosis Response
 */
export const AiDiagnosisResultSchema = z.object({
  status: z.enum(['completed', 'inconclusive', 'not_a_plant', 'service_unavailable']),
  primaryClassification: PrimaryClassificationSchema.default('undetermined').describe('Broad classification: biotic, abiotic, mixed, or undetermined'),
  isPlantRecognized: z.boolean().describe('True if a botanical plant specimen is clearly identifiable in the image'),
  plantIdentification: z.string().describe('Identified plant species, genus, or common name, or note if unrecognized'),
  plantIdentificationConfidence: z.enum(['high', 'medium', 'low', 'uncertain']).describe('Confidence in species identification'),
  overallHealth: z.enum(['healthy', 'mild_stress', 'moderate_issue', 'severe_issue', 'unknown']).describe('Overall botanical vigor and health status'),
  imageQuality: ImageQualityAssessmentSchema.optional().describe('Assessment of photographic clarity, blur, and lighting'),
  evidenceSeparation: DiagnosticEvidenceSeparationSchema.optional().describe('Structured separation of observed facts vs interpretations vs unknowns'),
  visibleSymptoms: z.array(z.string()).describe('Observable leaf, stem, foliage, or growth abnormalities detected in the image'),
  possibleConditions: z.array(PossibleConditionSchema).max(3).describe('Up to three differential candidates ordered by plausibility'),
  followUpQuestions: z.array(FollowUpQuestionSchema).max(3).optional().describe('Up to three focused follow-up questions to distinguish candidates'),
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
  primaryClassification?: PrimaryClassification;
  isPlantRecognized: boolean;
  plantIdentification: string;
  plantIdentificationConfidence: 'high' | 'medium' | 'low' | 'uncertain';
  overallHealth: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
  imageQuality?: ImageQualityAssessment;
  evidenceSeparation?: DiagnosticEvidenceSeparation;
  visibleSymptoms: string[];
  possibleConditions: PossibleCondition[];
  followUpQuestions?: FollowUpQuestion[];
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


/**
 * ==============================================================================
 * Phase 8.4: Diagnosis History & Treatment Tracking Domain Types
 * ==============================================================================
 */

export type TreatmentActionType =
  | 'inspect_plant'
  | 'isolate_plant'
  | 'adjust_watering'
  | 'improve_ventilation'
  | 'remove_affected_leaves'
  | 'monitor_pests'
  | 'apply_kb_treatment'
  | 'custom_action';

export const TreatmentActionTypeSchema = z.enum([
  'inspect_plant',
  'isolate_plant',
  'adjust_watering',
  'improve_ventilation',
  'remove_affected_leaves',
  'monitor_pests',
  'apply_kb_treatment',
  'custom_action',
]);

export type TreatmentStatus = 'planned' | 'started' | 'completed' | 'skipped';

export const TreatmentStatusSchema = z.enum(['planned', 'started', 'completed', 'skipped']);

export type FollowUpOutcome = 'improving' | 'unchanged' | 'worsening' | 'resolved' | 'uncertain';

export const FollowUpOutcomeSchema = z.enum(['improving', 'unchanged', 'worsening', 'resolved', 'uncertain']);

/**
 * ==============================================================================
 * Phase 8.5: Plant Health Monitoring & Derived Health Status
 * ==============================================================================
 */

export type PlantHealthStatus =
  | 'healthy'
  | 'monitoring'
  | 'needs_attention'
  | 'improving'
  | 'resolved'
  | 'unknown';

export const PlantHealthStatusSchema = z.enum([
  'healthy',
  'monitoring',
  'needs_attention',
  'improving',
  'resolved',
  'unknown',
]);

export interface PlantHealthSummary {
  status: PlantHealthStatus;
  statusLabel: string;
  lastCheckedDate: string | null;
  activeIssue: string | null;
  latestFollowUpOutcome: FollowUpOutcome | null;
  pendingTreatmentsCount: number;
  totalDiagnosesCount: number;
  unresolvedCount: number;
  isFollowUpDue: boolean;
  nextActionGuidance: string;
  latestDiagnosisId: string | null;
}

export interface GardenHealthOverview {
  totalPlants: number;
  assessedPlants: number;
  needsAttentionCount: number;
  monitoringCount: number;
  improvingCount: number;
  resolvedCount: number;
  healthyCount: number;
  unknownCount: number;
  followUpsDueCount: number;
  pendingTreatmentsCount: number;
}

export interface SavedDiagnosisCandidate {
  id: string;
  diagnosisId: string;
  userId: string;
  candidateRank: number;
  kbConditionId?: string | null;
  conditionName: string;
  category?: 'pest' | 'disease' | 'abiotic' | null;
  explanation: string;
  confidenceCategory: DiagnosticConfidence;
  supportingEvidence: string[];
  contradictingEvidence?: string[];
  alternativeCauses: string[];
  recommendedNextObservation?: string | null;
  groundedTreatment?: GroundedTreatmentSummary | null;
  createdAt: string;
}

export interface SavedDiagnosisTreatment {
  id: string;
  diagnosisId: string;
  userId: string;
  userPlantId?: string | null;
  actionType: TreatmentActionType;
  actionTitle: string;
  status: TreatmentStatus;
  notes?: string | null;
  actionDate: string;
  completedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDiagnosisFollowUp {
  id: string;
  diagnosisId: string;
  userId: string;
  outcomeStatus: FollowUpOutcome;
  observationNotes?: string | null;
  followUpDate: string;
  plantPhotoId?: string | null;
  photoUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedDiagnosisRecord {
  id: string;
  userId: string;
  userPlantId?: string | null;
  plantPhotoId?: string | null;
  schemaVersion: string;
  diagnosticSource: 'gemini-vision' | 'agronomic-heuristic' | 'fallback';
  modelUsed?: string | null;
  status: 'completed' | 'inconclusive' | 'not_a_plant' | 'service_unavailable';
  primaryClassification?: PrimaryClassification;
  isPlantRecognized: boolean;
  plantIdentification: string;
  plantIdentificationConfidence: 'high' | 'medium' | 'low' | 'uncertain';
  plantSlug?: string | null;
  overallHealth: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
  imageQuality?: ImageQualityAssessment | null;
  evidenceSeparation?: DiagnosticEvidenceSeparation | null;
  symptoms: string;
  userContext: {
    watering?: string;
    sunlight?: string;
    environment?: string;
    temperature?: string;
    soil?: string;
    plantName?: string;
  };
  visibleSymptoms: string[];
  likelyCauses: string[];
  recommendedChecks: string[];
  immediateActions: string[];
  longTermCare: string[];
  prevention: string[];
  uncertainties: string[];
  followUpQuestions?: FollowUpQuestion[];
  requiresExpertReview: boolean;
  summary: string;
  disclaimer: string;
  suggestedFollowUp?: string | null;
  diagnosedAt: string;
  createdAt: string;
  updatedAt: string;
  candidates?: SavedDiagnosisCandidate[];
  treatments?: SavedDiagnosisTreatment[];
  followUps?: SavedDiagnosisFollowUp[];
}

export interface CreateDiagnosisPayload {
  userPlantId?: string | null;
  plantPhotoId?: string | null;
  diagnosis: DiagnosisResponse;
}

export interface CreateTreatmentInput {
  diagnosisId: string;
  userPlantId?: string | null;
  actionType: TreatmentActionType;
  actionTitle: string;
  status?: TreatmentStatus;
  notes?: string | null;
  actionDate?: string;
}

export interface CreateFollowUpInput {
  diagnosisId: string;
  outcomeStatus: FollowUpOutcome;
  observationNotes?: string | null;
  followUpDate?: string;
  plantPhotoId?: string | null;
}
