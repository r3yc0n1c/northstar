import { supabase } from '@/lib/supabase';
import type { CompleteOnboardingPayload } from '../schema';
import { STARTER_LIFE_AREAS } from '../schema';

/**
 * Marks onboarding as completed for a user by setting onboarding_completed_at = now().
 * Can be called when skipping or finalizing.
 */
export async function skipOnboarding(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to skip onboarding: ${error.message}`);
  }
}

/**
 * Saves all three onboarding steps in sequence:
 * 1. Updates profile timezone, locale, working_days, working_hours, and onboarding_completed_at
 * 2. Fetches the user's workspace
 * 3. Provisions any selected starter domains (life areas)
 * 4. Provisions the optional first goal linked to the chosen domain
 */
export async function completeOnboarding(payload: CompleteOnboardingPayload): Promise<void> {
  const { userId, step1, step2, step3 } = payload;

  // 1. Update Profile & Settings
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      timezone: step1.timezone,
      locale: step1.locale,
      working_days: step1.working_days,
      working_hours: step1.working_hours,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (profileError) {
    throw new Error(`Failed to update profile during onboarding: ${profileError.message}`);
  }

  // 2. Lookup user's workspace
  const { data: workspace, error: wsError } = await supabase
    .from('workspaces')
    .select('id')
    .eq('owner_id', userId)
    .single();

  if (wsError || !workspace) {
    // Even if workspace lookup fails, profile is already marked completed
    return;
  }

  const workspaceId = workspace.id;
  const createdDomainMap = new Map<string, string>(); // starterAreaId -> createdDomainId

  // 3. Create selected starter domains
  if (step2.selected_areas.length > 0) {
    const selectedDefs = STARTER_LIFE_AREAS.filter((area) =>
      step2.selected_areas.includes(area.id),
    );

    for (let i = 0; i < selectedDefs.length; i++) {
      const def = selectedDefs[i];
      if (!def) continue;

      const { data: insertedDomain, error: domainError } = await supabase
        .from('domains')
        .insert({
          workspace_id: workspaceId,
          name: def.name,
          color: def.color,
          icon: def.icon,
          sort_order: i,
        })
        .select('id')
        .single();

      if (!domainError && insertedDomain) {
        createdDomainMap.set(def.id, insertedDomain.id);
      }
    }
  }

  // 4. Create optional first goal if title provided
  const goalTitle = step3.goal_title?.trim();
  if (goalTitle) {
    const domainId = step3.goal_area_id ? (createdDomainMap.get(step3.goal_area_id) ?? null) : null;

    const { error: goalError } = await supabase.from('goals').insert({
      workspace_id: workspaceId,
      domain_id: domainId,
      title: goalTitle,
      target_date: step3.goal_target_date || null,
      status: 'active',
      priority: 'medium',
    });

    if (goalError) {
      console.warn('Could not insert starter goal during onboarding:', goalError.message);
    }
  }
}
