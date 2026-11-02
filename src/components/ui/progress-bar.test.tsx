import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './progress-bar';

describe('ProgressBar', () => {
  it('renders progress bar with label and mono percentage', () => {
    render(<ProgressBar label="Health" value={75} showValue />);
    expect(screen.getByText('Health')).toBeInTheDocument();
    expect(screen.getByText('75%')).toHaveClass('font-mono-num');
  });

  it('clamps values below 0 to 0%', () => {
    render(<ProgressBar value={-10} showValue />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('clamps values above 100 to 100%', () => {
    render(<ProgressBar value={120} showValue />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});
