// =====================================================
// MENU INTERACTIF - SYSTÈME DE COMMANDE COMPLET
// =====================================================

// ===== RESPONSIVE MOBILE FUNCTIONS =====
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const btnToggle = document.getElementById('btnMenuToggle');
    navLinks.classList.toggle('active');
    btnToggle.classList.toggle('active');
}

function openMobileCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.add('mobile-open');
    document.body.style.overflow = 'hidden';
}

function closeMobileCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    cartSidebar.classList.remove('mobile-open');
    document.body.style.overflow = 'auto';
}

// Show/hide cart button based on screen size
function updateCartButtonVisibility() {
    const btnOpenCart = document.getElementById('btnOpenCart');
    if (window.innerWidth <= 1024) {
        btnOpenCart.style.display = 'flex';
    } else {
        btnOpenCart.style.display = 'none';
        closeMobileCart();
    }
}

// Listen to resize events
window.addEventListener('resize', updateCartButtonVisibility);
window.addEventListener('load', updateCartButtonVisibility);

// Close menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navLinksContainer = document.getElementById('navLinks');
            const btnToggle = document.getElementById('btnMenuToggle');
            navLinksContainer.classList.remove('active');
            btnToggle.classList.remove('active');
        });
    });
});

let cart = [];
let searchHistory = [];


// DATABASE MENU (avec catégories appropriées)
const menuData = {
    'hot-drinks': [
        { id: 1, name: 'Café Expresso', price: 2.00, desc: 'Expresso intense et riche' },
        { id: 2, name: 'Café Americano', price: 2.00, desc: 'Allongé et léger' },
        { id: 3, name: 'Cappuccino', price: 3.00, desc: 'Mousse de lait crémeuse' },
        { id: 4, name: 'Latte', price: 3.50, desc: 'Lait & espresso' },
        { id: 5, name: 'Thé Vert', price: 2.50, desc: 'Nature ou aromatisé' },
        { id: 6, name: 'Thé Noir', price: 2.50, desc: 'Classique ou Earl Grey' },
        { id: 7, name: 'Chocolat Chaud', price: 3.00, desc: 'Riche et crémeux' },
        { id: 8, name: 'Infusion Menthe', price: 2.50, desc: 'Relaxante et apaisante' },
        { id: 9, name: 'Infusion Camomille', price: 2.50, desc: 'Apaisante' },
        { id: 10, name: 'Chai Latte', price: 3.50, desc: 'Épices douces et lait' },
        { id: 11, name: 'Mocha', price: 3.50, desc: 'Chocolat & café' },
        { id: 12, name: 'Matcha Latte', price: 3.50, desc: 'Thé vert matcha et lait' },
        { id: 13, name: 'Golden Latte', price: 3.50, desc: 'Curcuma & lait' },
        { id: 14, name: 'Flat White', price: 3.50, desc: 'Espresso & micro-mousse' }
    ],
    'cold-drinks': [
        { id: 101, name: 'Coca-Cola', price: 2.00, desc: '33cl classique' },
        { id: 102, name: 'Sprite', price: 2.00, desc: '33cl citron-lime' },
        { id: 103, name: 'Fanta Orange', price: 2.00, desc: '33cl pétillante' },
        { id: 104, name: 'Schweppes Tonic', price: 2.50, desc: '33cl classique' },
        { id: 105, name: 'Jus d\'Orange', price: 3.00, desc: 'Pressé naturel' },
        { id: 106, name: 'Jus de Pomme', price: 3.00, desc: 'Naturel' },
        { id: 107, name: 'Jus de Raisin', price: 3.00, desc: 'Bio et fruité' },
        { id: 108, name: 'Limonade Maison', price: 3.50, desc: 'Citron & menthe' },
        { id: 109, name: 'Eau Minérale', price: 1.50, desc: 'Plate ou gazeuse' },
        { id: 110, name: 'Orangina', price: 2.50, desc: '33cl' },
        { id: 111, name: 'Ice Tea Pêche', price: 2.50, desc: '33cl' },
        { id: 112, name: 'Red Bull', price: 3.00, desc: '25cl énergisant' },
        { id: 113, name: 'Jus Multifruits', price: 3.00, desc: '100% fruits' },
        { id: 114, name: 'Jus Carotte Bio', price: 3.00, desc: 'Bio et délicieux' }
    ],
    'snacks': [
        { id: 201, name: 'Salade César', price: 5.00, desc: 'Laitue, poulet, parmesan' },
        { id: 202, name: 'Sandwich Jambon & Fromage', price: 4.00, desc: 'Pain frais et garniture' },
        { id: 203, name: 'Baguette Jambon Cru', price: 4.00, desc: 'Jambon de qualité' },
        { id: 204, name: 'Panini Mozzarella Tomate', price: 4.50, desc: 'Fromage fondu et tomate' },
        { id: 205, name: 'Panini Poulet Curry', price: 4.50, desc: 'Poulet et sauce curry' },
        { id: 206, name: 'Panini Jambon Fromage', price: 4.50, desc: 'Pain grillé, jambon et fromage' },
        { id: 207, name: 'Wrap Poulet', price: 4.50, desc: 'Avec légumes frais' },
        { id: 208, name: 'Bagel Saumon', price: 5.00, desc: 'Saumon fumé et cream cheese' },
        { id: 209, name: 'Wrap Saumon', price: 5.00, desc: 'Saumon, salade, sauce' },
        { id: 210, name: 'Frites Classiques', price: 2.50, desc: 'Pommes de terre fraîches' },
        { id: 211, name: 'Frites Cheddar', price: 3.50, desc: 'Frites + fromage fondu' },
        { id: 212, name: 'Hamburger Classique', price: 4.50, desc: 'Bœuf, salade, sauce' },
        { id: 213, name: 'Cheeseburger', price: 5.00, desc: 'Bœuf, cheddar, salade' },
        { id: 214, name: 'Pizza Margherita', price: 5.00, desc: 'Tomate et mozzarella' },
        { id: 215, name: 'Pizza Pepperoni', price: 5.50, desc: 'Tomate, mozzarella, pepperoni' },
        { id: 216, name: 'Hot Dog Classique', price: 3.50, desc: 'Saucisse, pain frais' }
    ],
    'desserts': [
        { id: 301, name: 'Brownie Chocolat', price: 2.50, desc: 'Moelleux et fondant' },
        { id: 302, name: 'Cookie Choco', price: 2.00, desc: 'Cookie aux pépites de chocolat' },
        { id: 303, name: 'Muffin Myrtille', price: 2.50, desc: 'Moelleux et fruité' },
        { id: 304, name: 'Tartelette Citron', price: 3.00, desc: 'Pâte sablée et crème citron' },
        { id: 305, name: 'Éclair Chocolat', price: 3.00, desc: 'Pâte à choux et crème chocolat' },
        { id: 306, name: 'Éclair Café', price: 3.00, desc: 'Pâte à choux et crème café' },
        { id: 307, name: 'Chou à la Crème', price: 2.50, desc: 'Pâte à choux et crème vanille' },
        { id: 308, name: 'Tarte aux Pommes', price: 3.00, desc: 'Pomme caramélisée' },
        { id: 309, name: 'Cheesecake Fraise', price: 3.50, desc: 'Base biscuitée et crème' },
        { id: 310, name: 'Cheesecake Chocolat', price: 3.50, desc: 'Base biscuitée et ganache' }
    ]
};

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    initializeMenu();
    initializeCart();
    setupEventListeners();
    loadTheme();
});

