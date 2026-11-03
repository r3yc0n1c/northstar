import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { queryClient } from '@/lib/queryClient';

export interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export interface AuthProviderProps {
  children: ReactNode;
  initialSession?: Session | null;
  initialLoading?: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({
  children,
  initialSession = null,
  initialLoading,
}: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(initialSession);
  const [loading, setLoading] = useState(
    initialLoading !== undefined ? initialLoading : initialSession === null,
  );

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

      if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialLoading]);

  const signOut = async () => {
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
