/* ============================================================
   BAKAS — BICOL HERITAGE  |  form-handler.js
   Handles all form submissions, saves to localStorage,
   and lets you download all submissions as a .txt file.
   
   HOW TO USE:
   Add this line to the bottom of your index.html (before </body>):
   <script src="form-handler.js"></script>
   ============================================================ */

'use strict';

const STORAGE_KEY = 'bakas_submissions';

/* ============================================================
   CORE HELPER — Save a submission entry
   ============================================================ */
function saveSubmission(type, fields) {
  const timestamp = new Date().toLocaleString('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  const entry = { type, timestamp, fields };

  /* Load existing, push new, save back */
  const all = getAllSubmissions();
  all.push(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  console.log(`[BAKAS Forms] Saved: ${type} — ${timestamp}`);
}

/* Load all saved submissions from localStorage */
function getAllSubmissions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

/* ============================================================
   FORMAT submissions as plain text
   ============================================================ */
function formatSubmissionsAsTxt() {
  const all = getAllSubmissions();
  if (all.length === 0) return 'No submissions recorded yet.';

  const divider = '='.repeat(60);
  const lines = [
    'BAKAS — BICOL HERITAGE DIGITAL ARCHIVE',
    'Form Submissions Log',
    divider,
    `Total submissions: ${all.length}`,
    `Exported on: ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })}`,
    divider,
  ];

  all.forEach((entry, i) => {
    lines.push('');
    lines.push(`[${i + 1}] FORM TYPE  : ${entry.type}`);
    lines.push(`    SUBMITTED  : ${entry.timestamp}`);
    lines.push('    ' + '-'.repeat(40));
    Object.entries(entry.fields).forEach(([key, val]) => {
      /* Word-wrap long values at 60 chars */
      const value = String(val || '(empty)');
      lines.push(`    ${key.padEnd(14)}: ${value}`);
    });
    lines.push('');
    lines.push('    ' + divider);
  });

  return lines.join('\n');
}

/* ============================================================
   DOWNLOAD submissions.txt
   ============================================================ */
function downloadSubmissions() {
  const text    = formatSubmissionsAsTxt();
  const blob    = new Blob([text], { type: 'text/plain' });
  const url     = URL.createObjectURL(blob);
  const link    = document.createElement('a');
  link.href     = url;
  link.download = 'submissions.txt';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ============================================================
   CLEAR all saved submissions
   ============================================================ */
function clearSubmissions() {
  localStorage.removeItem(STORAGE_KEY);
  console.log('[BAKAS Forms] All submissions cleared.');
}

/* ============================================================
   FORM 1 — Contact Form
   Overrides sendContact() from script.js
   ============================================================ */
function sendContact() {
  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const subject = document.getElementById('cSubject').value.trim();
  const message = document.getElementById('cMessage').value.trim();

  if (!name || !email || !message) {
    alert('Please fill in Name, Email, and Message.');
    return;
  }

  saveSubmission('CONTACT FORM', {
    Name   : name,
    Email  : email,
    Subject: subject || '(none selected)',
    Message: message,
  });

  /* Show success message */
  const success = document.getElementById('contactSuccess');
  if (success) {
    success.style.display = 'block';
    setTimeout(() => success.style.display = 'none', 5000);
  }

  /* Clear fields */
  ['cName', 'cEmail', 'cMessage'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const subjectEl = document.getElementById('cSubject');
  if (subjectEl) subjectEl.value = '';
}

/* ============================================================
   FORM 2 — Newsletter Subscription
   Overrides subscribeNL() from script.js
   ============================================================ */
function subscribeNL() {
  const email = document.getElementById('nlEmail').value.trim();
  if (!email || !email.includes('@')) {
    alert('Please enter a valid email address.');
    return;
  }

  saveSubmission('NEWSLETTER SUBSCRIPTION', {
    Email: email,
  });

  const success = document.getElementById('nlSuccess');
  if (success) success.style.display = 'block';

  const nlEmail = document.getElementById('nlEmail');
  if (nlEmail) nlEmail.value = '';
}

/* ============================================================
   FORM 3 — Blog Post (Create / Edit)
   Overrides savePost() from script.js
   ============================================================ */
function savePost() {
  const title    = document.getElementById('postTitle').value.trim();
  const desc     = document.getElementById('postDesc').value.trim();
  if (!title || !desc) {
    alert('Title and description are required.');
    return;
  }

  const editId   = document.getElementById('editPostId').value;
  const author   = document.getElementById('postAuthor').value.trim() || 'Anonymous';
  const category = document.getElementById('postCategory').value;
  const tags     = document.getElementById('postTags').value
                     .split(',').map(t => t.trim()).filter(Boolean);
  const image    = document.getElementById('postImage').value.trim();
  const date     = new Date().toISOString().split('T')[0];
  const id       = editId || Date.now().toString();
  const action   = editId ? 'EDITED' : 'NEW';

  /* ---- save submission log ---- */
  saveSubmission(`BLOG POST — ${action}`, {
    'Post ID'  : id,
    Title      : title,
    Author     : author,
    Category   : category,
    Tags       : tags.join(', ') || '(none)',
    Date       : date,
    'Image URL': image || '(none)',
    Description: desc.length > 200 ? desc.slice(0, 200) + '...' : desc,
  });

  /* ---- update localStorage blog posts (existing logic) ---- */
  const BLOG_KEY = 'bicol_blog_posts';
  let posts;
  try {
    posts = JSON.parse(localStorage.getItem(BLOG_KEY)) || [];
  } catch {
    posts = [];
  }

  const newPost = { id, title, author, category, tags, desc, image, date };

  if (editId) {
    const idx = posts.findIndex(p => p.id === editId);
    if (idx !== -1) posts[idx] = newPost; else posts.unshift(newPost);
  } else {
    posts.unshift(newPost);
  }

  localStorage.setItem(BLOG_KEY, JSON.stringify(posts));

  /* ---- re-render blog & close modal (existing functions) ---- */
  if (typeof renderBlog === 'function') renderBlog();
  if (typeof closeBlogEditor === 'function') closeBlogEditor();
}

/* ============================================================
   BLOG — Delete (audit log)
   Overrides deletePost() from script.js
   ============================================================ */
function deletePost(id) {
  if (!confirm('Delete this post?')) return;

  /* Find post title before deleting */
  const BLOG_KEY = 'bicol_blog_posts';
  let posts;
  try {
    posts = JSON.parse(localStorage.getItem(BLOG_KEY)) || [];
  } catch {
    posts = [];
  }

  const post = posts.find(p => p.id === id);

  saveSubmission('BLOG POST — DELETED', {
    'Post ID': id,
    Title    : post ? post.title : '(unknown)',
    Author   : post ? post.author : '(unknown)',
    Category : post ? post.category : '(unknown)',
  });

  /* Remove from localStorage and re-render */
  const updated = posts.filter(p => p.id !== id);
  localStorage.setItem(BLOG_KEY, JSON.stringify(updated));
  if (typeof renderBlog === 'function') renderBlog();
}

/* ============================================================
   ADMIN PANEL — floating button to download / view submissions
   Protected by a 6-digit passcode: 123456
   ============================================================ */
(function injectAdminPanel() {

  const PASSCODE      = '123456';
  const SESSION_KEY   = 'bakas_admin_auth';   // sessionStorage key
  let   pendingAction = null;                  // callback waiting for auth

  /* ── PASSCODE MODAL ────────────────────────────────────────── */
  const overlay = document.createElement('div');
  overlay.id = 'bakas-passcode-overlay';
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(0,0,0,.75);
    backdrop-filter: blur(6px);
    display: none; align-items: center; justify-content: center;
    font-family: 'Poppins', sans-serif;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: #1a1a1a;
    border: 1px solid rgba(200,162,74,.35);
    border-radius: 16px;
    padding: 2.5rem 2rem 2rem;
    width: 320px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,.7);
    position: relative;
  `;

  /* lock icon */
  const lockIcon = document.createElement('div');
  lockIcon.textContent = '🔒';
  lockIcon.style.cssText = `font-size:2.5rem; margin-bottom:.75rem;`;

  /* title */
  const title = document.createElement('h3');
  title.textContent = 'Admin Access';
  title.style.cssText = `
    font-family: 'Cinzel', serif;
    font-size: 1.1rem; letter-spacing: .12em;
    color: #C8A24A; margin-bottom: .4rem;
  `;

  /* subtitle */
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Enter passcode to continue';
  subtitle.style.cssText = `font-size:.78rem; color:rgba(244,232,208,.45); margin-bottom:1.5rem;`;

  /* dot indicators */
  const dotsRow = document.createElement('div');
  dotsRow.style.cssText = `display:flex; justify-content:center; gap:.6rem; margin-bottom:1.5rem;`;
  const dots = [];
  for (let i = 0; i < 6; i++) {
    const d = document.createElement('div');
    d.style.cssText = `
      width:12px; height:12px; border-radius:50%;
      background: rgba(255,255,255,.12);
      border: 1.5px solid rgba(200,162,74,.3);
      transition: background .15s, border-color .15s;
    `;
    dots.push(d);
    dotsRow.appendChild(d);
  }

  /* error message */
  const errMsg = document.createElement('p');
  errMsg.style.cssText = `
    font-size:.75rem; color:#ff6b6b;
    margin-bottom:.75rem; min-height:1rem;
    transition: opacity .3s;
  `;
  errMsg.textContent = '';

  /* numpad */
  const numpad = document.createElement('div');
  numpad.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: .6rem;
    margin-bottom: .75rem;
  `;

  let entered = '';

  function updateDots() {
    dots.forEach((d, i) => {
      if (i < entered.length) {
        d.style.background     = '#C8A24A';
        d.style.borderColor    = '#C8A24A';
        d.style.boxShadow      = '0 0 8px rgba(200,162,74,.5)';
      } else {
        d.style.background     = 'rgba(255,255,255,.12)';
        d.style.borderColor    = 'rgba(200,162,74,.3)';
        d.style.boxShadow      = 'none';
      }
    });
  }

  function shakeBox() {
    box.style.animation = 'none';
    box.offsetHeight; // reflow
    box.style.animation = 'bakasShake .4s ease';
  }

  function checkPasscode() {
    if (entered === PASSCODE) {
      /* ✅ Correct */
      sessionStorage.setItem(SESSION_KEY, '1');
      closePasscodeModal();
      if (typeof pendingAction === 'function') {
        pendingAction();
        pendingAction = null;
      }
      openMenu();
    } else {
      /* ❌ Wrong */
      errMsg.textContent = 'Incorrect passcode. Try again.';
      shakeBox();
      entered = '';
      updateDots();
      setTimeout(() => errMsg.textContent = '', 2000);
    }
  }

  function pressKey(val) {
    if (val === '⌫') {
      entered = entered.slice(0, -1);
      errMsg.textContent = '';
    } else if (val === '✓') {
      if (entered.length === 6) checkPasscode();
    } else {
      if (entered.length < 6) entered += val;
      if (entered.length === 6) setTimeout(checkPasscode, 120);
    }
    updateDots();
  }

  const keys = ['1','2','3','4','5','6','7','8','9','⌫','0','✓'];
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.textContent = k;
    const isSpecial = k === '⌫' || k === '✓';
    btn.style.cssText = `
      background: ${k === '✓' ? 'rgba(200,162,74,.15)' : k === '⌫' ? 'rgba(139,30,30,.2)' : 'rgba(255,255,255,.06)'};
      border: 1px solid ${isSpecial ? (k === '✓' ? 'rgba(200,162,74,.3)' : 'rgba(139,30,30,.3)') : 'rgba(255,255,255,.1)'};
      color: ${k === '✓' ? '#C8A24A' : '#F4E8D0'};
      border-radius: 10px;
      padding: .85rem .5rem;
      font-size: ${isSpecial ? '1rem' : '1.15rem'};
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      cursor: pointer;
      transition: background .15s, transform .1s;
    `;
    btn.onmouseenter = () => btn.style.transform = 'scale(1.07)';
    btn.onmouseleave = () => btn.style.transform = '';
    btn.onclick = () => pressKey(k);
    numpad.appendChild(btn);
  });

  /* cancel link */
  const cancelLink = document.createElement('button');
  cancelLink.textContent = 'Cancel';
  cancelLink.style.cssText = `
    background: none; border: none;
    color: rgba(244,232,208,.35); font-size:.75rem;
    cursor: pointer; margin-top:.25rem;
    letter-spacing:.08em; transition: color .2s;
  `;
  cancelLink.onmouseenter = () => cancelLink.style.color = '#C8A24A';
  cancelLink.onmouseleave = () => cancelLink.style.color = 'rgba(244,232,208,.35)';
  cancelLink.onclick = closePasscodeModal;

  /* inject shake keyframes */
  const shakeStyle = document.createElement('style');
  shakeStyle.textContent = `
    @keyframes bakasShake {
      0%,100%{ transform:translateX(0); }
      20%    { transform:translateX(-8px); }
      40%    { transform:translateX(8px); }
      60%    { transform:translateX(-6px); }
      80%    { transform:translateX(6px); }
    }
  `;
  document.head.appendChild(shakeStyle);

  /* keyboard support */
  document.addEventListener('keydown', e => {
    if (overlay.style.display !== 'flex') return;
    if (e.key >= '0' && e.key <= '9') pressKey(e.key);
    if (e.key === 'Backspace') pressKey('⌫');
    if (e.key === 'Enter') pressKey('✓');
    if (e.key === 'Escape') closePasscodeModal();
  });

  box.appendChild(lockIcon);
  box.appendChild(title);
  box.appendChild(subtitle);
  box.appendChild(dotsRow);
  box.appendChild(errMsg);
  box.appendChild(numpad);
  box.appendChild(cancelLink);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  function openPasscodeModal(onSuccess) {
    entered = '';
    errMsg.textContent = '';
    updateDots();
    pendingAction    = onSuccess || null;
    overlay.style.display = 'flex';
  }
  function closePasscodeModal() {
    overlay.style.display = 'none';
    entered      = '';
    pendingAction = null;
    updateDots();
  }

  /* Guard helper — run cb only if authenticated this session */
  function requireAuth(cb) {
    if (sessionStorage.getItem(SESSION_KEY) === '1') {
      cb();
    } else {
      openPasscodeModal(cb);
    }
  }

  /* ── FLOATING BUTTON + DROPDOWN MENU ───────────────────────── */
  const panel = document.createElement('div');
  panel.id = 'bakas-admin-panel';
  panel.style.cssText = `
    position: fixed; bottom: 2rem; left: 2rem;
    z-index: 8000;
    display: flex; flex-direction: column; align-items: flex-start;
    gap: .5rem; font-family: 'Poppins', sans-serif;
  `;

  const toggle = document.createElement('button');
  toggle.style.cssText = `
    background: linear-gradient(135deg, #8B1E1E, #C8A24A);
    color: #F4E8D0; border: none;
    padding: .6rem 1.1rem; border-radius: 30px;
    font-size: .78rem; letter-spacing: .1em; cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
    transition: transform .2s, box-shadow .2s;
  `;
  toggle.onmouseenter = () => toggle.style.transform = 'translateY(-2px)';
  toggle.onmouseleave = () => toggle.style.transform = '';

  const menu = document.createElement('div');
  menu.style.cssText = `
    background: #1a1a1a;
    border: 1px solid rgba(200,162,74,.25);
    border-radius: 10px; padding: .75rem;
    display: none; flex-direction: column;
    gap: .5rem; min-width: 210px;
    box-shadow: 0 10px 40px rgba(0,0,0,.6);
  `;

  function makeMenuBtn(label, color, onClick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `
      background: ${color}; color: #F4E8D0; border: none;
      padding: .55rem 1rem; border-radius: 6px;
      font-size: .78rem; letter-spacing: .08em;
      cursor: pointer; text-align: left; transition: opacity .2s;
    `;
    b.onmouseenter = () => b.style.opacity = '.8';
    b.onmouseleave = () => b.style.opacity = '1';
    b.onclick = onClick;
    return b;
  }

  const countEl = document.createElement('p');
  countEl.style.cssText = `font-size:.72rem;color:rgba(244,232,208,.5);padding:.25rem .5rem;margin:0;`;

  function refreshCount() {
    const n = getAllSubmissions().length;
    countEl.textContent = `${n} submission${n !== 1 ? 's' : ''} saved`;
    toggle.textContent  = `📋 Submissions (${n})`;
  }
  refreshCount();

  /* lock icon hint beside count when not authenticated */
  const lockHint = document.createElement('span');
  lockHint.textContent = ' 🔒';
  lockHint.style.cssText = `font-size:.7rem;opacity:.5;`;
  countEl.appendChild(lockHint);

  menu.appendChild(countEl);

  menu.appendChild(makeMenuBtn('⬇ Download submissions.txt', 'rgba(200,162,74,.2)', () => {
    requireAuth(() => { downloadSubmissions(); refreshCount(); });
  }));

  menu.appendChild(makeMenuBtn('👁 Preview in console', 'rgba(42,92,130,.4)', () => {
    requireAuth(() => {
      console.log(formatSubmissionsAsTxt());
      alert('Submissions printed to browser console (F12 → Console).');
    });
  }));

  menu.appendChild(makeMenuBtn('🗑 Clear all submissions', 'rgba(139,30,30,.4)', () => {
    requireAuth(() => {
      if (confirm('Clear ALL saved submissions? This cannot be undone.')) {
        clearSubmissions();
        refreshCount();
      }
    });
  }));

  /* sign-out option (visible only when authenticated) */
  const signOutBtn = makeMenuBtn('🔓 Lock panel', 'rgba(255,255,255,.04)', () => {
    sessionStorage.removeItem(SESSION_KEY);
    open = false;
    menu.style.display = 'none';
    refreshCount();
  });
  menu.appendChild(signOutBtn);

  let open = false;
  function openMenu() {
    open = true;
    menu.style.display = 'flex';
    refreshCount();
  }

  toggle.onclick = () => {
    if (open) {
      open = false;
      menu.style.display = 'none';
    } else {
      requireAuth(openMenu);
    }
  };

  panel.appendChild(menu);
  panel.appendChild(toggle);
  document.body.appendChild(panel);
})();

console.log('%c[BAKAS Forms] form-handler.js loaded — all submissions saved to localStorage + downloadable as .txt', 'color:#C8A24A;');