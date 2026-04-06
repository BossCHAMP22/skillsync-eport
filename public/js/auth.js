import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  message.textContent = "Signing in...";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    message.textContent = "Login successful";
    window.location.href = "index.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
