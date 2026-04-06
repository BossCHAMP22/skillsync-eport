// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCCa7-Y4hBYcHvGaQI1SxpmwwxAuP3e_mY",
  authDomain: "skillsync-eportfolio.firebaseapp.com",
  projectId: "skillsync-eportfolio",
  storageBucket: "skillsync-eportfolio.firebasestorage.app",
  messagingSenderId: "893814745420",
  appId: "1:893814745420:web:9cc97ad81d900189abc7e9",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
