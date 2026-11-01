/**
 * GDG on Campus MMMUT - Official Vanilla JavaScript
 * Clean, modular, accessible and highly performant scripts.
 */

import {
  validateContactForm,
  calculateParallaxOffset,
  formatStatCounter,
  getInitialTheme,
  shouldSkipIntro,
  lerp,
} from './src/utils/community-logic.js';

document.addEventListener('DOMContentLoaded', () => {
  initIntroAnimation();
  initTheme();
  initParallaxEffects();
  initTeamCursorFollower();
  initNavbar();
  initStatsObserver();
  initModals();
  initContactForm();
  initAIChat();
});

/* ===================================================
   0. GOOGLE-INSPIRED INTRO ANIMATION SCREEN
=================================================== */
function initIntroAnimation() {
  const overlay = document.getElementById('googleIntroOverlay');
  const skipBtn = document.getElementById('introSkipBtn');
  const matrixContainer = document.getElementById('introCodeMatrix');
  const progressBar = document.getElementById('introProgressBar');
  if (!overlay) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (shouldSkipIntro(window.location.search, prefersReducedMotion)) {
    overlay.classList.add('dismissed');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 100);
    return;
  }

  // Populate dynamic matrix streams of digits & code fragments
  if (matrixContainer) {
    const codeSnippets = [
      '01001101 01001111 01000011 // MIND OVER CHARACTER',
      'const GDG = new CampusCommunity("MMMUT");',
      'function innovate() { return buildFuture(); }',
      '101010011010111001010101001110',
      'import { Code, Coffee, Community } from "gdg";',
      'git commit -m "feat: mind over character engine"',
      '01101101 01101001 01101110 01100100',
      'POST /api/buildathon/register HTTP/2.0',
      'while(curious) { learn(); build(); connect(); }',
      '11001010 11110000 00110011 10101010',
      'const IMPACT = 1000; // Gorakhpur Devs',
      'export default function TeamMMMUT() { return true; }',
      '01000011 01001000 01000001 01010010',
    ];

    const columnCount = Math.min(16, Math.floor(window.innerWidth / 70));
    const colors = ['', 'col-green', 'col-yellow', 'col-red'];

    for (let i = 0; i < columnCount; i++) {
      const col = document.createElement('div');
      col.className = `code-stream-col ${colors[i % colors.length]}`;
      col.style.left = `${(i / columnCount) * 100 + (Math.random() * 4 - 2)}%`;
      col.style.animationDuration = `${3.2 + Math.random() * 2.4}s`;
      col.style.animationDelay = `${Math.random() * 1.5}s`;
      col.style.fontSize = `${0.68 + Math.random() * 0.22}rem`;

      // Build 8-12 lines of random code tokens
      let content = '';
      const lineCount = 10;
      for (let j = 0; j < lineCount; j++) {
        content += codeSnippets[Math.floor(Math.random() * codeSnippets.length)] + '\n';
      }
      col.textContent = content;
      matrixContainer.appendChild(col);
    }
  }

  // 4.6 seconds total intro sequence
  const INTRO_DURATION = 4600;
  const startTime = performance.now();
  let dismissed = false;
  let rafId = null;

  function dismissIntro() {
    if (dismissed) return;
    dismissed = true;
    if (rafId) cancelAnimationFrame(rafId);
    overlay.classList.add('dismissed');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 700);
  }

  // Animate progress bar smoothly
  function updateProgress(now) {
    if (dismissed) return;
    const elapsed = now - startTime;
    const pct = Math.min(100, (elapsed / INTRO_DURATION) * 100);
    if (progressBar) {
      progressBar.style.width = `${pct}%`;
    }

    if (elapsed < INTRO_DURATION) {
      rafId = requestAnimationFrame(updateProgress);
    } else {
      dismissIntro();
    }
  }

  rafId = requestAnimationFrame(updateProgress);

  skipBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    dismissIntro();
  });

  overlay.addEventListener('click', () => {
    dismissIntro();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      dismissIntro();
    }
  }, { once: true });
}

