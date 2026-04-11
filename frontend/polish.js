/**
 * polish.js — AI Placement UI Polish System
 * Features: Page transitions, Toast notifications
 * Add <script src="/polish.js"></script> just before </body> on any page.
 */

(function () {
  'use strict';

  // ── 1. PAGE TRANSITION CSS ────────────────────────────────────
  // NOTE: We animate .content / .main instead of body
  // Animating body breaks position:fixed elements (sidebar)
  var transitionCSS =
    '#page-transition-overlay {' +
      'position:fixed;inset:0;' +
      'background:linear-gradient(135deg,#10B981,#6366F1);' +
      'z-index:999999;opacity:0;pointer-events:none;' +
      'transition:opacity 0.22s ease;' +
    '}' +
    '#page-transition-overlay.active {opacity:0.15;pointer-events:all;}' +
    /* Animate only the main content wrapper, NOT body */
    '.content,.main,.login-wrapper,.wrap {' +
      'animation:__pageIn 0.38s ease-out both;' +
    '}' +
    '@keyframes __pageIn {' +
      'from{opacity:0;transform:translateY(10px)}' +
      'to{opacity:1;transform:translateY(0)}' +
    '}';

  // ── 2. TOAST CSS ──────────────────────────────────────────────
  var toastCSS =
    '#toast-container {' +
      'position:fixed;bottom:28px;right:24px;z-index:99998;' +
      'display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;' +
    '}' +
    '.ai-toast {' +
      'display:flex;align-items:center;gap:12px;' +
      'padding:13px 18px;border-radius:14px;' +
      'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      'font-size:14px;font-weight:600;color:#fff;' +
      'min-width:240px;max-width:340px;pointer-events:all;' +
      'animation:__toastIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.22);' +
    '}' +
    '.ai-toast.removing{animation:__toastOut 0.28s ease forwards;}' +
    '.ai-toast-success{background:linear-gradient(135deg,#10B981,#059669);}' +
    '.ai-toast-error  {background:linear-gradient(135deg,#EF4444,#DC2626);}' +
    '.ai-toast-info   {background:linear-gradient(135deg,#6366F1,#4F46E5);}' +
    '.ai-toast-warn   {background:linear-gradient(135deg,#F59E0B,#D97706);}' +
    '.ai-toast-icon{font-size:17px;flex-shrink:0;}' +
    '.ai-toast-msg{flex:1;line-height:1.4;}' +
    '@keyframes __toastIn{' +
      'from{opacity:0;transform:translateX(56px) scale(0.88)}' +
      'to  {opacity:1;transform:translateX(0) scale(1)}' +
    '}' +
    '@keyframes __toastOut{' +
      'from{opacity:1;transform:translateX(0) scale(1);max-height:80px}' +
      'to  {opacity:0;transform:translateX(56px) scale(0.88);max-height:0}' +
    '}' +
    '@media(max-width:480px){' +
      '#toast-container{bottom:16px;right:12px;left:12px;}' +
      '.ai-toast{min-width:unset;max-width:100%;}' +
    '}';

  // ── INJECT STYLES ─────────────────────────────────────────────
  function injectStyle(css, id) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id;
    s.textContent = css;
    document.head.appendChild(s);
  }

  injectStyle(transitionCSS, 'polish-transition');
  injectStyle(toastCSS,      'polish-toast');

  // ── PAGE TRANSITIONS ──────────────────────────────────────────
  function setupTransitions() {
    var overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);

    document.addEventListener('click', function (e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(function () { window.location.href = href; }, 210);
    });
  }

  // ── TOAST NOTIFICATIONS ───────────────────────────────────────
  function setupToast() {
    var container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    var icons = { success: '✅', error: '❌', info: 'ℹ️', warn: '⚠️' };

    window.toast = function (msg, type, duration) {
      type     = type     || 'success';
      duration = duration || 3500;
      var t = document.createElement('div');
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

  // ── INIT ──────────────────────────────────────────────────────
  function init() {
    setupTransitions();
    setupToast();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();