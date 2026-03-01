// Frontend Auth Service - works for Web & Mobile
// Place in your React/Vue/Flutter project

interface AuthResponse {
  success: boolean;
  token: string;
  user: { id: string; email: string };
  message: string;
}

interface CheckAuthResponse {
  valid: boolean;
  user?: { id: string; email: string };
  error?: string;
}

interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType: 'web' | 'mobile' | 'desktop';
  browser?: string;
  os?: string;
}

// Vite uses import.meta.env for environment variables. The legacy REACT_APP_ prefix
// isn't available in this code, so fall back to a relative path when none is set.
const API_URL =
  (import.meta.env.VITE_API_BASE as string) ||
  window.location.origin ||
  'https://your-vercel-app.vercel.app';

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  const existing = localStorage.getItem('deviceId');
  if (existing) return existing;

  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fingerprint = `${userAgent}-${language}-${timezone}-${Date.now()}`;
  const deviceId = btoa(fingerprint).slice(0, 32);

  localStorage.setItem('deviceId', deviceId);
  return deviceId;
}

/**
 * Get device information from user agent
 */
function getDeviceInfo(): Omit<DeviceInfo, 'deviceId'> {
  const ua = navigator.userAgent;

  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType: 'web' | 'mobile' | 'desktop' = 'web';

  // Detect OS
  if (/Windows/.test(ua)) os = 'Windows';
  else if (/Mac/.test(ua)) os = 'macOS';
  else if (/Linux/.test(ua)) os = 'Linux';
  else if (/Android/.test(ua)) {
    os = 'Android';
    deviceType = 'mobile';
  } else if (/iPhone|iPad/.test(ua)) {
    os = 'iOS';
    deviceType = 'mobile';
  }

  // Detect Browser
  if (/Chrome/.test(ua) && !/Chromium/.test(ua)) browser = 'Chrome';
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = 'Safari';
  else if (/Firefox/.test(ua)) browser = 'Firefox';
  else if (/Edge|Edg/.test(ua)) browser = 'Edge';
  else if (/MSIE|Trident/.test(ua)) browser = 'Internet Explorer';

  return {
    deviceType,
    browser,
    os,
  };
}

export const authService = {
  // Step 1: Request OTP
  async requestOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(
        `${API_URL.replace(/\/+$/,'')}/api/send-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp: generateOTP() }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  },

  // Step 2: Verify OTP and get token (with device registration)
  async verifyOTP(email: string, otp: string): Promise<AuthResponse | { success: false; error: string }> {
    try {
      const deviceId = generateDeviceId();
      const deviceInfo = getDeviceInfo();
      const timestamp = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      const response = await fetch(
        `${API_URL.replace(/\/+$/,'')}/api/verify-otp`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp,
            deviceId,
            deviceName: `${deviceInfo.os} - ${timestamp}`,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Store token and device info
      this.storeToken(data.token);
      this.storeDeviceInfo({
        deviceId,
        deviceName: `${deviceInfo.os} - ${timestamp}`,
        ...deviceInfo,
      });

      return {
        success: true,
        token: data.token,
        user: data.user,
        message: data.message,
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to verify OTP' };
    }
  },

  // Step 3: Check if user is authenticated
  async checkAuth(): Promise<CheckAuthResponse> {
    const token = this.getToken();
    if (!token) {
      return { valid: false, error: 'No token found' };
    }

    try {
      const response = await fetch(`${API_URL}/api/check-auth`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      return { valid: data.valid, user: data.user };
    } catch (error) {
      return { valid: false, error: 'Failed to verify token' };
    }
  },

  // Get all active devices for current user
  async getActiveDevices(): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error('Failed to get active devices:', error);
      return [];
    }
  },

  // Remove a specific device (logout from that device)
  async removeDevice(deviceId: string): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ deviceId }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to remove device' };
    }
  },

  // Logout from all devices
  async logoutFromAllDevices(): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action: 'logout_all' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Clear local storage
      this.logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to logout' };
    }
  },

  // Sync data across all devices
  async syncDataAcrossDevices(data: any): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action: 'sync_data', data }),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error);

      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to sync data' };
    }
  },

  // Store token
  storeToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  },

  // Retrieve token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  },

  // Store device info
  storeDeviceInfo(deviceInfo: DeviceInfo): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('deviceInfo', JSON.stringify(deviceInfo));
    }
  },

  // Get device info
  getDeviceInfo(): DeviceInfo | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('deviceInfo');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
      localStorage.removeItem('deviceInfo');
    }
  },

  // Get authorization headers for API calls
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
