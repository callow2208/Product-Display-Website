/* ============================================================
   KNOTTED & KIND — Products Data Layer (products-data.js)
   v2 — Real product images replace emoji.
   
   imageUrl field accepts:
     • base64 data URI   — from local file upload in admin
     • https:// URL      — any direct image link
     • Google Drive URL  — auto-converted to thumbnail embed
   ============================================================ */

/* ============================================================
   1. PLACEHOLDER SVG (shown when no image is set)
   ============================================================ */
const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23ede6d9'/%3E%3Ccircle cx='200' cy='170' r='48' fill='none' stroke='%23c4b4a8' stroke-width='5'/%3E%3Cpath d='M176 170 l24-24 l24 24' fill='none' stroke='%23c4b4a8' stroke-width='5' stroke-linecap='round'/%3E%3Cline x1='200' y1='146' x2='200' y2='194' stroke='%23c4b4a8' stroke-width='5' stroke-linecap='round'/%3E%3Crect x='130' y='240' width='140' height='8' rx='4' fill='%23c4b4a8'/%3E%3Crect x='155' y='260' width='90' height='6' rx='3' fill='%23d4c8c0'/%3E%3C/svg%3E";

/* ============================================================
   2. GOOGLE DRIVE URL CONVERTER
   Converts any Drive share link → direct thumbnail URL.
   
   Handles these patterns:
   • https://drive.google.com/file/d/FILE_ID/view?usp=sharing
   • https://drive.google.com/open?id=FILE_ID
   • https://drive.google.com/uc?id=FILE_ID
   ============================================================ */
function convertDriveUrl(url) {
  if (!url || typeof url !== "string") return url;

  // Already a direct thumbnail URL — pass through unchanged
  if (url.includes("drive.google.com/thumbnail") ||
      url.includes("drive.google.com/uc?export=view")) return url;

  // Pattern 1: /file/d/FILE_ID/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) {
    return `https://drive.google.com/thumbnail?id=${fileMatch[1]}&sz=w800`;
  }

  // Pattern 2: ?id=FILE_ID  or  &id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) {
    return `https://drive.google.com/thumbnail?id=${idMatch[1]}&sz=w800`;
  }

  // Pattern 3: /open?id=FILE_ID
  const openMatch = url.match(/\/open\?id=([a-zA-Z0-9_-]+)/);
  if (openMatch) {
    return `https://drive.google.com/thumbnail?id=${openMatch[1]}&sz=w800`;
  }

  return url; // Not a Drive URL — return as-is
}

/* ============================================================
   3. IMAGE URL RESOLVER
   Applies Drive conversion and falls back to placeholder.
   ============================================================ */
function resolveImageUrl(imageUrl) {
  if (!imageUrl) return PLACEHOLDER_IMG;

  const cleaned = imageUrl.trim();

  // empty
  if (cleaned === "") return PLACEHOLDER_IMG;

  // local images
  if (cleaned.startsWith("./") || cleaned.startsWith("/")) {
    return cleaned;
  }

  // drive or external url
  return convertDriveUrl(cleaned) || PLACEHOLDER_IMG;
}

/* ============================================================
   4. DEFAULT PRODUCT CATALOG
   imageUrl is empty by default — upload via admin panel.
   ============================================================ */
