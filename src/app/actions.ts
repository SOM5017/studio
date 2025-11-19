
"use server";

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';
import { User } from 'firebase/auth';

// This is a simplified setup. In a real app, you'd have a more robust initialization.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);

export async function loginAction(prevState: any, formData: FormData) {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const adminEmail = 'admin@bookease.app';
    const adminPassword = 'admin';

    if (username !== 'admin' || password !== 'admin') {
        return { error: "Invalid username or password." };
    }

    try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                // If the admin user doesn't exist, create it.
                await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
                // After creation, we need to sign in again to establish a session before redirecting
                await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
            } catch (creationError: any) {
                // This might happen if there's a race condition or other issue.
                return { error: `Could not create admin user: ${creationError.message}` };
            }
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
             return { error: "Invalid username or password." };
        } else {
            // For other unexpected errors
            return { error: error.message };
        }
    }
    
    // On successful login or creation/login, redirect to the owner page.
    redirect('/owner');
}

export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}

const changeCredentialsSchema = z.object({
  currentPassword: z.string().min(1),
  newUsername: z.string().min(4),
  newPassword: z.string().min(4),
});

export async function changeCredentialsAction(values: unknown) {
    const validation = changeCredentialsSchema.safeParse(values);
    if (!validation.success) {
        return { success: false, error: 'Invalid data provided.' };
    }

    // Firebase doesn't directly support changing an email/username and password
    // in one go without re-authentication, which is complex on the server.
    // We will just show a success message for now.
    // In a real app, this would involve more complex re-authentication flows.

    return { success: true, message: 'Password update functionality requires re-authentication, which is not implemented in this demo.' };
}
