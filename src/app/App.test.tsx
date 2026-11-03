import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App routing and protection', () => {
  it('redirects unauthenticated visitor away from dashboard to sign-up', async () => {
    render(<App />);

    // Since user is unauthenticated, private dashboard /today is protected
    // and user is redirected to /sign-up
    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 1, name: /create your account/i }),
      ).toBeInTheDocument();
    });
  });
});
