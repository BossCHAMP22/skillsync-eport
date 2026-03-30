// Minimal Authentication UI (Google Sign-In). Exports nothing; it updates the header UI and provides sign-in/out.
// Make sure firebase-init.js is loaded before this file.

import { auth, googleProvider } from './firebase-init.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const userDisplay = document.getElementById('userDisplay');
const authBtn = document.getElementById('authBtn');

if (!userDisplay || !authBtn) {
  // If header elements aren't present (should be on all pages), do nothing.
  console.warn('Auth UI elements not found.');
}

authBtn?.addEventListener('click', async () => {
  if (auth.currentUser) {
    // sign out
    await signOut(auth);
  } else {
    // sign in with Google popup (minimal)
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign-in error', err);
      alert('Sign-in failed. Check console for details.');
    }
  }
});

// Listen for auth state changes and update UI
onAuthStateChanged(auth, (user) => {
  if (user) {
    const display = user.displayName || user.email || 'User';
    userDisplay.textContent = display;
    authBtn.textContent = 'Sign Out';
  } else {
    userDisplay.textContent = 'Not signed in';
    authBtn.textContent = 'Sign In';
  }
});