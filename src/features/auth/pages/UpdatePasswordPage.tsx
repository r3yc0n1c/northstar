import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, Eye, EyeOff, Lock } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { MIN_PASSWORD_LENGTH, getPasswordStrength } from '@/domain/password';
import { supabase } from '@/lib/supabase';
import { CelestialGuidance } from '../components/CelestialGuidance';
import { RECOVERY_STORAGE_KEY, useAuth } from '../context/AuthContext';
import { updatePasswordSchema } from '../schema';
import { updateUserPassword } from '../api/auth';

export function UpdatePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, loading, signOut } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRecoveryEvent, setHasRecoveryEvent] = useState(false);

  // Check URL for error params (e.g. expired or invalid recovery token)
  const hash = location.hash;
  const searchParams = new URLSearchParams(location.search);
  const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);
  const urlError =
    searchParams.get('error_description') ||
    hashParams.get('error_description') ||
    searchParams.get('error') ||
    hashParams.get('error');

  useEffect(() => {
    // If arriving with recovery hash tokens, establish recovery mode immediately
    const hashParams = new URLSearchParams(
      location.hash.startsWith('#') ? location.hash.substring(1) : location.hash,
    );
    if (hashParams.get('type') === 'recovery') {
      try {
        localStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
      } catch {}
      setHasRecoveryEvent(true);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setHasRecoveryEvent(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.hash]);

  const strength = getPasswordStrength(password);
  const isAuthorized = Boolean(!urlError && (session || hasRecoveryEvent));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = updatePasswordSchema.safeParse({ password, confirmPassword });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please check your password inputs');
      return;
    }

    setIsSubmitting(true);
    const res = await updateUserPassword(password);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Per OWASP recommendations: Do not keep the recovery session active after a password reset.
    // Invalidate the recovery session and return the user to the standard login flow.
    await signOut();
    navigate('/auth/sign-in', {
      replace: true,
      state: { message: 'Password updated successfully. Please sign in with your new password.' },
    });
  };

  return (
    <main className="min-h-screen w-full flex flex-col lg:flex-row bg-bg selection:bg-highlight selection:text-bg">
      {/* Left Form Column */}
      <section
        className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-14 min-h-screen"
        data-purpose="auth-form-column"
      >
        {/* Top Brand Header */}
        <header className="flex items-center justify-between" data-purpose="brand-header">
          <Link
            to="/"
            className="inline-flex items-center gap-3 group focus:outline-none focus:ring-1 focus:ring-highlight rounded p-1"
          >
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center transition-colors group-hover:border-highlight shadow-sm">
              <svg
                className="w-4 h-4 text-highlight"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-semibold tracking-tight text-text text-base">Northstar</span>
              <span className="font-mono text-xs uppercase tracking-widest text-text-2 font-medium">
                OS v2.4
              </span>
            </div>
          </Link>
        </header>

        {/* Center Content */}
        <div className="w-full max-w-[420px] mx-auto py-8 lg:py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-8 h-8 border-2 border-highlight border-t-transparent rounded-full animate-spin" />
              <p className="text-xs font-mono text-text-2">VERIFYING RECOVERY SESSION...</p>
            </div>
          ) : !isAuthorized ? (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger flex items-center justify-center text-danger">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
                  Invalid or expired link
                </h1>
                <p className="text-sm text-text-2 mt-2 leading-relaxed">
                  {urlError
                    ? decodeURIComponent(urlError)
                    : 'This password recovery link has expired or has already been used. Please request a new recovery link.'}
                </p>
              </div>

              <div className="pt-2">
                <Link to="/auth/reset-password" className="block w-full">
                  <Button variant="primary" className="w-full h-10">
                    Request new reset link
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
                  Set new password
                </h1>
                <p className="text-sm text-text-2 mt-1 font-normal">
                  Choose a strong password to secure your Northstar account.
                </p>
              </div>

              {error && (
                <div
                  className="mb-4 p-2.5 bg-danger/10 border border-danger text-danger text-xs rounded-[6px]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* New Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="new-password"
                    className="block text-xs font-medium text-text-2 tracking-wide"
                  >
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 10 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10 pl-3 pr-10 bg-surface border-border rounded-[6px] text-text text-sm font-mono tracking-widest placeholder:text-text-3"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-2 hover:text-text p-1 transition-colors focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* 4-segment Strength Indicator */}
                  <div className="mt-2 space-y-1.5">
                    <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
                      {[0, 1, 2, 3].map((idx) => (
                        <div
                          key={idx}
                          className={`h-[3px] rounded-full transition-colors ${
                            idx < strength.segments ? 'bg-highlight' : 'bg-border'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-text-2">
                      <span className="text-xs text-text-2">
                        At least {MIN_PASSWORD_LENGTH} characters
                      </span>
                      {password.length > 0 && (
                        <span className="font-mono text-[11px] uppercase tracking-wider text-text-2">
                          {strength.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="confirm-password"
                    className="block text-xs font-medium text-text-2 tracking-wide"
                  >
                    Confirm new password
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      className="h-10 pl-3 pr-10 bg-surface border-border rounded-[6px] text-text text-sm font-mono tracking-widest placeholder:text-text-3"
                    />
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-2 hover:text-text p-1 transition-colors focus:outline-none"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    className="w-full h-10 px-4 rounded-[6px] bg-accent hover:bg-accent-hover text-text font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-bg active:scale-[0.99]"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Update password</span>
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>

                {/* Cancel and return to sign in */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      navigate('/auth/sign-in', { replace: true });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-text-2 hover:text-highlight transition-colors underline-offset-4 hover:underline"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Cancel and return to sign in</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Bottom System Status Footer */}
        <footer
          className="text-[11px] text-text-3 flex justify-between items-center"
          data-purpose="column-footer"
        >
          <span className="font-mono">SYS.STATUS: OPERATIONAL</span>
          <span>Secure Telemetry Auth</span>
        </footer>
      </section>

      {/* Right Visual Brand Column */}
      <CelestialGuidance />
    </main>
  );
}
