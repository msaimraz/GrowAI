/**
 * Supabase Database Schema & Integration Boundary for GrowAI
 */

import { GrowthStage, TaskType } from '@/types/garden';
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
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
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
