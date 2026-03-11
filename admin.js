/* ============================================================
   KNOTTED & KIND — Admin Panel JavaScript (admin.js)

   Features:
   - Password login with session persistence (sessionStorage)
   - Full CRUD: Add / Edit / Delete products
   - Toggle visibility & featured status per product
   - Drag-and-drop sort order
   - Live stats dashboard
   - Reset to defaults
   - All changes persist to localStorage (shared with products.html)
   ============================================================ */

/* ============================================================
   ADMIN CONFIG
   Change these values to set your admin credentials.
   For a real deployment use server-side auth instead.
   ============================================================ */
const ADMIN_CONFIG = {
  username:    "admin",
  password:    "knotted2025",     // ← Change this password
  sessionKey:  "kk_admin_session"
};

/* Available emoji options for products */
const EMOJI_OPTIONS = [
  "👶","🧦","🎩","🎀","🔑","📎","🌸",
  "🧶","🧵","💛","🌷","🍀","🎁","🌿",
  "🐣","🦋","🌼","🌙","⭐","🎈","🎊"
];

/* Background color class options */
const BG_OPTIONS = [
  { cls: "bg-blush",  hex: "#f5e9e5", label: "Blush"  },
  { cls: "bg-sage",   hex: "#e4ede2", label: "Sage"   },
  { cls: "bg-lilac",  hex: "#ede4f0", label: "Lilac"  },
  { cls: "bg-sky",    hex: "#deeaf5", label: "Sky"    },
  { cls: "bg-honey",  hex: "#f5ead8", label: "Honey"  },
  { cls: "bg-mint",   hex: "#ddf0e8", label: "Mint"   },
  { cls: "bg-rose",   hex: "#f5dde4", label: "Rose"   },
  { cls: "bg-peach",  hex: "#fce4d6", label: "Peach"  }
];

/* Category options */
const CATEGORIES = [
  { value: "baby",        label: "Baby Collection" },
  { value: "accessories", label: "Accessories"     },
  { value: "home",        label: "Home & Fun"      }
];

/* ============================================================
   DOM REFERENCES
   ============================================================ */
const loginScreen  = document.getElementById("loginScreen");
const adminApp     = document.getElementById("adminApp");
const loginForm    = document.getElementById("loginForm");
const usernameInp  = document.getElementById("adminUsername");
const passwordInp  = document.getElementById("adminPassword");
const userError    = document.getElementById("userError");
const passError    = document.getElementById("passError");
const productTable = document.getElementById("productTableBody");
const modal        = document.getElementById("productModal");
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle   = document.getElementById("modalTitle");
const productForm  = document.getElementById("productForm");

/* ============================================================
   1. SESSION AUTH
   ============================================================ */

/** Check if already logged in */
function checkSession() {
  return sessionStorage.getItem(ADMIN_CONFIG.sessionKey) === "authenticated";
}

/** Log in and show dashboard */
function loginAdmin() {
  sessionStorage.setItem(ADMIN_CONFIG.sessionKey, "authenticated");
  loginScreen.style.display = "none";
  adminApp.classList.add("visible");
  refreshDashboard();
}

/** Log out */
function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);
  adminApp.classList.remove("visible");
  loginScreen.style.display = "flex";
  // Clear inputs
  if (usernameInp) usernameInp.value = "";
  if (passwordInp) passwordInp.value = "";
}

/* ============================================================
   2. LOGIN FORM HANDLER
   ============================================================ */
if (loginForm) {
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    let valid = true;

    // Reset errors
    userError.classList.remove("show");
    passError.classList.remove("show");
    usernameInp.classList.remove("error");
    passwordInp.classList.remove("error");

    if (usernameInp.value.trim() === "") {
      userError.textContent = "Username is required.";
      userError.classList.add("show");
      usernameInp.classList.add("error");
      valid = false;
    } else if (usernameInp.value.trim() !== ADMIN_CONFIG.username) {
      userError.textContent = "Incorrect username.";
      userError.classList.add("show");
      usernameInp.classList.add("error");
      valid = false;
    }

    if (passwordInp.value === "") {
      passError.textContent = "Password is required.";
      passError.classList.add("show");
      passwordInp.classList.add("error");
      valid = false;
    } else if (
      usernameInp.value.trim() === ADMIN_CONFIG.username &&
      passwordInp.value !== ADMIN_CONFIG.password
    ) {
      passError.textContent = "Incorrect password.";
      passError.classList.add("show");
      passwordInp.classList.add("error");
      valid = false;
    }

    if (valid) loginAdmin();
  });
}

