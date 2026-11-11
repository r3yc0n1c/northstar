import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressChart } from './ProgressChart';
import type { KeyResult, KrCheckIn } from '../schema';

const mockKeyResult: KeyResult = {
  id: 'kr-1',
  workspace_id: 'ws-1',
  objective_id: 'obj-1',
  title: 'Conduct 20 customer interviews',
  description: 'Interview senior system architects',
  metric_type: 'numeric',
  baseline_value: 0,
  current_value: 12,
  target_value: 20,
  unit: 'interviews',
  currency_code: null,
  direction: 'increase',
  confidence: 8,
  start_date: '2026-10-01',
  due_date: '2026-12-31',
  created_at: '2026-10-01T00:00:00Z',
  updated_at: '2026-10-01T00:00:00Z',
  archived_at: null,
};

const mockCheckIns: KrCheckIn[] = [
  {
    id: 'ci-1',
    workspace_id: 'ws-1',
    key_result_id: 'kr-1',
    value: 5,
    raw_progress_percent: 25,
    progress_percent: 25,
    confidence: 8,
    notes: 'Kicked off first 5 interviews',
    evidence_url: null,
    supersedes_id: null,
    recorded_by: 'user-1',
    recorded_at: '2026-10-15T10:00:00Z',
    created_at: '2026-10-15T10:00:00Z',
  },
  {
    id: 'ci-2',
    workspace_id: 'ws-1',
    key_result_id: 'kr-1',
    value: 12,
    raw_progress_percent: 60,
    progress_percent: 60,
    confidence: 9,
    notes: 'Reached 12 interviews',
    evidence_url: null,
    supersedes_id: null,
    recorded_by: 'user-1',
    recorded_at: '2026-11-01T14:00:00Z',
    created_at: '2026-11-01T14:00:00Z',
  },
];

describe('ProgressChart', () => {
  it('renders progress chart with footer metadata and target legend', () => {
    render(<ProgressChart keyResult={mockKeyResult} checkIns={mockCheckIns} />);

    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    expect(screen.getByText(/2 check-ins logged/i)).toBeInTheDocument();
    expect(screen.getByText(/Target \(20 interviews\)/i)).toBeInTheDocument();
    expect(screen.getByText('Actual')).toBeInTheDocument();
  });

  it('renders baseline when no check-ins are present yet', () => {
    render(<ProgressChart keyResult={mockKeyResult} checkIns={[]} />);

    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    expect(screen.getByText(/0 check-ins logged/i)).toBeInTheDocument();
  });
});
