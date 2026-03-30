// Firebase initialization (minimal). Replace firebaseConfig with your project's config.
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAm17Jon0TQ99UjvXsk4fQbQD-yCssUb0w",
  authDomain: "skillsync-eport.firebaseapp.com",
  projectId: "skillsync-eport",
  storageBucket: "skillsync-eport.firebasestorage.app",
  messagingSenderId: "1049904685278",
  appId: "1:1049904685278:web:7a93676e4c5c02c225a24f",
  measurementId: "G-3BYJWQ2V87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider(); // used by auth.js

export { db, auth, googleProvider };