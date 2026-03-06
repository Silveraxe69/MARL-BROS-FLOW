import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Admin API
export const adminAPI = {
  // Fleet Management
  getAllBuses: () => api.get('/admin/buses'),
  
  // Routes Management
  getAllRoutes: () => api.get('/admin/routes'),
  
  // Analytics
  getAnalytics: () => api.get('/admin/analytics'),
};

export default api;
