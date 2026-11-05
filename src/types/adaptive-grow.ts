/**
 * GrowAI Phase 11: Adaptive Grow Intelligence & Action System Domain Types
 * Strongly typed models for garden state synthesis, action prioritization,
 * daily grow checks, next-best-action, data quality assessment, and grounded natural language queries.
 *
 * Core Principles:
 * - Distinguish: recorded, calculated, observed, inferred, recommended, unknown.
 * - Never convert unknown -> assumed, inferred -> recorded, calendar age -> maturity, or historical yield -> guaranteed yield.
 * - Every recommendation has an explicit evidence basis.
 * - Safety: "critical" priority means prompt grower attention required based on available recorded evidence,
 *   never medical or scientific fatality certainty.
 */

import { UserPlant } from './garden';
import { SavedDiagnosisRecord } from './diagnosis';
import {
  GrowingConditionObservation,
  FeedingRecord,
  PropagationEvent,
  ProductionCycle,
  HarvestRecord,
  ProductionSpaceMetrics,
} from './grow-intelligence';
import { Reminder } from './reminder';
import { SpaceConfigProfile } from './space-optimizer';

// ==============================================================================
// 1. GARDEN STATE MODEL
// ==============================================================================

export interface GardenStatePlants {
  total: number;
  active: number;
  needsAttention: number;
  monitoring: number;
  improving: number;
  healthy: number;
  unknown: number;
}

export interface GardenStateCare {
  overdue: number;
  dueToday: number;
  upcoming: number;
}

export interface GardenStateHealth {
  activeConcerns: number;
  unresolvedFollowUps: number;
  recentAssessments: number;
}

export interface GardenStateEnvironment {
  recordedParameters: number;
  unknownParameters: number;
  concerns: number;
}

export interface GardenStateFeeding {
  recentApplications: number;
  incompleteRecords: number;
}

export interface GardenStateProduction {
  activeCycles: number;
  upcomingHarvests: number;
  harvestRecords: number;
}

export interface GardenStateGrowth {
  plantsWithoutRecentObservation: number;
  recentObservations: number;
}

export interface GardenStatePropagation {
  activePropagationEvents: number;
}

export interface GardenStateDataQuality {
  completenessScore: number;
  missingCriticalData: string[];
}

export interface GardenState {
  generatedAt: string;
  plants: GardenStatePlants;
  care: GardenStateCare;
  health: GardenStateHealth;
  environment: GardenStateEnvironment;
  feeding: GardenStateFeeding;
  production: GardenStateProduction;
  growth: GardenStateGrowth;
  propagation: GardenStatePropagation;
  dataQuality: GardenStateDataQuality;
}

// ==============================================================================
// 2. ACTION PRIORITIZATION MODEL
// ==============================================================================

export type ActionCategory =
  | 'health'
  | 'care'
  | 'environment'
  | 'growth'
  | 'feeding'
  | 'production'
  | 'propagation'
  | 'space'
  | 'data_quality';

export type ActionPriority =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'informational';

export interface ActionEvidence {
  source: 'recorded' | 'calculated' | 'observed' | 'inferred';
  sourceId?: string;
  description: string;
}

export interface GrowAction {
  id: string;
  category: ActionCategory;
  priority: ActionPriority;
  title: string;
  explanation: string;
  plantId?: string;
  plantName?: string;
  evidence: ActionEvidence[];
  recommendedAction: string;
  route?: string;
  confidence: 'high' | 'moderate' | 'low' | 'unknown';
}

// ==============================================================================
// 3. DAILY GROW CHECK & NEXT BEST ACTION
// ==============================================================================

export interface DailyGrowCheck {
  date: string;
  headline: string;
  topActions: GrowAction[];
  observationsToRecord: string[];
  missingData: string[];
  positiveSignals: string[];
  noActionNeeded: boolean;
  todayPlanActions?: Array<{
    planId: string;
    planName: string;
    stepId: string;
    stepTitle: string;
    category: string;
    priority: string;
    dueAt?: string | null;
  }>;
}

export interface RecommendationEvidence {
  label: string;
  value: string;
  source: string;
}

// ==============================================================================
// 4. DATA QUALITY MODEL
// ==============================================================================

export interface DataQualityCategory {
  category: string;
  score: number;
  missing: string[];
}

export interface DataQualityReport {
  score: number;
  categories: DataQualityCategory[];
}

// ==============================================================================
// 5. NATURAL LANGUAGE QUERY
// ==============================================================================

export interface GardenQueryResponse {
  query: string;
  intent: string;
  answer: string;
  confidence: 'high' | 'moderate' | 'low';
  groundedFacts: string[];
  suggestedActions: GrowAction[];
  source: 'deterministic' | 'ai_assisted';
}

// ==============================================================================
// 6. ADAPTIVE ENGINE INPUTS
// ==============================================================================

export interface AdaptiveGardenInput {
  plants: UserPlant[];
  conditions?: GrowingConditionObservation[];
  feedings?: FeedingRecord[];
  propagations?: PropagationEvent[];
  cycles?: ProductionCycle[];
  harvests?: HarvestRecord[];
  diagnoses?: SavedDiagnosisRecord[];
  reminders?: Reminder[];
  spaceProfile?: SpaceConfigProfile | null;
  spaceMetrics?: ProductionSpaceMetrics | null;
  growPlans?: any[];
  referenceDate?: Date | string;
}

