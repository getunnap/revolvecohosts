-- Run this in Supabase SQL Editor for MVP auth + persistence.

create extension if not exists pgcrypto;

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_url text not null,
  location text not null,
  title text not null,
  description text not null,
  amenities text not null,
  target_guest text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  status text not null default 'ready_free',
  score int,
  free_report_json jsonb,
  full_report_json jsonb,
  stripe_payment_status text not null default 'unpaid',
  stripe_checkout_session_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_intakes (
  id uuid primary key default gen_random_uuid(),
  listing_url text not null,
  target_guest text not null,
  report_id text,
  email text,
  created_at timestamptz not null default now()
);

alter table public.guest_intakes add column if not exists email text;
alter table public.guest_intakes add column if not exists additional_listing_urls text[];
alter table public.guest_intakes add column if not exists purchase_quantity int default 1;
alter table public.guest_intakes add column if not exists full_report_emailed_at timestamptz;
alter table public.guest_intakes add column if not exists listing_snapshot jsonb;
alter table public.guest_intakes add column if not exists full_report_json jsonb;
alter table public.guest_intakes add column if not exists stripe_checkout_session_id text;
alter table public.guest_intakes add column if not exists paid_at timestamptz;

create index if not exists idx_listings_user_id on public.listings(user_id);
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_reports_listing_id on public.reports(listing_id);
create index if not exists idx_reports_checkout_session on public.reports(stripe_checkout_session_id);
create index if not exists idx_guest_intakes_created_at on public.guest_intakes(created_at desc);

-- Guest intakes: server-only via service role (bypasses RLS). No anon SELECT/INSERT.
alter table public.guest_intakes enable row level security;

drop policy if exists "guest_intakes_insert_any" on public.guest_intakes;
drop policy if exists "guest_intakes_select_any" on public.guest_intakes;

revoke select, insert, update, delete on public.guest_intakes from anon, authenticated;
grant select, insert, update, delete on public.guest_intakes to service_role;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_reports_updated_at on public.reports;
create trigger trg_reports_updated_at
before update on public.reports
for each row execute function public.set_updated_at();

alter table public.listings enable row level security;
alter table public.reports enable row level security;

drop policy if exists "listings_select_own" on public.listings;
create policy "listings_select_own"
on public.listings for select
using (auth.uid() = user_id);

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
on public.listings for insert
with check (auth.uid() = user_id);

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
on public.listings for update
using (auth.uid() = user_id);

drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
on public.reports for select
using (auth.uid() = user_id);

drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
on public.reports for insert
with check (auth.uid() = user_id);

drop policy if exists "reports_update_own" on public.reports;
create policy "reports_update_own"
on public.reports for update
using (auth.uid() = user_id);
