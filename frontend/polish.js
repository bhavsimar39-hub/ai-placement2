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


  /* ══════════════════════════════════════════════════════════
     NEW FEATURES 11–20
  ══════════════════════════════════════════════════════════ */

  /* ─── 11. BACK-TO-TOP BUTTON ─────────────────────────── */
  (function() {
    injectStyle(
      '#ai-btt{' +
        'position:fixed;bottom:32px;right:28px;z-index:99990;' +
        'width:44px;height:44px;border-radius:50%;' +
        'background:linear-gradient(135deg,#10B981,#059669);' +
        'border:none;cursor:pointer;color:#fff;font-size:18px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'box-shadow:0 4px 16px rgba(16,185,129,0.4);' +
        'opacity:0;transform:translateY(12px) scale(0.85);pointer-events:none;' +
        'transition:opacity 0.28s ease,transform 0.28s cubic-bezier(0.34,1.2,0.64,1);' +
        'font-family:inherit;' +
      '}' +
      '#ai-btt.show{opacity:1;transform:translateY(0) scale(1);pointer-events:all;}' +
      '#ai-btt:hover{transform:translateY(-3px) scale(1.08);box-shadow:0 8px 24px rgba(16,185,129,0.5);}',
    'polish-btt');
    var btn = document.createElement('button');
    btn.id = 'ai-btt';
    btn.title = 'Back to top';
    btn.innerHTML = '↑';
    document.body.appendChild(btn);
    window.addEventListener('scroll', function() {
      if (window.scrollY > 300) btn.classList.add('show');
      else btn.classList.remove('show');
    }, { passive: true });
    btn.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  })();


  /* ─── 12. DARK MODE TOGGLE ───────────────────────────── */
  (function() {
    injectStyle(
      '#ai-dm-btn{' +
        'position:fixed;bottom:86px;right:28px;z-index:99990;' +
        'width:44px;height:44px;border-radius:50%;' +
        'background:var(--bg-card,#fff);' +
        'border:1.5px solid var(--border,#E2E8F0);' +
        'cursor:pointer;font-size:18px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.1);' +
        'transition:all 0.25s ease;' +
      '}' +
      '#ai-dm-btn:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(0,0,0,0.15);}' +

      /* ── Root & page shell ──────────────────────────────── */
      'html.ai-dark,body.ai-dark{' +
        'background:#0F1419 !important;color:#F9FAFB !important;' +
        'color-scheme:dark;' +
      '}' +

      /* ── Layout regions ─────────────────────────────────── */
      'body.ai-dark main,' +
      'body.ai-dark section,' +
      'body.ai-dark article,' +
      'body.ai-dark aside,' +
      'body.ai-dark header,' +
      'body.ai-dark footer,' +
      'body.ai-dark nav,' +
      'body.ai-dark .navbar,' +
      'body.ai-dark .sidebar,' +
      'body.ai-dark #sidebar-container,' +
      'body.ai-dark .page-wrapper,' +
      'body.ai-dark .page-content,' +
      'body.ai-dark .hero,' +
      'body.ai-dark .hero-section,' +
      'body.ai-dark .landing-hero,' +
      'body.ai-dark .features-section,' +
      'body.ai-dark .solutions-section,' +
      'body.ai-dark .pricing-section,' +
      'body.ai-dark .about-section,' +
      'body.ai-dark .contact-section,' +
      'body.ai-dark .wrap,' +
      'body.ai-dark .wrapper,' +
      'body.ai-dark .container,' +
      'body.ai-dark .content{' +
        'background:#0F1419 !important;color:#F9FAFB !important;' +
      '}' +

      /* ── Cards & surfaces ───────────────────────────────── */
      'body.ai-dark .metric-card,' +
      'body.ai-dark .stat-card,' +
      'body.ai-dark .feature-card,' +
      'body.ai-dark .skills-card,' +
      'body.ai-dark .glass-card,' +
      'body.ai-dark .info-card,' +
      'body.ai-dark .result-card,' +
      'body.ai-dark .analysis-card,' +
      'body.ai-dark .blog-card,' +
      'body.ai-dark .solution-card,' +
      'body.ai-dark .pricing-card,' +
      'body.ai-dark .welcome-header,' +
      'body.ai-dark .dashboard-header,' +
      'body.ai-dark .login-card,' +
      'body.ai-dark .signup-card,' +
      'body.ai-dark .auth-card,' +
      'body.ai-dark .modal,' +
      'body.ai-dark .modal-content,' +
      'body.ai-dark .dropdown,' +
      'body.ai-dark .dropdown-menu,' +
      'body.ai-dark .panel,' +
      'body.ai-dark .card{' +
        'background:#1A1F26 !important;' +
        'border-color:rgba(255,255,255,0.08) !important;' +
        'color:#F9FAFB !important;' +
      '}' +

      /* ── Navigation bar ─────────────────────────────────── */
      'body.ai-dark .navbar,' +
      'body.ai-dark .top-nav,' +
      'body.ai-dark .nav-bar,' +
      'body.ai-dark nav{' +
        'background:rgba(15,20,25,0.95) !important;' +
        'border-bottom-color:rgba(255,255,255,0.07) !important;' +
      '}' +
      'body.ai-dark nav a,' +
      'body.ai-dark .navbar a,' +
      'body.ai-dark .nav-link{color:#D1D5DB !important;}' +
      'body.ai-dark nav a:hover,' +
      'body.ai-dark .nav-link:hover{color:#10B981 !important;}' +

      /* ── Typography ─────────────────────────────────────── */
      'body.ai-dark h1,body.ai-dark h2,body.ai-dark h3,' +
      'body.ai-dark h4,body.ai-dark h5,body.ai-dark h6{color:#F9FAFB !important;}' +
      'body.ai-dark p,body.ai-dark li,body.ai-dark span:not(.ai-sc-kbd),' +
      'body.ai-dark label{color:#D1D5DB !important;}' +
      'body.ai-dark .metric-label,' +
      'body.ai-dark .greeting,' +
      'body.ai-dark .welcome-subtitle,' +
      'body.ai-dark .metric-subtitle,' +
      'body.ai-dark .hero-subtitle,' +
      'body.ai-dark .section-subtitle,' +
      'body.ai-dark .text-muted,' +
      'body.ai-dark .text-gray,' +
      'body.ai-dark small{color:#9CA3AF !important;}' +
      'body.ai-dark .metric-value,' +
      'body.ai-dark .stat-value,' +
      'body.ai-dark .user-name,' +
      'body.ai-dark .skills-card-title,' +
      'body.ai-dark .hero-title,' +
      'body.ai-dark .section-title{color:#F9FAFB !important;}' +

      /* ── Forms & inputs ─────────────────────────────────── */
      'body.ai-dark input,' +
      'body.ai-dark textarea,' +
      'body.ai-dark select{' +
        'background:#1A1F26 !important;' +
        'color:#F9FAFB !important;' +
        'border-color:rgba(255,255,255,0.12) !important;' +
      '}' +
      'body.ai-dark input::placeholder,' +
      'body.ai-dark textarea::placeholder{color:#6B7280 !important;}' +

      /* ── Tables ─────────────────────────────────────────── */
      'body.ai-dark table,' +
      'body.ai-dark thead,' +
      'body.ai-dark tbody,' +
      'body.ai-dark th,' +
      'body.ai-dark td{' +
        'background:#1A1F26 !important;' +
        'color:#F9FAFB !important;' +
        'border-color:rgba(255,255,255,0.07) !important;' +
      '}' +
      'body.ai-dark thead,' +
      'body.ai-dark thead th{background:#12181F !important;}' +

      /* ── Buttons (non-primary) ───────────────────────────── */
      'body.ai-dark .btn-secondary,' +
      'body.ai-dark button:not(.btn-primary):not(#ai-btt):not(#ai-dm-btn):not(.ai-sc-close):not(.ai-idle-btn){' +
        'background:#1A1F26 !important;' +
        'color:#D1D5DB !important;' +
        'border-color:rgba(255,255,255,0.12) !important;' +
      '}' +

      /* ── Utility backgrounds ─────────────────────────────── */
      'body.ai-dark .bg-white,' +
      'body.ai-dark .bg-gray-50,' +
      'body.ai-dark .bg-gray-100,' +
      'body.ai-dark [class*="bg-white"],[class*="bg-light"]{' +
        'background:#1A1F26 !important;' +
      '}' +
      'body.ai-dark hr,' +
      'body.ai-dark .divider{border-color:rgba(255,255,255,0.07) !important;}' +

      /* ── Scrollbar ───────────────────────────────────────── */
      'body.ai-dark ::-webkit-scrollbar-track{background:#0F1419;}' +
      'body.ai-dark ::-webkit-scrollbar-thumb{background:#374151;}' +
      'body.ai-dark ::-webkit-scrollbar-thumb:hover{background:#4B5563;}',
    'polish-darkmode');

    var btn = document.createElement('button');
    btn.id = 'ai-dm-btn';
    btn.title = 'Toggle dark mode';

    // ── Colours that count as "light" (white / near-white / light-gray) ──────
    var DARK_SURFACE = '#1A1F26';
    var DARK_TEXT    = '#F9FAFB';

    // Parse "rgb(r,g,b)" / "rgba(r,g,b,a)" → {r,g,b,a}
    function parseRgb(str) {
      var m = str.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/);
      if (!m) return null;
      return { r: +m[1], g: +m[2], b: +m[3], a: m[4] != null ? +m[4] : 1 };
    }

    // Perceived lightness (0–255): > 200 = very light, < 50 = very dark
    function luminance(c) { return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; }

    // Block-level tags whose backgrounds we care about
    var SCAN_TAGS = 'div,section,main,article,aside,header,footer,form,ul,ol,li,table,thead,tbody,tr,td,th';

    function scanAndDarken() {
      document.querySelectorAll(SCAN_TAGS).forEach(function(el) {
        // Skip elements that already have a dark inline override from us
        if (el.getAttribute('data-dm-overridden')) return;

        var bg = window.getComputedStyle(el).backgroundColor;
        var c  = parseRgb(bg);
        if (!c) return;
        // Skip fully transparent (alpha 0) — the element has no real background
        if (c.a === 0) return;
        // Only override if the computed colour is clearly light (lum > 200)
        if (luminance(c) <= 200) return;

        // Save originals so we can restore on light-mode toggle
        el.setAttribute('data-dm-orig-bg',    el.style.backgroundColor    || '');
        el.setAttribute('data-dm-orig-color',  el.style.color              || '');
        el.setAttribute('data-dm-orig-border', el.style.borderColor        || '');
        el.setAttribute('data-dm-overridden',  '1');

        el.style.setProperty('background-color', DARK_SURFACE, 'important');
        el.style.setProperty('color',            DARK_TEXT,    'important');
        el.style.setProperty('border-color',     'rgba(255,255,255,0.08)', 'important');
      });
    }

    function restoreLight() {
      document.querySelectorAll('[data-dm-overridden]').forEach(function(el) {
        el.style.backgroundColor = el.getAttribute('data-dm-orig-bg')    || '';
        el.style.color           = el.getAttribute('data-dm-orig-color')  || '';
        el.style.borderColor     = el.getAttribute('data-dm-orig-border') || '';
        el.removeAttribute('data-dm-overridden');
        el.removeAttribute('data-dm-orig-bg');
        el.removeAttribute('data-dm-orig-color');
        el.removeAttribute('data-dm-orig-border');
      });
    }

    // Re-run the scan after dynamic content loads (SPA route changes, etc.)
    var _dmObserver = null;
    function watchDom(dark) {
      if (_dmObserver) { _dmObserver.disconnect(); _dmObserver = null; }
      if (!dark) return;
      if (!window.MutationObserver) return;
      _dmObserver = new MutationObserver(function(mutations) {
        var added = false;
        mutations.forEach(function(m) { if (m.addedNodes.length) added = true; });
        if (added) setTimeout(scanAndDarken, 80); // slight delay for paint
      });
      _dmObserver.observe(document.body, { childList: true, subtree: true });
    }

    function apply(dark) {
      document.documentElement.classList.toggle('ai-dark', dark);
      document.body.classList.toggle('ai-dark', dark);
      btn.innerHTML = dark ? '☀️' : '🌙';
      localStorage.setItem('ai-dark', dark ? '1' : '0');

      if (dark) {
        // Run after current paint so computed styles are final
        requestAnimationFrame(function() {
          setTimeout(scanAndDarken, 60);
        });
        watchDom(true);
      } else {
        watchDom(false);
        restoreLight();
      }
    }

    var isDark = localStorage.getItem('ai-dark') === '1' ||
      (!localStorage.getItem('ai-dark') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    // On page load, wait for DOM to finish painting before scanning
    if (isDark) {
      document.documentElement.classList.add('ai-dark');
      document.body.classList.add('ai-dark');
      window.addEventListener('load', function() {
        setTimeout(function() { apply(true); }, 120);
      });
    }

    document.body.appendChild(btn);
    btn.innerHTML = isDark ? '☀️' : '🌙';
    btn.addEventListener('click', function() {
      apply(!document.body.classList.contains('ai-dark'));
    });
  })();


  /* ─── 13. CLICK-TO-COPY ──────────────────────────────── */
  (function() {
    injectStyle(
      '[data-copy]{cursor:pointer;position:relative;}' +
      '[data-copy]:hover::after{' +
        'content:"Click to copy";position:absolute;bottom:100%;left:50%;' +
        'transform:translateX(-50%);background:rgba(15,20,25,0.9);' +
        'color:#fff;font-size:11px;font-weight:600;padding:4px 8px;' +
        'border-radius:6px;white-space:nowrap;pointer-events:none;margin-bottom:4px;' +
        'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
      '}',
    'polish-copy');
    document.addEventListener('click', function(e) {
      var el = e.target.closest('[data-copy]');
      if (!el) return;
      var text = el.getAttribute('data-copy') || el.textContent;
      if (!navigator.clipboard) return;
      navigator.clipboard.writeText(text.trim()).then(function() {
        if (window.toast) window.toast('Copied to clipboard!', 'success', 2000);
      });
    });
  })();


  /* ─── 14. BUTTON RIPPLE EFFECT ───────────────────────── */
  (function() {
    injectStyle(
      '.ai-ripple-host{position:relative;overflow:hidden;}' +
      '.ai-ripple{' +
        'position:absolute;border-radius:50%;' +
        'background:rgba(255,255,255,0.35);' +
        'transform:scale(0);pointer-events:none;' +
        'animation:ai-ripple-anim 0.55s linear forwards;' +
      '}' +
      '@keyframes ai-ripple-anim{' +
        'to{transform:scale(4);opacity:0;}' +
      '}',
    'polish-ripple');

    document.addEventListener('click', function(e) {
      var btn = e.target.closest('button, .btn-primary, .btn-secondary, .btn-google, [role="button"]');
      if (!btn) return;
      btn.classList.add('ai-ripple-host');
      var rect = btn.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height);
      var r = document.createElement('span');
      r.className = 'ai-ripple';
      r.style.cssText =
        'width:' + size + 'px;height:' + size + 'px;' +
        'left:' + (e.clientX - rect.left - size/2) + 'px;' +
        'top:'  + (e.clientY - rect.top  - size/2) + 'px;';
      btn.appendChild(r);
      setTimeout(function() { if (r.parentNode) r.parentNode.removeChild(r); }, 600);
    });
  })();


  /* ─── 15. GLOBAL ERROR CATCHER ───────────────────────── */
  (function() {
    window.addEventListener('error', function(e) {
      console.error('[AI Placement Error]', e.message, e.filename, e.lineno);
      if (window.toast) {
        window.toast('Something went wrong. Please refresh if issues persist.', 'warn', 4000);
      }
    });
    window.addEventListener('unhandledrejection', function(e) {
      console.error('[AI Placement Promise Error]', e.reason);
      if (e.reason && e.reason.message && e.reason.message.includes('fetch')) {
        if (window.toast) window.toast('Network request failed. Check your connection.', 'error', 4000);
      }
    });
  })();


  /* ─── 16. RIGHT-CLICK CONTEXT MENU ──────────────────── */
  (function() {
    injectStyle(
      '#ai-ctx-menu{' +
        'position:fixed;z-index:999996;' +
        'background:#1A1F26;border:1px solid rgba(16,185,129,0.2);' +
        'border-radius:12px;padding:6px;min-width:200px;' +
        'box-shadow:0 16px 48px rgba(0,0,0,0.4);' +
        'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
        'opacity:0;transform:scale(0.92);pointer-events:none;' +
        'transition:opacity 0.18s ease,transform 0.18s cubic-bezier(0.34,1.2,0.64,1);' +
        'transform-origin:top left;' +
      '}' +
      '#ai-ctx-menu.show{opacity:1;transform:scale(1);pointer-events:all;}' +
      '.ai-ctx-item{' +
        'display:flex;align-items:center;gap:10px;' +
        'padding:9px 14px;border-radius:8px;cursor:pointer;' +
        'font-size:13px;font-weight:600;color:#D1D5DB;' +
        'transition:background 0.15s;' +
      '}' +
      '.ai-ctx-item:hover{background:rgba(16,185,129,0.12);color:#10B981;}' +
      '.ai-ctx-sep{height:1px;background:rgba(255,255,255,0.06);margin:4px 0;}',
    'polish-ctx');

    var menu = document.createElement('div');
    menu.id = 'ai-ctx-menu';
    var pages = [
      { icon:'📊', label:'Dashboard',     href:'/dashboard.html' },
      { icon:'📄', label:'Resume Upload',  href:'/resume-upload.html' },
      { icon:'✅', label:'ATS Checker',    href:'/ats-checker.html' },
      { icon:'🧬', label:'Career DNA',     href:'/career-dna.html' },
      { icon:'💼', label:'Job Match',      href:'/job-match.html' },
    ];
    menu.innerHTML =
      pages.map(function(p) {
        return '<div class="ai-ctx-item" data-href="' + p.href + '">' +
          '<span>' + p.icon + '</span><span>' + p.label + '</span></div>';
      }).join('<div class="ai-ctx-sep"></div>') +
      '<div class="ai-ctx-sep"></div>' +
      '<div class="ai-ctx-item" id="ai-ctx-top"><span>↑</span><span>Back to Top</span></div>';
    document.body.appendChild(menu);

    document.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      var x = Math.min(e.clientX, window.innerWidth  - 220);
      var y = Math.min(e.clientY, window.innerHeight - 260);
      menu.style.left = x + 'px';
      menu.style.top  = y + 'px';
      menu.classList.add('show');
    });
    document.addEventListener('click', function() { menu.classList.remove('show'); });
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') menu.classList.remove('show');
    });
    menu.addEventListener('click', function(e) {
      var item = e.target.closest('.ai-ctx-item');
      if (!item) return;
      if (item.id === 'ai-ctx-top') { window.scrollTo({ top:0, behavior:'smooth' }); return; }
      var href = item.getAttribute('data-href');
      if (href) window.location.href = href;
    });
  })();


  /* ─── 17. PAGE LOAD TIME BADGE ───────────────────────── */
  (function() {
    injectStyle(
      '#ai-perf-badge{' +
        'position:fixed;bottom:32px;left:24px;z-index:99989;' +
        'background:rgba(15,20,25,0.82);backdrop-filter:blur(8px);' +
        'border:1px solid rgba(16,185,129,0.2);border-radius:8px;' +
        'padding:5px 12px;font-size:11px;font-weight:700;' +
        'font-family:"JetBrains Mono",monospace;color:#10B981;' +
        'opacity:0;transition:opacity 0.4s ease;pointer-events:none;' +
      '}',
    'polish-perf');
    var badge = document.createElement('div');
    badge.id = 'ai-perf-badge';
    document.body.appendChild(badge);
    window.addEventListener('load', function() {
      setTimeout(function() {
        var nav = performance && performance.getEntriesByType &&
                  performance.getEntriesByType('navigation')[0];
        if (!nav) return;
        var ms = Math.round(nav.loadEventEnd - nav.startTime);
        if (ms <= 0 || ms > 30000) return;
        badge.textContent = '⚡ ' + ms + 'ms';
        badge.style.opacity = '1';
        setTimeout(function() { badge.style.opacity = '0'; }, 5000);
      }, 300);
    });
  })();


  /* ─── 18. INPUT FOCUS SHIMMER ────────────────────────── */
  (function() {
    injectStyle(
      '@keyframes ai-input-pulse{' +
        '0%{box-shadow:0 0 0 0px rgba(16,185,129,0.25);}' +
        '70%{box-shadow:0 0 0 6px rgba(16,185,129,0);}' +
        '100%{box-shadow:0 0 0 0px rgba(16,185,129,0);}' +
      '}' +
      'input:focus,textarea:focus,select:focus{' +
        'animation:ai-input-pulse 0.7s ease !important;' +
        'outline:none !important;' +
      '}',
    'polish-inputshimmer');
  })();


  /* ─── 19. PRINT MODE ─────────────────────────────────── */
  /* Print button removed. @media print styles kept for clean browser printing. */
  injectStyle(
    '@media print{' +
      '#sidebar-container,#ai-btt,#ai-dm-btn,#ai-ctx-menu,' +
      '#ai-load-bar,#ai-scroll-prog,#toast-container,' +
      '#ai-shortcuts-overlay,#ai-idle-overlay,' +
      '#ai-net-banner,#ai-perf-badge,' +
      'nav,.sidebar,.navbar,button.refresh-btn{display:none !important;}' +
      'body{background:#fff !important;color:#000 !important;}' +
      '.content{margin-left:0 !important;padding:20px !important;}' +
      '.metric-card,.skills-card,.welcome-header{' +
        'box-shadow:none !important;border:1px solid #ddd !important;' +
        'break-inside:avoid;' +
      '}' +
      '.dashboard-grid{grid-template-columns:repeat(3,1fr) !important;}' +
      '.metric-value{color:#000 !important;}' +
      '.skill-tag{border:1px solid #10B981 !important;color:#059669 !important;' +
        'background:#f0fdf4 !important;}' +
    '}',
  'polish-print');


  /* ─── 20. TYPING PAUSE INDICATOR ─────────────────────── */
  (function() {
    injectStyle(
      '#ai-typing-indicator{' +
        'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);' +
        'z-index:99988;background:rgba(15,20,25,0.85);backdrop-filter:blur(8px);' +
        'border:1px solid rgba(16,185,129,0.25);border-radius:50px;' +
        'padding:8px 18px;font-size:12px;font-weight:600;color:#10B981;' +
        'font-family:"Plus Jakarta Sans","Inter",sans-serif;' +
        'display:flex;align-items:center;gap:8px;' +
        'opacity:0;transform:translateX(-50%) translateY(8px);pointer-events:none;' +
        'transition:opacity 0.25s ease,transform 0.25s ease;' +
      '}' +
      '#ai-typing-indicator.show{opacity:1;transform:translateX(-50%) translateY(0);}' +
      '.ai-typing-dots{display:flex;gap:4px;align-items:center;}' +
      '.ai-typing-dots span{' +
        'width:5px;height:5px;border-radius:50%;background:#10B981;' +
        'animation:ai-dot-bounce 1.2s infinite;' +
      '}' +
      '.ai-typing-dots span:nth-child(2){animation-delay:0.2s;}' +
      '.ai-typing-dots span:nth-child(3){animation-delay:0.4s;}' +
      '@keyframes ai-dot-bounce{' +
        '0%,60%,100%{transform:translateY(0);}' +
        '30%{transform:translateY(-5px);}' +
      '}',
    'polish-typing');

    var indicator = document.createElement('div');
    indicator.id = 'ai-typing-indicator';
    indicator.innerHTML =
      '<div class="ai-typing-dots">' +
        '<span></span><span></span><span></span>' +
      '</div>' +
      '<span>AI is ready to analyze…</span>';
    document.body.appendChild(indicator);

    var typingTimer;
    document.addEventListener('input', function(e) {
      if (!['INPUT','TEXTAREA'].includes(e.target.tagName)) return;
      var t = e.target;
      if (t.type === 'checkbox' || t.type === 'radio') return;
      clearTimeout(typingTimer);
      indicator.classList.remove('show');
      if (t.value && t.value.length > 3) {
        typingTimer = setTimeout(function() {
          indicator.classList.add('show');
          setTimeout(function() { indicator.classList.remove('show'); }, 2200);
        }, 800);
      }
    });
  })();


})();