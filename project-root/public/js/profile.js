// Profile page logic: load user doc, show stats and achievements, allow upload of profile photo and change display name
import { db, auth, storage } from './firebase-init.js';
import { doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const profileEmail = document.getElementById('profileEmail');
const displayNameEl = document.getElementById('displayName');
const profilePhoto = document.getElementById('profilePhoto');
const photoUpload = document.getElementById('photoUpload');
const saveProfile = document.getElementById('saveProfile');
const profileStatus = document.getElementById('profileStatus');
const submittedCountEl = document.getElementById('submittedCount');
const solvedCountEl = document.getElementById('solvedCount');
const achievementsEl = document.getElementById('achievements');

let selectedFile = null;
photoUpload?.addEventListener('change', (e) => {
  selectedFile = e.target.files[0];
  if (selectedFile) {
    profilePhoto.src = URL.createObjectURL(selectedFile);
  }
});

saveProfile?.addEventListener('click', async () => {
  profileStatus.textContent = 'Saving...';
  const user = auth.currentUser;
  if (!user) {
    profileStatus.textContent = 'Please sign in first.';
    return;
  }
  try {
    let photoURL = user.photoURL || '';
    if (selectedFile) {
      const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
      await uploadBytes(storageRef, selectedFile);
      photoURL = await getDownloadURL(storageRef);
    }
    const newName = displayNameEl.value.trim();
    // update auth profile
    await updateProfile(user, { displayName: newName || user.displayName, photoURL });
    // update users doc
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { displayName: newName || user.displayName, photoURL: photoURL || user.photoURL });
    profileStatus.textContent = 'Profile updated.';
    // refresh page UI
    loadProfile();
  } catch (err) {
    console.error(err);
    profileStatus.textContent = 'Error updating profile.';
  }
});

async function loadProfile() {
  const user = auth.currentUser;
  if (!user) {
    profileEmail.textContent = '—';
    displayNameEl.value = '';
    profilePhoto.src = 'logo.png';
    return;
  }
  profileEmail.textContent = user.email || '—';
  displayNameEl.value = user.displayName || '';
  profilePhoto.src = user.photoURL || 'logo.png';

  try {
    const snap = await getDoc(doc(db, 'users', user.uid));
    if (snap.exists()) {
      const data = snap.data();
      const submitted = data.submittedCount || 0;
      const solved = data.solvedCount || 0;
      submittedCountEl.textContent = String(submitted);
      solvedCountEl.textContent = String(solved);

      achievementsEl.innerHTML = '';
      const badges = computeAchievements(submitted, solved);
      badges.forEach(b => {
        const el = document.createElement('div');
        el.className = 'badge';
        el.textContent = b;
        achievementsEl.appendChild(el);
      });
    }
  } catch (err) {
    console.error(err);
  }
}

function computeAchievements(submitted, solved){
  const out = [];
  if (submitted >= 1) out.push('First request submitted');
  if (submitted >= 5) out.push('5 requests submitted');
  if (submitted >= 20) out.push('20 requests submitted');
  if (solved >= 1) out.push('First request solved');
  if (solved >= 5) out.push('5 requests solved');
  if (solved >= 20) out.push('20 requests solved');
  if (out.length === 0) out.push('No achievements yet');
  return out;
}

auth?.onAuthStateChanged?.(() => loadProfile());
loadProfile();