export interface DiagnosisRequest {
  plantSlug?: string;
  plantName?: string;
  symptoms: string;
  environment?: string;
  wateringFrequency?: string;
  hasPhoto: boolean;
  photoUrl?: string;
}

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

export interface DiagnosisResponse {
  id: string;
  analyzedAt: string;
  status: 'completed' | 'uncertain';
  findings: DiagnosisFinding[];
  summary: string;
  disclaimer: string;
  isDemoMode: boolean;
  suggestedFollowUp?: string;
}
