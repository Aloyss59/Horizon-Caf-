// ============================================
// CAMPUS BAR - COMMON JS (Navigation & Auth Check)
// ============================================

if (typeof currentUser === 'undefined') {
    let currentUser = null;
}
if (typeof currentChat === 'undefined') {
    let currentChat = null;
}

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupNavigation();
    setupMobileMenu();
    updateCartButtonVisibility();
});

function setupMobileMenu() {
    const btnMenuToggle = document.getElementById('btnMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (btnMenuToggle && navLinks) {
        // Handle hamburger clicks
        btnMenuToggle.addEventListener('click', toggleMobileMenu);
        
        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                btnMenuToggle.classList.remove('active');
            });
        });
    }
    
    window.addEventListener('resize', updateCartButtonVisibility);
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    const btnToggle = document.getElementById('btnMenuToggle');
    navLinks.classList.toggle('active');
    btnToggle.classList.toggle('active');
}

function updateCartButtonVisibility() {
    const btnOpenCart = document.getElementById('btnOpenCart');
    if (btnOpenCart && window.innerWidth <= 1024) {
        btnOpenCart.style.display = 'flex';
    } else if (btnOpenCart) {
        btnOpenCart.style.display = 'none';
    }
}

function checkAuth() {
    const authData = localStorage.getItem('authData');
    const userStr = localStorage.getItem('user');
    
    if (!authData || !userStr) {
        if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
            window.location.href = '/login.html';
        }
        return;
    }
    
    if (userStr) {
        currentUser = JSON.parse(userStr);
        updateUI();
    }
}

function updateUI() {
    const userGreeting = document.getElementById('userGreeting');
    const adminLink = document.getElementById('adminLink');
    
    if (userGreeting && currentUser) {
        userGreeting.textContent = currentUser.username || currentUser.name || 'Utilisateur';
    }
    
    if (adminLink && currentUser && currentUser.role === 'admin') {
        adminLink.style.display = 'block';
    }
}

function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
        
        // Close menu when clicking a link
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }
}

function logout() {
    localStorage.removeItem('authData');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/';
}

