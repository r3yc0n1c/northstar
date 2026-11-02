import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'placeholder-publishable-key';

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export interface ConnectionHealthResult {
  ok: boolean;
  message: string;
  latencyMs?: number;
}

/**
 * Dev-only connectivity check to verify Supabase reachability.
 */
export async function checkSupabaseConnection(): Promise<ConnectionHealthResult> {
  if (!import.meta.env.DEV) {
    return { ok: true, message: 'Connectivity check is disabled outside development.' };
  }

  const start = performance.now();
  try {
    const { error } = await supabase.auth.getSession();
    const latencyMs = Math.round(performance.now() - start);

    if (error) {
      return {
        ok: false,
        message: `Supabase auth session check failed: ${error.message}`,
        latencyMs,
      };
    }

    return {
      ok: true,
      message: 'Supabase reachable',
      latencyMs,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - start);
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Unknown connection error',
      latencyMs,
    };
  }
}
