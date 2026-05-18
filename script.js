/* ============================
   BICOL HERITAGE — script.js
   ============================ */

'use strict';

/* ========== LOADER ========== */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
    document.body.style.overflow = 'auto';
    // Trigger hero animations
    document.querySelectorAll('.hero-content .reveal-up').forEach((el, i) => {
      const delay = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), delay + 400);
    });
    startParticles();
    startCounters();
  }, 2400);
});
document.body.style.overflow = 'hidden';

/* ========== CUSTOM CURSOR ========== */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursorDot.style.left  = mouseX + 'px';
  cursorDot.style.top   = mouseY + 'px';
});
function animateCursor() {
  ringX += (mouseX - ringX) * 0.12;
  ringY += (mouseY - ringY) * 0.12;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateCursor);
}
animateCursor();
document.querySelectorAll('a, button, .feat-card, .heritage-card, .blog-card, .gallery-item').forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('expand'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('expand'));
});

/* ========== SCROLL PROGRESS ========== */
window.addEventListener('scroll', () => {
  const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
  document.getElementById('scrollProgress').style.width = (progress * 100) + '%';
});

/* ========== NAVBAR ========== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
  highlightNavLink();
});

/* Active nav link */
function highlightNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollMid = window.scrollY + window.innerHeight / 2;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const bot = top + sec.offsetHeight;
    const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
    if (link) link.classList.toggle('active', scrollMid >= top && scrollMid < bot);
  });
}

/* ========== HAMBURGER / SIDEBAR ========== */
const hamburger      = document.getElementById('hamburger');
const sidebar        = document.getElementById('sidebar');
const sidebarClose   = document.getElementById('sidebarClose');
const sidebarOverlay = document.getElementById('sidebarOverlay');

function openSidebar()  { sidebar.classList.add('open'); sidebarOverlay.classList.add('show'); hamburger.classList.add('open'); }
function closeSidebar() { sidebar.classList.remove('open'); sidebarOverlay.classList.remove('show'); hamburger.classList.remove('open'); }
hamburger.addEventListener('click', openSidebar);
sidebarClose.addEventListener('click', closeSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
document.querySelectorAll('.sidebar-link').forEach(l => l.addEventListener('click', closeSidebar));

/* ========== SMOOTH SCROLLING ========== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ========== INTERSECTION OBSERVER — REVEAL ========== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0);
      setTimeout(() => entry.target.classList.add('visible'), delay);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

function observeReveal() {
  document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right').forEach(el => {
    revealObserver.observe(el);
  });
}
observeReveal();

/* ========== 3D CARD TILT ========== */
document.addEventListener('mousemove', e => {
  document.querySelectorAll('.feat-card-inner, .about-card-3d').forEach(card => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const distX = (e.clientX - cx) / (rect.width / 2);
    const distY = (e.clientY - cy) / (rect.height / 2);
    const maxTilt = 10;
    if (Math.abs(distX) < 1.5 && Math.abs(distY) < 1.5) {
      card.style.transform = `rotateY(${distX * maxTilt}deg) rotateX(${-distY * maxTilt}deg) translateZ(10px)`;
    } else {
      card.style.transform = '';
    }
  });
});

/* ========== PARTICLE CANVAS ========== */
function startParticles() {
  const canvas  = document.getElementById('particleCanvas');
  const ctx     = canvas.getContext('2d');
  let particles = [];
  let W, H;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x    = Math.random() * W;
      this.y    = Math.random() * H;
      this.vx   = (Math.random() - 0.5) * 0.4;
      this.vy   = -Math.random() * 0.6 - 0.2;
      this.life = 0;
      this.maxLife = 120 + Math.random() * 120;
      this.size = Math.random() * 2.5 + 0.5;
      const colors = ['rgba(200,162,74,', 'rgba(217,108,6,', 'rgba(139,30,30,', 'rgba(244,232,208,'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life++;
      if (this.life >= this.maxLife || this.y < -10) this.reset();
    }
    draw() {
      const alpha = Math.sin((this.life / this.maxLife) * Math.PI) * 0.6;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color + alpha + ')';
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) {
    const p = new Particle();
    p.life = Math.random() * p.maxLife; // stagger starts
    particles.push(p);
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ========== COUNTER ANIMATION ========== */
function startCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    let current  = 0;
    const step   = Math.ceil(target / 60);
    const timer  = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = current;
      if (current >= target) clearInterval(timer);
    }, 25);
  });
}

