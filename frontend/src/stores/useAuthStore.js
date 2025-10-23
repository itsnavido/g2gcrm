import { create } from 'zustand';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  error: null,

  // Check authentication status
  checkAuth: async () => {
    try {
      set({ loading: true, error: null });
      const response = await axios.get(`${API_BASE_URL}/auth/user`, {
        withCredentials: true
      });
      
      if (response.data.success) {
        set({ user: response.data.user, loading: false });
        return response.data.user;
      } else {
        set({ user: null, loading: false });
        return null;
      }
    } catch (error) {
      set({ user: null, loading: false, error: error.message });
      return null;
    }
  },

  // Logout
  logout: async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
        withCredentials: true
      });
      set({ user: null });
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null });
      window.location.href = '/login';
    }
  },

  // Helper methods
  isAuthenticated: () => {
    const { user } = get();
    return user !== null;
  },

  isApproved: () => {
    const { user } = get();
    return user?.status === 'approved';
  },

  isAdmin: () => {
    const { user } = get();
    return user?.role === 'admin' || user?.role === 'owner';
  },

  isOwner: () => {
    const { user } = get();
    return user?.role === 'owner';
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAuthStore;

