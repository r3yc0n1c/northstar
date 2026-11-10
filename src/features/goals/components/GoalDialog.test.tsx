import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { GoalDialog } from './GoalDialog';
import type { Domain, Goal } from '../schema';

const mockDomains: Domain[] = [
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    workspace_id: 'ws-123',
    name: 'Craft & Code',
    color: '#5A4F7C',
    icon: 'briefcase',
    sort_order: 0,
    archived_at: null,
    created_at: '2026-11-01T00:00:00Z',
    updated_at: '2026-11-01T00:00:00Z',
  },
];

describe('GoalDialog', () => {
  it('renders create mode and validates required fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <GoalDialog
        isOpen={true}
        onClose={onClose}
        domains={mockDomains}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('New Goal')).toBeInTheDocument();

    // Attempt submit with empty title
    fireEvent.click(screen.getByRole('button', { name: /Create Goal/i }));
    expect(await screen.findByText(/Goal title is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    // Fill valid title
    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'Launch Northstar OS v1.0' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Goal/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Launch Northstar OS v1.0',
          priority: 'none',
          status: 'active',
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('rejects target_date before start_date with inline error', async () => {
    const onSave = vi.fn();

    render(
      <GoalDialog
        isOpen={true}
        onClose={vi.fn()}
        domains={mockDomains}
        onSave={onSave}
        isSaving={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Goal Title/i), {
      target: { value: 'Time Travel Project' },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: '2026-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/Target Date/i), {
      target: { value: '2026-01-01' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Goal/i }));

    expect(
      await screen.findByText(/Target date must be on or after start date/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('populates fields in edit mode', () => {
    const existingGoal: Goal = {
      id: 'g-123',
      workspace_id: 'ws-123',
      domain_id: mockDomains[0]?.id || null,
      title: 'Run a Marathon',
      description: 'Under 4 hours',
      priority: 'high',
      status: 'active',
      start_date: '2026-01-01',
      target_date: '2026-10-31',
      archived_at: null,
      created_at: '2026-11-01T00:00:00Z',
      updated_at: '2026-11-01T00:00:00Z',
    };

    render(
      <GoalDialog
        isOpen={true}
        onClose={vi.fn()}
        goal={existingGoal}
        domains={mockDomains}
        onSave={vi.fn()}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal Title/i)).toHaveValue('Run a Marathon');
    expect(screen.getByLabelText(/Description/i)).toHaveValue('Under 4 hours');
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});
