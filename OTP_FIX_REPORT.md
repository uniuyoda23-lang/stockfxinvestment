# OTP Email Service Fix - SMTP Port 465

## Issue Summary
OTP verification emails were not being sent during user registration. The email service was timing out when attempting to connect to Gmail's SMTP server.

## Root Cause
The original configuration used Gmail's port 587 (STARTTLS/explicit TLS), which was being blocked by the network/ISP/firewall. This resulted in `ETIMEDOUT` errors when establishing the connection.

## Solution
Changed the Gmail SMTP configuration to use **port 465 (implicit TLS)** instead of port 587. This port works reliably within the current network environment.

## Files Modified

### 1. `dev-api-server.js` (lines 24-34)
**Before:**
```javascript
transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
```

**After:**
```javascript
transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});
```

### 2. `api/send-otp.ts` (lines 13-21)
Updated to use the same explicit SMTP configuration with port 465.

**Before:**
```typescript
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
}) as any;
```

**After:**
```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
}) as any;
```

### 3. `test-otp-email.js` (New utility file)
Created a standalone test script to verify OTP email functionality without going through the web UI.

**Usage:**
```bash
node test-otp-email.js           # Test sending to Gmail account
node test-otp-email.js <email>   # Test sending to specific email
```

## Enhanced Error Handling
Also improved error logging and messages in both files to show:
- Server response status
- Detailed error codes and messages
- Clear timeout indicators
- Troubleshooting guidance

## Testing
Run the test script to verify the fix:
```bash
node test-otp-email.js
```

Expected output:
```
✅ SMTP connection verified
✅ Test email sent successfully!
```

## Gmail Configuration Notes
- **Port 465**: Implicit TLS (SSL) - Recommended for this environment
- **Port 587**: Explicit TLS (STARTTLS) - Was timing out in this environment
- **Credentials**: Using Gmail App Password (not regular Gmail password)
  - Required if 2FA is enabled on the Gmail account
  - Generate at: https://myaccount.google.com/apppasswords

## Verification Steps
1. ✅ Email service connects to Gmail SMTP (test-otp-email.js)
2. ✅ OTP emails are sent successfully
3. ✅ Vite dev server running on http://localhost:5173
4. ✅ Express API server running on http://localhost:3001

## Next Steps
Users can now register and receive OTP verification emails at:
`http://localhost:5173/register`

The complete registration flow:
1. User enters email and creates account
2. OTP generated and sent via email (port 465)
3. User receives email and enters verification code
4. Account created and user logged in

---
**Commit:** fix: Use SMTP port 465 for Gmail to resolve connection timeouts
**Date:** 2024
