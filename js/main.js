/* ==========
   MAIN JAVASCRIPT - Rahul Kumar Ram Portfolio
   ========== */

'use strict';

// ========== DOM Ready ==========
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initThemeToggle();
  initNetworkCanvas();
  initScrollReveal();
  initCounterAnimation();
  initMetricRings();
  initProjectFilter();
  initContactForm();
  initHamburger();
  initActiveNavLink();
  initLightbox();
});

// ========== 1. NAVBAR SCROLL BEHAVIOUR ==========
function initNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  }, { passive: true });
}

// ========== 2. ACTIVE NAV LINK ON SCROLL ==========
function initActiveNavLink() {
  const navbar   = document.getElementById('navbar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));

  // Build an list of { id, el, link }
  const navSections = navLinks
    .map(link => {
      const id  = (link.getAttribute('href') || '').replace('#', '');
      const el  = id ? document.getElementById(id) : null;
      return el ? { id, el, link } : null;
    })
    .filter(Boolean);

  let isScrollingFromClick = false;
  let scrollTimeout = null;

  // Helper to set active link
  function setActiveLink(activeId) {
    navLinks.forEach(link => {
      const id = (link.getAttribute('href') || '').replace('#', '');
      if (id === activeId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  // Unified smooth scroll helper
  function smoothScrollTo(targetEl, callback) {
    const navH = navbar ? navbar.offsetHeight : 72;
    const top = targetEl.getBoundingClientRect().top + window.scrollY - navH - 4;

    isScrollingFromClick = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);

    window.scrollTo({
      top: Math.max(0, top),
      behavior: 'smooth'
    });

    const handleScrollEnd = () => {
      isScrollingFromClick = false;
      window.removeEventListener('scrollend', handleScrollEnd);
      if (callback) callback();
    };

    if ('onscrollend' in window) {
      window.addEventListener('scrollend', handleScrollEnd);
      scrollTimeout = setTimeout(() => {
        isScrollingFromClick = false;
        window.removeEventListener('scrollend', handleScrollEnd);
      }, 1200);
    } else {
      scrollTimeout = setTimeout(() => {
        isScrollingFromClick = false;
        if (callback) callback();
      }, 1000);
    }
  }

  // Attach click listener to nav links
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      const id = (link.getAttribute('href') || '').replace('#', '');
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      e.preventDefault();

      // Close mobile menu if open
      const navLinksEl = document.getElementById('navLinks');
      if (navLinksEl) navLinksEl.classList.remove('open');

      // Set active state immediately for instant feedback
      setActiveLink(id);

      smoothScrollTo(target);
    });
  });

  // Keep track of sections intersecting the viewport
  const visibleSections = new Map();

  const observerOptions = {
    root: null,
    rootMargin: `-72px 0px -20% 0px`, // Account for sticky navbar height (approx 72px)
    threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        visibleSections.set(entry.target.id, entry);
      } else {
        visibleSections.delete(entry.target.id);
      }
    });

    // Ignore active state updates while performing smooth scroll from click
    if (isScrollingFromClick) return;

    updateActiveSection();
  }, observerOptions);

  navSections.forEach(section => observer.observe(section.el));

  function updateActiveSection() {
    // 1. Check if we're at the very bottom of the page
    const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
    if (isAtBottom && document.getElementById('contact')) {
      setActiveLink('contact');
      return;
    }

    // 2. Check if we're at the very top of the page
    if (window.scrollY < 50 && document.getElementById('home')) {
      setActiveLink('home');
      return;
    }

    if (visibleSections.size === 0) return;

    const navH = navbar ? navbar.offsetHeight : 72;
    let bestSectionId = null;
    let maxVisibleHeight = -1;

    visibleSections.forEach((entry, id) => {
      const rect = entry.target.getBoundingClientRect();
      
      // Calculate height of section visible in viewport below the sticky navbar
      const visibleTop = Math.max(navH, rect.top);
      const visibleBottom = Math.min(window.innerHeight, rect.bottom);
      const visibleHeight = visibleBottom - visibleTop;

      if (visibleHeight > maxVisibleHeight) {
        maxVisibleHeight = visibleHeight;
        bestSectionId = id;
      }
    });

    if (bestSectionId) {
      setActiveLink(bestSectionId);
    }
  }

  // Fallback scroll/resize listeners to ensure state stays correct
  window.addEventListener('scroll', () => {
    if (!isScrollingFromClick) {
      updateActiveSection();
    }
  }, { passive: true });

  let resizeDebounce;
  window.addEventListener('resize', () => {
    clearTimeout(resizeDebounce);
    resizeDebounce = setTimeout(updateActiveSection, 150);
  }, { passive: true });

  // Expose smoothScrollTo for other internal page anchors
  window.portfolioSmoothScroll = smoothScrollTo;

  // Set initial active section on load
  updateActiveSection();
}


