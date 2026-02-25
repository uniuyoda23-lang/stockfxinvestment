-- Supabase Schema for StockFX Authentication

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR,
  first_name VARCHAR,
  last_name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- OTP Codes table
CREATE TABLE IF NOT EXISTS otp_codes (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR NOT NULL,
  code VARCHAR NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_email_code (email, code),
  INDEX idx_expires_at (expires_at)
);

-- Sessions table (optional - for additional session management)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR NOT NULL UNIQUE,
  ip_address VARCHAR,
  user_agent VARCHAR,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read themselves" 
  ON users 
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update themselves" 
  ON users 
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Allow service role to manage OTP" 
  ON otp_codes 
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create index for faster lookups
CREATE INDEX idx_otp_email ON otp_codes(email);
CREATE INDEX idx_otp_verification ON otp_codes(email, verified, expires_at);
CREATE INDEX idx_users_email ON users(email);
