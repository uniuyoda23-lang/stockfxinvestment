# Complete Setup Guide: Register on Vercel & Persist in MongoDB

## Overview

Your StockFx app now supports **two storage modes**:

| Mode | Storage | Use Case | Persistence |
|------|---------|----------|-------------|
| **Local Dev** | File (`users.json`) | Testing locally | Per session |
| **Production** | MongoDB Atlas | Vercel deployment | ✅ Permanent |

---

## Step 1: Create MongoDB Atlas Account (Free)

### 1.1 Sign Up
1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"**
3. Sign up with email or Google
4. Verify email

### 1.2 Create Free Cluster
1. Click **"Create a Deployment"**
2. Choose **"Free" tier** (M0 - 512MB storage)
3. Select **AWS** provider
4. Pick region closest to your users
5. Click **"Create Deployment"**
6. Wait 2-3 minutes for initialization

---

## Step 2: Create Database User & Get Connection String

### 2.1 Create User
1. In MongoDB Atlas dashboard, go to **"Security" → "Database Access"**
2. Click **"Add New Database User"**
3. Set:
   - **Username**: `admin_user`
   - **Password**: Click **"Autogenerate Secure Password"** (copy it!)
   - **Privileges**: "Atlas admin"
4. Click **"Add User"**

### 2.2 Get Connection String
1. Go to **"Deployment" → "Database"**
2. Click **"Connect"** button
3. Select **"Drivers"** (NOT "Database Tools")
4. Choose **Node.js** from dropdown
5. Copy the connection string:
   ```
   mongodb+srv://admin_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>` with your actual password** (no angle brackets)

**Example:**
```
mongodb+srv://admin_user:MySecurePassword123@cluster0.a1b2c3.mongodb.net/stockfx?retryWrites=true&w=majority
```

---

## Step 3: Configure Local Environment

### 3.1 Update `.env.local`
Create or update this file in your project root:

```env
# MongoDB Connection (for production on Vercel)
MONGODB_URI=mongodb+srv://admin_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stockfx?retryWrites=true&w=majority

# Email OTP Verification
GMAIL_USER=your-email@gmail.com
GMAIL_PASSWORD=your-app-password

# JWT Secret
JWT_SECRET=your-super-secret-key-here-change-this
```

**Important:** Never commit `.env.local` to GitHub (already in `.gitignore`)

### 3.2 Test Local Connection
1. Make sure MongoDB cluster is **running** in Atlas
2. Start auth server:
   ```bash
   cd auth-backend
   npm run dev
   ```
3. Look for message:
   ```
   ✅ MongoDB connected - using cloud database
   ```
   OR
   ```
   ℹ️  No MONGODB_URI provided - using file-based storage
   ```

Both are fine! If MongoDB is not available locally, it falls back to file storage.

---

## Step 4: Deploy to Vercel

### 4.1 Add Environment Variables to Vercel
1. Go to **Vercel Dashboard** → Your **StockFx project**
2. Click **"Settings"** → **"Environment Variables"**
3. Add these variables:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your full MongoDB connection string |
| `GMAIL_USER` | your-email@gmail.com |
| `GMAIL_PASSWORD` | your-app-password |
| `JWT_SECRET` | any-random-secret-string |

4. Make sure all are visible in **Production**, **Preview**, and **Development**
5. Click **"Save"**

### 4.2 Redeploy on Vercel
1. Go to **"Deployments"** tab
2. Find your latest deployment → Click **"Redeploy"**
3. Wait for deployment to complete
4. Check function logs for MongoDB connection message

---

## Step 5: Test Registration on Vercel

### 5.1 Register a New User
1. Go to your **Vercel deployment link** (e.g., `https://stockfx.vercel.app`)
2. Click **"Register"** tab
3. Fill in:
   - **First Name**: John
   - **Last Name**: Doe
   - **Email**: test@example.com
   - **Password**: SecurePass123
4. Click **"Create Account"**
5. **Check email for OTP code** (6 digits)
6. Enter the code and verify
7. You should be redirected to dashboard ✅

