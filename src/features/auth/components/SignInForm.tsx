import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { signInSchema, type SignInFormValues } from '../schema';
import { signInWithEmail, signInWithGoogle, resendVerificationEmail } from '../api/auth';

const RESEND_COOLDOWN_SECONDS = 60;

export function SignInForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignInFormValues | 'root', string>>>(
    {},
  );
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  // Return URL preserved from location.state.from (FR-AUTH-7)
  const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/today';
  const statusMessage = (location.state as { message?: string })?.message;

  // Cooldown countdown timer for unverified resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setUnconfirmed(false);
    setResendMessage(null);

    const result = signInSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignInFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignInFormValues;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (res.unconfirmed) {
      setUnconfirmed(true);
      return;
    }

    if (res.error) {
      setErrors({ root: res.error });
      return;
    }

    // Redirect to deep link origin or default to /today
    navigate(from, { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrors({ root: res.error });
      setIsGoogleLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || cooldown > 0 || resending) return;
    setResending(true);
    setResendMessage(null);

    const res = await resendVerificationEmail(email);
    setResending(false);

    if (res.error) {
      setResendMessage(res.error);
    } else {
      setResendMessage('A fresh confirmation link has been sent to your email.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-8 lg:py-4" data-purpose="auth-form-content">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-text-2 mt-1 font-normal">
          Sign in to your personal operating system.
        </p>
      </div>

      {/* Success Status Banner */}
      {statusMessage && (
        <div
          className="mb-4 p-2.5 bg-success/10 border border-success text-success text-xs rounded-[6px]"
          role="status"
        >
          {statusMessage}
        </div>
      )}

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isSubmitting}
        className="w-full h-10 px-4 rounded-[6px] bg-surface-2 border border-border hover:bg-surface text-text font-sans text-sm font-medium flex items-center justify-center gap-3 transition-colors duration-150 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
            fill="#4285F4"
          />
          <path
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.94H1.26v3.13C3.25 21.31 7.31 24 12 24z"
            fill="#34A853"
          />
          <path
            d="M5.28 14.28c-.25-.72-.38-1.49-.38-2.28s.13-1.56.38-2.28V6.59H1.26C.46 8.19 0 9.99 0 12s.46 3.81 1.26 5.41l4.02-3.13z"
            fill="#FBBC05"
          />
          <path
            d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.23 0 12 0 7.31 0 3.25 2.69 1.26 6.59l4.02 3.13c.95-2.84 3.6-4.95 6.72-4.95z"
            fill="#EA4335"
          />
        </svg>
        <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
      </button>

      {/* Divider */}
      <div className="relative my-6 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <span className="relative px-3 bg-bg font-mono text-[11px] text-text-2 uppercase tracking-wider">
          or
        </span>
      </div>

      {/* Unconfirmed Email Notice Banner (FR-AUTH-3) */}
      {unconfirmed && (
        <div
          role="alert"
          className="mb-4 p-3 bg-surface-2 border border-warning/50 rounded-[6px] text-left text-xs"
        >
          <p className="font-medium text-text">Please verify your email address</p>
          <p className="text-text-2 mt-0.5">
            We sent a confirmation link to{' '}
            <span className="font-mono text-text font-medium">{email}</span>.
          </p>
          {resendMessage && <p className="mt-1 text-success font-medium">{resendMessage}</p>}
          <div className="mt-2">
            <button
              type="button"
              disabled={cooldown > 0 || resending}
              onClick={handleResend}
              className="inline-flex items-center gap-1 text-highlight hover:underline font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>
                {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend verification email'}
              </span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Generic Form Error Banner (FR-AUTH-3) */}
      {errors.root && (
        <div
          className="mb-4 p-2.5 bg-danger/10 border border-danger text-danger text-xs rounded-[6px]"
          role="alert"
        >
          {errors.root}
        </div>
      )}

      {/* Sign In Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signin-email"
            className="block text-xs font-medium text-text-2 tracking-wide"
          >
            Email
          </Label>
          <Input
            id="signin-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            disabled={isSubmitting}
            className={`h-10 px-3 bg-surface border-border rounded-[6px] text-text text-sm font-sans placeholder:text-text-3 ${
              errors.email
                ? 'border-danger focus-visible:ring-danger'
                : 'focus:border-highlight focus:ring-1 focus:ring-highlight'
            }`}
          />
          {errors.email && (
            <p className="text-xs text-danger" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="signin-password"
              className="block text-xs font-medium text-text-2 tracking-wide"
            >
              Password
            </Label>
            <Link
              to="/auth/reset-password"
              className="text-xs text-highlight hover:underline font-medium focus:outline-none focus:ring-1 focus:ring-highlight rounded"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              disabled={isSubmitting}
              className={`h-10 pl-3 pr-10 bg-surface border-border rounded-[6px] text-text text-sm font-mono tracking-widest placeholder:text-text-3 ${
                errors.password
                  ? 'border-danger focus-visible:ring-danger'
                  : 'focus:border-highlight focus:ring-1 focus:ring-highlight'
              }`}
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
          {errors.password && (
            <p className="text-xs text-danger" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* Primary Submit Button */}
        <div className="pt-2">
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full h-10 px-4 rounded-[6px] bg-accent hover:bg-accent-hover text-text font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-bg active:scale-[0.99]"
          >
            <span>Sign in</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Footer Sign-up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-2">
          Don't have an account?{' '}
          <Link
            to="/auth/sign-up"
            className="text-highlight hover:text-text transition-colors underline-offset-4 hover:underline font-medium"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
