import { auth, db } from "./firebase.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const loginBtn = document.getElementById("loginBtn");
const defaultAvatar = "assets/default-profile.png";

auth.onAuthStateChanged(async (user) => {

  if (!loginBtn) return;

  if (user) {

    const snap = await getDoc(doc(db, "users", user.uid));
    const data = snap.data();

    const photo = data?.photoURL || defaultAvatar;

    loginBtn.href = "profile.html";
    loginBtn.classList.remove("active");
    loginBtn.classList.add("profile-btn");
    loginBtn.innerHTML = `<img src="${photo}" alt="Profile" class="nav-profile-img">`;

  } else {
    loginBtn.href = "login.html";
    loginBtn.classList.remove("profile-btn");
    loginBtn.textContent = "LOGIN";
  }

});
