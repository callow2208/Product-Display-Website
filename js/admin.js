/* ============================================================
   KNOTTED & KIND — Admin Panel JavaScript (admin.js)
   v2 — Real image uploads replace emoji pickers.

   Image options:
     1. Upload a file from device → stored as base64 in localStorage
     2. Paste any https:// image URL → stored as-is
     3. Paste a Google Drive share link → auto-converted to thumbnail URL
   ============================================================ */

/* ============================================================
   ADMIN CREDENTIALS
   Change username/password here. For production, use server auth.
   ============================================================ */
const ADMIN_CONFIG = {
  username:   "admin",
  password:   "knotted2025",
  sessionKey: "kk_admin_session"
};

/* ============================================================
   CONSTANTS
   ============================================================ */
const CATEGORIES = [
  { value: "baby",        label: "Baby Collection" },
  { value: "accessories", label: "Accessories"     },
  { value: "home",        label: "Home & Fun"      }
];

const MAX_FILE_SIZE_MB = 5; // max upload size before warning

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
const modalOverlay = document.getElementById("modalOverlay");
const modalTitle   = document.getElementById("modalTitle");
const productForm  = document.getElementById("productForm");

/* Image uploader elements */
const imgFileInput   = document.getElementById("imgFileInput");
const imgDropzone    = document.getElementById("imgDropzone");
const imgUrlInput    = document.getElementById("imgUrlInput");
const imgPreviewBox  = document.getElementById("imgPreviewBox");
const imgPreviewEl   = document.getElementById("imgPreview");
const imgFilename    = document.getElementById("imgFilename");
const imgHiddenUrl   = document.getElementById("formImageUrl");

/* ============================================================
   STATE
   ============================================================ */
let currentEditId = null;      // null = add mode, string = edit mode
let currentImageUrl = "";      // working image URL for current modal session

/* ============================================================
   1. SESSION AUTH
   ============================================================ */
function checkSession() {
  return sessionStorage.getItem(ADMIN_CONFIG.sessionKey) === "authenticated";
}

function loginAdmin() {
  sessionStorage.setItem(ADMIN_CONFIG.sessionKey, "authenticated");
  loginScreen.style.display = "none";
  adminApp.classList.add("visible");
  refreshDashboard();
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_CONFIG.sessionKey);
  adminApp.classList.remove("visible");
  loginScreen.style.display = "flex";
  if (usernameInp) usernameInp.value = "";
  if (passwordInp) passwordInp.value = "";
}

/* ============================================================
   2. LOGIN FORM
   ============================================================ */
loginForm?.addEventListener("submit", e => {
  e.preventDefault();
  let valid = true;

  userError.classList.remove("show"); passError.classList.remove("show");
  usernameInp.classList.remove("error"); passwordInp.classList.remove("error");

  if (!usernameInp.value.trim()) {
    userError.textContent = "Username is required."; userError.classList.add("show"); usernameInp.classList.add("error"); valid = false;
  } else if (usernameInp.value.trim() !== ADMIN_CONFIG.username) {
    userError.textContent = "Incorrect username."; userError.classList.add("show"); usernameInp.classList.add("error"); valid = false;
  }

  if (!passwordInp.value) {
    passError.textContent = "Password is required."; passError.classList.add("show"); passwordInp.classList.add("error"); valid = false;
  } else if (usernameInp.value.trim() === ADMIN_CONFIG.username && passwordInp.value !== ADMIN_CONFIG.password) {
    passError.textContent = "Incorrect password."; passError.classList.add("show"); passwordInp.classList.add("error"); valid = false;
  }

  if (valid) loginAdmin();
});

document.getElementById("togglePassword")?.addEventListener("click", function() {
  const isPw = passwordInp.type === "password";
  passwordInp.type = isPw ? "text" : "password";
  this.querySelector("i").className = isPw ? "fa-solid fa-eye-slash" : "fa-solid fa-eye";
});

/* ============================================================
   3. DASHBOARD REFRESH
   ============================================================ */
function refreshDashboard() {
  updateStats();
  renderProductTable();
  // Sync sidebar badge
  const badge = document.getElementById("sidebarProductCount");
  if (badge) badge.textContent = getProducts().length;
}

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
   Now shows a real thumbnail image instead of emoji.
   ============================================================ */
