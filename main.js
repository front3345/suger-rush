const API_URL = "https://devsapihub.com/api-fast-food";
const DEAL_DISCOUNT = 0.15;
const DEALS_COUNT = 4;

const productsContainer = document.getElementById("products-container");
const dealsContainer = document.getElementById("deals-container");
const searchInput = document.getElementById("search-input");
const categoryFilter = document.getElementById("category-filter");
const sortFilter = document.getElementById("sort-filter");
const resultsCount = document.getElementById("results-count");

const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartDrawer = document.getElementById("cart-drawer");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const clearCartButton = document.getElementById("clear-cart");

const wishlistButton = document.getElementById("wishlist-nav-btn");
const wishlistCount = document.getElementById("wishlist-count");
const wishlistDrawer = document.getElementById("wishlist-drawer");
const closeWishlistButton = document.getElementById("close-wishlist");
const wishlistItems = document.getElementById("wishlist-items");
const clearWishlistButton = document.getElementById("clear-wishlist");

const themeToggleBtn = document.getElementById("theme-toggle-btn");

const productModal = document.getElementById("product-modal");
const closeModalButton = document.getElementById("close-product-modal");
const modalAddButton = document.getElementById("modal-add-to-cart");

const authModal = document.getElementById("auth-modal");
const closeAuthButton = document.getElementById("close-auth-modal");
const authNavBtn = document.getElementById("auth-nav-btn");
const loginView = document.getElementById("login-view");
const registerView = document.getElementById("register-view");
const switchToRegister = document.getElementById("switch-to-register");
const switchToLogin = document.getElementById("switch-to-login");
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");
const loginError = document.getElementById("login-error");
const registerError = document.getElementById("register-error");

const starPicker = document.getElementById("star-picker");
const reviewForm = document.getElementById("review-form");
const reviewInput = document.getElementById("review-text");
const modalRatingAvg = document.getElementById("modal-rating-avg");
const modalReviewsCount = document.getElementById("modal-reviews-count");

let allProducts = [];
let cart = loadCart();
let wishlist = loadWishlist();
let selectedProduct = null;
let selectedRating = 5;

let productReviews =
  JSON.parse(localStorage.getItem("sugarRushReviews")) || {};

let toastTimer;

let currentUser =
  JSON.parse(localStorage.getItem("sugarRushCurrentUser")) || null;

const PROMO_CODE = "SUGARRUSH20";
const PROMO_DISCOUNT = 0.20;

let appliedPromo =
  localStorage.getItem("sugarRushPromo") === PROMO_CODE;

const promoInput = document.getElementById("promo-input");
const promoApplyBtn = document.getElementById("promo-apply-btn");
const promoMessage = document.getElementById("promo-message");
const promoRemoveBtn = document.getElementById("promo-remove-btn");
const cartSubtotal = document.getElementById("cart-subtotal");
const cartDiscountRow = document.getElementById("cart-discount-row");
const cartDiscount = document.getElementById("cart-discount");

const FREE_DELIVERY_AT = 50;

const freeDelivery = document.getElementById("free-delivery");
const freeDeliveryText = document.getElementById("free-delivery-text");
const freeDeliveryFill = document.getElementById("free-delivery-fill");

const bnavCartBtn = document.getElementById("bnav-cart");
const bnavWishBtn = document.getElementById("bnav-wishlist");
const bnavCart = document.getElementById("bnav-cart-count");
const bnavWish = document.getElementById("bnav-wishlist-count");

const orderSuccess = document.getElementById("order-success");

document.getElementById("current-year").textContent =
  new Date().getFullYear();


// ==============================
// Theme Management
// ==============================

function initTheme() {
  const savedTheme =
    localStorage.getItem("sugarRushTheme") || "light";

  document.documentElement.setAttribute("data-theme", savedTheme);

  themeToggleBtn.textContent =
    savedTheme === "dark" ? "🌙" : "☀️";
}

themeToggleBtn.addEventListener("click", () => {
  const currentTheme =
    document.documentElement.getAttribute("data-theme");

  const newTheme =
    currentTheme === "dark" ? "light" : "dark";

  document.documentElement.setAttribute("data-theme", newTheme);

  localStorage.setItem("sugarRushTheme", newTheme);

  themeToggleBtn.textContent =
    newTheme === "dark" ? "🌙" : "☀️";
});

initTheme();


// ==============================
// Cart Local Storage
// ==============================

function loadCart() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("sugarRushCart") || "[]"
    );

    if (!Array.isArray(saved)) return [];

    return saved
      .filter(item =>
        item &&
        item.id !== undefined &&
        Number.isFinite(Number(item.price)) &&
        Number(item.quantity) > 0
      )
      .map(item => ({
        ...item,
        price: Number(item.price),
        quantity: Number(item.quantity)
      }));

  } catch (error) {
    console.warn("Could not read saved cart:", error);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(
      "sugarRushCart",
      JSON.stringify(cart)
    );
  } catch (error) {
    console.warn("Could not save cart:", error);
  }
}


// ==============================
// Wishlist Local Storage
// ==============================

function loadWishlist() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("sugarRushWishlist") || "[]"
    );

    return Array.isArray(saved) ? saved : [];

  } catch (error) {
    console.warn("Could not read saved wishlist:", error);
    return [];
  }
}

function saveWishlist() {
  try {
    localStorage.setItem(
      "sugarRushWishlist",
      JSON.stringify(wishlist)
    );
  } catch (error) {
    console.warn("Could not save wishlist:", error);
  }
}


// ==============================
// Authentication Navigation
// ==============================

