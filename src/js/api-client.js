// Configuration API (dynamique)
// Utilise config.js qui détermine l'URL selon l'environnement
// const API_URL = 'http://localhost:5000/api'; // Voir config.js pour l'URL dynamique
const TOKEN_KEY = 'authToken';
const USER_KEY = 'currentUser';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem(TOKEN_KEY);
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem(TOKEN_KEY, token);
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    };
  }

  async request(endpoint, method = 'GET', body = null) {
    const options = {
      method,
      headers: this.getHeaders()
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, options);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erreur API');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // AUTH
  async register(email, username, password, firstName, lastName) {
    const data = await this.request('/auth/register', 'POST', {
      email,
      username,
      password,
      firstName,
      lastName
    });
    this.setToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', 'POST', { email, password });
    this.setToken(data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(data.user));
    return data;
  }

  async getCurrentUser() {
    return await this.request('/auth/me', 'GET');
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token = null;
  }

  // MENU
  async getMenuItems() {
    return await this.request('/menu', 'GET');
  }

  async getMenuByCategory(category) {
    return await this.request(`/menu/category/${category}`, 'GET');
  }

  async getMenuItem(id) {
    return await this.request(`/menu/${id}`, 'GET');
  }

  // ORDERS
  async createOrder(order) {
    return await this.request('/orders', 'POST', order);
  }

  async getUserOrders() {
    return await this.request('/orders/user/history', 'GET');
  }

  async getOrder(id) {
    return await this.request(`/orders/${id}`, 'GET');
  }

  // MESSAGES
  async sendMessage(recipientId, content, messageType = 'direct') {
    return await this.request('/messages', 'POST', {
      recipientId,
      content,
      messageType
    });
  }

  async getConversation(recipientId) {
    return await this.request(`/messages/user/${recipientId}`, 'GET');
  }

  async getInbox() {
    return await this.request('/messages/inbox', 'GET');
  }
}

const api = new ApiClient();
