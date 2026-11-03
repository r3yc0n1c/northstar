import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, ArrowRight, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export function VerifyEmailLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkVerification() {
      // 1. Check for error in hash or search query
      const hash = location.hash;
      const searchParams = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(hash.startsWith('#') ? hash.substring(1) : hash);

      const error =
        searchParams.get('error_description') ||
        hashParams.get('error_description') ||
        searchParams.get('error') ||
        hashParams.get('error');

      if (error) {
        if (isMounted) {
          setErrorMessage(decodeURIComponent(error));
          setVerifying(false);
        }
        return;
      }

      // 2. Wait for Supabase to parse tokens and establish session
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          if (isMounted) {
            setErrorMessage(sessionError.message);
            setVerifying(false);
          }
          return;
        }

        if (session?.user) {
          // Check profile onboarding status
          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed_at')
            .eq('id', session.user.id)
            .maybeSingle();

          if (isMounted) {
            setVerifying(false);
            if (profile?.onboarding_completed_at) {
              navigate('/today', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }
          return;
        }

        // 3. Fallback listener for auth state change
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user && isMounted) {
            subscription.unsubscribe();
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed_at')
              .eq('id', session.user.id)
              .maybeSingle();

            setVerifying(false);
            if (profile?.onboarding_completed_at) {
              navigate('/today', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }
        });

        // Timeout after 8 seconds if no session is detected
        const timeout = setTimeout(() => {
          if (isMounted) {
            setVerifying((prev) => {
              if (prev) {
                setErrorMessage(
                  'Verification link timed out or is invalid. Please request a new link.',
                );
                subscription.unsubscribe();
                return false;
              }
              return prev;
            });
          }
        }, 8000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err instanceof Error ? err.message : 'Failed to verify email');
          setVerifying(false);
        }
      }
    }

    checkVerification();

    return () => {
      isMounted = false;
    };
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-surface border border-border rounded-[10px] p-6 sm:p-8 text-center flex flex-col items-center">
        {verifying ? (
          <>
            <div className="w-12 h-12 rounded-full bg-surface-2 border border-border flex items-center justify-center mb-5 text-highlight animate-pulse">
              <RotateCw className="w-6 h-6 animate-spin" />
            </div>
            <h1 className="text-xl font-semibold text-text tracking-tight mb-2">
              Verifying your email...
            </h1>
            <p className="text-sm text-text-2">
              Authenticating session and provisioning your personal workspace.
            </p>
          </>
        ) : errorMessage ? (
          <>
            <div className="w-12 h-12 rounded-full bg-danger/10 border border-danger flex items-center justify-center mb-5 text-danger">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-text tracking-tight mb-2">
              Verification failed
            </h1>
            <p className="text-sm text-text-2 mb-6 max-w-[340px]">{errorMessage}</p>
            <div className="w-full space-y-3">
              <Link to="/auth/sign-up" className="block w-full">
                <Button variant="secondary" className="w-full">
                  Return to sign up
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-success/10 border border-success flex items-center justify-center mb-5 text-success">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-semibold text-text tracking-tight mb-2">Email verified!</h1>
            <p className="text-sm text-text-2 mb-6">
              Your account is ready. Redirecting you to onboarding...
            </p>
            <Button
              className="w-full flex items-center justify-center gap-2"
              onClick={() => navigate('/onboarding', { replace: true })}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
