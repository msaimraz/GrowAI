import { createBrowserClient } from '@supabase/ssr';
import { DatabaseSchema } from '../supabase';
import { getSupabaseConfig } from './config';

let client: ReturnType<typeof createBrowserClient<DatabaseSchema>> | null = null;

export function createClient() {
  const { isConfigured, supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (typeof window !== 'undefined' && client) {
    return client;
  }

  const newClient = createBrowserClient<DatabaseSchema>(supabaseUrl, supabaseAnonKey);

  if (typeof window !== 'undefined') {
    client = newClient;
  }

  return newClient;
}
