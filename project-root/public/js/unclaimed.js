// Load unclaimed requests and allow authenticated users to claim them & mark solved
import { db, auth } from './firebase-init.js';
import { collection, query, where, getDocs, updateDoc, doc, orderBy, serverTimestamp, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { increment } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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
          // mark claimed
          await updateDoc(doc(db, 'requests', id), { claimed: true, claimedBy: claimer, claimedByUid: user.uid, claimedAt: serverTimestamp() });

          // Immediately change UI and offer the claimer a "Mark Solved" button
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

// Also provide a helper to list claimed but unsolved requests for the current user and allow marking solved
async function loadMyClaims(){
  const user = auth.currentUser;
  if (!user) return;
  const q = query(collection(db, 'requests'), where('claimedByUid', '==', user.uid), where('solved', '==', false), orderBy('claimedAt', 'desc'));
  try {
    const snap = await getDocs(q);
    if (!snap.empty) {
      snap.forEach(s => {
        const data = s.data();
        const id = s.id;
        // create a small UI in console or below grid — we append a "My Claims" section
        const section = document.getElementById('myClaimsSection') || document.createElement('div');
        section.id = 'myClaimsSection';
        section.style.marginTop = '18px';
        if (!document.getElementById('myClaimsSection')) {
          const heading = document.createElement('h3'); heading.textContent = 'Requests you claimed (mark solved)';
          section.appendChild(heading);
          grid.parentNode.insertBefore(section, grid.nextSibling);
        }
        const item = document.createElement('div');
        item.className = 'request-card';
        item.innerHTML = `<h4>${escapeHtml(data.title)}</h4>
          <div class="request-meta">By: ${escapeHtml(data.submitter)}</div>
          <p style="margin-top:8px; color:#333">${escapeHtml(data.description)}</p>
          <button class="btn-primary mark-solved" data-id="${id}">MARK SOLVED</button>`;
        section.appendChild(item);
        item.querySelector('.mark-solved').addEventListener('click', async ()=>{
          try {
            await updateDoc(doc(db,'requests',id), { solved: true, solvedByUid: user.uid, solvedBy: user.displayName || user.email, solvedAt: serverTimestamp() });
            // increment solvedCount for claimer
            await updateDoc(doc(db,'users',user.uid), { solvedCount: increment(1) });
            item.querySelector('.mark-solved').textContent = 'SOLVED';
            item.querySelector('.mark-solved').disabled = true;
          } catch(err) { console.error(err); alert('Error marking solved'); }
        });
      });
    }
  } catch(err) { console.error(err); }
}

auth?.onAuthStateChanged?.(async (u) => {
  // when auth state changes, refresh lists to show claim actions for current user
  loadUnclaimed();
  loadMyClaims();
});

loadUnclaimed();