const DEFAULT_PRODUCTS = [
  {
    id: "prod_001",
    name: "Leafy Crochet Cable Protector",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "./img/home-img1.png",
    badge: "hot",
    badgeLabel: "Bestseller",
    description: "Protect your charger cables in style with this handmade crochet cable protector. Designed with delicate leaf details, it prevents cable bending and adds a charming handmade touch to your workspace or bedside.",
    price: 450,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 1
  },
  {
    id: "prod_002",
    name: "Boho Crochet Tie Headband",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "./img/home-img2.png",
    badge: "new",
    badgeLabel: "New",
    description: "Add a soft handmade touch to your everyday hairstyle with this crochet tie headband. Lightweight, comfortable, and beautifully crafted, it’s perfect for casual outfits, summer looks, or cottagecore styling.",
    price: 150,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 2
  },
  {
    id: "prod_003",
    name: "Floral Crochet Hair Clip",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "hot",
    badgeLabel: "Popular",
    description: "A delicate crochet flower hair clip that adds elegance to any hairstyle. Perfect for casual wear, festive looks, or special occasions, this handmade accessory brings a natural and artistic charm to your hair.",
    price: 200,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 3
  },
  {
    id: "prod_004",
    name: "Traditional Crochet Laccha Dori",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Inspired by traditional hair adornments, this crochet laccha dori beautifully decorates braids and long hairstyles. Featuring colorful crochet flowers and tassels, it’s perfect for festive outfits and ethnic styling.",
    price: 120,
    originalPrice: 160,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 4
  },
  {
    id: "prod_005",
    name: "Vintage Crochet Head Scarf",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "",
    badgeLabel: "",
    description: "A beautifully handcrafted crochet head scarf designed to elevate your everyday style. Soft, breathable, and lightweight, it adds a vintage charm while keeping your hair neatly styled.",
    price: 80,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 5
  },
  {
    id: "prod_006",
    name: "Flower Hair Rubber Band",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "new",
    badgeLabel: "New",
    description: "A cute crochet flower hair tie that instantly brightens your hairstyle. Soft, stretchy, and handmade with care, it’s perfect for ponytails, buns, or everyday styling.",
    price: 60,
    originalPrice: null,
    waNumber: "919824010313",
    visible: true,
    featured: false,
    sortOrder: 6
  },
  {
    id: "prod_007",
    name: "Aparajita Flower",
    category: "decor",
    categoryLabel: "Decor",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Inspired by the beautiful Aparajita flower, this crochet piece can be used as a hair accessory or decorative accent. Its vibrant handmade design adds a unique artistic touch wherever it is used.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 7
  },
  {
    id: "prod_008",
    name: "Crochet Hanging Flower Basket Decor",
    category: "decor",
    categoryLabel: "Decor",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Inspired by the beautiful Aparajita flower, this crochet piece can be used as a hair accessory or decorative accent. Its vibrant handmade design adds a unique artistic touch wherever it is used.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 8
  },
  {
    id: "prod_009",
    name: "Crochet Phone Sock Sleeve",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Protect your phone with this soft crochet phone sleeve. Designed like a cozy sock, it keeps your phone safe from scratches while adding a stylish handmade touch.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 9
  },
  {
    id: "prod_010",
    name: "Crochet Rose Hair Clip",
    category: "accessories",
    categoryLabel: "Accessories",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "A beautifully handcrafted crochet rose hair clip that adds elegance and charm to any hairstyle. Perfect for weddings, festive occasions, or everyday styling.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 10
  },
  {
    id: "prod_011",
    name: "Crochet Serving Mat",
    category: "decor",
    categoryLabel: "Decor",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "Add a handmade charm to your dining table with this crochet serving mat. Designed to be placed under serving bowls or platters, it protects surfaces while enhancing your table décor.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 11
  },
  {
    id: "prod_012",
    name: "Crochet Flower Table Doily",
    category: "decor",
    categoryLabel: "Decor",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "A beautifully designed crochet flower table doily that enhances the elegance of your dining or coffee table. The intricate floral pattern adds a soft handmade touch to your home décor.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 12
  },
  {
    id: "prod_013",
    name: "Crochet Star Lace Table Doily",
    category: "decor",
    categoryLabel: "Decor",
    imageUrl: "",
    badge: "sale",
    badgeLabel: "Sale",
    description: "This delicate crochet star lace doily adds charm and elegance to any table setting. Perfect for coffee tables, side tables, or decorative displays.",
    price: 90,
    originalPrice: 120,
    waNumber: "919824010313",
    visible: true,
    featured: true,
    sortOrder: 13
  }
];

/* ============================================================
   5. STORAGE KEY  (v2 — avoids stale emoji-era data conflicts)
   ============================================================ */
const STORAGE_KEY = "kk_products_v2";

/* ============================================================
   6. CRUD API
   ============================================================ */

/** Return all products from localStorage (seeds defaults on first run) */
// function getProducts() {
//   const raw = localStorage.getItem(STORAGE_KEY);
//   if (!raw) {
//     saveProducts(DEFAULT_PRODUCTS);
//     return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
//   }
//   try {
//     return JSON.parse(raw);
//   } catch (e) {
//     console.warn("Product data corrupted, resetting to defaults.", e);
//     saveProducts(DEFAULT_PRODUCTS);
//     return JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
//   }
// }

/** Persist full product array */
// function saveProducts(products) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
// }

// Fetch Products
async function getProducts() {
  try {
    const response = await fetch('products.json');
    return await response.json();
  } catch (e) {
    console.warn('JSON unavailable, using hardcoded defaults');
    return window.DEFAULT_PRODUCTS;  // Your static fallback
  }
}

// Make other functions async too
async function getFeaturedProducts() {
  return (await getProducts()).filter(p => p.featured).slice(0,4);
}


