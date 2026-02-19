# 📊 Registered Users Summary

## Current Status
- **Dev Server**: Running on http://localhost:5174/
- **User Storage**: Browser localStorage (key: `demo_users`)
- **Initial Demo Users**: REMOVED (empty on startup)
- **New Users**: Automatically saved when registered

---

## 🔍 How to View Registered Users

### Method 1: Quick Browser Console (Easiest)
```javascript
// Copy-paste into browser console (F12)
console.table(JSON.parse(localStorage.getItem('demo_users')) || [])
```

### Method 2: View Current Logged-In User
```javascript
// Copy-paste into browser console (F12)
console.log(JSON.parse(localStorage.getItem('currentUser')))
```

### Method 3: Storage Inspector
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Local Storage** → **http://localhost:5174**
4. Look for `demo_users` and `currentUser` keys

---

## 👤 User Data Structure

Each registered user has this structure:

```json
{
  "id": "timestamp-based-id",
  "name": "User Name",
  "email": "user@example.com",
  "password": "plaintext-password",
  "status": "active",
  "createdAt": "2026-02-05T18:30:00.000Z",
  "balance": 0,
  "notifications": [],
  "registrationStatus": "confirmed",
  "verified": true
}
```

---

## 🛠️ User Management

### Add/Edit Users Programmatically
```javascript
// In browser console:
const { setUserBalance, pushUserNotification, getUsers } = await import('./src/lib/userStore.ts');

// Get all users
console.log(getUsers());

// Change a user's balance
setUserBalance('user-id', 5000);

// Send notification to user
pushUserNotification('user-id', 'Welcome bonus applied!');
```

### Via Admin Panel
1. Go to http://localhost:5174/#/admin-login
2. Login with: `adminkingsley@gmail.com` / `Kingsley2000`
3. Manage all users, balances, and notifications

---

## 📁 Related Files

- **User Store**: [src/lib/userStore.ts](../src/lib/userStore.ts)
- **Session Manager**: [src/lib/session.ts](../src/lib/session.ts)
- **Admin Page**: [src/pages/AdminPage.tsx](../src/pages/AdminPage.tsx)
- **Admin Guide**: [ADMIN_GUIDE.md](../ADMIN_GUIDE.md)

---

## 🔐 Important Notes

- ⚠️ Passwords stored in plaintext (dev only)
- 📍 Data persists in browser localStorage only
- 🔄 Data clears if browser localStorage is cleared
- 🌐 This is NOT a real database - for demo/testing only

