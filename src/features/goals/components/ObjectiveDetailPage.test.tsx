import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Session } from '@supabase/supabase-js';
import { AuthProvider } from '@/features/auth';
import { ObjectiveDetailPage } from './ObjectiveDetailPage';
import * as workspaceApi from '../api/workspace';
import * as objectivesApi from '../api/objectives';
import * as keyResultsApi from '../api/keyResults';
import * as checkInsApi from '../api/checkIns';
import * as cyclesApi from '../api/cycles';
import * as goalsApi from '../api/goals';
import * as domainsApi from '../api/domains';
import type { Cycle, Goal, KeyResult, KrCheckIn, Objective } from '../schema';

vi.mock('../api/workspace', () => ({
  fetchCurrentWorkspace: vi.fn(),
}));

vi.mock('../api/objectives', () => ({
  fetchObjectiveById: vi.fn(),
  updateObjective: vi.fn(),
}));

vi.mock('../api/keyResults', () => ({
  fetchKeyResults: vi.fn(),
  createKeyResult: vi.fn(),
  updateKeyResult: vi.fn(),
}));

vi.mock('../api/checkIns', () => ({
  fetchKrCheckIns: vi.fn(),
  recordKrCheckIn: vi.fn(),
}));

vi.mock('../api/cycles', () => ({
  fetchCycles: vi.fn(),
}));

vi.mock('../api/goals', () => ({
  fetchGoals: vi.fn(),
}));

vi.mock('../api/domains', () => ({
  fetchDomains: vi.fn(),
}));

