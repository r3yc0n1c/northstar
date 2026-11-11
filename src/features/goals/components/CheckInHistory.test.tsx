import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { CheckInHistory } from './CheckInHistory';
import * as checkInsApi from '../api/checkIns';
import type { KeyResult, KrCheckIn } from '../schema';

vi.mock('../api/checkIns', () => ({
  fetchKrCheckIns: vi.fn(),
  recordKrCheckIn: vi.fn(),
}));

const mockKr: KeyResult = {
  id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
  objective_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Grow weekly active users to 5,000',
  description: null,
  metric_type: 'numeric',
  baseline_value: 0,
  current_value: 3000,
  target_value: 5000,
  unit: 'users',
  currency_code: null,
  direction: 'increase',
  confidence: 9,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const checkInOld: KrCheckIn = {
  id: 'ci-1',
  workspace_id: mockKr.workspace_id,
  key_result_id: mockKr.id,
  value: 2000,
  raw_progress_percent: 40,
  progress_percent: 40,
  confidence: 7,
  notes: 'Old check-in',
  evidence_url: null,
  supersedes_id: null,
  recorded_by: 'user-1',
  recorded_at: '2026-10-10T12:00:00Z',
  created_at: '2026-10-10T12:00:00Z',
};

const checkInCorrection: KrCheckIn = {
  id: 'ci-2',
  workspace_id: mockKr.workspace_id,
  key_result_id: mockKr.id,
  value: 2200,
  raw_progress_percent: 44,
  progress_percent: 44,
  confidence: 8,
  notes: 'Corrected count',
  evidence_url: 'https://telemetry.example.com',
  supersedes_id: 'ci-1',
  recorded_by: 'user-1',
  recorded_at: '2026-10-12T12:00:00Z',
  created_at: '2026-10-12T12:00:00Z',
};

function renderCheckInHistory() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CheckInHistory keyResult={mockKr} workspaceId={mockKr.workspace_id} />
    </QueryClientProvider>,
  );
}

describe('CheckInHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders check-in rows and marks superseded row as Corrected', async () => {
    vi.mocked(checkInsApi.fetchKrCheckIns).mockResolvedValue([checkInCorrection, checkInOld]);

    renderCheckInHistory();

    expect(await screen.findByText('2200 users')).toBeInTheDocument();
    expect(screen.getByText('2000 users')).toBeInTheDocument();

    expect(screen.getByText('Current')).toBeInTheDocument();
    expect(screen.getByText('Corrected')).toBeInTheDocument();

    expect(screen.getByText('Corrected count')).toBeInTheDocument();
    expect(screen.getByText('Evidence')).toBeInTheDocument();

    // Check that non-superseded row has a "Correct" action button
    const correctBtn = screen.getByRole('button', { name: /Correct check-in from 2026-10-12/i });
    expect(correctBtn).toBeInTheDocument();

    // Click "Correct" to open correction dialog
    fireEvent.click(correctBtn);
    expect(await screen.findByText('Correct Check-In')).toBeInTheDocument();
    expect(screen.getByText(/Correction Mode/i)).toBeInTheDocument();
  });

  it('renders empty state when no check-ins exist', async () => {
    vi.mocked(checkInsApi.fetchKrCheckIns).mockResolvedValue([]);

    renderCheckInHistory();

    expect(
      await screen.findByText('No check-ins recorded yet for this key result.'),
    ).toBeInTheDocument();
  });
});
