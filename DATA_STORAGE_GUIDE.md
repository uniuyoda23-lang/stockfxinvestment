# Data Storage System Guide

## Overview
The StockFx application uses a dual-layer data storage system:
- **Backend Storage** (JSON file): Persistent user data
- **Frontend Storage** (localStorage): Session and UI state

## Architecture

### 1. **Backend Storage (Primary - `auth-backend/users.json`)**
When users register via the frontend, data is stored here:

```
POST http://localhost:4000/auth/register
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "hashed-password"
}
```

**Stored fields:**
- `id` - Unique identifier (timestamp-based)
- `email` - User email address
- `name` - User full name
- `password` - Hashed with bcryptjs
- `balance` - Account balance (default 0)
- `createdAt` - Registration timestamp

**File location:** `auth-backend/users.json`

### 2. **Frontend Storage (Session - localStorage)**
Used for current user session state:

```json
{
  "currentUser": {...},      // Currently logged-in user
  "auth_token": "...",        // Session token
  "demo_users": [...]         // Fallback demo users
}
```

## How Registration Works

### Flow Diagram
```
User Registers (Mobile/Web)
        ↓
Frontend validates input
        ↓
POST /api/send-otp → Email verification
        ↓
Verify OTP code
        ↓
POST /auth/register → Backend creates user
        ↓
User stored in auth-backend/users.json ✅
        ↓
Token stored in localStorage
        ↓
Admin Dashboard fetches from backend
```

## Admin Dashboard Data Flow

### Before Fix
```
Admin Dashboard
        ↓
getUsers() from localStorage ❌
        ↓
Only showed demo/test users
```

### After Fix
```
Admin Dashboard
        ↓
apiListUsers() calls backend
        ↓
GET /auth/users → Reads from auth-backend/users.json ✅
        ↓
Shows all registered users including mobile registrations
```

## Running the Complete Stack

### Start Both Servers
```bash
# Terminal 1: Start auth backend (collects registration data)
cd auth-backend
npm run dev
# Runs on http://localhost:4000

# Terminal 2: Start frontend dev server
npm run dev
# Runs on http://localhost:5173 + http://localhost:3001 (OTP server)
```

### Test Registration
1. **Register on mobile/web:** Go to http://localhost:5173 → Register
2. **Enter details:** Email, password, etc.
3. **Verify OTP:** Check email for verification code
4. **Confirm registration:** User saved to `auth-backend/users.json`

### Check Admin Dashboard
1. **Access admin:** Press `Ctrl+Shift+A` on any page
2. **Admin login:** `adminkingsley@gmail.com` / `Kingsley2000`
3. **View users:** All registered users now appear from the backend
4. **Manage users:** Update balance, send notifications, block/delete

## Data Persistence

### Users are permanently stored in:
```
auth-backend/users.json
```

This file survives:
- ✅ Page refreshes
- ✅ Browser restarts
- ✅ Server restarts
- ✅ Multiple browser tabs

## Troubleshooting

### "No users showing in admin dashboard"
1. **Is auth server running?** (`npm run dev` in auth-backend folder)
2. **Check port 4000:** `http://localhost:4000/auth/users` should return user list
3. **Fallback working?** Dashboard shows local users if backend is down

### "User appears on mobile but not in admin"
1. **Make sure both servers are running:**
   - Frontend on port 5173
   - Auth backend on port 4000
   - OTP server on port 3001
2. **Refresh admin dashboard** after registering
3. **Check browser console** for API errors

### "Lost all users after restart"
1. Users are saved in `auth-backend/users.json` - **NOT** deleted on restart
2. Check the file still exists: `auth-backend/users.json`
3. If file missing, users must be re-registered

## Environment Variables

### Required for Email OTP
File: `.env.local`
```
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password
```

### Backend Connection
Default: `http://localhost:4000`
Can be customized: Set `VITE_API_BASE` in `.env.local`

## Production Deployment (Vercel)

### Vercel Configuration (`vercel.json`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "GMAIL_USER": "@gmail_user",
    "GMAIL_PASSWORD": "@gmail_password"
  }
}
```

### Important
- **File-based storage** (`users.json`) works locally but is **lost on Vercel redeploy**
- For production, migrate to **MongoDB** or **Firebase**
- See [Production Database Setup](./ADMIN_GUIDE.md#database)

## File Structure
```
stockfx-investment/
├── src/
│   ├── pages/
│   │   ├── RegisterPage.tsx      ← Frontend registration form
│   │   └── AdminDashboardPage.tsx ← Admin user management
│   └── lib/
│       ├── session.ts            ← API calls: apiListUsers(), apiRegister()
│       └── userStore.ts          ← localStorage management
│
├── auth-backend/
│   ├── src/
│   │   ├── server-simple.js      ← Backend server (port 4000)
│   │   ├── routes/auth.js        ← /auth/register, /auth/login, /auth/users
│   │   └── models/user.js        ← User schema
│   └── users.json                ← Persistent user database ⭐
│
├── dev-api-server.js             ← OTP email server (port 3001)
└── .env.local                    ← Gmail credentials
```

## Summary
- ✅ Registration data stored **permanently** in `auth-backend/users.json`
- ✅ Admin dashboard fetches from **backend API** (not localStorage)
- ✅ Mobile registrations **visible in admin dashboard**
- ✅ Data persists across restarts
- ⚠️ File-based storage: Good for dev, use database for production
