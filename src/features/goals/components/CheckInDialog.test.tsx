import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CheckInDialog } from './CheckInDialog';
import type { KeyResult, KrCheckIn } from '../schema';

const KR_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
const CHECKIN_UUID = 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';

const mockKeyResult: KeyResult = {
  id: KR_UUID,
  workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
  objective_id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  title: 'Grow weekly active users to 5,000',
  description: 'Product engagement metric',
  metric_type: 'numeric',
  baseline_value: 0,
  current_value: 2000,
  target_value: 5000,
  unit: 'users',
  currency_code: null,
  direction: 'increase',
  confidence: 8,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

const mockBinaryKr: KeyResult = {
  ...mockKeyResult,
  id: 'e0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
  title: 'Complete SOC 2 Audit',
  metric_type: 'binary',
  baseline_value: 0,
  current_value: 0,
  target_value: 1,
  direction: null,
  unit: '',
};

describe('CheckInDialog', () => {
  it('renders standard check-in mode and permanent append-only helper text', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CheckInDialog
        isOpen={true}
        onClose={onClose}
        keyResult={mockKeyResult}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Record Progress Check-In')).toBeInTheDocument();
    expect(screen.getByText(/Check-ins are append-only and permanent/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/New Current Value/i), {
      target: { value: '3500' },
    });
    fireEvent.change(screen.getByLabelText(/Notes \/ Context/i), {
      target: { value: 'Strong user acquisition week' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Record Check-In/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          key_result_id: KR_UUID,
          value: 3500,
          notes: 'Strong user acquisition week',
          supersedes_id: null,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('renders correction mode with banner and includes supersedes_id on submit', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const previousCheckIn: KrCheckIn = {
      id: CHECKIN_UUID,
      workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
      key_result_id: KR_UUID,
      value: 2000,
      raw_progress_percent: 40,
      progress_percent: 40,
      confidence: 7,
      notes: 'Initial faulty measurement',
      evidence_url: null,
      supersedes_id: null,
      recorded_by: 'user-1',
      recorded_at: '2026-10-15T00:00:00Z',
      created_at: '2026-10-15T00:00:00Z',
    };

    render(
      <CheckInDialog
        isOpen={true}
        onClose={onClose}
        keyResult={mockKeyResult}
        supersedesCheckIn={previousCheckIn}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Correct Check-In')).toBeInTheDocument();
    expect(screen.getByText(/Correction Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/will supersede the previous check-in/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/New Current Value/i), {
      target: { value: '2200' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Record Correction/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          key_result_id: KR_UUID,
          value: 2200,
          supersedes_id: CHECKIN_UUID,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles binary check-in', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <CheckInDialog
        isOpen={true}
        onClose={onClose}
        keyResult={mockBinaryKr}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByLabelText(/Completion Status/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Record Check-In/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          key_result_id: mockBinaryKr.id,
          value: 0,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
