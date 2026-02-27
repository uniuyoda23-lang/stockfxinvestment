// Hook for cross-device session synchronization
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { deviceManager, SessionEvent } from '../services/deviceManager';

export interface SyncListener {
  (event: SessionEvent): void;
}

interface UseSessionSyncOptions {
  userId?: string;
  onSessionChange?: (event: SessionEvent) => void;
  onLogout?: () => void;
  onDeviceRemoved?: () => void;
  pollInterval?: number;
}

/**
 * Hook for real-time cross-device session synchronization
 */
export function useSessionSync(options: UseSessionSyncOptions = {}) {
  const {
    userId,
    onSessionChange,
    onLogout,
    onDeviceRemoved,
    pollInterval = 5000, // Poll every 5 seconds
  } = options;

  const lastEventIdRef = useRef<string>();
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Subscribe to real-time session events
  const subscribeToEvents = useCallback(() => {
    if (!userId) return;

    // Create real-time subscription to session events
    const subscription = supabase
      .channel(`session_events:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_events',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const event = payload.new as SessionEvent;
          lastEventIdRef.current = event.id;

          // Handle different event types
          switch (event.event_type) {
            case 'session_sync':
              onSessionChange?.(event);
              break;
            case 'logout':
              onLogout?.();
              break;
            case 'device_removed':
              onDeviceRemoved?.();
              break;
            default:
              onSessionChange?.(event);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, onSessionChange, onLogout, onDeviceRemoved]);

  // Poll for session changes as fallback
  const startPolling = useCallback(() => {
    if (!userId) return;

    const pollTimer = setInterval(async () => {
      try {
        const events = await deviceManager.getSessionEvents(userId, 10);

        // Check for new events since last check
        for (const event of events) {
          if (lastEventIdRef.current === event.id) break;

          switch (event.event_type) {
            case 'logout':
              onLogout?.();
              break;
            case 'device_removed':
              onDeviceRemoved?.();
              break;
            case 'session_sync':
              onSessionChange?.(event);
              break;
          }
          lastEventIdRef.current = event.id;
        }
      } catch (error) {
        console.error('Error polling session events:', error);
      }
    }, pollInterval);

    return () => clearInterval(pollTimer);
  }, [userId, pollInterval, onSessionChange, onLogout, onDeviceRemoved]);

  useEffect(() => {
    if (!userId) return;

    // Try real-time subscription first
    const unsubscribe = subscribeToEvents();
    // Also start polling as fallback
    const pollCleanup = startPolling();

    unsubscribeRef.current = () => {
      unsubscribe?.();
      pollCleanup?.();
    };

    return () => {
      unsubscribeRef.current?.();
    };
  }, [userId, subscribeToEvents, startPolling]);

  return {
    unsubscribe: () => unsubscribeRef.current?.(),
  };
}

/**
 * Hook to get all active devices for current user
 */
export function useActiveDevices(userId?: string) {
  const [devices, setDevices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setDevices([]);
      return;
    }

    const fetchDevices = async () => {
      try {
        setLoading(true);
        const activeDevices = await deviceManager.getActiveDevices(userId);
        setDevices(activeDevices);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch devices'));
      } finally {
        setLoading(false);
      }
    };

    fetchDevices();

    // Refresh devices every 10 seconds
    const interval = setInterval(fetchDevices, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  const removeDevice = useCallback(
    async (deviceId: string) => {
      if (!userId) return;
      try {
        await deviceManager.removeDevice(userId, deviceId);
        setDevices((prev) => prev.filter((d) => d.device_id !== deviceId));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to remove device'));
      }
    },
    [userId]
  );

  return { devices, loading, error, removeDevice };
}

/**
 * Hook to monitor if user is logged out from another device
 */
export function useLogoutDetection(userId?: string) {
  const [isLoggedOut, setIsLoggedOut] = React.useState(false);

  useSessionSync({
    userId,
    onLogout: () => {
      setIsLoggedOut(true);
    },
  });

  return { isLoggedOut };
}

// Re-export React at the top
import React from 'react';
