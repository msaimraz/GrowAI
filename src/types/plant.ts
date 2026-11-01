export type PlantCategory =
  | 'vegetables-fruits'
  | 'herbs-greens'
  | 'indoor-decorative'
  | 'flowering'
  | 'medicinal-aromatic'
  | 'microgreens';

export type GrowingEnvironment =
  | 'indoor'
  | 'balcony'
  | 'patio'
  | 'greenhouse'
  | 'vertical-rack';

export type SunlightRequirement =
  | 'full-sun'
  | 'partial-sun'
  | 'bright-indirect'
  | 'low-light';

export type MoistureLevel = 'low' | 'moderate' | 'high';

export type VerticalSuitabilityRating =
  | 'ideal'
  | 'moderate'
  | 'challenging'
  | 'unsuitable';

export type VerticalTier = 'top' | 'middle' | 'bottom' | 'any';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type DataReviewStatus =
  | 'verified'
  | 'peer-reviewed'
  | 'community-draft';

export interface PlantProblem {
  issue: string;
  symptoms: string;
  prevention: string;
  organicRemedy: string;
}

export interface PlantTimelines {
  germinationDays: { min: number; max: number };
  seedlingDays: { min: number; max: number };
  harvestDays?: { min: number; max: number };
  floweringDays?: { min: number; max: number };
  maturityDays: { min: number; max: number };
  timelineNotes?: string;
}

export interface VerticalSuitability {
  isSuitable: boolean;
  rating: VerticalSuitabilityRating;
  recommendedTier: VerticalTier;
  notes: string;
}

export interface Difficulty {
  level: DifficultyLevel;
  score: number; // 1 (easiest) to 5 (most demanding)
  methodologyNotes: string;
}

export interface Plant {
  id: string;
  slug: string;
  commonName: string;
  scientificName: string;
  category: PlantCategory;
  summary: string;
  environments: GrowingEnvironment[];
  temperatureRange: {
    min: number;
    max: number;
    unit: 'C';
    idealRange?: string;
  };
  sunlight: SunlightRequirement;
  sunlightHours: string;
  watering: {
    frequency: string;
    guidance: string;
    moistureLevel: MoistureLevel;
  };
  soil: {
    type: string;
    drainage: string;
    recommendedMix?: string;
  };
  potting: {
    minDepthCm: number;
    spacingCm: number;
    recommendedPotSize: string;
  };
  humidity?: {
    min: number;
    max: number;
    note?: string;
  };
  ph?: {
    min: number;
    max: number;
    note?: string;
  };
  timelines: PlantTimelines;
  verticalSuitability: VerticalSuitability;
  difficulty: Difficulty;
  commonProblems: PlantProblem[];
  practicalUses: string[];
  safetyNotes?: string;
  sourceUrls: string[];
  dataReviewStatus: DataReviewStatus;
  featured?: boolean;
  badge?: string;
  medicinalProfile?: MedicinalProfile;
}

export type ScientificEvidenceLevel =
  | 'traditional-use'
  | 'preliminary-research'
  | 'clinical-evidence'
  | 'insufficient-evidence';

export interface ActiveCompound {
  name: string;
  chemicalClass?: string;
  description: string;
  primaryLocation?: string;
  studiedProperties?: string[];
}

export interface HerbalPreparation {
  type: string;
  partUsed: string;
  traditionalRole: string;
  activeCompounds: string[];
  evidenceLevel: ScientificEvidenceLevel;
  safetyConsiderations?: string;
}

export interface PlantReference {
  title: string;
  authorOrOrg: string;
  year?: number | string;
  publication?: string;
  url?: string;
  doi?: string;
}

export interface FoodSafetyGuidance {
  hasMicrobialRisk: boolean;
  pathogenConcerns?: string[];
  washingAdvisory?: string;
  cookingRecommendation?: string;
  vulnerablePopulationsAdvisory?: string;
}

export interface MedicinalProfile {
  suitabilityForConsumption: {
    isEdible: boolean;
    edibilityCategory: 'edible' | 'edible-with-preparation' | 'toxic-inedible' | 'strictly-ornamental';
    edibilityNotes: string;
  };
  medicinalValueSummary: string;
  traditionalMedicineRole: string;
  biologicalProperties: string[];
  overallEvidenceLevel: ScientificEvidenceLevel;
  activeCompounds: ActiveCompound[];
  herbalPreparations: HerbalPreparation[];
  safetyAndToxicity: {
    toxicityLevel: 'non-toxic' | 'mildly-toxic-if-ingested' | 'toxic-calcium-oxalate' | 'toxic-saponins' | 'contains-anti-nutrients';
    toxicParts?: string;
    symptoms?: string;
    contraindications?: string[];
    medicationInteractions?: string[];
    generalPrecautions: string;
  };
  foodSafety?: FoodSafetyGuidance;
  references: PlantReference[];
}

export interface CategoryMetadata {
  id: PlantCategory;
  label: string;
  description: string;
  iconName: string;
  plantCount?: number;
}
