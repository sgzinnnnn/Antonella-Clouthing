// script.js — substitua todo o arquivo por este
document.addEventListener("DOMContentLoaded", () => {
  /* ------------------
     DOM ELEMENTS
     ------------------*/
  const userBtn = document.getElementById("user-btn");
  const loginModal = document.getElementById("loginModal");
  const closeLogin = document.getElementById("closeLogin");
  const loginForm = document.getElementById("loginForm");
  const toggleLogin = document.getElementById("toggleLogin");
  const registerFields = document.getElementById("registerFields");
  const modalTitle = document.getElementById("modal-title");

  const featuredGrid = document.getElementById("featuredGrid"); // pode ser null
  const productsGrid = document.getElementById("productsGrid");
  const cartIcon = document.getElementById("cart-icon");
  const cartPopup = document.getElementById("cart-popup");
  const closeCartBtn = document.getElementById("close-cart");
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  const shippingInput = document.getElementById("cep");
  const shippingCostText = document.getElementById("shipping-cost");
  const completePurchaseBtn = document.getElementById("complete-purchase");
  const paymentSelect = document.getElementById("payment-method");
  const cartBadge = document.getElementById("cart-badge");

  const searchToggle = document.getElementById("search-toggle");
  const searchRow = document.getElementById("searchRow");
  const globalSearch = document.getElementById("globalSearch");
  const suggestionsEl = document.getElementById("suggestions");

  const filterButtons = document.querySelectorAll(".filter-btn");
  const clothingSizeFilter = document.getElementById("clothingSizeFilter");
  const shoeSizeFilter = document.getElementById("shoeSizeFilter");
  const sortSelect = document.getElementById("sortSelect");

  /* ------------------
     STATE & HELPERS
     ------------------*/
  function money(v) {
    return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }
  function escapeHtml(str) {
    return String(str || "").replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;' })[s];
    });
  }

  // inicial: users / produtos / carrinho / user
  let isRegister = false;
  let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
  let PRODUCTS = [
    { id: 1, title: "Vestido Midi Floral", price: 249.90, category: "roupas", gender: "feminino", sizes: ["PP", "P", "M", "G"], images: ["images/produto1.jpg"], stock: 20, description: "Vestido midi floral elegante, perfeito para ocasiões especiais." },
    { id: 2, title: "Blazer Cropped Bege", price: 349.00, category: "roupas", gender: "feminino", sizes: ["P", "M", "G"], images: ["images/produto2.jpg"], stock: 15, description: "Blazer cropped bege com corte moderno e sofisticado." },
    { id: 3, title: "Tênis Branco Minimal", price: 199.90, category: "calcados", gender: "masculino", sizes: ["38", "39", "40", "41", "42", "43"], images: ["images/produto3.jpg"], stock: 30, description: "Tênis minimalista branco, versátil e confortável." },
    { id: 4, title: "Bolsa Tiracolo Couro", price: 429.50, category: "acessorios", gender: "feminino", sizes: [], images: ["images/produto4.jpg"], stock: 10, description: "Bolsa tiracolo de couro legítimo, elegante e prática." },
    { id: 5, title: "Camisa Slim Fit", price: 159.90, category: "roupas", gender: "masculino", sizes: ["P", "M", "G", "GG"], images: ["images/produto5.jpg"], stock: 25, description: "Camisa slim fit azul, ideal para trabalho e ocasiões formais." },
    { id: 6, title: "Sandália Dourada Festa", price: 289.00, category: "calcados", gender: "feminino", sizes: ["34", "35", "36", "37", "38", "39"], images: ["images/produto6.jpg"], stock: 18, description: "Sandália dourada sofisticada para festas e eventos especiais." }
  ];

  if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify(PRODUCTS));
  } else {
    try { PRODUCTS = JSON.parse(localStorage.getItem("products")); } catch(e) {}
  }

  let CART = JSON.parse(localStorage.getItem("cart")) || [];
  let shippingCost = Number(localStorage.getItem("shippingCost") || 0);
