(function () {
  const state = {
    products: Array.isArray(window.PRODUCTS) ? window.PRODUCTS : [],
    cart: new Map(),
    paymentsMounted: false,
    activeVideoFilter: "all",
    activeProductFilter: "all",
  };

  const productGrid = document.getElementById("product-grid");
  const videoGrid = document.getElementById("video-grid");
  const reelGrid = document.getElementById("reel-grid");
  const testimonialsGrid = document.getElementById("testimonials-grid");
  const cartOverlay = document.getElementById("cart-drawer");
  const cartItems = document.getElementById("cart-items");
  const cartCount = document.getElementById("cart-count");
  const cartTotal = document.getElementById("cart-total");
  const checkoutItemsCount = document.getElementById("checkout-items-count");
  const checkoutTotal = document.getElementById("checkout-total");
  const checkoutSection = document.getElementById("checkout-section");
  const paymentFeedback = document.getElementById("payment-feedback");

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency", currency: "USD",
    }).format(Number(value || 0));
  }

  function getCartCount() {
    let count = 0;
    state.cart.forEach(function (q) { count += q; });
    return count;
  }

  function getCartTotal() {
    let total = 0;
    state.cart.forEach(function (q, id) {
      const product = state.products.find(function (p) { return p.id === id; });
      if (product) total += product.price * q;
    });
    return total;
  }

  function setFeedback(msg, isError) {
    if (paymentFeedback) {
      paymentFeedback.textContent = msg || "";
      paymentFeedback.classList.toggle("error", Boolean(isError));
    }
  }

  function animateMetric(el, target, suffix) {
    if (!el) return;
    var duration = 850;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      el.textContent = Math.floor(target * p) + (suffix || "");
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ===== VIDEOS ===== */
  function renderVideos() {
    if (!videoGrid) return;
    var filtered = CNC_VIDEOS;
    if (state.activeVideoFilter !== "all") {
      filtered = CNC_VIDEOS.filter(function (v) { return v.category === state.activeVideoFilter; });
    }
    videoGrid.innerHTML = filtered.map(function (v) {
      var poster = "https://i.ytimg.com/vi/" + v.embedId + "/maxresdefault.jpg";
      return (
        '<article class="video-card" data-youtube="' + v.embedId + '">' +
          '<div class="video-frame">' +
            '<img class="video-poster" src="' + poster + '" alt="' + v.title + '" loading="lazy">' +
            '<div class="video-play-btn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>' +
            '<div class="video-shimmer"></div>' +
          '</div>' +
          '<div class="video-info">' +
            '<span class="video-category">' + v.category + '</span>' +
            '<h3 class="video-title">' + v.title + '</h3>' +
            '<p class="video-desc">' + v.description + '</p>' +
          '</div>' +
        '</article>'
      );
    }).join("");
    // Click handler — play video on YouTube
    videoGrid.querySelectorAll(".video-card").forEach(function (card) {
      card.addEventListener("click", function () {
        var vid = card.getAttribute("data-youtube");
        if (vid) window.open("https://www.youtube.com/watch?v=" + vid, "_blank");
      });
    });
  }

  /* ===== TIKTOK-STYLE REELS ===== */
  function renderReels() {
    if (!reelGrid) return;
    reelGrid.innerHTML = REEL_VIDEOS.map(function (r, i) {
      var poster = "https://i.ytimg.com/vi/" + r.embedId + "/maxresdefault.jpg";
      return (
        '<div class="reel-card" data-embed="' + r.embedId + '" data-index="' + i + '">' +
          '<img class="reel-poster" src="' + poster + '" alt="' + r.caption + '" loading="lazy">' +
          '<div class="reel-scanline"></div>' +
          '<div class="reel-overlay"><span class="reel-caption">' + r.caption + '</span></div>' +
          '<div class="reel-play-icon"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>' +
        '</div>'
      );
    }).join("");
  }

  /* ===== TESTIMONIALS ===== */
  function renderTestimonials() {
    if (!testimonialsGrid) return;
    testimonialsGrid.innerHTML = TESTIMONIALS.map(function (t) {
      var stars = Array(5).fill(
        '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>'
      ).join("");
      return (
        '<article class="testimonial-card">' +
          '<div class="stars">' + stars + '</div>' +
          '<p class="testimonial-content">"' + t.content + '"</p>' +
          '<div class="testimonial-author">' +
            '<div class="testimonial-avatar">' + t.avatar + '</div>' +
            '<div><p class="testimonial-name">' + t.name + '</p><p class="testimonial-role">' + t.role + '</p></div>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  /* ===== PRODUCTS ===== */
  function getProductCategory(product) {
    var name = product.name.toLowerCase();
    if (name.includes("router") || name.includes("machine")) return "router";
    if (name.includes("bit") || name.includes("end mill") || name.includes("collet")) return "bits";
    return "accessories";
  }

  function renderProducts() {
    var items = state.products;
    if (!items.length) {
      productGrid.innerHTML = '<p style="text-align:center;color:#6b7280;grid-column:1/-1">No products available.</p>';
      return;
    }
    var filtered = items;
    if (state.activeProductFilter !== "all") {
      filtered = items.filter(function (p) { return getProductCategory(p) === state.activeProductFilter; });
    }
    productGrid.innerHTML = filtered.map(function (p) {
      var badge = null;
      if (p.trend >= 97) badge = "Best Seller";
      else if (p.trend >= 93) badge = "Popular";
      return (
        '<article class="product-card">' +
          '<div class="product-image-wrap">' +
            (badge ? '<span class="product-badge">' + badge + '</span>' : '') +
            '<img src="' + p.image + '" alt="' + p.name + '" loading="lazy">' +
          '</div>' +
          '<div class="product-body">' +
            '<h3 class="product-name"><a href="product.html?id=' + p.id + '">' + p.name + '</a></h3>' +
            '<p class="product-meta">⭐ ' + p.rating + ' · ' + p.sales + ' · Trend ' + p.trend + '/100</p>' +
            '<p class="product-desc">' + p.description + '</p>' +
            '<div class="product-price-row">' +
              '<span class="product-price">' + formatCurrency(p.price) + '</span>' +
              '<span class="product-old-price">' + formatCurrency(p.oldPrice) + '</span>' +
            '</div>' +
            '<button class="product-add-btn" type="button" data-add-id="' + p.id + '">Add to Cart</button>' +
          '</div>' +
        '</article>'
      );
    }).join("");
  }

  /* ===== CART ===== */
  function renderCart() {
    var entries = Array.from(state.cart.entries());
    if (!entries.length) {
      cartItems.innerHTML = '<div class="cart-empty">Your cart is empty. Add a CNC product to start.</div>';
    } else {
      cartItems.innerHTML = entries.map(function (e) {
        var id = e[0], qty = e[1];
        var product = state.products.find(function (p) { return p.id === id; });
        if (!product) return "";
        return (
          '<article class="cart-item">' +
            '<div class="cart-item-top">' +
              '<div><p class="cart-item-name">' + product.name + '</p><p class="cart-item-price">' + formatCurrency(product.price) + ' each</p></div>' +
              '<button class="cart-item-remove" type="button" data-remove-id="' + id + '">Remove</button>' +
            '</div>' +
            '<div class="cart-item-bottom">' +
              '<div class="qty-controls">' +
                '<button type="button" data-qty-id="' + id + '" data-delta="-1">−</button>' +
                '<span>' + qty + '</span>' +
                '<button type="button" data-qty-id="' + id + '" data-delta="1">+</button>' +
              '</div>' +
              '<span class="cart-item-subtotal">' + formatCurrency(product.price * qty) + '</span>' +
            '</div>' +
          '</article>'
        );
      }).join("");
    }
    var count = getCartCount();
    var total = getCartTotal();
    cartCount.textContent = String(count);
    cartTotal.textContent = formatCurrency(total);
    if (checkoutItemsCount) checkoutItemsCount.textContent = String(count);
    if (checkoutTotal) checkoutTotal.textContent = formatCurrency(total);
  }

  function addToCart(productId) {
    var qty = state.cart.get(productId) || 0;
    state.cart.set(productId, qty + 1);
    state.paymentsMounted = false;
    renderCart();
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function changeQuantity(productId, delta) {
    var current = state.cart.get(productId) || 0;
    var next = current + delta;
    if (next <= 0) state.cart.delete(productId);
    else state.cart.set(productId, next);
    state.paymentsMounted = false;
    renderCart();
  }

  /* ===== PAYMENTS ===== */
  function initializePayments() {
    if (state.paymentsMounted) return;
    if (!window.PaymentGateway) {
      setFeedback("Payment SDKs unavailable. Refresh and try again.", true);
      return;
    }
    var onSuccess = function (result) {
      state.cart.clear();
      renderCart();
      state.paymentsMounted = false;
      setFeedback(result.provider + " payment approved in test mode. Order received!", false);
    };
    var onError = function (msg) { setFeedback(msg, true); };
    window.PaymentGateway.mountPayPal({
      containerId: "paypal-button-container",
      getAmount: getCartTotal,
      onSuccess: onSuccess,
      onError: onError,
    });
    window.PaymentGateway.mountGooglePay({
      containerId: "google-pay-button-container",
      getAmount: getCartTotal,
      onSuccess: onSuccess,
      onError: onError,
    });
    state.paymentsMounted = true;
  }

  /* ===== EVENT DELEGATION ===== */
  // Product grid events
  productGrid.addEventListener("click", function (e) {
    var btn = e.target.closest("button[data-add-id]");
    if (btn) {
      addToCart(btn.getAttribute("data-add-id"));
      setFeedback("");
    }
  });

  // Cart events
  cartItems.addEventListener("click", function (e) {
    var rm = e.target.closest("button[data-remove-id]");
    if (rm) {
      state.cart.delete(rm.getAttribute("data-remove-id"));
      state.paymentsMounted = false;
      renderCart();
      return;
    }
    var qtyBtn = e.target.closest("button[data-qty-id]");
    if (qtyBtn) {
      changeQuantity(qtyBtn.getAttribute("data-qty-id"), Number(qtyBtn.getAttribute("data-delta")));
    }
  });

  // Cart open/close
  document.getElementById("open-cart-btn").addEventListener("click", function () {
    cartOverlay.classList.add("open");
    document.body.style.overflow = "hidden";
  });
  document.getElementById("close-cart-btn").addEventListener("click", function () {
    cartOverlay.classList.remove("open");
    document.body.style.overflow = "";
  });
  cartOverlay.addEventListener("click", function (e) {
    if (e.target === cartOverlay) {
      cartOverlay.classList.remove("open");
      document.body.style.overflow = "";
    }
  });

  // Checkout
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

  // Video filters
  var videoFilterRow = document.getElementById("video-filter-row");
  if (videoFilterRow) {
    videoFilterRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      videoFilterRow.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.activeVideoFilter = btn.getAttribute("data-filter");
      renderVideos();
    });
  }

  // Product filters
  var productFilterRow = document.getElementById("product-filter-row");
  if (productFilterRow) {
    productFilterRow.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      productFilterRow.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      state.activeProductFilter = btn.getAttribute("data-filter");
      renderProducts();
    });
  }

  /* ===== MOBILE MENU ===== */
  var mobileBtn = document.getElementById("mobile-menu-btn");
  if (mobileBtn) {
    mobileBtn.addEventListener("click", function () {
      var nav = document.querySelector(".nav-links");
      nav.classList.toggle("open");
      if (nav.classList.contains("open")) {
        nav.style.display = "flex";
        nav.style.flexDirection = "column";
        nav.style.position = "absolute";
        nav.style.top = "64px";
        nav.style.left = "0";
        nav.style.right = "0";
        nav.style.background = "rgba(10,10,15,0.95)";
        nav.style.backdropFilter = "blur(16px)";
        nav.style.padding = "16px 24px";
        nav.style.borderBottom = "1px solid rgba(255,255,255,0.06)";
        nav.querySelectorAll("a").forEach(function (a) { a.style.display = "block"; a.style.padding = "12px 0"; });
      } else {
        nav.style.display = "";
        nav.style.flexDirection = "";
        nav.style.position = "";
        nav.style.top = "";
        nav.style.left = "";
        nav.style.right = "";
        nav.style.background = "";
        nav.style.backdropFilter = "";
        nav.style.padding = "";
        nav.style.borderBottom = "";
        nav.querySelectorAll("a").forEach(function (a) { a.style.display = ""; a.style.padding = ""; });
      }
    });
  }

  /* ===== REEL CLICK HANDLER ===== */
  if (reelGrid) {
    reelGrid.addEventListener("click", function (e) {
      var card = e.target.closest(".reel-card");
      if (!card) return;
      var embedId = card.getAttribute("data-embed");
      if (embedId) window.open("https://www.youtube.com/watch?v=" + embedId, "_blank");
    });
  }

  /* ===== INIT ===== */
  renderVideos();
  renderReels();
  renderTestimonials();
  renderProducts();
  renderCart();

  // Animate metrics
  animateMetric(document.getElementById("metric-products"), state.products.length, "");
  animateMetric(document.getElementById("metric-customers"), 12, "K+");
  animateMetric(document.getElementById("stat-trending"), 250, "+");

  document.getElementById("year").textContent = String(new Date().getFullYear());

  // Expose for product.html
  window.__appState = state;
  window.__renderCart = renderCart;
})();
