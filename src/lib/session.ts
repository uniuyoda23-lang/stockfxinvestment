import { UserRecord, getUsers, addUser, updateUser, setUserBalance, pushUserNotification } from './userStore';

let currentUser: UserRecord | null = null;

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Store/retrieve token in localStorage
function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function getToken(): string | null {
  return localStorage.getItem('auth_token');
}

function clearToken() {
  localStorage.removeItem('auth_token');
}

// Store current user to localStorage
function persistUser(user: UserRecord) {
  localStorage.setItem('currentUser', JSON.stringify(user));
}

// Load user from localStorage
function loadPersistedUser(): UserRecord | null {
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
}

// Local setter (keeps existing test flows working)
export function setCurrentUser(email: string) {
  const user = getUsers().find(u => u.email === email);
  if (user) {
    currentUser = user;
    persistUser(user);
  } else {
    currentUser = null;
  }
}

// Set current user from a full profile (used after successful API calls)
export function setCurrentUserFromProfile(user: UserRecord | null) {
  currentUser = user;
  if (user) {
    persistUser(user);
  } else {
    localStorage.removeItem('currentUser');
  }
}

export function getCurrentUser(): UserRecord | null {
  if (!currentUser) {
    currentUser = loadPersistedUser();
  }
  return currentUser;
}

export function logoutUser() {
  currentUser = null;
  localStorage.removeItem('currentUser');
}

// Refresh current user from store (used after admin updates)
export function refreshCurrentUser() {
  if (currentUser) {
    const updated = getUsers().find(u => u.id === currentUser!.id);
    if (updated) {
      setCurrentUserFromProfile(updated);
    }
  }
}

// --- API helpers (talk to the dev auth server) ---
export async function apiLogin(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Login failed');
    }
    if (data.token) setToken(data.token);
    // If the API returns a user profile, persist it locally for demo
    if (data.user) setCurrentUserFromProfile(data.user as UserRecord);
    return data;
  } catch (err: any) {
    // Fallback to local users for dev/testing
    console.warn('API login failed, trying local users:', err?.message || err);
    const local = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (local) {
      setToken('local_token_' + local.id);
      setCurrentUserFromProfile(local);
      return local;
    }
    throw new Error('Login failed');
  }
}

export async function apiRegister(name: string, email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Registration failed');
    }
    if (data.token) setToken(data.token);
    return data;
  } catch (err: any) {
    // Fall back to local registration if API fails
    console.warn('API registration failed, using local storage:', err.message);
    const newUser: UserRecord = {
      id: Date.now().toString(),
      name,
      email,
      password: password, // Note: In production, never store plaintext passwords
      status: 'active',
      createdAt: new Date().toISOString(),
      balance: 0,
      notifications: [],
      registrationStatus: 'confirmed',
      verified: true,
    };
    addUser(newUser);
    setCurrentUserFromProfile(newUser);
    setToken('local_token_' + newUser.id);
    return newUser;
  }
}

// Fetch dashboard data using token
export async function getDashboard() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  
  try {
    const res = await fetch(`${API_BASE}/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch dashboard');
    return data.user;
  } catch (err: any) {
    // Fall back to local user data
    console.warn('API dashboard failed, using local storage:', err.message);
    const localUser = getCurrentUser();
    if (localUser) {
      return localUser;
    }
    throw new Error('Not authenticated');
  }
}

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/api/me`, { credentials: 'include' });
  if (!res.ok) return null;
  const data = await res.json();
  return (data.user || data) as UserRecord | null;
}

export async function apiLogout() {
  try {
    await fetch(`${API_BASE}/api/logout`, { method: 'POST', credentials: 'include' });
  } catch (e) {
    console.warn('Logout network error:', e);
  }
  logoutUser();
}

// Lightweight health check used by the UI to verify the auth server is reachable
export async function apiHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// --- Admin API helpers ---
export async function apiListUsers() {
  const res = await fetch(`${API_BASE}/auth/users`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
  return data.users;
}

export async function apiUpdateBalance(userId: string, amount: number) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update balance');
    return data;
  } catch (err: any) {
    // Fallback: update local user store
    console.warn('API update balance failed, updating local user:', err?.message || err);
    setUserBalance(userId, amount);
    const local = getUsers().find(u => u.id === userId);
    if (local) {
      // If this is the current user, update persisted profile
      if (currentUser && currentUser.id === userId) {
        updateUser(userId, { balance: amount });
        setCurrentUserFromProfile({ ...currentUser, balance: amount });
      }
      return { ok: true, user: local };
    }
    throw new Error('User not found');
  }
}

export async function apiEditName(userId: string, name: string) {
  const res = await fetch(`${API_BASE}/auth/user/name`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to edit name');
  return data;
}

export async function apiSendNotification(userId: string, message: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/user/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send notification');
    return data;
  } catch (err: any) {
    // Fallback: add notification to local user store
    console.warn('API send notification failed, adding local notification:', err?.message || err);
    pushUserNotification(userId, message);
    // If current user, update persisted profile
    if (currentUser && currentUser.id === userId) {
      const newNotifications = [...(currentUser.notifications || []), message];
      updateUser(userId, { notifications: newNotifications });
      setCurrentUserFromProfile({ ...currentUser, notifications: newNotifications });
    }
    return { ok: true };
  }
}

export { setToken, getToken, clearToken };

// --- Admin Session Management ---
let adminSession: { email: string; token: string; loginTime: string } | null = null;

const ADMIN_CREDENTIALS = {
  email: 'adminkingsley@gmail.com',
  password: 'Kingsley2000'
};

export function adminLogin(email: string, password: string): boolean {
  if (email.toLowerCase() === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
    const token = `admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    adminSession = {
      email: ADMIN_CREDENTIALS.email,
      token,
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('admin_session', JSON.stringify(adminSession));
    return true;
  }
  return false;
}

export function getAdminSession() {
  if (!adminSession) {
    const stored = localStorage.getItem('admin_session');
    if (stored) {
      try {
        adminSession = JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
  }
  return adminSession;
}

export function adminLogout() {
  adminSession = null;
  localStorage.removeItem('admin_session');
}

export function terminateAllUserSessions() {
  try {
    // Clear all user sessions in localStorage
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
    
    // Reset all active user sessions
    currentUser = null;
    
    // Could also clear demo_users if needed, but keeping data for demo purposes
    return { success: true, message: 'All user sessions terminated successfully' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to terminate sessions' };
  }
}

export function terminateUserSession(userId: string) {
  try {
    const currentSessionUser = getCurrentUser();
    
    // If the user being terminated is currently logged in, clear their session
    if (currentSessionUser && currentSessionUser.id === userId) {
      currentUser = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_token');
    }
    
    return { success: true, message: `Session for user ${userId} terminated successfully` };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to terminate user session' };
  }
}

export function getActiveSessions() {
  const sessions = [];
  
  // Get current logged-in user
  const currentSessionUser = getCurrentUser();
  if (currentSessionUser) {
    sessions.push({
      userId: currentSessionUser.id,
      email: currentSessionUser.email,
      name: currentSessionUser.name,
      loginTime: 'Current Session'
    });
  }
  
  return sessions;
}