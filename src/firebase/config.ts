// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD2ztkcZHDUVyx6Dz8AIogKfmOIfTb0RoM",
  authDomain: "studio-1142459954-28867.firebaseapp.com",
  projectId: "studio-1142459954-28867",
  storageBucket: "studio-1142459954-28867.appspot.com",
  messagingSenderId: "394792340205",
  appId: "1:394792340205:web:d949af5f726e4d79481ae4"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