function renderProductTable() {
  const products = getProducts().sort((a, b) => a.sortOrder - b.sortOrder);
  if (!productTable) return;

  if (products.length === 0) {
    productTable.innerHTML = `<tr><td colspan="8"><div class="admin-empty"><i class="fa-solid fa-box-open"></i><p>No products yet. Add your first!</p></div></td></tr>`;
    return;
  }

  productTable.innerHTML = products.map(p => {
    const catPill = getCategoryPill(p.category);
    const src = resolveImageUrl(p.imageUrl);

    // Thumbnail: real image if available, placeholder icon if not
    const thumbHtml = p.imageUrl
      ? `<img class="table-img-thumb" src="${src}" alt="${p.name}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      + `<div class="table-img-thumb-placeholder" style="display:none;"><i class="fa-solid fa-image"></i></div>`
      : `<div class="table-img-thumb-placeholder"><i class="fa-solid fa-image"></i></div>`;

    return `
      <tr data-id="${p.id}" draggable="true">
        <td><span class="sort-handle" title="Drag to reorder"><i class="fa-solid fa-grip-vertical"></i></span></td>
        <td>
          <div class="table-product-preview">
            ${thumbHtml}
            <div>
              <div class="table-product-name">${p.name}</div>
              <div class="table-product-id">${p.id}</div>
            </div>
          </div>
        </td>
        <td>${catPill}</td>
        <td>
          <span style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#d4a9a0;">₹${p.price}</span>
          ${p.originalPrice ? `<span style="font-size:0.75rem;color:#8a7d72;text-decoration:line-through;margin-left:0.3rem;">₹${p.originalPrice}</span>` : ""}
        </td>
        <td>
          <label class="visibility-toggle" title="${p.visible ? 'Click to hide' : 'Click to show'}">
            <input type="checkbox" ${p.visible ? "checked" : ""} onchange="toggleVisibility('${p.id}', this.checked)">
            <span class="toggle-slider"></span>
          </label>
        </td>
        <td>
          <button class="featured-star ${p.featured ? 'starred' : ''}" onclick="toggleFeatured('${p.id}', this)" title="${p.featured ? 'Remove from featured' : 'Mark as featured'}">
            <i class="fa-${p.featured ? 'solid' : 'regular'} fa-star"></i>
          </button>
        </td>
        <td>
          ${p.badge
            ? `<span class="product-badge badge-${p.badge}" style="position:static;display:inline-block;">${p.badgeLabel}</span>`
            : `<span style="color:#8a7d72;font-size:0.78rem;">—</span>`}
        </td>
        <td>
          <div style="display:flex;gap:0.4rem;">
            <button class="btn-action btn-edit" onclick="openEditModal('${p.id}')"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
            <button class="btn-action btn-del"  onclick="confirmDelete('${p.id}', '${escapeHTML(p.name)}')"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </td>
      </tr>`;
  }).join("");

  initDragSort();
}

function getCategoryPill(cat) {
  const map    = { baby: "pill-baby", accessories: "pill-accessories", home: "pill-home" };
  const labels = { baby: "Baby", accessories: "Accessories", home: "Home & Fun" };
  return `<span class="category-pill ${map[cat] || ''}">${labels[cat] || cat}</span>`;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}

/* ============================================================
   5. VISIBILITY & FEATURED TOGGLES
   ============================================================ */
function toggleVisibility(id, visible) {
  updateProduct(id, { visible });
  updateStats();
  showAdminToast(visible ? "Product is now visible." : "Product hidden from shop.", "fa-eye", "toast-info");
}

function toggleFeatured(id, btn) {
  const p = getProducts().find(pr => pr.id === id);
  if (!p) return;
  const newVal = !p.featured;
  updateProduct(id, { featured: newVal });
  btn.classList.toggle("starred", newVal);
  btn.querySelector("i").className = `fa-${newVal ? "solid" : "regular"} fa-star`;
  btn.title = newVal ? "Remove from featured" : "Mark as featured";
  updateStats();
  showAdminToast(newVal ? "Added to featured." : "Removed from featured.", "fa-star", "toast-info");
}

/* ============================================================
   6. DRAG & DROP SORT
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
      productTable?.querySelectorAll("tr").forEach(r => r.style.outline = "");
    });

    row.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (row !== dragSrc) row.style.outline = "1px dashed var(--admin-accent)";
    });

    row.addEventListener("dragleave", () => { row.style.outline = ""; });

    row.addEventListener("drop", e => {
      e.preventDefault();
      row.style.outline = "";
      if (dragSrc && dragSrc !== row) {
        const tbody = productTable;
        const allRows = [...tbody.querySelectorAll("tr[data-id]")];
        const srcIdx = allRows.indexOf(dragSrc);
        const tgtIdx = allRows.indexOf(row);
        if (srcIdx < tgtIdx) tbody.insertBefore(dragSrc, row.nextSibling);
        else tbody.insertBefore(dragSrc, row);
        const newOrder = [...tbody.querySelectorAll("tr[data-id]")].map(r => r.dataset.id);
        reorderProducts(newOrder);
        showAdminToast("Order saved.", "fa-arrows-up-down", "toast-success");
      }
    });
  });
}

/* ============================================================
   7. MODAL — OPEN / CLOSE
   ============================================================ */
document.getElementById("btnAddProduct")?.addEventListener("click", openAddModal);

modalOverlay?.addEventListener("click", e => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById("btnCloseModal")?.addEventListener("click",  closeModal);
document.getElementById("btnCancelModal")?.addEventListener("click", closeModal);

function openAddModal() {
  currentEditId = null;
  modalTitle.textContent = "Add New Product";
  productForm?.reset();
  document.getElementById("hiddenProductId").value = "";
  document.getElementById("formVisible").checked  = true;
  document.getElementById("formFeatured").checked = false;
  setActiveBadge("");
  resetImagePicker();
  openModal();
}

function openEditModal(id) {
  const p = getProducts().find(pr => pr.id === id);
  if (!p) return;

  currentEditId = id;
  modalTitle.textContent = "Edit Product";

  document.getElementById("hiddenProductId").value    = p.id;
  document.getElementById("formName").value           = p.name;
  document.getElementById("formCategory").value       = p.category;
  document.getElementById("formPrice").value          = p.price;
  document.getElementById("formOriginalPrice").value  = p.originalPrice || "";
  document.getElementById("formDescription").value    = p.description;
  document.getElementById("formWaNumber").value       = p.waNumber || "";
  document.getElementById("formVisible").checked      = p.visible;
  document.getElementById("formFeatured").checked     = p.featured;

  setActiveBadge(p.badge || "");

  // Pre-fill the image
  if (p.imageUrl) {
    setImagePreview(p.imageUrl, p.imageUrl.startsWith("data:") ? "Uploaded file" : p.imageUrl);
  } else {
    resetImagePicker();
  }

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
  currentImageUrl = "";
}

/* ============================================================
   8. IMAGE PICKER — Tab switching (Upload vs URL/Drive)
   ============================================================ */
document.querySelectorAll(".img-tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".img-tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".img-tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.panel)?.classList.add("active");
  });
});

/* ============================================================
   9. IMAGE UPLOAD — File input / Drop zone
   ============================================================ */

/** Handle files dropped on the dropzone */
imgDropzone?.addEventListener("dragover", e => {
  e.preventDefault();
  imgDropzone.classList.add("drag-over");
});

imgDropzone?.addEventListener("dragleave", () => imgDropzone.classList.remove("drag-over"));

imgDropzone?.addEventListener("drop", e => {
  e.preventDefault();
  imgDropzone.classList.remove("drag-over");
  const file = e.dataTransfer.files?.[0];
  if (file) handleFileUpload(file);
});

/** File input change */
imgFileInput?.addEventListener("change", () => {
  const file = imgFileInput.files?.[0];
  if (file) handleFileUpload(file);
});

/**
 * Convert an image File to base64 and set it as the product image.
 * Warns but still allows files over MAX_FILE_SIZE_MB.
 */
function handleFileUpload(file) {
  if (!file.type.startsWith("image/")) {
    showAdminToast("Please select an image file (JPG, PNG, WEBP, etc.)", "fa-circle-exclamation", "toast-error");
    return;
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    showAdminToast(
      `Image is ${sizeMB.toFixed(1)} MB. Large files increase storage use. Consider compressing it.`,
      "fa-triangle-exclamation", "toast-info"
    );
  }

  const reader = new FileReader();
  reader.onload = e => {
    setImagePreview(e.target.result, file.name);
    showAdminToast("Image uploaded successfully.", "fa-check-circle", "toast-success");
  };
  reader.onerror = () => showAdminToast("Failed to read file.", "fa-circle-exclamation", "toast-error");
  reader.readAsDataURL(file);
}

/* ============================================================
   10. IMAGE URL / GOOGLE DRIVE LINK
   ============================================================ */
document.getElementById("btnApplyUrl")?.addEventListener("click", applyUrlImage);

imgUrlInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") { e.preventDefault(); applyUrlImage(); }
});

function applyUrlImage() {
  const raw = imgUrlInput?.value.trim();
  if (!raw) return;

  // Convert Drive links automatically
  const resolved = convertDriveUrl(raw);

  setImagePreview(resolved, resolved);
  showAdminToast("Image URL applied.", "fa-link", "toast-success");
}

/* ============================================================
   11. IMAGE PREVIEW HELPERS
   ============================================================ */

/**
 * Shows the image preview box with the given src and filename label.
 * Also stores the URL in the hidden form field.
 */
function setImagePreview(src, label) {
  currentImageUrl = src;
  imgHiddenUrl.value = src;

  imgPreviewEl.src = src;
  imgPreviewEl.onerror = () => {
    showAdminToast("Could not load image. Check the URL or file.", "fa-circle-exclamation", "toast-error");
    resetImagePicker();
  };

  // Shorten label for display
  const shortLabel = label.length > 60 ? label.slice(0, 57) + "..." : label;
  if (imgFilename) imgFilename.textContent = shortLabel;

  imgPreviewBox?.classList.add("has-image");
}

/** Clear the image picker back to empty state */
function resetImagePicker() {
  currentImageUrl = "";
  imgHiddenUrl.value = "";
  if (imgPreviewEl) imgPreviewEl.src = "";
  if (imgFilename)  imgFilename.textContent = "";
  imgPreviewBox?.classList.remove("has-image");
  if (imgFileInput) imgFileInput.value = "";
  if (imgUrlInput)  imgUrlInput.value  = "";
}

/** "Remove image" button inside the preview box */
document.getElementById("btnRemoveImg")?.addEventListener("click", () => {
  resetImagePicker();
  showAdminToast("Image removed.", "fa-trash-can", "toast-info");
});

/* ============================================================
   12. BADGE PICKER
   ============================================================ */
(function buildBadgePicker() {
  const container = document.getElementById("badgePicker");
  if (!container) return;

  const opts = [
    { value: "",     label: "None",       cls: "none-opt" },
    { value: "hot",  label: "Bestseller", cls: "hot-opt"  },
    { value: "new",  label: "New",        cls: "new-opt"  },
    { value: "sale", label: "Sale",       cls: "sale-opt" }
  ];

  container.innerHTML = opts.map(o =>
    `<div class="badge-opt ${o.cls}" data-badge="${o.value}">${o.label}</div>`
  ).join("");

  container.querySelectorAll(".badge-opt").forEach(opt =>
    opt.addEventListener("click", () => setActiveBadge(opt.dataset.badge))
  );
})();

function setActiveBadge(badge) {
  document.getElementById("formBadge").value = badge;
  document.querySelectorAll(".badge-opt").forEach(o =>
    o.classList.toggle("active", o.dataset.badge === badge)
  );
}

/* ============================================================
   13. PRODUCT FORM SUBMIT
   ============================================================ */
productForm?.addEventListener("submit", e => {
  e.preventDefault();

  const name      = document.getElementById("formName").value.trim();
  const category  = document.getElementById("formCategory").value;
  const price     = parseFloat(document.getElementById("formPrice").value);
  const origPr    = document.getElementById("formOriginalPrice").value;
  const desc      = document.getElementById("formDescription").value.trim();
  const badge     = document.getElementById("formBadge").value;
  const waNum     = document.getElementById("formWaNumber").value.trim();
  const visible   = document.getElementById("formVisible").checked;
  const featured  = document.getElementById("formFeatured").checked;
  const imageUrl  = imgHiddenUrl?.value || "";

  // Validation
  if (!name || !category || isNaN(price) || price < 0 || !desc) {
    showAdminToast("Please fill in all required fields.", "fa-circle-exclamation", "toast-error");
    return;
  }

  const badgeLabels = { hot: "Bestseller", new: "New", sale: "Sale", "": "" };
  const catLabel    = CATEGORIES.find(c => c.value === category)?.label || category;

  const productData = {
    name,
    category,
    categoryLabel: catLabel,
    imageUrl,
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
    updateProduct(currentEditId, productData);
    showAdminToast(`"${name}" updated.`, "fa-check-circle", "toast-success");
  } else {
    addProduct(productData);
    showAdminToast(`"${name}" added to catalog.`, "fa-plus-circle", "toast-success");
  }

  closeModal();
  refreshDashboard();
});

/* ============================================================
   14. DELETE PRODUCT
   ============================================================ */
function confirmDelete(id, name) {
  showConfirmDialog("🗑️", "Delete Product",
    `Are you sure you want to delete "<strong>${name}</strong>"? This cannot be undone.`,
    () => {
      deleteProduct(id);
      refreshDashboard();
      showAdminToast(`"${name}" deleted.`, "fa-trash-can", "toast-error");
    }
  );
}

/* ============================================================
   15. RESET TO DEFAULTS
   ============================================================ */
document.getElementById("btnReset")?.addEventListener("click", () => {
  showConfirmDialog("⚠️", "Reset All Products",
    "This will restore all products to their original defaults and remove any uploaded images. Are you sure?",
    () => {
      resetToDefaults();
      refreshDashboard();
      showAdminToast("Products reset to defaults.", "fa-rotate-left", "toast-info");
    }
  );
});

/* ============================================================
   16. CONFIRM DIALOG UTILITY
   ============================================================ */
function showConfirmDialog(icon, title, msg, onConfirm) {
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
        <button class="btn-admin btn-admin-danger" id="confirmOk">Confirm</button>
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => requestAnimationFrame(() => overlay.classList.add("open")));

  overlay.querySelector("#confirmCancel").addEventListener("click", () => overlay.remove());
  overlay.querySelector("#confirmOk").addEventListener("click", () => { overlay.remove(); onConfirm(); });
  overlay.addEventListener("click", e => { if (e.target === overlay) overlay.remove(); });
}

/* ============================================================
   17. ADMIN TOAST UTILITY
   ============================================================ */
function showAdminToast(message, icon = "fa-circle-info", type = "toast-info") {
  document.querySelector(".admin-toast")?.remove();
  const toast = document.createElement("div");
  toast.className = `admin-toast ${type}`;
  toast.innerHTML = `<i class="fa-solid ${icon}"></i> ${message}`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => requestAnimationFrame(() => toast.classList.add("show")));
  setTimeout(() => { toast.classList.remove("show"); setTimeout(() => toast.remove(), 400); }, 3200);
}

/* ============================================================
   18. TABLE SEARCH
   ============================================================ */
document.getElementById("tableSearch")?.addEventListener("input", function() {
  const q = this.value.toLowerCase();
  productTable?.querySelectorAll("tr[data-id]").forEach(row => {
    const name = row.querySelector(".table-product-name")?.textContent.toLowerCase() || "";
    row.style.display = name.includes(q) ? "" : "none";
  });
});

/* ============================================================
   19. EXPORT (JSON backup)
   ============================================================ */
document.getElementById("btnExport")?.addEventListener("click", () => {
  const data = JSON.stringify(getProducts(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href: url, download: `kk-products-${new Date().toISOString().slice(0,10)}.json` });
  a.click();
  URL.revokeObjectURL(url);
  showAdminToast("Products exported as JSON.", "fa-download", "toast-success");
});

/* ============================================================
   20. IMPORT (JSON restore)
   ============================================================ */
document.getElementById("btnImport")?.addEventListener("click", () => document.getElementById("importFileInput")?.click());

document.getElementById("importFileInput")?.addEventListener("change", function() {
  const file = this.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) throw new Error("Invalid format");
      showConfirmDialog("📦", "Import Products",
        `Replace your current catalog with ${data.length} products from this file?`,
        () => { saveProducts(data); refreshDashboard(); showAdminToast(`${data.length} products imported.`, "fa-upload", "toast-success"); }
      );
    } catch {
      showAdminToast("Invalid file. Must be a valid JSON export.", "fa-circle-exclamation", "toast-error");
    }
  };
  reader.readAsText(file);
  this.value = "";
});

/* ============================================================
   21. LOGOUT
   ============================================================ */
document.getElementById("btnLogout")?.addEventListener("click", () => {
  showConfirmDialog("🚪", "Log Out", "Are you sure you want to log out?", logoutAdmin);
});

/* ============================================================
   22. INIT
   ============================================================ */
(function init() {
  if (checkSession()) loginAdmin();
})();
