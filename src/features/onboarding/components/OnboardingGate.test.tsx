import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { OnboardingGate } from './OnboardingGate';
import * as profileApi from '@/features/settings/api/profile';
import { AuthProvider } from '@/features/auth';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

const mockUser: User = {
  id: 'usr_gate_test',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'gate@northstar.app',
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
  id: 'usr_gate_test',
  display_name: 'Gate User',
  avatar_url: null,
  timezone: 'UTC',
  locale: 'en-US',
  currency_code: 'USD',
  week_starts_on: 1,
  working_days: [1, 2, 3, 4, 5],
  working_hours: {},
  onboarding_completed_at: null,
  created_at: '2026-11-03T10:00:00Z',
  updated_at: '2026-11-03T10:00:00Z',
};

function renderGate(initialEntries = ['/today']) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={mockSession} initialLoading={false}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path="/onboarding" element={<div>Onboarding Destination Screen</div>} />
            <Route element={<OnboardingGate />}>
              <Route path="/today" element={<div>Protected Dashboard Outlet</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('OnboardingGate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('redirects uncompleted user to /onboarding (FR-ONB)', async () => {
    vi.spyOn(profileApi, 'getProfile').mockResolvedValueOnce({
      ...baseProfile,
      onboarding_completed_at: null,
    });

    renderGate();

    expect(await screen.findByText('Onboarding Destination Screen')).toBeInTheDocument();
    expect(screen.queryByText('Protected Dashboard Outlet')).not.toBeInTheDocument();
  });

  it('allows user who completed onboarding to reach dashboard', async () => {
    vi.spyOn(profileApi, 'getProfile').mockResolvedValueOnce({
      ...baseProfile,
      onboarding_completed_at: '2026-11-05T12:00:00Z',
    });

    renderGate();

    expect(await screen.findByText('Protected Dashboard Outlet')).toBeInTheDocument();
    expect(screen.queryByText('Onboarding Destination Screen')).not.toBeInTheDocument();
  });
});
