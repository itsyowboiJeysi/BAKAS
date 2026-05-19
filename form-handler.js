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
   ============================================================ */
(function injectAdminPanel() {
  /* Container */
  const panel = document.createElement('div');
  panel.id = 'bakas-admin-panel';
  panel.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    z-index: 8000;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: .5rem;
    font-family: 'Poppins', sans-serif;
  `;

  /* Toggle button */
  const toggle = document.createElement('button');
  toggle.textContent = '📋 Submissions';
  toggle.style.cssText = `
    background: linear-gradient(135deg, #8B1E1E, #C8A24A);
    color: #F4E8D0;
    border: none;
    padding: .6rem 1.1rem;
    border-radius: 30px;
    font-size: .78rem;
    letter-spacing: .1em;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,.5);
    transition: transform .2s, box-shadow .2s;
  `;
  toggle.onmouseenter = () => toggle.style.transform = 'translateY(-2px)';
  toggle.onmouseleave = () => toggle.style.transform = '';

  /* Dropdown menu */
  const menu = document.createElement('div');
  menu.style.cssText = `
    background: #1a1a1a;
    border: 1px solid rgba(200,162,74,.25);
    border-radius: 10px;
    padding: .75rem;
    display: none;
    flex-direction: column;
    gap: .5rem;
    min-width: 200px;
    box-shadow: 0 10px 40px rgba(0,0,0,.6);
  `;

  function makeMenuBtn(label, color, onClick) {
    const b = document.createElement('button');
    b.textContent = label;
    b.style.cssText = `
      background: ${color};
      color: #F4E8D0;
      border: none;
      padding: .55rem 1rem;
      border-radius: 6px;
      font-size: .78rem;
      letter-spacing: .08em;
      cursor: pointer;
      text-align: left;
      transition: opacity .2s;
    `;
    b.onmouseenter = () => b.style.opacity = '.8';
    b.onmouseleave = () => b.style.opacity = '1';
    b.onclick = onClick;
    return b;
  }

  /* Count badge */
  function getCount() {
    return getAllSubmissions().length;
  }

  const countEl = document.createElement('p');
  countEl.style.cssText = `
    font-size:.72rem;color:rgba(244,232,208,.5);
    padding: .25rem .5rem; margin:0;
  `;

  function refreshCount() {
    const n = getCount();
    countEl.textContent = `${n} submission${n !== 1 ? 's' : ''} saved`;
    toggle.textContent = `📋 Submissions (${n})`;
  }
  refreshCount();

  menu.appendChild(countEl);
  menu.appendChild(makeMenuBtn('⬇ Download submissions.txt', 'rgba(200,162,74,.2)', () => {
    downloadSubmissions();
    refreshCount();
  }));
  menu.appendChild(makeMenuBtn('👁 Preview in console', 'rgba(42,92,130,.4)', () => {
    console.log(formatSubmissionsAsTxt());
    alert('Submissions printed to browser console (F12 → Console).');
  }));
  menu.appendChild(makeMenuBtn('🗑 Clear all submissions', 'rgba(139,30,30,.4)', () => {
    if (confirm('Clear ALL saved submissions? This cannot be undone.')) {
      clearSubmissions();
      refreshCount();
    }
  }));

  /* Toggle visibility */
  let open = false;
  toggle.onclick = () => {
    open = !open;
    menu.style.display = open ? 'flex' : 'none';
    refreshCount();
  };

  panel.appendChild(menu);
  panel.appendChild(toggle);
  document.body.appendChild(panel);
})();

console.log('%c[BAKAS Forms] form-handler.js loaded — all submissions saved to localStorage + downloadable as .txt', 'color:#C8A24A;');