import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { CreateGoalInput, Goal, GoalStatus, UpdateGoalInput } from '../schema';

type GoalUpdate = Database['public']['Tables']['goals']['Update'];

export interface FetchGoalsOptions {
  domainId?: string | null;
  status?: GoalStatus;
  includeArchived?: boolean;
}

export async function fetchGoals(
  workspaceId: string,
  options: FetchGoalsOptions = {},
): Promise<Goal[]> {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  if (options.domainId !== undefined) {
    if (options.domainId === null) {
      query = query.is('domain_id', null);
    } else {
      query = query.eq('domain_id', options.domainId);
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
  return (data ?? []) as Goal[];
}

export async function createGoal(workspaceId: string, input: CreateGoalInput): Promise<Goal> {
  const { data, error } = await supabase
    .from('goals')
    .insert({
      workspace_id: workspaceId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      domain_id: input.domain_id || null,
      status: input.status || 'active',
      priority: input.priority || 'none',
      start_date: input.start_date || null,
      target_date: input.target_date || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

export async function updateGoal(goalId: string, input: UpdateGoalInput): Promise<Goal> {
  const updates: GoalUpdate = {};
  if (input.title !== undefined) updates.title = input.title.trim();
  if (input.description !== undefined) updates.description = input.description.trim();
  if (input.domain_id !== undefined) updates.domain_id = input.domain_id;
  if (input.status !== undefined) updates.status = input.status;
  if (input.priority !== undefined) updates.priority = input.priority;
  if (input.start_date !== undefined) updates.start_date = input.start_date;
  if (input.target_date !== undefined) updates.target_date = input.target_date;
  if (input.archived_at !== undefined) updates.archived_at = input.archived_at;

  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', goalId)
    .select()
    .single();

  if (error) throw error;
  return data as Goal;
}

export async function archiveGoal(goalId: string): Promise<Goal> {
  return updateGoal(goalId, {
    archived_at: new Date().toISOString(),
    status: 'archived',
  });
}

export async function restoreGoal(goalId: string): Promise<Goal> {
  return updateGoal(goalId, {
    archived_at: null,
    status: 'active',
  });
}

export async function deleteGoal(goalId: string): Promise<void> {
  const { error } = await supabase.from('goals').delete().eq('id', goalId);
  if (error) throw error;
}
