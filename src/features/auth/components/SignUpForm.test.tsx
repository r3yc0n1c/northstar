import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/auth';
import { SignUpForm } from './SignUpForm';

vi.mock('../api/auth', () => ({
  signUpWithEmail: vi.fn(),
  signInWithGoogle: vi.fn(),
  resendVerificationEmail: vi.fn(),
}));

describe('SignUpForm component', () => {
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <SignUpForm onSuccess={onSuccess} />
      </BrowserRouter>,
    );
  };

  it('renders all form fields, Google OAuth button, and strength hints', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirm password$/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
  });

  it('rejects passwords under 10 characters with a clear message', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'short9' } });
    fireEvent.change(confirmInput, { target: { value: 'short9' } });
    fireEvent.click(submitBtn);

    expect(
      await screen.findByText('Password must be at least 10 characters long'),
    ).toBeInTheDocument();
    expect(authApi.signUpWithEmail).not.toHaveBeenCalled();
  });

  it('rejects mismatched password and confirm password', async () => {
    renderComponent();

    const emailInput = screen.getByLabelText(/^email$/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const confirmInput = screen.getByLabelText(/^confirm password$/i);
    const submitBtn = screen.getByRole('button', { name: /create account/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'validPassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'differentPassword123' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(authApi.signUpWithEmail).not.toHaveBeenCalled();
  });

  it('successfully submits and triggers onSuccess when valid', async () => {
    vi.mocked(authApi.signUpWithEmail).mockResolvedValueOnce({
      data: { user: { id: 'u1' } },
      error: null,
    });

    renderComponent();

    fireEvent.change(screen.getByLabelText(/^email$/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'securePass123!' },
    });
    fireEvent.change(screen.getByLabelText(/^confirm password$/i), {
      target: { value: 'securePass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(authApi.signUpWithEmail).toHaveBeenCalledWith('user@example.com', 'securePass123!');
      expect(onSuccess).toHaveBeenCalledWith('user@example.com');
    });
  });

  it('triggers Google OAuth and displays error on failure (FR-AUTH-4)', async () => {
    vi.mocked(authApi.signInWithGoogle).mockResolvedValueOnce({
      data: null,
      error: 'Google authentication aborted',
    });

    renderComponent();

    const googleBtn = screen.getByRole('button', { name: /continue with google/i });
    fireEvent.click(googleBtn);

    expect(authApi.signInWithGoogle).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('alert')).toHaveTextContent(/google authentication aborted/i);
  });
});
