import type { Temple } from '@/types/temple';
import { SEARCH_RADIUS } from '@/constants/config';
import { SEED_TEMPLES } from '@/constants/seedTemples';
import { ENV } from '@/constants/env';

const API_KEY = ENV.GOOGLE_PLACES_API_KEY;
const USE_LIVE_API = true;

const NEARBY_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const TEXT_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json';
const DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';
const PHOTO_URL = 'https://maps.googleapis.com/maps/api/place/photo';

function inferSampradaya(name: string): Temple['sampradaya'] {
  const lower = name.toLowerCase();
  if (lower.includes('digambar') || lower.includes('digambara')) return 'digambar';
  if (lower.includes('shvetambar') || lower.includes('svetambar') || lower.includes('shwetambar'))
    return 'shvetambar';
  if (lower.includes('sthanakvasi') || lower.includes('sthanakwasi')) return 'sthanakvasi';
  return 'unknown';
}

function parsePlace(place: any): Temple {
  const photos: string[] = Array.isArray(place.photos)
    ? place.photos.map((p: any) => p.photo_reference).filter(Boolean)
    : [];
  return {
    placeId: place.place_id,
    name: place.name,
    address: place.vicinity || place.formatted_address || '',
    location: {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    },
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    photoReference: photos[0],
    photoReferences: photos,
    sampradaya: inferSampradaya(place.name),
    isOpen: place.opening_hours?.open_now,
  };
}

function dedupe(temples: Temple[]): Temple[] {
  const seen = new Set<string>();
  const out: Temple[] = [];
  for (const t of temples) {
    if (seen.has(t.placeId)) continue;
    seen.add(t.placeId);
    out.push(t);
  }
  return out;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Google returns a next_page_token that becomes valid a few seconds after the
// initial response. Fetch up to 3 pages (= 60 results max per location).
async function fetchNearbyPaged(baseParams: string, maxPages = 3): Promise<any[]> {
  const results: any[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const url = pageToken
      ? `${NEARBY_URL}?pagetoken=${pageToken}&key=${API_KEY}`
      : `${NEARBY_URL}?${baseParams}&key=${API_KEY}`;

    if (pageToken) await sleep(2000);

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && Array.isArray(data.results)) {
      results.push(...data.results);
    } else if (data.status !== 'ZERO_RESULTS') {
      if (page === 0) {
        console.warn('[Places API] nearby failed:', data.status, data.error_message);
      }
      break;
    }

    pageToken = data.next_page_token;
    if (!pageToken) break;
  }

  return results;
}

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
  return nearby.length > 0 ? nearby : withDistance.slice(0, 20);
}

export async function searchNearbyTemples(
  latitude: number,
  longitude: number,
  radius: number = SEARCH_RADIUS,
  maxPages: number = 3
): Promise<Temple[]> {
  if (USE_LIVE_API && API_KEY) {
    try {
      const params = `location=${latitude},${longitude}&radius=${radius}&type=place_of_worship&keyword=jain+temple`;
      const raw = await fetchNearbyPaged(params, maxPages);
      if (raw.length > 0) return dedupe(raw.map(parsePlace));
    } catch (error) {
      console.warn('[Places API] nearby network error:', error);
    }
  }
  return getSeedNearby(latitude, longitude, 150);
}

/**
 * Query multiple overlapping circles inside a map viewport so we can cover
 * the whole visible area even when it's bigger than the 50km Nearby cap.
 * Caller supplies the viewport bounds; we tile with ~40km-radius circles.
 */
