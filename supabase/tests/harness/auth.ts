import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export interface TestUser {
  id: string;
  email: string;
  workspaceId: string;
  client: SupabaseClient;
}

export interface TwoUserContext {
  userA: TestUser;
  userB: TestUser;
  adminClient: SupabaseClient;
  cleanup: () => Promise<void>;
}

export function isLocalSupabase(): boolean {
  return SUPABASE_URL.includes('127.0.0.1') || SUPABASE_URL.includes('localhost');
}

export async function isSupabaseAvailable(): Promise<boolean> {
  if (!isLocalSupabase()) return false;
  if (!SERVICE_ROLE_KEY || !ANON_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(1500),
    });
    return res.ok || res.status === 200;
  } catch {
    return false;
  }
}

export async function setupTwoTestUsers(): Promise<TwoUserContext> {
  if (!isLocalSupabase()) {
    throw new Error(
      `Refusing to run two-user RLS test harness against non-local Supabase URL: ${SUPABASE_URL}`,
    );
  }
  if (!SERVICE_ROLE_KEY || !ANON_KEY) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_PUBLISHABLE_KEY in environment. Ensure .env.local has both keys configured.',
    );
  }

  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const password = 'TestPassword123!';
  const emailA = `rls-user-a-${uniqueId}@example.com`;
  const emailB = `rls-user-b-${uniqueId}@example.com`;

  // Create User A
  const { data: dataA, error: errA } = await adminClient.auth.admin.createUser({
    email: emailA,
    password,
    email_confirm: true,
  });
  if (errA || !dataA.user) {
    throw new Error(`Failed to create test user A: ${errA?.message}`);
  }
  const userAId = dataA.user.id;

  // Create User B
  const { data: dataB, error: errB } = await adminClient.auth.admin.createUser({
    email: emailB,
    password,
    email_confirm: true,
  });
  if (errB || !dataB.user) {
    await adminClient.auth.admin.deleteUser(userAId);
    throw new Error(`Failed to create test user B: ${errB?.message}`);
  }
  const userBId = dataB.user.id;

  try {
    // Authenticate Client A
    const clientA = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: signInAErr } = await clientA.auth.signInWithPassword({
      email: emailA,
      password,
    });
    if (signInAErr) throw signInAErr;

    // Authenticate Client B
    const clientB = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: signInBErr } = await clientB.auth.signInWithPassword({
      email: emailB,
      password,
    });
    if (signInBErr) throw signInBErr;

    // Fetch workspaces provisioned by handle_new_user trigger
    const { data: wsA, error: wsAErr } = await clientA.from('workspaces').select('id, owner_id');
    if (wsAErr || !wsA || wsA.length === 0) {
      throw new Error(`Failed to get workspace for user A: ${wsAErr?.message}`);
    }

    const { data: wsB, error: wsBErr } = await clientB.from('workspaces').select('id, owner_id');
    if (wsBErr || !wsB || wsB.length === 0) {
      throw new Error(`Failed to get workspace for user B: ${wsBErr?.message}`);
    }

    const firstWsA = wsA[0];
    const firstWsB = wsB[0];
    if (!firstWsA || !firstWsB) {
      throw new Error('Workspace not provisioned');
    }

    const cleanup = async () => {
      await adminClient.auth.admin.deleteUser(userAId);
      await adminClient.auth.admin.deleteUser(userBId);
    };

    return {
      userA: {
        id: userAId,
        email: emailA,
        workspaceId: firstWsA.id,
        client: clientA,
      },
      userB: {
        id: userBId,
        email: emailB,
        workspaceId: firstWsB.id,
        client: clientB,
      },
      adminClient,
      cleanup,
    };
  } catch (error) {
    await adminClient.auth.admin.deleteUser(userAId);
    await adminClient.auth.admin.deleteUser(userBId);
    throw error;
  }
}
