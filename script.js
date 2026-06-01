// ══════════════════════════════════════════
// CAMPUSONE — Application Script
// ══════════════════════════════════════════

// ── DATA & STATE ──
const KEY = 'co_waitlist';
let wlData = JSON.parse(localStorage.getItem(KEY) || '{"users":[],"count":2847}');
let currentUser = null;

// ── THEME ──
(function initTheme() {
  const stored = localStorage.getItem('co_theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const useDark = stored ? stored === 'dark' : prefersDark;
  if (!useDark) document.body.classList.add('light-theme');

  // Respond to OS-level theme changes when no stored preference
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('co_theme')) {
      document.body.classList.toggle('light-theme', !e.matches);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });
})();

function toggleTheme() {
  const isLight = document.body.classList.toggle('light-theme');
  localStorage.setItem('co_theme', isLight ? 'light' : 'dark');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ── INITIALISATION ──
window.onload = function () {
  updateCounters();

  // Restore session if already registered
  const saved = localStorage.getItem('co_me');
  if (saved) {
    currentUser = JSON.parse(saved);
  }

  // Simulate live counter growth
  setInterval(() => {
    if (Math.random() > 0.7) {
      wlData.count++;
      updateCounters();
    }
  }, 4000);

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

function updateCounters() {
  document.getElementById('counter-num').textContent   = wlData.count.toLocaleString();
  document.getElementById('stat-students').textContent = wlData.count.toLocaleString();
  document.getElementById('form-counter').textContent  = wlData.count.toLocaleString();
}

// ── EMAIL VALIDATION ──
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── INPUT ERROR HELPERS ──
function clearInputErrors() {
  document.getElementById('f-name').classList.remove('has-error');
  document.getElementById('f-email').classList.remove('has-error');
  document.getElementById('name-error').classList.remove('show');
  document.getElementById('email-error').classList.remove('show');
}

function showInputError(inputId, errorId, message = null) {
  document.getElementById(inputId).classList.add('has-error');
  const errorEl = document.getElementById(errorId);
  errorEl.classList.add('show');
  if (message) errorEl.querySelector('span').textContent = message;
}

// ── JOIN WAITLIST ──
function joinWaitlist() {
  clearInputErrors();

  const name  = document.getElementById('f-name').value.trim();
  const email = document.getElementById('f-email').value.trim();
  let hasError = false;

  if (!name) {
    showInputError('f-name', 'name-error', 'Please enter your name');
    hasError = true;
  }

  if (!email) {
    showInputError('f-email', 'email-error', 'Please enter your email');
    hasError = true;
  } else if (!isValidEmail(email)) {
    showInputError('f-email', 'email-error', 'Please enter a valid email address');
    hasError = true;
  }

  if (hasError) return;

  // Duplicate check
  const existing = wlData.users.find(u => u.email === email);
  if (existing) {
    showInputError('f-email', 'email-error', 'This email is already registered!');
    return;
  }

  // Generate referral code
  const refCode = name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') +
                  Math.floor(Math.random() * 900 + 100);

  wlData.count++;
  const pos = wlData.count;

  // Detect referral param from URL (e.g. ?ref=CODE)
  const refParam = new URLSearchParams(window.location.search).get('ref') || null;

  const user = {
    name, email,
    refCode, pos,
    refs: 0,
    joinedAt: new Date().toISOString(),
    referredBy: refParam
  };

  wlData.users.push(user);
  currentUser = user;

  localStorage.setItem(KEY, JSON.stringify(wlData));
  localStorage.setItem('co_me', JSON.stringify(user));

  updateCounters();

  const firstName = name.split(' ')[0];
  toast(`You're in, ${firstName}! 🎉`);
  confetti();

  // Lock the form
  clearInputErrors();
  document.getElementById('f-name').value    = '';
  document.getElementById('f-email').value   = '';
  document.getElementById('f-name').disabled  = true;
  document.getElementById('f-email').disabled = true;
  const btn = document.querySelector('.btn-join');
  btn.disabled    = true;
  btn.textContent = 'Thanks for joining!';
}

// Clear individual field errors while typing
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('f-name').addEventListener('input', function () {
    if (this.value.trim()) document.getElementById('name-error').classList.remove('show');
  });

  document.getElementById('f-email').addEventListener('input', function () {
    if (this.value.trim() && isValidEmail(this.value.trim())) {
      document.getElementById('email-error').classList.remove('show');
    }
  });
});

// ── TOAST ──
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

// ── CONFETTI ──
function confetti() {
  const container = document.getElementById('cf');
  const colours   = ['#FF4D00', '#FFCE00', '#1A1AFF', '#00C864', '#FF3366', '#fff'];
  container.innerHTML = '';

  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'cf';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colours[Math.floor(Math.random() * colours.length)]};
      width: ${Math.random() * 10 + 4}px;
      height: ${Math.random() * 10 + 4}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 1}s;
      animation-delay: ${Math.random() * 0.8}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => (container.innerHTML = ''), 4000);
}
