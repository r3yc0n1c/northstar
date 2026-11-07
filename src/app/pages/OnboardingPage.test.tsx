import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardingPage } from './OnboardingPage';
import * as profileApi from '@/features/settings/api/profile';
import { AuthProvider } from '@/features/auth';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const mockUser: User = {
  id: 'usr_onb_test',
  app_metadata: {},
  user_metadata: { full_name: 'Pilot' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'pilot@northstar.app',
  email_confirmed_at: '2026-11-03T10:00:00Z',
};

const mockSession: Session = {
  access_token: 'fake_jwt',
  refresh_token: 'fake_refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: mockUser,
};

const baseProfile: ProfileRow = {
  id: 'usr_onb_test',
  display_name: 'Pilot',
  avatar_url: null,
  timezone: 'UTC',
  locale: 'en-US',
  currency_code: 'USD',
  week_starts_on: 1,
  working_days: [1, 2, 3, 4, 5],
  working_hours: { mon: { start: '09:00', end: '17:00' } },
  onboarding_completed_at: null,
  created_at: '2026-11-03T10:00:00Z',
  updated_at: '2026-11-03T10:00:00Z',
};

function renderPage(initialEntries = ['/onboarding']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={mockSession} initialLoading={false}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/today" element={<div>Today Dashboard Content</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders onboarding wizard when user has not completed onboarding', async () => {
    vi.spyOn(profileApi, 'getProfile').mockResolvedValueOnce(baseProfile);

    renderPage();

    expect(await screen.findByText(/step 1 of 3/i)).toBeInTheDocument();
    expect(screen.getByText(/calibrate your schedule/i)).toBeInTheDocument();
  });

  it('redirects to /today if onboarding was already completed (FR-ONB)', async () => {
    vi.spyOn(profileApi, 'getProfile').mockResolvedValueOnce({
      ...baseProfile,
      onboarding_completed_at: '2026-11-04T12:00:00Z',
    });

    renderPage();

    expect(await screen.findByText('Today Dashboard Content')).toBeInTheDocument();
    expect(screen.queryByText(/calibrate your schedule/i)).not.toBeInTheDocument();
  });

  it('renders error state on profile load failure and provides retry', async () => {
    vi.spyOn(profileApi, 'getProfile').mockRejectedValueOnce(
      new Error('Failed to load user profile'),
    );

    renderPage();

    expect(await screen.findByText('Failed to load setup')).toBeInTheDocument();
    expect(screen.getByText('Failed to load user profile')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
