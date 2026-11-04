import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';

export const RECOVERY_STORAGE_KEY = 'northstar_in_recovery';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isInRecovery: boolean;
  clearRecovery: () => void;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
  initialLoading?: boolean;
  initialInRecovery?: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession = null,
  initialLoading,
  initialInRecovery,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(
    initialLoading !== undefined ? initialLoading : initialSession === null,
  );
  const [isInRecovery, setIsInRecovery] = useState<boolean>(() => {
    if (initialInRecovery !== undefined) {
      return initialInRecovery;
    }
    try {
      return localStorage.getItem(RECOVERY_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const clearRecovery = () => {
    try {
      localStorage.removeItem(RECOVERY_STORAGE_KEY);
    } catch {
      // ignore localStorage errors
    }
    setIsInRecovery(false);
  };

  useEffect(() => {
    // If an explicit initialLoading was provided (e.g. in tests), skip auto-fetching
    if (initialLoading !== undefined) {
      return;
    }

    let isMounted = true;

    // 1. Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        setSession(session);
        setLoading(false);
      }
    });

    // 2. Listen to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (isMounted) {
        setSession(newSession);
        setLoading(false);
      }

      if (event === 'PASSWORD_RECOVERY') {
        try {
          localStorage.setItem(RECOVERY_STORAGE_KEY, 'true');
        } catch {}
        if (isMounted) {
          setIsInRecovery(true);
        }
      }

      if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(RECOVERY_STORAGE_KEY);
        } catch {}
        if (isMounted) {
          setIsInRecovery(false);
        }
        queryClient.clear();
      }
    });

    const handleStorage = (e: StorageEvent) => {
      if (e.key === RECOVERY_STORAGE_KEY) {
        setIsInRecovery(e.newValue === 'true');
      }
    };

    window.addEventListener('storage', handleStorage);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorage);
    };
  }, [initialLoading]);

  const signOut = async () => {
    clearRecovery();
    await supabase.auth.signOut();
    queryClient.clear();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        loading,
        isInRecovery,
        clearRecovery,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
