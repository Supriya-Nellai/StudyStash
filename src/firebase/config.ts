import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

import configJson from '../../firebase-applet-config.json';

const metaEnv = (import.meta as any).env || {};

const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || configJson.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || configJson.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || configJson.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || configJson.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || configJson.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || configJson.appId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Pass the custom databaseId if configured in firebase-applet-config.json
const dbId = configJson.firestoreDatabaseId && configJson.firestoreDatabaseId !== '(default)' 
  ? configJson.firestoreDatabaseId 
  : undefined;

export const db = getFirestore(app, dbId);

export default app;
