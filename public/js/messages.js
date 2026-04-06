import { auth, db } from "./firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  getDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const form = document.getElementById("messageForm");
const messageList = document.getElementById("messageList");
const threadListEl = document.getElementById("threadList");
const threadViewEl = document.getElementById("threadView");
const statusText = document.getElementById("status");

let inboxMessages = [];
let sentMessages = [];
let selectedThreadId = null;

function cleanTitle(title) {
  return (title || "").trim().replace(/\s+/g, " ");
}

function normalizedTitle(title) {
  return cleanTitle(title).toLowerCase();
}

function makeThreadId(senderEmail, receiverEmail, title) {
  const people = [senderEmail || "", receiverEmail || ""]
    .map((email) => email.toLowerCase().trim())
    .sort();
  return people.join("|") + "|" + normalizedTitle(title);
}

function getTimeValue(ts) {
  if (!ts || typeof ts.toMillis !== "function") return 0;
  return ts.toMillis();
}

function formatTimestamp(date) {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return hours + ":" + minutes + " " + day + "/" + month + "/" + year;
}

function formatDate(ts) {
  const time = getTimeValue(ts);
  if (!time) return "Pending...";
  return formatTimestamp(new Date(time));
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

function getOtherEmail(thread, currentEmail) {
  const current = (currentEmail || "").toLowerCase();
  const firstOther = thread.participants.find((email) => email.toLowerCase() !== current);
  return firstOther || currentEmail;
}

function buildThreadMap(allMessages) {
  const threads = new Map();

  allMessages.forEach((item) => {
    const data = item.data;
    const inferredThreadId =
      data.threadId ||
      makeThreadId(data.senderEmail, data.receiverEmail, data.title);

    if (!threads.has(inferredThreadId)) {
      threads.set(inferredThreadId, {
        id: inferredThreadId,
        title: cleanTitle(data.title) || "No subject",
        participants: [data.senderEmail || "", data.receiverEmail || ""],
        messages: []
      });
    }

    const thread = threads.get(inferredThreadId);
    thread.messages.push(data);

    if (getTimeValue(data.createdAt) > getTimeValue(thread.latestAt)) {
      thread.latestAt = data.createdAt;
      thread.preview = data.text || "";
      thread.title = cleanTitle(data.title) || thread.title;
      thread.participants = [data.senderEmail || "", data.receiverEmail || ""];
    }
  });

  threads.forEach((thread) => {
    thread.messages.sort((a, b) => getTimeValue(a.createdAt) - getTimeValue(b.createdAt));
  });

  return Array.from(threads.values()).sort((a, b) => getTimeValue(b.latestAt) - getTimeValue(a.latestAt));
}

function renderThreadList(threads, currentEmail) {
  if (!threadListEl) return;

  if (!threads.length) {
    threadListEl.innerHTML = "<p>No messages yet.</p>";
    return;
  }

  threadListEl.innerHTML = "";

  threads.forEach((thread) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "thread-item" + (thread.id === selectedThreadId ? " active" : "");

    const otherEmail = getOtherEmail(thread, currentEmail);
    const preview = (thread.preview || "").slice(0, 90);

    button.innerHTML =
      "<strong>" + escapeHtml(thread.title) + "</strong>" +
      "<span>With: " + escapeHtml(otherEmail) + "</span>" +
      "<span>" + escapeHtml(preview) + "</span>" +
      "<span class=\"thread-date\">" + escapeHtml(formatDate(thread.latestAt)) + "</span>";

    button.addEventListener("click", () => {
      selectedThreadId = thread.id;
      renderMailbox(currentEmail);
    });

    threadListEl.appendChild(button);
  });
}

async function sendMessage({ receiverEmail, title, text, threadId }) {
  if (!auth.currentUser) return;

  const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
  const userData = userSnap.exists() ? userSnap.data() : {};

  await addDoc(collection(db, "messages"), {
    senderName: userData.fullName || auth.currentUser.email,
    senderEmail: auth.currentUser.email,
    receiverEmail: receiverEmail,
    title: cleanTitle(title),
    text: (text || "").trim(),
    threadId: threadId,
    participants: [auth.currentUser.email, receiverEmail],
    createdAt: serverTimestamp()
  });
}

