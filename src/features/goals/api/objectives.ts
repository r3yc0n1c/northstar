import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type {
  CreateObjectiveInput,
  Objective,
  ObjectiveStatus,
  UpdateObjectiveInput,
} from '../schema';

type ObjectiveUpdate = Database['public']['Tables']['objectives']['Update'];

export interface FetchObjectivesOptions {
  cycleId?: string;
  goalId?: string | null;
  status?: ObjectiveStatus;
  includeArchived?: boolean;
}

export async function fetchObjectives(
  workspaceId: string,
  options: FetchObjectivesOptions = {},
): Promise<Objective[]> {
  let query = supabase
    .from('objectives')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (options.cycleId) {
    query = query.eq('cycle_id', options.cycleId);
  }

  if (options.goalId !== undefined) {
    if (options.goalId === null) {
      query = query.is('goal_id', null);
    } else {
      query = query.eq('goal_id', options.goalId);
    }
  }

  if (options.status) {
    query = query.eq('status', options.status);
  }

  if (!options.includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Objective[];
}

export async function fetchObjectiveById(objectiveId: string): Promise<Objective> {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('id', objectiveId)
    .single();

  if (error) throw error;
  return data as Objective;
}

export async function createObjective(
  workspaceId: string,
  input: CreateObjectiveInput,
): Promise<Objective> {
  const { data, error } = await supabase
    .from('objectives')
    .insert({
      workspace_id: workspaceId,
      cycle_id: input.cycle_id,
      goal_id: input.goal_id || null,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: input.status || 'active',
      priority: input.priority || 'none',
      confidence: input.confidence ?? null,
      start_date: input.start_date,
      due_date: input.due_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Objective;
}

export async function updateObjective(
  objectiveId: string,
  input: UpdateObjectiveInput,
): Promise<Objective> {
  const updates: ObjectiveUpdate = {};
  if (input.cycle_id !== undefined) updates.cycle_id = input.cycle_id;
  if (input.goal_id !== undefined) updates.goal_id = input.goal_id;
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.confidence !== undefined) updates.confidence = input.confidence;
  if (input.start_date !== undefined) updates.start_date = input.start_date;
  if (input.due_date !== undefined) updates.due_date = input.due_date;
  if (input.archived_at !== undefined) updates.archived_at = input.archived_at;

  const { data, error } = await supabase
    .from('objectives')
    .update(updates)
    .eq('id', objectiveId)
    .select()
    .single();

  if (error) throw error;
  return data as Objective;
}

export async function archiveObjective(objectiveId: string): Promise<Objective> {
  return updateObjective(objectiveId, {
    archived_at: new Date().toISOString(),
  });
}

export async function restoreObjective(objectiveId: string): Promise<Objective> {
  return updateObjective(objectiveId, {
    archived_at: null,
  });
}

export async function deleteObjective(objectiveId: string): Promise<void> {
  const { error } = await supabase.from('objectives').delete().eq('id', objectiveId);
  if (error) throw error;
}
