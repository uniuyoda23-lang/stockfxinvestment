# Cross-Platform Authentication Setup Guide

## Overview
This setup enables registration and login from web, mobile, and other apps using a single authentication backend with Vercel and Supabase.

## Step 1: Install Dependencies

```bash
npm install jsonwebtoken @supabase/supabase-js nodemailer
npm install --save-dev @types/jsonwebtoken @types/nodemailer
```

## Step 2: Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a project
2. Run the SQL from `SUPABASE_AUTH_SCHEMA.sql` in the SQL Editor
3. Get your credentials:
   - Project URL: Settings → API
   - Service Role Key: Settings → API (service_role)
   - Anon Key: Settings → API (anon)

## Step 3: Environment Variables

### For Vercel (Backend)
Set these in Vercel dashboard → Project Settings → Environment Variables:

```
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password  # Generate from Google Account Security
JWT_SECRET=your-very-secret-key-min-32-chars-long
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Gmail App Password Setup:**
1. Enable 2FA on Google Account
2. Go to Google Account → Security → App passwords
3. Select Mail and Windows Computer
4. Copy the generated 16-character password

### For Frontend
Create `.env.local` in your project root:

```
REACT_APP_API_URL=https://your-project.vercel.app
```

## Step 4: API Endpoints

Your Vercel project now has these endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/send-otp` | POST | Send OTP to email |
| `/api/verify-otp` | POST | Verify OTP & get JWT token |
| `/api/check-auth` | GET | Check if token is valid |

## Step 5: Frontend Integration

### React Example
```typescript
import { authService } from './services/authService';

// Request OTP
const result = await authService.requestOTP('user@example.com');

// Verify OTP
const authResult = await authService.verifyOTP('user@example.com', '123456');
if (authResult.success) {
  console.log('Token:', authResult.token);
  // Store token - authService does this automatically
}

// Check authentication
const isValid = await authService.checkAuth();

// Logout
authService.logout();
```

### Mobile App (Flutter/React Native)
```dart
// Flutter example
final response = await http.post(
  Uri.parse('https://your-project.vercel.app/api/send-otp'),
  headers: {'Content-Type': 'application/json'},
  body: json.encode({'email': 'user@example.com', 'otp': '123456'}),
);

// Store token in secure storage
await FlutterSecureStorage().write(key: 'authToken', value: token);
```

## Step 6: Making Authenticated Requests

All API calls with auth use this pattern:

```typescript
const headers = authService.getAuthHeaders();
// Automatically includes: Authorization: Bearer <token>

const response = await fetch('/api/protected-route', {
  method: 'GET',
  headers: headers,
});
```

## Step 7: Deployment Checklist

- [ ] Supabase schema created
- [ ] Environment variables set in Vercel
- [ ] Environment variables set in frontend `.env.local`
- [ ] nodemailer & jwt dependencies installed
- [ ] Test OTP flow in development
- [ ] Test token verification
- [ ] Test across different domains/apps
- [ ] Enable CORS in Vercel (already set to `*` in all endpoints)

## Security Best Practices

1. **JWT_SECRET**: Use a strong, random 32+ character string
2. **Gmail Password**: Use app-specific password, not account password
3. **CORS**: Currently allows `*` - restrict to specific domains in production:
   ```typescript
   res.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.com');
   ```
4. **Token Storage**:
   - Web: `localStorage` (with XSS protection)
   - Mobile: Use secure storage (Keychain/Keystore)
5. **Token Expiry**: Currently 7 days - adjust as needed in `verify-otp.ts`

## Testing with cURL

```bash
# 1. Request OTP
curl -X POST https://your-project.vercel.app/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# 2. Verify OTP
curl -X POST https://your-project.vercel.app/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "otp": "123456"}'

# 3. Check Auth
curl -X GET https://your-project.vercel.app/api/check-auth \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Gmail SMTP credentials not set" | Check Vercel env vars are deployed |
| "Invalid or expired OTP" | OTP expires in 10 mins; resend new one |
| "Invalid token" | Token expires in 7 days; user must re-login |
| CORS errors on mobile | Update `Access-Control-Allow-Origin` if needed |
| Email not received | Check Gmail Security settings & app password |

## File Structure
```
api/
  ├── send-otp.ts        # Request OTP
  ├── verify-otp.ts      # Verify & issue token
  └── check-auth.ts      # Validate token

src/
  ├── services/
  │   └── authService.ts # Frontend auth client
  └── components/
      └── LoginComponent.tsx # React example
```