/* Password visibility toggle */
document.getElementById("togglePassword")?.addEventListener("click", function() {
  const isPw = passwordInp.type === "password";
  passwordInp.type = isPw ? "text" : "password";
  this.querySelector("i").className = isPw ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
});

/* Close modal on overlay click */
modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) closeModal();
});

/* Logout button */
document.getElementById("btnLogout")?.addEventListener("click", () => {
  showConfirmDialog(
    "🚪",
    "Log Out",
    "Are you sure you want to log out of the admin panel?",
    logoutAdmin
  );
});

/* ============================================================
   3. DASHBOARD REFRESH
   Rebuilds stats + product table from localStorage data.
   ============================================================ */
function refreshDashboard() {
  updateStats();
  renderProductTable();
}

/** Update the top stat cards */
function updateStats() {
  const all      = getProducts();
  const visible  = all.filter(p => p.visible);
  const featured = all.filter(p => p.featured);
  const cats     = new Set(all.map(p => p.category));

  setEl("statTotal",    all.length);
  setEl("statVisible",  visible.length);
  setEl("statFeatured", featured.length);
  setEl("statCats",     cats.size);
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   4. PRODUCT TABLE RENDERER
   ============================================================ */
function renderProductTable() {
  const products = getProducts().sort((a, b) => a.sortOrder - b.sortOrder);

  if (!productTable) return;

  if (products.length === 0) {
    productTable.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="admin-empty">
            <i class="fa-solid fa-box-open"></i>
            <p>No products yet. Add your first product!</p>
          </div>
        </td>
      </tr>`;
    return;
  }

  productTable.innerHTML = products.map(p => {
    const catPill = getCategoryPill(p.category);
    const bg      = BG_OPTIONS.find(b => b.cls === p.bgClass) || BG_OPTIONS[0];

    return `
      <tr data-id="${p.id}" draggable="true">
        <td>
          <span class="sort-handle" title="Drag to reorder">
            <i class="fa-solid fa-grip-vertical"></i>
          </span>
        </td>
        <td>
          <div class="table-product-preview">
            <div class="table-emoji-thumb" style="background:${bg.hex};">
              ${p.emoji}
            </div>
            <div>
              <div class="table-product-name">${p.name}</div>
              <div class="table-product-id">${p.id}</div>
            </div>
          </div>
        </td>
        <td>${catPill}</td>
        <td>
          <span style="font-family:'Cormorant Garamond',serif; font-size:1.1rem; color:#d4a9a0;">
            ₹${p.price}
          </span>
          ${p.originalPrice ? `<span style="font-size:0.75rem; color:#8a7d72; text-decoration:line-through; margin-left:0.3rem;">₹${p.originalPrice}</span>` : ""}
        </td>
        <td>
          <label class="visibility-toggle" title="${p.visible ? 'Click to hide' : 'Click to show'}">
            <input type="checkbox" ${p.visible ? "checked" : ""}
                   onchange="toggleVisibility('${p.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </td>
        <td>
          <button class="featured-star ${p.featured ? 'starred' : ''}"
                  title="${p.featured ? 'Remove from featured' : 'Mark as featured'}"
                  onclick="toggleFeatured('${p.id}', this)">
            <i class="fa-${p.featured ? 'solid' : 'regular'} fa-star"></i>
          </button>
        </td>
        <td>
          ${p.badge
            ? `<span class="product-badge badge-${p.badge}" style="position:static; display:inline-block; font-size:0.65rem;">${p.badgeLabel}</span>`
            : `<span style="color:#8a7d72; font-size:0.78rem;">—</span>`}
        </td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn-action btn-edit" onclick="openEditModal('${p.id}')">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button class="btn-action btn-del" onclick="confirmDelete('${p.id}', '${escapeHTML(p.name)}')">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </td>
      </tr>`;
  }).join("");

  // Init drag-and-drop after render
  initDragSort();
}

/** Returns a styled category pill HTML */
function getCategoryPill(cat) {
  const map = { baby: "pill-baby", accessories: "pill-accessories", home: "pill-home" };
  const labels = { baby: "Baby", accessories: "Accessories", home: "Home & Fun" };
  return `<span class="category-pill ${map[cat] || ''}">${labels[cat] || cat}</span>`;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, c =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" })[c]);
}

/* ============================================================
   5. VISIBILITY & FEATURED TOGGLES
   ============================================================ */
function toggleVisibility(id, visible) {
  updateProduct(id, { visible });
  updateStats();
  showAdminToast(visible ? "Product is now visible." : "Product hidden.", "fa-eye", "toast-info");
}

function toggleFeatured(id, btn) {
  const products = getProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) return;
  const newFeatured = !p.featured;
  updateProduct(id, { featured: newFeatured });
  btn.classList.toggle("starred", newFeatured);
  btn.querySelector("i").className = `fa-${newFeatured ? "solid" : "regular"} fa-star`;
  btn.title = newFeatured ? "Remove from featured" : "Mark as featured";
  updateStats();
  showAdminToast(
    newFeatured ? "Added to featured." : "Removed from featured.",
    "fa-star",
    "toast-info"
  );
}

/* ============================================================
   6. DRAG-AND-DROP SORT
   ============================================================ */
let dragSrc = null;

function initDragSort() {
  const rows = productTable?.querySelectorAll("tr[draggable='true']");
  if (!rows) return;

  rows.forEach(row => {
    row.addEventListener("dragstart", e => {
      dragSrc = row;
      e.dataTransfer.effectAllowed = "move";
      setTimeout(() => row.style.opacity = "0.4", 0);
    });

    row.addEventListener("dragend", () => {
      row.style.opacity = "";
      rows.forEach(r => r.classList.remove("drag-over"));
    });

    row.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (row !== dragSrc) {
        rows.forEach(r => r.classList.remove("drag-over"));
        row.style.outline = "1px dashed var(--admin-accent)";
      }
    });

    row.addEventListener("dragleave", () => {
      row.style.outline = "";
    });

    row.addEventListener("drop", e => {
      e.preventDefault();
      row.style.outline = "";
      if (dragSrc && dragSrc !== row) {
        // Swap rows in the DOM
        const tbody = productTable;
        const allRows = [...tbody.querySelectorAll("tr[data-id]")];
        const srcIdx = allRows.indexOf(dragSrc);
        const tgtIdx = allRows.indexOf(row);

        if (srcIdx < tgtIdx) {
          tbody.insertBefore(dragSrc, row.nextSibling);
        } else {
          tbody.insertBefore(dragSrc, row);
        }

        // Persist new order
        const newOrder = [...tbody.querySelectorAll("tr[data-id]")].map(r => r.dataset.id);
        reorderProducts(newOrder);
        showAdminToast("Order saved.", "fa-arrows-up-down", "toast-success");
      }
    });
  });
}

/* ============================================================
   7. ADD PRODUCT MODAL
   ============================================================ */
document.getElementById("btnAddProduct")?.addEventListener("click", () => {
  openAddModal();
});

/** Track current edit state */
let currentEditId = null;

/** Open modal in ADD mode */
function openAddModal() {
  currentEditId = null;
  modalTitle.textContent = "Add New Product";
  productForm.reset();
  document.getElementById("hiddenProductId").value = "";

  // Reset pickers to defaults
  setActiveEmoji(EMOJI_OPTIONS[0]);
  setActiveBgClass(BG_OPTIONS[0].cls);
  setActiveBadge("");

  // Reset toggles
  document.getElementById("formVisible").checked = true;
  document.getElementById("formFeatured").checked = false;
  document.getElementById("formOriginalPrice").value = "";

  openModal();
}

/** Open modal in EDIT mode */
function openEditModal(id) {
  const products = getProducts();
  const p = products.find(pr => pr.id === id);
  if (!p) return;

  currentEditId = id;
  modalTitle.textContent = "Edit Product";

  // Populate fields
  document.getElementById("hiddenProductId").value = p.id;
  document.getElementById("formName").value          = p.name;
  document.getElementById("formCategory").value      = p.category;
  document.getElementById("formPrice").value         = p.price;
  document.getElementById("formOriginalPrice").value = p.originalPrice || "";
  document.getElementById("formDescription").value   = p.description;
  document.getElementById("formWaNumber").value      = p.waNumber;
  document.getElementById("formVisible").checked     = p.visible;
  document.getElementById("formFeatured").checked    = p.featured;

  // Pickers
  setActiveEmoji(p.emoji);
  setActiveBgClass(p.bgClass);
  setActiveBadge(p.badge || "");

  openModal();
}

function openModal() {
  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("formName")?.focus(), 250);
}

function closeModal() {
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("btnCloseModal")?.addEventListener("click", closeModal);
document.getElementById("btnCancelModal")?.addEventListener("click", closeModal);

/* ============================================================
   8. EMOJI PICKER
   ============================================================ */
(function buildEmojiPicker() {
  const container = document.getElementById("emojiPicker");
  if (!container) return;

  container.innerHTML = EMOJI_OPTIONS.map(em =>
    `<div class="emoji-opt" data-emoji="${em}" title="${em}">${em}</div>`
  ).join("");

  container.querySelectorAll(".emoji-opt").forEach(opt => {
    opt.addEventListener("click", () => setActiveEmoji(opt.dataset.emoji));
  });
})();

function setActiveEmoji(emoji) {
  document.getElementById("formEmoji").value = emoji;
  document.querySelectorAll(".emoji-opt").forEach(o => {
    o.classList.toggle("active", o.dataset.emoji === emoji);
  });
  // Update hidden preview
  const prev = document.getElementById("emojiPreview");
  if (prev) prev.textContent = emoji;
}

/* ============================================================
   9. COLOR (BG CLASS) PICKER
   ============================================================ */
(function buildColorPicker() {
  const container = document.getElementById("colorPicker");
  if (!container) return;

  container.innerHTML = BG_OPTIONS.map(opt =>
    `<div class="color-opt" data-cls="${opt.cls}" style="background:${opt.hex};"
          title="${opt.label}"></div>`
  ).join("");

  container.querySelectorAll(".color-opt").forEach(opt => {
    opt.addEventListener("click", () => setActiveBgClass(opt.dataset.cls));
  });
})();

function setActiveBgClass(cls) {
  document.getElementById("formBgClass").value = cls;
  document.querySelectorAll(".color-opt").forEach(o => {
    o.classList.toggle("active", o.dataset.cls === cls);
  });
}

/* ============================================================
   10. BADGE PICKER
   ============================================================ */
(function buildBadgePicker() {
  const container = document.getElementById("badgePicker");
  if (!container) return;

  const options = [
    { value: "",     label: "None",       cls: "none-opt" },
    { value: "hot",  label: "Bestseller", cls: "hot-opt"  },
    { value: "new",  label: "New",        cls: "new-opt"  },
    { value: "sale", label: "Sale",       cls: "sale-opt" }
  ];

  container.innerHTML = options.map(o =>
    `<div class="badge-opt ${o.cls}" data-badge="${o.value}">${o.label}</div>`
  ).join("");

  container.querySelectorAll(".badge-opt").forEach(opt => {
    opt.addEventListener("click", () => setActiveBadge(opt.dataset.badge));
  });
})();

function setActiveBadge(badge) {
  document.getElementById("formBadge").value = badge;
  document.querySelectorAll(".badge-opt").forEach(o => {
    o.classList.toggle("active", o.dataset.badge === badge);
  });
}

/* ============================================================
   11. PRODUCT FORM SUBMIT (Save / Update)
   ============================================================ */
productForm?.addEventListener("submit", e => {
  e.preventDefault();

  const name     = document.getElementById("formName").value.trim();
  const category = document.getElementById("formCategory").value;
  const price    = parseFloat(document.getElementById("formPrice").value);
  const origPr   = document.getElementById("formOriginalPrice").value;
  const desc     = document.getElementById("formDescription").value.trim();
  const emoji    = document.getElementById("formEmoji").value;
  const bgClass  = document.getElementById("formBgClass").value;
  const badge    = document.getElementById("formBadge").value;
  const waNum    = document.getElementById("formWaNumber").value.trim();
  const visible  = document.getElementById("formVisible").checked;
  const featured = document.getElementById("formFeatured").checked;

  // Basic validation
  if (!name || !category || isNaN(price) || !desc || !emoji || !bgClass) {
    showAdminToast("Please fill in all required fields.", "fa-circle-exclamation", "toast-error");
    return;
  }

  // Badge label map
  const badgeLabels = { hot: "Bestseller", new: "New", sale: "Sale", "": "" };

  // Category label map
  const catLabel = CATEGORIES.find(c => c.value === category)?.label || category;

  const productData = {
    name,
    category,
    categoryLabel: catLabel,
    emoji,
    bgClass,
    badge,
    badgeLabel: badgeLabels[badge] || "",
    description: desc,
    price,
    originalPrice: origPr ? parseFloat(origPr) : null,
    waNumber: waNum || "919824010313",
    visible,
    featured
  };

  if (currentEditId) {
    // UPDATE existing
    updateProduct(currentEditId, productData);
    showAdminToast(`"${name}" updated successfully.`, "fa-check-circle", "toast-success");
  } else {
    // ADD new
    addProduct(productData);
    showAdminToast(`"${name}" added to your catalog.`, "fa-plus-circle", "toast-success");
  }

  closeModal();
  refreshDashboard();
});

/* ============================================================
   12. DELETE PRODUCT
   ============================================================ */
function confirmDelete(id, name) {
  showConfirmDialog(
    "🗑️",
    "Delete Product",
    `Are you sure you want to delete "<strong>${name}</strong>"? This cannot be undone.`,
    () => {
      deleteProduct(id);
      refreshDashboard();
      showAdminToast(`"${name}" deleted.`, "fa-trash-can", "toast-error");
    }
  );
}

/* ============================================================
   13. RESET TO DEFAULTS
   ============================================================ */
document.getElementById("btnReset")?.addEventListener("click", () => {
  showConfirmDialog(
    "⚠️",
    "Reset All Products",
    "This will restore all products to their original defaults and discard your changes. Are you sure?",
    () => {
      resetToDefaults();
      refreshDashboard();
      showAdminToast("Products reset to defaults.", "fa-rotate-left", "toast-info");
    }
  );
});

/* ============================================================
   14. CONFIRM DIALOG UTILITY
   ============================================================ */
function showConfirmDialog(icon, title, msg, onConfirm) {
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "admin-modal-overlay";
  overlay.style.zIndex = "20001";

  overlay.innerHTML = `
    <div class="confirm-dialog">
      <div class="confirm-icon">${icon}</div>
      <div class="confirm-title">${title}</div>
      <div class="confirm-msg">${msg}</div>
      <div class="confirm-actions">
        <button class="btn-admin btn-admin-secondary" id="confirmCancel">Cancel</button>
        <button class="btn-admin btn-admin-danger"    id="confirmOk">Confirm</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("open")));

  overlay.querySelector("#confirmCancel").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#confirmOk").addEventListener("click", () => {
    overlay.remove();
    onConfirm();
  });
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

