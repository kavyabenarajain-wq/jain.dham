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