/* ========== HERO PARALLAX ========== */
const heroContent = document.getElementById('heroContent');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if (heroContent) heroContent.style.transform = `translateY(${y * 0.25}px)`;
  document.querySelectorAll('.hero-layer').forEach((l, i) => {
    l.style.transform = `translateY(${y * (0.1 + i * 0.08)}px)`;
  });
  document.querySelector('.volcano-silhouette').style.transform = `translateY(${y * 0.2}px)`;
});

/* ========== HERITAGE SITE MODAL ========== */
const siteData = {
  cagsawa: {
    title: 'Cagsawa Ruins',
    location: '📍 Barangay Busay, Daraga, Albay',
    body: `<p>The Cagsawa Church was built by Franciscan missionary Fray Francisco Blanco in 1724. During the catastrophic eruption of Mayon Volcano on February 1, 1814, thousands of Bicolanos who sought refuge inside the church were buried alive under volcanic ash and lava flow.</p>
    <p>Today, only the baroque bell tower remains visible above ground, creating one of the most photographed images in the Philippines — the elegant tower framed against Mayon's perfect cone. The site was declared a National Cultural Treasure.</p>`,
    facts: [
      { label: 'Built', value: '1724 AD' },
      { label: 'Style', value: 'Baroque' },
      { label: 'Declared', value: 'National Cultural Treasure' },
      { label: 'Event', value: '1814 Mayon Eruption' }
    ]
  },
  daraga: {
    title: 'Our Lady of the Gate Parish (Daraga Church)',
    location: '📍 Daraga, Albay',
    body: `<p>The Daraga Church, officially the Our Lady of the Gate Parish, stands on a hill overlooking the ruins of Cagsawa. Built in 1773 from volcanic stone by Augustinian Recollect missionaries, it features an ornate Baroque facade with four pilasters and niches containing religious figures.</p>
    <p>Despite centuries of volcanic activity and wartime damage, the church remains standing — a testament to the faith and resilience of Bicolanos. It is considered one of the finest examples of Baroque religious architecture in the Philippines.</p>`,
    facts: [
      { label: 'Built', value: '1773 AD' },
      { label: 'Style', value: 'Baroque' },
      { label: 'Order', value: 'Augustinian Recollect' },
      { label: 'Material', value: 'Volcanic Stone' }
    ]
  },
  penafrancia: {
    title: 'Basilica of Our Lady of Peñafrancia',
    location: '📍 Naga City, Camarines Sur',
    body: `<p>The Basilica Minore of Our Lady of Peñafrancia is home to the most venerated image in the Bicol Region — the <em>Ina</em> (Mother). The original image was brought to the Philippines in 1710 by Fray Miguel Robles de la Barca from Salamanca, Spain.</p>
    <p>Every September, the Peñafrancia Festival draws millions of devotees for the fluvial procession — considered the largest religious river procession in the world. The image is transported by boat along the Naga River while devotees wade through the waters crying "Viva la Ina!"</p>`,
    facts: [
      { label: 'Image Arrival', value: '1710 AD' },
      { label: 'Festival', value: 'September' },
      { label: 'Devotees', value: '6 Million annually' },
      { label: 'Status', value: 'Minor Basilica' }
    ]
  },
  mayon: {
    title: 'Mayon Volcano',
    location: '📍 Legazpi City, Albay',
    body: `<p>Mayon Volcano is the most active volcano in the Philippines and is renowned worldwide for its near-perfect symmetrical cone. Standing 2,463 meters above sea level, it has erupted over 50 times in recorded history — the most destructive being the 1814 eruption that buried the Cagsawa Church.</p>
    <p>In Bicolano legend, Mayon was formed from the tragic love story of the warrior Panganoron and the beautiful maiden Magayon (from which the name Mayon is derived). The volcano is considered the spiritual heart of Bicolano identity and the symbol of the region's beauty and power.</p>`,
    facts: [
      { label: 'Height', value: '2,463 meters' },
      { label: 'Eruptions', value: '50+ recorded' },
      { label: 'Last Major', value: '2018' },
      { label: 'Status', value: 'Active Volcano' }
    ]
  },
  quipayo: {
    title: 'Saint Francis of Assisi Parish (Quipayo Church)',
    location: '📍 Quipayo, Camarines Sur',
    body: `<p>The Saint Francis of Assisi Parish in Quipayo is one of the oldest churches in the Bicol region, established by Franciscan missionaries in the late 16th century. Its simple whitewashed facade belies the centuries of history contained within its thick stone walls.</p>
    <p>The church underwent significant reconstruction over the centuries, but has maintained its colonial-era character. It serves as an important pilgrimage site and a living monument to the earliest period of Spanish Christianization in Bicol.</p>`,
    facts: [
      { label: 'Established', value: 'c. 1580s' },
      { label: 'Order', value: 'Franciscan' },
      { label: 'Style', value: 'Colonial' },
      { label: 'Province', value: 'Camarines Sur' }
    ]
  },
  catanduanes: {
    title: 'Catanduanes — The Happy Island',
    location: '📍 Catanduanes Province',
    body: `<p>Catanduanes, nicknamed "The Happy Island," is an island province in the Bicol Region known for its rugged coastlines, pristine beaches, and a culture shaped by centuries of relative isolation. The island sits in the Pacific Ocean, directly in the path of typhoons — yet its people maintain a joyful, resilient character.</p>
    <p>Historically, the island served as a refuge for indigenous Bicolanos and later became a center of resistance during the colonial period. Its distinct Catandunganon dialect, traditional boat-building craft, and unique festivals reflect a heritage apart from the mainland Bicol experience.</p>`,
    facts: [
      { label: 'Capital', value: 'Virac' },
      { label: 'Area', value: '1,512 km²' },
      { label: 'Known For', value: 'Puraran surf, caves' },
      { label: 'Dialect', value: 'Catandunganon' }
    ]
  }
};

