-- Add Thomas Doe as an approved co-host operator (info@revolvecohosts.com).
--
-- Prerequisite: that email must already exist in Authentication (auth.users).
-- If it does not, create it first: Dashboard → Authentication → Users → Add user,
-- or sign up at /operator/signup with this email.
--
-- Run in Supabase SQL Editor after public.cohost_operators exists (see supabase-cohost-operators.sql).

insert into public.cohost_operators (
  user_id,
  email,
  full_name,
  phone,
  areas_served,
  listings_managed,
  portfolio_url,
  pitch,
  status,
  intro_credits_balance,
  catalog_match_id
)
select
  u.id,
  'info@revolvecohosts.com',
  'Thomas Doe',
  null,
  'UK',
  '1',
  null,
  null,
  'approved',
  10,
  'mock-1'
from auth.users u
where u.email = lower('info@revolvecohosts.com')
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  status = excluded.status,
  intro_credits_balance = excluded.intro_credits_balance,
  catalog_match_id = excluded.catalog_match_id,
  updated_at = now();

-- Optional: mark JWT for future role checks in the app
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'cohost')
where email = lower('info@revolvecohosts.com');

-- Verify (should return one row)
select co.*, u.email as auth_email
from public.cohost_operators co
join auth.users u on u.id = co.user_id
where co.email = lower('info@revolvecohosts.com');
