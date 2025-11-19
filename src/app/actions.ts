
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

  if (username !== 'admin' || password !== 'admin') {
    return {
      message: 'Invalid username or password.',
    };
  }

  // Use a hardcoded, non-discoverable email for the admin user
  const adminEmail = 'admin@bookease.app';

  try {
    // Try to sign in first
    await signInWithEmailAndPassword(auth, adminEmail, password);
  } catch (e: any) {
    // If the user doesn't exist, create it...
    if (e.code === 'auth/user-not-found') {
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, password);
        // ...and then sign in again immediately after creation.
        await signInWithEmailAndPassword(auth, adminEmail, password);
      } catch (createError: any) {
        return {
          message: `Failed to create admin user: ${createError.message}`,
        };
      }
    } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        return { message: 'Invalid username or password.' };
    } else {
      // Handle other potential errors (network issues, etc.)
      return {
        message: `An unexpected error occurred: ${e.message}`,
      };
    }
  }

  // If sign-in (or creation and subsequent sign-in) is successful, redirect.
  redirect('/owner');
}

export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