function openSiteModal(key) {
  const data    = siteData[key];
  const modal   = document.getElementById('siteModal');
  const content = document.getElementById('modalContent');
  const backdrop = document.getElementById('modalBackdrop');
  if (!data) return;
  const factsHTML = data.facts.map(f => `<div class="modal-fact-item"><strong>${f.label}</strong><span>${f.value}</span></div>`).join('');
  content.innerHTML = `
    <h2>${data.title}</h2>
    <div class="modal-location">${data.location}</div>
    ${data.body}
    <div class="modal-facts">${factsHTML}</div>
  `;
  modal.classList.add('open');
  backdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeSiteModal() {
  document.getElementById('siteModal').classList.remove('open');
  document.getElementById('modalBackdrop').classList.remove('show');
  document.body.style.overflow = '';
}

/* ========== CULTURE TABS ========== */
const cultureData = {
  festivals: [
    { icon: '🎊', title: 'Peñafrancia Festival', desc: 'The world\'s largest fluvial procession held annually in September in Naga City. Millions of devotees accompany the image of Ina (Our Lady of Peñafrancia) along the Naga River.', tag: 'Naga City' },
    { icon: '🐲', title: 'Ibalong Festival', desc: 'A grand street-dance festival in Legazpi City celebrating the epic poem Ibalong — the ancient Bicolano tale of heroic warriors battling wild creatures.', tag: 'Legazpi City' },
    { icon: '🎭', title: 'Pintados-Kasadyaan', desc: 'Celebrating the pre-colonial tattooing tradition of Bicolano warriors. Participants adorn their bodies in traditional patterns and perform ritual dances.', tag: 'Cultural' },
    { icon: '🌸', title: 'Magayon Festival', desc: 'Named after the beautiful maiden of Mayon legend, this festival in Albay celebrates Bicolano culture, food, and the natural beauty of the province.', tag: 'Albay' },
  ],
  cuisine: [
    { icon: '🌶', title: 'Bicol Express', desc: 'The iconic Bicolano dish — pork simmered in coconut milk, shrimp paste (bagoong), and abundant chili peppers. Named after the Manila-to-Bicol train.', tag: 'Signature Dish' },
    { icon: '🥬', title: 'Laing', desc: 'Dried taro leaves cooked in coconut milk with shrimp paste and chili. A staple Bicolano dish rich in flavor and cultural significance.', tag: 'Traditional' },
    { icon: '🍚', title: 'Pinangat', desc: 'Gabi (taro) leaves wrapped around fish or pork with coconut milk and spices, then simmered. A hearty dish particular to the Bicol region.', tag: 'Heritage Recipe' },
    { icon: '🍮', title: 'Pili Nut Delicacies', desc: 'The pili nut (Canarium ovatum) is native to Bicol and used in candies, pastillas, turrones, and local desserts. It\'s Bicol\'s most celebrated export.', tag: 'Native Produce' },
  ],
  language: [
    { icon: '📜', title: 'Central Bikol (Naga)', desc: 'The most widely spoken Bicol dialect, used in Naga City and surrounding areas. It forms the basis of the standardized Bikol language and has a rich oral literary tradition.', tag: 'Primary Dialect' },
    { icon: '🗣', title: 'Rinconada Bikol', desc: 'Spoken in the Rinconada area of Camarines Sur, this dialect is considered one of the most divergent from Central Bikol, with unique vocabulary and intonation patterns.', tag: 'Camarines Sur' },
    { icon: '📖', title: 'Ibalong Epic Poem', desc: 'The ancient Bicolano epic, orally transmitted for centuries and finally transcribed during the Spanish colonial period. It remains the most significant piece of pre-colonial Bicolano literature.', tag: 'Ancient Literature' },
    { icon: '🔤', title: 'Baybayin Script', desc: 'The pre-colonial script used by Bicolanos before Spanish colonization. Revival efforts by modern scholars and artists are restoring this ancient writing system to contemporary use.', tag: 'Indigenous Script' },
  ],
  clothing: [
    { icon: '👘', title: 'Pañuelo & Camisa', desc: 'Traditional Bicolano women\'s attire — the camisa (blouse) with butterfly sleeves and the pañuelo (shawl), often embroidered with floral Bicolano motifs.', tag: 'Women\'s Traditional' },
    { icon: '🧵', title: 'Abaca Weaving', desc: 'Abaca (Manila hemp) is native to Bicol and woven into traditional clothing, mats, and bags. Abaca weaving is a heritage craft particularly vibrant in Camarines Sur.', tag: 'Craft Heritage' },
    { icon: '🪡', title: 'Pineapple Fiber (Piña)', desc: 'Piña fabric woven from pineapple leaf fibers has been produced in Bicol for centuries. The sheer, ivory-colored fabric is used for traditional formal wear.', tag: 'Luxury Textile' },
    { icon: '🏅', title: 'Festival Costumes', desc: 'During Ibalong and Magayon festivals, elaborately crafted costumes depicting pre-colonial warriors, mythological creatures, and Bicolano royalty are showcased in street dances.', tag: 'Festive' },
  ]
};

function renderCulture(tab) {
  const content = document.getElementById('cultureContent');
  const items   = cultureData[tab] || [];
  content.innerHTML = `
    <div class="culture-panel active culture-grid">
      ${items.map(item => `
        <div class="culture-card">
          <div class="culture-card-icon">${item.icon}</div>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
          <span class="ctag">${item.tag}</span>
        </div>
      `).join('')}
    </div>`;
}
renderCulture('festivals');

document.querySelectorAll('.ctab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.ctab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    renderCulture(tab.dataset.tab);
  });
});

