// API Configuration for Kempery Frontend
// This file contains the backend API endpoint configuration

const API_BASE_URL = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || 'http://localhost:5000';

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const API_ENDPOINTS = {
  // Auth (adaptado para backend CRM)
  login: `${API_BASE_URL}/api/usuarios/login`,
  logout: `${API_BASE_URL}/api/usuarios/logout`,
  
  // Clients
  clients: `${API_BASE_URL}/api/clients`,
  client: (id) => `${API_BASE_URL}/api/clients/${id}`,
  
  // Payments
  payments: `${API_BASE_URL}/api/payments`,
  payment: (id) => `${API_BASE_URL}/api/payments/${id}`,
  addPayment: `${API_BASE_URL}/api/payments`,
  
  // Payment Agreements
  paymentAgreements: `${API_BASE_URL}/api/payment-agreements`,
  
  // Reports
  dashboard: `${API_BASE_URL}/api/reports/dashboard`,
  
  // Health
  health: `${API_BASE_URL}/api/health`,
};

// Fetch wrapper with error handling
export const fetchAPI = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...API_CONFIG,
      ...options,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

export default API_CONFIG;
