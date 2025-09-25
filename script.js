document.addEventListener("DOMContentLoaded", () => {

const userBtn = document.getElementById("user-btn");
const loginModal = document.getElementById("loginModal");
const closeLogin = document.getElementById("closeLogin");
const loginForm = document.getElementById("loginForm");
const toggleLogin = document.getElementById("toggleLogin");
const registerFields = document.getElementById("registerFields");
const modalTitle = document.getElementById("modal-title");

let isRegister = false;
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;

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
    userBtn.onclick = () => {
      loginModal.classList.remove("hidden");
    };
  }
}

loginForm.addEventListener("submit", (e) => {
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

toggleLogin.addEventListener("click", (e) => {
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

closeLogin.addEventListener("click", () => {
  loginModal.classList.add("hidden");
});

updateUserUI();

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
    userBtn.onclick = () => {
      loginModal.classList.remove("hidden"); // 👈 abre o modal só ao clicar
    };
  }
}


  // Estado
  let PRODUCTS = JSON.parse(localStorage.getItem('products')) || sampleProducts;
  let CART = JSON.parse(localStorage.getItem('cart')) || [];
  let shippingCost = 0;

  // DOM
  const featuredGrid = document.getElementById('featuredGrid');
  const productsGrid = document.getElementById('productsGrid');
  const cartIcon = document.getElementById('cart-icon');
  const cartPopup = document.getElementById('cart-popup');
  const closeCartBtn = document.getElementById('close-cart');
  const cartItemsContainer = document.getElementById('cart-items');
  const cartTotal = document.getElementById('cart-total');
  const shippingInput = document.getElementById('cep');
  const shippingCostText = document.getElementById('shipping-cost');
  const completePurchaseBtn = document.getElementById('complete-purchase');
  const paymentSelect = document.getElementById('payment-method');
  const cartBadge = document.getElementById('cart-badge');
  const suggestions = document.getElementById('suggestions');
  const globalSearch = document.getElementById('globalSearch');
  const searchToggle = document.getElementById('search-toggle');
  const searchRow = document.getElementById('searchRow');

  // loja coords Ribeirão Preto (usado no cálculo alternativo)
  const lojaLat = -21.1699;
  const lojaLng = -47.8096;

  // --------------------------
  // Funções utilitárias
  // --------------------------
  function money(v) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function saveState() { 
    localStorage.setItem('cart', JSON.stringify(CART)); 
    localStorage.setItem('products', JSON.stringify(PRODUCTS)); 
  }
   function updateBadge() {
      const badge = document.getElementById("cart-badge");
      badge.textContent = CART.reduce((s, i) => s + i.qty, 0);
    }


  // --------------------------
  // Render produtos & destaques
  // --------------------------
  function renderProducts(list = PRODUCTS) {
    productsGrid.innerHTML = '';
    list.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
        <img src="${p.images[0] || 'images/produto1.jpg'}" alt="${p.title}" />
        <div class="product-info">
          <h3>${p.title}</h3>
          <div class="price">${money(p.price)}</div>
          <div class="rating">${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))} <span class="small-text">(${(p.reviews||[]).length})</span></div>
          <div class="actions">
            <button class="btn-primary add-btn" data-id="${p.id}">Adicionar</button>
            <a href="produto.html?id=${p.id}" class="btn-secondary">Ver Detalhes</a>
          </div>
        </div>
      `;
      productsGrid.appendChild(div);

window.addEventListener("load", () => {
  CART = JSON.parse(localStorage.getItem("cart")) || [];
  if (cartBadge) updateBadge();
});

    });
  }

  function renderFeatured() {
    featuredGrid.innerHTML = '';
    const top = PRODUCTS.slice(0,4);
    top.forEach(p => {
      const div = document.createElement('div');
      div.className = 'product-item';
      div.innerHTML = `
        <img src="${p.images[0] || 'images/produto1.jpg'}" alt="${p.title}" />
        <h3>${p.title}</h3>
        <p>${money(p.price)}</p>
        <a href="produto.html?id=${p.id}" class="btn-secondary">Ver Detalhes</a>
      `;
      featuredGrid.appendChild(div);
    });
  }

  // --------------------------
  // Carrinho
  // --------------------------
  function addToCartById(id) {
    const card = document.querySelector(`.add-btn[data-id="${id}"]`)?.closest('.product-card');
    const p = PRODUCTS.find(x => x.id === Number(id));
    if(!p) return;

    // pega quantidade
    const qtyInput = card ? card.querySelector(".qty-input") : null;
    const qty = qtyInput ? parseInt(qtyInput.value) : 1;

    // pega tamanho
    let selectedSize = null;
    const sizeEl = card ? card.querySelector(".size-option.selected") : null;
    if(p.sizes?.length && !sizeEl) {
      alert("Selecione um tamanho antes de adicionar ao carrinho.");
      return;
    }
    if(sizeEl) selectedSize = sizeEl.textContent.trim();

    // já existe no carrinho?
    const existing = CART.find(i => i.id === p.id && i.size === selectedSize);
    if(existing) {
      if(existing.qty + qty <= p.stock) existing.qty += qty;
      else { alert("Estoque insuficiente"); return; }
    } else {
      CART.push({
        id: p.id,
        title: p.title,
        price: p.price,
        qty: qty,
        img: p.images[0],
        size: selectedSize
      });
    }

    saveState();
    renderCart();
    updateBadge(); // ✅ aqui
  }

  function renderCart(){
    cartItemsContainer.innerHTML = '';
    if(CART.length === 0) {
      cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
      cartTotal.textContent = "0,00";
      updateBadge(); // ✅ mostra 0
      return;
    }

    let subtotal = 0;
    CART.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div>
          <p>${item.title}</p>
          ${item.size ? `<p><strong>Tamanho:</strong> ${item.size}</p>` : ""}
          <p>R$ ${item.price.toFixed(2)} x ${item.qty}</p>
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

    updateBadge(); // ✅ sempre
  }

  // Delegação para botões do carrinho
  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);

    if(action === 'inc') {
      CART[idx].qty++;
      renderCart();
      saveState();
      updateBadge(); // ✅
    }

    if(action === 'dec') {
      CART[idx].qty = Math.max(1, CART[idx].qty - 1);
      renderCart();
      saveState();
      updateBadge(); // ✅
    }

    if(action === 'remove') {
      CART.splice(idx,1);
      renderCart();
      saveState();
      updateBadge(); // ✅
    }
  });

  // --------------------------
  // Eventos gerais
  // --------------------------
  cartIcon.addEventListener('click', () => {
    cartPopup.classList.toggle('active');
    cartPopup.setAttribute('aria-hidden', cartPopup.classList.contains('active') ? 'false' : 'true');
    renderCart();
  });
  closeCartBtn.addEventListener('click', () => cartPopup.classList.remove('active'));

  // Finalizar compra
  
 completePurchaseBtn.addEventListener('click', () => {
  // 🔒 Verifica login antes de finalizar
  if (!currentUser) {
    alert("Você precisa estar logado para finalizar a compra!");
    loginModal.classList.remove("hidden"); // abre a aba de login
    return;
  }

  const total = parseFloat(cartTotal.textContent || '0');
  if(total <= 0) { alert('Seu carrinho está vazio.'); return; }
  if(!shippingInput.value.trim()) { alert('Informe um CEP para calcular o frete.'); return; }
  const paymentMethod = paymentSelect.value;

  alert(`Compra finalizada!\nTotal: R$ ${total.toFixed(2)}\nPagamento: ${paymentMethod} (simulado)`);

  CART = [];
  shippingCost = 0;
  shippingInput.value = '';
  saveState();
  renderCart();
  updateBadge();
  cartPopup.classList.remove('active');
});

  // --------------------------
  // Inicialização
  // --------------------------
  function init() {
    renderFeatured();
    renderProducts();
    renderCart();
    updateBadge(); // ✅ logo ao carregar
    if(window.innerWidth < 992 && searchRow) searchRow.style.display = 'none';
  }

  init();

  // 🔥 Força badge certo ao carregar página
  CART = JSON.parse(localStorage.getItem("cart")) || [];
  renderCart();
  updateBadge();

});

function init() {
  renderFeatured();
  renderProducts();
  renderCart();
  if (cartBadge) updateBadge(); // ✅ só chama se o badge existe
  if(window.innerWidth < 992 && searchRow) searchRow.style.display = 'none';
}

init();

// 🔥 Garante que o badge aparece certo mesmo sem clicar em nada
window.addEventListener("load", () => {
  CART = JSON.parse(localStorage.getItem("cart")) || [];
  renderCart();
  if (cartBadge) updateBadge();
});

 document.addEventListener("DOMContentLoaded", () => {
      renderProductDetails(productId);
      renderCart();
      updateBadge();
    });


// ------------------------------------
// RESTANTE DO SEU SCRIPT (backend Express, MercadoPago, Correios, Produto.html, etc.)
// NÃO APAGUEI NADA
// ------------------------------------