/* ===================================================
   0.1 TEAM NAME CURSOR FOLLOWER IN BLURRED BACKGROUND
=================================================== */
function initTeamCursorFollower() {
  const follower = document.getElementById('teamCursorFollower');
  if (!follower) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (prefersReducedMotion || isTouchDevice) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;
  let isTicking = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!isTicking) {
      isTicking = true;
      requestAnimationFrame(renderFollower);
    }
  }, { passive: true });

  function renderFollower() {
    // Ultra-smooth spring lerp with subtle trailing delay and dynamic tilt
    const dx = mouseX - currentX;
    const dy = mouseY - currentY;

    currentX = lerp(currentX, mouseX + 16, 0.08);
    currentY = lerp(currentY, mouseY + 16, 0.08);

    const tilt = Math.max(-10, Math.min(10, dx * 0.12));

    follower.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) rotate(${tilt}deg)`;

    if (Math.abs(mouseX + 16 - currentX) > 0.1 || Math.abs(mouseY + 16 - currentY) > 0.1) {
      requestAnimationFrame(renderFollower);
    } else {
      isTicking = false;
    }
  }
}

/* ===================================================
   1. THEME MANAGER (DARK / LIGHT MODE)
=================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  if (!themeToggleBtn) return;

  const storedTheme = localStorage.getItem('gdg_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const currentTheme = getInitialTheme(storedTheme, prefersDark);

  applyTheme(currentTheme);

  themeToggleBtn.addEventListener('click', () => {
    const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = activeTheme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    localStorage.setItem('gdg_theme', nextTheme);
  });

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      if (theme === 'dark') {
        // Moon Icon
        themeIcon.innerHTML = `
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        `;
      } else {
        // Sun Icon
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        `;
      }
    }
  }
}

/* ===================================================
   2. SPECIAL BACKGROUND & SIGNATURE HERO PARALLAX
=================================================== */
function initParallaxEffects() {
  const heroGdgBackdrop = document.getElementById('heroGdgBackdrop');
  const orbContainer = document.getElementById('orbContainer');

  // Check if reduced motion or touch device
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (prefersReducedMotion || isTouchDevice || !heroGdgBackdrop) {
    return;
  }

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  let isMoving = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    const offset = calculateParallaxOffset(
      mouseX,
      mouseY,
      window.innerWidth / 2,
      window.innerHeight / 2,
      45 // max displacement in pixels
    );

    targetX = offset.x;
    targetY = offset.y;

    if (!isMoving) {
      isMoving = true;
      requestAnimationFrame(updateParallax);
    }
  });

  function updateParallax() {
    // Smooth lerp damping
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;

    // Apply 3D perspective translation
    if (heroGdgBackdrop) {
      heroGdgBackdrop.style.transform = `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px)) rotateX(${-currentY * 0.15}deg) rotateY(${currentX * 0.15}deg)`;
    }

    if (orbContainer) {
      orbContainer.style.transform = `translate(${currentX * 0.5}px, ${currentY * 0.5}px)`;
    }

    // Continue loop until close to target
    if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
      requestAnimationFrame(updateParallax);
    } else {
      isMoving = false;
    }
  }
}

/* ===================================================
   3. NAVBAR BEHAVIOR & MOBILE DRAWER
=================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileNavDrawer = document.getElementById('mobileNavDrawer');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  // Sticky navbar shadow on scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
    highlightActiveSection();
  }, { passive: true });

  // Mobile menu toggle
  hamburgerBtn?.addEventListener('click', () => {
    const isOpen = hamburgerBtn.classList.toggle('active');
    mobileNavDrawer?.classList.toggle('open', isOpen);
    hamburgerBtn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      document.getElementById('aiChatWindow')?.classList.remove('open');
    }
  });

  // Close drawer when clicking nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      hamburgerBtn?.classList.remove('active');
      mobileNavDrawer?.classList.remove('open');
      hamburgerBtn?.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (
      mobileNavDrawer?.classList.contains('open') &&
      !mobileNavDrawer.contains(e.target) &&
      !hamburgerBtn?.contains(e.target)
    ) {
      hamburgerBtn?.classList.remove('active');
      mobileNavDrawer?.classList.remove('open');
      hamburgerBtn?.setAttribute('aria-expanded', 'false');
    }
  });

  function highlightActiveSection() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach((link) => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

/* ===================================================
   4. COMMUNITY STATS ANIMATION
=================================================== */
function initStatsObserver() {
  const statsContainer = document.getElementById('statsContainer');
  if (!statsContainer) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateAllCounters();
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  observer.observe(statsContainer);

  function animateAllCounters() {
    const statElements = document.querySelectorAll('.stat-number');
    statElements.forEach((el) => {
      const target = parseInt(el.getAttribute('data-target') || '0', 10);
      const suffix = el.getAttribute('data-suffix') || '';
      animateCounter(el, target, suffix, 1600);
    });
  }

  function animateCounter(element, target, suffix, duration) {
    let startTimestamp = null;

    function step(timestamp) {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easedProgress * target);

      element.textContent = formatStatCounter(currentVal, target, suffix);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = formatStatCounter(target, target, suffix);
      }
    }

    window.requestAnimationFrame(step);
  }
}

