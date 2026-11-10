import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ObjectiveDialog } from './ObjectiveDialog';
import type { Cycle, Goal, Objective } from '../schema';

const CYCLE_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const WORKSPACE_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const GOAL_UUID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
const OBJECTIVE_UUID = 'f0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44';

const mockCycles: Cycle[] = [
  {
    id: CYCLE_UUID,
    workspace_id: WORKSPACE_UUID,
    name: 'Q4 2026',
    cycle_type: 'quarterly',
    start_date: '2026-10-01',
    end_date: '2026-12-31',
    status: 'active',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
];

const mockGoals: Goal[] = [
  {
    id: GOAL_UUID,
    workspace_id: WORKSPACE_UUID,
    domain_id: null,
    title: 'Acquire 100 Power Users',
    description: null,
    status: 'active',
    priority: 'high',
    start_date: null,
    target_date: null,
    archived_at: null,
    created_at: '2026-10-01T00:00:00Z',
    updated_at: '2026-10-01T00:00:00Z',
  },
];

describe('ObjectiveDialog', () => {
  it('renders create mode and validates required fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <ObjectiveDialog
        isOpen={true}
        onClose={onClose}
        cycles={mockCycles}
        goals={mockGoals}
        defaultCycleId={CYCLE_UUID}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('New Objective')).toBeInTheDocument();

    // Submit with empty title
    fireEvent.click(screen.getByRole('button', { name: /Create Objective/i }));
    expect(await screen.findByText(/Objective title is required/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();

    // Fill valid title
    fireEvent.change(screen.getByLabelText(/Objective Title/i), {
      target: { value: 'Launch beta product craftsmanship' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Objective/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          cycle_id: CYCLE_UUID,
          title: 'Launch beta product craftsmanship',
          status: 'active',
          confidence: 7,
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('rejects due_date before start_date with validation error', async () => {
    const onSave = vi.fn();

    render(
      <ObjectiveDialog
        isOpen={true}
        onClose={vi.fn()}
        cycles={mockCycles}
        goals={mockGoals}
        defaultCycleId={CYCLE_UUID}
        onSave={onSave}
        isSaving={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Objective Title/i), {
      target: { value: 'Time travel objective' },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: '2026-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/Due Date/i), {
      target: { value: '2026-10-01' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Objective/i }));

    expect(await screen.findByText(/Due date must be on or after start date/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('populates fields in edit mode and submits updates', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const existingObjective: Objective = {
      id: OBJECTIVE_UUID,
      workspace_id: WORKSPACE_UUID,
      cycle_id: CYCLE_UUID,
      goal_id: GOAL_UUID,
      title: 'Existing Objective Title',
      description: 'Existing description',
      status: 'active',
      priority: 'high',
      confidence: 9,
      start_date: '2026-10-01',
      due_date: '2026-12-31',
      archived_at: null,
      created_at: '2026-10-01T00:00:00Z',
      updated_at: '2026-10-01T00:00:00Z',
    };

    render(
      <ObjectiveDialog
        isOpen={true}
        onClose={onClose}
        objective={existingObjective}
        cycles={mockCycles}
        goals={mockGoals}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Edit Objective')).toBeInTheDocument();
    expect(screen.getByLabelText(/Objective Title/i)).toHaveValue('Existing Objective Title');

    fireEvent.change(screen.getByLabelText(/Objective Title/i), {
      target: { value: 'Updated Objective Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Objective Title',
          cycle_id: CYCLE_UUID,
          goal_id: GOAL_UUID,
          confidence: 9,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
