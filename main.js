/* ============================================================
   KNOTTED & KIND — Main Site JavaScript (main.js)
   Handles: navbar scroll, reveal animations, FAQ, contact form,
   filter bar, and product grid rendering on products.html
   ============================================================ */

/* ============================================================
   1. NAVBAR SCROLL SHADOW
   ============================================================ */
(function initNavbar() {
  const nav = document.getElementById("mainNav");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 30);
  }, { passive: true });
})();


/* ============================================================
   2. SCROLL REVEAL (Intersection Observer)
   Animates .reveal and .reveal-stagger elements into view.
   ============================================================ */
(function initReveal() {
  const revealEls = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Slight stagger for grid items that enter simultaneously
        setTimeout(() => entry.target.classList.add("visible"), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. MARQUEE STRIP (index.html)
   Pauses on hover for accessibility.
   ============================================================ */
(function initMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
  track.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
})();


/* ============================================================
   4. TOAST NOTIFICATION UTILITY
   Creates and shows a transient bottom-right toast.
   @param {string} message
   @param {string} icon     — Font Awesome class e.g. "fa-check"
   ============================================================ */
function showToast(message, icon = "fa-check-circle") {
  // Remove any existing toast
  const existing = document.querySelector(".toast-notify");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast-notify";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  // Auto-dismiss
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2800);
}


/* ============================================================
   5. PRODUCTS PAGE — Grid Renderer
   Reads from the shared data layer and renders product cards.
   ============================================================ */
(function initProductsPage() {
  const grid      = document.getElementById("productGrid");
  const countEl   = document.getElementById("productCount");
  const filterBar = document.querySelector(".filter-bar");
  if (!grid) return; // Not on products page

  /* ── Render all products ── */
  function renderGrid(filterCategory = "all") {
    const products = getVisibleProducts();
    const filtered = filterCategory === "all"
      ? products
      : products.filter(p => p.category === filterCategory);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <i class="fa-solid fa-basket-shopping"></i>
            <p>No products found in this category.</p>
          </div>
        </div>`;
    } else {
      grid.innerHTML = filtered.map(p => `
        <div class="col-xl-3 col-lg-4 col-md-6 product-item reveal"
             data-category="${p.category}">
          ${renderProductCard(p)}
        </div>`).join("");

      // Re-trigger reveal for newly rendered cards
      const newCards = grid.querySelectorAll(".reveal");
      const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 60);
            obs.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });
      newCards.forEach(c => obs.observe(c));
    }

    // Update count
    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;
    }

    // Reinit wishlist buttons
    initWishlistButtons();
  }

  /* ── Filter buttons ── */
  if (filterBar) {
    filterBar.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(btn.getAttribute("data-filter"));
      });
    });
  }

  /* ── Initial render ── */
  renderGrid("all");
})();


/* ============================================================
   6. HOMEPAGE — Featured Products Renderer
   Reads featured products and injects them into #featuredGrid
   ============================================================ */
(function initFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  const featured = getFeaturedProducts().slice(0, 4); // max 4

  if (featured.length === 0) {
    grid.innerHTML = `<div class="col-12 text-center" style="color:var(--mid);">
      No featured products configured.</div>`;
    return;
  }

  grid.innerHTML = featured.map(p => `
    <div class="col-lg-3 col-md-6">
      ${renderProductCard(p, false)}
    </div>`).join("");

  // Trigger reveal
  const cards = grid.querySelectorAll(".product-card");
  cards.forEach((c, i) => {
    c.style.opacity = "0";
    c.style.transform = "translateY(24px)";
    c.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    setTimeout(() => {
      c.style.opacity = "1";
      c.style.transform = "translateY(0)";
    }, 300 + i * 100);
  });

  initWishlistButtons();
})();


/* ============================================================
   7. FAQ ACCORDION (contact.html)
   ============================================================ */
(function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach(item => {
    const question = item.querySelector(".faq-question");
    if (!question) return;

    question.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // Close all
      items.forEach(i => i.classList.remove("open"));
      // Open this one if it wasn't open
      if (!isOpen) item.classList.add("open");
    });
  });
})();


/* ============================================================
   8. CONTACT FORM VALIDATION (contact.html)
   ============================================================ */
(function initContactForm() {
  const form    = document.getElementById("contactForm");
  if (!form) return;

  const successMsg   = document.getElementById("successMsg");
  const messageField = document.getElementById("message");
  const charCount    = document.getElementById("charCount");
  const submitBtn    = document.getElementById("submitBtn");

  /* Character counter */
  if (messageField && charCount) {
    messageField.addEventListener("input", () => {
      charCount.textContent = messageField.value.length;
    });
  }

  /* Field validators */
  function setValid(field, ok) {
    field.classList.remove("is-valid", "is-invalid");
    field.classList.add(ok ? "is-valid" : "is-invalid");
    return ok;
  }

  function validateName() {
    const f = document.getElementById("name");
    return f ? setValid(f, f.value.trim().length >= 2) : true;
  }

  function validateEmail() {
    const f = document.getElementById("email");
    return f ? setValid(f, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) : true;
  }

  function validateSubject() {
    const f = document.getElementById("subject");
    return f ? setValid(f, f.value !== "") : true;
  }

  function validateMessage() {
    const f = document.getElementById("message");
    return f ? setValid(f, f.value.trim().length >= 10) : true;
  }

  /* Live blur validation */
  document.getElementById("name")    ?.addEventListener("blur", validateName);
  document.getElementById("email")   ?.addEventListener("blur", validateEmail);
  document.getElementById("subject") ?.addEventListener("change", validateSubject);
  document.getElementById("message") ?.addEventListener("blur", validateMessage);

  /* Submit */
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = validateName() & validateEmail() & validateSubject() & validateMessage();

    if (ok) {
      if (successMsg) successMsg.classList.add("show");
      if (submitBtn) {
        submitBtn.textContent = "✓ Message Sent!";
        submitBtn.style.background = "#3a6b42";
      }

      setTimeout(() => {
        form.reset();
        form.querySelectorAll(".form-control").forEach(f => {
          f.classList.remove("is-valid", "is-invalid");
        });
        if (charCount) charCount.textContent = "0";
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send Message';
          submitBtn.style.background = "";
        }
        setTimeout(() => successMsg?.classList.remove("show"), 6000);
      }, 1800);

    } else {
      const first = form.querySelector(".is-invalid");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus();
    }
  });
})();
