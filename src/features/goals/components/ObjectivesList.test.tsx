import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ObjectivesList } from './ObjectivesList';
import * as objectivesApi from '../api/objectives';
import type { Cycle, Goal, Objective } from '../schema';

vi.mock('../api/objectives', () => ({
  fetchObjectives: vi.fn(),
  fetchObjectiveById: vi.fn(),
  createObjective: vi.fn(),
  updateObjective: vi.fn(),
  archiveObjective: vi.fn(),
  restoreObjective: vi.fn(),
  deleteObjective: vi.fn(),
}));

const mockCycle: Cycle = {
  id: 'cycle-1',
  workspace_id: 'ws-123',
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
  workspace_id: 'ws-123',
  domain_id: null,
  title: 'Grow ARR to $100k',
  description: null,
  priority: 'high',
  status: 'active',
  start_date: null,
  target_date: null,
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockObjective1: Objective = {
  id: 'obj-1',
  workspace_id: 'ws-123',
  cycle_id: 'cycle-1',
  goal_id: 'goal-1',
  title: 'Launch Self-Serve Onboarding Flow',
  description: 'Streamline signup-to-active conversion',
  priority: 'high',
  status: 'active',
  confidence: 8,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockObjective2: Objective = {
  id: 'obj-2',
  workspace_id: 'ws-123',
  cycle_id: 'cycle-1',
  goal_id: null,
  title: 'Sub-100ms API Response Latency',
  description: null,
  priority: 'medium',
  status: 'draft',
  confidence: 6,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

function renderObjectivesList(workspaceId = 'ws-123') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ObjectivesList
        workspaceId={workspaceId}
        selectedCycle={mockCycle}
        cycles={[mockCycle]}
        goals={[mockGoal]}
      />
    </QueryClientProvider>,
  );
}

describe('ObjectivesList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders objectives list with active counter and badges', async () => {
    vi.mocked(objectivesApi.fetchObjectives).mockResolvedValue([mockObjective1, mockObjective2]);

    renderObjectivesList();

    expect(await screen.findByText('Launch Self-Serve Onboarding Flow')).toBeInTheDocument();
    expect(screen.getByText('Sub-100ms API Response Latency')).toBeInTheDocument();
    expect(screen.getByText('Goal: Grow ARR to $100k')).toBeInTheDocument();
    expect(screen.getByText('Conf: 8/10')).toBeInTheDocument();
    expect(screen.getByText('2 Active')).toBeInTheDocument();
  });

  it('renders empty state when no objectives exist', async () => {
    vi.mocked(objectivesApi.fetchObjectives).mockResolvedValue([]);

    renderObjectivesList();

    expect(await screen.findByText('No key results yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Objective/i })).toBeInTheDocument();
  });

  it('calls archiveObjective on active objective', async () => {
    vi.mocked(objectivesApi.fetchObjectives).mockResolvedValue([mockObjective1]);
    vi.mocked(objectivesApi.archiveObjective).mockResolvedValue({
      ...mockObjective1,
      archived_at: '2026-11-10T00:00:00Z',
    });

    renderObjectivesList();

    const archiveBtn = await screen.findByRole('button', {
      name: `Archive ${mockObjective1.title}`,
    });
    fireEvent.click(archiveBtn);

    await waitFor(() => {
      expect(objectivesApi.archiveObjective).toHaveBeenCalledWith(mockObjective1.id);
    });
  });

  it('calls deleteObjective when delete button is clicked', async () => {
    vi.mocked(objectivesApi.fetchObjectives).mockResolvedValue([mockObjective1]);
    vi.mocked(objectivesApi.deleteObjective).mockResolvedValue();

    renderObjectivesList();

    const deleteBtn = await screen.findByRole('button', {
      name: `Delete ${mockObjective1.title}`,
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(objectivesApi.deleteObjective).toHaveBeenCalledWith(mockObjective1.id);
    });
  });
});
