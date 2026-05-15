-- ============================================================
-- Preview Links Migration — 2026-05-15
-- Run this in the Supabase SQL editor
-- ============================================================

create table if not exists public.preview_links (
  id          uuid primary key default gen_random_uuid(),
  token       text not null unique default encode(gen_random_bytes(16), 'hex'),
  design_id   text not null,
  user_id     uuid not null references auth.users(id) on delete cascade,
  html        text not null,
  design_name text not null default '',
  password    text,
  expires_at  timestamptz not null default (now() + interval '7 days'),
  created_at  timestamptz not null default now()
);

create index if not exists preview_links_token_idx on public.preview_links(token);
create index if not exists preview_links_user_id_idx on public.preview_links(user_id);

-- Only owner can read/write their own links; public read via token done server-side
alter table public.preview_links enable row level security;

create policy "Owner can manage their preview links"
  on public.preview_links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
