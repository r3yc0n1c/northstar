import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { OnboardingWizard } from './OnboardingWizard';
import * as onboardingApi from '../api/onboarding';
import { AuthProvider } from '@/features/auth';
import type { Session, User } from '@supabase/supabase-js';

const mockUser: User = {
  id: 'usr_onb_1',
  app_metadata: {},
  user_metadata: { full_name: 'Explorer Pilot' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'explorer@northstar.app',
  email_confirmed_at: '2026-11-03T10:00:00Z',
};

const mockSession: Session = {
  access_token: 'fake_jwt',
  refresh_token: 'fake_refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={mockSession} initialLoading={false}>
        <MemoryRouter initialEntries={['/onboarding']}>{ui}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('OnboardingWizard', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Step 1 with calibration heading and schedule options', () => {
    renderWithProviders(<OnboardingWizard />);

    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/calibrate your schedule/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/skip onboarding and proceed directly to today/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue/i })).toBeInTheDocument();
  });

  it('allows skipping from Step 1 immediately (FR-ONB)', async () => {
    const skipSpy = vi.spyOn(onboardingApi, 'skipOnboarding').mockResolvedValueOnce();

    renderWithProviders(<OnboardingWizard />);

    const skipBtn = screen.getByLabelText(/skip onboarding and proceed directly to today/i);
    fireEvent.click(skipBtn);

    await waitFor(() => {
      expect(skipSpy).toHaveBeenCalledWith('usr_onb_1');
    });
  });

  it('navigates through step 1, 2, and 3', async () => {
    renderWithProviders(<OnboardingWizard />);

    // Step 1 -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/choose starter life areas/i)).toBeInTheDocument();

    // Verify areas are rendered
    expect(screen.getByText('Career & Work')).toBeInTheDocument();
    expect(screen.getByText('Health & Fitness')).toBeInTheDocument();

    // Select all then deselect all then select all
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));
    expect(screen.getByRole('button', { name: /deselect all/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /deselect all/i }));
    expect(screen.getByRole('button', { name: /select all/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /select all/i }));

    // Step 2 -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    expect(screen.getByText(/step 3 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/set your first high-level goal/i)).toBeInTheDocument();

    // Back to Step 2
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText(/step 2 of 3/i)).toBeInTheDocument();
  });

  it('submits complete onboarding payload on finish (FR-ONB)', async () => {
    const completeSpy = vi.spyOn(onboardingApi, 'completeOnboarding').mockResolvedValueOnce();

    renderWithProviders(<OnboardingWizard />);

    // Advance to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Advance to Step 3
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    // Fill goal title
    const goalInput = screen.getByLabelText(/goal title/i);
    fireEvent.change(goalInput, { target: { value: 'Launch Northstar OS' } });

    // Submit
    const finishBtn = screen.getByRole('button', { name: /finish setup/i });
    fireEvent.click(finishBtn);

    await waitFor(() => {
      expect(completeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_onb_1',
          step3: expect.objectContaining({
            goal_title: 'Launch Northstar OS',
          }),
        }),
      );
    });
  });
});
