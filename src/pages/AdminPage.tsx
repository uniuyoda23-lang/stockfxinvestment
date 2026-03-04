import { useState } from "react";
import {
  LogOut,
  Home,
  Zap,
  Trash2,
  User as UserIcon,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Send as SendIcon,
} from "lucide-react";
import { Button } from "../components/ui/Button";
import {
  useUsers,
  useUpdateBalance,
  useSendNotification,
  useDeleteUser,
  useAllTransactions,
  useApproveTransaction,
  useRejectTransaction,
  useUpdateStats,
} from "../hooks/useApi";

interface AdminPageProps {
  onLogout?: () => void;
}

export function AdminPage({ onLogout }: AdminPageProps) {
  const { data: users = [], isLoading } = useUsers();
  const { data: allTransactions = [], isLoading: txLoading } =
    useAllTransactions();

  const updateBalanceMutation = useUpdateBalance();
  const sendNotificationMutation = useSendNotification();
  const deleteUserMutation = useDeleteUser();
  const approveTxMutation = useApproveTransaction();
  const rejectTxMutation = useRejectTransaction();
  const updateStatsMutation = useUpdateStats();

  const [activeTab, setActiveTab] = useState<"users" | "transactions">("users");
  const [status, setStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  // Edit states
  const [editBalance, setEditBalance] = useState<{ [id: string]: string }>({});
  const [notifyMsg, setNotifyMsg] = useState<{ [id: string]: string }>({});
  const [editStats, setEditStats] = useState<{
    [id: string]: { totalInvestment: string; accountType: string };
  }>({});

  const showStatus = (message: string, type: "success" | "error") => {
    setStatus({ message, type });
    setTimeout(() => setStatus({ message: "", type: null }), 3000);
  };

  const handleUpdateBalance = async (userId: string) => {
    const amount = Number(editBalance[userId]);
    if (isNaN(amount)) return showStatus("Invalid amount", "error");
    updateBalanceMutation.mutate(
      { userId, balance: amount },
      {
        onSuccess: () => {
          showStatus("Balance updated", "success");
          setEditBalance({ ...editBalance, [userId]: "" });
        },
        onError: (err: any) => showStatus(err.message, "error"),
      },
    );
  };

  const handleSendNotification = async (userId: string) => {
    const msg = notifyMsg[userId];
    if (!msg) return showStatus("Message required", "error");
    sendNotificationMutation.mutate(
      { userId, message: msg },
      {
        onSuccess: () => {
          showStatus("Notification sent", "success");
          setNotifyMsg((prev) => ({ ...prev, [userId]: "" }));
        },
        onError: (err: any) => showStatus(err.message, "error"),
      },
    );
  };

  const handleUpdateStats = async (userId: string) => {
    const stats = editStats[userId] || {
      totalInvestment: "",
      accountType: "standard",
    };
    updateStatsMutation.mutate(
      {
        userId,
        stats: {
          totalInvestment: Number(stats.totalInvestment),
          accountType: stats.accountType,
        },
      },
      {
        onSuccess: () => showStatus("Stats updated", "success"),
        onError: (err: any) => showStatus(err.message, "error"),
      },
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    deleteUserMutation.mutate(userId, {
      onSuccess: () => showStatus("User deleted", "success"),
      onError: (err: any) => showStatus(err.message, "error"),
    });
  };

  const handleApprove = async (txId: string) => {
    approveTxMutation.mutate(txId, {
      onSuccess: () => showStatus("Transaction approved", "success"),
      onError: (err: any) => showStatus(err.message, "error"),
    });
  };

  const handleReject = async (txId: string) => {
    rejectTxMutation.mutate(txId, {
      onSuccess: () => showStatus("Transaction rejected", "success"),
      onError: (err: any) => showStatus(err.message, "error"),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    onLogout?.();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20">
              <Zap className="h-7 w-7 text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">
                Nexus <span className="text-emerald-500">Core</span>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                System Authority
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => (window.location.hash = "dashboard")}
              variant="outline"
              className="bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white rounded-xl px-6"
            >
              <Home className="h-4 w-4 mr-2" /> Dashboard
            </Button>
            <Button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white rounded-xl px-6 shadow-lg shadow-red-500/20 transition-all active:scale-95"
            >
              <LogOut className="h-4 w-4 mr-2" /> Terminate Session
            </Button>
          </div>
        </header>

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === "users" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${activeTab === "transactions" ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-slate-800 text-slate-400 hover:text-slate-200"}`}
          >
            Approval Queue
            {allTransactions.filter((t: any) => t.status === "pending").length >
              0 && (
              <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {
                  allTransactions.filter((t: any) => t.status === "pending")
                    .length
                }
              </span>
            )}
          </button>
        </div>

        {status.message && (
          <div
            className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${status.type === "success" ? "bg-emerald-900/20 border-emerald-500/50 text-emerald-300" : "bg-red-900/20 border-red-500/50 text-red-300"}`}
          >
            <div
              className={`h-2 w-2 rounded-full ${status.type === "success" ? "bg-emerald-500" : "bg-red-500"} shadow-[0_0_8px_rgba(16,185,129,0.5)]`}
            ></div>
            {status.message}
          </div>
        )}

        {activeTab === "users" ? (
          <div className="space-y-4">
            {isLoading ? (
              <div className="py-20 text-center text-slate-500">
                Loading system data...
              </div>
            ) : users.length === 0 ? (
              <div className="py-20 text-center bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-500">
                No users found
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-lg transition-all hover:border-slate-600"
                >
                  <div
                    onClick={() =>
                      setExpandedUserId(
                        expandedUserId === user.id ? null : user.id,
                      )
                    }
                    className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold border border-slate-600">
                        <UserIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white">
                            {user.name || "Unnamed"}
                          </h3>
                          {user.is_admin && (
                            <span className="bg-emerald-500/10 text-emerald-500 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/20 font-bold uppercase">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-400">
                          ${(user.balance || 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                          Balance
                        </p>
                      </div>
                      <div className="text-slate-500">
                        {expandedUserId === user.id ? "▲" : "▼"}
                      </div>
                    </div>
                  </div>

                  {expandedUserId === user.id && (
                    <div className="p-6 bg-slate-900/50 border-t border-slate-700 flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Update User Balance
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              placeholder="New balance amount"
                              value={editBalance[user.id] || ""}
                              onChange={(e) =>
                                setEditBalance({
                                  ...editBalance,
                                  [user.id]: e.target.value,
                                })
                              }
                              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                            <Button
                              onClick={() => handleUpdateBalance(user.id)}
                              className="whitespace-nowrap"
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Push Notification
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Direct message to user"
                              value={notifyMsg[user.id] || ""}
                              onChange={(e) =>
                                setNotifyMsg({
                                  ...notifyMsg,
                                  [user.id]: e.target.value,
                                })
                              }
                              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white w-full outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <Button
                              onClick={() => handleSendNotification(user.id)}
                              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
                            >
                              Send
                            </Button>
                          </div>
                        </div>

                        {/* Stats Management */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-700">
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Total Investment ($)
                            </label>
                            <input
                              type="number"
                              value={
                                editStats[user.id]?.totalInvestment ??
                                (user as any).total_investment ??
                                ""
                              }
                              onChange={(e) =>
                                setEditStats({
                                  ...editStats,
                                  [user.id]: {
                                    ...(editStats[user.id] || {
                                      accountType:
                                        (user as any).account_type ||
                                        "standard",
                                    }),
                                    totalInvestment: e.target.value,
                                  },
                                })
                              }
                              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                              Account Type
                            </label>
                            <select
                              value={
                                editStats[user.id]?.accountType ??
                                (user as any).account_type ??
                                "standard"
                              }
                              onChange={(e) =>
                                setEditStats({
                                  ...editStats,
                                  [user.id]: {
                                    ...(editStats[user.id] || {
                                      totalInvestment:
                                        (user as any).total_investment || "",
                                    }),
                                    accountType: e.target.value,
                                  },
                                })
                              }
                              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white w-full outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            >
                              <option value="standard">Standard</option>
                              <option value="gold">Gold</option>
                              <option value="premium">Premium</option>
                              <option value="vip">VIP</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <Button
                              onClick={() => handleUpdateStats(user.id)}
                              className="w-full bg-slate-700 hover:bg-slate-600"
                              disabled={updateStatsMutation.isPending}
                            >
                              Update Stats
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="w-full lg:w-72 space-y-4">
                        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                            User Overview
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-slate-400">Status</span>
                              <span className="text-emerald-400 font-bold capitalize">
                                {user.status || "Active"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          variant="danger"
                          className="w-full py-3 bg-red-600/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {txLoading ? (
              <div className="py-20 text-center text-slate-500">
                Loading transaction queue...
              </div>
            ) : allTransactions.length === 0 ? (
              <div className="py-20 text-center bg-slate-800/50 rounded-2xl border border-slate-700 text-slate-500">
                No transactions in history
              </div>
            ) : (
              allTransactions.map((tx: any) => (
                <div
                  key={tx.id}
                  className="bg-slate-800 rounded-2xl border border-slate-700 p-6 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                        tx.type === "deposit"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : tx.type === "withdrawal"
                            ? "bg-red-500/10 text-red-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      {tx.type === "deposit" ? (
                        <ArrowDownLeft />
                      ) : tx.type === "withdrawal" ? (
                        <ArrowUpRight />
                      ) : (
                        <SendIcon className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white capitalize">
                        {tx.type} Request
                      </h4>
                      <p className="text-sm text-slate-400">
                        {tx.user?.name || tx.user?.email}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {new Date(tx.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p
                        className={`text-xl font-black ${tx.type === "deposit" ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {tx.type === "deposit" ? "+" : "-"}$
                        {tx.amount?.toLocaleString()}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase ${
                          tx.status === "pending"
                            ? "text-amber-500"
                            : tx.status === "completed"
                              ? "text-emerald-500"
                              : "text-red-500"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </div>
                    {tx.status === "pending" && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(tx.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 h-10 w-10 p-0 flex items-center justify-center rounded-lg"
                          title="Approve"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => handleReject(tx.id)}
                          variant="danger"
                          className="bg-red-600 hover:bg-red-700 h-10 w-10 p-0 flex items-center justify-center rounded-lg"
                          title="Reject"
                        >
                          <XCircle className="h-5 w-5" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
