// API endpoint to manage active devices and sessions
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Verify JWT token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization' });
    }

    const token = authHeader.substring(7);
    let decoded: any;

    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const userId = decoded.userId;

    // GET - Get all active devices
    if (req.method === 'GET') {
      try {
        const { data: devices, error } = await supabase
          .from('devices')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('last_active', { ascending: false });

        if (error) throw error;

        return res.status(200).json({
          success: true,
          devices: devices || [],
        });
      } catch (error: any) {
        console.error('Failed to fetch devices:', error);
        return res.status(500).json({
          error: 'Failed to fetch devices',
          details: error.message,
        });
      }
    }

    // POST - Logout from all devices or specific device
    if (req.method === 'POST') {
      const { action, deviceId } = req.body;

      if (action === 'logout_all') {
        try {
          // Deactivate all sessions
          await supabase
            .from('device_sessions')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

          // Deactivate all devices
          await supabase
            .from('devices')
            .update({ is_active: false })
            .eq('user_id', userId)
            .eq('is_active', true);

          // Log event
          await supabase
            .from('session_events')
            .insert({
              user_id: userId,
              event_type: 'logout',
              event_data: {
                type: 'all_devices',
                timestamp: new Date().toISOString(),
              },
            });

          return res.status(200).json({
            success: true,
            message: 'Logged out from all devices',
          });
        } catch (error: any) {
          console.error('Failed to logout from all devices:', error);
          return res.status(500).json({
            error: 'Failed to logout from all devices',
            details: error.message,
          });
        }
      }

      if (action === 'sync_data') {
        const { data: syncData } = req.body;

        try {
          // Log sync event
          await supabase
            .from('session_events')
            .insert({
              user_id: userId,
              event_type: 'session_sync',
              event_data: {
                data: syncData,
                timestamp: new Date().toISOString(),
              },
            });

          return res.status(200).json({
            success: true,
            message: 'Data synced across devices',
          });
        } catch (error: any) {
          console.error('Failed to sync data:', error);
          return res.status(500).json({
            error: 'Failed to sync data',
            details: error.message,
          });
        }
      }

      return res.status(400).json({ error: 'Invalid action' });
    }

    // DELETE - Remove specific device
    if (req.method === 'DELETE') {
      const { deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({ error: 'deviceId is required' });
      }

      try {
        // Get device
        const { data: device } = await supabase
          .from('devices')
          .select('id')
          .eq('user_id', userId)
          .eq('device_id', deviceId)
          .single();

        if (!device) {
          return res.status(404).json({ error: 'Device not found' });
        }

        // Deactivate device
        await supabase
          .from('devices')
          .update({ is_active: false })
          .eq('id', device.id);

        // Deactivate sessions
        await supabase
          .from('device_sessions')
          .update({ is_active: false })
          .eq('device_id', device.id);

        // Log event
        await supabase
          .from('session_events')
          .insert({
            user_id: userId,
            device_id: device.id,
            event_type: 'device_removed',
            event_data: {
              device_id: deviceId,
              timestamp: new Date().toISOString(),
            },
          });

        return res.status(200).json({
          success: true,
          message: 'Device removed successfully',
        });
      } catch (error: any) {
        console.error('Failed to remove device:', error);
        return res.status(500).json({
          error: 'Failed to remove device',
          details: error.message,
        });
      }
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('API error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message,
    });
  }
}