/* ===================================================
   5. PROJECT & EVENT DETAILS MODALS
=================================================== */
const PROJECTS_DATA = {
  campusconnect: {
    title: 'CampusConnect',
    subtitle: 'Student Campus Discovery & Collaborative Web Portal',
    tags: ['HTML5', 'CSS3', 'JavaScript', 'REST API', 'ServiceWorker'],
    problemSolved: 'Students across 8 MMMUT engineering departments missed departmental hackathons, club drives, and lab access notices because communications were scattered across fragmented WhatsApp groups and physical noticeboards.',
    metrics: [
      { label: 'Active MMMUT Students', val: '420+' },
      { label: 'Monthly Event RSVPs', val: '1.2k' },
      { label: 'Avg Page Load', val: '450ms' },
      { label: 'GitHub Stars', val: '94 ★' },
    ],
    desc: 'CampusConnect is an open-source progressive web application engineered by MMMUT student developers. It unifies college-wide events, hackathons, coding workshops, and peer project collaborations into one lightning-fast, offline-capable dashboard.',
    highlights: [
      'Interactive campus events timeline with tag-based filtering by branch and tech track',
      'Decentralized club announcement feed with student peer verification',
      'Zero-dependency vanilla architecture achieving a perfect 100 Lighthouse performance score',
      'Offline caching via ServiceWorker for reliable access in low-connectivity campus spots',
    ],
    status: 'Production v1.4 • Actively maintained by GDG MMMUT core contributors',
  },
  devtrack: {
    title: 'DevTrack',
    subtitle: 'Developer Progress, DSA Mastery & Consistency Engine',
    tags: ['JavaScript', 'Node.js', 'Express', 'LeetCode API', 'MongoDB'],
    problemSolved: 'Pre-final and final year MMMUT students struggled to maintain consistent daily programming habits, track cross-platform DSA problem solving across LeetCode/CodeChef, and find accountability partners for tech placements.',
    metrics: [
      { label: 'Registered Devs', val: '280+' },
      { label: 'Problems Solved', val: '8,400+' },
      { label: 'Placement Offers', val: '45+' },
      { label: 'Weekly Streaks', val: '92%' },
    ],
    desc: 'DevTrack gives student engineers a centralized dashboard to track coding streaks, measure DSA progression against curated placement roadmaps, and compare peer velocity on a friendly college leaderboard.',
    highlights: [
      'Automated daily GitHub commit streak and LeetCode problem submission polling',
      'Topic-wise DSA mastery checklist covering Graphs, Dynamic Programming, and System Design',
      'Smart pair-programming matcher pairing developers with similar problem targets',
      'Automated mock technical interview scheduling with senior student alumni',
    ],
    status: 'Beta v2.1 • Deployed on Cloud Run • 280+ MMMUT developers enrolled',
  },
  ecosense: {
    title: 'EcoSense IoT',
    subtitle: 'Smart Environmental IoT Monitoring & Energy Analytics',
    tags: ['ESP32', 'C++', 'WebSockets', 'Chart.js', 'Hardware IoT'],
    problemSolved: 'MMMUT computer labs and seminar halls often faced poor ventilation, high temperature fluctuations, and unnecessary power consumption from air conditioners left running in vacant lecture rooms.',
    metrics: [
      { label: 'Sensors Deployed', val: '14 Units' },
      { label: 'Power Reduction', val: '18%' },
      { label: 'Data Points/Min', val: '120' },
      { label: 'Hackathon Award', val: '1st Prize' },
    ],
    desc: 'EcoSense combines edge microcontroller hardware (ESP32) with a real-time vanilla web dashboard to monitor indoor air quality, ambient acoustics, and heat distribution across campus laboratories.',
    highlights: [
      'Distributed ESP32 sensor mesh broadcasting telemetry over MQTT and WebSockets',
      'Zero-latency live temperature, humidity, and CO2 heatmaps rendered in browser',
      'Automated alerts triggered when ambient noise or air metrics cross healthy thresholds',
      'Low-power hardware firmware featuring solar trickle charging and local flash storage backup',
    ],
    status: 'Hardware Prototype + Live Web Dashboard • Demonstrated at MMMUT Tech Expo',
  },
  papervault: {
    title: 'PaperVault MMMUT',
    subtitle: 'Curated University Question Papers, Notes & Solutions',
    tags: ['Vanilla JS', 'IndexedDB', 'Cloudflare CDN', 'Open Source'],
    problemSolved: 'Finding authentic past semester question papers, handwritten lecture notes, and syllabus blueprints required hunting through expired Google Drive links and cluttered Telegram channels before major exams.',
    metrics: [
      { label: 'Papers Archived', val: '1,200+' },
      { label: 'Subjects Covered', val: '68' },
      { label: 'Monthly Downloads', val: '3,800+' },
      { label: 'Search Speed', val: '< 15ms' },
    ],
    desc: 'PaperVault is a lightning-fast, ad-free repository of previous year questions (PYQs) and topper notes categorized by semester, branch, and subject code for all MMMUT undergraduate programs.',
    highlights: [
      'Instant client-side fuzzy search across 1,200+ verified semester question papers',
      'Offline PDF saving using browser IndexedDB storage for studying without internet',
      'Peer upload review pipeline ensuring only authentic university papers are published',
      'Zero advertising, zero paywalls — 100% free community resource for MMMUT students',
    ],
    status: 'Community Project • 1,200+ Papers Indexed • Used by 1st to 4th year students',
  },
};

