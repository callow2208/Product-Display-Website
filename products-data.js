/* ============================================================
   KNOTTED & KIND — Products Data Layer (products-data.js)
   
   This file manages all product data using localStorage.
   It is the single source of truth for products — used by
   both products.html (display) and admin.html (editing).
   ============================================================ */

/* ============================================================
   DEFAULT PRODUCT CATALOG
   These are the factory defaults loaded if no admin edits exist.
   ============================================================ */
const DEFAULT_PRODUCTS = [
  {
    id: "prod_001",
    name: "Baby Clothes",
    category: "baby",
    categoryLabel: "Baby Collection",
    emoji: "👶",
    bgClass: "bg-blush",
    badge: "hot",
    badgeLabel: "Bestseller",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim.",
    price: 450,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 1
  },
  {
    id: "prod_002",
    name: "Baby Socks",
    category: "baby",
    categoryLabel: "Baby Collection",
    emoji: "🧦",
    bgClass: "bg-sage",
    badge: "new",
    badgeLabel: "New",
    description: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis.",
    price: 150,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 2
  },
  {
    id: "prod_003",
    name: "Baby Caps",
    category: "baby",
    categoryLabel: "Baby Collection",
    emoji: "🎩",
    bgClass: "bg-honey",
    badge: "hot",
    badgeLabel: "Popular",
    description: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur.",
    price: 200,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 3
  },
  {
    id: "prod_004",
    name: "Hairbands",
    category: "accessories",
    categoryLabel: "Accessories",
    emoji: "🎀",
    bgClass: "bg-lilac",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    price: 120,
    originalPrice: 160,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 4
  },
  {
    id: "prod_005",
    name: "Keychains",
    category: "home",
    categoryLabel: "Home & Fun",
    emoji: "🔑",
    bgClass: "bg-sky",
    badge: "",
    badgeLabel: "",
    description: "Lorem ipsum dolor sit amet consectetur. Pellentesque habitant morbi tristique senectus et netus malesuada fames turpis.",
    price: 80,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 5
  },
  {
    id: "prod_006",
    name: "Cable Clips",
    category: "home",
    categoryLabel: "Home & Fun",
    emoji: "📎",
    bgClass: "bg-mint",
    badge: "new",
    badgeLabel: "New",
    description: "Ut enim ad minim veniam quis nostrud exercitation laboris nisi aliquip commodo consequat aute irure dolor.",
    price: 60,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 6
  },
  {
    id: "prod_007",
    name: "Crochet Rubber Bands",
    category: "accessories",
    categoryLabel: "Accessories",
    emoji: "🌸",
    bgClass: "bg-rose",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Duis aute irure dolor reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur sint occaecat.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 7
  }
];

/* ============================================================
   STORAGE KEY — all data lives under this localStorage key
   ============================================================ */
const STORAGE_KEY = "kk_products_v1";

/* ============================================================
   PUBLIC API
   ============================================================ */

/**
 * Returns the full product list from localStorage.
 * If no data exists, seeds with DEFAULT_PRODUCTS and returns those.
 */
function getProducts() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    saveProducts(DEFAULT_PRODUCTS);
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)); // deep clone
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn("Product data corrupted, resetting to defaults.", e);
    saveProducts(DEFAULT_PRODUCTS);
    return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
  }
}

/**
 * Saves the full product array to localStorage.
 * @param {Array} products
 */
function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/**
 * Returns only visible products, sorted by sortOrder.
 */
function getVisibleProducts() {
  return getProducts()
    .filter(p => p.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Returns visible featured products (for homepage preview).
 */
function getFeaturedProducts() {
  return getVisibleProducts().filter(p => p.featured);
}

/**
 * Adds a brand-new product.
 * @param {Object} productData
 */
function addProduct(productData) {
  const products = getProducts();
  const newProduct = {
    ...productData,
    id: "prod_" + Date.now(),
    sortOrder: products.length + 1,
    visible: true
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

/**
 * Updates an existing product by ID.
 * @param {string} id
 * @param {Object} updates  - Partial object of fields to update
 */
function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return true;
}

/**
 * Deletes a product by ID.
 * @param {string} id
 */
function deleteProduct(id) {
  const products = getProducts().filter(p => p.id !== id);
  saveProducts(products);
}

/**
 * Reorders products — receives an array of IDs in new order.
 * @param {string[]} orderedIds
 */
function reorderProducts(orderedIds) {
  const products = getProducts();
  orderedIds.forEach((id, idx) => {
    const product = products.find(p => p.id === id);
    if (product) product.sortOrder = idx + 1;
  });
  saveProducts(products);
}

/**
 * Resets all products back to the factory defaults.
 */
function resetToDefaults() {
  saveProducts(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
}

/* ============================================================
   CARD RENDERER
   Generates the HTML string for one product card.
   Used by both products.html and index.html (featured section).
   @param {Object}  product
   @param {boolean} isLargeCard  - Featured cards are slightly larger
   ============================================================ */
function renderProductCard(product, isLargeCard = false) {
  const { id, name, categoryLabel, emoji, bgClass, badge, badgeLabel,
          description, price, originalPrice, waNumber } = product;

  const waMsg   = encodeURIComponent(`Hello, I would like to order ${name}`);
  const waLink  = `https://wa.me/${waNumber}?text=${waMsg}`;

  const badgeHtml = badge
    ? `<span class="product-badge badge-${badge}">${badgeLabel}</span>`
    : "";

  const origHtml = originalPrice
    ? `<span class="price-original">₹${originalPrice}</span>`
    : "";

  return `
    <div class="product-card" data-id="${id}">
      <div class="product-img ${bgClass}">
        <span class="emoji-display" style="font-size:${isLargeCard ? '5rem' : '4.5rem'};">${emoji}</span>
        ${badgeHtml}
        <button class="btn-wishlist" aria-label="Wishlist">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <div class="product-body">
        <p class="product-category">${categoryLabel}</p>
        <h5 class="product-name">${name}</h5>
        <p class="product-desc">${description}</p>
        <div class="product-footer">
          <div>
            <span class="product-price">₹${price}</span>
            ${origHtml}
          </div>
          <a href="${waLink}" class="btn-wa" target="_blank" rel="noopener">
            <i class="fa-brands fa-whatsapp"></i> Order
          </a>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   WISHLIST TOGGLE — attaches to all .btn-wishlist buttons
   ============================================================ */
function initWishlistButtons() {
  document.querySelectorAll(".btn-wishlist").forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();
      const icon = btn.querySelector("i");
      icon.classList.toggle("fa-regular");
      icon.classList.toggle("fa-solid");
      btn.classList.toggle("active");
    });
  });
}
