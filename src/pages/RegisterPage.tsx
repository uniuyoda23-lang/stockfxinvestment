import { useState, useEffect, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Logo } from '../components/investment/Logo';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { setCurrentUserFromProfile, apiRegister } from '../lib/session';
import { generateOTP, storeOTP, verifyOTP, deleteOTP, getOTPAttempts } from '../lib/otpService';
interface RegisterPageProps {
  onNavigate: (page: string) => void;
}
export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Verification flow
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [codeInput, setCodeInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendOtpError, setSendOtpError] = useState<string | null>(null);

  useEffect(() => {
    let t: number | undefined;
    if (resendCooldown > 0) {
      t = window.setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => {
      if (t) clearTimeout(t);
    };
  }, [resendCooldown]);

  const sendVerificationCode = async (toEmail: string) => {
    setSendOtpError(null);
    setIsLoading(true);
    try {
      // Generate OTP
      const otp = generateOTP();
      
      // Store OTP locally for verification
      storeOTP(toEmail, otp);

      // Send OTP via email API
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: toEmail,
          otp: otp,
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.error || responseData.details || 'Failed to send OTP email');
      }

      setResendCooldown(60);
      console.info('✅ OTP sent to', toEmail);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to send OTP. Please check your email address and try again.';
      setSendOtpError(errorMessage);
      console.error('❌ Error sending OTP:', err);
      deleteOTP(toEmail);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSendOtpError(null);
    
    // Validate form
    if (!firstName || !lastName || !email || !password) {
      setSendOtpError('Please fill in all fields');
      return;
    }

    await sendVerificationCode(email);
    setStep('verify');
    setCodeInput('');
  };

  const handleVerify = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!codeInput.trim()) {
      setVerifyError('Please enter the verification code');
      return;
    }

    setIsVerifying(true);
    setVerifyError(null);

    try {
      // Verify OTP
      if (!verifyOTP(email, codeInput.trim())) {
        const attempts = getOTPAttempts(email);
        if (attempts === 0) {
          setVerifyError('Too many incorrect attempts. Please request a new code.');
        } else {
          setVerifyError(`Invalid code. ${attempts} attempt${attempts !== 1 ? 's' : ''} remaining.`);
        }
        setIsVerifying(false);
        return;
      }

      // OTP verified! Now register the user
      const name = `${firstName} ${lastName}`.trim();
      console.log('📝 REGISTERING USER WITH:');
      console.log('  Name:', name);
      console.log('  Email:', email);
      console.log('  Password: ***');
      const user = await apiRegister(name, email, password);
      console.log('✅ REGISTRATION SUCCESSFUL, GOT BACK:', user);
      setCurrentUserFromProfile(user);
      
      // Navigate to dashboard
      onNavigate('dashboard');
    } catch (err: any) {
      setVerifyError(err?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setVerifyError(null);
    await sendVerificationCode(email);
  };
  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div
          className="flex justify-center mb-6 cursor-pointer"
          onClick={() => onNavigate('landing')}>

          <div className="animate-logo-entrance">
            <Logo size="xl" />
          </div>
        </div>
        <h2 className="mt-2 text-center text-3xl font-bold tracking-tight text-slate-900">
          {t('register.title')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {t('register.subtitle')}{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-medium text-emerald-600 hover:text-emerald-500">

            {t('register.haveAccount')}
          </button>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border border-slate-100">

          {step === 'form' && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <Input label={t('register.firstNameLabel')} placeholder={t('register.firstNamePlaceholder')} required value={firstName} onChange={(e)=>setFirstName(e.target.value)} />
                <Input label={t('register.lastNameLabel')} placeholder={t('register.lastNamePlaceholder')} required value={lastName} onChange={(e)=>setLastName(e.target.value)} />
              </div>

              <Input
                label={t('register.emailLabel')}
                type="email"
                placeholder={t('register.emailPlaceholder')}
                required
                leftIcon={<Mail className="h-5 w-5" />}
                value={email}
                onChange={(e)=>setEmail(e.target.value)} />


              <Input
                label={t('register.passwordLabel')}
                type="password"
                placeholder={t('register.passwordPlaceholder')}
                required
                leftIcon={<Lock className="h-5 w-5" />}
                helperText={t('register.passwordHelper')}
                value={password}
                onChange={(e)=>setPassword(e.target.value)} />

              {sendOtpError && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{sendOtpError}</p>
                </div>
              )}

              <div className="flex items-start">
                <div className="flex h-5 items-center">
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />

                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="font-medium text-slate-700">
                    {t('register.termsLabel')}{' '}
                    <a
                      href="#"
                      className="text-emerald-600 hover:text-emerald-500">

                      {t('register.terms')}
                    </a>{' '}
                    {t('register.and')}{' '}
                    <a
                      href="#"
                      className="text-emerald-600 hover:text-emerald-500">

                      {t('register.privacy')}
                    </a>
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={isLoading}>

                {t('register.createButton')}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {t('register.verifyTitle')}
                </h3>
                <p className="text-sm text-slate-600">
                  We sent a verification code to <span className="font-medium text-slate-900">{email}</span>
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleVerify}>
                <Input
                  label="Verification Code"
                  placeholder={t('register.verifyPlaceholder')}
                  required
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  autoComplete="off"
                />

                {verifyError && (
                  <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{verifyError}</p>
                  </div>
                )}

                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    isLoading={isVerifying}>
                    {t('register.verifyButton')}
                  </Button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('form');
                        setCodeInput('');
                        setVerifyError(null);
                        deleteOTP(email);
                      }}
                      className="text-slate-600 hover:text-slate-900 font-medium">
                      {t('register.changeEmail')}
                    </button>

                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0}
                      className="text-emerald-600 hover:text-emerald-700 disabled:text-slate-400 font-medium">
                      {resendCooldown > 0 ? `${t('register.resendCooldown').replace('{{seconds}}', String(resendCooldown))}` : t('register.resendCode')}
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
                  </div>
                </div>
              </div>
            );
          }