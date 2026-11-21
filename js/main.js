/**
 * WILLTECH SYSTEMS — Institutional Portfolio Interactions
 * Pure Vanilla JavaScript (zero dependencies, GitHub Pages ready)
 */

(() => {
  'use strict';

  const WHATSAPP_NUMBER = '5563992026738';

  const buildWhatsAppUrl = (message) =>
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  /* ------------------------------------------------------------------------
     1. Navbar scroll state & Mobile Drawer
     ------------------------------------------------------------------------ */
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-menu__link, .mobile-menu__cta');

  const updateNavbarScroll = () => {
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 18);
  };

  window.addEventListener('scroll', updateNavbarScroll, { passive: true });
  updateNavbarScroll();

  const setMobileMenuState = (open) => {
    if (!navToggle || !mobileMenu) return;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Fechar menu de navegação' : 'Abrir menu de navegação');
    mobileMenu.classList.toggle('is-open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
  };

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      setMobileMenuState(!isOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => setMobileMenuState(false));
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 860 && mobileMenu.classList.contains('is-open')) {
        setMobileMenuState(false);
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. Active Section Highlighting in Navbar
     ------------------------------------------------------------------------ */
  const navLinks = document.querySelectorAll('.navbar__link[href^="#"]');
  const trackedSections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if (trackedSections.length > 0 && 'IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.getAttribute('id');
          navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === `#${id}`);
          });
        });
      },
      {
        rootMargin: '-35% 0px -55% 0px',
        threshold: 0,
      }
    );

    trackedSections.forEach((section) => sectionObserver.observe(section));
  }

  /* ------------------------------------------------------------------------
     3. Portfolio Filter Tabs
     ------------------------------------------------------------------------ */
  const filterButtons = document.querySelectorAll('.filter-tab[data-filter]');
  const projectCards = document.querySelectorAll('.project-card[data-category]');

  const applyPortfolioFilter = (category) => {
    filterButtons.forEach((btn) => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    projectCards.forEach((card) => {
      const matches = category === 'todos' || card.dataset.category === category;
      card.classList.toggle('is-hidden', !matches);
      if (matches) {
        card.classList.add('is-visible');
      }
    });
  };

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyPortfolioFilter(button.dataset.filter || 'todos');
    });
  });

  // Hero studio directory items that pre-filter portfolio if desired
  const quickFilterLinks = document.querySelectorAll('[data-jump-filter]');
  quickFilterLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const targetFilter = link.dataset.jumpFilter;
      if (targetFilter) {
        applyPortfolioFilter(targetFilter);
      }
    });
  });

  /* ------------------------------------------------------------------------
     4. Conceptual Mockup Lightbox Modal
     ------------------------------------------------------------------------ */
  const modal = document.getElementById('mockup-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalCta = document.getElementById('modal-cta');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalTriggers = document.querySelectorAll('[data-open-mockup]');

  let lastFocusedTrigger = null;

  const openModal = (trigger) => {
    if (!modal || !modalImg) return;
    lastFocusedTrigger = trigger;

    const src = trigger.dataset.mockupSrc || '';
    const alt = trigger.dataset.mockupAlt || '';
    const tag = trigger.dataset.mockupTag || 'PROJETO CONCEITUAL';
    const title = trigger.dataset.mockupTitle || '';
    const desc = trigger.dataset.mockupDesc || '';
    const waMessage =
      trigger.dataset.mockupWa ||
      'Olá! Vi o portfólio da WillTech Systems e gostaria de solicitar um orçamento.';

    modalImg.src = src;
    modalImg.alt = alt;
    if (modalTag) modalTag.textContent = tag;
    if (modalTitle) modalTitle.textContent = title;
    if (modalDesc) modalDesc.textContent = desc;
    if (modalCta) modalCta.href = buildWhatsAppUrl(waMessage);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (modalCloseBtn) modalCloseBtn.focus();
  };

  const closeModal = () => {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  };

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', () => openModal(trigger));
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      setMobileMenuState(false);
    }
  });

  /* ------------------------------------------------------------------------
     5. Subtle Scroll Reveal
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -30px 0px',
      }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }
})();
