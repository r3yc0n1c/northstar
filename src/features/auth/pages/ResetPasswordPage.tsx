import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button, Input, Label } from '@/components/ui';
import { CelestialGuidance } from '../components/CelestialGuidance';
import { resetPasswordRequestSchema } from '../schema';
import { requestPasswordReset } from '../api/auth';

export function ResetPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = resetPasswordRequestSchema.safeParse({ email });
    if (!result.success) {
      setError(result.error.issues[0]?.message || 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    const res = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (res.error) {
      setError(res.error);
      return;
    }

    // Always show identical confirmation to avoid account enumeration (FR-AUTH-5)
    setSubmitted(true);
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
          {submitted ? (
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-full bg-success/10 border border-success flex items-center justify-center text-success">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
                  Check your inbox
                </h1>
                <p className="text-sm text-text-2 mt-2 leading-relaxed">
                  If an account exists for{' '}
                  <span className="font-mono text-text font-medium">{email}</span>, a reset link is
                  on its way. Please check your inbox and spam folder.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link to="/auth/sign-in" className="block w-full">
                  <Button variant="primary" className="w-full h-10">
                    Back to sign in
                  </Button>
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setSubmitted(false);
                    setEmail('');
                  }}
                  className="w-full h-9 text-xs text-text-2 hover:text-text"
                >
                  Try another email
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {/* Title & Subtitle */}
              <div className="mb-6">
                <h1 className="text-2xl sm:text-[28px] font-semibold text-text tracking-tight">
                  Reset your password
                </h1>
                <p className="text-sm text-text-2 mt-1 font-normal">
                  Enter your email and we'll send a recovery link.
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
                <div className="space-y-1.5">
                  <Label
                    htmlFor="reset-email"
                    className="block text-xs font-medium text-text-2 tracking-wide"
                  >
                    Email
                  </Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="h-10 px-3 bg-surface border-border rounded-[6px] text-text text-sm font-sans placeholder:text-text-3"
                  />
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isSubmitting}
                    className="w-full h-10 px-4 rounded-[6px] bg-accent hover:bg-accent-hover text-text font-medium text-sm flex items-center justify-center gap-2 transition-colors border border-transparent shadow-sm focus:outline-none focus:ring-2 focus:ring-highlight focus:ring-offset-2 focus:ring-offset-bg active:scale-[0.99]"
                  >
                    <span>Send reset link</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </form>

              {/* Back to sign in link */}
              <div className="mt-6 text-center">
                <Link
                  to="/auth/sign-in"
                  className="inline-flex items-center gap-1.5 text-xs text-text-2 hover:text-highlight transition-colors underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to sign in</span>
                </Link>
              </div>
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
