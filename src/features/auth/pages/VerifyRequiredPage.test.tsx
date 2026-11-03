import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import type { Session, User } from '@supabase/supabase-js';
import { AuthProvider } from '../context/AuthContext';
import { VerifyRequiredPage } from './VerifyRequiredPage';

function makeMockSession(email: string): Session {
  const user: User = {
    id: 'usr_unverified_1',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email,
    email_confirmed_at: undefined,
  };

  return {
    access_token: 'fake_access_token',
    refresh_token: 'fake_refresh_token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  };
}

describe('VerifyRequiredPage', () => {
  it('renders confirmation notice with user email and security alert', () => {
    const session = makeMockSession('raja@example.com');

    render(
      <AuthProvider initialSession={session} initialLoading={false}>
        <MemoryRouter>
          <VerifyRequiredPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { name: /verify your email/i })).toBeInTheDocument();
    expect(screen.getByText('raja@example.com')).toBeInTheDocument();
    expect(
      screen.getByText(/unverified accounts cannot access workspaces or create private data/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend verification email/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in with another account/i }),
    ).toBeInTheDocument();
  });
});
