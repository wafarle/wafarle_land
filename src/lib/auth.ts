'use client';

import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { auth, FIREBASE_ENABLED } from '@/lib/firebase';

// Authentication functions
export const signInAdmin = async (email: string, password: string) => {
  if (!FIREBASE_ENABLED || !auth) {
    // Mock admin user for development
    if (email === 'admin@wafarle.com' && password === 'admin123') {
      return { 
        uid: 'mock-admin',
        email: 'admin@wafarle.com',
        displayName: 'Admin User'
      } as User;
    }
    throw new Error('Invalid credentials');
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOutAdmin = async () => {
  if (!FIREBASE_ENABLED || !auth) {
    return Promise.resolve();
  }

  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const getCurrentUser = (): User | null => {
  if (!FIREBASE_ENABLED || !auth) {
    return null;
  }
  return auth.currentUser;
};

export const onAuthStateChange = (callback: (user: User | null) => void) => {
  if (!FIREBASE_ENABLED || !auth) {
    // Call callback with null user when Firebase is disabled
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
};

// Check if user is admin
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  // In a real app, you would check custom claims or user roles
  // For now, we'll check if the email is admin@wafarle.com
  return user.email === 'admin@wafarle.com';
};


