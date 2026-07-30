import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';

import { AuthModal } from '@/components/auth/AuthModal';
import { supabase } from '@/services/supabaseClient';
import { useLikesStore } from '@/store/likesStore';

type AuthMode = 'sign-in' | 'sign-up';

interface UserProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  openAuthModal: (mode?: AuthMode) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, display_name, avatar_url')
    .eq('id', userId)
    .maybeSingle();

  if (error) return null;
  return data;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthMode>('sign-in');
  const loadAllUserLikes = useLikesStore((s) => s.loadAllUserLikes);
  const resetUserLikes = useLikesStore((s) => s.resetUserLikes);

  const loadProfile = useCallback(async (userId: string) => {
    const nextProfile = await fetchProfile(userId);
    setProfile(nextProfile);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!mounted) return;
      setSession(initialSession);
      if (initialSession?.user) {
        void loadProfile(initialSession.user.id);
        void loadAllUserLikes();
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        void loadProfile(nextSession.user.id);
        void loadAllUserLikes();
      } else {
        setProfile(null);
        resetUserLikes();
      }
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile, loadAllUserLikes, resetUserLikes]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: displayName ? { display_name: displayName } : undefined,
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
    resetUserLikes();
  }, [resetUserLikes]);

  const openAuthModal = useCallback((mode: AuthMode = 'sign-in') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      session,
      profile,
      isLoading,
      signIn,
      signUp,
      signOut,
      openAuthModal,
    }),
    [session, profile, isLoading, signIn, signUp, signOut, openAuthModal]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        open={authModalOpen}
        onOpenChange={setAuthModalOpen}
        defaultMode={authModalMode}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
