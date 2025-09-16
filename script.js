/* script.js
   - Particle field
   - Mobile menu interactions
   - Simple scroll reveal for sections
   - Small UI helpers
*/

// ---------- utility ----------
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

/* ---------- particles canvas ---------- */
(() => {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let width = canvas.width = innerWidth;
  let height = canvas.height = innerHeight;
  const DPR = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = width * DPR;
  canvas.height = height * DPR;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
  ctx.scale(DPR, DPR);

  let particles = [];
  const OPTIONS = {
    count: Math.round((width * height) / 60000 * 35) || 50,
    maxVel: 0.6,
    sizeMin: 0.6,
    sizeMax: 2.4,
    hueA: 320, // pinkish
    hueB: 330
  };

  function rand(min, max){ return Math.random()*(max-min)+min }

  function create(){
    particles = new Array(OPTIONS.count).fill(0).map(_ => ({
      x: Math.random()*width,
      y: Math.random()*height,
      vx: rand(-OPTIONS.maxVel, OPTIONS.maxVel),
      vy: rand(-OPTIONS.maxVel, OPTIONS.maxVel),
      r: rand(OPTIONS.sizeMin, OPTIONS.sizeMax),
      alpha: rand(0.08, 0.35),
      hue: rand(OPTIONS.hueA, OPTIONS.hueB)
    }));
  }

  function onResize(){
    width = canvas.width = innerWidth;
    height = canvas.height = innerHeight;
    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    create();
  }

  function draw(){
    ctx.clearRect(0,0,width,height);
    for(const p of particles){
      p.x += p.vx;
      p.y += p.vy;

      if(p.x < -10) p.x = width + 10;
      if(p.x > width + 10) p.x = -10;
      if(p.y < -10) p.y = height + 10;
      if(p.y > height + 10) p.y = -10;

      ctx.beginPath();
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      g.addColorStop(0, `hsla(${p.hue},100%,60%, ${p.alpha})`);
      g.addColorStop(0.5, `hsla(${p.hue},90%,48%, ${p.alpha*0.18})`);
      g.addColorStop(1, `rgba(0,0,0,0)`);
      ctx.fillStyle = g;
      ctx.arc(p.x, p.y, p.r*6, 0, Math.PI*2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._pt);
    window._pt = setTimeout(onResize, 120);
  });

  create();
  draw();
})();

/* ---------- mobile menu ---------- */
(() => {
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const closeBtn = document.getElementById('closeMobile');
  const focusable = 'a,button,input,textarea,[tabindex]:not([tabindex="-1"])';

  function openMenu(){
    menuBtn.setAttribute('aria-expanded','true');
    mobileMenu.setAttribute('aria-hidden','false');
    mobileMenu.style.display = 'flex';
    // trap focus on first focusable element
    const first = mobileMenu.querySelector(focusable);
    if(first) first.focus();
    document.body.style.overflow = 'hidden';
  }
  function closeMenu(){
    menuBtn.setAttribute('aria-expanded','false');
    mobileMenu.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    menuBtn.focus();
    // allow animation to finish then hide to avoid accessible reveal
    setTimeout(()=> mobileMenu.style.display = 'none', 320);
  }

  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    if(expanded) closeMenu(); else openMenu();
  });
  closeBtn.addEventListener('click', closeMenu);

  // close when user clicks a link inside mobile menu
  mobileMenu.addEventListener('click', (e) => {
    if(e.target.matches('.mobile-link')) closeMenu();
  });

  // close on escape
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && mobileMenu.getAttribute('aria-hidden') === 'false'){
      closeMenu();
    }
  });
})();

/* ---------- Simple intersection reveal for sections ---------- */
(() => {
  const items = $$('section, .service-card, .project, .testimonial');
  const io = new IntersectionObserver(entries => {
    for(const ent of entries){
      if(ent.isIntersecting){
        ent.target.classList.add('in-view');
        io.unobserve(ent.target);
      }
    }
  }, {threshold:0.12});

  items.forEach(i => io.observe(i));
})();

/* ---------- small UX helpers ---------- */
(() => {
  // year in footer
  const year = document.getElementById('year');
  if(year) year.textContent = new Date().getFullYear();

  // nav active highlight on scroll
  const navLinks = $$('.nav-link');
  const sections = navLinks.map(a => document.querySelector(a.getAttribute('href')));
  window.addEventListener('scroll', () => {
    const mid = innerHeight/3 + pageYOffset;
    let current = sections.findIndex(s => s && s.offsetTop <= mid);
    navLinks.forEach(l => l.classList.remove('active'));
    if(current >= 0 && navLinks[current]) navLinks[current].classList.add('active');
  });

  // Form stub - show a small confirmation (no backend)
  const form = document.querySelector('.contact-form');
  if(form){
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Send message';
        alert('Thanks! Your message was prepared (this demo has no backend). I will email you back.');
        form.reset();
      }, 900);
    });
  }
})();