/* ========== BLOG SYSTEM (localStorage) ========== */
const BLOG_KEY = 'bicol_blog_posts';

const defaultPosts = [
  {
    id: '1',
    title: 'The Legend of Magayon: Mayon Volcano\'s Tragic Love Story',
    author: 'Dr. Maria Santos',
    category: 'culture',
    tags: ['Mayon', 'Legend', 'Bicolano Folklore'],
    desc: 'Long before Spanish missionaries arrived on Bicolano shores, the locals already had a name for the magnificent volcano that dominated their landscape. Daragang Magayon — the beautiful maiden — was the daughter of the chieftain Makusog. Her tragic love story with the warrior Panganoron is said to have given birth to the volcano we now call Mayon.',
    image: 'images/magayon-blog.jpg',
    date: '2025-01-15',
  },
  {
    id: '2',
    title: 'Cagsawa Ruins: A Church Frozen in Time by Volcanic Fire',
    author: 'Prof. Ramon Villanueva',
    category: 'heritage',
    tags: ['Cagsawa', 'Colonial', 'Mayon Eruption'],
    desc: 'On February 1, 1814, the people of Cagsawa gathered in their church for what they believed would be sanctuary. When Mayon erupted with violent force, the lava flows reached the church walls. Today, the bell tower that rises from the earth is more than a ruin — it is a monument to those 1,200 souls.',
    image: 'images/cagsawa-blog.jpg',
    date: '2025-02-01',
  },
  {
    id: '3',
    title: 'The Ibalong Epic: Bicol\'s Pre-Colonial Literary Masterpiece',
    author: 'Prof. Ana Reyes',
    category: 'history',
    tags: ['Ibalong', 'Epic', 'Pre-Colonial', 'Literature'],
    desc: 'Before the Spaniards arrived with quill and scripture, Bicolanos already had their own epic tradition. The Ibalong is a fragmentary epic poem about three successive heroic figures: Baltog who tamed a wild boar, Handyong who cleared the land, and Bantong who slew the fearsome Rabago. It was first transcribed by Franciscan missionaries in the 16th century.',
    image: 'images/ibalong-blog.jpg',
    date: '2025-03-10',
  },
  {
    id: '4',
    title: 'Peñafrancia Festival: A Million Voices Crying "Viva la Ina!"',
    author: 'Journalist Rosa Dizon',
    category: 'festivals',
    tags: ['Peñafrancia', 'Naga', 'Festival', 'Devotion'],
    desc: 'Every September, Naga City transforms into a sea of candles and devotion. The image of Our Lady of Peñafrancia — the Ina — is carried from the Peñafrancia Shrine to the Metropolitan Cathedral, then returned by river in the grand fluvial procession. With over six million devotees, it is considered the largest religious festival in Asia.',
    image: 'images/penafrancia-blog.jpg',
    date: '2025-04-05',
  },
  {
    id: '5',
    title: 'Bicol Express: The Fiery Dish That Defined a Region',
    author: 'Chef Lina Bautista',
    category: 'culture',
    tags: ['Food', 'Bicol Express', 'Cuisine', 'Heritage'],
    desc: 'The story of Bicol Express is as spicy as the dish itself. Named after the famous Manila-to-Bicol railway, this pork-and-coconut-milk stew is seasoned with generous amounts of siling labuyo (bird\'s eye chili). More than just a recipe, it represents the Bicolano love for bold, intense flavors — a culinary identity shaped by the land\'s volcanic soil and abundant coconut groves.',
    image: 'images/bicolexpress-blog.jpg',
    date: '2025-04-20',
  },
];

