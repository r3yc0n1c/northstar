import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { VisionCard } from './VisionCard';
import * as visionApi from '../api/vision';

vi.mock('../api/vision', () => ({
  fetchWorkspaceVision: vi.fn(),
  updateWorkspaceVision: vi.fn(),
}));

function renderVisionCard(workspaceId = 'ws-123') {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <VisionCard workspaceId={workspaceId} />
    </QueryClientProvider>,
  );
}

describe('VisionCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders existing vision statement', async () => {
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue(
      'Build a calm, creative life where I ship meaningful work.',
    );

    renderVisionCard();

    expect(screen.getByText(/Northstar Vision/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/"Build a calm, creative life where I ship meaningful work."/i),
    ).toBeInTheDocument();
  });

  it('renders prompt when vision is empty', async () => {
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue('');

    renderVisionCard();

    expect(
      await screen.findByText(/Define your lifetime anchor statement. Press V or click Edit./i),
    ).toBeInTheDocument();
  });

  it('opens dialog on clicking Edit and saves new vision', async () => {
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue('Initial Anchor');
    vi.mocked(visionApi.updateWorkspaceVision).mockResolvedValue('Updated Anchor Statement');

    renderVisionCard();

    const editButton = await screen.findByRole('button', { name: /Edit vision statement/i });
    fireEvent.click(editButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Lifetime Vision Anchor')).toBeInTheDocument();

    const textarea = screen.getByRole('textbox', { name: /Lifetime Vision Anchor/i });
    expect(textarea).toHaveValue('Initial Anchor');

    fireEvent.change(textarea, { target: { value: 'Updated Anchor Statement' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Vision/i }));

    await waitFor(() => {
      expect(visionApi.updateWorkspaceVision).toHaveBeenCalledWith(
        'ws-123',
        'Updated Anchor Statement',
      );
    });
  });

  it('opens dialog when user presses V key shortcut', async () => {
    vi.mocked(visionApi.fetchWorkspaceVision).mockResolvedValue('Existing Anchor');

    renderVisionCard();
    await screen.findByText(/"Existing Anchor"/i);

    fireEvent.keyDown(window, { key: 'v' });

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Edit Lifetime Vision Anchor')).toBeInTheDocument();
  });
});
