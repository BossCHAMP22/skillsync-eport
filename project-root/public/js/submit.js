// Submit a new request and increment submitter's submittedCount
import { db, auth } from './firebase-init.js';
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const form = document.getElementById('requestForm');
const status = document.getElementById('status');

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.textContent = 'Submitting...';

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
    const docRef = await addDoc(collection(db, 'requests'), {
      category, title, description, submitter,
      claimed: false,
      solved: false,
      createdAt: serverTimestamp(),
      submitterUid: user.uid
    });

    // increment user's submittedCount
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { submittedCount: increment(1) });

    status.textContent = 'Request submitted — thank you!';
    form.reset();
  } catch (err) {
    console.error(err);
    status.textContent = 'Error submitting. Check console and Firebase config.';
  }
});