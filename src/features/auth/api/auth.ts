import { supabase } from '@/lib/supabase';

export interface AuthResponse<T = unknown> {
  data: T | null;
  error: string | null;
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
