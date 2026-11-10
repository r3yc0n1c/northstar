import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GoalsList } from './GoalsList';
import * as goalsApi from '../api/goals';
import type { Domain, Goal } from '../schema';

vi.mock('../api/goals', () => ({
  fetchGoals: vi.fn(),
  createGoal: vi.fn(),
  updateGoal: vi.fn(),
  archiveGoal: vi.fn(),
  restoreGoal: vi.fn(),
  deleteGoal: vi.fn(),
}));

const mockDomains: Domain[] = [
  {
    id: 'd-1',
    workspace_id: 'ws-123',
    name: 'Career & Work',
    color: '#5A4F7C',
    icon: 'briefcase',
    sort_order: 0,
    archived_at: null,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  },
];

const mockGoal1: Goal = {
  id: 'g-1',
  workspace_id: 'ws-123',
  domain_id: 'd-1',
  title: 'Reach $100k ARR',
  description: 'Self-sustaining business',
  priority: 'high',
  status: 'active',
  start_date: '2026-01-01',
  target_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

const mockGoal2: Goal = {
  id: 'g-2',
  workspace_id: 'ws-123',
  domain_id: null,
  title: 'Read 24 Books',
  description: 'Deliberate reading',
  priority: 'none',
  status: 'active',
  start_date: null,
  target_date: null,
  archived_at: null,
  created_at: '2026-11-02T00:00:00Z',
  updated_at: '2026-11-02T00:00:00Z',
};

function renderGoalsList(workspaceId = 'ws-123') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <GoalsList workspaceId={workspaceId} domains={mockDomains} />
    </QueryClientProvider>,
  );
}

describe('GoalsList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders goals list with active counter and badges', async () => {
    vi.mocked(goalsApi.fetchGoals).mockResolvedValue([mockGoal1, mockGoal2]);

    renderGoalsList();

    expect(await screen.findByText('Reach $100k ARR')).toBeInTheDocument();
    expect(screen.getByText('Read 24 Books')).toBeInTheDocument();
    expect(screen.getByText('Career & Work')).toBeInTheDocument();
    expect(screen.getByText('2 Active')).toBeInTheDocument();
  });

  it('renders empty state when no goals exist', async () => {
    vi.mocked(goalsApi.fetchGoals).mockResolvedValue([]);

    renderGoalsList();

    expect(await screen.findByText('No active goals')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Goal/i })).toBeInTheDocument();
  });

  it('calls archiveGoal on active goal', async () => {
    vi.mocked(goalsApi.fetchGoals).mockResolvedValue([mockGoal1]);
    vi.mocked(goalsApi.archiveGoal).mockResolvedValue({
      ...mockGoal1,
      archived_at: '2026-11-10T00:00:00Z',
    });

    renderGoalsList();

    const archiveBtn = await screen.findByRole('button', {
      name: `Archive ${mockGoal1.title}`,
    });
    fireEvent.click(archiveBtn);

    await waitFor(() => {
      expect(goalsApi.archiveGoal).toHaveBeenCalledWith(mockGoal1.id);
    });
  });

  it('calls deleteGoal when delete icon is clicked', async () => {
    vi.mocked(goalsApi.fetchGoals).mockResolvedValue([mockGoal1]);
    vi.mocked(goalsApi.deleteGoal).mockResolvedValue();

    renderGoalsList();

    const deleteBtn = await screen.findByRole('button', {
      name: `Delete ${mockGoal1.title}`,
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(goalsApi.deleteGoal).toHaveBeenCalledWith(mockGoal1.id);
    });
  });
});
