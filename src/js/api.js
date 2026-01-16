// API Configuration (dynamique)
// Utilise config.js qui détermine l'URL selon l'environnement
const API_BASE_URL = typeof API_URL !== 'undefined' ? API_URL : 'http://localhost:5000/api';

// API Functions
const API = {
    // Menu endpoints
    getCategories: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            return [];
        }
    },

    getMenuByCategory: async (categoryId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/menu/category/${categoryId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching menu:', error);
            return [];
        }
    },

    getAllMenu: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/menu`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching menu:', error);
            return [];
        }
    },

    searchMenu: async (term) => {
        try {
            const response = await fetch(`${API_BASE_URL}/menu/search/${term}`);
            return await response.json();
        } catch (error) {
            console.error('Error searching menu:', error);
            return [];
        }
    },

    // User endpoints
    createUser: async (userData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating user:', error);
            return null;
        }
    },

    getUser: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },

    // Reservation endpoints
    createReservation: async (reservationData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reservationData)
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating reservation:', error);
            return null;
        }
    },

    getReservations: async (userId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/user/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching reservations:', error);
            return [];
        }
    }
};
