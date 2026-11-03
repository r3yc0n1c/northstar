import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { getPasswordStrength, MIN_PASSWORD_LENGTH } from '@/domain/password';
import { signUpSchema, type SignUpFormValues } from '../schema';
import { signInWithGoogle, signUpWithEmail } from '../api/auth';

interface SignUpFormProps {
  onSuccess: (email: string) => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormValues | 'root', string>>>(
    {},
  );

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof SignUpFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof SignUpFormValues;
        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const res = await signUpWithEmail(email, password);
    setIsSubmitting(false);

    if (res.error) {
      setErrors({ root: res.error });
      return;
    }

    onSuccess(email);
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const res = await signInWithGoogle();
    if (res.error) {
      setErrors({ root: res.error });
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] mx-auto py-8 lg:py-4" data-purpose="auth-form-content">
      {/* Title & Subtitle */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
          Create your account
        </h1>
        <p className="text-sm text-text-2 mt-1 font-normal">Plan what matters. Do what's next.</p>
      </div>

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

      {/* Form Error */}
      {errors.root && (
        <div
          className="mb-4 p-2.5 bg-danger/10 border border-danger text-danger text-xs rounded-[6px]"
          role="alert"
        >
          {errors.root}
        </div>
      )}

      {/* Sign Up Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Email Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-email"
            className="block text-xs font-medium text-text-2 tracking-wide"
          >
            Email
          </Label>
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!errors.email}
            className={`h-10 px-3 bg-surface border-border rounded-[6px] text-text text-sm font-sans placeholder:text-text-3 ${
              errors.email
                ? 'border-danger focus-visible:ring-danger'
                : 'focus:border-highlight focus:ring-1 focus:ring-highlight'
            }`}
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="text-xs text-danger" role="alert">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-password"
            className="block text-xs font-medium text-text-2 tracking-wide"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 10 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!errors.password}
              className={`h-10 pl-3 pr-10 bg-surface border-border rounded-[6px] text-text text-sm font-mono tracking-widest placeholder:text-text-3 ${
                errors.password
                  ? 'border-danger focus-visible:ring-danger'
                  : 'focus:border-highlight focus:ring-1 focus:ring-highlight'
              }`}
              disabled={isSubmitting}
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
              <span className="text-xs text-text-2">At least {MIN_PASSWORD_LENGTH} characters</span>
              <span className="font-mono-num text-[11px] text-highlight font-medium">
                {strength.label} ({strength.segments}/4)
              </span>
            </div>
          </div>

          {errors.password && (
            <p className="text-xs text-danger" role="alert">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-1.5">
          <Label
            htmlFor="signup-confirm-password"
            className="block text-xs font-medium text-text-2 tracking-wide"
          >
            Confirm password
          </Label>
          <div className="relative">
            <Input
              id="signup-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={!!errors.confirmPassword}
              className={`h-10 pl-3 pr-10 bg-surface border-border rounded-[6px] text-text text-sm font-mono tracking-widest placeholder:text-text-3 ${
                errors.confirmPassword
                  ? 'border-danger focus-visible:ring-danger'
                  : 'focus:border-highlight focus:ring-1 focus:ring-highlight'
              }`}
              disabled={isSubmitting}
            />
            <button
              type="button"
              aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-2 hover:text-text p-1 transition-colors focus:outline-none"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-danger" role="alert">
              {errors.confirmPassword}
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
            <span>Create account</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>

      {/* Footer Sign-in Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-text-2">
          Already have an account?{' '}
          <Link
            to="/auth/sign-in"
            className="text-highlight hover:text-text transition-colors underline-offset-4 hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
