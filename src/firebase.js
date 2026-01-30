// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBEEUBv05td1h99C-Nzm2qaRqbDqody5lY",
  authDomain: "livestream-2f8c4.firebaseapp.com",
  projectId: "livestream-2f8c4",
  storageBucket: "livestream-2f8c4.firebasestorage.app",
  messagingSenderId: "448837721294",
  appId: "1:448837721294:web:d817c89df9b1d72be8c49f",
  measurementId: "G-LGG74Q00FW",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const database = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