function updateAuthNav() {
  if (currentUser) {

    authNavBtn.textContent =
      `Log Out (${currentUser.name.split(" ")[0]})`;

    authNavBtn.onclick = () => {

      if (confirm("Are you sure you want to log out?")) {

        currentUser = null;

        localStorage.removeItem("sugarRushCurrentUser");

        appliedPromo = false;

        localStorage.removeItem("sugarRushPromo");

        promoInput.value = "";

        setPromoMessage("");

        cart = [];

        updateCart();

        updateAuthNav();

        closeCart();

        closeWishlist();

        showToast("Logged out successfully.");
      }
    };

  } else {

    authNavBtn.textContent = "Log In";

    authNavBtn.onclick = () => openAuthModal("login");
  }
}


// ==============================
// Open Authentication Modal
// ==============================

function openAuthModal(view = "login") {

  if (view === "login") {

    loginView.hidden = false;
    registerView.hidden = true;

    loginError.hidden = true;

    loginForm.reset();

  } else {

    loginView.hidden = true;
    registerView.hidden = false;

    registerError.hidden = true;

    registerForm.reset();
  }

  authModal.hidden = false;

  document.body.classList.add("lock-scroll");
}


// ==============================
// Close Authentication Modal
// ==============================

function closeAuthModal() {

  authModal.hidden = true;

  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    productModal.hidden
  ) {
    document.body.classList.remove("lock-scroll");
  }
}


// ==============================
// Toggle Password Visibility
// ==============================

document.querySelectorAll(".toggle-password").forEach(button => {

  button.addEventListener("click", () => {

    const inputId = button.getAttribute("data-target");

    const input = document.getElementById(inputId);

    if (input) {

      if (input.type === "password") {

        input.type = "text";

        button.textContent = "👁";

      } else {

        input.type = "password";

        button.textContent = "👁️‍🗨️";
      }
    }
  });
});


// ==============================
// Star Rating Picker
// ==============================

starPicker.addEventListener("click", (e) => {

  const star = e.target.closest("span");

  if (!star) return;

  selectedRating = Number(star.dataset.value);

  const stars = starPicker.querySelectorAll("span");

  stars.forEach(s => {

    if (Number(s.dataset.value) <= selectedRating) {

      s.classList.add("active");

    } else {

      s.classList.remove("active");
    }
  });
});


// ==============================
// Submit Product Review
// ==============================

reviewForm.addEventListener("submit", (e) => {

  e.preventDefault();

  if (!currentUser) {

    showToast("Please log in first to leave a review!");

    openAuthModal("login");

    return;
  }

  if (!selectedProduct) return;

  const productId = String(selectedProduct.id);

  if (!productReviews[productId]) {

    const seed = Number(productId) || 1;

    const initialCount = 40 + (seed * 17) % 150;

    const initialAvg = Number(
      (3.5 + ((seed * 3) % 15) / 10).toFixed(1)
    );

    productReviews[productId] = {
      totalScore: initialAvg * initialCount,
      count: initialCount,
      list: []
    };
  }

  const revData = productReviews[productId];

  revData.count += 1;

  revData.totalScore += selectedRating;

  revData.list.push({
    user: currentUser.name,
    rating: selectedRating,
    comment: reviewInput.value.trim()
  });

  localStorage.setItem(
    "sugarRushReviews",
    JSON.stringify(productReviews)
  );

  updateProductModalReviews(selectedProduct);

  reviewInput.value = "";

  showToast("Thank you for your review!");
});


// ==============================
// Update Product Review Summary
// ==============================

function updateProductModalReviews(product) {

  const productId = String(product.id);

  if (!productReviews[productId]) {

    const seed = Number(productId) || 1;

    const initialCount = 40 + (seed * 17) % 150;

    const initialAvg = Number(
      (3.5 + ((seed * 3) % 15) / 10).toFixed(1)
    );

    productReviews[productId] = {
      totalScore: initialAvg * initialCount,
      count: initialCount,
      list: []
    };
  }

  const data = productReviews[productId];

  const avg = (data.totalScore / data.count).toFixed(1);

  modalRatingAvg.textContent = avg;

  modalReviewsCount.textContent =
    `(${data.count} reviews)`;
}


// ==============================
// Escape HTML
// ==============================

function escapeHTML(value) {

  return String(value ?? "").replace(/[&<>"']/g, character => ({

    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"

  })[character]);
}


// ==============================
// Format Price
// ==============================

function formatPrice(value) {
  return Number(value || 0).toFixed(2);
}


// ==============================
// Normalize API Products
// ==============================

function normalizeProducts(payload) {

  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.data)) return payload.data;

  if (Array.isArray(payload?.products)) return payload.products;

  if (Array.isArray(payload?.items)) return payload.items;

  return [];
}


// ==============================
// Product Price
// ==============================

function productPrice(product) {

  return Number(
    product.price ??
    product.cost ??
    product.priceValue ??
    0
  );
}


// ==============================
// Product Image
// ==============================

function getProductImage(product) {

  return (
    product.image ||
    product.imageUrl ||
    product.thumbnail ||
    ""
  );
}


// ==============================
// Check Product Deal
// ==============================

function isDeal(product) {

  const index = allProducts.findIndex(
    item => String(item.id) === String(product.id)
  );

  return index >= 0 && index < DEALS_COUNT;
}


// ==============================
// Final Product Price
// ==============================

function finalPrice(product) {

  const price = productPrice(product);

  return isDeal(product)
    ? price * (1 - DEAL_DISCOUNT)
    : price;
}


// ==============================
// Fetch Products from API
// ==============================