### 5.2 Verify Data in MongoDB Atlas
1. Go to **MongoDB Atlas Dashboard**
2. Click **"Collections"** → **"stockfx"** → **"users"**
3. You should see your registered user:
   ```json
   {
     "_id": "...",
     "email": "test@example.com",
     "name": "John Doe",
     "password": "$2a$10$hashed...",
     "balance": 0,
     "createdAt": "2026-02-20T..."
   }
   ```

### 5.3 Check Admin Dashboard
Your Vercel link should also have admin access:

1. Press `Ctrl+Shift+A` on the Vercel site
2. Login with:
   - **Email**: `adminkingsley@gmail.com`
   - **Password**: `Kingsley2000`
3. **You should see your newly registered user** in the table! ✅

---

## How It Works

### System Architecture
```
User Registers on Vercel
        ↓
POST https://your-vercel-app.com/api/send-otp
        ↓
Email OTP sent
        ↓
User enters OTP code
        ↓
POST https://your-vercel-app.com/auth/register
        ↓
Auth backend validates & stores in MongoDB Atlas
        ↓
Data is PERSISTENT ✅
        ↓
Admin fetches users via /auth/users API
        ↓
Shows all users from MongoDB in dashboard
```

### Local Development
```
Same flow, but:
- If MONGODB_URI is set → Uses MongoDB
- If MONGODB_URI is NOT set → Falls back to users.json
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
**Local development:**
- Verify `MONGODB_URI` in `.env.local` is correct
- Check MongoDB Atlas cluster is **Active** (not paused)
- Ensure password has no special characters (or URL-encode them)

**Vercel:**
- Verify environment variables are set in Vercel dashboard
- Click **"Redeploy"** after adding environment variables
- Check Vercel function logs for connection errors

### "Users don't persist after Vercel restart"
- This is expected with file storage
- **Solution**: Set up MongoDB (users in Atlas persist forever)
- Verify `MONGODB_URI` is in Vercel environment

### "OTP email not sending"
- Check `GMAIL_USER` and `GMAIL_PASSWORD` are correct
- Verify Gmail account has **2FA enabled** and **App Password** generated
- Check `.env.local` for typos

### "Admin dashboard shows no users"
- In Vercel, verify users were actually registered (check Vercel logs)
- Confirm auth backend is running on Vercel
- Check MongoDB Atlas has the users in the collection

---

## Quick Reference

### File Locations
```
stockfx-investment/
├── .env.local ⭐ (Add MongoDB URI here)
├── vercel.json (References environment variables)
├── auth-backend/
│   ├── package.json (Uses server-hybrid.js)
│   ├── src/
│   │   ├── server-hybrid.js ⭐ (New: supports MongoDB or file)
│   │   ├── server-simple.js (Old: file-only)
│   │   └── server.js (Mongoose-only)
│   └── users.json (Local file storage - ignored on Vercel)
└── src/
    └── pages/AdminDashboardPage.tsx (Fetches from /auth/users)
```

### API Endpoints
```
POST /auth/register      → Create new user
POST /auth/login         → Login with email/password
GET  /auth/users         → List all users (admin)
POST /auth/user/balance  → Update user balance
POST /auth/user/name     → Update user name
POST /auth/user/notify   → Send notification
GET  /api/health         → Check server status
```

---

## Summary

| Step | Status |
|------|--------|
| 1. Create MongoDB Atlas account | ✅ Free |
| 2. Get connection string | ✅ Easy |
| 3. Set `.env.local` with MongoDB URI | ✅ Done |
| 4. Add env vars to Vercel | ✅ Required |
| 5. Register user on Vercel | ✅ Works |
| 6. Verify in MongoDB | ✅ Data persists |
| 7. Check admin dashboard | ✅ User appears |

---

## Next Steps

1. **Create MongoDB Atlas account** (if not already done)
2. **Copy connection string** with password
3. **Add to `.env.local`**
4. **Set environment variables** in Vercel dashboard
5. **Redeploy** on Vercel
6. **Register a test user** on your Vercel link
7. **Verify user appears** in admin dashboard

**That's it! Users will now persist permanently on Vercel.** 🎉
