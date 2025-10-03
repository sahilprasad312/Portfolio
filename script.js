/* -------------------------
   Helper: set CSS nav height
   ensures first content isn't hidden under fixed navbar
------------------------- */
const header = document.getElementById('header');
function updateNavHeight() {
  const h = header.offsetHeight || 72;
  document.documentElement.style.setProperty('--nav-height', `${h}px`);
}
window.addEventListener('load', updateNavHeight);
window.addEventListener('resize', updateNavHeight);

/* -------------------------
   Navbar shadow toggle on scroll
------------------------- */
window.addEventListener('scroll', () => {
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

/* -------------------------
   Reveal logic (uses CSS var --revealOffset)
   and staggered project-card reveal
------------------------- */
const sections = document.querySelectorAll('.section');
const projectCards = document.querySelectorAll('.project-card');

function revealOnScroll() {
  const viewportH = window.innerHeight;
  // Sections
  sections.forEach((sec) => {
    const inner = sec.querySelector('.card-inner');
    const rect = sec.getBoundingClientRect();
    if (rect.top < viewportH - 120) {
      // set reveal offset to 0 to animate into place
      inner.style.setProperty('--revealOffset', '0px');
    }
  });

  // Project cards (staggered)
  projectCards.forEach((card, idx) => {
    const inner = card.querySelector('.card-inner');
    const rect = card.getBoundingClientRect();
    if (rect.top < viewportH - 80) {
      // set reveal offset to 0 (appearance)
      inner.style.setProperty('--revealOffset', '0px');
      // add a small transition delay so cards appear staggered
      inner.style.transitionDelay = `${idx * 0.08}s`;
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

/* -------------------------
   High-FPS parallax animation
   Updates only CSS variable --parallaxY per element
   so it composes with reveal offset (no transform overwrite)
------------------------- */
function animateParallax() {
  const scrollY = window.scrollY;
  // Sections parallax: deeper sections move slightly more
  sections.forEach((sec, index) => {
    const depthFactor = 0.02 + index * 0.005; // tiny factors
    const parallaxY = -Math.round(scrollY * depthFactor);
    const inner = sec.querySelector('.card-inner');
    if (inner) inner.style.setProperty('--parallaxY', `${parallaxY}px`);
  });

  // Project cards parallax: based on card's distance from center for nicer effect
  projectCards.forEach((card, idx) => {
    const inner = card.querySelector('.card-inner');
    const rect = card.getBoundingClientRect();
    const distFromCenter = (rect.top + rect.height / 2) - (window.innerHeight / 2);
    // smaller multiplier to keep movement subtle
    const parallax = Math.round(-distFromCenter * 0.03);
    if (inner) inner.style.setProperty('--parallaxY', `${parallax}px`);
  });

  requestAnimationFrame(animateParallax);
}
requestAnimationFrame(animateParallax);

/* -------------------------
   Typewriter (simple)
------------------------- */
function typeWriter(elementId, text, speed = 80) {
  const el = document.getElementById(elementId);
  if (!el) return;
  let i = 0;
  el.textContent = '';
  function typing() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}
window.addEventListener('load', () => {
  typeWriter('typewriter', "Hi, I'm Sahil Prasad", 80);
});

