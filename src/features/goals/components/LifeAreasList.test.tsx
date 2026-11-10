import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { LifeAreasList } from './LifeAreasList';
import * as domainsApi from '../api/domains';
import type { Domain } from '../schema';

vi.mock('../api/domains', () => ({
  fetchDomains: vi.fn(),
  createDomain: vi.fn(),
  updateDomain: vi.fn(),
  archiveDomain: vi.fn(),
  restoreDomain: vi.fn(),
  reorderDomains: vi.fn(),
}));

const domain1: Domain = {
  id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  workspace_id: 'ws-123',
  name: 'Career & Work',
  color: '#5A4F7C',
  icon: 'briefcase',
  sort_order: 0,
  archived_at: null,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

const domain2: Domain = {
  id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
  workspace_id: 'ws-123',
  name: 'Health & Fitness',
  color: '#6FCF97',
  icon: 'heart-pulse',
  sort_order: 1,
  archived_at: null,
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-01T00:00:00Z',
};

const archivedDomain: Domain = {
  id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  workspace_id: 'ws-123',
  name: 'Past Venture',
  color: '#E5707F',
  icon: 'folder',
  sort_order: 2,
  archived_at: '2026-11-05T00:00:00Z',
  created_at: '2026-11-01T00:00:00Z',
  updated_at: '2026-11-05T00:00:00Z',
};

const mockDomains: Domain[] = [domain1, domain2];

function renderLifeAreasList(workspaceId = 'ws-123') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <LifeAreasList workspaceId={workspaceId} />
    </QueryClientProvider>,
  );
}

describe('LifeAreasList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders list of active domains with active counter badge', async () => {
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue(mockDomains);

    renderLifeAreasList();

    expect(await screen.findByText('Career & Work')).toBeInTheDocument();
    expect(screen.getByText('Health & Fitness')).toBeInTheDocument();
    expect(screen.getByText('2 Active')).toBeInTheDocument();
  });

  it('renders empty state when there are no domains', async () => {
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue([]);

    renderLifeAreasList();

    expect(await screen.findByText('No active life areas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create First Life Area/i })).toBeInTheDocument();
  });

  it('calls archiveDomain when clicking archive on an active domain', async () => {
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue(mockDomains);
    vi.mocked(domainsApi.archiveDomain).mockResolvedValue({
      ...domain1,
      archived_at: '2026-11-09T00:00:00Z',
    });

    renderLifeAreasList();

    const archiveButton = await screen.findByRole('button', {
      name: `Archive ${domain1.name}`,
    });
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(domainsApi.archiveDomain).toHaveBeenCalledWith(domain1.id);
    });
  });

  it('toggles show archived and allows restoring an archived domain', async () => {
    const withArchived: Domain[] = [...mockDomains, archivedDomain];

    vi.mocked(domainsApi.fetchDomains).mockImplementation((_ws, options) => {
      if (options?.includeArchived) {
        return Promise.resolve(withArchived);
      }
      return Promise.resolve(mockDomains);
    });

    vi.mocked(domainsApi.restoreDomain).mockResolvedValue({
      ...archivedDomain,
      archived_at: null,
    });

    renderLifeAreasList();

    expect(await screen.findByText('Career & Work')).toBeInTheDocument();
    expect(screen.queryByText('Past Venture')).not.toBeInTheDocument();

    const switchToggle = screen.getByLabelText(/Show archived life areas/i);
    fireEvent.click(switchToggle);

    expect(await screen.findByText('Past Venture')).toBeInTheDocument();
    expect(screen.getByText('Archived')).toBeInTheDocument();

    const restoreButton = screen.getByRole('button', { name: 'Restore Past Venture' });
    fireEvent.click(restoreButton);

    await waitFor(() => {
      expect(domainsApi.restoreDomain).toHaveBeenCalledWith(archivedDomain.id);
    });
  });

  it('triggers reorder when using keyboard accessible move buttons', async () => {
    vi.mocked(domainsApi.fetchDomains).mockResolvedValue(mockDomains);
    vi.mocked(domainsApi.reorderDomains).mockResolvedValue();

    renderLifeAreasList();

    const moveDownBtn = await screen.findByRole('button', {
      name: `Move ${domain1.name} down`,
    });
    fireEvent.click(moveDownBtn);

    await waitFor(() => {
      expect(domainsApi.reorderDomains).toHaveBeenCalledWith([
        { id: domain2.id, sort_order: 0 },
        { id: domain1.id, sort_order: 1 },
      ]);
    });
  });
});