// Initialiser le menu
function initializeMenu() {
    renderMenuCategory('hot-drinks');
    renderMenuCategory('cold-drinks');
    renderMenuCategory('snacks');
    renderMenuCategory('desserts');
    
    // Créer les filtres de catégorie
    const filterContainer = document.getElementById('categoryFilters');
    const categories = ['all', 'hot-drinks', 'cold-drinks', 'snacks', 'desserts'];
    const labels = ['Tout', 'Boissons Chaudes', 'Boissons Froides', 'Snacks', 'Desserts'];
    
    categories.forEach((cat, idx) => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        if (idx === 0) btn.classList.add('active'); // Activer "Tout" par défaut
        btn.textContent = labels[idx];
        btn.onclick = () => filterByCategory(cat, btn);
        filterContainer.appendChild(btn);
    });
}

// Rendre les cartes d'un catégorie
function renderMenuCategory(categoryId) {
    const container = document.getElementById(categoryId);
    const items = menuData[categoryId];
    
    container.innerHTML = items.map(item => `
        <div class="menu-card" data-item-id="${item.id}" data-category="${categoryId}">
            <h3>${item.name}</h3>
            <p class="description">${item.desc}</p>
            <div class="price-container">
                <span class="price-credits">${(item.price * 1.1).toFixed(0)} crédits</span>
                <span class="price-euro">${item.price.toFixed(2)}€</span>
            </div>
            <button class="btn-add-item" onclick="addToCart(${item.id}, '${categoryId}')" title="Ajouter au panier">
                <i class="fas fa-plus"></i>
            </button>
        </div>
    `).join('');
}