function getBlogPosts() {
  try {
    const stored = localStorage.getItem(BLOG_KEY);
    return stored ? JSON.parse(stored) : [...defaultPosts];
  } catch {
    return [...defaultPosts];
  }
}
function saveBlogPosts(posts) {
  try { localStorage.setItem(BLOG_KEY, JSON.stringify(posts)); } catch {}
}

let currentFilter = 'all';
let currentSearch = '';

function renderBlog() {
  const posts  = getBlogPosts();
  const grid   = document.getElementById('blogGrid');

  let filtered = posts.filter(p => {
    const matchCat  = currentFilter === 'all' || p.category === currentFilter;

    const query = currentSearch.toLowerCase();

    const matchSearch =
      !query ||
      p.title.toLowerCase().includes(query) ||
      p.desc.toLowerCase().includes(query) ||
      (p.tags || []).some(t => t.toLowerCase().includes(query));

    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-blog">
        <div class="empty-icon">📜</div>
        <p>No posts found. Be the first to write!</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(p => {

    const catClass = `cat-${p.category}`;

    const tagsHTML = (p.tags || [])
      .map(t => `<span class="blog-tag">#${t}</span>`)
      .join('');

    // IMAGE SECTION
    const imgHTML = p.image
      ? `
        <img
          src="${p.image}"
          alt="${p.title}"
          class="blog-post-image"
          loading="lazy"
          onerror="this.src='images/default-blog.jpg'"
        />
      `
      : `
        <img
          src="images/default-blog.jpg"
          alt="Default Blog"
          class="blog-post-image"
        />
      `;

    return `
      <div class="blog-card"
           data-id="${p.id}"
           data-cat="${p.category}">

        <div class="blog-card-img">
          ${imgHTML}
          <span class="blog-cat-badge ${catClass}">
            ${p.category}
          </span>
        </div>

        <div class="blog-card-body">

          <div class="blog-meta">
            <span>✍ ${p.author || 'Anonymous'}</span>
            <span>📅 ${formatDate(p.date)}</span>
          </div>

          <h3>${p.title}</h3>

          <p>${p.desc}</p>

          <div class="blog-card-tags">
            ${tagsHTML}
          </div>

        </div>

        <div class="blog-card-actions">
          <button class="blog-action-btn edit"
                  onclick="editPost('${p.id}')">
            ✏ Edit
          </button>

          <button class="blog-action-btn del"
                  onclick="deletePost('${p.id}')">
            🗑 Delete
          </button>
        </div>

      </div>
    `;
  }).join('');
}
function catIcon(cat) {
  const icons = { history:'📜', culture:'🎭', heritage:'⛪', festivals:'🎊' };
  return icons[cat] || '📝';
}
function formatDate(d) {
  try { return new Date(d).toLocaleDateString('en-PH', { year:'numeric', month:'long', day:'numeric' }); }
  catch { return d; }
}

/* Blog Search & Filter */
document.getElementById('blogSearch').addEventListener('input', e => {
  currentSearch = e.target.value;
  renderBlog();
});
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.cat;
    renderBlog();
  });
});

