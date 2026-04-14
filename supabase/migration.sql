-- Jain Dham — Supabase Schema
-- Run this in your Supabase SQL Editor to create the required tables.

-- ─── User Settings ───────────────────────────────────────────────
create table if not exists public.user_settings (
  id                    uuid primary key references auth.users(id) on delete cascade,
  appearance            text not null default 'system'
                        check (appearance in ('light', 'dark', 'system')),
  sampradaya            text not null default 'all'
                        check (sampradaya in ('all', 'digambar', 'shvetambar', 'sthanakvasi')),
  notifications_enabled boolean not null default true,
  language              text not null default 'en'
                        check (language in ('en', 'hi')),
  notify_prayers        boolean not null default false,
  notify_events         boolean not null default false,
  updated_at            timestamptz not null default now()
);

-- RLS: users can only read/write their own settings
alter table public.user_settings enable row level security;

create policy "Users can read own settings"
  on public.user_settings for select
  using (auth.uid() = id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = id);

-- ─── Saved Temples ───────────────────────────────────────────────
create table if not exists public.saved_temples (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  place_id  text not null,
  saved_at  timestamptz not null default now(),
  unique (user_id, place_id)
);

-- RLS: users can only manage their own saved temples
alter table public.saved_temples enable row level security;

create policy "Users can read own saved temples"
  on public.saved_temples for select
  using (auth.uid() = user_id);

create policy "Users can insert own saved temples"
  on public.saved_temples for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved temples"
  on public.saved_temples for delete
  using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_saved_temples_user
  on public.saved_temples(user_id);

-- ─── Temple Enrichments ──────────────────────────────────────────
-- Cache for AI-generated temple descriptions (idols, history, etc.).
-- Writes happen from the client after an LLM call; reads are public
-- so all users share the cached description.
create table if not exists public.temple_enrichments (
  place_id    text primary key,
  description text not null,
  idols       jsonb not null default '[]'::jsonb,
  source      text not null default 'ai'
              check (source in ('ai', 'curated')),
  fetched_at  timestamptz not null default now()
);

alter table public.temple_enrichments enable row level security;

create policy "Enrichments are readable by everyone"
  on public.temple_enrichments for select
  using (true);

create policy "Authenticated users can insert enrichments"
  on public.temple_enrichments for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update enrichments"
  on public.temple_enrichments for update
  to authenticated
  using (true);

-- Additional curated "digi tour" sections. Nullable so AI responses without
-- full coverage still save; curated data can backfill over time.
alter table public.temple_enrichments
  add column if not exists history        text,
  add column if not exists significance   text,
  add column if not exists rituals        text,
  add column if not exists architecture   text;

-- ─── Live Darshan Streams ────────────────────────────────────────
-- Curated list of live streams per temple. Shantidhara streams are our
-- associated / partnered temples and are highlighted in the UI.
create table if not exists public.live_streams (
  id           uuid primary key default gen_random_uuid(),
  place_id     text,                                 -- null for generic/shantidhara channels
  temple_name  text not null,
  title        text not null,
  description  text,
  stream_url   text not null,                        -- YouTube Live, HLS, etc.
  thumbnail    text,
  kind         text not null default 'regular'
               check (kind in ('regular', 'shantidhara')),
  is_active    boolean not null default true,
  starts_at    timestamptz,
  ends_at      timestamptz,
  created_at   timestamptz not null default now()
);

alter table public.live_streams enable row level security;

create policy "Live streams are readable by everyone"
  on public.live_streams for select
  using (true);

create index if not exists idx_live_streams_place on public.live_streams(place_id);
create index if not exists idx_live_streams_kind  on public.live_streams(kind);

-- ─── Zones (Assistance Coverage Areas) ───────────────────────────
-- Geographic regions used to route assistance requests to the right
-- zone head. Simple circle-around-a-center model (center + radius_km)
-- so we can match with plain Haversine on the client.
create table if not exists public.zones (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  city        text,
  state       text,
  center_lat  double precision not null,
  center_lng  double precision not null,
  radius_km   double precision not null default 25,
  created_at  timestamptz not null default now()
);

alter table public.zones enable row level security;

create policy "Zones are readable by everyone"
  on public.zones for select
  using (true);

-- ─── Zone Heads ──────────────────────────────────────────────────
-- One zone can have one active zone head; WhatsApp number is the
-- routing target for the Assistance button.
create table if not exists public.zone_heads (
  id              uuid primary key default gen_random_uuid(),
  zone_id         uuid not null references public.zones(id) on delete cascade,
  name            text not null,
  whatsapp_number text not null,                    -- E.164, digits only, e.g. 919876543210
  email           text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

alter table public.zone_heads enable row level security;

create policy "Zone heads are readable by everyone"
  on public.zone_heads for select
  using (true);

create index if not exists idx_zone_heads_zone on public.zone_heads(zone_id);

-- ─── Admin Users ─────────────────────────────────────────────────
-- Membership table: any auth user listed here can write to zones /
-- zone_heads via the admin panel. Seed the first admin manually in the
-- Supabase dashboard.
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  added_at   timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Users can check their own admin status"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- Admin write policies for zones / zone_heads
create policy "Admins can insert zones"
  on public.zones for insert
  to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update zones"
  on public.zones for update
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can delete zones"
  on public.zones for delete
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can insert zone heads"
  on public.zone_heads for insert
  to authenticated
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update zone heads"
  on public.zone_heads for update
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can delete zone heads"
  on public.zone_heads for delete
  to authenticated
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- ─── Assistance Requests (audit log) ─────────────────────────────
-- Optional: record every tap of the Assistance button so we can follow
-- up and measure volume. The WhatsApp handoff still happens client-side
-- via Linking — this table just stores the metadata.
create table if not exists public.assistance_requests (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references auth.users(id) on delete set null,
  zone_id        uuid references public.zones(id) on delete set null,
  zone_head_id   uuid references public.zone_heads(id) on delete set null,
  message        text,
  user_lat       double precision,
  user_lng       double precision,
  place_id       text,
  created_at     timestamptz not null default now()
);

alter table public.assistance_requests enable row level security;

create policy "Users can insert own assistance requests"
  on public.assistance_requests for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can read own assistance requests"
  on public.assistance_requests for select
  using (auth.uid() = user_id);

create policy "Admins can read all assistance requests"
  on public.assistance_requests for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
