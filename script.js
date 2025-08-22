let cart = [];
let products = [];
let filteredProducts = [];
let notificationQueue = [];
let notificationCounter = 0;

const categories = {
    0: "Carnes",
    1: "Bebidas", 
    2: "Postres/Dulces",
    3: "Sopas/Caldos",
    4: "Acompañamientos",
    5: "Panes/Masas",
    6: "Granos/Semillas",
    7: "Platos Principales",
    8: "Exóticos"
}

async function parseProductJSON(productPath) {
    try {
        const response = await fetch(productPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productData = await response.json();
        return productData;
    } catch (error) {
        console.error(`Error loading product from ${productPath}:`, error);
        return null;
    }
}

async function loadAllProducts() {
    try {
                const manifestResponse = await fetch('products/products.json');
        let productFiles;
        
        if (manifestResponse.ok) {
                        productFiles = await manifestResponse.json();
                        productFiles = productFiles.map(filename => `products/${filename}`);
        } else {
                        productFiles = [
                'products/empanadas.json',
                'products/arepa-boyacense.json',
                'products/chicharron.json',
                'products/queso-campesino.json',
                'products/miel-abeja.json',
                'products/cafe-organico.json'
            ];
        }

        products = [];
        
        for (const productPath of productFiles) {
            const product = await parseProductJSON(productPath);
            if (product) {
                product.path = productPath;                                 product.isOnSale = product.isOnSale ?? 0;
                product.isGlutenFree = product.isGlutenFree ?? 0;
                product.isVegan = product.isVegan ?? 0;
                product.isCategory = product.isCategory ?? 0;
                products.push(product);
            }
        }
        
        filteredProducts = [...products];
        return products;
        
    } catch (error) {
        console.error('Error loading products:', error);
                const productFiles = [
            'products/empanadas.json',
            'products/arepa-boyacense.json',
            'products/chicharron.json',
            'products/queso-campesino.json',
            'products/miel-abeja.json',
            'products/cafe-organico.json'
        ];

        products = [];
        
        for (const productPath of productFiles) {
            const product = await parseProductJSON(productPath);
            if (product) {
                product.path = productPath;
                product.isOnSale = product.isOnSale ?? 0;
                product.isGlutenFree = product.isGlutenFree ?? 0;
                product.isVegan = product.isVegan ?? 0;
                product.isCategory = product.isCategory ?? 0;
                products.push(product);
            }
        }
        
        filteredProducts = [...products];
        return products;
    }
}

function filterProducts() {
    const categoryFilter = document.getElementById('categoryFilter')?.value;
    const onSaleFilter = document.getElementById('onSaleFilter')?.checked;
    const glutenFreeFilter = document.getElementById('glutenFreeFilter')?.checked;
    const veganFilter = document.getElementById('veganFilter')?.checked;

    filteredProducts = products.filter(product => {
                if (categoryFilter !== 'all' && product.isCategory != categoryFilter) {
            return false;
        }
        
                if (onSaleFilter && !product.isOnSale) {
            return false;
        }
        
                if (glutenFreeFilter && !product.isGlutenFree) {
            return false;
        }
        
                if (veganFilter && !product.isVegan) {
            return false;
        }
        
        return true;
    });

    renderProducts();
    updateProductsCount();
}

function updateProductsCount() {
    const productsCount = document.getElementById('productsCount');
    if (productsCount) {
        const totalProducts = products.length;
        const shownProducts = filteredProducts.length;
        productsCount.textContent = `Mostrando ${shownProducts} de ${totalProducts} productos`;
    }
}

function clearAllFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const onSaleFilter = document.getElementById('onSaleFilter');
    const glutenFreeFilter = document.getElementById('glutenFreeFilter');
    const veganFilter = document.getElementById('veganFilter');
    
    if (categoryFilter) categoryFilter.value = 'all';
    if (onSaleFilter) onSaleFilter.checked = false;
    if (glutenFreeFilter) glutenFreeFilter.checked = false;
    if (veganFilter) veganFilter.checked = false;
    
    filterProducts();
}

