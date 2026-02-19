import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardSidebar } from '../components/investment/DashboardSidebar';
import { StatsCard } from '../components/investment/StatsCard';
import {
  TransactionItem } from
'../components/investment/TransactionItem';
import { PortfolioChart } from '../components/investment/PortfolioChart';
import { AssetAllocationChart } from '../components/investment/AssetAllocationChart';
import { MarketTrendsChart } from '../components/investment/MarketTrendsChart';
import { TopPerformersTable } from '../components/investment/TopPerformersTable';
import { PriceMovementCard } from '../components/investment/PriceMovementCard';
import { GainLossHeatmap } from '../components/investment/GainLossHeatmap';
import { Button } from '../components/ui/Button';
import {
  Bell,
  Search,
  Wallet,
  TrendingUp,
  DollarSign,
  Activity,
  Plus,
  ArrowUpRight,
  Menu,
  X,
  CheckCircle2 } from
'lucide-react';
interface DashboardPageProps {
  onNavigate: (page: string) => void;
}

import { useEffect } from 'react';
import { getDashboard, clearToken, refreshCurrentUser } from '../lib/session';
import { updateUser } from '../lib/userStore';

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Settings form state
  const [settingsName, setSettingsName] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsPassword, setSettingsPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const loadUserData = () => {
    getDashboard()
      .then(setUser)
      .catch((err) => {
        setError(err.message || 'Not authenticated');
        setUser(null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUserData();
    
    // Refresh user data when window regains focus (for real-time updates from admin panel)
    const handleFocus = () => {
      loadUserData();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Also refresh every 5 seconds for real-time updates
    const interval = setInterval(loadUserData, 5000);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, []);

  // Initialize settings form when user data loads
  useEffect(() => {
    if (user) {
      setSettingsName(user.name || '');
      setSettingsEmail(user.email || '');
    }
  }, [user?.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('dashboard.loading')}</div>;
  }
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-4">{error || t('dashboard.notAuthenticated')}</h2>
          <button className="text-emerald-600 font-medium" onClick={() => { clearToken(); onNavigate('login'); }}>{t('dashboard.goToLogin')}</button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearToken();
    onNavigate('landing');
  };

  // Handle settings save
  const handleSettingsSave = () => {
    try {
      if (!user) return;
      
      const updates: any = {};
      if (settingsName !== user.name) updates.name = settingsName;
      if (settingsEmail !== user.email) updates.email = settingsEmail;
      if (settingsPassword) updates.password = settingsPassword;

      if (Object.keys(updates).length === 0) {
        setSettingsStatus({ type: 'error', message: t('dashboard.noChanges') });
        setTimeout(() => setSettingsStatus({ type: null, message: '' }), 3000);
        return;
      }

      updateUser(user.id, updates);
      refreshCurrentUser();
      loadUserData();
      
      setSettingsPassword('');
      setSettingsStatus({ type: 'success', message: t('dashboard.settingsUpdated') });
      setTimeout(() => setSettingsStatus({ type: null, message: '' }), 3000);
    } catch (err: any) {
      setSettingsStatus({ type: 'error', message: err.message || t('dashboard.failedToSave') });
      setTimeout(() => setSettingsStatus({ type: null, message: '' }), 3000);
    }
  };

  const handleSettingsCancel = () => {
    setSettingsName(user?.name || '');
    setSettingsEmail(user?.email || '');
    setSettingsPassword('');
    setSettingsStatus({ type: null, message: '' });
  };

  // Show zero balance and no transactions for new users
  const transactions: any[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', amount: '+$150.00', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'buy' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', amount: '-$200.00', timestamp: new Date(Date.now() - 7200000).toISOString(), type: 'sell' },
    { symbol: 'BTC', name: 'Bitcoin', amount: '+$500.00', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'buy' },
  ];
  const balance = user.balance ?? 0;

  // Render different content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-bold text-slate-900 mb-6 text-lg">{t('dashboard.yourHoldings')}</h3>
              <div className="space-y-4">
                {[
                  { symbol: 'AAPL', name: 'Apple Inc.', shares: 25, value: '$4,562.50', change: '+2.1%' },
                  { symbol: 'TSLA', name: 'Tesla, Inc.', shares: 15, value: '$3,601.50', change: '-1.5%' },
                  { symbol: 'BTC', name: 'Bitcoin', shares: 0.5, value: '$17,100.00', change: '+4.2%' },
                  { symbol: 'ETH', name: 'Ethereum', shares: 5, value: '$8,900.00', change: '+3.8%' },
                ].map((holding) => (
                  <div key={holding.symbol} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center font-bold text-xs text-emerald-700 mr-3">
                        {holding.symbol}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{holding.symbol}</p>
                        <p className="text-xs text-slate-500">{holding.shares} {t('dashboard.shares')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">{holding.value}</p>
                      <p className="text-xs text-emerald-600">{holding.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-4">{t('dashboard.portfolioSummary')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">{t('dashboard.totalValue')}</span>
                    <span className="font-bold text-slate-900">${balance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">{t('dashboard.unrealizedGains')}</span>
                    <span className="font-bold text-emerald-600">+$2,150.00</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <span className="text-slate-600">{t('dashboard.return')}</span>
                    <span className="font-bold text-emerald-600">+8.5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">{t('dashboard.allocation')}</span>
                    <span className="font-bold text-slate-900">4 {t('dashboard.assets')}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
                <h4 className="font-bold mb-3">{t('dashboard.performance')}</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-emerald-100 text-xs">1D</p>
                    <p className="font-bold text-lg">+0.8%</p>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs">1M</p>
                    <p className="font-bold text-lg">+3.2%</p>
                  </div>
                  <div>
                    <p className="text-emerald-100 text-xs">1Y</p>
                    <p className="font-bold text-lg">+8.5%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Visualizations */}
          <div className="mt-8 space-y-8">
            <PortfolioChart totalBalance={balance} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <AssetAllocationChart />
              <MarketTrendsChart title="Portfolio Growth (12M)" />
            </div>
            <TopPerformersTable title={t('dashboard.topHoldings')} limit={5} />
          </div>
          </>
        );

      case 'settings':
        return (
          <div className="max-w-2xl">
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
              <div className="p-6 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Account Settings</h3>
                <p className="text-sm text-slate-600 mt-1">Manage your account and preferences</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Status Message */}
                {settingsStatus.type && (
                  <div className={`p-4 rounded-lg ${settingsStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {settingsStatus.message}
                  </div>
                )}

                {/* Profile Section */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4">Profile Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        value={settingsName}
                        onChange={(e) => setSettingsName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                      <input 
                        type="email" 
                        value={settingsEmail}
                        onChange={(e) => setSettingsEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Account Status</label>
                      <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 capitalize">{user.status || 'Active'}</div>
                    </div>
                  </div>
                </div>

                {/* Security */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-4">Security</h4>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">New Password (optional)</label>
                    <input 
                      type="password" 
                      value={settingsPassword}
                      onChange={(e) => setSettingsPassword(e.target.value)}
                      placeholder="Leave blank to keep current password"
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" 
                    />
                  </div>
                </div>

                {/* Preferences */}
                <div className="pt-6 border-t border-slate-100">
                  <h4 className="font-semibold text-slate-900 mb-4">Preferences</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-emerald-600 rounded" />
                      <span className="ml-3 text-sm text-slate-700">Email notifications</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" defaultChecked className="h-4 w-4 text-emerald-600 rounded" />
                      <span className="ml-3 text-sm text-slate-700">Price alerts</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-emerald-600 rounded" />
                      <span className="ml-3 text-sm text-slate-700">Marketing emails</span>
                    </label>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-6 border-t border-slate-100 flex gap-3">
                  <button 
                    onClick={handleSettingsSave}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors">
                    Save Changes
                  </button>
                  <button 
                    onClick={handleSettingsCancel}
                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium rounded-lg transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <></>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <DashboardSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        userName={user.name}
        userEmail={user.email}
        balance={balance}
      />


      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen &&
      <div className="fixed inset-0 z-50 md:hidden">
          <div
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}>
        </div>
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 z-50 animate-slide-in-left">
            <div className="flex justify-end p-4">
              <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white">

                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="h-full overflow-y-auto pb-20">
              {/* Reusing sidebar logic would be better, but for simplicity in template: */}
              <DashboardSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onLogout={() => onNavigate('landing')} />

            </div>
          </div>
        </div>
      }

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center md:hidden">
            <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="text-slate-500 hover:text-slate-700 mr-4">

              <Menu className="h-6 w-6" />
            </button>
            <span className="font-bold text-lg text-slate-900">{t('dashboard.investPro')}</span>
          </div>

              <div className="hidden md:flex items-center text-xl font-bold text-slate-900">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </div>

          <div className="flex items-center space-x-4">
              <div className="hidden sm:block relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('dashboard.searchAssets')}
                className="pl-9 pr-4 py-2 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64" />

            </div>
            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Bell className="h-5 w-5" />
                {user.notifications && user.notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-80 overflow-y-auto">
                  <div className="p-4 border-b border-slate-200 font-semibold text-slate-900 flex justify-between items-center sticky top-0 bg-white">
                    <span>{t('dashboard.notifications')}</span>
                    <button 
                      onClick={() => setNotificationsOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-lg">×</button>
                  </div>
                  {user.notifications && user.notifications.length > 0 ? (
                    <div className="divide-y divide-slate-100">
                      {user.notifications.slice().reverse().map((notif: any, idx: number) => {
                        // Handle both object and string formats
                        const message = typeof notif === 'string' ? notif : (notif.message || '');
                        const timestamp = typeof notif === 'string' ? new Date().toISOString() : (notif.timestamp || new Date().toISOString());
                        
                        let notifDate = new Date();
                        try {
                          notifDate = new Date(timestamp);
                          // Validate the date is valid
                          if (isNaN(notifDate.getTime())) {
                            notifDate = new Date();
                          }
                        } catch (e) {
                          notifDate = new Date();
                        }
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const notifDayStart = new Date(notifDate);
                        notifDayStart.setHours(0, 0, 0, 0);
                        
                        const yesterday = new Date(today);
                        yesterday.setDate(yesterday.getDate() - 1);
                        
                        let timeText = '';
                        if (notifDayStart.getTime() === today.getTime()) {
                          timeText = notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else if (notifDayStart.getTime() === yesterday.getTime()) {
                          timeText = 'Yesterday ' + notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        } else {
                          const year = notifDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined;
                          timeText = notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: year }) + ' ' + notifDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                        }
                        
                        return (
                          <div key={notif.id || idx} className="p-4 hover:bg-slate-50 transition-colors flex gap-3">
                            <div className="text-emerald-600 flex-shrink-0 mt-1">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-slate-700">{message}</p>
                              <p className="text-xs text-slate-500 mt-1">{timeText}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-sm">
                      {t('dashboard.noNotifications')}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col text-right mr-2">
                <span className="text-sm font-medium text-slate-900">{user.name}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="hidden sm:flex"
                onClick={handleLogout}>
                {t('dashboard.signOut')}
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {activeTab === 'overview' ? (
            <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Balance"
              value={`$${balance.toFixed(2)}`}
              change="0%"
              icon={Wallet} />

            <StatsCard
              title="Total Profit"
              value={`$${(user.totalProfit ?? 0).toFixed(2)}`}
              change="0%"
              icon={TrendingUp}
              iconColor="text-blue-600"
              iconBgColor="bg-blue-100" />

            <StatsCard
              title="Monthly Income"
              value={`$${(user.monthlyIncome ?? 0).toFixed(2)}`}
              change="0%"
              icon={DollarSign}
              iconColor="text-purple-600"
              iconBgColor="bg-purple-100" />

            <StatsCard
              title="Active Trades"
              value={`${user.activeTrades ?? 0}`}
              change={`${(user.portfolioPerformance ?? 0).toFixed(1)}%`}
              isPositive={(user.portfolioPerformance ?? 0) >= 0}
              icon={Activity}
              iconColor="text-orange-600"
              iconBgColor="bg-orange-100" />

          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Chart Section */}
            <div className="lg:col-span-2 space-y-8">
              <PortfolioChart totalBalance={balance} />

              <MarketTrendsChart />

              <TopPerformersTable />

              {/* Watchlist */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">{t('dashboard.marketWatchlist')}</h3>
                  <button className="text-sm text-emerald-600 font-medium hover:text-emerald-700">
                    {t('dashboard.viewAll')}
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                  {
                    symbol: 'AAPL',
                    name: 'Apple Inc.',
                    price: '$182.50',
                    change: '+1.2%',
                    up: true
                  },
                  {
                    symbol: 'TSLA',
                    name: 'Tesla, Inc.',
                    price: '$240.10',
                    change: '-0.8%',
                    up: false
                  },
                  {
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    price: '$34,200.00',
                    change: '+4.5%',
                    up: true
                  },
                  {
                    symbol: 'ETH',
                    name: 'Ethereum',
                    price: '$1,780.00',
                    change: '+2.1%',
                    up: true
                  }].
                  map((stock) =>
                  <div
                    key={stock.symbol}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">

                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600 mr-4">
                          {stock.symbol}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {stock.symbol}
                          </p>
                          <p className="text-xs text-slate-500">{stock.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">
                          {stock.price}
                        </p>
                        <p
                        className={`text-xs font-medium ${stock.up ? 'text-emerald-600' : 'text-red-600'}`}>

                          {stock.change}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Transactions & Quick Actions */}
            <div className="space-y-8">
              {/* User Profile Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 text-white shadow-lg shadow-emerald-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">
                  {t('dashboard.welcome', { name: user.name })}
                </h3>
                <p className="text-emerald-100 text-sm mb-4 relative z-10">
                  {t('dashboard.accountCreated')}
                </p>
                <div className="space-y-3 relative z-10">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-emerald-100">{t('dashboard.emailAddress')}</p>
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-emerald-100">{t('dashboard.accountStatus')}</p>
                    <p className="text-sm font-medium capitalize">{user.status || t('dashboard.active')}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <p className="text-xs text-emerald-100">{t('dashboard.currentBalance')}</p>
                    <p className="text-lg font-bold">${balance.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-blue-600 rounded-xl p-6 text-white shadow-lg shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h3 className="font-bold text-lg mb-1 relative z-10">
                  {t('dashboard.quickTransfer')}
                </h3>
                <p className="text-blue-100 text-sm mb-6 relative z-10">
                  {t('dashboard.transferMessage')}
                </p>

                <div className="grid grid-cols-2 gap-3 relative z-10">
                    <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2">
                    <ArrowUpRight className="h-5 w-5" />
                    {t('dashboard.send')}
                  </button>
                  <button className="bg-white text-blue-900 hover:bg-blue-50 p-3 rounded-lg text-sm font-medium transition-colors flex flex-col items-center justify-center gap-2 shadow-sm">
                    <Plus className="h-5 w-5" />
                    {t('dashboard.addMoney')}
                  </button>
                </div>
              </div>

              {/* Recent Transactions */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-900">{t('dashboard.recentActivity')}</h3>
                  <button className="p-1 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600">
                    <Search className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {transactions.map((tx, i) => {
                    const txDate = new Date(tx.timestamp);
                    const now = new Date();
                    const diffMs = now.getTime() - txDate.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const diffHours = Math.floor(diffMs / 3600000);
                    let timeAgo = '';
                    if (diffMins < 60) timeAgo = `${diffMins}m ago`;
                    else if (diffHours < 24) timeAgo = `${diffHours}h ago`;
                    else timeAgo = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                    return (
                      <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-xs text-white mr-3 ${tx.type === 'buy' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                            {tx.symbol}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{tx.name}</p>
                            <p className="text-xs text-slate-500">{timeAgo}</p>
                          </div>
                        </div>
                        <p className={`font-medium ${tx.type === 'buy' ? 'text-emerald-600' : 'text-red-600'}`}>{tx.amount}</p>
                      </div>
                    );
                  })}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-4 text-sm"
                  rightIcon={<ArrowUpRight className="h-4 w-4" />}>

                  {t('dashboard.viewAllHistory')}
                </Button>
              </div>



              {/* Asset Allocation */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
                <h3 className="font-bold text-slate-900 mb-6">
                  {t('dashboard.assetAllocation')}
                </h3>
                <div className="flex items-center justify-center mb-6 relative">
                  {/* Simple CSS Donut Chart */}
                  <div className="h-40 w-40 rounded-full border-[16px] border-emerald-500 border-r-blue-500 border-b-purple-500 border-l-orange-500 transform rotate-45"></div>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs text-slate-500">{t('dashboard.totalAssets')}</span>
                    <span className="font-bold text-slate-900">12</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                  {
                    label: t('dashboard.stocks'),
                    color: 'bg-emerald-500',
                    value: '45%'
                  },
                  {
                    label: t('dashboard.crypto'),
                    color: 'bg-blue-500',
                    value: '25%'
                  },
                  {
                    label: t('dashboard.etfs'),
                    color: 'bg-purple-500',
                    value: '20%'
                  },
                  {
                    label: t('dashboard.cash'),
                    color: 'bg-orange-500',
                    value: '10%'
                  }].
                  map((item) =>
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm">

                      <div className="flex items-center">
                        <span
                        className={`h-3 w-3 rounded-full ${item.color} mr-2`}>
                      </span>
                        <span className="text-slate-600">{item.label}</span>
                      </div>
                      <span className="font-medium text-slate-900">
                        {item.value}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Visualization Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <AssetAllocationChart />
            <GainLossHeatmap />
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PriceMovementCard
              symbol="AAPL"
              name="Apple Inc."
              currentPrice={195.80}
              previousPrice={175.20}
              high={198.50}
              low={174.25}
              volume="45.2M" />
            <PriceMovementCard
              symbol="TSLA"
              name="Tesla Inc."
              currentPrice={245.30}
              previousPrice={220.50}
              high={248.75}
              low={215.20}
              volume="32.1M" />
            <PriceMovementCard
              symbol="MSFT"
              name="Microsoft"
              currentPrice={420.50}
              previousPrice={395.20}
              high={425.80}
              low={390.15}
              volume="28.5M" />
            <PriceMovementCard
              symbol="BTC"
              name="Bitcoin"
              currentPrice={34200.50}
              previousPrice={32150.00}
              high={35620.00}
              low={31800.00}
              volume="2.1B" />
          </div>
            </>
          ) : (
            renderTabContent()
          )}
        </main>
      </div>
    </div>);

}