// ========== 3. THEME TOGGLE ==========
function initThemeToggle() {
  const toggleBtn = document.getElementById('themeToggle');
  const body = document.body;

  // Load saved theme
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  body.setAttribute('data-theme', savedTheme);

  toggleBtn.addEventListener('click', () => {
    const current = body.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', next);
    localStorage.setItem('portfolio-theme', next);
  });
}

// ========== 4. HAMBURGER MENU ==========
function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const isOpen = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', isOpen);
  });

  // Close on link click
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape key for accessibility
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
}

// ========== 5. NETWORK CANVAS ANIMATION ==========
function initNetworkCanvas() {
  const canvas = document.getElementById('networkCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;
  let nodes = [];
  let width, height;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createNodes(count) {
    nodes = [];
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    const maxDist = 130;
    const isDark = document.body.getAttribute('data-theme') !== 'light';
    const nodeColor = isDark ? '0, 230, 118' : '0, 150, 80';
    const lineColor = isDark ? '0, 188, 212' : '0, 120, 160';

    // Update positions
    nodes.forEach(node => {
      node.x += node.vx;
      node.y += node.vy;

      if (node.x < 0 || node.x > width) node.vx *= -1;
      if (node.y < 0 || node.y > height) node.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.25;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(${lineColor}, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${nodeColor}, ${node.opacity})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(draw);
  }

  function init() {
    resize();
    createNodes(60);
    draw();
  }

  let canvasResizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(canvasResizeTimer);
    canvasResizeTimer = setTimeout(() => {
      resize();
      createNodes(60);
    }, 150);
  }, { passive: true });

  // Pause animation when tab hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
      animationId = null;
    } else if (!animationId) {
      draw();
    }
  });

  init();

  // Pause canvas RAF when hero section is not in viewport
  const heroSection = document.getElementById('home');
  if (heroSection) {
    const canvasObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animationId) draw();
        } else {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      });
    }, { threshold: 0 });
    canvasObserver.observe(heroSection);
  }
}

// ========== 6. SCROLL REVEAL ANIMATION ==========
function initScrollReveal() {
  const elements = document.querySelectorAll(
    '.fade-in-up, .fade-in-left, .fade-in-right, .headline-line'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));

  // Also trigger hero elements immediately (they're above the fold)
  document.querySelectorAll('.hero .fade-in-up, .hero .fade-in-right, .hero .headline-line').forEach(el => {
    setTimeout(() => el.classList.add('visible'), 100);
  });
}

// ========== 7. COUNTER ANIMATION ==========
function initCounterAnimation() {
  const counters = document.querySelectorAll('.metric-number[data-target]');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const suffix = element.getAttribute('data-suffix') || '';
  const duration = 2000;
  const startTime = performance.now();
  const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easeOutQuart(progress);
    const current = Math.floor(easedProgress * target);

    element.textContent = current + suffix;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = target + suffix;
    }
  }

  requestAnimationFrame(update);
}

// ========== 8. METRIC RING ANIMATION ==========
function initMetricRings() {
  const rings = document.querySelectorAll('.ring-fill[data-percent]');
  const circumference = 2 * Math.PI * 50; // radius = 50

  rings.forEach(ring => {
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ring = entry.target;
        const percent = parseInt(ring.getAttribute('data-percent'));
        const offset = circumference - (percent / 100) * circumference;

        requestAnimationFrame(() => {
          ring.style.strokeDashoffset = offset;
        });

        observer.unobserve(ring);
      }
    });
  }, { threshold: 0.5 });

  rings.forEach(ring => observer.observe(ring));
}

// ========== 9. PROJECT FILTER ==========
function initProjectFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        if (filter === 'all') {
          card.classList.remove('hidden');
          card.style.opacity = '1';
          card.style.transform = '';
        } else {
          const categories = card.getAttribute('data-category') || '';
          if (categories.includes(filter)) {
            card.classList.remove('hidden');
            card.style.opacity = '1';
          } else {
            card.classList.add('hidden');
          }
        }
      });
    });
  });
}

// ========== 10. CONTACT FORM ==========
function initContactForm() {
  const form = document.getElementById('contactForm');
  const successMsg = document.getElementById('formSuccess');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const name = document.getElementById('formName').value.trim();
    const email = document.getElementById('formEmail').value.trim();
    const subject = document.getElementById('formSubject').value.trim();
    const message = document.getElementById('formMessage').value.trim();

    if (!name || !email || !subject || !message) {
      shakeForm(form);
      return;
    }

    if (!isValidEmail(email)) {
      document.getElementById('formEmail').focus();
      shakeForm(document.getElementById('formEmail'));
      return;
    }

    // Show sending state
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
        <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="40"/>
      </svg>
      Sending...
    `;

    try {
      const response = await fetch('https://formspree.io/f/xlgkjoor', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      if (response.ok) {
        form.reset();
        successMsg.classList.add('visible');
        setTimeout(() => successMsg.classList.remove('visible'), 5000);
      } else {
        alert('Something went wrong. Please try again or email me directly.');
      }
    } catch (err) {
      alert('Could not send message. Please check your connection and try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
        Send Message
      `;
    }
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function shakeForm(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => {
    el.style.animation = '';
  }, { once: true });
}

