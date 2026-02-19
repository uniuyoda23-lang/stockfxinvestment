/// <reference types="vite/client" />
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/investment/Logo';
// import { Navbar } from '../components/investment/Navbar';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { setCurrentUserFromProfile, apiLogin, apiHealth } from '../lib/session';
interface LoginPageProps {
  onNavigate: (page: string) => void;
}
export function LoginPage({ onNavigate }: LoginPageProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState<'unknown'|'checking'|'up'|'down'>('unknown');

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const checkServer = async () => {
    setServerStatus('checking');
    const ok = await apiHealth();
    setServerStatus(ok ? 'up' : 'down');
  };

  // Auto-check server status on mount in development to give quick feedback
  useEffect(() => {
    if (import.meta.env.DEV) {
      checkServer();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const user = await apiLogin(email.toLowerCase().trim(), password);
      setCurrentUserFromProfile(user);
      // Check for admin credentials
      if (
        email.toLowerCase().trim() === 'adminkingsley@gmail.com' &&
        password === 'Kingsley2000'
      ) {
        onNavigate('admin');
      } else {
        onNavigate('dashboard');
      }
    } catch (err: any) {
      const msg = err?.message || 'Login failed';
      setError(msg);
      if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch')) {
        setServerStatus('down');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative pt-32"
      style={{
        background:
          'radial-gradient(ellipse at 10% 10%, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 30%, rgba(16,185,129,0.06) 60%, rgba(14,165,233,0.04) 100%)'
      }}>
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div
          className="flex justify-center mb-6 cursor-pointer"
          onClick={() => onNavigate('landing')}>

          <div className="animate-logo-entrance">
            <Logo size="xl" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
          {t('login.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t('login.subtitle')}{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-medium text-emerald-600 hover:text-emerald-500">
            {t('login.noAccount')}
          </button>
        </p>

        {/* Persistent dev banner for server status (visible when server is down or checking) */}
        {serverStatus !== 'up' && serverStatus !== 'unknown' && (
          <div className={`mt-4 w-full text-center py-2 px-3 rounded ${serverStatus === 'down' ? 'bg-rose-50 border border-rose-100 text-rose-700' : 'bg-amber-50 border border-amber-100 text-amber-700'}`}>
            {/* Removed auth server unreachable and retry message */}
          </div>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label={t('login.emailLabel')}
              type="email"
              placeholder={t('login.emailPlaceholder')}
              required
              leftIcon={<Mail className="h-5 w-5" />}
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
            />

            <Input
              label={t('login.passwordLabel')}
              type="password"
              placeholder={t('login.passwordPlaceholder')}
              required
              leftIcon={<Lock className="h-5 w-5" />}
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
            />

            {error && (
              <div className="text-red-600 text-sm mb-2 text-center">{error}</div>
            )}

            {serverStatus === 'checking' && (
              <div className="text-sm mt-2 text-center text-slate-600">
                <div className="text-xs text-slate-500 mt-1">{t('login.serverChecking')}</div>
              </div>
            )}

            {serverStatus === 'up' && (
              <div className="text-sm mt-2 text-center text-emerald-600">
                {t('login.serverUp')}
              </div>
            )}

            {serverStatus === 'down' && (
              <div className="text-sm mt-2 text-center text-slate-600">
                {/* Message permanently removed */}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}>
              {t('login.signInButton')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">
                  {t('login.thirdParty')}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">{t('login.thirdPartyDisabled')}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => onNavigate('landing')}
            className="text-sm text-slate-500 hover:text-slate-900 flex items-center justify-center mx-auto transition-colors">

            <ArrowLeft className="h-4 w-4 mr-1" />
            {t('login.backToHome')}
          </button>
        </div>
      </div>
    </div>
  );

}