/* Blog Editor Modal */
let uploadedImageUrl = '';

function openBlogEditor(postId = null) {
  const modal   = document.getElementById('blogModal');
  const backdrop = document.getElementById('blogBackdrop');
  document.getElementById('blogModalTitle').textContent = postId ? 'Edit Post' : 'Create New Post';
  document.getElementById('editPostId').value = postId || '';
  uploadedImageUrl = '';
  document.getElementById('uploadPreview').innerHTML = '';
  if (postId) {
    const post = getBlogPosts().find(p => p.id === postId);
    if (post) {
      document.getElementById('postTitle').value  = post.title;
      document.getElementById('postAuthor').value = post.author || '';
      document.getElementById('postCategory').value = post.category;
      document.getElementById('postTags').value   = (post.tags || []).join(', ');
      document.getElementById('postDesc').value   = post.desc;
      document.getElementById('postImage').value  = post.image || '';
    }
  } else {
    ['postTitle','postAuthor','postTags','postDesc','postImage'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('postCategory').value = 'history';
  }
  modal.classList.add('open');
  backdrop.classList.add('show');
  document.body.style.overflow = 'hidden';
}
function closeBlogEditor() {
  document.getElementById('blogModal').classList.remove('open');
  document.getElementById('blogBackdrop').classList.remove('show');
  document.body.style.overflow = '';
}
function editPost(id)   { openBlogEditor(id); }
function deletePost(id) {
  if (!confirm('Delete this post?')) return;
  const posts = getBlogPosts().filter(p => p.id !== id);
  saveBlogPosts(posts);
  renderBlog();
}
function savePost() {
  const title = document.getElementById('postTitle').value.trim();
  const desc  = document.getElementById('postDesc').value.trim();
  if (!title || !desc) { alert('Title and description are required.'); return; }
  const posts  = getBlogPosts();
  const editId = document.getElementById('editPostId').value;
  const newPost = {
    id:       editId || Date.now().toString(),
    title,
    author:   document.getElementById('postAuthor').value.trim() || 'Anonymous',
    category: document.getElementById('postCategory').value,
    tags:     document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(Boolean),
    desc,
    image:    uploadedImageUrl || document.getElementById('postImage').value.trim(),
    date:     new Date().toISOString().split('T')[0],
  };
  if (editId) {
    const idx = posts.findIndex(p => p.id === editId);
    if (idx !== -1) posts[idx] = newPost; else posts.unshift(newPost);
  } else {
    posts.unshift(newPost);
  }
  saveBlogPosts(posts);
  renderBlog();
  closeBlogEditor();
}

/* Image Upload in Blog Editor */
const uploadArea = document.getElementById('uploadArea');
const imageUpload = document.getElementById('imageUpload');
uploadArea.addEventListener('click', () => imageUpload.click());
uploadArea.addEventListener('dragover', e => { e.preventDefault(); uploadArea.classList.add('drag-over'); });
uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
uploadArea.addEventListener('drop', e => {
  e.preventDefault(); uploadArea.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) previewUpload(file);
});
imageUpload.addEventListener('change', e => { if (e.target.files[0]) previewUpload(e.target.files[0]); });
function previewUpload(file) {
  const reader = new FileReader();
  reader.onload = e => {
    uploadedImageUrl = e.target.result;
    document.getElementById('uploadPreview').innerHTML = `<img src="${uploadedImageUrl}" style="max-height:150px;border-radius:8px;margin-top:.5rem;" />`;
  };
  reader.readAsDataURL(file);
}

