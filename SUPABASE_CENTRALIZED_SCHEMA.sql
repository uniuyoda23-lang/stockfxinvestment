-- CENTRALIZED SUPABASE SCHEMA FOR STOCKFX INVESTMENT
-- Run this in Supabase SQL Editor to create all tables needed by all backends
-- This replaces lowdb, SQLite, and individual database files

-- ============================================================================
-- USERS TABLE (Core user data - used by auth + all services)
-- ============================================================================
DROP TABLE IF EXISTS public.users CASCADE;

CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active',
  registration_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);

-- ============================================================================
-- SESSIONS TABLE (JWT tokens, session management - used by auth gateway)
-- ============================================================================
DROP TABLE IF EXISTS public.sessions CASCADE;

CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token VARCHAR(1000),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_token ON public.sessions(token);

-- ============================================================================
-- USER ACCOUNTS TABLE (Account balances, portfolio - used by dashboard backend)
-- ============================================================================
DROP TABLE IF EXISTS public.user_accounts CASCADE;

CREATE TABLE public.user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  balance FLOAT DEFAULT 0,
  total_investment FLOAT DEFAULT 0,
  account_number VARCHAR(50),
  account_type VARCHAR(50) DEFAULT 'standard',
  kyc_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_user_accounts_user_id ON public.user_accounts(user_id);

-- ============================================================================
-- TRANSACTIONS TABLE (Trades, transfers - used by dashboard backend)
-- ============================================================================
DROP TABLE IF EXISTS public.transactions CASCADE;

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(50), -- 'buy', 'sell', 'deposit', 'withdrawal'
  symbol VARCHAR(20),
  quantity FLOAT,
  price FLOAT,
  amount FLOAT,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

-- ============================================================================
-- OTP CODES TABLE (One-time passwords - used by OTP service)
-- ============================================================================
DROP TABLE IF EXISTS public.otp_codes CASCADE;

CREATE TABLE public.otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  code VARCHAR(6) NOT NULL,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 5,
  expires_at TIMESTAMP,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_otp_email ON public.otp_codes(email);
CREATE INDEX idx_otp_code ON public.otp_codes(code);

-- ============================================================================
-- PORTFOLIO TABLE (Holdings - used by dashboard backend)
-- ============================================================================
DROP TABLE IF EXISTS public.portfolio CASCADE;

CREATE TABLE public.portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  symbol VARCHAR(20) NOT NULL,
  quantity FLOAT NOT NULL,
  average_cost FLOAT,
  current_price FLOAT,
  total_value FLOAT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

CREATE INDEX idx_portfolio_user_id ON public.portfolio(user_id);

-- ============================================================================
-- AUDIT LOG TABLE (For tracking all changes)
-- ============================================================================
DROP TABLE IF EXISTS public.audit_logs CASCADE;

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  resource VARCHAR(100),
  old_values JSONB,
  new_values JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_accounts_updated_at BEFORE UPDATE ON public.user_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolio_updated_at BEFORE UPDATE ON public.portfolio FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SECURITY & RLS (Row Level Security) - Optional for Production
-- ============================================================================
-- Uncomment and adjust for production:
/*
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON public.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (id = auth.uid());
*/

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify schema)
-- ============================================================================
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- \d public.users
-- \d public.user_accounts
