import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { CreateCycleInput, Cycle, CycleStatus, UpdateCycleInput } from '../schema';

type CycleUpdate = Database['public']['Tables']['cycles']['Update'];

export interface FetchCyclesOptions {
  status?: CycleStatus;
}

export async function fetchCycles(
  workspaceId: string,
  options: FetchCyclesOptions = {},
): Promise<Cycle[]> {
  let query = supabase
    .from('cycles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('start_date', { ascending: true });

  if (options.status) {
    query = query.eq('status', options.status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Cycle[];
}

export async function createCycle(workspaceId: string, input: CreateCycleInput): Promise<Cycle> {
  const { data, error } = await supabase
    .from('cycles')
    .insert({
      workspace_id: workspaceId,
      name: input.name.trim(),
      cycle_type: input.cycle_type,
      start_date: input.start_date,
      end_date: input.end_date,
      status: input.status,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Cycle;
}

export async function updateCycle(cycleId: string, input: UpdateCycleInput): Promise<Cycle> {
  const updates: CycleUpdate = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.cycle_type !== undefined) updates.cycle_type = input.cycle_type;
  if (input.start_date !== undefined) updates.start_date = input.start_date;
  if (input.end_date !== undefined) updates.end_date = input.end_date;
  if (input.status !== undefined) updates.status = input.status;

  const { data, error } = await supabase
    .from('cycles')
    .update(updates)
    .eq('id', cycleId)
    .select()
    .single();

  if (error) throw error;
  return data as Cycle;
}

export async function deleteCycle(cycleId: string): Promise<void> {
  const { error } = await supabase.from('cycles').delete().eq('id', cycleId);
  if (error) throw error;
}
