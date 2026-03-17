// This file is deprecated - Firebase auth is now handled in firebaseAuth.ts
// Keeping for backward compatibility but using Firebase directly

import {
  registerUser as firebaseRegisterUser,
  loginUser as firebaseLoginUser,
  getCurrentUser as firebaseGetCurrentUser
} from './firebaseAuth';

// Deprecated - use Firebase directly
export async function registerUser(name: string, email: string, password: string) {
  try {
    return await firebaseRegisterUser(email, password, name);
  } catch (err: any) {
    console.error('Firebase registration failed:', err);
    throw err;
  }
}

// Deprecated - use Firebase directly
export async function loginUser(email: string, password: string) {
  try {
    return await firebaseLoginUser(email, password);
  } catch (err: any) {
    console.error('Firebase login failed:', err);
    throw err;
  }
}

// Deprecated - use Firebase directly
export async function getDashboard(_token: string) {
  try {
    const user = await firebaseGetCurrentUser();
    return user;
  } catch (err: any) {
    console.error('Firebase getDashboard failed:', err);
    throw err;
  }
}
