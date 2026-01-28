// Firebase initialization (modular v9). Replace the firebaseConfig object with your project's config.
// This file exports initialized services: db, auth, storage, googleProvider
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";


// --- REPLACE the values below with your own Firebase config (from Project Settings -> SDK) ---
const firebaseConfig = {
  apiKey: "AIzaSyAm17Jon0TQ99UjvXsk4fQbQD-yCssUb0w",
  authDomain: "skillsync-eport.firebaseapp.com",
  projectId: "skillsync-eport",
  storageBucket: "skillsync-eport.firebasestorage.app",
  messagingSenderId: "1049904685278",
  appId: "1:1049904685278:web:7a93676e4c5c02c225a24f",
  measurementId: "G-3BYJWQ2V87"
};
// ------------------------------------------------------------

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, storage, googleProvider };