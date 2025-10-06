(function(){
  const bgSelector = '.background';
  const bgAttr = 'data-bg';
  const header = document.getElementById('header');
  const navToggle = document.getElementById('nav-toggle');
  const nav = document.getElementById('primary-nav');
  const navLinks = document.querySelectorAll('[data-nav]');
  const revealElements = document.querySelectorAll('.reveal');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function lazyLoadBackground(){
    const el = document.querySelector(bgSelector);
    if(!el) return;
    const src = el.getAttribute(bgAttr);
    if(!src) return;
    const img = new Image();
    img.onload = () => {
      el.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)), url("${src}")`;
      el.style.backgroundSize = 'cover';
      el.style.backgroundPosition = 'center';
    };
    img.onerror = () => { el.style.backgroundImage='none'; el.style.backgroundColor='#000'; };
    img.src = src;
  }

  function setNavHeight(){
    const h = header ? header.offsetHeight : 72;
    document.documentElement.style.setProperty('--nav-height', `${h}px`);
  }

  function onScroll(){
    if(!header) return;
    if(window.scrollY > 8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    updateActiveNav();
  }

  function toggleNav(){
    if(!navToggle) return;
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if(nav) nav.classList.toggle('open', !expanded);
  }
  function closeNav(){ if(nav) nav.classList.remove('open'); if(navToggle) navToggle.setAttribute('aria-expanded','false'); }

  function smoothScrollHandler(e){
    const href = this.getAttribute('href');
    if(!href || !href.startsWith('#')) return;
    e.preventDefault();
    const target = document.querySelector(href);
    if(!target) return;
    target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    closeNav();
  }

  function createRevealObserver(){
    if(prefersReduced){ revealElements.forEach(el=>el.classList.add('is-visible')); return; }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => { if(entry.isIntersecting){ entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }});
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealElements.forEach(el => io.observe(el));
  }

  function runTypewriter(el, texts, speed=60, pause=1100){
    if(!el) return;
    let idx=0, char=0, dir=1;
    function loop(){
      const t = texts[idx];
      el.textContent = t.slice(0, char);
      if(dir===1 && char===t.length){ dir=-1; setTimeout(loop,pause); }
      else if(dir===-1 && char===0){ dir=1; idx=(idx+1)%texts.length; setTimeout(loop,200); }
      else{ char+=dir; setTimeout(loop, prefersReduced?0:speed); }
    }
    loop();
  }

  function updateActiveNav(){
    const sections = document.querySelectorAll('main > section[id]');
    if(!sections.length) return;
    let current = sections[0];
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if(rect.top <= 120 && rect.bottom >= 120) current = section;
    });
    navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current.id}`));
  }

  function setupMarquee(){
    const container = document.getElementById('marquee');
    const track = document.getElementById('marquee-track');
    if(!container || !track) return;
    function apply(){
      const cw = container.getBoundingClientRect().width;
      const tw = track.getBoundingClientRect().width;
      const pxPerSecond = 140;
      const distance = cw + tw;
      const secs = Math.max(8, Math.round(distance / pxPerSecond));
      document.documentElement.style.setProperty('--marquee-duration', `${secs}s`);
    }
    apply();
    let rID;
    window.addEventListener('resize', () => { clearTimeout(rID); rID = setTimeout(apply, 120); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    lazyLoadBackground();
    setNavHeight();
    createRevealObserver();
    setupMarquee();

    if(navToggle) navToggle.addEventListener('click', toggleNav);
    document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', smoothScrollHandler));
    runTypewriter(document.getElementById('typewriter'), ['Hi — I’m Sahil', 'AI & Data Science • Builder', 'I make clean, useful things'], 60, 1200);
  });

  window.addEventListener('resize', setNavHeight);
  window.addEventListener('scroll', onScroll, { passive: true });
})();
