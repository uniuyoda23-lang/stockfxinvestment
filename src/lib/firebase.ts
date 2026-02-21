import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBDIK2wATxtLesDpbc1ZtIeTSFiCONG55c",
  authDomain: "stockfx-investment.firebaseapp.com",
  projectId: "stockfx-investment",
  storageBucket: "stockfx-investment.firebasestorage.app",
  messagingSenderId: "827847409452",
  appId: "1:827847409452:web:13616c958038c32f47f689",
  measurementId: "G-XBDJWK7X16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

export default app;
