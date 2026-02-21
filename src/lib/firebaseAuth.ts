import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth, firestore } from './firebase';

// Register user with Firebase
export async function registerUser(email: string, password: string, name: string) {
  try {
    console.log('🚀 Starting Firebase registration for:', email);
    
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth created:', user.uid);

    // Save additional user data to Firestore
    const userData = {
      id: user.uid,
      email: user.email,
      name: name || email,
      balance: 0,
      createdAt: new Date(),
      status: 'active',
      registrationStatus: 'confirmed'
    };
    
    console.log('💾 Saving user data to Firestore:', userData);
    await setDoc(doc(firestore, 'users', user.uid), userData);
    console.log('✅ User saved to Firestore successfully!');

    return {
      id: user.uid,
      email: user.email,
      name: name || email
    };
  } catch (error: any) {
    console.error('❌ Firebase registration error:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    throw new Error(error.message);
  }
}

// Login user with Firebase
export async function loginUser(email: string, password: string) {
  try {
    console.log('🔓 Attempting Firebase login for:', email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('✅ Firebase Auth login successful:', user.uid);

    // Get user data from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const userData = userDoc.data();
    console.log('📄 User data from Firestore:', userData);

    return {
      id: user.uid,
      email: user.email,
      name: userData?.name || email,
      balance: userData?.balance || 0
    };
  } catch (error: any) {
    console.error('❌ Firebase login error:', {
      code: error.code,
      message: error.message,
      fullError: error
    });
    throw new Error(error.message);
  }
}

// Logout user
export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Get current user
export async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe();
      if (user) {
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        const userData = userDoc.data();
        resolve({
          id: user.uid,
          email: user.email,
          name: userData?.name || user.email,
          balance: userData?.balance || 0
        });
      } else {
        resolve(null);
      }
    }, reject);
  });
}

// Get all users (admin)
export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(firestore, 'users'));
    const users: any[] = [];
    querySnapshot.forEach((doc) => {
      users.push({
        ...doc.data(),
        id: doc.id
      });
    });
    return users;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Update user balance
export async function updateUserBalance(userId: string, newBalance: number) {
  try {
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, { balance: newBalance }, { merge: true });
    return { balance: newBalance };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// Get single user
export async function getUserById(userId: string) {
  try {
    const userDoc = await getDoc(doc(firestore, 'users', userId));
    if (userDoc.exists()) {
      return {
        ...userDoc.data(),
        id: userDoc.id
      };
    }
    return null;
  } catch (error: any) {
    throw new Error(error.message);
  }
}
