import React, { useEffect, useState } from 'react';
import { getUsers, deleteUser } from '../lib/userStore';
import { apiListUsers, apiUpdateBalance, apiSendNotification, refreshCurrentUser, adminLogout, terminateAllUserSessions, terminateUserSession, getActiveSessions } from '../lib/session';
import { updateDashboardStats } from '../lib/userStore';
import { Wallet, Send, Edit2, LogOut, Home, ArrowLeft, TrendingUp, DollarSign, Activity, Zap, AlertCircle, Trash2 } from 'lucide-react';

interface AdminPageProps {
  onLogout?: () => void;
}

export function AdminPage({ onLogout }: AdminPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);
  const [loading, setLoading] = useState(false);
  const [editName, setEditName] = useState<{[id: string]: string}>({});
  const [editBalance, setEditBalance] = useState<{[id: string]: number}>({});
  const [notifyMsg, setNotifyMsg] = useState<{[id: string]: string}>({});
  const [editProfit, setEditProfit] = useState<{[id: string]: number}>({});
  const [editIncome, setEditIncome] = useState<{[id: string]: number}>({});
  const [editTrades, setEditTrades] = useState<{[id: string]: number}>({});
  const [editPerformance, setEditPerformance] = useState<{[id: string]: number}>({});
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [showSessionPanel, setShowSessionPanel] = useState(false);

  useEffect(() => {
    (async () => {
      await loadUsers();
      loadSessions();
    })();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await apiListUsers();
      setUsers(Array.isArray(data) ? (data as any[]) : []);
    } catch (err) {
      console.warn('Failed to load users from backend, falling back to local store', err);
      setUsers(getUsers());
    }
  };

  const showStatus = (msg: string, type: 'success' | 'error') => {
    setStatusMsg(msg);
    setStatusType(type);
    setTimeout(() => {
      setStatusMsg(null);
      setStatusType(null);
    }, 3000);
  };

  const handleUpdateBalance = async (userId: string, amount: number) => {
    if (amount === undefined || amount === null) {
      showStatus('Enter a valid amount', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiUpdateBalance(userId, amount);
      showStatus(`Balance updated to $${amount.toFixed(2)}`, 'success');
      setEditBalance(prev => ({ ...prev, [userId]: 0 }));
      refreshCurrentUser();
      loadUsers();
    } catch (err: any) {
      showStatus(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (userId: string, message: string) => {
    if (!message.trim()) {
      showStatus('Enter a message', 'error');
      return;
    }
    setLoading(true);
    try {
      await apiSendNotification(userId, message);
      showStatus('Notification sent!', 'success');
      setNotifyMsg(prev => ({ ...prev, [userId]: '' }));
      refreshCurrentUser();
      loadUsers();
    } catch (err: any) {
      showStatus(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStats = async (userId: string) => {
    setLoading(true);
    try {
      updateDashboardStats(userId, {
        totalProfit: editProfit[userId] ?? 0,
        monthlyIncome: editIncome[userId] ?? 0,
        activeTrades: editTrades[userId] ?? 0,
        portfolioPerformance: editPerformance[userId] ?? 0,
      });
      showStatus('Dashboard stats updated!', 'success');
      setEditProfit(prev => ({ ...prev, [userId]: 0 }));
      setEditIncome(prev => ({ ...prev, [userId]: 0 }));
      setEditTrades(prev => ({ ...prev, [userId]: 0 }));
      setEditPerformance(prev => ({ ...prev, [userId]: 0 }));
      refreshCurrentUser();
      loadUsers();
    } catch (err: any) {
      showStatus(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadSessions = () => {
    const sessions = getActiveSessions();
    setActiveSessions(sessions);
  };

  const handleLogout = () => {
    adminLogout();
    if (onLogout) onLogout();
  };

  const handleTerminateAllSessions = () => {
    if (window.confirm('Are you sure? This will terminate all active user sessions.')) {
      const result = terminateAllUserSessions();
      showStatus(result.message, result.success ? 'success' : 'error');
      loadSessions();
    }
  };

  const handleTerminateUserSession = (userId: string) => {
    const result = terminateUserSession(userId);
    showStatus(result.message, result.success ? 'success' : 'error');
    loadSessions();
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${userName}" and all their data? This action cannot be undone.`)) {
      try {
        await apiDeleteUser(userId);
        // also clear from local store to keep UI in sync
        deleteUser(userId);
        showStatus(`User "${userName}" has been deleted successfully`, 'success');
        setExpandedUserId(null);
        await loadUsers();
        loadSessions();
      } catch (err: any) {
        showStatus(`Error deleting user: ${err.message}`, 'error');
      }
    }
  };

  const userId = users[0]?.id || '';
  const userId_alt = userId ? users[0]?._id || users[0]?.id : '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              statusType === 'success'
                ? 'bg-emerald-900/50 border border-emerald-600 text-emerald-200'
                : 'bg-red-900/50 border border-red-600 text-red-200'
            }`}
          >
            <div className={`h-2 w-2 rounded-full ${statusType === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
            {statusMsg}
          </div>
        )}

        {/* Session Management Panel */}
        <div className="mb-6 bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Session Management
            </h2>
            <button
              onClick={() => setShowSessionPanel(!showSessionPanel)}
              className="text-slate-400 hover:text-slate-200 text-sm font-medium"
            >
              {showSessionPanel ? 'Hide' : 'Show'}
            </button>
          </div>

          {showSessionPanel && (
            <div className="space-y-4">
              {/* Active Sessions */}
              {activeSessions.length > 0 && (
                <div>
                  <p className="text-sm text-slate-400 mb-3">Active Sessions ({activeSessions.length})</p>
                  <div className="space-y-2 mb-4">
                    {activeSessions.map((session: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between bg-slate-900 p-3 rounded border border-slate-700">
                        <div>
                          <p className="text-sm font-medium text-slate-200">{session.name}</p>
                          <p className="text-xs text-slate-500">{session.email}</p>
                        </div>
                        <button
                          onClick={() => handleTerminateUserSession(session.userId)}
                          className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          Terminate
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Terminate All Sessions */}
              <button
                onClick={handleTerminateAllSessions}
                className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Terminate All User Sessions
              </button>
              <p className="text-xs text-slate-500">This will log out all users immediately</p>

              {/* Delete All Users */}
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => {
                    if (window.confirm('Are you absolutely sure? This will permanently delete ALL users and their data. This action cannot be undone.')) {
                      try {
                        const userCount = users.length;
                        // attempt to delete each via API, fallback to local
                        for (const user of users) {
                          const uid = user.id || user._id;
                          try {
                            await apiDeleteUser(uid);
                          } catch {}
                          deleteUser(uid);
                        }
                        showStatus(`All ${userCount} users have been permanently deleted`, 'success');
                        await loadUsers();
                        loadSessions();
                      } catch (err: any) {
                        showStatus(`Error deleting users: ${err.message}`, 'error');
                      }
                    }
                  }}
                  className="w-full px-4 py-3 bg-red-900 hover:bg-red-800 text-red-100 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete All Users & Data
                </button>
                <p className="text-xs text-red-400 mt-2">🔥 Extreme caution - this will erase all user accounts permanently</p>
              </div>
            </div>
          )}
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="bg-slate-800 rounded-lg p-8 text-center">
              <p className="text-slate-400 text-lg">No users found</p>
            </div>
          ) : (
            users.map(user => {
              const uid = user.id || user._id;
              return (
                <div
                  key={uid}
                  className="bg-slate-800 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors overflow-hidden"
                >
                  {/* User Row */}
                  <div
                    className="p-6 flex items-center justify-between cursor-pointer hover:bg-slate-750"
                    onClick={() => setExpandedUserId(expandedUserId === uid ? null : uid)}
                  >
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{user.name || 'Unnamed User'}</h3>
                      <p className="text-sm text-slate-400">{user.email}</p>
                    </div>
                    <div className="text-right mr-4">
                      <p className="text-2xl font-bold text-emerald-400">${(user.balance ?? 0).toFixed(2)}</p>
                      <p className="text-xs text-slate-400">Current Balance</p>
                    </div>
                    <div className="text-slate-400">
                      {expandedUserId === uid ? '▼' : '▶'}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedUserId === uid && (
                    <div className="bg-slate-900/50 border-t border-slate-700 p-6 space-y-6">
                      {/* Update Balance */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Update Balance</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="Enter new balance"
                            value={editBalance[uid] ?? ''}
                            onChange={e => setEditBalance(b => ({ ...b, [uid]: e.target.value ? Number(e.target.value) : 0 }))}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => handleUpdateBalance(uid, editBalance[uid] ?? 0)}
                            disabled={loading}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Wallet className="h-4 w-4" />
                            Update
                          </button>
                        </div>
                      </div>

                      {/* Send Notification */}
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Send Notification</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter notification message..."
                            value={notifyMsg[uid] ?? ''}
                            onChange={e => setNotifyMsg(m => ({ ...m, [uid]: e.target.value }))}
                            className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleSendNotification(uid, notifyMsg[uid] ?? '')}
                            disabled={loading}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
                          >
                            <Send className="h-4 w-4" />
                            Send
                          </button>
                        </div>
                      </div>

                      {/* Dashboard Stats */}
                      <div className="pt-4 border-t border-slate-700">
                        <label className="block text-sm font-medium text-slate-300 mb-3">Dashboard Stats</label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Total Profit ($)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={editProfit[uid] ?? user.totalProfit ?? 0}
                              onChange={e => setEditProfit(p => ({ ...p, [uid]: Number(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Monthly Income ($)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={editIncome[uid] ?? user.monthlyIncome ?? 0}
                              onChange={e => setEditIncome(i => ({ ...i, [uid]: Number(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Active Trades</label>
                            <input
                              type="number"
                              placeholder="0"
                              value={editTrades[uid] ?? user.activeTrades ?? 0}
                              onChange={e => setEditTrades(t => ({ ...t, [uid]: Number(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-slate-400 mb-1 block">Portfolio Perf. (%)</label>
                            <input
                              type="number"
                              placeholder="0.0"
                              step="0.1"
                              value={editPerformance[uid] ?? user.portfolioPerformance ?? 0}
                              onChange={e => setEditPerformance(pf => ({ ...pf, [uid]: Number(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleUpdateStats(uid)}
                          disabled={loading}
                          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <TrendingUp className="h-4 w-4" />
                          Update Stats
                        </button>
                      </div>

                      {/* Notifications List */}
                      {user.notifications && user.notifications.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Recent Notifications</label>
                          <div className="bg-slate-800 rounded p-3 max-h-32 overflow-y-auto space-y-2">
                            {user.notifications.map((notif: any, idx: number) => (
                              <p key={idx} className="text-sm text-slate-300">• {typeof notif === 'string' ? notif : notif.message}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* User Info */}
                      <div className="pt-4 border-t border-slate-700">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-slate-400">Account Status</p>
                            <p className="text-slate-200 font-medium capitalize">{user.status || 'active'}</p>
                          </div>
                          <div>
                            <p className="text-slate-400">Created</p>
                            <p className="text-slate-200 font-medium">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Delete User */}
                      <div className="pt-4 border-t border-slate-700">
                        <button
                          onClick={() => handleDeleteUser(uid, user.name || user.email)}
                          className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete User & All Data
                        </button>
                        <p className="text-xs text-red-300 mt-2">⚠️ This will permanently remove the user and cannot be undone.</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center gap-4">
          <a
            href="#/dashboard"
            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </a>
          <a
            href="#/"
            className="flex items-center gap-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </a>
        </div>
      </div>
    </div>
  );
}
