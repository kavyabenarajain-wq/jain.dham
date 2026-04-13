import { create } from 'zustand';
import { supabase } from '@/services/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: User | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  restoreSession: () => Promise<void>;
  initialize: () => void;
}

function mapSupabaseUser(user: SupabaseUser): User {
  return {
    uid: user.id,
    displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
    email: user.email ?? null,
    photoURL: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
  };
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  isAuthenticated: false,

  signInWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });

    if (error) {
      console.error('Google sign-in error:', error.message);
      return;
    }

    // After OAuth redirect, the session is picked up by the auth listener
    // set in initialize(). No manual state update needed here.
  },

  continueAsGuest: () => {
    set({
      user: null,
      isGuest: true,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({
      user: null,
      isGuest: false,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
      isGuest: false,
      isLoading: false,
    }),

  setLoading: (isLoading) => set({ isLoading }),

  restoreSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        set({
          user: mapSupabaseUser(session.user),
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  initialize: () => {
    // Listen for auth state changes (sign in, sign out, token refresh)
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          user: mapSupabaseUser(session.user),
          isAuthenticated: true,
          isGuest: false,
          isLoading: false,
        });
      } else if (!get().isGuest) {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
  },
}));
