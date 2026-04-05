-- Co-host applications from public /cohosts form (persists before manual approval).
-- Run in Supabase SQL Editor. API inserts via service role only.

create table if not exists public.cohost_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  areas_served text not null,
  listings_managed text not null,
  portfolio_url text,
  pitch text,
  status text not null default 'submitted'
    check (status in ('submitted', 'reviewing', 'invited', 'rejected')),
  created_at timestamptz not null default now()
);

create index if not exists idx_cohost_applications_created_at
  on public.cohost_applications (created_at desc);
create index if not exists idx_cohost_applications_email_lower
  on public.cohost_applications (lower(email));

alter table public.cohost_applications enable row level security;

revoke select, insert, update, delete on public.cohost_applications from anon, authenticated;
grant select, insert, update, delete on public.cohost_applications to service_role;
