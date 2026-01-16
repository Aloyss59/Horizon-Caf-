// ============================================
// ORIZON 14 - MENU PAGE JS (API CONNECTED)
// ============================================

let allMenuData = [];
let categoriesData = [];

// Initialize menu on page load
document.addEventListener('DOMContentLoaded', async function() {
    await loadMenu();
});

// Load menu from API
async function loadMenu() {
    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = '<div class="loading">Chargement du menu...</div>';

    // Fetch all menu data
    allMenuData = await API.getAllMenu();
    
    if (!allMenuData || allMenuData.length === 0) {
        menuContent.innerHTML = '<div class="error">Impossible de charger le menu. Verifiez que le serveur backend est actif sur http://localhost:5000</div>';
        return;
    }

    // Group items by category
    const groupedByCategory = {};
    allMenuData.forEach(item => {
        const categoryName = item.category_name;
        if (!groupedByCategory[categoryName]) {
            groupedByCategory[categoryName] = {
                name: categoryName,
                icon: item.icon,
                items: []
            };
        }
        groupedByCategory[categoryName].items.push(item);
    });

    // Render menu
    menuContent.innerHTML = '';
    Object.values(groupedByCategory).forEach((category, index) => {
        const section = document.createElement('section');
        section.className = 'menu-section';
        section.style.animationDelay = `${index * 0.1}s`;

        let sectionHTML = `
            <div class="section-header">
                <i class="${category.icon}"></i>
                <h2>${category.name}</h2>
            </div>
            <div class="menu-items-grid">
        `;

        category.items.forEach((item, itemIndex) => {
            sectionHTML += `
                <div class="menu-card" style="animation-delay: ${itemIndex * 0.05}s;">
                    <div class="card-content">
                        <h3>${item.name}</h3>
                        <p class="description">${item.description || 'Produit savoureux'}</p>
                    </div>
                    <div class="card-price">${item.price.toFixed(2)} EUR</div>
                </div>
            `;
        });

        sectionHTML += '</div>';
        section.innerHTML = sectionHTML;
        menuContent.appendChild(section);
    });

    // Add menu animations
    initializeMenuAnimations();
}

// Search menu items
async function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        await loadMenu();
        return;
    }

    const menuContent = document.getElementById('menuContent');
    menuContent.innerHTML = `<div class="loading">Recherche pour "${searchTerm}"...</div>`;

    const results = await API.searchMenu(searchTerm);

    if (!results || results.length === 0) {
        menuContent.innerHTML = `<div class="error">Aucun produit trouve pour "${searchTerm}"</div>`;
        return;
    }

    // Render search results
    menuContent.innerHTML = '<h2 style="margin: 30px 0;">Resultats de recherche</h2>';
    
    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'menu-items-grid';

    results.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.style.animationDelay = `${index * 0.05}s`;
        card.innerHTML = `
            <div class="card-content">
                <h3>${item.name}</h3>
                <p class="description">${item.category_name}</p>
                <p class="description">${item.description || 'Produit savoureux'}</p>
            </div>
            <div class="card-price">${item.price.toFixed(2)} EUR</div>
        `;
        resultsGrid.appendChild(card);
    });

    menuContent.appendChild(resultsGrid);
    initializeMenuAnimations();
}

// Initialize menu animations
function initializeMenuAnimations() {
    const menuCards = document.querySelectorAll('.menu-card');
    
    menuCards.forEach((card) => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Add search on Enter key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

