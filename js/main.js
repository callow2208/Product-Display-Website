/* ============================================================
   KNOTTED & KIND — Main Site JavaScript (main.js)
   v2 — Product cards now use real images.
   Handles: navbar scroll, reveal, marquee, products grid,
            featured section, FAQ, contact form validation.
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
   ============================================================ */
(function initReveal() {
  const els = document.querySelectorAll(".reveal, .reveal-stagger");
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add("visible"), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  els.forEach(el => observer.observe(el));
})();


/* ============================================================
   3. MARQUEE — pause on hover
   ============================================================ */
(function initMarquee() {
  const track = document.querySelector(".marquee-track");
  if (!track) return;
  track.addEventListener("mouseenter", () => track.style.animationPlayState = "paused");
  track.addEventListener("mouseleave", () => track.style.animationPlayState = "running");
})();


/* ============================================================
   4. TOAST NOTIFICATION
   ============================================================ */
function showToast(message, icon = "fa-check-circle") {
  document.querySelector(".toast-notify")?.remove();
  const toast = document.createElement("div");
  toast.className = "toast-notify";
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 2800);
}


/* ============================================================
   5. PRODUCTS PAGE — Grid Renderer
   Reads visible products from localStorage, renders cards.
   ============================================================ */
(function initProductsPage() {
  const grid    = document.getElementById("ProductGrid");
  const countEl = document.getElementById("productCount");
  const filterBar = document.querySelector(".filter-bar");
  if (!grid) return;

  /* Render cards for the given filter category */
  function renderGrid(filterCat = "all") {
    const products = getVisibleProducts();
    const filtered = filterCat === "all" ? products : products.filter(p => p.category === filterCat);

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-12">
          <div class="empty-state">
            <i class="fa-solid fa-basket-shopping"></i>
            <p>No products in this category yet.</p>
          </div>
        </div>`;
    } else {
      grid.innerHTML = filtered.map(p => `
        <div class="col-xl-3 col-lg-4 col-md-6 product-item reveal" data-category="${p.category}">
          ${renderProductCard(p)}
        </div>`
      ).join("");

      /* Trigger reveal for newly injected cards */
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            setTimeout(() => e.target.classList.add("visible"), i * 60);
            observer.unobserve(e.target);
          }
        });
      }, { threshold: 0.08 });

      grid.querySelectorAll(".reveal").forEach(c => observer.observe(c));
    }

    if (countEl) countEl.textContent = `Showing ${filtered.length} product${filtered.length !== 1 ? "s" : ""}`;

    initWishlistButtons();
  }

  /* Filter buttons */
  if (filterBar) {
    filterBar.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid(btn.getAttribute("data-filter"));
      });
    });
  }

  /* Initial render — all products */
  renderGrid("all");
})();


/* ============================================================
   6. HOMEPAGE — Featured Products Renderer
   ============================================================ */
(function initFeaturedProducts() {
  const grid = document.getElementById("featuredGrid");
  if (!grid) return;

  const featured = getFeaturedProducts();  // Now sync

  if (featured.length === 0) {
    grid.innerHTML = `
      <div class="col-12 text-center" style="color:var(--mid);padding:3rem 0;">
        <p style="font-family:var(--font-display);font-size:1.1rem;">
          No featured products yet
        </p>
      </div>`;
    return;
  }

  grid.innerHTML = featured.map(p => `
    <div class="col-lg-3 col-md-6">
      ${renderProductCardNoWishlist(p)}
    </div>`
  ).join("");

  // Staggered animation
  grid.querySelectorAll(".product-card").forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(24px)";
    card.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 300 + i * 100);
  });
})();

// Call it
initFeaturedProducts();



/* ============================================================
   7. FAQ ACCORDION (contact.html)
   ============================================================ */
(function initFAQ() {
  const items = document.querySelectorAll(".faq-item");
  if (!items.length) return;

  items.forEach(item => {
    item.querySelector(".faq-question")?.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      items.forEach(i => i.classList.remove("open"));
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
  messageField?.addEventListener("input", () => {
    if (charCount) charCount.textContent = messageField.value.length;
  });

  /* Validators */
  function setValid(field, ok) {
    field.classList.remove("is-valid", "is-invalid");
    field.classList.add(ok ? "is-valid" : "is-invalid");
    return ok;
  }

  const validateName    = () => { const f = document.getElementById("name");    return f ? setValid(f, f.value.trim().length >= 2) : true; };
  const validateEmail   = () => { const f = document.getElementById("email");   return f ? setValid(f, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim())) : true; };
  const validateSubject = () => { const f = document.getElementById("subject"); return f ? setValid(f, f.value !== "") : true; };
  const validateMessage = () => { const f = document.getElementById("message"); return f ? setValid(f, f.value.trim().length >= 10) : true; };

  /* Blur triggers */
  document.getElementById("name")    ?.addEventListener("blur",   validateName);
  document.getElementById("email")   ?.addEventListener("blur",   validateEmail);
  document.getElementById("subject") ?.addEventListener("change", validateSubject);
  document.getElementById("message") ?.addEventListener("blur",   validateMessage);

  /* Submit */
  form.addEventListener("submit", e => {
    e.preventDefault();
    const ok = validateName() & validateEmail() & validateSubject() & validateMessage();

    if (ok) {
      successMsg?.classList.add("show");
      if (submitBtn) { submitBtn.textContent = "✓ Message Sent!"; submitBtn.style.background = "#3a6b42"; }

      setTimeout(() => {
        form.reset();
        form.querySelectorAll(".form-control").forEach(f => f.classList.remove("is-valid", "is-invalid"));
        if (charCount) charCount.textContent = "0";
        if (submitBtn) { submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane me-2"></i>Send Message'; submitBtn.style.background = ""; }
        setTimeout(() => successMsg?.classList.remove("show"), 6000);
      }, 1800);

    } else {
      const first = form.querySelector(".is-invalid");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      first?.focus();
    }
  });
})();
