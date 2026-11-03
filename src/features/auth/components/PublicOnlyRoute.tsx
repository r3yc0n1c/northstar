import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface PublicOnlyRouteProps {
  children?: ReactNode;
}

/**
 * Route guard for public-only auth routes (e.g. /sign-up, /sign-in).
 * Per FR-AUTH-7:
 * Authenticated and email-verified users hitting auth pages are redirected to /today.
 */
export function PublicOnlyRoute({ children }: PublicOnlyRouteProps) {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading application"
        className="min-h-screen bg-bg flex items-center justify-center p-4"
      >
        <div className="w-8 h-8 border-2 border-highlight border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Already authenticated & email-verified -> navigate to dashboard
  if (session && user?.email_confirmed_at) {
    return <Navigate to="/today" replace />;
  }

  return children ? children : <Outlet />;
}
