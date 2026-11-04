/**
 * Supabase Database Schema & Integration Boundary for GrowAI
 */

import { GrowthStage, TaskType, PropagationMethod } from '@/types/garden';
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
