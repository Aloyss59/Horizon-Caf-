// ============================================
// CAMPUS BAR - AUTHENTICATION JS
// ============================================

const users = {
    'user@universite.fr': {
        password: 'password123',
        name: 'Jean Dupont',
        isAdmin: false
    },

};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupBtn = document.getElementById('signupBtn');
    const signupModal = document.getElementById('signupModal');
    const signupForm = document.getElementById('signupForm');
    const modalClose = document.querySelector('.modal-close');

    loginForm.addEventListener('submit', handleLogin);
    signupBtn.addEventListener('click', () => signupModal.classList.add('active'));
    modalClose.addEventListener('click', () => signupModal.classList.remove('active'));
    signupForm.addEventListener('submit', handleSignup);

    window.addEventListener('click', (e) => {
        if (e.target === signupModal) {
            signupModal.classList.remove('active');
        }
    });
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const user = users[email];
    
    if (user && user.password === password) {
        localStorage.setItem('currentUser', JSON.stringify({
            email: email,
            name: user.name,
            isAdmin: user.isAdmin
        }));
        
        window.location.href = './home.html';
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
    
    if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas!');
        return;
    }
    
    if (password.length < 6) {
        alert('Le mot de passe doit contenir au moins 6 caractères!');
        return;
    }
    
    users[email] = {
        password: password,
        name: name,
        isAdmin: false
    };
    
    alert('Compte créé avec succès! Veuillez vérifier votre email pour confirmation.');
    document.getElementById('signupModal').classList.remove('active');
    document.getElementById('signupForm').reset();
}

