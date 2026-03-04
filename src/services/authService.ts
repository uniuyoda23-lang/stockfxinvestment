// Frontend Auth Service - works for Web & Mobile
// Place in your React/Vue/Flutter project

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: { id: string; email: string; name?: string; is_admin?: boolean };
  error?: string;
  message?: string;
}

interface CheckAuthResponse {
  valid: boolean;
  user?: { id: string; email: string; name?: string; is_admin?: boolean };
  error?: string;
}

interface DeviceInfo {
  deviceId: string;
  deviceName?: string;
  deviceType: "web" | "mobile" | "desktop";
  browser?: string;
  os?: string;
}

// Vite uses import.meta.env for environment variables. The legacy REACT_APP_ prefix
// isn't available in this code, so fall back to a relative path when none is set.
const API_URL =
  ((import.meta as any).env?.VITE_API_BASE as string) ||
  "http://localhost:3001";

/**
 * Generate a unique device ID
 */
function generateDeviceId(): string {
  const existing = localStorage.getItem("deviceId");
  if (existing) return existing;

  const userAgent = navigator.userAgent;
  const language = navigator.language;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const fingerprint = `${userAgent}-${language}-${timezone}-${Date.now()}`;
  const deviceId = btoa(fingerprint).slice(0, 32);

  localStorage.setItem("deviceId", deviceId);
  return deviceId;
}

/**
 * Get device information from user agent
 */
function getDeviceInfo(): Omit<DeviceInfo, "deviceId"> {
  const ua = navigator.userAgent;

  let browser = "Unknown";
  let os = "Unknown";
  let deviceType: "web" | "mobile" | "desktop" = "web";

  // Detect OS
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac/.test(ua)) os = "macOS";
  else if (/Linux/.test(ua)) os = "Linux";
  else if (/Android/.test(ua)) {
    os = "Android";
    deviceType = "mobile";
  } else if (/iPhone|iPad/.test(ua)) {
    os = "iOS";
    deviceType = "mobile";
  }

  // Detect Browser
  if (/Chrome/.test(ua) && !/Chromium/.test(ua)) browser = "Chrome";
  else if (/Safari/.test(ua) && !/Chrome/.test(ua)) browser = "Safari";
  else if (/Firefox/.test(ua)) browser = "Firefox";
  else if (/Edge|Edg/.test(ua)) browser = "Edge";
  else if (/MSIE|Trident/.test(ua)) browser = "Internet Explorer";

  return {
    deviceType,
    browser,
    os,
  };
}

