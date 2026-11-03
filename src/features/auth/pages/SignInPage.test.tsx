import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AuthProvider } from '../context/AuthContext';
import { SignInPage } from './SignInPage';

describe('SignInPage', () => {
  it('renders split layout with brand header, welcome back heading, and telemetry footer', () => {
    render(
      <AuthProvider initialSession={null} initialLoading={false}>
        <MemoryRouter>
          <SignInPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to your personal operating system/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /northstar/i })).toBeInTheDocument();
    expect(screen.getByText(/sys\.status: operational/i)).toBeInTheDocument();
    expect(screen.getByText(/secure telemetry auth/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });
});
