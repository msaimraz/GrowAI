import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DatabaseSchema } from '../supabase';
import { getSupabaseConfig } from './config';

export async function createClient() {
  const { isConfigured, supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  if (!isConfigured || !supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<DatabaseSchema>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if middleware is refreshing sessions.
        }
      },
    },
  });
}