export const authService = {
  // Step 1: Request OTP
  async requestOTP(
    email: string,
    isRegistration?: boolean,
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/api/send-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, otp: generateOTP(), isRegistration }),
        },
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { success: true, message: data.message };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send OTP",
      };
    }
  },

  // Step 2: Verify OTP and get token (with device registration)
  async verifyOTP(
    email: string,
    otp: string,
  ): Promise<AuthResponse | { success: false; error: string }> {
    try {
      const deviceId = generateDeviceId();
      const deviceInfo = getDeviceInfo();
      const timestamp = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const response = await fetch(
        `${API_URL.replace(/\/+$/, "")}/api/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            email,
            otp,
            deviceId,
            deviceName: `${deviceInfo.os} - ${timestamp}`,
            deviceType: deviceInfo.deviceType,
            browser: deviceInfo.browser,
            os: deviceInfo.os,
          }),
        },
      );

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
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
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to verify OTP",
      };
    }
  },

  // Step 3: Check if user is authenticated
  async checkAuth(): Promise<CheckAuthResponse> {
    const token = this.getToken();
    if (!token) {
      return { valid: false, error: "No token found" };
    }

    try {
      const response = await fetch(`${API_URL}/api/check-auth`, {
        method: "GET",
        credentials: "include",
        headers: this.getAuthHeaders(),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
      const data = await response.json();
      return { valid: data.valid, user: data.user };
    } catch (error) {
      return { valid: false, error: "Failed to verify token" };
    }
  },

  // Verify Email with Token
  async verifyEmail(email: string, token: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token }),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Verification failed");
    }
    return response.json();
  },

  // Resend Verification Email
  async resendVerification(): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) return { success: false, error: "Not authenticated" };

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-verification`, {
        method: "POST",
        credentials: "include",
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to resend link",
      };
    }
  },

  // Password-based Login
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");

      if (data.token) this.storeToken(data.token);
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Login failed",
      };
    }
  },

  // Password-based Register
  async signUp(
    email: string,
    password: string,
    name: string,
  ): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");

      if (data.token) this.storeToken(data.token);
      return { success: true, user: data.user, token: data.token };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Registration failed",
      };
    }
  },

  // Get all active devices for current user
  async getActiveDevices(): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: "GET",
        credentials: "include",
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) return [];
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
      const data = await response.json();
      return data.devices || [];
    } catch (error) {
      console.error("Failed to get active devices:", error);
      return [];
    }
  },

  // Remove a specific device (logout from that device)
  async removeDevice(
    deviceId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: "DELETE",
        credentials: "include",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ deviceId }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to remove device",
      };
    }
  },

  // Logout from all devices
  async logoutFromAllDevices(): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: "POST",
        credentials: "include",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action: "logout_all" }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Clear local storage
      this.logout();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to logout",
      };
    }
  },

  // Sync data across all devices
  async syncDataAcrossDevices(
    data: any,
  ): Promise<{ success: boolean; error?: string }> {
    const token = this.getToken();
    if (!token) {
      return { success: false, error: "Not authenticated" };
    }

    try {
      const response = await fetch(`${API_URL}/api/manage-devices`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ action: "sync_data", data }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error("Expected JSON, got: " + text);
      }
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to sync data",
      };
    }
  },

  // Store token
  storeToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  },

  // Retrieve token
  getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("authToken");
    }
    return null;
  },

  // Store device info
  storeDeviceInfo(deviceInfo: DeviceInfo): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("deviceInfo", JSON.stringify(deviceInfo));
    }
  },

  // Get device info
  getDeviceInfo(): DeviceInfo | null {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("deviceInfo");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },

  /**
   * Helper to get user info from cookie
   */
  getUserFromCookie(): any | null {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; user=`);
    if (parts.length === 2) {
      try {
        return JSON.parse(
          decodeURIComponent(parts.pop()?.split(";").shift() || ""),
        );
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Logout
  async logout(): Promise<void> {
    try {
      await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout failed:", err);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
      localStorage.removeItem("deviceInfo");
      localStorage.removeItem("admin_token");
      // Clear cookies by setting expiry to past
      document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
  },

  // Get dashboard data
  async getDashboard(): Promise<any> {
    const token = this.getToken();
    if (!token) throw new Error("Not authenticated");

    const response = await fetch(`${API_URL}/api/dashboard`, {
      method: "GET",
      credentials: "include",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to fetch dashboard data");
    return response.json();
  },

  // Admin: List all users
  async listUsers(): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    const response = await fetch(`${API_URL}/api/admin/users`, {
      method: "GET",
      credentials: "include",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) return [];
    return response.json();
  },

  // Admin: Update user balance
  async updateBalance(userId: string, balance: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/update-balance`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, balance }),
    });

    if (!response.ok) throw new Error("Failed to update balance");
    return response.json();
  },

  // Admin: Send notification
  async sendNotification(userId: string, message: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/send-notification`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) throw new Error("Failed to send notification");
    return response.json();
  },

  // Admin: Update user stats
  async updateStats(userId: string, stats: any): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/update-stats`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ userId, ...stats }),
    });

    if (!response.ok) throw new Error("Failed to update stats");
    return response.json();
  },

  // Admin: Delete user
  async deleteUser(userId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/users/${userId}`, {
      method: "DELETE",
      credentials: "include",
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) throw new Error("Failed to delete user");
    return response.json();
  },

  // Admin: Login
  async adminLogin(email: string, password: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Admin login failed");
    }

    const data = await response.json();
    if (data.token) {
      localStorage.setItem("admin_token", data.token);
    }
    return data;
  },

  // Get authorization headers for API calls
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const adminToken = localStorage.getItem("admin_token");
    const activeToken = adminToken || token;

    return {
      "Content-Type": "application/json",
      ...(activeToken && { Authorization: `Bearer ${activeToken}` }),
    };
  },

  // --- Transactions ---

  async requestDeposit(amount: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/deposit`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Deposit request failed");
    return response.json();
  },

  async requestWithdrawal(amount: number): Promise<any> {
    const response = await fetch(`${API_URL}/api/withdraw`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount }),
    });
    if (!response.ok) throw new Error("Withdrawal request failed");
    return response.json();
  },

  async requestSend(amount: number, recipient: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/send`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ amount, recipient }),
    });
    if (!response.ok) throw new Error("Send request failed");
    return response.json();
  },

  // --- Admin Approval ---

  async approveTransaction(txId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/approve-transaction`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ txId }),
    });
    if (!response.ok) throw new Error("Approval failed");
    return response.json();
  },

  async rejectTransaction(txId: string): Promise<any> {
    const response = await fetch(`${API_URL}/api/admin/reject-transaction`, {
      method: "POST",
      credentials: "include",
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ txId }),
    });
    if (!response.ok) throw new Error("Rejection failed");
    return response.json();
  },

  async listAllTransactions(): Promise<any[]> {
    const response = await fetch(`${API_URL}/api/admin/transactions`, {
      credentials: "include",
      headers: this.getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch transactions");
    return response.json();
  },
};

// Helper to generate OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
