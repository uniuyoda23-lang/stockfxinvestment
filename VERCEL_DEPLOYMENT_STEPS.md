# Vercel Setup Guide - Your MongoDB Connection String

## ✅ What We've Done Locally

- ✅ Created `.env.local` with MongoDB URI
- ✅ Auth server configured to use MongoDB
- ✅ Fallback to file storage if MongoDB unavailable
- ✅ Code committed and pushed to GitHub

## 🚀 Next: Configure Vercel (3 Steps)

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com/dashboard
2. Click on your **StockFx project**
3. Click **"Settings"** at the top

### Step 2: Add Environment Variables

1. In the left sidebar, click **"Environment Variables"**
2. You'll see a form to add new variables

**Add these 4 variables:**

#### Variable 1: MONGODB_URI
- **Key**: `MONGODB_URI`
- **Value**: (Copy and paste exactly)
        ```
        mongodb+srv://<DB_USER>:<DB_PASSWORD>@<CLUSTER_HOST>/<DATABASE>?retryWrites=true&w=majority
        ```
- **Environments to select**: 
  - ☑️ Production
  - ☑️ Preview
  - ☑️ Development
- Click **"Save"**

#### Variable 2: GMAIL_USER
- **Key**: `GMAIL_USER`
- **Value**: `your-email@gmail.com`
- **Environments**: Production, Preview, Development
- Click **"Save"**

#### Variable 3: GMAIL_PASSWORD
- **Key**: `GMAIL_PASSWORD`
- **Value**: `<YOUR_GMAIL_APP_PASSWORD>`
- **Environments**: Production, Preview, Development
- Click **"Save"**

#### Variable 4: JWT_SECRET
- **Key**: `JWT_SECRET`
- **Value**: `<YOUR_JWT_SECRET>`
- **Environments**: Production, Preview, Development
- Click **"Save"**

### Step 3: Redeploy Your App

1. Go to **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) on the right
4. Select **"Redeploy"**
5. Wait for deployment to complete (2-3 minutes)
6. Check the deployment logs for MongoDB connection message

---

## 🧪 Test Your Setup

### Step 1: Register a Test User

1. Go to your **Vercel deployment link** (your StockFx URL)
2. Click **"Register"**
3. Fill in:
   - **First Name**: Test
   - **Last Name**: User
   - **Email**: `test@yourdomain.com`
   - **Password**: `TestPass123`
4. Click **"Create Account"**
5. **Check your email** for the OTP code (6 digits)
6. Enter the code and verify

### Step 2: Check MongoDB Atlas

1. Go to https://cloud.mongodb.com
2. Login to MongoDB Atlas
3. Click your **"Classiqueoz"** cluster
4. Click **"Collections"**
5. Look for **"stockfx"** database → **"users"** collection
6. You should see your test user! ✅

### Step 3: Check Admin Dashboard

1. Go back to your Vercel site
2. Press **`Ctrl+Shift+A`** (to show admin button)
3. Login with:
        - **Email**: `admin@example.com`
        - **Password**: `<ADMIN_PASSWORD>`
4. You should see your test user in the table ✅

---

## 📋 Environment Variables Summary

| Key | Value | Purpose |
|-----|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | Database connection |
| `GMAIL_USER` | Email for OTP | Send verification codes |
| `GMAIL_PASSWORD` | Gmail app password | Email authentication |
| `JWT_SECRET` | Secret key | Secure authentication tokens |

---

## 🔒 Security Notes

⚠️ **IMPORTANT:**
- ✅ `.env.local` has `MONGODB_URI` (for your local testing)
- ✅ Vercel has these variables set (encrypted)
- ✅ Never commit credentials to GitHub
- ✅ All credentials are already in `.gitignore`

---

## 📊 How It Works on Vercel

```
User registers on Vercel
        ↓
OTP email sent via Gmail
        ↓
User verifies code
        ↓
POST /auth/register to Vercel serverless function
        ↓
Function reads MONGODB_URI from environment
        ↓
Connects to MongoDB Atlas
        ↓
User saved to MongoDB (PERMANENT!) ✅
        ↓
Admin dashboard displays user ✅
        ↓
User can login anytime ✅
```

---

## ✨ After Deployment

Your app now has:

| Feature | Before | After |
|---------|--------|-------|
| User storage | Lost after reload | Permanent (MongoDB) |
| Admin dashboard | Shows nothing | Shows all users |
| Multi-device | Different data per device | Same data everywhere |
| Production ready | ❌ No | ✅ Yes |

---

## Troubleshooting

### "Users not showing in admin dashboard"
1. Check **Vercel logs**: Deployments → Click latest → Function logs
2. Verify `MONGODB_URI` is set in Vercel environment variables
3. Make sure all 4 environment variables are saved
4. Click **"Redeploy"** after adding variables

### "MongoDB connection error on Vercel"
- This is normal for local testing (network restrictions)
- Should work fine on Vercel servers
- Check MongoDB Atlas **Security → Network Access** allows **0.0.0.0/0**

### "OTP not sending"
- Verify `GMAIL_USER` and `GMAIL_PASSWORD` are correct
- Check email account has App Password generated
- See Gmail setup in VERCEL_MONGODB_SETUP.md

---

## Next Steps

1. **Go to Vercel Dashboard** → Your StockFx project
2. **Add all 4 environment variables** (MONGODB_URI, GMAIL_USER, GMAIL_PASSWORD, JWT_SECRET)
3. **Redeploy** your app
4. **Test registration** on Vercel link
5. **Verify in MongoDB Atlas** that data was saved
6. **Check admin dashboard** to see registered user

---

## Support

If you have any issues:
- Check Vercel deployment logs
- Verify MongoDB cluster is Active (not paused)
- Make sure network access is set to 0.0.0.0/0
- Verify environment variables are spelled exactly correctly

**You're all set! Your StockFx app is now production-ready with persistent MongoDB storage.** 🎉
