/**
 * Supabase Integration Boundary for GrowAI
 *
 * This module prepares GrowAI for future Supabase Authentication and
 * PostgreSQL database operations (User Gardens, Growth Notes, Care Tasks).
 *
 * External services are NOT connected in this initial foundation phase.
 * No dummy keys or mock credentials are hardcoded here.
 */

export interface DatabaseSchema {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: Partial<DatabaseSchema['public']['Tables']['profiles']['Insert']>;
      };
      user_plants: {
        Row: {
          id: string;
          user_id: string;
          plant_slug: string;
          nickname: string;
          planted_date: string;
          current_stage: string;
          location: string | null;
          tier: string | null;
          pot_size: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['user_plants']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['user_plants']['Insert']>;
      };
      growth_notes: {
        Row: {
          id: string;
          plant_id: string;
          user_id: string;
          note_date: string;
          stage: string;
          text: string;
          height_cm: number | null;
          image_url: string | null;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['growth_notes']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['growth_notes']['Insert']>;
      };
      care_tasks: {
        Row: {
          id: string;
          user_id: string;
          plant_id: string;
          title: string;
          task_type: string;
          due_date: string;
          completed: boolean;
          completed_at: string | null;
          created_at: string;
        };
        Insert: Omit<DatabaseSchema['public']['Tables']['care_tasks']['Row'], 'created_at'>;
        Update: Partial<DatabaseSchema['public']['Tables']['care_tasks']['Insert']>;
      };
    };
  };
}

export interface SupabaseConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  isConfigured: boolean;
}

export function getSupabaseConfig(): SupabaseConfig {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured = Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('placeholder')
  );

  return {
    supabaseUrl,
    supabaseAnonKey,
    isConfigured,
  };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig().isConfigured;
}

/**
 * Clean architectural adapter:
 * When Supabase is configured with valid environment variables, this
 * returns a real client instance. When unconfigured, it gracefully falls
 * back to null without throwing runtime exceptions.
 */
export function getSupabaseClient() {
  const { isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return null;
  }
  // When ready for live connection:
  // import { createClient } from '@supabase/supabase-js'
  // return createClient<DatabaseSchema>(supabaseUrl!, supabaseAnonKey!)
  return null;
}