const EVENTS_DATA = {
  'code-coffee': {
    title: 'Code & Coffee: MMMUT Edition',
    date: '15 NOV 2026',
    time: '10:00 AM – 1:00 PM',
    venue: 'MMMUT Student Activity Center / Central Lawn',
    type: 'Community Meetup',
    desc: 'An informal Saturday morning gathering for student programmers of all skill levels. Bring your laptop, grab some freshly brewed coffee, demo your weekend projects, and exchange ideas on open source and tech stacks.',
    agenda: [
      '10:00 AM: Check-in, Coffee & Warmup Chit-Chat',
      '10:30 AM: 5-minute Lightning Talks & Project Showcases',
      '11:30 AM: Collaborative Hacking & Mentorship Circles',
      '12:45 PM: Community Photo & Upcoming Hackathon Teaser',
    ],
  },
  'web-workshop': {
    title: 'Modern Web Development Workshop',
    date: '22 NOV 2026',
    time: '2:00 PM – 5:30 PM',
    venue: 'Computer Center Lab 2, MMMUT',
    type: 'Hands-on Workshop',
    desc: 'A comprehensive, zero-to-one workshop covering the core pillars of web engineering: semantic HTML5, modern CSS3 layout math (Flexbox & Grid), asynchronous JavaScript, and REST APIs.',
    agenda: [
      '2:00 PM: Core Web Architecture & DOM Fundamentals',
      '2:45 PM: Mastering Layouts without CSS Framework Overkill',
      '3:45 PM: Live Coding a Weather & Campus Feed Dashboard',
      '5:00 PM: Q&A, Deployment to Netlify/Vercel, and Swag Distribution',
    ],
  },
  'buildathon': {
    title: 'Buildathon @ MMMUT 2026',
    date: '06 DEC 2026',
    time: '9:00 AM (24-Hour Sprint)',
    venue: 'Aryabhatta Hall / Main Seminar Complex',
    type: 'College Hackathon',
    desc: 'Our premier annual student hackathon! Team up in groups of 2 to 4 to design, code, and pitch functional prototypes addressing problems in education, sustainability, healthcare, and developer tooling.',
    agenda: [
      '09:00 AM: Opening Keynote & Problem Statement Reveal',
      '10:00 AM: Hacking Begins & Mentorship Checkpoint 1',
      '08:00 PM: Midnight Energy Surge & Code Review',
      '09:00 AM (+1 Day): Final Pitching to Industry Judges & Awards',
    ],
  },
};