/** Visible products sorted by sortOrder */
function getVisibleProducts() {
  return window.DEFAULT_PRODUCTS
    .filter(p => p.visible)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Featured visible products (for homepage) */
function getFeaturedProducts() {
  return window.DEFAULT_PRODUCTS
  .filter(p => p.featured)
  .slice(0, 4);
}

/** Add a new product */
function addProduct(productData) {
  const products = getProducts();
  const newProduct = {
    ...productData,
    id: "prod_" + Date.now(),
    sortOrder: products.length + 1,
    visible: productData.visible !== undefined ? productData.visible : true
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

/** Update product fields by ID */
function updateProduct(id, updates) {
  const products = getProducts();
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) return false;
  products[idx] = { ...products[idx], ...updates };
  saveProducts(products);
  return true;
}

/** Delete product by ID */
function deleteProduct(id) {
  saveProducts(getProducts().filter(p => p.id !== id));
}

/** Save a new drag-drop sort order from an array of IDs */
function reorderProducts(orderedIds) {
  const products = getProducts();
  orderedIds.forEach((id, idx) => {
    const p = products.find(pr => pr.id === id);
    if (p) p.sortOrder = idx + 1;
  });
  saveProducts(products);
}

/** Wipe everything and reload factory defaults */
function resetToDefaults() {
  saveProducts(JSON.parse(JSON.stringify(DEFAULT_PRODUCTS)));
}

/* ============================================================
   7. CARD RENDERER
   Renders one product card HTML string with a real <img>.
   Used by products.html (shop grid) and index.html (featured).
   ============================================================ */
function renderProductCard(product) {
  const {
    id, name, categoryLabel, imageUrl,
    badge, badgeLabel, description,
    price, originalPrice, waNumber
  } = product;

  const src    = resolveImageUrl(imageUrl);
  const waMsg  = encodeURIComponent(`Hello, I would like to order ${name}`);
  const waLink = `https://wa.me/${waNumber || "919824010313"}?text=${waMsg}`;

  const badgeHtml = badge
    ? `<span class="product-badge badge-${badge}">${badgeLabel}</span>`
    : "";

  const origHtml = originalPrice
    ? `<span class="price-original">₹${originalPrice}</span>`
    : "";

  /* Note: onerror swaps broken image src for the placeholder inline SVG */
  return `
    <div class="product-card" data-id="${id}">
      <div class="product-img-wrap">
        <img
          src="${src}"
          alt="${name}"
          class="product-photo"
          loading="lazy"
          onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'"
        />
        ${badgeHtml}
        <button class="btn-wishlist" aria-label="Add to wishlist">
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
   8. WISHLIST BUTTONS — attach toggle listeners
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

// New render function WITHOUT wishlist button
function renderProductCardNoWishlist(product) {
  const { id, name, categoryLabel, imageUrl, badge, badgeLabel, description, price, originalPrice, waNumber } = product;
  const src = resolveImageUrl(imageUrl);
  const waMsg = encodeURIComponent(`Hello, I would like to order ${name}`);
  const waLink = `https://wa.me/${waNumber || "919824010313"}?text=${waMsg}`;
  const badgeHtml = badge ? `<span class="product-badge badge-${badge}">${badgeLabel}</span>` : "";
  const origHtml = originalPrice ? `<span class="price-original">₹${originalPrice}</span>` : "";

  return `
    <div class="product-card" data-id="${id}">
      <div class="product-img-wrap">
        <img src="${src}" alt="${name}" class="product-photo" loading="lazy" 
             onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'" />
        ${badgeHtml}
        <!-- Wishlist button REMOVED -->
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

window.DEFAULT_PRODUCTS = [
  {
    "id": "prod_001",
    "name": "Baby Clothes",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/1.png",
    "badge": "hot",
    "badgeLabel": "Bestseller",
    "description": "Soft and comfortable baby clothes perfect for everyday wear.",
    "price": 450,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 1
  },
  {
    "id": "prod_002", 
    "name": "Baby Socks",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/2.png",
    "badge": "new",
    "badgeLabel": "New",
    "description": "Cozy baby socks with fun patterns for little feet.",
    "price": 150,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 2
  },
  {
    "id": "prod_003",
    "name": "Baby Bib",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/3.png",
    "badge": "",
    "badgeLabel": "",
    "description": "Practical and stylish baby bib for mealtime messes.",
    "price": 250,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": false,
    "sortOrder": 3
  },
  {
    "id": "prod_004",
    "name": "Baby Hat",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/4.png",
    "badge": "sale",
    "badgeLabel": "Sale",
    "description": "Adorable knitted baby hat for all seasons.",
    "price": 350,
    "originalPrice": 450,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 4
  },
  {
    "id": "prod_005", 
    "name": "Baby Mittens",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/5.png",
    "badge": "hot",
    "badgeLabel": "Popular",
    "description": "Soft mittens to keep baby's hands warm and scratch-free.",
    "price": 120,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 5
  },
  {
    "id": "prod_006",
    "name": "Baby Blanket",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/6.png",
    "badge": "new",
    "badgeLabel": "New Arrival",
    "description": "Luxuriously soft blanket for your little one.",
    "price": 800,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": false,
    "sortOrder": 6
  },
  {
    "id": "prod_007",
    "name": "Baby Onesie",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/7.png",
    "badge": "",
    "badgeLabel": "",
    "description": "Comfortable cotton onesie with cute prints.",
    "price": 400,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 7
  },
  {
    "id": "prod_008", 
    "name": "Baby Booties",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/8.png",
    "badge": "sale",
    "badgeLabel": "20% Off",
    "description": "Handcrafted booties for tiny toes.",
    "price": 200,
    "originalPrice": 250,
    "waNumber": "919824010313",
    "visible": true,
    "featured": true,
    "sortOrder": 8
  },
  {
    "id": "prod_009",
    "name": "Baby Burp Cloth",
    "category": "baby",
    "categoryLabel": "Baby Collection",
    "imageUrl": "./img/9.png",
    "badge": "hot",
    "badgeLabel": "Bestseller",
    "description": "Super absorbent burp cloths for happy parenting.",
    "price": 180,
    "originalPrice": null,
    "waNumber": "919824010313",
    "visible": true,
    "featured": false,
    "sortOrder": 9
  }
];

