"use strict";

/* =========================================
   NANCYTECH MOBILE
   Search, filters, cart and WhatsApp checkout
========================================= */

// WhatsApp number supplied for NancyTech Mobile.
// Keep the country code, but do not include the + symbol here.
const WHATSAPP_NUMBER = "12485339458";

const cart = [];

const productCards = Array.from(
  document.querySelectorAll(".product-card")
);

const productSearch = document.getElementById("productSearch");
const filterButtons = document.querySelectorAll(".filter-button");

const productGrid = document.getElementById("productGrid");
const noResults = document.getElementById("noResults");

const cartOverlay = document.getElementById("cartOverlay");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const openCartButton = document.getElementById("openCart");
const closeCartButton = document.getElementById("closeCart");

const checkoutButton = document.getElementById("checkoutButton");
const clearCartButton = document.getElementById("clearCart");

const toast = document.getElementById("toast");

let activeFilter = "all";
let toastTimer;


/* -----------------------------------------
   Toast notification
----------------------------------------- */

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}


/* -----------------------------------------
   Search and category filters
----------------------------------------- */

function filterProducts() {
  const query = productSearch.value
    .trim()
    .toLowerCase();

  let visibleCount = 0;

  productCards.forEach((card) => {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category;

    const matchesSearch = name.includes(query);

    const matchesCategory =
      activeFilter === "all" ||
      category === activeFilter;

    const shouldShow =
      matchesSearch && matchesCategory;

    card.hidden = !shouldShow;

    if (shouldShow) {
      visibleCount += 1;
    }
  });

  noResults.hidden = visibleCount !== 0;
}

productSearch.addEventListener("input", filterProducts);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    activeFilter = button.dataset.filter;

    filterProducts();
  });
});


/* -----------------------------------------
   Shopping cart
----------------------------------------- */

function updateCartCount() {
  const totalQuantity = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  cartCount.textContent = String(totalQuantity);
}

function renderCart() {
  updateCartCount();

  cartItems.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");

    emptyMessage.className = "empty-cart";
    emptyMessage.textContent = "Your bag is empty.";

    cartItems.appendChild(emptyMessage);

    checkoutButton.disabled = true;
    clearCartButton.disabled = true;

    return;
  }

  checkoutButton.disabled = false;
  clearCartButton.disabled = false;

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "cart-item";

    const details = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = item.name;

    const storage = document.createElement("p");
    storage.textContent = "Storage: " + item.storage;

    const quantity = document.createElement("p");
    quantity.textContent = "Quantity: " + item.quantity;

    const price = document.createElement("p");
    price.textContent = "Price: Confirm on WhatsApp";

    details.append(title, storage, quantity, price);

    const removeButton = document.createElement("button");

    removeButton.type = "button";
    removeButton.className = "remove-item";
    removeButton.textContent = "Remove";

    removeButton.setAttribute(
      "aria-label",
      "Remove " + item.name + " from bag"
    );

    removeButton.addEventListener("click", () => {
      removeFromCart(item.key);
    });

    row.append(details, removeButton);

    cartItems.appendChild(row);
  });
}

function addToCart(product) {
  const existingItem = cart.find(
    (item) => item.key === product.key
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  renderCart();

  showToast(product.name + " added to your bag.");
}

function removeFromCart(key) {
  const index = cart.findIndex(
    (item) => item.key === key
  );

  if (index !== -1) {
    cart.splice(index, 1);
  }

  renderCart();
}

function openCart() {
  cartOverlay.hidden = false;

  document.body.classList.add("cart-open");

  closeCartButton.focus();
}

function closeCart() {
  cartOverlay.hidden = true;

  document.body.classList.remove("cart-open");

  openCartButton.focus();
}


/* -----------------------------------------
   Add product buttons
----------------------------------------- */

document.querySelectorAll(".add-to-cart").forEach((button) => {
  button.addEventListener("click", () => {
    const storageSelect = document.getElementById(
      button.dataset.storage
    );

    if (!storageSelect) {
      showToast("Please select a storage option.");
      return;
    }

    const product = {
      id: button.dataset.id,
      name: button.dataset.name,
      storage: storageSelect.value,
      key: button.dataset.id + "-" + storageSelect.value
    };

    addToCart(product);
  });
});


/* -----------------------------------------
   Cart open and close
----------------------------------------- */

openCartButton.addEventListener("click", openCart);

closeCartButton.addEventListener("click", closeCart);

cartOverlay.addEventListener("click", (event) => {
  if (event.target === cartOverlay) {
    closeCart();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cartOverlay.hidden) {
    closeCart();
  }
});


/* -----------------------------------------
   Clear cart
----------------------------------------- */

clearCartButton.addEventListener("click", () => {
  cart.length = 0;

  renderCart();

  showToast("Your bag has been cleared.");
});


/* -----------------------------------------
   WhatsApp checkout
----------------------------------------- */

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("Add a product to your bag first.");
    return;
  }

  const lines = [
    "Hello NancyTech Mobile!",
    "",
    "I would like to enquire about these iPhones:",
    ""
  ];

  cart.forEach((item, index) => {
    lines.push(
      `${index + 1}. ${item.name}`,
      `   Storage: ${item.storage}`,
      `   Quantity: ${item.quantity}`,
      "   Price: Please confirm current price",
      ""
    );
  });

  lines.push(
    "Please confirm availability, condition, colour options,",
    "warranty details if applicable, and the current prices.",
    "",
    "Thank you."
  );

  const message = lines.join("\n");

  const whatsappURL =
    "https://wa.me/" +
    WHATSAPP_NUMBER +
    "?text=" +
    encodeURIComponent(message);

  window.open(
    whatsappURL,
    "_blank",
    "noopener,noreferrer"
  );
});


/* -----------------------------------------
   Footer year
----------------------------------------- */

document.getElementById("currentYear").textContent =
  String(new Date().getFullYear());


/* -----------------------------------------
   Initial setup
----------------------------------------- */

renderCart();
filterProducts();
