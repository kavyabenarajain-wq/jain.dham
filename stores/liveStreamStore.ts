import { create } from 'zustand';
import type { LiveStream } from '@/types/temple';
import { fetchLiveStreams, fetchLiveStreamsForTemple } from '@/services/supabaseDb';

interface LiveStreamState {
  streams: LiveStream[];
  isLoading: boolean;
  lastLoadedAt: number | null;
  loadAll: () => Promise<void>;
  loadForTemple: (placeId: string) => Promise<LiveStream[]>;
}

const CACHE_MS = 60_000;

export const useLiveStreamStore = create<LiveStreamState>()((set, get) => ({
  streams: [],
  isLoading: false,
  lastLoadedAt: null,

  loadAll: async () => {
    const last = get().lastLoadedAt;
    if (last && Date.now() - last < CACHE_MS && get().streams.length > 0) return;
    set({ isLoading: true });
    const streams = await fetchLiveStreams();
    set({ streams, isLoading: false, lastLoadedAt: Date.now() });
  },

  loadForTemple: async (placeId) => {
    return await fetchLiveStreamsForTemple(placeId);
  },
}));
