-- 灵境 Oracle Supabase schema
-- Run this in Supabase SQL Editor after creating the project.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  avatar text,
  created_at timestamptz not null default now()
);

create table if not exists public.readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('fortune', 'tarot', 'past_life', 'daily')),
  result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.soul_portraits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  image_url text,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.compatibility_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  report jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists readings_user_created_idx on public.readings(user_id, created_at desc);
create index if not exists soul_portraits_user_created_idx on public.soul_portraits(user_id, created_at desc);
create index if not exists compatibility_user_created_idx on public.compatibility_reports(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.readings enable row level security;
alter table public.soul_portraits enable row level security;
alter table public.compatibility_reports enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

create policy "readings_select_own" on public.readings for select using (auth.uid() = user_id);
create policy "readings_insert_own" on public.readings for insert with check (auth.uid() = user_id);

create policy "soul_select_own" on public.soul_portraits for select using (auth.uid() = user_id);
create policy "soul_insert_own" on public.soul_portraits for insert with check (auth.uid() = user_id);

create policy "compatibility_select_own" on public.compatibility_reports for select using (auth.uid() = user_id);
create policy "compatibility_insert_own" on public.compatibility_reports for insert with check (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', new.email),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Optional storage bucket for generated soul posters.
insert into storage.buckets (id, name, public)
values ('soul-posters', 'soul-posters', true)
on conflict (id) do nothing;
