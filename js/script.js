/* ═══════════════════════════════════════════
   CMS CONTENT LOADER — UPDATED
   Reads content.json (produced by admin.html) and
   applies images + contact info across the site.

   HOW TO USE THIS FILE:
   Open your existing js/script.js and REPLACE the
   function called `loadCMSContent` (Section 1, near
   the top of the file) with the version below.
   Leave everything else in script.js exactly as it is.
   ═══════════════════════════════════════════ */

async function loadCMSContent() {
  try {
    const res = await fetch(`content.json?t=${new Date().getTime()}`);
    if (!res.ok) return;
    const data = await res.json();

    const setImg = (selector, val) => {
      if (!val) return;
      document.querySelectorAll(selector).forEach(el => { el.src = val; });
    };
    const setText = (selector, val) => {
      if (val === undefined || val === null || val === '') return;
      document.querySelectorAll(selector).forEach(el => { el.textContent = val; });
    };

    /* ── HOME PAGE IMAGES ── */
    if (data.home && data.home.images) {
      const img = data.home.images;
      setImg('.hp-card-1 img', img.hero1);
      setImg('.hp-card-2 img', img.hero2);
      setImg('.hp-card-3 img', img.hero3);
      setImg('.img-card.main-img img', img.welcomeMain);
      setImg('.img-card.accent-img-1 img', img.welcomeAccent1);
      setImg('.img-card.accent-img-2 img', img.welcomeAccent2);
    }

    /* ── HOME PAGE METRICS ── */
    if (data.home && data.home.metrics) {
      const stats = document.querySelectorAll('.stat-num');
      const m = data.home.metrics;
      if (stats.length >= 4) {
        if (m.years)       stats[0].dataset.count = m.years;
        if (m.scholars)    stats[1].dataset.count = m.scholars;
        if (m.commitment)  stats[2].dataset.count = m.commitment;
        if (m.values)      stats[3].dataset.count = m.values;
      }
    }

    /* ── ABOUT US IMAGES ── */
    if (data.about) {
      setImg('.director-photo-frame img', data.about.directorPhoto);
      if (Array.isArray(data.about.photoStrip)) {
        const stripImgs = document.querySelectorAll('.about-photo-strip .strip-img img');
        data.about.photoStrip.forEach((src, i) => {
          if (src && stripImgs[i]) stripImgs[i].src = src;
        });
      }
    }

    /* ── GALLERY PHOTOS ── */
    if (data.gallery) {
      const galGrid = document.getElementById('gal-grid');
      if (galGrid) {
        Object.entries(data.gallery).forEach(([cat, photos]) => {
          if (!Array.isArray(photos) || photos.length === 0) return;
          // Remove existing items in this category that came from the static HTML
          galGrid.querySelectorAll(`.gal-item[data-cat="${cat}"]`).forEach(el => el.remove());
          // Re-add from content.json
          photos.forEach((src) => {
            const item = document.createElement('div');
            item.className = 'gal-item';
            item.dataset.cat = cat;
            item.dataset.label = cat;
            item.innerHTML = `
              <img src="${src}" alt="${cat}" loading="lazy" />
              <div class="gal-overlay">
                <button class="gal-expand"><i class="fas fa-expand-alt"></i></button>
                <p>${cat}</p>
              </div>`;
            galGrid.appendChild(item);
          });
        });
      }
    }

    /* ── GLOBAL CONTACT INFO ── */
    if (data.global) {
      const g = data.global;

      // Address — every element showing the school address
      if (g.address) {
        document.querySelectorAll('.map-address-badge span, .info-card p, .footer-contact-item p, .news-contact-strip span')
          .forEach(el => {
            if (el.textContent.includes('Forces Avenue') || el.closest('.info-card') ) {
              // Only replace address-looking text, skip phone/hours blocks
              if (el.textContent.match(/Avenue|Road|Street|G\.R\.A|Junction/i) || el.parentElement?.querySelector('h4')?.textContent === 'Our Address') {
                el.textContent = g.address;
              }
            }
          });
      }

      // Phone numbers — replace tel: links in order of appearance
      if (g.phones && g.phones.length) {
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        phoneLinks.forEach((link, i) => {
          const newPhone = g.phones[i % g.phones.length];
          if (!newPhone) return;
          link.href = `tel:${newPhone.replace(/\s+/g,'')}`;
          if (link.children.length === 0) {
            link.textContent = newPhone;
          } else {
            // Has an icon — update trailing text node only
            const lastNode = link.lastChild;
            if (lastNode && lastNode.nodeType === Node.TEXT_NODE) {
              lastNode.textContent = ' ' + newPhone;
            }
          }
        });
      }

      // Email
      if (g.email) {
        document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
          link.href = `mailto:${g.email}`;
          if (link.children.length === 0) link.textContent = g.email;
        });
      }

      // Office hours
      if (g.hours) {
        document.querySelectorAll('.info-card').forEach(card => {
          const h4 = card.querySelector('h4');
          if (h4 && h4.textContent.trim() === 'School Hours') {
            const firstP = card.querySelector('p');
            if (firstP) firstP.textContent = g.hours;
          }
        });
      }

      // Social links
      if (g.facebook) document.querySelectorAll('a[href*="facebook.com"]').forEach(a => a.href = g.facebook);
      if (g.instagram) document.querySelectorAll('a[href*="instagram.com"]').forEach(a => a.href = g.instagram);
      if (g.tiktok) document.querySelectorAll('a[href*="tiktok.com"]').forEach(a => a.href = g.tiktok);

      // Map embed
      if (g.mapEmbed) {
        document.querySelectorAll('.map-wrapper iframe').forEach(frame => {
          frame.src = g.mapEmbed;
        });
      }
    }

  } catch (err) {
    console.error("CMS Load Error:", err);
  }
}
// ==========================================
// 2. CORE APPLICATION LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for CMS to load data (if it exists) before initializing the UI
  await loadCMSContent();

  initNavigation();
  initPageRouting();
  initScrollEffects();
  initCounters();
  initReveals();
  initGalleryDesign();
  initLightbox();
  initForms();
});

