// API endpoint to register device and create session
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, deviceId, deviceName, deviceType, browser, os, token, expiresIn } = req.body;

    // Validate input
    if (!userId || !deviceId) {
      return res.status(400).json({ error: 'userId and deviceId are required' });
    }

    // Check if device already exists
    const { data: existingDevice } = await supabase
      .from('devices')
      .select('id')
      .eq('user_id', userId)
      .eq('device_id', deviceId)
      .single();

    let deviceDbId: string;

    if (existingDevice) {
      // Update existing device
      const { data: updated, error } = await supabase
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

      if (error) throw error;
      deviceDbId = updated?.id;
    } else {
      // Register new device
      const { data: newDevice, error } = await supabase
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

      if (error) throw error;
      deviceDbId = newDevice?.id;
    }

    // Create or update device session
    const expiryTime = expiresIn || 604800; // 7 days default
    const expiresAt = new Date(Date.now() + expiryTime * 1000).toISOString();

    const { data: existingSession } = await supabase
      .from('device_sessions')
      .select('id')
      .eq('device_id', deviceDbId)
      .single();

    if (existingSession) {
      await supabase
        .from('device_sessions')
        .update({
          token: token || undefined,
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
          token: token || undefined,
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
        event_type: existingDevice ? 'session_update' : 'login',
        event_data: {
          device_name: deviceName,
          device_type: deviceType,
          timestamp: new Date().toISOString(),
        },
      });

    return res.status(200).json({
      success: true,
      message: 'Device registered successfully',
      device: {
        id: deviceDbId,
        device_id: deviceId,
        device_name: deviceName,
      },
    });
  } catch (error: any) {
    console.error('Failed to register device:', error);
    return res.status(500).json({
      error: 'Failed to register device',
      details: error.message,
    });
  }
}
