// Example Component: Device Management UI
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLogoutDetection } from '../hooks/useSessionSync';
import { authService } from '../services/authService';

export function DeviceManagement() {
  const { user, activeDevices, devicesLoading, removeDevice, logoutFromAllDevices } = useAuth();

  if (!user) {
    return <div>Please log in to view devices</div>;
  }

  if (devicesLoading) {
    return <div>Loading devices...</div>;
  }

  return (
    <div className="device-management">
      <h2>Active Devices</h2>
      <p>You're logged in on {activeDevices.length} device(s)</p>

      {activeDevices.length === 0 ? (
        <p>No active devices found</p>
      ) : (
        <div className="devices-list">
          {activeDevices.map((device) => (
            <div key={device.id} className="device-item">
              <div className="device-info">
                <h3>{device.device_name || 'Unknown Device'}</h3>
                <p>Type: {device.device_type}</p>
                <p>Browser: {device.browser}</p>
                <p>OS: {device.os}</p>
                <p>Last active: {new Date(device.last_active).toLocaleString()}</p>
              </div>
              <button
                onClick={() => removeDevice(device.device_id)}
                className="btn-remove"
              >
                Remove This Device
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="device-actions">
        <button
          onClick={logoutFromAllDevices}
          className="btn-logout-all"
        >
          Logout From All Devices
        </button>
      </div>
    </div>
  );
}

/**
 * Settings page example showing how to use cross-device features
 */
export function SettingsPage() {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      // Sync user preferences across all devices
      const result = await authService.syncDataAcrossDevices({
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en',
        },
        updatedAt: new Date().toISOString(),
      });

      if (result.success) {
        alert('Settings synced to all devices');
      } else {
        alert('Failed to sync settings: ' + result.error);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Settings</h1>

      <section className="sync-section">
        <h2>Sync Across Devices</h2>
        <p>Your preferences are automatically synced across all your devices</p>
        <button onClick={handleSyncData} disabled={isSyncing}>
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </section>

      <section className="device-section">
        <h2>Device Management</h2>
        <DeviceManagement />
      </section>
    </div>
  );
}

/**
 * Hook example: Monitor if logged out from another device
 */
export function LogoutWarning() {
  const [showWarning, setShowWarning] = React.useState(false);

  // This hook automatically detects when user is logged out from another device
  const { isLoggedOut } = useLogoutDetection(useAuth().user?.id);

  React.useEffect(() => {
    if (isLoggedOut) {
      setShowWarning(true);
    }
  }, [isLoggedOut]);

  if (!showWarning) return null;

  return (
    <div className="warning-banner">
      <h3>You've been logged out</h3>
      <p>Your account was logged out on another device. Please log in again.</p>
      <button onClick={() => window.location.href = '/login'}>
        Go to Login
      </button>
    </div>
  );
}
