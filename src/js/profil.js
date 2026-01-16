// =====================================================
// PROFIL - SYSTÈME DE CRÉDITS & RÉCOMPENSES
// =====================================================

console.log('[profil.js] Script loaded');

let userProfile = {
    name: 'Jean Dupont',
    username: 'jdupont',
    email: 'jean.dupont@horizon-cafe.fr',
    memberSince: '2024-01-15',
    credits: 0,
    totalSpent: 0,
    totalOrders: 0,
    expenseHistory: [],
    claimedRewards: []
};

const rewards = [
    {
        id: 1,
        title: 'Café Gratuit',
        description: 'Gagnez un café de votre choix',
        icon: '☕',
        points: 50,
        type: 'drink',
        event: 'premier-achat'
    },
    {
        id: 2,
        title: 'Quiz Gagnant',
        description: '+10 crédits en répondant juste',
        icon: '🧠',
        points: 10,
        type: 'credits',
        event: 'quiz'
    },
    {
        id: 3,
        title: 'Participation Event',
        description: 'Gagné lors d\'un événement du bar',
        icon: '🎉',
        points: 75,
        type: 'mixed',
        event: 'event'
    },
    {
        id: 4,
        title: 'Référence Ami',
        description: 'Invitez un ami et recevez des crédits',
        icon: '👥',
        points: 25,
        type: 'credits',
        event: 'referral'
    },
    {
        id: 5,
        title: 'Achat 100 crédits',
        description: 'Milestone: +5 crédits bonus',
        icon: '🏆',
        points: 5,
        type: 'credits',
        event: 'milestone'
    },
    {
        id: 6,
        title: 'Anniversaire',
        description: 'Boisson gratuite pour votre anniversaire',
        icon: '🎂',
        points: 60,
        type: 'drink',
        event: 'birthday'
    }
];

// INITIALISATION
document.addEventListener('DOMContentLoaded', () => {
    console.log('[profil.js] DOMContentLoaded fired');
    
    try {
        // Ensure user data is loaded first
        const userStr = localStorage.getItem('user');
        console.log('[profil.js] User data from localStorage:', userStr);
        
        // Even if no user, try to load profile (will use defaults)
        console.log('[profil.js] Loading profile...');
        loadUserProfile();
        console.log('[profil.js] userProfile after load:', userProfile);
        
        updateProfileDisplay();
        console.log('[profil.js] Profile display updated');
        
        try {
            initializeCharts();
            console.log('[profil.js] Charts initialized');
        } catch (chartError) {
            console.error('[profil.js] Error initializing charts:', chartError);
        }
        
        // Only render rewards if the rewards grid exists
        if (document.getElementById('rewardsGrid')) {
            renderRewards();
            console.log('[profil.js] Rewards rendered');
        }
        
        setupEventListeners();
        console.log('[profil.js] Event listeners set up');
        
        loadTheme();
        console.log('[profil.js] Theme loaded');
        
        console.log('[profil.js] Initialization complete');
    } catch (error) {
        console.error('[profil.js] Error during initialization:', error);
    }
});

