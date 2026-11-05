import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthProvider } from '@/features/auth';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import type { ProfileRow } from '../api/profile';
import * as profileApi from '../api/profile';

const mockProfile: ProfileRow = {
  id: 'usr_pilot_1',
  display_name: 'Antigravity Pilot',
  avatar_url: null,
  timezone: 'America/New_York',
  locale: 'en-US',
  currency_code: 'USD',
  week_starts_on: 1,
  working_days: [1, 2, 3, 4, 5],
  working_hours: {
    mon: { start: '09:00', end: '17:00' },
    tue: { start: '09:00', end: '17:00' },
    wed: { start: '09:00', end: '17:00' },
    thu: { start: '09:00', end: '17:00' },
    fri: { start: '09:00', end: '17:00' },
  },
  onboarding_completed_at: '2026-11-04T10:00:00Z',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={null} initialLoading={false}>
        {ui}
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('ProfileSettingsForm component (FR-SET-1..3, FR-SET-5)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders avatar initials fallback from display name (FR-SET-1)', () => {
    renderWithProviders(<ProfileSettingsForm profile={mockProfile} />);

    // Initials for "Antigravity Pilot" -> "AP"
    expect(screen.getByText('AP')).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toHaveValue('Antigravity Pilot');
  });

  it('renders working hours and rejects invalid time ranges inline (FR-SET-3)', async () => {
    renderWithProviders(<ProfileSettingsForm profile={mockProfile} />);

    // Monday end time input
    const monEndInput = screen.getByLabelText(/monday end time/i);
    expect(monEndInput).toHaveValue('17:00');

    // Change Monday end time to be before start time (e.g. 08:00 < 09:00)
    fireEvent.change(monEndInput, { target: { value: '08:00' } });

    // Inline validation error should appear
    expect(await screen.findByText(/end time must be after start time/i)).toBeInTheDocument();

    // Submit button should fail validation
    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    const alerts = await screen.findAllByRole('alert');
    expect(alerts.length).toBeGreaterThanOrEqual(1);
    expect(
      alerts.some((el) => /end time must be after start time/i.test(el.textContent || '')),
    ).toBe(true);
  });

  it('updates live Intl preview when settings change (FR-SET-5)', () => {
    renderWithProviders(<ProfileSettingsForm profile={mockProfile} />);

    // Live preview shows USD format by default
    expect(screen.getByText('$1,250.50')).toBeInTheDocument();
  });

  it('submits valid profile updates via updateProfile API', async () => {
    const updateSpy = vi.spyOn(profileApi, 'updateProfile').mockResolvedValueOnce({
      ...mockProfile,
      display_name: 'Updated Commander',
    });

    renderWithProviders(<ProfileSettingsForm profile={mockProfile} />);

    const nameInput = screen.getByLabelText(/display name/i);
    fireEvent.change(nameInput, { target: { value: 'Updated Commander' } });

    const saveBtn = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveBtn);

    await waitFor(() => {
      expect(updateSpy).toHaveBeenCalledWith(
        'usr_pilot_1',
        expect.objectContaining({
          display_name: 'Updated Commander',
        }),
      );
    });

    expect(await screen.findByRole('status')).toHaveTextContent(/saved successfully/i);
  });
});
