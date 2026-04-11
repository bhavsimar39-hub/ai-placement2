/**
 * polish.js — AI Placement UI Polish System
 * Features: Dark/Light mode toggle, Page transitions, Toast notifications
 * Drop this file into your frontend root and add:
 *   <script src="/polish.js"></script>
 * just before </body> on any page.
 */

(function () {
  'use strict';

  // ── 1. DARK MODE CSS ─────────────────────────────────────────
  const darkCSS = `
    [data-theme="dark"] {
      --bg-white: #0F1419;
      --bg-light: #0F1419;
      --bg-lighter: #1A1F26;
      --text-dark: #F9FAFB;
      --text-gray: #D1D5DB;
      --text-light: #9CA3AF;
      --border: rgba(255,255,255,0.08);
      --bg-dark: #0F1419;
      --bg-darker: #0A0E13;
      --bg-card: #1A1F26;
      --text-secondary: #9CA3AF;
      --text-muted: #6B7280;
    }

    [data-theme="dark"] body {
      background: linear-gradient(180deg,#0F1419 0%,#0A0E13 100%) !important;
      color: #F9FAFB !important;
    }

    /* ── Navbar ── */
    [data-theme="dark"] .navbar {
      background: rgba(15,20,25,0.97) !important;
      border-color: rgba(255,255,255,0.08) !important;
    }
    [data-theme="dark"] .logo,
    [data-theme="dark"] .logo-text {
      color: #F9FAFB !important;
    }
    [data-theme="dark"] .nav-links a { color: #9CA3AF !important; }
    [data-theme="dark"] .nav-links a:hover { color: #10B981 !important; }
    [data-theme="dark"] .btn-outline {
      border-color: rgba(255,255,255,0.15) !important;
      color: #F9FAFB !important;
      background: rgba(255,255,255,0.04) !important;
    }
    [data-theme="dark"] .btn-outline:hover {
      background: rgba(255,255,255,0.08) !important;
    }

    /* ── Auth cards ── */
    [data-theme="dark"] .login-card,
    [data-theme="dark"] .signup-card,
    [data-theme="dark"] .card {
      background: rgba(26,31,38,0.98) !important;
      border-color: rgba(255,255,255,0.08) !important;
      box-shadow: 0 24px 64px rgba(0,0,0,0.5) !important;
    }
    [data-theme="dark"] .login-header h1,
    [data-theme="dark"] .login-header p { color: #D1D5DB !important; }
    [data-theme="dark"] .form-label,
    [data-theme="dark"] label { color: #D1D5DB !important; }
    [data-theme="dark"] .form-input,
    [data-theme="dark"] input[type="text"],
    [data-theme="dark"] input[type="email"],
    [data-theme="dark"] input[type="password"],
    [data-theme="dark"] textarea,
    [data-theme="dark"] select {
      background: rgba(255,255,255,0.04) !important;
      border-color: rgba(255,255,255,0.1) !important;
      color: #F9FAFB !important;
    }
    [data-theme="dark"] .form-input::placeholder,
    [data-theme="dark"] input::placeholder { color: #6B7280 !important; }
    [data-theme="dark"] .form-input:focus,
    [data-theme="dark"] input:focus {
      background: rgba(255,255,255,0.06) !important;
      border-color: #10B981 !important;
    }
    [data-theme="dark"] .divider { color: #6B7280 !important; }
    [data-theme="dark"] .divider::before,
    [data-theme="dark"] .divider::after { background: rgba(255,255,255,0.08) !important; }

    /* ── Dashboard ── */
    [data-theme="dark"] .welcome-header,
    [data-theme="dark"] .metric-card,
    [data-theme="dark"] .skills-card {
      background: rgba(26,31,38,0.98) !important;
      border-color: rgba(255,255,255,0.08) !important;
    }
    [data-theme="dark"] .metric-card:hover {
      box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
      border-color: rgba(16,185,129,0.3) !important;
    }
    [data-theme="dark"] .metric-label,
    [data-theme="dark"] .metric-subtitle,
    [data-theme="dark"] .welcome-subtitle,
    [data-theme="dark"] .greeting,
    [data-theme="dark"] .current-date { color: #9CA3AF !important; }
    [data-theme="dark"] .current-time,
    [data-theme="dark"] .metric-value { color: #F9FAFB !important; }
    [data-theme="dark"] .quick-stats { border-top-color: rgba(255,255,255,0.08) !important; }
    [data-theme="dark"] .refresh-btn {
      background: rgba(255,255,255,0.05) !important;
      border-color: rgba(255,255,255,0.1) !important;
      color: #9CA3AF !important;
    }
    [data-theme="dark"] .refresh-btn:hover {
      background: rgba(255,255,255,0.09) !important;
      color: #F9FAFB !important;
    }
    [data-theme="dark"] .skills-card-title { color: #F9FAFB !important; }
    [data-theme="dark"] .activity-title { color: #F9FAFB !important; }
    [data-theme="dark"] .activity-time  { color: #6B7280 !important; }
    [data-theme="dark"] .activity-item { border-color: rgba(255,255,255,0.05) !important; }

    /* ── Landing page sections ── */
    [data-theme="dark"] .hero {
      background: linear-gradient(180deg,#0F1419 0%,#0A0E13 100%) !important;
    }
    [data-theme="dark"] .hero-title,
    [data-theme="dark"] .section-title { color: #F9FAFB !important; }
    [data-theme="dark"] .hero-subtitle,
    [data-theme="dark"] .section-subtitle,
    [data-theme="dark"] .hero-description { color: #9CA3AF !important; }

    [data-theme="dark"] .features,
    [data-theme="dark"] .solutions,
    [data-theme="dark"] .stats,
    [data-theme="dark"] .testimonials,
    [data-theme="dark"] .blog,
    [data-theme="dark"] .pricing {
      background: #0A0E13 !important;
    }

    [data-theme="dark"] .feature-card,
    [data-theme="dark"] .solution-card,
    [data-theme="dark"] .pricing-card,
    [data-theme="dark"] .testimonial-card,
    [data-theme="dark"] .blog-card {
      background: rgba(26,31,38,0.9) !important;
      border-color: rgba(255,255,255,0.08) !important;
    }
    [data-theme="dark"] .feature-card:hover,
    [data-theme="dark"] .solution-card:hover,
    [data-theme="dark"] .blog-card:hover {
      border-color: rgba(16,185,129,0.3) !important;
    }
    [data-theme="dark"] .feature-title,
    [data-theme="dark"] .solution-title,
    [data-theme="dark"] .blog-card-title,
    [data-theme="dark"] .pricing-plan { color: #F9FAFB !important; }
    [data-theme="dark"] .feature-desc,
    [data-theme="dark"] .solution-desc,
    [data-theme="dark"] .blog-card-desc,
    [data-theme="dark"] .blog-card-date,
    [data-theme="dark"] .testimonial-text { color: #9CA3AF !important; }
    [data-theme="dark"] .pricing-price,
    [data-theme="dark"] .stat-number { color: #F9FAFB !important; }
    [data-theme="dark"] .stat-label { color: #9CA3AF !important; }

    /* ── Footer ── */
    [data-theme="dark"] .footer {
      background: #060A0E !important;
      border-top: 1px solid rgba(255,255,255,0.06) !important;
    }
    [data-theme="dark"] .footer-description,
    [data-theme="dark"] .footer-links a { color: #6B7280 !important; }
    [data-theme="dark"] .footer-links a:hover { color: #10B981 !important; }
    [data-theme="dark"] .footer-title { color: #D1D5DB !important; }
    [data-theme="dark"] .footer-bottom { color: #4B5563 !important; }

    /* ── Misc ── */
    [data-theme="dark"] #errorBanner,
    [data-theme="dark"] .error-banner {
      background: rgba(239,68,68,0.1) !important;
      border-color: rgba(239,68,68,0.3) !important;
    }
    [data-theme="dark"] #confirmBanner {
      background: rgba(245,158,11,0.1) !important;
      border-color: rgba(245,158,11,0.25) !important;
    }
    [data-theme="dark"] .back-button { color: #6B7280 !important; }
    [data-theme="dark"] .back-button:hover { color: #10B981 !important; }
    [data-theme="dark"] .forgot-link,
    [data-theme="dark"] .signup-link a,
    [data-theme="dark"] .signin-link a { color: #10B981 !important; }
  `;

  // ── 2. PAGE TRANSITION CSS ────────────────────────────────────
  const transitionCSS = `
    #page-transition-overlay {
      position: fixed;
      inset: 0;
      background: linear-gradient(135deg,#10B981,#6366F1);
      z-index: 999999;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.22s ease;
    }
    #page-transition-overlay.active {
      opacity: 0.15;
      pointer-events: all;
    }
    body { animation: __pageIn 0.38s ease-out both; }
    @keyframes __pageIn {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;

  // ── 3. TOAST CSS ──────────────────────────────────────────────
  const toastCSS = `
    #toast-container {
      position: fixed;
      bottom: 28px;
      right: 24px;
      z-index: 99998;
      display: flex;
      flex-direction: column-reverse;
      gap: 10px;
      pointer-events: none;
    }
    .ai-toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 18px;
      border-radius: 14px;
      font-family: "Plus Jakarta Sans","Inter",sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #fff;
      min-width: 240px;
      max-width: 340px;
      pointer-events: all;
      animation: __toastIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;
      box-shadow: 0 8px 32px rgba(0,0,0,0.22);
    }
    .ai-toast.removing { animation: __toastOut 0.28s ease forwards; }
    .ai-toast-success { background: linear-gradient(135deg,#10B981,#059669); }
    .ai-toast-error   { background: linear-gradient(135deg,#EF4444,#DC2626); }
    .ai-toast-info    { background: linear-gradient(135deg,#6366F1,#4F46E5); }
    .ai-toast-warn    { background: linear-gradient(135deg,#F59E0B,#D97706); }
    .ai-toast-icon { font-size: 17px; flex-shrink: 0; }
    .ai-toast-msg  { flex: 1; line-height: 1.4; }
    @keyframes __toastIn {
      from { opacity:0; transform: translateX(56px) scale(0.88); }
      to   { opacity:1; transform: translateX(0) scale(1); }
    }
    @keyframes __toastOut {
      from { opacity:1; transform: translateX(0) scale(1); max-height:80px; margin-bottom:0; }
      to   { opacity:0; transform: translateX(56px) scale(0.88); max-height:0; margin-bottom:-10px; }
    }
    @media(max-width:480px){
      #toast-container{ bottom:16px; right:12px; left:12px; }
      .ai-toast{ min-width:unset; max-width:100%; }
    }
  `;

  // ── 4. TOGGLE BUTTON CSS ──────────────────────────────────────
  const toggleCSS = `
    #ai-theme-toggle {
      position: fixed;
      bottom: 28px;
      left: 24px;
      z-index: 9999;
      width: 46px;
      height: 46px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg,#10B981,#059669);
      color: white;
      font-size: 20px;
      cursor: pointer;
      box-shadow: 0 4px 18px rgba(16,185,129,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s;
      outline: none;
    }
    #ai-theme-toggle:hover {
      transform: scale(1.12) rotate(18deg);
      box-shadow: 0 6px 24px rgba(16,185,129,0.55);
    }
    #ai-theme-toggle:active { transform: scale(0.93); }
    #ai-theme-toggle .toggle-tooltip {
      position: absolute;
      left: 56px;
      bottom: 50%;
      transform: translateY(50%);
      background: rgba(15,20,25,0.9);
      color: #F9FAFB;
      font-size: 12px;
      font-weight: 600;
      padding: 5px 10px;
      border-radius: 8px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s;
    }
    #ai-theme-toggle:hover .toggle-tooltip { opacity: 1; }
    @media(max-width:480px){
      #ai-theme-toggle{ bottom:16px; left:16px; width:40px; height:40px; font-size:17px; }
    }
  `;

  // ── INJECT STYLES ─────────────────────────────────────────────
  function injectStyle(css, id) {
    if (document.getElementById(id)) return;
    const s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  // Apply theme immediately to avoid flash of wrong theme
  const _saved = localStorage.getItem('ai-placement-theme');
  if (_saved) document.documentElement.setAttribute('data-theme', _saved);
  else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  injectStyle(darkCSS,       'polish-dark');
  injectStyle(transitionCSS, 'polish-transition');
  injectStyle(toastCSS,      'polish-toast');
  injectStyle(toggleCSS,     'polish-toggle');

  // ── THEME LOGIC ───────────────────────────────────────────────
  function isDark() {
    return document.documentElement.getAttribute('data-theme') === 'dark';
  }

  function applyTheme(dark) {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('ai-placement-theme', dark ? 'dark' : 'light');
    const btn = document.getElementById('ai-theme-toggle');
    if (btn) {
      btn.querySelector('.toggle-icon').textContent = dark ? '☀️' : '🌙';
      btn.querySelector('.toggle-tooltip').textContent = dark ? 'Switch to Light' : 'Switch to Dark';
    }
  }

  // ── PAGE TRANSITIONS ──────────────────────────────────────────
  function setupTransitions() {
    const overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);

    document.addEventListener('click', function (e) {
      const link = e.target.closest('a[href]');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(() => { window.location.href = href; }, 210);
    });
  }

  // ── TOAST NOTIFICATIONS ───────────────────────────────────────
  function setupToast() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };

    window.toast = function (msg, type, duration) {
      type     = type     || 'success';
      duration = duration || 3500;
      const t = document.createElement('div');
      t.className = 'ai-toast ai-toast-' + type;
      t.innerHTML =
        '<span class="ai-toast-icon">' + (icons[type] || '✅') + '</span>' +
        '<span class="ai-toast-msg">'  + msg + '</span>';
      container.appendChild(t);
      setTimeout(function () {
        t.classList.add('removing');
        setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
      }, duration);
    };
  }

  // ── THEME TOGGLE BUTTON ───────────────────────────────────────
  function setupToggle() {
    const btn = document.createElement('button');
    btn.id = 'ai-theme-toggle';
    btn.setAttribute('aria-label', 'Toggle dark/light mode');
    btn.innerHTML =
      '<span class="toggle-icon">' + (isDark() ? '☀️' : '🌙') + '</span>' +
      '<span class="toggle-tooltip">' + (isDark() ? 'Switch to Light' : 'Switch to Dark') + '</span>';
    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      applyTheme(!isDark());
    });
  }

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    setupToggle();
    setupTransitions();
    setupToast();
    // Sync toggle icon with current theme
    applyTheme(isDark());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();