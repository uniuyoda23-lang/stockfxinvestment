// Simple in-memory user store for demo
export interface Notification {
  id: string;
  message: string;
  timestamp: string; // ISO timestamp
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  status: 'active' | 'blocked';
  createdAt: string;
  balance: number;
  notifications: Notification[];
  registrationStatus: 'pending' | 'confirmed';
  verified: boolean;
  totalProfit?: number;        // Editable by admin
  monthlyIncome?: number;      // Editable by admin
  activeTrades?: number;       // Editable by admin
  portfolioPerformance?: number; // Percentage, editable by admin
}

// Load persisted users from localStorage so registrations survive reloads in dev
function loadPersistedUsers(): UserRecord[] | null {
  try {
    const raw = localStorage.getItem('demo_users');
    if (!raw) return null;
    return JSON.parse(raw) as UserRecord[];
  } catch (e) {
    console.warn('Failed to load persisted users', e);
    return null;
  }
}

function persistUsers(list: UserRecord[]) {
  try {
    localStorage.setItem('demo_users', JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to persist users', e);
  }
}

let users: UserRecord[] = loadPersistedUsers() ?? [];

export function getUsers() {
  return users;
}

export function addUser(user: UserRecord) {
  users = [...users, user];
  persistUsers(users);
}

export function updateUser(id: string, update: Partial<UserRecord>) {
  users = users.map(u => u.id === id ? { ...u, ...update } : u);
  persistUsers(users);
}

export function deleteUser(id: string) {
  users = users.filter(u => u.id !== id);
  persistUsers(users);
}

export function clearUsers() {
  users = [];
  persistUsers(users);
}

// Set a user's balance (absolute amount)
export function setUserBalance(id: string, amount: number) {
  users = users.map(u => u.id === id ? { ...u, balance: amount } : u);
  persistUsers(users);
}

// Push a notification message to the user's notifications array
export function pushUserNotification(id: string, message: string) {
  const notification: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message,
    timestamp: new Date().toISOString(),
  };
  users = users.map(u => u.id === id ? { ...u, notifications: [...(u.notifications || []), notification] } : u);
  persistUsers(users);
}

// Update dashboard stats (admin only)
export function updateDashboardStats(id: string, stats: { totalProfit?: number; monthlyIncome?: number; activeTrades?: number; portfolioPerformance?: number }) {
  users = users.map(u => u.id === id ? { ...u, ...stats } : u);
  persistUsers(users);
}