function initModals() {
  const modalOverlay = document.getElementById('modalOverlay');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalDynamicBody = document.getElementById('modalDynamicBody');

  function openModal(htmlContent) {
    if (!modalOverlay || !modalDynamicBody) return;
    modalDynamicBody.innerHTML = htmlContent;
    modalOverlay.classList.add('open');
    modalOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('open');
    modalOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  modalCloseBtn?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay?.classList.contains('open')) {
      closeModal();
    }
  });

  // Project cards event listeners
  document.querySelectorAll('[data-project]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const projId = btn.getAttribute('data-project');
      const data = PROJECTS_DATA[projId];
      if (!data) return;

      const metricsHtml = data.metrics
        ? `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem;">
            ${data.metrics.map(m => `
              <div style="background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-sm); padding: 0.6rem 0.8rem; text-align: center;">
                <div style="font-size: 1.15rem; font-weight: 800; color: var(--google-blue); font-family: var(--font-mono);">${m.val}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em;">${m.label}</div>
              </div>
            `).join('')}
           </div>`
        : '';

      const problemHtml = data.problemSolved
        ? `<div style="padding: 1rem 1.25rem; background: rgba(66, 133, 244, 0.08); border-left: 3px solid var(--google-blue); border-radius: var(--radius-sm); margin-bottom: 1.5rem;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--google-blue); letter-spacing: 0.06em; margin-bottom: 0.35rem;">
              🎯 Real Problem Solved
            </div>
            <div style="font-size: 0.925rem; line-height: 1.55; color: var(--text-primary);">
              ${data.problemSolved}
            </div>
           </div>`
        : '';

      const html = `
        <div style="margin-bottom: 1.25rem;">
          <p style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--google-blue); margin-bottom: 0.3rem;">Project Showcase &amp; Architecture</p>
          <h3 style="font-size: 1.75rem; margin-bottom: 0.25rem;">${data.title}</h3>
          <p style="font-size: 0.95rem; color: var(--text-muted);">${data.subtitle}</p>
        </div>

        ${problemHtml}

        <p style="font-size: 1rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.25rem;">${data.desc}</p>
        
        ${metricsHtml}

        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; margin-bottom: 0.75rem;">Technical Implementation Highlights</h4>
          <ul style="padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.925rem; display: flex; flex-direction: column; gap: 0.5rem;">
            ${data.highlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
          ${data.tags.map(t => `<span class="tag-item">${t}</span>`).join('')}
        </div>

        <div style="padding: 0.85rem 1rem; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          💡 <strong>Project Status:</strong> ${data.status}
        </div>

        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="https://chat.whatsapp.com/LKWEOfb7UjY9ARnnowM44U?s=cl&p=a&ilr=1" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; text-align: center;">
            Contribute to Project
          </a>
          <button type="button" class="btn-secondary" onclick="document.getElementById('modalOverlay').classList.remove('open'); document.body.style.overflow='';" style="padding: 0.75rem 1.25rem;">
            Close
          </button>
        </div>
      `;
      openModal(html);
    });
  });

  // Event cards event listeners
  document.querySelectorAll('[data-event]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const eventId = btn.getAttribute('data-event');
      const data = EVENTS_DATA[eventId];
      if (!data) return;

      const html = `
        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem;">
            <span style="font-size: 0.8rem; font-weight: 700; color: var(--google-blue);">${data.date}</span>
            <span style="color: var(--text-muted);">·</span>
            <span style="font-size: 0.8rem; color: var(--text-muted);">${data.type}</span>
          </div>
          <h3 style="font-size: 1.75rem; margin-bottom: 0.5rem;">${data.title}</h3>
          <p style="font-size: 0.95rem; color: var(--text-secondary);">📍 <strong>Venue:</strong> ${data.venue}</p>
          <p style="font-size: 0.95rem; color: var(--text-secondary);">⏰ <strong>Time:</strong> ${data.time}</p>
        </div>

        <p style="font-size: 1rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 1.5rem;">${data.desc}</p>
        
        <div style="margin-bottom: 1.5rem;">
          <h4 style="font-size: 1rem; margin-bottom: 0.75rem;">Session Schedule &amp; Agenda</h4>
          <ul style="padding-left: 1.25rem; color: var(--text-secondary); font-size: 0.925rem; display: flex; flex-direction: column; gap: 0.5rem;">
            ${data.agenda.map(a => `<li>${a}</li>`).join('')}
          </ul>
        </div>

        <div style="padding: 1rem; background: var(--bg-primary); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); font-size: 0.825rem; color: var(--text-muted); margin-bottom: 1.5rem;">
          ℹ️ <strong>Demo Note:</strong> Free admission for all MMMUT undergraduate &amp; postgraduate students. RSVP early to ensure lab system allocation!
        </div>

        <div style="display: flex; gap: 1rem;">
          <a href="https://chat.whatsapp.com/LKWEOfb7UjY9ARnnowM44U?s=cl&p=a&ilr=1" target="_blank" rel="noopener noreferrer" class="btn-primary" style="flex: 1; text-align: center;">
            RSVP via Community Group
          </a>
        </div>
      `;
      openModal(html);
    });
  });
}

