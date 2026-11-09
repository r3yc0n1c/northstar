import { describe, expect, it } from 'vitest';
import type { TwoUserContext } from './auth';

export interface CompositeFkConfig {
  foreignKeyColumn: string;
  parentTable: string;
  createParentRowA: (ctx: TwoUserContext) => Record<string, unknown>;
  createParentRowB: (ctx: TwoUserContext) => Record<string, unknown>;
}

export interface TableMatrixConfig<TRow extends Record<string, unknown> = Record<string, unknown>> {
  tableName: string;
  createRowA: (ctx: TwoUserContext, parentRowA?: Record<string, unknown>) => Partial<TRow>;
  createRowB: (ctx: TwoUserContext, parentRowB?: Record<string, unknown>) => Partial<TRow>;
  updatePayloadA?: Partial<TRow>;
  compositeForeignKey?: CompositeFkConfig;
  /** Set to true for append-only tables (like kr_check_ins) where no UPDATE or DELETE is permitted */
  immutable?: boolean;
}

/**
 * Runs a standardized two-user RLS and constraint test suite for any workspace-scoped table.
 * Verifies:
 * 1. Read isolation: User A sees zero rows of User B
 * 2. Write isolation (WITH CHECK): User A cannot insert into User B's workspace
 * 3. Update isolation: User A cannot update User B's row
 * 4. Delete isolation: User A cannot delete User B's row
 * 5. Composite foreign key integrity: Cross-workspace parent reference is rejected by Postgres
 */
