import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { DashboardSidebar } from "../components/investment/DashboardSidebar";
import { StatsCard } from "../components/investment/StatsCard";
import { PortfolioChart } from "../components/investment/PortfolioChart";
import { AssetAllocationChart } from "../components/investment/AssetAllocationChart";
import { MarketTrendsChart } from "../components/investment/MarketTrendsChart";
import { TopPerformersTable } from "../components/investment/TopPerformersTable";
import { Button } from "../components/ui/Button";
import {
  Bell,
  Search,
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  Menu,
  X,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { authService } from "../services/authService";

import { useDashboard } from "../hooks/useApi";

interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Settings form state
  const [settingsName, setSettingsName] = useState("");
  const [settingsEmail, setSettingsEmail] = useState("");

  const { data, isLoading, error: apiError, refetch } = useDashboard();
  const user = data?.user;

  const [showVerifiedSuccess, setShowVerifiedSuccess] = useState(false);

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // Transaction Modals
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setSettingsName(user.name || "");
      setSettingsEmail(user.email || "");
    }

    // Check for verified=true in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("verified") === "true") {
      setShowVerifiedSuccess(true);
      // Remove param from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      refetch();
    }
  }, [user?.id]);

  const handleResend = async () => {
    setResending(true);
    setResendStatus("idle");
    try {
      const result = await authService.resendVerification();
      if (result.success) setResendStatus("success");
      else setResendStatus("error");
    } catch (err) {
      setResendStatus("error");
    } finally {
      setResending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {t("dashboard.loading")}
      </div>
    );
  }

  if (apiError || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 max-w-sm w-full mx-4">
          <h2 className="text-xl font-bold text-slate-900 mb-4">
            {apiError instanceof Error
              ? apiError.message
              : t("dashboard.notAuthenticated")}
          </h2>
          <Button
            onClick={() => onNavigate("login")}
            variant="primary"
            className="w-full"
          >
            {t("dashboard.goToLogin")}
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    authService.logout();
    onNavigate("landing");
  };

  const handleDeposit = async () => {
    if (!transactionAmount || parseFloat(transactionAmount) <= 0) return;
    setTransactionSubmitting(true);
    try {
      await authService.requestDeposit(parseFloat(transactionAmount));
      setShowDepositModal(false);
      setTransactionAmount("");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setTransactionSubmitting(false);
    }
  };

  const handleSend = async () => {
    if (
      !transactionAmount ||
      parseFloat(transactionAmount) <= 0 ||
      !recipientEmail
    )
      return;
    setTransactionSubmitting(true);
    try {
      await authService.requestSend(
        parseFloat(transactionAmount),
        recipientEmail,
      );
      setShowSendModal(false);
      setTransactionAmount("");
      setRecipientEmail("");
      refetch();
    } catch (err) {
      console.error(err);
    } finally {
      setTransactionSubmitting(false);
    }
  };

  const balance = user.balance ?? 0;
  const transactions: any[] = user.recentTransactions || [];

  return (
    <div className="h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-col md:h-screen md:w-64 md:flex-shrink-0 md:bg-slate-900">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          userName={user.name}
          userEmail={user.email}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-slate-500"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="font-semibold text-slate-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 rounded-full bg-slate-100 border-none text-sm w-48 focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2 text-slate-400 hover:text-slate-600 relative"
            >
              <Bell className="h-5 w-5" />
              {user.notifications?.length > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border border-white"></span>
              )}
            </button>
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4 ml-2">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-slate-900">
                  {user.name}
                </p>
                <p className="text-xs text-slate-500">Member</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs uppercase">
                {user.name?.charAt(0) || "U"}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Verification Warning */}
          {!user.is_verified && (
            <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">
                    Account Verification Required
                  </h4>
                  <p className="text-amber-700 text-xs">
                    Please verify your email address to unlock all trading and
                    withdrawal features.
                  </p>
                </div>
              </div>
              <Button
                onClick={handleResend}
                disabled={resending || resendStatus === "success"}
                variant="outline"
                size="sm"
                className="bg-white border-amber-200 text-amber-900 hover:bg-amber-100 whitespace-nowrap"
              >
                {resending
                  ? "Sending..."
                  : resendStatus === "success"
                    ? "Link Sent!"
                    : "Resend Link"}
              </Button>
            </div>
          )}

          {/* Verification Success Message */}
          {showVerifiedSuccess && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 text-sm">
                  Account Verified!
                </h4>
                <p className="text-emerald-700 text-xs">
                  Thank you for verifying your email address. All features are
                  now unlocked.
                </p>
              </div>
              <button
                onClick={() => setShowVerifiedSuccess(false)}
                className="ml-auto text-emerald-400 hover:text-emerald-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatsCard
                  title="Total Balance"
                  value={`$${balance.toFixed(2)}`}
                  icon={Wallet}
                />
                <StatsCard
                  title="Total Profit"
                  value={`$${(user.totalProfit || 0).toFixed(2)}`}
                  icon={TrendingUp}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-50"
                />
                <StatsCard
                  title="Monthly Income"
                  value={`$${(user.monthlyIncome || 0).toFixed(2)}`}
                  icon={DollarSign}
                  iconColor="text-purple-600"
                  iconBgColor="bg-purple-50"
                />
                <StatsCard
                  title="Active Trades"
                  value={`${user.activeTrades || 0}`}
                  icon={Activity}
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-50"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <PortfolioChart totalBalance={balance} />
                  <TopPerformersTable />
                </div>
                <div className="space-y-6">
                  <div className="bg-emerald-600 rounded-xl p-6 text-white shadow-lg shadow-emerald-600/20">
                    <h3 className="font-bold text-lg mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        disabled={!user.is_verified}
                        onClick={() => setShowSendModal(true)}
                        className={`bg-white/10 border-white/20 text-white hover:bg-white/20 ${!user.is_verified ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Send
                      </Button>
                      <Button
                        variant="outline"
                        disabled={!user.is_verified}
                        onClick={() => setShowDepositModal(true)}
                        className={`bg-white text-emerald-600 hover:bg-emerald-50 border-white ${!user.is_verified ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        Deposit
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-4">
                      Recent Activity
                    </h3>
                    <div className="space-y-4">
                      {transactions.length > 0 ? (
                        transactions.map((tx: any, i: number) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-3 last:pb-0"
                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <p className="font-medium text-slate-900 truncate">
                                {tx.type === "deposit"
                                  ? "Deposit"
                                  : tx.type === "withdrawal"
                                    ? "Withdrawal"
                                    : `Send (${tx.symbol})`}
                              </p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-slate-500">
                                  {new Date(tx.created_at).toLocaleDateString()}
                                </p>
                                <span
                                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    tx.status === "pending"
                                      ? "bg-amber-100 text-amber-700"
                                      : tx.status === "completed"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </div>
                            </div>
                            <p
                              className={`font-bold ${tx.type === "deposit" ? "text-emerald-600" : "text-red-600"}`}
                            >
                              {tx.type === "deposit" ? "+" : "-"}$
                              {tx.amount?.toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-500 text-sm text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "portfolio" && (
            <div className="space-y-6">
              <PortfolioChart totalBalance={balance} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AssetAllocationChart />
                <MarketTrendsChart />
              </div>

              {/* Real Portfolio Data Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mt-6">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-xl text-slate-900">
                    Your Assets
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">Asset/Symbol</th>
                        <th className="px-6 py-4 text-right">Quantity</th>
                        <th className="px-6 py-4 text-right">Average Cost</th>
                        <th className="px-6 py-4 text-right">Value (Est)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {user.portfolio && user.portfolio.length > 0 ? (
                        user.portfolio.map((item: any, i: number) => {
                          // Rough estimate since we don't have live prices here
                          const estValue =
                            item.quantity * (item.average_cost || 0);
                          return (
                            <tr key={i} className="hover:bg-slate-50">
                              <td className="px-6 py-4 font-medium text-slate-900">
                                {item.symbol}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {item.quantity}
                              </td>
                              <td className="px-6 py-4 text-right">
                                ${item.average_cost?.toFixed(2) || "0.00"}
                              </td>
                              <td className="px-6 py-4 text-right font-medium text-slate-900">
                                ${estValue.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="px-6 py-8 text-center text-slate-500"
                          >
                            No assets in your portfolio yet
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h3 className="font-bold text-xl text-slate-900">
                  Account Settings
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={settingsName}
                    onChange={(e) => setSettingsName(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={settingsEmail}
                    disabled
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Account Type
                  </label>
                  <div className="px-4 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-900 font-semibold capitalize">
                    {user.account_type || "Standard"}
                  </div>
                </div>
                <Button className="w-full">Save Changes</Button>
              </div>
            </div>
          )}

          {activeTab === "transactions" && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-bold text-xl text-slate-900">
                  Transaction History
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {user.transactions && user.transactions.length > 0 ? (
                      user.transactions.map((tx: any, i: number) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(tx.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 capitalize font-medium text-slate-900">
                            {tx.type} {tx.symbol ? `(${tx.symbol})` : ""}
                          </td>
                          <td
                            className={`px-6 py-4 font-bold ${tx.type === "deposit" ? "text-emerald-600" : "text-red-600"}`}
                          >
                            {tx.type === "deposit" ? "+" : "-"}$
                            {tx.amount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                tx.status === "pending"
                                  ? "bg-amber-100 text-amber-700"
                                  : tx.status === "completed"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-red-100 text-red-700"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Menu Overlay */}
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white font-bold text-xl uppercase tracking-wider">
                Menu
              </h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X />
              </button>
            </div>
            <DashboardSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onLogout={handleLogout}
              userName={user.name}
              userEmail={user.email}
            />
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">
                Deposit Funds
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">
                  Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Your request will be submitted for admin approval.
              </p>
              <Button
                onClick={handleDeposit}
                disabled={transactionSubmitting || !transactionAmount}
                className="w-full h-12 text-lg"
              >
                {transactionSubmitting
                  ? "Processing..."
                  : "Submit Deposit Request"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">Send Money</h3>
              <button
                onClick={() => setShowSendModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">
                  Recipient Email/ID
                </label>
                <input
                  type="text"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="recipient@example.com"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 text-left">
                  Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    value={transactionAmount}
                    onChange={(e) => setTransactionAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none text-lg font-bold"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 text-left">
                {" "}
                Funds will be deducted from your balance upon admin approval.
              </p>
              <Button
                onClick={handleSend}
                disabled={
                  transactionSubmitting || !transactionAmount || !recipientEmail
                }
                className="w-full h-12 text-lg"
              >
                {transactionSubmitting ? "Processing..." : "Send Request"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