/* ===================================================
   6. CONTACT FORM VALIDATION & SUBMISSION
=================================================== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const interestSelect = document.getElementById('contactInterest');
  const messageInput = document.getElementById('contactMessage');

  const nameError = document.getElementById('nameError');
  const emailError = document.getElementById('emailError');
  const messageError = document.getElementById('messageError');
  const formSuccess = document.getElementById('formSuccess');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
      name: nameInput?.value || '',
      email: emailInput?.value || '',
      interest: interestSelect?.value || '',
      message: messageInput?.value || '',
    };

    const validation = validateContactForm(data);

    // Reset error displays
    nameError?.classList.toggle('active', !!validation.errors.name);
    emailError?.classList.toggle('active', !!validation.errors.email);
    messageError?.classList.toggle('active', !!validation.errors.message);

    if (validation.isValid) {
      formSuccess?.classList.add('active');
      form.reset();
      setTimeout(() => {
        formSuccess?.classList.remove('active');
      }, 7000);
    }
  });
}

/* ===================================================
   7. INTERACTIVE AI CHAT ASSISTANT ("Ask GDG")
=================================================== */
function initAIChat() {
  const trigger = document.getElementById('aiChatTrigger');
  const chatWindow = document.getElementById('aiChatWindow');
  const closeBtn = document.getElementById('aiChatClose');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatMessages = document.getElementById('chatMessages');
  const starterChips = document.querySelectorAll('.chip-btn');

  if (!trigger || !chatWindow) return;

  const conversationHistory = [
    { role: 'assistant', text: "Hey developer! 👋 I'm your GDG on Campus MMMUT assistant. Ask me anything about upcoming workshops, the MMMUT Buildathon, project tracks, or how to join our WhatsApp group!" }
  ];

  trigger.addEventListener('click', () => {
    chatWindow.classList.toggle('open');
    if (chatWindow.classList.contains('open')) {
      chatInput?.focus();
    }
  });

  closeBtn?.addEventListener('click', () => {
    chatWindow.classList.remove('open');
  });

  starterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const q = chip.getAttribute('data-query');
      if (q) {
        sendMessage(q);
      }
    });
  });

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput?.value?.trim();
    if (!text) return;
    chatInput.value = '';
    sendMessage(text);
  });

  async function sendMessage(userText) {
    appendMessage('user', userText);
    conversationHistory.push({ role: 'user', text: userText });

    // Show typing bubble
    const typingElem = document.createElement('div');
    typingElem.className = 'chat-msg bot typing';
    typingElem.textContent = 'Thinking...';
    chatMessages?.appendChild(typingElem);
    chatMessages?.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          message: userText,
        }),
      });

      const data = await res.json();
      typingElem.remove();

      const reply = data.reply || "Thanks for connecting with GDG on Campus MMMUT! Join our WhatsApp group to stay connected with the whole developer team.";
      appendMessage('bot', reply);
      conversationHistory.push({ role: 'assistant', text: reply });
    } catch (err) {
      typingElem.remove();
      const fallback = "Thanks for connecting! We are active on WhatsApp and campus meetups. Join our official WhatsApp group to get instant updates!";
      appendMessage('bot', fallback);
      conversationHistory.push({ role: 'assistant', text: fallback });
    }
  }

  function appendMessage(role, text) {
    if (!chatMessages) return;
    const msg = document.createElement('div');
    msg.className = `chat-msg ${role}`;
    // Support bold markdown and line breaks
    const formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br/>');
    msg.innerHTML = formatted;
    chatMessages.appendChild(msg);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }
}
