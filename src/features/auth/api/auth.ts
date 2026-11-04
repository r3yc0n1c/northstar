import { supabase } from '@/lib/supabase';

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: string | null;
  unconfirmed?: boolean;
}

/**
 * Signs up a new user with email and password.
 * Requests email verification with redirection to /auth/verify.
 */
export async function signUpWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign up failed';
    return { data: null, error: message };
  }
}

/**
 * Signs in an existing user with email and password.
 * Per FR-AUTH-3:
 * - Returns a generic error ("Email or password is incorrect") for wrong credentials
 *   to prevent account enumeration.
 * - Detects unconfirmed accounts so the UI can show a resend-verification prompt.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check if error is due to unconfirmed email
      if (
        error.message.toLowerCase().includes('email not confirmed') ||
        error.message.toLowerCase().includes('unconfirmed')
      ) {
        return {
          data: null,
          error: 'Please verify your email address before signing in.',
          unconfirmed: true,
        };
      }

      // Generic error for bad credentials (prevents account enumeration)
      return {
        data: null,
        error: 'Email or password is incorrect',
      };
    }

    return { data, error: null };
  } catch (_err) {
    return { data: null, error: 'Email or password is incorrect' };
  }
}

/**
 * Signs out the current user session.
 */
export async function signOutUser(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: null, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Sign out failed';
    return { data: null, error: message };
  }
}

/**
 * Resends the signup confirmation email to the user.
 */
export async function resendVerificationEmail(email: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Resend verification failed';
    return { data: null, error: message };
  }
}

/**
 * Initiates Google OAuth sign-in / sign-up requesting openid email profile scopes only.
 */
export async function signInWithGoogle(): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'openid email profile',
        redirectTo: `${window.location.origin}/auth/verify`,
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Google authentication failed';
    return { data: null, error: message };
  }
}

/**
 * Requests a password reset recovery email.
 * Per FR-AUTH-5:
 * Always returns a success outcome to the caller regardless of whether
 * the email exists in the system to prevent account enumeration.
 */
export async function requestPasswordReset(email: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (error) {
      if (error.status === 429) {
        return {
          data: null,
          error: 'Too many requests. Please wait a moment before trying again.',
        };
      }
    }

    return { data, error: null };
  } catch (_err) {
    // Mask unexpected errors to prevent enumeration
    return { data: null, error: null };
  }
}

/**
 * Updates the user's password using the active recovery session.
 * Per FR-AUTH-5.
 */
export async function updateUserPassword(password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update password';
    return { data: null, error: message };
  }
}
