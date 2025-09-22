document.addEventListener("DOMContentLoaded", () => {
  // --------------------------
  // Dados iniciais (exemplo)
  // --------------------------
  const sampleProducts = [
    { id:1, title:'Vestido Midi Floral', category:'roupas', price:249.90, stock:6, images:['images/produto1.jpg'], sizes:['P','M','G'], colors:['Floral'], rating:4.5, reviews:[{name:'Mariana', stars:5, text:'Amei a modelagem!'}] },
    { id:2, title:'Blazer Cropped Bege', category:'roupas', price:349.00, stock:4, images:['images/produto2.jpg'], sizes:['PP','P','M'], colors:['Bege'], rating:4.8, reviews:[] },
    { id:3, title:'Tênis Branco Minimal', category:'calcados', price:199.90, stock:10, images:['images/produto3.jpg'], sizes:['36','37','38','39'], colors:['Branco'], rating:4.2, reviews:[] },
    { id:4, title:'Bolsa Tiracolo Couro', category:'acessorios', price:429.50, stock:3, images:['images/produto4.jpg'], sizes:[], colors:['Caramelo'], rating:4.9, reviews:[] }
  ];

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
  function saveState() { localStorage.setItem('cart', JSON.stringify(CART)); localStorage.setItem('products', JSON.stringify(PRODUCTS)); }
  function updateBadge() { cartBadge.textContent = CART.reduce((s,i)=>s+i.qty,0) || 0; }

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
        <div class="rating">
          ${'★'.repeat(Math.floor(p.rating))}${'☆'.repeat(5-Math.floor(p.rating))}
          <span class="small-text">(${(p.reviews||[]).length})</span>
        </div>
        <div class="actions">
          <button class="btn-primary add-btn" data-id="${p.id}">Adicionar</button>
          <a href="produto.html?id=${p.id}" class="btn-secondary">Ver Detalhes</a>
        </div>
      </div>
    `;
    productsGrid.appendChild(div);
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

      `;
      productsGrid.appendChild(div);
    });
  }

  // --------------------------
  // Carrinho
  // --------------------------
  function addToCartById(id) {
    const p = PRODUCTS.find(x => x.id === Number(id));
    if(!p) return;
    const ex = CART.find(i=>i.id===p.id);
    if(ex) {
      if(ex.qty < p.stock) ex.qty++;
      else alert('Estoque insuficiente');
    } else {
      CART.push({ id: p.id, title: p.title, price: p.price, qty: 1, img: p.images[0] });
    }
    saveState();
    renderCart();
    updateBadge();
  }

  function renderCart(){
    cartItemsContainer.innerHTML = '';
    if(CART.length === 0) cartItemsContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    let subtotal = 0;
    CART.forEach((item, idx) => {
      subtotal += item.price * item.qty;
      const el = document.createElement('div');
      el.className = 'cart-item';
      el.innerHTML = `
        <div>
          <p>${item.title}</p>
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
    updateBadge();
  }

  // Delegação para botões do carrinho
  cartItemsContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);
    if(action === 'inc') { CART[idx].qty++; renderCart(); saveState(); }
    if(action === 'dec') { CART[idx].qty = Math.max(1, CART[idx].qty - 1); renderCart(); saveState(); }
    if(action === 'remove') { CART.splice(idx,1); renderCart(); saveState(); }
  });

  // --------------------------
  // Calcular frete (ViaCEP + Nominatim)
  // --------------------------
  async function calculateShipping(cepRaw) {
    const cep = cepRaw.replace(/\D/g,'');
    if(cep.length < 8) {
      shippingCost = 0; shippingCostText.textContent = 'Frete: R$ 0,00'; renderCart(); return;
    }
    try {
      const viaCepResp = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const viaCepData = await viaCepResp.json();
      if(viaCepData.erro) throw new Error('CEP inválido');

      const endereco = `${viaCepData.logradouro || ''} ${viaCepData.localidade} ${viaCepData.uf} Brasil`;
      const geoResp = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`);
      const geoData = await geoResp.json();
      if(!geoData || !geoData[0]) throw new Error('Endereço não encontrado');

      const destLat = parseFloat(geoData[0].lat), destLng = parseFloat(geoData[0].lon);

      // Haversine
      const R = 6371;
      const dLat = (destLat - lojaLat) * Math.PI / 180;
      const dLon = (destLng - lojaLng) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(lojaLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) * Math.sin(dLon/2)**2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distancia = R * c; // km

      shippingCost = Math.min(200, Math.max(20, distancia * 0.5));
      shippingCostText.textContent = `Frete: R$ ${shippingCost.toFixed(2)}`;
      renderCart();
    } catch(err) {
      console.error(err);
      shippingCost = 0;
      shippingCostText.textContent = 'Frete: R$ 0,00';
      renderCart();
    }
  }

  // --------------------------
  // Eventos gerais / delegação
  // --------------------------
  // Abrir/fechar carrinho
  cartIcon.addEventListener('click', () => {
    cartPopup.classList.toggle('active');
    cartPopup.setAttribute('aria-hidden', cartPopup.classList.contains('active') ? 'false' : 'true');
    renderCart();
  });
  closeCartBtn.addEventListener('click', () => cartPopup.classList.remove('active'));

  // Calcular frete ao digitar CEP (com debounce simples)
  let cepTimer;
  if(shippingInput) {
    shippingInput.addEventListener('input', (e) => {
      clearTimeout(cepTimer);
      cepTimer = setTimeout(() => {
        if(e.target.value.trim().length >= 8) calculateShipping(e.target.value.trim());
      }, 600);
    });
  }

  // Finalizar compra (simulado)
  completePurchaseBtn.addEventListener('click', () => {
    const total = parseFloat(cartTotal.textContent || '0');
    if(total <= 0) { alert('Seu carrinho está vazio.'); return; }
    if(!shippingInput.value.trim()) { alert('Informe um CEP para calcular o frete.'); return; }
    const paymentMethod = paymentSelect.value;
    alert(`Compra finalizada!\nTotal: R$ ${total.toFixed(2)}\nPagamento: ${paymentMethod} (simulado)`);
    CART = []; shippingCost = 0; shippingInput.value = ''; saveState(); renderCart(); cartPopup.classList.remove('active');
  });

  // Adicionar por botões (delegação)
  document.body.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-btn');
    const viewBtn = e.target.closest('.view-btn');
    if(addBtn) { addToCartById(addBtn.dataset.id); }
    if(viewBtn) { openProductModal(Number(viewBtn.dataset.id)); }
  });

  // Buscas com sugestões simples
  if(globalSearch) {
    globalSearch.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if(!q) { suggestions.classList.add('hidden'); return; }
      const matches = PRODUCTS.filter(p => (p.title + ' ' + (p.colors||[]).join(' ')).toLowerCase().includes(q)).slice(0,6);
      if(matches.length === 0) { suggestions.classList.add('hidden'); return; }
      suggestions.innerHTML = matches.map(m => `<button class="suggestion-item" data-id="${m.id}"><img src="${m.images[0] || 'images/produto1.jpg'}" alt="${m.title}" style="width:60px;height:60px;object-fit:cover;margin-right:8px;border-radius:6px"/> <div><strong>${m.title}</strong><div style="font-size:0.9rem">${money(m.price)}</div></div></button>`).join('');
      suggestions.classList.remove('hidden');
    });

    suggestions.addEventListener('click', (ev) => {
      const btn = ev.target.closest('button.suggestion-item');
      if(!btn) return;
      const id = Number(btn.dataset.id);
      openProductModal(id);
      suggestions.classList.add('hidden');
      globalSearch.value = '';
    });
  }

  // Mostra/oculta campo de busca (mobile)
  if(searchToggle && searchRow) {
    searchToggle.addEventListener('click', () => {
      searchRow.classList.toggle('visible');
      if(searchRow.classList.contains('visible')) searchRow.style.display = 'flex';
      else searchRow.style.display = 'none';
    });
  }

  // Filtrar produtos (simplificado)
  document.querySelectorAll('.filter-btn').forEach(b => b.addEventListener('click', (e) => {
    document.querySelectorAll('.filter-btn').forEach(x=>x.classList.remove('active'));
    e.currentTarget.classList.add('active');
    const f = e.currentTarget.dataset.filter;
    if(f === 'all') renderProducts();
    else renderProducts(PRODUCTS.filter(p => p.category === f));
  }));

  // Filtros e ordenação inputs
  document.getElementById('sizeFilter').addEventListener('change', applyFilters);
  document.getElementById('colorFilter').addEventListener('change', applyFilters);
  document.getElementById('priceMin').addEventListener('input', applyFilters);
  document.getElementById('priceMax').addEventListener('input', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', () => {
    const val = document.getElementById('sortSelect').value;
    let list = [...PRODUCTS];
    if(val === 'price-asc') list.sort((a,b)=>a.price - b.price);
    if(val === 'price-desc') list.sort((a,b)=>b.price - a.price);
    if(val === 'rating-desc') list.sort((a,b)=>b.rating - a.rating);
    renderProducts(list);
  });

  function applyFilters(){
    let list = [...PRODUCTS];
    const size = document.getElementById('sizeFilter').value;
    const color = document.getElementById('colorFilter').value;
    const minP = parseFloat(document.getElementById('priceMin').value) || 0;
    const maxP = parseFloat(document.getElementById('priceMax').value) || Infinity;
    list = list.filter(p => {
      let okSize = true;
      let okColor = true;
      if(size && p.sizes.length) okSize = p.sizes.includes(size);
      if(color) okColor = p.colors.includes(color);
      return okSize && okColor && p.price >= minP && p.price <= maxP;
    });
    renderProducts(list);
  }

  // --------------------------
  // Modal de produto (simulado)
  // --------------------------
  const modalBg = document.getElementById('modalBg');
  const modalContent = document.getElementById('modalContent');

  function openProductModal(pId) {
    const p = PRODUCTS.find(x=>x.id===pId);
    if(!p) return;
    modalContent.innerHTML = `
      <div class="modal-body">
        <div style="display:flex;gap:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:260px"><img src="${p.images[0]||'images/produto1.jpg'}" alt="${p.title}" style="width:100%;border-radius:8px"/></div>
          <div style="flex:1.2;min-width:260px">
            <h2>${p.title}</h2>
            <p style="font-weight:700">${money(p.price)}</p>
            <p>Disponível: ${p.stock}</p>
            <p>Tamanhos: ${p.sizes.length ? p.sizes.join(', ') : 'Único'}</p>
            <div style="margin-top:12px"><button id="modalAddBtn" class="btn-primary">Adicionar ao carrinho</button> <button id="modalFavBtn" class="btn-secondary">❤ Favoritar</button></div>
            <div style="margin-top:16px">
              <h4>Avaliações</h4>
              <div id="reviewsArea">${(p.reviews||[]).length ? p.reviews.map(r=>`<div style="padding:8px 0;border-top:1px dashed #eee"><strong>${r.name}</strong> · ${'★'.repeat(r.stars)}<div style="font-size:0.95rem;color:#666">${r.text}</div></div>`).join('') : '<div class="small-text">Seja o primeiro a avaliar</div>'}</div>
              <textarea id="reviewText" placeholder="Deixe sua avaliação" style="width:100%;margin-top:8px;padding:8px;border-radius:6px;border:1px solid #ddd"></textarea>
              <div style="margin-top:8px;display:flex;gap:8px"><select id="reviewStars"><option value="5">5 estrelas</option><option value="4">4</option><option value="3">3</option><option value="2">2</option><option value="1">1</option></select><button id="sendReview" class="btn-primary">Enviar</button></div>
            </div>
          </div>
        </div>
        <div style="margin-top:12px;text-align:right"><button id="closeModal" class="btn-secondary">Fechar</button></div>
      </div>
    `;
    modalBg.classList.remove('hidden');

    document.getElementById('closeModal').addEventListener('click', ()=> modalBg.classList.add('hidden'));
    document.getElementById('modalAddBtn').addEventListener('click', () => { addToCartById(pId); modalBg.classList.add('hidden'); });
    document.getElementById('modalFavBtn').addEventListener('click', ()=> alert('Adicionado aos favoritos (simulado)'));
    document.getElementById('sendReview').addEventListener('click', () => {
      const txt = document.getElementById('reviewText').value.trim();
      const stars = Number(document.getElementById('reviewStars').value);
      if(!txt) { alert('Escreva um comentário'); return; }
      p.reviews = p.reviews || []; p.reviews.push({ name: 'Anônimo', stars, text: txt });
      p.rating = p.reviews.reduce((s,r)=>s+r.stars,0) / p.reviews.length;
      saveState(); renderProducts(); openProductModal(pId); // reabrir para atualizar
    });
  }

  // --------------------------
  // Inicialização
  // --------------------------
  function init() {
    renderFeatured();
    renderProducts();
    renderCart();
    updateBadge();
    // garantir que searchRow seja escondida por padrão em mobile
    if(window.innerWidth < 992 && searchRow) searchRow.style.display = 'none';
  }

  init();

});
const express = require("express");
const bodyParser = require("body-parser");
const mercadopago = require("mercadopago");
const cors = require("cors");
const Correios = require("node-correios");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const correios = new Correios();

