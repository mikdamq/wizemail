-- ============================================================
-- Preview Comments Migration — 2026-05-15
-- Run this in the Supabase SQL editor
-- ============================================================

create table if not exists public.preview_comments (
  id          uuid primary key default gen_random_uuid(),
  token       text not null references public.preview_links(token) on delete cascade,
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists preview_comments_token_idx on public.preview_comments(token);

-- Public insert (anonymous viewers can comment); owner can read via server-side
alter table public.preview_comments enable row level security;

-- Anyone can insert a comment (viewer doesn't have an account)
create policy "Anyone can post a comment"
  on public.preview_comments
  for insert
  with check (true);

-- Anyone can read comments on a preview they have access to (token is the access control)
create policy "Anyone can read comments"
  on public.preview_comments
  for select
  using (true);
