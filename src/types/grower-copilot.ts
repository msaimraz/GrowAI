/**
 * GrowAI Phase 12: Grower Copilot & Conversational Intelligence Domain Types
 * Strongly typed models for intents, query retrieval, structured evidence grounding,
 * conversational session memory, action proposals, and safety boundaries.
 *
 * Core Architectural Principle:
 * - Deterministic GrowAI engines remain authoritative.
 * - Every factual statement is backed by structured CopilotEvidence.
 * - Write actions require explicit user confirmation.
 * - Strict agronomic safety: zero fabricated dosages, no guaranteed yield,
 *   no human medical advice, unknown remains unknown.
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
import { PlantTimelineEvent } from './timeline';
import { GrowAction, GardenState, DataQualityReport } from './adaptive-grow';

// ==============================================================================
// 1. INTENT DEFINITIONS
// ==============================================================================

export type CopilotIntent =
  // Garden Overview
  | 'garden_summary'
  | 'today_priorities'
  | 'current_health'
  | 'current_care'
  | 'missing_data'
  // Plant Specific
  | 'plant_status'
  | 'plant_history'
  | 'plant_growth'
  | 'plant_health'
  | 'plant_conditions'
  | 'plant_feeding'
  | 'plant_propagation'
  | 'plant_production'
  // Health Specific
  | 'health_status'
  | 'diagnosis_history'
  | 'follow_up_status'
  | 'treatment_history'
  // Environment
  | 'condition_history'
  | 'missing_conditions'
  | 'environmental_comparison'
  // Feeding
  | 'feeding_history'
  | 'feeding_completeness'
  | 'nutrient_record_summary'
  // Production & Yield
  | 'harvest_history'
  | 'cycle_comparison'
  | 'production_summary'
  | 'yield_history'
  // Propagation
  | 'lineage'
  | 'propagation_history'
  | 'offspring'
  // Intelligence & Actions
  | 'next_best_action'
  | 'why_recommendation'
  | 'action_queue'
  | 'data_quality'
  | 'daily_grow_check'
  // Timeline
  | 'recent_changes'
  | 'historical_events'
  | 'plant_timeline'
  // Grow Plans (Phase 13)
  | 'view_grow_plan'
  | 'create_grow_plan'
  | 'pause_grow_plan'
  | 'resume_grow_plan'
  | 'complete_plan_step'
  | 'plan_status_inquiry'
  // Navigation & Space
  | 'space_advisory'
  | 'navigation'
  // Safety & Fallback
  | 'human_medical_redirect'
  | 'unsupported';

// ==============================================================================
// 2. EVIDENCE & PROVENANCE
// ==============================================================================

export type CopilotSource =
  | 'user_plant'
  | 'growth_observation'
  | 'plant_photo'
  | 'diagnosis_record'
  | 'diagnosis_candidate'
  | 'diagnosis_treatment'
  | 'diagnosis_follow_up'
  | 'care_task'
  | 'reminder'
  | 'growing_condition'
  | 'feeding_record'
  | 'propagation_event'
  | 'production_cycle'
  | 'harvest_record'
  | 'space_profile'
  | 'garden_state'
  | 'plant_timeline'
  | 'grow_plan'
  | 'grow_plan_step'
  | 'botanical_catalog';

export interface CopilotEvidence {
  sourceType: CopilotSource;
  sourceId?: string;
  plantId?: string;
  plantNickname?: string;
  field?: string;
  value?: string | number | boolean | null;
  recordedAt?: string;
  provenance: 'recorded' | 'calculated' | 'observed' | 'inferred' | 'recommended' | 'unknown';
  description: string;
  route?: string;
}

// ==============================================================================
// 3. ACTION PROPOSALS & EXECUTION
// ==============================================================================

export type CopilotActionType =
  | 'create_reminder'
  | 'complete_reminder'
  | 'open_plant'
  | 'open_health'
  | 'open_timeline'
  | 'open_production_cycle'
  | 'open_planner'
  | 'record_observation'
  | 'record_growing_condition'
  | 'record_feeding'
  | 'record_harvest'
  | 'record_propagation_event'
  | 'create_plan'
  | 'pause_plan'
  | 'resume_plan'
  | 'complete_step'
  | 'cancel_plan'
  | 'open_grow_plan';

export interface CopilotAction {
  id: string;
  type: CopilotActionType;
  label: string;
  description: string;
  requiresConfirmation: boolean; // Consequential writes must require confirmation
  confirmed?: boolean;
  route?: string;
  payload?: Record<string, any>;
}

// ==============================================================================
// 4. RESPONSE CONTRACT
// ==============================================================================

export type CopilotSafetyLevel = 'safe' | 'cautionary' | 'prohibited_redirect';

export interface CopilotResponse {
  answer: string;
  whatGrowAiFound?: string[];
  why?: string;
  recommendedNextStep?: string;
  evidence: CopilotEvidence[];
  suggestedActions?: CopilotAction[];
  suggestedQuestions?: string[];
  intent: CopilotIntent;
  safetyLevel: CopilotSafetyLevel;
  confidence: 'high' | 'moderate' | 'low' | 'unknown';
  source: 'deterministic' | 'gemini_grounded' | 'deterministic_fallback';
}

// ==============================================================================
// 5. MESSAGING & CONVERSATION SESSION
// ==============================================================================

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  response?: CopilotResponse;
  status?: 'sending' | 'success' | 'error' | 'rate_limited' | 'offline';
  errorMessage?: string;
}

export interface CopilotSession {
  sessionId: string;
  activePlantId?: string | null;
  activePlantNickname?: string | null;
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
}

// ==============================================================================
// 6. RETRIEVAL & QUERY CONTEXT
// ==============================================================================

export interface CopilotQueryContext {
  userId: string;
  intent: CopilotIntent;
  targetPlantId?: string | null;
  targetPlantNickname?: string | null;
  relevantPlants: UserPlant[];
  relevantHealthRecords: SavedDiagnosisRecord[];
  relevantConditions: GrowingConditionObservation[];
  relevantFeedingRecords: FeedingRecord[];
  relevantPropagationEvents: PropagationEvent[];
  relevantProductionCycles: ProductionCycle[];
  relevantHarvests: HarvestRecord[];
  relevantReminders: Reminder[];
  relevantTimelineEvents: PlantTimelineEvent[];
  relevantGrowActions: GrowAction[];
  relevantGrowPlans?: any[];
  dataQuality?: DataQualityReport | null;
  gardenState?: GardenState | null;
  evidence: CopilotEvidence[];
  unknowns?: string[];
}