// Charger le profil utilisateur
function loadUserProfile() {
    console.log('[loadUserProfile] Starting...');
    
    // Charger les données réelles de l'utilisateur connecté
    let userStr = localStorage.getItem('user');
    console.log('[loadUserProfile] Raw user string:', userStr);
    
    // TEST: If no user, create a dummy one for testing
    if (!userStr) {
        console.warn('[loadUserProfile] No user found, creating test user');
        userStr = JSON.stringify({
            id: 'test-123',
            username: 'testuser',
            email: 'test@horizon-cafe.fr',
            firstName: 'Test',
            lastName: 'User',
            credits: 50.75
        });
    }
    
    if (userStr) {
        try {
            const connectedUser = JSON.parse(userStr);
            console.log('[loadUserProfile] Parsed user object:', connectedUser);
            
            // Set username
            userProfile.username = connectedUser.username || 'Utilisateur';
            
            // Set name (try firstName+lastName first, fall back to username)
            if (connectedUser.firstName && connectedUser.lastName) {
                userProfile.name = `${connectedUser.firstName} ${connectedUser.lastName}`;
            } else if (connectedUser.firstName) {
                userProfile.name = connectedUser.firstName;
            } else if (connectedUser.lastName) {
                userProfile.name = connectedUser.lastName;
            } else {
                userProfile.name = connectedUser.username || 'Utilisateur';
            }
            
            // Set email
            userProfile.email = connectedUser.email || '';
            
            // Set credits
            userProfile.credits = parseFloat(connectedUser.credits) || 0;
            
            // Set member since
            userProfile.memberSince = connectedUser.createdAt 
                ? new Date(connectedUser.createdAt).toISOString().split('T')[0]
                : new Date().toISOString().split('T')[0];
            
            console.log('[loadUserProfile] Updated userProfile:', userProfile);
        } catch (error) {
            console.error('[loadUserProfile] Error parsing user:', error);
            // Use defaults on error
        }
    }
    
    // Charger les statistiques sauvegardées
    const saved = localStorage.getItem('userProfile');
    if (saved) {
        try {
            const savedProfile = JSON.parse(saved);
            userProfile.totalSpent = parseFloat(savedProfile.totalSpent) || 0;
            userProfile.totalOrders = parseInt(savedProfile.totalOrders) || 0;
            userProfile.expenseHistory = savedProfile.expenseHistory || [];
            userProfile.claimedRewards = savedProfile.claimedRewards || [];
            console.log('[loadUserProfile] Loaded saved profile stats');
        } catch (error) {
            console.error('[loadUserProfile] Error parsing saved profile:', error);
        }
    } else {
        console.log('[loadUserProfile] No saved profile found, will save new one');
        // Initialize empty arrays if not exist
        userProfile.expenseHistory = userProfile.expenseHistory || [];
        userProfile.claimedRewards = userProfile.claimedRewards || [];
        saveUserProfile();
    }
}

// Sauvegarder le profil
function saveUserProfile() {
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
}

// Mettre à jour l'affichage du profil
function updateProfileDisplay() {
    console.log('[updateProfileDisplay] Called with userProfile:', userProfile);
    
    // Safety check for DOM elements
    const profilNameEl = document.getElementById('profilName');
    const userGreetingEl = document.getElementById('userGreeting');
    const profilEmailEl = document.getElementById('profilEmail');
    const profilUsernameEl = document.getElementById('profilUsername');
    const creditBalanceEl = document.getElementById('creditBalance');
    const totalSpentEl = document.getElementById('totalSpent');
    const totalOrdersEl = document.getElementById('totalOrders');
    
    console.log('[updateProfileDisplay] Found elements:', {
        profilName: !!profilNameEl,
        userGreeting: !!userGreetingEl,
        profilEmail: !!profilEmailEl,
        profilUsername: !!profilUsernameEl,
        creditBalance: !!creditBalanceEl,
        totalSpent: !!totalSpentEl,
        totalOrders: !!totalOrdersEl
    });
    
    try {
        if (profilNameEl) {
            profilNameEl.textContent = userProfile.name || 'Utilisateur';
            console.log('[updateProfileDisplay] Set profilName to:', userProfile.name);
        }
        if (userGreetingEl) {
            userGreetingEl.textContent = userProfile.username || 'Utilisateur';
            console.log('[updateProfileDisplay] Set userGreeting to:', userProfile.username);
        }
        if (profilEmailEl) {
            profilEmailEl.textContent = userProfile.email || '-';
            console.log('[updateProfileDisplay] Set profilEmail to:', userProfile.email);
        }
        if (profilUsernameEl) {
            profilUsernameEl.textContent = userProfile.username || 'Utilisateur';
            console.log('[updateProfileDisplay] Set profilUsername to:', userProfile.username);
        }
        if (creditBalanceEl) {
            creditBalanceEl.textContent = (userProfile.credits || 0).toFixed(2);
            console.log('[updateProfileDisplay] Set creditBalance to:', userProfile.credits);
        }
        if (totalSpentEl) {
            totalSpentEl.textContent = (userProfile.totalSpent || 0).toFixed(2) + '€';
            console.log('[updateProfileDisplay] Set totalSpent to:', userProfile.totalSpent);
        }
        if (totalOrdersEl) {
            totalOrdersEl.textContent = userProfile.totalOrders || 0;
            console.log('[updateProfileDisplay] Set totalOrders to:', userProfile.totalOrders);
        }
        
        console.log('[updateProfileDisplay] Display updated successfully');
        
        // Update charts if the function exists
        if (typeof updateCharts === 'function') {
            updateCharts();
        }
    } catch (error) {
        console.error('[updateProfileDisplay] Error updating display:', error);
    }
}

