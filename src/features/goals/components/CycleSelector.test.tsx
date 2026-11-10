import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CycleSelector } from './CycleSelector';
import type { Cycle } from '../schema';

const cycle1: Cycle = {
  id: 'c-1',
  workspace_id: 'ws-123',
  name: 'Q3 2026',
  cycle_type: 'quarterly',
  start_date: '2026-07-01',
  end_date: '2026-09-30',
  status: 'closed',
  created_at: '2026-07-01T00:00:00Z',
  updated_at: '2026-07-01T00:00:00Z',
};

const cycle2: Cycle = {
  id: 'c-2',
  workspace_id: 'ws-123',
  name: 'Q4 2026',
  cycle_type: 'quarterly',
  start_date: '2026-10-01',
  end_date: '2026-12-31',
  status: 'active',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockCycles: Cycle[] = [cycle1, cycle2];

describe('CycleSelector', () => {
  it('renders selected cycle label and enables prev/next navigation', () => {
    const onSelect = vi.fn();

    render(
      <CycleSelector
        cycles={mockCycles}
        selectedCycle={cycle2}
        onSelectCycle={onSelect}
        onCreateCycle={vi.fn()}
      />,
    );

    expect(screen.getByText(/Q4 2026 · 2026-10-01 – 2026-12-31/i)).toBeInTheDocument();

    const prevButton = screen.getByRole('button', { name: /Previous cycle/i });
    expect(prevButton).not.toBeDisabled();
    fireEvent.click(prevButton);
    expect(onSelect).toHaveBeenCalledWith(cycle1);
  });

  it('triggers update cycle dialog when clicking edit current cycle button', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);

    render(
      <CycleSelector
        cycles={mockCycles}
        selectedCycle={cycle2}
        onSelectCycle={vi.fn()}
        onCreateCycle={vi.fn()}
        onUpdateCycle={onUpdate}
      />,
    );

    const editBtn = screen.getByRole('button', { name: `Edit ${cycle2.name}` });
    fireEvent.click(editBtn);

    expect(screen.getByText('Edit Planning Cycle')).toBeInTheDocument();
    const nameInput = screen.getByLabelText(/Cycle Name/i);
    expect(nameInput).toHaveValue('Q4 2026');

    fireEvent.change(nameInput, { target: { value: 'Q4 2026 Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(
        cycle2.id,
        expect.objectContaining({ name: 'Q4 2026 Updated' }),
      );
    });
  });

  it('triggers delete cycle when clicking delete button', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <CycleSelector
        cycles={mockCycles}
        selectedCycle={cycle2}
        onSelectCycle={vi.fn()}
        onCreateCycle={vi.fn()}
        onDeleteCycle={onDelete}
      />,
    );

    const deleteBtn = screen.getByRole('button', {
      name: `Delete ${cycle2.name}`,
    });
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(cycle2.id);
    });
  });
});
