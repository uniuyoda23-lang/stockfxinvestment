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

const API_URL = process.env.REACT_APP_API_URL || 'https://your-vercel-app.vercel.app';

export const authService = {
  // Step 1: Request OTP
  async requestOTP(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await fetch(`${API_URL}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: generateOTP() }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send OTP' };
    }
  },

  // Step 2: Verify OTP and get token
  async verifyOTP(email: string, otp: string): Promise<AuthResponse | { success: false; error: string }> {
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Store token locally (Web: localStorage, Mobile: secure storage)
      this.storeToken(data.token);

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

  // Logout
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
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
