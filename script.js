// script.js — complete, mobile-friendly, defensive
(function () {
  'use strict';

  // ----- Config / selectors -----
  var BG_SELECTOR = '.background';
  var BG_ATTR = 'data-bg';
  var HEADER_ID = 'header';
  var NAV_ID = 'primary-nav';
  var NAV_TOGGLE_ID = 'nav-toggle';
  var TYPEWRITER_ID = 'typewriter';
  var MARQUEE_CONTAINER_ID = 'marquee';
  var MARQUEE_TRACK_ID = 'marquee-track';

  // ----- state -----
  var header = document.getElementById(HEADER_ID);
  var nav = document.getElementById(NAV_ID);
  var navToggle = document.getElementById(NAV_TOGGLE_ID);
  var navLinks = document.querySelectorAll('[data-nav]');
  var revealElements = document.querySelectorAll('.reveal');
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- helpers -----
  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  // ----- lazy-load background image -----
  function lazyLoadBackground () {
    var el = document.querySelector(BG_SELECTOR);
    if (!el) return;
    var src = el.getAttribute(BG_ATTR);
    if (!src) return;
    var img = new Image();
    img.onload = function () {
      // stacked gradient for contrast
      el.style.backgroundImage = 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url("' + src + '")';
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    };
    img.onerror = function () {
      el.style.backgroundImage = 'none';
      el.style.backgroundColor = '#000';
    };
    img.src = src;
  }

  // ----- update CSS var for nav height -----
  function setNavHeight () {
    var h = header ? header.offsetHeight : 72;
    document.documentElement.style.setProperty('--nav-height', h + 'px');
  }

  // ----- header scroll behavior -----
  function onScroll () {
    if (!header) return;
    if (window.scrollY > 8) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
    updateActiveNav();
  }

  // ----- open/close mobile nav (defensive) -----
  function toggleNav () {
    if (!navToggle) return;
    var expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if (!nav) return;
    nav.classList.toggle('open', !expanded);
    if (!expanded) {
      // focus the first link for a11y
      var first = nav.querySelector('a');
      if (first) first.focus();
    }
  }

  function closeNav () {
    if (!nav) return;
    nav.classList.remove('open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }

  // ----- smooth scroll for anchor links -----
  function smoothScrollHandler (e) {
    var href = this.getAttribute('href');
    if (!href || href.charAt(0) !== '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    try {
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    } catch (err) {
      target.scrollIntoView();
    }
    // micro-focus for keyboard users
    target.setAttribute('tabindex', '-1');
    try { target.focus({ preventScroll: true }); } catch (err) { target.focus(); }
    closeNav();
  }

  // ----- reveal elements via IntersectionObserver -----
  function createRevealObserver () {
    if (!revealElements || revealElements.length === 0) return;
    if (prefersReduced) {
      revealElements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealElements.forEach(function (el) { io.observe(el); });
  }

  // ----- accessible typewriter (non-blocking) -----
  function runTypewriter (el, texts, speed, pause) {
    if (!el || !texts || !texts.length) return;
    speed = typeof speed === 'number' ? speed : 60;
    pause = typeof pause === 'number' ? pause : 1100;
    var idx = 0, char = 0, dir = 1;

    function loop () {
      var t = texts[idx];
      // slice safely
      el.textContent = t.slice(0, char);
      // set aria-live content already present in DOM (HTML should have aria-live)
      if (dir === 1 && char === t.length) {
        dir = -1;
        setTimeout(loop, pause);
      } else if (dir === -1 && char === 0) {
        dir = 1;
        idx = (idx + 1) % texts.length;
        setTimeout(loop, 200);
      } else {
        char += dir;
        setTimeout(loop, prefersReduced ? 0 : speed);
      }
    }
    loop();
  }

  // ----- update active nav item -----
  function updateActiveNav () {
    var sections = document.querySelectorAll('main > section[id]');
    if (!sections || sections.length === 0) return;
    var current = sections[0];
    var focusY = 120;
    sections.forEach(function (section) {
      var rect = section.getBoundingClientRect();
      if (rect.top <= focusY && rect.bottom >= focusY) current = section;
    });
    navLinks.forEach(function (a) {
      var href = a.getAttribute('href') || '';
      a.classList.toggle('active', href === '#' + current.id);
    });
  }

  // ----- adaptive marquee -----
  function setupMarquee () {
    var container = document.getElementById(MARQUEE_CONTAINER_ID);
    var track = document.getElementById(MARQUEE_TRACK_ID);
    if (!container || !track) return;

    function apply () {
      var cw = Math.max(0, container.getBoundingClientRect().width);
      var tw = Math.max(0, track.getBoundingClientRect().width);
      // px per second baseline — adjust for feel
      var pxPerSecond = 140;
      var distance = cw + tw;
      var secs = Math.max(6, Math.round(distance / pxPerSecond));
      document.documentElement.style.setProperty('--marquee-duration', secs + 's');
      // ensure CSS animation restarts when duration changes
      track.style.animation = 'none';
      // force reflow
      /* eslint-disable no-unused-expressions */
      track.offsetHeight;
      track.style.animation = '';
    }

    var applyDebounced = debounce(apply, 120);
    apply();
    window.addEventListener('resize', applyDebounced, { passive: true });

    // touch devices: pause marquee while touching
    var pauseMarquee = function () { track.style.animationPlayState = 'paused'; };
    var resumeMarquee = function () { track.style.animationPlayState = ''; };
    container.addEventListener('touchstart', pauseMarquee, { passive: true });
    container.addEventListener('touchend', resumeMarquee, { passive: true });
    container.addEventListener('mouseenter', pauseMarquee);
    container.addEventListener('mouseleave', resumeMarquee);
  }

  // ----- init / event wiring -----
  document.addEventListener('DOMContentLoaded', function () {
    lazyLoadBackground();
    setNavHeight();
    createRevealObserver();
    setupMarquee();

    // nav toggle (click + touchstart defensive)
    if (navToggle) {
      var handleNavToggle = function (ev) {
        // prevent double event in some browsers
        if (ev && ev.type === 'touchstart') ev.preventDefault();
        toggleNav();
      };
      navToggle.addEventListener('click', handleNavToggle, { passive: true });
      navToggle.addEventListener('touchstart', handleNavToggle, { passive: false });
    }

    // attach smooth scroll to internal links
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', smoothScrollHandler, { passive: false });
    });

    // run typewriter
    var tw = document.getElementById(TYPEWRITER_ID);
    runTypewriter(tw, ['Hi — I’m Sahil', 'AI & Data Science • Builder', 'I make clean, useful things'], 60, 1200);
  });

  // resize handling
  window.addEventListener('resize', debounce(function () {
    setNavHeight();
    // if mobile nav open, ensure it fills height properly
    if (nav && nav.classList.contains('open')) {
      document.documentElement.style.setProperty('--nav-height', (header ? header.offsetHeight : 72) + 'px');
    }
  }, 120), { passive: true });

  // scroll handling
  window.addEventListener('scroll', onScroll, { passive: true });

  // close nav if user presses Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeNav();
    }
  });

  // small defensive startup: if LinkedIn script blocks or errors, it won't break the rest
  window.addEventListener('error', function (ev) {
    // ignore unrelated errors — no-op, but prevents uncaught in some environments
    return false;
  });
})();
