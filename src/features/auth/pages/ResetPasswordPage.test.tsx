import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import * as authApi from '../api/auth';
import { ResetPasswordPage } from './ResetPasswordPage';

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the reset password view with brand header and input', () => {
    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { level: 1, name: /reset your password/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/enter your email and we'll send a recovery link/i),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send reset link/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /back to sign in/i })).toBeInTheDocument();
  });

  it('validates email format before submission', async () => {
    const requestSpy = vi.spyOn(authApi, 'requestPasswordReset');

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/email/i);
    const submitBtn = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(input, { target: { value: 'invalid-email' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /please enter a valid email address/i,
    );
    expect(requestSpy).not.toHaveBeenCalled();
  });

  it('shows identical confirmation on submit regardless of account existence (prevents enumeration)', async () => {
    const requestSpy = vi
      .spyOn(authApi, 'requestPasswordReset')
      .mockResolvedValueOnce({ data: null, error: null });

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/email/i);
    const submitBtn = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(input, { target: { value: 'person@example.com' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith('person@example.com');
    });

    expect(
      screen.getByRole('heading', { level: 1, name: /check your inbox/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/if an account exists for/i)).toBeInTheDocument();
    expect(screen.getByText('person@example.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back to sign in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try another email/i })).toBeInTheDocument();
  });

  it('displays rate limit error if request limit is exceeded', async () => {
    vi.spyOn(authApi, 'requestPasswordReset').mockResolvedValueOnce({
      data: null,
      error: 'Too many requests. Please wait a moment before trying again.',
    });

    render(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>,
    );

    const input = screen.getByLabelText(/email/i);
    const submitBtn = screen.getByRole('button', { name: /send reset link/i });

    fireEvent.change(input, { target: { value: 'person@example.com' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByRole('alert')).toHaveTextContent(/too many requests/i);
    expect(screen.queryByText(/check your inbox/i)).not.toBeInTheDocument();
  });
});
