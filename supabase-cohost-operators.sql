-- Co-host operators: profile + credits linked to Supabase Auth (auth.users).
--
-- IMPORTANT — passwords / “login”:
--   Supabase stores credentials in auth.users (encrypted). Do NOT put passwords in public tables.
--   Create each operator login first:
--     • Supabase Dashboard → Authentication → Users → Add user → Email + Password, OR
--     • Let them self-register via /operator/signup in your app.
--   Then insert (or update) a row in public.cohost_operators with the same user id.
--
-- Run in Supabase SQL Editor (or psql). Adjust schema/policies if you use custom roles.
-- If you already ran supabase-schema.sql, set_updated_at() exists; CREATE OR REPLACE is harmless.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1) Operator profile + credits (one row per auth user)
-- ---------------------------------------------------------------------------

create table if not exists public.cohost_operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  phone text,
  areas_served text,
  listings_managed text,
  portfolio_url text,
  pitch text,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'approved', 'suspended')),
  -- Starter: first intros free at join; match OPERATOR_FREE_INTRO_CREDITS in operator-intro-pricing.ts
  intro_credits_balance int not null default 2 check (intro_credits_balance >= 0),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id)
);

create unique index if not exists idx_cohost_operators_email_lower
  on public.cohost_operators (lower(email));

create index if not exists idx_cohost_operators_user_id on public.cohost_operators (user_id);
create index if not exists idx_cohost_operators_status on public.cohost_operators (status);

-- If this table already existed with default 0, run once:
--   alter table public.cohost_operators alter column intro_credits_balance set default 2;

drop trigger if exists trg_cohost_operators_updated_at on public.cohost_operators;
create trigger trg_cohost_operators_updated_at
before update on public.cohost_operators
for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 2) Row Level Security — operators read/update only their own row
--    (API routes using service_role bypass RLS, same pattern as guest_intakes.)
-- ---------------------------------------------------------------------------

alter table public.cohost_operators enable row level security;

drop policy if exists "cohost_operators_select_own" on public.cohost_operators;
create policy "cohost_operators_select_own"
on public.cohost_operators for select
using (auth.uid() = user_id);

drop policy if exists "cohost_operators_update_own" on public.cohost_operators;
create policy "cohost_operators_update_own"
on public.cohost_operators for update
using (auth.uid() = user_id);

-- Optional: allow approved operators to insert their own row once (e.g. first login after invite).
-- If you only ever INSERT via SQL/Dashboard, comment this out.
drop policy if exists "cohost_operators_insert_own" on public.cohost_operators;
create policy "cohost_operators_insert_own"
on public.cohost_operators for insert
with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- 3) Optional: tag auth user as co-host in JWT (for future role checks in the app)
--    Run after the user exists in auth.users.
-- ---------------------------------------------------------------------------
-- update auth.users
-- set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'cohost')
-- where email = lower('operator@example.com');

-- ---------------------------------------------------------------------------
-- 4) Example: attach profile to an EXISTING auth user (get id from Dashboard or query below)
-- ---------------------------------------------------------------------------
-- select id, email from auth.users where email = lower('operator@example.com');
--
-- insert into public.cohost_operators (
--   user_id,
--   email,
--   full_name,
--   phone,
--   areas_served,
--   listings_managed,
--   portfolio_url,
--   status,
--   intro_credits_balance
-- ) values (
--   'PASTE-USER-UUID-FROM-auth.users',
--   'operator@example.com',
--   'Jane Operator',
--   '+44 7700 900000',
--   'Greater London, Brighton',
--   '2-5',
--   'https://airbnb.com/users/123',
--   'approved',
--   10
-- );

-- ---------------------------------------------------------------------------
-- 5) Example: top up credits (admin / SQL editor with sufficient privilege)
-- ---------------------------------------------------------------------------
-- update public.cohost_operators
-- set intro_credits_balance = intro_credits_balance + 5,
--     updated_at = now()
-- where email = lower('operator@example.com');
