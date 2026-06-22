import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBZ9waIVU_U07bbEhnVHDXc1tiLJ41rM8E",
  authDomain: "gerador-de-eventos-ea-fc.firebaseapp.com",
  projectId: "gerador-de-eventos-ea-fc",
  storageBucket: "gerador-de-eventos-ea-fc.firebasestorage.app",
  messagingSenderId: "501687105494",
  appId: "1:501687105494:web:83c600af9b83a1b0c65677",
  measurementId: "G-CDFN30QEVW"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);