let activeCategory = "all"; // roupas, calcados, acessorios
let activeGender = "all";   // masculino, feminino


 function saveState() {
  localStorage.setItem("cart", JSON.stringify(CART));
  localStorage.setItem("shippingCost", shippingCost.toString());
}

  function updateBadge() {
    if (cartBadge) cartBadge.textContent = CART.reduce((s, i) => s + i.qty, 0);
  }

  /* ------------------
     LOGIN / REGISTRO
     ------------------*/
  function updateUserUI() {
    if (currentUser) {
      userBtn.textContent = `👤 Olá, ${currentUser.name}`;
      userBtn.onclick = () => {
        if (confirm("Deseja sair da sua conta?")) {
          currentUser = null;
          localStorage.removeItem("currentUser");
          updateUserUI();
        }
      };
    } else {
      userBtn.textContent = "👤";
      userBtn.onclick = () => loginModal.classList.remove("hidden");
    }
  }

  loginForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const name = document.getElementById("registerName").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (isRegister) {
      if (users.find(u => u.email === email)) {
        alert("Este email já está cadastrado!");
        return;
      }
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      currentUser = newUser;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      alert("Cadastro realizado com sucesso!");
    } else {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        alert("Email ou senha inválidos!");
        return;
      }
      currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
      alert(`Bem-vindo de volta, ${user.name}`);
    }

    loginModal.classList.add("hidden");
    updateUserUI();
  });

  toggleLogin?.addEventListener("click", (e) => {
    e.preventDefault();
    isRegister = !isRegister;
    if (isRegister) {
      modalTitle.textContent = "Cadastrar";
      registerFields.classList.remove("hidden");
      toggleLogin.innerHTML = 'Já tem conta? <a href="#">Entrar</a>';
    } else {
      modalTitle.textContent = "Entrar";
      registerFields.classList.add("hidden");
      toggleLogin.innerHTML = 'Não tem conta? <a href="#">Cadastre-se</a>';
    }
  });

  closeLogin?.addEventListener("click", () => loginModal.classList.add("hidden"));
  updateUserUI();

  /* ------------------
     RENDER CARRINHO
     ------------------*/
  function renderCart() {
    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = "";
    if (CART.length === 0) {
      cartItemsContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
      cartTotal.textContent = "0,00";
      updateBadge();
      return;
    }

    let subtotal = 0;
    CART.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      const el = document.createElement("div");
      el.className = "cart-item";
      el.innerHTML = `
        <div>
          <p>${escapeHtml(item.title)}</p>
          ${item.size ? `<p><strong>Tamanho:</strong> ${escapeHtml(item.size)}</p>` : ""}
          <p>${money(item.price)} x ${item.qty}</p>
          <div>
            <button data-action="dec" data-idx="${idx}">-</button>
            <span style="margin:0 8px">${item.qty}</span>
            <button data-action="inc" data-idx="${idx}">+</button>
          </div>
        </div>
        <div>
          <button data-action="remove" data-idx="${idx}">Remover</button>
        </div>
      `;
      cartItemsContainer.appendChild(el);
    });

    const total = subtotal + (shippingCost || 0);
    cartTotal.textContent = total.toFixed(2);
    shippingCostText.textContent = `Frete: R$ ${(shippingCost || 0).toFixed(2)}`;
    updateBadge();
  }

  cartItemsContainer?.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);
    if (isNaN(idx) || idx < 0 || idx >= CART.length) return;

    if (action === "inc") CART[idx].qty++;
    if (action === "dec") CART[idx].qty = Math.max(1, CART[idx].qty - 1);
    if (action === "remove") CART.splice(idx, 1);

    saveState();
    renderCart();
  });

  cartIcon?.addEventListener("click", () => {
    cartPopup.classList.toggle("active");
    renderCart();
  });
  closeCartBtn?.addEventListener("click", () => cartPopup.classList.remove("active"));

  completePurchaseBtn?.addEventListener("click", () => {
    if (!currentUser) {
      alert("Você precisa estar logado para finalizar a compra!");
      loginModal.classList.remove("hidden");
      return;
    }
    alert("Compra finalizada (simulação).");
    CART = [];
    saveState();
    renderCart();
  });

  /* ------------------
     BUSCA SUGESTÕES
     ------------------*/
  function renderSuggestions(list) {
    if (!suggestionsEl) return;
    suggestionsEl.innerHTML = "";
    if (!list || list.length === 0) {
      suggestionsEl.classList.add("hidden");
      return;
    }
    suggestionsEl.classList.remove("hidden");
    list.forEach(p => {
      const item = document.createElement("div");
      item.className = "suggestion-item";
      const imgSrc = (p.images && p.images[0]) ? p.images[0] :
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><rect width='100%' height='100%' fill='%23111'/><text x='50%' y='50%' fill='%23b08d57' font-size='10' text-anchor='middle' dominant-baseline='middle'>no image</text></svg>";
      item.innerHTML = `
        <img src="${imgSrc}" alt="${escapeHtml(p.title)}" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'56\\' height=\\'56\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'#111\\'/><text x=\\'50%\\' y=\\'50%\\' fill=\\'%23b08d57\\' font-size=\\'10\\' text-anchor=\\'middle\\' dominant-baseline=\\'middle\\'>no image</text></svg>'" />
        <div class="meta">
          <span class="title">${escapeHtml(p.title)}</span>
          <span class="price">${money(p.price)}</span>
        </div>
      `;
      item.addEventListener("click", () => window.location.href = `produto.html?id=${p.id}`);
      suggestionsEl.appendChild(item);
    });
  }

  // comportamento do botão de busca
  if (searchToggle && searchRow) {
    // esconder por padrão
    searchRow.classList.add("hidden");
    searchRow.style.display = "none";
    searchToggle.addEventListener("click", (ev) => {
      ev.stopPropagation();
      const isHidden = searchRow.classList.contains("hidden") || getComputedStyle(searchRow).display === "none";
      if (isHidden) {
        searchRow.classList.remove("hidden");
        searchRow.style.display = "flex";
        setTimeout(() => globalSearch?.focus(), 50);
      } else {
        searchRow.classList.add("hidden");
        searchRow.style.display = "none";
      }
    });
    document.addEventListener("click", (ev) => {
      if (!searchRow.contains(ev.target) && ev.target !== searchToggle) {
        suggestionsEl?.classList.add("hidden");
      }
    });
  }

  if (globalSearch) {
    globalSearch.addEventListener("input", () => {
      const q = globalSearch.value.trim().toLowerCase();
      if (!q) { suggestionsEl?.classList.add("hidden"); return; }
      const matches = PRODUCTS.filter(p => {
        const t = (p.title || "").toLowerCase();
        const d = (p.description || "").toLowerCase();
        return t.includes(q) || d.includes(q);
      });
      renderSuggestions(matches.slice(0, 8));
    });

    globalSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = globalSearch.value.trim().toLowerCase();
        const match = PRODUCTS.find(p => p.title.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q));
        if (match) window.location.href = `produto.html?id=${match.id}`;
      }
    });
  }

  document.addEventListener("click", (ev) => {
    if (!ev.target.closest || !suggestionsEl) return;
    if (!ev.target.closest('.search-container') && !ev.target.closest('#suggestions')) {
      suggestionsEl.classList.add("hidden");
    }
  });

  /* ------------------
     FILTROS E RENDER DE PRODUTOS
     ------------------*/
  function renderProducts() {
    if (!productsGrid) return;
    productsGrid.innerHTML = "";

    let filtered = PRODUCTS.filter(p => {
   
  // filtro por categoria
if (activeCategory !== "all" && p.category !== activeCategory) {
  return false;
}

// filtro por gênero
if (activeGender !== "all" && p.gender !== activeGender) {
  return false;
}

      // filtro por tamanho de roupas (PP, P, M, G ...)
      if (clothingSizeFilter && clothingSizeFilter.value) {
        if (!p.sizes || !p.sizes.includes(clothingSizeFilter.value)) return false;
      }

      // filtro por numeração de calçados (34,35,...)
      if (shoeSizeFilter && shoeSizeFilter.value) {
        if (!p.sizes || !p.sizes.includes(shoeSizeFilter.value)) return false;
      }

      return true;
    });

    // ordenação
    if (sortSelect && sortSelect.value) {
      if (sortSelect.value === "price-asc") filtered.sort((a, b) => a.price - b.price);
      if (sortSelect.value === "price-desc") filtered.sort((a, b) => b.price - a.price);
    }

    if (filtered.length === 0) {
      productsGrid.innerHTML = "<p>Nenhum produto encontrado com esses filtros.</p>";
      return;
    }

    filtered.forEach(p => {
      const card = document.createElement("div");
      card.className = "product-card";
      const img = (p.images && p.images[0]) ? p.images[0] : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='320' height='240'><rect width='100%' height='100%' fill='%23eee'/></svg>";
      card.innerHTML = `
        <a href="produto.html?id=${p.id}" class="product-card-link">
          <img src="${img}" alt="${escapeHtml(p.title)}" />
          <div class="product-info">
            <h3>${escapeHtml(p.title)}</h3>
            <div class="price">${money(p.price)}</div>
          </div>
        </a>
      `;
      productsGrid.appendChild(card);
    });
  }

  // eventos dos botões de filtro
filterButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const filter = btn.dataset.filter;

    // categoria
    if (["roupas", "calcados", "acessorios"].includes(filter)) {
      activeCategory = filter;
    }

    // gênero
    if (["masculino", "feminino"].includes(filter)) {
      activeGender = filter;
    }

    // resetar filtros
    if (filter === "all") {
      activeCategory = "all";
      activeGender = "all";
    }

    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProducts();
  });
});


  clothingSizeFilter?.addEventListener("change", () => renderProducts());
  shoeSizeFilter?.addEventListener("change", () => renderProducts());
  sortSelect?.addEventListener("change", () => renderProducts());

  /* ------------------
     SHIPPING (calc simples)
     ------------------*/
 document.getElementById("calculate-shipping")?.addEventListener("click", () => {
  const cep = (shippingInput?.value || "").replace(/\D/g, "");
  if (!cep || cep.length < 8) {
    alert("Digite um CEP válido (ex: 01450-000).");
    return;
  }

  // 👉 sempre recarregar o carrinho do localStorage
  CART = JSON.parse(localStorage.getItem("cart")) || [];

  // Simulação simples: frete fixo
  shippingCost = 25.00;
  shippingCostText.textContent = `Frete: R$ ${shippingCost.toFixed(2)}`;

  saveState();
  renderCart();
});


  /* ------------------
     UTIL / INIT
     ------------------*/
  function renderFeatured() {
    if (!featuredGrid) return;
    featuredGrid.innerHTML = "";
    PRODUCTS.slice(0, 4).forEach(p => {
      const el = document.createElement("div");
      el.className = "product-item";
      el.innerHTML = `
        <img src="${(p.images && p.images[0]) ? p.images[0] : ''}" alt="${escapeHtml(p.title)}" />
        <h3>${escapeHtml(p.title)}</h3>
        <p class="price">${money(p.price)}</p>
      `;
      featuredGrid.appendChild(el);
    });
  }

  function init() {
    renderFeatured();
    renderProducts();
    renderCart();
    updateBadge();
  }

  init();
});
