import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as authApi from '../api/auth';
import { CheckEmailView } from './CheckEmailView';

vi.mock('../api/auth', () => ({
  resendVerificationEmail: vi.fn(),
}));

describe('CheckEmailView component', () => {
  const onBackToSignUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders email address and initial cooldown state', () => {
    render(
      <CheckEmailView
        email="alex@northstar.io"
        onBackToSignUp={onBackToSignUp}
        initialCooldown={45}
      />,
    );

    expect(screen.getByRole('heading', { name: /check your email/i })).toBeInTheDocument();
    expect(screen.getByText('alex@northstar.io')).toBeInTheDocument();
    expect(screen.getByText(/resend in/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /resend in/i })).toBeDisabled();
  });

  it('allows resending when cooldown reaches 0', async () => {
    vi.mocked(authApi.resendVerificationEmail).mockResolvedValueOnce({
      data: {},
      error: null,
    });

    render(
      <CheckEmailView
        email="alex@northstar.io"
        onBackToSignUp={onBackToSignUp}
        initialCooldown={0}
      />,
    );

    const resendBtn = screen.getByRole('button', {
      name: /resend verification email/i,
    });
    expect(resendBtn).not.toBeDisabled();

    fireEvent.click(resendBtn);

    await waitFor(() => {
      expect(authApi.resendVerificationEmail).toHaveBeenCalledWith('alex@northstar.io');
      expect(screen.getByText(/a fresh verification link has been sent/i)).toBeInTheDocument();
    });
  });

  it('navigates back to sign up when "Use a different email" is clicked', () => {
    render(
      <CheckEmailView
        email="alex@northstar.io"
        onBackToSignUp={onBackToSignUp}
        initialCooldown={30}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /use a different email/i }));
    expect(onBackToSignUp).toHaveBeenCalledTimes(1);
  });
});
