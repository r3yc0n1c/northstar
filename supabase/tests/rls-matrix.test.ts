import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import fixtures from '../../fixtures/kr-progress.json';
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

  // 7. Extensible Matrix Table: objectives (with composite foreign key to cycles)
  testTableIsolation(
    {
      tableName: 'objectives',
      compositeForeignKey: {
        parentTable: 'cycles',
        foreignKeyColumn: 'cycle_id',
        createParentRowA: (context) => ({
          workspace_id: context.userA.workspaceId,
          name: 'Parent Cycle A for Objectives',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        }),
        createParentRowB: (context) => ({
          workspace_id: context.userB.workspaceId,
          name: 'Parent Cycle B for Objectives',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        }),
      },
      createRowA: (context, parentA) => ({
        workspace_id: context.userA.workspaceId,
        cycle_id: parentA?.id as string,
        title: 'Launch MVP to First 50 Users A',
        status: 'active',
        priority: 'high',
        confidence: 8,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      createRowB: (context, parentB) => ({
        workspace_id: context.userB.workspaceId,
        cycle_id: parentB?.id as string,
        title: 'Achieve 99.9% Uptime B',
        status: 'active',
        priority: 'medium',
        confidence: 7,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      updatePayloadA: { title: 'Compromised Objective Title' },
    },
    () => ctx,
  );

  // 8. Extensible Matrix Table: key_results (with composite foreign key to objectives)
  testTableIsolation(
    {
      tableName: 'key_results',
      compositeForeignKey: {
        parentTable: 'objectives',
        foreignKeyColumn: 'objective_id',
        createParentRowA: async (context) => {
          const { data: cycle } = await context.userA.client
            .from('cycles')
            .insert({
              workspace_id: context.userA.workspaceId,
              name: 'Parent Cycle for KR Isolation A',
              cycle_type: 'quarterly',
              start_date: '2026-10-01',
              end_date: '2026-12-31',
              status: 'active',
            })
            .select()
            .single();

          return {
            workspace_id: context.userA.workspaceId,
            cycle_id: cycle?.id,
            title: 'Parent Objective for KR A',
            status: 'active',
            priority: 'high',
            confidence: 8,
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          };
        },
        createParentRowB: async (context) => {
          const { data: cycle } = await context.userB.client
            .from('cycles')
            .insert({
              workspace_id: context.userB.workspaceId,
              name: 'Parent Cycle for KR Isolation B',
              cycle_type: 'quarterly',
              start_date: '2026-10-01',
              end_date: '2026-12-31',
              status: 'active',
            })
            .select()
            .single();

          return {
            workspace_id: context.userB.workspaceId,
            cycle_id: cycle?.id,
            title: 'Parent Objective for KR B',
            status: 'active',
            priority: 'medium',
            confidence: 7,
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          };
        },
      },
      createRowA: (context, parentA) => ({
        workspace_id: context.userA.workspaceId,
        objective_id: parentA?.id as string,
        title: 'Acquire 100 Power Users A',
        metric_type: 'numeric',
        baseline_value: 0,
        current_value: 25,
        target_value: 100,
        unit: 'users',
        direction: 'increase',
        confidence: 8,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      createRowB: (context, parentB) => ({
        workspace_id: context.userB.workspaceId,
        objective_id: parentB?.id as string,
        title: 'Launch SOC2 Compliance B',
        metric_type: 'binary',
        baseline_value: 0,
        current_value: 0,
        target_value: 1,
        unit: '',
        confidence: 9,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      updatePayloadA: { title: 'Compromised KR Title' },
    },
    () => ctx,
  );

  // 9. Extensible Matrix Table: kr_check_ins (with composite foreign key to key_results, immutable = true)
  testTableIsolation(
    {
      tableName: 'kr_check_ins',
      immutable: true,
      compositeForeignKey: {
        parentTable: 'key_results',
        foreignKeyColumn: 'key_result_id',
        createParentRowA: async (context) => {
          const { data: cycle } = await context.userA.client
            .from('cycles')
            .insert({
              workspace_id: context.userA.workspaceId,
              name: 'Parent Cycle for Checkin Isolation A',
              cycle_type: 'quarterly',
              start_date: '2026-10-01',
              end_date: '2026-12-31',
              status: 'active',
            })
            .select()
            .single();

          const { data: objective } = await context.userA.client
            .from('objectives')
            .insert({
              workspace_id: context.userA.workspaceId,
              cycle_id: cycle?.id,
              title: 'Parent Objective for Checkin A',
              start_date: '2026-10-01',
              due_date: '2026-12-31',
            })
            .select()
            .single();

          return {
            workspace_id: context.userA.workspaceId,
            objective_id: objective?.id,
            title: 'Parent KR for Checkin A',
            metric_type: 'numeric',
            baseline_value: 0,
            current_value: 10,
            target_value: 100,
            unit: 'users',
            direction: 'increase',
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          };
        },
        createParentRowB: async (context) => {
          const { data: cycle } = await context.userB.client
            .from('cycles')
            .insert({
              workspace_id: context.userB.workspaceId,
              name: 'Parent Cycle for Checkin Isolation B',
              cycle_type: 'quarterly',
              start_date: '2026-10-01',
              end_date: '2026-12-31',
              status: 'active',
            })
            .select()
            .single();

          const { data: objective } = await context.userB.client
            .from('objectives')
            .insert({
              workspace_id: context.userB.workspaceId,
              cycle_id: cycle?.id,
              title: 'Parent Objective for Checkin B',
              start_date: '2026-10-01',
              due_date: '2026-12-31',
            })
            .select()
            .single();

          return {
            workspace_id: context.userB.workspaceId,
            objective_id: objective?.id,
            title: 'Parent KR for Checkin B',
            metric_type: 'numeric',
            baseline_value: 0,
            current_value: 20,
            target_value: 100,
            unit: 'users',
            direction: 'increase',
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          };
        },
      },
      createRowA: (context, parentA) => ({
        workspace_id: context.userA.workspaceId,
        key_result_id: parentA?.id as string,
        value: 25,
        raw_progress_percent: 25,
        progress_percent: 25,
        confidence: 8,
        notes: 'Initial progress checkin A',
        recorded_by: context.userA.id,
      }),
      createRowB: (context, parentB) => ({
        workspace_id: context.userB.workspaceId,
        key_result_id: parentB?.id as string,
        value: 30,
        raw_progress_percent: 30,
        progress_percent: 30,
        confidence: 7,
        notes: 'Initial progress checkin B',
        recorded_by: context.userB.id,
      }),
      updatePayloadA: { notes: 'Attempted to edit check-in notes' },
    },
    () => ctx,
  );

  // 8. NS-23: Goals and Cycles Constraints & Business Rules
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

  // 9. NS-24: Objectives Constraints & Composite FK Rules
  describe('NS-24: Objectives Constraints & Composite FK Rules', () => {
    it('enforces confidence check between 1 and 10', async () => {
      const { userA } = ctx;
      // First create a cycle for user A
      const { data: cycle } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Cycle for Confidence Check',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      expect(cycle).toBeDefined();

      // Confidence = 0 rejected
      const { error: lowErr } = await userA.client.from('objectives').insert({
        workspace_id: userA.workspaceId,
        cycle_id: cycle?.id,
        title: 'Low Confidence Objective',
        confidence: 0,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(lowErr).not.toBeNull();
      expect(lowErr?.message).toMatch(/objectives_confidence_check/i);

      // Confidence = 11 rejected
      const { error: highErr } = await userA.client.from('objectives').insert({
        workspace_id: userA.workspaceId,
        cycle_id: cycle?.id,
        title: 'High Confidence Objective',
        confidence: 11,
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });
      expect(highErr).not.toBeNull();
      expect(highErr?.message).toMatch(/objectives_confidence_check/i);

      // Confidence = 9 accepted
      const { data: validObj, error: validErr } = await userA.client
        .from('objectives')
        .insert({
          workspace_id: userA.workspaceId,
          cycle_id: cycle?.id,
          title: 'Valid Confidence Objective',
          confidence: 9,
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();
      expect(validErr).toBeNull();
      expect(validObj?.confidence).toBe(9);
    });

    it('enforces objectives date constraint: due_date >= start_date', async () => {
      const { userA } = ctx;
      const { data: cycle } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Cycle for Date Check',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      const { error } = await userA.client.from('objectives').insert({
        workspace_id: userA.workspaceId,
        cycle_id: cycle?.id,
        title: 'Invalid Date Objective',
        start_date: '2026-12-31',
        due_date: '2026-10-01',
      });
      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/objectives_dates_order_check/i);
    });

    it('rejects cross-workspace parent goal reference via composite foreign key', async () => {
      const { userA, userB } = ctx;

      // Cycle for User A
      const { data: cycleA } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Cycle A',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      // Goal for User B
      const { data: goalB } = await userB.client
        .from('goals')
        .insert({
          workspace_id: userB.workspaceId,
          title: 'Goal B of User B',
        })
        .select()
        .single();

      // User A attempts to link their objective to User B's goal
      const { error } = await userA.client.from('objectives').insert({
        workspace_id: userA.workspaceId,
        cycle_id: cycleA?.id,
        goal_id: goalB?.id,
        title: 'Cross Workspace Objective',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      });

      expect(error).not.toBeNull();
      expect(error?.message).toMatch(/fk_objectives_goal_workspace|violates foreign key/i);
    });
  });

  // 10. NS-25: Key Results SQL kr_progress & Check Constraints
  describe('NS-25: Key Results SQL kr_progress & Check Constraints', () => {
    describe('SQL kr_progress against shared fixtures', () => {
      for (const testCase of fixtures.progressCases) {
        it(`SQL kr_progress evaluates fixture: ${testCase.id} (${testCase.description})`, async () => {
          const { userA } = ctx;
          const { data, error } = await userA.client.rpc('kr_progress', {
            baseline: testCase.baseline,
            current: testCase.current,
            target: testCase.target,
            direction: testCase.direction,
            metric_type: testCase.metricType,
          });

          expect(error).toBeNull();
          expect(Number(data)).toBeCloseTo(testCase.expectedRaw, 2);
        });
      }
    });

    describe('key_results check constraints', () => {
      it('enforces numeric metric rules: target <> baseline and direction consistency', async () => {
        const { userA } = ctx;

        // Set up cycle and objective for userA
        const { data: cycle } = await userA.client
          .from('cycles')
          .insert({
            workspace_id: userA.workspaceId,
            name: 'KR Constraint Test Cycle',
            cycle_type: 'quarterly',
            start_date: '2026-10-01',
            end_date: '2026-12-31',
            status: 'active',
          })
          .select()
          .single();

        const { data: objective } = await userA.client
          .from('objectives')
          .insert({
            workspace_id: userA.workspaceId,
            cycle_id: cycle?.id,
            title: 'KR Constraint Test Objective',
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          })
          .select()
          .single();

        // 1. Target equals baseline rejected
        const { error: equalErr } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Equal Baseline Target KR',
          metric_type: 'numeric',
          baseline_value: 100,
          current_value: 100,
          target_value: 100,
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        });
        expect(equalErr).not.toBeNull();
        expect(equalErr?.message).toMatch(/key_results_numeric_metric_check/i);

        // 2. Increase with target < baseline rejected
        const { error: incErr } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Invalid Increase KR',
          metric_type: 'numeric',
          baseline_value: 100,
          current_value: 80,
          target_value: 50,
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        });
        expect(incErr).not.toBeNull();
        expect(incErr?.message).toMatch(/key_results_numeric_metric_check/i);

        // 3. Decrease with target > baseline rejected
        const { error: decErr } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Invalid Decrease KR',
          metric_type: 'numeric',
          baseline_value: 50,
          current_value: 80,
          target_value: 100,
          direction: 'decrease',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        });
        expect(decErr).not.toBeNull();
        expect(decErr?.message).toMatch(/key_results_numeric_metric_check/i);
      });

      it('enforces binary metric rules: baseline=0, target=1, current in (0,1), direction=null', async () => {
        const { userA } = ctx;

        const { data: cycle } = await userA.client
          .from('cycles')
          .insert({
            workspace_id: userA.workspaceId,
            name: 'Binary KR Test Cycle',
            cycle_type: 'quarterly',
            start_date: '2026-10-01',
            end_date: '2026-12-31',
            status: 'active',
          })
          .select()
          .single();

        const { data: objective } = await userA.client
          .from('objectives')
          .insert({
            workspace_id: userA.workspaceId,
            cycle_id: cycle?.id,
            title: 'Binary KR Test Objective',
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          })
          .select()
          .single();

        // 1. Binary with direction not null rejected
        const { error: dirErr } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Binary With Direction',
          metric_type: 'binary',
          baseline_value: 0,
          current_value: 0,
          target_value: 1,
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        });
        expect(dirErr).not.toBeNull();
        expect(dirErr?.message).toMatch(/key_results_binary_metric_check/i);

        // 2. Binary with current > 1 rejected
        const { error: currErr } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Binary With Current 2',
          metric_type: 'binary',
          baseline_value: 0,
          current_value: 2,
          target_value: 1,
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        });
        expect(currErr).not.toBeNull();
        expect(currErr?.message).toMatch(/key_results_binary_metric_check/i);

        // 3. Valid binary KR accepted
        const { data: validBinary, error: validErr } = await userA.client
          .from('key_results')
          .insert({
            workspace_id: userA.workspaceId,
            objective_id: objective?.id,
            title: 'Complete SOC2 Audit',
            metric_type: 'binary',
            baseline_value: 0,
            current_value: 1,
            target_value: 1,
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          })
          .select()
          .single();
        expect(validErr).toBeNull();
        expect(validBinary?.current_value).toBe(1);
      });

      it('enforces key_results date constraint: due_date >= start_date', async () => {
        const { userA } = ctx;

        const { data: cycle } = await userA.client
          .from('cycles')
          .insert({
            workspace_id: userA.workspaceId,
            name: 'KR Date Test Cycle',
            cycle_type: 'quarterly',
            start_date: '2026-10-01',
            end_date: '2026-12-31',
            status: 'active',
          })
          .select()
          .single();

        const { data: objective } = await userA.client
          .from('objectives')
          .insert({
            workspace_id: userA.workspaceId,
            cycle_id: cycle?.id,
            title: 'KR Date Test Objective',
            start_date: '2026-10-01',
            due_date: '2026-12-31',
          })
          .select()
          .single();

        const { error } = await userA.client.from('key_results').insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Invalid Date KR',
          metric_type: 'numeric',
          baseline_value: 0,
          current_value: 10,
          target_value: 100,
          direction: 'increase',
          start_date: '2026-12-31',
          due_date: '2026-10-01',
        });
        expect(error).not.toBeNull();
        expect(error?.message).toMatch(/key_results_dates_order_check/i);
      });
    });
  });

  // 11. NS-26: Key Results Append-Only Check-ins & Atomic RPC
  describe('NS-26: Key Results Append-Only Check-ins & Atomic RPC', () => {
    it('executes record_kr_check_in and atomically updates key_results.current_value', async () => {
      const { userA } = ctx;

      const { data: cycle } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Checkin Cycle',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      const { data: objective } = await userA.client
        .from('objectives')
        .insert({
          workspace_id: userA.workspaceId,
          cycle_id: cycle?.id,
          title: 'Checkin Test Objective',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();

      const { data: kr } = await userA.client
        .from('key_results')
        .insert({
          workspace_id: userA.workspaceId,
          objective_id: objective?.id,
          title: 'Reach 1,000 active users',
          metric_type: 'numeric',
          baseline_value: 0,
          current_value: 0,
          target_value: 1000,
          unit: 'users',
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();

      expect(kr?.current_value).toBe(0);

      // 1. Record first check-in: value = 400
      const { data: checkIn1, error: err1 } = await userA.client.rpc('record_kr_check_in', {
        p_key_result_id: kr?.id,
        p_value: 400,
        p_confidence: 8,
        p_notes: 'Mid-quarter milestone reached',
        p_evidence_url: 'https://example.com/telemetry',
      });

      expect(err1).toBeNull();
      expect(Number(checkIn1?.value)).toBe(400);
      expect(Number(checkIn1?.progress_percent)).toBe(40);
      expect(Number(checkIn1?.raw_progress_percent)).toBe(40);

      // Verify key_results.current_value is atomically updated to 400 and confidence to 8
      const { data: updatedKr1 } = await userA.client
        .from('key_results')
        .select('*')
        .eq('id', kr?.id)
        .single();
      expect(Number(updatedKr1?.current_value)).toBe(400);
      expect(updatedKr1?.confidence).toBe(8);

      // 2. Correction: record second check-in with supersedes_id
      const { data: correction, error: err2 } = await userA.client.rpc('record_kr_check_in', {
        p_key_result_id: kr?.id,
        p_value: 450,
        p_confidence: 9,
        p_notes: 'Correction: verified telemetry counted 50 additional active users',
        p_supersedes_id: checkIn1?.id,
      });

      expect(err2).toBeNull();
      expect(Number(correction?.value)).toBe(450);
      expect(correction?.supersedes_id).toBe(checkIn1?.id);

      // Verify key_results.current_value is updated to latest non-superseded value (450)
      const { data: updatedKr2 } = await userA.client
        .from('key_results')
        .select('*')
        .eq('id', kr?.id)
        .single();
      expect(Number(updatedKr2?.current_value)).toBe(450);
      expect(updatedKr2?.confidence).toBe(9);

      // Verify both check-ins remain in database (append-only history preserved)
      const { data: history } = await userA.client
        .from('kr_check_ins')
        .select('*')
        .eq('key_result_id', kr?.id)
        .order('recorded_at', { ascending: false });
      expect(history).toHaveLength(2);
    });

    it('denies direct UPDATE and DELETE on kr_check_ins', async () => {
      const { userA } = ctx;

      // Select existing check-in row
      const { data: checkIns } = await userA.client.from('kr_check_ins').select('*').limit(1);
      if (checkIns && checkIns.length > 0) {
        const checkInId = checkIns[0]?.id;

        // Direct update denied
        const { data: updated } = await userA.client
          .from('kr_check_ins')
          .update({ notes: 'Hacked Notes' })
          .eq('id', checkInId)
          .select();
        expect(updated ?? []).toHaveLength(0);

        // Direct delete denied
        const { data: deleted } = await userA.client
          .from('kr_check_ins')
          .delete()
          .eq('id', checkInId)
          .select();
        expect(deleted ?? []).toHaveLength(0);
      }
    });
  });

  // ==========================================
  // PHASE 3 RLS & CONSTRAINTS TESTS
  // ==========================================

  // 10. Extensible Matrix Table: projects
  testTableIsolation(
    {
      tableName: 'projects',
      createRowA: (context) => ({
        workspace_id: context.userA.workspaceId,
        title: 'Project Alpha A',
        description: 'Alpha project description',
        status: 'active',
        priority: 'high',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      createRowB: (context) => ({
        workspace_id: context.userB.workspaceId,
        title: 'Project Beta B',
        description: 'Beta project description',
        status: 'active',
        priority: 'medium',
        start_date: '2026-10-01',
        due_date: '2026-12-31',
      }),
      updatePayloadA: { title: 'Compromised Project' },
    },
    () => ctx,
  );

  // 11. Extensible Matrix Table: project_milestones (composite FK to projects)
  testTableIsolation(
    {
      tableName: 'project_milestones',
      compositeForeignKey: {
        parentTable: 'projects',
        foreignKeyColumn: 'project_id',
        createParentRowA: (context) => ({
          workspace_id: context.userA.workspaceId,
          title: 'Parent Project for Milestone A',
          status: 'active',
          priority: 'high',
        }),
        createParentRowB: (context) => ({
          workspace_id: context.userB.workspaceId,
          title: 'Parent Project for Milestone B',
          status: 'active',
          priority: 'medium',
        }),
      },
      createRowA: (context, parentA) => ({
        workspace_id: context.userA.workspaceId,
        project_id: parentA?.id as string,
        title: 'Milestone 1 A',
        status: 'open',
        sort_order: 1,
        due_date: '2026-11-15',
      }),
      createRowB: (context, parentB) => ({
        workspace_id: context.userB.workspaceId,
        project_id: parentB?.id as string,
        title: 'Milestone 1 B',
        status: 'open',
        sort_order: 1,
        due_date: '2026-11-20',
      }),
      updatePayloadA: { title: 'Compromised Milestone' },
    },
    () => ctx,
  );

  // 12. Extensible Matrix Table: labels
  testTableIsolation(
    {
      tableName: 'labels',
      createRowA: (context) => ({
        workspace_id: context.userA.workspaceId,
        name: 'Urgent Label A',
        color: '#E5707F',
      }),
      createRowB: (context) => ({
        workspace_id: context.userB.workspaceId,
        name: 'Feature Label B',
        color: '#5A4F7C',
      }),
      updatePayloadA: { name: 'Compromised Label' },
    },
    () => ctx,
  );

  // 13. Extensible Matrix Table: tasks
  testTableIsolation(
    {
      tableName: 'tasks',
      createRowA: (context) => ({
        workspace_id: context.userA.workspaceId,
        title: 'Stand-alone Task A',
        status: 'todo',
        priority: 'high',
        planned_date: '2026-11-15',
        due_date: '2026-11-20',
        estimated_minutes: 45,
      }),
      createRowB: (context) => ({
        workspace_id: context.userB.workspaceId,
        title: 'Stand-alone Task B',
        status: 'inbox',
        priority: 'medium',
        planned_date: '2026-11-16',
        due_date: '2026-11-25',
        estimated_minutes: 30,
      }),
      updatePayloadA: { title: 'Compromised Task Title' },
    },
    () => ctx,
  );

  // 14. Junction Table RLS & Integrity: project_objectives & project_key_results
  describe('Project Links RLS & Integrity', () => {
    it('enforces isolation and cross-workspace rejection on project_objectives', async () => {
      const { userA, userB } = ctx;

      // Create cycle, objective, and project for user A
      const { data: cycleA } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Cycle A for Link',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      const { data: objA } = await userA.client
        .from('objectives')
        .insert({
          workspace_id: userA.workspaceId,
          cycle_id: cycleA?.id,
          title: 'Objective A for Project Link',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();

      const { data: projA } = await userA.client
        .from('projects')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Project A for Link',
        })
        .select()
        .single();

      // Create project for user B
      const { data: projB } = await userB.client
        .from('projects')
        .insert({
          workspace_id: userB.workspaceId,
          title: 'Project B for Link',
        })
        .select()
        .single();

      // User A links their project to their objective -> succeeds
      const { data: linkA, error: linkAErr } = await userA.client
        .from('project_objectives')
        .insert({
          workspace_id: userA.workspaceId,
          project_id: projA?.id,
          objective_id: objA?.id,
        })
        .select()
        .single();

      expect(linkAErr).toBeNull();
      expect(linkA?.project_id).toBe(projA?.id);

      // User B cannot see User A's link
      const { data: linksSeenByB } = await userB.client
        .from('project_objectives')
        .select('*')
        .eq('project_id', projA?.id);
      expect(linksSeenByB).toHaveLength(0);

      // Cross-workspace rejection: User A cannot link their project to User B's project or vice versa
      const { error: crossLinkErr } = await userA.client.from('project_objectives').insert({
        workspace_id: userA.workspaceId,
        project_id: projB?.id, // User B's project with User A's workspace
        objective_id: objA?.id,
      });
      expect(crossLinkErr).not.toBeNull();
    });

    it('enforces isolation and cross-workspace rejection on project_key_results', async () => {
      const { userA, userB } = ctx;

      const { data: cycleA } = await userA.client
        .from('cycles')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Cycle A for KR Link',
          cycle_type: 'quarterly',
          start_date: '2026-10-01',
          end_date: '2026-12-31',
          status: 'active',
        })
        .select()
        .single();

      const { data: objA } = await userA.client
        .from('objectives')
        .insert({
          workspace_id: userA.workspaceId,
          cycle_id: cycleA?.id,
          title: 'Objective A for KR Link',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();

      const { data: krA } = await userA.client
        .from('key_results')
        .insert({
          workspace_id: userA.workspaceId,
          objective_id: objA?.id,
          title: 'KR A for Project Link',
          metric_type: 'numeric',
          baseline_value: 0,
          current_value: 0,
          target_value: 100,
          unit: 'units',
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        })
        .select()
        .single();

      const { data: projA } = await userA.client
        .from('projects')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Project A for KR Link',
        })
        .select()
        .single();

      const { data: projB } = await userB.client
        .from('projects')
        .insert({
          workspace_id: userB.workspaceId,
          title: 'Project B for KR Link',
        })
        .select()
        .single();

      // Valid link in User A's workspace
      const { data: linkA, error: linkAErr } = await userA.client
        .from('project_key_results')
        .insert({
          workspace_id: userA.workspaceId,
          project_id: projA?.id,
          key_result_id: krA?.id,
        })
        .select()
        .single();

      expect(linkAErr).toBeNull();
      expect(linkA?.project_id).toBe(projA?.id);

      // User B cannot see it
      const { data: linksB } = await userB.client
        .from('project_key_results')
        .select('*')
        .eq('project_id', projA?.id);
      expect(linksB).toHaveLength(0);

      // Cross-workspace composite FK rejection
      const { error: crossErr } = await userA.client.from('project_key_results').insert({
        workspace_id: userA.workspaceId,
        project_id: projB?.id,
        key_result_id: krA?.id,
      });
      expect(crossErr).not.toBeNull();
    });

    it('enforces isolation on task_labels', async () => {
      const { userA, userB } = ctx;

      const { data: taskA } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Task for Labeling A',
        })
        .select()
        .single();

      const { data: labelA } = await userA.client
        .from('labels')
        .insert({
          workspace_id: userA.workspaceId,
          name: 'Backend Dev',
        })
        .select()
        .single();

      const { data: labelB } = await userB.client
        .from('labels')
        .insert({
          workspace_id: userB.workspaceId,
          name: 'Frontend Dev',
        })
        .select()
        .single();

      // Valid task_label link
      const { data: tlA, error: tlAErr } = await userA.client
        .from('task_labels')
        .insert({
          workspace_id: userA.workspaceId,
          task_id: taskA?.id,
          label_id: labelA?.id,
        })
        .select()
        .single();

      expect(tlAErr).toBeNull();
      expect(tlA?.task_id).toBe(taskA?.id);

      // Cross-workspace rejection: cannot link user A's task to user B's label
      const { error: crossTlErr } = await userA.client.from('task_labels').insert({
        workspace_id: userA.workspaceId,
        task_id: taskA?.id,
        label_id: labelB?.id,
      });
      expect(crossTlErr).not.toBeNull();
    });
  });

  // 15. Task & Milestone Triggers & Constraints
  describe('Task & Milestone Triggers & Constraints', () => {
    it('sets completed_at on transition to done and clears it on reopen for tasks', async () => {
      const { userA } = ctx;

      // 1. Create task with status 'todo'
      const { data: task, error: createErr } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Completion Trigger Test Task',
          status: 'todo',
        })
        .select()
        .single();

      expect(createErr).toBeNull();
      expect(task?.completed_at).toBeNull();

      // 2. Transition to 'done' -> completed_at is automatically populated
      const { data: completedTask, error: completeErr } = await userA.client
        .from('tasks')
        .update({ status: 'done' })
        .eq('id', task?.id)
        .select()
        .single();

      expect(completeErr).toBeNull();
      expect(completedTask?.completed_at).not.toBeNull();

      // 3. Reopen task to 'in_progress' -> completed_at is automatically cleared
      const { data: reopenedTask, error: reopenErr } = await userA.client
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', task?.id)
        .select()
        .single();

      expect(reopenErr).toBeNull();
      expect(reopenedTask?.completed_at).toBeNull();
    });

    it('sets completed_at on transition to done and clears it on reopen for milestones', async () => {
      const { userA } = ctx;

      const { data: proj } = await userA.client
        .from('projects')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Milestone Trigger Test Project',
        })
        .select()
        .single();

      const { data: milestone, error: createErr } = await userA.client
        .from('project_milestones')
        .insert({
          workspace_id: userA.workspaceId,
          project_id: proj?.id,
          title: 'Milestone Alpha',
          status: 'open',
        })
        .select()
        .single();

      expect(createErr).toBeNull();
      expect(milestone?.completed_at).toBeNull();

      // Transition to 'done'
      const { data: completedM } = await userA.client
        .from('project_milestones')
        .update({ status: 'done' })
        .eq('id', milestone?.id)
        .select()
        .single();

      expect(completedM?.completed_at).not.toBeNull();

      // Reopen to 'open'
      const { data: reopenedM } = await userA.client
        .from('project_milestones')
        .update({ status: 'open' })
        .eq('id', milestone?.id)
        .select()
        .single();

      expect(reopenedM?.completed_at).toBeNull();
    });

    it('increments task version on update for optimistic concurrency', async () => {
      const { userA } = ctx;

      const { data: task } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Version Increment Task',
        })
        .select()
        .single();

      expect(task?.version).toBe(1);

      const { data: updated1 } = await userA.client
        .from('tasks')
        .update({ title: 'Version Increment Task (Updated)' })
        .eq('id', task?.id)
        .select()
        .single();

      expect(updated1?.version).toBe(2);

      const { data: updated2 } = await userA.client
        .from('tasks')
        .update({ priority: 'urgent' })
        .eq('id', task?.id)
        .select()
        .single();

      expect(updated2?.version).toBe(3);
    });

    it('enforces single-level subtask depth rule and rejects self-parenting', async () => {
      const { userA } = ctx;

      // 1. Create parent task
      const { data: parentTask } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Top Level Parent Task',
        })
        .select()
        .single();

      // Self-parenting rejected
      const { error: selfParentErr } = await userA.client
        .from('tasks')
        .update({ parent_task_id: parentTask?.id })
        .eq('id', parentTask?.id);
      expect(selfParentErr).not.toBeNull();

      // 2. Create valid level-1 subtask
      const { data: subtask, error: subtaskErr } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          parent_task_id: parentTask?.id,
          title: 'Level 1 Subtask',
        })
        .select()
        .single();

      expect(subtaskErr).toBeNull();
      expect(subtask?.parent_task_id).toBe(parentTask?.id);

      // 3. Attempt to create level-2 subtask (parent is already a subtask) -> rejected
      const { error: level2Err } = await userA.client.from('tasks').insert({
        workspace_id: userA.workspaceId,
        parent_task_id: subtask?.id,
        title: 'Level 2 Subtask (Should Fail)',
      });

      expect(level2Err).not.toBeNull();
      expect(level2Err?.message).toContain('Subtask depth exceeded');

      // 4. Attempt to make parentTask a subtask of another task -> rejected because it has children
      const { data: grandParent } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Another Top Level Task',
        })
        .select()
        .single();

      const { error: makeParentSubtaskErr } = await userA.client
        .from('tasks')
        .update({ parent_task_id: grandParent?.id })
        .eq('id', parentTask?.id);

      expect(makeParentSubtaskErr).not.toBeNull();
      expect(makeParentSubtaskErr?.message).toContain(
        'Task with subtasks cannot be made a subtask',
      );
    });

    it('validates planned_end_at > planned_start_at', async () => {
      const { userA } = ctx;

      // Equal or earlier planned_end_at rejected
      const { error: invalidTimeErr } = await userA.client.from('tasks').insert({
        workspace_id: userA.workspaceId,
        title: 'Invalid Time Task',
        planned_start_at: '14:00:00',
        planned_end_at: '13:00:00',
      });
      expect(invalidTimeErr).not.toBeNull();

      const { error: equalTimeErr } = await userA.client.from('tasks').insert({
        workspace_id: userA.workspaceId,
        title: 'Equal Time Task',
        planned_start_at: '14:00:00',
        planned_end_at: '14:00:00',
      });
      expect(equalTimeErr).not.toBeNull();

      // planned_end_at > planned_start_at succeeds
      const { data: validTimeTask, error: validTimeErr } = await userA.client
        .from('tasks')
        .insert({
          workspace_id: userA.workspaceId,
          title: 'Valid Time Task',
          planned_start_at: '14:00:00',
          planned_end_at: '15:30:00',
        })
        .select()
        .single();

      expect(validTimeErr).toBeNull();
      expect(validTimeTask?.planned_start_at).toBe('14:00:00');
      expect(validTimeTask?.planned_end_at).toBe('15:30:00');
    });

    it('enforces case-insensitive uniqueness of label names per workspace', async () => {
      const { userA } = ctx;

      const { error: err1 } = await userA.client.from('labels').insert({
        workspace_id: userA.workspaceId,
        name: 'UniqueLabel',
      });
      expect(err1).toBeNull();

      // Same workspace, different casing -> rejected
      const { error: err2 } = await userA.client.from('labels').insert({
        workspace_id: userA.workspaceId,
        name: 'uniquelabel',
      });
      expect(err2).not.toBeNull();
    });

    it('rejects cross-workspace foreign key references for tasks', async () => {
      const { userA, userB } = ctx;

      // Project in User B's workspace
      const { data: projB } = await userB.client
        .from('projects')
        .insert({
          workspace_id: userB.workspaceId,
          title: 'User B Project',
        })
        .select()
        .single();

      // Task in User A's workspace referencing User B's project -> rejected by composite FK
      const { error: crossProjErr } = await userA.client.from('tasks').insert({
        workspace_id: userA.workspaceId,
        project_id: projB?.id,
        title: 'Cross Project Task',
      });
      expect(crossProjErr).not.toBeNull();

      // Task in User B's workspace
      const { data: taskB } = await userB.client
        .from('tasks')
        .insert({
          workspace_id: userB.workspaceId,
          title: 'User B Task',
        })
        .select()
        .single();

      // Task in User A's workspace referencing User B's task as parent -> rejected by composite FK
      const { error: crossParentErr } = await userA.client.from('tasks').insert({
        workspace_id: userA.workspaceId,
        parent_task_id: taskB?.id,
        title: 'Cross Parent Task',
      });
      expect(crossParentErr).not.toBeNull();
    });
  });
});
