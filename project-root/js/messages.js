// Minimal messages read/write in collection "messages"
// Must be loaded after firebase-init.js and auth.js.

import { db, auth } from './firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const toEl = document.getElementById('to');
const titleEl = document.getElementById('msgTitle');
const bodyEl = document.getElementById('msgBody');
const sendBtn = document.getElementById('sendBtn');
const status = document.getElementById('msgStatus');
const past = document.getElementById('pastMessages');

sendBtn?.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) {
    status.textContent = 'Please sign in to send messages.';
    return;
  }
  const to = toEl.value.trim();
  const title = titleEl.value.trim();
  const body = bodyEl.value.trim();
  const from = user.displayName || user.email || 'Anonymous';
  if (!to || !title || !body) {
    status.textContent = 'Please fill all fields.';
    return;
  }
  status.textContent = 'Sending...';
  try {
    await addDoc(collection(db, 'messages'), {
      to, title, body, from, createdAt: serverTimestamp(), uid: user.uid
    });
    status.textContent = 'Message sent.';
    toEl.value=''; titleEl.value=''; bodyEl.value='';
    loadMessages();
  } catch(err) {
    console.error(err);
    status.textContent = 'Error sending.';
  }
});

async function loadMessages(){
  if (!past) return;
  past.innerHTML = 'Loading...';
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  try{
    const snap = await getDocs(q);
    past.innerHTML = '';
    if (snap.empty) { past.innerHTML = '<p>No messages yet.</p>'; return; }
    snap.forEach(s => {
      const d = s.data();
      const el = document.createElement('div');
      el.className = 'msg';
      el.innerHTML = `<strong>To: ${escapeHtml(d.to)}</strong><div><em>${escapeHtml(d.title)}</em></div><p>${escapeHtml(d.body)}</p><small>From: ${escapeHtml(d.from)}</small>`;
      past.appendChild(el);
    });
  }catch(err){ console.error(err); past.innerHTML = '<p>Error loading messages.</p>'; }
}
function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }
loadMessages();