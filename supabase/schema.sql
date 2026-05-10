create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.designs (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  rows jsonb not null default '[]'::jsonb,
  email_details jsonb not null default '{}'::jsonb,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  variables jsonb not null default '{}'::jsonb,
  brand_kit jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists designs_user_updated_idx on public.designs(user_id, updated_at desc);

create table if not exists public.brand_kits (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  kit jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team', 'enterprise')),
  status text not null default 'inactive' check (status in ('inactive', 'trialing', 'active', 'past_due', 'canceled')),
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.usage_events (
  id text primary key default gen_random_uuid()::text,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_type_created_idx on public.usage_events(user_id, event_type, created_at desc);

alter table public.profiles enable row level security;
alter table public.designs enable row level security;
alter table public.brand_kits enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_events enable row level security;

create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can read own designs" on public.designs
  for select using (auth.uid() = user_id and deleted_at is null);

create policy "Users can insert own designs" on public.designs
  for insert with check (auth.uid() = user_id);

create policy "Users can update own designs" on public.designs
  for update using (auth.uid() = user_id);

create policy "Users can delete own designs" on public.designs
  for delete using (auth.uid() = user_id);

create policy "Users can read own brand kits" on public.brand_kits
  for select using (auth.uid() = user_id);

create policy "Users can insert own brand kits" on public.brand_kits
  for insert with check (auth.uid() = user_id);

create policy "Users can update own brand kits" on public.brand_kits
  for update using (auth.uid() = user_id);

create policy "Users can delete own brand kits" on public.brand_kits
  for delete using (auth.uid() = user_id);

create policy "Users can read own subscription" on public.subscriptions
  for select using (auth.uid() = user_id);

create policy "Users can read own usage" on public.usage_events
  for select using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.subscriptions (user_id, plan, status)
  values (new.id, 'free', 'inactive')
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- Stripe webhook idempotency: prevent duplicate event processing
create table if not exists public.stripe_events (
  id text primary key,
  processed_at timestamptz not null default now()
);
-- No RLS needed — only accessible via service role key in webhook handler

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
