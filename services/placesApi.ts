import type { Temple } from '@/types/temple';
import { SEARCH_RADIUS } from '@/constants/config';
import { SEED_TEMPLES } from '@/constants/seedTemples';
import { ENV } from '@/constants/env';

const API_KEY = ENV.GOOGLE_PLACES_API_KEY;

// When true, the live Google Places API call is attempted; if it fails,
// we fall back to seed data. Set to false to use seed data exclusively.
const USE_LIVE_API = true;

function inferSampradaya(name: string): Temple['sampradaya'] {
  const lower = name.toLowerCase();
  if (lower.includes('digambar') || lower.includes('digambara')) return 'digambar';
  if (lower.includes('shvetambar') || lower.includes('svetambar') || lower.includes('shwetambar'))
    return 'shvetambar';
  if (lower.includes('sthanakvasi') || lower.includes('sthanakwasi')) return 'sthanakvasi';
  return 'unknown';
}

function parsePlace(place: any): Temple {
  return {
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address || '',
    location: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
    rating: place.rating,
    photoReference: place.photos?.[0]?.photo_reference,
    sampradaya: inferSampradaya(place.name),
    isOpen: place.opening_hours?.open_now,
  };
}

/**
 * Returns seed temples within `radiusKm` of the given coordinates,
 * sorted by distance ascending. If nothing is within the radius, returns
 * the 20 nearest temples instead — this guarantees the user always sees
 * something on the map even if they're nowhere near a known temple.
 */
function getSeedNearby(
  latitude: number,
  longitude: number,
  radiusKm: number = 50
): Temple[] {
  const withDistance = SEED_TEMPLES.map((t) => ({
    ...t,
    distance: calculateDistance(latitude, longitude, t.location.latitude, t.location.longitude),
  }));

  withDistance.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  const nearby = withDistance.filter((t) => (t.distance ?? Infinity) <= radiusKm);

  // Always return at least 20 closest, even if outside radius
  return nearby.length > 0 ? nearby : withDistance.slice(0, 20);
}

export async function searchNearbyTemples(
  latitude: number,
  longitude: number,
  radius: number = SEARCH_RADIUS
): Promise<Temple[]> {
  // Try live API first
  if (USE_LIVE_API && API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=place_of_worship&keyword=jain+temple&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map(parsePlace);
      }

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        console.warn('[Places API] falling back to seed data:', data.status, data.error_message);
      }
    } catch (error) {
      console.warn('[Places API] network error, falling back to seed data:', error);
    }
  }

  // Fallback: seed data within ~150km radius (covers major cities)
  return getSeedNearby(latitude, longitude, 150);
}

export async function searchTemplesByText(query: string): Promise<Temple[]> {
  // Try live API first
  if (USE_LIVE_API && API_KEY) {
    try {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=jain+temple+${encodeURIComponent(query)}&type=place_of_worship&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        return data.results.map(parsePlace);
      }
    } catch (error) {
      console.warn('[Places API] text search failed, falling back to seed data:', error);
    }
  }

  // Fallback: filter seed temples by name/address match
  const lower = query.toLowerCase();
  return SEED_TEMPLES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.address.toLowerCase().includes(lower) ||
      t.sampradaya.toLowerCase().includes(lower)
  );
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 400): string {
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
