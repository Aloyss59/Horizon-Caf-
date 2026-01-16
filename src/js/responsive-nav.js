/**
 * Responsive Navigation Handler
 * Manages mobile hamburger menu toggle
 */

document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger menu button if it doesn't exist
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    // Check if menu button already exists
    let menuBtn = document.querySelector('.btn-menu-toggle');
    if (!menuBtn) {
        menuBtn = document.createElement('button');
        menuBtn.className = 'btn-menu-toggle';
        menuBtn.innerHTML = '<span></span><span></span><span></span>';
        navbar.appendChild(menuBtn);
    }
    
    const navLinks = document.querySelector('.navbar .nav-links');
    
    // Toggle menu on button click
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        menuBtn.classList.toggle('active');
        
        if (navLinks) {
            navLinks.classList.toggle('show');
        }
    });
    
    // Close menu when clicking on a link
    const links = document.querySelectorAll('.navbar .nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            menuBtn.classList.remove('active');
            if (navLinks) {
                navLinks.classList.remove('show');
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!navbar.contains(e.target)) {
            menuBtn.classList.remove('active');
            if (navLinks) {
                navLinks.classList.remove('show');
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        // Reset menu state on resize if going back to desktop
        if (window.innerWidth > 768) {
            menuBtn.classList.remove('active');
            if (navLinks) {
                navLinks.classList.remove('show');
                navLinks.style.display = 'flex';
            }
        }
    });
});