function renderThreadView(thread, currentEmail) {
  if (!threadViewEl) return;

  if (!thread) {
    threadViewEl.innerHTML = "<p>Select a conversation to read and reply.</p>";
    return;
  }

  const otherEmail = getOtherEmail(thread, currentEmail);

  const messagesHtml = thread.messages
    .map((msg) => {
      const isMine = (msg.senderEmail || "").toLowerCase() === (currentEmail || "").toLowerCase();
      return (
        "<div class=\"message" + (isMine ? " outgoing" : " incoming") + "\">" +
          "<div class=\"message-meta\">" +
            (isMine ? "You" : escapeHtml(msg.senderName || msg.senderEmail || "Unknown")) +
            " - " + escapeHtml(formatDate(msg.createdAt)) +
          "</div>" +
          "<div>" + escapeHtml(msg.text || "") + "</div>" +
        "</div>"
      );
    })
    .join("");

  threadViewEl.innerHTML =
    "<h4>" + escapeHtml(thread.title) + "</h4>" +
    "<p class=\"thread-subtitle\">Conversation with " + escapeHtml(otherEmail) + "</p>" +
    "<div class=\"thread-messages\">" + messagesHtml + "</div>" +
    "<form id=\"replyForm\" class=\"reply-form\">" +
      "<label for=\"replyText\">Reply</label>" +
      "<textarea id=\"replyText\" rows=\"3\" placeholder=\"Write a reply\" required></textarea>" +
      "<button type=\"submit\">SEND REPLY</button>" +
      "<p id=\"replyStatus\"></p>" +
    "</form>";

  const replyForm = document.getElementById("replyForm");
  const replyText = document.getElementById("replyText");
  const replyStatus = document.getElementById("replyStatus");

  replyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const text = (replyText.value || "").trim();
    if (!text) return;

    try {
      await sendMessage({
        receiverEmail: otherEmail,
        title: thread.title,
        text: text,
        threadId: thread.id
      });
      replyForm.reset();
      replyStatus.textContent = "Reply sent.";
    } catch (error) {
      console.error(error);
      replyStatus.textContent = "Could not send reply.";
    }
  });
}

function renderMailbox(currentEmail) {
  if (!messageList || !threadListEl || !threadViewEl) return;

  const all = [...inboxMessages, ...sentMessages];

  const uniqueById = new Map();
  all.forEach((item) => uniqueById.set(item.id, item));

  const threads = buildThreadMap(Array.from(uniqueById.values()));

  if (!threads.length) {
    selectedThreadId = null;
  } else if (!selectedThreadId || !threads.some((thread) => thread.id === selectedThreadId)) {
    selectedThreadId = threads[0].id;
  }

  renderThreadList(threads, currentEmail);
  renderThreadView(threads.find((thread) => thread.id === selectedThreadId), currentEmail);
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert("You must be logged in");
      return;
    }

    try {
      const receiver = document.getElementById("receiver").value.trim();
      const title = document.getElementById("title").value;
      const text = document.getElementById("messageText").value;

      await sendMessage({
        receiverEmail: receiver,
        title: title,
        text: text,
        threadId: makeThreadId(auth.currentUser.email, receiver, title)
      });

      statusText.textContent = "Message sent successfully";
      form.reset();

    } catch (error) {
      console.error(error);
      statusText.textContent = "Error sending message";
    }
  });
}

auth.onAuthStateChanged((user) => {

  if (!user || !messageList) return;

  const inboxQuery = query(
    collection(db, "messages"),
    where("receiverEmail", "==", user.email)
  );

  const sentQuery = query(
    collection(db, "messages"),
    where("senderEmail", "==", user.email)
  );

  onSnapshot(inboxQuery, (snapshot) => {
    inboxMessages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      data: docSnap.data()
    }));
    renderMailbox(user.email);
  });

  onSnapshot(sentQuery, (snapshot) => {
    sentMessages = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      data: docSnap.data()
    }));
    renderMailbox(user.email);
  });

});

