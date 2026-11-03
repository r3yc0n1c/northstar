import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import { AuthProvider } from '../context/AuthContext';
import { PublicOnlyRoute } from './PublicOnlyRoute';

function makeMockSession(confirmed: boolean): Session {
  const user: User = {
    id: 'usr_test_123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'pilot@northstar.app',
    email_confirmed_at: confirmed ? '2026-11-03T10:00:00Z' : undefined,
  };

  return {
    access_token: 'fake_access_token',
    refresh_token: 'fake_refresh_token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  };
}

describe('PublicOnlyRoute', () => {
  it('allows unauthenticated visitors to view public auth route', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/sign-up']}>
          <Routes>
            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth/sign-up" element={<div>Sign Up Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Sign Up Screen')).toBeInTheDocument();
  });

  it('redirects authenticated & verified users to /today (FR-AUTH-7)', () => {
    const session = makeMockSession(true);

    render(
      <AuthProvider initialSession={session} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/sign-up']}>
          <Routes>
            <Route path="/today" element={<div>Today Dashboard</div>} />
            <Route element={<PublicOnlyRoute />}>
              <Route path="/auth/sign-up" element={<div>Sign Up Screen</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Today Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Sign Up Screen')).not.toBeInTheDocument();
  });
});
