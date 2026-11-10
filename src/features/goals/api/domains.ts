import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { CreateDomainInput, Domain, ReorderDomainsInput, UpdateDomainInput } from '../schema';

type DomainUpdate = Database['public']['Tables']['domains']['Update'];

export async function fetchDomains(
  workspaceId: string,
  options: { includeArchived?: boolean } = {},
): Promise<Domain[]> {
  let query = supabase
    .from('domains')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (!options.includeArchived) {
    query = query.is('archived_at', null);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Domain[];
}

export async function createDomain(workspaceId: string, input: CreateDomainInput): Promise<Domain> {
  // Find current max sort_order
  const { data: existing } = await supabase
    .from('domains')
    .select('sort_order')
    .eq('workspace_id', workspaceId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSortOrder = (existing?.[0]?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from('domains')
    .insert({
      workspace_id: workspaceId,
      name: input.name.trim(),
      color: input.color,
      icon: input.icon,
      sort_order: nextSortOrder,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Domain;
}

export async function updateDomain(domainId: string, input: UpdateDomainInput): Promise<Domain> {
  const updates: DomainUpdate = {};
  if (input.name !== undefined) updates.name = input.name.trim();
  if (input.color !== undefined) updates.color = input.color;
  if (input.icon !== undefined) updates.icon = input.icon;
  if (input.sort_order !== undefined) updates.sort_order = input.sort_order;
  if (input.archived_at !== undefined) updates.archived_at = input.archived_at;

  const { data, error } = await supabase
    .from('domains')
    .update(updates)
    .eq('id', domainId)
    .select()
    .single();

  if (error) throw error;
  return data as Domain;
}

export async function archiveDomain(domainId: string): Promise<Domain> {
  return updateDomain(domainId, { archived_at: new Date().toISOString() });
}

export async function restoreDomain(domainId: string): Promise<Domain> {
  return updateDomain(domainId, { archived_at: null });
}

export async function reorderDomains(items: ReorderDomainsInput): Promise<void> {
  // Execute updates for each domain's sort_order
  const promises = items.map((item) =>
    supabase.from('domains').update({ sort_order: item.sort_order }).eq('id', item.id),
  );

  const results = await Promise.all(promises);
  const firstError = results.find((r) => r.error)?.error;
  if (firstError) throw firstError;
}
