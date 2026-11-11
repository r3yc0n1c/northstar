import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { CreateKeyResultInput, KeyResult, UpdateKeyResultInput } from '../schema';

type KeyResultUpdate = Database['public']['Tables']['key_results']['Update'];

export interface FetchKeyResultsOptions {
  objectiveId?: string;
  includeArchived?: boolean;
}

export async function fetchKeyResults(
  workspaceId: string,
  options: FetchKeyResultsOptions = {},
): Promise<KeyResult[]> {
  let query = supabase
    .from('key_results')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: true });

  if (options.objectiveId) {
    query = query.eq('objective_id', options.objectiveId);
  }

  if (!options.includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as KeyResult[];
}

export async function fetchKeyResultById(keyResultId: string): Promise<KeyResult | null> {
  const { data, error } = await supabase
    .from('key_results')
    .select('*')
    .eq('id', keyResultId)
    .maybeSingle();

  if (error) throw error;
  return data as KeyResult | null;
}

export async function createKeyResult(
  workspaceId: string,
  input: CreateKeyResultInput,
): Promise<KeyResult> {
  const { data, error } = await supabase
    .from('key_results')
    .insert({
      workspace_id: workspaceId,
      objective_id: input.objective_id,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      metric_type: input.metric_type,
      baseline_value: input.baseline_value,
      current_value: input.current_value,
      target_value: input.target_value,
      unit: input.unit?.trim() || '',
      currency_code: input.currency_code ? input.currency_code.trim().toUpperCase() : null,
      direction: input.direction || null,
      confidence: input.confidence ?? null,
      start_date: input.start_date,
      due_date: input.due_date,
    })
    .select()
    .single();

  if (error) throw error;
  return data as KeyResult;
}

export async function updateKeyResult(
  keyResultId: string,
  input: UpdateKeyResultInput,
): Promise<KeyResult> {
  const payload: KeyResultUpdate = {};

  if (input.title !== undefined) payload.title = input.title.trim();
  if (input.description !== undefined) payload.description = input.description?.trim() || '';
  if (input.metric_type !== undefined) payload.metric_type = input.metric_type;
  if (input.baseline_value !== undefined) payload.baseline_value = input.baseline_value;
  if (input.current_value !== undefined) payload.current_value = input.current_value;
  if (input.target_value !== undefined) payload.target_value = input.target_value;
  if (input.unit !== undefined) payload.unit = input.unit.trim();
  if (input.currency_code !== undefined) {
    payload.currency_code = input.currency_code ? input.currency_code.trim().toUpperCase() : null;
  }
  if (input.direction !== undefined) payload.direction = input.direction;
  if (input.confidence !== undefined) payload.confidence = input.confidence;
  if (input.start_date !== undefined) payload.start_date = input.start_date;
  if (input.due_date !== undefined) payload.due_date = input.due_date;
  if (input.archived_at !== undefined) payload.archived_at = input.archived_at;

  const { data, error } = await supabase
    .from('key_results')
    .update(payload)
    .eq('id', keyResultId)
    .select()
    .single();

  if (error) throw error;
  return data as KeyResult;
}

export async function archiveKeyResult(keyResultId: string): Promise<KeyResult> {
  return updateKeyResult(keyResultId, {
    archived_at: new Date().toISOString(),
  });
}

export async function restoreKeyResult(keyResultId: string): Promise<KeyResult> {
  return updateKeyResult(keyResultId, {
    archived_at: null,
  });
}

export async function deleteKeyResult(keyResultId: string): Promise<void> {
  const { error } = await supabase.from('key_results').delete().eq('id', keyResultId);
  if (error) throw error;
}
