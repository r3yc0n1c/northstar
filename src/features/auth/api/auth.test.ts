import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AuthError, type User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  resendVerificationEmail,
  requestPasswordReset,
  updateUserPassword,
} from './auth';

describe('Auth API Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('signInWithGoogle (FR-AUTH-4)', () => {
    it('initiates Google OAuth requesting openid, email, and profile scopes only (no Calendar)', async () => {
      const signInWithOAuthSpy = vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
        data: { provider: 'google', url: 'https://accounts.google.com/o/oauth2/auth' },
        error: null,
      });

      const res = await signInWithGoogle();

      expect(signInWithOAuthSpy).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          scopes: 'openid email profile',
          redirectTo: `${window.location.origin}/auth/verify`,
        },
      });

      expect(res.error).toBeNull();
      expect(res.data).toEqual({
        provider: 'google',
        url: 'https://accounts.google.com/o/oauth2/auth',
      });
    });

    it('returns error message if Google OAuth fails to initiate', async () => {
      vi.spyOn(supabase.auth, 'signInWithOAuth').mockResolvedValueOnce({
        data: { provider: 'google', url: null },
        error: new AuthError('Popup blocked by browser', 400),
      });

      const res = await signInWithGoogle();

      expect(res.data).toBeNull();
      expect(res.error).toBe('Popup blocked by browser');
    });
  });

  describe('signUpWithEmail (FR-AUTH-1, FR-AUTH-2)', () => {
    it('calls supabase.auth.signUp with emailRedirectTo /auth/verify', async () => {
      const signUpSpy = vi.spyOn(supabase.auth, 'signUp').mockResolvedValueOnce({
        data: { user: { id: 'usr-1' } as unknown as User, session: null },
        error: null,
      });

      const res = await signUpWithEmail('pilot@northstar.app', 'SecretPass123!');

      expect(signUpSpy).toHaveBeenCalledWith({
        email: 'pilot@northstar.app',
        password: 'SecretPass123!',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      expect(res.error).toBeNull();
    });
  });

  describe('signInWithEmail (FR-AUTH-3)', () => {
    it('returns generic error on bad credentials to prevent enumeration', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new AuthError('Invalid login credentials', 400),
      });

      const res = await signInWithEmail('pilot@northstar.app', 'wrong-pass');

      expect(res.error).toBe('Email or password is incorrect');
      expect(res.unconfirmed).toBeFalsy();
    });

    it('flags unconfirmed accounts for verification resend prompt', async () => {
      vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
        data: { user: null, session: null },
        error: new AuthError('Email not confirmed', 400),
      });

      const res = await signInWithEmail('pilot@northstar.app', 'password');

      expect(res.unconfirmed).toBe(true);
      expect(res.error).toBe('Please verify your email address before signing in.');
    });
  });

  describe('requestPasswordReset & updateUserPassword (FR-AUTH-5)', () => {
    it('requests password reset targeting /auth/update-password and masks errors', async () => {
      const resetSpy = vi.spyOn(supabase.auth, 'resetPasswordForEmail').mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const res = await requestPasswordReset('pilot@northstar.app');

      expect(resetSpy).toHaveBeenCalledWith('pilot@northstar.app', {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      expect(res.error).toBeNull();
    });

    it('updates user password via updateUser', async () => {
      const updateSpy = vi.spyOn(supabase.auth, 'updateUser').mockResolvedValueOnce({
        data: { user: { id: 'usr-1' } as unknown as User },
        error: null,
      });

      const res = await updateUserPassword('NewPass123!45');

      expect(updateSpy).toHaveBeenCalledWith({
        password: 'NewPass123!45',
      });
      expect(res.error).toBeNull();
    });
  });

  describe('signOutUser & resendVerificationEmail', () => {
    it('signs out user session cleanly', async () => {
      const signOutSpy = vi.spyOn(supabase.auth, 'signOut').mockResolvedValueOnce({
        error: null,
      });

      const res = await signOutUser();

      expect(signOutSpy).toHaveBeenCalled();
      expect(res.error).toBeNull();
    });

    it('resends verification email with /auth/verify redirect', async () => {
      const resendSpy = vi.spyOn(supabase.auth, 'resend').mockResolvedValueOnce({
        data: { user: null, session: null, messageId: null },
        error: null,
      });

      const res = await resendVerificationEmail('pilot@northstar.app');

      expect(resendSpy).toHaveBeenCalledWith({
        type: 'signup',
        email: 'pilot@northstar.app',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify`,
        },
      });
      expect(res.error).toBeNull();
    });
  });
});