async function getProducts() {

  productsContainer.innerHTML = skeletonCards(8);

  dealsContainer.innerHTML = skeletonCards(4);

  try {

    const response = await fetch(API_URL);

    if (!response.ok) {

      throw new Error(
        `API request failed (${response.status})`
      );
    }

    const payload = await response.json();

    allProducts = normalizeProducts(payload).filter(product =>
      product &&
      product.id !== undefined &&
      product.name
    );

    if (!allProducts.length) {

      console.error("Unexpected API response:", payload);

      throw new Error(
        "The API response did not contain a recognized product list."
      );
    }

    cart = cart.map(item => {

      const product = allProducts.find(
        p => String(p.id) === String(item.id)
      );

      if (!product) return item;

      return {
        ...item,
        name: product.name,
        image: getProductImage(product) || item.image,
        price: finalPrice(product)
      };
    });

    animateCards = true;

    revealCounter = 0;

    fillCategories();

    displayDeals();

    applyFilters();

    updateCart();

    updateWishlist();

    observeReveals();

    animateCards = false;

  } catch (error) {

    console.error("Error loading products:", error);

    productsContainer.innerHTML = `
      <p class="error-message">
        Sorry, we couldn't load the menu.
        Check your internet connection and refresh the page.
      </p>
    `;

    dealsContainer.innerHTML = `
      <p class="error-message">
        Sweet deals could not be loaded.
        Please refresh and try again.
      </p>
    `;

    resultsCount.textContent = "Menu unavailable";
  }
}


// ==============================
// Fill Category Filter
// ==============================

function fillCategories() {

  const currentCategory = categoryFilter.value;

  const categories = [
    ...new Set(
      allProducts
        .map(product => String(product.category || "Other").trim())
        .filter(Boolean)
    )
  ].sort((a, b) => a.localeCompare(b));

  categoryFilter.innerHTML =
    '<option value="all">🍽️ All Categories</option>' +

    categories.map(category => `
      <option value="${escapeHTML(category)}">
        ${categoryEmoji(category)}
        ${escapeHTML(
          category.charAt(0).toUpperCase() + category.slice(1)
        )}
      </option>
    `).join("");

  if (categories.includes(currentCategory)) {
    categoryFilter.value = currentCategory;
  }

  renderCategoryChips(categories);
}


let animateCards = false;
let revealCounter = 0;
let revealObserver = null;


// ==============================
// Scroll Reveal Animation
// ==============================

function observeReveals() {

  const items = document.querySelectorAll(".reveal:not(.in)");

  if (!("IntersectionObserver" in window)) {

    items.forEach(el => el.classList.add("in"));

    return;
  }

  if (!revealObserver) {

    revealObserver = new IntersectionObserver(entries => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {

          entry.target.classList.add("in");

          revealObserver.unobserve(entry.target);
        }
      });

    }, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px"
    });
  }

  items.forEach(el => revealObserver.observe(el));
}


// ==============================
// Skeleton Loading Cards
// ==============================

function skeletonCards(count = 4) {

  return Array.from({ length: count }, () => `

    <div class="skeleton-card" aria-hidden="true">

      <div class="sk sk-img"></div>

      <div class="sk-body">

        <div class="sk sk-line sk-short"></div>

        <div class="sk sk-line"></div>

        <div class="sk sk-line sk-short"></div>

        <div class="sk sk-btn"></div>

      </div>
    </div>

  `).join("");
}


// ==============================
// Category Emoji
// ==============================

function categoryEmoji(name) {

  const n = String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const map = [

    ["hamburguesa", "🍔"], ["burger", "🍔"], ["pizza", "🍕"],
    ["papas", "🍟"], ["fries", "🍟"], ["nugget", "🍗"],
    ["wing", "🍗"], ["alitas", "🍗"], ["pollo", "🍗"],
    ["chicken", "🍗"], ["sandwich", "🥪"], ["bocadillo", "🥪"],
    ["wrap", "🌯"], ["burrito", "🌯"], ["shawarma", "🌯"],
    ["kebab", "🍢"], ["hot dog", "🌭"], ["hotdog", "🌭"],
    ["perrito", "🌭"], ["taco", "🌮"], ["pasta", "🍝"],
    ["espagueti", "🍝"], ["noodle", "🍜"], ["fideo", "🍜"],
    ["soup", "🍲"], ["sopa", "🍲"], ["rice", "🍚"],
    ["arroz", "🍚"], ["sushi", "🍣"], ["fish", "🐟"],
    ["pescado", "🐟"], ["seafood", "🦐"], ["marisco", "🦐"],
    ["steak", "🥩"], ["meat", "🥩"], ["carne", "🥩"],
    ["grill", "🔥"], ["parrilla", "🔥"], ["salad", "🥗"],
    ["ensalada", "🥗"], ["veg", "🥬"], ["egg", "🍳"],
    ["huevo", "🍳"], ["breakfast", "🥞"], ["desayuno", "🥞"],
    ["pancake", "🥞"], ["waffle", "🧇"],

    ["donut", "🍩"], ["doughnut", "🍩"], ["dona", "🍩"],
    ["rosquilla", "🍩"], ["cookie", "🍪"], ["galleta", "🍪"],
    ["biscuit", "🍪"], ["cupcake", "🧁"], ["magdalena", "🧁"],
    ["muffin", "🧁"], ["pastel", "🍰"], ["cake", "🍰"],
    ["tarta", "🍰"], ["torta", "🍰"], ["pie", "🥧"],
    ["dessert", "🍮"], ["postre", "🍮"], ["flan", "🍮"],
    ["chocolate", "🍫"], ["candy", "🍭"], ["caramelo", "🍭"],
    ["dulce", "🍬"], ["sweet", "🍬"], ["croissant", "🥐"],
    ["pastry", "🥐"], ["bakery", "🥐"], ["panaderia", "🥐"],
    ["bread", "🥐"],

    ["juice", "🧃"], ["jugo", "🧃"], ["zumo", "🧃"],
    ["helado", "🍦"], ["ice", "🍦"], ["shake", "🥤"],
    ["batido", "🥤"], ["smoothie", "🥤"], ["milk", "🥛"],
    ["leche", "🥛"], ["coffee", "☕"], ["cafe", "☕"],
    ["espresso", "☕"], ["tea", "🍵"], ["infusion", "🍵"],
    ["drink", "🥤"], ["bebida", "🥤"], ["beverage", "🥤"],
    ["soda", "🥤"], ["refresco", "🥤"],

    ["snack", "🍿"], ["botana", "🍿"], ["aperitivo", "🍿"],
    ["side", "🍟"], ["acompan", "🍟"], ["combo", "🎁"],
    ["menu", "🍱"], ["meal", "🍱"], ["kid", "🧸"],
    ["nino", "🧸"], ["spicy", "🌶️"], ["picante", "🌶️"],
    ["sauce", "🥫"], ["salsa", "🥫"], ["offer", "🏷️"],
    ["deal", "🏷️"], ["oferta", "🏷️"], ["pan", "🥖"]
  ];

  const hit = map.find(([key]) => n.includes(key));

  return hit ? hit[1] : "🍽️";
}


