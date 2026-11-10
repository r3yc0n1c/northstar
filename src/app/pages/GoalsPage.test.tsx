import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GoalsPage } from './GoalsPage';
import * as workspaceApi from '@/features/goals/api/workspace';
import * as domainsApi from '@/features/goals/api/domains';
import * as visionApi from '@/features/goals/api/vision';
import { AuthProvider } from '@/features/auth';
import type { Session } from '@supabase/supabase-js';

vi.mock('@/features/goals/api/workspace', () => ({
  fetchCurrentWorkspace: vi.fn(),
}));

vi.mock('@/features/goals/api/domains', () => ({
  fetchDomains: vi.fn(),
  createDomain: vi.fn(),
  updateDomain: vi.fn(),
  archiveDomain: vi.fn(),
  restoreDomain: vi.fn(),
  reorderDomains: vi.fn(),
}));

vi.mock('@/features/goals/api/vision', () => ({
  fetchWorkspaceVision: vi.fn(),
  updateWorkspaceVision: vi.fn(),
}));

const mockSession: Session = {
  access_token: 'valid',
  refresh_token: 'valid',
  expires_in: 3600,
  token_type: 'bearer',
  user: {
    id: 'user_goals_test',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: new Date().toISOString(),
    email: 'user@example.com',
  },
};

const mockWorkspace: workspaceApi.Workspace = {
  id: 'ws-777',
  name: 'Personal',
  vision: 'Build impactful products with joy.',
  owner_id: 'user_goals_test',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

function renderGoalsPage(initialEntry = '/goals') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider initialSession={mockSession} initialLoading={false}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <GoalsPage />
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

describe('GoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders page header, vision card, and tabs', async () => {
    vi.mocked(workspaceApi.fetchCurrentWorkspace).mockResolvedValue(mockWorkspace);
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue(mockWorkspace.vision);
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue([]);

    renderGoalsPage();

    expect(screen.getByText('Goals & OKRs')).toBeInTheDocument();
    expect(await screen.findByText(/"Build impactful products with joy."/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /OKRs/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Goals/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Life Areas/i })).toBeInTheDocument();
  });

  it('navigates to Life Areas tab and renders life areas content', async () => {
    vi.mocked(workspaceApi.fetchCurrentWorkspace).mockResolvedValue(mockWorkspace);
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue(mockWorkspace.vision);
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue([]);

    renderGoalsPage();

    const areasTab = await screen.findByRole('tab', { name: /Life Areas/i });
    fireEvent.click(areasTab);

    expect(screen.getByTestId('life-areas-tab-content')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Life Area/i })).toBeInTheDocument();
  });

  it('respects ?tab=areas search query param on initial load', async () => {
    vi.mocked(workspaceApi.fetchCurrentWorkspace).mockResolvedValue(mockWorkspace);
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue(mockWorkspace.vision);
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue([]);

    renderGoalsPage('/goals?tab=areas');

    expect(await screen.findByTestId('life-areas-tab-content')).toBeInTheDocument();
  });
});
