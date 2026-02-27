// Verify OTP and create user session
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, otp, deviceId, deviceName, deviceType, browser, os } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  try {
    // Find and verify OTP
    const { data: otpRecords, error: fetchError } = await supabase
      .from('otp_codes')
      .select('*')
      .eq('email', email)
      .eq('code', otp)
      .eq('verified', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError || !otpRecords || otpRecords.length === 0) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    const otpRecord = otpRecords[0];

    // Mark OTP as verified
    await supabase
      .from('otp_codes')
      .update({ verified: true })
      .eq('id', otpRecord.id);

    // Check if user exists
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .limit(1);

    let userId = users?.[0]?.id;

    // Create user if doesn't exist
    if (!userId) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert([{ email, created_at: new Date().toISOString() }])
        .select('id')
        .single();

      if (createError || !newUser) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
    }

    // Create JWT token (valid for 7 days)
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Register device if deviceId is provided (cross-device support)
    if (deviceId) {
      try {
        // Check if device exists
        const { data: existingDevice } = await supabase
          .from('devices')
          .select('id')
          .eq('user_id', userId)
          .eq('device_id', deviceId)
          .single();

        let deviceDbId: string;

        if (existingDevice) {
          // Update existing device
          const { data: updated } = await supabase
            .from('devices')
            .update({
              last_active: new Date().toISOString(),
              is_active: true,
              device_name: deviceName || undefined,
              device_type: deviceType || 'web',
              browser: browser || undefined,
              os: os || undefined,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingDevice.id)
            .select('id')
            .single();
          deviceDbId = updated?.id;
        } else {
          // Register new device
          const { data: newDevice } = await supabase
            .from('devices')
            .insert({
              user_id: userId,
              device_id: deviceId,
              device_name: deviceName,
              device_type: deviceType || 'web',
              browser: browser,
              os: os,
              ip_address: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
              last_active: new Date().toISOString(),
            })
            .select('id')
            .single();
          deviceDbId = newDevice?.id;
        }

        // Create device session
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: existingSession } = await supabase
          .from('device_sessions')
          .select('id')
          .eq('device_id', deviceDbId)
          .single();

        if (existingSession) {
          await supabase
            .from('device_sessions')
            .update({
              token,
              expires_at: expiresAt,
              is_active: true,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existingSession.id);
        } else {
          await supabase
            .from('device_sessions')
            .insert({
              device_id: deviceDbId,
              user_id: userId,
              token,
              expires_at: expiresAt,
              is_active: true,
            });
        }

        // Log session event
        await supabase
          .from('session_events')
          .insert({
            user_id: userId,
            device_id: deviceDbId,
            event_type: 'login',
            event_data: {
              device_name: deviceName,
              device_type: deviceType,
              timestamp: new Date().toISOString(),
            },
          });
      } catch (deviceError) {
        console.error('Failed to register device:', deviceError);
        // Don't fail the whole request if device registration fails
      }
    }

    return res.status(200).json({
      success: true,
      token,
      user: { id: userId, email },
      message: 'OTP verified successfully',
    });
  } catch (error: unknown) {
    console.error('Failed to verify OTP:', error);
    return res.status(500).json({
      error: 'Failed to verify OTP',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
