import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { ENV } from '@/constants/env';

const supabaseUrl = ENV.SUPABASE_URL;
const supabaseAnonKey = ENV.SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your_supabase');

// Use SecureStore for native token persistence, localStorage fallback for web
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// Create a no-op stub client if env vars are missing, so the UI can still render.
// When real keys are provided in .env, this becomes a fully-functional Supabase client.
function createStubClient(): SupabaseClient {
  const noop = async () => ({ data: null, error: null });
  const stub: any = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOAuth: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: noop,
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: noop,
        }),
      }),
      insert: noop,
      upsert: noop,
      delete: () => ({ eq: () => ({ eq: noop }) }),
    }),
  };
  return stub as SupabaseClient;
}

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storage: ExpoSecureStoreAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : createStubClient();

if (!isSupabaseConfigured) {
  console.warn(
    '[Supabase] SUPABASE_URL and SUPABASE_ANON_KEY are not set in .env. ' +
      'Using stub client — auth and data features will be disabled. ' +
      'Guest mode and the UI will still work.'
  );
}