// Ajouter au panier
function addToCart(itemId, categoryId) {
    const items = menuData[categoryId];
    const item = items.find(i => i.id === itemId);
    
    if (!item) return;
    
    const existingItem = cart.find(c => c.id === itemId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: itemId,
            name: item.name,
            price: item.price,
            quantity: 1,
            category: categoryId
        });
    }
    
    updateCart();
}

// Initialiser le panier
function initializeCart() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        cart = JSON.parse(saved);
        updateCart();
    }
}

// Mettre à jour l'affichage du panier
function updateCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const btnOrder = document.getElementById('btnOrder');
    
    // Sauvegarder le panier
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <p>Votre panier est vide</p>
            </div>
        `;
        btnOrder.disabled = true;
    } else {
        cartItemsContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-item-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${(item.price * item.quantity * 1.1).toFixed(0)} crédits (${(item.price * item.quantity).toFixed(2)}€)</div>
                    <div class="cart-item-qty">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-display">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="remove-btn" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
        
        btnOrder.disabled = false;
    }
    
    // Mettre à jour le compte
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Mettre à jour le total
    updateCartTotal();
}

// Mettre à jour la quantité
function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCart();
        }
    }
}

// Supprimer du panier
function removeFromCart(itemId) {
    cart = cart.filter(i => i.id !== itemId);
    updateCart();
}

// Vider le panier
function clearCart() {
    if (confirm('Êtes-vous sûr de vouloir vider le panier?')) {
        cart = [];
        updateCart();
    }
}

// Ouvrir la modale de suppression du panier
function openClearCartModal() {
    document.getElementById('clearCartModal').classList.add('show');
}

// Fermer la modale de suppression du panier
function closeClearCartModal() {
    document.getElementById('clearCartModal').classList.remove('show');
}

// Confirmer et vider le panier
function confirmClearCart() {
    cart = [];
    updateCart();
    closeClearCartModal();
}

// Mettre à jour le total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity * 1.1), 0);
    document.getElementById('total').textContent = total.toFixed(0);
}


// Passer la commande
function placeOrder() {
    const tableNumber = document.getElementById('tableNumber').value;
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (!tableNumber) {
        alert('Veuillez entrer votre numéro de table');
        return;
    }
    
    if (cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    const total = parseFloat(document.getElementById('total').textContent);
    
    // Préparer les données de commande
    const orderData = {
        tableNumber: parseInt(tableNumber),
        items: cart.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        })),
        paymentMethod: paymentMethod,
        total: total,
        timestamp: new Date().toISOString()
    };
    
    // Si paiement en ligne, afficher modal de paiement
    if (paymentMethod === 'online') {
        showPaymentModal(orderData);
    } else {
        // Sinon, afficher confirmation directement
        confirmOrder(orderData);
    }
}

// Afficher la modal de paiement en ligne
function showPaymentModal(orderData) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { credits: 100 };
    const userCredits = userProfile.credits || 0;
    const totalToPay = orderData.total;
    const hasEnoughCredits = userCredits >= totalToPay;
    
    const paymentInfo = document.getElementById('paymentInfo');
    
    paymentInfo.innerHTML = `
        <div style="background:rgba(0,210,255,0.1);padding:1rem;border-radius:6px;margin-bottom:1rem;">
            <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;">
                <span style="color:#b0b0b0;">Crédit de votre compte:</span>
                <span style="color:#00d2ff;font-weight:bold;font-size:1.1rem;">${Math.round(userCredits)} crédits</span>
            </div>
            <div style="display:flex;justify-content:space-between;border-top:1px solid #2a2a2a;padding-top:0.75rem;">
                <span style="color:#b0b0b0;">À payer:</span>
                <span style="color:#00ff88;font-weight:bold;font-size:1.1rem;">${Math.round(totalToPay)} crédits</span>
            </div>
        </div>
    `;
    
    if (!hasEnoughCredits) {
        paymentInfo.innerHTML += `<div style="color:#ff6b4a;text-align:center;padding:1rem;background:rgba(255,107,74,0.1);border-radius:6px;">⚠️ Crédits insuffisants!</div>`;
    }
    
    const btnPaymentConfirm = document.getElementById('btnPaymentConfirm');
    btnPaymentConfirm.disabled = !hasEnoughCredits;
    btnPaymentConfirm.textContent = hasEnoughCredits ? '✓ Payer' : 'Crédits insuffisants';
    
    // Stocker la commande pour la validation
    window.currentOrderData = orderData;
    
    document.getElementById('paymentModal').classList.add('show');
}

// Valider le paiement en ligne
function confirmPayment() {
    const orderData = window.currentOrderData;
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || { credits: 100, totalSpent: 0, totalOrders: 0, expenseHistory: [] };
    const totalToPay = orderData.total;
    
    if (userProfile.credits < totalToPay) {
        alert('Crédits insuffisants!');
        return;
    }
    
    // Déduire les crédits
    userProfile.credits -= totalToPay;
    userProfile.totalSpent = (userProfile.totalSpent || 0) + totalToPay;
    userProfile.totalOrders = (userProfile.totalOrders || 0) + 1;
    
    // Ajouter à l'historique
    if (!userProfile.expenseHistory) userProfile.expenseHistory = [];
    userProfile.expenseHistory.unshift({
        type: 'order',
        price: totalToPay,
        date: new Date().toLocaleDateString('fr-FR'),
        items: orderData.items.map(i => i.name).join(', ')
    });
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    closePaymentModal();
    confirmOrder(orderData);
}

// Fermer modal de paiement
function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
}

// Confirmer la commande
function confirmOrder(orderData) {
    const confirmText = document.getElementById('confirmText');
    confirmText.innerHTML = `
        <strong>Détails de votre commande:</strong><br>
        Table: <strong>#${orderData.tableNumber}</strong><br>
        Articles: <strong>${orderData.items.reduce((sum, item) => sum + item.quantity, 0)}</strong><br>
        Total: <strong>${Math.round(orderData.total)} crédits</strong><br>
        Paiement: <strong>${orderData.paymentMethod === 'online' ? 'En ligne' : 'À la livraison'}</strong><br><br>
        <em>Votre commande sera livrée à votre table dès que possible!</em>
    `;
    
    document.getElementById('confirmModal').classList.add('show');
    syncOrderWithProfile(orderData);
    cart = [];
    updateCart();
}

// Continuer les achats
function continueShopping() {
    closeModal();
}

// Aller à l'accueil
function goHome() {
    cart = [];
    localStorage.removeItem('cart');
    window.location.href = './home.html';
}

// Fermer le modal
function closeModal() {
    document.getElementById('confirmModal').classList.remove('show');
}

// Filtrer par catégorie
function filterByCategory(categoryId, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    
    if (categoryId === 'all') {
        // Afficher toutes les catégories
        document.querySelectorAll('[id$="-drinks"], [id="snacks"], [id="desserts"]').forEach(el => {
            el.style.display = 'grid';
        });
    } else {
        // Masquer les autres catégories
        document.querySelectorAll('[id$="-drinks"], [id="snacks"], [id="desserts"]').forEach(el => {
            el.style.display = 'none';
        });
        document.getElementById(categoryId).style.display = 'grid';
    }
}

// Recherche dans le menu
function filterMenu() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        document.querySelectorAll('.menu-card').forEach(card => {
            card.style.display = 'block';
        });
        return;
    }
    
    document.querySelectorAll('.menu-card').forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const desc = card.querySelector('.description').textContent.toLowerCase();
        
        if (name.includes(searchTerm) || desc.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Gestionnaires d'événements
function setupEventListeners() {
    // Fermer le modal en cliquant en dehors
    document.getElementById('confirmModal').addEventListener('click', (e) => {
        if (e.target.id === 'confirmModal') {
            closeModal();
        }
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
        updateThemeIcon();
    });
}

// Charger le thème sauvegardé
function loadTheme() {
    const theme = localStorage.getItem('theme') || 'dark';
    if (theme === 'light') {
        document.body.classList.add('light-mode');
    }
    updateThemeIcon();
}

// Mettre à jour l'icône du thème
function updateThemeIcon() {
    const icon = document.getElementById('themeToggle').querySelector('i');
    if (document.body.classList.contains('light-mode')) {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// Aller au profil
function goToProfile() {
    window.location.href = './profil.html';
}

// Synchroniser la commande avec le profil
function syncOrderWithProfile(orderData) {
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    // Ajouter chaque article à l'historique
    orderData.items.forEach(item => {
        const itemTotal = item.price * item.quantity;
        userProfile.expenseHistory = userProfile.expenseHistory || [];
        userProfile.expenseHistory.unshift({
            item: item.name,
            price: itemTotal,
            date: new Date().toISOString(),
            mode: orderData.paymentMethod === 'online' ? 'Crédits' : 'À la livraison',
            quantity: item.quantity
        });
    });
    
    // Mettre à jour les statistiques
    userProfile.totalSpent = (userProfile.totalSpent || 0) + orderData.total;
    userProfile.totalOrders = (userProfile.totalOrders || 0) + 1;
    
    // Si paiement en ligne, déduire les crédits
    if (orderData.paymentMethod === 'online') {
        userProfile.credits = (userProfile.credits || 0) - orderData.total;
    }
    
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Déconnexion
function logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        cart = [];
        localStorage.removeItem('cart');
        window.location.href = './login.html';
    }
}
