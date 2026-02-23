# Centralized Database Migration Guide

## Overview

All backend services now use a **centralized Supabase PostgreSQL database** instead of separate SQLite/JSON files. This ensures:

✅ User data persists across all services  
✅ Real-time data consistency  
✅ Simplified management  
✅ Easy scaling  

---

## What's Changing

| Before | After |
|--------|-------|
| Auth backend: `lowdb` (JSON file) | All backends: Supabase PostgreSQL |
| Dashboard backend: SQLite | |
| Account service: Prisma + local DB | |
| OTP service: In-memory | |

---

## Setup Steps

### Step 1: Update Supabase Schema

Run the centralized schema SQL in your Supabase dashboard:

1. Go to [Supabase Console](https://app.supabase.com)
2. Select your **stockfx-investment** project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of `SUPABASE_CENTRALIZED_SCHEMA.sql` from this repo
6. Click **Run**

Expected: All tables created successfully

### Step 2: Get Your Supabase Credentials

From Supabase, copy:
- **Project URL** → `SUPABASE_URL`
- **Anon Key** → `SUPABASE_ANON_KEY`
- **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### Step 3: Update Backend Environment Variables

Create or update `.env` in each backend folder:

**`server/.env`** (Auth backend):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
PORT=3000
NODE_ENV=development
```

**`user-dashboard-backend/.env`** (Dashboard):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
NODE_ENV=development
```

**`server/user-account-service/.env`** (Account service):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3002
NODE_ENV=development
```

**`gateway/.env`** (Gateway):
```env
GATEWAY_PORT=4000
AUTH_SERVICE_URL=http://localhost:3000
DASHBOARD_SERVICE_URL=http://localhost:3001
ACCOUNT_SERVICE_URL=http://localhost:3002
OTP_SERVICE_URL=http://localhost:3003
CORS_ORIGIN=http://localhost:5173
```

### Step 4: Install Supabase Client

Each backend needs the Supabase JavaScript client:

```bash
npm install @supabase/supabase-js dotenv
```

### Step 5: Update Backend Code

Replace database operations with the shared DB module.

#### Example: Auth Backend (`server/index.js`)

**Before:**
```javascript
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');

const db = new Low(new JSONFile('db.json'));
await db.read();

// Create user
db.data.users.push({ email, passwordHash });
await db.write();
```

**After:**
```javascript
import { dbUser, dbUserAccount } from '../lib/sharedDb.js';

// Create user
const user = await dbUser.create(email, passwordHash, name);
const account = await dbUserAccount.create(user.id);
```

#### Dashboard Backend Updates

**Before:**
```javascript
db.run('INSERT INTO users (email, balance) VALUES (?, ?)', [email, 0]);
```

**After:**
```javascript
import { dbUser, dbUserAccount } from '../lib/sharedDb.js';

const user = await dbUser.create(email, passwordHash, name);
const account = await dbUserAccount.create(user.id, 0);
```

---

## Shared Database Module API

### Users

```javascript
import { dbUser } from '../lib/sharedDb.js';

// Create
await dbUser.create(email, passwordHash, name);

// Get by email
const user = await dbUser.findByEmail(email);

// Get by ID
const user = await dbUser.findById(userId);

// Update
await dbUser.update(userId, { name: 'New Name' });

// List all
const users = await dbUser.list(limit, offset);
```

### Accounts

```javascript
import { dbUserAccount } from '../lib/sharedDb.js';

// Create account for user
await dbUserAccount.create(userId, initialBalance);

// Get account
const account = await dbUserAccount.getByUserId(userId);

// Update balance
await dbUserAccount.updateBalance(userId, newBalance);
```

### Transactions

```javascript
import { dbTransaction } from '../lib/sharedDb.js';

// Record a trade
await dbTransaction.create(userId, {
  type: 'buy',
  symbol: 'AAPL',
  quantity: 10,
  price: 150,
  amount: 1500,
});

// Get user transactions
const txs = await dbTransaction.getByUserId(userId);
```

### Portfolio

```javascript
import { dbPortfolio } from '../lib/sharedDb.js';

// Add/update holding
await dbPortfolio.upsert(userId, {
  symbol: 'AAPL',
  quantity: 10,
  average_cost: 150,
  current_price: 155,
});

// Get portfolio
const holdings = await dbPortfolio.getByUserId(userId);
```

### OTP

```javascript
import { dbOtp } from '../lib/sharedDb.js';

// Create OTP
await dbOtp.create(email, '123456', expiresInMinutes);

// Verify OTP
const result = await dbOtp.verify(email, '123456');
```

### Sessions

```javascript
import { dbSession } from '../lib/sharedDb.js';

// Create session
await dbSession.create(userId, jwtToken, expiresInHours);

// Verify session
const session = await dbSession.findByToken(token);
```

---

## Data Migration (Optional)

If you have existing data in SQLite/JSON files, migrate it:

```javascript
// Example: Migrate userserfrom old SQLite to Supabase
const sqlite3 = require('sqlite3');
const { dbUser } = require('../lib/sharedDb.js');

const oldDb = new sqlite3.Database('users.db');

oldDb.all('SELECT * FROM users', async (err, rows) => {
  for (const row of rows) {
    await dbUser.create(row.email, row.password_hash, row.name);
  }
  console.log('Migration complete!');
});
```

---

## Testing

### 1. Verify Schema
```bash
# In Supabase SQL Editor
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
```

### 2. Test User Persistence

```bash
# Terminal 1: Start gateway
cd gateway && npm run dev

# Terminal 2: Start auth backend
cd server && npm start

# Terminal 3: Start dashboard backend
cd user-dashboard-backend && npm start

# Terminal 4: Test
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass","name":"Test User"}'

# User should now be visible in Supabase and accessible from all backends
```

### 3. Cross-Backend Verification

Register a user in the auth backend → Retrieve the same user in the dashboard backend:

```javascript
// Auth backend creates user
const user = await dbUser.create('test@example.com', hashedPass, 'Test');

// Dashboard backend reads same user
const sameUser = await dbUser.findByEmail('test@example.com');
// sameUser.id === user.id ✓
```

---

## Production Checklist

- [ ] Supabase project created and schema deployed
- [ ] Environment variables configured in all backends
- [ ] Database credentials are in `.env` (not `.env.example`)
- [ ] Rate limiting enforced at gateway level
- [ ] RLS policies enabled (see commented section in schema)
- [ ] Backups scheduled in Supabase
- [ ] Data migrated from legacy databases (if needed)
- [ ] Tested user persistence across all services
- [ ] Deployed to production (Vercel, etc.)

---

## Benefits

| Area | Before | After |
|------|--------|-------|
| **Data Consistency** | Manual sync | Automatic |
| **Scalability** | Limited to single server | Scales with Supabase |
| **Reliability** | Single point of failure | Redundant Supabase infra |
| **Real-time** | Polling required | Supabase real-time subscriptions |
| **Backups** | Manual | Automatic in Supabase |
| **Security** | Basic | Supabase RLS + auth |

---

## Troubleshooting

**Error: "Missing Supabase credentials"**
- Check `.env` has `SUPABASE_URL` and at least one key
- Restart backend after adding env vars

**Error: "Connection timeout"**
- Verify Supabase project is running (not paused)
- Check `SUPABASE_URL` is correct
- Test connection: `curl https://your-project.supabase.co/rest/v1/`

**Data not persisting**
- Verify tables exist: `SELECT * FROM users;` in Supabase SQL editor
- Check backend logs for SQL errors
- Ensure correct service role key is in `.env`

**Users not visible across services**
- Users should be created with `dbUser.create()` on all backends
- Check Supabase console → Tables → users → data
- Verify all backends are pointing to same Supabase project

---

## Next Steps

1. ✅ Run `SUPABASE_CENTRALIZED_SCHEMA.sql` in Supabase
2. ✅ Get credentials from Supabase  
3. ✅ Update `.env` in all backends
4. ✅ Install `@supabase/supabase-js` in each backend
5. ✅ Update backend code to import from `lib/sharedDb.js`
6. ✅ Test user persistence across services
7. ✅ Deploy with confidence!

For questions, check Supabase docs: https://supabase.com/docs