function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    filteredProducts.forEach(product => {
        const productElement = document.createElement('div');
        productElement.className = `shop-item ${product.isOnSale ? 'on-sale' : ''}`;
        
                let badges = '';
        if (product.isOnSale) badges += '<span class="badge badge-sale">Oferta</span>';
        if (product.isGlutenFree) badges += '<span class="badge badge-gluten-free">Sin Gluten</span>';
        if (product.isVegan) badges += '<span class="badge badge-vegan">Vegano</span>';
        badges += `<span class="badge badge-category">${categories[product.isCategory]}</span>`;
        
        productElement.innerHTML = `
            <div class="shop-item-image" style="background-image: url('${product.imageUrl}')"></div>
            <div class="shop-item-content">
                <div class="product-badges">${badges}</div>
                <h3 class="shop-item-title">${product.title}</h3>
                <p class="shop-item-description">${product.description}</p>
                <div class="shop-item-footer">
                    <span class="shop-item-price">${formatCOP(product.price)}</span>
                    <button class="add-to-cart-btn" onclick="addToCart('${product.path}')">
                        Agregar al Carrito
                    </button>
                </div>
            </div>
        `;
        
        productsGrid.appendChild(productElement);
    });
}

function initializeFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const onSaleFilter = document.getElementById('onSaleFilter');
    const glutenFreeFilter = document.getElementById('glutenFreeFilter');
    const veganFilter = document.getElementById('veganFilter');
    const clearFiltersBtn = document.getElementById('clearFilters');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterProducts);
    }
    
    if (onSaleFilter) {
        onSaleFilter.addEventListener('change', filterProducts);
    }
    
    if (glutenFreeFilter) {
        glutenFreeFilter.addEventListener('change', filterProducts);
    }
    
    if (veganFilter) {
        veganFilter.addEventListener('change', filterProducts);
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
}

function addToCart(productPath) {
    const existingItem = cart.find(item => item.path === productPath);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            path: productPath,
            quantity: 1
        });
    }
    
    updateCartUI();
    saveCartToLocalStorage();
    createNotificationWithCloseButton('Producto agregado al carrito');
}

function removeFromCart(productPath) {
    cart = cart.filter(item => item.path !== productPath);
    updateCartUI();
    saveCartToLocalStorage();
}

function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function generateCheckoutURL() {
    const baseURL = 'checkout.html';
    const params = new URLSearchParams();
    
        cart.forEach((item, index) => {
        params.append(`item_${index}`, item.path);
        params.append(`quantity_${index}`, item.quantity.toString());
    });
    
        params.append('total_items', cart.length.toString());
    
    return `${baseURL}?${params.toString()}`;
}

function parseCheckoutParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const parsedCart = [];
    
        const totalItems = parseInt(urlParams.get('total_items') || '0');
    
    for (let i = 0; i < totalItems; i++) {
        const itemPath = urlParams.get(`item_${i}`);
        const quantity = parseInt(urlParams.get(`quantity_${i}`) || '1');
        
        if (itemPath) {
            parsedCart.push({
                path: itemPath,
                quantity: quantity
            });
        }
    }
    
    return parsedCart;
}

function formatCOP(value) {
    return '$' + Number(value).toLocaleString('es-CO', { minimumFractionDigits: 0 });
}




function createNotificationWithCloseButton(message) {
    const notificationId = `notification-${++notificationCounter}`;
    
    
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'notification';
    
    
    const existingNotifications = document.querySelectorAll('.notification');
    const topOffset = 90 + (existingNotifications.length * 70); 
    
    notification.style.cssText = `
        position: fixed;
        top: ${topOffset}px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        font-size: 0.9rem;
        max-width: 300px;
        min-width: 200px;
        border-left: 4px solid #1e7e34;
        opacity: 0;
    `;
    notification.textContent = message;
    
    
    notificationQueue.push({
        element: notification,
        id: notificationId
    });
    
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 50);
    
    
    setTimeout(() => {
        removeNotification(notificationId);
    }, 3500); 
}

function removeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (!notification) return;
    
    
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        
        
        notificationQueue = notificationQueue.filter(item => item.id !== notificationId);
        
        
        repositionNotifications();
    }, 400);
}

function repositionNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification, index) => {
        const newTop = 90 + (index * 70);
        notification.style.top = `${newTop}px`;
    });
}


