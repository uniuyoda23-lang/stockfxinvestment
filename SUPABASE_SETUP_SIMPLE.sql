-- SUPABASE DATABASE SETUP FOR STOCKFX INVESTMENT
-- SIMPLIFIED VERSION - NO RLS (to fix data persistence issue)
-- Run this SQL in your Supabase dashboard: Settings → SQL Editor → New Query

-- Drop existing table and policies if they exist
DROP TABLE IF EXISTS public.users CASCADE;

-- Create users table
CREATE TABLE public.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  balance FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  registrationStatus VARCHAR(50) DEFAULT 'pending',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on changes
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
