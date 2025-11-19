
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

async function ensureAdminUserExists() {
    const adminRef = doc(db, "admins", "admin");
    const adminQuery = query(collection(db, "admins"), where("username", "==", "admin"));
    const querySnapshot = await getDocs(adminQuery);
    
    if (querySnapshot.empty) {
        console.log("Admin user document not found in Firestore, creating it...");
        try {
            await setDoc(adminRef, {
                username: "admin",
                email: "admin@bookease.app"
            });
            console.log("Admin user document created in Firestore.");
        } catch (error) {
            console.error("Error creating admin user document in Firestore:", error);
        }
    }
}


export async function loginAction(previousState: any, formData: FormData) {
  await ensureAdminUserExists();

  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
      return { message: 'Username and password are required.' };
  }
  
  const adminQuery = query(collection(db, "admins"), where("username", "==", username));
  
  let adminEmail: string | null = null;
  
  try {
      const querySnapshot = await getDocs(adminQuery);
      if (querySnapshot.empty) {
          return { message: 'Invalid username or password.' };
      }
      
      const adminData = querySnapshot.docs[0].data();
      adminEmail = adminData.email;

  } catch (error) {
      console.error("Error querying Firestore for admin:", error);
      return { message: 'An error occurred while trying to log in.' };
  }

  if (!adminEmail) {
    return { message: 'Invalid username or password.' };
  }


  try {
    await signInWithEmailAndPassword(auth, adminEmail, password);
  } catch (e: any) {
    if (e.code === 'auth/user-not-found') {
      try {
        await createUserWithEmailAndPassword(auth, adminEmail, password);
        await signInWithEmailAndPassword(auth, adminEmail, password);
      } catch (createError: any) {
        return {
          message: `Failed to create admin user: ${createError.message}`,
        };
      }
    } else if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        return { message: 'Invalid username or password.' };
    } else {
      return {
        message: `An unexpected error occurred: ${e.message}`,
      };
    }
  }

  redirect('/owner');
}

export async function logoutAction() {
    await getAuth(firebaseApp).signOut();
    redirect('/');
}