/* ============================================================
   15. ADMIN TOAST UTILITY
   ============================================================ */
function showAdminToast(message, icon = "fa-circle-info", type = "toast-info") {
  const existing = document.querySelector(".admin-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}

/* ============================================================
   16. LIVE SEARCH / FILTER IN TABLE
   ============================================================ */
document.getElementById("tableSearch")?.addEventListener("input", function() {
  const q = this.value.toLowerCase();
  productTable?.querySelectorAll("tr[data-id]").forEach(row => {
    const name = row.querySelector(".table-product-name")?.textContent.toLowerCase() || "";
    row.style.display = name.includes(q) ? "" : "none";
  });
});

/* ============================================================
   17. EXPORT PRODUCTS (download JSON backup)
   ============================================================ */
document.getElementById("btnExport")?.addEventListener("click", () => {
  const data = JSON.stringify(getProducts(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `kk-products-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast("Products exported as JSON.", "fa-download", "toast-success");
});

/* ============================================================
   18. IMPORT PRODUCTS (restore from JSON backup)
   ============================================================ */
document.getElementById("btnImport")?.addEventListener("click", () => {
  document.getElementById("importFileInput")?.click();
});

document.getElementById("importFileInput")?.addEventListener("change", function() {
  const file = this.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      showConfirmDialog(
        "📦",
        "Import Products",
        `This will replace your current catalog with ${data.length} products from the file. Continue?`,
        () => {
          saveProducts(data);
          refreshDashboard();
          showAdminToast(`${data.length} products imported.`, "fa-upload", "toast-success");
        }
      );
    } catch (err) {
      showAdminToast("Invalid file. Must be a valid JSON export.", "fa-circle-exclamation", "toast-error");
    }
  };
  reader.readAsText(file);
  this.value = ""; // reset
});

/* ============================================================
   19. SIDEBAR NAVIGATION (tab switching)
   ============================================================ */
document.querySelectorAll(".sidebar-link[data-tab]").forEach(link => {
  link.addEventListener("click", () => {
    const tab = link.dataset.tab;

    // Update active sidebar link
    document.querySelectorAll(".sidebar-link[data-tab]").forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Show/hide panels
    document.querySelectorAll(".admin-panel").forEach(p => p.style.display = "none");
    document.getElementById(`panel-${tab}`)?.style.display !== undefined
      && (document.getElementById(`panel-${tab}`).style.display = "block");

    // Update topbar title
    const titles = {
      products: "Product Manager",
      settings: "Site Settings"
    };
    document.querySelector(".topbar-title").textContent = titles[tab] || "Dashboard";
    document.querySelector(".topbar-subtitle").textContent =
      tab === "products" ? "Add, edit, reorder and manage your catalog" : "Configure site options";
  });
});

/* ============================================================
   20. INIT — run on page load
   ============================================================ */
(function init() {
  if (checkSession()) {
    loginAdmin();
  }
  // Show products panel by default
  document.getElementById("panel-products")?.style;
})();
