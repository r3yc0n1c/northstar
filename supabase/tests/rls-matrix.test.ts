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
});
