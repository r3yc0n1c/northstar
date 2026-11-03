import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '../context/AuthContext';
import { resendVerificationEmail } from '../api/auth';
import { supabase } from '@/lib/supabase';

const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyRequiredPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  // If already confirmed, redirect to /today
  useEffect(() => {
    if (user?.email_confirmed_at) {
      navigate('/today', { replace: true });
    }
  }, [user, navigate]);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (!user?.email || cooldown > 0 || resending) return;
    setResending(true);
    setResendStatus(null);

    const res = await resendVerificationEmail(user.email);
    setResending(false);

    if (res.error) {
      setResendStatus({ ok: false, message: res.error });
    } else {
      setResendStatus({
        ok: true,
        message: 'A fresh confirmation link has been sent to your inbox.',
      });
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  };

  const handleCheckConfirmed = async () => {
    setIsChecking(true);
    const {
      data: { user: freshUser },
    } = await supabase.auth.getUser();
    setIsChecking(false);

    if (freshUser?.email_confirmed_at) {
      navigate('/today', { replace: true });
    } else {
      setResendStatus({
        ok: false,
        message: 'Email not verified yet. Please click the link in your email or wait a moment.',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/sign-in', { replace: true });
  };

  const emailDisplay = user?.email ?? 'your email address';

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between p-6 sm:p-10 selection:bg-highlight selection:text-bg">
      {/* Top Protocol Header */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between text-xs text-text-3 font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-warning animate-pulse" />
          <span className="tracking-wide">NORTHSTAR AUTH PROTOCOL {'//'} SYS.VERIFY</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-warning">STATUS: CONFIRMATION_PENDING</span>
        </div>
      </header>

      {/* Main Centered Verification Box */}
      <main className="w-full max-w-[440px] mx-auto my-auto py-8">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2.5 mb-8 select-none">
          <div className="w-7 h-7 rounded-lg bg-surface border border-border flex items-center justify-center">
            <svg
              className="w-4 h-4 text-highlight"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Northstar logo"
            >
              <title>Northstar logo</title>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight text-text">Northstar</span>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface-2 border border-border text-text-2 tracking-wider">
            OS
          </span>
        </div>

        {/* Card */}
        <div className="w-full bg-surface border border-border rounded-[10px] p-6 sm:p-8 shadow-xl text-center">
          <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4 text-highlight">
            <Mail className="w-6 h-6" />
          </div>

          <h1 className="text-xl font-semibold text-text tracking-tight mb-2">Verify your email</h1>
          <p className="text-sm text-text-2 mb-4 leading-relaxed">
            We sent a verification link to{' '}
            <span className="font-mono text-text font-medium break-all">{emailDisplay}</span>.
            Please confirm your email before accessing your workspace.
          </p>

          {/* Security alert */}
          <div className="bg-surface-2/60 border border-border/80 rounded-[6px] p-3 mb-6 text-left text-xs text-text-2 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <span>Unverified accounts cannot access workspaces or create private data.</span>
          </div>

          {/* Resend Status feedback */}
          {resendStatus && (
            <div
              role="alert"
              className={`p-3 rounded-[6px] text-xs mb-4 flex items-start gap-2 text-left ${
                resendStatus.ok
                  ? 'bg-success/10 border border-success/30 text-success'
                  : 'bg-danger/10 border border-danger/30 text-danger'
              }`}
            >
              {resendStatus.ok ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{resendStatus.message}</span>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="primary"
              loading={isChecking}
              onClick={handleCheckConfirmed}
              className="w-full h-10 rounded-[6px] bg-accent hover:bg-accent-hover text-text font-medium text-sm flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>I've confirmed my email</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              disabled={cooldown > 0 || resending}
              loading={resending}
              onClick={handleResend}
              className="w-full h-10 rounded-[6px] bg-surface-2 hover:bg-surface-2/80 text-text font-medium text-sm border border-border flex items-center justify-center gap-2"
            >
              <span>
                {cooldown > 0 ? `Resend link in ${cooldown}s` : 'Resend verification email'}
              </span>
            </Button>

            <div className="pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                className="w-full h-9 text-xs text-text-2 hover:text-text flex items-center justify-center gap-2"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign in with another account</span>
              </Button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl mx-auto flex items-center justify-between text-[11px] text-text-3 font-mono">
        <span>SYS.TELEMETRY: VERIFICATION_ENFORCED</span>
        <span>SECURITY LEVEL: 256-BIT</span>
      </footer>
    </div>
  );
}
