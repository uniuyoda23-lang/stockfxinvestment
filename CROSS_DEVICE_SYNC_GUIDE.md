# Cross-Device Session Synchronization Guide

## Overview

This guide explains how to implement and use cross-device session synchronization in your StockFX investment application. This feature allows users to seamlessly manage their authentication across multiple devices (web, mobile, desktop) with real-time session synchronization.

## Features

✅ **Device Registration & Tracking** - Automatically register devices on login
✅ **Real-Time Session Sync** - Sync session data across devices in real-time
✅ **Multi-Device Management** - View and manage active devices
✅ **Selective Logout** - Logout from specific devices
✅ **Logout from All Devices** - Instantly logout from all devices
✅ **Session Events** - Track login, logout, and sync events
✅ **Automatic Device Detection** - Detect OS, browser, and device type
✅ **Session Expiry Management** - Automatic cleanup of expired sessions

## Architecture

### Database Schema

The cross-device feature uses 3 new tables:

```sql
-- Devices table
├── id (UUID)
├── user_id (FK)
├── device_id (unique browser fingerprint)
├── device_name
├── device_type (web|mobile|desktop)
├── browser
├── os
├── ip_address
├── last_active
└── is_active

-- Device Sessions table
├── id (UUID)
├── device_id (FK)
├── user_id (FK)
├── token (JWT)
├── expires_at
└── is_active

-- Session Events table (for real-time sync)
├── id (UUID)
├── user_id (FK)
├── device_id (FK)
├── event_type (login|logout|session_update|device_removed|session_sync)
└── event_data (JSON)
```

### Services & Hooks

1. **`deviceManager.ts`** - Core device management service
2. **`useSessionSync.ts`** - Hooks for real-time session synchronization
3. **`authService.ts`** - Updated auth service with device registration
4. **API Endpoints**:
   - `/api/register-device.ts` - Register/update device
   - `/api/manage-devices.ts` - Get devices, sync data, logout

## Setup Instructions

### Step 1: Run Database Migration

Execute the SQL from `CROSS_DEVICE_SCHEMA.sql` in your Supabase SQL Editor:

```bash
# In Supabase Dashboard → SQL Editor
# Run the contents of CROSS_DEVICE_SCHEMA.sql
```

This creates:
- `devices` table with indexes
- `device_sessions` table
- `session_events` table
- RLS policies
- Helper functions

### Step 2: Update Dependencies

Ensure these packages are installed:

```bash
npm install ua-parser-js --save
npm install --save-dev @types/ua-parser-js
```

### Step 3: Configure API URL

Update `.env.local`:

```env
REACT_APP_API_URL=https://your-vercel-app.vercel.app
```

## Usage Examples

### 1. Login with Device Registration

The device is automatically registered during OTP verification:

```typescript
import { authService } from './services/authService';

// Request OTP
await authService.requestOTP('user@example.com');

// Verify OTP (device auto-registers)
const result = await authService.verifyOTP('user@example.com', '123456');

if (result.success) {
  // Device registered automatically
  // Token stored: localStorage.authToken
  // Device info stored: localStorage.deviceInfo
}
```

### 2. View Active Devices

```typescript
import { useAuth } from './context/AuthContext';

export function MyDevices() {
  const { activeDevices, devicesLoading } = useAuth();

  if (devicesLoading) return <div>Loading...</div>;

  return (
    <div>
      {activeDevices.map((device) => (
        <div key={device.id}>
          <p>{device.device_name}</p>
          <p>OS: {device.os} | Browser: {device.browser}</p>
          <p>Last active: {new Date(device.last_active).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
}
```

### 3. Remove Specific Device

```typescript
import { useAuth } from './context/AuthContext';

export function DeviceList() {
  const { activeDevices, removeDevice } = useAuth();

  return activeDevices.map((device) => (
    <button
      key={device.id}
      onClick={() => removeDevice(device.device_id)}
    >
      Remove {device.device_name}
    </button>
  ));
}
```

### 4. Logout from All Devices

```typescript
import { useAuth } from './context/AuthContext';

export function LogoutButton() {
  const { logoutFromAllDevices } = useAuth();

  return (
    <button onClick={() => logoutFromAllDevices()}>
      Logout from All Devices
    </button>
  );
}
```

