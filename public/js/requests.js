import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("requestForm");
const requestsContainer = document.getElementById("requests");
const statusText = document.getElementById("status");

/* ---------------- SUBMIT PAGE ---------------- */

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("Login required");
      return;
    }

    try {
      // Get full name from users collection
      const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userSnap.data();

      await addDoc(collection(db, "requests"), {
        category: document.getElementById("category").value,
        title: document.getElementById("title").value,
        description: document.getElementById("description").value,
        createdBy: userData.fullName,
        createdByEmail: auth.currentUser.email,
        assignedTo: null,
        status: "Unassigned",
        createdAt: serverTimestamp()
      });

      statusText.textContent = "Request submitted successfully";
      form.reset();

    } catch (error) {
      console.error(error);
      statusText.textContent = "Error submitting request";
    }
  });
}

/* ---------------- HELP PAGE ---------------- */

if (requestsContainer) {

  const q = query(
    collection(db, "requests"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snapshot) => {

    requestsContainer.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();
      const div = document.createElement("div");
      div.className = "request";

      let buttonHTML = "";
      const postedBy = data.createdByEmail
        ? `${data.createdBy} (${data.createdByEmail})`
        : data.createdBy;

      if (!data.assignedTo) {
        buttonHTML = `<button data-id="${docSnap.id}">ASSIGN TO ME</button>`;
      } else {
        buttonHTML = `<p><strong>Assigned to:</strong> ${data.assignedTo}</p>`;
      }

      div.innerHTML = `
        <strong>${data.title}</strong><br>
        Category: ${data.category}<br>
        Description: ${data.description}<br>
        Posted by: ${postedBy}<br>
        Status: ${data.status}<br>
        ${buttonHTML}
      `;

      requestsContainer.appendChild(div);
    });

    // Assign button logic
    document.querySelectorAll("button[data-id]").forEach((btn) => {
      btn.addEventListener("click", async () => {

        if (!auth.currentUser) {
          alert("Login required");
          return;
        }

        const requestId = btn.getAttribute("data-id");

        // Get full name of current user
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const userData = userSnap.data();

        await updateDoc(doc(db, "requests", requestId), {
          assignedTo: userData.fullName,
          status: "Assigned"
        });

      });
    });

  });
}
