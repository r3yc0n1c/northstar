import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { StatusBadge } from './status-badge';

describe('StatusBadge', () => {
  it('renders on_track with icon and label', () => {
    render(<StatusBadge status="on_track" />);
    expect(screen.getByText('On track')).toBeInTheDocument();
  });

  it('renders at_risk status', () => {
    render(<StatusBadge status="at_risk" />);
    expect(screen.getByText('At risk')).toBeInTheDocument();
  });

  it('renders off_track status', () => {
    render(<StatusBadge status="off_track" />);
    expect(screen.getByText('Off track')).toBeInTheDocument();
  });

  it('renders not_started status', () => {
    render(<StatusBadge status="not_started" />);
    expect(screen.getByText('Not started')).toBeInTheDocument();
  });

  it('renders achieved status', () => {
    render(<StatusBadge status="achieved" />);
    expect(screen.getByText('Achieved')).toBeInTheDocument();
  });
});