### 5. Real-Time Session Sync

Detect when user is logged out on another device:

```typescript
import { useLogoutDetection } from './hooks/useSessionSync';

export function LogoutWarning() {
  const { isLoggedOut } = useLogoutDetection();

  if (isLoggedOut) {
    return <div>You were logged out on another device</div>;
  }
  return null;
}
```

### 6. Sync Data Across Devices

Sync user preferences or data across all devices:

```typescript
import { authService } from './services/authService';

// Sync data to all devices
await authService.syncDataAcrossDevices({
  preferences: {
    theme: 'dark',
    notifications: true,
  },
  language: 'en',
});

// Listen for sync events on another device
import { useSessionSync } from './hooks/useSessionSync';

const { unsubscribe } = useSessionSync({
  userId: currentUser.id,
  onSessionChange: (event) => {
    if (event.event_type === 'session_sync') {
      console.log('Synced data:', event.event_data.data);
      updateLocalPreferences(event.event_data.data);
    }
  },
});
```

## API Reference

### Device Manager Service

```typescript
// Get active devices
const devices = await deviceManager.getActiveDevices(userId);

// Register device
const device = await deviceManager.registerDevice(userId, deviceName);

// Remove device
await deviceManager.removeDevice(userId, deviceId);

// Create device session
const session = await deviceManager.createDeviceSession(
  userId,
  deviceId,
  token,
  expiresIn // in seconds
);

// Logout from all devices
await deviceManager.logoutFromAllDevices(userId);

// Sync session data
await deviceManager.syncSessionData(userId, data);

// Get session events
const events = await deviceManager.getSessionEvents(userId, limit);

// Log session event
await deviceManager.logSessionEvent(
  userId,
  deviceId,
  eventType,
  eventData
);
```

### Auth Service Methods

```typescript
// Request OTP
authService.requestOTP(email);

// Verify OTP with auto device registration
authService.verifyOTP(email, otp);

// Get active devices
authService.getActiveDevices();

// Remove specific device
authService.removeDevice(deviceId);

// Logout from all devices
authService.logoutFromAllDevices();

// Sync data across devices
authService.syncDataAcrossDevices(data);

// Get stored device info
authService.getDeviceInfo();

// Clear local storage
authService.logout();
```

### Hooks

```typescript
// Monitor session changes and logout
useSessionSync({
  userId,
  onSessionChange: (event) => {},
  onLogout: () => {},
  onDeviceRemoved: () => {},
  pollInterval: 5000,
});

// Get active devices and manage them
const { devices, loading, error, removeDevice } = useActiveDevices(userId);

// Detect if logged out from another device
const { isLoggedOut } = useLogoutDetection(userId);
```

## API Endpoints

### POST `/api/register-device`

Register or update a device.

**Request:**
```json
{
  "userId": "uuid",
  "deviceId": "device-fingerprint",
  "deviceName": "Living Room Mac",
  "deviceType": "web",
  "browser": "Chrome 120",
  "os": "macOS Sonoma",
  "token": "jwt-token",
  "expiresIn": 604800
}
```

**Response:**
```json
{
  "success": true,
  "message": "Device registered successfully",
  "device": {
    "id": "device-db-id",
    "device_id": "device-fingerprint",
    "device_name": "Living Room Mac"
  }
}
```

### GET `/api/manage-devices`

