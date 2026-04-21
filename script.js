/* script.js – Shopping cart & interactive features */

(function() {
  'use strict';

  // ---------- STATE ----------
  let cart = []; // each item: { id, name, price, quantity }

  // DOM elements
  const cartToggle = document.getElementById('cartToggle');
  const cartDrawer = document.getElementById('cartDrawer');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartBadge = document.getElementById('cartBadge');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartTotalPrice = document.getElementById('cartTotalPrice');
  const checkoutBtn = document.querySelector('.checkout-btn');
  const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
  const cartOverlay = document.querySelector('.cart-drawer-overlay');

  // ---------- HELPER FUNCTIONS ----------

  // Save cart to sessionStorage (optional persistence)
  function persistCart() {
    sessionStorage.setItem('componentHubCart', JSON.stringify(cart));
  }

  // Load cart from sessionStorage
  function loadCartFromStorage() {
    const stored = sessionStorage.getItem('componentHubCart');
    if (stored) {
      try {
        cart = JSON.parse(stored);
      } catch (e) {
        cart = [];
      }
    }
    updateCartUI();
  }

  // Update cart counter badge + animation
  function updateCartBadge() {
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartBadge.textContent = totalQty;
    
    // Add pulse animation class
    cartBadge.classList.add('notify');
    setTimeout(() => {
      cartBadge.classList.remove('notify');
    }, 600);
  }

  // Render cart items inside drawer & update total
  function renderCartItems() {
    if (!cartItemsList) return;

    if (cart.length === 0) {
      cartItemsList.innerHTML = '<p class="empty-cart-message"><i class="fas fa-box-open"></i> Your cart is empty.</p>';
      cartTotalPrice.textContent = '$0.00';
      if (checkoutBtn) checkoutBtn.disabled = true;
      return;
    }

    let itemsHtml = '';
    let total = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;

      itemsHtml += `
        <div class="cart-item" data-id="${item.id}">
          <div class="cart-item-info">
            <span class="cart-item-title">${item.name}</span>
            <span class="cart-item-price">$${item.price.toFixed(2)} each</span>
          </div>
          <div class="cart-item-actions">
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="remove-item-btn" data-id="${item.id}" aria-label="Remove item">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `;
    });

    cartItemsList.innerHTML = itemsHtml;
    cartTotalPrice.textContent = `$${total.toFixed(2)}`;

    // Enable checkout if cart not empty
    if (checkoutBtn) checkoutBtn.disabled = false;

    // Attach remove listeners to each remove button
    document.querySelectorAll('.remove-item-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        removeItemFromCart(id);
      });
    });
  }

  // Update everything related to cart UI (badge + drawer)
  function updateCartUI() {
    updateCartBadge();
    renderCartItems();
    persistCart();
  }

  // Add product to cart
  function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id: id,
        name: name,
        price: parseFloat(price),
        quantity: 1
      });
    }
    
    updateCartUI();
    
    // Optionally open drawer briefly? We keep it closed; user can open manually.
    // Show a subtle toast-like feedback (badge animation handles it)
  }

  // Remove item from cart (full removal)
  function removeItemFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
  }

  // Increase quantity (not used in current spec, but we keep it simple)
  // For consistency, we only have "Add to Cart" which increments by 1, and remove entirely.

  // ---------- EVENT LISTENERS ----------

  // 1. Add to Cart buttons (product cards)
  function initAddToCartListeners() {
    addToCartButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const id = button.dataset.id;
        const name = button.dataset.name;
        const price = button.dataset.price;
        
        if (id && name && price) {
          addToCart(id, name, price);
        }
      });
    });
  }

  // 2. Toggle cart drawer
  function toggleCartDrawer(force) {
    const isHidden = cartDrawer.classList.contains('hidden');
    
    if (force === true) {
      cartDrawer.classList.remove('hidden');
      cartDrawer.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    } else if (force === false) {
      cartDrawer.classList.add('hidden');
      cartDrawer.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    } else {
      // toggle
      if (isHidden) {
        cartDrawer.classList.remove('hidden');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        // refresh render just in case
        renderCartItems();
      } else {
        cartDrawer.classList.add('hidden');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    }
  }

  // 3. Close drawer when clicking overlay or close button
  function initDrawerControls() {
    cartToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCartDrawer();
    });

    closeCartBtn.addEventListener('click', () => {
      toggleCartDrawer(false);
    });

    cartOverlay.addEventListener('click', () => {
      toggleCartDrawer(false);
    });

    // Close drawer on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !cartDrawer.classList.contains('hidden')) {
        toggleCartDrawer(false);
      }
    });
  }

  // 4. Checkout button (demo only)
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) return;
      alert(`🛒 Proceeding to checkout with ${cart.reduce((s, i) => s + i.quantity, 0)} items. Total: ${cartTotalPrice.textContent}`);
      // In a real app, would redirect.
    });
  }

  // ---------- INITIALIZE ----------
  function init() {
    loadCartFromStorage();      // loads cart, updates UI (badge + drawer content)
    initAddToCartListeners();
    initDrawerControls();
    
    // Ensure cart badge shows correct initial value
    updateCartBadge();
    
    // Pre-render cart items (already called in loadCartFromStorage -> updateCartUI)
  }

  // Start everything
  init();

})();