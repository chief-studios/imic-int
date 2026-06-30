(function() {
  document.getElementById('year').innerText = new Date().getFullYear();

  // mobile toggle
  const toggleBtn = document.getElementById('mobileToggle');
  const navLinks = document.getElementById('navLinks');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => navLinks.classList.toggle('show'));
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('show')));
  }

  // smooth scroll for same-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === "#" || href === "") return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // scroll reveal
  const revealElements = document.querySelectorAll('[data-reveal]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // counters
  const counters = document.querySelectorAll('.counter');
  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const suffix = el.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;
    const duration = prefersReducedMotion ? 0 : 1300;
    const startTime = performance.now();
    function update(now) {
      let t = (now - startTime) / duration;
      if (t >= 1) t = 1;
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(target * eased);
      el.innerText = value.toLocaleString() + suffix;
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
  counters.forEach(c => {
    if (prefersReducedMotion) animateCounter(c);
    else counterObserver.observe(c);
  });
  const heroStat = document.querySelector('.hero-stat .counter');
  if (heroStat && !prefersReducedMotion) counterObserver.observe(heroStat);
  else if (heroStat && prefersReducedMotion) animateCounter(heroStat);

  // newsletter
  const subBtn = document.getElementById('subscribeBtn');
  if (subBtn) {
    subBtn.addEventListener('click', () => {
      const emailInput = document.getElementById('newsEmail');
      if (emailInput.value.trim() !== "") alert(`Thank you for subscribing! (demo: ${emailInput.value})`);
      else alert("Please enter a valid email address.");
    });
  }

  // carousel
  const imageUrls = [
    "https://images.pexels.com/photos/17503769/pexels-photo-17503769.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/27254264/pexels-photo-27254264.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/15189552/pexels-photo-15189552.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/30565067/pexels-photo-30565067.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/17848919/pexels-photo-17848919.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/20527519/pexels-photo-20527519.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/6284844/pexels-photo-6284844.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/16364307/pexels-photo-16364307.jpeg?auto=compress&cs=tinysrgb&w=900",
    "https://images.pexels.com/photos/36729916/pexels-photo-36729916.jpeg?auto=compress&cs=tinysrgb&w=900",
    "./opt-WhatsApp_Image_2026-06-30_at_9.41.59_AM.jpeg",
    "./opt-WhatsApp_Image_2026-06-30_at_9.42.00_AM.jpeg"
  ];
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevCarouselBtn');
  const nextBtn = document.getElementById('nextCarouselBtn');
  const dotsContainer = document.getElementById('carouselDots');
  let currentIndex = 0, slidesPerView = 3, totalSlides = imageUrls.length;

  function getSlidesPerView() {
    if (window.innerWidth <= 700) return 1;
    if (window.innerWidth <= 1000) return 2;
    return 3;
  }

  function buildCarousel() {
    track.innerHTML = '';
    imageUrls.forEach((url, idx) => {
      const slide = document.createElement('div');
      slide.classList.add('carousel-slide');
      const img = document.createElement('img');
      img.src = url;
      img.alt = `Community ${idx+1}`;
      img.loading = 'lazy';
      img.decoding = 'async';
      slide.appendChild(img);
      track.appendChild(slide);
    });
    updateDots();
    updateTransform();
  }

  function updateTransform() {
    if (!track.children.length) return;
    const slideWidth = track.children[0].getBoundingClientRect().width;
    const offset = currentIndex * (slideWidth + 24);
    track.style.transform = `translateX(-${offset}px)`;
    updateDotsActive();
  }

  function getPageCount() {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    return Math.max(1, Math.ceil((totalSlides - slidesPerView) / slidesPerView) + 1);
  }

  function updateDots() {
    const pageCount = getPageCount();
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    dotsContainer.innerHTML = '';
    for (let i = 0; i < pageCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('dot');
      if (i === getCurrentPage()) dot.classList.add('active');
      dot.addEventListener('click', () => {
        currentIndex = Math.min(i * slidesPerView, maxIndex);
        updateTransform();
      });
      dotsContainer.appendChild(dot);
    }
  }

  function updateDotsActive() {
    const activePage = getCurrentPage();
    const dots = dotsContainer.querySelectorAll('.dot');
    dots.forEach((dot, idx) => {
      if (idx === activePage) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  function getCurrentPage() {
    const pageCount = getPageCount();
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    if (currentIndex >= maxIndex) return pageCount - 1;
    return Math.floor(currentIndex / slidesPerView);
  }

  function nextSlide() {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    if (currentIndex >= maxIndex) {
      currentIndex = 0;
    } else {
      currentIndex = Math.min(currentIndex + slidesPerView, maxIndex);
    }
    updateTransform();
  }

  function prevSlide() {
    const maxIndex = Math.max(0, totalSlides - slidesPerView);
    if (currentIndex <= 0) {
      currentIndex = maxIndex;
    } else {
      currentIndex = Math.max(0, currentIndex - slidesPerView);
    }
    updateTransform();
  }

  function handleResize() {
    const newVal = getSlidesPerView();
    if (newVal !== slidesPerView) {
      slidesPerView = newVal;
      currentIndex = 0;
      updateTransform();
      updateDots();
    } else updateTransform();
  }

  if (track && imageUrls.length) {
    buildCarousel();
    slidesPerView = getSlidesPerView();
    window.addEventListener('resize', handleResize);
    prevBtn?.addEventListener('click', prevSlide);
    nextBtn?.addEventListener('click', nextSlide);
  }
})();
