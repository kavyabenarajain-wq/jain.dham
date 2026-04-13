import { create } from 'zustand';
import type { Temple } from '@/types/temple';
import { useAuthStore } from './authStore';
import {
  fetchSavedTempleIds,
  addSavedTemple,
  removeSavedTemple,
} from '@/services/supabaseDb';

interface TempleState {
  temples: Temple[];
  selectedTemple: Temple | null;
  activeFilter: string;
  searchQuery: string;
  isLoading: boolean;
  savedTempleIds: string[];
  setTemples: (temples: Temple[]) => void;
  selectTemple: (temple: Temple | null) => void;
  setFilter: (filter: string) => void;
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  toggleSavedTemple: (placeId: string) => void;
  isTempleSaved: (placeId: string) => boolean;
  getFilteredTemples: () => Temple[];
  loadSavedTemples: () => Promise<void>;
}

export const useTempleStore = create<TempleState>()((set, get) => ({
  temples: [],
  selectedTemple: null,
  activeFilter: 'All',
  searchQuery: '',
  isLoading: false,
  savedTempleIds: [],

  setTemples: (temples) => set({ temples }),
  selectTemple: (temple) => set({ selectedTemple: temple }),
  setFilter: (filter) => set({ activeFilter: filter }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLoading: (loading) => set({ isLoading: loading }),

  toggleSavedTemple: (placeId) => {
    const { savedTempleIds } = get();
    const userId = useAuthStore.getState().user?.uid;
    const isSaved = savedTempleIds.includes(placeId);

    // Optimistic update
    set({
      savedTempleIds: isSaved
        ? savedTempleIds.filter((id) => id !== placeId)
        : [...savedTempleIds, placeId],
    });

    // Sync to Supabase
    if (userId) {
      if (isSaved) {
        removeSavedTemple(userId, placeId);
      } else {
        addSavedTemple(userId, placeId);
      }
    }
  },

  isTempleSaved: (placeId) => get().savedTempleIds.includes(placeId),

  getFilteredTemples: () => {
    const { temples, activeFilter } = get();
    if (activeFilter === 'All') return temples;
    return temples.filter(
      (t) => t.sampradaya.toLowerCase() === activeFilter.toLowerCase()
    );
  },

  loadSavedTemples: async () => {
    const userId = useAuthStore.getState().user?.uid;
    if (!userId) return;

    const ids = await fetchSavedTempleIds(userId);
    set({ savedTempleIds: ids });
  },
}));
