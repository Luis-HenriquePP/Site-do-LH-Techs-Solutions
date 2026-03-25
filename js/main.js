/**
 * LH Techs Solutions — JavaScript Principal
 * Vanilla JS | Performático | Acessível
 */

'use strict';

// ─── Utilitários ─────────────────────────────────────────────────────────────

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 200) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// ─── Ano atual no footer ──────────────────────────────────────────────────────

const yearEl = $('#currentYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ─── Header: efeito ao scroll ─────────────────────────────────────────────────

const header = $('#header');

function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 20);
}

window.addEventListener('scroll', debounce(updateHeader, 10), { passive: true });
updateHeader();

// ─── Menu hambúrguer ──────────────────────────────────────────────────────────

const hamburger  = $('#hamburger');
const nav        = $('#nav');
const navOverlay = $('#navOverlay');

function openMenu() {
  hamburger.classList.add('open');
  nav.classList.add('open');
  navOverlay.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
  navOverlay.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', closeMenu);
}

// Fechar menu ao clicar em um link
$$('.nav__link').forEach(link => {
  link.addEventListener('click', closeMenu);
});

// Fechar menu com Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMenu();
});

// ─── Active nav link ao scroll ────────────────────────────────────────────────

const sections = $$('section[id]');
const navLinks  = $$('.nav__link[data-section]');

function updateActiveLink() {
  const scrollY = window.scrollY + 100;

  sections.forEach(section => {
    const top    = section.offsetTop;
    const height = section.offsetHeight;
    const id     = section.getAttribute('id');

    if (scrollY >= top && scrollY < top + height) {
      navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.section === id);
      });
    }
  });
}

window.addEventListener('scroll', debounce(updateActiveLink, 50), { passive: true });
updateActiveLink();

// ─── Reveal on scroll (Intersection Observer) ────────────────────────────────

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
);

$$('.reveal').forEach(el => revealObserver.observe(el));

// ─── Contador animado (hero stats) ───────────────────────────────────────────

