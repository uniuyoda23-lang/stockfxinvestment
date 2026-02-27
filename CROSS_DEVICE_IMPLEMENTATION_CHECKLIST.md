# Cross-Device Sync Implementation Checklist

## Database Setup

- [ ] **Run SQL Migration**
  - Open Supabase Dashboard → SQL Editor
  - Copy & paste contents of `CROSS_DEVICE_SCHEMA.sql`
  - Run the query
  - Verify tables are created: `devices`, `device_sessions`, `session_events`

- [ ] **Verify RLS Policies**
  - Check that Row Level Security is enabled on all 3 new tables
  - Verify policies allow users to read/update their own devices

- [ ] **Check Indexes**
  - Confirm these indexes exist for performance:
    - `idx_devices_active`
    - `idx_sessions_valid`
    - `idx_events_user_time`

## Dependencies

- [ ] **Install Required Packages**
  ```bash
  npm install ua-parser-js
  npm install --save-dev @types/ua-parser-js
  ```

- [ ] **Verify Existing Packages**
  - `@supabase/supabase-js` ✓
  - `jsonwebtoken` ✓
  - `nodemailer` ✓

## Files Created/Modified

### New Files Created
- [ ] `src/services/deviceManager.ts` - Core device management
- [ ] `src/hooks/useSessionSync.ts` - Real-time sync hooks
- [ ] `api/register-device.ts` - Device registration endpoint
- [ ] `api/manage-devices.ts` - Device management endpoint
- [ ] `src/components/DeviceManagement.tsx` - Example UI component
- [ ] `CROSS_DEVICE_SCHEMA.sql` - Database schema
- [ ] `CROSS_DEVICE_SYNC_GUIDE.md` - Complete documentation

### Files Modified
- [ ] `src/services/authService.ts`
  - Added device registration to `verifyOTP()`
  - Added `getActiveDevices()` method
  - Added `removeDevice()` method
  - Added `logoutFromAllDevices()` method
  - Added `syncDataAcrossDevices()` method
  - Added device info storage methods

- [ ] `api/verify-otp.ts`
  - Added device registration during OTP verification
  - Stores device session in database

- [ ] `src/context/AuthContext.tsx`
  - Added session sync hooks
  - Added device management state
  - Added logout detection
  - Added `activeDevices`, `devicesLoading`, `removeDevice`, `logoutFromAllDevices`

## Environment Variables

- [ ] **Verify Vercel/Backend Variables**
  ```env
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_KEY=your-service-key
  JWT_SECRET=your-32-char-secret-key
  GMAIL_USER=your-email@gmail.com
  GMAIL_PASSWORD=your-app-password
  ```

- [ ] **Verify Frontend Variables (.env.local)**
  ```env
  REACT_APP_API_URL=https://your-vercel-app.vercel.app
  ```

## Testing

### Manual Testing
- [ ] **Test Device Registration**
  1. Open app in browser
  2. Login with OTP
  3. Check Supabase → `devices` table
  4. Verify device entry created with correct info

- [ ] **Test Multiple Devices**
  1. Login on Device A (Chrome Desktop)
  2. Open app in different browser (Firefox) on same machine
  3. Login again
  4. Verify both devices appear in the list
  5. Check `devices` table has 2 entries with different user agents

- [ ] **Test Device Details**
  1. Login and check stored device info
  2. Verify device_type, browser, os are correct
  3. Check last_active timestamp updates

- [ ] **Test Remove Device**
  1. Get active devices list
  2. Click remove on one device
  3. Verify device is removed from list
  4. Check `devices.is_active = false` in database
  5. Check `device_sessions.is_active = false`

- [ ] **Test Logout from All Devices**
  1. Login on Device A
  2. Login on Device B
  3. Click "Logout from All Devices" on Device A
  4. Try accessing app on Device B
  5. Verify you're logged out immediately

- [ ] **Test Real-Time Sync**
  1. Open app on Device A and Device B simultaneously
  2. Call `authService.syncDataAcrossDevices()` on Device A
  3. Verify Device B receives sync event
  4. Check `session_events` table for events

### Automated Testing
- [ ] **Test API Endpoints**
  ```bash
  # Register device
  curl -X POST http://localhost:3000/api/register-device \
    -H "Content-Type: application/json" \
    -d '{"userId": "your-uuid", "deviceId": "test-device", ...}'

  # Get devices (requires JWT token)
  curl -X GET http://localhost:3000/api/manage-devices \
    -H "Authorization: Bearer your-token"

  # Logout from all (requires JWT token)
  curl -X POST http://localhost:3000/api/manage-devices \
    -H "Authorization: Bearer your-token" \
    -d '{"action": "logout_all"}'
  ```

