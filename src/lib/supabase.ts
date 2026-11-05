/**
 * Supabase Database Schema & Integration Boundary for GrowAI
 */

import { GrowthStage, TaskType, PropagationMethod } from '@/types/garden';
import {
  PrimaryClassification,
  DiagnosticConfidence,
  TreatmentActionType,
  TreatmentStatus,
  FollowUpOutcome,
} from '@/types/diagnosis';
import {
  ReminderSourceType,
  ReminderType,
  ReminderStatus,
  ReminderPriority,
  ReminderRecurrence,
  NotificationCategoriesPreference,
  NotificationChannelsPreference,
  NotificationQuietHoursPreference,
} from '@/types/reminder';
import {
  LightLevel,
  LightSource,
  AirflowQuality,
  SoilMoistureObservation,
  DrainageQuality,
  FertilizerType,
  FertilizerFormulation,
  FeedingApplicationMethod,
  NutrientObservationType,
  PropagationStatus,
  ProductionStage,
  ProductionCycleStatus,
  HarvestUnit,
  HarvestType,
  HarvestQualityObservation,
} from '@/types/grow-intelligence';
import { getSupabaseConfig, isSupabaseConfigured } from './supabase/config';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_plants: {
        Row: {
          id: string;
          user_id: string;
          plant_slug: string;
          nickname: string;
          current_stage: GrowthStage;
          planted_date: string;
          location: string | null;
          tier: 'top' | 'middle' | 'bottom' | null;
          pot_size: string | null;
          custom_image: string | null;
          parent_plant_id: string | null;
          propagation_method: PropagationMethod | null;
          propagation_date: string | null;
          actual_harvest_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_slug: string;
          nickname: string;
          current_stage: GrowthStage;
          planted_date: string;
          location?: string | null;
          tier?: 'top' | 'middle' | 'bottom' | null;
          pot_size?: string | null;
          custom_image?: string | null;
          parent_plant_id?: string | null;
          propagation_method?: PropagationMethod | null;
          propagation_date?: string | null;
          actual_harvest_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_slug?: string;
          nickname?: string;
          current_stage?: GrowthStage;
          planted_date?: string;
          location?: string | null;
          tier?: 'top' | 'middle' | 'bottom' | null;
          pot_size?: string | null;
          custom_image?: string | null;
          parent_plant_id?: string | null;
          propagation_method?: PropagationMethod | null;
          propagation_date?: string | null;
          actual_harvest_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_plants_parent_plant_id_fkey";
            columns: ["parent_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      growth_notes: {
        Row: {
          id: string;
          user_id: string;
          user_plant_id: string;
          observation_date: string;
          stage: GrowthStage;
          text: string;
          height_cm: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_plant_id: string;
          observation_date?: string;
          stage: GrowthStage;
          text: string;
          height_cm?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_plant_id?: string;
          observation_date?: string;
          stage?: GrowthStage;
          text?: string;
          height_cm?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "growth_notes_user_plant_id_fkey";
            columns: ["user_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      plant_photos: {
        Row: {
          id: string;
          user_id: string;
          user_plant_id: string;
          storage_path: string;
          caption: string | null;
          growth_stage: GrowthStage | null;
          height_cm: number | null;
          taken_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_plant_id: string;
          storage_path: string;
          caption?: string | null;
          growth_stage?: GrowthStage | null;
          height_cm?: number | null;
          taken_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_plant_id?: string;
          storage_path?: string;
          caption?: string | null;
          growth_stage?: GrowthStage | null;
          height_cm?: number | null;
          taken_at?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "plant_photos_user_plant_id_fkey";
            columns: ["user_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      care_tasks: {
        Row: {
          id: string;
          user_id: string;
          user_plant_id: string | null;
          plant_name: string;
          title: string;
          task_type: TaskType;
          due_date: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_plant_id?: string | null;
          plant_name: string;
          title: string;
          task_type: TaskType;
          due_date: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_plant_id?: string | null;
          plant_name?: string;
          title?: string;
          task_type?: TaskType;
          due_date?: string;
          completed?: boolean;
          completed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "care_tasks_user_plant_id_fkey";
            columns: ["user_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      diagnosis_records: {
        Row: {
          id: string;
          user_id: string;
          user_plant_id: string | null;
          plant_photo_id: string | null;
          schema_version: string;
          diagnostic_source: 'gemini-vision' | 'agronomic-heuristic' | 'fallback';
          model_used: string | null;
          status: 'completed' | 'inconclusive' | 'not_a_plant' | 'service_unavailable';
          primary_classification: PrimaryClassification | null;
          is_plant_recognized: boolean;
          plant_identification: string;
          plant_identification_confidence: 'high' | 'medium' | 'low' | 'uncertain';
          plant_slug: string | null;
          overall_health: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
          image_quality: Json | null;
          evidence_separation: Json | null;
          symptoms: string;
          user_context: Json;
          visible_symptoms: string[];
          likely_causes: string[];
          recommended_checks: string[];
          immediate_actions: string[];
          long_term_care: string[];
          prevention: string[];
          uncertainties: string[];
          follow_up_questions: Json | null;
          requires_expert_review: boolean;
          summary: string;
          disclaimer: string;
          suggested_follow_up: string | null;
          diagnosed_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          user_plant_id?: string | null;
          plant_photo_id?: string | null;
          schema_version?: string;
          diagnostic_source: 'gemini-vision' | 'agronomic-heuristic' | 'fallback';
          model_used?: string | null;
          status: 'completed' | 'inconclusive' | 'not_a_plant' | 'service_unavailable';
          primary_classification?: PrimaryClassification | null;
          is_plant_recognized?: boolean;
          plant_identification: string;
          plant_identification_confidence: 'high' | 'medium' | 'low' | 'uncertain';
          plant_slug?: string | null;
          overall_health: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
          image_quality?: Json | null;
          evidence_separation?: Json | null;
          symptoms: string;
          user_context?: Json;
          visible_symptoms?: string[];
          likely_causes?: string[];
          recommended_checks?: string[];
          immediate_actions?: string[];
          long_term_care?: string[];
          prevention?: string[];
          uncertainties?: string[];
          follow_up_questions?: Json | null;
          requires_expert_review?: boolean;
          summary: string;
          disclaimer: string;
          suggested_follow_up?: string | null;
          diagnosed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          user_plant_id?: string | null;
          plant_photo_id?: string | null;
          schema_version?: string;
          diagnostic_source?: 'gemini-vision' | 'agronomic-heuristic' | 'fallback';
          model_used?: string | null;
          status?: 'completed' | 'inconclusive' | 'not_a_plant' | 'service_unavailable';
          primary_classification?: PrimaryClassification | null;
          is_plant_recognized?: boolean;
          plant_identification?: string;
          plant_identification_confidence?: 'high' | 'medium' | 'low' | 'uncertain';
          plant_slug?: string | null;
          overall_health?: 'healthy' | 'mild_stress' | 'moderate_issue' | 'severe_issue' | 'unknown';
          image_quality?: Json | null;
          evidence_separation?: Json | null;
          symptoms?: string;
          user_context?: Json;
          visible_symptoms?: string[];
          likely_causes?: string[];
          recommended_checks?: string[];
          immediate_actions?: string[];
          long_term_care?: string[];
          prevention?: string[];
          uncertainties?: string[];
          follow_up_questions?: Json | null;
          requires_expert_review?: boolean;
          summary?: string;
          disclaimer?: string;
          suggested_follow_up?: string | null;
          diagnosed_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosis_records_user_plant_id_fkey";
            columns: ["user_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diagnosis_records_plant_photo_id_fkey";
            columns: ["plant_photo_id"];
            isOneToOne: false;
            referencedRelation: "plant_photos";
            referencedColumns: ["id"];
          }
        ];
      };
      diagnosis_candidates: {
        Row: {
          id: string;
          diagnosis_id: string;
          user_id: string;
          candidate_rank: number;
          kb_condition_id: string | null;
          condition_name: string;
          category: 'pest' | 'disease' | 'abiotic' | null;
          explanation: string;
          confidence_category: DiagnosticConfidence;
          supporting_evidence: string[];
          contradicting_evidence: string[];
          alternative_causes: string[];
          recommended_next_observation: string | null;
          grounded_treatment: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          diagnosis_id: string;
          user_id: string;
          candidate_rank: number;
          kb_condition_id?: string | null;
          condition_name: string;
          category?: 'pest' | 'disease' | 'abiotic' | null;
          explanation: string;
          confidence_category: DiagnosticConfidence;
          supporting_evidence?: string[];
          contradicting_evidence?: string[];
          alternative_causes?: string[];
          recommended_next_observation?: string | null;
          grounded_treatment?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          diagnosis_id?: string;
          user_id?: string;
          candidate_rank?: number;
          kb_condition_id?: string | null;
          condition_name?: string;
          category?: 'pest' | 'disease' | 'abiotic' | null;
          explanation?: string;
          confidence_category?: DiagnosticConfidence;
          supporting_evidence?: string[];
          contradicting_evidence?: string[];
          alternative_causes?: string[];
          recommended_next_observation?: string | null;
          grounded_treatment?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosis_candidates_diagnosis_id_fkey";
            columns: ["diagnosis_id"];
            isOneToOne: false;
            referencedRelation: "diagnosis_records";
            referencedColumns: ["id"];
          }
        ];
      };
      diagnosis_treatments: {
        Row: {
          id: string;
          diagnosis_id: string;
          user_id: string;
          user_plant_id: string | null;
          action_type: TreatmentActionType;
          action_title: string;
          status: TreatmentStatus;
          notes: string | null;
          action_date: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          diagnosis_id: string;
          user_id: string;
          user_plant_id?: string | null;
          action_type: TreatmentActionType;
          action_title: string;
          status?: TreatmentStatus;
          notes?: string | null;
          action_date?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          diagnosis_id?: string;
          user_id?: string;
          user_plant_id?: string | null;
          action_type?: TreatmentActionType;
          action_title?: string;
          status?: TreatmentStatus;
          notes?: string | null;
          action_date?: string;
          completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosis_treatments_diagnosis_id_fkey";
            columns: ["diagnosis_id"];
            isOneToOne: false;
            referencedRelation: "diagnosis_records";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diagnosis_treatments_user_plant_id_fkey";
            columns: ["user_plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      diagnosis_follow_ups: {
        Row: {
          id: string;
          diagnosis_id: string;
          user_id: string;
          outcome_status: FollowUpOutcome;
          observation_notes: string | null;
          follow_up_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          diagnosis_id: string;
          user_id: string;
          outcome_status: FollowUpOutcome;
          observation_notes?: string | null;
          follow_up_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          diagnosis_id?: string;
          user_id?: string;
          outcome_status?: FollowUpOutcome;
          observation_notes?: string | null;
          follow_up_date?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "diagnosis_follow_ups_diagnosis_id_fkey";
            columns: ["diagnosis_id"];
            isOneToOne: false;
            referencedRelation: "diagnosis_records";
            referencedColumns: ["id"];
          }
        ];
      };
      reminders: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string | null;
          plant_nickname: string | null;
          plant_slug: string | null;
          source_type: ReminderSourceType;
          source_id: string | null;
          reminder_type: ReminderType;
          title: string;
          body: string;
          scheduled_for: string;
          due_at: string;
          recurrence: ReminderRecurrence | null;
          priority: ReminderPriority;
          status: ReminderStatus;
          completed_at: string | null;
          dismissed_at: string | null;
          is_read: boolean;
          metadata: Record<string, any>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id?: string | null;
          plant_nickname?: string | null;
          plant_slug?: string | null;
          source_type: ReminderSourceType;
          source_id?: string | null;
          reminder_type: ReminderType;
          title: string;
          body?: string;
          scheduled_for?: string;
          due_at: string;
          recurrence?: ReminderRecurrence | null;
          priority?: ReminderPriority;
          status?: ReminderStatus;
          completed_at?: string | null;
          dismissed_at?: string | null;
          is_read?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_id?: string | null;
          plant_nickname?: string | null;
          plant_slug?: string | null;
          source_type?: ReminderSourceType;
          source_id?: string | null;
          reminder_type?: ReminderType;
          title?: string;
          body?: string;
          scheduled_for?: string;
          due_at?: string;
          recurrence?: ReminderRecurrence | null;
          priority?: ReminderPriority;
          status?: ReminderStatus;
          completed_at?: string | null;
          dismissed_at?: string | null;
          is_read?: boolean;
          metadata?: Record<string, any>;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "reminders_plant_id_fkey";
            columns: ["plant_id"];
            isOneToOne: false;
            referencedRelation: "user_plants";
            referencedColumns: ["id"];
          }
        ];
      };
      notification_preferences: {
        Row: {
          id: string;
          user_id: string;
          categories: NotificationCategoriesPreference;
          channels: NotificationChannelsPreference;
          quiet_hours: NotificationQuietHoursPreference;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          categories?: NotificationCategoriesPreference;
          channels?: NotificationChannelsPreference;
          quiet_hours?: NotificationQuietHoursPreference;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          categories?: NotificationCategoriesPreference;
          channels?: NotificationChannelsPreference;
          quiet_hours?: NotificationQuietHoursPreference;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      growing_conditions: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string | null;
          environment_zone: string | null;
          light_level: LightLevel | null;
          light_duration_hours: number | null;
          light_source: LightSource | null;
          is_grow_light: boolean;
          temperature_celsius: number | null;
          temp_min_celsius: number | null;
          temp_max_celsius: number | null;
          relative_humidity_percent: number | null;
          airflow_quality: AirflowQuality | null;
          soil_moisture: SoilMoistureObservation | null;
          drainage_quality: DrainageQuality | null;
          ph: number | null;
          medium_type: string | null;
          notes: string | null;
          observation_time: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id?: string | null;
          environment_zone?: string | null;
          light_level?: LightLevel | null;
          light_duration_hours?: number | null;
          light_source?: LightSource | null;
          is_grow_light?: boolean;
          temperature_celsius?: number | null;
          temp_min_celsius?: number | null;
          temp_max_celsius?: number | null;
          relative_humidity_percent?: number | null;
          airflow_quality?: AirflowQuality | null;
          soil_moisture?: SoilMoistureObservation | null;
          drainage_quality?: DrainageQuality | null;
          ph?: number | null;
          medium_type?: string | null;
          notes?: string | null;
          observation_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_id?: string | null;
          environment_zone?: string | null;
          light_level?: LightLevel | null;
          light_duration_hours?: number | null;
          light_source?: LightSource | null;
          is_grow_light?: boolean;
          temperature_celsius?: number | null;
          temp_min_celsius?: number | null;
          temp_max_celsius?: number | null;
          relative_humidity_percent?: number | null;
          airflow_quality?: AirflowQuality | null;
          soil_moisture?: SoilMoistureObservation | null;
          drainage_quality?: DrainageQuality | null;
          ph?: number | null;
          medium_type?: string | null;
          notes?: string | null;
          observation_time?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      feeding_records: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string | null;
          feeding_date: string;
          product_name: string;
          fertilizer_type: FertilizerType;
          npk_ratio: string | null;
          formulation: FertilizerFormulation | null;
          application_method: FeedingApplicationMethod;
          dosage_amount: number | null;
          dosage_unit: string | null;
          dosage_unknown: boolean;
          source_reference: string | null;
          next_planned_date: string | null;
          grower_observation: string | null;
          nutrient_observation: NutrientObservationType | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id?: string | null;
          feeding_date?: string;
          product_name: string;
          fertilizer_type?: FertilizerType;
          npk_ratio?: string | null;
          formulation?: FertilizerFormulation | null;
          application_method?: FeedingApplicationMethod;
          dosage_amount?: number | null;
          dosage_unit?: string | null;
          dosage_unknown?: boolean;
          source_reference?: string | null;
          next_planned_date?: string | null;
          grower_observation?: string | null;
          nutrient_observation?: NutrientObservationType | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_id?: string | null;
          feeding_date?: string;
          product_name?: string;
          fertilizer_type?: FertilizerType;
          npk_ratio?: string | null;
          formulation?: FertilizerFormulation | null;
          application_method?: FeedingApplicationMethod;
          dosage_amount?: number | null;
          dosage_unit?: string | null;
          dosage_unknown?: boolean;
          source_reference?: string | null;
          next_planned_date?: string | null;
          grower_observation?: string | null;
          nutrient_observation?: NutrientObservationType | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      propagation_events: {
        Row: {
          id: string;
          user_id: string;
          parent_plant_id: string;
          propagation_method: string;
          started_date: string;
          medium: string | null;
          environment: string | null;
          notes: string | null;
          expected_followup_date: string | null;
          status: PropagationStatus;
          outcome_date: string | null;
          offspring_plant_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parent_plant_id: string;
          propagation_method: string;
          started_date?: string;
          medium?: string | null;
          environment?: string | null;
          notes?: string | null;
          expected_followup_date?: string | null;
          status?: PropagationStatus;
          outcome_date?: string | null;
          offspring_plant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parent_plant_id?: string;
          propagation_method?: string;
          started_date?: string;
          medium?: string | null;
          environment?: string | null;
          notes?: string | null;
          expected_followup_date?: string | null;
          status?: PropagationStatus;
          outcome_date?: string | null;
          offspring_plant_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      production_cycles: {
        Row: {
          id: string;
          user_id: string;
          cycle_name: string;
          plant_slug: string;
          growing_area: string | null;
          start_date: string;
          expected_end_date: string | null;
          actual_end_date: string | null;
          stage: ProductionStage;
          quantity_planted: number;
          quantity_active: number;
          quantity_lost: number;
          quantity_harvested: number;
          status: ProductionCycleStatus;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cycle_name: string;
          plant_slug: string;
          growing_area?: string | null;
          start_date?: string;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          stage?: ProductionStage;
          quantity_planted?: number;
          quantity_active?: number;
          quantity_lost?: number;
          quantity_harvested?: number;
          status?: ProductionCycleStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cycle_name?: string;
          plant_slug?: string;
          growing_area?: string | null;
          start_date?: string;
          expected_end_date?: string | null;
          actual_end_date?: string | null;
          stage?: ProductionStage;
          quantity_planted?: number;
          quantity_active?: number;
          quantity_lost?: number;
          quantity_harvested?: number;
          status?: ProductionCycleStatus;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      production_cycle_plants: {
        Row: {
          cycle_id: string;
          plant_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          cycle_id: string;
          plant_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          cycle_id?: string;
          plant_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      harvest_records: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string | null;
          production_cycle_id: string | null;
          harvest_date: string;
          quantity: number;
          unit: HarvestUnit;
          harvest_type: HarvestType;
          quality_observation: HarvestQualityObservation | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          plant_id?: string | null;
          production_cycle_id?: string | null;
          harvest_date?: string;
          quantity: number;
          unit: HarvestUnit;
          harvest_type?: HarvestType;
          quality_observation?: HarvestQualityObservation | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          plant_id?: string | null;
          production_cycle_id?: string | null;
          harvest_date?: string;
          quantity?: number;
          unit?: HarvestUnit;
          harvest_type?: HarvestType;
          quality_observation?: HarvestQualityObservation | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export { getSupabaseConfig, isSupabaseConfigured };
