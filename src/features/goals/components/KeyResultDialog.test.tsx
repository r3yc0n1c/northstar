import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KeyResultDialog } from './KeyResultDialog';
import type { KeyResult, Objective } from '../schema';

const OBJECTIVE_UUID = 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
const KR_UUID = 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';

const mockObjective: Objective = {
  id: OBJECTIVE_UUID,
  workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
  cycle_id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
  goal_id: null,
  title: 'Launch Self-Serve Onboarding Flow',
  description: 'Streamline signup-to-active conversion',
  status: 'active',
  priority: 'high',
  confidence: 8,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  archived_at: null,
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
};

describe('KeyResultDialog', () => {
  it('renders create mode and validates required fields', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <KeyResultDialog
        isOpen={true}
        onClose={onClose}
        objective={mockObjective}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('New Key Result')).toBeInTheDocument();

    // Fill valid numeric KR
    fireEvent.change(screen.getByLabelText(/Key Result Title/i), {
      target: { value: 'Grow weekly active users to 5,000' },
    });
    fireEvent.change(screen.getByLabelText(/Baseline/i), {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getByLabelText(/Current/i), {
      target: { value: '2500' },
    });
    fireEvent.change(screen.getByLabelText(/Target/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Unit/i), {
      target: { value: 'users' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Key Result/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          objective_id: OBJECTIVE_UUID,
          title: 'Grow weekly active users to 5,000',
          metric_type: 'numeric',
          baseline_value: 1000,
          current_value: 2500,
          target_value: 5000,
          unit: 'users',
          direction: 'increase',
          start_date: '2026-10-01',
          due_date: '2026-12-31',
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('switches to binary metric type and saves valid binary KR', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <KeyResultDialog
        isOpen={true}
        onClose={onClose}
        objective={mockObjective}
        onSave={onSave}
        isSaving={false}
      />,
    );

    // Switch to binary mode
    fireEvent.click(screen.getByRole('button', { name: /Binary \(Done \/ Not Done\)/i }));

    fireEvent.change(screen.getByLabelText(/Key Result Title/i), {
      target: { value: 'Complete SOC2 certification audit' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Key Result/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          objective_id: OBJECTIVE_UUID,
          title: 'Complete SOC2 certification audit',
          metric_type: 'binary',
          baseline_value: 0,
          current_value: 0,
          target_value: 1,
          direction: null,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('rejects target <= baseline for increase key result with inline error', async () => {
    const onSave = vi.fn();

    render(
      <KeyResultDialog
        isOpen={true}
        onClose={vi.fn()}
        objective={mockObjective}
        onSave={onSave}
        isSaving={false}
      />,
    );

    fireEvent.change(screen.getByLabelText(/Key Result Title/i), {
      target: { value: 'Invalid increase KR' },
    });
    fireEvent.change(screen.getByLabelText(/Baseline/i), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByLabelText(/Target/i), {
      target: { value: '50' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Key Result/i }));

    expect(
      await screen.findByText(/Target value must be greater than baseline value/i),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('populates fields in edit mode and saves updates', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    const existingKr: KeyResult = {
      id: KR_UUID,
      workspace_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a00',
      objective_id: OBJECTIVE_UUID,
      title: 'Current Active Users',
      description: 'Internal telemetry count',
      metric_type: 'numeric',
      baseline_value: 0,
      current_value: 200,
      target_value: 1000,
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

    render(
      <KeyResultDialog
        isOpen={true}
        onClose={onClose}
        keyResult={existingKr}
        objective={mockObjective}
        onSave={onSave}
        isSaving={false}
      />,
    );

    expect(screen.getByText('Edit Key Result')).toBeInTheDocument();
    expect(screen.getByLabelText(/Key Result Title/i)).toHaveValue('Current Active Users');

    fireEvent.change(screen.getByLabelText(/Key Result Title/i), {
      target: { value: 'Updated Active Users Title' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Active Users Title',
          baseline_value: 0,
          current_value: 200,
          target_value: 1000,
        }),
      );
      expect(onClose).toHaveBeenCalled();
    });
  });
});
