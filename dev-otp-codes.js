// Pre-generated OTP codes for testing
// Any user can verify with any of these codes
export const VALID_OTP_CODES = [
  '12345',
  '54321',
  '99999',
  '11111',
  '77777',
  '22222',
  '33333',
  '66666',
  '88888',
  '44444',
];

// In-memory store for sent OTPs (tracks which code was sent to which email)
let sentOTPs = {};

const OTP_EXPIRY_TIME = 10 * 60 * 1000; // 10 minutes

export function getSentOTP(email) {
  return sentOTPs[email];
}

export function sendOTPCode(email) {
  // Pick a random code from the valid list
  const code = VALID_OTP_CODES[Math.floor(Math.random() * VALID_OTP_CODES.length)];
  
  // Store it with timestamp
  sentOTPs[email] = {
    code,
    sentAt: Date.now(),
  };

  // Auto-cleanup after expiry
  setTimeout(() => {
    delete sentOTPs[email];
  }, OTP_EXPIRY_TIME);

  return code;
}

export function isOTPExpired(email) {
  const otp = sentOTPs[email];
  if (!otp) return true;
  return Date.now() > otp.sentAt + OTP_EXPIRY_TIME;
}

export function clearOTP(email) {
  delete sentOTPs[email];
}
