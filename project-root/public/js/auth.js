// Minimal Authentication UI using Google Sign-In.
// Creates/updates a users document in 'users' collection for each signed-in user.
import { auth, googleProvider, db } from './firebase-init.js';
import { signInWithPopup, signOut, onAuthStateChanged, updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const userDisplay = document.getElementById('userDisplay');
const authBtn = document.getElementById('authBtn');

authBtn?.addEventListener('click', async () => {
  if (auth.currentUser) {
    await signOut(auth);
  } else {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error', err);
      alert('Sign-in failed. Check console for details.');
    }
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const display = user.displayName || user.email || 'User';
    userDisplay.textContent = display;
    authBtn.textContent = 'Sign Out';

    // Create or update a users document for this user
    try {
      const userRef = doc(db, 'users', user.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || '',
          createdAt: serverTimestamp(),
          submittedCount: 0,
          solvedCount: 0
        });
      } else {
        // keep basic fields up to date
        await updateDoc(userRef, {
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL || ''
        });
      }
    } catch (err) {
      console.error('Error creating/updating user doc', err);
    }
  } else {
    userDisplay.textContent = 'Not signed in';
    authBtn.textContent = 'Sign In';
  }
});