
"use server";

import { redirect } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

// This is a simplified setup. In a real app, you'd have a more robust initialization.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export async function loginAction(previousState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  // Step 1: Check for hardcoded credentials
  if (username !== 'admin123' || password !== 'admin123') {
    return { message: 'Invalid username or password.' };
  }

  // The email associated with the admin account in Firebase Auth
  const adminEmail = "admin@bookease.app";

  try {
    // Step 2: Try to sign in with Firebase Auth
    await signInWithEmailAndPassword(auth, adminEmail, password);
  } catch (e: any) {
    // Step 3: If the user doesn't exist, create them and sign in again
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      try {
        // NOTE: Firebase Auth has password requirements (e.g., minimum 6 characters).
        await createUserWithEmailAndPassword(auth, adminEmail, password);
        // After creating, sign in to establish the session
        await signInWithEmailAndPassword(auth, adminEmail, password);
      } catch (creationError: any) {
        // Handle potential errors during user creation
        return { message: `An unexpected error occurred during setup: ${creationError.message}` };
      }
    } else if (e.code === 'auth/wrong-password') {
      // Handle incorrect password for an existing user
      return { message: 'Invalid username or password.' };
    } else {
      // Handle other Firebase Auth errors
      return { message: `An unexpected error occurred: ${e.message}` };
    }
  }

  // Step 4: If sign-in is successful, redirect to the owner dashboard
  redirect('/owner');
}


export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
