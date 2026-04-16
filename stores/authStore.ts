import { create } from 'zustand';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { supabase } from '@/services/supabase';
import { ENV } from '@/constants/env';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
  signInWithApple: () => Promise<void>;
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

// Called once at app start so GoogleSignin knows which clients to use.
let googleConfigured = false;
function configureGoogleOnce() {
  if (googleConfigured) return;
  GoogleSignin.configure({
    iosClientId: ENV.GOOGLE_IOS_CLIENT_ID,
    // Web client ID is required on iOS for Supabase to verify the ID token —
    // it must match the audience Supabase's Google provider expects.
    webClientId: ENV.GOOGLE_WEB_CLIENT_ID,
    scopes: ['profile', 'email'],
  });
  googleConfigured = true;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isGuest: false,
  isLoading: true,
  isAuthenticated: false,

  signInWithGoogle: async () => {
    configureGoogleOnce();
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();
      const idToken = (userInfo as any)?.data?.idToken ?? (userInfo as any)?.idToken;
      if (!idToken) throw new Error('No ID token returned from Google');

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: idToken,
      });
      if (error) throw error;
    } catch (error: any) {
      if (error?.code === statusCodes.SIGN_IN_CANCELLED) return;
      console.error('Google sign-in error:', error?.message ?? error);
      throw error;
    }
  },

  signInWithApple: async () => {
    if (Platform.OS !== 'ios') {
      throw new Error('Apple sign-in is only available on iOS.');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token returned from Apple');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error) throw error;
    } catch (error: any) {
      if (error?.code === 'ERR_REQUEST_CANCELED') return;
      console.error('Apple sign-in error:', error?.message ?? error);
      throw error;
    }
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
    try {
      if (googleConfigured) {
        const current = await GoogleSignin.getCurrentUser();
        if (current) await GoogleSignin.signOut();
      }
    } catch {}
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
