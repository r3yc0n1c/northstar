import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { SignInForm } from './SignInForm';
import * as authApi from '../api/auth';

describe('SignInForm component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email, password, toggle visibility, and Google sign in button', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /forgot password\?/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create an account/i })).toBeInTheDocument();
  });

  it('toggles password visibility when button is clicked', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>,
    );

    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = screen.getByLabelText(/show password/i);
    fireEvent.click(toggleBtn);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText(/hide password/i)).toBeInTheDocument();
  });

  it('shows validation errors when submitting empty form', async () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('displays generic error "Email or password is incorrect" on credential failure (FR-AUTH-3)', async () => {
    vi.spyOn(authApi, 'signInWithEmail').mockResolvedValueOnce({
      data: null,
      error: 'Email or password is incorrect',
    });

    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'unknown@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'WrongPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Email or password is incorrect');
    });
  });

  it('shows resend verification prompt when unconfirmed account is detected (FR-AUTH-3)', async () => {
    vi.spyOn(authApi, 'signInWithEmail').mockResolvedValueOnce({
      data: null,
      error: 'Please verify your email address before signing in.',
      unconfirmed: true,
    });

    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInForm />
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'unconfirmed@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'ValidPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText(/please verify your email address/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /resend verification email/i }),
      ).toBeInTheDocument();
    });
  });

  it('redirects to return URL stored in location.state.from upon success (FR-AUTH-7)', async () => {
    vi.spyOn(authApi, 'signInWithEmail').mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });

    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter
          initialEntries={[
            {
              pathname: '/auth/sign-in',
              state: { from: { pathname: '/projects' } },
            },
          ]}
        >
          <Routes>
            <Route path="/auth/sign-in" element={<SignInForm />} />
            <Route path="/projects" element={<div>Projects Deep Destination</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'verified@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'ValidPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^sign in$/i }));

    await waitFor(() => {
      expect(screen.getByText('Projects Deep Destination')).toBeInTheDocument();
    });
  });
});
