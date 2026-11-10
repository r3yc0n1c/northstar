import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { isSupabaseAvailable, setupTwoTestUsers, type TwoUserContext } from './harness/auth';
import { testTableIsolation } from './harness/matrix';

const isLive = await isSupabaseAvailable();

describe.runIf(isLive)('Two-User RLS & Constraint Test Suite (Phase 1)', () => {
  let ctx: TwoUserContext;

  beforeAll(async () => {
    ctx = await setupTwoTestUsers();
  }, 30000);

  afterAll(async () => {
    if (ctx?.cleanup) {
      await ctx.cleanup();
    }
  });

  // 1. Root Table: profiles
  describe('Root Table RLS: profiles', () => {
    it('allows users to read only their own profile', async () => {
      const { userA, userB } = ctx;

      const { data: profA } = await userA.client.from('profiles').select('*');
      expect(profA).toHaveLength(1);
      expect(profA?.[0]?.id).toBe(userA.id);

      const { data: profB } = await userB.client.from('profiles').select('*');
      expect(profB).toHaveLength(1);
      expect(profB?.[0]?.id).toBe(userB.id);

      // User A querying User B's profile ID yields 0 rows
      const { data: crossProf } = await userA.client
        .from('profiles')
        .select('*')
        .eq('id', userB.id);
      expect(crossProf).toHaveLength(0);
    });

    it('prevents cross-user profile update and client profile insert', async () => {
      const { userA, userB } = ctx;

      // Attempt update of User B's profile by User A
      const { data: updated } = await userA.client
        .from('profiles')
        .update({ display_name: 'Hacked' })
        .eq('id', userB.id)
        .select();
      expect(updated ?? []).toHaveLength(0);

      // Attempt direct client insert into profiles (no insert policy exists)
      const { error: insertErr } = await userA.client
        .from('profiles')
        .insert({ id: '00000000-0000-0000-0000-000000000099', display_name: 'Direct' });
      expect(insertErr).not.toBeNull();
    });
  });

  // 2. Root Table: workspaces
  describe('Root Table RLS: workspaces', () => {
    it('allows users to read only their own workspace', async () => {
      const { userA, userB } = ctx;

      const { data: wsA } = await userA.client.from('workspaces').select('*');
      expect(wsA).toHaveLength(1);
      expect(wsA?.[0]?.owner_id).toBe(userA.id);

      const { data: wsB } = await userB.client.from('workspaces').select('*');
      expect(wsB).toHaveLength(1);
      expect(wsB?.[0]?.owner_id).toBe(userB.id);

      // User A querying User B's workspace yields 0 rows
      const { data: crossWs } = await userA.client
        .from('workspaces')
        .select('*')
        .eq('id', userB.workspaceId);
      expect(crossWs).toHaveLength(0);
    });

    it('prevents cross-user workspace update and client workspace insert', async () => {
      const { userA, userB } = ctx;

      // Attempt update of User B's workspace by User A
      const { data: updated } = await userA.client
        .from('workspaces')
        .update({ name: 'Hacked Workspace' })
        .eq('id', userB.workspaceId)
        .select();
      expect(updated ?? []).toHaveLength(0);

      // Attempt direct client insert into workspaces (no insert policy exists)
      const { error: insertErr } = await userA.client.from('workspaces').insert({
        owner_id: userA.id,
        name: 'Second Workspace',
      });
      expect(insertErr).not.toBeNull();
    });
  });

  // 3. Extensible Matrix Table: domains (Life Areas)
  testTableIsolation(
    {
      tableName: 'domains',
      createRowA: (context) => ({
        workspace_id: context.userA.workspaceId,
        name: 'Career & Craft A',
        icon: 'briefcase',
        color: '#5A4F7C',
      }),
      createRowB: (context) => ({
        workspace_id: context.userB.workspaceId,
        name: 'Health & Vitality B',
        icon: 'heart-pulse',
        color: '#6FCF97',
      }),
      updatePayloadA: { name: 'Compromised Domain' },
    },
    () => ctx,
  );

  // 4. Extensible Matrix Table: goals (with composite foreign key to domains)
  testTableIsolation(
    {
      tableName: 'goals',
      compositeForeignKey: {
        parentTable: 'domains',
        foreignKeyColumn: 'domain_id',
        createParentRowA: (context) => ({
          workspace_id: context.userA.workspaceId,
          name: 'Parent Life Area A',
          icon: 'sparkles',
          color: '#5A4F7C',
        }),
        createParentRowB: (context) => ({
          workspace_id: context.userB.workspaceId,
          name: 'Parent Life Area B',
          icon: 'sparkles',
          color: '#6FCF97',
        }),
      },
      createRowA: (context, parentA) => ({
        workspace_id: context.userA.workspaceId,
        domain_id: parentA?.id as string,
        title: 'Launch Northstar OS A',
        status: 'active',
        priority: 'high',
      }),
      createRowB: (context, parentB) => ({
        workspace_id: context.userB.workspaceId,
        domain_id: parentB?.id as string,
        title: 'Run Ultra-Marathon B',
        status: 'active',
        priority: 'medium',
      }),
      updatePayloadA: { title: 'Compromised Goal Title' },
    },
    () => ctx,
  );

  // 5. NS-22: Vision and Life Areas archiving rules
  describe('NS-22: Vision statement & Life Area Archiving Rules', () => {
    it('allows workspace owner to update vision and prevents cross-user modification', async () => {
      const { userA, userB } = ctx;
      const visionA = 'Build a calm, focused personal OS with zero compromise.';

      // User A updates their workspace vision
      const { data: updatedA, error: errA } = await userA.client
        .from('workspaces')
        .update({ vision: visionA })
        .eq('id', userA.workspaceId)
        .select('vision')
        .single();

      expect(errA).toBeNull();
      expect(updatedA?.vision).toBe(visionA);

      // User B cannot see User A's updated workspace vision
      const { data: crossRead } = await userB.client
        .from('workspaces')
        .select('vision')
        .eq('id', userA.workspaceId);
      expect(crossRead ?? []).toHaveLength(0);

      // User B cannot overwrite User A's workspace vision
      const { data: crossUpdate } = await userB.client
        .from('workspaces')
        .update({ vision: 'Malicious Vision' })
        .eq('id', userA.workspaceId)
        .select();
      expect(crossUpdate ?? []).toHaveLength(0);
    });

    it('enforces unique domain names among active domains, but allows duplicate name when archived', async () => {
      const { userA } = ctx;
      const areaName = `Wellness-${Date.now()}`;

      // Insert active domain
      const { data: initial, error: initialErr } = await userA.client
        .from('domains')
        .insert({
          workspace_id: userA.workspaceId,
          name: areaName,
          color: '#6FCF97',
          icon: 'heart-pulse',
        })
        .select()
        .single();

      expect(initialErr).toBeNull();
      expect(initial?.name).toBe(areaName);

      // Inserting second active domain with same name must fail (case-insensitive)
      const { error: duplicateErr } = await userA.client.from('domains').insert({
        workspace_id: userA.workspaceId,
        name: areaName.toUpperCase(),
        color: '#6FCF97',
        icon: 'heart-pulse',
      });
      expect(duplicateErr).not.toBeNull();

      // Archive initial domain
      const { error: archiveErr } = await userA.client
        .from('domains')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', initial?.id);
      expect(archiveErr).toBeNull();

      // Now inserting new active domain with the same name succeeds
      const { data: recreated, error: recreatedErr } = await userA.client
        .from('domains')
        .insert({
          workspace_id: userA.workspaceId,
          name: areaName,
          color: '#6FCF97',
          icon: 'heart-pulse',
        })
        .select()
        .single();

      expect(recreatedErr).toBeNull();
      expect(recreated?.name).toBe(areaName);
    });
  });

  // 6. Extensible Matrix Table: cycles
  testTableIsolation(
    {
      tableName: 'cycles',
      createRowA: (context) => ({
        workspace_id: context.userA.workspaceId,
        name: 'Q4 2026 Cycle A',
        cycle_type: 'quarterly',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
        status: 'active',
      }),
      createRowB: (context) => ({
        workspace_id: context.userB.workspaceId,
        name: 'Q4 2026 Cycle B',
        cycle_type: 'quarterly',
        start_date: '2026-10-01',
        end_date: '2026-12-31',
        status: 'active',
      }),
      updatePayloadA: { name: 'Compromised Cycle Name' },
    },
    () => ctx,
  );

  // 7. NS-23: Goals and Cycles Constraints & Business Rules
  describe('NS-23: Goals and Cycles Constraints & Business Rules', () => {
    it('enforces cycles date constraint: end_date >= start_date', async () => {
      const { userA } = ctx;
      const { error } = await userA.client.from('cycles').insert({
        workspace_id: userA.workspaceId,
        name: 'Invalid Date Cycle',
        cycle_type: 'quarterly',
        start_date: '2026-12-31',
        end_date: '2026-01-01',
        status: 'planned',
      });
      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/cycles_dates_order_check/i);
    });

    it('enforces goals priority check constraint (including none)', async () => {
      const { userA } = ctx;
      // 'none' priority is valid and accepted
      const { data: goalNone, error: noneErr } = await userA.client
        .from('goals')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Goal with priority none',
          priority: 'none',
        })
        .select()
        .single();

      expect(noneErr).toBeNull();
      expect(goalNone?.priority).toBe('none');

      // Invalid priority rejected
      const { error: invalidErr } = await userA.client.from('goals').insert({
        workspace_id: userA.workspaceId,
        title: 'Goal with invalid priority',
        priority: 'super-urgent' as never,
      });
      expect(invalidErr).not.toBeNull();
    });

    it('enforces goals date constraint: target_date >= start_date', async () => {
      const { userA } = ctx;
      const { error } = await userA.client.from('goals').insert({
        workspace_id: userA.workspaceId,
        title: 'Invalid Goal Dates',
        start_date: '2026-12-31',
        target_date: '2026-01-01',
      });
      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/goals_dates_order_check/i);
    });
  });
});
