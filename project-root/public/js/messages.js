// Minimal messages read/write in collection "messages" with inbox & sent lists
import { db, auth } from './firebase-init.js';
import { collection, addDoc, getDocs, query, orderBy, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const toEl = document.getElementById('to');
const titleEl = document.getElementById('msgTitle');
const bodyEl = document.getElementById('msgBody');
const sendBtn = document.getElementById('sendBtn');
const status = document.getElementById('msgStatus');
const inbox = document.getElementById('inbox');
const sent = document.getElementById('sent');

sendBtn?.addEventListener('click', async () => {
  const user = auth.currentUser;
  if (!user) {
    status.textContent = 'Please sign in to send messages.';
    return;
  }
  const to = toEl.value.trim().toLowerCase();
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
  const user = auth.currentUser;
  if (!user) {
    inbox.innerHTML = '<p>Please sign in to see messages.</p>';
    sent.innerHTML = '<p>Please sign in to see messages.</p>';
    return;
  }
  inbox.innerHTML = 'Loading...';
  sent.innerHTML = 'Loading...';
  try {
    // inbox: messages where to == current user's email
    const inboxQ = query(collection(db,'messages'), where('to','==', (user.email||'').toLowerCase()), orderBy('createdAt','desc'));
    const sentQ = query(collection(db,'messages'), where('uid','==', user.uid), orderBy('createdAt','desc'));

    const [inSnap, sentSnap] = await Promise.all([getDocs(inboxQ), getDocs(sentQ)]);

    inbox.innerHTML = '';
    if (inSnap.empty) inbox.innerHTML = '<p>No messages.</p>';
    inSnap.forEach(s => {
      const d = s.data();
      const el = document.createElement('div');
      el.className = 'msg';
      el.innerHTML = `<strong>From: ${escapeHtml(d.from)}</strong><div><em>${escapeHtml(d.title)}</em></div><p>${escapeHtml(d.body)}</p>`;
      inbox.appendChild(el);
    });

    sent.innerHTML = '';
    if (sentSnap.empty) sent.innerHTML = '<p>No sent messages.</p>';
    sentSnap.forEach(s => {
      const d = s.data();
      const el = document.createElement('div');
      el.className = 'msg';
      el.innerHTML = `<strong>To: ${escapeHtml(d.to)}</strong><div><em>${escapeHtml(d.title)}</em></div><p>${escapeHtml(d.body)}</p>`;
      sent.appendChild(el);
    });

  } catch(err) {
    console.error(err);
    inbox.innerHTML = '<p>Error loading messages.</p>';
    sent.innerHTML = '<p>Error loading messages.</p>';
  }
}

function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

auth?.onAuthStateChanged?.(() => {
  loadMessages();
});
loadMessages();