/* Init Blog */
renderBlog();

/* ========== GALLERY ========== */
const galleryItems = [
  { icon:'⛪', label:'Cagsawa Bell Tower', cat:'churches', img:'images/cagsawa.jpg' },
  { icon:'🌋', label:'Mayon Volcano at Sunrise', cat:'nature', img:'images/mayon.jpg' },
  { icon:'🎊', label:'Peñafrancia Fluvial Procession', cat:'festivals', img:'images/penafrancia.jpg' },
  { icon:'🏛', label:'Daraga Church Facade', cat:'churches', img:'images/daraga-facade.jpg' },
  { icon:'🌿', label:'Bicol River Delta', cat:'nature', img:'images/bicol-river.jpg' },
  { icon:'🎭', label:'Ibalong Festival Dance', cat:'festivals', img:'images/ibalong.jpg' },
  { icon:'🥥', label:'Coconut Harvest', cat:'culture', img:'images/coconut.jpg' },
  { icon:'🏝', label:'Catanduanes Coastline', cat:'nature', img:'images/catanduanes.jpg' },
  { icon:'📿', label:'Traditional Abaca Weaving', cat:'culture', img:'images/abaca.jpg' },
  { icon:'⛪', label:'Daraga Church Interior', cat:'churches', img:'images/daraga-interior.jpg' },
  { icon:'🌸', label:'Magayon Festival Parade', cat:'festivals', img:'images/magayon.jpg' },
  { icon:'🌶', label:'Bicolano Siling Labuyo', cat:'culture', img:'images/sili.jpg' },
];

function renderGallery(filter = 'all') {
  const grid = document.getElementById('galleryGrid');

  const items = filter === 'all'
    ? galleryItems
    : galleryItems.filter(i => i.cat === filter);

  grid.innerHTML = items.map((item, idx) => `
    <div class="gallery-item"
         data-cat="${item.cat}"
         data-idx="${idx}"
         onclick="openLightbox(${idx})">

      <img src="${item.img}" alt="${item.label}" class="gallery-img">

      <div class="gallery-overlay">
        <span class="gi-icon">${item.icon}</span>
        <span class="gi-label">${item.label}</span>
      </div>

    </div>
  `).join('');
}

renderGallery();

document.querySelectorAll('.gfilter').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.gfilter').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderGallery(btn.dataset.gcat);
  });
});

/* Gallery Upload */
const galleryUpload = document.getElementById('galleryUpload');
const galleryUploaded = document.getElementById('galleryUploads');
const galleryUploadArea = document.getElementById('galleryUploadArea');