## Code Integration

### Login Component
- [ ] Update login component to show device info during registration
- [ ] Add loading state during device registration
- [ ] Show error if device registration fails

### Dashboard/Home
- [ ] Add link/button to "Manage Devices" page
- [ ] Show current device name in header
- [ ] Display logout warning if logged out on another device

### Settings Page
- [ ] Add "Active Devices" section
- [ ] Show device list with last active time
- [ ] Add "Remove Device" buttons
- [ ] Add "Logout from All Devices" button

### Navigation
- [ ] Add route `/settings/devices` for device management
- [ ] Add route `/devices` for standalone device view
- [ ] Protect routes with auth check

## Deployment

### Vercel Deployment
- [ ] **Deploy Backend **
  1. Push changes to git
  2. Vercel automatically deploys `/api` folder
  3. Verify 3 new endpoints are available:
     - `/api/register-device`
     - `/api/manage-devices`
     - `/api/verify-otp` (updated)

- [ ] **Set Environment Variables**
  1. Go to Vercel Project Settings
  2. Add all required environment variables
  3. Redeploy to apply changes

### Frontend Deployment
- [ ] **Build & Test Locally**
  ```bash
  npm run build
  npm start
  ```

- [ ] **Push to Production**
  1. Commit all changes
  2. Push to main branch
  3. Vercel auto-deploys
  4. Test on production URL

## Monitoring

### Supabase Monitoring
- [ ] **Check Realtime Logs**
  - Monitor `session_events` for new events
  - Verify subscription is working

- [ ] **Review Database Metrics**
  - Monitor table sizes
  - Check query performance
  - Review indexes usage

### Error Logging
- [ ] **Check Browser Logs**
  - Look for device registration errors
  - Monitor real-time sync failures
  - Check token expiry issues

- [ ] **Review Server Logs**
  - Check Vercel function logs
  - Look for API errors
  - Monitor rate limiting

## Post-Deployment

- [ ] **Verify Everything Works**
  1. Test device registration end-to-end
  2. Test cross-device sync
  3. Test logout from all devices
  4. Test real-time updates

- [ ] **Monitor User Feedback**
  - Check for device registration issues
  - Monitor session stability
  - Track any logout problems

- [ ] **Optimize Performance**
  1. Check database query times
  2. Optimize indexes if needed
  3. Review subscription performance

- [ ] **Security Review**
  1. Verify RLS policies are working
  2. Check token expiry is enforced
  3. Review CORS settings
  4. Test device removal actually blocks access

## Rollback Plan

If issues occur:

- [ ] **Keep old code backed up**
- [ ] **Don't delete old tables** - add prefix like `old_users`
- [ ] **DB rollback steps**:
  1. Download Supabase backup
  2. Reset to previous snapshot
  3. Revert code changes
  4. Test thoroughly

- [ ] **Gradual Rollout**
  1. Deploy to staging first
  2. Test with limited users
  3. Monitor logs closely
  4. Deploy to production once confident

## Documentation

- [ ] **README Updates**
  - Add section about cross-device features
  - Link to `CROSS_DEVICE_SYNC_GUIDE.md`
  - Add architecture diagram

- [ ] **Inline Comments**
  - Add JSDoc comments to main functions
  - Explain device registration flow
  - Document hook usage

- [ ] **User Guide**
  - Create user-facing docs about device management
  - Explain how to remove devices
  - Explain logout from all devices

## Success Criteria

✅ **All items checked** means:
- Database schema is deployed
- All new files are created
- All modified files are updated
- Endpoints are working
- Real-time sync is functional
- UI components are integrated
- Tests pass
- Documentation is complete
- Monitoring is in place

---

## Quick Start Script

```bash
# 1. Install dependencies
npm install ua-parser-js

# 2. Verify database migration
# Go to Supabase → SQL Editor → Run CROSS_DEVICE_SCHEMA.sql

# 3. Check environment variables
# Review .env.local and Vercel settings

# 4. Test locally
npm run dev

# 5. Build and test
npm run build
npm start

# 6. Deploy to Vercel
git push origin main

# 7. Verify on production
# Test login on multiple browsers
# Check devices appear in list
# Test remove device functionality
```

---

**Status Indicator:**
- 🟢 **Green** - Complete and tested
- 🟡 **Yellow** - Partially complete
- 🔴 **Red** - Not started

Keep updating this checklist as you progress!