// ==============================
// Render Category Chips
// ==============================

function renderCategoryChips(categories) {

  const wrap = document.getElementById("category-chips");

  if (!wrap) return;

  const items = ["all", ...categories];

  wrap.innerHTML = items.map(category => `

    <button
      type="button"
      class="category-chip ${
        categoryFilter.value === category ? "active" : ""
      }"
      data-category="${escapeHTML(category)}"
    >

      <span class="chip-emoji">
        ${category === "all" ? "✨" : categoryEmoji(category)}
      </span>

      <span>
        ${category === "all" ? "All Treats" : escapeHTML(category)}
      </span>

    </button>

  `).join("");
}


function syncCategoryChips() {

  document.querySelectorAll(".category-chip").forEach(chip => {

    chip.classList.toggle(
      "active",
      chip.dataset.category === categoryFilter.value
    );
  });
}


// ==============================
// Product Badge
// ==============================

function productBadge(product) {

  const index = allProducts.findIndex(
    item => String(item.id) === String(product.id)
  );

  if (index < DEALS_COUNT) return "";

  if (index % 5 === 0) return "Best Seller";

  if (index % 7 === 1) return "New";

  return "";
}


// ==============================
// Product Card
// ==============================

function productCard(product, dealSection = false) {

  const originalPrice = productPrice(product);

  const deal = isDeal(product);

  const image = getProductImage(product);

  const isWishlisted = wishlist.some(
    item => String(item.id) === String(product.id)
  );

  const tag = productBadge(product);

  const priceHTML = deal
    ? `
      <p class="deal-prices">
        <span class="old-price">${formatPrice(originalPrice)}</span>
        <span class="new-price">${formatPrice(finalPrice(product))}</span>
      </p>
    `
    : `
      <p class="product-price">${formatPrice(originalPrice)}</p>
    `;

  const badgeHTML = dealSection && deal
    ? '<span class="deal-badge">15% OFF</span>'
    : (
      tag
        ? `<span class="tag-badge">${escapeHTML(tag)}</span>`
        : ""
    );

  const revealClass = animateCards ? " reveal" : "";

  const revealStyle = animateCards
    ? ` style="--d:${(revealCounter++ % 4) * 90}ms"`
    : "";

  return `

    <article
      class="product-card${revealClass}"${revealStyle}
      data-product-id="${escapeHTML(product.id)}"
      tabindex="0"
      aria-label="View ${escapeHTML(product.name)} details"
    >

      <button
        class="wishlist-card-btn ${isWishlisted ? "active" : ""}"
        type="button"
        data-action="toggle-wishlist"
        data-product-id="${escapeHTML(product.id)}"
        aria-label="Save to wishlist"
      >
        ${isWishlisted ? "♥" : "♡"}
      </button>

      ${badgeHTML}

      <div class="product-media${image ? "" : " no-image"}">

        ${image ? `
          <img
            class="product-image"
            src="${escapeHTML(image)}"
            alt="${escapeHTML(product.name)}"
            loading="lazy"
            onerror="this.parentElement.classList.add('no-image');this.remove()"
          >
        ` : ""}

      </div>

      <div class="product-info">

        <span class="product-category">
          ${escapeHTML(product.category || "Sweet treat")}
        </span>

        <h3>${escapeHTML(product.name)}</h3>

        ${priceHTML}

        <div class="card-actions">

          <button
            class="add-to-cart"
            type="button"
            data-product-id="${escapeHTML(product.id)}"
          >
            Add to Cart ♡
          </button>

          <button
            class="view-details-btn"
            type="button"
            data-action="view-details"
            data-product-id="${escapeHTML(product.id)}"
          >
            View Details
          </button>

        </div>

      </div>

    </article>

  `;
}


// ==============================
// Display Deals
// ==============================

function displayDeals() {

  const deals = allProducts.slice(0, DEALS_COUNT);

  dealsContainer.innerHTML = deals.length
    ? deals.map(product => productCard(product, true)).join("")
    : '<p class="loading">No special deals available right now.</p>';
}


// ==============================
// Search, Filter and Sort
// ==============================

function applyFilters() {

  const query = searchInput.value.trim().toLowerCase();

  const category = categoryFilter.value;

  const sort = sortFilter.value;

  syncCategoryChips();

  let filtered = allProducts.filter(product => {

    const name = String(product.name || "").toLowerCase();

    const productCategory = String(product.category || "Other");

    const matchesSearch =
      name.includes(query) ||
      productCategory.toLowerCase().includes(query);

    const matchesCategory =
      category === "all" ||
      productCategory === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "name") {

    filtered.sort((a, b) =>
      String(a.name).localeCompare(String(b.name))
    );

  } else if (sort === "name-desc") {

    filtered.sort((a, b) =>
      String(b.name).localeCompare(String(a.name))
    );

  } else if (sort === "deals") {

    filtered.sort(
      (a, b) => Number(isDeal(b)) - Number(isDeal(a))
    );
  }

  resultsCount.textContent =
    `${filtered.length} ${
      filtered.length === 1 ? "treat" : "treats"
    } to love`;

  productsContainer.innerHTML = filtered.length
    ? filtered.map(product => productCard(product)).join("")
    : '<p class="loading">No treats found. Try another search or category.</p>';
}


// ==============================
// Toast Notification
// ==============================

function showToast(message) {

  const toast = document.getElementById("cart-toast");

  toast.textContent = message;

  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2300);
}


