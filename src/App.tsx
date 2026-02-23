import { useEffect, useState } from 'react';
import { LandingPageNew } from './pages/LandingPageNew';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { DisclosuresPage } from './pages/DisclosuresPage';
import { CookiePolicyPage } from './pages/CookiePolicyPage';
import './i18n/config';
// Initialize Supabase
import './lib/supabase';
import { AuthProvider } from './context/AuthContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { fetchCurrentUser, setCurrentUserFromProfile } from './lib/session';

type Page = 'landing' | 'login' | 'register' | 'dashboard' | 'admin' | 'admin-login' | 'privacy' | 'terms' | 'disclosures' | 'cookies';

export function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  
  // Simple hash-based routing handler
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'login') {
        setCurrentPage('login');
      } else if (hash === 'register') {
        setCurrentPage('register');
      } else if (hash === 'dashboard') {
        setCurrentPage('dashboard');
      } else if (hash === 'admin') {
        setCurrentPage('admin');
      } else if (hash === 'admin-login') {
        setCurrentPage('admin-login');
      } else {
        setCurrentPage('landing');
      }
    };
    // Initialize based on current hash
    handleHashChange();
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    // Fetch current user from API (if any)
    (async () => {
      try {
        const user = await fetchCurrentUser();
        if (user) setCurrentUserFromProfile(user);
      } catch (e) {
        console.debug('No active session');
      }
    })();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle Ctrl+Shift+A keyboard shortcut to access admin panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        window.location.hash = 'admin-login';
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const navigate = (page: string) => {
    window.location.hash = page === 'landing' ? '' : page;
    // State update happens via the hashchange listener
  };
  const [adminAuthed, setAdminAuthed] = useState(false);
  
  const handleAdminLogout = () => {
    setAdminAuthed(false);
    window.location.hash = 'admin-login';
  };
  
  return (
    <ErrorBoundary>
      <AuthProvider>
        {currentPage === 'landing' && <LandingPageNew onNavigate={navigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={navigate} />}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {currentPage === 'admin-login' && !adminAuthed && <AdminLoginPage onSuccess={() => { setAdminAuthed(true); setCurrentPage('admin'); window.location.hash = 'admin'; }} />}
        {((currentPage === 'admin-login' && adminAuthed) || currentPage === 'admin') && <AdminPage onLogout={handleAdminLogout} />}
        {currentPage === 'privacy' && <PrivacyPage onNavigate={navigate} />}
        {currentPage === 'terms' && <TermsPage onNavigate={navigate} />}
        {currentPage === 'disclosures' && <DisclosuresPage onNavigate={navigate} />}
        {currentPage === 'cookies' && <CookiePolicyPage onNavigate={navigate} />}
      </AuthProvider>
    </ErrorBoundary>);

}