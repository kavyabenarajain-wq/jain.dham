import { supabase } from './supabase';

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
