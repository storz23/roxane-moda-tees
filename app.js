/* ==========================================================================
   ROXANE MODA - T-SHIRT STUDIO & E-COMMERCE APPLICATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  // --- APPLICATION STATE ---
  const state = {
    apparel: {
      model: 'oversized',
      modelPrices: {
        oversized: 45000,
        standard: 40000,
        crop: 38000,
        hoodie: 85000
      },
      modelNames: {
        oversized: 'Oversized Heavyweight (240g)',
        standard: 'Standard Fit Cotton (180g)',
        crop: 'Urban Crop Top Cut',
        hoodie: 'Heavyweight Urban Hoodie'
      },
      color: '#111215',
      size: 'M',
      view: 'front' // 'front' | 'back'
    },
    // Canvas layers for front & back views
    canvasLayers: {
      front: [],
      back: []
    },
    selectedElementId: null,
    quantity: 1,
    cart: []
  };

  // --- DOM ELEMENTS ---
  const canvas = document.getElementById('interactiveCanvas');
  const ctx = canvas.getContext('2d');
  
  const tshirtSvg = document.getElementById('tshirtSvg');
  const tshirtWrapper = document.getElementById('tshirtWrapper');
  const colorSwatches = document.querySelectorAll('.color-swatch');
  const apparelModelSelect = document.getElementById('apparelModelSelect');
  const apparelSizeSelect = document.getElementById('apparelSizeSelect');
  
  const viewFrontBtn = document.getElementById('viewFrontBtn');
  const viewBackBtn = document.getElementById('viewBackBtn');
  
  // Tab Controls
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  // Text Inputs
  const textInput = document.getElementById('textInput');
  const fontFamilySelect = document.getElementById('fontFamilySelect');
  const textColorPicker = document.getElementById('textColorPicker');
  const fontSizeRange = document.getElementById('fontSizeRange');
  const fontSizeVal = document.getElementById('fontSizeVal');
  const addTextBtn = document.getElementById('addTextBtn');
  
  // Graphics & Upload
  const graphicItems = document.querySelectorAll('.graphic-item');
  const imageUploadInput = document.getElementById('imageUploadInput');
  const clearCanvasBtn = document.getElementById('clearCanvasBtn');
  const flipCanvasBtn = document.getElementById('flipCanvasBtn');
  
  // Summary & Price Elements
  const summaryModelText = document.getElementById('summaryModelText');
  const summaryFrontPrice = document.getElementById('summaryFrontPrice');
  const summaryBackPrice = document.getElementById('summaryBackPrice');
  const summaryDiscountText = document.getElementById('summaryDiscountText');
  const totalUnitPrice = document.getElementById('totalUnitPrice');
  const qtyValue = document.getElementById('qtyValue');
  const qtyMinusBtn = document.getElementById('qtyMinusBtn');
  const qtyPlusBtn = document.getElementById('qtyPlusBtn');
  const addToCartStudioBtn = document.getElementById('addToCartStudioBtn');
  const directWhatsappBtn = document.getElementById('directWhatsappBtn');
  
  // Cart & Modals
  const cartOpenBtn = document.getElementById('cartOpenBtn');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartCountBadge = document.getElementById('cartCountBadge');
  const cartSubtotalText = document.getElementById('cartSubtotalText');
  const cartTotalText = document.getElementById('cartTotalText');
  
  const checkoutModalOpenBtn = document.getElementById('checkoutModalOpenBtn');
  const checkoutWhatsappBtn = document.getElementById('checkoutWhatsappBtn');
  const checkoutModal = document.getElementById('checkoutModal');
  const checkoutModalCloseBtn = document.getElementById('checkoutModalCloseBtn');

  // --- INITIALIZATION ---
  function init() {
    setupEventListeners();
    updateApparelColor(state.apparel.color);
    renderCanvas();
    updatePriceSummary();
  }

  // --- CANVAS RENDERING ENGINE ---
  function renderCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const currentSideElements = state.canvasLayers[state.apparel.view];
    
    currentSideElements.forEach((el) => {
      ctx.save();
      ctx.translate(el.x, el.y);
      ctx.rotate((el.rotation * Math.PI) / 180);
      
      if (el.type === 'text') {
        ctx.font = `${el.fontSize}px "${el.fontFamily}"`;
        ctx.fillStyle = el.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Glow effect for dark themes
        ctx.shadowColor = el.color;
        ctx.shadowBlur = 4;
        
        ctx.fillText(el.text, 0, 0);
      } else if (el.type === 'image' && el.imgObj) {
        const w = el.width * el.scale;
        const h = el.height * el.scale;
        ctx.drawImage(el.imgObj, -w / 2, -h / 2, w, h);
      }
      
      // Draw selection boundary if active
      if (el.id === state.selectedElementId) {
        ctx.strokeStyle = '#00f2fe';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        
        const bWidth = el.type === 'text' ? ctx.measureText(el.text).width + 16 : el.width * el.scale + 10;
        const bHeight = el.type === 'text' ? el.fontSize + 12 : el.height * el.scale + 10;
        
        ctx.strokeRect(-bWidth / 2, -bHeight / 2, bWidth, bHeight);
      }
      
      ctx.restore();
    });
  }

  // --- CANVAS DRAG & DROP INTERACTION ---
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;

  canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const elements = state.canvasLayers[state.apparel.view];
    let found = false;
    
    // Reverse loop to pick top elements first
    for (let i = elements.length - 1; i >= 0; i--) {
      const el = elements[i];
      const dist = Math.hypot(clickX - el.x, clickY - el.y);
      
      if (dist < 45) { // Simple hit test radius
        state.selectedElementId = el.id;
        isDragging = true;
        dragStartX = clickX - el.x;
        dragStartY = clickY - el.y;
        found = true;
        break;
      }
    }
    
    if (!found) {
      state.selectedElementId = null;
    }
    
    renderCanvas();
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !state.selectedElementId) return;
    
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    
    const elements = state.canvasLayers[state.apparel.view];
    const el = elements.find(item => item.id === state.selectedElementId);
    
    if (el) {
      el.x = Math.max(20, Math.min(canvas.width - 20, clickX - dragStartX));
      el.y = Math.max(20, Math.min(canvas.height - 20, clickY - dragStartY));
      renderCanvas();
    }
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // --- EVENT LISTENERS ---
  function setupEventListeners() {
    // Studio Tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabPanels.forEach(p => p.classList.remove('active'));
        
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
      });
    });

    // Apparel Model & Size Change
    apparelModelSelect.addEventListener('change', (e) => {
      state.apparel.model = e.target.value;
      summaryModelText.textContent = state.apparel.modelNames[e.target.value];
      updatePriceSummary();
    });

    apparelSizeSelect.addEventListener('change', (e) => {
      state.apparel.size = e.target.value;
    });

    // Color Swatches
    colorSwatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        const hex = swatch.getAttribute('data-color');
        state.apparel.color = hex;
        updateApparelColor(hex);
      });
    });

    // View Switcher (Front / Back)
    viewFrontBtn.addEventListener('click', () => switchView('front'));
    viewBackBtn.addEventListener('click', () => switchView('back'));
    flipCanvasBtn.addEventListener('click', () => switchView(state.apparel.view === 'front' ? 'back' : 'front'));

    // Text Input & Customization
    fontSizeRange.addEventListener('input', (e) => {
      fontSizeVal.textContent = `${e.target.value}px`;
    });

    addTextBtn.addEventListener('click', () => {
      const text = textInput.value.trim();
      if (!text) return;
      
      const newEl = {
        id: 'text_' + Date.now(),
        type: 'text',
        text: text,
        fontFamily: fontFamilySelect.value,
        color: textColorPicker.value,
        fontSize: parseInt(fontSizeRange.value, 10),
        rotation: 0,
        x: canvas.width / 2,
        y: canvas.height / 2
      };

      state.canvasLayers[state.apparel.view].push(newEl);
      state.selectedElementId = newEl.id;
      renderCanvas();
      updatePriceSummary();
      textInput.value = '';
    });

    // Preset Graphics Click
    graphicItems.forEach(item => {
      item.addEventListener('click', () => {
        const src = item.getAttribute('data-src');
        loadGraphicToCanvas(src);
      });
    });

    // Custom Image Upload
    imageUploadInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        loadGraphicToCanvas(event.target.result);
      };
      reader.readAsDataURL(file);
    });

    // Clear Canvas
    clearCanvasBtn.addEventListener('click', () => {
      state.canvasLayers[state.apparel.view] = [];
      state.selectedElementId = null;
      renderCanvas();
      updatePriceSummary();
    });

    // Quantity Picker
    qtyMinusBtn.addEventListener('click', () => {
      if (state.quantity > 1) {
        state.quantity--;
        qtyValue.textContent = state.quantity;
        updatePriceSummary();
      }
    });

    qtyPlusBtn.addEventListener('click', () => {
      state.quantity++;
      qtyValue.textContent = state.quantity;
      updatePriceSummary();
    });

    // Add Studio Custom Design to Cart
    addToCartStudioBtn.addEventListener('click', () => {
      const frontCount = state.canvasLayers.front.length;
      const backCount = state.canvasLayers.back.length;
      
      if (frontCount === 0 && backCount === 0) {
        alert('💡 Por favor agrega al menos un texto o gráfico a tu camiseta antes de añadirla al carrito.');
        return;
      }

      const itemPrice = calculateUnitPrice();
      const cartItem = {
        id: 'custom_' + Date.now(),
        name: `Camiseta Personalizada (${state.apparel.modelNames[state.apparel.model]})`,
        size: state.apparel.size,
        color: state.apparel.color,
        hasFront: frontCount > 0,
        hasBack: backCount > 0,
        price: itemPrice,
        quantity: state.quantity,
        thumb: canvas.toDataURL()
      };

      state.cart.push(cartItem);
      updateCartUI();
      openCartDrawer();
    });

    // Direct WhatsApp Button from Studio
    directWhatsappBtn.addEventListener('click', () => {
      dispatchWhatsAppOrder();
    });

    // Catalog Filter Buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        productCards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-category') === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Preset Product Customization Trigger
    document.querySelectorAll('.customize-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const src = btn.getAttribute('data-src');
        loadGraphicToCanvas(src);
        document.getElementById('studio').scrollIntoView({ behavior: 'smooth' });
      });
    });

    // Preset Product Direct Buy Trigger
    document.querySelectorAll('.buy-preset-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'), 10);
        const img = btn.getAttribute('data-img');

        state.cart.push({
          id: 'preset_' + Date.now(),
          name: name,
          size: 'M',
          color: '#111215',
          hasFront: true,
          hasBack: false,
          price: price,
          quantity: 1,
          thumb: img
        });

        updateCartUI();
        openCartDrawer();
      });
    });

    // Cart Drawer Controls
    cartOpenBtn.addEventListener('click', openCartDrawer);
    cartCloseBtn.addEventListener('click', closeCartDrawer);
    cartDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === cartDrawerBackdrop) closeCartDrawer();
    });

    // Checkout Modal Controls
    checkoutModalOpenBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        alert('Tu carrito está vacío.');
        return;
      }
      closeCartDrawer();
      checkoutModal.classList.add('open');
    });

    checkoutModalCloseBtn.addEventListener('click', () => {
      checkoutModal.classList.remove('open');
    });

    checkoutWhatsappBtn.addEventListener('click', () => {
      dispatchWhatsAppOrder();
    });
  }

  // --- HELPER FUNCTIONS ---
  function updateApparelColor(hex) {
    const shirtBody = document.getElementById('tshirtBody');
    if (shirtBody) {
      shirtBody.setAttribute('fill', hex);
    }
  }

  function switchView(viewSide) {
    state.apparel.view = viewSide;
    if (viewSide === 'front') {
      viewFrontBtn.classList.add('active');
      viewBackBtn.classList.remove('active');
    } else {
      viewBackBtn.classList.add('active');
      viewFrontBtn.classList.remove('active');
    }
    
    // Flip animation
    tshirtWrapper.style.transform = 'rotateY(90deg)';
    setTimeout(() => {
      renderCanvas();
      tshirtWrapper.style.transform = 'rotateY(0deg)';
    }, 200);
  }

  function loadGraphicToCanvas(imageSrc) {
    const imgObj = new Image();
    imgObj.crossOrigin = 'anonymous';
    imgObj.onload = () => {
      // Scale down image to fit neatly within printable canvas
      const maxDim = 130;
      let w = imgObj.width;
      let h = imgObj.height;

      if (w > h) {
        h = (h / w) * maxDim;
        w = maxDim;
      } else {
        w = (w / h) * maxDim;
        h = maxDim;
      }

      const newEl = {
        id: 'img_' + Date.now(),
        type: 'image',
        imgObj: imgObj,
        src: imageSrc,
        width: w,
        height: h,
        scale: 1,
        rotation: 0,
        x: canvas.width / 2,
        y: canvas.height / 2
      };

      state.canvasLayers[state.apparel.view].push(newEl);
      state.selectedElementId = newEl.id;
      renderCanvas();
      updatePriceSummary();
    };
    imgObj.src = imageSrc;
  }

  function calculateUnitPrice() {
    const base = state.apparel.modelPrices[state.apparel.model] || 45000;
    const hasFront = state.canvasLayers.front.length > 0;
    const hasBack = state.canvasLayers.back.length > 0;
    
    let printCost = 0;
    if (hasFront) printCost += 15000;
    if (hasBack) printCost += 15000;
    
    // Volume Discount
    let discountPct = 0;
    if (state.quantity >= 13) discountPct = 0.25;
    else if (state.quantity >= 6) discountPct = 0.15;
    
    const unitPrice = (base + printCost) * (1 - discountPct);
    return unitPrice;
  }

  function updatePriceSummary() {
    const base = state.apparel.modelPrices[state.apparel.model] || 45000;
    const hasFront = state.canvasLayers.front.length > 0;
    const hasBack = state.canvasLayers.back.length > 0;
    
    summaryFrontPrice.textContent = hasFront ? '$15,000 COP' : '$0 COP';
    summaryBackPrice.textContent = hasBack ? '$15,000 COP' : '$0 COP';
    
    let discountPct = 0;
    if (state.quantity >= 13) discountPct = 25;
    else if (state.quantity >= 6) discountPct = 15;
    
    summaryDiscountText.textContent = `${discountPct}% OFF`;
    
    const unitPrice = calculateUnitPrice();
    totalUnitPrice.textContent = `$${unitPrice.toLocaleString('es-CO')} COP`;
  }

  // --- CART DRAWER UI ---
  function openCartDrawer() {
    cartDrawerBackdrop.classList.add('open');
  }

  function closeCartDrawer() {
    cartDrawerBackdrop.classList.remove('open');
  }

  function updateCartUI() {
    cartCountBadge.textContent = state.cart.reduce((acc, i) => acc + i.quantity, 0);
    
    if (state.cart.length === 0) {
      cartItemsList.innerHTML = `<p style="text-align: center; color: var(--text-muted); margin-top: 40px;">Tu carrito está vacío actualmente.</p>`;
      cartSubtotalText.textContent = '$0 COP';
      cartTotalText.textContent = '$0 COP';
      return;
    }

    let subtotal = 0;
    cartItemsList.innerHTML = state.cart.map((item, index) => {
      const itemTotal = item.price * item.quantity;
      subtotal += itemTotal;
      return `
        <div class="cart-item">
          <div class="cart-item-preview">
            <img src="${item.thumb}" alt="Preview">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-meta">Talla: ${item.size} | Qty: ${item.quantity}</div>
            <div class="cart-item-price">$${itemTotal.toLocaleString('es-CO')} COP</div>
          </div>
          <button class="btn btn-icon" onclick="window.ROXANE.removeCartItem(${index})" style="width: 32px; height: 32px; font-size: 0.8rem;">✕</button>
        </div>
      `;
    }).join('');

    cartSubtotalText.textContent = `$${subtotal.toLocaleString('es-CO')} COP`;
    cartTotalText.textContent = `$${subtotal.toLocaleString('es-CO')} COP`;
  }

  // Global scope helpers
  window.ROXANE = {
    removeCartItem: (index) => {
      state.cart.splice(index, 1);
      updateCartUI();
    },
    processPayment: () => {
      const method = document.getElementById('paymentMethodSelect').value;
      if (method === 'whatsapp') {
        dispatchWhatsAppOrder();
      } else {
        alert('🎉 ¡Pedido generado con éxito! Gracias por tu compra en Roxane Moda. Te enviaremos el número de rastreo a tu correo y teléfono.');
        state.cart = [];
        updateCartUI();
        checkoutModal.classList.remove('open');
      }
    }
  };

  function dispatchWhatsAppOrder() {
    let orderDetails = `🔥 *NUEVO PEDIDO - ROXANE MODA* 🔥\n---------------------------------\n`;
    
    if (state.cart.length > 0) {
      state.cart.forEach((item, idx) => {
        orderDetails += `*${idx + 1}. ${item.name}*\n- Talla: ${item.size}\n- Cantidad: ${item.quantity}\n- Precio: $${(item.price * item.quantity).toLocaleString('es-CO')} COP\n\n`;
      });
    } else {
      const unitPrice = calculateUnitPrice();
      orderDetails += `*Camiseta Personalizada Studio*\n- Estilo: ${state.apparel.modelNames[state.apparel.model]}\n- Talla: ${state.apparel.size}\n- Cantidad: ${state.quantity}\n- Precio Total: $${(unitPrice * state.quantity).toLocaleString('es-CO')} COP\n\n`;
    }

    orderDetails += `🚀 *Solicito atención para producción y despacho.*`;
    
    const encoded = encodeURIComponent(orderDetails);
    window.open(`https://api.whatsapp.com/send?phone=573001234567&text=${encoded}`, '_blank');
  }

  // Run initialization
  init();
});