// Calculer le niveau de membre basé sur les dépenses
function calculateMemberLevel() {
    if (userProfile.totalSpent >= 500) return 5;
    if (userProfile.totalSpent >= 250) return 4;
    if (userProfile.totalSpent >= 100) return 3;
    if (userProfile.totalSpent >= 50) return 2;
    return 1;
}

// Recharger des crédits (montant personnalisé)
// Recharger des crédits (redirection vers paiement bancaire)
function rechargeCredits() {
    const amountEuro = parseFloat(document.getElementById('rechargeAmount').value);
    
    if (!amountEuro || amountEuro <= 0) {
        alert('Veuillez entrer un montant valide (en €)');
        return;
    }
    
    // Ratio: 1€ = 10 crédits
    const credits = amountEuro * 10;
    const amountCents = Math.round(amountEuro * 100); // Stripe utilise les centimes
    
    console.log(`[rechargeCredits] Redirection vers paiement: ${amountEuro}€ = ${credits} crédits`);
    
    // Rediriger vers la page de paiement avec les paramètres
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || 'unknown';
    
    window.location.href = `./payment.html?amount=${amountCents}&credits=${Math.floor(credits)}&userId=${userId}`;
}

// Recharge rapide (presets ou montant)
function quickRecharge(amount) {
    userProfile.credits += amount;
    
    // Ajouter à l'historique
    userProfile.expenseHistory.unshift({
        item: `Recharge de crédits`,
        price: amount,
        date: new Date().toISOString(),
        mode: 'Recharge',
        type: 'recharge'
    });
    
    // Limiter à 100 entrées
    if (userProfile.expenseHistory.length > 100) {
        userProfile.expenseHistory.pop();
    }
    
    saveUserProfile();
    updateProfileDisplay();
    
    // Animation
    showRechargeNotif(amount);
}

// Afficher notification de recharge
function showRechargeNotif(amount) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #00d2ff, #00ff88);
        color: #000;
        padding: 1.5rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 0 30px rgba(0,210,255,0.5);
        z-index: 2000;
        animation: slideInRight 0.5s ease;
    `;
    notif.innerHTML = `<i class="fas fa-check-circle"></i> +${amount.toFixed(2)} crédits`;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// Afficher les récompenses
function renderRewards() {
    const grid = document.getElementById('rewardsGrid');
    if (!grid) return; // Safety check for missing element
    grid.innerHTML = '';
    
    rewards.forEach(reward => {
        const isClaimed = userProfile.claimedRewards.includes(reward.id);
        const card = document.createElement('div');
        card.className = 'reward-card';
        card.innerHTML = `
            <div class="reward-icon">${reward.icon}</div>
            <h3>${reward.title}</h3>
            <p>${reward.description}</p>
            <div class="reward-points">+${reward.points}${reward.type === 'credits' ? ' crédits' : ' pts'}</div>
            <button class="btn-claim ${isClaimed ? 'claimed' : ''}" 
                onclick="claimReward(${reward.id})" 
                ${isClaimed ? 'disabled' : ''}>
                ${isClaimed ? 'Récompense Obtenue ✓' : 'Réclamer'}
            </button>
        `;
        grid.appendChild(card);
    });
}

// Réclamer une récompense
function claimReward(rewardId) {
    if (userProfile.claimedRewards.includes(rewardId)) {
        alert('Vous avez déjà réclaimé cette récompense');
        return;
    }
    
    const reward = rewards.find(r => r.id === rewardId);
    
    if (reward.type === 'credits' || reward.type === 'mixed') {
        userProfile.credits += reward.points;
    }
    
    userProfile.claimedRewards.push(rewardId);
    
    // Ajouter à l'historique
    userProfile.expenseHistory.unshift({
        item: `Récompense: ${reward.title}`,
        price: reward.type === 'credits' ? -reward.points : 0,
        date: new Date().toISOString(),
        mode: 'Récompense',
        type: 'reward'
    });
    
    saveUserProfile();
    updateProfileDisplay();
    renderRewards();
    
    showRewardNotif(reward);
}

// Notification de récompense
function showRewardNotif(reward) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #00ff88, #00d2ff);
        color: #000;
        padding: 1.5rem;
        border-radius: 10px;
        font-weight: 700;
        font-size: 1.1rem;
        box-shadow: 0 0 30px rgba(0,255,136,0.5);
        z-index: 2000;
        animation: slideInRight 0.5s ease;
    `;
    notif.innerHTML = `<i class="fas fa-gift"></i> ${reward.title} réclaimée!`;
    document.body.appendChild(notif);
    
    setTimeout(() => notif.remove(), 3000);
}

