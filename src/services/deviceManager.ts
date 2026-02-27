// Device Management Service - Handle cross-device session sync
import { supabase } from '../lib/supabase';
import { UAParser } from 'ua-parser-js';

export interface Device {
  id: string;
  user_id: string;
  device_id: string;
  device_name?: string;
  device_type: 'web' | 'mobile' | 'desktop';
  browser?: string;
  os?: string;
  ip_address?: string;
  last_active: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DeviceSession {
  id: string;
  device_id: string;
  user_id: string;
  token?: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SessionEvent {
  id: string;
  user_id: string;
  device_id?: string;
  event_type: 'login' | 'logout' | 'session_update' | 'device_removed' | 'session_sync';
  event_data: Record<string, any>;
  created_at: string;
}

class DeviceManager {
  private static instance: DeviceManager;

  private constructor() {}

  static getInstance(): DeviceManager {
    if (!DeviceManager.instance) {
      DeviceManager.instance = new DeviceManager();
    }
    return DeviceManager.instance;
  }

  /**
   * Generate a unique device ID based on browser fingerprint
   */
  generateDeviceId(): string {
    const userAgent = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const fingerprint = `${userAgent}-${language}-${timezone}-${Date.now()}`;
    return btoa(fingerprint).slice(0, 32);
  }

  /**
   * Get device info from User-Agent
   */
  getDeviceInfo() {
    const parser = new UAParser();
    const result = parser.getResult();

    return {
      device_type: result.device.type || 'web' as const,
      browser: `${result.browser.name} ${result.browser.version}`.trim(),
      os: `${result.os.name} ${result.os.version}`.trim(),
    };
  }

  /**
   * Register or update device
   */
  async registerDevice(userId: string, deviceName?: string) {
    try {
      const deviceId = this.generateDeviceId();
      const deviceInfo = this.getDeviceInfo();

      // Check if device already exists
      const { data: existingDevice } = await supabase
        .from('devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_id', deviceId)
        .single();

      if (existingDevice) {
        // Update last_active
        const { data: updatedDevice, error } = await supabase
          .from('devices')
          .update({
            last_active: new Date().toISOString(),
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingDevice.id)
          .select()
          .single();

        if (error) throw error;
        return updatedDevice as Device;
      }

      // Register new device
      const { data: newDevice, error } = await supabase
        .from('devices')
        .insert({
          user_id: userId,
          device_id: deviceId,
          device_name: deviceName || this.getDefaultDeviceName(deviceInfo),
          ...deviceInfo,
          last_active: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return newDevice as Device;
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  /**
   * Get all active devices for a user
   */
  async getActiveDevices(userId: string) {
    try {
      const { data: devices, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_active', { ascending: false });

      if (error) throw error;
      return devices as Device[];
    } catch (error) {
      console.error('Failed to get active devices:', error);
      return [];
    }
  }

  /**
   * Remove a device
   */
  async removeDevice(userId: string, deviceId: string) {
    try {
      // Get the device first
      const { data: device } = await supabase
        .from('devices')
        .select('id')
        .eq('user_id', userId)
        .eq('device_id', deviceId)
        .single();

      if (!device) {
        throw new Error('Device not found');
      }

      // Deactivate device
      await supabase
        .from('devices')
        .update({ is_active: false })
        .eq('id', device.id);

      // Invalidate all sessions for this device
      await supabase
        .from('device_sessions')
        .update({ is_active: false })
        .eq('device_id', device.id);

      // Log event
      await this.logSessionEvent(userId, device.id, 'device_removed', {
        device_id: deviceId,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to remove device:', error);
      throw error;
    }
  }

  /**
   * Update device session
   */
  async createDeviceSession(userId: string, deviceId: string, token: string, expiresIn: number = 604800) {
    try {
      const device = await supabase
        .from('devices')
        .select('id')
        .eq('device_id', deviceId)
        .single();

      if (!device.data) {
        throw new Error('Device not found');
      }

      const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

      // Check if session exists for this device
      const { data: existingSession } = await supabase
        .from('device_sessions')
        .select('id')
        .eq('device_id', device.data.id)
        .single();

      if (existingSession) {
        // Update existing session
        const { data: updated, error } = await supabase
          .from('device_sessions')
          .update({
            token,
            expires_at: expiresAt,
            is_active: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingSession.id)
          .select()
          .single();

        if (error) throw error;
        return updated as DeviceSession;
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('device_sessions')
        .insert({
          device_id: device.data.id,
          user_id: userId,
          token,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return newSession as DeviceSession;
    } catch (error) {
      console.error('Failed to create device session:', error);
      throw error;
    }
  }

  /**
   * Log session event for real-time sync
   */
  async logSessionEvent(
    userId: string,
    deviceId: string | undefined,
    eventType: 'login' | 'logout' | 'session_update' | 'device_removed' | 'session_sync',
    eventData: Record<string, any>
  ) {
    try {
      const { error } = await supabase
        .from('session_events')
        .insert({
          user_id: userId,
          device_id: deviceId,
          event_type: eventType,
          event_data: eventData,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to log session event:', error);
    }
  }

  /**
   * Get recent session events
   */
  async getSessionEvents(userId: string, limit: number = 50) {
    try {
      const { data: events, error } = await supabase
        .from('session_events')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return events as SessionEvent[];
    } catch (error) {
      console.error('Failed to get session events:', error);
      return [];
    }
  }

  /**
   * Sync session data across devices
   */
  async syncSessionData(userId: string, data: Record<string, any>) {
    try {
      // Get all active devices
      const activeDevices = await this.getActiveDevices(userId);

      // Log sync event for each device
      for (const device of activeDevices) {
        await this.logSessionEvent(userId, device.id, 'session_sync', {
          data,
          timestamp: new Date().toISOString(),
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to sync session data:', error);
      throw error;
    }
  }

  /**
   * Get default device name based on device info
   */
  private getDefaultDeviceName(deviceInfo: any): string {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    return `${deviceInfo.os?.split(' ')[0] || 'Device'} - ${timestamp}`;
  }

  /**
   * Check if session is valid across devices
   */
  async validateSession(userId: string, token: string): Promise<boolean> {
    try {
      const { data: session } = await supabase
        .from('device_sessions')
        .select('*, devices(*)')
        .eq('user_id', userId)
        .eq('token', token)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      return !!session;
    } catch (error) {
      return false;
    }
  }

  /**
   * Invalidate all sessions for a user (logout from all devices)
   */
  async logoutFromAllDevices(userId: string) {
    try {
      const { error } = await supabase
        .from('device_sessions')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) throw error;

      // Log event
      await this.logSessionEvent(userId, undefined, 'logout', {
        type: 'all_devices',
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      console.error('Failed to logout from all devices:', error);
      throw error;
    }
  }
}

export const deviceManager = DeviceManager.getInstance();
