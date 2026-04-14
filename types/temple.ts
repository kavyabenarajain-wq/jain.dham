export interface Temple {
  placeId: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  photoReference?: string;
  photoReferences?: string[];
  sampradaya: 'digambar' | 'shvetambar' | 'sthanakvasi' | 'unknown';
  isOpen?: boolean;
  distance?: number;
  timings?: string;
  phone?: string;
  website?: string;
  userRatingsTotal?: number;
}

export interface TempleEnrichment {
  placeId: string;
  description: string;
  idols: string[];
  source: 'ai' | 'curated';
  fetchedAt: string;
  // Digi-tour sections. Optional so a partial AI response still stores.
  history?: string | null;
  significance?: string | null;
  rituals?: string | null;
  architecture?: string | null;
}

export interface LiveStream {
  id: string;
  placeId: string | null;
  templeName: string;
  title: string;
  description: string | null;
  streamUrl: string;
  thumbnail: string | null;
  kind: 'regular' | 'shantidhara';
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface Zone {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

export interface ZoneHead {
  id: string;
  zoneId: string;
  name: string;
  whatsappNumber: string;
  email: string | null;
  isActive: boolean;
}
