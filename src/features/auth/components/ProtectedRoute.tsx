import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Route guard that ensures the user is:
 * 1. Authenticated (session and user present)
 * 2. Email-verified (user.email_confirmed_at is set)
 *
 * Per FR-AUTH-2 and FR-AUTH-7:
 * - Unauthenticated users are redirected to /sign-in, preserving original location in state.
 * - Authenticated but unverified users cannot reach any private route and are redirected
 *   to /auth/verify-required.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, user, loading } = useAuth();
  const location = useLocation();

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

  // 1. Not signed in -> redirect to /sign-in with return URL
  if (!session || !user) {
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // 2. Unverified email -> block access to all private routes (FR-AUTH-2)
  if (!user.email_confirmed_at) {
    return <Navigate to="/auth/verify-required" replace />;
  }

  return children ? children : <Outlet />;
}