function animateCounter(el, target, duration = 1800) {
  let start     = 0;
  const step    = target / (duration / 16);
  const counter = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(counter);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

const statsObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        $$('[data-target]', entry.target.closest('.hero__stats') || document).forEach(el => {
          animateCounter(el, parseInt(el.dataset.target));
        });
        statsObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

const heroStats = $('.hero__stats');
if (heroStats) statsObserver.observe(heroStats);

// ─── Partículas no Hero ───────────────────────────────────────────────────────

(function initParticles() {
  const canvas = $('#particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animId;

  const COLORS = ['rgba(10,132,255,', 'rgba(0,229,255,', 'rgba(123,97,255,'];

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  function createParticle() {
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 2 + 0.5,
      dx:   (Math.random() - 0.5) * 0.4,
      dy:   (Math.random() - 0.5) * 0.4,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  function init() {
    resize();
    const count = Math.min(80, Math.floor((canvas.width * canvas.height) / 12000));
    particles = Array.from({ length: count }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    // Linhas de conexão
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(10,132,255,${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animId = requestAnimationFrame(draw);
  }

  // Reduzir animação se preferência de movimento reduzido
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  init();
  draw();

  window.addEventListener('resize', debounce(() => {
    cancelAnimationFrame(animId);
    init();
    draw();
  }, 300));
})();

// ─── Carregar serviços via API ────────────────────────────────────────────────

async function loadServices() {
  const grid  = $('#servicesGrid');
  const error = $('#servicesError');
  if (!grid) return;

  // Mostrar skeletons
  grid.innerHTML = Array(4).fill(
    '<div class="service-skeleton" aria-hidden="true"></div>'
  ).join('');
  if (error) error.hidden = true;

  try {
    const res  = await fetch('/services');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !json.data?.length) {
      throw new Error('Nenhum serviço encontrado.');
    }

    grid.innerHTML = '';

    json.data.forEach((service, i) => {
      const card = document.createElement('article');
      card.className = 'service-card';
      card.setAttribute('role', 'listitem');
      card.style.animationDelay = `${i * 0.08}s`;

      card.innerHTML = `
        <div class="service-card__icon" aria-hidden="true">
          <i class="${escapeHtml(service.icon || 'fas fa-tools')}"></i>
        </div>
        <h3 class="service-card__name">${escapeHtml(service.name)}</h3>
        <p class="service-card__desc">${escapeHtml(service.description)}</p>
        <div class="service-card__footer">
          <span class="service-card__price">${escapeHtml(service.price_formatted)}</span>
          <a href="https://wa.me/5500000000000?text=Olá!%20Tenho%20interesse%20no%20serviço:%20${encodeURIComponent(service.name)}"
             class="service-card__cta"
             target="_blank"
             rel="noopener noreferrer"
             aria-label="Solicitar ${escapeHtml(service.name)} pelo WhatsApp">
            Solicitar <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </a>
        </div>
      `;

      grid.appendChild(card);

      // Observar para animação de entrada
      revealObserver.observe(card);
    });

  } catch (err) {
    console.error('Erro ao carregar serviços:', err);
    grid.innerHTML = '';
    if (error) error.hidden = false;
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

// Carregar serviços ao iniciar
loadServices();

// ─── Formulário de contato ────────────────────────────────────────────────────

(function initContactForm() {
  const form       = $('#contactForm');
  if (!form) return;

  const nameInput  = $('#name');
  const phoneInput = $('#phone');
  const msgInput   = $('#message');
  const submitBtn  = $('#submitBtn');
  const successEl  = $('#formSuccess');
  const errorEl    = $('#formError');
  const errorMsg   = $('#formErrorMsg');
  const charCount  = $('#message-count');

  // Máscara de telefone
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      let v = phoneInput.value.replace(/\D/g, '');
      if (v.length > 11) v = v.slice(0, 11);

      if (v.length <= 10) {
        v = v.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
      } else {
        v = v.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
      }

      phoneInput.value = v.replace(/-$/, '');
    });
  }

  // Contador de caracteres
  if (msgInput && charCount) {
    msgInput.addEventListener('input', () => {
      charCount.textContent = `${msgInput.value.length} / 1000`;
    });
  }

  // Validação em tempo real
  function validateField(input, errorId, validatorFn) {
    const errEl = $(`#${errorId}`);
    const msg   = validatorFn(input.value);

    if (msg) {
      input.classList.add('error');
      input.classList.remove('success');
      if (errEl) errEl.textContent = msg;
      return false;
    } else {
      input.classList.remove('error');
      if (input.value.trim()) input.classList.add('success');
      if (errEl) errEl.textContent = '';
      return true;
    }
  }

  function validateName(v) {
    if (!v.trim()) return 'Nome é obrigatório.';
    if (v.trim().length < 2) return 'Nome deve ter pelo menos 2 caracteres.';
    return '';
  }

  function validatePhone(v) {
    if (!v.trim()) return 'Telefone é obrigatório.';
    const digits = v.replace(/\D/g, '');
    if (digits.length < 8) return 'Telefone inválido.';
    return '';
  }

  if (nameInput)  nameInput.addEventListener('blur',  () => validateField(nameInput,  'name-error',  validateName));
  if (phoneInput) phoneInput.addEventListener('blur', () => validateField(phoneInput, 'phone-error', validatePhone));

  // Envio do formulário
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameOk  = validateField(nameInput,  'name-error',  validateName);
    const phoneOk = validateField(phoneInput, 'phone-error', validatePhone);

    if (!nameOk || !phoneOk) return;

    // Estado de carregamento
    const btnText    = submitBtn.querySelector('.btn__text');
    const btnLoading = submitBtn.querySelector('.btn__loading');

    submitBtn.disabled = true;
    if (btnText)    btnText.hidden    = true;
    if (btnLoading) btnLoading.hidden = false;
    if (successEl)  successEl.hidden  = true;
    if (errorEl)    errorEl.hidden    = true;

    try {
      const payload = {
        name:    nameInput.value.trim(),
        phone:   phoneInput.value.trim(),
        message: msgInput ? msgInput.value.trim() : '',
      };

      const res  = await fetch('/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      const json = await res.json();

      if (json.success) {
        if (successEl) successEl.hidden = false;
        form.reset();
        if (charCount) charCount.textContent = '0 / 1000';
        $$('.form__input', form).forEach(i => i.classList.remove('success', 'error'));

        // Scroll suave até o feedback
        successEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      } else {
        // Erros de campo vindos do backend
        if (json.errors) {
          Object.entries(json.errors).forEach(([field, msg]) => {
            const input = form.querySelector(`[name="${field}"]`);
            const errEl = $(`#${field}-error`);
            if (input) { input.classList.add('error'); input.classList.remove('success'); }
            if (errEl) errEl.textContent = msg;
          });
        } else {
          if (errorMsg) errorMsg.textContent = json.error || 'Erro ao enviar. Tente novamente.';
          if (errorEl)  errorEl.hidden = false;
        }
      }

    } catch (err) {
      console.error('Erro no envio:', err);
      if (errorMsg) errorMsg.textContent = 'Erro de conexão. Verifique sua internet e tente novamente.';
      if (errorEl)  errorEl.hidden = false;
    } finally {
      submitBtn.disabled = false;
      if (btnText)    btnText.hidden    = false;
      if (btnLoading) btnLoading.hidden = true;
    }
  });
})();

// ─── Smooth scroll para âncoras ───────────────────────────────────────────────

$$('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = $(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ─── Lazy loading de imagens ──────────────────────────────────────────────────

if ('IntersectionObserver' in window) {
  const lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
        lazyObserver.unobserve(img);
      }
    });
  });

  $$('img[data-src]').forEach(img => lazyObserver.observe(img));
}

console.log('%c LH Techs Solutions ', 'background:#0A84FF;color:#fff;font-weight:bold;padding:4px 8px;border-radius:4px;');
