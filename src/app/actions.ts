
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

    if (username !== 'admin' || password !== 'admin') {
        return { error: "Invalid username or password." };
    }

    const adminEmail = 'admin@bookease.app';
    const adminPassword = 'admin';

    try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                // If the admin user doesn't exist, create it.
                await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
                // After creation, sign in again to establish a session.
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
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

// NOTE: The changeCredentialsAction has been removed for simplicity
// to focus on fixing the core login functionality.
// A robust implementation requires secure re-authentication flows.
