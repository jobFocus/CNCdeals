(function () {
  const state = {
    products: Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [],
    cart: new Map(),
    paymentsMounted: false,
    motivationIndex: 0
  };

  const motivationLines = [
    "Momentum starts with one sharp tool.",
    "Create once, sell forever: machine your edge.",
    "Small upgrades today become big output tomorrow.",
    "Your next best product begins in your workshop now."
  ];

  const productGrid = document.getElementById("product-grid");
  const cartDrawer = document.getElementById("cart-drawer");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const checkoutItemsCount = document.getElementById("checkout-items-count");
  const checkoutTotal = document.getElementById("checkout-total");
  const checkoutSection = document.getElementById("checkout-section");
  const paymentFeedback = document.getElementById("payment-feedback");
  const heroMotivation = document.getElementById("hero-motivation");
  const metricProducts = document.getElementById("metric-products");
  const metricShops = document.getElementById("metric-shops");
  const metricEnergy = document.getElementById("metric-energy");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(value || 0));
  }

  function getCartCount() {
    let count = 0;
    state.cart.forEach(function (quantity) {
      count += quantity;
    });
    return count;
  }

  function getCartTotal() {
    let total = 0;
    state.cart.forEach(function (quantity, id) {
      const product = state.products.find(function (item) {
        return item.id === id;
      });
      if (product) {
        total += product.price * quantity;
      }
    });
    return total;
  }

  function setFeedback(message, isError) {
    paymentFeedback.textContent = message || "";
    paymentFeedback.classList.toggle("error", Boolean(isError));
  }

  function animateMetric(element, target, suffix) {
    const duration = 850;
    const startTime = performance.now();

    function tick(now) {
      const progress = Math.min((now - startTime) / duration, 1);
      const currentValue = Math.floor(target * progress);
      element.textContent = String(currentValue) + (suffix || "");
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  function startMotivationRotation() {
    heroMotivation.textContent = motivationLines[0];
    setInterval(function () {
      state.motivationIndex = (state.motivationIndex + 1) % motivationLines.length;
      heroMotivation.textContent = motivationLines[state.motivationIndex];
    }, 2600);
  }

  function renderProducts() {
    const items = state.products;

    if (!items.length) {
      productGrid.innerHTML = '<p class="empty-cart">No products available.</p>';
      return;
    }

    productGrid.innerHTML = items
      .map(function (product) {
        return (
          '<article class="product-card">' +
          '<a href="product.html?id=' +
          product.id +
          '" class="product-image-link"><img class="product-image" src="' +
          product.image +
          '" alt="' +
          product.name +
          '"></a>' +
          '<div class="product-body">' +
          '<a href="product.html?id=' +
          product.id +
          '" class="product-name-link"><h3 class="product-name">' +
          product.name +
          "</h3></a>" +
          '<p class="meta">⭐ ' +
          product.rating +
          " · " +
          product.sales +
          " · Trend " +
          product.trend +
          "/100</p>" +
          '<p class="meta">' +
          product.description +
          "</p>" +
          '<div class="price-row"><p class="price">' +
          formatCurrency(product.price) +
          '</p><p class="old-price">' +
          formatCurrency(product.oldPrice) +
          "</p></div>" +
          '<div class="actions">' +
          '<button class="add-btn" type="button" data-add-id="' +
          product.id +
          '">Add to Cart</button>' +
          "</div>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderCart() {
    const entries = Array.from(state.cart.entries());

    if (!entries.length) {
      cartItems.innerHTML = '<div class="empty-cart">Your cart is empty. Add a CNC trend pick to continue.</div>';
    } else {
      cartItems.innerHTML = entries
        .map(function (entry) {
          const id = entry[0];
          const quantity = entry[1];
          const product = state.products.find(function (item) {
            return item.id === id;
          });
          if (!product) {
            return "";
          }
          return (
            '<article class="cart-item">' +
            '<div class="cart-item-top">' +
            '<div><p class="cart-item-name">' +
            product.name +
            '</p><p class="cart-item-price">' +
            formatCurrency(product.price) +
            " each</p></div>" +
            '<button class="remove-btn" type="button" data-remove-id="' +
            id +
            '">Remove</button>' +
            "</div>" +
            '<div class="qty-line">' +
            '<div class="qty-controls">' +
            '<button type="button" data-qty-id="' +
            id +
            '" data-delta="-1">-</button>' +
            "<span>" +
            quantity +
            "</span>" +
            '<button type="button" data-qty-id="' +
            id +
            '" data-delta="1">+</button>' +
            "</div>" +
            "<strong>" +
            formatCurrency(product.price * quantity) +
            "</strong>" +
            "</div>" +
            "</article>"
          );
        })
        .join("");
    }

    const itemCount = getCartCount();
    const total = getCartTotal();
    cartCount.textContent = String(itemCount);
    cartTotal.textContent = formatCurrency(total);
    checkoutItemsCount.textContent = String(itemCount);
    checkoutTotal.textContent = formatCurrency(total);
  }

  function addToCart(productId) {
    const quantity = state.cart.get(productId) || 0;
    state.cart.set(productId, quantity + 1);
    state.paymentsMounted = false;
    renderCart();
    cartDrawer.classList.add("open");
  }

  function changeQuantity(productId, delta) {
    const current = state.cart.get(productId) || 0;
    const next = current + delta;
    if (next <= 0) {
      state.cart.delete(productId);
    } else {
      state.cart.set(productId, next);
    }
    state.paymentsMounted = false;
    renderCart();
  }

  function initializePayments() {
    if (state.paymentsMounted) {
      return;
    }

    if (!window.PaymentGateway) {
      setFeedback("Payment SDKs are unavailable. Refresh and try again.", true);
      return;
    }

    const onSuccess = function (result) {
      state.cart.clear();
      renderCart();
      state.paymentsMounted = false;
      setFeedback(result.provider + " payment approved in test mode. Order received!", false);
    };

    const onError = function (message) {
      setFeedback(message, true);
    };

    window.PaymentGateway.mountPayPal({
      containerId: "paypal-button-container",
      getAmount: getCartTotal,
      onSuccess: onSuccess,
      onError: onError
    });

    window.PaymentGateway.mountGooglePay({
      containerId: "google-pay-button-container",
      getAmount: getCartTotal,
      onSuccess: onSuccess,
      onError: onError
    });

    state.paymentsMounted = true;
  }

  productGrid.addEventListener("click", function (event) {
    const addButton = event.target.closest("button[data-add-id]");
    if (!addButton) {
      return;
    }
    addToCart(addButton.getAttribute("data-add-id"));
    setFeedback("");
  });

  cartItems.addEventListener("click", function (event) {
    const removeButton = event.target.closest("button[data-remove-id]");
    if (removeButton) {
      state.cart.delete(removeButton.getAttribute("data-remove-id"));
      state.paymentsMounted = false;
      renderCart();
      return;
    }

    const qtyButton = event.target.closest("button[data-qty-id]");
    if (qtyButton) {
      const id = qtyButton.getAttribute("data-qty-id");
      const delta = Number(qtyButton.getAttribute("data-delta"));
      changeQuantity(id, delta);
    }
  });

  document.getElementById("open-cart-btn").addEventListener("click", function () {
    cartDrawer.classList.add("open");
  });

  document.getElementById("close-cart-btn").addEventListener("click", function () {
    cartDrawer.classList.remove("open");
  });

  document.getElementById("shop-now-btn").addEventListener("click", function () {
    document.getElementById("catalog").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("checkout-btn").addEventListener("click", function () {
    if (!getCartCount()) {
      setFeedback("Add at least one product to continue checkout.", true);
      return;
    }
    checkoutSection.classList.remove("hidden");
    checkoutSection.scrollIntoView({ behavior: "smooth", block: "start" });
    setFeedback("");
    initializePayments();
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());

  animateMetric(metricProducts, state.products.length, "");
  animateMetric(metricShops, 3, "");
  animateMetric(metricEnergy, 100, "%");
  startMotivationRotation();
  renderProducts();
  renderCart();

  window.__appState = state;
  window.__renderCart = renderCart;
})();
