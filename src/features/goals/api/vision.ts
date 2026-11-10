import { supabase } from '@/lib/supabase';

export async function fetchWorkspaceVision(workspaceId: string): Promise<string> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('vision')
    .eq('id', workspaceId)
    .single();

  if (error) throw error;
  return data?.vision ?? '';
}

export async function updateWorkspaceVision(workspaceId: string, vision: string): Promise<string> {
  const trimmed = vision.trim();
  const { data, error } = await supabase
    .from('workspaces')
    .update({ vision: trimmed })
    .eq('id', workspaceId)
    .select('vision')
    .single();

  if (error) throw error;
  return data?.vision ?? '';
}
