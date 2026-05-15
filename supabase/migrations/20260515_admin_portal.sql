-- ============================================================
-- Admin Portal Migration — 2026-05-15
-- Run this in the Supabase SQL editor or via psql
-- ============================================================

-- 1. Extend profiles for admin visibility
alter table public.profiles
  add column if not exists country       text,
  add column if not exists suspended_at  timestamptz,
  add column if not exists deleted_at    timestamptz;

-- 2. Make usage_events.user_id nullable so system/error events can exist without a user
alter table public.usage_events
  alter column user_id drop not null;

alter table public.usage_events
  drop constraint if exists usage_events_user_id_fkey;

alter table public.usage_events
  add constraint usage_events_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete set null;

-- 3. Extra index on usage_events for monitoring queries (error type + time)
create index if not exists usage_events_type_created_idx
  on public.usage_events(event_type, created_at desc);

-- 4. Templates table (replaces hardcoded lib/templates.ts data)
create table if not exists public.templates (
  id            text primary key,
  name          text not null,
  description   text not null default '',
  main_category text not null,
  sub_category  text not null,
  accent_color  text not null default '#E85D26',
  access        text not null default 'free' check (access in ('free', 'premium')),
  featured      boolean not null default false,
  published     boolean not null default true,
  collection    text,
  direction     text not null default 'ltr' check (direction in ('ltr', 'rtl')),
  sections      jsonb not null default '[]'::jsonb,
  use_count     integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists templates_category_idx on public.templates(main_category, sub_category);
create index if not exists templates_published_idx on public.templates(published);
create index if not exists templates_use_count_idx on public.templates(use_count desc);

alter table public.templates enable row level security;

create policy "Anyone can read published templates" on public.templates
  for select using (published = true);

-- 5. App-wide settings (singleton row id=1)
create table if not exists public.app_settings (
  id         int primary key default 1 check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.app_settings (id, data)
values (1, '{
  "maintenanceMode": false,
  "allowNewSignups": true,
  "pricingProMonthly": "$19/mo",
  "pricingProAnnual": "$190/yr",
  "featureFlags": {
    "aiGeneration": true,
    "templateMarketplace": true,
    "clientPreviews": true
  }
}'::jsonb)
on conflict (id) do nothing;

alter table public.app_settings enable row level security;
-- No select/insert/update policies: only accessible via service role key

-- 6. Postgres function for paginated admin user list (service role only)
create or replace function public.admin_get_users(
  p_search  text    default '',
  p_plan    text    default '',
  p_limit   int     default 50,
  p_offset  int     default 0
)
returns table (
  id           uuid,
  email        text,
  full_name    text,
  country      text,
  created_at   timestamptz,
  suspended_at timestamptz,
  plan         text,
  status       text,
  design_count bigint,
  last_active  timestamptz
)
language sql security definer
as $$
  select
    p.id,
    p.email,
    p.full_name,
    p.country,
    p.created_at,
    p.suspended_at,
    coalesce(s.plan, 'free')       as plan,
    coalesce(s.status, 'inactive') as status,
    count(d.id) filter (where d.deleted_at is null) as design_count,
    greatest(max(d.updated_at), max(ue.created_at)) as last_active
  from public.profiles p
  left join public.subscriptions s  on s.user_id = p.id
  left join public.designs d        on d.user_id = p.id
  left join public.usage_events ue  on ue.user_id = p.id
  where p.deleted_at is null
    and (p_search = '' or p.email ilike '%' || p_search || '%' or p.full_name ilike '%' || p_search || '%')
    and (p_plan   = '' or coalesce(s.plan, 'free') = p_plan)
  group by p.id, p.email, p.full_name, p.country, p.created_at, p.suspended_at, s.plan, s.status
  order by p.created_at desc
  limit p_limit offset p_offset;
$$;

-- Revoke from anon and authenticated; only service role can call
revoke execute on function public.admin_get_users from anon, authenticated;

-- 7. Admin analytics function — DAU/WAU/MAU
create or replace function public.admin_get_active_users(
  p_days int default 30
)
returns table (
  bucket      date,
  active_users bigint
)
language sql security definer
as $$
  select
    date_trunc('day', created_at)::date as bucket,
    count(distinct user_id) as active_users
  from public.usage_events
  where created_at > now() - (p_days || ' days')::interval
    and user_id is not null
  group by bucket
  order by bucket;
$$;

revoke execute on function public.admin_get_active_users from anon, authenticated;