export async function searchTemplesInViewport(bounds: {
  north: number;
  south: number;
  east: number;
  west: number;
}): Promise<Temple[]> {
  if (!USE_LIVE_API || !API_KEY) {
    const cLat = (bounds.north + bounds.south) / 2;
    const cLng = (bounds.east + bounds.west) / 2;
    const radiusKm = calculateDistance(bounds.south, bounds.west, bounds.north, bounds.east) / 2;
    return getSeedNearby(cLat, cLng, Math.max(150, radiusKm));
  }

  const centerLat = (bounds.north + bounds.south) / 2;
  const centerLng = (bounds.east + bounds.west) / 2;
  const spanLatKm = calculateDistance(bounds.south, centerLng, bounds.north, centerLng);
  const spanLngKm = calculateDistance(centerLat, bounds.west, centerLat, bounds.east);

  const tileRadiusKm = 40;
  const tileDiameterKm = tileRadiusKm * 2;

  // For small viewports, one query at center is enough.
  if (spanLatKm <= tileDiameterKm && spanLngKm <= tileDiameterKm) {
    return searchNearbyTemples(centerLat, centerLng, tileRadiusKm * 1000, 2);
  }

  // Otherwise, tile the viewport. Cap the tile count so we never hammer the API.
  const latSteps = Math.min(4, Math.ceil(spanLatKm / tileDiameterKm));
  const lngSteps = Math.min(4, Math.ceil(spanLngKm / tileDiameterKm));

  const latStep = (bounds.north - bounds.south) / latSteps;
  const lngStep = (bounds.east - bounds.west) / lngSteps;

  const centers: { lat: number; lng: number }[] = [];
  for (let i = 0; i < latSteps; i++) {
    for (let j = 0; j < lngSteps; j++) {
      centers.push({
        lat: bounds.south + latStep * (i + 0.5),
        lng: bounds.west + lngStep * (j + 0.5),
      });
    }
  }

  // Tiled queries use a single page each — pagination is expensive (2s sleep
  // between pages × N tiles), and overlap between tiles already gives good coverage.
  const batched = await Promise.all(
    centers.map((c) =>
      searchNearbyTemples(c.lat, c.lng, tileRadiusKm * 1000, 1).catch(() => [] as Temple[])
    )
  );

  return dedupe(batched.flat());
}

export async function searchTemplesByText(query: string): Promise<Temple[]> {
  if (USE_LIVE_API && API_KEY) {
    try {
      const url = `${TEXT_URL}?query=jain+temple+${encodeURIComponent(query)}&type=place_of_worship&key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK' && Array.isArray(data.results) && data.results.length > 0) {
        return dedupe(data.results.map(parsePlace));
      }
    } catch (error) {
      console.warn('[Places API] text search failed:', error);
    }
  }

  const lower = query.toLowerCase();
  return SEED_TEMPLES.filter(
    (t) =>
      t.name.toLowerCase().includes(lower) ||
      t.address.toLowerCase().includes(lower) ||
      t.sampradaya.toLowerCase().includes(lower)
  );
}

/**
 * Fetch extra details (phone, website, hours, more photos) for a single
 * place. Seed placeIds start with `seed-` and don't exist in Google, so
 * they're skipped.
 */
export async function fetchTempleDetails(placeId: string): Promise<Partial<Temple> | null> {
  if (!USE_LIVE_API || !API_KEY) return null;
  if (placeId.startsWith('seed-')) return null;

  try {
    const fields = [
      'formatted_address',
      'formatted_phone_number',
      'international_phone_number',
      'website',
      'opening_hours',
      'photos',
      'rating',
      'user_ratings_total',
    ].join(',');
    const url = `${DETAILS_URL}?place_id=${placeId}&fields=${fields}&key=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== 'OK' || !data.result) {
      if (data.status !== 'NOT_FOUND') {
        console.warn('[Places API] details failed:', data.status, data.error_message);
      }
      return null;
    }

    const r = data.result;
    const photos: string[] = Array.isArray(r.photos)
      ? r.photos.map((p: any) => p.photo_reference).filter(Boolean)
      : [];

    return {
      address: r.formatted_address || undefined,
      phone: r.formatted_phone_number || r.international_phone_number || undefined,
      website: r.website || undefined,
      timings: formatOpeningHours(r.opening_hours),
      isOpen: r.opening_hours?.open_now,
      rating: r.rating,
      userRatingsTotal: r.user_ratings_total,
      photoReferences: photos.length > 0 ? photos : undefined,
      photoReference: photos[0],
    };
  } catch (error) {
    console.warn('[Places API] details network error:', error);
    return null;
  }
}

function formatOpeningHours(hours: any): string | undefined {
  if (!hours?.weekday_text || !Array.isArray(hours.weekday_text)) return undefined;
  return hours.weekday_text.join('\n');
}

export function getPhotoUrl(photoReference: string, maxWidth: number = 800): string {
  return `${PHOTO_URL}?maxwidth=${maxWidth}&photo_reference=${photoReference}&key=${API_KEY}`;
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
