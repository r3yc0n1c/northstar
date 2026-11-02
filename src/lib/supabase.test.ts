import { describe, expect, it } from 'vitest';
import { supabase, checkSupabaseConnection } from './supabase';

describe('Supabase Client & Dev Connectivity', () => {
  it('instantiates the supabase client', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
  });

  it('runs dev connectivity check', async () => {
    const result = await checkSupabaseConnection();
    expect(result).toBeDefined();
    expect(typeof result.ok).toBe('boolean');
    expect(typeof result.message).toBe('string');
  });
});
