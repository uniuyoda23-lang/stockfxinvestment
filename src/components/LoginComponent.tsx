// React Component Example - OTP Login Flow
import React, { useState } from 'react';
import { authService } from '../services/authService';

export function LoginComponent() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.requestOTP(email);
    
    if (result.success) {
      setSuccess('OTP sent! Check your email.');
      setStep('otp');
    } else {
      setError(result.error || 'Failed to send OTP');
    }
    
    setLoading(false);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await authService.verifyOTP(email, otp);
    
    if (result.success) {
      setSuccess('Login successful! Redirecting...');
      // Redirect or update app state
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      setError(result.error || 'Failed to verify OTP');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>StockFX Login</h2>
      
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {step === 'email' ? (
        <form onSubmit={handleRequestOTP}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP}>
          <div className="form-group">
            <label>Email (continued)</label>
            <input type="email" value={email} disabled />
          </div>
          <div className="form-group">
            <label>Verification Code (6 digits)</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button
            type="button"
            onClick={() => setStep('email')}
            disabled={loading}
          >
            Back
          </button>
        </form>
      )}
    </div>
  );
}
