// Load unclaimed requests and allow authenticated users to claim them.
// Must be loaded after firebase-init.js and auth.js.

import { db, auth } from './firebase-init.js';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const grid = document.getElementById('requestsGrid');

async function loadUnclaimed(){
  if (!grid) return;
  grid.innerHTML = 'Loading...';
  const q = query(collection(db, 'requests'), where('claimed', '==', false), orderBy('createdAt', 'desc'));
  try{
    const snap = await getDocs(q);
    grid.innerHTML = '';
    if (snap.empty) {
      grid.innerHTML = '<p style="color:#fff">No unclaimed requests yet.</p>';
      return;
    }
    snap.forEach(docSnap => {
      const data = docSnap.data();
      const id = docSnap.id;
      const card = document.createElement('div');
      card.className = 'request-card';
      card.innerHTML = `<h4>${escapeHtml(data.title)}</h4>
        <div class="request-meta">By: ${escapeHtml(data.submitter)} • ${escapeHtml(data.category)}</div>
        <p style="margin-top:8px; color:#333">${escapeHtml(data.description)}</p>
        <button class="btn-primary" data-id="${id}">CLAIM</button>`;
      grid.appendChild(card);
    });

    // attach claim handlers
    grid.querySelectorAll('button[data-id]').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        const id = btn.getAttribute('data-id');
        const user = auth.currentUser;
        if (!user) {
          alert('Please sign in to claim a request.');
          return;
        }
        const claimer = user.displayName || user.email;
        if (!claimer) return;
        try{
          await updateDoc(doc(db, 'requests', id), { claimed: true, claimedBy: claimer, claimedAt: new Date() });
          btn.textContent = 'CLAIMED';
          btn.disabled = true;
        } catch(err){
          console.error(err);
          alert('Error claiming — check console');
        }
      });
    });

  }catch(err){
    console.error(err);
    grid.innerHTML = '<p style="color:#fff">Error loading requests. Check console and Firebase config.</p>';
  }
}

function escapeHtml(s=''){ return String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;'); }

loadUnclaimed();