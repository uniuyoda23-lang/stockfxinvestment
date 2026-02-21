import { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { getUsers, updateUser, deleteUser as removeUser, type Notification, type UserRecord } from '../lib/userStore';
import { apiListUsers, apiUpdateBalance, apiSendNotification } from '../lib/session';


interface User extends UserRecord {}

const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState<User | null>(null);
  const [showNotifModal, setShowNotifModal] = useState<User | null>(null);
  const [notifMsg, setNotifMsg] = useState('');
  const [balanceInput, setBalanceInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch users from backend on component mount
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Try to fetch from backend first
        const backendUsers = await apiListUsers();
        console.log('✅ Fetched users from Firebase:', backendUsers);
        setUsers(backendUsers as User[]);
      } catch (err: any) {
        // Fallback to localStorage if backend is unavailable
        console.warn('⚠️ Falling back to local users:', err.message);
        setError(err.message);
        setUsers(getUsers());
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const refresh = async () => {
    try {
      const backendUsers = await apiListUsers();
      setUsers(backendUsers as User[]);
    } catch (err) {
      setUsers(getUsers());
    }
  };

  const handleBlock = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      updateUser(id, { status: user.status === 'active' ? 'blocked' : 'active' });
    }
    refresh();
  };

  const handleDelete = (id: string) => {
    removeUser(id);
    refresh();
    if (selected?.id === id) setSelected(null);
  };

  const handleBalanceUpdate = async (id: string, newBalance: number) => {
    try {
      await apiUpdateBalance(id, newBalance);
    } catch (err) {
      updateUser(id, { balance: newBalance });
    }
    refresh();
    setShowBalanceModal(null);
    setBalanceInput('');
  };

  const handleSendNotif = async (id: string, msg: string) => {
    try {
      await apiSendNotification(id, msg);
    } catch (err) {
      const user = users.find((u: User) => u.id === id);
      if (user) {
        const notif: Notification = { id: Date.now().toString(), message: msg, timestamp: new Date().toISOString() };
        updateUser(id, { notifications: [...user.notifications, notif] });
      }
    }
    refresh();
    setShowNotifModal(null);
    setNotifMsg('');
  };

  const handleConfirm = (id: string) => {
    updateUser(id, { registrationStatus: 'confirmed' });
    refresh();
  };

  const handleVerify = (id: string) => {
    updateUser(id, { verified: true });
    refresh();
  };
  
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={refresh}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Refresh Users'}
        </button>
      </div>
      
      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-8 text-center">
          <p className="text-slate-600 mb-2">Loading users from Firebase...</p>
        </div>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-700 font-medium">Error loading users: {error}</p>
          <p className="text-xs text-red-600 mt-1">Showing local users as fallback</p>
        </div>
      )}

      {/* Users count */}
      {!isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-blue-700 font-medium">Total Users: {users.length}</p>
        </div>
      )}

      {/* Users table */}
      {!isLoading && (
      <div className="overflow-x-auto bg-white rounded-xl shadow border border-slate-100">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Balance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Registration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Verified</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Notifications</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className={selected?.id === user.id ? 'bg-emerald-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap font-medium">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${user.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{user.status}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">${user.balance.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.registrationStatus === 'pending' ? (
                    <Button size="sm" variant="secondary" onClick={() => handleConfirm(user.id)}>Confirm</Button>
                  ) : (
                    <span className="text-xs text-emerald-700">Confirmed</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.verified ? (
                    <span className="text-xs text-emerald-700">Yes</span>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => handleVerify(user.id)}>Verify</Button>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{user.createdAt}</td>
                <td className="px-6 py-4 whitespace-nowrap max-w-xs">
                  <ul className="text-xs text-slate-500 space-y-1 max-h-16 overflow-y-auto">
                    {user.notifications.slice(-2).map((n, i) => (
                      <li key={i}>• {n}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(user)}>View</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setShowBalanceModal(user); setBalanceInput(user.balance.toString()); }}>Balance</Button>
                  <Button size="sm" variant="secondary" onClick={() => { setShowNotifModal(user); setNotifMsg(''); }}>Notify</Button>
                  <Button size="sm" variant={user.status === 'active' ? 'danger' : 'secondary'} onClick={() => handleBlock(user.id)}>{user.status === 'active' ? 'Block' : 'Unblock'}</Button>
                  <Button size="sm" variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      {/* Empty state */}
      {!isLoading && users.length === 0 && (
        <div className="bg-white rounded-xl shadow border border-slate-100 p-8 text-center">
          <p className="text-slate-600">No users registered yet</p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setSelected(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">User Details</h2>
            <div className="mb-2"><b>Name:</b> {selected.name}</div>
            <div className="mb-2"><b>Email:</b> {selected.email}</div>
            <div className="mb-2"><b>Status:</b> {selected.status}</div>
            <div className="mb-2"><b>Balance:</b> ${selected.balance.toFixed(2)}</div>
            <div className="mb-2"><b>Created:</b> {selected.createdAt}</div>
            <div className="mb-2"><b>Notifications:</b>
              <ul className="text-xs text-slate-500 space-y-1 max-h-16 overflow-y-auto">
                {selected.notifications.map((n, i) => (
                  <li key={i}>• {n}</li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 mt-4 flex-wrap">
              <Button size="sm" variant={selected.status === 'active' ? 'danger' : 'secondary'} onClick={() => { handleBlock(selected.id); setSelected(null); }}>{selected.status === 'active' ? 'Block' : 'Unblock'}</Button>
              <Button size="sm" variant="secondary" onClick={() => { setShowBalanceModal(selected); setBalanceInput(selected.balance.toString()); }}>Update Balance</Button>
              <Button size="sm" variant="secondary" onClick={() => { setShowNotifModal(selected); setNotifMsg(''); }}>Send Notification</Button>
              <Button size="sm" variant="danger" onClick={() => { handleDelete(selected.id); setSelected(null); }}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowBalanceModal(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Update Balance</h2>
            <div className="mb-4">User: <b>{showBalanceModal.name}</b></div>
            <input
              type="number"
              className="border rounded px-3 py-2 w-full mb-4"
              value={balanceInput}
              onChange={e => setBalanceInput(e.target.value)}
              min="0"
              step="0.01"
            />
            <Button size="sm" className="w-full" onClick={() => handleBalanceUpdate(showBalanceModal.id, parseFloat(balanceInput))}>
              Save
            </Button>
          </div>
        </div>
      )}

      {/* Notification Modal */}
      {showNotifModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
            <button className="absolute top-2 right-2 text-slate-400 hover:text-slate-700" onClick={() => setShowNotifModal(null)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Send Notification</h2>
            <div className="mb-4">User: <b>{showNotifModal.name}</b></div>
            <textarea
              className="border rounded px-3 py-2 w-full mb-4"
              rows={3}
              value={notifMsg}
              onChange={e => setNotifMsg(e.target.value)}
              placeholder="Type your message..."
            />
            <Button size="sm" className="w-full" onClick={() => handleSendNotif(showNotifModal.id, notifMsg)} disabled={!notifMsg.trim()}>
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
