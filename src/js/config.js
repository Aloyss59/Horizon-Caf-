/**
 * Configuration d'API dynamique
 * Utilise l'URL correcte selon l'environnement (local ou production)
 */

// Déterminer l'URL de base
const getApiUrl = () => {
    // En production sur Render (nouveau domaine)
    if (window.location.hostname === 'horizon-cafe.onrender.com') {
        return 'https://horizon-cafe.onrender.com/api';
    }
    // En production sur Render (ancien domaine - redirige)
    if (window.location.hostname === 'horizon-cafe-api.onrender.com') {
        window.location.href = 'https://horizon-cafe.onrender.com' + window.location.pathname + window.location.search;
        return 'https://horizon-cafe.onrender.com/api';
    }
    // En développement local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000/api';
    }
    // Fallback: utiliser le protocole et domaine actuels
    return `${window.location.protocol}//${window.location.host}/api`;
};

const getSocketUrl = () => {
    // En production sur Render (nouveau domaine)
    if (window.location.hostname === 'horizon-cafe.onrender.com') {
        return 'https://horizon-cafe.onrender.com';
    }
    // En production sur Render (ancien domaine - redirige)
    if (window.location.hostname === 'horizon-cafe-api.onrender.com') {
        window.location.href = 'https://horizon-cafe.onrender.com' + window.location.pathname + window.location.search;
        return 'https://horizon-cafe.onrender.com';
    }
    // En développement local
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    // Fallback: utiliser le protocole et domaine actuels
    return `${window.location.protocol}//${window.location.host}`;
};

// Créer la variable globale API_URL
const API_URL = getApiUrl();
const SOCKET_URL = getSocketUrl();

// Afficher en console (optionnel, pour debug)
console.log(`[Config] API_URL: ${API_URL}`);
console.log(`[Config] SOCKET_URL: ${SOCKET_URL}`);
console.log(`[Config] Environment: ${window.location.hostname}`);
console.log(`[Config] SOCKET_URL: ${SOCKET_URL}`);
console.log(`[Config] Environment: ${window.location.hostname}`);
