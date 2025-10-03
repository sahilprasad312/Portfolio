// =======================
// STARFIELD BACKGROUND
// =======================
const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');

let stars = [];
let numStars = 150;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Star class
class Star {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.z = Math.random() * canvas.width;
  }
  update() {
    this.z -= 2; // speed
    if (this.z <= 0) {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.z = canvas.width;
    }
  }
  draw() {
    let sx = (this.x - canvas.width / 2) * (canvas.width / this.z) + canvas.width / 2;
    let sy = (this.y - canvas.height / 2) * (canvas.height / this.z) + canvas.height / 2;
    let r = canvas.width / this.z;
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }
}

// Create stars
for (let i = 0; i < numStars; i++) {
  stars.push(new Star());
}

function animateStars() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let star of stars) {
    star.update();
    star.draw();
  }
  requestAnimationFrame(animateStars);
}
animateStars();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

// =======================
// SCROLL REVEAL ANIMATION
// =======================
const sections = document.querySelectorAll('.section');

const reveal = () => {
  sections.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      sec.style.opacity = "1";
      sec.style.transform = "translateY(0)";
    }
  });
};

window.addEventListener('scroll', reveal);

sections.forEach(sec => {
  sec.style.opacity = "0";
  sec.style.transform = "translateY(50px)";
  sec.style.transition = "all 1s ease-out";
});

// =======================
// TYPEWRITER EFFECT
// =======================
function typeWriter(elementId, text, speed = 100) {
  let i = 0;
  function typing() {
    if (i < text.length) {
      document.getElementById(elementId).innerHTML += text.charAt(i);
      i++;
      setTimeout(typing, speed);
    }
  }
  typing();
}

// Run typewriter on home title
window.addEventListener("load", () => {
  const titleEl = document.getElementById("typewriter");
  if (titleEl) {
    typeWriter("typewriter", "Hi, I'm Sahil 🚀", 100);
  }
});
