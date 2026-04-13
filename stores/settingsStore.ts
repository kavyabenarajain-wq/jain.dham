import { create } from 'zustand';
import { fetchUserSettings, upsertUserSettings } from '@/services/supabaseDb';
import { useAuthStore } from './authStore';

type Appearance = 'light' | 'dark' | 'system';
type SampradayaPref = 'all' | 'digambar' | 'shvetambar' | 'sthanakvasi';

interface SettingsState {
  appearance: Appearance;
  sampradaya: SampradayaPref;
  notificationsEnabled: boolean;
  language: 'en' | 'hi';
  notifyPrayers: boolean;
  notifyEvents: boolean;
  isLoaded: boolean;
  setAppearance: (appearance: Appearance) => void;
  setSampradaya: (sampradaya: SampradayaPref) => void;
  toggleNotifications: () => void;
  setLanguage: (language: 'en' | 'hi') => void;
  setNotifyPrayers: (value: boolean) => void;
  setNotifyEvents: (value: boolean) => void;
  loadSettings: () => Promise<void>;
}

function syncToSupabase(partial: Record<string, any>) {
  const userId = useAuthStore.getState().user?.uid;
  if (userId) {
    upsertUserSettings(userId, partial);
  }
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  appearance: 'system',
  sampradaya: 'all',
  notificationsEnabled: true,
  language: 'en',
  notifyPrayers: false,
  notifyEvents: false,
  isLoaded: false,

  setAppearance: (appearance) => {
    set({ appearance });
    syncToSupabase({ appearance });
  },

  setSampradaya: (sampradaya) => {
    set({ sampradaya });
    syncToSupabase({ sampradaya });
  },

  toggleNotifications: () => {
    const next = !get().notificationsEnabled;
    set({ notificationsEnabled: next });
    syncToSupabase({ notifications_enabled: next });
  },

  setLanguage: (language) => {
    set({ language });
    syncToSupabase({ language });
  },

  setNotifyPrayers: (value) => {
    set({ notifyPrayers: value });
    syncToSupabase({ notify_prayers: value });
  },

  setNotifyEvents: (value) => {
    set({ notifyEvents: value });
    syncToSupabase({ notify_events: value });
  },

  loadSettings: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) {
      set({ isLoaded: true });
      return;
    }

    const remote = await fetchUserSettings(userId);
    if (remote) {
      set({
        appearance: remote.appearance as Appearance,
        sampradaya: remote.sampradaya as SampradayaPref,
        notificationsEnabled: remote.notifications_enabled,
        language: remote.language as 'en' | 'hi',
        notifyPrayers: remote.notify_prayers,
        notifyEvents: remote.notify_events,
        isLoaded: true,
      });
    } else {
      // First login — push defaults to Supabase
      upsertUserSettings(userId, {
        appearance: get().appearance,
        sampradaya: get().sampradaya,
        notifications_enabled: get().notificationsEnabled,
        language: get().language,
        notify_prayers: get().notifyPrayers,
        notify_events: get().notifyEvents,
      });
      set({ isLoaded: true });
    }
  },
}));
