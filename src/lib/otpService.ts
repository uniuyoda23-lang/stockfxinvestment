// OTP Management Service - Frontend
export interface StoredOTP {
  email: string;
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
}

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes
const MAX_ATTEMPTS = 5;
const STORAGE_KEY = 'pending_otps';

/**
 * Generate a random 6-digit OTP
 */
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Store OTP in localStorage with expiry and attempt tracking
 */
export const storeOTP = (email: string, code: string): void => {
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    otps[email] = {
      email,
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + OTP_EXPIRY_TIME,
      attempts: 0,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(otps));
  } catch (e: unknown) {
    console.error('Failed to store OTP', e);
  }
};

/**
 * Verify user-entered OTP against stored OTP
 */
export const verifyOTP = (email: string, code: string): boolean => {
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const otp = otps[email];

    if (!otp) return false;

    // Check if OTP expired
    if (Date.now() > otp.expiresAt) {
      deleteOTP(email);
      return false;
    }

    // Check max attempts
    if (otp.attempts >= MAX_ATTEMPTS) return false;

    // Check code
    if (otp.code !== code) {
      otp.attempts++;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(otps));
      return false;
    }

    // Valid!
    deleteOTP(email);
    return true;
  } catch (e: unknown) {
    console.error('Failed to verify OTP', e);
    return false;
  }
};

/**
 * Get remaining attempts for an OTP
 */
export const getOTPAttempts = (email: string): number => {
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const otp = otps[email];
    return otp ? MAX_ATTEMPTS - otp.attempts : 0;
  } catch (e: unknown) {
    return 0;
  }
};

/**
 * Check if OTP is expired
 */
export const isOTPExpired = (email: string): boolean => {
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    const otp = otps[email];
    return !otp || Date.now() > otp.expiresAt;
  } catch (e: unknown) {
    return true;
  }
};

/**
 * Delete OTP from storage
 */
export const deleteOTP = (email: string): void => {
  try {
    const otps = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    delete otps[email];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(otps));
  } catch (e: unknown) {
    console.error('Failed to delete OTP', e);
  }
};
