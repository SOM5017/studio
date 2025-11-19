
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
    const email = formData.get('username') as string + '@bookease.app'; // Use a dummy domain
    const password = formData.get('password') as string;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            try {
                // If user doesn't exist, create it.
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (creationError: any) {
                return { error: creationError.message };
            }
        } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
             return { error: "Invalid username or password." };
        } else {
            return { error: error.message };
        }
    }
    // After a successful initial login or creation, signIn again to ensure session is set
    // before redirecting.
    try {
        await signInWithEmailAndPassword(auth, email, password);
        redirect('/owner');
    } catch (e: any) {
        // This should not fail if the previous block succeeded, but handle just in case.
        return { error: "Login failed after user setup. Please try again."};
    }
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