// Configurar Mercado Pago (coloque sua chave aqui)
mercadopago.configurations.setAccessToken("SUA_CHAVE_MERCADO_PAGO");

// 📦 Rota para calcular frete com Correios
app.post("/api/calculate_shipping", async (req, res) => {
  const { cepDestino } = req.body;

  if (!cepDestino) {
    return res.status(400).json({ error: "CEP de destino é obrigatório" });
  }

  const args = {
    sCepOrigem: "14050030", // CEP da loja (Ribeirão Preto)
    sCepDestino: cepDestino.replace(/\D/g, ""), // limpar caracteres não numéricos
    nVlPeso: 1, // peso padrão em kg (ajuste se necessário)
    nCdFormato: 1, // caixa/pacote
    nVlComprimento: 20,
    nVlAltura: 10,
    nVlLargura: 15,
    nVlDiametro: 0,
    nCdServico: ["04510", "04014"], // PAC (04510), SEDEX (04014)
  };

  try {
    const result = await correios.calcPrecoPrazo(args);
    res.json(result);
  } catch (error) {
    console.error("Erro ao calcular frete:", error);
    res.status(500).json({ error: "Não foi possível calcular frete" });
  }
});

// 📑 Rota de pagamento (Pix, boleto, cartão, Mercado Pago)
app.post("/api/checkout", async (req, res) => {
  const { total, paymentMethod } = req.body;

  if (!total || !paymentMethod) {
    return res.status(400).json({ error: "Dados de pagamento inválidos" });
  }

  try {
    const preference = {
      items: [
        {
          title: "Compra Antonella Clothing",
          quantity: 1,
          currency_id: "BRL",
          unit_price: parseFloat(total),
        },
      ],
      payment_methods: {
        excluded_payment_types: [],
        installments: 12,
      },
    };

    const response = await mercadopago.preferences.create(preference);
    res.json({ init_point: response.body.init_point });
  } catch (error) {
    console.error("Erro no pagamento:", error);
    res.status(500).json({ error: "Erro ao processar pagamento" });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
function renderProductPage(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) {
    document.getElementById("product-detail").innerHTML = "<p>Produto não encontrado.</p>";
    return;
  }

  const container = document.getElementById("product-detail");
  container.innerHTML = `
    <img src="${product.images[0]}" alt="${product.title}" />
    <div class="product-detail-info">
      <h2>${product.title}</h2>
      <p class="price">${money(product.price)}</p>
      <p>Estoque disponível: ${product.stock}</p>

      ${product.sizes.length ? `
        <label for="sizeSelect">Tamanho:</label>
        <select id="sizeSelect">
          ${product.sizes.map(s => `<option>${s}</option>`).join("")}
        </select>
      ` : ""}

      <button class="btn-primary" onclick="addToCartById(${product.id})">Adicionar ao Carrinho</button>

      <div class="reviews">
        <h3>Avaliações</h3>
        <div id="reviewsList">
          ${product.reviews?.map(r => `
            <div><strong>${r.name}</strong> - ${'★'.repeat(r.stars)}<p>${r.text}</p></div>
          `).join("") || "<p>Seja o primeiro a avaliar!</p>"}
        </div>
        <textarea id="newReview" placeholder="Escreva sua avaliação..."></textarea>
        <select id="newStars">
          <option value="5">5 estrelas</option>
          <option value="4">4</option>
          <option value="3">3</option>
          <option value="2">2</option>
          <option value="1">1</option>
        </select>
        <button class="btn-secondary" onclick="addReview(${product.id})">Enviar Avaliação</button>
      </div>
    </div>
  `;
}

function addReview(id) {
  const product = PRODUCTS.find(p => p.id === id);
  if (!product) return;
  const text = document.getElementById("newReview").value.trim();
  const stars = parseInt(document.getElementById("newStars").value);
  if (!text) { alert("Digite um comentário."); return; }

  product.reviews.push({ name: "Cliente", stars, text });
  product.rating = product.reviews.reduce((s,r)=>s+r.stars,0)/product.reviews.length;
  saveState();
  renderProductPage(id);
}
