// ============================================
// CAMPUS BAR - ADMIN PAGE JS
// ============================================

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

// Check if user is admin
document.addEventListener('DOMContentLoaded', () => {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        window.location.href = './login.html';
        return;
    }
    
    const user = JSON.parse(userStr);
    if (!user.isAdmin) {
        alert('Accès refusé! Vous devez être administrateur.');
        window.location.href = './home.html';
    }
});

