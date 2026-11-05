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