// ==========================================
// 3. NAVIGATION & MOBILE MENU
// ==========================================
function initNavigation() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');
  const allNavItems = document.querySelectorAll('.nav-link');

  if (hamburger && navLinks) {
    // Toggle menu
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
      hamburger.setAttribute('aria-expanded', hamburger.classList.contains('open'));
      // Prevent body scrolling when menu is open
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    allNavItems.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      });
    });
  }

  // Update Footer Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// ==========================================
// 4. SPA PAGE ROUTING
// ==========================================
function initPageRouting() {
  const allPages = document.querySelectorAll('.page');
  const validPages = ['home', 'about', 'admissions', 'news', 'gallery', 'contact', 'portal'];

  function showPage(pageId) {
    // Hide all pages, show target
    allPages.forEach(p => p.classList.remove('active'));
    const target = document.getElementById(pageId);
    if (target) {
      target.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active nav links
    document.querySelectorAll('.nav-link').forEach(l => {
      l.classList.toggle('active', l.dataset.page === pageId);
    });
  }

  function handleHash() {
    const hash = window.location.hash.replace('#', '') || 'home';
    showPage(validPages.includes(hash) ? hash : 'home');
  }

  // Intercept normal link clicks
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-page]');
    if (!link) return;
    
    // Ignore if it's a download link or external
    if (link.hasAttribute('download')) return;

    e.preventDefault();
    const pageId = link.dataset.page;
    if (pageId) {
      history.pushState(null, '', `#${pageId}`);
      showPage(pageId);
    }
  });

  // Handle back/forward browser buttons
  window.addEventListener('load', handleHash);
  window.addEventListener('popstate', handleHash);
}

