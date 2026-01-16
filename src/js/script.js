// ============================================
// CAMPUS BAR - JAVASCRIPT
// ============================================

// ============ STATE MANAGEMENT ============
let currentUser = null;
let currentChat = null;
let isAdmin = false;

// Sample data
const users = {
    'user@universite.fr': {
        password: 'password123',
        name: 'Jean Dupont',
        isAdmin: false
    },
    'admin@universite.fr': {
        password: 'admin123',
        name: 'Admin User',
        isAdmin: true
    }
};

// ============ DOM ELEMENTS ============
const loginPage = document.getElementById('loginPage');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const signupBtn = document.getElementById('signupBtn');
const signupModal = document.getElementById('signupModal');
const signupForm = document.getElementById('signupForm');
const modalClose = document.querySelector('.modal-close');
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const userGreeting = document.getElementById('userGreeting');
const adminLink = document.getElementById('adminLink');

// ============ INITIALIZATION ============
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
});

function initializeEventListeners() {
    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Signup
    signupBtn.addEventListener('click', () => {
        signupModal.classList.add('active');
    });
    
    modalClose.addEventListener('click', () => {
        signupModal.classList.remove('active');
    });
    
    signupForm.addEventListener('submit', handleSignup);
    
    // Mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            signupModal.classList.remove('active');
        }
    });
}

// ============ AUTHENTICATION ============
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validate credentials (simple validation for demo)
    const user = users[email];
    
    if (user && user.password === password) {
        currentUser = {
            email: email,
            name: user.name,
            isAdmin: user.isAdmin
        };
        
        isAdmin = user.isAdmin;
        loginPage.classList.remove('active');
        appContainer.classList.remove('hidden');
        
        // Update UI
        userGreeting.textContent = `Bienvenue, ${user.name}! `;
        
        if (isAdmin) {
            adminLink.style.display = 'block';
        }
        
        showPage('home');
        resetLoginForm();
    } else {
        alert('Email ou mot de passe incorrect!');
    }
}

function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    // Validation
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères!');
        return;
    }
    
    // Add user (in real app, this would be sent to server)
    users[email] = {
        password: password,
        name: name,
        isAdmin: false
    };
    
    alert('Compte créé avec succès! Veuillez vérifier votre email pour confirmation.');
    signupModal.classList.remove('active');
    resetSignupForm();
}

function logout() {
    currentUser = null;
    isAdmin = false;
    loginPage.classList.add('active');
    appContainer.classList.add('hidden');
    adminLink.style.display = 'none';
    resetLoginForm();
}

function resetLoginForm() {
    loginForm.reset();
}

function resetSignupForm() {
    signupForm.reset();
}

// ============ PAGE NAVIGATION ============
function showPage(pageName) {
    // Hide all pages
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.remove('active'));
    
    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
        page.classList.add('active');
    }
    
    // Update active nav link
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageName) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu
    const navLinksMenu = document.querySelector('.nav-links');
    if (navLinksMenu) {
        navLinksMenu.classList.remove('active');
    }
}

// ============ MENU PAGE ============
function filterMenu(category) {
    const items = document.querySelectorAll('.menu-item');
    const buttons = document.querySelectorAll('.category-btn');
    
    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Show/hide items
    items.forEach(item => {
        if (item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// ============ SCHEDULE PAGE ============
function showDay(day) {
    const schedules = document.querySelectorAll('.day-schedule');
    const buttons = document.querySelectorAll('.day-btn');
    
    schedules.forEach(schedule => schedule.style.display = 'none');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(day).style.display = 'block';
    event.target.classList.add('active');
}

// ============ CHAT PAGE ============
function switchChatType(type) {
    const directMessages = document.getElementById('directMessages');
    const groups = document.getElementById('groups');
    const channels = document.getElementById('channels');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    // Hide all chat lists
    directMessages.classList.remove('active');
    groups.classList.remove('active');
    channels.classList.remove('active');
    
    // Remove active from all tabs
    tabBtns.forEach(btn => btn.classList.remove('active'));
    
    // Show selected type and mark tab as active
    if (type === 'direct') {
        directMessages.classList.add('active');
        tabBtns[0].classList.add('active');
    } else if (type === 'groups') {
        groups.classList.add('active');
        tabBtns[1].classList.add('active');
    } else if (type === 'channels') {
        channels.classList.add('active');
        tabBtns[2].classList.add('active');
    }
}

function selectChat(chatId) {
    currentChat = chatId;
    
    const chatItems = document.querySelectorAll('.chat-item');
    chatItems.forEach(item => item.classList.remove('active'));
    
    event.currentTarget.classList.add('active');
    
    // Update chat window
    const chatContent = document.getElementById('chatContent');
    
    let chatTitle = event.currentTarget.querySelector('.chat-info h4').textContent;
    
    chatContent.innerHTML = `
        <div style="padding: 20px;">
            <h3>${chatTitle}</h3>
            <div style="color: #666; font-size: 0.9rem;">
                <p>Conversation démarrée...</p>
            </div>
        </div>
    `;
}

function sendMessage() {
    const input = document.getElementById('messageInput');
    const message = input.value.trim();
    
    if (!message || !currentChat) {
        return;
    }
    
    const chatContent = document.getElementById('chatContent');
    const messageEl = document.createElement('div');
    messageEl.style.cssText = `
        align-self: flex-end;
        background: #ff6b35;
        color: white;
        padding: 10px 15px;
        border-radius: 8px;
        max-width: 70%;
        word-wrap: break-word;
    `;
    messageEl.textContent = message;
    
    chatContent.appendChild(messageEl);
    chatContent.scrollTop = chatContent.scrollHeight;
    
    input.value = '';
}

// ============ ADMIN PAGE ============
function switchAdminTab(tabName) {
    const contents = document.querySelectorAll('.admin-content');
    const tabs = document.querySelectorAll('.admin-tab');
    
    contents.forEach(content => content.classList.remove('active'));
    tabs.forEach(tab => tab.classList.remove('active'));
    
    const content = document.getElementById(tabName);
    if (content) {
        content.classList.add('active');
    }
    
    event.currentTarget.classList.add('active');
}

function approveUser(userId) {
    alert(`Utilisateur ${userId} approuvé avec succès!`);
    event.currentTarget.closest('.pending-card').style.opacity = '0.5';
}

function rejectUser(userId) {
    alert(`Utilisateur ${userId} a été rejeté.`);
    event.currentTarget.closest('.pending-card').remove();
}

function showAddEvent() {
    const form = document.getElementById('addEventForm');
    form.style.display = form.style.display === 'none' ? 'flex' : 'none';
}

function saveEvent() {
    const title = document.getElementById('eventTitle').value;
    const date = document.getElementById('eventDate').value;
    const time = document.getElementById('eventTime').value;
    const description = document.getElementById('eventDescription').value;
    
    if (!title || !date || !time) {
        alert('Veuillez remplir tous les champs!');
        return;
    }
    
    alert('Événement créé avec succès!');
    document.getElementById('addEventForm').style.display = 'none';
    
    // Reset form
    document.getElementById('eventTitle').value = '';
    document.getElementById('eventDate').value = '';
    document.getElementById('eventTime').value = '';
    document.getElementById('eventDescription').value = '';
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && currentChat && document.getElementById('messageInput') === document.activeElement) {
        sendMessage();
    }
});

// ============ UTILITY FUNCTIONS ============
function formatDate(date) {
    return new Date(date).toLocaleDateString('fr-FR');
}

function formatTime(time) {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

// Prevent form submission on Enter in other fields
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT' && !currentChat) {
        e.preventDefault();
    }
});