// ==============================
// Toggle Wishlist
// ==============================

function toggleWishlist(product) {

  if (!product) return;

  const id = String(product.id);

  const index = wishlist.findIndex(
    item => String(item.id) === id
  );

  if (index >= 0) {

    wishlist.splice(index, 1);

    showToast(`${product.name} removed from wishlist.`);

  } else {

    wishlist.push({
      id: product.id,
      name: product.name,
      price: finalPrice(product),
      image: getProductImage(product),
      category: product.category
    });

    showToast(`${product.name} added to your wishlist ♥`);
  }

  saveWishlist();

  updateWishlist();

  applyFilters();

  displayDeals();
}


// ==============================
// Update Wishlist
// ==============================

function updateWishlist() {

  saveWishlist();

  wishlistCount.textContent = wishlist.length;

  bnavWish.textContent = wishlist.length;

  bnavWish.hidden = wishlist.length === 0;

  if (!wishlist.length) {

    wishlistItems.innerHTML = `
      <p class="empty-cart">
        Your wishlist is empty. Save your favorite treats!
      </p>
    `;

    return;
  }

  wishlistItems.innerHTML = wishlist.map(item => `

    <div class="cart-item">

      <img
        src="${escapeHTML(item.image || "")}"
        alt="${escapeHTML(item.name)}"
      >

      <div class="cart-item-info">

        <h3>${escapeHTML(item.name)}</h3>

        <p>${formatPrice(item.price)}</p>

        <div class="cart-item-actions">

          <button
            type="button"
            data-action="wishlist-to-cart"
            data-id="${escapeHTML(item.id)}"
          >
            Add to Cart
          </button>

          <button
            type="button"
            data-action="remove-wishlist"
            data-id="${escapeHTML(item.id)}"
          >
            Remove
          </button>

        </div>

      </div>

    </div>

  `).join("");
}


// ==============================
// Open Wishlist
// ==============================

function openWishlist() {

  wishlistDrawer.classList.add("open");

  cartOverlay.hidden = false;

  wishlistDrawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("lock-scroll");

  closeWishlistButton.focus();
}


// ==============================
// Close Wishlist
// ==============================

function closeWishlist() {

  wishlistDrawer.classList.remove("open");

  if (!cartDrawer.classList.contains("open")) {
    cartOverlay.hidden = true;
  }

  wishlistDrawer.setAttribute("aria-hidden", "true");

  if (
    productModal.hidden &&
    authModal.hidden &&
    !cartDrawer.classList.contains("open")
  ) {
    document.body.classList.remove("lock-scroll");
  }

  wishlistButton.focus();
}


// ==============================
// Add Product to Cart
// ==============================

function addToCart(product) {

  if (!product) return;

  if (!currentUser) {

    showToast("Please log in or register first to add items!");

    openAuthModal("login");

    return;
  }

  const id = String(product.id);

  const existing = cart.find(
    item => String(item.id) === id
  );

  if (existing) {

    existing.quantity += 1;

    existing.price = finalPrice(product);

  } else {

    cart.push({
      id: product.id,
      name: product.name,
      price: finalPrice(product),
      image: getProductImage(product),
      quantity: 1
    });
  }

  updateCart();

  bumpCart();

  showToast(`${product.name} added to your bag!`);
}


// ==============================
// Update Cart
// ==============================

function updateCart() {

  saveCart();

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  cartCount.textContent = totalItems;

  bnavCart.textContent = totalItems;

  bnavCart.hidden = totalItems === 0;

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  // The promo only counts for logged-in users
  const promoActive = appliedPromo && !!currentUser;

  const discount = promoActive
    ? subtotal * PROMO_DISCOUNT
    : 0;

  const total = subtotal - discount;

  cartSubtotal.textContent = formatPrice(subtotal);

  cartDiscountRow.hidden = !promoActive;

  cartDiscount.textContent = "-" + formatPrice(discount);

  cartTotal.textContent = formatPrice(total);

  if (!cart.length) {

    freeDelivery.hidden = true;

  } else {

    const remaining = FREE_DELIVERY_AT - total;

    freeDelivery.hidden = false;

    freeDelivery.classList.toggle("done", remaining <= 0);

    freeDeliveryText.textContent = remaining > 0
      ? `Add ${formatPrice(remaining)} more for free delivery 🚚`
      : "🎉 You've unlocked free delivery!";

    freeDeliveryFill.style.width =
      Math.min(100, (total / FREE_DELIVERY_AT) * 100) + "%";
  }

  if (!cart.length) {

    cartItems.innerHTML = `
      <p class="empty-cart">
        Your cart is empty. Add something sweet!
      </p>
    `;

    return;
  }

  cartItems.innerHTML = cart.map(item => `

    <div class="cart-item">

      <img
        src="${escapeHTML(item.image || "")}"
        alt="${escapeHTML(item.name)}"
      >

      <div class="cart-item-info">

        <h3>${escapeHTML(item.name)}</h3>

        <p>
          ${formatPrice(item.price)} × ${Number(item.quantity)}
        </p>

        <div class="cart-item-actions">

          <button
            type="button"
            data-action="decrease"
            data-id="${escapeHTML(item.id)}"
            aria-label="Decrease quantity"
          >
            −
          </button>

          <span>${Number(item.quantity)}</span>

          <button
            type="button"
            data-action="increase"
            data-id="${escapeHTML(item.id)}"
            aria-label="Increase quantity"
          >
            +
          </button>

          <button
            type="button"
            data-action="remove"
            data-id="${escapeHTML(item.id)}"
          >
            Remove
          </button>

        </div>

      </div>

    </div>

  `).join("");

  const inCart = new Set(
    cart.map(item => String(item.id))
  );

  const suggestions = [...allProducts]
    .reverse()
    .filter(product => !inCart.has(String(product.id)))
    .slice(0, 2);

  if (suggestions.length) {

    cartItems.insertAdjacentHTML("beforeend", `

      <div class="cart-upsell">

        <h4>People also ordered ♡</h4>

        ${suggestions.map(product => `

          <div class="upsell-item">

            <img
              src="${escapeHTML(getProductImage(product))}"
              alt="${escapeHTML(product.name)}"
              onerror="this.style.visibility='hidden'"
            >

            <div>

              <h5>${escapeHTML(product.name)}</h5>

              <span>${formatPrice(finalPrice(product))}</span>

            </div>

            <button
              type="button"
              data-action="upsell-add"
              data-id="${escapeHTML(product.id)}"
            >
              + Add
            </button>

          </div>

        `).join("")}

      </div>

    `);
  }
}


