
"use server";

import { redirect } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

// This action now returns a success/error message instead of redirecting.
// The redirect will be handled by the client component.
export async function loginAction(previousState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username !== 'admin123' || password !== 'admin123') {
    return { message: 'Invalid username or password.' };
  }

  const adminEmail = "admin@bookease.app";

  try {
    await signInWithEmailAndPassword(auth, adminEmail, password);
  } catch (e: any) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') {
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, password);
        await signInWithEmailAndPassword(auth, adminEmail, password);
      } catch (creationError: any) {
        return { message: `Setup error: ${creationError.message}` };
      }
    } else if (e.code === 'auth/wrong-password') {
      return { message: 'Invalid username or password.' };
    } else {
      return { message: `An unexpected error occurred: ${e.message}` };
    }
  }

  // A successful login no longer redirects here.
  // It returns a success flag or message which the client can use.
  return { success: true, message: 'Login successful!' };
}


export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
