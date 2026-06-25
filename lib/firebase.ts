import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let db: Firestore;
let auth: Auth;

// Safe check: if API key is missing or is empty, use mock fallback to prevent Next.js build crash
const isConfigured = !!firebaseConfig.apiKey;

if (isConfigured) {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
} else {
  const dummyConfig = {
    apiKey: 'mock-api-key',
    authDomain: 'mock-auth-domain.firebaseapp.com',
    projectId: 'mock-project-id',
    storageBucket: 'mock-project-id.appspot.com',
    messagingSenderId: '000000000000',
    appId: '1:000000000000:web:0000000000000000000000',
  };
  const app = getApps().length === 0 ? initializeApp(dummyConfig) : getApp();
  db = getFirestore(app);
  auth = getAuth(app);
}

export { db, auth };
