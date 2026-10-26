// --- Nav: mobile toggle ---
const nav = document.getElementById('nav');
const toggle = document.getElementById('navToggle');
const links = document.getElementById('navLinks');
const progress = document.getElementById('navProgress');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.classList.toggle('open', open);
});
links.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    links.classList.remove('open');
    toggle.classList.remove('open');
  }
});

// --- Split section headings into words for staggered reveal ---
document.querySelectorAll('.section__head h2').forEach(h2 => {
  const words = h2.textContent.trim().split(/\s+/);
  h2.textContent = '';
  words.forEach((w, i) => {
    const span = document.createElement('span');
    span.className = 'word';
    span.style.setProperty('--wi', i);
    span.textContent = w;
    h2.appendChild(span);
    if (i < words.length - 1) h2.appendChild(document.createTextNode(' '));
  });
});

// --- Scroll-linked effects: nav, progress, hero depth, ridge parallax ---
const heroInner = document.querySelector('[data-hero]');
const heroGlow = document.querySelector('.hero__glow');
const parallaxEls = [...document.querySelectorAll('[data-parallax]')];

let ticking = false;
const onScroll = () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 20);

    const docH = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.setProperty('--p', docH > 0 ? (y / docH).toFixed(4) : 0);

    if (!reduceMotion) {
      if (heroInner) {
        const p = Math.min(y / 650, 1);
        heroInner.style.transform = `translateY(${y * 0.22}px) scale(${1 - p * 0.09})`;
        heroInner.style.opacity = String(1 - p * 1.1);
      }
      if (heroGlow) heroGlow.style.transform = `translateX(-50%) translateY(${y * 0.18}px) scale(${1 + y / 2500})`;
      for (const el of parallaxEls) {
        const speed = parseFloat(el.dataset.parallax);
        el.style.transform = `translateY(${y * speed}px)`;
      }
    }
    ticking = false;
  });
};
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

// --- Reveal on scroll: section pieces + staggered grid children + headings ---
document.querySelectorAll('.section__head, .prose, .note, .stats').forEach(el => el.classList.add('reveal'));

document.querySelectorAll('.jobgrid, .cols, .cmdgrid, .chips').forEach(grid => {
  [...grid.children].forEach((child, i) => {
    child.classList.add('reveal');
    child.style.setProperty('--i', (i % 8) + 1);
  });
});

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal, .section__head h2').forEach(el => io.observe(el));

// --- Cursor-tracking glow on cards ---
if (!reduceMotion && window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.card, .cmd, .job').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    });
  });
}

// --- Animated stat counters ---
const countIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; countIO.unobserve(el); return; }
    const duration = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat__num').forEach(n => countIO.observe(n));
