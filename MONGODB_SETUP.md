# MongoDB Setup Guide for StockFx Production

## Problem: File Storage Doesn't Work on Vercel
- ❌ Vercel is **serverless** (no persistent filesystem)
- ❌ `users.json` file is deleted after each deployment
- ❌ Users registered on Vercel don't persist

## Solution: Cloud Database (MongoDB)
- ✅ Free tier: 512MB storage (covers thousands of users)
- ✅ Automatically synced across all servers
- ✅ Works on Vercel + localhost
- ✅ Secure with connection strings

---

## Step 1: Create Free MongoDB Account

1. Go to **https://www.mongodb.com/cloud/atlas**
2. Click **"Try Free"**
3. Sign up with email
4. Create an organization (name: StockFx or similar)
5. Click **"Create a Deployment"**

---

## Step 2: Create a Cluster

1. Choose **"Free" tier** (M0)
2. Select **AWS** as provider
3. Choose a region (closest to you or users)
4. Click **"Create Deployment"**
5. Wait 2-3 minutes for cluster to initialize

---

## Step 3: Generate Connection String

### Create Database User:
1. In MongoDB Atlas dashboard, go to **"Security" → "Database Access"**
2. Click **"Add New Database User"**
3. Set:
   - **Username**: `admin_user`
   - **Password**: Generate strong password (copy it!)
   - **User Privileges**: "Atlas admin"
4. Click **"Add User"**

### Get Connection String:
1. Go to **"Deployment" → "Databases"**
2. Click **"Connect"** on your cluster
3. Select **"Node.js"**
4. Copy the connection string:
   ```
   mongodb+srv://admin_user:<password>@cluster0.xxxxx.mongodb.net/stockfx?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password

---

## Step 4: Configure Environment Variables

### Local Development (`.env.local`)
```env
MONGODB_URI=mongodb+srv://admin_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/stockfx?retryWrites=true&w=majority
GMAIL_USER=your-gmail@gmail.com
GMAIL_PASSWORD=your-app-password
JWT_SECRET=your-secret-key-here
```

### Vercel Deployment
1. Go to your Vercel project settings
2. Click **"Environment Variables"**
3. Add:
   - **Key**: `MONGODB_URI`
   - **Value**: Your full connection string
   - **Environments**: Production, Preview, Development
4. Also add:
   - `GMAIL_USER`
   - `GMAIL_PASSWORD`
   - `JWT_SECRET`

---

## Step 5: Database Connection (Already Configured)

The auth backend (`auth-backend/src/server.js`) is already set up to use MongoDB:

```javascript
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/authdb';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`Server on port ${PORT}`));
  })
  .catch(err => console.error('MongoDB error:', err));
```

Just set the `MONGODB_URI` environment variable and it will automatically connect.

---

## Step 6: Test Connection Locally

1. **Add MongoDB URI to `.env.local`:**
   ```env
   MONGODB_URI=mongodb+srv://admin_user:yourpassword@cluster0.xxxxx.mongodb.net/stockfx?retryWrites=true&w=majority
   ```

2. **Start auth backend:**
   ```bash
   cd auth-backend
   npm run dev
   ```

3. **Check logs:**
   ```
   ✅ MongoDB connected
   ✅ Auth server running on http://localhost:4000
   ```

4. **Register a test user** and verify collection is created in MongoDB Atlas

---

## Step 7: Deploy to Vercel

1. **Ensure environment variables are set** in Vercel dashboard
2. **Deploy:**
   ```bash
   git add -A
   git commit -m "feat: Add MongoDB production database"
   git push
   ```
3. **Vercel will auto-deploy**
4. **Monitor logs** in Vercel dashboard

---

## How It Works

### Registration Flow
```
User Registers
        ↓
POST /auth/register
        ↓
Check for duplicate email in MongoDB ← Query user collection
        ↓
Hash password with bcryptjs
        ↓
Create new user document
        ↓
Save to MongoDB ✅ (persisted!)
        ↓
Return JWT token
        ↓
Admin dashboard fetches users
        ↓
GET /auth/users → Query MongoDB
        ↓
Shows all registered users ✅
```

---

## Data Structure

### Users Collection (MongoDB)
```json
{
  "_id": ObjectId("..."),
  "email": "user@example.com",
  "password": "$2a$10$hashed...",
  "name": "User Name",
  "balance": 0,
  "createdAt": "2026-02-20T10:30:00Z",
  "status": "active",
  "verified": true
}
```

---

## File Structure (No More JSON Files)

```
BEFORE (Local-only):
auth-backend/
├── users.json ❌ (lost on Vercel redeploy)
└── src/
    └── server-simple.js

AFTER (Cloud Database):
auth-backend/
├── src/
│   ├── server.js ✅ (uses MongoDB)
│   ├── models/user.js (Mongoose schema)
│   └── routes/auth.js (API endpoints)
└── package.json
```

---

## Troubleshooting

### "Cannot connect to MongoDB"
- ✅ Check connection string in `.env.local`
- ✅ Verify MongoDB Atlas IP whitelist (should allow all: 0.0.0.0/0)
- ✅ Check password has no special chars (or URL-encode them)

### "Users not showing after Vercel deployment"
- ✅ Verify `MONGODB_URI` is set in Vercel environment
- ✅ Check Redeployment triggered after adding env vars
- ✅ View Vercel function logs for MongoDB errors

### "Failed to register - Database error"
- ✅ Ensure MongoDB cluster is active (not paused)
- ✅ Check network connectivity from Vercel to MongoDB
- ✅ Verify user has correct permissions

---

## Security Checklist

- ✅ Use strong MongoDB password (auto-generated)
- ✅ Enable IP whitelist (MongoDB Atlas → Security → Network Access)
- ✅ Use environment variables (never commit credentials)
- ✅ Hash passwords with bcryptjs (already done)
- ✅ Update vercel.json with MongoDB URI reference

---

## Summary

| Feature | Dev (Local) | Production (Vercel) |
|---------|------------|-------------------|
| Storage | MongoDB (same as prod) | MongoDB Atlas |
| Persistence | ✅ Full | ✅ Full |
| Admin Dashboard | ✅ Shows all users | ✅ Shows all users |
| Scaling | N/A | Automatic |
| Cost | Free tier | Free (512MB) |

---

## Next Steps

1. Create MongoDB Atlas account
2. Get connection string
3. Add to `.env.local`
4. Deploy to Vercel
5. Register users on Vercel link
6. View in admin dashboard ✅

**All users registered on Vercel will persist and be visible in the admin dashboard!**