function addToCart(productPath) {
    const existingItem = cart.find(item => item.path === productPath);
    
    if (existingItem) {
        existingItem.quantity += 1;
        createNotificationWithCloseButton('¡Cantidad actualizada en el carrito!');
    } else {
        cart.push({
            path: productPath,
            quantity: 1
        });
        createNotificationWithCloseButton('¡Producto agregado al carrito!');
    }
    
    updateCartUI();
    saveCartToLocalStorage();
    
    
    const button = event?.target;
    if (button) {
        const originalText = button.textContent;
        const originalBg = button.style.background;
        
        button.textContent = '¡Agregado!';
        button.style.background = '#1e7e34';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.disabled = false;
        }, 1000);
    }
}

function showNotification(message) {
    const notificationId = `notification-${++notificationCounter}`;
    
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'notification';
    
    const existingNotifications = document.querySelectorAll('.notification');
    const topOffset = 90 + (existingNotifications.length * 70); 
    
    notification.style.cssText = `
        position: fixed;
        top: ${topOffset}px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        font-size: 0.9rem;
        max-width: 300px;
        min-width: 200px;
        border-left: 4px solid #1e7e34;
        opacity: 0;
    `;
    notification.textContent = message;
    
    
    notificationQueue.push({
        element: notification,
        id: notificationId
    });
    
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 50);
    
    
    setTimeout(() => {
        removeNotification(notificationId);
    }, 3500); 
}

function removeNotification(notificationId) {
    const notification = document.getElementById(notificationId);
    if (!notification) return;
    
    
    notification.style.transform = 'translateX(400px)';
    notification.style.opacity = '0';
    
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
        
        
        notificationQueue = notificationQueue.filter(item => item.id !== notificationId);
        
        
        repositionNotifications();
    }, 400);
}

function repositionNotifications() {
    const notifications = document.querySelectorAll('.notification');
    notifications.forEach((notification, index) => {
        const newTop = 90 + (index * 70);
        notification.style.top = `${newTop}px`;
    });
}


function addToCart(productPath) {
    const existingItem = cart.find(item => item.path === productPath);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showNotification('¡Cantidad actualizada en el carrito!');
    } else {
        cart.push({
            path: productPath,
            quantity: 1
        });
        showNotification('¡Producto agregado al carrito!');
    }
    
    updateCartUI();
    saveCartToLocalStorage();
    
    
    const button = event?.target;
    if (button) {
        const originalText = button.textContent;
        const originalBg = button.style.background;
        
        button.textContent = '¡Agregado!';
        button.style.background = '#1e7e34';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = originalBg;
            button.disabled = false;
        }, 1000);
    }
}


function createNotificationWithCloseButton(message) {
    const notificationId = `notification-${++notificationCounter}`;
    
    const notification = document.createElement('div');
    notification.id = notificationId;
    notification.className = 'notification notification-closable';
    
    const existingNotifications = document.querySelectorAll('.notification');
    const topOffset = 90 + (existingNotifications.length * 70);
    
    notification.style.cssText = `
        position: fixed;
        top: ${topOffset}px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        font-weight: 600;
        font-size: 0.9rem;
        max-width: 300px;
        min-width: 200px;
        border-left: 4px solid #1e7e34;
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;
    
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="removeNotification('${notificationId}')" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            padding: 0;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background 0.2s ease;
        " onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
    `;
    
    notificationQueue.push({
        element: notification,
        id: notificationId
    });
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 50);
    
    
    setTimeout(() => {
        removeNotification(notificationId);
    }, 5000);
}




