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
     4. Portfolio Conceptual Carousels (3 exemplos por card) + Synced Lightbox
     ------------------------------------------------------------------------ */
  const modal = document.getElementById('mockup-modal');
  const modalImg = document.getElementById('modal-img');
  const modalTag = document.getElementById('modal-tag');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalCta = document.getElementById('modal-cta');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalPrevBtn = document.getElementById('modal-prev');
  const modalNextBtn = document.getElementById('modal-next');
  const modalSlidePills = document.getElementById('modal-slide-pills');

  const carouselRegistry = new Map();
  let activeModalCarouselId = null;
  let activeModalSlideIndex = 0;
  let lastFocusedTrigger = null;

  const formatTwoDigits = (n) => String(n).padStart(2, '0');

  const renderModalSlide = () => {
    if (!activeModalCarouselId || !carouselRegistry.has(activeModalCarouselId)) return;
    const state = carouselRegistry.get(activeModalCarouselId);
    const slides = state.slides;
    const idx = ((activeModalSlideIndex % slides.length) + slides.length) % slides.length;
    activeModalSlideIndex = idx;

    const slide = slides[idx];
    if (modalImg) {
      modalImg.src = slide.src;
      modalImg.alt = slide.alt;
    }
    if (modalTag) {
      modalTag.textContent = `${slide.tag} · ${formatTwoDigits(idx + 1)}/${formatTwoDigits(slides.length)}`;
    }
    if (modalTitle) modalTitle.textContent = slide.title;
    if (modalDesc) modalDesc.textContent = slide.desc;
    if (modalCta) modalCta.href = buildWhatsAppUrl(slide.wa);

    const hasMultiple = slides.length > 1;
    if (modalPrevBtn) modalPrevBtn.hidden = !hasMultiple;
    if (modalNextBtn) modalNextBtn.hidden = !hasMultiple;

    if (modalSlidePills) {
      modalSlidePills.innerHTML = '';
      if (hasMultiple) {
        slides.forEach((s, i) => {
          const pill = document.createElement('button');
          pill.type = 'button';
          pill.className = `modal__slide-pill${i === idx ? ' is-active' : ''}`;
          pill.textContent = `${formatTwoDigits(i + 1)} · ${s.label}`;
          pill.addEventListener('click', () => {
            activeModalSlideIndex = i;
            state.goTo(i);
            renderModalSlide();
          });
          modalSlidePills.appendChild(pill);
        });
      }
    }
  };

  const openCarouselModal = (carouselId, triggerEl) => {
    if (!modal || !carouselRegistry.has(carouselId)) return;
    const state = carouselRegistry.get(carouselId);
    lastFocusedTrigger = triggerEl || null;
    activeModalCarouselId = carouselId;
    activeModalSlideIndex = state.index;

    renderModalSlide();
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
    activeModalCarouselId = null;
    if (lastFocusedTrigger) {
      lastFocusedTrigger.focus();
      lastFocusedTrigger = null;
    }
  };

  if (modalPrevBtn) {
    modalPrevBtn.addEventListener('click', () => {
      if (!activeModalCarouselId) return;
      const state = carouselRegistry.get(activeModalCarouselId);
      activeModalSlideIndex = (activeModalSlideIndex - 1 + state.slides.length) % state.slides.length;
      state.goTo(activeModalSlideIndex);
      renderModalSlide();
    });
  }

  if (modalNextBtn) {
    modalNextBtn.addEventListener('click', () => {
      if (!activeModalCarouselId) return;
      const state = carouselRegistry.get(activeModalCarouselId);
      activeModalSlideIndex = (activeModalSlideIndex + 1) % state.slides.length;
      state.goTo(activeModalSlideIndex);
      renderModalSlide();
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

  // Initialize every [data-carousel] card
  document.querySelectorAll('[data-carousel]').forEach((carouselEl) => {
    const carouselId = carouselEl.dataset.carousel;
    const track = carouselEl.querySelector('.carousel__track');
    const slideEls = Array.from(carouselEl.querySelectorAll('.carousel__slide'));
    const prevBtn = carouselEl.querySelector('.carousel__btn--prev');
    const nextBtn = carouselEl.querySelector('.carousel__btn--next');
    const dots = Array.from(carouselEl.querySelectorAll('.carousel__dot'));
    const counterEl = carouselEl.querySelector('.carousel__counter');
    const labelEl = carouselEl.querySelector('.carousel__label');

    if (!carouselId || !track || slideEls.length === 0) return;

    const slides = slideEls.map((el) => {
      const img = el.querySelector('img');
      return {
        src: img ? img.getAttribute('src') : '',
        alt: img ? img.getAttribute('alt') : '',
        label: el.dataset.slideLabel || '',
        tag: el.dataset.slideTag || 'PROJETO CONCEITUAL',
        title: el.dataset.slideTitle || '',
        desc: el.dataset.slideDesc || '',
        wa:
          el.dataset.slideWa ||
          'Olá! Vi o portfólio da WillTech Systems e gostaria de solicitar um orçamento.',
      };
    });

    const state = {
      index: 0,
      slides,
      goTo(nextIdx) {
        const idx = ((nextIdx % slides.length) + slides.length) % slides.length;
        state.index = idx;
        track.style.transform = `translateX(-${idx * 100}%)`;

        dots.forEach((dot, i) => {
          const isActive = i === idx;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-selected', String(isActive));
        });

        if (counterEl) {
          counterEl.textContent = `${formatTwoDigits(idx + 1)}/${formatTwoDigits(slides.length)}`;
        }
        if (labelEl) {
          labelEl.textContent = slides[idx].label;
        }
      },
    };

    carouselRegistry.set(carouselId, state);
    state.goTo(0);

    if (prevBtn) {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.goTo(state.index - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        state.goTo(state.index + 1);
      });
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        state.goTo(i);
      });
    });

    // Clicking the slide image opens the lightbox modal at the current slide
    slideEls.forEach((slideEl) => {
      slideEl.addEventListener('click', () => openCarouselModal(carouselId, slideEl));
    });

    // Mobile touch swipe support
    let touchStartX = 0;
    let touchEndX = 0;

    carouselEl.addEventListener(
      'touchstart',
      (e) => {
        touchStartX = e.changedTouches[0].clientX;
      },
      { passive: true }
    );

    carouselEl.addEventListener(
      'touchend',
      (e) => {
        touchEndX = e.changedTouches[0].clientX;
        const delta = touchStartX - touchEndX;
        if (Math.abs(delta) > 38) {
          state.goTo(delta > 0 ? state.index + 1 : state.index - 1);
        }
      },
      { passive: true }
    );
  });

  // "Ampliar Mockup" buttons open their card's carousel modal at the active slide
  document.querySelectorAll('[data-open-carousel]').forEach((btn) => {
    btn.addEventListener('click', () => {
      openCarouselModal(btn.dataset.openCarousel, btn);
    });
  });

  // Keyboard navigation (Escape closes modal/menu; Left/Right arrows switch modal slides)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
      setMobileMenuState(false);
    } else if (modal && modal.classList.contains('is-open') && activeModalCarouselId) {
      const state = carouselRegistry.get(activeModalCarouselId);
      if (event.key === 'ArrowRight') {
        activeModalSlideIndex = (activeModalSlideIndex + 1) % state.slides.length;
        state.goTo(activeModalSlideIndex);
        renderModalSlide();
      } else if (event.key === 'ArrowLeft') {
        activeModalSlideIndex = (activeModalSlideIndex - 1 + state.slides.length) % state.slides.length;
        state.goTo(activeModalSlideIndex);
        renderModalSlide();
      }
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
