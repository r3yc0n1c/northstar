-- Migration 00001: Create profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  timezone text not null default 'UTC',
  locale text not null default 'en-US',
  currency_code text not null default 'USD',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  working_days smallint[] not null default '{1,2,3,4,5}',
  working_hours jsonb not null default '{"mon":{"start":"09:00","end":"17:00"},"tue":{"start":"09:00","end":"17:00"},"wed":{"start":"09:00","end":"17:00"},"thu":{"start":"09:00","end":"17:00"},"fri":{"start":"09:00","end":"17:00"}}'::jsonb check (jsonb_typeof(working_hours) = 'object'),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile settings, locale, working hours, and onboarding status.';
