-- Host intro requests: co-host inbox, redacted preview, contact unlocked on accept.
-- Run after supabase-schema.sql and supabase-cohost-operators.sql.
--
-- Creates:
--   public.host_intro_requests
--   public.host_intro_request_contact  (PII — operators only see after accept via RLS)
-- Adds optional public.cohost_operators.catalog_match_id for linking UI match cards (e.g. mock-1).

alter table public.cohost_operators
  add column if not exists catalog_match_id text;

create unique index if not exists idx_cohost_operators_catalog_match_id
  on public.cohost_operators (catalog_match_id)
  where catalog_match_id is not null;

-- ---------------------------------------------------------------------------
-- 1) Intro request (visible row for host + operator; no raw PII in this table)
-- ---------------------------------------------------------------------------

create table if not exists public.host_intro_requests (
  id uuid primary key default gen_random_uuid(),
  host_user_id uuid not null references auth.users (id) on delete cascade,
  operator_id uuid not null references public.cohost_operators (id) on delete cascade,
  operator_user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'declined')),
  source_tool text not null default 'find_cohost',
  host_request_cohort_id uuid not null,
  catalog_match_id text,
  operator_display_name text,
  public_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists idx_host_intro_requests_host on public.host_intro_requests (host_user_id);
create index if not exists idx_host_intro_requests_operator_user on public.host_intro_requests (operator_user_id);
create index if not exists idx_host_intro_requests_cohort on public.host_intro_requests (host_request_cohort_id);
create index if not exists idx_host_intro_requests_status on public.host_intro_requests (status);

drop trigger if exists trg_host_intro_requests_updated_at on public.host_intro_requests;
create trigger trg_host_intro_requests_updated_at
before update on public.host_intro_requests
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2) Contact / listing PII (operators: SELECT only when parent status = accepted)
-- ---------------------------------------------------------------------------

create table if not exists public.host_intro_request_contact (
  intro_request_id uuid primary key references public.host_intro_requests (id) on delete cascade,
  host_email text not null,
  host_phone text,
  property_full_address text not null,
  listing_url text,
  host_notes text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3) RLS
-- ---------------------------------------------------------------------------

alter table public.host_intro_requests enable row level security;
alter table public.host_intro_request_contact enable row level security;

drop policy if exists "host_intro_requests_select_host" on public.host_intro_requests;
create policy "host_intro_requests_select_host"
on public.host_intro_requests for select
using (auth.uid() = host_user_id);

drop policy if exists "host_intro_requests_select_operator" on public.host_intro_requests;
create policy "host_intro_requests_select_operator"
on public.host_intro_requests for select
using (auth.uid() = operator_user_id);

-- Status changes (accept / decline) go through the API with service role so credits stay in sync.

-- Inserts are performed via service role (API) so hosts cannot forge operator_id.

drop policy if exists "host_intro_contact_select_host" on public.host_intro_request_contact;
create policy "host_intro_contact_select_host"
on public.host_intro_request_contact for select
using (
  exists (
    select 1 from public.host_intro_requests r
    where r.id = intro_request_id and r.host_user_id = auth.uid()
  )
);

drop policy if exists "host_intro_contact_select_operator_accepted" on public.host_intro_request_contact;
create policy "host_intro_contact_select_operator_accepted"
on public.host_intro_request_contact for select
using (
  exists (
    select 1 from public.host_intro_requests r
    where r.id = intro_request_id
      and r.operator_user_id = auth.uid()
      and r.status = 'accepted'
  )
);

revoke insert, update, delete on public.host_intro_requests from anon, authenticated;
revoke insert, update, delete on public.host_intro_request_contact from anon, authenticated;

grant select, insert, update, delete on public.host_intro_requests to service_role;
grant select, insert, update, delete on public.host_intro_request_contact to service_role;

grant select on public.host_intro_requests to authenticated;
grant select on public.host_intro_request_contact to authenticated;
