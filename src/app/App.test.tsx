import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App', () => {
  it('renders app title and link to kitchen sink', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Northstar');
    expect(
      screen.getByRole('button', { name: /open component kitchen sink/i }),
    ).toBeInTheDocument();
  });
});
