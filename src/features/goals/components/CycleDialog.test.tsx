import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CycleDialog } from './CycleDialog';
import type { Cycle } from '../schema';

describe('CycleDialog', () => {
  it('renders create mode and validates date order', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<CycleDialog isOpen={true} onClose={onClose} onSave={onSave} isSaving={false} />);

    expect(screen.getByText('New Planning Cycle')).toBeInTheDocument();

    // Fill invalid dates: end_date < start_date
    fireEvent.change(screen.getByLabelText(/Cycle Name/i), {
      target: { value: 'Broken Quarter' },
    });
    fireEvent.change(screen.getByLabelText(/Start Date/i), {
      target: { value: '2026-12-31' },
    });
    fireEvent.change(screen.getByLabelText(/End Date/i), {
      target: { value: '2026-01-01' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Cycle/i }));

    expect(await screen.findByText(/End date must be on or after start date/i)).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('autofills current quarter with valid boundaries', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(<CycleDialog isOpen={true} onClose={onClose} onSave={onSave} isSaving={false} />);

    const autofillBtn = screen.getByRole('button', { name: /Autofill Current Quarter/i });
    fireEvent.click(autofillBtn);

    const nameInput = screen.getByLabelText(/Cycle Name/i);
    expect(nameInput).not.toHaveValue('');

    fireEvent.click(screen.getByRole('button', { name: /Create Cycle/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          cycle_type: 'quarterly',
          status: 'active',
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('populates fields in edit mode', () => {
    const existingCycle: Cycle = {
      id: 'c-123',
      workspace_id: 'ws-123',
      name: 'Q4 2026',
      cycle_type: 'quarterly',
      start_date: '2026-10-01',
      end_date: '2026-12-31',
      status: 'active',
      created_at: '2026-11-01T00:00:00Z',
      updated_at: '2026-11-01T00:00:00Z',
    };

    render(
      <CycleDialog
        isOpen={true}
        onClose={vi.fn()}
        cycle={existingCycle}
        onSave={vi.fn()}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Edit Planning Cycle')).toBeInTheDocument();
    expect(screen.getByLabelText(/Cycle Name/i)).toHaveValue('Q4 2026');
    expect(screen.getByRole('button', { name: /Save Changes/i })).toBeInTheDocument();
  });
});
