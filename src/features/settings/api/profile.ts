import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export const profileKeys = {
  all: ['profile'] as const,
  detail: (userId: string) => [...profileKeys.all, userId] as const,
};

/**
 * Fetches the user profile by user ID.
 */
export async function getProfile(userId: string): Promise<ProfileRow | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Updates the user profile.
 */
export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<ProfileRow> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

/**
 * Exports all user workspace data as JSON (FR-SET-4).
 */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const profile = await getProfile(userId);

  const { data: workspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId);

  if (wsError) {
    throw new Error(wsError.message);
  }

  return {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    profile,
    workspaces: workspaces || [],
  };
}
