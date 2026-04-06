import { auth, db } from "./firebase.js";
import {
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const yearGroup = document.getElementById("yearGroup").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      fullName,
      yearGroup,
      email,
      photoURL: "assets/default-profile.svg",
      achievements: {
        firstRequest: false,
        firstAssignment: false,
        firstMessage: false,
        fiveRequests: false,
        helper: false
      }
    });

    message.textContent = "Account created successfully";
    window.location.href = "index.html";

  } catch (error) {
    message.textContent = error.message;
  }
});
