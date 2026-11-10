import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type Workspace = Database['public']['Tables']['workspaces']['Row'];

export async function fetchCurrentWorkspace(userId: string): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('owner_id', userId)
    .single();

  if (error) throw error;
  return data as Workspace;
}
