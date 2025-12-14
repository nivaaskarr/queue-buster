// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAxBAbfmweQAPGBm2C7t1Tfa6T71h6mhTs",
  authDomain: "queuebuster-13965.firebaseapp.com",
  projectId: "queuebuster-13965",
  storageBucket: "queuebuster-13965.firebasestorage.app",
  messagingSenderId: "1034083153316",
  appId: "1:1034083153316:web:5d6efc6fe008945d5c7d31",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth setup
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
