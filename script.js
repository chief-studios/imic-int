(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilities ---------- */
  function setYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Active navigation ---------- */
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const current = path === '' ? 'index.html' : path;

    document.querySelectorAll('.nav-links a').forEach(link => {
      const href = link.getAttribute('href') || '';
      const linkPage = href.split('/').pop().split('#')[0] || 'index.html';
      const isActive =
        linkPage === current ||
        (current === 'index.html' && (href === 'index.html' || href === './index.html' || href === '/'));

      if (isActive && !link.classList.contains('donate-nav')) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  /* ---------- Mobile navigation ---------- */
  function initMobileNav() {
    const toggleBtn = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');
    if (!toggleBtn || !navLinks) return;

    function closeMenu() {
      navLinks.classList.remove('show');
      toggleBtn.setAttribute('aria-expanded', 'false');
      toggleBtn.setAttribute('aria-label', 'Open menu');
    }

    function openMenu() {
      navLinks.classList.add('show');
      toggleBtn.setAttribute('aria-expanded', 'true');
      toggleBtn.setAttribute('aria-label', 'Close menu');
    }

    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'navLinks');

    toggleBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('show');
      isOpen ? closeMenu() : openMenu();
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('show')) {
        closeMenu();
        toggleBtn.focus();
      }
    });
  }

  /* ---------- Smooth scroll ---------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        }
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const counters = document.querySelectorAll('.counter');
    if (!counters.length) return;

    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-target'), 10);
      const suffix = el.getAttribute('data-suffix') || '';
      if (isNaN(target)) return;

      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString() + suffix;
        return;
      }

      const duration = 1300;
      const startTime = performance.now();

      function update(now) {
        let t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased).toLocaleString() + suffix;
        if (t < 1) requestAnimationFrame(update);
      }

      requestAnimationFrame(update);
    }

    const counterObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => counterObserver.observe(c));
  }

  /* ---------- Forms ---------- */
  /* ---------- Forms & Copy Utilities ---------- */
  function initCopyButtons() {
    document.querySelectorAll('.btn-copy').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        function markCopied() {
          const originalHTML = btn.innerHTML;
          btn.classList.add('copied');
          btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
          setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = originalHTML;
          }, 2000);
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(markCopied).catch(() => fallbackCopy(textToCopy, markCopied));
        } else {
          fallbackCopy(textToCopy, markCopied);
        }
      });
    });
  }

  function fallbackCopy(text, callback) {
    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.style.position = 'fixed';
    tempInput.style.opacity = '0';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      if (callback) callback();
    } catch (e) {
      console.error('Copy failed', e);
    }
    document.body.removeChild(tempInput);
  }

  function initDonateFormInteractivity() {
    // Frequency Toggle Buttons (One-Time, Monthly, In-Kind)
    const freqButtons = document.querySelectorAll('#freqToggle .freq-btn');
    const selectedFreqInput = document.getElementById('selectedFreq');
    const amountLabel = document.querySelector('.amount-selector-label');

    freqButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        freqButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const freq = btn.getAttribute('data-freq');
        if (selectedFreqInput) selectedFreqInput.value = freq;

        if (amountLabel) {
          if (freq === 'Monthly') {
            amountLabel.textContent = 'Select Monthly Gift Amount (GHS)';
          } else if (freq === 'In-Kind') {
            amountLabel.textContent = 'Select Estimated Value / Support Tier (GHS)';
          } else {
            amountLabel.textContent = 'Select a Gift Amount (GHS)';
          }
        }
      });
    });

    // Amount Pills (GH₵ 50, GH₵ 100, GH₵ 250, GH₵ 500, Custom)
    const amountPills = document.querySelectorAll('#amountPills .amount-pill');
    const amountInput = document.getElementById('donorAmount');

    amountPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        amountPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const amt = pill.getAttribute('data-amount');
        if (amountInput) {
          if (amt === 'custom') {
            amountInput.value = '';
            amountInput.focus();
            amountInput.placeholder = 'Enter custom amount (e.g. GH₵ 300)';
          } else {
            amountInput.value = `GH₵ ${amt}`;
          }
        }
      });
    });

    // Sync input field changes with amount pills
    if (amountInput) {
      amountInput.addEventListener('input', () => {
        const val = amountInput.value.trim().replace(/^GH₵\s*/i, '');
        let matched = false;
        amountPills.forEach(p => {
          const pAmt = p.getAttribute('data-amount');
          if (pAmt !== 'custom' && pAmt === val) {
            p.classList.add('active');
            matched = true;
          } else {
            p.classList.remove('active');
          }
        });
        if (!matched) {
          const customPill = document.querySelector('#amountPills .amount-pill[data-amount="custom"]');
          if (customPill) customPill.classList.add('active');
        }
      });
    }
  }

  function initContactFormInteractivity() {
    const topicButtons = document.querySelectorAll('#contactTopicToggle .topic-btn');
    const selectedTopicInput = document.getElementById('selectedTopic');
    const categorySelect = document.getElementById('contactCategory');

    topicButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        topicButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const topic = btn.getAttribute('data-topic');
        if (selectedTopicInput) selectedTopicInput.value = topic;

        if (categorySelect) {
          if (topic === 'Volunteering') {
            categorySelect.value = 'Volunteer Opportunities';
          } else if (topic === 'Partnership') {
            categorySelect.value = 'Partnership & Sponsorship';
          } else if (topic === 'Media / Press') {
            categorySelect.value = 'Press & Media Inquiries';
          } else {
            categorySelect.value = 'General Information';
          }
        }
      });
    });
  }

  function initForms() {
    document.querySelectorAll('.contact-form').forEach(form => {
      form.addEventListener('submit', handleFormSubmit);
      form.querySelectorAll('button[type="submit"], .btn[type="submit"]').forEach(btn => {
        btn.type = 'submit';
      });
    });
  }

  function handleFormSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type="submit"]');
    const statusEl = form.querySelector('.form-status') || createStatusEl(form);

    const name = form.querySelector('[name="name"]')?.value.trim();
    const email = form.querySelector('[name="email"]')?.value.trim();
    const message = form.querySelector('[name="message"]')?.value.trim();

    const phone = form.querySelector('[name="phone"]')?.value.trim();
    const amount = form.querySelector('[name="amount"]')?.value.trim();
    const frequency = form.querySelector('[name="frequency"]')?.value;
    const program = form.querySelector('[name="program"]')?.value;
    const topic = form.querySelector('[name="topic"]')?.value;
    const customSubject = form.querySelector('[name="subject"]')?.value.trim();

    if (!name || !email || !message) {
      showStatus(statusEl, 'Please complete all required fields.', 'error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus(statusEl, 'Please enter a valid email address.', 'error');
      return;
    }

    if (btn) btn.classList.add('is-loading');

    setTimeout(() => {
      if (btn) btn.classList.remove('is-loading');

      const subject = encodeURIComponent(
        customSubject || form.dataset.subject || 'IMIC Website Inquiry'
      );

      let bodyDetails = `Name: ${name}\nEmail: ${email}`;
      if (phone) bodyDetails += `\nPhone: ${phone}`;
      if (topic) bodyDetails += `\nTopic: ${topic}`;
      if (frequency) bodyDetails += `\nType: ${frequency}`;
      if (amount) bodyDetails += `\nAmount: ${amount}`;
      if (program) bodyDetails += `\nCategory/Program: ${program}`;
      bodyDetails += `\n\nMessage / Note:\n${message}`;

      const body = encodeURIComponent(bodyDetails);

      window.location.href = `mailto:imicinternationalorganization@gmail.com?subject=${subject}&body=${body}`;
      showStatus(statusEl, 'Thank you! Your email client will open shortly to complete sending your message.', 'success');
      form.reset();
    }, 600);
  }

  function createStatusEl(form) {
    const el = document.createElement('p');
    el.className = 'form-status';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-live', 'polite');
    form.appendChild(el);
    return el;
  }

  function showStatus(el, message, type) {
    el.textContent = message;
    el.className = `form-status is-visible form-status--${type}`;
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    const subBtn = document.getElementById('subscribeBtn');
    const emailInput = document.getElementById('newsEmail');
    if (!subBtn || !emailInput) return;

    subBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      if (!email) {
        emailInput.focus();
        emailInput.setAttribute('aria-invalid', 'true');
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        emailInput.setAttribute('aria-invalid', 'true');
        return;
      }
      emailInput.removeAttribute('aria-invalid');

      const subject = encodeURIComponent('Newsletter Subscription');
      const body = encodeURIComponent(`Please subscribe this email to the IMIC newsletter:\n\n${email}`);
      window.location.href = `mailto:imicinternationalorganization@gmail.com?subject=${subject}&body=${body}`;
    });

    emailInput.addEventListener('input', () => emailInput.removeAttribute('aria-invalid'));
  }

  /* ---------- Carousel ---------- */
  const carouselSlides = [
    {
      src: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'IMIC volunteers distributing supplies to families in Julikart, Gbawe',
      tag: 'Community Relief',
      title: 'Standing with families in need',
      impact: 'Coordinated relief reaches households facing sudden hardship — delivered with dignity and local partners.',
      location: 'Julikart, Gbawe, Ghana',
      project: 'Community Relief'
    },
    {
      src: 'https://images.pexels.com/photos/6646919/pexels-photo-6646919.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Community members gathered for an IMIC outreach event',
      tag: 'Community Development',
      title: 'Neighbors helping neighbors',
      impact: 'Local volunteers and leaders come together to strengthen the social fabric of their communities.',
      location: 'Ghana',
      project: 'Outreach Events'
    },
    {
      src: 'https://images.pexels.com/photos/17503769/pexels-photo-17503769.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Children learning together in a classroom setting',
      tag: 'Education & Youth',
      title: 'Keeping learners in school',
      impact: 'Scholarships and learning materials help students stay enrolled and build a brighter future.',
      location: 'Ghana',
      project: 'Educational Support'
    },
    {
      src: 'https://images.pexels.com/photos/27254264/pexels-photo-27254264.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Youth participating in a group mentorship session',
      tag: 'Youth Empowerment',
      title: 'Growing tomorrow\'s leaders',
      impact: 'Mentorship programs equip young people with confidence, skills, and a vision for their community.',
      location: 'Ghana',
      project: 'Youth Programs'
    },
    {
      src: 'https://images.pexels.com/photos/15189552/pexels-photo-15189552.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Healthcare worker providing wellness support to a community member',
      tag: 'Community Health',
      title: 'Health access for every family',
      impact: 'Basic healthcare referrals and wellness education reach families who need support most.',
      location: 'Ghana',
      project: 'Healthcare Support'
    },
    {
      src: 'https://images.pexels.com/photos/30565067/pexels-photo-30565067.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Farmer working in an agricultural field',
      tag: 'Agriculture & Livelihoods',
      title: 'Empowering farming families',
      impact: 'Training and agricultural inputs help smallholder farmers improve yields and household income.',
      location: 'Ghana',
      project: 'Agricultural Support'
    },
    {
      src: 'https://images.pexels.com/photos/17848919/pexels-photo-17848919.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Women participating in a livelihood skills workshop',
      tag: 'Women\'s Empowerment',
      title: 'Building economic independence',
      impact: 'Skills training and seed funding help women launch businesses and support their families.',
      location: 'Ghana',
      project: 'Livelihood Programs'
    },
    {
      src: 'https://images.pexels.com/photos/20527519/pexels-photo-20527519.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Community members collaborating on a local development project',
      tag: 'Community Development',
      title: 'Projects that unite communities',
      impact: 'Collaborative initiatives create shared ownership and lasting improvements in daily life.',
      location: 'Ghana',
      project: 'Local Development'
    },
    {
      src: 'https://images.pexels.com/photos/6284844/pexels-photo-6284844.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Volunteers providing inclusive support services',
      tag: 'Disability Services',
      title: 'Inclusive support for all',
      impact: 'Accessibility pathways ensure people with disabilities are included in every program we run.',
      location: 'Ghana',
      project: 'Inclusion Services'
    },
    {
      src: 'https://images.pexels.com/photos/16364307/pexels-photo-16364307.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Mentor coaching a participant one-on-one',
      tag: 'Mentorship',
      title: 'Guidance that changes trajectories',
      impact: 'One-on-one coaching builds resilience and helps individuals navigate challenges with confidence.',
      location: 'Ghana',
      project: 'Mentorship & Coaching'
    },
    {
      src: 'https://images.pexels.com/photos/36729916/pexels-photo-36729916.jpeg?auto=compress&cs=tinysrgb&w=1200',
      alt: 'Community celebration after a successful IMIC program',
      tag: 'Impact',
      title: 'Celebrating real progress',
      impact: 'Every milestone reflects a person who overcame challenges and built a foundation for the future.',
      location: 'Ghana',
      project: 'Community Impact'
    }
  ];

  function initCarousel() {
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevCarouselBtn');
    const nextBtn = document.getElementById('nextCarouselBtn');
    const dotsContainer = document.getElementById('carouselDots');
    const carouselEl = document.getElementById('communityCarousel');

    if (!track || !carouselSlides.length) return;

    let currentIndex = 0;
    let autoplayTimer = null;
    let touchStartX = 0;
    const AUTOPLAY_MS = 6000;

    function buildSlide(slide, idx) {
      const figure = document.createElement('figure');
      figure.className = 'carousel-slide';
      figure.setAttribute('role', 'group');
      figure.setAttribute('aria-roledescription', 'slide');
      figure.setAttribute('aria-label', `${idx + 1} of ${carouselSlides.length}`);
      figure.setAttribute('aria-hidden', idx === 0 ? 'false' : 'true');

      figure.innerHTML = `
        <div class="carousel-slide-media">
          <img
            src="${slide.src}"
            alt="${slide.alt}"
            loading="${idx === 0 ? 'eager' : 'lazy'}"
            decoding="async"
            width="1200"
            height="675"
          />
          <div class="carousel-slide-overlay" aria-hidden="true"></div>
        </div>
        <figcaption class="carousel-slide-caption">
          <span class="carousel-tag">${slide.tag}</span>
          <h3 class="carousel-title">${slide.title}</h3>
          <p class="carousel-impact">${slide.impact}</p>
          <div class="carousel-meta">
            <span><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${slide.location}</span>
            <span><i class="fas fa-folder-open" aria-hidden="true"></i> ${slide.project}</span>
          </div>
        </figcaption>
      `;
      return figure;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      carouselSlides.forEach((slide, idx) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel-dot' + (idx === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Go to slide ${idx + 1}: ${slide.title}`);
        dot.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');
        dot.addEventListener('click', () => goToSlide(idx));
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots() {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
        const isActive = idx === currentIndex;
        dot.classList.toggle('active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function updateSlideVisibility() {
      track.querySelectorAll('.carousel-slide').forEach((slide, idx) => {
        slide.setAttribute('aria-hidden', idx === currentIndex ? 'false' : 'true');
      });
    }

    function goToSlide(index, animate = true) {
      currentIndex = (index + carouselSlides.length) % carouselSlides.length;
      if (!animate) track.style.transition = 'none';
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (!animate) {
        track.offsetHeight;
        track.style.transition = '';
      }
      updateDots();
      updateSlideVisibility();
    }

    function nextSlide() { goToSlide(currentIndex + 1); }
    function prevSlide() { goToSlide(currentIndex - 1); }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayTimer = setInterval(nextSlide, AUTOPLAY_MS);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    track.innerHTML = '';
    carouselSlides.forEach((slide, idx) => track.appendChild(buildSlide(slide, idx)));
    buildDots();
    goToSlide(0, false);
    startAutoplay();

    prevBtn?.addEventListener('click', () => { prevSlide(); startAutoplay(); });
    nextBtn?.addEventListener('click', () => { nextSlide(); startAutoplay(); });

    carouselEl?.addEventListener('mouseenter', stopAutoplay);
    carouselEl?.addEventListener('mouseleave', startAutoplay);
    carouselEl?.addEventListener('focusin', stopAutoplay);
    carouselEl?.addEventListener('focusout', e => {
      if (!carouselEl.contains(e.relatedTarget)) startAutoplay();
    });

    carouselEl?.addEventListener('touchstart', e => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselEl?.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].screenX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? nextSlide() : prevSlide();
        startAutoplay();
      }
    }, { passive: true });

    carouselEl?.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); startAutoplay(); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); startAutoplay(); }
    });

    window.addEventListener('resize', () => goToSlide(currentIndex, false));
  }

  /* ---------- Init ---------- */
  setYear();
  setActiveNav();
  initMobileNav();
  initSmoothScroll();
  initReveal();
  initCounters();
  initForms();
  initCopyButtons();
  initDonateFormInteractivity();
  initContactFormInteractivity();
  initNewsletter();
  initCarousel();
})();