const mockWorkspace = {
  id: 'ws-100',
  owner_id: 'user-100',
  name: 'Personal Workspace',
  vision: 'Build impactful systems',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockCycle: Cycle = {
  id: 'cycle-1',
  workspace_id: 'ws-100',
  name: 'Q4 2026',
  cycle_type: 'quarterly',
  start_date: '2026-10-01',
  end_date: '2026-12-31',
  status: 'active',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockGoal: Goal = {
  id: 'goal-1',
  workspace_id: 'ws-100',
  domain_id: null,
  title: 'Achieve Staff Engineer Level',
  description: 'Reach Staff tier in platform engineering',
  priority: 'high',
  status: 'active',
  start_date: '2026-10-01',
  target_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockObjective: Objective = {
  id: 'obj-42',
  workspace_id: 'ws-100',
  cycle_id: 'cycle-1',
  goal_id: 'goal-1',
  title: 'Land senior architect role',
  description: 'Conduct architecture sessions and publish RFCs',
  status: 'active',
  priority: 'urgent',
  confidence: 7,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockKrs: KeyResult[] = [
  {
    id: 'kr-101',
    workspace_id: 'ws-100',
    objective_id: 'obj-42',
    title: 'Conduct 20 customer interviews',
    description: 'Target lead platform architects',
    metric_type: 'numeric',
    baseline_value: 0,
    current_value: 12,
    target_value: 20,
    unit: 'interviews',
    currency_code: null,
    direction: 'increase',
    confidence: 8,
    start_date: '2026-10-01',
    due_date: '2026-12-31',
    archived_at: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
  {
    id: 'kr-102',
    workspace_id: 'ws-100',
    objective_id: 'obj-42',
    title: 'Publish 4 systems RFCs',
    description: null,
    metric_type: 'numeric',
    baseline_value: 0,
    current_value: 2,
    target_value: 4,
    unit: 'RFCs',
    currency_code: null,
    direction: 'increase',
    confidence: 7,
    start_date: '2026-10-01',
    due_date: '2026-12-31',
    archived_at: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
];

const mockCheckIns: KrCheckIn[] = [
  {
    id: 'ci-101',
    workspace_id: 'ws-100',
    key_result_id: 'kr-101',
    value: 12,
    raw_progress_percent: 60,
    progress_percent: 60,
    confidence: 8,
    notes: 'Completed 12 interviews so far',
    evidence_url: 'https://notes.example.com/interviews',
    supersedes_id: null,
    recorded_by: 'user-100',
    recorded_at: '2026-11-02T14:00:00Z',
    created_at: '2026-11-02T14:00:00Z',
  },
];

const mockSession = {
  access_token: 'fake-jwt',
  refresh_token: 'fake-refresh',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user-100',
    email: 'user@example.com',
  },
};

function renderPage(objectiveId = 'obj-42') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={mockSession as unknown as Session} initialLoading={false}>
        <MemoryRouter initialEntries={[`/goals/objectives/${objectiveId}`]}>
          <Routes>
            <Route path="/goals/objectives/:id" element={<ObjectiveDetailPage />} />
            <Route path="/goals" element={<div>Goals Page</div>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('ObjectiveDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(workspaceApi.fetchCurrentWorkspace).mockResolvedValue(
      mockWorkspace as unknown as workspaceApi.Workspace,
    );
    vi.mocked(objectivesApi.fetchObjectiveById).mockResolvedValue(mockObjective);
    vi.mocked(cyclesApi.fetchCycles).mockResolvedValue([mockCycle]);
    vi.mocked(goalsApi.fetchGoals).mockResolvedValue([mockGoal]);
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue([]);
    vi.mocked(keyResultsApi.fetchKeyResults).mockResolvedValue(mockKrs);
    vi.mocked(checkInsApi.fetchKrCheckIns).mockResolvedValue(mockCheckIns);
  });

  it('renders summary strip with progress, health, confidence, and time left', async () => {
    renderPage();

    // Title and back navigation
    expect(
      await screen.findByRole('heading', { level: 1, name: /Land senior architect role/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Back to OKRs')).toBeInTheDocument();

    // Wait for key results to arrive
    expect(
      await screen.findByRole('heading', { level: 3, name: /Conduct 20 customer interviews/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 3, name: /Publish 4 systems RFCs/i }),
    ).toBeInTheDocument();

    // Summary strip metrics:
    // KR 1 = 60%, KR 2 = 50% => mean progress = 55%
    const summaryStrip = screen.getByTestId('summary-strip');
    expect(summaryStrip).toBeInTheDocument();
    expect(within(summaryStrip).getAllByText(/55%/)[0]).toBeInTheDocument();
    expect(within(summaryStrip).getByText('7')).toBeInTheDocument(); // confidence
    expect(within(summaryStrip).getByText('/ 10')).toBeInTheDocument();

    // Key Results section active counter
    expect(screen.getByText('2 Active')).toBeInTheDocument();

    // Linked Projects placeholder
    expect(screen.getByText('Linked projects')).toBeInTheDocument();
    expect(
      screen.getByText('Projects can be linked to this objective in Phase 3.'),
    ).toBeInTheDocument();
  });

  it('renders progress telemetry chart and check-in history for selected KR', async () => {
    renderPage();

    // Wait for page and KRs to render
    expect(
      await screen.findByRole('heading', { level: 1, name: /Land senior architect role/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { level: 3, name: /Conduct 20 customer interviews/i }),
    ).toBeInTheDocument();

    // Telemetry section
    expect(screen.getByText('Progress telemetry')).toBeInTheDocument();
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();

    // Check-in history table
    expect(screen.getByText('Check-in history')).toBeInTheDocument();
    expect(await screen.findByText('Completed 12 interviews so far')).toBeInTheDocument();
  });

  it('allows clicking check in button to open CheckInDialog', async () => {
    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: /Land senior architect role/i }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { level: 3, name: /Conduct 20 customer interviews/i }),
    ).toBeInTheDocument();

    const checkInButtons = screen.getAllByRole('button', { name: /Check in/i });
    expect(checkInButtons.length).toBeGreaterThan(0);
    const firstCheckInBtn = checkInButtons[0];
    expect(firstCheckInBtn).toBeDefined();
    if (firstCheckInBtn) {
      fireEvent.click(firstCheckInBtn);
    }

    // CheckInDialog should open
    expect(await screen.findByRole('heading', { name: /Record.*Check-In/i })).toBeInTheDocument();
    expect(screen.getByText(/Check-ins are append-only and permanent/i)).toBeInTheDocument();
  });

  it('renders empty states when objective has no key results', async () => {
    vi.mocked(keyResultsApi.fetchKeyResults).mockResolvedValue([]);
    vi.mocked(checkInsApi.fetchKrCheckIns).mockResolvedValue([]);

    renderPage();

    expect(
      await screen.findByRole('heading', { level: 1, name: /Land senior architect role/i }),
    ).toBeInTheDocument();

    // Wait for empty state to display
    await waitFor(() => {
      const emptyStates = screen.getAllByText('No key results yet');
      expect(emptyStates.length).toBeGreaterThan(0);
    });
    expect(screen.getByText('0 Active')).toBeInTheDocument();
  });
});
