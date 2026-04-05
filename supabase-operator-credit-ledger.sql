-- Ledger for co-host intro credits (Stripe grants + per-intro consumption).
-- Run after supabase-cohost-operators.sql and supabase-intro-requests.sql (FK to host_intro_requests).

create table if not exists public.operator_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  operator_user_id uuid not null references auth.users (id) on delete cascade,
  delta int not null,
  reason text not null,
  stripe_checkout_session_id text,
  intro_request_id uuid references public.host_intro_requests (id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index if not exists operator_credit_ledger_stripe_session_uidx
  on public.operator_credit_ledger (stripe_checkout_session_id)
  where stripe_checkout_session_id is not null;

create index if not exists idx_operator_credit_ledger_user
  on public.operator_credit_ledger (operator_user_id, created_at desc);

alter table public.operator_credit_ledger enable row level security;

drop policy if exists "operator_credit_ledger_select_own" on public.operator_credit_ledger;
create policy "operator_credit_ledger_select_own"
on public.operator_credit_ledger for select
using (auth.uid() = operator_user_id);

revoke insert, update, delete on public.operator_credit_ledger from anon, authenticated;
grant select on public.operator_credit_ledger to authenticated;
grant select, insert, update, delete on public.operator_credit_ledger to service_role;
