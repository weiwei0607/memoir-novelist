import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "space-clear-app",
  appId: "1:815296228640:web:6139242ac845002982fb45",
  storageBucket: "space-clear-app.firebasestorage.app",
  apiKey: "<REDACTED_FIREBASE_API_KEY>",
  authDomain: "space-clear-app.firebaseapp.com",
  messagingSenderId: "815296228640",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logout = () => signOut(auth);
