import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import { AuthProvider } from '../context/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

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

describe('ProtectedRoute', () => {
  it('shows loading indicator while verifying session', () => {
    render(
      <AuthProvider initialLoading={true}>
        <MemoryRouter initialEntries={['/today']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/today" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('status', { name: /loading application/i })).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('redirects unauthenticated user to /auth/sign-in', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter initialEntries={['/today']}>
          <Routes>
            <Route path="/auth/sign-in" element={<div>Sign In Screen</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/today" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Sign In Screen')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('blocks unverified user and redirects to /auth/verify-required (FR-AUTH-2)', () => {
    const unconfirmedSession = makeMockSession(false);

    render(
      <AuthProvider initialSession={unconfirmedSession} initialLoading={false}>
        <MemoryRouter initialEntries={['/today']}>
          <Routes>
            <Route path="/auth/verify-required" element={<div>Verification Required Screen</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/today" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Verification Required Screen')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('allows verified user to reach protected dashboard', () => {
    const confirmedSession = makeMockSession(true);

    render(
      <AuthProvider initialSession={confirmedSession} initialLoading={false}>
        <MemoryRouter initialEntries={['/today']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/today" element={<div>Dashboard Content</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });
});
