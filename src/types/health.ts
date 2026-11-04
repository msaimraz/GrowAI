/**
 * GrowAI Plant Health & Phytopathology Domain Types
 * Phase 8.2 — Disease, Pest & Abiotic Disorder Knowledge Base
 *
 * Provides strictly typed domain entities for urban plant pests,
 * fungal/bacterial/viral plant diseases, and abiotic cultural disorders.
 * Designed to ground future multimodal Gemini vision diagnostics and
 * power offline agronomic heuristic evaluations.
 */

export type ConditionCategory = 'pest' | 'disease' | 'abiotic';

export type PathogenType =
  | 'fungal'
  | 'bacterial'
  | 'viral'
  | 'oomycete'
  | 'nematode'
  | 'none';

export type PestType =
  | 'sap_sucking_insect'
  | 'chewing_insect'
  | 'boring_insect'
  | 'mite'
  | 'fly_larva'
  | 'none';

export type AbioticCategory =
  | 'macronutrient_deficiency'
  | 'micronutrient_deficiency'
  | 'moisture_stress'
  | 'temperature_stress'
  | 'light_stress'
  | 'salinity_osmotic'
  | 'physiological_disorder';

export type PlantPart =
  | 'leaves'
  | 'stems'
  | 'roots'
  | 'flowers'
  | 'fruit'
  | 'seedlings'
  | 'growing_tips'
  | 'crown'
  | 'calyx'
  | 'whole_plant';

export type ConditionSeverity = 'low' | 'moderate' | 'high' | 'critical';

export type VerificationStatus = 'verified' | 'partially-verified' | 'provisional';

export type EvidenceLevel =
  | 'extension_consensus'
  | 'peer_reviewed'
  | 'horticultural_standard'
  | 'observational';

export type EvidenceScope =
  | 'identification_symptoms'
  | 'host_relationships'
  | 'environmental_triggers'
  | 'prevention_cultural'
  | 'treatment_ipm'
  | 'edible_crop_safety';

export interface EvidenceSource {
  title: string;
  organization: string; // University extension, botanical institution, government agency
  url?: string;
  year?: number;
  evidenceLevel: EvidenceLevel;
  scopes?: EvidenceScope[];
}

export type HostRelationshipType =
  | 'confirmed_host'
  | 'susceptible_family'
  | 'rarely_affected'
  | 'resistant'
  | 'not_known_host'
  | 'unknown';

export interface HostRelationship {
  plantSlug: string; // Must match slug in PLANTS_DATA
  relationshipType: HostRelationshipType;
  notes?: string;
}

export interface SimilarCondition {
  conditionId: string;
  distinguishingFeature: string;
}

export interface IPMTreatmentPlan {
  culturalControls: string[];
  physicalControls: string[];
  biologicalControls: string[];
  registeredChemicalNotes?: string[];
  prohibitedPractices: string[]; // Dangerous folk recipes, improper chemical mixing to avoid
  preHarvestIntervalGuidance: string; // Crop withholding intervals tied to label requirements
  cureGuaranteeDisclaimer: string; // Explicit statement that treatments manage damage without guaranteed eradication
}

export interface EdibleCropRelevance {
  isFoodSafetyConcern: boolean;
  foodSafetyNotes?: string;
  harvestPrecaution: string;
}

export interface HumanPetSafety {
  isToxicToHumans: boolean;
  isToxicToPets: boolean;
  precautionaryAdvice: string;
  emergencyEscalationNote: string;
}

export interface EnvironmentalRiskFactors {
  favorableTemperatureC?: {
    min?: number;
    max?: number;
    optimal?: string;
  };
  favorableHumidity?: 'high_humidity' | 'low_humidity' | 'stagnant_air' | 'any';
  moistureConditions?: string;
  culturalTriggers: string[];
}

export interface BaseHealthCondition {
  id: string; // Unique, stable slug (e.g., 'pest-aphids', 'disease-early-blight')
  category: ConditionCategory;
  commonName: string;
  scientificName?: string;
  shortDescription: string;
  observableSymptoms: string[];
  affectedPlantParts: PlantPart[];
  possibleCauses: string[];
  environmentalRiskFactors: EnvironmentalRiskFactors;
  similarConditions: SimilarCondition[];
  preventionGuidance: string[];
  treatment: IPMTreatmentPlan;
  severity: ConditionSeverity;
  edibleCropRelevance: EdibleCropRelevance;
  humanPetSafety?: HumanPetSafety;
  confirmedHostSlugs: HostRelationship[];
  references: EvidenceSource[];
  verificationStatus: VerificationStatus;
  lastReviewed: string; // ISO Date YYYY-MM-DD
}

export interface PestCondition extends BaseHealthCondition {
  category: 'pest';
  pestType: PestType;
  visualIdentification: {
    sizeMm?: { min: number; max: number };
    colorDescription: string;
    morphology: string;
    lifeStagesVisible: string[];
  };
  damagePatterns: string[];
  favoredPlantGroups: string[];
}

export interface DiseaseCondition extends BaseHealthCondition {
  category: 'disease';
  pathogenType: PathogenType;
  transmissionVectors: string[];
  isolationGuidance: string;
  overwinteringMechanism?: string;
}

export interface AbioticCondition extends BaseHealthCondition {
  category: 'abiotic';
  abioticCategory: AbioticCategory;
  mobilityInPlant?: 'mobile' | 'immobile' | 'not_applicable';
  diagnosticKey: string; // Pathognomonic clue separating it from infectious pathogens
  correctiveMeasures: string[];
}

export type PlantHealthCondition =
  | PestCondition
  | DiseaseCondition
  | AbioticCondition;

/**
 * Filter and query helper options for Knowledge Base querying
 */
export interface HealthKbFilterOptions {
  category?: ConditionCategory;
  plantSlug?: string;
  affectedPart?: PlantPart;
  severity?: ConditionSeverity;
  verificationStatus?: VerificationStatus;
}
