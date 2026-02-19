#!/usr/bin/env node

/**
 * Script to fetch all registered users from localStorage data
 * This reads the demo_users from the browser storage dump
 */

const fs = require('fs');
const path = require('path');

console.log('📋 StockFx User Data Fetcher\n');
console.log('=' .repeat(60));

// Since this is a client-side app, we can't directly access localStorage from Node.js
// But we can guide the user or create a manual dump

console.log('\n✅ Users are stored in browser localStorage under key: "demo_users"\n');

console.log('📍 Storage Location:');
console.log('   File: src/lib/userStore.ts');
console.log('   Method: loadPersistedUsers() / persistUsers()\n');

console.log('👤 User Structure (UserRecord):');
console.log(`{
  id: string;
  name: string;
  email: string;
  password?: string;           // Optional, plaintext (dev only)
  status: 'active' | 'blocked';
  createdAt: string;           // ISO 8601 date
  balance: number;             // USD amount
  notifications: string[];     // Array of messages
  registrationStatus: 'pending' | 'confirmed';
  verified: boolean;
}\n`);

console.log('🔍 To view all users:\n');
console.log('Option 1 - Browser DevTools Console:');
console.log('  1. Open http://localhost:5174/');
console.log('  2. Press F12 to open DevTools');
console.log('  3. Go to Console tab');
console.log('  4. Run: console.table(JSON.parse(localStorage.getItem("demo_users")) || [])\n');

console.log('Option 2 - Application/Storage Tab:');
console.log('  1. Open DevTools (F12)');
console.log('  2. Go to Application → Local Storage → http://localhost:5174');
console.log('  3. Click "demo_users" to view all registered users\n');

console.log('=' .repeat(60));
console.log('\n📝 Current App Status:');
console.log('   - Demo users: REMOVED (empty on startup)');
console.log('   - New registrations: Saved to browser localStorage');
console.log('   - Persistence key: "demo_users"');
console.log('   - Current user key: "currentUser"');
console.log('\n✨ Register a user and check DevTools to see them stored!\n');