// GRAPHIQUES & STATISTIQUES

let spendingChart, categoryChart;

function initializeCharts() {
    try {
        const spendingChartEl = document.getElementById('spendingChart');
        if (!spendingChartEl) {
            console.warn('[initializeCharts] spendingChart element not found');
            return;
        }
        
        const ctxSpending = spendingChartEl.getContext('2d');
        spendingChart = new Chart(ctxSpending, {
        type: 'line',
        data: {
            labels: ['Semaine 1', 'Semaine 2', 'Semaine 3', 'Semaine 4', 'Semaine 5'],
            datasets: [{
                label: 'Dépenses Hebdomadaires (€)',
                data: [0, 0, 0, 0, 0],
                borderColor: '#ff6b4a',
                backgroundColor: 'rgba(255,107,74,0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff6b4a',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {weight: '600', size: 12}
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {color: '#b0b0b0'},
                    grid: {color: '#2a2a2a'},
                    title: {display: true, text: 'Montant (€)'}
                },
                x: {
                    ticks: {color: '#b0b0b0'},
                    grid: {color: '#2a2a2a'}
                }
            }
        }
    });
    
    const ctxCategory = document.getElementById('categoryChart').getContext('2d');
    categoryChart = new Chart(ctxCategory, {
        type: 'doughnut',
        data: {
            labels: ['Boissons', 'Snacks', 'Desserts', 'Recharges'],
            datasets: [{
                data: [0, 0, 0, 0],
                backgroundColor: ['#00d2ff', '#00ff88', '#ff6b4a', '#ffd4a0'],
                borderColor: '#1a1a1a',
                borderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#e0e0e0',
                        font: {weight: '600', size: 12}
                    },
                    position: 'right'
                }
            }
        }
    });
    } catch (error) {
        console.error('[initializeCharts] Error initializing charts:', error);
    }
}

function updateCharts() {
    // Calculer les dépenses par semaine
    const weeks = [0, 0, 0, 0, 0];
    const categories = {boissons: 0, snacks: 0, desserts: 0, recharges: 0};
    
    userProfile.expenseHistory.forEach(item => {
        if (item.type !== 'reward') {
            const date = new Date(item.date);
            const weekAgo = Math.floor((Date.now() - date) / (7 * 24 * 60 * 60 * 1000));
            if (weekAgo < 5) weeks[4 - weekAgo] += item.price;
        }
    });
    
    spendingChart.data.datasets[0].data = weeks;
    spendingChart.update();
    
    categoryChart.data.datasets[0].data = [
        categories.boissons || 1,
        categories.snacks || 1,
        categories.desserts || 1,
        categories.recharges || 1
    ];
    categoryChart.update();
    
    updateExpenseTable();
}

function updateExpenseTable() {
    const tbody = document.getElementById('expenseHistory');
    
    if (userProfile.expenseHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#666;">Aucun historique</td></tr>';
        return;
    }
    
    tbody.innerHTML = userProfile.expenseHistory.slice(0, 10).map(item => `
        <tr>
            <td><span class="expense-item">${item.item}</span></td>
            <td><span class="expense-price">${item.type === 'recharge' || item.type === 'reward' ? '+' : '-'}${Math.abs(item.price).toFixed(2)}€</span></td>
            <td><span class="expense-date">${new Date(item.date).toLocaleDateString('fr-FR')}</span></td>
            <td>${item.mode}</td>
        </tr>
    `).join('');
}

// Event Listeners
function setupEventListeners() {
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
}

function loadTheme() {
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-mode');
    }
}

// Animation keyframes
const style = document.createElement('style');
style.innerHTML = `
@keyframes slideInRight {
    from {
        transform: translateX(400px);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;
document.head.appendChild(style);

// Synchroniser avec le menu (si on vient du menu)
function syncWithMenu() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
        const cart = JSON.parse(cartData);
        // Le menu va synchroniser les données quand on commande
    }
}

syncWithMenu();