// ==========================================
// 5. SCROLL EFFECTS
// ==========================================
function initScrollEffects() {
  const header = document.getElementById('site-header');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (header) header.classList.toggle('scrolled', scrollY > 60);
    if (backToTop) backToTop.classList.toggle('show', scrollY > 400);
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// ==========================================
// 6. ANIMATIONS & REVEALS
// ==========================================
function initCounters() {
  let countersRun = false;
  const statsRibbon = document.querySelector('.stats-ribbon');
  const statElements = document.querySelectorAll('[data-count]');

  if (!statsRibbon || statElements.length === 0) return;

  const runCounters = () => {
    if (countersRun) return;
    countersRun = true;

    statElements.forEach(el => {
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;

      let current = 0;
      const stepTime = 16;
      const increment = target / (1800 / stepTime);

      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          el.textContent = target.toLocaleString();
          clearInterval(timer);
        } else {
          el.textContent = Math.floor(current).toLocaleString();
        }
      }, stepTime);
    });
  };

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      runCounters();
      observer.disconnect();
    }
  }, { threshold: 0.1 });

  observer.observe(statsRibbon);
}

function initReveals() {
  const revealElements = document.querySelectorAll('.value-card, .step-card, .doc-card, .news-card, .expect-item, .vd-item, .info-card, .quick-card, .vm-card');
  
  // Auto-add reveal class
  revealElements.forEach(el => {
    if (!el.classList.contains('reveal')) el.classList.add('reveal');
  });

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ==========================================
// 7. GALLERY DESIGN INTERACTIONS
// ==========================================
// ==========================================
// 7. GALLERY DESIGN INTERACTIONS
// ==========================================
function initGalleryDesign() {
  // Tabs & Filtering
  const galTabs = document.querySelectorAll('.gal-tab');
  const galItems = document.querySelectorAll('.gal-item, .bento-item'); // Supports both HTML and CMS items
  const galCount = document.getElementById('gal-count');
  const galEmpty = document.getElementById('gal-empty');
  // --- TAB SCROLLING LOGIC ---
  const tabsContainer = document.getElementById('gal-tabs');
  const scrollLeftBtn = document.getElementById('tab-scroll-left');
  const scrollRightBtn = document.getElementById('tab-scroll-right');

  if (tabsContainer && scrollLeftBtn && scrollRightBtn) {
    const scrollAmount = 250; // How far it scrolls per click

    // Button Click Events
    scrollLeftBtn.addEventListener('click', () => {
      tabsContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    scrollRightBtn.addEventListener('click', () => {
      tabsContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    // Show/Hide buttons based on scroll position
    const updateScrollButtons = () => {
      // Show left button if we've scrolled past 0
      scrollLeftBtn.classList.toggle('visible', tabsContainer.scrollLeft > 0);
      
      // Show right button if we haven't reached the max scroll width
      // We subtract 2 to give a tiny margin of error for browser calculation differences
      const maxScroll = tabsContainer.scrollWidth - tabsContainer.clientWidth;
      scrollRightBtn.classList.toggle('visible', tabsContainer.scrollLeft < maxScroll - 2);
    };

    // Listen for scrolling and screen resizing
    tabsContainer.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    
    // Auto-scroll a tab into the center when clicked
    galTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      });
    });

    // Run once on load to set initial button visibility
    setTimeout(updateScrollButtons, 100); 
  }
  // --- END TAB SCROLLING LOGIC ---



  if (galTabs.length > 0 && galItems.length > 0) {
    galTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Update active tab styling
        galTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.cat;
        let visibleCount = 0;
        
        // This keeps track of which categories we have already shown a "preview" for
        const previewedCategories = new Set();

        galItems.forEach(item => {
          item.classList.add('gal-exiting'); // Trigger CSS shrink/fade animation
          
          setTimeout(() => {
            item.classList.remove('gal-exiting');
            
            let shouldShow = false;
            const itemCat = item.dataset.cat || item.dataset.category; // Supports both data attributes

            if (filter === 'all') {
              // ALL PHOTOS LOGIC:
              if (itemCat === 'random') {
                // 1. Always show every "School Moments" picture
                shouldShow = true;
              } else if (!previewedCategories.has(itemCat)) {
                // 2. Show only the FIRST picture of any other category (Category Preview)
                shouldShow = true;
                previewedCategories.add(itemCat); // Mark this category as previewed
              }
            } else if (itemCat === filter) {
              // SPECIFIC TAB LOGIC: Show all images matching the clicked tab
              shouldShow = true;
            }

            // Apply visibility based on our logic
            if (shouldShow) {
              item.style.display = '';
              visibleCount++;
            } else {
              item.style.display = 'none';
            }

            // Update UI Counters
            if (galCount) galCount.innerText = visibleCount;
            if (galEmpty) galEmpty.style.display = visibleCount === 0 ? 'block' : 'none';
          }, 280); // Matches the 0.28s CSS animation duration
        });
      });
    });
    
    // Trigger the 'All Photos' logic immediately on page load so the initial state is clean
    const allTab = document.querySelector('.gal-tab[data-cat="all"]');
    if (allTab) allTab.click();
  }

  // Grid/Masonry Toggles
  const btnGrid = document.getElementById('gv-grid');
  const btnMasonry = document.getElementById('gv-masonry');
  const galGrid = document.getElementById('gal-grid');

  if (btnGrid && btnMasonry && galGrid) {
    btnGrid.addEventListener('click', () => {
      btnGrid.classList.add('active');
      btnMasonry.classList.remove('active');
      galGrid.classList.remove('masonry-mode');
    });

    btnMasonry.addEventListener('click', () => {
      btnMasonry.classList.add('active');
      btnGrid.classList.remove('active');
      galGrid.classList.add('masonry-mode');
    });
  }
}