// ==============================
// Animate Cart Button
// ==============================

function bumpCart() {

  [cartButton, bnavCartBtn].forEach(el => {

    el.classList.remove("bump");

    void el.offsetWidth;

    el.classList.add("bump");
  });
}


// ==============================
// Open Cart
// ==============================

function openCart() {

  if (!currentUser) {

    showToast("Please log in first to view your cart!");

    openAuthModal("login");

    return;
  }

  cartDrawer.classList.add("open");

  cartOverlay.hidden = false;

  cartDrawer.setAttribute("aria-hidden", "false");

  document.body.classList.add("lock-scroll");

  closeCartButton.focus();
}


// ==============================
// Close Cart
// ==============================

function closeCart() {

  cartDrawer.classList.remove("open");

  if (!wishlistDrawer.classList.contains("open")) {
    cartOverlay.hidden = true;
  }

  cartDrawer.setAttribute("aria-hidden", "true");

  if (
    productModal.hidden &&
    authModal.hidden &&
    !wishlistDrawer.classList.contains("open")
  ) {
    document.body.classList.remove("lock-scroll");
  }

  cartButton.focus();
}


// ==============================
// Open Product Details
// ==============================

function openProductModal(product) {

  selectedProduct = product;

  const image = document.getElementById("modal-product-image");

  image.src = getProductImage(product);

  image.alt = product.name || "Sweet treat";

  image.onerror = () => {
    image.style.visibility = "hidden";
  };

  image.onload = () => {
    image.style.visibility = "visible";
  };

  document.getElementById("modal-product-name").textContent =
    product.name || "Sweet treat";

  document.getElementById("modal-product-category").textContent =
    product.category || "Sweet treat";

  document.getElementById("modal-product-price").textContent =
    isDeal(product)
      ? `${formatPrice(finalPrice(product))} — 15% off (regular ${formatPrice(productPrice(product))})`
      : formatPrice(productPrice(product));

  document.getElementById("modal-product-description").textContent =
    product.description ||
    product.details ||
    "A lovely treat for your next sweet moment.";

  updateProductModalReviews(product);

  productModal.hidden = false;

  document.body.classList.add("lock-scroll");

  closeModalButton.focus();
}


// ==============================
// Close Product Details
// ==============================

function closeProductModal() {

  productModal.hidden = true;

  selectedProduct = null;

  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    authModal.hidden
  ) {
    document.body.classList.remove("lock-scroll");
  }
}


// ==============================
// Product Click Events
// ==============================

productsContainer.addEventListener("click", handleProductClick);

dealsContainer.addEventListener("click", handleProductClick);


function handleProductClick(event) {

  const wishlistBtn = event.target.closest(
    "[data-action='toggle-wishlist']"
  );

  if (wishlistBtn) {

    event.stopPropagation();

    const product = allProducts.find(
      item =>
        String(item.id) === String(wishlistBtn.dataset.productId)
    );

    if (product) toggleWishlist(product);

    return;
  }

  const detailsBtn = event.target.closest(
    "[data-action='view-details']"
  );

  if (detailsBtn) {

    event.stopPropagation();

    const product = allProducts.find(
      item =>
        String(item.id) === String(detailsBtn.dataset.productId)
    );

    if (product) openProductModal(product);

    return;
  }

  const addButton = event.target.closest(".add-to-cart");

  if (addButton) {

    event.stopPropagation();

    const product = allProducts.find(
      item =>
        String(item.id) === String(addButton.dataset.productId)
    );

    addToCart(product);

    return;
  }

  const card = event.target.closest(".product-card");

  if (!card) return;

  const product = allProducts.find(
    item =>
      String(item.id) === String(card.dataset.productId)
  );

  if (product) {
    openProductModal(product);
  }
}


// ==============================
// Keyboard Access for Products
// ==============================

[productsContainer, dealsContainer].forEach(container => {

  container.addEventListener("keydown", event => {

    if (
      (event.key === "Enter" || event.key === " ") &&
      event.target.classList.contains("product-card")
    ) {

      event.preventDefault();

      const product = allProducts.find(
        item =>
          String(item.id) === String(event.target.dataset.productId)
      );

      if (product) openProductModal(product);
    }
  });
});


// ==============================
// Search and Filter Events
// ==============================

searchInput.addEventListener("input", applyFilters);

categoryFilter.addEventListener("change", applyFilters);

sortFilter.addEventListener("change", applyFilters);


// ==============================
// Cart and Wishlist Events
// ==============================

cartButton.addEventListener("click", openCart);

closeCartButton.addEventListener("click", closeCart);

wishlistButton.addEventListener("click", openWishlist);

closeWishlistButton.addEventListener("click", closeWishlist);

