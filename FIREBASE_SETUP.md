# Firebase Setup Guide - StockFx Investment

## Successfully Migrated to Firebase! 🎉

You've successfully switched from MongoDB to Firebase. Here's what's been set up:

---

## What's Installed

✅ **Firebase SDK** - All necessary Firebase packages installed
✅ **Firebase Config** - Stored in `src/lib/firebase.ts`
✅ **Firebase Auth** - User authentication functions in `src/lib/firebaseAuth.ts`
✅ **Updated Session Management** - `src/lib/session.ts` now uses Firebase
✅ **Admin Dashboard** - Ready to fetch users from Firestore

---

## How It Works Now

### 1. **Registration & Login**
- Users register → Database: Firebase Auth + Firestore
- No more file storage or MongoDB needed
- Works on Vercel, localhost, and mobile automatically

### 2. **User Data Storage**
- **Firebase Auth**: Stores passwords securely (encrypted)
- **Firestore Database**: Stores user profiles (email, name, balance, etc.)

### 3. **Admin Dashboard**
- Automatically fetches all users from Firestore
- Can update balances, send notifications
- All changes sync in real-time

---

## Next Steps

### 1. **Start Your Dev Server**
```bash
npm run dev
```

### 2. **Test Registration**
1. Go to http://localhost:5173
2. Click "Register"
3. Create an account with any email/password
4. You should be logged in

### 3. **Check Admin Dashboard**
1. Press `Ctrl+Shift+A` (to show admin button)
2. Login with:
   - **Email**: `adminkingsley@gmail.com`
   - **Password**: `Kingsley2000`
3. You should see your newly registered user!

---

## File Structure

```
src/lib/
├── firebase.ts          ← Firebase config & initialization
├── firebaseAuth.ts      ← All Auth & Firestore functions
├── session.ts           ← Updated to use Firebase
└── userStore.ts         ← Local fallback storage
```

---

## Firebase Configuration

Your Firebase project is already configured with:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBDIK2wATxtLesDpbc1ZtIeTSFiCONG55c",
  authDomain: "stockfx-investment.firebaseapp.com",
  projectId: "stockfx-investment",
  storageBucket: "stockfx-investment.firebasestorage.app",
  messagingSenderId: "827847409452",
  appId: "1:827847409452:web:13616c958038c32f47f689"
};
```

---

## Key Features

### ✅ User Registration
```typescript
import { registerUser } from './lib/firebaseAuth';

const user = await registerUser('email@example.com', 'password', 'John Doe');
```

### ✅ User Login
```typescript
import { loginUser } from './lib/firebaseAuth';

const user = await loginUser('email@example.com', 'password');
```

### ✅ Get All Users (Admin)
```typescript
import { getAllUsers } from './lib/firebaseAuth';

const users = await getAllUsers();
```

### ✅ Update Balance
```typescript
import { updateUserBalance } from './lib/firebaseAuth';

await updateUserBalance('userId', 5000);
```

---

## Troubleshooting

### Issue: "Permission denied" in Firestore
**Solution**: Check Firestore security rules (they should be in test mode for development)
1. Go to Firebase Console → Firestore Database
2. Click "Rules" tab
3. Should allow all reads/writes for testing

### Issue: Users not appearing in admin dashboard
**Solution**: 
1. Make sure you're logged in as the admin
2. Check browser console for errors (F12)
3. Verify at least one user is registered

### Issue: Registration fails
**Solution**:
1. Check that Firebase config is correct in `src/lib/firebase.ts`
2. Verify Firestore Database is enabled in Firebase Console
3. Check browser console (F12) for specific error messages

---

## Migrating from Old Systems

If you have users in the old system:
- CSV/JSON from MongoDB → Can be imported as a Firestore collection
- Users registered locally → Can be manually migrated  
- See Firebase Console → Data Import tools

---

## Production Deployment (Vercel)

When deploying to Vercel:

1. **No Environment Variables Needed** - Firebase config is public (safe to include in code)
2. **Just Deploy** - Everything works automatically
3. **That's It!** - Firebase handles scaling, backups, security

---

## Security Notes

- Firebase handles password encryption automatically (never stored in plaintext)
- Firestore has built-in protection for production
- When ready for production, update security rules:

```javascript
// Production Rules (in Firebase Console)
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only admins can read all users
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
```

---

## Need Help?

### Firebase Documentation
- **Getting Started**: https://firebase.google.com/docs/web/setup
- **Authentication**: https://firebase.google.com/docs/auth
- **Firestore**: https://firebase.google.com/docs/firestore

### Your Firebase Console
- **URL**: https://console.firebase.google.com
- **Project**: stockfx-investment

---

**Last Updated**: February 21, 2026
**Status**: ✅ Ready for Development
