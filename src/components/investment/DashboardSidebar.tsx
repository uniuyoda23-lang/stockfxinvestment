
import {
  LayoutDashboard,
  PieChart,
  ArrowRightLeft,
  Settings,
  LogOut,
  CreditCard } from
'lucide-react';
import { Logo } from './Logo';
interface DashboardSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
}
export function DashboardSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  userName = 'Alex Morgan',
  userEmail = 'alex@example.com'
}: DashboardSidebarProps) {
  const navItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard
  },
  {
    id: 'portfolio',
    label: 'Portfolio',
    icon: PieChart
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: ArrowRightLeft
  },
  {
    id: 'cards',
    label: 'Cards',
    icon: CreditCard
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings
  }];

  return (
    <div className="hidden md:flex flex-col w-full md:w-64 bg-slate-900 text-white h-full md:h-screen md:fixed md:left-0 md:top-0 md:border-r border-slate-800 overflow-y-auto">
      {/* Logo Area */}
      <div className="p-4 md:p-6 flex items-center border-b border-slate-800 flex-shrink-0">
        <Logo size="lg" variant="light" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 md:py-6 px-2 md:px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}
              `}>

              <Icon
                className={`mr-3 h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />

              <span className="truncate">{item.label}</span>
            </button>);

        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/50 flex-shrink-0">
        <div className="flex items-center mb-4 px-2 gap-3 min-w-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-lg flex-shrink-0">
            {userName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-white truncate">
              {userName}
            </p>
            <p className="text-xs text-slate-400 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center md:justify-start px-3 py-2 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors">

          <LogOut className="mr-2 md:mr-3 h-4 w-4" />
          <span className="hidden md:inline">Sign Out</span>
        </button>
      </div>
    </div>);

}