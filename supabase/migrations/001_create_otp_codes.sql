-- Migration: create otp_codes table
-- Run this in Supabase SQL editor or with the Supabase CLI

create table if not exists public.otp_codes (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  code text not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  verified boolean default false
);

-- Optional index for lookups
create index if not exists idx_otp_codes_email_created_at on public.otp_codes (email, created_at desc);
