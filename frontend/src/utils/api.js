import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include cookies for session management
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Not authenticated - redirect to login
      window.location.href = '/login';
    } else if (error.response?.status === 403) {
      // Authenticated but not authorized (pending approval or banned)
      const message = error.response.data.error;
      if (message.includes('pending approval')) {
        window.location.href = '/access-denied';
      }
    }
    
    return Promise.reject(new Error(errorMessage));
  }
);

export default api;

