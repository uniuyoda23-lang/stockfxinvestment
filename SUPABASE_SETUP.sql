-- SUPABASE DATABASE SETUP FOR STOCKFX INVESTMENT
-- Run this SQL in your Supabase dashboard: Settings → SQL Editor → New Query

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  balance FLOAT DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  registrationStatus VARCHAR(50) DEFAULT 'pending',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON public.users(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read their own data
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- Create policy to allow authenticated users to update their own data
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Create policy to allow public insert (for registration)
CREATE POLICY "Anyone can insert users" ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Create policy to allow users to read all users (for admin dashboard)
CREATE POLICY "Users can read all users" ON public.users
  FOR SELECT
  USING (true);

-- For now, update the last policy to allow updates for admin purposes
CREATE POLICY "Allow updates on users" ON public.users
  FOR UPDATE
  USING (true);

-- Create a function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on changes
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