galleryUploadArea.addEventListener('click', () => galleryUpload.click());
galleryUploadArea.addEventListener('dragover', e => { e.preventDefault(); galleryUploadArea.classList.add('drag-over'); });
galleryUploadArea.addEventListener('dragleave', () => galleryUploadArea.classList.remove('drag-over'));
galleryUploadArea.addEventListener('drop', e => {
  e.preventDefault(); galleryUploadArea.classList.remove('drag-over');
  handleGalleryFiles(e.dataTransfer.files);
});
galleryUpload.addEventListener('change', e => handleGalleryFiles(e.target.files));

function handleGalleryFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.alt = file.name;
      galleryUploaded.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

/* Lightbox */
let lbCurrentIdx = 0;
function openLightbox(idx) {
  lbCurrentIdx = idx;
  const item = galleryItems[idx];
  const lbImg = document.getElementById('lbImg');
  lbImg.src = ''; lbImg.alt = item.label;
  lbImg.style.display = 'none';
  document.getElementById('lbCaption').textContent = item.label;
  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lbBackdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
  // Show emoji fallback
  const inner = document.querySelector('.lb-inner');
  let placeholder = inner.querySelector('.lb-placeholder');
  if (!placeholder) {
    placeholder = document.createElement('div');
    placeholder.className = 'lb-placeholder';
    placeholder.style.cssText = 'font-size:8rem;text-align:center;padding:2rem;';
    inner.insertBefore(placeholder, lbImg);
  }
  placeholder.textContent = item.icon;
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lbBackdrop').classList.remove('show');
  document.body.style.overflow = '';
}
function lbPrev() {
  lbCurrentIdx = (lbCurrentIdx - 1 + galleryItems.length) % galleryItems.length;
  openLightbox(lbCurrentIdx);
}
function lbNext() {
  lbCurrentIdx = (lbCurrentIdx + 1) % galleryItems.length;
  openLightbox(lbCurrentIdx);
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeLightbox(); closeSiteModal(); closeBlogEditor(); }
  if (e.key === 'ArrowLeft') lbPrev();
  if (e.key === 'ArrowRight') lbNext();
});

/* ========== CONTACT FORM ========== */
function sendContact() {
  const name    = document.getElementById('cName').value.trim();
  const email   = document.getElementById('cEmail').value.trim();
  const message = document.getElementById('cMessage').value.trim();
  if (!name || !email || !message) { alert('Please fill in all fields.'); return; }
  // Simulate send
  document.getElementById('contactSuccess').style.display = 'block';
  ['cName','cEmail','cMessage'].forEach(id => document.getElementById(id).value = '');
  setTimeout(() => document.getElementById('contactSuccess').style.display = 'none', 5000);
}

/* ========== NEWSLETTER ========== */
function subscribeNL() {
  const email = document.getElementById('nlEmail').value.trim();
  if (!email) return;
  document.getElementById('nlSuccess').style.display = 'block';
  document.getElementById('nlEmail').value = '';
}

/* ========== MOUSE PARALLAX on hero ========== */
document.addEventListener('mousemove', e => {
  const pct = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 };
  const l1  = document.querySelector('.hero-layer.l1');
  const l2  = document.querySelector('.hero-layer.l2');
  if (l1) l1.style.transform = `translate(${pct.x * 10}px, ${pct.y * 8}px)`;
  if (l2) l2.style.transform = `translate(${pct.x * 20}px, ${pct.y * 15}px)`;
});

/* ========== GLOWING DOTS ON TIMELINE ========== */
const tlObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const dot = entry.target.querySelector('.timeline-dot');
      if (dot) dot.style.animation = 'dotPulse 1.5s ease-in-out infinite';
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.timeline-item').forEach(el => tlObserver.observe(el));

/* Inject dot pulse keyframes */
const style = document.createElement('style');
style.textContent = `
@keyframes dotPulse {
  0%,100%{box-shadow:0 0 0 3px var(--gold),0 0 20px var(--gold);}
  50%{box-shadow:0 0 0 6px rgba(200,162,74,.3),0 0 40px rgba(200,162,74,.6);}
}`;
document.head.appendChild(style);

console.log('%cBICOL HERITAGE ARCHIVE', 'color:#C8A24A;font-family:serif;font-size:18px;font-weight:bold;');
console.log('%cCultural preservation through code.', 'color:#888;font-size:12px;');