Get all active devices. Requires `Authorization: Bearer <token>` header.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "uuid",
      "device_id": "fingerprint",
      "device_name": "Living Room Mac",
      "device_type": "web",
      "browser": "Chrome 120",
      "os": "macOS",
      "last_active": "2024-01-15T10:30:00Z",
      "is_active": true
    }
  ]
}
```

### POST `/api/manage-devices`

Manage devices (logout all or sync data).

**Logout from all devices:**
```json
{
  "action": "logout_all"
}
```

**Sync data:**
```json
{
  "action": "sync_data",
  "data": {
    "preferences": { ... },
    "language": "en"
  }
}
```

### DELETE `/api/manage-devices`

Remove a specific device. Requires `Authorization: Bearer <token>` header.

**Request:**
```json
{
  "deviceId": "device-fingerprint"
}
```

## Event Types

Session events logged for tracking:

| Event Type | Description | Triggered When |
|---|---|---|
| `login` | User logs in | OTP verified on new device |
| `logout` | User logs out | User signs out |
| `session_update` | Session refreshed | User logs in on known device |
| `device_removed` | Device deleted | User removes device |
| `session_sync` | Data synced | User syncs data across devices |

## Real-Time Synchronization

### How It Works

1. **Real-Time via Supabase** (Preferred):
   - Subscribes to `session_events` table changes
   - Instant updates when events occur on other devices

2. **Polling Fallback**:
   - Polls every 5 seconds (configurable)
   - Used if real-time connection fails
   - Reduced server load compared to continuous subscription

### Example: Using Real-Time Sync

```typescript
useSessionSync({
  userId: currentUser.id,
  onSessionChange: (event) => {
    console.log('Session changed:', event);
  },
  onLogout: () => {
    // Redirect to login
    window.location.href = '/login';
  },
  onDeviceRemoved: () => {
    // Show notification
    showNotification('Device removed from account');
  },
  pollInterval: 5000,
});
```

## Security Considerations

1. **JWT Storage**: Tokens stored in `localStorage` are accessible via XSS
   - Implement Content Security Policy (CSP)
   - Use HttpOnly cookies for added security
   - Sanitize all user inputs

2. **Device Fingerprinting**:
   - Generated from User-Agent, timezone, language
   - Not foolproof but sufficient for most use cases
   - Can be spoofed but requires effort

3. **Token Expiry**:
   - Tokens expire in 7 days (configurable)
   - Session events clean up expired sessions
   - Check `expires_at` before using token

4. **CORS**: 
   - Currently allows all domains (`*`)
   - Restrict to specific domains in production:
   ```typescript
   res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
   ```

5. **RLS (Row Level Security)**:
   - Users can only read/update their own devices
   - Service role can manage all devices
   - Prevents unauthorized access

## Troubleshooting

### Devices Not Showing Up

1. Check database migration ran successfully
2. Verify `SUPABASE_SERVICE_KEY` is set in environment
3. Check RLS policies are enabled
4. Look for errors in browser console

### Real-Time Sync Not Working

1. Check Supabase realtime is enabled
2. Verify subscription filters are correct
3. Check network connection
4. Fallback polling should trigger after 5 seconds

### Device Registration Failing

1. Ensure `deviceId` is unique per browser
2. Check user exists in `users` table
3. Verify IP address is being set correctly
4. Check for database constraints

### Token Expiry Issues

1. Token expires in 7 days - user needs to re-login
2. Check `device_sessions.expires_at` in database
3. Extend token lifespan in `verify-otp.ts` if needed:
   ```typescript
   { expiresIn: '30d' } // 30 days instead of 7
   ```

## Best Practices

1. **Device Naming**: Use descriptive names
   ```typescript
   "MacBook Pro - Jan 2024"
   "iPhone 15 Pro"
   "Windows Desktop - Office"
   ```

2. **Session Cleanup**: Run cleanup query periodically
   ```sql
   -- In Supabase, create a scheduled job
   SELECT cleanup_expired_sessions();
   ```

3. **Monitoring**: Track user activity
   ```typescript
   // Review session events
   const events = await deviceManager.getSessionEvents(userId);
   ```

4. **Batch Sync**: Sync data in batches for large operations
   ```typescript
   await authService.syncDataAcrossDevices({
     user_preferences: {...},
     last_sync: new Date().toISOString(),
   });
   ```

## File Structure

```
src/
├── services/
│   ├── authService.ts (updated)
│   └── deviceManager.ts (new)
├── hooks/
│   └── useSessionSync.ts (new)
├── context/
│   └── AuthContext.tsx (updated)
├── components/
│   └── DeviceManagement.tsx (new - example)
└── lib/
    └── supabase.ts

api/
├── send-otp.ts
├── verify-otp.ts (updated)
├── check-auth.ts
├── register-device.ts (new)
└── manage-devices.ts (new)
```

## Migration from Old System

If you had a previous auth system:

1. Create new tables from `CROSS_DEVICE_SCHEMA.sql`
2. Update `authService.ts` with new device registration
3. Update Login/Logout components to use new hooks
4. Test cross-device functionality
5. Deploy to production

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review Supabase logs
3. Check browser console for errors
4. Verify environment variables are set
