// FirebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAM9oHh6u745v8dmkd8WTVQh3j4v2K60_8",
  authDomain: "fbtest-fb649.firebaseapp.com",
  projectId: "fbtest-fb649",
  storageBucket: "fbtest-fb649.appspot.com",
  messagingSenderId: "921425557725",
  appId: "1:921425557725:web:7dc7f4e5a4cca8bcb78334"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);
export const FIREBASE_STORAGE = getStorage(FIREBASE_APP);
