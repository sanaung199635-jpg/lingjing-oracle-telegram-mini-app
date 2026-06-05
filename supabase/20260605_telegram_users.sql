-- Telegram Mini App users for Lingjing Oracle.
-- Run this after supabase/schema.sql.

create extension if not exists "pgcrypto";

create table if not exists public.telegram_users (
  id uuid primary key default gen_random_uuid(),
  telegram_user_id bigint not null unique,
  username text,
  first_name text,
  last_name text,
  photo_url text,
  language_code text,
  init_data_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists telegram_users_telegram_user_id_idx
  on public.telegram_users (telegram_user_id);

create or replace function public.set_telegram_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists telegram_users_set_updated_at on public.telegram_users;
create trigger telegram_users_set_updated_at
before update on public.telegram_users
for each row execute function public.set_telegram_users_updated_at();

alter table public.telegram_users enable row level security;

-- No public RLS policies are added here. The app writes through the server-side
-- Supabase service role after Telegram initData validation.
