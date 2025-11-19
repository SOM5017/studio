
"use server";

import { redirect } from 'next/navigation';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';

// This is a simplified setup. In a real app, you'd have a more robust initialization.
const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export async function loginAction(previousState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
      return { message: 'Username and password are required.' };
  }
  
  const adminQuery = query(collection(db, "admins"), where("username", "==", username));
  
  let adminEmail: string | null = "admin@bookease.app"; // Hardcode the target email

  try {
      const querySnapshot = await getDocs(adminQuery);

      // If the admin document doesn't exist in Firestore, create it.
      if (querySnapshot.empty) {
          console.log("Admin user document not found in Firestore, creating it...");
          const adminRef = doc(db, "admins", "admin");
          await setDoc(adminRef, {
              username: "admin",
              email: adminEmail
          });
          console.log("Admin user document created in Firestore.");
      }

      // Now, attempt to sign in with Firebase Auth.
      try {
        await signInWithEmailAndPassword(auth, adminEmail, password);
      } catch (e: any) {
        // If the Firebase Auth user doesn't exist, create it and sign in again.
        if (e.code === 'auth/user-not-found') {
          await createUserWithEmailAndPassword(auth, adminEmail, password);
          await signInWithEmailAndPassword(auth, adminEmail, password);
        } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
            return { message: 'Invalid username or password.' };
        } else {
            // Other auth error
            return { message: `An unexpected error occurred: ${e.message}` };
        }
      }

  } catch (error) {
      console.error("Error during login action:", error);
      return { message: 'An error occurred while trying to log in.' };
  }

  // If all is successful, redirect.
  redirect('/owner');
}


export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
