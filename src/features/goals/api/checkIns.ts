import { supabase } from '@/lib/supabase';
import type { KrCheckIn, RecordCheckInInput } from '../schema';

export async function fetchKrCheckIns(keyResultId: string): Promise<KrCheckIn[]> {
  const { data, error } = await supabase
    .from('kr_check_ins')
    .select('*')
    .eq('key_result_id', keyResultId)
    .order('recorded_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as KrCheckIn[];
}

export async function recordKrCheckIn(input: RecordCheckInInput): Promise<KrCheckIn> {
  const { data, error } = await supabase.rpc('record_kr_check_in', {
    p_key_result_id: input.key_result_id,
    p_value: input.value,
    p_confidence: input.confidence ?? undefined,
    p_notes: input.notes?.trim() || '',
    p_evidence_url: input.evidence_url?.trim() || undefined,
    p_supersedes_id: input.supersedes_id ?? undefined,
  });

  if (error) throw error;
  return data as KrCheckIn;
}
