# Render Deployment Checklist

## Pre-Deployment Checklist

Before deploying to Render, ensure:

### ✅ Code & Git
- [ ] All code changes committed to Git
- [ ] Code pushed to GitHub
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] `render.yaml` configured (optional, but helps)

### ✅ Build Configuration
- [ ] `npm run build` works locally
- [ ] Frontend builds to `dist/` folder
- [ ] All dependencies in `package.json`

### ✅ Backend Configuration
- [ ] `dev-api-server.js` runs without errors
- [ ] `GMAIL_USER` and `GMAIL_PASSWORD` ready
- [ ] Port 3001 configured

### ✅ Frontend Configuration
- [ ] Firebase credentials ready
- [ ] Supabase URL and keys ready
- [ ] API endpoint configured correctly

### ✅ Credentials Ready
- [ ] GMAIL_USER: officialstockfxinvestment@gmail.com
- [ ] GMAIL_PASSWORD: ufsh hyxm nhls uphn
- [ ] Firebase credentials from `.env.local`

---

## Render Setup Steps

### Step 1: Create Render Account
- [ ] Go to https://render.com
- [ ] Sign up with GitHub or email
- [ ] Verify email

### Step 2: Deploy Frontend (Static Site)
- [ ] Click "New +" → "Static Site"
- [ ] Connect GitHub repo
- [ ] Name: `stockfx-frontend`
- [ ] Build Command: `npm run build`
- [ ] Publish Directory: `dist`
- [ ] Add all environment variables
- [ ] Click "Create Static Site"

### Step 3: Deploy Backend (Web Service)
- [ ] Click "New +" → "Web Service"
- [ ] Connect GitHub repo
- [ ] Name: `stockfx-api`
- [ ] Runtime: Node
- [ ] Build Command: `npm install`
- [ ] Start Command: `node dev-api-server.js`
- [ ] Add environment variables
- [ ] Click "Create Web Service"

### Step 4: Verify Deployment
- [ ] Frontend loads at `https://stockfx-frontend.onrender.com`
- [ ] Backend responds at `https://stockfx-api.onrender.com`
- [ ] Check both services' logs for errors

---

## Testing After Deployment

### Registration Test
- [ ] Visit frontend URL
- [ ] Click "Register"
- [ ] Fill in test user details
- [ ] Check email for OTP
- [ ] Enter OTP code
- [ ] Should see dashboard

### API Test
- [ ] Send POST to `/send-otp` endpoint
- [ ] Verify email arrives
- [ ] Check backend logs for success

### Integration Test
- [ ] Register new user through frontend
- [ ] User appears in Supabase dashboard
- [ ] User can log in on different browser

---

## Environment Variables Summary

### Frontend (Render Static Site)
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

### Backend (Render Web Service)
```
GMAIL_USER=officialstockfxinvestment@gmail.com
GMAIL_PASSWORD=ufsh hyxm nhls uphn
PORT=3001
NODE_ENV=production
```

---

## Monitoring

### Check Logs
1. Go to Render Dashboard
2. Click on service
3. Click "Logs" to see real-time output

### Common Issues
- **Build failed**: Check build logs, ensure all dependencies installed
- **OTP not sending**: Verify Gmail credentials in Render env vars
- **404 errors**: Check that API URL is correct in frontend

### Performance
- **Free tier**: Services spin down after 15 minutes of inactivity
- **Cold start**: First request takes 10-30 seconds to wake up
- **Upgrade to Starter**: $5/month gets 24/7 uptime

---

## After Successful Deployment

You now have:
- ✅ Frontend running at: `https://stockfx-frontend.onrender.com`
- ✅ Backend API running at: `https://stockfx-api.onrender.com`
- ✅ Database connected to Supabase
- ✅ Email service working
- ✅ Authentication fully functional

### Share Your App
- Give frontend URL to users
- They can register, get OTP via email, and access dashboard
- All data persists in Supabase

---

## Updating Your App

After making changes:

1. **Commit & Push to GitHub**
   ```bash
   git add .
   git commit -m "Your message"
   git push
   ```

2. **Render Automatically Redeploys**
   - Check dashboard to see deployment progress
   - Frontend rebuilds from `dist/` folder
   - Backend restarts with new code

3. **Manual Redeploy** (if needed)
   - Go to service dashboard
   - Click "Manual Deploy"
   - Select the commit to deploy

---

## Support

- **Render Docs**: https://render.com/docs
- **Common Issues**: https://render.com/docs/troubleshooting
- **Scaling**: https://render.com/docs/limits