cartOverlay.addEventListener("click", () => {

  closeCart();

  closeWishlist();
});


// ==============================
// Clear Cart
// ==============================

clearCartButton.addEventListener("click", () => {

  cart = [];

  updateCart();

  showToast("Your cart has been cleared.");
});


// ==============================
// Clear Wishlist
// ==============================

clearWishlistButton.addEventListener("click", () => {

  wishlist = [];

  updateWishlist();

  applyFilters();

  displayDeals();

  showToast("Your wishlist has been cleared.");
});


// ==============================
// Cart Item Actions
// ==============================

cartItems.addEventListener("click", event => {

  const button = event.target.closest("button[data-action]");

  if (!button) return;

  if (button.dataset.action === "upsell-add") {

    const suggested = allProducts.find(
      p => String(p.id) === String(button.dataset.id)
    );

    addToCart(suggested);

    return;
  }

  const item = cart.find(
    entry => String(entry.id) === String(button.dataset.id)
  );

  if (!item) return;

  if (button.dataset.action === "increase") {
    item.quantity += 1;
  }

  if (button.dataset.action === "decrease") {
    item.quantity -= 1;
  }

  if (
    button.dataset.action === "remove" ||
    item.quantity <= 0
  ) {

    cart = cart.filter(
      entry => String(entry.id) !== String(button.dataset.id)
    );
  }

  updateCart();
});


// ==============================
// Wishlist Item Actions
// ==============================

wishlistItems.addEventListener("click", event => {

  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;

  const item = wishlist.find(
    entry => String(entry.id) === String(id)
  );

  if (!item) return;

  if (button.dataset.action === "wishlist-to-cart") {

    addToCart(item);

  } else if (button.dataset.action === "remove-wishlist") {

    wishlist = wishlist.filter(
      entry => String(entry.id) !== String(id)
    );

    saveWishlist();

    updateWishlist();

    applyFilters();

    displayDeals();

    showToast("Removed from wishlist.");
  }
});


// ==============================
// Product Modal Events
// ==============================

closeModalButton.addEventListener("click", closeProductModal);

productModal.addEventListener("click", event => {

  if (event.target.matches("[data-close-modal]")) {
    closeProductModal();
  }
});

modalAddButton.addEventListener("click", () => {

  if (!selectedProduct) return;

  addToCart(selectedProduct);

  closeProductModal();
});


// ==============================
// Authentication Modal Events
// ==============================

closeAuthButton.addEventListener("click", closeAuthModal);

authModal.addEventListener("click", event => {

  if (event.target.matches("[data-close-auth]")) {
    closeAuthModal();
  }
});

switchToRegister.addEventListener("click", () => {
  openAuthModal("register");
});

switchToLogin.addEventListener("click", () => {
  openAuthModal("login");
});


// ==============================
// Register Form
// ==============================

registerForm.disableSelection = false;

registerForm.addEventListener("submit", event => {

  event.preventDefault();

  const name =
    document.getElementById("reg-name").value.trim();

  const email =
    document.getElementById("reg-email").value.trim().toLowerCase();

  const password =
    document.getElementById("reg-password").value;

  let users =
    JSON.parse(localStorage.getItem("sugarRushUsers")) || [];

  const existingUser = users.find(u => u.email === email);

  if (existingUser) {

    registerError.textContent =
      "Email is already registered! Please log in.";

    registerError.hidden = false;

    return;
  }

  const newUser = {
    name,
    email,
    password
  };

  users.push(newUser);

  localStorage.setItem(
    "sugarRushUsers",
    JSON.stringify(users)
  );

  currentUser = newUser;

  localStorage.setItem(
    "sugarRushCurrentUser",
    JSON.stringify(currentUser)
  );

  closeAuthModal();

  updateAuthNav();

  showToast(
    `Welcome, ${name}! Account created successfully.`
  );
});


// ==============================
// Login Form
// ==============================

loginForm.addEventListener("submit", event => {

  event.preventDefault();

  const email =
    document.getElementById("login-email").value.trim().toLowerCase();

  const password =
    document.getElementById("login-password").value;

  let users =
    JSON.parse(localStorage.getItem("sugarRushUsers")) || [];

  const user = users.find(
    u => u.email === email && u.password === password
  );

  if (!user) {

    loginError.textContent =
      "Invalid email or password. Please try again.";

    loginError.hidden = false;

    return;
  }

  currentUser = user;

  localStorage.setItem(
    "sugarRushCurrentUser",
    JSON.stringify(currentUser)
  );

  closeAuthModal();

  updateAuthNav();

  showToast(`Welcome back, ${user.name}!`);
});


// ==============================
// Escape Key Handling
// ==============================

document.addEventListener("keydown", event => {

  if (event.key === "Escape") {

    if (!productModal.hidden) {

      closeProductModal();

    } else if (!authModal.hidden) {

      closeAuthModal();

    } else if (cartDrawer.classList.contains("open")) {

      closeCart();

    } else if (wishlistDrawer.classList.contains("open")) {

      closeWishlist();
    }
  }
});


// ==============================
// Order Success Popup
// ==============================

function showOrderSuccess(order) {

  const firstName = currentUser
    ? currentUser.name.split(" ")[0]
    : "";

  const freeDeliveryNote =
    order.total >= FREE_DELIVERY_AT
      ? " Free delivery included 🎉"
      : "";

  document.getElementById("success-text").textContent =
    `Thank you, ${firstName}! Your sweet treats are on their way. Total: ${formatPrice(order.total)}.${freeDeliveryNote}`;

  document.getElementById("success-order-id").textContent =
    `Order ${order.id}`;

  document.getElementById("success-hearts").innerHTML =
    Array.from({ length: 16 }, (_, i) => `
      <span
        class="heart-float"
        style="
          left:${Math.random() * 100}%;
          animation-delay:${(Math.random() * 1.6).toFixed(2)}s;
          font-size:${Math.round(14 + Math.random() * 16)}px
        "
      >
        ${i % 2 ? "♥" : "♡"}
      </span>
    `).join("");

  orderSuccess.hidden = false;

  document.body.classList.add("lock-scroll");

  document.getElementById("success-close").focus();
}