// Add shake keyframe dynamically
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-5px); }
    80% { transform: translateX(5px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .spinner {
    animation: spin 1s linear infinite;
  }
`;
document.head.appendChild(shakeStyle);

// ========== 11. SMOOTH SCROLL FOR OTHER ANCHORS ==========
document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(anchor => {
  if (anchor.getAttribute('href') === '#') return;
  
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    try {
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        if (typeof window.portfolioSmoothScroll === 'function') {
          window.portfolioSmoothScroll(target);
        } else {
          const navbar = document.getElementById('navbar');
          const navH = navbar ? navbar.offsetHeight : 72;
          const top = target.getBoundingClientRect().top + window.scrollY - navH - 4;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        }
      }
    } catch (err) {
      // Ignore invalid selectors
    }
  });
});

// ========== 12. CURSOR GLOW EFFECT ==========
(function initCursorGlow() {
  // Only on desktop (no touch)
  if (window.matchMedia('(hover: none)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(0, 230, 118, 0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    z-index: 9999;
    transition: transform 0.1s ease;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  let mouseX = 0, mouseY = 0;
  let glowX = 0, glowY = 0;
  let rafId;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function updateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = `${glowX}px`;
    glow.style.top = `${glowY}px`;
    rafId = requestAnimationFrame(updateGlow);
  }

  updateGlow();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else {
      updateGlow();
    }
  });
})();

// ========== 13. INTERSECTION OBSERVER FOR METRIC CARDS ==========
(function initMetricCardHighlight() {
  const cards = document.querySelectorAll('.metric-card');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => observer.observe(c));
})();

// ========== 14. LIGHTBOX MODAL SYSTEM ==========
function initLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalCaption = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxClose');
  const prevBtn = document.getElementById('lightboxPrev');
  const nextBtn = document.getElementById('lightboxNext');
  
  if (!modal || !modalImg) return;
  
  const triggers = Array.from(document.querySelectorAll('.lightbox-trigger'));
  let currentIndex = -1;
  let lastFocused = null;
  
  function openLightbox(index) {
    if (index < 0 || index >= triggers.length) return;
    currentIndex = index;
    lastFocused = document.activeElement;
    
    const trigger = triggers[index];
    const imgSrc = trigger.getAttribute('data-image') || trigger.querySelector('img').src;
    const imgAlt = trigger.querySelector('img') ? trigger.querySelector('img').getAttribute('alt') : '';
    const imgCaption = trigger.getAttribute('data-caption') || '';
    
    modalImg.src = imgSrc;
    modalImg.alt = imgAlt;
    if (modalCaption) {
      modalCaption.textContent = imgCaption;
    }

    const counter = document.getElementById('lightboxCounter');
    if (counter) {
      counter.textContent = (index + 1) + ' / ' + triggers.length;
    }
    
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Move focus into modal
    requestAnimationFrame(() => {
      if (closeBtn) closeBtn.focus();
    });
  }
  
  function closeLightbox() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Restore focus to the element that opened the lightbox
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
      lastFocused = null;
    }
    setTimeout(() => {
      modalImg.src = '';
      modalImg.alt = '';
      if (modalCaption) {
        modalCaption.textContent = '';
      }
    }, 300);
  }
  
  function showNext() {
    if (triggers.length <= 1) return;
    let nextIndex = currentIndex + 1;
    if (nextIndex >= triggers.length) nextIndex = 0;
    openLightbox(nextIndex);
  }
  
  function showPrev() {
    if (triggers.length <= 1) return;
    let prevIndex = currentIndex - 1;
    if (prevIndex < 0) prevIndex = triggers.length - 1;
    openLightbox(prevIndex);
  }
  
  // Click + keyboard support for lightbox triggers
  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(index);
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
      }
    });
  });
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeLightbox);
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', (e) => { e.stopPropagation(); showNext(); });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', (e) => { e.stopPropagation(); showPrev(); });
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('lightbox-content')) {
      closeLightbox();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('active')) return;
    
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeLightbox();
    } else if (e.key === 'ArrowRight' || e.key === 'Right') {
      if (nextBtn) showNext();
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
      if (prevBtn) showPrev();
    } else if (e.key === 'Tab') {
      // Focus trap: keep Tab navigation inside the modal
      const focusable = Array.from(
        modal.querySelectorAll('button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])')
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });
}