async function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartCount) return;     
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
        if (cartItems) {
        cartItems.innerHTML = '';
    }
    
    let total = 0;
    
        for (const cartItem of cart) {
        const product = await parseProductJSON(cartItem.path);
        if (product && cartItems) {
            total += product.price * cartItem.quantity;
            
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-title">${product.title}</div>
                    <div class="cart-item-price">${formatCOP(product.price)} x ${cartItem.quantity}</div>
                </div>
                <button class="remove-btn" onclick="removeFromCart('${cartItem.path}')">
                    Eliminar
                </button>
            `;
            cartItems.appendChild(cartItemElement);
        }
    }
    
        if (cartTotal) {
        cartTotal.textContent = `Total: ${formatCOP(total)}`;
    }
    
        if (cart.length === 0 && cartItems) {
        cartItems.innerHTML = '<div style="padding: 1rem; text-align: center; color: #666;">Tu carrito está vacío</div>';
    }
}

function handleNavbarScroll() {
    const navbar = document.getElementById('navbar');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
                        navbar.classList.add('hidden');
        } else {
                        navbar.classList.remove('hidden');
        }
        
        lastScrollY = currentScrollY;
    });
}

function initializeCartDropdown() {
    const cartIcon = document.getElementById('cartIcon');
    const cartDropdown = document.getElementById('cartDropdown');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    if (cartIcon && cartDropdown) {
        cartIcon.addEventListener('mouseenter', () => {
            cartDropdown.classList.add('show');
        });
        
        cartDropdown.addEventListener('mouseleave', () => {
            cartDropdown.classList.remove('show');
        });
        
        cartIcon.addEventListener('mouseleave', () => {
            setTimeout(() => {
                if (!cartDropdown.matches(':hover')) {
                    cartDropdown.classList.remove('show');
                }
            }, 100);
        });
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                                const checkoutURL = generateCheckoutURL();
                window.location.href = checkoutURL;
            } else {
                createNotificationWithCloseButton('Tu carrito está vacío');
            }
        });
    }
}

async function initializeProductsPage() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (!productsGrid) return;     
    await loadAllProducts();
    renderProducts();
    initializeFilters();
    updateProductsCount();
}

async function initializeCheckoutPage() {
    const checkoutItems = document.getElementById('checkoutItems');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    if (!checkoutItems) return;     
        const urlCart = parseCheckoutParameters();
    if (urlCart.length > 0) {
                cart = urlCart;
    }
    
    let total = 0;
    
    if (cart.length === 0) {
        checkoutItems.innerHTML = `
            <div style="text-align: center; padding: 2rem; color: #666;">
                <h3>No hay productos en tu carrito</h3>
                <p>Agrega algunos productos antes de proceder al checkout.</p>
            </div>
        `;
        return;
    }
    
    for (const cartItem of cart) {
        const product = await parseProductJSON(cartItem.path);
        if (product) {
            const itemTotal = product.price * cartItem.quantity;
            total += itemTotal;
            
            const checkoutItemElement = document.createElement('div');
            checkoutItemElement.className = 'checkout-item';
            checkoutItemElement.innerHTML = `
                <div class="checkout-item-info">
                    <div class="checkout-item-title">${product.title}</div>
                    <div class="checkout-item-description">${product.description}</div>
                    <div style="margin-top: 0.5rem; color: #666;">Cantidad: ${cartItem.quantity}</div>
                </div>
                <div class="checkout-item-price">${formatCOP(itemTotal)}</div>
            `;
            checkoutItems.appendChild(checkoutItemElement);
        }
    }
    
    if (checkoutTotal) {
        checkoutTotal.textContent = `${formatCOP(total)}`;
    }
    
        setTimeout(() => {
        cart = [];
        saveCartToLocalStorage();
        updateCartUI();
    }, 1000);
}

function createNotificationWithCloseButton(message) {
        const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
        setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
        setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 300);
}

function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}


function openImageOverlay(imageSrc) {
    const overlay = document.getElementById('imageOverlay');
    const overlayImage = document.getElementById('overlayImage');
    
    if (overlay && overlayImage) {
        overlayImage.src = imageSrc;
        overlay.classList.add('show');
        
        
        document.body.style.overflow = 'hidden';
    }
}

function closeImageOverlay() {
    const overlay = document.getElementById('imageOverlay');
    
    if (overlay) {
        overlay.classList.remove('show');
        
        
        document.body.style.overflow = 'auto';
    }
}


document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeImageOverlay();
    }
});


document.addEventListener('DOMContentLoaded', function() {
    const overlayImage = document.getElementById('overlayImage');
    if (overlayImage) {
        overlayImage.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
        loadCartFromLocalStorage();
        handleNavbarScroll();
        initializeCartDropdown();
        initializeSmoothScrolling();
        initializeProductsPage();
        initializeCheckoutPage();
    
        updateCartUI();
});

document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        updateCartUI();
    }
});