# OTP Email Authentication Setup Guide

## Overview
This guide explains how to set up the OTP email authentication system for StockFX registration.

## Architecture
- **Frontend**: React with OTP verification UI
- **Email Service**: Vercel Serverless Functions with Gmail SMTP
- **Storage**: localStorage for OTP management

## Setup Steps

### Step 1: Install Dependencies
```bash
npm install
```
This installs `nodemailer` which is required for the email API.

### Step 2: Get Gmail App Password

1. Go to [Gmail App Passwords](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows Computer"
3. Google will generate a 16-character app password
4. Copy this password (you'll need it in Step 3)

> ⚠️ **Important**: This is NOT your regular Gmail password. This is a special app-specific password for authentication.

### Step 3: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and fill in your Gmail credentials:
   ```
   GMAIL_USER=your-gmail@gmail.com
   GMAIL_PASSWORD=your-16-char-app-password
   ```

> ⚠️ **Security**: Never commit `.env.local` to Git. It's already in `.gitignore`.

### Step 4: Test Locally

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the registration page

3. Fill in registration form and submit

4. You should receive a verification email from your Gmail account

### Step 5: Deploy to Vercel

1. Push your code to GitHub (with `.env.local` in `.gitignore`)

2. Connect your Vercel project

3. Add environment variables in Vercel dashboard:
   - Go to **Settings → Environment Variables**
   - Add `GMAIL_USER` and `GMAIL_PASSWORD`

## Files Modified/Created

### New Files:
- `src/lib/otpService.ts` - OTP management logic
- `api/send-otp.ts` - Vercel serverless function for sending emails (now also purges expired/verified codes)
- `.env.local.example` - Environment template
- `supabase/migrations/002_cleanup_expired_otps.sql` - optional trigger to delete old OTPs on insert

### Database Changes:
- `otp_codes` table now includes RLS policy restricting access to the service role only.
- A cleanup trigger can be installed (see migration above) to automatically remove expired or used codes.

### Updated Files:
- `src/pages/RegisterPage.tsx` - Integrated real OTP system
- `package.json` - Added nodemailer dependency

## How It Works

1. **User Registration**:
   - User submits registration form
   - `sendVerificationCode()` generates 6-digit OTP
   - OTP stored in localStorage with 10-minute expiry
   - API call sends OTP via Gmail SMTP

2. **OTP Verification**:
   - User enters OTP in verification form
   - `verifyOTP()` checks against stored OTP
   - If valid → Complete registration → Navigate to dashboard
   - If invalid → Show error with remaining attempts (max 5)

3. **Resend OTP**:
   - User can resend code (60-second cooldown)
   - New OTP generated and sent to email

## Features

- ✅ 6-digit random OTP generation
- ✅ 10-minute OTP expiration
- ✅ Maximum 5 verification attempts
- ✅ 60-second resend cooldown
- ✅ Beautiful HTML email template
- ✅ Error handling with user-friendly messages
- ✅ Responsive UI following StockFX design system
- ✅ Clean Tailwind CSS styling

## Troubleshooting

### Email Not Received
- Check spam/junk folder
- Verify Gmail credentials are correct
- Ensure "Less secure app access" is disabled (using App Password instead)

### "Failed to send OTP" Error
- Check that `GMAIL_USER` and `GMAIL_PASSWORD` are set correctly
- Verify environment variables are available in Vercel deployment
- Check Vercel logs for detailed error messages

### "Too many incorrect attempts"
- Refresh the page to start with a new OTP
- Clear localStorage if needed

## Testing Email Sending (Development)

To test the email API locally without full registration:
```javascript
// In browser console
fetch('/api/send-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    otp: '123456'
  })
}).then(r => r.json()).then(console.log);
```

## Security Notes

- 🔒 Passwords stored in plaintext (dev only)
- 🔒 OTP stored in browser localStorage
- 🔐 Gmail App Password never exposed in frontend
- 🔐 Email validation on backend
- 🔐 Rate limiting should be added for production

## Next Steps

- Add database persistence for OTPs (production)
- Implement rate limiting to prevent abuse
- Add SMS as alternative OTP delivery method
- Add account recovery via OTP

## Support

For issues or questions, check the Vercel logs and browser console for detailed error messages.
