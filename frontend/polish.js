/**
 * polish.js — AI Placement UI Polish System v2.0
 * Enterprise-grade features:
 *   1. Page load progress bar (YouTube-style)
 *   2. Scroll progress indicator
 *   3. Scroll-triggered animations
 *   4. Smart tooltips
 *   5. Network status banner
 *   6. Smooth number counter
 *   7. Keyboard shortcuts + panel
 *   8. Prefetch on hover
 *   9. Confetti burst
 *  10. Idle session warning
 * + Original: Page transitions, Toast notifications
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════
     CSS INJECTION
  ═══════════════════════════════════════════════════════ */
  function injectStyle(css, id) {
    if (document.getElementById(id)) return;
    var s = document.createElement('style');
    s.id = id; s.textContent = css;
    document.head.appendChild(s);
  }

  /* ─── 1. PAGE LOAD PROGRESS BAR ─────────────────────── */
  injectStyle(
    '#ai-load-bar{' +
      'position:fixed;top:0;left:0;height:3px;width:0%;z-index:999999;' +
      'background:linear-gradient(90deg,#10B981,#6366F1,#F59E0B);' +
      'transition:width 0.25s ease,opacity 0.4s ease;' +
      'box-shadow:0 0 10px rgba(16,185,129,0.6);' +
      'border-radius:0 2px 2px 0;' +
    '}',
  'polish-loadbar');

  /* ─── 2. SCROLL PROGRESS ─────────────────────────────── */
  injectStyle(
    '#ai-scroll-prog{' +
      'position:fixed;top:0;left:0;height:3px;width:0%;z-index:99997;' +
      'background:linear-gradient(90deg,#10B981,#059669);' +
      'pointer-events:none;transition:width 0.1s linear;' +
    '}',
  'polish-scrollprog');

  /* ─── 3. SCROLL-TRIGGERED ANIMATIONS ────────────────── */
  injectStyle(
    '.ai-reveal{opacity:0;transform:translateY(22px);transition:opacity 0.55s ease,transform 0.55s cubic-bezier(0.34,1.1,0.64,1);}' +
    '.ai-reveal.ai-visible{opacity:1;transform:translateY(0);}' +
    '.ai-reveal-left{opacity:0;transform:translateX(-22px);transition:opacity 0.55s ease,transform 0.55s cubic-bezier(0.34,1.1,0.64,1);}' +
    '.ai-reveal-left.ai-visible{opacity:1;transform:translateX(0);}',
  'polish-reveal');

  /* ─── 4. SMART TOOLTIPS ──────────────────────────────── */
  injectStyle(
    '#ai-tooltip{' +
      'position:fixed;z-index:999990;pointer-events:none;' +
      'background:rgba(15,20,25,0.95);color:#F9FAFB;' +
      'font-size:12px;font-weight:600;font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      'padding:6px 12px;border-radius:8px;white-space:nowrap;' +
      'border:1px solid rgba(16,185,129,0.25);' +
      'box-shadow:0 8px 24px rgba(0,0,0,0.3);' +
      'opacity:0;transition:opacity 0.18s ease,transform 0.18s ease;' +
      'transform:translateY(4px);max-width:260px;white-space:normal;' +
    '}' +
    '#ai-tooltip.show{opacity:1;transform:translateY(0);}' +
    '#ai-tooltip::after{' +
      'content:"";position:absolute;top:100%;left:50%;transform:translateX(-50%);' +
      'border:5px solid transparent;border-top-color:rgba(15,20,25,0.95);' +
    '}',
  'polish-tooltip');

  /* ─── 5. NETWORK STATUS ──────────────────────────────── */
  injectStyle(
    '#ai-net-banner{' +
      'position:fixed;top:0;left:0;right:0;z-index:999998;' +
      'background:linear-gradient(135deg,#EF4444,#DC2626);' +
      'color:#fff;font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      'font-size:13px;font-weight:700;text-align:center;' +
      'padding:10px 20px;display:flex;align-items:center;justify-content:center;gap:8px;' +
      'transform:translateY(-100%);transition:transform 0.35s cubic-bezier(0.34,1.2,0.64,1);' +
    '}' +
    '#ai-net-banner.show{transform:translateY(0);}' +
    '#ai-net-banner.online{background:linear-gradient(135deg,#10B981,#059669);}',
  'polish-network');

  /* ─── 7. KEYBOARD SHORTCUTS PANEL ───────────────────── */
  injectStyle(
    '#ai-shortcuts-overlay{' +
      'position:fixed;inset:0;z-index:999995;' +
      'background:rgba(0,0,0,0.65);backdrop-filter:blur(6px);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;pointer-events:none;transition:opacity 0.25s ease;' +
    '}' +
    '#ai-shortcuts-overlay.show{opacity:1;pointer-events:all;}' +
    '#ai-shortcuts-panel{' +
      'background:#1A1F26;border:1px solid rgba(16,185,129,0.2);' +
      'border-radius:20px;padding:32px 36px;min-width:360px;max-width:440px;' +
      'box-shadow:0 32px 80px rgba(0,0,0,0.5);' +
      'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      'transform:scale(0.92) translateY(10px);transition:transform 0.25s cubic-bezier(0.34,1.2,0.64,1);' +
    '}' +
    '#ai-shortcuts-overlay.show #ai-shortcuts-panel{transform:scale(1) translateY(0);}' +
    '.ai-sc-title{font-size:18px;font-weight:800;color:#F9FAFB;margin-bottom:20px;' +
      'display:flex;align-items:center;gap:10px;' +
    '}' +
    '.ai-sc-row{display:flex;align-items:center;justify-content:space-between;' +
      'padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.06);' +
    '}' +
    '.ai-sc-row:last-child{border-bottom:none;}' +
    '.ai-sc-label{font-size:13px;color:#9CA3AF;font-weight:500;}' +
    '.ai-sc-key{display:flex;gap:4px;}' +
    '.ai-sc-kbd{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);' +
      'border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#F9FAFB;' +
      'font-family:"JetBrains Mono",monospace;min-width:28px;text-align:center;' +
    '}' +
    '.ai-sc-close{margin-top:20px;width:100%;padding:11px;background:rgba(16,185,129,0.12);' +
      'border:1px solid rgba(16,185,129,0.25);border-radius:10px;color:#10B981;' +
      'font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;' +
    '}' +
    '.ai-sc-close:hover{background:rgba(16,185,129,0.2);}',
  'polish-shortcuts');

  /* ─── 9. CONFETTI ────────────────────────────────────── */
  injectStyle(
    '.ai-confetti-piece{' +
      'position:fixed;pointer-events:none;z-index:999994;' +
      'width:10px;height:10px;border-radius:2px;' +
      'animation:aiConfettiFall linear forwards;' +
    '}' +
    '@keyframes aiConfettiFall{' +
      '0%{transform:translateY(-10px) rotate(0deg);opacity:1;}' +
      '100%{transform:translateY(100vh) rotate(720deg);opacity:0;}' +
    '}',
  'polish-confetti');

  /* ─── 10. IDLE WARNING ───────────────────────────────── */
  injectStyle(
    '#ai-idle-overlay{' +
      'position:fixed;inset:0;z-index:999993;' +
      'background:rgba(0,0,0,0.7);backdrop-filter:blur(8px);' +
      'display:flex;align-items:center;justify-content:center;' +
      'opacity:0;pointer-events:none;transition:opacity 0.3s ease;' +
    '}' +
    '#ai-idle-overlay.show{opacity:1;pointer-events:all;}' +
    '#ai-idle-box{' +
      'background:#1A1F26;border:1px solid rgba(16,185,129,0.2);' +
      'border-radius:20px;padding:36px 40px;text-align:center;max-width:360px;' +
      'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      'box-shadow:0 32px 80px rgba(0,0,0,0.5);' +
    '}' +
    '.ai-idle-icon{font-size:48px;margin-bottom:16px;}' +
    '.ai-idle-title{font-size:20px;font-weight:800;color:#F9FAFB;margin-bottom:8px;}' +
    '.ai-idle-sub{font-size:14px;color:#9CA3AF;margin-bottom:24px;line-height:1.6;}' +
    '.ai-idle-count{font-size:36px;font-weight:900;color:#10B981;margin-bottom:20px;' +
      'font-family:"JetBrains Mono",monospace;' +
    '}' +
    '.ai-idle-btn{padding:13px 32px;background:linear-gradient(135deg,#10B981,#059669);' +
      'border:none;border-radius:12px;color:#fff;font-size:15px;font-weight:700;' +
      'font-family:inherit;cursor:pointer;transition:all 0.2s;' +
    '}' +
    '.ai-idle-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(16,185,129,0.4);}',
  'polish-idle');

  /* ─── PAGE TRANSITIONS ───────────────────────────────── */
  injectStyle(
    '#page-transition-overlay{' +
      'position:fixed;inset:0;background:linear-gradient(135deg,#10B981,#6366F1);' +
      'z-index:999999;opacity:0;pointer-events:none;transition:opacity 0.22s ease;' +
    '}' +
    '#page-transition-overlay.active{opacity:0.15;pointer-events:all;}' +
    '.content,.main,.login-wrapper,.wrap{animation:__pageIn 0.38s ease-out both;}' +
    '@keyframes __pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}',
  'polish-transition');

  /* ─── TOAST CSS ──────────────────────────────────────── */
  injectStyle(
    '#toast-container{position:fixed;bottom:28px;right:24px;z-index:99998;' +
      'display:flex;flex-direction:column-reverse;gap:10px;pointer-events:none;}' +
    '.ai-toast{display:flex;align-items:center;gap:12px;padding:13px 18px;border-radius:14px;' +
      'font-family:"Plus Jakarta Sans","Inter",sans-serif;font-size:14px;font-weight:600;color:#fff;' +
      'min-width:240px;max-width:340px;pointer-events:all;' +
      'animation:__toastIn 0.38s cubic-bezier(0.34,1.56,0.64,1) both;' +
      'box-shadow:0 8px 32px rgba(0,0,0,0.22);}' +
    '.ai-toast.removing{animation:__toastOut 0.28s ease forwards;}' +
    '.ai-toast-success{background:linear-gradient(135deg,#10B981,#059669);}' +
    '.ai-toast-error{background:linear-gradient(135deg,#EF4444,#DC2626);}' +
    '.ai-toast-info{background:linear-gradient(135deg,#6366F1,#4F46E5);}' +
    '.ai-toast-warn{background:linear-gradient(135deg,#F59E0B,#D97706);}' +
    '.ai-toast-icon{font-size:17px;flex-shrink:0;}' +
    '.ai-toast-msg{flex:1;line-height:1.4;}' +
    '@keyframes __toastIn{from{opacity:0;transform:translateX(56px) scale(0.88)}to{opacity:1;transform:translateX(0) scale(1)}}' +
    '@keyframes __toastOut{from{opacity:1;transform:translateX(0) scale(1);max-height:80px}to{opacity:0;transform:translateX(56px) scale(0.88);max-height:0}}' +
    '@media(max-width:480px){#toast-container{bottom:16px;right:12px;left:12px;}.ai-toast{min-width:unset;max-width:100%;}}',
  'polish-toast');


  /* ═══════════════════════════════════════════════════════
     FEATURE IMPLEMENTATIONS
  ═══════════════════════════════════════════════════════ */

  /* ─── 1. PAGE LOAD PROGRESS BAR ─────────────────────── */
  var loadBar = document.createElement('div');
  loadBar.id = 'ai-load-bar';
  document.body.appendChild(loadBar);

  (function() {
    var prog = 0;
    var iv;
    function start() {
      prog = 0; loadBar.style.opacity = '1';
      iv = setInterval(function() {
        prog += (100 - prog) * 0.06;
        loadBar.style.width = Math.min(prog, 92) + '%';
      }, 80);
    }
    function done() {
      clearInterval(iv);
      loadBar.style.width = '100%';
      setTimeout(function() { loadBar.style.opacity = '0'; loadBar.style.width = '0%'; }, 350);
    }
    start();
    window.addEventListener('load', done);
    window.aiLoadBarStart = start;
    window.aiLoadBarDone  = done;
  })();


  /* ─── 2. SCROLL PROGRESS BAR ─────────────────────────── */
  (function() {
    var prog = document.createElement('div');
    prog.id = 'ai-scroll-prog';
    document.body.appendChild(prog);
    window.addEventListener('scroll', function() {
      var doc = document.documentElement;
      var pct = (doc.scrollTop / (doc.scrollHeight - doc.clientHeight)) * 100;
      prog.style.width = Math.min(pct, 100) + '%';
    }, { passive: true });
  })();


  /* ─── 3. SCROLL-TRIGGERED ANIMATIONS ────────────────── */
  (function() {
    if (!window.IntersectionObserver) return;
    // Auto-add reveal class to common card elements
    var selectors = [
      '.metric-card','.stat-card','.feature-card','.skills-card',
      '.section','.glass-card','.timeline-item','.activity-item',
      '.session-cluster','.blog-card','.solution-card','.pricing-card'
    ];
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add('ai-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    function observe() {
      selectors.forEach(function(sel) {
        document.querySelectorAll(sel).forEach(function(el, i) {
          if (!el.classList.contains('ai-reveal')) {
            el.classList.add('ai-reveal');
            el.style.transitionDelay = Math.min(i * 0.05, 0.3) + 's';
            obs.observe(el);
          }
        });
      });
    }
    // Run after page settles
    setTimeout(observe, 200);
    // Re-run if new content loads (dashboard refresh etc.)
    window.aiObserveReveal = observe;
  })();


  /* ─── 4. SMART TOOLTIPS ──────────────────────────────── */
  (function() {
    var tip = document.createElement('div');
    tip.id = 'ai-tooltip';
    document.body.appendChild(tip);
    var hideTimer;

    document.addEventListener('mouseover', function(e) {
      var el = e.target.closest('[data-tip]');
      if (!el) return;
      clearTimeout(hideTimer);
      tip.textContent = el.getAttribute('data-tip');
      var rect = el.getBoundingClientRect();
      tip.style.left = (rect.left + rect.width / 2) + 'px';
      tip.style.top  = (rect.top - 8) + 'px';
      tip.style.transform = 'translateX(-50%) translateY(-100%) translateY(-4px)';
      tip.classList.add('show');
    });

    document.addEventListener('mouseout', function(e) {
      var el = e.target.closest('[data-tip]');
      if (!el) return;
      hideTimer = setTimeout(function() { tip.classList.remove('show'); }, 100);
    });
  })();


  /* ─── 5. NETWORK STATUS BANNER ───────────────────────── */
  (function() {
    var banner = document.createElement('div');
    banner.id = 'ai-net-banner';
    document.body.appendChild(banner);

    function showOffline() {
      banner.textContent = '📡 No internet connection — some features may not work';
      banner.classList.remove('online');
      banner.classList.add('show');
    }
    function showOnline() {
      banner.textContent = '✅ Connection restored!';
      banner.classList.add('online', 'show');
      setTimeout(function() { banner.classList.remove('show'); }, 2500);
    }

    window.addEventListener('offline', showOffline);
    window.addEventListener('online',  showOnline);
    if (!navigator.onLine) showOffline();
  })();


  /* ─── 6. SMOOTH NUMBER COUNTER ───────────────────────── */
  (function() {
    if (!window.IntersectionObserver) return;
    function animCount(el) {
      var raw = el.textContent.trim();
      // Match number possibly with % or other suffix
      var match = raw.match(/^([^0-9]*)([0-9]+(?:\.[0-9]+)?)(.*)$/);
      if (!match) return;
      var prefix = match[1], end = parseFloat(match[2]), suffix = match[3];
      if (isNaN(end) || end === 0) return;
      var start = 0, duration = 1200, startTime = null;
      function step(ts) {
        if (!startTime) startTime = ts;
        var prog = Math.min((ts - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - prog, 3);
        var val = Math.round(start + (end - start) * eased);
        el.textContent = prefix + val + suffix;
        if (prog < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          animCount(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    function observeNumbers() {
      var selectors = '.metric-value,.stat-value,.trust-value,.ring-num,.score-number';
      document.querySelectorAll(selectors).forEach(function(el) {
        if (!el.dataset.counted) {
          el.dataset.counted = '1';
          obs.observe(el);
        }
      });
    }
    setTimeout(observeNumbers, 400);
    window.aiObserveNumbers = observeNumbers;
  })();


  /* ─── 7. KEYBOARD SHORTCUTS ──────────────────────────── */
  (function() {
    var shortcuts = [
      { key: 'D', desc: 'Dashboard',        href: '/dashboard.html' },
      { key: 'R', desc: 'Resume Upload',     href: '/resume-upload.html' },
      { key: 'A', desc: 'ATS Checker',       href: '/ats-checker.html' },
      { key: 'N', desc: 'NLP Analyzer',      href: '/nlp-analyzer.html' },
      { key: 'J', desc: 'Job Match',         href: '/job-match.html' },
      { key: 'H', desc: 'Activity History',  href: '/history.html' },
      { key: 'S', desc: 'Settings',          href: '/settings.html' },
    ];

    // Build panel
    var overlay = document.createElement('div');
    overlay.id = 'ai-shortcuts-overlay';
    var rows = shortcuts.map(function(s) {
      return '<div class="ai-sc-row">' +
        '<span class="ai-sc-label">' + s.desc + '</span>' +
        '<span class="ai-sc-key">' +
          '<span class="ai-sc-kbd">Alt</span>' +
          '<span class="ai-sc-kbd">' + s.key + '</span>' +
        '</span></div>';
    }).join('');
    overlay.innerHTML =
      '<div id="ai-shortcuts-panel">' +
        '<div class="ai-sc-title">⌨️ Keyboard Shortcuts</div>' +
        rows +
        '<div class="ai-sc-row">' +
          '<span class="ai-sc-label">Show this panel</span>' +
          '<span class="ai-sc-key"><span class="ai-sc-kbd">?</span></span>' +
        '</div>' +
        '<button class="ai-sc-close" id="aiScClose">Close</button>' +
      '</div>';
    document.body.appendChild(overlay);

    document.getElementById('aiScClose').addEventListener('click', function() {
      overlay.classList.remove('show');
    });
    overlay.addEventListener('click', function(e) {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    // Key listener
    document.addEventListener('keydown', function(e) {
      // ? key = show panel
      if (e.key === '?' && !e.altKey && !e.ctrlKey &&
          !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)) {
        overlay.classList.toggle('show');
        return;
      }
      // Escape = close panel
      if (e.key === 'Escape') { overlay.classList.remove('show'); return; }
      // Alt + key = navigate
      if (!e.altKey) return;
      shortcuts.forEach(function(s) {
        if (e.key.toUpperCase() === s.key) {
          e.preventDefault();
          window.location.href = s.href;
        }
      });
    });
  })();


  /* ─── 8. PREFETCH ON HOVER ───────────────────────────── */
  (function() {
    var prefetched = {};
    document.addEventListener('mouseover', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('http') || href.startsWith('#') ||
          href.startsWith('mailto') || prefetched[href]) return;
      prefetched[href] = true;
      var l = document.createElement('link');
      l.rel = 'prefetch'; l.href = href;
      document.head.appendChild(l);
    });
  })();


  /* ─── 9. CONFETTI BURST ──────────────────────────────── */
  window.confetti = function(opts) {
    opts = opts || {};
    var count  = opts.count  || 120;
    var origin = opts.origin || { x: 0.5, y: 0.35 };
    var colors = opts.colors || ['#10B981','#6366F1','#F59E0B','#EF4444','#06B6D4','#ffffff'];

    for (var i = 0; i < count; i++) {
      (function(i) {
        setTimeout(function() {
          var piece = document.createElement('div');
          piece.className = 'ai-confetti-piece';
          var color = colors[Math.floor(Math.random() * colors.length)];
          var startX = origin.x * window.innerWidth + (Math.random() - 0.5) * 80;
          var startY = origin.y * window.innerHeight;
          var size = Math.random() * 8 + 6;
          var drift = (Math.random() - 0.5) * 300;
          var dur   = Math.random() * 1.8 + 1.4;
          piece.style.cssText =
            'left:' + startX + 'px;' +
            'top:' + startY + 'px;' +
            'width:' + size + 'px;' +
            'height:' + size + 'px;' +
            'background:' + color + ';' +
            'border-radius:' + (Math.random() > 0.5 ? '50%' : '2px') + ';' +
            'animation-duration:' + dur + 's;' +
            'animation-delay:' + (i * 0.008) + 's;' +
            'transform:translateX(' + drift + 'px);';
          document.body.appendChild(piece);
          setTimeout(function() {
            if (piece.parentNode) piece.parentNode.removeChild(piece);
          }, (dur + 0.5) * 1000);
        }, i * 8);
      })(i);
    }
  };


  /* ─── 10. IDLE SESSION WARNING ───────────────────────── */
  (function() {
    // Only run on authenticated pages (not login/signup/index)
    var page = window.location.pathname;
    if (['/login.html','/signup.html','/index.html','/'].includes(page)) return;
    if (!localStorage.getItem('token')) return;

    var WARN_AFTER   = 25 * 60 * 1000; // 25 min
    var LOGOUT_AFTER = 30 * 60 * 1000; // 30 min
    var warnTimer, logoutTimer, countTimer;
    var countEl;

    // Build overlay
    var overlay = document.createElement('div');
    overlay.id = 'ai-idle-overlay';
    overlay.innerHTML =
      '<div id="ai-idle-box">' +
        '<div class="ai-idle-icon">⏰</div>' +
        '<div class="ai-idle-title">Still there?</div>' +
        '<div class="ai-idle-sub">Your session will expire in</div>' +
        '<div class="ai-idle-count" id="aiIdleCount">5:00</div>' +
        '<button class="ai-idle-btn" id="aiIdleStay">Yes, keep me logged in</button>' +
      '</div>';
    document.body.appendChild(overlay);

    function showWarning() {
      overlay.classList.add('show');
      var secs = 300; // 5 min countdown
      countEl = document.getElementById('aiIdleCount');
      clearInterval(countTimer);
      countTimer = setInterval(function() {
        secs--;
        var m = Math.floor(secs / 60), s = secs % 60;
        if (countEl) countEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        if (secs <= 0) { clearInterval(countTimer); doLogout(); }
      }, 1000);
    }

    function dismiss() {
      overlay.classList.remove('show');
      clearInterval(countTimer);
      resetTimers();
    }

    function doLogout() {
      overlay.classList.remove('show');
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login.html';
    }

    function resetTimers() {
      clearTimeout(warnTimer);
      clearTimeout(logoutTimer);
      warnTimer   = setTimeout(showWarning, WARN_AFTER);
      logoutTimer = setTimeout(doLogout,    LOGOUT_AFTER);
    }

    document.getElementById('aiIdleStay').addEventListener('click', dismiss);

    // Reset on any activity
    ['mousemove','keydown','click','touchstart','scroll'].forEach(function(ev) {
      document.addEventListener(ev, function() {
        if (!overlay.classList.contains('show')) resetTimers();
      }, { passive: true });
    });

    resetTimers();
  })();


  /* ─── PAGE TRANSITIONS ───────────────────────────────── */
  (function() {
    var overlay = document.createElement('div');
    overlay.id = 'page-transition-overlay';
    document.body.appendChild(overlay);

    document.addEventListener('click', function(e) {
      var link = e.target.closest('a[href]');
      if (!link) return;
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') ||
          href.startsWith('mailto') || href.startsWith('tel') ||
          link.target === '_blank') return;
      e.preventDefault();
      overlay.classList.add('active');
      setTimeout(function() { window.location.href = href; }, 210);
    });
  })();


  /* ─── TOAST NOTIFICATIONS ────────────────────────────── */
  (function() {
    var container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
    var icons = { success:'✅', error:'❌', info:'ℹ️', warn:'⚠️' };

    window.toast = function(msg, type, duration) {
      type     = type     || 'success';
      duration = duration || 3500;
      var t = document.createElement('div');
      t.className = 'ai-toast ai-toast-' + type;
      t.innerHTML =
        '<span class="ai-toast-icon">' + (icons[type] || '✅') + '</span>' +
        '<span class="ai-toast-msg">'  + msg + '</span>';
      container.appendChild(t);
      setTimeout(function() {
        t.classList.add('removing');
        setTimeout(function() { if (t.parentNode) t.parentNode.removeChild(t); }, 300);
      }, duration);
    };
  })();

})();