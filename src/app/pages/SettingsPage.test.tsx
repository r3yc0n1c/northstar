import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider } from '@/features/auth';
import { SettingsPage } from './SettingsPage';
import * as profileApi from '@/features/settings/api/profile';

const mockUserSession: Session = {
  access_token: 'valid_token',
  refresh_token: 'valid_refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user_123',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'user@example.com',
    email_confirmed_at: new Date().toISOString(),
  },
};

const mockProfile: profileApi.ProfileRow = {
  id: 'user_123',
  display_name: 'Explorer One',
  avatar_url: null,
  timezone: 'UTC',
  locale: 'en-US',
  currency_code: 'USD',
  week_starts_on: 1,
  working_days: [1, 2, 3, 4, 5],
  working_hours: {
    mon: { start: '09:00', end: '17:00' },
  },
  onboarding_completed_at: '2026-11-04T12:00:00Z',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

function renderWithProviders(
  ui: React.ReactElement,
  initialSession: Session | null = mockUserSession,
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={initialSession} initialLoading={false}>
        {ui}
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading skeleton while profile is loading', () => {
    // Return a pending promise that never resolves immediately
    vi.spyOn(profileApi, 'getProfile').mockImplementation(() => new Promise(() => {}));

    renderWithProviders(<SettingsPage />);

    expect(screen.getByRole('heading', { level: 1, name: /settings/i })).toBeInTheDocument();
    expect(screen.getByText(/profile preferences, timezone calibration/i)).toBeInTheDocument();
  });

  it('renders error state with retry button when profile query fails', async () => {
    vi.spyOn(profileApi, 'getProfile').mockRejectedValueOnce(new Error('Database network timeout'));

    renderWithProviders(<SettingsPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent(/failed to load settings/i);
    expect(screen.getByText(/database network timeout/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('renders profile settings form when profile data loads successfully', async () => {
    vi.spyOn(profileApi, 'getProfile').mockResolvedValueOnce(mockProfile);

    renderWithProviders(<SettingsPage />);

    expect(await screen.findByDisplayValue('Explorer One')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /export json/i })).toBeInTheDocument();
  });
});
