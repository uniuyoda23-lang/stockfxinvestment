-- Cross-Device Session Management Schema
-- Add these tables to your existing Supabase schema

-- Devices table - track user devices
CREATE TABLE IF NOT EXISTS devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR UNIQUE NOT NULL,
  device_name VARCHAR,
  device_type VARCHAR, -- 'web', 'mobile', 'desktop'
  browser VARCHAR,
  os VARCHAR,
  ip_address VARCHAR,
  last_active TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Device Sessions table - manage sessions per device
CREATE TABLE IF NOT EXISTS device_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR,
  refresh_token VARCHAR,
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Session Events table - track session changes for real-time sync
CREATE TABLE IF NOT EXISTS session_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id UUID REFERENCES devices(id) ON DELETE SET NULL,
  event_type VARCHAR NOT NULL, -- 'login', 'logout', 'session_update', 'device_removed'
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for devices
CREATE POLICY "Users can read their own devices"
  ON devices
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own devices"
  ON devices
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own devices"
  ON devices
  FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all devices"
  ON devices
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for device_sessions
CREATE POLICY "Users can read their own device sessions"
  ON device_sessions
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all device sessions"
  ON device_sessions
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- RLS Policies for session_events
CREATE POLICY "Users can read their own session events"
  ON session_events
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all session events"
  ON session_events
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_devices_active ON devices(user_id, is_active);
CREATE INDEX idx_sessions_valid ON device_sessions(user_id, is_active, expires_at);
CREATE INDEX idx_events_user_time ON session_events(user_id, created_at DESC);

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  UPDATE device_sessions
  SET is_active = FALSE
  WHERE expires_at < NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to log session events
CREATE OR REPLACE FUNCTION log_session_event(
  p_user_id UUID,
  p_device_id UUID,
  p_event_type VARCHAR,
  p_event_data JSONB
)
RETURNS void AS $$
BEGIN
  INSERT INTO session_events (user_id, device_id, event_type, event_data)
  VALUES (p_user_id, p_device_id, p_event_type, p_event_data);
END;
$$ LANGUAGE plpgsql;
