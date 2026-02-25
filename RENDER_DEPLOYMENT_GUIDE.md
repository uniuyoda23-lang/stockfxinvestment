# Render Deployment Guide - StockFX Investment Platform

## Overview

This guide will deploy your StockFX app to Render with:
- ✅ Frontend (React/Vite app)
- ✅ Backend API (OTP email service)
- ✅ Supabase (database - already managed)

---

## Prerequisites

1. **GitHub Account** - Your code must be pushed to GitHub
2. **Render Account** - Sign up at https://render.com
3. **Supabase Account** - Already configured
4. **Gmail App Password** - Already set up

---

## Step 1: Connect GitHub to Render

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect to GitHub"**
4. Authorize Render to access your GitHub
5. Find and select your **stockfx investment** repository

---

## Step 2: Deploy Frontend (Static Site)

### Create Static Site for Frontend

1. Click **"New +"** → **"Static Site"**
2. Click **"Connect a GitHub repository"**
3. Select your **stockfx investment** repo
4. Fill in the following settings:

| Setting | Value |
|---------|-------|
| **Name** | `stockfx-frontend` |
| **Root Directory** | `.` (leave empty) |
| **Build Command** | `npm run build` |
| **Publish Directory** | `dist` |

5. Click **"Create Static Site"**

### Add Environment Variables (Frontend)

1. Click **"Environment"** in left sidebar
2. Add these variables:

```
VITE_API_BASE=https://stockfx-api.onrender.com
VITE_FIREBASE_API_KEY=AIzaSyBDIK2wATxtLesDpbc1ZtIeTSFiCONG55c
VITE_FIREBASE_AUTH_DOMAIN=stockfx-investment.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=stockfx-investment
VITE_FIREBASE_STORAGE_BUCKET=stockfx-investment.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=827847409452
VITE_FIREBASE_APP_ID=1:827847409452:web:13616c958038c32f47f689
VITE_FIREBASE_MEASUREMENT_ID=G-XBDJWK7X16
```

3. Click **"Save"** for each variable
4. Render will automatically redeploy

---

## Step 3: Deploy Backend (Web Service)

### Create Web Service for API

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Select your **stockfx investment** repo
4. Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `stockfx-api` |
| **Runtime** | `Node` |
| **Root Directory** | `.` |
| **Build Command** | `npm install` |
| **Start Command** | `node dev-api-server.js` |
| **Plan** | `Free` (or Starter for production) |

5. Click **"Create Web Service"**

### Add Environment Variables (Backend)

1. Click **"Environment"** in left sidebar
2. Add these variables:

```
GMAIL_USER=officialstockfxinvestment@gmail.com
GMAIL_PASSWORD=ufsh hyxm nhls uphn
PORT=3001
NODE_ENV=production
```

3. Click **"Save"** for each variable
4. Render will automatically deploy

---

## Step 4: Connect Frontend to Backend

The frontend needs to know the backend URL. Update this:

### In your vite.config.ts (if not already set):

```typescript
server: {
  proxy: {
    '/api': {
      target: 'https://stockfx-api.onrender.com',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
    }
  }
}
```

Or simply ensure the environment variable is set:
```
VITE_API_BASE=https://stockfx-api.onrender.com
```

---

## Step 5: Verify Both Services Are Running

1. **Frontend**: Visit `https://stockfx-frontend.onrender.com`
   - Should see your StockFX landing page
   
2. **Backend**: Visit `https://stockfx-api.onrender.com/send-otp` (POST request)
   - Should be accessible (API endpoint is working)

---

## Step 6: Test the Full Flow

1. Go to your frontend URL: `https://stockfx-frontend.onrender.com`
2. Click **"Register"**
3. Fill in:
   - **First Name**: Test
   - **Last Name**: User
   - **Email**: your-email@gmail.com
   - **Password**: Password123
4. Check your email for OTP code
5. Enter code to verify

---

## Supabase Configuration

Your Supabase database is already hosted. Make sure these are in your environment:

**Frontend needs these:**
```
VITE_FIREBASE_API_KEY=AIzaSyBDIK2wATxtLesDpbc1ZtIeTSFiCONG55c
VITE_FIREBASE_AUTH_DOMAIN=stockfx-investment.firebaseapp.com
...
```

Both use the same Supabase instance configured in:
- `src/lib/supabase.ts` - Database connection
- `.env.local` - Local development

---

## Troubleshooting

### Frontend Not Loading
- Check build logs: View → Logs
- Ensure `npm run build` completes successfully
- Verify Node version is compatible (18+)

### API Not Responding
- Check backend logs: View → Logs
- Ensure `GMAIL_USER` and `GMAIL_PASSWORD` are set
- Check that start command is correct

### OTP Not Sending
- Verify Gmail credentials in Render environment
- Check email service logs in backend

### CORS Errors
- Backend should have `cors()` middleware enabled (it does)
- Check proxy configuration points to correct backend URL

### Database Not Connecting
- Verify Supabase credentials in frontend env vars
- Check network access in Supabase dashboard (should allow all IPs)

---

## Important Notes

⚠️ **Render Free Tier Limitations:**
- Services spin down after 15 minutes of inactivity
- First request will be slow (spinning up service)
- 0.5 GB RAM limit

**Recommendations for Production:**
- Upgrade to **Starter Plan** ($5/month per service)
- Services stay alive 24/7
- Better performance

---

## Deploying Updates

After making code changes:

1. Commit and push to GitHub
2. Render automatically detects changes
3. Backend redeploys automatically
4. Frontend rebuilds and redeploys

You can also manually trigger redeploy:
1. Go to service dashboard
2. Click **"Manual Deploy"** button

---

## URLs for Your Services

| Service | URL |
|---------|-----|
| **Frontend** | `https://stockfx-frontend.onrender.com` |
| **Backend API** | `https://stockfx-api.onrender.com` |
| **Supabase** | Managed (no URL needed - via credentials) |

---

## Next Steps

1. ✅ Push your code to GitHub (if not already)
2. ✅ Create Render account
3. ✅ Deploy frontend as Static Site
4. ✅ Deploy backend as Web Service
5. ✅ Set all environment variables
6. ✅ Test registration flow
7. ✅ Monitor logs for issues

Questions? Check Render's documentation: https://render.com/docs
