import { create } from 'zustand';
import api from '../utils/api';

const useSettingsStore = create((set, get) => ({
      apiKey: '',
      apiBaseUrl: 'https://prod.your-api-server.com',
      isConfigured: false,
      
      setApiKey: (key) => set({ apiKey: key, isConfigured: !!key }),
      setApiBaseUrl: (url) => set({ apiBaseUrl: url }),
      
      loadSettings: async () => {
        try {
          const response = await api.get('/settings');
          if (response.success && response.data) {
            set({
              apiKey: response.data.api_key || '',
              apiBaseUrl: response.data.api_base_url || 'https://prod.your-api-server.com',
              isConfigured: !!response.data.api_key
            });
          }
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      },
      
      saveSettings: async (apiKey, apiBaseUrl) => {
        try {
          const response = await api.post('/settings', {
            api_key: apiKey,
            api_base_url: apiBaseUrl
          });
          
          if (response.success) {
            set({
              apiKey,
              apiBaseUrl,
              isConfigured: true
            });
            return { success: true };
          }
        } catch (error) {
          return { success: false, error: error.message };
        }
      },
      
      testConnection: async (apiKey, apiBaseUrl) => {
        try {
          const response = await api.post('/settings/test', {
            api_key: apiKey,
            api_base_url: apiBaseUrl
          });
          return response;
        } catch (error) {
          throw error;
        }
      },
      
      clearCache: async () => {
        try {
          const response = await api.post('/settings/clear-cache');
          return response;
        } catch (error) {
          throw error;
        }
      }
    }));

export default useSettingsStore;

