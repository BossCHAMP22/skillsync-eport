// Minimal code to send a request into Firestore collection "requests"
// Uses authenticated user as submitter. Must be loaded after firebase-init.js and auth.js.

import { db, auth } from './firebase-init.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById('requestForm');
const status = document.getElementById('status');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Submitting...';

  // require signed-in user
  const user = auth.currentUser;
  if (!user) {
    status.textContent = 'Please sign in before submitting.';
    return;
  }

  const category = document.getElementById('category').value.trim();
  const title = document.getElementById('title').value.trim();
  const description = document.getElementById('description').value.trim();
  const submitter = user.displayName || user.email || 'Anonymous';

  if (!category || !title || !description) {
    status.textContent = 'Please fill all fields.';
    return;
  }

  try {
    await addDoc(collection(db, 'requests'), {
      category, title, description, submitter,
      claimed: false,
      createdAt: serverTimestamp(),
      uid: user.uid
    });
    status.textContent = 'Request submitted — thank you!';
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = 'Error submitting. Check console and Firebase config.';
  }
});