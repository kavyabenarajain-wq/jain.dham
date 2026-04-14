import { supabase } from './supabase';
import type {
  TempleEnrichment,
  LiveStream,
  Zone,
  ZoneHead,
} from '@/types/temple';

// ─── User Settings ───────────────────────────────────────────────
// Table: user_settings
//   id          uuid  (PK, references auth.users.id)
//   appearance  text  ('light' | 'dark' | 'system')
//   sampradaya  text  ('all' | 'digambar' | 'shvetambar' | 'sthanakvasi')
//   notifications_enabled  boolean
//   language    text  ('en' | 'hi')
//   notify_prayers  boolean
//   notify_events   boolean
//   updated_at  timestamptz

export interface UserSettings {
  appearance: string;
  sampradaya: string;
  notifications_enabled: boolean;
  language: string;
  notify_prayers: boolean;
  notify_events: boolean;
}

export async function fetchUserSettings(userId: string): Promise<UserSettings | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return {
    appearance: data.appearance,
    sampradaya: data.sampradaya,
    notifications_enabled: data.notifications_enabled,
    language: data.language,
    notify_prayers: data.notify_prayers,
    notify_events: data.notify_events,
  };
}

export async function upsertUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const { error } = await supabase
    .from('user_settings')
    .upsert(
      { id: userId, ...settings, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    );

  if (error) console.error('Failed to save settings:', error.message);
}

// ─── Saved Temples ───────────────────────────────────────────────
// Table: saved_temples
//   id        uuid  (PK, auto-generated)
//   user_id   uuid  (references auth.users.id)
//   place_id  text  (Google Places ID)
//   saved_at  timestamptz

export async function fetchSavedTempleIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('saved_temples')
    .select('place_id')
    .eq('user_id', userId);

  if (error || !data) return [];
  return data.map((row) => row.place_id);
}

export async function addSavedTemple(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_temples')
    .insert({ user_id: userId, place_id: placeId });

  if (error) console.error('Failed to save temple:', error.message);
}

export async function removeSavedTemple(userId: string, placeId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_temples')
    .delete()
    .eq('user_id', userId)
    .eq('place_id', placeId);

  if (error) console.error('Failed to remove temple:', error.message);
}

// ─── Temple Enrichments ──────────────────────────────────────────
// Table: temple_enrichments
//   place_id    text (PK)
//   description text
//   idols       jsonb (string[])
//   source      text ('ai' | 'curated')
//   fetched_at  timestamptz

export async function fetchTempleEnrichment(
  placeId: string
): Promise<TempleEnrichment | null> {
  const { data, error } = await supabase
    .from('temple_enrichments')
    .select('*')
    .eq('place_id', placeId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    placeId: data.place_id,
    description: data.description,
    idols: Array.isArray(data.idols) ? data.idols : [],
    source: data.source,
    fetchedAt: data.fetched_at,
    history: data.history ?? null,
    significance: data.significance ?? null,
    rituals: data.rituals ?? null,
    architecture: data.architecture ?? null,
  };
}

export async function upsertTempleEnrichment(
  enrichment: Omit<TempleEnrichment, 'fetchedAt'>
): Promise<void> {
  const { error } = await supabase.from('temple_enrichments').upsert(
    {
      place_id: enrichment.placeId,
      description: enrichment.description,
      idols: enrichment.idols,
      history: enrichment.history ?? null,
      significance: enrichment.significance ?? null,
      rituals: enrichment.rituals ?? null,
      architecture: enrichment.architecture ?? null,
      source: enrichment.source,
      fetched_at: new Date().toISOString(),
    },
    { onConflict: 'place_id' }
  );

  if (error) console.error('Failed to cache enrichment:', error.message);
}

// ─── Live Streams ────────────────────────────────────────────────
function mapLiveStream(row: any): LiveStream {
  return {
    id: row.id,
    placeId: row.place_id ?? null,
    templeName: row.temple_name,
    title: row.title,
    description: row.description ?? null,
    streamUrl: row.stream_url,
    thumbnail: row.thumbnail ?? null,
    kind: row.kind,
    isActive: row.is_active,
    startsAt: row.starts_at ?? null,
    endsAt: row.ends_at ?? null,
  };
}

