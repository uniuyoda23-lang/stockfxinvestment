import { UserRecord, getUsers, addUser, updateUser, setUserBalance, pushUserNotification } from './userStore';
import {
  registerUser,
  loginUser,
  logoutUser as supabaseLogout,
  getCurrentSession,
  getAllUsers,
  updateUserBalance,
  getUserById,
  type SupabaseUser
} from './supabaseAuth';

let currentUser: UserRecord | null = null;

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

// Convert SupabaseUser to UserRecord
function convertSupabaseToUserRecord(supabaseUser: SupabaseUser): UserRecord {
  return {
    id: supabaseUser.id,
    name: supabaseUser.name || '',
    email: supabaseUser.email,
    status: (supabaseUser.status as 'active' | 'blocked') || 'active',
    createdAt: supabaseUser.createdAt,
    balance: supabaseUser.balance || 0,
    notifications: [],
    registrationStatus: (supabaseUser.registrationStatus as 'pending' | 'confirmed') || 'confirmed',
    verified: true,
  };
}

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
function persistUser(user: UserRecord | any) {
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

// --- Supabase Auth helpers ---
export async function apiLogin(email: string, password: string) {
  try {
    const { user, error } = await loginUser(email, password);
    if (error || !user) throw error || new Error('Login failed');
    const userRecord = convertSupabaseToUserRecord(user);
    setToken('supabase_' + user.id);
    setCurrentUserFromProfile(userRecord);
    return userRecord;
  } catch (err: any) {
    // Fallback to local users for dev/testing
    console.warn('WarningAPI login failed, using local storage:', err?.message || err);
    const local = getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
    if (local) {
      setToken('local_token_' + local.id);
      setCurrentUserFromProfile(local);
      return local;
    }
    throw new Error('Login failed');
  }
}

export async function apiRegister(name: string, email: string, password: string) {
  // always use Supabase for registration; throw on failure so caller can handle
  const { user, error } = await registerUser(email, password, name);
  if (error || !user) {
    console.error('Supabase registration error:', error);
    throw error || new Error('Registration failed');
  }
  const userRecord = convertSupabaseToUserRecord(user);
  setToken('supabase_' + user.id);
  setCurrentUserFromProfile(userRecord);
  return userRecord;
}

// Fetch dashboard data using token
export async function getDashboard() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  
  try {
    const session = await getCurrentSession();
    if (session?.user) {
      const user = await getUserById(session.user.id);
      if (user) {
        return convertSupabaseToUserRecord(user);
      }
    }
    // Fall back to local user data
    const localUser = getCurrentUser();
    if (localUser) {
      return localUser;
    }
    throw new Error('Not authenticated');
  } catch (err: any) {
    // Fall back to local user data
    console.warn('WarningAPI dashboard failed, using local storage:', err.message);
    const localUser = getCurrentUser();
    if (localUser) {
      return localUser;
    }
    throw new Error('Not authenticated');
  }
}

export async function fetchCurrentUser() {
  try {
    const session = await getCurrentSession();
    if (session?.user) {
      const user = await getUserById(session.user.id);
      return user ? convertSupabaseToUserRecord(user) : null;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export async function apiLogout() {
  try {
    await supabaseLogout();
  } catch (e) {
    console.warn('Logout error:', e);
  }
  logoutUser();
}

// Lightweight health check
export async function apiHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch (e) {
    return false;
  }
}

// --- Admin API helpers (using Supabase) ---
export async function apiListUsers() {
  try {
    const users = await getAllUsers();
    // convert to frontend UserRecord format so admin UI can render
    return (users || []).map(u => convertSupabaseToUserRecord(u));
  } catch (err: any) {
    console.warn('WarningAPI getAllUsers failed, using local users:', err?.message || err);
    return getUsers();
  }
}

export async function apiDeleteUser(userId: string) {
  try {
    // remove from Supabase users table; delete cascades if foreign keys exist
    const { error } = await (await import('./supabaseAuth')).supabase
      .from('users')
      .delete()
      .eq('id', userId);
    if (error) throw error;
    return { ok: true };
  } catch (err: any) {
    console.warn('WarningAPI delete user failed, removing locally:', err?.message || err);
    deleteUser(userId);
    return { ok: true };
  }
}

export async function apiUpdateBalance(userId: string, amount: number) {
  try {
    const user = await updateUserBalance(userId, amount);
    if (user) {
      return { ok: true, balance: amount };
    }
    throw new Error('User not found');
  } catch (err: any) {
    // Fallback: update local user store
    console.warn('WarningAPI update balance failed, updating local user:', err?.message || err);
    setUserBalance(userId, amount);
    const local = getUsers().find(u => u.id === userId);
    if (local) {
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
  try {
    const userRef = (await import('./firebase')).firestore;
    const { doc, setDoc } = await import('firebase/firestore');
    await setDoc(doc(userRef, 'users', userId), { name }, { merge: true });
    return { ok: true, name };
  } catch (err: any) {
    console.warn('Firebase edit name failed:', err?.message || err);
    throw err;
  }
}

export async function apiSendNotification(userId: string, message: string) {
  try {
    // For now, just update locally since Supabase doesn't have a notifications endpoint
    pushUserNotification(userId, message);
    if (currentUser && currentUser.id === userId) {
      const notif: import('./userStore').Notification = {
        id: Date.now().toString(),
        message,
        timestamp: new Date().toISOString()
      };
      const newNotifications = [...(currentUser.notifications || []), notif];
      updateUser(userId, { notifications: newNotifications });
      setCurrentUserFromProfile({ ...currentUser, notifications: newNotifications });
    }
    return { ok: true };
  } catch (err: any) {
    console.warn('Send notification failed:', err?.message || err);
    throw err;
  }
}

export { setToken, getToken, clearToken };

// --- Admin Session Management ---
let adminSession: { email: string; token: string; loginTime: string } | null = null;

const ADMIN_CREDENTIALS = {
  email: 'admin@example.com',
  password: '<ADMIN_PASSWORD>'
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