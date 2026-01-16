/**
 * Authentication Guard - Protège les pages et redirige si pas authentifié
 * À charger dans toutes les pages protégées
 */

class AuthGuard {
  constructor(options = {}) {
    this.redirectUrl = options.redirectUrl || 'login.html';
    this.checkInterval = options.checkInterval || 5000; // Vérifier toutes les 5s
    this.init();
  }

  // Initialiser la protection
  init() {
    // Vérifier immédiatement
    this.checkAuth();
    
    // Vérifier périodiquement pour les tokens expirés
    setInterval(() => this.checkAuth(), this.checkInterval);
  }

  // Vérifier l'authentification
  async checkAuth() {
    const token = this.getToken();

    if (!token) {
      this.redirect();
      return false;
    }

    // Valider le token avec le serveur
    const isValid = await this.validateToken(token);
    
    if (!isValid) {
      this.clearToken();
      this.redirect();
      return false;
    }

    return true;
  }

  // Récupérer le token du localStorage
  getToken() {
    try {
      const authData = localStorage.getItem('authData');
      if (!authData) return null;
      
      const parsed = JSON.parse(authData);
      return parsed.token || null;
    } catch (error) {
      console.error('Erreur lecture token:', error);
      return null;
    }
  }

  // Valider le token avec le serveur
  async validateToken(token) {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Erreur validation token:', error);
      return false;
    }
  }

  // Effacer le token
  clearToken() {
    localStorage.removeItem('authData');
    localStorage.removeItem('user');
  }

  // Rediriger vers la page de login
  redirect() {
    // Sauvegarder l'URL actuelle pour redirection après login
    const currentPath = window.location.pathname.split('/').pop();
    localStorage.setItem('redirectAfterLogin', currentPath);
    
    // Rediriger
    window.location.href = this.redirectUrl;
  }

  // Obtenir les infos de l'utilisateur actuellement authentifié
  static getCurrentUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData) return null;
      return JSON.parse(userData);
    } catch (error) {
      console.error('Erreur lecture user:', error);
      return null;
    }
  }

  // Définir l'utilisateur après login
  static setCurrentUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  // Définir le token après login
  static setToken(token) {
    localStorage.setItem('authData', JSON.stringify({ token }));
  }

  // Se déconnecter
  static logout() {
    localStorage.removeItem('authData');
    localStorage.removeItem('user');
    localStorage.removeItem('redirectAfterLogin');
    window.location.href = '/';
  }
}

// Initialiser automatiquement si pas de configuration spéciale
if (!window.skipAutoAuthGuard) {
  const authGuard = new AuthGuard();
}
