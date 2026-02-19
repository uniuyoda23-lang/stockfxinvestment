# Admin Panel Guide

The StockFx Admin Panel allows you to manage users, update balances, and send notifications.

## Accessing the Admin Panel

### From the UI
1. Go to the landing page
2. Click the **Admin** button in the top navigation
3. Enter admin credentials:
   - **Email**: `adminkingsley@gmail.com`
   - **Password**: `Kingsley2000`
4. You'll be redirected to the Admin Dashboard

### From a Logged-In Dashboard
Click the **Admin** button in the top right corner of the dashboard header.

## Features

### 1. User List View
The admin panel displays all registered users with:
- **User Name**: Full name of the registered user
- **Email**: User's email address
- **Current Balance**: User's account balance in USD
- **Click to Expand**: Click any user row to reveal detailed options

### 2. Update User Balance
1. Click on a user to expand their details
2. In the "Update Balance" section, enter a new balance amount
3. Click the **Update** button (with wallet icon)
4. A success message will confirm the balance has been updated
5. The user's dashboard will reflect the new balance immediately

**Note**: This sets the balance to the exact amount entered. It doesn't add or subtract from the current balance.

### 3. Send Notifications
1. Click on a user to expand their details
2. In the "Send Notification" section, enter a message
3. Click the **Send** button (with send icon)
4. A success message will confirm the notification was sent
5. The notification will appear in the user's notifications list on their dashboard

**Example notifications**:
- "Your account has been verified!"
- "Welcome bonus of $100 has been credited!"
- "Your withdrawal request has been processed."
- "System maintenance scheduled for tonight."

### 4. View User Notifications
When a user is expanded, you can see a "Recent Notifications" section showing all messages sent to that user.

### 5. View User Information
When expanded, each user card shows:
- **Account Status**: Current status (Active, Inactive, etc.)
- **Created Date**: When the account was created

## Backend Fallback

If the backend API is unreachable, the admin panel will:
- ✅ Still display all users from local storage
- ✅ Still update balances in the local user store
- ✅ Still send notifications that persist locally

This ensures the admin panel works even during backend downtime for testing purposes.

## Local User Demo Data

Demo users are stored in browser `localStorage` under the key `demo_users`. 

To clear all demo users:
1. Open browser DevTools (F12)
2. Go to **Application** or **Storage** tab
3. Click **Local Storage**
4. Find `demo_users` and delete it
5. Refresh the page

New users will then be able to register as the first demo user.

## Status Messages

- **Green ✓**: Success (Balance updated, Notification sent)
- **Red ✗**: Error (Invalid input, User not found)
- **Auto-dismiss**: Status messages disappear after 3 seconds

## Tips & Tricks

- **Edit balance for testing**: Set a user's balance to different amounts to test various scenarios
- **Send marketing notifications**: Use notifications to communicate promotions or updates to users
- **Verify persistence**: After updating balances or sending notifications, have users log out and back in to verify changes persist
- **Create test scenarios**: Send notifications like "Margin call alert" or "Trade executed" to test dashboard notification UI

## Troubleshooting

### Admin login doesn't work
- Verify email: `adminkingsley@gmail.com`
- Verify password: `Kingsley2000`
- Check browser console for errors (F12)

### Balance update fails
- Check if user email exists
- Ensure amount is a valid number
- Check browser console if error message is unclear

### Notifications don't appear on user dashboard
- Ensure notification message is not empty
- Ask user to refresh their dashboard or log out/in
- Check browser `localStorage` under `currentUser` to verify notification is stored

### Users disappear after page refresh
- Check if `demo_users` was accidentally cleared
- Create test users again via the Register flow
- Users are persisted in `localStorage`, not a real database

## Development Notes

- **File**: `src/pages/AdminPage.tsx` - Admin UI component
- **API Helpers**: `src/lib/session.ts` - Functions for updating balance and sending notifications
- **User Store**: `src/lib/userStore.ts` - Local user data persistence
- **Credentials**: Stored in `src/pages/AdminLoginPage.tsx` - Change for production
- **Port**: Admin panel is part of the main Vite dev server at `http://localhost:5173`

## Security Note ⚠️

**This admin panel is for development/testing only.** In production:
- Use proper authentication (JWT, OAuth, etc.)
- Store admin credentials securely (encrypted, in backend)
- Implement proper authorization checks
- Add audit logging for balance changes
- Secure all API endpoints with authentication
- Use HTTPS
