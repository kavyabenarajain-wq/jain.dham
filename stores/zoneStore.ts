import { create } from 'zustand';
import type { Zone, ZoneHead } from '@/types/temple';
import {
  fetchAllZones,
  fetchAllZoneHeads,
  fetchZoneHeadsForZone,
} from '@/services/supabaseDb';
import { calculateDistance } from '@/services/placesApi';

interface ZoneState {
  zones: Zone[];
  heads: ZoneHead[];                   // active heads across all zones (cached)
  isLoading: boolean;
  lastLoadedAt: number | null;
  loadAll: () => Promise<void>;
  /**
   * Finds the best-matching zone for the given coordinates:
   *  1. The nearest zone whose radius covers the point, else
   *  2. The globally nearest zone (graceful fallback for edge locations).
   */
  findZoneForLocation: (lat: number, lng: number) => Zone | null;
  getHeadForZone: (zoneId: string) => ZoneHead | null;
  fetchHeadForZone: (zoneId: string) => Promise<ZoneHead | null>;
}

const CACHE_MS = 5 * 60_000;

export const useZoneStore = create<ZoneState>()((set, get) => ({
  zones: [],
  heads: [],
  isLoading: false,
  lastLoadedAt: null,

  loadAll: async () => {
    const last = get().lastLoadedAt;
    if (last && Date.now() - last < CACHE_MS && get().zones.length > 0) return;
    set({ isLoading: true });
    const [zones, heads] = await Promise.all([fetchAllZones(), fetchAllZoneHeads()]);
    set({
      zones,
      heads: heads.filter((h) => h.isActive),
      isLoading: false,
      lastLoadedAt: Date.now(),
    });
  },

  findZoneForLocation: (lat, lng) => {
    const { zones } = get();
    if (zones.length === 0) return null;

    const withDistance = zones.map((z) => ({
      zone: z,
      km: calculateDistance(lat, lng, z.centerLat, z.centerLng),
    }));
    withDistance.sort((a, b) => a.km - b.km);

    const inside = withDistance.find((e) => e.km <= e.zone.radiusKm);
    return (inside ?? withDistance[0]).zone;
  },

  getHeadForZone: (zoneId) => {
    return get().heads.find((h) => h.zoneId === zoneId) ?? null;
  },

  fetchHeadForZone: async (zoneId) => {
    const cached = get().getHeadForZone(zoneId);
    if (cached) return cached;
    const rows = await fetchZoneHeadsForZone(zoneId);
    return rows[0] ?? null;
  },
}));
