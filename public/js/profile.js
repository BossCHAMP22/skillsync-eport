import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const defaultAvatar = "assets/default-profile.png";

auth.onAuthStateChanged(async (user) => {
  if (!user) return;

  const profileImage = document.getElementById("profileImage");
  profileImage.src = defaultAvatar;

  const snap = await getDoc(doc(db, "users", user.uid));
  const data = snap.data();

  if (!data) return;

  document.getElementById("profileName").value = data.fullName || "";
  document.getElementById("profileEmail").value = data.email || "";
  document.getElementById("profileYear").value = data.yearGroup || "";
  profileImage.src = data.photoURL || defaultAvatar;

  /* -------- ACHIEVEMENTS -------- */

  const achievementTitles = {
    firstRequest: "First Request Submitted",
    firstAssigned: "First Request Assigned",
    firstMessage: "First Message Sent",
    profileUpdated: "Profile Updated",
    fiveRequests: "5 Requests Submitted"
  };

  const list = document.getElementById("achievementsList");
  list.innerHTML = "";

  const achievements = data.achievements || {};

  for (const key in achievementTitles) {
    const li = document.createElement("li");
    li.textContent = achievementTitles[key];

    if (achievements[key]) {
      li.style.color = "limegreen";
    } else {
      li.style.color = "gray";
    }

    list.appendChild(li);
  }
});

/* -------- SAVE PROFILE -------- */

document.getElementById("saveProfile").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) return;

  await updateDoc(doc(db, "users", user.uid), {
    fullName: document.getElementById("profileName").value,
    yearGroup: document.getElementById("profileYear").value,
    "achievements.profileUpdated": true
  });

  alert("Profile updated");
});

/* -------- IMAGE UPLOAD (BASE64 METHOD) -------- */

document.getElementById("profileUpload").addEventListener("change", (e) => {

  const file = e.target.files[0];
  const user = auth.currentUser;
  if (!file || !user) return;

  const reader = new FileReader();

  reader.onloadend = async () => {
    const base64String = reader.result;

    await updateDoc(doc(db, "users", user.uid), {
      photoURL: base64String
    });

    document.getElementById("profileImage").src = base64String;

    alert("Profile picture updated");
  };

  reader.readAsDataURL(file);
});

/* -------- LOGOUT -------- */

document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
