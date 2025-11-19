
import { initializeApp, getApp, App, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth, SessionCookieOptions, DecodedIdToken } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { ServiceAccount } from 'firebase-admin';

function getServiceAccount(): ServiceAccount {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccount) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }
  return JSON.parse(serviceAccount);
}

function initializeAdminApp(): App {
  try {
    return getApp('admin');
  } catch {
    return initializeApp({
      credential: cert(getServiceAccount()),
    }, 'admin');
  }
}

const adminApp = initializeAdminApp();
const adminAuth = getAdminAuth(adminApp);
const adminFirestore = getAdminFirestore(adminApp);

export { adminApp, adminAuth as getAuth, adminFirestore };
export const createSessionCookie = (idToken: string, sessionCookieOptions: SessionCookieOptions) => {
    return adminAuth.createSessionCookie(idToken, sessionCookieOptions);
}
export const verifySessionCookie = (sessionCookie: string, checkRevoked?: boolean): Promise<DecodedIdToken> => {
    return adminAuth.verifySessionCookie(sessionCookie, checkRevoked);
}

export const signInWithEmailAndPassword = (auth: any, email: string, pass: string) => {
    // This is a client-side function, but we need an equivalent for admin actions if necessary
    // For now, we use the client SDK on the server, which is not ideal but works for this case.
    const { getAuth: getClientAuth, signInWithEmailAndPassword: clientSignIn } = require('firebase/auth');
    const clientAuth = getClientAuth(require('./index').initializeFirebase().firebaseApp);
    return clientSignIn(clientAuth, email, pass);
}
