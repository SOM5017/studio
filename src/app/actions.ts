
"use server";

import { redirect } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

// This is a simplified setup. In a real app, you'd have a more robust initialization.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    // Explicitly check for 'admin'/'admin' credentials.
    if (username !== 'admin' || password !== 'admin') {
        return { error: "Invalid username or password." };
    }

    // Convert hardcoded username to the email format required by Firebase Auth.
    const email = 'admin@bookease.app';

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            // If the admin user doesn't exist, create it.
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                // After creation, sign in again to establish a session.
                await signInWithEmailAndPassword(auth, email, password);
            } catch (creationError: any) {
                return { error: `Could not create admin user: ${creationError.message}` };
            }
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
             return { error: "Invalid username or password." };
        } else {
            return { error: `An unexpected error occurred: ${error.message}` };
        }
    }
    
    // On successful login or creation/login, redirect to the owner page.
    redirect('/owner');
}

export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
