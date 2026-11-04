import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import * as authApi from '../api/auth';
import { AuthProvider } from '../context/AuthContext';
import { UpdatePasswordPage } from './UpdatePasswordPage';

const mockRecoverySession: Session = {
  access_token: 'recovery-token',
  refresh_token: 'refresh-token',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'user@example.com',
    email_confirmed_at: new Date().toISOString(),
  },
};

describe('UpdatePasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders invalid or expired link state when no recovery session exists', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/update-password']}>
          <UpdatePasswordPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /invalid or expired link/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /request new reset link/i })).toBeInTheDocument();
  });

  it('renders error state when URL has error parameters', () => {
    render(
      <AuthProvider initialSession={mockRecoverySession} initialLoading={false}>
        <MemoryRouter
          initialEntries={[
            '/auth/update-password#error=access_denied&error_description=Email+link+is+invalid+or+has+expired',
          ]}
        >
          <UpdatePasswordPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /invalid or expired link/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/email link is invalid or has expired/i)).toBeInTheDocument();
  });

  it('renders password update form when recovery session is active', () => {
    render(
      <AuthProvider initialSession={mockRecoverySession} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/update-password']}>
          <UpdatePasswordPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /set new password/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^new password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm new password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /update password/i })).toBeInTheDocument();
  });

  it('validates 10-character minimum password length', async () => {
    const updateSpy = vi.spyOn(authApi, 'updateUserPassword');

    render(
      <AuthProvider initialSession={mockRecoverySession} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/update-password']}>
          <UpdatePasswordPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm new password$/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/at least 10 characters long/i);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('validates password confirmation match', async () => {
    const updateSpy = vi.spyOn(authApi, 'updateUserPassword');

    render(
      <AuthProvider initialSession={mockRecoverySession} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/update-password']}>
          <UpdatePasswordPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm new password$/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'MismatchPassword123!' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/passwords do not match/i);
    expect(updateSpy).not.toHaveBeenCalled();
  });

  it('submits valid password update, signs out recovery session, and redirects to sign-in (OWASP)', async () => {
    const updateSpy = vi
      .spyOn(authApi, 'updateUserPassword')
      .mockResolvedValueOnce({ data: { user: mockRecoverySession.user }, error: null });

    render(
      <AuthProvider initialSession={mockRecoverySession} initialLoading={false}>
        <MemoryRouter initialEntries={['/auth/update-password']}>
          <Routes>
            <Route path="/auth/update-password" element={<UpdatePasswordPage />} />
            <Route path="/auth/sign-in" element={<div>Sign In Screen Target</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    const passwordInput = screen.getByLabelText(/^new password$/i);
    const confirmInput = screen.getByLabelText(/^confirm new password$/i);
    const submitBtn = screen.getByRole('button', { name: /update password/i });

    fireEvent.change(passwordInput, { target: { value: 'NewSecurePassword123!' } });
    fireEvent.change(confirmInput, { target: { value: 'NewSecurePassword123!' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith('NewSecurePassword123!');
    });

    expect(await screen.findByText('Sign In Screen Target')).toBeInTheDocument();
  });
});
