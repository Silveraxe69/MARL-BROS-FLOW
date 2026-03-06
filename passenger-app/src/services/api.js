import axios from 'axios';

// API Base URL - can be configured for different environments
export const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API endpoints
export const authAPI = {
  login: async (phone, name) => {
    try {
      const response = await apiClient.post('/auth/login', { phone, name });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },
};

export const busAPI = {
  getAllBuses: async () => {
    try {
      const response = await apiClient.get('/buses');
      return response.data;
    } catch (error) {
      console.error('Get buses error:', error);
      throw error;
    }
  },
  
  getBusById: async (busId) => {
    try {
      const response = await apiClient.get(`/buses/${busId}`);
      return response.data;
    } catch (error) {
      console.error('Get bus by ID error:', error);
      throw error;
    }
  },
  
  getLiveBusLocations: async () => {
    try {
      const response = await apiClient.get('/buses/live-locations');
      return response.data;
    } catch (error) {
      console.error('Get live bus locations error:', error);
      throw error;
    }
  },
};

export const stopAPI = {
  getAllStops: async () => {
    try {
      const response = await apiClient.get('/stops');
      return response.data;
    } catch (error) {
      console.error('Get stops error:', error);
      throw error;
    }
  },
  
  getStopById: async (stopId) => {
    try {
      const response = await apiClient.get(`/stops/${stopId}`);
      return response.data;
    } catch (error) {
      console.error('Get stop by ID error:', error);
      throw error;
    }
  },
  
  getNextBuses: async (stopId) => {
    try {
      const response = await apiClient.get(`/stops/${stopId}/next-buses`);
      return response.data;
    } catch (error) {
      console.error('Get next buses error:', error);
      throw error;
    }
  },
};

export const routeAPI = {
  getAllRoutes: async () => {
    try {
      const response = await apiClient.get('/routes');
      return response.data;
    } catch (error) {
      console.error('Get routes error:', error);
      throw error;
    }
  },
};

export const crowdAPI = {
  getCrowdStatus: async () => {
    try {
      const response = await apiClient.get('/crowd/status');
      return response.data;
    } catch (error) {
      console.error('Get crowd status error:', error);
      throw error;
    }
  },
};

// Local data loaders for CSV files in public/data (fallback)
export const loadLocalCSV = async (filename) => {
  try {
    const response = await fetch(`/data/${filename}`);
    const text = await response.text();
    return parseCSV(text);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
};

// Simple CSV parser
const parseCSV = (text) => {
  const lines = text.trim().split('\n');
  if (lines.length === 0) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = values[index];
    });
    data.push(obj);
  }
  
  return data;
};

export default apiClient;