// ==========================================
// 8. UNIVERSAL LIGHTBOX
// ==========================================
function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');
  const lbCaption = document.getElementById('lightbox-caption');
  const lbCounter = document.getElementById('lightbox-counter');
  
  if (!lightbox || !lbImg) return;

  let currentVisibleItems = [];
  let currentIndex = 0;

  // Open Lightbox (Supports both design.txt '.gal-item' and cms '.bento-item')
  document.addEventListener('click', (e) => {
    const clickedItem = e.target.closest('.gal-item, .bento-item');
    if (!clickedItem) return;

    // Only grab images that are currently visible on the screen
    currentVisibleItems = Array.from(document.querySelectorAll('.gal-item, .bento-item')).filter(item => item.style.display !== 'none');
    currentIndex = currentVisibleItems.indexOf(clickedItem);

    updateLightbox();
    lightbox.classList.add('open', 'active');
    document.body.style.overflow = 'hidden';
  });

  const updateLightbox = () => {
    if (currentVisibleItems.length === 0) return;
    const item = currentVisibleItems[currentIndex];
    const img = item.querySelector('img');
    
    // Check for both design.txt labels and bento captions
    const label = item.getAttribute('data-label') || (item.querySelector('.bento-caption') ? item.querySelector('.bento-caption').innerText : '');

    lbImg.src = img.src;
    if (lbCaption) lbCaption.innerText = label;
    if (lbCounter) lbCounter.innerText = `${currentIndex + 1} / ${currentVisibleItems.length}`;
  };

  const closeLightbox = () => {
    lightbox.classList.remove('open', 'active');
    document.body.style.overflow = '';
  };

  const navigateLightbox = (direction) => {
    if (currentVisibleItems.length === 0) return;
    currentIndex = (currentIndex + direction + currentVisibleItems.length) % currentVisibleItems.length;
    updateLightbox();
  };

  // Controls
  document.getElementById('lightbox-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-prev')?.addEventListener('click', () => navigateLightbox(-1));
  document.getElementById('lightbox-next')?.addEventListener('click', () => navigateLightbox(1));
  
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open') && !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') navigateLightbox(1);
    if (e.key === 'ArrowLeft') navigateLightbox(-1);
  });
}

// ==========================================
// 9. FORMS
// ==========================================
function initForms() {
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (contactForm.checkValidity()) {
        const btn = contactForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        btn.disabled = true;

        // Simulate network request
        setTimeout(() => {
          if (formSuccess) formSuccess.classList.add('show');
          btn.innerHTML = originalText;
          btn.disabled = false;
          contactForm.reset();
          
          setTimeout(() => {
            if (formSuccess) formSuccess.classList.remove('show');
          }, 5000);
        }, 1500);
      } else {
        contactForm.reportValidity();
      }
    });
  }
}

