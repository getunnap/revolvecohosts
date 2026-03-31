-- Apply on existing Supabase projects (after initial schema) for production Phase 1.
-- Safe to run more than once.

alter table public.guest_intakes add column if not exists listing_snapshot jsonb;
alter table public.guest_intakes add column if not exists full_report_json jsonb;
alter table public.guest_intakes add column if not exists stripe_checkout_session_id text;
alter table public.guest_intakes add column if not exists paid_at timestamptz;

drop policy if exists "guest_intakes_insert_any" on public.guest_intakes;
drop policy if exists "guest_intakes_select_any" on public.guest_intakes;

revoke select, insert, update, delete on public.guest_intakes from anon, authenticated;
grant select, insert, update, delete on public.guest_intakes to service_role;
