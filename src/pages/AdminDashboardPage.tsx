import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import {
  apiDeleteUser,
  apiListUsers,
  apiSendNotification,
  apiUpdateBalance,
} from "../lib/session";

interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  balance: number;
  registrationStatus: string;
  verified: boolean;
  createdAt: string;
  notifications: string[];
  isAdmin: boolean;
}

const formatCreatedAt = (value?: string | null) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const normalizeNotifications = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (
        item &&
        typeof item === "object" &&
        "message" in item &&
        typeof item.message === "string"
      ) {
        return item.message;
      }

      return "";
    })
    .filter(Boolean);
};

const normalizeUser = (value: any): User => ({
  id: String(value?.id ?? ""),
  name: value?.name?.trim() || "Unnamed User",
  email: value?.email || "No email",
  status: value?.status || "active",
  balance: Number(value?.balance ?? 0),
  registrationStatus:
    value?.registrationStatus || value?.registration_status || "confirmed",
  verified: Boolean(value?.verified ?? value?.is_verified),
  createdAt: formatCreatedAt(value?.createdAt || value?.created_at),
  notifications: normalizeNotifications(value?.notifications),
  isAdmin: Boolean(value?.isAdmin ?? value?.is_admin),
});

const AdminDashboardPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selected, setSelected] = useState<User | null>(null);
  const [showBalanceModal, setShowBalanceModal] = useState<User | null>(null);
  const [showNotifModal, setShowNotifModal] = useState<User | null>(null);
  const [notifMsg, setNotifMsg] = useState("");
  const [balanceInput, setBalanceInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const updateUserInState = (id: string, updater: (user: User) => User) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === id ? updater(user) : user)),
    );
    setSelected((currentSelected) =>
      currentSelected?.id === id ? updater(currentSelected) : currentSelected,
    );
    setShowBalanceModal((currentModal) =>
      currentModal?.id === id ? updater(currentModal) : currentModal,
    );
    setShowNotifModal((currentModal) =>
      currentModal?.id === id ? updater(currentModal) : currentModal,
    );
  };

  const loadUsers = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      }

      setError(null);
      const backendUsers = await apiListUsers();
      setUsers(backendUsers.map(normalizeUser));
    } catch (err: any) {
      setError(err?.message || "Failed to load users");
      if (showLoader) {
        setUsers([]);
      }
    } finally {
      if (showLoader) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    void loadUsers();
  }, []);

  const refresh = async () => {
    await loadUsers(false);
  };

  const handleBlock = (id: string) => {
    updateUserInState(id, (user) => ({
      ...user,
      status: user.status === "active" ? "blocked" : "active",
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeleteUser(id);
      setError(null);
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== id));
      setSelected((currentSelected) =>
        currentSelected?.id === id ? null : currentSelected,
      );
    } catch (err: any) {
      setError(err?.message || "Failed to delete user");
    }
  };

  const handleBalanceUpdate = async (id: string, newBalance: number) => {
    if (Number.isNaN(newBalance)) {
      setError("Enter a valid balance amount");
      return;
    }

    try {
      await apiUpdateBalance(id, newBalance);
      updateUserInState(id, (user) => ({ ...user, balance: newBalance }));
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to update balance");
    } finally {
      setShowBalanceModal(null);
      setBalanceInput("");
    }
  };

  const handleSendNotif = async (id: string, msg: string) => {
    const message = msg.trim();
    if (!message) {
      setError("Notification message is required");
      return;
    }

    try {
      await apiSendNotification(id, message);
      updateUserInState(id, (user) => ({
        ...user,
        notifications: [...user.notifications, message],
      }));
      setError(null);
      setShowNotifModal(null);
      setNotifMsg("");
    } catch (err: any) {
      setError(err?.message || "Failed to send notification");
    }
  };

  const handleConfirm = (id: string) => {
    updateUserInState(id, (user) => ({
      ...user,
      registrationStatus: "confirmed",
    }));
  };

  const handleVerify = (id: string) => {
    updateUserInState(id, (user) => ({ ...user, verified: true }));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => void refresh()}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh Users"}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow">
          <p className="mb-2 text-slate-600">Loading users from the server...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-700">Error: {error}</p>
        </div>
      )}

      {!isLoading && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-medium text-blue-700">Total Users: {users.length}</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Verified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Notifications
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={selected?.id === user.id ? "bg-emerald-50" : ""}
                >
                  <td className="whitespace-nowrap px-6 py-4 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      {user.isAdmin && (
                        <span className="rounded bg-emerald-100 px-2 py-1 text-[10px] font-semibold uppercase text-emerald-700">
                          Admin
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{user.email}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={`rounded px-2 py-1 text-xs font-semibold ${user.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    ${user.balance.toFixed(2)}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.registrationStatus === "pending" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleConfirm(user.id)}
                      >
                        Confirm
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-700">Confirmed</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {user.verified ? (
                      <span className="text-xs text-emerald-700">Yes</span>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleVerify(user.id)}
                      >
                        Verify
                      </Button>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">{user.createdAt}</td>
                  <td className="max-w-xs whitespace-nowrap px-6 py-4">
                    <ul className="max-h-16 space-y-1 overflow-y-auto text-xs text-slate-500">
                      {user.notifications.slice(-2).map((notification) => (
                        <li key={`${user.id}-${notification}`}>• {notification}</li>
                      ))}
                      {user.notifications.length === 0 && <li>No notifications</li>}
                    </ul>
                  </td>
                  <td className="flex gap-2 whitespace-nowrap px-6 py-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(user)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setShowBalanceModal(user);
                        setBalanceInput(user.balance.toString());
                      }}
                    >
                      Balance
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setShowNotifModal(user);
                        setNotifMsg("");
                      }}
                    >
                      Notify
                    </Button>
                    <Button
                      size="sm"
                      variant={user.status === "active" ? "danger" : "secondary"}
                      onClick={() => handleBlock(user.id)}
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => void handleDelete(user.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="rounded-xl border border-slate-100 bg-white p-8 text-center shadow">
          <p className="text-slate-600">No users available</p>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
            <button
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              onClick={() => setSelected(null)}
            >
              &times;
            </button>
            <h2 className="mb-4 text-xl font-bold">User Details</h2>
            <div className="mb-2">
              <b>Name:</b> {selected.name}
            </div>
            <div className="mb-2">
              <b>Email:</b> {selected.email}
            </div>
            <div className="mb-2">
              <b>Status:</b> {selected.status}
            </div>
            <div className="mb-2">
              <b>Balance:</b> ${selected.balance.toFixed(2)}
            </div>
            <div className="mb-2">
              <b>Created:</b> {selected.createdAt}
            </div>
            <div className="mb-2">
              <b>Notifications:</b>
              <ul className="max-h-16 space-y-1 overflow-y-auto text-xs text-slate-500">
                {selected.notifications.map((notification) => (
                  <li key={`${selected.id}-${notification}`}>• {notification}</li>
                ))}
                {selected.notifications.length === 0 && <li>No notifications</li>}
              </ul>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={selected.status === "active" ? "danger" : "secondary"}
                onClick={() => {
                  handleBlock(selected.id);
                  setSelected(null);
                }}
              >
                {selected.status === "active" ? "Block" : "Unblock"}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShowBalanceModal(selected);
                  setBalanceInput(selected.balance.toString());
                }}
              >
                Update Balance
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  setShowNotifModal(selected);
                  setNotifMsg("");
                }}
              >
                Send Notification
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  void handleDelete(selected.id);
                  setSelected(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
            <button
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              onClick={() => setShowBalanceModal(null)}
            >
              &times;
            </button>
            <h2 className="mb-4 text-xl font-bold">Update Balance</h2>
            <div className="mb-4">
              User: <b>{showBalanceModal.name}</b>
            </div>
            <input
              type="number"
              className="mb-4 w-full rounded border px-3 py-2"
              value={balanceInput}
              onChange={(event) => setBalanceInput(event.target.value)}
              min="0"
              step="0.01"
            />
            <Button
              size="sm"
              className="w-full"
              onClick={() =>
                void handleBalanceUpdate(
                  showBalanceModal.id,
                  Number.parseFloat(balanceInput),
                )
              }
            >
              Save
            </Button>
          </div>
        </div>
      )}

      {showNotifModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative w-full max-w-sm rounded-xl bg-white p-8 shadow-lg">
            <button
              className="absolute right-2 top-2 text-slate-400 hover:text-slate-700"
              onClick={() => setShowNotifModal(null)}
            >
              &times;
            </button>
            <h2 className="mb-4 text-xl font-bold">Send Notification</h2>
            <div className="mb-4">
              User: <b>{showNotifModal.name}</b>
            </div>
            <textarea
              className="mb-4 w-full rounded border px-3 py-2"
              rows={3}
              value={notifMsg}
              onChange={(event) => setNotifMsg(event.target.value)}
              placeholder="Type your message..."
            />
            <Button
              size="sm"
              className="w-full"
              onClick={() => void handleSendNotif(showNotifModal.id, notifMsg)}
              disabled={!notifMsg.trim()}
            >
              Send
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