function closeOrderSuccess() {

  orderSuccess.hidden = true;

  if (
    !cartDrawer.classList.contains("open") &&
    !wishlistDrawer.classList.contains("open") &&
    productModal.hidden &&
    authModal.hidden
  ) {
    document.body.classList.remove("lock-scroll");
  }
}


document.getElementById("success-close").addEventListener("click", () => {

  closeOrderSuccess();

  document.getElementById("products").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

orderSuccess.addEventListener("click", event => {

  if (event.target.matches("[data-close-success]")) {
    closeOrderSuccess();
  }
});


document.addEventListener("keydown", event => {

  if (event.key === "Escape" && !orderSuccess.hidden) {
    closeOrderSuccess();
  }
});


// ==============================
// Place Order
// ==============================

const placeOrderBtn = document.getElementById("place-order-btn");

placeOrderBtn.addEventListener("click", () => {

  if (!currentUser) {

    showToast("Please log in first to place an order!");

    openAuthModal("login");

    return;
  }

  if (!cart.length) {

    showToast("Your cart is empty. Add something sweet first!");

    return;
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const discount = appliedPromo
    ? subtotal * PROMO_DISCOUNT
    : 0;

  const total = subtotal - discount;

  const order = {

    id: "SR-" + Date.now().toString().slice(-6),

    email: currentUser.email,

    date: new Date().toISOString(),

    items: cart.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    })),

    subtotal,

    promo: appliedPromo ? PROMO_CODE : null,

    discount,

    total
  };

  try {

    const orders =
      JSON.parse(localStorage.getItem("sugarRushOrders")) || [];

    orders.push(order);

    localStorage.setItem(
      "sugarRushOrders",
      JSON.stringify(orders)
    );

  } catch (error) {

    console.warn("Could not save order:", error);
  }

  // Promo code is single-use per order
  appliedPromo = false;

  localStorage.removeItem("sugarRushPromo");

  setPromoMessage("");

  cart = [];

  updateCart();

  closeCart();

  showOrderSuccess(order);
});


// ==============================
// Promo Code
// ==============================

function setPromoMessage(text, type = "") {

  promoMessage.textContent = text;

  promoMessage.className = "promo-message " + type;

  promoMessage.hidden = !text;
}


function applyPromoCode() {

  const code = promoInput.value.trim().toUpperCase();

  if (!currentUser) {

    setPromoMessage(
      "Please log in or register to use a promo code.",
      "error"
    );

    showToast("Please log in first to use a promo code!");

    openAuthModal("login");

    return;
  }

  if (!code) {

    setPromoMessage("Please enter a promo code.", "error");

    return;
  }

  if (code !== PROMO_CODE) {

    setPromoMessage("Invalid promo code.", "error");

    return;
  }

  if (appliedPromo) {

    setPromoMessage("This code is already applied.", "error");

    return;
  }

  appliedPromo = true;

  localStorage.setItem("sugarRushPromo", PROMO_CODE);

  promoInput.value = "";

  setPromoMessage(
    "Code applied! You got 20% off.",
    "success"
  );

  updateCart();

  showToast("Promo code applied: 20% off!");
}


promoApplyBtn.addEventListener("click", applyPromoCode);

promoInput.addEventListener("keydown", event => {

  if (event.key === "Enter") {

    event.preventDefault();

    applyPromoCode();
  }
});


promoRemoveBtn.addEventListener("click", () => {

  appliedPromo = false;

  localStorage.removeItem("sugarRushPromo");

  setPromoMessage("");

  updateCart();

  showToast("Promo code removed.");
});


// ==============================
// Promo Bar
// ==============================

const promoBar = document.getElementById("promo-bar");

document.getElementById("promo-close").addEventListener("click", () => {

  promoBar.hidden = true;
});

document.getElementById("promo-register-link").addEventListener("click", () => {

  openAuthModal("register");
});


// ==============================
// Category Chips
// ==============================

document.getElementById("category-chips").addEventListener("click", event => {

  const chip = event.target.closest(".category-chip");

  if (!chip) return;

  categoryFilter.value = chip.dataset.category;

  applyFilters();

  document.getElementById("products").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});


// ==============================
// Mobile Bottom Navigation
// ==============================

bnavCartBtn.addEventListener("click", openCart);

bnavWishBtn.addEventListener("click", openWishlist);


// ==============================
// Newsletter Subscription
// ==============================

document.getElementById("newsletter-form").addEventListener("submit", event => {

  event.preventDefault();

  const input = document.getElementById("newsletter-email");

  const email = input.value.trim().toLowerCase();

  try {

    const list =
      JSON.parse(localStorage.getItem("sugarRushNewsletter")) || [];

    if (!list.includes(email)) {
      list.push(email);
    }

    localStorage.setItem(
      "sugarRushNewsletter",
      JSON.stringify(list)
    );

  } catch (error) {

    console.warn("Could not save subscription:", error);
  }

  input.value = "";

  showToast("Thanks for subscribing! Sweet news is on its way ♡");
});


// ==============================
// Scroll Reveal for Static Sections
// ==============================

[
  ".section-heading",
  ".story-content",
  ".story-card",
  ".step-card",
  ".testimonial-card",
  ".newsletter"
].forEach(selector => {

  document.querySelectorAll(selector).forEach((el, i) => {

    el.classList.add("reveal");

    el.style.setProperty(
      "--d",
      (i % 3) * 100 + "ms"
    );
  });
});

observeReveals();

updateAuthNav();

updateCart();

updateWishlist();

getProducts();