export function testTableIsolation<TRow extends Record<string, unknown>>(
  config: TableMatrixConfig<TRow>,
  getContext: () => TwoUserContext,
) {
  describe(`Table RLS isolation: ${config.tableName}`, () => {
    it(`enforces strict read, write, update, and delete isolation between workspaces`, async () => {
      const ctx = getContext();
      const { userA, userB } = ctx;

      let parentA: Record<string, unknown> | undefined;
      let parentB: Record<string, unknown> | undefined;

      // If table depends on a parent table via composite foreign key, insert parent rows first
      if (config.compositeForeignKey) {
        const { parentTable, createParentRowA, createParentRowB } = config.compositeForeignKey;

        const { data: pA, error: pAErr } = await userA.client
          .from(parentTable)
          .insert(createParentRowA(ctx))
          .select()
          .single();
        expect(pAErr).toBeNull();
        parentA = pA as Record<string, unknown>;

        const { data: pB, error: pBErr } = await userB.client
          .from(parentTable)
          .insert(createParentRowB(ctx))
          .select()
          .single();
        expect(pBErr).toBeNull();
        parentB = pB as Record<string, unknown>;
      }

      // 1. Insert row for User A
      const payloadA = config.createRowA(ctx, parentA);
      const { data: rowA, error: errA } = await userA.client
        .from(config.tableName)
        .insert(payloadA as never)
        .select()
        .single();
      expect(errA).toBeNull();
      expect(rowA).toBeDefined();
      const rowAId = (rowA as Record<string, unknown>).id as string;

      // 2. Insert row for User B
      const payloadB = config.createRowB(ctx, parentB);
      const { data: rowB, error: errB } = await userB.client
        .from(config.tableName)
        .insert(payloadB as never)
        .select()
        .single();
      expect(errB).toBeNull();
      expect(rowB).toBeDefined();
      const rowBId = (rowB as Record<string, unknown>).id as string;

      // 3. READ ISOLATION: User A must see zero rows belonging to User B
      const { data: rowsSeenByA, error: selectAErr } = await userA.client
        .from(config.tableName)
        .select('*');
      expect(selectAErr).toBeNull();
      const seenIdsByA = (rowsSeenByA as Array<Record<string, unknown>>).map((r) => r.id);
      expect(seenIdsByA).toContain(rowAId);
      expect(seenIdsByA).not.toContain(rowBId);

      // User A querying directly by User B's row ID returns nothing
      const { data: directQueryB } = await userA.client
        .from(config.tableName)
        .select('*')
        .eq('id', rowBId);
      expect(directQueryB).toHaveLength(0);

      // User B must see zero rows belonging to User A
      const { data: rowsSeenByB, error: selectBErr } = await userB.client
        .from(config.tableName)
        .select('*');
      expect(selectBErr).toBeNull();
      const seenIdsByB = (rowsSeenByB as Array<Record<string, unknown>>).map((r) => r.id);
      expect(seenIdsByB).toContain(rowBId);
      expect(seenIdsByB).not.toContain(rowAId);

      // 4. WRITE ISOLATION: User A attempting to insert into User B's workspace must fail WITH CHECK
      const crossWorkspacePayload = {
        ...payloadA,
        workspace_id: userB.workspaceId,
      };
      const { error: crossInsertErr } = await userA.client
        .from(config.tableName)
        .insert(crossWorkspacePayload as never);
      expect(crossInsertErr).not.toBeNull();
      // Error is either RLS policy violation or permission denied
      expect(
        crossInsertErr?.message.toLowerCase().includes('violates row-level security') ||
          crossInsertErr?.message.toLowerCase().includes('permission denied') ||
          crossInsertErr?.code === '42501',
      ).toBe(true);

      // 5. UPDATE ISOLATION: User A attempting to update User B's row must modify zero rows
      const updatePayload = (config.updatePayloadA || {
        name: 'Compromised',
      }) as unknown as Partial<TRow>;
      const { data: updatedByA } = await userA.client
        .from(config.tableName)
        .update(updatePayload as never)
        .eq('id', rowBId)
        .select();
      expect(updatedByA ?? []).toHaveLength(0);

      // Verify User B's row was not modified
      const { data: checkRowB } = await userB.client
        .from(config.tableName)
        .select('*')
        .eq('id', rowBId)
        .single();
      expect(checkRowB).toBeDefined();
      if (config.updatePayloadA) {
        for (const [key, value] of Object.entries(config.updatePayloadA)) {
          expect((checkRowB as Record<string, unknown>)[key]).not.toEqual(value);
        }
      }

      // 6. DELETE ISOLATION: User A attempting to delete User B's row must delete zero rows
      const { data: deletedByA } = await userA.client
        .from(config.tableName)
        .delete()
        .eq('id', rowBId)
        .select();
      expect(deletedByA ?? []).toHaveLength(0);

      // Verify User B's row is still intact
      const { data: checkRowBAfterDelete } = await userB.client
        .from(config.tableName)
        .select('*')
        .eq('id', rowBId);
      expect(checkRowBAfterDelete).toHaveLength(1);

      // 7. IMMUTABILITY: If marked immutable (e.g. kr_check_ins), owner update and delete must also fail
      if (config.immutable) {
        const { data: ownerUpdated } = await userA.client
          .from(config.tableName)
          .update(updatePayload as never)
          .eq('id', rowAId)
          .select();
        expect(ownerUpdated ?? []).toHaveLength(0);

        const { data: ownerDeleted } = await userA.client
          .from(config.tableName)
          .delete()
          .eq('id', rowAId)
          .select();
        expect(ownerDeleted ?? []).toHaveLength(0);
      }

      // 8. COMPOSITE FOREIGN KEY INTEGRITY: Cross-workspace parent reference is rejected
      if (config.compositeForeignKey && parentB) {
        const { foreignKeyColumn } = config.compositeForeignKey;
        const crossFkPayload = {
          ...payloadA,
          workspace_id: userA.workspaceId,
          [foreignKeyColumn]: parentB.id,
        };

        const { error: crossFkErr } = await userA.client
          .from(config.tableName)
          .insert(crossFkPayload as never);
        expect(crossFkErr).not.toBeNull();
        // Foreign key violation error code 23503
        expect(
          crossFkErr?.code === '23503' ||
            crossFkErr?.message.toLowerCase().includes('foreign key constraint'),
        ).toBe(true);
      }
    });
  });
}
