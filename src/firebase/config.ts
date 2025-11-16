// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseOptions } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_PUBLIC_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_PUBLIC_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_PUBLIC_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_PUBLIC_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_PUBLIC_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_PUBLIC_APP_ID
};

// Initialize Firebase
// check if we are in the browser and if all the required firebase config values are present
const app = (typeof window !== 'undefined' && firebaseConfig.apiKey)
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : null;

export { app };
