import { useEffect, useState } from 'react';
import { Mail, Clock, Info, ArrowLeft, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { resendVerificationEmail } from '../api/auth';

interface CheckEmailViewProps {
  email: string;
  onBackToSignUp: () => void;
  initialCooldown?: number;
}

export function CheckEmailView({
  email,
  onBackToSignUp,
  initialCooldown = 60,
}: CheckEmailViewProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialCooldown);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleResend = async () => {
    if (secondsLeft > 0 || isResending) return;
    setIsResending(true);
    setMessage(null);

    const result = await resendVerificationEmail(email);
    setIsResending(false);

    if (result.error) {
      setMessage({ text: result.error, isError: true });
    } else {
      setMessage({
        text: 'A fresh verification link has been sent to your email.',
        isError: false,
      });
      setSecondsLeft(60);
    }
  };

  const formattedTime = `0:${secondsLeft < 10 ? '0' : ''}${secondsLeft}`;

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* Card container */}
      <div className="bg-surface border border-border rounded-[10px] p-6 sm:p-8 text-center flex flex-col items-center">
        {/* Mail Icon */}
        <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center mb-5 text-highlight">
          <Mail className="w-6 h-6" />
        </div>

        <h1 className="text-xl font-semibold text-text tracking-tight">Check your email</h1>

        <p className="text-sm text-text-2 mt-2 mb-6 leading-relaxed max-w-[340px]">
          We sent a verification link to{' '}
          <span className="text-text font-mono-num text-[13px] bg-surface-2 px-1.5 py-0.5 rounded border border-border">
            {email}
          </span>
          . Open it to finish setting up your account.
        </p>

        {/* Inline Feedback */}
        {message && (
          <div
            className={`w-full p-2.5 mb-4 text-xs rounded-[6px] border text-left ${
              message.isError
                ? 'bg-danger/10 border-danger text-danger'
                : 'bg-success/10 border-success text-success'
            }`}
            role="status"
          >
            {message.text}
          </div>
        )}

        {/* Action button: Countdown / Resend */}
        <div className="w-full space-y-3 mb-6">
          <Button
            type="button"
            variant="secondary"
            className="w-full h-10 flex items-center justify-center gap-2"
            disabled={secondsLeft > 0 || isResending}
            onClick={handleResend}
          >
            {isResending ? (
              <>
                <RotateCw className="w-4 h-4 animate-spin text-text-2" />
                <span>Resending...</span>
              </>
            ) : secondsLeft > 0 ? (
              <>
                <Clock className="w-4 h-4 text-text-3" />
                <span>
                  Resend in{' '}
                  <span className="font-mono-num font-medium text-text">{formattedTime}</span>
                </span>
              </>
            ) : (
              <span>Resend verification email</span>
            )}
          </Button>

          <div>
            <button
              type="button"
              onClick={onBackToSignUp}
              className="inline-flex items-center gap-1.5 text-xs text-highlight hover:text-text hover:underline transition-colors focus:outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Use a different email</span>
            </button>
          </div>
        </div>

        {/* Security Help Box */}
        <div className="w-full p-3.5 bg-surface-2 border border-border rounded-[6px] text-left">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-highlight shrink-0 mt-0.5" />
            <div className="text-xs text-text-2 leading-relaxed">
              <span className="text-text font-medium block mb-0.5">Can't find it?</span>
              Check your spam folder or verify{' '}
              <code className="font-mono text-highlight text-[11px]">northstar.io</code> is on your
              allowlist.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