export async function fetchLiveStreams(): Promise<LiveStream[]> {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .eq('is_active', true)
    .order('kind', { ascending: false })      // 'shantidhara' > 'regular' alphabetically
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(mapLiveStream);
}

export async function fetchLiveStreamsForTemple(placeId: string): Promise<LiveStream[]> {
  const { data, error } = await supabase
    .from('live_streams')
    .select('*')
    .eq('place_id', placeId)
    .eq('is_active', true);

  if (error || !data) return [];
  return data.map(mapLiveStream);
}

// ─── Zones & Zone Heads ──────────────────────────────────────────
function mapZone(row: any): Zone {
  return {
    id: row.id,
    name: row.name,
    city: row.city ?? null,
    state: row.state ?? null,
    centerLat: Number(row.center_lat),
    centerLng: Number(row.center_lng),
    radiusKm: Number(row.radius_km),
  };
}

function mapZoneHead(row: any): ZoneHead {
  return {
    id: row.id,
    zoneId: row.zone_id,
    name: row.name,
    whatsappNumber: row.whatsapp_number,
    email: row.email ?? null,
    isActive: row.is_active,
  };
}

export async function fetchAllZones(): Promise<Zone[]> {
  const { data, error } = await supabase.from('zones').select('*');
  if (error || !data) return [];
  return data.map(mapZone);
}

export async function fetchZoneHeadsForZone(zoneId: string): Promise<ZoneHead[]> {
  const { data, error } = await supabase
    .from('zone_heads')
    .select('*')
    .eq('zone_id', zoneId)
    .eq('is_active', true);

  if (error || !data) return [];
  return data.map(mapZoneHead);
}

export async function fetchAllZoneHeads(): Promise<ZoneHead[]> {
  const { data, error } = await supabase.from('zone_heads').select('*');
  if (error || !data) return [];
  return data.map(mapZoneHead);
}

// ─── Admin ───────────────────────────────────────────────────────
export async function isUserAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return false;
  return true;
}

export async function createZone(input: Omit<Zone, 'id'>): Promise<Zone | null> {
  const { data, error } = await supabase
    .from('zones')
    .insert({
      name: input.name,
      city: input.city,
      state: input.state,
      center_lat: input.centerLat,
      center_lng: input.centerLng,
      radius_km: input.radiusKm,
    })
    .select('*')
    .single();
  if (error || !data) {
    console.error('Failed to create zone:', error?.message);
    return null;
  }
  return mapZone(data);
}

export async function deleteZone(zoneId: string): Promise<void> {
  const { error } = await supabase.from('zones').delete().eq('id', zoneId);
  if (error) console.error('Failed to delete zone:', error.message);
}

export async function upsertZoneHead(input: Omit<ZoneHead, 'id'> & { id?: string }): Promise<ZoneHead | null> {
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    zone_id: input.zoneId,
    name: input.name,
    whatsapp_number: input.whatsappNumber,
    email: input.email,
    is_active: input.isActive,
  };
  const { data, error } = await supabase
    .from('zone_heads')
    .upsert(payload, { onConflict: 'id' })
    .select('*')
    .single();
  if (error || !data) {
    console.error('Failed to save zone head:', error?.message);
    return null;
  }
  return mapZoneHead(data);
}

export async function deleteZoneHead(id: string): Promise<void> {
  const { error } = await supabase.from('zone_heads').delete().eq('id', id);
  if (error) console.error('Failed to delete zone head:', error.message);
}

// ─── Assistance Requests ─────────────────────────────────────────
export async function logAssistanceRequest(input: {
  userId: string | null;
  zoneId: string | null;
  zoneHeadId: string | null;
  message: string | null;
  userLat: number | null;
  userLng: number | null;
  placeId: string | null;
}): Promise<void> {
  if (!input.userId) return;                // RLS requires auth.uid() = user_id
  const { error } = await supabase.from('assistance_requests').insert({
    user_id: input.userId,
    zone_id: input.zoneId,
    zone_head_id: input.zoneHeadId,
    message: input.message,
    user_lat: input.userLat,
    user_lng: input.userLng,
    place_id: input.placeId,
  });
  if (error) console.warn('Failed to log assistance request:', error.message);
}
